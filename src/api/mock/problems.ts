import type { Problem, ProblemDetail } from '../../types'
import problemsData from './data/problems.json'

// 使用可变副本，使 Admin CRUD 可操作（浅拷贝即可，替换整条记录不影响 JSON 源）
export const mockProblems: Problem[] = [...(problemsData.problems as Problem[])]
export const mockProblemDetailMap: Record<number, ProblemDetail> = { ...problemsData.problemDetailMap } as Record<number, ProblemDetail>
