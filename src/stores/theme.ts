import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'oj-theme'

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  const mode = ref<ThemeMode>(stored === 'dark' ? 'dark' : 'light')

  function toggle(): void {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  function setMode(m: ThemeMode): void {
    mode.value = m
  }

  // 持久化到 localStorage 并同步 <html> class
  watch(mode, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
    document.documentElement.classList.toggle('dark', val === 'dark')
  }, { immediate: true, flush: 'sync' })

  return { mode, toggle, setMode }
})
