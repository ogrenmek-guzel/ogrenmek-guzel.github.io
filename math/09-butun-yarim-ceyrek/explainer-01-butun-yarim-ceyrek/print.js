/* Fills in the drawings of the printed explainer (same drawings as the iPad lessons). */
(function () {
  'use strict';
  var D = window.D, uid = 0;
  function list(v) { return v ? v.split(',').map(Number) : []; }
  var PIECES = {
    2: [['M50 5A45 45 0 0 0 50 95Z', -6, 0], ['M50 5A45 45 0 0 1 50 95Z', 6, 0]],
    4: [['M50 50L50 5A45 45 0 0 0 5 50Z', -5, -5], ['M50 50L50 5A45 45 0 0 1 95 50Z', 5, -5],
        ['M50 50L95 50A45 45 0 0 1 50 95Z', 5, 5], ['M50 50L50 95A45 45 0 0 1 5 50Z', -5, 5]]
  };
  // <div data-split="pizza:4"> : a round food cut into 2 or 4 equal pieces, pulled a little apart
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var a = el.getAttribute('data-split').split(':'), out = '';
    PIECES[a[1]].forEach(function (p) {
      var id = 'sp' + (++uid);
      out += '<g transform="translate(' + p[1] + ' ' + p[2] + ')"><defs><clipPath id="' + id + '"><path d="' + p[0] +
        '"/></clipPath></defs><g clip-path="url(#' + id + ')">' + D.disk(a[0], 50, 50, 44) + '</g></g>';
    });
    el.innerHTML = '<svg class="food" viewBox="-8 -8 116 116">' + out + '</svg>';
  });
  document.querySelectorAll('[data-food]').forEach(function (el) {
    var a = el.getAttribute('data-food').split(':');
    el.innerHTML = D.food(a[0], a[1], { ghost: a[2] === 'ghost' });
  });
  document.querySelectorAll('[data-shape]').forEach(function (el) {
    el.innerHTML = D.shape(el.getAttribute('data-shape'), list(el.getAttribute('data-on')),
      { cls: el.getAttribute('data-cls') || '' });
  });
  document.querySelectorAll('[data-frac]').forEach(function (el) {
    var f = el.getAttribute('data-frac').split('/');
    el.innerHTML = D.frac(f[0], f[1]);
  });
})();
