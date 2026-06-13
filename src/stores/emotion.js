import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEmotionStore = defineStore('emotion', () => {
  const diaries = ref([])
  const currentSessionEmotion = ref({
    primaryEmotion: '中性',
    emotionScore: 50,
    isNegative: false,
    riskLevel: 0,
    suggestion: '开始记录你的情绪之旅吧',
    improvementSuggestions: [],
    riskDescription: ''
  })

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('emotion-diaries')
      if (stored) {
        diaries.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载本地情绪数据失败:', e)
    }
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem('emotion-diaries', JSON.stringify(diaries.value))
    } catch (e) {
      console.error('保存情绪数据失败:', e)
    }
  }

  const addDiary = (diary) => {
    diaries.value.unshift(diary)
    saveToStorage()
  }

  const setDiaries = (list) => {
    diaries.value = list
    saveToStorage()
  }

  const updateSessionEmotion = (emotion) => {
    if (emotion) {
      currentSessionEmotion.value = { ...currentSessionEmotion.value, ...emotion }
    }
  }

  // 情绪统计数据
  const moodTrend = computed(() => {
    return [...diaries.value]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-14)
      .map(d => ({
        date: formatDate(d.createdAt),
        score: d.emotionScore || d.moodScore || 0,
        emotion: d.emotion || d.dominantEmotion || '未知'
      }))
  })

  const avgMoodScore = computed(() => {
    if (diaries.value.length === 0) return 0
    const sum = diaries.value.reduce((acc, d) => acc + (d.emotionScore || d.moodScore || 0), 0)
    return Math.round(sum / diaries.value.length * 10) / 10
  })

  const emotionDistribution = computed(() => {
    const map = {}
    diaries.value.forEach(d => {
      const key = d.emotion || d.dominantEmotion || '其他'
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  })

  const totalDiaries = computed(() => diaries.value.length)

  return {
    diaries,
    currentSessionEmotion,
    loadFromStorage,
    saveToStorage,
    addDiary,
    setDiaries,
    updateSessionEmotion,
    moodTrend,
    avgMoodScore,
    emotionDistribution,
    totalDiaries
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return String(dateStr).slice(0, 10)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
