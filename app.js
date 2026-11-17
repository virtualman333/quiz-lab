/* =========================================================
   测试实验室 · 应用框架
   数据驱动：每个测评在 data/*.js 里注册，框架只负责流程与渲染
   ========================================================= */
const TESTS = (window.__TESTS || []).slice();
const K_REC = 'quiz-records-v1', K_DRAFT = 'quiz-draft-v1', K_THEME = 'quiz-theme', K_MIG = 'quiz-migrated';
const MAX_REC = 100;

const $ = id => document.getElementById(id);
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('本地存储不可用，记录未能保存'); return false; } };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const p2 = n => String(n).padStart(2, '0');
const fmtTime = ts => { const d = new Date(ts); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()); };
const fmtDur = s => { if (!s || s < 0) return '—'; if (s < 60) return s + ' 秒'; return Math.floor(s / 60) + ' 分 ' + p2(s % 60) + ' 秒'; };
const byId = id => TESTS.find(t => t.id === id);
const codeOf = r => { const t = byId(r.testId); return r.badge || (t && t.short) || r.title || '—'; };
const recs = () => { const a = lsGet(K_REC, []); return Array.isArray(a) ? a : []; };
const saveRecs = a => lsSet(K_REC, a);

let curTest = null, curVariant = null, questions = [], answers = [], idx = 0, startTs = 0;
let currentRec = null, toastTimer = null;

function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2300); }

function show(sec) {
  ['home', 'quiz', 'result', 'report', 'history'].forEach(s => $(s).classList.toggle('hidden', s !== sec));
  document.body.classList.toggle('quizing', sec === 'quiz');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (sec === 'home') refreshHome();
}
function goHome() { show('home'); }

/* ============ 首页 ============ */
function refreshHome() {
  // 测试卡片
  $('testGrid').innerHTML = TESTS.map(t => {
    const v0 = t.variants[0];
    const total = t.variants.length > 1
      ? t.variants.map(v => v.label).join(' / ')
      : t.variants[0].qs.length + ' 题';
    const nums = t.variants.reduce((a, v) => a.concat(((v.minutes || '').match(/\d+/g) || [])), []).map(Number);
    const lo = nums.length ? Math.min.apply(null, nums) : 0, hi = nums.length ? Math.max.apply(null, nums) : 0;
    const mins = nums.length ? (lo === hi ? lo + ' 分钟' : lo + '–' + hi + ' 分钟') : '';
    return '<article class="test-card">' +
      '<div class="tc-top"><div class="tc-icon">' + (t.icon || '') + '</div>' +
      '<div class="tc-name"><h3>' + esc(t.name) + '</h3><p>' + esc(t.en || '') + '</p></div>' +
      '<span class="tc-tag">' + esc(t.tag || '') + '</span></div>' +
      '<p class="tc-desc">' + esc(t.desc) + '</p>' +
      '<div class="tc-meta"><span>▤ ' + esc(total) + '</span><span>◷ 约 ' + esc(mins) + '</span></div>' +
      (t.variants.length > 1
        ? '<div class="tc-actions">' + t.variants.map(v => '<button class="btn ' + (v.id === t.variants[0].id ? 'primary' : '') + '" onclick="startQuiz(\'' + t.id + '\',\'' + v.id + '\')">' + esc(v.label) + ' →</button>').join('') + '</div>'
        : '<div class="tc-actions"><button class="btn primary" onclick="startQuiz(\'' + t.id + '\',\'' + v0.id + '\')">开始测评 →</button></div>') +
      '</article>';
  }).join('');

  const list = recs();
  const b = $('histBadge'); b.textContent = list.length; b.classList.toggle('hidden', list.length === 0);

  if (list.length) {
    const r = list[0], t = byId(r.testId);
    $('recentCode').textContent = codeOf(r);
    $('recentTitle').textContent = (t ? t.name : '最近一次') + ' · ' + (r.title || '');
    $('recentSub').textContent = fmtTime(r.ts) + ' · 共 ' + list.length + ' 条记录 · 查看全部 →';
    $('recentCard').classList.remove('hidden');
  } else $('recentCard').classList.add('hidden');

  const d = lsGet(K_DRAFT, null);
  const hasDraft = d && Array.isArray(d.answers) && d.answers.some(x => x !== null && x !== undefined) && d.answers.some(x => x === null || x === undefined);
  if (hasDraft) {
    const t = byId(d.testId), v = t && t.variants.find(x => x.id === d.variantId);
    const done = d.answers.filter(x => x !== null && x !== undefined).length;
    $('resumeTitle').textContent = '继续：' + (t ? t.name : '未完成的测试');
    $('resumeSub').textContent = (v ? v.label : '') + ' · 已完成 ' + done + ' / ' + d.answers.length + ' 题';
    $('resumeBar').classList.remove('hidden');
  } else $('resumeBar').classList.add('hidden');
}
function resumeDraft() { const d = lsGet(K_DRAFT, null); if (d && byId(d.testId)) startQuiz(d.testId, d.variantId, d); }
function discardDraft() { try { localStorage.removeItem(K_DRAFT); } catch (e) { } refreshHome(); toast('已放弃未完成的测试'); }

