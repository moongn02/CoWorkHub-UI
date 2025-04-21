import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
    getWorkMemoList,
    getWorkMemoDetail,
    createWorkMemo,
    updateWorkMemo,
    deleteWorkMemo
} from '@/api/workMemo'
import type { WorkMemoData } from '@/types/workMemo'

export const useWorkMemoStore = defineStore('workMemo', () => {
    const memoList = ref<WorkMemoData[]>([])
    const loading = ref(false)

    // 获取备忘录列表
    const getWorkMemoListAction = async () => {
        loading.value = true
        try {
            const res = await getWorkMemoList()
            const { success, data } = res.data
            if (success) {
                memoList.value = data
                return data
            } else {
                ElMessage.error(res.data.message)
                return []
            }
        } catch (error) {
            ElMessage.error('获取备忘录列表失败')
            return []
        } finally {
            loading.value = false
        }
    }

    // 获取备忘录详情
    const getWorkMemoDetailAction = async (id: number) => {
        try {
            const res = await getWorkMemoDetail(id)
            const { success, data } = res.data
            if (success) {
                return data
            } else {
                ElMessage.error(res.data.message)
                return null
            }
        } catch (error) {
            ElMessage.error('获取备忘录详情失败')
            return null
        }
    }

    // 创建备忘录
    const createWorkMemoAction = async (memoData: WorkMemoData) => {
        try {
            const res = await createWorkMemo(memoData)
            const { success } = res.data
            if (success) {
                ElMessage.success('备忘录创建成功')
                await getWorkMemoListAction() // 刷新列表
                return true
            } else {
                ElMessage.error(res.data.message)
                return false
            }
        } catch (error) {
            ElMessage.error('创建备忘录失败')
            return false
        }
    }

    // 更新备忘录
    const updateWorkMemoAction = async (memoData: WorkMemoData) => {
        try {
            const res = await updateWorkMemo(memoData)
            const { success } = res.data
            if (success) {
                ElMessage.success('备忘录更新成功')
                await getWorkMemoListAction() // 刷新列表
                return true
            } else {
                ElMessage.error(res.data.message)
                return false
            }
        } catch (error) {
            console.error('更新备忘录失败:', error)
            ElMessage.error('更新备忘录失败')
            return false
        }
    }

    // 删除备忘录
    const deleteWorkMemoAction = async (id: number) => {
        try {
            const res = await deleteWorkMemo(id)
            const { success } = res.data
            if (success) {
                ElMessage.success('备忘录删除成功')
                await getWorkMemoListAction() // 刷新列表
                return true
            } else {
                ElMessage.error(res.data.message)
                return false
            }
        } catch (error) {
            console.error('删除备忘录失败:', error)
            ElMessage.error('删除备忘录失败')
            return false
        }
    }

    return {
        memoList,
        loading,
        getWorkMemoListAction,
        getWorkMemoDetailAction,
        createWorkMemoAction,
        updateWorkMemoAction,
        deleteWorkMemoAction
    }
})