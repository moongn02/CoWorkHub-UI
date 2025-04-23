<template>
  <Layout>
    <template #content>
      <div class="main-content">
        <!-- 顶部统计卡片 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" v-for="stat in dashboardStats" :key="stat.label">
            <el-card class="stats-card" shadow="hover" v-loading="loading">
              <div class="stat-content">
                <el-icon :size="24" :color="stat.color"><component :is="stat.icon" /></el-icon>
                <div class="stat-info">
                  <div class="stat-label">{{ stat.label }}</div>
                  <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 任务单和问题单 -->
        <el-row :gutter="20" class="content-row">
          <!-- 任务单 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="list-card-1" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">任务单</h3>
                </div>
              </template>
              <div class="scrollable-content" v-loading="taskLoading">
                <div v-if="tasks.length > 0" v-for="task in tasks" :key="task.id" class="list-item" @click="viewTask(task.id)">
                  <div class="item-header">
                    <el-tag size="small" type="primary">{{ task.id }}</el-tag>
                    <el-tag size="small" :type="getTaskStatusType(task.status)">{{ task.statusText }}</el-tag>
                  </div>
                  <div class="item-content">
                    <h4>{{ task.title }}</h4>
                    <p class="item-info">
                      <span>执行人: {{ task.handlerName || '未分配' }}</span>
                      <span>期望完成: {{ formatDate(task.expectedTime) }}</span>
                    </p>
                  </div>
                </div>
                <el-empty v-else :image-size="80" description="暂无任务" />
              </div>
            </el-card>
          </el-col>

          <!-- 问题单 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="list-card-1" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">问题单</h3>
                </div>
              </template>
              <div class="scrollable-content" v-loading="issueLoading">
                <div v-if = "issues.length > 0" v-for="issue in issues" :key="issue.id" class="list-item" @click="viewIssue(issue.id)">
                  <div class="item-header">
                    <el-tag size="small" type="warning">{{ issue.id }}</el-tag>
                    <el-tag size="small" :type="getIssueStatusType(issue.status)">{{ issue.statusText }}</el-tag>
                  </div>
                  <div class="item-content">
                    <h4>{{ issue.title }}</h4>
                    <p class="item-info">
                      <span>处理人: {{ issue.handlerName || '未分配' }}</span>
                      <span>期望完成: {{ formatDate(issue.expectedTime) }}</span>
                    </p>
                  </div>
                </div>
                <el-empty v-else :image-size="80" description="暂无问题" />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 工作备忘和工作日志 -->
        <el-row :gutter="20" class="content-row">
          <!-- 工作备忘 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="list-card-2" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">工作备忘</h3>
                </div>
              </template>
              <div class="scrollable-content" v-loading="memoLoading">

                <div v-if="memos.length > 0"v-for="memo in memos" :key="memo.id" class="list-item">
                  <div class="item-header">
                    <h4>{{ memo.title }}</h4>
                    <el-button type="text" icon="view" @click="viewFullMemo(memo)"></el-button>
                  </div>
                  <div class="item-content">
                    <p class="memo-content">{{ truncateContent(memo.content) }}</p>
                    <p class="item-info">
                      <span>记录时间: {{ memo.memoDate }}</span>
                    </p>
                  </div>
                </div>
                <el-empty v-else :image-size="80" description="暂无备忘" />
              </div>
            </el-card>
          </el-col>

          <!-- 工作日志 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="list-card-2" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">今日工作日志</h3>
                </div>
              </template>
              <div class="scrollable-content" v-loading="logLoading">
                <el-empty v-if="!todayLog" :image-size="80" description="今日日志尚未填写">
                  <el-button type="primary" @click="openAddLogDialog">立即填写</el-button>
                </el-empty>
                <div v-else class="list-item">
                  <div class="item-header">
                    <el-tag size="small" :type="getLogTypeTag(todayLog.type)">{{ todayLog.typeText }}</el-tag>
                    <el-button type="text" icon="edit" @click="editTodayLog"></el-button>
                  </div>
                  <div class="item-content">
                    <div class="memo-content log-content" v-html="todayLog.content"></div>
                    <p class="item-info">
                      <span>日期: {{ todayLog.logDateStr }}</span>
                      <span>创建: {{ formatDateTime(todayLog.createTime) }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </template>
  </Layout>

  <!-- 工作日志对话框 -->
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

  <!-- 查看完整备忘对话框 -->
  <el-dialog
      v-model="viewMemoDialogVisible"
      title="备忘详情"
      width="800px"
      destroy-on-close
      :modal-append-to-body="false"
      class="custom-dialog"
      center
  >
    <div class="detail-content">
      <p class="detail-date"><strong>日期：</strong>{{ selectedMemo.memoDate }}</p>
      <div class="detail-text"><strong>内容：</strong></div>
      <div class="detail-html-content" v-html="selectedMemo.content"></div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="viewMemoDialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import Layout from "@/components/Layout.vue"
import { Files, Warning, Calendar, Check, View, Edit } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import { useIssueStore } from '@/stores/issue'
import { useWorkLogStore } from '@/stores/workLog'
import { useWorkMemoStore } from '@/stores/workMemo'
import { useDashboardStore } from '@/stores/dashboard'
import { ElMessage } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import router from "@/router";

// 初始化store
const taskStore = useTaskStore()
const issueStore = useIssueStore()
const workLogStore = useWorkLogStore()
const workMemoStore = useWorkMemoStore()
const dashboardStore = useDashboardStore()

// 加载状态
const loading = ref(false)
const taskLoading = ref(false)
const issueLoading = ref(false)
const memoLoading = ref(false)
const logLoading = ref(false)

// 仪表盘统计数据
const dashboardStats = ref([
  { label: '未完成任务', value: '0', icon: Files, color: '#409EFF' },
  { label: '未解决问题', value: '0', icon: Warning, color: '#E6A23C' },
  { label: '今日工时', value: '0h', icon: Calendar, color: '#67C23A' },
  { label: '今日日志', value: '0', icon: Check, color: '#c2cd61' },
])

// 列表数据
const tasks = ref([])
const issues = ref([])
const memos = ref([])
const todayLog = ref(null)

// 对话框控制
const logDialogVisible = ref(false)
const isEditing = ref(false)
const viewMemoDialogVisible = ref(false)
const selectedMemo = ref({
  id: '',
  title: '',
  content: '',
  memoDate: null,
  createTime: null
})

// 日志表单
const logFormRef = ref(null)
const logForm = reactive({
  id: null,
  logDate: new Date(),
  type: 1,
  content: ''
})

// 表单校验规则
const logRules = {
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

// 获取仪表盘数据
const fetchDashboardStats = async () => {
  loading.value = true
  try {
    const stats = await dashboardStore.getDashboardStatsAction()

    // 更新仪表盘卡片数据
    dashboardStats.value[0].value = stats.unfinishedTasks.toString()
    dashboardStats.value[1].value = stats.unresolvedIssues.toString()
    dashboardStats.value[2].value = `${stats.todayHours}h`
    dashboardStats.value[3].value = getHasTodayLogText(stats.hasTodayLog)
  } catch (error) {
    ElMessage.error('获取仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 获取任务列表
const fetchTasks = async () => {
  taskLoading.value = true
  try {
    tasks.value = await taskStore.getCurrentUserTasksAction()
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    taskLoading.value = false
  }
}

// 获取问题列表
const fetchIssues = async () => {
  issueLoading.value = true
  try {
    issues.value = await issueStore.getCurrentUserIssuesAction()
  } catch (error) {
    ElMessage.error('获取问题列表失败')
  } finally {
    issueLoading.value = false
  }
}

// 获取工作备忘
const fetchMemos = async () => {
  memoLoading.value = true
  try {
    memos.value = await workMemoStore.getWorkMemoListAction()
  } catch (error) {
    ElMessage.error('获取工作备忘失败')
  } finally {
    memoLoading.value = false
  }
}

// 获取今日工作日志
const fetchTodayLog = async () => {
  logLoading.value = true
  try {
    todayLog.value = await workLogStore.getTodayLogAction()
  } catch (error) {
    ElMessage.error('获取今日工作日志失败')
  } finally {
    logLoading.value = false
  }
}

// 获取任务状态类型
const getTaskStatusType = (status: number) => {
  const typeMap = {
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'warning',
    5: 'danger',
  }
  return typeMap[status] || 'info'
}

// 获取问题状态类型
const getIssueStatusType = (status) => {
  const typeMap = {
    1: 'info',     // 已分派
    2: 'primary',  // 处理中
    3: 'success',  // 已解决
    4: 'warning',  // 已暂停
    5: 'danger'    // 已关闭
  }
  return typeMap[status] || 'info'
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


// 获取是否有今日日志文本
const getHasTodayLogText = (type: number | string): string => {
  const typeMap: Record<string, string> = {
    true: '已填写',
    false: '未填写'
  }

  return typeMap[type as string] || 'info'
}

// 截断内容
const truncateContent = (content: string, length = 80) => {
  if (!content) return ''

  // 创建临时DOM元素来去除HTML标签
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content
  const textContent = tempDiv.textContent || tempDiv.innerText || ''

  return textContent.length > length
      ? textContent.slice(0, length) + '...'
      : textContent
}

// 查看完整备忘
const viewFullMemo = (memo) => {
  selectedMemo.value = memo
  viewMemoDialogVisible.value = true
}

// 打开添加日志对话框
const openAddLogDialog = () => {
  isEditing.value = false
  logForm.id = null
  logForm.logDate = new Date()
  logForm.type = 1
  logForm.content = ''
  logDialogVisible.value = true
}

// 编辑今日日志
const editTodayLog = () => {
  if (!todayLog.value) return

  isEditing.value = true
  logForm.id = todayLog.value.id
  logForm.logDate = new Date(todayLog.value.logDate)
  logForm.type = todayLog.value.type
  logForm.content = todayLog.value.content
  logDialogVisible.value = true
}

// 提交日志
const submitLog = async () => {
  if (!logFormRef.value) return

  await logFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditing.value && logForm.id) {
          await workLogStore.updateWorkLogAction(logForm)
        } else {
          await workLogStore.createWorkLogAction(logForm)
        }

        logDialogVisible.value = false
        await fetchTodayLog()
        // 更新仪表盘统计
        await fetchDashboardStats()
      } catch (error) {
        ElMessage.error('提交日志失败')
      }
    }
  })
}

// 查看任务详情
const viewTask = (taskId) => {
  if (taskId === 0) return
  router.push(`/task/${taskId}`)
}

// 查看问题详情
const viewIssue = (issueId) => {
  if (issueId === 0) return
  router.push(`/issue/${issueId}`)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未设置'

  if (typeof date === 'string') {
    // 如果是ISO格式的字符串，转换为Date对象
    date = new Date(date)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '未设置'

  if (typeof dateTime === 'string') {
    // 如果是ISO格式的字符串，转换为Date对象
    dateTime = new Date(dateTime)
  }

  const year = dateTime.getFullYear()
  const month = String(dateTime.getMonth() + 1).padStart(2, '0')
  const day = String(dateTime.getDate()).padStart(2, '0')
  const hours = String(dateTime.getHours()).padStart(2, '0')
  const minutes = String(dateTime.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 页面加载时获取数据
onMounted(async () => {
  // 并行加载所有数据
  await Promise.all([
    fetchTasks(),
    fetchIssues(),
    fetchMemos(),
    fetchTodayLog(),
    fetchDashboardStats()
  ])
})
</script>

<style scoped>
/* 主容器样式 */
.main-content {
  padding: 0 20px 20px 20px;
  background-color: #f6f8fa;
  min-height: calc(100vh - 64px);
}

/* 统计卡片样式 */
.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  border-radius: 8px;
  height: 100px;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.stat-info {
  margin-left: 16px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-top: 4px;
}

/* 列表卡片样式 */
.content-row {
  margin-bottom: 20px;
}

.list-card-1 {
  height: 390px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.list-card-2 {
  height: 350px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.list-card-1:hover, .list-card-2:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

/* 滚动内容区域样式 */
.scrollable-content {
  max-height: 300px;
  overflow-y: auto;
}

/* 自定义滚动条 */
.scrollable-content::-webkit-scrollbar {
  width: 2px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #909399;
}

/* 列表项样式 */
.list-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.item-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #000000;
  line-height: 1.4;
}

.item-content h4 a {
  color: #000000;
  text-decoration: none;
}

.item-content h4 a:hover {
  text-decoration: underline;
}

.item-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin: 8px 0 0 0;
}

.memo-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  margin: 4px 0;
}

.log-content {
  max-height: 150px;
  overflow-y: auto;
  padding: 8px 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* 备忘详情样式 */
.detail-content {
  padding: 0 20px;
}

.detail-content h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.detail-date {
  margin-bottom: 12px;
  color: #606266;
}

.detail-text {
  color: #606266;
  margin-bottom: 10px;
}

.detail-html-content {
  color: #606266;
  line-height: 1.6;
  max-height: 350px;
  overflow-y: auto;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.detail-html-content :deep(p) {
  margin: 8px 0;
}

.detail-html-content :deep(img) {
  max-width: 100%;
  height: auto;
}

/* 白色背景输入框 */
.white-bg-input :deep(.el-input__wrapper) {
  background-color: white;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.white-bg-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

/* 富文本编辑器自定义样式 */
:deep(.log-editor) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.ql-container) {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 暗色主题适配 */
:deep(.dark) {
  .main-content {
    background-color: #1a1a1a;
  }

  .stats-card,
  .list-card-1,
  .list-card-2 {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title {
    color: #ffffff;
  }

  .list-item {
    background-color: #363636;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border-color: #4a4a4a;
  }

  .item-content h4 {
    color: #e5e7eb;
  }

  .item-content h4 a {
    color: #60a5fa;
  }

  .memo-content {
    color: #a0a0a0;
  }

  .log-content {
    background-color: #2d2d2d;
  }

  .stat-label {
    color: #a0a0a0;
  }

  .scrollable-content::-webkit-scrollbar-track {
    background: #2d2d2d;
  }

  .scrollable-content::-webkit-scrollbar-thumb {
    background: #666;
  }
}

/* 响应式布局调整 */
@media screen and (max-width: 768px) {
  .main-content {
    padding: 10px;
  }

  .stats-card {
    margin-bottom: 10px;
  }

  .list-card-1, .list-card-2 {
    height: auto;
    min-height: 350px;
    margin-bottom: 20px;
  }

  .stat-content {
    padding: 0 10px;
  }

  .stat-info {
    margin-left: 12px;
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>