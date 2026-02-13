import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import type { ApiHeaders } from '@/types'

/**
 * 从响应头中提取并更新新的 access_token
 */
function updateTokenFromHeaders(headers: unknown): void {
  if (!headers || typeof headers !== 'object') return

  const newToken = (headers as ApiHeaders)['new_access_token']
  if (!newToken || typeof newToken !== 'string' || !newToken.trim()) return

  if (import.meta.env.DEV) {
    const oldToken = localStorage.getItem('token')
    console.log('[Token Refresh] Old:', oldToken?.slice(0, 20) + '...')
    console.log('[Token Refresh] New:', newToken.slice(0, 20) + '...')
  }

  localStorage.setItem('token', newToken)
  const userStore = useUserStore()
  if (userStore) {
    userStore.token = newToken
  }
}

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.access_token = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// HTTP 状态码错误消息映射
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  401: '登录已过期,请重新登录',
  403: '没有权限访问',
  404: '请求的资源不存在',
  500: '服务器错误'
}

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    const { code, msg, data } = response.data
    updateTokenFromHeaders(response.headers)

    // 成功响应
    if (code === '200' || code === '0') {
      return data
    }

    // 业务错误
    ElMessage.error(msg || '请求失败')
    return Promise.reject(new Error(msg))
  },
  (error: AxiosError) => {
    // 更新 token（错误响应）
    if (error.response?.headers) {
      updateTokenFromHeaders(error.response.headers)
    }

    // HTTP 错误处理
    if (error.response) {
      const status = error.response.status
      const message = HTTP_ERROR_MESSAGES[status] || `请求失败: ${status}`
      ElMessage.error(message)

      // 401 需要特殊处理：清除 token 并跳转到登录页
      if (status === 401) {
        localStorage.removeItem('token')
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
    } else {
      ElMessage.error('网络连接失败')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
