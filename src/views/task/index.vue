<template>
  <Layout>
    <template #content>
      <div class="task-details-container" :key="taskId">
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
                  <el-tag :type="getStatusType(task.status)">{{ task.statusText }}</el-tag>
                </div>
                <div class="divider">/</div>
                <div class="status-item">
                  <el-tag :type="getPriorityType(task.priority)">{{ task.priorityText }}</el-tag>
                </div>
              </div>
              <div class="status-item">
                <span>{{ formatDateTime(task.expectedTime) }}</span>
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
                <span class="meta-value">{{ task.projectName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">所属部门</span>
                <span class="meta-value">{{ task.departmentName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建人</span>
                <span class="meta-value">{{ task.creatorName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">执行人</span>
                <span class="meta-value">{{ task.handlerName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">验收人</span>
                <span class="meta-value">{{ task.acceptorName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">预计开始时间</span>
                <span class="meta-value">{{ formatDateTime(task.expectedStartTime) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">实际开始时间</span>
                <span class="meta-value">{{ formatDateTime(task.actualStartTime) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">状态</span>
                <span class="meta-value">{{ task.statusText }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">优先级</span>
                <span class="meta-value">{{ task.priorityText }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">期望完成时间</span>
                <span class="meta-value">{{ formatDateTime(task.expectedTime) }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 操作栏 -->
        <div class="modules-row">
          <el-card class="task-details-card action-card" shadow="hover">
            <div class="action-bar">
              <el-button type="primary" @click="handleModify">修改任务</el-button>
              <el-button type="success" @click="handleChangeStatus">变更状态</el-button>
              <el-button type="warning" @click="handleSplitTask">拆分任务</el-button>
              <el-button type="info" @click="handleCreateIssue">创建问题</el-button>
              <el-button type="primary" @click="handleTransferTask">转派任务</el-button>
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
                      <div v-if="taskComments.length > 0">
                        <div v-for="(comment, index) in taskComments" :key="index" class="remark-item">
                          <div class="remark-header">
                            <span class="remark-user">{{ comment.creatorName }}</span>
                            <span class="remark-time">{{ formatDateTime(comment.updateTime) }}</span>
                          </div>
                          <div class="remark-content" v-html="comment.content"></div>
                          <div class="remark-work-hours">
                            记录工时: <span class="work-hours-value">{{ comment.workHours }} 小时</span>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无备注" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="任务进度">
                <div class="tab-content-container">
                  <div class="activity-section">
                    <div class="scrollable-content activities-content">
                      <el-timeline v-if="taskActivities.length > 0">
                        <el-timeline-item
                            v-for="(activity, index) in taskActivities"
                            :key="activity.id"
                            :timestamp="formatDateTime(activity.createTime)"
                            placement="top"
                            :type="getTypeByIndex(index)"
                        >
                          <div class="activity-item">
                            <span class="activity-operator">{{ activity.operatorName }}</span>
                            <span class="activity-content">{{ activity.content }}</span>
                          </div>
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
              <el-tab-pane label="父任务">
                <div class="tab-content-container">
                  <div class="subtasks-section">
                    <div class="scrollable-content subtasks-content">
                      <div v-if="parentTask">
                        <div class="related-item" @click="viewParentTask(parentTask.id)">
                          <div class="related-item-header">
                            <el-tag size="small" type="primary">{{ parentTask.id }}</el-tag>
                            <el-tag size="small" :type="getStatusType(parentTask.status)">
                              {{ parentTask.statusText }}
                            </el-tag>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ parentTask.title }}</h4>
                            <p class="related-item-info">
                              <span>执行人: {{ parentTask.handlerName }}</span>
                              <span>期望完成时间: {{ formatDateTime(parentTask.expectedTime) }}</span>
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
                        <div v-for="subTask in subTasks" :key="subTask.id" class="related-item" @click="viewSubTask(subTask.id)">
                          <div class="related-item-header">
                            <el-tag size="small" type="primary">{{ subTask.id }}</el-tag>
                            <el-tag size="small" :type="getStatusType(subTask.status)">
                              {{ subTask.statusText }}
                            </el-tag>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ subTask.title }}</h4>
                            <p class="related-item-info">
                              <span>执行人: {{ subTask.handlerName }}</span>
                              <span>期望完成时间: {{ formatDateTime(subTask.expectedTime) }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无子任务" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="兄弟任务">
                <div class="tab-content-container">
                  <div class="subtasks-section">
                    <div class="scrollable-content subtasks-content">
                      <div v-if="brotherTasks.length > 0">
                        <div v-for="brotherTask in brotherTasks" :key="brotherTask.id" class="related-item" @click="viewSubTask(brotherTask.id)">
                          <div class="related-item-header">
                            <el-tag size="small" type="primary">{{ brotherTask.id }}</el-tag>
                            <div class="status-priority-line">
                              <div class="status-item">
                                <el-tag size="small" :type="getStatusType(brotherTask.status)">
                                  {{ brotherTask.statusText }}
                                </el-tag>
                              </div>
                              <div class="divider">/</div>
                              <div class="status-item">
                                <el-tag size="small" :type="getRelationType(brotherTask.relationType)">
                                  {{ getRelationText(brotherTask.relationType) }}
                                </el-tag>
                              </div>
                            </div>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ brotherTask.title }}</h4>
                            <p class="related-item-info">
                              <span>执行人: {{ brotherTask.handlerName }}</span>
                              <span>期望完成时间: {{ formatDateTime(brotherTask.expectedTime) }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无兄弟任务" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="关联问题">
                <div class="tab-content-container">
                  <div class="issues-section">
                    <div class="scrollable-content issues-content">
                      <div v-if="relatedIssues.length > 0">
                        <div v-for="issue in relatedIssues" :key="issue.id" class="related-item" @click="viewIssue(issue.id)">
                          <div class="related-item-header">
                            <el-tag size="small" type="primary">{{ issue.id }}</el-tag>
                            <el-tag size="small" :type="getStatusType(issue.status)">
                              {{ issue.statusText }}
                            </el-tag>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ issue.title }}</h4>
                            <p class="related-item-info">
                              <span>处理人: {{ issue.handlerName }}</span>
                              <span>期望完成时间: {{ formatDateTime(issue.expectedTime) }}</span>
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

      <el-dialog v-model="statusDialogVisible" title="变更任务状态" width="600px" destroy-on-close>
        <el-form :model="statusForm" label-width="100px">
          <el-form-item label="状态" prop="status">
            <el-select v-model="statusForm.status" placeholder="请选择状态" style="width: 100%">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <quill-editor
                v-model:content="statusForm.comment"
                contentType="html"
                theme="snow"
                toolbar="full"
                style="height: 200px"
            />
          </el-form-item>
          <el-form-item label="工时记录" prop="workHours">
            <el-input-number v-model="statusForm.workHours" :min="0" :precision="2" :step="0.5" style="width: 100%" />
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelChangeStatus">取消</el-button>
        <el-button type="primary" @click="confirmChangeStatus" :loading="submitting">确认</el-button>
      </span>
        </template>
      </el-dialog>

      <!-- 转派任务对话框 -->
      <el-dialog v-model="transferDialogVisible" title="转派任务" width="600px" destroy-on-close>
        <el-form :model="transferForm" label-width="100px">
          <el-form-item label="转派给" prop="handlerId">
            <el-select v-model="transferForm.handlerId" placeholder="请选择处理人" style="width: 100%">
              <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.realName"
                  :value="user.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <quill-editor
                v-model:content="transferForm.comment"
                contentType="html"
                theme="snow"
                toolbar="full"
                style="height: 200px"
            />
          </el-form-item>
          <el-form-item label="工时记录" prop="workHours">
            <el-input-number v-model="transferForm.workHours" :min="0" :precision="2" :step="0.5" style="width: 100%" />
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelTransferTask">取消</el-button>
        <el-button type="primary" @click="confirmTransferTask" :loading="submitting">确认</el-button>
      </span>
        </template>
      </el-dialog>

      <!-- 修改期望完成时间对话框 -->
      <el-dialog v-model="expectedTimeDialogVisible" title="修改期望完成时间" width="600px" destroy-on-close>
        <el-form :model="expectedTimeForm" label-width="120px">
          <el-form-item label="预计开始时间" prop="expectedStartTime">
            <el-date-picker
                v-model="expectedTimeForm.expectedStartTime"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="持续天数" prop="duration">
            <el-input-number
                v-model="expectedTimeForm.duration"
                :min="1"
                :precision="0"
                :step="1"
                style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <quill-editor
                v-model:content="expectedTimeForm.comment"
                contentType="html"
                theme="snow"
                toolbar="full"
                style="height: 200px"
            />
          </el-form-item>
          <el-form-item label="工时记录" prop="workHours">
            <el-input-number v-model="expectedTimeForm.workHours" :min="0" :precision="2" :step="0.5" style="width: 100%" />
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModifyExpectedTime">取消</el-button>
        <el-button type="primary" @click="confirmModifyExpectedTime" :loading="submitting">确认</el-button>
      </span>
        </template>
      </el-dialog>

      <!-- 添加备注对话框 -->
      <el-dialog v-model="remarksDialogVisible" title="添加备注" width="600px" destroy-on-close>
        <el-form :model="remarksForm" label-width="100px">
          <el-form-item label="备注内容" prop="content">
            <quill-editor
                v-model:content="remarksForm.content"
                contentType="html"
                theme="snow"
                toolbar="full"
                style="height: 200px"
            />
          </el-form-item>
          <el-form-item label="工时记录" prop="workHours">
            <el-input-number v-model="remarksForm.workHours" :min="0" :precision="2" :step="0.5" style="width: 100%" />
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelAddRemarks">取消</el-button>
        <el-button type="primary" @click="confirmAddRemarks" :loading="submitting">确认</el-button>
      </span>
        </template>
      </el-dialog>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import {dayjs, ElMessage, ElMessageBox} from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const taskId = ref(route.params.id)

// 初始化stores
const taskStore = useTaskStore()
const userStore = useUserStore()

// 任务数据
const task = ref({})
const loading = ref(true)
const submitting = ref(false)
const taskComments = ref([])
const taskActivities = ref([])
const subTasks = ref([])
const relatedIssues = ref([])
const parentTask = ref(null)
const brotherTasks = ref([])

// 下拉选项
const userOptions = ref([])

// 状态选项
const statusOptions = [
  { value: 1, label: '已分派' },
  { value: 2, label: '进行中' },
  { value: 3, label: '已完成' }
];

// 对话框显示状态
const statusDialogVisible = ref(false);
const transferDialogVisible = ref(false);
const expectedTimeDialogVisible = ref(false);
const remarksDialogVisible = ref(false);

// 表单数据
const statusForm = reactive({
  status: null,
  comment: '',
  workHours: 0
});

const transferForm = reactive({
  handlerId: null,
  comment: '',
  workHours: 0
});

const expectedTimeForm = reactive({
  expectedStartTime: '',
  duration: 1,
  comment: '',
  workHours: 0
});

const remarksForm = reactive({
  content: '',
  workHours: 0
});

// 监听路由参数变化
watch(
    () => route.params.id,
    async (newId) => {
      if (newId && newId !== taskId.value) {
        taskId.value = newId
        await reloadTaskData()
      }
    },
    { immediate: true }
)

// 重新加载任务数据
const reloadTaskData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchTaskDetail(),
      fetchTaskComments(),
      fetchParentTask(),
      fetchSubTasks(),
      fetchBrotherTasks(),
      fetchRelatedIssues(),
      fetchTaskActivities()
    ])
  } catch (error) {
    ElMessage.error('加载任务数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    fetchTaskDetail(),
    fetchTaskComments(),
    fetchParentTask(),
    fetchSubTasks(),
    fetchBrotherTasks(),
    fetchRelatedIssues(),
    fetchTaskActivities()
  ]);
})

// 获取用户列表
const fetchUsers = async () => {
  const users = await userStore.getUsersAction();
  if (users) {
    userOptions.value = users;
  }
};

// 获取任务备注
const fetchTaskComments = async () => {
  const comments = await taskStore.getTaskCommentsAction(taskId.value);
  if (comments) {
    taskComments.value = comments;
  }
};

// 获取任务活动
const fetchTaskActivities = async () => {
  const activities = await taskStore.getTaskActivitiesAction(route.params.id)
  if (activities) {
    taskActivities.value = activities;
  }
}

// 获取关联问题
const fetchRelatedIssues = async () => {
  const issues = await taskStore.getRelatedIssuesAction(taskId.value);
  if (issues) {
    relatedIssues.value = issues;
  }
};

// 获取父任务
const fetchParentTask = async () => {
  const parentTaskData = await taskStore.getParentTaskAction(taskId.value)
  if (parentTaskData) {
    parentTask.value = parentTaskData
  } else {
    parentTask.value = null
  }
}

// 获取子任务
const fetchSubTasks = async () => {
  const subTasksData = await taskStore.getSubTasksAction(taskId.value)
  if (subTasksData) {
    subTasks.value = subTasksData
  } else {
    subTasks.value = []
  }
}

// 获取兄弟任务
const fetchBrotherTasks = async () => {
  try {
    const tasks = await taskStore.getBrotherTasksAction(taskId.value)
    if (tasks) {
      brotherTasks.value = tasks
    } else {
      brotherTasks.value = []
    }
  } catch (error) {
    brotherTasks.value = []
  }
}

// 根据ID获取任务详情
const fetchTaskDetail = async () => {
  loading.value = true
  const taskData = await taskStore.getTaskDetailAction(taskId.value)
  if (taskData) {
    task.value = taskData
  }

  loading.value = false
}

const handleModify = () => {
  router.push(`/task/edit/${taskId.value}`);
};

const handleSplitTask = () => {
  router.push(`/task/split/${taskId.value}`);
};

const handleCreateIssue = () => {
  router.push({
    path: '/issue/create',
    query: {
      taskId: taskId.value,
      returnTo: `/task/${taskId.value}`
    }
  });
};

// 变更状态
const handleChangeStatus = () => {
  statusForm.status = task.value.status;
  statusForm.comment = '';
  statusForm.workHours = 0;
  statusDialogVisible.value = true;
};

// 确认变更状态
const confirmChangeStatus = async () => {
  if (!statusForm.status) {
    ElMessage.warning('请选择状态');
    return;
  }

  if (!statusForm.comment) {
    ElMessage.warning('请输入备注');
    return;
  }

  submitting.value = true;
  try {
    let result = await taskStore.updateTaskStatusAction(
        taskId.value,
        statusForm.status,
        statusForm.comment,
        statusForm.workHours,
        false // forceComplete
    );

    if (result.success) {
      resetStatusForm();
      statusDialogVisible.value = false;

      await Promise.all([
        fetchTaskDetail(),
        fetchTaskComments(),
        fetchTaskActivities()
      ]);
    } else if (result.unfinishedSubTaskIds && result.unfinishedSubTaskIds.length > 0) {
      // 存在未完成子任务，弹窗确认
      const ids = result.unfinishedSubTaskIds.join(',');
      ElMessageBox.confirm(
          `子任务${ids}未完成，是否将子任务同步为已完成状态？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
      ).then(async () => {
        // 用户确认后，强制完成
        let forceResult = await taskStore.updateTaskStatusAction(
            taskId.value,
            statusForm.status,
            statusForm.comment,
            statusForm.workHours,
            true // forceComplete
        );
        if (forceResult.success) {
          resetStatusForm();
          statusDialogVisible.value = false;
          await Promise.all([
            fetchTaskDetail(),
            fetchTaskComments(),
            fetchTaskActivities(),
            fetchSubTasks()
          ]);
        }
      });
    }
  } catch (error) {
    ElMessage.error('变更状态失败');
  } finally {
    submitting.value = false;
  }
};

// 取消变更状态
const cancelChangeStatus = () => {
  resetStatusForm();
  statusDialogVisible.value = false;
};

// 重置状态表单
const resetStatusForm = () => {
  statusForm.status = null;
  statusForm.comment = '';
  statusForm.workHours = 0;
};

// 转派任务
const handleTransferTask = () => {
  transferForm.handlerId = task.value.handlerId;
  transferForm.comment = '';
  transferForm.workHours = 0;
  transferDialogVisible.value = true;
};

// 确认转派任务
const confirmTransferTask = async () => {
  if (!transferForm.handlerId) {
    ElMessage.warning('请选择处理人');
    return;
  }

  if (!transferForm.comment) {
    ElMessage.warning('请输入备注');
    return;
  }

  submitting.value = true;
  try {
    const success = await taskStore.transferTaskAction(
        taskId.value,
        transferForm.handlerId,
        transferForm.comment,
        transferForm.workHours
    );

    if (success) {
      resetTransferForm();
      transferDialogVisible.value = false;
      // 重新获取任务详情和备注
      await Promise.all([
        fetchTaskDetail(),
        fetchTaskComments(),
        fetchTaskActivities()
      ]);
    }
  } catch (error) {
    console.error('转派任务失败:', error);
    ElMessage.error('转派任务失败');
  } finally {
    submitting.value = false;
  }
};

// 取消转派任务
const cancelTransferTask = () => {
  resetTransferForm();
  transferDialogVisible.value = false;
};

// 重置转派表单
const resetTransferForm = () => {
  transferForm.handlerId = null;
  transferForm.comment = '';
  transferForm.workHours = 0;
};

// 修改期望完成时间
const handleModifyExpectedTime = () => {
  expectedTimeForm.expectedStartTime = task.value.expectedStartTime;
  expectedTimeForm.duration = task.value.duration;
  expectedTimeForm.comment = '';
  expectedTimeForm.workHours = 0;
  expectedTimeDialogVisible.value = true;
};

// 确认修改期望完成时间
const confirmModifyExpectedTime = async () => {
  if (!expectedTimeForm.expectedStartTime) {
    ElMessage.warning('请选择预计开始时间');
    return;
  }

  if (!expectedTimeForm.duration || expectedTimeForm.duration < 1) {
    ElMessage.warning('持续天数必须大于0');
    return;
  }

  if (!expectedTimeForm.comment) {
    ElMessage.warning('请输入备注');
    return;
  }

  // 计算期望完成时间
  const expectedTime = dayjs(expectedTimeForm.expectedStartTime).add(expectedTimeForm.duration, 'day').format('YYYY-MM-DD HH:mm:ss');

  // 校验时间条件
  if (parentTask.value) {
    // 校验子任务的预计开始时间不能早于父任务的预计开始时间
    if (dayjs(expectedTimeForm.expectedStartTime).isBefore(dayjs(parentTask.value.expectedStartTime))) {
      ElMessage.error('子任务的预计开始时间不能早于父任务的预计开始时间');
      return;
    }

    // 校验子任务的期望完成时间不能晚于父任务的期望完成时间
    if (dayjs(expectedTime).isAfter(dayjs(parentTask.value.expectedTime))) {
      ElMessage.error('子任务的期望完成时间不能晚于父任务的期望完成时间');
      return;
    }
  }

  // 获取前置任务
  const preTasks = await taskStore.getPreTasksAction(taskId.value);
  if (preTasks && preTasks.length > 0) {
    for (const preTask of preTasks) {
      // 校验子任务的预计开始时间不能早于其前置任务的期望完成时间
      if (dayjs(expectedTimeForm.expectedStartTime).isBefore(dayjs(preTask.expectedTime))) {
        ElMessage.error(`子任务的预计开始时间不能早于前置任务的期望完成时间`);
        return;
      }

      // 校验前置任务的期望完成时间不能晚于当前子任务的期望完成时间
      if (dayjs(preTask.expectedTime).isAfter(dayjs(expectedTime))) {
        ElMessage.error(`当前任务的期望完成时间不能早于前置任务的期望完成时间`);
        return;
      }
    }
  }

  // 获取后置任务
  const postTasks = await taskStore.getPostTasksAction(taskId.value);
  if (postTasks && postTasks.length > 0) {
    for (const postTask of postTasks) {
      // 校验后置任务的预计开始时间不能早于当前任务的期望完成时间
      if (dayjs(postTask.expectedStartTime).isBefore(dayjs(expectedTime))) {
        ElMessage.error(`当前任务的期望完成时间不能晚于后置任务的预计开始时间`);
        return;
      }

      // 校验当前任务的期望完成时间不能晚于后置任务的期望完成时间
      if (dayjs(expectedTime).isAfter(dayjs(postTask.expectedTime))) {
        ElMessage.error(`当前任务的期望完成时间不能晚于后置任务的期望完成时间`);
        return;
      }
    }
  }

  submitting.value = true;
  try {
    const success = await taskStore.updateExpectedTimeAction(
        taskId.value,
        dayjs(expectedTimeForm.expectedStartTime).format('YYYY-MM-DD HH:mm:ss'),
        expectedTimeForm.duration,
        expectedTimeForm.comment,
        expectedTimeForm.workHours
    );

    if (success) {
      resetExpectedTimeForm();
      expectedTimeDialogVisible.value = false;

      await Promise.all([
        fetchTaskDetail(),
        fetchTaskComments(),
        fetchTaskActivities()
      ]);
    }
  } catch (error) {
    ElMessage.error('修改期望完成时间失败');
  } finally {
    submitting.value = false;
  }
};

// 取消修改期望完成时间
const cancelModifyExpectedTime = () => {
  resetExpectedTimeForm();
  expectedTimeDialogVisible.value = false;
};

// 重置期望完成时间表单
const resetExpectedTimeForm = () => {
  expectedTimeForm.expectedTime = '';
  expectedTimeForm.comment = '';
  expectedTimeForm.workHours = 0;
};

// 添加备注
const handleAddRemarks = () => {
  remarksForm.content = '';
  remarksForm.workHours = 0;
  remarksDialogVisible.value = true;
};

// 确认添加备注
const confirmAddRemarks = async () => {
  if (!remarksForm.content || remarksForm.content.trim() === '') {
    ElMessage.warning('请输入备注');
    return;
  }

  submitting.value = true;
  try {
    const result = await taskStore.addTaskCommentAction(
        taskId.value,
        remarksForm.content,
        remarksForm.workHours
    );

    if (result) {
      resetRemarksForm();
      remarksDialogVisible.value = false;
      await Promise.all([
        fetchTaskComments(),
        fetchTaskActivities()
      ]);
    }
  } catch (error) {
    ElMessage.error('添加备注失败');
  } finally {
    submitting.value = false;
  }
};

// 取消添加备注
const cancelAddRemarks = () => {
  resetRemarksForm();
  remarksDialogVisible.value = false;
};

// 重置备注表单
const resetRemarksForm = () => {
  remarksForm.content = '';
  remarksForm.workHours = 0;
};

// 查看关联问题
const viewIssue = (issueId) => {
  if (issueId === 0) return
  router.push(`/issue/${issueId}`)
}

// 查看子任务详情
const viewSubTask = (subTaskId) => {
  if (subTaskId === 0) return
  router.push(`/task/${subTaskId}`)
}

// 查看父任务详情
const viewParentTask = (parentTaskId) => {
  if (parentTaskId === 0) return
  router.push(`/task/${parentTaskId}`)
}

// 监听弹窗关闭事件，确保内容重置
watch(statusDialogVisible, (newVal) => {
  if (!newVal) {
    resetStatusForm();
  }
});

watch(transferDialogVisible, (newVal) => {
  if (!newVal) {
    resetTransferForm();
  }
});

watch(expectedTimeDialogVisible, (newVal) => {
  if (!newVal) {
    resetExpectedTimeForm();
  }
});

watch(remarksDialogVisible, (newVal) => {
  if (!newVal) {
    resetRemarksForm();
  }
});

// 根据索引循环timeline的type
const getTypeByIndex = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info', 'danger'];
  return types[index % types.length];
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'

  // 尝试格式化日期
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateTimeStr
  }
}

// 获取关系类型样式
const getRelationType = (type: string) => {
  const typeMap = {
    'predecessor': 'warning',
    'post': 'success',
    'brother': 'primary'
  }
  return typeMap[type] || 'info'
}

// 获取关系类型文本
const getRelationText = (type: string) => {
  const textMap = {
    'predecessor': '前置任务',
    'post': '后置任务',
    'brother': '兄弟任务'
  }
  return textMap[type] || '未知任务'
}

// 获取状态类型
const getStatusType = (status: number) => {
  const typeMap = {
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'warning',
    5: 'danger',
  }
  return typeMap[status] || 'info'
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

.remark-content {
  line-height: 1.5;
  color: #606266;
  margin-bottom: 8px;
}

.remark-work-hours {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.work-hours-value {
  font-weight: 500;
  color: #409EFF;
}

/* 编辑器容器样式 */
:deep(.quill-editor) {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 工具栏样式 */
:deep(.ql-toolbar.ql-snow) {
  width: 100%;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

/* 编辑区域样式 */
:deep(.ql-container.ql-snow) {
  width: 100%;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 编辑区域内容 */
:deep(.ql-editor) {
  min-height: 180px;
  max-height: 300px;
  overflow-y: auto;
  width: 100%;
}

/* 确保表单项占满宽度 */
.el-form-item {
  width: 100%;
}

/* 固定宽度的编辑器容器 */
.editor-container {
  width: 100%;
}

/* 进度部分 */
.activity-section {
  margin-top: 20px;
}

.activities-content {
  padding: 10px;
}

.activity-item {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.activity-operator {
  font-weight: bold;
  margin-bottom: 4px;
}

.activity-content {
  color: #606266;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 13px;
  color: #909399;
}

:deep(.el-timeline-item__node--primary) {
  background-color: #409eff;
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