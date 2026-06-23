<script setup lang="ts">
import { computed } from 'vue'
import { NLayout, NLayoutContent, NMessageProvider, NConfigProvider, darkTheme } from 'naive-ui'
import GlobalHeader from './components/GlobalHeader.vue'
import GlobalFooter from './components/GlobalFooter.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
const naiveTheme = computed(() => themeStore.mode === 'dark' ? darkTheme : undefined)
</script>

<template>
  <NConfigProvider :theme="naiveTheme">
    <NMessageProvider>
      <NLayout class="app-layout">
        <GlobalHeader />
        <NLayoutContent class="app-content">
          <div class="container">
            <router-view />
          </div>
        </NLayoutContent>
        <GlobalFooter />
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
/* 全局样式放在未 scoped 块中以影响子组件 */
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  padding: var(--gap-lg) 0;
}
</style>
