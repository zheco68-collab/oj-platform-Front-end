<script setup lang="ts">
import { computed, onMounted, watch, ref, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  NCard,
  NTag,
  NSpace,
  NTabs,
  NTabPane,
  NSelect,
  NButton,
  NTooltip,
  NDivider,
  NSpin,
  NEmpty,
  NIcon,
} from 'naive-ui'
import { CopyOutline, ArrowBackOutline } from '@vicons/ionicons5'
import DifficultyTag from '../components/DifficultyTag.vue'
import MdRenderer from '../components/MdRenderer.vue'
import CodeEditor from '../components/CodeEditor.vue'
import JudgeStatusCard from '../components/JudgeStatusCard.vue'
import { useProblemStore } from '../stores/problem'
import { useAuthStore } from '../stores/auth'
import { useSubmitStore } from '../stores/submit'
import { formatTimeLimit, formatMemoryLimit, formatDateTime } from '../utils'

const route = useRoute()
const router = useRouter()
const problemStore = useProblemStore()
const auth = useAuthStore()
const submitStore = useSubmitStore()

const problemId = computed(() => Number(route.params.id))

// ==================== 提交区状态 ====================
const selectedLanguage = ref('C++')
const code = ref('')

const languageOptions = [
  { label: 'C', value: 'C' },
  { label: 'C++', value: 'C++' },
  { label: 'C++17', value: 'C++17' },
  { label: 'C++20', value: 'C++20' },
  { label: 'Python 3', value: 'Python3' },
  { label: 'Java', value: 'Java' },
  { label: 'Go', value: 'Go' },
]

// 当前题目的提交历史
const problemSubmissions = computed(() =>
  submitStore.getHistoryForProblem(problemId.value),
)

// ==================== 提交方法 ====================
async function handleSubmit(): Promise<void> {
  if (!code.value.trim() || !auth.isLoggedIn) return
  await submitStore.submit(problemId.value, code.value, selectedLanguage.value)
}

// ==================== 复制到剪贴板 ====================
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // fallback: 静默失败
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  if (problemId.value) {
    problemStore.fetchProblemDetail(problemId.value)
  }
})

watch(problemId, (newId) => {
  if (newId) {
    problemStore.fetchProblemDetail(newId)
  }
})

onUnmounted(() => {
  // 离开页面时不停止轮询（用户可能快速返回）
  // 但如果离开题目详情页，清理旧提交错误信息
  submitStore.submitError = null
})
</script>

