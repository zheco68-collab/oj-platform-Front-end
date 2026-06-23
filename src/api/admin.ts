/**
 * Admin 面板 API — CRUD 操作
 *
 * 所有函数均操作共享的 mutable mock 数据，
 * 因此管理员操作（新建/编辑/删除）会即时反映到前台页面。
 */
import type {
  Problem,
  ProblemDetail,
  Contest,
  ContestDetail,
  ContestProblem,
  Announcement,
  User,
  ApiResponse,
  PaginatedResponse,
  Difficulty,
  ContestCategory,
  ContestType,
  ProblemSample,
} from '../types'
import {
  getMutableProblems,
  getMutableProblemDetailMap,
  getMutableContests,
  getMutableContestDetailMap,
  getMutableAnnouncements,
  getAdminUsers,
  getNextProblemId,
  getNextContestId,
  getNextAnnouncementId,
  addBannedUser,
  removeBannedUser,
  isUserBanned,
} from './mock/admin-data'

// ==================== 工具函数 ====================

function delay(ms?: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms ?? 200 + Math.random() * 300))
}

// ==================== 题目管理 ====================

export interface AdminProblemParams {
  page: number
  size: number
  keyword?: string
}

export interface AdminProblemForm {
  title: string
  difficulty: Difficulty
  tags: string[]
  source: string
  timeLimit: number
  memoryLimit: number
  description: string
  inputFormat: string
  outputFormat: string
  samples: ProblemSample[]
  hint: string
  isPublic: boolean
}

/** 获取题目列表（管理员视图，含分页搜索） */
export async function fetchAdminProblems(
  params: AdminProblemParams,
): Promise<ApiResponse<PaginatedResponse<Problem>>> {
  await delay()

  const problems = getMutableProblems()
  let filtered = [...problems]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        `P${p.id}`.toLowerCase().includes(kw) ||
        p.id.toString().includes(kw),
    )
  }

  // 按 ID 倒序（最新的在前）
  filtered.sort((a, b) => b.id - a.id)

  const total = filtered.length
  const start = (params.page - 1) * params.size
  const paged = filtered.slice(start, start + params.size)

  return {
    code: 200,
    message: 'ok',
    data: { data: paged, total, page: params.page, size: params.size },
  }
}

/** 获取题目详情（管理员视图） */
export async function fetchAdminProblemDetail(
  id: number,
): Promise<ApiResponse<ProblemDetail | null>> {
  await delay()
  const detailMap = getMutableProblemDetailMap()
  const detail = detailMap[id] || null
  return {
    code: detail ? 200 : 404,
    message: detail ? 'ok' : 'not found',
    data: detail,
  }
}

/** 新建题目 */
export async function createProblem(
  form: AdminProblemForm,
): Promise<ApiResponse<Problem>> {
  await delay(300)

  const problems = getMutableProblems()
  const detailMap = getMutableProblemDetailMap()
  const id = getNextProblemId()

  const problem: Problem = {
    id,
    title: form.title,
    difficulty: form.difficulty,
    tags: form.tags,
    source: form.source,
    timeLimit: form.timeLimit,
    memoryLimit: form.memoryLimit,
    acceptedCount: 0,
    submissionCount: 0,
    isPublic: form.isPublic,
  }

  const detail: ProblemDetail = {
    ...problem,
    description: form.description,
    inputFormat: form.inputFormat,
    outputFormat: form.outputFormat,
    samples: form.samples,
    hint: form.hint,
  }

  problems.push(problem)
  detailMap[id] = detail

  return {
    code: 200,
    message: 'ok',
    data: problem,
  }
}

/** 更新题目 */
export async function updateProblem(
  id: number,
  form: AdminProblemForm,
): Promise<ApiResponse<Problem | null>> {
  await delay(300)

  const problems = getMutableProblems()
  const detailMap = getMutableProblemDetailMap()
  const index = problems.findIndex((p) => p.id === id)

  if (index === -1) {
    return { code: 404, message: 'not found', data: null }
  }

  const updated: Problem = {
    id,
    title: form.title,
    difficulty: form.difficulty,
    tags: form.tags,
    source: form.source,
    timeLimit: form.timeLimit,
    memoryLimit: form.memoryLimit,
    acceptedCount: problems[index].acceptedCount,
    submissionCount: problems[index].submissionCount,
    isPublic: form.isPublic,
  }

  problems[index] = updated
  detailMap[id] = {
    ...updated,
    description: form.description,
    inputFormat: form.inputFormat,
    outputFormat: form.outputFormat,
    samples: form.samples,
    hint: form.hint,
  }

  return {
    code: 200,
    message: 'ok',
    data: updated,
  }
}

