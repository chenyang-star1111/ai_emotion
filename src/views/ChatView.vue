<template>
  <div class="chat-container">
    <aside class="chat-sidebar">
      <div class="ai-assistant-card">
        <div class="ai-avatar">
          <el-icon :size="28" color="#fff"><User /></el-icon>
        </div>
        <h3 class="assistant-name">宁暖AI助手</h3>
        <div class="online-status"><span class="status-dot"></span>在线服务中</div>
      </div>

      <div class="mood-garden" v-if="currentEmotion">
        <div class="garden-title">情绪花园</div>
        <div class="garden-inner">
          <div class="mood-circle">
            <div class="mood-label">{{ currentEmotion.primaryEmotion }}</div>
            <div class="mood-score">{{ currentEmotion.emotionScore }}</div>
          </div>
          <div class="mood-status">
            <span class="status-label">今天感觉</span>
            <span class="status-value">{{ currentEmotion.isNegative ? '需要关注' : '很不错' }}</span>
          </div>
          <div class="intensity-row">
            <span v-for="dot in 3" :key="dot" class="intensity-dot"
                  :class="{ active: getIntensityClass(currentEmotion.emotionScore) >= dot }"></span>
            <span class="intensity-text">{{ getRiskText(currentEmotion.riskLevel) }}</span>
          </div>
          <div class="mood-suggestion" v-if="currentEmotion.suggestion">
            <span class="suggestion-title">💗 给你的小建议</span>
            <span class="suggestion-text">{{ currentEmotion.suggestion }}</span>
          </div>
          <div class="healing-actions" v-if="currentEmotion.improvementSuggestions?.length">
            <div class="actions-title">治愈小行动</div>
            <div v-for="action in currentEmotion.improvementSuggestions" :key="action" class="action-item">
              ✨ {{ action }}
            </div>
          </div>
          <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
            <div class="notice-title">🤗 温馨提示</div>
            <div class="notice-text">{{ currentEmotion.riskDescription }}</div>
          </div>
        </div>
      </div>

      <div class="history-section">
        <div class="history-title">会话历史</div>
        <div class="history-list">
          <div v-for="s in sessions" :key="s.id"
               class="history-item"
               :class="{ active: currentSession?.sessionId === getSessionKey(s.id) }"
               @click="openSession(s)">
            <div class="history-head">
              <span class="history-name">{{ s.sessionTitle || '新对话' }}</span>
              <el-button text type="danger" size="small" @click.stop="handleDeleteSession(s.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <div class="history-time">{{ formatTime(s.startedAt || s.updatedAt) }}</div>
            <div class="history-content">{{ s.lastMessageContent || '点击继续这段对话…' }}</div>
            <div class="history-meta">
              <span><el-icon><Message /></el-icon> {{ s.messageCount || 0 }}</span>
              <span><el-icon><Timer /></el-icon> {{ formatDuration(s.durationMinutes) }}</span>
            </div>
          </div>
          <div v-if="sessions.length === 0 && !sessionsLoading" class="history-empty">暂无会话，开始和我聊聊天吧</div>
          <div v-if="sessionsLoading" class="history-empty">加载中…</div>
        </div>
      </div>
    </aside>

    <main class="chat-main">
      <div class="chat-header">
        <div class="header-left">
          <div class="header-avatar"><el-icon :size="20" color="#fff"><MessageSquare /></el-icon></div>
          <div>
            <h3>宁暖AI助手</h3>
            <span class="header-sub">您的贴心AI心理健康助手</span>
          </div>
        </div>
        <el-button class="new-btn" circle @click="createNewSession" title="新对话">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>

      <div class="message-list" ref="listRef">
        <div v-if="messages.length === 0" class="message-row assistant">
          <div class="bubble-assistant">
            <div class="bubble-inner">
              您好！我是宁暖，您的AI心理健康助手。很高兴陪伴您。请告诉我，今天您感觉怎么样？有什么想要分享的吗？
            </div>
            <div class="bubble-time">刚刚</div>
          </div>
        </div>

        <div v-for="msg in messages" :key="msg.id" class="message-row" :class="msg.senderType === 1 ? 'user' : 'assistant'">
          <div :class="msg.senderType === 1 ? 'bubble-user' : 'bubble-assistant'">
            <div class="bubble-inner">
              <div v-if="msg.senderType === 2 && isAiTyping && !msg.content" class="typing-bubble">
                <span></span><span></span><span></span>
              </div>
              <div v-else-if="msg.isError" class="error-text">{{ msg.content }}</div>
              <MarkdownRenderer v-else-if="msg.senderType === 2" :content="msg.content" :is-ai-message="true" />
              <span v-else v-html="formatContent(msg.content)"></span>
            </div>
            <div class="bubble-time">
              {{ msg.senderType === 2 && isAiTyping && !msg.content ? '正在输入中…' : formatMessageTime(msg.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <div class="input-wrap">
          <!-- 快捷回复建议 -->
          <div class="quick-replies" v-if="quickReplies.length > 0">
            <span
              v-for="(qr, idx) in quickReplies"
              :key="idx"
              class="quick-reply-chip"
              @click="sendQuickReply(qr)"
            >{{ qr }}</span>
          </div>
          <el-input v-model="inputText" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }"
                    :disabled="isAiTyping" maxlength="500"
                    placeholder="说点什么吧… 按 Enter 发送，Shift+Enter 换行"
                    @keydown="handleKeyDown" />
          <div class="input-footer">
            <span>按 Enter 发送，Shift+Enter 换行</span>
            <span>{{ inputText.length }}/500</span>
          </div>
        </div>
        <el-button class="send-btn" circle :disabled="!inputText.trim() || isAiTyping" @click="send">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { useEmotionStore } from '@/stores/emotion'
import {
  getSessionPage,
  createSession,
  getSessionMessages,
  getMoodAnalysis,
  deleteSession
} from '@/api'

const store = useEmotionStore()

const sessions = ref([])
const sessionsLoading = ref(false)
const currentSession = ref(null)
const messages = ref([])
const inputText = ref('')
const isAiTyping = ref(false)
const listRef = ref(null)

const currentEmotion = ref({
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: '开始对话后，AI 会分析您的情绪状态',
  improvementSuggestions: [],
  riskDescription: ''
})

// 快捷回复建议
const quickReplies = ref([
  '我今天心情不太好，能陪我聊聊天吗？',
  '最近压力很大，不知道该怎么办',
  '分享一件今天让我开心的事',
  '我总是感到很焦虑，怎么办？',
  '想和你聊聊我的睡眠问题'
])

const sendQuickReply = (text) => {
  inputText.value = text
  send()
}

// 同步情绪到 store
watch(currentEmotion, (val) => {
  if (val && val.primaryEmotion && val.primaryEmotion !== '中性') {
    store.updateSessionEmotion(val)
  }
}, { deep: true })

const getSessionKey = (id) => (String(id).startsWith('session_') ? String(id) : `session_${id}`)

const getIntensityClass = (score) => {
  if (score >= 61) return 3
  if (score >= 31) return 2
  return 1
}

const getRiskText = (level) => {
  const map = { 0: '正常', 1: '关注', 2: '预警', 3: '风险' }
  return map[level] || '未知'
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  }, 30)
}

