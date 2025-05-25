<template>
  <Layout>
    <template #content>
      <div class="task-search">
        <!-- 搜索条件区域 -->
        <el-card class="search-card">
          <el-form :model="searchForm" label-width="100px" inline>
            <!-- 基本信息搜索 -->
            <el-form-item label="任务编号">
              <el-input v-model="searchForm.id" placeholder="请输入任务编号" clearable />
            </el-form-item>
            <el-form-item label="父任务编号">
              <el-input v-model="searchForm.parentTaskId" placeholder="请输入父任务编号" clearable />
            </el-form-item>
            <el-form-item label="优先级">
              <el-select v-model="searchForm.priority" placeholder="请选择" clearable filterable>
                <el-option label="高优先级" :value="1" />
                <el-option label="中优先级" :value="2" />
                <el-option label="低优先级" :value="3" />
              </el-select>
            </el-form-item>

            <!-- 人员信息搜索 -->
            <el-form-item label="创建人">
              <el-select v-model="searchForm.creatorId" placeholder="请选择" clearable filterable>
                <el-option
                    v-for="item in userOptions"
                    :key="item.id"
                    :label="item.realName"
                    :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="执行人">
              <el-select v-model="searchForm.handlerId" placeholder="请选择" clearable filterable>
                <el-option
                    v-for="item in userOptions"
                    :key="item.id"
                    :label="item.realName"
                    :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="验收人">
              <el-select v-model="searchForm.acceptorId" placeholder="请选择" clearable filterable>
                <el-option
                    v-for="item in userOptions"
                    :key="item.id"
                    :label="item.realName"
                    :value="item.id"
                />
              </el-select>
            </el-form-item>

            <!-- 组织信息搜索 -->
            <el-form-item label="所属项目">
              <el-cascader
                  v-model="searchForm.projectId"
                  :options="projectTreeData"
                  placeholder="请选择项目"
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
                  <div>
                    {{ data.name }}
                  </div>
                </template>
              </el-cascader>
            </el-form-item>
            <el-form-item label="所属部门">
              <el-cascader
                  v-model="searchForm.departmentId"
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
                  <div>
                    {{ data.name }}
                  </div>
                </template>
              </el-cascader>
            </el-form-item>


            <!-- 状态信息搜索 -->
            <el-form-item label="任务状态">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable filterable>
                <el-option label="已分派" :value="1" />
                <el-option label="进行中" :value="2" />
                <el-option label="已完成" :value="3" />
              </el-select>
            </el-form-item>

            <!-- 时间范围搜索 -->
            <el-form-item label="期望完成时间">
              <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <!-- 搜索按钮 -->
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 任务列表 -->
        <el-card class="table-card">
          <el-table :data="taskList" v-loading="loading" border style="width: 100%">
            <el-table-column prop="id" label="任务编号" width="90" />
            <el-table-column prop="title" label="任务标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="projectName" label="项目" width="140" />
            <el-table-column prop="departmentName" label="部门" width="100" />
            <el-table-column prop="handlerName" label="执行人" width="100" />
            <el-table-column label="任务状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="100">
              <template #default="scope">
                <el-tag :type="getPriorityType(scope.row.priority)">
                  {{ scope.row.priorityText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="期望完成时间" width="150">
              <template #default="scope">
                {{ formatDateTime(scope.row.expectedTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button v-if="hasPermission('task:search:view')"
                           type="primary" size="small"
                           @click="viewTaskDetail(scope.row.id)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
                v-model:current-page="searchForm.pageNum"
                v-model:page-size="searchForm.pageSize"
                :page-sizes="[10, 15, 20]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pagination.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'
import { useDeptStore } from '@/stores/department'
import { useProjectStore } from '@/stores/project'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
const { hasPermission } = usePermissionCheck()

// 初始化路由
const router = useRouter()

// 初始化stores
const taskStore = useTaskStore()
const userStore = useUserStore()
const deptStore = useDeptStore()
const projectStore = useProjectStore()

// 数据
const loading = ref(false)
const pagination = ref({
  total: 0,
  current: 1,
  size: 10
})
const taskList = computed(() => taskStore.taskList)

// 下拉选项
const userOptions = ref([])
const departmentTreeData = ref([])
const projectTreeData = ref([])

// 搜索表单
const searchForm = reactive({
  id: '',
  title: '',
  creatorId: '',
  handlerId: '',
  acceptorId: '',
  projectId: '',
  departmentId: '',
  parentTaskId: '',
  status: '',
  priority: '',
  pageNum: 1,
  pageSize: 10
})

// 日期范围
const dateRange = ref([])

// 获取选项数据
const fetchOptions = async () => {
  try {
    // 获取用户列表
    const userData = await userStore.getUsersAction()
    userOptions.value = userData || []

    // 获取部门列表
    const deptDataTree = await deptStore.getDepartmentTreeAction()
    departmentTreeData.value = deptDataTree || []

    // 获取项目列表
    const projectDataTree = await projectStore.getProjectTreeAction()
    projectTreeData.value = projectDataTree || []
  } catch (error) {
    ElMessage.error('获取选项数据失败')
  }
}

// 获取任务列表
const fetchTasks = async () => {
  const query = {
    id: searchForm.id || undefined,
    title: searchForm.title || undefined,
    creatorId: searchForm.creatorId || undefined,
    handlerId: searchForm.handlerId || undefined,
    acceptorId: searchForm.acceptorId || undefined,
    projectId: searchForm.projectId || undefined,
    departmentId: searchForm.departmentId || undefined,
    parentTaskId: searchForm.parentTaskId || undefined,
    status: searchForm.status !== '' ? searchForm.status : undefined,
    priority: searchForm.priority !== '' ? searchForm.priority : undefined,
    pageNum: searchForm.pageNum,
    pageSize: searchForm.pageSize
  }

  if (dateRange.value && dateRange.value.length === 2) {
    // 确保开始日期是当天开始时间，结束日期是当天结束时间
    query.startDate = dateRange.value[0]
    query.endDate = dateRange.value[1]
  }

  const result = await taskStore.getPagingTaskListAction(query)
  if (result) {
    taskList.value = result.records
    pagination.value.total = result.total
  }
}

// 搜索按钮点击事件
const handleSearch = () => {
  searchForm.pageNum = 1
  fetchTasks()
}

// 重置表单
const resetForm = () => {
  // 重置所有搜索条件
  Object.keys(searchForm).forEach(key => {
    if (key !== 'pageNum' && key !== 'pageSize') {
      searchForm[key] = ''
    }
  })

  // 重置时间范围
  dateRange.value = []

  // 重置页码
  searchForm.pageNum = 1

  // 重新搜索
  fetchTasks()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  searchForm.pageNum = val
  fetchTasks()
}

// 每页数量变化
const handleSizeChange = (val) => {
  searchForm.pageSize = val;
  searchForm.pageNum = 1;
  fetchTasks();
};

// 查看任务详情
const viewTaskDetail = (id) => {
  router.push(`/task/${id}`)
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'

  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateTimeStr || '-'
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'info',
    2: 'primary',
    3: 'success'
  }
  return typeMap[status] || 'info'
}

// 获取优先级类型
const getPriorityType = (priority: number) => {
  const typeMap = {
    1: 'danger',
    2: 'warning',
    3: 'primary'
  }
  return typeMap[priority] || 'info'
}

// 页面挂载时获取数据
onMounted(() => {
  fetchOptions()
  fetchTasks()
})
</script>

<style scoped>
.task-search {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card, .table-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-card:hover, .table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 5px 0;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-select) {
  width: auto;
  min-width: 100px;
}

:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-pagination .el-select .el-input) {
  width: auto;
  min-width: 110px;
}

:deep(.el-select-dropdown__item) {
  min-width: 60px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    align-items: center;
  }

  :deep(.el-pagination) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }
}
</style>