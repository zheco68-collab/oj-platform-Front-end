import type { Contest, ContestDetail, ContestProblem, RankRecord, Submission } from '../../types'
import contestsData from './data/contests.json'

// 使用可变副本，使 Admin CRUD 可操作
export const mockContests: Contest[] = [...(contestsData as Contest[])]

// ==================== 比赛详情 Mock ====================

export const mockContestDetailMap: Record<number, ContestDetail> = {
  1: {
    id: 1,
    name: '2026 年度夏季算法竞赛',
    category: 'OFFICIAL',
    type: 'IOI',
    status: 'UPCOMING',
    rated: true,
    startTime: '2026-06-26T06:00:00Z',
    endTime: '2026-06-30T06:00:00Z',
    organizer: 'OJ 官方',
    description: `# 2026 年度夏季算法竞赛

## 比赛简介
欢迎参加 2026 年度夏季算法竞赛！本比赛为 OJ 官方举办的年度旗舰赛事，采用 IOI 赛制。

## 比赛时间
- 开始时间：2026 年 6 月 26 日 14:00
- 结束时间：2026 年 6 月 30 日 14:00

## 赛制说明
- **IOI 赛制**：每道题可以多次提交，取最高分
- **Rated**：本场比赛会计入 Rating 分

## 题目数量
共 5 道题，难度从入门到省选。

## 奖项设置
- 一等奖：前 10 名
- 二等奖：前 30 名
- 三等奖：前 60 名

## 注意事项
1. 请勿在比赛中讨论题目解法
2. 禁止使用多个账号参赛
3. 代码需在限定时间和内存内运行`,
    problems: [
      { id: 101, order: 1, title: 'A. 数字游戏', difficulty: 'entry', acceptedCount: 0, submissionCount: 0 },
      { id: 102, order: 2, title: 'B. 字符串匹配', difficulty: 'popularize', acceptedCount: 0, submissionCount: 0 },
      { id: 103, order: 3, title: 'C. 树形DP优化', difficulty: 'improve', acceptedCount: 0, submissionCount: 0 },
      { id: 104, order: 4, title: 'D. 几何计算', difficulty: 'improve', acceptedCount: 0, submissionCount: 0 },
      { id: 105, order: 5, title: 'E. 网络流建模', difficulty: 'provincial', acceptedCount: 0, submissionCount: 0 },
    ],
    ranking: [],
  },
  2: {
    id: 2,
    name: '周赛 #56 — 动态规划专场',
    category: 'PUBLIC',
    type: 'ICPC',
    status: 'UPCOMING',
    rated: true,
    startTime: '2026-06-24T06:00:00Z',
    endTime: '2026-06-24T08:00:00Z',
    organizer: 'Admin',
    description: `# 周赛 #56 — 动态规划专场

## 比赛简介
本周赛主题为动态规划，涵盖线性DP、背包DP、区间DP、树形DP等经典模型。

## 赛制说明
- **ICPC 赛制**：通过全部测试数据才得分，罚时计入排名
- **Rated**：本场比赛会计入 Rating 分

## 题目列表
共 4 道题，2 小时完成。`,
    problems: [
      { id: 201, order: 1, title: 'A. 最长递增子序列', difficulty: 'entry', acceptedCount: 0, submissionCount: 0 },
      { id: 202, order: 2, title: 'B. 01背包变形', difficulty: 'popularize', acceptedCount: 0, submissionCount: 0 },
      { id: 203, order: 3, title: 'C. 石子合并', difficulty: 'improve', acceptedCount: 0, submissionCount: 0 },
      { id: 204, order: 4, title: 'D. 树形背包', difficulty: 'provincial', acceptedCount: 0, submissionCount: 0 },
    ],
    ranking: [],
  },
  3: {
    id: 3,
    name: '周赛 #55 — 图论与搜索',
    category: 'PUBLIC',
    type: 'ICPC',
    status: 'RUNNING',
    rated: true,
    startTime: '2026-06-23T13:00:00Z',
    endTime: '2026-06-23T15:00:00Z',
    organizer: 'Admin',
    description: `# 周赛 #55 — 图论与搜索

## 比赛简介
本周赛主题为图论与搜索算法，包括DFS、BFS、最短路、最小生成树等内容。

## 赛制说明
- **ICPC 赛制**：通过全部测试数据才得分，罚时计入排名
- **Rated**：本场比赛会计入 Rating 分

## 题目列表
共 4 道题，2 小时完成。`,
    problems: [
      { id: 301, order: 1, title: 'A. 迷宫最短路径', difficulty: 'entry', acceptedCount: 156, submissionCount: 234 },
      { id: 302, order: 2, title: 'B. 拓扑排序', difficulty: 'popularize', acceptedCount: 89, submissionCount: 178 },
      { id: 303, order: 3, title: 'C. 最小生成树', difficulty: 'improve', acceptedCount: 42, submissionCount: 120 },
      { id: 304, order: 4, title: 'D. 网络流', difficulty: 'provincial', acceptedCount: 8, submissionCount: 56 },
    ],
    ranking: [
      { rank: 1, userId: 1, username: 'tourist', scores: [100, 100, 100, 100], totalScore: 400, penalty: 45 },
      { rank: 2, userId: 2, username: 'Petr', scores: [100, 100, 100, 75], totalScore: 375, penalty: 62 },
      { rank: 3, userId: 3, username: 'AC_Automaton', scores: [100, 100, 100, 50], totalScore: 350, penalty: 58 },
      { rank: 4, userId: 4, username: 'CodeMaster', scores: [100, 100, 100, 0], totalScore: 300, penalty: 40 },
      { rank: 5, userId: 5, username: 'AlgoQueen', scores: [100, 100, 75, 0], totalScore: 275, penalty: 55 },
      { rank: 6, userId: 6, username: 'Debugger', scores: [100, 100, 50, 0], totalScore: 250, penalty: 72 },
      { rank: 7, userId: 7, username: 'NoobCoder', scores: [100, 75, 0, 0], totalScore: 175, penalty: 30 },
      { rank: 8, userId: 8, username: 'TypeScript', scores: [100, 50, 0, 0], totalScore: 150, penalty: 25 },
    ],
  },
  4: {
    id: 4,
    name: '新手练习赛 #12',
    category: 'TEAM',
    type: 'OI',
    status: 'ENDED',
    rated: false,
    startTime: '2026-06-15T10:00:00Z',
    endTime: '2026-06-16T10:00:00Z',
    organizer: 'OJ 训练营',
    description: `# 新手练习赛 #12

## 比赛简介
面向新手的练习赛，题目难度较低，适合入门和普及组选手。

## 赛制说明
- **OI 赛制**：每道题多次提交，以最后一次提交为准，无罚时
- **非 Rated**：本场比赛不计入 Rating

## 题目列表
共 6 道题，24 小时完成。`,
    problems: [
      { id: 401, order: 1, title: 'A. Hello World', difficulty: 'entry', acceptedCount: 320, submissionCount: 356 },
      { id: 402, order: 2, title: 'B. 两数之和', difficulty: 'entry', acceptedCount: 298, submissionCount: 340 },
      { id: 403, order: 3, title: 'C. 斐波那契数列', difficulty: 'popularize', acceptedCount: 245, submissionCount: 310 },
      { id: 404, order: 4, title: 'D. 冒泡排序', difficulty: 'popularize', acceptedCount: 220, submissionCount: 290 },
      { id: 405, order: 5, title: 'E. 回文判断', difficulty: 'popularize', acceptedCount: 198, submissionCount: 260 },
      { id: 406, order: 6, title: 'F. 最大公约数', difficulty: 'improve', acceptedCount: 156, submissionCount: 230 },
    ],
    ranking: [
      { rank: 1, userId: 9, username: 'NewbieKing', scores: [100, 100, 100, 100, 100, 100], totalScore: 600, penalty: 0 },
      { rank: 2, userId: 10, username: 'RisingStar', scores: [100, 100, 100, 100, 100, 80], totalScore: 580, penalty: 0 },
      { rank: 3, userId: 11, username: 'CodeNewbie', scores: [100, 100, 100, 100, 80, 0], totalScore: 480, penalty: 0 },
      { rank: 4, userId: 12, username: 'HelloWorld', scores: [100, 100, 100, 100, 0, 0], totalScore: 400, penalty: 0 },
      { rank: 5, userId: 13, username: 'LearnToCode', scores: [100, 100, 100, 0, 0, 0], totalScore: 300, penalty: 0 },
    ],
  },
  5: {
    id: 5,
    name: '月赛 #5 — 算法综合挑战',
    category: 'OFFICIAL',
    type: 'IOI',
    status: 'ENDED',
    rated: true,
    startTime: '2026-06-01T09:00:00Z',
    endTime: '2026-06-01T15:00:00Z',
    organizer: 'OJ 官方',
    description: `# 月赛 #5 — 算法综合挑战

## 比赛简介
月度算法综合挑战赛，涵盖多种算法和数据结构。

## 赛制说明
- **IOI 赛制**：每道题可以多次提交，取最高分
- **Rated**：本场比赛会计入 Rating 分

## 题目列表
共 5 道题。`,
    problems: [
      { id: 501, order: 1, title: 'A. 前缀和优化', difficulty: 'popularize', acceptedCount: 189, submissionCount: 245 },
      { id: 502, order: 2, title: 'B. 二分答案', difficulty: 'popularize', acceptedCount: 156, submissionCount: 210 },
      { id: 503, order: 3, title: 'C. 线段树', difficulty: 'improve', acceptedCount: 78, submissionCount: 156 },
      { id: 504, order: 4, title: 'D. 状压DP', difficulty: 'improve', acceptedCount: 34, submissionCount: 98 },
      { id: 505, order: 5, title: 'E. 莫队算法', difficulty: 'provincial', acceptedCount: 12, submissionCount: 45 },
    ],
    ranking: [
      { rank: 1, userId: 2, username: 'Petr', scores: [100, 100, 100, 100, 80], totalScore: 480, penalty: 0 },
      { rank: 2, userId: 1, username: 'tourist', scores: [100, 100, 100, 100, 60], totalScore: 460, penalty: 0 },
      { rank: 3, userId: 3, username: 'AC_Automaton', scores: [100, 100, 100, 80, 0], totalScore: 380, penalty: 0 },
      { rank: 4, userId: 4, username: 'CodeMaster', scores: [100, 100, 100, 0, 0], totalScore: 300, penalty: 0 },
      { rank: 5, userId: 5, username: 'AlgoQueen', scores: [100, 100, 75, 0, 0], totalScore: 275, penalty: 0 },
    ],
  },
  6: {
    id: 6,
    name: 'Codeforces 模拟赛 Round #3',
    category: 'PUBLIC',
    type: 'ICPC',
    status: 'ENDED',
    rated: true,
    startTime: '2026-05-28T14:00:00Z',
    endTime: '2026-05-28T17:00:00Z',
    organizer: 'Codeforces 中文社区',
    description: `# Codeforces 模拟赛 Round #3

## 比赛简介
Codeforces 风格模拟赛，采用 ICPC 赛制。

## 赛制说明
- **ICPC 赛制**：通过全部测试数据才得分，罚时计入排名
- **Rated**：本场比赛会计入 Rating 分`,
    problems: [
      { id: 601, order: 1, title: 'A. Two Sum', difficulty: 'entry', acceptedCount: 267, submissionCount: 320 },
      { id: 602, order: 2, title: 'B. String Sort', difficulty: 'popularize', acceptedCount: 198, submissionCount: 289 },
      { id: 603, order: 3, title: 'C. Graph Cycle', difficulty: 'improve', acceptedCount: 67, submissionCount: 145 },
    ],
    ranking: [
      { rank: 1, userId: 1, username: 'tourist', scores: [100, 100, 100], totalScore: 300, penalty: 28 },
      { rank: 2, userId: 4, username: 'CodeMaster', scores: [100, 100, 100], totalScore: 300, penalty: 42 },
      { rank: 3, userId: 3, username: 'AC_Automaton', scores: [100, 100, 0], totalScore: 200, penalty: 35 },
      { rank: 4, userId: 6, username: 'Debugger', scores: [100, 100, 0], totalScore: 200, penalty: 48 },
    ],
  },
  7: {
    id: 7,
    name: 'ACM 校赛热身赛',
    category: 'TEAM',
    type: 'ICPC',
    status: 'ENDED',
    rated: false,
    startTime: '2026-05-20T08:00:00Z',
    endTime: '2026-05-20T12:00:00Z',
    organizer: '某高校 ACM 队',
    description: `# ACM 校赛热身赛

## 比赛简介
ACM 校赛前的热身赛，帮助选手熟悉赛制和平台。

## 赛制说明
- **ICPC 赛制**
- **非 Rated**`,
    problems: [
      { id: 701, order: 1, title: 'A. Easy Math', difficulty: 'entry', acceptedCount: 89, submissionCount: 110 },
      { id: 702, order: 2, title: 'B. String Match', difficulty: 'popularize', acceptedCount: 56, submissionCount: 98 },
      { id: 703, order: 3, title: 'C. Tree DP', difficulty: 'improve', acceptedCount: 23, submissionCount: 67 },
      { id: 704, order: 4, title: 'D. Max Flow', difficulty: 'provincial', acceptedCount: 5, submissionCount: 34 },
    ],
    ranking: [
      { rank: 1, userId: 10, username: 'RisingStar', scores: [100, 100, 100, 50], totalScore: 350, penalty: 78 },
      { rank: 2, userId: 11, username: 'CodeNewbie', scores: [100, 100, 100, 0], totalScore: 300, penalty: 56 },
      { rank: 3, userId: 9, username: 'NewbieKing', scores: [100, 100, 0, 0], totalScore: 200, penalty: 34 },
    ],
  },
  8: {
    id: 8,
    name: '五一劳动节特别赛',
    category: 'OFFICIAL',
    type: 'OI',
    status: 'ENDED',
    rated: true,
    startTime: '2026-05-01T10:00:00Z',
    endTime: '2026-05-03T10:00:00Z',
    organizer: 'OJ 官方',
    description: `# 五一劳动节特别赛

## 比赛简介
五一劳动节特别赛事，为期两天，采用 OI 赛制，题目难度覆盖广泛。

## 赛制说明
- **OI 赛制**：每道题多次提交，以最后一次为准，无罚时
- **Rated**：本场比赛会计入 Rating 分

## 题目列表
共 6 道题。`,
    problems: [
      { id: 801, order: 1, title: 'A. 签到题', difficulty: 'entry', acceptedCount: 456, submissionCount: 512 },
      { id: 802, order: 2, title: 'B. 贪心策略', difficulty: 'popularize', acceptedCount: 345, submissionCount: 430 },
      { id: 803, order: 3, title: 'C. 二分+前缀和', difficulty: 'popularize', acceptedCount: 278, submissionCount: 380 },
      { id: 804, order: 4, title: 'D. 最短路径', difficulty: 'improve', acceptedCount: 156, submissionCount: 267 },
      { id: 805, order: 5, title: 'E. 数位DP', difficulty: 'provincial', acceptedCount: 34, submissionCount: 98 },
      { id: 806, order: 6, title: 'F. 树链剖分', difficulty: 'NOI', acceptedCount: 8, submissionCount: 45 },
    ],
    ranking: [
      { rank: 1, userId: 2, username: 'Petr', scores: [100, 100, 100, 100, 80, 50], totalScore: 530, penalty: 0 },
      { rank: 2, userId: 1, username: 'tourist', scores: [100, 100, 100, 100, 60, 30], totalScore: 490, penalty: 0 },
      { rank: 3, userId: 3, username: 'AC_Automaton', scores: [100, 100, 100, 100, 40, 0], totalScore: 440, penalty: 0 },
      { rank: 4, userId: 5, username: 'AlgoQueen', scores: [100, 100, 100, 100, 0, 0], totalScore: 400, penalty: 0 },
      { rank: 5, userId: 4, username: 'CodeMaster', scores: [100, 100, 100, 80, 0, 0], totalScore: 380, penalty: 0 },
      { rank: 6, userId: 6, username: 'Debugger', scores: [100, 100, 100, 0, 0, 0], totalScore: 300, penalty: 0 },
    ],
  },
}

