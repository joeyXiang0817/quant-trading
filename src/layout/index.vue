<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': isCollapsed }">
    <Sidebar :collapsed="isCollapsed" />
    <div class="main-container">
      <Navbar @toggle-sidebar="isCollapsed = !isCollapsed" :collapsed="isCollapsed" />
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar/index.vue'

const isCollapsed = ref(false)
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: $sidebar-width;
  min-height: 100vh;
  transition: margin-left 0.3s;
}

.sidebar-collapsed .main-container {
  margin-left: $sidebar-collapsed-width;
}

.main-content {
  flex: 1;
  padding: 16px;
  margin-top: $navbar-height;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
