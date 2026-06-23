<script setup lang="ts">
import { NTag } from 'naive-ui'
import { computed } from 'vue'
import type { Difficulty } from '../types'
import { difficultyLabel } from '../utils'

const props = defineProps<{
  difficulty: Difficulty
}>()

const colorMap: Record<Difficulty, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  entry: 'success',
  popularize: 'info',
  improve: 'warning',
  provincial: 'error',
  NOI: 'default',
}

const label = computed(() => difficultyLabel[props.difficulty])
const color = computed(() => colorMap[props.difficulty])
</script>

<template>
  <NTag :type="color" size="small" round>
    {{ label }}
  </NTag>
</template>
