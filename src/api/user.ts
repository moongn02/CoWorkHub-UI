import request from '@/utils/request'

// 获取用户信息
export const getUserInfo = () => {
    return request({
        url: `/api/user/info`,
        method: 'get',
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