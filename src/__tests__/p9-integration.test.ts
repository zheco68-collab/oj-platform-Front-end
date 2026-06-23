/**
 * P9 整体联调测试 -- Mock 数据填充 + 全流程集成测试
 *
 * 验证要点：
 *   1. Mock 数据层一致性（跨 JSON 文件的引用完整性）
 *   2. API 层全链路（所有模块的 API 调用正确返回）
 *   3. Store 层集成（多个 Store 协作场景）
 *   4. 页面路由联调（所有路由可解析）
 *   5. 管理员 CRUD 全流程
 *   6. 边界情况与异常处理
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// ==================== Mock 数据层 ====================
import { mockProblems, mockProblemDetailMap } from '../api/mock/problems'
import { mockContests, mockContestDetailMap } from '../api/mock/contests'
import { mockSolutions, getSolutionDetail } from '../api/mock/solutions'
import { mockBanners, mockAnnouncements } from '../api/mock/home'
import { mockAdminOverview, mockAdminEntries } from '../api/mock/admin'

// ==================== API 层 ====================
import { fetchBanners, fetchHomeContests, fetchAnnouncements, fetchAnnouncementDetail, fetchHomeSolutions } from '../api/home'
import { fetchProblems, fetchProblemDetail } from '../api/problems'
import { fetchContests, fetchContestDetail, fetchContestProblems, fetchContestRanking, fetchContestSubmissions } from '../api/contests'
import { fetchAllSolutions, fetchSolutionDetail, fetchSolutionsByProblem, voteSolution, postComment, postReply } from '../api/solutions'
import { submitCode, pollSubmissionStatus } from '../api/submissions'
import { login, register, fetchUserProfile } from '../api/users'
import {
  fetchAdminProblemDetail, createProblem, updateProblem, deleteProblem,
  createContest, updateContest, deleteContest,
  createAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncementPin,
  fetchAdminUsers, banUser, unbanUser,
} from '../api/admin'

// ==================== Stores ====================
import { useAuthStore } from '../stores/auth'
import { useProblemStore } from '../stores/problem'
import { useSolutionStore } from '../stores/solution'
import { useSubmitStore } from '../stores/submit'

// ==================== Types ====================
import type { Difficulty, ContestCategory, ContestType } from '../types'

// ==================== Route 配置 ====================

const dummyComponent = { template: '<div/>' }
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: dummyComponent },
  { path: '/problem', name: 'problem-list', component: dummyComponent },
  { path: '/problem/:id(\\d+)', name: 'problem-detail', component: dummyComponent },
  { path: '/problem/:id(\\d+)/solution', name: 'solution-list', component: dummyComponent },
  { path: '/solution', name: 'solution-plaza', component: dummyComponent },
  { path: '/solution/:id(\\d+)', name: 'solution-detail', component: dummyComponent },
  { path: '/contest', name: 'contest-list', component: dummyComponent },
  { path: '/contest/:id(\\d+)', name: 'contest-detail', component: dummyComponent },
  { path: '/user/:id(\\d+)', name: 'user-profile', component: dummyComponent },
  { path: '/login', name: 'login', component: dummyComponent },
  { path: '/register', name: 'register', component: dummyComponent },
  { path: '/announcement/:id(\\d+)', name: 'announcement-detail', component: dummyComponent },
  { path: '/admin', name: 'admin', component: dummyComponent, meta: { requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: dummyComponent },
]

// ==================== 第一层：Mock 数据完整性验证 ====================

describe('P9 第一层 -- Mock 数据完整性', () => {
  describe('题目数据 (problems.json)', () => {
    it('题目列表应包含 27 道题', () => {
      expect(mockProblems.length).toBe(27)
    })

    it('每道题结构完整', () => {
      for (const p of mockProblems) {
        expect(p.id).toBeGreaterThan(0)
        expect(p.title.length).toBeGreaterThan(0)
        expect(['entry', 'popularize', 'improve', 'provincial', 'NOI']).toContain(p.difficulty)
        expect(Array.isArray(p.tags)).toBe(true)
        expect(p.tags.length).toBeGreaterThan(0)
        expect(p.source).toBeTruthy()
        expect(p.timeLimit).toBeGreaterThan(0)
        expect(p.memoryLimit).toBeGreaterThan(0)
        expect(typeof p.acceptedCount).toBe('number')
        expect(typeof p.submissionCount).toBe('number')
        expect(typeof p.isPublic).toBe('boolean')
      }
    })

    it('覆盖所有 5 个难度等级', () => {
      const difficulties = new Set(mockProblems.map((p) => p.difficulty))
      for (const d of ['entry', 'popularize', 'improve', 'provincial', 'NOI'] as Difficulty[]) {
        expect(difficulties.has(d)).toBe(true)
      }
    })

    it('覆盖 4 种来源', () => {
      const sources = new Set(mockProblems.map((p) => p.source))
      for (const s of ['原创', '洛谷', 'Codeforces', 'AtCoder']) {
        expect(sources.has(s)).toBe(true)
      }
    })

    it('题目详情 Map 与列表标题一致', () => {
      for (const p of mockProblems) {
        const detail = mockProblemDetailMap[p.id]
        expect(detail).toBeDefined()
        expect(detail.id).toBe(p.id)
        expect(detail.title).toBe(p.title)
        expect(detail.description.length).toBeGreaterThan(0)
        expect(detail.inputFormat.length).toBeGreaterThan(0)
        expect(detail.outputFormat.length).toBeGreaterThan(0)
        expect(Array.isArray(detail.samples)).toBe(true)
        expect(detail.samples.length).toBeGreaterThan(0)
        expect(detail.hint.length).toBeGreaterThan(0)
      }
    })

    it('样例数据输入输出均为字符串', () => {
      for (const detail of Object.values(mockProblemDetailMap)) {
        for (const sample of detail.samples) {
          expect(typeof sample.input).toBe('string')
          expect(typeof sample.output).toBe('string')
        }
      }
    })
  })

  describe('比赛数据 (contests.json + 内联详情)', () => {
    it('比赛列表应包含 8 场比赛', () => {
      expect(mockContests.length).toBe(8)
    })

    it('覆盖 UPCOMING / RUNNING / ENDED 三种状态', () => {
      const statuses = new Set(mockContests.map((c) => c.status))
      expect(statuses.has('UPCOMING')).toBe(true)
      expect(statuses.has('RUNNING')).toBe(true)
      expect(statuses.has('ENDED')).toBe(true)
    })

    it('覆盖 OFFICIAL / PUBLIC / TEAM + IOI / ICPC / OI', () => {
      const categories = new Set(mockContests.map((c) => c.category))
      expect(categories.has('OFFICIAL')).toBe(true)
      expect(categories.has('PUBLIC')).toBe(true)
      expect(categories.has('TEAM')).toBe(true)

      const types = new Set(mockContests.map((c) => c.type))
      expect(types.has('IOI')).toBe(true)
      expect(types.has('ICPC')).toBe(true)
      expect(types.has('OI')).toBe(true)
    })

    it('每场比赛详情完整（描述+题目+排名）', () => {
      for (const c of mockContests) {
        const detail = mockContestDetailMap[c.id]
        expect(detail).toBeDefined()
        expect(detail.id).toBe(c.id)
        expect(detail.name).toBe(c.name)
        expect(detail.description.length).toBeGreaterThan(0)
        expect(Array.isArray(detail.problems)).toBe(true)
        expect(detail.problems.length).toBeGreaterThan(0)
        expect(Array.isArray(detail.ranking)).toBe(true)
      }
    })

    it('排名数据结构完整', () => {
      const runningDetail = mockContestDetailMap[3]
      expect(runningDetail.ranking.length).toBeGreaterThan(0)
      for (const rank of runningDetail.ranking) {
        expect(rank.rank).toBeGreaterThan(0)
        expect(rank.username.length).toBeGreaterThan(0)
        expect(Array.isArray(rank.scores)).toBe(true)
        expect(rank.scores.length).toBe(runningDetail.problems.length)
        expect(typeof rank.totalScore).toBe('number')
        expect(typeof rank.penalty).toBe('number')
      }
    })
  })

  describe('题解数据 (solutions.json + solution-details.json)', () => {
    it('题解列表应包含 10 条', () => {
      expect(mockSolutions.length).toBe(10)
    })

    it('所有题解详情都存在', () => {
      for (const sol of mockSolutions) {
        const detail = getSolutionDetail(sol.id)
        expect(detail).toBeDefined()
        expect(detail!.content.length).toBeGreaterThan(0)
        expect(typeof detail!.likeCount).toBe('number')
        expect(typeof detail!.dislikeCount).toBe('number')
        expect(Array.isArray(detail!.comments)).toBe(true)
      }
    })

    it('题解关联的题目存在于题库中', () => {
      const problemIds = new Set(mockProblems.map((p) => p.id))
      for (const sol of mockSolutions) {
        expect(problemIds.has(sol.problemId)).toBe(true)
      }
    })

    it('部分题解包含评论和回复', () => {
      let hasComments = false
      let hasReplies = false
      for (const sol of mockSolutions) {
        const detail = getSolutionDetail(sol.id)
        if (detail!.comments.length > 0) {
          hasComments = true
          for (const comment of detail!.comments) {
            if (comment.replies.length > 0) {
              hasReplies = true
              break
            }
          }
        }
        if (hasComments && hasReplies) break
      }
      expect(hasComments).toBe(true)
      expect(hasReplies).toBe(true)
    })
  })

  describe('首页数据 (banners.json + announcements.json)', () => {
    it('Banner 4 条，公告 6 条，有置顶', () => {
      expect(mockBanners.length).toBe(4)
      for (const b of mockBanners) {
        expect(b.id).toBeGreaterThan(0)
        expect(b.imageUrl.length).toBeGreaterThan(0)
        expect(b.title.length).toBeGreaterThan(0)
      }

      expect(mockAnnouncements.length).toBe(6)
      expect(mockAnnouncements.filter((a) => a.pinned).length).toBeGreaterThan(0)
    })
  })

  describe('管理员数据 (admin.json)', () => {
    it('概览 4 项 + 功能入口 4 模块', () => {
      expect(mockAdminOverview.length).toBe(4)
      for (const o of mockAdminOverview) {
        expect(o.label.length).toBeGreaterThan(0)
        expect(typeof o.value).toBe('number')
      }

      expect(mockAdminEntries.length).toBe(4)
      const keys = mockAdminEntries.map((e) => e.key)
      expect(keys).toContain('problems')
      expect(keys).toContain('contests')
      expect(keys).toContain('announcements')
      expect(keys).toContain('users')
    })
  })
})

// ==================== 第二层：API 全链路验证 ====================

describe('P9 第二层 -- API 全链路', { timeout: 30000 }, () => {
  describe('首页 API', () => {
    it('五个首页 API 均正常返回', async () => {
      expect((await fetchBanners()).code).toBe(200)
      expect((await fetchHomeContests(5)).code).toBe(200)
      expect((await fetchAnnouncements()).code).toBe(200)
      expect((await fetchHomeSolutions(5)).code).toBe(200)
    })

    it('fetchAnnouncementDetail 正反案例', async () => {
      expect((await fetchAnnouncementDetail(1)).code).toBe(200)
      expect((await fetchAnnouncementDetail(999)).code).toBe(404)
    })
  })

  describe('题目 API', () => {
    it('筛选+排序+分页全组合', async () => {
      // 无筛选
      const all = await fetchProblems({ page: 1, size: 50 })
      expect(all.data.total).toBe(27)

      // 组合筛选
      const filtered = await fetchProblems({ page: 1, size: 50, difficulty: 'improve', tags: 'DP', keyword: '背包' })
      expect(filtered.data.total).toBeGreaterThanOrEqual(1)

      // 排序
      const sorted = await fetchProblems({ page: 1, size: 10, sortField: 'id', sortOrder: 'descend' })
      for (let i = 1; i < sorted.data.data.length; i++) {
        expect(sorted.data.data[i].id).toBeLessThan(sorted.data.data[i - 1].id)
      }

      // 分页不重复
      const p1 = await fetchProblems({ page: 1, size: 5 })
      const p2 = await fetchProblems({ page: 2, size: 5 })
      const p1Ids = new Set(p1.data.data.map((p) => p.id))
      for (const p of p2.data.data) {
        expect(p1Ids.has(p.id)).toBe(false)
      }
    })

    it('fetchProblemDetail 返回完整详情', async () => {
      const res = await fetchProblemDetail(1003)
      expect(res.code).toBe(200)
      expect(res.data!.description).toContain('##')
      expect(res.data!.samples.length).toBeGreaterThan(0)
    })
  })

  describe('比赛 API', () => {
    it('状态筛选 + 详情 + 子资源', async () => {
      expect((await fetchContests('UPCOMING')).data.data.every((c) => c.status === 'UPCOMING')).toBe(true)
      expect((await fetchContests('RUNNING')).data.data.every((c) => c.status === 'RUNNING')).toBe(true)
      expect((await fetchContests('ENDED')).data.data.every((c) => c.status === 'ENDED')).toBe(true)
      expect((await fetchContests('all')).data.total).toBe(8)
    })

    it('fetchContestDetail + Problems + Ranking + Submissions', async () => {
      const detail = await fetchContestDetail(3)
      expect(detail.code).toBe(200)
      expect(detail.data!.problems.length).toBe(4)

      const problems = await fetchContestProblems(3)
      expect(problems.data.length).toBe(4)

      const ranking = await fetchContestRanking(3)
      expect(ranking.data.length).toBeGreaterThan(0)

      const subs = await fetchContestSubmissions(3)
      expect(subs.data.length).toBeGreaterThan(0)
    })
  })

  describe('题解 API', () => {
    it('全站广场 + 按题目过滤', async () => {
      expect((await fetchAllSolutions({ page: 1, size: 20 })).data.total).toBe(10)
      expect((await fetchSolutionsByProblem({ problemId: 1001, page: 1, size: 10 })).data.data.every((s) => s.problemId === 1001)).toBe(true)
    })

    it('点赞 -> 评论 -> 回复 全流程', async () => {
      const detail = getSolutionDetail(3)!
      const beforeLike = detail.likeCount

      const voteRes = await voteSolution(3, 'like')
      // 点赞后 likeCount 应增加
      expect(voteRes.data!.likeCount).toBeGreaterThanOrEqual(beforeLike + 1)

      const comment = await postComment(3, 'P9 集成测试评论')
      expect(comment.data!.content).toBe('P9 集成测试评论')

      const reply = await postReply(3, comment.data!.id, 'P9 回复')
      expect(reply.data!.content).toBe('P9 回复')
    })
  })

  describe('提交判题 API', () => {
    it('提交 -> 轮询 -> 终态', async () => {
      const sub = await submitCode(1001, '// @judge: AC', 'C++17')
      expect(sub.data.status).toBe('PENDING')

      let status = sub.data.status
      const terminal = new Set(['AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'SE'])
      for (let i = 0; i < 10; i++) {
        const r = await pollSubmissionStatus(sub.data.id)
        status = r.data.status
        if (terminal.has(status)) break
      }
      expect(status).toBe('AC')
    })
  })

  describe('用户 API', () => {
    it('登录 + 注册 + 用户主页', async () => {
      const loginOk = await login('tourist', '123456')
      expect(loginOk.code).toBe(200)
      expect(loginOk.data!.user.username).toBe('tourist')

      const loginFail = await login('tourist', 'wrong')
      expect(loginFail.code).toBe(401)

      const regOk = await register('P9TestUser', 'p9@test.com', '123456')
      expect(regOk.code).toBe(200)

      const regFail = await register('tourist', 'dup@test.com', '123456')
      expect(regFail.code).toBe(400)

      const profile = await fetchUserProfile(1)
      expect(profile.data!.recentAC).toBeDefined()
      expect(profile.data!.contestHistory.length).toBeGreaterThan(0)
    })
  })

  describe('管理员 API -- CRUD', { timeout: 30000 }, () => {
    describe('题目 CRUD', () => {
      let pid: number

      it('新建', async () => {
        const r = await createProblem({ title: 'P9-CRUD-题目', difficulty: 'entry' as Difficulty, tags: ['test'], source: '原创', timeLimit: 1000, memoryLimit: 128, description: '# Test', inputFormat: 'in', outputFormat: 'out', samples: [], hint: '# Hint', isPublic: true })
        expect(r.code).toBe(200)
        pid = r.data.id
      })

      it('读取并更新', async () => {
        await updateProblem(pid, { title: 'P9-CRUD-题目v2', difficulty: 'popularize' as Difficulty, tags: ['DP'], source: '洛谷', timeLimit: 2000, memoryLimit: 256, description: '# v2', inputFormat: 'in2', outputFormat: 'out2', samples: [], hint: '# h2', isPublic: false })
        const d = await fetchAdminProblemDetail(pid)
        expect(d.data!.title).toBe('P9-CRUD-题目v2')
        expect(d.data!.difficulty).toBe('popularize')
      })

      it('删除', async () => {
        await deleteProblem(pid)
        expect((await fetchAdminProblemDetail(pid)).code).toBe(404)
      })
    })

    describe('比赛 CRUD', () => {
      let cid: number

      it('新建', async () => {
        const r = await createContest({ name: 'P9-CRUD-比赛', category: 'PUBLIC' as ContestCategory, type: 'IOI' as ContestType, rated: true, startTime: '2026-07-01T10:00:00Z', endTime: '2026-07-01T18:00:00Z', organizer: 'P9', description: '# Rules', problems: [{ id: 1001, order: 1, title: 'A+B', difficulty: 'entry' as Difficulty, acceptedCount: 0, submissionCount: 0 }] })
        expect(r.code).toBe(200)
        cid = r.data.id
      })

      it('更新并删除', async () => {
        await updateContest(cid, { name: 'P9-CRUD-比赛v2', category: 'OFFICIAL' as ContestCategory, type: 'ICPC' as ContestType, rated: false, startTime: '2026-07-02T10:00:00Z', endTime: '2026-07-02T18:00:00Z', organizer: 'P9v2', description: '# v2', problems: [{ id: 1001, order: 1, title: 'A+B', difficulty: 'entry' as Difficulty, acceptedCount: 0, submissionCount: 0 }] })
        expect((await fetchContestDetail(cid)).data!.type).toBe('ICPC')

        await deleteContest(cid)
        expect((await fetchContestDetail(cid)).code).toBe(404)
      })
    })

    describe('公告 CRUD', () => {
      let aid: number

      it('新建 + 更新 + 切换置顶 + 删除', async () => {
        const r = await createAnnouncement({ title: 'P9-CRUD-公告', content: 'content', pinned: true })
        expect(r.data!.pinned).toBe(true)
        aid = r.data.id

        await updateAnnouncement(aid, { title: 'P9-CRUD-公告v2', content: 'v2', pinned: false })
        expect((await toggleAnnouncementPin(aid)).data!.pinned).toBe(true)

        await deleteAnnouncement(aid)
        expect((await fetchAnnouncementDetail(aid)).code).toBe(404)
      })
    })

    describe('用户管理', () => {
      it('封禁/解封 + 列表显示', async () => {
        expect((await banUser(7)).code).toBe(200)
        const afterBan = await fetchAdminUsers({ page: 1, size: 20 })
        expect(afterBan.data.data.find((u) => u.id === 7)!.banned).toBe(true)

        expect((await unbanUser(7)).code).toBe(200)
        const afterUnban = await fetchAdminUsers({ page: 1, size: 20 })
        expect(afterUnban.data.data.find((u) => u.id === 7)!.banned).toBe(false)

        expect((await banUser(99999)).code).toBe(404)
      })
    })
  })
})

// ==================== 第三层：Store 集成 ====================

describe('P9 第三层 -- Store 集成', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('useAuthStore', () => {
    it('登录 -> 验证 isAdmin -> 登出', async () => {
      const auth = useAuthStore()
      expect(auth.isLoggedIn).toBe(false)

      await auth.login('tourist', '123456')
      expect(auth.isLoggedIn).toBe(true)
      expect(auth.isAdmin).toBe(false)

      auth.logout()
      expect(auth.isLoggedIn).toBe(false)
    })

    it('管理员登录 isAdmin 为 true', async () => {
      const auth = useAuthStore()
      await auth.login('AC_Automaton', '123456')
      expect(auth.isAdmin).toBe(true)
    })

    it('initFromStorage 恢复 session', () => {
      const auth = useAuthStore()
      localStorage.setItem('token', 'mock-token-1-123')
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'tourist', avatarUrl: '', signature: '', role: 'USER', createdAt: '2024-01-01', acceptedCount: 0, submissionCount: 0 }))
      auth.initFromStorage()
      expect(auth.isLoggedIn).toBe(true)
      localStorage.clear()
    })
  })

  describe('useProblemStore', () => {
    it('fetchProblems + setFilters + updateSorter', async () => {
      const store = useProblemStore()
      await store.fetchProblems()
      expect(store.problemList.length).toBeGreaterThan(0)

      store.setFilters({ keyword: '背包', difficulty: ['improve'], tags: ['DP'] })
      await store.fetchProblems()
      expect(store.problemList.length).toBeGreaterThan(0)

      store.updateSorter('difficulty', 'ascend')
      await store.fetchProblems()
      expect(store.sorter.columnKey).toBe('difficulty')
    })

    it('fetchProblemDetail 加载和不存在的处理', async () => {
      const store = useProblemStore()
      await store.fetchProblemDetail(1001)
      expect(store.currentProblem!.id).toBe(1001)

      await store.fetchProblemDetail(99999)
      expect(store.detailError).toBe('题目未找到')
    })
  })

  describe('useSolutionStore', () => {
    it('fetchList + fetchAllList + keyword 搜索', async () => {
      const store = useSolutionStore()
      await store.fetchList(1001)
      expect(store.list.length).toBeGreaterThan(0)

      await store.fetchAllList()
      expect(store.allList.length).toBe(10)

      await store.fetchAllList('线段树')
      expect(store.allList.every((s) => s.title.includes('线段树') || s.problemTitle.includes('线段树'))).toBe(true)
    })

    it('fetchDetail -> vote -> submitComment -> submitReply', async () => {
      const store = useSolutionStore()
      await store.fetchDetail(5)
      expect(store.current).not.toBeNull()

      await store.vote('like')

      const prevCount = store.current!.comments.length
      await store.submitComment('Store 测试评论')
      expect(store.current!.comments.length).toBe(prevCount + 1)

      const newComment = store.current!.comments[store.current!.comments.length - 1]
      await store.submitReply(newComment.id, 'Store 测试回复')
      expect(newComment.replies.length).toBe(1)
    })
  })

  describe('useSubmitStore', () => {
    it('submit 提交并最终到达终态', async () => {
      const store = useSubmitStore()
      await store.submit(1001, '// @judge: AC', 'C++17')
      expect(store.currentSubmission).not.toBeNull()
      store.stopPolling()

      // 手动轮询
      for (let i = 0; i < 10; i++) {
        const r = await pollSubmissionStatus(store.currentSubmission!.id)
        store.currentSubmission = r.data
        if (store.isFinalStatus) break
      }
      expect(store.isFinalStatus).toBe(true)
      expect(store.isAccepted).toBe(true)
    })
  })
})

// ==================== 第四层：页面路由联调 ====================

describe('P9 第四层 -- 页面路由联调', () => {
  it('所有 13 个路由名称均已正确注册', () => {
    setActivePinia(createPinia())
    const router = createRouter({ history: createMemoryHistory(), routes })
    const expected = ['home', 'problem-list', 'problem-detail', 'solution-list', 'solution-plaza', 'solution-detail', 'contest-list', 'contest-detail', 'login', 'register', 'user-profile', 'announcement-detail', 'not-found']
    const registered = new Set(router.getRoutes().map((r) => r.name))
    for (const name of expected) {
      expect(registered.has(name)).toBe(true)
    }
  })

  it('路由路径正确解析到对应名称', () => {
    setActivePinia(createPinia())
    const router = createRouter({ history: createMemoryHistory(), routes })

    const testCases: [string, string][] = [
      ['/', 'home'],
      ['/problem', 'problem-list'],
      ['/problem/1001', 'problem-detail'],
      ['/problem/1001/solution', 'solution-list'],
      ['/solution', 'solution-plaza'],
      ['/solution/1', 'solution-detail'],
      ['/contest', 'contest-list'],
      ['/contest/3', 'contest-detail'],
      ['/login', 'login'],
      ['/register', 'register'],
      ['/user/1', 'user-profile'],
      ['/announcement/1', 'announcement-detail'],
    ]
    for (const [path, expectedName] of testCases) {
      const resolved = router.resolve(path)
      expect(resolved.name).toBe(expectedName)
    }
  })
})

// ==================== 第五层：边界情况与异常 ====================

describe('P9 第五层 -- 边界情况与异常处理', { timeout: 30000 }, () => {
  it('不存在的资源全部返回 404', async () => {
    expect((await fetchProblemDetail(99999)).code).toBe(404)
    expect((await fetchContestDetail(99999)).code).toBe(404)
    expect((await fetchSolutionDetail(99999)).code).toBe(404)
    expect((await fetchUserProfile(99999)).code).toBe(404)
  })

  it('不存在的比赛子资源返回空数组', async () => {
    expect((await fetchContestProblems(99999)).data).toHaveLength(0)
    expect((await fetchContestRanking(99999)).data).toHaveLength(0)
    expect((await fetchContestSubmissions(99999)).data).toHaveLength(0)
  })

  it('空/无效输入返回合适状态', async () => {
    expect((await fetchProblems({ page: 1, size: 50, keyword: '' })).data.total).toBe(27)
    expect((await fetchProblems({ page: 1, size: 50, keyword: 'XYZ不存在' })).data.total).toBe(0)
    expect((await postComment(1, '   ')).code).toBe(400)
    expect((await postReply(1, 101, '   ')).code).toBe(400)
    expect((await login('NonExistentUser', '123456')).code).toBe(401)
  })

  it('分页边界', async () => {
    expect((await fetchProblems({ page: 999, size: 20 })).data.data).toHaveLength(0)
    expect((await fetchProblems({ page: 1, size: 0 })).data.data).toHaveLength(0)
    expect((await fetchProblems({ page: 1, size: 100 })).data.data.length).toBe(27)
  })
})
