<script setup lang="ts">
/**
 * 公告详情页 — 将公告视为特殊题解，以 Markdown 渲染展示全文
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NSpin, NEmpty, NButton, NIcon, NTag } from 'naive-ui'
import { ArrowBack, MegaphoneOutline } from '@vicons/ionicons5'
import type { Announcement } from '../types'
import { fetchAnnouncementDetail } from '../api/home'
import MdRenderer from '../components/MdRenderer.vue'
import { formatDateTime } from '../utils'

const route = useRoute()
const router = useRouter()

const announcementId = computed(() => Number(route.params.id))
const announcement = ref<Announcement | null>(null)
const loading = ref(true)
const error = ref('')

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchAnnouncementDetail(announcementId.value)
    if (res.code === 200) {
      announcement.value = res.data
    } else {
      error.value = res.message || '公告不存在'
    }
  } catch {
    error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

function goBack(): void {
  router.back()
}

onMounted(() => {
  load()
})
</script>

<template>
  <div class="announcement-detail-page">
    <NSpin :show="loading">
      <template v-if="error">
        <NEmpty :description="error" style="margin-top: 80px">
          <template #extra>
            <NButton @click="goBack">
              <template #icon><NIcon><ArrowBack /></NIcon></template>
              返回
            </NButton>
          </template>
        </NEmpty>
      </template>

      <template v-else-if="announcement">
        <!-- 头部 -->
        <div class="announcement-header card">
          <div class="header-top">
            <NButton text @click="goBack">
              <template #icon><NIcon><ArrowBack /></NIcon></template>
              返回
            </NButton>
          </div>

          <div class="header-main">
            <div class="header-icon">
              <NIcon size="28" color="#9b59b6">
                <MegaphoneOutline />
              </NIcon>
            </div>
            <div class="header-info">
              <div class="title-row">
                <NTag v-if="announcement.pinned" type="error" size="small" round>
                  置顶
                </NTag>
                <h1>{{ announcement.title }}</h1>
              </div>
              <span class="publish-time">
                发布于 {{ formatDateTime(announcement.createdAt) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 正文 -->
        <div class="announcement-body card">
          <MdRenderer :content="announcement.content" />
        </div>
      </template>
    </NSpin>
  </div>
</template>

<style scoped>
.announcement-detail-page {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  padding-bottom: var(--gap-xl);
}

/* ==================== 头部 ==================== */

.announcement-header {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.header-top {
  display: flex;
  align-items: center;
}

.header-main {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-md);
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #9b59b618;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.title-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  flex-wrap: wrap;
}

.title-row h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.publish-time {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ==================== 正文 ==================== */

.announcement-body {
  min-height: 200px;
}

/* ==================== 暗色模式 ==================== */

html.dark .header-icon {
  background: #9b59b622;
}
</style>