/* ============ 答题 ============ */
function startQuiz(testId, variantId, restore) {
  const t = byId(testId); if (!t) return;
  const v = t.variants.find(x => x.id === variantId) || t.variants[0];
  curTest = t; curVariant = v; questions = v.qs;
  if (restore && Array.isArray(restore.answers)) {
    answers = restore.answers.slice(0, questions.length);
    while (answers.length < questions.length) answers.push(null);
    idx = Math.min(restore.idx || 0, questions.length - 1);
    startTs = restore.startTs || Date.now();
  } else {
    answers = new Array(questions.length).fill(null); idx = 0; startTs = Date.now();
  }
  $('modeLabel').textContent = t.name + (t.variants.length > 1 ? ' · ' + v.label : '');
  $('qTotal').textContent = questions.length;
  show('quiz'); renderQ();
}

const SCALES = {
  '5': ['很不符合', '不太符合', '一般', '比较符合', '非常符合'],
  '4': ['完全没有', '有几天', '一半以上日子', '几乎每天']
};

function renderQ() {
  const q = questions[idx], v = answers[idx];
  const t = curTest;
  $('qDim').textContent = q.dimLabel || t.name;
  $('qDim').style.display = q.dimLabel ? '' : 'none';
  $('qText').textContent = q.text;
  $('qNote').textContent = q.note || '';
  $('qNote').classList.toggle('hidden', !q.note);
  $('qNow').textContent = idx + 1;
  const done = answers.filter(x => x !== null && x !== undefined).length;
  $('progBar').style.width = (done / questions.length * 100) + '%';

  const box = $('opts');
  if (q.t === '2') {
    box.className = 'opts';
    box.innerHTML =
      '<button class="opt' + (v === 0 ? ' sel' : '') + '" onclick="pick(0)"><span class="key">A</span><span class="ot">' + esc(q.a) + '</span></button>' +
      '<button class="opt' + (v === 1 ? ' sel' : '') + '" onclick="pick(1)"><span class="key">B</span><span class="ot">' + esc(q.b) + '</span></button>' +
      (t.allowUnsure === false ? '' : '<button class="unsure' + (v === 'u' ? ' sel' : '') + '" onclick="pick(\'u\')">○ 说不准 / 两个都不太像<em>该题不计分</em></button>');
  } else {
    const labels = (curVariant.scale && curVariant.scale[q.t]) || SCALES[q.t] || [];
    box.className = 'opts likert';
    box.innerHTML = labels.map((lab, i) => {
      const val = q.t === '4' ? i : i + 1;
      return '<button class="opt' + (v === val ? ' sel' : '') + '" onclick="pick(' + val + ')"><span class="dotmark"></span><span class="ot">' + esc(lab) + '</span></button>';
    }).join('');
  }

  $('dimNote').innerHTML = '<span class="dn">进度</span><span class="dv">已完成 ' + done + ' / ' + questions.length + ' 题' +
    (q.hintText ? ' · ' + esc(q.hintText) : '') + '。没有标准答案，凭第一反应作答更准确。</span>';

  $('prevBtn').disabled = idx === 0;
  $('prevBtn').style.opacity = idx === 0 ? '.45' : '1';
  $('nextBtn').textContent = idx === questions.length - 1 ? '提交并查看结果 →' : '下一题 →';

  const card = $('qCard'); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
  lsSet(K_DRAFT, { testId: curTest.id, variantId: curVariant.id, answers, idx, startTs });
}

