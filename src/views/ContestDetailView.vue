<script setup lang="ts">
import { NCard, NTabs, NTabPane } from 'naive-ui'
</script>

<template>
  <NCard title="比赛信息头部">
    <p>比赛名称 / 倒计时 / 赛制 / 状态 — 待开发 (P5)</p>
  </NCard>
  <NTabs type="line">
    <NTabPane name="problems" tab="题目列表" />
    <NTabPane name="ranking" tab="排名" />
    <NTabPane name="rules" tab="规则" />
    <NTabPane name="my-submissions" tab="我的提交" />
  </NTabs>
  <p>比赛详情内容 — 待开发 (P5)</p>
</template>
