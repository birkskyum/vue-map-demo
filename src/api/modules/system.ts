/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-09-06 17:58:31
 * @LastEditTime: 2023-08-12 23:30:01
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \vue-map-demo\src\api\modules\system.ts
 */
import { v4 as uuidv4 } from 'uuid'
import { find, assign } from 'lodash'
import qs from 'qs'
import * as webStorage from '@src/utils/web-storage'
import router from '@src/router'
import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios'
import Adapter from 'axios-mock-adapter'
import { RequestTools } from '..'
import { LocalStorage } from 'quasar'

export type Menu = {
  id: string
  component: string
  icon: string
  islock: boolean
  hidden: boolean
  name: string
  path: string
  permission: string
  sort: number
  title: string
  caption?: string
  type: number
  redirect?: string
  children?: Array<Menu>
}

const users = [
  { username: 'admin', password: 'admin', id: 'admin-uuid', name: 'Admin' },
  { username: 'editor', password: 'editor', id: 'editor-uuid', name: 'Editor' }
]

const menus: Array<Menu> = [
  {
    id: uuidv4(),
    component: 'MainLayout',
    icon: 'cog',
    islock: false,
    hidden: false,
    name: 'layout',
    path: '/',
    permission: '',
    sort: 1000,
    title: 'VueCesiumDemo',
    type: 10,
    children: [
      {
        id: uuidv4(),
        component: '/mapbox',
        icon: 'map-box',
        islock: false,
        hidden: false,
        name: 'mapbox',
        path: '/mapbox',
        permission: 'permission-mapbox',
        sort: 1000,
        caption: '地图测试',
        title: 'message.header.mapbox',
        type: 10
      },
      {
        id: uuidv4(),
        component: '/maplibre-gl',
        icon: 'map-box',
        islock: false,
        hidden: false,
        name: 'maplibre',
        path: '/maplibre-gl',
        permission: 'permission-mapbox',
        sort: 1000,
        caption: '地图测试',
        title: 'message.header.mapbox',
        type: 10
      }
    ]
  }
]

export default ({
  service,
  request,
  serviceForMock,
  requestForMock,
  mock,
  tools
}: {
  service: AxiosInstance
  request: (config: AxiosRequestConfig<any>) => Promise<any>
  serviceForMock: AxiosInstance
  requestForMock: (config: AxiosRequestConfig<any>) => AxiosPromise<any>
  mock: Adapter
  tools: RequestTools
}) => ({
  /**
   * @description 登录
   * @param {Object} data 登录携带的信息
   */
  login(data = {}) {
    console.log(data)
    if (import.meta.env.VITE_MOCK_ENABLED !== 'true') {
      return request({
        url: '/auth/rose-radar-insight/login',
        method: 'post',
        data
      })
    }
    // 模拟数据
    mock.onAny('/auth/login').reply(config => {
      const data = tools.parse(config.data)
      const user = find(users, {
        username: data.username,
        password: data.password
      })
      return user
        ? tools.responseSuccess(assign({}, user, { token: 'f5befe1a-962c-4cdd-bf45-77ce306dbbce' }))
        : tools.responseError({}, '账号或密码不正确')
    })
    // 接口请求
    return requestForMock({
      url: '/auth/login',
      method: 'post',
      data
    })
  },
  /**
   * 获取用户信息
   * @returns 返回用户信息
   */
  getUserInfo() {
    if (import.meta.env.VITE_MOCK_ENABLED !== 'true') {
      return request({
        url: '/user/info',
        method: 'get'
      })
    }
    // 模拟数据
    mock.onAny('/user/info').reply(config => {
      const uuid = webStorage.getLocalStorage('uuid')
      const user = find(users, {
        id: uuid
      })
      if (user) {
        return tools.responseSuccess(assign({}, user))
      } else {
        webStorage.removeLocalStorage('token')
        webStorage.removeLocalStorage('uuid')
        router.push('/login')
        return tools.responseError({}, '未授权, 请登录!')
      }
    })
    // 接口请求
    return requestForMock({
      url: '/user/info',
      method: 'post'
    })
  },
  /**
   * @description 获取有权限的菜单
   * @param {Object} data
   */
  getAccessibleMenus(data = {}) {
    // if (import.meta.env.VITE_MOCK_ENABLED !== 'true') {
    //   return request({
    //     url: '/api/system-management/menu/accessible',
    //     method: 'get',
    //     data
    //   })
    // }
    // 模拟数据
    mock.onAny('/api/menu/accessible').reply(config => {
      return tools.responseSuccess(menus)
    })
    // 接口请求
    return requestForMock({
      url: '/api/menu/accessible',
      method: 'post',
      data
    })
  }
})
