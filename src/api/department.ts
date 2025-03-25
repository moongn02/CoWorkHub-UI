// @/api/department.ts
import request from '@/utils/request'

// 获取部门列表（分页）
export function getDepartmentList(current: number, size: number, query: any = {}) {
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

// 获取所有一级部门（parent_id = 0）
export function getParentDepartments() {
    return request({
        url: '/api/department/parents',
        method: 'get',
    })
}
