const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are a CRM Data Architect. Map messy CSV JSON to this GrowEasy CRM schema:
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
    "lead_owner": "Owner Name",
    "crm_status": "Must be: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, or SALE_DONE",
    "crm_note": "Secondary contact info & remarks",
    "data_source": "Must be: leads_on_demand, meridian_tower, eden_park, varah_swamy, or sarjapur_plots",
    "possession_time": "Time string",
    "description": "Notes"
  }]
}

STRICT RULES:
1. SKIP records ONLY if BOTH email and mobile are missing.
2. MULTIPLE CONTACTS: First email goes to 'email', first phone goes to 'mobile_without_country_code'. ALL OTHERS must be appended to 'crm_note'.
3. STATUS/SOURCE: Use ONLY the allowed values provided above.
4. Return valid JSON only.
`;

exports.mapRowsWithAI = async (batch) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Map these records: ${JSON.stringify(batch)}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return parsed.leads || [];
  } catch (error) {
    console.error("Groq AI Error:", error.message);
    return [];
  }
};
