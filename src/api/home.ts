/**
 * 首页相关 API
 */
import type { Banner, Announcement, Contest, SolutionSummary, ApiResponse } from '../types'
import { mockBanners, mockAnnouncements } from './mock/home'
import { mockContests } from './mock/contests'
import { mockSolutions } from './mock/solutions'

/** 模拟网络延迟 (200-500ms) */
function delay(ms?: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms ?? 200 + Math.random() * 300))
}

/** 获取 Banner 列表 */
export async function fetchBanners(): Promise<ApiResponse<Banner[]>> {
  await delay()
  return {
    code: 200,
    message: 'ok',
    data: mockBanners,
  }
}

/** 获取近期比赛列表（按开始时间排序，取最近 N 场） */
export async function fetchHomeContests(limit = 8): Promise<ApiResponse<Contest[]>> {
  await delay()
  const sorted = [...mockContests].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  )
  return {
    code: 200,
    message: 'ok',
    data: sorted.slice(0, limit),
  }
}

/** 获取公告列表（置顶优先，然后按时间倒序） */
export async function fetchAnnouncements(): Promise<ApiResponse<Announcement[]>> {
  await delay()
  const sorted = [...mockAnnouncements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  return {
    code: 200,
    message: 'ok',
    data: sorted,
  }
}

/** 获取单条公告详情 */
export async function fetchAnnouncementDetail(
  id: number,
): Promise<ApiResponse<Announcement | null>> {
  await delay(100 + Math.random() * 200)
  const ann = mockAnnouncements.find((a) => a.id === id) ?? null
  return {
    code: ann ? 200 : 404,
    message: ann ? 'ok' : 'not found',
    data: ann,
  }
}

/** 获取最新题解列表 */
export async function fetchHomeSolutions(limit = 10): Promise<ApiResponse<SolutionSummary[]>> {
  await delay()
  const sorted = [...mockSolutions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return {
    code: 200,
    message: 'ok',
    data: sorted.slice(0, limit),
  }
}
