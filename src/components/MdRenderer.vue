<script setup lang="ts">
// TODO: 后续替换为 markdown-it + KaTeX + highlight.js 实现
defineProps<{
  content: string
}>()
</script>

<template>
  <div class="md-renderer">
    <pre>{{ content }}</pre>
  </div>
</template>

<style scoped>
.md-renderer {
  line-height: 1.8;
  word-break: break-word;
}

.md-renderer pre {
  white-space: pre-wrap;
  font-family: inherit;
}
</style>
