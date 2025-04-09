<template>
  <Layout>
    <template #content>
      <div class="permission-management-container">
        <el-card class="permission-card" shadow="hover">
          <template #header>
            <div class="permission-header">
              <h3 class="card-title">权限管理</h3>
              <div class="header-buttons">
                <el-button type="danger" @click="batchDeletePermissions" :disabled="selectedPermissions.length === 0">批量删除</el-button>
                <el-button type="primary" @click="showAddPermissionModal">添加权限</el-button>
              </div>
            </div>
          </template>

          <!-- Permission search -->
          <div class="permission-actions">
            <el-select
                v-model="permissionType"
                placeholder="权限类型"
                class="white-bg-input"
                filterable
                clearable
            >
              <el-option label="全部" value="" />
              <el-option label="菜单权限" :value="1" />
              <el-option label="按钮权限" :value="2" />
            </el-select>
            <el-select v-model="permissionStatus" placeholder="权限状态" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-select v-model="sensitivePermission" placeholder="敏感权限" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
            <el-input
                v-model="searchKeyword"
                placeholder="搜索权限"
                class="white-bg-input"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>

          <!-- Permission table -->
          <el-table
              :data="permissionList"
              style="width: 100%"
              v-loading="loading"
              @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="权限ID" width="150" />
            <el-table-column prop="code" label="权限编码" min-width="180" />
            <el-table-column label="权限名称" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.name" placement="top">
                  <span>{{ truncateText(scope.row.name, 15) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="parentName" label="上级权限" min-width="200" />
            <el-table-column label="权限类型" width="120">
              <template #default="scope">
                <el-tag :type="getTypeTagType(scope.row.type)">
                  {{ scope.row.typeText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="敏感权限" width="150">
              <template #default="scope">
                <el-tag :type="scope.row.isSensitive ? 'danger' : 'info'" size="small">
                  {{ scope.row.isSensitive ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="150">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="scope">
                <el-button type="primary" @click="viewPermission(scope.row)" icon="View" circle title="查看" />
                <el-button
                    :type="scope.row.status === 1 ? 'danger' : 'success'"
                    @click="togglePermissionStatus(scope.row)"
                    :icon="scope.row.status === 1 ? 'CircleClose' : 'Check'"
                    circle
                    :title="scope.row.status === 1 ? '禁用' : '启用'"
                />
                <el-button type="warning" @click="editPermission(scope.row)" icon="Edit" circle title="编辑" />
                <el-button type="danger" @click="deletePermission(scope.row)" icon="Delete" circle title="删除" />
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

  <!-- Add/Edit Permission Modal -->
  <el-dialog
      v-model="permissionModalVisible"
      :title="isEditing ? '编辑权限' : '添加权限'"
      width="40%"
      center
  >
    <el-form :model="permissionForm" label-width="120px" :rules="formRules" ref="permissionFormRef">
      <el-form-item label="权限编码" prop="code">
        <el-input v-model="permissionForm.code" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="权限名称" prop="name">
        <el-input v-model="permissionForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="上级权限" prop="parentId">
        <el-select v-model="permissionForm.parentId" placeholder="请选择上级权限" filterable clearable>
          <el-option label="无上级权限" :value="0" />
          <el-option
              v-for="perm in parentPermissionOptions"
              :key="perm.id"
              :label="perm.name"
              :value="perm.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="权限类型" prop="type">
        <el-select v-model="permissionForm.type" placeholder="请选择权限类型">
          <el-option label="菜单权限" :value="1" />
          <el-option label="按钮权限" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="敏感权限" prop="isSensitive">
        <el-switch v-model="permissionForm.isSensitive" />
      </el-form-item>
      <el-form-item label="权限状态" prop="status">
        <el-select v-model="permissionForm.status">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="permissionModalVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermission">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- View Permission Modal -->
  <el-dialog
      v-model="viewPermissionModalVisible"
      title="权限详情"
      width="40%"
      center
      class="permission-detail-dialog"
  >
    <div v-if="selectedPermission" class="permission-detail-content">
      <div class="detail-item">
        <span class="detail-label">权限ID：</span>
        <span class="detail-value">{{ selectedPermission.id }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">权限编码：</span>
        <span class="detail-value">{{ selectedPermission.code }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">权限名称：</span>
        <span class="detail-value">{{ selectedPermission.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">上级权限：</span>
        <span class="detail-value">{{ selectedPermission.parentName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">权限类型：</span>
        <span class="detail-value">
          <el-tag :type="getTypeTagType(selectedPermission.type)" size="small">
            {{ selectedPermission.typeText }}
          </el-tag>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">敏感权限：</span>
        <span class="detail-value">
          <el-tag :type="selectedPermission.isSensitive ? 'danger' : 'info'" size="small">
            {{ selectedPermission.isSensitive ? '是' : '否' }}
          </el-tag>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">权限状态：</span>
        <span class="detail-value">
          <el-tag :type="selectedPermission.status === 1 ? 'success' : 'danger'" size="small">
            {{ selectedPermission.statusText }}
          </el-tag>
        </span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue'
import Layout from '@/components/Layout.vue'
import type {FormInstance} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {usePermissionStore} from '@/stores/permission'

// 使用权限状态管理
const permissionStore = usePermissionStore()

// 表单引用
const permissionFormRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择权限状态', trigger: 'change' }
  ]
}

// 分页和筛选相关
const currentPage = ref(1)
const pageSize = ref(10)
const permissionStatus = ref('')
const searchKeyword = ref('')
const permissionType = ref('')
const sensitivePermission = ref('')

// 计算属性：获取权限列表和总数
const permissionList = computed(() => permissionStore.permissionList)
const total = computed(() => permissionStore.pagination.total)
const loading = computed(() => permissionStore.loading)

// 上级权限选项
const parentPermissionOptions = ref([])

// 多选相关
const selectedPermissions = ref([])

// Permission modal related refs
const permissionModalVisible = ref(false)
const viewPermissionModalVisible = ref(false)
const isEditing = ref(false)

interface Permission {
  id: number | null;
  code: string;
  name: string;
  parentId: number | null;
  parentName?: string;
  type: number;
  typeText?: string;
  isSensitive: boolean;
  status: number;
  statusText?: string;
}

// 修改权限表单的初始化
const permissionForm = reactive<Permission>({
  id: null,
  code: '',
  name: '',
  parentId: null,
  type: 1,
  isSensitive: false,
  status: 1 // 默认启用，值为1
})
const selectedPermission = ref<Permission | null>(null)

// 初始化加载数据
onMounted(async () => {
  await Promise.all([
    fetchPermissions(),
    fetchParentPermissionOptions()
  ])
})

// 获取权限列表
const fetchPermissions = async () => {
  const query = {
    status: permissionStatus.value !== '' ? permissionStatus.value : undefined,
    keyword: searchKeyword.value || undefined,
    type: permissionType.value || undefined,
    isSensitive: sensitivePermission.value !== '' ? sensitivePermission.value : undefined
  }
  await permissionStore.getPagingPermissionListAction(currentPage.value, pageSize.value, query)
}

// 获取上级权限选项
const fetchParentPermissionOptions = async () => {
  parentPermissionOptions.value = await permissionStore.getParentPermissionsAction()
}

// 处理表格多选
const handleSelectionChange = (selection) => {
  selectedPermissions.value = selection
}

// 处理分页变化
const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await fetchPermissions()
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  await fetchPermissions()
}

// 搜索权限
const handleSearch = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchPermissions()
}

// 重置搜索条件
const resetSearch = async () => {
  searchKeyword.value = ''
  permissionStatus.value = ''
  permissionType.value = ''
  sensitivePermission.value = ''
  currentPage.value = 1
  await fetchPermissions()
}

// 获取权限类型标签类型
const getTypeTagType = (type: number) => {
  const types = {
    1: 'success',
    2: 'warning'
  }
  return types[type] || 'info'
}

// 文本截断
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 显示添加权限模态框
const showAddPermissionModal = () => {
  isEditing.value = false
  permissionForm.id = null
  permissionForm.code = ''
  permissionForm.name = ''
  permissionForm.parentId = null
  permissionForm.type = 1
  permissionForm.isSensitive = false
  permissionForm.status = 1 // 默认启用，值为1
  permissionModalVisible.value = true
}

// 编辑权限
const editPermission = (permission: Permission) => {
  isEditing.value = true
  Object.assign(permissionForm, {
    id: permission.id,
    code: permission.code,
    name: permission.name,
    parentId: permission.parentId,
    type: permission.type,
    isSensitive: permission.isSensitive,
    status: permission.status
  })
  permissionModalVisible.value = true
}

// 查看权限详情
const viewPermission = async (permission: Permission) => {
  try {
    selectedPermission.value = permission
    viewPermissionModalVisible.value = true
  } catch (error) {
    ElMessage.error('获取权限详情失败')
  }
}

// 切换权限状态（启用/禁用）
const togglePermissionStatus = (permission: Permission) => {
  const newStatus = permission.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'

  ElMessageBox.confirm(
      `确定要${actionText}该权限吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await permissionStore.updatePermissionStatusAction(permission.id, newStatus)
    if (success) {
      ElMessage.success(`权限已${actionText}`)
      await fetchPermissions()
      await fetchParentPermissionOptions()
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 保存权限（添加或更新）
const savePermission = async () => {
  if (!permissionFormRef.value) return

  await permissionFormRef.value.validate(async (valid) => {
    if (valid) {
      if (isEditing.value && permissionForm.id !== null) {
        // 更新权限
        const success = await permissionStore.updatePermissionAction(permissionForm.id, {
          code: permissionForm.code,
          name: permissionForm.name,
          parentId: permissionForm.parentId,
          type: permissionForm.type,
          isSensitive: permissionForm.isSensitive,
          status: permissionForm.status
        })
        if (success) {
          permissionModalVisible.value = false
          await fetchPermissions()
          await fetchParentPermissionOptions()
        }
      } else {
        // 添加权限
        const success = await permissionStore.addPermissionAction({
          code: permissionForm.code,
          name: permissionForm.name,
          parentId: permissionForm.parentId,
          type: permissionForm.type,
          isSensitive: permissionForm.isSensitive,
          status: permissionForm.status
        })
        if (success) {
          permissionModalVisible.value = false
          await fetchPermissions()
          await fetchParentPermissionOptions()
        }
      }
    }
  })
}

// 删除权限
const deletePermission = (permission: Permission) => {
  ElMessageBox.confirm(
      `确定要删除权限"${permission.name}"吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await permissionStore.deletePermissionAction(permission.id)
    if (success) {
      ElMessage.success('权限已删除')
      await fetchPermissions()
      await fetchParentPermissionOptions()
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 批量删除权限
const batchDeletePermissions = () => {
  if (selectedPermissions.value.length === 0) {
    ElMessage.warning('请至少选择一个权限')
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedPermissions.value.length} 个权限吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const permissionIds = selectedPermissions.value.map(permission => permission.id)
    const success = await permissionStore.batchDeletePermissionsAction(permissionIds)
    if (success) {
      ElMessage.success(`已成功删除 ${selectedPermissions.value.length} 个权限`)
      selectedPermissions.value = []
      await fetchPermissions() // 刷新数据
      await fetchParentPermissionOptions() // 刷新上级权限选项
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
</script>

<style scoped>
.permission-management-container {
  padding: 20px;
}

.permission-card {
  border-radius: 8px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.permission-actions {
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

/* Modal styles */
:deep(.permission-detail-dialog) {
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

.permission-detail-content {
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
  .permission-card {
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

  .permission-detail-content {
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
  .permission-actions {
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