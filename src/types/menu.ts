// src/types/menu.ts
export interface MenuItem {
    path: string
    title: string
    icon?: string
    children?: MenuItem[]
    permission?: string
    component?: string
    meta?: {
        title: string
        keepAlive?: boolean
        hidden?: boolean
    }
}