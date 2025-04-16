<template>
  <Layout>
    <template #content>
      <div class="split-task-container">
        <!-- Header Card -->
        <el-card class="split-task-card header-card" shadow="hover">
          <div class="header-section">
            <h2 class="page-title">拆分任务</h2>
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
                <el-form-item label="所属部门">
                  <el-cascader
                      v-model="subtask.departmentId"
                      :options="departmentOptions"
                      placeholder="请选择部门"
                      clearable
                      filterable
                      style="width: 100%"
                  ></el-cascader>
                </el-form-item>

                <el-form-item label="执行人">
                  <el-select
                      v-model="subtask.handlerId"
                      placeholder="请选择执行人"
                      filterable
                      style="width: 100%"
                  >
                    <el-option
                        v-for="user in userOptions"
                        :key="user.id"
                        :label="user.name"
                        :value="user.id"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="期望完成时间">
                  <el-date-picker
                      v-model="subtask.expectedTime"
                      type="datetime"
                      placeholder="选择日期时间"
                  ></el-date-picker>
                </el-form-item>

                <el-form-item label="备注" class="remark-form-item">
                  <div class="quill-editor-container">
                    <QuillEditor
                        v-model:content="subtask.remark"
                        class="quill-editor"
                        contentType="html"
                        theme="snow"
                        toolbar="full"
                    />
                  </div>
                </el-form-item>
              </el-form>

              <el-divider v-if="index < subtasks.length - 1"></el-divider>
            </div>
          </div>
        </el-card>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitSplit">确认拆分</el-button>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Layout from '@/components/Layout.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 模拟数据 - 父任务
const parentTask = reactive({
  id: 1001,
  title: '开发用户管理模块',
  projectId: 1,
  projectName: '协同办公系统',
  departmentId: 2,
  departmentName: '技术部',
  handlerId: 101,
  handlerName: '张三',
  expectedTime: '2025-05-15 18:00:00',
  status: 1,
  statusText: '已分派',
  priority: 2,
  priorityText: '中'
})

// 模拟数据 - 部门选项
const departmentOptions = [
  {
    value: 1,
    label: '产品部',
    children: [
      {value: 11, label: '产品设计组'},
      {value: 12, label: '产品运营组'}
    ]
  },
  {
    value: 2,
    label: '技术部',
    children: [
      {value: 21, label: '前端开发组'},
      {value: 22, label: '后端开发组'},
      {value: 23, label: '测试组'}
    ]
  },
  {
    value: 3,
    label: '市场部',
    children: [
      {value: 31, label: '市场推广组'},
      {value: 32, label: '销售组'}
    ]
  }
]

// 模拟数据 - 用户选项
const userOptions = [
  {id: 101, name: '张三'},
  {id: 102, name: '李四'},
  {id: 103, name: '王五'},
  {id: 104, name: '赵六'},
  {id: 105, name: '钱七'},
  {id: 106, name: '孙八'}
]

// 初始子任务数据
const initialSubtasks = [
  {
    departmentId: [2, 21],
    handlerId: 102,
    expectedTime: '2025-05-10 18:00:00',
    remark: ''
  },
  {
    departmentId: [2, 22],
    handlerId: 103,
    expectedTime: '2025-05-12 18:00:00',
    remark: ''
  }
]

// 子任务列表
const subtasks = ref([...initialSubtasks])

// 添加子任务
const addSubtask = () => {
  subtasks.value.push({
    departmentId: parentTask.departmentId ? [parentTask.departmentId] : [],
    handlerId: null,
    expectedTime: '',
    remark: ''
  })
}

// 移除子任务
const removeSubtask = (index) => {
  subtasks.value.splice(index, 1)
}

// 重置子任务
const resetSubtasks = () => {
  subtasks.value = JSON.parse(JSON.stringify(initialSubtasks))
}

// 取消
const cancel = () => {
  // 这里应该是返回上一页或关闭对话框的逻辑
  console.log('取消拆分任务')
}

// 提交拆分
const submitSplit = () => {
  // 这里应该是提交拆分任务的逻辑
  console.log('提交拆分任务', subtasks.value)
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
.remark-form-item {
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