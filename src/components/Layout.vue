<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <SideMenu :is-collapse="isCollapse" @toggle-collapse="toggleCollapse" />

    <el-container class="right-container">
      <!-- 头部导航 -->
      <HeaderNav
          v-model:search-text="searchQuery"
          @search="handleSearch"
      />

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <!-- 具名插槽 -->
        <slot name="content"></slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SideMenu from './SideMenu.vue'
import HeaderNav from './HeaderNav.vue'

const isCollapse = ref(false)
const searchQuery = ref('')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleSearch = () => {
  console.log('Searching:', searchQuery.value)
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
  display: flex;
  overflow: hidden;
}

:deep(.el-aside) {
  background-color: #2d2d2d;
  width: auto !important;
  flex-shrink: 0;
  transition: width 0.3s;
  border-right: 2px solid rgba(255, 255, 255, 0.1);
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f6f8fa;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

:deep(.el-header) {
  padding: 0;
  height: 60px !important;
  background-color: #2d2d2d;
  /* 添加底部边框 */
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

/* 响应式处理 */
@media screen and (max-width: 768px) {
  :deep(.el-aside) {
    border-right: none;
  }
}
</style>