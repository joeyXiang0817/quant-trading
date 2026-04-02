import { jsonRequest } from '@/utils/request'

/**
 * 搜索股票 (东方财富)
 * @param {string} keyword - 搜索关键词
 */
export async function searchStocks(keyword) {
  if (!keyword || !keyword.trim()) return []
  console.log('搜索股票:', keyword)
  try {
    const { data } = await jsonRequest.get(`/em-search/api/suggest/get`, {
      params: {
        input: keyword.trim(),
        type: 14,
        count: 10
      }
    })

    const results = data?.QuotationCodeTable?.Data
    if (!Array.isArray(results) || results.length === 0) return []

    return results
      .map(item => {
        const code = item.Code?.trim()
        const name = item.Name
        // 根据代码判断市场: 6开头沪市, 0/3开头深市
        const market = code?.startsWith('6') ? 'sh' : 'sz'
        // 仅显示 A 股主板、创业板、科创板
        if (!/^(0|3|6)\d{5}$/.test(code)) return null
        return { code, name, market, symbol: market + code }
      })
      .filter(Boolean)
  } catch (error) {
    console.error('搜索股票失败:', error)
    return []
  }
}
