import request from '@/utils/request'
import type { LoginData, RegisterData, ResetPasswordData} from '@/types/auth'

// 登录接口
export function login(data: LoginData) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data,
  });
}

// 注册
export function register(data: RegisterData) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  })
}

// 发送验证码
export function sendVerificationCode(email: string) {
  return request({
    url: '/api/password/send_code',
    method: 'post',
    data: { email }
  })
}

// 重置密码
export function resetPassword(email: string, code: string, newPassword: string) {
  return request({
    url: '/api/password/reset',
    method: 'post',
    data: { email, code, newPassword }
  })
}

// 退出登录接口
export function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}