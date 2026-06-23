<script setup lang="ts">
import { NTag } from 'naive-ui'
import { computed } from 'vue'
import type { JudgeStatus, ContestStatus } from '../types'

const props = defineProps<{
  type: 'judge' | 'contest'
  status: JudgeStatus | ContestStatus
}>()

type TagType = 'default' | 'info' | 'success' | 'warning' | 'error'

const colorMap: Record<string, TagType> = {
  // 判题状态
  PENDING: 'default',
  RUNNING: 'info',
  AC: 'success',
  WA: 'error',
  TLE: 'warning',
  MLE: 'warning',
  RE: 'default',
  CE: 'warning',
  SE: 'error',
  // 比赛状态
  UPCOMING: 'warning',
  ENDED: 'default',
}

const labelMap: Record<string, string> = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  AC: 'AC',
  WA: 'WA',
  TLE: 'TLE',
  MLE: 'MLE',
  RE: 'RE',
  CE: 'CE',
  SE: 'SE',
  UPCOMING: '未开始',
  ENDED: '已结束',
}

const label = computed(() => labelMap[props.status] || props.status)
const color = computed(() => colorMap[props.status] || 'default')
</script>

<template>
  <NTag :type="color" size="small" round>
    {{ label }}
  </NTag>
</template>
