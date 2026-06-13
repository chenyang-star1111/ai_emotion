<template>
  <div class="article-detail-container" v-loading="loading">
    <div class="article-header" v-if="article">
      <el-tag size="small" type="warning" effect="light">{{ article.categoryName || '心理知识' }}</el-tag>
      <h1 class="title">{{ article.title }}</h1>
      <div class="meta">
        <span><el-icon><View /></el-icon> {{ article.readCount || 0 }} 阅读</span>
        <span>{{ article.publishedAt || '' }}</span>
        <span v-for="t in splitTags(article.tags)" :key="t" class="tag">{{ t }}</span>
      </div>
    </div>
    <div class="article-content" v-if="article" v-html="formattedContent"></div>
    <el-empty v-if="!loading && !article" description="文章不存在" />
    <div class="back-bar" @click="$router.push('/knowledge')">
      <el-icon><ArrowLeft /></el-icon> 返回知识库
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleDetail } from '@/api'

const route = useRoute()
const article = ref(null)
const loading = ref(false)

const splitTags = (t) => (t ? String(t).split(/[,，;；]/).map(x => x.trim()).filter(Boolean) : [])
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '')

const formattedContent = computed(() => {
  if (!article.value) return ''
  let html = article.value.content || ''
  if (!html) {
    html = '<p>' + (article.value.summary || '暂无内容') + '</p>'
  }
  return html
})

onMounted(async () => {
  const id = route.params.id
  if (!id) return
  loading.value = true
  try {
    const res = await getArticleDetail(id)
    article.value = res.data || null
  } catch {
    article.value = null
  } finally { loading.value = false }
})
</script>

<style scoped>
.article-detail-container {
  max-width: 860px;
  margin: 30px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 22px rgba(0, 0, 0, 0.06);
  min-height: 400px;
}
.article-header {
  margin-bottom: 30px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
}
.article-header .title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
  margin: 12px 0 16px;
}
.meta {
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 13px;
  color: #9ca3af;
}
.meta .tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 2px 10px;
  border-radius: 999px;
}
.article-content {
  font-size: 16px;
  color: #374151;
  line-height: 1.85;
}
.article-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 12px 0;
}
.article-content :deep(h2), .article-content :deep(h3) {
  margin: 28px 0 14px;
  color: #1f2937;
  font-weight: 700;
}
.article-content :deep(p) {
  margin: 12px 0;
}
.article-content :deep(strong) {
  color: #4a908c;
}
.back-bar {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.back-bar:hover {
  color: #4a908c;
}
</style>
