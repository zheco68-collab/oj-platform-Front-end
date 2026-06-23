<script setup lang="ts">
import { NCard, NTabs, NTabPane } from 'naive-ui'
</script>

<template>
  <NCard title="比赛列表">
    <NTabs type="line">
      <NTabPane name="all" tab="全部" />
      <NTabPane name="running" tab="进行中" />
      <NTabPane name="upcoming" tab="即将开始" />
      <NTabPane name="ended" tab="已结束" />
    </NTabs>
    <p>比赛卡片 Grid 列表 — 待开发 (P5)</p>
  </NCard>
</template>
