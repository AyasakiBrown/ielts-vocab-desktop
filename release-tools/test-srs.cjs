// Grading and scheduling rules of src/srs.js, on a fake clock and an in-memory store.
const assert = require('node:assert/strict');
const path = require('node:path');
const data = new Map(), sent = [];
globalThis.localStorage = {getItem: k => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k)};
globalThis.webkit = {messageHandlers: {persist: {postMessage: s => sent.push(JSON.parse(s))}}};
const RV = require(path.resolve(__dirname, '../src/srs.js'));
const DAY = 864e5, T0 = new Date(2026, 8, 28, 10, 0, 0).getTime();
let now = T0; RV.clock = () => now;
const at = d => { now = T0 + d * DAY; };

// ---- grading: both British and American spellings pass, misspellings do not ----
for (const [typed, want] of [['color', 'colour'], ['colour', 'color'], ['center', 'centre'], ['organize', 'organise'],
  ['organisation', 'organization'], ['neighborhood', 'neighbourhood'], ['traveling', 'travelling'], ['catalog', 'catalogue'],
  ['gray', 'grey'], ['program', 'programme'], ['tire', 'tyre'], ['check', 'cheque'], ['analyze', 'analyse'],
  ['specialize in', 'specialise in'], ['sports center', 'sports centre'], ['favorite', 'favourite']]) {
  const g = RV.grade(typed, [want]);
  assert.equal(g.ok && g.clean, true, typed + ' should be accepted for ' + want);
}
for (const [typed, want] of [['caer', 'care'], ['corse', 'course'], ['jorney', 'journey'], ['exercize', 'exercise'],
  ['prise', 'prize'], ['tor guide', 'tour guide'], ['advize', 'advise'], ['fier', 'fire'], ['tyre', 'tire'],
  ['cheque', 'check'], ['honourary', 'honorary'], ['acommodation', 'accommodation']]) {
  assert.equal(RV.grade(typed, [want]).ok, false, typed + ' must not pass for ' + want);
}
assert.equal(RV.grade('  Accommodation ', ['accommodation']).kind, 'exact');
assert.equal(RV.grade('part time', ['part-time']).kind, 'exact');
assert.equal(RV.grade('resume', ['résumé']).kind, 'exact');
assert.equal(RV.grade('chemist’s', ["chemist's"]).kind, 'exact');
assert.deepEqual([RV.grade('drycleaning', ['dry cleaning']).kind, RV.grade('drycleaning', ['dry cleaning']).clean], ['format', false]);
assert.equal(RV.grade('chemists', ['chemist’s']).kind, 'format');
assert.equal(RV.grade('', ['x']).empty, true);
assert.equal(RV.grade('actress', ['actor', 'actress']).kind, 'exact');

// ---- scheduling ----
const w = {en: 'Accommodation', zh: '住宿', alts: ['accommodation'], src: 'p1'};
at(0);
let r = RV.answer(w, 'd', 'ok');
assert.deepEqual([r.event, r.lv, r.stage], ['up', 1, 'fresh']);
assert.equal(RV.info('accommodation', 'd').dueText, '明天');
r = RV.answer(w, 'd', 'ok');                          // a second right answer the same day proves nothing new
assert.deepEqual([r.event, r.lv], ['early', 1]);
assert.equal(RV.isDue('accommodation'), false);
at(1); r = RV.answer(w, 'd', 'ok'); assert.deepEqual([r.event, r.lv], ['up', 2]);
at(4); r = RV.answer(w, 'd', 'ok'); assert.deepEqual([r.event, r.lv], ['up', 3]);
assert.equal(RV.stable('accommodation'), false);
at(11); r = RV.answer(w, 'd', 'ok'); assert.deepEqual([r.event, r.lv, r.stage], ['up', 4, 'stable']);
assert.equal(RV.stable('accommodation'), true);
assert.equal(RV.isDue('accommodation', 'm'), false);   // spelling says nothing about the meaning track

at(25); r = RV.answer(w, 'd', 'bad');                 // forgetting lowers the saved level at once
assert.deepEqual([r.event, r.lv, r.stage], ['lapse', 2, 'relearn']);
assert.equal(RV.stable('accommodation'), false);
assert.equal(RV.isDue('accommodation', 'd'), true);
r = RV.answer(w, 'd', 'ok');                          // same-day correction
assert.deepEqual([r.event, r.lv], ['fixed', 2]);
assert.equal(RV.info('accommodation', 'd').dueText, '明天');
assert.equal(RV.info('accommodation', 'd').stage, 'relearn');   // fixed the same day: still unproven
at(26); r = RV.answer(w, 'd', 'ok'); assert.deepEqual([r.event, r.lv, r.stage], ['up', 3, 'firming']);

