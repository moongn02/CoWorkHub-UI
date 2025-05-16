<template>
  <Layout>
    <template #content>
      <div class="department-management-container">
        <el-card class="department-card" shadow="hover">
          <template #header>
            <div class="department-header">
              <h3 class="card-title">部门管理</h3>
              <div class="header-buttons">
                <el-button v-if="hasPermission('department:batchDelete')" type="danger" @click="batchDeleteDepartments" :disabled="selectedDepartments.length === 0">批量删除</el-button>
                <el-button v-if="hasPermission('department:add')" type="primary" @click="showAddDepartmentModal">添加部门</el-button>
              </div>
            </div>
          </template>

          <!-- Department search -->
          <div class="department-actions">
            <el-select
                v-model="parentDepartment"
                placeholder="上级部门"
                class="white-bg-input"
                filterable
                clearable
            >
              <el-option label="全部" value="" />
              <el-option
                  v-for="dept in parentDepartmentOptions"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
              />
            </el-select>
            <el-select v-model="departmentStatus" placeholder="部门状态" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-input
                v-model="searchKeyword"
                placeholder="搜索部门"
                class="white-bg-input"
                @keyup.enter="handleSearch"
            />
            <el-button v-if="hasPermission('department:search')" type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>

          <!-- Department table -->
          <el-table :data="departmentList"
                    style="width: 100%"
                    v-loading="loading"
                    @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="150" />
            <el-table-column label="部门名称" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.name" placement="top">
                  <span>{{ truncateText(scope.row.name, 15) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="leaderName" label="部门负责人" min-width="180" />
            <el-table-column prop="parentName" label="上级部门" min-width="180" />
            <el-table-column label="状态" width="150">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="scope">
                <el-button v-if="hasPermission('department:viewDetail')" type="primary" @click="viewDepartment(scope.row)" icon="View" circle title="查看" />
                <el-button
                    v-if="hasPermission('department:statusChange')"
                    :type="scope.row.status === 1 ? 'danger' : 'success'"
                    @click="toggleDepartmentStatus(scope.row)"
                    :icon="scope.row.status === 1 ? 'CircleClose' : 'Check'"
                    circle
                    :title="scope.row.status === 1 ? '禁用' : '启用'"
                />
                <el-button v-if="hasPermission('department:edit')" type="warning" @click="editDepartment(scope.row)" icon="Edit" circle title="编辑" />
                <el-button v-if="hasPermission('department:delete')" type="danger" @click="deleteDepartment(scope.row)" icon="Delete" circle title="删除" />
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
      width="40%"
      center
  >
    <el-form :model="departmentForm" label-width="120px" :rules="formRules" ref="departmentFormRef">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="departmentForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="部门负责人" prop="leaderId">
        <el-select v-model="departmentForm.leaderId" placeholder="请选择部门负责人" filterable>
          <el-option
              v-for="leader in leaderOptions"
              :key="leader.id"
              :label="leader.realName"
              :value="leader.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="上级部门" prop="parentId">
        <el-select v-model="departmentForm.parentId" placeholder="请选择上级部门" filterable clearable>
          <el-option label="无上级部门" :value="0" />
          <el-option
              v-for="dept in parentDepartmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门状态" prop="status">
        <el-select v-model="departmentForm.status">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门描述" prop="description">
        <el-input
            v-model="departmentForm.description"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请输入部门描述信息"
        />
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
      width="40%"
      center
      class="department-detail-dialog"
  >
    <div v-if="selectedDepartment" class="department-detail-content">
      <div class="detail-item">
        <span class="detail-label">部门ID：</span>
        <span class="detail-value">{{ selectedDepartment.id }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">部门名称：</span>
        <span class="detail-value">{{ selectedDepartment.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">部门负责人：</span>
        <span class="detail-value">{{ selectedDepartment.leaderName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">上级部门：</span>
        <span class="detail-value">{{ selectedDepartment.parentName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">部门状态：</span>
        <span class="detail-value">
          <el-tag :type="selectedDepartment.status === 1 ? 'success' : 'danger'" size="small">
            {{ selectedDepartment.statusText }}
          </el-tag>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">部门描述：</span>
        <div class="detail-description">{{ selectedDepartment.description || '暂无描述' }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue'
import Layout from '@/components/Layout.vue'
import type {FormInstance} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useDeptStore} from '@/stores/department'
import {useUserStore} from '@/stores/user'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
const { hasPermission } = usePermissionCheck()

// 使用部门状态管理
const deptStore = useDeptStore()
const userStore = useUserStore()

// 表单引用
const departmentFormRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  leaderId: [
    { required: true, message: '请选择部门负责人', trigger: 'change' }
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
const parentDepartment = ref('')

// 计算属性：获取部门列表和总数
const departmentList = computed(() => deptStore.departmentList)
const total = computed(() => deptStore.pagination.total)
const loading = computed(() => deptStore.loading)

// 部门负责人选项
const leaderOptions = ref([])
// 上级部门选项
const parentDepartmentOptions = ref([])
// 批量删除多选
const selectedDepartments = ref([]);

// Department modal related refs
const departmentModalVisible = ref(false)
const viewDepartmentModalVisible = ref(false)
const isEditing = ref(false)

interface Department {
  id: number | null;
  name: string;
  leaderId: number | null;
  leaderName?: string;
  parentId: number | null;
  parentName?: string;
  status: number;
  statusText?: string;
  description: string;
}

// 修改部门表单的初始化
const departmentForm = reactive<Department>({
  id: null,
  name: '',
  leaderId: null,
  parentId: null,
  status: 1, // 默认启用，值为1
  description: ''
})
const selectedDepartment = ref<Department | null>(null)

const handleSelectionChange = (val) => {
  selectedDepartments.value = val;
};

// 初始化加载数据
onMounted(async () => {
  await Promise.all([
    fetchDepartments(),
    fetchLeaderOptions(),
    fetchParentDepartmentOptions()
  ])
})

// 获取部门列表
const fetchDepartments = async () => {
  const query = {
    status: departmentStatus.value !== '' ? departmentStatus.value : undefined,
    keyword: searchKeyword.value || undefined,
    parentId: parentDepartment.value || undefined
  }
  await deptStore.getPagingDepartmentListAction(currentPage.value, pageSize.value, query)
}

// 获取部门负责人选项
const fetchLeaderOptions = async () => {
  leaderOptions.value = await userStore.getUsersAction()
}

// 获取上级部门选项
const fetchParentDepartmentOptions = async () => {
  parentDepartmentOptions.value = await deptStore.getParentDepartmentsAction()
}

// 处理分页变化
const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await fetchDepartments()
  await fetchLeaderOptions()
  await fetchParentDepartmentOptions()
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  await fetchDepartments()
  await fetchLeaderOptions()
  await fetchParentDepartmentOptions()
}

// 搜索部门
const handleSearch = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchDepartments()
  await fetchLeaderOptions()
  await fetchParentDepartmentOptions()
}

// 重置搜索条件
const resetSearch = async () => {
  searchKeyword.value = ''
  departmentStatus.value = ''
  parentDepartment.value = ''
  currentPage.value = 1
  await fetchDepartments()
  await fetchLeaderOptions()
  await fetchParentDepartmentOptions()
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
  departmentForm.leaderId = null
  departmentForm.parentId = null
  departmentForm.status = 1 // 默认启用，值为1
  departmentForm.description = ''
  departmentModalVisible.value = true
}

// 编辑部门
const editDepartment = async (department: Department) => {
  isEditing.value = true
  Object.assign(departmentForm, {
    id: department.id,
    name: department.name,
    leaderId: department.leaderId,
    parentId: department.parentId,
    status: department.status,
    description: department.description
  })
  departmentModalVisible.value = true
  await fetchDepartments()
  await fetchLeaderOptions()
  await fetchParentDepartmentOptions()
}

// 查看部门详情
const viewDepartment = async (department: Department) => {
  try {
    selectedDepartment.value = department
    viewDepartmentModalVisible.value = true
  } catch (error) {
    ElMessage.error('系统异常，请联系管理员')
  }
}

// 切换部门状态（启用/禁用）
const toggleDepartmentStatus = (department: Department) => {
  const newStatus = department.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'

  ElMessageBox.confirm(
      `确定要${actionText}该部门吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await deptStore.updateDepartmentStatusAction(department.id, newStatus)
    if (success) {
      ElMessage.success(`部门已${actionText}`)
      await fetchDepartments()
      await fetchLeaderOptions()
      await fetchParentDepartmentOptions()
    }
  }).catch(() => {
  })
}

// 保存部门（添加或更新）
const saveDepartment = async () => {
  if (!departmentFormRef.value) return
  await departmentFormRef.value.validate()

  if (isEditing.value && departmentForm.id !== null) {
    // 更新部门
    const success = await deptStore.updateDepartmentAction(departmentForm.id, {
      name: departmentForm.name,
      leaderId: departmentForm.leaderId,
      parentId: departmentForm.parentId,
      status: departmentForm.status,
      description: departmentForm.description
    })
    if (success) {
      departmentModalVisible.value = false
    }
  } else {
    // 添加部门
    const success = await deptStore.addDepartmentAction({
      name: departmentForm.name,
      leaderId: departmentForm.leaderId,
      parentId: departmentForm.parentId,
      status: departmentForm.status,
      description: departmentForm.description
    })
    if (success) {
      departmentModalVisible.value = false
    }
  }
  await fetchDepartments()
  await fetchLeaderOptions()
  await fetchParentDepartmentOptions()
}

// 删除部门
const deleteDepartment = (department: Department) => {
  ElMessageBox.confirm(
      `确定要删除部门"${department.name}"吗？此操作不可恢复！`,
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
      await fetchDepartments()
      await fetchLeaderOptions()
      await fetchParentDepartmentOptions()
    }
  }).catch(() => {
  })
}

// 批量删除项目
const batchDeleteDepartments = () => {
  if (selectedDepartments.value.length === 0) {
    ElMessage.warning('请至少选择一个部门')
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedDepartments.value.length} 个部门吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const projectIds = selectedDepartments.value.map(department => department.id)
    const success = await deptStore.batchDeleteDepartmentsAction(projectIds)
    if (success) {
      ElMessage.success(`已成功删除 ${selectedDepartments.value.length} 个部门`)
      selectedDepartments.value = []
      await fetchDepartments()
      await fetchLeaderOptions()
      await fetchParentDepartmentOptions()
    }
  }).catch(() => {
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

  .detail-description {
    color: #666;
    margin-top: 8px;
    line-height: 1.6;
    white-space: pre-wrap;
    background-color: #f8f9fa;
    padding: 12px;
    border-radius: 4px;
  }
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

  .department-detail-content {
    .detail-label {
      color: #e5e7eb;
    }

    .detail-value {
      color: #9ca3af;
    }

    .detail-description {
      background-color: #363636;
      color: #e5e7eb;
    }
  }
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .department-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .white-bg-input {
    width: 100%;
  }
}
</style>