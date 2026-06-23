<script setup lang="ts">
import { h, computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NDataTable,
  NInput,
  NSelect,
  NButton,
  NTag,
  NSpace,
  NCollapse,
  NCollapseItem,
  NIcon,
  NTooltip,
} from 'naive-ui'
import {
  CheckmarkCircle,
  RemoveCircle,
  RemoveCircleOutline,
  FunnelOutline,
} from '@vicons/ionicons5'
import DifficultyTag from '../components/DifficultyTag.vue'
import EmptyState from '../components/EmptyState.vue'
import { useProblemStore } from '../stores/problem'
import { passRate } from '../utils'
import type { DataTableColumns } from 'naive-ui'
import type { Problem, Difficulty } from '../types'

const router = useRouter()
const store = useProblemStore()

// 所有可选算法标签
const ALL_TAGS = [
  'DP',
  'math',
  'string',
  'graph',
  'search',
  'data structures',
  'sorting',
  'recursion',
  'geometry',
  'other',
]

const TAG_LABEL_MAP: Record<string, string> = {
  DP: '动态规划',
  math: '数学',
  string: '字符串',
  graph: '图论',
  search: '搜索',
  'data structures': '数据结构',
  sorting: '排序',
  recursion: '递归',
  geometry: '几何',
  other: '其他',
}

// 来源选项
const sourceOptions = [
  { label: '全部', value: '' },
  { label: '原创', value: '原创' },
  { label: '洛谷', value: '洛谷' },
  { label: 'Codeforces', value: 'Codeforces' },
  { label: 'AtCoder', value: 'AtCoder' },
]

// 侧边栏折叠
const sidebarCollapsed = ref(false)

// 表格列定义
const columns: DataTableColumns<Problem> = [
  {
    title: '状态',
    key: 'status',
    width: 60,
    render(row) {
      if (row.status === 'AC') {
        return h(NIcon, { color: 'var(--color-success)', size: 20 }, { default: () => h(CheckmarkCircle) })
      }
      if (row.status === 'ATTEMPTED') {
        return h(NIcon, { color: 'var(--color-warning)', size: 20 }, { default: () => h(RemoveCircle) })
      }
      return h(NIcon, { color: '#ccc', size: 20 }, { default: () => h(RemoveCircleOutline) })
    },
  },
  {
    title: '编号',
    key: 'id',
    width: 100,
    sorter: true,
    render(row) {
      return `P${row.id}`
    },
  },
  {
    title: '标题',
    key: 'title',
    ellipsis: { tooltip: true },
    render(row) {
      return h(
        'a',
        {
          href: `/problem/${row.id}`,
          style: { color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 },
          onClick: (e: MouseEvent) => {
            e.preventDefault()
            router.push(`/problem/${row.id}`)
          },
        },
        row.title,
      )
    },
  },
  {
    title: '难度',
    key: 'difficulty',
    width: 90,
    sorter: true,
    render(row) {
      return h(DifficultyTag, { difficulty: row.difficulty })
    },
  },
  {
    title: '通过率',
    key: 'passRate',
    width: 120,
    sorter: true,
    render(row) {
      const rate = passRate(row.acceptedCount, row.submissionCount)
      const tips = `${row.acceptedCount} / ${row.submissionCount}`
      return h(
        NTooltip,
        {},
        {
          trigger: () => h('span', { style: { fontSize: '0.875rem' } }, rate),
          default: () => tips,
        },
      )
    },
  },
  {
    title: '算法标签',
    key: 'tags',
    width: 220,
    render(row) {
      const maxShow = 3
      const shown = row.tags.slice(0, maxShow)
      const overflow = row.tags.length - maxShow
      const tagNodes = shown.map((tag) =>
        h(
          NTag,
          { size: 'tiny', style: { marginRight: '4px' } },
          { default: () => TAG_LABEL_MAP[tag] || tag },
        ),
      )
      if (overflow > 0) {
        tagNodes.push(
          h(
            NTooltip,
            {},
            {
              trigger: () =>
                h(
                  NTag,
                  { size: 'tiny', style: { marginRight: '4px' } },
                  { default: () => `+${overflow}` },
                ),
              default: () => row.tags.slice(maxShow).map((t) => TAG_LABEL_MAP[t] || t).join('、'),
            },
          ),
        )
      }
      return h(NSpace, { wrap: false, style: { gap: '2px' } }, { default: () => tagNodes })
    },
  },
]

