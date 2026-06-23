<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NIcon,
  useMessage,
} from 'naive-ui'
import { PersonOutline, MailOutline, LockClosedOutline, ArrowForward } from '@vicons/ionicons5'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const message = useMessage()
const auth = useAuthStore()

// ==================== 表单状态 ====================

const formRef = ref<InstanceType<typeof NForm> | null>(null)
const formValue = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const submitting = ref(false)

// ==================== 表单规则 ====================

function validateConfirmPassword(_rule: unknown, value: string): boolean {
  return value === formValue.value.password
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为 2-20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: '用户名只能包含字母、数字、下划线、短横线',
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: validateConfirmPassword,
      message: '两次密码输入不一致',
      trigger: 'blur',
    },
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
    await auth.register(
      formValue.value.username,
      formValue.value.email,
      formValue.value.password,
    )
    message.success('注册成功，已自动登录')
    router.push('/')
  } catch {
    message.error(auth.error || '注册失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card card">
      <div class="register-header">
        <h1>注册 OJ</h1>
        <p class="register-subtitle">创建你的账号，开启算法之旅</p>
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
            placeholder="2-20位字母、数字、下划线"
            clearable
            :disabled="submitting"
          >
            <template #prefix>
              <NIcon :component="PersonOutline" />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem path="email" label="邮箱">
          <NInput
            v-model:value="formValue.email"
            placeholder="请输入邮箱地址"
            clearable
            :disabled="submitting"
          >
            <template #prefix>
              <NIcon :component="MailOutline" />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem path="password" label="密码">
          <NInput
            v-model:value="formValue.password"
            type="password"
            show-password-on="click"
            placeholder="至少6位密码"
            :disabled="submitting"
          >
            <template #prefix>
              <NIcon :component="LockClosedOutline" />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem path="confirmPassword" label="确认密码">
          <NInput
            v-model:value="formValue.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="再次输入密码"
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
            注册
            <template #icon>
              <NIcon><ArrowForward /></NIcon>
            </template>
          </NButton>
        </NFormItem>
      </NForm>

      <div class="register-footer">
        <span>已有账号？</span>
        <RouterLink to="/login" class="link">立即登录</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
}

.register-card {
  width: 100%;
  max-width: 460px;
  padding: var(--gap-xl);
}

.register-header {
  text-align: center;
  margin-bottom: var(--gap-lg);
}

.register-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--gap-xs);
}

.register-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.register-footer {
  text-align: center;
  margin-top: var(--gap-md);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.register-footer .link {
  color: var(--color-primary);
  margin-left: 4px;
  text-decoration: none;
  font-weight: 500;
}

.register-footer .link:hover {
  text-decoration: underline;
}
</style>
