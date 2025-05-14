<template>
  <div class="page-403">
    <div class="error-container">
      <h1>403</h1>
      <h2>权限不足</h2>
      <p>抱歉，您没有权限访问此页面</p>
      <el-button type="primary" @click="goBack">返回</el-button>
      <el-button @click="goHome">回到首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.page-403 {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.error-container {
  text-align: center;
}

h1 {
  font-size: 72px;
  color: #f56c6c;
  margin-bottom: 10px;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

p {
  margin-bottom: 20px;
  color: #606266;
}
</style>