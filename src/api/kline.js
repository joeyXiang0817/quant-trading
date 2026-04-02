import { jsonRequest } from '@/utils/request'

/**
 * 获取K线数据 (新浪财经)
 * @param {string} symbol - 股票代码 如 sz000001
 * @param {number} scale - 周期: 5/15/30/60/240(日)/1200(周)
 * @param {number} datalen - 数据条数
 */
export async function getKLineData(symbol, scale = 240, datalen = 300) {
  try {
    const { data } = await jsonRequest.get('/sina-api/quotes_service/api/json_v2.php/CN_MarketData.getKLineData', {
      params: {
        symbol: symbol,
        scale: scale,
        ma: 5,
        datalen: datalen
      }
    })

    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    // 新浪前复权数据日期是虚拟的（向前偏移），需要校正
    const lastItem = data[data.length - 1]
    const lastDate = new Date(lastItem.day)
    const today = new Date()
    
    // 如果日期在未来，计算偏移天数
    let dayOffset = 0
    if (lastDate > today) {
      const diffTime = lastDate.getTime() - today.getTime()
      dayOffset = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return data.map(item => {
      const originalDate = new Date(item.day)
      // 校正日期
      const correctedDate = new Date(originalDate.getTime() - dayOffset * 24 * 60 * 60 * 1000)
      
      return {
        day: correctedDate.toISOString().split('T')[0],
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume)
      }
    })
  } catch (error) {
    console.error('获取K线数据失败:', error)
    return []
  }
}
