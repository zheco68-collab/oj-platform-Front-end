<script setup lang="ts">
/**
 * 管理员 — 用户管理
 *
 * 功能：用户列表、搜索、封禁/解封、查看用户详情
 */
import { ref, onMounted, h } from 'vue'
import {
  NDataTable,
  NButton,
  NModal,
  NInput,
  NSpace,
  NPopconfirm,
  NTag,
  NIcon,
  useMessage,
} from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import { formatDate } from '../../utils'
import UserAvatar from '../../components/UserAvatar.vue'
import {
  fetchAdminUsers,
  banUser,
  unbanUser,
} from '../../api/admin'
import type { AdminUser } from '../../api/admin'

// ==================== 状态 ====================

const message = useMessage()
const loading = ref(false)
const users = ref<AdminUser[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const showDetailModal = ref(false)
const detailUser = ref<AdminUser | null>(null)

// ==================== 表格列定义 ====================

const columns: DataTableColumns<AdminUser> = [
  {
    title: '头像',
    key: 'avatar',
    width: 60,
    render(row) {
      return h(UserAvatar, {
        avatarUrl: row.avatarUrl,
        username: row.username,
        isAdmin: row.role === 'ADMIN',
        size: 'small' as const,
      })
    },
  },
  {
    title: '用户名',
    key: 'username',
    ellipsis: { tooltip: true },
    render(row) {
      return h(NSpace, { size: 'small', align: 'center' }, () => [
        row.username,
        row.role === 'ADMIN'
          ? h(NTag, { type: 'warning', size: 'small', round: true }, () => '管理员')
          : null,
      ])
    },
  },
  {
    title: '角色',
    key: 'role',
    width: 80,
    render(row) {
      return row.role === 'ADMIN'
        ? h(NTag, { type: 'warning', size: 'small' }, () => 'ADMIN')
        : h(NTag, { type: 'info', size: 'small' }, () => 'USER')
    },
  },
  {
    title: '通过数',
    key: 'acceptedCount',
    width: 85,
  },
  {
    title: '提交数',
    key: 'submissionCount',
    width: 85,
  },
  {
    title: 'Rating',
    key: 'rating',
    width: 80,
    render(row) {
      return row.rating ?? '-'
    },
  },
  {
    title: '注册时间',
    key: 'createdAt',
    width: 110,
    render(row) {
      return formatDate(row.createdAt)
    },
  },
  {
    title: '状态',
    key: 'banned',
    width: 80,
    render(row) {
      return row.banned
        ? h(NTag, { type: 'error', size: 'small', round: true }, () => '已封禁')
        : h(NTag, { type: 'success', size: 'small', round: true }, () => '正常')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(NButton, { size: 'small', onClick: () => openDetail(row) }, () => '详情'),
        row.role !== 'ADMIN'
          ? h(
              NPopconfirm,
              { onPositiveClick: () => handleToggleBan(row) },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: row.banned ? 'success' : 'warning',
                    },
                    () => (row.banned ? '解封' : '封禁'),
                  ),
                default: () =>
                  row.banned
                    ? `确定解封用户 "${row.username}" 吗？`
                    : `确定封禁用户 "${row.username}" 吗？`,
              },
            )
          : null,
      ])
    },
  },
]

// ==================== 数据加载 ====================

async function loadUsers(): Promise<void> {
  loading.value = true
  try {
    const res = await fetchAdminUsers({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value || undefined,
    })
    users.value = res.data.data
    total.value = res.data.total
  } catch {
    message.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function onSearch(): void {
  page.value = 1
  loadUsers()
}

function onPageChange(p: number): void {
  page.value = p
  loadUsers()
}

// ==================== 操作 ====================

function openDetail(user: AdminUser): void {
  detailUser.value = user
  showDetailModal.value = true
}

async function handleToggleBan(user: AdminUser): Promise<void> {
  try {
    if (user.banned) {
      await unbanUser(user.id)
      message.success(`用户 "${user.username}" 已解封`)
    } else {
      await banUser(user.id)
      message.success(`用户 "${user.username}" 已封禁`)
    }
    await loadUsers()
  } catch {
    message.error('操作失败')
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="admin-user-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-row">
        <h1>用户管理</h1>
      </div>
      <p class="page-subtitle">管理平台用户，包括查看、搜索、封禁与解封操作</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <NInput
        v-model:value="keyword"
        placeholder="搜索用户名或 ID..."
        clearable
        @keyup.enter="onSearch"
        style="width: 320px"
      >
        <template #prefix>
          <NIcon><SearchOutline /></NIcon>
        </template>
      </NInput>
      <NButton @click="onSearch">搜索</NButton>
    </div>

    <!-- 表格 -->
    <NDataTable
      :columns="columns"
      :data="users"
      :loading="loading"
      :pagination="{
        page: page,
        pageSize: pageSize,
        itemCount: total,
        onChange: onPageChange,
        pageSizes: [10, 20, 50],
        showSizePicker: true,
      }"
      :row-key="(row: AdminUser) => row.id"
      striped
    />

    <!-- 用户详情弹窗 -->
    <NModal
      v-model:show="showDetailModal"
      title="用户详情"
      preset="card"
      style="width: min(500px, 90vw)"
    >
      <template v-if="detailUser">
        <div class="user-detail">
          <div class="detail-header">
            <UserAvatar
              :avatar-url="detailUser.avatarUrl"
              :username="detailUser.username"
              :is-admin="detailUser.role === 'ADMIN'"
              size="large"
            />
            <div class="detail-name">
              <h3>{{ detailUser.username }}</h3>
              <NTag
                v-if="detailUser.role === 'ADMIN'"
                type="warning"
                size="small"
                round
              >
                管理员
              </NTag>
              <NTag
                v-if="detailUser.banned"
                type="error"
                size="small"
                round
              >
                已封禁
              </NTag>
            </div>
          </div>
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">用户 ID</span>
              <span class="info-value">{{ detailUser.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">个性签名</span>
              <span class="info-value">{{ detailUser.signature || '暂无签名' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ formatDate(detailUser.createdAt) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">通过题数</span>
              <span class="info-value">{{ detailUser.acceptedCount }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">提交总数</span>
              <span class="info-value">{{ detailUser.submissionCount }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Rating</span>
              <span class="info-value">{{ detailUser.rating ?? '暂无' }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <NButton @click="showDetailModal = false">关闭</NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.admin-user-manager {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  padding-bottom: var(--gap-xl);
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.page-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-md);
}

.page-title-row h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
}

.detail-name {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.detail-name h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gap-xs) 0;
  border-bottom: 1px solid #f0f0f0;
}

html.dark .info-row {
  border-color: #2a3a5a;
}

.info-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.info-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}
</style>
