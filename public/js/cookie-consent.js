/* ============================================================
   Cookie Consent Banner (LGPD)
   Shared across all public pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const btnAcceptAll = document.getElementById('cookie-accept-all');
  const btnMinimal = document.getElementById('cookie-accept-minimal');
  const btnCustomize = document.getElementById('cookie-customize');

  const modalOverlay = document.getElementById('cookie-modal-overlay');
  const btnSavePrefs = document.getElementById('cookie-save-preferences');
  const btnModalAcceptAll = document.getElementById('cookie-modal-accept-all');
  const btnCloseModal = document.getElementById('cookie-modal-close');
  const toggleAnalytics = document.getElementById('cookie-toggle-analytics');
  const toggleMarketing = document.getElementById('cookie-toggle-marketing');

  function getCookieConsent() {
    try {
      return localStorage.getItem('cookie_consent');
    } catch (e) {
      return null;
    }
  }

  function saveCookieConsent(type, categories) {
    const consentData = {
      type,
      categories,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    try {
      localStorage.setItem('cookie_consent', JSON.stringify(consentData));
    } catch (e) { /* localStorage unavailable */ }

    fetch('/api/cookie-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...consentData, pageUrl: window.location.pathname })
    }).catch(() => {});

    window.dispatchEvent(new Event('cookie-consent-saved'));
    banner.classList.remove('visible');
    if (modalOverlay) modalOverlay.classList.remove('visible');
  }

  if (!getCookieConsent()) {
    setTimeout(() => banner.classList.add('visible'), 1500);
  }

  if (btnAcceptAll) {
    btnAcceptAll.addEventListener('click', () => {
      saveCookieConsent('all', { necessary: true, analytics: true, marketing: true });
    });
  }

  if (btnMinimal) {
    btnMinimal.addEventListener('click', () => {
      saveCookieConsent('necessary', { necessary: true, analytics: false, marketing: false });
    });
  }

  if (btnCustomize && modalOverlay) {
    btnCustomize.addEventListener('click', () => {
      modalOverlay.classList.add('visible');
    });
  }

  if (btnCloseModal && modalOverlay) {
    btnCloseModal.addEventListener('click', () => {
      modalOverlay.classList.remove('visible');
    });
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('visible');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modalOverlay.classList.remove('visible');
    });
  }

  if (btnModalAcceptAll) {
    btnModalAcceptAll.addEventListener('click', () => {
      saveCookieConsent('all', { necessary: true, analytics: true, marketing: true });
    });
  }

  if (btnSavePrefs) {
    btnSavePrefs.addEventListener('click', () => {
      const categories = {
        necessary: true,
        analytics: toggleAnalytics ? toggleAnalytics.checked : false,
        marketing: toggleMarketing ? toggleMarketing.checked : false
      };
      const allAccepted = categories.analytics && categories.marketing;
      const noneAccepted = !categories.analytics && !categories.marketing;
      const type = allAccepted ? 'all' : (noneAccepted ? 'necessary' : 'custom');
      saveCookieConsent(type, categories);
    });
  }
});
