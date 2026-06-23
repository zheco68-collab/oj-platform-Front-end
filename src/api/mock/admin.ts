/**
 * 管理员面板 Mock 数据
 */
import type { AdminOverview, AdminEntry } from '../../types'
import adminData from './data/admin.json'

export const mockAdminOverview: AdminOverview[] = adminData.overview as AdminOverview[]
export const mockAdminEntries: AdminEntry[] = adminData.entries as AdminEntry[]
