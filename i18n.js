/**
 * i18n.js — Language switching for Wise Financial Cambodia calculators
 * Reads strings from window.WFC_STRINGS (lang.js must load first)
 * Public API: window.WFC = { t, setLang, getLang, applyLang }
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'wfc-lang';
  var SUPPORTED   = ['en', 'km'];

  /* ─── core helpers ──────────────────────────────────────── */

  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    return (stored && SUPPORTED.indexOf(stored) !== -1) ? stored : 'en';
  }

  function t(key) {
    var lang    = getLang();
    var strings = window.WFC_STRINGS || {};
    var bucket  = strings[lang]      || {};
    var en      = (strings['en']     || {})[key];
    return bucket[key] !== undefined ? bucket[key] : (en !== undefined ? en : key);
  }

  /* ─── applyLang ─────────────────────────────────────────── */

  function applyLang(lang) {
    if (!lang || SUPPORTED.indexOf(lang) === -1) lang = 'en';

    var strings = window.WFC_STRINGS || {};
    var bucket  = strings[lang]      || {};
    var en      = strings['en']      || {};

    function val(key) {
      return bucket[key] !== undefined ? bucket[key] : (en[key] !== undefined ? en[key] : key);
    }

    /* plain-text elements */
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el  = els[i];
      var key = el.getAttribute('data-i18n');
      /* \n → visual line-break only in elements that use pre-line */
      el.textContent = val(key);
    }

    /* html elements (e.g. print note with <strong>) */
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlEls.length; j++) {
      var hel  = htmlEls[j];
      var hkey = hel.getAttribute('data-i18n-html');
      hel.innerHTML = val(hkey);
    }

    /* <option data-i18n="key"> */
    var opts = document.querySelectorAll('option[data-i18n]');
    for (var k = 0; k < opts.length; k++) {
      var opt  = opts[k];
      var okey = opt.getAttribute('data-i18n');
      opt.text = val(okey);
    }

    /* document <title> */
    var titleKey = document.documentElement.getAttribute('data-title-key');
    if (titleKey) {
      document.title = val(titleKey) + ' | Wise Financial Cambodia';
    }

    /* lang-btn active state */
    var btns = document.querySelectorAll('.lang-btn');
    for (var b = 0; b < btns.length; b++) {
      var btn = btns[b];
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }

    /* html root lang attribute and Khmer font class */
    document.documentElement.lang = lang;
    if (lang === 'km') {
      document.documentElement.classList.add('lang-km');
    } else {
      document.documentElement.classList.remove('lang-km');
    }
  }

  /* ─── setLang ───────────────────────────────────────────── */

  function setLang(lang) {
    if (!lang || SUPPORTED.indexOf(lang) === -1) lang = 'en';
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
    /* refresh dynamic content if the page has a calculate function */
    if (typeof window.calculate === 'function') {
      try { window.calculate(); } catch (e) { /* ignore */ }
    }
  }

  /* ─── auto-init on DOM ready ─────────────────────────────── */

  function init() {
    applyLang(getLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ─── public API ─────────────────────────────────────────── */

  window.WFC = {
    t:          t,
    setLang:    setLang,
    getLang:    getLang,
    applyLang:  applyLang
  };

})();
