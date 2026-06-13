<template>
  <div class="login-register-wrapper">
    <div class="left-section">
      <div class="content">
        <div class="robot">
          <el-image :src="iconUrl" fit="contain" style="width:80px;height:80px;" />
        </div>
        <div class="title">欢迎回来</div>
        <div class="text">登录心理健康AI助手，开始关爱自己的每一天</div>
      </div>
    </div>
    <div class="right-section">
      <div class="login-card">
        <h2 class="card-title">账号登录</h2>
        <p class="card-sub">请输入您的账号信息</p>
        <el-form :model="form" @submit.prevent="handleSubmit">
          <el-form-item>
            <el-input v-model="form.username" placeholder="请输入用户名" size="large">
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password size="large">
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="submit-btn" :loading="submitting" @click="handleSubmit">登录</el-button>
          </el-form-item>
          <div class="footer-links">
            <router-link to="/register">没有账号？去注册</router-link>
            <router-link to="/back/dashboard">管理端</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { loginApi } from '@/api'
import iconUrl from '@/assets/images/robot.png'
const router = useRouter()
const form = reactive({ username: '', password: '' })
const submitting = ref(false)

const handleSubmit = async () => {
  if (!form.username || !form.password) {
    return ElMessage.warning('请输入用户名和密码')
  }
  submitting.value = true
  try {
    const res = await loginApi({ username: form.username, password: form.password })
    const d = res.data || {}
    localStorage.setItem('token', d.token || '')
    localStorage.setItem('roleType', String(d.roleType || '1'))
    if (d.userInfo) localStorage.setItem('userInfo', JSON.stringify(d.userInfo))
    ElMessage.success('登录成功')
    const role = String(d.roleType || '1')
    if (role === '2') {
      router.push('/back/dashboard')
    } else {
      router.push('/home')
    }
  } catch (e) {
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-register-wrapper {
  display: flex;
  min-height: calc(100vh - 70px - 60px);
}
.left-section {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  background: linear-gradient(90deg, rgb(74, 156, 140) 0%, rgb(61, 138, 122) 100%) rgba(74, 156, 140, 0.95);
}
.left-section .content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.left-section .robot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  margin-bottom: 30px;
}
.left-section .title {
  font-size: 38px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
}
.left-section .text {
  width: 460px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.6;
}
.right-section {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  background-color: #fff;
  padding: 40px 20px;
}
.login-card {
  width: 384px;
}
.card-title {
  font-size: 32px;
  margin-bottom: 8px;
  color: #1f2937;
}
.card-sub {
  color: #9ca3af;
  margin-bottom: 28px;
  font-size: 14px;
}
.submit-btn {
  width: 100%;
}
.footer-links {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 13px;
}
.footer-links a {
  color: #4a908c;
}
.footer-links a:hover {
  text-decoration: underline;
}
</style>
