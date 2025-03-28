<template>
  <Layout>
    <template v-slot:content>
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
            <el-select v-model="roleStatus" placeholder="角色状态" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-input
                v-model="searchKeyword"
                placeholder="搜索角色关键词"
                class="white-bg-input"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>

          <!-- Role table -->
          <el-table :data="roleList" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="角色名称" min-width="180">
              <template #default="scope">
                <el-tooltip :content="scope.row.name" placement="top">
                  <span>{{ truncateText(scope.row.name, 15) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="角色描述" min-width="250">
              <template #default="scope">
                <el-tooltip :content="scope.row.description" placement="top">
                  <span>{{ truncateText(scope.row.description, 30) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="scope">
                <el-button type="success" @click="assignPermissions(scope.row)" icon="Setting" circle title="分配权限" />
                <el-button type="primary" @click="viewRole(scope.row)" icon="View" circle title="查看" />
                <el-button
                    :type="scope.row.status === 1 ? 'danger' : 'success'"
                    @click="toggleRoleStatus(scope.row)"
                    :icon="scope.row.status === 1 ? 'CircleClose' : 'Check'"
                    circle
                    :title="scope.row.status === 1 ? '禁用' : '启用'"
                />
                <el-button type="warning" @click="editRole(scope.row)" icon="Edit" circle title="编辑" />
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
      width="40%"
      center
  >
    <el-form :model="roleForm" label-width="120px" :rules="formRules" ref="roleFormRef">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="roleForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="角色描述" prop="description">
        <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            maxlength="100"
            show-word-limit
        />
      </el-form-item>
      <el-form-item label="角色权限" prop="permissions">
        <el-tree
            ref="permissionTreeRef"
            :data="permissionTreeData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            default-expand-all
        />
      </el-form-item>
      <el-form-item label="角色状态" prop="status">
        <el-select v-model="roleForm.status">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
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
          ref="assignPermissionTreeRef"
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
        <el-button type="primary" @click="saveAssignedPermissions">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- View Role Modal -->
  <el-dialog
      v-model="viewRoleModalVisible"
      title="角色详情"
      width="40%"
      center
      class="role-detail-dialog"
  >
    <div v-if="selectedRole" class="role-detail-content">
      <div class="detail-item">
        <span class="detail-label">角色ID：</span>
        <span class="detail-value">{{ selectedRole.id }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">角色名称：</span>
        <span class="detail-value">{{ selectedRole.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">角色描述：</span>
        <span class="detail-value">{{ selectedRole.description }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">角色状态：</span>
        <span class="detail-value">
          <el-tag :type="selectedRole.status === 1 ? 'success' : 'danger'" size="small">
            {{ selectedRole.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">角色权限：</span>
        <div class="detail-permissions">
          <el-tree
              :data="rolePermissionsData"
              :props="defaultProps"
              default-expand-all
              :expand-on-click-node="false"
              class="permission-view-tree"
          />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoleStore } from '@/stores/role'
import { usePermissionStore } from '@/stores/permission'
import type { FormInstance } from 'element-plus'

// 使用角色状态管理
const roleStore = useRoleStore()
const permissionStore = usePermissionStore()

// 表单引用
const roleFormRef = ref<FormInstance>()
const permissionTreeRef = ref(null)
const assignPermissionTreeRef = ref(null)

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择角色状态', trigger: 'change' }
  ]
}

// 分页和筛选相关
const currentPage = ref(1)
const pageSize = ref(10)
const roleStatus = ref('')
const searchKeyword = ref('')

// 计算属性：获取角色列表和总数
const roleList = computed(() => roleStore.roleList)
const total = computed(() => roleStore.pagination.total)
const loading = computed(() => roleStore.loading)

// 权限树数据
const permissionTreeData = ref([])
const rolePermissionsData = ref([])

// 树形控件配置
const defaultProps = {
  children: 'children',
  label: 'name'
}

// Role modal related refs
const roleModalVisible = ref(false)
const assignPermissionsModalVisible = ref(false)
const viewRoleModalVisible = ref(false)
const isEditing = ref(false)

interface Role {
  id: number | null;
  name: string;
  description: string;
  status: number;
}

// 修改角色表单的初始化
const roleForm = reactive<Role>({
  id: null,
  name: '',
  description: '',
  status: 1 // 默认启用，值为1
})
const selectedRole = ref<Role | null>(null)

// 初始化加载数据
onMounted(async () => {
  await Promise.all([
    fetchRoles(),
    fetchPermissionTree()
  ])
})

// 获取角色列表
const fetchRoles = async () => {
  const query = {
    status: roleStatus.value !== '' ? roleStatus.value : undefined,
    keyword: searchKeyword.value || undefined
  }
  await roleStore.getPagingRoleListAction(currentPage.value, pageSize.value, query)
}

// 获取权限树
const fetchPermissionTree = async () => {
  permissionTreeData.value = await permissionStore.getPermissionTreeAction()
}

// 处理分页变化
const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await fetchRoles()
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  await fetchRoles()
}

// 搜索角色
const handleSearch = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchRoles()
}

// 重置搜索条件
const resetSearch = async () => {
  searchKeyword.value = ''
  roleStatus.value = ''
  currentPage.value = 1
  await fetchRoles()
}

// 文本截断
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 显示添加角色模态框
const showAddRoleModal = () => {
  isEditing.value = false
  roleForm.id = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.status = 1 // 默认启用，值为1

  // 清空权限选择
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys([])
  }

  roleModalVisible.value = true
}

// 编辑角色
const editRole = async (role: Role) => {
  isEditing.value = true
  Object.assign(roleForm, {
    id: role.id,
    name: role.name,
    description: role.description,
    status: role.status
  })

  // 获取角色权限并设置选中
  try {
    const rolePermissions = await roleStore.getRolePermissionsAction(role.id)
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys(rolePermissions.map(p => p.id))
    }
  } catch (error) {
    console.error('获取角色权限失败', error)
    ElMessage.error('获取角色权限失败')
  }

  roleModalVisible.value = true
}

// 查看角色详情
const viewRole = async (role: Role) => {
  try {
    selectedRole.value = role

    // 获取角色权限
    const rolePermissions = await roleStore.getRolePermissionsAction(role.id)
    rolePermissionsData.value = await permissionStore.getPermissionTreeByIdsAction(
        rolePermissions.map(p => p.id)
    )

    viewRoleModalVisible.value = true
  } catch (error) {
    console.error('获取角色详情失败', error)
    ElMessage.error('获取角色详情失败')
  }
}

// 分配权限
const assignPermissions = async (role: Role) => {
  selectedRole.value = role

  // 获取角色权限并设置选中
  try {
    const rolePermissions = await roleStore.getRolePermissionsAction(role.id)
    if (assignPermissionTreeRef.value) {
      assignPermissionTreeRef.value.setCheckedKeys(rolePermissions.map(p => p.id))
    }
  } catch (error) {
    console.error('获取角色权限失败', error)
    ElMessage.error('获取角色权限失败')
  }

  assignPermissionsModalVisible.value = true
}

// 切换角色状态（启用/禁用）
const toggleRoleStatus = (role: Role) => {
  const newStatus = role.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'

  ElMessageBox.confirm(
      `确定要${actionText}该角色吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await roleStore.updateRoleStatusAction(role.id, newStatus)
    if (success) {
      ElMessage.success(`角色已${actionText}`)
      await fetchRoles() // 刷新数据
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 保存角色（添加或更新）
const saveRole = async () => {
  if (!roleFormRef.value) return

  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      // 获取选中的权限
      const checkedPermissions = permissionTreeRef.value ? permissionTreeRef.value.getCheckedKeys() : []
      const halfCheckedPermissions = permissionTreeRef.value ? permissionTreeRef.value.getHalfCheckedKeys() : []
      const allPermissions = [...checkedPermissions, ...halfCheckedPermissions]

      if (isEditing.value && roleForm.id !== null) {
        // 更新角色
        const success = await roleStore.updateRoleAction(roleForm.id, {
          name: roleForm.name,
          description: roleForm.description,
          status: roleForm.status,
          permissionIds: allPermissions
        })
        if (success) {
          roleModalVisible.value = false
          await fetchRoles() // 刷新数据
        }
      } else {
        // 添加角色
        const success = await roleStore.addRoleAction({
          name: roleForm.name,
          description: roleForm.description,
          status: roleForm.status,
          permissionIds: allPermissions
        })
        if (success) {
          roleModalVisible.value = false
          await fetchRoles() // 刷新数据
        }
      }
    }
  })
}

// 保存分配的权限
const saveAssignedPermissions = async () => {
  if (!selectedRole.value || !assignPermissionTreeRef.value) return

  // 获取选中的权限
  const checkedPermissions = assignPermissionTreeRef.value.getCheckedKeys()
  const halfCheckedPermissions = assignPermissionTreeRef.value.getHalfCheckedKeys()
  const allPermissions = [...checkedPermissions, ...halfCheckedPermissions]

  const success = await roleStore.updateRolePermissionsAction(selectedRole.value.id, allPermissions)
  if (success) {
    ElMessage.success('权限分配成功')
    assignPermissionsModalVisible.value = false
  }
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
  font-size: 18px;
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

.assign-permissions-content {
  h4 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #303133;
  }
}

/* Modal styles */
:deep(.role-detail-dialog) {
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

.role-detail-content {
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

  .detail-permissions {
    margin-top: 10px;
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

  .role-detail-content {
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
  .role-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .white-bg-input {
    width: 100%;
  }
}
</style>