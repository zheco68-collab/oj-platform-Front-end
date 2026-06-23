<script setup lang="ts">
import { NInput } from 'naive-ui'

// 初版用 Naive UI Input + monospace 字体实现
// TODO: 后续替换为 Monaco Editor
const model = defineModel<string>({ default: '' })

defineProps<{
  language?: string
  placeholder?: string
}>()
</script>

<template>
  <NInput
    v-model:value="model"
    type="textarea"
    :placeholder="placeholder || '在此输入代码...'"
    :rows="15"
    class="code-editor"
  />
</template>

<style scoped>
.code-editor :deep(textarea) {
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas',
    'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  tab-size: 4;
}
</style>
