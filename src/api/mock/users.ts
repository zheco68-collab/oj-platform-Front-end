/**
 * 用户 Mock 数据与操作
 */
import type { User, UserProfile } from '../../types'
import usersData from './data/users.json'

// ==================== 内部可变副本 ====================

const users: User[] = usersData.users as User[]
const userProfiles: Record<number, UserProfile> = {}

function initProfiles(): void {
  for (const [key, value] of Object.entries(usersData.userProfiles)) {
    const user = users.find((u) => u.id === Number(key))
    if (user) {
      userProfiles[Number(key)] = { ...user, ...(value as Omit<UserProfile, keyof User>) }
    }
  }
}
initProfiles()

// 默认密码
const DEFAULT_PASSWORD = '123456'

// 内存中存储已注册用户的密码（初始用户的密码也存进去）
const passwordMap: Record<number, string> = {}
users.forEach((u) => {
  passwordMap[u.id] = DEFAULT_PASSWORD
})

let nextUserId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1

// ==================== 查询函数 ====================

/** 根据用户名查找用户 */
export function findUserByUsername(username: string): User | undefined {
  return users.find((u) => u.username === username)
}

/** 根据 ID 查找用户 */
export function findUserById(id: number): User | undefined {
  return users.find((u) => u.id === id)
}

/** 获取用户完整主页数据 */
export function getUserProfile(id: number): UserProfile | undefined {
  return userProfiles[id]
}

// ==================== 认证操作 ====================

/** 生成简单 token */
function generateToken(userId: number): string {
  return `mock-token-${userId}-${Date.now()}`
}

/** 登录 */
export function mockLogin(
  username: string,
  password: string,
): { token: string; user: User } | { error: string } {
  const user = findUserByUsername(username)
  if (!user) {
    return { error: '用户不存在' }
  }
  const storedPwd = passwordMap[user.id]
  if (storedPwd !== password) {
    return { error: '密码错误' }
  }
  const token = generateToken(user.id)
  // 将 token 存到内存（用于后续恢复 session）
  tokenUserMap.set(token, user.id)
  return { token, user }
}

/** 注册 */
export function mockRegister(
  username: string,
  _email: string,
  password: string,
): { token: string; user: User } | { error: string } {
  // 检查用户名是否已存在
  if (findUserByUsername(username)) {
    return { error: '用户名已存在' }
  }

  // 严格验证 email（由于 mock 不持久化，只做格式校验）
  if (_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_email)) {
    return { error: '邮箱格式不正确' }
  }

  const id = nextUserId++
  const user: User = {
    id,
    username,
    avatarUrl: '',
    signature: '',
    role: 'USER',
    createdAt: new Date().toISOString(),
    acceptedCount: 0,
    submissionCount: 0,
    rating: 0,
  }

  users.push(user)
  passwordMap[id] = password

  // 为新用户创建空的 profile
  userProfiles[id] = {
    ...user,
    recentAC: [],
    solutions: [],
    contestHistory: [],
  }

  const token = generateToken(id)
  tokenUserMap.set(token, id)
  return { token, user }
}

/** 根据 token 恢复用户 */
const tokenUserMap = new Map<string, number>()

export function mockResolveToken(token: string): User | undefined {
  const userId = tokenUserMap.get(token)
  if (!userId) return undefined
  return findUserById(userId)
}

/** 清除 token（登出） */
export function mockRevokeToken(token: string): void {
  tokenUserMap.delete(token)
}
