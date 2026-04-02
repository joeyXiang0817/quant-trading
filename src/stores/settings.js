import { ref } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { DEFAULT_INDICATOR_PARAMS } from '@/utils/constants'

export const useSettingsStore = defineStore('settings', () => {
  const defaultPeriod = ref(storage.local.get('settings_period') || 'daily')
  const enabledIndicators = ref(storage.local.get('settings_indicators') || ['MA', 'MACD', 'VOL'])
  const signalStrategies = ref(storage.local.get('settings_strategies') || ['MACD', 'KDJ', 'RSI', 'BOLL', 'MA', 'VOLUME'])

  const macdParams = ref(storage.local.get('settings_macd') || { ...DEFAULT_INDICATOR_PARAMS.macd })
  const kdjParams = ref(storage.local.get('settings_kdj') || { ...DEFAULT_INDICATOR_PARAMS.kdj })
  const rsiParams = ref(storage.local.get('settings_rsi') || { ...DEFAULT_INDICATOR_PARAMS.rsi })
  const bollParams = ref(storage.local.get('settings_boll') || { ...DEFAULT_INDICATOR_PARAMS.boll })
  const maPeriods = ref(storage.local.get('settings_ma') || [...DEFAULT_INDICATOR_PARAMS.ma])

  function save() {
    storage.local.set('settings_period', defaultPeriod.value)
    storage.local.set('settings_indicators', enabledIndicators.value)
    storage.local.set('settings_strategies', signalStrategies.value)
    storage.local.set('settings_macd', macdParams.value)
    storage.local.set('settings_kdj', kdjParams.value)
    storage.local.set('settings_rsi', rsiParams.value)
    storage.local.set('settings_boll', bollParams.value)
    storage.local.set('settings_ma', maPeriods.value)
  }

  function toggleIndicator(key) {
    const idx = enabledIndicators.value.indexOf(key)
    if (idx >= 0) enabledIndicators.value.splice(idx, 1)
    else enabledIndicators.value.push(key)
    save()
  }

  function toggleStrategy(key) {
    const idx = signalStrategies.value.indexOf(key)
    if (idx >= 0) signalStrategies.value.splice(idx, 1)
    else signalStrategies.value.push(key)
    save()
  }

  function resetDefaults() {
    defaultPeriod.value = 'daily'
    enabledIndicators.value = ['MA', 'MACD', 'VOL']
    signalStrategies.value = ['MACD', 'KDJ', 'RSI', 'BOLL', 'MA', 'VOLUME']
    macdParams.value = { ...DEFAULT_INDICATOR_PARAMS.macd }
    kdjParams.value = { ...DEFAULT_INDICATOR_PARAMS.kdj }
    rsiParams.value = { ...DEFAULT_INDICATOR_PARAMS.rsi }
    bollParams.value = { ...DEFAULT_INDICATOR_PARAMS.boll }
    maPeriods.value = [...DEFAULT_INDICATOR_PARAMS.ma]
    save()
  }

  function getIndicatorParams() {
    return {
      macd: macdParams.value,
      kdj: kdjParams.value,
      rsi: rsiParams.value,
      boll: bollParams.value,
      ma: maPeriods.value
    }
  }

  return {
    defaultPeriod, enabledIndicators, signalStrategies,
    macdParams, kdjParams, rsiParams, bollParams, maPeriods,
    save, toggleIndicator, toggleStrategy, resetDefaults, getIndicatorParams
  }
})
