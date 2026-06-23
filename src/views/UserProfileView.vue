<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NTabs,
  NTabPane,
  NTag,
  NSpin,
  NEmpty,
  NIcon,
} from 'naive-ui'
import {
  TrophyOutline,
  CheckmarkCircleOutline,
  CalendarOutline,
  CodeOutline,
  BarChartOutline,
  CreateOutline,
  FlagOutline,
  TrendingUpOutline,
  TrendingDownOutline,
  TimeOutline,
} from '@vicons/ionicons5'
import { fetchUserProfile } from '../api/users'
import UserAvatar from '../components/UserAvatar.vue'
import type { UserProfile } from '../types'
import { formatDateTime, passRate } from '../utils'

const route = useRoute()
const router = useRouter()

const userId = computed(() => Number(route.params.id))
const profile = ref<UserProfile | null>(null)
const loading = ref(true)
const error = ref('')

const passRateStr = computed(() => {
  if (!profile.value) return '0%'
  return passRate(profile.value.acceptedCount, profile.value.submissionCount)
})

async function loadProfile(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchUserProfile(userId.value)
    if (res.code === 404 || !res.data) {
      error.value = '用户不存在'
      profile.value = null
      return
    }
    profile.value = res.data
  } catch {
    error.value = '加载用户信息失败'
  } finally {
    loading.value = false
  }
}

function goToProblem(problemId: number): void {
  router.push(`/problem/${problemId}`)
}

function goToSolution(solutionId: number): void {
  router.push(`/solution/${solutionId}`)
}

onMounted(loadProfile)
</script>

