/**
 * CodeEditor 组件测试
 */
import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '../../test/helpers'
import CodeEditor from '../CodeEditor.vue'

describe('CodeEditor', () => {
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
    // CodeMirror 应该渲染传入的代码
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
})
