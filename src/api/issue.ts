import request from '@/utils/request'

// 创建问题
export function createIssue(data: any) {
    return request({
        url: '/api/issue/create',
        method: 'post',
        data
    })
}

// 获取问题详情
export function getIssueDetail(id: string) {
    return request({
        url: `/api/issue/${id}`,
        method: 'get'
    })
}

// 更新问题
export function updateIssue(data: any) {
    return request({
        url: '/api/issue/update',
        method: 'put',
        data
    })
}

// 分页获取问题列表
export function getIssueList(params: any) {
    return request({
        url: '/api/issue/page_list',
        method: 'get',
        params
    })
}