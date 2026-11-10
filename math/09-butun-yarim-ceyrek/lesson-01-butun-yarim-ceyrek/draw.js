/* Drawings for "Bütün, Yarım ve Çeyrek": shapes split into parts, and foods (whole or a piece).
   Used by the iPad lesson and by the printed worksheet. Everything is plain SVG drawn here:
   no pictures are downloaded. */
(function () {
  'use strict';
  var D = window.D = {};
  var uid = 0;

  /* ---------- Shapes split into parts ---------- */
  // Each code gives the viewBox and the outline of every part.
  function sqStrips(xs) {           // vertical strips of the square 6..94
    var p = [];
    for (var i = 0; i < xs.length - 1; i++) p.push('M' + xs[i] + ' 6H' + xs[i + 1] + 'V94H' + xs[i] + 'Z');
    return p;
  }
  function rcStrips(xs) {           // vertical strips of the rectangle 6..154 x 14..86
    var p = [];
    for (var i = 0; i < xs.length - 1; i++) p.push('M' + xs[i] + ' 14H' + xs[i + 1] + 'V86H' + xs[i] + 'Z');
    return p;
  }
  var C = 'A44 44 0 0 1 ';          // arc of the circle centred at 50,50 with radius 44 (clockwise)
  var SHAPES = {
    sq1:  { vb: '0 0 100 100', p: ['M6 6H94V94H6Z'] },
    sq2v: { vb: '0 0 100 100', p: sqStrips([6, 50, 94]) },
    sq2h: { vb: '0 0 100 100', p: ['M6 6H94V50H6Z', 'M6 50H94V94H6Z'] },
    sq2d: { vb: '0 0 100 100', p: ['M6 6H94V94Z', 'M6 6V94H94Z'] },
    sq2u: { vb: '0 0 100 100', p: sqStrips([6, 32, 94]) },
    sq3v: { vb: '0 0 100 100', p: sqStrips([6, 35.33, 64.67, 94]) },
    sq4g: { vb: '0 0 100 100', p: ['M6 6H50V50H6Z', 'M50 6H94V50H50Z', 'M6 50H50V94H6Z', 'M50 50H94V94H50Z'] },
    sq4v: { vb: '0 0 100 100', p: sqStrips([6, 28, 50, 72, 94]) },
    sq4x: { vb: '0 0 100 100', p: ['M6 6H94L50 50Z', 'M94 6V94L50 50Z', 'M94 94H6L50 50Z', 'M6 94V6L50 50Z'] },
    sq4u: { vb: '0 0 100 100', p: sqStrips([6, 18, 36, 62, 94]) },
    sq4h: { vb: '0 0 100 100', p: ['M6 6H94V28H6Z', 'M6 28H94V50H6Z', 'M6 50H94V72H6Z', 'M6 72H94V94H6Z'] },
    c1:   { vb: '0 0 100 100', p: ['M6 50' + C + '94 50' + C + '6 50Z'] },
    c2:   { vb: '0 0 100 100', p: ['M50 6' + C + '50 94Z', 'M50 94' + C + '50 6Z'] },
    c2h:  { vb: '0 0 100 100', p: ['M6 50' + C + '94 50Z', 'M94 50' + C + '6 50Z'] },
    c2u:  { vb: '0 0 100 100', p: ['M30 10.81A44 44 0 0 0 30 89.19Z', 'M30 10.81A44 44 0 1 1 30 89.19Z'] },
    c3:   { vb: '0 0 100 100', p: ['M50 50L50 6' + C + '88.1 72Z', 'M50 50L88.1 72' + C + '11.9 72Z',
                                   'M50 50L11.9 72' + C + '50 6Z'] },
    c4:   { vb: '0 0 100 100', p: ['M50 50L50 6' + C + '94 50Z', 'M50 50L94 50' + C + '50 94Z',
                                   'M50 50L50 94' + C + '6 50Z', 'M50 50L6 50' + C + '50 6Z'] },
    r1:   { vb: '0 0 160 100', p: ['M6 14H154V86H6Z'] },
    r2v:  { vb: '0 0 160 100', p: rcStrips([6, 80, 154]) },
    r2h:  { vb: '0 0 160 100', p: ['M6 14H154V50H6Z', 'M6 50H154V86H6Z'] },
    r2d:  { vb: '0 0 160 100', p: ['M6 14H154V86Z', 'M6 14V86H154Z'] },
    r2u:  { vb: '0 0 160 100', p: rcStrips([6, 56, 154]) },
    r3v:  { vb: '0 0 160 100', p: rcStrips([6, 55.33, 104.67, 154]) },
    r4v:  { vb: '0 0 160 100', p: rcStrips([6, 43, 80, 117, 154]) },
    r4g:  { vb: '0 0 160 100', p: ['M6 14H80V50H6Z', 'M80 14H154V50H80Z', 'M6 50H80V86H6Z', 'M80 50H154V86H80Z'] },
    t1:   { vb: '0 0 100 100', p: ['M50 8L94 90H6Z'] },
    t2:   { vb: '0 0 100 100', p: ['M50 8L50 90H6Z', 'M50 8L94 90H50Z'] },
    t2u:  { vb: '0 0 100 100', p: ['M50 8L28 90H6Z', 'M50 8L94 90H28Z'] }
  };
  // The ways each shape can be cut into 1, 2 or 4 equal parts (tapping "2" again changes the cut).
  D.CUTS = {
    sq: { 1: ['sq1'], 2: ['sq2v', 'sq2h', 'sq2d'], 4: ['sq4g', 'sq4v', 'sq4x'] },
    c:  { 1: ['c1'], 2: ['c2', 'c2h'], 4: ['c4'] },
    r:  { 1: ['r1'], 2: ['r2v', 'r2h', 'r2d'], 4: ['r4v', 'r4g'] },
    t:  { 1: ['t1'], 2: ['t2'], 4: ['t2'] }
  };
  D.parts = function (code) { return SHAPES[code].p.length; };

  // shaded: list of part numbers to colour. opts: {cls, label, ghostOnly}
  D.shape = function (code, shaded, opts) {
    opts = opts || {};
    var s = SHAPES[code], on = shaded || [];
    var out = '<svg class="shape ' + (opts.cls || '') + '" viewBox="' + s.vb + '" role="img"' +
      (opts.label ? ' aria-label="' + opts.label + '"' : ' aria-hidden="true"') + '>';
    s.p.forEach(function (d, i) {
      out += '<path class="p' + (on.indexOf(i) >= 0 ? ' on' : '') + '" data-i="' + i + '" d="' + d + '"/>';
    });
    return out + '</svg>';
  };

  /* ---------- Foods ---------- */
  function circle(cx, cy, r, fill, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function polar(cx, cy, r, deg) {
    var a = deg * Math.PI / 180;
    return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
  }
  function rays(cx, cy, r, n, color, w) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var p = polar(cx, cy, r, i * 360 / n + 10);
      out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] +
        '" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    }
    return out;
  }
  function ring(cx, cy, r, n, fn) {
    var out = '';
    for (var i = 0; i < n; i++) { var p = polar(cx, cy, r, i * 360 / n + 20); out += fn(p[0], p[1], i); }
    return out;
  }
  // Round foods seen from above (or cut across): drawn as a disk around cx, cy with radius r.
  var DISKS = {
    pizza: function (x, y, r) {
      return circle(x, y, r, '#D9822B') + circle(x, y, r - 6, '#FFD43B') +
        ring(x, y, r * 0.55, 6, function (a, b) { return circle(a, b, 6.5, '#E03131'); }) +
        ring(x, y, r * 0.22, 2, function (a, b) { return circle(a, b, 4.5, '#2B8A3E'); });
    },
    orange: function (x, y, r) {
      return circle(x, y, r, '#F76707') + circle(x, y, r - 4, '#FFA94D') +
        rays(x, y, r - 5, 10, '#FFE8CC', 2) + circle(x, y, 3.5, '#FFF4E6');
    },
    lemon: function (x, y, r) {
      return circle(x, y, r, '#F59F00') + circle(x, y, r - 4, '#FFEC99') +
        rays(x, y, r - 5, 9, '#FFFFFF', 2.2) + circle(x, y, 3.5, '#FFFFFF');
    },
    kiwi: function (x, y, r) {
      return circle(x, y, r, '#8C6239') + circle(x, y, r - 4, '#82C91E') +
        circle(x, y, r * 0.3, '#F4FCE3') +
        ring(x, y, r * 0.45, 16, function (a, b, i) {
          var p = polar(0, 0, 1, i * 22.5 + 20);
          return '<ellipse cx="' + a + '" cy="' + b + '" rx="1.6" ry="3.2" fill="#212529" transform="rotate(' +
            (Math.atan2(p[1], p[0]) * 180 / Math.PI + 90).toFixed(1) + ' ' + a + ' ' + b + ')"/>';
        });
    },
    watermelon: function (x, y, r) {
      return circle(x, y, r, '#2B8A3E') + circle(x, y, r - 4, '#D8F5A2') + circle(x, y, r - 8, '#FA5252') +
        ring(x, y, r * 0.55, 8, function (a, b) { return '<ellipse cx="' + a + '" cy="' + b + '" rx="2" ry="3.2" fill="#212529"/>'; }) +
        ring(x, y, r * 0.25, 3, function (a, b) { return '<ellipse cx="' + a + '" cy="' + b + '" rx="2" ry="3.2" fill="#212529"/>'; });
    },
    cake: function (x, y, r) {
      return circle(x, y, r, '#F3D9B1') + circle(x, y, r - 5, '#F783AC') +
        ring(x, y, r - 9, 12, function (a, b) { return circle(a, b, 3, '#FFFFFF'); }) +
        ring(x, y, r * 0.42, 4, function (a, b) { return circle(a, b, 5, '#C2255C'); }) +
        circle(x, y, 6, '#C2255C');
    },
    cookie: function (x, y, r) {
      return circle(x, y, r, '#D9A066') + circle(x, y, r - 4, '#E8B77D') +
        ring(x, y, r * 0.6, 7, function (a, b) { return circle(a, b, 4, '#5C3A1E'); }) +
        ring(x, y, r * 0.25, 3, function (a, b) { return circle(a, b, 3.5, '#5C3A1E'); });
    }
  };
  // A slice of bread seen from above, drawn in the square x..x+s, y..y+s.
  function toast(x, y, s) {
    return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="10" fill="#B9733A"/>' +
      '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (s - 12) + '" height="' + (s - 12) +
      '" rx="7" fill="#F5D7A1"/>' +
      [[.3, .3], [.7, .25], [.5, .55], [.25, .75], [.75, .7]].map(function (q) {
        return circle(x + s * q[0], y + s * q[1], 2, '#D9A066');
      }).join('');
  }
  // Foods that are only ever shown whole (never cut).
  var WHOLES = {
    apple: '<path d="M50 30c-10-8-34-6-34 22 0 22 16 38 26 38 4 0 6-2 8-2s4 2 8 2c10 0 26-16 26-38 0-28-24-30-34-22z" fill="#E03131"/>' +
      '<path d="M50 30c0-8 2-14 6-18" stroke="#5C3A1E" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M56 18c8-8 18-6 20-4-4 8-12 10-20 4z" fill="#37B24D"/>' +
      '<ellipse cx="32" cy="48" rx="5" ry="9" fill="#FFFFFF" opacity=".35"/>',
    orangeball: circle(50, 54, 38, '#F76707') + circle(38, 42, 7, '#FFFFFF', ' opacity=".25"') +
      '<path d="M50 16c2-6 8-8 14-6-2 6-8 8-14 6z" fill="#37B24D"/>' + circle(50, 17, 2.5, '#5C3A1E'),
    egg: '<ellipse cx="50" cy="54" rx="30" ry="38" fill="#FFF3E0" stroke="#E0C9A6" stroke-width="2"/>' +
      '<ellipse cx="40" cy="42" rx="6" ry="10" fill="#FFFFFF"/>',
    ball: '<defs><clipPath id="ballclip"><circle cx="50" cy="50" r="40"/></clipPath></defs>' +
      '<g clip-path="url(#ballclip)">' + circle(50, 50, 40, '#FFFFFF') +
      '<path d="M50 10C30 30 30 70 50 90L0 90V10Z" fill="#FA5252"/>' +
      '<path d="M50 10C70 30 70 70 50 90L100 90V10Z" fill="#339AF0"/>' +
      '<path d="M50 10C42 30 42 70 50 90C58 70 58 30 50 10Z" fill="#FCC419"/></g>' +
      circle(50, 50, 40, 'none', ' stroke="#495057" stroke-width="2"') + circle(38, 34, 6, '#FFFFFF', ' opacity=".6"'),
    eraser: '<g transform="rotate(-18 50 50)"><rect x="12" y="32" width="76" height="36" rx="6" fill="#FFFFFF" stroke="#ADB5BD" stroke-width="2"/>' +
      '<rect x="38" y="32" width="50" height="36" rx="2" fill="#4263EB"/><rect x="38" y="44" width="50" height="5" fill="#FFFFFF" opacity=".7"/></g>',
    plum: '<ellipse cx="50" cy="54" rx="34" ry="36" fill="#5F3DC4"/><path d="M50 22c2 10 2 50 0 66" stroke="#3B2585" stroke-width="2" fill="none"/>' +
      '<path d="M50 22c0-6 2-10 6-14" stroke="#5C3A1E" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="34" cy="44" rx="5" ry="10" fill="#FFFFFF" opacity=".3"/>'
  };
  var NAMES = {
    pizza: 'pizza', orange: 'portakal', lemon: 'limon', kiwi: 'kivi', watermelon: 'karpuz', cake: 'pasta',
    cookie: 'kurabiye', toast: 'ekmek', apple: 'elma', orangeball: 'portakal', egg: 'yumurta', ball: 'top',
    eraser: 'silgi', plum: 'erik'
  };
  D.name = function (food) { return NAMES[food]; };

  // food: a name from above. portion: 'whole', 'half', 'quarter' (and for toast also 'halfTri').
  // opts.ghost: show the missing part of the whole as a dashed outline.
  D.food = function (food, portion, opts) {
    opts = opts || {};
    var label = NAMES[food] + (portion === 'half' || portion === 'halfTri' ? ' (yarım)' :
      portion === 'quarter' ? ' (çeyrek)' : '');
    var out = '<svg class="food" viewBox="0 0 100 100" role="img" aria-label="' + label + '">';
    if (WHOLES[food]) return out + WHOLES[food] + '</svg>';
    var id = 'clip' + (++uid), clip, body, ghost;
    if (food === 'toast') {
      var box = { whole: [10, 10, 10, 10, 80, 80], half: [30, 10, 30, 10, 40, 80],
                  quarter: [22, 22, 22, 22, 56, 56], halfTri: [10, 10] }[portion];
      if (portion === 'quarter') {           // a quarter alone is drawn a little larger, so it is easy to see
        clip = '<rect x="22" y="22" width="56" height="56"/>';
        body = toast(22, 22, 112);
        ghost = '<rect x="22" y="22" width="112" height="112" rx="10"/>';
      } else if (portion === 'halfTri') {
        clip = '<path d="M6 6L94 94H6Z"/>';
        body = toast(10, 10, 80);
        ghost = '<rect x="10" y="10" width="80" height="80" rx="10"/>';
      } else {
        clip = '<rect x="' + box[2] + '" y="' + box[3] + '" width="' + box[4] + '" height="' + box[5] + '"/>';
        body = toast(box[0], box[1], 80);
        ghost = '<rect x="' + box[0] + '" y="' + box[1] + '" width="80" height="80" rx="10"/>';
      }
    } else {
      // With a ghost outline the piece stays in its place inside the whole; without, it is centred.
      var c = opts.ghost ? [50, 50] : { whole: [50, 50], half: [50, 70], quarter: [22, 78] }[portion];
      var r = !opts.ghost && portion === 'quarter' ? 56 : 44, R = r + 1;   // a quarter alone: a little larger
      clip = portion === 'whole' ? circle(50, 50, 45, '#000') :
        portion === 'half' ? '<path d="M' + (c[0] - R) + ' ' + c[1] + 'A' + R + ' ' + R + ' 0 0 1 ' + (c[0] + R) + ' ' + c[1] + 'Z"/>' :
        '<path d="M' + c[0] + ' ' + c[1] + 'L' + c[0] + ' ' + (c[1] - R) + 'A' + R + ' ' + R + ' 0 0 1 ' + (c[0] + R) + ' ' + c[1] + 'Z"/>';
      body = DISKS[food](c[0], c[1], r);
      ghost = '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + r + '"/>';
    }
    if (opts.ghost && portion !== 'whole') {
      out += '<g fill="none" stroke="#868E96" stroke-width="2" stroke-dasharray="5 5">' + ghost + '</g>';
    }
    return out + '<defs><clipPath id="' + id + '">' + clip + '</clipPath></defs>' +
      '<g clip-path="url(#' + id + ')">' + body + '</g></svg>';
  };

  /* ---------- Fractions ---------- */
  D.frac = function (n, d) {
    return '<span class="frac" aria-label="' + d + "'" + (d === 4 ? 'te' : 'de') + ' ' + n + '">' +
      '<span>' + n + '</span><span>' + d + '</span></span>';
  };
  D.READ = { 1: 'Birde bir', 2: 'İkide bir', 4: 'Dörtte bir' };
  D.WORD = { 1: 'Bütün', 2: 'Yarım', 4: 'Çeyrek' };
})();
