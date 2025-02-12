import request from '@/utils/request'
import type { LoginData, ResetPasswordData} from '@/types/auth'

// 登录接口
export function login(data: LoginData) {
  return request({
    url: `${import.meta.env.VITE_API_URL}/api/auth/login`, // 使用环境变量
    method: 'post',
    data,
  });
}

// 发送验证码
export function sendVerificationCode(emailOrPhone: string) {
  return request({
    url: `${import.meta.env.VITE_API_URL}/api/auth/send-verification-code`,
    method: 'post',
    params: { emailOrPhone }, // 使用 params 传递参数
  });
}

// 重置密码
export function resetPassword(data: ResetPasswordData) {
  return request({
    url: `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
    method: 'post',
    data,
  });
}

// 退出登录接口
export function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

// 获取用户信息接口
export function getUserInfo() {
  return request({
    url: '/api/auth/info',
    method: 'get'
  })
}