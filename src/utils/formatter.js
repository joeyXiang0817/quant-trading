import dayjs from 'dayjs'

export function formatPrice(price) {
  return Number(price).toFixed(2)
}

export function formatPercent(value) {
  const num = Number(value)
  const prefix = num > 0 ? '+' : ''
  return `${prefix}${num.toFixed(2)}%`
}

export function formatChange(value) {
  const num = Number(value)
  const prefix = num > 0 ? '+' : ''
  return `${prefix}${num.toFixed(2)}`
}

export function formatVolume(vol) {
  const num = Number(vol)
  if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(2) + '万'
  return num.toFixed(0)
}

export function formatAmount(amount) {
  const num = Number(amount)
  if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(2) + '万'
  return num.toFixed(2)
}

export function formatDate(date, fmt = 'YYYY-MM-DD') {
  return dayjs(date).format(fmt)
}

export function formatDateTime(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function isMarketOpen() {
  const now = dayjs()
  const day = now.day()
  if (day === 0 || day === 6) return false
  const time = now.hour() * 100 + now.minute()
  return (time >= 930 && time <= 1130) || (time >= 1300 && time <= 1500)
}

export function getSymbolMarket(code) {
  if (!code) return ''
  const pure = code.replace(/^(sh|sz)/, '')
  if (pure.startsWith('6')) return 'sh'
  return 'sz'
}

export function normalizeSymbol(code) {
  const pure = code.replace(/^(sh|sz)/, '')
  return getSymbolMarket(pure) + pure
}
