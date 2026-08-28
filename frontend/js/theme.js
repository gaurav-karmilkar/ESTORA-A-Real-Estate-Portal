/**
 * ESTORA Real Estate Portal - Luxury Theme Manager (Light / Dark Mode)
 */

(function () {
  // 1. Immediate Theme Application (Prevents Flash of Wrong Theme)
  const STORAGE_KEY = 'estora_theme';
  
  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function applyTheme(theme, save = false) {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', validTheme);
    if (save) {
      localStorage.setItem(STORAGE_KEY, validTheme);
    }
    updateThemeToggleIcons(validTheme);
    window.dispatchEvent(new CustomEvent('estora-theme-changed', { detail: { theme: validTheme } }));
  }

  // Initial immediate application before body loads
  const initialTheme = getStoredTheme() || getSystemTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  // 2. Global Theme Controller Object
  window.Theme = {
    getTheme() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },

    setTheme(theme) {
      applyTheme(theme, true);
    },

    toggle() {
      const nextTheme = this.getTheme() === 'dark' ? 'light' : 'dark';
      this.setTheme(nextTheme);
      return nextTheme;
    },

    init() {
      const theme = getStoredTheme() || getSystemTheme();
      applyTheme(theme, false);
      this.renderToggleButtons();
      this.bindSystemThemeWatcher();
    },

    bindSystemThemeWatcher() {
      if (!window.matchMedia) return;
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't explicitly set a preference
        if (!getStoredTheme()) {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    },

    renderToggleButtons() {
      updateThemeToggleIcons(this.getTheme());
    }
  };

  function updateThemeToggleIcons(theme) {
    const isDark = theme === 'dark';
    const toggles = document.querySelectorAll('.theme-toggle-btn, .mobile-theme-btn');
    
    toggles.forEach((btn) => {
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isDark ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
      }
      
      const textSpan = btn.querySelector('.theme-toggle-text');
      if (textSpan) {
        textSpan.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      }
    });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.Theme.init());
  } else {
    window.Theme.init();
  }
})();

