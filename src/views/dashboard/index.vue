<template>
  <div class="dashboard">
    <!-- 大盘指数 -->
    <MarketIndexBar :indices="marketStore.indices" />

    <div class="dashboard-body">
      <!-- 左侧主区域 -->
      <div class="main-area">
        <!-- 快速搜索 -->
        <el-card shadow="never" class="quick-card">
          <template #header>
            <span>快速查找</span>
          </template>
          <div class="quick-search">
            <StockSearch />
            <span class="hint">输入股票代码或名称，进入个股分析</span>
          </div>
        </el-card>

        <!-- 热门股票 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header-row">
              <span>热门股票 (按成交额)</span>
              <el-button text size="small" @click="marketStore.fetchHotStocks()">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <el-table
            :data="marketStore.hotStocks"
            stripe
            size="small"
            @row-click="goStock"
            class="hot-table"
            v-loading="marketStore.loading"
          >
            <el-table-column prop="rank" label="#" width="40" align="center" />
            <el-table-column prop="name" label="名称" width="90" />
            <el-table-column prop="code" label="代码" width="80" />
            <el-table-column label="价格" width="80" align="right">
              <template #default="{ row }">
                <span :class="changeClass(row.changePercent)">
                  {{ Number(row.price).toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="涨跌幅" width="85" align="right">
              <template #default="{ row }">
                <span :class="changeClass(row.changePercent)">
                  {{ formatPercent(row.changePercent) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="成交额" width="100" align="right">
              <template #default="{ row }">
                {{ formatAmount(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column label="换手率" width="75" align="right">
              <template #default="{ row }">
                {{ row.turnoverRate ? row.turnoverRate.toFixed(2) + '%' : '--' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 右侧自选股 -->
      <div class="side-area">
        <WatchlistPanel />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore, useWatchlistStore } from '@/stores'
import { formatPercent, formatAmount } from '@/utils/formatter'
import { Refresh } from '@element-plus/icons-vue'
import MarketIndexBar from '@/components/MarketIndexBar/index.vue'
import StockSearch from '@/components/StockSearch/index.vue'
import WatchlistPanel from '@/components/WatchlistPanel/index.vue'

const router = useRouter()
const marketStore = useMarketStore()
const watchlistStore = useWatchlistStore()

function changeClass(val) {
  if (val > 0) return 'price-up'
  if (val < 0) return 'price-down'
  return 'price-flat'
}

function goStock(row) {
  router.push(`/stock/${row.symbol}`)
}

onMounted(() => {
  marketStore.startAutoRefresh()
  watchlistStore.startAutoRefresh()
})

onUnmounted(() => {
  marketStore.stopAutoRefresh()
  watchlistStore.stopAutoRefresh()
})
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-body {
  display: flex;
  gap: 16px;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.side-area {
  width: 300px;
  flex-shrink: 0;
}

.quick-card {
  .quick-search {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .hint {
    color: #909399;
    font-size: 12px;
  }
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hot-table {
  cursor: pointer;

  :deep(tr:hover) {
    td { background-color: #f0f7ff !important; }
  }
}
</style>
