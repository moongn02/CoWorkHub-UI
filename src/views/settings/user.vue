<template>
  <Layout>
    <template #content>
      <div class="user-management-container">
        <el-card class="user-card" shadow="hover">
          <template #header>
            <div class="user-header">
              <h3 class="card-title">用户管理</h3>
              <el-button type="primary" @click="showAddUserModal">添加用户</el-button>
            </div>
          </template>

          <!-- User search -->
          <div class="user-actions">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索用户"
                class="white-bg-input"
            />
            <el-select v-model="roleFilter" placeholder="角色" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option
                  v-for="role in roles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
              />
            </el-select>
            <el-select v-model="departmentFilter" placeholder="部门" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option
                  v-for="department in departments"
                  :key="department.id"
                  :label="department.name"
                  :value="department.id"
              />
            </el-select>
            <el-select v-model="statusFilter" placeholder="状态" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="启用" value="ENABLE" />
              <el-option label="禁用" value="DISABLE" />
            </el-select>
          </div>

          <!-- User table -->
          <el-table :data="filteredUsers" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" min-width="120" />
            <el-table-column prop="roleName" label="角色" min-width="120" />
            <el-table-column prop="departmentName" label="部门" min-width="120" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="scope">
                <el-button type="primary" @click="assignRole(scope.row)">分配角色</el-button>
                <el-button type="warning" @click="editUser(scope.row)" icon="Edit" circle />
                <el-button type="danger" @click="deleteUser(scope.row)" icon="Delete" circle />
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
      width="30%"
      center
  >
    <el-form :model="userForm" label-width="100px">
      <el-form-item label="用���名">
        <el-input v-model="userForm.username" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="userForm.email" type="email" />
      </el-form-item>
      <el-form-item label="密码" v-if="!isEditing">
        <el-input v-model="userForm.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="userForm.roleId">
          <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门">
        <el-select v-model="userForm.departmentId">
          <el-option
              v-for="department in departments"
              :key="department.id"
              :label="department.name"
              :value="department.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="userForm.status">
          <el-option label="启用" value="ENABLE" />
          <el-option label="禁用" value="DISABLE" />
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
          <el-select v-model="assignRoleForm.roleId">
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
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Role data
const roles = [
  { id: 1, name: '超级管理员' },
  { id: 2, name: '商品管理员' },
  { id: 3, name: '订单管理员' },
]

// Department data
const departments = [
  { id: 1, name: '技术部' },
  { id: 2, name: '市场部' },
  { id: 3, name: '人事部' },
]

// User data
const users = ref([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    roleId: 1,
    roleName: '超级管理员',
    departmentId: 1,
    departmentName: '技术部',
    status: 'ENABLE'
  },
  {
    id: 2,
    username: 'product_manager',
    email: 'product@example.com',
    roleId: 2,
    roleName: '商品管理员',
    departmentId: 2,
    departmentName: '市场部',
    status: 'ENABLE'
  },
  {
    id: 3,
    username: 'order_manager',
    email: 'order@example.com',
    roleId: 3,
    roleName: '订单管理员',
    departmentId: 3,
    departmentName: '人事部',
    status: 'DISABLE'
  },
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(users.value.length)
const searchKeyword = ref('')
const roleFilter = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')

// User modal related refs
const userModalVisible = ref(false)
const assignRoleModalVisible = ref(false)
const isEditing = ref(false)
const userForm = reactive({
  id: null,
  username: '',
  email: '',
  password: '',
  roleId: null,
  departmentId: null,
  status: 'ENABLE',
})
const selectedUser = ref(null)
const assignRoleForm = reactive({
  roleId: null,
})

// Filter users based on search keyword, role, department, and status
const filteredUsers = computed(() => {
  let filtered = users.value

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.roleId === roleFilter.value)
  }

  if (departmentFilter.value) {
    filtered = filtered.filter(user => user.departmentId === departmentFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.roleName.toLowerCase().includes(keyword) ||
        user.departmentName.toLowerCase().includes(keyword)
    )
  }

  total.value = filtered.length
  return filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const getStatusType = (status: string) => {
  const types = {
    ENABLE: 'success',
    DISABLE: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels = {
    ENABLE: '启用',
    DISABLE: '禁用',
  }
  return labels[status] || '未知'
}

const showAddUserModal = () => {
  isEditing.value = false
  userForm.id = null
  userForm.username = ''
  userForm.email = ''
  userForm.password = ''
  userForm.roleId = null
  userForm.departmentId = null
  userForm.status = 'ENABLE'
  userModalVisible.value = true
}

const editUser = (user) => {
  isEditing.value = true
  Object.assign(userForm, user)
  userForm.password = '' // Don't show password in edit mode
  userModalVisible.value = true
}

const assignRole = (user) => {
  selectedUser.value = user
  assignRoleForm.roleId = user.roleId
  assignRoleModalVisible.value = true
}

const saveUser = () => {
  if (isEditing.value) {
    const index = users.value.findIndex(user => user.id === userForm.id)
    if (index !== -1) {
      const role = roles.find(r => r.id === userForm.roleId)
      const department = departments.find(d => d.id === userForm.departmentId)
      users.value[index] = {
        ...userForm,
        roleName: role ? role.name : '',
        departmentName: department ? department.name : ''
      }
      ElMessage.success('用户已更新')
    }
  } else {
    const role = roles.find(r => r.id === userForm.roleId)
    const department = departments.find(d => d.id === userForm.departmentId)
    const newUser = {
      ...userForm,
      id: users.value.length + 1,
      roleName: role ? role.name : '',
      departmentName: department ? department.name : ''
    }
    users.value.push(newUser)
    ElMessage.success('用户已添加')
  }
  userModalVisible.value = false
}

const saveAssignedRole = () => {
  if (!selectedUser.value) return

  const index = users.value.findIndex(user => user.id === selectedUser.value.id)
  if (index !== -1) {
    const role = roles.find(r => r.id === assignRoleForm.roleId)
    users.value[index] = {
      ...users.value[index],
      roleId: assignRoleForm.roleId,
      roleName: role ? role.name : ''
    }
    ElMessage.success('角色已更新')
  }
  assignRoleModalVisible.value = false
}

const deleteUser = (user) => {
  ElMessageBox.confirm(
      '确定要删除这个用户吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value.splice(index, 1)
      ElMessage.success('用户已删除')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
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
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.white-bg-input {
  width: 200px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.assign-role-content {
  h4 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #303133;
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

  .assign-role-content {
    h4 {
      color: #e5e7eb;
    }
  }
}
</style>

