<template>
  <div class="emotionDiary-container">
    <div class="header-section">
      <div class="header-content">
        <el-icon :size="36" color="#fff"><EditPen /></el-icon>
        <div>
          <h1 class="header-title">情绪日志</h1>
          <p class="header-sub">每天 3 分钟，记录你的心情，让 AI 帮你读懂自己</p>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#7ED321,#5CB300)"><el-icon :size="22" color="#fff"><EditPen /></el-icon></div>
        <div class="stat-info">
          <div class="stat-value">{{ store.totalDiaries }}</div>
          <div class="stat-label">日志总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#F5A623,#E09520)"><el-icon :size="22" color="#fff"><TrendCharts /></el-icon></div>
        <div class="stat-info">
          <div class="stat-value">{{ store.avgMoodScore }}</div>
          <div class="stat-label">平均心情分</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#4facfe,#00f2fe)"><el-icon :size="22" color="#fff"><Sunny /></el-icon></div>
        <div class="stat-info">
          <div class="stat-value">{{ positiveRatio }}%</div>
          <div class="stat-label">积极情绪占比</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#ff9a9e,#fecfef)"><el-icon :size="22" color="#fff"><Timer /></el-icon></div>
        <div class="stat-info">
          <div class="stat-value">{{ continuousDays }}</div>
          <div class="stat-label">连续记录天数</div>
        </div>
      </div>
    </div>

    <div class="content">
      <el-tabs v-model="activeTab" class="diary-tabs">
        <el-tab-pane label="写新日志" name="write">
          <div class="diary-card">
            <div class="title">今日情绪评分</div>
            <div class="section">
              <p>您今天的整体情绪状态如何？（1-10 分）</p>
              <div class="rate-row">
                <el-rate v-model="form.moodScore" :texts="emotionStatus" show-text :max="10" size="large" />
                <div class="current-emotion" v-if="form.moodScore">
                  {{ emotionStatus[form.moodScore - 1] }}
                </div>
              </div>
            </div>
          </div>

          <div class="diary-card">
            <div class="title">主要情绪</div>
            <div class="emotion-grid">
              <div v-for="e in emotions" :key="e.label"
                   class="emotion-card"
                   :class="{ selected: form.dominantEmotion === e.label }"
                   @click="selectEmotion(e)">
                <img :src="e.icon" class="emotion-icon" :alt="e.label" />
                <div class="emotion-name">{{ e.label }}</div>
              </div>
            </div>
          </div>

          <div class="diary-card">
            <div class="title">详细记录</div>
            <div class="detail-form">
              <div class="form-group">
                <div class="form-label">情绪触发因素</div>
                <el-input v-model="form.emotionTriggers" type="textarea" :rows="3" maxlength="1000" show-word-limit
                          placeholder="今天什么事情影响了您的情绪？" />
              </div>

              <div class="form-group">
                <div class="form-label">今日感想</div>
                <el-input v-model="form.diaryContent" type="textarea" :rows="5" maxlength="2000" show-word-limit
                          placeholder="写下您今天的想法、感受或发生的有趣事情…" />
              </div>

              <div class="life-indicators">
                <div class="indicator-group">
                  <div class="form-label">睡眠质量</div>
                  <el-select v-model="form.sleepQuality" placeholder="请选择" style="width:100%">
                    <el-option label="很差" :value="1" />
                    <el-option label="较差" :value="2" />
                    <el-option label="一般" :value="3" />
                    <el-option label="良好" :value="4" />
                    <el-option label="优秀" :value="5" />
                  </el-select>
                </div>
                <div class="indicator-group">
                  <div class="form-label">压力等级</div>
                  <el-select v-model="form.stressLevel" placeholder="请选择" style="width:100%">
                    <el-option label="很低" :value="1" />
                    <el-option label="较低" :value="2" />
                    <el-option label="中等" :value="3" />
                    <el-option label="较高" :value="4" />
                    <el-option label="很高" :value="5" />
                  </el-select>
                </div>
              </div>

              <div class="action-buttons">
                <el-button @click="resetForm">重置</el-button>
                <el-button type="primary" :loading="analyzing" @click="submit">
                  <el-icon><MagicStick /></el-icon> 提交并 AI 分析
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="`历史日志 (${history.length})`" name="history">
          <div v-if="history.length === 0" class="empty">
            <el-empty description="还没有写过日志，去写下第一篇吧" />
          </div>
          <div v-else class="history-list">
            <div v-for="item in history" :key="item.id" class="history-item">
              <div class="history-head">
                <div class="left">
                  <img :src="getEmotionIcon(item.emotion)" class="history-emotion-icon" />
                  <el-tag :type="getScoreTag(item.emotionScore)" effect="dark" size="small">{{ item.emotion }}</el-tag>
                  <span class="date">{{ formatTime(item.createdAt) }}</span>
                </div>
                <el-progress :percentage="Math.round((item.emotionScore || 0) / 10 * 100)"
                             :stroke-color="getScoreColor(item.emotionScore || 0)"
                             :show-text="false"
                             style="width:120px;" />
              </div>
              <p v-if="item.emotionTriggers" class="history-triggers"><b>触发因素：</b>{{ item.emotionTriggers }}</p>
              <p class="history-content">{{ item.content }}</p>
              <div class="history-meta">
                <span v-if="item.sleepQuality">睡眠 {{ sleepLabels[item.sleepQuality - 1] }}</span>
                <span v-if="item.stressLevel">压力 {{ stressLabels[item.stressLevel - 1] }}</span>
              </div>
              <div v-if="item.analysis" class="history-analysis">
                <div class="ai-status-tag"><el-icon><MagicStick /></el-icon> AI 分析结果</div>
                <div class="suggestion-content">{{ item.analysis.suggestion }}</div>
                <div class="keywords">
                  <el-tag v-for="k in (item.analysis.keywords || [])" :key="k" size="small" class="kw">{{ k }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 新增：情绪分析 Tab -->
        <el-tab-pane name="analysis">
          <template #label>
            <span>情绪分析 <el-icon><TrendCharts /></el-icon></span>
          </template>
          <div v-if="history.length === 0" class="empty">
            <el-empty description="记录更多日志后，这里将展示你的情绪分析报告" />
          </div>
          <div v-else class="analysis-content">
            <div class="diary-card">
              <div class="title">情绪变化趋势</div>
              <div class="chart-container" ref="trendChartRef"></div>
            </div>
            <div class="analysis-grid">
              <div class="diary-card">
                <div class="title">情绪分布</div>
                <div class="chart-container chart-sm" ref="pieChartRef"></div>
              </div>
              <div class="diary-card">
                <div class="title">分析摘要</div>
                <div class="summary-content">
                  <div class="summary-item">
                    <span class="summary-icon">📊</span>
                    <div>
                      <div class="summary-title">平均心情分</div>
                      <div class="summary-value">{{ store.avgMoodScore }} / 10</div>
                    </div>
                  </div>
                  <div class="summary-item">
                    <span class="summary-icon">📝</span>
                    <div>
                      <div class="summary-title">累计记录</div>
                      <div class="summary-value">{{ store.totalDiaries }} 篇日志</div>
                    </div>
                  </div>
                  <div class="summary-item">
                    <span class="summary-icon">🔥</span>
                    <div>
                      <div class="summary-title">连续记录</div>
                      <div class="summary-value">{{ continuousDays }} 天</div>
                    </div>
                  </div>
                  <div class="summary-item">
                    <span class="summary-icon">💡</span>
                    <div>
                      <div class="summary-title">主要情绪</div>
                      <div class="summary-value">{{ topEmotion }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="resultVisible" title="AI 分析结果" width="640px" destroy-on-close>
      <div v-if="lastAnalysis">
        <div class="detail-section">
          <h4><el-icon><MagicStick /></el-icon> 关键词</h4>
          <div class="keywords-container">
            <el-tag v-for="k in lastAnalysis.keywords" :key="k" size="small" effect="plain" type="success">{{ k }}</el-tag>
          </div>
        </div>
        <div class="detail-section">
          <h4><el-icon><ChatLineRound /></el-icon> 建议</h4>
          <div class="suggestion-content">{{ lastAnalysis.suggestion }}</div>
        </div>
        <div class="detail-section">
          <h4><el-icon><Warning /></el-icon> 风险评估</h4>
          <div class="suggestion-content">{{ lastAnalysis.riskAssessment }}</div>
        </div>
        <div class="detail-section">
          <h4><el-icon><List /></el-icon> 改善建议</h4>
          <ul class="improvement-list">
            <li v-for="(i, idx) in lastAnalysis.improvements" :key="idx">{{ i }}</li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyDiaries, saveDiary } from '@/api'
import { useEmotionStore } from '@/stores/emotion'
import * as echarts from 'echarts'

import happyIcon from '@/assets/images/happy.png'
import calmIcon from '@/assets/images/calm.png'
import confusedIcon from '@/assets/images/confused.png'
import anxiousIcon from '@/assets/images/anxious.png'
import tiredIcon from '@/assets/images/tired.png'
import excitedIcon from '@/assets/images/excited.png'
import surpriseIcon from '@/assets/images/surprise.png'
import sadIcon from '@/assets/images/sad.png'

const store = useEmotionStore()

const emotionStatus = [
  '绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然',
  '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福'
]

const sleepLabels = ['很差', '较差', '一般', '良好', '优秀']
const stressLabels = ['很低', '较低', '中等', '较高', '很高']

const emotionIconMap = {
  '开心': happyIcon, '平静': calmIcon, '困惑': confusedIcon, '焦虑': anxiousIcon,
  '疲惫': tiredIcon, '兴奋': excitedIcon, '惊讶': surpriseIcon, '悲伤': sadIcon
}
const getEmotionIcon = (label) => emotionIconMap[label] || calmIcon

const emotions = [
  { label: '开心', icon: happyIcon }, { label: '平静', icon: calmIcon },
  { label: '焦虑', icon: anxiousIcon }, { label: '悲伤', icon: sadIcon },
  { label: '兴奋', icon: excitedIcon }, { label: '疲惫', icon: tiredIcon },
  { label: '惊讶', icon: surpriseIcon }, { label: '困惑', icon: confusedIcon }
]

const positiveEmotions = ['开心', '兴奋', '平静']

const form = reactive({
  diaryDate: new Date().toISOString().split('T')[0],
  moodScore: null,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: null,
  stressLevel: null
})

const activeTab = ref('write')
const analyzing = ref(false)
const resultVisible = ref(false)
const lastAnalysis = ref(null)
const history = ref([])

const trendChartRef = ref(null)
const pieChartRef = ref(null)
let trendChart = null
let pieChart = null

// 统计数据
const positiveRatio = computed(() => {
  if (history.value.length === 0) return 0
  const positive = history.value.filter(d => {
    const s = d.emotionScore || 0
    const e = d.emotion || ''
    return s >= 6 || positiveEmotions.includes(e)
  })
  return Math.round(positive.length / history.value.length * 100)
})

const continuousDays = computed(() => {
  if (history.value.length === 0) return 0
  const sorted = [...history.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  let count = 1
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i].createdAt)
    const next = new Date(sorted[i + 1].createdAt)
    const diff = (curr - next) / 86400000
    if (diff <= 1.5) count++
    else break
  }
  return count
})

