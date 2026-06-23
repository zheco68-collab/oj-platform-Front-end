<script setup lang="ts">
import { computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { go } from '@codemirror/lang-go'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Extension } from '@codemirror/state'
import { useThemeStore } from '../stores/theme'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  language?: string
}>()

const themeStore = useThemeStore()

const langMap: Record<string, () => Extension> = {
  C: cpp,
  'C++': cpp,
  'C++17': cpp,
  'C++20': cpp,
  Python3: python,
  Java: java,
  Go: go,
}

const extensions = computed<Extension[]>(() => {
  const langExt = langMap[props.language || '']
  const exts: Extension[] = []
  if (themeStore.mode === 'dark') {
    exts.push(oneDark)
  }
  if (langExt) {
    exts.push(langExt())
  }
  return exts
})

const themeClass = computed(() => themeStore.mode === 'dark' ? 'cm-dark' : 'cm-light')
</script>

<template>
  <Codemirror
    :model-value="model"
    :extensions="extensions"
    :style="{ height: '100%' }"
    :indent-with-tab="false"
    :tab-size="4"
    :class="['cm-editor-wrap', themeClass]"
    @update:model-value="(v: string) => model = v"
  />
</template>

<style scoped>
.cm-editor-wrap {
  min-height: 300px;
  max-height: 500px;
  text-align: left;
  border-radius: 6px;
  overflow: hidden;
}

.cm-editor-wrap :deep(.cm-editor) {
  height: 100%;
  min-height: 300px;
  max-height: 500px;
}

.cm-editor-wrap :deep(.cm-scroller) {
  overflow: auto;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.65;
}

/* 浅色模式 */
.cm-light {
  background: #ffffff;
  border: 1px solid #d0d7de;
}

.cm-light :deep(.cm-editor) {
  background: #ffffff;
}

.cm-light :deep(.cm-gutters) {
  background: #f6f8fa;
  border-right-color: #d0d7de;
  color: #656d76;
}

.cm-light :deep(.cm-activeLineGutter) {
  background: #e8f0fe;
}

/* 深色模式 */
.cm-dark {
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
}
</style>
