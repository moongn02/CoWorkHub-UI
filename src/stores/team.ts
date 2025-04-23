import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getDepartmentPersonnel, pagePersonnelWorkLogs } from '@/api/team'
import { getWorkLogDetail } from '@/api/workLog'

export const useTeamStore = defineStore('team', () => {
    const loading = ref(false)

    // 获取部门人员树
    const getDepartmentPersonnelAction = async () => {
        loading.value = true
        try {
            const res = await getDepartmentPersonnel()
            const { success, data } = res.data
            if (success) {
                return data
            } else {
                ElMessage.error(res.data.message)
                return []
            }
        } catch (error) {
            ElMessage.error('获取部门人员树失败')
            return []
        } finally {
            loading.value = false
        }
    }

    // 获取人员工作日志
    const pagePersonnelWorkLogsAction = async (params: any) => {
        loading.value = true
        try {
            const res = await pagePersonnelWorkLogs(params)
            const { success, data } = res.data
            if (success) {
                return data
            } else {
                ElMessage.error(res.data.message)
                return { records: [], total: 0, current: 1, size: 10 }
            }
        } catch (error) {
            ElMessage.error('获取人员工作日志失败')
            return { records: [], total: 0, current: 1, size: 10 }
        } finally {
            loading.value = false
        }
    }

    // 获取工作日志详情
    const getWorkLogDetailAction = async (id: number) => {
        try {
            const res = await getWorkLogDetail(id)
            const { success, data } = res.data
            if (success) {
                return data
            } else {
                ElMessage.error(res.data.message)
                return null
            }
        } catch (error) {
            ElMessage.error('获取工作日志详情失败')
            return null
        }
    }

    return {
        loading,
        getDepartmentPersonnelAction,
        pagePersonnelWorkLogsAction,
        getWorkLogDetailAction
    }
})