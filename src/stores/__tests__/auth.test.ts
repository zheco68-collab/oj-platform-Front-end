/**
 * Auth Store 测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

describe('Auth Store', () => {
  beforeEach(() => {
    // 清理 localStorage
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('应该初始为未登录状态', () => {
      const auth = useAuthStore()
      expect(auth.isLoggedIn).toBe(false)
      expect(auth.isAdmin).toBe(false)
      expect(auth.user).toBeNull()
      expect(auth.token).toBeNull()
    })

    it('应该从 localStorage 恢复 session', () => {
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'tourist',
        avatarUrl: '',
        signature: '',
        role: 'USER',
        createdAt: '2024-01-01',
        acceptedCount: 100,
        submissionCount: 200,
        rating: 2000,
      }))

      const auth = useAuthStore()
      auth.initFromStorage()

      expect(auth.isLoggedIn).toBe(true)
      expect(auth.token).toBe('test-token')
      expect(auth.user?.username).toBe('tourist')
    })

    it('应该忽略无效的 user JSON', () => {
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', '{invalid json}')

      const auth = useAuthStore()
      auth.initFromStorage()

      expect(auth.token).toBe('test-token')
      expect(auth.user).toBeNull()
    })
  })

  describe('login', () => {
    it('应该登录成功并设置状态', async () => {
      const auth = useAuthStore()
      await auth.login('tourist', '123456')

      expect(auth.isLoggedIn).toBe(true)
      expect(auth.user?.username).toBe('tourist')
      expect(auth.token).toContain('mock-token-')
    })

    it('应该登录后持久化到 localStorage', async () => {
      const auth = useAuthStore()
      await auth.login('tourist', '123456')

      expect(localStorage.getItem('token')).toBe(auth.token)
    })

    it('应该登录失败时抛出错误', async () => {
      const auth = useAuthStore()
      await expect(auth.login('tourist', 'wrong')).rejects.toThrow()

      expect(auth.isLoggedIn).toBe(false)
      expect(auth.error).toBeTruthy()
    })

    it('管理员登录后 isAdmin 为 true', async () => {
      const auth = useAuthStore()
      await auth.login('AC_Automaton', '123456')

      expect(auth.isAdmin).toBe(true)
    })
  })

  describe('register', () => {
    it('应该注册成功并自动登录', async () => {
      const auth = useAuthStore()
      await auth.register('fresh', 'fresh@test.com', '123456')

      expect(auth.isLoggedIn).toBe(true)
      expect(auth.user?.username).toBe('fresh')
    })

    it('应该重复用户名注册失败', async () => {
      const auth = useAuthStore()
      await expect(auth.register('tourist', 'a@b.com', '123456')).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('应该清除登录态', async () => {
      const auth = useAuthStore()
      await auth.login('tourist', '123456')
      expect(auth.isLoggedIn).toBe(true)

      auth.logout()
      expect(auth.isLoggedIn).toBe(false)
      expect(auth.user).toBeNull()
      expect(auth.token).toBeNull()
    })

    it('应该清除 localStorage', async () => {
      const auth = useAuthStore()
      await auth.login('tourist', '123456')

      auth.logout()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('setAuth', () => {
    it('应该手动设置认证信息', () => {
      const auth = useAuthStore()
      const mockUser = {
        id: 99,
        username: 'test',
        avatarUrl: '',
        signature: '',
        role: 'USER' as const,
        createdAt: '',
        acceptedCount: 0,
        submissionCount: 0,
      }

      auth.setAuth('manual-token', mockUser)
      expect(auth.isLoggedIn).toBe(true)
      expect(auth.token).toBe('manual-token')
      expect(auth.user?.username).toBe('test')
    })
  })
})
