/**
 * ProblemDetailView 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import ProblemDetailView from '../ProblemDetailView.vue'
import { createTestPinia, createTestRouter, mountWithPlugins } from '../../test/helpers'

// Mock 题目 API
vi.mock('../../api/problems', () => ({
  fetchProblems: vi.fn(),
  fetchProblemDetail: vi.fn((id: number) => {
    if (id === 99999 || Number.isNaN(id)) {
      return Promise.resolve({ code: 404, message: 'not found', data: null })
    }
    return Promise.resolve({
      code: 200,
      message: 'ok',
      data: {
        id,
        title: 'A + B 问题',
        difficulty: 'entry',
        tags: ['math'],
        source: '原创',
        timeLimit: 1000,
        memoryLimit: 128,
        description: '## 题目描述\n\n输入两个整数 \\(a\\) 和 \\(b\\)，输出它们的和。',
        inputFormat: '输入包含两个整数。',
        outputFormat: '输出一个整数。',
        samples: [
          { input: '1 2', output: '3' },
          { input: '-5 10', output: '5' },
        ],
        hint: '## 提示\n\n注意数据范围。',
        acceptedCount: 8520,
        submissionCount: 10200,
      },
    })
  }),
}))

// Mock 提交 API
let mockSubmissionCounter = 0
vi.mock('../../api/submissions', () => ({
  submitCode: vi.fn(async (_problemId: number, _code: string, language: string) => {
    mockSubmissionCounter++
    return {
      code: 200,
      message: 'ok',
      data: {
        id: `SUB-${String(mockSubmissionCounter).padStart(3, '0')}`,
        problemId: _problemId,
        language,
        code: _code,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    }
  }),
  pollSubmissionStatus: vi.fn(async (submissionId: string) => {
    return {
      code: 200,
      message: 'ok',
      data: {
        id: submissionId,
        problemId: 1001,
        language: 'C++',
        code: 'int main(){}',
        status: 'AC',
        time: 42,
        memory: 10240,
        createdAt: new Date().toISOString(),
      },
    }
  }),
}))

async function mountDetailView(id: string) {
  const pinia = createTestPinia()
  setActivePinia(pinia)
  const router = createTestRouter([
    { path: '/problem/:id(\\d+)', name: 'problem-detail', component: ProblemDetailView },
    { path: '/problem', name: 'problem-list', component: { template: '<div/>' } },
    { path: '/problem/:id(\\d+)/solution', name: 'solution-list', component: { template: '<div/>' } },
  ])
  await router.push(`/problem/${id}`)
  await router.isReady()

  return mountWithPlugins(ProblemDetailView, { router, pinia })
}

describe('ProblemDetailView', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
    mockSubmissionCounter = 0
  })

  it('渲染加载状态', async () => {
    const wrapper = await mountDetailView('1001')
    expect(wrapper.find('.problem-detail').exists()).toBe(true)
  })

  it('加载后渲染题目头部（ID + 标题）', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    const html = wrapper.html()
    expect(html).toContain('P1001')
    expect(html).toContain('A + B 问题')
  })

  it('渲染元信息', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    const html = wrapper.html()
    expect(html).toContain('时间限制')
    expect(html).toContain('内存限制')
  })

  it('渲染题目描述区段', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    expect(wrapper.html()).toContain('题目描述')
  })

  it('渲染输入/输出格式区段', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    const html = wrapper.html()
    expect(html).toContain('输入格式')
    expect(html).toContain('输出格式')
  })

  it('渲染样例区段', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    const html = wrapper.html()
    expect(html).toContain('样例')
    expect(html).toContain('1 2')
    expect(html).toContain('3')
  })

  it('渲染提示区段', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    expect(wrapper.html()).toContain('提示')
  })

  it('渲染算法标签', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    expect(wrapper.html()).toContain('算法标签')
  })

  it('渲染提交区包含标题', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    expect(wrapper.html()).toContain('提交代码')
  })

  it('渲染代码编辑器和语言选择器', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    // CodeMirror 编辑器存在
    expect(wrapper.find('.cm-editor-wrap').exists()).toBe(true)
    // 提交按钮存在
    const text = wrapper.text()
    expect(text).toContain('提交代码')
  })

  it('渲染底部 Tab 区', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    const html = wrapper.html()
    expect(html).toContain('题解')
    expect(html).toContain('提交记录')
  })

  it('无效 ID 显示未找到状态', async () => {
    const wrapper = await mountDetailView('99999')
    await flushPromises()
    await flushPromises()
    await flushPromises()
    const text = wrapper.text()
    expect(text).toContain('题目未找到')
  })

  it('提交记录 Tab 存在', async () => {
    const wrapper = await mountDetailView('1001')
    await flushPromises()
    await flushPromises()
    // Naive UI NTabs 默认只渲染活动 Tab 的内容，但 Tab 头部的文本始终可见
    const text = wrapper.text()
    expect(text).toContain('提交记录')
  })
})
