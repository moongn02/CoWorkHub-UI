<template>
  <el-header class="header">
    <div class="header-content">
      <div class="header-left">
        <el-input
            v-model="searchQuery"
            placeholder="搜索..."
            prefix-icon="Search"
            class="header-search"
        />
        <el-button
            type="primary"
            plain
            @click="handleSearch"
            class="search-button"
        >GO</el-button>
      </div>
      <div class="header-right">
        <div class="date-display">
          <span class="date-text">{{ dateText }}</span>
          <span class="week-text">{{ weekText }}</span>
        </div>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')
// 搜索处理函数
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('搜索内容:', searchQuery.value)
    // 这里添加你的搜索逻辑
  }
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
</script>


<style scoped>
.header {
  background-color: #2d2d2d;
  padding: 0;
  height: 60px !important;
  width: 100%;
  box-sizing: border-box;
}

.header-content {
  max-width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.search-button {
  height: 36px;
  padding: 0 15px;
  border: 1px solid #404040;
  background-color: transparent;
  color: #bfbfbf;
  cursor: pointer;
  transition: all 0.3s;
}

.search-button:hover {
  border-color: #409EFF;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.search-button:active {
  transform: scale(0.98);
}

.header-left :deep(.el-button) {
  height: 36px;
  padding: 0 15px;
  border: 1px solid #404040;
  background-color: transparent;
  color: #bfbfbf;
  cursor: pointer;
  z-index: 1;
  position: relative;
}

.header-left :deep(.el-button:hover) {
  border-color: #409EFF;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.header-left :deep(.el-button:active) {
  transform: scale(0.98);
}

.header-right {
  display: flex;
  align-items: center;
  padding-right: 10px;
}

.date-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
}

.date-text {
  color: #bfbfbf;
  font-size: 14px;
  line-height: 1.4;
}

.week-text {
  color: #808080;
  font-size: 12px;
  line-height: 1.4;
}
</style>