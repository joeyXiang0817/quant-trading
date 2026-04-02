/**
 * 信号生成引擎
 * 基于技术指标产生买入/卖出信号
 */
import { SIGNAL_WEIGHTS, SCORE_THRESHOLDS } from './constants'

// ========== MACD 策略 ==========
export function generateMACDSignals(dif, dea, macd, dates, closes) {
  const signals = []
  for (let i = 1; i < dif.length; i++) {
    if (dif[i] === null || dea[i] === null || dif[i - 1] === null || dea[i - 1] === null) continue

    // 金叉: DIF 上穿 DEA
    if (dif[i] > dea[i] && dif[i - 1] <= dea[i - 1]) {
      let negCount = 0
      for (let k = i - 1; k >= Math.max(0, i - 10); k--) {
        if (macd[k] !== null && macd[k] < 0) negCount++
      }
      signals.push({
        date: dates[i], index: i, type: 'BUY', source: 'MACD',
        strength: negCount >= 5 ? 'STRONG' : 'MEDIUM',
        price: closes[i],
        description: negCount >= 5 ? 'MACD深度金叉，底部反转信号' : 'MACD金叉，DIF上穿DEA'
      })
    }

    // 死叉: DIF 下穿 DEA
    if (dif[i] < dea[i] && dif[i - 1] >= dea[i - 1]) {
      let posCount = 0
      for (let k = i - 1; k >= Math.max(0, i - 10); k--) {
        if (macd[k] !== null && macd[k] > 0) posCount++
      }
      signals.push({
        date: dates[i], index: i, type: 'SELL', source: 'MACD',
        strength: posCount >= 5 ? 'STRONG' : 'MEDIUM',
        price: closes[i],
        description: posCount >= 5 ? 'MACD高位死叉，顶部反转信号' : 'MACD死叉，DIF下穿DEA'
      })
    }
  }
  return signals
}

// ========== KDJ 策略 ==========
export function generateKDJSignals(k, d, j, dates, closes) {
  const signals = []
  for (let i = 1; i < j.length; i++) {
    if (j[i] === null || j[i - 1] === null) continue

    // J 从超卖区反弹
    if (j[i] > 20 && j[i - 1] <= 20) {
      signals.push({
        date: dates[i], index: i, type: 'BUY', source: 'KDJ',
        strength: j[i - 1] < 0 ? 'STRONG' : 'MEDIUM',
        price: closes[i],
        description: j[i - 1] < 0 ? 'KDJ极度超卖反弹，J值从负值回升' : 'KDJ超卖反弹，J值上穿20'
      })
    }

    // K 金叉 D (在超卖区)
    if (k[i] !== null && d[i] !== null && k[i - 1] !== null && d[i - 1] !== null) {
      if (k[i] > d[i] && k[i - 1] <= d[i - 1] && k[i] < 30) {
        signals.push({
          date: dates[i], index: i, type: 'BUY', source: 'KDJ',
          strength: 'MEDIUM',
          price: closes[i],
          description: 'KDJ低位金叉，K上穿D'
        })
      }
    }

    // J 从超买区回落
    if (j[i] < 80 && j[i - 1] >= 80) {
      signals.push({
        date: dates[i], index: i, type: 'SELL', source: 'KDJ',
        strength: j[i - 1] > 100 ? 'STRONG' : 'MEDIUM',
        price: closes[i],
        description: j[i - 1] > 100 ? 'KDJ极度超买回落，J值从100以上回落' : 'KDJ超买回落，J值下穿80'
      })
    }

    // K 死叉 D (在超买区)
    if (k[i] !== null && d[i] !== null && k[i - 1] !== null && d[i - 1] !== null) {
      if (k[i] < d[i] && k[i - 1] >= d[i - 1] && k[i] > 70) {
        signals.push({
          date: dates[i], index: i, type: 'SELL', source: 'KDJ',
          strength: 'MEDIUM',
          price: closes[i],
          description: 'KDJ高位死叉，K下穿D'
        })
      }
    }
  }
  return signals
}

