<template>
  <div class="settings-page">
    <!-- MACD 参数 -->
    <el-card shadow="never">
      <template #header>MACD 参数</template>
      <el-form label-width="100px" size="small">
        <el-form-item label="短周期 (EMA)">
          <el-input-number v-model="settingsStore.macdParams.short" :min="2" :max="50" @change="settingsStore.save()" />
        </el-form-item>
        <el-form-item label="长周期 (EMA)">
          <el-input-number v-model="settingsStore.macdParams.long" :min="10" :max="100" @change="settingsStore.save()" />
        </el-form-item>
        <el-form-item label="信号周期">
          <el-input-number v-model="settingsStore.macdParams.signal" :min="2" :max="30" @change="settingsStore.save()" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- KDJ 参数 -->
    <el-card shadow="never">
      <template #header>KDJ 参数</template>
      <el-form label-width="100px" size="small">
        <el-form-item label="周期 N">
          <el-input-number v-model="settingsStore.kdjParams.period" :min="5" :max="30" @change="settingsStore.save()" />
        </el-form-item>
        <el-form-item label="K 平滑">
          <el-input-number v-model="settingsStore.kdjParams.kPeriod" :min="2" :max="10" @change="settingsStore.save()" />
        </el-form-item>
        <el-form-item label="D 平滑">
          <el-input-number v-model="settingsStore.kdjParams.dPeriod" :min="2" :max="10" @change="settingsStore.save()" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- RSI 参数 -->
    <el-card shadow="never">
      <template #header>RSI 参数</template>
      <el-form label-width="100px" size="small">
        <el-form-item label="周期">
          <el-input-number v-model="settingsStore.rsiParams.period" :min="5" :max="30" @change="settingsStore.save()" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 布林带参数 -->
    <el-card shadow="never">
      <template #header>布林带参数</template>
      <el-form label-width="100px" size="small">
        <el-form-item label="周期">
          <el-input-number v-model="settingsStore.bollParams.period" :min="10" :max="50" @change="settingsStore.save()" />
        </el-form-item>
        <el-form-item label="倍数">
          <el-input-number v-model="settingsStore.bollParams.multiplier" :min="1" :max="4" :step="0.5" :precision="1" @change="settingsStore.save()" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 信号策略开关 -->
    <el-card shadow="never">
      <template #header>信号策略</template>
      <div class="strategy-switches">
        <div v-for="s in strategyOptions" :key="s.key" class="switch-row">
          <span>{{ s.label }}</span>
          <el-switch
            :model-value="settingsStore.signalStrategies.includes(s.key)"
            @change="settingsStore.toggleStrategy(s.key)"
          />
        </div>
      </div>
    </el-card>

    <!-- 默认周期 -->
    <el-card shadow="never">
      <template #header>显示偏好</template>
      <el-form label-width="100px" size="small">
        <el-form-item label="默认K线周期">
          <el-select v-model="settingsStore.defaultPeriod" @change="settingsStore.save()">
            <el-option v-for="p in PERIODS" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 重置 -->
    <div class="reset-area">
      <el-popconfirm title="确定恢复默认设置？" @confirm="settingsStore.resetDefaults()">
        <template #reference>
          <el-button type="warning">恢复默认设置</el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores'
import { PERIODS } from '@/utils/constants'

const settingsStore = useSettingsStore()

const strategyOptions = [
  { key: 'MACD', label: 'MACD (移动平均收敛/发散)' },
  { key: 'KDJ', label: 'KDJ (随机指标)' },
  { key: 'RSI', label: 'RSI (相对强弱指标)' },
  { key: 'BOLL', label: '布林带 (Bollinger Bands)' },
  { key: 'MA', label: '均线交叉 (MA Cross)' },
  { key: 'VOLUME', label: '量能活跃 (五交易日量能)' }
]
</script>

<style lang="scss" scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 680px;
}

.strategy-switches {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .switch-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }
}

.reset-area {
  padding: 8px 0;
}
</style>
