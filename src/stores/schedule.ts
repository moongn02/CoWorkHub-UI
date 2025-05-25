import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import {
    getPagingJobList,
    getJobDetail,
    addJob,
    updateJob,
    deleteJob,
    pauseJob,
    resumeJob,
    triggerJob,
    batchDeleteJobs,
    getPagingJobLogs,
    refreshNextRunTime
} from '@/api/schedule'
import { ElMessage } from 'element-plus'

export const useScheduleStore = defineStore('schedule', () => {
    // 状态
    const loading = ref(false)
    const logsLoading = ref(false)
    const jobList = ref([])
    const jobLogs = ref([])
    const pagination = reactive({
        total: 0,
        current: 1,
        size: 10
    })

    const logPagination = reactive({
        total: 0,
        current: 1,
        size: 10
    })

    // 获取作业列表（分页）
    const getPagingJobListAction = async (current: number, size: number, query: any = {}) => {
        loading.value = true
        try {
            const params = {
                current,
                size,
                ...query
            }

            const response = await getPagingJobList(params)
            const { success, data, message } = response.data

            if (success) {
                jobList.value = data.records
                pagination.total = data.total
                pagination.current = data.current
                pagination.size = data.size
                return data
            } else {
                ElMessage.error(message || '获取作业列表失败')
                return null
            }
        } catch (error) {
            ElMessage.error('获取作业列表失败')
            return null
        } finally {
            loading.value = false
        }
    }

    // 获取作业详情
    const getJobDetailAction = async (id: number) => {
        try {
            const response = await getJobDetail(id)
            const { success, data, message } = response.data

            if (success) {
                return data
            } else {
                ElMessage.error(message || '获取作业详情失败')
                return null
            }
        } catch (error) {
            ElMessage.error('获取作业详情失败')
            return null
        }
    }

    // 添加作业
    const addJobAction = async (jobData: any) => {
        try {
            const response = await addJob(jobData)
            const { success, message } = response.data

            if (success) {
                ElMessage.success('作业添加成功')
                return true
            } else {
                ElMessage.error(message || '添加作业失败')
                return false
            }
        } catch (error) {
            ElMessage.error('添加作业失败')
            return false
        }
    }

    // 更新作业
    const updateJobAction = async (id: number, jobData: any) => {
        try {
            const response = await updateJob(id, jobData)
            const { success, message } = response.data

            if (success) {
                ElMessage.success('作业更新成功')
                return true
            } else {
                ElMessage.error(message || '更新作业失败')
                return false
            }
        } catch (error) {
            ElMessage.error('更新作业失败')
            return false
        }
    }

    // 删除作业
    const deleteJobAction = async (id: number) => {
        try {
            const response = await deleteJob(id)
            const { success, message } = response.data

            if (success) {
                ElMessage.success('作业删除成功')
                return true
            } else {
                ElMessage.error(message || '删除作业失败')
                return false
            }
        } catch (error) {
            ElMessage.error('删除作业失败')
            return false
        }
    }

    // 暂停作业
    const pauseJobAction = async (id: number) => {
        try {
            const response = await pauseJob(id)
            const { success, message } = response.data

            if (success) {
                ElMessage.success('作业已暂停')
                return true
            } else {
                ElMessage.error(message || '暂停作业失败')
                return false
            }
        } catch (error) {
            ElMessage.error('暂停作业失败')
            return false
        }
    }

    // 启动作业
    const resumeJobAction = async (id: number) => {
        try {
            const response = await resumeJob(id)
            const { success, message } = response.data

            if (success) {
                ElMessage.success('作业已启动')
                return true
            } else {
                ElMessage.error(message || '启动作业失败')
                return false
            }
        } catch (error) {
            ElMessage.error('启动作业失败')
            return false
        }
    }

    // 立即执行作业
    const triggerJobAction = async (id: number) => {
        try {
            const response = await triggerJob(id)
            const { success, message } = response.data

            if (success) {
                ElMessage.success('作业已触发，正在执行中')
                return true
            } else {
                ElMessage.error(message || '触发作业失败')
                return false
            }
        } catch (error) {
            ElMessage.error('触发作业失败')
            return false
        }
    }

    // 批量删除作业
    const batchDeleteJobsAction = async (ids: number[]) => {
        try {
            const response = await batchDeleteJobs(ids)
            const { success, message } = response.data

            if (success) {
                ElMessage.success(`已成功删除 ${ids.length} 个作业`)
                return true
            } else {
                ElMessage.error(message || '批量删除作业失败')
                return false
            }
        } catch (error) {
            ElMessage.error('批量删除作业失败')
            console.error('批量删除作业失败', error)
            return false
        }
    }

    // 获取作业日志列表（分页）
    const getPagingJobLogsAction = async (current: number, size: number, query: any = {}) => {
        logsLoading.value = true
        try {
            const params = {
                current,
                size,
                ...query
            }

            const response = await getPagingJobLogs(params)
            const { success, data, message } = response.data

            if (success) {
                jobLogs.value = data.records
                logPagination.total = data.total
                logPagination.current = data.current
                logPagination.size = data.size
                return data
            } else {
                ElMessage.error(message || '获取作业日志失败')
                return null
            }
        } catch (error) {
            ElMessage.error('获取作业日志失败')
            console.error('获取作业日志失败', error)
            return null
        } finally {
            logsLoading.value = false
        }
    }

    // 刷新所有作业的下次执行时间
    const refreshNextRunTimeAction = async () => {
        loading.value = true
        try {
            const res = await refreshNextRunTime()
            if (res.data && res.data.success) {
                return true
            } else {
                ElMessage.error(res.data.message || '刷新定时作业下次执行时间失败')
                return false
            }
        } catch (e) {
            ElMessage.error('刷新定时作业下次执行时间失败')
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        logsLoading,
        jobList,
        jobLogs,
        pagination,
        logPagination,
        getPagingJobListAction,
        getJobDetailAction,
        addJobAction,
        updateJobAction,
        deleteJobAction,
        pauseJobAction,
        resumeJobAction,
        triggerJobAction,
        batchDeleteJobsAction,
        getPagingJobLogsAction,
        refreshNextRunTimeAction
    }
})