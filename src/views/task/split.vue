<template>
  <Layout>
    <template #content>
      <div class="split-task-container">
        <!-- Header Card -->
        <el-card class="split-task-card header-card" shadow="hover">
          <div class="header-section">
            <h2 class="page-title">拆分子任务</h2>
            <div class="task-info">
              <div class="task-title">{{ parentTask.title }}</div>
              <div class="task-id">任务编号: {{ parentTask.id }}</div>
            </div>
          </div>
        </el-card>

        <!-- Subtasks Form Card -->
        <el-card class="split-task-card subtasks-card" shadow="hover">
          <div class="card-header">
            <h3 class="section-title">子任务列表</h3>
            <div class="header-buttons">
              <el-button type="primary" size="small" @click="addSubtask">添加子任务</el-button>
              <el-button type="info" size="small" @click="resetSubtasks">重置</el-button>
            </div>
          </div>

          <div class="subtasks-list">
            <div v-for="(subtask, index) in subtasks" :key="index" class="subtask-item">
              <div class="subtask-header">
                <h4 class="subtask-title">子任务 {{ index + 1 }}</h4>
                <el-button
                    type="danger"
                    size="small"
                    icon="Delete"
                    circle
                    @click="removeSubtask(index)"
                    v-if="subtasks.length > 2"
                ></el-button>
              </div>
              <el-form :model="subtask" label-width="100px">
                <el-form-item label="标题">
                  <el-input v-model="subtask.title" placeholder="请输入子任务标题"></el-input>
                </el-form-item>
                <el-form-item label="所属部门">
                  <el-cascader
                      v-model="subtask.departmentId"
                      :options="departmentTreeData"
                      placeholder="请选择部门"
                      clearable
                      filterable
                      :props="{
                          checkStrictly: true,
                          label: 'name',
                          value: 'id',
                          emitPath: false
                        }"
                  >
                    <template #default="{ node, data }">
                      <div>
                        {{ data.name }}
                      </div>
                    </template>
                  </el-cascader>
                </el-form-item>
                <el-form-item label="执行人">
                  <el-select
                      v-model="subtask.handlerId"
                      placeholder="请选择执行人"
                      clearable
                      filterable
                      style="width: 21.5%"
                  >
                    <el-option
                        v-for="user in userOptions"
                        :key="user.id"
                        :label="user.realName"
                        :value="user.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="任务内容" class="content-form-item">
                  <div class="quill-editor-container">
                    <QuillEditor
                        v-model:content="subtask.content"
                        class="quill-editor"
                        contentType="html"
                        theme="snow"
                        toolbar="full"
                    />
                  </div>
                </el-form-item>
                <el-form-item label="期望完成时间">
                  <el-date-picker
                      v-model="subtask.expectedTime"
                      type="datetime"
                      placeholder="选择日期时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                  ></el-date-picker>
                </el-form-item>
              </el-form>

              <el-divider v-if="index < subtasks.length - 1"></el-divider>
            </div>
          </div>
        </el-card>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitSplit" :loading="submitting">确认拆分</el-button>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Layout from '@/components/Layout.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useTaskStore } from '@/stores/task'
import { useDeptStore } from '@/stores/department'
import { useUserStore } from '@/stores/user'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const taskId = route.params.id

// 初始化stores
const taskStore = useTaskStore()
const deptStore = useDeptStore()
const userStore = useUserStore()

// 父任务数据
const parentTask = ref({})

// 部门和用户选项
const departmentTreeData = ref([])
const userOptions = ref([])

// 子任务列表
const subtasks = ref([])
const submitting = ref(false)

// 获取父任务详情
const fetchTaskDetail = async () => {
  const taskData = await taskStore.getTaskDetailAction(taskId)
  if (taskData) {
    parentTask.value = taskData
    // 初始化子任务数据
    resetSubtasks()
  }
}

// 获取部门树
const fetchDepartmentTree = async () => {
  departmentTreeData.value = await deptStore.getDepartmentTreeAction()
}

