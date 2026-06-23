<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NIcon,
  useMessage,
} from 'naive-ui'
import { PersonOutline, LockClosedOutline, ArrowForward } from '@vicons/ionicons5'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const auth = useAuthStore()

// ==================== 表单状态 ====================

const formRef = ref<InstanceType<typeof NForm> | null>(null)
const formValue = ref({
  username: '',
  password: '',
})
const submitting = ref(false)

// ==================== 表单规则 ====================

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为 2-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

// ==================== 提交 ====================

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await auth.login(formValue.value.username, formValue.value.password)
    message.success('登录成功')

    // 跳转到重定向页面或首页
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    message.error(auth.error || '登录失败，请检查用户名和密码')
  } finally {
    submitting.value = false
  }
}

// ==================== 演示提示 ====================

const showDemoHint = ref(true)
</script>

<template>
  <div class="login-page">
    <div class="login-card card">
      <div class="login-header">
        <h1>登录 OJ</h1>
        <p class="login-subtitle">欢迎回来，继续你的算法之旅</p>
      </div>

      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        @keyup.enter="handleSubmit"
      >
        <NFormItem path="username" label="用户名">
          <NInput
            v-model:value="formValue.username"
            placeholder="请输入用户名"
            clearable
            :disabled="submitting"
          >
            <template #prefix>
              <NIcon :component="PersonOutline" />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem path="password" label="密码">
          <NInput
            v-model:value="formValue.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
            :disabled="submitting"
            @keyup.enter="handleSubmit"
          >
            <template #prefix>
              <NIcon :component="LockClosedOutline" />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem>
          <NButton
            type="primary"
            block
            :loading="submitting"
            @click="handleSubmit"
          >
            登录
            <template #icon>
              <NIcon><ArrowForward /></NIcon>
            </template>
          </NButton>
        </NFormItem>
      </NForm>

      <div class="login-footer">
        <span>还没有账号？</span>
        <RouterLink to="/register" class="link">立即注册</RouterLink>
      </div>

      <!-- 演示提示 -->
      <div v-if="showDemoHint" class="demo-hint">
        <div class="demo-hint-header">
          <span class="demo-hint-title">🔑 演示账号</span>
          <NButton text size="tiny" type="default" @click="showDemoHint = false">
            关闭
          </NButton>
        </div>
        <p>用户名：<code>tourist</code> 或 <code>AC_Automaton</code>（管理员）</p>
        <p>密码：<code>123456</code>（所有测试用户通用）</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: var(--gap-xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--gap-lg);
}

.login-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--gap-xs);
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.login-footer {
  text-align: center;
  margin-top: var(--gap-md);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.login-footer .link {
  color: var(--color-primary);
  margin-left: 4px;
  text-decoration: none;
  font-weight: 500;
}

.login-footer .link:hover {
  text-decoration: underline;
}

.demo-hint {
  margin-top: var(--gap-lg);
  padding: var(--gap-md);
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: var(--border-radius);
  font-size: 0.85rem;
}

.demo-hint-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-sm);
}

.demo-hint-title {
  font-weight: 600;
  color: var(--color-primary);
}

.demo-hint p {
  color: var(--text-secondary);
  margin: 2px 0;
}

.demo-hint code {
  background: #e0f2fe;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: var(--color-primary-dark);
}

html.dark .demo-hint {
  background: #0f172a;
  border-color: #1e3a5f;
}

html.dark .demo-hint code {
  background: #1e3a5f;
  color: #5dade2;
}
</style>
