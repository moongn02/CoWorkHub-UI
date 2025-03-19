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
        method: 'put',
        data
    })
}