const h = {en: 'receipt', zh: '收据', src: 'notebook'};
at(26); r = RV.answer(h, 'd', 'soft');                // first-letter hint or format slip
assert.deepEqual([r.event, r.lv], ['soft', 0]);
r = RV.answer(h, 'd', 'ok'); assert.equal(r.event, 'fixed');
at(27); r = RV.answer(h, 'd', 'ok'); assert.deepEqual([r.event, r.lv], ['up', 1]);

const late = {en: 'plumber', src: 'p1'};
at(30); RV.answer(late, 'd', 'ok');
at(40); r = RV.answer(late, 'd', 'ok');               // recalled after 10 days although only 1 was planned
assert.deepEqual([r.event, r.lv], ['up', 3]);

// the word "constructor" must not collide with Object.prototype
at(40); r = RV.answer({en: 'constructor', src: 'vj'}, 'm', 'bad');
assert.equal(r.event, 'lapse'); assert.equal(RV.info('constructor', 'm').stage, 'learning');

// ---- merge: the newer answer wins, per track ----
const high = {t: 100, src: ['p1'], zh: '旧', d: {t: 100, lv: 5, due: 99999, n: 9}};
const wrong = {t: 200, src: ['vj'], d: {t: 200, lv: 2, due: 1, n: 10, wd: 1}};
for (const m of [RV.mergeRec(high, wrong), RV.mergeRec(wrong, high)]) {
  assert.equal(m.d.lv, 2); assert.equal(m.t, 200); assert.deepEqual([...m.src].sort(), ['p1', 'vj']); assert.equal(m.zh, '旧');
}
const both = RV.mergeRec({t: 300, d: {t: 300, lv: 1}}, {t: 250, m: {t: 250, lv: 3}, d: {t: 50, lv: 4}});
assert.deepEqual([both.d.lv, both.m.lv], [1, 3]);

