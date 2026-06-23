<script setup lang="ts">
/**
 * 管理员 — 比赛管理
 *
 * 功能：列表查看、搜索、新建、编辑、删除比赛
 */
import { ref, reactive, onMounted, h } from 'vue'
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NPopconfirm,
  NTag,
  NSwitch,
  NDatePicker,
  NIcon,
  NGi,
  NGrid,
  useMessage,
} from 'naive-ui'
import { AddOutline, TrashOutline, SearchOutline } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import type { Contest, ContestStatus } from '../../types'
import { formatDateTime } from '../../utils'
import {
  fetchAdminContests,
  createContest,
  updateContest,
  deleteContest,
} from '../../api/admin'
import type { AdminContestForm } from '../../api/admin'

// ==================== 本地表单类型（时间字段用 number 时间戳） ====================

interface ContestFormLocal {
  name: string
  category: 'OFFICIAL' | 'PUBLIC' | 'TEAM'
  type: 'IOI' | 'ICPC' | 'OI'
  rated: boolean
  startTime: number
  endTime: number
  organizer: string
  description: string
  problems: Array<{ id: number; order: number; title: string; difficulty: 'entry' | 'popularize' | 'improve' | 'provincial' | 'NOI'; acceptedCount: number; submissionCount: number }>
}

// ==================== 常量 ====================

const categoryOptions = [
  { value: 'OFFICIAL', label: '官方比赛' },
  { value: 'PUBLIC', label: '公开赛' },
  { value: 'TEAM', label: '团队赛' },
]

const typeOptions = [
  { value: 'IOI', label: 'IOI' },
  { value: 'ICPC', label: 'ICPC' },
  { value: 'OI', label: 'OI' },
]

const statusLabel: Record<ContestStatus, string> = {
  UPCOMING: '未开始',
  RUNNING: '进行中',
  ENDED: '已结束',
}

const statusTagType: Record<ContestStatus, 'warning' | 'success' | 'error'> = {
  UPCOMING: 'warning',
  RUNNING: 'success',
  ENDED: 'error',
}

// ==================== 状态 ====================

const message = useMessage()
const loading = ref(false)
const contests = ref<Contest[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const showModal = ref(false)
const modalTitle = ref('创建比赛')
const editingId = ref<number | null>(null)
const submitting = ref(false)

const formRef = ref<FormInst | null>(null)
const defaultStartTime = Date.now() + 7 * 24 * 3600 * 1000
const defaultEndTime = Date.now() + 7 * 24 * 3600 * 1000 + 4 * 3600 * 1000

const form = reactive<ContestFormLocal>({
  name: '',
  category: 'PUBLIC',
  type: 'ICPC',
  rated: true,
  startTime: defaultStartTime,
  endTime: defaultEndTime,
  organizer: '',
  description: '',
  problems: [],
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入比赛名称', trigger: 'blur' }],
  organizer: [{ required: true, message: '请输入主办方', trigger: 'blur' }],
}

// ==================== 表格列定义 ====================

const columns: DataTableColumns<Contest> = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
  },
  {
    title: '名称',
    key: 'name',
    ellipsis: { tooltip: true },
  },
  {
    title: '类别',
    key: 'category',
    width: 90,
    render(row) {
      const label = categoryOptions.find((o) => o.value === row.category)?.label || row.category
      return label
    },
  },
  {
    title: '赛制',
    key: 'type',
    width: 70,
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return h(NTag, { type: statusTagType[row.status], size: 'small', round: true }, () => statusLabel[row.status])
    },
  },
  {
    title: 'Rated',
    key: 'rated',
    width: 70,
    render(row) {
      return row.rated ? h(NTag, { type: 'info', size: 'small', round: true }, () => 'Rated') : '-'
    },
  },
  {
    title: '开始时间',
    key: 'startTime',
    width: 150,
    render(row) {
      return formatDateTime(row.startTime)
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(NButton, { size: 'small', onClick: () => openEdit(row) }, () => '编辑'),
        h(
          NPopconfirm,
          { onPositiveClick: () => handleDelete(row.id) },
          {
            trigger: () => h(NButton, { size: 'small', type: 'error' }, () => '删除'),
            default: () => `确定删除比赛 "${row.name}" 吗？`,
          },
        ),
      ])
    },
  },
]

// ==================== 数据加载 ====================

async function loadContests(): Promise<void> {
  loading.value = true
  try {
    const res = await fetchAdminContests({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value || undefined,
    })
    contests.value = res.data.data
    total.value = res.data.total
  } catch {
    message.error('加载比赛列表失败')
  } finally {
    loading.value = false
  }
}

function onSearch(): void {
  page.value = 1
  loadContests()
}

function onPageChange(p: number): void {
  page.value = p
  loadContests()
}

// ==================== 表单操作 ====================

function openCreate(): void {
  editingId.value = null
  modalTitle.value = '创建比赛'
  resetForm()
  showModal.value = true
}

function openEdit(contest: Contest): void {
  editingId.value = contest.id
  modalTitle.value = `编辑比赛 — ${contest.name}`
  form.name = contest.name
  form.category = contest.category
  form.type = contest.type
  form.rated = contest.rated
  form.startTime = new Date(contest.startTime).getTime()
  form.endTime = new Date(contest.endTime).getTime()
  form.organizer = contest.organizer
  form.problems = []
  // 尝试加载详情以获取 description 和 problems
  loadContestDetailForEdit(contest.id)
  showModal.value = true
}

