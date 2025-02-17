<template>
  <Layout>
    <template #content>
      <div class="work-memo-container">
        <el-card class="memo-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">工作备忘录</h3>
              <el-button type="primary" icon="Plus" circle @click="handleAddMemo"></el-button>
            </div>
          </template>

          <div class="memo-content" ref="memoContentRef">
            <div class="memo-grid" :style="gridStyle">
              <div v-for="(memo, index) in memos" :key="index" class="memo-item">
                <h4>
                  {{ memo.title }}
                  <el-button type="text" icon="View" @click="viewMemoDetail(memo)" class="view-detail-btn"></el-button>
                </h4>
                <p>{{ memo.content }}</p>
                <div class="memo-footer">
                  <span>{{ memo.date }}</span>
                  <el-row>
                    <el-button type="primary" icon="Edit" circle @click="editMemo(memo)"></el-button>
                    <el-button type="danger" icon="Delete" circle @click="deleteMemo(index)"></el-button>
                  </el-row>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </template>
  </Layout>

  <!-- 添加/编辑备忘对话框 -->
  <el-dialog
      v-model="showMemoDialog"
      :title="isEditing ? '编辑备忘' : '添加备忘'"
      width="600px"
      destroy-on-close
      :modal-append-to-body="false"
      class="custom-dialog"
  >
    <el-form
        ref="memoFormRef"
        :model="memoForm"
        :rules="memoRules"
        label-width="100px"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="memoForm.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
            v-model="memoForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            class="save-content"
        />
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-date-picker
            v-model="memoForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showMemoDialog = false">取消</el-button>
        <el-button type="primary" @click="handleMemoSubmit">确认</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 查看详情对话框 -->
  <el-dialog
      v-model="showDetailDialog"
      title="备忘详情"
      width="600px"
      destroy-on-close
      :modal-append-to-body="false"
      class="custom-dialog"
      center
  >
    <div class="detail-content">
      <h4>{{ detailMemo.title }}</h4>
      <p class="detail-date"><strong>日期：</strong>{{ detailMemo.date }}</p>
      <p class="detail-text"><strong>内容：</strong>{{ detailMemo.content }}</p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

const showMemoDialog = ref(false)
const showDetailDialog = ref(false)
const memoFormRef = ref<FormInstance>()
const memoContentRef = ref<HTMLElement | null>(null)
const isEditing = ref(false)
const editingIndex = ref(-1)
const detailMemo = reactive({
  title: '',
  date: '',
  content: ''
})

const handleAddMemo = () => {
  isEditing.value = false
  resetMemoForm()
  showMemoDialog.value = true
}

// 备忘录数据
const memos = ref([
  { title: '项目会议', content: '讨论新项目进度', date: '2025-02-15' },
  { title: '代码审查', content: '审查前端代码', date: '2025-02-16' },
  { title: '团队建设', content: '组织团队建设活动', date: '2025-02-20' },
  { title: '客户沟通', content: '与客户讨论需求变更', date: '2025-02-22' },
  { title: '技术分享', content: '准备Vue3新特性分享会', date: '2025-02-25' },
])

// 备忘录表单数据
const memoForm = reactive({
  title: '',
  content: '',
  date: '',
})

// 备忘录表单验证规则
const memoRules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
})

// 计算网格样式
const gridStyle = computed(() => {
  const count = memos.value.length
  let columns = Math.ceil(Math.sqrt(count))
  columns = Math.max(2, Math.min(columns, 4)) // 限制列数在2到4之间
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '20px',
  }
})

// 添加或编辑备忘录
const handleMemoSubmit = async () => {
  if (!memoFormRef.value) return
  await memoFormRef.value.validate((valid) => {
    if (valid) {
      if (isEditing.value) {
        // 编辑现有备忘录
        memos.value[editingIndex.value] = { ...memoForm }
        ElMessage.success('备忘录已更新')
      } else {
        // 添加新备忘录
        memos.value.push({ ...memoForm })
        ElMessage.success('备忘录已添加')
      }
      showMemoDialog.value = false
      resetMemoForm()
    }
  })
}

// 编辑备忘录
const editMemo = (memo: any) => {
  isEditing.value = true
  editingIndex.value = memos.value.findIndex(m => m === memo)
  Object.assign(memoForm, memo)
  showMemoDialog.value = true
}

// 查看备忘录详情
const viewMemoDetail = (memo: any) => {
  Object.assign(detailMemo, memo)
  showDetailDialog.value = true
}

// 删除备忘录
const deleteMemo = (index: number) => {
  ElMessageBox.confirm('确定要删除这条备忘录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    memos.value.splice(index, 1)
    ElMessage.success('备忘录已删除')
  }).catch(() => {
    // 取消删除操作
  })
}

// 重置表单
const resetMemoForm = () => {
  memoForm.title = ''
  memoForm.content = ''
  memoForm.date = ''
  isEditing.value = false
  editingIndex.value = -1
}

// 组件挂载后初始化滚动条
onMounted(() => {
  if (memoContentRef.value) {
    memoContentRef.value.style.maxHeight = '70vh'
    memoContentRef.value.style.overflowY = 'auto'
  }
})
</script>

<style scoped>
.work-memo-container {
  padding: 20px;
}

.memo-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.memo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.memo-content {
  padding-right: 5px;
}

.memo-item {
  background-color: #e3f3ff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.memo-item h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.memo-item p {
  flex-grow: 1;
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.memo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.save-content{
  resize: vertical;
  height: 250px;
}

:deep(.save-content) {
  .el-textarea__inner {
    height: 250px;
    resize: both;
  }
}

.detail-content {
  padding: 0 20px;
}

.detail-content h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.detail-date {
  margin-bottom: 12px;
  color: #606266;
}

.detail-text {
  color: #606266;
  line-height: 1.6;
  max-height: 350px;
  overflow-y: auto;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .work-memo-container {
    padding: 10px;
  }

  .card-title {
    font-size: 16px;
  }

  .memo-grid {
    grid-template-columns: 1fr !important;
  }

  :deep(.custom-dialog) {
    .el-dialog {
      width: 90% !important;
    }
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .memo-card {
    background-color: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-title {
    color: #e5e7eb;
  }

  .memo-item {
    background-color: #1c3a5e;
  }

  .memo-item h4 {
    color: #e5e7eb;
  }

  .memo-item p {
    color: #e5e7eb;
  }

  .memo-footer {
    color: #909399;
  }

  .detail-content h4,
  .detail-date,
  .detail-text {
    color: #e5e7eb;
  }
}
</style>