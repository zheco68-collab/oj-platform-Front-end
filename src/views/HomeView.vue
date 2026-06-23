<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton,
  NInputNumber,
  NTag,
  NIcon,
  NSpin,
  useMessage,
} from 'naive-ui'
import { ChevronBack, ChevronForward, FlameOutline, ArrowForward, BulbOutline } from '@vicons/ionicons5'
import type { Banner, Announcement, Contest } from '../types'
import { fetchBanners, fetchHomeContests, fetchAnnouncements } from '../api/home'
import { mockProblems } from '../api/mock/problems'
import CountdownTimer from '../components/CountdownTimer.vue'
import StatusTag from '../components/StatusTag.vue'
import { formatDateTime } from '../utils'

const router = useRouter()
const message = useMessage()

// ==================== Banner ====================

const banners = ref<Banner[]>([])
const bannerLoading = ref(true)
const currentBannerIndex = ref(0)
let bannerTimer: ReturnType<typeof setInterval> | null = null

function startBannerAutoPlay(): void {
  bannerTimer = setInterval(() => {
    if (banners.value.length > 0) {
      currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.value.length
    }
  }, 4000)
}

function stopBannerAutoPlay(): void {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

function goToBanner(index: number): void {
  stopBannerAutoPlay()
  currentBannerIndex.value = index
  startBannerAutoPlay()
}

function prevBanner(): void {
  const len = banners.value.length
  currentBannerIndex.value = (currentBannerIndex.value - 1 + len) % len
}

function nextBanner(): void {
  const len = banners.value.length
  currentBannerIndex.value = (currentBannerIndex.value + 1) % len
}

function clickBanner(): void {
  const banner = banners.value[currentBannerIndex.value]
  if (banner?.linkUrl) {
    router.push(banner.linkUrl)
  }
}

// ==================== 倒计时栏 ====================

const upcomingContests = ref<Contest[]>([])

// ==================== 快捷跳题 ====================

const jumpProblemId = ref<number | null>(null)

function jumpToProblem(): void {
  const id = jumpProblemId.value
  if (id && id > 0) {
    router.push(`/problem/${id}`)
  } else {
    message.warning('请输入有效的题目编号')
  }
}

function randomJump(): void {
  if (mockProblems.length === 0) return
  const randomIndex = Math.floor(Math.random() * mockProblems.length)
  const problem = mockProblems[randomIndex]
  router.push(`/problem/${problem.id}`)
}

// ==================== 公告 ====================

const announcements = ref<Announcement[]>([])
const announcementsLoading = ref(true)

// ==================== 近期比赛 ====================

const recentContests = ref<Contest[]>([])
const contestsLoading = ref(true)

// ==================== 加载数据 ====================

async function loadAllData(): Promise<void> {
  try {
    const [bannersRes, contestsRes, announcementsRes] = await Promise.all([
      fetchBanners(),
      fetchHomeContests(8),
      fetchAnnouncements(),
    ])
    banners.value = bannersRes.data
    bannerLoading.value = false
    recentContests.value = contestsRes.data
    contestsLoading.value = false
    announcements.value = announcementsRes.data
    announcementsLoading.value = false

    upcomingContests.value = contestsRes.data
      .filter((c) => c.status === 'UPCOMING')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    if (banners.value.length > 0) {
      startBannerAutoPlay()
    }
  } catch {
    message.error('加载首页数据失败')
  }
}

onMounted(loadAllData)
onUnmounted(stopBannerAutoPlay)
</script>

<template>
  <div class="home-page">
    <!-- ==================== Banner 轮播 ==================== -->
    <div class="banner-section">
      <NSpin :show="bannerLoading">
        <div
          v-if="banners.length > 0"
          class="banner-carousel"
          @mouseenter="stopBannerAutoPlay"
          @mouseleave="startBannerAutoPlay"
        >
          <div
            class="banner-slide"
            :key="banners[currentBannerIndex]?.id"
            @click="clickBanner"
          >
            <img
              :src="banners[currentBannerIndex]?.imageUrl"
              :alt="banners[currentBannerIndex]?.title"
              class="banner-image"
            />
            <div class="banner-caption">
              {{ banners[currentBannerIndex]?.title }}
            </div>
          </div>

          <button class="banner-arrow banner-arrow-left" @click.stop="prevBanner" aria-label="上一张">
            <NIcon size="24"><ChevronBack /></NIcon>
          </button>
          <button class="banner-arrow banner-arrow-right" @click.stop="nextBanner" aria-label="下一张">
            <NIcon size="24"><ChevronForward /></NIcon>
          </button>

          <div class="banner-dots">
            <span
              v-for="(b, i) in banners"
              :key="b.id"
              class="banner-dot"
              :class="{ active: i === currentBannerIndex }"
              @click.stop="goToBanner(i)"
            />
          </div>
        </div>
        <div v-else class="banner-empty">
          暂无 Banner
        </div>
      </NSpin>
    </div>

    <div class="home-content container">
      <!-- ==================== 倒计时栏 ==================== -->
      <div v-if="upcomingContests.length > 0" class="countdown-section card">
        <div class="countdown-header">
          <NIcon size="22" color="#ff4d4f"><FlameOutline /></NIcon>
          <span class="countdown-label">
            距 <strong>{{ upcomingContests[0].name }}</strong> 还有
          </span>
        </div>
        <div class="countdown-value">
          <CountdownTimer :target-time="upcomingContests[0].startTime" />
        </div>
        <NButton
          text
          type="primary"
          @click="router.push(`/contest/${upcomingContests[0].id}`)"
        >
          查看详情
          <template #icon><NIcon><ArrowForward /></NIcon></template>
        </NButton>
      </div>

      <!-- ==================== 快捷跳题 ==================== -->
      <div class="quickjump-section card">
        <div class="quickjump-title">快捷跳题</div>
        <div class="quickjump-form">
          <NInputNumber
            v-model:value="jumpProblemId"
            :min="1"
            placeholder="输入题目编号"
            clearable
            class="quickjump-input"
            @keyup.enter="jumpToProblem"
          />
          <NButton type="primary" @click="jumpToProblem">跳转</NButton>
          <NButton @click="randomJump">
            <template #icon><NIcon><BulbOutline /></NIcon></template>
            随机跳题
          </NButton>
        </div>
      </div>

      <!-- ==================== 公告区 ==================== -->
      <div class="announcement-section card">
        <div class="section-header">
          <h2>站内公告</h2>
        </div>
        <NSpin :show="announcementsLoading">
          <div v-if="announcements.length > 0" class="announcement-list">
            <div
              v-for="ann in announcements"
              :key="ann.id"
              class="announcement-item"
            >
              <div class="announcement-title-row">
                <NTag
                  v-if="ann.pinned"
                  type="error"
                  size="tiny"
                  round
                  class="announcement-pin"
                >
                  置顶
                </NTag>
                <span class="announcement-title">{{ ann.title }}</span>
              </div>
              <span class="announcement-time">{{ formatDateTime(ann.createdAt) }}</span>
            </div>
          </div>
          <div v-else class="empty-text">暂无公告</div>
        </NSpin>
      </div>

      <!-- ==================== 近期比赛 ==================== -->
      <div class="contest-section">
        <div class="section-header">
          <h2>近期比赛</h2>
          <NButton text type="primary" @click="router.push('/contest')">
            查看全部
            <template #icon><NIcon><ArrowForward /></NIcon></template>
          </NButton>
        </div>
        <NSpin :show="contestsLoading">
          <div v-if="recentContests.length > 0" class="contest-grid">
            <div
              v-for="contest in recentContests"
              :key="contest.id"
              class="contest-card card"
              @click="router.push(`/contest/${contest.id}`)"
            >
              <div class="contest-card-header">
                <h3 class="contest-name">{{ contest.name }}</h3>
                <div class="contest-tags">
                  <NTag
                    :type="contest.category === 'OFFICIAL' ? 'info' : contest.category === 'TEAM' ? 'warning' : 'default'"
                    size="tiny"
                  >
                    {{ contest.category === 'OFFICIAL' ? '官方比赛' : contest.category === 'TEAM' ? '团队赛' : '公开赛' }}
                  </NTag>
                  <NTag
                    :type="contest.rated ? 'info' : 'default'"
                    size="tiny"
                  >
                    {{ contest.type }}
                  </NTag>
                  <NTag v-if="contest.rated" type="info" size="tiny">Rated</NTag>
                </div>
              </div>
              <div class="contest-card-body">
                <div class="contest-info-row">
                  <StatusTag type="contest" :status="contest.status" />
                </div>
                <div class="contest-time">
                  开始：{{ formatDateTime(contest.startTime) }}
                </div>
                <div v-if="contest.status === 'UPCOMING'" class="contest-countdown">
                  倒计时：<CountdownTimer :target-time="contest.startTime" />
                </div>
                <div class="contest-organizer">
                  主办方：{{ contest.organizer }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-text">暂无比赛</div>
        </NSpin>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: var(--gap-xl);
}

/* ==================== Banner ==================== */
.banner-section {
  width: 100%;
  margin-bottom: var(--gap-xl);
}

.banner-carousel {
  position: relative;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: #e8edf2;
  cursor: pointer;
}

.banner-slide {
  position: relative;
  width: 100%;
  height: 320px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.banner-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
}

.banner-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s, background 0.2s;
  z-index: 2;
}

