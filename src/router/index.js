import { createRouter, createWebHistory } from 'vue-router'
import FrontendLayout from '@/components/FrontendLayout.vue'
import BackendLayout from '@/components/BackendLayout.vue'

const routes = [
    {
        path: '/',
        component: FrontendLayout,
        redirect: '/home',
        children: [
            {
                path: 'home',
                component: () => import('@/views/HomeView.vue'),
                meta: { title: '首页' }
            },
            {
                path: 'knowledge',
                component: () => import('@/views/KnowledgeListView.vue'),
                meta: { title: '心理健康知识库' }
            },
            {
                path: 'knowledge/:id',
                component: () => import('@/views/ArticleDetailView.vue'),
                meta: { title: '文章详情' }
            },
            {
                path: 'chat',
                component: () => import('@/views/ChatView.vue'),
                meta: { title: 'AI 心理咨询' }
            },
            {
                path: 'mood',
                component: () => import('@/views/MoodView.vue'),
                meta: { title: '情绪日记' }
            },
            {
                path: 'register',
                component: () => import('@/views/RegisterView.vue'),
                meta: { title: '注册', public: true }
            },
            {
                path: 'login',
                component: () => import('@/views/LoginView.vue'),
                meta: { title: '登录', public: true }
            }
        ]
    },
    {
        path: '/back',
        component: BackendLayout,
        redirect: '/back/dashboard',
        children: [
            {
                path: 'dashboard',
                component: () => import('@/views/dashboard.vue'),
                meta: { title: '数据分析', icon: 'PieChart' }
            },
            {
                path: 'knowledge',
                component: () => import('@/views/knowledge.vue'),
                meta: { title: '知识文章', icon: 'Reading' }
            },
            {
                path: 'consultations',
                component: () => import('@/views/consultations.vue'),
                meta: { title: '咨询记录', icon: 'ChatDotRound' }
            },
            {
                path: 'emotional',
                component: () => import('@/views/emotional.vue'),
                meta: { title: '情绪日志', icon: 'User' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('roleType')
    if (to.meta.title) {
        document.title = `${to.meta.title} - 心理健康AI助手`
    }
    if (to.meta.public) {
        next()
    } else if (to.path.startsWith('/back') && !token) {
        next('/login')
    } else if (to.path.startsWith('/back') && role && role !== '2') {
        next('/home')
    } else {
        next()
    }
})

const backendRoutes = routes.find(r => r.path === '/back')?.children || []

export { routes, backendRoutes }
export default router
