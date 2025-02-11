<template>
  <Layout>
    <template #content>
      <div class="main-content">
        <!-- 任务单和问题单行 -->
        <el-row :gutter="20" class="content-row">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="content-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">任务单</h3>
                  <el-button type="text">查看更多</el-button>
                </div>
              </template>
              <el-table :data="taskList" style="width: 100%">
                <el-table-column label="总数" width="80">
                  <template #default="scope">
                    <el-tag size="small">{{ scope.row.id }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="任务名称" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-card class="content-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">问题单</h3>
                  <el-button type="text">查看更多</el-button>
                </div>
              </template>
              <el-table :data="issueList" style="width: 100%">
                <el-table-column label="总数" width="80">
                  <template #default="scope">
                    <el-tag size="small">{{ scope.row.id }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="title" label="问题描述" />
                <el-table-column prop="status" label="状态" width="100" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <!-- 工时仪表盘和工作日志行 -->
        <el-row :gutter="20" class="content-row">
          <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
            <el-card class="content-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">个人工时仪表盘</h3>
                </div>
              </template>
              <div class="dashboard-content">
                <!-- 这里可以添加工时统计图表 -->
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
            <el-card class="content-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3 class="card-title">工作日志</h3>
                  <el-button type="text">添加日志</el-button>
                </div>
              </template>
              <div class="log-content">
                <!-- 这里可以添加工作日志列表 -->
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Layout from "@/components/Layout.vue";

// 模拟数据
const taskList = ref([
  { id: 1, name: '开发任务', status: '进行中' },
  { id: 2, name: '测试任务', status: '待处理' },
])

const issueList = ref([
  { id: 1, title: '系统Bug修复', status: '待解决' },
  { id: 2, title: '功能优化建议', status: '已处理' },
])
</script>

<style scoped>
.main-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f6f8fa;
  /* 可以给主内容区域也添加圆角 */
  border-radius: 8px;
}

.content-row {
  margin-bottom: 0;
  flex: 1;
}

.content-card {
  height: 100%;
  min-height: 300px;
  margin-bottom: 20px;
  /* 为卡片添加圆角 */
  border-radius: 12px;
  /* 添加过渡效果 */
  transition: all 0.3s ease;
}

/* 为卡片添加悬停效果 */
.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 修改 element-plus 卡片的默认圆角 */
.content-card :deep(.el-card) {
  border-radius: 12px;
  overflow: hidden; /* 确保内容不会溢出圆角 */
}

/* 修改卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* 表格圆角处理 */
.content-card :deep(.el-table) {
  width: 100% !important;
  border-radius: 8px;
  overflow: hidden; /* 确保表格的圆角效果 */
}

/* 标签的圆角 */
.content-card :deep(.el-tag) {
  border-radius: 4px;
}

/* 按钮的圆角 */
.content-card :deep(.el-button) {
  border-radius: 6px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.dashboard-content,
.log-content {
  height: 300px;
  padding: 20px;
  border-radius: 8px; /* 为内容区域添加圆角 */
}

/* 响应式布局调整 */
@media screen and (max-width: 768px) {
  .main-content {
    gap: 10px;
  }

  .content-card {
    margin-bottom: 10px;
    min-height: 250px;
    /* 在移动端可以适当减小圆角 */
    border-radius: 8px;
  }

  .content-card :deep(.el-card) {
    border-radius: 8px;
  }

  .content-row {
    margin-bottom: 0;
  }

  .content-card :deep(.el-table) {
    font-size: 12px;
  }

  .content-card :deep(.el-table .cell) {
    padding: 8px;
  }
}

/* 平板尺寸响应式调整 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .content-card {
    min-height: 280px;
  }
}

/* 添加阴影效果 */
.content-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style>

