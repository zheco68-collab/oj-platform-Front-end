/**
 * Admin API 单元测试 — CRUD 操作正确性
 */
import { describe, it, expect } from 'vitest'
import {
  fetchAdminProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  fetchAdminContests,
  createContest,
  updateContest,
  deleteContest,
  fetchAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPin,
  fetchAdminUsers,
  banUser,
  unbanUser,
} from '../../api/admin'
import type { AdminProblemForm, AdminContestForm, AdminAnnouncementForm } from '../../api/admin'

// ==================== 题目管理测试 ====================

describe('Admin API — 题目管理', () => {
  it('fetchAdminProblems 返回分页数据', async () => {
    const res = await fetchAdminProblems({ page: 1, size: 10 })
    expect(res.code).toBe(200)
    expect(res.data.data.length).toBeGreaterThan(0)
    expect(res.data.total).toBeGreaterThan(0)
    expect(res.data.page).toBe(1)
    expect(res.data.size).toBe(10)
  })

  it('fetchAdminProblems 支持关键词搜索', async () => {
    const res = await fetchAdminProblems({ page: 1, size: 10, keyword: 'P1001' })
    expect(res.code).toBe(200)
    expect(res.data.data.length).toBeGreaterThanOrEqual(0)
  })

  it('createProblem 创建题目并增加计数', async () => {
    const before = await fetchAdminProblems({ page: 1, size: 100 })
    const initialTotal = before.data.total

    const form: AdminProblemForm = {
      title: '测试题目',
      difficulty: 'entry',
      tags: ['test'],
      source: '原创',
      timeLimit: 1000,
      memoryLimit: 256,
      description: '# 测试',
      inputFormat: '无',
      outputFormat: '无',
      samples: [{ input: '1', output: '2' }],
      hint: '',
      isPublic: true,
    }
    const createRes = await createProblem(form)
    expect(createRes.code).toBe(200)
    expect(createRes.data.title).toBe('测试题目')

    const after = await fetchAdminProblems({ page: 1, size: 100 })
    expect(after.data.total).toBe(initialTotal + 1)
  })

  it('updateProblem 更新题目属性', async () => {
    const form: AdminProblemForm = {
      title: '已更新的题目',
      difficulty: 'provincial',
      tags: ['updated'],
      source: '洛谷',
      timeLimit: 2000,
      memoryLimit: 512,
      description: '# Updated',
      inputFormat: '更新后输入',
      outputFormat: '更新后输出',
      samples: [],
      hint: '提示',
      isPublic: true,
    }
    const res = await updateProblem(1001, form)
    expect(res.code).toBe(200)
    expect(res.data!.title).toBe('已更新的题目')
    expect(res.data!.difficulty).toBe('provincial')
  })

  it('updateProblem 不存在的 ID 返回 404', async () => {
    const form: AdminProblemForm = {
      title: 'test',
      difficulty: 'entry',
      tags: [],
      source: '原创',
      timeLimit: 1000,
      memoryLimit: 128,
      description: '',
      inputFormat: '',
      outputFormat: '',
      samples: [],
      hint: '',
      isPublic: true,
    }
    const res = await updateProblem(999999, form)
    expect(res.code).toBe(404)
    expect(res.data).toBeNull()
  })

  it('deleteProblem 删除题目', async () => {
    // 先创建一个题目
    const form: AdminProblemForm = {
      title: '待删除题目',
      difficulty: 'entry',
      tags: [],
      source: '原创',
      timeLimit: 1000,
      memoryLimit: 128,
      description: '',
      inputFormat: '',
      outputFormat: '',
      samples: [],
      hint: '',
      isPublic: true,
    }
    const { data: created } = await createProblem(form)

    const res = await deleteProblem(created.id)
    expect(res.code).toBe(200)

    // 确认已删除
    const list = await fetchAdminProblems({ page: 1, size: 1000 })
    expect(list.data.data.find((p) => p.id === created.id)).toBeUndefined()
  })
})

// ==================== 比赛管理测试 ====================

