import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import { menuList } from '@/config/menu'
import { getToken, removeToken } from '@/utils/auth'
import { jwtDecode } from 'jwt-decode'

// 动态导入组件
const modules = import.meta.glob('../views/**/*.vue')

// 基础路由
const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/index.vue'),
    meta: { requiresAuth: false }
  }
]

// 将菜单配置转换为路由配置
const generateRoutes = (menuList: MenuItem[]): RouteRecordRaw[] => {
  return menuList.map(item => {
    const route: RouteRecordRaw = {
      path: item.path,
      name: item.title,
      meta: {
        ...item.meta,
        requiresAuth: true
      }
    }

    // 处理组件路径
    if (item.component) {
      const componentPath = item.component.startsWith('views/')
          ? `../views/${item.component.slice(6)}.vue`
          : `../views/${item.component}.vue`
      route.component = modules[componentPath]
    }

    // 处理子路由
    if (item.children && item.children.length > 0) {
      route.children = generateRoutes(item.children)
      // 如果有子路由但没有组件，设置一个空的布局组件
      if (!route.component) {
        route.component = () => import('@/layouts/BlankLayout.vue')
      }
    }

    return route
  })
}

// 合并所有路由
const routes: RouteRecordRaw[] = [
  ...baseRoutes,
  ...generateRoutes(menuList),
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Token 验证
const validateToken = (token: string): boolean => {
  try {
    const decodedToken: any = jwtDecode(token)
    const currentTime = Date.now() / 1000
    return decodedToken.exp > currentTime
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

// 处理认证失败
const handleAuthFailure = (next: any) => {
  removeToken()
  next({
    name: 'login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = getToken()

  // 处理需要认证的路由
  if (to.meta.requiresAuth) {
    if (!token || !validateToken(token)) {
      handleAuthFailure(next)
      return
    }
    next()
    return
  }

  // 处理不需要认证的路由
  if (token && validateToken(token) && to.name === 'login') {
    next({ name: 'HomePage' })
    return
  }

  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
})

export default router 