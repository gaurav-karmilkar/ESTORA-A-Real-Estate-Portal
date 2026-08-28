/**
 * ESTORA Properties Renderer & Search Engine
 * Luxury Real Estate Editorial Style
 */

const Properties = {
  /**
   * Render single property HTML card
   */
  renderCard(property) {
    const isFav = Favorites.isFavorite(property.id);
    const mainImg = (property.images && property.images.length > 0)
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

    return `
      <div class="property-card" id="property-card-${property.id}">
        <div class="property-media">
          <img src="${mainImg}" alt="${Utils.escapeHtml(property.title)}" class="property-image" loading="lazy">
          <div class="property-badges property-badges-overlay">
            <span class="badge ${property.listingType === 'RENT' ? 'badge-rent' : 'badge-buy'}">
              For ${property.listingType === 'RENT' ? 'Rent' : 'Sale'}
            </span>
            ${property.featured ? '<span class="badge badge-exclusive"><i class="fa-solid fa-star"></i> Exclusive</span>' : ''}
          </div>
          <button 
            type="button"
            class="favorite-btn property-fav-btn ${isFav ? 'active' : ''}" 
            data-fav-property-id="${property.id}"
            onclick="Favorites.toggleFavorite(${property.id}, this)"
            title="Save property"
            aria-label="Save property"
          >
            <i class="${isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" ${isFav ? 'style="color:var(--danger);"' : ''}></i>
          </button>
        </div>
        <div class="property-card-content property-body">
          <div class="property-category-tag">${Utils.escapeHtml(property.propertyType || 'Residence')}</div>
          <h3 class="property-title">
            <a href="/property-details.html?id=${property.id}" title="${Utils.escapeHtml(property.title)}">${Utils.escapeHtml(property.title)}</a>
          </h3>
          <div class="property-location" title="${Utils.escapeHtml(property.locality)}, ${Utils.escapeHtml(property.city)}">
            <i class="fa-solid fa-location-dot"></i>
            <span>${Utils.escapeHtml(property.locality)}, ${Utils.escapeHtml(property.city)}</span>
          </div>

          <div class="property-meta property-specs">
            <div class="meta-item spec-item" title="Bedrooms">
              <i class="fa-solid fa-bed"></i>
              <div class="meta-item-content">
                <span class="meta-item-val">${property.bedrooms > 0 ? property.bedrooms : 'Studio'}</span>
                <span class="meta-item-label">${property.bedrooms > 1 ? 'Beds' : 'Bed'}</span>
              </div>
            </div>
            <div class="meta-item spec-item" title="Bathrooms">
              <i class="fa-solid fa-bath"></i>
              <div class="meta-item-content">
                <span class="meta-item-val">${property.bathrooms > 0 ? property.bathrooms : '-'}</span>
                <span class="meta-item-label">${property.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
              </div>
            </div>
            <div class="meta-item spec-item" title="Carpet Area">
              <i class="fa-solid fa-ruler-combined"></i>
              <div class="meta-item-content">
                <span class="meta-item-val">${property.area ? Number(property.area).toLocaleString('en-IN') : '-'}</span>
                <span class="meta-item-label">SQ.FT</span>
              </div>
            </div>
          </div>

          <div class="price-section property-price-wrap">
            <span class="price-label property-price-label">${property.listingType === 'RENT' ? 'Monthly Rent' : 'Starting Price'}</span>
            <div class="property-price">
              ${Utils.formatPrice(property.price, property.listingType)}
            </div>
          </div>

          <div class="property-card-footer property-footer">
            <div class="agent-info agent-mini" title="${Utils.escapeHtml(property.agent ? property.agent.name : 'Agent')}">
              <img 
                src="${(property.agent && property.agent.avatarUrl) ? property.agent.avatarUrl : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'}" 
                alt="${Utils.escapeHtml(property.agent ? property.agent.name : 'Agent')}" 
                class="agent-avatar agent-mini-img"
              >
              <span class="agent-name agent-mini-name">${Utils.escapeHtml(property.agent ? property.agent.name : 'Verified Agent')}</span>
            </div>
            <a href="/property-details.html?id=${property.id}" class="btn btn-outline btn-sm view-property-btn">
              View Property
            </a>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render skeleton cards during API loading
   */
  renderSkeletons(count = 6) {
    return Array(count).fill(0).map(() => `
      <div class="property-card">
        <div class="skeleton" style="height: 240px;"></div>
        <div style="padding: 1.5rem;">
          <div class="skeleton" style="height: 14px; width: 30%; margin-bottom: 0.75rem;"></div>
          <div class="skeleton" style="height: 24px; width: 85%; margin-bottom: 0.5rem;"></div>
          <div class="skeleton" style="height: 14px; width: 55%; margin-bottom: 1.25rem;"></div>
          <div class="skeleton" style="height: 36px; width: 100%; margin-bottom: 1.25rem;"></div>
          <div class="skeleton" style="height: 28px; width: 45%;"></div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Load and render featured properties on Homepage
   */
  async loadFeatured() {
    const container = document.getElementById('featured-properties-grid');
    if (!container) return;

    container.innerHTML = this.renderSkeletons(3);

    try {
      const res = await ApiService.getFeaturedProperties();
      const properties = res.data || [];

      if (properties.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1;" class="empty-state">
            <i class="fa-solid fa-house-chimney empty-state-icon"></i>
            <h3 class="empty-state-title">No Featured Properties Found</h3>
            <p class="empty-state-desc">Check back soon for new exclusive luxury listings.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = properties.slice(0, 6).map(p => this.renderCard(p)).join('');
      Favorites.updateButtonsUI();
    } catch (e) {
      container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--danger); text-align:center; padding: 2rem;">Failed to load properties.</div>`;
    }
  },

  /**
   * Load and render the full searchable properties list
   */
  async loadProperties(params = {}) {
    const container = document.getElementById('properties-results-grid');
    const totalCountEl = document.getElementById('total-properties-count');
    const paginationEl = document.getElementById('properties-pagination');
    if (!container) return;

    container.innerHTML = this.renderSkeletons(6);

    try {
      const res = await ApiService.getProperties(params);
      const properties = res.data || [];
      const total = (res.pagination && res.pagination.total) ? res.pagination.total : properties.length;

      if (totalCountEl) {
        totalCountEl.textContent = `${total} Exclusive Properties Available`;
      }

      if (properties.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1;" class="empty-state">
            <i class="fa-solid fa-building-circle-exclamation empty-state-icon"></i>
            <h3 class="empty-state-title">No Matching Properties Found</h3>
            <p class="empty-state-desc">Try loosening your search filters, expanding your budget range, or clearing location parameters.</p>
            <button onclick="Properties.clearAllFilters()" class="btn btn-outline">Reset All Filters</button>
          </div>
        `;
        if (paginationEl) paginationEl.innerHTML = '';
        return;
      }

      container.innerHTML = properties.map(p => this.renderCard(p)).join('');
      Favorites.updateButtonsUI();

      if (paginationEl && res.pagination) {
        this.renderPagination(res.pagination, paginationEl);
      }
    } catch (e) {
      container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--danger); text-align:center; padding: 2rem;">Error retrieving estate catalog.</div>`;
    }
  },

  /**
   * Render Pagination Buttons
   */
  renderPagination(pagination, container) {
    const { page, totalPages } = pagination;
    if (!totalPages || totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = `
      <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-top:3rem;">
        <button 
          class="btn btn-outline btn-sm" 
          ${page <= 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}
          onclick="Properties.changePage(${page - 1})"
        >
          <i class="fa-solid fa-arrow-left"></i> Previous
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button 
          class="btn ${i === page ? 'btn-primary' : 'btn-outline'} btn-sm"
          style="min-width:36px; height:36px; padding:0;"
          onclick="Properties.changePage(${i})"
        >
          ${i}
        </button>
      `;
    }

    html += `
        <button 
          class="btn btn-outline btn-sm" 
          ${page >= totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}
          onclick="Properties.changePage(${page + 1})"
        >
          Next <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;

    container.innerHTML = html;
  },

  changePage(newPage) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage);
    window.location.href = url.toString();
  },

  clearAllFilters() {
    window.location.href = '/properties.html';
  }
};
