require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins in development
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/members", async (req, res) => {
  console.log("📥 Received request for /api/members");

  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;
    const token = process.env.AIRTABLE_ACCESS_TOKEN;

    console.log("Config check:", {
      hasBaseId: !!baseId,
      hasTableName: !!tableName,
      hasToken: !!token,
    });

    if (!baseId || !tableName || !token) {
      console.error("❌ Missing environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    console.log(`🔄 Fetching from Airtable: ${baseId}/${tableName}`);

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`📡 Airtable response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Airtable error:", errorText);
      throw new Error(`Failed to fetch from Airtable: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.records?.length || 0} members`);
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching members:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch team members", details: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/members`);
});
