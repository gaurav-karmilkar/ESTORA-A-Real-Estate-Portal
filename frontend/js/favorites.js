/**
 * ESTORA Favorites State & Interaction Manager
 */

const Favorites = {
  savedIds: new Set(),

  async init() {
    if (!Auth.isLoggedIn()) return;
    try {
      const res = await ApiService.getFavoriteIds();
      if (res.data) {
        this.savedIds = new Set(res.data);
        this.updateButtonsUI();
      }
    } catch (e) {
      console.error('Error fetching favorites:', e);
    }
  },

  isFavorite(propertyId) {
    return this.savedIds.has(Number(propertyId));
  },

  getFavorites() {
    return Array.from(this.savedIds);
  },

  async toggleFavorite(propertyId, btnEl) {
    if (!Auth.isLoggedIn()) {
      Utils.showToast('Please sign in to save properties to your favorites.', 'info');
      setTimeout(() => {
        window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      }, 1000);
      return;
    }

    const id = Number(propertyId);
    const isFav = this.isFavorite(id);

    try {
      if (isFav) {
        await ApiService.removeFavorite(id);
        this.savedIds.delete(id);
        Utils.showToast('Removed from saved properties', 'info');
      } else {
        await ApiService.addFavorite(id);
        this.savedIds.add(id);
        Utils.showToast('Property saved to favorites!', 'success');
      }

      this.updateButtonsUI();
      Auth.updateFavCountBadge();

      // If on favorites page, re-fetch
      if (window.location.pathname.includes('favorites.html')) {
        window.dispatchEvent(new Event('estora-favorites-updated'));
      }
    } catch (err) {
      Utils.showToast(err.message || 'Failed to update favorite', 'error');
    }
  },

  updateButtonsUI() {
    const btns = document.querySelectorAll('[data-fav-property-id]');
    btns.forEach(btn => {
      const id = Number(btn.getAttribute('data-fav-property-id'));
      const icon = btn.querySelector('i');
      if (this.savedIds.has(id)) {
        btn.classList.add('active');
        if (icon) {
          icon.className = 'fa-solid fa-heart';
          icon.style.color = 'var(--danger)';
        }
      } else {
        btn.classList.remove('active');
        if (icon) {
          icon.className = 'fa-regular fa-heart';
          icon.style.color = '';
        }
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Favorites.init();
});
