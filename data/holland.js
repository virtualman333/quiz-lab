/* 霍兰德职业兴趣 RIASEC · 60 题（6 维各 10 题） */
(function () {
  const Q = text => ({ t: '5', text: '我喜欢' + text, key: '', rev: false, dimLabel: null });
  const mk = (text, key) => { const q = Q(text); q.key = key; return q; };

  const QS = [
    // R 实用型
    mk('动手修理家里的电器或家具', 'R'),
    mk('组装模型、装置或设备', 'R'),
    mk('在户外、车间或现场干活', 'R'),
    mk('操作机械、工具或仪器', 'R'),
    mk('学一门手艺，比如木工、园艺或烹饪', 'R'),
    mk('排查有故障的设备并把它修好', 'R'),
    mk('亲自测量、施工或安装东西', 'R'),
    mk('和实物打交道，而不是和文件打交道', 'R'),
    mk('做需要体力和手上功夫的活', 'R'),
    mk('把一张设计图变成实物', 'R'),
    // I 研究型
    mk('研究一个现象背后的原理', 'I'),
    mk('做实验验证自己的猜想', 'I'),
    mk('读有深度的专业资料', 'I'),
    mk('分析数据，从中找出规律', 'I'),
    mk('解复杂的逻辑题或难题', 'I'),
    mk('探索一个完全陌生的学科', 'I'),
    mk('提出假设，再想办法检验它', 'I'),
    mk('独立思考，而不是照着别人说的做', 'I'),
    mk('弄清一个系统到底是怎么运作的', 'I'),
    mk('和懂行的人深入讨论专业问题', 'I'),
    // A 艺术型
    mk('写点东西，比如故事、诗或文案', 'A'),
    mk('画画、做设计或摆弄视觉相关的东西', 'A'),
    mk('玩音乐、唱歌或演奏乐器', 'A'),
    mk('拍照或拍视频', 'A'),
    mk('用与众不同的方式表达自己', 'A'),
    mk('布置空间，做美学上的安排', 'A'),
    mk('看展、看剧、看电影', 'A'),
    mk('想一些有创意的点子', 'A'),
    mk('在不受太多约束的环境里做事', 'A'),
    mk('把感受变成一件作品', 'A'),
    // S 社会型
    mk('帮别人解决他们的困扰', 'S'),
    mk('教别人学会一件事', 'S'),
    mk('听别人倾诉，陪着对方', 'S'),
    mk('组织大家一起做一件事', 'S'),
    mk('照顾需要帮助的人', 'S'),
    mk('在团队里做协调和沟通的工作', 'S'),
    mk('参加公益或志愿活动', 'S'),
    mk('给别人做情绪上的支持', 'S'),
    mk('和形形色色的人建立关系', 'S'),
    mk('看到别人因为自己而变好', 'S'),
    // E 企业型
    mk('说服别人接受一个方案', 'E'),
    mk('带头推动一个项目往前走', 'E'),
    mk('谈判，为团队争取资源', 'E'),
    mk('把一个想法做成生意', 'E'),
    mk('在竞争里赢下来', 'E'),
    mk('做决策并为结果负责', 'E'),
    mk('领导一个团队', 'E'),
    mk('见客户、拓展关系', 'E'),
    mk('接下有风险但回报高的机会', 'E'),
    mk('定目标，然后盯住结果', 'E'),
    // C 常规型
    mk('把资料整理得井井有条', 'C'),
    mk('按流程把事情做标准', 'C'),
    mk('核对数据、检查错误', 'C'),
    mk('做表格、统计和记录', 'C'),
    mk('在规则清晰的环境里工作', 'C'),
    mk('把复杂的事拆成清楚的步骤', 'C'),
    mk('管理文件与档案', 'C'),
    mk('让事情按计划准时推进', 'C'),
    mk('处理细节性的工作', 'C'),
    mk('有明确的评价标准可依据', 'C')
  ];

  const DIMS = [
    {
      key: 'R', label: 'R 实用型', name: '实用型', en: 'Realistic', desc: '动手、工具与实物',
      high: '你喜欢和实物、工具、设备打交道，偏好具体、能看到结果的工作。动手能力强，不太喜欢长时间处理抽象符号。',
      mid: '你不排斥动手的工作，也能适应案头任务，属于比较实用的类型。',
      low: '你对操作机械、动手施工这类工作兴趣不大，更愿意把精力放在人、想法或信息上。',
      careers: ['工程与制造', '设备维护', '户外与施工', '农林园艺', '技术工种']
    },
    {
      key: 'I', label: 'I 研究型', name: '研究型', en: 'Investigative', desc: '分析、探究与原理',
      high: '你享受探究事物背后的原理，喜欢分析、推理和解决复杂问题。比起立刻行动，你更愿意先把事情想明白。',
      mid: '你有一定的求知欲，愿意在需要时深入研究，但不会凡事都要追根究底。',
      low: '你更倾向于直接解决问题，而不是先做大量分析。这让你行动快，但复杂问题上可能需要借助他人的研究。',
      careers: ['科研与实验', '数据分析', '医疗与健康', '工程技术研发', '咨询与研究']
    },
    {
      key: 'A', label: 'A 艺术型', name: '艺术型', en: 'Artistic', desc: '创造、表达与审美',
      high: '你有较强的审美与表达欲，喜欢原创、不被框架限制的方式。在需要创意和自我表达的环境里，你会更有活力。',
      mid: '你欣赏创意，也能在规范的环境里工作，属于能兼顾表达与执行的人。',
      low: '你更看重明确和实用，不太依赖艺术化的表达方式。这让你做事直接，但在需要打动人的场合可以多借助故事。',
      careers: ['设计与视觉', '内容创作', '影视与音乐', '品牌与广告', '文化与艺术']
    },
    {
      key: 'S', label: 'S 社会型', name: '社会型', en: 'Social', desc: '助人、教育与连接',
      high: '你从帮助和连接他人中获得意义，善于倾听、教学和协调。人和关系是你工作中最重要的部分。',
      mid: '你愿意与人合作，也能独立完成工作，人际与任务之间比较平衡。',
      low: '你更关注事情本身，而不是人际互动。这让你能专注推进任务，但团队协作中需要刻意多沟通。',
      careers: ['教育与培训', '心理咨询', '社会工作', '人力资源', '医疗护理']
    },
    {
      key: 'E', label: 'E 企业型', name: '企业型', en: 'Enterprising', desc: '影响、领导与进取',
      high: '你喜欢影响他人、推动事情发生，愿意为结果承担责任。在需要争取资源、带队打硬仗的场合，你会更有状态。',
      mid: '你有一定的推动力，能在必要时站出来，但不追求时刻处在主导位置。',
      low: '你不太享受说服和竞争，更愿意做好手头的专业工作，而不是去争资源、带团队。',
      careers: ['销售与商务', '管理与运营', '创业', '市场拓展', '项目领导']
    },
    {
      key: 'C', label: 'C 常规型', name: '常规型', en: 'Conventional', desc: '秩序、数据与规范',
      high: '你重视秩序、准确和规范，善于把信息和流程整理清楚。有你在，事情不容易乱。',
      mid: '你能接受规则与流程，也能在需要时灵活处理，不会死守形式。',
      low: '你不喜欢繁琐的规则与重复的核对，更愿意把精力放在变化和创造上。这让你灵活，但需要留意细节风险。',
      careers: ['财务与会计', '行政与法务', '数据管理', '审计与合规', '供应链与运营']
    }
  ];

  function lv(pct) { return pct >= 65 ? 'high' : pct <= 35 ? 'low' : 'mid'; }
  function lvText(pct) { return pct >= 65 ? '偏高' : pct <= 35 ? '偏低' : '中等'; }
  const ORDER = ['R', 'I', 'A', 'S', 'E', 'C'];

  (window.__TESTS = window.__TESTS || []).push({
    id: 'holland',
    name: '霍兰德职业兴趣',
    en: 'Holland Code / RIASEC',
    short: 'RIASEC',
    tag: '职业 · 兴趣',
    color: '#4ED8A6',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2.5 20 7v10l-8 4.5L4 17V7z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    desc: '60 项活动偏好，得出你的 RIASEC 三字母兴趣代码，并给出对应的职业方向参考。',
    allowUnsure: false,
    variants: [{ id: 'std', label: '标准版 60 题', minutes: '5–8 分钟', qs: QS }],
    dims: ORDER.map(k => ({ key: k, label: DIMS.find(d => d.key === k).label, desc: DIMS.find(d => d.key === k).desc })),
    disclaimer: '霍兰德代码描述的是兴趣倾向，不代表能力，也不决定你必须做什么工作。兴趣会随经历变化，建议结合能力、价值观与现实条件综合判断。',
    compute(answers, qs) {
      const sum = {}, cnt = {};
      qs.forEach((q, i) => {
        const v = Number(answers[i]);
        if (!v) return;
        sum[q.key] = (sum[q.key] || 0) + v;
        cnt[q.key] = (cnt[q.key] || 0) + 1;
      });
      const dims = ORDER.map(k => {
        const d = DIMS.find(x => x.key === k);
        const s = sum[k] || 0, n = cnt[k] || 1;
        const pct = Math.round((s - n) / (n * 4) * 100);
        return { label: d.label, pct, level: lvText(pct), low: d.desc, raw: s + ' / ' + (n * 5), key: k, lv: lv(pct), name: d.name };
      });
      const sorted = dims.slice().sort((a, b) => b.pct - a.pct);
      const top3 = sorted.slice(0, 3);
      const code = top3.map(d => d.key).join('');
      const names = top3.map(d => d.name).join(' · ');
      const careers = [];
      top3.forEach(d => {
        const cfg = DIMS.find(x => x.key === d.key);
        cfg.careers.forEach(c => { if (careers.indexOf(c) < 0) careers.push(c); });
      });

      const secs = top3.map(d => {
        const cfg = DIMS.find(x => x.key === d.key);
        return { h: cfg.label + ' · ' + d.level + '（' + d.pct + '%）', p: cfg[d.lv] };
      });
      secs.push({
        h: '职业方向参考',
        p: '你的兴趣代码是 <strong>' + code + '</strong>（' + names + '）。这类组合常见的适配方向包括：' + careers.slice(0, 7).join('、') + '。这些方向只是「你可能更愿意投入」的领域，具体选择还要看你的能力、价值观和现实条件。'
      });
      const lowDim = sorted[5];
      secs.push({
        h: '相对最低的维度',
        p: '你的 ' + lowDim.label + ' 相对较低（' + lowDim.pct + '%）。这不代表你做不好，而是说明它不太容易成为你的动力来源——在选择工作时，尽量别让这部分占据太大比重。'
      });

      return {
        badge: code,
        title: names,
        subtitle: 'RIASEC',
        summary: '你的兴趣中心在 <strong>' + top3[0].name + '</strong>（' + top3[0].pct + '%），其次是 <strong>' + top3[1].name + '</strong>（' + top3[1].pct + '%）和 <strong>' + top3[2].name + '</strong>（' + top3[2].pct + '%）。霍兰德用六个维度描述兴趣方向，代码顺序代表强度排序。',
        radar: { max: 100, axes: dims.map(d => ({ label: d.key, value: d.pct })) },
        dims,
        chips: careers.slice(0, 6),
        sections: secs,
        tips: [
          { type: 'ok', title: '怎么用这个代码', text: '三字母代码的用法是「主方向 + 可接受的备选」：第一个字母是你最想投入的方向，第二、三个字母是能让你保持兴趣的补充。找工作或转岗时，可以拿它来筛选而不是定死。' },
          { type: 'info', title: '兴趣不等于能力', text: '喜欢做一件事，和能把这件事做好，是两件事。兴趣高的领域往往也需要长期的技能积累，别把「我现在不擅长」当成「我不适合」。' }
        ],
        verdict: '你的兴趣代码是 ' + code + '：' + names + '。'
      };
    }
  });
})();
