// Cesta od 18 do 30: logika hry (simulace se třemi postavami). Texty jsou v content.js, nastavení v config.js.
(function () {
  'use strict';
  var C = window.CONFIG, T = window.CONTENT;

  // ---------- Parametry URL ----------
  var qs = new URLSearchParams(location.search);
  var SRC = (qs.get('src') || '').replace(/[^\w.\-]/g, '').slice(0, 40) || 'primo';
  var TEST = !!C.TEST_MODE || qs.get('test') === '1';
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Pomocné funkce ----------
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      var v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function pickRandom(a) { return a[Math.floor(Math.random() * a.length)]; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bez úložiště to jde i tak */ } }
  function money(n) {
    var s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (n < 0 ? '−' : '') + s + ' Kč';
  }
  function charById(id) { return T.chars.filter(function (c) { return c.id === id; })[0]; }

  // ---------- Stav ----------
  function newSession() {
    return { id: uuid(), start: Date.now(), a: {}, charId: null, shoda: '', rezim: '', second: false,
      wallet: null, bonus: {}, bonusDone: false, hralDruhou: false, scenes: [], finished: false, status: 'castecne' };
  }
  var S = newSession(), ROOT = S, aborted = false, COUNTS = null;
  var steps = [], idx = 0, built = false, head = [];

  // ---------- Počty z Apps Scriptu (návrh druhé postavy) ----------
  (function () {
    if (!C.APPS_SCRIPT_URL) return;
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, C.COUNTS_TIMEOUT_MS || 2000);
    fetch(C.APPS_SCRIPT_URL + '?action=counts', { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(timer); COUNTS = j && j.ok && j.counts ? j.counts : null; })
      .catch(function () { clearTimeout(timer); COUNTS = null; });
  })();

  // ---------- Odesílání (fronta, opakování, bez ztráty) ----------
  var Q_KEY = 'fmb_queue_v2', memQ = {}, sending = false, fails = 0, retryTimer = null;
  try { memQ = JSON.parse(lsGet(Q_KEY) || '{}') || {}; } catch (e) { memQ = {}; }
  function persistQ() { lsSet(Q_KEY, JSON.stringify(memQ)); }
  function enqueue(p) { memQ[p.respondent.id] = p; persistQ(); flush(); }
  function scheduleRetry() {
    if (retryTimer || fails > 8) return;
    retryTimer = setTimeout(function () { retryTimer = null; flush(); }, Math.min(60000, 3000 * Math.pow(2, fails)));
  }
  function flush() {
    var ids = Object.keys(memQ);
    if (!ids.length) return;
    if (!C.APPS_SCRIPT_URL) { if (TEST && window.console) console.info('[test] data k odeslání (bez Apps Scriptu zůstávají lokálně)', memQ[ids[0]]); return; }
    if (sending) return;
    var id = ids[0], body = JSON.stringify(memQ[id]);
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    sending = true;
    fetch(C.APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        clearTimeout(to);
        if (!j || !j.ok) throw new Error('server');
        fails = 0; sending = false;
        if (JSON.stringify(memQ[id]) === body) { delete memQ[id]; persistQ(); }
        flush();
      })
      .catch(function () { clearTimeout(to); sending = false; fails++; scheduleRetry(); });
  }
  window.addEventListener('online', function () { fails = 0; flush(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'hidden' || aborted || S.finished) return;
    if (!S.scenes.some(function (s) { return s.done; })) return;
    var p = buildPayload(S); memQ[S.id] = p; persistQ();
    if (C.APPS_SCRIPT_URL && navigator.sendBeacon) {
      try { navigator.sendBeacon(C.APPS_SCRIPT_URL, new Blob([JSON.stringify(p)], { type: 'text/plain;charset=UTF-8' })); } catch (e) { /* zůstane ve frontě */ }
    }
  });

  function buildPayload(sess) {
    var a = sess.a;
    var r = {
      id: sess.id, cas: new Date(sess.start).toISOString(), src: SRC, test: TEST,
      trvani_s: Math.round((Date.now() - sess.start) / 1000), vek_pasmo: a.vek || '', hlavni_banka: a.banka || '',
      postava: sess.charId || '', shoda: sess.shoda || '', rezim: sess.rezim || '',
      podil_hlavni_banka: sess.wallet == null ? '' : sess.wallet,
      bonus_platba: sess.bonus.platba || '', bonus_hodnota: sess.bonus.hodnota || '', bonus_duvera: sess.bonus.duvera || '',
      hral_druhou_postavu: !!sess.hralDruhou, druhe_hrani: !!sess.second, status: sess.status, mimo_cilovku: a.vek === 'jine'
    };
    var scenes = sess.scenes.filter(function (s) { return s.done; }).map(function (s) {
      return {
        respondent_id: sess.id, cas: new Date(s.t || Date.now()).toISOString(), postava: sess.charId, scena: s.id,
        volba_kod: s.kod || '', volba_text: s.text || '', pomoc_kod: s.pomoc || '', pozornost_1_3: s.poz || '',
        rezim: sess.rezim, test: TEST
      };
    });
    return { v: 2, respondent: r, scenes: scenes };
  }
  function save(sess) { if (!aborted) enqueue(buildPayload(sess)); }

  // ---------- Stav karty postavy ----------
  function cardState(ch, scene) {
    if (!scene || scene.id === 'zaklad' || !scene.change) return ch.start;
    return scene.change.after;
  }
  function prevState(ch, scene) {
    var i = ch.scenes.indexOf(scene);
    return i <= 0 ? ch.start : ch.scenes[i - 1].change.after;
  }

  // ---------- Stavba kroků ----------
  function buildHead() {
    head = [
      { id: 'intro', type: 'intro' },
      single('vek', T.base.vek.q, T.base.vek.options, function () { return S.a.vek; }, function (v) { S.a.vek = v; }, {
        after: function (v) { if (v === 'pod18') { aborted = true; renderSimple(T.under18, '👋'); return 'halt'; } }
      }),
      single('banka', T.base.banka.q, T.base.banka.options, function () { return S.a.banka; }, function (v) { S.a.banka = v; }),
      { id: 'pick', type: 'pick' }
    ];
  }
  function single(id, q, options, get, set, extra) {
    return Object.assign({ id: id, type: 'single', q: q, options: options, get: get, set: set }, extra || {});
  }

  function sceneSteps(ch, scene, rec) {
    var pl = ch.plural, ctx = { ch: ch, scene: scene };
    var baseOpts = scene.options.map(function (o) { return { v: o.k, t: o.t }; });
    var helpOpts = scene.help.map(function (o) { return { v: o.k, t: o.t }; });
    return [
      single('q1_' + scene.id, pl ? T.q1.p : T.q1.s, baseOpts,
        function () { return rec.kod; },
        function (v) { rec.kod = v; rec.text = (scene.options.filter(function (o) { return o.k === v; })[0] || {}).t || ''; },
        { sc: ctx, qn: 1, month: scene.month }),
      single('q2_' + scene.id, pl ? T.q2.p : T.q2.s, helpOpts,
        function () { return rec.pomoc; }, function (v) { rec.pomoc = v; },
        { sc: ctx, qn: 2, month: scene.month }),
      single('q3_' + scene.id, pl ? T.q3.p : T.q3.s, pl ? T.q3.options.p : T.q3.options.s,
        function () { return rec.poz; }, function (v) { rec.poz = v; },
        {
          sc: ctx, qn: 3, month: scene.month,
          after: function () { rec.done = true; rec.t = Date.now(); save(S); }
        })
    ];
  }

  function buildPlay(second) {
    var ch = charById(S.charId);
    var all = [T.baseScene].concat(ch.scenes);
    S.scenes = all.map(function (sc) { return { id: sc.id }; });
    var list = [{ id: 'charIntro', type: 'charIntro', ch: ch, month: 1 }];
    all.forEach(function (sc, i) { list = list.concat(sceneSteps(ch, sc, S.scenes[i])); });
    if (!second) {
      list.push({
        id: 'wallet', type: 'slider', month: 9,
        get: function () { return ROOT.wallet; }, set: function (v) { ROOT.wallet = v; },
        after: function () { finish(); return 'halt'; }
      });
    }
    steps = second ? list : head.concat(list);
    built = true;
  }

  // ---------- Navigace ----------
  function nextIdx(from) { return from + 1 < steps.length ? from + 1 : -1; }
  function prevIdx(from) { return from > 0 ? from - 1 : -1; }
  function goNext() { var n = nextIdx(idx); if (n < 0) { finish(); return; } idx = n; render(); }
  function goBack() { var p = prevIdx(idx); if (p < 0) return; idx = p; render(); }
  function answer(step, v) {
    step.set(v);
    var r = step.after && step.after(v);
    if (r === 'halt') return;
    goNext();
  }
  function finish() {
    S.finished = true; S.status = 'dokonceno';
    save(S);
    renderEnd();
  }

  // ---------- Časová osa ----------
  var PER_STEP_S = 5;
  function updateTimeline(step, rem) {
    var month = step && step.month, pct = 0, label = T.timeline.prep;
    if (step && step.bonus) { pct = 1; label = T.timeline.bonus; }
    else if (S.finished) { pct = 1; label = T.timeline.monthLabel + ' 9'; }
    else if (month) { pct = (month - 1) / 8; label = T.timeline.monthLabel + ' ' + month; }
    document.getElementById('fill').style.width = (pct * 100) + '%';
    document.getElementById('marker').style.left = (pct * 100) + '%';
    document.getElementById('age').textContent = label;
    var mins = Math.ceil(rem * PER_STEP_S / 60);
    document.getElementById('eta').textContent = S.finished || (step && step.bonus) ? '' : (mins >= 2 ? 'ještě asi ' + mins + ' min' : 'už jen chvilka');
    document.getElementById('bar').setAttribute('aria-valuenow', String(Math.round(pct * 100)));
  }
  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1500);
  }

  // ---------- Vykreslení ----------
  var stage = document.getElementById('stage'), actions = document.getElementById('actions');

  function charCard(ch, state, changed) {
    var C2 = T.card;
    function st(key, label) {
      var v = state[key];
      return el('div', { class: 'st' + (v < 0 ? ' neg' : '') + (changed && changed.indexOf(key) >= 0 ? ' chg' : '') }, [
        el('span', { class: 'lb', text: label }), el('span', { class: 'vl', text: money(v) })
      ]);
    }
    return el('div', { class: 'pcard', role: 'group', 'aria-label': 'Karta postavy ' + ch.name }, [
      el('div', { class: 'pc-head' }, [el('span', { class: 'ic', 'aria-hidden': 'true', text: ch.icon }), el('strong', { text: ch.name }),
        el('span', { class: 'age', text: ch.age + ' ' + C2.age + ' · ' + ch.label })]),
      el('div', { class: 'pc-grid' }, [st('income', C2.income), st('rent', C2.rent), st('left', C2.left), st('saved', C2.saved)])
    ]);
  }

  function frame(step) {
    stage.textContent = ''; actions.textContent = '';
    if (step && step.sc) {
      var sc = step.sc, state = cardState(sc.ch, sc.scene), changed = [];
      if (step.qn === 1 && sc.scene.change) {
        var prev = prevState(sc.ch, sc.scene);
        ['income', 'rent', 'left', 'saved'].forEach(function (k) { if (prev[k] !== state[k]) changed.push(k); });
        (sc.scene.change.focus || []).forEach(function (k) { if (changed.indexOf(k) < 0) changed.push(k); });
      }
      stage.appendChild(charCard(sc.ch, state, changed));
    } else if (step && step.type === 'charIntro') {
      stage.appendChild(charCard(step.ch, step.ch.start, []));
    }
    var card = el('section', { class: 'card' + (REDUCED ? '' : ' enter'), 'aria-live': 'polite' });
    stage.appendChild(card);
    return card;
  }
  function heading(card, text, cls) {
    var h = el('h1', { id: 'q', tabindex: '-1', class: cls, text: text });
    card.appendChild(h);
    return h;
  }
  function primary(text, onclick, disabled) {
    return el('button', { class: 'primary', type: 'button', onclick: onclick, text: text, disabled: disabled ? true : null });
  }
  function backBtn(step) {
    if (prevIdx(idx) < 0 || step.type === 'intro') return null;
    return el('button', { class: 'ghost', type: 'button', onclick: goBack, text: '← ' + T.back });
  }
  function buildActions(step, extraBtns) {
    (extraBtns || []).forEach(function (b) { actions.appendChild(b); });
    var b = backBtn(step);
    if (b) actions.appendChild(el('div', { class: 'secondary' }, [b]));
  }

  function render() {
    var step = steps[idx], rem = Math.max(0, steps.length - 1 - idx) + (built ? 0 : 14);
    updateTimeline(step, rem);
    var fn = { intro: rIntro, charIntro: rCharIntro, single: rSingle, pick: rPick, slider: rSlider }[step.type];
    var h = fn(step);
    window.scrollTo(0, 0);
    if (h && idx > 0) { try { h.focus({ preventScroll: true }); } catch (e) { /* ok */ } }
  }

  function rIntro() {
    var card = frame(null), I = T.intro;
    card.appendChild(el('div', { class: 'hero', 'aria-hidden': 'true', text: '🚶' }));
    var h = heading(card, I.title);
    I.paragraphs.forEach(function (p) { card.appendChild(el('p', { class: 'lead', text: p })); });
    card.appendChild(el('ul', { class: 'facts' }, I.privacy.map(function (t) { return el('li', { text: t }); })));
    actions.appendChild(primary(I.button, function () { idx = 1; render(); }));
    return h;
  }

  function rCharIntro(step) {
    var card = frame(step), ch = step.ch;
    var h = heading(card, ch.name + ', ' + ch.age + ' let');
    card.appendChild(el('p', { class: 'lead', text: ch.intro }));
    buildActions(step, [primary(T.startPlay, goNext)]);
    return h;
  }

  function rSingle(step) {
    var card = frame(step), cur = step.get(), locked = false;
    var h;
    if (step.sc) {
      var sc = step.sc.scene;
      card.appendChild(el('div', { class: 'chip' }, [el('span', { text: T.timeline.monthLabel + ' ' + sc.month + ' · ' + sc.title })]));
      if (step.qn === 1 && sc.change) card.appendChild(el('p', { class: 'banner', role: 'status', text: sc.change.banner }));
      card.appendChild(el('p', { class: 'scene-txt' + (step.qn === 1 ? ' lead' : ' muted'), text: sc.text }));
      h = heading(card, step.q, 'q-sub');
    } else h = heading(card, step.q);
    var list = el('div', { class: 'opts', role: 'radiogroup', 'aria-labelledby': 'q' });
    step.options.forEach(function (o) {
      var isSel = cur === o.v;
      var b = el('button', {
        class: 'opt' + (isSel ? ' sel' : ''), type: 'button', role: 'radio', 'aria-checked': isSel ? 'true' : 'false',
        onclick: function () {
          if (locked) return; locked = true;
          b.classList.add('sel'); b.setAttribute('aria-checked', 'true');
          setTimeout(function () { answer(step, o.v); }, REDUCED ? 0 : 170);
        }
      }, [el('span', { class: 'dot', 'aria-hidden': 'true' }), el('span', { text: o.t })]);
      list.appendChild(b);
    });
    card.appendChild(list);
    buildActions(step, cur != null ? [primary(T.next, function () { answer(step, cur); })] : []);
    return h;
  }

  function rPick() {
    var card = frame(null), P = T.pick, selId = S.charId, locked = false;
    var h = heading(card, P.q);
    card.appendChild(el('p', { class: 'hint', text: P.hint }));
    var wrap = el('div', { class: 'chars', role: 'radiogroup', 'aria-labelledby': 'q' });
    var btns = {};
    T.chars.forEach(function (ch) {
      var b = el('button', { class: 'chr', type: 'button', role: 'radio', 'aria-checked': 'false', onclick: function () { selId = ch.id; paint(); } }, [
        el('span', { class: 'ic', 'aria-hidden': 'true', text: ch.icon }),
        el('span', { class: 'tx' }, [el('strong', { text: ch.label + ', ' + ch.age + ' let' }), el('span', { class: 'sub', text: ch.sub })])
      ]);
      btns[ch.id] = b; wrap.appendChild(b);
    });
    card.appendChild(wrap);
    var shoda = el('div', { class: 'shoda' });
    card.appendChild(shoda);
    function paint() {
      T.chars.forEach(function (ch) {
        var on = selId === ch.id;
        btns[ch.id].classList.toggle('sel', on); btns[ch.id].setAttribute('aria-checked', on ? 'true' : 'false');
      });
      shoda.textContent = '';
      if (!selId) return;
      shoda.appendChild(el('h2', { text: P.shodaQ }));
      var list = el('div', { class: 'opts', role: 'radiogroup', 'aria-label': P.shodaQ });
      P.shoda.forEach(function (o) {
        var b = el('button', {
          class: 'opt' + (S.shoda === o.v && S.charId === selId ? ' sel' : ''), type: 'button', role: 'radio', 'aria-checked': 'false',
          onclick: function () {
            if (locked) return; locked = true; b.classList.add('sel');
            setTimeout(function () {
              S.charId = selId; S.shoda = o.v; S.rezim = o.v === 'role' ? 'hypoteticky' : 'zkusenost';
              buildPlay(false); idx = head.length; render();
            }, REDUCED ? 0 : 170);
          }
        }, [el('span', { class: 'dot', 'aria-hidden': 'true' }), el('span', { text: o.t })]);
        list.appendChild(b);
      });
      shoda.appendChild(list);
      if (!REDUCED) shoda.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    paint();
    buildActions({ type: 'pick' }, []);
    return h;
  }

  function rSlider(step) {
    var card = frame(step), W = T.wallet, touched = step.get() != null;
    var h = heading(card, W.q);
    var big = el('div', { class: 'big' + (touched ? '' : ' empty'), 'aria-live': 'polite', text: touched ? step.get() + ' %' : W.placeholder });
    var input = el('input', { type: 'range', min: '0', max: '100', step: '10', value: touched ? String(step.get()) : '50', 'aria-labelledby': 'q' });
    var next = primary(W.button, function () { if (touched) answer(step, parseInt(input.value, 10)); }, !touched);
    function onInput() {
      touched = true; big.classList.remove('empty'); big.textContent = input.value + ' %'; next.disabled = false;
    }
    input.addEventListener('input', onInput);
    input.addEventListener('change', onInput);
    input.addEventListener('pointerup', onInput); // i klepnutí na stávající hodnotu (třeba 50 %) se počítá
    input.addEventListener('keydown', onInput);
    card.appendChild(big);
    card.appendChild(el('div', { class: 'slider-wrap' }, [input, el('div', { class: 'range-lab', 'aria-hidden': 'true' }, [el('span', { text: '0 %' }), el('span', { text: '50 %' }), el('span', { text: '100 %' })])]));
    card.appendChild(el('p', { class: 'hint', text: W.caption }));
    buildActions(step, [next]);
    return h;
  }

  function renderSimple(c, emoji) {
    stage.textContent = ''; actions.textContent = '';
    updateTimeline(null, 0);
    var card = el('section', { class: 'card' + (REDUCED ? '' : ' enter') });
    card.appendChild(el('div', { class: 'hero', 'aria-hidden': 'true', text: emoji }));
    var h = el('h1', { tabindex: '-1', text: c.title }); card.appendChild(h);
    card.appendChild(el('p', { class: 'lead', text: c.text }));
    stage.appendChild(card);
    try { h.focus({ preventScroll: true }); } catch (e) { /* ok */ }
  }

  // ---------- Závěr, bonus, druhá postava ----------
  function renderEnd() {
    stage.textContent = ''; actions.textContent = '';
    updateTimeline({ month: 9 }, 0);
    var E = T.ending;
    var card = el('section', { class: 'card' + (REDUCED ? '' : ' enter') });
    card.appendChild(el('div', { class: 'hero', 'aria-hidden': 'true', text: '🎉' }));
    var h = el('h1', { tabindex: '-1', text: E.title }); card.appendChild(h);
    (S.second ? [E.secondDone].concat([E.paragraphs[1]]) : E.paragraphs).forEach(function (p) { card.appendChild(el('p', { class: 'lead', text: p })); });
    var box = el('div', { class: 'card-actions' });
    if (!ROOT.bonusDone) box.appendChild(el('button', { class: 'outline', type: 'button', text: E.bonus, onclick: startBonus }));
    if (!ROOT.hralDruhou && !S.second) {
      var sug = charById(suggestChar());
      box.appendChild(el('button', { class: 'outline', type: 'button', text: E.second + ': ' + sug.icon + ' ' + sug.label, onclick: function () { startSecond(sug.id); } }));
    }
    card.appendChild(box);
    var linkBox = el('input', { class: 'linkbox', type: 'text', readonly: true, 'aria-label': 'Odkaz na hru', hidden: true });
    card.appendChild(linkBox);
    card.appendChild(el('p', { class: 'hint', text: E.note }));
    stage.appendChild(card);
    var btn = primary(E.share, function () { share(linkBox); });
    actions.appendChild(btn);
    try { h.focus({ preventScroll: true }); } catch (e) { /* ok */ }
  }

  function suggestChar() {
    var others = T.chars.map(function (c) { return c.id; }).filter(function (i) { return i !== ROOT.charId; });
    if (COUNTS) {
      var tot = function (id) { var x = COUNTS[String(id)] || {}; return (x.zkusenost || 0) + (x.hypoteticky || 0); };
      var min = Math.min.apply(null, others.map(tot));
      return pickRandom(others.filter(function (i) { return tot(i) === min; }));
    }
    return pickRandom(others);
  }

  function startBonus() {
    var B = T.bonus;
    function bs(key, q, opts, last) {
      return single('bonus_' + key, q, opts, function () { return ROOT.bonus[key]; }, function (v) { ROOT.bonus[key] = v; },
        { bonus: true, after: last ? function () { ROOT.bonusDone = true; ROOT.status = 'dokonceno'; save(ROOT); renderEnd(); return 'halt'; } : null });
    }
    steps = [bs('platba', B.platba.q, B.platba.options), bs('hodnota', B.hodnota.q, B.hodnota.options), bs('duvera', B.duvera.q, B.duvera.options, true)];
    idx = 0; render();
  }

  function startSecond(charId) {
    ROOT.hralDruhou = true; save(ROOT);
    var prev = ROOT;
    S = newSession(); S.second = true; S.a = { vek: prev.a.vek, banka: prev.a.banka };
    S.charId = charId; S.shoda = ''; S.rezim = 'hypoteticky';
    buildPlay(true); idx = 0; render();
  }

  function shareUrl() {
    var base = C.SITE_URL && C.SITE_URL.indexOf('GITHUB_USER') < 0 ? C.SITE_URL : location.origin + location.pathname;
    return base + '?src=sdileno';
  }
  function share(box) {
    var url = shareUrl(), E = T.ending;
    if (navigator.share) {
      navigator.share({ title: T.intro.title, text: E.shareText, url: url }).catch(function () { /* zrušeno */ });
      return;
    }
    function fallback() { box.hidden = false; box.value = url; box.focus(); box.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast(E.copied); }, fallback);
    } else fallback();
  }

  // ---------- Start ----------
  buildHead(); steps = head;
  flush(); // odešle případná nedoručená data z minulé návštěvy
  if (TEST) {
    window.__FMB = { S: function () { return S; }, ROOT: function () { return ROOT; }, steps: function () { return steps; }, go: function () { return idx; }, payload: function () { return buildPayload(S); }, queue: function () { return memQ; }, counts: function (c) { COUNTS = c; } };
    document.getElementById('testbadge').hidden = false;
  }
  render();
})();