describe('Admin API — 比赛管理', () => {
  it('fetchAdminContests 返回分页数据', async () => {
    const res = await fetchAdminContests({ page: 1, size: 10 })
    expect(res.code).toBe(200)
    expect(res.data.data.length).toBeGreaterThan(0)
  })

  it('createContest 创建比赛', async () => {
    const futureStart = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
    const futureEnd = new Date(Date.now() + 14 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString()

    const form: AdminContestForm = {
      name: '测试比赛',
      category: 'PUBLIC',
      type: 'ICPC',
      rated: true,
      startTime: futureStart,
      endTime: futureEnd,
      organizer: '测试组织',
      description: '# 测试比赛',
      problems: [],
    }
    const res = await createContest(form)
    expect(res.code).toBe(200)
    expect(res.data.name).toBe('测试比赛')
    expect(res.data.status).toBe('UPCOMING')
  })

  it('updateContest 更新比赛', async () => {
    const futureStart = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
    const futureEnd = new Date(Date.now() + 7 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString()

    const form: AdminContestForm = {
      name: '已更新比赛',
      category: 'OFFICIAL',
      type: 'IOI',
      rated: false,
      startTime: futureStart,
      endTime: futureEnd,
      organizer: '新组织',
      description: '# Updated',
      problems: [],
    }
    const res = await updateContest(1, form)
    expect(res.code).toBe(200)
    expect(res.data!.name).toBe('已更新比赛')
    expect(res.data!.category).toBe('OFFICIAL')
  })

  it('deleteContest 删除比赛', async () => {
    const futureStart = new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString()
    const futureEnd = new Date(Date.now() + 21 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString()

    const form: AdminContestForm = {
      name: '待删比赛',
      category: 'TEAM',
      type: 'OI',
      rated: false,
      startTime: futureStart,
      endTime: futureEnd,
      organizer: 'test',
      description: '',
      problems: [],
    }
    const { data: created } = await createContest(form)

    const res = await deleteContest(created.id)
    expect(res.code).toBe(200)
  })
})

// ==================== 公告管理测试 ====================

describe('Admin API — 公告管理', () => {
  it('fetchAdminAnnouncements 返回分页数据', async () => {
    const res = await fetchAdminAnnouncements({ page: 1, size: 10 })
    expect(res.code).toBe(200)
    expect(res.data.data.length).toBeGreaterThan(0)
  })

  it('createAnnouncement 创建公告', async () => {
    const form: AdminAnnouncementForm = {
      title: '测试公告',
      content: '这是公告内容',
      pinned: false,
    }
    const res = await createAnnouncement(form)
    expect(res.code).toBe(200)
    expect(res.data.title).toBe('测试公告')
    expect(res.data.pinned).toBe(false)
    expect(res.data.createdAt).toBeDefined()
  })

  it('updateAnnouncement 更新公告', async () => {
    const form: AdminAnnouncementForm = {
      title: '已更新公告',
      content: '新内容',
      pinned: true,
    }
    const res = await updateAnnouncement(1, form)
    expect(res.code).toBe(200)
    expect(res.data!.title).toBe('已更新公告')
    expect(res.data!.pinned).toBe(true)
  })

  it('toggleAnnouncementPin 切换置顶', async () => {
    // 先获取当前状态
    const list = await fetchAdminAnnouncements({ page: 1, size: 100 })
    const first = list.data.data[0]
    const currentPinned = first.pinned

    const res = await toggleAnnouncementPin(first.id)
    expect(res.code).toBe(200)
    expect(res.data!.pinned).toBe(!currentPinned)
  })

  it('deleteAnnouncement 删除公告', async () => {
    const form: AdminAnnouncementForm = {
      title: '待删除公告',
      content: '内容',
      pinned: false,
    }
    const { data: created } = await createAnnouncement(form)

    const res = await deleteAnnouncement(created.id)
    expect(res.code).toBe(200)
  })
})

// ==================== 用户管理测试 ====================

describe('Admin API — 用户管理', () => {
  it('fetchAdminUsers 返回分页数据', async () => {
    const res = await fetchAdminUsers({ page: 1, size: 10 })
    expect(res.code).toBe(200)
    expect(res.data.data.length).toBeGreaterThan(0)
    expect(res.data.data[0].banned).toBeDefined()
  })

  it('fetchAdminUsers 支持关键词搜索', async () => {
    const res = await fetchAdminUsers({ page: 1, size: 10, keyword: 'AC_Automaton' })
    expect(res.code).toBe(200)
    expect(res.data.data.length).toBeGreaterThanOrEqual(1)
    expect(res.data.data[0].username).toBe('AC_Automaton')
  })

  it('banUser 封禁用户', async () => {
    // 封禁一个普通用户
    const list = await fetchAdminUsers({ page: 1, size: 100 })
    const regularUser = list.data.data.find((u) => u.role === 'USER')
    if (regularUser) {
      const res = await banUser(regularUser.id)
      expect(res.code).toBe(200)

      // 验证封禁状态
      const updated = await fetchAdminUsers({ page: 1, size: 100 })
      const banned = updated.data.data.find((u) => u.id === regularUser.id)
      expect(banned!.banned).toBe(true)
    }
  })

  it('unbanUser 解封用户', async () => {
    const list = await fetchAdminUsers({ page: 1, size: 100 })
    // 寻找或封禁一个用户
    const regularUser = list.data.data.find((u) => u.role === 'USER')
    if (regularUser) {
      await banUser(regularUser.id)

      const res = await unbanUser(regularUser.id)
      expect(res.code).toBe(200)

      const updated = await fetchAdminUsers({ page: 1, size: 100 })
      const unbanned = updated.data.data.find((u) => u.id === regularUser.id)
      expect(unbanned!.banned).toBe(false)
    }
  })

  it('banUser 不存在的用户返回 404', async () => {
    const res = await banUser(999999)
    expect(res.code).toBe(404)
  })
})
