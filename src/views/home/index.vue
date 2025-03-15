<template>
  <Layout>
    <template #content>
      <div class="main-content">
        <!-- 顶部统计卡片 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" v-for="stat in dashboardStats" :key="stat.label">
            <el-card class="stats-card" shadow="hover">
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
                  <el-button type="primary" link>查看更多</el-button>
                </div>
              </template>
              <div class="scrollable-content">
                <div v-for="task in tasks" :key="task.id" class="list-item">
                  <div class="item-header">
                    <el-tag size="small" type="primary">{{ task.id }}</el-tag>
                    <el-tag size="small" :type="getStatusType(task.status)">{{ task.status }}</el-tag>
                  </div>
                  <div class="item-content">
                    <h4><a :href="task.url" target="_blank">{{ task.title }}</a></h4>
                    <p class="item-info">
                      <span>执行人: {{ task.executor }}</span>
                      <span>期望完成时间: {{ task.expectedDate }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 问题单 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="list-card-1" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">问题单</h3>
                  <el-button type="primary" link>查看更多</el-button>
                </div>
              </template>
              <div class="scrollable-content">
                <div v-for="issue in issues" :key="issue.id" class="list-item">
                  <div class="item-header">
                    <el-tag size="small" type="warning">{{ issue.id }}</el-tag>
                    <el-tag size="small" :type="getStatusType(issue.status)">{{ issue.status }}</el-tag>
                  </div>
                  <div class="item-content">
                    <h4><a :href="issue.url" target="_blank">{{ issue.title }}</a></h4>
                    <p class="item-info">
                      <span>执行人: {{ issue.executor }}</span>
                      <span>期望完成时间: {{ issue.expectedDate }}</span>
                    </p>
                  </div>
                </div>
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
                  <el-button type="primary" link>添加备忘</el-button>
                </div>
              </template>
              <div class="scrollable-content">
                <el-empty v-if="!memos.length" :image-size="80" description="暂无备忘" />
                <div v-else v-for="memo in memos" :key="memo.id" class="list-item">
                  <div class="item-header">
                    <h4>{{ memo.title }}</h4>
                    <el-button type="text" @click="viewFullMemo(memo)">
                      <el-icon><View /></el-icon>
                    </el-button>
                  </div>
                  <div class="item-content">
                    <p class="memo-content">{{ memo.content }}</p>
<!--                     truncateContent(memo.content)-->
                    <p class="item-info">
                      <span>记录时间: {{ memo.createTime }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 工作日志 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="list-card-2" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">今日工作日志</h3>
                  <el-button type="primary" link @click="openAddLogDialog">添加日志</el-button>
                </div>
              </template>
              <div class="scrollable-content">
                <el-empty v-if="!todayLog" :image-size="80" description="今日日志尚未填写">
                  <el-button type="primary" @click="openAddLogDialog">立即填写</el-button>
                </el-empty>
                <div v-else class="list-item">
                  <div class="item-content">
                    <h4>{{ todayLog.title }}</h4>
                    <p class="memo-content">{{ todayLog.content }}</p>
                    <p class="item-info">
                      <span>记录时间: {{ todayLog.createTime }}</span>
                      <span>工时: {{ todayLog.hours }}h</span>
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

  <!-- 添加工作日志对话框 -->
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

  <!-- 查看完整备忘对话框 -->
  <el-dialog v-model="viewMemoDialogVisible" :title="selectedMemo.title" width="30%">
    <p>{{ selectedMemo.content }}</p>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="viewMemoDialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Layout from "@/components/Layout.vue"
import { Files, Warning, Calendar, Check, View } from '@element-plus/icons-vue'
import axios from 'axios'

// 定义接口类型
interface Task {
  id: string
  title: string
  status: string
  executor: string
  expectedDate: string
  url: string
}

interface Issue {
  id: string
  title: string
  status: string
  executor: string
  expectedDate: string
  url: string
}

interface Memo {
  id: string
  title: string
  content: string
  createTime: string
}

interface Log {
  id: string
  title: string
  content: string
  createTime: string
  hours: number
}

// 仪表盘统计数据
const dashboardStats = ref([
  { label: '未完成任务', value: '0', icon: Files, color: '#409EFF' },
  { label: '未解决问题', value: '0', icon: Warning, color: '#E6A23C' },
  { label: '今日工作', value: '0h', icon: Calendar, color: '#67C23A' },
  { label: '本周工作', value: '0h', icon: Check, color: '#909399' },
])

// 列表数据
const tasks = ref<Task[]>([])
const issues = ref<Issue[]>([])
const memos = ref<Memo[]>([])
const todayLog = ref<Log | null>(null)

// 对话框控制
const addLogDialogVisible = ref(false)
const viewMemoDialogVisible = ref(false)
const selectedMemo = ref<Memo>({ id: '', title: '', content: '', createTime: '' })

// 日志表单
const logForm = ref({
  date: new Date(),
  type: '1',
  content: '',
  hours: 8,
})

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    const response = await axios.get('/api/dashboard/stats')
    const data = response.data
    dashboardStats.value[0].value = data.unfinishedTasks
    dashboardStats.value[1].value = data.unresolvedIssues
    dashboardStats.value[2].value = `${data.todayHours}h`
    dashboardStats.value[3].value = `${data.weekHours}h`
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  }
}

