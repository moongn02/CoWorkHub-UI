// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sendVerificationCode, resetPassword as resetPasswordApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
    const loading = ref(false)
    const countdown = ref(0)

    // 发送验证码
    const sendVerificationCodeAction = async (email: string) => {
        if (!email) {
            ElMessage.warning('请先输入邮箱')
            return false
        }

        // 验证邮箱格式
        if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email)) {
            ElMessage.warning('请输入有效的邮箱地址')
            return false
        }

        loading.value = true
        try {
            const res = await sendVerificationCode(email)
            if (res.data.success) {
                ElMessage.success('验证码已发送，请查收邮件')
                return true
            } else {
                ElMessage.error(res.data.message || '发送验证码失败')
                return false
            }
        } catch (error) {
            console.error('发送验证码失败:', error)
            ElMessage.error('发送验证码失败，请稍后重试')
            return false
        } finally {
            loading.value = false
        }
    }

    // 重置密码
    const resetPasswordAction = async (email: string, code: string, newPassword: string) => {
        loading.value = true
        try {
            const res = await resetPasswordApi(email, code, newPassword)
            if (res.data.success) {
                ElMessage.success('密码重置成功')
                return true
            } else {
                ElMessage.error(res.data.message || '密码重置失败')
                return false
            }
        } catch (error) {
            console.error('密码重置失败:', error)
            ElMessage.error('密码重置失败，请稍后重试')
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        countdown,
        sendVerificationCodeAction,
        resetPasswordAction
    }
})