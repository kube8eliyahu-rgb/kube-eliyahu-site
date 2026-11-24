/* =====================================================================
   בוט התגובות של קובה אליהו – רץ בתוך האתר (Cloudflare Pages Function)
   כתובת: https://kubeeliyahu.com/webhook

   מה הוא עושה עם כל תגובה חדשה בדף הפייסבוק:
   • "איפה קונים?"  → עונה עם החנויות בעיר (מתוך stores.csv של האתר) + שולח את כולן בהודעה פרטית
   • מחמאה          → לייק + "תודה רבה" קצר
   • תלונה          → לא עונה, שולח מייל עם קובץ CSV, ואז מסתיר את התגובה
   • כל השאר        → לא נוגע

   הגדרות (Cloudflare → Pages → kube-eliyahu-site → Settings → Variables and Secrets):
     VERIFY_TOKEN        מחרוזת סודית לאימות ה-Webhook מול מטא
     APP_SECRET          ה-App Secret של אפליקציית מטא (סוד)
     PAGE_ACCESS_TOKEN   טוקן הדף (סוד)
     PAGE_ID             מזהה הדף
     DRY_RUN             true = מצב בדיקה (רק רושם, לא מפרסם). false = פעיל
     SMTP_USER/SMTP_PASS ג'ימייל + App Password לשליחת תלונות (סוד)
     ALERT_EMAIL_TO      לאן לשלוח תלונות (ברירת מחדל: kube8eliyahu@gmail.com)
     REPORT_KEY          מפתח לצפייה ביומן ובקובץ התלונות בדפדפן (סוד)
     ANTHROPIC_API_KEY   לא חובה – Claude מסווג תגובות בדיוק רב יותר
   KV binding בשם BOT_KV – זיכרון: לא לענות פעמיים, יומן פעילות ותלונות.
   ===================================================================== */

import { connect } from 'cloudflare:sockets';

const GRAPH_VERSION = 'v23.0';
const STORES_PAGE = 'https://kubeeliyahu.com/where.html';
const MAX_PUBLIC = 6;

/* ---------------------------------------------------------------------
   HTTP
--------------------------------------------------------------------- */
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const p = url.searchParams;

  // אימות ה-Webhook מול מטא
  if (p.get('hub.mode') === 'subscribe') {
    const ok = env.VERIFY_TOKEN && p.get('hub.verify_token') === String(env.VERIFY_TOKEN).trim();
    return new Response(ok ? p.get('hub.challenge') : 'forbidden', { status: ok ? 200 : 403 });
  }

  // דוחות בדפדפן: /webhook?key=REPORT_KEY&view=log | complaints | test&msg=...
  if (p.get('key') && env.REPORT_KEY && p.get('key') === env.REPORT_KEY) {
    const view = p.get('view') || 'log';
    if (view === 'complaints') return complaintsCsvResponse(env);
    if (view === 'mailtest') {
      try { await sendViaFormSubmit(env, '✅ בדיקה: הבוט של קובה אליהו מחובר למייל', { 'הודעה': 'זו הודעת בדיקה. מעכשיו תלונות מהפייסבוק יגיעו לכאן.', 'קובץ כל התלונות (אקסל)': complaintsLink(env) }); return json({ ok: true }); }
      catch (e) { return json({ ok: false, error: e.message }); }
    }
    if (view === 'backfill') return backfill(env, request, p);
    if (view === 'check') {
      // בדיקת חיבור לפייסבוק – בלי לחשוף את הקוד עצמו
      const G = `${env.GRAPH_BASE || "https://graph.facebook.com"}/${GRAPH_VERSION}`, t = encodeURIComponent(String(env.PAGE_ACCESS_TOKEN || '').trim());
      const get = async path => { const r = await fetch(`${G}/${path}${path.includes('?') ? '&' : '?'}access_token=${t}`); const j = await r.json().catch(() => ({})); return r.ok ? j : { error: (j.error && j.error.message) || r.status }; };
      const page = await get(`${env.PAGE_ID}?fields=name`);
      const subs = await get(`${env.PAGE_ID}/subscribed_apps`);
      return json({
        page: page.name || page.error,
        subscribed: (subs.data || []).map(a => `${a.name}: ${(a.subscribed_fields || []).join(', ')}`),
        subscribedError: subs.error || null,
        secrets: { VERIFY_TOKEN: !!env.VERIFY_TOKEN, APP_SECRET: !!env.APP_SECRET, PAGE_ACCESS_TOKEN: !!env.PAGE_ACCESS_TOKEN, SMTP_PASS: !!env.SMTP_PASS, KV: !!env.BOT_KV },
        mode: dry(env) ? 'בדיקה (DRY_RUN)' : 'פעיל',
      });
    }
    if (view === 'test') {
      // בדיקה בלי פייסבוק: מה הבוט היה עושה עם תגובה
      const msg = p.get('msg') || '';
      const stores = await getStores(env, request);
      const ctx = makeCtx(env, stores);
      const decision = await decide(ctx, { message: msg, fromName: p.get('name') || 'דנה כהן', isReplyInThread: false });
      return json({ message: msg, stores: stores.length, decision });
    }
    const log = (await kvGetJson(env, 'log')) || [];
    const stores = await getStores(env, request);
    const head = `בוט קובה אליהו | מצב: ${dry(env) ? 'בדיקה (DRY_RUN) – לא מפרסם כלום' : 'פעיל'} | חנויות: ${stores.length} | ` +
      `מייל: ${env.SMTP_USER && env.SMTP_PASS ? 'ג׳ימייל' : 'FormSubmit'} | Claude: ${env.ANTHROPIC_API_KEY ? 'פעיל' : 'כבוי'}\n` +
      `${'-'.repeat(60)}\n`;
    return new Response(head + log.slice().reverse().join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  return new Response('kube-eliyahu bot', { status: 200 });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const raw = await request.arrayBuffer();
  if (!(await validSignature(env, request, raw))) {
    // רושמים ביומן כדי שיהיה ברור מה קרה (בלי לחשוף את הקוד)
    const s = String(env.APP_SECRET || '').trim();
    const note = `❌ בקשה מפייסבוק נדחתה: הקוד APP_SECRET לא תואם (אורך הקוד השמור: ${s.length} תווים, אמור להיות 32)`;
    context.waitUntil((async () => { if (env.BOT_KV) { const prev = (await kvGetJson(env, 'log')) || []; prev.push(new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) + '  ' + note); await env.BOT_KV.put('log', JSON.stringify(prev.slice(-300))); } })());
    return new Response('bad signature', { status: 401 });
  }

  let body;
  try { body = JSON.parse(new TextDecoder().decode(raw)); } catch { return new Response('ok'); }
  if (body.object !== 'page') return new Response('ok');

  const work = (async () => {
    const stores = await getStores(env, request);
    const ctx = makeCtx(env, stores);
    for (const entry of body.entry || [])
      for (const ch of entry.changes || [])
        if (ch.field === 'feed') {
          const v = ch.value || {};
          await ctx.log(`📥 התקבל מפייסבוק: ${v.item || '?'} / ${v.verb || '?'}${v.from && v.from.name ? ' מ' + v.from.name : ''}${v.message ? ' – "' + String(v.message).slice(0, 60) + '"' : ''}`);
          try { await handleComment(ctx, ch.value); }
          catch (e) { await ctx.log(`❌ שגיאה: ${e.message}`); }
        }
    await ctx.flushLog();
  })();
  context.waitUntil(work);            // עונים למטא מיד, מטפלים ברקע
  return new Response('EVENT_RECEIVED');
}

