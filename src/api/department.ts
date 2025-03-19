// @/api/department.ts
import request from '@/utils/request'
import type { DepartmentData, DepartmentQuery } from '@/types/department'

// 获取部门列表
export function getDepartmentList() {
    return request({
        url: '/api/department/list',
        method: 'get',
    })
}

// 获取部门列表（分页）
export function getPagingDepartmentList(query: DepartmentQuery) {
    return request({
        url: '/api/department/paging_list',
        method: 'get',
        params: query
    })
}

// 查询部门
export function searchDepartments(keyword: string) {
    return request({
        url: '/api/department/search',
        method: 'get',
        params: { keyword }
    })
}

// 获取部门详情
export function getDepartmentDetail(id: string | number) {
    return request({
        url: `/api/department/${id}`,
        method: 'get'
    })
}

// 创建部门
export function createDepartment(data: DepartmentData) {
    return request({
        url: '/api/department/create',
        method: 'post',
        data
    })
}

// 更新部门
export function updateDepartment(id: string | number, data: DepartmentData) {
    return request({
        url: `/api/department/${id}`,
        method: 'put',
        data
    })
}

// 删除部门
export function deleteDepartment(id: string | number) {
    return request({
        url: `/api/department/${id}`,
        method: 'delete'
    })
}
