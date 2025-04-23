// src/api/task.ts
import request from '@/utils/request'

// 创建任务
export function createTask(data: any) {
    return request({
        url: '/api/task/create',
        method: 'post',
        data
    })
}

// 修改任务
export function updateTask(data: any) {
    return request({
        url: '/api/task/update',
        method: 'put',
        data
    })
}

// 获取任务详情
export function getTaskDetail(id: number) {
    return request({
        url: `/api/task/${id}`,
        method: 'get'
    })
}

// 更新任务状态
export function updateTaskStatus(id: string, data: any) {
    return request({
        url: `/api/task/update_status/${id}`,
        method: 'put',
        data
    });
}

// 拆分任务
export const splitTask = (id: string, data: any) => {
    return request({
        url: `/api/task/split/${id}`,
        method: 'post',
        data
    })
}

// 转派任务
export function transferTask(id: string, data: any) {
    return request({
        url: `/api/task/transfer/${id}`,
        method: 'put',
        data
    });
}

// 修改期望完成时间
export function updateExpectedTime(id: string, data: any) {
    return request({
        url: `/api/task/expected_time/${id}`,
        method: 'put',
        data
    });
}

// 添加任务备注
export function addTaskComment(id: string, data: any) {
    return request({
        url: `/api/task/comment/${id}`,
        method: 'post',
        data
    });
}

// 获取任务备注列表
export function getTaskComments(id: string) {
    return request({
        url: `/api/task/comments/${id}`,
        method: 'get'
    });
}

// 获取任务进度
export const getTaskActivities = (taskId: string) => {
    return request({
        url: `/api/task/activities/${taskId}`,
        method: 'get'
    })
}

// 获取父任务
export const getParentTask = (taskId: string) => {
    return request({
        url: `/api/task/parent_task/${taskId}`,
        method: 'get'
    })
}

// 获取子任务
export const getSubTasks = (taskId: string) => {
    return request({
        url: `/api/task/sub_tasks/${taskId}`,
        method: 'get'
    })
}

// 获取当前用户的任务列表
export const getCurrentUserTasks = () => {
    return request({
        url: `/api/task/current_user`,
        method: 'get'
    })
}

// 获取未完成任务数量
export const getUnfinishedTasksCount = () => {
    return request({
        url: `/api/task/unfinished_count`,
        method: 'get'
    })
}

// 获取关联问题
export const getRelatedIssues = (id: string) => {
    return request({
        url: `/api/task/related_issues/${id}`,
        method: 'get'
    });
};

// 分页获取任务备注
export function pageTaskComments(id: string, params: any) {
    return request({
        url: `/api/task/comments/page/${id}`,
        method: 'get',
        params
    });
}

// 获取任务列表（分页）
export function getPagingTaskList(query: any = {}) {
    return request({
        url: '/api/task/page_list',
        method: 'get',
        params: {
            ...query
        }
    })
}