import type { Difficulty } from '../types'

/** 难度到中文映射 */
export const difficultyLabel: Record<Difficulty, string> = {
  entry: '入门',
  popularize: '普及',
  improve: '提高',
  provincial: '省选',
  NOI: 'NOI',
}

/** 格式化时间为 YYYY-MM-DD */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 格式化时间为 YYYY-MM-DD HH:mm */
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

/** 计算通过率百分比 */
export function passRate(accepted: number, submitted: number): string {
  if (submitted === 0) return '0%'
  return ((accepted / submitted) * 100).toFixed(1) + '%'
}

/** 格式化时间限制 */
export function formatTimeLimit(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(1) + ' s'
  return ms + ' ms'
}

/** 格式化内存限制 */
export function formatMemoryLimit(mb: number): string {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB'
  return mb + ' MB'
}
