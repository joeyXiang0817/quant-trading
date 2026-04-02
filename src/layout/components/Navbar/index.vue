<template>
  <div class="navbar">
    <div class="navbar-left">
      <el-icon class="hamburger" @click="$emit('toggle-sidebar')">
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
      <span class="page-title">{{ route.meta.title }}</span>
    </div>
    <div class="navbar-right">
      <StockSearch />
      <div class="market-status" :class="isOpen ? 'open' : 'closed'">
        <span class="status-dot"></span>
        {{ isOpen ? '交易中' : '已休市' }}
      </div>
      <span class="clock">{{ currentTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Fold, Expand } from '@element-plus/icons-vue'
import { isMarketOpen } from '@/utils/formatter'
import dayjs from 'dayjs'
import StockSearch from '@/components/StockSearch/index.vue'

defineProps({ collapsed: Boolean })
defineEmits(['toggle-sidebar'])

const route = useRoute()
const currentTime = ref('')
const isOpen = ref(false)
let timer = null

function updateClock() {
  currentTime.value = dayjs().format('HH:mm:ss')
  isOpen.value = isMarketOpen()
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: $sidebar-width;
  height: $navbar-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid $border-color;
  z-index: 99;
  transition: left 0.3s;

  .sidebar-collapsed & {
    left: $sidebar-collapsed-width;
  }
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hamburger {
  font-size: 20px;
  cursor: pointer;
  color: $text-primary;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.market-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;

  &.open {
    color: $success-color;
    background: rgba(38, 166, 154, 0.1);
  }
  &.closed {
    color: $info-color;
    background: rgba(144, 147, 153, 0.1);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
}

.clock {
  font-size: 13px;
  color: $text-secondary;
  font-variant-numeric: tabular-nums;
}
</style>
