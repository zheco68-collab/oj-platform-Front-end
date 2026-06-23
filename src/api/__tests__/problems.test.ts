/**
 * 题目 API 测试
 */
import { describe, it, expect } from 'vitest'
import { fetchProblems, fetchProblemDetail } from '../problems'

describe('fetchProblems', () => {
  it('返回分页结果', async () => {
    const res = await fetchProblems({ page: 1, size: 10 })
    expect(res.code).toBe(200)
    expect(res.data.data.length).toBeGreaterThan(0)
    expect(res.data.data.length).toBeLessThanOrEqual(10)
    expect(res.data.total).toBeGreaterThan(0)
  })

  it('关键词过滤（模糊匹配标题）', async () => {
    const res = await fetchProblems({ page: 1, size: 50, keyword: '背包' })
    expect(res.data.total).toBeGreaterThan(0)
    res.data.data.forEach((p) => {
      expect(p.title).toContain('背包')
    })
  })

  it('按编号搜索', async () => {
    const res = await fetchProblems({ page: 1, size: 50, keyword: 'P1001' })
    expect(res.data.total).toBe(1)
    expect(res.data.data[0].id).toBe(1001)
  })

  it('难度过滤', async () => {
    const res = await fetchProblems({ page: 1, size: 50, difficulty: 'entry' })
    expect(res.data.total).toBeGreaterThan(0)
    res.data.data.forEach((p) => {
      expect(p.difficulty).toBe('entry')
    })
  })

  it('多难度过滤（OR）', async () => {
    const res = await fetchProblems({
      page: 1,
      size: 50,
      difficulty: 'entry,popularize',
    })
    res.data.data.forEach((p) => {
      expect(['entry', 'popularize']).toContain(p.difficulty)
    })
  })

  it('标签过滤（AND 匹配）', async () => {
    const res = await fetchProblems({ page: 1, size: 50, tags: 'DP,math' })
    res.data.data.forEach((p) => {
      const tagSet = new Set(p.tags.map((t) => t.toLowerCase()))
      expect(tagSet.has('dp')).toBe(true)
      expect(tagSet.has('math')).toBe(true)
    })
  })

  it('来源过滤', async () => {
    const res = await fetchProblems({ page: 1, size: 50, source: '洛谷' })
    expect(res.data.total).toBeGreaterThan(0)
    res.data.data.forEach((p) => {
      expect(p.source).toBe('洛谷')
    })
  })

  it('返回空列表当无匹配结果', async () => {
    const res = await fetchProblems({ page: 1, size: 50, keyword: '不存在的题目XYZ123' })
    expect(res.code).toBe(200)
    expect(res.data.total).toBe(0)
    expect(res.data.data).toHaveLength(0)
  })

  it('分页参数正确', async () => {
    const res = await fetchProblems({ page: 2, size: 5 })
    expect(res.data.page).toBe(2)
    expect(res.data.size).toBe(5)
    expect(res.data.data.length).toBeLessThanOrEqual(5)
  })

  it('排序按 ID 升序', async () => {
    const res = await fetchProblems({ page: 1, size: 10, sortField: 'id', sortOrder: 'ascend' })
    for (let i = 1; i < res.data.data.length; i++) {
      expect(res.data.data[i].id).toBeGreaterThan(res.data.data[i - 1].id)
    }
  })

  it('排序按 ID 降序', async () => {
    const res = await fetchProblems({ page: 1, size: 10, sortField: 'id', sortOrder: 'descend' })
    for (let i = 1; i < res.data.data.length; i++) {
      expect(res.data.data[i].id).toBeLessThan(res.data.data[i - 1].id)
    }
  })
})

describe('fetchProblemDetail', () => {
  it('返回题目详情', async () => {
    const res = await fetchProblemDetail(1001)
    expect(res.code).toBe(200)
    expect(res.data).not.toBeNull()
    expect(res.data!.id).toBe(1001)
    expect(res.data!.title).toBe('A + B 问题')
    expect(res.data!.description).toBeTruthy()
    expect(res.data!.inputFormat).toBeTruthy()
    expect(res.data!.outputFormat).toBeTruthy()
    expect(res.data!.samples.length).toBeGreaterThan(0)
  })

  it('返回 404 当 ID 不存在', async () => {
    const res = await fetchProblemDetail(99999)
    expect(res.code).toBe(404)
    expect(res.data).toBeNull()
  })

  it('详情包含提示和标签', async () => {
    const res = await fetchProblemDetail(1001)
    expect(res.data!.hint).toBeTruthy()
    expect(res.data!.tags).toContain('math')
  })

  it('详情包含样例输入输出', async () => {
    const res = await fetchProblemDetail(1001)
    const sample = res.data!.samples[0]
    expect(sample.input).toBeTruthy()
    expect(sample.output).toBeTruthy()
  })
})
