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

// 获取任务详情
export function getTaskDetail(id: number) {
    return request({
        url: `/api/task/${id}`,
        method: 'get'
    })
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