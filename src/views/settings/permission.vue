<template>
  <Layout>
    <template #content>
      <div class="permission-management-container">
        <el-card class="permission-card" shadow="hover">
          <template #header>
            <div class="permission-header">
              <h3 class="card-title">权限管理</h3>
              <el-button type="primary" @click="showAddPermissionModal">添加权限</el-button>
            </div>
          </template>

          <!-- Permission search -->
          <div class="permission-actions">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索权限"
                class="white-bg-input"
            />
            <el-select v-model="permissionLevel" placeholder="权限等级" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="一级" value="一级" />
              <el-option label="二级" value="二级" />
              <el-option label="三级" value="三级" />
            </el-select>
          </div>

          <!-- Permission table -->
          <el-table :data="filteredPermissions" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="权限名称" min-width="180" />
            <el-table-column prop="path" label="路径" min-width="180" />
            <el-table-column prop="level" label="权限等级" width="120">
              <template #default="scope">
                <el-tag :type="getLevelType(scope.row.level)">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" @click="viewPermission(scope.row)" icon="View" circle />
                <el-button type="warning" @click="editPermission(scope.row)" icon="Edit" circle />
                <el-button type="danger" @click="deletePermission(scope.row)" icon="Delete" circle />
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
      width="30%"
      center
  >
    <el-form :model="permissionForm" label-width="100px">
      <el-form-item label="权限名称">
        <el-input v-model="permissionForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="路径">
        <el-input v-model="permissionForm.path" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item label="权限等级">
        <el-select v-model="permissionForm.level">
          <el-option label="一级" value="一级" />
          <el-option label="二级" value="二级" />
          <el-option label="三级" value="三级" />
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
      width="30%"
      center
      class="permission-detail-dialog"
  >
    <div v-if="selectedPermission" class="permission-detail-content">
      <div class="detail-item">
        <span class="detail-label">权限名称：</span>
        <span class="detail-value">{{ selectedPermission.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">路径：</span>
        <span class="detail-value">{{ selectedPermission.path }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">权限等级：</span>
        <span class="detail-value">{{ selectedPermission.level }}</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Permission data
const permissions = ref([
  { id: 1, name: '商品管理', path: 'goods', level: '一级' },
  { id: 2, name: '订单管理', path: 'orders', level: '一级' },
  { id: 3, name: '权限管理', path: 'rights', level: '一级' },
  { id: 4, name: '商品列表', path: 'goods/list', level: '二级' },
  { id: 5, name: '添加商品', path: 'goods/add', level: '三级' },
  { id: 6, name: '订单列表', path: 'orders/list', level: '二级' },
  { id: 7, name: '添加订单', path: 'orders/add', level: '三级' },
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(permissions.value.length)
const permissionLevel = ref('')
const searchKeyword = ref('')

// Permission modal related refs
const permissionModalVisible = ref(false)
const viewPermissionModalVisible = ref(false)
const isEditing = ref(false)
const permissionForm = reactive({
  id: null,
  name: '',
  path: '',
  level: '一级',
})
const selectedPermission = ref(null)

// Filter permissions based on search keyword and level
const filteredPermissions = computed(() => {
  let filtered = permissions.value

  if (permissionLevel.value) {
    filtered = filtered.filter(permission => permission.level === permissionLevel.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(keyword) ||
        permission.path.toLowerCase().includes(keyword)
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

const getLevelType = (level: string) => {
  const types = {
    '一级': '',
    '二级': 'success',
    '三级': 'warning'
  }
  return types[level] || 'info'
}

const showAddPermissionModal = () => {
  isEditing.value = false
  permissionForm.id = null
  permissionForm.name = ''
  permissionForm.path = ''
  permissionForm.level = '一级'
  permissionModalVisible.value = true
}

const editPermission = (permission) => {
  isEditing.value = true
  Object.assign(permissionForm, permission)
  permissionModalVisible.value = true
}

const viewPermission = (permission) => {
  selectedPermission.value = permission
  viewPermissionModalVisible.value = true
}

const savePermission = () => {
  if (isEditing.value) {
    const index = permissions.value.findIndex(permission => permission.id === permissionForm.id)
    if (index !== -1) {
      permissions.value[index] = { ...permissionForm }
      ElMessage.success('权限已更新')
    }
  } else {
    const newPermission = {
      ...permissionForm,
      id: permissions.value.length + 1,
    }
    permissions.value.push(newPermission)
    ElMessage.success('权限已添加')
  }
  permissionModalVisible.value = false
}

const deletePermission = (permission) => {
  ElMessageBox.confirm(
      '确定要删除这个权限吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    const index = permissions.value.findIndex(p => p.id === permission.id)
    if (index !== -1) {
      permissions.value.splice(index, 1)
      ElMessage.success('权限已删除')
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
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-actions {
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

/* Content styles */
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

/* Dark theme modal adaptations */
:deep(.dark) {
  .permission-detail-content {
    .detail-label {
      color: #e5e7eb;
    }

    .detail-value {
      color: #9ca3af;
    }
  }
}
</style>