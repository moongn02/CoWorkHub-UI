<template>
  <Layout>
    <template #content>
      <div class="create-issue-container">
        <el-card class="issue-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">创建问题</h3>
            </div>
          </template>

          <el-form
              ref="issueFormRef"
              :model="issueForm"
              :rules="rules"
              label-width="120px"
              class="issue-form"
          >
            <!-- 基本信息 -->
            <div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="任务编号">
                    <el-input v-model="issueForm.taskId" placeholder="--" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="测试轮次" prop="testRound">
                    <el-select v-model="issueForm.testRound" placeholder="请选择">
                      <el-option label="0" value="0" />
                      <el-option label="1" value="1" />
                      <el-option label="2" value="2" />
                      <el-option label="3" value="3" />
                      <el-option label="4" value="4" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="项目" prop="projectId" required>
                    <el-cascader
                        v-model="issueForm.projectId"
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
                </el-col>
                <el-col :span="12">
                  <el-form-item label="目标部门" prop="departmentId" required>
                    <el-cascader
                        v-model="issueForm.departmentId"
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
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="测试人" prop="testerId" required>
                    <el-select
                        v-model="issueForm.testerId"
                        placeholder="请选择"
                        filterable
                        :default-first-option="true"
                    >
                      <el-option
                          v-for="user in users"
                          :key="user.id"
                          :label="user.realName"
                          :value="user.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="处理人" prop="handlerId" required>
                    <el-select
                        v-model="issueForm.handlerId"
                        placeholder="请选择"
                        filterable
                        :default-first-option="true"
                    >
                      <el-option
                          v-for="user in users"
                          :key="user.id"
                          :label="user.realName"
                          :value="user.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 问题信息 -->
            <div>
              <el-form-item label="问题标题" prop="title" required>
                <el-input v-model="issueForm.title" placeholder="请输入" class="white-bg-input" />
              </el-form-item>

              <el-form-item label="问题内容" prop="content" required>
                <div class="editor-container">
                  <QuillEditor v-model:content="issueForm.content" contentType="html" toolbar="full" theme="snow" />
                </div>
              </el-form-item>
            </div>

            <!-- 问题分类 -->
            <div class="form-section">
              <el-form-item label="问题类型" prop="type">
                <el-radio-group v-model="issueForm.type">
                  <el-radio label="1">Bug</el-radio>
                  <el-radio label="2">需求不明确</el-radio>
                  <el-radio label="3">UI</el-radio>
                  <el-radio label="4">建议</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="BUG产生原因" prop="bugCause" v-if="issueForm.type === '1'">
                <el-radio-group v-model="issueForm.bugCause">
                  <el-radio label="1">代码错误</el-radio>
                  <el-radio label="2">未实现需求</el-radio>
                  <el-radio label="3">测试遗漏</el-radio>
                  <el-radio label="4">历史遗留问题</el-radio>
                  <el-radio label="5">兼容适配</el-radio>
                  <el-radio label="6">其他</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="严重程度" prop="severity">
                <el-radio-group v-model="issueForm.severity">
                  <el-radio label="5">改进错误【5级】</el-radio>
                  <el-radio label="4">细微错误【4级】</el-radio>
                  <el-radio label="3">一般错误【3级】</el-radio>
                  <el-radio label="2">严重错误【2级】</el-radio>
                  <el-radio label="1">致命错误【1级】</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="紧急程度" prop="urgency">
                <el-radio-group v-model="issueForm.urgency">
                  <el-radio label="0">一般</el-radio>
                  <el-radio label="1">紧急</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <!-- 环境信息 -->
            <div class="form-section">
              <el-form-item label="浏览器" prop="browser">
                <el-radio-group v-model="issueForm.browser">
                  <el-radio label="1">IE</el-radio>
                  <el-radio label="2">Microsoft Edge</el-radio>
                  <el-radio label="3">Chrome</el-radio>
                  <el-radio label="4">Firefox</el-radio>
                  <el-radio label="5">Safari</el-radio>
                  <el-radio label="6">其他</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="平台" prop="platform" required>
                <el-radio-group v-model="issueForm.platform">
                  <el-radio label="1">PC</el-radio>
                  <el-radio label="2">移动设备</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="系统" prop="system">
                <el-radio-group v-model="issueForm.sys" v-if="issueForm.platform == '1'">
                  <el-radio label="1">Windows 7</el-radio>
                  <el-radio label="2">Windows 8</el-radio>
                  <el-radio label="3">Windows 10+</el-radio>
                  <el-radio label="4">Mac OS</el-radio>
                  <el-radio label="5">其他</el-radio>
                </el-radio-group>
                <el-radio-group v-model="issueForm.sys" v-if="issueForm.platform == '2'">
                  <el-radio label="1">Android</el-radio>
                  <el-radio label="2">iOS</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="期望完成时间" prop="expectedTime" required>
                <el-date-picker
                    v-model="issueForm.expectedTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择"
                />
              </el-form-item>
            </div>

            <!-- 按钮组 -->
            <div class="button-container">
              <el-button @click="resetForm">取消</el-button>
              <el-button type="primary" @click="submitForm">创建问题</el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useIssueStore } from '@/stores/issue'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { useDeptStore } from '@/stores/department'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const router = useRouter()
