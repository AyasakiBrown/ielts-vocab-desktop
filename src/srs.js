/* Shared answer grading + spaced-review ledger.
   One record per word (folded to lower case), shared by the three decks, 生词本 and
   错词本, with separate tracks for spelling (d: 听到能拼), meaning (m: 看见能懂) and
   writing recall (p: 看到中文能写, 生词本写作练习). 口语 self-checks live in track o:
   they only schedule speaking practice and never enter the graded queue. 英义猜词
   (e: 看英文释义能想起并拼出) is graded like the others but scheduled on its own page,
   so it never raises 听写 / 词义 and never fills the mixed 今日复习 queue.
   A level only rises on a clean answer given on a later day than the last mistake or
   hint, so "全对 within one sitting" never counts as remembered. */
(function (scope) {
  'use strict';
  if (scope.IELTSReview) return;
  const KEY = 'ielts_srs', META = 'ielts_srs_meta';
  const STEPS = [0, 1, 3, 7, 14, 30];        // days until the next test, by level
  const MAXLV = STEPS.length - 1, STABLE = 4; // lv>=4: passed a test after a 7-day gap
  const TRACKS = ['d', 'm', 'p', 'e'];        // graded: levels, delayed-test history
  const QUEUE = ['d', 'm', 'p'];               // 今日复习 queue, cap, metrics (e: edef.html)
  const ALL_TRACKS = TRACKS.concat('o');       // + speaking self-checks: merged and reset alike
  const BASIC = ['d', 'm'];                    // what a lookup without a track name means (decks, badges)
  const LABEL = {new: '未学', learning: '学习中', relearn: '遗忘重学', fresh: '刚学会', firming: '待巩固', stable: '较稳定', recheck: '待复核'};
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);  // "constructor" is a real word
  const api = {STEPS, LABEL, STABLE, live: true};
  api.clock = () => Date.now();

  /* ---------- answer grading ---------- */
  const fold = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[‘’ʼ]/g, "'").toLowerCase().trim().replace(/\s+/g, ' ');
  const canon = s => fold(s).replace(/[-‐-―]/g, ' ').replace(/\s+/g, ' ').trim();
  const bare = s => fold(s).replace(/[^a-z0-9]/g, '');
  // Verified British / American pairs. Pattern rules (re→er, our→or, ise→ize) accepted
  // misspellings such as caer, corse and exercize, so every pair is listed or built
  // from a checked stem.
  const PAIRS = ('centre center,centres centers,centred centered,centring centering,theatre theater,theatres theaters,' +
    'metre meter,metres meters,kilometre kilometer,kilometres kilometers,centimetre centimeter,centimetres centimeters,' +
    'millimetre millimeter,millimetres millimeters,litre liter,litres liters,millilitre milliliter,millilitres milliliters,' +
    'fibre fiber,fibres fibers,calibre caliber,sabre saber,sombre somber,spectre specter,lustre luster,meagre meager,' +
    'manoeuvre maneuver,manoeuvres maneuvers,catalogue catalog,catalogues catalogs,dialogue dialog,dialogues dialogs,' +
    'analogue analog,defence defense,offence offense,licence license,licences licenses,pretence pretense,' +
    'travelling traveling,travelled traveled,traveller traveler,travellers travelers,cancelled canceled,cancelling canceling,' +
    'counsellor counselor,counsellors counselors,counselling counseling,jewellery jewelry,jeweller jeweler,' +
    'labelled labeled,labelling labeling,levelled leveled,modelling modeling,modelled modeled,marvellous marvelous,' +
    'fuelled fueled,fuelling fueling,signalling signaling,signalled signaled,woollen woolen,quarrelling quarreling,' +
    'dialled dialed,dialling dialing,equalled equaled,channelled channeled,totalled totaled,panelling paneling,' +
    'tunnelling tunneling,enrol enroll,enrols enrolls,enrolment enrollment,fulfil fulfill,fulfils fulfills,' +
    'fulfilment fulfillment,instalment installment,instalments installments,skilful skillful,wilful willful,' +
    'instil instill,distil distill,appal appall,anaesthetic anesthetic,anaesthesia anesthesia,paediatric pediatric,' +
    'paediatrician pediatrician,encyclopaedia encyclopedia,oestrogen estrogen,diarrhoea diarrhea,foetus fetus,' +
    'archaeology archeology,archaeologist archeologist,archaeological archeological,leukaemia leukemia,' +
    'haemorrhage hemorrhage,haemoglobin hemoglobin,anaemia anemia,gynaecology gynecology,orthopaedic orthopedic,' +
    'mediaeval medieval,aeroplane airplane,aeroplanes airplanes,aesthetic esthetic,palaeontology paleontology,' +
    'programme program,programmes programs,cheque check,cheques checks,tyre tire,tyres tires,kerb curb,plough plow,' +
    'mould mold,moulds molds,mouldy moldy,moult molt,smoulder smolder,grey gray,aluminium aluminum,sceptical skeptical,' +
    'sceptic skeptic,sulphur sulfur,draught draft,pyjamas pajamas,cosy cozy,judgement judgment,ageing aging,' +
    'acknowledgement acknowledgment,likeable likable,sizeable sizable,liveable livable,storey story,storeys stories,' +
    'moustache mustache,speciality specialty,yoghurt yogurt,doughnut donut,omelette omelet,whisky whiskey,' +
    'enquiry inquiry,enquiries inquiries,enquire inquire,artefact artifact,artefacts artifacts,annexe annex,axe ax,' +
    'disc disk,practise practice,learnt learned,spelt spelled,dreamt dreamed,burnt burned,leant leaned,leapt leaped,' +
    'spilt spilled,spoilt spoiled,adviser advisor,advisers advisors,kilogramme kilogram,gramme gram,' +
    'carburettor carburetor,glycerine glycerin').split(',').map(p => p.split(' '));
  // The American form of these is also a different everyday word (tire, check, story…),
  // so it is accepted for the British entry but not the other way round.
  const ONEWAY = new Set('cheque cheques tyre tyres kerb draught storey storeys practise metre metres'.split(' '));
  const PAIR = new Map();
  for (const [a, b] of PAIRS) { PAIR.set(a, b); if (!ONEWAY.has(a)) PAIR.set(b, a); }
  const ISE = new Set(('apolog bapt civil colon emphas hybrid jeopard maxim mesmer minim organ reorgan disorgan plagiar ' +
    'priorit real recogn revital scrutin special synthes util verbal visual critic summar memor modern general ' +
    'character categor author capital central decentral commercial computer custom econom equal fertil final global ' +
    'harmon hospital immun industrial legal local mobil monopol neutral normal optim patron penal personal polar ' +
    'popular privat public rational revolution social stabil destabil standard steril subsid symbol sympath urban ' +
    'vapor victim item familiar digit dramat fantas ideal initial liberal material mechan moistur national natural ' +
    'oxid pressur random satir sensit terror theor union vandal acclimat agon antagon brutal carbon criminal democrat ' +
    'demoral energ external internal formal fossil galvan homogen human hypnot hypothes immobil magnet marginal monet ' +
    'ostrac pasteur pulver scandal secular stigmat synchron systemat tender trivial western conceptual contextual ' +
    'individual institutional international actual').split(' '));
  const YSE = new Set(['anal', 'paral', 'catal', 'breathal']);
  const ISE_END = ['e', 'es', 'ed', 'ing', 'er', 'ers', 'ation', 'ations', 'able'];
  const OUR = new Set(('col fav flav hon lab neighb harb rum behavi hum vap parl arm cand clam demean endeav ferv od ' +
    'ranc rig savi sav splend tum val vig succ').split(' '));
  const OUR_END = ['', 's', 'ed', 'ing', 'ful', 'able', 'ably', 'ite', 'ites', 'hood', 'hoods', 'er', 'ers', 'al', 'ally', 'less', 'y'];
  function variants(token) {
    const out = new Set();
    if (PAIR.has(token)) out.add(PAIR.get(token));
    for (const end of ISE_END) {
      if (!token.endsWith(end)) continue;
      const base = token.slice(0, token.length - end.length), stem = base.slice(0, -2), mid = base.slice(-2);
      if ((mid === 'is' || mid === 'iz') && ISE.has(stem)) out.add(stem + (mid === 'is' ? 'iz' : 'is') + end);
      if ((mid === 'ys' || mid === 'yz') && YSE.has(stem) && end.length <= 3 && end !== 'es') out.add(stem + (mid === 'ys' ? 'yz' : 'ys') + end);
    }
    for (const end of OUR_END) {
      if (!token.endsWith(end)) continue;
      const base = token.slice(0, token.length - end.length);
      if (base.endsWith('our') && OUR.has(base.slice(0, -3))) out.add(base.slice(0, -3) + 'or' + end);
      else if (base.endsWith('or') && OUR.has(base.slice(0, -2))) out.add(base.slice(0, -2) + 'our' + end);
    }
    out.delete(token);
    return out;
  }
  function sameByVariant(want, got) {
    const a = want.split(' '), b = got.split(' ');
    return a.length === b.length && a.every((t, i) => t === b[i] || variants(t).has(b[i]));
  }
  // kind: exact | variant (verified UK/US spelling) | format (letters right, spacing or
  // punctuation wrong — accepted once, never counted as remembered) | bad | empty
  function grade(typed, alts) {
    const got = fold(typed);
    if (!got) return {ok: false, kind: 'empty', empty: true};
    const list = (Array.isArray(alts) ? alts : [alts]).map(a => String(a == null ? '' : a)).filter(a => fold(a));
    const hit = (kind, want, extra) => Object.assign({ok: true, kind, exact: kind === 'exact', clean: kind !== 'format', want}, extra);
    for (const a of list) if (fold(a) === got) return hit('exact', a);
    for (const a of list) if (canon(a) === canon(got)) return hit('exact', a, {hyphen: true});
    for (const a of list) if (sameByVariant(canon(a), canon(got))) return hit('variant', a);
    for (const a of list) if (bare(a) && bare(a) === bare(got)) return hit('format', a);
    return {ok: false, kind: 'bad', want: list[0] || ''};
  }
  Object.assign(api, {fold, grade, variants, key: fold});

  /* ---------- ledger storage ---------- */
  const store = () => { try { return scope.localStorage || null; } catch (e) { return null; } };
  function readJSON(k, fallback) {
    try { const v = JSON.parse(store().getItem(k)); return v && typeof v === 'object' ? v : fallback; } catch (e) { return fallback; }
  }
  let L = {}, M = {};
  function load() {
    L = readJSON(KEY, {}); if (Array.isArray(L)) L = {};
    M = readJSON(META, {}); if (Array.isArray(M)) M = {};
  }
  function write() {
    try { store().setItem(KEY, JSON.stringify(L)); store().setItem(META, JSON.stringify(M)); } catch (e) {}
  }
  function persist(keys) {
    write();
    const items = {};
    for (const k of keys || []) if (own(L, k)) items[k] = L[k];
    try { scope.webkit?.messageHandlers?.persist?.postMessage(JSON.stringify({deck: 'srs', payload: {items, meta: M}})); } catch (e) {}
  }
  // Same rule as server.py / main.swift: per track the newer answer wins, so a fresh
  // mistake on one device is never overwritten by an older higher level elsewhere.
  function mergeRec(a, b) {
    if (!a || typeof a !== 'object') return b;
    if (!b || typeof b !== 'object') return a;
    const hi = (b.t || 0) > (a.t || 0) ? b : a, lo = hi === a ? b : a, out = Object.assign({}, lo, hi);
    out.src = [...new Set([...(Array.isArray(a.src) ? a.src : []), ...(Array.isArray(b.src) ? b.src : [])])];
    for (const name of ALL_TRACKS) {
      const x = a[name], y = b[name];
      if (x && y) out[name] = (y.t || 0) > (x.t || 0) ? y : x; else if (x || y) out[name] = x || y;
    }
    out.t = Math.max(a.t || 0, b.t || 0);
    return out;
  }
  function mergeMeta(cur, inc) {
    const out = Object.assign({}, cur);
    for (const k of Object.keys(inc || {})) {
      if (k === 'cap' || k === 'capT') continue;
      if (typeof inc[k] === 'number') out[k] = Math.max(Number(out[k]) || 0, inc[k]); else if (out[k] === undefined) out[k] = inc[k];
    }
    if (inc && (inc.capT || 0) > (out.capT || 0)) { out.cap = inc.cap; out.capT = inc.capT; }
    return out;
  }
  function adopt(deck) {
    if (!deck || typeof deck !== 'object') return false;
    let changed = false;
    const items = deck.items && typeof deck.items === 'object' ? deck.items : {};
    for (const k of Object.keys(items)) {
      const cur = own(L, k) ? L[k] : null, merged = mergeRec(cur, items[k]);
      if (!cur || JSON.stringify(merged) !== JSON.stringify(cur)) { L[k] = merged; changed = true; }
    }
    const meta = mergeMeta(M, deck.meta);
    if (JSON.stringify(meta) !== JSON.stringify(M)) { M = meta; changed = true; }
    return changed;
  }
  Object.assign(api, {mergeRec, mergeMeta});

  /* ---------- days, stages ---------- */
  function dayNo(ms) {
    const d = new Date(ms == null ? api.clock() : ms);
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5);
  }
  const track = (r, name) => (r && r[name] && typeof r[name] === 'object' ? r[name] : null);
  const active = tr => !!tr && ((tr.n || 0) > 0 || !!tr.sd || !!tr.rc || !!tr.mk);
  function stageOf(tr) {
    if (!active(tr)) return 'new';
    if (tr.rc) return 'recheck';
    const lv = tr.lv || 0;
    if (tr.wd && (tr.ld || 0) <= tr.wd) return lv >= 1 ? 'relearn' : 'learning';   // no later-day success since the last mistake
    return lv >= STABLE ? 'stable' : lv >= 2 ? 'firming' : lv === 1 ? 'fresh' : 'learning';
  }
  function dueText(due, today) {
    if (due == null) return '';
    const n = due - (today == null ? dayNo() : today);
    return n <= 0 ? '今天' : n === 1 ? '明天' : n + ' 天后';
  }
  function describe(r, item) {
    if (!item || typeof item !== 'object') return;
    const w = item.en || item.w || item.word;
    if (w && !r.w) r.w = String(w);
    const zh = item.zh || item.tr || item.meaning;
    if (zh) r.zh = String(zh);
    if (Array.isArray(item.alts) && item.alts.length) r.alts = item.alts.slice(0, 8).map(String);
    for (const f of ['say', 'pos', 'ph', 'col', 'ex']) if (item[f]) r[f] = String(item[f]);
    if (!Array.isArray(r.src)) r.src = [];
    if (item.src && !r.src.includes(item.src)) r.src.push(String(item.src));
  }
  function record(item) {
    const k = fold(typeof item === 'string' ? item : item && (item.key || item.en || item.w || item.word));
    if (!k) return null;
    if (!own(L, k) || !L[k] || typeof L[k] !== 'object') L[k] = {src: []};
    describe(L[k], item);
    return k;
  }
  Object.assign(api, {dayNo, dueText});

  /* ---------- answering ---------- */
  // res: 'ok' (unaided, fully correct) | 'soft' (correct with a hint or a format slip) | 'bad'
  function answer(item, name, res, now) {
    const k = record(item); if (!k || !TRACKS.includes(name)) return null;
    now = now == null ? api.clock() : now;
    const today = dayNo(now), r = L[k];
    const tr = track(r, name) || (r[name] = {lv: 0, due: today, n: 0, ok: 0, bad: 0, soft: 0, h: []});
    const wasActive = active(tr), wasDue = !wasActive || (tr.due || 0) <= today, first = tr.last !== today;
    const since = tr.ls ? today - tr.ls : tr.last ? today - tr.last : null;
    const before = tr.lv || 0;
    let event;
    tr.n = (tr.n || 0) + 1;
    if (first && since != null && since >= 1) {       // first attempt after a real gap: the honest data point
      if (!Array.isArray(tr.h)) tr.h = [];
      tr.h.push([today, since, res === 'ok' ? 1 : res === 'soft' ? 2 : 0]);
      if (tr.h.length > 12) tr.h = tr.h.slice(-12);
    }
    if (first && wasDue && wasActive) tr.rd = today;
    if (res === 'bad') {
      tr.bad = (tr.bad || 0) + 1;
      if (before >= 2) tr.lapse = (tr.lapse || 0) + 1;
      tr.lv = Math.floor(before / 2); tr.wd = today; tr.due = today; event = 'lapse';
    } else if (res === 'soft') {
      tr.soft = (tr.soft || 0) + 1; tr.hd = today;
      if (wasDue) tr.due = today + 1;
      event = 'soft';
    } else {
      tr.ok = (tr.ok || 0) + 1;
      if (tr.wd === today || tr.hd === today) { tr.due = today + 1; event = 'fixed'; }
      else if (wasDue) {
        let lv = Math.min(MAXLV, before + 1);
        if (since != null && lv < MAXLV && since >= STEPS[lv + 1]) lv++;   // remembered across a longer gap than planned
        if (item && item.lvCap != null && lv > item.lvCap) lv = Math.max(before, item.lvCap);   // 英义: same wording as last time
        tr.lv = lv; tr.ld = today; tr.due = today + STEPS[lv]; event = 'up';
      } else event = 'early';
      tr.ls = today;
    }
    delete tr.rc; delete tr.sd; delete tr.so; delete tr.mk;
    tr.last = today; tr.t = now; r.t = now;
    persist([k]);
    if (!item || typeof item !== 'object' || !item.noTally) tally(PAGE === 'wrong' || PAGE === 'review' || PAGE === 'notebook' ? PAGE : item && item.src, r.w || k, res, now);
    const st = stageOf(tr);
    return {key: k, track: name, event, before, lv: tr.lv, due: tr.due, stage: st, label: LABEL[st], text: feedback(event, tr, today)};
  }
  function feedback(event, tr, today) {
    const when = dueText(tr.due, today);
    if (event === 'lapse') return '已记为遗忘 · 本轮稍后重测，明天再考';
    if (event === 'soft') return '借助提示或写法有误，不计入掌握 · ' + when + '独立再测';
    if (event === 'fixed') return '当次纠正 · 明天复测后才算记住';
    if (event === 'early') return '还没到复习日，等级不变 · 下次复习：' + when;
    return LABEL[stageOf(tr)] + ' · 下次复习：' + when;
  }
  // 记忆卡「不熟」: no proof either way, so only bring the word into today's review.
  function flag(item, name, now) {
    const k = record(item); if (!k) return null;
    now = now == null ? api.clock() : now; name = name || 'm';
    const today = dayNo(now), r = L[k], tr = track(r, name) || (r[name] = {lv: 0, n: 0, h: []});
    if (!active(tr)) { tr.sd = 1; tr.so = now; }
    tr.due = Math.min(tr.due == null ? today : tr.due, today); tr.t = now; r.t = now;
    persist([k]); return k;
  }
  // Manual "已掌握": trusted for now, confirmed by a test two weeks later.
  function confirm(item, name, now) {
    const k = record(item); if (!k) return null;
    now = now == null ? api.clock() : now; name = name || 'd';
    const today = dayNo(now), r = L[k], tr = track(r, name) || (r[name] = {lv: 0, n: 0, h: []});
    tr.lv = Math.max(tr.lv || 0, STABLE); tr.due = today + STEPS[tr.lv]; tr.mk = 1;
    delete tr.rc; delete tr.sd; delete tr.so; tr.wd = 0; tr.t = now; r.t = now;
    persist([k]); return k;
  }
  function reset(words, now) {
    now = now == null ? api.clock() : now;
    const keys = [];
    for (const w of words || []) {
      const k = fold(w); if (!k || !own(L, k)) continue;
      for (const name of ALL_TRACKS) if (L[k][name]) L[k][name] = {lv: 0, n: 0, h: [], t: now};
      L[k].t = now; keys.push(k);
    }
    if (keys.length) persist(keys);
  }
  // 口语 self-check (情境说句 / 短句复述). Self-marked, so it never touches d/m/p levels:
  // 卡住了 brings the word back first in the next speaking round, 说出来了 spaces it out.
  const SPEAK_STEPS = [0, 1, 3, 7, 14];
  function spoke(item, ok, now) {
    const k = record(item); if (!k) return null;
    now = now == null ? api.clock() : now;
    const today = dayNo(now), r = L[k], tr = track(r, 'o') || (r.o = {n: 0, ok: 0, bad: 0, st: 0});
    tr.n = (tr.n || 0) + 1;
    if (ok) { tr.ok = (tr.ok || 0) + 1; tr.st = Math.min(SPEAK_STEPS.length - 1, (tr.st || 0) + 1); tr.due = today + SPEAK_STEPS[tr.st]; }
    else { tr.bad = (tr.bad || 0) + 1; tr.st = 0; tr.stuck = today; tr.due = today; }
    tr.last = today; tr.t = now; r.t = now;
    persist([k]);
    return {key: k, due: tr.due, stuck: !ok, text: ok ? '口语下次练习：' + dueText(tr.due, today) : '卡住的词会排在下一组口语练习的最前面'};
  }
  // Order words for a speaking round: stuck (due) first, then never practised, then by due day.
  function speakOrder(words) {
    const today = dayNo();
    const rank = w => { const k = fold(w), tr = own(L, k) ? track(L[k], 'o') : null;
      if (!tr) return [1, 0];
      return [(tr.due || 0) <= today ? 0 : 2, tr.due || 0]; };
    return words.map((w, i) => ({w, i, r: rank(w)}))
      .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.i - b.i).map(x => x.w);
  }
  /* ---------- 英义猜词 (track e) ----------
     code: ind 独立回忆 | hint 提示后想起 | spell 拼写待巩固 | syn 近义词，目标词待复测 | none 未能回忆.
     Only ind counts as remembered; hint / spell / syn bring the word back tomorrow, none
     re-tests it today. opts: {mode:'p'|'t', def: wording index, defs: how many wordings,
     first: first try at this word today}. Each answer is logged in tr.g as
     [day, mode, code, def, first] so practice and test accuracy are never mixed. A level
     past 2 needs a correct answer to a different wording than the last success (when the
     word has one): recognising a familiar sentence is not the same as knowing the word. */
  const RCODE = {none: 0, ind: 1, hint: 2, spell: 3, syn: 4};
  function recall(item, code, opts, now) {
    opts = opts || {};
    if (!own(RCODE, code)) return null;
    const k = fold(item && (item.key || item.en || item.w)); if (!k) return null;
    const prev = own(L, k) ? track(L[k], 'e') : null;
    const sameWording = opts.defs > 1 && prev && prev.dv != null && prev.dv === opts.def;
    const res = code === 'ind' ? 'ok' : code === 'none' ? 'bad' : 'soft';
    const ask = Object.assign({}, item, sameWording ? {lvCap: 2} : null);
    const r = answer(ask, 'e', res, now); if (!r) return null;
    const tr = L[r.key].e, today = dayNo(now == null ? api.clock() : now);
    if (!Array.isArray(tr.g)) tr.g = [];
    tr.g.push([today, opts.mode === 't' ? 't' : 'p', RCODE[code], opts.def || 0, opts.first === false ? 0 : 1]);
    if (tr.g.length > 40) tr.g = tr.g.slice(-40);
    if (code === 'ind') tr.dv = opts.def || 0;
    persist([r.key]);
    const when = dueText(tr.due, today);
    r.text = code === 'ind' ? (r.event === 'fixed' ? '当次纠正 · 明天换一种释义再测，独立答对才算记住'
        : r.event === 'early' ? '还没到复测日，记录不变 · 下次复测：' + when
        : sameWording && tr.lv <= 2 ? '答对了，但和上次是同一条释义 · 下次换一种说法再测（' + when + '）'
        : LABEL[stageOf(tr)] + ' · 下次复测：' + when)
      : code === 'none' ? '记为未能回忆 · 本轮稍后重测，明天再测'
      : code === 'syn' ? '意思对了，目标词还没想起来 · ' + when + '再测目标词'
      : code === 'spell' ? '想到了这个词，拼写还要巩固 · ' + when + '再测'
      : '借助提示想起，不计入独立回忆 · ' + when + '独立再测';
    r.code = code;
    return r;
  }
  // "题目有问题": no score, kept with the learner's answer so the line can be checked.
  function recallFlag(item, reason, typed, def, now) {
    const k = record(item && typeof item === 'object' ? {en: item.en || item.w || item.key, src: item.src} : item); if (!k) return null;
    now = now == null ? api.clock() : now;
    const r = L[k], tr = track(r, 'e') || (r.e = {n: 0, h: []});
    if (!Array.isArray(tr.q)) tr.q = [];
    tr.q.push([dayNo(now), String(reason || ''), String(typed || '').slice(0, 60), def || 0]);
    if (tr.q.length > 10) tr.q = tr.q.slice(-10);
    tr.t = now; r.t = now;
    persist([k]); return k;
  }
  function recallClear(word, now) {               // checked: the flags stay in history, marked done
    const k = fold(word), tr = own(L, k) ? track(L[k], 'e') : null; if (!tr || !Array.isArray(tr.q)) return null;
    now = now == null ? api.clock() : now;
    tr.qd = dayNo(now); tr.t = now; L[k].t = now; persist([k]); return k;
  }
  Object.assign(api, {answer, flag, confirm, reset, spoke, speakOrder, recall, recallFlag, recallClear, RCODE});

  /* ---------- lookups ---------- */
  function info(word, name) {
    const k = fold(word), r = own(L, k) ? L[k] : null, today = dayNo();
    let tr = name ? track(r, name) : null;
    if (!name) tr = BASIC.map(n => track(r, n)).filter(active).sort((a, b) => (a.due || 0) - (b.due || 0))[0] || null;
    const st = stageOf(tr), on = active(tr);
    return {key: k, stage: st, label: LABEL[st], lv: on ? tr.lv || 0 : 0, due: on ? tr.due : null,
      isDue: on && (tr.due || 0) <= today, dueText: on ? dueText(tr.due, today) : '', rec: r, track: tr};
  }
  function isDue(word, name) {
    const k = fold(word), r = own(L, k) ? L[k] : null, today = dayNo();
    return (name ? [name] : BASIC).some(n => { const tr = track(r, n); return active(tr) && (tr.due || 0) <= today; });
  }
  function stable(word) {
    const k = fold(word), r = own(L, k) ? L[k] : null;
    return BASIC.some(n => { const tr = track(r, n); return active(tr) && !tr.rc && (tr.lv || 0) >= STABLE; });
  }
  function badge(word, name) {
    const i = info(word, name);
    if (i.stage === 'new') return '';
    return i.label + (i.dueText ? ' · ' + (i.isDue ? '今天复习' : i.dueText + '复习') : '');
  }
  Object.assign(api, {info, isDue, stable, badge});

  /* ---------- today's queue ---------- */
  function notebookKeys() {
    const set = new Set(), list = readJSON('ielts_nb', []);
    if (Array.isArray(list)) for (const e of list) if (e && e.w) set.add(fold(e.w));
    return set;
  }
  function priority(tr, today) {
    if (tr.wd === today) return 0;                                  // wrong today, still to be re-tested
    if (tr.wd && today - tr.wd <= 7) return 1;                      // recently forgotten
    if (tr.sd && tr.so && today - dayNo(tr.so) <= 14) return 1 + Math.max(0, today - dayNo(tr.so)) / 16;   // imported, missed within two weeks
    if (tr.rc) return 3;                                            // old 已掌握 awaiting a recheck
    if (tr.sd) return 5 - Math.min(0.99, (tr.so || 0) / 1e13);      // older imported backlog, newest mistake first
    const late = today - (tr.due || today), step = STEPS[Math.min(MAXLV, tr.lv || 0)] || 1;
    return 2 - Math.min(0.99, late / (step * 4));
  }
  function cap() { const c = Number(M.cap); return Number.isFinite(c) && c > 0 ? c : 60; }
  function setCap(n) { M.cap = Math.max(5, Math.min(1000, Math.round(Number(n) || 60))); M.capT = api.clock(); persist([]); }
  function doneToday(today) {
    let n = 0;
    for (const k of Object.keys(L)) for (const name of QUEUE) { const tr = track(L[k], name); if (tr && tr.rd === today) n++; }
    return n;
  }
  // opts.cap===false → everything due; opts.src → only words seen in that source;
  // opts.tracks → other tracks than the mixed queue's (英义猜词 asks for ['e'])
  function queue(opts) {
    opts = opts || {};
    const names = Array.isArray(opts.tracks) ? opts.tracks.filter(n => TRACKS.includes(n)) : QUEUE;
    const today = dayNo(), nb = notebookKeys(), all = [];
    for (const k of Object.keys(L)) {
      const r = L[k]; if (!r || typeof r !== 'object') continue;
      const src = Array.isArray(r.src) ? r.src : [];
      if (src.length && src.every(s => s === 'notebook') && !nb.has(k)) continue;   // deleted from 生词本
      if (opts.src && !src.includes(opts.src)) continue;
      for (const name of names) {
        const tr = track(r, name);
        if (active(tr) && (tr.due || 0) <= today) all.push({key: k, track: name, rec: r, tr, pri: priority(tr, today)});
      }
    }
    all.sort((a, b) => a.pri - b.pri || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    if (opts.cap === false) { all.waiting = 0; return all; }
    const must = all.filter(x => x.tr.wd === today), rest = all.filter(x => x.tr.wd !== today);
    const left = Math.max(0, cap() - doneToday(today)), out = must.concat(rest.slice(0, left));
    out.waiting = Math.max(0, rest.length - left);
    return out;
  }
  function summary() {
    const today = dayNo(), q = queue(), bySrc = {};
    let tomorrow = 0, tracked = 0, steady = 0;
    for (const x of q) for (const s of (x.rec.src && x.rec.src.length ? x.rec.src : ['other'])) bySrc[s] = (bySrc[s] || 0) + 1;
    for (const k of Object.keys(L)) for (const name of QUEUE) {
      const tr = track(L[k], name); if (!active(tr)) continue;
      tracked++; if (tr.due === today + 1) tomorrow++; if (!tr.rc && (tr.lv || 0) >= STABLE) steady++;
    }
    return {due: q.length, again: q.filter(x => x.tr.wd === today).length, waiting: q.waiting, done: doneToday(today),
      cap: cap(), tomorrow, tracked, stable: steady, bySrc};
  }
  // Delayed performance: only first attempts after a gap count, never same-day retries.
  function metrics(names) {
    const m = {next: [0, 0], week: [0, 0], answers: 0, soft: 0, lapses: 0, sameDay: [0, 0]};
    for (const k of Object.keys(L)) for (const name of (Array.isArray(names) ? names : QUEUE)) {
      const tr = track(L[k], name); if (!tr) continue;
      m.answers += tr.n || 0; m.soft += tr.soft || 0; m.lapses += tr.lapse || 0;
      for (const h of Array.isArray(tr.h) ? tr.h : []) {
        const slot = h[1] >= 6 ? m.week : h[1] <= 2 ? m.next : null;
        if (slot) { slot[1]++; if (h[2] === 1) slot[0]++; }
      }
    }
    return m;
  }
  Object.assign(api, {queue, summary, metrics, cap, setCap});

  /* ---------- word forms (搭配填空 finds the word inside the learner's own example) ----------
     Regular endings plus a checked list of irregular verbs, plurals and comparatives.
     inflections('stop') → stop, stops, stopped, stopping; phrases inflect their first word
     (take part in → took part in). Only used to FIND the word, never to grade spelling. */
  const IRREG = ('arise arose arisen,awake awoke awoken,be was were been being is am are,bear bore borne born,beat beat beaten,' +
    'become became become,begin began begun,bend bent,bet bet,bind bound,bite bit bitten,bleed bled,blow blew blown,break broke broken,' +
    'breed bred,bring brought,broadcast broadcast,build built,burn burnt burned,burst burst,buy bought,catch caught,choose chose chosen,' +
    'cling clung,come came come,cost cost,creep crept,cut cut,deal dealt,dig dug,do did done does,draw drew drawn,dream dreamt dreamed,' +
    'drink drank drunk,drive drove driven,eat ate eaten,fall fell fallen,feed fed,feel felt,fight fought,find found,flee fled,fly flew flown flies,' +
    'forbid forbade forbidden,forecast forecast,foresee foresaw foreseen,forget forgot forgotten,forgive forgave forgiven,freeze froze frozen,' +
    'get got gotten,give gave given,go went gone goes,grind ground,grow grew grown,hang hung,have has had,hear heard,hide hid hidden,hit hit,' +
    'hold held,hurt hurt,keep kept,kneel knelt,know knew known,lay laid,lead led,lean leant leaned,leap leapt leaped,learn learnt learned,' +
    'leave left,lend lent,let let,lie lay lain lying lied,light lit lighted,lose lost,make made,mean meant,meet met,mislead misled,mistake mistook mistaken,' +
    'misunderstand misunderstood,overcome overcame overcome,overtake overtook overtaken,pay paid,prove proved proven,put put,quit quit,read read,' +
    'rid rid,ride rode ridden,ring rang rung,rise rose risen,run ran run,say said,see saw seen,seek sought,sell sold,send sent,set set,' +
    'sew sewed sewn,shake shook shaken,shed shed,shine shone,shoot shot,show showed shown,shrink shrank shrunk,shut shut,sing sang sung,' +
    'sink sank sunk,sit sat,sleep slept,slide slid,speak spoke spoken,speed sped,spell spelt spelled,spend spent,spill spilt spilled,spin spun,' +
    'split split,spoil spoilt spoiled,spread spread,spring sprang sprung,stand stood,steal stole stolen,stick stuck,sting stung,stink stank stunk,' +
    'strike struck,strive strove striven,swear swore sworn,sweep swept,swell swelled swollen,swim swam swum,swing swung,take took taken,' +
    'teach taught,tear tore torn,tell told,think thought,throw threw thrown,undergo underwent undergone,understand understood,undertake undertook undertaken,' +
    'upset upset,wake woke woken,wear wore worn,weave wove woven,weep wept,win won,wind wound,withdraw withdrew withdrawn,write wrote written')
    .split(',').reduce((m, line) => { const [base, ...forms] = line.split(' '); m[base] = forms; return m; }, {});
  const IRREG_NA = ('child children,man men,woman women,person people,foot feet,tooth teeth,goose geese,mouse mice,ox oxen,analysis analyses,basis bases,' +
    'crisis crises,diagnosis diagnoses,hypothesis hypotheses,thesis theses,phenomenon phenomena,criterion criteria,datum data,medium media,' +
    'curriculum curricula,bacterium bacteria,stimulus stimuli,nucleus nuclei,cactus cacti,fungus fungi,appendix appendices,index indices indexes,' +
    'good better best,well better best,bad worse worst,badly worse worst,far farther further farthest furthest,little less least,many more most,much more most')
    .split(',').reduce((m, line) => { const [base, ...forms] = line.split(' '); m[base] = forms; return m; }, {});
    function wordForms(w) {
    w = String(w || '').toLowerCase();
    const out = new Set([w]);
    if (w.length < 2 || !/^[a-z]+$/.test(w)) return [...out];
    const add = (stem, ends) => ends.forEach(e => out.add(stem + e));
    if (IRREG_NA[w]) { IRREG_NA[w].forEach(f => out.add(f)); return [...out]; }    // children, analyses, better…
    if (IRREG[w]) {                       // listed forms plus -s / -ing only: no "seed" from see
      for (const f of IRREG[w]) out.add(f);
      add(w, /(s|x|z|ch|sh)$/.test(w) ? ['es'] : ['s']);
      if (/ie$/.test(w)) add(w.slice(0, -2), ['ying']);
      else if (/[^e]e$/.test(w)) add(w.slice(0, -1), ['ing']);
      else if (/[^aeiou][aeiou][bdgklmnprtvz]$/.test(w)) add(w + w.slice(-1), ['ing']);
      else add(w, ['ing']);
      return [...out];
    }
    add(w, /(s|x|z|ch|sh)$/.test(w) ? ['es'] : ['s']);
    if (/ie$/.test(w)) { add(w.slice(0, -2), ['ying']); add(w, ['d']); }
    else if (/[^aeiou]y$/.test(w)) { add(w.slice(0, -1), ['ies', 'ied', 'ier', 'iest', 'ily']); add(w, ['ing']); }
    else if (/e$/.test(w)) { add(w, ['d', 'r', 'st']); if (!/(ee|ye|oe)$/.test(w)) add(w.slice(0, -1), ['ing']); else add(w, ['ing']); }
    else {
      add(w, ['ed', 'ing', 'er', 'est']);
      // short vowel + one consonant: stop → stopped, run → running, big → bigger, travel → travelled.
      // Whether the consonant doubles depends on stress, so both spellings are listed: this
      // only locates the word in a sentence, and the unused form never occurs in real text.
      if (/[^aeiou][aeiou][bdgklmnprtvz]$/.test(w)) add(w + w.slice(-1), ['ed', 'ing', 'er', 'est']);
      if (/(?:ic)$/.test(w)) add(w + 'k', ['ed', 'ing']);   // panic → panicked
    }
    if (/fe?$/.test(w) && !/ff$/.test(w)) out.add(w.replace(/fe?$/, 'ves'));
    if (/(?:is)$/.test(w)) out.add(w.slice(0, -2) + 'es');
    return [...out];
  }
  function inflections(phrase) {
    const words = String(phrase || '').trim().split(/\s+/);
    if (!words[0]) return [];
    const head = words[0], rest = words.slice(1).join(' ');
    return wordForms(head).map(f => rest ? f + ' ' + rest : f);
  }
  Object.assign(api, {inflections});

  /* ---------- why was it wrong? ----------
     Repeating a missed word more often does not help when the cause is always the same
     letter group, a word form, or another word that sounds alike. diagnose() names the
     cause from what was typed; troubles() collects the words that keep going wrong. */
  const CAUSE = {double: '双写字母', vowel: '元音', cons: '辅音', order: '字母顺序', omit: '漏字母', extra: '多字母',
    ending: '词尾', multi: '多处拼写', form: '单复数 / 词形', heard: '听成另一个词', homophone: '同音词',
    whole: '整词没拼出', blank: '未作答', meaning: '词义混淆', spot: '易错点', phrase: '短语不完整', unknown: '错因未记录'};
  const ENDINGS = [['ant', 'ent'], ['ance', 'ence'], ['ancy', 'ency'], ['able', 'ible'], ['tion', 'sion'], ['er', 'or', 'ar'],
    ['ary', 'ery', 'ory'], ['al', 'le', 'el'], ['ous', 'us'], ['cal', 'cle'], ['eous', 'ious'], ['ise', 'ice']];
  const FAMILY = new Set(['', 's', 'es', 'e', 'y', 'ed', 'd', 'ing', 'ly', 'er', 'or', 'al', 'ic', 'ical', 'ive', 'ous', 'ity', 'ty',
    'ment', 'ness', 'tion', 'sion', 'ation', 'ance', 'ence', 'ant', 'ent', 'able', 'ible', 'ful', 'less', 'ism', 'ist', 'ize',
    'ise', 'ate', 'ion', 'ure', 'age', 'th', 'cy', 'ce', 't']);
  const isV = c => 'aeiouy'.includes(c);
  const allV = x => !!x && [...x].every(isV), allC = x => !!x && [...x].every(c => /[a-z]/.test(c) && !isV(c));
  function distance(a, b) {                     // adjacent swaps count once
    let prev2 = null, prev = Array.from({length: b.length + 1}, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) {
        let v = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        row.push(v);
      }
      prev2 = prev; prev = row;
    }
    return prev[b.length];
  }
  function lemmas(x) {
    const out = new Set([x]);
    for (const [re, rep] of [[/ies$/, 'y'], [/ied$/, 'y'], [/es$/, ''], [/s$/, ''], [/ed$/, ''], [/ed$/, 'e'], [/ing$/, ''], [/ing$/, 'e'],
      [/(.)\1ing$/, '$1'], [/(.)\1ed$/, '$1']]) if (re.test(x)) { const y = x.replace(re, rep); if (y.length >= 3) out.add(y); }
    return out;
  }
  function plural(one, many) { return many === one + 's' || many === one + 'es' || (one.endsWith('y') && many === one.slice(0, -1) + 'ies'); }
  // opts.isWord(text) → the typed text is an English word (dictionary);
  // opts.isKnown(text) → it is a word the learner has met (own lists) — dictionaries hold
  //   too many rare entries (costal, sill) to call every near miss "another word";
  // opts.sameSound(a, b) → both are pronounced alike (needs phonetics)
  function diagnose(typed, alts, opts) {
    opts = opts || {};
    const got = canon(typed), list = (Array.isArray(alts) ? alts : [alts]).map(canon).filter(Boolean);
    if (!list.length) return null;
    const make = (cause, tip, more) => Object.assign({cause, label: CAUSE[cause], tip, want, got, pre: '', chunk: '', post: '', wrong: ''}, more);
    let want = list[0], d = Infinity;
    for (const a of list) { const x = distance(got, a); if (x < d) { d = x; want = a; } }
    if (!got) return make('blank', '没有作答。先看拼写和释义，再听一遍。');
    if (d === 0) return null;
    let word = false, known = false, alike = false;
    try {
      word = got.length >= 3 && !!(opts.isWord && opts.isWord(got));
      known = got.length >= 3 && !!(opts.isKnown && opts.isKnown(got));
      alike = !!(opts.sameSound && opts.sameSound(got, want));
    } catch (e) {}
    const wt = want.split(' '), gt = got.split(' ');
    if (wt.length > 1 && gt.length < wt.length && gt.every(x => wt.includes(x)))
      return make('phrase', '短语没写全：漏了「' + wt.filter(x => !gt.includes(x)).join(' ') + '」。');
    if (plural(got, want)) return make('form', '单复数：这里是复数「' + want + '」，你写成了单数。注意听词尾的 /s/、/z/、/ɪz/。', {form: 'plural'});
    if (plural(want, got)) return make('form', '单复数：这里是单数「' + want + '」，你写成了复数。', {form: 'single'});
    if ((word || !opts.isWord) && [...lemmas(got)].some(x => lemmas(want).has(x))) return make('form', '词形：你写的「' + got + '」是同一个词的另一种形式，这里要的是「' + want + '」。注意听词尾。', {form: 'ending'});
    if (alike) return make('homophone', '同音词：「' + got + '」和「' + want + '」读音相同，只靠听分不出，要靠释义和语境判断。', {other: got});
    let p = 0; while (p < want.length && p < got.length && want[p] === got[p]) p++;
    if (p >= Math.max(4, Math.ceil(Math.min(want.length, got.length) * 0.6)) && FAMILY.has(want.slice(p)) && FAMILY.has(got.slice(p)) &&
        !ENDINGS.some(g => g.includes(want.slice(p)) && g.includes(got.slice(p))) && d > 1)
      return make('form', '词形：你写的「' + got + '」和「' + want + '」同属一个词族，这里要的是「' + want + '」。', {form: 'family'});
    if (d > Math.max(2, Math.floor(want.length * 0.45)))
      return word ? make('heard', '听成了另一个词：你写的「' + got + '」也是一个词，和「' + want + '」对比着听。', {other: got})
                  : make('whole', '整个词偏差较大，可能没听出来或还不熟。先看拼写、分段记，再听写。');
    let s = 0; while (s < want.length - p && s < got.length - p && want[want.length - 1 - s] === got[got.length - 1 - s]) s++;
    let a = p, b = want.length - s, ta = p, tb = got.length - s;
    const tw = want.slice(a, b), tt = got.slice(ta, tb);
    let cause, tip;
    if (!tt && tw.length === 1 && (want[a - 1] === tw || want[b] === tw)) {
      cause = 'double'; if (want[a - 1] === tw) { a--; ta--; } else { b++; tb++; }
      tip = '双写字母：这里是「' + tw + tw + '」，你只写了一个 ' + tw + '。';
    } else if (!tw && tt.length === 1 && got[ta - 1] === tt && want[a - 1] === tt) {
      cause = 'double'; a--; ta--;
      tip = '不双写：这里只有一个 ' + tt + '，你写了两个。';
    } else if (tw.length >= 2 && tw.length === tt.length && [...tw].sort().join('') === [...tt].sort().join('')) {
      cause = 'order'; tip = '字母顺序：应为「' + tw + '」，你写成了「' + tt + '」。';
    } else if (!tt) {
      if (allV(tw) && (isV(want[a - 1] || '') || isV(want[b] || ''))) cause = 'vowel';
      else { cause = 'omit'; tip = '漏了字母「' + tw + '」。'; if (b < want.length) { b++; tb++; } else if (a > 0) { a--; ta--; } }
    } else if (!tw) {
      cause = 'extra'; tip = '多写了字母「' + tt + '」。';
      if (a > 0) { a--; ta--; } if (b < want.length) { b++; tb++; }
    } else if (allV(tw) && allV(tt)) cause = 'vowel';
    else if (allC(tw) && allC(tt) && tw.length <= 2) { cause = 'cons'; tip = '辅音：应为「' + tw + '」，你写成了「' + tt + '」。'; }
    else cause = 'multi';
    if (cause === 'vowel' || cause === 'multi') {            // show the whole vowel group / doubled pair
      while (a > 0 && isV(want[a - 1]) && want[a - 1] === got[ta - 1]) { a--; ta--; }
      while (b < want.length && isV(want[b]) && want[b] === got[tb]) { b++; tb++; }
      if (a > 0 && want[a - 1] === want[a] && got[ta - 1] === want[a - 1]) { a--; ta--; }
    }
    if (cause !== 'double' && cause !== 'order') {
      let best = '';
      for (const g of ENDINGS) for (const e of g) for (const tail of [e, e + 's']) {
        const at = want.length - tail.length;
        if (want.endsWith(tail) && at <= a && at > 0 && s <= tail.length && tail.length > best.length) best = tail;
      }
      if (best) {
        cause = 'ending'; a = want.length - best.length; ta = a; b = want.length; tb = got.length; tip = '';
      }
    }
    const chunk = want.slice(a, b), wrong = got.slice(ta, tb);
    if (cause === 'ending') tip = '词尾：应为「-' + chunk + '」，你写成了「-' + wrong + '」。';
    if (cause === 'vowel') tip = wrong ? '元音：应为「' + chunk + '」，你写成了「' + wrong + '」。' : '漏了元音字母「' + chunk + '」' + (b === want.length && chunk === 'e' ? '（词尾不发音的 e）' : '') + '。';
    if (cause === 'multi') tip = chunk.length > 6 ? '有多处拼写错误，这个词需要分段重记。' : '这一段拼错了：应为「' + chunk + '」，你写成了「' + wrong + '」。';
    const out = chunk.length > 6 ? make(cause, tip) : make(cause, tip, {pre: want.slice(0, a), chunk, post: want.slice(b), wrong});
    if (known) { out.other = got; out.tip += '你写的「' + got + '」是你学过的另一个词，两个要对比着记。'; }
    return out;
  }
  // No typed evidence (old 错词本 counts): point at the places learners usually trip on.
  function spots(word) {
    const w = canon(word), out = [], seen = new Set();
    const add = (a, b, tip) => { if (b > a && !seen.has(a + ':' + b) && out.length < 2) { seen.add(a + ':' + b); out.push({cause: 'spot', label: CAUSE.spot, tip, want: w, got: '', pre: w.slice(0, a), chunk: w.slice(a, b), post: w.slice(b), wrong: ''}); } };
    let m;
    const dbl = /([b-df-hj-np-tv-z])\1/g; while ((m = dbl.exec(w))) add(m.index, m.index + 2, '双写字母「' + m[0] + '」');
    const iei = /ie|ei/g; while ((m = iei.exec(w))) add(m.index, m.index + 2, '「' + m[0] + '」的顺序');
    const mute = /^kn|^wr|^ps|^gn|^rh|mb$|bt|gh|sc(?=[ei])/g; while ((m = mute.exec(w))) add(m.index, m.index + m[0].length, '不发音的字母「' + m[0] + '」');
    for (const g of ENDINGS) for (const e of g) for (const tail of [e + 's', e]) if (w.endsWith(tail) && w.length - tail.length >= 3 && tail.length >= 3) add(w.length - tail.length, w.length, '词尾「-' + tail + '」');
    return out;
  }
  function chunks(word) {                        // rough syllable-sized pieces for display
    return canon(word).split(' ').map(t => {
      const parts = t.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]+$|[^aeiouy](?=[^aeiouy]))?/g) || [t];
      if (parts.length > 1 && /^[^aeiouy]+e$/.test(parts[parts.length - 1])) parts.splice(-2, 2, parts[parts.length - 2] + parts[parts.length - 1]);   // silent final e
      return parts.join('·');
    }).join(' ');
  }
  // Words that keep going wrong and have not been drilled since the last mistake.
  // opts.min: mistakes needed (default 2); opts.isWord / opts.sameSound as in diagnose()
  function troubles(opts) {
    opts = opts || {};
    const min = opts.min || 2, by = new Map();
    const boot = (scope.__INITIAL_STATE__ && scope.__INITIAL_STATE__.decks && scope.__INITIAL_STATE__.decks.wrong) || {};
    const slot = (word, source) => {
      const k = fold(word); if (!k) return null;
      if (!by.has(k)) {
        const r = own(L, k) ? L[k] : null;
        by.set(k, {key: k, word: (r && r.w) || String(word), rec: r, zh: (r && r.zh) || '', src: source || (r && r.src && r.src[0]) || '',
          alts: r && Array.isArray(r.alts) && r.alts.length ? r.alts : String(word).split(/\s*\/\s*/).filter(Boolean),
          n: 0, last: 0, spell: [], meaning: [], causes: {}});
      }
      return by.get(k);
    };
    const events = Object.assign({}, boot.events && typeof boot.events === 'object' ? boot.events : {}, readJSON('ielts_wrong_events', {}));
    for (const e of Object.values(events).sort((x, y) => (x.ts || 0) - (y.ts || 0))) {
      if (!e || !e.word) continue;
      const t = slot(e.word, e.source); if (!t) continue;
      t.n++; t.last = Math.max(t.last, e.ts || 0); if (e.meaning && !t.zh) t.zh = e.meaning;
      if (e.mode === 'quiz') { t.meaning.push({answer: String(e.answer || ''), alt: e.alt || null, ts: e.ts || 0}); t.causes.meaning = (t.causes.meaning || 0) + 1; continue; }
      const expected = Array.isArray(e.expected) && e.expected.length ? e.expected : t.alts;
      const dg = diagnose(e.answer, expected, opts); if (!dg) continue;
      dg.ts = e.ts || 0; t.causes[dg.cause] = (t.causes[dg.cause] || 0) + 1;
      const same = t.spell.findIndex(x => x.cause === dg.cause && x.chunk === dg.chunk && x.pre === dg.pre);
      if (same >= 0) { dg.times = (t.spell[same].times || 1) + 1; t.spell.splice(same, 1); }
      t.spell.push(dg);
    }
    const local = readJSON('ielts_wrong', []);
    for (const e of (Array.isArray(local) ? local : []).concat(Array.isArray(boot.list) ? boot.list : [])) {
      if (!e || !e.en) continue;
      const k = fold(e.en), known = by.get(k);
      if (known) { if (!known.col && e.col) known.col = e.col; continue; }
      if ((e.n || 1) < min) continue;
      const t = slot(e.en, e.src); t.n = e.n || 1; t.last = e.ts || 0; t.zh = t.zh || e.zh || ''; t.col = e.col || '';
      if (Array.isArray(e.alts) && e.alts.length) t.alts = e.alts;
    }
    for (const k of Object.keys(L)) {                       // forgotten again after it had been consolidated
      const r = L[k]; if (!r || by.has(k)) continue;
      const lapses = QUEUE.reduce((n, name) => n + ((track(r, name) && track(r, name).lapse) || 0), 0);
      if (lapses >= 1) { const t = slot(r.w || k); t.n = Math.max(min, lapses); t.last = r.t || 0; }
    }
    const out = [];
    for (const t of by.values()) {
      if (t.n < min) continue;
      const dr = t.rec && t.rec.dr;
      if (dr && (dr.t || 0) >= t.last) continue;            // drilled since the last mistake: wait for the re-test
      if (!t.spell.length && !t.meaning.length) { t.spell = spots(t.alts[0] || t.word); for (const x of t.spell) t.causes.spot = (t.causes.spot || 0) + 1; }
      t.col = t.col || (t.rec && (t.rec.col || t.rec.ex)) || '';
      t.spell.sort((x, y) => (y.times || 1) - (x.times || 1) || (y.ts || 0) - (x.ts || 0));
      t.main = Object.keys(t.causes).sort((x, y) => t.causes[y] - t.causes[x])[0] || (t.spell[0] ? t.spell[0].cause : 'unknown');
      out.push(t);
    }
    return out.sort((x, y) => y.n - x.n || y.last - x.last || (x.key < y.key ? -1 : 1));
  }
  // A finished drill is practice, not proof: levels stay as they are and the word is
  // brought forward to an unaided test on the next day.
  function drilled(item, cause, tracks, now) {
    const k = record(item); if (!k) return null;
    now = now == null ? api.clock() : now;
    const today = dayNo(now), r = L[k];
    r.dr = {t: now, n: ((r.dr && r.dr.n) || 0) + 1, c: String(cause || '')};
    if (cause === 'homophone') r.hom = 1;                   // dictation shows the meaning for this word from now on
    for (const name of tracks && tracks.length ? tracks : ['d']) {
      const tr = track(r, name) || (r[name] = {lv: 0, n: 0, h: [], sd: 1, so: now});
      tr.due = today + 1;                                   // not today: the spelling was just on screen
      tr.t = now;
    }
    r.t = now;
    persist([k]); return k;
  }
  // How many drilled words were missed again afterwards
  function drillEffect() {
    const boot = (scope.__INITIAL_STATE__ && scope.__INITIAL_STATE__.decks && scope.__INITIAL_STATE__.decks.wrong) || {};
    const events = Object.assign({}, boot.events && typeof boot.events === 'object' ? boot.events : {}, readJSON('ielts_wrong_events', {}));
    const last = {};
    for (const e of Object.values(events)) if (e && e.word) { const k = fold(e.word); last[k] = Math.max(last[k] || 0, e.ts || 0); }
    let done = 0, again = 0;
    for (const k of Object.keys(L)) { const dr = L[k] && L[k].dr; if (!dr) continue; done++; if ((last[k] || 0) > (dr.t || 0)) again++; }
    return {done, again};
  }
  const escHTML = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  function explain(dg) {                          // one feedback line: cause, what happened, the spot marked in the word
    if (!dg) return '';
    const word = dg.chunk ? escHTML(dg.pre) + '<b style="color:#d97706;text-decoration:underline">' + escHTML(dg.chunk) + '</b>' + escHTML(dg.post) : '';
    return '🔎 <b>' + escHTML(dg.label) + '</b>　' + escHTML(dg.tip) + (word ? '　<span style="white-space:nowrap">' + word + '</span>' : '');
  }
  // Two words that sound the same cannot be told apart by ear: from now on dictation
  // shows the meaning for this word.
  function noteHomophone(item, now) {
    const k = record(item); if (!k) return null;
    L[k].hom = 1; L[k].t = now == null ? api.clock() : now;
    persist([k]); return k;
  }
  Object.assign(api, {CAUSE, diagnose, spots, chunks, troubles, drilled, drillEffect, distance, explain, noteHomophone});

  /* ---------- meaning-choice distractors ----------
     Wrong options should be plausible, not random: words this learner has mixed it up with
     first, then same part of speech, related meaning (shared characters) or similar spelling.
     An option that shares a whole sense with the right answer would make the question
     ambiguous, so it is never used; opts.exclude lists options reported as ambiguous. */
  const POSMAP = {n: 'n', v: 'v', vt: 'v', vi: 'v', a: 'adj', adj: 'adj', ad: 'adv', adv: 'adv', prep: 'prep', conj: 'conj', pron: 'pron', num: 'num', int: 'int', interj: 'int', art: 'art', aux: 'v', abbr: 'abbr'};
  function posOf(pos, zh) {
    const out = new Set();
    for (const m of String(pos || '').concat('\n', String(zh || '')).matchAll(/(?:^|[\s\n&/])([a-z]{1,6})\./gi)) {
      const p = POSMAP[m[1].toLowerCase()]; if (p) out.add(p);
    }
    return out;
  }
  function senses(zh) {
    return String(zh || '').replace(/[a-z]{1,6}\.\s*/gi, ' ').split(/[；;，,、\/\n]|\s{2,}/)
      .map(x => x.replace(/[（(][^）)]*[）)]|[\[\]【】<>〈〉…]/g, '').trim()).filter(x => x.length >= 1);
  }
  const COMMON = new Set('的地得了是在有和与或及使把被人物者性化等之一不可以为'.split(''));
  const hanzi = zh => new Set([...senses(zh).join('')].filter(c => /[\u4e00-\u9fff]/.test(c) && !COMMON.has(c)));
  function distractors(target, pool, n, opts) {
    opts = opts || {}; n = n || 3;
    const want = String(target.zh || '').trim(), mine = new Set(senses(want)), chars = hanzi(want), pos = posOf(target.pos, want);
    const w = fold(target.w || target.key || ''), confused = new Set((opts.confused || []).map(x => String(x).trim()));
    const exclude = new Set((opts.exclude || []).map(x => String(x).trim())), seen = new Set([want]), scored = [];
    for (const x of pool || []) {
      const zh = String(x && x.zh || '').trim(), k = fold(x && (x.w || x.key) || '');
      if (!zh || seen.has(zh) || exclude.has(zh) || (k && k === w)) continue;
      seen.add(zh);
      if (k && w && grade(k, [w]).ok) continue;                      // harbor for harbour: the same word
      if (senses(zh).some(t => [...mine].some(m => t === m || (Math.min(t.length, m.length) >= 2 && (t.includes(m) || m.includes(t)))))) continue;   // same sense → two right answers
      let score = Math.random() * 1.5;
      if (confused.has(zh) || (k && confused.has(k))) score += 100;
      const p = posOf(x.pos, zh); if (pos.size && [...p].some(t => pos.has(t))) score += 6;
      const share = [...hanzi(zh)].filter(c => chars.has(c)).length; score += Math.min(2, share) * 2.5;
      if (k && w && (k.slice(0, 3) === w.slice(0, 3) || distance(k, w) <= 2)) score += 3;
      scored.push([score, zh]);
    }
    return scored.sort((a, b) => b[0] - a[0]).slice(0, n).map(x => x[1]);
  }
  // Undo one graded answer (an ambiguous question reported by the learner): the track goes
  // back to its state before the answer, stamped now so the correction wins every merge.
  function restoreTrack(item, name, snap, now) {
    const k = fold(typeof item === 'string' ? item : item && (item.key || item.en || item.w));
    if (!k || !own(L, k) || !TRACKS.includes(name)) return null;
    now = now == null ? api.clock() : now;
    L[k][name] = Object.assign({lv: 0, due: dayNo(now), n: 0, h: []}, snap || {}, {t: now}); L[k].t = now;
    persist([k]); return k;
  }
  Object.assign(api, {distractors, restoreTrack, senses});

  /* ---------- daily answer log (deck `stats`) ----------
     {days: {"YYYY-MM-DD": {device: {n, ok, s: {source: [n, ok]}, w: {word: [secondOfDay, res]}}}}}
     Each device only ever grows its own record for a day, so every store merges per
     day + device by keeping the larger n: re-syncing the same record never counts it
     twice, and two devices' answers add up instead of collapsing to the larger one.
     res: 1 clean, 2 hint / format slip, 0 wrong — w keeps the day's FIRST answer per word.
     Records older than KEEP_W days drop w and keep u (words) + f (first-try clean). */
  const SKEY = 'ielts_stats', DEVKEY = 'ielts_dev', KEEP_W = 60;
  const SOURCES = ['p1', 'vj', 'scene', 'notebook', 'wrong', 'review'];
  const PAGE = (() => { try { const m = /([a-z0-9]+)\.html/i.exec(scope.location.pathname); return m ? m[1] : ''; } catch (e) { return ''; } })();
  const pad2 = n => String(n).padStart(2, '0');
  function dateKey(ms) { const d = new Date(ms == null ? api.clock() : ms); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function devId() {
    let id = null; try { id = store().getItem(DEVKEY); } catch (e) {}
    if (!id) {
      id = 'd' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
      try { store().setItem(DEVKEY, id); } catch (e) {}
    }
    return id;
  }
  const count = x => (x && typeof x === 'object' && Number(x.n)) || 0;
  // Same rule as server.py _merge_stats, main.swift mergeStats, learning-data.js mergeStats.
  function mergeStats(cur, inc) {
    const out = {days: Object.assign({}, cur && cur.days)};
    let changed = false;
    const days = inc && inc.days && typeof inc.days === 'object' ? inc.days : {};
    for (const date of Object.keys(days)) {
      const day = days[date]; if (!day || typeof day !== 'object' || date === '__proto__') continue;
      const mine = Object.assign({}, own(out.days, date) ? out.days[date] : null);
      for (const dev of Object.keys(day)) {
        if (dev === '__proto__' || !day[dev] || typeof day[dev] !== 'object') continue;
        if (!own(mine, dev) || count(day[dev]) > count(mine[dev])) { mine[dev] = day[dev]; changed = true; }
      }
      out.days[date] = mine;
    }
    out.changed = changed;
    return out;
  }
  function readStats() { const v = readJSON(SKEY, {}); return {days: v.days && typeof v.days === 'object' ? v.days : {}}; }
  function writeStats(S) { try { store().setItem(SKEY, JSON.stringify({days: S.days})); } catch (e) {} }
  function compact(S, today) {
    const cut = dateKey(new Date(today + 'T00:00:00').getTime() - KEEP_W * 864e5);
    for (const date of Object.keys(S.days)) {
      if (date >= cut) continue;
      for (const dev of Object.keys(S.days[date] || {})) {
        const r = S.days[date][dev];
        if (!r || !r.w) continue;
        const ws = Object.values(r.w);
        r.u = ws.length; r.f = ws.filter(x => Array.isArray(x) && x[1] === 1).length; delete r.w;
      }
    }
  }
  // One submitted answer. src: where it was practised (the page), res: 'ok' | 'soft' | 'bad'.
  function tally(src, word, res, now) {
    now = now == null ? api.clock() : now;
    src = SOURCES.includes(src) ? src : SOURCES.includes(PAGE) ? PAGE : 'other';
    const S = readStats(), date = dateKey(now), dev = devId(), k = fold(word);
    const day = S.days[date] = Object.assign({}, S.days[date]);
    const r = day[dev] = Object.assign({n: 0, ok: 0, s: {}, w: {}}, day[dev]);
    const good = res !== 'bad', d = new Date(now);
    r.n++; if (good) r.ok++;
    r.s = Object.assign({}, r.s); const sc = (r.s[src] || [0, 0]).slice(); sc[0]++; if (good) sc[1]++; r.s[src] = sc;
    r.w = Object.assign({}, r.w);
    if (k && !own(r.w, k)) r.w[k] = [d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(), res === 'ok' ? 1 : res === 'soft' ? 2 : 0];
    compact(S, date); writeStats(S);
    try { scope.webkit?.messageHandlers?.persist?.postMessage(JSON.stringify({deck: 'stats', payload: {days: {[date]: {[dev]: r}}}})); } catch (e) {}
    return r;
  }
  // Today's totals across every device, optionally for one source.
  function todayTotals(src, now) {
    const day = readStats().days[dateKey(now)] || {}, t = {done: 0, ok: 0};
    for (const dev of Object.keys(day)) {
      const r = day[dev]; if (!r) continue;
      if (src) { const sc = r.s && r.s[src]; if (sc) { t.done += sc[0] || 0; t.ok += sc[1] || 0; } }
      else { t.done += r.n || 0; t.ok += r.ok || 0; }
    }
    return t;
  }
  function adoptStats(deck) {
    if (!deck || typeof deck !== 'object') return false;
    const m = mergeStats(readStats(), deck);
    if (m.changed) writeStats(m);
    return m.changed;
  }
  const stats = {tally, today: todayTotals, merge: mergeStats, adopt: adoptStats, read: readStats, devId, dateKey, SOURCES};
  api.stats = stats;

  /* ---------- one-time import of what the app already knows ---------- */
  function seed(now) {
    if ((M.seed || 0) >= 1) return 0;
    now = now == null ? api.clock() : now;
    const today = dayNo(now), keys = [];
    const plant = (item, name, ts) => {
      const k = fold(item.en || item.w || item.word); if (!k) return;
      if (own(L, k) && active(track(L[k], name))) return;
      record(item);
      L[k][name] = {lv: 0, due: today, n: 0, h: [], sd: 1, so: ts || 0, t: now}; L[k].t = now; keys.push(k);
    };
    // On the phone the first page load can run before the sync layer has filled
    // localStorage, so the embedded server snapshot is read as well.
    const boot = (scope.__INITIAL_STATE__ && scope.__INITIAL_STATE__.decks && scope.__INITIAL_STATE__.decks.wrong) || {};
    const local = readJSON('ielts_wrong', []);
    const wrong = (Array.isArray(local) ? local : []).concat(Array.isArray(boot.list) ? boot.list : []);
    for (const e of wrong) if (e && e.en) plant({en: e.en, zh: e.zh, alts: e.alts, pos: e.pos, col: e.col, src: e.src || 'wrong'}, 'd', e.ts);
    const events = Object.assign({}, boot.events && typeof boot.events === 'object' ? boot.events : {}, readJSON('ielts_wrong_events', {}));
    for (const e of Object.values(events)) {
      if (!e || !e.word) continue;
      plant({en: e.word, zh: e.meaning, src: e.source || 'wrong'}, e.mode === 'quiz' ? 'm' : e.mode === 'wcloze' || e.mode === 'wprompt' ? 'p' : 'd', e.ts);
    }
    M.seed = 1;
    persist(keys);
    return keys.length;
  }
  // Old 已掌握 (three right answers, possibly within minutes) becomes 待复核: history
  // is kept, but the word has to pass one unaided test before it counts again.
  function seedLegacy(deck, vocab, prog, now) {
    const flagName = 'leg_' + deck;
    if ((M[flagName] || 0) >= 1 || !Array.isArray(vocab)) return 0;
    now = now == null ? api.clock() : now;
    const today = dayNo(now), keys = [];
    for (const v of vocab) {
      const p = v && prog && own(prog, v.en) ? prog[v.en] : null;
      if (!p || (p.box || 0) < 3) continue;
      const k = fold(v.en);
      if (own(L, k) && QUEUE.some(n => active(track(L[k], n)))) continue;
      record(Object.assign({}, v, {src: deck}));
      L[k].d = {lv: 2, due: today, n: 0, h: [], rc: 1, t: now}; L[k].t = now; keys.push(k);
    }
    M[flagName] = 1;
    persist(keys);
    return keys.length;
  }
  Object.assign(api, {seed, seedLegacy});

  /* ---------- boot ---------- */
  function reload() { load(); return api; }
  api.reload = reload;
  api.all = () => L;
  api.meta = () => M;
  load();
  try { if (adopt(scope.__INITIAL_STATE__ && scope.__INITIAL_STATE__.decks && scope.__INITIAL_STATE__.decks.srs)) write(); } catch (e) {}
  try { adoptStats(scope.__INITIAL_STATE__ && scope.__INITIAL_STATE__.decks && scope.__INITIAL_STATE__.decks.stats); } catch (e) {}
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  scope.IELTSReview = api;
  scope.IELTSStats = stats;
  try { seed(); } catch (e) {}
  try { scope.addEventListener('ielts:pulled', load); } catch (e) {}
})(typeof window === 'undefined' ? globalThis : window);
