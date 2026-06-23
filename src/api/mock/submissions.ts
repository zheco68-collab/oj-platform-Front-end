/**
 * 提交判题 Mock 数据
 *
 * 模拟判题状态流转：PENDING → RUNNING → 终态 (AC/WA/TLE/MLE/RE/CE/SE)
 * 每次 poll 推进一个状态，模拟真实判题过程。
 */

import type { Submission, JudgeStatus } from '../../types'

/**
 * 中间状态序列（PENDING → RUNNING → 终态）
 * 每个中间状态持续 pollCount 次 poll
 */
const STATE_SEQUENCE: { state: JudgeStatus; polls: number }[] = [
  { state: 'PENDING', polls: 1 },   // 第 1 次 poll：PENDING
  { state: 'RUNNING', polls: 2 },   // 第 2-3 次 poll：RUNNING
  // 之后进入终态
]

/** 生成随机判题结果（偏向 AC，模拟真实通过率） */
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

/** 根据语言和代码内容做简单的确定性判题（用于测试可预测性） */
export function deterministicJudge(code: string): JudgeStatus {
  // 测试钩子：代码中的特殊注释可指定判题结果
  const match = code.match(/\/\/\s*@judge:\s*(\w+)/)
  if (match) {
    return match[1] as JudgeStatus
  }

  // 空代码 → CE
  if (code.trim().length === 0) return 'CE'
  // 包含 #error → CE
  if (code.includes('#error')) return 'CE'
  // 包含 while(true) → TLE（需在长度检查之前）
  if (code.includes('while(true)') || code.includes('while (true)')) return 'TLE'
  // 极短代码 → AC（模拟简单题）
  if (code.trim().length < 20) return 'AC'
  // 默认随机
  return randomFinalStatus()
}

/** 生成模拟的运行时间和内存消耗 */
function randomUsage(status: JudgeStatus): { time?: number; memory?: number } {
  if (status === 'CE' || status === 'SE') return {}
  const time = Math.floor(Math.random() * 800) + 1   // 1-800 ms
  const memory = Math.floor(Math.random() * 200 * 1024) + 1024  // 1-200 MB in KB
  return { time, memory }
}

// ==================== 内存状态 ====================

/** 生成的提交记录存储，key 为 submissionId */
const submissionStore = new Map<string, Submission & { pollCount: number }>()

/** 每个提交的判题进度（poll 次数），决定当前应返回的状态 */
const pollProgress = new Map<string, number>()

// ==================== 操作函数 ====================

let submissionCounter = 0

/** 创建一条新的提交记录，返回 submissionId */
export function createMockSubmission(
  problemId: number,
  code: string,
  language: string,
): Submission {
  submissionCounter++
  const id = `SUB-${String(submissionCounter).padStart(6, '0')}`

  const finalStatus = deterministicJudge(code)
  // 在创建时就决定终态，但 polling 时逐步推进
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

  // 返回时剥离内部 pollCount 字段
  const { pollCount: _, ...result } = submission
  return result as Submission
}

/**
 * 轮询一次判题状态。
 * 每次调用推进一次状态（每隔 ~1s 调用一次即可模拟实时轮询）。
 */
export function pollMockSubmission(submissionId: string): Submission | null {
  const submission = submissionStore.get(submissionId)
  if (!submission) return null

  const currentPoll = pollProgress.get(submissionId) ?? 0
  pollProgress.set(submissionId, currentPoll + 1)

  // 直接根据 poll 次数计算状态
  const totalMidPolls = STATE_SEQUENCE.reduce((sum, s) => sum + s.polls, 0)
  if (currentPoll + 1 <= 1) {
    submission.status = 'PENDING'
  } else if (currentPoll + 1 <= totalMidPolls) {
    submission.status = 'RUNNING'
  } else {
    // 终态：从 deterministicJudge 重新计算（因为是纯函数，结果一致）
    submission.status = deterministicJudge(submission.code)
  }

  const { pollCount: _, ...result } = submission
  return result as Submission
}

/** 重置提交计数器（测试用） */
export function resetSubmissionCounter(): void {
  submissionCounter = 0
}

/** 清空所有提交记录（测试用） */
export function clearSubmissions(): void {
  submissionStore.clear()
  pollProgress.clear()
  submissionCounter = 0
}
