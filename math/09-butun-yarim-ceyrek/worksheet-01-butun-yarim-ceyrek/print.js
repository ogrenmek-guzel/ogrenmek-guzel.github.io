/* Fills in the drawings of the printed worksheet. Opened with "?answers" it shows the answer key. */
(function () {
  'use strict';
  var D = window.D;
  var key = /answers/.test(location.search);
  if (key) {
    document.documentElement.classList.add('key');
    document.title = 'Bütün, Yarım ve Çeyrek - Cevap Anahtarı';
  }
  function list(v) { return v ? v.split(',').map(Number) : []; }

  // <div data-food="pizza:quarter:ghost">
  document.querySelectorAll('[data-food]').forEach(function (el) {
    var a = el.getAttribute('data-food').split(':');
    el.innerHTML = D.food(a[0], a[1], { ghost: a[2] === 'ghost' });
  });
  // <div data-shape="sq1" data-on="0" data-key="sq2v:0" data-cls="empty">
  document.querySelectorAll('[data-shape]').forEach(function (el) {
    var code = el.getAttribute('data-shape'), on = list(el.getAttribute('data-on'));
    var cls = el.getAttribute('data-cls') || '';
    var k = el.getAttribute('data-key');
    if (key && k) {
      var b = k.split(':');
      code = b[0];
      on = list(b[1]);
      cls = cls.replace('empty', '');
    }
    el.innerHTML = D.shape(code, on, { cls: cls });
  });
  // <span data-frac="1/2"> : a fraction;  <span class="fbox" data-ans="1/4"> : boxes to fill in
  document.querySelectorAll('[data-frac]').forEach(function (el) {
    var f = el.getAttribute('data-frac').split('/');
    el.innerHTML = D.frac(f[0], f[1]);
  });
  document.querySelectorAll('.fbox').forEach(function (el) {
    var f = (el.getAttribute('data-ans') || '/').split('/');
    var show = key || el.classList.contains('example');
    el.innerHTML = '<span class="b">' + (show ? f[0] : '') + '</span><span class="b">' + (show ? f[1] : '') + '</span>';
  });
})();
