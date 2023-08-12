/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-09-02 10:27:38
 * @LastEditTime: 2023-08-12 22:48:48
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \vue-map-demo\src\api\tools.ts
 */
import { Notify } from 'quasar'
import { store, pinia } from '@store/index'
import { logger } from '@src/utils'

/**
 * @description 安全地解析 json 字符串
 * @param {String} jsonString 需要解析的 json 字符串
 * @param {String} defaultValue 默认值
 */
export function parse(jsonString = '{}', defaultValue = {}) {
  let result = defaultValue as any
  try {
    result = JSON.parse(jsonString)
  } catch (error) {
    logger.error(error)
  }
  return result
}

/**
 * @description 接口请求返回
 * @param {Any} data 返回值
 * @param {String} msg 状态信息
 * @param {Number} code 状态码
 */
export function response(data = {}, msg = '', code = 0) {
  return [200, { code, msg, data }]
}

/**
 * @description 接口请求返回 正确返回
 * @param {Any} data 返回值
 * @param {String} msg 状态信息
 */
export function responseSuccess(data = {}, msg = '成功') {
  return response(data, msg)
}

/**
 * @description 接口请求返回 错误返回
 * @param {Any} data 返回值
 * @param {String} msg 状态信息
 * @param {Number} code 状态码
 */
export function responseError(data = {}, msg = '请求失败', code = 500) {
  return response(data, msg, code)
}

/**
 * @description 记录和显示错误
 * @param {Error} error 错误对象
 */
export function errorLog(error) {
  // 添加到日志
  store.system.useLogStore(pinia).push({
    message: '数据请求异常',
    type: 'danger',
    meta: {
      error
    }
  })
  // 打印到控制台
  if (import.meta.env.MODE === 'development') {
    logger.danger('>>>>>> Error >>>>>>')
    console.log(error)
  }
  // 显示提示
  // Notify.create({
  //   message: error.message,
  //   type: 'negative',
  //   timeout: 3 * 1000
  // })
}

/**
 * @description 创建一个错误
 * @param {String} msg 错误信息
 */
export function errorCreate(msg) {
  const error = new Error(msg)
  errorLog(error)
  throw error
}
