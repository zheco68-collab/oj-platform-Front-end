import axios from 'axios'
import type { ApiResponse } from '../types'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<unknown>
    if (res.code !== 200) {
      // TODO: 全局错误处理
      return Promise.reject(new Error(res.message))
    }
    return response
  },
  (error) => {
    // TODO: 全局错误处理（401 跳转登录等）
    return Promise.reject(error)
  },
)

export default http
