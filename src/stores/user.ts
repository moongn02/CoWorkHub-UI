import { defineStore } from 'pinia'
import { ref } from 'vue'
import {login, logout, register} from '@/api/auth'
import type { LoginData} from '@/types/auth'
import { setToken, removeToken, getToken } from '@/utils/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'
import {changePassword, getEditUserInfo, getUserInfo, getUsers, updateUserInfo} from "@/api/user";

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
    }
  }

  // 注册
  const registerAction = async (registerData: LoginData) => {
    const res = await register(registerData)
    const success = res.data.success
    if (success) {
      ElMessage.success('注册成功，请登录');
      await router.push('/login');
    } else {
      ElMessage.error(res.data.message)
    }
  }

  // 登出
  const logoutAction = async () => {
    try {
      resetToken()
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
    const res = await getUserInfo()

    const { success, data } = res.data
    if (success) {
      userInfo.value = data
      return userInfo.value
    } else {
      ElMessage.error(res.data.message)
    }
  }

  // 获取编辑弹窗展示的用户信息
  const getEditUserInfoAction = async () => {
    const res = await getEditUserInfo()

    const { success, data } = res.data
    if (success) {
      userInfo.value = data
      return userInfo.value
    } else {
      ElMessage.error(res.data.message)
    }
  }

  // 更新个人信息
  const updateUserAction = async (updateData: any) => {
    const res = await updateUserInfo(updateData)

    const { success } = res.data
    if (success) {
      ElMessage.success('修改成功')
      return success
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  // 修改密码
  const changePasswordAction = async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const res = await changePassword(passwordData)

    const { success } = res.data
    if (success) {
      ElMessage.success('密码修改成功')
      return success
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  // 重置 token
  const resetToken = () => {
    token.value = ''
    userInfo.value = {}
    removeToken()
  }

  const getUsersAction = async () => {
    const res = await getUsers()

    const { success, data } = res.data
    if (success) {
      return data
    } else {
      ElMessage.error(res.data.message)
    }
  }

  return {
    token,
    userInfo,
    resetToken,
    loginAction,
    registerAction,
    logoutAction,
    getUserInfoAction,
    getEditUserInfoAction,
    updateUserAction,
    changePasswordAction,
    getUsersAction
  }
})