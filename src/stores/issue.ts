import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createIssue,
    getIssueDetail,
    getIssueList,
    updateIssueStatus,
    transferIssue,
    updateIssueExpectedTime,
    addIssueComment,
    getIssueComments
} from '@/api/issue'
import { ElMessage } from 'element-plus'

export const useIssueStore = defineStore('issue', () => {
    // 状态
    const issueList = ref([])
    const currentIssue = ref(null)
    const loading = ref(false)
    const issueComments = ref([]);
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

    // 更新问题状态
    const updateIssueStatusAction = async (id: string, status: number, comment: string, workHours: number = 0) => {
        loading.value = true;
        const res = await updateIssueStatus(id, {status, comment, workHours});
        loading.value = false;

        const { success, message } = res.data;
        if (success) {
            ElMessage.success('状态更新成功');
            return true;
        } else {
            ElMessage.error(message || '状态更新失败');
            return false;
        }
    };

    // 转派问题
    const transferIssueAction = async (id: string, handlerId: number, comment: string, workHours: number = 0) => {
        loading.value = true;
        const res = await transferIssue(id, {handlerId, comment, workHours});
        loading.value = false;

        const { success, message } = res.data;
        if (success) {
            ElMessage.success('转派问题成功');
            return true;
        } else {
            ElMessage.error(message || '转派问题失败');
            return false;
        }
    };

    // 修改期望完成时间
    const updateIssueExpectedTimeAction = async (id: string, expectedTime: string, comment: string, workHours: number = 0) => {
        loading.value = true;
        const res = await updateIssueExpectedTime(id, {expectedTime, comment, workHours});
        loading.value = false;

        const { success, message } = res.data;
        if (success) {
            ElMessage.success('期望完成时间更新成功');
            return true;
        } else {
            ElMessage.error(message || '期望完成时间更新失败');
            return false;
        }
    };

    // 添加问题备注
    const addIssueCommentAction = async (id: string, content: string, workHours: number = 0) => {
        loading.value = true;
        const res = await addIssueComment(id, {content, workHours});
        loading.value = false;

        const { success, data, message } = res.data;
        if (success) {
            ElMessage.success('添加备注成功');
            return data;
        } else {
            ElMessage.error(message || '添加备注失败');
            return null;
        }
    };

    // 获取问题备注列表
    const getIssueCommentsAction = async (id: string) => {
        loading.value = true;
        const res = await getIssueComments(id);
        loading.value = false;

        const { success, data, message } = res.data;
        if (success) {
            issueComments.value = data;
            return data;
        } else {
            ElMessage.error(message || '获取备注失败');
            return [];
        }
    };

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
        issueComments,
        currentIssue,
        loading,
        pagination,
        createIssueAction,
        getIssueDetailAction,
        getIssueListAction,
        updateIssueStatusAction,
        transferIssueAction,
        updateIssueExpectedTimeAction,
        addIssueCommentAction,
        getIssueCommentsAction
    }
})