<template>
  <Layout>
    <template #content>
      <div class="work-log-container">
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 查询模块 -->
            <el-card class="query-card fixed-height" shadow="hover">
              <template #header>
                <h3 class="card-title">查询</h3>
              </template>
              <el-form :model="queryForm" label-width="80px">
                <el-form-item label="日期范围">
                  <el-date-picker
                      v-model="queryForm.dateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      class="white-bg-input"
                  />
                </el-form-item>
                <el-form-item label="年份">
                  <el-date-picker
                      v-model="queryForm.year"
                      type="year"
                      placeholder="选择年份"
                      class="white-bg-input"
                  />
                </el-form-item>
                <el-form-item label="月份">
                  <el-date-picker
                      v-model="queryForm.month"
                      type="month"
                      placeholder="选择月份"
                      class="white-bg-input"
                  />
                </el-form-item>
                <el-form-item label="日志类型">
                  <el-select
                      v-model="queryForm.logType"
                      placeholder="请选择日志类型"
                      class="white-bg-input"
                      style="width: 53%"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="日志" value="1" />
                    <el-option label="周志" value="2" />
                    <el-option label="月志" value="3" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleReset" style="width: 80%; margin-top: 20px;">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
            <!-- 仪表盘模块 -->
            <el-card class="dashboard-card" shadow="hover">
              <template #header>
                <h3 class="card-title">仪表板</h3>
              </template>
              <div class="dashboard-content">
                <el-progress type="circle" :percentage="monthProgress" :format="progressFormat" />
                <div class="statistics">
                  <div class="stat-item">
                    <span>本月已交日志</span>
                    <span class="stat-value">{{ submittedLogs }}</span>
                  </div>
                  <div class="stat-item">
                    <span>本月需交日志</span>
                    <span class="stat-value">{{ requiredLogs }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="16">
            <el-card class="log-list-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">工作日志列表</h3>
                  <el-button type="primary" @click="openAddLogDialog">添加日志</el-button>
                </div>
              </template>
              <el-timeline>
                <el-timeline-item
                    v-for="log in paginatedLogs"
                    :key="log.id"
                    :timestamp="log.date"
                    placement="top"
                    :type="getTimelineItemType(log.project)"
                >
                  <el-card class="log-item-card">
                    <h4>{{ log.project }}</h4>
                    <p>{{ log.content }}</p>
                    <div class="log-item-footer">
                      <span>工时: {{ log.hours }}小时</span>
                      <div>
                        <el-button type="primary" size="small" @click="editLog(log)">编辑</el-button>
                        <el-button type="danger" size="small" @click="deleteLog(log)">删除</el-button>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <div class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 15]"
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

  <el-dialog v-model="addLogDialogVisible" title="添加工作日志" width="30%">
    <el-form :model="logForm" @submit.prevent="submitLog">
      <el-form-item label="日期" required>
        <el-date-picker
            v-model="logForm.date"
            type="date"
            placeholder="选择日期"
            class="white-bg-input"
            style="width: 50%"
        />
      </el-form-item>
      <el-form-item label="类型" required>
        <el-select
            v-model="logForm.type"
            placeholder="请选择日志类型"
            class="white-bg-input"
            style="width: 50%"
        >
          <el-option label="日志" value="1" />
          <el-option label="周志" value="2" />
          <el-option label="月志" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="工作内容" required>
        <el-input
            v-model="logForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入今日工作内容"
            class="white-bg-input"
        />
      </el-form-item>
      <el-form-item label="工时" required>
        <el-input-number
            v-model="logForm.hours"
            :min="0.5"
            :max="24"
            :step="0.5"
            class="white-bg-input"
            style="width: 50%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addLogDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLog">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = reactive({
  dateRange: [],
  year: '',
  month: '',
  logType: '',
})

const logForm = reactive({
  date: '',
  type: '',
  content: '',
  hours: 8,
})

const logs = ref([
  { id: 1, date: '2025-03-15', project: '项目A', content: '完成用户认证模块', hours: 8, type: '1'},
  { id: 2, date: '2025-03-14', project: '项目B', content: '优化数据库查询性能', hours: 6, type: '2'},
  { id: 3, date: '2025-03-13', project: '项目C', content: '设计新功能原型', hours: 7, type: '1'},
  { id: 4, date: '2025-03-12', project: '项目A', content: '修复登录页面bug', hours: 4, type: '1'},
  { id: 5, date: '2025-03-11', project: '项目B', content: '实现数据导出功能', hours: 5, type: '3'},
])

const currentPage = ref(1)
const pageSize = ref(5)
const total = computed(() => filteredLogs.value.length)
const searchKeyword = ref('')
const addLogDialogVisible = ref(false)