.banner-carousel:hover .banner-arrow {
  opacity: 1;
}

.banner-arrow:hover {
  background: #fff;
}

.banner-arrow-left {
  left: 16px;
}

.banner-arrow-right {
  right: 16px;
}

.banner-dots {
  position: absolute;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 2;
}

.banner-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.banner-dot.active {
  background: #fff;
  transform: scale(1.3);
}

.banner-empty {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: var(--border-radius);
}

/* ==================== Home content ==================== */
.home-content {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
}

/* ==================== Countdown ==================== */
.countdown-section {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  flex-wrap: wrap;
}

.countdown-header {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  font-size: 1.05rem;
  color: var(--text-primary);
}

.countdown-value {
  font-size: 1.5rem;
  color: var(--color-error);
}

.countdown-value :deep(.countdown-timer) {
  font-size: 1.5rem;
  color: var(--color-error);
}

/* ==================== Quick Jump ==================== */
.quickjump-section {
  display: flex;
  align-items: center;
  gap: var(--gap-lg);
  flex-wrap: wrap;
}

.quickjump-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.quickjump-form {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  flex: 1;
}

.quickjump-input {
  max-width: 260px;
}

/* ==================== Section header ==================== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-md);
}

.section-header h2 {
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 600;
}

/* ==================== Announcements ==================== */
.announcement-list {
  display: flex;
  flex-direction: column;
}

.announcement-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: color 0.2s;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-item:hover .announcement-title {
  color: var(--color-primary);
}

.announcement-title-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  flex: 1;
  min-width: 0;
}

.announcement-pin {
  flex-shrink: 0;
}

.announcement-title {
  font-size: 0.95rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.announcement-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  margin-left: var(--gap-md);
  flex-shrink: 0;
}

/* ==================== Contests ==================== */
.contest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--gap-md);
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

.contest-card-header {
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

.contest-countdown {
  color: var(--color-error);
  font-weight: 500;
}

.contest-organizer {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ==================== Empty state ==================== */
.empty-text {
  text-align: center;
  color: var(--text-muted);
  padding: var(--gap-xl) 0;
}

/* ==================== Responsive ==================== */
@media (max-width: 768px) {
  .banner-slide {
    height: 200px;
  }

  .contest-grid {
    grid-template-columns: 1fr;
  }

  .countdown-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .quickjump-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .quickjump-form {
    width: 100%;
  }

  .quickjump-input {
    max-width: none;
    flex: 1;
  }
}
</style>
