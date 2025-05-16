import request from '@/utils/request'

// 获取用户信息
export const getUserInfo = () => {
    return request({
        url: `/api/user/info`,
        method: 'get',
    })
}

// 获取编辑弹窗展示的用户信息
export function getEditUserInfo() {
    return request({
        url: `api/user/edit`,
        method: 'get'
    });
}

// 更新用户信息
export const updateUserInfo = (data: any) => {
    return request({
        url: '/api/user/edit',
        method: 'post',
        data
    })
}

// 修改密码
export const changePassword = (data: any) => {
    return request({
        url: '/api/user/change-password',
        method: 'post',
        data
    })
}

// 获取所有用户
export function getUsers() {
    return request({
        url: `/api/user/list`,
        method: 'get',
    });
}

// 分页获取用户列表
export function getPagingUserList(current: number, size: number, query?: any) {
    return request({
        url: `/api/user/page_list`,
        method: 'get',
        params: {
            current,
            size,
            ...query
        }
    });
}

// 添加用户
export function addUser(data: any) {
    return request({
        url: `/api/user/add`,
        method: 'post',
        data
    });
}

// 更新用户
export function updateUser(id: number, data: any) {
    return request({
        url: `/api/user/update/${id}`,
        method: 'put',
        data
    });
}

// 删除用户
export function deleteUser(id: number) {
    return request({
        url: `/api/user/${id}`,
        method: 'delete'
    });
}

// 批量删除用户
export function batchDeleteUsers(ids: number[]) {
    return request({
        url: `/api/user/batch`,
        method: 'delete',
        data: { ids }
    });
}

// 重置用户密码
export function resetUserPassword(id: number) {
    return request({
        url: `/api/user/reset_password/${id}`,
        method: 'put'
    });
}

// 更新用户状态
export function updateUserStatus(id: number, status: number) {
    return request({
        url: `/api/user/update_status/${id}`,
        method: 'put',
        params: { status }
    });
}

// 更新用户角色
export function updateUserRole(userId: number, roleId: number) {
    return request({
        url: `/api/user/update_role/${userId}`,
        method: 'put',
        params: { roleId }
    });
}

/**
 * 刷新用户权限
 */
export function getUserPermissions() {
    return request({
        url: '/api/user/refresh_permissions',
        method: 'get'
    });
}
