// src/utils/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import router from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
        return response
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                case 403:
                    ElMessage.error('登录已过期或无权限，请重新登录')
                    router.push('/login')
                    break
                default:
                    ElMessage.error(error.response.data?.message || '请求失败')
            }
        }
        return Promise.reject(error)
    }
)

export default service 