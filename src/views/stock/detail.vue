<template>
  <div class="stock-detail" v-loading="stockStore.loading">
    <!-- 股票信息卡片 -->
    <StockInfoCard :info="stockStore.currentStockInfo" />

    <!-- 指标选择 + 周期切换 -->
    <div class="toolbar">
      <IndicatorPanel :enabled="settingsStore.enabledIndicators" @toggle="settingsStore.toggleIndicator" />
      <el-radio-group v-model="currentPeriod" size="small" @change="changePeriod">
        <el-radio-button v-for="p in PERIODS" :key="p.value" :value="p.value">
          {{ p.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- K线图 -->
    <div class="chart-wrapper">
      <KLineChart
        :kline-data="stockStore.klineData"
        :indicators="stockStore.indicators"
        :signals="stockStore.signals"
        :enabled-indicators="settingsStore.enabledIndicators"
        :height="550"
      />
    </div>

    <!-- 下方分析区域 -->
    <div class="analysis-area">
      <!-- 左列 -->
      <div class="analysis-left">
        <!-- 综合信号 -->
        <el-card shadow="never" v-if="stockStore.compositeSignal">
          <template #header>综合分析建议</template>
          <div class="composite-signal">
            <div
              class="signal-level"
              :class="stockStore.compositeSignal.level"
            >
              {{ stockStore.compositeSignal.recommendation }}
            </div>
            <div class="signal-score">
              综合评分: {{ stockStore.compositeSignal.score }}
            </div>
            <div class="signal-detail" v-if="stockStore.compositeSignal.recentSignals.length">
              <div class="detail-title">近期信号:</div>
              <div
                v-for="(s, i) in stockStore.compositeSignal.recentSignals.slice(-5)"
                :key="i"
                class="detail-row"
              >
                <SignalBadge :type="s.type" :strength="s.strength" />
                <span class="detail-desc">{{ s.description }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 信号历史 -->
        <el-card shadow="never">
          <template #header>信号历史</template>
          <SignalHistoryTable :signals="recentSignals" />
        </el-card>
      </div>

      <!-- 右列 -->
      <div class="analysis-right">
        <!-- 支撑压力位 -->
        <SupportResistanceBar
          v-if="stockStore.indicators?.supportResistance"
          :supports="stockStore.indicators.supportResistance.supports"
          :resistances="stockStore.indicators.supportResistance.resistances"
          :current-price="latestClose"
        />

        <!-- 指标摘要 -->
        <el-card shadow="never" v-if="stockStore.indicators">
          <template #header>指标摘要</template>
          <div class="indicator-summary">
            <div class="ind-row" v-if="stockStore.indicators.macd">
              <span class="ind-label">MACD</span>
              <span class="ind-val">
                DIF: {{ fmtInd(lastVal(stockStore.indicators.macd.dif)) }}
                DEA: {{ fmtInd(lastVal(stockStore.indicators.macd.dea)) }}
              </span>
            </div>
            <div class="ind-row" v-if="stockStore.indicators.kdj">
              <span class="ind-label">KDJ</span>
              <span class="ind-val">
                K: {{ fmtInd(lastVal(stockStore.indicators.kdj.k)) }}
                D: {{ fmtInd(lastVal(stockStore.indicators.kdj.d)) }}
                J: {{ fmtInd(lastVal(stockStore.indicators.kdj.j)) }}
              </span>
            </div>
            <div class="ind-row" v-if="stockStore.indicators.rsi">
              <span class="ind-label">RSI</span>
              <span class="ind-val">{{ fmtInd(lastVal(stockStore.indicators.rsi)) }}</span>
            </div>
            <div class="ind-row" v-if="stockStore.indicators.boll">
              <span class="ind-label">BOLL</span>
              <span class="ind-val">
                上: {{ fmtInd(lastVal(stockStore.indicators.boll.upper)) }}
                中: {{ fmtInd(lastVal(stockStore.indicators.boll.middle)) }}
                下: {{ fmtInd(lastVal(stockStore.indicators.boll.lower)) }}
              </span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStockStore, useSettingsStore } from '@/stores'
import { PERIODS } from '@/utils/constants'
import StockInfoCard from '@/components/StockInfoCard/index.vue'
import IndicatorPanel from '@/components/IndicatorPanel/index.vue'
import KLineChart from '@/components/KLineChart/index.vue'
import SignalBadge from '@/components/SignalBadge/index.vue'
import SignalHistoryTable from '@/components/SignalHistoryTable/index.vue'
import SupportResistanceBar from '@/components/SupportResistanceBar/index.vue'

const route = useRoute()
const stockStore = useStockStore()
const settingsStore = useSettingsStore()

const currentPeriod = ref(settingsStore.defaultPeriod)

const recentSignals = computed(() =>
  [...stockStore.signals].reverse().slice(0, 20)
)

const latestClose = computed(() => {
  const data = stockStore.klineData
  return data.length ? data[data.length - 1].close : 0
})

function lastVal(arr) {
  if (!arr) return null
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i]
  }
  return null
}

function fmtInd(val) {
  return val !== null ? Number(val).toFixed(2) : '--'
}

function changePeriod(val) {
  stockStore.setPeriod(val)
}

async function loadStock(symbol) {
  if (!symbol) return
  currentPeriod.value = settingsStore.defaultPeriod
  stockStore.klinePeriod = settingsStore.defaultPeriod
  await stockStore.setSymbol(symbol)
}

watch(() => route.params.symbol, (sym) => {
  if (sym) loadStock(sym)
})

onMounted(() => {
  loadStock(route.params.symbol)
  stockStore.startAutoRefresh()
})

onUnmounted(() => {
  stockStore.stopAutoRefresh()
})
</script>

<style lang="scss" scoped>
.stock-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid $border-color;
}

.chart-wrapper {
  background: #fff;
  border-radius: 8px;
  border: 1px solid $border-color;
  padding: 12px;
}

.analysis-area {
  display: flex;
  gap: 16px;
}

.analysis-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.analysis-right {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.composite-signal {
  text-align: center;

  .signal-level {
    font-size: 24px;
    font-weight: 700;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;

    &.strong-buy, &.buy { color: $up-color; background: rgba(239, 83, 80, 0.08); }
    &.strong-sell, &.sell { color: $down-color; background: rgba(38, 166, 154, 0.08); }
    &.neutral { color: $info-color; background: rgba(144, 147, 153, 0.08); }
  }

  .signal-score {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 12px;
  }

  .signal-detail {
    text-align: left;

    .detail-title {
      font-size: 12px;
      color: $text-secondary;
      margin-bottom: 6px;
    }
    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;

      .detail-desc {
        font-size: 12px;
        color: $text-regular;
      }
    }
  }
}

.indicator-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .ind-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px dashed #f0f0f0;

    &:last-child { border-bottom: none; }
  }

  .ind-label {
    font-weight: 600;
    font-size: 13px;
    color: $text-primary;
    width: 50px;
  }

  .ind-val {
    font-size: 12px;
    color: $text-regular;
    font-variant-numeric: tabular-nums;
  }
}
</style>
