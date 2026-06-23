<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NTabs,
  NTabPane,
  NTag,
  NSpin,
  NDataTable,
  NEmpty,
  NIcon,
  useMessage,
} from 'naive-ui'
import { FlameOutline } from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import type { ContestDetail, ContestProblem, RankRecord, Submission } from '../types'
import { fetchContestDetail, fetchContestProblems, fetchContestRanking, fetchContestSubmissions } from '../api/contests'
import CountdownTimer from '../components/CountdownTimer.vue'
import StatusTag from '../components/StatusTag.vue'
import DifficultyTag from '../components/DifficultyTag.vue'
import MdRenderer from '../components/MdRenderer.vue'
import TrophySvg from '../assets/trophy.svg?raw'
import MedalSvg from '../assets/medal.svg?raw'
import { formatDateTime, passRate } from '../utils'

const route = useRoute()
const router = useRouter()
const message = useMessage()

// ==================== 基础状态 ====================

const contestId = computed(() => Number(route.params.id))
const detail = ref<ContestDetail | null>(null)
const detailLoading = ref(true)

const activeTab = ref('problems')

// ==================== Tab 数据 ====================

const problems = ref<ContestProblem[]>([])
const problemsLoading = ref(false)

const ranking = ref<RankRecord[]>([])
const rankingLoading = ref(false)

const submissions = ref<Submission[]>([])
const submissionsLoading = ref(false)

// ==================== 倒计时目标时间 ====================

const countdownTarget = computed(() => {
  if (!detail.value) return ''
  if (detail.value.status === 'UPCOMING') return detail.value.startTime
  if (detail.value.status === 'RUNNING') return detail.value.endTime
  return ''
})

const countdownLabel = computed(() => {
  if (!detail.value) return ''
  if (detail.value.status === 'UPCOMING') return '距开始'
  if (detail.value.status === 'RUNNING') return '距结束'
  return ''
})

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

// ==================== 数据加载 ====================

