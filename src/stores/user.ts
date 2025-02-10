import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getUserInfo } from '@/api/auth'
import type { LoginData, UserInfo } from '@/types/auth'
import { setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref('')

  // 登录
  async function loginAction(loginData: LoginData) {
    try {
      const res = await login(loginData)
      const { token: newToken, user } = res.data
      token.value = newToken
      userInfo.value = user
      setToken(newToken)
      return res
    } catch (error) {
      throw error
    }
  }

  // 登出
  async function logoutAction() {
    try {
      await logout()
      token.value = ''
      userInfo.value = null
      removeToken()
    } catch (error) {
      throw error
    }
  }

  // 获取用户信息
  async function getUserInfoAction() {
    try {
      const res = await getUserInfo()
      userInfo.value = res.data
      return res
    } catch (error) {
      throw error
    }
  }

  return {
    userInfo,
    token,
    loginAction,
    logoutAction,
    getUserInfoAction
  }
}) 