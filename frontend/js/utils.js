/**
 * ESTORA Real Estate Portal - Utility Functions
 */

const Utils = {
  /**
   * Format price in Indian Rupee format or international
   */
  formatPrice(price, listingType = 'BUY') {
    if (price === null || price === undefined || isNaN(price)) return '₹0';
    
    const num = Number(price);
    let formatted = '';

    if (listingType === 'RENT') {
      formatted = `₹${num.toLocaleString('en-IN')}`;
      return `${formatted} <span class="price-period">/ month</span>`;
    }

    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${cr} Cr`;
    } else if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakh} Lakh`;
    } else {
      return `₹${num.toLocaleString('en-IN')}`;
    }
  },

  /**
   * Format area with sq.ft
   */
  formatArea(sqft) {
    if (!sqft) return 'N/A';
    return `${Number(sqft).toLocaleString('en-IN')} sq.ft`;
  },

  /**
   * Format date to readable string
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Toast notification system
   */
  showToast(message, type = 'info', title = '') {
    let container = document.getElementById('estora-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'estora-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: 'fa-solid fa-circle-check',
      error: 'fa-solid fa-triangle-exclamation',
      info: 'fa-solid fa-circle-info'
    };

    const titleText = title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification');

    toast.innerHTML = `
      <i class="${iconMap[type] || iconMap.info}" style="margin-top:2px; font-size:1.1rem; color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'}"></i>
      <div class="toast-content">
        <div class="toast-title">${titleText}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  },

  /**
   * Debounce helper
   */
  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  /**
   * Escape HTML to prevent XSS in rendering
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Get Amenity Icon
   */
  getAmenityIcon(amenity) {
    const map = {
      'Parking': 'fa-solid fa-square-parking',
      'Gym': 'fa-solid fa-dumbbell',
      'Swimming Pool': 'fa-solid fa-person-swimming',
      'Security': 'fa-solid fa-shield-halved',
      'Balcony': 'fa-solid fa-tree-city',
      'Garden': 'fa-solid fa-seedling',
      'Power Backup': 'fa-solid fa-bolt',
      'Lift': 'fa-solid fa-elevator',
      'Clubhouse': 'fa-solid fa-champagne-glasses'
    };
    return map[amenity] || 'fa-solid fa-check';
  }
};
