<template>
    <aside class="sidebar">
        <div class="brand">
            <el-image class="brand-logo" :src="iconUrl" fit="contain" />
            <div class="brand-info">
                <h1 class="brand-title">心理健康AI助手</h1>
                <p class="brand-subtitle">管理后台</p>
            </div>
        </div>

        <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            router
            background-color="#ffffff"
            text-color="#334155"
            active-text-color="#409eff"
        >
            <el-menu-item 
                v-for="item in menuItems"
                :key="item.path"
                :index="`/back/${item.path}`"
            >
                <el-icon><component :is="item.meta.icon" /></el-icon>
                <span>{{ item.meta.title }}</span>
            </el-menu-item>
        </el-menu>
    </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { routes } from '@/router'
import iconUrl from '@/assets/images/robot.png'
const route = useRoute()

const menuItems = computed(() => {
  const backLayout = routes.find(r => r.path === '/back')
  return backLayout ? (backLayout.children || []) : []
})

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar {
    width: 220px;
    flex-shrink: 0;
    background-color: #ffffff;
    border-right: 1px solid #e5e7eb;
    height: 100%;
    overflow-y: auto;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 16px;
    border-bottom: 1px solid #e5e7eb;
}

.brand-logo {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}

.brand-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.brand-title {
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.brand-subtitle {
    font-size: 12px;
    color: #6b7280;
    margin: 2px 0 0;
}

.sidebar-menu {
    border-right: none;
}
</style>
