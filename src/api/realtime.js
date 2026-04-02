import { textRequest } from '@/utils/request'

/**
 * 解析新浪行情文本
 * 格式: var hq_str_sh000001="名称,开盘价,昨收,当前价,最高,最低,买入,卖出,成交量,成交额,..."
 */
function parseSinaQuote(text, symbol) {
  const match = text.match(new RegExp(`var hq_str_${symbol}="([^"]*)"`, 'i'))
  if (!match || !match[1]) return null
  const parts = match[1].split(',')
  if (parts.length < 32) return null

  const price = parseFloat(parts[3])
  const prevClose = parseFloat(parts[2])
  const change = price - prevClose
  const changePercent = prevClose ? (change / prevClose) * 100 : 0

  return {
    name: parts[0],
    open: parseFloat(parts[1]),
    prevClose,
    price,
    high: parseFloat(parts[4]),
    low: parseFloat(parts[5]),
    volume: parseFloat(parts[8]),
    amount: parseFloat(parts[9]),
    date: parts[30],
    time: parts[31],
    change,
    changePercent,
    symbol
  }
}

/**
 * 批量获取实时行情
 * @param {string[]} symbols - 股票代码列表 如 ['sh000001', 'sz000001']
 */
export async function getRealtimeQuotes(symbols) {
  if (!symbols.length) return []
  try {
    const { data } = await textRequest.get(`/sina-hq/list=${symbols.join(',')}`)
    return symbols.map(s => parseSinaQuote(data, s)).filter(Boolean)
  } catch {
    return []
  }
}

/**
 * 获取单个股票实时行情
 */
export async function getStockSnapshot(symbol) {
  const quotes = await getRealtimeQuotes([symbol])
  return quotes[0] || null
}
