<template>
  <Layout>
    <template #content>
      <div class="project-management-container">
        <el-card class="project-card" shadow="hover">
          <template #header>
            <div class="project-header">
              <h3 class="card-title">项目管理</h3>
              <el-button type="primary" @click="showAddProjectModal">添加项目</el-button>
            </div>
          </template>

          <!-- Project search -->
          <div class="project-actions">
            <el-cascader
                v-model="departmentId"
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
            <el-select
                v-model="parentId"
                placeholder="一级项目"
                class="white-bg-input"
                filterable
                clearable
            >
              <el-option label="全部" value="" />
              <el-option
                  v-for="project in parentProjectOptions"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
              />
            </el-select>
            <el-select v-model="projectStatus" placeholder="项目状态" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-input
                v-model="searchKeyword"
                placeholder="搜索项目"
                class="white-bg-input"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>

          <!-- Project table -->
          <el-table :data="projectList" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="100" />
            <el-table-column label="项目名称" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.name" placement="top">
                  <span>{{ truncateText(scope.row.name, 15) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="parentName" label="父级项目" min-width="180" />
            <el-table-column prop="departmentName" label="所属部门" min-width="170" />
            <el-table-column prop="updaterName" label="最后更新人" min-width="170" />
            <el-table-column label="状态" width="150">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" @click="viewProject(scope.row)" icon="View" circle title="查看" />
                <el-button
                    :type="scope.row.status === 1 ? 'danger' : 'success'"
                    @click="toggleProjectStatus(scope.row)"
                    :icon="scope.row.status === 1 ? 'CircleClose' : 'Check'"
                    circle
                    :title="scope.row.status === 1 ? '禁用' : '启用'"
                />
                <el-button type="warning" @click="editProject(scope.row)" icon="Edit" circle title="编辑" />
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

  <!-- Add/Edit Project Modal -->
  <el-dialog
      v-model="projectModalVisible"
      :title="isEditing ? '编辑项目' : '添加项目'"
      width="40%"
      center
  >
    <el-form :model="projectForm" label-width="120px" :rules="formRules" ref="projectFormRef">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="projectForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="父级项目" prop="parentId">
        <el-select v-model="projectForm.parentId" placeholder="请选择父级项目" filterable clearable>
          <el-option label="无父级项目" :value="0" />
          <el-option
              v-for="project in parentProjectOptions"
              :key="project.id"
              :label="project.name"
              :value="project.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属部门" prop="departmentId">
        <el-cascader
            v-model="projectForm.departmentId"
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
      <el-form-item label="项目状态" prop="status">
        <el-select v-model="projectForm.status">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="projectModalVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProject">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- View Project Modal -->
  <el-dialog
      v-model="viewProjectModalVisible"
      title="项目详情"
      width="40%"
      center
      class="project-detail-dialog"
  >
    <div v-if="selectedProject" class="project-detail-content">
      <div class="detail-item">
        <span class="detail-label">项目ID：</span>
        <span class="detail-value">{{ selectedProject.id }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">项目名称：</span>
        <span class="detail-value">{{ selectedProject.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">父级项目：</span>
        <span class="detail-value">{{ selectedProject.parentName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">所属部门：</span>
        <span class="detail-value">{{ selectedProject.departmentName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">最后更新人：</span>
        <span class="detail-value">{{ selectedProject.updaterName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">项目状态：</span>
        <span class="detail-value">
          <el-tag :type="selectedProject.status === 1 ? 'success' : 'danger'" size="small">
            {{ selectedProject.statusText }}
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
import {useProjectStore} from '@/stores/project'
import {useDeptStore} from '@/stores/department'
import {useUserStore} from '@/stores/user'

// 使用项目状态管理
const projectStore = useProjectStore()
const deptStore = useDeptStore()
const userStore = useUserStore()

// 表单引用
const projectFormRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ]
}

// 分页和筛选相关
const currentPage = ref(1)
const pageSize = ref(10)
const projectStatus = ref('')
const searchKeyword = ref('')
const departmentId = ref('')
const parentId = ref('')

// 计算属性：获取项目列表和总数
const projectList = computed(() => projectStore.projectList)
const total = computed(() => projectStore.pagination.total)
const loading = computed(() => projectStore.loading)

// 部门选项
const departmentOptions = ref([])
// 部门树数据
const departmentTreeData = ref([])
// 父级项目选项
const parentProjectOptions = ref([])

// Project modal related refs
const projectModalVisible = ref(false)
const viewProjectModalVisible = ref(false)
const isEditing = ref(false)

interface Project {
  id: number | null;
  name: string;
  parentId: number | null;
  parentName?: string;
  departmentId: number | null;
  departmentName?: string;
  updaterId: number | null;
  updaterName?: string;
  status: number;
  statusText?: string;
}

// 修改项目表单的初始化
const projectForm = reactive<Project>({
  id: null,
  name: '',
  parentId: null,
  departmentId: null,
  updaterId: null,
  status: 1 // 默认启用，值为1
})
const selectedProject = ref<Project | null>(null)

const handleOptionClickSearch = (node, data) => {
  departmentId.value = data.id;
};

const handleOptionClickSave = (node, data) => {
  projectForm.departmentId = data.id;
};

// 初始化加载数据
onMounted(async () => {
  await Promise.all([
    fetchProjects(),
    fetchDepartmentTree(),
    fetchParentProjectOptions()
  ])
})

// 获取项目列表
const fetchProjects = async () => {
  const query = {
    status: projectStatus.value !== '' ? projectStatus.value : undefined,
    keyword: searchKeyword.value || undefined,
    departmentId: departmentId.value || undefined,
    parentId: parentId.value || undefined
  }
  await projectStore.getPagingProjectListAction(currentPage.value, pageSize.value, query)
}

// 获取部门树
const fetchDepartmentTree = async () => {
  departmentTreeData.value = await deptStore.getDepartmentTreeAction()
}

// 获取父级项目选项
const fetchParentProjectOptions = async () => {
  parentProjectOptions.value = await projectStore.getParentProjectsAction()
}

// 处理分页变化
const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await fetchProjects()
  await fetchParentProjectOptions()
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  await fetchProjects()
  await fetchParentProjectOptions()
}

// 搜索项目
const handleSearch = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchProjects()
  await fetchParentProjectOptions()
}

// 重置搜索条件
const resetSearch = async () => {
  searchKeyword.value = ''
  projectStatus.value = ''
  departmentId.value = ''
  parentId.value = ''
  currentPage.value = 1
  await fetchProjects()
  await fetchParentProjectOptions()
}

// 文本截断
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 显示添加项目模态框
const showAddProjectModal = () => {
  isEditing.value = false
  projectForm.id = null
  projectForm.name = ''
  projectForm.parentId = null
  projectForm.departmentId = null
  projectForm.updaterId = null
  projectForm.status = 1 // 默认启用，值为1
  projectModalVisible.value = true
}

// 编辑项目
const editProject = (project: Project) => {
  isEditing.value = true
  Object.assign(projectForm, {
    id: project.id,
    name: project.name,
    parentId: project.parentId,
    departmentId: project.departmentId,
    updaterId: project.updaterId,
    status: project.status
  })
  projectModalVisible.value = true
}

// 查看项目详情
const viewProject = async (project: Project) => {
  try {
    selectedProject.value = project
    viewProjectModalVisible.value = true
  } catch (error) {
    ElMessage.error('系统异常，请联系管理员')
  }
}

// 切换项目状态（启用/禁用）
const toggleProjectStatus = (project: Project) => {
  const newStatus = project.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'

  ElMessageBox.confirm(
      `确定要${actionText}该项目吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    const success = await projectStore.updateProjectStatusAction(project.id, newStatus)
    if (success) {
      ElMessage.success(`项目已${actionText}`)
      await fetchProjects()
      await fetchParentProjectOptions()
    }
  }).catch(() => {
  })
}

// 保存项目（添加或更新）
const saveProject = async () => {
  if (!projectFormRef.value) return

  await projectFormRef.value.validate(async (valid) => {
    if (valid) {
      if (isEditing.value && projectForm.id !== null) {
        // 更新项目
        const success = await projectStore.updateProjectAction(projectForm.id, {
          name: projectForm.name,
          parentId: projectForm.parentId,
          departmentId: projectForm.departmentId,
          status: projectForm.status
        })
        if (success) {
          projectModalVisible.value = false
        }
      } else {
        // 添加项目
        const success = await projectStore.addProjectAction({
          name: projectForm.name,
          parentId: projectForm.parentId,
          departmentId: projectForm.departmentId,
          status: projectForm.status
        })
        if (success) {
          projectModalVisible.value = false
        }
      }
      await fetchProjects()
      await fetchParentProjectOptions()
    }
  })
}
</script>

<style scoped>
.project-management-container {
  padding: 20px;
}

.project-card {
  border-radius: 8px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-actions {
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
:deep(.project-detail-dialog) {
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

.project-detail-content {
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
  .project-card {
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

  .project-detail-content {
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
  .project-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .white-bg-input {
    width: 100%;
  }
}
</style>