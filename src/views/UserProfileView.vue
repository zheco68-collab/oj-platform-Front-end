<script setup lang="ts">
import { NCard, NTabs, NTabPane } from 'naive-ui'
</script>

<template>
  <div class="user-profile">
    <div class="left-card">
      <NCard title="用户信息卡片">
        <p>头像 / 用户名 / 签名 / 注册时间 / 统计 / Rating — 待开发 (P7)</p>
      </NCard>
    </div>
    <div class="right-content">
      <NTabs type="line">
        <NTabPane name="recent-ac" tab="最近通过" />
        <NTabPane name="solutions" tab="题解" />
        <NTabPane name="contest-history" tab="比赛记录" />
      </NTabs>
      <p>用户内容 — 待开发 (P7)</p>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--gap-md);
}
</style>
