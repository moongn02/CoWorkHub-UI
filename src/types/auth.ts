// 登录数据接口
export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
}

export interface ResetPasswordData {
  emailOrPhone: string;
  newPassword: string;
  verificationCode: string;
}

// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  realName?: string
  email?: string
  phone?: string
}

// 登录响应接口
export interface LoginResponse {
  token: string
  user: UserInfo
} 