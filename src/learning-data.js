/* Shared, versioned desktop backup format. No network or personal defaults. */
(function (scope) {
  'use strict';
  const names = ['p1', 'vj', 'scene', 'notebook', 'wrong', 'srs', 'config'];
  const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const check = (yes, message) => { if (!yes) throw Error(message); };
  function safeTree(x, depth = 0) {
    check(depth < 40, '数据嵌套过深');
    if (x && typeof x === 'object') for (const k of Object.keys(x)) {
      // constructor/prototype are legitimate vocabulary words. No dynamic deep
      // assignment is used here; only the legacy prototype setter is forbidden.
      check(k !== '__proto__', '包含不安全字段');
      safeTree(x[k], depth + 1);
    }
  }
  function normalize(input) {
    safeTree(input);
    if (input?.format === 'IELTSVocabBackup') {
      check(input.version === 1, '备份版本不受支持，请使用较新版软件');
      input = input.data;
    }
    check(object(input) && input.v === 1 && object(input.decks), '不是完整学习备份（单词库导出请在原词库中导入）');
    check(Object.keys(input.decks).every(k => names.includes(k)), '包含不支持的词库，请更新软件后恢复');
    const decks = JSON.parse(JSON.stringify(input.decks));
    for (const name of names) {
      const d = decks[name] ??= {};
      check(object(d), '词库格式错误：' + name);
      if (name === 'config') continue;
      if (name === 'srs') {
        d.items ??= {}; d.meta ??= {};
        check(object(d.items) && object(d.meta) && Object.values(d.items).every(object), '复习记录格式错误');
        continue;
      }
      if (name === 'notebook' || name === 'wrong') {
        d.list ??= []; d.del ??= {};
        check(Array.isArray(d.list) && object(d.del), '词表格式错误');
        const key = name === 'notebook' ? 'w' : 'en';
        check(d.list.every(x => object(x) && typeof x[key] === 'string' && x[key].trim()), '单词条目无效');
        check(Object.values(d.del).every(x => typeof x === 'number' && Number.isFinite(x)), '删除记录无效');
      } else {
        for (const f of ['prog', 'settings', 'history']) { d[f] ??= {}; check(object(d[f]), f + ' 格式错误'); }
        check(Object.values(d.prog).every(object), '学习进度格式错误');
        if (d.daily !== undefined) check(object(d.daily), '每日统计格式错误');
        for (const daily of [d.daily, ...Object.values(d.history)].filter(Boolean)) {
          check(typeof daily.date === 'string' && (daily.date === '' || /^\d{4}-\d{1,2}-\d{1,2}$/.test(daily.date)), '统计日期格式错误');
          check(['done','ok'].every(k => Number.isSafeInteger(daily[k]) && daily[k] >= 0) && daily.ok <= daily.done, '统计数量无效');
        }
        const history=Object.values(d.history); d.history={};
        for(const h of history)remember(d,h);
        remember(d, d.daily);
      }
    }
    return {v: 1, decks};
  }
  function remember(deck, daily) {
    if (!daily?.date) return;
    deck.history ??= {};
    const date=daily.date.split('-').map((part,i)=>i ? part.padStart(2,'0') : part).join('-');
    const old = deck.history[date];
    deck.history[date] = {date, done: Math.max(old?.done || 0, daily.done || 0), ok: Math.max(old?.ok || 0, daily.ok || 0)};
  }
  // Review ledger (srs.js): per word and per track the newer answer wins.
  function mergeReview(deck, payload) {
    const out = {items: Object.assign({}, deck?.items), meta: Object.assign({}, deck?.meta)};
    const time = x => (object(x) && Number(x.t)) || 0;
    for (const [k, inc] of Object.entries(payload?.items || {})) {
      if (k === '__proto__' || !object(inc)) continue;
      const cur = Object.hasOwn(out.items, k) ? out.items[k] : null;
      if (!object(cur)) { out.items[k] = inc; continue; }
      const hi = time(inc) > time(cur) ? inc : cur, lo = hi === cur ? inc : cur, rec = Object.assign({}, lo, hi);
      rec.src = [...new Set([...(Array.isArray(cur.src) ? cur.src : []), ...(Array.isArray(inc.src) ? inc.src : [])])];
      for (const name of ['d', 'm']) {
        const a = cur[name], b = inc[name];
        if (object(a) && object(b)) rec[name] = time(b) > time(a) ? b : a; else if (object(a) || object(b)) rec[name] = object(a) ? a : b;
      }
      rec.t = Math.max(time(cur), time(inc));
      out.items[k] = rec;
    }
    for (const [k, v] of Object.entries(payload?.meta || {})) {
      if (k === 'cap' || k === 'capT' || k === '__proto__') continue;
      if (typeof v === 'number') out.meta[k] = Math.max(Number(out.meta[k]) || 0, v); else if (out.meta[k] === undefined) out.meta[k] = v;
    }
    if ((Number(payload?.meta?.capT) || 0) > (Number(out.meta.capT) || 0)) { out.meta.cap = payload.meta.cap; out.meta.capT = payload.meta.capT; }
    return out;
  }
  function parse(text) {
    check(typeof text === 'string' && text.length <= 32 * 1024 * 1024, '备份过大（上限 32 MB）');
    return normalize(JSON.parse(text));
  }
  const pack = data => JSON.stringify({format:'IELTSVocabBackup', version:1, createdAt:new Date().toISOString(), data:normalize(data)}, null, 2);
  function summary(root) {
    const d = normalize(root).decks;
    return `生词 ${d.notebook.list.length} 个，错词 ${d.wrong.list.length} 个；三个词库进度 ${['p1','vj','scene'].map(k=>Object.keys(d[k].prog).length).join(' / ')} 条。包含设置、分类、收藏和已有每日统计。`;
  }
  function hydrate(root, storage) {
    const d = normalize(root).decks;
    for (const n of ['p1','vj','scene']) for (const f of ['prog','daily','settings']) {
      const key = `ielts_${n}_${f}`;
      if (d[n][f] === undefined) storage.removeItem(key); else storage.setItem(key, JSON.stringify(d[n][f]));
    }
    for (const [n,k] of [['notebook','ielts_nb'],['wrong','ielts_wrong']]) {
      storage.setItem(k,JSON.stringify(d[n].list)); storage.setItem(k+'_del',JSON.stringify(d[n].del));
    }
    storage.setItem('ielts_wrong_events',JSON.stringify(d.wrong.events||{}));
    storage.setItem('ielts_nb_sessions',JSON.stringify(d.notebook.sessions||{}));
    storage.setItem('ielts_srs',JSON.stringify(d.srs.items));
    storage.setItem('ielts_srs_meta',JSON.stringify(d.srs.meta));
    storage.setItem('ielts_desktop_config',JSON.stringify(d.config));
    for (const f of ['shortcutsMac','shortcutsWindows']) {
      if (d.config[f]) storage.setItem('ielts_'+f,JSON.stringify(d.config[f])); else storage.removeItem('ielts_'+f);
    }
  }
  // Per-day totals of the three word decks, newest first. Dates are compared as
  // numbers so un-padded legacy keys (2026-9-30) still sort before 2026-10-1.
  const DAILY_DECKS = ['p1', 'vj', 'scene'];
  function dayNumber(date) {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(date || '');
    return m ? (+m[1]) * 10000 + (+m[2]) * 100 + (+m[3]) : NaN;
  }
  function dailyRows(root) {
    const d = normalize(root).decks, totals = new Map();
    // normalize() has already folded each deck's current daily into history.
    for (const n of DAILY_DECKS) for (const h of Object.values(d[n].history)) {
      const day = dayNumber(h.date);
      if (!Number.isFinite(day) || !(h.done > 0)) continue;
      const t = totals.get(day) ?? {done: 0, ok: 0};
      t.done += h.done; t.ok += h.ok; totals.set(day, t);
    }
    return [...totals].sort((a, b) => b[0] - a[0]).map(([day, t]) => ({
      day, date: `${Math.floor(day / 10000)}-${String(Math.floor(day / 100) % 100).padStart(2, '0')}-${String(day % 100).padStart(2, '0')}`,
      done: t.done, ok: t.ok, rate: t.done ? Math.round(t.ok / t.done * 100) : null
    }));
  }
  const localDay = (now = new Date()) => now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  // Day number for "today minus n days" in local time.
  function daysAgo(n, now = new Date()) { const x = new Date(now.getFullYear(), now.getMonth(), now.getDate() - n); return localDay(x); }
  const api = {normalize, parse, pack, summary, hydrate, remember, mergeReview, dailyRows, dayNumber, daysAgo};
  if (typeof module !== 'undefined') module.exports = api;
  else {
    scope.IELTSData = api;
    function renderHistory(box, rows) {
      box.replaceChildren();
      const note = text => { const p = document.createElement('p'); p.style.cssText = 'color:#526074;margin:8px 0'; p.textContent = text; return p; };
      if (!rows.length) { box.append(note('还没有答题记录。在三个词库中听写、选择或卡片练习并提交答案后，这里会按天显示完成题数和正确率。')); return; }
      const since = daysAgo(6), recent = rows.filter(r => r.day >= since);
      let all = false;
      const table = document.createElement('table');
      table.style.cssText = 'width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;margin-top:6px';
      const toggle = document.createElement('button'); toggle.id = 'learning-history-toggle';
      const empty = note('最近 7 天没有答题记录。');
      const cell = (tag, text, right) => { const c = document.createElement(tag); c.textContent = text; c.style.cssText = `padding:6px 8px;border-bottom:1px solid #e6eaf0;text-align:${right ? 'right' : 'left'}`; return c; };
      const draw = () => {
        const shown = all ? rows : recent;
        table.replaceChildren();
        const head = table.createTHead().insertRow();
        ['日期', '完成题数', '正确题数', '正确率'].forEach((t, i) => head.append(cell('th', t, i > 0)));
        const body = table.createTBody();
        for (const r of shown) {
          const tr = body.insertRow();
          tr.append(cell('td', r.date), cell('td', String(r.done), 1), cell('td', String(r.ok), 1), cell('td', r.rate === null ? '—' : r.rate + '%', 1));
        }
        table.hidden = !shown.length; empty.hidden = shown.length > 0;
        toggle.textContent = all ? '只看最近 7 天' : `显示全部（${rows.length} 天）`;
        toggle.hidden = rows.length === recent.length;
      };
      toggle.onclick = () => { all = !all; draw(); };
      box.append(empty, table, toggle); draw();
    }
    scope.showLearningData = () => {
      const old = document.getElementById('learning-data-panel'); if (old) {old.focus(); return;}
      const panel = document.createElement('dialog'); panel.id='learning-data-panel';
      panel.style.cssText='max-width:620px;width:85%;max-height:80vh;overflow:auto;border:0;border-radius:16px;padding:24px;font:15px system-ui;color:#182337';
      panel.innerHTML='<h2>学习记录与数据转移</h2><p>更新时只替换程序，使用同一系统账户，保留应用数据目录。换电脑或跨系统时，先导出完整备份，再在新软件中恢复。</p><p>备份包含你的个人学习数据，请自行妥善保存，不要上传到公开的软件发布页。</p><div id="learning-data-summary"></div><p><button data-action="export">导出完整备份</button> <button data-action="import">从备份恢复…</button> <button data-action="folder">打开自动备份目录</button></p><h3>每日学习记录</h3><p style="font-size:13px;color:#526074">只统计 Part 1 高频词、词汇真经、听力场景词汇三个词库中已提交的答题；生词本、错词本和今日复习不计入。v1.0.3 之前未记录的日期无法补回。</p><div id="learning-history"></div><p><button id="learning-close">关闭</button></p>';
      const state=normalize(scope.__INITIAL_STATE__ || {v:1,decks:{}});
      panel.querySelector('#learning-data-summary').textContent=summary(state);
      renderHistory(panel.querySelector('#learning-history'), dailyRows(state));
      panel.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>scope.webkit?.messageHandlers?.learningData?.postMessage(b.dataset.action));
      panel.querySelector('#learning-close').onclick=()=>panel.close();panel.onclose=()=>panel.remove();
      document.body.append(panel); panel.showModal();
    };
    document.addEventListener('DOMContentLoaded',()=>{
      const zoom=document.getElementById('zoombox');
      if(!zoom || !scope.webkit?.messageHandlers?.learningData)return;
      const intro=document.querySelector('header p');
      if(intro)intro.textContent='三个词库与生词、错词集中练习，学习数据保存在本机。更新保留记录，换电脑可导出完整备份。';
      const entry=document.createElement('button');entry.textContent='学习记录与数据转移';
      entry.style.cssText='margin-top:18px;padding:12px 18px;border:1px solid #2563eb;border-radius:10px;background:#2563eb;color:white;font:15px system-ui;cursor:pointer';
      entry.onclick=scope.showLearningData;zoom.after(entry);
      const footer=document.querySelector('footer');
      if(footer)footer.textContent='更新只需替换程序并保留应用数据目录。换电脑前请导出完整备份；恢复时会先自动备份原记录。快捷键可在「帮助 → 快捷键设置」中修改。';
    });
  }
})(typeof window === 'undefined' ? {} : window);
