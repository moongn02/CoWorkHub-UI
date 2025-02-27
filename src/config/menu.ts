// src/config/menu.ts
import {
    House,
    Plus,
    Search,
    Aim,
    Operation,
    Document,
    User,
    Setting,
    More,
} from '@element-plus/icons-vue'
import type { MenuItem } from '@/types/menu'

export const menuList: MenuItem[] = [
    {
        path: '/home',
        title: '我的视图',
        icon: 'House',
        component: 'home/index',
        meta: {
            title: '我的视图',
            keepAlive: true
        }
    },
    {
        path: '/task/create',
        title: '创建任务',
        icon: 'Plus',
        component: 'task/create',
        meta: {
            title: '创建任务'
        }
    },
    {
        path: '/task/search',
        title: '搜索任务',
        icon: 'Search',
        component: 'task/search',
        meta: {
            title: '搜索任务'
        }
    },
    {
        path: '/issue',
        title: '问题管理',
        icon: 'Aim',
        children: [
            {
                path: '/issue/create',
                title: '创建问题',
                component: 'issue/create',
                meta: {
                    title: '创建问题'
                }
            },
            {
                path: '/issue/search',
                title: '搜索问题',
                component: 'issue/search',
                meta: {
                    title: '搜索问题'
                }
            }
        ]
    },
    {
        path: '/operation',
        title: '我的操作',
        icon: 'Operation',
        children: [
            {
                path: '/operation/individual-center',
                title: '个人中心',
                component: 'my-operation/individual-center',
                meta: {
                    title: '个人中心'
                }
            },
            {
                path: '/operation/work-memo',
                title: '工作备忘',
                component: 'my-operation/work-memo',
                meta: {
                    title: '工作备忘'
                }
            },
            {
                path: '/operation/work-log',
                title: '工作日志',
                icon: 'Document',
                component: 'my-operation/work-log',
                meta: {
                    title: '工作日志'
                }
            },
        ]
    },
    {
        path: '/my-team',
        title: '我的团队',
        icon: 'User',
        component: 'my-team/index',
        meta: {
            title: '我的团队'
        }
    },
    {
        path: '/settings',
        title: '配置中心',
        icon: 'Setting',
        children: [
            {
                path: '/settings/user',
                title: '用户管理',
                component: 'settings/user',
                meta: {
                    title: '用户管理'
                }
            },
            {
                path: '/settings/role',
                title: '角色管理',
                component: 'settings/role',
                meta: {
                    title: '角色管理'
                }
            },
            {
                path: '/settings/permission',
                title: '权限管理',
                component: 'settings/permission',
                meta: {
                    title: '权限管理'
                }
            },
            {
                path: '/settings/project',
                title: '项目管理',
                component: 'settings/project',
                meta: {
                    title: '项目管理'
                }
            },
            {
                path: '/settings/department',
                title: '部门管理',
                component: 'settings/department',
                meta: {
                    title: '部门管理'
                }
            },
            {
                path: '/settings/schedule',
                title: '定时管理',
                component: 'settings/schedule',
                meta: {
                    title: '定时管理'
                }
            }
        ]
    },
    {
        path: '/other',
        title: '其他',
        icon: 'More',
        children: [
            {
                path: '/other/cache',
                title: '刷新缓存',
                component: 'other/cache',
                meta: {
                    title: '刷新缓存'
                }
            },
            {
                path: '/logout',
                title: '退出',
                meta: {
                    title: '退出'
                }
            }
        ]
    }
]

// 图标映射
export const iconMap = {
    House,
    Plus,
    Search,
    Aim,
    Operation,
    Document,
    User,
    Setting,
    More,
}