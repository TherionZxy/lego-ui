import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'
// 权限控制
NProgress.configure({ showSpinner: false })

// 白名单
const whiteList = ['/login']

router.beforeEach(async(to, from, next) => {
  NProgress.start()

  document.title = getPageTitle(to.meta.title)

  // 检查用户是否登录
  const hasToken = getToken()

  // 如果已登录（有token）
  if (hasToken) {
    // 登录情况下访问登录页面，自动重定向到主页
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      try {
        const hasRoles = store.getters.roles && store.getters.roles.length > 0
        if (hasRoles) {
          router.options.routes = store.state.permission.routes
          next()
        } else {
          const { roles } = await store.dispatch('user/getInfo')

          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          router.addRoutes(accessRoutes)

          next({ ...to, replace: true })
        }
      } catch (error) {
        await store.dispatch('user/resetToken')
        Message.error(error || 'Has Error')
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  } else {
    // 如果没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果就在登录页面，直接进入
      next()
    } else {
      // 如果在其他白名单之外的页面则重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
