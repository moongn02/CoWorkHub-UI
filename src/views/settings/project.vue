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
            <el-input
                v-model="searchKeyword"
                placeholder="搜索项目"
                class="white-bg-input"
            />
            <el-select v-model="projectStatus" placeholder="项目状态" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="启用" value="ENABLE" />
              <el-option label="禁用" value="DISABLE" />
            </el-select>
            <el-select v-model="department" placeholder="部门" class="white-bg-input">
              <el-option label="全部" value="" />
              <el-option label="技术部" value="技术部" />
              <el-option label="市场部" value="市场部" />
              <el-option label="运营部" value="运营部" />
              <el-option label="财务部" value="财务部" />
            </el-select>
          </div>

          <!-- Project table -->
          <el-table :data="filteredProjects" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="100" />
            <el-table-column label="项目名称" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.name" placement="top">
                  <span>{{ truncateText(scope.row.name, 15) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="项目简称" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.shortName" placement="top">
                  <span>{{ truncateText(scope.row.shortName, 8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="所属部门" width="150" />
            <el-table-column prop="status" label="状态" width="150">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button type="primary" @click="viewProject(scope.row)" icon="View" circle />
                <el-button type="warning" @click="editProject(scope.row)" icon="Edit" circle />
                <el-button type="danger" @click="deleteProject(scope.row)" icon="Delete" circle />
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
      width="50%"
      center
  >
    <el-form :model="projectForm" label-width="100px">
      <el-form-item label="项目名称">
        <el-input v-model="projectForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="项目简称">
        <el-input v-model="projectForm.shortName" maxlength="10" show-word-limit />
      </el-form-item>
      <el-form-item label="所属部门">
        <el-select v-model="projectForm.department">
          <el-option label="技术部" value="技术部" />
          <el-option label="市场部" value="市场部" />
          <el-option label="运营部" value="运营部" />
          <el-option label="财务部" value="财务部" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="projectForm.status">
          <el-option label="启用" value="ENABLE" />
          <el-option label="禁用" value="DISABLE" />
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
      width="30%"
      center
      class="project-detail-dialog"
  >
    <div v-if="selectedProject" class="project-detail-content">
      <div class="detail-item">
        <span class="detail-label">项目名称：</span>
        <span class="detail-value">{{ selectedProject.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">项目简称：</span>
        <span class="detail-value">{{ selectedProject.shortName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">部门：</span>
        <span class="detail-value">{{ selectedProject.department }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">状态：</span>
        <span class="detail-value">{{ getStatusLabel(selectedProject.status) }}</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Project data
const projects = ref([
  { id: 1, name: '网站重构项目', shortName: '网站重构', department: '技术部', status: 'ENABLE'},
  { id: 2, name: '新产品营销活动', shortName: '产品营销', department: '市场部', status: 'ENABLE'},
  { id: 3, name: '财务系统升级', shortName: '财务升级', department: '财务部', status: 'DISABLE'},
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(projects.value.length)
const projectStatus = ref('')
const searchKeyword = ref('')
const department = ref('')

// Project modal related refs
const projectModalVisible = ref(false)
const viewProjectModalVisible = ref(false)
const isEditing = ref(false)
const projectForm = reactive({
  id: null,
  name: '',
  shortName: '',
  department: '',
  status: 'DISABLE',
})
const selectedProject = ref(null)

// Filter projects based on search keyword
const filteredProjects = computed(() => {
  let filtered = projects.value

  if (projectStatus.value) {
    filtered = filtered.filter(project => project.status === projectStatus.value)
  }

  if (department.value) {
    filtered = filtered.filter(project => project.department === projectStatus.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(keyword) ||
        project.shortName.toLowerCase().includes(keyword) ||
        project.department.toLowerCase().includes(keyword)
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

const showAddProjectModal = () => {
  isEditing.value = false
  projectForm.id = null
  projectForm.name = ''
  projectForm.shortName = ''
  projectForm.department = ''
  projectForm.status = 'ENABLE'
  projectModalVisible.value = true
}

const editProject = (project) => {
  isEditing.value = true
  Object.assign(projectForm, project)
  projectModalVisible.value = true
}

const viewProject = (project) => {
  selectedProject.value = project
  viewProjectModalVisible.value = true
}

const saveProject = () => {
  if (isEditing.value) {
    const index = projects.value.findIndex(project => project.id === projectForm.id)
    if (index !== -1) {
      projects.value[index] = { ...projectForm }
      ElMessage.success('项目已更新')
    }
  } else {
    const newProject = {
      ...projectForm,
      id: projects.value.length + 1,
    }
    projects.value.push(newProject)
    ElMessage.success('项目已添加')
  }
  projectModalVisible.value = false
}

const deleteProject = (project) => {
  ElMessageBox.confirm(
      '确定要删除这个项目吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      ElMessage.success('项目已删除')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
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
}

/* 弹窗整体样式 */
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

/* 内容样式 */
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

/* 暗色主题适配 */
:deep(.dark) {
  .project-detail-content {
    .detail-label {
      color: #e5e7eb;
    }

    .detail-value {
      color: #9ca3af;
    }
  }
}

</style>