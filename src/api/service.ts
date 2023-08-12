/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-09-02 10:12:49
 * @LastEditTime: 2023-08-12 22:48:29
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \vue-map-demo\src\api\service.ts
 */
import Adapter from 'axios-mock-adapter'
import { get } from 'lodash'
import { logger, webStorage } from '@src/utils'
import axios, { Axios, AxiosInstance, AxiosRequestConfig } from 'axios'
import { errorLog, errorCreate } from './tools'
import router from '@src/router'
import { LocalStorage } from 'quasar'

/**
 * @description 创建请求实例
 * @returns
 */
const createService = () => {
  // 创建一个 axios 实例
  const service = axios.create({})
  // const service = api
  // 请求拦截
  service.interceptors.request.use(
    config => config,
    error => {
      // 发送失败
      errorLog(error)
      return Promise.reject(error)
    }
  )
  // 响应拦截
  service.interceptors.response.use(
    response => {
      // dataAxios 是 axios 返回数据中的 data
      const dataAxios = response.data
      // 这个状态码是和后端约定的
      const { code } = dataAxios
      // 根据 code 进行判断
      if (code === undefined) {
        // 如果没有 code 代表这是非约定返回 或者不是项目后端开发的接口
        return dataAxios
      } else {
        // 有 code 代表这是一个后端接口 可以进行进一步的判断
        switch (code) {
          case 0:
            // [ 示例 ] code === 0 代表没有错误
            // return dataAxios.data
            return dataAxios
          case 200:
            // [ 示例 ] code === 0 代表没有错误
            // return dataAxios.data
            return dataAxios
          case 'xxx':
            // [ 示例 ] 其它和后台约定的 code
            errorCreate(`[ code: xxx ] ${dataAxios.msg}: ${response.config.url}`)
            break
          default:
            // 不是正确的 code
            errorCreate(`${dataAxios.msg}: ${response.config.url}`)
            return Promise.reject(dataAxios)
        }
      }
    },
    error => {
      const status = get(error, 'response.status')
      switch (status) {
        case 400:
          error.message = error?.response?.data?.msg || '请求错误'
          break
        case 401:
          error.message = '未授权，请登录'
          webStorage.removeLocalStorage('token')
          webStorage.removeLocalStorage('uuid')
          router.push('/login')
          break
        case 403:
          error.message = '拒绝访问'
          break
        case 404:
          error.message = `请求地址出错: ${error.response.config.url}`
          break
        case 408:
          error.message = '请求超时'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        case 501:
          error.message = '服务未实现'
          break
        case 502:
          error.message = '网关错误'
          break
        case 503:
          error.message = '服务不可用'
          break
        case 504:
          error.message = '网关超时'
          break
        case 505:
          error.message = 'HTTP版本不受支持'
          break
        default:
          break
      }
      errorLog(error)
      return Promise.reject(error)
    }
  )
  return service
}

/**
 * @description 创建请求方法
 * @param {Object} service axios 实例
 */
function createRequestFunction(service: AxiosInstance) {
  return function (config: AxiosRequestConfig) {
    const token = webStorage.getLocalStorage('token') as string
    const configDefault = {
      headers: {
        // Authorization: token,
        'Content-Type': get(config, 'headers.Content-Type', 'application/json')
      },
      timeout: 60000,
      baseURL: config.baseURL || import.meta.env.VITE_VUE_APP_API,
      data: {}
    }
    const queryConfig = Object.assign(configDefault, config)
    if (token) {
      queryConfig.headers.Authorization = `Bearer ${token}`
    }
    return service(Object.assign(configDefault, config))
  }
}

// 用于真实网络请求的实例和请求方法
export const service = createService()
export const request = createRequestFunction(service)

// 用于模拟网络请求的实例和请求方法
export const serviceForMock = createService()
export const requestForMock = createRequestFunction(serviceForMock)

// 网络请求数据模拟工具
export const mock = new Adapter(serviceForMock)
