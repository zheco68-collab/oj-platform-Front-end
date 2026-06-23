<script setup lang="ts">
import { NDivider } from 'naive-ui'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="global-footer">
    <div class="footer-inner container">
      <div class="footer-links">
        <a href="#" class="footer-link">关于我们</a>
        <span class="footer-sep">·</span>
        <a href="#" class="footer-link">帮助中心</a>
        <span class="footer-sep">·</span>
        <a href="#" class="footer-link">服务条款</a>
        <span class="footer-sep">·</span>
        <a href="#" class="footer-link">隐私政策</a>
        <span class="footer-sep">·</span>
        <a href="#" class="footer-link">联系我们</a>
      </div>
      <NDivider class="footer-divider" />
      <p class="footer-copy">© {{ currentYear }} OJ Platform — 在线判题刷题平台 版权所有</p>
      <p class="footer-icp">ICP 备案号：待备案 | 公安备案号：待备案</p>
      <p class="footer-tech">Powered by Vue 3 + TypeScript + Naive UI + Vite</p>
    </div>
  </footer>
</template>

<style scoped>
.global-footer {
  background: var(--bg-footer);
  color: var(--text-inverse);
  padding: var(--gap-lg) 0;
  margin-top: auto;
}

.footer-inner {
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm);
  flex-wrap: wrap;
  padding-bottom: var(--gap-xs);
}

.footer-link {
  color: var(--text-inverse);
  opacity: 0.8;
  font-size: 0.875rem;
  text-decoration: none;
  transition: opacity 0.2s;
}

.footer-link:hover {
  opacity: 1;
  color: var(--color-primary-light);
}

.footer-sep {
  opacity: 0.4;
  font-size: 0.75rem;
}

.footer-divider {
  margin: var(--gap-xs) 0;
  opacity: 0.15;
}

.footer-copy {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 2px;
}

.footer-icp {
  font-size: 0.75rem;
  opacity: 0.5;
  margin-bottom: 4px;
}

.footer-tech {
  font-size: 0.75rem;
  opacity: 0.5;
}
</style>
