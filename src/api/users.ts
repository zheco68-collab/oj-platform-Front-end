/**
 * 用户相关 API
 */
import type { User, UserProfile, ApiResponse } from '../types'
import {
  mockLogin,
  mockRegister,
  mockResolveToken,
  mockRevokeToken,
  getUserProfile,
} from './mock/users'

/** 模拟网络延迟 (200-500ms) */
function delay(ms?: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms ?? 200 + Math.random() * 300))
}

/** 登录 */
export async function login(
  username: string,
  password: string,
): Promise<ApiResponse<{ token: string; user: User } | null>> {
  await delay()
  const result = mockLogin(username, password)
  if ('error' in result) {
    return { code: 401, message: result.error, data: null }
  }
  return { code: 200, message: 'ok', data: result }
}

/** 注册 */
export async function register(
  username: string,
  email: string,
  password: string,
): Promise<ApiResponse<{ token: string; user: User } | null>> {
  await delay()
  const result = mockRegister(username, email, password)
  if ('error' in result) {
    return { code: 400, message: result.error, data: null }
  }
  return { code: 200, message: 'ok', data: result }
}

/** 根据 token 获取当前用户信息 */
export async function fetchCurrentUser(
  token: string,
): Promise<ApiResponse<User | null>> {
  await delay(100 + Math.random() * 150)
  const user = mockResolveToken(token)
  if (!user) {
    return { code: 401, message: 'Token invalid or expired', data: null }
  }
  return { code: 200, message: 'ok', data: user }
}

/** 登出（清除 token 服务端） */
export async function logout(_token: string): Promise<ApiResponse<null>> {
  await delay(100)
  mockRevokeToken(_token)
  return { code: 200, message: 'ok', data: null }
}

/** 获取用户主页数据 */
export async function fetchUserProfile(
  userId: number,
): Promise<ApiResponse<UserProfile | null>> {
  await delay()
  const profile = getUserProfile(userId)
  if (!profile) {
    return { code: 404, message: 'User not found', data: null }
  }
  return { code: 200, message: 'ok', data: profile }
}
