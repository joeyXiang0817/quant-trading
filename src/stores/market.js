import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getMarketIndices, getHotStocks } from '@/api/market'

export const useMarketStore = defineStore('market', () => {
  const indices = ref([])
  const hotStocks = ref([])
  const loading = ref(false)
  let timer = null

  async function fetchIndices() {
    indices.value = await getMarketIndices()
  }

  async function fetchHotStocks() {
    hotStocks.value = await getHotStocks()
  }

  async function refreshAll() {
    loading.value = true
    await Promise.all([fetchIndices(), fetchHotStocks()])
    loading.value = false
  }

  function startAutoRefresh() {
    stopAutoRefresh()
    refreshAll()
    timer = setInterval(refreshAll, 30000)
  }

  function stopAutoRefresh() {
    if (timer) { clearInterval(timer); timer = null }
  }

  return {
    indices, hotStocks, loading,
    fetchIndices, fetchHotStocks, refreshAll,
    startAutoRefresh, stopAutoRefresh
  }
})
