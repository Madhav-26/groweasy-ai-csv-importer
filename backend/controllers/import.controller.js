const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const aiService = require("../services/ai.service");

exports.processImport = async (req, res) => {
  const { rawData, fileName } = req.body;

  try {
    let finalLeads = [];
    let skippedCount = 0;

    // BATCHING: Gemini can handle larger batches (e.g., 20 rows) efficiently
    for (let i = 0; i < rawData.length; i += 20) {
      const batch = rawData.slice(i, i + 20);
      const mappedLeads = await aiService.mapRowsWithGemini(batch);

      for (const lead of mappedLeads) {
        // RULE 7: Skip invalid records (neither email nor phone)
        if (!lead.email && !lead.mobile_without_country_code) {
          skippedCount++;
          continue;
        }

        // DUPLICATE DETECTION: Check DB for existing email or phone
        const duplicate = await prisma.lead.findFirst({
          where: {
            OR: [
              { email: lead.email || undefined },
              { phone: lead.mobile_without_country_code || undefined },
            ],
          },
        });

        if (duplicate) {
          skippedCount++;
          continue;
        }

        finalLeads.push(lead);
      }
    }

    // DATABASE TRANSACTION: Save Import History and Leads
    const result = await prisma.importRecord.create({
      data: {
        fileName,
        totalRows: rawData.length,
        imported: finalLeads.length,
        skipped: skippedCount,
        leads: {
          create: finalLeads.map((l) => ({
            name: l.name,
            email: l.email,
            phone: l.mobile_without_country_code,
            company: l.company,
            city: l.city,
            state: l.state,
            country: l.country,
            crmStatus: l.crm_status,
            crmNote: l.crm_note,
            dataSource: l.data_source,
            description: l.description,
          })),
        },
      },
      include: { leads: true },
    });

    res.json({ success: true, stats: result, data: finalLeads });
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ error: "High-level server error during import" });
  }
};

exports.getDashboardStats = async (req, res) => {
  const leads = await prisma.lead.findMany();
  // Real dynamic analytics generation
  const stats = {
    totalLeads: leads.length,
    statusDistribution: await prisma.lead.groupBy({
      by: ["crmStatus"],
      _count: true,
    }),
    sourceDistribution: await prisma.lead.groupBy({
      by: ["dataSource"],
      _count: true,
    }),
  };
  res.json(stats);
};