// ==================== 比赛题目映射 (使用 Detail 中的 problems) ====================

export const mockContestProblemsMap: Record<number, ContestProblem[]> = Object.fromEntries(
  Object.entries(mockContestDetailMap).map(([id, detail]) => [Number(id), detail.problems]),
)

// ==================== 比赛排名映射 ====================

export const mockContestRankingMap: Record<number, RankRecord[]> = Object.fromEntries(
  Object.entries(mockContestDetailMap).map(([id, detail]) => [Number(id), detail.ranking]),
)

// ==================== 比赛提交 Mock ====================

export const mockContestSubmissionsMap: Record<number, Submission[]> = {
  3: [
    { id: 'CS-000001', problemId: 301, language: 'C++17', code: '// BFS solution\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // ...\n  // @judge: AC\n  return 0;\n}', status: 'AC', time: 12, memory: 2560, createdAt: '2026-06-23T13:15:00Z' },
    { id: 'CS-000002', problemId: 302, language: 'C++20', code: '// Topo sort\n// @judge: AC\n', status: 'AC', time: 8, memory: 1024, createdAt: '2026-06-23T13:30:00Z' },
    { id: 'CS-000003', problemId: 303, language: 'C++17', code: '// Kruskal MST\n// @judge: WA\n', status: 'WA', time: 45, memory: 4096, createdAt: '2026-06-23T13:50:00Z' },
    { id: 'CS-000004', problemId: 303, language: 'C++17', code: '// Kruskal MST fixed\n// @judge: AC\n', status: 'AC', time: 15, memory: 3584, createdAt: '2026-06-23T14:05:00Z' },
  ],
  4: [
    { id: 'CS-000005', problemId: 401, language: 'Python3', code: 'print("Hello World") // @judge: AC', status: 'AC', time: 5, memory: 5120, createdAt: '2026-06-15T10:30:00Z' },
    { id: 'CS-000006', problemId: 402, language: 'Python3', code: '# Two sum\n// @judge: AC', status: 'AC', time: 8, memory: 4608, createdAt: '2026-06-15T10:45:00Z' },
  ],
  5: [
    { id: 'CS-000007', problemId: 501, language: 'C++20', code: '// Prefix sum\n// @judge: AC\n', status: 'AC', time: 10, memory: 2048, createdAt: '2026-06-01T09:30:00Z' },
    { id: 'CS-000008', problemId: 502, language: 'C++20', code: '// Binary search\n// @judge: AC\n', status: 'AC', time: 22, memory: 3072, createdAt: '2026-06-01T10:00:00Z' },
    { id: 'CS-000009', problemId: 503, language: 'C++17', code: '// Segment tree\n// @judge: TLE\n', status: 'TLE', time: 2000, memory: 8192, createdAt: '2026-06-01T11:00:00Z' },
  ],
  6: [
    { id: 'CS-000010', problemId: 601, language: 'Java', code: '// Two sum\n// @judge: AC\n', status: 'AC', time: 18, memory: 15360, createdAt: '2026-05-28T14:20:00Z' },
    { id: 'CS-000011', problemId: 602, language: 'Java', code: '// String sort\n// @judge: AC\n', status: 'AC', time: 35, memory: 18432, createdAt: '2026-05-28T14:50:00Z' },
    { id: 'CS-000012', problemId: 603, language: 'Java', code: '// Graph cycle\n// @judge: RE\n', status: 'RE', time: 0, memory: 0, createdAt: '2026-05-28T15:30:00Z' },
  ],
  7: [
    { id: 'CS-000013', problemId: 701, language: 'C++17', code: '// @judge: AC\n', status: 'AC', time: 5, memory: 1024, createdAt: '2026-05-20T08:30:00Z' },
    { id: 'CS-000014', problemId: 702, language: 'C++17', code: '// @judge: WA\n', status: 'WA', time: 12, memory: 2048, createdAt: '2026-05-20T09:00:00Z' },
  ],
  8: [
    { id: 'CS-000015', problemId: 801, language: 'Python3', code: '# @judge: AC\n', status: 'AC', time: 10, memory: 4096, createdAt: '2026-05-01T10:15:00Z' },
    { id: 'CS-000016', problemId: 802, language: 'Python3', code: '# @judge: AC\n', status: 'AC', time: 25, memory: 5632, createdAt: '2026-05-01T11:00:00Z' },
    { id: 'CS-000017', problemId: 803, language: 'C++17', code: '// @judge: WA\n', status: 'WA', time: 30, memory: 3072, createdAt: '2026-05-01T13:00:00Z' },
  ],
}