const formatContent = (s) => {
  if (!s) return ''
  return String(s).replace(/\n/g, '<br>')
}

const formatMessageTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  const now = new Date()
  const minutes = Math.floor((now - date) / 60000)
  if (date.toDateString() === now.toDateString()) {
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

const formatTime = (t) => {
  if (!t) return ''
  return String(t).slice(0, 16).replace('T', ' ')
}

const formatDuration = (mins) => {
  if (!mins) return '0分钟'
  if (mins < 60) return mins + '分钟'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h + '小时' + (m ? m + '分钟' : '')
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

const createNewSession = () => {
  currentSession.value = {
    sessionId: `temp_${Date.now()}`,
    status: 'TEMP',
    sessionTitle: '新对话'
  }
  messages.value = []
}

const loadSessionEmotion = async (sessionId) => {
  if (!sessionId || String(sessionId).startsWith('temp_')) return
  try {
    const res = await getMoodAnalysis(getSessionKey(sessionId))
    const data = res.data || res
    if (data) currentEmotion.value = data
  } catch (_) {}
}

const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    const res = await getSessionPage({ pageNum: 1, pageSize: 10 })
    const page = res.data || {}
    sessions.value = page.records || []
  } catch (_) {
    sessions.value = []
  } finally {
    sessionsLoading.value = false
  }
}

const openSession = async (s) => {
  currentSession.value = {
    sessionId: getSessionKey(s.id),
    status: 'ACTIVE',
    sessionTitle: s.sessionTitle
  }
  try {
    const res = await getSessionMessages(s.id)
    messages.value = res.data || res || []
  } catch (_) {
    messages.value = []
  }
  loadSessionEmotion(s.id)
  scrollToBottom()
}

