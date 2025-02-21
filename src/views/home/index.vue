<template>
  <Layout>
    <template #content>
      <div class="main-content">
        <!-- 任务单和问题单行 -->
        <el-row :gutter="20" class="content-row-1">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="content-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">任务单</h3>
                  <el-button type="primary" link>查看更多</el-button>
                </div>
              </template>
              <div class="scrollable-content">
                <div v-for="task in taskList" :key="task.id" class="list-item">
                  <div class="item-header">
                    <el-tag size="small" type="primary">{{ task.id }}</el-tag>
                    <el-tag size="small" :type="getStatusType(task.status)">{{ task.status }}</el-tag>
                  </div>
                  <div class="item-content">
                    <h4>{{ task.name }}</h4>
                    <p class="item-info">
                      <span>执行人: {{ task.executor }}</span>
                      <span>期望完成时间: {{ task.expectedDate }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="content-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">问题单</h3>
                  <el-button type="primary" link>查看更多</el-button>
                </div>
              </template>
              <div class="scrollable-content">
                <div v-for="issue in issueList" :key="issue.id" class="list-item">
                  <div class="item-header">
                    <el-tag size="small" type="warning">{{ issue.id }}</el-tag>
                    <el-tag size="small" :type="getStatusType(issue.status)">{{ issue.status }}</el-tag>
                  </div>
                  <div class="item-content">
                    <h4>{{ issue.title }}</h4>
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

        <!-- 工时仪表盘和工作备忘行 -->
        <el-row :gutter="20" class="content-row-2">
          <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
            <el-card class="content-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">仪表盘</h3>
                </div>
              </template>
              <div class="dashboard-content">
                <div class="clock-section">
                  <div class="clock-display">
                    <div class="time">{{ currentTime }}</div>
                    <div class="date">{{ currentDate }}</div>
                  </div>
                </div>
                <el-row :gutter="20" class="stats-section">
                  <el-col :span="12">
                    <div class="stat-card today-stats">
                      <div class="stat-icon">
                        <el-icon><Calendar /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-label">今日工时</div>
                        <div class="stat-value">{{ todayHours }}h</div>
                        <div class="stat-progress">
                        </div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="stat-card week-stats">
                      <div class="stat-icon">
                        <el-icon><Calendar /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-label">本周工时</div>
                        <div class="stat-value">{{ weekHours }}h</div>
                        <div class="stat-progress">
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
            <el-card class="content-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">工作备忘</h3>
                  <el-button type="primary" link>添加备忘</el-button>
                </div>
              </template>
              <div class="scrollable-content">
                <div v-for="memo in memoList" :key="memo.id" class="list-item">
                  <div class="item-content">
                    <h4>{{ memo.title }}</h4>
                    <p class="memo-content">{{ memo.content }}</p>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Layout from "@/components/Layout.vue"
import { Calendar } from '@element-plus/icons-vue'


// 模拟数据
const taskList = ref([
  { id: '999', name: '[OBTIMES > OBTIMES(MES)-Android-EN', status: '已过期', executor: '黄梦玲', expectedDate: '2024-06-12' },
  { id: '913', name: '工作报告', status: '进行中', executor: '黄梦玲', expectedDate: '2024-06-12' },
  { id: '888', name: '系统优化任务', status: '待处理', executor: '张三', expectedDate: '2024-06-15' },
  { id: '777', name: '功能开发任务', status: '已完成', executor: '李四', expectedDate: '2024-06-10' },
  { id: '666', name: '性能优化', status: '进行中', executor: '王五', expectedDate: '2024-06-18' },
  { id: '555', name: '接口开发', status: '待处理', executor: '赵六', expectedDate: '2024-06-20' },
  { id: '777', name: '接口开发', status: '待处理', executor: '赵六', expectedDate: '2024-06-20' },
])

const issueList = ref([
  { id: 'ISS-001', title: '系统Bug修复', status: '待解决', executor: '张三', expectedDate: '2024-06-15' },
  { id: 'ISS-002', title: '功能优化建议', status: '已处理', executor: '李四', expectedDate: '2024-06-16' },
  { id: 'ISS-003', title: '性能问题', status: '处理中', executor: '王五', expectedDate: '2024-06-17' },
  { id: 'ISS-004', title: '界面显示异常', status: '待验证', executor: '赵六', expectedDate: '2024-06-18' },
  { id: 'ISS-005', title: '数据同步问题', status: '进行中', executor: '黄梦玲', expectedDate: '2024-06-19' },
  { id: 'ISS-006', title: '登录异常', status: '待处理', executor: '张三', expectedDate: '2024-06-20' },
])

const memoList = ref([
  { id: 1, date: '2024-06-12', title: '项目进度会议', content: '讨论项目milestone完成情况' },
  { id: 2, date: '2024-06-11', title: '代码评审', content: '评审新功能代码实现' },
  { id: 3, date: '2024-06-10', title: '团队会议', content: '讨论下周工作计划' },
  { id: 4, date: '2024-06-09', title: '需求分析', content: '分析新功能需求文档' },
  { id: 5, date: '2024-06-08', title: '技术讨论', content: '讨论新技术方案实现' },
  { id: 6, date: '2024-06-07', title: '项目复盘', content: '总结项目经验和问题' },
  { id: 7, date: '2024-06-11', title: '项目结束', content: '上线' },
])

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

// 时间相关
const currentTime = ref('')
const currentDate = ref('')
const todayHours = ref(6.5)
const weekHours = ref(32.5)

const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentDate.value = `${year}年${month}月${day}日 ${weekdays[now.getDay()]}`
}

