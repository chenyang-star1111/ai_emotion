<template>
    <header class="navbar">
        <div class="navbar-left">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/back/dashboard' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="navbar-right">
            <el-dropdown>
                <span class="user-info">
                    <el-avatar :size="32" :src="avatarUrl" />
                    <span class="username">{{ username }}</span>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="goProfile">
                            <el-icon><User /></el-icon> 个人中心
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="logout">
                            <el-icon><SwitchButton /></el-icon> 退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { User, SwitchButton } from '@element-plus/icons-vue'
import { routes } from '@/router'
import avatarUrl from '@/assets/images/user.jpg'
const route = useRoute()
const router = useRouter()

const username = computed(() => {
  try { 
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
    return userInfo?.nickname || userInfo?.username || localStorage.getItem('username') || '管理员'
  } catch {
    return localStorage.getItem('username') || '管理员'
  }
})

const currentTitle = computed(() => {
  const backLayout = routes.find(r => r.path === '/back')
  if (!backLayout || !backLayout.children) return ''
  const matched = backLayout.children.find(c =>
    route.path === `/back/${c.path}` || c.path === route.path.replace(/^\/back\//, '')
  )
  return matched?.meta?.title || ''
})

const goProfile = () => {
  ElMessageBox.alert('个人中心功能开发中', '提示', { type: 'info' })
}

const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    localStorage.removeItem('token')
    localStorage.removeItem('roleType')
    localStorage.removeItem('username')
    router.push('/login')
  } catch (_) {}
}
</script>

<style scoped>
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 20px;
    height: 60px;
}

.navbar-left {
    display: flex;
    align-items: center;
}

.navbar-right {
    display: flex;
    align-items: center;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.username {
    font-size: 14px;
    color: #1f2937;
}
</style>