// 分页配置
const paginationProps = computed(() => ({
  page: store.currentPage,
  pageSize: store.pageSize,
  itemCount: store.total,
  pageSizes: [20, 50],
  showSizePicker: true,
  showQuickJumper: true,
  prefix: (info: { startIndex: number; endIndex: number }) =>
    `共 ${store.total} 题，当前 ${info.startIndex}-${info.endIndex}`,
}))

// 行点击
function handleRowClick(row: Problem): void {
  router.push(`/problem/${row.id}`)
}

// 搜索
function handleSearch(): void {
  store.currentPage = 1
  store.fetchProblems()
}

// 重置
function handleReset(): void {
  store.resetFilters()
  store.fetchProblems()
}

// 排序变更
function handleSorterChange(s: { columnKey: string; order: 'ascend' | 'descend' | false }): void {
  store.updateSorter(s.columnKey, s.order === false ? '' : s.order)
  store.currentPage = 1
  store.fetchProblems()
}

// 分页变更
function handlePageChange(page: number): void {
  store.setPage(page)
  store.fetchProblems()
}

function handlePageSizeChange(size: number): void {
  store.setPageSize(size)
  store.fetchProblems()
}

// 标签切换
function toggleTag(tag: string, checked: boolean): void {
  if (checked) {
    if (!store.filters.tags.includes(tag)) {
      store.filters.tags.push(tag)
    }
  } else {
    const idx = store.filters.tags.indexOf(tag)
    if (idx > -1) store.filters.tags.splice(idx, 1)
  }
}

// 难度选项
const difficultyOptions: { label: string; value: Difficulty }[] = [
  { label: '入门', value: 'entry' },
  { label: '普及', value: 'popularize' },
  { label: '提高', value: 'improve' },
  { label: '省选', value: 'provincial' },
  { label: 'NOI', value: 'NOI' },
]

// 初始加载
onMounted(() => {
  store.fetchProblems()
})
</script>

