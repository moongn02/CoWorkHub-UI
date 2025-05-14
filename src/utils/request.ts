import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import router from '@/router'
import { useUserStore } from "@/stores/user";

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
            // 处理401和403错误
            if ([401, 403].includes(error.response.status)) {
                // token 过期或无效，清除 token 并跳转到登录页
                const userStore = useUserStore()
                userStore.resetToken()
                ElMessage.error('登录已过期，请重新登录')
                router.push('/login')
            } else if (error.response.status === 500) {
                ElMessage.error('服务器错误，请稍后再试')
            } else {
                // 其他错误
                ElMessage.error(error.response.data?.message || '请求失败')
            }
        } else if (error.message.includes('timeout')) {
            ElMessage.error('请求超时，请检查网络')
        } else {
            ElMessage.error('网络错误，请检查您的网络连接')
        }
        return Promise.reject(error)
    }
)

export default service 