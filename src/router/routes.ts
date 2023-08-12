/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-08-26 17:00:10
 * @LastEditTime: 2022-11-16 21:08:11
 * @LastEditors: zouyaoji
 * @Description:
 * @FilePath: \lc_-sys_-platform\src\router\routes.ts
 */
/**
 * 在布局内显示
 */
const frameIn = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@src/layouts/MainLayout.vue'),
    redirect: { path: import.meta.env.VITE_VUE_DEFAULT_PATH },
    children: []
  }
]
/**
 * 在布局之外显示
 */
const frameOut = [
  // Always leave this as last one,
  // but you can also remove it
  {
    name: 'login',
    path: '/login',
    component: () => import('@src/pages/system/Login.vue')
  },
  {
    path: '/:catchAll(.*)*',
    name: '404',
    component: () => import('@src/pages/system/Error404.vue')
  }
]

export const frameInRoutes = frameIn

export default [...frameIn, ...frameOut]
