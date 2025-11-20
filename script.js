'use strict';

// Theme Module - Detects and applies system theme
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
      metaThemeColor.setAttribute('content', isDark ? '#0a0a0a' : '#ffffff');
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

// Initialize theme immediately - before DOM loads
ThemeManager.init();

// Utility Functions
const utils = {
  debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  $(selector) {
    return document.querySelector(selector);
  },

  $$(selector) {
    return document.querySelectorAll(selector);
  }
};

// Navigation Module
const Navigation = {
  elements: null,
  lastScroll: 0,
  currentSection: '',

  init() {
    this.elements = {
      navbar: utils.$('#navbar'),
      menuIcon: utils.$('#menuIcon'),
      closeMenu: utils.$('#closeMenu'),
      navLinks: utils.$('#navLinks'),
      navLinkItems: utils.$$('.nav-link'),
      overlay: utils.$('.overlay')
    };

    this.bindEvents();
    this.updateActiveLink();
  },

  bindEvents() {
    const { menuIcon, closeMenu, navLinks, navLinkItems, overlay } = this.elements;

    menuIcon?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openMenu();
    });

    closeMenu?.addEventListener('click', () => this.closeMenu());
    overlay?.addEventListener('click', () => this.closeMenu());

    navLinkItems.forEach(link => {
      link.addEventListener('click', (e) => {
        this.closeMenu();
        // Optional: smooth scroll on click
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = utils.$(href);
          if (target) {
            window.scrollTo({
              top: target.offsetTop - 80,
              behavior: 'smooth'
            });
          }
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (navLinks && 
          !navLinks.contains(e.target) && 
          !menuIcon?.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Scroll handler with active link detection
    window.addEventListener('scroll', utils.throttle(() => {
      this.handleScroll();
      this.updateActiveLink();
      this.handleAutoHide();
    }, 100));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMenu();
      }
    });
  },

  openMenu() {
    this.elements.navLinks?.classList.add('active');
    this.elements.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeMenu() {
    this.elements.navLinks?.classList.remove('active');
    this.elements.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  },

  handleScroll() {
    const { navbar } = this.elements;
    if (!navbar) return;

    if (window.pageYOffset > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  },

  handleAutoHide() {
    const { navbar } = this.elements;
    if (!navbar) return;

    const currentScroll = window.pageYOffset;

    if (currentScroll > this.lastScroll && currentScroll > 100) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }

    this.lastScroll = currentScroll;
  },

  updateActiveLink() {
    const sections = utils.$$('section[id]');
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;

    let activeSection = null;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      const sectionId = section.getAttribute('id');

      // Check if we're in this section
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        activeSection = sectionId;
      }
    });

    // If we found an active section, update the nav
    if (activeSection && activeSection !== this.currentSection) {
      this.currentSection = activeSection;
      
      // Remove active class from all links
      this.elements.navLinkItems.forEach(link => {
        link.classList.remove('active');
      });

      // Add active class to current section link
      const activeLink = Array.from(this.elements.navLinkItems).find(
        link => link.getAttribute('href') === `#${activeSection}`
      );

      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }
};

// Smooth Scroll Module
const SmoothScroll = {
  init() {
    utils.$$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        e.preventDefault();
        const target = utils.$(href);

        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    });
  }
};

// Animation Module
const Animations = {
  init() {
    this.setupIntersectionObserver();
    this.setupCounters();
    this.setupParallax();
  },

  setupIntersectionObserver() {
    const options = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, options);

    utils.$$('[data-aos]').forEach(el => observer.observe(el));
  },

  setupCounters() {
    const statsSection = utils.$('.hero-stats');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.stat-number');
          counters.forEach(counter => {
            this.animateCounter(counter);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  },

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    if (isNaN(target)) return; // Safety check
    
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * target);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    };
    
    requestAnimationFrame(update);
  },

  setupParallax() {
    const heroBackground = utils.$('.hero-background');
    if (!heroBackground) return;

    window.addEventListener('scroll', utils.throttle(() => {
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    }, 16));
  }
};

// Back to Top Module
const BackToTop = {
  init() {
    const button = utils.$('#backToTop');
    if (!button) return;

    window.addEventListener('scroll', utils.throttle(() => {
      if (window.pageYOffset > 300) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    }, 100));

    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};

// Form Handler Module
const FormHandler = {
  init() {
    const form = utils.$('#contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });
  },

  async handleSubmit(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;

    if (!this.validateForm(form)) {
      this.showMessage('Please fill in all required fields correctly.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      this.showMessage('✅ Thank you! We will get back to you soon.', 'success');
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      this.showMessage('❌ Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  },

  validateForm(form) {
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    });

    return isValid;
  },

  showMessage(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
};

// Lazy Loading Module
const LazyLoad = {
  init() {
    if (!('IntersectionObserver' in window)) {
      utils.$$('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.classList.add('loaded');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    utils.$$('img[data-src]').forEach(img => observer.observe(img));
  }
};

// Main Application
const App = {
  init() {
    // Initialize all modules
    Navigation.init();
    SmoothScroll.init();
    Animations.init();
    BackToTop.init();
    FormHandler.init();
    LazyLoad.init();

    // Mark page as loaded
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
      console.log('🚀 Hackclub Butwal Kalika initialized successfully!');
    });

    // Add CSS animations
    this.addAnimationStyles();
  },

  addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }

      [data-aos] {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }

      [data-aos].aos-animate {
        opacity: 1;
        transform: translateY(0);
      }

      img[data-src] {
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      img.loaded {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
};

// Mobile Menu Toggle - Professional Implementation
const menuIcon = document.getElementById('menuIcon');
const closeMenu = document.getElementById('closeMenu');
const navLinks = document.getElementById('navLinks');
const overlay = document.querySelector('.overlay');
const body = document.body;

// Function to open menu
function openMenu() {
  navLinks.classList.add('active');
  overlay.classList.add('active');
  body.classList.add('menu-open');
  body.style.overflow = 'hidden';
}

// Function to close menu
function closeMenuFunc() {
  navLinks.classList.remove('active');
  overlay.classList.remove('active');
  body.classList.remove('menu-open');
  body.style.overflow = '';
}

// Open menu when hamburger is clicked
if (menuIcon) {
  menuIcon.addEventListener('click', openMenu);
}

// Close menu when X button is clicked
if (closeMenu) {
  closeMenu.addEventListener('click', closeMenuFunc);
}

// Close menu when overlay is clicked
if (overlay) {
  overlay.addEventListener('click', closeMenuFunc);
}

// Close menu when any nav link is clicked
const navLinkItems = document.querySelectorAll('.nav-link');
navLinkItems.forEach(link => {
  link.addEventListener('click', (e) => {
    closeMenuFunc();
    
    // Smooth scroll to section
    const targetId = link.getAttribute('href');
    if (targetId.startsWith('#')) {
      e.preventDefault();
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        setTimeout(() => {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('active')) {
    closeMenuFunc();
  }
});

// Prevent scrolling behind menu when open
if (navLinks) {
  navLinks.addEventListener('touchmove', (e) => {
    e.stopPropagation();
  }, { passive: true });
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
