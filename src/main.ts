import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import router from './router'
import App from './App.vue'
import './assets/global.css'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(naive)

// 从 localStorage 恢复登录态
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
auth.initFromStorage()

app.mount('#app')
