<script setup lang="ts">
import { computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { go } from '@codemirror/lang-go'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Extension } from '@codemirror/state'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  language?: string
}>()

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
  return [oneDark, ...(langExt ? [langExt()] : [])]
})
</script>

<template>
  <Codemirror
    :model-value="model"
    :extensions="extensions"
    :style="{ height: '100%' }"
    :indent-with-tab="false"
    :tab-size="4"
    class="cm-editor-wrap"
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
</style>
