/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-06 02:36:52
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 23:16:32
 * @FilePath: \vue-map-demo\src\common\webgl-ext\layer\CustomLayer.ts
 */
import Base from '../core/Base'
import type { Map } from 'maplibre-gl'
import { CustomLayerInterface } from '../types'
import { addExtensionsToContext } from 'twgl.js'

export default class CustomLayer extends Base {
  id: string
  renderingMode: string
  type: string
  map: Map
  constructor(options = {} as any) {
    super(options)
    this.id = options.id || 'custom_' + CustomLayer.CID++
    this.type = 'custom'
    this.renderingMode = '2d'
    this.map = null
  }

  static CID = 0

  get gl() {
    const map: any = this.map
    return map.painter.context.gl as WebGLRenderingContext
  }

  onAdd(map: Map, gl: WebGLRenderingContext) {
    addExtensionsToContext(gl)
    this.map = map
    this.listen(map, 'resize', this.onMapResize.bind(this))
  }

  prerender(gl: WebGLRenderingContext, matrix: Array<number>) {
    //
  }

  render(gl: WebGLRenderingContext, matrix: Array<number>) {
    //
  }

  onRemove(map: Map, gl: WebGLRenderingContext) {
    this.dispose()
  }

  changeOptions(options: CustomLayerInterface) {
    super.changeOptions(options)
    this.onChangeOptions(options)
    this.map.triggerRepaint()
    return this
  }

  onChangeOptions(options: CustomLayerInterface) {
    //
  }

  onMapResize(layer?: CustomLayer) {
    //
  }
}
