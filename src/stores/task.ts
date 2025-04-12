// src/stores/task.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createTask, getTaskDetail } from '@/api/task'
import { ElMessage } from 'element-plus'

export const useTaskStore = defineStore('task', () => {
    // 状态
    const users = ref<any[]>([])
    const currentTask = ref(null)
    const loading = ref(false)

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
            console.error('创建任务失败:', error)
            ElMessage.error('创建任务失败')
            return null
        }
    }

    // 获取任务详情
    const getTaskDetailAction = async (id: number) => {
        loading.value = true
        try {
            const res = await getTaskDetail(id)
            const { success, data } = res.data
            loading.value = false

            if (success) {
                currentTask.value = data
                return data
            } else {
                ElMessage.error(res.data.message || '获取任务详情失败')
                return null
            }
        } catch (error) {
            loading.value = false
            console.error('获取任务详情失败:', error)
            ElMessage.error('获取任务详情失败')
            return null
        }
    }

    return {
        users,
        currentTask,
        loading,
        createTaskAction,
        getTaskDetailAction
    }
})