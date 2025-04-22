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
                      style="width: 87%"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="日志" :value="1" />
                    <el-option label="周志" :value="2" />
                    <el-option label="月志" :value="3" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch" style="width: 75%;">搜索</el-button>
                </el-form-item>
                <el-form-item>
                  <el-button @click="handleReset" style="width: 75%;">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
            <!-- 仪表盘模块 -->
            <el-card class="dashboard-card" shadow="hover">
              <template #header>
                <h3 class="card-title">仪表板</h3>
              </template>
              <div class="dashboard-content">
                <el-progress
                    type="circle"
                    :percentage="statistics.percentage"
                    :format="progressFormat"
                    :color="statistics.percentage > 0 ? '#409eff' : '#d9dadc'"
                    :stroke-width="8"
                    class="custom-progress"
                />
                <div class="statistics">
                  <div class="stat-item">
                    <span>本月已交日志</span>
                    <span class="stat-value">{{ statistics.submittedLogs }}</span>
                  </div>
                  <div class="stat-item">
                    <span>本月需交日志</span>
                    <span class="stat-value">{{ statistics.requiredLogs }}</span>
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
              <el-timeline v-if="paginatedLogs.length > 0">
                <el-timeline-item
                    v-for="(log, index) in paginatedLogs"
                    :key="log.id"
                    :timestamp="log.logDateStr"
                    placement="top"
                    :type="getTimelineItemType(index)"
                >
                  <el-card class="log-item-card">
                    <template #header>
                      <div class="log-item-header">
                        <span class="log-date">{{ log.logDateStr }}</span>
                        <el-tag :type="getLogTypeTag(log.type)" effect="dark">{{ log.typeText }}</el-tag>
                      </div>
                    </template>

                    <div class="log-content-preview" v-html="truncateHtml(log.content, 150)"></div>

                    <div class="log-item-footer">
                      <div class="log-actions">
                        <el-button type="info" size="small" @click="viewLog(log)">查看</el-button>
                        <el-button type="warning" size="small" @click="editLog(log)">编辑</el-button>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <div v-else class="empty-container">
                <el-empty description="暂无工作日志" />
              </div>
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

  <!-- 添加/编辑工作日志对话框 -->
  <el-dialog
      v-model="logDialogVisible"
      :title="isEditing ? '编辑工作日志' : '添加工作日志'"
      width="800px"
      destroy-on-close
  >
    <el-form :model="logForm" :rules="logRules" ref="logFormRef" label-width="80px">
      <el-form-item label="日期" prop="logDate">
        <el-date-picker
            v-model="logForm.logDate"
            type="date"
            placeholder="选择日期"
            class="white-bg-input"
            style="width: 50%"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
            v-model="logForm.type"
            placeholder="请选择日志类型"
            class="white-bg-input"
            style="width: 50%"
        >
          <el-option label="日志" :value="1" />
          <el-option label="周志" :value="2" />
          <el-option label="月志" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <quill-editor
            v-model:content="logForm.content"
            contentType="html"
            theme="snow"
            toolbar="full"
            style="height: 300px; width: 100%;"
            class="log-editor"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="logDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLog">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 查看工作日志详情对话框 -->
  <el-dialog
      v-model="detailDialogVisible"
      title="工作日志详情"
      width="800px"
      destroy-on-close
      center
  >
    <div class="log-detail-content">
      <div class="log-detail-header">
        <div class="log-detail-date">
          <span>日期：{{ detailLog.logDateStr }}</span>
        </div>
        <el-tag :type="getLogTypeTag(detailLog.type)" effect="dark" size="large">{{ detailLog.typeText }}</el-tag>
      </div>
      <div class="log-detail-divider"></div>
      <div class="log-detail-body" v-html="detailLog.content"></div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import { useWorkLogStore } from '@/stores/workLog'
import type { WorkLogData, WorkLogQuery } from '@/types/workLog'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import type { FormInstance, FormRules } from 'element-plus'

// 初始化 store
const workLogStore = useWorkLogStore()

// 定义查询表单
const queryForm = reactive<WorkLogQuery>({
  dateRange: [],
  year: null,
  month: null,
  logType: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)
const logList = ref<WorkLogData[]>([])
const total = computed(() => logList.value.length)

// 日志表单
const logFormRef = ref<FormInstance>()
const logForm = reactive<WorkLogData>({
  logDate: '',
  type: 1,
  content: ''
})

// 查看日志详情
const detailLog = reactive<WorkLogData>({
  logDate: '',
  type: 1,
  typeText: '',
  content: '',
  logDateStr: ''
})

// 统计数据
const statistics = ref({
  submittedLogs: 0,
  requiredLogs: 0,
  percentage: 0
})

// 对话框控制
const logDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditing = ref(false)

// 表单验证规则
const logRules: FormRules = {
  logDate: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择日志类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入日志内容', trigger: 'blur' }
  ]
}

// 计算分页后的日志列表
const paginatedLogs = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return logList.value.slice(startIndex, endIndex)
})

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 搜索日志
const handleSearch = async () => {
  await fetchLogs()
}

// 重置查询条件
const handleReset = () => {
  queryForm.dateRange = []
  queryForm.year = null
  queryForm.month = null
  queryForm.logType = ''
  fetchLogs()
}

// 进度条格式化
const progressFormat = (percentage: number) => {
  return `${percentage}%`
}

// 打开添加日志对话框
const openAddLogDialog = () => {
  isEditing.value = false
  resetLogForm()
  // 默认使用当前日期
  logForm.logDate = formatDateToString(new Date())
  logDialogVisible.value = true
}