const paginatedLogs = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredLogs.value.slice(startIndex, endIndex)
})

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    const matchesKeyword =
        log.content.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        log.project.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesDateRange =
        queryForm.dateRange.length === 0 ||
        (new Date(log.date) >= queryForm.dateRange[0] &&
            new Date(log.date) <= queryForm.dateRange[1])
    const matchesYear =
        !queryForm.year ||
        new Date(log.date).getFullYear() === new Date(queryForm.year).getFullYear()
    const matchesMonth =
        !queryForm.month ||
        new Date(log.date).getMonth() === new Date(queryForm.month).getMonth()
    const matchesLogType = !queryForm.logType || log.type === queryForm.logType
    return matchesKeyword && matchesDateRange && matchesYear && matchesMonth && matchesLogType
  })
})

const monthProgress = computed(() => {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return Math.round((now.getDate() / daysInMonth) * 100)
})

const submittedLogs = computed(() => {
  const now = new Date()
  return logs.value.filter((log) => {
    const logDate = new Date(log.date)
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()
  }).length
})

const requiredLogs = computed(() => {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return daysInMonth // 假设每天需要一条日志
})

const handleReset = () => {
  queryForm.dateRange = []
  queryForm.year = ''
  queryForm.month = ''
  queryForm.logType = ''
  searchKeyword.value = ''
  ElMessage.success('查询条件已重置')
}

const progressFormat = (percentage: number) => {
  return `${percentage}%`
}

const submitLog = () => {
  ElMessage.success('日志提交成功')
  addLogDialogVisible.value = false
  Object.assign(logForm, { date: '', project: '', content: '', hours: 8 })
  // 在实际应用中，这里应该调用API来保存日志
}

const editLog = (log) => {
  ElMessage.info(`编辑日志：${log.date}`)
  // 在实际应用中，这里应该打开一个编辑对话框或跳转到编辑页面
}

const deleteLog = (log) => {
  ElMessageBox.confirm(`确定要删除 ${log.date} 的日志吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        ElMessage.success('日志删除成功')
        // 在实际应用中，这里应该调用API来删除日志，然后刷新日志列表
      })
      .catch(() => {
        // 取消删除操作
      })
}

const getTimelineItemType = (project: string) => {
  const types = {
    项目A: 'primary',
    项目B: 'success',
    项目C: 'warning',
  }
  return types[project] || 'info'
}

const openAddLogDialog = () => {
  addLogDialogVisible.value = true
}

// 监听查询条件变化，自动更新筛选结果
watch([() => queryForm.dateRange, () => queryForm.year, () => queryForm.month, () => queryForm.logType], () => {
  currentPage.value = 1 // 重置页码
})
</script>

<style scoped>
.work-log-container {
  padding: 15px;
}

.query-card,
.dashboard-card {
  border-radius: 12px;
  height: calc(42vh);
  margin-bottom: 10px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.query-card {
  margin-bottom: 10px;
}

.log-list-card {
  border-radius: 12px;
  height: 85vh;
  transition: all 0.3s ease;
  overflow-y: auto;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.statistics {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.white-bg-input :deep(.el-input__wrapper) {
  background-color: white;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.white-bg-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.log-item-card {
  margin-bottom: 10px;
}

.log-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .query-card,
  .dashboard-card {
    margin-bottom: 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .query-card,
  .dashboard-card,
  .log-item-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title,
  .el-timeline-item__content h4 {
    color: #e5e7eb;
  }

  .white-bg-input :deep(.el-input__wrapper) {
    background-color: #1c1c1c;
    box-shadow: 0 0 0 1px #4a4a4a inset;
  }

  .white-bg-input :deep(.el-input__inner) {
    color: #e5e7eb;
  }

  :deep(.el-timeline-item__node) {
    background-color: #409eff;
  }

  :deep(.el-timeline-item__tail) {
    border-left-color: #4a4a4a;
  }

  :deep(.el-button) {
    background-color: #4a4a4a;
    border-color: #4a4a4a;
    color: #e5e7eb;
  }

  :deep(.el-button--primary) {
    background-color: #409eff;
    border-color: #409eff;
    color: #ffffff;
  }

  :deep(.el-button--danger) {
    background-color: #f56c6c;
    border-color: #f56c6c;
    color: #ffffff;
  }

  :deep(.el-pagination) {
    --el-text-color-regular: #e5e7eb;
  }

  :deep(.el-select-dropdown__item) {
    color: #e5e7eb;
  }

  :deep(.el-select-dropdown__item.hover),
  :deep(.el-select-dropdown__item:hover) {
    background-color: #1c1c1c;
  }
}
</style>