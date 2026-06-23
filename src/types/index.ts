// ==================== 基础类型定义 ====================

/** 题目难度 */
export type Difficulty =
  | 'entry'      // 入门
  | 'popularize' // 普及
  | 'improve'    // 提高
  | 'provincial' // 省选
  | 'NOI'        // NOI

/** 判题状态 */
export type JudgeStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'AC'
  | 'WA'
  | 'TLE'
  | 'MLE'
  | 'RE'
  | 'CE'
  | 'SE'

/** 比赛状态 */
export type ContestStatus = 'UPCOMING' | 'RUNNING' | 'ENDED'

/** 比赛赛制 */
export type ContestType = 'IOI' | 'ICPC' | 'OI'

/** 比赛类别 */
export type ContestCategory = 'OFFICIAL' | 'PUBLIC' | 'TEAM'

/** 用户角色 */
export type UserRole = 'USER' | 'ADMIN'

// ==================== 用户 ====================

export interface User {
  id: number
  username: string
  avatarUrl: string
  signature: string
  role: UserRole
  createdAt: string
  acceptedCount: number
  submissionCount: number
  rating?: number
}

export interface UserProfile extends User {
  recentAC: RecentAC[]
  solutions: SolutionSummary[]
  contestHistory: ContestRecord[]
}

export interface RecentAC {
  problemId: number
  problemTitle: string
  acceptedAt: string
}

export interface ContestRecord {
  contestId: number
  contestName: string
  rank: number
  ratingChange: number
}

// ==================== 题目 ====================

export interface Problem {
  id: number
  title: string
  difficulty: Difficulty
  tags: string[]
  source: string
  timeLimit: number   // ms
  memoryLimit: number  // MB
  acceptedCount: number
  submissionCount: number
  status?: 'AC' | 'ATTEMPTED' | 'NONE'  // 当前用户的做题状态
}

export interface ProblemDetail {
  id: number
  title: string
  difficulty: Difficulty
  tags: string[]
  source: string
  timeLimit: number
  memoryLimit: number
  description: string    // Markdown
  inputFormat: string    // Markdown
  outputFormat: string   // Markdown
  samples: ProblemSample[]
  hint: string           // Markdown
  acceptedCount: number
  submissionCount: number
}

export interface ProblemSample {
  input: string
  output: string
}

// ==================== 比赛 ====================

export interface Contest {
  id: number
  name: string
  category: ContestCategory
  type: ContestType
  status: ContestStatus
  rated: boolean
  startTime: string
  endTime: string
  organizer: string
}

export interface ContestDetail {
  id: number
  name: string
  category: ContestCategory
  type: ContestType
  status: ContestStatus
  rated: boolean
  startTime: string
  endTime: string
  organizer: string
  description: string   // Markdown
  problems: ContestProblem[]
  ranking: RankRecord[]
}

export interface ContestProblem {
  id: number
  order: number
  title: string
  difficulty: Difficulty
  acceptedCount: number
  submissionCount: number
}

export interface RankRecord {
  rank: number
  userId: number
  username: string
  scores: number[]   // 每题得分
  totalScore: number
  penalty: number    // 罚时（分钟）
}

// ==================== 题解 ====================

export interface SolutionSummary {
  id: number
  title: string
  author: {
    id: number
    username: string
    avatarUrl: string
  }
  problemId: number
  problemTitle: string
  createdAt: string
  likeCount: number
  summary: string
}

export interface SolutionDetail {
  id: number
  title: string
  author: {
    id: number
    username: string
    avatarUrl: string
  }
  problemId: number
  problemTitle: string
  createdAt: string
  content: string      // Markdown
  likeCount: number
  dislikeCount: number
  comments: Comment[]
}

export interface Comment {
  id: number
  author: {
    id: number
    username: string
    avatarUrl: string
  }
  content: string
  createdAt: string
  replies: Comment[]   // 二层嵌套
}

// ==================== 提交 ====================

export interface Submission {
  id: string
  problemId: number
  language: string
  code: string
  status: JudgeStatus
  time?: number     // 运行时间 ms
  memory?: number   // 内存消耗 KB
  createdAt: string
}

// ==================== 公告 ====================

export interface Announcement {
  id: number
  title: string
  content: string
  pinned: boolean
  createdAt: string
}

// ==================== Banner ====================

export interface Banner {
  id: number
  imageUrl: string
  linkUrl?: string
  title: string
}

// ==================== 管理员 ====================

export interface AdminOverview {
  label: string
  value: number
  icon: string
  color: string
}

export interface AdminEntry {
  key: string
  title: string
  description: string
  icon: string
  color: string
  actions: string[]
}

// ==================== API 通用 ====================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  size: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
