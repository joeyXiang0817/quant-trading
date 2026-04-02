<template>
  <div class="backtest-page">
    <!-- 操作栏 -->
    <el-card shadow="never">
      <div class="backtest-toolbar">
        <div class="toolbar-item">
          <label>股票</label>
          <el-autocomplete
            v-model="searchKeyword"
            :fetch-suggestions="handleSearch"
            placeholder="选择股票"
            :debounce="300"
            size="small"
            style="width: 200px"
            @select="handleSelect"
          >
            <template #default="{ item }">
              <span>{{ item.code }} {{ item.name }}</span>
            </template>
          </el-autocomplete>
        </div>
        <div class="toolbar-item">
          <label>策略</label>
          <el-checkbox-group v-model="selectedStrategies" size="small">
            <el-checkbox-button v-for="s in strategyOptions" :key="s" :value="s">{{ s }}</el-checkbox-button>
          </el-checkbox-group>
        </div>
        <el-button type="primary" size="small" @click="runBacktest" :loading="loading">
          运行回测
        </el-button>
      </div>
    </el-card>

    <!-- K线 + 信号标记 -->
    <div class="chart-section" v-if="klineData.length">
      <KLineChart
        :kline-data="klineData"
        :indicators="indicators"
        :signals="allSignals"
        :enabled-indicators="['MA', 'VOL', 'MACD']"
        :height="450"
      />
    </div>
    <el-empty v-else description="请选择股票并运行回测" />

    <!-- 回测统计 -->
    <div class="stats-cards" v-if="backtestResult">
      <div class="stat-card">
        <div class="stat-value">{{ backtestResult.stats.totalTrades }}</div>
        <div class="stat-label">总信号数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="Number(backtestResult.stats.winRate) >= 50 ? 'price-up' : 'price-down'">
          {{ backtestResult.stats.winRate }}%
        </div>
        <div class="stat-label">胜率</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="Number(backtestResult.stats.avgReturn) >= 0 ? 'price-up' : 'price-down'">
          {{ backtestResult.stats.avgReturn }}%
        </div>
        <div class="stat-label">平均收益</div>
      </div>
      <div class="stat-card">
        <div class="stat-value price-down">{{ backtestResult.stats.maxDrawdown }}%</div>
        <div class="stat-label">最大回撤</div>
      </div>
    </div>

    <!-- 分策略统计 -->
    <el-card shadow="never" v-if="backtestResult && Object.keys(backtestResult.strategyStats).length">
      <template #header>分策略统计</template>
      <el-table :data="strategyTableData" stripe size="small">
        <el-table-column prop="strategy" label="策略" width="100" />
        <el-table-column prop="total" label="信号数" width="80" align="center" />
        <el-table-column label="胜率" width="80" align="center">
          <template #default="{ row }">
            <span :class="row.winRate >= 50 ? 'price-up' : 'price-down'">
              {{ row.winRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="平均收益" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.avgReturn >= 0 ? 'price-up' : 'price-down'">
              {{ row.avgReturn }}%
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 信号明细 -->
    <el-card shadow="never" v-if="backtestResult && backtestResult.trades.length">
      <template #header>交易明细</template>
      <el-table :data="backtestResult.trades" stripe size="small" max-height="400">
        <el-table-column prop="entryDate" label="买入日期" width="110" />
        <el-table-column label="买入价" width="85" align="right">
          <template #default="{ row }">{{ row.entryPrice.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="exitDate" label="卖出日期" width="110" />
        <el-table-column label="卖出价" width="85" align="right">
          <template #default="{ row }">{{ row.exitPrice.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="收益率" width="85" align="right">
          <template #default="{ row }">
            <span :class="row.returnPct >= 0 ? 'price-up' : 'price-down'">
              {{ row.returnPct >= 0 ? '+' : '' }}{{ row.returnPct }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="结果" width="65" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isWin ? 'danger' : 'success'" size="small">
              {{ row.isWin ? '盈' : '亏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="策略" width="70" align="center" />
        <el-table-column prop="holdingDays" label="持有天数" width="85" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getKLineData } from '@/api/kline'
import { searchStocks } from '@/api/search'
import { calculateAllIndicators } from '@/utils/indicators'
import { generateAllSignals, backtestSignals } from '@/utils/signals'
import { useSettingsStore } from '@/stores'
import KLineChart from '@/components/KLineChart/index.vue'

const settingsStore = useSettingsStore()

const searchKeyword = ref('')
const selectedSymbol = ref('')
const selectedStrategies = ref(['MACD', 'KDJ', 'RSI', 'BOLL', 'MA'])
const strategyOptions = ['MACD', 'KDJ', 'RSI', 'BOLL', 'MA']

const klineData = ref([])
const indicators = ref(null)
const allSignals = ref([])
const backtestResult = ref(null)
const loading = ref(false)

async function handleSearch(query, cb) {
  if (!query) return cb([])
  const results = await searchStocks(query)
  cb(results.map(r => ({ ...r, value: `${r.code} ${r.name}` })))
}

function handleSelect(item) {
  selectedSymbol.value = item.symbol
}

async function runBacktest() {
  if (!selectedSymbol.value) return
  loading.value = true
  try {
    klineData.value = await getKLineData(selectedSymbol.value, 240, 300)
    if (!klineData.value.length) return

    indicators.value = calculateAllIndicators(klineData.value, settingsStore.getIndicatorParams())
    allSignals.value = generateAllSignals(klineData.value, indicators.value, selectedStrategies.value)
    backtestResult.value = backtestSignals(allSignals.value, klineData.value)
  } finally {
    loading.value = false
  }
}

const strategyTableData = computed(() => {
  if (!backtestResult.value) return []
  return Object.entries(backtestResult.value.strategyStats).map(([key, val]) => ({
    strategy: key,
    total: val.total,
    winRate: val.total ? ((val.wins / val.total) * 100).toFixed(1) : '0.0',
    avgReturn: val.total ? (val.totalReturn / val.total).toFixed(2) : '0.00'
  }))
})
</script>

<style lang="scss" scoped>
.backtest-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.backtest-toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;

  .toolbar-item {
    display: flex;
    align-items: center;
    gap: 8px;

    label {
      font-size: 13px;
      color: $text-secondary;
      white-space: nowrap;
    }
  }
}

.chart-section {
  background: #fff;
  border-radius: 8px;
  border: 1px solid $border-color;
  padding: 12px;
}

.stats-cards {
  display: flex;
  gap: 16px;

  .stat-card {
    flex: 1;
    text-align: center;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid $border-color;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .stat-label {
      font-size: 13px;
      color: $text-secondary;
      margin-top: 4px;
    }
  }
}
</style>
