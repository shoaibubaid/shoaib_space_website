/* =========================================================
   Practice tests
   Plugs into the existing site: uses showView() for navigation and
   renderPost() to jump into the notes. Loads after script.js.

   Add a subject or unit: edit test/registry.json and drop a JSON
   question file in test/questions/<subject>/. No code changes needed.

   Nothing is stored. Refreshing the page clears a test and its results.
   ========================================================= */
(() => {
  'use strict';

  const REGISTRY_URL = 'test/registry.json';
  const CTA_GROUP = 'Computer';          // blog group that gets the "take a test" button
  const DIFFS = ['easy', 'medium', 'hard'];
  const LETTERS = 'ABCDEFGH';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------------- text helpers ---------------- */
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inline = e => e
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  const mdInline = s => inline(esc(s));

  // Question text: fenced code blocks + paragraphs. Deliberately tiny and
  // escaped first, so question data can never inject markup.
  function md(src) {
    let out = '';
    String(src).split('```').forEach((part, i) => {
      if (i % 2 === 1) {
        const nl = part.indexOf('\n');
        out += `<pre><code>${esc((nl >= 0 ? part.slice(nl + 1) : part).replace(/\n+$/, ''))}</code></pre>`;
      } else if (part.trim()) {
        out += part.trim().split(/\n{2,}/)
          .map(p => `<p>${inline(esc(p.trim())).replace(/\n/g, '<br>')}</p>`).join('');
      }
    });
    return out;
  }

  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const clock = ms => {
    const t = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ':' : '') + (h ? String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  };
  const dur = ms => {
    const t = Math.round(ms / 1000), m = Math.floor(t / 60), s = t % 60;
    return m ? (s ? `${m}m ${s}s` : `${m}m`) : `${s}s`;
  };
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------------- state ---------------- */
  const S = {
    registry: null,
    loaded: new Map(),       // subject id -> [{meta, questions}]
    subjectId: null,
    tags: new Set(),
    diffs: new Set(DIFFS),
    open: new Set(),
    booted: false,
  };
  let T = null;              // current attempt
  let filter = 'all';

  const subject = () => S.registry.subjects.find(s => s.id === S.subjectId);
  const units = () => S.loaded.get(S.subjectId) || [];
  const tagOf = q => (Array.isArray(q.tags) && q.tags[0]) || `unit-${q.unit}`;
  const unitMetaOf = q => { const u = units().find(x => x.meta.unit === q.unit); return u ? u.meta : null; };
  const secTitle = q => { const m = unitMetaOf(q); return (m && m.sections && m.sections[tagOf(q)]) || ''; };

  /* =========================================================
     The button on the Computer blog group
     ========================================================= */
  function decorateGroups() {
    $$('#blog-groups .category-group').forEach(box => {
      const title = box.querySelector('.category-group-title');
      if (!title || box.querySelector('.test-cta')) return;
      if (title.textContent.trim().toLowerCase() !== CTA_GROUP.toLowerCase()) return;

      const head = document.createElement('div');
      head.className = 'group-head';
      title.parentNode.insertBefore(head, title);
      head.appendChild(title);

      const btn = document.createElement('button');
      btn.className = 'test-cta';
      btn.type = 'button';
      btn.innerHTML = '<i class="ti ti-checkup-list"></i> take a test';
      btn.addEventListener('click', openSetup);
      head.appendChild(btn);
    });
  }

  // The blog view is rendered by script.js; watch for it instead of editing that file.
  new MutationObserver(decorateGroups).observe(
    document.getElementById('blog-groups'), { childList: true });

  /* =========================================================
     Setup
     ========================================================= */
  async function openSetup() {
    showView('test-setup');
    if (S.booted) return;
    S.booted = true;
    try {
      const res = await fetch(REGISTRY_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      S.registry = await res.json();
    } catch (err) {
      S.booted = false;
      $('#t-error').innerHTML =
        `Could not load ${REGISTRY_URL} (${esc(err.message)}). ` +
        `If you are previewing locally, open the site through a web server rather than the file system.`;
      $('#t-error').hidden = false;
      return;
    }
    renderSubjects();
    const first = S.registry.subjects.find(s => (s.units || []).length);
    if (first) pickSubject(first.id);
  }

  function renderSubjects() {
    $('#t-subjects').innerHTML = S.registry.subjects.map(s => {
      const n = (s.units || []).length;
      return `<button type="button" class="t-subject" role="radio" aria-checked="${s.id === S.subjectId}"
               data-subject="${esc(s.id)}" ${n ? '' : 'disabled'}>
               <span class="t-subject-name">${esc(s.name)}</span>
               <span class="t-subject-sub">${n ? plural(n, 'topic') : 'coming soon'}</span>
             </button>`;
    }).join('');
  }

  async function pickSubject(id) {
    S.subjectId = id;
    S.open.clear();
    renderSubjects();
    ['#t-topic-step', '#t-diff-step', '#t-len-step', '#t-start-row'].forEach(s => { $(s).hidden = false; });
    $('#t-topics').innerHTML = '<p class="t-empty" style="padding:14px 16px">loading questions…</p>';

    if (!S.loaded.has(id)) {
      const loaded = await Promise.all(subject().units.map(async meta => {
        try {
          const res = await fetch(meta.questions, { cache: 'no-store' });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.questions;
          return { meta, questions: (list || []).filter(valid) };
        } catch { return { meta, questions: [] }; }
      }));
      S.loaded.set(id, loaded);
    }
    if (S.subjectId !== id) return;      // switched again while loading

    S.tags = new Set();
    units().forEach(u => u.questions.forEach(q => S.tags.add(tagOf(q))));
    renderTopics();
    refresh(true);
  }

  const valid = q => q && typeof q.question === 'string' && Array.isArray(q.options) &&
    q.options.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length;

  function sectionsOf(u) {
    const map = new Map();
    Object.entries(u.meta.sections || {}).forEach(([tag, title]) => map.set(tag, { tag, title, count: 0 }));
    u.questions.forEach(q => {
      const t = tagOf(q);
      if (!map.has(t)) map.set(t, { tag: t, title: '', count: 0 });
      map.get(t).count++;
    });
    return [...map.values()];
  }

  function renderTopics() {
    $('#t-topics').innerHTML = units().map(u => {
      const secs = sectionsOf(u), total = u.questions.length, live = total > 0;
      const withQ = secs.filter(s => s.count);
      const on = withQ.filter(s => S.tags.has(s.tag));
      const all = live && on.length === withQ.length, some = live && on.length && !all;
      const open = S.open.has(u.meta.unit), id = `tu-${u.meta.unit}`;
      return `<div class="t-topic ${live ? '' : 'off'}">
        <div class="t-topic-row">
          <input type="checkbox" class="t-cb" id="${id}" data-unit="${u.meta.unit}"
                 ${all ? 'checked' : ''} ${live ? '' : 'disabled'} ${some ? 'data-some="1"' : ''}>
          <label for="${id}" class="t-topic-title"><span class="t-topic-num">${u.meta.unit}</span>${esc(u.meta.title)}</label>
          <span class="t-count">${live ? plural(total, 'question') : 'coming soon'}</span>
          ${live ? `<button type="button" class="t-expand" data-open="${u.meta.unit}" aria-expanded="${open}">
                      ${open ? 'hide' : 'sections'}</button>` : '<span></span>'}
        </div>
        ${live && open ? `<div class="t-sections">${secs.map(s => `
          <label class="t-section-row">
            <input type="checkbox" class="t-cb" data-tag="${esc(s.tag)}"
                   ${S.tags.has(s.tag) ? 'checked' : ''} ${s.count ? '' : 'disabled'}>
            <span class="t-tag">${esc(s.tag)}</span>
            <span>${esc(s.title)}</span>
            <span class="t-count">${s.count}</span>
          </label>`).join('')}</div>` : ''}
      </div>`;
    }).join('');
    $$('[data-some]').forEach(cb => { cb.indeterminate = true; });
  }

  const pool = () => units().flatMap(u => u.questions)
    .filter(q => S.tags.has(tagOf(q)) && S.diffs.has(q.difficulty || 'medium'));

  function refresh(reset = false) {
    const p = pool();
    const chosen = units().flatMap(u => u.questions).filter(q => S.tags.has(tagOf(q)));
    DIFFS.forEach(d => {
      $(`[data-dc="${d}"]`).textContent = `(${chosen.filter(q => (q.difficulty || 'medium') === d).length})`;
    });
    const c = $('#t-count');
    c.max = Math.max(1, p.length);
    if (reset) c.value = Math.min(25, p.length || 1);
    if (+c.value > p.length) c.value = p.length || 1;
    $('#t-pool').innerHTML = p.length
      ? `<strong>${p.length}</strong> questions match your selection.`
      : 'nothing matches — pick at least one topic and one difficulty.';
    $('#t-minutes').disabled = $('#t-untimed').checked;
    const n = Math.min(+c.value || 0, p.length);
    $('#t-start').disabled = !p.length;
    $('#t-start').innerHTML = p.length
      ? `<i class="ti ti-player-play"></i> start: ${plural(n, 'question')}, ${$('#t-untimed').checked ? 'untimed' : (+$('#t-minutes').value || 0) + ' min'}`
      : '<i class="ti ti-player-play"></i> start test';
  }

  const suggest = () => { $('#t-minutes').value = Math.max(1, Math.round((+$('#t-count').value || 1) * 1.5)); };

  function bindSetup() {
    $('#t-subjects').addEventListener('click', e => {
      const b = e.target.closest('[data-subject]');
      if (b && !b.disabled && b.dataset.subject !== S.subjectId) pickSubject(b.dataset.subject);
    });
    $('#t-topics').addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.unit) {
        const u = units().find(x => String(x.meta.unit) === t.dataset.unit);
        sectionsOf(u).filter(s => s.count).forEach(s => t.checked ? S.tags.add(s.tag) : S.tags.delete(s.tag));
      } else if (t.dataset.tag) {
        t.checked ? S.tags.add(t.dataset.tag) : S.tags.delete(t.dataset.tag);
      }
      renderTopics(); refresh();
    });
    $('#t-topics').addEventListener('click', e => {
      const b = e.target.closest('[data-open]');
      if (!b) return;
      const n = +b.dataset.open;
      S.open.has(n) ? S.open.delete(n) : S.open.add(n);
      renderTopics();
    });
    $('#t-topic-step').addEventListener('click', e => {
      const a = e.target.closest('[data-all]');
      if (!a) return;
      S.tags = new Set();
      if (a.dataset.all === 'yes') units().forEach(u => u.questions.forEach(q => S.tags.add(tagOf(q))));
      renderTopics(); refresh();
    });
    $('#t-diffs').addEventListener('change', e => {
      e.target.checked ? S.diffs.add(e.target.value) : S.diffs.delete(e.target.value);
      refresh();
    });
    $('#t-presets').addEventListener('click', e => {
      const b = e.target.closest('[data-n]');
      if (!b) return;
      const max = pool().length;
      $('#t-count').value = b.dataset.n === 'all' ? max : Math.min(+b.dataset.n, max || 1);
      suggest(); refresh();
    });
    $('#t-count').addEventListener('input', () => refresh());
    $('#t-count').addEventListener('change', () => {
      const el = $('#t-count');
      el.value = Math.min(Math.max(1, Math.round(+el.value || 1)), Math.max(1, pool().length));
      refresh();
    });
    $('#t-minutes').addEventListener('input', () => refresh());
    $('#t-suggest').addEventListener('click', () => { $('#t-untimed').checked = false; suggest(); refresh(); });
    $('#t-untimed').addEventListener('change', () => refresh());
    $('#t-start').addEventListener('click', () => {
      const p = pool();
      const n = Math.min(Math.max(1, Math.round(+$('#t-count').value || 1)), p.length);
      const untimed = $('#t-untimed').checked;
      begin(shuffle(p).slice(0, n), untimed ? null : Math.max(1, +$('#t-minutes').value || 1) * 60000);
    });
  }

  /* =========================================================
     Running the test
     ========================================================= */
  function begin(questions, ms) {
    T = {
      name: subject().name,
      items: questions.map(q => {
        const order = shuffle(q.options.map((_, i) => i));
        return { q, order, correct: order.indexOf(q.answer) };
      }),
      resp: questions.map(() => null),
      flag: questions.map(() => false),
      seen: questions.map(() => false),
      spent: questions.map(() => 0),
      cur: 0, since: 0,
      start: Date.now(), ms,
      end: ms ? Date.now() + ms : null,
      timer: null, over: false, why: null, stop: null,
    };
    $('#t-bar-subject').textContent = T.name;
    $('#t-sheet-grid').innerHTML = T.items.map((_, i) =>
      `<button type="button" class="t-cell" data-go="${i}">${i + 1}</button>`).join('');
    showView('test');
    go(0);
    tick();
    T.timer = setInterval(tick, 250);
  }

  function tick() {
    if (!T || T.over) return;
    const el = $('#t-clock');
    if (!T.end) { el.textContent = clock(Date.now() - T.start); return; }
    const left = T.end - Date.now();
    el.textContent = clock(left);
    el.classList.toggle('danger', left <= 60000);
    el.classList.toggle('warn', left > 60000 && left <= T.ms * 0.1);
    if (left <= 0) done('time');
  }

  function go(i) {
    if (i < 0 || i >= T.items.length) return;
    if (T.since) T.spent[T.cur] += Date.now() - T.since;
    T.cur = i; T.seen[i] = true; T.since = Date.now();
    paint(); sheet();
    $('#t-sheet').classList.remove('open');
  }

  function paint() {
    const i = T.cur, it = T.items[i], q = it.q, n = T.items.length, title = secTitle(q);
    $('#t-bar-progress').textContent = `question ${i + 1} of ${n}`;
    $('#t-qmeta').innerHTML =
      `<span class="t-qnum">Q${i + 1}</span>
       <span class="t-pill">${esc(tagOf(q))}</span>
       ${title ? `<span>${esc(title)}</span>` : ''}
       <span class="t-d-${esc(q.difficulty || 'medium')}">${esc(q.difficulty || 'medium')}</span>`;
    $('#t-qtext').innerHTML = md(q.question);
    $('#t-options').innerHTML = it.order.map((orig, k) =>
      `<button type="button" class="t-opt" role="radio" aria-checked="${T.resp[i] === k}" data-opt="${k}">
         <span class="t-bubble" aria-hidden="true">${LETTERS[k]}</span>
         <span class="t-opt-text">${mdInline(q.options[orig])}</span>
       </button>`).join('');
    const mark = $('#t-mark');
    mark.setAttribute('aria-pressed', String(T.flag[i]));
    mark.innerHTML = `<i class="ti ti-flag"></i> ${T.flag[i] ? 'marked' : 'mark for review'}`;
    $('#t-clear').disabled = T.resp[i] === null;
    $('#t-prev').disabled = i === 0;
    $('#t-next').innerHTML = i === n - 1
      ? 'review and submit <i class="ti ti-arrow-right"></i>'
      : 'next <i class="ti ti-arrow-right"></i>';
  }

  function pick(k) {
    if (T.over) return;
    const i = T.cur;
    T.resp[i] = T.resp[i] === k ? null : k;
    $$('#t-options .t-opt').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.opt === T.resp[i])));
    $('#t-clear').disabled = T.resp[i] === null;
    sheet();
  }

  function sheet() {
    let a = 0, f = 0;
    $$('#t-sheet-grid .t-cell').forEach((c, i) => {
      const ans = T.resp[i] !== null;
      if (ans) a++;
      if (T.flag[i]) f++;
      c.className = 't-cell' + (T.seen[i] ? ' seen' : '') + (ans ? ' done' : '') +
        (T.flag[i] ? ' flag' : '') + (i === T.cur ? ' here' : '');
      c.setAttribute('aria-label',
        `question ${i + 1}, ${ans ? 'answered' : T.seen[i] ? 'seen, not answered' : 'not seen'}${T.flag[i] ? ', marked' : ''}`);
    });
    $('#t-sheet-counts').textContent = `${a} of ${T.items.length} answered${f ? ` · ${f} marked` : ''}`;
  }

  function confirmSubmit() {
    const n = T.items.length, a = T.resp.filter(r => r !== null).length, f = T.flag.filter(Boolean).length;
    const bits = [`You have answered ${a} of ${n}.`];
    if (n - a) bits.push(`${plural(n - a, 'question')} will be scored as unanswered.`);
    if (f) bits.push(`${plural(f, 'question is', 'questions are')} still marked for review.`);
    const text = bits.join(' ');
    const dlg = $('#t-dialog');
    if (dlg && typeof dlg.showModal === 'function') {
      $('#t-dialog-body').textContent = text;
      dlg.showModal();
    } else if (window.confirm(text + ' Submit?')) {
      done('submit');
    }
  }

  function done(why) {
    if (!T || T.over) return;
    if (T.since) T.spent[T.cur] += Date.now() - T.since;
    T.since = 0; T.over = true; T.why = why; T.stop = Date.now();
    clearInterval(T.timer);
    const dlg = $('#t-dialog');
    if (dlg && dlg.open) dlg.close();
    filter = 'all';
    results();
    showView('test-result');
  }

  function bindTest() {
    $('#t-options').addEventListener('click', e => {
      const b = e.target.closest('[data-opt]');
      if (b) pick(+b.dataset.opt);
    });
    $('#t-prev').addEventListener('click', () => go(T.cur - 1));
    $('#t-next').addEventListener('click', () => T.cur === T.items.length - 1 ? confirmSubmit() : go(T.cur + 1));
    $('#t-mark').addEventListener('click', () => { T.flag[T.cur] = !T.flag[T.cur]; paint(); sheet(); });
    $('#t-clear').addEventListener('click', () => { T.resp[T.cur] = null; paint(); sheet(); });
    $('#t-sheet-grid').addEventListener('click', e => {
      const c = e.target.closest('[data-go]');
      if (c) go(+c.dataset.go);
    });
    $('#t-submit').addEventListener('click', confirmSubmit);
    $('#t-sheet-toggle').addEventListener('click', () => $('#t-sheet').classList.toggle('open'));
    $('#t-sheet-close').addEventListener('click', () => $('#t-sheet').classList.remove('open'));
    $('#t-dialog-cancel').addEventListener('click', () => $('#t-dialog').close());
    $('#t-dialog-ok').addEventListener('click', () => done('submit'));
    $('#t-quit').addEventListener('click', () => {
      if (window.confirm('Leave this test? Your answers will be lost.')) {
        clearInterval(T.timer); T = null; showView('test-setup');
      }
    });

    document.addEventListener('keydown', e => {
      if (!T || T.over || document.getElementById('view-test').hidden) return;
      const dlg = $('#t-dialog');
      if (dlg && dlg.open) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const key = e.key, nOpt = T.items[T.cur].order.length;
      let k = -1;
      if (/^[1-8]$/.test(key)) k = +key - 1;
      else if (key.length === 1 && /[a-h]/i.test(key) && key.toLowerCase() !== 'm') k = key.toLowerCase().charCodeAt(0) - 97;
      if (k >= 0 && k < nOpt) { e.preventDefault(); pick(k); return; }
      if (key === 'ArrowRight') { e.preventDefault(); go(T.cur + 1); }
      else if (key === 'ArrowLeft') { e.preventDefault(); go(T.cur - 1); }
      else if (key.toLowerCase() === 'm') { e.preventDefault(); $('#t-mark').click(); }
    });

    window.addEventListener('beforeunload', e => {
      if (T && !T.over) { e.preventDefault(); e.returnValue = ''; }
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  }

  /* =========================================================
     Results
     ========================================================= */
  const stateOf = i => T.resp[i] === null ? 'skip' : (T.resp[i] === T.items[i].correct ? 'ok' : 'no');

  // Open the notes post for a question, then scroll to its section heading.
  async function openNotes(q) {
    const subj = S.registry.subjects.find(s => s.id === (q.subject || S.subjectId));
    const meta = unitMetaOf(q);
    const file = q.notes || (meta && meta.notes);
    if (!subj || !subj.notesPath || !file || typeof window.renderPost !== 'function') return;
    await window.renderPost(subj.notesCategory, subj.notesPath.replace('{file}', file));
    showView('post');
    const tag = tagOf(q);
    requestAnimationFrame(() => {
      const h = $$('#post-article h2, #post-article h3')
        .find(el => el.textContent.replace(/\s+/g, ' ').trim().startsWith(tag));
      if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function results() {
    const n = T.items.length;
    const st = T.items.map((_, i) => stateOf(i));
    const ok = st.filter(s => s === 'ok').length;
    const no = st.filter(s => s === 'no').length;
    const skip = n - ok - no;
    const tried = ok + no;
    const used = T.stop - T.start;

    $('#t-score').innerHTML = `<strong>${ok} / ${n}</strong> correct (${pct(ok, n)}%) — ` +
      `${no} wrong, ${skip} unanswered${tried ? `, ${pct(ok, tried)}% accuracy on what you attempted` : ''}.`;
    $('#t-graph').innerHTML =
      `<span class="t-seg-ok" style="width:${(ok / n) * 100}%"></span>` +
      `<span class="t-seg-no" style="width:${(no / n) * 100}%"></span>` +
      `<span class="t-seg-skip" style="width:${(skip / n) * 100}%"></span>`;
    $('#t-time-note').textContent =
      (T.why === 'time' ? 'time ran out, submitted automatically · ' : '') +
      (T.ms ? `${dur(Math.min(used, T.ms))} of ${dur(T.ms)} used` : `${dur(used)} taken`) +
      ` · about ${dur(used / n)} per question`;

    const missed = n - ok;
    $('#t-again').hidden = missed === 0;
    $('#t-again').innerHTML = `<i class="ti ti-refresh"></i> practice the ${missed} you missed`;

    $('#t-rsheet').innerHTML = st.map((s, i) =>
      `<button type="button" class="t-cell ${s === 'skip' ? '' : s}" data-jump="${i}"
        aria-label="question ${i + 1}, ${s === 'ok' ? 'correct' : s === 'no' ? 'wrong' : 'not answered'}">${i + 1}</button>`).join('');

    // by section, weakest first
    const g = new Map();
    T.items.forEach((it, i) => {
      const tag = tagOf(it.q);
      if (!g.has(tag)) g.set(tag, { tag, q: it.q, total: 0, ok: 0 });
      const e = g.get(tag);
      e.total++;
      if (st[i] === 'ok') e.ok++;
    });
    const rows = [...g.values()].sort((a, b) =>
      (a.ok / a.total) - (b.ok / b.total) || b.total - a.total || a.tag.localeCompare(b.tag, undefined, { numeric: true }));
    $('#t-by-topic').innerHTML = table(rows.map(r => ({
      name: `<a href="#" data-notes="${esc(r.tag)}">${esc(r.tag)}</a>` +
        (secTitle(r.q) ? `<span class="sub">${esc(secTitle(r.q))}</span>` : ''),
      ok: r.ok, total: r.total,
    })));
    $('#t-by-diff').innerHTML = table(DIFFS.map(d => {
      const idx = T.items.map((_, i) => i).filter(i => (T.items[i].q.difficulty || 'medium') === d);
      return { name: cap(d), ok: idx.filter(i => st[i] === 'ok').length, total: idx.length };
    }).filter(r => r.total));

    filters(st);
    review(st);
  }

  const table = rows => !rows.length ? '<p class="t-empty">nothing to show</p>' :
    `<table class="t-table"><tbody>${rows.map(r => `<tr>
      <td>${r.name}</td>
      <td class="num">${r.ok}/${r.total}</td>
      <td><div class="t-meter" role="img" aria-label="${pct(r.ok, r.total)}% correct"><span style="width:${pct(r.ok, r.total)}%"></span></div></td>
    </tr>`).join('')}</tbody></table>`;

  function filters(st) {
    const c = {
      all: st.length,
      no: st.filter(s => s === 'no').length,
      skip: st.filter(s => s === 'skip').length,
      ok: st.filter(s => s === 'ok').length,
      flag: T.flag.filter(Boolean).length,
    };
    const label = { all: 'all', no: 'wrong', skip: 'unanswered', ok: 'correct', flag: 'marked' };
    $('#t-filters').innerHTML = Object.keys(label).filter(k => k === 'all' || c[k])
      .map(k => `<button type="button" class="t-filter" role="tab" aria-selected="${filter === k}" data-f="${k}">${label[k]} ${c[k]}</button>`).join('');
  }

  function review(st) {
    const list = T.items.map((it, i) => ({ it, i, s: st[i] }))
      .filter(({ i, s }) => filter === 'all' || (filter === 'flag' ? T.flag[i] : s === filter));
    if (!list.length) { $('#t-rv-list').innerHTML = '<li class="t-empty">nothing in this group</li>'; return; }
    $('#t-rv-list').innerHTML = list.map(({ it, i, s }) => {
      const q = it.q, tag = tagOf(q), title = secTitle(q);
      const word = s === 'ok' ? 'correct' : s === 'no' ? 'wrong' : 'not answered';
      const opts = it.order.map((orig, k) => {
        const right = k === it.correct, mine = T.resp[i] === k;
        const flag = right && mine ? 'your answer' : right ? 'correct answer' : mine ? 'your answer' : '';
        return `<li class="t-rv-opt ${right ? 'right' : mine ? 'mine' : ''}">
          <span class="t-bubble" aria-hidden="true">${LETTERS[k]}</span>
          <span class="t-opt-text">${mdInline(q.options[orig])}</span>
          <span class="t-flag">${flag}</span></li>`;
      }).join('');
      return `<li class="t-rv ${s === 'skip' ? '' : s}" id="t-rv-${i}">
        <div class="t-rv-head">
          <span class="t-qnum">Q${i + 1}</span>
          <span class="t-rv-status">${word}</span>
          <span class="t-pill">${esc(tag)}</span>
          <span class="t-d-${esc(q.difficulty || 'medium')}">${esc(q.difficulty || 'medium')}</span>
          ${T.flag[i] ? '<span>marked</span>' : ''}
          <span>${dur(T.spent[i])} spent</span>
        </div>
        <div class="t-qtext">${md(q.question)}</div>
        <ul class="t-rv-opts">${opts}</ul>
        ${q.explanation ? `<div class="t-expl"><b>why.</b> ${mdInline(q.explanation)}</div>` : ''}
        <p class="t-rv-link"><button type="button" data-notes="${esc(tag)}">
          read ${esc(tag)}${title ? ` · ${esc(title)}` : ''} in the notes</button></p>
      </li>`;
    }).join('');
  }

  function bindResults() {
    $('#t-filters').addEventListener('click', e => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      filter = b.dataset.f;
      const st = T.items.map((_, i) => stateOf(i));
      filters(st); review(st);
    });
    $('#t-rsheet').addEventListener('click', e => {
      const c = e.target.closest('[data-jump]');
      if (!c) return;
      const i = +c.dataset.jump;
      if (!$('#t-rv-' + i)) {
        filter = 'all';
        const st = T.items.map((_, k) => stateOf(k));
        filters(st); review(st);
      }
      const card = $('#t-rv-' + i);
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      card.classList.add('flash');
      setTimeout(() => card.classList.remove('flash'), 1200);
    });
    // both the section table and each review card link into the notes
    document.getElementById('view-test-result').addEventListener('click', e => {
      const el = e.target.closest('[data-notes]');
      if (!el) return;
      e.preventDefault();
      const item = T.items.find(it => tagOf(it.q) === el.dataset.notes);
      if (item) openNotes(item.q);
    });
    $('#t-retake').addEventListener('click', () => begin(shuffle(T.items.map(it => it.q)), T.ms));
    $('#t-again').addEventListener('click', () => {
      const per = T.ms ? T.ms / T.items.length : null;
      const qs = shuffle(T.items.filter((_, i) => stateOf(i) !== 'ok').map(it => it.q));
      if (qs.length) begin(qs, per ? Math.max(60000, Math.round(per * qs.length)) : null);
    });
    $('#t-new').addEventListener('click', () => { T = null; showView('test-setup'); refresh(); });
  }

  /* ---------------- boot ---------------- */
  bindSetup();
  bindTest();
  bindResults();
  decorateGroups();
})();
