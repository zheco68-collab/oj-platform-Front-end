/**
 * Vitest 测试环境初始化
 */
import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import naive from 'naive-ui'

// Mock IntersectionObserver (Naive UI 依赖)
class MockIntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  observe(): void { /* no-op */ }
  unobserve(): void { /* no-op */ }
  disconnect(): void { /* no-op */ }
  takeRecords(): IntersectionObserverEntry[] { return [] }
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock ResizeObserver
class MockResizeObserver {
  observe(): void { /* no-op */ }
  unobserve(): void { /* no-op */ }
  disconnect(): void { /* no-op */ }
}

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value },
    removeItem: (key: string): void => { delete store[key] },
    clear: (): void => { store = {} },
    get length(): number { return Object.keys(store).length },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: async (_text: string): Promise<void> => { /* no-op */ },
    readText: async (): Promise<string> => '',
  },
  writable: true,
})

// 配置 @vue/test-utils 全局插件
config.global.plugins = [createPinia(), naive]
