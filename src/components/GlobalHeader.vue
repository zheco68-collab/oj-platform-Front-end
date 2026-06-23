<script setup lang="ts">
import { h, computed } from 'vue'
import { NLayoutHeader, NMenu, NButton, NAvatar, NDropdown, NBadge, NIcon } from 'naive-ui'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { NotificationsOutline } from '@vicons/ionicons5'
import { useAuthStore } from '../stores/auth'
import type { DropdownOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const menuOptions = [
  { label: () => h(RouterLink, { to: '/' }, { default: () => '首页' }), key: 'home' },
  { label: () => h(RouterLink, { to: '/problem' }, { default: () => '题库' }), key: 'problem-list' },
  { label: () => h(RouterLink, { to: '/contest' }, { default: () => '比赛' }), key: 'contest-list' },
  { label: () => h(RouterLink, { to: '/problem/1001/solution' }, { default: () => '题解' }), key: 'solution' },
]

// 动态计算当前激活的菜单项
const activeKey = computed(() => {
  const name = route.name as string
  if (['home'].includes(name)) return 'home'
  if (['problem-list', 'problem-detail', 'solution-list'].includes(name)) return 'problem-list'
  if (['contest-list', 'contest-detail'].includes(name)) return 'contest-list'
  return 'home'
})

const userDropdownOptions = computed<DropdownOption[]>(() => [
  {
    label: '个人主页',
    key: 'profile',
  },
  ...(auth.isAdmin
    ? [{ label: '管理后台', key: 'admin' } as DropdownOption]
    : []),
  { type: 'divider' as const, key: 'd1' },
  { label: '退出登录', key: 'logout' },
])

function handleUserDropdown(key: string): void {
  if (key === 'logout') {
    auth.logout()
    router.push('/')
  } else if (key === 'admin') {
    router.push('/admin')
  } else if (key === 'profile') {
    if (auth.user?.id) {
      router.push(`/user/${auth.user.id}`)
    }
  }
}

function handleNotification(): void {
  // TODO: 打开通知面板
}
</script>

<template>
  <NLayoutHeader class="global-header">
    <div class="header-inner container">
      <div class="header-left">
        <RouterLink to="/" class="logo">OJ</RouterLink>
        <NMenu
          mode="horizontal"
          :options="menuOptions"
          :value="activeKey"
        />
      </div>
      <div class="header-right">
        <template v-if="auth.isLoggedIn">
          <!-- 消息通知 -->
          <NBadge :value="0" :max="99" :show="false">
            <NButton
              text
              circle
              @click="handleNotification"
              aria-label="消息通知"
            >
              <template #icon>
                <NIcon size="20">
                  <NotificationsOutline />
                </NIcon>
              </template>
            </NButton>
          </NBadge>

          <!-- 用户头像下拉 -->
          <NDropdown
            trigger="click"
            :options="userDropdownOptions"
            @select="handleUserDropdown"
          >
            <div class="user-avatar-wrap">
              <NAvatar
                round
                size="small"
                :src="auth.user?.avatarUrl"
                class="user-avatar"
              >
                {{ auth.user?.username?.charAt(0)?.toUpperCase() }}
              </NAvatar>
              <span
                v-if="auth.isAdmin"
                class="admin-badge"
                title="管理员"
              >👑</span>
            </div>
          </NDropdown>
        </template>
        <template v-else>
          <NButton text>登录</NButton>
          <NButton type="primary" size="small">注册</NButton>
        </template>
      </div>
    </div>
  </NLayoutHeader>
</template>

<style scoped>
.global-header {
  background: var(--bg-card);
  box-shadow: var(--shadow-header);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--gap-lg);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
  flex-shrink: 0;
  user-select: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.user-avatar-wrap {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-avatar {
  transition: box-shadow 0.2s;
}

.user-avatar:hover {
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.admin-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 12px;
  line-height: 1;
  pointer-events: none;
}

/* Naive UI NMenu horizontal 模式下与 header 风格统一 */
:deep(.n-menu) {
  --n-item-text-color: var(--text-primary);
  --n-item-text-color-hover: var(--color-primary);
  --n-item-text-color-active: var(--color-primary);
}
</style>
