import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

const STORAGE_KEY = 'screening_stocks'
const MAX_TRADING_DAYS = 5

/**
 * 获取最近N个交易日日期（简化版：排除周末）
 * @param {number} days - 天数
 * @returns {string[]} 日期数组 (YYYY-MM-DD)
 */
function getRecentTradingDays(days = 5) {
  const dates = []
  const today = new Date()
  let count = 0
  let offset = 0

  while (count < days) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const dayOfWeek = date.getDay()
    // 排除周末 (0=周日, 6=周六)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(date.toISOString().split('T')[0])
      count++
    }
    offset++
  }
  return dates
}

export const useScreeningStore = defineStore('screening', () => {
  // State
  const screeningData = ref(storage.local.get(STORAGE_KEY) || {})

  // Getters
  const recentTradingDays = computed(() => getRecentTradingDays(MAX_TRADING_DAYS))

  const currentDate = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return recentTradingDays.value.includes(today) ? today : recentTradingDays.value[0]
  })

  const selectedDate = ref(currentDate.value)

  const currentStocks = computed(() => {
    return screeningData.value[selectedDate.value] || []
  })

  // Actions
  const saveToStorage = () => {
    storage.local.set(STORAGE_KEY, screeningData.value)
  }

  // 清理过期数据
  const cleanupOldData = () => {
    const validDates = new Set(recentTradingDays.value)
    const newData = {}

    Object.keys(screeningData.value).forEach(date => {
      if (validDates.has(date)) {
        newData[date] = screeningData.value[date]
      }
    })

    screeningData.value = newData
    saveToStorage()
  }

  // 添加股票
  const addStock = (stock, date = currentDate.value) => {
    cleanupOldData()

    if (!screeningData.value[date]) {
      screeningData.value[date] = []
    }

    // 检查是否已存在
    const exists = screeningData.value[date].some(s => s.symbol === stock.symbol)
    if (exists) {
      return { success: false, message: '该股票已在今日筛选列表中' }
    }

    const newStock = {
      ...stock,
      id: `${stock.symbol}_${Date.now()}`,
      addedAt: new Date().toISOString()
    }

    screeningData.value[date].push(newStock)
    saveToStorage()

    return { success: true, message: '添加成功' }
  }

  // 删除股票
  const removeStock = (stockId, date = selectedDate.value) => {
    if (!screeningData.value[date]) return

    screeningData.value[date] = screeningData.value[date].filter(s => s.id !== stockId)

    if (screeningData.value[date].length === 0) {
      delete screeningData.value[date]
    }

    saveToStorage()
  }

  // 设置选中日期
  const setSelectedDate = (date) => {
    selectedDate.value = date
  }

  // 检查是否已添加
  const isStockAdded = (symbol, date = currentDate.value) => {
    const stocks = screeningData.value[date] || []
    return stocks.some(s => s.symbol === symbol)
  }

  // 初始化清理
  cleanupOldData()

  return {
    screeningData,
    recentTradingDays,
    currentDate,
    selectedDate,
    currentStocks,
    addStock,
    removeStock,
    setSelectedDate,
    isStockAdded
  }
})
