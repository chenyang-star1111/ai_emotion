<template>
  <div class="frontend-layout">
    <nav class="navbar-container">
      <div class="brand-section" @click="$router.push('/home')" style="cursor:pointer;">
        <el-image class="brand-logo" :src="iconUrl" fit="contain" />
        <span class="brand-name">心理健康AI助手</span>
      </div>
      <div class="nav-section">
        <router-link class="nav-link" to="/home">首页</router-link>
        <router-link class="nav-link" to="/chat">AI咨询</router-link>
        <router-link class="nav-link" to="/mood">情绪日记</router-link>
        <router-link class="nav-link" to="/knowledge">知识库</router-link>
      </div>
      <div class="auth-section">
        <template v-if="!token">
          <el-button @click="$router.push('/login')">登录</el-button>
          <el-button type="primary" @click="$router.push('/register')">注册</el-button>
        </template>
        <template v-else>
          <el-dropdown trigger="click">
            <el-button type="text" class="user-btn">
              <el-avatar :size="32" :src="avatarUrl" />
              <span class="username">{{ nickname }}</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">
                  <el-icon><User /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item v-if="isAdmin" @click="$router.push('/back/dashboard')">
                  <el-icon><Monitor /></el-icon> 管理后台
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><ArrowRight /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </nav>

    <main class="main-area">
      <router-view />
    </main>

    <footer class="footer-container">
      <div class="footer-bottom">© 2025 心理健康AI助手 | 用心守护每一份情绪</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { User, Monitor, ArrowRight } from '@element-plus/icons-vue'
import { useEmotionStore } from '@/stores/emotion'
import iconUrl from '@/assets/images/robot.png'
const avatarUrl = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const store = useEmotionStore()
const route = useRoute()

// 使用 ref 而非 computed，因为 localStorage 不是响应式的
const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('roleType'))
const userInfo = ref((() => { try { return JSON.parse(localStorage.getItem('userInfo') || 'null') } catch { return null } })())

// 路由变化时同步 localStorage 状态（登录 / 退出后导航）
watch(() => route.path, () => {
  token.value = localStorage.getItem('token')
  role.value = localStorage.getItem('roleType')
  try { userInfo.value = JSON.parse(localStorage.getItem('userInfo') || 'null') } catch { userInfo.value = null }
})

const nickname = computed(() => userInfo.value?.nickname || userInfo.value?.username || '用户')
const isAdmin = computed(() => role.value === '2')

const goProfile = () => {
  ElMessageBox.alert('个人中心功能开发中', '提示', { type: 'info' })
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('roleType')
  localStorage.removeItem('userInfo')
  location.href = '/home'
}

onMounted(() => {
  store.loadFromStorage()
})
</script>

<style scoped>
.frontend-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fff;
}
.navbar-container {
  max-width: 1200px;
  height: 70px;
  margin: 0 auto;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  width: 100%;
  position: relative;
  z-index: 100;
}
.brand-section { display: flex; align-items: center; gap: 10px; }
.brand-logo { width: 44px; height: 44px; }
.brand-name { font-size: 22px; font-weight: 600; color: #2d3436; }
.nav-section { display: flex; align-items: center; gap: 40px; }
.nav-link { color: #4b5563; font-size: 16px; font-weight: 500; padding: 4px 0; position: relative; }
.nav-link.router-link-active { color: #4a908c; font-weight: 600; }
.auth-section { display: flex; align-items: center; gap: 8px; }
.user-btn { display: flex; align-items: center; gap: 8px; padding: 0; margin: 0; }
.user-btn:hover { background: transparent; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.username { font-size: 14px; color: #1f2937; font-weight: 500; }
.main-area { flex: 1; width: 100%; }
.footer-container { background: #1f2937; color: #fff; padding: 18px 0; margin-top: auto; }
.footer-bottom { max-width: 1200px; margin: 0 auto; padding: 0 20px; text-align: center; font-size: 13px; opacity: 0.85; }
</style>
