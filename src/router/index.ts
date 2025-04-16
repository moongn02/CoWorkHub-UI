import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import { menuList } from '@/config/menu'

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
  },
  {
    path: '/home',
    name: 'HomePage',
    component: () => import('@/views/home/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/task/:id',
    name: 'TaskDetail',
    component: () => import('@/views/task/index.vue'),
    meta: {
      requiresAuth: true,
      title: '任务详情'
    }
  },
  {
    path: '/issue/:id',
    name: 'IssueDetail',
    component: () => import('@/views/issue/index.vue'),
    meta: {
      requiresAuth: true,
      title: '问题详情'
    }
  },
  {
    path: '/task/edit/:id',
    name: 'TaskEdit',
    component: () => import('@/views/task/edit.vue'),
    meta: { requiresAuth: true, title: '修改任务' }
  },
  {
    path: '/task/split/:id',
    name: 'TaskSplit',
    component: () => import('@/views/task/split.vue'),
    meta: {
      requiresAuth: true,
      title: '拆分子任务' }
  },
  {
    path: '/issue/edit/:id',
    name: 'IssueEdit',
    component: () => import('@/views/issue/edit.vue'),
    meta: {
      requiresAuth: true,
      title: '修改问题' }
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

export default router 