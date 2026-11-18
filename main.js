(function () {
  var I = '';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- HERO CAROUSEL ---------- */
  var SL = [
    ['קובה סיסקה', '#F2CC2E', 'sisca'], ['קובה מטפוניה', '#F27AD3', 'matpunya'], ['קובה נבולסיה', '#8EE04A', 'nabulsia'],
    ['הקובה של סבתא אסנת', '#D08BF0', 'savta'], ['סיגר סיסקה', '#7FF0C9', 'cigar'], ['קובה עוף', '#F59C7C', 'chicken'],
    ['ארנצ׳יני סיסקה', '#F7AA45', 'arancini'], ['קובה אורז', '#A9C4F5', 'rice'], ['סיגר מרוקאי', '#F26B4F', 'cigar-marokai']
  ];
  var car = $('slides'), dots = $('dots'), curName = $('cur-name');
  if (car) {
    car.innerHTML = SL.map(function (s, i) {
      return '<div class="slide" aria-hidden="true" style="position:absolute;inset:0;opacity:0;filter:blur(6px)">' +
        '<img class="dish" src="' + I + 'dish-' + s[2] + '.webp" alt="מנה מוגשת של ' + s[0] + '"' + (i ? ' loading="lazy"' : '') + ' style="position:absolute;top:40px;left:0;width:420px;max-width:80%;height:auto;filter:drop-shadow(0 30px 40px rgba(0,0,0,.35));transform:scale(.99)">' +
        '<img class="pack" src="' + I + 'pack-' + s[2] + '.webp" alt="אריזת ' + s[0] + '"' + (i ? ' loading="lazy"' : '') + ' style="position:absolute;top:0;right:0;width:300px;max-width:58%;height:auto;transform:translateY(14px) rotate(5deg);filter:drop-shadow(0 26px 30px rgba(0,0,0,.45))">' +
        '</div>';
    }).join('');
    dots.innerHTML = SL.map(function (s, i) {
      return '<button type="button" role="tab" aria-label="' + s[0] + '" data-i="' + i + '" style="width:26px;height:44px;border:none;background:transparent;padding:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center"><span style="display:block;width:10px;height:10px;border-radius:999px;background:rgba(251,248,228,.45);transition:all .4s"></span></button>';
    }).join('');
    var cs = 0, timer;
    var show = function (n) {
      cs = n;
      Array.prototype.forEach.call(car.children, function (el, i) {
        var on = i === cs;
        el.style.opacity = on ? 1 : 0; el.style.filter = 'blur(' + (on ? 0 : 6) + 'px)';
        el.setAttribute('aria-hidden', on ? 'false' : 'true');
        el.querySelector('.dish').style.transform = 'scale(' + (on ? 1.04 : .99) + ')';
        el.querySelector('.pack').style.transform = 'translateY(' + (on ? 0 : 14) + 'px) rotate(5deg)';
      });
      Array.prototype.forEach.call(dots.children, function (b, i) {
        var on = i === cs, d = b.firstChild;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        d.style.width = on ? '26px' : '10px'; d.style.background = on ? SL[i][1] : 'rgba(251,248,228,.45)';
      });
      curName.textContent = SL[cs][0]; curName.style.background = SL[cs][1];
    };
    var start = function () { clearInterval(timer); timer = setInterval(function () { show((cs + 1) % SL.length); }, 4800); };
    dots.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { show(+b.dataset.i); start(); } });
    show(0); start();
  }

  /* ---------- PRODUCTS ---------- */
  var LIST = [
    { id: 'chicken', kind: 'soup', name: 'קובה עוף', tag: 'למרק', fill: 'במילוי בשר עוף', color: '#F59C7C', specs: 'בישול כ-8 דק׳ · 800 גרם', back: 1, recipeLabel: 'למתכון מרק לקובה עוף' },
    { id: 'sisca', kind: 'soup', name: 'קובה סיסקה', tag: 'למרק', fill: 'במילוי בשר מפורק', color: '#F2CC2E', specs: 'בישול כ-8 דק׳ · 800 גרם', back: 1, recipeLabel: 'למתכון מרק חמוסטה' },
    { id: 'matpunya', kind: 'soup', name: 'קובה מטפוניה', tag: 'למרק', fill: 'במילוי בשר בקר', color: '#F27AD3', specs: 'בישול כ-8 דק׳ · 800 גרם', back: 1, recipeLabel: 'למתכון מרק סלק' },
    { id: 'savta', kind: 'soup', isNew: 1, name: 'הקובה של סבתא אסנת', tag: 'למרק', fill: 'במתכון האותנטי', color: '#D08BF0', specs: 'בישול כ-8 דק׳ · 800 גרם', recipeLabel: 'למתכון מרק במיה' },
    { id: 'rice', kind: 'cook', isNew: 1, name: 'קובה אורז', tag: 'לבישול', fill: 'ללא רכיבי דגן', color: '#A9C4F5', specs: 'בישול כ-25 דק׳ · 800 גרם' },
    { id: 'nabulsia', kind: 'fry', name: 'קובה נבולסיה', tag: 'לטיגון', fill: 'במילוי בשר בקר וצנוברים', color: '#8EE04A', specs: 'טיגון עד השחמה · 800 גרם', back: 1, recipeLabel: 'למתכון טחינה ירוקה' },
    { id: 'cigar', kind: 'fry', name: 'סיגר סיסקה', tag: 'לטיגון', fill: 'במילוי בשר מפורק', color: '#7FF0C9', specs: 'טיגון עד השחמה · 450 גרם', back: 1, recipeLabel: 'למתכון איולי' },
    { id: 'cigar-marokai', kind: 'fry', isNew: 1, name: 'סיגר מרוקאי', tag: 'לטיגון', fill: 'בסגנון פיקנטי', color: '#F26B4F', specs: 'טיגון עד השחמה · 450 גרם' },
    { id: 'arancini', kind: 'fry', isNew: 1, name: 'ארנצ׳יני סיסקה', tag: 'לטיגון', fill: 'במילוי בשר מפורק', color: '#F7AA45', specs: 'טיגון עד השחמה · 800 גרם' }
  ];
  var flipIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path></svg>';
  var grid = $('prod-grid'), filters = $('filters'), flt = 'all';
  var renderProducts = function () {
    grid.innerHTML = LIST.filter(function (p) { return flt === 'all' || (flt === 'soup' ? (p.kind === 'soup' || p.kind === 'cook') : p.kind === flt); }).map(function (p) {
      return '<article data-id="' + p.id + '" style="background:#F2EDD3;border-radius:24px;padding:22px 18px 24px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;border-top:8px solid ' + p.color + '">' +
        '<div style="height:300px;width:100%;display:flex;align-items:center;justify-content:center"><img src="' + I + 'pack-' + p.id + '.webp" alt="אריזת ' + p.name + '" loading="lazy" style="max-width:100%;max-height:300px;width:auto;height:auto;filter:drop-shadow(0 16px 18px rgba(15,50,51,.28))"></div>' +
        (p.back ? '<button type="button" class="flip" aria-pressed="false" style="min-height:44px;padding:8px 18px;border-radius:999px;border:2px solid #143F40;background:transparent;color:#143F40;font-weight:700;font-size:15px;cursor:pointer;display:inline-flex;align-items:center;gap:8px">' + flipIcon + '<span>הפכו את האריזה</span></button>' : '') +
        (p.isNew ? '<span style="min-height:44px;display:inline-flex;align-items:center;font-family:Hibuk,cursive;font-size:24px;color:#B4532F">חדש בסדרה!</span>' : '') +
        '<h3 style="margin:4px 0 0;font-weight:700;font-size:30px;line-height:1">' + p.name + '</h3>' +
        '<span style="background:' + p.color + ';color:#0F3233;font-weight:700;font-size:17px;padding:2px 16px;border-radius:6px">' + p.tag + '</span>' +
        '<span style="font-family:Hibuk,cursive;font-size:24px;color:#1E6B50">' + p.fill + '</span>' +
        '<span style="font-size:15px;color:#3C5A58">' + p.specs + '</span>' +
        (p.recipeLabel ? '<a href="recipes.html#' + p.id + '" style="color:#0F3233;font-weight:700;font-size:16px;text-decoration:underline;text-underline-offset:5px">' + p.recipeLabel + '</a>' : '') +
        '</article>';
    }).join('');
  };
  if (grid) {
    var FL = [['all', 'הכול'], ['soup', 'למרק ולבישול'], ['fry', 'לטיגון']];
    var renderFilters = function () {
      filters.innerHTML = FL.map(function (f) {
        var on = f[0] === flt;
        return '<button type="button" data-k="' + f[0] + '" aria-pressed="' + on + '" style="min-height:44px;padding:8px 20px;border-radius:999px;font-weight:700;font-size:17px;cursor:pointer;background:' + (on ? '#143F40' : 'transparent') + ';color:' + (on ? '#FBF8E4' : '#143F40') + ';border:2px solid #143F40">' + f[1] + '</button>';
      }).join('');
    };
    filters.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { flt = b.dataset.k; renderFilters(); renderProducts(); } });
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.flip'); if (!b) return;
      var art = b.closest('article'), id = art.dataset.id, img = art.querySelector('img'), back = b.getAttribute('aria-pressed') !== 'true';
      var name = LIST.filter(function (p) { return p.id === id; })[0].name;
      img.src = I + (back ? 'back-' : 'pack-') + id + '.webp';
      img.alt = (back ? 'גב אריזת ' : 'אריזת ') + name;
      b.setAttribute('aria-pressed', back); b.querySelector('span').textContent = back ? 'לחזית האריזה' : 'הפכו את האריזה';
    });
    renderFilters(); renderProducts();
  }

  var S = window.SITE || {};

  /* ---------- STORES ---------- */
  var parseCSV = function (t) {
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else if (c !== '\r') f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows;
  };
  var STORES = [];
  var list = $('store-list'), search = $('store-q');
  var renderStores = function () {
    var q = (search.value || '').trim();
    var html = STORES.map(function (c) {
      var cityHit = !q || c.city.indexOf(q) > -1;
      var st = c.stores.filter(function (s) { return cityHit || s[0].indexOf(q) > -1 || s[1].indexOf(q) > -1; });
      if (!st.length) return '';
      return '<div style="background:#F2EDD3;border-radius:18px;overflow:hidden"><div style="background:#143F40;color:#FBF8E4;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;gap:10px"><b style="font-size:20px">' + esc(c.city) + '</b><span style="font-size:15px;color:#CFD8C6">' + (st.length === 1 ? 'נקודה אחת' : st.length + ' נקודות') + '</span></div><ul style="list-style:none;margin:0;padding:4px 0">' +
        st.map(function (s) {
          var map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s[0] + ' ' + s[1] + ' ' + c.city);
          return '<li style="padding:10px 18px;border-bottom:1px solid #DCD6B4;display:flex;justify-content:space-between;align-items:center;gap:10px"><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><b style="font-size:16px">' + esc(s[0]) + '</b><span style="font-size:15px;color:#3C5A58">' + esc(s[1] || c.city) + '</span></div><a href="' + map + '" target="_blank" rel="noopener" aria-label="ניווט אל ' + esc(s[0]) + '" style="flex:0 0 auto;width:44px;height:44px;border-radius:50%;background:#FBF8E4;color:#143F40;display:inline-flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></a></li>';
        }).join('') + '</ul></div>';
    }).join('');
    list.innerHTML = html;
    $('no-results').hidden = !!html;
  };
  var loadStores = function (text) {
    var rows = parseCSV(text).filter(function (r) { return r.length >= 2 && (r[0] || '').trim() && (r[1] || '').trim(); });
    if (rows.length && /עיר|city/i.test(rows[0][0])) rows.shift();
    var by = {}, order = [];
    rows.forEach(function (r) {
      var city = r[0].trim();
      if (!by[city]) { by[city] = []; order.push(city); }
      by[city].push([r[1].trim(), (r[2] || '').trim()]);
    });
    STORES = order.map(function (c) { return { city: c, stores: by[c] }; });
    var n = 0; STORES.forEach(function (c) { n += c.stores.length; });
    $('store-count').textContent = n + ' נקודות מכירה ב-' + STORES.length + ' יישובים ברחבי הארץ';
    var pc = $('point-count'); if (pc) pc.textContent = n;
    renderStores();
  };
  if (list) {
    search.addEventListener('input', renderStores);
    var local = function () { return fetch('stores.csv', { cache: 'no-cache' }).then(function (r) { return r.text(); }); };
    (S.storesCsvUrl ? fetch(S.storesCsvUrl).then(function (r) { if (!r.ok) throw 0; return r.text(); }).catch(local) : local())
      .then(loadStores).catch(function () { $('store-count').textContent = ''; });
  }

  /* ---------- QUOTE FORM → WhatsApp ---------- */
  var form = $('quote-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      if (!(d.get('phone') || '').trim()) { form.phone.focus(); return; }
      var msg = 'שלום קובה אליהו, אשמח להצעת מחיר.\n' +
        'שם העסק: ' + (d.get('biz') || '') + '\n' +
        'סוג העסק: ' + (d.get('type') || '') + '\n' +
        'איש קשר: ' + (d.get('name') || '') + '\n' +
        'טלפון: ' + (d.get('phone') || '') +
        ((d.get('notes') || '').trim() ? '\nהערות: ' + d.get('notes') : '');
      window.open('https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      $('form-done').hidden = false;
    });
  }
})();
