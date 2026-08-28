/**
 * ESTORA Agent Management & Listing Logic
 */

const Agent = {
  async initDashboard() {
    if (!Auth.requireAuth('AGENT')) return;
    Dashboard.renderSidebarUserInfo();
    this.loadAgentStatsAndListings();
  },

  async loadAgentStatsAndListings() {
    const user = Auth.getUser();
    if (!user) return;

    try {
      // Load properties
      const resProps = await ApiService.getAgentProperties(user.id);
      const properties = resProps.data || [];

      // Load inquiries
      const resInqs = await ApiService.getAgentInquiries();
      const inquiries = resInqs.data || [];

      // Update metrics
      const totalPropsEl = document.getElementById('agent-total-properties');
      const approvedPropsEl = document.getElementById('agent-approved-properties');
      const pendingPropsEl = document.getElementById('agent-pending-properties');
      const totalInquiriesEl = document.getElementById('agent-total-inquiries');

      if (totalPropsEl) totalPropsEl.textContent = properties.length;
      if (approvedPropsEl) approvedPropsEl.textContent = properties.filter(p => p.status === 'APPROVED').length;
      if (pendingPropsEl) pendingPropsEl.textContent = properties.filter(p => p.status === 'PENDING').length;
      if (totalInquiriesEl) totalInquiriesEl.textContent = inquiries.length;

      // Render recent properties table
      const propTableBody = document.getElementById('agent-properties-table-body');
      if (propTableBody) {
        if (properties.length === 0) {
          propTableBody.innerHTML = `
            <tr>
              <td colspan="6" class="empty-state" style="border:none; padding:3rem;">
                <i class="fa-solid fa-building-circle-plus empty-state-icon"></i>
                <h4 class="empty-state-title">No Listings Created Yet</h4>
                <p class="empty-state-desc">Start adding your properties to reach thousands of verified buyers and renters.</p>
                <a href="/agent/add-property.html" class="btn btn-primary btn-sm">Add New Property</a>
              </td>
            </tr>
          `;
        } else {
          propTableBody.innerHTML = properties.map(p => `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <img src="${(p.images && p.images[0]) || ''}" style="width:48px; height:48px; border-radius:6px; object-fit:cover;">
                  <div>
                    <strong><a href="/property-details.html?id=${p.id}">${Utils.escapeHtml(p.title)}</a></strong>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(p.locality)}, ${Utils.escapeHtml(p.city)}</div>
                  </div>
                </div>
              </td>
              <td>${p.propertyType} (${p.listingType})</td>
              <td><strong>${Utils.formatPrice(p.price, p.listingType)}</strong></td>
              <td><span class="badge badge-${p.status.toLowerCase()}">${p.status}</span></td>
              <td style="font-size:0.85rem; color:var(--text-muted);">${Utils.formatDate(p.createdAt)}</td>
              <td>
                <div class="table-actions">
                  <a href="/agent/edit-property.html?id=${p.id}" class="action-btn" title="Edit Listing">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </a>
                  <button type="button" class="action-btn reject" onclick="Agent.deleteProperty(${p.id})" title="Delete Listing">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('');
        }
      }

      // Render recent inquiries
      const inqTableBody = document.getElementById('agent-inquiries-table-body');
      if (inqTableBody) {
        if (inquiries.length === 0) {
          inqTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No inquiries received yet.</td></tr>`;
        } else {
          inqTableBody.innerHTML = inquiries.map(inq => `
            <tr>
              <td>
                <strong>${Utils.escapeHtml(inq.name)}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.escapeHtml(inq.email)} • ${Utils.escapeHtml(inq.phone)}</div>
              </td>
              <td>${Utils.escapeHtml(inq.propertyTitle || '')}</td>
              <td style="max-width:260px; font-size:0.85rem;">${Utils.escapeHtml(inq.message)}</td>
              <td>
                <select class="form-control" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onchange="Agent.updateInquiryStatus(${inq.id}, this.value)">
                  <option value="NEW" ${inq.status === 'NEW' ? 'selected' : ''}>NEW</option>
                  <option value="CONTACTED" ${inq.status === 'CONTACTED' ? 'selected' : ''}>CONTACTED</option>
                  <option value="CLOSED" ${inq.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
                </select>
              </td>
              <td style="font-size:0.85rem; color:var(--text-muted);">${Utils.formatDate(inq.createdAt)}</td>
              <td>
                <a href="tel:${inq.phone}" class="action-btn approve" title="Call Lead"><i class="fa-solid fa-phone"></i></a>
                <a href="mailto:${inq.email}" class="action-btn" title="Email Lead"><i class="fa-solid fa-envelope"></i></a>
              </td>
            </tr>
          `).join('');
        }
      }
    } catch (e) {
      console.error('Agent dashboard error:', e);
    }
  },

  async handlePropertyFormSubmit(e, isEdit = false, propertyId = null) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
      const title = document.getElementById('prop-title').value;
      const description = document.getElementById('prop-description').value;
      const price = document.getElementById('prop-price').value;
      const propertyType = document.getElementById('prop-type').value;
      const listingType = document.getElementById('prop-listing-type').value;
      const city = document.getElementById('prop-city').value;
      const locality = document.getElementById('prop-locality').value;
      const address = document.getElementById('prop-address').value;
      const bedrooms = document.getElementById('prop-bedrooms').value;
      const bathrooms = document.getElementById('prop-bathrooms').value;
      const area = document.getElementById('prop-area').value;
      const parking = document.getElementById('prop-parking').value;
      const furnishing = document.getElementById('prop-furnishing').value;

      // Collect amenities
      const checkedAmenities = Array.from(document.querySelectorAll('input[name="amenities"]:checked')).map(cb => cb.value);

      // Collect image URLs
      const imageUrlsInput = document.getElementById('prop-images');
      let images = [];
      if (imageUrlsInput && imageUrlsInput.value.trim()) {
        images = imageUrlsInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
      if (images.length === 0) {
        images = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];
      }

      const payload = {
        title,
        description,
        price: Number(price),
        propertyType,
        listingType,
        city,
        locality,
        address,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        area: Number(area),
        parking: Number(parking) || 0,
        furnishing,
        amenities: checkedAmenities,
        images
      };

      if (isEdit && propertyId) {
        await ApiService.updateProperty(propertyId, payload);
        Utils.showToast('Property listing updated successfully!', 'success');
      } else {
        await ApiService.createProperty(payload);
        Utils.showToast('Property listing submitted! Awaiting admin approval.', 'success');
      }

      setTimeout(() => {
        window.location.href = '/agent/dashboard.html';
      }, 1000);
    } catch (err) {
      Utils.showToast(err.message || 'Failed to save property', 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  async deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property listing? This action cannot be undone.')) {
      return;
    }

    try {
      await ApiService.deleteProperty(id);
      Utils.showToast('Property deleted successfully', 'success');
      this.loadAgentStatsAndListings();
    } catch (err) {
      Utils.showToast(err.message || 'Failed to delete property', 'error');
    }
  },

  async updateInquiryStatus(id, newStatus) {
    try {
      await ApiService.updateInquiryStatus(id, newStatus);
      Utils.showToast(`Inquiry marked as ${newStatus}`, 'success');
    } catch (err) {
      Utils.showToast(err.message || 'Failed to update inquiry', 'error');
    }
  }
};
