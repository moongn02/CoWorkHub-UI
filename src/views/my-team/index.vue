<template>
  <Layout>
    <template #content>
      <div class="team-interface-container">
        <el-row :gutter="20">
          <!-- 左侧部门人员树 -->
          <el-col :span="6">
            <el-card class="personnel-card" shadow="hover">
              <template #header>
                <h3 class="card-title">部门人员</h3>
              </template>
              <el-tree
                  :data="personnelTree"
                  :props="defaultProps"
                  @check="handlePersonnelSelect"
                  show-checkbox
                  default-expand-all
                  node-key="id"
                  ref="personnelTreeRef"
                  v-loading="loadingPersonnel"
              >
                <template #default="{ node, data }">
                  <span :class="{ 'department-name': !data.isLeaf }">{{ node.label }}</span>
                </template>
              </el-tree>
            </el-card>
          </el-col>

          <!-- 右侧工作日志 -->
          <el-col :span="18">
            <el-card class="work-log-card" shadow="hover">
              <template #header>
                <div class="work-log-header">
                  <h3 class="card-title">工作日志</h3>
                  <div class="work-log-actions">
                    <el-select v-model="queryParams.logType" placeholder="选择日志类型" class="white-bg-input" @change="fetchWorkLogs">
                      <el-option label="全部" value="" />
                      <el-option label="日志" :value="1" />
                      <el-option label="周志" :value="2" />
                      <el-option label="月志" :value="3" />
                    </el-select>
                    <el-date-picker
                        v-model="dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        class="white-bg-input"
                        @change="handleDateRangeChange"
                    />
                  </div>
                </div>
              </template>

              <div class="work-log-content">
                <!-- 工作日志表格 -->
                <el-table :data="paginatedWorkLogs" style="width: 100%" v-loading="loadingLogs">
                  <el-table-column prop="logDateStr" label="日期" min-width="25%" align="center" />
                  <el-table-column prop="username" label="人员" min-width="25%" align="center" />
                  <el-table-column prop="type" label="类型" min-width="25%" align="center">
                    <template #default="scope">
                      <el-tag :type="getLogTypeTag(scope.row.type)">{{ scope.row.typeText }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="25%" align="center">
                    <template #default="scope">
                      <el-button type="primary" @click="viewWorkLog(scope.row)" icon="View" circle />
                    </template>
                  </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container">
                  <el-pagination
                      v-model:current-page="currentPage"
                      v-model:page-size="pageSize"
                      :page-sizes="[5, 10, 15]"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="total"
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </template>
  </Layout>

  <!-- 查看工作日志详情对话框 -->
  <el-dialog
      v-model="detailDialogVisible"
      title="工作日志详情"
      width="800px"
      destroy-on-close
      center
  >
    <div class="log-detail-content">
      <div class="log-detail-header">
        <div class="log-detail-date">
          <span>日期：{{ detailLog.logDateStr }}</span>
          <span class="log-detail-user">提交人：{{ detailLog.username }}</span>
        </div>
        <el-tag :type="getLogTypeTag(detailLog.type)" effect="dark" size="large">{{ detailLog.typeText }}</el-tag>
      </div>
      <div class="log-detail-divider"></div>
      <div class="log-detail-body" v-html="detailLog.content"></div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import { useTeamStore } from '@/stores/team'
// 初始化store
const teamStore = useTeamStore()

// 部门人员树
const personnelTree = ref([])
const loadingPersonnel = ref(false)
const personnelTreeRef = ref(null)
const selectedUserIds = ref([])

// 日志查询参数
const queryParams = reactive({
  userIds: [] as number[],
  startDate: '',
  endDate: '',
  logType: '',
  current: 1,
  size: 10
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const workLogs = ref([])
const total = ref(0)
const loadingLogs = ref(false)
const dateRange = ref([])

// 日志详情
const detailDialogVisible = ref(false)
const detailLog = reactive({
  id: 0,
  logDate: '',
  logDateStr: '',
  type: 0,
  typeText: '',
  content: '',
  username: ''
})

// 树形控件配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 计算分页后的日志列表
const paginatedWorkLogs = computed(() => workLogs.value)

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  queryParams.pageSize = val
  fetchWorkLogs()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  queryParams.pageNum = val
  fetchWorkLogs()
}

// 处理部门人员选择
const handlePersonnelSelect = (data, checked) => {
  if (personnelTreeRef.value) {
    const checkedNodes = personnelTreeRef.value.getCheckedNodes()
    // 过滤出叶子节点（用户）
    const userNodes = checkedNodes.filter((node: any) => node.isLeaf)
    selectedUserIds.value = userNodes.map((node: any) => node.id)

    // 更新查询参数并获取日志
    queryParams.userIds = selectedUserIds.value.join(',')
    queryParams.pageNum = 1  // 重置为第一页
    currentPage.value = 1
    fetchWorkLogs()
  }
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startDate = formatDate(dateRange.value[0])
    queryParams.endDate = formatDate(dateRange.value[1])
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
  fetchWorkLogs()
}

// 获取部门人员树
const fetchPersonnelTree = async () => {
  loadingPersonnel.value = true
  try {
    const data = await teamStore.getDepartmentPersonnelAction()
    personnelTree.value = data
  } catch (error) {
    console.error('获取部门人员树失败:', error)
  } finally {
    loadingPersonnel.value = false
  }
}

// 获取工作日志列表
const fetchWorkLogs = async () => {
  if (!queryParams.userIds) {
    workLogs.value = []
    total.value = 0
    return
  }

  loadingLogs.value = true
  try {
    const data = await teamStore.pagePersonnelWorkLogsAction(queryParams)
    if (data && data.records) {
      workLogs.value = data.records
      total.value = data.total
    } else {
      workLogs.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取工作日志列表失败:', error)
    workLogs.value = []
    total.value = 0
  } finally {
    loadingLogs.value = false
  }
}

// 查看工作日志详情
const viewWorkLog = async (log: any) => {
  if (!log || !log.id) return

  try {
    const logDetail = await teamStore.getWorkLogDetailAction(log.id)
    if (logDetail) {
      Object.assign(detailLog, logDetail)
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取工作日志详情失败:', error)
  }
}

// 获取日志类型标签类型
const getLogTypeTag = (type: number | string): string => {
  const typeMap: Record<string, string> = {
    1: 'primary',
    2: 'success',
    3: 'danger'
  }

  return typeMap[type as string] || 'info'
}

// 格式化日期为字符串
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchPersonnelTree()
})
</script>

<style scoped>
.team-interface-container {
  padding: 20px;
}

.personnel-card,
.work-log-card {
  border-radius: 8px;
  height: 80vh;
  overflow-y: auto;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.department-name {
  font-weight: bold;
}

.work-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-log-actions {
  display: flex;
  gap: 10px;
}

.work-log-content {
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: calc(80vh - 60px);
}

.white-bg-input {
  width: 200px;
}

.white-bg-input :deep(.el-input__wrapper) {
  background-color: white;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.white-bg-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 工作日志详情样式 */
.log-detail-content {
  padding: 20px;
}

.log-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.log-detail-date {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.log-detail-user {
  font-size: 14px;
}

.log-detail-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin-bottom: 20px;
}

.log-detail-body {
  height: 400px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f8f9fa;
  overflow-y: auto;
}

/* 富文本内容样式 */
.log-detail-body :deep(p) {
  margin: 8px 0;
}

.log-detail-body :deep(img) {
  max-width: 100%;
  height: auto;
}

.log-detail-body :deep(ul),
.log-detail-body :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.log-detail-body :deep(pre) {
  background-color: #f6f6f6;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
  white-space: pre-wrap;
}

.log-detail-body :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 12px;
  margin: 8px 0;
  color: #666;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .personnel-card,
  .work-log-card {
    margin-bottom: 20px;
  }

  .work-log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .work-log-actions {
    width: 100%;
    flex-direction: column;
  }

  .white-bg-input {
    width: 100%;
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .personnel-card,
  .work-log-card {
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

  .log-detail-body {
    background-color: #1c1c1c;
    border-color: #4a4a4a;
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
}
</style>