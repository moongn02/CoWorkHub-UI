<template>
  <div class="forgot-password">
    <el-card class="form-container">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="CoWorkHub Logo" class="logo" />
        <h2 class="title">CoWorkHub</h2>
      </div>
      <h3 class="subtitle">找回密码</h3>
      <p class="description">通过你的手机号码重置密码，或邮箱重置密码</p>
      <el-form @submit.prevent="handleSubmit">
        <el-form-item>
          <el-input v-model="emailOrPhone" placeholder="账号" />
        </el-form-item>
        <el-form-item class="verification-container">
          <el-input v-model="verificationCode" placeholder="请输入验证码" class="verification-input" />
          <el-button @click="getVerificationCode" class="get-code-button">获取验证码</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-button" @click="handleSubmit">确认修改</el-button>
        </el-form-item>
      </el-form>
      <router-link to="/login" class="link">返回登录</router-link>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { sendVerificationCode } from '@/api/auth';

const emailOrPhone = ref('');
const verificationCode = ref('');
const router = useRouter();

const handleSubmit = async () => {
  // 处理下一步逻辑
  alert('确认修改逻辑处理');
  // 这里可以添加后续的密码重置逻辑
};

const getVerificationCode = async () => {
  try {
    await sendVerificationCode(emailOrPhone.value);
    alert('验证码已发送');
  } catch (error) {
    console.error(error);
  }
};
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
  margin-bottom: 40px;
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
  margin-bottom: 24px;
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
  margin-left: 10px;
}

.link {
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #007bff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.submit-button {
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
</style>
