import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/dashboard',
    redirect: '/home',
    hidden: true
  },

  // 首页
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        component: () => import('@/views/home'),
        meta: {title: '首页', icon: 'dashboard'}
      }
    ]
  },

]

export const asyncRoutes = [
  {
    // 用户管理
    path: '/useradmin',
    component: Layout,
    redirect: '/useradmin/userlist',
    name: 'UserAdmin',
    meta: {title: '用户管理', icon: 'user', roles: ['SUPERADMIN']},
    children: [
      {
        path: 'userlist',
        component: ()=>import('@/views/table/user-table'),
        name: 'UserList',
        meta: {title: '用户列表'}
      },
      {
        path: 'userop',
        component: ()=>import('@/views/table/history-table'),
        name: 'UserOp',
        meta: {title: '操作记录'}
      }
    ]
  },
  // 订单管理
  {
    path: '/orderadmin',
    component: Layout,
    name: 'OrderAdmin',
    redirect: '/orderadmin/orderlist',
    meta: {title: '订单管理', icon: 'table', roles:['ADMIN']},
    children: [
      {
        path: 'orderlist',
        component: ()=>import('@/views/table/order-table'),
        name: 'OrderList',
        meta: {title: '订单列表'}
      },
      {
        path: 'ordertotal',
        component: ()=>import('@/views/table/total-table'),
        name: 'OrderTotal',
        meta: {title: '订单汇总'}
      }
    ]
  },

  {
    path: '/grounding',
    component: Layout,
    name: 'Grounding',
    redirect: '/grounding/fruitlist',
    children: [
      {
        path: 'fruitlist',
        component: ()=>import('@/views/table/fruit-table'),
        name: 'FruitList',
        meta: {title: '每日上新', icon: 'guide' ,roles: ['ADMIN']}
      },
      {
        path: 'modify',
        component: ()=>import('@/views/form/fruit-form'),
        name: 'Modify',
        meta: {title: '商品编辑'},
        hidden: true
      }
    ]
  },
  {
    path: '/flashsale',
    component: Layout,
    name: 'FlashSale',
    redirect: '/flashsale/salelist',
    children: [
      {
        path: 'salelist',
        component: ()=>import('@/views/table/flashsale-table'),
        name: 'SaleList',
        meta: {title: '限时抢购', icon: 'money', roles: ['ADMIN']}
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
