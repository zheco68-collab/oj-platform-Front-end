import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import { login as apiLogin, register as apiRegister, fetchCurrentUser } from '../api/users'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref('')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  /** 从 localStorage 恢复 session */
  function initFromStorage(): void {
    const stored = localStorage.getItem('token')
    if (stored) {
      token.value = stored
      // 尝试恢复用户信息
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          user.value = JSON.parse(userStr) as User
        } catch {
          // 解析失败，忽略
        }
      }
    }
  }

  /** 保存到 localStorage */
  function persist(): void {
    if (token.value) {
      localStorage.setItem('token', token.value)
      if (user.value) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  /** 登录 */
  async function login(username: string, password: string): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      const res = await apiLogin(username, password)
      if (res.code === 200 && res.data) {
        token.value = res.data.token
        user.value = res.data.user
        persist()
      } else {
        error.value = res.message || '登录失败'
        throw new Error(res.message)
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /** 注册 */
  async function register(
    username: string,
    email: string,
    password: string,
  ): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      const res = await apiRegister(username, email, password)
      if (res.code === 200 && res.data) {
        token.value = res.data.token
        user.value = res.data.user
        persist()
      } else {
        error.value = res.message || '注册失败'
        throw new Error(res.message)
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /** 登出 */
  function logout(): void {
    token.value = null
    user.value = null
    persist()
  }

  /** 从 API 刷新用户信息 */
  async function refreshUser(): Promise<void> {
    if (!token.value) return
    try {
      const res = await fetchCurrentUser(token.value)
      if (res.code === 200 && res.data) {
        user.value = res.data
        persist()
      }
    } catch {
      // 刷新失败静默处理
    }
  }

  /** 直接设置认证信息（供测试或特殊场景） */
  function setAuth(_token: string, _user: User): void {
    token.value = _token
    user.value = _user
    persist()
  }

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    isAdmin,
    initFromStorage,
    login,
    register,
    logout,
    refreshUser,
    setAuth,
  }
})
