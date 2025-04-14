import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createIssue, getIssueDetail, getIssueList, updateIssue } from '@/api/issue'
import { ElMessage } from 'element-plus'

export const useIssueStore = defineStore('issue', () => {
    // 状态
    const issueList = ref([])
    const currentIssue = ref(null)
    const loading = ref(false)
    const pagination = ref({
        total: 0,
        current: 1,
        size: 10
    })

    // 创建问题
    const createIssueAction = async (issue: any) => {
        loading.value = true
        try {
            const res = await createIssue(issue)
            loading.value = false

            const { success, data, message } = res.data
            if (success) {
                ElMessage.success('创建问题成功')
                return data
            } else {
                ElMessage.error(message || '创建问题失败')
                return null
            }
        } catch (error) {
            loading.value = false
            ElMessage.error('创建问题失败')
            return null
        }
    }

    // 获取问题详情
    const getIssueDetailAction = async (id: string) => {
        loading.value = true
        try {
            const res = await getIssueDetail(id)
            loading.value = false

            const { success, data, message } = res.data
            if (success) {
                currentIssue.value = data
                return data
            } else {
                ElMessage.error(message || '获取问题详情失败')
                return null
            }
        } catch (error) {
            loading.value = false
            ElMessage.error('获取问题详情失败')
            return null
        }
    }

    // 更新问题
    const updateIssueAction = async (issue: any) => {
        loading.value = true
        try {
            const res = await updateIssue(issue)
            loading.value = false

            const { success, message } = res.data
            if (success) {
                ElMessage.success('更新问题成功')
                return true
            } else {
                ElMessage.error(message || '更新问题失败')
                return false
            }
        } catch (error) {
            loading.value = false
            ElMessage.error('更新问题失败')
            return false
        }
    }

    // 获取问题列表（分页）
    const getIssueListAction = async (params: any) => {
        const res = await getIssueList(params)

        const { success, data, message } = res.data
        if (success) {
            issueList.value = data.records
            pagination.value = {
                total: data.total,
                current: data.current,
                size: data.size
            }
            return data
        } else {
            ElMessage.error(message || '获取问题列表失败')
            return null
        }
    }

    return {
        issueList,
        currentIssue,
        loading,
        pagination,
        createIssueAction,
        getIssueDetailAction,
        updateIssueAction,
        getIssueListAction
    }
})