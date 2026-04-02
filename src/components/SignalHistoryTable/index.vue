<template>
  <el-table :data="signals" stripe size="small" class="signal-history-table" max-height="320">
    <el-table-column prop="date" label="日期" width="110" />
    <el-table-column label="信号" width="80" align="center">
      <template #default="{ row }">
        <SignalBadge :type="row.type" :strength="row.strength" />
      </template>
    </el-table-column>
    <el-table-column label="价格" width="90" align="right">
      <template #default="{ row }">
        {{ row.price.toFixed(2) }}
      </template>
    </el-table-column>
    <el-table-column prop="source" label="策略" width="70" align="center" />
    <el-table-column prop="description" label="说明" min-width="160" show-overflow-tooltip />
  </el-table>
</template>

<script setup>
import SignalBadge from '@/components/SignalBadge/index.vue'

defineProps({
  signals: { type: Array, default: () => [] }
})
</script>

<style scoped>
.signal-history-table {
  border-radius: 8px;
}
</style>
