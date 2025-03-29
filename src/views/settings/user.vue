<template>
  <Layout>
    <template #content>
      <div class="user-management-container">
        <el-card class="user-card" shadow="hover">
          <template #header>
            <div class="user-header">
              <h3 class="card-title">用户管理</h3>
              <div class="header-buttons">
                <el-button type="danger" @click="batchDeleteUsers" :disabled="selectedUsers.length === 0">批量删除</el-button>
                <el-button type="primary" @click="showAddUserModal">添加用户</el-button>
              </div>
            </div>
          </template>

          <!-- User search -->
          <div class="user-actions">
            <el-cascader
                v-model="departmentFilter"
                :options="departmentTreeData"
                placeholder="所属部门"
                clearable
                filterable
                :props="{
                  checkStrictly: true,
                  label: 'name',
                  value: 'id',
                  emitPath: false
                }"
                class="white-bg-input"
            >
              <template #default="{ node, data }">
                <div @click="handleOptionClickSearch(node, data)">
                  {{ data.name }}
                </div>
              </template>
            </el-cascader>
            <el-select v-model="roleFilter" placeholder="角色" class="white-bg-input" clearable>
              <el-option label="全部" value="" />
              <el-option
                  v-for="role in roles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
              />
            </el-select>
            <el-select v-model="statusFilter" placeholder="用户状态" class="white-bg-input" clearable>
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-input
                v-model="searchKeyword"
                placeholder="搜索用户关键词"
                class="white-bg-input"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>

          <!-- User table -->
          <el-table
              :data="userList"
              style="width: 100%"
              v-loading="loading"
              @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" min-width="120" />
            <el-table-column prop="realName" label="真实姓名" min-width="120" />
            <el-table-column prop="role" label="角色" min-width="120" />
            <el-table-column prop="deptText" label="部门" min-width="120" />
            <el-table-column prop="genderText" label="性别" width="80"/>
            <el-table-column prop="email" label="邮箱地址" min-width="180" />
            <el-table-column prop="phone" label="电话号码" min-width="120" />
            <el-table-column prop="birthday" label="出生日期" min-width="120" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="320" fixed="right">
              <template #default="scope">
                <el-button type="success" @click="assignRole(scope.row)" icon="Setting" circle title="分配角色" />
                <el-button type="info" @click="resetPassword(scope.row)" icon="Key" circle title="重置密码" />
                <el-button type="primary" @click="viewUser(scope.row)" icon="View" circle title="查看" />
                <el-button
                    :type="scope.row.status === 1 ? 'danger' : 'success'"
                    @click="toggleUserStatus(scope.row)"
                    :icon="scope.row.status === 1 ? 'CircleClose' : 'Check'"
                    circle
                    :title="scope.row.status === 1 ? '禁用' : '启用'"
                />
                <el-button type="warning" @click="editUser(scope.row)" icon="Edit" circle title="编辑" />
                <el-button type="danger" @click="deleteUser(scope.row)" icon="Delete" circle title="删除" />
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination -->
          <div class="pagination-container">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 15, 20]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </template>
  </Layout>

  <!-- Add/Edit User Modal -->
  <el-dialog
      v-model="userModalVisible"
      :title="isEditing ? '编辑用户' : '添加用户'"
      width="40%"
      center
  >
    <el-form :model="userForm" label-width="120px" :rules="formRules" ref="userFormRef">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="userForm.realName" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="!isEditing">
        <el-input v-model="userForm.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="角色" prop="roleId">
        <el-select v-model="userForm.roleId" placeholder="请选择角色" filterable>
          <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属部门" prop="deptId">
        <el-cascader
            v-model="userForm.deptId"
            :options="departmentTreeData"
            placeholder="请选择所属部门"
            clearable
            filterable
            :props="{
              checkStrictly: true,
              label: 'name',
              value: 'id',
              emitPath: false
            }"
            class="white-bg-input"
        >
          <template #default="{ node, data }">
            <div @click="handleOptionClickSave(node, data)">
              {{ data.name }}
            </div>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="userForm.gender">
          <el-option label="男" :value="0" />
          <el-option label="女" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="邮箱地址" prop="email">
        <el-input v-model="userForm.email" type="email" />
      </el-form-item>
      <el-form-item label="电话号码" prop="phone">
        <el-input v-model="userForm.phone" />
      </el-form-item>
      <el-form-item label="出生日期" prop="birthday">
        <el-date-picker
            v-model="userForm.birthday"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="用户状态" prop="status">
        <el-select v-model="userForm.status">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="userModalVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- Assign Role Modal -->
  <el-dialog
      v-model="assignRoleModalVisible"
      title="分配角色"
      width="30%"
      center
  >
    <div v-if="selectedUser" class="assign-role-content">
      <h4>当前用户：{{ selectedUser.username }}</h4>
      <el-form :model="assignRoleForm" label-width="100px">
        <el-form-item label="选择角色">
          <el-select v-model="assignRoleForm.roleId" placeholder="请选择角色" filterable>
            <el-option
                v-for="role in roles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="assignRoleModalVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAssignedRole">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- View User Modal -->
  <el-dialog
      v-model="viewUserModalVisible"
      title="用户详情"
      width="40%"
      center
      class="user-detail-dialog"
  >
    <div v-if="selectedUser" class="user-detail-content">
      <div class="detail-item">
        <span class="detail-label">用户ID：</span>
        <span class="detail-value">{{ selectedUser.id }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">用户名：</span>
        <span class="detail-value">{{ selectedUser.username }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">真实姓名：</span>
        <span class="detail-value">{{ selectedUser.realName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">角色：</span>
        <span class="detail-value">{{ selectedUser.roleName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">部门：</span>
        <span class="detail-value">{{ selectedUser.deptText }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">性别：</span>
        <span class="detail-value">
          {{ selectedUser.gender === 1 ? '男' : selectedUser.gender === 2 ? '女' : '未知' }}
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">邮箱地址：</span>
        <span class="detail-value">{{ selectedUser.email }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">电话号码：</span>
        <span class="detail-value">{{ selectedUser.phone }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">出生日期：</span>
        <span class="detail-value">{{ selectedUser.birthday }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">用户状态：</span>
        <span class="detail-value">
          <el-tag :type="selectedUser.status === 1 ? 'success' : 'danger'" size="small">
            {{ selectedUser.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useRoleStore } from '@/stores/role'
import { useDeptStore } from '@/stores/department'

// 使用状态管理
const userStore = useUserStore()
const roleStore = useRoleStore()
const deptStore = useDeptStore()

// 表单引用
const userFormRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  deptId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' }
  ]
}

// 分页和筛选相关
const currentPage = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')
const searchKeyword = ref('')
const roleFilter = ref('')
const departmentFilter = ref('')

// 计算属性：获取用户列表和总数
const userList = computed(() => userStore.userList)
const total = computed(() => userStore.pagination.total)
const loading = computed(() => userStore.loading)

// 角色和部门数据
const roles = computed(() => roleStore.roleList)

// 多选相关
const selectedUsers = ref([])
const departmentTreeData = ref([])

// User modal related refs
const userModalVisible = ref(false)
const assignRoleModalVisible = ref(false)
const viewUserModalVisible = ref(false)
const isEditing = ref(false)

interface User {
  id: number | null;
  username: string;
  password: string;
  realName: string;
  email: string;
  phone: string;
  deptId: number | null;
  deptText?: string;
  gender: number;
  genderText?: string;
  birthday: string;
  roleId: number | null;
  roleName?: string;
  status: number;
}

// 修改用户表单的初始化
const userForm = reactive<User>({
  id: null,
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  deptId: null,
  gender: 0,
  birthday: '',
  roleId: null,
  status: 1
})
const selectedUser = ref<User | null>(null)

// 初始化加载数据
onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    fetchRoles(),
    fetchDepartmentTree()
  ])
})

const handleOptionClickSearch = (node, data) => {
  departmentFilter.value = data.id;
};

const handleOptionClickSave = (node, data) => {
  userForm.deptId = data.id;
};

// 分配角色表单
const assignRoleForm = reactive({
  roleId: null
})

// 获取用户列表
const fetchUsers = async () => {
  const query = {
    status: statusFilter.value !== '' ? statusFilter.value : undefined,
    keyword: searchKeyword.value || undefined,
    roleId: roleFilter.value || undefined,
    deptId: departmentFilter.value || undefined
  }
  await userStore.getPagingUserListAction(currentPage.value, pageSize.value, query)
}

// 获取角色列表
const fetchRoles = async () => {
  await roleStore.getAllRolesAction()
}

// 获取部门树
const fetchDepartmentTree = async () => {
  departmentTreeData.value = await deptStore.getDepartmentTreeAction()
}

// 处理分页变化
const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await fetchUsers()
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  await fetchUsers()
}

// 搜索用户
const handleSearch = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchUsers()
}

// 重置搜索条件
const resetSearch = async () => {
  searchKeyword.value = ''
  statusFilter.value = ''
  roleFilter.value = ''
  departmentFilter.value = ''
  currentPage.value = 1
  await fetchUsers()
}

// 处理表格多选
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 批量删除用户
const batchDeleteUsers = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const userIds = selectedUsers.value.map(user => user.id)
    const success = await userStore.batchDeleteUsersAction(userIds)
    if (success) {
      ElMessage.success(`已成功删除 ${selectedUsers.value.length} 个用户`)
      selectedUsers.value = []
      await fetchUsers() // 刷新数据
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 显示添加用户模态框
const showAddUserModal = () => {
  isEditing.value = false
  userForm.id = null
  userForm.username = ''
  userForm.password = ''
  userForm.realName = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.deptId = null
  userForm.gender = 0
  userForm.birthday = ''
  userForm.roleId = null
  userForm.status = 1 // 默认启用，值为1
  userModalVisible.value = true
}

// 编辑用户
const editUser = (user: User) => {
  isEditing.value = true
  Object.assign(userForm, {
    id: user.id,
    username: user.username,
    realName: user.realName,
    email: user.email,
    phone: user.phone,
    deptId: user.deptId,
    gender: user.gender,
    birthday: user.birthday,
    roleId: user.roleId,
    status: user.status
  })
  userModalVisible.value = true
}

// 查看用户详情
const viewUser = (user: User) => {
  selectedUser.value = user
  viewUserModalVisible.value = true
}

// 分配角色
const assignRole = (user: User) => {
  selectedUser.value = user
  assignRoleForm.roleId = user.roleId
  assignRoleModalVisible.value = true
}

// 重置密码 - 重置为默认密码
const resetPassword = (user: User) => {
  ElMessageBox.confirm(
      `确定要将用户"${user.username}"的密码重置为默认密码吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await userStore.resetUserPasswordAction(user.id)
    if (success) {
      ElMessage.success('密码已重置为默认密码')
    }
  }).catch(() => {
  })
}

// 切换用户状态（启用/禁用）
const toggleUserStatus = (user: User) => {
  const newStatus = user.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'

  ElMessageBox.confirm(
      `确定要${actionText}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await userStore.updateUserStatusAction(user.id, newStatus)
    if (success) {
      ElMessage.success(`用户已${actionText}`)
      await fetchUsers() // 刷新数据
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 删除用户
const deleteUser = (user: User) => {
  ElMessageBox.confirm(
      `确定要删除用户"${user.username}"吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await userStore.deleteUserAction(user.id)
    if (success) {
      ElMessage.success('用户已删除')
      await fetchUsers() // 刷新数据
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 保存用户（添加或更新）
const saveUser = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate()
  if (isEditing.value && userForm.id !== null) {
    // 更新用户
    const success = await userStore.updateUserAction(userForm.id, {
      username: userForm.username,
      realName: userForm.realName,
      email: userForm.email,
      phone: userForm.phone,
      deptId: userForm.deptId,
      gender: userForm.gender,
      birthday: userForm.birthday,
      roleId: userForm.roleId,
      status: userForm.status
    })
    if (success) {
      userModalVisible.value = false
      await fetchUsers() // 刷新数据
    }
  } else {
    // 添加用户
    const success = await userStore.addUserAction({
      username: userForm.username,
      password: userForm.password,
      realName: userForm.realName,
      email: userForm.email,
      phone: userForm.phone,
      deptId: userForm.deptId,
      gender: userForm.gender,
      birthday: userForm.birthday,
      roleId: userForm.roleId,
      status: userForm.status
    })
    if (success) {
      userModalVisible.value = false
      await fetchUsers() // 刷新数据
    }
  }
}

// 保存分配的角色
const saveAssignedRole = async () => {
  if (!selectedUser.value) return

  const success = await userStore.updateUserRoleAction(selectedUser.value.id, assignRoleForm.roleId)
  if (success) {
    ElMessage.success('角色分配成功')
    assignRoleModalVisible.value = false
    await fetchUsers() // 刷新数据
  }
}
</script>

<style scoped>
.user-management-container {
  padding: 20px;
}

.user-card {
  border-radius: 8px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.user-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.white-bg-input {
  width: 200px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.assign-role-content h4 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

/* Modal styles */
:deep(.user-detail-dialog) {
  .el-dialog__header {
    padding: 20px;
    border-bottom: 1px solid #eee;

    .el-dialog__title {
      font-size: 20px;
      font-weight: 600;
    }
  }

  .el-dialog__body {
    padding: 30px;
  }
}

.user-detail-content {
  .detail-item {
    margin-bottom: 25px;
    line-height: 1.8;
    font-size: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .detail-label {
    font-weight: 600;
    color: #333;
    margin-right: 10px;
    min-width: 90px;
    display: inline-block;
  }

  .detail-value {
    color: #666;
  }
}

/* Dark theme adaptations */
:deep(.dark) {
  .user-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title {
    color: #e5e7eb;
  }

  .white-bg-input :deep(.el-input__wrapper) {
    background-color: #1c1c1c;
    box-shadow: 0 0 0 1px #4a4a4a inset;
  }

  .white-bg-input :deep(.el-input__inner) {
    color: #e5e7eb;
  }

  :deep(.el-table) {
    background-color: #2d2d2d;
    color: #e5e7eb;
  }

  :deep(.el-table th),
  :deep(.el-table tr) {
    background-color: #1c1c1c;
  }

  .assign-role-content h4 {
    color: #e5e7eb;
  }

  .user-detail-content {
    .detail-label {
      color: #e5e7eb;
    }

    .detail-value {
      color: #9ca3af;
    }
  }
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .user-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .white-bg-input {
    width: 100%;
  }

  .header-buttons {
    flex-direction: column;
  }
}
</style>