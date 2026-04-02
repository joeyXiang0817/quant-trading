<template>
  <div class="sidebar" :class="{ collapsed }">
    <div class="sidebar-logo">
      <h1 v-if="!collapsed">量化分析</h1>
      <h1 v-else>Q</h1>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      background-color="#1d1e2c"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      router
    >
      <el-menu-item index="/dashboard">
        <el-icon><TrendCharts /></el-icon>
        <template #title>行情总览</template>
      </el-menu-item>
      <el-menu-item index="/backtest">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>信号回测</template>
      </el-menu-item>
      <el-menu-item index="/screening">
        <el-icon><Filter /></el-icon>
        <template #title>筛选记录</template>
      </el-menu-item>
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <template #title>参数设置</template>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-watchlist" v-if="!collapsed">
      <div class="watchlist-title">自选股</div>
      <div class="watchlist-items" v-if="watchlistStore.watchlist.length">
        <div
          v-for="stock in watchlistStore.watchlist"
          :key="stock.symbol"
          class="watchlist-item"
          @click="$router.push(`/stock/${stock.symbol}`)"
        >
          <span class="stock-name">{{ stock.name }}</span>
          <span
            v-if="watchlistStore.realtimeData[stock.symbol]"
            class="stock-price"
            :class="priceClass(watchlistStore.realtimeData[stock.symbol])"
          >
            {{ watchlistStore.realtimeData[stock.symbol].price.toFixed(2) }}
          </span>
        </div>
      </div>
      <div class="watchlist-empty" v-else>暂无自选股</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWatchlistStore } from '@/stores'
import { TrendCharts, DataAnalysis, Setting, Filter } from '@element-plus/icons-vue'

defineProps({ collapsed: Boolean })

const route = useRoute()
const watchlistStore = useWatchlistStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/stock/')) return '/dashboard'
  return path
})

function priceClass(quote) {
  if (!quote) return ''
  if (quote.change > 0) return 'price-up'
  if (quote.change < 0) return 'price-down'
  return 'price-flat'
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: $sidebar-width;
  background-color: #1d1e2c;
  z-index: 100;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.sidebar-logo {
  height: $navbar-height;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #2d2e3e;

  h1 {
    color: #fff;
    font-size: 18px;
    white-space: nowrap;
  }
}

.el-menu {
  border-right: none;
  flex-shrink: 0;
}

.sidebar-watchlist {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  border-top: 1px solid #2d2e3e;
  margin-top: 8px;
}

.watchlist-title {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
  padding-left: 4px;
}

.watchlist-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.watchlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .stock-name {
    color: #bfcbd9;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90px;
  }

  .stock-price {
    font-size: 13px;
    font-weight: 500;
  }
}

.watchlist-empty {
  color: #606266;
  font-size: 12px;
  text-align: center;
  padding: 20px 0;
}
</style>