const json = o => new Response(JSON.stringify(o, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' } });
const dry = env => String(env.DRY_RUN ?? 'true').toLowerCase() !== 'false';

async function validSignature(env, request, raw) {
  const secret = String(env.APP_SECRET || '').trim();
  if (!secret) return true;
  const sig = request.headers.get('x-hub-signature-256') || '';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, raw));
  const expected = 'sha256=' + [...mac].map(b => b.toString(16).padStart(2, '0')).join('');
  if (sig.length !== expected.length) return false;
  let diff = 0; for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/* ---------------------------------------------------------------------
   קונטקסט: פייסבוק, KV, יומן
--------------------------------------------------------------------- */
function makeCtx(env, stores) {
  const lines = [];
  const stamp = () => new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
  const G = `${env.GRAPH_BASE || "https://graph.facebook.com"}/${GRAPH_VERSION}`;

  async function graph(method, endpoint, body) {
    if (dry(env)) { lines.push(`${stamp()}   [בדיקה] ${method} ${endpoint} ${body ? JSON.stringify(body) : ''}`); return { dry: true }; }
    const res = await fetch(`${G}/${endpoint}?access_token=${encodeURIComponent(String(env.PAGE_ACCESS_TOKEN || '').trim())}`, {
      method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${method} ${endpoint} → ${res.status} ${JSON.stringify(j.error || j).slice(0, 300)}`);
    return j;
  }

  return {
    env, stores,
    log: async msg => { lines.push(`${stamp()}  ${msg}`); console.log(msg); },
    flushLog: async () => {
      if (!lines.length || !env.BOT_KV) return;
      const prev = (await kvGetJson(env, 'log')) || [];
      await env.BOT_KV.put('log', JSON.stringify(prev.concat(lines).slice(-300)));
    },
    seen: async id => env.BOT_KV ? !!(await env.BOT_KV.get('seen:' + id)) : false,
    markSeen: async id => { if (env.BOT_KV) await env.BOT_KV.put('seen:' + id, '1', { expirationTtl: 60 * 60 * 24 * 45 }); },
    replyPublic: (id, text) => graph('POST', `${id}/comments`, { message: text }),
    replyPrivate: (id, text) => graph('POST', `${env.PAGE_ID}/messages`, { recipient: { comment_id: id }, message: { text: text.slice(0, 1990) } }),
    like: id => graph('POST', `${id}/likes`),
    hide: id => graph('POST', id, { is_hidden: true }),
  };
}

async function kvGetJson(env, key) {
  if (!env.BOT_KV) return null;
  try { return JSON.parse((await env.BOT_KV.get(key)) || 'null'); } catch { return null; }
}

/* ---------------------------------------------------------------------
   הטיפול בתגובה
--------------------------------------------------------------------- */
async function handleComment(ctx, v) {
  if (v.item !== 'comment' || v.verb !== 'add') return;
  const { comment_id: id, post_id: postId, parent_id: parentId, message = '', from = {} } = v;
  if (!id || !message.trim()) return;
  if (from.id && from.id === ctx.env.PAGE_ID) return;            // לא מגיבים לעצמנו
  if (await ctx.seen(id)) return;                                 // כבר טיפלנו

  const isReplyInThread = parentId && parentId !== postId;
  const d = await decide(ctx, { message, fromName: from.name, isReplyInThread });
  const short = message.replace(/\s+/g, ' ').slice(0, 90);

  if (d.action === 'ignore') return;
  await ctx.markSeen(id);

  if (d.action === 'stores') {
    await ctx.log(`📍 שאלת "איפה קונים" מ${from.name || 'גולש'} [${d.kind}${d.city ? ': ' + d.city : ''}] "${short}"`);
    try { await ctx.replyPublic(id, d.publicReply); } catch (e) { await ctx.log(`   ⚠️ התגובה הציבורית נכשלה: ${e.message}`); }
    try { await ctx.replyPrivate(id, d.privateReply); } catch (e) { await ctx.log(`   ⚠️ ההודעה הפרטית נכשלה: ${e.message}`); }
    return;
  }

  if (d.action === 'thanks') {
    await ctx.log(`💛 מחמאה מ${from.name || 'גולש'} "${short}" → "${d.reply}"`);
    try { await ctx.like(id); } catch (e) { await ctx.log(`   ⚠️ לייק נכשל: ${e.message}`); }
    try { await ctx.replyPublic(id, d.reply); } catch (e) { await ctx.log(`   ⚠️ התודה נכשלה: ${e.message}`); }
    return;
  }

  if (d.action === 'complaint') {
    const c = {
      id, postId, message, fromName: from.name || '', fromId: from.id || '', health: d.health,
      time: v.created_time ? v.created_time * 1000 : Date.now(),
    };
    let emailed = false;
    try { await sendComplaintEmail(ctx.env, c); emailed = true; }
    catch (e) { await ctx.log(`   ⚠️ שליחת המייל נכשלה: ${e.message}`); }
    // התלונה נשמרת תמיד בקובץ התלונות, ולכן מסתירים גם אם המייל לא יצא
    c.action = emailed ? 'הוסתרה' : 'הוסתרה (המייל לא נשלח – מופיעה בקובץ התלונות)';
    if (ctx.env.BOT_KV) await ctx.env.BOT_KV.put(`complaint:${new Date(c.time).toISOString()}:${id}`, JSON.stringify(c));
    try { await ctx.hide(id); } catch (e) { c.action = 'ההסתרה נכשלה'; await ctx.log(`   ⚠️ ההסתרה נכשלה: ${e.message}`); }
    await ctx.log(`${d.health ? '🚨 תלונה – בטיחות מזון' : '⚠️ תלונה'} מ${from.name || 'גולש'} "${short}" → מייל: ${emailed ? 'נשלח' : 'לא נשלח'} | ${c.action}`);
  }
}

// ההחלטה מה לעשות (בלי לפרסם כלום) – משמש גם לבדיקה בדפדפן
async function decide(ctx, { message, fromName, isReplyInThread }) {
  const stores = ctx.stores;
  if (isWhereToBuy(message, stores) || (isReplyInThread && isCityOnlyReply(message, stores))) {
    const r = buildStoresReply(message, fromName, stores);
    if (quickSentiment(message) === 'positive') r.publicReply = r.publicReply.replace(/^היי[^!]*! /, m => m + 'תודה רבה ❤️ ');
    return { action: 'stores', ...r };
  }
  const s = await classify(ctx.env, message, fromName);
  if (s.type === 'negative') return { action: 'complaint', health: s.health || HEALTH.test(norm(message)), by: s.by };
  if (s.type === 'positive') {
    if (isReplyInThread && message.trim().length < 20) return { action: 'ignore', why: 'תודה קצרה בשרשור' };
    return { action: 'thanks', reply: s.reply, by: s.by };
  }
  return { action: 'ignore', type: s.type, by: s.by };
}

/* ---------------------------------------------------------------------
   מענה לתגובות מהעבר: /webhook?key=...&view=backfill&days=180&dry=1
   עובר על הפוסטים של הדף, ועל כל תגובה ראשית שעוד לא קיבלה מענה מהדף
   מחליט כמו הבוט (חנויות / תודה / תלונה). מחזיר "next" להמשך (מגבלת בקשות של Cloudflare).
--------------------------------------------------------------------- */
async function backfill(env, request, p) {
  const G = `${env.GRAPH_BASE || "https://graph.facebook.com"}/${GRAPH_VERSION}`;
  const tok = encodeURIComponent(String(env.PAGE_ACCESS_TOKEN || '').trim());
  const days = Math.min(Number(p.get('days') || 180), 730);
  const isDry = p.get('dry') !== '0';
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  let budget = 40;                                   // מגבלת בקשות לכל קריאה
  const get = async url => { budget--; const r = await fetch(url); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(JSON.stringify(j.error || r.status).slice(0, 300)); return j; };
  const stores = await getStores(env, request);
  const out = { dry: isDry, days, done: [], skipped: 0, errors: [], next: null };
  const ctx = makeCtx({ ...env, DRY_RUN: isDry ? 'true' : 'false' }, stores);
  let postsUrl = p.get('next') || `${G}/${env.PAGE_ID}/posts?fields=id,created_time&since=${since}&limit=10&access_token=${tok}`;
  try {
    while (postsUrl && budget > 8) {
      const cur = postsUrl;
      const posts = await get(postsUrl);
      postsUrl = (posts.paging && posts.paging.next) || null;
      for (const post of posts.data || []) {
        if (budget < 6) { out.next = cur; break; }        // ממשיכים מאותו עמוד – מה שכבר טופל ידולג
        const cm = await get(`${G}/${post.id}/comments?filter=toplevel&order=chronological&fields=id,message,created_time,from,comments.limit(25){from}&limit=100&access_token=${tok}`);
        for (const c of cm.data || []) {
          if (!c.message || !c.message.trim()) continue;
          if (c.from && c.from.id === env.PAGE_ID) continue;                          // תגובה של הדף עצמו
          if ((c.comments && c.comments.data || []).some(r => r.from && r.from.id === env.PAGE_ID)) { out.skipped++; continue; } // כבר ענינו
          if (await ctx.seen(c.id)) { out.skipped++; continue; }
          const d = await decide(ctx, { message: c.message, fromName: c.from && c.from.name, isReplyInThread: false });
          if (d.action === 'ignore') continue;
          const ageDays = (Date.now() - new Date(c.created_time).getTime()) / 86400000;
          const item = { id: c.id, date: c.created_time.slice(0, 10), from: c.from ? c.from.name : '', text: c.message.slice(0, 120), action: d.action, reply: d.publicReply || d.reply || '' };
          out.done.push(item);
          if (isDry) continue;
          if (budget < 4) { out.next = null; out.errors.push('נעצר באמצע – להריץ שוב'); break; }
          await ctx.markSeen(c.id);
          try {
            if (d.action === 'stores') {
              budget--; await ctx.replyPublic(c.id, d.publicReply);
              if (ageDays < 7) { budget--; await ctx.replyPrivate(c.id, d.privateReply).catch(() => {}); }
            } else if (d.action === 'thanks') {
              budget -= 2; await ctx.like(c.id).catch(() => {}); await ctx.replyPublic(c.id, d.reply);
            } else if (d.action === 'complaint') {
              const rec = { id: c.id, postId: post.id, message: c.message, fromName: item.from, fromId: c.from ? c.from.id : '', health: d.health, time: new Date(c.created_time).getTime(), action: 'הוסתרה (תגובה מהעבר)' };
              if (env.BOT_KV) await env.BOT_KV.put(`complaint:${new Date(rec.time).toISOString()}:${c.id}`, JSON.stringify(rec));
              budget--; await ctx.hide(c.id);
            }
            await ctx.log(`🕘 מהעבר (${item.date}) ${d.action === 'stores' ? '📍' : d.action === 'thanks' ? '💛' : '⚠️'} ${item.from || 'גולש'}: "${item.text.slice(0, 60)}"`);
          } catch (e) { out.errors.push(`${c.id}: ${e.message}`); }
        }
        if (out.next) break;
      }
      if (out.next) break;
    }
    if (!out.next && postsUrl && budget <= 8) out.next = postsUrl;
  } catch (e) { out.errors.push(e.message); }
  await ctx.flushLog();
  if (out.next) out.continueUrl = `/webhook?key=${p.get('key')}&view=backfill&days=${days}&dry=${isDry ? 1 : 0}&html=${p.get('html') || 0}&next=${encodeURIComponent(out.next)}`;
  if (p.get('html') !== '1') return json(out);
  // דף שממשיך לבד עד הסוף – לחיצה אחת על קישור
  const esc2 = t => String(t || '').replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  const label = { stores: '📍 נקודות מכירה', thanks: '💛 תודה', complaint: '⚠️ תלונה – הוסתרה' };
  const rows = out.done.map(x => `<tr><td>${x.date}</td><td>${esc2(x.from)}</td><td>${esc2(x.text)}</td><td>${label[x.action] || x.action}</td></tr>`).join('');
  const html = `<!doctype html><html dir="rtl" lang="he"><meta charset="utf-8"><title>מענה לתגובות מהעבר</title>
${out.continueUrl ? `<meta http-equiv="refresh" content="1;url=${out.continueUrl}">` : ''}
<body style="font-family:Arial,sans-serif;max-width:900px;margin:30px auto;padding:0 16px">
<h2>${out.continueUrl ? '⏳ ממשיך לעבור על תגובות… (לא לסגור את הדף)' : '✅ סיימנו לעבור על התגובות מהעבר'}</h2>
<p>${isDry ? 'מצב תצוגה בלבד – לא פורסם כלום.' : 'הבוט ענה על התגובות שבטבלה.'} בסבב הזה: ${out.done.length} תגובות טופלו, ${out.skipped} דולגו (כבר נענו).</p>
${out.errors.length ? `<p style="color:#b42318">שגיאות: ${esc2(out.errors.join(' | '))}</p>` : ''}
<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%"><tr><th>תאריך</th><th>מי</th><th>תגובה</th><th>מה הבוט עשה</th></tr>${rows}</table></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

/* ---------------------------------------------------------------------
   רשימת החנויות – נקראת מ-stores.csv של האתר (מתעדכנת לבד)
--------------------------------------------------------------------- */
let STORE_CACHE = { at: 0, list: [] };

async function getStores(env, request) {
  if (STORE_CACHE.list.length && Date.now() - STORE_CACHE.at < 60 * 60 * 1000) return STORE_CACHE.list;
  try {
    const url = new URL('/stores.csv', request.url);
    const res = env.ASSETS ? await env.ASSETS.fetch(new Request(url)) : await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const rows = parseCsv((await res.text()).replace(/^﻿/, ''));
    const head = rows.shift().map(h => h.trim());
    const ci = head.indexOf('עיר'), ni = head.indexOf('שם החנות'), ai = head.indexOf('כתובת');
    const list = rows.map(r => ({ city: (r[ci] || '').trim(), name: (r[ni] || '').trim(), address: ai >= 0 ? (r[ai] || '').trim() : '' }))
      .filter(s => s.city && s.name)
      .map(s => ({ ...s, address: /^0\d[\d-]{7,}$/.test(s.address) ? '' : s.address, region: REGION_OF[s.city] || 'אחר' }));
    if (list.length >= 20) STORE_CACHE = { at: Date.now(), list };
  } catch (e) { console.log('stores.csv failed', e.message); }
  return STORE_CACHE.list;
}

function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}

// אזור לכל עיר – כדי להציע חנויות קרובות. עיר חדשה ב-stores.csv שלא כאן → "אחר"
const REGION_OF = {"ירושלים": "ירושלים והסביבה", "קריית יערים": "ירושלים והסביבה", "בית שמש": "ירושלים והסביבה", "מעלה אדומים": "ירושלים והסביבה", "מבשרת ציון": "ירושלים והסביבה", "אפרת": "יהודה ושומרון", "צומת שילת": "ירושלים והסביבה", "תקוע": "יהודה ושומרון", "צור הדסה": "ירושלים והסביבה", "נס הרים": "ירושלים והסביבה", "נחושה": "ירושלים והסביבה", "זכריה": "ירושלים והסביבה", "מבוא חורון": "ירושלים והסביבה", "מודיעין": "ירושלים והסביבה", "ביתר עלית": "ירושלים והסביבה", "תל אביב": "מרכז", "קרית אונו": "מרכז", "רמת השרון": "שרון", "הוד השרון": "שרון", "חדרה": "צפון", "חריש": "צפון", "ראשון לציון": "מרכז", "נס ציונה": "מרכז", "רמלה": "מרכז", "רחובות": "מרכז", "מזכרת בתיה": "מרכז", "בת ים": "מרכז", "בני ברק": "מרכז", "רמת גן": "מרכז", "פתח תקווה": "מרכז", "יהוד": "מרכז", "גבעתיים": "מרכז", "נתניה": "שרון", "חצבה": "דרום", "אור יהודה": "מרכז", "לוד": "מרכז", "כפר סבא": "שרון", "ראש העין": "מרכז", "רעננה": "שרון", "פרדס חנה-כרכור": "צפון", "ראש פינה": "צפון", "עפולה": "צפון", "חיפה": "צפון", "נשר": "צפון", "אלעד": "מרכז", "כוכב יעקב": "יהודה ושומרון", "אריאל": "יהודה ושומרון", "יצהר": "יהודה ושומרון", "באר שבע": "דרום", "מצפה רמון": "דרום", "דימונה": "דרום", "אופקים": "דרום", "אשקלון": "דרום", "קרית מלאכי": "דרום", "אשדוד": "דרום", "יבנה": "מרכז", "שדה עוזיהו": "דרום", "קרית גת": "דרום", "שדרות": "דרום", "אילת": "דרום"};

/* ---------------------------------------------------------------------
   זיהוי "איפה קונים" וערים
--------------------------------------------------------------------- */
const norm = t => (t || '').replace(/[֑-ׇ]/g, '').replace(/[״"׳'`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

const WHERE = '(איפה|היכן|מאיפה|איפא|איפ|באיזה|באיזו|באילו|איזה חנות|איזו חנות|where)';
const BUY = '(קונים|קונה|לקנות|אקנה|רוכשים|לרכוש|ארכוש|רכישה|משיגים|להשיג|אשיג|נמכר|נמכרים|נמכרת|מוכרים|מוכר|למצוא|מוצאים|אמצא|מצאתי|יש|ניתן|אפשר|buy|get)';
const INTENT_PATTERNS = [
  new RegExp(`${WHERE}.{0,40}${BUY}`),
  new RegExp(`${BUY}.{0,25}${WHERE}`),
  /נקודות? מכירה|נקודת מכירה|רשימת (חנויות|סניפים|נקודות)/,
  /(באיזה|באיזו|איזה|איזו) (סופר|רשת|חנות|אטליז|איטליז|קצב|מקום|סניף|עיר)/,
  /(מוכרים|נמכר|יש (את זה|אותו|אותם|לכם)|משיגים|מגיע|מגיעים|משלוח(ים)?) (ב|ל|גם ב|גם ל)\S{2,}/,
  /איך (אפשר )?(להזמין|מזמינים|לקנות|להשיג)/,
  /עושים משלוחים|יש משלוחים|משלוח עד הבית/,
  /\bwhere (can|to|do) (i|we|you)? ?(buy|get|find)/,
];

const CITY_ALIASES = {
  'ירושלים': ['ירושלים', 'ירושליים', 'jerusalem', 'הר חומה', 'גילה', 'בית וגן', 'קריית יובל', 'קרית יובל', 'רמת אשכול', 'מחנה יהודה', 'רמות', 'פסגת זאב', 'קריית מנחם', 'קרית מנחם', 'עין כרם', 'גבעת שאול', 'רמת שלמה', 'בית הכרם', 'קטמון', 'תלפיות', 'ארנונה', 'גבעת זאב', 'ניות'],
  'באר שבע': ['באר שבע', 'בער שבע', 'באר-שבע', 'beer sheva'],
  'פתח תקווה': ['פתח תקווה', 'פתח תקוה', 'פתח-תקווה', 'petah tikva'],
  'ראשון לציון': ['ראשון לציון', 'ראשלצ', 'ראשון-לציון', 'rishon'],
  'פרדס חנה-כרכור': ['פרדס חנה', 'כרכור', 'פרדס-חנה'],
  'תל אביב': ['תל אביב', 'תל-אביב', 'tel aviv', 'יפו'],
  'בית שמש': ['בית שמש', 'בית-שמש', 'רמת בית שמש', 'הר טוב'],
  'בני ברק': ['בני ברק', 'בני-ברק'],
  'בת ים': ['בת ים', 'בת-ים'],
  'רמת גן': ['רמת גן', 'רמת-גן', 'רמג'],
  'כפר סבא': ['כפר סבא', 'כפס', 'כפר-סבא'],
  'מעלה אדומים': ['מעלה אדומים', 'מעלה-אדומים', 'מישור אדומים'],
  'מבשרת ציון': ['מבשרת ציון', 'מבשרת'],
  'ביתר עלית': ['ביתר עלית', 'ביתר עילית', 'ביתר'],
  'קריית יערים': ['קריית יערים', 'קרית יערים', 'טלז סטון', 'טלזסטון'],
  'קרית אונו': ['קרית אונו', 'קריית אונו'],
  'קרית מלאכי': ['קרית מלאכי', 'קריית מלאכי'],
  'קרית גת': ['קרית גת', 'קריית גת'],
  'מודיעין': ['מודיעין', 'מודיעין מכבים רעות'],
  'רמת השרון': ['רמת השרון', 'רמהש'],
  'נס ציונה': ['נס ציונה', 'נס-ציונה'],
  'מזכרת בתיה': ['מזכרת בתיה', 'מזכרת'],
  'ראש העין': ['ראש העין', 'ראש-העין'],
  'צומת שילת': ['שילת'],
  'חיפה': ['חיפה', 'haifa'],
  'אילת': ['אילת', 'eilat'],
};
const CITY_TO_REGION = {
  'חולון': 'מרכז', 'הרצליה': 'שרון', 'כפר יונה': 'שרון', 'אבן יהודה': 'שרון', 'קדימה': 'שרון', 'צורן': 'שרון',
  'גדרה': 'מרכז', 'גבעת שמואל': 'מרכז', 'שוהם': 'מרכז', 'באר יעקב': 'מרכז', 'גני תקווה': 'מרכז', 'סביון': 'מרכז',
  'נתיבות': 'דרום', 'ערד': 'דרום', 'ירוחם': 'דרום', 'גן יבנה': 'דרום', 'קריית ארבע': 'יהודה ושומרון', 'קרית ארבע': 'יהודה ושומרון',
  'מודיעין עילית': 'ירושלים והסביבה', 'קריית ספר': 'ירושלים והסביבה', 'גוש עציון': 'יהודה ושומרון', 'אלון שבות': 'יהודה ושומרון',
  'בית אל': 'יהודה ושומרון', 'עפרה': 'יהודה ושומרון', 'שילה': 'יהודה ושומרון', 'קרני שומרון': 'יהודה ושומרון', 'עמנואל': 'יהודה ושומרון', 'קדומים': 'יהודה ושומרון', 'הר ברכה': 'יהודה ושומרון',
  'זכרון יעקב': 'צפון', 'זכרון': 'צפון', 'בנימינה': 'צפון', 'קיסריה': 'צפון', 'קריות': 'צפון', 'קריית אתא': 'צפון', 'קרית ביאליק': 'צפון', 'קריית מוצקין': 'צפון', 'טירת כרמל': 'צפון',
  'נהריה': 'צפון', 'עכו': 'צפון', 'כרמיאל': 'צפון', 'טבריה': 'צפון', 'צפת': 'צפון', 'יקנעם': 'צפון', 'נצרת עילית': 'צפון', 'נוף הגליל': 'צפון', 'קריית שמונה': 'צפון', 'מגדל העמק': 'צפון',
};

function findCity(text, stores) {
  const t = ' ' + norm(text) + ' ';
  const cand = [];
  for (const c of new Set(stores.map(s => s.city))) for (const a of (CITY_ALIASES[c] || [c])) cand.push({ alias: norm(a), city: c, hasStores: true });
  for (const [c, r] of Object.entries(CITY_TO_REGION)) cand.push({ alias: norm(c), city: c, region: r, hasStores: false });
  cand.sort((a, b) => b.alias.length - a.alias.length);
  return cand.find(c => c.alias.length >= 2 && t.includes(c.alias)) || null;
}

function isWhereToBuy(text, stores) {
  const t = norm(text);
  if (!t) return false;
  if (INTENT_PATTERNS.some(p => p.test(t))) return true;
  return t.length < 40 && /^(יש|יש גם|גם|ו?מה עם|מגיע|מגיעים|נמכר|מוכרים)\s?(ב|ל)/.test(t) && !!findCity(t, stores);
}

function isCityOnlyReply(text, stores) {
  const t = norm(text).replace(/[?!.,]/g, '');
  if (t.length > 30) return false;
  const c = findCity(t, stores);
  if (!c) return false;
  return t.replace(c.alias, '').replace(/^(ב|מ|ל|אני מ|אני ב|גר ב|גרה ב)/, '').trim().length <= 12;
}

const line = s => `• ${s.name}${s.address ? ' – ' + s.address : ''}`;
const lineWithCity = s => `• ${s.name} – ${s.address ? s.address + ', ' : ''}${s.city}`;
const uniqByAddress = list => { const seen = new Set(); return list.filter(s => { if (!s.address) return true; const k = s.city + '|' + s.address; if (seen.has(k)) return false; seen.add(k); return true; }); };
const HOODS = ['הר חומה', 'גילה', 'רמות', 'פסגת זאב', 'קרית מנחם', 'קריית מנחם', 'בית וגן', 'עין כרם', 'גבעת זאב', 'רמת אשכול', 'קריית יובל', 'קרית יובל', 'תלפיות', 'נווה יעקב', 'ניות', 'מחנה יהודה', 'הר טוב', 'קניון עופר', 'קניון עזריאלי'];

function buildStoresReply(message, fromName, stores) {
  const first = (fromName || '').split(' ')[0];
  const hi = first ? `היי ${first}! ` : 'היי! ';
  const city = findCity(message, stores);

  if (city && city.hasStores) {
    let list = uniqByAddress(stores.filter(s => s.city === city.city));
    const tn = norm(message), hood = HOODS.find(h => tn.includes(norm(h)));
    if (hood) list = [...list.filter(s => norm(s.address).includes(norm(hood))), ...list.filter(s => !norm(s.address).includes(norm(hood)))];
    const more = list.length > MAX_PUBLIC ? `\nועוד ${list.length - MAX_PUBLIC} מקומות – שלחנו לך את כולם בהודעה פרטית 📩` : '';
    return {
      kind: 'עיר', city: city.city,
      publicReply: `${hi}ב${city.city} אפשר למצוא אותנו כאן 👇\n${list.slice(0, MAX_PUBLIC).map(line).join('\n')}${more}\n\nכל נקודות המכירה + ניווט: ${STORES_PAGE}`,
      privateReply: `${hi}הנה כל נקודות המכירה של קובה אליהו ב${city.city}:\n${list.map(line).join('\n')}\n\nלרשימה המלאה עם ניווט: ${STORES_PAGE}\nבתיאבון! 😋`,
    };
  }
  if (city && !city.hasStores) {
    const list = uniqByAddress(stores.filter(s => s.region === city.region));
    if (list.length) return {
      kind: 'אזור', city: city.city,
      publicReply: `${hi}ב${city.city} עצמה עוד אין לנו נקודת מכירה, אבל הכי קרוב אליכם 👇\n${list.slice(0, MAX_PUBLIC).map(lineWithCity).join('\n')}\n\nכל נקודות המכירה: ${STORES_PAGE}`,
      privateReply: `${hi}נקודות המכירה של קובה אליהו באזור ${city.region}:\n${list.slice(0, 25).map(lineWithCity).join('\n')}${list.length > 25 ? '\n...' : ''}\n\nהרשימה המלאה עם ניווט: ${STORES_PAGE}`,
    };
  }
  const byRegion = {};
  for (const s of stores) (byRegion[s.region] ||= new Set()).add(s.city);
  return {
    kind: 'כללי',
    publicReply: `${hi}הקובה שלנו נמכרת ביותר מ-${Math.floor(stores.length / 10) * 10} נקודות מכירה בכל הארץ 🙌\nכתבו לנו כאן מאיזו עיר אתם ונגיד לכם איפה הכי קרוב 👇\nאו חפשו בעצמכם: ${STORES_PAGE}`,
    privateReply: `${hi}תודה שפנית לקובה אליהו 😊\nאנחנו נמכרים בערים האלה:\n${Object.entries(byRegion).map(([r, cs]) => `📍 ${r}: ${[...cs].join(', ')}`).join('\n')}\n\nאת כל הכתובות עם ניווט תמצאו כאן: ${STORES_PAGE}`.slice(0, 1990),
  };
}

/* ---------------------------------------------------------------------
   מחמאות ותלונות
--------------------------------------------------------------------- */
const POSITIVE = /(טעים|טעימה|טעימות|מעולה|מעולים|מושלם|מושלמת|מדהים|מדהימה|אלופים|אלוף|אלופה|הכי טוב|הכי טעים|ממליץ|ממליצה|ממליצים|שווה|אהבנו|אוהבים|אוהבת|אוהב|כיף|וואו|ואו|פצצה|חלום|גאונים|כל הכבוד|יישר כח|ישר כח|תודה|בתיאבון|נהנינו|כמו של סבתא|כמו של אמא|טעם של בית|קבועים|מכורים|מכורה|מכור|כל שבוע|נשאר כלום|גמרו הכל|נעלם|יאמי|yummy|😍|🤤|❤|♥|💯|👏|🔥|😋|👌|🥰|💪)/;
const NEGATIVE = /(לא טעים|לא היה טעים|לא ממליץ|לא ממליצה|לא שווה|מאכזב|אכזבה|התאכזב|גרוע|מגעיל|דוחה|התפרק|התפרקו|יקר מדי|יקר מאוד|מחיר מטורף|חבל שקניתי|תלונה|ריקול|הורעל|הרעלה|קלקול|מקולקל|פג תוקף|שרוף|חסר בשר|בלי בשר|רק בצק|לא הגיע|לא עונים|גועל|זוועה|בושה|רמאות|👎|🤮|😡|😠)/;
const NOT_NEGATIVE = /(לא מאכזב|לא היה מאכזב|בכלל לא גרוע|לא גרוע בכלל|לא מתפרק|לא התפרק|לא התפרקו|לא יקר|בכלל לא יקר|אף פעם לא מאכזב|מעולם לא התאכזב|לא חבל)/g;
const MEMORIAL = /((^|\s)זל($|\s|[,.!])|זכרונה|זכרונו|זכרה|זכרו לברכה|עליה השלום|עליו השלום|נפטר|נפטרה|הלכה לעולמה|כבר לא איתנו|מתגעגע|מתגעגעת|געגוע)/;
const HEALTH = /(הרעלה|הורעל|הורעלנו|חולה|חלה|חלינו|חליתי|שלשול|הקאות|הקאתי|הקיא|בית חולים|מיון|קלקול קיבה|גוף זר|זכוכית|פלסטיק בתוך|שערה|שיער בתוך|תולעת|חרק|ריח רע|מסריח|מקולקל|רקוב|פג תוקף|ריקול|משרד הבריאות|אלרגי|תגובה אלרגית)/;

function quickSentiment(text) {
  const t = norm(text).replace(NOT_NEGATIVE, ' ');
  if (!t.trim()) return 'other';
  if (NEGATIVE.test(t)) return 'negative';
  if (POSITIVE.test(t) || POSITIVE.test(text || '')) return 'positive';
  if (MEMORIAL.test(t) && /סבתא|אמא|אימא|הזכיר|מזכיר|טעם/.test(t)) return 'positive';
  return 'other';
}

const pick = a => a[Math.floor(Math.random() * a.length)];
function shortThanks(message, fromName) {
  const t = norm(message), first = (fromName || '').split(' ')[0];
  const fill = x => (first ? x.replace('{n}', first) : x.replace(' {n}', '').replace('{n}', '')).replace(/\s+([,!])/g, '$1');
  if (MEMORIAL.test(t)) return fill('תודה רבה {n} 🤍 יהי זכרה ברוך');
  if (/שבת|שישי/.test(t)) return fill(pick(['תודה רבה {n}, שבת שלום! 🕯️', 'תודה רבה {n}, שבת שלום ובתיאבון 🕯️']));
  return fill(pick(['תודה רבה {n}! ❤️', 'תודה רבה {n} 🙏', 'תודה רבה {n}, בתיאבון! 😋', 'תודה רבה {n}, שמחים שאהבתם ❤️', 'תודה רבה {n}! 🥰']));
}

const CLAUDE_SYSTEM = `את/ה מנהל/ת הקהילה של "קובה אליהו" – קובה ביתית קפואה לפי המתכונים של סבתא אסנת, כשר בשרי מהדרין.
מוצרים: קובה עוף, קובה סיסקה, קובה מטפוניה, הקובה של סבתא אסנת (למרק), קובה אורז (לבישול), קובה נבולסיה, סיגר סיסקה, סיגר מרוקאי, ארנצ'יני סיסקה (לטיגון).
קרא/י תגובה שגולש כתב בפייסבוק של העסק וסווג/י אותה.
אם היא חיובית (מחמאה, תודה, התלהבות, המלצה, אימוג'י אוהב) – כתוב/כתבי תודה קצרה מאוד, בסגנון "תודה רבה מיכל, בתיאבון! 😋":
- "תודה רבה" + שם פרטי + לכל היותר כמה מילים (עד 8 מילים), ואימוג'י אחד. בלי להרחיב. בלי להמציא שום דבר.
- אם הוזכר מישהו שנפטר – תשובה עדינה ("תודה רבה X 🤍 יהי זכרה ברוך").
"negative" רק אם יש באמת תלונה או ביקורת על המוצר או העסק (לא בדיחה, לא "לא מאכזב").
"health": true אם התלונה נוגעת לבטיחות מזון (מחלה, הרעלה, גוף זר, קלקול, תוקף, אלרגיה).
החזר JSON בלבד: {"type":"positive"|"negative"|"question"|"other","reply":"","health":false}`;

async function classify(env, message, fromName) {
  if (env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: env.CLAUDE_MODEL || 'claude-haiku-5-5', max_tokens: 150, system: CLAUDE_SYSTEM,
          messages: [{ role: 'user', content: `שם הגולש: ${fromName || 'לא ידוע'}\nהתגובה:\n"""${String(message).slice(0, 1500)}"""` }],
        }),
      });
      if (!res.ok) throw new Error('Claude ' + res.status);
      const text = ((await res.json()).content || []).map(c => c.text || '').join('');
      const r = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
      if (r.type === 'positive' && !(r.reply || '').trim()) r.reply = shortThanks(message, fromName);
      return { type: r.type || 'other', reply: (r.reply || '').trim(), health: !!r.health, by: 'claude' };
    } catch (e) { console.log('Claude failed, using keywords', e.message); }
  }
  const q = quickSentiment(message);
  return { type: q, reply: q === 'positive' ? shortThanks(message, fromName) : '', health: q === 'negative' && HEALTH.test(norm(message)), by: 'keywords' };
}

/* ---------------------------------------------------------------------
   מייל התלונה (ג'ימייל SMTP) + קובץ CSV
--------------------------------------------------------------------- */
const CSV_HEAD = ['תאריך', 'שם הגולש', 'תגובה', 'בטיחות מזון', 'מה הבוט עשה', 'קישור לפוסט', 'מזהה תגובה', 'מזהה גולש'];
const csvCell = v => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
const csvRow = c => [
  new Date(c.time).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }), c.fromName, c.message, c.health ? 'כן – דחוף' : 'לא',
  c.action || 'הוסתרה', c.postId ? `https://www.facebook.com/${c.postId}` : '', c.id, c.fromId,
].map(csvCell).join(',');

