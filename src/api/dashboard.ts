import request from '@/utils/request'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats() {
    return request({
        url: '/api/dashboard/stats',
        method: 'get'
    })
}

/**
 * 获取未完成任务数量
 */
export function getUnfinishedTasksCount() {
    return request({
        url: '/api/dashboard/unfinished_tasks',
        method: 'get'
    })
}

/**
 * 获取未解决问题数量
 */
export function getUnresolvedIssuesCount() {
    return request({
        url: '/api/dashboard/unresolved_issues',
        method: 'get'
    })
}

/**
 * 获取今日工时
 */
export function getTodayWorkHours() {
    return request({
        url: '/api/dashboard/today_hours',
        method: 'get'
    })
}

/**
 * 获取本周工作量
 */
export function getWeekWorkload() {
    return request({
        url: '/api/dashboard/week_workload',
        method: 'get'
    })
}