<script setup lang="ts">
/**
 * 管理员 — 公告管理
 *
 * 功能：列表查看、搜索、新建、编辑、删除、置顶切换
 */
import { ref, reactive, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NPopconfirm,
  NTag,
  NSwitch,
  NIcon,
  useMessage,
} from 'naive-ui'
import { AddOutline, SearchOutline } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import type { Announcement } from '../../types'
import { formatDateTime } from '../../utils'
import {
  fetchAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPin,
} from '../../api/admin'
import type { AdminAnnouncementForm } from '../../api/admin'

// ==================== 状态 ====================

const message = useMessage()
const router = useRouter()
const loading = ref(false)
const announcements = ref<Announcement[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const showModal = ref(false)
const modalTitle = ref('发布公告')
const editingId = ref<number | null>(null)
const submitting = ref(false)

const formRef = ref<FormInst | null>(null)
const form = reactive<AdminAnnouncementForm>({
  title: '',
  content: '',
  pinned: false,
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
}

// ==================== 表格列定义 ====================

const columns: DataTableColumns<Announcement> = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
  },
  {
    title: '标题',
    key: 'title',
    ellipsis: { tooltip: true },
  },
  {
    title: '置顶',
    key: 'pinned',
    width: 80,
    render(row) {
      return row.pinned
        ? h(NTag, { type: 'warning', size: 'small', round: true }, () => '置顶')
        : '-'
    },
  },
  {
    title: '发布时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return formatDateTime(row.createdAt)
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(
          NButton,
          { size: 'small', onClick: () => router.push(`/announcement/${row.id}`) },
          () => '查看',
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleTogglePin(row),
          },
          () => (row.pinned ? '取消置顶' : '置顶'),
        ),
        h(NButton, { size: 'small', onClick: () => openEdit(row) }, () => '编辑'),
        h(
          NPopconfirm,
          { onPositiveClick: () => handleDelete(row.id) },
          {
            trigger: () => h(NButton, { size: 'small', type: 'error' }, () => '删除'),
            default: () => `确定删除公告 "${row.title}" 吗？`,
          },
        ),
      ])
    },
  },
]

// ==================== 数据加载 ====================

async function loadAnnouncements(): Promise<void> {
  loading.value = true
  try {
    const res = await fetchAdminAnnouncements({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value || undefined,
    })
    announcements.value = res.data.data
    total.value = res.data.total
  } catch {
    message.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

function onSearch(): void {
  page.value = 1
  loadAnnouncements()
}

function onPageChange(p: number): void {
  page.value = p
  loadAnnouncements()
}

// ==================== 表单操作 ====================

function openCreate(): void {
  editingId.value = null
  modalTitle.value = '发布公告'
  resetForm()
  showModal.value = true
}

function openEdit(announcement: Announcement): void {
  editingId.value = announcement.id
  modalTitle.value = '编辑公告'
  form.title = announcement.title
  form.content = announcement.content
  form.pinned = announcement.pinned
  showModal.value = true
}

function resetForm(): void {
  form.title = ''
  form.content = ''
  form.pinned = false
}

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateAnnouncement(editingId.value, { ...form })
      message.success('公告更新成功')
    } else {
      await createAnnouncement({ ...form })
      message.success('公告发布成功')
    }
    showModal.value = false
    await loadAnnouncements()
  } catch {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number): Promise<void> {
  try {
    await deleteAnnouncement(id)
    message.success('公告已删除')
    await loadAnnouncements()
  } catch {
    message.error('删除失败')
  }
}

async function handleTogglePin(announcement: Announcement): Promise<void> {
  try {
    await toggleAnnouncementPin(announcement.id)
    message.success(announcement.pinned ? '已取消置顶' : '已置顶')
    await loadAnnouncements()
  } catch {
    message.error('操作失败')
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadAnnouncements()
})
</script>

<template>
  <div class="admin-announcement-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-row">
        <h1>公告管理</h1>
        <NButton type="primary" @click="openCreate">
          <template #icon><NIcon><AddOutline /></NIcon></template>
          发布公告
        </NButton>
      </div>
      <p class="page-subtitle">管理站内公告，包括发布、编辑、删除和置顶管理</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <NInput
        v-model:value="keyword"
        placeholder="搜索公告标题或内容..."
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
      :data="announcements"
      :loading="loading"
      :pagination="{
        page: page,
        pageSize: pageSize,
        itemCount: total,
        onChange: onPageChange,
        pageSizes: [10, 20, 50],
        showSizePicker: true,
      }"
      :row-key="(row: Announcement) => row.id"
      striped
    />

    <!-- 新建/编辑弹窗 -->
    <NModal
      v-model:show="showModal"
      :title="modalTitle"
      preset="card"
      style="width: min(700px, 90vw)"
      :mask-closable="false"
    >
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <NFormItem label="公告标题" path="title">
          <NInput v-model:value="form.title" placeholder="请输入公告标题" />
        </NFormItem>

        <NFormItem label="公告内容 (Markdown)" path="content">
          <NInput
            v-model:value="form.content"
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 15 }"
            placeholder="支持 Markdown 格式编写公告内容"
          />
        </NFormItem>

        <NFormItem label="置顶">
          <NSwitch v-model:value="form.pinned" />
          <span style="margin-left:8px;color:var(--text-secondary);font-size:0.85rem">
            置顶的公告将显示在列表最前
          </span>
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" :loading="submitting" @click="handleSubmit">
            {{ editingId ? '保存修改' : '发布公告' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.admin-announcement-manager {
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
</style>
