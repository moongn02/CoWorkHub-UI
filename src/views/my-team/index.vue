<template>
  <Layout>
    <template #content>
      <div class="team-interface-container">
        <el-row :gutter="20">
          <!-- Left sidebar for personnel display -->
          <el-col :span="6">
            <el-card class="personnel-card" shadow="hover">
              <template #header>
                <h3 class="card-title">部门人员</h3>
              </template>
              <el-tree
                  :data="personnelData"
                  :props="defaultProps"
                  @check="handlePersonnelSelect"
                  show-checkbox
                  default-expand-all
                  node-key="id"
                  ref="personnelTree"
              />
            </el-card>
          </el-col>

          <!-- Right main area for work logs -->
          <el-col :span="18">
            <el-card class="work-log-card" shadow="hover">
              <template #header>
                <div class="work-log-header">
                  <h3 class="card-title">工作日志</h3>
                  <div class="work-log-actions">
                    <el-select v-model="logType" placeholder="选择日志类型" class="white-bg-input">
                      <el-option label="全部" value="all" />
                      <el-option label="周报" value="周报" />
                      <el-option label="月报" value="月报" />
                      <el-option label="日报" value="日报" />
                    </el-select>
                    <el-date-picker
                        v-model="dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        class="white-bg-input"
                    />
                  </div>
                </div>
              </template>

              <!-- Work log table -->
              <el-table :data="filteredWorkLogs" style="width: 100%" v-loading="loading">
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="personnel" label="人员" width="100" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="scope">
                    <el-tag :type="getLogTypeTag(scope.row.type)">{{ scope.row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="content" label="内容" min-width="200">
                  <template #default="scope">
                    <span :title="scope.row.content">{{ truncateContent(scope.row.content, 20) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)">{{ getStatusLabel(scope.row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" @click="viewWorkLog(scope.row)" icon="View" circle />
                    <el-button type="info"  @click="editWorkLog(scope.row)" icon="Edit" circle />
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
          </el-col>
        </el-row>
      </div>
    </template>
  </Layout>

  <!-- View Work Log Dialog -->
  <el-dialog
      v-model="viewDialogVisible"
      title="查看工作日志"
      width="30%"
      center
      class="work-log-dialog"
  >
    <div v-if="selectedLog" class="log-detail-content">
      <div class="log-item">
        <span class="log-label">日期：</span>
        <span class="log-value">{{ selectedLog.date }}</span>
      </div>
      <div class="log-item">
        <span class="log-label">人员：</span>
        <span class="log-value">{{ selectedLog.personnel }}</span>
      </div>
      <div class="log-item">
        <span class="log-label">类型：</span>
        <span class="log-value">{{ selectedLog.type }}</span>
      </div>
      <div class="log-item">
        <span class="log-label">状态：</span>
        <span class="log-value">{{ getStatusLabel(selectedLog.status) }}</span>
      </div>
      <div class="log-item log-content">
        <span class="log-label">内容：</span>
        <span class="log-value">{{ selectedLog.content }}</span>
      </div>
    </div>
  </el-dialog>

  <!-- Edit Work Log Dialog -->
  <el-dialog v-model="editDialogVisible" title="编辑工作日志" width="50%" center>
    <el-form :model="editForm" label-width="100px">
      <el-form-item label="日期">
        <el-date-picker v-model="editForm.date" type="date" placeholder="选择日期" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="editForm.type" placeholder="选择类型">
          <el-option label="日报" value="日报" />
          <el-option label="周报" value="周报" />
          <el-option label="月报" value="月报" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="editForm.status" placeholder="选择状态">
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="editForm.content" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditedWorkLog">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage } from 'element-plus'

// Personnel data (single department, expanded by default)
const personnelData = [
  {
    id: 'dept1',
    label: '技术部',
    children: [
      { id: 1, label: '张三' },
      { id: 2, label: '李四' },
      { id: 3, label: '王五' },
    ],
  },
]

const defaultProps = {
  children: 'children',
  label: 'label',
}

// Work log data
const workLogs = ref([
  { id: 1, date: '2025-03-15', type: '日报', content: '完成了登录功能的优化', status: 'completed', personnel: '张三' },
  { id: 2, date: '2025-03-20', type: '周报', content: '进行中的UI重构项目', status: 'in_progress', personnel: '李四' },
  { id: 3, date: '2025-04-01', type: '月报', content: '后端API开发进度报告', status: 'in_progress', personnel: '王五' },
  { id: 4, date: '2025-04-05', type: '周报', content: '完成了用户管理模块', status: 'completed', personnel: '张三' },
  { id: 5, date: '2025-04-10', type: '周报', content: 'UI重构项目进度更新', status: 'in_progress', personnel: '李四' },
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(workLogs.value.length)
const logType = ref('all')
const dateRange = ref([])
const selectedPersonnel = ref([])
const personnelTree = ref(null)

// View and Edit dialog related refs
const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const selectedLog = ref({})
const editForm = ref({
  id: null,
  date: '',
  type: '',
  content: '',
  status: '',
  personnel: ''
})

// Filter work logs based on selected options
const filteredWorkLogs = computed(() => {
  let filtered = workLogs.value

  if (selectedPersonnel.value.length > 0) {
    filtered = filtered.filter(log => selectedPersonnel.value.includes(log.personnel))
  }

  if (logType.value !== 'all') {
    filtered = filtered.filter(log => log.type === logType.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    filtered = filtered.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= start && logDate <= end
    })
  }

  total.value = filtered.length
  return filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const handlePersonnelSelect = (data, checked) => {
  const checkedNodes = personnelTree.value.getCheckedNodes()
  selectedPersonnel.value = checkedNodes
      .filter(node => !node.children)
      .map(node => node.label)
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const getLogTypeTag = (type: string) => {
  const types = {
    '周报': 'info',
    '月报': 'warning',
    '日报': 'success'
  }
  return types[type] || 'info'
}

const getStatusType = (status: string) => {
  const types = {
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels = {
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status] || '未知'
}

const truncateContent = (content: string, maxLength: number) => {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength) + '...'
}

const viewWorkLog = (log) => {
  selectedLog.value = log
  viewDialogVisible.value = true
}

const editWorkLog = (log) => {
  editForm.value = { ...log }
  editDialogVisible.value = true
}

const saveEditedWorkLog = () => {
  const index = workLogs.value.findIndex(log => log.id === editForm.value.id)
  if (index !== -1) {
    workLogs.value[index] = { ...editForm.value }
    ElMessage.success('工作日志已更新')
    editDialogVisible.value = false
  }
}
</script>

<style scoped>
.team-interface-container {
  padding: 20px;
}

.personnel-card,
.work-log-card {
  border-radius: 8px;
  height: 80vh;
  overflow-y: auto;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.work-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-log-actions {
  display: flex;
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
  .personnel-card,
  .work-log-card {
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

  :deep(.el-tree) {
    background-color: #2d2d2d;
    color: #e5e7eb;
  }

  :deep(.el-tree-node__content:hover) {
    background-color: #3a3a3a;
  }

  :deep(.el-tree-node:focus > .el-tree-node__content) {
    background-color: #4a4a4a;
  }
}

/* 弹窗整体样式 */
:deep(.work-log-dialog) {
  .el-dialog__header {
    padding: 20px;
    border-bottom: 1px solid #eee;

    .el-dialog__title {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .el-dialog__body {
    padding: 30px;
  }
}

/* 日志内容样式 */
.log-detail-content {
  .log-item {
    margin-bottom: 15px;
    line-height: 1.8;
    font-size: 16px;
    display: flex;

    &:last-child {
      margin-bottom: 0;
    }

    /* 内容区域特殊处理 */
    &.log-content {
      flex-direction: column;

      .log-value {
        margin-top: 10px;
        line-height: 1.6;
        white-space: pre-wrap;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
      }
    }
  }

  .log-label {
    font-weight: 600;
    color: #333;
    margin-right: 10px;
    min-width: 80px;
  }

  .log-value {
    color: #666;
    flex: 1;
  }
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  :deep(.work-log-dialog) {
    width: 90% !important; /* 在小屏幕上占据更多宽度 */

    .el-dialog__body {
      padding: 20px;
    }
  }

  .log-detail-content {
    .log-item {
      font-size: 14px;
      margin-bottom: 15px;
      flex-direction: column;

      &.log-content .log-value {
        padding: 10px;
      }
    }

    .log-label {
      margin-bottom: 5px;
    }
  }
}

/* 状态样式 */
.log-value {
  &.status-pending {
    color: #e6a23c;
  }
  &.status-completed {
    color: #67c23a;
  }
  &.status-cancelled {
    color: #f56c6c;
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .log-detail-content {
    .log-label {
      color: #e5e7eb;
    }

    .log-value {
      color: #9ca3af;
    }

    .log-content .log-value {
      background: #374151;
    }
  }
}
</style>