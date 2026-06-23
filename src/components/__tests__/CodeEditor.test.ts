/**
 * CodeEditor 组件测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { mountWithPlugins, createTestPinia } from '../../test/helpers'
import CodeEditor from '../CodeEditor.vue'
import { useThemeStore } from '../../stores/theme'

describe('CodeEditor', () => {
  beforeEach(() => {
    const pinia = createTestPinia()
    setActivePinia(pinia)
    // 重置为白天模式
    localStorage.setItem('oj-theme', 'light')
  })

  it('渲染 CodeMirror 编辑器容器', () => {
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: '', language: 'C++' },
    })
    expect(wrapper.find('.cm-editor-wrap').exists()).toBe(true)
  })

  it('渲染代码内容', () => {
    const code = '#include <stdio.h>\nint main() { return 0; }'
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: code, language: 'C' },
    })
    expect(wrapper.find('.cm-editor-wrap').exists()).toBe(true)
  })

  it('支持不同语言', () => {
    const languages = ['C', 'C++', 'C++17', 'C++20', 'Python3', 'Java', 'Go']
    for (const lang of languages) {
      const wrapper = mountWithPlugins(CodeEditor, {
        props: { modelValue: 'test', language: lang },
      })
      expect(wrapper.find('.cm-editor-wrap').exists()).toBe(true)
    }
  })

  it('空代码也能渲染', () => {
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: '', language: 'Python3' },
    })
    expect(wrapper.find('.cm-editor-wrap').exists()).toBe(true)
  })

  it('白天模式应用浅色样式类', () => {
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: 'test', language: 'C++' },
    })
    expect(wrapper.find('.cm-light').exists()).toBe(true)
  })

  it('黑夜模式应用深色样式类', () => {
    const pinia = createTestPinia()
    setActivePinia(pinia)
    const theme = useThemeStore()
    theme.setMode('dark')
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: 'test', language: 'C++' },
      pinia,
    })
    expect(wrapper.find('.cm-dark').exists()).toBe(true)
  })
})
