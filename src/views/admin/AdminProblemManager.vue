<script setup lang="ts">
/**
 * 管理员 — 题目管理
 *
 * 功能：列表查看、搜索、新建、编辑、删除题目
 */
import { ref, reactive, onMounted, h } from 'vue'
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NPopconfirm,
  NTag,
  NDynamicTags,
  NSwitch,
  NIcon,
  NGi,
  NGrid,
  useMessage,
} from 'naive-ui'
import { AddOutline, TrashOutline, SearchOutline } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import type { Problem, Difficulty } from '../../types'
import { difficultyLabel, passRate } from '../../utils'
import {
  fetchAdminProblems,
  createProblem,
  updateProblem,
  deleteProblem,
} from '../../api/admin'
import type { AdminProblemForm } from '../../api/admin'

// ==================== 常量 ====================

const difficultyOptions = Object.entries(difficultyLabel).map(([value, label]) => ({
  value,
  label,
}))

const sourceOptions = ['原创', '洛谷', 'Codeforces', 'AtCoder', 'LeetCode'].map((s) => ({
  value: s,
  label: s,
}))

// ==================== 状态 ====================

const message = useMessage()
const loading = ref(false)
const problems = ref<Problem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const showModal = ref(false)
const modalTitle = ref('新建题目')
const editingId = ref<number | null>(null)
const submitting = ref(false)

const formRef = ref<FormInst | null>(null)
const form = reactive<AdminProblemForm>({
  title: '',
  difficulty: 'entry',
  tags: [],
  source: '原创',
  timeLimit: 1000,
  memoryLimit: 128,
  description: '',
  inputFormat: '',
  outputFormat: '',
  samples: [],
  hint: '',
  isPublic: true,
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  timeLimit: [
    { required: true, type: 'number', message: '请输入时间限制', trigger: 'blur' },
  ],
  memoryLimit: [
    { required: true, type: 'number', message: '请输入内存限制', trigger: 'blur' },
  ],
}

// ==================== 表格列定义 ====================

const columns: DataTableColumns<Problem> = [
  {
    title: '编号',
    key: 'id',
    width: 80,
    render(row) {
      return `P${row.id}`
    },
  },
  {
    title: '标题',
    key: 'title',
    ellipsis: { tooltip: true },
  },
  {
    title: '难度',
    key: 'difficulty',
    width: 80,
    render(row) {
      return h(NTag, { type: diffNaiveType(row.difficulty), size: 'small', round: true }, () => difficultyLabel[row.difficulty])
    },
  },
  {
    title: '来源',
    key: 'source',
    width: 100,
  },
  {
    title: '通过率',
    key: 'passRate',
    width: 100,
    render(row) {
      return passRate(row.acceptedCount, row.submissionCount)
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(
          NButton,
          { size: 'small', onClick: () => openEdit(row) },
          () => '编辑',
        ),
        h(
          NPopconfirm,
          { onPositiveClick: () => handleDelete(row.id) },
          {
            trigger: () => h(NButton, { size: 'small', type: 'error' }, () => '删除'),
            default: () => `确定删除题目 P${row.id} "${row.title}" 吗？`,
          },
        ),
      ])
    },
  },
]

function diffNaiveType(d: Difficulty): 'success' | 'info' | 'warning' | 'error' | 'default' {
  const map: Record<Difficulty, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
    entry: 'success',
    popularize: 'info',
    improve: 'warning',
    provincial: 'error',
    NOI: 'default',
  }
  return map[d]
}

// ==================== 数据加载 ====================

async function loadProblems(): Promise<void> {
  loading.value = true
  try {
    const res = await fetchAdminProblems({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value || undefined,
    })
    problems.value = res.data.data
    total.value = res.data.total
  } catch {
    message.error('加载题目列表失败')
  } finally {
    loading.value = false
  }
}

function onSearch(): void {
  page.value = 1
  loadProblems()
}

function onPageChange(p: number): void {
  page.value = p
  loadProblems()
}

// ==================== 表单操作 ====================

function openCreate(): void {
  editingId.value = null
  modalTitle.value = '新建题目'
  resetForm()
  showModal.value = true
}

function openEdit(problem: Problem): void {
  editingId.value = problem.id
  modalTitle.value = `编辑题目 P${problem.id}`
  // 从 detail map 获取完整数据（如果存在），否则用列表数据填充
  form.title = problem.title
  form.difficulty = problem.difficulty
  form.tags = [...problem.tags]
  form.source = problem.source
  form.timeLimit = problem.timeLimit
  form.memoryLimit = problem.memoryLimit
  // 详情数据通过异步加载
  loadProblemDetailForEdit(problem.id)
  showModal.value = true
}

async function loadProblemDetailForEdit(id: number): Promise<void> {
  try {
    const { fetchAdminProblemDetail } = await import('../../api/admin')
    const res = await fetchAdminProblemDetail(id)
    if (res.data) {
      form.description = res.data.description
      form.inputFormat = res.data.inputFormat
      form.outputFormat = res.data.outputFormat
      form.samples = res.data.samples.map((s) => ({ ...s }))
      form.hint = res.data.hint
      form.isPublic = res.data.isPublic
    }
  } catch {
    // 加载失败，保持表单默认值
  }
}

