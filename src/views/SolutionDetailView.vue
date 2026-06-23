<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NSpin,
  NEmpty,
  NButton,
  NIcon,
  NInput,
  NDivider,
  NInputGroup,
  useMessage,
} from 'naive-ui'
import {
  ThumbsUpOutline,
  ThumbsDownOutline,
  ArrowBack,
  ChatbubbleOutline,
} from '@vicons/ionicons5'
import { useSolutionStore } from '../stores/solution'
import UserAvatar from '../components/UserAvatar.vue'
import MdRenderer from '../components/MdRenderer.vue'
import { formatDateTime } from '../utils'
import type { Comment } from '../types'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const store = useSolutionStore()

// ==================== 基础状态 ====================

const solutionId = computed(() => Number(route.params.id))

// 新评论输入
const newComment = ref('')
// 回复输入（key: commentId, value: 回复内容）
const replyInputs = ref<Record<number, string>>({})
// 展开的回复框
const activeReplyId = ref<number | null>(null)

// ==================== 数据加载 ====================

async function loadDetail(): Promise<void> {
  await store.fetchDetail(solutionId.value)
  if (store.detailError) {
    message.error(store.detailError)
  }
}

// ==================== 导航 ====================

function goBack(): void {
  if (store.current) {
    router.push(`/problem/${store.current.problemId}/solution`)
  } else {
    router.back()
  }
}

function goToProblem(): void {
  if (store.current) {
    router.push(`/problem/${store.current.problemId}`)
  }
}

// ==================== 互动 ====================

async function handleLike(): Promise<void> {
  if (!store.isLoggedIn) {
    message.warning('请先登录')
    return
  }
  await store.vote('like')
  message.success('点赞成功')
}

async function handleDislike(): Promise<void> {
  if (!store.isLoggedIn) {
    message.warning('请先登录')
    return
  }
  await store.vote('dislike')
}

// ==================== 评论 ====================

async function handleSubmitComment(): Promise<void> {
  if (!store.isLoggedIn) {
    message.warning('请先登录后再评论')
    return
  }
  const content = newComment.value.trim()
  if (!content) {
    message.warning('请输入评论内容')
    return
  }
  const result = await store.submitComment(content)
  if (result) {
    newComment.value = ''
    message.success('评论发表成功')
  } else {
    message.error('评论发表失败')
  }
}

function toggleReply(commentId: number): void {
  activeReplyId.value = activeReplyId.value === commentId ? null : commentId
  if (!replyInputs.value[commentId]) {
    replyInputs.value[commentId] = ''
  }
}

async function handleSubmitReply(parentCommentId: number): Promise<void> {
  if (!store.isLoggedIn) {
    message.warning('请先登录后再回复')
    return
  }
  const content = (replyInputs.value[parentCommentId] || '').trim()
  if (!content) {
    message.warning('请输入回复内容')
    return
  }
  const result = await store.submitReply(parentCommentId, content)
  if (result) {
    replyInputs.value[parentCommentId] = ''
    activeReplyId.value = null
    message.success('回复成功')
  } else {
    message.error('回复失败')
  }
}

// ==================== 渲染评论 ====================

interface CommentNode {
  comment: Comment
  level: number
}

function flattenComments(comments: Comment[], level = 0): CommentNode[] {
  const result: CommentNode[] = []
  for (const c of comments) {
    result.push({ comment: c, level })
    if (c.replies && c.replies.length > 0 && level < 1) {
      result.push(...flattenComments(c.replies, level + 1))
    }
  }
  return result
}

const flatComments = computed<CommentNode[]>(() => {
  if (!store.current) return []
  return flattenComments(store.current.comments)
})

// ==================== 生命周期 ====================

onMounted(loadDetail)
</script>

