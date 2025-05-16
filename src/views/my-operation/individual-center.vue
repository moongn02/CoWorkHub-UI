<template>
  <Layout>
    <template #content>
      <div class="personal-info-container">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">个人中心</h3>
              <el-button type="primary" @click="showEditDialog = true">修改信息</el-button>
            </div>
          </template>

          <div class="info-content">
            <!-- 基本信息部分 -->
            <div class="info-section">
              <h4 class="section-title">基本信息</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="账号">{{ userInfo.username }}</el-descriptions-item>
                <el-descriptions-item label="真实姓名">{{ userInfo.realName }}</el-descriptions-item>
                <el-descriptions-item label="手机">{{ userInfo.phone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
                <el-descriptions-item label="生日">{{ userInfo.birthday }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ userInfo.genderText }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 工作信息部分 -->
            <div class="info-section">
              <h4 class="section-title">工作信息</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="部门">{{ userInfo.deptText }}</el-descriptions-item>
                <el-descriptions-item label="直属上级">{{ userInfo.supervisor }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 安全设置部分 -->
            <div class="info-section">
              <h4 class="section-title">安全设置</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="修改密码">
                  <el-button v-if="hasPermission('individual:changePassword')"  type="primary" plain @click="showPasswordDialog = true">
                    修改密码
                  </el-button>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
      </div>
    </template>
  </Layout>

  <!-- 修改信息对话框 -->
  <el-dialog
      v-model="showEditDialog"
      title="修改个人信息"
      width="50%"
      destroy-on-close
  >
    <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
    >
      <!-- 基本信息 -->
      <h4 class="dialog-section-title">基本信息</h4>
      <el-form-item label="账号" prop="username">
        <el-input v-model="editForm.username" disabled />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="editForm.realName" />
      </el-form-item>
      <el-form-item label="手机" prop="phone">
        <el-input v-model="editForm.phone" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email" />
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker v-model="editForm.birthday" type="date" placeholder="选择日期" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="editForm.gender">
          <el-radio :label="0">男</el-radio>
          <el-radio :label="1">女</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">确认</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 修改密码对话框 -->
  <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
      destroy-on-close
  >
    <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
    >
      <el-form-item label="当前密码" prop="currentPassword">
        <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordChange">确认修改</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import {dayjs, type FormInstance, type FormRules} from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
const { hasPermission } = usePermissionCheck()

const userStore = useUserStore();
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const editFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

watch(showEditDialog, async (newValue) => {
  if (!newValue) {
    await fetchUserEditInfo();
  }
});

// 用户信息
const userInfo = reactive({
  username: '',
  realName: '',
  phone: '',
  email: '',
  birthday: '',
  gender: '',
  genderText: '',
  deptId: '',
  deptText: '',
  supervisor: null
})

// 编辑弹窗用户信息
const editUserInfo = reactive({
  username: '',
  realName: '',
  phone: '',
  email: '',
  birthday: '',
  gender: 0,
})

onMounted(() => {
  fetchUserInfo()
  fetchUserEditInfo()
})

// 获取用户信息
const fetchUserInfo = async () => {
  const response = await userStore.getUserInfoAction()
  if (response) {
    Object.assign(userInfo, response)
  }
}

// 获取编辑弹窗展示的用户信息
const fetchUserEditInfo = async () => {
  const response = await userStore.getEditUserInfoAction()
  if (response) {
    Object.assign(editForm, response)
  }
}

// 编辑表单数据
const editForm = reactive({ ...editUserInfo })

// 编辑表单验证规则
const editRules = reactive<FormRules>({
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  birthday: [
    { required: true, message: '请选择生日', trigger: 'change' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
})

// 编辑个人信息
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate()
  editForm.birthday = dayjs(editForm.birthday).format('YYYY-MM-DD');

  const result = await userStore.updateUserInfoAction(editForm)
  if (result) {
    showEditDialog.value = false
    await fetchUserInfo()
  }
}

// 密码表单数据
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const passwordRules = reactive<FormRules>({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 修改密码
const handlePasswordChange = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate()

  const passwordData = {
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword
  }

  const result = await userStore.changePasswordAction(passwordData)

  if (result) {
    showPasswordDialog.value = false
    // 重置密码表单
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  }
}
</script>

<style scoped>
.personal-info-container {
  padding: 20px;
  height: 100%;
}

.info-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-content {
  margin-top: 20px;
}

.info-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.dialog-section-title {
  margin: 20px 0 10px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__label) {
  width: 120px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .personal-info-container {
    padding: 10px;
  }

  .card-title {
    font-size: 16px;
  }

  :deep(.el-descriptions__label) {
    width: 100px;
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .info-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title,
  .section-title,
  .dialog-section-title {
    color: #e5e7eb;
  }

  :deep(.el-descriptions__label),
  :deep(.el-descriptions__content) {
    color: #a0a0a0;
  }

  :deep(.el-input__inner),
  :deep(.el-select .el-input__inner) {
    background-color: #363636;
    border-color: #4a4a4a;
    color: #e5e7eb;
  }
}
</style>