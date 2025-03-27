import request from '@/utils/request'

// 获取权限列表（分页）
export function getPagingPermissionList(current: number, size: number, query: any = {}) {
    return request({
        url: '/api/permission/page_list',
        method: 'get',
        params: {
            current,
            size,
            ...query
        }
    })
}

// 获取权限详情
export function getPermissionDetail(id: number) {
    return request({
        url: `/api/permission/${id}`,
        method: 'get'
    })
}

// 获取一级权限选项
export function getParentPermissions() {
    return request({
        url: '/api/permission/parents',
        method: 'get'
    })
}

// 添加权限
export function addPermission(data: any) {
    return request({
        url: '/api/permission/add',
        method: 'post',
        data
    })
}

// 更新权限
export function updatePermission(id: number, data: any) {
    return request({
        url: `/api/permission/update/${id}`,
        method: 'put',
        data
    })
}

// 更新权限状态
export function updatePermissionStatus(id: number, status: number) {
    return request({
        url: `/api/permission/update_status/${id}?status=${status}`,
        method: 'patch',
    })
}
