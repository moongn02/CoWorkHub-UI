import request from '@/utils/request'

// 获取项目列表（分页）
export function getPagingProjectList(current: number, size: number, query: any = {}) {
    return request({
        url: '/api/project/page_list',
        method: 'get',
        params: {
            current,
            size,
            ...query
        }
    })
}

// 获取项目详情
export function getProjectDetail(id: number) {
    return request({
        url: `/api/project/${id}`,
        method: 'get'
    })
}

// 添加项目
export function addProject(data: any) {
    return request({
        url: '/api/project/add',
        method: 'post',
        data
    })
}

// 更新项目
export function updateProject(id: number, data: any) {
    return request({
        url: `/api/project/update/${id}`,
        method: 'put',
        data
    })
}

// 更新项目状态
export function updateProjectStatus(id: number, status: number) {
    return request({
        url: `/api/project/update_status/${id}?status=${status}`,
        method: 'put',
    })
}

// 获取所有一级项目（parent_id = 0）
export function getParentProjects() {
    return request({
        url: '/api/project/parents',
        method: 'get'
    })
}


