<template>
  <Layout>
    <template #content>
      <div class="work-memo-container">
        <el-card class="memo-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">工作备忘</h3>
              <el-button type="primary" icon="Plus" circle @click="handleAddMemo"></el-button>
            </div>
          </template>

          <div class="memo-content" ref="memoContentRef">
            <div v-if="memos.length > 0" class="memo-grid">
              <div v-for="(memo, index) in memos" :key="index" class="memo-item">
                <h4>
                  {{ memo.title }}
                  <el-button type="text" icon="View" @click="viewMemoDetail(memo)" class="view-detail-btn"></el-button>
                </h4>
                <div class="content-preview" v-html="memo.content"></div>
                <div class="memo-footer">
                  <span>{{ memo.date }}</span>
                  <el-row>
                    <el-button type="primary" icon="Edit" circle @click="editMemo(memo)"></el-button>
                    <el-button type="danger" icon="Delete" circle @click="deleteMemo(index)"></el-button>
                  </el-row>
                </div>
              </div>
            </div>
            <div v-else class="empty-container">
              <el-empty description="暂无备忘" :image-size="80" />
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
      width="800px"
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
        <quill-editor
            v-model:content="memoForm.content"
            contentType="html"
            theme="snow"
            toolbar="full"
            style="height: 300px; width: 100%;"
            class="memo-editor"
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
      width="800px"
      destroy-on-close
      :modal-append-to-body="false"
      class="custom-dialog"
      center
  >
    <div class="detail-content">
      <h4>{{ detailMemo.title }}</h4>
      <p class="detail-date"><strong>日期：</strong>{{ detailMemo.date }}</p>
      <div class="detail-text"><strong>内容：</strong></div>
      <div class="detail-html-content" v-html="detailMemo.content"></div>
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
import { useWorkMemoStore } from '@/stores/workMemo'
import type { WorkMemoData } from '@/types/workMemo'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const workMemoStore = useWorkMemoStore()
const showMemoDialog = ref(false)
const showDetailDialog = ref(false)
const memoFormRef = ref<FormInstance>()
const memoContentRef = ref<HTMLElement | null>(null)
const isEditing = ref(false)
const detailMemo = reactive({
  title: '',
  date: '',
  content: ''
})

// 备忘录数据
const memos = ref<WorkMemoData[]>([])

// 备忘录表单数据
const memoForm = reactive({
  id: undefined as number | undefined,
  title: '',
  content: ''
})

// 备忘录表单验证规则
const memoRules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

// 加载备忘录数据
const loadMemos = async () => {
  const result = await workMemoStore.getWorkMemoListAction()
  if (result && result.length > 0) {
    memos.value = result.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      date: item.memoDate
    }))
  } else {
    memos.value = []
  }
}

// 打开新增备忘对话框
const handleAddMemo = () => {
  isEditing.value = false
  resetMemoForm()
  showMemoDialog.value = true
}

// 添加或编辑备忘录
const handleMemoSubmit = async () => {
  if (!memoFormRef.value) return
  await memoFormRef.value.validate(async (valid) => {
    if (valid) {
      const memoData: WorkMemoData = {
        title: memoForm.title,
        content: memoForm.content,
        // 不需要从前端传入日期，后端会自动使用当前日期
      }

      let success = false
      if (isEditing.value && memoForm.id) {
        // 编辑现有备忘录
        memoData.id = memoForm.id
        success = await workMemoStore.updateWorkMemoAction(memoData)
      } else {
        // 添加新备忘录
        success = await workMemoStore.createWorkMemoAction(memoData)
      }

      if (success) {
        showMemoDialog.value = false
        resetMemoForm()
        await loadMemos()
      }
    }
  })
}

// 编辑备忘录
const editMemo = (memo: any) => {
  isEditing.value = true
  memoForm.id = memo.id
  memoForm.title = memo.title
  memoForm.content = memo.content
  showMemoDialog.value = true
}