async function loadDetail(): Promise<void> {
  detailLoading.value = true
  try {
    const res = await fetchContestDetail(contestId.value)
    if (!res.data) {
      message.error('比赛不存在')
      router.replace('/contest')
      return
    }
    detail.value = res.data
  } catch {
    message.error('加载比赛详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function loadProblems(): Promise<void> {
  if (problems.value.length > 0) return
  problemsLoading.value = true
  try {
    const res = await fetchContestProblems(contestId.value)
    problems.value = res.data
  } catch {
    message.error('加载题目列表失败')
  } finally {
    problemsLoading.value = false
  }
}

async function loadRanking(): Promise<void> {
  if (ranking.value.length > 0) return
  rankingLoading.value = true
  try {
    const res = await fetchContestRanking(contestId.value)
    ranking.value = res.data
  } catch {
    message.error('加载排名失败')
  } finally {
    rankingLoading.value = false
  }
}

async function loadSubmissions(): Promise<void> {
  if (submissions.value.length > 0) return
  submissionsLoading.value = true
  try {
    const res = await fetchContestSubmissions(contestId.value)
    submissions.value = res.data
  } catch {
    message.error('加载提交记录失败')
  } finally {
    submissionsLoading.value = false
  }
}

function handleTabChange(tab: string): void {
  activeTab.value = tab
  if (tab === 'problems') loadProblems()
  else if (tab === 'ranking') loadRanking()
  else if (tab === 'my-submissions') loadSubmissions()
}

// ==================== 判断比赛是否结束 ====================

const isEnded = computed(() => detail.value?.status === 'ENDED')

// ==================== 题目表格列 ====================

const problemColumns = computed<DataTableColumns<ContestProblem>>(() => [
  {
    title: '#',
    key: 'order',
    width: 60,
    align: 'center',
  },
  {
    title: '题目名称',
    key: 'title',
    render(row) {
      return row.title
    },
  },
  {
    title: '难度',
    key: 'difficulty',
    width: 90,
    align: 'center',
    render(row) {
      return h(DifficultyTag, { difficulty: row.difficulty })
    },
  },
  {
    title: '通过率',
    key: 'passRate',
    width: 120,
    align: 'center',
    render(row) {
      if (!isEnded.value && detail.value?.status === 'RUNNING') {
        return '—'
      }
      return passRate(row.acceptedCount, row.submissionCount)
    },
  },
  {
    title: '通过/提交',
    key: 'stats',
    width: 130,
    align: 'center',
    render(row) {
      if (!isEnded.value && detail.value?.status === 'RUNNING') {
        return '— / —'
      }
      return `${row.acceptedCount} / ${row.submissionCount}`
    },
  },
])

// ==================== 排名表格列 ====================

const rankingColumns = computed<DataTableColumns<RankRecord>>(() => {
  const problemCount = detail.value?.problems.length || 0
  const baseCols: DataTableColumns<RankRecord> = [
    {
      title: '排名',
      key: 'rank',
      width: 70,
      align: 'center',
      render(row) {
        if (row.rank === 1) return h('span', { class: 'rank-medal rank-gold' }, [h(NIcon, { size: 22, color: '#f0a020' }, { default: () => h('i', { innerHTML: TrophySvg, class: 'medal-svg' }) })])
        if (row.rank === 2) return h('span', { class: 'rank-medal rank-silver' }, [h(NIcon, { size: 22, color: '#909399' }, { default: () => h('i', { innerHTML: MedalSvg, class: 'medal-svg' }) })])
        if (row.rank === 3) return h('span', { class: 'rank-medal rank-bronze' }, [h(NIcon, { size: 22, color: '#cd7f32' }, { default: () => h('i', { innerHTML: MedalSvg, class: 'medal-svg' }) })])
        return row.rank
      },
    },
    {
      title: '用户名',
      key: 'username',
      width: 150,
    },
  ]

  // 每题得分列
  for (let i = 0; i < problemCount; i++) {
    baseCols.push({
      title: String.fromCharCode(65 + i), // A, B, C, ...
      key: `score_${i}`,
      width: 80,
      align: 'center',
      render(row) {
        const score = row.scores[i] ?? 0
        if (detail.value?.type === 'ICPC') {
          return score > 0 ? '✓' : '—'
        }
        return score
      },
    })
  }

  baseCols.push({
    title: '总分',
    key: 'totalScore',
    width: 90,
    align: 'center',
    render(row) {
      return `${row.totalScore}`
    },
  })

  if (detail.value?.type === 'ICPC') {
    baseCols.push({
      title: '罚时',
      key: 'penalty',
      width: 80,
      align: 'center',
      render(row) {
        return `${row.penalty} min`
      },
    })
  }

  return baseCols
})

// ==================== 提交表格列 ====================

const submissionColumns: DataTableColumns<Submission> = [
  {
    title: '提交ID',
    key: 'id',
    width: 120,
  },
  {
    title: '题目',
    key: 'problemId',
    width: 80,
    align: 'center',
  },
  {
    title: '语言',
    key: 'language',
    width: 90,
    align: 'center',
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    align: 'center',
    render(row) {
      return h(StatusTag, { type: 'judge', status: row.status })
    },
  },
  {
    title: '运行时间',
    key: 'time',
    width: 90,
    align: 'center',
    render(row) {
      return row.time != null ? `${row.time} ms` : '—'
    },
  },
  {
    title: '内存',
    key: 'memory',
    width: 90,
    align: 'center',
    render(row) {
      return row.memory != null ? `${(row.memory / 1024).toFixed(1)} MB` : '—'
    },
  },
  {
    title: '提交时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDateTime(row.createdAt)
    },
  },
]

// ==================== h 函数 ====================
import { h } from 'vue'

function goToProblem(problemId: number): void {
  router.push(`/problem/${problemId}`)
}

onMounted(loadDetail)
</script>

<template>
  <div class="contest-detail-page container">
    <NSpin :show="detailLoading">
      <template v-if="detail">
        <!-- ==================== 比赛头部 ==================== -->
        <div class="contest-header card">
          <div class="contest-header-top">
            <div class="contest-header-left">
              <h1 class="contest-title">{{ detail.name }}</h1>
              <div class="contest-meta">
                <NTag :type="categoryTagType(detail.category)" size="small">
                  {{ categoryLabel(detail.category) }}
                </NTag>
                <NTag
                  :type="detail.type === 'ICPC' ? 'info' : detail.type === 'OI' ? 'warning' : 'default'"
                  size="small"
                >
                  {{ detail.type }}
                </NTag>
                <NTag v-if="detail.rated" type="info" size="small">Rated</NTag>
                <StatusTag type="contest" :status="detail.status" />
              </div>
            </div>

            <!-- 倒计时 -->
            <div
              v-if="countdownTarget"
              class="contest-countdown-box"
              :class="{
                'countdown-upcoming': detail.status === 'UPCOMING',
                'countdown-running': detail.status === 'RUNNING',
              }"
            >
              <div class="countdown-icon-label">
                <NIcon size="22"><FlameOutline /></NIcon>
                <span>{{ countdownLabel }}</span>
              </div>
              <div class="countdown-value">
                <CountdownTimer :target-time="countdownTarget" />
              </div>
            </div>
          </div>

          <div class="contest-header-info">
            <div class="info-item">
              <span class="info-label">开始时间：</span>
              <span>{{ formatDateTime(detail.startTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">结束时间：</span>
              <span>{{ formatDateTime(detail.endTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">主办方：</span>
              <span>{{ detail.organizer }}</span>
            </div>
          </div>
        </div>

        <!-- ==================== Tab 内容区 ==================== -->
        <div class="contest-tabs card">
          <NTabs
            :value="activeTab"
            type="line"
            animated
            @update:value="(v: string) => handleTabChange(v)"
          >
            <!-- ========== 题目列表 Tab ========== -->
            <NTabPane name="problems" tab="题目列表">
              <NSpin :show="problemsLoading">
                <NDataTable
                  v-if="problems.length > 0"
                  :columns="problemColumns"
                  :data="problems"
                  :row-key="(r: ContestProblem) => r.id"
                  :single-line="false"
                  size="small"
                  striped
                  @update:checked-row-keys="() => {}"
                />
                <NEmpty v-else description="暂无题目" />
              </NSpin>
            </NTabPane>

            <!-- ========== 排名 Tab ========== -->
            <NTabPane name="ranking" tab="排名">
              <NSpin :show="rankingLoading">
                <NDataTable
                  v-if="ranking.length > 0"
                  :columns="rankingColumns"
                  :data="ranking"
                  :row-key="(r: RankRecord) => r.userId"
                  :single-line="false"
                  size="small"
                  striped
                />
                <NEmpty v-else description="暂无排名数据" />
              </NSpin>
            </NTabPane>

            <!-- ========== 规则 Tab ========== -->
            <NTabPane name="rules" tab="规则">
              <div class="rules-content">
                <MdRenderer
                  v-if="detail.description"
                  :content="detail.description"
                />
                <NEmpty v-else description="暂无规则说明" />
              </div>
            </NTabPane>

            <!-- ========== 我的提交 Tab ========== -->
            <NTabPane name="my-submissions" tab="我的提交">
              <NSpin :show="submissionsLoading">
                <NDataTable
                  v-if="submissions.length > 0"
                  :columns="submissionColumns"
                  :data="submissions"
                  :row-key="(r: Submission) => r.id"
                  :single-line="false"
                  size="small"
                  striped
                />
                <NEmpty v-else description="暂无提交记录" />
              </NSpin>
            </NTabPane>
          </NTabs>
        </div>
      </template>

      <NEmpty v-else-if="!detailLoading" description="比赛不存在" />
    </NSpin>
  </div>
</template>

<style scoped>
.contest-detail-page {
  padding-top: var(--gap-xl);
  padding-bottom: var(--gap-xl);
}

/* ==================== Header ==================== */
.contest-header {
  padding: var(--gap-lg);
  margin-bottom: var(--gap-lg);
}

.contest-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap-lg);
  flex-wrap: wrap;
}

.contest-header-left {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  flex: 1;
  min-width: 0;
}

.contest-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.contest-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* ==================== Countdown Box ==================== */
.contest-countdown-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--gap-md) var(--gap-lg);
  border-radius: var(--border-radius);
  min-width: 180px;
  flex-shrink: 0;
}

.contest-countdown-box.countdown-upcoming {
  background: #fff3e0;
  color: #e65100;
}

.contest-countdown-box.countdown-running {
  background: #e8f5e9;
  color: #2e7d32;
}

.countdown-icon-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.countdown-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ==================== Header Info ==================== */
.contest-header-info {
  display: flex;
  gap: var(--gap-lg);
  margin-top: var(--gap-md);
  flex-wrap: wrap;
  padding-top: var(--gap-md);
  border-top: 1px solid #f0f0f0;
}

.info-item {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.info-label {
  color: var(--text-muted);
}

/* ==================== Tabs ==================== */
.contest-tabs {
  padding: var(--gap-md);
}

.rules-content {
  padding: var(--gap-md) 0;
  max-width: 900px;
}

/* ==================== Rank Medal ==================== */
.rank-medal {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 700;
  font-size: 0.9rem;
}

.rank-gold {
  color: #f0a020;
}

.rank-silver {
  color: #909399;
}

.rank-bronze {
  color: #cd7f32;
}

.medal-svg {
  display: inline-flex;
  line-height: 1;
}
.medal-svg :deep(svg) {
  display: block;
  width: 1em;
  height: 1em;
}

/* ==================== Responsive ==================== */
@media (max-width: 768px) {
  .contest-header-top {
    flex-direction: column;
  }

  .contest-countdown-box {
    width: 100%;
  }

  .contest-header-info {
    flex-direction: column;
    gap: var(--gap-sm);
  }
}
</style>
