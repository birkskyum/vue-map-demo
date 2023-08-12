/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-06 01:34:07
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 22:49:05
 * @FilePath: \vue-map-demo\src\common\webgl-layer\core\Base.ts
 */
import { Evented } from 'maplibre-gl'
import { AnyFunction, Listener } from '../types'

export default class Base extends Evented {
  listeners: Listener[]
  options: any
  constructor(options) {
    super()
    this.listeners = []
    this.options = Object.assign({}, options)
  }

  changeOptions(options) {
    Object.assign(this.options, options)
    return this
  }

  listen(target: Evented, eventName: string, handler: AnyFunction) {
    this.listeners.push({
      target,
      eventName,
      handler
    })
    target.on(eventName, handler)
  }

  dispose() {
    this.listeners.forEach(({ target, eventName, handler }) => {
      target.off(eventName, handler)
    })
    this.listeners = []
  }
}
