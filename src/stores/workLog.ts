import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
    getWorkLogList,
    getWorkLogDetail,
    createWorkLog,
    updateWorkLog,
    getMonthlyStatistics,
    getTodayLog
} from '@/api/workLog'
import type { WorkLogData, WorkLogStatistics, WorkLogQuery } from '@/types/workLog'

export const useWorkLogStore = defineStore('workLog', () => {
    const logList = ref<WorkLogData[]>([])
    const statistics = ref<WorkLogStatistics>({
        submittedLogs: 0,
        requiredLogs: 0,
        percentage: 0
    })
    const loading = ref(false)
    const todayLog = ref(null)

    // 获取今日工作日志
    const getTodayLogAction = async () => {
        loading.value = true
        try {
            const res = await getTodayLog()
            const { success, data } = res.data
            if (success) {
                return data
            } else {
                ElMessage.error(res.data.message)
                return null
            }
        } catch (error) {
            console.error('获取今日工作日志失败:', error)
            return null
        } finally {
            loading.value = false
        }
    }

    // 获取工作日志列表
    const getWorkLogListAction = async (query: WorkLogQuery) => {
        loading.value = true
        try {
            // 转换查询参数
            const params: any = {}

            if (query.dateRange && query.dateRange.length === 2) {
                params.startDate = formatDate(query.dateRange[0])
                params.endDate = formatDate(query.dateRange[1])
            }

            if (query.year) {
                params.year = query.year.getFullYear()
            }

            if (query.month) {
                params.year = query.month.getFullYear()
                params.month = query.month.getMonth() + 1
            }

            if (query.logType) {
                params.type = query.logType
            }

            if (query.keyword) {
                params.keyword = query.keyword
            }

            const res = await getWorkLogList(params)
            const { success, data } = res.data
            if (success) {
                logList.value = data
                return data
            } else {
                ElMessage.error(res.data.message)
                return []
            }
        } catch (error) {
            ElMessage.error('获取工作日志列表失败')
            return []
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
            console.error('获取工作日志详情失败:', error)
            ElMessage.error('获取工作日志详情失败')
            return null
        }
    }

    // 创建工作日志
    const createWorkLogAction = async (logData: WorkLogData) => {
        try {
            const res = await createWorkLog(logData)
            const { success } = res.data
            if (success) {
                ElMessage.success('工作日志创建成功')
                return true
            } else {
                ElMessage.error(res.data.message)
                return false
            }
        } catch (error) {
            ElMessage.error('创建工作日志失败')
            return false
        }
    }

    // 更新工作日志
    const updateWorkLogAction = async (logData: WorkLogData) => {
        try {
            const res = await updateWorkLog(logData)
            const { success } = res.data
            if (success) {
                ElMessage.success('工作日志更新成功')
                return true
            } else {
                ElMessage.error(res.data.message)
                return false
            }
        } catch (error) {
            ElMessage.error('更新工作日志失败')
            return false
        }
    }

    // 获取本月工作日志统计信息
    const getMonthlyStatisticsAction = async () => {
        try {
            const res = await getMonthlyStatistics()
            const { success, data } = res.data
            if (success) {
                statistics.value = data
                return data
            } else {
                ElMessage.error(res.data.message)
                return null
            }
        } catch (error) {
            ElMessage.error('获取工作日志统计信息失败')
            return null
        }
    }

    // 辅助函数：格式化日期
    const formatDate = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    return {
        logList,
        statistics,
        loading,
        getTodayLogAction,
        getWorkLogListAction,
        getWorkLogDetailAction,
        createWorkLogAction,
        updateWorkLogAction,
        getMonthlyStatisticsAction
    }
})