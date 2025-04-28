import request from '@/utils/request'

// 获取作业列表（分页）
export function getPagingJobList(params: any) {
    return request({
        url: '/api/scheduled_job/page',
        method: 'get',
        params
    })
}

// 获取作业详情
export function getJobDetail(id: number) {
    return request({
        url: `/api/scheduled_job/${id}`,
        method: 'get'
    })
}

// 添加作业
export function addJob(data: any) {
    return request({
        url: '/api/scheduled_job',
        method: 'post',
        data
    })
}

// 更新作业
export function updateJob(id: number, data: any) {
    return request({
        url: `/api/scheduled_job/${id}`,
        method: 'put',
        data
    })
}

// 删除作业
export function deleteJob(id: number) {
    return request({
        url: `/api/scheduled_job/${id}`,
        method: 'delete'
    })
}

// 暂停作业
export function pauseJob(id: number) {
    return request({
        url: `/api/scheduled_job/pause/${id}`,
        method: 'put'
    })
}

// 恢复作业
export function resumeJob(id: number) {
    return request({
        url: `/api/scheduled_job/resume/${id}`,
        method: 'put'
    })
}

// 立即执行作业
export function triggerJob(id: number) {
    return request({
        url: `/api/scheduled_job/trigger/${id}`,
        method: 'put'
    })
}

// 批量删除作业
export function batchDeleteJobs(ids: number[]) {
    return request({
        url: '/api/scheduled_job/batch',
        method: 'delete',
        data: { ids }
    })
}

// 获取作业日志列表（分页）
export function getPagingJobLogs(params: any) {
    return request({
        url: '/api/scheduled_job_log/page',
        method: 'get',
        params
    })
}