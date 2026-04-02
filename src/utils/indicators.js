/**
 * 技术指标计算引擎
 * 包含 MA、MACD、KDJ、RSI、布林带、支撑压力位 的计算
 */

// ========== EMA 辅助函数 ==========
function calculateEMA(data, period) {
  const ema = new Array(data.length).fill(null)
  if (data.length < period) return ema
  let sum = 0
  for (let i = 0; i < period; i++) sum += data[i]
  ema[period - 1] = sum / period
  const k = 2 / (period + 1)
  for (let i = period; i < data.length; i++) {
    ema[i] = data[i] * k + ema[i - 1] * (1 - k)
  }
  return ema
}

// ========== MA (简单移动均线) ==========
export function calculateMA(closes, period) {
  const result = new Array(closes.length).fill(null)
  if (closes.length < period) return result
  let sum = 0
  for (let i = 0; i < period; i++) sum += closes[i]
  result[period - 1] = sum / period
  for (let i = period; i < closes.length; i++) {
    sum += closes[i] - closes[i - period]
    result[i] = sum / period
  }
  return result
}

export function calculateAllMA(closes, periods = [5, 10, 20, 60]) {
  const result = {}
  periods.forEach(p => {
    result[`ma${p}`] = calculateMA(closes, p)
  })
  return result
}

// ========== MACD ==========
export function calculateMACD(closes, shortP = 12, longP = 26, signalP = 9) {
  const len = closes.length
  const dif = new Array(len).fill(null)
  const dea = new Array(len).fill(null)
  const macd = new Array(len).fill(null)

  const emaShort = calculateEMA(closes, shortP)
  const emaLong = calculateEMA(closes, longP)

  // DIF = EMA_short - EMA_long
  const difValues = []
  for (let i = 0; i < len; i++) {
    if (emaShort[i] !== null && emaLong[i] !== null) {
      dif[i] = emaShort[i] - emaLong[i]
      difValues.push(dif[i])
    }
  }

  // DEA = EMA(DIF, signalP)
  if (difValues.length >= signalP) {
    const difStartIdx = len - difValues.length
    const deaArr = calculateEMA(difValues, signalP)
    for (let i = 0; i < difValues.length; i++) {
      if (deaArr[i] !== null) {
        const idx = difStartIdx + i
        dea[idx] = deaArr[i]
        macd[idx] = (dif[idx] - dea[idx]) * 2
      }
    }
  }

  return { dif, dea, macd }
}

// ========== KDJ ==========
export function calculateKDJ(highs, lows, closes, period = 9, kSmooth = 3, dSmooth = 3) {
  const len = closes.length
  const k = new Array(len).fill(null)
  const d = new Array(len).fill(null)
  const j = new Array(len).fill(null)

  if (len < period) return { k, d, j }

  let prevK = 50, prevD = 50

  for (let i = period - 1; i < len; i++) {
    let hn = -Infinity, ln = Infinity
    for (let p = i - period + 1; p <= i; p++) {
      if (highs[p] > hn) hn = highs[p]
      if (lows[p] < ln) ln = lows[p]
    }
    const rsv = hn === ln ? 50 : ((closes[i] - ln) / (hn - ln)) * 100
    const curK = (2 / kSmooth) * prevK + (1 / kSmooth) * rsv
    const curD = (2 / dSmooth) * prevD + (1 / dSmooth) * curK
    const curJ = 3 * curK - 2 * curD

    k[i] = curK
    d[i] = curD
    j[i] = curJ
    prevK = curK
    prevD = curD
  }

  return { k, d, j }
}

// ========== RSI ==========
export function calculateRSI(closes, period = 14) {
  const len = closes.length
  const rsi = new Array(len).fill(null)

  if (len < period + 1) return rsi

  const gains = []
  const losses = []
  for (let i = 1; i < len; i++) {
    const change = closes[i] - closes[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? -change : 0)
  }

  let avgGain = 0, avgLoss = 0
  for (let i = 0; i < period; i++) {
    avgGain += gains[i]
    avgLoss += losses[i]
  }
  avgGain /= period
  avgLoss /= period

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    rsi[i + 1] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }

  return rsi
}