/** 删除题目 */
export async function deleteProblem(id: number): Promise<ApiResponse<null>> {
  await delay(200)

  const problems = getMutableProblems()
  const detailMap = getMutableProblemDetailMap()
  const index = problems.findIndex((p) => p.id === id)

  if (index === -1) {
    return { code: 404, message: 'not found', data: null }
  }

  problems.splice(index, 1)
  delete detailMap[id]

  return { code: 200, message: 'ok', data: null }
}

// ==================== 比赛管理 ====================

export interface AdminContestParams {
  page: number
  size: number
  keyword?: string
}

export interface AdminContestForm {
  name: string
  category: ContestCategory
  type: ContestType
  rated: boolean
  startTime: string
  endTime: string
  organizer: string
  description: string
  problems: ContestProblem[]
}

/** 获取比赛列表（管理员视图） */
export async function fetchAdminContests(
  params: AdminContestParams,
): Promise<ApiResponse<PaginatedResponse<Contest>>> {
  await delay()

  const contests = getMutableContests()
  let filtered = [...contests]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(kw))
  }

  // 按开始时间倒序
  filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const total = filtered.length
  const start = (params.page - 1) * params.size
  const paged = filtered.slice(start, start + params.size)

  return {
    code: 200,
    message: 'ok',
    data: { data: paged, total, page: params.page, size: params.size },
  }
}

/** 新建比赛 */
export async function createContest(
  form: AdminContestForm,
): Promise<ApiResponse<Contest>> {
  await delay(300)

  const contests = getMutableContests()
  const detailMap = getMutableContestDetailMap()
  const id = getNextContestId()

  // 推断比赛状态
  const now = new Date()
  const start = new Date(form.startTime)
  const end = new Date(form.endTime)
  let status: Contest['status'] = 'UPCOMING'
  if (now >= end) status = 'ENDED'
  else if (now >= start) status = 'RUNNING'

  const contest: Contest = {
    id,
    name: form.name,
    category: form.category,
    type: form.type,
    status,
    rated: form.rated,
    startTime: form.startTime,
    endTime: form.endTime,
    organizer: form.organizer,
  }

  const detail: ContestDetail = {
    ...contest,
    description: form.description,
    problems: form.problems.map((p, i) => ({
      ...p,
      order: i + 1,
      acceptedCount: 0,
      submissionCount: 0,
    })),
    ranking: [],
  }

  contests.push(contest)
  detailMap[id] = detail

  return {
    code: 200,
    message: 'ok',
    data: contest,
  }
}

/** 更新比赛 */
export async function updateContest(
  id: number,
  form: AdminContestForm,
): Promise<ApiResponse<Contest | null>> {
  await delay(300)

  const contests = getMutableContests()
  const detailMap = getMutableContestDetailMap()
  const index = contests.findIndex((c) => c.id === id)

  if (index === -1) {
    return { code: 404, message: 'not found', data: null }
  }

  const now = new Date()
  const start = new Date(form.startTime)
  const end = new Date(form.endTime)
  let status: Contest['status'] = 'UPCOMING'
  if (now >= end) status = 'ENDED'
  else if (now >= start) status = 'RUNNING'

  const contest: Contest = {
    id,
    name: form.name,
    category: form.category,
    type: form.type,
    status,
    rated: form.rated,
    startTime: form.startTime,
    endTime: form.endTime,
    organizer: form.organizer,
  }

  contests[index] = contest

  // 保留原有排名和提交数据
  const oldDetail = detailMap[id]
  detailMap[id] = {
    ...contest,
    description: form.description,
    problems: form.problems.map((p, i) => ({
      ...p,
      order: i + 1,
      acceptedCount: p.acceptedCount ?? 0,
      submissionCount: p.submissionCount ?? 0,
    })),
    ranking: oldDetail?.ranking || [],
  }

  return {
    code: 200,
    message: 'ok',
    data: contest,
  }
}

/** 删除比赛 */
export async function deleteContest(id: number): Promise<ApiResponse<null>> {
  await delay(200)

  const contests = getMutableContests()
  const detailMap = getMutableContestDetailMap()
  const index = contests.findIndex((c) => c.id === id)

  if (index === -1) {
    return { code: 404, message: 'not found', data: null }
  }

  contests.splice(index, 1)
  delete detailMap[id]

  return { code: 200, message: 'ok', data: null }
}

// ==================== 公告管理 ====================

export interface AdminAnnouncementParams {
  page: number
  size: number
  keyword?: string
}

export interface AdminAnnouncementForm {
  title: string
  content: string
  pinned: boolean
}

