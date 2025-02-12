// src/types/route.d.ts
declare interface MenuItem {
    path: string
    title: string
    icon?: string
    component?: string
    meta?: {
        title: string
        keepAlive?: boolean
        requiresAuth?: boolean
        [key: string]: any
    }
    children?: MenuItem[]
}