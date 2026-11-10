/* Keşfedelim: Bütün, Yarım ve Çeyrek. An interactive explanation (no score): she cuts, compares,
   folds and counts, and every tap shows something. In the order of the book (pages 86-89). */
(function () {
  'use strict';
  var D = window.D;
  var uid = 0;

  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function later(ms, fn) { return setTimeout(fn, ms); }
  function btn(label, cls) {
    var b = h('button', 'btn' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    return b;
  }
  // A piece of a round food: the food clipped to the outline d, with a thin cut edge.
  function piece(food, d, key) {
    var id = 'pc' + (++uid);
    return '<g class="pc" data-k="' + key + '"><defs><clipPath id="' + id + '"><path d="' + d + '"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + ')">' + D.disk(food, 50, 50, 44) + '</g>' +
      '<path class="edge" d="' + d + '"/></g>';
  }
  function move(svg, key, tr) {
    each(svg.querySelectorAll('[data-k="' + key + '"]'), function (g) { g.style.transform = tr; });
  }
  var HALF = { L: 'M50 5A45 45 0 0 0 50 95Z', R: 'M50 5A45 45 0 0 1 50 95Z' };
  var QUARTER = {
    TL: 'M50 50L50 5A45 45 0 0 0 5 50Z', TR: 'M50 50L50 5A45 45 0 0 1 95 50Z',
    BR: 'M50 50L95 50A45 45 0 0 1 50 95Z', BL: 'M50 50L50 95A45 45 0 0 1 5 50Z'
  };

  // One action button under the picture; its label and job change step by step.
  function actions(box) {
    var bar = h('div', 'actions');
    box.appendChild(bar);
    var b = btn('', 'act');
    bar.appendChild(b);
    var job = null;
    b.addEventListener('click', function () { var j = job; set(null); if (j) j(); });
    function set(label, fn) {
      job = fn || null;
      b.hidden = !label;
      if (label) b.innerHTML = label;
    }
    return set;
  }

  var SCREENS = [
    /* ---------- 1. Bütün ---------- */
    { page: '86', part: 'Hatırlayalım', title: 'Bütün',
      build: function (box, done) {
        var art = h('div', 'art tapme', '<svg viewBox="0 0 100 100" role="img" aria-label="Bütün bir pizza">' +
          D.disk('pizza', 50, 50, 44) + '</svg>');
        var tag = h('p', 'tag hide', 'Bütün');
        var cap = h('p', 'cap', 'Bu bir pizza. <b>Pizzaya dokun.</b>');
        var row = h('div', 'wholes hide', ['apple', 'ball', 'egg', 'orangeball'].map(function (f) {
          return '<div>' + D.food(f, 'whole') + '</div>';
        }).join(''));
        var cap2 = h('p', 'cap hide', 'Bunların hepsi de <b>bütün</b>: hiçbiri kesilmedi.');
        [art, tag, cap, row, cap2].forEach(function (x) { box.appendChild(x); });
        art.addEventListener('click', function () {
          art.classList.remove('tapme');
          art.classList.add('pop');
          tag.classList.remove('hide');
          cap.innerHTML = 'Pizza hiç kesilmedi, parçalara ayrılmadı. Parçalara ayrılmamış şeye <b>bütün</b> denir.';
          later(700, function () { row.classList.remove('hide'); cap2.classList.remove('hide'); done(); });
        });
      } },

    /* ---------- 2. Yarım ---------- */
    { page: '86', part: 'Hatırlayalım', title: 'Yarım',
      build: function (box, done) {
        var art = h('div', 'art', '<svg viewBox="0 0 100 100" role="img" aria-label="Pizza">' +
          piece('pizza', HALF.L, 'L') + piece('pizza', HALF.R, 'R') +
          '<line class="guide" x1="50" y1="0" x2="50" y2="100"/></svg>');
        var svg = art.firstChild;
        var tags = h('div', 'tags two hide', '<span>yarım</span><span>yarım</span>');
        var cap = h('p', 'cap', 'Bir bütün pizza. Kesik çizgiden <b>ortadan</b> keselim.');
        [art, tags, cap].forEach(function (x) { box.appendChild(x); });
        var act = actions(box);
        act('✂ Ortadan kes', function () {
          svg.querySelector('.guide').classList.add('gone');
          move(svg, 'L', 'translate(-7px, 0px) scale(1, 1)');
          move(svg, 'R', 'translate(7px, 0px) scale(1, 1)');
          cap.innerHTML = 'Pizzayı <b>iki parçaya</b> böldük. Parçalar aynı büyüklükte mi? Üst üste koyup bakalım.';
          act('Üst üste koy', function () {
            svg.querySelector('[data-k="R"]').classList.add('ghosty');
            move(svg, 'R', 'translate(-7px, 0px) scale(-1, 1)');
            cap.innerHTML = 'Tam üst üste geldi! İki parça <b>aynı büyüklükte</b>. Aynı büyüklükteki parçalara <b>eş parça</b> denir.';
            act('Geri koy', function () {
              svg.querySelector('[data-k="R"]').classList.remove('ghosty');
              move(svg, 'R', 'translate(7px, 0px) scale(1, 1)');
              tags.classList.remove('hide');
              cap.innerHTML = 'Bütün <b>iki eş parçaya</b> bölündü. Her parça bir <b>yarım</b>. İki yarım bir bütün yapar.';
              done();
            });
          });
        });
      } },

    /* ---------- 3. Çeyrek ---------- */
    { page: '86–87', part: 'Hatırlayalım', title: 'Çeyrek',
      build: function (box, done) {
        var art = h('div', 'art', '<svg viewBox="0 0 100 100" role="img" aria-label="Pizza">' +
          piece('pizza', QUARTER.TL, 'TL') + piece('pizza', QUARTER.BL, 'BL') +
          piece('pizza', QUARTER.TR, 'TR') + piece('pizza', QUARTER.BR, 'BR') +
          '<line class="guide v" x1="50" y1="0" x2="50" y2="100"/><line class="guide h gone" x1="0" y1="50" x2="100" y2="50"/></svg>');
        var svg = art.firstChild;
        var tags = h('div', 'tags four hide', '<span>çeyrek</span><span>çeyrek</span><span>çeyrek</span><span>çeyrek</span>');
        var cap = h('p', 'cap', 'Yine bir bütün pizza. Bu sefer <b>iki kere</b> keseceğiz.');
        [art, tags, cap].forEach(function (x) { box.appendChild(x); });
        var act = actions(box);
        function at(dx, dy, rot) { return 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + rot + 'deg)'; }
        act('✂ Ortadan kes', function () {
          svg.querySelector('.guide.v').classList.add('gone');
          svg.querySelector('.guide.h').classList.remove('gone');
          move(svg, 'TL', at(-6, 0, 0)); move(svg, 'BL', at(-6, 0, 0));
          move(svg, 'TR', at(6, 0, 0)); move(svg, 'BR', at(6, 0, 0));
          cap.innerHTML = 'İki parça oldu. Şimdi bir kere daha, <b>yan</b> keselim.';
          act('✂ Bir daha kes', function () {
            svg.querySelector('.guide.h').classList.add('gone');
            move(svg, 'TL', at(-6, -6, 0)); move(svg, 'TR', at(6, -6, 0));
            move(svg, 'BL', at(-6, 6, 0)); move(svg, 'BR', at(6, 6, 0));
            cap.innerHTML = '<b>Dört parça</b> oldu. Hepsi aynı büyüklükte mi? Üst üste koyup bakalım.';
            act('Üst üste koy', function () {
              each(svg.querySelectorAll('.pc'), function (g) { if (g.getAttribute('data-k') !== 'TR') g.classList.add('ghosty'); });
              move(svg, 'TL', at(6, -6, 90)); move(svg, 'BL', at(6, -6, 180)); move(svg, 'BR', at(6, -6, -90));
              cap.innerHTML = 'Dördü de tam üst üste geldi! Dört parça <b>aynı büyüklükte</b>: dört <b>eş parça</b>.';
              act('Geri koy', function () {
                each(svg.querySelectorAll('.pc'), function (g) { g.classList.remove('ghosty'); });
                move(svg, 'TL', at(-6, -6, 0)); move(svg, 'TR', at(6, -6, 0));
                move(svg, 'BL', at(-6, 6, 0)); move(svg, 'BR', at(6, 6, 0));
                tags.classList.remove('hide');
                cap.innerHTML = 'Bütün <b>dört eş parçaya</b> bölündü. Her parça bir <b>çeyrek</b>. Dört çeyrek bir bütün yapar.';
                done();
              });
            });
          });
        });
      } },

    /* ---------- 4. Kâğıt katlama ---------- */
    { page: '86', part: 'Hatırlayalım', title: 'Kâğıdı katlayalım',
      build: function (box, done) {
        var Q = { TL: 'M5 5H50V50H5Z', BL: 'M5 50H50V95H5Z', TR: 'M50 5H95V50H50Z', BR: 'M50 50H95V95H50Z' };
        var inner = '';
        ['TL', 'BL', 'TR', 'BR'].forEach(function (k) { inner += '<path class="paper" data-k="' + k + '" d="' + Q[k] + '"/>'; });
        var art = h('div', 'art', '<svg viewBox="0 0 100 100" role="img" aria-label="Kare kâğıt">' + inner +
          '<line class="fold v gone" x1="50" y1="5" x2="50" y2="95"/><line class="fold h gone" x1="5" y1="50" x2="95" y2="50"/></svg>');
        var svg = art.firstChild;
        var cap = h('p', 'cap', 'Bu bir kare kâğıt: bir <b>bütün</b>. Ortadan katlayalım.');
        [art, cap].forEach(function (x) { box.appendChild(x); });
        var act = actions(box);
        function fold(k, sx, sy) {
          var p = svg.querySelector('[data-k="' + k + '"]');
          p.style.transform = 'scale(' + sx + ', ' + sy + ')';
          p.classList.toggle('back', sx * sy < 0);
        }
        function openAll() { ['TL', 'BL', 'TR', 'BR'].forEach(function (k) { fold(k, 1, 1); }); }
        act('Katla', function () {
          fold('TR', -1, 1); fold('BR', -1, 1);
          cap.innerHTML = 'Kâğıdı ortadan katladık. İki yarısı <b>tam üst üste</b> geldi.';
          act('Aç', function () {
            openAll();
            svg.querySelector('.fold.v').classList.remove('gone');
            cap.innerHTML = 'Katlama çizgisi kâğıdı <b>iki eş parçaya</b> böldü. Her parça bir <b>yarım</b>.';
            act('İki kere katla', function () {
              fold('TR', -1, 1); fold('BR', -1, 1);
              later(900, function () {
                fold('BL', 1, -1); fold('BR', -1, -1);
                cap.innerHTML = 'İki kere katladık. Şimdi açalım.';
                act('Aç', function () {
                  openAll();
                  svg.querySelector('.fold.h').classList.remove('gone');
                  cap.innerHTML = 'İki katlama çizgisi kâğıdı <b>dört eş parçaya</b> böldü. <b>Bir parçaya dokun</b> ve boya!';
                  each(svg.querySelectorAll('.paper'), function (p) {
                    p.classList.add('tap');
                    p.addEventListener('click', function () {
                      each(svg.querySelectorAll('.paper'), function (x) { x.classList.remove('on'); });
                      p.classList.add('on');
                      cap.innerHTML = 'Dört eş parçadan <b>birini</b> boyadın. Boyalı parça bir <b>çeyrek</b>.';
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      } },

    /* ---------- 5. Eş parçalar ---------- */
    { page: '88–89', part: 'Birlikte öğrenelim', title: 'Eş parça ne demek?',
      build: function (box, done) {
        var art = h('div', 'art wide', '<svg viewBox="0 0 200 100" role="img" aria-label="İkiye bölünmüş kek">' +
          '<rect class="bar-a" x="10" y="20" height="60" rx="6"/><rect class="bar-b" y="20" height="60" rx="6"/>' +
          '<line class="cutline" y1="10" y2="90"/></svg>');
        var svg = art.firstChild;
        var cap = h('p', 'cap', '');
        var slider = h('div', 'slider', '<input type="range" min="15" max="85" value="30" ' +
          'aria-label="Kesme çizgisinin yeri"><p class="hint">Kesme çizgisini kaydır.</p>');
        [art, slider, cap].forEach(function (x) { box.appendChild(x); });
        var input = slider.querySelector('input'), finished = false;
        function draw() {
          var v = +input.value;
          if (Math.abs(v - 50) <= 3) { v = 50; input.value = 50; }
          var x = 10 + 180 * v / 100;
          var a = svg.querySelector('.bar-a'), b = svg.querySelector('.bar-b'), c = svg.querySelector('.cutline');
          a.setAttribute('width', x - 10 - 1.5);
          b.setAttribute('x', x + 1.5);
          b.setAttribute('width', 190 - x - 1.5);
          c.setAttribute('x1', x);
          c.setAttribute('x2', x);
          var eq = v === 50;
          art.classList.toggle('eq', eq);
          cap.innerHTML = eq
            ? '✔ Şimdi iki parça <b>aynı büyüklükte</b>: <b>eş parçalar</b>. Her biri bir <b>yarım</b>.'
            : 'Parçalar eş <b>değil</b>: biri büyük, biri küçük. Bunlara <b>yarım denmez</b>.';
          if (eq && !finished) { finished = true; done(); }
        }
        input.addEventListener('input', draw);
        draw();
      } },

    /* ---------- 6. Kesirle yazalım ---------- */
    { page: '89', part: 'İnceleyelim', title: 'Kesirle yazalım',
      build: function (box, done) {
        var MODELS = [
          { n: 1, code: 'sq1', word: 'Bütün', c: [[50, 50]] },
          { n: 2, code: 'sq2v', word: 'Yarım', c: [[28, 50], [72, 50]] },
          { n: 4, code: 'sq4g', word: 'Çeyrek', c: [[28, 28], [72, 28], [28, 72], [72, 72]] }
        ];
        var seen = [false, false, false];
        var tabs = h('div', 'tabs');
        var area = h('div', 'fracarea');
        box.appendChild(tabs);
        box.appendChild(area);
        MODELS.forEach(function (m, i) {
          var t = h('button', 'tab', m.word);
          t.type = 'button';
          t.addEventListener('click', function () { show(i); });
          tabs.appendChild(t);
        });
        function badge(x, y, n, cls) {
          return '<g class="badge ' + (cls || '') + '"><circle cx="' + x + '" cy="' + y + '" r="11"/>' +
            '<text x="' + x + '" y="' + (y + 5) + '">' + n + '</text></g>';
        }
        function show(i) {
          var m = MODELS[i];
          each(tabs.children, function (t, j) { t.setAttribute('aria-pressed', String(j === i)); });
          area.innerHTML = '';
          var pic = h('div', 'pic', D.shape(m.code, [0]));
          var svg = pic.querySelector('svg');
          var frac = h('div', 'fbuild',
            '<div class="fstack"><span class="nb top"></span><span class="fl"></span><span class="nb bot"></span></div>' +
            '<div class="flabels"><span class="l1 hide">&larr; Boyanan parça sayısı</span>' +
            '<span class="l2 hide">&larr; Kesir çizgisi</span><span class="l3 hide">&larr; Toplam parça sayısı</span></div>');
          var read = h('p', 'cap', 'Önce boyalı parçayı, sonra bütün parçaları sayalım.');
          var row = h('div', 'fracrow');
          row.appendChild(pic);
          row.appendChild(frac);
          area.appendChild(row);
          area.appendChild(read);
          var act = actions(area);
          act('① Boyalı parçayı say', function () {
            svg.insertAdjacentHTML('beforeend', badge(m.c[0][0], m.c[0][1], 1, 'orange'));
            frac.querySelector('.top').textContent = '1';
            frac.querySelector('.l1').classList.remove('hide');
            read.innerHTML = 'Boyalı parça: <b>1</b>. Kesrin <b>üstüne</b> yazarız.';
            act('② Bütün parçaları say', function () {
              each(svg.querySelectorAll('.badge'), function (b) { b.remove(); });
              m.c.forEach(function (c, k) {
                later(450 * k, function () { svg.insertAdjacentHTML('beforeend', badge(c[0], c[1], k + 1)); });
              });
              later(450 * m.n, function () {
                frac.querySelector('.bot').textContent = String(m.n);
                frac.querySelector('.fl').classList.add('shown');
                frac.querySelector('.l2').classList.remove('hide');
                frac.querySelector('.l3').classList.remove('hide');
                read.innerHTML = 'Toplam parça: <b>' + m.n + '</b>. Kesrin <b>altına</b> yazarız. ' +
                  m.word + ' = ' + D.frac(1, m.n) + ' Okunuşu: <b>' + D.READ[m.n] + '</b>';
                seen[i] = true;
                tabs.children[i].classList.add('seen');
                if (seen.every(Boolean)) done();
                else read.innerHTML += '<br><span class="hint">Şimdi diğer düğmeye dokun: ' +
                  MODELS.filter(function (x, j) { return !seen[j]; }).map(function (x) { return x.word; }).join(', ') + '.</span>';
              });
            });
          });
        }
        show(0);
      } },

    /* ---------- 7. Özet ---------- */
    { page: '86–89', part: 'Özet', title: 'Hatırla!',
      build: function (box, done) {
        var cards = [
          ['sq1', 1, 'Bütün', 'Parçalara ayrılmamış'],
          ['sq2v', 2, 'Yarım', 'İki eş parçadan biri'],
          ['sq4g', 4, 'Çeyrek', 'Dört eş parçadan biri']
        ].map(function (c) {
          return '<div class="sum"><div class="pic">' + D.shape(c[0], [0]) + '</div><h3>' + c[2] + '</h3>' +
            '<p class="big">' + D.frac(1, c[1]) + '</p><p>' + D.READ[c[1]] + '</p><p class="small">' + c[3] + '</p></div>';
        }).join('');
        box.appendChild(h('div', 'sums', cards));
        box.appendChild(h('p', 'cap', 'Yarım ve çeyrek için parçalar <b>eş</b> (aynı büyüklükte) olmalı.<br>' +
          '2 yarım = 1 bütün &nbsp;·&nbsp; 4 çeyrek = 1 bütün'));
        var go = h('p', 'actions', '<a class="btn go" href="../lesson-02-alistirmalar/">Alıştırmalara geç &rarr;</a>');
        box.appendChild(go);
        done();
      } }
  ];

  /* ---------- Moving through the screens ---------- */
  var stage = document.getElementById('stage');
  var bar = document.getElementById('bar');
  var btnNext = document.getElementById('next');
  var btnPrev = document.getElementById('prev');
  var idx = 0;
  var finished = SCREENS.map(function () { return false; });

  function render() {
    var s = SCREENS[idx], i = idx, last = idx === SCREENS.length - 1;
    stage.innerHTML = '';
    stage.appendChild(h('div', 'step-head',
      '<span class="no">' + (idx + 1) + '</span><span class="pill">Kitap s. ' + s.page + '</span>' +
      '<span class="pill soft">' + s.part + '</span><span class="count">' + (idx + 1) + ' / ' + SCREENS.length + '</span>'));
    stage.appendChild(h('h2', 'title', s.title));
    var body = h('div', 'body');
    stage.appendChild(body);
    btnNext.hidden = last || !finished[i];
    btnNext.classList.remove('pulse');
    btnPrev.disabled = idx === 0;
    bar.style.width = ((idx + 1) / SCREENS.length * 100) + '%';
    s.build(body, function () {
      finished[i] = true;
      if (i === idx && !last) { btnNext.hidden = false; btnNext.classList.add('pulse'); }
    });
    window.scrollTo(0, 0);
  }
  btnNext.addEventListener('click', function () { if (idx < SCREENS.length - 1) { idx += 1; render(); } });
  btnPrev.addEventListener('click', function () { if (idx > 0) { idx -= 1; render(); } });
  function fromHash() {
    var n = parseInt(location.hash.slice(1), 10);
    if (n >= 1 && n <= SCREENS.length) idx = n - 1;
  }
  window.addEventListener('hashchange', function () { fromHash(); render(); });
  fromHash();
  render();
})();
