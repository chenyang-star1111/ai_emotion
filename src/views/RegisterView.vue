<template>
  <div class="login-register-wrapper">
    <div class="left-section">
      <div class="content">
        <div class="robot">
          <el-image :src="iconUrl" fit="contain" style="width:80px;height:80px;" />
        </div>
        <div class="title">开启心灵旅程</div>
        <div class="text">注册心理健康AI助手账号，让AI陪伴你的每一天</div>
      </div>
    </div>
    <div class="right-section">
      <div class="login-card">
        <h2 class="card-title">新用户注册</h2>
        <p class="card-sub">请填写以下信息完成注册</p>
        <el-form :model="form" @submit.prevent="handleSubmit">
          <el-form-item>
            <el-input v-model="form.username" placeholder="用户名" size="large">
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.email" placeholder="邮箱" size="large">
              <template #prefix><el-icon><Message /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.nickname" placeholder="昵称" size="large">
              <template #prefix><el-icon><Postcard /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.phone" placeholder="手机号（选填）" size="large">
              <template #prefix><el-icon><Phone /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-select v-model="form.gender" placeholder="性别" size="large">
              <el-option label="男" :value="1" />
              <el-option label="女" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="密码" show-password size="large">
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" show-password size="large">
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="submit-btn" :loading="submitting" @click="handleSubmit">立即注册</el-button>
          </el-form-item>
          <div class="footer-links">
            <router-link to="/login">已有账号？去登录</router-link>
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
import { User, Message, Postcard, Phone, Lock } from '@element-plus/icons-vue'
import { registerApi } from '@/api'
import iconUrl from '@/assets/images/robot.png'

const router = useRouter()
const form = reactive({ 
  username: '', 
  email: '', 
  nickname: '', 
  phone: '', 
  gender: 0, 
  password: '', 
  confirmPassword: '' 
})
const submitting = ref(false)

const handleSubmit = async () => {
  if (!form.username) return ElMessage.warning('请填写用户名')
  if (!form.email) return ElMessage.warning('请填写邮箱')
  if (!form.gender) return ElMessage.warning('请选择性别')
  if (!form.password) return ElMessage.warning('请填写密码')
  if (form.password !== form.confirmPassword) return ElMessage.warning('两次密码不一致')
  if (form.password.length < 6) return ElMessage.warning('密码至少6位')
  submitting.value = true
  try {
    const res = await registerApi({
      username: form.username,
      email: form.email,
      nickname: form.nickname || form.username,
      phone: form.phone,
      gender: form.gender,
      password: form.password,
      confirmPassword: form.confirmPassword,
      userType: 1
    })
    const d = res.data || {}
    localStorage.setItem('token', d.token || '')
    localStorage.setItem('roleType', String(d.roleType || '1'))
    if (d.userInfo) localStorage.setItem('userInfo', JSON.stringify(d.userInfo))
    ElMessage.success('注册成功')
    router.push('/home')
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.data?.msg || e?.message || '注册失败'
    ElMessage.error(msg)
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
  justify-content: flex-end;
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
