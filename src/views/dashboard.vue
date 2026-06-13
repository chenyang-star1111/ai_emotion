<template>
    <div class="dashboard-container">
        <el-row :gutter="20">
            <el-col :span="6" v-for="card in cards" :key="card.key">
                <el-card shadow="hover" class="stat-card">
                    <div class="card-content">
                        <div class="avatar" :class="card.key">
                            <el-icon :size="32" color="#fff"><component :is="card.icon" /></el-icon>
                        </div>
                        <div class="info">
                            <div class="title">{{ card.label }}</div>
                            <div class="value">{{ stats[card.key] ?? '--' }}</div>
                            <div class="subtitle-title">较昨日 {{ card.tip }}</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="chart-row">
            <el-col :span="12">
                <el-card class="chart-card">
                    <div class="chart-header"><span class="chart-title">情绪趋势分析</span></div>
                    <div class="chart-content"><div ref="moodChart" style="width:100%;height:300px;"></div></div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card class="chart-card">
                    <div class="chart-header"><span class="chart-title">咨询活动统计</span></div>
                    <div class="chart-content"><div ref="consultChart" style="width:100%;height:300px;"></div></div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="chart-row">
            <el-col :span="24">
                <el-card class="chart-card">
                    <div class="chart-header"><span class="chart-title">用户活跃度趋势</span></div>
                    <div class="chart-content"><div ref="activityChart" style="width:100%;height:300px;"></div></div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getOverview } from '@/api'

const cards = [
    { key: 'totalUsers', label: '总用户数', icon: 'User', tip: '+42 新增' },
    { key: 'totalDiaries', label: '日记总数', icon: 'Document', tip: '+6 新增' },
    { key: 'totalSessions', label: '咨询会话', icon: 'ChatLineSquare', tip: '+57 新增' },
    { key: 'avgMoodScore', label: '平均情绪分', icon: 'Promotion', tip: '满分10' }
]

const stats = reactive({ totalUsers: 0, totalDiaries: 0, totalSessions: 0, avgMoodScore: 0 })

const moodChart = ref(null)
const consultChart = ref(null)
const activityChart = ref(null)
let moodInstance, consultInstance, activityInstance

const setMoodChart = (data) => {
    const filtered = data.filter(i => i.recordCount > 0 || i.avgMoodScore > 0)
    moodInstance = echarts.init(moodChart.value)
    moodInstance.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['平均情绪评分', '记录数量'], top: 10 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: 50, containLabel: true },
        xAxis: { type: 'category', data: filtered.map(i => i.date.slice(5)) },
        yAxis: [
            { type: 'value', name: '情绪评分', min: 0, max: 10 },
            { type: 'value', name: '记录数量' }
        ],
        series: [
            { name: '平均情绪评分', type: 'line', smooth: true, lineStyle: { width: 3, color: '#ffeaa7' }, itemStyle: { color: '#ffeaa7' }, data: filtered.map(i => i.avgMoodScore) },
            { name: '记录数量', type: 'line', smooth: true, lineStyle: { width: 3, color: '#fab1a0' }, itemStyle: { color: '#fab1a0' }, yAxisIndex: 1, data: filtered.map(i => i.recordCount) }
        ]
    })
}

const setConsultChart = (data) => {
    consultInstance = echarts.init(consultChart.value)
    consultInstance.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['会话数量', '参与用户数'], top: 10 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: 50, containLabel: true },
        xAxis: { type: 'category', data: data.map(i => i.date.slice(5)) },
        yAxis: { type: 'value' },
        series: [
            { name: '会话数量', type: 'bar', barWidth: '40%', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#74b9ff' }, { offset: 1, color: '#0984e3' }] } }, data: data.map(i => i.sessionCount) },
            { name: '参与用户数', type: 'bar', barWidth: '40%', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#fdcb6e' }, { offset: 1, color: '#f39c12' }] } }, data: data.map(i => i.userCount) }
        ]
    })
}

const setActivityChart = (data) => {
    activityInstance = echarts.init(activityChart.value)
    activityInstance.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['活跃用户', '新增用户', '咨询用户', '日记用户'], top: 10 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: 50, containLabel: true },
        xAxis: { type: 'category', data: data.map(i => i.date.slice(5)) },
        yAxis: { type: 'value' },
        series: [
            { name: '活跃用户', type: 'line', smooth: true, lineStyle: { width: 3, color: '#a29bfe' }, itemStyle: { color: '#a29bfe' }, areaStyle: { color: 'rgba(162,155,254,0.2)' }, data: data.map(i => i.activeUsers) },
            { name: '新增用户', type: 'line', smooth: true, lineStyle: { width: 3, color: '#fdcb6e' }, itemStyle: { color: '#fdcb6e' }, data: data.map(i => i.newUsers) },
            { name: '咨询用户', type: 'line', smooth: true, lineStyle: { width: 3, color: '#fab1a0' }, itemStyle: { color: '#fab1a0' }, data: data.map(i => i.consultationUsers) },
            { name: '日记用户', type: 'line', smooth: true, lineStyle: { width: 3, color: '#00b894' }, itemStyle: { color: '#00b894' }, data: data.map(i => i.diaryUsers) }
        ]
    })
}

const loadAll = async () => {
    try {
        const res = await getOverview()
        const d = res.data
        const ov = d.systemOverview || {}
        stats.totalUsers = ov.totalUsers ?? 0
        stats.totalDiaries = ov.totalDiaries ?? 0
        stats.totalSessions = ov.totalSessions ?? 0
        stats.avgMoodScore = ov.avgMoodScore ?? 0
        await nextTick()
        const trend = d.emotionTrend || []
        const consult = d.consultationStats?.dailyTrend || []
        const activity = d.userActivity || []
        if (trend.length) setMoodChart(trend)
        if (consult.length) setConsultChart(consult)
        if (activity.length) setActivityChart(activity)
    } catch (e) {
        console.warn('dashboard load fail', e)
    }
}

const handleResize = () => { moodInstance?.resize(); consultInstance?.resize(); activityInstance?.resize() }

onMounted(() => loadAll())
onMounted(() => window.addEventListener('resize', handleResize))
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    moodInstance?.dispose(); consultInstance?.dispose(); activityInstance?.dispose()
})
</script>

<style scoped>
.dashboard-container { padding: 0; }
.stat-card { border-radius: 8px; }
.card-content { display: flex; align-items: center; }
.avatar { margin-right: 16px; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.avatar.totalUsers { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.avatar.totalDiaries { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.avatar.totalSessions { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.avatar.avgMoodScore { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.info .title { font-size: 14px; color: #7f8c8d; margin-bottom: 4px; }
.info .value { font-size: 26px; font-weight: 700; color: #2c3e50; margin-bottom: 4px; }
.info .subtitle-title { font-size: 12px; color: #95a5a6; }
.chart-row { margin-top: 20px; }
.chart-card { border-radius: 8px; }
.chart-header { margin-bottom: 8px; }
.chart-title { font-size: 16px; font-weight: 600; color: #2d3436; }
.chart-content { height: 300px; }
</style>
