<template>
  <Layout>
    <template #content>
      <div class="create-task-container">
        <el-card class="task-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">创建任务</h3>
            </div>
          </template>

          <el-form
              ref="taskFormRef"
              :model="taskForm"
              :rules="rules"
              label-width="120px"
              class="task-form"
          >
            <!-- 基本信息 -->
            <div class="form-section">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="目标工作室" prop="workspace" required>
                    <el-select v-model="taskForm.workspace" placeholder="请选择">
                      <el-option label="技术" value="tech" />
                      <el-option label="设计" value="design" />
                      <el-option label="产品" value="product" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="项目版本号" prop="version">
                    <el-input v-model="taskForm.version" placeholder="请输入" class="white-bg-input" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="项目" prop="project" required>
                    <el-select v-model="taskForm.project" placeholder="请选择">
                      <el-option label="项目A" value="projectA" />
                      <el-option label="项目B" value="projectB" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="执行人" prop="executor" required>
                    <el-select v-model="taskForm.executor" placeholder="请选择">
                      <el-option label="张三" value="zhangsan" />
                      <el-option label="李四" value="lisi" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="重要程度" prop="priority">
                    <el-select v-model="taskForm.priority" placeholder="无">
                      <el-option label="低" value="low" />
                      <el-option label="中" value="medium" />
                      <el-option label="高" value="high" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="紧急程度" prop="urgency">
                    <el-select v-model="taskForm.urgency" placeholder="无">
                      <el-option label="低" value="low" />
                      <el-option label="中" value="medium" />
                      <el-option label="高" value="high" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 任务信息 -->
            <div class="form-section">
              <el-form-item label="任务标题" prop="title" required>
                <el-input v-model="taskForm.title" placeholder="请输入" class="white-bg-input" />
              </el-form-item>

              <el-form-item label="任务描述" prop="description">
                <div class="editor-container">
                  <QuillEditor v-model:content="taskForm.description" contentType="html" theme="snow" />
                </div>
              </el-form-item>
            </div>

            <!-- 时间和可见性 -->
            <div class="form-section">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="预计开始时间" prop="startTime">
                    <el-date-picker
                        v-model="taskForm.startTime"
                        type="date"
                        placeholder="请选择"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="期望完成时间" prop="endTime" required>
                    <el-date-picker
                        v-model="taskForm.endTime"
                        type="date"
                        placeholder="请选择"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="可见范围" prop="visibility">
                <el-radio-group v-model="taskForm.visibility">
                  <el-radio label="all">所有人可见</el-radio>
                  <el-radio label="workspace">工作室可见</el-radio>
                  <el-radio label="self">自己可见</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <!-- 按钮组 -->
            <div class="button-container">
              <el-button @click="resetForm">重置</el-button>
              <el-button @click="saveAsDraft">提交任务并评分</el-button>
              <el-button type="primary" @click="submitForm">提交任务</el-button>
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

const taskFormRef = ref<FormInstance>()

// 表单数据
const taskForm = reactive({
  workspace: '',
  project: '',
  version: '',
  priority: '',
  urgency: '',
  executor: '',
  title: '',
  description: '',
  visibility: 'all',
  startTime: '',
  endTime: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  workspace: [
    { required: true, message: '请选择目标工作室', trigger: 'change' }
  ],
  project: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  executor: [
    { required: true, message: '请选择执行人', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' }
  ],
  endTime: [
    { required: true, message: '请选择期望完成时间', trigger: 'change' }
  ]
})

// 提交表单
const submitForm = async () => {
  if (!taskFormRef.value) return
  await taskFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('任务创建成功')
    }
  })
}

// 保存为草稿
const saveAsDraft = () => {
  ElMessage.success('已保存为草稿')
}

// 重置表单
const resetForm = () => {
  if (!taskFormRef.value) return
  taskFormRef.value.resetFields()
}
</script>

<style scoped>
.create-task-container {
  padding: 20px;
  height: 100%;
}

.task-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.task-card:hover {
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

.task-form {
  padding: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 20px;
}

:deep(.el-select),
:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
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

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .create-task-container {
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
  .task-card {
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

  :deep(.el-radio__label) {
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