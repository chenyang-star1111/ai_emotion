<template>
    <div class="consultations-container">
        <el-card class="toolbar">
            <div class="toolbar-left">
                <el-input v-model="query.keyword" placeholder="搜索会话/用户" clearable style="width:220px" @keyup.enter="loadList" />
                <el-button type="primary" @click="loadList"><el-icon><Search /></el-icon>搜索</el-button>
            </div>
        </el-card>

        <el-card class="table-card">
            <el-table :data="list" v-loading="loading" stripe>
                <el-table-column label="ID" prop="id" width="90" />
                <el-table-column label="用户" width="140">
                    <template #default="{ row }">
                        <div class="user-cell">
                            <el-avatar :size="32" :src="defaultAvatar" />
                            <span style="margin-left:8px;">{{ row.userNickname || ('用户' + row.userId) }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="会话标题" prop="sessionTitle" min-width="220" show-overflow-tooltip />
                <el-table-column label="消息数" prop="messageCount" width="80" />
                <el-table-column label="时长(分)" prop="durationMinutes" width="90" />
                <el-table-column label="最后消息" min-width="180" show-overflow-tooltip>
                    <template #default="{ row }">{{ row.lastMessageContent || '—' }}</template>
                </el-table-column>
                <el-table-column label="创建时间" prop="startedAt" width="160" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" @click="openDetail(row)">查看详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-wrapper">
                <el-pagination
                    v-model:current-page="query.currentPage"
                    v-model:page-size="query.size"
                    :total="total"
                    layout="total, prev, pager, next"
                    @current-change="loadList"
                />
            </div>
        </el-card>

        <el-dialog v-model="detailVisible" title="咨询会话详情" width="720px" top="5vh" destroy-on-close>
            <div v-if="current" class="session-detail">
                <div class="detail-header">
                    <div class="detail-row"><span class="detail-label">会话标题：</span><span class="detail-value">{{ current.sessionTitle }}</span></div>
                    <div class="detail-row"><span class="detail-label">用户：</span><span class="detail-value">{{ current.userNickname }}</span></div>
                    <div class="detail-row"><span class="detail-label">开始时间：</span><span class="detail-value">{{ current.startedAt }}</span></div>
                    <div class="detail-row"><span class="detail-label">消息数：</span><span class="detail-value">{{ current.messageCount }}</span></div>
                    <div class="detail-row"><span class="detail-label">时长：</span><span class="detail-value">{{ current.durationMinutes }} 分钟</span></div>
                    <div class="detail-row"><span class="detail-label">最后消息时间：</span><span class="detail-value">{{ current.lastMessageTime }}</span></div>
                    <div class="detail-row"><span class="detail-label">最后消息：</span><span class="detail-value">{{ current.lastMessageContent }}</span></div>
                </div>
                <div class="messages-container">
                    <div class="messages-header"><h4>最近一条消息</h4></div>
                    <div class="messages-list">
                        <div class="message-item ai-message">
                            <div class="message-header">
                                <span class="sender"><el-avatar :size="24" :src="robotAvatar" />AI助手</span>
                                <span class="time">{{ current.lastMessageTime }}</span>
                            </div>
                            <div class="message-content">{{ current.lastMessageContent }}</div>
                        </div>
                        <div class="message-item user-message">
                            <div class="message-header">
                                <span class="sender"><el-avatar :size="24" :src="defaultAvatar" />{{ current.userNickname }}</span>
                                <span class="time">{{ current.startedAt }}</span>
                            </div>
                            <div class="message-content">本次会话消息 {{ current.messageCount }} 条，最新一条如上。</div>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getSessionPage } from '@/api'

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const robotAvatar = 'https://img.alicdn.com/imgextra/i3/O1CN01E6Z4y21D1t3lO7x7o_!!6000000007715-0-tps-64-64.jpg'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ currentPage: 1, size: 10, keyword: '' })
const detailVisible = ref(false)
const current = ref(null)

const openDetail = (row) => {
    current.value = row
    detailVisible.value = true
}

const loadList = async () => {
    loading.value = true
    try {
        const params = { currentPage: query.currentPage, size: query.size }
        if (query.keyword) params.keyword = query.keyword
        const res = await getSessionPage(params)
        const d = res.data || {}
        list.value = d.records || []
        total.value = d.total || 0
    } catch {
        list.value = []
        total.value = 0
    } finally { loading.value = false }
}

loadList()
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-radius: 8px; }
.toolbar-left { display: flex; gap: 10px; align-items: center; }
.table-card { border-radius: 8px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
.user-cell { display: flex; align-items: center; }
.session-detail { max-height: 70vh; overflow-y: auto; }
.detail-header { margin-bottom: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; }
.detail-row { display: flex; margin-bottom: 8px; }
.detail-row:last-child { margin-bottom: 0; }
.detail-label { color: #495057; min-width: 110px; }
.detail-value { color: #333; flex: 1; }
.messages-container { margin-top: 20px; }
.messages-header h4 { margin: 0 0 16px; color: #333; }
.messages-list { max-height: 400px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; background: #fff; }
.message-item { margin-bottom: 12px; padding: 12px; border-radius: 8px; background: #f8f9fa; border: 1px solid #e9ecef; }
.message-item:last-child { margin-bottom: 0; }
.message-item.user-message { background: #e8f4fd; }
.message-item.ai-message { background: #f0f9f0; }
.message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.sender { display: flex; align-items: center; gap: 6px; color: #333; font-weight: 500; }
.time { font-size: 12px; color: #999; }
.message-content { color: #333; line-height: 1.6; white-space: pre-wrap; font-size: 14px; }
</style>
