<template>
  <Layout>
    <template #content>
      <div class="task-schedule-container">
        <el-card class="task-card" shadow="hover">
          <template #header>
            <div class="task-header">
              <h3 class="card-title">定时管理</h3>
              <div class="task-actions">
                <el-button type="primary" icon="Plus" @click="handleAddTask">
                  新建作业
                </el-button>
              </div>
            </div>
          </template>

          <!-- Search Section -->
          <div class="search-section">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item label="作业名称">
                <el-input
                    v-model="searchForm.taskName"
                    placeholder="请输入作业名称"
                    class="white-bg-input"
                />
              </el-form-item>
              <el-form-item label="部门">
                <el-select
                    v-model="searchForm.department"
                    placeholder="请选择部门"
                    class="white-bg-input"
                >
                  <el-option label="技术部" value="tech" />
                  <el-option label="市场部" value="marketing" />
                  <el-option label="财务部" value="finance" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select
                    v-model="searchForm.status"
                    placeholder="请选择状态"
                    class="white-bg-input"
                >
                  <el-option label="正常" value="normal" />
                  <el-option label="暂停" value="suspended" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Refresh" @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- Task Table -->
          <el-table
              :data="filteredTasks"
              style="width: 100%"
              v-loading="loading"
          >
            <el-table-column prop="name" label="作业名称" min-width="150" />
            <el-table-column prop="department" label="部门" width="120" />
            <el-table-column prop="lastExecutionTime" label="最后执行时间" width="180" />
            <el-table-column prop="cronExpression" label="间隔(Cron)" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200" />
            <el-table-column prop="apiUrl" label="Api Url" min-width="200" />
            <el-table-column prop="requestMethod" label="请求方式" width="100" />
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="scope">
                <el-button
                    type="primary"
                    icon="Document"
                    circle
                    @click="viewExecutionRecord(scope.row)"
                    title="执行记录"
                />
                <el-button
                    type="warning"
                    icon="Edit"
                    circle
                    @click="handleEditTask(scope.row)"
                    title="编辑作业"
                />
                <el-button
                    type="success"
                    icon="VideoPlay"
                    circle
                    @click="handleStartTask(scope.row)"
                    title="开启作业"
                    v-if="scope.row.status === 'suspended'"
                />
                <el-button
                    type="info"
                    icon="VideoPause"
                    circle
                    @click="handleSuspendTask(scope.row)"
                    title="暂停作业"
                    v-if="scope.row.status === 'normal'"
                />
                <el-button
                    type="danger"
                    icon="Delete"
                    circle
                    @click="handleDeleteTask(scope.row)"
                    title="删除作业"
                />
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination -->
          <div class="pagination-container">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 15, 20]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </template>
  </Layout>

  <!-- Task Form Dialog -->
  <el-dialog
      v-model="taskFormVisible"
      :title="isEditing ? '编辑作业' : '新建作业'"
      width="50%"
      center
  >
    <el-form :model="taskForm" label-width="100px">
      <el-form-item label="任务名称">
        <el-input v-model="taskForm.name" />
      </el-form-item>
      <el-form-item label="部门">
        <el-select v-model="taskForm.department">
          <el-option label="技术部" value="tech" />
          <el-option label="市场部" value="marketing" />
          <el-option label="财务部" value="finance" />
        </el-select>
      </el-form-item>
      <el-form-item label="Cron表达式">
        <el-input v-model="taskForm.cronExpression" />
      </el-form-item>
      <el-form-item label="Api地址">
        <el-input v-model="taskForm.apiUrl" />
      </el-form-item>
      <el-form-item label="请求方式">
        <el-select v-model="taskForm.requestMethod">
          <el-option label="GET" value="get" />
          <el-option label="POST" value="post" />
          <el-option label="PUT" value="put" />
          <el-option label="DELETE" value="delete" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="taskForm.description" type="textarea" rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="taskFormVisible = false">取消</el-button>
      <el-button type="primary" @click="saveTask">确定</el-button>
    </span>
    </template>
  </el-dialog>

  <!-- Execution Record Dialog -->
  <el-dialog
      v-model="recordVisible"
      title="执行记录"
      width="70%"
      center
  >
    <el-table :data="executionRecords" style="width: 100%">
      <el-table-column prop="executionTime" label="执行时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getExecutionStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="耗时" width="120" />
      <el-table-column prop="result" label="执行结果" />
    </el-table>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="recordVisible = false">关闭</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Data
