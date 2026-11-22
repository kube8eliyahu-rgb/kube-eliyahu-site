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
    { id: 'chicken', kind: 'soup', name: 'קובה עוף', tag: 'למרק', fill: 'במילוי בשר עוף', color: '#F59C7C', specs: '44% בשר עוף · בישול כ-8 דק׳ · 800 גרם', back: 1, recipeLabel: 'למתכון מרק לקובה עוף' },
    { id: 'sisca', kind: 'soup', name: 'קובה סיסקה', tag: 'למרק', fill: 'במילוי בשר מפורק', color: '#F2CC2E', specs: '51% בשר בקר · בישול כ-8 דק׳ · 800 גרם', back: 1, recipeLabel: 'למתכון מרק חמוסטה' },
    { id: 'matpunya', kind: 'soup', name: 'קובה מטפוניה', tag: 'למרק', fill: 'במילוי בשר בקר', color: '#F27AD3', specs: '48% בשר בקר · בישול כ-8 דק׳ · 800 גרם', back: 1, recipeLabel: 'למתכון מרק סלק' },
    { id: 'savta', kind: 'soup', isNew: 1, name: 'הקובה של סבתא אסנת', tag: 'למרק', fill: 'במתכון האותנטי', color: '#D08BF0', specs: '47% בשר בקר · בישול כ-8 דק׳ · 800 גרם', recipeLabel: 'למתכון מרק במיה' },
    { id: 'rice', kind: 'cook', isNew: 1, name: 'קובה אורז', tag: 'לבישול', fill: 'ללא רכיבי דגן', color: '#A9C4F5', specs: 'בישול כ-25 דק׳ · 800 גרם' },
    { id: 'nabulsia', kind: 'fry', name: 'קובה נבולסיה', tag: 'לטיגון', fill: 'במילוי בשר בקר וצנוברים', color: '#8EE04A', specs: 'טיגון עד השחמה · 800 גרם', back: 1, recipeLabel: 'למתכון טחינה ירוקה' },
    { id: 'cigar', kind: 'fry', name: 'סיגר סיסקה', tag: 'לטיגון', fill: 'במילוי בשר מפורק', color: '#7FF0C9', specs: '47% בשר בקר · טיגון עד השחמה · 450 גרם', back: 1, recipeLabel: 'למתכון איולי' },
    { id: 'cigar-marokai', kind: 'fry', isNew: 1, name: 'סיגר מרוקאי', tag: 'לטיגון', fill: 'בסגנון פיקנטי', color: '#F26B4F', specs: '56% בשר בקר · טיגון עד השחמה · 450 גרם' },
    { id: 'arancini', kind: 'fry', isNew: 1, name: 'ארנצ׳יני סיסקה', tag: 'לטיגון', fill: 'במילוי בשר מפורק', color: '#F7AA45', specs: 'טיגון עד השחמה · 800 גרם' }
  ];
  var flipIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path></svg>';
  var tint = function (h) { var a = [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)], b = [255, 252, 238]; return 'rgb(' + a.map(function (v, i) { return Math.round(v * 0.24 + b[i] * 0.76); }).join(',') + ')'; };
  var grid = $('prod-grid'), filters = $('filters'), flt = 'all';
  var renderProducts = function () {
    grid.innerHTML = LIST.filter(function (p) { return flt === 'all' || (flt === 'soup' ? (p.kind === 'soup' || p.kind === 'cook') : p.kind === flt); }).map(function (p) {
      return '<article class="pcard" data-id="' + p.id + '" style="background:' + tint(p.color) + ';border-radius:24px;padding:22px 18px 24px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;border-top:8px solid ' + p.color + '">' +
        '<span class="pc-new">מיתוג חדש</span><div style="height:300px;width:100%;display:flex;align-items:center;justify-content:center"><img src="' + I + 'pack-' + p.id + '.webp" alt="אריזת ' + p.name + '" loading="lazy" style="max-width:100%;max-height:300px;width:auto;height:auto;filter:drop-shadow(0 16px 18px rgba(15,50,51,.28))"></div>' +
        (p.back ? '<button type="button" class="flip" aria-pressed="false" style="min-height:44px;padding:8px 18px;border-radius:999px;border:2px solid #005251;background:transparent;color:#005251;font-weight:700;font-size:15px;cursor:pointer;display:inline-flex;align-items:center;gap:8px">' + flipIcon + '<span>הפכו את האריזה</span></button>' : '') +
        (p.isNew ? '<span style="min-height:44px;display:inline-flex;align-items:center;font-family:Hibuk,cursive;font-size:24px;color:#B4532F">חדש בסדרה!</span>' : '') +
        '<h3 style="margin:4px 0 0;font-weight:700;font-size:30px;line-height:1"><a href="product-' + p.id + '.html">' + p.name + '</a></h3>' +
        '<span style="background:' + p.color + ';color:#023F3E;font-weight:700;font-size:17px;padding:2px 16px;border-radius:6px">' + p.tag + '</span>' +
        '<span style="font-family:Hibuk,cursive;font-size:24px;color:#00877B">' + p.fill + '</span>' +
        '<span style="font-size:15px;color:#2D5653">' + p.specs + '</span>' +
        (p.recipeLabel ? '<a href="recipes.html#' + p.id + '" style="color:#023F3E;font-weight:700;font-size:16px;text-decoration:underline;text-underline-offset:5px">' + p.recipeLabel + '</a>' : '') +
        '<a class="more" href="product-' + p.id + '.html">לפרטי המוצר ←</a>' +
        '</article>';
    }).join('');
  };
  if (grid) {
    var FL = [['all', 'הכול'], ['soup', 'למרק ולבישול'], ['fry', 'לטיגון']];
    var renderFilters = function () {
      filters.innerHTML = FL.map(function (f) {
        var on = f[0] === flt;
        return '<button type="button" data-k="' + f[0] + '" aria-pressed="' + on + '" style="min-height:44px;padding:8px 20px;border-radius:999px;font-weight:700;font-size:17px;cursor:pointer;background:' + (on ? '#005251' : 'transparent') + ';color:' + (on ? '#FBF8E4' : '#005251') + ';border:2px solid #005251">' + f[1] + '</button>';
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
  var ICONS = {"instagram": "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077", "tiktok": "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", "facebook": "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z", "whatsapp": "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"};
  var NETS = [['whatsapp', 'וואטסאפ', '#25D366'], ['instagram', 'אינסטגרם', 'linear-gradient(45deg,#F9CE34 0%,#EE2A7B 50%,#6228D7 100%)'], ['tiktok', 'טיקטוק', '#000000'], ['facebook', 'פייסבוק', '#0866FF']];
  var soc = Object.assign({}, (window.SITE && window.SITE.social) || {});
  if (window.SITE && window.SITE.whatsapp && !soc.whatsapp) soc.whatsapp = 'https://wa.me/' + window.SITE.whatsapp + '?text=' + encodeURIComponent('שלום קובה אליהו, ');
  var btn = function (n, size) {
    if (!soc[n[0]]) return '';
    var ic = Math.round(size * 0.5);
    return '<a class="soc-btn" data-net="' + n[0] + '" href="' + soc[n[0]] + '" target="_blank" rel="noopener" aria-label="' + n[1] + ' – קובה אליהו" title="' + n[1] + '" style="width:' + size + 'px;height:' + size + 'px;background:' + n[2] + '"><svg width="' + ic + '" height="' + ic + '" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><path d="' + ICONS[n[0]] + '"/></svg></a>';
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
  var CC = ['#F2CC2E', '#F27AD3', '#8EE04A', '#7FF0C9', '#F7AA45', '#A9C4F5', '#F59C7C', '#D08BF0'];
  var list = $('store-list'), search = $('store-q');
  var renderStores = function () {
    var q = (search.value || '').trim();
    var html = STORES.map(function (c) {
      var cityHit = !q || c.city.indexOf(q) > -1;
      var st = c.stores.filter(function (s) { return cityHit || s[0].indexOf(q) > -1 || s[1].indexOf(q) > -1; });
      if (!st.length) return '';
      return '<div class="lift" style="background:#F2EDD3;border-radius:18px;overflow:hidden;border-top:6px solid ' + CC[STORES.indexOf(c) % CC.length] + '"><div style="background:#005251;color:#FBF8E4;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;gap:10px"><b style="font-size:20px">' + esc(c.city) + '</b><span style="font-size:15px;color:#CDE6DF">' + (st.length === 1 ? 'נקודה אחת' : st.length + ' נקודות') + '</span></div><ul style="list-style:none;margin:0;padding:4px 0">' +
        st.map(function (s) {
          var map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s[0] + ' ' + s[1] + ' ' + c.city);
          return '<li style="padding:10px 18px;border-bottom:1px solid #E2DCC0;display:flex;justify-content:space-between;align-items:center;gap:10px"><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><b style="font-size:16px">' + esc(s[0]) + '</b><span style="font-size:15px;color:#2D5653">' + esc(s[1] || c.city) + '</span></div><a href="' + map + '" target="_blank" rel="noopener" aria-label="ניווט אל ' + esc(s[0]) + '" style="flex:0 0 auto;width:44px;height:44px;border-radius:50%;background:#FBF8E4;color:#005251;display:inline-flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></a></li>';
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

  /* ---------- COOKIES CONSENT + PIXELS ---------- */
  var CKEY = 'kube-consent-v1', consent = null, loaded = {};
  try { consent = JSON.parse(localStorage.getItem(CKEY) || 'null'); } catch (e) {}
  var track = function (ev) {
    try { if (window.fbq) fbq('track', ev); } catch (e) {}
    try { if (window.gtag) gtag('event', ev === 'Lead' ? 'generate_lead' : 'contact'); } catch (e) {}
    try { if (window.ttq) ttq.track(ev === 'Lead' ? 'SubmitForm' : 'Contact'); } catch (e) {}
  };
  /* clicks out to each platform: GA4 event "social_click" (platform = whatsapp/instagram/tiktok/facebook/phone/email) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '', net = a.getAttribute('data-net') ||
      (/wa\.me|whatsapp/i.test(h) ? 'whatsapp' : /instagram\.com/i.test(h) ? 'instagram' : /tiktok\.com/i.test(h) ? 'tiktok' : /facebook\.com/i.test(h) ? 'facebook' : /^tel:/i.test(h) ? 'phone' : /^mailto:/i.test(h) ? 'email' : '');
    if (!net) return;
    try { if (window.gtag) gtag('event', 'social_click', { platform: net, link_url: h.slice(0, 100), transport_type: 'beacon' }); } catch (err) {}
    try { if (window.fbq) fbq('trackCustom', 'SocialClick', { platform: net }); } catch (err) {}
  }, true);
  var loadTrackers = function () {
    if (!consent) return;
    if (consent.marketing && S.metaPixelId && !loaded.fb) {
      loaded.fb = 1;
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', S.metaPixelId); fbq('track', 'PageView');
    }
    if (consent.analytics && S.ga4Id && !loaded.ga) {
      loaded.ga = 1;
      var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + S.ga4Id; document.head.appendChild(g);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', S.ga4Id, { anonymize_ip: true });
    }
    if (consent.marketing && S.tiktokPixelId && !loaded.tt) {
      loaded.tt = 1;
      !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.load = function (e) { var n = 'https://analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = n; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); var o = d.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = n + '?sdkid=' + e + '&lib=' + t; var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a); }; ttq.load(S.tiktokPixelId); ttq.page(); }(window, document, 'ttq');
    }
  };
  var saveConsent = function (an, mk) {
    var hadMk = consent && consent.marketing, hadAn = consent && consent.analytics;
    consent = { analytics: !!an, marketing: !!mk, date: new Date().toISOString() };
    try { localStorage.setItem(CKEY, JSON.stringify(consent)); } catch (e) {}
    banner.hidden = true; modal.classList.remove('open');
    if ((hadMk && !mk) || (hadAn && !an)) { location.reload(); return; }
    loadTrackers();
  };
  var banner = document.createElement('div');
  banner.className = 'ck-banner'; banner.setAttribute('role', 'region'); banner.setAttribute('aria-label', 'הודעה על שימוש בעוגיות');
  banner.innerHTML = '<div class="ck-in"><div class="ck-txt"><b>האתר שלנו משתמש בעוגיות 🍪</b><p>אנו משתמשים בעוגיות הכרחיות לתפעול האתר, ובאישורכם גם בעוגיות סטטיסטיקה ושיווק (כגון פיקסל של Meta) כדי לשפר את האתר ולהציג לכם תוכן רלוונטי. <a href="privacy.html">למדיניות הפרטיות</a></p></div>' +
    '<div class="ck-btns"><button type="button" class="ck-all">אישור כל העוגיות</button><button type="button" class="ck-min">רק הכרחיות</button><button type="button" class="ck-set">הגדרות</button></div></div>';
  var modal = document.createElement('div');
  modal.className = 'ck-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'ck-title');
  modal.innerHTML = '<div class="ck-box"><h2 id="ck-title">הגדרות עוגיות</h2>' +
    '<label class="ck-row"><span><b>הכרחיות</b><small>שמירת הבחירות שלכם והגדרות הנגישות. תמיד פעילות.</small></span><input type="checkbox" checked disabled></label>' +
    '<label class="ck-row"><span><b>סטטיסטיקה</b><small>מדידה אנונימית של השימוש באתר כדי לשפר אותו.</small></span><input type="checkbox" class="ck-an"></label>' +
    '<label class="ck-row"><span><b>שיווק</b><small>פיקסלים של Meta ורשתות פרסום, למדידת קמפיינים ולהצגת מודעות רלוונטיות.</small></span><input type="checkbox" class="ck-mk"></label>' +
    '<div class="ck-btns"><button type="button" class="ck-save">שמירת הבחירה</button><button type="button" class="ck-all">אישור הכל</button></div>' +
    '<a href="privacy.html">למדיניות הפרטיות המלאה</a></div>';
  document.body.appendChild(banner); document.body.appendChild(modal);
  var openSettings = function () {
    modal.querySelector('.ck-an').checked = !!(consent && consent.analytics);
    modal.querySelector('.ck-mk').checked = !!(consent && consent.marketing);
    modal.classList.add('open'); modal.querySelector('.ck-an').focus();
  };
  banner.querySelector('.ck-all').addEventListener('click', function () { saveConsent(true, true); });
  banner.querySelector('.ck-min').addEventListener('click', function () { saveConsent(false, false); });
  banner.querySelector('.ck-set').addEventListener('click', openSettings);
  modal.querySelector('.ck-save').addEventListener('click', function () { saveConsent(modal.querySelector('.ck-an').checked, modal.querySelector('.ck-mk').checked); });
  modal.querySelector('.ck-all').addEventListener('click', function () { saveConsent(true, true); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') modal.classList.remove('open'); });
  document.querySelectorAll('.cookie-open').forEach(function (b) { b.addEventListener('click', openSettings); });
  banner.hidden = !!consent;
  loadTrackers();

  /* ---------- FORMS → EMAIL (FormSubmit) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-mail]'), function (form) {
    var msg = form.querySelector('.form-msg'), btn = form.querySelector('button[type=submit]');
    var say = function (text, ok) { msg.hidden = false; msg.textContent = text; msg.style.color = ok ? '#00877B' : '#B42318'; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (el) { return el.type === 'checkbox' ? !el.checked : !String(el.value || '').trim(); });
      var em = form.querySelector('input[type=email]');
      if (em && em.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim())) bad.push(em);
      Array.prototype.forEach.call(form.querySelectorAll('input,textarea,select'), function (el) { el.style.borderColor = bad.indexOf(el) > -1 ? '#B42318' : ''; el.removeAttribute('aria-invalid'); });
      Array.prototype.forEach.call(form.querySelectorAll('.chk'), function (l) { l.classList.toggle('bad', bad.indexOf(l.querySelector('input')) > -1); });
      if (bad.length) { bad.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); }); bad[0].focus(); say('נא למלא את השדות המסומנים.', false); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._honey) return;
      delete data._honey;
      data._subject = form.getAttribute('data-subject') || 'פנייה מהאתר';
      data._template = 'table';
      data._captcha = 'false';
      if (data['אימייל']) data._replyto = data['אימייל'];
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'שולחים…';
      fetch('https://formsubmit.co/ajax/' + (S.formEmail || S.email), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) === 'true') { form.reset(); say('תודה! הפנייה התקבלה ונחזור אליכם בהקדם.', true); track(form.id === 'quote-form' ? 'Lead' : 'Contact'); }
          else if (/activat/i.test(res.j.message || '')) { say('הטופס ממתין להפעלה חד-פעמית. בינתיים אפשר להתקשר: 02-509-2863', false); }
          else { say('משהו השתבש בשליחה. אפשר לנסות שוב או להתקשר: 02-509-2863', false); }
        })
        .catch(function () { say('אין חיבור כרגע. אפשר לנסות שוב או להתקשר: 02-509-2863', false); })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });


  /* ---------- PRODUCT PAGE FLIP ---------- */
  var ppf = document.querySelector('.pp-flip');
  if (ppf) ppf.addEventListener('click', function () {
    var img = $('pp-img'), back = ppf.getAttribute('aria-pressed') !== 'true';
    img.src = back ? ppf.dataset.back : ppf.dataset.front;
    img.alt = (back ? 'גב אריזת ' : 'אריזת ') + ppf.dataset.name;
    ppf.setAttribute('aria-pressed', back); ppf.textContent = back ? 'לחזית האריזה' : 'הפכו את האריזה';
  });

  /* ---------- ACCESSIBILITY MENU ---------- */
  (function () {
    var OPTS = [['a11y-big', 'הגדלת טקסט'], ['a11y-contrast', 'ניגודיות גבוהה'], ['a11y-links', 'הדגשת קישורים'], ['a11y-font', 'גופן קריא'], ['a11y-still', 'עצירת אנימציות']];
    var root = document.documentElement, saved = [];
    try { saved = JSON.parse(localStorage.getItem('kube-a11y') || '[]'); } catch (e) {}
    saved.forEach(function (c) { root.classList.add(c); });
    var save = function () { try { localStorage.setItem('kube-a11y', JSON.stringify(OPTS.map(function (o) { return o[0]; }).filter(function (c) { return root.classList.contains(c); }))); } catch (e) {} };
    var panel = document.createElement('div');
    panel.className = 'a11y-panel'; panel.id = 'a11y-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'תפריט נגישות');
    panel.innerHTML = '<h2>תפריט נגישות <button type="button" class="x" aria-label="סגירת תפריט הנגישות">×</button></h2>' +
      OPTS.map(function (o) { return '<button type="button" class="opt" data-c="' + o[0] + '" aria-pressed="' + root.classList.contains(o[0]) + '">' + o[1] + '</button>'; }).join('') +
      '<button type="button" class="opt reset" style="justify-content:center">איפוס הגדרות</button><a href="accessibility.html">הצהרת נגישות</a>';
    var fab = document.createElement('button');
    fab.type = 'button'; fab.className = 'a11y-fab'; fab.setAttribute('aria-label', 'פתיחת תפריט נגישות'); fab.setAttribute('aria-controls', 'a11y-panel');
    fab.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M19 8.5c-2 .6-4.4 1-7 1s-5-.4-7-1l-.5 1.9c1.7.5 3.6.9 5.5 1v3.1l-2 6.9 1.9.6 2.1-6.4 2.1 6.4 1.9-.6-2-6.9v-3.1c1.9-.1 3.8-.5 5.5-1z"/></svg>';
    document.body.appendChild(panel); document.body.appendChild(fab);
    var open = function (v) { panel.classList.toggle('open', v); fab.setAttribute('aria-expanded', v); if (v) panel.querySelector('.opt').focus(); };
    fab.addEventListener('click', function () { open(!panel.classList.contains('open')); });
    document.querySelectorAll('.a11y-open').forEach(function (b) { b.addEventListener('click', function () { open(true); }); });
    panel.querySelector('.x').addEventListener('click', function () { open(false); fab.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) { open(false); fab.focus(); } });
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('.opt'); if (!b) return;
      if (b.classList.contains('reset')) { OPTS.forEach(function (o) { root.classList.remove(o[0]); }); panel.querySelectorAll('.opt[data-c]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); }
      else { var on = root.classList.toggle(b.dataset.c); b.setAttribute('aria-pressed', on); }
      save();
    });
  })();

  /* ---------- STICKY HEADER SHADOW ---------- */
  var hd = document.querySelector('.site-hd');
  if (hd) { var onS = function () { hd.classList.toggle('scrolled', window.scrollY > 8); }; window.addEventListener('scroll', onS, { passive: true }); onS(); }

  /* ---------- REVEAL ON SCROLL ---------- */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    var mark = function () {
      document.querySelectorAll('main section > div, .pcard, .rec-row > a, .rp-sec > div, #store-list > div').forEach(function (el, i) {
        if (el.classList.contains('rv') || el.closest('#top')) return;
        el.classList.add('rv'); el.style.transitionDelay = ((i % 4) * 70) + 'ms'; io.observe(el);
      });
    };
    mark(); new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
  }
})();
