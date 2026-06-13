<template>
  <div class="home-container">
    <div class="content">
      <div class="text">
        <h1 class="title" v-if="isLoggedIn">欢迎回来<br /><span class="highlight-text">{{ greeting }}</span></h1>
        <h1 class="title" v-else>一次温暖的对话<br /><span class="highlight-text">化孤独为慰藉</span></h1>
        <p class="subtitle" v-if="isLoggedIn">您已连续记录 {{ continuousDays }} 天，平均心情 {{ avgScore }} 分。继续关注自己，每一天都值得被温柔对待。</p>
        <p class="subtitle" v-else>每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的连接温暖您的每一天</p>
        <div class="hero-actions">
          <el-button size="large" class="hero-btn-primary" @click="$router.push('/chat')">开始倾诉，获得陪伴</el-button>
          <el-button size="large" class="hero-btn-ghost" @click="$router.push('/mood')">记录心情，释放情感</el-button>
        </div>
      </div>
      <div class="robot">
        <el-image :src="iconUrl" fit="contain" style="width:140px;height:140px;" />
      </div>
    </div>
  </div>

  <div class="features-section">
    <div class="feature-card" @click="$router.push('/mood')">
      <div class="feature-icon" style="background:linear-gradient(135deg,#667eea,#764ba2);">
        <el-icon :size="36" color="#fff"><EditPen /></el-icon>
      </div>
      <h3>情绪日记</h3>
      <p>每天 3 分钟记录心情，AI 帮你读懂情绪变化</p>
    </div>
    <div class="feature-card" @click="$router.push('/chat')">
      <div class="feature-icon" style="background:linear-gradient(135deg,#fb923c,#f59e0b);">
        <el-icon :size="36" color="#fff"><ChatLineRound /></el-icon>
      </div>
      <h3>AI 心理咨询</h3>
      <p>24 小时在线陪伴，像朋友一样聊天不评判</p>
    </div>
    <div class="feature-card" @click="$router.push('/knowledge')">
      <div class="feature-icon" style="background:linear-gradient(135deg,#4facfe,#00f2fe);">
        <el-icon :size="36" color="#fff"><Reading /></el-icon>
      </div>
      <h3>心理健康知识库</h3>
      <p>精选心理科普文章，自我疗愈的第一步</p>
    </div>
    <div class="feature-card" @click="$router.push('/mood')">
      <div class="feature-icon" style="background:linear-gradient(135deg,#43e97b,#38f9d7);">
        <el-icon :size="36" color="#fff"><TrendCharts /></el-icon>
      </div>
      <h3>情绪分析</h3>
      <p>用图表看见自己的情绪趋势，科学了解自己</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEmotionStore } from '@/stores/emotion'
import iconUrl from '@/assets/images/robot.png'

const store = useEmotionStore()
store.loadFromStorage()

const isLoggedIn = computed(() => !!localStorage.getItem('token'))
const continuousDays = computed(() => store.continuousDays || 0)
const avgScore = computed(() => store.avgMoodScore || 0)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，早点休息'
  if (hour < 12) return '新的一天，从心开始'
  if (hour < 14) return '午安，休息一下'
  if (hour < 18) return '下午好，加油'
  return '晚上好，放松身心'
})
</script>

<style scoped>
.home-container {
  background: linear-gradient(90deg, rgb(74, 156, 140) 0%, rgb(61, 138, 122) 100%) rgba(74, 156, 140, 0.95);
  color: white;
  padding: 5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 285px);
}
.home-container .content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  max-width: 1100px;
  width: 100%;
}
.home-container .text {
  width: 520px;
}
.home-container .title {
  font-size: 42px;
  font-weight: bold;
  line-height: 1.35;
  margin-bottom: 16px;
}
.home-container .highlight-text {
  color: #ffd700;
}
.home-container .subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  line-height: 1.7;
}
.home-container .hero-actions {
  display: flex;
  gap: 16px;
}
.hero-btn-primary {
  background: #fff !important;
  color: #4a908c !important;
  border: none !important;
  font-weight: 600;
  padding: 14px 28px;
  font-size: 15px;
}
.hero-btn-ghost {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  color: #fff !important;
  padding: 14px 28px;
  font-size: 15px;
}
.hero-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.22) !important;
}
.home-container .robot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.features-section {
  display: flex;
  gap: 24px;
  max-width: 1100px;
  margin: -50px auto 60px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}
.feature-card {
  flex: 1;
  background: #fff;
  border-radius: 14px;
  padding: 28px 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: transform .2s ease, box-shadow .2s ease;
  cursor: pointer;
}
.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.1);
}
.feature-icon {
  width: 68px;
  height: 68px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}
.feature-card h3 {
  font-size: 17px;
  color: #2d3436;
  margin: 0 0 8px;
}
.feature-card p {
  font-size: 13px;
  color: #636e72;
  line-height: 1.6;
  margin: 0;
}
</style>
