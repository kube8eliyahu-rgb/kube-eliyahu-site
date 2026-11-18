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


  /* ---------- SOCIAL BUTTONS ---------- */
  var ICONS = {"instagram": "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077", "tiktok": "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", "facebook": "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"};
  var NETS = [['instagram', 'אינסטגרם', 'linear-gradient(45deg,#F9CE34 0%,#EE2A7B 50%,#6228D7 100%)'], ['tiktok', 'טיקטוק', '#000000'], ['facebook', 'פייסבוק', '#0866FF']];
  var soc = (window.SITE && window.SITE.social) || {};
  var btn = function (n, size) {
    if (!soc[n[0]]) return '';
    var ic = Math.round(size * 0.5);
    return '<a class="soc-btn" href="' + soc[n[0]] + '" target="_blank" rel="noopener" aria-label="' + n[1] + ' – קובה אליהו" title="' + n[1] + '" style="width:' + size + 'px;height:' + size + 'px;background:' + n[2] + '"><svg width="' + ic + '" height="' + ic + '" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="' + ICONS[n[0]] + '"/></svg></a>';
  };
  document.querySelectorAll('[data-social]').forEach(function (el) {
    var size = +el.getAttribute('data-social') || 48;
    el.innerHTML = NETS.map(function (n) { return btn(n, size); }).join('');
  });
  var dock = document.createElement('nav');
  dock.className = 'soc-dock'; dock.setAttribute('aria-label', 'הרשתות החברתיות שלנו');
  dock.innerHTML = NETS.map(function (n) { return btn(n, 46); }).join('');
  if (dock.innerHTML) document.body.appendChild(dock);

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