const issueStore = useIssueStore()
const userStore = useUserStore()
const projectStore = useProjectStore()
const deptStore = useDeptStore()

// 表单引用
const issueFormRef = ref<FormInstance>()

// 表单数据
const issueForm = reactive({
  title: '',
  content: '',
  type: '1',
  bugCause: '1',
  otherBugCause: '',
  severity: '3',
  urgency: '0',
  browser: '',
  otherBrowser: '',
  platform: '1',
  sys: '',
  otherSys: '',
  projectId: '',
  departmentId: '',
  testRound: '0',
  testerId: '',
  handlerId: '',
  taskId: '',
  expectedTime: ''
})

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入问题标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入问题内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
  severity: [{ required: true, message: '请选择严重程度', trigger: 'change' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  testerId: [{ required: true, message: '请选择测试人员', trigger: 'change' }],
  handlerId: [{ required: true, message: '请选择处理人', trigger: 'change' }],
  expectedTime: [{ required: true, message: '请选择期望完成时间', trigger: 'change' }]
}

const loading = ref(false)

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchDepartmentTree(),
    fetchProjectTree(),
    fetchUsers()
  ])
})

// 下拉选项数据
const departmentTreeData = ref([])
const projectTreeData = ref([])
const users = ref([])

// 获取部门树
const fetchDepartmentTree = async () => {
  departmentTreeData.value = await deptStore.getDepartmentTreeAction()
}

// 获取项目树
const fetchProjectTree = async () => {
  projectTreeData.value = await projectStore.getProjectTreeAction()
}

// 获取用户列表
const fetchUsers = async () => {
  users.value = await userStore.getUsersAction()
}

// 提交表单
const submitForm = async () => {
  if (!issueFormRef.value) return

  await issueFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      // 处理表单数据
      const formData = { ...issueForm }

      const result = await issueStore.createIssueAction(formData)

      if (result) {
        await router.push(`/issue/${result.id}`)
      }
    } else {
      ElMessage.warning('请填写所有必填字段')
    }
  })
}

// 重置表单
const resetForm = () => {
  if (issueFormRef.value) {
    issueFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.create-issue-container {
  padding: 20px;
}

.issue-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.issue-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: none;
  padding-bottom: 0;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  padding: 16px 0;
}

.issue-form {
  padding: 20px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 20px;
}

.white-bg-input :deep(.el-input__wrapper) {
  background-color: white;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.white-bg-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 100%;
}

.editor-container :deep(.ql-container) {
  height: 200px;
}

.editor-container :deep(.ql-editor) {
  min-height: 200px;
}

:deep(.el-select),
:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .create-issue-container {
    padding: 10px;
  }

  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    padding: 0 0 8px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .issue-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title {
    color: #e5e7eb;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    background-color: #363636;
    border-color: #4a4a4a;
    color: #e5e7eb;
  }

  .white-bg-input :deep(.el-input__wrapper) {
    background-color: white;
    box-shadow: 0 0 0 1px #4a4a4a inset;
  }

  .white-bg-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #409eff inset;
  }

  .white-bg-input :deep(.el-input__inner) {
    color: #303133;
  }

  :deep(.el-radio__label),
  :deep(.el-checkbox__label) {
    color: #e5e7eb;
  }

  :deep(.el-form-item__label) {
    color: #e5e7eb;
  }

  .editor-container {
    border-color: #4a4a4a;
  }
}
</style>