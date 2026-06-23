/**
 * Admin 专用 Mock 数据辅助
 *
 * 提供：可变数据引用、自增 ID 生成、封禁状态管理
 */
import type { Problem, ProblemDetail, Contest, ContestDetail, Announcement, User } from '../../types'
import { mockProblems, mockProblemDetailMap } from './problems'
import { mockContests, mockContestDetailMap } from './contests'
import { mockAnnouncements } from './home'
import { getMutableUsers } from './users'

// ==================== ID 生成器 ====================

/** 获取下一个题目 ID */
export function getNextProblemId(): number {
  const maxId = mockProblems.reduce((max, p) => Math.max(max, p.id), 0)
  return Math.max(maxId, 1000) + 1
}

/** 获取下一个比赛 ID */
export function getNextContestId(): number {
  const maxId = mockContests.reduce((max, c) => Math.max(max, c.id), 0)
  return Math.max(maxId, 0) + 1
}

/** 获取下一个公告 ID */
export function getNextAnnouncementId(): number {
  const maxId = mockAnnouncements.reduce((max, a) => Math.max(max, a.id), 0)
  return Math.max(maxId, 0) + 1
}

// ==================== 可变数据引用 ====================

export function getMutableProblems(): Problem[] {
  return mockProblems
}

export function getMutableProblemDetailMap(): Record<number, ProblemDetail> {
  return mockProblemDetailMap
}

export function getMutableContests(): Contest[] {
  return mockContests
}

export function getMutableContestDetailMap(): Record<number, ContestDetail> {
  return mockContestDetailMap
}

export function getMutableAnnouncements(): Announcement[] {
  return mockAnnouncements
}

export function getAdminUsers(): User[] {
  return getMutableUsers()
}

// ==================== 封禁状态管理 ====================

const bannedUserIds = new Set<number>()

/** 封禁用户 */
export function addBannedUser(userId: number): void {
  bannedUserIds.add(userId)
}

/** 解封用户 */
export function removeBannedUser(userId: number): void {
  bannedUserIds.delete(userId)
}

/** 查询用户是否被封禁 */
export function isUserBanned(userId: number): boolean {
  return bannedUserIds.has(userId)
}

/** 获取所有被封禁的用户 ID */
export function getBannedUserIds(): Set<number> {
  return bannedUserIds
}
