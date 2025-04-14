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
                <div v-if="issue.urgency === 1" class="status-item">
                  <el-tag type="danger">紧急</el-tag>
                </div>
              </div>
              <div class="status-item">
                <span>期望完成: {{ formatDateTime(issue.expectedTime) }}</span>
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
              <div v-if="issue.taskId && issue.taskId > 0" class="meta-item">
                <span class="meta-label">关联任务</span>
                <span class="meta-value">
                  <el-link type="primary" @click="viewTask(issue.taskId)">{{ issue.taskTitle || issue.taskId }}</el-link>
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
                      <div v-if="issueMemos.length > 0">
                        <div v-for="(memo, index) in issueMemos" :key="index" class="remark-item">
                          <div class="remark-header">
                            <span class="remark-user">{{ memo.user }}</span>
                            <span class="remark-time">{{ memo.time }}</span>
                          </div>
                          <div class="remark-content">{{ memo.content }}</div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无备注" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="问题进度">
                <div class="tab-content-container">
                  <div class="progress-section">
                    <div class="scrollable-content progress-content">
                      <el-timeline>
                        <el-timeline-item
                            v-for="(activity, index) in issueActivities"
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

          <!-- 模块5: 相关问题 -->
          <el-card class="issue-details-card tabs-card" shadow="hover">
            <el-tabs>
              <el-tab-pane label="相关问题">
                <div class="tab-content-container">
                  <div class="related-issues-section">
                    <div class="scrollable-content related-issues-content">
                      <div v-if="relatedIssues.length > 0">
                        <div v-for="relatedIssue in relatedIssues" :key="relatedIssue.id" class="related-item">
                          <div class="related-item-header">
                            <el-tag size="small" type="warning">{{ relatedIssue.id }}</el-tag>
                            <el-tag size="small" :type="getStatusType(relatedIssue.status)">
                              {{ relatedIssue.statusText }}
                            </el-tag>
                          </div>
                          <div class="related-item-content">
                            <h4>{{ relatedIssue.title }}</h4>
                            <p class="related-item-info">
                              <span>处理人: {{ relatedIssue.handlerName }}</span>
                              <span>严重程度: {{ relatedIssue.severityText }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无相关问题" :image-size="60" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </div>

      <!-- 对话框：修改问题 -->
      <el-dialog v-model="modifyDialogVisible" title="修改问题" width="60%">
        <el-form :model="modifyForm" label-width="100px" label-position="right">
          <el-form-item label="问题标题" required>
            <el-input v-model="modifyForm.title" placeholder="请输入问题标题" />
          </el-form-item>
          <el-form-item label="问题内容" required>
            <el-input v-model="modifyForm.content" type="textarea" :rows="6" placeholder="请输入问题内容" />
          </el-form-item>
          <el-form-item label="严重程度">
            <el-select v-model="modifyForm.severity" placeholder="请选择严重程度" style="width: 100%">
              <el-option label="致命错误【1级】" :value="1" />
              <el-option label="严重错误【2级】" :value="2" />
              <el-option label="一般错误【3级】" :value="3" />
              <el-option label="细微错误【4级】" :value="4" />
              <el-option label="改进错误【5级】" :value="5" />
            </el-select>
          </el-form-item>
          <el-form-item label="紧急程度">
            <el-select v-model="modifyForm.urgency" placeholder="请选择紧急程度" style="width: 100%">
              <el-option label="一般" :value="0" />
              <el-option label="紧急" :value="1" />
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

      <!-- 对话框：更改状态 -->
      <el-dialog v-model="statusDialogVisible" title="更改问题状态" width="30%">
        <el-form :model="statusForm">
          <el-form-item label="状态">
            <el-select v-model="statusForm.status" placeholder="请选择状态">
              <el-option label="已分派" :value="1" />
              <el-option label="处理中" :value="2" />
              <el-option label="已解决" :value="3" />
              <el-option label="已暂停" :value="4" />
              <el-option label="已关闭" :value="5" />
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

      <!-- 对话框：转派问题 -->
      <el-dialog v-model="transferDialogVisible" title="转派问题" width="30%">
        <el-form :model="transferForm">
          <el-form-item label="转派给">
            <el-select v-model="transferForm.handlerId" placeholder="请选择处理人">
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
            <el-button type="primary" @click="confirmTransferIssue">确认</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 对话框：修改期望完成时间 -->
      <el-dialog v-model="expectedTimeDialogVisible" title="修改期望完成时间" width="30%">
        <el-form :model="expectedTimeForm">
          <el-form-item label="期望完成时间">
            <el-date-picker
                v-model="expectedTimeForm.expectedTime"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
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

      <!-- 对话框：添加备注 -->
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { ElMessage } from 'element-plus'
import { useIssueStore } from '@/stores/issue'
import { useUserStore } from '@/stores/user'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const issueId = route.params.id

// 初始化 store
const issueStore = useIssueStore()
const userStore = useUserStore()

// 问题数据
const issue = ref({})
const loading = ref(true)

// 模拟数据（后续可替换为实际数据）
const issueMemos = ref([])
const issueActivities = ref([])
const relatedIssues = ref([])

// 下拉选项
const userOptions = ref([])

// 对话框状态
const modifyDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const transferDialogVisible = ref(false)
const expectedTimeDialogVisible = ref(false)
const remarksDialogVisible = ref(false)

// 表单数据
const modifyForm = ref({
  title: '',
  content: '',
  severity: null,
  urgency: null
})

const statusForm = ref({
  status: null,
  remark: ''
})

const transferForm = ref({
  handlerId: null,
  reason: ''
})

const expectedTimeForm = ref({
  expectedTime: '',
  reason: ''
})

const remarksForm = ref({
  content: ''
})

// 初始化数据
onMounted(async () => {
  await Promise.all([
    fetchIssueDetail(),
  ])
})

// 根据ID获取问题详情
const fetchIssueDetail = async () => {
  loading.value = true
  try {
    const issueData = await issueStore.getIssueDetailAction(issueId)

    if (issueData) {
      issue.value = issueData

      // 初始化修改表单数据
      modifyForm.value = {
        title: issueData.title,
        content: issueData.content,
        severity: issueData.severity,
        urgency: issueData.urgency
      }

      // 在获取问题成功后，可以加载相关数据
      await fetchRelatedData()
    } else {
      ElMessage.error('问题不存在或已被删除')
      router.push('/issue')
    }
  } catch (error) {
    ElMessage.error('加载问题详情失败')
  } finally {
    loading.value = false
  }
}

// 获取相关数据
const fetchRelatedData = async () => {
  // 这里可以添加获取备注、活动、相关问题等逻辑
  console.log('获取相关数据')
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
    3: 'success',  // 已解决
    4: 'warning',  // 已暂停
    5: 'danger'    // 已关闭
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

// 查看关联任务
const viewTask = (taskId) => {
  router.push(`/task/${taskId}`)
}

// 处理修改问题
const handleModify = () => {
  modifyDialogVisible.value = true
}

// 确认修改问题
const confirmModify = async () => {
  try {
    // 构建更新数据
    const updateData = {
      id: issue.value.id,
      title: modifyForm.value.title,
      content: modifyForm.value.content,
      severity: modifyForm.value.severity,
      urgency: modifyForm.value.urgency
    }

    // 调用更新方法
    const success = await issueStore.updateIssueAction(updateData)
    if (success) {
      modifyDialogVisible.value = false
      // 重新获取问题详情
      await fetchIssueDetail()
    }
  } catch (error) {
    console.error('修改问题失败:', error)
    ElMessage.error('修改问题失败')
  }
}

// 处理变更状态
const handleChangeStatus = () => {
  statusForm.value.status = issue.value.status
  statusForm.value.remark = ''
  statusDialogVisible.value = true
}

// 确认变更状态
const confirmChangeStatus = async () => {
  try {
    // 构建更新数据
    const updateData = {
      id: issue.value.id,
      status: statusForm.value.status
    }

    // 调用更新方法
    const success = await issueStore.updateIssueAction(updateData)
    if (success) {
      // 如果有备注，可以添加备注
      if (statusForm.value.remark) {
        // 添加备注逻辑（可以扩展）
      }

      statusDialogVisible.value = false
      // 重新获取问题详情
      await fetchIssueDetail()
    }
  } catch (error) {
    console.error('变更状态失败:', error)
    ElMessage.error('变更状态失败')
  }
}

// 处理转派问题
const handleTransferIssue = () => {
  transferForm.value.handlerId = issue.value.handlerId
  transferForm.value.reason = ''
  transferDialogVisible.value = true
}

// 确认转派问题
const confirmTransferIssue = async () => {
  try {
    // 构建更新数据
    const updateData = {
      id: issue.value.id,
      handlerId: transferForm.value.handlerId
    }

    // 调用更新方法
    const success = await issueStore.updateIssueAction(updateData)
    if (success) {
      // 如果有备注，可以添加备注
      if (transferForm.value.reason) {
        // 添加备注逻辑（可以扩展）
      }

      transferDialogVisible.value = false
      // 重新获取问题详情
      await fetchIssueDetail()
    }
  } catch (error) {
    console.error('转派问题失败:', error)
    ElMessage.error('转派问题失败')
  }
}

// 处理修改期望完成时间
const handleModifyExpectedTime = () => {
  expectedTimeForm.value.expectedTime = issue.value.expectedTime
  expectedTimeForm.value.reason = ''
  expectedTimeDialogVisible.value = true
}

// 确认修改期望完成时间
const confirmModifyExpectedTime = async () => {
  try {
    // 构建更新数据
    const updateData = {
      id: issue.value.id,
      expectedTime: expectedTimeForm.value.expectedTime
    }

    // 调用更新方法
    const success = await issueStore.updateIssueAction(updateData)
    if (success) {
      // 如果有备注，可以添加备注
      if (expectedTimeForm.value.reason) {
        // 添加备注逻辑（可以扩展）
      }

      expectedTimeDialogVisible.value = false
      // 重新获取问题详情
      await fetchIssueDetail()
    }
  } catch (error) {
    console.error('修改期望完成时间失败:', error)
    ElMessage.error('修改期望完成时间失败')
  }
}

// 处理添加备注
const handleAddRemarks = () => {
  remarksForm.value.content = ''
  remarksDialogVisible.value = true
}

// 确认添加备注
const confirmAddRemarks = async () => {
  try {
    // 这里应该调用添加备注的API
    // 暂时使用模拟数据
    issueMemos.value.unshift({
      user: '当前用户',
      time: formatDateTime(new Date()),
      content: remarksForm.value.content
    })

    remarksDialogVisible.value = false
    ElMessage.success('添加备注成功')
  } catch (error) {
    console.error('添加备注失败:', error)
    ElMessage.error('添加备注失败')
  }
}
</script>

<style scoped>
.loading-container, .error-container {
  padding: 40px 20px;
  text-align: center;
}

.issue-details-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.issue-details-card {
  border-radius: 12px;
  transition: all 0.3s ease;
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

.modules-row .issue-details-card {
  display: flex;
  flex-direction: column;
}

/* 模块2: 问题内容 */
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

.issue-content {
  height: 320px;
  overflow-y: auto;
  padding: 10px 16px 16px 20px;
  line-height: 1.6;
  color: #606266;
}

/* 模块3: 问题元数据 */
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

.issue-content, .meta-grid {
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
.issue-content::-webkit-scrollbar,
.meta-grid::-webkit-scrollbar {
  width: 4px;
}

.tab-content-container::-webkit-scrollbar-track,
.issue-content::-webkit-scrollbar-track,
.meta-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tab-content-container::-webkit-scrollbar-thumb,
.issue-content::-webkit-scrollbar-thumb,
.meta-grid::-webkit-scrollbar-thumb {
  background: #909399;
  border-radius: 4px;
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

  .tab-content-container::-webkit-scrollbar-track,
  .issue-content::-webkit-scrollbar-track,
  .meta-grid::-webkit-scrollbar-track {
    background: #2d2d2d;
  }

  .tab-content-container::-webkit-scrollbar-thumb,
  .issue-content::-webkit-scrollbar-thumb,
  .meta-grid::-webkit-scrollbar-thumb {
    background: #666;
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

  .tab-content-container,
  .issue-content,
  .meta-grid {
    height: 150px;
  }
}
</style>