// 查看备忘录详情
const viewMemoDetail = async (memo: any) => {
  if (memo.id) {
    const detail = await workMemoStore.getWorkMemoDetailAction(memo.id)
    if (detail) {
      detailMemo.title = detail.title
      detailMemo.content = detail.content
      detailMemo.date = detail.memoDate
      showDetailDialog.value = true
    }
  } else {
    // 本地数据，直接显示
    detailMemo.title = memo.title
    detailMemo.content = memo.content
    detailMemo.date = memo.date
    showDetailDialog.value = true
  }
}

// 删除备忘录
const deleteMemo = (index: number) => {
  const memo = memos.value[index]
  ElMessageBox.confirm('确定要删除这条备忘录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    if (memo.id) {
      const success = await workMemoStore.deleteWorkMemoAction(memo.id)
      if (success) {
        await loadMemos()
      }
    } else {
      ElMessage.success('系统错误，请重试')
    }
  }).catch(() => {
  })
}

// 重置表单
const resetMemoForm = () => {
  memoForm.id = undefined
  memoForm.title = ''
  memoForm.content = ''
  isEditing.value = false
}

// 组件挂载后初始化
onMounted(async () => {
  if (memoContentRef.value) {
    memoContentRef.value.style.maxHeight = 'none'
  }

  await loadMemos()
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

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
}

.memo-content {
  padding: 10px 0;
  width: 100%;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.memo-item {
  background-color: #e3f3ff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  max-height: 250px;
  min-height: 250px;
}

.memo-item h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-preview {
  flex-grow: 1;
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
  max-height: 250px;
  overflow: hidden;
}

/* 淡出效果 */
.content-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: linear-gradient(to bottom, rgba(227, 243, 255, 0), rgba(227, 243, 255, 1));
  pointer-events: none;
}

/* 富文本内容样式 */
.content-preview :deep(p) {
  margin: 8px 0;
}

.content-preview :deep(img) {
  max-width: 100%;
  height: auto;
  max-height: 150px;
}

.content-preview :deep(ul),
.content-preview :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.content-preview :deep(pre) {
  background-color: #f6f6f6;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
  white-space: pre-wrap;
}

.content-preview :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 12px;
  margin: 8px 0;
  color: #666;
}

.content-preview :deep(h1),
.content-preview :deep(h2),
.content-preview :deep(h3),
.content-preview :deep(h4),
.content-preview :deep(h5),
.content-preview :deep(h6) {
  margin: 12px 0 8px;
}

.content-preview :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.memo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 12px;
  color: #909399;
  padding-top: 10px;
}

.memo-editor {
  width: 100%;
  margin-bottom: 15px;
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
  margin-bottom: 10px;
}

.detail-html-content {
  color: #606266;
  line-height: 1.6;
  max-height: 350px;
  overflow-y: auto;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.detail-html-content :deep(p) {
  margin: 8px 0;
}

.detail-html-content :deep(img) {
  max-width: 100%;
  height: auto;
}

/* 自定义富文本编辑器样式 */
:deep(.memo-editor) {
  display: flex;
  flex-direction: column;
  width: 100%;
}

:deep(.memo-editor .ql-container) {
  flex: 1;
  overflow-y: auto;
}

:deep(.memo-editor .ql-toolbar) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.memo-editor .ql-container) {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
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
    grid-template-columns: 1fr; /* 移动端一行一个 */
  }

  :deep(.custom-dialog) {
    width: 95% !important;
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

  .content-preview {
    color: #e5e7eb;
  }

  .content-preview::after {
    background: linear-gradient(to bottom, rgba(28, 58, 94, 0), rgba(28, 58, 94, 1));
  }

  .content-preview :deep(pre) {
    background-color: #1a1a1a;
  }

  .content-preview :deep(blockquote) {
    color: #aaa;
  }

  .memo-footer {
    color: #909399;
  }

  .detail-content h4,
  .detail-date,
  .detail-text {
    color: #e5e7eb;
  }

  .detail-html-content {
    background-color: #2d2d2d;
    border-color: #444;
    color: #e5e7eb;
  }
}
</style>