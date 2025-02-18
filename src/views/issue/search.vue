<template>
  <Layout>
    <template #content>
      <div class="search-question-container">
        <el-card class="search-card">
          <template #header>
            <h3 class="card-title">搜索问题</h3>
          </template>

          <!-- 搜索表单 -->
          <el-form :model="searchForm" class="search-form">
            <el-form-item label="ID">
              <el-input v-model="searchForm.questionId" placeholder="请输入问题ID" class="white-bg-input" style="width: 250px"/>
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="searchForm.keyword" placeholder="请输入关键词" class="white-bg-input" style="width: 250px"/>
            </el-form-item>
            <el-form-item label="执行人">
              <el-input v-model="searchForm.executor" placeholder="请输入执行人" class="white-bg-input" style="width: 250px"/>
            </el-form-item>
            <el-form-item label="测试人">
              <el-input v-model="searchForm.tester" placeholder="请输入测试人" class="white-bg-input" style="width: 250px"/>
            </el-form-item>
            <el-form-item label="关联任务ID">
              <el-input v-model="searchForm.taskNumber" placeholder="请输入关联任务ID" class="white-bg-input" style="width: 220px"/>
            </el-form-item>
            <el-form-item label="项目">
              <el-select v-model="searchForm.project" placeholder="请选择项目" class="white-bg-input" style="width: 250px">
                <el-option label="全部" value="" />
                <el-option label="游戏" value="游戏" />
                <el-option label="Web" value="Web" />
                <el-option label="IOS" value="IOS" />
              </el-select>
            </el-form-item>
            <el-form-item label="部门">
              <el-select v-model="searchForm.department" placeholder="请选择部门" class="white-bg-input" style="width: 250px">
                <el-option label="全部" value="" />
                <el-option label="技术" value="技术" />
                <el-option label="市场" value="市场" />
                <el-option label="设计" value="设计" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期范围" style="width: 30%">
              <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="white-bg-input"
              />
            </el-form-item>
            <div class="break-line"></div>
            <el-form-item label="问题类型">
              <el-select v-model="searchForm.questionType" placeholder="请选择问题类型" class="white-bg-input" style="width: 250px">
                <el-option label="全部" value="" />
                <el-option label="功能问题" value="functional" />
                <el-option label="性能问题" value="performance" />
                <el-option label="UI问题" value="ui" />
                <el-option label="安全问题" value="security" />
              </el-select>
            </el-form-item>
            <el-form-item label="问题状态">
              <el-select v-model="searchForm.status" placeholder="请选择问题状态" class="white-bg-input" style="width: 250px">
                <el-option label="全部" value="" />
                <el-option label="待处理" value="pending" />
                <el-option label="处理中" value="in_progress" />
                <el-option label="已解决" value="resolved" />
                <el-option label="已关闭" value="closed" />
              </el-select>
            </el-form-item>
            <el-form-item label="测试轮次">
              <el-select v-model="searchForm.round" placeholder="请选择测试轮次" class="white-bg-input" style="width: 250px">
                <el-option label="0" value="0" />
                <el-option label="1" value="1" />
                <el-option label="2" value="2" />
                <el-option label="3" value="3" />
                <el-option label="4" value="4" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>

          <!-- 搜索结果表格 -->
          <div class="table-container">
            <el-table
                :data="displayedResults"
                style="width: 100%"
                v-loading="loading"
            >
              <el-table-column prop="questionId" label="ID" width="100" />
              <el-table-column prop="department" label="部门" width="120" />
              <el-table-column prop="project" label="项目" width="120" />
              <el-table-column prop="executor" label="执行人" width="120" />
              <el-table-column prop="tester" label="测试人员" width="120" />
              <el-table-column prop="expectedCompletionTime" label="期望完成时间" width="180" />
              <el-table-column prop="title" label="问题标题" min-width="200" />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewQuestion(scope.row)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
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
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  questionId: '',
  keyword: '',
  executor: '',
  tester: '',
  status: '',
  round: '',
  project: '',
  department: '',
  questionType: '',
  taskNumber: '',
  dateRange: [],
})

const searchResults = ref([
  { questionId: 'Q001', department: '研发部', project: '项目A', title: '登录功能异常', executor: '张三', tester: '李四', expectedCompletionTime: '2025-03-15 18:00:00' },
  { questionId: 'Q002', department: '市场部', project: '项目B', title: '页面加载缓慢', executor: '王五', tester: '赵六', expectedCompletionTime: '2025-03-10 12:00:00' },
  { questionId: 'Q003', department: '研发部', project: '项目A', title: 'UI样式错误', executor: '刘七', tester: '孙八', expectedCompletionTime: '2025-03-20 18:00:00' },
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)

const displayedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return searchResults.value.slice(start, end)
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const viewQuestion = (question) => {
  ElMessage.info(`查看问题：${question.title}`)
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}
</script>

<style scoped>
.search-question-container {
  padding: 20px;
}

.search-card {
  border-radius: 8px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.el-form-item {
  margin-right: 20px;
}

.break-line {
  flex-basis: 100%;
  height: 0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-container {
  margin-top: 20px;
}

.table-container :deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 2px;
}

.table-container :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #909399;
}

.table-container :deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 暗色主题适配 */
:deep(.dark) {
  .search-card {
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

  .table-container :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
    background-color: #606266;
  }

  .table-container :deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
    background-color: #1c1c1c;
  }
}
</style>