async function complaintsCsvResponse(env) {
  let rows = [];
  if (env.BOT_KV) {
    let cursor;
    do {
      const page = await env.BOT_KV.list({ prefix: 'complaint:', cursor });
      for (const k of page.keys) { const c = await kvGetJson(env, k.name); if (c) rows.push(c); }
      cursor = page.list_complete ? null : page.cursor;
    } while (cursor);
  }
  const body = '﻿' + [CSV_HEAD.map(csvCell).join(','), ...rows.map(csvRow)].join('\r\n') + '\r\n';
  return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="complaints.csv"` } });
}

const b64 = str => { const bytes = new TextEncoder().encode(str); let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const wrap76 = s => s.replace(/.{1,76}/g, m => m + '\r\n');
const encWord = s => `=?UTF-8?B?${b64(s)}?=`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function buildComplaintMime(env, c) {
  const to = env.ALERT_EMAIL_TO || 'kube8eliyahu@gmail.com';
  const from = env.SMTP_USER;
  const boundary = 'kube-' + crypto.randomUUID();
  const subject = `${c.health ? '🚨 דחוף – בטיחות מזון: ' : '⚠️ '}תגובה שלילית בפייסבוק מ${c.fromName || 'גולש'}`;
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px">
<p><b>${c.health ? '🚨 תלונה שנוגעת לבטיחות מזון – מומלץ לחזור ללקוח היום.' : 'התקבלה תגובה שלילית בדף הפייסבוק.'}</b></p>
<p><b>מי:</b> ${esc(c.fromName)}<br><b>מה נכתב:</b> ${esc(c.message)}<br>
<b>מה הבוט עשה:</b> הסתיר את התגובה (הכותב וחבריו עדיין רואים אותה, אפשר לבטל הסתרה בפייסבוק)<br>
<b>הפוסט:</b> <a href="https://www.facebook.com/${esc(c.postId)}">פתיחה בפייסבוק</a></p>
<p style="color:#666">הפרטים בקובץ המצורף.</p></div>`;
  const csv = '﻿' + CSV_HEAD.map(csvCell).join(',') + '\r\n' + csvRow({ ...c, action: 'הוסתרה' }) + '\r\n';
  const fname = `תלונה-${new Date(c.time).toISOString().slice(0, 10)}.csv`;
  return [
    `From: ${encWord('בוט קובה אליהו')} <${from}>`,
    `To: <${to}>`,
    `Subject: ${encWord(subject)}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: <${crypto.randomUUID()}@kubeeliyahu.com>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(b64(html)),
    `--${boundary}`,
    `Content-Type: text/csv; charset=utf-8; name="${encWord(fname)}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename*=UTF-8''${encodeURIComponent(fname)}`,
    '',
    wrap76(b64(csv)),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

// בלי סיסמת ג'ימייל: שולחים דרך FormSubmit – אותו שירות שהטפסים באתר כבר משתמשים בו
async function sendViaFormSubmit(env, subject, fields) {
  const to = env.ALERT_EMAIL_TO || 'kube8eliyahu@gmail.com';
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: 'https://kubeeliyahu.com', Referer: 'https://kubeeliyahu.com/contact.html' },
    body: JSON.stringify({ _subject: subject, _template: 'table', _captcha: 'false', ...fields }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || String(j.success) !== 'true') throw new Error('FormSubmit: ' + (j.message || res.status));
}

function complaintsLink(env) {
  return env.REPORT_KEY ? `https://kubeeliyahu.com/webhook?key=${String(env.REPORT_KEY).trim()}&view=complaints` : '';
}

async function sendComplaintEmail(env, c) {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    const subject = `${c.health ? '🚨 דחוף – בטיחות מזון: ' : '⚠️ '}תגובה שלילית בפייסבוק מ${c.fromName || 'גולש'}`;
    return sendViaFormSubmit(env, subject, {
      'מי כתב': c.fromName || '',
      'מה נכתב': c.message || '',
      'בטיחות מזון': c.health ? 'כן – מומלץ לחזור ללקוח היום' : 'לא',
      'מה הבוט עשה': 'הסתיר את התגובה (הכותב וחבריו עדיין רואים אותה; אפשר לבטל הסתרה בפייסבוק)',
      'קישור לפוסט': c.postId ? `https://www.facebook.com/${c.postId}` : '',
      'קובץ כל התלונות (אקסל)': complaintsLink(env),
    });
  }
  const host = env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(env.SMTP_PORT || 465);
  const tls = String(env.SMTP_TLS ?? 'on') !== 'off';
  const to = env.ALERT_EMAIL_TO || 'kube8eliyahu@gmail.com';
  const sock = connect({ hostname: host, port }, { secureTransport: tls ? 'on' : 'off', allowHalfOpen: false });
  const w = sock.writable.getWriter(), r = sock.readable.getReader();
  const enc = new TextEncoder(), dec = new TextDecoder();
  let buf = '';
  const readReply = async () => {
    for (;;) {
      const lines = buf.split('\r\n');
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3} /.test(lines[i])) { const reply = lines.slice(0, i + 1); buf = lines.slice(i + 1).join('\r\n'); return { code: +lines[i].slice(0, 3), text: reply.join(' | ') }; }
      }
      const { value, done } = await r.read();
      if (done) throw new Error('SMTP: החיבור נסגר');
      buf += dec.decode(value, { stream: true });
    }
  };
  const cmd = async (line, okCodes) => {
    if (line != null) await w.write(enc.encode(line + '\r\n'));
    const rep = await readReply();
    if (!okCodes.includes(rep.code)) throw new Error(`SMTP ${rep.code}: ${rep.text.slice(0, 200)}`);
    return rep;
  };
  try {
    await cmd(null, [220]);
    await cmd('EHLO kubeeliyahu.com', [250]);
    await cmd('AUTH LOGIN', [334]);
    await cmd(b64(env.SMTP_USER), [334]);
    await cmd(b64(env.SMTP_PASS.replace(/\s+/g, '')), [235]);
    await cmd(`MAIL FROM:<${env.SMTP_USER}>`, [250]);
    await cmd(`RCPT TO:<${to}>`, [250, 251]);
    await cmd('DATA', [354]);
    const data = buildComplaintMime(env, c).split('\r\n').map(l => (l.startsWith('.') ? '.' + l : l)).join('\r\n');
    await w.write(enc.encode(data + '\r\n.\r\n'));
    await cmd(null, [250]);
    await cmd('QUIT', [221]).catch(() => {});
  } finally {
    try { await w.close(); } catch {}
    try { sock.close(); } catch {}
  }
}