<template>
  <div class="user-profile">
    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <NEmpty :description="error" />
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="loading-placeholder">
      <NSpin :show="true" />
    </div>

    <!-- 用户主页内容 -->
    <template v-else-if="profile">
      <!-- ==================== 顶部信息横幅 ==================== -->
      <div class="profile-banner card">
        <div class="banner-left">
          <UserAvatar
            :username="profile.username"
            :avatar-url="profile.avatarUrl"
            :is-admin="profile.role === 'ADMIN'"
            size="large"
          />
          <div class="banner-info">
            <div class="banner-name-row">
              <h1 class="banner-username">{{ profile.username }}</h1>
              <NTag
                v-if="profile.role === 'ADMIN'"
                type="warning"
                size="small"
                round
              >
                管理员
              </NTag>
            </div>
            <p v-if="profile.signature" class="banner-signature">
              {{ profile.signature }}
            </p>
            <div class="banner-meta">
              <span class="meta-item">
                <NIcon size="14"><CalendarOutline /></NIcon>
                {{ formatDateTime(profile.createdAt) }} 加入
              </span>
            </div>
          </div>
        </div>

        <!-- Rating 展示 -->
        <div v-if="profile.rating !== undefined" class="banner-rating">
          <div class="rating-ring">
            <NIcon size="22" color="#faad14"><TrophyOutline /></NIcon>
            <span class="rating-number">{{ profile.rating }}</span>
          </div>
          <span class="rating-sublabel">Rating</span>
        </div>
      </div>

      <!-- ==================== 数据统计卡片 ==================== -->
      <div class="stats-row">
        <div class="stat-card card">
          <div class="stat-icon" style="background: #52c41a15; color: #52c41a">
            <NIcon size="22"><CheckmarkCircleOutline /></NIcon>
          </div>
          <div class="stat-body">
            <span class="stat-num">{{ profile.acceptedCount.toLocaleString() }}</span>
            <span class="stat-text">通过题数</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: #3498db15; color: #3498db">
            <NIcon size="22"><CodeOutline /></NIcon>
          </div>
          <div class="stat-body">
            <span class="stat-num">{{ profile.submissionCount.toLocaleString() }}</span>
            <span class="stat-text">提交总数</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: #9b59b615; color: #9b59b6">
            <NIcon size="22"><BarChartOutline /></NIcon>
          </div>
          <div class="stat-body">
            <span class="stat-num">{{ passRateStr }}</span>
            <span class="stat-text">通过率</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background: #faad1415; color: #faad14">
            <NIcon size="22"><TrophyOutline /></NIcon>
          </div>
          <div class="stat-body">
            <span class="stat-num">{{ (profile.rating ?? 0).toLocaleString() }}</span>
            <span class="stat-text">Rating</span>
          </div>
        </div>
      </div>

      <!-- ==================== Tab 区 ==================== -->
      <div class="tab-section card">
        <NTabs type="line" default-value="recent-ac" size="large">
          <!-- Tab 1: 最近通过 -->
          <NTabPane name="recent-ac" tab="最近通过">
            <div v-if="profile.recentAC.length > 0" class="ac-list">
              <div
                v-for="ac in profile.recentAC"
                :key="ac.problemId"
                class="ac-item"
                @click="goToProblem(ac.problemId)"
              >
                <div class="ac-main">
                  <div class="ac-status-icon">
                    <NIcon size="18" color="#52c41a">
                      <CheckmarkCircleOutline />
                    </NIcon>
                  </div>
                  <div class="ac-info">
                    <div class="ac-title-row">
                      <span class="ac-pid">P{{ ac.problemId }}</span>
                      <span class="ac-title">{{ ac.problemTitle }}</span>
                    </div>
                  </div>
                </div>
                <div class="ac-right">
                  <NIcon size="14" color="var(--text-muted)"><TimeOutline /></NIcon>
                  <span class="ac-time">{{ formatDateTime(ac.acceptedAt) }}</span>
                </div>
              </div>
            </div>
            <NEmpty v-else description="暂无通过记录" class="tab-empty" />
          </NTabPane>

          <!-- Tab 2: 题解 -->
          <NTabPane name="solutions" tab="题解">
            <div v-if="profile.solutions.length > 0" class="solution-grid">
              <div
                v-for="sol in profile.solutions"
                :key="sol.id"
                class="solution-item"
                @click="goToSolution(sol.id)"
              >
                <div class="solution-top">
                  <div class="solution-icon">
                    <NIcon size="18" color="#3498db"><CreateOutline /></NIcon>
                  </div>
                  <div class="solution-body">
                    <h4 class="solution-title">{{ sol.title }}</h4>
                    <p class="solution-desc">{{ sol.summary }}</p>
                  </div>
                </div>
                <div class="solution-meta">
                  <span class="solution-problem">
                    <NIcon size="13"><CodeOutline /></NIcon>
                    {{ sol.problemTitle }}
                  </span>
                  <span class="solution-date">{{ formatDateTime(sol.createdAt) }}</span>
                  <span class="solution-likes">
                    <NIcon size="13" color="#faad14"><TrophyOutline /></NIcon>
                    {{ sol.likeCount }}
                  </span>
                </div>
              </div>
            </div>
            <NEmpty v-else description="暂无题解" class="tab-empty" />
          </NTabPane>

          <!-- Tab 3: 比赛记录 -->
          <NTabPane name="contest-history" tab="比赛记录">
            <div v-if="profile.contestHistory.length > 0" class="history-list">
              <div
                v-for="record in profile.contestHistory"
                :key="record.contestId"
                class="history-item"
                @click="router.push(`/contest/${record.contestId}`)"
              >
                <div class="history-left">
                  <div class="history-rank-badge" :class="{ 'rank-podium': record.rank <= 3 }">
                    <NIcon v-if="record.rank <= 3" size="16" color="#faad14">
                      <TrophyOutline />
                    </NIcon>
                    <span v-else class="rank-text">#{{ record.rank }}</span>
                  </div>
                  <div class="history-contest-info">
                    <span class="history-contest-name">{{ record.contestName }}</span>
                    <span class="history-rank-label">
                      <NTag :type="record.rank <= 3 ? 'warning' : 'default'" size="tiny" round>
                        #{{ record.rank }}
                      </NTag>
                    </span>
                  </div>
                </div>
                <div class="history-rating">
                  <div
                    class="rating-change-badge"
                    :class="{
                      'rating-positive': record.ratingChange > 0,
                      'rating-negative': record.ratingChange < 0,
                      'rating-zero': record.ratingChange === 0,
                    }"
                  >
                    <NIcon size="14">
                      <TrendingUpOutline v-if="record.ratingChange > 0" />
                      <TrendingDownOutline v-else-if="record.ratingChange < 0" />
                      <FlagOutline v-else />
                    </NIcon>
                    <span>
                      {{ record.ratingChange > 0 ? '+' : '' }}{{ record.ratingChange }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <NEmpty v-else description="暂无比赛记录" class="tab-empty" />
          </NTabPane>
        </NTabs>
      </div>
    </template>
  </div>
</template>

<style scoped>
.user-profile {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  padding-bottom: var(--gap-xl);
}

/* ==================== 顶部横幅 ==================== */
.profile-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--gap-xl);
  background: linear-gradient(135deg, #f8fafd 0%, #eef4fb 100%);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: var(--gap-lg);
}

