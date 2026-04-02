import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Layout from '@/layout/index.vue'

NProgress.configure({ showSpinner: false })

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '行情总览', icon: 'TrendCharts' }
      },
      {
        path: 'stock/:symbol',
        name: 'StockDetail',
        component: () => import('@/views/stock/detail.vue'),
        meta: { title: '个股分析', hidden: true }
      },
      {
        path: 'backtest',
        name: 'Backtest',
        component: () => import('@/views/backtest/index.vue'),
        meta: { title: '信号回测', icon: 'DataAnalysis' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '参数设置', icon: 'Setting' }
      },
      {
        path: 'screening',
        name: 'Screening',
        component: () => import('@/views/screening/index.vue'),
        meta: { title: '筛选记录', icon: 'Filter' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  document.title = `${to.meta.title || '量化交易'} - 量化交易分析`
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