// 获取任务列表
const fetchTasks = async () => {
  try {
    const response = await axios.get('/api/tasks')
    tasks.value = response.data
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

// 获取问题列表
const fetchIssues = async () => {
  try {
    const response = await axios.get('/api/issues')
    issues.value = response.data
  } catch (error) {
    console.error('获取问题列表失败:', error)
  }
}

// 获取工作备忘
const fetchMemos = async () => {
  try {
    const response = await axios.get('/api/memos')
    memos.value = response.data
  } catch (error) {
    console.error('获取工作备忘失败:', error)
  }
}

// 获取今日工作日志
const fetchTodayLog = async () => {
  try {
    const response = await axios.get('/api/logs/today')
    todayLog.value = response.data
  } catch (error) {
    console.error('获取今日工作日志失败:', error)
  }
}

// 状态类型映射
const getStatusType = (status: string) => {
  const types = {
    '已过期': 'danger',
    '进行中': 'primary',
    '待处理': 'warning',
    '已完成': 'success',
    '待解决': 'warning',
    '已处理': 'success',
    '处理中': 'primary',
    '待验证': 'info'
  }
  return types[status] || 'info'
}

// // 截断内容
// const truncateContent = (content: string, length = 50) => {
//   return content.length > length ? content.slice(0, length) + '...' : content
// }

// 查看完整备忘
const viewFullMemo = (memo: Memo) => {
  selectedMemo.value = memo
  viewMemoDialogVisible.value = true
}

// 打开添加日志对话框
const openAddLogDialog = () => {
  addLogDialogVisible.value = true
}

// 提交日志
const submitLog = async () => {
  try {
    await axios.post('/api/logs', logForm.value)
    addLogDialogVisible.value = false
    await fetchTodayLog()
    // 重置表单
    logForm.value = {
      date: new Date(),
      type: '1',
      content: '',
      hours: 8,
    }
  } catch (error) {
    console.error('提交日志失败:', error)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchDashboardData(),
    fetchTasks(),
    fetchIssues(),
    fetchMemos(),
    fetchTodayLog()
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

.list-card-1:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.list-card-2:hover {
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
  color: #303133;
}

/* 滚动内容区域样式 */
.scrollable-content {
  max-height: 330px;
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
  color: #303133;
  line-height: 1.4;
}

.item-content h4 a {
  color: #409EFF;
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

/* 暗色主题适配 */
:deep(.dark) {
  .main-content {
    background-color: #1a1a1a;
  }

  .stats-card,
  .list-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title {
    color: #e5e7eb;
  }

  .list-item {
    background-color: #363636;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border-color: #4a4a4a;
  }

  .item-content h4,
  .memo-header h4 {
    color: #e5e7eb;
  }

  .item-content h4 a {
    color: #60a5fa;
  }

  .memo-content {
    color: #a0a0a0;
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

  .list-card {
    height: 350px;
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