<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
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
import { useProblemStore } from '../stores/problem'
import { useAuthStore } from '../stores/auth'
import { formatTimeLimit, formatMemoryLimit } from '../utils'

const route = useRoute()
const router = useRouter()
const store = useProblemStore()
const auth = useAuthStore()

const problemId = computed(() => Number(route.params.id))

// 提交区状态（P3 替换为完整功能）
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

// 复制到剪贴板
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // fallback: 如果 clipboard API 不可用，静默失败
  }
}

// 加载题目详情
onMounted(() => {
  if (problemId.value) {
    store.fetchProblemDetail(problemId.value)
  }
})

// 监听路由参数变化（跨题目导航）
watch(problemId, (newId) => {
  if (newId) {
    store.fetchProblemDetail(newId)
  }
})
</script>

<template>
  <div class="problem-detail">
    <!-- 左侧：题目内容 -->
    <div class="left-panel">
      <!-- 加载状态 -->
      <NCard v-if="store.detailLoading">
        <div class="loading-wrap">
          <NSpin size="large" />
          <p class="loading-text">加载中...</p>
        </div>
      </NCard>

      <!-- 未找到 -->
      <NCard v-else-if="store.detailError || !store.currentProblem">
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
            <span class="problem-id">P{{ store.currentProblem.id }}</span>
            <h1 class="problem-title">{{ store.currentProblem.title }}</h1>
          </div>
          <DifficultyTag :difficulty="store.currentProblem.difficulty" />
        </div>

        <!-- 元信息 -->
        <NSpace class="problem-meta" :size="16">
          <span>
            <strong>时间限制：</strong>{{ formatTimeLimit(store.currentProblem.timeLimit) }}
          </span>
          <span>
            <strong>内存限制：</strong>{{ formatMemoryLimit(store.currentProblem.memoryLimit) }}
          </span>
          <span><strong>来源：</strong>{{ store.currentProblem.source }}</span>
          <span>
            <strong>通过率：</strong>
            {{ store.currentProblem.submissionCount > 0
              ? ((store.currentProblem.acceptedCount / store.currentProblem.submissionCount) * 100).toFixed(1) + '%'
              : '0%'
            }}
          </span>
        </NSpace>

        <NDivider />

        <!-- 题目描述 -->
        <section v-if="store.currentProblem.description" class="content-section">
          <h2 class="section-title">题目描述</h2>
          <MdRenderer :content="store.currentProblem.description" />
        </section>

        <NDivider />

        <!-- 输入格式 -->
        <section v-if="store.currentProblem.inputFormat" class="content-section">
          <h2 class="section-title">输入格式</h2>
          <MdRenderer :content="store.currentProblem.inputFormat" />
        </section>

        <NDivider />

        <!-- 输出格式 -->
        <section v-if="store.currentProblem.outputFormat" class="content-section">
          <h2 class="section-title">输出格式</h2>
          <MdRenderer :content="store.currentProblem.outputFormat" />
        </section>

        <NDivider />

        <!-- 样例 -->
        <section
          v-if="store.currentProblem.samples && store.currentProblem.samples.length > 0"
          class="content-section"
        >
          <h2 class="section-title">样例</h2>
          <div
            v-for="(sample, idx) in store.currentProblem.samples"
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
        <section v-if="store.currentProblem.hint" class="content-section">
          <h2 class="section-title">提示</h2>
          <MdRenderer :content="store.currentProblem.hint" />
        </section>

        <NDivider />

        <!-- 算法标签 -->
        <section class="content-section">
          <h2 class="section-title">算法标签</h2>
          <NSpace wrap>
            <NTag
              v-for="tag in store.currentProblem.tags"
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
            <textarea
              v-model="code"
              class="code-textarea"
              placeholder="在此输入代码..."
              rows="15"
              spellcheck="false"
            />
          </div>

          <NTooltip :disabled="auth.isLoggedIn">
            <template #trigger>
              <NButton
                type="primary"
                block
                :disabled="!auth.isLoggedIn"
                class="submit-btn"
                size="large"
              >
                提交代码
              </NButton>
            </template>
            <span v-if="!auth.isLoggedIn">请先登录后提交</span>
          </NTooltip>
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
              <NEmpty description="暂无提交记录" />
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

.code-textarea {
  width: 100%;
  padding: var(--gap-sm);
  border: 1px solid #e1e4e8;
  border-radius: var(--border-radius);
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  tab-size: 4;
  resize: vertical;
  background: #fafbfc;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.code-textarea:focus {
  border-color: var(--color-primary);
  background: var(--bg-card);
}

.submit-btn {
  margin-top: 0;
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
