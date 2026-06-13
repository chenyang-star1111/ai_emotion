import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = undefined
    }
    config._silent = !!config._silent
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res === null || res === undefined || typeof res !== 'object') {
      return response.data
    }
    const code = Number(res.code)
    if (isNaN(code)) {
      return res
    }
    if (code !== 200) {
      if (!response.config._silent) {
        ElMessage.error(res.message || res.msg || '请求失败')
      }
      return Promise.reject(new Error(res.message || res.msg || '请求失败'))
    }
    return res
  },
  (error) => {
    let msg = error.message || '网络错误'
    if (error.response) {
      if (error.response.data) {
        if (typeof error.response.data === 'object') {
          msg = error.response.data.message || error.response.data.msg || msg
        } else if (typeof error.response.data === 'string') {
          msg = error.response.data
        }
      }
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        if (!location.hash.includes('/login')) {
          location.hash = '#/login'
        }
      }
    }
    const cfg = error.config || {}
    if (!cfg._silent) {
      ElMessage.error(msg)
    }
    return Promise.reject(error)
  }
)

export default request
