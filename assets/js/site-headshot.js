(function () {
  'use strict';

  function applyHeadshot(url) {
    if (!url || typeof url !== 'string') return;

    document.querySelectorAll('[data-site-headshot]').forEach((el) => {
      try {
        if (el && el.tagName && el.tagName.toLowerCase() === 'img') {
          el.src = url;
        }
      } catch {}
    });

    // Best-effort: update favicon / touch icons too.
    document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((link) => {
      try {
        link.href = url;
      } catch {}
    });
  }

  async function loadHeadshotSetting() {
    try {
      if (!window.firebase || !firebase.firestore) return;
      const db = firebase.firestore();
      const snap = await db.collection('siteContent').doc('global').get();
      if (!snap || !snap.exists) return;
      const data = snap.data() || {};
      if (typeof data.headshotUrl === 'string' && data.headshotUrl.trim()) {
        applyHeadshot(data.headshotUrl.trim());
      }
    } catch (e) {
      // Fail silently; headshot falls back to the local file.
      console.warn('Headshot load failed:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeadshotSetting);
  } else {
    loadHeadshotSetting();
  }
})();
