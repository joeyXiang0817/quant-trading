<template>
  <el-autocomplete
    v-model="keyword"
    :fetch-suggestions="handleSearch"
    placeholder="输入股票代码或名称"
    :trigger-on-focus="false"
    :debounce="300"
    clearable
    class="stock-search"
    @select="handleSelect"
  >
    <template #prefix>
      <el-icon><Search /></el-icon>
    </template>
    <template #default="{ item }">
      <div class="search-item">
        <span class="search-code">{{ item.code }}</span>
        <span class="search-name">{{ item.name }}</span>
        <span class="search-market">{{ item.market === 'sh' ? '沪' : '深' }}</span>
      </div>
    </template>
  </el-autocomplete>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { searchStocks } from '@/api/search'

const router = useRouter()
const keyword = ref('')

async function handleSearch(query, cb) {
  if (!query) return cb([])
  const results = await searchStocks(query)
  cb(results.map(r => ({ ...r, value: `${r.code} ${r.name}` })))
}

function handleSelect(item) {
  keyword.value = ''
  router.push(`/stock/${item.symbol}`)
}
</script>

<style lang="scss" scoped>
.stock-search {
  width: 240px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;

  .search-code {
    font-weight: 600;
    color: $text-primary;
    font-size: 13px;
  }
  .search-name {
    color: $text-regular;
    font-size: 13px;
  }
  .search-market {
    margin-left: auto;
    font-size: 11px;
    color: #fff;
    background: $primary-color;
    padding: 1px 4px;
    border-radius: 2px;
  }
}
</style>
