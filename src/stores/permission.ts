import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    getPagingPermissionList,
    getPermissionDetail,
    addPermission,
    updatePermission,
    updatePermissionStatus,
    getParentPermissions,
    deletePermission,
    batchDeletePermissions,
    getPermissionTree,
    getPermissionTreeByIds
} from '@/api/permission'
import { ElMessage } from 'element-plus'

export const usePermissionStore = defineStore('permission', () => {
    // 状态
    const permissionList = ref<any[]>([])
    const pagination = ref({
        total: 0,
        current: 1,
        size: 10
    })
    const loading = ref(false)

    // 获取分页权限列表
    const getPagingPermissionListAction = async (current: number, size: number, query: any = {}) => {
        loading.value = true
        const res = await getPagingPermissionList(current, size, query)
        loading.value = false

        const { success, data } = res.data
        if (success) {
            permissionList.value = data.records
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

    // 获取权限详情
    const getPermissionDetailAction = async (id: number) => {
        const res = await getPermissionDetail(id)

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return null
        }
    }

    // 添加权限
    const addPermissionAction = async (permissionData: any) => {
        const res = await addPermission(permissionData)

        const { success } = res.data
        if (success) {
            ElMessage.success('权限添加成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 更新权限
    const updatePermissionAction = async (id: number, permissionData: any) => {
        const res = await updatePermission(id, permissionData)

        const { success } = res.data
        if (success) {
            ElMessage.success('权限更新成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 更新权限状态
    const updatePermissionStatusAction = async (id: number, status: number) => {
        const res = await updatePermissionStatus(id, status)

        const { success } = res.data
        if (success) {
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 获取一级权限列表
    const getParentPermissionsAction = async () => {
        const res = await getParentPermissions()

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return []
        }
    }

    // 删除权限
    const deletePermissionAction = async (id: number) => {
        const res = await deletePermission(id)

        const { success } = res.data
        if (success) {
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 批量删除权限
    const batchDeletePermissionsAction = async (ids: number[]) => {
        const res = await batchDeletePermissions(ids)

        const { success } = res.data
        if (success) {
            ElMessage.success('批量删除成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 获取权限树
    const getPermissionTreeAction = async () => {
        const res = await getPermissionTree()

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return []
        }
    }

    // 根据ID列表获取权限树
    const getPermissionTreeByIdsAction = async (ids: number[]) => {
        const res = await getPermissionTreeByIds(ids)

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return []
        }
    }

    return {
        permissionList,
        pagination,
        loading,
        getPagingPermissionListAction,
        getPermissionDetailAction,
        addPermissionAction,
        updatePermissionAction,
        updatePermissionStatusAction,
        getParentPermissionsAction,
        deletePermissionAction,
        batchDeletePermissionsAction,
        getPermissionTreeAction,
        getPermissionTreeByIdsAction
    }
})
