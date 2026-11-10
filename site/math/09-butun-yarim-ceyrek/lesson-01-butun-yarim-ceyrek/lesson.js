/* Bütün, Yarım ve Çeyrek: one activity at a time, in the order of the book (pages 86-91),
   then a few new-style questions ("Düşünelim"). */
(function () {
  'use strict';
  var D = window.D;
  var NS = 'http://www.w3.org/2000/svg';

  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  var F = { 1: D.frac(1, 1), 2: D.frac(1, 2), 4: D.frac(1, 4) };
  var WORDS = ['Bütün', 'Yarım', 'Çeyrek'];
  var FRACS = [F[1], F[2], F[4]];
  var READS = ['Birde bir', 'İkide bir', 'Dörtte bir'];

  /* ================= Building blocks =================
     Every block returns {missing(), check(), reveal()}:
     missing: something is not answered yet; check: true if all correct (and marks right/wrong);
     reveal: shows the correct answer. */

  function all(list) {
    return {
      missing: function () { return list.some(function (c) { return c.missing(); }); },
      check: function () { return list.map(function (c) { return c.check(); }).every(Boolean); },
      reveal: function () { list.forEach(function (c) { c.reveal(); }); }
    };
  }

  // A row of answer buttons; only one can be chosen.
  function choice(opts, answer, cls) {
    var g = h('div', 'seg' + (cls ? ' ' + cls : ''));
    g.setAttribute('role', 'group');
    var chosen = -1;
    opts.forEach(function (o, i) {
      var b = h('button', 'opt', o);
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        chosen = i;
        g.classList.remove('good', 'bad');
        each(g.children, function (c, j) { c.setAttribute('aria-pressed', String(j === i)); });
      });
      g.appendChild(b);
    });
    return {
      el: g,
      missing: function () { return chosen < 0; },
      check: function () {
        var ok = chosen === answer;
        g.classList.toggle('good', ok);
        g.classList.toggle('bad', !ok);
        return ok;
      },
      reveal: function () { g.children[answer].click(); g.classList.remove('bad'); g.classList.add('good'); }
    };
  }

  // Cards: a picture and/or text, then one or more rows of answer buttons.
  function cards(box, items, cls) {
    var wrap = h('div', 'cards' + (cls ? ' ' + cls : ''));
    var ctrls = [];
    items.forEach(function (it) {
      var c = h('div', 'card');
      if (it.pic) c.appendChild(h('div', 'pic', it.pic));
      if (it.text) c.appendChild(h('p', 'txt', it.text));
      it.groups.forEach(function (g) {
        var s = choice(g[0], g[1], g[2]);
        ctrls.push(s);
        c.appendChild(s.el);
      });
      wrap.appendChild(c);
    });
    box.appendChild(wrap);
    return all(ctrls);
  }

  // A table like the book's: first column a picture, then one column per question.
  function table(box, heads, items) {
    var t = h('div', 'tbl');
    t.style.gridTemplateColumns = 'minmax(110px, 140px) repeat(' + (heads.length - 1) + ', minmax(0, 1fr))';
    heads.forEach(function (x) { t.appendChild(h('div', 'th', x)); });
    var ctrls = [];
    items.forEach(function (it) {
      t.appendChild(h('div', 'td pic', it.pic));
      it.groups.forEach(function (g) {
        var s = choice(g[0], g[1], 'vert');
        var cell = h('div', 'td');
        cell.appendChild(s.el);
        t.appendChild(cell);
        ctrls.push(s);
      });
    });
    var wrap = h('div', 'tbl-wrap');
    wrap.appendChild(t);
    box.appendChild(wrap);
    return all(ctrls);
  }

  // Cut a shape into 1, 2 or 4 equal parts, then tap a part to colour it.
  function builder(box, tasks) {
    var wrap = h('div', 'cards build');
    var ctrls = tasks.map(function (t) {
      var c = h('div', 'card');
      c.appendChild(h('div', 'target', t.label));
      var art = h('div', 'art');
      c.appendChild(art);
      var bar = h('div', 'seg cutbar');
      c.appendChild(bar);
      var cuts = D.CUTS[t.shape];
      var st = { n: 1, k: 0, code: cuts[1][0], on: [] };
      function draw() {
        art.innerHTML = D.shape(st.code, st.on, { cls: 'tap' });
        each(art.querySelectorAll('.p'), function (p) {
          p.addEventListener('click', function () {
            var i = +p.getAttribute('data-i'), at = st.on.indexOf(i);
            if (at >= 0) st.on.splice(at, 1); else st.on.push(i);
            c.classList.remove('good', 'bad');
            draw();
          });
        });
        each(bar.children, function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-n') === st.n)); });
      }
      [[1, 'Bölme'], [2, '2 eş parça'], [4, '4 eş parça']].forEach(function (x) {
        var b = h('button', 'opt', x[1]);
        b.type = 'button';
        b.setAttribute('data-n', x[0]);
        b.addEventListener('click', function () {
          var list = cuts[x[0]];
          st.k = st.n === x[0] ? (st.k + 1) % list.length : 0;   // tap again: cut another way
          st.n = x[0];
          st.code = list[st.k];
          st.on = [];
          c.classList.remove('good', 'bad');
          draw();
        });
        bar.appendChild(b);
      });
      draw();
      wrap.appendChild(c);
      return {
        missing: function () { return st.on.length === 0; },
        check: function () {
          var ok = st.n === t.target && st.on.length === 1;
          c.classList.toggle('good', ok);
          c.classList.toggle('bad', !ok);
          return ok;
        },
        reveal: function () {
          st.n = t.target; st.k = 0; st.code = cuts[t.target][0]; st.on = [0];
          draw();
          c.classList.remove('bad');
          c.classList.add('good');
        }
      };
    });
    box.appendChild(wrap);
    return all(ctrls);
  }

  // Write a fraction: tap a box, then tap a number.
  function writer(box, items) {
    var wrap = h('div', 'cards write');
    var cells = [], cur = null, rows = [];
    function select(b) {
      cells.forEach(function (x) { x.classList.remove('sel'); });
      cur = b;
      if (b) b.classList.add('sel');
    }
    function cell(label) {
      var b = h('button', 'cell', '');
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.addEventListener('click', function () { select(b); });
      cells.push(b);
      return b;
    }
    items.forEach(function (it) {
      var c = h('div', 'card');
      c.appendChild(h('div', 'pic', it.pic));
      var f = h('div', 'fin');
      var top = cell('Boyanan parça sayısı'), bot = cell('Toplam parça sayısı');
      f.appendChild(top);
      f.appendChild(h('span', 'fline'));
      f.appendChild(bot);
      c.appendChild(f);
      wrap.appendChild(c);
      rows.push({ c: c, top: top, bot: bot, n: it.n, d: it.d });
    });
    box.appendChild(wrap);
    var pad = h('div', 'pad');
    pad.appendChild(h('span', 'pad-label', 'Sayılar:'));
    [1, 2, 3, 4].forEach(function (n) {
      var b = h('button', 'opt num', String(n));
      b.type = 'button';
      b.addEventListener('click', function () {
        if (!cur) select(cells.filter(function (x) { return !x.textContent; })[0] || null);
        if (!cur) return;
        cur.textContent = n;
        rows.forEach(function (r) { if (r.top === cur || r.bot === cur) r.c.classList.remove('good', 'bad'); });
        var at = cells.indexOf(cur), next = null;
        for (var i = 1; i <= cells.length; i++) {
          var x = cells[(at + i) % cells.length];
          if (!x.textContent) { next = x; break; }
        }
        select(next);
      });
      pad.appendChild(b);
    });
    box.appendChild(pad);
    select(cells[0]);
    return {
      missing: function () { return cells.some(function (x) { return !x.textContent; }); },
      check: function () {
        return rows.map(function (r) {
          var ok = r.top.textContent === String(r.n) && r.bot.textContent === String(r.d);
          r.c.classList.toggle('good', ok);
          r.c.classList.toggle('bad', !ok);
          return ok;
        }).every(Boolean);
      },
      reveal: function () {
        rows.forEach(function (r) { r.top.textContent = r.n; r.bot.textContent = r.d; r.c.classList.remove('bad'); r.c.classList.add('good'); });
        select(null);
      }
    };
  }

  // Match with lines: tap something on one side, then its partner on the other side.
  function match(box, left, right, answer, layout) {
    var wrap = h('div', 'match ' + layout);
    var A = h('div', 'm-side a'), B = h('div', 'm-side b');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'lines');
    svg.setAttribute('aria-hidden', 'true');
    wrap.appendChild(svg);
    wrap.appendChild(A);
    wrap.appendChild(B);
    var pairs = {}, marks = null, sel = null;
    var COLORS = ['#2F6FDE', '#E8590C', '#2B8A3E', '#AE3EC9'];
    function item(html, side, i) {
      var b = h('button', 'm-item', html + '<span class="dot"></span>');
      b.type = 'button';
      b.addEventListener('click', function () {
        marks = null;
        if (sel && sel.side !== side) {
          var a = side === 'a' ? i : sel.i, r = side === 'b' ? i : sel.i;
          Object.keys(pairs).forEach(function (k) { if (pairs[k] === r) delete pairs[k]; });
          pairs[a] = r;
          sel = null;
        } else {
          sel = sel && sel.side === side && sel.i === i ? null : { side: side, i: i };
        }
        draw();
      });
      return b;
    }
    left.forEach(function (x, i) { A.appendChild(item(x, 'a', i)); });
    right.forEach(function (x, i) { B.appendChild(item(x, 'b', i)); });
    function center(el, r0) {
      var r = el.getBoundingClientRect();
      return [r.left + r.width / 2 - r0.left, r.top + r.height / 2 - r0.top];
    }
    function draw() {
      each(A.children, function (b, i) {
        b.classList.toggle('sel', !!sel && sel.side === 'a' && sel.i === i);
        b.classList.toggle('used', pairs[i] != null);
      });
      each(B.children, function (b, i) {
        b.classList.toggle('sel', !!sel && sel.side === 'b' && sel.i === i);
        var used = Object.keys(pairs).some(function (k) { return pairs[k] === i; });
        b.classList.toggle('used', used);
      });
      var r0 = wrap.getBoundingClientRect(), out = '';
      Object.keys(pairs).forEach(function (k) {
        var p = center(A.children[k].querySelector('.dot'), r0);
        var q = center(B.children[pairs[k]].querySelector('.dot'), r0);
        var st = marks ? (marks[k] ? ' good' : ' bad') : '';
        out += '<line class="ln' + st + '" x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] +
          '" stroke="' + COLORS[k % COLORS.length] + '"/>';
      });
      svg.innerHTML = out;
    }
    box.appendChild(wrap);
    window.addEventListener('resize', draw);
    setTimeout(draw, 0);
    return {
      missing: function () { return Object.keys(pairs).length < left.length; },
      check: function () {
        marks = {};
        var ok = true;
        left.forEach(function (x, i) { marks[i] = pairs[i] === answer[i]; ok = ok && marks[i]; });
        draw();
        return ok;
      },
      reveal: function () {
        pairs = {};
        answer.forEach(function (r, i) { pairs[i] = r; });
        marks = {};
        left.forEach(function (x, i) { marks[i] = true; });
        sel = null;
        draw();
      }
    };
  }

  // Empty places in a whole: tap each place to put a piece there.
  function slots(card, code, word) {
    var art = h('div', 'art');
    var count = h('p', 'count', '');
    card.appendChild(art);
    card.appendChild(count);
    var on = [], total = D.parts(code);
    function draw() {
      art.innerHTML = D.shape(code, on, { cls: 'slots tap' });
      count.textContent = 'Yerleştirdiğin ' + word + ': ' + on.length;
      each(art.querySelectorAll('.p'), function (p) {
        p.addEventListener('click', function () {
          var i = +p.getAttribute('data-i'), at = on.indexOf(i);
          if (at >= 0) on.splice(at, 1); else on.push(i);
          card.classList.remove('good', 'bad');
          draw();
        });
      });
    }
    draw();
    return {
      missing: function () { return on.length === 0; },
      check: function () {
        var ok = on.length === total;
        card.classList.toggle('good', ok);
        card.classList.toggle('bad', !ok);
        return ok;
      },
      reveal: function () { on = []; for (var i = 0; i < total; i++) on.push(i); draw(); card.classList.remove('bad'); card.classList.add('good'); }
    };
  }

  /* ================= The steps, in the order of the book ================= */
  var NEW = 'Düşünelim ★';
  var STEPS = [
    { page: 86, part: 'Hatırlayalım',
      ask: 'Her pizza parçası bütün mü, yarım mı, çeyrek mi? Doğru olanı seç.',
      hint: 'Kesik çizgi bütün pizzayı gösteriyor. Parça bütünün ne kadarı?',
      build: function (box) {
        return cards(box, [
          { pic: D.food('pizza', 'quarter', { ghost: true }), groups: [[WORDS, 2]] },
          { pic: D.food('pizza', 'whole'), groups: [[WORDS, 0]] },
          { pic: D.food('pizza', 'half', { ghost: true }), groups: [[WORDS, 1]] }
        ]);
      } },

    { page: 86, part: 'Hatırlayalım',
      ask: 'Kareleri böl ve bir parçasını boya. Aynı düğmeye tekrar dokunursan kare başka türlü bölünür.',
      hint: 'Yarım için kaç eş parça gerekir? Çeyrek için kaç eş parça gerekir? Sadece bir parçayı boya.',
      build: function (box) {
        return builder(box, [
          { shape: 'sq', target: 1, label: 'Bütün' },
          { shape: 'sq', target: 2, label: 'Yarım' },
          { shape: 'sq', target: 4, label: 'Çeyrek' }
        ]);
      } },

    { page: 87, part: 'Bağlantı kuralım',
      ask: 'Yiyecekleri kesir kartlarıyla eşleştir. Önce yiyeceğe, sonra karta dokun.',
      hint: 'Kartta kaç eş parça var? Yiyecek bütünün kaçta biri?',
      build: function (box) {
        return match(box,
          [D.food('orange', 'half'), D.food('apple', 'whole'), D.food('watermelon', 'quarter')],
          [D.shape('sq1', [0], { cls: 'card-shape' }), D.shape('sq4h', [3], { cls: 'card-shape' }),
           D.shape('sq2h', [1], { cls: 'card-shape' })],
          [2, 0, 1], 'rows');
      } },

    { page: 88, part: 'Birlikte öğrenelim',
      ask: 'Hikâyeyi oku ve soruları cevapla.',
      hint: 'Hikâyeyi bir daha oku: hangisini kaç eş parçaya böldü?',
      build: function (box) {
        box.appendChild(h('div', 'story',
          '<div class="lunch">' + D.food('apple', 'whole') + D.food('orange', 'half') +
          D.food('toast', 'quarter') + '</div>' +
          '<p>Annesi, Mert\'in beslenme çantasını hazırladı. Bir elmayı hiç kesmeden çantaya koydu. ' +
          'Bir portakalı iki eş parçaya böldü ve bir parçasını koydu. ' +
          'Bir dilim ekmeği dört eş parçaya böldü ve bir parçasını koydu.</p>'));
        return cards(box, [
          { text: 'Çantada elmanın ne kadarı var?', groups: [[WORDS, 0]] },
          { text: 'Çantada portakalın ne kadarı var?', groups: [[WORDS, 1]] },
          { text: 'Çantada ekmeğin ne kadarı var?', groups: [[WORDS, 2]] },
          { text: 'Annesi hangisini dört eş parçaya böldü?', groups: [[['Elmayı', 'Portakalı', 'Ekmeği'], 2]] }
        ], 'list');
      } },

    { page: 89, part: 'İnceleyelim', learn: true,
      ask: 'Bütün, yarım ve çeyreği kesirle böyle yazarız.',
      build: function (box) {
        var rows = [
          ['sq1', 1, 'Parçalara ayrılmamış şekil <b>bütündür</b>.'],
          ['sq2v', 2, 'Bütün <b>iki eş parçaya</b> bölündü. Bir parçası boyandı: <b>yarım</b>.'],
          ['sq4g', 4, 'Bütün <b>dört eş parçaya</b> bölündü. Bir parçası boyandı: <b>çeyrek</b>.']
        ];
        var w = h('div', 'learn');
        rows.forEach(function (r) {
          w.appendChild(h('div', 'learn-row',
            '<div class="pic">' + D.shape(r[0], [0]) + '</div>' +
            '<div class="learn-text"><p>' + r[2] + '</p>' +
            '<div class="anatomy"><span class="big">' + F[r[1]] + '</span>' +
            '<span class="labels"><span>&larr; Boyanan parça sayısı</span><span>&larr; Kesir çizgisi</span>' +
            '<span>&larr; Toplam parça sayısı</span></span></div>' +
            '<p class="read">Okunuşu: <b>' + D.READ[r[1]] + '</b></p></div>'));
        });
        box.appendChild(w);
        return null;
      } },

    { page: 89, part: 'İnceleyelim',
      ask: 'Her yiyecek bütün mü, parça mı? Kesrini de seç.',
      hint: 'Bütünse kesri ' + F[1] + ', iki eş parçadan biriyse ' + F[2] + ', dört eş parçadan biriyse ' + F[4] + '.',
      build: function (box) {
        var BP = ['Bütün', 'Parça'];
        return cards(box, [
          { pic: D.food('plum', 'whole'), groups: [[BP, 0], [FRACS, 0, 'fr']] },
          { pic: D.food('lemon', 'half'), groups: [[BP, 1], [FRACS, 1, 'fr']] },
          { pic: D.food('cake', 'quarter'), groups: [[BP, 1], [FRACS, 2, 'fr']] },
          { pic: D.food('orangeball', 'whole'), groups: [[BP, 0], [FRACS, 0, 'fr']] },
          { pic: D.food('kiwi', 'half'), groups: [[BP, 1], [FRACS, 1, 'fr']] }
        ], 'small');
      } },

    { page: 90, part: 'Etkinlik',
      ask: 'Bütün, yarım ve çeyreği bulalım: tabloyu doldur.',
      hint: 'Önce bütün mü, yarım mı, çeyrek mi karar ver. Kesir ve okunuşu ona göre seç.',
      build: function (box) {
        var t = table(box, ['Şekil / Nesne', 'Bütün / Yarım / Çeyrek', 'Kesir', 'Okunuşu'], [
          { pic: D.food('ball', 'whole'), groups: [[WORDS, 0], [FRACS, 0], [READS, 0]] },
          { pic: D.shape('c2', [0]), groups: [[WORDS, 1], [FRACS, 1], [READS, 1]] },
          { pic: D.food('toast', 'halfTri'), groups: [[WORDS, 1], [FRACS, 1], [READS, 1]] },
          { pic: D.food('orange', 'quarter'), groups: [[WORDS, 2], [FRACS, 2], [READS, 2]] }
        ]);
        box.appendChild(h('h3', 'sub', 'Değerlendirme'));
        var q = cards(box, [{ text: 'Kesri yazarken neye dikkat ederiz?', groups: [[[
          'Bütünün kaç eş parçaya bölündüğüne ve kaç parçanın boyandığına',
          'Şeklin hangi renkte olduğuna',
          'Şeklin ne kadar büyük olduğuna'], 0, 'vert']] }], 'list');
        return all([t, q]);
      } },

    { page: 91, part: 'Çözelim öğrenelim',
      ask: 'Her yiyeceğin kesrini yaz. Önce kutuya, sonra sayıya dokun.',
      hint: 'Üstteki kutu: kaç parça var? Alttaki kutu: bütün kaç eş parçaya bölündü?',
      build: function (box) {
        return writer(box, [
          { pic: D.food('cookie', 'half'), n: 1, d: 2 },
          { pic: D.food('lemon', 'quarter'), n: 1, d: 4 },
          { pic: D.food('apple', 'whole'), n: 1, d: 1 },
          { pic: D.food('watermelon', 'half'), n: 1, d: 2 }
        ]);
      } },

    { page: 91, part: 'Çözelim öğrenelim',
      ask: 'Tabloyu doldur: bütün mü, yarım mı, çeyrek mi? Kesri ne?',
      hint: 'Parçayı kafanda bütüne tamamla. Kaç tane böyle parça bir bütün yapar?',
      build: function (box) {
        return table(box, ['Nesne', 'Bütün / Yarım / Çeyrek', 'Kesir'], [
          { pic: D.food('pizza', 'half'), groups: [[WORDS, 1], [FRACS, 1]] },
          { pic: D.food('kiwi', 'quarter'), groups: [[WORDS, 2], [FRACS, 2]] },
          { pic: D.food('egg', 'whole'), groups: [[WORDS, 0], [FRACS, 0]] }
        ]);
      } },

    { page: 91, part: 'Çözelim öğrenelim',
      ask: 'Kesri modelle: şekli böl ve bir parçasını boya.',
      hint: 'Kesrin altındaki sayı, kaç eş parçaya böleceğini söyler.',
      build: function (box) {
        return builder(box, [
          { shape: 'r', target: 2, label: F[2] },
          { shape: 'c', target: 4, label: F[4] }
        ]);
      } },

    { page: 91, part: 'Çözelim öğrenelim',
      ask: 'Kesirleri modellerle eşleştir. Dikkat: bir model hiçbir kesre uymuyor!',
      hint: 'Modeldeki parçaları say. Kesrin altındaki sayıyla aynı mı?',
      build: function (box) {
        return match(box,
          ['<span class="frac-card">' + F[4] + '</span>', '<span class="frac-card">' + F[2] + '</span>',
           '<span class="frac-card">' + F[1] + '</span>'],
          [D.shape('c2h', [1]), D.shape('sq4v', [0]), D.shape('c3', [0]), D.shape('r1', [0])],
          [1, 0, 3], 'cols');
      } },

    { part: NEW,
      ask: 'Ali her şekle bir isim verdi. Ali haklı mı?',
      hint: 'Parçalar eş mi, yani hepsi aynı büyüklükte mi? Yarım ve çeyrek için parçalar eş olmalı.',
      build: function (box) {
        var YN = ['Evet', 'Hayır'];
        return cards(box, [
          { pic: D.shape('r2u', [0]), text: 'Ali: “Boyalı kısım yarım.”', groups: [[YN, 1]] },
          { pic: D.shape('sq2d', [0]), text: 'Ali: “Boyalı kısım yarım.”', groups: [[YN, 0]] },
          { pic: D.shape('c4', [2]), text: 'Ali: “Boyalı kısım çeyrek.”', groups: [[YN, 0]] },
          { pic: D.shape('sq4u', [1]), text: 'Ali: “Boyalı kısım çeyrek.”', groups: [[YN, 1]] }
        ], 'small');
      } },

    { part: NEW,
      ask: 'Üç şekil aynı kesri gösteriyor. Farklı olanı bul.',
      hint: 'Her şekilde kaç eş parça var? Say ve karşılaştır.',
      build: function (box) {
        var a = cards(box, [{ groups: [[[D.shape('sq4x', [0]), D.shape('c4', [1]), D.shape('t2', [0]),
          D.shape('r4g', [3])], 2, 'pics']] }], 'bare');
        var b = cards(box, [{ text: 'Diğer üç şekil hangi kesri gösteriyor?', groups: [[FRACS, 2, 'fr']] }], 'list');
        return all([a, b]);
      } },

    { part: NEW,
      ask: 'Bütünü tamamla: boş yerlere dokunarak parçaları yerleştir. Sonra soruyu cevapla.',
      hint: 'Bütün tamamen dolunca kaç parça kullandığını say.',
      build: function (box) {
        var wrap = h('div', 'cards');
        var c1 = h('div', 'card'), c2 = h('div', 'card');
        c1.appendChild(h('p', 'txt', 'Çeyrek parçaları yerleştir.'));
        c2.appendChild(h('p', 'txt', 'Yarım parçaları yerleştir.'));
        var s1 = slots(c1, 'c4', 'çeyrek'), s2 = slots(c2, 'r2v', 'yarım');
        var q1 = choice(['2', '3', '4'], 2), q2 = choice(['1', '2', '4'], 1);
        c1.appendChild(h('p', 'txt', 'Bir bütün kaç çeyrekten oluşur?'));
        c1.appendChild(q1.el);
        c2.appendChild(h('p', 'txt', 'Bir bütün kaç yarımdan oluşur?'));
        c2.appendChild(q2.el);
        wrap.appendChild(c1);
        wrap.appendChild(c2);
        box.appendChild(wrap);
        return all([s1, q1, s2, q2]);
      } }
  ];

  /* ================= Moving through the steps ================= */
  var stage = document.getElementById('stage');
  var fb = document.getElementById('feedback');
  var btnCheck = document.getElementById('check');
  var btnNext = document.getElementById('next');
  var btnPrev = document.getElementById('prev');
  var btnShow = document.getElementById('show');
  var bar = document.getElementById('bar');
  var idx = 0, tries = 0, ctrl = null;
  var result = STEPS.map(function () { return null; });   // 'first', 'later', 'shown'

  function say(text, kind) {
    fb.className = 'feedback' + (kind ? ' ' + kind : '');
    fb.innerHTML = text;
  }
  function render() {
    var s = STEPS[idx];
    tries = 0;
    stage.innerHTML = '';
    var head = h('div', 'step-head',
      '<span class="no">' + (idx + 1) + '</span>' +
      (s.page ? '<span class="pill">Kitap s. ' + s.page + '</span>' : '<span class="pill new">Yeni tarz</span>') +
      '<span class="pill soft">' + s.part + '</span>' +
      '<span class="count">' + (idx + 1) + ' / ' + STEPS.length + '</span>');
    stage.appendChild(head);
    stage.appendChild(h('h2', 'ask', s.ask));
    var body = h('div', 'body');
    stage.appendChild(body);
    ctrl = s.build(body);
    bar.style.width = (idx / STEPS.length * 100) + '%';
    say('');
    btnPrev.disabled = idx === 0;
    btnShow.hidden = true;
    btnCheck.hidden = !ctrl;
    btnNext.hidden = !!ctrl && !result[idx];
    btnNext.innerHTML = ctrl ? 'Sonraki &rarr;' : 'Anladım &rarr;';
    window.scrollTo(0, 0);
  }
  btnCheck.addEventListener('click', function () {
    if (!ctrl) return;
    if (ctrl.missing()) { say('Önce hepsini cevapla, sonra kontrol et.', 'info'); return; }
    if (ctrl.check()) {
      if (!result[idx]) result[idx] = tries === 0 ? 'first' : 'later';
      say('<b>Aferin!</b> Hepsi doğru.', 'good');
      btnCheck.hidden = true;
      btnShow.hidden = true;
      btnNext.hidden = false;
    } else {
      tries += 1;
      say('<b>Tekrar dene.</b> ' + (STEPS[idx].hint || 'Kırmızı olanlara bir daha bak.'), 'try');
      if (tries >= 2) btnShow.hidden = false;
    }
  });
  btnShow.addEventListener('click', function () {
    ctrl.reveal();
    if (!result[idx]) result[idx] = 'shown';
    say('Doğru cevaplar bunlar. İyi bak, sonra devam et.', 'info');
    btnShow.hidden = true;
    btnCheck.hidden = true;
    btnNext.hidden = false;
  });
  btnNext.addEventListener('click', function () {
    if (idx < STEPS.length - 1) { idx += 1; render(); } else finish();
  });
  btnPrev.addEventListener('click', function () {
    if (idx > 0) { idx -= 1; render(); }
  });

  function finish() {
    var scored = [], first = 0, hard = [];
    STEPS.forEach(function (s, i) {
      if (s.learn) return;
      scored.push(i);
      if (result[i] === 'first') first += 1;
      else hard.push((i + 1) + (s.page ? ' (s. ' + s.page + ')' : ' (yeni tarz)'));
    });
    var stars = first === scored.length ? 3 : first >= scored.length * 0.7 ? 2 : 1;
    bar.style.width = '100%';
    stage.innerHTML = '<div class="end"><p class="stars" aria-label="' + stars + ' yıldız">' +
      '★★★'.slice(0, stars) + '<span>' + '★★★'.slice(stars) + '</span></p>' +
      '<h2>Bitti! Aferin!</h2>' +
      '<p>' + scored.length + ' sorudan <b>' + first + '</b> tanesini ilk denemede bildin.</p>' +
      (hard.length ? '<p class="note">Veli için: tekrar bakılacak sorular: ' + hard.join(', ') + '</p>' : '') +
      '</div>';
    say('');
    btnCheck.hidden = true;
    btnShow.hidden = true;
    btnNext.hidden = true;
    btnPrev.disabled = false;
    idx = STEPS.length;   // "Önceki" goes back to the last question
    var again = h('button', 'btn go', 'Baştan başla');
    again.type = 'button';
    again.addEventListener('click', function () {
      result = STEPS.map(function () { return null; });
      idx = 0;
      render();
    });
    stage.querySelector('.end').appendChild(again);
  }
  // Open a given step directly, e.g. ...#7 opens question 7.
  function fromHash() {
    var n = parseInt(location.hash.slice(1), 10);
    if (n >= 1 && n <= STEPS.length) idx = n - 1;
  }
  window.addEventListener('hashchange', function () { fromHash(); render(); });
  fromHash();
  render();
})();
