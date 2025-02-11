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
        component: 'views/dashboard/index',
        meta: {
            title: '我的视图',
            keepAlive: true
        }
    },
    {
        path: '/task',
        title: '创建任务',
        icon: 'Plus',
        component: 'views/task/create',
        meta: {
            title: '创建任务'
        }
    },
    {
        path: '/task/search',
        title: '搜索任务',
        icon: 'Search',
        component: 'views/task/search',
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
                component: 'views/issue/create',
                meta: {
                    title: '创建问题'
                }
            },
            {
                path: '/issue/search',
                title: '搜索问题',
                component: 'views/issue/search',
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
                path: '/operation/worktime',
                title: '查看个人工时',
                component: 'views/operation/worktime',
                meta: {
                    title: '查看个人工时'
                }
            },
            {
                path: '/operation/profile',
                title: '编辑个人信息',
                component: 'views/operation/profile',
                meta: {
                    title: '编辑个人信息'
                }
            }
        ]
    },
    {
        path: '/worklog',
        title: '工作日志',
        icon: 'Document',
        component: 'views/worklog/index',
        meta: {
            title: '工作日志'
        }
    },
    {
        path: '/team',
        title: '我的团队',
        icon: 'User',
        children: [
            {
                path: '/team/worktime',
                title: '查看团队工时',
                component: 'views/team/worktime',
                meta: {
                    title: '查看团队工时'
                }
            },
            {
                path: '/team/log',
                title: '查看团队日志',
                component: 'views/team/log',
                meta: {
                    title: '查看团队日志'
                }
            },
            {
                path: '/team/member',
                title: '成员管理',
                component: 'views/team/member',
                meta: {
                    title: '成员管理'
                }
            }
        ]
    },
    {
        path: '/settings',
        title: '配置中心',
        icon: 'Setting',
        children: [
            {
                path: '/settings/project',
                title: '项目管理',
                component: 'views/settings/project',
                meta: {
                    title: '项目管理'
                }
            },
            {
                path: '/settings/department',
                title: '部门管理',
                component: 'views/settings/department',
                meta: {
                    title: '部门管理'
                }
            },
            {
                path: '/settings/permission',
                title: '权限管理',
                component: 'views/settings/permission',
                meta: {
                    title: '权限管理'
                }
            },
            {
                path: '/settings/schedule',
                title: '定时管理',
                component: 'views/settings/schedule',
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
                component: 'views/other/cache',
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