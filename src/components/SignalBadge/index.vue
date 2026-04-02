<template>
  <el-tag
    :type="tagType"
    :effect="effect"
    size="small"
    class="signal-badge"
  >
    {{ label }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'BUY' },
  strength: { type: String, default: 'MEDIUM' },
  effect: { type: String, default: 'dark' }
})

const tagType = computed(() => {
  if (props.type === 'BUY') return 'danger'
  if (props.type === 'SELL') return 'success'
  return 'info'
})

const label = computed(() => {
  const prefix = props.strength === 'STRONG' ? '强' : ''
  if (props.type === 'BUY') return `${prefix}买入`
  if (props.type === 'SELL') return `${prefix}卖出`
  return '观望'
})
</script>

<style scoped>
.signal-badge {
  font-weight: 600;
}
</style>
