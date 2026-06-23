/**
 * 测试工具函数 — 提供带 Pinia + Router + Naive UI 的 mount 封装
 */
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import naive from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 创建测试用 Pinia 实例（已激活）
 */
export function createTestPinia(): ReturnType<typeof createPinia> {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * 创建测试用 Router 实例
 */
export function createTestRouter(routes: RouteRecordRaw[] = []): ReturnType<typeof createRouter> {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  })
}

/** 获取 mount 函数接受的选项类型 */
type MountOptions = NonNullable<Parameters<typeof mount>[1]>

/**
 * 挂载组件，自动注入 Pinia + Naive UI + Router 全局插件
 *
 * 使用方式：
 * ```ts
 * const wrapper = mountWithPlugins(MyComponent, {
 *   props: { title: 'hello' },
 * })
 * ```
 */
export function mountWithPlugins(
  component: Parameters<typeof mount>[0],
  options: MountOptions & {
    router?: ReturnType<typeof createRouter>
    pinia?: ReturnType<typeof createPinia>
  } = {},
): ReturnType<typeof mount> {
  const pinia = options.pinia || createTestPinia()
  const router = options.router || createTestRouter()

  return mount(component, {
    ...options,
    global: {
      plugins: [pinia, router, naive],
      ...options.global,
    },
  })
}
