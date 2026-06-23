/**
 * 提交 Store 测试
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { createTestPinia } from '../../test/helpers'
import { useSubmitStore } from '../submit'

// Mock API 模块
vi.mock('../../api/submissions', () => {
  let counter = 0
  const submissions = new Map<string, { id: string; problemId: number; status: string; language: string; code: string }>()
  const pollCounts = new Map<string, number>()

  return {
    submitCode: vi.fn(async (problemId: number, code: string, language: string) => {
      counter++
      const id = `SUB-${String(counter).padStart(3, '0')}`
      const sub = { id, problemId, status: 'PENDING', language, code }
      submissions.set(id, sub)
      pollCounts.set(id, 0)
      return {
        code: 200,
        message: 'ok',
        data: { ...sub, createdAt: new Date().toISOString() },
      }
    }),

    pollSubmissionStatus: vi.fn(async (submissionId: string) => {
      const sub = submissions.get(submissionId)
      if (!sub) return { code: 404, message: 'not found', data: null }

      const count = (pollCounts.get(submissionId) ?? 0) + 1
      pollCounts.set(submissionId, count)

      if (count === 1) {
        sub.status = 'PENDING'
      } else if (count <= 3) {
        sub.status = 'RUNNING'
      } else {
        sub.status = 'AC'
      }

      return {
        code: 200,
        message: 'ok',
        data: { ...sub, time: count > 3 ? 42 : undefined, memory: count > 3 ? 10240 : undefined, createdAt: new Date().toISOString() },
      }
    }),
  }
})

describe('useSubmitStore', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初始化时有正确的默认值', () => {
    const store = useSubmitStore()
    expect(store.currentSubmission).toBeNull()
    expect(store.isSubmitting).toBe(false)
    expect(store.submitError).toBeNull()
    expect(store.isPolling).toBe(false)
    expect(store.isFinalStatus).toBe(false)
    expect(store.isAccepted).toBe(false)
    expect(store.submissionHistory).toEqual([])
  })

  it('submit 提交代码并开始轮询', async () => {
    vi.useFakeTimers()
    const store = useSubmitStore()

    const submitPromise = store.submit(1001, 'int main(){}', 'C++')
    expect(store.isSubmitting).toBe(true)
    await submitPromise
    expect(store.isSubmitting).toBe(false)

    // 应该有当前提交
    expect(store.currentSubmission).not.toBeNull()
    expect(store.currentSubmission!.id).toMatch(/^SUB-/)
    expect(store.currentSubmission!.status).toBe('PENDING')

    // 提交记录应该加入历史
    expect(store.submissionHistory.length).toBe(1)

    // 轮询应该已启动
    expect(store.isPolling).toBe(true)

    vi.useRealTimers()
  })

  it('轮询推进状态至 RUNNING', async () => {
    vi.useFakeTimers()
    const store = useSubmitStore()

    await store.submit(1001, 'int main(){}', 'C++')

    // 推进定时器（第一次 poll 已立即执行 → PENDING）
    // 推进 1s → 第二次 poll → RUNNING
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(store.currentSubmission!.status).toBe('RUNNING')
    expect(store.isFinalStatus).toBe(false)

    vi.useRealTimers()
  })

  it('轮询推进到终态后自动停止', async () => {
    vi.useFakeTimers()
    const store = useSubmitStore()

    await store.submit(1001, 'int main(){}', 'C++')
    // 初始 → immediately poll → PENDING
    // +1s → RUNNING
    // +1s → RUNNING
    // +1s → AC (终态)
    await vi.advanceTimersByTimeAsync(1000) // → RUNNING
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000) // → RUNNING (还在中间状态)
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000) // → AC
    await flushPromises()

    expect(store.currentSubmission!.status).toBe('AC')
    expect(store.isFinalStatus).toBe(true)
    expect(store.isAccepted).toBe(true)
    // 到达终态后应停止轮询
    expect(store.isPolling).toBe(false)

    vi.useRealTimers()
  })

  it('stopPolling 停止轮询', async () => {
    vi.useFakeTimers()
    const store = useSubmitStore()

    await store.submit(1001, 'int main(){}', 'C++')
    expect(store.isPolling).toBe(true)

    store.stopPolling()
    expect(store.isPolling).toBe(false)

    vi.useRealTimers()
  })

  it('clearCurrent 清除当前提交但保留历史', async () => {
    vi.useFakeTimers()
    const store = useSubmitStore()

    await store.submit(1001, 'int main(){}', 'C++')
    expect(store.submissionHistory.length).toBe(1)

    store.clearCurrent()
    expect(store.currentSubmission).toBeNull()
    expect(store.submitError).toBeNull()
    expect(store.isPolling).toBe(false)
    // 历史记录应保留
    expect(store.submissionHistory.length).toBe(1)

    vi.useRealTimers()
  })

  it('getHistoryForProblem 筛选特定题目的提交', async () => {
    vi.useFakeTimers()
    const store = useSubmitStore()

    await store.submit(1001, 'code1', 'C++')
    store.clearCurrent()
    await store.submit(1002, 'code2', 'C++')
    store.clearCurrent()
    await store.submit(1001, 'code3', 'Python3')

    const p1001 = store.getHistoryForProblem(1001)
    expect(p1001.length).toBe(2)

    const p1002 = store.getHistoryForProblem(1002)
    expect(p1002.length).toBe(1)

    vi.useRealTimers()
  })

  it('updateStatus 手动更新状态', async () => {
    vi.useFakeTimers()
    const store = useSubmitStore()

    await store.submit(1001, 'code', 'C++')
    store.updateStatus('WA')
    expect(store.currentSubmission!.status).toBe('WA')
    // 历史记录也应更新
    expect(store.submissionHistory[0].status).toBe('WA')

    vi.useRealTimers()
  })
})
