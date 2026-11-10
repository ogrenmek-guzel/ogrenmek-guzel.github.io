/* Shared script for every page. No outside connections. */
(function () {
  'use strict';
  var root = document.body.getAttribute('data-root') || './';

  // Offline support: only on the real https website (not while previewing on the Mac,
  // so drafts are never stuck in an old copy).
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register(root + 'sw.js').catch(function () {});
  }

  // Tap to hear: tapping an element with data-say reads it aloud with the iPad's own voices.
  // data-say="" reads the element's text; data-say="some words" reads those words.
  // The language comes from the nearest lang attribute (en-US on English pages).
  var EL = window.EL = window.EL || {};
  EL.say = function (text, lang) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || 'en-US';
    u.rate = 0.85;
    var voices = window.speechSynthesis.getVoices().filter(function (v) { return v.lang === u.lang; });
    if (voices.length) u.voice = voices[0];
    window.speechSynthesis.speak(u);
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-say]') : null;
    if (!el) return;
    var text = el.getAttribute('data-say') || el.textContent.trim();
    var langEl = el.closest('[lang]');
    EL.say(text, langEl ? langEl.getAttribute('lang') : 'en-US');
  });
})();
