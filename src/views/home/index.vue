<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-menu">
      <div class="logo-container">
        <img src="@/assets/logo.svg" :class="['logo', { 'logo-collapse': isCollapse }]" alt="CoWorkHub" />
        <h1 class="logo-text" v-show="!isCollapse">CoWorkHub</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#2d2d2d"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="1">
          <el-icon><House /></el-icon>
          <template #title>我的视图</template>
        </el-menu-item>

        <el-menu-item index="2">
          <el-icon><Plus /></el-icon>
          <template #title>创建任务</template>
        </el-menu-item>

        <el-menu-item index="3">
          <el-icon><Search /></el-icon>
          <template #title>搜索任务</template>
        </el-menu-item>

        <el-sub-menu index="4">
          <template #title>
            <el-icon><Aim /></el-icon>
            <span>问题管理</span>
          </template>
          <el-menu-item index="4-1">创建问题</el-menu-item>
          <el-menu-item index="4-2">搜索问题</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <el-icon><Operation /></el-icon>
            <span>我的操作</span>
          </template>
          <el-menu-item index="5-1">查看个人工时</el-menu-item>
          <el-menu-item index="5-2">编辑个人信息</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="6">
          <el-icon><Document /></el-icon>
          <template #title>工作日志</template>
        </el-menu-item>

        <el-sub-menu index="7">
          <template #title>
            <el-icon><User /></el-icon>
            <span>我的团队</span>
          </template>
          <el-menu-item index="7-1">查看团队工时</el-menu-item>
          <el-menu-item index="7-2">查看团队日志</el-menu-item>
          <el-menu-item index="7-3">成员管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="8">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>配置中心</span>
          </template>
          <el-menu-item index="8-1">项目管理</el-menu-item>
          <el-menu-item index="8-2">部门管理</el-menu-item>
          <el-menu-item index="8-3">权限管理</el-menu-item>
          <el-menu-item index="8-4">定时管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="9">
          <template #title>
            <el-icon><More /></el-icon>
            <span>其他</span>
          </template>
          <el-menu-item index="9-1">刷新缓存</el-menu-item>
          <el-menu-item index="9-2" @click="handleLogout">退出</el-menu-item>
        </el-sub-menu>
      </el-menu>
      <!-- 侧边栏收缩按钮 -->
      <div :class="['collapse-container', { 'collapse-container-collapsed': isCollapse }]">
        <el-icon class="collapse-btn" @click="toggleCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
    </el-aside>

    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索..."
            prefix-icon="Search"
            class="header-search"
          />
          <el-button type="primary" plain>GO</el-button>
        </div>
        <div class="header-right">
          <div class="date-display">
            <span class="date-text">{{ dateText }}</span>
            <span class="week-text">{{ weekText }}</span>
          </div>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="main-container">
        <div class="main-content">
          <!-- 任务单和问题单行 -->
          <el-row :gutter="20" class="content-row">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <el-card class="content-card task-card" shadow="hover">
                <template #header>
                  <h3 class="card-title">任务单</h3>
                </template>
                <el-table :data="tasks" style="width: 100%">
                  <el-table-column label="总数" width="80">
                    <template #default="scope">
                      <el-tag size="small">{{ scope.row.total }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="任务名称" />
                  <el-table-column prop="status" label="状态" width="100" />
                </el-table>
              </el-card>
            </el-col>

            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <el-card class="content-card issue-card" shadow="hover">
                <template #header>
                  <h3 class="card-title">问题单</h3>
                </template>
                <el-table :data="issues" style="width: 100%">
                  <el-table-column label="总数" width="80">
                    <template #default="scope">
                      <el-tag size="small">{{ scope.row.total }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="问题描述" />
                  <el-table-column prop="status" label="状态" width="100" />
                </el-table>
              </el-card>
            </el-col>
          </el-row>

          <!-- 工时仪表盘和工作日志行 -->
          <el-row :gutter="20" class="content-row">
            <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
              <el-card class="content-card dashboard-card" shadow="hover">
                <template #header>
                  <h3 class="card-title">个人工时仪表盘</h3>
                </template>
                <!-- 这里可以添加工时统计图表 -->
              </el-card>
            </el-col>

            <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
              <el-card class="content-card log-card" shadow="hover">
                <template #header>
                  <h3 class="card-title">工作日志</h3>
                </template>
                <!-- 这里可以添加工作日志列表 -->
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  House,
  Plus,
  Search,
  Aim,
  Operation,
  Document,
  User,
  Setting,
  More,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { logout } from '@/api/auth'

const router = useRouter()
const isCollapse = ref(false)
const activeMenu = ref('1')
const searchQuery = ref('')
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 优化日期显示
const dateText = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

const weekText = computed(() => {
  const date = new Date()
  return `星期${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}`
})

// 模拟数据
const tasks = ref([
  { total: 5, name: '开发任务', status: '进行中' },
  { total: 3, name: '测试任务', status: '待处理' },
])

const issues = ref([
  { total: 2, name: '系统Bug修复', status: '待解决' },
  { total: 1, name: '功能优化建议', status: '已处理' },
])

// 处理退出登录
const handleLogout = async () => {
  try {
    await logout()
    // 清除本地存储的 token
    localStorage.removeItem('coworkhub_token')
    // 显示退出成功消息
    ElMessage.success('退出成功')
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('退出失败:', error)
    ElMessage.error('退出失败，请重试')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside-menu {
  background-color: #2d2d2d;
  transition: width 0.3s;
  overflow: hidden;
  position: relative;
}

.logo-container {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d2d2d;
  padding: 0 16px;
  overflow: hidden;
  white-space: nowrap;
}

.logo {
  height: 32px;
  width: 32px;
  transition: all 0.3s;
}

.logo-collapse {
  height: 32px;
  width: 32px;
}

.logo-text {
  margin: 0 0 0 12px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  transition: opacity 0.3s;
  flex-shrink: 0;
}

.el-menu-vertical {
  border-right: none;
  background-color: #2d2d2d !important;
}

.el-menu-vertical :deep(.el-menu-item),
.el-menu-vertical :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  color: #bfbfbf !important;
}

.el-menu-vertical :deep(.el-menu-item:hover),
.el-menu-vertical :deep(.el-sub-menu__title:hover) {
  background-color: #363636 !important;
}

.el-menu-vertical :deep(.el-menu-item.is-active) {
  background-color: #363636 !important;
  color: #409EFF !important;
}

.header {
  background-color: #2d2d2d;
  height: 50px;
  line-height: 50px;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: none;
  position: relative;
}

.header::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 100%
  ),
  linear-gradient(
    to bottom,
    rgba(54, 54, 54, 0.1) 0%,
    rgba(54, 54, 54, 0.8) 50%,
    rgba(54, 54, 54, 0.1) 100%
  );
  box-shadow: -1px 0 1px rgba(0, 0, 0, 0.3);
}

.header-search {
  width: 300px;
}

.header-search :deep(.el-input__wrapper) {
  background-color: #363636;
  border: none;
  box-shadow: none !important;
}

.header-search :deep(.el-input__inner) {
  color: #bfbfbf;
  height: 32px;
}

.header-search :deep(.el-input__inner::placeholder) {
  color: #808080;
}

.header-search :deep(.el-input__prefix-inner i) {
  color: #808080;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left :deep(.el-button) {
  height: 32px;
  padding: 0 15px;
  border: 1px solid #404040;
  background-color: transparent;
  color: #bfbfbf;
}

.header-left :deep(.el-button:hover) {
  border-color: #409EFF;
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}

.date-text {
  color: #bfbfbf;
  font-size: 14px;
  font-weight: 400;
}

.week-text {
  color: #808080;
  font-size: 12px;
}

.collapse-container {
  position: absolute;
  bottom: 20px;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.collapse-container-collapsed {
  padding-right: 0;
  justify-content: center;
}

.collapse-btn {
  color: #bfbfbf;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-btn:hover {
  color: #409EFF;
}

.main-container {
  background-color: #f6f8fa;
  min-height: calc(100vh - 50px);
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.main-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-row {
  margin-bottom: 0;
  flex: 1;
}

.content-card {
  height: 100%;
  min-height: 300px;
  margin-bottom: 20px;
}

/* 响应式布局调整 */
@media screen and (max-width: 768px) {
  .main-container {
    padding: 10px;
  }

  .main-content {
    gap: 10px;
  }

  .content-card {
    margin-bottom: 10px;
    min-height: 250px;
  }

  .content-row {
    margin-bottom: 0;
  }
}

/* 平板尺寸响应式调整 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .content-card {
    min-height: 280px;
  }
}

/* 确保表格在小屏幕上也能正常显示 */
.content-card :deep(.el-table) {
  width: 100% !important;
}

.content-card :deep(.el-table__body-wrapper) {
  min-height: 150px;
}

/* 优化表格在小屏幕上的显示 */
@media screen and (max-width: 768px) {
  .content-card :deep(.el-table) {
    font-size: 12px;
  }

  .content-card :deep(.el-table .cell) {
    padding: 8px;
  }
}
</style>