// ========== RSI 策略 ==========
export function generateRSISignals(rsi, dates, closes) {
  const signals = []
  for (let i = 1; i < rsi.length; i++) {
    if (rsi[i] === null || rsi[i - 1] === null) continue

    if (rsi[i] > 30 && rsi[i - 1] <= 30) {
      signals.push({
        date: dates[i], index: i, type: 'BUY', source: 'RSI',
        strength: rsi[i - 1] < 20 ? 'STRONG' : 'MEDIUM',
        price: closes[i],
        description: rsi[i - 1] < 20 ? 'RSI极度超卖反弹' : 'RSI超卖反弹，上穿30'
      })
    }

    if (rsi[i] < 70 && rsi[i - 1] >= 70) {
      signals.push({
        date: dates[i], index: i, type: 'SELL', source: 'RSI',
        strength: rsi[i - 1] > 80 ? 'STRONG' : 'MEDIUM',
        price: closes[i],
        description: rsi[i - 1] > 80 ? 'RSI极度超买回落' : 'RSI超买回调，下穿70'
      })
    }
  }
  return signals
}

// ========== 布林带策略 ==========
export function generateBollSignals(upper, middle, lower, closes, dates) {
  const signals = []
  for (let i = 1; i < closes.length; i++) {
    if (upper[i] === null || lower[i] === null) continue
    if (upper[i - 1] === null || lower[i - 1] === null) continue

    // 触下轨后反弹
    if (closes[i - 1] <= lower[i - 1] && closes[i] > lower[i]) {
      let belowCount = 0
      for (let k = Math.max(0, i - 3); k < i; k++) {
        if (lower[k] !== null && closes[k] <= lower[k]) belowCount++
      }
      signals.push({
        date: dates[i], index: i, type: 'BUY', source: 'BOLL',
        strength: belowCount >= 2 ? 'STRONG' : 'MEDIUM',
        price: closes[i],
        description: belowCount >= 2 ? '连续触及布林下轨后反弹，强支撑' : '触及布林下轨后反弹'
      })
    }

    // 触上轨后回落
    if (closes[i - 1] >= upper[i - 1] && closes[i] < upper[i]) {
      let aboveCount = 0
      for (let k = Math.max(0, i - 3); k < i; k++) {
        if (upper[k] !== null && closes[k] >= upper[k]) aboveCount++
      }
      signals.push({
        date: dates[i], index: i, type: 'SELL', source: 'BOLL',
        strength: aboveCount >= 2 ? 'STRONG' : 'MEDIUM',
        price: closes[i],
        description: aboveCount >= 2 ? '连续触及布林上轨后回落，强压力' : '触及布林上轨后回落'
      })
    }
  }
  return signals
}

// ========== 均线策略 ==========
export function generateMASignals(ma5, ma10, ma20, ma60, closes, dates) {
  const signals = []

  function checkCross(short, long, i, label, strength) {
    if (short[i] === null || long[i] === null || short[i - 1] === null || long[i - 1] === null) return
    // 金叉
    if (short[i] > long[i] && short[i - 1] <= long[i - 1]) {
      signals.push({
        date: dates[i], index: i, type: 'BUY', source: 'MA',
        strength, price: closes[i],
        description: `${label}金叉`
      })
    }
    // 死叉
    if (short[i] < long[i] && short[i - 1] >= long[i - 1]) {
      signals.push({
        date: dates[i], index: i, type: 'SELL', source: 'MA',
        strength, price: closes[i],
        description: `${label}死叉`
      })
    }
  }

  for (let i = 1; i < closes.length; i++) {
    checkCross(ma5, ma10, i, 'MA5/MA10', 'WEAK')
    checkCross(ma5, ma20, i, 'MA5/MA20', 'MEDIUM')
    checkCross(ma10, ma20, i, 'MA10/MA20', 'MEDIUM')
    checkCross(ma20, ma60, i, 'MA20/MA60', 'STRONG')
  }

  return signals
}

