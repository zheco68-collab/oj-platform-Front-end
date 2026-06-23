import type { Banner, Announcement } from '../../types'
import bannersData from './data/banners.json'
import announcementsData from './data/announcements.json'

// 使用可变副本，使 Admin CRUD 可操作
export const mockBanners: Banner[] = [...(bannersData as Banner[])]
export const mockAnnouncements: Announcement[] = [...(announcementsData as Announcement[])]
