<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NTag, NSpin } from 'naive-ui'
import type { JudgeStatus } from '../types'

const props = defineProps<{
  status: JudgeStatus
  time?: number      // 运行时间 ms
  memory?: number    // 内存消耗 KB
  loading?: boolean
  error?: string | null
}>()

// ==================== 状态颜色映射 ====================
const statusColorMap: Record<JudgeStatus, string> = {
  PENDING: '#909399',
  RUNNING: '#3498db',
  AC: '#52c41a',
  WA: '#ff4d4f',
  TLE: '#faad14',
  MLE: '#e67e22',
  RE: '#9b59b6',
  CE: '#f1c40f',
  SE: '#e74c3c',
}

const statusLabelMap: Record<JudgeStatus, string> = {
  PENDING: '等待中',
  RUNNING: '判题中',
  AC: 'Accepted',
  WA: 'Wrong Answer',
  TLE: 'Time Limit Exceeded',
  MLE: 'Memory Limit Exceeded',
  RE: 'Runtime Error',
  CE: 'Compile Error',
  SE: 'System Error',
}

const color = computed(() => statusColorMap[props.status])
const label = computed(() => statusLabelMap[props.status])

const isFinal = computed(() => !['PENDING', 'RUNNING'].includes(props.status))
const isAccept = computed(() => props.status === 'AC')

function formatTime(ms?: number): string {
  if (ms === undefined) return '-'
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(0)} s`
}

function formatMemory(kb?: number): string {
  if (kb === undefined) return '-'
  if (kb >= 1024 * 1024) return `${(kb / (1024 * 1024)).toFixed(1)} GB`
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${kb} KB`
}
</script>

<template>
  <NCard size="small" class="judge-status-card">
    <div class="status-body">
      <!-- 状态标签 -->
      <div class="status-main">
        <NTag :color="{ color: color, textColor: '#fff' }" size="medium" :bordered="false">
          {{ label }}
        </NTag>

        <!-- Loading spinner for non-final statuses -->
        <template v-if="!isFinal">
          <NSpin size="small" />
          <span class="status-hint">判题中，请稍候...</span>
        </template>

        <!-- Acceptance icon -->
        <template v-if="isAccept">
          <span class="accept-icon">✓</span>
        </template>
      </div>

      <!-- 运行详情（终态时显示） -->
      <div v-if="isFinal && status !== 'CE' && status !== 'SE'" class="status-detail">
        <div class="detail-row">
          <span class="detail-label">运行时间</span>
          <span class="detail-value">{{ formatTime(time) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">内存消耗</span>
          <span class="detail-value">{{ formatMemory(memory) }}</span>
        </div>
      </div>

      <!-- 编译错误 / 系统错误提示 -->
      <div v-if="status === 'CE'" class="status-detail">
        <p class="ce-hint">代码编译失败，请检查语法错误后重新提交。</p>
      </div>
      <div v-if="status === 'SE'" class="status-detail">
        <p class="se-hint">评测系统内部错误，请稍后重试。</p>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="status-error">
        <span class="error-text">{{ error }}</span>
      </div>
    </div>
  </NCard>
</template>

<style scoped>
.judge-status-card {
  margin-top: var(--gap-sm);
  border-left: 4px solid v-bind(color);
}

.status-body {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.status-main {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  flex-wrap: wrap;
}

.status-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.accept-icon {
  color: var(--color-success);
  font-size: 1.25rem;
  font-weight: 700;
  margin-left: 2px;
}

.status-detail {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
  padding-top: var(--gap-xs);
  border-top: 1px solid #eee;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.ce-hint {
  margin: 0;
  font-size: 0.8125rem;
  color: #b8860b;
}

.se-hint {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-danger);
}

.status-error {
  margin-top: 2px;
}

.error-text {
  font-size: 0.8125rem;
  color: var(--color-danger);
}
</style>
