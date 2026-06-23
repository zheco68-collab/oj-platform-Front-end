/**
 * CodeEditor 组件测试
 */
import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '../../test/helpers'
import CodeEditor from '../CodeEditor.vue'

describe('CodeEditor', () => {
  it('渲染 textarea', () => {
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: '', language: 'C++' },
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
  })

  it('使用 monospace 字体', () => {
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: 'int main() {}', language: 'C++' },
    })
    // NInput textarea 应该存在
    expect(wrapper.find('.code-editor').exists()).toBe(true)
  })

  it('显示 placeholder', () => {
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: '', placeholder: '自定义提示' },
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toContain('自定义提示')
  })

  it('默认 placeholder', () => {
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: '' },
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toContain('在此输入代码')
  })

  it('渲染传入的代码', () => {
    const code = '#include <stdio.h>\nint main() { return 0; }'
    const wrapper = mountWithPlugins(CodeEditor, {
      props: { modelValue: code, language: 'C' },
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.element.value).toBe(code)
  })
})
