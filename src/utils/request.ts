// src/utils/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import router from '@/router'
import {useUserStore} from "@/stores/user";

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
        if (error.response && error.response.status === 401) {
            // token 过期或无效，清除 token 并跳转到登录页
            const userStore = useUserStore()
            userStore.resetToken()
            router.push('/login')
        }
        return Promise.reject(error)
    }
)

export default service 