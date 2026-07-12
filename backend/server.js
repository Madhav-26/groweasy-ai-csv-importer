require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const Groq = require("groq-sdk");

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const SYSTEM_PROMPT = `
You are a CRM Data Architect for GrowEasy. Map messy CSV records to this JSON schema:
{
  "leads": [{
    "created_at": "ISO Date string",
    "name": "Full Name",
    "email": "Primary Email",
    "country_code": "e.g. +91",
    "mobile_without_country_code": "Main mobile number",
    "company": "Company Name",
    "city": "City",
    "state": "State",
    "country": "Country",
    "lead_owner": "Lead Owner",
    "crm_status": "Must be: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, or SALE_DONE",
    "crm_note": "COMBINED REMARKS: Extra emails, extra phones, and notes",
    "data_source": "Must be: leads_on_demand, meridian_tower, eden_park, varah_swamy, or sarjapur_plots",
    "possession_time": "Possession timeframe",
    "description": "Additional info"
  }]
}

STRICT RULES:
1. SKIP records ONLY if BOTH 'email' and 'mobile' are missing.
2. MULTIPLE CONTACTS: First email/phone goes to main fields. All others go to 'crm_note'.
3. STATUS/SOURCE: Use ONLY the exact allowed values. Leave blank if unknown.
`;

app.post("/api/import", async (req, res) => {
  const { rawData, fileName } = req.body;
  if (!rawData || !Array.isArray(rawData))
    return res.status(400).json({ error: "Invalid data format" });

  try {
    let allMappedLeads = [];
    let skippedCount = 0;

    const BATCH_SIZE = 25;
    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      const batch = rawData.slice(i, i + BATCH_SIZE);
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Map: ${JSON.stringify(batch)}` },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const mappedBatch =
        JSON.parse(completion.choices[0].message.content).leads || [];

      for (const lead of mappedBatch) {
        if (!lead.email && !lead.mobile_without_country_code) {
          skippedCount++;
          continue;
        }
        allMappedLeads.push(lead);
      }
    }

    const savedRecord = await prisma.importRecord.create({
      data: {
        fileName: fileName || "upload.csv",
        totalRows: rawData.length,
        imported: allMappedLeads.length,
        skipped: skippedCount,
        leads: {
          create: allMappedLeads.map((l) => ({
            createdAt: l.created_at || new Date().toISOString(),
            name: String(l.name || ""),
            email: l.email || null,
            countryCode: String(l.country_code || ""),
            phone: String(l.mobile_without_country_code || ""),
            company: String(l.company || ""),
            city: String(l.city || ""),
            state: String(l.state || ""),
            country: String(l.country || ""),
            leadOwner: String(l.lead_owner || ""),
            crmStatus: l.crm_status || "GOOD_LEAD_FOLLOW_UP",
            dataSource: l.data_source || null,
            crmNote: String(l.crm_note || ""),
            possessionTime: String(l.possession_time || ""),
            description: String(l.description || ""),
          })),
        },
      },
    });

    res
      .status(200)
      .json({ success: true, stats: savedRecord, data: allMappedLeads });
  } catch (err) {
    console.error("AI Mapping Error:", err.message);
    res.status(500).json({ error: "AI Mapping Failed." });
  }
});

app.get("/api/dashboard-stats", async (req, res) => {
  try {
    const [totalLeads, history, goodLeads, sources] = await Promise.all([
      prisma.lead.count(),
      // FIX: Explicitly sort by newest first (descending)
      prisma.importRecord.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.lead.count({ where: { crmStatus: "GOOD_LEAD_FOLLOW_UP" } }),
      prisma.lead.groupBy({ by: ["dataSource"] }),
    ]);

    res.status(200).json({
      totalLeads,
      qualityScore:
        totalLeads > 0 ? ((goodLeads / totalLeads) * 100).toFixed(1) : "0.0",
      uniqueSources: sources.length,
      history,
    });
  } catch (err) {
    console.error("Stats Error:", err.message);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

app.get("/api/leads", async (req, res) => {
  try {
    // FIX: Get ALL leads sorted by newest first
    const leads = await prisma.lead.findMany({
      orderBy: { dbCreatedAt: "desc" },
    });

    const formatted = leads.map((l) => ({
      id: l.id,
      importId: l.importId,
      created_at: l.createdAt,
      name: l.name,
      email: l.email,
      country_code: l.countryCode,
      mobile_without_country_code: l.phone,
      company: l.company,
      city: l.city,
      state: l.state,
      country: l.country,
      lead_owner: l.leadOwner,
      crm_status: l.crmStatus,
      crm_note: l.crmNote,
      data_source: l.dataSource,
      possession_time: l.possessionTime,
      description: l.description,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Leads Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch leads from database" });
  }
});

app.get("/api/export-all", async (req, res) => {
  res.redirect("/api/leads");
});

app.listen(PORT, () => console.log(`🚀 API Backend live on Port ${PORT}`));
