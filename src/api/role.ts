import request from '@/utils/request'

/**
 * 获取分页角色列表
 * @param current 当前页码
 * @param size 每页大小
 * @param query 查询条件
 */
export function getPagingRoleList(current: number, size: number, query: any = {}) {
    return request({
        url: '/api/role/page_list',
        method: 'get',
        params: {
            current,
            size,
            ...query
        }
    })
}

/**
 * 获取角色列表
 */
export function getAllRoles() {
    return request({
        url: '/api/role/list',
        method: 'get'
    })
}

/**
 * 获取角色详情
 * @param id 角色ID
 */
export function getRoleDetail(id: number) {
    return request({
        url: `/api/role/${id}`,
        method: 'get'
    })
}

/**
 * 添加角色
 * @param roleData 角色数据
 */
export function addRole(roleData: any) {
    return request({
        url: '/api/role/add',
        method: 'post',
        data: roleData
    })
}

/**
 * 更新角色
 * @param id 角色ID
 * @param roleData 角色数据
 */
export function updateRole(id: number, roleData: any) {
    return request({
        url: `/api/role/update/${id}`,
        method: 'put',
        data: roleData
    })
}

/**
 * 更新角色状态
 * @param id 角色ID
 * @param status 状态值
 */
export function updateRoleStatus(id: number, status: number) {
    return request({
        url: `/api/role/update_status/${id}?status=${status}`,
        method: 'put',
    })
}

/**
 * 删除角色
 * @param id 角色ID
 */
export function deleteRole(id: number) {
    return request({
        url: `/api/role/${id}`,
        method: 'delete'
    })
}

/**
 * 批量删除角色
 * @param ids 角色ID数组
 */
export function batchDeleteRoles(ids: number[]) {
    return request({
        url: '/api/role/batch',
        method: 'delete',
        data: { ids }
    })
}

/**
 * 获取角色的权限列表
 * @param roleId 角色ID
 */
export function getRolePermissions(roleId: number) {
    return request({
        url: `/api/role_permission/role/${roleId}`,
        method: 'get'
    })
}

/**
 * 更新角色权限
 * @param roleId 角色ID
 * @param permissionIds 权限ID数组
 */
export function updateRolePermissions(roleId: number, permissionIds: number[]) {
    return request({
        url: '/api/role/assign',
        method: 'post',
        params: { roleId },
        data: permissionIds
    })
}