<template>
  <div class="problem-list-page">
    <!-- 侧边栏切换按钮 -->
    <div class="sidebar-toggle">
      <NButton
        text
        circle
        @click="sidebarCollapsed = !sidebarCollapsed"
        :aria-label="sidebarCollapsed ? '展开筛选' : '收起筛选'"
      >
        <template #icon>
          <NIcon size="20">
            <FunnelOutline />
          </NIcon>
        </template>
      </NButton>
    </div>

    <!-- 左侧筛选栏 -->
    <aside class="filter-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <NCard size="small">
        <template #header>
          <div class="filter-header">
            <span>筛选条件</span>
            <NButton text size="tiny" @click="handleReset">重置</NButton>
          </div>
        </template>

        <NSpace vertical>
          <!-- 题目编号 -->
          <div class="filter-item">
            <label class="filter-label">题目编号</label>
            <NInput
              v-model:value="store.filters.id"
              placeholder="如 P1001"
              clearable
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- 题目标题 -->
          <div class="filter-item">
            <label class="filter-label">题目标题</label>
            <NInput
              v-model:value="store.filters.keyword"
              placeholder="模糊搜索"
              clearable
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- 难度 -->
          <div class="filter-item">
            <label class="filter-label">难度</label>
            <NCollapse>
              <NCollapseItem title="难度选择" name="difficulty">
                <NSpace vertical :size="4">
                  <label
                    v-for="opt in difficultyOptions"
                    :key="opt.value"
                    style="display: flex; align-items: center; gap: 6px; cursor: pointer"
                  >
                    <input
                      type="checkbox"
                      :value="opt.value"
                      :checked="store.filters.difficulty.includes(opt.value)"
                      @change="(e: Event) => {
                        const checked = (e.target as HTMLInputElement).checked
                        if (checked) {
                          store.filters.difficulty.push(opt.value)
                        } else {
                          const idx = store.filters.difficulty.indexOf(opt.value)
                          if (idx > -1) store.filters.difficulty.splice(idx, 1)
                        }
                      }"
                    />
                    <span>{{ opt.label }}</span>
                  </label>
                </NSpace>
              </NCollapseItem>
            </NCollapse>
          </div>

          <!-- 算法标签 -->
          <div class="filter-item">
            <label class="filter-label">算法标签</label>
            <NCollapse>
              <NCollapseItem title="标签选择" name="tags">
                <NSpace wrap :size="4">
                  <NTag
                    v-for="tag in ALL_TAGS"
                    :key="tag"
                    :type="store.filters.tags.includes(tag) ? 'primary' : 'default'"
                    :checked="store.filters.tags.includes(tag)"
                    checkable
                    size="small"
                    @update:checked="(checked: boolean) => toggleTag(tag, checked)"
                  >
                    {{ TAG_LABEL_MAP[tag] || tag }}
                  </NTag>
                </NSpace>
              </NCollapseItem>
            </NCollapse>
          </div>

          <!-- 来源 -->
          <div class="filter-item">
            <label class="filter-label">题目来源</label>
            <NSelect
              v-model:value="store.filters.source"
              :options="sourceOptions"
              clearable
              placeholder="全部"
            />
          </div>

          <!-- 搜索按钮 -->
          <NButton type="primary" block @click="handleSearch">搜索</NButton>
        </NSpace>
      </NCard>
    </aside>

    <!-- 右侧表格区 -->
    <main class="table-area">
      <NCard>
        <!-- 错误状态 -->
        <div v-if="store.error" class="error-state">
          <p>{{ store.error }}</p>
          <NButton type="primary" size="small" @click="store.fetchProblems()">重试</NButton>
        </div>

        <!-- 数据表格 -->
        <NDataTable
          v-else
          :columns="columns"
          :data="store.problemList"
          :loading="store.loading"
          :pagination="paginationProps"
          :row-props="(row: Problem) => ({
            style: 'cursor: pointer;',
            onClick: () => handleRowClick(row),
          })"
          remote
          :on-update:sorter="handleSorterChange"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        >
          <!-- 空状态 -->
          <template #empty>
            <EmptyState description="没有找到符合条件的题目" />
          </template>
        </NDataTable>
      </NCard>
    </main>
  </div>
</template>

<style scoped>
.problem-list-page {
  display: flex;
  gap: var(--gap-md);
  align-items: flex-start;
}

/* 侧边栏切换 */
.sidebar-toggle {
  display: none;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 2px;
}

/* 筛选侧边栏 */
.filter-sidebar {
  width: 260px;
  flex-shrink: 0;
  transition: width 0.3s, opacity 0.3s, margin 0.3s;
}

.filter-sidebar.collapsed {
  width: 0;
  opacity: 0;
  margin: 0;
  overflow: hidden;
  padding: 0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-item {
  margin-bottom: var(--gap-xs);
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

/* 表格区 */
.table-area {
  flex: 1;
  min-width: 0;
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: var(--gap-xl);
  color: var(--color-error);
}

/* 响应式 */
@media (max-width: 768px) {
  .problem-list-page {
    flex-direction: column;
  }

  .sidebar-toggle {
    display: block;
  }

  .filter-sidebar {
    width: 100%;
  }

  .filter-sidebar.collapsed {
    display: none;
  }
}
</style>
