import { useUserStore } from '@/stores/user'

export function usePermissionCheck() {
    const userStore = useUserStore()

    // 检查单个权限
    const hasPermission = (permission: string): boolean => {
        return userStore.hasPermission(permission)
    }

    // 检查是否有任一权限
    const hasAnyPermission = (permissions: string[]): boolean => {
        return userStore.hasAnyPermission(permissions)
    }

    // 检查是否有所有权限
    const hasAllPermissions = (permissions: string[]): boolean => {
        return userStore.hasAllPermissions(permissions)
    }

    // 权限检查并执行回调
    const checkAndExecute = (permission: string, callback: () => void): void => {
        if (hasPermission(permission)) {
            callback()
        }
    }

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        checkAndExecute
    }
}