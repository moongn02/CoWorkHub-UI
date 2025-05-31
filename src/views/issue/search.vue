<template>
  <Layout>
    <template #content>
      <div class="issue-list-container">
        <!-- 搜索区域 -->
        <el-card class="search-card" shadow="hover">
          <div class="search-form">
            <el-form :inline="true" :model="searchForm" class="demo-form-inline">
              <el-form-item label="问题编号">
                <el-input v-model="searchForm.id" placeholder="问题编号" clearable />
              </el-form-item>
              <el-form-item label="关联任务编号">
                <el-input v-model="searchForm.taskId" placeholder="任务编号" clearable />
              </el-form-item>
              <el-form-item label="问题状态">
                <el-select v-model="searchForm.status" placeholder="问题状态" clearable filterable>
                  <el-option label="全部" value="" />
                  <el-option label="已分派" value="1" />
                  <el-option label="处理中" value="2" />
                  <el-option label="已解决" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="创建人">
                <el-select v-model="searchForm.creatorId" placeholder="创建人" clearable filterable>
                  <el-option
                      v-for="item in userOptions"
                      :key="item.id"
                      :label="item.realName"
                      :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="测试人员">
                <el-select v-model="searchForm.testerId" placeholder="测试人员" clearable filterable>
                  <el-option
                      v-for="item in userOptions"
                      :key="item.id"
                      :label="item.realName"
                      :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="处理人">
                <el-select v-model="searchForm.handlerId" placeholder="处理人" clearable filterable>
                  <el-option
                      v-for="item in userOptions"
                      :key="item.id"
                      :label="item.realName"
                      :value="item.id"
                  />
                </el-select>
              </el-form-item>
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
              <el-form-item label="问题类型">
                <el-select v-model="searchForm.type" placeholder="请选择问题类型" class="white-bg-input" style="width: 250px">
                  <el-option label="全部" value="" />
                  <el-option label="Bug" value="1" />
                  <el-option label="需求不明确" value="2" />
                  <el-option label="UI" value="3" />
                  <el-option label="建议" value="4" />
                </el-select>
              </el-form-item>
              <el-form-item label="BUG产生原因">
                <el-select v-model="searchForm.bugCause" placeholder="请选择问题类型" class="white-bg-input" style="width: 250px">
                  <el-option label="全部" value="" />
                  <el-option label="代码错误" value="1" />
                  <el-option label="未实现需求" value="2" />
                  <el-option label="测试遗漏" value="3" />
                  <el-option label="历史遗留问题" value="4" />
                  <el-option label="兼容适配" value="5" />
                  <el-option label="其他" value="6" />
                </el-select>
              </el-form-item>
              <el-form-item label="严重程度">
                <el-select v-model="searchForm.severity" placeholder="严重程度" clearable filterable>
                  <el-option label="全部" value="" />
                  <el-option label="致命错误【1级】" value="1" />
                  <el-option label="严重错误【2级】" value="2" />
                  <el-option label="一般错误【3级】" value="3" />
                  <el-option label="细微错误【4级】" value="4" />
                  <el-option label="改进错误【5级】" value="5" />
                </el-select>
              </el-form-item>
              <el-form-item label="紧急程度">
                <el-select v-model="searchForm.urgency" placeholder="紧急程度" clearable filterable>
                  <el-option label="全部" value="" />
                  <el-option label="一般" value="0" />
                  <el-option label="紧急" value="1" />
                </el-select>
              </el-form-item>
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
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>

        <!-- 问题列表 -->
        <el-card class="issue-table-card" shadow="hover">
          <el-table
              v-loading="loading"
              :data="issueList"
              style="width: 100%"
              border
          >
            <el-table-column prop="id" label="问题编号" width="90" />
            <el-table-column prop="title" label="问题标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="projectName" label="项目" width="140" show-overflow-tooltip />
            <el-table-column prop="departmentName" label="部门" width="100" show-overflow-tooltip />
            <el-table-column prop="testerName" label="测试人员" width="90" />
            <el-table-column prop="handlerName" label="处理人" width="90" />
            <el-table-column label="状态" width="90">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ scope.row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="期望完成时间" width="150">
              <template #default="scope">
                {{ formatDateTime(scope.row.expectedTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="typeText" label="问题类型" width="90" />
            <el-table-column label="严重程度" width="110">
              <template #default="scope">
                <el-tag :type="getSeverityType(scope.row.severity)" size="small">
                  {{ scope.row.severityText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="紧急程度" width="110">
              <template #default="scope">
                <el-tag type="danger" v-if="scope.row.urgency === 1" size="small">紧急</el-tag>
                <span v-else>一般</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button v-if="hasPermission('issue:search:view')"
                           type="primary" size="small"
                           @click="viewIssueDetail(scope.row.id)">查看</el-button>
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
import {ref, reactive, onMounted, watch, computed} from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { ElMessage } from 'element-plus'
import { useIssueStore } from '@/stores/issue'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { useDeptStore } from '@/stores/department'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
const { hasPermission } = usePermissionCheck()

const router = useRouter()
const issueStore = useIssueStore()
const userStore = useUserStore()
const projectStore = useProjectStore()
const deptStore = useDeptStore()

// 搜索表单
const searchForm = reactive({
  id: '',
  taskId: '',
  title: '',
  status: '',
  creatorId: '',
  testerId: '',
  handlerId: '',
  projectId: '',
  departmentId: '',
  type: '',
  bugCause: '',
  severity: '',
  urgency: '',
  pageNum: 1,
  pageSize: 10
})

// 日期范围
const dateRange = ref([])

// 问题列表数据
const issueList = computed(() => issueStore.issueList)
const loading = ref(false)
const pagination = ref({
  total: 0,
  current: 1,
  size: 10
})

// 下拉选项
const userOptions = ref([])
const departmentTreeData = ref([])
const projectTreeData = ref([])

// 页面挂载时获取数据
onMounted(() => {
  fetchOptions()
  fetchIssues()
})

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

// 获取问题列表
const fetchIssues = async () => {
  loading.value = true
  // 构建查询参数
  const params = {
    id: searchForm.id || undefined,
    taskId: searchForm.taskId || undefined,
    status: searchForm.status || undefined,
    creatorId: searchForm.creatorId || undefined,
    testerId: searchForm.testerId || undefined,
    handlerId: searchForm.handlerId || undefined,
    projectId: searchForm.projectId || undefined,
    departmentId: searchForm.departmentId || undefined,
    type: searchForm.type || undefined,
    bugCause: searchForm.bugCause || undefined,
    severity: searchForm.severity || undefined,
    urgency: searchForm.urgency || undefined,
    pageNum: searchForm.pageNum,
    pageSize: searchForm.pageSize
  }

  // 添加日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }

  const result = await issueStore.getIssueListAction(params)
  if (result) {
    issueList.value = result.records
    pagination.value.total = result.total
  }

  loading.value = false
}

// 查询处理
const handleSearch = () => {
  searchForm.pageNum = 1
  fetchIssues()
}

// 重置搜索条件
const resetSearch = () => {
  // 重置搜索表单
  Object.keys(searchForm).forEach(key => {
    if (key !== 'pageNum' && key !== 'pageSize') {
      searchForm[key] = ''
    }
  })
  searchForm.pageNum = 1
  dateRange.value = []
  fetchIssues()
}

// 页码变化
const handleCurrentChange = (val) => {
  searchForm.pageNum = val
  fetchIssues()
}

// 每页数量变化
const handleSizeChange = (val) => {
  searchForm.pageSize = val
  searchForm.pageNum = 1
  fetchIssues()
}

// 查看问题详情
const viewIssueDetail = (id) => {
  router.push(`/issue/${id}`)
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'

  try {
    const date = new Date(dateTimeStr)
    if (isNaN(date.getTime())) return '-'

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return '-'
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'info',     // 已分派
    2: 'primary',  // 处理中
    3: 'success'   // 已解决
  }
  return typeMap[status] || 'info'
}

// 获取严重程度类型
const getSeverityType = (severity) => {
  const typeMap = {
    1: 'danger',   // 致命错误
    2: 'warning',  // 严重错误
    3: 'primary',  // 一般错误
    4: 'info',     // 细微错误
    5: 'success'   // 改进错误
  }
  return typeMap[severity] || 'info'
}

</script>

<style scoped>
.issue-list-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card, .issue-table-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-card:hover, .issue-table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
}
</style>