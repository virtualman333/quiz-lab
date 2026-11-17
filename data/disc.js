/* DISC 行为风格 · 24 题（D/I/S/C 各 6 题） */
(function () {
  const Q = (text, key) => ({ t: '5', text, key, rev: false, dimLabel: null });

  const QS = [
    Q('我喜欢在团队里拿主意、做决定。', 'D'),
    Q('面对竞争，我会更有干劲。', 'D'),
    Q('我说话直接，喜欢把结论先说清楚。', 'D'),
    Q('遇到阻力时，我会想办法突破而不是绕开。', 'D'),
    Q('我不怕承担有风险的任务。', 'D'),
    Q('我倾向于快速推进，而不是反复讨论。', 'D'),

    Q('我擅长把想法讲得让别人感兴趣。', 'I'),
    Q('我喜欢和人打交道，认识新朋友让我兴奋。', 'I'),
    Q('我常常是带动气氛的那个人。', 'I'),
    Q('我容易被新鲜事物吸引，愿意尝试。', 'I'),
    Q('我表达情绪比较外放，别人容易看出我的状态。', 'I'),
    Q('我倾向于用热情和故事去说服别人。', 'I'),

    Q('我做事节奏平稳，不喜欢突然的变化。', 'S'),
    Q('我愿意配合团队，维护关系的和谐。', 'S'),
    Q('别人向我倾诉时，我通常会耐心听完。', 'S'),
    Q('我更喜欢在熟悉的环境里工作。', 'S'),
    Q('我做决定前会考虑对身边人的影响。', 'S'),
    Q('我倾向于把承诺看得比速度重要。', 'S'),

    Q('我做事前会先把标准和细节想清楚。', 'C'),
    Q('我对数据和事实比较敏感，不喜欢含糊。', 'C'),
    Q('我交付之前会再检查一遍。', 'C'),
    Q('我倾向于按流程办事，减少出错。', 'C'),
    Q('我更喜欢有明确规则和标准的环境。', 'C'),
    Q('别人说我考虑问题比较谨慎。', 'C')
  ];

  const DIMS = {
    D: {
      label: 'D 支配型', name: '支配型', en: 'Dominance', color: '#F2748C',
      desc: '目标、结果与掌控',
      high: '你目标导向、果断直接，习惯把问题变成决定并推动落地。在需要拍板和突破的场合，你是那个让事情往前走的人。',
      mid: '你有推进力，但不会一味强推，能根据场合调整节奏。',
      low: '你不急于掌控局面，更愿意在必要时才站出来。这让你显得好合作，但在需要果断拍板的场合，可以试着更主动一些。',
      talk: '和 D 型沟通：先说结论，再讲理由；别绕圈子，也别用太多铺垫。'
    },
    I: {
      label: 'I 影响型', name: '影响型', en: 'Influence', color: '#F5B96A',
      desc: '表达、感染与连接',
      high: '你善于表达、富有感染力，能迅速拉近距离并带动气氛。人们愿意听你讲，也容易被你的热情推动。',
      mid: '你能表达也能倾听，在人群里自在，但不依赖成为焦点。',
      low: '你相对内敛，不靠情绪和故事去打动人，更愿意让内容本身说话。这会让人觉得你稳，但适当地表达热情会让你的想法更容易被接受。',
      talk: '和 I 型沟通：先回应情绪和认可，再谈事情；给足互动和反馈。'
    },
    S: {
      label: 'S 稳健型', name: '稳健型', en: 'Steadiness', color: '#4ED8A6',
      desc: '耐心、支持与稳定',
      high: '你耐心、可靠，重视关系与承诺，是团队里让人安心的存在。你愿意听完别人，也愿意在背后把事情托住。',
      mid: '你既能配合，也能在必要时推动改变，节奏比较可控。',
      low: '你节奏更快，对变化和不确定的耐受度更高，不太愿意为了稳定而停在原地。这让你的适应力强，但别人可能需要一点时间跟上。',
      talk: '和 S 型沟通：给时间消化，别催；说明变化的原因和对他的影响。'
    },
    C: {
      label: 'C 严谨型', name: '严谨型', en: 'Conscientiousness', color: '#4FA8F5',
      desc: '标准、数据与准确',
      high: '你注重标准与准确，习惯先想清楚再行动，交付前会自己检查一遍。有你在，细节不太容易出问题。',
      mid: '你重视质量，但不会因为追求完美而卡住进度。',
      low: '你更看重效率和灵活，不愿意被流程和细节拖住。这让你推进得快，但在需要精确的环节，多一道校验会更稳。',
      talk: '和 C 型沟通：给数据、给依据、给时间；别用「差不多」搪塞。'
    }
  };

  const ORDER = ['D', 'I', 'S', 'C'];
  const COMBO = {
    DI: '你主动、敢拍板，也擅长调动气氛，是天然的推动者。注意在推进时留出让人提问的空间，否则容易被感受为强势。',
    DS: '你目标明确又愿意照顾团队节奏，属于「稳准」型推进者。你的挑战往往是把不满说出口，而不是自己消化。',
    DC: '你既追求结果也要求质量，适合需要同时把控方向和细节的角色。要小心对别人标准的期待过高。',
    IS: '你善于连接人，也愿意托住关系，是团队氛围的维护者。在需要做不受欢迎的决定时，可以更果断一点。',
    IC: '你表达有感染力，同时在意准确性，适合需要说服又要有依据的场合。别让对完美的追求压住你的表达欲。',
    SC: '你稳定、细致，是让人放心的执行者。面对突然的变化，允许自己先表达顾虑，再一起找方案。'
  };

  function lv(pct) { return pct >= 60 ? 'high' : pct <= 40 ? 'low' : 'mid'; }
  function lvText(pct) { return pct >= 60 ? '偏高' : pct <= 40 ? '偏低' : '中等'; }

  (window.__TESTS = window.__TESTS || []).push({
    id: 'disc',
    name: 'DISC 行为风格',
    en: 'DISC Behavioral Style',
    short: 'DISC',
    tag: '行为 · 职场',
    color: '#F5B96A',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.4 6.4"/></svg>',
    desc: '看你在工作与协作中的行为倾向：是推动、表达、支持还是分析。24 题，适合了解沟通风格与团队角色。',
    allowUnsure: false,
    variants: [{ id: 'std', label: '标准版 24 题', minutes: '2–3 分钟', qs: QS }],
    dims: ORDER.map(k => ({ key: k, label: DIMS[k].label, desc: DIMS[k].desc })),
    disclaimer: 'DISC 描述的是行为风格倾向，不是能力高低，也不代表固定的人格。人在不同情境下会调整风格，结果仅供沟通与协作参考。',
    compute(answers, qs) {
      const sum = {}, cnt = {};
      qs.forEach((q, i) => {
        const v = Number(answers[i]);
        if (!v) return;
        sum[q.key] = (sum[q.key] || 0) + v;
        cnt[q.key] = (cnt[q.key] || 0) + 1;
      });
      const dims = ORDER.map(k => {
        const s = sum[k] || 0, n = cnt[k] || 1;
        const pct = Math.round((s - n) / (n * 4) * 100);
        return { label: DIMS[k].label, pct, level: lvText(pct), low: DIMS[k].desc, raw: s + ' / ' + (n * 5), key: k, lv: lv(pct) };
      });
      const sorted = dims.slice().sort((a, b) => b.pct - a.pct);
      const primary = sorted[0], second = sorted[1];
      const balanced = primary.pct - sorted[3].pct < 12;
      const badge = balanced ? '均衡' : (primary.key + second.key);
      const title = balanced ? '风格均衡型' : (DIMS[primary.key].name + ' · ' + DIMS[second.key].name);
      const comboKey = [primary.key, second.key].sort().join('');
      const comboText = COMBO[comboKey] || '你的风格比较均衡，能根据场合在推动、表达、支持与分析之间切换。';

      return {
        badge,
        title,
        subtitle: balanced ? 'Balanced' : (primary.key + ' + ' + second.key),
        summary: balanced
          ? '你的四个维度得分比较接近，没有明显的主导风格。这通常意味着适应力强，能根据场合切换角色——也可能意味着在需要鲜明立场时，你会稍微犹豫。'
          : '你以 <strong>' + DIMS[primary.key].label + '</strong> 为主导（' + primary.pct + '%），<strong>' + DIMS[second.key].label + '</strong> 次之（' + second.pct + '%）。这个组合决定了你在团队里最自然的行为方式。',
        radar: { max: 100, axes: dims.map(d => ({ label: d.label.slice(0, 1), value: d.pct })) },
        dims,
        chips: sorted.map(d => DIMS[d.key].name + ' ' + d.pct + '%'),
        sections: balanced
          ? [
            { h: '四个风格都在可用区间', p: '你的 D、I、S、C 四个维度得分接近，说明你在不同场合能调动不同的行为方式。需要拍板时你能推，需要共情时你能听，需要数据时你也不排斥细节——这是很多人要刻意练习才有的弹性。' },
            { h: '代价是「默认状态不明显」', p: '压力大或时间紧的时候，风格均衡的人反而更容易犹豫：你会想先确认所有人的感受再决定，或者在不同做法之间反复权衡。给自己一条简单的优先级规则（比如「这次先要结果」），通常比继续权衡有效。' },
            { h: '怎么和别人配合', p: '你天然适合做协调者与翻译：把 D 的结论、I 的气氛、S 的顾虑、C 的细节串成一段别人听得懂的话。这也是团队里稀缺的位置。' }
          ]
          : [
            { h: '主导风格：' + DIMS[primary.key].label, p: DIMS[primary.key][primary.lv] },
            { h: '次要风格：' + DIMS[second.key].label, p: DIMS[second.key][second.lv] },
            { h: '组合起来看', p: comboText },
            { h: '怎么和别人配合', p: DIMS[primary.key].talk + ' 同时，如果你是对方，也可以主动说明自己偏好的沟通方式——大多数摩擦来自节奏差异，而不是立场对立。' }
          ],
        tips: [
          { type: 'ok', title: '沟通建议', text: '把这四个维度当作「对方的默认节奏」来理解：有人要先有结论，有人要先有安全感，有人要先有数据。调整你的开场方式，比调整你的观点更有效。' },
          { type: 'info', title: '注意', text: 'DISC 不是把同事分成四类贴标签。同一个人在开会、面对客户、处理危机时，可能呈现完全不同的风格。' }
        ],
        verdict: balanced ? '四个维度接近，你的优势是适应力。' : '你是 ' + DIMS[primary.key].name + ' 主导，' + DIMS[second.key].name + ' 次之。'
      };
    }
  });
})();