function pick(v) {
  answers[idx] = v; renderQ();
  setTimeout(() => { if (idx < questions.length - 1) { idx++; renderQ(); } else finish(); }, 170);
}
function nextQ() {
  const left = answers.filter(x => x === null || x === undefined).length;
  if (idx < questions.length - 1) { idx++; renderQ(); }
  else if (left > 0) {
    const first = answers.findIndex(x => x === null || x === undefined);
    idx = first; renderQ(); toast('还有 ' + left + ' 题未作答，已跳到第一处');
  } else finish();
}
function prevQ() { if (idx > 0) { idx--; renderQ(); } }

function finish() {
  const left = answers.filter(x => x === null || x === undefined).length;
  if (left > 0) { idx = answers.findIndex(x => x === null || x === undefined); renderQ(); toast('还有 ' + left + ' 题未作答，请先完成'); return; }

  const r = curTest.compute(answers.slice(), questions, curVariant.id);
  const rec = {
    id: uid(), ts: Date.now(), testId: curTest.id, variantId: curVariant.id,
    answers: answers.slice(), duration: Math.max(0, Math.round((Date.now() - startTs) / 1000)),
    badge: r.badge || '', title: r.title || '', verdict: r.verdict || '', dimsBrief: brief(r)
  };
  const list = recs(); list.unshift(rec); if (list.length > MAX_REC) list.length = MAX_REC;
  const ok = saveRecs(list);
  try { localStorage.removeItem(K_DRAFT); } catch (e) { }
  currentRec = rec;
  renderResult(rec, ok ? '已保存到我的记录 · 第 ' + recs().length + ' 条' : '', false);
  show('result');
}

function brief(r) {
  return (r.dims || []).map(d => d.twoPole
    ? { label: d.a + '/' + d.b, pct: d.pct, pole: d.win }
    : { label: d.label, pct: d.pct, pole: d.level });
}
function computeRecord(rec) {
  const t = byId(rec.testId); if (!t) return null;
  const v = t.variants.find(x => x.id === rec.variantId) || t.variants[0];
  return t.compute(rec.answers.slice(), v.qs, v.id);
}

/* ============ 结果渲染 ============ */
function modulesHTML(r, forPrint) {
  let h = '';

  if (r.summary) {
    h += '<div class="block-title">总体结论</div><p class="summary">' + r.summary + '</p>';
  }

  if (r.radar && r.radar.axes && r.radar.axes.length >= 3) {
    h += '<div class="block-title">维度雷达图</div><div class="radar-wrap">' + radarSVG(r.radar.axes, r.radar.max || 100) + '</div>';
  }

  if (r.dims && r.dims.length) {
    h += '<div class="block-title">各维度得分</div>';
    h += r.dims.map(d => {
      if (d.twoPole) {
        return '<div class="bar-row">' +
          '<div class="bar-head"><span>' + esc(d.a) + ' <b>' + d.pct + '%</b></span><span><b>' + (100 - d.pct) + '%</b> ' + esc(d.b) + '</span></div>' +
          '<div class="bar"><div class="a" style="width:' + d.pct + '%"></div><div class="b"></div></div>' +
          '<div class="bar-foot"><span class="lv">' + esc(d.level || '') + (d.win ? ' · ' + esc(d.win) : '') + '</span><span class="dd">' + esc(d.raw || '') + (d.desc ? ' · ' + esc(d.desc) : '') + '</span></div></div>';
      }
      return '<div class="bar-row">' +
        '<div class="bar-head"><span>' + esc(d.label) + '</span><span><b>' + d.pct + '%</b>' + (d.level ? ' · ' + esc(d.level) : '') + '</span></div>' +
        '<div class="bar"><div class="a" style="width:' + d.pct + '%"></div></div>' +
        '<div class="bar-foot"><span>' + esc(d.low || '') + '</span><span class="dd">' + esc(d.raw || '') + (d.high ? ' · ' + esc(d.high) : '') + '</span></div></div>';
    }).join('');
  }

  if (r.scales && r.scales.length) {
    h += '<div class="block-title">量表得分</div>';
    h += r.scales.map(s => {
      const pct = Math.round(s.value / s.max * 100);
      const bands = s.bands || [];
      const seg = bands.map(b => {
        const w = (b.to - b.from + 1) / (s.max + 1) * 100;
        return '<i style="width:' + w + '%;background:' + b.color + '"></i>';
      }).join('');
      return '<div class="scale-row">' +
        '<div class="scale-top"><b>' + esc(s.label) + '</b><span class="scale-val"><em>' + s.value + '</em> / ' + s.max + ' · ' + esc(s.band) + '</span></div>' +
      '<div class="scale-track">' + seg + '<span class="scale-needle" style="left:' + Math.max(1, Math.min(99, pct)) + '%"></span></div>' +
        '<div class="scale-band">' + esc(s.note || '') + '</div>' +
        (s.advice ? '<div class="scale-advice">' + esc(s.advice) + '</div>' : '') +
        '</div>';
    }).join('');
  }

  if (r.chips && r.chips.length) {
    h += '<div class="block-title">关键词</div><div class="chips">' + r.chips.map(c => '<span class="chip">' + esc(c) + '</span>').join('') + '</div>';
  }

  if (r.sections && r.sections.length) {
    h += '<div class="block-title">详细解读</div><div class="sections">' +
      r.sections.map(s => '<div class="sec-item"><h4>' + esc(s.h) + '</h4><p>' + s.p + '</p></div>').join('') + '</div>';
  }

  if (r.tips && r.tips.length) {
    h += r.tips.map(t => '<div class="tip ' + (t.type || '') + '">' + (t.title ? '<b>' + esc(t.title) + ' · </b>' : '') + t.text + '</div>').join('');
  }
  return h;
}

