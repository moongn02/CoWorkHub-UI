import request from '@/utils/request'
import type { WorkMemoData } from '@/types/workMemo'

// 获取所有备忘录
export function getWorkMemoList() {
    return request({
        url: '/api/work_memo/list',
        method: 'get'
    })
}

// 获取备忘录详情
export function getWorkMemoDetail(id: number) {
    return request({
        url: `/api/work_memo/${id}`,
        method: 'get'
    })
}

// 创建备忘录
export function createWorkMemo(data: WorkMemoData) {
    return request({
        url: '/api/work_memo/create',
        method: 'post',
        data
    })
}

// 更新备忘录
export function updateWorkMemo(data: WorkMemoData) {
    return request({
        url: '/api/work_memo/update',
        method: 'put',
        data
    })
}

// 删除备忘录
export function deleteWorkMemo(id: number) {
    return request({
        url: `/api/work_memo/${id}`,
        method: 'delete'
    })
}