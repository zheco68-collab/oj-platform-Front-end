/**
 * MdRenderer 组件测试
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MdRenderer from '../MdRenderer.vue'

function render(content: string) {
  return mount(MdRenderer, {
    props: { content },
  })
}

describe('MdRenderer', () => {
  it('渲染纯文本', () => {
    const wrapper = render('Hello World')
    expect(wrapper.html()).toContain('Hello World')
  })

  it('渲染空内容', () => {
    const wrapper = render('')
    expect(wrapper.find('.md-renderer').exists()).toBe(true)
  })

  it('渲染 h1-h6 标题', () => {
    const wrapper = render('# h1\n## h2\n### h3')
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('h3').exists()).toBe(true)
  })

  it('渲染加粗和斜体', () => {
    const wrapper = render('**bold** *italic*')
    expect(wrapper.find('strong').exists()).toBe(true)
    expect(wrapper.find('em').exists()).toBe(true)
  })

  it('渲染无序列表', () => {
    const wrapper = render('- item1\n- item2')
    expect(wrapper.find('ul').exists()).toBe(true)
    const items = wrapper.findAll('li')
    expect(items.length).toBe(2)
  })

  it('渲染有序列表', () => {
    const wrapper = render('1. first\n2. second')
    expect(wrapper.find('ol').exists()).toBe(true)
    const items = wrapper.findAll('li')
    expect(items.length).toBe(2)
  })

  it('渲染表格', () => {
    const wrapper = render('| A | B |\n|---|---|\n| 1 | 2 |')
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('th').exists()).toBe(true)
    expect(wrapper.find('td').exists()).toBe(true)
  })

  it('渲染链接', () => {
    const wrapper = render('[Click](https://example.com)')
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com')
  })

  it('渲染代码块（无语言）', () => {
    const wrapper = render('```\nconst x = 1;\n```')
    expect(wrapper.find('pre.hljs').exists()).toBe(true)
    expect(wrapper.find('code').exists()).toBe(true)
  })

  it('渲染代码块（指定语言）', () => {
    const wrapper = render('```javascript\nconst x = 1;\n```')
    expect(wrapper.find('pre.hljs').exists()).toBe(true)
    expect(wrapper.find('code').exists()).toBe(true)
  })

  it('渲染行内代码', () => {
    const wrapper = render('use `const` keyword')
    expect(wrapper.find('code').exists()).toBe(true)
  })

  it('渲染引用块', () => {
    const wrapper = render('> quoted text')
    expect(wrapper.find('blockquote').exists()).toBe(true)
  })

  it('渲染行内 LaTeX \\(...\\)', () => {
    const wrapper = render('\\(a + b = c\\)')
    // KaTeX 会生成 .katex 类的 span
    expect(wrapper.find('.katex').exists()).toBe(true)
  })

  it('渲染块级 LaTeX $$...$$', () => {
    const wrapper = render('$$\na + b = c\n$$')
    expect(wrapper.find('.katex-display').exists()).toBe(true)
  })

  it('HTML 标签被转义', () => {
    const wrapper = render('<script>alert("xss")</script>')
    // script 标签不应出现在输出中（原始 HTML 被禁用）
    expect(wrapper.find('script').exists()).toBe(false)
  })

  it('渲染混合内容（Markdown + LaTeX + 代码）', () => {
    const wrapper = render(`# 标题

普通段落包含行内公式 \\(x^2 + y^2 = z^2\\)。

\`\`\`cpp
int main() { return 0; }
\`\`\`

- 列表项 1
- 列表项 2

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$
    `)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('.katex').exists()).toBe(true)
    expect(wrapper.find('pre.hljs').exists()).toBe(true)
    expect(wrapper.find('ul').exists()).toBe(true)
    expect(wrapper.find('.katex-display').exists()).toBe(true)
  })

  it('渲染分割线', () => {
    const wrapper = render('---')
    expect(wrapper.find('hr').exists()).toBe(true)
  })
})
