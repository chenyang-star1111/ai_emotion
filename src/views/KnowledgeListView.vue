<template>
  <div class="knowledge-container">
    <div class="header-section">
      <div class="header-content">
        <el-icon :size="36" color="#fff"><Reading /></el-icon>
        <div>
          <h1 class="header-title">心理健康知识库</h1>
          <p class="header-sub">精选心理健康文章，助你更好地认识自己</p>
        </div>
      </div>
    </div>

    <div class="content">
      <aside class="recommend-section">
        <div class="section-title">
          <el-icon><CollectionTag /></el-icon>
          热门分类
        </div>
        <div class="recommend-list">
          <div class="recommend-item" :class="{ active: !activeCategory }" @click="activeCategory = null; loadList()">
            <span style="font-weight:600;">全部文章</span>
          </div>
          <div v-for="c in categories" :key="c.id"
               class="recommend-item"
               :class="{ active: activeCategory === c.id }"
               @click="activeCategory = c.id; loadList()">
            <span>{{ c.categoryName }}</span>
          </div>
        </div>

        <div class="section-title" style="margin-top:20px;">
          <el-icon><TrendCharts /></el-icon>
          热门文章
        </div>
        <div class="hot-list">
          <div v-for="(a, idx) in hotArticles" :key="a.id" class="hot-item" @click="$router.push('/knowledge/' + a.id)">
            <el-tag size="small" :type="idx < 3 ? 'danger' : 'info'" effect="plain" style="width:24px;">{{ idx + 1 }}</el-tag>
            <span class="hot-title">{{ a.title }}</span>
          </div>
        </div>
      </aside>

      <main class="article-list">
        <div class="filter-bar">
          <el-input v-model="query.keyword" placeholder="搜索文章..." clearable style="width:260px;" @keyup.enter="loadList">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" @click="loadList">搜索</el-button>
        </div>

        <div v-loading="loading">
          <div v-if="list.length === 0 && !loading" class="empty">暂无文章</div>
          <div v-for="item in list" :key="item.id" class="article-card" @click="$router.push('/knowledge/' + item.id)">
            <div class="article-cover">
              <el-image v-if="item.coverImage" :src="fullImage(item.coverImage)" fit="cover" style="width:100%;height:100%;border-radius:8px;" />
              <div v-else class="cover-placeholder">
                <el-icon :size="48" color="#fff"><Document /></el-icon>
              </div>
            </div>
            <div class="article-body">
              <h3 class="article-title">{{ item.title }}</h3>
              <div class="article-meta">
                <el-tag size="small" effect="plain" type="info">{{ item.categoryName || '心理知识' }}</el-tag>
                <span class="time">{{ item.publishedAt || '' }}</span>
              </div>
              <p class="article-summary">{{ item.summary || stripHtml(item.content).slice(0, 120) }}</p>
              <div class="article-footer">
                <span class="read-count"><el-icon><View /></el-icon> {{ item.readCount || 0 }}</span>
                <el-tag v-for="t in splitTags(item.tags)" :key="t" size="small" effect="plain" class="tag-item">{{ t }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="query.currentPage"
            v-model:page-size="query.size"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadList"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCategoryTree, getArticlePage } from '@/api'

const IMG_BASE = 'http://159.75.169.224:1235'

const categories = ref([])
const list = ref([])
const hotArticles = ref([])
const total = ref(0)
const loading = ref(false)
const activeCategory = ref(null)
const query = reactive({ currentPage: 1, size: 10, keyword: '' })

const fullImage = (p) => {
  if (!p) return ''
  if (p.startsWith('http')) return p
  return IMG_BASE + p
}
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '')
const splitTags = (t) => (t ? String(t).split(/[,，;；]/).map(x => x.trim()).filter(Boolean).slice(0, 3) : [])

const loadList = async () => {
  loading.value = true
  try {
    const params = { currentPage: query.currentPage, size: query.size, status: 1 }
    if (query.keyword) params.title = query.keyword
    if (activeCategory.value) params.categoryId = activeCategory.value
    const res = await getArticlePage(params)
    const d = res.data || {}
    list.value = d.records || []
    total.value = d.total || 0
  } catch { list.value = []; total.value = 0 }
  finally { loading.value = false }
}

const loadCategories = async () => {
  try {
    const res = await getCategoryTree()
    categories.value = res.data || []
  } catch {}
}

const loadHot = async () => {
  try {
    const res = await getArticlePage({ currentPage: 1, size: 5, status: 1 })
    hotArticles.value = (res.data?.records || []).slice(0, 5)
  } catch { hotArticles.value = [] }
}

onMounted(async () => {
  await loadCategories()
  await loadHot()
  await loadList()
})
</script>

<style scoped>
.knowledge-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  min-height: calc(100vh - 285px);
}
.header-section {
  background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
  color: white;
  padding: 40px 20px;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}
.header-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px;
}
.header-sub {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.content {
  display: flex;
  gap: 24px;
  margin: -30px auto 40px;
  max-width: 1200px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}
.recommend-section {
  width: 260px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  padding: 18px 16px;
  height: fit-content;
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.recommend-item {
  border-left: 4px solid #f59e0b;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
  border-radius: 4px;
  transition: all .15s;
}
.recommend-item:hover {
  background: #fffbeb;
}
.recommend-item.active {
  background: #fef3c7;
  color: #92400e;
  font-weight: 600;
}
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  padding: 4px 0;
}
.hot-item:hover .hot-title { color: #4a908c; }
.hot-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-list {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
  min-height: 500px;
}
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.article-card {
  display: flex;
  gap: 18px;
  padding: 18px 0;
  border-top: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background .15s;
}
.article-card:first-of-type {
  border-top: none;
  padding-top: 10px;
}
.article-card:hover {
  background: #fafbfc;
  margin: 0 -10px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 8px;
}
.article-cover {
  width: 160px;
  height: 120px;
  flex-shrink: 0;
}
.cover-placeholder {
  width: 160px;
  height: 120px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f59e0b, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.article-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.article-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.article-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.time {
  font-size: 12px;
  color: #9ca3af;
}
.article-summary {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.article-footer {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.read-count {
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 2px;
}
.tag-item {
  margin-left: 2px;
}
.empty {
  text-align: center;
  padding: 60px 0;
  color: #9ca3af;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
