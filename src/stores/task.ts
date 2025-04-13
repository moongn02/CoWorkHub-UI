// src/stores/task.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {createTask, getPagingTaskList, getTaskDetail} from '@/api/task'
import { ElMessage } from 'element-plus'

export const useTaskStore = defineStore('task', () => {
    // 状态
    const users = ref<any[]>([])
    const currentTask = ref(null)
    const loading = ref(false)
    const taskList = ref([])
    const pagination = ref({
        total: 0,
        current: 1,
        size: 10
    })

    // 创建任务
    const createTaskAction = async (taskData: any) => {
        loading.value = true
        try {
            const res = await createTask(taskData)
            const { success, data } = res.data
            loading.value = false

            if (success) {
                ElMessage.success('任务创建成功')
                return data
            } else {
                ElMessage.error(res.data.message || '创建任务失败')
                return null
            }
        } catch (error) {
            loading.value = false
            ElMessage.error('创建任务失败')
            return null
        }
    }

    // 获取任务详情
    const getTaskDetailAction = async (id: number) => {
        const res = await getTaskDetail(id)
        const { success, data } = res.data

        if (success) {
            currentTask.value = data
            return data
        } else {
            ElMessage.error(res.data.message || '获取任务详情失败')
            return null
        }
    }

    // 搜索任务
    // 获取分页任务列表
    const getPagingTaskListAction = async (query: any = {}) => {
        loading.value = true

        const res = await getPagingTaskList(query)
        const { success, data } = res.data
        if (success) {
            taskList.value = data.records
            pagination.value = {
                total: data.total,
                current: data.current,
                size: data.size
            }
            loading.value = false

            return data
        } else {
            ElMessage.error(res.data.message || '获取任务列表失败')
            loading.value = false

            return null
        }
    }

    return {
        taskList,
        users,
        currentTask,
        loading,
        createTaskAction,
        getTaskDetailAction,
        getPagingTaskListAction
    }
})