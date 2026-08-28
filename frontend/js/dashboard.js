/**
 * ESTORA User Dashboard Logic (Profile, Saved Homes, Inquiries)
 */

const Dashboard = {
  async initProfilePage() {
    if (!Auth.requireAuth()) return;
    const user = Auth.getUser();

    // Populate profile inputs
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    const agencyInput = document.getElementById('profile-agency');
    const avatarImg = document.getElementById('profile-avatar-preview');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (agencyInput && user.agency) agencyInput.value = user.agency || '';
    if (avatarImg && user.avatarUrl) avatarImg.src = user.avatarUrl;

    this.renderSidebarUserInfo();
  },

  renderSidebarUserInfo() {
    const user = Auth.getUser();
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');

    if (nameEl && user) nameEl.textContent = user.name;
    if (roleEl && user) roleEl.textContent = user.role;
    if (avatarEl && user && user.avatarUrl) avatarEl.src = user.avatarUrl;
  },

  async handleProfileUpdate(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
      const name = document.getElementById('profile-name').value;
      const phone = document.getElementById('profile-phone').value;
      const agency = document.getElementById('profile-agency') ? document.getElementById('profile-agency').value : undefined;
      const password = document.getElementById('profile-password').value;

      const res = await ApiService.updateProfile({
        name,
        phone,
        agency,
        password: password ? password : undefined
      });

      if (res.success && res.data) {
        Auth.saveSession(Auth.getToken(), res.data);
        Utils.showToast('Profile updated successfully!', 'success');
        this.renderSidebarUserInfo();
        if (document.getElementById('profile-password')) {
          document.getElementById('profile-password').value = '';
        }
      }
    } catch (err) {
      Utils.showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  async loadUserFavorites() {
    const container = document.getElementById('user-favorites-grid');
    if (!container) return;

    container.innerHTML = Properties.renderSkeletons(4);

    try {
      const res = await ApiService.getFavorites();
      const properties = res.data || [];

      if (properties.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1;" class="empty-state">
            <i class="fa-regular fa-heart empty-state-icon"></i>
            <h3 class="empty-state-title">No Saved Properties Yet</h3>
            <p class="empty-state-desc">Click the heart icon on any property listing to bookmark it here for quick access.</p>
            <a href="/properties.html" class="btn btn-primary">Browse Properties</a>
          </div>
        `;
        return;
      }

      container.innerHTML = properties.map(p => Properties.renderCard(p)).join('');
      Favorites.updateButtonsUI();
    } catch (e) {
      container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--danger); text-align:center; padding:2rem;">Failed to load saved properties.</div>`;
    }
  },

  async loadUserInquiries() {
    const container = document.getElementById('user-inquiries-table-body');
    if (!container) return;

    try {
      const res = await ApiService.getMyInquiries();
      const inquiries = res.data || [];

      if (inquiries.length === 0) {
        container.innerHTML = `
          <tr>
            <td colspan="5" class="empty-state" style="border:none; padding:3rem;">
              <i class="fa-regular fa-envelope-open empty-state-icon"></i>
              <h4 class="empty-state-title">No Inquiries Sent Yet</h4>
              <p class="empty-state-desc">When you request a callback or ask questions on properties, your conversation log will appear here.</p>
            </td>
          </tr>
        `;
        return;
      }

      container.innerHTML = inquiries.map(inq => `
        <tr>
          <td>
            <strong>${Utils.escapeHtml(inq.propertyTitle || 'Property')}</strong>
            <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(inq.propertyCity || '')}</div>
          </td>
          <td>${Utils.escapeHtml(inq.agentName || 'Agent')}</td>
          <td>
            <div style="max-width:280px; font-size:0.85rem; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${Utils.escapeHtml(inq.message)}
            </div>
          </td>
          <td>
            <span class="badge badge-${inq.status.toLowerCase()}">${inq.status}</span>
          </td>
          <td style="color:var(--text-muted); font-size:0.85rem;">
            ${Utils.formatDate(inq.createdAt)}
          </td>
        </tr>
      `).join('');
    } catch (e) {
      container.innerHTML = `<tr><td colspan="5" style="color:var(--danger); text-align:center; padding:2rem;">Failed to load inquiries.</td></tr>`;
    }
  }
};
