/* 大五人格 OCEAN · 50 题（IPIP 五因素框架，每维 10 题、正反各半） */
(function () {
  const Q = (text, key, rev) => ({ t: '5', text, key, rev: !!rev, dimLabel: null });

  const QS = [
    // 外向性 E
    Q('在聚会上，我常常是主动开口的那个人。', 'E'),
    Q('和陌生人相处时，我通常很快就放松下来。', 'E'),
    Q('我喜欢成为大家注意的焦点。', 'E'),
    Q('我很容易和刚认识的人聊起来。', 'E'),
    Q('人多热闹的场合会让我更有精神。', 'E'),
    Q('我常常不知道该说什么，宁可听别人讲。', 'E', 1),
    Q('我更喜欢待在角落，而不是站在人群中央。', 'E', 1),
    Q('认识新朋友对我来说是件有压力的事。', 'E', 1),
    Q('我需要大量独处时间来恢复精力。', 'E', 1),
    Q('我很少主动发起话题。', 'E', 1),
    // 宜人性 A
    Q('我会主动关心别人最近过得怎么样。', 'A'),
    Q('别人难过时，我能感受到他们的情绪。', 'A'),
    Q('我愿意花时间帮别人解决麻烦。', 'A'),
    Q('我说话时会注意不让人难堪。', 'A'),
    Q('我倾向于相信大多数人是善意的。', 'A'),
    Q('我经常觉得别人的问题与我无关。', 'A', 1),
    Q('我说话比较直接，不太在意对方的感受。', 'A', 1),
    Q('我容易对别人挑毛病。', 'A', 1),
    Q('我不太在意团队里的气氛。', 'A', 1),
    Q('争论时我更在意赢，而不是关系。', 'A', 1),
    // 尽责性 C
    Q('我做事之前通常会先列好计划。', 'C'),
    Q('我答应过的事一定会做到。', 'C'),
    Q('我的东西通常摆放得很有秩序。', 'C'),
    Q('我会提前完成任务，而不是拖到最后。', 'C'),
    Q('我注重细节，容易发现小错误。', 'C'),
    Q('我经常临时抱佛脚。', 'C', 1),
    Q('我的桌面和房间常常是乱的。', 'C', 1),
    Q('我常常开了头却很难收尾。', 'C', 1),
    Q('我容易被别的事情分心，偏离原计划。', 'C', 1),
    Q('我很少回头检查自己做过的活。', 'C', 1),
    // 情绪敏感性 N
    Q('我容易因为小事感到焦虑。', 'N'),
    Q('遇到压力时，我的情绪波动比较明显。', 'N'),
    Q('我常常担心还没发生的事。', 'N'),
    Q('被批评时，我会难受很久。', 'N'),
    Q('我的心情变化比较快。', 'N'),
    Q('大多数时候我是放松的。', 'N', 1),
    Q('我很少觉得低落。', 'N', 1),
    Q('面对突发状况，我通常能保持镇定。', 'N', 1),
    Q('我不太会被情绪左右判断。', 'N', 1),
    Q('我很少为过去的事反复纠结。', 'N', 1),
    // 开放性 O
    Q('我对新想法、新领域有强烈的好奇。', 'O'),
    Q('我喜欢讨论抽象的概念和可能性。', 'O'),
    Q('我常常冒出一些别人想不到的点子。', 'O'),
    Q('我享受艺术、音乐或文学带来的感受。', 'O'),
    Q('我愿意尝试与以往不同的做法。', 'O'),
    Q('我更喜欢熟悉的做法，不太想尝试新的。', 'O', 1),
    Q('我对理论性的讨论提不起兴趣。', 'O', 1),
    Q('我很少去想「如果……会怎样」这类问题。', 'O', 1),
    Q('我倾向于按常规办事，不爱折腾。', 'O', 1),
    Q('我很难理解那些抽象的、绕来绕去的说法。', 'O', 1)
  ];

  const DIMS = [
    {
      key: 'O', label: '开放性', en: 'Openness',
      desc: '对新经验、想象与抽象思考的接受程度',
      high: '你对新想法和新体验保持开放，喜欢探索可能性，容易接受与常规不同的做法。这让你在学习新领域、做创意工作时比较有优势。',
      mid: '你在熟悉与新鲜之间保持着平衡：愿意尝试新东西，但也需要一定的确定性才安心。',
      low: '你更信任已经被验证过的经验，偏好具体、明确、可操作的东西。这让你做事踏实，不容易被花哨的概念带偏。'
    },
    {
      key: 'C', label: '尽责性', en: 'Conscientiousness',
      desc: '计划性、自律与对承诺的重视程度',
      high: '你有较强的自律和计划性，重视承诺、注重细节，倾向于把事情做完做好。别人通常觉得你可靠，把事交给你放心。',
      mid: '你该认真的时候能认真，也能接受偶尔的随性。计划性和灵活性在你身上大致平衡。',
      low: '你更随性，不喜欢被计划绑住，做事看当下的状态。这让你灵活、不易僵化，但在需要长期坚持的事情上可能要多借助外部约束。'
    },
    {
      key: 'E', label: '外向性', en: 'Extraversion',
      desc: '社交中获得能量的程度与主动程度',
      high: '你从人际互动中获得能量，喜欢热闹、善于表达，在群体中比较自在。社交场合对你来说往往是加分项，而不是消耗。',
      mid: '你在社交与独处之间都能适应，既不会因为人多而疲惫，也不排斥独处的时光。',
      low: '你更习惯安静和小范围的深谈，人多时容易消耗。独处对你来说是恢复能量的必要方式，而不是孤单。'
    },
    {
      key: 'A', label: '宜人性', en: 'Agreeableness',
      desc: '对他人的体谅、信任与合作倾向',
      high: '你体贴、愿意合作，习惯站在对方角度考虑问题，也更容易信任别人。这让你成为团队里的润滑剂，但要注意别过度委屈自己。',
      mid: '你既愿意配合别人，也会坚持自己的立场。在合作与自我之间，你通常能找到平衡。',
      low: '你更直接、更看重事实和对错，不太会为了照顾气氛而让步。这让你的判断更独立，但表达方式上多留一点余地会更顺畅。'
    },
    {
      key: 'N', label: '情绪敏感性', en: 'Neuroticism',
      desc: '情绪起伏与对压力的敏感程度',
      high: '你对情绪和压力比较敏感，容易焦虑、反复思虑。这让你更早察觉风险、更细腻，但也更容易被消耗。规律作息、运动与倾诉会帮到你。',
      mid: '你的情绪大致稳定，遇到压力会有波动，但通常能自己恢复。',
      low: '你情绪稳定，面对压力时比较镇定，不容易被负面情绪长时间困住。这是很宝贵的资源，也记得给身边敏感的人多一点理解。'
    }
  ];

  function level(pct) { return pct >= 65 ? 'high' : pct <= 35 ? 'low' : 'mid'; }
  function levelText(pct) { return pct >= 65 ? '偏高' : pct <= 35 ? '偏低' : '中等'; }

  (window.__TESTS = window.__TESTS || []).push({
    id: 'bigfive',
    name: '大五人格 OCEAN',
    en: 'Big Five Personality',
    short: 'OCEAN',
    tag: '性格 · 学术',
    color: '#4FA8F5',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3 21 8v8l-9 5-9-5V8z"/><path d="M12 3v18M3 8l9 5 9-5"/></svg>',
    desc: '心理学界最主流的性格框架，用五个连续维度描述你，而不是把你塞进一个类型。50 题，含反向题校验。',
    allowUnsure: false,
    variants: [{ id: 'std', label: '标准版 50 题', minutes: '4–6 分钟', qs: QS }],
    dims: DIMS.map(d => ({ key: d.key, label: d.label, desc: d.desc })),
    disclaimer: '大五人格是学术界广泛使用的人格描述框架。结果反映你作答当时的自我认知，会随阶段变化，不构成心理诊断。',
    compute(answers, qs) {
      const sum = {}, cnt = {};
      qs.forEach((q, i) => {
        let v = answers[i];
        if (v === 'u' || v == null) return;
        v = Number(v);
        if (q.rev) v = 6 - v;
        sum[q.key] = (sum[q.key] || 0) + v;
        cnt[q.key] = (cnt[q.key] || 0) + 1;
      });
      const dims = DIMS.map(d => {
        const s = sum[d.key] || 0, n = cnt[d.key] || 1;
        const max = n * 5, min = n;
        const pct = Math.round((s - min) / (max - min) * 100);
        return {
          label: d.label, pct, level: levelText(pct), low: d.desc,
          raw: s + ' / ' + max, key: d.key, lv: level(pct)
        };
      });
      const sorted = dims.slice().sort((a, b) => b.pct - a.pct);
      const top = sorted[0], bottom = sorted[sorted.length - 1];
      const get = k => dims.find(d => d.key === k);
      const O = get('O'), C = get('C'), E = get('E'), A = get('A'), N = get('N');

      const combos = [];
      if (E.pct >= 60 && A.pct >= 60) combos.push('你外向又友善，通常是群体里的连接者：既能主动开口，也让人感到舒服。');
      else if (E.pct >= 60 && A.pct < 40) combos.push('你外向直接，不怕表达立场，适合需要推动和谈判的场合；注意在反馈时留一点缓冲。');
      else if (E.pct < 40 && A.pct >= 60) combos.push('你安静但体贴，是那种让人愿意深交的人。你的影响力来自被信任，而不是被注意。');
      else if (E.pct < 40 && A.pct < 40) combos.push('你独立、话不多也不轻易妥协，适合需要独立判断的工作；主动解释思路会让合作更顺。');

      if (C.pct >= 60 && N.pct >= 60) combos.push('你既要求自己做到位，又对失误敏感——这容易带来高质量的产出，也容易带来持续的紧绷。给自己设一个「够好」的标准很重要。');
      else if (C.pct >= 60 && N.pct < 40) combos.push('你有条理且情绪稳定，是压力场景里少数能按部就班推进的人。');
      else if (C.pct < 40 && N.pct >= 60) combos.push('你随性但对结果容易焦虑，常见的困境是「拖着又担心」。把任务拆小、先做五分钟，通常比逼自己更有用。');
      else if (C.pct < 40 && N.pct < 40) combos.push('你松弛、不焦虑，也不太被计划束缚，适应力强；在需要长期积累的事情上，外部节奏会帮你更多。');

      if (O.pct >= 65) combos.push('开放性偏高的人通常喜欢新领域，但也容易开很多头。选一两件真正在意的事做深，会更有成就感。');

      return {
        badge: '',
        title: '你的大五人格画像',
        subtitle: 'OCEAN 五维',
        summary: (top.pct - bottom.pct) < 5
          ? '你的五个维度分数相当接近（' + (top.pct === bottom.pct ? '都在 ' + top.pct + '% 附近' : bottom.pct + '–' + top.pct + '%') + '），说明这些特质在你身上比较均衡，没有特别突出或明显回避的一面。大五人格不用类型划分人，五个维度共同构成你独特的组合。'
          : '你在 <strong>' + top.label + '</strong> 上最突出（' + top.pct + '%），<strong>' + bottom.label + '</strong> 相对最低（' + bottom.pct + '%）。大五人格不用类型划分人，五个维度共同构成你独特的组合。',
        radar: { max: 100, axes: dims.map(d => ({ label: d.label, value: d.pct })) },
        dims,
        chips: sorted.map(d => d.label + ' ' + d.pct + '%'),
        sections: DIMS.map(d => {
          const cur = get(d.key);
          return { h: d.label + ' · ' + cur.level + '（' + cur.pct + '%）', p: d[cur.lv] };
        }).concat([{ h: '维度之间怎么组合', p: combos.join('') || '五个维度之间没有好坏之分，它们的组合方式才是你独特的地方。' }]),
        tips: [
          { type: 'ok', title: '怎么用这份结果', text: '大五人格的优势在于它描述「程度」而不是「类型」。你可以拿它来观察自己在不同阶段的变化——同一份问卷，半年后再测一次，往往能看到有意思的差异。' },
          { type: 'info', title: '关于分数', text: '百分比表示你在该维度上相对于题目范围的位置，不是百分位排名。分数接近中间（35%–65%）是常见的，说明你的表现比较灵活。' }
        ],
        verdict: top.label + '偏高、' + bottom.label + '偏低，这就是你的五个维度组合。'
      };
    }
  });
})();
