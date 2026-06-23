import type { Submission, JudgeStatus } from '../../types'
import submissionsConfig from './data/submissions-config.json'

const STATE_SEQUENCE: { state: JudgeStatus; polls: number }[] = submissionsConfig.stateSequence as { state: JudgeStatus; polls: number }[]

/** 生成随机判题结果 */
function randomFinalStatus(): JudgeStatus {
  const roll = Math.random()
  if (roll < 0.55) return 'AC'
  if (roll < 0.75) return 'WA'
  if (roll < 0.85) return 'TLE'
  if (roll < 0.90) return 'RE'
  if (roll < 0.93) return 'CE'
  if (roll < 0.96) return 'MLE'
  return 'SE'
}

/** 根据语言和代码内容做简单的确定性判题 */
export function deterministicJudge(code: string): JudgeStatus {
  const match = code.match(/\/\/\s*@judge:\s*(\w+)/)
  if (match) {
    return match[1] as JudgeStatus
  }
  if (code.trim().length === 0) return 'CE'
  if (code.includes('#error')) return 'CE'
  if (code.includes('while(true)') || code.includes('while (true)')) return 'TLE'
  if (code.trim().length < 20) return 'AC'
  return randomFinalStatus()
}

/** 生成模拟的运行时间和内存消耗 */
function randomUsage(status: JudgeStatus): { time?: number; memory?: number } {
  if (status === 'CE' || status === 'SE') return {}
  const time = Math.floor(Math.random() * 800) + 1
  const memory = Math.floor(Math.random() * 200 * 1024) + 1024
  return { time, memory }
}

// ==================== 内存状态 ====================

const submissionStore = new Map<string, Submission & { pollCount: number }>()
const pollProgress = new Map<string, number>()

let submissionCounter = 0

/** 创建一条新的提交记录 */
export function createMockSubmission(
  problemId: number,
  code: string,
  language: string,
): Submission {
  submissionCounter++
  const id = `SUB-${String(submissionCounter).padStart(6, '0')}`

  const finalStatus = deterministicJudge(code)
  const usage = randomUsage(finalStatus)

  const submission: Submission & { pollCount: number } = {
    id,
    problemId,
    language,
    code,
    status: 'PENDING',
    time: usage.time,
    memory: usage.memory,
    createdAt: new Date().toISOString(),
    pollCount: 0,
  }

  submissionStore.set(id, submission)
  pollProgress.set(id, 0)

  const { pollCount: _, ...result } = submission
  return result as Submission
}

/** 轮询一次判题状态 */
export function pollMockSubmission(submissionId: string): Submission | null {
  const submission = submissionStore.get(submissionId)
  if (!submission) return null

  const currentPoll = pollProgress.get(submissionId) ?? 0
  pollProgress.set(submissionId, currentPoll + 1)

  const totalMidPolls = STATE_SEQUENCE.reduce((sum, s) => sum + s.polls, 0)
  if (currentPoll + 1 <= 1) {
    submission.status = 'PENDING'
  } else if (currentPoll + 1 <= totalMidPolls) {
    submission.status = 'RUNNING'
  } else {
    submission.status = deterministicJudge(submission.code)
  }

  const { pollCount: _, ...result } = submission
  return result as Submission
}

/** 重置提交计数器 */
export function resetSubmissionCounter(): void {
  submissionCounter = 0
}

/** 清空所有提交记录 */
export function clearSubmissions(): void {
  submissionStore.clear()
  pollProgress.clear()
  submissionCounter = 0
}
