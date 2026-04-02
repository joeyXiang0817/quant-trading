<template>
  <div class="market-index-bar">
    <div
      v-for="item in indices"
      :key="item.symbol"
      class="index-card"
      :class="priceClass(item)"
    >
      <div class="index-name">{{ item.name }}</div>
      <div class="index-price">{{ formatPrice(item.price) }}</div>
      <div class="index-change">
        <span>{{ formatChange(item.change) }}</span>
        <span>{{ formatPercent(item.changePercent) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatPrice, formatChange, formatPercent } from '@/utils/formatter'

defineProps({
  indices: { type: Array, default: () => [] }
})

function priceClass(item) {
  if (!item) return ''
  if (item.change > 0) return 'up'
  if (item.change < 0) return 'down'
  return 'flat'
}
</script>

<style lang="scss" scoped>
.market-index-bar {
  display: flex;
  gap: 16px;
}

.index-card {
  flex: 1;
  padding: 16px 20px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid $border-color;
  cursor: default;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  &.up {
    border-left: 3px solid $up-color;
    .index-price, .index-change { color: $up-color; }
  }
  &.down {
    border-left: 3px solid $down-color;
    .index-price, .index-change { color: $down-color; }
  }
  &.flat {
    border-left: 3px solid $info-color;
    .index-price, .index-change { color: $info-color; }
  }
}

.index-name {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 6px;
}

.index-price {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
}

.index-change {
  font-size: 13px;
  display: flex;
  gap: 8px;
  font-variant-numeric: tabular-nums;
}
</style>
