<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps<{
  targetTime: string
}>()

const emit = defineEmits<{
  ended: []
}>()

const now = ref(Date.now())
const timer = setInterval(() => {
  now.value = Date.now()
}, 1000)

onUnmounted(() => clearInterval(timer))

const remaining = computed(() => {
  const diff = new Date(props.targetTime).getTime() - now.value
  if (diff <= 0) {
    emit('ended')
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)
  return { days, hours, minutes, seconds, expired: false }
})

const display = computed(() => {
  const r = remaining.value
  if (r.expired) return '已结束'
  if (r.days > 0) return `${r.days} 天 ${r.hours} 时 ${r.minutes} 分后`
  if (r.hours > 0) return `${r.hours} 时 ${r.minutes} 分 ${r.seconds} 秒后`
  if (r.minutes > 0) return `${r.minutes} 分 ${r.seconds} 秒后`
  return `${r.seconds} 秒后`
})
</script>

<template>
  <span class="countdown-timer">{{ display }}</span>
</template>

<style scoped>
.countdown-timer {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
</style>
