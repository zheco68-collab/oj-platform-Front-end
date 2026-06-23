<script setup lang="ts">
import { NEmpty, NButton, NSpace } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <NEmpty
      description="404 — 页面不存在"
      size="large"
    >
      <template #extra>
        <NSpace justify="center">
          <NButton type="primary" @click="router.push('/')">
            返回首页
          </NButton>
          <NButton @click="router.back()">
            返回上一页
          </NButton>
        </NSpace>
      </template>
    </NEmpty>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: var(--gap-xl) 0;
}
</style>
