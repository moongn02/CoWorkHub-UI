// src/stores/task.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {createTask,
    getPagingTaskList,
    getTaskDetail,
    updateTaskStatus,
    transferTask,
    updateExpectedTime,
    addTaskComment,
    getTaskComments} from '@/api/task'
import { ElMessage } from 'element-plus'

export const useTaskStore = defineStore('task', () => {
    // 状态
    const users = ref<any[]>([])
    const currentTask = ref(null)
    const loading = ref(false)
    const taskList = ref([])
    const taskComments = ref([]);
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

    // 更新任务状态
    const updateTaskStatusAction = async (id: string, status: number, comment: string, workHours: number = 0) => {
        loading.value = true;
        const res = await updateTaskStatus(id, { status, comment, workHours });
        loading.value = false;

        const { success, message } = res.data;
        if (success) {
            ElMessage.success('状态更新成功');
            return true;
        } else {
            ElMessage.error(message || '状态更新失败');
            return false;
        }
    };

// 转派任务
    const transferTaskAction = async (id: string, handlerId: number, comment: string, workHours: number = 0) => {
        loading.value = true;
        const res = await transferTask(id, { handlerId, comment, workHours });
        loading.value = false;

        const { success, message } = res.data;
        if (success) {
            ElMessage.success('转派任务成功');
            return true;
        } else {
            ElMessage.error(message || '转派任务失败');
            return false;
        }
    };

    // 修改期望完成时间
    const updateExpectedTimeAction = async (id: string, expectedTime: string, comment: string, workHours: number = 0) => {
        loading.value = true;
        const res = await updateExpectedTime(id, { expectedTime, comment, workHours });
        loading.value = false;

        const { success, message } = res.data;
        if (success) {
            ElMessage.success('期望完成时间更新成功');
            return true;
        } else {
            ElMessage.error(message || '期望完成时间更新失败');
            return false;
        }
    };

    // 添加任务备注
    const addTaskCommentAction = async (id: string, content: string, workHours: number = 0) => {
        loading.value = true;
        const res = await addTaskComment(id, { content, workHours });
        loading.value = false;

        const { success, data, message } = res.data;
        if (success) {
            ElMessage.success('添加备注成功');
            return data;
        } else {
            ElMessage.error(message || '添加备注失败');
            return null;
        }
    };

    // 获取任务备注列表
    const getTaskCommentsAction = async (id: string) => {
        loading.value = true;
        const res = await getTaskComments(id);
        loading.value = false;

        const { success, data, message } = res.data;
        if (success) {
            taskComments.value = data;
            return data;
        } else {
            ElMessage.error(message || '获取备注失败');
            return [];
        }
    };

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
        taskComments,
        createTaskAction,
        getTaskDetailAction,
        getPagingTaskListAction,
        updateTaskStatusAction,
        transferTaskAction,
        updateExpectedTimeAction,
        addTaskCommentAction,
        getTaskCommentsAction
    }
})