function radarSVG(axes, max) {
  const n = axes.length, cx = 170, cy = 150, R = 100;
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  let g = '';
  [0.25, 0.5, 0.75, 1].forEach(k => {
    const pts = axes.map((_, i) => pt(i, R * k).join(',')).join(' ');
    g += '<polygon points="' + pts + '" fill="none" stroke="var(--card-brd)" stroke-width="1"/>';
  });
  axes.forEach((_, i) => {
    const [x, y] = pt(i, R);
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '" stroke="var(--card-brd)" stroke-width="1"/>';
  });
  const dataPts = axes.map((ax, i) => { const v = Math.max(2, Math.min(100, ax.value)) / 100; return pt(i, R * v).join(','); }).join(' ');
  g += '<polygon points="' + dataPts + '" fill="rgba(113,102,240,.26)" stroke="var(--brand-2)" stroke-width="2" stroke-linejoin="round"/>';
  axes.forEach((ax, i) => {
    const v = Math.max(2, Math.min(100, ax.value)) / 100;
    const [x, y] = pt(i, R * v);
    g += '<circle cx="' + x + '" cy="' + y + '" r="3.2" fill="var(--brand-2)"/>';
    const [lx, ly] = pt(i, R + 26);
    const anchor = Math.abs(lx - cx) < 8 ? 'middle' : (lx > cx ? 'start' : 'end');
    g += '<text x="' + lx + '" y="' + (ly + 4) + '" font-size="11" fill="var(--tx-2)" text-anchor="' + anchor + '">' + esc(ax.label) + '</text>';
  });
  return '<svg viewBox="0 0 340 300" role="img" aria-label="维度雷达图">' + g + '</svg>';
}

