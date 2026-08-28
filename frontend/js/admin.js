/**
 * ESTORA Super Admin Dashboard & Analytics (Chart.js + Operations)
 */

let propertyTypeChart = null;
let propertyCityChart = null;
let monthlyGrowthChart = null;

const Admin = {
  cachedStats: null,

  async initDashboard() {
    if (!Auth.requireAuth('ADMIN')) return;
    Dashboard.renderSidebarUserInfo();
    this.loadStatsAndCharts();
    this.loadPendingApprovals();

    // Re-render charts when theme changes
    window.addEventListener('estora-theme-changed', () => {
      if (this.cachedStats) {
        this.renderCharts(this.cachedStats);
      }
    });
  },

  async loadStatsAndCharts() {
    try {
      const res = await ApiService.getAdminStats();
      const stats = res.data;
      if (!stats) return;
      this.cachedStats = stats;

      // Update counters
      document.getElementById('admin-total-props').textContent = stats.totalProperties || 0;
      document.getElementById('admin-pending-props').textContent = stats.pendingProperties || 0;
      document.getElementById('admin-total-users').textContent = (stats.totalUsers || 0) + (stats.totalAgents || 0);
      document.getElementById('admin-total-inquiries').textContent = stats.totalInquiries || 0;

      // Render Charts if canvas elements exist
      this.renderCharts(stats);
    } catch (e) {
      console.error('Error loading admin stats:', e);
    }
  },

  renderCharts(stats) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f5f3ee' : '#111111';
    const mutedColor = isDark ? '#85827b' : '#73706B';
    const gridColor = isDark ? '#262522' : '#f1f5f9';
    const borderColor = isDark ? '#1c1c1a' : '#ffffff';
    const primaryAccent = isDark ? '#c6b58f' : '#111111';
    const secondaryAccent = isDark ? '#968668' : '#b8a98a';

    // 1. Property Type Distribution Chart (Doughnut)
    const typeCanvas = document.getElementById('chart-property-types');
    if (typeCanvas && window.Chart) {
      if (propertyTypeChart) propertyTypeChart.destroy();
      const labels = Object.keys(stats.propertiesByType || {});
      const values = Object.values(stats.propertiesByType || {});

      const doughnutColors = isDark 
        ? ['#c6b58f', '#968668', '#4ade80', '#fbbf24', '#f87171', '#85827b']
        : ['#111111', '#b8a98a', '#2A6A4E', '#A17625', '#9B2C2C', '#73706B'];

      propertyTypeChart = new Chart(typeCanvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: doughnutColors,
            borderWidth: 2,
            borderColor: borderColor
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom', 
              labels: { 
                boxWidth: 12, 
                padding: 15,
                color: textColor,
                font: { family: "'Montserrat', sans-serif", size: 11 }
              } 
            }
          },
          cutout: '65%'
        }
      });
    }

    // 2. City Distribution Chart (Bar)
    const cityCanvas = document.getElementById('chart-properties-by-city');
    if (cityCanvas && window.Chart) {
      if (propertyCityChart) propertyCityChart.destroy();
      const labels = Object.keys(stats.propertiesByCity || {});
      const values = Object.values(stats.propertiesByCity || {});

      propertyCityChart = new Chart(cityCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Listings',
            data: values,
            backgroundColor: primaryAccent,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true, 
              grid: { color: gridColor }, 
              ticks: { stepSize: 1, color: mutedColor, font: { family: "'Montserrat', sans-serif" } } 
            },
            x: { 
              grid: { display: false },
              ticks: { color: mutedColor, font: { family: "'Montserrat', sans-serif" } }
            }
          }
        }
      });
    }

    // 3. Monthly Trends Chart (Line)
    const growthCanvas = document.getElementById('chart-monthly-growth');
    if (growthCanvas && window.Chart) {
      if (monthlyGrowthChart) monthlyGrowthChart.destroy();
      const months = Object.keys(stats.monthlyListings || {});
      const listingsData = Object.values(stats.monthlyListings || {});
      const usersData = Object.values(stats.monthlyRegistrations || {});

      monthlyGrowthChart = new Chart(growthCanvas, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Listings',
              data: listingsData,
              borderColor: primaryAccent,
              backgroundColor: isDark ? 'rgba(198, 181, 143, 0.12)' : 'rgba(17, 17, 17, 0.06)',
              fill: true,
              tension: 0.35,
              borderWidth: 2
            },
            {
              label: 'New Users',
              data: usersData,
              borderColor: secondaryAccent,
              backgroundColor: isDark ? 'rgba(150, 134, 104, 0.12)' : 'rgba(184, 169, 138, 0.08)',
              fill: true,
              tension: 0.35,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'top', 
              labels: { 
                boxWidth: 12,
                color: textColor,
                font: { family: "'Montserrat', sans-serif", size: 11 }
              } 
            }
          },
          scales: {
            y: { 
              beginAtZero: true, 
              grid: { color: gridColor },
              ticks: { color: mutedColor, font: { family: "'Montserrat', sans-serif" } }
            },
            x: { 
              grid: { display: false },
              ticks: { color: mutedColor, font: { family: "'Montserrat', sans-serif" } }
            }
          }
        }
      });
    }
  },

  async loadPendingApprovals() {
    const tableBody = document.getElementById('admin-pending-table-body');
    if (!tableBody) return;

    try {
      const res = await ApiService.getAdminProperties();
      const properties = (res.data || []).filter(p => p.status === 'PENDING');

      if (properties.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2.5rem; color:var(--text-muted);">No pending property approvals. All listings are in good order.</td></tr>`;
        return;
      }

      tableBody.innerHTML = properties.map(p => `
        <tr>
          <td>
            <strong><a href="/property-details.html?id=${p.id}" target="_blank">${Utils.escapeHtml(p.title)}</a></strong>
            <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(p.locality)}, ${Utils.escapeHtml(p.city)}</div>
          </td>
          <td>${Utils.escapeHtml(p.agent ? p.agent.name : 'Unknown')}</td>
          <td><strong>${Utils.formatPrice(p.price, p.listingType)}</strong></td>
          <td><span class="badge badge-pending">PENDING</span></td>
          <td>
            <div class="table-actions">
              <button class="action-btn approve" onclick="Admin.approveProperty(${p.id})">
                <i class="fa-solid fa-check"></i> Approve
              </button>
              <button class="action-btn reject" onclick="Admin.rejectProperty(${p.id})">
                <i class="fa-solid fa-xmark"></i> Reject
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async approveProperty(id) {
    try {
      await ApiService.approveProperty(id);
      Utils.showToast('Property listing approved and published live!', 'success');
      this.initDashboard();
      if (document.getElementById('admin-properties-table-body')) {
        this.loadPropertiesList();
      }
    } catch (err) {
      Utils.showToast(err.message || 'Approval failed', 'error');
    }
  },

  async rejectProperty(id) {
    try {
      await ApiService.rejectProperty(id);
      Utils.showToast('Property listing rejected.', 'info');
      this.initDashboard();
      if (document.getElementById('admin-properties-table-body')) {
        this.loadPropertiesList();
      }
    } catch (err) {
      Utils.showToast(err.message || 'Action failed', 'error');
    }
  },

  async toggleFeature(id) {
    try {
      const res = await ApiService.toggleFeatureProperty(id);
      Utils.showToast(res.message || 'Feature status updated', 'success');
      this.loadPropertiesList();
    } catch (err) {
      Utils.showToast(err.message || 'Toggle failed', 'error');
    }
  },

  async deletePropertyAdmin(id) {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await ApiService.deleteProperty(id);
      Utils.showToast('Property deleted permanently', 'success');
      this.loadPropertiesList();
    } catch (err) {
      Utils.showToast(err.message || 'Delete failed', 'error');
    }
  },

  async loadPropertiesList() {
    const tableBody = document.getElementById('admin-properties-table-body');
    if (!tableBody) return;

    try {
      const res = await ApiService.getAdminProperties();
      const properties = res.data || [];

      tableBody.innerHTML = properties.map(p => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${(p.images && p.images[0]) || ''}" style="width:44px; height:44px; border-radius:6px; object-fit:cover;">
              <div>
                <strong><a href="/property-details.html?id=${p.id}" target="_blank">${Utils.escapeHtml(p.title)}</a></strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(p.locality)}, ${Utils.escapeHtml(p.city)}</div>
              </div>
            </div>
          </td>
          <td>${Utils.escapeHtml(p.agent ? p.agent.name : 'Unknown')}</td>
          <td><strong>${Utils.formatPrice(p.price, p.listingType)}</strong></td>
          <td>
            <span class="badge badge-${p.status.toLowerCase()}">${p.status}</span>
            ${p.featured ? '<span class="badge" style="background:#f59e0b; color:#fff; font-size:0.65rem;">FEATURED</span>' : ''}
          </td>
          <td style="font-size:0.85rem; color:var(--text-muted);">${Utils.formatDate(p.createdAt)}</td>
          <td>
            <div class="table-actions">
              ${p.status !== 'APPROVED' ? `
                <button class="action-btn approve" onclick="Admin.approveProperty(${p.id})" title="Approve">
                  <i class="fa-solid fa-check"></i>
                </button>
              ` : `
                <button class="action-btn reject" onclick="Admin.rejectProperty(${p.id})" title="Reject">
                  <i class="fa-solid fa-ban"></i>
                </button>
              `}
              <button class="action-btn" onclick="Admin.toggleFeature(${p.id})" title="Toggle Featured">
                <i class="fa-solid fa-star" style="color: ${p.featured ? '#f59e0b' : 'inherit'};"></i>
              </button>
              <button class="action-btn reject" onclick="Admin.deletePropertyAdmin(${p.id})" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async loadUsersList() {
    const tableBody = document.getElementById('admin-users-table-body');
    if (!tableBody) return;

    try {
      const res = await ApiService.getAdminUsers();
      const users = res.data || [];

      tableBody.innerHTML = users.map(u => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
              <div>
                <strong>${Utils.escapeHtml(u.name)}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(u.email)}</div>
              </div>
            </div>
          </td>
          <td><span class="badge" style="background:#f1f5f9; color:#334155;">${u.role}</span></td>
          <td>${Utils.escapeHtml(u.phone || '-')}</td>
          <td>
            <select class="form-control" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onchange="Admin.updateUserStatus(${u.id}, this.value)">
              <option value="ACTIVE" ${u.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
              <option value="INACTIVE" ${u.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
              <option value="SUSPENDED" ${u.status === 'SUSPENDED' ? 'selected' : ''}>SUSPENDED</option>
            </select>
          </td>
          <td style="font-size:0.85rem; color:var(--text-muted);">${Utils.formatDate(u.createdAt)}</td>
          <td>
            <button class="action-btn reject" onclick="Admin.deleteUser(${u.id})" title="Delete User">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async updateUserStatus(id, newStatus) {
    try {
      await ApiService.updateUserStatus(id, newStatus);
      Utils.showToast(`User status updated to ${newStatus}`, 'success');
    } catch (err) {
      Utils.showToast(err.message || 'Update failed', 'error');
    }
  },

  async deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user? All their listings and inquiries will also be removed.')) return;
    try {
      await ApiService.deleteUser(id);
      Utils.showToast('User deleted successfully', 'success');
      this.loadUsersList();
    } catch (err) {
      Utils.showToast(err.message || 'Delete failed', 'error');
    }
  },

  async loadAgentsList() {
    const tableBody = document.getElementById('admin-agents-table-body');
    if (!tableBody) return;

    try {
      const res = await ApiService.getAdminAgents();
      const agents = res.data || [];

      tableBody.innerHTML = agents.map(a => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${a.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
              <div>
                <strong>${Utils.escapeHtml(a.name)}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(a.email)}</div>
              </div>
            </div>
          </td>
          <td>${Utils.escapeHtml(a.agency || 'Independent')}</td>
          <td><strong>${a.listingsCount || 0}</strong> Listings</td>
          <td>
            <button 
              class="action-btn ${a.isVerified ? 'approve' : ''}" 
              onclick="Admin.toggleAgentVerification(${a.id}, ${!a.isVerified})"
            >
              <i class="fa-solid ${a.isVerified ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
              ${a.isVerified ? 'Verified' : 'Unverified'}
            </button>
          </td>
          <td style="font-size:0.85rem; color:var(--text-muted);">${Utils.formatDate(a.createdAt)}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async toggleAgentVerification(id, verified) {
    try {
      await ApiService.verifyAgent(id, verified);
      Utils.showToast(`Agent verification updated`, 'success');
      this.loadAgentsList();
    } catch (err) {
      Utils.showToast(err.message || 'Verification update failed', 'error');
    }
  },

  async loadInquiriesList() {
    const tableBody = document.getElementById('admin-inquiries-table-body');
    if (!tableBody) return;

    try {
      const res = await ApiService.getAdminInquiries();
      const inquiries = res.data || [];

      tableBody.innerHTML = inquiries.map(inq => `
        <tr>
          <td>
            <strong>${Utils.escapeHtml(inq.name)}</strong>
            <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(inq.email)} • ${Utils.escapeHtml(inq.phone)}</div>
          </td>
          <td>
            <strong>${Utils.escapeHtml(inq.propertyTitle || 'Listing')}</strong>
            <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(inq.propertyCity || '')}</div>
          </td>
          <td>${Utils.escapeHtml(inq.agentName || 'Agent')}</td>
          <td style="max-width:240px; font-size:0.85rem;">${Utils.escapeHtml(inq.message)}</td>
          <td><span class="badge badge-${inq.status.toLowerCase()}">${inq.status}</span></td>
          <td style="font-size:0.85rem; color:var(--text-muted);">${Utils.formatDate(inq.createdAt)}</td>
          <td>
            <button class="action-btn reject" onclick="Admin.deleteInquiry(${inq.id})" title="Delete Record">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async deleteInquiry(id) {
    if (!confirm('Are you sure you want to delete this lead record?')) return;
    try {
      await ApiService.deleteInquiry(id);
      Utils.showToast('Inquiry record deleted', 'success');
      this.loadInquiriesList();
    } catch (err) {
      Utils.showToast(err.message || 'Failed to delete inquiry', 'error');
    }
  }
};
