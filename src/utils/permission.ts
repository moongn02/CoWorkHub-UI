import { useUserStore } from '@/stores/user'

/**
 * 检查用户是否有权限访问菜单项
 * @param permission 权限标识
 * @returns 是否有权限
 */
export function hasMenuPermission(permission: string): boolean {
    const userStore = useUserStore()
    return userStore.hasPermission(permission)
}

/**
 * 根据权限过滤菜单
 * @param menus 原始菜单列表
 * @returns 过滤后的菜单列表
 */
export function filterMenuByPermission(menus: any[]): any[] {
    if (!menus || !Array.isArray(menus)) return []

    const userStore = useUserStore()

    return menus.filter(menu => {
        // 检查菜单是否需要权限控制
        if (menu.permission && !userStore.hasPermission(menu.permission)) {
            return false
        }

        // 递归处理子菜单
        if (menu.children && menu.children.length) {
            const filteredChildren = filterMenuByPermission(menu.children)
            menu.children = filteredChildren

            // 如果菜单没有子项且不是叶子节点（没有组件），则隐藏
            if (filteredChildren.length === 0 && !menu.component) {
                return false
            }
        }

        return true
    })
}