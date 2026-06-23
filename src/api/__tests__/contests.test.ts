/**
 * 比赛 API 测试
 */
import { describe, it, expect } from 'vitest'
import {
  fetchContests,
  fetchContestDetail,
  fetchContestProblems,
  fetchContestRanking,
  fetchContestSubmissions,
} from '../contests'

describe('Contest API', () => {
  describe('fetchContests', () => {
    it('应该返回全部比赛列表', async () => {
      const res = await fetchContests()
      expect(res.code).toBe(200)
      expect(res.data.data.length).toBeGreaterThan(0)
      expect(res.data.total).toBeGreaterThan(0)
    })

    it('应该支持状态筛选', async () => {
      const res = await fetchContests('RUNNING')
      expect(res.code).toBe(200)
      for (const contest of res.data.data) {
        expect(contest.status).toBe('RUNNING')
      }
    })

    it('all状态返回全部', async () => {
      const res = await fetchContests('all')
      expect(res.code).toBe(200)
      expect(res.data.data.length).toBeGreaterThan(0)
    })

    it('应该支持分页', async () => {
      const res = await fetchContests(undefined, 1, 3)
      expect(res.code).toBe(200)
      expect(res.data.data.length).toBeLessThanOrEqual(3)
      expect(res.data.page).toBe(1)
      expect(res.data.size).toBe(3)
    })

    it('UPCOMING筛选只返回未开始比赛', async () => {
      const res = await fetchContests('UPCOMING')
      for (const contest of res.data.data) {
        expect(contest.status).toBe('UPCOMING')
      }
    })

    it('ENDED筛选只返回已结束比赛', async () => {
      const res = await fetchContests('ENDED')
      for (const contest of res.data.data) {
        expect(contest.status).toBe('ENDED')
      }
    })

    it('按开始时间倒序排列', async () => {
      const res = await fetchContests()
      const contests = res.data.data
      for (let i = 0; i < contests.length - 1; i++) {
        expect(
          new Date(contests[i].startTime).getTime(),
        ).toBeGreaterThanOrEqual(
          new Date(contests[i + 1].startTime).getTime(),
        )
      }
    })
  })

  describe('fetchContestDetail', () => {
    it('应该返回存在的比赛详情', async () => {
      const res = await fetchContestDetail(3)
      expect(res.code).toBe(200)
      expect(res.data).not.toBeNull()
      expect(res.data!.name).toBe('周赛 #55 — 图论与搜索')
      expect(res.data!.problems).toBeDefined()
      expect(res.data!.ranking).toBeDefined()
      expect(res.data!.description).toBeDefined()
    })

    it('不存在的比赛返回null', async () => {
      const res = await fetchContestDetail(999)
      expect(res.code).toBe(404)
      expect(res.data).toBeNull()
    })

    it('返回比赛包含完整信息', async () => {
      const res = await fetchContestDetail(4)
      expect(res.data!.category).toBeDefined()
      expect(res.data!.type).toBeDefined()
      expect(res.data!.status).toBeDefined()
      expect(res.data!.startTime).toBeDefined()
      expect(res.data!.endTime).toBeDefined()
      expect(res.data!.organizer).toBeDefined()
    })

    it('返回比赛包含题目列表', async () => {
      const res = await fetchContestDetail(5)
      expect(res.data!.problems.length).toBeGreaterThan(0)
      expect(res.data!.problems[0].title).toBeDefined()
      expect(res.data!.problems[0].difficulty).toBeDefined()
    })

    it('返回比赛包含排名数据', async () => {
      const res = await fetchContestDetail(4)
      expect(res.data!.ranking.length).toBeGreaterThan(0)
      expect(res.data!.ranking[0].rank).toBeDefined()
      expect(res.data!.ranking[0].username).toBeDefined()
    })
  })

  describe('fetchContestProblems', () => {
    it('应该返回比赛题目列表', async () => {
      const res = await fetchContestProblems(3)
      expect(res.code).toBe(200)
      expect(res.data.length).toBeGreaterThan(0)
      expect(res.data[0].id).toBeDefined()
      expect(res.data[0].title).toBeDefined()
      expect(res.data[0].difficulty).toBeDefined()
    })

    it('不存在的比赛返回空数组', async () => {
      const res = await fetchContestProblems(999)
      expect(res.code).toBe(200)
      expect(res.data).toEqual([])
    })

    it('题目按order排序', async () => {
      const res = await fetchContestProblems(4)
      for (let i = 0; i < res.data.length - 1; i++) {
        expect(res.data[i].order).toBeLessThan(res.data[i + 1].order)
      }
    })
  })

  describe('fetchContestRanking', () => {
    it('应该返回排名数据', async () => {
      const res = await fetchContestRanking(3)
      expect(res.code).toBe(200)
      expect(res.data.length).toBeGreaterThan(0)
      expect(res.data[0].rank).toBe(1)
    })

    it('已结束的比赛有排名数据', async () => {
      const res = await fetchContestRanking(4)
      expect(res.code).toBe(200)
      expect(res.data.length).toBeGreaterThan(0)
    })

    it('未开始的比赛排名为空', async () => {
      const res = await fetchContestRanking(1)
      expect(res.code).toBe(200)
      expect(res.data).toEqual([])
    })

    it('排名记录包含必要字段', async () => {
      const res = await fetchContestRanking(3)
      const record = res.data[0]
      expect(record.userId).toBeDefined()
      expect(record.username).toBeDefined()
      expect(record.scores).toBeInstanceOf(Array)
      expect(record.totalScore).toBeDefined()
    })
  })

  describe('fetchContestSubmissions', () => {
    it('应该返回提交记录', async () => {
      const res = await fetchContestSubmissions(3)
      expect(res.code).toBe(200)
      expect(res.data.length).toBeGreaterThan(0)
    })

    it('提交记录包含完整字段', async () => {
      const res = await fetchContestSubmissions(3)
      const sub = res.data[0]
      expect(sub.id).toBeDefined()
      expect(sub.problemId).toBeDefined()
      expect(sub.language).toBeDefined()
      expect(sub.status).toBeDefined()
      expect(sub.createdAt).toBeDefined()
    })

    it('无提交记录的比赛返回空数组', async () => {
      const res = await fetchContestSubmissions(1)
      expect(res.code).toBe(200)
      expect(res.data).toEqual([])
    })
  })
})
