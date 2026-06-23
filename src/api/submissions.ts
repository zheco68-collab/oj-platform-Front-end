/**
 * 提交相关 API
 */
import type { ApiResponse, Submission } from '../types'
import {
  createMockSubmission,
  pollMockSubmission,
} from './mock/submissions'

/** 模拟网络延迟 */
function delay(ms?: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms ?? 200 + Math.random() * 300))
}

/** 提交代码 */
export async function submitCode(
  problemId: number,
  code: string,
  language: string,
): Promise<ApiResponse<Submission>> {
  await delay()
  const submission = createMockSubmission(problemId, code, language)
  return {
    code: 200,
    message: 'ok',
    data: submission,
  }
}

/** 轮询判题状态 */
export async function pollSubmissionStatus(
  submissionId: string,
): Promise<ApiResponse<Submission>> {
  await delay(150 + Math.random() * 200)
  const submission = pollMockSubmission(submissionId)
  if (!submission) {
    return { code: 404, message: 'Submission not found', data: null as unknown as Submission }
  }
  return { code: 200, message: 'ok', data: submission }
}