/** 获取公告列表（管理员视图） */
export async function fetchAdminAnnouncements(
  params: AdminAnnouncementParams,
): Promise<ApiResponse<PaginatedResponse<Announcement>>> {
  await delay()

  const announcements = getMutableAnnouncements()
  let filtered = [...announcements]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(kw) ||
        a.content.toLowerCase().includes(kw),
    )
  }

  // 置顶优先，然后按时间倒序
  filtered.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const total = filtered.length
  const start = (params.page - 1) * params.size
  const paged = filtered.slice(start, start + params.size)

  return {
    code: 200,
    message: 'ok',
    data: { data: paged, total, page: params.page, size: params.size },
  }
}

/** 新建公告 */
export async function createAnnouncement(
  form: AdminAnnouncementForm,
): Promise<ApiResponse<Announcement>> {
  await delay(300)

  const announcements = getMutableAnnouncements()
  const id = getNextAnnouncementId()

  // 如果新公告置顶，取消其他置顶（保持唯一置顶逻辑）
  // 注：未强制唯一置顶，允许多个置顶

  const announcement: Announcement = {
    id,
    title: form.title,
    content: form.content,
    pinned: form.pinned,
    createdAt: new Date().toISOString(),
  }

  announcements.push(announcement)

  return {
    code: 200,
    message: 'ok',
    data: announcement,
  }
}

/** 更新公告 */
export async function updateAnnouncement(
  id: number,
  form: AdminAnnouncementForm,
): Promise<ApiResponse<Announcement | null>> {
  await delay(300)

  const announcements = getMutableAnnouncements()
  const index = announcements.findIndex((a) => a.id === id)

  if (index === -1) {
    return { code: 404, message: 'not found', data: null }
  }

  announcements[index] = {
    ...announcements[index],
    title: form.title,
    content: form.content,
    pinned: form.pinned,
  }

  return {
    code: 200,
    message: 'ok',
    data: announcements[index],
  }
}

/** 删除公告 */
export async function deleteAnnouncement(id: number): Promise<ApiResponse<null>> {
  await delay(200)

  const announcements = getMutableAnnouncements()
  const index = announcements.findIndex((a) => a.id === id)

  if (index === -1) {
    return { code: 404, message: 'not found', data: null }
  }

  announcements.splice(index, 1)

  return { code: 200, message: 'ok', data: null }
}

/** 切换公告置顶状态 */
export async function toggleAnnouncementPin(
  id: number,
): Promise<ApiResponse<Announcement | null>> {
  await delay(150)

  const announcements = getMutableAnnouncements()
  const index = announcements.findIndex((a) => a.id === id)

  if (index === -1) {
    return { code: 404, message: 'not found', data: null }
  }

  announcements[index] = {
    ...announcements[index],
    pinned: !announcements[index].pinned,
  }

  return {
    code: 200,
    message: 'ok',
    data: announcements[index],
  }
}

// ==================== 用户管理 ====================

export interface AdminUserParams {
  page: number
  size: number
  keyword?: string
}

/** 管理员视图的用户信息（含封禁状态） */
export interface AdminUser extends User {
  banned: boolean
}

/** 获取用户列表（管理员视图） */
export async function fetchAdminUsers(
  params: AdminUserParams,
): Promise<ApiResponse<PaginatedResponse<AdminUser>>> {
  await delay()

  const users = getAdminUsers()
  let filtered = [...users]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(kw) ||
        u.id.toString().includes(kw),
    )
  }

  // 按 ID 排序
  filtered.sort((a, b) => a.id - b.id)

  const total = filtered.length
  const start = (params.page - 1) * params.size
  const paged = filtered.slice(start, start + params.size)

  // 附加封禁状态
  const data: AdminUser[] = paged.map((u) => ({
    ...u,
    banned: isUserBanned(u.id),
  }))

  return {
    code: 200,
    message: 'ok',
    data: { data, total, page: params.page, size: params.size },
  }
}

/** 封禁用户 */
export async function banUser(id: number): Promise<ApiResponse<null>> {
  await delay(150)

  const users = getAdminUsers()
  const user = users.find((u) => u.id === id)
  if (!user) {
    return { code: 404, message: 'not found', data: null }
  }

  addBannedUser(id)

  return { code: 200, message: 'ok', data: null }
}

/** 解封用户 */
export async function unbanUser(id: number): Promise<ApiResponse<null>> {
  await delay(150)

  const users = getAdminUsers()
  const user = users.find((u) => u.id === id)
  if (!user) {
    return { code: 404, message: 'not found', data: null }
  }

  removeBannedUser(id)

  return { code: 200, message: 'ok', data: null }
}
