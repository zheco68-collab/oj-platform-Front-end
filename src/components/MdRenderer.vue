<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import katex from 'katex'
import { computed } from 'vue'

const props = defineProps<{
  content: string
}>()

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch {
        // fall through
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  },
})

/**
 * 渲染 Markdown 内容，支持 LaTeX 数学公式
 *
 * 处理流程：
 * 1. 提取 \(...\) 和 $$...$$ 数学公式，替换为占位符
 * 2. 用 markdown-it 渲染剩余 Markdown
 * 3. 用 KaTeX 渲染数学公式并替换回占位符
 */
const renderedHtml = computed(() => {
  if (!props.content) return ''

  const mathBlocks: { placeholder: string; html: string }[] = []

  // Step 1: 提取并替换数学公式
  let text = props.content

  // 处理块级公式 $$...$$
  const displayMathRegex = /\$\$([\s\S]*?)\$\$/g
  text = text.replace(displayMathRegex, (_match, formula: string) => {
    const placeholder = `@@MATH_DISPLAY_${mathBlocks.length}@@`
    try {
      const html = katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
      })
      mathBlocks.push({ placeholder, html })
    } catch {
      mathBlocks.push({ placeholder, html: `<pre>${md.utils.escapeHtml(formula.trim())}</pre>` })
    }
    return placeholder
  })

  // 处理行内公式 \(...\)
  const inlineMathRegex = /\\\(([\s\S]*?)\\\)/g
  text = text.replace(inlineMathRegex, (_match, formula: string) => {
    const placeholder = `@@MATH_INLINE_${mathBlocks.length}@@`
    try {
      const html = katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
      })
      mathBlocks.push({ placeholder, html })
    } catch {
      mathBlocks.push({ placeholder, html: `<code>${md.utils.escapeHtml(formula.trim())}</code>` })
    }
    return placeholder
  })

  // Step 2: Markdown 渲染
  let html = md.render(text)

  // Step 3: 替换回数学公式
  for (const block of mathBlocks) {
    html = html.replace(block.placeholder, block.html)
  }

  return html
})
</script>

<template>
  <div class="md-renderer" v-html="renderedHtml" />
</template>

<style scoped>
/* 基础排版 */
.md-renderer {
  line-height: 1.8;
  word-break: break-word;
  color: var(--text-primary);
}

/* 标题 */
.md-renderer :deep(h1) {
  font-size: 1.8rem;
  font-weight: 600;
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 0.3em;
  margin: 1em 0 0.6em;
}

.md-renderer :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 0.3em;
  margin: 1em 0 0.6em;
}

.md-renderer :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.8em 0 0.4em;
}

.md-renderer :deep(h4) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.6em 0 0.3em;
}

/* 段落 */
.md-renderer :deep(p) {
  margin-bottom: var(--gap-sm);
}

/* 代码块 */
.md-renderer :deep(pre.hljs) {
  background: #f6f8fa;
  padding: var(--gap-md);
  border-radius: var(--border-radius);
  overflow-x: auto;
  margin: var(--gap-sm) 0;
  line-height: 1.5;
}

.md-renderer :deep(pre.hljs code) {
  background: transparent;
  padding: 0;
  font-size: 0.875rem;
}

/* 行内代码 */
.md-renderer :deep(code:not(pre code)) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.875em;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
  color: #e74c3c;
}

/* 表格 */
.md-renderer :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: var(--gap-sm) 0;
}

.md-renderer :deep(th),
.md-renderer :deep(td) {
  border: 1px solid #e1e4e8;
  padding: var(--gap-sm) var(--gap-md);
  text-align: left;
}

.md-renderer :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
}

.md-renderer :deep(tr:nth-child(even)) {
  background: #fafbfc;
}

/* 引用块 */
.md-renderer :deep(blockquote) {
  border-left: 4px solid var(--color-primary-light);
  padding: var(--gap-xs) var(--gap-md);
  color: var(--text-secondary);
  margin: var(--gap-sm) 0;
}

/* 列表 */
.md-renderer :deep(ul),
.md-renderer :deep(ol) {
  padding-left: 2em;
  margin-bottom: var(--gap-sm);
}

.md-renderer :deep(li) {
  margin-bottom: 2px;
}

/* 链接 */
.md-renderer :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}

.md-renderer :deep(a:hover) {
  text-decoration: underline;
  color: var(--color-primary-light);
}

/* 图片 */
.md-renderer :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

/* 分割线 */
.md-renderer :deep(hr) {
  border: none;
  border-top: 1px solid #e1e4e8;
  margin: var(--gap-md) 0;
}

/* KaTeX 公式 */
.md-renderer :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  margin: var(--gap-sm) 0;
}

.md-renderer :deep(.katex) {
  font-size: 1.1em;
}

/* 加粗 / 斜体 */
.md-renderer :deep(strong) {
  font-weight: 600;
}

.md-renderer :deep(em) {
  font-style: italic;
}
</style>
