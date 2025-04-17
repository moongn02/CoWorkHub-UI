<template>
  <Layout>
    <template #content>
      <div class="edit-task-container">
        <el-card class="task-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">修改任务</h3>
            </div>
          </template>

          <el-form
              ref="taskFormRef"
              :model="taskForm"
              :rules="rules"
              label-width="120px"
              class="task-form"
              v-loading="loading"
          >
            <!-- 基本信息 -->
            <div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="目标部门" prop="departmentId" required>
                    <el-cascader
                        v-model="taskForm.departmentId"
                        :options="departmentTreeData"
                        placeholder="请选择所属部门"
                        clearable
                        filterable
                        :props="{
                          checkStrictly: true,
                          label: 'name',
                          value: 'id',
                          emitPath: false
                        }"
                        class="white-bg-input"
                        @change="handleDepartmentChange"
                    >
                      <template #default="{ node, data }">
                        <div>
                          {{ data.name }}
                        </div>
                      </template>
                    </el-cascader>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="项目" prop="projectId" required>
                    <el-cascader
                        v-model="taskForm.projectId"
                        :options="projectTreeData"
                        placeholder="请选择项目"
                        clearable
                        filterable
                        :props="{
                          checkStrictly: true,
                          label: 'name',
                          value: 'id',
                          emitPath: false
                        }"
                        class="white-bg-input"
                    >
                      <template #default="{ node, data }">
                        <div>
                          {{ data.name }}
                        </div>
                      </template>
                    </el-cascader>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="优先级" prop="priority" required>
                    <el-select v-model="taskForm.priority" placeholder="无">
                      <el-option label="低" value="3" />
                      <el-option label="中" value="2" />
                      <el-option label="高" value="1" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="执行人" prop="handlerId" required>
                    <el-select
                        v-model="taskForm.handlerId"
                        placeholder="请选择"
                        filterable
                        :default-first-option="true"
                    >
                      <el-option
                          v-for="user in users"
                          :key="user.id"
                          :label="user.realName"
                          :value="user.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="验收人" prop="acceptorId">
                    <el-select
                        v-model="taskForm.acceptorId"
                        placeholder="请选择"
                        filterable
                        :default-first-option="true"
                    >
                      <el-option
                          v-for="user in users"
                          :key="user.id"
                          :label="user.realName"
                          :value="user.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 任务信息 -->
            <div>
              <el-form-item label="任务标题" prop="title" required>
                <el-input v-model="taskForm.title" placeholder="请输入" class="white-bg-input" />
              </el-form-item>

              <el-form-item label="任务内容" prop="content" required>
                <div class="editor-container">
                  <QuillEditor v-model:content="taskForm.content" contentType="html" toolbar="full" theme="snow" />
                </div>
              </el-form-item>
            </div>

            <!-- 时间和可见性 -->
            <div class="form-section">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="实际开始时间" prop="actualStartTime">
                    <el-date-picker
                        v-model="taskForm.actualStartTime"
                        type="datetime"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="请选择"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="期望完成时间" prop="expectedTime" required>
                    <el-date-picker
                        v-model="taskForm.expectedTime"
                        type="datetime"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="请选择"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 按钮组 -->
            <div class="button-container">
              <el-button @click="goBack">取消</el-button>
              <el-button type="primary" @click="submitForm" :loading="submitting">保存修改</el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/components/Layout.vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useTaskStore } from '@/stores/task'
import { useDeptStore } from '@/stores/department'
import { useProjectStore } from '@/stores/project'
import { updateTask } from '@/api/task'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const deptStore = useDeptStore()
const userStore = useUserStore()
const projectStore = useProjectStore()
const taskFormRef = ref<FormInstance>()

// 获取任务ID
const taskId = ref(route.params.id)

// 获取当前用户
const currentUser = userStore.userInfo

// 加载状态
const loading = ref(true)
const submitting = ref(false)

// 表单数据
const taskForm = reactive({
  id: '',
  departmentId: '',
  projectId: '',
  priority: '2',
  handlerId: '',
  acceptorId: '',
  title: '',
  content: '',
  actualStartTime: '',
  expectedTime: '',
  status: ''
})

// 下拉选项数据
const departmentTreeData = ref([])
const projectTreeData = ref([])
const users = ref([])

// 获取部门树
const fetchDepartmentTree = async () => {
  departmentTreeData.value = await deptStore.getDepartmentTreeAction()
}

// 获取项目树
const fetchProjectTree = async () => {
  projectTreeData.value = await projectStore.getProjectTreeAction()
}

// 获取用户列表
const fetchUsers = async () => {
  users.value = await userStore.getUsersAction()
}