function renderResult(rec, savedMsg, isHistory) {
  const t = byId(rec.testId);
  const r = computeRecord(rec);
  if (!t || !r) { toast('记录已失效'); return; }
  const v = t.variants.find(x => x.id === rec.variantId) || t.variants[0];
  const head = '<div class="panel"><div class="r-head">' +
    '<div class="lbl">' + (isHistory ? '历史记录 · ' : '') + esc(t.name) + '</div>' +
    (r.badge ? '<div class="r-badge">' + esc(r.badge) + '</div>' : '') +
    '<div class="r-title" role="heading" aria-level="2">' + esc(r.title || '') + (r.subtitle ? ' <span>' + esc(r.subtitle) + '</span>' : '') + '</div>' +
    '<div class="r-meta">' + esc(v.label) + ' · 用时 ' + fmtDur(rec.duration) + ' · ' + fmtTime(rec.ts) + '</div>' +
    '</div><div class="r-body">' +
    (savedMsg ? '<div class="saved"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>' + esc(savedMsg) + '</span></div>' : '') +
    modulesHTML(r, false) +
    '<div class="result-actions">' +
    '<button class="btn primary" onclick="openReport()">生成完整报告</button>' +
    '<button class="btn" onclick="retestCurrent()">再测一次</button>' +
    '<button class="btn" onclick="goHome()">换个测评</button>' +
    '</div>' +
    '<div class="copy-box"><span id="shareText">' + shareHTML(rec, r) + '</span><button onclick="copyShare()">复制</button></div>' +
    '</div></div>' +
    '<p class="foot-note">结果由本地计算生成 · 仅供自我探索参考</p>';
  $('resultBody').innerHTML = head;
  currentRec = rec;
}
function questions0(rec) {
  const t = byId(rec.testId); if (!t) return rec.answers.length;
  const v = t.variants.find(x => x.id === rec.variantId) || t.variants[0];
  return v.qs.length;
}
function shareText(rec, r) {
  const t = byId(rec.testId);
  const core = r.badge ? r.badge + ' · ' + r.title : r.title;
  return '我的' + t.name + '结果：' + core + '。' + (r.verdict || '') + ' ' + location.origin + '/';
}
function shareHTML(rec, r) {
  const url = location.origin + '/';
  const txt = shareText(rec, r);
  const body = txt.slice(0, txt.length - url.length);
  return esc(body) + '<span class="nowrap">' + esc(url) + '</span>';
}
function retestCurrent() { if (currentRec) startQuiz(currentRec.testId, currentRec.variantId); }

/* ============ 报告 ============ */
function openReport() {
  if (!currentRec) return;
  renderReport(currentRec);
  show('report');
}
function renderReport(rec) {
  const t = byId(rec.testId), r = computeRecord(rec);
  if (!t || !r) return;
  const v = t.variants.find(x => x.id === rec.variantId) || t.variants[0];
  const disclaim = t.disclaimer || '本报告由自我报告式量表生成，反映你作答当时的自我认知，仅供自我探索参考，不构成心理诊断或医疗建议。';
  $('reportPanel').innerHTML =
    '<div class="rpt-cover">' +
    '<div class="kicker">个人测评报告</div>' +
    '<h2>' + esc(t.name) + (r.badge ? ' · ' + esc(r.badge) : '') + '</h2>' +
    '<div class="who">' + esc(r.title || '') + (r.subtitle ? ' / ' + esc(r.subtitle) : '') + '</div>' +
    '<div class="rpt-meta"><span>版本：' + esc(v.label) + '</span><span>用时：' + fmtDur(rec.duration) + '</span><span>生成于：' + fmtTime(rec.ts) + '</span></div>' +
    '</div>' +
    '<div class="r-body">' + modulesHTML(r, true) +
    '<div class="rpt-foot"><b>免责声明</b><br>' + esc(disclaim) + '<br>报告由 quiz.virtualman.top 在你的浏览器本地生成，未上传任何数据。</div>' +
    '</div>';
}
function printReport() { if (!currentRec) return; window.print(); }
function backToResult() { if (currentRec) { renderResult(currentRec, '', false); show('result'); } else goHome(); }
function exportRecord() {
  if (!currentRec) return;
  download([currentRec], 'report-' + currentRec.testId + '-' + new Date(currentRec.ts).toISOString().slice(0, 10) + '.json');
}

/* ============ 记录 ============ */
let filterTest = 'all';
function openHistory() { filterTest = 'all'; renderHistory(); show('history'); }

