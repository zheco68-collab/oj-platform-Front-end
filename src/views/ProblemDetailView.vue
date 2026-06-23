<script setup lang="ts">
import { NCard } from 'naive-ui'
</script>

<template>
  <div class="problem-detail">
    <div class="left-panel">
      <NCard title="题目内容">
        <p>题目描述 / 输入输出格式 / 样例 / 标签 — 待开发 (P2)</p>
      </NCard>
    </div>
    <div class="right-panel">
      <NCard title="提交区">
        <p>语言选择 + 代码编辑器 + 提交按钮 — 待开发 (P3)</p>
      </NCard>
    </div>
    <div class="bottom-panel">
      <NCard title="底部 Tab">
        <p>题解 / 提交记录 Tab — 待开发 (P2)</p>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
.problem-detail {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: var(--gap-md);
}
.left-panel { grid-column: 1; }
.right-panel { grid-column: 2; }
.bottom-panel { grid-column: 1 / -1; }
</style>
