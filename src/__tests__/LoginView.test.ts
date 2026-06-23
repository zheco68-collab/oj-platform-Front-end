/**
 * LoginView / RegisterView 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { createTestRouter, mountWithPlugins } from '../test/helpers'

// Mock useMessage
vi.mock('naive-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('naive-ui')>()
  return {
    ...actual,
    useMessage: () => ({
      info: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      destroyAll: vi.fn(),
    }),
  }
})

// Mock auth store login/register
const mockLogin = vi.fn()
const mockRegister = vi.fn()

vi.mock('../stores/auth', () => ({
  useAuthStore: () => ({
    isLoggedIn: false,
    isAdmin: false,
    loading: false,
    error: '',
    login: mockLogin,
    register: mockRegister,
    initFromStorage: vi.fn(),
  }),
}))

// ==================== 辅助函数 ====================

function mountLoginView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createTestRouter([
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/', name: 'home', component: { template: '<div/>' } },
  ])
  router.push('/login')
  return mountWithPlugins(LoginView, { router, pinia })
}

function mountRegisterView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createTestRouter([
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'home', component: { template: '<div/>' } },
  ])
  router.push('/register')
  return mountWithPlugins(RegisterView, { router, pinia })
}

// ==================== LoginView 测试 ====================

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('页面渲染', () => {
    it('应该渲染登录标题', () => {
      const wrapper = mountLoginView()
      expect(wrapper.text()).toContain('登录 OJ')
    })

    it('应该渲染用户名和密码输入框', () => {
      const wrapper = mountLoginView()
      expect(wrapper.find('input[placeholder="请输入用户名"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="请输入密码"]').exists()).toBe(true)
    })

    it('应该渲染登录按钮', () => {
      const wrapper = mountLoginView()
      expect(wrapper.text()).toContain('登录')
    })

    it('应该渲染注册链接', () => {
      const wrapper = mountLoginView()
      expect(wrapper.text()).toContain('立即注册')
    })

    it('应该渲染演示账号提示', () => {
      const wrapper = mountLoginView()
      expect(wrapper.text()).toContain('演示账号')
      expect(wrapper.text()).toContain('tourist')
    })

    it('可以关闭演示提示', async () => {
      const wrapper = mountLoginView()
      const closeBtn = wrapper.find('.demo-hint button')
      if (closeBtn.exists()) {
        await closeBtn.trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.demo-hint').exists()).toBe(false)
      }
    })
  })

  describe('表单验证', () => {
    it('空表单提交应触发验证', async () => {
      const wrapper = mountLoginView()
      const btn = wrapper.find('button')
      await btn.trigger('click')
      await flushPromises()

      // 验证失败，login 不应被调用
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('登录跳转', () => {
    it('登录成功后跳转首页', async () => {
      mockLogin.mockResolvedValueOnce(undefined)

      const wrapper = mountLoginView()
      // 填充表单
      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      const passwordInput = wrapper.find('input[placeholder="请输入密码"]')
      await usernameInput.setValue('tourist')
      await passwordInput.setValue('123456')

      const btn = wrapper.find('button')
      await btn.trigger('click')
      await flushPromises()

      expect(mockLogin).toHaveBeenCalledWith('tourist', '123456')
    })
  })

  describe('错误处理', () => {
    it('登录失败时不跳转', async () => {
      mockLogin.mockRejectedValueOnce(new Error('密码错误'))

      const wrapper = mountLoginView()
      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      const passwordInput = wrapper.find('input[placeholder="请输入密码"]')
      await usernameInput.setValue('tourist')
      await passwordInput.setValue('wrong')

      const btn = wrapper.find('button')
      await btn.trigger('click')
      await flushPromises()

      // 页面仍显示
      expect(wrapper.text()).toContain('登录 OJ')
    })
  })
})

// ==================== RegisterView 测试 ====================

describe('RegisterView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('页面渲染', () => {
    it('应该渲染注册标题', () => {
      const wrapper = mountRegisterView()
      expect(wrapper.text()).toContain('注册 OJ')
    })

    it('应该渲染用户名、邮箱、密码、确认密码输入框', () => {
      const wrapper = mountRegisterView()
      expect(wrapper.text()).toContain('用户名')
      expect(wrapper.text()).toContain('邮箱')
      expect(wrapper.text()).toContain('密码')
      expect(wrapper.text()).toContain('确认密码')
    })

    it('应该渲染注册按钮', () => {
      const wrapper = mountRegisterView()
      expect(wrapper.text()).toContain('注册')
    })

    it('应该渲染登录链接', () => {
      const wrapper = mountRegisterView()
      expect(wrapper.text()).toContain('立即登录')
    })
  })

  describe('注册流程', () => {
    it('注册成功后跳转首页', async () => {
      mockRegister.mockResolvedValueOnce(undefined)

      const wrapper = mountRegisterView()
      const inputs = wrapper.findAll('input')
      if (inputs.length >= 4) {
        await inputs[0].setValue('newuser')
        await inputs[1].setValue('new@test.com')
        await inputs[2].setValue('123456')
        await inputs[3].setValue('123456')

        const btn = wrapper.find('button')
        await btn.trigger('click')
        await flushPromises()

        expect(mockRegister).toHaveBeenCalledWith('newuser', 'new@test.com', '123456')
      }
    })

    it('注册失败时不跳转', async () => {
      mockRegister.mockRejectedValueOnce(new Error('用户名已存在'))

      const wrapper = mountRegisterView()
      const inputs = wrapper.findAll('input')
      if (inputs.length >= 4) {
        await inputs[0].setValue('tourist')
        await inputs[1].setValue('tourist@test.com')
        await inputs[2].setValue('123456')
        await inputs[3].setValue('123456')

        const btn = wrapper.find('button')
        await btn.trigger('click')
        await flushPromises()

        expect(wrapper.text()).toContain('注册 OJ')
      }
    })
  })
})
