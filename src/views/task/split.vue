<template>
  <Layout>
    <template #content>
      <div class="split-task-container">
        <!-- Header Card -->
        <el-card class="split-task-card header-card" shadow="hover">
          <div class="header-section">
            <h2 class="page-title" style="align-self: center">拆分子任务</h2>
            <div class="task-info">
              <div class="task-title">任务标题: {{ parentTask.title }}</div>
              <div class="task-content">预计开始时间: {{ formatDateTime(parentTask.expectedStartTime) }}</div>
              <div class="task-content">期望完成时间: {{ formatDateTime(parentTask.expectedTime) }}</div>
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
                      @change="(val) => handleHandlerChange(val, index)"
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
                        placeholder="未填写默认使用父任务内容填充"
                    />
                  </div>
                </el-form-item>
                <el-form-item label="前置任务">
                  <el-select
                      v-model="subtask.predecessorTask"
                      multiple
                      :multiple-limit="2"
                      placeholder="请选择前置任务（最多2个）"
                      style="width: 30%"
                      :disabled="subtasks.length <= 1"
                  >
                    <el-option
                        v-for="(item, idx) in subtasks"
                        :key="idx"
                        :label="`子任务${idx+1}`"
                        :value="idx"
                        v-if="idx !== index"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="预计开始时间">
                  <el-date-picker
                      v-model="subtask.expectedStartTime"
                      type="datetime"
                      placeholder="请选择预计开始时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 30%"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item label="持续天数">
                  <el-input-number
                      v-model="subtask.duration"
                      :min="1"
                      placeholder="请输入持续天数"
                      style="width: 30%"
                  />
                </el-form-item>
              </el-form>

              <el-divider v-if="index < subtasks.length - 1"></el-divider>
            </div>
          </div>
        </el-card>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <el-button @click="cancel">取消</el-button>
          <el-button type="warning" @click="addSubtask">添加子任务</el-button>
          <el-button type="primary" @click="submitSplit" :loading="submitting">确认拆分</el-button>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {dayjs, ElMessage} from 'element-plus'
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

// 处理部门选择
const handleHandlerChange = (handlerId, index) => {
  if (!handlerId) return

  // 根据执行人ID查找对应的用户信息
  const selectedUser = userOptions.value.find(user => user.id === handlerId)
  if (selectedUser && selectedUser.deptId) {
    // 自动设置子任务的部门为执行人所在部门
    subtasks.value[index].departmentId = selectedUser.deptId
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
    content: '',
    predecessorTask: [],
    postTask: [],
    expectedStartTime: parentTask.value.expectedStartTime,
    duration: 1
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
      content: '',
      predecessorTask: [],
      postTask: [],
      expectedStartTime: parentTask.value.expectedStartTime,
      duration: 1
    },
    {
      title: `${parentTask.value.title}-子任务`,
      departmentId: parentTask.value.departmentId,
      handlerId: null,
      expectedTime: parentTask.value.expectedTime,
      content: '',
      predecessorTask: [],
      postTask: [],
      expectedStartTime: parentTask.value.expectedStartTime,
      duration: 1
    }
  ]
}

// 取消
const cancel = () => {
  router.push(`/task/${taskId}`)
}

