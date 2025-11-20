const baseId = window.CONFIG.AIRTABLE_BASE_ID;
const tableName = window.CONFIG.AIRTABLE_TABLE_NAME;
const token = window.CONFIG.AIRTABLE_ACCESS_TOKEN;

const loader = document.getElementById("loader");

// Theme Manager - Same as main site
const ThemeManager = {
  init() {
    this.applySystemTheme();
    this.watchSystemTheme();
  },

  applySystemTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = isDark ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${theme}-theme`);
    
    // Update theme color meta tag dynamically
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1a1a1a' : '#ffffff');
    }
    
    console.log(`🎨 Theme applied: ${theme}`);
  },

  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Listen for theme changes
    mediaQuery.addEventListener('change', () => {
      this.applySystemTheme();
    });
  }
};

// Initialize theme immediately
ThemeManager.init();

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

    // Show simple error message
    const container = document.getElementById("records");
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; width: 100%;">
        <p style="color: #ec3750; font-size: 1.2rem;">⚠️ Failed to load team members</p>
       <a href="../team/" style="text-decoration: none;"><button style="margin-top: 20px; padding: 10px 20px; background: #ec3750; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button></a>
      </div>
    `;
  });

// Mobile Navigation
const menuToggle = document.getElementById('menuIcon');
const closeMenu = document.getElementById('closeMenu');
const navLinks = document.getElementById('navLinks');
const overlay = document.querySelector('.overlay');
const body = document.body;

// Open mobile menu
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.add('active');
    overlay.classList.add('active');
    body.style.overflow = 'hidden';
  });
}

// Close mobile menu
if (closeMenu) {
  closeMenu.addEventListener('click', () => {
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';
  });
}

// Close menu when clicking overlay
if (overlay) {
  overlay.addEventListener('click', () => {
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';
  });
}

// Close menu when clicking nav links
const navLinkItems = document.querySelectorAll('.nav-link');
navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';
  });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  // Add scrolled class on page load if already scrolled
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  }
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}
