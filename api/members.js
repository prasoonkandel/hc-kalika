// Vercel Serverless Function for Airtable API
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;
    const token = process.env.AIRTABLE_ACCESS_TOKEN;

    if (!baseId || !tableName || !token) {
      console.error("Missing environment variables");
      return res.status(500).json({
        error: "Server configuration error",
        message: "Missing Airtable credentials",
      });
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", errorText);
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      error: "Failed to fetch team members",
      message: error.message,
    });
  }
};
