import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { getRealtimeQuotes } from '@/api/realtime'

export const useWatchlistStore = defineStore('watchlist', () => {
  const watchlist = ref(storage.local.get('watchlist') || [])
  const realtimeData = ref({})
  let timer = null

  const symbols = computed(() => watchlist.value.map(s => s.symbol))

  function addStock(symbol, name) {
    if (watchlist.value.find(s => s.symbol === symbol)) return
    watchlist.value.push({ symbol, name, addedAt: Date.now() })
    storage.local.set('watchlist', watchlist.value)
    fetchAllRealtimeData()
  }

  function removeStock(symbol) {
    watchlist.value = watchlist.value.filter(s => s.symbol !== symbol)
    storage.local.set('watchlist', watchlist.value)
  }

  function isWatched(symbol) {
    return watchlist.value.some(s => s.symbol === symbol)
  }

  async function fetchAllRealtimeData() {
    if (!symbols.value.length) return
    const quotes = await getRealtimeQuotes(symbols.value)
    const map = {}
    quotes.forEach(q => { map[q.symbol] = q })
    realtimeData.value = map
  }

  function startAutoRefresh() {
    stopAutoRefresh()
    fetchAllRealtimeData()
    timer = setInterval(fetchAllRealtimeData, 15000)
  }

  function stopAutoRefresh() {
    if (timer) { clearInterval(timer); timer = null }
  }

  return {
    watchlist, realtimeData, symbols,
    addStock, removeStock, isWatched,
    fetchAllRealtimeData, startAutoRefresh, stopAutoRefresh
  }
})
