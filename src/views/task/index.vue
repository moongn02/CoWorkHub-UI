<template>
  <Layout>
    <template #content>
      <div class="task-details-container">
        <!-- Module 1: Title and task number -->
        <el-card class="task-details-card title-card" shadow="hover">
          <div class="title-section">
            <div class="title-left">
              <h2 class="task-title">{{ task.title }}</h2>
              <div class="task-id">任务编号: {{ task.id }}</div>
            </div>
            <div class="status-section">
              <div class="status-priority-line">
                <div class="status-item">
                  <el-tag :type="getStatusType(task.status)">{{ getStatusText(task.status) }}</el-tag>
                </div>
                <div class="divider">/</div>
                <div class="status-item">
                  <el-tag :type="getPriorityType(task.priority)">{{ getPriorityText(task.priority) }}</el-tag>
                </div>
              </div>
              <div class="status-item">
                <span>{{ formatDateTime(task.expected_time) }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Row containing Modules 2 and 3 -->
        <div class="modules-row">
          <!-- Module 2: Task content -->
          <el-card class="task-details-card content-card" shadow="hover">
              <div class="card-header">
                <h3 class="section-title">任务内容</h3>
              </div>
            <div class="task-content scrollable-content" v-html="task.content"></div>
          </el-card>

          <!-- Module 3: Task metadata -->
          <el-card class="task-details-card meta-card" shadow="hover">
              <div class="card-header">
                <h3 class="section-title">任务详情</h3>
              </div>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">所属项目</span>
                <span class="meta-value">{{ task.project_name }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">所属部门</span>
                <span class="meta-value">{{ task.department_name }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建人</span>
                <span class="meta-value">{{ task.creator_name }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">执行人</span>
                <span class="meta-value">{{ task.handler_name }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">验收人</span>
                <span class="meta-value">{{ task.acceptor_name }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">实际开始时间</span>
                <span class="meta-value">{{ formatDateTime(task.actual_start_time) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">状态</span>
                <span class="meta-value">{{ getStatusText(task.status) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">优先级</span>
                <span class="meta-value">{{ getPriorityText(task.priority) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">期望完成时间</span>
                <span class="meta-value">{{ formatDateTime(task.expected_time) }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 操作栏 -->
        <div class="modules-row">
          <el-card class="task-details-card action-card" shadow="hover">
            <div class="action-bar">
              <el-button type="primary" @click="handleModify">修改任务</el-button>
              <el-button type="success" @click="handleChangeStatus">更改状态</el-button>
              <el-button type="warning" @click="handleSplitTask">拆分任务</el-button>
              <el-button type="info" @click="handleCreateIssue">创建问题</el-button>
              <el-button type="primary" @click="handleTransferTask">转交任务</el-button>
              <el-button type="danger" @click="handleModifyExpectedTime">修改期望时间</el-button>
              <el-button type="success" @click="handleAddRemarks">备注</el-button>
            </div>
          </el-card>
        </div>

        <!-- Row containing Modules 4 and 5 -->
        <div class="modules-row">
          <!-- Module 4: Remarks and task progress -->
          <el-card class="task-details-card tabs-card" shadow="hover">
            <el-tabs>
              <el-tab-pane label="备注">
                <div class="tab-content-container">
                  <div class="remarks-section">
                    <div class="scrollable-content remarks-content">
                      <div v-if="taskRemarks.length > 0">
                        <div v-for="(remark, index) in taskRemarks" :key="index" class="remark-item">
                          <div class="remark-header">
                            <span class="remark-user">{{ remark.user }}</span>
                            <span class="remark-time">{{ remark.time }}</span>
                          </div>
                          <div class="remark-content">{{ remark.content }}</div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无备注" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="任务进度">
                <div class="tab-content-container">
                  <div class="progress-section">
                    <div class="scrollable-content progress-content">
                      <el-timeline>
                        <el-timeline-item
                            v-for="(activity, index) in taskActivities"
                            :key="index"
                            :timestamp="activity.time"
                            :type="activity.type"
                        >
                          {{ activity.content }}
                        </el-timeline-item>
                      </el-timeline>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>

          <!-- Module 5: Parent task, child tasks, and related issues -->
          <el-card class="task-details-card tabs-card" shadow="hover">
            <el-tabs>
              <el-tab-pane label="父任务" v-if="task.parent_task_id">
                <div class="tab-content-container">
                  <div class="subtasks-section">
                    <div class="scrollable-content subtasks-content">
                      <div v-if="parentTask">
                        <div class="related-item">
                          <div class="related-item-header">
                            <el-tag size="small" type="primary">{{ parentTask.id }}</el-tag>
                            <el-tag size="small" :type="getStatusType(parentTask.status)">
                              {{ getStatusText(parentTask.status) }}
                            </el-tag>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ parentTask.title }}</h4>
                            <p class="related-item-info">
                              <span>执行人: {{ parentTask.handler_name }}</span>
                              <span>期望完成: {{ formatDateTime(parentTask.expected_time) }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无父任务" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="子任务">
                <div class="tab-content-container">
                  <div class="subtasks-section">
                    <div class="scrollable-content subtasks-content">
                      <div v-if="subTasks.length > 0">
                        <div v-for="subTask in subTasks" :key="subTask.id" class="related-item">
                          <div class="related-item-header">
                            <el-tag size="small" type="primary">{{ subTask.id }}</el-tag>
                            <el-tag size="small" :type="getStatusType(subTask.status)">
                              {{ getStatusText(subTask.status) }}
                            </el-tag>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ subTask.title }}</h4>
                            <p class="related-item-info">
                              <span>执行人: {{ subTask.handler_name }}</span>
                              <span>期望完成: {{ formatDateTime(subTask.expected_time) }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无子任务" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="关联问题">
                <div class="tab-content-container">
                  <div class="issues-section">
                    <div class="scrollable-content issues-content">
                      <div v-if="relatedIssues.length > 0">
                        <div v-for="issue in relatedIssues" :key="issue.id" class="related-item">
                          <div class="related-item-header">
                            <el-tag size="small" type="warning">{{ issue.id }}</el-tag>
                            <el-tag size="small" :type="getIssueStatusType(issue.status)">
                              {{ getIssueStatusText(issue.status) }}
                            </el-tag>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ issue.title }}</h4>
                            <p class="related-item-info">
                              <span>处理人: {{ issue.handler_name }}</span>
                              <span>优先级: {{ getPriorityText(issue.priority) }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无关联问题" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </div>

      <!-- 修改任务对话框 -->
      <el-dialog v-model="modifyDialogVisible" title="修改任务" width="60%">
        <el-form :model="modifyForm" label-width="100px" label-position="right">
          <el-form-item label="任务标题" required>
            <el-input v-model="modifyForm.title" placeholder="请输入任务标题" />
          </el-form-item>
          <el-form-item label="任务内容" required>
            <el-input v-model="modifyForm.content" type="textarea" :rows="6" placeholder="请输入任务内容" />
          </el-form-item>
          <el-form-item label="所属项目">
            <el-select v-model="modifyForm.project_id" placeholder="请选择项目" style="width: 100%">
              <el-option
                  v-for="project in projectOptions"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属部门">
            <el-select v-model="modifyForm.department_id" placeholder="请选择部门" style="width: 100%">
              <el-option
                  v-for="department in departmentOptions"
                  :key="department.id"
                  :label="department.name"
                  :value="department.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="验收人">
            <el-select v-model="modifyForm.acceptor_id" placeholder="请选择验收人" style="width: 100%">
              <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="modifyForm.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option label="高" :value="1" />
              <el-option label="中" :value="2" />
              <el-option label="低" :value="3" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="modifyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmModify">确认</el-button>
        </span>
        </template>
      </el-dialog>

      <!-- 更改状态对话框 -->
      <el-dialog v-model="statusDialogVisible" title="更改任务状态" width="30%">
        <el-form :model="statusForm">
          <el-form-item label="状态">
            <el-select v-model="statusForm.status" placeholder="请选择状态">
              <el-option label="已分派" :value="1" />
              <el-option label="处理中" :value="2" />
              <el-option label="已完成" :value="3" />
              <el-option label="测试中" :value="4" />
              <el-option label="已暂停" :value="5" />
              <el-option label="已关闭" :value="6" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="statusForm.remark" type="textarea" rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmChangeStatus">确认</el-button>
        </span>
        </template>
      </el-dialog>

      <!-- 拆分任务对话框 -->
      <el-dialog v-model="splitDialogVisible" title="拆分任务" width="50%">
        <!-- 这里可以添加拆分任务的表单 -->
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="splitDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSplitTask">确认</el-button>
        </span>
        </template>
      </el-dialog>

      <!-- 创建关联问题对话框 -->
      <el-dialog v-model="issueDialogVisible" title="创建关联问题" width="50%">
        <!-- 这里可以添加创建关联问题的表单 -->
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="issueDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateIssue">确认</el-button>
        </span>
        </template>
      </el-dialog>

      <!-- 转交任务对话框 -->
      <el-dialog v-model="transferDialogVisible" title="转交任务" width="30%">
        <el-form :model="transferForm">
          <el-form-item label="转交给">
            <el-select v-model="transferForm.handler_id" placeholder="请选择执行人">
              <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="transferForm.reason" type="textarea" rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="transferDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmTransferTask">确认</el-button>
        </span>
        </template>
      </el-dialog>

      <!-- 修改期望完成时间对话框 -->
      <el-dialog v-model="expectedTimeDialogVisible" title="修改期望完成时间" width="30%">
        <el-form :model="expectedTimeForm">
          <el-form-item label="期望完成时间">
            <el-date-picker
                v-model="expectedTimeForm.expected_time"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="expectedTimeForm.reason" type="textarea" rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="expectedTimeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmModifyExpectedTime">确认</el-button>
        </span>
        </template>
      </el-dialog>

      <!-- 添加备注对话框 -->
      <el-dialog v-model="remarksDialogVisible" title="添加备注" width="40%">
        <el-form :model="remarksForm">
          <el-form-item label="内容">
            <el-input v-model="remarksForm.content" type="textarea" :rows="5" placeholder="请输入备注内容" />
          </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="remarksDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddRemarks">确认</el-button>
        </span>
        </template>
      </el-dialog>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Layout from '@/components/Layout.vue'
import { ElMessage } from 'element-plus'

// 模拟任务数据
const task = ref({
  id: 'TASK-1001',
  title: '实现用户认证模块',
  content: `<p>需要实现基于JWT的用户认证系统，包括以下功能：</p>
  <ul>
    <li>用户登录</li>
    <li>令牌刷新</li>
    <li>权限验证</li>
    <li>密码重置</li>
  </ul>
  <p>技术栈：Vue 3 + TypeScript + Element Plus</p>`,
  creator_id: 101,
  creator_name: '张三',
  handler_id: 102,
  handler_name: '李四',
  acceptor_id: 103,
  acceptor_name: '王五',
  project_id: 1,
  project_name: '企业协作平台',
  department_id: 2,
  department_name: '研发部',
  parent_task_id: 'TASK-1000',
  status: 2,
  priority: 1,
  actual_start_time: '2024-06-10 09:00:00',
  expected_time: '2024-06-20 18:00:00',
  create_time: '2024-06-08 14:30:00',
  update_time: '2024-06-12 10:15:00'
})

const parentTask = ref({
  id: 'TASK-1000',
  title: '父任务标题',
  status: 2,
  handler_name: '张三',
  expected_time: '2024-06-10 09:00:00'
})

// 模拟子任务数据
const subTasks = ref([
  {
    id: 'TASK-1002',
    title: '实现登录接口',
    handler_name: '李四',
    status: 3,
    expected_time: '2024-06-15 18:00:00'
  },
  {
    id: 'TASK-1003',
    title: '实现令牌刷新功能',
    handler_name: '李四',
    status: 2,
    expected_time: '2024-06-18 18:00:00'
  },
  {
    id: 'TASK-1004',
    title: '实现权限验证功能',
    handler_name: '王五',
    status: 1,
    expected_time: '2024-06-19 18:00:00'
  }
])

// 模拟关联问题数据
const relatedIssues = ref([
  {
    id: 'ISSUE-501',
    title: '登录页面样式异常',
    handler_name: '赵六',
    status: 1,
    priority: 2
  },
  {
    id: 'ISSUE-502',
    title: '令牌刷新失败',
    handler_name: '李四',
    status: 2,
    priority: 1
  }
])

// 模拟任务活动数据
const taskActivities = ref([
  {
    time: '2024-06-12 10:15:00',
    content: '李四更新了任务进度',
    type: 'primary'
  },
  {
    time: '2024-06-11 16:30:00',
    content: '李四开始处理任务',
    type: 'success'
  },
  {
    time: '2024-06-10 09:00:00',
    content: '任务已分派给李四',
    type: 'info'
  },
  {
    time: '2024-06-08 14:30:00',
    content: '张三创建了任务',
    type: 'info'
  }
])

// 模拟备注数据
const taskRemarks = ref([
  {
    user: '张三',
    time: '2024-06-08 15:30:00',
    content: '请尽快完成此任务，这是本月的重点工作。'
  },
  {
    user: '李四',
    time: '2024-06-10 10:00:00',
    content: '已开始处理，预计按时完成。'
  }
])

// 模拟选项数据
const projectOptions = ref([
  { id: 1, name: '企业协作平台' },
  { id: 2, name: '客户管理系统' },
  { id: 3, name: '数据分析平台' }
])

const departmentOptions = ref([
  { id: 1, name: '产品部' },
  { id: 2, name: '研发部' },
  { id: 3, name: '测试部' },
  { id: 4, name: '运维部' }
])

const userOptions = ref([
  { id: 101, name: '张三' },
  { id: 102, name: '李四' },
  { id: 103, name: '王五' },
  { id: 104, name: '赵六' },
  { id: 105, name: '钱七' }
])

// 对话框状态
const modifyDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const splitDialogVisible = ref(false)
const issueDialogVisible = ref(false)
const transferDialogVisible = ref(false)
const expectedTimeDialogVisible = ref(false)
const remarksDialogVisible = ref(false)

// 表单数据
const modifyForm = ref({
  title: '',
  content: '',
  project_id: null,
  department_id: null,
  acceptor_id: null,
  priority: null
})

const statusForm = ref({
  status: null,
  remark: ''
})

const transferForm = ref({
  handler_id: null,
  reason: ''
})

const expectedTimeForm = ref({
  expected_time: '',
  reason: ''
})

const remarksForm = ref({
  content: ''
})

const commentForm = ref({
  content: ''
})

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '-'
  return dateTimeStr
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap = {
    1: '已分派',
    2: '处理中',
    3: '已完成',
    4: '测试中',
    5: '已暂停',
    6: '已关闭'
  }
  return statusMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status: number) => {
  const typeMap = {
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'warning',
    5: 'danger',
    6: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority: number) => {
  const priorityMap = {
    1: '高优先级',
    2: '中优先级',
    3: '低优先级'
  }
  return priorityMap[priority] || '未知'
}

// 获取优先级类型
const getPriorityType = (priority: number) => {
  const typeMap = {
    1: 'danger',
    2: 'warning',
    3: 'info'
  }
  return typeMap[priority] || 'info'
}

// 获取问题状态文本
const getIssueStatusText = (status: number) => {
  const statusMap = {
    1: '待处理',
    2: '处理中',
    3: '已解决',
    4: '已关闭'
  }
  return statusMap[status] || '未知'
}

// 获取问题状态类型
const getIssueStatusType = (status: number) => {
  const typeMap = {
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'info'
  }
  return typeMap[status] || 'info'
}

// 处理修改任务
const handleModify = () => {
  modifyForm.value = {
    title: task.value.title,
    content: task.value.content,
    project_id: task.value.project_id,
    department_id: task.value.department_id,
    acceptor_id: task.value.acceptor_id,
    priority: task.value.priority
  }
  modifyDialogVisible.value = true
}

// 确认修改任务
const confirmModify = () => {
  task.value.title = modifyForm.value.title
  task.value.content = modifyForm.value.content
  task.value.project_id = modifyForm.value.project_id
  task.value.project_name = projectOptions.value.find(p => p.id === modifyForm.value.project_id)?.name || ''
  task.value.department_id = modifyForm.value.department_id
  task.value.department_name = departmentOptions.value.find(d => d.id === modifyForm.value.department_id)?.name || ''
  task.value.acceptor_id = modifyForm.value.acceptor_id
  task.value.acceptor_name = userOptions.value.find(u => u.id === modifyForm.value.acceptor_id)?.name || ''
  task.value.priority = modifyForm.value.priority

  ElMessage.success('任务修改成功')
  modifyDialogVisible.value = false

  // 添加活动记录
  taskActivities.value.unshift({
    time: new Date().toLocaleString(),
    content: '修改了任务信息',
    type: 'primary'
  })
}

// 处理更改状态
const handleChangeStatus = () => {
  statusForm.value.status = task.value.status
  statusForm.value.remark = ''
  statusDialogVisible.value = true
}

// 确认更改状态
const confirmChangeStatus = () => {
  task.value.status = statusForm.value.status
  ElMessage.success('任务状态更新成功')
  statusDialogVisible.value = false

  // 添加活动记录
  taskActivities.value.unshift({
    time: new Date().toLocaleString(),
    content: `将任务状态更改为"${getStatusText(statusForm.value.status)}"`,
    type: 'primary'
  })
}

// 处理拆分任务
const handleSplitTask = () => {
  splitDialogVisible.value = true
}

// 确认拆分任务
const confirmSplitTask = () => {
  ElMessage.success('任务拆分成功')
  splitDialogVisible.value = false

  // 添加活动记录
  taskActivities.value.unshift({
    time: new Date().toLocaleString(),
    content: '拆分了任务',
    type: 'warning'
  })
}

// 处理创建关联问题
const handleCreateIssue = () => {
  issueDialogVisible.value = true
}

// 确认创建关联问题
const confirmCreateIssue = () => {
  ElMessage.success('关联问题创建成功')
  issueDialogVisible.value = false

  // 添加活动记录
  taskActivities.value.unshift({
    time: new Date().toLocaleString(),
    content: '创建了关联问题',
    type: 'info'
  })
}

// 处理转交任务
const handleTransferTask = () => {
  transferForm.value.handler_id = null
  transferForm.value.reason = ''
  transferDialogVisible.value = true
}

// 确认转交任务
const confirmTransferTask = () => {
  const newHandler = userOptions.value.find(u => u.id === transferForm.value.handler_id)
  if (newHandler) {
    task.value.handler_id = newHandler.id
    task.value.handler_name = newHandler.name

    ElMessage.success(`任务已成功转交给${newHandler.name}`)
    transferDialogVisible.value = false

    // 添加活动记录
    taskActivities.value.unshift({
      time: new Date().toLocaleString(),
      content: `将任务转交给${newHandler.name}`,
      type: 'warning'
    })
  }
}

// 处理修改期望完成时间
const handleModifyExpectedTime = () => {
  expectedTimeForm.value.expected_time = task.value.expected_time
  expectedTimeForm.value.reason = ''
  expectedTimeDialogVisible.value = true
}

// 确认修改期望完成时间
const confirmModifyExpectedTime = () => {
  task.value.expected_time = expectedTimeForm.value.expected_time
  ElMessage.success('期望完成时间修改成功')
  expectedTimeDialogVisible.value = false

  // 添加活动记录
  taskActivities.value.unshift({
    time: new Date().toLocaleString(),
    content: `修改了期望完成时间为${formatDateTime(expectedTimeForm.value.expected_time)}`,
    type: 'danger'
  })
}

// 处理添加备注
const handleAddRemarks = () => {
  remarksForm.value.content = ''
  remarksDialogVisible.value = true
}

// 确认添加备注
const confirmAddRemarks = () => {
  if (remarksForm.value.content.trim()) {
    taskRemarks.value.unshift({
      user: '当前用户',
      time: new Date().toLocaleString(),
      content: remarksForm.value.content
    })

    ElMessage.success('备注添加成功')
    remarksDialogVisible.value = false

    // 添加活动记录
    taskActivities.value.unshift({
      time: new Date().toLocaleString(),
      content: '添加了备注',
      type: 'info'
    })
  }
}
</script>

<style scoped>
.task-details-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-details-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.task-details-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Module 1: Title and task number */
.title-section {
  padding: 5px;
  display: flex;
  justify-content: space-between;
}

.title-left {
  flex: 1;
}

.task-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.task-id {
  font-size: 14px;
  color: #909399;
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 20px;
}

.status-priority-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.divider {
  font-weight: 500;
  color: #606266;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

/* 模块行布局 */
.modules-row {
  display: flex;
  gap: 20px;
}

.modules-row .task-details-card {
  display: flex;
  flex-direction: column;
}

/* 模块2：任务内容 */
.content-card {
  flex: 3;
  min-height: 410px;
}

.card-header {
  padding: 0;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  margin: 0;
  padding: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.task-content {
  height: 320px;
  overflow-y: auto;
  padding: 10px 16px 16px 20px;
  line-height: 1.6;
  color: #606266;
}

/* 模块3：任务元数据 */
.meta-card {
  flex: 2;
  min-height: 410px;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 20px 20px 0 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-weight: 480;
  color: #606266;
  min-width: 100px;
  white-space: nowrap;
}

.meta-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 统一滚动条样式 */
.tab-content-container {
  height: 250px;
  overflow-y: auto;
}

.task-content, .meta-grid {
  height: 340px;
  overflow-y: auto;
}

/* 操作栏 */
.action-card {
  flex: 2;
  min-height: auto;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
}

.action-bar .el-button {
  margin-right: 0;
  flex: 1;
}

/* 模块4和模块5平分宽度 */
.modules-row .tabs-card {
  flex: 1;
}

/* 备注项样式 */
.remark-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.remark-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #909399;
}

.remark-user {
  font-weight: 500;
}

.remark-content {
  line-height: 1.5;
  color: #606266;
}

.remarks-section {
  margin-bottom: 5px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 进度部分 */
.progress-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.progress-content {
  flex: 1;
}

.subtasks-section, .issues-section {
  margin-bottom: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.subtasks-content, .issues-content {
  flex: 1;
}

.related-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.related-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.related-item-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.related-item-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin: 0;
}

/* 自定义滚动条 */
.tab-content-container::-webkit-scrollbar,
.task-content::-webkit-scrollbar,
.meta-grid::-webkit-scrollbar {
  width: 4px;
}

.tab-content-container::-webkit-scrollbar-track,
.task-content::-webkit-scrollbar-track,
.meta-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tab-content-container::-webkit-scrollbar-thumb,
.task-content::-webkit-scrollbar-thumb,
.meta-grid::-webkit-scrollbar-thumb {
  background: #909399;
  border-radius: 4px;
}

/* 暗色主题适配 */
:deep(.dark) {
  .task-details-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .task-title {
    color: #e5e7eb;
  }

  .section-title {
    color: #e5e7eb;
  }

  .task-content {
    color: #a0a0a0;
  }

  .meta-label {
    color: #a0a0a0;
  }

  .remark-item {
    background-color: #363636;
  }

  .remark-content {
    color: #a0a0a0;
  }

  .parent-task-content {
    background-color: #363636;
  }

  .related-item {
    background-color: #363636;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .related-item-content h4 {
    color: #e5e7eb;
  }

  .tab-content-container::-webkit-scrollbar-track,
  .task-content::-webkit-scrollbar-track,
  .meta-grid::-webkit-scrollbar-track {
    background: #2d2d2d;
  }

  .tab-content-container::-webkit-scrollbar-thumb,
  .task-content::-webkit-scrollbar-thumb,
  .meta-grid::-webkit-scrollbar-thumb {
    background: #666;
  }
}

/* 响应式布局调整 */
@media screen and (max-width: 768px) {
  .task-details-container {
    padding: 10px;
    gap: 10px;
  }

  .modules-row {
    flex-direction: column;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .tab-content-container,
  .task-content,
  .meta-grid {
    height: 150px;
  }
}
</style>