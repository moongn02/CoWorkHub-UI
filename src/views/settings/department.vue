<template>
  <Layout>
    <template #content>
      <div class="department-management-container">
        <el-card class="department-card" shadow="hover">
          <template #header>
            <div class="department-header">
              <h3 class="card-title">部门管理</h3>
              <el-button type="primary" @click="showAddDepartmentModal">添加部门</el-button>
            </div>
          </template>

          <!-- Department search -->
          <div class="department-actions">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索部门"
                class="white-bg-input"
            />
            <el-select v-model="departmentStatus" placeholder="部门状态" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="启用" value="ENABLE" />
              <el-option label="禁用" value="DISABLE" />
            </el-select>
          </div>

          <!-- Department table -->
          <el-table :data="filteredDepartments" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="150" />
            <el-table-column label="部门名称" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.name" placement="top">
                  <span>{{ truncateText(scope.row.name, 15) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="部门简称" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.shortName" placement="top">
                  <span>{{ truncateText(scope.row.shortName, 8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="150">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button type="primary" @click="viewDepartment(scope.row)" icon="View" circle />
                <el-button type="warning" @click="editDepartment(scope.row)" icon="Edit" circle />
                <el-button type="danger" @click="deleteDepartment(scope.row)" icon="Delete" circle />
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

  <!-- Add/Edit Department Modal -->
  <el-dialog
      v-model="departmentModalVisible"
      :title="isEditing ? '编辑部门' : '添加部门'"
      width="30%"
      center
  >
    <el-form :model="departmentForm" label-width="100px">
      <el-form-item label="部门名称">
        <el-input v-model="departmentForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="部门简称">
        <el-input v-model="departmentForm.shortName" maxlength="10" show-word-limit />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="departmentForm.status">
          <el-option label="启用" value="ENABLE" />
          <el-option label="禁用" value="DISABLE" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="departmentModalVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDepartment">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- View Department Modal -->
  <el-dialog
      v-model="viewDepartmentModalVisible"
      title="部门详情"
      width="30%"
      center
      class="department-detail-dialog"
  >
    <div v-if="selectedDepartment" class="department-detail-content">
      <div class="detail-item">
        <span class="detail-label">部门名称：</span>
        <span class="detail-value">{{ selectedDepartment.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">部门简称：</span>
        <span class="detail-value">{{ selectedDepartment.shortName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">状态：</span>
        <span class="detail-value">{{ getStatusLabel(selectedDepartment.status) }}</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Department data
const departments = ref([
  { id: 1, name: '技术部', shortName: '技术', status: 'ENABLE' },
  { id: 2, name: '市场部', shortName: '市场', status: 'ENABLE' },
  { id: 3, name: '财务部', shortName: '财务', status: 'DISABLE' },
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(departments.value.length)
const departmentStatus = ref('')
const searchKeyword = ref('')

// Department modal related refs
const departmentModalVisible = ref(false)
const viewDepartmentModalVisible = ref(false)
const isEditing = ref(false)
const departmentForm = reactive({
  id: null,
  name: '',
  shortName: '',
  status: 'ENABLE',
})
const selectedDepartment = ref(null)

// Filter departments based on search keyword and status
const filteredDepartments = computed(() => {
  let filtered = departments.value

  if (departmentStatus.value) {
    filtered = filtered.filter(dept => dept.status === departmentStatus.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(keyword) ||
        dept.shortName.toLowerCase().includes(keyword)
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

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const showAddDepartmentModal = () => {
  isEditing.value = false
  departmentForm.id = null
  departmentForm.name = ''
  departmentForm.shortName = ''
  departmentForm.status = 'ENABLE'
  departmentModalVisible.value = true
}

const editDepartment = (department) => {
  isEditing.value = true
  Object.assign(departmentForm, department)
  departmentModalVisible.value = true
}

const viewDepartment = (department) => {
  selectedDepartment.value = department
  viewDepartmentModalVisible.value = true
}

const saveDepartment = () => {
  if (isEditing.value) {
    const index = departments.value.findIndex(dept => dept.id === departmentForm.id)
    if (index !== -1) {
      departments.value[index] = { ...departmentForm }
      ElMessage.success('部门已更新')
    }
  } else {
    const newDepartment = {
      ...departmentForm,
      id: departments.value.length + 1,
    }
    departments.value.push(newDepartment)
    ElMessage.success('部门已添加')
  }
  departmentModalVisible.value = false
}

const deleteDepartment = (department) => {
  ElMessageBox.confirm(
      '确定要删除这个部门吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    const index = departments.value.findIndex(d => d.id === department.id)
    if (index !== -1) {
      departments.value.splice(index, 1)
      ElMessage.success('部门已删除')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
</script>

<style scoped>
.department-management-container {
  padding: 20px;
}

.department-card {
  border-radius: 8px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.department-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.department-actions {
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
  .department-card {
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
:deep(.department-detail-dialog) {
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

.department-detail-content {
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
  .department-detail-content {
    .detail-label {
      color: #e5e7eb;
    }

    .detail-value {
      color: #9ca3af;
    }
  }
}
</style>