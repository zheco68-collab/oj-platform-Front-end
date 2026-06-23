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

const judgeLabelMap: Record<string, string> = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  AC: 'AC',
  WA: 'WA',
  TLE: 'TLE',
  MLE: 'MLE',
  RE: 'RE',
  CE: 'CE',
  SE: 'SE',
}

const contestLabelMap: Record<string, string> = {
  UPCOMING: '未开始',
  RUNNING: '进行中',
  ENDED: '已结束',
}

const label = computed(() => {
  if (props.type === 'contest') {
    return contestLabelMap[props.status] || props.status
  }
  return judgeLabelMap[props.status] || props.status
})
const contestColorMap: Record<string, TagType> = {
  UPCOMING: 'warning',
  RUNNING: 'success',
  ENDED: 'default',
}

const computedColor = computed(() => {
  if (props.type === 'contest') {
    return contestColorMap[props.status] || 'default'
  }
  return colorMap[props.status] || 'default'
})
</script>

<template>
  <NTag :type="computedColor" size="small" round>
    {{ label }}
  </NTag>
</template>
