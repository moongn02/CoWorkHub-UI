<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="logo" class="logo">
        <h1 class="title">CoWorkHub</h1>
      </div>
      <h2 class="subtitle">登录</h2>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="账号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            type="password"
            :prefix-icon="Lock"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click="handleLogin"
            size="large"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <router-link to="/forgot-password" class="forgot-password">忘记密码？</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginData } from '@/types/auth'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginData>({
  username: '',
  password: ''
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // await loginFormRef.value.validate()
    // loading.value = true

    await userStore.loginAction(loginForm)
    ElMessage.success('登录成功');
    router.push({ name: 'HomePage' });
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;

  .login-box {
    width: 480px;
    padding: 50px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      .logo {
        width: 64px;
        height: 64px;
      }

      .title {
        margin: 20px 0 0;
        font-size: 28px;
        color: #333;
        font-weight: 500;
      }
    }

    .subtitle {
      margin: 0 0 32px;
      font-size: 24px;
      color: #333;
      text-align: center;
    }

    .login-form {
      :deep(.el-input__wrapper) {
        background-color: #f5f7fa;
        border: 1px solid #dcdfe6;
        transition: all 0.3s;

        &:hover {
          border-color: #c0c4cc;
        }

        &.is-focus {
          border-color: #4086f4;
          box-shadow: 0 0 0 1px #4086f4 !important;
        }
      }

      .el-form-item {
        margin-bottom: 24px;
      }

      .login-button {
        width: 100%;
        height: 48px;
        font-size: 18px;
        background-color: #4086f4;
        border-color: #4086f4;
        transition: all 0.3s;
        box-shadow: 0 2px 6px rgba(64, 134, 244, 0.2);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(64, 134, 244, 0.3);
        }

        &:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(64, 134, 244, 0.2);
        }
      }
    }

    .login-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;

      .forgot-password {
        color: #4086f4;
        text-decoration: none;
        font-size: 16px;

        &:hover {
          color: #3476e4;
        }
      }
    }
  }
}

:deep(.el-form-item__content) {
  .el-input__wrapper {
    box-shadow: none !important;
  }
}
</style>