import type { User, UserProfile } from '../../types'
import usersData from './data/users.json'

export const mockUser: User | null = usersData.user as User | null
export const mockUserProfile: UserProfile | null = usersData.userProfile as UserProfile | null