const handleDeleteSession = async (sessionId) => {
  try {
    await deleteSession(sessionId)
    ElMessage.success('删除成功')
    if (currentSession.value?.sessionId === getSessionKey(sessionId)) {
      createNewSession()
    }
    loadSessions()
  } catch (_) {}
}

const genMockReply = async (text) => {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 500))
  if (/难过|伤心|不开心|心情不好|想哭|崩溃/.test(text)) {
    return '听到您这样说，我能感受到您的难过。这种感受完全是可以理解的，每个人都会有情绪低落的时候。请记住，您不是一个人在面对这些。如果愿意的话，可以和我多说说发生了什么，我会一直在这里倾听。'
  }
  if (/焦虑|紧张|压力|担心|害怕/.test(text)) {
    return '焦虑和压力确实是让人感到沉重的负担。您可以先试着做一个简单的深呼吸：慢慢用鼻子吸气 4 秒，屏住呼吸 4 秒，再缓缓用嘴呼气 6 秒。重复几次，也许会让紧绷的感觉稍微缓解一些。您愿意和我分享具体是什么让您感到焦虑吗？'
  }
  if (/开心|高兴|快乐|幸福|好多了/.test(text)) {
    return '太好了！听到您这么开心我也由衷地为您感到高兴 🎉 积极情绪是会传染的。能分享一下是什么让您今天心情这么好吗？把这些美好时刻记录下来，以后回顾也会充满温暖。'
  }
  if (/生气|愤怒|烦躁|讨厌/.test(text)) {
    return '我理解您的感受。愤怒是一种非常自然的情绪，它告诉我们某些边界被触碰了。与其压抑这种感受，不如试着用健康的方式表达出来。您可以试着把让您生气的事情写下来，或者做一些体力活动来释放这种能量。'
  }
  if (/累|疲惫|没精神|睡眠/.test(text)) {
    return '疲惫确实会影响生活的方方面面。充足的休息对我们的心理健康至关重要。如果睡眠不好，可以尝试在睡前做一些放松活动，比如泡个热水澡、听听轻音乐，或者试试正念冥想。您最近的作息规律是怎样的呢？'
  }
  if (/孤独|寂寞|没人/.test(text)) {
    return '孤独感是非常真实且普遍的感受。有时候即使身边有很多人，我们仍然可能感到孤独。这说明您内心渴望更深层次的连接。我在这里陪着您，虽然我只是AI，但我真心愿意倾听您的每一句话。'
  }
  if (/迷茫|不知道|未来|方向/.test(text)) {
    return '迷茫是成长过程中的正常阶段。有时候我们不需要立刻找到所有的答案，允许自己有一段探索的时间也是很重要的。您要不要试着想象一下，如果没有任何限制，您最想过的生活是什么样的？'
  }
  if (/谢谢|感谢|有帮助/.test(text)) {
    return '您的感谢让我感到非常温暖！能够帮到您是我最开心的事。请记住，最重要的是您在为自己付出努力，我只是一个陪伴者和倾听者。希望您继续保持和自己的对话，每一天都更了解自己一点。'
  }
  const pool = [
    '我理解您的感受。有时候生活确实会让人感到不知所措，但请记住，您比自己想象的要坚强。我在这里，愿意倾听您的任何想法。',
    '谢谢您愿意和我分享这些。说出来的感受往往比闷在心里要好得多。您今天有没有什么特别想聊的话题呢？',
    '每个人的内心世界都是独一无二的，您的感受值得被认真对待。如果可以用一种颜色来形容您现在的心情，会是什么颜色呢？',
    '情绪就像天气，有时晴朗有时阴雨，但不管怎样都会过去。重要的是我们在这个过程中学会了如何照顾自己。',
    '您愿意花时间关注自己的心理健康，这本身就是一件非常勇敢的事情。今天有没有发生什么让您印象深刻的小事？'
  ]
  return pool[Math.floor(Math.random() * pool.length)]
}

