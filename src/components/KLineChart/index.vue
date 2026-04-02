<template>
  <div ref="chartRef" class="kline-chart" :style="{ height: height + 'px' }"></div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { COLORS } from '@/utils/constants'

const props = defineProps({
  klineData: { type: Array, default: () => [] },
  indicators: { type: Object, default: null },
  signals: { type: Array, default: () => [] },
  enabledIndicators: { type: Array, default: () => ['MA', 'VOL'] },
  height: { type: Number, default: 600 }
})

const chartRef = ref(null)
let chartInstance = null
let resizeObserver = null

function buildOption() {
  const data = props.klineData
  if (!data.length) return null

  const dates = data.map(d => d.day)
  const ohlc = data.map(d => [d.open, d.close, d.low, d.high])
  const volumes = data.map(d => d.volume)
  const ind = props.indicators || {}
  const enabled = props.enabledIndicators

  // 计算子图布局
  const hasMACD = enabled.includes('MACD') && ind.macd
  const hasKDJ = enabled.includes('KDJ') && ind.kdj
  const hasRSI = enabled.includes('RSI') && ind.rsi
  const hasVol = enabled.includes('VOL')
  const subCharts = [hasVol, hasMACD, hasKDJ || hasRSI].filter(Boolean).length

  let mainHeight, subHeight
  if (subCharts === 0) { mainHeight = '85%'; subHeight = 0 }
  else if (subCharts === 1) { mainHeight = '65%'; subHeight = 18 }
  else if (subCharts === 2) { mainHeight = '52%'; subHeight = 15 }
  else { mainHeight = '42%'; subHeight = 13 }

  const grids = [{ left: 60, right: 20, top: 30, height: mainHeight }]
  const xAxes = [{ type: 'category', data: dates, gridIndex: 0, axisLabel: { show: false }, axisTick: { show: false } }]
  const yAxes = [{ gridIndex: 0, scale: true, splitArea: { show: true, areaStyle: { color: ['#fff', '#fafafa'] } } }]
  const series = []

  // Grid 索引追踪
  let gridIdx = 1
  let volGridIdx = -1, macdGridIdx = -1, subIndicatorGridIdx = -1

  // 计算子图 top 位置
  const getSubTop = (idx) => {
    const base = subCharts === 0 ? 90 : subCharts === 1 ? 72 : subCharts === 2 ? 58 : 48
    return `${base + (idx - 1) * (subHeight + 4)}%`
  }

  // 成交量子图
  if (hasVol) {
    volGridIdx = gridIdx++
    grids.push({ left: 60, right: 20, top: getSubTop(volGridIdx), height: `${subHeight}%` })
    xAxes.push({ type: 'category', data: dates, gridIndex: volGridIdx, axisLabel: { show: false }, axisTick: { show: false } })
    yAxes.push({ gridIndex: volGridIdx, scale: true, splitNumber: 2, axisLabel: { fontSize: 10 } })

    series.push({
      name: '成交量',
      type: 'bar',
      xAxisIndex: volGridIdx,
      yAxisIndex: volGridIdx,
      data: volumes.map((v, i) => ({
        value: v,
        itemStyle: { color: data[i].close >= data[i].open ? COLORS.up : COLORS.down }
      })),
      barWidth: '60%'
    })
  }

  // MACD 子图
  if (hasMACD) {
    macdGridIdx = gridIdx++
    grids.push({ left: 60, right: 20, top: getSubTop(macdGridIdx), height: `${subHeight}%` })
    xAxes.push({ type: 'category', data: dates, gridIndex: macdGridIdx, axisLabel: { show: false }, axisTick: { show: false } })
    yAxes.push({ gridIndex: macdGridIdx, scale: true, splitNumber: 2, axisLabel: { fontSize: 10 } })

    series.push(
      {
        name: 'MACD',
        type: 'bar',
        xAxisIndex: macdGridIdx,
        yAxisIndex: macdGridIdx,
        data: (ind.macd.macd || []).map(v => ({
          value: v,
          itemStyle: { color: v >= 0 ? COLORS.macdPositive : COLORS.macdNegative }
        })),
        barWidth: '60%'
      },
      {
        name: 'DIF', type: 'line', xAxisIndex: macdGridIdx, yAxisIndex: macdGridIdx,
        data: ind.macd.dif, lineStyle: { width: 1, color: COLORS.dif }, symbol: 'none'
      },
      {
        name: 'DEA', type: 'line', xAxisIndex: macdGridIdx, yAxisIndex: macdGridIdx,
        data: ind.macd.dea, lineStyle: { width: 1, color: COLORS.dea }, symbol: 'none'
      }
    )
  }

  // KDJ / RSI 子图
  if (hasKDJ || hasRSI) {
    subIndicatorGridIdx = gridIdx++
    grids.push({ left: 60, right: 20, top: getSubTop(subIndicatorGridIdx), height: `${subHeight}%` })
    xAxes.push({ type: 'category', data: dates, gridIndex: subIndicatorGridIdx, axisLabel: { fontSize: 10 } })
    yAxes.push({ gridIndex: subIndicatorGridIdx, scale: true, splitNumber: 2, axisLabel: { fontSize: 10 } })

    if (hasKDJ && ind.kdj) {
      series.push(
        { name: 'K', type: 'line', xAxisIndex: subIndicatorGridIdx, yAxisIndex: subIndicatorGridIdx, data: ind.kdj.k, lineStyle: { width: 1, color: COLORS.kLine }, symbol: 'none' },
        { name: 'D', type: 'line', xAxisIndex: subIndicatorGridIdx, yAxisIndex: subIndicatorGridIdx, data: ind.kdj.d, lineStyle: { width: 1, color: COLORS.dLine }, symbol: 'none' },
        { name: 'J', type: 'line', xAxisIndex: subIndicatorGridIdx, yAxisIndex: subIndicatorGridIdx, data: ind.kdj.j, lineStyle: { width: 1, color: COLORS.jLine }, symbol: 'none' }
      )
    } else if (hasRSI && ind.rsi) {
      series.push({
        name: 'RSI', type: 'line', xAxisIndex: subIndicatorGridIdx, yAxisIndex: subIndicatorGridIdx,
        data: ind.rsi, lineStyle: { width: 1, color: COLORS.rsi }, symbol: 'none',
        markLine: {
          silent: true,
          lineStyle: { type: 'dashed', color: '#ccc' },
          data: [{ yAxis: 30 }, { yAxis: 70 }]
        }
      })
    }
  }

  // 最后一个 xAxis 显示日期
  if (xAxes.length > 0) {
    xAxes[xAxes.length - 1].axisLabel = { show: true, fontSize: 10 }
  }

  // 蜡烛图
  const candleSeries = {
    name: 'K线',
    type: 'candlestick',
    xAxisIndex: 0,
    yAxisIndex: 0,
    data: ohlc,
    itemStyle: {
      color: COLORS.up,
      color0: COLORS.down,
      borderColor: COLORS.up,
      borderColor0: COLORS.down
    }
  }

  // 信号标记
  if (props.signals.length) {
    const buyMarks = props.signals.filter(s => s.type === 'BUY').map(s => ({
      coord: [s.date, data[s.index]?.low * 0.995],
      symbol: 'triangle',
      symbolSize: 10,
      itemStyle: { color: COLORS.buySignal },
      label: { show: false }
    }))
    const sellMarks = props.signals.filter(s => s.type === 'SELL').map(s => ({
      coord: [s.date, data[s.index]?.high * 1.005],
      symbol: 'pin',
      symbolSize: 10,
      symbolRotate: 180,
      itemStyle: { color: COLORS.sellSignal },
      label: { show: false }
    }))
    candleSeries.markPoint = {
      data: [...buyMarks, ...sellMarks],
      animation: false
    }
  }

  series.unshift(candleSeries)

  // MA 均线
  if (enabled.includes('MA') && ind.ma) {
    const maColors = { ma5: COLORS.ma5, ma10: COLORS.ma10, ma20: COLORS.ma20, ma60: COLORS.ma60 }
    Object.keys(ind.ma).forEach(key => {
      series.push({
        name: key.toUpperCase(),
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: ind.ma[key],
        lineStyle: { width: 1, color: maColors[key] || '#999' },
        symbol: 'none',
        z: 1
      })
    })
  }

  // 布林带
  if (enabled.includes('BOLL') && ind.boll) {
    series.push(
      { name: '上轨', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: ind.boll.upper, lineStyle: { width: 1, color: COLORS.bollUpper, type: 'dashed' }, symbol: 'none', z: 1 },
      { name: '中轨', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: ind.boll.middle, lineStyle: { width: 1, color: COLORS.bollMiddle }, symbol: 'none', z: 1 },
      { name: '下轨', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: ind.boll.lower, lineStyle: { width: 1, color: COLORS.bollLower, type: 'dashed' }, symbol: 'none', z: 1 }
    )
  }

  // DataZoom 控制所有 xAxis
  const xAxisIndices = xAxes.map((_, i) => i)
  const startVal = Math.max(0, ((data.length - 80) / data.length) * 100)

  return {
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#303133', fontSize: 12 },
      formatter: (params) => {
        if (!params.length) return ''
        const idx = params[0].dataIndex
        const d = data[idx]
        if (!d) return ''
        let html = `<div style="font-weight:600;margin-bottom:4px">${d.day}</div>`
        html += `开: ${d.open.toFixed(2)} 高: ${d.high.toFixed(2)}<br/>`
        html += `低: ${d.low.toFixed(2)} 收: ${d.close.toFixed(2)}<br/>`
        html += `量: ${(d.volume / 10000).toFixed(0)}万`
        return html
      }
    },
    axisPointer: { link: xAxes.map((_, i) => ({ xAxisIndex: i })) },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series,
    dataZoom: [
      { type: 'inside', xAxisIndex: xAxisIndices, start: startVal, end: 100 },
      { type: 'slider', xAxisIndex: xAxisIndices, start: startVal, end: 100, bottom: 5, height: 20 }
    ]
  }
}

function renderChart() {
  if (!chartInstance) return
  const option = buildOption()
  if (option) {
    chartInstance.setOption(option, { notMerge: true })
  }
}

onMounted(() => {
  nextTick(() => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    renderChart()

    resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
    })
    resizeObserver.observe(chartRef.value)
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => [props.klineData, props.indicators, props.signals, props.enabledIndicators],
  () => { nextTick(renderChart) },
  { deep: true }
)

defineExpose({ resize: () => chartInstance?.resize() })
</script>

<style scoped>
.kline-chart {
  width: 100%;
  min-height: 400px;
}
</style>
