import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function login(_username: string, _password: string): Promise<void> {
    // TODO: 对接真实登录 API
    return Promise.resolve()
  }

  function logout(): void {
    token.value = null
    user.value = null
  }

  function setAuth(_token: string, _user: User): void {
    token.value = _token
    user.value = _user
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    setAuth,
  }
})