<template>
  <div class="solution-detail-page container">
    <NSpin :show="store.detailLoading">
      <template v-if="store.current">
        <!-- ==================== 题解头部 ==================== -->
        <div class="solution-header card">
          <NButton
            text
            @click="goBack"
            class="back-btn"
          >
            <template #icon>
              <NIcon><ArrowBack /></NIcon>
            </template>
            返回题解列表
          </NButton>

          <h1 class="solution-title">{{ store.current.title }}</h1>

          <div class="solution-meta">
            <div class="author-info">
              <UserAvatar
                :avatar-url="store.current.author.avatarUrl"
                :username="store.current.author.username"
                size="medium"
              />
              <span class="author-name">{{ store.current.author.username }}</span>
            </div>

            <div class="meta-right">
              <span class="meta-time">{{ formatDateTime(store.current.createdAt) }}</span>
              <NButton
                text
                size="small"
                type="primary"
                @click="goToProblem"
              >
                题目：{{ store.current.problemTitle }}
              </NButton>
            </div>
          </div>
        </div>

        <!-- ==================== 题解正文 ==================== -->
        <div class="solution-body card">
          <MdRenderer :content="store.current.content" />
        </div>

        <!-- ==================== 互动区 ==================== -->
        <div class="solution-actions card">
          <div class="action-buttons">
            <NButton
              :type="store.isLoggedIn ? 'default' : 'tertiary'"
              :disabled="!store.isLoggedIn"
              size="large"
              @click="handleLike"
              class="action-btn like-btn"
            >
              <template #icon>
                <NIcon><ThumbsUpOutline /></NIcon>
              </template>
              点赞 {{ store.current.likeCount }}
            </NButton>

            <NButton
              :type="store.isLoggedIn ? 'default' : 'tertiary'"
              :disabled="!store.isLoggedIn"
              size="large"
              @click="handleDislike"
              class="action-btn dislike-btn"
            >
              <template #icon>
                <NIcon><ThumbsDownOutline /></NIcon>
              </template>
              点踩 {{ store.current.dislikeCount }}
            </NButton>
          </div>

          <div
            v-if="!store.isLoggedIn"
            class="login-hint"
          >
            登录后即可点赞/点踩
          </div>
        </div>

        <!-- ==================== 评论区 ==================== -->
        <div class="solution-comments card">
          <h2 class="comments-title">
            <NIcon size="20"><ChatbubbleOutline /></NIcon>
            评论 ({{ store.current.comments.length }})
          </h2>

          <NDivider />

          <!-- 评论列表 -->
          <div
            v-if="flatComments.length > 0"
            class="comment-list"
          >
            <div
              v-for="node in flatComments"
              :key="node.comment.id"
              class="comment-item"
              :class="{ 'comment-reply': node.level > 0 }"
            >
              <!-- 评论内容 -->
              <div class="comment-body">
                <div class="comment-avatar">
                  <UserAvatar
                    :avatar-url="node.comment.author.avatarUrl"
                    :username="node.comment.author.username"
                    size="small"
                  />
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ node.comment.author.username }}</span>
                    <span class="comment-time">{{ formatDateTime(node.comment.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ node.comment.content }}</p>

                  <!-- 回复按钮 -->
                  <div class="comment-footer">
                    <NButton
                      text
                      size="tiny"
                      type="primary"
                      @click="toggleReply(node.comment.id)"
                    >
                      回复
                    </NButton>
                  </div>

                  <!-- 回复输入框 -->
                  <div
                    v-if="activeReplyId === node.comment.id"
                    class="reply-input-area"
                  >
                    <NInputGroup>
                      <NInput
                        v-model:value="replyInputs[node.comment.id]"
                        type="textarea"
                        placeholder="写下你的回复..."
                        :rows="2"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                      />
                    </NInputGroup>
                    <div class="reply-actions">
                      <NButton
                        size="small"
                        @click="activeReplyId = null"
                      >
                        取消
                      </NButton>
                      <NButton
                        type="primary"
                        size="small"
                        :loading="store.submittingComment"
                        @click="handleSubmitReply(node.comment.id)"
                      >
                        回复
                      </NButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NEmpty
            v-else
            description="暂无评论，来做第一个评论的人吧！"
            class="empty-comments"
          />

          <NDivider />

          <!-- 发表评论 -->
          <div class="post-comment">
            <h3 class="post-comment-title">发表评论</h3>
            <div class="post-comment-input">
              <NInput
                v-model:value="newComment"
                type="textarea"
                placeholder="写下你的想法..."
                :rows="3"
                :autosize="{ minRows: 3, maxRows: 8 }"
                :disabled="!store.isLoggedIn"
              />
            </div>
            <div class="post-comment-footer">
              <span
                v-if="!store.isLoggedIn"
                class="login-hint"
              >
                请先登录后再评论
              </span>
              <NButton
                type="primary"
                :disabled="!store.isLoggedIn || !newComment.trim()"
                :loading="store.submittingComment"
                @click="handleSubmitComment"
              >
                发表评论
              </NButton>
            </div>
          </div>
        </div>
      </template>

      <!-- 错误 / 不存在 -->
      <NEmpty
        v-else-if="!store.detailLoading"
        :description="store.detailError || '题解不存在'"
        class="empty-state"
      >
        <template #extra>
          <NButton
            type="primary"
            @click="router.push('/')"
          >
            返回首页
          </NButton>
        </template>
      </NEmpty>
    </NSpin>
  </div>
</template>

<style scoped>
.solution-detail-page {
  padding-top: var(--gap-xl);
  padding-bottom: var(--gap-xl);

  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
}

/* ==================== 头部 ==================== */
.solution-header {
  padding: var(--gap-lg);
}

.back-btn {
  margin-bottom: var(--gap-md);
}

.solution-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--gap-md) 0;
  line-height: 1.4;
}

