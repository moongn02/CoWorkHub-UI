import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    getDepartmentList,
    getDepartmentDetail,
    addDepartment,
    updateDepartment,
    updateDepartmentStatus,
    getParentDepartments
} from '@/api/department'
import { ElMessage } from 'element-plus'

export const useDeptStore = defineStore('department', () => {
    // 状态
    const departmentList = ref<any[]>([])
    const pagination = ref({
        total: 0,
        current: 1,
        size: 10
    })
    const loading = ref(false)

    // 获取分页部门列表
    const getPagingDepartmentListAction = async (page: number, size: number, query: any = {}) => {
        loading.value = true
        const res = await getDepartmentList(page, size, query)
        loading.value = false

        const { success, data } = res.data
        if (success) {
            departmentList.value = data.records
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

    // 获取部门详情
    const getDepartmentDetailAction = async (id: number) => {
        const res = await getDepartmentDetail(id)

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return null
        }
    }

    // 添加部门
    const addDepartmentAction = async (departmentData: any) => {
        const res = await addDepartment(departmentData)

        const { success } = res.data
        if (success) {
            ElMessage.success('部门添加成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 更新部门
    const updateDepartmentAction = async (id: number, departmentData: any) => {
        const res = await updateDepartment(id, departmentData)

        const { success } = res.data
        if (success) {
            ElMessage.success('部门更新成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 更新部门状态
    const updateDepartmentStatusAction = async (id: number, status: number) => {
        const res = await updateDepartmentStatus(id, status)

        const { success } = res.data
        if (success) {
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 获取所有一级部门（parent_id = 0）
    const getParentDepartmentsAction = async () => {
        const res = await getParentDepartments()

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return []
        }
    }

    return {
        departmentList,
        pagination,
        loading,
        getPagingDepartmentListAction,
        getDepartmentDetailAction,
        addDepartmentAction,
        updateDepartmentAction,
        updateDepartmentStatusAction,
        getParentDepartmentsAction
    }
})