const tasks = ref([
  {
    id: 1,
    name: '出库分析',
    department: 'tech',
    lastExecutionTime: '2023-05-28 00:10:00',
    cronExpression: '0/0 10 0 * * ?',
    status: 'normal',
    description: '每天0：10执行一次',
    apiUrl: 'http://127.0.0.1:9950/Health/index',
    requestMethod: 'post'
  },
  {
    id: 2,
    name: '每日统计结果',
    department: 'marketing',
    lastExecutionTime: '2023-05-28 00:15:00',
    cronExpression: '0/0 15 0 * * ?',
    status: 'normal',
    description: '每天0:15分执行一次',
    apiUrl: 'http://127.0.0.1:9950/Health/index',
    requestMethod: 'post'
  },
  // Add more sample data as needed
])

const executionRecords = ref([
  {
    executionTime: '2023-05-28 00:10:00',
    status: 'success',
    duration: '2.5s',
    result: '执行成功'
  },
  {
    executionTime: '2023-05-27 00:10:00',
    status: 'failed',
    duration: '1.8s',
    result: '网络超时'
  }
])

// States
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tasks.value.length)
const taskFormVisible = ref(false)
const recordVisible = ref(false)
const isEditing = ref(false)

const searchForm = reactive({
  taskName: '',
  department: '',
  status: ''
})

const taskForm = reactive({
  id: null,
  name: '',
  department: '',
  cronExpression: '',
  apiUrl: '',
  requestMethod: 'post',
  description: ''
})

// Computed
const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (searchForm.taskName) {
    filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(searchForm.taskName.toLowerCase())
    )
  }

  if (searchForm.department) {
    filtered = filtered.filter(task => task.department === searchForm.department)
  }

  if (searchForm.status) {
    filtered = filtered.filter(task => task.status === searchForm.status)
  }

  total.value = filtered.length
  return filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const handleReset = () => {
  searchForm.taskName = ''
  searchForm.department = ''
  searchForm.status = ''
  currentPage.value = 1
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const getStatusType = (status: string) => {
  return status === 'normal' ? 'success' : 'danger'
}

const getStatusLabel = (status: string) => {
  return status === 'normal' ? '正常' : '暂停'
}

const getExecutionStatusType = (status: string) => {
  return status === 'success' ? 'success' : 'danger'
}

const handleAddTask = () => {
  isEditing.value = false
  Object.assign(taskForm, {
    id: null,
    name: '',
    department: '',
    cronExpression: '',
    apiUrl: '',
    requestMethod: 'post',
    description: ''
  })
  taskFormVisible.value = true
}

const handleEditTask = (task) => {
  isEditing.value = true
  Object.assign(taskForm, task)
  taskFormVisible.value = true
}

const saveTask = () => {
  if (isEditing.value) {
    const index = tasks.value.findIndex(task => task.id === taskForm.id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...taskForm }
      ElMessage.success('作业已更新')
    }
  } else {
    const newTask = {
      ...taskForm,
      id: tasks.value.length + 1,
      status: 'normal',
      lastExecutionTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    tasks.value.push(newTask)
    ElMessage.success('作业已添加')
  }
  taskFormVisible.value = false
}

const handleStartTask = (task) => {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index !== -1) {
    tasks.value[index].status = 'normal'
    ElMessage.success('作业已开启')
  }
}

const handleSuspendTask = (task) => {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index !== -1) {
    tasks.value[index].status = 'suspended'
    ElMessage.success('作业已暂停')
  }
}

const handleDeleteTask = (task) => {
  ElMessageBox.confirm(
      '确定要删除这个任务吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      ElMessage.success('作业已删除')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const viewExecutionRecord = (task) => {
  recordVisible.value = true
  // In a real application, you would load the execution records for this task
}
</script>

<style scoped>
.task-schedule-container {
  padding: 20px;
}

.task-card {
  border-radius: 8px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.search-section {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.white-bg-input {
  width: 200px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Dark theme adaptations */
:deep(.dark) {
  .task-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title {
    color: #e5e7eb;
  }

  .white-bg-input :deep(.el-input__wrapper) {
    background-color: #1c1c1c;
    box-shadow: 0 0 0 1px #4a4a4a inset;
  }

  .white-bg-input :deep(.el-input__inner) {
    color: #e5e7eb;
  }

  :deep(.el-table) {
    background-color: #2d2d2d;
    color: #e5e7eb;
  }

  :deep(.el-table th),
  :deep(.el-table tr) {
    background-color: #1c1c1c;
  }
}
</style>

