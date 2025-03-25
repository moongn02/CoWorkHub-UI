// @/api/department.ts
import request from '@/utils/request'

// 获取部门列表（分页）
export function getDepartmentList(page: number, size: number, query: any = {}) {
    return request({
        url: '/api/departments/page_list',
        method: 'get',
        params: {
            page,
            size,
            ...query
        }
    })
}

// 获取部门详情
export function getDepartmentDetail(id: number) {
    return request({
        url: `/api/departments/${id}`,
        method: 'get'
    })
}

// 添加部门
export function addDepartment(data: any) {
    return request({
        url: '/api/departments/add',
        method: 'post',
        data
    })
}

// 更新部门
export function updateDepartment(id: number, data: any) {
    return request({
        url: `/api/departments/update/${id}`,
        method: 'post',
        data
    })
}

// 更新部门状态
export function updateDepartmentStatus(id: number, status: number) {
    return request({
        url: `/api/departments/update_status/${id}`,
        method: 'post',
        data: { status }
    })
}

// 获取所有一级部门（parent_id = 0）
export function getParentDepartments() {
    return request({
        url: '/api/departments/parents',
        method: 'get'
    })
}