<template>
  <div class="problem-detail">
    <!-- 左侧：题目内容 -->
    <div class="left-panel">
      <!-- 加载状态 -->
      <NCard v-if="problemStore.detailLoading">
        <div class="loading-wrap">
          <NSpin size="large" />
          <p class="loading-text">加载中...</p>
        </div>
      </NCard>

      <!-- 未找到 -->
      <NCard v-else-if="problemStore.detailError || !problemStore.currentProblem">
        <NEmpty description="题目未找到">
          <template #extra>
            <NButton type="primary" @click="router.push({ name: 'problem-list' })">
              <template #icon>
                <NIcon><ArrowBackOutline /></NIcon>
              </template>
              返回题库
            </NButton>
          </template>
        </NEmpty>
      </NCard>

      <!-- 题目内容 -->
      <NCard v-else>
        <!-- 题目头部 -->
        <div class="problem-header">
          <div class="header-main">
            <span class="problem-id">P{{ problemStore.currentProblem.id }}</span>
            <h1 class="problem-title">{{ problemStore.currentProblem.title }}</h1>
          </div>
          <DifficultyTag :difficulty="problemStore.currentProblem.difficulty" />
        </div>

        <!-- 元信息 -->
        <NSpace class="problem-meta" :size="16">
          <span>
            <strong>时间限制：</strong>{{ formatTimeLimit(problemStore.currentProblem.timeLimit) }}
          </span>
          <span>
            <strong>内存限制：</strong>{{ formatMemoryLimit(problemStore.currentProblem.memoryLimit) }}
          </span>
          <span><strong>来源：</strong>{{ problemStore.currentProblem.source }}</span>
          <span>
            <strong>通过率：</strong>
            {{ problemStore.currentProblem.submissionCount > 0
              ? ((problemStore.currentProblem.acceptedCount / problemStore.currentProblem.submissionCount) * 100).toFixed(1) + '%'
              : '0%'
            }}
          </span>
        </NSpace>

        <NDivider />

        <!-- 题目描述 -->
        <section v-if="problemStore.currentProblem.description" class="content-section">
          <h2 class="section-title">题目描述</h2>
          <MdRenderer :content="problemStore.currentProblem.description" />
        </section>

        <NDivider />

        <!-- 输入格式 -->
        <section v-if="problemStore.currentProblem.inputFormat" class="content-section">
          <h2 class="section-title">输入格式</h2>
          <MdRenderer :content="problemStore.currentProblem.inputFormat" />
        </section>

        <NDivider />

        <!-- 输出格式 -->
        <section v-if="problemStore.currentProblem.outputFormat" class="content-section">
          <h2 class="section-title">输出格式</h2>
          <MdRenderer :content="problemStore.currentProblem.outputFormat" />
        </section>

        <NDivider />

        <!-- 样例 -->
        <section
          v-if="problemStore.currentProblem.samples && problemStore.currentProblem.samples.length > 0"
          class="content-section"
        >
          <h2 class="section-title">样例</h2>
          <div
            v-for="(sample, idx) in problemStore.currentProblem.samples"
            :key="idx"
            class="sample-block"
          >
            <div class="sample-pair">
              <div class="sample-item">
                <div class="sample-label">
                  <span class="sample-name">输入 #{{ idx + 1 }}</span>
                  <NButton text size="tiny" @click="copyToClipboard(sample.input)">
                    <template #icon>
                      <NIcon size="14"><CopyOutline /></NIcon>
                    </template>
                    复制
                  </NButton>
                </div>
                <pre class="sample-content">{{ sample.input }}</pre>
              </div>
              <div class="sample-item">
                <div class="sample-label">
                  <span class="sample-name">输出 #{{ idx + 1 }}</span>
                  <NButton text size="tiny" @click="copyToClipboard(sample.output)">
                    <template #icon>
                      <NIcon size="14"><CopyOutline /></NIcon>
                    </template>
                    复制
                  </NButton>
                </div>
                <pre class="sample-content">{{ sample.output }}</pre>
              </div>
            </div>
          </div>
        </section>

        <NDivider />

        <!-- 提示 -->
        <section v-if="problemStore.currentProblem.hint" class="content-section">
          <h2 class="section-title">提示</h2>
          <MdRenderer :content="problemStore.currentProblem.hint" />
        </section>

        <NDivider />

        <!-- 算法标签 -->
        <section class="content-section">
          <h2 class="section-title">算法标签</h2>
          <NSpace wrap>
            <NTag
              v-for="tag in problemStore.currentProblem.tags"
              :key="tag"
              type="info"
              size="small"
              style="cursor: pointer"
              @click="router.push({ name: 'problem-list', query: { tags: tag } })"
            >
              {{ tag }}
            </NTag>
          </NSpace>
        </section>
      </NCard>
    </div>

    <!-- 右侧：提交区 -->
    <div class="right-panel">
      <NCard title="提交代码" size="small">
        <div class="submit-area">
          <NSelect
            v-model:value="selectedLanguage"
            :options="languageOptions"
            placeholder="选择语言"
            class="submit-language"
          />

          <div class="code-editor-wrap">
            <CodeEditor v-model="code" :language="selectedLanguage" />
          </div>

          <NTooltip :disabled="auth.isLoggedIn">
            <template #trigger>
              <NButton
                type="primary"
                block
                :disabled="!auth.isLoggedIn || submitStore.isSubmitting"
                :loading="submitStore.isSubmitting"
                class="submit-btn"
                size="large"
                @click="handleSubmit"
              >
                {{ submitStore.isSubmitting ? '提交中...' : '提交代码' }}
              </NButton>
            </template>
            <span v-if="!auth.isLoggedIn">请先登录后提交</span>
          </NTooltip>

          <!-- 提交错误 -->
          <div v-if="submitStore.submitError" class="submit-error">
            {{ submitStore.submitError }}
          </div>

          <!-- 判题状态卡片 -->
          <JudgeStatusCard
            v-if="submitStore.currentSubmission"
            :status="submitStore.currentSubmission.status"
            :time="submitStore.currentSubmission.time"
            :memory="submitStore.currentSubmission.memory"
            :loading="submitStore.isPolling"
            :error="submitStore.submitError"
          />
        </div>
      </NCard>
    </div>

    <!-- 底部：Tab 区 -->
    <div class="bottom-panel">
      <NCard size="small">
        <NTabs>
          <NTabPane name="solutions" tab="题解">
            <div class="tab-content">
              <p>
                <RouterLink :to="`/problem/${problemId}/solution`">查看全部题解 →</RouterLink>
              </p>
            </div>
          </NTabPane>
          <NTabPane name="submissions" tab="提交记录">
            <div class="tab-content">
              <NEmpty
                v-if="problemSubmissions.length === 0"
                description="暂无提交记录"
              />
              <div v-else class="submission-history">
                <div
                  v-for="sub in problemSubmissions"
                  :key="sub.id"
                  class="submission-item"
                >
                  <div class="submission-item-left">
                    <span class="submission-id">{{ sub.id }}</span>
                    <span class="submission-lang">{{ sub.language }}</span>
                    <span
                      class="submission-status"
                      :style="{ color: submitStore.currentSubmission?.id === sub.id
                        ? 'var(--color-primary)' : '' }"
                    >
                      {{ sub.status }}
                    </span>
                  </div>
                  <div class="submission-item-right">
                    <span class="submission-time">{{ formatDateTime(sub.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </NTabPane>
        </NTabs>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
.problem-detail {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: var(--gap-md);
}

.left-panel {
  grid-column: 1;
  min-width: 0;
}

.right-panel {
  grid-column: 2;
}

.bottom-panel {
  grid-column: 1 / -1;
}

/* 加载状态 */
.loading-wrap {
  text-align: center;
  padding: var(--gap-xl);
}

.loading-text {
  margin-top: var(--gap-sm);
  color: var(--text-secondary);
}

/* 题目头部 */
.problem-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--gap-sm);
}

.header-main {
  display: flex;
  align-items: baseline;
  gap: var(--gap-sm);
  flex-wrap: wrap;
}

.problem-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

.problem-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

/* 元信息 */
.problem-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--gap-sm);
}

