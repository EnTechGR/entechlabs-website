/* ═══════════════════════════════════════════════
   ENTECH LABS — cookie-consent.js (GDPR Engine)
   ═══════════════════════════════════════════════ */

const COOKIE_NAME = "entech_consent_state";

function applyAnalytics(consent) {
  if (typeof gtag === 'function') {
    // Dynamically update GA4 consent based on user choices
    gtag('consent', 'update', {
      'analytics_storage': (consent && consent.analytics) ? 'granted' : 'denied',
      'ad_storage': (consent && consent.marketing) ? 'granted' : 'denied',
      'ad_user_data': (consent && consent.marketing) ? 'granted' : 'denied',
      'ad_personalization': (consent && consent.marketing) ? 'granted' : 'denied'
    });
    console.log("[GDPR]: Google Analytics consent state updated:", consent);
  }
}

function getConsent() {
  const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
  if (match) {
    try { return JSON.parse(decodeURIComponent(match[2])); } catch (e) { return null; }
  }
  return null;
}

function setConsent(consentObj) {
  const d = new Date();
  d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 Year TTL
  const value = encodeURIComponent(JSON.stringify(consentObj));
  document.cookie = `${COOKIE_NAME}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

function initCookieConsent() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const currentConsent = getConsent();

  if (!currentConsent) {
    banner.classList.remove('hidden');
  } else {
    applyAnalytics(currentConsent);
  }

  const btnAccept = document.getElementById('btn-cookie-accept');
  const btnReject = document.getElementById('btn-cookie-reject');
  const btnSave   = document.getElementById('btn-cookie-save');

  if (btnAccept) {
    btnAccept.onclick = () => {
      const state = { necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
      setConsent(state);
      applyAnalytics(state);
      banner.classList.add('hidden');
    };
  }

  if (btnReject) {
    btnReject.onclick = () => {
      const state = { necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
      setConsent(state);
      applyAnalytics(state);
      banner.classList.add('hidden');
    };
  }

  if (btnSave) {
    btnSave.onclick = () => {
      const analyticsChecked = document.getElementById('cookie-analytics')?.checked || false;
      const marketingChecked = document.getElementById('cookie-marketing')?.checked || false;
      const state = { necessary: true, analytics: analyticsChecked, marketing: marketingChecked, timestamp: new Date().toISOString() };
      setConsent(state);
      applyAnalytics(state);
      banner.classList.add('hidden');
    };
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initCookieConsent();
} else {
  document.addEventListener('DOMContentLoaded', initCookieConsent);
}