<script setup lang="ts">
import { NGrid, NGi, NIcon, NButton, NTag } from 'naive-ui'
import {
  DocumentTextOutline,
  TrophyOutline,
  MegaphoneOutline,
  PeopleOutline,
  BarChartOutline,
  CreateOutline,
  SettingsOutline,
} from '@vicons/ionicons5'
import type { Component } from 'vue'
import { mockAdminOverview, mockAdminEntries } from '../../api/mock/admin'

// ==================== 图标名 → 组件映射 ====================

const iconMap: Record<string, Component> = {
  DocumentTextOutline,
  TrophyOutline,
  MegaphoneOutline,
  PeopleOutline,
  BarChartOutline,
  SettingsOutline,
}

function resolveIcon(name: string): Component {
  return iconMap[name] ?? SettingsOutline
}

// ==================== 数据 ====================

const overview = mockAdminOverview
const entries = mockAdminEntries
</script>

<template>
  <div class="admin-dashboard">
    <!-- ==================== 页面标题 ==================== -->
    <div class="page-header">
      <div class="page-title-row">
        <NIcon size="28" color="var(--color-primary)">
          <SettingsOutline />
        </NIcon>
        <h1>管理面板</h1>
        <NTag type="warning" size="small" round>Admin</NTag>
      </div>
      <p class="page-subtitle">平台内容与用户管理</p>
    </div>

    <!-- ==================== 数据概览 ==================== -->
    <div class="overview-row">
      <div
        v-for="item in overview"
        :key="item.label"
        class="overview-card card"
      >
        <div class="overview-icon" :style="{ background: item.color + '18', color: item.color }">
          <NIcon size="24">
            <component :is="resolveIcon(item.icon)" />
          </NIcon>
        </div>
        <div class="overview-body">
          <span class="overview-value">{{ item.value.toLocaleString() }}</span>
          <span class="overview-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- ==================== 功能入口 ==================== -->
    <div class="entries-section">
      <h2 class="section-title">功能管理</h2>
      <NGrid :cols="2" :x-gap="20" :y-gap="20" responsive="screen">
        <NGi v-for="entry in entries" :key="entry.key">
          <div class="entry-card card">
            <div class="entry-top">
              <!-- 彩色图标 -->
              <div
                class="entry-icon"
                :style="{ background: entry.color + '14', color: entry.color }"
              >
                <NIcon size="28">
                  <component :is="resolveIcon(entry.icon)" />
                </NIcon>
              </div>
              <div class="entry-header">
                <h3 class="entry-title">{{ entry.title }}</h3>
                <span class="entry-badge" :style="{ background: entry.color, color: '#fff' }">
                  {{ entry.actions.length }} 项功能
                </span>
              </div>
            </div>

            <p class="entry-desc">{{ entry.description }}</p>

            <div class="entry-actions">
              <NButton
                v-for="action in entry.actions"
                :key="action"
                size="small"
                :style="{ borderColor: entry.color + '40', color: entry.color }"
                ghost
                round
              >
                <template #icon>
                  <NIcon size="14">
                    <CreateOutline />
                  </NIcon>
                </template>
                {{ action }}
              </NButton>
            </div>

            <div class="entry-footer">
              <NButton
                text
                :style="{ color: entry.color }"
              >
                进入管理
                <NIcon size="14" style="margin-left:4px">
                  <component :is="resolveIcon(entry.icon)" />
                </NIcon>
              </NButton>
            </div>
          </div>
        </NGi>
      </NGrid>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xl);
  padding-bottom: var(--gap-xl);
}

/* ==================== 页面标题 ==================== */
.page-header {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.page-title-row h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-left: 36px;
}

/* ==================== 数据概览 ==================== */
.overview-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-md);
}

.overview-card {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  padding: var(--gap-md) var(--gap-lg);
  cursor: default;
  transition: transform 0.2s, box-shadow 0.2s;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-body {
  display: flex;
  flex-direction: column;
}

.overview-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.overview-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ==================== 功能入口区域 ==================== */
.entries-section {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* ==================== 入口卡片 ==================== */
.entry-card {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  padding: var(--gap-lg);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.entry-top {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-md);
}

.entry-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.entry-header {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
  flex: 1;
}

.entry-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.entry-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.75rem;
  padding: 1px 10px;
  border-radius: 10px;
  font-weight: 500;
  line-height: 1.6;
}

.entry-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.entry-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-sm);
}

.entry-footer {
  margin-top: auto;
  padding-top: var(--gap-sm);
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

/* ==================== 暗色模式 ==================== */
html.dark .entry-footer {
  border-color: #2a3a5a;
}

html.dark .overview-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

html.dark .entry-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
  .overview-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-row {
    grid-template-columns: 1fr;
  }

  .entry-top {
    flex-direction: column;
  }

  .page-subtitle {
    margin-left: 0;
  }
}
</style>