// ---- queue, cap, seeding ----
data.clear(); sent.length = 0; RV.reload(); at(50);
data.set('ielts_wrong', JSON.stringify([{en: 'apple', zh: '苹果', alts: ['apple'], src: 'p1', n: 2, ts: 5}, {en: 'pear', zh: '梨', src: 'vj', ts: 9}]));
data.set('ielts_wrong_events', JSON.stringify({a: {word: 'Kiwi', meaning: '猕猴桃', mode: 'quiz', source: 'notebook', ts: 7}, b: {word: 'apple', mode: 'dict', source: 'p1', ts: 8}}));
data.set('ielts_nb', JSON.stringify([{w: 'kiwi', tr: '猕猴桃'}]));
assert.equal(RV.seed(), 3);
assert.equal(RV.seed(), 0);                           // one-time
assert.deepEqual(RV.queue().map(x => x.key + ':' + x.track), ['pear:d', 'kiwi:m', 'apple:d']);
assert.equal(sent.at(-1).deck, 'srs'); assert.equal(Object.keys(sent.at(-1).payload.items).length, 3);
data.set('ielts_nb', '[]');
assert.deepEqual(RV.queue().map(x => x.key), ['pear', 'apple']);   // deleted 生词本 word leaves the queue
const vocab = [{en: 'old', zh: '旧词', alts: ['old']}, {en: 'weak', zh: '弱', alts: ['weak']}];
assert.equal(RV.seedLegacy('p1', vocab, {old: {box: 4, seen: 5}, weak: {box: 1, seen: 3}}), 1);
assert.equal(RV.info('old').stage, 'recheck'); assert.equal(RV.stable('old'), false);
assert.equal(RV.info('weak').stage, 'new');
r = RV.answer(Object.assign({src: 'p1'}, vocab[0]), 'd', 'ok');
assert.deepEqual([r.event, r.lv, r.stage], ['up', 3, 'firming']);
RV.setCap(5);
RV.answer({en: 'pear', src: 'vj'}, 'd', 'bad');
let s = RV.summary();
assert.equal(s.again, 1); assert.equal(s.cap, 5);
assert.equal(RV.queue()[0].key, 'pear');              // today's mistake is re-tested first
for (let i = 0; i < 8; i++) RV.flag({en: 'extra' + i, src: 'vj'}, 'm');
s = RV.summary();
assert.equal(s.done, 2);                              // old + pear were due reviews done today
assert.equal(s.due, 1 + 3); assert.equal(s.waiting, 9 - 3);
RV.confirm({en: 'apple', src: 'wrong'}, 'd');
assert.equal(RV.stable('apple'), true); assert.equal(RV.isDue('apple'), false);
RV.reset(['apple']); assert.equal(RV.info('apple').stage, 'new');
at(51); RV.answer({en: 'pear', src: 'vj'}, 'd', 'ok');
const m = RV.metrics(); assert.deepEqual(m.next, [1, 1]);
// first load on a phone: localStorage still empty, the server snapshot has the 错词本
data.clear(); RV.reload(); at(60);
globalThis.__INITIAL_STATE__ = {decks: {wrong: {list: [{en: 'receipt', zh: '收据', src: 'p1', ts: 3}], events: {z: {word: 'ledger', mode: 'dict', source: 'notebook', ts: 4}}}}};
assert.equal(RV.seed(), 2); assert.equal(RV.isDue('receipt', 'd'), true);
// ---- diagnosis: name the cause from what was typed ----
const lexicon = new Set(['wait', 'weight', 'coil', 'crow', 'tap', 'tape', 'costal', 'mineral', 'minerals', 'boiling', 'mature', 'maturity']);
const sounds = {wait: 'weit', weight: 'weit'};
const dx = {isWord: x => lexicon.has(x), isKnown: x => ['tap', 'tape'].includes(x), sameSound: (a, b) => !!sounds[a] && sounds[a] === sounds[b]};
const dg = (typed, want, o) => { const d = RV.diagnose(typed, [want], o === undefined ? dx : o); return d && [d.cause, d.chunk, d.wrong]; };
assert.deepEqual(dg('acommodation', 'accommodation'), ['double', 'cc', 'c']);
assert.deepEqual(dg('unneccessary', 'unnecessary'), ['double', 'c', 'cc']);
assert.deepEqual(dg('sqaure', 'square'), ['order', 'ua', 'au']);
assert.deepEqual(dg('dignatiry', 'dignitary'), ['order', 'ita', 'ati']);
assert.deepEqual(dg('nevigate', 'navigate'), ['vowel', 'a', 'e']);
assert.deepEqual(dg('costal', 'coastal'), ['vowel', 'oa', 'o']);          // in the dictionary, but not a word the learner knows
assert.equal(RV.diagnose('costal', ['coastal'], dx).other, undefined);
assert.deepEqual(dg('rop', 'rope'), ['vowel', 'e', '']);
assert.deepEqual(dg('seretary', 'secretary'), ['omit', 'cr', 'r']);
assert.deepEqual(dg('elelphant', 'elephant'), ['extra', 'ep', 'elp']);
assert.deepEqual(dg('pesticite', 'pesticide'), ['cons', 'd', 't']);
assert.deepEqual(dg('independant', 'independent'), ['ending', 'ent', 'ant']);
assert.deepEqual(dg('sedimence', 'sediments'), ['ending', 'ents', 'ence']);
assert.deepEqual(dg('exhibision', 'exhibition'), ['ending', 'tion', 'sion']);
assert.deepEqual(dg('aperatus', 'apparatus'), ['multi', 'ppa', 'pe']);
assert.deepEqual(dg('mineral', 'minerals').slice(0, 1), ['form']);
assert.equal(RV.diagnose('mineral', ['minerals'], dx).form, 'plural');
assert.equal(RV.diagnose('journalists', ['journalist'], dx).form, 'single');
assert.equal(RV.diagnose('mature', ['maturity'], dx).form, 'family');
assert.deepEqual(dg('batteris', 'batteries'), ['vowel', 'ie', 'i']);       // not a word: a spelling slip, not another form
assert.deepEqual(dg('wait', 'weight').slice(0, 1), ['homophone']);
assert.deepEqual(dg('coil', 'crow').slice(0, 1), ['heard']);
assert.deepEqual(dg('exsocity', 'exhausted').slice(0, 1), ['whole']);
assert.deepEqual(dg('taken', 'taken off').slice(0, 1), ['phrase']);
assert.deepEqual(dg('', 'apple').slice(0, 1), ['blank']);
assert.equal(dg('Apple', 'apple'), null);
assert.equal(RV.diagnose('tape', ['tap'], dx).other, 'tape');               // both are in the learner's own lists
assert.deepEqual(dg('mineral', 'minerals', {}).slice(0, 1), ['form']);      // works without a dictionary too
assert.deepEqual(RV.spots('accommodation').map(x => x.chunk), ['cc', 'mm']);
assert.deepEqual(RV.spots('receipt').map(x => x.chunk), ['ei']);
assert.equal(RV.chunks('accommodation'), 'ac·com·mo·da·tion'); assert.equal(RV.chunks('navigate'), 'na·vi·gate');