// ========== 五交易日量能活跃策略 ==========
export function generateVolumeSignals(volumes, closes, dates) {
  const signals = []
  const lookbackDays = 20 // 计算20日均量
  const activeDays = 5    // 最近5个交易日

  for (let i = lookbackDays + activeDays; i < volumes.length; i++) {
    if (volumes[i] === null || volumes[i] <= 0) continue

    // 计算20日均量
    let sumVolume = 0
    let validCount = 0
    for (let k = i - lookbackDays; k < i; k++) {
      if (volumes[k] !== null && volumes[k] > 0) {
        sumVolume += volumes[k]
        validCount++
      }
    }
    if (validCount < 10) continue // 数据不足

    const avgVolume20 = sumVolume / validCount

    // 计算最近5个交易日的量能情况
    let activeDayCount = 0
    let volumeIncreaseDays = 0
    let totalVolume5 = 0

    for (let k = i - activeDays + 1; k <= i; k++) {
      if (volumes[k] === null || volumes[k] <= 0) continue

      totalVolume5 += volumes[k]

      // 当日成交量大于20日均量的1.5倍视为活跃
      if (volumes[k] > avgVolume20 * 1.5) {
        activeDayCount++
      }

      // 连续放量天数
      if (k > i - activeDays + 1 && volumes[k] > volumes[k - 1]) {
        volumeIncreaseDays++
      }
    }

    const avgVolume5 = totalVolume5 / activeDays
    const volumeRatio = avgVolume5 / avgVolume20

    // 买入信号：5日中至少3日量能活跃，且5日均量大于20日均量1.3倍
    if (activeDayCount >= 3 && volumeRatio > 1.3) {
      let strength = 'MEDIUM'
      let description = `五交易日量能活跃，${activeDayCount}日放量，均量放大${(volumeRatio * 100 - 100).toFixed(0)}%`

      if (activeDayCount >= 4 && volumeRatio > 1.8) {
        strength = 'STRONG'
        description = `五交易日量能极度活跃，${activeDayCount}日大幅放量，均量放大${(volumeRatio * 100 - 100).toFixed(0)}%`
      } else if (activeDayCount >= 4) {
        strength = 'STRONG'
        description = `五交易日量能持续活跃，${activeDayCount}日放量，均量放大${(volumeRatio * 100 - 100).toFixed(0)}%`
      }

      // 检查是否伴随价格上涨
      const priceChange = ((closes[i] - closes[i - activeDays + 1]) / closes[i - activeDays + 1]) * 100
      if (priceChange > 5) {
        description += `，同期上涨${priceChange.toFixed(1)}%`
      }

      signals.push({
        date: dates[i], index: i, type: 'BUY', source: 'VOLUME',
        strength,
        price: closes[i],
        description,
        volumeRatio: +volumeRatio.toFixed(2),
        activeDays: activeDayCount
      })
    }

    // 卖出信号：量能萎缩（5日均量小于20日均量0.7倍）
    if (volumeRatio < 0.7 && activeDayCount <= 1) {
      signals.push({
        date: dates[i], index: i, type: 'SELL', source: 'VOLUME',
        strength: 'MEDIUM',
        price: closes[i],
        description: `五交易日量能萎缩，均量仅为20日均量的${(volumeRatio * 100).toFixed(0)}%`,
        volumeRatio: +volumeRatio.toFixed(2),
        activeDays: activeDayCount
      })
    }
  }

  return signals
}

// ========== 综合信号生成 ==========
export function generateAllSignals(klineData, indicators, enabledStrategies = ['MACD', 'KDJ', 'RSI', 'BOLL', 'MA', 'VOLUME']) {
  const dates = klineData.map(d => d.day)
  const closes = klineData.map(d => d.close)
  const volumes = klineData.map(d => d.volume)
  let allSignals = []

  if (enabledStrategies.includes('MACD') && indicators.macd) {
    allSignals.push(...generateMACDSignals(
      indicators.macd.dif, indicators.macd.dea, indicators.macd.macd, dates, closes
    ))
  }
  if (enabledStrategies.includes('KDJ') && indicators.kdj) {
    allSignals.push(...generateKDJSignals(
      indicators.kdj.k, indicators.kdj.d, indicators.kdj.j, dates, closes
    ))
  }
  if (enabledStrategies.includes('RSI') && indicators.rsi) {
    allSignals.push(...generateRSISignals(indicators.rsi, dates, closes))
  }
  if (enabledStrategies.includes('BOLL') && indicators.boll) {
    allSignals.push(...generateBollSignals(
      indicators.boll.upper, indicators.boll.middle, indicators.boll.lower, closes, dates
    ))
  }
  if (enabledStrategies.includes('MA') && indicators.ma) {
    allSignals.push(...generateMASignals(
      indicators.ma.ma5 || [], indicators.ma.ma10 || [],
      indicators.ma.ma20 || [], indicators.ma.ma60 || [],
      closes, dates
    ))
  }
  if (enabledStrategies.includes('VOLUME') && volumes.length > 0) {
    allSignals.push(...generateVolumeSignals(volumes, closes, dates))
  }

  allSignals.sort((a, b) => a.index - b.index)
  return allSignals
}

