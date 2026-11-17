# 测试实验室 · 在线心理测评合集

一个纯前端、零后端的心理与职业测评站点：答题、计分、报告生成全部在浏览器本地完成，不上传任何数据。

线上地址：**https://quiz.virtualman.top/**

## 包含的测评

| 测评 | 题量 | 计分方式 | 输出 |
| --- | --- | --- | --- |
| MBTI 16 型人格 | 93（完整版）/ 24（精简版） | 二分题 + 官方计分表，正反表述交叉 | 4 字母类型、四维倾向强度、成长建议 |
| 大五人格 OCEAN | 50 | 五点李克特，含反向计分题 | 五维雷达图、高/中/低分维解读、维度组合 |
| DISC 行为风格 | 24 | 五点李克特 | 主导 + 次要风格（或「均衡」）、沟通建议 |
| 霍兰德职业兴趣 RIASEC | 60 | 五点李克特 | 三字母兴趣代码、职业方向参考 |
| 心理状态自评 | 26 | PHQ-9 (0–27) / GAD-7 (0–21) / PSS-10 (0–40) | 三个量表的分数区间与分级建议 |

## 特性

- **纯静态**：无后端、无数据库、无第三方统计脚本，`localStorage` 保存记录（上限 100 条）
- **数据驱动**：新增一个测评只需在 `data/` 下加一个文件并注册，框架代码零改动
- **完整报告**：独立报告页 + `@media print` 打印样式，可直接「另存为 PDF」
- **历史记录**：按测评筛选、回看结果、重新生成报告、导出 JSON；旧站 MBTI 记录自动迁移
- **断点续测**：未完成的测评自动保留草稿，回到首页可一键继续
- **移动优先**：320px 起无横向溢出，深/浅色主题，支持键盘作答（A/B/1-5/←/→）
- **SEO**：静态可索引正文 + JSON-LD（WebSite / WebApplication / FAQPage）、Open Graph、sitemap、robots

## 目录结构

```
.
├── index.html            # 单页应用外壳 + 全部样式 + 静态 SEO 内容 + JSON-LD
├── app.js                # 框架：流程、渲染、计分调用、记录、报告、打印、主题、迁移
├── data/
│   ├── mbti.js           # 每个文件向 window.__TESTS 注册一个测评
│   ├── bigfive.js
│   ├── disc.js
│   ├── holland.js
│   └── wellbeing.js
├── assets/
│   ├── og-image.png      # 社交分享封面 1200×630
│   └── qr-card.png       # 扫码分享卡
├── deploy/               # nginx 虚拟主机配置（HTTP 301 + HTTPS）
├── 404.html
├── robots.txt
└── sitemap.xml
```

## 新增一个测评

在 `data/` 下新建 `yourtest.js`：

```js
(function () {
  const QS = [{ t: '5', text: '题目文案', key: 'A' }];
  (window.__TESTS = window.__TESTS || []).push({
    id: 'yourtest',
    name: '测评名称',
    short: 'SHORT',
    en: 'English Name',
    tag: '分类 · 标签',
    desc: '首页卡片描述',
    icon: '<svg .../>',
    allowUnsure: false,
    variants: [{ id: 'std', label: '标准版 N 题', minutes: '3–5 分钟', qs: QS }],
    disclaimer: '免责声明文案',
    compute(answers, qs) {
      return { badge, title, subtitle, summary, dims, chips, sections, tips, verdict };
    }
  });
})();
```

再在 `index.html` 末尾加一行 `<script src="data/yourtest.js"></script>` 即可。

题目类型：`t:'2'` 二选一（可答 `'u'` 表示说不准，不计分）、`t:'5'` 五点量表（1–5，`rev:true` 反向计分）、`t:'4'` 四点频率（0–3）。

## 本地运行

任意静态服务器即可，例如：

```bash
python3 -m http.server 8080
# 打开 http://127.0.0.1:8080/
```

直接双击 `index.html` 也能跑，但 `file://` 下部分浏览器会限制 `localStorage`，建议起本地服务。

## 部署

`deploy/quiz.virtualman.top.ssl.conf` 是一份可参考的 nginx 配置：80 端口保留 `/.well-known/acme-challenge/` 供 Let's Encrypt 续期，其余全部 301 到 HTTPS；静态资源 7 天缓存，HTML 不缓存，开启 gzip。

## 免责声明

所有量表均为自我报告式工具，结果反映作答当时的自我认知，**仅供自我探索参考，不构成心理诊断或医疗建议**。心理状态自评使用 PHQ-9、GAD-7、PSS-10 三个筛查量表，不能用于诊断抑郁症、焦虑症或任何精神障碍。如果持续困扰或出现伤害自己的念头，请及时寻求精神科或心理科的专业帮助。
