<script setup lang="ts">
import { NCard, NGrid, NGi, NSpace } from 'naive-ui'
</script>

<template>
  <NSpace vertical size="large">
    <NCard title="管理面板">
      <NGrid :cols="4" :x-gap="16">
        <NGi>
          <NCard title="题目管理" hoverable>
            <p>新建/编辑题目、管理测试数据 — 待开发 (P8)</p>
          </NCard>
        </NGi>
        <NGi>
          <NCard title="比赛管理" hoverable>
            <p>创建/编辑比赛、管理参赛人员 — 待开发 (P8)</p>
          </NCard>
        </NGi>
        <NGi>
          <NCard title="公告管理" hoverable>
            <p>发布/编辑/删除公告 — 待开发 (P8)</p>
          </NCard>
        </NGi>
        <NGi>
          <NCard title="用户管理" hoverable>
            <p>查看用户列表、封禁/解封 — 待开发 (P8)</p>
          </NCard>
        </NGi>
      </NGrid>
    </NCard>
  </NSpace>
</template>