.banner-info {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.banner-name-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.banner-username {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.banner-signature {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
}

.banner-meta {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  margin-top: 2px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* 横幅 Rating */
.banner-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.rating-ring {
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
  background: linear-gradient(135deg, #fff7e6, #fffbe6);
  border: 2px solid #faad14;
  border-radius: 16px;
  padding: 8px 20px;
}

.rating-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: #d48806;
  line-height: 1;
}

.rating-sublabel {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* ==================== 统计行 ==================== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  padding: var(--gap-md) var(--gap-lg);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-body {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-text {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* ==================== Tab 区 ==================== */
.tab-section {
  padding: var(--gap-lg);
}

:deep(.n-tabs-nav) {
  margin-bottom: var(--gap-md);
}

.tab-empty {
  padding: var(--gap-xl) 0;
}

/* ==================== 最近通过 ==================== */
.ac-list {
  display: flex;
  flex-direction: column;
}

.ac-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  gap: var(--gap-md);
}

.ac-item:hover {
  background: #f5f8fb;
  transform: translateX(4px);
}

.ac-main {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  min-width: 0;
}

.ac-status-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #52c41a15;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ac-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ac-title-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  min-width: 0;
}

.ac-pid {
  font-weight: 700;
  color: var(--color-primary);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.ac-title {
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ac-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ac-time {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ==================== 题解 ==================== */
.solution-grid {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.solution-item {
  padding: var(--gap-lg);
  border: 1px solid #eef1f5;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.solution-item:hover {
  border-color: var(--color-primary-light);
  box-shadow: 0 2px 12px rgba(52, 152, 219, 0.08);
  transform: translateY(-1px);
}

.solution-top {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-md);
  margin-bottom: var(--gap-md);
}

.solution-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #3498db10;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.solution-body {
  flex: 1;
  min-width: 0;
}

.solution-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.solution-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.solution-meta {
  display: flex;
  align-items: center;
  gap: var(--gap-lg);
  font-size: 0.82rem;
  color: var(--text-muted);
  padding-top: var(--gap-sm);
  border-top: 1px solid #f0f2f5;
}

.solution-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ==================== 比赛记录 ==================== */
.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.15s;
  gap: var(--gap-md);
}

.history-item:hover {
  background: #f5f8fb;
  transform: translateX(4px);
}

.history-left {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  min-width: 0;
}

.history-rank-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-rank-badge.rank-podium {
  background: #fff7e6;
}

.history-rank-badge .rank-text {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.history-contest-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.history-contest-name {
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-rank-label {
  display: none;
}

.history-rating {
  flex-shrink: 0;
}

.rating-change-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.rating-positive {
  background: #52c41a12;
  color: #389e0d;
}

.rating-negative {
  background: #ff4d4f12;
  color: #cf1322;
}

.rating-zero {
  background: #f0f2f5;
  color: var(--text-muted);
}

/* ==================== 错误/加载 ==================== */
.error-state {
  padding: var(--gap-xl) 0;
}

.loading-placeholder {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ==================== 暗色模式 ==================== */
html.dark .profile-banner {
  background: linear-gradient(135deg, #1a2744 0%, #162138 100%);
}

html.dark .rating-ring {
  background: linear-gradient(135deg, #2a1f00, #2a2500);
  border-color: #8b6914;
}

html.dark .rating-number {
  color: #ffc53d;
}

html.dark .ac-item:hover {
  background: #1a2744;
}

html.dark .solution-item {
  border-color: #2a3a5a;
}

html.dark .solution-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(52, 152, 219, 0.12);
}

html.dark .solution-meta {
  border-color: #2a3a5a;
}

html.dark .history-item:hover {
  background: #1a2744;
}

html.dark .history-rank-badge {
  background: #1a2744;
}

html.dark .history-rank-badge.rank-podium {
  background: #2a1f00;
}

html.dark .rating-zero {
  background: #1a2744;
  color: var(--text-muted);
}

html.dark .stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-sm);
  }

  .stat-card {
    padding: var(--gap-sm);
    gap: var(--gap-sm);
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-num {
    font-size: 1.1rem;
  }

  .profile-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gap-md);
  }

  .banner-left {
    gap: var(--gap-md);
  }

  .banner-username {
    font-size: 1.3rem;
  }

  .banner-rating {
    align-self: flex-end;
  }

  .ac-item:hover,
  .history-item:hover {
    transform: none;
  }
}
</style>
