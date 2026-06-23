<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpin,
  NPagination,
  NEmpty,
  NButton,
  NIcon,
  NRadioGroup,
  NRadioButton,
  NInput,
  NInputGroup,
  NTag,
  useMessage,
} from 'naive-ui'
import { ThumbsUpOutline, CreateOutline, SearchOutline } from '@vicons/ionicons5'
import { useSolutionStore } from '../stores/solution'
import UserAvatar from '../components/UserAvatar.vue'
import { formatDateTime } from '../utils'

const router = useRouter()
const message = useMessage()
const store = useSolutionStore()

// ==================== 状态 ====================

const searchKeyword = ref('')

const sortOptions = [
  { label: '按时间', value: 'time' as const },
  { label: '按点赞', value: 'like' as const },
]

// ==================== 数据加载 ====================

async function loadList(): Promise<void> {
  try {
    await store.fetchAllList()
  } catch {
    message.error('加载题解列表失败')
  }
}

// ==================== 搜索 ====================

function handleSearch(): void {
  store.fetchAllList(searchKeyword.value.trim() || undefined)
}

function handleClearSearch(): void {
  searchKeyword.value = ''
  store.fetchAllList(undefined)
}

// ==================== 排序 / 分页 ====================

async function handleSortChange(sort: 'like' | 'time'): Promise<void> {
  await store.changeAllSort(sort)
}

async function handlePageChange(page: number): Promise<void> {
  await store.changeAllPage(page)
}

// ==================== 导航 ====================

function goToDetail(id: number): void {
  router.push(`/solution/${id}`)
}

function goToProblem(problemId: number): void {
  router.push(`/problem/${problemId}`)
}

function handlePublish(): void {
  if (!store.isLoggedIn) {
    message.warning('请先登录后再发布题解')
    return
  }
  message.info('发布题解功能将在后续版本开放')
}

// ==================== 生命周期 ====================

onMounted(loadList)
</script>

<template>
  <div class="plaza-page container">
    <!-- ==================== 页面头部 ==================== -->
    <div class="page-header">
      <div class="page-header-top">
        <div class="page-header-left">
          <h1 class="page-title">题解广场</h1>
          <span
            v-if="store.allTotal > 0"
            class="page-count"
          >
            共 {{ store.allTotal }} 篇题解
          </span>
        </div>
        <NButton
          type="primary"
          @click="handlePublish"
          class="publish-btn"
        >
          <template #icon>
            <NIcon><CreateOutline /></NIcon>
          </template>
          发布题解
        </NButton>
      </div>

      <!-- 搜索 + 排序栏 -->
      <div class="toolbar">
        <div class="search-bar">
          <NInputGroup>
            <NInput
              v-model:value="searchKeyword"
              placeholder="搜索题解标题、题目名称、作者..."
              clearable
              :style="{ width: '320px' }"
              @keyup.enter="handleSearch"
              @clear="handleClearSearch"
            >
              <template #prefix>
                <NIcon><SearchOutline /></NIcon>
              </template>
            </NInput>
            <NButton
              type="primary"
              @click="handleSearch"
            >
              搜索
            </NButton>
          </NInputGroup>
        </div>

        <div class="sort-bar">
          <span class="sort-label">排序：</span>
          <NRadioGroup
            :value="store.allFilters.sort"
            size="small"
            @update:value="(v: 'like' | 'time') => handleSortChange(v)"
          >
            <NRadioButton
              v-for="opt in sortOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            />
          </NRadioGroup>
        </div>
      </div>
    </div>

    <!-- ==================== 加载状态 ==================== -->
    <NSpin :show="store.allLoading">
      <!-- 题解卡片列表 -->
      <div
        v-if="store.allList.length > 0"
        class="solution-list"
      >
        <article
          v-for="sol in store.allList"
          :key="sol.id"
          class="solution-card card"
          @click="goToDetail(sol.id)"
        >
          <div class="card-left">
            <UserAvatar
              :avatar-url="sol.author.avatarUrl"
              :username="sol.author.username"
              size="medium"
            />
          </div>

          <div class="card-body">
            <div class="card-body-top">
              <h3 class="solution-title">{{ sol.title }}</h3>
              <div class="solution-likes">
                <NIcon size="16"><ThumbsUpOutline /></NIcon>
                <span>{{ sol.likeCount }}</span>
              </div>
            </div>

            <p class="solution-summary">{{ sol.summary }}</p>

            <div class="solution-meta">
              <span class="solution-author">{{ sol.author.username }}</span>
              <span class="meta-divider">·</span>
              <NTag
                size="tiny"
                :bordered="false"
                @click.stop="goToProblem(sol.problemId)"
                class="problem-tag"
              >
                {{ sol.problemTitle }}
              </NTag>
              <span class="meta-divider">·</span>
              <span class="solution-time">{{ formatDateTime(sol.createdAt) }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <NEmpty
        v-else-if="!store.allLoading"
        :description="store.allFilters.keyword ? '未找到匹配的题解' : '暂无题解，来做第一个分享的人吧！'"
        class="empty-state"
      />
    </NSpin>

    <!-- ==================== 分页 ==================== -->
    <div
      v-if="store.allTotalPages > 1"
      class="pagination-wrapper"
    >
      <NPagination
        :page="store.allFilters.page"
        :page-size="store.allFilters.size"
        :item-count="store.allTotal"
        :page-slot="7"
        show-quick-jumper
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.plaza-page {
  padding-top: var(--gap-xl);
  padding-bottom: var(--gap-xl);
}

/* ==================== 页面头部 ==================== */
.page-header {
  margin-bottom: var(--gap-lg);
}

.page-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-md);
  flex-wrap: wrap;
}

.page-header-left {
  display: flex;
  align-items: baseline;
  gap: var(--gap-md);
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-count {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.publish-btn {
  flex-shrink: 0;
}

/* ==================== 工具栏 ==================== */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-md);
  margin-top: var(--gap-md);
  padding: var(--gap-sm) 0;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.search-bar {
  flex-shrink: 0;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  flex-shrink: 0;
}

.sort-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ==================== 卡片列表 ==================== */
.solution-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.solution-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  padding: var(--gap-md);
  display: flex;
  gap: var(--gap-md);
}

.solution-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-left {
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-body-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap-sm);
}

.solution-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
  min-width: 0;

  /* 单行省略 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.solution-likes {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.9rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.solution-summary {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;

  /* 两行省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.solution-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.meta-divider {
  margin: 0 2px;
  user-select: none;
}

.problem-tag {
  cursor: pointer;
  font-size: 0.8rem;
}

.problem-tag:hover {
  color: var(--color-primary);
}

/* ==================== 空状态 ==================== */
.empty-state {
  margin-top: var(--gap-xl);
}

/* ==================== 分页 ==================== */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--gap-xl);
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-bar .n-input {
    width: 100% !important;
  }

  .page-header-top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
