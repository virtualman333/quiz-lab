/* 心理状态自评 · PHQ-9（抑郁筛查）+ GAD-7（焦虑筛查）+ PSS-10（压力知觉），共 26 题 */
(function () {
  const q4 = (text, key, note) => ({ t: '4', text, key, rev: false, dimLabel: null, note });
  const q5 = (text, rev, note) => ({ t: '5', text, key: 'PSS', rev: !!rev, dimLabel: null, note });

  const QS = [
    // PHQ-9
    q4('做事时提不起劲或没有兴趣', 'PHQ', '最近两周'),
    q4('感到心情低落、沮丧或绝望', 'PHQ', '最近两周'),
    q4('入睡困难、睡不安稳，或睡得太多', 'PHQ', '最近两周'),
    q4('感觉疲倦或没有活力', 'PHQ', '最近两周'),
    q4('食欲不振，或吃得过多', 'PHQ', '最近两周'),
    q4('觉得自己很糟，或觉得自己很失败，或让自己、家人失望', 'PHQ', '最近两周'),
    q4('注意力难以集中，比如看书或看电视时', 'PHQ', '最近两周'),
    q4('动作或说话变慢到别人已经察觉；或相反，烦躁、坐立不安、动来动去比平时更多', 'PHQ', '最近两周'),
    q4('有不如死掉，或用某种方式伤害自己的念头', 'PHQ', '最近两周'),
    // GAD-7
    q4('感到紧张、焦虑或急切', 'GAD', '最近两周'),
    q4('无法停止或控制自己的担忧', 'GAD', '最近两周'),
    q4('对各种各样的事情担忧过多', 'GAD', '最近两周'),
    q4('很难放松下来', 'GAD', '最近两周'),
    q4('因为不安而无法静坐', 'GAD', '最近两周'),
    q4('变得容易烦躁或易怒', 'GAD', '最近两周'),
    q4('感到害怕，好像会有可怕的事情发生', 'GAD', '最近两周'),
    // PSS-10
    q5('因为一些意外的事情发生，而感到心烦意乱', 0, '最近一个月'),
    q5('感觉无法控制自己生活中重要的事情', 0, '最近一个月'),
    q5('感到紧张不安和有压力', 0, '最近一个月'),
    q5('对自己处理个人问题的能力感到有信心', 1, '最近一个月'),
    q5('感到事情顺心如意', 1, '最近一个月'),
    q5('发现自己无法应付所有必须做的事情', 0, '最近一个月'),
    q5('能够控制生活中恼人的事情', 1, '最近一个月'),
    q5('觉得自己掌控着事情', 1, '最近一个月'),
    q5('因为一些无法控制的事情而生气', 0, '最近一个月'),
    q5('感到困难堆积得太多，无法克服', 0, '最近一个月')
  ];

  const PHQ_BANDS = [
    { from: 0, to: 4, label: '无或极轻', color: '#4ED8A6' },
    { from: 5, to: 9, label: '轻度', color: '#B7D96B' },
    { from: 10, to: 14, label: '中度', color: '#F5B96A' },
    { from: 15, to: 19, label: '中重度', color: '#F09A6A' },
    { from: 20, to: 27, label: '重度', color: '#F2748C' }
  ];
  const GAD_BANDS = [
    { from: 0, to: 4, label: '无或极轻', color: '#4ED8A6' },
    { from: 5, to: 9, label: '轻度', color: '#B7D96B' },
    { from: 10, to: 14, label: '中度', color: '#F5B96A' },
    { from: 15, to: 21, label: '重度', color: '#F2748C' }
  ];
  const PSS_BANDS = [
    { from: 0, to: 13, label: '较低', color: '#4ED8A6' },
    { from: 14, to: 26, label: '中等', color: '#F5B96A' },
    { from: 27, to: 40, label: '较高', color: '#F2748C' }
  ];

  const band = (bands, v) => bands.find(b => v >= b.from && v <= b.to) || bands[bands.length - 1];

  const ADVICE = {
    phq: {
      '无或极轻': '近两周的情绪状态整体平稳。保持规律作息、适度运动和稳定的人际联系，是对情绪最有效的日常保护。',
      '轻度': '有一些轻度的抑郁相关症状。可以先从睡眠、运动、晒太阳和与信任的人聊聊开始；如果两周后没有改善，建议做一次专业评估。',
      '中度': '症状达到中度水平，可能已经在影响日常功能。建议尽快咨询精神科医生或心理咨询师，专业评估比自我调节更可靠。',
      '中重度': '症状较重，建议尽快寻求专业帮助。这不代表你「脆弱」，而是说明现在需要更专业的支持，越早介入通常越容易恢复。',
      '重度': '症状严重，已明显影响生活。请尽快就医（精神科或综合医院心理科），让专业人员做评估并给出方案。'
    },
    gad: {
      '无或极轻': '近两周的焦虑水平较低。保持规律运动与充足睡眠，能帮助你在压力来临时更稳。',
      '轻度': '有轻度焦虑表现。可以试试把担忧写下来、区分「能控制的」和「不能控制的」，并把注意力放回当下能做的事。',
      '中度': '焦虑达到中度水平，可能已经开始影响睡眠或专注。建议寻求专业评估，认知行为疗法对焦虑有较好的证据支持。',
      '重度': '焦虑较重，建议尽快寻求专业帮助。避免用酒精或熬夜来缓解，这些方式通常会让焦虑加重。'
    },
    pss: {
      '较低': '你近一个月感受到的压力较低，对生活的掌控感较好。可以留意自己的恢复方式，把它们变成习惯。',
      '中等': '压力处于中等水平，尚在可承受范围，但需要主动管理。找出最主要的压力源，先处理一件，而不是同时扛所有。',
      '较高': '压力水平较高，长期如此会消耗身心。建议优先保证睡眠和运动，同时减少非必要的承担，必要时寻求支持或专业帮助。'
    }
  };

  (window.__TESTS = window.__TESTS || []).push({
    id: 'wellbeing',
    name: '心理状态自评',
    en: 'PHQ-9 · GAD-7 · PSS-10',
    short: 'PHQ·GAD',
    tag: '情绪 · 筛查',
    color: '#F2748C',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 22l8.8-8.3a5 5 0 0 0 0-7.1Z"/></svg>',
    desc: '用三个国际通用的筛查量表，了解近两周的情绪状态与近一个月的压力水平。26 题，约 3 分钟。',
    allowUnsure: false,
    variants: [{
      id: 'std', label: '标准版 26 题', minutes: '3–4 分钟', qs: QS,
      scale: { '4': ['完全没有', '有几天', '一半以上天数', '几乎每天'], '5': ['从不', '偶尔', '有时', '经常', '总是'] }
    }],
    dims: [],
    disclaimer: '本测评使用 PHQ-9、GAD-7、PSS-10 三个筛查量表，用于了解近期情绪与压力水平，不能用于诊断抑郁症、焦虑症或任何精神障碍。结果不构成医疗建议。如果你持续感到困扰，或出现伤害自己的念头，请立即寻求精神科、心理科或急诊的专业帮助。',
    compute(answers) {
      let phq = 0, gad = 0, pss = 0;
      for (let i = 0; i < 9; i++) phq += Number(answers[i]) || 0;
      for (let i = 9; i < 16; i++) gad += Number(answers[i]) || 0;
      for (let i = 16; i < 26; i++) {
        const raw = (Number(answers[i]) || 1) - 1;
        const rev = QS[i].rev;
        pss += rev ? (4 - raw) : raw;
      }

      const pb = band(PHQ_BANDS, phq), gb = band(GAD_BANDS, gad), sb = band(PSS_BANDS, pss);
      const scales = [
        {
          label: 'PHQ-9 抑郁相关症状', value: phq, max: 27, band: pb.label, bands: PHQ_BANDS,
          note: '近两周内，9 项症状的出现频率。0–4 无或极轻，5–9 轻度，10–14 中度，15–19 中重度，20–27 重度。',
          advice: ADVICE.phq[pb.label]
        },
        {
          label: 'GAD-7 焦虑相关症状', value: gad, max: 21, band: gb.label, bands: GAD_BANDS,
          note: '近两周内，7 项焦虑症状的出现频率。0–4 无或极轻，5–9 轻度，10–14 中度，15–21 重度。',
          advice: ADVICE.gad[gb.label]
        },
        {
          label: 'PSS-10 压力知觉', value: pss, max: 40, band: sb.label, bands: PSS_BANDS,
          note: '近一个月内，你对生活压力的主观感受与掌控感。0–13 较低，14–26 中等，27–40 较高。',
          advice: ADVICE.pss[sb.label]
        }
      ];

      const selfHarm = Number(answers[8]) || 0;
      const tips = [];
      if (selfHarm > 0) {
        tips.push({
          type: 'danger', title: '请优先照顾自己',
          text: '你在「有不如死掉或伤害自己的念头」这题上选择了非「完全没有」。如果你此刻正被这样的想法困扰，请尽快联系一位你信任的人陪着你，或前往当地精神卫生中心、医院心理科/急诊寻求帮助；如果存在紧迫危险，请立即拨打 120。你不需要一个人扛。'
        });
      }
      const worst = Math.max(phq / 27, gad / 21, pss / 40);
      if (worst >= 0.5) {
        tips.push({ type: 'warn', title: '建议寻求专业评估', text: '至少有一个量表的得分进入了中重度区间。筛查量表只能提示「值得关注」，具体判断需要专业人员面对面评估。预约一次精神科门诊或心理咨询，会比继续自我调整更有效。' });
      } else if (worst >= 0.28) {
        tips.push({ type: 'info', title: '可以做的几件小事', text: '把睡眠时间固定下来、每天有 20 分钟让心率上去的活动、把担心的事写下来分类「能处理 / 暂时不能」、和一个人说说近况。两周后再测一次，看看变化。' });
      } else {
        tips.push({ type: 'ok', title: '状态不错', text: '三个量表的得分都在较低区间。保持现在的生活方式，同时留意压力累积的信号——定期自评是个好习惯。' });
      }
      tips.push({ type: 'info', title: '关于这些量表', text: 'PHQ-9、GAD-7、PSS-10 都是国际通用的筛查工具，优点是简短、可重复施测。它们的作用是帮你把「感觉不太好」量化出来，而不是给你一个诊断标签。' });

      return {
        badge: '',
        title: '你的心理状态概览',
        subtitle: '近两周 / 近一个月',
        summary: '近两周的抑郁相关症状处于 <strong>' + pb.label + '</strong>（' + phq + '/27），焦虑相关症状处于 <strong>' + gb.label + '</strong>（' + gad + '/21）；近一个月的压力知觉为 <strong>' + sb.label + '</strong>（' + pss + '/40）。三个量表从不同角度描述你最近的状态，请结合下面的建议一起看。',
        scales,
        sections: [
          { h: '怎么读这三个分数', p: 'PHQ-9 和 GAD-7 问的是最近两周的<strong>症状频率</strong>，PSS-10 问的是最近一个月你对压力的<strong>主观感受与掌控感</strong>。三者不叠加、不换算，各自独立解读。分数偏高只说明「值得关注」，不等于「确诊」。' },
          { h: '筛查不是诊断', p: '这些量表的灵敏度较高，意味着它容易把「有一些相关症状」的人筛出来，但也会把状态波动误判为问题。真正的诊断需要专业人员结合持续时间、功能影响和其他情况综合判断。' },
          { h: '什么时候该去看医生', p: '如果这些症状持续两周以上、明显影响工作或人际、或者你身边的人开始担心你——这三个信号出现任何一个，都值得预约一次专业评估。越早介入，通常越容易恢复。' }
        ],
        tips,
        verdict: '抑郁 ' + phq + '/27（' + pb.label + '）、焦虑 ' + gad + '/21（' + gb.label + '）、压力 ' + pss + '/40（' + sb.label + '）。'
      };
    }
  });
})();