.solution-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-md);
  flex-wrap: wrap;
  padding-top: var(--gap-md);
  border-top: 1px solid #f0f0f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.author-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}

.meta-right {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
}

.meta-time {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ==================== 正文 ==================== */
.solution-body {
  padding: var(--gap-lg);
}

/* ==================== 互动区 ==================== */
.solution-actions {
  padding: var(--gap-md) var(--gap-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--gap-md);
}

.action-buttons {
  display: flex;
  gap: var(--gap-md);
}

.action-btn {
  min-width: 100px;
}

.like-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.dislike-btn:hover {
  color: var(--color-error);
  border-color: var(--color-error);
}

.login-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ==================== 评论区 ==================== */
.solution-comments {
  padding: var(--gap-lg);
}

.comments-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-item {
  padding: var(--gap-md) 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-reply {
  margin-left: 48px;
  padding-left: var(--gap-md);
  border-left: 2px solid #e8e8e8;
  border-bottom: 1px solid #f5f5f5;
}

.comment-body {
  display: flex;
  gap: var(--gap-md);
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  margin-bottom: 4px;
}

.comment-author {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.comment-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.comment-text {
  font-size: 0.92rem;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.6;
  word-break: break-word;
}

.comment-footer {
  margin-top: 6px;
}

/* 回复输入区 */
.reply-input-area {
  margin-top: var(--gap-sm);
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--gap-sm);
}

/* 空评论 */
.empty-comments {
  padding: var(--gap-xl) 0;
}

/* 发表评论 */
.post-comment {
  margin-top: var(--gap-sm);
}

.post-comment-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 var(--gap-md) 0;
}

.post-comment-input {
  margin-bottom: var(--gap-sm);
}

.post-comment-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--gap-md);
}

/* ==================== 空状态 ==================== */
.empty-state {
  margin-top: var(--gap-xl);
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .solution-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .comment-reply {
    margin-left: 24px;
  }

  .action-buttons {
    width: 100%;
  }

  .action-btn {
    flex: 1;
  }
}
</style>