const topEmotion = computed(() => {
  if (history.value.length === 0) return '暂无'
  const map = {}
  history.value.forEach(d => {
    const key = d.emotion || '其他'
    map[key] = (map[key] || 0) + 1
  })
  let maxKey = '', maxVal = 0
  Object.entries(map).forEach(([k, v]) => {
    if (v > maxVal) { maxVal = v; maxKey = k }
  })
  return maxKey
})

const loadHistory = async () => {
  let loadedFromBackend = false

  // 只有登录后才尝试从后端加载，避免未登录时弹系统错误
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const res = await getMyDiaries()
      const list = res.data || []
      if (Array.isArray(list) && list.length > 0) {
        history.value = list.map(r => ({
          id: r.id,
          emotion: r.dominantEmotion || r.emotion,
          emotionScore: r.moodScore || r.emotionScore,
          sleepQuality: r.sleepQuality,
          stressLevel: r.stressLevel,
          emotionTriggers: r.emotionTriggers,
          content: r.diaryContent || r.content,
          createdAt: r.createdAt || r.createTime || r.diaryDate,
          analysis: r.analysis
        }))
        loadedFromBackend = true
        store.setDiaries(history.value)
      }
    } catch (err) {
      console.error('加载日志失败:', err)
    }
  }

  if (!loadedFromBackend) {
    store.loadFromStorage()
    if (store.diaries.length > 0) {
      history.value = store.diaries
    } else {
      history.value = buildLocalMock()
      store.setDiaries(history.value)
    }
  }

  // 按创建时间降序排列（最新在前）
  history.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