// 获取任务详情
const getTaskDetail = async () => {
  if (!taskId.value) {
    ElMessage.error('任务ID不能为空')
    router.push('/task/list')
    return
  }

  loading.value = true
  try {
    const taskData = await taskStore.getTaskDetailAction(taskId.value)
    if (taskData) {
      // 填充表单数据
      taskForm.id = taskData.id
      taskForm.departmentId = taskData.departmentId
      taskForm.projectId = taskData.projectId
      taskForm.priority = String(taskData.priority) // 转换为字符串以匹配select
      taskForm.handlerId = taskData.handlerId
      taskForm.acceptorId = taskData.acceptorId
      taskForm.title = taskData.title
      taskForm.content = taskData.content
      taskForm.status = taskData.status

      // 处理日期格式
      if (taskData.actualStartTime) {
        // 确保日期格式正确
        if (typeof taskData.actualStartTime === 'string' && taskData.actualStartTime.includes('T')) {
          taskForm.actualStartTime = taskData.actualStartTime.replace('T', ' ')
        } else {
          taskForm.actualStartTime = taskData.actualStartTime
        }
      }

      if (taskData.expectedTime) {
        // 确保日期格式正确
        if (typeof taskData.expectedTime === 'string' && taskData.expectedTime.includes('T')) {
          taskForm.expectedTime = taskData.expectedTime.replace('T', ' ')
        } else {
          taskForm.expectedTime = taskData.expectedTime
        }
      }
    } else {
      ElMessage.error('获取任务详情失败')
      router.push('/task/list')
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
    router.push('/task/list')
  } finally {
    loading.value = false
  }
}

// 处理部门选择变化
const handleDepartmentChange = async (departmentId) => {
  if (!departmentId) return

  // 获取部门详情，找到部门负责人
  const departmentDetail = await deptStore.getDepartmentDetailAction(departmentId)
  if (departmentDetail && departmentDetail.leaderId) {
    // 设置验收人为部门负责人
    taskForm.acceptorId = departmentDetail.leaderId
  }
}

// 组件挂载时加载选项数据和任务详情
onMounted(async () => {
  await Promise.all([
    fetchDepartmentTree(),
    fetchProjectTree(),
    fetchUsers(),
    getTaskDetail()
  ])
})

// 表单验证规则
const rules = reactive<FormRules>({
  departmentId: [
    { required: true, message: '请选择目标工作室', trigger: 'change' }
  ],
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  handlerId: [
    { required: true, message: '请选择执行人', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入任务内容', trigger: 'blur' }
  ],
  expectedTime: [
    { required: true, message: '请选择期望完成时间', trigger: 'change' }
  ]
})

// 提交表单
const submitForm = async () => {
  if (!taskFormRef.value) return

  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 转换数据格式
        const taskData = {
          ...taskForm,
          // 确保数字类型字段是数字而不是字符串
          priority: parseInt(taskForm.priority),
          handlerId: taskForm.handlerId ? parseInt(taskForm.handlerId) : null,
          acceptorId: taskForm.acceptorId ? parseInt(taskForm.acceptorId) : null,
          departmentId: parseInt(taskForm.departmentId),
          projectId: parseInt(taskForm.projectId),
        }

        if (taskData.expectedTime && taskData.expectedTime.includes('T')) {
          taskData.expectedTime = taskData.expectedTime.replace('T', ' ')
        }

        if (taskData.actualStartTime && taskData.actualStartTime.includes('T')) {
          taskData.actualStartTime = taskData.actualStartTime.replace('T', ' ')
        }

        // 调用API更新任务
        const response = await updateTask(taskData)
        const { success, message } = response.data

        if (success) {
          ElMessage.success('任务修改成功')
          // 修改成功，跳转到任务详情页
          router.push(`/task/${taskId.value}`)
        } else {
          ElMessage.error(message || '修改任务失败')
        }
      } catch (error) {
        console.error('修改任务失败:', error)
        ElMessage.error(`修改任务失败: ${error.message || '未知错误'}`)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 返回上一页
const goBack = () => {
  router.push(`/task/${taskId.value}`)
}
</script>

<style scoped>
.edit-task-container {
  padding: 20px;
}

.task-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: none;
  padding-bottom: 0;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  padding: 16px 0;
}

.task-form {
  padding: 20px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 20px;
}

:deep(.el-select),
:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

.white-bg-input :deep(.el-input__wrapper) {
  background-color: white;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.white-bg-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 100%;
}

.editor-container :deep(.ql-container) {
  height: 200px;
}

.editor-container :deep(.ql-editor) {
  min-height: 200px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .edit-task-container {
    padding: 10px;
  }

  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    padding: 0 0 8px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .task-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title {
    color: #e5e7eb;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    background-color: #363636;
    border-color: #4a4a4a;
    color: #e5e7eb;
  }

  .white-bg-input :deep(.el-input__wrapper) {
    background-color: white;
    box-shadow: 0 0 0 1px #4a4a4a inset;
  }

  .white-bg-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #409eff inset;
  }

  .white-bg-input :deep(.el-input__inner) {
    color: #303133;
  }

  :deep(.el-radio__label) {
    color: #e5e7eb;
  }

  :deep(.el-form-item__label) {
    color: #e5e7eb;
  }

  .editor-container {
    border-color: #4a4a4a;
  }
}
</style>