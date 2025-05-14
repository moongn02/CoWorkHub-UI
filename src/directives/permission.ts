import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

// 创建权限指令
export const permission: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const userStore = useUserStore()

        // 获取指令的值
        const { value } = binding

        // 权限验证逻辑
        let hasAuth = false

        if (typeof value === 'string') {
            // 单个权限
            hasAuth = userStore.hasPermission(value)
        } else if (Array.isArray(value)) {
            // 权限数组，默认需要全部满足
            hasAuth = userStore.hasAllPermissions(value)
        } else if (value && typeof value === 'object') {
            // 对象形式，可以指定逻辑
            const { values, logic } = value
            if (logic === 'or') {
                hasAuth = userStore.hasAnyPermission(values)
            } else {
                hasAuth = userStore.hasAllPermissions(values)
            }
        }

        // 如果没有权限，则隐藏或移除元素
        if (!hasAuth) {
            el.parentNode && el.parentNode.removeChild(el) || (el.style.display = 'none')
        }
    }
}

// 注册指令到应用
export function setupPermission(app: App) {
    app.directive('permission', permission)
}

export default permission