<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NTabs,
  NTabPane,
  NTag,
  NSpin,
  NPagination,
  NEmpty,
  useMessage,
} from 'naive-ui'
import type { Contest } from '../types'
import { fetchContests } from '../api/contests'
import CountdownTimer from '../components/CountdownTimer.vue'
import StatusTag from '../components/StatusTag.vue'
import { formatDateTime } from '../utils'

const router = useRouter()
const message = useMessage()

// ==================== Tab / 筛选 ====================

type TabKey = 'all' | 'UPCOMING' | 'RUNNING' | 'ENDED'
const activeTab = ref<TabKey>('all')
const allContests = ref<Contest[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = 12

// ==================== 分页 ====================

const displayContests = computed(() => {
  let filtered = [...allContests.value]
  if (activeTab.value !== 'all') {
    filtered = filtered.filter((c) => c.status === activeTab.value)
  }
  filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  const start = (currentPage.value - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
  }
})

// ==================== 数据加载 ====================

async function loadContests(): Promise<void> {
  loading.value = true
  try {
    const res = await fetchContests()
    allContests.value = res.data.data
  } catch {
    message.error('加载比赛列表失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange(): void {
  currentPage.value = 1
}

function goToContestDetail(id: number): void {
  router.push(`/contest/${id}`)
}

// ==================== 标签辅助 ====================

function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    OFFICIAL: '官方比赛',
    PUBLIC: '公开赛',
    TEAM: '团队赛',
  }
  return map[category] || category
}

function categoryTagType(category: string): 'info' | 'warning' | 'default' {
  if (category === 'OFFICIAL') return 'info'
  if (category === 'TEAM') return 'warning'
  return 'default'
}

function typeTagType(type: string): 'info' | 'warning' | 'default' {
  if (type === 'ICPC') return 'info'
  if (type === 'OI') return 'warning'
  return 'default'
}

onMounted(loadContests)
</script>

<template>
  <div class="contest-list-page container">
    <div class="page-header">
      <h1>比赛</h1>
    </div>

    <NTabs
      :value="activeTab"
      type="line"
      animated
      @update:value="(v: TabKey) => { activeTab = v; handleTabChange() }"
    >
      <NTabPane name="all" tab="全部" />
      <NTabPane name="RUNNING" tab="进行中" />
      <NTabPane name="UPCOMING" tab="即将开始" />
      <NTabPane name="ENDED" tab="已结束" />
    </NTabs>

    <NSpin :show="loading">
      <div v-if="displayContests.data.length > 0" class="contest-grid">
        <div
          v-for="contest in displayContests.data"
          :key="contest.id"
          class="contest-card card"
          @click="goToContestDetail(contest.id)"
        >
          <div class="contest-card-top">
            <h3 class="contest-name">{{ contest.name }}</h3>
            <div class="contest-tags">
              <NTag :type="categoryTagType(contest.category)" size="tiny">
                {{ categoryLabel(contest.category) }}
              </NTag>
              <NTag :type="typeTagType(contest.type)" size="tiny">
                {{ contest.type }}
              </NTag>
              <NTag v-if="contest.rated" type="info" size="tiny">Rated</NTag>
            </div>
          </div>

          <div class="contest-card-body">
            <div class="contest-info-row">
              <StatusTag type="contest" :status="contest.status" />
            </div>

            <div class="contest-time-row">
              <div class="contest-time">
                开始：{{ formatDateTime(contest.startTime) }}
              </div>
              <div class="contest-time">
                结束：{{ formatDateTime(contest.endTime) }}
              </div>
            </div>

            <div
              v-if="contest.status === 'UPCOMING'"
              class="contest-countdown"
            >
              距开始：
              <CountdownTimer :target-time="contest.startTime" />
            </div>

            <div
              v-if="contest.status === 'RUNNING'"
              class="contest-countdown contest-countdown-running"
            >
              距结束：
              <CountdownTimer :target-time="contest.endTime" />
            </div>

            <div class="contest-organizer">
              主办方：{{ contest.organizer }}
            </div>
          </div>
        </div>
      </div>

      <NEmpty
        v-else
        description="暂无比赛"
        class="empty-state"
      />
    </NSpin>

    <div
      v-if="displayContests.total > pageSize"
      class="pagination-wrapper"
    >
      <NPagination
        v-model:page="currentPage"
        :page-size="pageSize"
        :item-count="displayContests.total"
        :page-slot="7"
        show-quick-jumper
      />
    </div>
  </div>
</template>

<style scoped>
.contest-list-page {
  padding-top: var(--gap-xl);
  padding-bottom: var(--gap-xl);
}

.page-header {
  margin-bottom: var(--gap-lg);
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* ==================== Grid ==================== */
.contest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: var(--gap-md);
  margin-top: var(--gap-lg);
}

.contest-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  padding: var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.contest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.contest-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap-sm);
}

.contest-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
  line-height: 1.4;
}

.contest-tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.contest-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.contest-info-row {
  display: flex;
  align-items: center;
}

.contest-time-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contest-countdown {
  color: var(--color-error);
  font-weight: 500;
  font-size: 0.88rem;
}

.contest-countdown-running {
  color: var(--color-success);
}

.contest-organizer {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ==================== Empty ==================== */
.empty-state {
  margin-top: var(--gap-xl);
}

/* ==================== Pagination ==================== */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--gap-xl);
}

/* ==================== Responsive ==================== */
@media (max-width: 768px) {
  .contest-grid {
    grid-template-columns: 1fr;
  }
}
</style>
