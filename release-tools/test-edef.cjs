// 英义猜词: the question bank's hygiene, answer judging, and the separate track e.
const assert = require('node:assert/strict');
const path = require('node:path');
const data = new Map(), sent = [];
globalThis.localStorage = {getItem: k => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k)};
globalThis.webkit = {messageHandlers: {persist: {postMessage: s => sent.push(JSON.parse(s))}}};
const RV = require(path.resolve(__dirname, '../src/srs.js'));
const E = require(path.resolve(__dirname, '../src/edef.js'));
const DAY = 864e5, T0 = new Date(2026, 9, 21, 10, 0, 0).getTime();
let now = T0; RV.clock = () => now;
localStorage.setItem('ielts_nb', JSON.stringify(['anxious', 'mitigate', 'vague', 'vast'].map(w => ({w}))));   // the queue drops words deleted from 生词本
const at = d => { now = T0 + d * DAY; };

// ---- bank hygiene: every definition hides the word, every context has a blank ----
assert.ok(E.size() > 400);
for (const [k, e] of Object.entries(E.entries)) {
  const w = E.fold(e.w), stem = w.replace(/[^a-z]/g, '').slice(0, Math.max(4, Math.min(6, w.length - 2)));
  const forms = [w, ...e.forms.map(E.fold), ...RV.inflections(w)].filter(f => f.length > 2);
  assert.ok(e.defs.length >= 1 && e.pos, k);
  for (const d of e.defs) {
    assert.ok(!new RegExp('\\b' + stem).test(d.text.toLowerCase()), k + ': definition gives away the word: ' + d.text);
    assert.ok(d.ctx.includes('___'), k + ': context needs a blank');
    const c = d.ctx.toLowerCase().replace('___', '');
    for (const f of forms) assert.ok(!new RegExp('\\b' + f.replace(/[^a-z' -]/g, '') + '\\b').test(c), k + ': context contains ' + f);
    assert.ok(d.zh, k + ': Chinese for the tested sense');
    for (const s of d.syn) assert.ok(!forms.includes(E.fold(s)), k + ': synonym list contains the target');
  }
}
for (const [a, b] of Object.entries(E.alias)) assert.ok(E.entries[b], a + ' → ' + b);
assert.equal(E.keyOf('Persuaded'), 'persuade');
assert.equal(E.keyOf('Reputation'), 'reputation');
assert.equal(E.gap('carry out'), 'phrase');
assert.equal(E.gap('Sides'), 'pending');       // too many senses to ask fairly yet

// ---- judging ----
const J = (w, typed, hinted, def) => E.judge(E.entry(w), def || 0, typed, {hinted, RV}).code;
assert.equal(J('reluctant' in E.entries ? 'reluctant' : 'anxious', 'anxious'), 'ind');
assert.equal(J('anxious', 'Anxious '), 'ind');
assert.equal(J('anxious', 'anxious', true), 'hint');
assert.equal(J('anxious', 'worried'), 'syn');                 // reviewed synonym: meaning right, target pending
assert.equal(J('anxious', 'anxous'), 'spell');                // the word was recalled, the spelling was not
assert.equal(J('anxious', 'angry'), 'none');                  // not in the answer table: never let through on looks
assert.equal(J('anxious', ''), 'none');
assert.equal(J('mitigate', 'mitigated'), 'ind');              // a form of the same word
assert.equal(J('license', 'licence'), 'ind');                 // British and American spellings both accepted
assert.equal(J('revitalise', 'revitalize'), 'ind');
assert.equal(J('scepticism', 'skepticism'), 'ind');
assert.equal(J('moustache', 'mustache'), 'ind');
assert.equal(J('high-rise', 'high rise'), 'ind');
assert.equal(J('mitigate', 'reduces'), 'syn');
assert.equal(J('compensate', 'make up', false, 0), 'syn');
assert.equal(J('domestic', 'household', false, 0), 'none');    // a synonym only counts for the wording it was reviewed for
assert.equal(J('domestic', 'household', false, 1), 'syn');
assert.equal(J('conform', 'confirm'), 'spell');               // close letters: counted as a spelling problem, not as right
assert.equal(J('distinguished', 'extinguished'), 'none');     // a different word that only looks similar
assert.equal(E.shape('reluctant'), 'r _ _ _ _ _ _ _ _');

// ---- track e: separate from dictation and meaning, cross-day and new wording needed ----
const item = {en: 'anxious', src: 'notebook'};
RV.answer({en: 'anxious', zh: '焦虑的', src: 'notebook'}, 'd', 'ok');
at(0);
let r = RV.recall(item, 'ind', {mode: 'p', def: 0, defs: 2, first: true});
assert.deepEqual([r.event, r.lv], ['up', 1]);
assert.equal(RV.info('anxious', 'd').lv, 1);                  // dictation untouched
assert.equal(RV.queue().some(x => x.track === 'e'), false);   // never in the mixed 今日复习 queue
let e = RV.all().anxious.e;
assert.deepEqual(e.g[0], [RV.dayNo(), 'p', 1, 0, 1]);
assert.equal(e.dv, 0);
at(1); r = RV.recall(item, 'ind', {mode: 'p', def: 1, defs: 2});
assert.equal(r.lv, 2);
assert.equal(RV.queue({tracks: ['e'], cap: false}).length, 0);
at(4); r = RV.recall(item, 'ind', {mode: 'p', def: 1, defs: 2});      // same wording as the last success
assert.equal(r.lv, 2, 'a familiar wording cannot raise the level past 2');
assert.match(r.text, /同一条释义/);
at(7); r = RV.recall(item, 'ind', {mode: 't', def: 0, defs: 2});      // a different wording, days later
assert.equal(r.lv, 3);
assert.equal(RV.all().anxious.e.g.filter(x => x[1] === 't').length, 1);

const w2 = {en: 'mitigate', src: 'notebook'};
at(10);
r = RV.recall(w2, 'none', {mode: 'p', def: 0, defs: 2});
assert.equal(r.event, 'lapse');
assert.equal(RV.queue({tracks: ['e'], cap: false}).some(x => x.key === 'mitigate'), true);
r = RV.recall(w2, 'ind', {mode: 'p', def: 1, defs: 2, first: false});   // after seeing the answer, same day
assert.equal(r.event, 'fixed');
assert.match(r.text, /当次纠正/);
r = RV.recall({en: 'vague', src: 'notebook'}, 'syn', {mode: 'p', def: 0, defs: 1});
assert.deepEqual([r.event, r.lv, r.due - RV.dayNo()], ['soft', 0, 1]);
r = RV.recall({en: 'vast', src: 'notebook'}, 'spell', {mode: 'p', def: 0, defs: 1});
assert.match(r.text, /拼写/);

// 题目有问题: the answer's effect is undone and the item is kept for checking
const snap = JSON.parse(JSON.stringify(RV.all().vast.e));
RV.recall({en: 'vast', src: 'notebook'}, 'none', {mode: 't', def: 0, defs: 1});
RV.restoreTrack({key: 'vast'}, 'e', snap);
RV.recallFlag({en: 'vast', src: 'notebook'}, 'accept', 'huge', 0);
assert.equal(RV.all().vast.e.lapse || 0, 0);
assert.deepEqual(RV.all().vast.e.q[0].slice(1), ['accept', 'huge', 0]);
RV.recallClear('vast');
assert.ok(RV.all().vast.e.qd >= RV.all().vast.e.q[0][0]);

// merged like the other tracks (newer answer wins per track)
const a = {t: 5, e: {t: 5, lv: 1}, d: {t: 9, lv: 3}}, b = {t: 8, e: {t: 8, lv: 2}, d: {t: 2, lv: 1}};
const m = RV.mergeRec(a, b);
assert.deepEqual([m.e.lv, m.d.lv], [2, 3]);
assert.ok(sent.some(p => p.deck === 'srs' && p.payload.items.anxious && p.payload.items.anxious.e));

console.log('PASS: 英义猜词 bank hides its answers; judging separates recalled / hinted / misspelled / synonym / not recalled; track e is kept apart from dictation and the mixed queue, needs another day and another wording to count as stable, and flagged items are not scored.');
