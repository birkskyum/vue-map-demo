/*
 * @Author: cweibo legend2weibo@gmail.com
 * @Date: 2023-07-24 20:16:04
 * @LastEditTime: 2023-07-24 21:59:22
 * @LastEditors: cweibo
 * @FilePath: \vue-map-demo\src\utils\legend.ts
 * @Description:
 */
import type { ColorMap } from '@src/config/colorMaps'
import colorMaps from '@src/config/colorMaps'

export function getColorMapByElementID(elementID: string): ColorMap | undefined {
  const element = colorMaps.filter(item => item.elementID === elementID)
  let result = undefined

  if (element && element.length) {
    result = element[0]
  } else {
    console.log('获取数据失败')
  }

  return result
}