function renderHistory() {
  const list = recs();
  const sg = $('statGrid'), fr = $('filterRow'), hl = $('histList');
  $('histTools').classList.toggle('hidden', list.length === 0);

  if (!list.length) {
    sg.innerHTML = ''; fr.innerHTML = '';
    hl.innerHTML = '<div class="empty"><div class="em">◷</div><b>还没有测评记录</b><p>完成任意一个测评后，结果会自动保存在本机浏览器里，随时可以回看、生成报告或对比。</p><button class="btn primary" onclick="goHome()">去选一个测评 →</button></div>';
    return;
  }

  const tests = [...new Set(list.map(r => r.testId))];
  const latest = list[0];
  const latestTest = byId(latest.testId);
  const avg = Math.round(list.reduce((s, r) => s + (r.duration || 0), 0) / list.length);
  sg.innerHTML =
    '<div class="stat"><div class="k">累计记录</div><div class="v">' + list.length + ' <span style="font-size:12px;font-weight:500">条</span></div><div class="s">覆盖 ' + tests.length + ' 个测评</div></div>' +
    '<div class="stat"><div class="k">最近一次</div><div class="v grad">' + esc(codeOf(latest)) + '</div><div class="s">' + esc(latestTest ? latestTest.name : '') + ' · ' + fmtTime(latest.ts) + '</div></div>' +
    '<div class="stat"><div class="k">平均用时</div><div class="v">' + fmtDur(avg) + '</div><div class="s">每次测评</div></div>' +
    '<div class="stat"><div class="k">已生成报告</div><div class="v">' + list.length + ' <span style="font-size:12px;font-weight:500">份</span></div><div class="s">可随时重新生成</div></div>';

  fr.innerHTML = '<button class="fchip ' + (filterTest === 'all' ? 'on' : '') + '" onclick="setFilter(\'all\')">全部 ' + list.length + '</button>' +
    tests.map(id => {
      const t = byId(id); const c = list.filter(r => r.testId === id).length;
      return '<button class="fchip ' + (filterTest === id ? 'on' : '') + '" onclick="setFilter(\'' + id + '\')">' + esc(t ? t.name : id) + ' ' + c + '</button>';
    }).join('');

  const shown = filterTest === 'all' ? list : list.filter(r => r.testId === filterTest);
  hl.innerHTML = shown.map(r => {
    const t = byId(r.testId), v = t && t.variants.find(x => x.id === r.variantId);
    const mini = (r.dimsBrief || []).map(d => '<i title="' + esc(d.label) + ' ' + d.pct + '%"><b style="width:' + d.pct + '%"></b></i>').join('');
    const qs0 = (v && v.qs) || [];
    const ag = r.answers.map((a, j) => {
      const qt = qs0[j] ? qs0[j].t : '';
      const isTwo = qt === '2';
      const cls = a === 'u' ? 'u' : (isTwo ? (a === 0 ? 'a' : 'b') : 'a');
      const txt = a === 'u' ? '?' : (isTwo ? (a === 0 ? 'A' : 'B') : String(a));
      return '<span class="' + cls + '" title="第' + (j + 1) + '题">' + txt + '</span>';
    }).join('');
    return '<div class="rec" id="rec_' + r.id + '">' +
      '<div class="rec-head" onclick="toggleRec(\'' + r.id + '\')">' +
      '<div class="rec-code">' + esc(codeOf(r)) + '</div>' +
      '<div class="rec-main"><div class="t">' + esc(r.title || '') + ' <span class="tag-mini">' + esc(t ? t.name : '') + '</span>' + (v ? ' <span class="tag-mini">' + esc(v.label) + '</span>' : '') + '</div>' +
      '<div class="m">' + fmtTime(r.ts) + ' · 用时 ' + fmtDur(r.duration) + ' · ' + r.answers.length + ' 题</div></div>' +
      '<div class="rec-arrow">⌄</div></div>' +
      (mini ? '<div class="mini">' + mini + '</div>' : '') +
      '<div class="rec-detail hidden" id="det_' + r.id + '">' +
      '<div class="ans-toggle"><button class="btn sm" onclick="toggleAns(\'' + r.id + '\',this)">▸ 展开答题明细（' + r.answers.length + ' 题）</button></div>' +
      '<div class="answers hidden" id="ans_' + r.id + '"><div class="at">按作答顺序排列；数字为李克特分值，? 表示说不准</div><div class="agrid">' + ag + '</div></div>' +
      '<div class="rec-acts"><button class="btn sm primary" onclick="viewRecord(\'' + r.id + '\')">查看结果</button>' +
      '<button class="btn sm" onclick="reportRecord(\'' + r.id + '\')">生成报告</button>' +
      '<button class="btn sm danger" onclick="delRecord(\'' + r.id + '\')">删除</button></div>' +
      '</div></div>';
  }).join('');
}
function setFilter(id) { filterTest = id; renderHistory(); }
function toggleRec(id) { const el = $('rec_' + id), d = $('det_' + id); if (!el) return; el.classList.toggle('open'); d.classList.toggle('hidden'); }
function toggleAns(id, btn) { const a = $('ans_' + id); if (!a) return; const hid = a.classList.toggle('hidden'); if (btn) btn.textContent = hid ? '▸ 展开答题明细' : '▾ 收起答题明细'; }
function viewRecord(id) { const r = recs().find(x => x.id === id); if (!r) return; renderResult(r, '', true); show('result'); }
function reportRecord(id) { const r = recs().find(x => x.id === id); if (!r) return; currentRec = r; renderReport(r); show('report'); }
function delRecord(id) {
  if (!confirm('确定删除这条记录吗？此操作不可撤销。')) return;
  saveRecs(recs().filter(x => x.id !== id)); renderHistory(); refreshHome(); toast('已删除该条记录');
}
function clearRecords() {
  const n = recs().length; if (!n) return;
  if (!confirm('确定清空全部 ' + n + ' 条记录吗？此操作不可撤销。\n如需留档，建议先导出 JSON。')) return;
  saveRecs([]); renderHistory(); refreshHome(); toast('已清空全部记录');
}
function exportAll() { const list = recs(); if (!list.length) { toast('暂无记录可导出'); return; } download(list, 'quiz-records-' + new Date().toISOString().slice(0, 10) + '.json'); }
function download(list, name) {
  try {
    const data = { app: '测试实验室', site: location.origin, version: 2, exportedAt: new Date().toISOString(), count: list.length, records: list };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('已导出 ' + list.length + ' 条数据');
  } catch (e) { toast('导出失败：' + e.message); }
}