async function loadContestDetailForEdit(id: number): Promise<void> {
  try {
    const detailMap = (await import('../../api/mock/contests')).mockContestDetailMap
    const detail = detailMap[id]
    if (detail) {
      form.description = detail.description
      form.problems = detail.problems.map((p) => ({ ...p }))
    }
  } catch {
    // 加载失败，保持默认
  }
}

function resetForm(): void {
  form.name = ''
  form.category = 'PUBLIC'
  form.type = 'ICPC'
  form.rated = true
  form.startTime = defaultStartTime
  form.endTime = defaultEndTime
  form.organizer = ''
  form.description = ''
  form.problems = []
}

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  // 校验时间
  if (new Date(form.endTime).getTime() <= new Date(form.startTime).getTime()) {
    message.warning('结束时间必须晚于开始时间')
    return
  }

  submitting.value = true
  try {
    const payload: AdminContestForm = {
      ...form,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
    }
    if (editingId.value) {
      await updateContest(editingId.value, payload)
      message.success('比赛更新成功')
    } else {
      await createContest(payload)
      message.success('比赛创建成功')
    }
    showModal.value = false
    await loadContests()
  } catch {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number): Promise<void> {
  try {
    await deleteContest(id)
    message.success('比赛已删除')
    await loadContests()
  } catch {
    message.error('删除失败')
  }
}

function addProblem(): void {
  form.problems.push({
    id: Date.now(),
    order: form.problems.length + 1,
    title: '',
    difficulty: 'entry',
    acceptedCount: 0,
    submissionCount: 0,
  })
}

function removeProblem(index: number): void {
  form.problems.splice(index, 1)
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadContests()
})
</script>

<template>
  <div class="admin-contest-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-row">
        <h1>比赛管理</h1>
        <NButton type="primary" @click="openCreate">
          <template #icon><NIcon><AddOutline /></NIcon></template>
          创建比赛
        </NButton>
      </div>
      <p class="page-subtitle">管理平台比赛，包括创建、编辑和删除比赛</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <NInput
        v-model:value="keyword"
        placeholder="搜索比赛名称..."
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
      :data="contests"
      :loading="loading"
      :pagination="{
        page: page,
        pageSize: pageSize,
        itemCount: total,
        onChange: onPageChange,
        pageSizes: [10, 20, 50],
        showSizePicker: true,
      }"
      :row-key="(row: Contest) => row.id"
      striped
    />

    <!-- 新建/编辑弹窗 -->
    <NModal
      v-model:show="showModal"
      :title="modalTitle"
      preset="card"
      style="width: min(800px, 90vw)"
      :mask-closable="false"
    >
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <NGrid :cols="2" :x-gap="16">
          <NGi :span="2">
            <NFormItem label="比赛名称" path="name">
              <NInput v-model:value="form.name" placeholder="请输入比赛名称" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="比赛类别">
              <NSelect v-model:value="form.category" :options="categoryOptions" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="赛制">
              <NSelect v-model:value="form.type" :options="typeOptions" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="Rated">
              <NSwitch v-model:value="form.rated" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="主办方" path="organizer">
              <NInput v-model:value="form.organizer" placeholder="主办团队/管理员名" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="开始时间">
              <NDatePicker
                v-model:value="form.startTime"
                type="datetime"
                style="width: 100%"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="结束时间">
              <NDatePicker
                v-model:value="form.endTime"
                type="datetime"
                style="width: 100%"
              />
            </NFormItem>
          </NGi>
        </NGrid>

        <NFormItem label="比赛描述 (Markdown)">
          <NInput
            v-model:value="form.description"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            placeholder="支持 Markdown 格式"
          />
        </NFormItem>

        <!-- 题目列表 -->
        <div class="contest-problems-section">
          <div class="problems-header">
            <span class="problems-label">比赛题目</span>
            <NButton size="small" @click="addProblem">
              <template #icon><NIcon><AddOutline /></NIcon></template>
              添加题目
            </NButton>
          </div>
          <div
            v-for="(prob, index) in form.problems"
            :key="index"
            class="contest-problem-row"
          >
            <div class="problem-row-header">
              <span class="problem-idx">题 {{ index + 1 }}</span>
              <NButton text size="small" type="error" @click="removeProblem(index)">
                <template #icon><NIcon><TrashOutline /></NIcon></template>
              </NButton>
            </div>
            <NGrid :cols="2" :x-gap="12">
              <NGi>
                <NInput v-model:value="prob.title" placeholder="题目标题" size="small" />
              </NGi>
              <NGi>
                <NSelect
                  v-model:value="prob.difficulty"
                  :options="[
                    { value: 'entry', label: '入门' },
                    { value: 'popularize', label: '普及' },
                    { value: 'improve', label: '提高' },
                    { value: 'provincial', label: '省选' },
                    { value: 'NOI', label: 'NOI' },
                  ]"
                  size="small"
                />
              </NGi>
            </NGrid>
          </div>
          <p v-if="form.problems.length === 0" class="no-problems">暂无题目，点击上方按钮添加</p>
        </div>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" :loading="submitting" @click="handleSubmit">
            {{ editingId ? '保存修改' : '创建比赛' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.admin-contest-manager {
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

.contest-problems-section {
  margin-bottom: var(--gap-md);
}

.problems-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-sm);
}

.problems-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.contest-problem-row {
  margin-bottom: var(--gap-sm);
  padding: var(--gap-sm);
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

html.dark .contest-problem-row {
  border-color: #2a3a5a;
}

.problem-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-xs);
}

.problem-idx {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.no-problems {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: var(--gap-md) 0;
}
</style>
