// 颜色常量 - 红涨绿跌 (中国市场惯例)
export const COLORS = {
  up: '#ef5350',
  down: '#26a69a',
  neutral: '#909399',
  ma5: '#ff9800',
  ma10: '#2196f3',
  ma20: '#e91e63',
  ma60: '#9c27b0',
  bollUpper: '#f44336',
  bollMiddle: '#ff9800',
  bollLower: '#4caf50',
  dif: '#ff9800',
  dea: '#2196f3',
  macdPositive: '#ef5350',
  macdNegative: '#26a69a',
  kLine: '#2196f3',
  dLine: '#ff9800',
  jLine: '#9c27b0',
  rsi: '#ff9800',
  volume: '#5470c6',
  support: '#26a69a',
  resistance: '#ef5350',
  buySignal: '#ef5350',
  sellSignal: '#26a69a'
}

// K线周期
export const PERIODS = [
  { label: '日K', value: 'daily', scale: 240 },
  { label: '周K', value: 'weekly', scale: 1200 },
  { label: '60分', value: '60min', scale: 60 },
  { label: '30分', value: '30min', scale: 30 },
  { label: '15分', value: '15min', scale: 15 },
  { label: '5分', value: '5min', scale: 5 }
]

// 默认指标参数
export const DEFAULT_INDICATOR_PARAMS = {
  macd: { short: 12, long: 26, signal: 9 },
  kdj: { period: 9, kPeriod: 3, dPeriod: 3 },
  rsi: { period: 14 },
  boll: { period: 20, multiplier: 2 },
  ma: [5, 10, 20, 60]
}

// 信号强度权重
export const SIGNAL_WEIGHTS = {
  STRONG: 3,
  MEDIUM: 2,
  WEAK: 1
}

// 综合评分阈值
export const SCORE_THRESHOLDS = {
  STRONG_BUY: 5,
  BUY: 2,
  SELL: -2,
  STRONG_SELL: -5
}

// 大盘指数代码
export const MARKET_INDICES = [
  { code: 'sh000001', name: '上证指数' },
  { code: 'sz399001', name: '深证成指' },
  { code: 'sz399006', name: '创业板指' }
]
