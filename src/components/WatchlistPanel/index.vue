<template>
  <div class="watchlist-panel">
    <div class="panel-header">
      <span>自选股</span>
      <el-button text size="small" @click="watchlistStore.fetchAllRealtimeData()">
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>

    <div v-if="watchlistStore.watchlist.length" class="stock-list">
      <div
        v-for="stock in watchlistStore.watchlist"
        :key="stock.symbol"
        class="stock-row"
        @click="$router.push(`/stock/${stock.symbol}`)"
      >
        <div class="stock-info">
          <span class="name">{{ stock.name }}</span>
          <span class="code">{{ stock.symbol.replace(/^(sh|sz)/, '') }}</span>
        </div>
        <div class="stock-quote" v-if="quote(stock.symbol)">
          <span class="price" :class="priceClass(quote(stock.symbol))">
            {{ quote(stock.symbol).price.toFixed(2) }}
          </span>
          <span class="change" :class="priceClass(quote(stock.symbol))">
            {{ formatPercent(quote(stock.symbol).changePercent) }}
          </span>
        </div>
        <div class="stock-quote" v-else>
          <span class="price">--</span>
        </div>
        <el-button
          text
          size="small"
          class="remove-btn"
          @click.stop="watchlistStore.removeStock(stock.symbol)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <el-empty v-else description="暂无自选股" :image-size="60" />
  </div>
</template>

<script setup>
import { useWatchlistStore } from '@/stores'
import { formatPercent } from '@/utils/formatter'
import { Refresh, Close } from '@element-plus/icons-vue'

const watchlistStore = useWatchlistStore()

function quote(symbol) {
  return watchlistStore.realtimeData[symbol]
}

function priceClass(q) {
  if (!q) return ''
  if (q.change > 0) return 'price-up'
  if (q.change < 0) return 'price-down'
  return 'price-flat'
}
</script>

<style lang="scss" scoped>
.watchlist-panel {
  background: #fff;
  border-radius: 8px;
  border: 1px solid $border-color;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid $border-color;
}

.stock-list {
  max-height: 400px;
  overflow-y: auto;
}

.stock-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;

  &:hover {
    background: #f9fafc;
    .remove-btn { opacity: 1; }
  }
  &:last-child { border-bottom: none; }
}

.stock-info {
  flex: 1;
  min-width: 0;

  .name {
    display: block;
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .code {
    font-size: 11px;
    color: $text-secondary;
  }
}

.stock-quote {
  text-align: right;
  margin-right: 8px;

  .price {
    display: block;
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .change {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
}

.remove-btn {
  opacity: 0;
  transition: opacity 0.2s;
}
</style>