const buildLocalMock = () => {
  const now = new Date()
  const mockDiaries = []
  const emotions = ['平静', '开心', '焦虑', '疲惫', '兴奋', '开心', '困惑', '平静', '开心', '焦虑']
  const scores = [7, 8, 4, 3, 9, 8, 5, 7, 9, 4]
  const triggers = ['完成了积压的工作', '和朋友聚会', '工作压力大', '睡眠不足', '旅行计划', '收到礼物', '遇到难题', '读了一本好书', '锻炼后', '项目延期']
  const contents = [
    '今天把积压很久的事情一件一件做完了，感觉轻松很多。', '和最好的朋友一起吃饭聊天，真的很开心。',
    '最近项目进展不顺利，压力越来越大。', '昨晚只睡了4个小时，今天一整天都提不起精神。',
    '计划了很久的旅行终于要出发了，兴奋得睡不着！', '收到了意外的生日礼物，心里暖暖的。',
    '学习遇到了瓶颈，不知道该怎么办。', '静下心来看了一本书，内心平静了很多。',
    '坚持跑步一个月了，身心状态都很好。', '项目又延期了，感觉一切都不顺利。'
  ]
  for (let i = 0; i < 10; i++) {
    const d = new Date(now - (9 - i) * 86400000)
    mockDiaries.push({
      id: `mock-${i + 1}`,
      emotion: emotions[i],
      emotionScore: scores[i],
      sleepQuality: Math.ceil(Math.random() * 3 + 2),
      stressLevel: Math.ceil(Math.random() * 3 + 1),
      emotionTriggers: triggers[i],
      content: contents[i],
      createdAt: d.toISOString(),
      analysis: {
        keywords: ['情绪', '生活', '自我觉察'].slice(0, 2),
        suggestion: scores[i] >= 6
          ? '你的情绪状态不错！保持积极的心态，继续关注自己的内心感受。'
          : '有时候情绪低落是正常的。试着找到让自己放松的方式，给自己一些时间和空间。',
        riskAssessment: scores[i] >= 6 ? '情绪平稳' : scores[i] >= 4 ? '轻度关注' : '需要关注',
        improvements: ['每天记录3件感恩的小事', '尝试正念冥想10分钟', '和家人朋友聊聊天']
      }
    })
  }
  return mockDiaries
}

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return String(t).slice(0, 16).replace('T', ' ')
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const selectEmotion = (e) => { form.dominantEmotion = e.label }

