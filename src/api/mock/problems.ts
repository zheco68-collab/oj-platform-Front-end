import type { Problem, ProblemDetail } from '../../types'
import problemsData from './data/problems.json'

export const mockProblems: Problem[] = problemsData.problems as Problem[]
export const mockProblemDetailMap: Record<number, ProblemDetail> = problemsData.problemDetailMap as Record<number, ProblemDetail>
