import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    getDepartmentList,
    getDepartmentDetail,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    searchDepartments
} from '@/api/department'
import type { DepartmentData, DepartmentQuery } from '@/types/department'
import { ElMessage } from 'element-plus'

export const useDeptStore = defineStore('department', () => {
    // 状态
    const departmentList = ref<any[]>([])
    const currentDepartment = ref<any>(null)
    const pagination = ref({
        total: 0,
        currentPage: 1,
        pageSize: 10
    })
    const loading = ref<boolean>(false)
    const searchKeyword = ref<string>('')

    // 获取部门列表（带分页）
    const getDepartmentsAction = async (page = 1, pageSize = 10, query = {}) => {
        loading.value = true
        try {
            const params: DepartmentQuery = {
                page,
                pageSize,
                ...query
            }

            const res = await getDepartmentList(params)
            const { success, data, message } = res.data

            if (success) {
                departmentList.value = data.list || []
                pagination.value = {
                    total: data.total || 0,
                    currentPage: page,
                    pageSize: pageSize
                }
                return {
                    list: departmentList.value,
                    pagination: pagination.value
                }
            } else {
                ElMessage.error(message || '获取部门列表失败')
                return null
            }
        } catch (error) {
            console.error('获取部门列表出错:', error)
            ElMessage.error('获取部门列表失败')
            return null
        } finally {
            loading.value = false
        }
    }

    // 查询部门
    const searchDepartmentsAction = async (keyword: string) => {
        loading.value = true
        searchKeyword.value = keyword

        try {
            const res = await searchDepartments(keyword)
            const { success, data, message } = res.data

            if (success) {
                departmentList.value = data.list || []
                pagination.value = {
                    total: data.total || 0,
                    currentPage: 1,
                    pageSize: pagination.value.pageSize
                }
                return departmentList.value
            } else {
                ElMessage.error(message || '查询部门失败')
                return null
            }
        } catch (error) {
            console.error('查询部门出错:', error)
            ElMessage.error('查询部门失败')
            return null
        } finally {
            loading.value = false
        }
    }

    // 获取部门详情
    const getDepartmentDetailAction = async (id: string | number) => {
        loading.value = true
        try {
            const res = await getDepartmentDetail(id)
            const { success, data, message } = res.data

            if (success) {
                currentDepartment.value = data
                return data
            } else {
                ElMessage.error(message || '获取部门详情失败')
                return null
            }
        } catch (error) {
            console.error('获取部门详情出错:', error)
            ElMessage.error('获取部门详情失败')
            return null
        } finally {
            loading.value = false
        }
    }

    // 添加部门
    const addDepartmentAction = async (departmentData: DepartmentData) => {
        loading.value = true
        try {
            const res = await createDepartment(departmentData)
            const { success, message } = res.data

            if (success) {
                ElMessage.success('添加部门成功')
                // 刷新当前页面的数据
                await getDepartmentsAction(pagination.value.currentPage, pagination.value.pageSize)
                return true
            } else {
                ElMessage.error(message || '添加部门失败')
                return false
            }
        } catch (error) {
            console.error('添加部门出错:', error)
            ElMessage.error('添加部门失败')
            return false
        } finally {
            loading.value = false
        }
    }

    // 修改部门
    const updateDepartmentAction = async (id: string | number, departmentData: DepartmentData) => {
        loading.value = true
        try {
            const res = await updateDepartment(id, departmentData)
            const { success, message } = res.data

            if (success) {
                ElMessage.success('修改部门成功')
                // 刷新当前页面的数据
                await getDepartmentsAction(pagination.value.currentPage, pagination.value.pageSize)
                return true
            } else {
                ElMessage.error(message || '修改部门失败')
                return false
            }
        } catch (error) {
            console.error('修改部门出错:', error)
            ElMessage.error('修改部门失败')
            return false
        } finally {
            loading.value = false
        }
    }

    // 删除部门
    const deleteDepartmentAction = async (id: string | number) => {
        loading.value = true
        try {
            const res = await deleteDepartment(id)
            const { success, message } = res.data

            if (success) {
                ElMessage.success('删除部门成功')
                // 刷新当前页面的数据，如果当前页没有数据了则回到上一页
                const currentPage = departmentList.value.length === 1 && pagination.value.currentPage > 1
                    ? pagination.value.currentPage - 1
                    : pagination.value.currentPage

                await getDepartmentsAction(currentPage, pagination.value.pageSize)
                return true
            } else {
                ElMessage.error(message || '删除部门失败')
                return false
            }
        } catch (error) {
            console.error('删除部门出错:', error)
            ElMessage.error('删除部门失败')
            return false
        } finally {
            loading.value = false
        }
    }

    // 重置搜索和过滤条件
    const resetFilters = () => {
        searchKeyword.value = ''
    }

    // 重置当前部门
    const resetCurrentDepartment = () => {
        currentDepartment.value = null
    }

    return {
        departmentList,
        currentDepartment,
        pagination,
        loading,
        searchKeyword,
        getDepartmentsAction,
        searchDepartmentsAction,
        getDepartmentDetailAction,
        addDepartmentAction,
        updateDepartmentAction,
        deleteDepartmentAction,
        resetFilters,
        resetCurrentDepartment
    }
})
