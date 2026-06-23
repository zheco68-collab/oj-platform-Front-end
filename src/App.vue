<script setup lang="ts">
import { NLayout, NLayoutContent, NMessageProvider } from 'naive-ui'
import GlobalHeader from './components/GlobalHeader.vue'
import GlobalFooter from './components/GlobalFooter.vue'
</script>

<template>
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
