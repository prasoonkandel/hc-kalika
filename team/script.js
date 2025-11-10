const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api/members"
    : "/api/members";

const loader = document.getElementById("loader");

console.log("Fetching from:", API_URL);
console.log("Current hostname:", window.location.hostname);

fetch(API_URL)
  .then((res) => {
    console.log("Response status:", res.status);
    if (!res.ok) {
      throw new Error(`Failed to fetch team members: ${res.status} ${res.statusText}`);
    }
    return res.json();
  })
  .then((data) => {
    const container = document.getElementById("records");

    // Check if data is empty
    if (!data.records || data.records.length === 0) {
      loader.style.display = "none";
      container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-users-slash"></i>
          <h3>No Team Members Found</h3>
          <p>There are currently no team members to display.</p>
        </div>
      `;
      return;
    }

    // Sort records by Member ID (numeric sort, removing "HCB" prefix)
    const sortedRecords = data.records.sort((a, b) => {
      let idA = a.fields["Member ID"];
      let idB = b.fields["Member ID"];

      // Handle if it's an array or object
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
    console.error("Error details:", error.message);

    // Hide loader
    loader.style.display = "none";

    // Show error screen
    const errorScreen = document.getElementById("error-screen");
    const container = document.getElementById("records");

    if (errorScreen) {
      // Update error screen with more details
      const errorDetails = errorScreen.querySelector('.error-content p');
      if (errorDetails) {
        errorDetails.innerHTML = `
          We couldn't load the team members. Error: <strong>${error.message}</strong><br><br>
          This might be because:
        `;
      }
      errorScreen.style.display = "flex";
    } else {
      // Fallback: show error in container
      container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Failed to Load Team Members</h3>
          <p>Unable to connect to the server: ${error.message}</p>
          <p style="font-size: 0.9rem; color: #999;">Make sure the backend server is running on port 3000</p>
          <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        </div>
      `;
    }
  });
