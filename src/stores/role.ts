import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    getPagingRoleList,
    getRoleDetail,
    addRole,
    updateRole,
    updateRoleStatus,
    deleteRole,
    batchDeleteRoles,
    getRolePermissions,
    updateRolePermissions
} from '@/api/role'
import { ElMessage } from 'element-plus'

export const useRoleStore = defineStore('role', () => {
    // 状态
    const roleList = ref<any[]>([])
    const pagination = ref({
        total: 0,
        current: 1,
        size: 10
    })
    const loading = ref(false)

    // 获取分页角色列表
    const getPagingRoleListAction = async (current: number, size: number, query: any = {}) => {
        loading.value = true
        const res = await getPagingRoleList(current, size, query)
        loading.value = false

        const { success, data } = res.data
        if (success) {
            roleList.value = data.records
            pagination.value = {
                total: data.total,
                current: data.current,
                size: data.size
            }
            return data
        } else {
            ElMessage.error(res.data.message)
            return null
        }
    }

    // 获取角色详情
    const getRoleDetailAction = async (id: number) => {
        const res = await getRoleDetail(id)

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return null
        }
    }

    // 添加角色
    const addRoleAction = async (roleData: any) => {
        const res = await addRole(roleData)

        const { success } = res.data
        if (success) {
            ElMessage.success('添加成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 更新角色
    const updateRoleAction = async (id: number, roleData: any) => {
        const res = await updateRole(id, roleData)

        const { success } = res.data
        if (success) {
            ElMessage.success('更新成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 更新角色状态
    const updateRoleStatusAction = async (id: number, status: number) => {
        const res = await updateRoleStatus(id, status)

        const { success } = res.data
        if (success) {
            ElMessage.success('更新成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 删除角色
    const deleteRoleAction = async (id: number) => {
        const res = await deleteRole(id)

        const { success } = res.data
        if (success) {
            ElMessage.success('角色已删除')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 批量删除角色
    const batchDeleteRolesAction = async (ids: number[]) => {
        const res = await batchDeleteRoles(ids)

        const { success } = res.data
        if (success) {
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 获取角色权限
    const getRolePermissionsAction = async (roleId: number) => {
        const res = await getRolePermissions(roleId)

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return []
        }
    }

    // 更新角色权限
    const updateRolePermissionsAction = async (roleId: number, permissionIds: number[]) => {
        const res = await updateRolePermissions(roleId, permissionIds)

        const { success } = res.data
        if (success) {
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    return {
        roleList,
        pagination,
        loading,
        getPagingRoleListAction,
        getRoleDetailAction,
        addRoleAction,
        updateRoleAction,
        updateRoleStatusAction,
        deleteRoleAction,
        batchDeleteRolesAction,
        getRolePermissionsAction,
        updateRolePermissionsAction
    }
})
