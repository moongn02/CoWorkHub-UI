<template>
  <div class="forgot-password">
    <el-card class="form-container">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="CoWorkHub Logo" class="logo" />
        <h2 class="title">CoWorkHub</h2>
      </div>
      <h3 class="subtitle">找回密码</h3>
      <p class="description">通过你的邮箱重置密码</p>

      <el-steps :active="activeStep" simple style="margin-bottom: 20px;">
        <el-step title="输入邮箱" />
        <el-step title="设置新密码" />
        <el-step title="完成" />
      </el-steps>

      <!-- 步骤1：输入邮箱 -->
      <template v-if="activeStep === 1">
        <el-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            label-position="top"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="emailForm.email" placeholder="请输入你所绑定的邮箱" />
          </el-form-item>
          <el-form-item class="verification-container">
            <el-input
                v-model="emailForm.code"
                placeholder="请输入验证码"
                class="verification-input"
                :maxlength="6"
            />
            <el-button
                @click="getVerificationCode"
                class="get-code-button"
                :disabled="countdown > 0 || !emailForm.email"
                :loading="sendingCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="submit-button" @click="validateEmail" :loading="validating">下一步</el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 步骤2：设置新密码 -->
      <template v-else-if="activeStep === 2">
        <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-position="top"
        >
          <el-form-item label="新密码" prop="newPassword">
            <el-input
                v-model="passwordForm.newPassword"
                placeholder="请输入新密码"
                type="password"
                show-password
            />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
                v-model="passwordForm.confirmPassword"
                placeholder="请再次输入新密码"
                type="password"
                show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="activeStep = 1" class="back-button">返回上一步</el-button>
            <el-button type="primary" class="submit-button" @click="resetPassword" :loading="resetting">确认修改</el-button>

          </el-form-item>
        </el-form>
      </template>

      <!-- 步骤3：完成 -->
      <template v-else-if="activeStep === 3">
        <div class="success-container">
          <el-icon class="success-icon" :size="64"><CircleCheckFilled /></el-icon>
          <h2>密码重置成功</h2>
          <p>您已成功重置密码，现在可以使用新密码登录了。</p>
          <el-button type="primary" class="submit-button" @click="goToLogin">前往登录</el-button>
        </div>
      </template>

      <div class="links">
        <router-link to="/login" class="link">返回登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { CircleCheckFilled } from '@element-plus/icons-vue';
import {useAuthStore} from "@/stores/auth";
import type {FormInstance, FormRules} from "element-plus";

const router = useRouter();
const activeStep = ref(1);
const countdown = ref(0);
const sendingCode = computed(() => authStore.loading)
const validating = ref(false);
const resetting = ref(false);
let countdownTimer: number | null = null;
const authStore = useAuthStore()

// 邮箱表单
const emailFormRef = ref<FormInstance>();
const emailForm = reactive({
  email: '',
  code: ''
});

// 密码表单
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

// 邮箱表单验证规则
const emailRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码应为6位数字', trigger: 'blur' }
  ]
};

// 密码表单验证规则
const passwordRules: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 验证邮箱和验证码
const validateEmail = async () => {
  if (!emailFormRef.value) return;

  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      validating.value = true;
      // 在实际应用中，这里应该有一个API调用来验证验证码是否正确
      // 由于我们在最后的重置密码步骤会做完整的验证，这里简化处理
      setTimeout(() => {
        validating.value = false;
        activeStep.value = 2;
      }, 500);
    }
  });
};

// 倒计时函数
const startCountdown = () => {
  countdown.value = 60;
  countdownTimer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1;
    } else {
      clearInterval(countdownTimer!);
      countdownTimer = null;
    }
  }, 1000);
};

// 获取验证码
const getVerificationCode = async () => {
  const success = await authStore.sendVerificationCodeAction(emailForm.email)
  if (success) {
    startCountdown()
  }
}

// 重置密码
const resetPassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      const success = await authStore.resetPasswordAction(
          emailForm.email,
          emailForm.code,
          passwordForm.newPassword
      )

      if (success) {
        activeStep.value = 3
      }
    }
  })
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};

// 组件卸载时清除计时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.forgot-password {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.form-container {
  width: 480px;
  padding: 40px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

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

.subtitle {
  text-align: center;
  margin-bottom: 16px;
}

.description {
  text-align: left;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.verification-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verification-input {
  flex: 1;
}

.get-code-button {
  min-width: 120px;
}

.links {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.link {
  color: #4086f4;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  height: 40px;
  background-color: #4086f4;
  border-color: #4086f4;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(64, 134, 244, 0.2);
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 134, 244, 0.3);
}

.back-button {
  margin-left: 12px;
  margin-bottom: 12px;
  width: 100%;
  height: 40px;
  transition: all 0.3s;
}

.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.success-icon {
  color: #4086f4;
  margin-bottom: 20px;
}

.success-container h2 {
  font-size: 24px;
  margin-bottom: 16px;
}

.success-container p {
  text-align: center;
  color: #666;
  margin-bottom: 24px;
}
</style>