// ========== 综合评分 ==========
export function getCompositeSignal(signals, lookbackBars = 3, totalBars = 0) {
  const recentSignals = signals.filter(s => s.index >= totalBars - lookbackBars)
  let score = 0

  recentSignals.forEach(s => {
    const weight = SIGNAL_WEIGHTS[s.strength] || 1
    score += s.type === 'BUY' ? weight : -weight
  })

  let recommendation, level
  if (score >= SCORE_THRESHOLDS.STRONG_BUY) {
    recommendation = '强烈买入'
    level = 'strong-buy'
  } else if (score >= SCORE_THRESHOLDS.BUY) {
    recommendation = '建议买入'
    level = 'buy'
  } else if (score <= SCORE_THRESHOLDS.STRONG_SELL) {
    recommendation = '强烈卖出'
    level = 'strong-sell'
  } else if (score <= SCORE_THRESHOLDS.SELL) {
    recommendation = '建议卖出'
    level = 'sell'
  } else {
    recommendation = '观望'
    level = 'neutral'
  }

  return { score, recommendation, level, recentSignals }
}

// ========== 简易回测 ==========
export function backtestSignals(signals, klineData, holdingDays = 10, takeProfitPct = 5, stopLossPct = 3) {
  const results = []

  signals.filter(s => s.type === 'BUY').forEach(signal => {
    const entryIdx = signal.index
    const entryPrice = signal.price
    if (entryIdx >= klineData.length - 1) return

    let exitIdx = Math.min(entryIdx + holdingDays, klineData.length - 1)
    let exitPrice = klineData[exitIdx].close
    let isWin = false
    let maxGain = 0, maxLoss = 0

    for (let i = entryIdx + 1; i <= Math.min(entryIdx + holdingDays, klineData.length - 1); i++) {
      const high = klineData[i].high
      const low = klineData[i].low
      const gainPct = ((high - entryPrice) / entryPrice) * 100
      const lossPct = ((entryPrice - low) / entryPrice) * 100

      if (gainPct > maxGain) maxGain = gainPct
      if (lossPct > maxLoss) maxLoss = lossPct

      if (gainPct >= takeProfitPct) {
        exitIdx = i
        exitPrice = entryPrice * (1 + takeProfitPct / 100)
        isWin = true
        break
      }
      if (lossPct >= stopLossPct) {
        exitIdx = i
        exitPrice = entryPrice * (1 - stopLossPct / 100)
        break
      }
    }

    if (!isWin && exitIdx === Math.min(entryIdx + holdingDays, klineData.length - 1)) {
      exitPrice = klineData[exitIdx].close
      isWin = exitPrice > entryPrice
    }

    const returnPct = ((exitPrice - entryPrice) / entryPrice) * 100

    results.push({
      entryDate: signal.date,
      entryPrice,
      exitDate: klineData[exitIdx].day,
      exitPrice: +exitPrice.toFixed(2),
      returnPct: +returnPct.toFixed(2),
      isWin,
      holdingDays: exitIdx - entryIdx,
      source: signal.source,
      strength: signal.strength
    })
  })

  // 统计
  const totalTrades = results.length
  const wins = results.filter(r => r.isWin).length
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : '0.0'
  const avgReturn = totalTrades
    ? (results.reduce((sum, r) => sum + r.returnPct, 0) / totalTrades).toFixed(2)
    : '0.00'
  const maxDrawdown = totalTrades
    ? Math.min(...results.map(r => r.returnPct)).toFixed(2)
    : '0.00'

  // 分策略统计
  const strategyStats = {}
  results.forEach(r => {
    if (!strategyStats[r.source]) {
      strategyStats[r.source] = { total: 0, wins: 0, totalReturn: 0 }
    }
    strategyStats[r.source].total++
    if (r.isWin) strategyStats[r.source].wins++
    strategyStats[r.source].totalReturn += r.returnPct
  })

  return {
    trades: results,
    stats: { totalTrades, wins, winRate, avgReturn, maxDrawdown },
    strategyStats
  }
}