const resetForm = () => {
  Object.assign(form, {
    diaryDate: new Date().toISOString().split('T')[0],
    moodScore: null, dominantEmotion: '', emotionTriggers: '',
    diaryContent: '', sleepQuality: null, stressLevel: null
  })
}

const getScoreTag = (s) => s >= 7 ? 'success' : s >= 4 ? 'warning' : 'danger'
const getScoreColor = (s) => s >= 7 ? '#67c23a' : s >= 4 ? '#e6a23c' : '#f56c6c'

const runLocalAnalysis = (text, score) => {
  const keywordPool = ['压力', '失眠', '焦虑', '疲惫', '孤独', '迷茫', '愤怒', '难过', '工作', '学习', '关系', '开心', '平静', '轻松', '成长', '感恩']
  const keywords = keywordPool.filter(w => text && text.includes(w))
  while (keywords.length < 3) {
    const kw = keywordPool[Math.floor(Math.random() * keywordPool.length)]
    if (!keywords.includes(kw)) keywords.push(kw)
  }
  const suggestionsPool = [
    '这段经历让你承受了不少。试着每天抽 10 分钟，什么都不评判地观察自己。',
    '把情绪写下来是非常好的开始。可以试试 4-7-8 呼吸法帮身体放松。',
    '谢谢你分享这些。建议给自己安排一件小小的、只属于你的放松仪式。',
    '情绪就像天空的云，来了又走。重要的是允许它存在，不评判自己。',
    '关注自己的感受是很好的习惯，继续保持和内心的对话。'
  ]
  const risksPool = ['情绪平稳', '轻度焦虑倾向', '存在压力迹象', '建议多关注自身状态']
  const improvementsPool = [
    '每天记录 3 件小确幸', '每周三次 30 分钟有氧运动', '睡前 1 小时不碰屏幕',
    '尝试 4-7-8 呼吸法', '和信任的人聊聊心事', '给情绪起个名字接纳它',
    '听一首喜欢的音乐', '去户外散步 15 分钟', '写下今天最感激的事'
  ]

  let suggestionIdx = score >= 7 ? 4 : score >= 5 ? 2 : 0
  let riskIdx = score >= 7 ? 0 : score >= 5 ? 1 : score >= 3 ? 2 : 3

  return {
    keywords: [...new Set(keywords)].slice(0, 4),
    suggestion: suggestionsPool[suggestionIdx],
    riskAssessment: risksPool[riskIdx],
    improvements: improvementsPool.sort(() => Math.random() - 0.5).slice(0, 4)
  }
}