// 提交日志
const submitLog = async () => {
  if (!logFormRef.value) return

  await logFormRef.value.validate(async (valid) => {
    if (valid) {
      let success = false

      // 确保日期格式正确
      if (logForm.logDate instanceof Date) {
        logForm.logDate = formatDateToString(logForm.logDate)
      }

      if (isEditing.value && logForm.id) {
        // 编辑现有日志
        success = await workLogStore.updateWorkLogAction(logForm)
      } else {
        // 添加新日志
        success = await workLogStore.createWorkLogAction(logForm)
      }

      if (success) {
        logDialogVisible.value = false
        resetLogForm()
        await fetchLogs()
        await fetchStatistics()
      }
    }
  })
}

// 编辑日志
const editLog = (log: WorkLogData) => {
  isEditing.value = true
  logForm.id = log.id
  logForm.logDate = log.logDate
  logForm.type = log.type
  logForm.content = log.content
  logDialogVisible.value = true
}

// 查看日志详情
const viewLog = async (log: WorkLogData) => {
  if (log.id) {
    const detail = await workLogStore.getWorkLogDetailAction(log.id)
    if (detail) {
      detailLog.id = detail.id
      detailLog.logDate = detail.logDate
      detailLog.type = detail.type
      detailLog.typeText = detail.typeText
      detailLog.content = detail.content
      detailLog.logDateStr = detail.logDateStr
      detailDialogVisible.value = true
    }
  } else {
    // 本地数据，直接显示
    Object.assign(detailLog, log)
    detailDialogVisible.value = true
  }
}

// 获取时间线项目类型
const getTimelineItemType = (index: number): string => {
  const types = ['primary', 'success', 'warning', 'info', 'danger'];
  return types[index % types.length];
}

// 获取日志类型标签类型
const getLogTypeTag = (type: number | string): string => {
  const typeMap: Record<string, string> = {
    1: 'primary',
    2: 'success',
    3: 'danger'
  }

  return typeMap[type as string] || 'info'
}

// 重置日志表单
const resetLogForm = () => {
  logForm.id = undefined
  logForm.logDate = ''
  logForm.type = 1
  logForm.content = ''
  isEditing.value = false
}

// 截断HTML内容
const truncateHtml = (html: string, maxLength = 150) => {
  if (!html) return ''

  // 创建临时DOM元素来解析HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // 获取纯文本内容
  const textContent = tempDiv.textContent || tempDiv.innerText || ''

  if (textContent.length <= maxLength) {
    return html
  }

  // 如果超出最大长度，返回部分内容
  return html
}

// 格式化日期为字符串
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取日志列表
const fetchLogs = async () => {
  const logs = await workLogStore.getWorkLogListAction(queryForm)
  logList.value = logs
}

// 获取统计数据
const fetchStatistics = async () => {
  const stats = await workLogStore.getMonthlyStatisticsAction()
  if (stats) {
    statistics.value = stats
  }
}

// 监听查询条件变化
watch(
    [() => queryForm.dateRange, () => queryForm.year, () => queryForm.month, () => queryForm.logType, () => queryForm.keyword],
    () => {
      currentPage.value = 1 // 重置页码
    }
)

// 组件挂载时获取数据
onMounted(async () => {
  await fetchLogs()
  await fetchStatistics()
})
</script>

<style scoped>
.work-log-container {
  padding: 0 15px;
}

.query-card,
.dashboard-card {
  border-radius: 12px;
  height: calc(41.96vh);
  margin-bottom: 10px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.log-list-card {
  border-radius: 12px;
  height: 84.96vh;
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
  gap: 5px;
}

.statistics {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
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

.log-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
}

.log-date {
  font-weight: bold;
  font-size: 16px;
}

.log-content-preview {
  margin-bottom: 15px;
  max-height: 100px;
  min-height: 100px;
  overflow: hidden;
  position: relative;
}

.log-content-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
}

.log-item-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 10px;
}

.log-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 工作日志详情样式 */
.log-detail-content {
  padding: 20px;
}

.log-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.log-detail-date {
  font-size: 16px;
  font-weight: bold;
}

.log-detail-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin-bottom: 20px;
}

.log-detail-body {
  min-height: 350px;
  max-height: 350px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f8f9fa;
  overflow-y: auto;
}

/* 编辑器样式 */
:deep(.log-editor) {
  display: flex;
  flex-direction: column;
  width: 100%;
}

:deep(.log-editor .ql-container) {
  flex: 1;
  overflow-y: auto;
}

:deep(.log-editor .ql-toolbar) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.log-editor .ql-container) {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 富文本内容样式 */
.log-content-preview :deep(p),
.log-detail-body :deep(p) {
  margin: 8px 0;
}

.log-content-preview :deep(img),
.log-detail-body :deep(img) {
  max-width: 100%;
  height: auto;
}

.log-content-preview :deep(ul),
.log-content-preview :deep(ol),
.log-detail-body :deep(ul),
.log-detail-body :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.log-content-preview :deep(pre),
.log-detail-body :deep(pre) {
  background-color: #f6f6f6;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
  white-space: pre-wrap;
}

.log-content-preview :deep(blockquote),
.log-detail-body :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 12px;
  margin: 8px 0;
  color: #666;
}

:deep(.custom-progress) .el-progress-circle__track {
  stroke: #d9dadc !important;
}

/* 确保在暗色主题下也有适当的灰色背景 */
:deep(.dark) .custom-progress .el-progress-circle__track {
  stroke: #4a4a4a !important;
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

  .log-content-preview::after {
    background: linear-gradient(to bottom, rgba(45, 45, 45, 0), rgba(45, 45, 45, 1));
  }

  .log-detail-body {
    background-color: #1c1c1c;
    border-color: #4a4a4a;
    color: #e5e7eb;
  }
}
</style>