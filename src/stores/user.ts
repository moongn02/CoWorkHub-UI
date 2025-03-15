import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout } from '@/api/auth'

import type { LoginData} from '@/types/auth'
import { setToken, removeToken, getToken } from '@/utils/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'
import {getUserInfo} from "@/api/user";

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<any>(null)

  // 登录
  const loginAction = async (loginData: LoginData) => {
    const res = await login(loginData)
    const success = res.data.success
    if (success) {
      const { token: newToken, user } = res.data.data
      token.value = newToken
      userInfo.value = user
      setToken(newToken)

      ElMessage.success('登录成功');
      await router.push({name: 'HomePage'});
    } else {
      ElMessage.error(res.data.message)
      // await router.push({name: 'HomePage'});
    }
  }

  // 登出
  const logoutAction = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      token.value = ''
      userInfo.value = null
      removeToken()
      await router.push('/login')
    }
  }

  // 获取用户信息
  const getUserInfoAction = async () => {
    console.log(userInfo)
    const res = await getUserInfo(userInfo.value.id)

    debugger
    const { success, data } = res.data
    if (success) {
      userInfo.value = data
      return userInfo.value
    } else {
      ElMessage.error('获取用户信息失败')
    }
  }

  return {
    token,
    userInfo,
    loginAction,
    logoutAction,
    getUserInfoAction
  }
})