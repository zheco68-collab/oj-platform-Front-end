import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JudgeStatus, Submission } from '../types'
import { submitCode, pollSubmissionStatus } from '../api/submissions'

/** 终态集合 — 这些状态下停止轮询 */
const FINAL_STATUSES: Set<JudgeStatus> = new Set([
  'AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'SE',
])

export const useSubmitStore = defineStore('submit', () => {
  // ==================== 当前提交状态 ====================
  const currentSubmission = ref<Submission | null>(null)
  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)
  const pollingTimer = ref<ReturnType<typeof setInterval> | null>(null)
  const pollingCount = ref(0)

  // ==================== 历史提交记录 ====================
  const submissionHistory = ref<Submission[]>([])

  // ==================== 计算属性 ====================
  const isPolling = computed(() => pollingTimer.value !== null)
  const isFinalStatus = computed(() => {
    if (!currentSubmission.value) return false
    return FINAL_STATUSES.has(currentSubmission.value.status)
  })
  const isAccepted = computed(() => currentSubmission.value?.status === 'AC')

  // ==================== 提交操作 ====================
  async function submit(problemId: number, code: string, language: string): Promise<void> {
    // 提交前清理旧状态
    stopPolling()
    submitError.value = null
    isSubmitting.value = true
    currentSubmission.value = null

    try {
      const res = await submitCode(problemId, code, language)
      currentSubmission.value = res.data
      // 将提交记录加入历史
      submissionHistory.value.unshift(res.data)
      // 开始轮询
      startPolling(res.data.id)
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : '提交失败'
    } finally {
      isSubmitting.value = false
    }
  }

  // ==================== 轮询操作 ====================
  function startPolling(submissionId: string): void {
    stopPolling()
    pollingCount.value = 0

    // 立即执行第一次轮询
    pollOnce(submissionId)

    // 每隔 1 秒轮询一次
    pollingTimer.value = setInterval(() => {
      pollOnce(submissionId)
    }, 1000)
  }

  async function pollOnce(submissionId: string): Promise<void> {
    // 如果已经是终态，停止轮询
    if (currentSubmission.value && FINAL_STATUSES.has(currentSubmission.value.status)) {
      stopPolling()
      return
    }

    try {
      pollingCount.value++
      const res = await pollSubmissionStatus(submissionId)
      if (res.code === 200 && res.data) {
        currentSubmission.value = res.data

        // 更新历史记录中的对应提交
        const historyIdx = submissionHistory.value.findIndex((s) => s.id === submissionId)
        if (historyIdx >= 0) {
          submissionHistory.value[historyIdx] = res.data
        }

        // 到达终态时停止轮询
        if (FINAL_STATUSES.has(res.data.status)) {
          stopPolling()
        }
      }
    } catch {
      // 轮询失败不中断，继续重试（最多由轮询间隔控制）
    }
  }

  function stopPolling(): void {
    if (pollingTimer.value !== null) {
      clearInterval(pollingTimer.value)
      pollingTimer.value = null
    }
  }

  // ==================== 状态更新 ====================
  function updateStatus(status: JudgeStatus): void {
    if (currentSubmission.value) {
      currentSubmission.value.status = status
    }
    // 同步更新历史记录
    const sid = currentSubmission.value?.id
    if (sid) {
      const idx = submissionHistory.value.findIndex((s) => s.id === sid)
      if (idx >= 0) {
        submissionHistory.value[idx].status = status
      }
    }
  }

  /** 清空当前提交状态（但不影响历史记录） */
  function clearCurrent(): void {
    stopPolling()
    currentSubmission.value = null
    submitError.value = null
    pollingCount.value = 0
  }

  /** 获取某道题的提交历史 */
  function getHistoryForProblem(problemId: number): Submission[] {
    return submissionHistory.value.filter((s) => s.problemId === problemId)
  }

  return {
    // 状态
    currentSubmission,
    isSubmitting,
    submitError,
    pollingTimer,
    pollingCount,
    submissionHistory,
    // 计算属性
    isPolling,
    isFinalStatus,
    isAccepted,
    // 操作
    submit,
    startPolling,
    stopPolling,
    updateStatus,
    clearCurrent,
    getHistoryForProblem,
  }
})
