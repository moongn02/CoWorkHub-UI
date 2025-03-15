import request from '@/utils/request'

// 获取用户信息
export const getUserInfo = (id: number) => {
    return request({
        url: `/api/user/info`,
        method: 'get',
        params: {id}
    })
}

// 更新用户信息
export const updateUserInfo = (data: any) => {
    return request({
        url: '/api/user/update',
        method: 'put',
        data
    })
}

// 修改密码
export const changePassword = (data: any) => {
    return request({
        url: '/api/user/change-password',
        method: 'put',
        data
    })
}