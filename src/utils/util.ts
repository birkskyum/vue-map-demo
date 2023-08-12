/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-08-27 15:26:12
 * @LastEditTime: 2023-07-19 22:06:30
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \vue-map-demo\src\utils\util.ts
 */

import { uniqueId } from 'lodash'
import { VxeGridProps } from 'vxe-table'
import XEUtils from 'xe-utils'
// import * as webStorage from './web-storage'
// import db from './db'
// import * as  from './logger'

/**
 * @description 更新标题
 * @param {String} title 标题
 */
export function title(titleText) {
  const processTitle = import.meta.env.VITE_VUE_APP_TITLE || 'VueCesiumDemo'
  window.document.title = `${processTitle}${titleText ? ` | ${titleText}` : ''}`
}

/**
 * @description 打开新页面
 * @param {String} url 地址
 */
export function open(url) {
  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('target', '_blank')
  a.setAttribute('id', 'vc-link-temp')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(document.getElementById('vc-link-temp')!)
}

/**
 * @description 给菜单数据补充上 path 字段
 * @description https://github.com/d2-projects/d2-admin/issues/209
 * @param {Array} menu 原始的菜单数据
 */
export function supplementPath(menu) {
  return menu.map(e => ({
    ...e,
    path: e.path || uniqueId('vc-menu-empty-'),
    ...(e.children
      ? {
          children: supplementPath(e.children)
        }
      : {})
  }))
}

/**
 * 生成随机len位数字
 */
export function randomLenNum(len, date) {
  let random = ''
  random = Math.ceil(Math.random() * 100000000000000)
    .toString()
    .substring(0, len || 4)
  if (date) random = random + Date.now()
  return random
}

/**
 * 验证文件名是否合法
 * @param fileName
 * @returns
 */
export function validateFileName(fileName) {
  const reg = new RegExp('[\\\\/:*?"<>|]')
  if (reg.test(fileName)) {
    return false
  }
  return true
}

/**
 * 验证经度是否是合法的经度
 * @param lng
 * @returns
 */
export function validateLongitude(lng) {
  const reg = /^[-+]?((180(\.0+)?)|((1[0-7]\d|\d{1,2})(\.\d+)?))$/
  return reg.test(lng)
}

/**
 * 验证纬度是否合法
 * @param lat
 * @returns
 */
export function validateLatitude(lat) {
  const reg = /^[-+]?((90(\.0+)?)|([1-8]?\d(\.\d+)?))$/
  return reg.test(lat)
}

export const getObjByValue = (value, list, key = 'id') => {
  return list.find(e => e[key] == value)
}

// 中国的经纬度范围
const chinaBounds = {
  minLon: 73.5575,
  maxLon: 135.0419,
  minLat: 18.1664,
  maxLat: 53.5609
}

// 生成随机数
function getRandom(min, max) {
  return Math.random() * (max - min) + min
}

// 生成随机站点
export function generateRandomSites(count) {
  const sites = []
  for (let i = 0; i < count; i++) {
    const lon = getRandom(chinaBounds.minLon, chinaBounds.maxLon)
    const lat = getRandom(chinaBounds.minLat, chinaBounds.maxLat)
    const temperature = getRandom(-10, 40) // 温度范围在 -10 到 40 度之间
    sites.push({ Lon: lon, Lat: lat, V: temperature })
  }
  return sites
}
