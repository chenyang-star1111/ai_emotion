<template>
    <div class="knowledge-container">
        <el-card class="toolbar">
            <div class="toolbar-left">
                <el-input v-model="query.title" placeholder="搜索标题" clearable style="width:220px" @keyup.enter="loadList" />
                <el-select v-model="query.categoryId" placeholder="分类" clearable style="width:160px" @change="loadList">
                    <el-option v-for="c in categories" :key="c.id" :label="c.categoryName" :value="c.id" />
                </el-select>
                <el-button type="primary" @click="loadList"><el-icon><Search /></el-icon>搜索</el-button>
                <el-button type="success" @click="openEditor()"><el-icon><Plus /></el-icon>新增文章</el-button>
            </div>
        </el-card>

        <el-card class="table-card">
            <el-table :data="list" v-loading="loading" stripe>
                <el-table-column label="ID" prop="id" width="210" show-overflow-tooltip />
                <el-table-column label="封面" width="90">
                    <template #default="{ row }">
                        <el-image v-if="row.coverImage" :src="fullImage(row.coverImage)" fit="cover" style="width:56px;height:40px;border-radius:4px;" />
                        <span v-else style="color:#bbb;font-size:12px;">无封面</span>
                    </template>
                </el-table-column>
                <el-table-column label="标题" prop="title" min-width="180" show-overflow-tooltip />
                <el-table-column label="分类" prop="categoryName" width="100">
                    <template #default="{ row }">
                        <el-tag size="small" effect="plain">{{ row.categoryName || '—' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="标签" min-width="150">
                    <template #default="{ row }">
                        <el-tag v-for="t in splitTags(row.tags)" :key="t" size="small" type="info" effect="plain" style="margin-right:4px;margin-bottom:2px;">{{ t }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="阅读" prop="readCount" width="60" />
                <el-table-column label="状态" width="80">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'info' : 'warning'" size="small">{{ row.statusText || statusMap[row.status] }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="发布时间" prop="publishedAt" min-width="170" show-overflow-tooltip />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" @click="openEditor(row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                        <el-button 
                            size="small" 
                            :type="row.status === 1 ? 'warning' : 'success'"
                            :loading="row._toggling"
                            @click="handleToggleStatus(row)"
                        >
                            {{ row.status === 1 ? '下线' : '上线' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-wrapper">
                <el-pagination
                    v-model:current-page="query.currentPage"
                    v-model:page-size="query.size"
                    :total="total"
                    layout="total, prev, pager, next"
                    @current-change="loadList"
                />
            </div>
        </el-card>

        <el-dialog v-model="editorVisible" :title="form.id ? '编辑文章' : '新增文章'" width="900px" top="3vh" destroy-on-close>
            <div class="editor-container">
                <div class="form-item">
                    <label class="form-label">
                        <span class="required">*</span>文章标题
                    </label>
                    <div class="input-wrapper">
                        <el-input 
                            v-model="form.title" 
                            placeholder="请输入标题" 
                            maxlength="200"
                            show-word-limit
                            class="input-field"
                        />
                    </div>
                </div>

                <div class="form-item">
                    <label class="form-label">
                        <span class="required">*</span>所属分类
                    </label>
                    <div class="input-wrapper">
                        <el-select 
                            v-model="form.categoryId" 
                            placeholder="请选择分类" 
                            class="input-field"
                        >
                            <el-option v-for="c in categories" :key="c.id" :label="c.categoryName" :value="c.id" />
                        </el-select>
                    </div>
                </div>

                <div class="form-item">
                    <label class="form-label">文章摘要</label>
                    <div class="input-wrapper">
                        <el-input 
                            v-model="form.summary" 
                            type="textarea" 
                            :rows="3"
                            placeholder="请输入文章摘要"
                            maxlength="1000"
                            show-word-limit
                            class="textarea-field"
                        />
                    </div>
                </div>

                <div class="form-item">
                    <label class="form-label">标签</label>
                    <div class="input-wrapper">
                        <div class="tags-wrapper">
                            <el-tag 
                                v-for="tag in selectedTags" 
                                :key="tag" 
                                closable 
                                @close="selectedTags.value = selectedTags.value.filter(t => t !== tag)"
                                class="selected-tag"
                            >
                                {{ tag }}
                            </el-tag>
                            <el-select 
                                v-model="newTag" 
                                placeholder="选择标签"
                                class="tag-select"
                                @change="addTag"
                                filterable
                                allow-create
                            >
                                <el-option v-for="t in allTags" :key="t" :label="t" :value="t" />
                            </el-select>
                        </div>
                    </div>
                </div>

                <div class="form-item">
                    <label class="form-label">封面图片</label>
                    <div class="input-wrapper">
                        <div v-if="form.coverImage" class="cover-preview">
                            <el-image 
                                :src="fullImage(form.coverImage)" 
                                fit="cover" 
                                class="cover-img"
                            />
                            <el-button type="danger" size="small" @click="removeCover" class="remove-cover-btn">移除封面</el-button>
                        </div>
                        <div v-else class="upload-cover">
                            <el-button type="primary" @click="uploadCover">上传封面</el-button>
                            <span class="upload-hint">支持 jpg, png, gif 格式，建议尺寸 800×450</span>
                        </div>
                        <input ref="coverInput" type="file" accept="image/*" class="cover-input" @change="handleCoverUpload" />
                    </div>
                </div>

                <div class="form-item">
                    <label class="form-label">
                        <span class="required">*</span>文章内容
                    </label>
                    <div class="editor-wrapper">
                        <Toolbar class="editor-toolbar" :editor="editorRef" :defaultConfig="toolbarConfig" mode="default" />
                        <Editor class="editor-content" v-model="form.content" :defaultConfig="editorConfig" mode="default" @onCreated="handleCreated" />
                    </div>
                </div>
            </div>
            <template #footer>
                <el-button @click="editorVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getArticlePage, getCategoryTree, createArticle, updateArticle, deleteArticle, updateArticleStatus, uploadFile } from '@/api'

const IMG_BASE = 'http://159.75.169.224:1235'
const statusMap = { 0: '待审核', 1: '已发布', 2: '已下线' }

const categories = ref([])
const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ currentPage: 1, size: 10, title: '', categoryId: undefined })

const editorVisible = ref(false)
const submitting = ref(false)
const form = reactive({ id: undefined, title: '', categoryId: undefined, tags: '', coverImage: '', summary: '', content: '<p></p>', status: 1 })
const selectedTags = ref([])
const allTags = ['焦虑', '抑郁', '压力', '失眠', '人际关系', '职场', '学习', '家庭', '情绪管理', '自我成长', '心理健康', '心理咨询']

const editorRef = shallowRef(null)
const coverInput = ref(null)
const businessId = ref('')
const newTag = ref('')
const toolbarConfig = {}
const editorConfig = { 
  MENU_CONF: {
    uploadImage: {
      server: '/api/file/upload',
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024,
      headers: {
        token: localStorage.getItem('token') || ''
      },
      onBeforeUpload(file) { return file },
      onSuccess(file, res) {
        if (res.code === 200 || res.code === '200') {
          return res.data.url
        }
        throw new Error(res.message || '上传失败')
      },
      onError(err) {
        ElMessage.error('图片上传失败: ' + err.message)
      }
    }
  } 
}

const fullImage = (p) => {
    if (!p) return ''
    if (p.startsWith('http')) return p
    return IMG_BASE + p
}
const splitTags = (t) => (t ? String(t).split(/[,，;；]/).map(x => x.trim()).filter(Boolean) : [])

const handleCreated = (editor) => { editorRef.value = editor }

const addTag = () => {
    if (newTag.value && !selectedTags.value.includes(newTag.value)) {
        selectedTags.value.push(newTag.value)
    }
    newTag.value = ''
}

const uploadCover = () => {
    coverInput.value?.click()
}

const removeCover = () => {
    form.coverImage = ''
    businessId.value = ''
}

const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const token = localStorage.getItem('token')
    if (!token) {
        ElMessage.warning('请先登录')
        return
    }
    
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
        ElMessage.warning('图片大小不能超过5MB')
        return
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
        ElMessage.warning('只支持 jpg, jpeg, png, gif 格式')
        return
    }
    
    // 生成唯一业务ID用于文件关联
    if (!businessId.value) {
        businessId.value = crypto.randomUUID()
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('businessType', 'ARTICLE')
    formData.append('businessId', businessId.value)
    formData.append('businessField', 'cover')
    
    try {
        const res = await uploadFile(formData)
        // 后端返回的 filePath 是相对路径，存储到表单中
        form.coverImage = res.filePath || res.data?.filePath || ''
        ElMessage.success('上传成功')
    } catch (err) {
        // 401 等错误已由 axios 拦截器统一处理
        if (err?.response?.status === 401) {
            localStorage.removeItem('token')
            location.hash = '#/login'
        }
    }
    e.target.value = ''
}

const openEditor = (row) => {
    if (row) {
        Object.assign(form, {
            id: row.id,
            title: row.title || '',
            categoryId: row.categoryId,
            tags: row.tags || '',
            coverImage: row.coverImage || '',
            summary: row.summary || '',
            content: row.content || '<p></p>',
            status: row.status ?? 1
        })
        selectedTags.value = row.tags ? String(row.tags).split(/[,，;；]/).map(x => x.trim()).filter(Boolean) : []
        businessId.value = row.id || ''
    } else {
        Object.assign(form, { id: undefined, title: '', categoryId: categories.value[0]?.id, tags: '', coverImage: '', summary: '', content: '<p></p>', status: 1 })
        selectedTags.value = []
        businessId.value = ''
    }
    editorVisible.value = true
}

const handleSubmit = async () => {
    if (!form.title) return ElMessage.warning('请输入标题')
    if (!form.categoryId) return ElMessage.warning('请选择分类')
    if (!form.content) return ElMessage.warning('请输入文章内容')
    form.tags = selectedTags.value.join(',')
    submitting.value = true
    try {
        const payload = {
            id: form.id || businessId.value || '',
            title: form.title,
            content: form.content,
            coverImage: form.coverImage || '',
            categoryId: parseInt(form.categoryId) || 0,
            summary: form.summary || '',
            tags: form.tags || '',
            status: form.status || 1
        }
        if (form.id) {
            await updateArticle(form.id, payload)
        } else {
            await createArticle(payload)
        }
        ElMessage.success('保存成功')
        editorVisible.value = false
        await loadList()
        resetForm()
    } catch (e) {
        console.error(e)
        const msg = e?.message || e?.response?.data?.message || e?.response?.data?.msg || '保存失败'
        ElMessage.error(msg)
    }
    finally { submitting.value = false }
}

const handleDelete = async (row) => {
    await ElMessageBox.confirm(`确认删除《${row.title}》？`, '提示', { type: 'warning' })
    await deleteArticle(row.id)
    ElMessage.success('删除成功')
    await loadList()
}

const handleToggleStatus = async (row) => {
    const targetStatus = row.status === 1 ? 2 : 1
    const label = targetStatus === 1 ? '上线' : '下线'
    try {
        await ElMessageBox.confirm(`确认${label}《${row.title}》？`, '提示', { type: 'warning' })
    } catch { return }
    row._toggling = true
    try {
        await updateArticleStatus(row.id, targetStatus)
        row.status = targetStatus
        ElMessage.success(`${label}成功`)
    } catch (e) {
        ElMessage.error(e?.message || `${label}失败`)
    } finally { row._toggling = false }
}

const loadList = async () => {
    loading.value = true
    try {
        const params = { currentPage: query.currentPage, size: query.size }
        if (query.title) params.title = query.title
        if (query.categoryId) params.categoryId = query.categoryId
        const res = await getArticlePage(params)
        const d = res.data || {}
        list.value = d.records || []
        total.value = d.total || 0
    } catch (e) {
        list.value = []
        total.value = 0
    } finally { loading.value = false }
}

const loadCategories = async () => {
    try {
        const res = await getCategoryTree()
        categories.value = res.data || []
    } catch { categories.value = [] }
}

onBeforeUnmount(() => { editorRef.value?.destroy?.() })

loadCategories()
loadList()
</script>

<style scoped>
.toolbar { display: flex; align-items: center; margin-bottom: 16px; border-radius: 8px; }
.toolbar-left { display: flex; gap: 12px; align-items: center; }
.table-card { border-radius: 8px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }

.editor-container {
  padding: 24px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: inline-block;
  width: 100px;
  text-align: right;
  padding-right: 12px;
  line-height: 36px;
  font-weight: 500;
  color: #303133;
}

.form-label .required {
  color: #f56c6c;
  margin-right: 4px;
}

.input-wrapper {
  display: inline-block;
  width: calc(100% - 112px);
  vertical-align: top;
}

.input-field {
  width: 100%;
}

.textarea-field {
  width: 100%;
  resize: vertical;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  min-height: 40px;
}

.selected-tag {
  margin-bottom: 0;
}

.tag-select {
  width: 120px;
}

.cover-preview {
  position: relative;
  display: inline-block;
}

.cover-img {
  width: 200px;
  height: 112px;
  border-radius: 8px;
}

.remove-cover-btn {
  position: absolute;
  bottom: -32px;
  left: 0;
}

.upload-cover {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.cover-input {
  display: none;
}

.editor-wrapper {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.editor-toolbar {
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
  padding: 4px 8px;
  line-height: normal;
}

.editor-toolbar :deep(.w-e-toolbar) {
  border: none;
  background: transparent;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.editor-toolbar :deep(.w-e-toolbar .w-e-menu-item) {
  margin: 0;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #606266;
  min-width: 28px;
  text-align: center;
}

.editor-toolbar :deep(.w-e-toolbar .w-e-menu-item:hover) {
  background: #e8f4ff;
  color: #409eff;
}

.editor-toolbar :deep(.w-e-toolbar .w-e-menu-item.w-e-active) {
  background: #409eff;
  color: #fff;
}

.editor-toolbar :deep(.w-e-divider) {
  margin: 0 4px;
  height: 22px;
  width: 1px;
  background: #d9d9d9;
  align-self: center;
}

.editor-toolbar :deep(.w-e-menu-item svg) {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.editor-toolbar :deep(.w-e-text-container) {
  background: #fff;
}

.editor-content {
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
}

.editor-content :deep(.w-e-text-container) {
  padding: 20px;
  font-size: 15px;
  line-height: 1.8;
  color: #303133;
}

.editor-content :deep(.w-e-text-container p) {
  margin: 0 0 12px 0;
}

.editor-content :deep(.w-e-text-container h1) {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.editor-content :deep(.w-e-text-container h2) {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 14px 0;
  color: #1f2329;
}

.editor-content :deep(.w-e-text-container h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #24292f;
}

.editor-content :deep(.w-e-text-container ul),
.editor-content :deep(.w-e-text-container ol) {
  padding-left: 24px;
  margin: 0 0 12px 0;
}

.editor-content :deep(.w-e-text-container li) {
  margin: 4px 0;
}

.editor-content :deep(.w-e-text-container blockquote) {
  border-left: 4px solid #409eff;
  padding: 12px 16px;
  margin: 0 0 12px 0;
  background: #f6f8fa;
  color: #5c636a;
  font-style: italic;
}

.editor-content :deep(.w-e-text-container code) {
  background: #f1f2f3;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  color: #e53935;
}

.editor-content :deep(.w-e-text-container pre) {
  background: #1f2329;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0 0 12px 0;
}

.editor-content :deep(.w-e-text-container pre code) {
  background: transparent;
  color: #e6edf3;
  padding: 0;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}

.editor-content :deep(.w-e-text-container table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 12px 0;
}

.editor-content :deep(.w-e-text-container table th),
.editor-content :deep(.w-e-text-container table td) {
  border: 1px solid #dfe1e5;
  padding: 8px 12px;
  text-align: left;
}

.editor-content :deep(.w-e-text-container table th) {
  background: #f6f8fa;
  font-weight: 600;
}

.editor-content :deep(.w-e-text-container img) {
  max-width: 100%;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
