/* =========================================================
   Practice test engine
   - Reads registry.json (subjects -> units -> question files)
   - Builds a test from the chosen topics / difficulty / count
   - Runs it with a timer, answer sheet, and review marks
   - Shows an analysis at the end
   Nothing is stored: all state lives in memory and is lost on refresh.
   ========================================================= */
(() => {
  'use strict';

  const REGISTRY_URL = 'registry.json';
  const DIFFS = ['easy', 'medium', 'hard'];
  const LETTERS = 'ABCDEFGH';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  // Inline markdown: `code` and **bold** (input already escaped)
  function inline(escaped) {
    return escaped
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  }
  // Minimal, safe markdown for question text: fenced code blocks, paragraphs, inline code, bold.
  function md(src) {
    const parts = String(src).split('```');
    let html = '';
    parts.forEach((part, i) => {
      if (i % 2 === 1) {
        const nl = part.indexOf('\n');
        const code = nl >= 0 ? part.slice(nl + 1) : part;
        html += `<pre class="code"><code>${esc(code.replace(/\n+$/, ''))}</code></pre>`;
      } else if (part.trim()) {
        html += part.trim().split(/\n{2,}/)
          .map(p => `<p>${inline(esc(p.trim())).replace(/\n/g, '<br>')}</p>`).join('');
      }
    });
    return html;
  }
  function mdInline(src) { return inline(esc(src)); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function fmtClock(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    const mm = h ? String(m).padStart(2, '0') : String(m);
    return (h ? h + ':' : '') + mm + ':' + String(s).padStart(2, '0');
  }
  function fmtDuration(ms) {
    const total = Math.round(ms / 1000);
    const m = Math.floor(total / 60), s = total % 60;
    if (m === 0) return `${s}s`;
    return s ? `${m}m ${s}s` : `${m}m`;
  }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function plural(n, one, many) { return `${n} ${n === 1 ? one : (many || one + 's')}`; }

  /* ---------------- state ---------------- */
  const S = {
    registry: null,
    loaded: new Map(),            // subjectId -> [{ meta, questions, error }]
    subjectId: null,
    tags: new Set(),              // selected section tags
    diffs: new Set(DIFFS),
    expanded: new Set(),          // unit numbers whose sections are shown
    lastSettings: null,           // remembered for "New test"
  };
  let T = null;                   // the running / finished test
  let reviewFilter = 'all';

  const subject = () => S.registry.subjects.find(s => s.id === S.subjectId);
  const units = () => S.loaded.get(S.subjectId) || [];

  /* ---------------- views ---------------- */
  function show(view) {
    ['setup', 'test', 'result'].forEach(v => { $('#view-' + v).hidden = v !== view; });
    window.scrollTo(0, 0);
  }

  /* =========================================================
     SETUP
     ========================================================= */
  async function init() {
    try {
      const res = await fetch(REGISTRY_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      S.registry = await res.json();
      if (!Array.isArray(S.registry.subjects)) throw new Error('registry has no "subjects" list');
    } catch (err) {
      setupError(`Could not load ${REGISTRY_URL} (${esc(err.message)}). Open this page through a web server, such as Live Server or GitHub Pages, not directly from the file system.`);
      return;
    }
    renderSubjects();
    const first = S.registry.subjects.find(s => s.units && s.units.length);
    if (first) selectSubject(first.id);
  }

  function setupError(html) {
    const box = $('#setup-error');
    box.innerHTML = html;
    box.hidden = false;
  }

  function renderSubjects() {
    $('#subject-list').innerHTML = S.registry.subjects.map(s => {
      const n = (s.units || []).length;
      const disabled = n === 0;
      return `<button type="button" class="subject-btn" role="radio" aria-checked="${s.id === S.subjectId}"
                data-subject="${esc(s.id)}" ${disabled ? 'disabled' : ''}>
                <span class="subject-name">${esc(s.name)}</span>
                <span class="subject-sub">${disabled ? 'No questions added yet' : plural(n, 'topic')}</span>
              </button>`;
    }).join('');
  }

  async function selectSubject(id) {
    S.subjectId = id;
    S.expanded.clear();
    renderSubjects();
    $('#setup-error').hidden = true;
    ['#topic-step', '#difficulty-step', '#length-step', '#start-row'].forEach(s => { $(s).hidden = false; });
    $('#topic-list').innerHTML = '<p class="empty-note" style="padding:1rem">Loading questions…</p>';

    if (!S.loaded.has(id)) {
      const subj = subject();
      const results = await Promise.all(subj.units.map(async meta => {
        try {
          const res = await fetch(meta.questions, { cache: 'no-cache' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.questions;
          const questions = (list || []).filter(validQuestion);
          return { meta, questions, error: null };
        } catch (err) {
          return { meta, questions: [], error: err.message };
        }
      }));
      S.loaded.set(id, results);
    }
    if (S.subjectId !== id) return;          // user switched again while loading

    // default selection: every section that has questions
    S.tags = new Set();
    units().forEach(u => u.questions.forEach(q => S.tags.add(tagOf(q))));
    renderTopics();
    updatePool(true);
  }

  function validQuestion(q) {
    return q && typeof q.question === 'string' && Array.isArray(q.options) && q.options.length >= 2 &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length;
  }
  const tagOf = q => (Array.isArray(q.tags) && q.tags[0]) || `unit-${q.unit}`;

  function sectionsOf(u) {
    // registry order first, then any extra tags found in the questions
    const map = new Map();
    Object.entries(u.meta.sections || {}).forEach(([tag, title]) => map.set(tag, { tag, title, count: 0 }));
    u.questions.forEach(q => {
      const t = tagOf(q);
      if (!map.has(t)) map.set(t, { tag: t, title: '', count: 0 });
      map.get(t).count++;
    });
    return Array.from(map.values());
  }

  function renderTopics() {
    $('#topic-list').innerHTML = units().map(u => {
      const secs = sectionsOf(u);
      const total = u.questions.length;
      const avail = total > 0;
      const selectedSecs = secs.filter(s => s.count && S.tags.has(s.tag));
      const withQ = secs.filter(s => s.count);
      const checked = avail && selectedSecs.length === withQ.length;
      const partial = avail && selectedSecs.length > 0 && !checked;
      const open = S.expanded.has(u.meta.unit);
      const id = `unit-${u.meta.unit}`;
      return `<div class="topic ${avail ? '' : 'unavailable'}" data-unit="${u.meta.unit}">
        <div class="topic-row">
          <input type="checkbox" id="${id}" data-unit-check="${u.meta.unit}" ${checked ? 'checked' : ''} ${avail ? '' : 'disabled'}
                 ${partial ? 'data-partial="1"' : ''}>
          <label for="${id}" class="topic-title"><span class="topic-num">${u.meta.unit}.</span>${esc(u.meta.title)}</label>
          <span class="topic-count">${avail ? plural(total, 'question') : 'Not available yet'}</span>
          ${avail ? `<button type="button" class="expand-btn" data-expand="${u.meta.unit}" aria-expanded="${open}"
                      aria-controls="${id}-secs">${open ? 'Hide sections' : 'Sections'}</button>` : '<span></span>'}
        </div>
        ${avail && open ? `<div class="sections" id="${id}-secs">${secs.map(s => `
          <label class="section-row">
            <input type="checkbox" data-tag="${esc(s.tag)}" ${S.tags.has(s.tag) ? 'checked' : ''} ${s.count ? '' : 'disabled'}>
            <span class="section-tag">${esc(s.tag)}</span>
            <span>${esc(s.title)}</span>
            <span class="topic-count">${s.count}</span>
          </label>`).join('')}</div>` : ''}
      </div>`;
    }).join('');
    $$('[data-partial]').forEach(cb => { cb.indeterminate = true; });
  }

  function pool() {
    return units().flatMap(u => u.questions).filter(q => S.tags.has(tagOf(q)) && S.diffs.has(q.difficulty || 'medium'));
  }

  function updatePool(resetCount = false) {
    const p = pool();
    const byTag = units().flatMap(u => u.questions).filter(q => S.tags.has(tagOf(q)));
    DIFFS.forEach(d => {
      const n = byTag.filter(q => (q.difficulty || 'medium') === d).length;
      $(`[data-diff-count="${d}"]`).textContent = `(${n})`;
    });
    const countEl = $('#q-count');
    countEl.max = Math.max(1, p.length);
    if (resetCount) countEl.value = Math.min(25, p.length || 1);
    if (+countEl.value > p.length) countEl.value = p.length || 1;
    $('#pool-line').innerHTML = p.length
      ? `<strong>${p.length}</strong> questions match your selection.`
      : 'No questions match. Select at least one topic and one difficulty level.';
    const n = Math.min(+countEl.value || 0, p.length);
    const untimed = $('#untimed').checked;
    $('#q-minutes').disabled = untimed;
    $('#start-btn').disabled = !p.length;
    $('#start-btn').textContent = p.length
      ? `Start test: ${plural(n, 'question')}, ${untimed ? 'no time limit' : `${+$('#q-minutes').value || 0} min`}`
      : 'Start test';
  }

  function suggestMinutes() {
    const n = +$('#q-count').value || 1;
    $('#q-minutes').value = Math.max(1, Math.round(n * 1.5));
  }

  function bindSetup() {
    $('#subject-list').addEventListener('click', e => {
      const b = e.target.closest('[data-subject]');
      if (b && !b.disabled && b.dataset.subject !== S.subjectId) selectSubject(b.dataset.subject);
    });

    $('#topic-list').addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.unitCheck) {
        const u = units().find(x => String(x.meta.unit) === t.dataset.unitCheck);
        sectionsOf(u).filter(s => s.count).forEach(s => t.checked ? S.tags.add(s.tag) : S.tags.delete(s.tag));
      } else if (t.dataset.tag) {
        t.checked ? S.tags.add(t.dataset.tag) : S.tags.delete(t.dataset.tag);
      }
      renderTopics();
      updatePool();
    });
    $('#topic-list').addEventListener('click', e => {
      const b = e.target.closest('[data-expand]');
      if (!b) return;
      const n = +b.dataset.expand;
      S.expanded.has(n) ? S.expanded.delete(n) : S.expanded.add(n);
      renderTopics();
    });

    $('#topic-step').addEventListener('click', e => {
      const a = e.target.closest('[data-action]');
      if (!a) return;
      S.tags = new Set();
      if (a.dataset.action === 'select-all') units().forEach(u => u.questions.forEach(q => S.tags.add(tagOf(q))));
      renderTopics();
      updatePool();
    });

    $('#difficulty-list').addEventListener('change', e => {
      const v = e.target.value;
      e.target.checked ? S.diffs.add(v) : S.diffs.delete(v);
      updatePool();
    });

    $('#count-presets').addEventListener('click', e => {
      const b = e.target.closest('[data-count]');
      if (!b) return;
      const max = pool().length;
      $('#q-count').value = b.dataset.count === 'all' ? max : Math.min(+b.dataset.count, max || 1);
      suggestMinutes();
      updatePool();
    });
    $('#q-count').addEventListener('input', () => updatePool());
    $('#q-count').addEventListener('change', () => {
      const el = $('#q-count');
      el.value = Math.min(Math.max(1, Math.round(+el.value || 1)), Math.max(1, pool().length));
      updatePool();
    });
    $('#q-minutes').addEventListener('input', () => updatePool());
    $('#suggest-time').addEventListener('click', () => { $('#untimed').checked = false; suggestMinutes(); updatePool(); });
    $('#untimed').addEventListener('change', () => updatePool());

    $('#start-btn').addEventListener('click', () => {
      const p = pool();
      const n = Math.min(Math.max(1, Math.round(+$('#q-count').value || 1)), p.length);
      const untimed = $('#untimed').checked;
      const minutes = Math.max(1, +$('#q-minutes').value || 1);
      S.lastSettings = { n, minutes, untimed };
      startTest(shuffle(p).slice(0, n), untimed ? null : minutes * 60000);
    });
  }

  /* =========================================================
     TEST
     ========================================================= */
  function startTest(questions, durationMs) {
    const n = questions.length;
    T = {
      subjectName: subject().name,
      items: questions.map(q => {
        const order = shuffle(q.options.map((_, i) => i));   // display position -> original index
        return { q, order, correct: order.indexOf(q.answer) };
      }),
      resp: new Array(n).fill(null),        // chosen display index
      marked: new Array(n).fill(false),
      visited: new Array(n).fill(false),
      spent: new Array(n).fill(0),
      cur: 0,
      enteredAt: 0,
      startedAt: Date.now(),
      durationMs,
      deadline: durationMs ? Date.now() + durationMs : null,
      timerId: null,
      over: false,
      endReason: null,
      endedAt: null,
    };
    $('#t-subject').textContent = T.subjectName;
    show('test');
    buildSheet();
    goTo(0);
    tick();
    T.timerId = setInterval(tick, 250);
  }

  function tick() {
    if (!T || T.over) return;
    const timer = $('#t-timer');
    if (!T.deadline) {
      timer.textContent = fmtClock(Date.now() - T.startedAt);
      timer.title = 'Time elapsed (no limit)';
      return;
    }
    const left = T.deadline - Date.now();
    timer.textContent = fmtClock(left);
    timer.title = 'Time remaining';
    timer.classList.toggle('danger', left <= 60000);
    timer.classList.toggle('warn', left > 60000 && left <= T.durationMs * 0.1);
    if (left <= 0) finish('time');
  }

  function leaveCurrent() {
    if (T.enteredAt) T.spent[T.cur] += Date.now() - T.enteredAt;
    T.enteredAt = 0;
  }

  function goTo(i) {
    if (i < 0 || i >= T.items.length) return;
    leaveCurrent();
    T.cur = i;
    T.visited[i] = true;
    T.enteredAt = Date.now();
    renderQuestion();
    updateSheet();
    closeSheet();
  }

  function renderQuestion() {
    const i = T.cur, it = T.items[i], q = it.q, n = T.items.length;
    const unitMeta = findUnitMeta(q);
    const secTitle = unitMeta && unitMeta.sections ? unitMeta.sections[tagOf(q)] || '' : '';
    $('#t-progress').textContent = `Question ${i + 1} of ${n}`;
    $('#q-meta').innerHTML = `
      <span class="q-number">Question ${i + 1}</span>
      <span class="tag-pill">${esc(tagOf(q))}</span>
      ${secTitle ? `<span>${esc(secTitle)}</span>` : ''}
      <span class="diff-${esc(q.difficulty || 'medium')}">${esc(cap(q.difficulty || 'medium'))}</span>`;
    $('#q-text').innerHTML = md(q.question);
    $('#q-options').innerHTML = it.order.map((orig, k) => `
      <button type="button" class="opt" role="radio" aria-checked="${T.resp[i] === k}" data-opt="${k}">
        <span class="bubble" aria-hidden="true">${LETTERS[k]}</span>
        <span class="opt-text">${mdInline(q.options[orig])}</span>
      </button>`).join('');
    $('#mark-btn').setAttribute('aria-pressed', String(T.marked[i]));
    $('#mark-btn').textContent = T.marked[i] ? 'Marked for review' : 'Mark for review';
    $('#clear-btn').disabled = T.resp[i] === null;
    $('#prev-btn').disabled = i === 0;
    $('#next-btn').textContent = i === n - 1 ? 'Review and submit' : 'Next';
  }

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function findUnitMeta(q) {
    const u = (S.loaded.get(S.subjectId) || []).find(x => x.meta.unit === q.unit);
    return u ? u.meta : null;
  }

  function choose(k) {
    if (T.over) return;
    const i = T.cur;
    T.resp[i] = T.resp[i] === k ? null : k;      // clicking the chosen option again clears it
    $$('#q-options .opt').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.opt === T.resp[i])));
    $('#clear-btn').disabled = T.resp[i] === null;
    updateSheet();
  }

  function buildSheet() {
    $('#sheet-grid').innerHTML = T.items.map((_, i) =>
      `<button type="button" class="cell" data-go="${i}">${i + 1}</button>`).join('');
  }

  function updateSheet() {
    const cells = $$('#sheet-grid .cell');
    let answered = 0, marked = 0;
    cells.forEach((c, i) => {
      const a = T.resp[i] !== null, m = T.marked[i], v = T.visited[i];
      if (a) answered++;
      if (m) marked++;
      c.className = 'cell' + (v ? ' visited' : '') + (a ? ' answered' : '') + (m ? ' marked' : '') + (i === T.cur ? ' current' : '');
      const status = a ? 'answered' : v ? 'seen, not answered' : 'not seen';
      c.setAttribute('aria-label', `Question ${i + 1}, ${status}${m ? ', marked for review' : ''}`);
      if (i === T.cur) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current');
    });
    const n = T.items.length;
    $('#sheet-counts').textContent = `${answered} of ${n} answered` + (marked ? `, ${marked} marked` : '');
  }

  function openSheet() { $('#answer-sheet').classList.add('open'); $('#sheet-toggle').setAttribute('aria-expanded', 'true'); }
  function closeSheet() { $('#answer-sheet').classList.remove('open'); $('#sheet-toggle').setAttribute('aria-expanded', 'false'); }

  function askSubmit() {
    const n = T.items.length;
    const answered = T.resp.filter(r => r !== null).length;
    const marked = T.marked.filter(Boolean).length;
    const parts = [`You have answered ${answered} of ${n} questions.`];
    if (n - answered) parts.push(`${plural(n - answered, 'question')} will be counted as unanswered.`);
    if (marked) parts.push(`${plural(marked, 'question is', 'questions are')} still marked for review.`);
    $('#submit-dialog-body').textContent = parts.join(' ');
    const dlg = $('#submit-dialog');
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else if (window.confirm(parts.join(' ') + ' Submit the test?')) finish('submit');
  }

  function finish(reason) {
    if (!T || T.over) return;
    leaveCurrent();
    T.over = true;
    T.endReason = reason;
    T.endedAt = Date.now();
    clearInterval(T.timerId);
    const dlg = $('#submit-dialog');
    if (dlg.open) dlg.close();
    reviewFilter = 'all';
    renderResults();
    show('result');
  }

  function bindTest() {
    $('#q-options').addEventListener('click', e => {
      const b = e.target.closest('[data-opt]');
      if (b) choose(+b.dataset.opt);
    });
    $('#prev-btn').addEventListener('click', () => goTo(T.cur - 1));
    $('#next-btn').addEventListener('click', () => {
      if (T.cur === T.items.length - 1) askSubmit(); else goTo(T.cur + 1);
    });
    $('#mark-btn').addEventListener('click', () => {
      T.marked[T.cur] = !T.marked[T.cur];
      renderQuestion();
      updateSheet();
    });
    $('#clear-btn').addEventListener('click', () => {
      T.resp[T.cur] = null;
      renderQuestion();
      updateSheet();
    });
    $('#sheet-grid').addEventListener('click', e => {
      const c = e.target.closest('[data-go]');
      if (c) goTo(+c.dataset.go);
    });
    $('#submit-btn').addEventListener('click', askSubmit);
    $('#sheet-toggle').addEventListener('click', () =>
      $('#answer-sheet').classList.contains('open') ? closeSheet() : openSheet());
    $('#sheet-close').addEventListener('click', closeSheet);
    $('#dialog-cancel').addEventListener('click', () => $('#submit-dialog').close());
    $('#dialog-confirm').addEventListener('click', () => finish('submit'));

    document.addEventListener('keydown', e => {
      if (!T || T.over || $('#view-test').hidden) return;
      if ($('#submit-dialog').open) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const key = e.key;
      const nOpts = T.items[T.cur].order.length;
      let k = -1;
      if (/^[1-8]$/.test(key)) k = +key - 1;
      else if (/^[a-h]$/i.test(key) && key.length === 1 && key.toLowerCase() !== 'm') k = key.toLowerCase().charCodeAt(0) - 97;
      if (k >= 0 && k < nOpts) { e.preventDefault(); choose(k); return; }
      if (key === 'ArrowRight') { e.preventDefault(); goTo(T.cur + 1); }
      else if (key === 'ArrowLeft') { e.preventDefault(); goTo(T.cur - 1); }
      else if (key.toLowerCase() === 'm') { e.preventDefault(); $('#mark-btn').click(); }
    });

    // Warn before leaving mid-test: a refresh would lose the attempt.
    window.addEventListener('beforeunload', e => {
      if (T && !T.over) { e.preventDefault(); e.returnValue = ''; }
    });
    // Catch up on the timer when the tab becomes visible again.
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  }

  /* =========================================================
     RESULTS
     ========================================================= */
  function statusOf(i) {
    const r = T.resp[i];
    if (r === null) return 'skipped';
    return r === T.items[i].correct ? 'correct' : 'wrong';
  }

  function notesLink(q, tag) {
    const subj = S.registry.subjects.find(s => s.id === (q.subject || S.subjectId)) || subject();
    const meta = findUnitMeta(q);
    const file = q.notes || (meta && meta.notes);
    if (!subj || !subj.notesUrl || !file) return null;
    return subj.notesUrl.replace('{file}', encodeURIComponent(file)).replace('{tag}', encodeURIComponent(tag));
  }

  function renderResults() {
    const n = T.items.length;
    const st = T.items.map((_, i) => statusOf(i));
    const correct = st.filter(s => s === 'correct').length;
    const wrong = st.filter(s => s === 'wrong').length;
    const skipped = n - correct - wrong;
    const attempted = correct + wrong;
    const used = T.endedAt - T.startedAt;

    $('#r-summary').innerHTML =
      `<strong>${correct} of ${n} correct (${pct(correct, n)}%).</strong> ` +
      `${wrong} wrong, ${skipped} not answered. ` +
      (attempted ? `Accuracy on attempted questions: ${pct(correct, attempted)}%.` : '');
    $('#r-bar').innerHTML =
      `<span class="seg-ok" style="width:${(correct / n) * 100}%"></span>` +
      `<span class="seg-bad" style="width:${(wrong / n) * 100}%"></span>` +
      `<span class="seg-skip" style="width:${(skipped / n) * 100}%"></span>`;
    const timeText = T.durationMs
      ? `Time used: ${fmtDuration(Math.min(used, T.durationMs))} of ${fmtDuration(T.durationMs)}`
      : `Time taken: ${fmtDuration(used)}`;
    $('#r-note').textContent = (T.endReason === 'time' ? 'Time ran out, so the test was submitted automatically. ' : '') +
      `${timeText}, about ${fmtDuration(used / n)} per question.`;

    const mistakes = st.filter(s => s !== 'correct').length;
    const pm = $('#practice-mistakes');
    pm.hidden = mistakes === 0;
    pm.textContent = `Practice mistakes (${mistakes})`;

    // graded sheet
    $('#r-sheet').innerHTML = st.map((s, i) => `<button type="button" class="cell ${s === 'skipped' ? '' : s}" data-jump="${i}"
      aria-label="Question ${i + 1}, ${s === 'skipped' ? 'not answered' : s}">${i + 1}</button>`).join('');

    // by topic
    const groups = new Map();
    T.items.forEach((it, i) => {
      const tag = tagOf(it.q);
      if (!groups.has(tag)) groups.set(tag, { tag, q: it.q, total: 0, correct: 0, wrong: 0 });
      const g = groups.get(tag);
      g.total++;
      if (st[i] === 'correct') g.correct++;
      if (st[i] === 'wrong') g.wrong++;
    });
    const rows = Array.from(groups.values()).sort((a, b) =>
      (a.correct / a.total) - (b.correct / b.total) || b.total - a.total || a.tag.localeCompare(b.tag, undefined, { numeric: true }));
    $('#r-topics').innerHTML = breakdownTable(rows.map(g => {
      const meta = findUnitMeta(g.q);
      const title = meta && meta.sections ? meta.sections[g.tag] || '' : '';
      const href = notesLink(g.q, g.tag);
      return {
        name: `${href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(g.tag)}</a>` : esc(g.tag)}
               ${title ? `<span class="bd-title">${esc(title)}</span>` : ''}`,
        correct: g.correct, total: g.total,
      };
    }), 'Section');

    $('#r-difficulty').innerHTML = breakdownTable(DIFFS.map(d => {
      const idx = T.items.map((it, i) => i).filter(i => (T.items[i].q.difficulty || 'medium') === d);
      return { name: esc(cap(d)), correct: idx.filter(i => st[i] === 'correct').length, total: idx.length };
    }).filter(r => r.total), 'Difficulty');

    renderFilters(st);
    renderReview(st);
  }

  function breakdownTable(rows, label) {
    if (!rows.length) return '<p class="empty-note">Nothing to show.</p>';
    return `<table class="bd-table">
      <thead><tr><th>${label}</th><th class="num">Score</th><th><span class="visually-hidden">Bar</span></th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td class="bd-name">${r.name}</td>
        <td class="num">${r.correct}/${r.total}</td>
        <td><div class="meter" role="img" aria-label="${pct(r.correct, r.total)}% correct"><span style="width:${pct(r.correct, r.total)}%"></span></div></td>
      </tr>`).join('')}</tbody></table>`;
  }

  function renderFilters(st) {
    const counts = {
      all: st.length,
      wrong: st.filter(s => s === 'wrong').length,
      skipped: st.filter(s => s === 'skipped').length,
      correct: st.filter(s => s === 'correct').length,
      marked: T.marked.filter(Boolean).length,
    };
    const labels = { all: 'All', wrong: 'Wrong', skipped: 'Not answered', correct: 'Correct', marked: 'Marked for review' };
    $('#review-filters').innerHTML = Object.keys(labels)
      .filter(k => k === 'all' || counts[k] > 0)
      .map(k => `<button type="button" class="filter-btn" role="tab" aria-selected="${reviewFilter === k}" data-filter="${k}">
                   ${labels[k]} (${counts[k]})</button>`).join('');
  }

  function renderReview(st) {
    const list = T.items.map((it, i) => ({ it, i, s: st[i] })).filter(({ i, s }) =>
      reviewFilter === 'all' || (reviewFilter === 'marked' ? T.marked[i] : s === reviewFilter));
    if (!list.length) {
      $('#review-list').innerHTML = '<li class="empty-note">No questions in this group.</li>';
      return;
    }
    $('#review-list').innerHTML = list.map(({ it, i, s }) => {
      const q = it.q, tag = tagOf(q), href = notesLink(q, tag);
      const meta = findUnitMeta(q);
      const title = meta && meta.sections ? meta.sections[tag] || '' : '';
      const statusText = s === 'correct' ? 'Correct' : s === 'wrong' ? 'Wrong' : 'Not answered';
      const opts = it.order.map((orig, k) => {
        const isRight = k === it.correct, isChosen = T.resp[i] === k;
        const cls = isRight ? 'right' : isChosen ? 'chosen-wrong' : '';
        const flag = isRight && isChosen ? 'Your answer' : isRight ? 'Correct answer' : isChosen ? 'Your answer' : '';
        return `<li class="rv-opt ${cls}">
          <span class="bubble" aria-hidden="true">${LETTERS[k]}</span>
          <span class="opt-text">${mdInline(q.options[orig])}</span>
          <span class="rv-flag">${flag}</span></li>`;
      }).join('');
      return `<li class="rv ${s === 'correct' ? 'is-correct' : s === 'wrong' ? 'is-wrong' : ''}" id="rv-${i}">
        <div class="rv-head">
          <span class="q-number">Question ${i + 1}</span>
          <span class="rv-status">${statusText}</span>
          <span class="tag-pill">${esc(tag)}</span>
          <span class="diff-${esc(q.difficulty || 'medium')}">${esc(cap(q.difficulty || 'medium'))}</span>
          ${T.marked[i] ? '<span>Marked for review</span>' : ''}
          <span>Time on question: ${fmtDuration(T.spent[i])}</span>
        </div>
        <div class="q-text">${md(q.question)}</div>
        <ul class="rv-options">${opts}</ul>
        ${q.explanation ? `<div class="rv-expl"><span class="rv-expl-label">Explanation.</span> ${mdInline(q.explanation)}</div>` : ''}
        <p class="rv-links">${href
          ? `Read <a href="${esc(href)}" target="_blank" rel="noopener">${esc(tag)}${title ? `: ${esc(title)}` : ''}</a> in the notes.`
          : `Covered in section ${esc(tag)}${title ? ` (${esc(title)})` : ''}.`}</p>
      </li>`;
    }).join('');
  }

  function bindResults() {
    $('#review-filters').addEventListener('click', e => {
      const b = e.target.closest('[data-filter]');
      if (!b) return;
      reviewFilter = b.dataset.filter;
      const st = T.items.map((_, i) => statusOf(i));
      renderFilters(st);
      renderReview(st);
    });
    $('#r-sheet').addEventListener('click', e => {
      const c = e.target.closest('[data-jump]');
      if (!c) return;
      const i = +c.dataset.jump;
      if (!$('#rv-' + i)) {                           // hidden by the current filter
        reviewFilter = 'all';
        const st = T.items.map((_, k) => statusOf(k));
        renderFilters(st);
        renderReview(st);
      }
      const card = $('#rv-' + i);
      card.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      card.classList.add('flash');
      setTimeout(() => card.classList.remove('flash'), 1200);
    });
    const perQuestion = () => T.durationMs ? T.durationMs / T.items.length : null;
    $('#retake-btn').addEventListener('click', () => {
      const qs = shuffle(T.items.map(it => it.q));
      startTest(qs, T.durationMs);
    });
    $('#practice-mistakes').addEventListener('click', () => {
      const per = perQuestion();
      const qs = shuffle(T.items.filter((_, i) => statusOf(i) !== 'correct').map(it => it.q));
      if (qs.length) startTest(qs, per ? Math.max(60000, Math.round(per * qs.length)) : null);
    });
    $('#new-test-btn').addEventListener('click', () => {
      T = null;
      show('setup');
      updatePool();
    });
  }

  /* ---------------- boot ---------------- */
  bindSetup();
  bindTest();
  bindResults();
  init();
})();
