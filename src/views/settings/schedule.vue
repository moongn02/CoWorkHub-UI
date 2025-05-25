<template>
  <Layout>
    <template #content>
      <div class="job-schedule-container">
        <el-card class="job-card" shadow="hover">
          <template #header>
            <div class="job-header">
              <h3 class="card-title">定时管理</h3>
              <div class="header-buttons">
                <el-button v-if="hasPermission('job:batchDelete')" type="danger" @click="batchDeleteJobs" :disabled="selectedJobs.length === 0">批量删除</el-button>
                <el-button v-if="hasPermission('job:add')" type="primary" @click="handleAddJob">添加作业</el-button>
              </div>
            </div>
          </template>

          <!-- 搜索条件 -->
          <div class="job-actions">
            <el-select
                v-model="searchForm.status"
                placeholder="作业状态"
                class="white-bg-input"
                filterable
                clearable
            >
              <el-option label="全部" value="" />
              <el-option label="正常" :value="1" />
              <el-option label="暂停" :value="2" />
            </el-select>
            <el-select
                v-model="searchForm.objectType"
                placeholder="对象类型"
                class="white-bg-input"
                filterable
                clearable
            >
              <el-option label="全部" value="" />
              <el-option label="任务" value="TASK" />
              <el-option label="问题" value="ISSUE" />
              <el-option label="工作日志" value="WORK_LOG" />
            </el-select>
            <el-select
                v-model="searchForm.triggerType"
                placeholder="触发类型"
                class="white-bg-input"
                filterable
                clearable
            >
              <el-option label="全部" value="" />
              <el-option label="临期提醒" value="DEADLINE_APPROACHING" />
              <el-option label="状态变更" value="STATUS_CHANGED" />
              <el-option label="新分配提醒" value="NEW_ASSIGNMENT" />
              <el-option label="已逾期提醒" value="OVERDUE" />
            </el-select>
            <el-input
                v-model="searchForm.name"
                placeholder="搜索作业名称"
                class="white-bg-input"
                @keyup.enter="handleSearch"
            />
            <el-button v-if="hasPermission('job:search')" type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>

          <!-- 作业表格 -->
          <el-table
              :data="jobList"
              style="width: 100%"
              v-loading="loading"
              @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column label="作业名称" min-width="150">
              <template #default="scope">
                <el-tooltip :content="scope.row.name" placement="top">
                  <span>{{ truncateText(scope.row.name, 15) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="作业描述" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.description" placement="top">
                  <span>{{ truncateText(scope.row.description, 20) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="cronExpression" label="Cron表达式" width="130" />
            <el-table-column prop="status" label="作业状态" width="80">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="下次执行时间" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.nextRunTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="scope">
                <el-button v-if="hasPermission('job:viewRunLog')" type="info" @click="viewJobLogs(scope.row)" icon="Document" circle title="查看执行记录" />
                <el-button v-if="hasPermission('job:viewDetail')" type="primary" @click="viewJobDetail(scope.row)" icon="View" circle title="查看作业详情" />
                <el-button v-if="hasPermission('job:run')" type="success" @click="triggerJob(scope.row)" icon="VideoPlay" circle title="立即执行" />
                <el-button v-if="hasPermission('job:edit')" type="warning" @click="handleEditJob(scope.row)" icon="Edit" circle title="编辑" />
                <el-button
                    v-if="hasPermission('job:statusChange')"
                    :type="scope.row.status === 1 ? 'danger' : 'success'"
                    @click="scope.row.status === 1 ? pauseJob(scope.row) : resumeJob(scope.row)"
                    :icon="scope.row.status === 1 ? 'CircleClose' : 'Check'"
                    circle
                    :title="scope.row.status === 1 ? '暂停' : '启动'"
                />
                <el-button v-if="hasPermission('job:delete')" type="danger" @click="handleDeleteJob(scope.row)" icon="Delete" circle title="删除" />
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
                v-model:current-page="pagination.current"
                v-model:page-size="pagination.size"
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

  <!-- 作业表单对话框 -->
  <el-dialog
      v-model="jobFormVisible"
      :title="isEditing ? '编辑作业' : '添加作业'"
      width="50%"
      center
      class="job-detail-dialog"
  >
    <el-form :model="jobForm" label-width="120px" :rules="formRules" ref="jobFormRef">
      <el-form-item label="作业名称" prop="name">
        <el-input v-model="jobForm.name" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="作业描述" prop="description">
        <el-input
            v-model="jobForm.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入作业描述信息"
        />
      </el-form-item>
      <el-form-item label="Cron表达式" prop="cronExpression">
        <el-input v-model="jobForm.cronExpression" placeholder="例如: 0 0 12 * * ?" />
        <!-- 添加cron表达式选择帮助 -->
        <div class="cron-helper">
          <p class="helper-text">常用表达式:</p>
          <el-button
              v-for="(cron, index) in commonCronExpressions"
              :key="index"
              type="text"
              @click="selectCommonCronExpression(cron.value)">
            {{cron.label}}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="对象类型" prop="objectType">
        <el-select v-model="jobForm.objectType" @change="handleObjectTypeChange" placeholder="请选择对象类型">
          <el-option label="任务" value="TASK" />
          <el-option label="问题" value="ISSUE" />
          <el-option label="工作日志" value="WORK_LOG" />
        </el-select>
      </el-form-item>
      <el-form-item label="触发类型" prop="triggerType">
        <el-select v-model="jobForm.triggerType" @change="handleTriggerTypeChange"  placeholder="请选择触发类型">
          <el-option label="临期提醒" value="DEADLINE_APPROACHING" />
          <el-option v-if="jobForm.objectType !== 'WORK_LOG'"
              label="状态变更" value="STATUS_CHANGED"
          />
          <el-option v-if="jobForm.objectType !== 'WORK_LOG'" label="新分配提醒" value="NEW_ASSIGNMENT" />
          <el-option label="已逾期提醒" value="OVERDUE" />
        </el-select>
      </el-form-item>
      <el-form-item label="条件参数" prop="conditions">
        <el-form-item v-if="jobForm.triggerType === 'DEADLINE_APPROACHING' && jobForm.objectType !== 'WORK_LOG'" label="临期天数" label-width="80px">
          <el-input-number v-model="jobForm.conditionParams.daysBeforeDeadline" :min="1" :max="30" />
        </el-form-item>
        <el-form-item v-if="jobForm.triggerType === 'STATUS_CHANGED'" label="状态列表" label-width="80px">
          <el-select
              v-model="jobForm.conditionParams.statuses"
              multiple
              placeholder="选择状态"
              class="status-select-width">
            <el-option
                v-for="status in statusOptionsForObjectType"
                :key="status.value"
                :label="status.label"
                :value="status.value"
            />
          </el-select>
        </el-form-item>
        <div v-if="jobForm.triggerType === 'DEADLINE_APPROACHING' && jobForm.objectType === 'WORK_LOG'"
             class="info-text">
          <i class="el-icon-info"></i>
          工作日志临期提醒会在每天指定时间检查用户是否提交了工作日志，未提交则发送提醒。
        </div>
      </el-form-item>
      <el-form-item label="通知设置" prop="notification">
        <el-checkbox v-model="jobForm.notification.ccToCreator">抄送给创建者</el-checkbox>
        <el-checkbox v-model="jobForm.notification.includeManagers">通知管理者</el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="jobFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveJob">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 执行记录对话框 -->
  <el-dialog
      v-model="logDialogVisible"
      :title="`执行日志 - ${selectedJob?.name || ''}`"
      width="70%"
      center
      class="job-detail-dialog"
  >
    <!-- 日志搜索 -->
    <div class="log-search">
      <el-select
          v-model="logSearchForm.status"
          placeholder="执行状态"
          clearable
          class="white-bg-input"
      >
        <el-option label="全部" value="" />
        <el-option label="成功" :value="1" />
        <el-option label="失败" :value="2" />
      </el-select>
      <el-date-picker
          v-model="logSearchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="white-bg-input"
      />
      <el-button type="primary" @click="searchJobLogs">搜索</el-button>
      <el-button @click="resetLogSearch">重置</el-button>
    </div>

    <!-- 日志表格 -->
    <el-table :data="jobLogs" style="width: 100%" v-loading="logsLoading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="执行时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.executionTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getLogStatusType(scope.row.status)">
            {{ scope.row.statusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="执行消息" show-overflow-tooltip>
        <template #default="scope">
        <span v-if="scope.row.status === 1" class="success-message">
          {{ scope.row.message }}
        </span>
          <el-button
              v-else
              type="danger"
              link
              @click="showErrorDetail(scope.row)"
          >
            执行失败，点击查看错误详情
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.createdTime) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 日志分页 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="logPagination.current"
          v-model:page-size="logPagination.size"
          :page-sizes="[5, 10, 15]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="logPagination.total"
          @size-change="handleLogSizeChange"
          @current-change="handleLogPageChange"
      />
    </div>

    <template #footer>
    <span class="dialog-footer">
      <el-button @click="logDialogVisible = false">关闭</el-button>
    </span>
    </template>
  </el-dialog>

  <!-- 作业详情对话框 -->
  <el-dialog
      v-model="jobDetailVisible"
      title="作业详情"
      width="60%"
      center
      destroy-on-close
      class="job-detail-dialog"
  >
    <div v-if="jobDetailData" class="job-detail-content">
      <div class="detail-item">
        <span class="detail-label">作业名称：</span>
        <span class="detail-value">{{ jobDetailData.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">作业描述：</span>
        <span class="detail-value">{{ jobDetailData.description }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Cron表达式：</span>
        <span class="detail-value">{{ jobDetailData.cronExpression }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">下次执行时间：</span>
        <span class="detail-value">{{ formatDateTime(jobDetailData.nextRunTime) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">作业状态：</span>
        <span class="detail-value">
        <el-tag :type="jobDetailData.status === 1 ? 'success' : 'danger'" size="small">
          {{ jobDetailData.statusText }}
        </el-tag>
      </span>
      </div>
      <div v-if="parsedCondition" class="detail-item">
        <span class="detail-label">对象类型：</span>
        <span class="detail-value">{{ getObjectTypeName(parsedCondition.objectType) }}</span>
      </div>
      <div v-if="parsedCondition" class="detail-item">
        <span class="detail-label">触发类型：</span>
        <span class="detail-value">{{ getTriggerTypeName(parsedCondition.triggerType) }}</span>
      </div>
      <div v-if="parsedCondition && parsedCondition.conditions" class="detail-item">
        <span class="detail-label">条件参数：</span>
        <span class="detail-value">
        <div v-if="parsedCondition.triggerType === 'DEADLINE_APPROACHING' && parsedCondition.objectType !== 'WORK_LOG'">
          临期天数: {{ parsedCondition.conditions.daysBeforeDeadline }}天
        </div>
        <div v-if="parsedCondition.triggerType === 'STATUS_CHANGED' && parsedCondition.conditions.statuses">
          状态列表: {{ formatStatusList(parsedCondition.conditions.statuses, parsedCondition.objectType) }}
        </div>
        <div v-if="parsedCondition.triggerType === 'DEADLINE_APPROACHING' && parsedCondition.objectType === 'WORK_LOG'">
          工作日志临期提醒会在每天指定时间检查用户是否提交了工作日志，未提交则发送提醒。
        </div>
      </span>
      </div>
      <div v-if="parsedCondition && parsedCondition.notification" class="detail-item">
        <span class="detail-label">通知设置：</span>
        <span class="detail-value">
        <div>
          {{ parsedCondition.notification.ccToCreator ? '抄送给创建者' : '' }}
          {{ parsedCondition.notification.ccToCreator && parsedCondition.notification.includeManagers ? '，' : '' }}
          {{ parsedCondition.notification.includeManagers ? '通知管理者' : '' }}
        </div>
      </span>
      </div>
    </div>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="jobDetailVisible = false">关闭</el-button>
    </span>
    </template>
  </el-dialog>

  <!-- 错误详情弹窗 -->
  <el-dialog
      v-model="errorDetailVisible"
      title="错误详情"
      width="60%"
      destroy-on-close
  >
    <pre class="error-detail">{{ selectedErrorMessage }}</pre>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="errorDetailVisible = false">关闭</el-button>
      <el-button type="primary" @click="copyErrorMessage">复制</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useScheduleStore } from '@/stores/schedule'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
const { hasPermission } = usePermissionCheck()

// 作业表单引用
const jobFormRef = ref<FormInstance>()

// 错误详情弹窗相关
const errorDetailVisible = ref(false)
const selectedErrorMessage = ref('')

// 作业详情相关
const jobDetailVisible = ref(false)
const jobDetailData = ref(null)

// 初始化 store
const scheduleStore = useScheduleStore()

// 状态选项 - 任务
const taskStatusOptions = [
  { label: '已分派', value: 1 },
  { label: '进行中', value: 2 },
  { label: '已完成', value: 3 },
]

// 状态选项 - 问题
const issueStatusOptions = [
  { label: '已分派', value: 1 },
  { label: '处理中', value: 2 },
  { label: '已解决', value: 3 },
  { label: '已暂停', value: 4 },
  { label: '已关闭', value: 5 }
]

// 根据对象类型计算状态选项
const statusOptionsForObjectType = computed(() => {
  if (jobForm.objectType === 'TASK') {
    return taskStatusOptions
  } else if (jobForm.objectType === 'ISSUE') {
    return issueStatusOptions
  }
  return []
})

// Cron 表达式验证
const validateCronExpression = (rule, value, callback) => {
  // 基本格式验证: 秒 分 时 日 月 周(星期)
  const cronRegex = /^(\S+\s+){5}\S+$/;
  if (!cronRegex.test(value)) {
    callback(new Error('Cron表达式格式不正确'));
    return;
  }

  // 常见的错误模式检查
  const parts = value.split(/\s+/);
  const seconds = parts[0];
  const minutes = parts[1];
  const hours = parts[2];
  const dayOfMonth = parts[3];
  const month = parts[4];
  const dayOfWeek = parts[5];

  // 秒范围检查 (0-59)
  if (seconds !== '*' && !/^(\d+(-\d+)?(,\d+(-\d+)?)*|\*\/\d+)$/.test(seconds)) {
    callback(new Error('秒字段格式不正确'));
    return;
  }

  // 常见的有效cron表达式模式
  const validPatterns = [
    /^\d+\s+\d+\s+\d+\s+\*\s+\*\s+\?$/, // 特定时间每天执行
    /^\d+\s+\d+\s+\d+\s+\?\s+\*\s+\d+$/, // 特定时间每周某天执行
    /^\d+\s+\d+\s+\d+\s+\d+\s+\*\s+\?$/, // 特定时间每月某天执行
    /^0\s+0\/\d+\s+\*\s+\*\s+\*\s+\?$/,  // 每隔n小时执行
  ];

  // 如果满足常见模式之一，则视为有效
  if (validPatterns.some(pattern => pattern.test(value))) {
    callback();
    return;
  }

  // 如果无法确定是否有效，则允许通过但给出提示
  ElMessage.warning('提供的cron表达式可能有效，但建议使用常见模式，如"0 0 12 * * ?"（每天中午12点执行）');
  callback();
};

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入作业名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  cronExpression: [
    { required: true, message: '请输入Cron表达式', trigger: 'blur' },
    { validator: validateCronExpression, trigger: 'blur' }
  ],
  objectType: [
    { required: true, message: '请选择对象类型', trigger: 'change' }
  ],
  triggerType: [
    { required: true, message: '请选择触发类型', trigger: 'change' }
  ]
}

// 提供几个常用的cron表达式作为参考
const commonCronExpressions = [
  { label: '每天中午12点执行', value: '0 0 12 * * ?' },
  { label: '每小时执行一次', value: '0 0 * * * ?' },
  { label: '每30分钟执行一次', value: '0 0/30 * * * ?' },
  { label: '每周一上午10点执行', value: '0 0 10 ? * MON' }
];

// 添加一个便捷选择cron表达式的方法
const selectCommonCronExpression = (expression) => {
  jobForm.cronExpression = expression;
};

// 状态变量
const loading = ref(false)
const logsLoading = ref(false)
const jobFormVisible = ref(false)
const logDialogVisible = ref(false)
const isEditing = ref(false)
const selectedJobs = ref([])
const selectedJob = ref(null)
const jobList = ref([])
const jobLogs = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  objectType: '',
  triggerType: ''
})

// 日志搜索表单
const logSearchForm = reactive({
  status: '',
  dateRange: []
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 日志分页参数
const logPagination = reactive({
  current: 1,
  size: 5,
  total: 0
})

// 作业表单
const jobForm = reactive({
  id: null,
  name: '',
  description: '',
  cronExpression: '',
  objectType: '',
  triggerType: '',
  conditionParams: {
    daysBeforeDeadline: 3,
    statuses: [],
  },
  notification: {
    ccToCreator: true,
    includeManagers: false,
    template: ''
  }
})

// 添加在计算属性部分
const parsedCondition = computed(() => {
  if (!jobDetailData.value || !jobDetailData.value.runCondition) return null;
  try {
    return JSON.parse(jobDetailData.value.runCondition);
  } catch (e) {
    return null;
  }
});

// 获取对象类型名称
const getObjectTypeName = (type) => {
  const map = {
    'TASK': '任务',
    'ISSUE': '问题',
    'WORK_LOG': '工作日志'
  };
  return map[type] || type;
};

// 获取触发类型名称
const getTriggerTypeName = (type) => {
  const map = {
    'DEADLINE_APPROACHING': '临期提醒',
    'STATUS_CHANGED': '状态变更',
    'NEW_ASSIGNMENT': '新分配提醒',
    'OVERDUE': '已逾期提醒'
  };
  return map[type] || type;
};

// 格式化状态列表
const formatStatusList = (statuses, objectType) => {
  if (!statuses || !Array.isArray(statuses)) return '';

  const statusOptions = objectType === 'TASK' ? taskStatusOptions : issueStatusOptions;
  return statuses.map(status => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }).join(', ');
};

// 查看执行记录
const viewJobLogs = (job) => {
  selectedJob.value = job
  logDialogVisible.value = true
  logPagination.current = 1
  fetchJobLogs()
}

// 查看作业详情
const viewJobDetail = async (job) => {
  try {
    const jobDetail = await scheduleStore.getJobDetailAction(job.id)
    if (jobDetail) {
      jobDetailData.value = jobDetail
      jobDetailVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取作业详情失败')
    console.error('获取作业详情失败', error)
  }
}

// 显示错误详情
const showErrorDetail = (log) => {
  selectedErrorMessage.value = log.message
  errorDetailVisible.value = true
}

// 复制错误信息
const copyErrorMessage = () => {
  navigator.clipboard.writeText(selectedErrorMessage.value).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 处理对象类型变更
const handleObjectTypeChange = () => {
  // 如果对象类型是工作日志，则不允许选择状态变更触发类型
  if (jobForm.objectType === 'WORK_LOG' && (jobForm.triggerType === 'STATUS_CHANGED' || jobForm.triggerType === 'NEW_ASSIGNMENT')) {
    jobForm.triggerType = ''
  }

  // 清空状态列表
  jobForm.conditionParams.statuses = []
}

// 处理触发类型变更
const handleTriggerTypeChange = () => {
  // 清空对应参数
  if (jobForm.triggerType === 'DEADLINE_APPROACHING') {
    jobForm.conditionParams.statuses = []
    jobForm.conditionParams.daysBeforeDeadline = 3
  } else if (jobForm.triggerType === 'STATUS_CHANGED') {
    jobForm.conditionParams.daysBeforeDeadline = 0
    jobForm.conditionParams.statuses = []
  } else {
    jobForm.conditionParams.daysBeforeDeadline = 0
    jobForm.conditionParams.statuses = []
  }
}

// 加载
onMounted(() => {
  fetchJobs()
})

// 刷新所有作业的下次执行时间
const refreshNextRunTime = async () => {
  try {
    await scheduleStore.refreshNextRunTimeAction()
  } catch (error) {
    console.error('刷新失败', error)
  }
}

// 获取作业列表
const fetchJobs = async () => {
  loading.value = true
  try {
    const params = {
      name: searchForm.name || undefined,
      status: searchForm.status || undefined,
      objectType: searchForm.objectType || undefined,
      triggerType: searchForm.triggerType || undefined
    }

    await refreshNextRunTime()
    await scheduleStore.getPagingJobListAction(pagination.current, pagination.size, params)
    jobList.value = scheduleStore.jobList
    pagination.total = scheduleStore.pagination.total
  } catch (error) {
    ElMessage.error('获取作业列表失败')
    console.error('获取作业列表失败', error)
  } finally {
    loading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedJobs.value = val
}

// 处理大小变化
const handleSizeChange = (val: number) => {
  pagination.size = val
  pagination.current = 1
  fetchJobs()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchJobs()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchJobs()
}

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  searchForm.objectType = ''
  searchForm.triggerType = ''
  pagination.current = 1
  fetchJobs()
}

// 获取状态类型
const getStatusType = (status: number) => {
  return status === 1 ? 'success' : 'danger'
}

// 获取日志状态类型
const getLogStatusType = (status: number) => {
  return status === 1 ? 'success' : 'danger'
}

// 文本截断
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 批量删除
const batchDeleteJobs = () => {
  if (selectedJobs.value.length === 0) {
    ElMessage.warning('请至少选择一个作业')
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedJobs.value.length} 个作业吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    try {
      const ids = selectedJobs.value.map(job => job.id)
      const success = await scheduleStore.batchDeleteJobsAction(ids)

      if (success) {
        await fetchJobs()
      }
    } catch (error) {
      ElMessage.error('删除作业失败')
      console.error('删除作业失败', error)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 添加作业
const handleAddJob = () => {
  isEditing.value = false
  Object.assign(jobForm, {
    id: null,
    name: '',
    description: '',
    cronExpression: '',
    objectType: '',
    triggerType: '',
    conditionParams: {
      daysBeforeDeadline: 3,
      statuses: []
    },
    notification: {
      ccToCreator: true,
      includeManagers: false,
      template: ''
    }
  })
  jobFormVisible.value = true
}

// 编辑作业
const handleEditJob = async (job) => {
  isEditing.value = true

  try {
    const jobDetail = await scheduleStore.getJobDetailAction(job.id)

    if (jobDetail) {
      // 解析条件JSON
      const condition = JSON.parse(jobDetail.runCondition || '{}')

      Object.assign(jobForm, {
        id: jobDetail.id,
        name: jobDetail.name,
        description: jobDetail.description,
        cronExpression: jobDetail.cronExpression,
        objectType: condition.objectType || '',
        triggerType: condition.triggerType || '',
        conditionParams: condition.conditions || {
          daysBeforeDeadline: 3,
          statuses: []
        },
        notification: condition.notification || {
          ccToCreator: true,
          includeManagers: false,
          template: ''
        }
      })

      jobFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取作业详情失败')
    console.error('获取作业详情失败', error)
  }
}

// 保存作业
const saveJob = async () => {
  if (!jobFormRef.value) return

  await jobFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 处理工作日志临期提醒特殊情况
        if (jobForm.objectType === 'WORK_LOG' && jobForm.triggerType === 'DEADLINE_APPROACHING') {
          // 对于工作日志的临期提醒，设置一个默认值，后端会忽略这个值
          jobForm.conditionParams.daysBeforeDeadline = 0;
        }

        // 构建条件JSON
        const conditionObj = {
          objectType: jobForm.objectType,
          triggerType: jobForm.triggerType,
          conditions: jobForm.conditionParams,
          notification: jobForm.notification
        }

        const jobData = {
          id: jobForm.id,
          name: jobForm.name,
          description: jobForm.description,
          cronExpression: jobForm.cronExpression,
          runCondition: JSON.stringify(conditionObj)
        }

        let success = false

        if (isEditing.value) {
          // 更新作业
          success = await scheduleStore.updateJobAction(jobForm.id, jobData)
        } else {
          // 添加新作业
          success = await scheduleStore.addJobAction(jobData)
        }

        if (success) {
          jobFormVisible.value = false
          await fetchJobs()
        }
      } catch (error) {
        ElMessage.error(isEditing.value ? '更新作业失败' : '添加作业失败')
        console.error(isEditing.value ? '更新作业失败' : '添加作业失败', error)
      }
    }
  })
}

// 暂停作业
const pauseJob = async (job) => {
  try {
    const success = await scheduleStore.pauseJobAction(job.id)
    if (success) {
      await fetchJobs()
    }
  } catch (error) {
    ElMessage.error('暂停作业失败')
    console.error('暂停作业失败', error)
  }
}

// 启动作业
const resumeJob = async (job) => {
  try {
    const success = await scheduleStore.resumeJobAction(job.id)
    if (success) {
      await fetchJobs()
    }
  } catch (error) {
    ElMessage.error('启动作业失败')
    console.error('启动作业失败', error)
  }
}

// 立即执行作业
const triggerJob = async (job) => {
  try {
    const success = await scheduleStore.triggerJobAction(job.id)
    if (success) {
      await fetchJobs()
    }
  } catch (error) {
    ElMessage.error('执行作业失败')
    console.error('执行作业失败', error)
  }
}

// 删除作业
const handleDeleteJob = (job) => {
  ElMessageBox.confirm(
      '确定要删除这个作业吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    try {
      const success = await scheduleStore.deleteJobAction(job.id)
      if (success) {
        fetchJobs()
      }
    } catch (error) {
      ElMessage.error('删除作业失败')
      console.error('删除作业失败', error)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 获取作业执行日志
const fetchJobLogs = async () => {
  if (!selectedJob.value) return

  logsLoading.value = true
  try {
    const params = {
      jobId: selectedJob.value.id,
      status: logSearchForm.status || undefined
    }

    // 添加日期范围条件
    if (logSearchForm.dateRange && logSearchForm.dateRange.length === 2) {
      params.startDate = logSearchForm.dateRange[0]
      params.endDate = logSearchForm.dateRange[1]
    }

    await scheduleStore.getPagingJobLogsAction(logPagination.current, logPagination.size, params)
    jobLogs.value = scheduleStore.jobLogs
    logPagination.total = scheduleStore.logPagination.total
  } catch (error) {
    ElMessage.error('获取执行记录失败')
    console.error('获取执行记录失败', error)
  } finally {
    logsLoading.value = false
  }
}

// 搜索作业日志
const searchJobLogs = () => {
  logPagination.current = 1
  fetchJobLogs()
}

// 重置日志搜索
const resetLogSearch = () => {
  logSearchForm.status = ''
  logSearchForm.dateRange = []
  logPagination.current = 1
  fetchJobLogs()
}

// 处理日志分页大小变化
const handleLogSizeChange = (val: number) => {
  logPagination.size = val
  logPagination.current = 1
  fetchJobLogs()
}

// 处理日志分页页码变化
const handleLogPageChange = (val: number) => {
  logPagination.current = val
  fetchJobLogs()
}
</script>

<style scoped>
.job-schedule-container {
  padding: 20px;
}

.job-card {
  border-radius: 8px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.job-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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

.cron-helper {
  margin-top: 8px;
  font-size: 12px;
}

.helper-text {
  color: #909399;
  margin-right: 10px;
  display: inline-block;
}

.info-text {
  color: #909399;
  font-size: 14px;
  background-color: #f8f9fa;
}

/* 详情对话框样式 */
.job-detail-content {
  margin-bottom: 25px;
}

.detail-item {
  margin-bottom: 15px;
  line-height: 1.8;
  font-size: 16px;
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

/* 日志搜索样式 */
.log-search {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

/* 表单样式优化 */
:deep(.el-form-item__content) {
  flex-wrap: wrap;
}

/* 对话框样式 */
:deep(.job-detail-dialog) {
  .el-dialog__header {
    padding: 20px;
    border-bottom: 1px solid #eee;
  }

  .el-dialog__title {
    font-size: 20px;
    font-weight: 600;
  }

  .el-dialog__body {
    padding: 30px;
  }
}

.status-select-width {
  width: 300px !important;
}

/* 确保下拉菜单也有足够的宽度 */
:deep(.status-select-width .el-select__popper) {
  min-width: 300px !important;
}

/* 错误详情样式 */
.error-detail {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
  font-size: 13px;
  max-height: 400px;
  overflow-y: auto;
  color: #e74c3c;
}

/* 深色主题适配 */
:deep(.dark) {
  .error-detail {
    background-color: #2d2d2d;
    color: #ff6b6b;
  }
}

/* 深色主题适配 */
:deep(.dark) {
  .job-card {
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

  .detail-label {
    color: #e5e7eb;
  }

  .detail-value {
    color: #9ca3af;
  }
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .job-actions, .log-search {
    flex-direction: column;
    align-items: stretch;
  }

  .white-bg-input {
    width: 100%;
  }
}
</style>