let timer: number

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.main-content {
  padding: 20px;
  background-color: #f6f8fa;
  border-radius: 8px;
}

.content-row-2 {
  margin-top: 20px;
}

.content-card {
  height: 385px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.content-card:hover {
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

.scrollable-content {
  max-height: 290px;
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

.list-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

.item-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.memo-content {
  font-size: 13px;
  color: #606266;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.dashboard-content {
  padding: 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;
}

.stat-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #909399;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #409EFF;
}

/* 暗色主题适配 */
:deep(.dark) {
  .main-content {
    background-color: #1a1a1a;
  }

  .content-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title {
    color: #e5e7eb;
  }

  .list-item {
    background-color: #363636;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .item-content h4 {
    color: #e5e7eb;
  }

  .item-info {
    color: #909399;
  }

  .memo-content {
    color: #a0a0a0;
  }

  .stat-card {
    background-color: #363636;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .stat-card h4 {
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

  .content-card {
    height: 350px;
    margin-bottom: 10px;
  }

  .stat-card {
    margin-bottom: 10px;
  }
}

.dashboard-content {
  padding: 20px;
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.clock-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.clock-display {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #409EFF 0%, #36cfc9 100%);
  color: white;
  width: 100%;
  max-width: 300px;
}

.clock-display .time {
  font-size: 36px;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.clock-display .date {
  font-size: 14px;
  opacity: 0.9;
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: 120px;
}

.stat-icon {
  background: rgba(64, 158, 255, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon :deep(.el-icon) {
  font-size: 24px;
  color: #409EFF;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-progress :deep(.el-progress-bar__outer) {
  background-color: #e9ecef;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  min-width: 35px;
}

.work-schedule {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.schedule-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.schedule-label {
  font-size: 13px;
  color: #909399;
}

.schedule-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.schedule-divider {
  width: 1px;
  height: 40px;
  background-color: #e4e7ed;
}

/* Dark theme adjustments */
:deep(.dark) {
  .stat-card {
    background-color: #363636;
  }

  .stat-icon {
    background: rgba(64, 158, 255, 0.2);
  }

  .stat-value {
    color: #e5e7eb;
  }

  .work-schedule {
    background-color: #363636;
  }

  .schedule-value {
    color: #e5e7eb;
  }

  .schedule-divider {
    background-color: #4a4a4a;
  }

  .stat-progress :deep(.el-progress-bar__outer) {
    background-color: #4a4a4a;
  }
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .clock-display {
    max-width: 100%;
  }

  .clock-display .time {
    font-size: 28px;
  }

  .stat-card {
    height: auto;
    padding: 15px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 20px;
  }

  .work-schedule {
    flex-direction: column;
    gap: 15px;
  }

  .schedule-divider {
    width: 100%;
    height: 1px;
  }
}
</style>