// 获取用户列表
const fetchUsers = async () => {
  const users = await userStore.getUsersAction()
  if (users) {
    userOptions.value = users
  }
}

// 初始化数据
onMounted(async () => {
  await Promise.all([
    fetchTaskDetail(),
    fetchDepartmentTree(),
    fetchUsers()
  ])
})

// 添加子任务
const addSubtask = () => {
  subtasks.value.push({
    title: `${parentTask.value.title}-子任务`,
    departmentId: parentTask.value.departmentId,
    handlerId: null,
    expectedTime: '',
    content: ''
  })
}

// 移除子任务
const removeSubtask = (index) => {
  subtasks.value.splice(index, 1)
}

// 重置子任务
const resetSubtasks = () => {
  // 创建两个初始子任务
  subtasks.value = [
    {
      title: `${parentTask.value.title}-子任务`,
      departmentId: parentTask.value.departmentId,
      handlerId: null,
      expectedTime: parentTask.value.expectedTime,
      content: ''
    },
    {
      title: `${parentTask.value.title}-子任务`,
      departmentId: parentTask.value.departmentId,
      handlerId: null,
      expectedTime: parentTask.value.expectedTime,
      content: ''
    }
  ]
}

// 取消
const cancel = () => {
  router.push(`/task/${taskId}`)
}

// 提交拆分
const submitSplit = async () => {
  // 验证子任务数据
  for (let i = 0; i < subtasks.value.length; i++) {
    const subtask = subtasks.value[i]
    if (!subtask.title) {
      ElMessage.warning(`子任务 ${i + 1} 的标题不能为空`)
      return
    }

    if (!subtask.departmentId) {
      ElMessage.warning(`子任务 ${i + 1} 的部门不能为空`)
      return
    }

    if (!subtask.handlerId) {
      ElMessage.warning(`子任务 ${i + 1} 的执行人不能为空`)
      return
    }

    if (!subtask.expectedTime) {
      ElMessage.warning(`子任务 ${i + 1} 的期望完成时间不能为空`)
      return
    }

    if (subtask.expectedTime && subtask.expectedTime.includes('T')) {
      subtask.expectedTime = subtask.expectedTime.replace('T', ' ')
    }
  }

  submitting.value = true
  const result = await taskStore.splitTaskAction(taskId, subtasks.value)
  if (result) {
    ElMessage.success('任务拆分成功')
    await router.push(`/task/${taskId}`)
  } else {
    ElMessage.error('任务拆分失败')
  }
  submitting.value = false
}
</script>

<style scoped>
.split-task-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.split-task-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.split-task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Header Card */
.header-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.task-id {
  font-size: 14px;
  color: #909399;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* Subtasks Card */
.subtasks-list {
  padding: 15px 0;
  display: flex;
  flex-direction: column;
}

.subtask-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px 15px 0 15px;
}

.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.subtask-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

/* Quill Editor Styles */
.content-form-item {
  margin-bottom: 20px;
}

.quill-editor-container {
  width: 100%;
}

.quill-editor {
  height: 200px;
  margin-bottom: 20px;
}

:deep(.ql-container) {
  min-height: 150px;
}

:deep(.ql-editor) {
  min-height: 150px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

/* Dark Theme Adaptations */
:deep(.dark) {
  .split-task-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .page-title,
  .section-title,
  .subtask-title {
    color: #e5e7eb;
  }

  .task-title {
    color: #c0c0c0;
  }

  .subtask-item {
    background-color: #363636;
  }

  :deep(.ql-toolbar) {
    background-color: #2d2d2d;
    border-color: #444;
  }

  :deep(.ql-container) {
    background-color: #1e1e1e;
    border-color: #444;
    color: #e5e7eb;
  }

  :deep(.ql-editor.ql-blank::before) {
    color: #909399;
  }
}

/* Responsive Adjustments */
@media screen and (max-width: 768px) {
  .split-task-container {
    padding: 10px;
  }
}
</style>