const startAIResponse = (sessionId, userMessage) => {
  if (isAiTyping.value) return

  isAiTyping.value = true
  const aiMessage = {
    id: `ai_${Date.now()}`,
    senderType: 2,
    content: '',
    createdAt: new Date().toISOString()
  }
  messages.value.push(aiMessage)
  scrollToBottom()

  const ctrl = new AbortController()
  let usedMock = false

  fetchEventSource('/api/psychological-chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Token: localStorage.getItem('token') || '',
      Accept: 'text/event-stream'
    },
    body: JSON.stringify({ sessionId, userMessage }),
    signal: ctrl.signal,
    onmessage: (event) => {
      const raw = (event.data || '').trim()
      if (!raw) return

      if (event.event === 'done') {
        isAiTyping.value = false
        ctrl.abort()
        loadSessionEmotion(sessionId)
        return
      }

      try {
        const payload = JSON.parse(raw)
        const ok = String(payload.code) === '200'
        if (ok && payload.data?.content) {
          aiMessage.content += payload.data.content
          scrollToBottom()
        } else if (!ok) {
          handleStreamError(payload.message || 'AI 回复失败')
        }
      } catch (_) {}
    },
    onerror: async () => {
      if (!usedMock && !aiMessage.content) {
        usedMock = true
        aiMessage.content = await genMockReply(userMessage)
        isAiTyping.value = false
        scrollToBottom()
      } else {
        handleStreamError('连接失败，请稍后重试')
      }
      throw new Error('stream error')
    },
    onclose: () => {
      isAiTyping.value = false
      if (sessionId && !String(sessionId).startsWith('temp_')) {
        loadSessionEmotion(sessionId)
      }
    }
  }).catch(() => {
    if (!aiMessage.content) {
      genMockReply(userMessage).then((text) => {
        aiMessage.content = text
        isAiTyping.value = false
        scrollToBottom()
      })
    }
  })
}

const handleStreamError = (error) => {
  const aiMessage = messages.value[messages.value.length - 1]
  if (aiMessage) {
    aiMessage.content = 'AI 回复失败，请重试'
    aiMessage.isError = true
  }
  isAiTyping.value = false
  ElMessage.error(typeof error === 'string' ? error : 'AI 回复失败')
}

const startNewSession = (message) => {
  const sessionParams = {
    initialMessage: message,
    sessionTitle: currentSession.value?.sessionTitle === '新对话'
      ? `宁暖AI助手 - ${new Date().toLocaleString('zh-CN')}`
      : currentSession.value?.sessionTitle
  }

  createSession(sessionParams).then((res) => {
    const data = res.data || res
    const sessionData = {
      sessionId: data.sessionId || getSessionKey(data.id),
      status: data.status || 'ACTIVE',
      sessionTitle: sessionParams.sessionTitle
    }
    Object.assign(currentSession.value, sessionData)
    loadSessions()

    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createdAt: new Date().toISOString()
    })
    startAIResponse(sessionData.sessionId, message)
  }).catch(async () => {
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createdAt: new Date().toISOString()
    })
    const aiMessage = {
      id: `ai_${Date.now()}`,
      senderType: 2,
      content: await genMockReply(message),
      createdAt: new Date().toISOString()
    }
    messages.value.push(aiMessage)
    scrollToBottom()
  })
}

const send = () => {
  const text = inputText.value.trim()
  if (!text || isAiTyping.value) return

  if (isAiTyping.value) {
    ElMessage.error('AI 助手正在输入，请稍后再发送')
    return
  }

  inputText.value = ''

  if (!currentSession.value || currentSession.value.status === 'TEMP') {
    if (!currentSession.value) createNewSession()
    startNewSession(text)
    return
  }

  messages.value.push({
    id: Date.now(),
    senderType: 1,
    content: text,
    createdAt: new Date().toISOString()
  })
  scrollToBottom()
  startAIResponse(currentSession.value.sessionId, text)
}

onMounted(() => {
  loadSessions()
  createNewSession()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 285px);
}

.chat-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-assistant-card {
  background: linear-gradient(135deg, #fefefe 0%, #fff9f0 100%);
  border-radius: 18px;
  padding: 20px 16px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(251, 146, 60, 0.08);
  border: 1px solid rgba(251, 146, 60, 0.1);
}
.ai-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}
.assistant-name {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #fb923c, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 6px;
}
.online-status {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #059669;
  font-size: 12px;
  font-weight: 600;
}
.status-dot {
  width: 8px;
  height: 8px;
  background: #059669;
  border-radius: 50%;
  margin-right: 6px;
}

