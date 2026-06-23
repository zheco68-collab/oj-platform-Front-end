/**
 * 用户 API 测试
 */
import { describe, it, expect } from 'vitest'
import { login, register, fetchUserProfile } from '../users'

describe('用户 API', () => {
  describe('login', () => {
    it('应该用正确的用户名和密码登录成功', async () => {
      const res = await login('tourist', '123456')
      expect(res.code).toBe(200)
      expect(res.data).not.toBeNull()
      expect(res.data!.token).toContain('mock-token-')
      expect(res.data!.user.username).toBe('tourist')
      expect(res.data!.user.id).toBe(1)
    })

    it('应该用错误的密码登录失败', async () => {
      const res = await login('tourist', 'wrongpassword')
      expect(res.code).toBe(401)
      expect(res.data).toBeNull()
      expect(res.message).toContain('密码错误')
    })

    it('应该用不存在的用户名登录失败', async () => {
      const res = await login('nonexistent', '123456')
      expect(res.code).toBe(401)
      expect(res.data).toBeNull()
      expect(res.message).toContain('用户不存在')
    })

    it('管理员账号应该包含管理员角色', async () => {
      const res = await login('AC_Automaton', '123456')
      expect(res.code).toBe(200)
      expect(res.data!.user.role).toBe('ADMIN')
    })
  })

  describe('register', () => {
    it('应该注册新用户成功', async () => {
      const res = await register('newuser', 'new@test.com', '123456')
      expect(res.code).toBe(200)
      expect(res.data).not.toBeNull()
      expect(res.data!.user.username).toBe('newuser')
      expect(res.data!.user.role).toBe('USER')
      expect(res.data!.user.acceptedCount).toBe(0)
      expect(res.data!.token).toContain('mock-token-')
    })

    it('应该用已存在的用户名注册失败', async () => {
      const res = await register('tourist', 'tourist@test.com', '123456')
      expect(res.code).toBe(400)
      expect(res.data).toBeNull()
      expect(res.message).toContain('用户名已存在')
    })

    it('应该用无效邮箱注册失败', async () => {
      const res = await register('anotheruser', 'invalid-email', '123456')
      expect(res.code).toBe(400)
      expect(res.data).toBeNull()
    })

    it('应该为新注册用户创建空 profile', async () => {
      const regRes = await register('profiletest', 'profile@test.com', '123456')
      expect(regRes.code).toBe(200)
      const userId = regRes.data!.user.id

      const profileRes = await fetchUserProfile(userId)
      expect(profileRes.code).toBe(200)
      expect(profileRes.data!.recentAC).toEqual([])
      expect(profileRes.data!.solutions).toEqual([])
      expect(profileRes.data!.contestHistory).toEqual([])
    })
  })

  describe('fetchUserProfile', () => {
    it('应该获取存在的用户主页数据', async () => {
      const res = await fetchUserProfile(1)
      expect(res.code).toBe(200)
      expect(res.data).not.toBeNull()
      expect(res.data!.username).toBe('tourist')
      expect(res.data!.recentAC.length).toBeGreaterThan(0)
      expect(res.data!.contestHistory.length).toBeGreaterThan(0)
    })

    it('应该包含用户统计数据', async () => {
      const res = await fetchUserProfile(1)
      expect(res.data!.acceptedCount).toBe(1523)
      expect(res.data!.submissionCount).toBe(2100)
      expect(res.data!.rating).toBe(3200)
    })

    it('不应该返回不存在的用户', async () => {
      const res = await fetchUserProfile(9999)
      expect(res.code).toBe(404)
      expect(res.data).toBeNull()
    })

    it('管理员用户应该标识为 ADMIN', async () => {
      const res = await fetchUserProfile(3)
      expect(res.code).toBe(200)
      expect(res.data!.role).toBe('ADMIN')
    })

    it('普通用户应该标识为 USER', async () => {
      const res = await fetchUserProfile(2)
      expect(res.code).toBe(200)
      expect(res.data!.role).toBe('USER')
    })
  })
})
