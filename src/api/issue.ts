import request from '@/utils/request'

// 创建问题
export function createIssue(data: any) {
    return request({
        url: '/api/issue/create',
        method: 'post',
        data
    })
}

// 修改问题
export function updateIssue(data: any) {
    return request({
        url: '/api/issue/update',
        method: 'put',
        data
    });
}

// 获取问题详情
export function getIssueDetail(id: string) {
    return request({
        url: `/api/issue/${id}`,
        method: 'get'
    })
}

// 获取问题关联的任务详情
export function getRelatedTask(id: string) {
    return request({
        url: `/api/issue/related_task/${id}`,
        method: 'get'
    });
}

// 更新问题状态
export function updateIssueStatus(id: string, data: any) {
    return request({
        url: `/api/issue/update_status/${id}`,
        method: 'put',
        data
    });
}

// 转派问题
export function transferIssue(id: string, data: any) {
    return request({
        url: `/api/issue/transfer/${id}`,
        method: 'put',
        data
    });
}

// 修改关联任务
export function relateTask(id: string, data: any) {
    return request({
        url: `/api/issue/relate_task/${id}`,
        method: 'put',
        data
    });
}

// 修改期望完成时间
export function updateIssueExpectedTime(id: string, data: any) {
    return request({
        url: `/api/issue/expected_time/${id}`,
        method: 'put',
        data
    });
}

// 添加问题备注
export function addIssueComment(id: string, data: any) {
    return request({
        url: `/api/issue/comment/${id}`,
        method: 'post',
        data
    });
}

// 获取问题备注列表
export function getIssueComments(id: string) {
    return request({
        url: `/api/issue/comments/${id}`,
        method: 'get'
    });
}

// 分页获取问题备注
export function pageIssueComments(id: string, params: any) {
    return request({
        url: `/api/issue/comments/page/${id}`,
        method: 'get',
        params
    });
}

// 分页获取问题列表
export function getIssueList(params: any) {
    return request({
        url: '/api/issue/page_list',
        method: 'get',
        params
    })
}