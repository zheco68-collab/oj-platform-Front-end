<script setup lang="ts">
import { NAvatar, NBadge } from 'naive-ui'

defineProps<{
  avatarUrl?: string
  username: string
  isAdmin?: boolean
  size?: 'small' | 'medium' | 'large'
}>()

const sizeMap = { small: 32, medium: 48, large: 72 }
</script>

<template>
  <NBadge
    v-if="isAdmin"
    value="👑"
    :offset="[-4, -4]"
  >
    <NAvatar
      round
      :size="sizeMap[size || 'medium']"
      :src="avatarUrl"
    >
      {{ username?.charAt(0)?.toUpperCase() }}
    </NAvatar>
  </NBadge>
  <NAvatar
    v-else
    round
    :size="sizeMap[size || 'medium']"
    :src="avatarUrl"
  >
    {{ username?.charAt(0)?.toUpperCase() }}
  </NAvatar>
</template>
