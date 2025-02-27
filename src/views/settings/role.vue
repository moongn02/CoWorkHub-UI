<template>
  <Layout>
    <template #content>
      <div class="role-management-container">
        <el-card class="role-card" shadow="hover">
          <template #header>
            <div class="role-header">
              <h3 class="card-title">角色管理</h3>
              <el-button type="primary" @click="showAddRoleModal">添加角色</el-button>
            </div>
          </template>

          <!-- Role search -->
          <div class="role-actions">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索角色"
                class="white-bg-input"
            />

          </div>

          <!-- Role table -->
          <el-table :data="filteredRoles" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="角色名称" min-width="180" />
            <el-table-column prop="description" label="角色描述" min-width="250" />
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="scope">
                <el-button type="primary" @click="assignPermissions(scope.row)">分配权限</el-button>
                <el-button type="warning" @click="editRole(scope.row)" icon="Edit" circle />
                <el-button type="danger" @click="deleteRole(scope.row)" icon="Delete" circle />
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

  <!-- Add/Edit Role Modal -->
  <el-dialog
      v-model="roleModalVisible"
      :title="isEditing ? '编辑角色' : '添加角色'"
      width="30%"
      center
  >
    <el-form :model="roleForm" label-width="100px">
      <el-form-item label="角色名称">
        <el-input v-model="roleForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            maxlength="100"
            show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="roleModalVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- Assign Permissions Modal -->
  <el-dialog
      v-model="assignPermissionsModalVisible"
      title="分配权限"
      width="40%"
      center
  >
    <div v-if="selectedRole" class="assign-permissions-content">
      <h4>当前角色：{{ selectedRole.name }}</h4>
      <el-tree
          ref="permissionTree"
          :data="permissionTreeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          default-expand-all
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="assignPermissionsModalVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermissions">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Role data
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有所有权限的超级管理员角色'
  },
  {
    id: 2,
    name: '商品管理员',
    description: '负责商品相关管理的角色'
  },
  {
    id: 3,
    name: '订单管理员',
    description: '负责订单相关管理的角色'
  },
])

// Permission tree data
const permissionTreeData = [
  {
    id: 1,
    label: '商品管理',
    children: [
      {
        id: 4,
        label: '商品列表',
        children: [
          { id: 5, label: '添加商品' },
          { id: 6, label: '编辑商品' },
          { id: 7, label: '删除商品' },
        ]
      },
    ]
  },
  {
    id: 2,
    label: '订单管理',
    children: [
      {
        id: 8,
        label: '订单列表',
        children: [
          { id: 9, label: '查看订单' },
          { id: 10, label: '编辑订单' },
        ]
      },
    ]
  },
]

const defaultProps = {
  children: 'children',
  label: 'label',
}

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(roles.value.length)
const searchKeyword = ref('')

// Role modal related refs
const roleModalVisible = ref(false)
const assignPermissionsModalVisible = ref(false)
const isEditing = ref(false)
const roleForm = reactive({
  id: null,
  name: '',
  description: '',
})
const selectedRole = ref(null)
const permissionTree = ref(null)

// Filter roles based on search keyword
const filteredRoles = computed(() => {
  let filtered = roles.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(keyword) ||
        role.description.toLowerCase().includes(keyword)
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

const showAddRoleModal = () => {
  isEditing.value = false
  roleForm.id = null
  roleForm.name = ''
  roleForm.description = ''
  roleModalVisible.value = true
}

const editRole = (role) => {
  isEditing.value = true
  Object.assign(roleForm, role)
  roleModalVisible.value = true
}

const assignPermissions = (role) => {
  selectedRole.value = role
  assignPermissionsModalVisible.value = true
  // In a real application, you would load the role's existing permissions here
  // and set them in the tree
}

const saveRole = () => {
  if (isEditing.value) {
    const index = roles.value.findIndex(role => role.id === roleForm.id)
    if (index !== -1) {
      roles.value[index] = { ...roleForm }
      ElMessage.success('角色已更新')
    }
  } else {
    const newRole = {
      ...roleForm,
      id: roles.value.length + 1,
    }
    roles.value.push(newRole)
    ElMessage.success('角色已添加')
  }
  roleModalVisible.value = false
}

const savePermissions = () => {
  if (!selectedRole.value) return

  const checkedNodes = permissionTree.value.getCheckedNodes()
  const halfCheckedNodes = permissionTree.value.getHalfCheckedNodes()

  // In a real application, you would save these permissions to the backend
  console.log('Checked permissions:', checkedNodes)
  console.log('Half checked permissions:', halfCheckedNodes)

  ElMessage.success('权限已更新')
  assignPermissionsModalVisible.value = false
}

const deleteRole = (role) => {
  ElMessageBox.confirm(
      '确定要删除这个角色吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index !== -1) {
      roles.value.splice(index, 1)
      ElMessage.success('角色已删除')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
</script>

<style scoped>
.role-management-container {
  padding: 20px;
}

.role-card {
  border-radius: 8px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-actions {
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

.assign-permissions-content {
  h4 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #303133;
  }
}

/* Dark theme adaptations */
:deep(.dark) {
  .role-card {
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

  :deep(.el-tree) {
    background-color: #2d2d2d;
    color: #e5e7eb;
  }

  :deep(.el-tree-node__content:hover) {
    background-color: #3a3a3a;
  }

  :deep(.el-tree-node:focus > .el-tree-node__content) {
    background-color: #4a4a4a;
  }

  .assign-permissions-content {
    h4 {
      color: #e5e7eb;
    }
  }
}
</style>