// 提交拆分
const submitSplit = async () => {
  // 1. 校验子任务数据
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

    if (!subtask.expectedStartTime) {
      ElMessage.warning(`子任务 ${i + 1} 的预计开始时间不能为空`)
      return
    }

    if (dayjs(subtask.expectedStartTime).isBefore(dayjs(parentTask.value.expectedStartTime))) {
      ElMessage.error(`子任务 ${i + 1} 的预计开始时间不能早于父任务的预计开始时间`)
      return
    }

    if (!subtask.duration || subtask.duration < 1) {
      ElMessage.warning(`子任务 ${i + 1} 的持续天数必须大于0`)
      return
    }

    if (subtask.expectedStartTime && subtask.expectedStartTime.includes('T')) {
      subtask.expectedStartTime = subtask.expectedStartTime.replace('T', ' ')
    }
  }

  // 2. 计算每个子任务的期望完成时间
  subtasks.value.forEach(subtask => {
    subtask.expectedTime = dayjs(subtask.expectedStartTime).add(subtask.duration, 'day').format('YYYY-MM-DD HH:mm:ss')
  })

  // 3. 校验所有子任务的期望完成时间不能晚于父任务的期望完成时间
  for (let i = 0; i < subtasks.value.length; i++) {
    const subtask = subtasks.value[i]
    if (dayjs(subtask.expectedTime).isAfter(dayjs(parentTask.value.expectedTime))) {
      ElMessage.error(`子任务 ${i + 1} 的期望完成时间不能晚于父任务的期望完成时间`)
      return
    }
  }

  // 4. 校验前置任务不能比当前子任务的期望完成时间更晚，子任务的预计开始时间不能早于前置任务的期望完成时间
  for (let i = 0; i < subtasks.value.length; i++) {
    const subtask = subtasks.value[i]
    for (const preIdx of subtask.predecessorTask) {
      const preTask = subtasks.value[preIdx]
      // 校验前置任务的期望完成时间不能晚于当前子任务的期望完成时间
      if (dayjs(preTask.expectedTime).isAfter(dayjs(subtask.expectedTime))) {
        ElMessage.error(`子任务${i + 1}的前置任务的期望完成时间不能晚于当前子任务的期望完成时间，请重新填写`)
        return
      }
      // 校验子任务的预计开始时间不能早于前置任务的期望完成时间
      if (dayjs(subtask.expectedStartTime).isBefore(dayjs(preTask.expectedTime))) {
        ElMessage.error(`子任务${i + 1}的预计开始时间不能早于前置任务的期望完成时间`)
        return
      }
    }
  }

  // 5. 检查前置后置关系不能循环依赖
  // 构建有向图，检测环
  const graph = Array(subtasks.value.length).fill(0).map(() => [])
  subtasks.value.forEach((subtask, idx) => {
    subtask.predecessorTask.forEach(preIdx => {
      graph[preIdx].push(idx)
    })
  })
  // 拓扑排序检测环
  const visited = Array(subtasks.value.length).fill(0)
  let hasCycle = false
  function dfs(node) {
    if (visited[node] === 1) { hasCycle = true; return }
    if (visited[node] === 2) return
    visited[node] = 1
    for (const next of graph[node]) dfs(next)
    visited[node] = 2
  }
  for (let i = 0; i < subtasks.value.length; i++) {
    if (!visited[i]) dfs(i)
    if (hasCycle) break
  }
  if (hasCycle) {
    ElMessage.error('子任务前置后置关系存在循环依赖，请重新填写')
    return
  }

  // 6. 生成后置任务 postTask 字段
  subtasks.value.forEach((subtask, idx) => { subtask.postTask = [] })
  subtasks.value.forEach((subtask, idx) => {
    subtask.predecessorTask.forEach(preIdx => {
      subtasks.value[preIdx].postTask.push(idx)
    })
  })

  // 7. 提交数据，前置/后置任务使用索引值，由后端处理ID映射
  const submitData = subtasks.value.map((subtask, idx) => ({
    ...subtask,
    predecessorTask: subtask.predecessorTask.join(','),
    postTask: subtask.postTask.join(','),
    expectedTime: subtask.expectedTime,
    expectedStartTime: dayjs(subtask.expectedStartTime).format('YYYY-MM-DD HH:mm:ss')
  }))

  submitting.value = true
  const result = await taskStore.splitTaskAction(taskId, submitData)
  if (result) {
    await router.push(`/task/${taskId}`)
  } else {
    ElMessage.error('任务拆分失败')
  }
  submitting.value = false
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'

  // 尝试格式化日期
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateTimeStr
  }
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

.task-content {
  font-size: 16px;
  font-weight: 380;
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