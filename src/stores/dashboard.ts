import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDashboardStats, getUnfinishedTasksCount, getUnresolvedIssuesCount, getTodayWorkHours, getWeekWorkload } from '@/api/dashboard'
import {ElMessage} from "element-plus";

export const useDashboardStore = defineStore('dashboard', () => {
    const loading = ref(false)
    const dashboardStats = ref({
        unfinishedTasks: 0,
        unresolvedIssues: 0,
        todayHours: 0.0,
        hasTodayLog: false
    })

    // 获取仪表盘统计数据
    const getDashboardStatsAction = async () => {
        loading.value = true
        try {
            const res = await getDashboardStats()
            const { success, data, message } = res.data;
            if (success) {
                dashboardStats.value = data
                return data;
            } else {
                ElMessage.error(message || '获取仪表盘统计数据失败');
                return [];
            }
        } catch (error) {
            throw error
        } finally {
            loading.value = false
        }
    }

    // 获取未完成任务数量
    const getUnfinishedTasksCountAction = async () => {
        try {
            const response = await getUnfinishedTasksCount()
            return response.data
        } catch (error) {
            console.error('获取未完成任务数量失败:', error)
            return 0
        }
    }

    // 获取未解决问题数量
    const getUnresolvedIssuesCountAction = async () => {
        try {
            const response = await getUnresolvedIssuesCount()
            return response.data
        } catch (error) {
            console.error('获取未解决问题数量失败:', error)
            return 0
        }
    }

    // 获取今日工时
    const getTodayWorkHoursAction = async () => {
        try {
            const response = await getTodayWorkHours()
            return response.data
        } catch (error) {
            console.error('获取今日工时失败:', error)
            return 0
        }
    }

    // 获取本周工作量
    const getWeekWorkloadAction = async () => {
        try {
            const response = await getWeekWorkload()
            return response.data
        } catch (error) {
            console.error('获取本周工作量失败:', error)
            return 0
        }
    }

    return {
        dashboardStats,
        loading,
        getDashboardStatsAction,
        getUnfinishedTasksCountAction,
        getUnresolvedIssuesCountAction,
        getTodayWorkHoursAction,
        getWeekWorkloadAction
    }
})