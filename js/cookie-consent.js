/* ═══════════════════════════════════════════════
   ENTECH LABS — cookie-consent.js (GDPR Engine)
   ═══════════════════════════════════════════════ */

const COOKIE_NAME = "entech_consent_state";

/**
 * Updates GA4 Consent Mode v2 state dynamically
 */
function applyAnalytics(consent) {
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      'analytics_storage': (consent && consent.analytics) ? 'granted' : 'denied',
      'ad_storage': (consent && consent.marketing) ? 'granted' : 'denied',
      'ad_user_data': (consent && consent.marketing) ? 'granted' : 'denied',
      'ad_personalization': (consent && consent.marketing) ? 'granted' : 'denied'
    });
    console.log("[GDPR]: Google Analytics consent updated ->", consent);
  }
}

/**
 * Reads stored consent cookie
 */
function getConsent() {
  const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
  if (match) {
    try { 
      return JSON.parse(decodeURIComponent(match[2])); 
    } catch (e) { 
      return null; 
    }
  }
  return null;
}

/**
 * Saves consent object to 1-year cookie
 */
function setConsent(consentObj) {
  const d = new Date();
  d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 Year TTL
  const value = encodeURIComponent(JSON.stringify(consentObj));
  document.cookie = `${COOKIE_NAME}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Initializes UI listeners and GA4 integration
 */
function initCookieConsent() {
  const modal = document.getElementById('cookieModal');
  if (!modal) return;

  const currentConsent = getConsent();

  // Show modal if no preference saved, otherwise apply saved settings to GA4
  if (!currentConsent) {
    modal.classList.remove('hidden');
  } else {
    applyAnalytics(currentConsent);
  }

  // DOM Elements
  const drawer = modal.querySelector('.cookie-drawer');
  const btnAccept = document.getElementById('btn-accept-all');
  const btnReject = document.getElementById('btn-reject-cookies');
  const btnSave   = document.getElementById('btn-save-cookies');
  const analyticsInput = document.getElementById('cookie-analytics');
  const functionalInput = document.getElementById('cookie-functional');

  // 1. Accordion UI Toggle (Swaps "Essential Only" with "Save Selection")
  if (drawer && btnReject && btnSave) {
    drawer.addEventListener('toggle', () => {
      if (drawer.open) {
        btnReject.classList.add('hidden');
        btnSave.classList.remove('hidden');
      } else {
        btnReject.classList.remove('hidden');
        btnSave.classList.add('hidden');
      }
    });
  }

  // 2. Button Action: Accept All
  if (btnAccept) {
    btnAccept.onclick = () => {
      const state = { 
        necessary: true, 
        analytics: true, 
        marketing: true, 
        timestamp: new Date().toISOString() 
      };
      setConsent(state);
      applyAnalytics(state);
      modal.classList.add('hidden');
    };
  }

  // 3. Button Action: Reject Non-Essential (Essential Only)
  if (btnReject) {
    btnReject.onclick = () => {
      const state = { 
        necessary: true, 
        analytics: false, 
        marketing: false, 
        timestamp: new Date().toISOString() 
      };
      setConsent(state);
      applyAnalytics(state);
      modal.classList.add('hidden');
    };
  }

  // 4. Button Action: Save Custom Selection
  if (btnSave) {
    btnSave.onclick = () => {
      const state = { 
        necessary: true, 
        analytics: analyticsInput ? analyticsInput.checked : false, 
        marketing: functionalInput ? functionalInput.checked : false, 
        timestamp: new Date().toISOString() 
      };
      setConsent(state);
      applyAnalytics(state);
      modal.classList.add('hidden');
    };
  }
}

// Fire initialization on DOM load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initCookieConsent();
} else {
  document.addEventListener('DOMContentLoaded', initCookieConsent);
}