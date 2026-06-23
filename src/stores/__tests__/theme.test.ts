/**
 * Theme Store 测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestPinia } from '../../test/helpers'
import { useThemeStore } from '../theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
    localStorage.setItem('oj-theme', 'light')
  })

  it('默认白天模式', () => {
    const store = useThemeStore()
    expect(store.mode).toBe('light')
  })

  it('toggle 切换到黑夜', () => {
    const store = useThemeStore()
    store.toggle()
    expect(store.mode).toBe('dark')
  })

  it('toggle 再切回白天', () => {
    const store = useThemeStore()
    store.toggle()
    store.toggle()
    expect(store.mode).toBe('light')
  })

  it('setMode 设置指定模式', () => {
    const store = useThemeStore()
    store.setMode('dark')
    expect(store.mode).toBe('dark')
    store.setMode('light')
    expect(store.mode).toBe('light')
  })

  it('持久化到 localStorage', () => {
    const store = useThemeStore()
    store.setMode('dark')
    expect(localStorage.getItem('oj-theme')).toBe('dark')
    store.setMode('light')
    expect(localStorage.getItem('oj-theme')).toBe('light')
  })

  it('从 localStorage 读取已有值', () => {
    localStorage.setItem('oj-theme', 'dark')
    // 需要新建实例来读取
    setActivePinia(createTestPinia())
    const store = useThemeStore()
    expect(store.mode).toBe('dark')
  })

  it('无效值默认白天', () => {
    localStorage.setItem('oj-theme', 'invalid')
    setActivePinia(createTestPinia())
    const store = useThemeStore()
    expect(store.mode).toBe('light')
  })
})
