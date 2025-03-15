// src/router/permission.ts
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const whiteList = ['/login', '/forgot-password', '/register'] // 白名单

router.beforeEach(async (to, from, next) => {
    const hasToken = getToken()

    // 对于白名单路由，直接放行
    if (whiteList.includes(to.path)) {
        next()
        return
    }

    if (hasToken) {
        if (to.path === '/login') {
            next({ path: '/' })
        } else {
            const userStore = useUserStore()
            if (!userStore.userInfo) {
                try {
                    await userStore.getUserInfoAction()
                    next()
                } catch (error) {
                    ElMessage.error('获取用户信息失败，请重新登录')
                    await userStore.logoutAction()
                    next(`/login?redirect=${to.path}`)
                }
            } else {
                next()
            }
        }
    } else {
        // 没有token且不在白名单中，重定向到登录页
        next(`/login?redirect=${to.path}`)
    }
})