# OJ 刷题平台 前端需求文档

> **技术栈**：Vue 3 + Composition API + TypeScript + Naive UI + Pinia + Vue Router  
> **参考风格**：[洛谷](https://www.luogu.com.cn/) — 浅色背景、蓝色主色调、信息聚合型首页、状态标签系统  
> **版本**：v1.0（核心模块阶段）

---

## 一、项目概述

一个面向算法竞赛练习的在线判题（Online Judge）平台前端。现阶段聚焦五大核心模块，支持普通用户和管理员两种角色。

---

## 二、全局设计规范

### 2.1 配色
| 用途 | 色值 |
|------|------|
| 主色调（品牌蓝） | `#3498db` 左右 |
| 成功/通过 | `#52c41a`（绿色） |
| 警告/未开始 | `#faad14`（橙色） |
| 错误/已结束 | `#ff4d4f`（红色） |
| 页面背景 | `#f5f6fa`（浅灰） |
| 卡片背景 | `#ffffff`（白色） |
| 正文文字 | `#2c3e50` |
| 次要文字 | `#7f8c8d` |

### 2.2 布局
- **桌面优先**设计，内容区最大宽度 `1200px` 居中
- 全局 **Header**（导航栏）+ 内容区 + **Footer**
- 卡片式内容承载，圆角 `8px`，轻微阴影

### 2.3 状态标签系统（全局复用）

| 标签 | 使用场景 | 颜色 |
|------|---------|------|
| `Rated` | 记分比赛 | 蓝色 |
| `进行中` | 比赛正在举行 | 绿色 |
| `未开始` | 比赛未开始 | 橙色 |
| `已结束` | 比赛结束 | 灰色/红色 |
| `AC` / `Accepted` | 判题通过 | 绿色 |
| `WA` / `Wrong Answer` | 答案错误 | 红色 |
| `TLE` | 超时 | 橙色 |
| `CE` | 编译错误 | 黄色 |
| `RE` | 运行错误 | 紫色 |
| `通过` / `尝试` | 题目统计数据 | — |

### 2.4 通用组件
- **Markdown 渲染组件**：用于题目描述、题解正文（支持 LaTeX 数学公式）
- **代码高亮组件**：用于代码提交展示、题解中的代码块
- **倒计时组件**：比赛倒计时，格式"X 天 X 时 X 分后"，每秒刷新
- **用户头像组件**：默认头像 + 管理员特殊标识（金色徽章）
- **难度标签组件**：入门 / 普及 / 提高 / 省选 / NOI，不同颜色区分

---

## 三、路由结构

```
/                     →  首页
/problem              →  题库列表
/problem/:id          →  题目详情 + 提交区
/problem/:id/solution →  题目对应题解列表
/solution/:id         →  题解详情
/contest              →  比赛列表
/contest/:id          →  比赛详情（题目、排名、规则）
/user/:id             →  用户主页
/admin                →  管理员面板（仅管理员可见）
```

---

## 四、页面详细规格

### 4.1 首页 `/`

**布局**：单列纵向，各模块从上到下排列

| 顺序 | 模块 | 说明 |
|:-----|------|------|
| 1 | **Banner 轮播** | 全宽轮播图，展示站内公告、近期比赛推广，3~5 张，自动轮播 + 手动切换 |
| 2 | **倒计时栏** | 即将到来的比赛倒计时，醒目数字显示"距 XXX 比赛还有 X 天 X 时 X 分" |
| 3 | **快捷跳题** | 输入框（输入题目编号跳转）+ "随机跳题"按钮（随机跳转一道题） |
| 4 | **公告区** | 站内公告列表（置顶优先），显示标题 + 发布时间，点击展开/跳转详情 |
| 5 | **近期比赛** | 最近 5~8 场比赛卡片列表，每场显示：名称、类型（公开赛/团队赛）、赛制（IOI/ICPC）、开始时间、状态标签 |
| 6 | **最新题解** | 最新发布的 5~10 条题解摘要：标题、作者、所属题目、发布时间、点赞数 |

**数据接口**（Mock）：
- `GET /api/home/banners`
- `GET /api/home/contests?limit=8`
- `GET /api/home/announcements`
- `GET /api/home/latest-solutions?limit=10`

---

### 4.2 题库 `/problem`

**布局**：左侧筛选栏（可选收起）+ 右侧题目表格

#### 筛选条件
- 题目编号（输入框）
- 题目标题（模糊搜索）
- 难度范围（多选：入门 / 普及- / 普及 / 提高- / 提高 / 省选 / NOI）
- 算法标签（Tag 多选，如：动态规划、贪心、搜索、图论、数据结构…）
- 题目来源（下拉：全部 / 洛谷 / Codeforces / AtCoder / 原创）

#### 题目列表（表格列）
| 列 | 说明 |
|----|------|
| 状态 | 已通过（绿色勾）、尝试过（橙色横杠）、未做过（灰色） |
| 编号 | 题目 ID，如 P1001 |
| 标题 | 题目名称，可点击跳转详情 |
| 难度 | 难度标签（彩色） |
| 通过率 | "通过 / 提交" 或百分比 |
| 算法标签 | 最多展示 3 个 Tag，超出显示 "+N" |

#### 交互
- 点击行跳转题目详情
- 分页（每页 20/50 条可选）
- 表头排序（按编号、难度、通过率）

**数据接口**（Mock）：
- `GET /api/problems?page=&size=&keyword=&difficulty=&tags=&source=`

---

### 4.3 题目详情 `/problem/:id`

**布局**：左右两栏 — 左侧题目内容（70%），右侧提交区（30%）

#### 左侧 — 题目内容

| 区块 | 说明 |
|------|------|
| **题目头部** | 题目编号 + 标题 + 难度标签 + 时间/空间限制 + 来源 |
| **题目描述** | Markdown 渲染，支持 LaTeX 公式 (\(...\) 行内、$$...$$ 块级) |
| **输入格式** | Markdown 渲染 |
| **输出格式** | Markdown 渲染 |
| **样例** | 多个输入/输出对，带复制按钮 |
| **提示/说明** | Markdown 渲染 |
| **标签区** | 算法标签 Tag 列表，点击可跳转题库筛选 |

#### 右侧 — 提交区

| 区块 | 说明 |
|------|------|
| **语言选择** | 下拉框：C / C++ / C++17 / C++20 / Python3 / Java / Go 等 |
| **代码编辑器** | 使用代码编辑组件（暂用 Naive UI Input + monospace 字体，后续可换 Monaco Editor），支持语法高亮、行号、Tab 缩进 |
| **提交按钮** | 醒目按钮，未登录时置灰 + tooltip 提示 |
| **提交结果** | 提交后显示判题状态卡片：Pending → Running → AC/WA/TLE/…，实时轮询更新 |

#### 底部 Tab 区
- **题解** Tab：链到 `/problem/:id/solution`
- **提交记录** Tab：该用户对该题的历史提交记录（可选折叠在下方）

**数据接口**（Mock）：
- `GET /api/problem/:id` — 题目详情
- `POST /api/submit` — 提交代码
- `GET /api/submission/:submissionId/status` — 判题状态轮询

---

### 4.4 比赛 `/contest`

#### 比赛列表
**布局**：Tab 切换 — 全部 / 进行中 / 即将开始 / 已结束

**比赛卡片**（grid 2~3 列排列，每个卡片包含）：

| 信息 | 说明 |
|------|------|
| 比赛名称 | 可点击进入详情 |
| 类型标签 | 官方比赛 / 公开赛 / 团队赛 |
| 赛制标签 | IOI / ICPC / OI |
| Rated 标识 | 是否计入 Rating |
| 状态标签 | 进行中 / 未开始 / 已结束 |
| 时间 | 开始时间 + 结束时间；未开始时显示倒计时 |
| 主办方 | 主办团队名 / 管理员名 |

#### 比赛详情 `/contest/:id`

**布局**：比赛信息头部 + Tab 切换

| Tab | 说明 |
|-----|------|
| **题目列表** | 比赛题目表格（和题库类似，但在比赛结束前可能隐藏他人通过率） |
| **排名** | 实时/最终排名表：名次、用户名、每题得分/状态、总分、罚时 |
| **规则** | 比赛规则说明 Markdown |
| **我的提交** | 当前用户在本场比赛的所有提交记录 |

**比赛倒计时**：详情页顶部醒目位置显示距开始/结束的倒计时

**数据接口**（Mock）：
- `GET /api/contests?status=&page=&size=`
- `GET /api/contest/:id`
- `GET /api/contest/:id/problems`
- `GET /api/contest/:id/ranking`
- `GET /api/contest/:id/submissions`

---

### 4.5 题解 `/problem/:id/solution` & `/solution/:id`

#### 题解列表页（关联某个题目）
- 按赞数 / 时间排序
- 每条题解卡片：标题、作者（头像+昵称）、发布时间、点赞数、摘要（前 150 字）
- 发布题解按钮（需登录）

#### 题解详情 `/solution/:id`

| 区块 | 说明 |
|------|------|
| **题解头部** | 标题、作者信息、关联题目链接、发布时间 |
| **题解正文** | Markdown 渲染，支持代码块高亮、LaTeX |
| **互动区** | 点赞 / 点踩 按钮，收藏按钮 |
| **评论区** | 评论列表 + 发表评论（需登录），支持回复（二层嵌套） |

**数据接口**（Mock）：
- `GET /api/problem/:id/solutions?sort=&page=&size=`
- `GET /api/solution/:id`
- `POST /api/solution/:id/vote` — 点赞/点踩
- `POST /api/solution/:id/comment` — 评论

---

### 4.6 用户主页 `/user/:id`

**布局**：左侧信息卡片 + 右侧内容区

#### 左侧 — 用户信息卡片
| 信息 | 说明 |
|------|------|
| 头像 | 大尺寸头像，管理员带金色徽章 |
| 用户名 | 加粗显示，管理员显示"管理员"标签 |
| 签名 | 个人简介/一句话签名 |
| 注册时间 | 格式 YYYY-MM-DD |
| 统计数据 | 通过题数 / 提交总数 / 通过率 |
| Rating | 竞赛 Rating 分（如有） |

#### 右侧 — Tab 内容区
| Tab | 说明 |
|-----|------|
| **最近通过** | 最近 AC 的题目列表（题目编号 + 标题 + 通过时间） |
| **题解** | 该用户发布的题解列表 |
| **比赛记录** | 参加过的比赛列表 + 排名/Rating 变化 |

**数据接口**（Mock）：
- `GET /api/user/:id/profile`
- `GET /api/user/:id/recent-ac`
- `GET /api/user/:id/solutions`
- `GET /api/user/:id/contest-history`

---

## 五、管理员功能

管理员在全局 Header 中可进入 **管理面板** `/admin`。

### 5.1 管理面板首页
- 功能入口卡片：题目管理 / 比赛管理 / 公告管理 / 用户管理

### 5.2 题目管理
- 新建题目（富文本 / Markdown 编辑器填写题目信息）
- 编辑已有题目
- 管理测试数据

### 5.3 比赛管理
- 创建/编辑比赛：名称、时间、赛制、题目列表、Rated 开关
- 管理参赛人员

### 5.4 公告管理
- 发布/编辑/删除公告
- 置顶管理

### 5.5 用户管理（简化）
- 查看用户列表
- 封禁/解封用户

**数据接口**（Mock）：
- `GET/POST/PUT/DELETE /api/admin/problems`
- `GET/POST/PUT/DELETE /api/admin/contests`
- `GET/POST/PUT/DELETE /api/admin/announcements`
- `GET/PUT /api/admin/users`

---

## 六、全局组件清单

| 组件名 | 说明 |
|--------|------|
| `GlobalHeader` | 顶部导航栏：Logo + 导航链接（首页/题库/比赛/题解）+ 右侧用户区（消息通知 + 头像下拉菜单：个人主页/管理后台/退出） |
| `GlobalFooter` | 页脚：版权、备案号、友链 |
| `CountdownTimer` | 倒计时组件，props：目标时间，emit：结束回调 |
| `StatusTag` | 通用状态标签，props：类型 × 状态，自动映射颜色 |
| `DifficultyTag` | 难度标签，props：难度等级（入门~NOI），映射颜色 |
| `MdRenderer` | Markdown 渲染器，支持 LaTeX + 代码高亮 |
| `CodeEditor` | 代码编辑区（初版用 Naive UI textarea + monospace，后续替换为 Monaco） |
| `UserAvatar` | 用户头像，props：头像URL + 是否是管理员 |
| `Pagination` | 分页器（Naive UI 内置） |
| `EmptyState` | 空状态占位 |

---

## 七、状态管理（Pinia Store）

| Store | 职责 |
|-------|------|
| `useAuthStore` | 用户登录状态、token、当前用户信息、是否管理员 |
| `useProblemStore` | 当前浏览的题目、筛选条件缓存 |
| `useSubmitStore` | 提交状态、判题结果轮询 |

---

## 八、项目目录结构

```
oj-platform/
├── public/
├── src/
│   ├── assets/             # 静态资源（图片、字体）
│   ├── components/         # 全局复用组件
│   │   ├── GlobalHeader.vue
│   │   ├── GlobalFooter.vue
│   │   ├── CountdownTimer.vue
│   │   ├── StatusTag.vue
│   │   ├── DifficultyTag.vue
│   │   ├── MdRenderer.vue
│   │   ├── CodeEditor.vue
│   │   ├── UserAvatar.vue
│   │   └── EmptyState.vue
│   ├── views/              # 页面视图
│   │   ├── HomeView.vue
│   │   ├── ProblemListView.vue
│   │   ├── ProblemDetailView.vue
│   │   ├── SolutionListView.vue
│   │   ├── SolutionDetailView.vue
│   │   ├── ContestListView.vue
│   │   ├── ContestDetailView.vue
│   │   ├── UserProfileView.vue
│   │   └── admin/
│   │       └── AdminDashboard.vue
│   ├── stores/             # Pinia 状态管理
│   │   ├── auth.ts
│   │   ├── problem.ts
│   │   └── submit.ts
│   ├── api/                # API 请求封装
│   │   ├── index.ts        # axios 实例 + 拦截器
│   │   └── mock/           # Mock 数据
│   │       ├── problems.ts
│   │       ├── contests.ts
│   │       ├── solutions.ts
│   │       └── users.ts
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── REQUIREMENTS.md         # 本文档
```

---

## 九、开发计划（建议顺序）

| 阶段 | 内容 | 产出 |
|------|------|------|
| **P0** | 项目脚手架搭建：Vite + Vue3 + TS + Naive UI + Pinia + Router | 可运行的空项目 |
| **P1** | 全局布局：Header + Footer + 路由框架 + 配色变量 | 所有页面可跳转 |
| **P2** | 题库模块：列表(含筛选分页) + 详情(含 Markdown 渲染) | 核心功能可用 |
| **P3** | 提交功能：代码编辑器 + 提交 + 判题状态轮询 Mock | 刷题闭环 |
| **P4** | 首页：Banner + 倒计时 + 快捷跳题 + 近期比赛 | 入口页完成 |
| **P5** | 比赛模块：列表 + 详情（题目/排名/规则 Tab） | 比赛功能可用 |
| **P6** | 题解模块：列表 + 详情 + 点赞 + 评论 | 社区功能可用 |
| **P7** | 用户主页 + 登录/注册 | 用户体系闭环 |
| **P8** | 管理员面板 | 管理功能可用 |
| **P9** | Mock 数据填充 + 整体联调 | 全流程可演示 |

---

> 如有疑问或需要调整，请随时提出。下一阶段可开始 P0 项目脚手架搭建。