function copyShare() {
  const el = $('shareText'); if (!el) return;
  const txt = el.textContent;
  const done = () => toast('已复制分享文案');
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done).catch(() => fallbackCopy(txt, done));
  else fallbackCopy(txt, done);
}
function fallbackCopy(txt, cb) {
  try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); cb(); }
  catch (e) { toast('复制失败，请长按文字手动复制'); }
}

/* ============ 键盘 / 主题 / 迁移 ============ */
document.addEventListener('keydown', e => {
  if ($('quiz').classList.contains('hidden')) return;
  if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const q = questions[idx]; if (!q) return;
  const k = e.key;
  if (q.t === '2') {
    if (k === 'a' || k === 'A' || k === '1') { e.preventDefault(); pick(0); }
    else if (k === 'b' || k === 'B' || k === '2') { e.preventDefault(); pick(1); }
    else if (k === 'u' || k === 'U' || k === '3') { e.preventDefault(); pick('u'); }
  } else {
    const n = parseInt(k, 10);
    if (n >= 1 && n <= (q.t === '4' ? 4 : 5)) { e.preventDefault(); pick(q.t === '4' ? n - 1 : n); }
  }
  if (k === 'ArrowLeft') { e.preventDefault(); prevQ(); }
  if (k === 'ArrowRight') { e.preventDefault(); nextQ(); }
});

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(K_THEME, t); } catch (e) { }
  $('themeBtn').innerHTML = t === 'dark'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
}
$('themeBtn').onclick = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');

function migrateOld() {
  if (lsGet(K_MIG, 0)) return;
  const old = lsGet('mbti-records-v1', []);
  if (Array.isArray(old) && old.length) {
    const cur = recs();
    old.forEach(o => {
      try {
        const rec = {
          id: o.id || uid(), ts: o.ts || Date.now(), testId: 'mbti',
          variantId: o.mode === 'full' ? 'full' : 'quick',
          answers: o.answers || [], duration: o.duration || 0
        };
        const r = computeRecord(rec); if (!r) return;
        rec.badge = r.badge || ''; rec.title = r.title || ''; rec.verdict = r.verdict || ''; rec.dimsBrief = brief(r);
        cur.push(rec);
      } catch (e) { }
    });
    cur.sort((a, b) => b.ts - a.ts);
    saveRecs(cur);
  }
  lsSet(K_MIG, 1);
}

/* 启动 */
migrateOld();
applyTheme((() => { try { return localStorage.getItem(K_THEME); } catch (e) { return null; } })() || 'dark');
show('home');
