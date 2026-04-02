<template>
  <div class="screening-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Filter /></el-icon>
            <span class="header-title">每日筛选记录</span>
            <el-tag type="info" size="small">保留最近5个交易日</el-tag>
          </div>
          <div class="header-right">
            <el-select v-model="strengthFilter" class="strength-select" placeholder="信号强度">
              <el-option label="全部强度" value="" />
              <el-option label="强烈" value="STRONG" />
              <el-option label="中等" value="MEDIUM" />
              <el-option label="弱" value="WEAK" />
            </el-select>
            <el-select
              v-model="selectedDate"
              class="date-select"
              @change="screeningStore.setSelectedDate($event)"
            >
              <el-option
                v-for="date in recentTradingDays"
                :key="date"
                :label="formatDateLabel(date)"
                :value="date"
              />
            </el-select>
            <el-button type="primary" :loading="scanning" @click="handleScan">
              <el-icon v-if="!scanning"><Search /></el-icon>
              {{ scanning ? `检测中 (${scanProgress}/${scanTotal})` : '检测自选股买点' }}
            </el-button>
            <el-button type="danger" plain :disabled="currentStocks.length === 0" @click="handleClearAll">
              <el-icon><Delete /></el-icon>
              清空当日
            </el-button>
          </div>
        </div>
      </template>

      <!-- 扫描结果提示 -->
      <el-alert
        v-if="scanResult"
        :title="scanResult"
        :type="scanResultType"
        show-icon
        closable
        class="scan-alert"
        @close="scanResult = ''"
      />
      
      <!-- 空状态 -->
      <el-empty v-if="filteredStocks.length === 0" :image-size="100">
        <template #description>
          <p>{{ currentStocks.length === 0 ? `${selectedDate} 暂无筛选记录` : '当前强度过滤下无结果' }}</p>
          <p class="empty-tip">点击“检测自选股买点”可自动扫描，或在个股分析页手动添加</p>
        </template>
      </el-empty>

      <!-- 股票列表 -->
      <template v-else>
        <div class="stock-stats">
          <el-statistic title="当日筛选" :value="currentStocks.length" suffix="只" />
          <el-statistic title="强烈信号" :value="strongCount" suffix="只" />
          <el-statistic title="中等信号" :value="mediumCount" suffix="只" />
          <el-statistic title="当前显示" :value="filteredStocks.length" suffix="只" />
        </div>

        <el-table :data="filteredStocks" style="width: 100%" stripe size="small">
          <el-table-column type="index" width="45" align="center" />

          <el-table-column label="股票" min-width="160">
            <template #default="{ row }">
              <div class="stock-info">
                <span class="stock-name">{{ row.name }}</span>
                <span class="stock-code">{{ row.code }}</span>
                <el-tag size="small" :type="row.market === 'sh' ? 'danger' : 'success'" class="market-tag">
                  {{ row.market === 'sh' ? '沪' : '深' }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="信号" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.signalType === 'BUY' ? 'success' : 'danger'" effect="dark" size="small">
                {{ row.signalType === 'BUY' ? '买入' : '卖出' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="来源" width="80" align="center">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.signalSource }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="强度" width="75" align="center">
            <template #default="{ row }">
              <el-tag :type="strengthType(row.signalStrength)" size="small">
                {{ strengthLabel(row.signalStrength) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="触发价" width="90" align="right">
            <template #default="{ row }">
              <span class="price">¥{{ row.price?.toFixed(2) ?? '--' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="添加时间" width="105" align="center">
            <template #default="{ row }">
              <span class="time-text">{{ formatTime(row.addedAt) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="$router.push(`/stock/${row.symbol}`)">
                <el-icon><View /></el-icon>查看
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Filter, Delete, View, Search } from '@element-plus/icons-vue'
import { useScreeningStore } from '@/stores/screening'
import { useWatchlistStore, useSettingsStore } from '@/stores'
import { getKLineData } from '@/api/kline'
import { calculateAllIndicators } from '@/utils/indicators'
import { generateAllSignals, getCompositeSignal } from '@/utils/signals'

const screeningStore = useScreeningStore()
const watchlistStore = useWatchlistStore()
const settingsStore = useSettingsStore()

// 强度筛选
const strengthFilter = ref('')

// 扫描状态
const scanning = ref(false)
const scanProgress = ref(0)
const scanTotal = ref(0)
const scanResult = ref('')
const scanResultType = ref('success')

const selectedDate = computed({
  get: () => screeningStore.selectedDate,
  set: (val) => screeningStore.setSelectedDate(val)
})

const recentTradingDays = computed(() => screeningStore.recentTradingDays)
const currentStocks = computed(() => screeningStore.currentStocks)

// 强度过滤后的列表
const filteredStocks = computed(() => {
  if (!strengthFilter.value) return currentStocks.value
  return currentStocks.value.filter(s => s.signalStrength === strengthFilter.value)
})

const strongCount = computed(() => currentStocks.value.filter(s => s.signalStrength === 'STRONG').length)
const mediumCount = computed(() => currentStocks.value.filter(s => s.signalStrength === 'MEDIUM').length)

// 主动检测自选股买点
async function handleScan() {
  const watchlist = watchlistStore.watchlist
  if (!watchlist.length) {
    return ElMessage.warning('自选股列表为空，请先添加自选股')
  }

  scanning.value = true
  scanProgress.value = 0
  scanTotal.value = watchlist.length
  scanResult.value = ''

  let addedCount = 0
  let skipCount = 0

  for (const stock of watchlist) {
    try {
      const klineData = await getKLineData(stock.symbol, 240, 300)
      if (!klineData.length) { scanProgress.value++; continue }

      const indicatorParams = settingsStore.getIndicatorParams ? settingsStore.getIndicatorParams() : {}
      const indicators = calculateAllIndicators(klineData, indicatorParams)
      const signals = generateAllSignals(klineData, indicators)
      const composite = getCompositeSignal(signals, 3, klineData.length)

      if (composite.level === 'buy' || composite.level === 'strong-buy') {
        const latestBuy = [...signals].filter(s => s.type === 'BUY').pop()
        const res = screeningStore.addStock({
          symbol: stock.symbol,
          code: stock.symbol.slice(2),
          name: stock.name,
          market: stock.symbol.startsWith('sh') ? 'sh' : 'sz',
          signalType: 'BUY',
          signalSource: latestBuy?.source || '综合',
          signalStrength: latestBuy?.strength || 'MEDIUM',
          price: klineData[klineData.length - 1].close
        })
        if (res && res.success === false) skipCount++
        else addedCount++
      }
    } catch (e) {
      // 忽略单个股票失败
    }
    scanProgress.value++
    await new Promise(r => setTimeout(r, 200))
  }

  scanning.value = false

  if (addedCount > 0) {
    scanResult.value = `检测完成：新增 ${addedCount} 只买点股票${skipCount > 0 ? `，${skipCount} 只已存在` : ''}`
    scanResultType.value = 'success'
  } else {
    scanResult.value = `检测完成：${watchlist.length} 只自选股中暂无新买点信号${skipCount > 0 ? `（${skipCount} 只已在列表中）` : ''}`
    scanResultType.value = 'info'
  }
}

function formatDateLabel(dateStr) {
  const todayStr = new Date().toISOString().split('T')[0]
  const date = new Date(dateStr + 'T00:00:00')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]

  if (dateStr === todayStr) return `今天 (${dateStr} ${weekDay})`

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === yesterday.toISOString().split('T')[0]) return `昨天 (${dateStr} ${weekDay})`

  return `${dateStr} ${weekDay}`
}

function formatTime(isoString) {
  if (!isoString) return '--'
  const d = new Date(isoString)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}

function strengthType(strength) {
  return { STRONG: 'danger', MEDIUM: 'warning', WEAK: 'info' }[strength] || 'info'
}

function strengthLabel(strength) {
  return { STRONG: '强烈', MEDIUM: '中等', WEAK: '弱' }[strength] || strength
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除 "${row.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    screeningStore.removeStock(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleClearAll() {
  ElMessageBox.confirm(`确定清空 ${selectedDate.value} 的所有记录吗？`, '确认清空', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    if (screeningStore.screeningData[selectedDate.value]) {
      delete screeningStore.screeningData[selectedDate.value]
      // 触发响应式更新
      screeningStore.screeningData = { ...screeningStore.screeningData }
    }
    ElMessage.success('已清空')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.screening-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-icon {
    font-size: 18px;
    color: $primary-color;
  }

  .header-title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.strength-select {
  width: 110px;
}

.date-select {
  width: 210px;
}

.scan-alert {
  margin-bottom: 16px;
}

.empty-tip {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

.stock-stats {
  display: flex;
  gap: 40px;
  padding: 14px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 6px;

  .stock-name {
    font-weight: 600;
    color: $text-primary;
    font-size: 13px;
  }

  .stock-code {
    font-size: 12px;
    color: $text-secondary;
  }
}

.price {
  font-weight: 600;
  color: $primary-color;
  font-size: 13px;
}

.time-text {
  font-size: 12px;
  color: $text-secondary;
}
</style>
