<template>
  <Layout>
    <template #content>
      <div class="create-question-container">
        <el-card class="question-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">创建问题</h3>
            </div>
          </template>

          <el-form
              ref="questionFormRef"
              :model="questionForm"
              :rules="rules"
              label-width="120px"
              class="question-form"
          >
            <!-- 基本信息 -->
            <div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="任务编号">
                    <el-input v-model="questionForm.taskNumber" placeholder="--" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="版本号" prop="version">
                    <el-input v-model="questionForm.version" placeholder="请输入" class="white-bg-input" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="项目" prop="project" required>
                    <el-select v-model="questionForm.project" placeholder="请选择">
                      <el-option label="项目A" value="projectA" />
                      <el-option label="项目B" value="projectB" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="执行人" prop="executor" required>
                    <el-select v-model="questionForm.executor" placeholder="请选择">
                      <el-option label="张三" value="zhangsan" />
                      <el-option label="李四" value="lisi" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="模块负责人" prop="moduleOwner" required>
                    <el-select v-model="questionForm.moduleOwner" placeholder="请选择">
                      <el-option label="张三" value="zhangsan" />
                      <el-option label="李四" value="lisi" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="测试轮次" prop="testRound">
                    <el-select v-model="questionForm.testRound" placeholder="请选择">
                      <el-option label="1" value="1" />
                      <el-option label="2" value="2" />
                      <el-option label="3" value="3" />
                      <el-option label="4" value="4" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 问题信息 -->
            <div>
              <el-form-item label="问题标题" prop="title" required>
                <el-input v-model="questionForm.title" placeholder="请输入" class="white-bg-input" />
              </el-form-item>

              <el-form-item label="问题描述" prop="description" required>
                <div class="editor-container">
                  <QuillEditor v-model:content="questionForm.description" contentType="html" theme="snow" />
                </div>
              </el-form-item>
            </div>

            <!-- 问题分类 -->
            <div class="form-section">
              <el-form-item label="问题类型" prop="type">
                <el-radio-group v-model="questionForm.type">
                  <el-radio label="bug">Bug</el-radio>
                  <el-radio label="unclear">需求不明确</el-radio>
                  <el-radio label="ui">UI</el-radio>
                  <el-radio label="suggestion">建议</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="BUG产生原因" prop="bugCause" v-if="questionForm.type === 'bug'">
                <el-radio-group v-model="questionForm.bugCause">
                  <el-radio label="code">代码错误</el-radio>
                  <el-radio label="requirement">需求未实现</el-radio>
                  <el-radio label="test">测试遗漏</el-radio>
                  <el-radio label="history">历史遗留问题</el-radio>
                  <el-radio label="integration">兼容适配</el-radio>
                  <el-radio label="testEnv">测试Bug转线上跟进</el-radio>
                  <el-radio label="other">其他</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="严重程度" prop="severity">
                <el-radio-group v-model="questionForm.severity">
                  <el-radio label="5">致命错误【5级】</el-radio>
                  <el-radio label="4">知识错误【4级】</el-radio>
                  <el-radio label="3">一般错误【3级】</el-radio>
                  <el-radio label="2">严重错误【2级】</el-radio>
                  <el-radio label="1">致命错误【1级】</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="紧急程度" prop="urgency">
                <el-radio-group v-model="questionForm.urgency">
                  <el-radio label="normal">一般</el-radio>
                  <el-radio label="urgent">紧急</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <!-- 环境信息 -->
            <div class="form-section">
              <el-form-item label="浏览器" prop="browser">
                <el-checkbox-group v-model="questionForm.browser">
                  <el-checkbox label="ie">IE</el-checkbox>
                  <el-checkbox label="chrome">Chrome</el-checkbox>
                  <el-checkbox label="firefox">Firefox</el-checkbox>
                  <el-checkbox label="safari">Safari</el-checkbox>
                  <el-checkbox label="system">系统自带</el-checkbox>
                  <el-checkbox label="other">其他</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="平台" prop="platform">
                <el-radio-group v-model="questionForm.platform">
                  <el-radio label="pc">PC</el-radio>
                  <el-radio label="mobile">移动设备</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="系统" prop="system">
                <el-checkbox-group v-model="questionForm.system">
                  <el-checkbox label="win7">Windows 7</el-checkbox>
                  <el-checkbox label="win8">Windows 8</el-checkbox>
                  <el-checkbox label="win10">Windows 10</el-checkbox>
                  <el-checkbox label="macos">macOS</el-checkbox>
                  <el-checkbox label="other">其他</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="期望完成时间" prop="expectedTime" required>
                <el-date-picker
                    v-model="questionForm.expectedTime"
                    type="date"
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
import { ref, reactive } from 'vue'
import Layout from '@/components/Layout.vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const questionFormRef = ref<FormInstance>()

// 表单数据
const questionForm = reactive({
  project: '',
  version: '',
  executor: '',
  moduleOwner: '',
  title: '',
  description: '',
  taskNumber: '',
  type: 'bug',
  bugCause: '',
  testRound: '',
  severity: '3',
  urgency: 'normal',
  browser: [],
  platform: 'pc',
  system: [],
  releasePlatform: '',
  expectedTime: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  project: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  executor: [
    { required: true, message: '请选择执行人', trigger: 'change' }
  ],
  moduleOwner: [
    { required: true, message: '请选择模块负责人', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' }
  ],
  testRound: [
    { required: true, message: '请选择测试轮次', trigger: 'change' }
  ],
  expectedTime: [
    { required: true, message: '请选择期望完成时间', trigger: 'change' }
  ]
})

// 提交表单
const submitForm = async () => {
  if (!questionFormRef.value) return
  await questionFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('问题创建成功')
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!questionFormRef.value) return
  questionFormRef.value.resetFields()
}
</script>

<style scoped>
.create-question-container {
  padding: 20px;
}

.question-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.question-card:hover {
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

.question-form {
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
  .create-question-container {
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
  .question-card {
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