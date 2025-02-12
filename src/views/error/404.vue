<!-- src/views/error/404.vue -->
<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.content {
  text-align: center;
}

h1 {
  font-size: 72px;
  color: #409EFF;
  margin: 0;
  line-height: 1.2;
}

h2 {
  font-size: 24px;
  color: #303133;
  margin: 20px 0;
}

p {
  color: #606266;
  margin-bottom: 30px;
}
</style>
