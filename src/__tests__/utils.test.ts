/**
 * 工具函数单元测试
 */
import { describe, it, expect } from 'vitest'
import {
  difficultyLabel,
  formatDate,
  formatDateTime,
  passRate,
  formatTimeLimit,
  formatMemoryLimit,
} from '../utils'

describe('difficultyLabel', () => {
  it('映射入门', () => expect(difficultyLabel.entry).toBe('入门'))
  it('映射普及', () => expect(difficultyLabel.popularize).toBe('普及'))
  it('映射提高', () => expect(difficultyLabel.improve).toBe('提高'))
  it('映射省选', () => expect(difficultyLabel.provincial).toBe('省选'))
  it('映射NOI', () => expect(difficultyLabel.NOI).toBe('NOI'))
})

describe('formatDate', () => {
  it('格式化日期为 YYYY-MM-DD', () => {
    expect(formatDate('2024-03-15')).toBe('2024-03-15')
  })
  it('处理含时间的 ISO 字符串', () => {
    expect(formatDate('2024-03-15T10:30:00Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('formatDateTime', () => {
  it('格式化日期时间为 YYYY-MM-DD HH:mm', () => {
    const result = formatDateTime('2024-03-15T10:30:00')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    expect(result).toContain('2024-03-15')
  })
})

describe('passRate', () => {
  it('计算简单通过率', () => {
    expect(passRate(75, 100)).toBe('75.0%')
  })
  it('submitted 为 0 时返回 0%', () => {
    expect(passRate(0, 0)).toBe('0%')
  })
  it('全通过的通过率为 100%', () => {
    expect(passRate(100, 100)).toBe('100.0%')
  })
  it('保留一位小数', () => {
    const result = passRate(1, 3)
    expect(result).toMatch(/^\d+\.\d%$/)
  })
})

describe('formatTimeLimit', () => {
  it('小于 1000ms 显示毫秒', () => {
    expect(formatTimeLimit(500)).toBe('500 ms')
  })
  it('1000ms 显示为秒', () => {
    expect(formatTimeLimit(1000)).toBe('1.0 s')
  })
  it('2000ms 显示为 2.0 s', () => {
    expect(formatTimeLimit(2000)).toBe('2.0 s')
  })
  it('1500ms 显示为 1.5 s', () => {
    expect(formatTimeLimit(1500)).toBe('1.5 s')
  })
})

describe('formatMemoryLimit', () => {
  it('小于 1024 MB 直接显示 MB', () => {
    expect(formatMemoryLimit(128)).toBe('128 MB')
  })
  it('1024 MB 显示为 GB', () => {
    expect(formatMemoryLimit(1024)).toBe('1.0 GB')
  })
  it('512 MB 显示为 MB', () => {
    expect(formatMemoryLimit(512)).toBe('512 MB')
  })
})
