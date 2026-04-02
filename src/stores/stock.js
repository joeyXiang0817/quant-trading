import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getKLineData } from '@/api/kline'
import { getStockSnapshot } from '@/api/realtime'
import { calculateAllIndicators } from '@/utils/indicators'
import { generateAllSignals, getCompositeSignal } from '@/utils/signals'
import { useSettingsStore } from './settings'
import { PERIODS } from '@/utils/constants'

export const useStockStore = defineStore('stock', () => {
  const currentSymbol = ref(null)
  const currentStockInfo = ref(null)
  const klineData = ref([])
  const klinePeriod = ref('daily')
  const indicators = ref(null)
  const signals = ref([])
  const compositeSignal = ref(null)
  const loading = ref(false)
  const error = ref(null)
  let refreshTimer = null

  const closes = computed(() => klineData.value.map(d => d.close))
  const dates = computed(() => klineData.value.map(d => d.day))

  async function setSymbol(symbol) {
    currentSymbol.value = symbol
    await fetchAll()
  }

  async function setPeriod(period) {
    klinePeriod.value = period
    await fetchKLine()
  }

  async function fetchKLine() {
    if (!currentSymbol.value) return
    loading.value = true
    error.value = null
    try {
      const periodConf = PERIODS.find(p => p.value === klinePeriod.value)
      const scale = periodConf ? periodConf.scale : 240
      klineData.value = await getKLineData(currentSymbol.value, scale, 300)
      if (klineData.value.length) {
        computeIndicators()
        computeSignals()
      }
    } catch (e) {
      error.value = '获取K线数据失败'
    } finally {
      loading.value = false
    }
  }

  async function fetchRealtimeQuote() {
    if (!currentSymbol.value) return
    currentStockInfo.value = await getStockSnapshot(currentSymbol.value)
  }

  function computeIndicators() {
    const settingsStore = useSettingsStore()
    indicators.value = calculateAllIndicators(klineData.value, settingsStore.getIndicatorParams())
  }

  function computeSignals() {
    const settingsStore = useSettingsStore()
    signals.value = generateAllSignals(klineData.value, indicators.value, settingsStore.signalStrategies)
    compositeSignal.value = getCompositeSignal(signals.value, 5, klineData.value.length)
  }

  async function fetchAll() {
    await Promise.all([fetchKLine(), fetchRealtimeQuote()])
  }

  function startAutoRefresh() {
    stopAutoRefresh()
    refreshTimer = setInterval(fetchRealtimeQuote, 10000)
  }

  function stopAutoRefresh() {
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
  }

  return {
    currentSymbol, currentStockInfo, klineData, klinePeriod,
    indicators, signals, compositeSignal, loading, error,
    closes, dates,
    setSymbol, setPeriod, fetchKLine, fetchRealtimeQuote,
    computeIndicators, computeSignals, fetchAll,
    startAutoRefresh, stopAutoRefresh
  }
})
