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
                @keyup.enter="handleSearch"
            />
            <el-select v-model="departmentStatus" placeholder="部门状态" class="white-bg-input" @change="handleStatusChange">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>

          <!-- Department table -->
          <el-table :data="departmentList" style="width: 100%" v-loading="loading">
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
                  <span>{{ truncateText(scope.row.shortName || '', 8) }}</span>
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
    <el-form :model="departmentForm" label-width="100px" :rules="formRules" ref="departmentFormRef">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="departmentForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="部门简称" prop="shortName">
        <el-input v-model="departmentForm.shortName" maxlength="10" show-word-limit />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="departmentForm.status">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDeptStore } from '@/stores/department'
import type { FormInstance } from 'element-plus'
import Department from "@/views/settings/department.vue";

// 使用部门状态管理
const deptStore = useDeptStore()

// 表单引用
const departmentFormRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  shortName: [
    { required: true, message: '请输入部门简称', trigger: 'blur' },
    { max: 10, message: '长度不能超过 10 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择部门状态', trigger: 'change' }
  ]
}

// 分页和筛选相关
const currentPage = ref(1)
const pageSize = ref(10)
const departmentStatus = ref('')
const searchKeyword = ref('')

// 计算属性：获取部门列表和总数
const departmentList = computed(() => deptStore.departmentList)
const total = computed(() => deptStore.pagination.total)
const loading = computed(() => deptStore.loading)

// Department modal related refs
const departmentModalVisible = ref(false)
const viewDepartmentModalVisible = ref(false)
const isEditing = ref(false)
interface Department {
  id: string | number | null;
  name: string;
  shortName: string;
  status: number;
}

// 修改部门表单的初始化
const departmentForm = reactive<Department>({
  id: null,
  name: '',
  shortName: '',
  status: 1, // 默认启用，值为1
})
const selectedDepartment = ref<Department | null>(null)

// 初始化加载数据
onMounted(async () => {
  await fetchDepartments()
})

// 获取部门列表
const fetchDepartments = async () => {
  const query = {
    status: departmentStatus.value !== '' ? departmentStatus.value : undefined,
    keyword: searchKeyword.value || undefined
  }
  await deptStore.getDepartmentsAction(currentPage.value, pageSize.value, query)
}

// 处理分页变化
const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await fetchDepartments()
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  await fetchDepartments()
}

// 处理状态筛选变化
const handleStatusChange = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchDepartments()
}

// 搜索部门
const handleSearch = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchDepartments()
}

// 重置搜索条件
const resetSearch = async () => {
  searchKeyword.value = ''
  departmentStatus.value = ''
  currentPage.value = 1
  await fetchDepartments()
}

// 获取状态类型和标签
const getStatusType = (status: number) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusLabel = (status: number) => {
  return status === 1 ? '启用' : '禁用'
}

// 文本截断
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 显示添加部门模态框
const showAddDepartmentModal = () => {
  isEditing.value = false
  departmentForm.id = null
  departmentForm.name = ''
  departmentForm.shortName = ''
  departmentForm.status = 1 // 默认启用，值为1
  departmentModalVisible.value = true
}

// 编辑部门
const editDepartment = (department: any) => {
  isEditing.value = true
  Object.assign(departmentForm, department)
  departmentModalVisible.value = true
}

// 查看部门详情
const viewDepartment = async (department: any) => {
  // 如果需要获取更详细的部门信息
  try {
    const detailData = await deptStore.getDepartmentDetailAction(department.id)
    if (detailData) {
      selectedDepartment.value = detailData
    } else {
      selectedDepartment.value = department
    }
    viewDepartmentModalVisible.value = true
  } catch (error) {
    console.error('获取部门详情失败', error)
    ElMessage.error('获取部门详情失败')
  }
}

// 保存部门（添加或更新）
const saveDepartment = async () => {
  if (!departmentFormRef.value) return

  await departmentFormRef.value.validate(async (valid) => {
    if (valid) {
      if (isEditing.value && departmentForm.id !== null) {
        // 更新部门
        const success = await deptStore.updateDepartmentAction(departmentForm.id, {
          name: departmentForm.name,
          shortName: departmentForm.shortName,
          status: departmentForm.status
        })
        if (success) {
          departmentModalVisible.value = false
          await fetchDepartments() // 刷新数据
        }
      } else {
        // 添加部门
        const success = await deptStore.addDepartmentAction({
          name: departmentForm.name,
          shortName: departmentForm.shortName,
          status: departmentForm.status
        })
        if (success) {
          departmentModalVisible.value = false
          await fetchDepartments() // 刷新数据
        }
      }
    }
  })
}

// 删除部门
const deleteDepartment = (department: any) => {
  ElMessageBox.confirm(
      '确定要删除这个部门吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await deptStore.deleteDepartmentAction(department.id)
    if (success) {
      ElMessage.success('部门已删除')
      await fetchDepartments() // 刷新数据
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