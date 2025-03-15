// src/router/permission.ts
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const whiteList = ['/login', '/forgot-password', '/register', '/404'] // 白名单

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const hasToken = getToken()

    if (hasToken) {
        if (to.path === '/login') {
            // 已登录，重定向到首页
            next({ path: '/' })
        } else {
            // 判断用户信息是否已获取
            const hasUserInfo = userStore.userInfo && userStore.userInfo.id

            if (hasUserInfo) {
                next()
            } else {
                try {
                    // 获取用户信息
                    await userStore.getUserInfoAction()
                    next()
                } catch (error) {
                    // token 失效，清除 token 并跳转到登录页
                    userStore.resetToken()
                    next(`/login?redirect=${to.path}`)
                }
            }
        }
    } else {
        // 未登录
        if (whiteList.includes(to.path)) {
            // 白名单路由直接放行
            next()
        } else {
            // 重定向到登录页
            next(`/login?redirect=${to.path}`)
        }
    }
})