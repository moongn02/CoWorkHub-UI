import request from '@/utils/request'
import type { WorkLogData } from '@/types/workLog'

// 获取工作日志列表
export function getWorkLogList(params: any) {
    return request({
        url: '/api/work_log/list',
        method: 'get',
        params
    })
}

// 获取工作日志详情
export function getWorkLogDetail(id: number) {
    return request({
        url: `/api/work_log/${id}`,
        method: 'get'
    })
}

// 创建工作日志
export function createWorkLog(data: WorkLogData) {
    return request({
        url: '/api/work_log/create',
        method: 'post',
        data
    })
}

// 更新工作日志
export function updateWorkLog(data: WorkLogData) {
    return request({
        url: '/api/work_log/update',
        method: 'put',
        data
    })
}

// 获取本月工作日志统计信息
export function getMonthlyStatistics() {
    return request({
        url: '/api/work_log/monthly_statistics',
        method: 'get'
    })
}