const baseId = window.CONFIG.AIRTABLE_BASE_ID;
const tableName = window.CONFIG.AIRTABLE_TABLE_NAME;
const token = window.CONFIG.AIRTABLE_ACCESS_TOKEN;

const loader = document.getElementById("loader");

fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("records");

    const sortedRecords = data.records.sort((a, b) => {
      let idA = a.fields["Member ID"];
      let idB = b.fields["Member ID"];

      if (Array.isArray(idA)) idA = idA[0];
      if (Array.isArray(idB)) idB = idB[0];
      if (typeof idA === "object") idA = JSON.stringify(idA);
      if (typeof idB === "object") idB = JSON.stringify(idB);

      idA = idA || "";
      idB = idB || "";

      // Extract numbers from IDs like "HCB01", "HCB02"
      const numA = parseInt(idA.toString().replace(/[^\d]/g, "")) || 0;
      const numB = parseInt(idB.toString().replace(/[^\d]/g, "")) || 0;

      return numA - numB;
    });

    sortedRecords.forEach((record) => {
      let id = record.fields["Member ID"];

      // Handle if it's an array or object
      if (Array.isArray(id)) id = id[0];
      if (typeof id === "object" && id !== null) {
        // Try common object properties
        id = id.text || id.name || id.value || id.id || JSON.stringify(id);
      }
      id = id || "N/A";

      const name = record.fields["Full Name"];
      const photo = record.fields["Profile Photo"]?.[0]?.url;
      const card = document.createElement("div");
      const role = record.fields["Role"] || "Member";
      card.className = "card";
      card.innerHTML = `
        <img src="${photo}" alt="${name}" />
        <h3>${name}</h3>
    
        <p>${role}</p>
      `;
      container.appendChild(card);
    });

    // Hide loading screen after content is loaded
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    }, 500);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
    // Hide loader even on error
    loader.style.display = "none";
  });
