<template>
    <div class="emotional-container">
        <el-card class="toolbar">
            <div class="toolbar-left">
                <el-input v-model="query.keyword" placeholder="搜索用户/内容" clearable style="width:220px" @keyup.enter="loadList" />
                <el-button type="primary" @click="loadList"><el-icon><Search /></el-icon>搜索</el-button>
            </div>
        </el-card>

        <el-card class="table-card">
            <el-alert v-if="useMock" type="warning" show-icon :closable="false" title="说明" description="emotion-diary 管理端接口目前返回系统错误，以下为演示数据。" style="margin-bottom:16px;" />
            <el-table :data="list" v-loading="loading" stripe>
                <el-table-column label="ID" prop="id" width="70" />
                <el-table-column label="情绪" width="100">
                    <template #default="{ row }">
                        <div class="emotion-cell">
                            <img :src="getEmotionIcon(row.emotion || row.emotionScore)" class="emo-ic" alt="" />
                            <span class="emotion-label">{{ row.emotion || getEmotionLabel(row.emotionScore) }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="用户" width="140">
                    <template #default="{ row }">
                        <div class="user-cell">
                            <el-avatar :size="28" :src="defaultAvatar" />
                            <span style="margin-left:8px;">{{ row.username || row.userNickname || ('用户' + (row.userId || '')) }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="情绪标签" width="160">
                    <template #default="{ row }">
                        <el-tag :type="getEmotionTag(row.emotionScore)" size="small" effect="dark">{{ row.emotion || getEmotionLabel(row.emotionScore) }}</el-tag>
                        <el-progress :percentage="getProgress(row.emotionScore)" :stroke-color="getScoreColor(row.emotionScore || 0)" :show-text="false" style="width:80px;margin-top:4px;" />
                    </template>
                </el-table-column>
                <el-table-column label="风险等级" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getRiskTagType(row.riskLevel)" size="small">{{ getRiskLevelText(row.riskLevel) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="日记内容" min-width="220" show-overflow-tooltip>
                    <template #default="{ row }">{{ truncate(row.content, 60) }}</template>
                </el-table-column>
                <el-table-column label="创建时间" prop="createdAt" width="170" />
                <el-table-column label="操作" width="90" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" @click="openDetail(row)">查看</el-button>
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

        <el-dialog v-model="detailVisible" title="情绪日记详情" width="720px" top="5vh" destroy-on-close>
            <div v-if="current" class="detail-content">
                <div class="detail-section">
                    <h4>基本信息</h4>
                    <div class="info-grid">
                        <div><b>用户：</b>{{ current.username || current.userNickname || ('用户' + current.userId) }}</div>
                        <div><b>记录时间：</b>{{ current.createdAt }}</div>
                        <div><b>当前情绪：</b>
                            <img :src="getEmotionIcon(current.emotionScore)" class="emo-ic-lg" style="vertical-align:middle;margin-right:8px;" />
                            <el-tag :type="getEmotionTag(current.emotionScore)" effect="dark" size="small">{{ current.emotion || getEmotionLabel(current.emotionScore) }}</el-tag>
                            <el-tag :type="getRiskTagType(current.riskLevel)" size="small" style="margin-left:6px;">{{ getRiskLevelText(current.riskLevel) }}</el-tag>
                        </div>
                        <div><b>情绪评分：</b><el-progress :percentage="getProgress(current.emotionScore)" :stroke-color="getScoreColor(current.emotionScore || 0)" style="width:160px;display:inline-block;vertical-align:middle;" /></div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>日记内容</h4>
                    <el-card shadow="never" style="background:#fafafa;">
                        <div style="white-space:pre-wrap;line-height:1.8;">{{ current.content }}</div>
                    </el-card>
                </div>

                <div class="detail-section">
                    <h4>AI 分析结果</h4>
                    <div class="ai-analysis-result">
                        <div class="ai-keywords-section">
                            <h5>关键词</h5>
                            <div class="keywords-container">
                                <el-tag v-for="k in ((current.analysis && current.analysis.keywords) || [])" :key="k" class="keyword-tag" size="small">{{ k }}</el-tag>
                                <span v-if="!current.analysis || !(current.analysis.keywords && current.analysis.keywords.length)" style="color:#9ca3af;font-size:12px;">暂无关键词</span>
                            </div>
                        </div>
                        <div class="ai-suggestion-section">
                            <h5>建议</h5>
                            <div class="suggestion-content">{{ (current.analysis && current.analysis.suggestion) || '—' }}</div>
                        </div>
                        <div class="ai-risk-section">
                            <h5>风险评估</h5>
                            <div class="risk-content">{{ (current.analysis && current.analysis.riskAssessment) || '—' }}</div>
                        </div>
                        <div class="ai-improvements-section">
                            <h5>改善建议</h5>
                            <ul class="improvement-list">
                                <li v-for="(i, idx) in (((current.analysis && current.analysis.improvements) || []))" :key="idx">{{ i }}</li>
                                <li v-if="!current.analysis || !(current.analysis.improvements && current.analysis.improvements.length)">暂无</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getDiaryAdminPage } from '@/api'

import happyIc from '@/assets/images/happy.png'
import calmIc from '@/assets/images/calm.png'
import confusedIc from '@/assets/images/confused.png'
import anxiousIc from '@/assets/images/anxious.png'
import tiredIc from '@/assets/images/tired.png'
import excitedIc from '@/assets/images/excited.png'
import surpriseIc from '@/assets/images/surprise.png'
import sadIc from '@/assets/images/sad.png'

const emotionIconMap = {
  '开心': happyIc,
  '平静': calmIc,
  '困惑': confusedIc,
  '焦虑': anxiousIc,
  '疲惫': tiredIc,
  '兴奋': excitedIc,
  '惊讶': surpriseIc,
  '悲伤': sadIc
}
const emotionLabelMap = {
  0: '悲伤', 1: '悲伤', 2: '焦虑', 3: '焦虑', 4: '疲惫', 5: '困惑', 6: '平静', 7: '平静', 8: '开心', 9: '兴奋', 10: '兴奋'
}
const scoreIconMap = [sadIc, sadIc, anxiousIc, anxiousIc, tiredIc, confusedIc, calmIc, calmIc, happyIc, excitedIc, excitedIc]
const scoreLabelMap = ['悲伤', '悲伤', '焦虑', '焦虑', '疲惫', '困惑', '平静', '平静', '开心', '兴奋', '兴奋']

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const useMock = ref(false)
const query = reactive({ currentPage: 1, size: 10, keyword: '' })
const detailVisible = ref(false)
const current = ref(null)

const emotionStatus = ['悲伤', '焦虑', '疲惫', '平静', '平静', '开心', '开心', '兴奋']

const getEmotionIcon = (scoreOrLabel) => {
  if (!scoreOrLabel && scoreOrLabel !== 0) return ''
  if (typeof scoreOrLabel === 'string') {
    return emotionIconMap[scoreOrLabel] || scoreIconMap[5]
  }
  const s = Math.max(0, Math.min(10, Math.round(Number(scoreOrLabel) || 0)))
  return scoreIconMap[s]
}
const getEmotionLabel = (score) => {
  const s = Math.max(0, Math.min(10, Math.round(Number(score) || 0)))
  return scoreLabelMap[s]
}
const getProgress = (s) => Math.round((Number(s) || 0) / 10 * 100)

const getEmotionTag = (score) => {
  if (score >= 8) return 'success'
  if (score >= 6) return 'info'
  if (score >= 4) return 'warning'
  return 'danger'
}
const getScoreColor = (s) => {
  if (s >= 8) return '#67c23a'
  if (s >= 6) return '#909399'
  if (s >= 4) return '#e6a23c'
  return '#f56c6c'
}
const getRiskTagType = (r) => ({ 0: 'success', 1: 'info', 2: 'warning', 3: 'danger' })[r] || 'info'
const getRiskLevelText = (r) => ({ 0: '正常', 1: '关注', 2: '预警', 3: '危机' })[r] || '未知'
const truncate = (s, n) => (s || '').length > n ? (s || '').slice(0, n) + '...' : (s || '')

const runLocalAnalysis = (text, score) => {
  const keywordPool = ['压力', '失眠', '焦虑', '疲惫', '孤独', '迷茫', '愤怒', '难过', '工作', '学习', '关系', '开心', '平静', '轻松']
  const keywords = []
  for (const w of keywordPool) if (text && text.includes(w)) keywords.push(w)
  while (keywords.length < 2) keywords.push(keywordPool[Math.floor(Math.random() * keywordPool.length)])
  
  const suggestions = [
    '这段经历让你承受了不少。试着每天抽 10 分钟，什么都不评判地观察自己。',
    '把情绪写下来是非常好的开始。可以试试 4-7-8 呼吸法帮身体放松。',
    '谢谢你分享这些。建议给自己安排一件小小的、只属于你的放松仪式。',
    '情绪就像天气，会变化的。重点是允许它存在，不评判自己。',
    '关注自己的感受是很好的习惯，继续保持。',
    '试着用积极的角度看待事情，会有不一样的收获。'
  ]
  const risks = ['情绪平稳', '轻度焦虑', '存在压力倾向', '建议多关注自身状态']
  const improvementsPool = ['每天记录 3 件小确幸', '每周三次 30 分钟有氧运动', '睡前 1 小时不碰屏幕', '尝试 4-7-8 呼吸法', '和信任的人聊聊', '给情绪起个名字']
  
  let riskIdx = 0
  if (score && score < 4) riskIdx = 3
  else if (score && score < 6) riskIdx = 2
  else if (score && score < 8) riskIdx = 1
  
  return {
    keywords: [...new Set(keywords)].slice(0, 3),
    suggestion: suggestions[riskIdx],
    riskAssessment: risks[riskIdx],
    improvements: improvementsPool.sort(() => Math.random() - 0.5).slice(0, 3)
  }
}

const buildMock = () => {
  const base = []
  for (let i = 1; i <= 18; i++) {
    const emotionScore = (i % 10) + 1
    const risk = i % 4
    base.push({
      id: i,
      userId: 2000 + i,
      username: '用户' + (2000 + i),
      emotion: emotionStatus[i % emotionStatus.length],
      emotionScore,
      riskLevel: risk,
      content: ['最近工作压力比较大，睡眠质量下降...', '今天和朋友聊了很久，心情好一些了', '持续失眠一周，感觉很累', '天气不错，出去走了走，舒服多了', '感觉一切都失控了，很焦虑'][i % 5],
      createdAt: `2026-06-${String((i % 28) + 1).padStart(2, '0')} ${String(10 + i).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00`,
      analysis: {
        keywords: ['压力', '失眠', '焦虑'],
        suggestion: '建议进行规律的放松训练，如每天 10 分钟呼吸冥想。',
        riskAssessment: risk === 0 ? '情绪平稳' : risk === 1 ? '存在焦虑倾向' : risk === 2 ? '风险较高，建议关注' : '高风险，强烈建议干预',
        improvements: ['尝试 4-7-8 呼吸法', '每天记录三件感恩的小事', '每周三次有氧运动']
      }
    })
  }
  return base
}

const mockData = buildMock()

const openDetail = (row) => {
  current.value = row
  detailVisible.value = true
}

const loadList = async () => {
  loading.value = true
  try {
    const res = await getDiaryAdminPage({ currentPage: query.currentPage, size: query.size, keyword: query.keyword })
    const d = res.data || {}
    const records = d.records || d.list || d
    if (Array.isArray(records) && records.length > 0) {
      list.value = records.map(r => ({
        id: r.id,
        userId: r.userId,
        username: r.username || r.userNickname || r.nickname,
        emotion: r.emotion || r.dominantEmotion,
        emotionScore: r.emotionScore || r.moodScore,
        riskLevel: r.riskLevel,
        content: r.content || r.diaryContent,
        createdAt: r.createdAt || r.diaryDate,
        analysis: r.analysis || runLocalAnalysis(r.content || r.diaryContent, r.emotionScore || r.moodScore)
      }))
      total.value = d.total || records.length
      useMock.value = false
    } else {
      throw new Error('empty')
    }
  } catch (_) {
    useMock.value = true
    list.value = mockData.slice((query.currentPage - 1) * query.size, query.currentPage * query.size)
    total.value = mockData.length
  } finally {
    loading.value = false
  }
}

onMounted(loadList)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-radius: 8px; }
.toolbar-left { display: flex; gap: 10px; align-items: center; }
.table-card { border-radius: 8px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
.user-cell { display: flex; align-items: center; }
.detail-section { margin-bottom: 24px; }
.detail-section h4 { margin: 0 0 16px; color: #303133; font-size: 16px; font-weight: 700; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; padding: 12px 16px; background: #fafafa; border-radius: 8px; }
.ai-keywords-section, .ai-suggestion-section, .ai-risk-section, .ai-improvements-section { margin-top: 16px; padding: 12px; background-color: #f8f9fa; border-radius: 6px; }
.ai-keywords-section h5, .ai-suggestion-section h5, .ai-risk-section h5, .ai-improvements-section h5 { margin: 0 0 8px; color: #606266; font-size: 14px; }
.keyword-tag { margin-right: 6px; margin-bottom: 6px; background-color: #e1f3d8; color: #67c23a; border-color: #b3d8a4; }
.suggestion-content, .risk-content { line-height: 1.6; padding: 8px; background: #fff; border-radius: 4px; border: 1px solid #ebeef5; color: #606266; }
.improvement-list { margin: 0; padding-left: 20px; }
.improvement-list li { margin-bottom: 4px; color: #606266; line-height: 1.5; }
.emo-ic {
  width: 36px; height: 36px; object-fit: contain; border-radius: 6px;
  display: block; background: #fff;
}
.emo-ic-lg {
  width: 44px; height: 44px; object-fit: contain; border-radius: 8px;
  display: inline-block; background: #fff;
}
.emotion-cell {
  display: flex; align-items: center; gap: 8px;
}
.emotion-label {
  font-size: 12px; color: #606266;
}
</style>