.mood-garden {
  background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 100%);
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
}
.garden-title {
  font-size: 14px;
  font-weight: 700;
  color: #8b4513;
  margin-bottom: 14px;
}
.garden-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.mood-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 154, 158, 0.4);
}
.mood-label { font-size: 13px; font-weight: 600; }
.mood-score { font-size: 20px; font-weight: 700; }
.mood-status { font-size: 13px; color: #8b7355; }
.status-value { font-weight: 600; margin-left: 6px; }
.intensity-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.intensity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e0e0;
}
.intensity-dot.active {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
}
.intensity-text { font-size: 12px; color: #8b7355; }
.mood-suggestion {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 12px;
  border-radius: 12px;
  width: 100%;
}
.suggestion-title { font-size: 12px; font-weight: 600; color: #f59e0b; margin-bottom: 4px; }
.suggestion-text { font-size: 12px; color: #78716c; line-height: 1.6; }
.healing-actions { width: 100%; }
.actions-title { font-size: 12px; font-weight: 600; color: #8b7355; margin-bottom: 8px; text-align: center; }
.action-item {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  color: #6b5b47;
  margin-bottom: 6px;
}
.risk-notice {
  background: linear-gradient(135deg, #fff9e6, #ffeaa7);
  border-radius: 12px;
  padding: 12px;
  width: 100%;
}
.notice-title { font-size: 13px; font-weight: 600; color: #d4840f; margin-bottom: 4px; }
.notice-text { font-size: 12px; color: #b8740c; line-height: 1.5; }

.history-section {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 18px 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.history-title { font-size: 14px; font-weight: 700; color: #333; margin-bottom: 10px; }
.history-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; }
.history-item {
  padding: 10px 12px;
  background: #fafaf9;
  border-radius: 10px;
  border-left: 3px solid #fb923c;
  cursor: pointer;
  transition: all .15s;
}
.history-item:hover { background: #fff7ed; }
.history-item.active { background: #ffedd5; }
.history-head { display: flex; justify-content: space-between; align-items: center; }
.history-name { font-size: 13px; font-weight: 600; color: #374151; }
.history-time { font-size: 11px; color: #a8a29e; margin: 4px 0; }
.history-content { font-size: 12px; color: #57534e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-meta { display: flex; gap: 10px; margin-top: 6px; font-size: 11px; color: #a8a29e; }
.history-meta span { display: inline-flex; align-items: center; gap: 2px; }
.history-empty { font-size: 12px; color: #a8a29e; text-align: center; padding: 20px 0; }

.chat-main {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 22px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px;
  background: linear-gradient(90deg, #fb923c 0%, #f59e0b 100%);
  color: #fff;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.header-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-header h3 { margin: 0; font-size: 16px; font-weight: 700; }
.header-sub { font-size: 12px; opacity: 0.9; }
.new-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  color: #fff !important;
}

.message-list {
  flex: 1;
  padding: 20px 22px 10px;
  overflow-y: auto;
  background: #fafaf9;
  min-height: 420px;
}
.message-row { margin-bottom: 14px; }
.bubble-assistant, .bubble-user {
  max-width: 80%;
  display: flex;
  flex-direction: column;
}
.bubble-assistant { align-items: flex-start; }
.bubble-user { margin-left: auto; align-items: flex-end; }
.bubble-inner {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.7;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.bubble-assistant .bubble-inner {
  background: #fff;
  border-top-left-radius: 4px;
  color: #374151;
  border: 1px solid #f1f5f9;
}
.bubble-user .bubble-inner {
  background: linear-gradient(135deg, #fb923c, #f59e0b);
  color: #fff;
  border-top-right-radius: 4px;
}
.bubble-time { font-size: 11px; color: #a8a29e; margin-top: 4px; padding: 0 4px; }
.error-text { color: #dc2626; }
.typing-bubble { display: flex; gap: 5px; }
.typing-bubble span {
  width: 8px;
  height: 8px;
  background: #d6d3d1;
  border-radius: 50%;
  animation: typing 1.2s infinite ease-in-out;
}
.typing-bubble span:nth-child(2) { animation-delay: .2s; }
.typing-bubble span:nth-child(3) { animation-delay: .4s; }
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid #f1f5f9;
  background: #fff;
  align-items: flex-end;
}
.quick-replies {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.quick-reply-chip {
  display: inline-block;
  padding: 5px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  font-size: 12px;
  color: #166534;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.quick-reply-chip:hover {
  background: #dcfce7;
  border-color: #86efac;
  transform: translateY(-1px);
}
.input-wrap { flex: 1; }
.input-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #a8a29e;
  margin-top: 4px;
}
.input-area :deep(.el-textarea__inner) {
  border-radius: 18px;
  padding: 10px 16px;
  background: #fafaf9;
  border-color: #e7e5e4;
  resize: none;
}
.send-btn {
  background: linear-gradient(135deg, #fb923c, #f59e0b) !important;
  color: #fff !important;
  flex-shrink: 0;
}
</style>
