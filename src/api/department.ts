import request from '@/utils/request'

// 获取部门列表（分页）
export function getPagingDepartmentList(current: number, size: number, query: any = {}) {
    return request({
        url: '/api/department/page_list',
        method: 'get',
        params: {
            current,
            size,
            ...query
        }
    })
}

// 获取部门详情
export function getDepartmentDetail(id: number) {
    return request({
        url: `/api/department/${id}`,
        method: 'get'
    })
}

// 添加部门
export function addDepartment(data: any) {
    return request({
        url: '/api/department/add',
        method: 'post',
        data
    })
}

// 更新部门
export function updateDepartment(id: number, data: any) {
    return request({
        url: `/api/department/update/${id}`,
        method: 'put',
        data
    })
}

// 更新部门状态
export function updateDepartmentStatus(id: number, status: number) {
    return request({
        url: `/api/department/update_status/${id}?status=${status}`,
        method: 'put',
    })
}

// 删除部门
export function deleteDepartment(id: number) {
    return request({
        url: `/api/department/${id}`,
        method: 'delete'
    })
}

// 批量删除部门
export function batchDeleteDepartments(ids: number[]) {
    return request({
        url: '/api/department/batch',
        method: 'delete',
        data: { ids }
    })
}

// 获取所有一级部门（parent_id = 0）
export function getParentDepartments() {
    return request({
        url: '/api/department/parents',
        method: 'get',
    })
}

// 获取部门树结构
export function getDepartmentTree() {
    return request({
        url: '/api/department/tree',
        method: 'get'
    });
}
