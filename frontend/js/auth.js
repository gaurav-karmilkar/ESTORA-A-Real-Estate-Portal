/**
 * ESTORA Authentication and User State Manager
 */

const Auth = {
  getUser() {
    try {
      const user = localStorage.getItem('estora_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('estora_token');
  },

  isLoggedIn() {
    return !!(this.getToken() && this.getUser());
  },

  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  },

  saveSession(token, user) {
    localStorage.setItem('estora_token', token);
    localStorage.setItem('estora_user', typeof user === 'string' ? user : JSON.stringify(user));
    window.dispatchEvent(new Event('estora-auth-changed'));
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('estora_token', token);
    } else {
      localStorage.removeItem('estora_token');
    }
    window.dispatchEvent(new Event('estora-auth-changed'));
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('estora_user', typeof user === 'string' ? user : JSON.stringify(user));
    } else {
      localStorage.removeItem('estora_user');
    }
    window.dispatchEvent(new Event('estora-auth-changed'));
  },

  logout() {
    localStorage.removeItem('estora_token');
    localStorage.removeItem('estora_user');
    window.dispatchEvent(new Event('estora-auth-changed'));
    Utils.showToast('You have been logged out safely.', 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 400);
  },

  /**
   * Render universal Navigation Bar user status
   */
  renderNavbar() {
    const actionsEl = document.getElementById('nav-user-actions');
    if (!actionsEl) return;

    // Inject Desktop Theme Toggle if not present
    const navActions = actionsEl.closest('.nav-actions');
    if (navActions && !navActions.querySelector('.theme-toggle-btn:not(.mobile-theme-btn)')) {
      const themeBtn = document.createElement('button');
      themeBtn.className = 'theme-toggle-btn';
      themeBtn.id = 'themeToggle';
      themeBtn.setAttribute('type', 'button');
      themeBtn.setAttribute('onclick', 'window.Theme && window.Theme.toggle()');
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      themeBtn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      themeBtn.innerHTML = `<i class="${isDark ? 'fa-regular fa-sun' : 'fa-regular fa-moon'}"></i>`;
      navActions.insertBefore(themeBtn, actionsEl);
    }

    // Inject Mobile Theme Toggle if not present
    const navMenu = document.getElementById('nav-menu');
    if (navMenu && !navMenu.querySelector('.mobile-theme-toggle')) {
      const mobileLi = document.createElement('li');
      mobileLi.className = 'mobile-theme-toggle';
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      mobileLi.innerHTML = `
        <button class="mobile-theme-btn" type="button" onclick="window.Theme && window.Theme.toggle()" aria-label="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
          <i class="${isDark ? 'fa-regular fa-sun' : 'fa-regular fa-moon'}"></i>
          <span class="theme-toggle-text">${isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      `;
      navMenu.appendChild(mobileLi);
    }

    const user = this.getUser();

    if (user) {
      const dashboardLink = user.role === 'ADMIN' 
        ? '/admin/dashboard.html' 
        : user.role === 'AGENT' 
        ? '/agent/dashboard.html' 
        : '/dashboard.html';

      actionsEl.innerHTML = `
        <a href="/favorites.html" class="nav-fav-btn" title="Saved Properties">
          <i class="fa-regular fa-heart"></i>
          <span class="fav-count" id="nav-fav-count">0</span>
        </a>
        <div class="user-menu-wrapper">
          <button class="user-menu-btn" id="user-menu-toggle" onclick="Auth.toggleUserDropdown()">
            <img src="${user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}" alt="${Utils.escapeHtml(user.name)}" class="user-avatar-sm">
            <span class="user-name-label">${Utils.escapeHtml(user.name.split(' ')[0])}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem; color: var(--text-muted);"></i>
          </button>
          <div class="user-dropdown" id="user-dropdown-menu">
            <div class="user-dropdown-header">
              <div class="name">${Utils.escapeHtml(user.name)}</div>
              <div class="role-badge">${user.role}</div>
            </div>
            <a href="${dashboardLink}" class="dropdown-item">
              <i class="fa-solid fa-gauge-high"></i> Dashboard
            </a>
            ${user.role === 'AGENT' ? `
              <a href="/agent/add-property.html" class="dropdown-item">
                <i class="fa-solid fa-plus-circle"></i> Add Property
              </a>
            ` : ''}
            <a href="/favorites.html" class="dropdown-item">
              <i class="fa-solid fa-heart"></i> Saved Homes
            </a>
            <a href="/inquiries.html" class="dropdown-item">
              <i class="fa-solid fa-envelope"></i> My Inquiries
            </a>
            <div class="dropdown-divider"></div>
            <a href="javascript:void(0)" onclick="Auth.logout()" class="dropdown-item" style="color: var(--danger);">
              <i class="fa-solid fa-right-from-bracket"></i> Sign Out
            </a>
          </div>
        </div>
      `;
      this.updateFavCountBadge();
    } else {
      actionsEl.innerHTML = `
        <a href="/login.html" class="btn btn-outline btn-sm">Sign In</a>
        <a href="/register.html" class="btn btn-primary btn-sm">Join Estora</a>
      `;
    }
  },

  toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  },

  async updateFavCountBadge() {
    const badge = document.getElementById('nav-fav-count');
    if (!badge || !this.isLoggedIn()) return;
    try {
      const res = await ApiService.getFavoriteIds();
      if (res.data) {
        badge.textContent = res.data.length;
      }
    } catch (e) {
      // ignore
    }
  },

  /**
   * Auth Guard for protected pages
   */
  requireAuth(requiredRole = null) {
    if (!this.isLoggedIn()) {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }

    if (requiredRole && !this.hasRole(requiredRole)) {
      if (requiredRole === 'ADMIN') {
        window.location.href = '/dashboard.html';
        return false;
      }
      if (requiredRole === 'AGENT' && !this.hasRole('ADMIN')) {
        window.location.href = '/dashboard.html';
        return false;
      }
    }
    return true;
  }
};

// Global click to close dropdowns
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.user-menu-wrapper');
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown && wrapper && !wrapper.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Auth.renderNavbar();
});
window.addEventListener('estora-auth-changed', () => {
  Auth.renderNavbar();
});