// ---- troubles: repeated mistakes, grouped by cause; drilled words wait for the re-test ----
data.clear(); delete globalThis.__INITIAL_STATE__; RV.reload(); at(70);
const ev = (word, answer, mode, ts, extra) => Object.assign({word, answer, mode, ts, source: 'notebook', meaning: word + '义', date: '2026-09-27'}, extra);
data.set('ielts_wrong_events', JSON.stringify({
  a: ev('navigate', 'nevigate', 'dict', 10), b: ev('navigate', 'nevigate', 'dict', 20), c: ev('navigate', 'navigat', 'dict', 30),
  d: ev('square', 'sqaure', 'dict', 40), e: ev('notable', '合作的', 'quiz', 50, {alt: {w: 'cooperative', zh: '合作的'}}), f: ev('notable', '著名', 'quiz', 60)}));
data.set('ielts_wrong', JSON.stringify([{en: 'accommodation', zh: '住宿', n: 3, ts: 5, col: 'student accommodation', src: 'p1'}, {en: 'pear', n: 1, ts: 6}]));
let tr = RV.troubles({min: 2});
assert.deepEqual(tr.map(t => [t.key, t.n, t.main]), [['navigate', 3, 'vowel'], ['accommodation', 3, 'spot'], ['notable', 2, 'meaning']]);
assert.deepEqual(tr[0].spell.map(x => [x.cause, x.chunk, x.times || 1]), [['vowel', 'a', 2], ['vowel', 'e', 1]]);
assert.equal(tr[2].meaning[0].alt.w, 'cooperative'); assert.equal(tr[1].col, 'student accommodation');
assert.equal(RV.troubles({min: 1}).length, 5);
now += 1000; RV.drilled({en: 'navigate', src: 'notebook'}, 'vowel', ['d']);
assert.deepEqual(RV.troubles({min: 2}).map(t => t.key), ['accommodation', 'notable']);
assert.equal(RV.info('navigate', 'd').dueText, '明天'); assert.equal(RV.info('navigate', 'd').lv, 0);   // practice never raises a level
assert.deepEqual(RV.drillEffect(), {done: 1, again: 0});
data.set('ielts_wrong_events', JSON.stringify(Object.assign(JSON.parse(data.get('ielts_wrong_events')), {g: ev('navigate', 'nevigate', 'dict', now + 5000)})));
assert.deepEqual(RV.troubles({min: 2}).map(t => t.key), ['navigate', 'accommodation', 'notable']);      // missed again → back in
assert.deepEqual(RV.drillEffect(), {done: 1, again: 1});
RV.drilled({en: 'weight'}, 'homophone', ['d']); assert.equal(RV.all().weight.hom, 1);

// ---- daily answer log: every answer counted once per device, devices add up ----
data.delete('ielts_stats'); data.set('ielts_dev', 'devA'); sent.length = 0;
const S = RV.stats, today = S.dateKey(now);
RV.answer({en: 'harbour', src: 'p1'}, 'd', 'bad'); RV.answer({en: 'harbour', src: 'p1'}, 'd', 'ok'); RV.answer({en: 'quay', src: 'vj'}, 'm', 'soft');
let mine = S.read().days[today].devA;
assert.deepEqual([mine.n, mine.ok, mine.s.p1, mine.s.vj], [3, 2, [2, 1], [1, 1]]);
assert.deepEqual(Object.keys(mine.w).sort(), ['harbour', 'quay']); assert.equal(mine.w.harbour[1], 0);   // first answer of the day kept
assert.equal(sent.filter(m => m.deck === 'stats').length, 3);
assert.deepEqual(Object.keys(sent.at(-1).payload.days[today]), ['devA']);                             // only this device's day is sent
S.adopt({days: {[today]: {devB: {n: 5, ok: 5, s: {notebook: [5, 5]}}, devA: {n: 1, ok: 1}}}});        // another device + a stale copy of ours
assert.deepEqual(S.today(), {done: 8, ok: 7}); assert.deepEqual(S.today('p1'), {done: 2, ok: 1});
S.adopt({days: {[today]: {devB: {n: 5, ok: 5, s: {notebook: [5, 5]}}}}});                             // re-synced: still 8
assert.equal(S.today().done, 8);
S.tally('review', 'quay', 'ok'); assert.deepEqual(S.read().days[today].devA.s.review, [1, 1]);
console.log('PASS: UK/US spellings accepted, misspellings rejected, format slips flagged; cross-day promotion, lapses, hints, merge, queue cap and seeding behave as specified; mistakes are diagnosed by cause and drilled words wait for an unaided re-test.');
