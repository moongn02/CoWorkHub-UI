<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <img src="@/assets/logo.svg" alt="logo" class="logo" />
        <h1 class="title">CoWorkHub</h1>
      </div>
      <h2 class="subtitle">注册</h2>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
      >
        <el-form-item prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="registerForm.password"
              placeholder="请输入密码"
              type="password"
              :prefix-icon="Lock"
              show-password
              size="large"
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              placeholder="请确认密码"
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
              class="register-button"
              @click="handleRegister"
              size="large"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login" class="login-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { RegisterData } from '@/types/auth'
import {useUserStore} from "@/stores/user";
const userStore = useUserStore()

interface RegisterFormData extends RegisterData {
  confirmPassword: string
}

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive<RegisterFormData>({
  username: '',
  password: '',
  confirmPassword: ''
})

// 自定义校验规则：确认密码
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate()
  loading.value = true

  const { confirmPassword, ...registerData } = registerForm
  await userStore.registerAction(registerData)
  loading.value = false
}
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;

  .register-box {
    width: 480px;
    padding: 50px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    .register-header {
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

    .register-form {
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

      .register-button {
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

    .register-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 24px;
      font-size: 16px;
      color: #606266;

      .login-link {
        margin-left: 8px;
        color: #4086f4;
        text-decoration: none;

        &:hover {
          color: #3476e4;
        }
      }
    }
  }
}

:deep(.el-form-item__content) {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .el-input__wrapper {
    box-shadow: none !important;
  }
}
</style>