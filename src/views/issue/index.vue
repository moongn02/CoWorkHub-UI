<template>
  <Layout>
    <template #content>
      <div class="issue-details-container">
        <!-- 模块1: 标题和问题编号 -->
        <el-card class="issue-details-card title-card" shadow="hover">
          <div class="title-section">
            <div class="title-left">
              <h2 class="issue-title">{{ issue.title }}</h2>
              <div class="issue-id">问题编号: {{ issue.id }}</div>
            </div>
            <div class="status-section">
              <div class="status-severity-line">
                <div class="status-item">
                  <el-tag :type="getStatusType(issue.status)">{{ issue.statusText }}</el-tag>
                </div>
                <div class="divider">/</div>
                <div class="status-item">
                  <el-tag :type="getSeverityType(issue.severity)">{{ issue.severityText }}</el-tag>
                </div>
                <div class="divider">/</div>
                <div class="status-item">
                  <el-tag :type="getUrgencyType(issue.urgency)">{{ issue.urgencyText }}</el-tag>
                </div>
              </div>
              <div class="status-item">
                <span>{{ formatDateTime(issue.expectedTime) }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 包含模块 2 和 3 的行 -->
        <div class="modules-row">
          <!-- 模块2: 问题内容 -->
          <el-card class="issue-details-card content-card" shadow="hover">
            <div class="card-header">
              <h3 class="section-title">问题内容</h3>
            </div>
            <div class="issue-content scrollable-content" v-html="issue.content"></div>
          </el-card>

          <!-- 模块3: 问题元数据 -->
          <el-card class="issue-details-card meta-card" shadow="hover">
            <div class="card-header">
              <h3 class="section-title">问题详情</h3>
            </div>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">所属项目</span>
                <span class="meta-value">{{ issue.projectName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">所属部门</span>
                <span class="meta-value">{{ issue.departmentName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">问题类型</span>
                <span class="meta-value">{{ issue.typeText }}</span>
              </div>
              <div v-if="issue.type === 1" class="meta-item">
                <span class="meta-label">Bug 原因</span>
                <span class="meta-value">{{ issue.bugCauseText }}</span>
              </div>
              <div v-if="issue.bugCause === 6" class="meta-item">
                <span class="meta-label">其他 Bug 原因</span>
                <span class="meta-value">{{ issue.otherBugCause }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建人</span>
                <span class="meta-value">{{ issue.creatorName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">测试人员</span>
                <span class="meta-value">{{ issue.testerName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">处理人</span>
                <span class="meta-value">{{ issue.handlerName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">测试轮次</span>
                <span class="meta-value">{{ issue.testRound }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">状态</span>
                <span class="meta-value">{{ issue.statusText }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">严重程度</span>
                <span class="meta-value">{{ issue.severityText }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">紧急程度</span>
                <span class="meta-value">{{ issue.urgencyText }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">浏览器</span>
                <span class="meta-value">{{ issue.browserText }}</span>
              </div>
              <div v-if="issue.browser === 6" class="meta-item">
                <span class="meta-label">其他浏览器</span>
                <span class="meta-value">{{ issue.otherBrowser }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">平台</span>
                <span class="meta-value">{{ issue.platformText }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">系统</span>
                <span class="meta-value">{{ issue.sysText }}</span>
              </div>
              <div v-if="issue.sys === 5" class="meta-item">
                <span class="meta-label">其他系统</span>
                <span class="meta-value">{{ issue.otherSys }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">关联任务</span>
                <span class="meta-value">
                  <el-link type="primary" @click="viewTask(issue.taskId)">{{ issue.taskId }}</el-link>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建时间</span>
                <span class="meta-value">{{ formatDateTime(issue.createTime) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">期望完成时间</span>
                <span class="meta-value">{{ formatDateTime(issue.expectedTime) }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 操作栏 -->
        <div class="modules-row">
          <el-card class="issue-details-card action-card" shadow="hover">
            <div class="action-bar">
              <el-button type="primary" @click="handleModify">修改问题</el-button>
              <el-button type="success" @click="handleChangeStatus">变更状态</el-button>
              <el-button type="warning" @click="handleTransferIssue">转派问题</el-button>
              <el-button type="primary" @click="handleRelateTask">修改关联任务</el-button>
              <el-button type="danger" @click="handleModifyExpectedTime">修改期望时间</el-button>
              <el-button type="info" @click="handleAddRemarks">备注</el-button>
            </div>
          </el-card>
        </div>

        <!-- 包含模块 4 和 5 的行 -->
        <div class="modules-row">
          <!-- 模块4: 备注和问题进度 -->
          <el-card class="issue-details-card tabs-card" shadow="hover">
            <el-tabs>
              <el-tab-pane label="备注">
                <div class="tab-content-container">
                  <div class="remarks-section">
                    <div class="scrollable-content remarks-content">
                      <div v-if="issueComments.length > 0">
                        <div v-for="(comment, index) in issueComments" :key="index" class="remark-item">
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
              <el-tab-pane label="问题进度">
                <div class="tab-content-container">
                  <div class="activity-section">
                    <div class="scrollable-content activities-content">
                      <el-timeline v-if="issueActivities.length > 0">
                        <el-timeline-item
                            v-for="(activity, index) in issueActivities"
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
                      <el-empty v-else description="暂无问题进度" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>

          <!-- 模块5: 关联任务 -->
          <el-card class="issue-details-card tabs-card" shadow="hover">
            <el-tabs>
              <el-tab-pane label="关联任务">
                <div class="tab-content-container">
                  <div class="related-issues-section">
                    <div class="scrollable-content related-issues-content">
                      <div v-if="relatedTask" @click="viewTask(relatedTask.id)">
                        <div class="related-item">
                          <div class="related-item-header">
                            <el-tag size="small" type="primary">{{ relatedTask.id }}</el-tag>
                            <el-tag size="small" :type="getStatusType(relatedTask.status)">
                              {{ relatedTask.statusText }}
                            </el-tag>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ relatedTask.title }}</h4>
                            <p class="related-item-info">
                              <span>执行人: {{ relatedTask.handlerName }}</span>
                              <span>期望完成时间: {{ formatDateTime(relatedTask.expectedTime) }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无关联任务" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </div>

      <!-- 变更状态对话框 -->
      <el-dialog v-model="statusDialogVisible" title="变更问题状态" width="600px" destroy-on-close @closed="resetStatusForm">
        <el-form :model="statusForm" label-width="100px">
          <el-form-item label="状态" prop="status">
            <el-select v-model="statusForm.status" placeholder="请选择状态" style="width: 100%">
              <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <div class="editor-container">
              <quill-editor
                  v-model:content="statusForm.comment"
                  contentType="html"
                  theme="snow"
                  toolbar="full"
              />
            </div>
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

      <!-- 转派问题对话框 -->
      <el-dialog v-model="transferDialogVisible" title="转派问题" width="600px" destroy-on-close @closed="resetTransferForm">
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
            <div class="editor-container">
              <quill-editor
                  v-model:content="transferForm.comment"
                  contentType="html"
                  theme="snow"
                  toolbar="full"
              />
            </div>
          </el-form-item>
          <el-form-item label="工时记录" prop="workHours">
            <el-input-number v-model="transferForm.workHours" :min="0" :precision="2" :step="0.5" style="width: 100%" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelTransferIssue">取消</el-button>
            <el-button type="primary" @click="confirmTransferIssue" :loading="submitting">确认</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 修改期望完成时间对话框 -->
      <el-dialog v-model="expectedTimeDialogVisible" title="修改期望完成时间" width="600px" destroy-on-close @closed="resetExpectedTimeForm">
        <el-form :model="expectedTimeForm" label-width="120px">
          <el-form-item label="期望完成时间" prop="expectedTime">
            <el-date-picker
                v-model="expectedTimeForm.expectedTime"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <div class="editor-container">
              <quill-editor
                  v-model:content="expectedTimeForm.comment"
                  contentType="html"
                  theme="snow"
                  toolbar="full"
              />
            </div>
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

      <!-- 关联任务对话框 -->
      <el-dialog v-model="relateTaskDialogVisible" title="修改关联任务" width="600px" destroy-on-close @closed="resetRelateTaskForm">
        <el-form :model="relateTaskForm" label-width="100px">
          <el-form-item label="任务编号" prop="taskId">
            <el-input v-model="relateTaskForm.taskId" placeholder="请输入任务编号" />
          </el-form-item>
          <el-form-item label="工时记录" prop="workHours">
            <el-input-number v-model="relateTaskForm.workHours" :min="0" :precision="2" :step="0.5" style="width: 100%" />
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <div class="editor-container">
              <quill-editor
                  v-model:content="relateTaskForm.comment"
                  contentType="html"
                  theme="snow"
                  toolbar="full"
              />
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelRelateTask">取消</el-button>
        <el-button type="primary" @click="confirmRelateTask" :loading="submitting">确认</el-button>
      </span>
        </template>
      </el-dialog>

      <!-- 添加备注对话框 -->
      <el-dialog v-model="remarksDialogVisible" title="添加备注" width="600px" destroy-on-close @closed="resetRemarksForm">
        <el-form :model="remarksForm" label-width="100px">
          <el-form-item label="备注内容" prop="content">
            <div class="editor-container">
              <quill-editor
                  v-model:content="remarksForm.content"
                  contentType="html"
                  theme="snow"
                  toolbar="full"
              />
            </div>
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
import { ElMessage } from 'element-plus'
import { useIssueStore } from '@/stores/issue'
import { useUserStore } from '@/stores/user'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 获取路由参数
const route = useRoute()
const router = useRouter()

// 初始化 store
const issueStore = useIssueStore()
const userStore = useUserStore()

// 问题数据
const issue = ref({})
const issueActivities = ref([])
const relatedTask = ref(null)

const issueId = ref(route.params.id);
const issueDetail = ref({});
const issueComments = ref([]);
const loading = ref(false);
const submitting = ref(false);

// 下拉选项
const userOptions = ref([])

// 状态选项
const statusOptions = [
  { value: 1, label: '待处理' },
  { value: 2, label: '处理中' },
  { value: 3, label: '已解决' }
];

// 对话框状态
const modifyDialogVisible = ref(false);
const statusDialogVisible = ref(false);
const transferDialogVisible = ref(false);
const relateTaskDialogVisible = ref(false);
const expectedTimeDialogVisible = ref(false);
const remarksDialogVisible = ref(false);

// 变更状态表单
const statusForm = reactive({
  status: 1,
  comment: '',
  workHours: 0
});

// 转派问题表单
const transferForm = reactive({
  handlerId: null,
  comment: '',
  workHours: 0
});

// 修改期望时间表单
const expectedTimeForm = reactive({
  expectedTime: '',
  comment: '',
  workHours: 0
});

// 备注表单
const remarksForm = reactive({
  content: '',
  workHours: 0
});

// 关联任务表单
const relateTaskForm = reactive({
  taskId: '',
  comment: '',
  workHours: 0
});

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    getIssueDetails(),
    fetchUsers(),
  ])
})

// 获取问题详情
const getIssueDetails = async () => {
  loading.value = true;
  const res = await issueStore.getIssueDetailAction(issueId.value);
  loading.value = false;
  if (res) {
    issue.value = res
    issueDetail.value = res

    await getIssueComments();
    await getRelatedTask();
    await getIssueActivities();
  } else {
    ElMessage.error('获取问题详情失败');
  }
};

// 获取问题备注
const getIssueComments = async () => {
  try {
    const comments = await issueStore.getIssueCommentsAction(issueId.value);
    issueComments.value = comments || [];
  } catch (error) {
    ElMessage.error('获取问题备注失败');
  }
};

// 获取关联任务信息
const getRelatedTask = async () => {
  try {
    const relateTask = await issueStore.getRelatedTaskAction(issueId.value);
    relatedTask.value = relateTask || null;
  } catch (error) {
    ElMessage.error('获取关联任务数据失败');
  }
};

// 获取问题进度
const getIssueActivities = async () => {
  try {
    const activities = await issueStore.getIssueActivitiesAction(issueId.value);
    issueActivities.value = activities || [];
  } catch (error) {
    ElMessage.error('获取问题进度数据失败');
  }
};

// 获取用户列表
const fetchUsers = async () => {
  const users = await userStore.getUsersAction();
  if (users) {
    userOptions.value = users;
  }
};

// 打开变更状态对话框
const handleChangeStatus = () => {
  statusForm.status = issueDetail.value.status;
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
    const success = await issueStore.updateIssueStatusAction(
        issueId.value,
        statusForm.status,
        statusForm.comment,
        statusForm.workHours
    );

    if (success) {
      statusDialogVisible.value = false;

      await getIssueDetails();
    }
  } catch (error) {
    ElMessage.error('变更状态失败');
  } finally {
    submitting.value = false;
  }
};

// 取消变更状态
const cancelChangeStatus = () => {
  statusDialogVisible.value = false;
};

// 重置状态表单
const resetStatusForm = () => {
  statusForm.status = 1;
  statusForm.comment = '';
  statusForm.workHours = 0;
};

// 打开转派问题对话框
const handleTransferIssue = () => {
  transferForm.handlerId = issueDetail.value.handlerId;
  transferForm.comment = '';
  transferForm.workHours = 0;
  transferDialogVisible.value = true;
};

// 确认转派问题
const confirmTransferIssue = async () => {
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
    const success = await issueStore.transferIssueAction(
        issueId.value,
        transferForm.handlerId,
        transferForm.comment,
        transferForm.workHours
    );

    if (success) {
      transferDialogVisible.value = false;

      await getIssueDetails();
    }
  } catch (error) {
    ElMessage.error('转派问题失败');
  } finally {
    submitting.value = false;
  }
};

// 取消转派问题
const cancelTransferIssue = () => {
  transferDialogVisible.value = false;
};

// 重置转派表单
const resetTransferForm = () => {
  transferForm.handlerId = null;
  transferForm.comment = '';
  transferForm.workHours = 0;
};

// 打开修改期望完成时间对话框
const handleModifyExpectedTime = () => {
  expectedTimeForm.expectedTime = issueDetail.value.expectedTime;
  expectedTimeForm.comment = '';
  expectedTimeForm.workHours = 0;
  expectedTimeDialogVisible.value = true;
};

// 确认修改期望完成时间
const confirmModifyExpectedTime = async () => {
  if (!expectedTimeForm.expectedTime) {
    ElMessage.warning('请选择期望完成时间');
    return;
  }

  if (!expectedTimeForm.comment) {
    ElMessage.warning('请输入备注');
    return;
  }

  submitting.value = true;
  try {
    const success = await issueStore.updateIssueExpectedTimeAction(
        issueId.value,
        formatDateTime(expectedTimeForm.expectedTime),
        expectedTimeForm.comment,
        expectedTimeForm.workHours
    );

    if (success) {
      expectedTimeDialogVisible.value = false;

      await getIssueDetails();
    }
  } catch (error) {
    ElMessage.error('修改期望完成时间失败');
  } finally {
    submitting.value = false;
  }
};

// 取消修改期望完成时间
const cancelModifyExpectedTime = () => {
  expectedTimeDialogVisible.value = false;
};

// 重置期望完成时间表单
const resetExpectedTimeForm = () => {
  expectedTimeForm.expectedTime = '';
  expectedTimeForm.comment = '';
  expectedTimeForm.workHours = 0;
};

// 打开关联任务对话框
const handleRelateTask = () => {
  relateTaskForm.taskId = issueDetail.value.taskId || '';
  relateTaskForm.comment = '';
  relateTaskForm.workHours = 0;
  relateTaskDialogVisible.value = true;
};

// 确认关联任务
const confirmRelateTask = async () => {
  if (!relateTaskForm.taskId) {
    ElMessage.warning('请输入任务编号');
    return;
  }

  if (!relateTaskForm.comment) {
    ElMessage.warning('请输入备注');
    return;
  }

  submitting.value = true;
  try {
    const success = await issueStore.relateTaskAction(
        issueId.value,
        relateTaskForm.taskId,
        relateTaskForm.comment,
        relateTaskForm.workHours
    );

    if (success) {
      relateTaskDialogVisible.value = false;

      await getIssueDetails();
    }
  } catch (error) {
    ElMessage.error('关联任务失败');
  } finally {
    submitting.value = false;
  }
};

// 取消关联任务
const cancelRelateTask = () => {
  relateTaskDialogVisible.value = false;
};

// 重置关联任务表单
const resetRelateTaskForm = () => {
  relateTaskForm.taskId = '';
  relateTaskForm.comment = '';
  relateTaskForm.workHours = 0;
};


// 打开添加备注对话框
const handleAddRemarks = () => {
  remarksForm.content = '';
  remarksForm.workHours = 0;
  remarksDialogVisible.value = true;
};

// 确认添加备注
const confirmAddRemarks = async () => {
  if (!remarksForm.content) {
    ElMessage.warning('请输入备注');
    return;
  }

  submitting.value = true;
  try {
    const result = await issueStore.addIssueCommentAction(
        issueId.value,
        remarksForm.content,
        remarksForm.workHours
    );

    if (result) {
      remarksDialogVisible.value = false;

      await getIssueComments();
    }
  } catch (error) {
    ElMessage.error('添加备注失败');
  } finally {
    submitting.value = false;
  }
};

// 取消添加备注
const cancelAddRemarks = () => {
  remarksDialogVisible.value = false;
};

// 重置备注表单
const resetRemarksForm = () => {
  remarksForm.content = '';
  remarksForm.workHours = 0;
};

// 打开修改问题页面
const handleModify = () => {
  router.push(`/issue/edit/${issueId.value}`);
};

watch(statusDialogVisible, (val) => {
  if (!val) resetStatusForm();
});

watch(transferDialogVisible, (val) => {
  if (!val) resetTransferForm();
});

watch(relateTaskDialogVisible, (val) => {
  if (!val) resetRelateTaskForm();
});

watch(expectedTimeDialogVisible, (val) => {
  if (!val) resetExpectedTimeForm();
});

watch(remarksDialogVisible, (val) => {
  if (!val) resetRemarksForm();
});

// 根据索引循环timeline的type
const getTypeByIndex = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info', 'danger'];
  return types[index % types.length];
};

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
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    console.error('日期格式化错误:', e)
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
    4: 'success',     // 细微错误
    5: 'info'   // 改进错误
  }
  return typeMap[severity] || 'info'
}

// 获取严重程度类型
const getUrgencyType = (urgency) => {
  const typeMap = {
    0: 'primary',     // 一般
    1: 'danger',   // 紧急
  }
  return typeMap[urgency] || 'info'
}

// 查看关联任务
const viewTask = (taskId) => {
  if (taskId === 0) return
  router.push(`/task/${taskId}`)
}

</script>

<style scoped>
.issue-details-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.issue-details-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.issue-details-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 模块1: 标题和问题编号 */
.title-section {
  padding: 5px;
  display: flex;
  justify-content: space-between;
}

.title-left {
  flex: 1;
}

.issue-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.issue-id {
  font-size: 14px;
  color: #909399;
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 20px;
}

.status-severity-line {
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

.modules-row .issue-details-card {
  display: flex;
  flex-direction: column;
}

/* 模块2: 问题内容 */
.content-card {
  flex: 3;
  min-height: 410px;
  max-height: 410px;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 0;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.section-title {
  margin: 0;
  padding: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.issue-content {
  flex: 1;
  padding: 10px 16px 16px 20px;
  line-height: 1.6;
  color: #606266;
  overflow: auto;
  height: calc(410px - 45px);
  max-height: calc(410px - 45px);
  box-sizing: border-box;
}

.issue-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.issue-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.issue-content :deep(pre) {
  white-space: pre-wrap; /* 允许代码块换行 */
  word-wrap: break-word; /* 允许长单词换行 */
}

/* 模块3: 问题元数据 */
.meta-card {
  flex: 2;
  min-height: 410px;
  max-height: 410px;
  display: flex;
  flex-direction: column;
}

.meta-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 20px 20px 0 20px;
  overflow-y: auto;
  height: calc(410px - 45px);
  max-height: calc(410px - 45px);
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

/* 标签内容容器 */
.tab-content-container {
  height: 250px;
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

.related-issues-section {
  margin-bottom: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.related-issues-content {
  flex: 1;
}

.related-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
.issue-content::-webkit-scrollbar,
.meta-grid::-webkit-scrollbar,
.tab-content-container::-webkit-scrollbar,
:deep(.ql-editor)::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.issue-content::-webkit-scrollbar-track,
.meta-grid::-webkit-scrollbar-track,
.tab-content-container::-webkit-scrollbar-track,
:deep(.ql-editor)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.issue-content::-webkit-scrollbar-thumb,
.meta-grid::-webkit-scrollbar-thumb,
.tab-content-container::-webkit-scrollbar-thumb,
:deep(.ql-editor)::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.issue-content::-webkit-scrollbar-thumb:hover,
.meta-grid::-webkit-scrollbar-thumb:hover,
.tab-content-container::-webkit-scrollbar-thumb:hover,
:deep(.ql-editor)::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 问题内容中富文本内容样式 */
.issue-content :deep(*) {
  max-width: 100%;
  box-sizing: border-box;
}

.issue-content :deep(pre),
.issue-content :deep(code) {
  overflow-x: auto;
  white-space: pre;
  background-color: #f6f6f6;
  border-radius: 3px;
  padding: 2px 5px;
}

.issue-content :deep(pre) {
  padding: 10px;
  margin: 10px 0;
}

.issue-content :deep(blockquote) {
  border-left: 3px solid #ddd;
  margin-left: 0;
  padding-left: 10px;
  color: #777;
}

/* 暗色主题适配 */
:deep(.dark) {
  .issue-details-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .issue-title {
    color: #e5e7eb;
  }

  .section-title {
    color: #e5e7eb;
  }

  .issue-content {
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

  .related-item {
    background-color: #363636;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .related-item-content h4 {
    color: #e5e7eb;
  }

  .issue-content::-webkit-scrollbar-track,
  .meta-grid::-webkit-scrollbar-track,
  .tab-content-container::-webkit-scrollbar-track,
  :deep(.ql-editor)::-webkit-scrollbar-track {
    background: #2d2d2d;
  }

  .issue-content::-webkit-scrollbar-thumb,
  .meta-grid::-webkit-scrollbar-thumb,
  .tab-content-container::-webkit-scrollbar-thumb,
  :deep(.ql-editor)::-webkit-scrollbar-thumb {
    background: #666;
  }

  .issue-content :deep(pre),
  .issue-content :deep(code) {
    background-color: #3a3a3a;
    color: #e0e0e0;
  }
}

/* 响应式布局调整 */
@media screen and (max-width: 768px) {
  .issue-details-container {
    padding: 10px;
    gap: 10px;
  }

  .modules-row {
    flex-direction: column;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .content-card, .meta-card {
    min-height: 300px;
    max-height: 300px;
  }

  .issue-content, .meta-grid {
    height: calc(300px - 45px);
    max-height: calc(300px - 45px);
  }

  .tab-content-container {
    height: 200px;
  }
}
</style>