/* 内容区段 */
.content-section {
  margin-bottom: var(--gap-xs);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: var(--gap-sm);
  color: var(--text-primary);
}

/* 样例 */
.sample-block {
  margin-bottom: var(--gap-md);
}

.sample-pair {
  display: flex;
  gap: var(--gap-md);
}

.sample-item {
  flex: 1;
  min-width: 0;
}

.sample-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gap-xs) var(--gap-sm);
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-bottom: none;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  font-size: 0.875rem;
  font-weight: 500;
}

.sample-name {
  color: var(--text-secondary);
}

.sample-content {
  margin: 0;
  padding: var(--gap-sm) var(--gap-md);
  background: #fafbfc;
  border: 1px solid #e1e4e8;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

/* 提交区 */
.submit-area {
  display: flex;
  flex-direction: column;
}

.submit-language {
  margin-bottom: var(--gap-sm);
}

.code-editor-wrap {
  margin-bottom: var(--gap-sm);
}

.submit-btn {
  margin-top: 0;
}

.submit-error {
  margin-top: var(--gap-sm);
  font-size: 0.8125rem;
  color: var(--color-danger);
}

/* 提交历史 */
.submission-history {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.submission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gap-xs) var(--gap-sm);
  border: 1px solid #eee;
  border-radius: var(--border-radius);
  font-size: 0.8125rem;
  background: #fafbfc;
}

.submission-item:hover {
  background: #f0f7ff;
}

.submission-item-left {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.submission-id {
  font-family: monospace;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.submission-lang {
  color: var(--text-secondary);
  padding: 0 4px;
  background: #eee;
  border-radius: 3px;
  font-size: 0.75rem;
}

.submission-status {
  font-weight: 600;
  font-family: monospace;
}

.submission-item-right {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.submission-time {
  font-variant-numeric: tabular-nums;
}

/* Tab 内容 */
.tab-content {
  padding: var(--gap-sm) 0;
}

/* 响应式 */
@media (max-width: 900px) {
  .problem-detail {
    grid-template-columns: 1fr;
  }
  .left-panel,
  .right-panel,
  .bottom-panel {
    grid-column: 1;
  }
}
</style>
