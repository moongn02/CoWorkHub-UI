<template>
  <Layout>
    <template #content>
      <div class="task-schedule-container">
        <el-card class="task-card" shadow="hover">
          <template #header>
            <div class="task-header">
              <h3 class="card-title">定时管理</h3>
              <div class="header-buttons">
                <el-button type="danger" @click="batchDeleteTasks" :disabled="selectedTasks.length === 0">批量删除</el-button>
                <el-button type="primary" @click="handleAddTask">添加作业</el-button>
              </div>
            </div>
          </template>

          <!-- 搜索条件 -->
          <div class="task-actions">
            <el-select
                v-model="searchForm.status"
                placeholder="作业状态"
                class="white-bg-input"
                clearable
            >
              <el-option label="全部" value="" />
              <el-option label="启动" value="normal" />
              <el-option label="暂停" value="suspended" />
            </el-select>
            <el-select
                v-model="searchForm.executionStatus"
                placeholder="最近执行状态"
                class="white-bg-input"
                clearable
            >
              <el-option label="全部" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
            </el-select>
            <el-input
                v-model="searchForm.keyword"
                placeholder="搜索作业"
                class="white-bg-input"
                @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>

          <!-- 作业表格 -->
          <el-table
              :data="filteredTasks"
              style="width: 100%"
              v-loading="loading"
              @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="作业名称" min-width="150">
              <template #default="scope">
                <el-tooltip :content="scope.row.name" placement="top">
                  <span>{{ truncateText(scope.row.name, 15) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="作业描述" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.description" placement="top">
                  <span>{{ truncateText(scope.row.description, 20) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="cronExpression" label="Cron表达式" width="150" />
            <el-table-column prop="status" label="作业状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="executeCondition" label="执行条件" min-width="150" />
            <el-table-column prop="nextExecutionTime" label="下次执行时间" width="180" />
            <el-table-column label="操作" width="210" fixed="right">
              <template #default="scope">
                <el-button type="primary" @click="viewExecutionRecord(scope.row)" icon="Document" circle title="执行记录" />
                <el-button type="warning" @click="handleEditTask(scope.row)" icon="Edit" circle title="编辑作业" />
                <el-button
                    :type="scope.row.status === 'normal' ? 'info' : 'success'"
                    @click="scope.row.status === 'normal' ? handleSuspendTask(scope.row) : handleStartTask(scope.row)"
                    :icon="scope.row.status === 'normal' ? 'VideoPause' : 'VideoPlay'"
                    circle
                    :title="scope.row.status === 'normal' ? '暂停作业' : '启动作业'"
                />
                <el-button type="danger" @click="handleDeleteTask(scope.row)" icon="Delete" circle title="删除作业" />
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
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

  <!-- 作业表单对话框 -->
  <el-dialog
      v-model="taskFormVisible"
      :title="isEditing ? '编辑作业' : '添加作业'"
      width="40%"
      center
  >
    <el-form :model="taskForm" label-width="100px" :rules="formRules" ref="taskFormRef">
      <el-form-item label="作业名称" prop="name">
        <el-input v-model="taskForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="Cron表达式" prop="cronExpression">
        <el-input v-model="taskForm.cronExpression" />
      </el-form-item>
      <el-form-item label="执行条件" prop="executeCondition">
        <el-input v-model="taskForm.executeCondition" />
      </el-form-item>
      <el-form-item label="Api地址" prop="apiUrl">
        <el-input v-model="taskForm.apiUrl" />
      </el-form-item>
      <el-form-item label="请求方式" prop="requestMethod">
        <el-select v-model="taskForm.requestMethod" style="width: 100%">
          <el-option label="GET" value="get" />
          <el-option label="POST" value="post" />
          <el-option label="PUT" value="put" />
          <el-option label="DELETE" value="delete" />
        </el-select>
      </el-form-item>
      <el-form-item label="作业描述" prop="description">
        <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请输入作业描述信息"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="taskFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 执行记录对话框 -->
  <el-dialog
      v-model="recordVisible"
      title="执行记录"
      width="70%"
      center
      class="task-detail-dialog"
  >
    <div v-if="selectedTask" class="task-detail-content">
      <div class="detail-item">
        <span class="detail-label">作业名称：</span>
        <span class="detail-value">{{ selectedTask.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">作业描述：</span>
        <span class="detail-value">{{ selectedTask.description }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Cron表达式：</span>
        <span class="detail-value">{{ selectedTask.cronExpression }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">执行条件：</span>
        <span class="detail-value">{{ selectedTask.executeCondition }}</span>
      </div>
    </div>
    <el-divider />
    <el-table :data="executionRecords" style="width: 100%">
      <el-table-column prop="executionTime" label="执行时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getExecutionStatusType(scope.row.status)">
            {{ scope.row.status === 'success' ? '成功' : '失败' }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 任务表单引用
const taskFormRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入作业名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  cronExpression: [
    { required: true, message: '请输入Cron表达式', trigger: 'blur' }
  ],
  apiUrl: [
    { required: true, message: '请输入Api地址', trigger: 'blur' }
  ],
  requestMethod: [
    { required: true, message: '请选择请求方式', trigger: 'change' }
  ]
}

// 示例数据
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
    requestMethod: 'post',
    executeCondition: '系统正常运行',
    nextExecutionTime: '2023-05-29 00:10:00'
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
    requestMethod: 'post',
    executeCondition: '前一天数据准备完毕',
    nextExecutionTime: '2023-05-29 00:15:00'
  },
  {
    id: 3,
    name: '库存预警',
    department: 'tech',
    lastExecutionTime: '2023-05-28 08:00:00',
    cronExpression: '0 0 8 * * ?',
    status: 'suspended',
    description: '每天8点检查库存状态',
    apiUrl: 'http://127.0.0.1:9950/Stock/check',
    requestMethod: 'get',
    executeCondition: '系统正常运行',
    nextExecutionTime: '待启动'
  }
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

// 状态
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tasks.value.length)
const taskFormVisible = ref(false)
const recordVisible = ref(false)
const isEditing = ref(false)
const selectedTasks = ref([])
const selectedTask = ref(null)

// 搜索表单
const searchForm = reactive({
  status: '',
  keyword: '',
  executionStatus: ''
})

// 任务表单
const taskForm = reactive({
  id: null,
  name: '',
  cronExpression: '',
  apiUrl: '',
  requestMethod: 'post',
  description: '',
  executeCondition: '',
  nextExecutionTime: ''
})

// 计算属性：过滤后的任务列表
const filteredTasks = computed(() => {
  return tasks.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

// 加载数据
onMounted(() => {
  // 实际项目中会从API获取数据
  fetchTasks()
})

// 获取任务列表
const fetchTasks = () => {
  loading.value = true
  try {
    // 这里应该是API调用
    setTimeout(() => {
      // 模拟API调用后的处理
      const result = tasks.value.filter(task => {
        // 按状态筛选
        if (searchForm.status && task.status !== searchForm.status) {
          return false
        }
        // 按关键词筛选
        if (searchForm.keyword && !task.name.toLowerCase().includes(searchForm.keyword.toLowerCase())) {
          return false
        }
        // 按执行状态筛选 (实际项目中需要从后端获取)
        // 这里简化处理
        return true
      })
      total.value = result.length
      loading.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('获取作业列表失败')
    loading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedTasks.value = val
}

// 处理大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTasks()
}

// 重置搜索
const handleReset = () => {
  searchForm.status = ''
  searchForm.keyword = ''
  searchForm.executionStatus = ''
  currentPage.value = 1
  fetchTasks()
}

// 获取状态类型
const getStatusType = (status: string) => {
  return status === 'normal' ? 'success' : 'danger'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  return status === 'normal' ? '正常' : '暂停'
}

// 获取执行状态类型
const getExecutionStatusType = (status: string) => {
  return status === 'success' ? 'success' : 'danger'
}

// 文本截断
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 批量删除
const batchDeleteTasks = () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请至少选择一个作业')
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedTasks.value.length} 个作业吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    // 在实际项目中，这里应该调用API
    const ids = selectedTasks.value.map(task => task.id)
    // 模拟删除操作
    tasks.value = tasks.value.filter(task => !ids.includes(task.id))
    total.value = tasks.value.length
    ElMessage.success(`已成功删除 ${selectedTasks.value.length} 个作业`)
    selectedTasks.value = []
  }).catch(() => {
    // 用户取消操作
  })
}

// 添加任务
const handleAddTask = () => {
  isEditing.value = false
  Object.assign(taskForm, {
    id: null,
    name: '',
    cronExpression: '',
    apiUrl: '',
    requestMethod: 'post',
    description: '',
    executeCondition: ''
  })
  taskFormVisible.value = true
}

// 编辑任务
const handleEditTask = (task) => {
  isEditing.value = true
  Object.assign(taskForm, task)
  taskFormVisible.value = true
}

// 保存任务
const saveTask = async () => {
  if (!taskFormRef.value) return

  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      if (isEditing.value) {
        // 编辑现有任务
        const index = tasks.value.findIndex(task => task.id === taskForm.id)
        if (index !== -1) {
          tasks.value[index] = { ...tasks.value[index], ...taskForm }
          ElMessage.success('作业已更新')
        }
      } else {
        // 添加新任务
        const newTask = {
          ...taskForm,
          id: tasks.value.length > 0 ? Math.max(...tasks.value.map(t => t.id)) + 1 : 1,
          status: 'normal',
          lastExecutionTime: '未执行',
          nextExecutionTime: '计算中...'
        }
        tasks.value.push(newTask)
        total.value = tasks.value.length
        ElMessage.success('作业已添加')
      }
      taskFormVisible.value = false
    }
  })
}

// 启动任务
const handleStartTask = (task) => {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index !== -1) {
    tasks.value[index].status = 'normal'
    tasks.value[index].nextExecutionTime = '计算中...'
    ElMessage.success('作业已启动')
  }
}

// 暂停任务
const handleSuspendTask = (task) => {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index !== -1) {
    tasks.value[index].status = 'suspended'
    tasks.value[index].nextExecutionTime = '待启动'
    ElMessage.success('作业已暂停')
  }
}

// 删除任务
const handleDeleteTask = (task) => {
  ElMessageBox.confirm(
      '确定要删除这个作业吗？',
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
      total.value = tasks.value.length
      ElMessage.success('作业已删除')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 查看执行记录
const viewExecutionRecord = (task) => {
  selectedTask.value = task
  recordVisible.value = true
  // 实际应用中应该通过API获取该任务的执行记录
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

.header-buttons {
  display: flex;
  gap: 10px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.task-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.white-bg-input {
  width: 200px;
}

.white-bg-input :deep(.el-input__wrapper) {
  background-color: white;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.white-bg-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 详情对话框样式 */
.task-detail-content {
  .detail-item {
    margin-bottom: 25px;
    line-height: 1.8;
    font-size: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .detail-label {
    font-weight: 600;
    color: #333;
    margin-right: 10px;
    min-width: 90px;
    display: inline-block;
  }

  .detail-value {
    color: #666;
  }
}

/* Modal styles */
:deep(.task-detail-dialog) {
  .el-dialog__header {
    padding: 20px;
    border-bottom: 1px solid #eee;

    .el-dialog__title {
      font-size: 20px;
      font-weight: 600;
    }
  }

  .el-dialog__body {
    padding: 30px;
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

  .task-detail-content {
    .detail-label {
      color: #e5e7eb;
    }

    .detail-value {
      color: #9ca3af;
    }
  }
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .task-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .white-bg-input {
    width: 100%;
  }
}
</style>