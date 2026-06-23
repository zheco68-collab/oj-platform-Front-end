/**
 * 比赛相关 API
 */
import type { Contest, ContestDetail, ContestProblem, RankRecord, Submission, ApiResponse, PaginatedResponse } from '../types'
import { mockContests, mockContestDetailMap, mockContestProblemsMap, mockContestRankingMap, mockContestSubmissionsMap } from './mock/contests'

/** 模拟网络延迟 (200-500ms) */
function delay(ms?: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms ?? 200 + Math.random() * 300))
}

/** 获取比赛列表（支持状态筛选和分页） */
export async function fetchContests(
  status?: string,
  page = 1,
  size = 12,
): Promise<ApiResponse<PaginatedResponse<Contest>>> {
  await delay()
  let filtered = [...mockContests]
  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status.toUpperCase())
  }
  // 按开始时间倒序
  filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  const total = filtered.length
  const start = (page - 1) * size
  const data = filtered.slice(start, start + size)

  return {
    code: 200,
    message: 'ok',
    data: { data, total, page, size },
  }
}

/** 获取比赛详情 */
export async function fetchContestDetail(id: number): Promise<ApiResponse<ContestDetail | null>> {
  await delay()
  const detail = mockContestDetailMap[id] || null
  return {
    code: detail ? 200 : 404,
    message: detail ? 'ok' : 'not found',
    data: detail,
  }
}

/** 获取比赛题目列表 */
export async function fetchContestProblems(id: number): Promise<ApiResponse<ContestProblem[]>> {
  await delay()
  const problems = mockContestProblemsMap[id] || []
  return {
    code: 200,
    message: 'ok',
    data: problems,
  }
}

/** 获取比赛排名 */
export async function fetchContestRanking(id: number): Promise<ApiResponse<RankRecord[]>> {
  await delay(300 + Math.random() * 400)
  const ranking = mockContestRankingMap[id] || []
  return {
    code: 200,
    message: 'ok',
    data: ranking,
  }
}

/** 获取用户在比赛中的提交记录 */
export async function fetchContestSubmissions(id: number): Promise<ApiResponse<Submission[]>> {
  await delay()
  const submissions = mockContestSubmissionsMap[id] || []
  return {
    code: 200,
    message: 'ok',
    data: submissions,
  }
}
