<template>
  <div class="indicator-panel">
    <el-check-tag
      v-for="ind in indicatorOptions"
      :key="ind.key"
      :checked="enabled.includes(ind.key)"
      @change="$emit('toggle', ind.key)"
    >
      {{ ind.label }}
    </el-check-tag>
  </div>
</template>

<script setup>
const indicatorOptions = [
  { key: 'MA', label: '均线' },
  { key: 'MACD', label: 'MACD' },
  { key: 'KDJ', label: 'KDJ' },
  { key: 'RSI', label: 'RSI' },
  { key: 'BOLL', label: '布林带' },
  { key: 'VOL', label: '成交量' }
]

defineProps({
  enabled: { type: Array, default: () => [] }
})
defineEmits(['toggle'])
</script>

<style lang="scss" scoped>
.indicator-panel {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
