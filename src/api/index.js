import request from '@/utils/request'

export const loginApi = (data) => request.post('/user/login', data)
export const registerApi = (data) => request.post('/user/add', data)

export const getOverview = () => request.get('/data-analytics/overview')

export const getCategoryTree = () => request.get('/knowledge/category/tree')
export const getArticlePage = (params) => request.get('/knowledge/article/page', { params: { sortField: 'createTime', sortDirection: 'desc', currentPage: 1, size: 10, ...params } })
export const getArticleDetail = (id) => request.get(`/knowledge/article/${id}`)
export const createArticle = (data) => request.post('/knowledge/article', data)
export const updateArticle = (id, data) => request.put(`/knowledge/article/${id}`, data)
export const deleteArticle = (id) => request.delete(`/knowledge/article/${id}`)
export const updateArticleStatus = (id, status) => request.put(`/knowledge/article/${id}/status`, { status })

export const getSessionPage = (params) => request.get('/psychological-chat/sessions', { params: { pageNum: 1, pageSize: 10, ...params } })
export const getSessionMessages = (sessionId) => request.get(`/psychological-chat/sessions/${sessionId}/messages`)
export const createSession = (data) => request.post('/psychological-chat/session/start', data)
export const sendMessage = (data) => request.post('/psychological-chat/chat', data)
export const sendMessageStream = (data) => request.post('/api/psychological-chat/stream', data, { headers: { 'Accept': 'text/event-stream' }, responseType: 'stream' })
export const getMoodAnalysis = (sessionId) => request.get(`/psychological-chat/session/${sessionId}/emotion`)
export const deleteSession = (id) => request.delete(`/psychological-chat/sessions/${id}`)

export const getDiaryAdminPage = (params) => request.get('/emotion-diary/admin/page', { params })
export const getMyDiaries = () => request.get('/emotion-diary/mine', { _silent: true })
export const saveDiary = (data) => request.post('/emotion-diary', data)
export const deleteDiary = (id) => request.delete(`/emotion-diary/admin/${id}`)

export const uploadFile = (data) => request.post('/file/upload', data)
export const logoutApi = () => request.post('/user/logout')
