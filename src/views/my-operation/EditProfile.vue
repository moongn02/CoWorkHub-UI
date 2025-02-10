<template>
  <el-container class="layout-container">
    <Sidebar />
    <el-container>
      <el-main class="main-container">
        <div class="edit-profile">
          <h2>编辑个人信息</h2>
          <el-form :model="form" ref="formRef" label-width="120px">
            <el-form-item label="账号">
              <el-input v-model="form.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="form.realName"></el-input>
            </el-form-item>
            <el-form-item label="邮件">
              <el-input v-model="form.email"></el-input>
            </el-form-item>
            <el-form-item label="手机">
              <el-input v-model="form.phone"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateProfile">保存</el-button>
              <el-button type="danger" @click="handleLogout">注销</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/auth'

const router = useRouter()
const searchQuery = ref('')

// 表单数据
const form = ref({
  username: 'user123', // 假设从后端获取的用户信息
  realName: '',
  email: '',
  phone: ''
})

// 更新个人信息
const updateProfile = async () => {
  // 这里可以调用 API 更新用户信息
  ElMessage.success('个人信息已更新！')
}

// 处理注销
const handleLogout = async () => {
  try {
    await logout()
    localStorage.removeItem('coworkhub_token')
    ElMessage.success('注销成功')
    router.push('/login')
  } catch (error) {
    console.error('注销失败:', error)
    ElMessage.error('注销失败，请重试')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
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
}

.main-container {
  background-color: #f6f8fa;
  padding: 20px;
}

.edit-profile {
  max-width: 600px;
  margin: 0 auto;
}

.edit-profile h2 {
  margin-bottom: 20px;
}
</style>