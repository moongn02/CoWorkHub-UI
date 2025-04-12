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