const submit = async () => {
  // 防止快速双击重复提交
  if (analyzing.value) return
  if (!form.moodScore) { ElMessage.error('请选择情绪评分'); return }
  if (!form.diaryContent.trim()) { ElMessage.error('请填写今日感想'); return }

  analyzing.value = true
  const localAnalysis = runLocalAnalysis(form.diaryContent, form.moodScore)
  lastAnalysis.value = localAnalysis

  const payload = {
    diaryDate: form.diaryDate,
    dominantEmotion: form.dominantEmotion,
    moodScore: form.moodScore,
    sleepQuality: form.sleepQuality,
    stressLevel: form.stressLevel,
    diaryContent: form.diaryContent,
    emotionTriggers: form.emotionTriggers
  }

  let saved = null
  try {
    const res = await saveDiary(payload)
    saved = res.data || null
    ElMessage.success('提交成功')
  } catch (err) {
    ElMessage.warning('已保存到本地（服务端暂未连通）')
  }

  const diary = {
    id: saved?.id || `local_${Date.now()}`,
    emotion: form.dominantEmotion || emotionStatus[form.moodScore - 1],
    emotionScore: form.moodScore,
    sleepQuality: form.sleepQuality,
    stressLevel: form.stressLevel,
    emotionTriggers: form.emotionTriggers,
    content: form.diaryContent,
    createdAt: saved?.createdAt || new Date().toISOString(),
    analysis: localAnalysis
  }
  history.value.unshift(diary)
  store.addDiary(diary)
  resetForm()
  analyzing.value = false
  resultVisible.value = true
  activeTab.value = 'history'
}

// ECharts 初始化
const initTrendChart = () => {
  if (!trendChartRef.value) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(trendChartRef.value)

  const data = [...history.value]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-14)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        return `${p.axisValue}<br/>心情指数: ${p.value} 分`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => {
        const date = new Date(d.createdAt)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      interval: 2,
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      data: data.map(d => d.emotionScore || 0),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#7ED321', width: 3 },
      itemStyle: { color: '#7ED321' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(126, 211, 33, 0.25)' },
          { offset: 1, color: 'rgba(126, 211, 33, 0.02)' }
        ])
      },
      markLine: {
        silent: true,
        data: [{ yAxis: 6, lineStyle: { color: '#F5A623', type: 'dashed' }, label: { formatter: '积极线', fontSize: 11 } }]
      }
    }]
  }
  trendChart.setOption(option)
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  if (pieChart) pieChart.dispose()
  pieChart = echarts.init(pieChartRef.value)

  const map = {}
  history.value.forEach(d => {
    const key = d.emotion || '其他'
    map[key] = (map[key] || 0) + 1
  })
  const data = Object.entries(map).map(([name, value]) => ({ name, value }))

  const colorMap = { '开心': '#7ED321', '平静': '#4facfe', '兴奋': '#F5A623', '焦虑': '#ff9a9e', '悲伤': '#6b7280', '疲惫': '#a78bfa', '惊讶': '#f472b6', '困惑': '#38bdf8' }

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 次 ({d}%)' },
    legend: { bottom: '0%', textStyle: { fontSize: 11, color: '#6b7280' } },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: data.map(d => ({
        ...d,
        itemStyle: { color: colorMap[d.name] || '#e5e7eb' }
      }))
    }]
  }
  pieChart.setOption(option)
}

const resizeCharts = () => {
  trendChart?.resize()
  pieChart?.resize()
}

watch(activeTab, (val) => {
  if (val === 'analysis') {
    nextTick(() => {
      initTrendChart()
      initPieChart()
    })
  }
})

watch(() => history.value.length, () => {
  if (activeTab.value === 'analysis') {
    nextTick(() => {
      initTrendChart()
      initPieChart()
    })
  }
})

onMounted(() => {
  loadHistory()
  window.addEventListener('resize', resizeCharts)
})
</script>

