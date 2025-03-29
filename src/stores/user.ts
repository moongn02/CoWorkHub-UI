import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, register } from '@/api/auth'
import type { LoginData } from '@/types/auth'
import { setToken, removeToken, getToken } from '@/utils/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'
import {
  changePassword,
  getEditUserInfo,
  getUserInfo,
  getUsers,
  getPagingUserList,
  addUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  resetUserPassword,
  updateUserStatus,
  updateUserRole, updateUserInfo
} from "@/api/user";

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<any>(null)

  // 用户管理相关状态
  const userList = ref<any[]>([])
  const pagination = ref({
    total: 0,
    current: 1,
    size: 10
  })
  const loading = ref(false)

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
      await logout()
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
  const updateUserInfoAction = async (updateData: any) => {
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

  // 用户管理相关 Actions

  // 分页获取用户列表
  const getPagingUserListAction = async (current: number, size: number, query?: any) => {
    loading.value = true
    const res = await getPagingUserList(current, size, query)
    loading.value = false

    const { success, data } = res.data
    if (success) {
      userList.value = data.records
      pagination.value = {
        total: data.total,
        current: data.current,
        size: data.size
      }
      return data
    } else {
      ElMessage.error(res.data.message)
    }
  }

  // 添加用户
  const addUserAction = async (userData: any) => {
    const res = await addUser(userData)
    const { success } = res.data
    if (success) {
      ElMessage.success('添加成功')
      return true
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  // 更新用户
  const updateUserAction = async (id: number, userData: any) => {
    const res = await updateUser(id, userData)
    const { success } = res.data
    if (success) {
      ElMessage.success('更新成功')
      return true
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  // 删除用户
  const deleteUserAction = async (id: number) => {
    const res = await deleteUser(id)
    const { success } = res.data
    if (success) {
      ElMessage.success('删除成功')
      return true
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  // 批量删除用户
  const batchDeleteUsersAction = async (ids: number[]) => {
    const res = await batchDeleteUsers(ids)
    const { success } = res.data
    if (success) {
      ElMessage.success('批量删除成功')
      return true
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  // 重置用户密码
  const resetUserPasswordAction = async (id: number) => {
    const res = await resetUserPassword(id)
    const { success } = res.data
    if (success) {
      ElMessage.success('重置密码成功')
      return true
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  // 更新用户状态
  const updateUserStatusAction = async (id: number, status: number) => {
    const res = await updateUserStatus(id, status)
    const { success } = res.data
    if (success) {
      ElMessage.success('更新成功')
      return true
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  // 更新用户角色
  const updateUserRoleAction = async (userId: number, roleId: number) => {
    const res = await updateUserRole(userId, roleId)
    const { success } = res.data
    if (success) {
      ElMessage.success('更新成功')
      return true
    } else {
      ElMessage.error(res.data.message)
      return false
    }
  }

  return {
    token,
    userInfo,
    userList,
    pagination,
    loading,
    resetToken,
    loginAction,
    registerAction,
    logoutAction,
    getUserInfoAction,
    getEditUserInfoAction,
    updateUserInfoAction,
    changePasswordAction,
    getUsersAction,
    // 用户管理相关
    getPagingUserListAction,
    addUserAction,
    updateUserAction,
    deleteUserAction,
    batchDeleteUsersAction,
    resetUserPasswordAction,
    updateUserStatusAction,
    updateUserRoleAction
  }
})