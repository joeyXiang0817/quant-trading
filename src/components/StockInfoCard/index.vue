<template>
  <div class="stock-info-card" v-if="info">
    <div class="card-header">
      <div class="stock-title">
        <h2>{{ info.name }}</h2>
        <span class="stock-code">{{ info.symbol?.replace(/^(sh|sz)/, '') }}</span>
        <el-button
          :icon="isWatched ? StarFilled : Star"
          :type="isWatched ? 'warning' : 'default'"
          size="small"
          circle
          @click="toggleWatch"
        />
      </div>
      <div class="price-main" :class="priceClass">
        <span class="current-price">{{ formatPrice(info.price) }}</span>
        <span class="price-change">
          {{ formatChange(info.change) }}
          ({{ formatPercent(info.changePercent) }})
        </span>
      </div>
    </div>
    <div class="card-details">
      <div class="detail-item">
        <span class="label">开盘</span>
        <span class="value">{{ formatPrice(info.open) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">昨收</span>
        <span class="value">{{ formatPrice(info.prevClose) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">最高</span>
        <span class="value price-up">{{ formatPrice(info.high) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">最低</span>
        <span class="value price-down">{{ formatPrice(info.low) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">成交量</span>
        <span class="value">{{ formatVolume(info.volume) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">成交额</span>
        <span class="value">{{ formatAmount(info.amount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { useWatchlistStore } from '@/stores'
import { formatPrice, formatChange, formatPercent, formatVolume, formatAmount } from '@/utils/formatter'

const props = defineProps({
  info: { type: Object, default: null }
})

const watchlistStore = useWatchlistStore()

const isWatched = computed(() =>
  props.info ? watchlistStore.isWatched(props.info.symbol) : false
)

const priceClass = computed(() => {
  if (!props.info) return ''
  if (props.info.change > 0) return 'price-up'
  if (props.info.change < 0) return 'price-down'
  return 'price-flat'
})

function toggleWatch() {
  if (!props.info) return
  if (isWatched.value) {
    watchlistStore.removeStock(props.info.symbol)
  } else {
    watchlistStore.addStock(props.info.symbol, props.info.name)
  }
}
</script>

<style lang="scss" scoped>
.stock-info-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid $border-color;
  padding: 20px;
}

.card-header {
  margin-bottom: 16px;
}

.stock-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }
  .stock-code {
    font-size: 13px;
    color: $text-secondary;
  }
}

.price-main {
  .current-price {
    font-size: 32px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .price-change {
    font-size: 14px;
    margin-left: 12px;
    font-variant-numeric: tabular-nums;
  }
}

.card-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #f0f0f0;

  .label {
    color: $text-secondary;
    font-size: 13px;
  }
  .value {
    font-weight: 500;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
}
</style>
