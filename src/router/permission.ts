// src/router/permission.ts
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const whiteList = ['/login', '/forgot-password', '/register', '/404', '/403'] // 白名单

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

            if (!hasUserInfo) {
                try {
                    // 获取用户信息
                    await userStore.getUserInfoAction()
                    // 此时可以确保用户权限数据已加载

                    // 判断页面是否有权限要求
                    if (to.meta.permission) {
                        if (userStore.hasPermission(to.meta.permission)) {
                            next()
                        } else {
                            ElMessage.error('您没有访问该页面的权限')
                            next({ path: '/403' })
                        }
                    } else {
                        next()
                    }
                } catch (error) {
                    userStore.resetToken()
                    next(`/login?redirect=${to.path}`)
                }
            } else {
                // 已有用户信息，判断页面权限
                if (to.meta.permission) {
                    if (userStore.hasPermission(to.meta.permission)) {
                        next()
                    } else {
                        ElMessage.error('您没有访问该页面的权限')
                        next({ path: '/403' })
                    }
                } else {
                    next()
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