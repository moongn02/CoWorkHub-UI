import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    getPagingProjectList,
    getProjectDetail,
    addProject,
    updateProject,
    updateProjectStatus,
    getParentProjects
} from '@/api/project'
import { ElMessage } from 'element-plus'

export const useProjectStore = defineStore('project', () => {
    // 状态
    const projectList = ref<any[]>([])
    const pagination = ref({
        total: 0,
        current: 1,
        size: 10
    })
    const loading = ref(false)

    // 获取分页项目列表
    const getPagingProjectListAction = async (current: number, size: number, query: any = {}) => {
        loading.value = true
        const res = await getPagingProjectList(current, size, query)
        loading.value = false

        const { success, data } = res.data
        if (success) {
            projectList.value = data.records
            pagination.value = {
                total: data.total,
                current: data.current,
                size: data.size
            }
            return data
        } else {
            ElMessage.error(res.data.message)
            return null
        }
    }

    // 获取项目详情
    const getProjectDetailAction = async (id: number) => {
        const res = await getProjectDetail(id)

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return null
        }
    }

    // 添加项目
    const addProjectAction = async (projectData: any) => {
        const res = await addProject(projectData)

        const { success } = res.data
        if (success) {
            ElMessage.success('项目添加成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 更新项目
    const updateProjectAction = async (id: number, projectData: any) => {
        const res = await updateProject(id, projectData)

        const { success } = res.data
        if (success) {
            ElMessage.success('项目更新成功')
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 更新项目状态
    const updateProjectStatusAction = async (id: number, status: number) => {
        const res = await updateProjectStatus(id, status)

        const { success } = res.data
        if (success) {
            return true
        } else {
            ElMessage.error(res.data.message)
            return false
        }
    }

    // 获取所有一级项目（parent_id = 0的项目）
    const getParentProjectsAction = async () => {
        const res = await getParentProjects()

        const { success, data } = res.data
        if (success) {
            return data
        } else {
            ElMessage.error(res.data.message)
            return []
        }
    }

    return {
        projectList,
        pagination,
        loading,
        getPagingProjectListAction,
        getProjectDetailAction,
        addProjectAction,
        updateProjectAction,
        updateProjectStatusAction,
        getParentProjectsAction,
    }
})
