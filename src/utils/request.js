import axios from 'axios'
import { ElMessage } from 'element-plus'

// JSON API 请求实例 (新浪K线、东方财富)
export const jsonRequest = axios.create({
  timeout: 15000,
  responseType: 'json'
})

// 文本 API 请求实例 (新浪行情、腾讯搜索)
export const textRequest = axios.create({
  timeout: 15000,
  responseType: 'text',
  transformResponse: [(data) => data]
})

const handleError = (error) => {
  const msg = error.response
    ? `请求失败: ${error.response.status}`
    : error.message === 'Network Error'
      ? '网络错误，请检查网络连接'
      : '请求超时，请稍后重试'
  ElMessage.error(msg)
  return Promise.reject(error)
}

jsonRequest.interceptors.response.use((res) => res, handleError)
textRequest.interceptors.response.use((res) => res, handleError)
