import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

export { useSettingsStore } from './settings'
export { useWatchlistStore } from './watchlist'
export { useMarketStore } from './market'
export { useStockStore } from './stock'