// ========== 布林带 (Bollinger Bands) ==========
export function calculateBollinger(closes, period = 20, multiplier = 2) {
  const len = closes.length
  const upper = new Array(len).fill(null)
  const middle = new Array(len).fill(null)
  const lower = new Array(len).fill(null)

  if (len < period) return { upper, middle, lower }

  for (let i = period - 1; i < len; i++) {
    let sum = 0
    for (let p = i - period + 1; p <= i; p++) sum += closes[p]
    const mean = sum / period

    let variance = 0
    for (let p = i - period + 1; p <= i; p++) {
      variance += (closes[p] - mean) ** 2
    }
    const std = Math.sqrt(variance / period)

    middle[i] = mean
    upper[i] = mean + multiplier * std
    lower[i] = mean - multiplier * std
  }

  return { upper, middle, lower }
}

// ========== 支撑位 / 压力位 ==========
export function calculateSupportResistance(highs, lows, closes, ma20, ma60, lookback = 60) {
  const len = closes.length
  if (len === 0) return { supports: [], resistances: [] }

  const currentPrice = closes[len - 1]
  const start = Math.max(0, len - lookback)
  const levels = new Set()

  // 1. 近N日高低点
  let periodHigh = -Infinity, periodLow = Infinity
  for (let i = start; i < len; i++) {
    if (highs[i] > periodHigh) periodHigh = highs[i]
    if (lows[i] < periodLow) periodLow = lows[i]
  }
  levels.add(periodHigh)
  levels.add(periodLow)

  // 2. 枢轴点 (Pivot Point)
  const lastH = highs[len - 1]
  const lastL = lows[len - 1]
  const lastC = closes[len - 1]
  const pivot = (lastH + lastL + lastC) / 3
  levels.add(+(2 * pivot - lastL).toFixed(2)) // R1
  levels.add(+(pivot + (lastH - lastL)).toFixed(2)) // R2
  levels.add(+(2 * pivot - lastH).toFixed(2)) // S1
  levels.add(+(pivot - (lastH - lastL)).toFixed(2)) // S2

  // 3. MA 关键位
  const curMa20 = ma20[len - 1]
  const curMa60 = ma60[len - 1]
  if (curMa20 !== null) levels.add(+curMa20.toFixed(2))
  if (curMa60 !== null) levels.add(+curMa60.toFixed(2))

  // 去重：合并 1% 范围内的价位
  const allLevels = [...levels].filter(v => v > 0).sort((a, b) => a - b)
  const merged = []
  for (const level of allLevels) {
    if (merged.length === 0 || Math.abs(level - merged[merged.length - 1]) / merged[merged.length - 1] > 0.01) {
      merged.push(level)
    }
  }

  const supports = merged.filter(l => l < currentPrice).sort((a, b) => b - a).slice(0, 3)
  const resistances = merged.filter(l => l > currentPrice).sort((a, b) => a - b).slice(0, 3)

  return { supports, resistances }
}

// ========== 综合计算 ==========
export function calculateAllIndicators(klineData, params = {}) {
  const closes = klineData.map(d => d.close)
  const highs = klineData.map(d => d.high)
  const lows = klineData.map(d => d.low)

  const maParams = params.ma || [5, 10, 20, 60]
  const macdParams = params.macd || { short: 12, long: 26, signal: 9 }
  const kdjParams = params.kdj || { period: 9, kPeriod: 3, dPeriod: 3 }
  const rsiParams = params.rsi || { period: 14 }
  const bollParams = params.boll || { period: 20, multiplier: 2 }

  const ma = calculateAllMA(closes, maParams)
  const macd = calculateMACD(closes, macdParams.short, macdParams.long, macdParams.signal)
  const kdj = calculateKDJ(highs, lows, closes, kdjParams.period, kdjParams.kPeriod, kdjParams.dPeriod)
  const rsi = calculateRSI(closes, rsiParams.period)
  const boll = calculateBollinger(closes, bollParams.period, bollParams.multiplier)
  const supportResistance = calculateSupportResistance(
    highs, lows, closes,
    ma.ma20 || calculateMA(closes, 20),
    ma.ma60 || calculateMA(closes, 60)
  )

  return { ma, macd, kdj, rsi, boll, supportResistance }
}