<style scoped>
.emotionDiary-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  min-height: calc(100vh - 285px);
}
.header-section {
  background: linear-gradient(135deg, #7ED321 0%, #F5A623 100%);
  color: white;
  padding: 40px 20px;
}
.header-content { display: flex; align-items: center; gap: 12px; max-width: 1100px; margin: 0 auto; }
.header-title { font-size: 28px; font-weight: 700; margin: 0 0 6px; }
.header-sub { font-size: 14px; opacity: 0.9; margin: 0; }

/* 统计卡片 */
.stats-bar {
  max-width: 1100px; margin: -30px auto 0; padding: 0 20px;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; position: relative; z-index: 3;
}
.stat-card {
  background: #fff; border-radius: 14px; padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06); transition: transform .2s;
}
.stat-card:hover { transform: translateY(-2px); }
.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: 700; color: #1f2937; line-height: 1.2; }
.stat-label { font-size: 12px; color: #9ca3af; margin-top: 2px; }

.content {
  max-width: 1100px; margin: 20px auto 40px; padding: 0 20px; position: relative; z-index: 2;
}
.diary-tabs { background: transparent; padding: 0; }

.diary-card {
  margin-bottom: 20px; background: white; border-radius: 10px;
  padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.diary-card .title { margin-bottom: 20px; font-size: 22px; font-weight: 600; color: #374151; }
.section p { color: #6b7280; margin-bottom: 16px; font-size: 14px; }
.rate-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.current-emotion { font-size: 15px; color: #6b7280; }

.emotion-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.emotion-card {
  padding: 15px; border: 2px solid #e5e7eb; border-radius: 15px;
  text-align: center; cursor: pointer; background: #f9fafb; transition: all .15s;
}
.emotion-card:hover { transform: translateY(-2px); }
.emotion-card.selected { border-color: #7ed321; background: #f0fdf4; transform: translateY(-3px); }
.emotion-icon { width: 50px; height: 50px; margin: 0 auto 10px; display: block; object-fit: contain; }
.emotion-name { color: #374151; font-size: 14px; }

.history-emotion-icon { width: 22px; height: 22px; margin-right: 6px; vertical-align: middle; object-fit: contain; }

.detail-form .form-label { margin: 10px 0; color: #374151; font-weight: 500; }
.form-group { margin-bottom: 16px; }
.life-indicators { display: flex; gap: 20px; margin-top: 8px; }
.indicator-group { flex: 1; }
.action-buttons { margin-top: 32px; display: flex; justify-content: flex-end; gap: 12px; }

.history-list { display: flex; flex-direction: column; gap: 16px; }
.history-item { padding: 20px; border-radius: 12px; background: #f9fafb; border: 1px solid #f1f5f9; }
.history-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.history-head .left { display: flex; align-items: center; gap: 10px; }
.history-head .date { font-size: 12px; color: #9ca3af; }
.history-triggers { font-size: 13px; color: #6b7280; margin: 0 0 8px; }
.history-meta { display: flex; gap: 12px; font-size: 12px; color: #9ca3af; margin-bottom: 10px; }
.history-content { color: #374151; line-height: 1.8; font-size: 14px; margin: 0 0 14px; white-space: pre-wrap; }
.history-analysis { border-top: 1px dashed #e5e7eb; padding-top: 14px; }
.ai-status-tag { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #f59e0b; margin-bottom: 8px; }
.suggestion-content { background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; color: #4b5563; line-height: 1.7; margin-bottom: 10px; }
.keywords { display: flex; gap: 6px; flex-wrap: wrap; }
.keywords .kw { background: #dcfce7; color: #15803d; border-color: #86efac; }

/* 情绪分析 */
.analysis-content { display: flex; flex-direction: column; gap: 20px; }
.analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.chart-container { width: 100%; height: 320px; }
.chart-sm { height: 260px; }

.summary-content { display: flex; flex-direction: column; gap: 16px; }
.summary-item {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  background: #f9fafb; border-radius: 10px; transition: background .15s;
}
.summary-item:hover { background: #f0fdf4; }
.summary-icon { font-size: 24px; flex-shrink: 0; }
.summary-title { font-size: 12px; color: #9ca3af; }
.summary-value { font-size: 16px; font-weight: 600; color: #1f2937; }

.empty { padding: 40px 0; }
.detail-section { margin-bottom: 20px; }
.detail-section h4 { margin: 0 0 10px; color: #303133; font-size: 15px; }
.improvement-list { margin: 0; padding-left: 20px; color: #4b5563; }
.improvement-list li { margin-bottom: 4px; line-height: 1.6; }

@media (max-width: 768px) {
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
  .analysis-grid { grid-template-columns: 1fr; }
}
</style>