function resetForm(): void {
  form.title = ''
  form.difficulty = 'entry'
  form.tags = []
  form.source = '原创'
  form.timeLimit = 1000
  form.memoryLimit = 128
  form.description = ''
  form.inputFormat = ''
  form.outputFormat = ''
  form.samples = []
  form.hint = ''
  form.isPublic = true
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
      await updateProblem(editingId.value, { ...form })
      message.success('题目更新成功')
    } else {
      await createProblem({ ...form })
      message.success('题目创建成功')
    }
    showModal.value = false
    await loadProblems()
  } catch {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number): Promise<void> {
  try {
    await deleteProblem(id)
    message.success('题目已删除')
    await loadProblems()
  } catch {
    message.error('删除失败')
  }
}

function addSample(): void {
  form.samples.push({ input: '', output: '' })
}

function removeSample(index: number): void {
  form.samples.splice(index, 1)
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadProblems()
})
</script>

<template>
  <div class="admin-problem-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-row">
        <h1>题目管理</h1>
        <NButton type="primary" @click="openCreate">
          <template #icon><NIcon><AddOutline /></NIcon></template>
          新建题目
        </NButton>
      </div>
      <p class="page-subtitle">管理平台题库，包括新建、编辑和删除题目</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <NInput
        v-model:value="keyword"
        placeholder="搜索题目编号或标题..."
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
      :data="problems"
      :loading="loading"
      :pagination="{
        page: page,
        pageSize: pageSize,
        itemCount: total,
        onChange: onPageChange,
        pageSizes: [10, 20, 50],
        showSizePicker: true,
      }"
      :row-key="(row: Problem) => row.id"
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
          <NGi>
            <NFormItem label="题目标题" path="title">
              <NInput v-model:value="form.title" placeholder="请输入题目标题" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="难度" path="difficulty">
              <NSelect
                v-model:value="form.difficulty"
                :options="difficultyOptions"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="来源" path="source">
              <NSelect
                v-model:value="form.source"
                :options="sourceOptions"
                tag
                filterable
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="算法标签">
              <NDynamicTags v-model:value="form.tags" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="时间限制 (ms)" path="timeLimit">
              <NInputNumber v-model:value="form.timeLimit" :min="1" :step="100" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="内存限制 (MB)" path="memoryLimit">
              <NInputNumber v-model:value="form.memoryLimit" :min="1" :step="64" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="公开题目">
              <NSwitch v-model:value="form.isPublic" />
              <span style="margin-left:8px;color:var(--text-secondary);font-size:0.85rem">
                {{ form.isPublic ? '公开（显示在题库中）' : '私有（不显示在题库中）' }}
              </span>
            </NFormItem>
          </NGi>
        </NGrid>

        <NFormItem label="题目描述 (Markdown)">
          <NInput
            v-model:value="form.description"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            placeholder="支持 Markdown 和 LaTeX 公式"
          />
        </NFormItem>

        <NFormItem label="输入格式 (Markdown)">
          <NInput
            v-model:value="form.inputFormat"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="支持 Markdown 和 LaTeX 公式"
          />
        </NFormItem>

        <NFormItem label="输出格式 (Markdown)">
          <NInput
            v-model:value="form.outputFormat"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="支持 Markdown 和 LaTeX 公式"
          />
        </NFormItem>

        <!-- 样例区域 -->
        <div class="samples-section">
          <div class="samples-header">
            <span class="samples-label">样例</span>
            <NButton size="small" @click="addSample">
              <template #icon><NIcon><AddOutline /></NIcon></template>
              添加样例
            </NButton>
          </div>
          <div
            v-for="(sample, index) in form.samples"
            :key="index"
            class="sample-row"
          >
            <div class="sample-item">
              <span class="sample-idx">样例 {{ index + 1 }}</span>
              <NButton text size="small" type="error" @click="removeSample(index)">
                <template #icon><NIcon><TrashOutline /></NIcon></template>
              </NButton>
            </div>
            <NGrid :cols="2" :x-gap="12">
              <NGi>
                <NInput
                  v-model:value="sample.input"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 6 }"
                  placeholder="输入样例"
                />
              </NGi>
              <NGi>
                <NInput
                  v-model:value="sample.output"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 6 }"
                  placeholder="输出样例"
                />
              </NGi>
            </NGrid>
          </div>
        </div>

        <NFormItem label="提示/说明 (Markdown)">
          <NInput
            v-model:value="form.hint"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="支持 Markdown 和 LaTeX 公式（可选）"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" :loading="submitting" @click="handleSubmit">
            {{ editingId ? '保存修改' : '创建题目' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.admin-problem-manager {
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

.samples-section {
  margin-bottom: var(--gap-md);
}

.samples-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-sm);
}

.samples-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sample-row {
  margin-bottom: var(--gap-md);
  padding: var(--gap-sm);
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

html.dark .sample-row {
  border-color: #2a3a5a;
}

.sample-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-xs);
}

.sample-idx {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
