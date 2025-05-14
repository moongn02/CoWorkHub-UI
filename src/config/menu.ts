import {
    House,
    Odometer,
    Aim,
    Operation,
    Document,
    User,
    Setting,
    SwitchButton
} from '@element-plus/icons-vue'
import type { MenuItem } from '@/types/menu'

export const menuList: MenuItem[] = [
    {
        path: '/home',
        title: '我的视图',
        icon: 'House',
        component: 'home/index',
        permission: 'home:view',
        meta: {
            title: '我的视图',
            keepAlive: true
        }
    },
    {
        path: '/task',
        title: '任务管理',
        icon: 'Odometer',
        permission: 'task:access',
        children: [
            {
                path: '/task/create',
                title: '创建任务',
                component: 'task/create',
                permission: 'task:create',
                meta: {
                    title: '创建任务'
                }
            },
            {
                path: '/task/search',
                title: '搜索任务',
                component: 'task/search',
                permission: 'task:search',
                meta: {
                    title: '搜索任务'
                }
            }
        ]
    },
    {
        path: '/issue',
        title: '问题管理',
        icon: 'Aim',
        permission: 'issue:access',
        children: [
            {
                path: '/issue/create',
                title: '创建问题',
                component: 'issue/create',
                permission: 'issue:create',
                meta: {
                    title: '创建问题'
                }
            },
            {
                path: '/issue/search',
                title: '搜索问题',
                component: 'issue/search',
                permission: 'issue:search',
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
        permission: 'operation:access',
        children: [
            {
                path: '/operation/individual-center',
                title: '个人中心',
                component: 'my-operation/individual-center',
                permission: 'individual:manage',
                meta: {
                    title: '个人中心'
                }
            },
            {
                path: '/operation/work-memo',
                title: '工作备忘',
                component: 'my-operation/work-memo',
                permission: 'memo:manage',
                meta: {
                    title: '工作备忘'
                }
            },
            {
                path: '/operation/work-log',
                title: '工作日志',
                icon: 'Document',
                component: 'my-operation/work-log',
                permission: 'log:manage',
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
        permission: 'team:access',
        meta: {
            title: '我的团队'
        }
    },
    {
        path: '/settings',
        title: '配置中心',
        icon: 'Setting',
        permission: 'settings:access',
        children: [
            {
                path: '/settings/user',
                title: '用户管理',
                component: 'settings/user',
                permission: 'user:manage',
                meta: {
                    title: '用户管理'
                }
            },
            {
                path: '/settings/role',
                title: '角色管理',
                component: 'settings/role',
                permission: 'role:manage',
                meta: {
                    title: '角色管理'
                }
            },
            {
                path: '/settings/permission',
                title: '权限管理',
                component: 'settings/permission',
                permission: 'permission:manage',
                meta: {
                    title: '权限管理'
                }
            },
            {
                path: '/settings/project',
                title: '项目管理',
                component: 'settings/project',
                permission: 'project:manage',
                meta: {
                    title: '项目管理'
                }
            },
            {
                path: '/settings/department',
                title: '部门管理',
                component: 'settings/department',
                permission: 'department:manage',
                meta: {
                    title: '部门管理'
                }
            },
            {
                path: '/settings/schedule',
                title: '定时管理',
                component: 'settings/schedule',
                permission: 'schedule:manage',
                meta: {
                    title: '定时管理'
                }
            }
        ]
    },
    {
        path: '/logout',
        title: '退出',
        icon: 'SwitchButton',
        permission: 'exit',
        meta: {
            title: '退出'
        }
    }
]

// 图标映射
export const iconMap = {
    House,
    Odometer,
    Aim,
    Operation,
    Document,
    User,
    Setting,
    SwitchButton,
}