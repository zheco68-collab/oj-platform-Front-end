import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { JudgeStatus, Submission } from '../types'

export const useSubmitStore = defineStore('submit', () => {
  const currentSubmission = ref<Submission | null>(null)
  const isSubmitting = ref(false)
  const pollingTimer = ref<ReturnType<typeof setInterval> | null>(null)

  function submit(_problemId: number, _code: string, _language: string): Promise<void> {
    // TODO: 对接真实提交 API
    isSubmitting.value = true
    return Promise.resolve()
  }

  function startPolling(_submissionId: string): void {
    // TODO: 轮询判题结果
    stopPolling()
    pollingTimer.value = setInterval(() => {
      // GET /api/submission/:submissionId/status
    }, 1000)
  }

  function stopPolling(): void {
    if (pollingTimer.value) {
      clearInterval(pollingTimer.value)
      pollingTimer.value = null
    }
  }

  function updateStatus(status: JudgeStatus): void {
    if (currentSubmission.value) {
      currentSubmission.value.status = status
    }
  }

  return {
    currentSubmission,
    isSubmitting,
    submit,
    startPolling,
    stopPolling,
    updateStatus,
  }
})
