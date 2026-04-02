<template>
  <div class="sr-bar" v-if="supports.length || resistances.length">
    <div class="sr-title">支撑位 / 压力位</div>
    <div class="sr-visual">
      <div class="sr-levels">
        <div
          v-for="(r, i) in resistances"
          :key="'r' + i"
          class="level resistance"
        >
          <span class="level-label">压力{{ i + 1 }}</span>
          <div class="level-bar">
            <div class="level-fill" :style="{ width: barWidth(r) }"></div>
          </div>
          <span class="level-price">{{ r.toFixed(2) }}</span>
        </div>

        <div class="level current">
          <span class="level-label">当前价</span>
          <div class="level-bar">
            <div class="level-fill current-fill" :style="{ width: '100%' }"></div>
          </div>
          <span class="level-price current-price">{{ currentPrice.toFixed(2) }}</span>
        </div>

        <div
          v-for="(s, i) in supports"
          :key="'s' + i"
          class="level support"
        >
          <span class="level-label">支撑{{ i + 1 }}</span>
          <div class="level-bar">
            <div class="level-fill" :style="{ width: barWidth(s) }"></div>
          </div>
          <span class="level-price">{{ s.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  supports: { type: Array, default: () => [] },
  resistances: { type: Array, default: () => [] },
  currentPrice: { type: Number, default: 0 }
})

function barWidth(price) {
  if (!props.currentPrice) return '50%'
  const ratio = (price / props.currentPrice) * 50
  return Math.min(100, Math.max(20, ratio)) + '%'
}
</script>

<style lang="scss" scoped>
.sr-bar {
  background: #fff;
  border-radius: 8px;
  border: 1px solid $border-color;
  padding: 16px;
}

.sr-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
}

.sr-levels {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.level {
  display: flex;
  align-items: center;
  gap: 8px;

  .level-label {
    width: 50px;
    font-size: 12px;
    color: $text-secondary;
    text-align: right;
    flex-shrink: 0;
  }

  .level-bar {
    flex: 1;
    height: 8px;
    background: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
  }

  .level-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }

  .level-price {
    width: 70px;
    font-size: 13px;
    font-weight: 500;
    text-align: right;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  &.resistance {
    .level-fill { background: $danger-color; }
    .level-price { color: $danger-color; }
  }
  &.support {
    .level-fill { background: $success-color; }
    .level-price { color: $success-color; }
  }
  &.current {
    .current-fill { background: $primary-color; }
    .current-price {
      color: $primary-color;
      font-weight: 700;
    }
  }
}
</style>
