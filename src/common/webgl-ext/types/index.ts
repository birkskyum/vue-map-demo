/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-07 11:15:22
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 22:49:44
 * @FilePath: \vue-map-demo\src\common\webgl-layer\types\index.ts
 */
import type { Map, MercatorCoordinate, Evented } from 'maplibre-gl'

export type AnyFunction<T = void> = (...args: any[]) => T

export type Listener = {
  target: Evented
  eventName: string
  handler: AnyFunction
}

export type ProjectionSpecification = {
  name:
    | 'albers'
    | 'equalEarth'
    | 'equirectangular'
    | 'lambertConformalConic'
    | 'mercator'
    | 'naturalEarth'
    | 'winkelTripel'
    | 'globe'
  center?: [number, number]
  parallels?: [number, number]
}

export type CustomRenderMethod = (
  gl: WebGLRenderingContext,
  matrix: Array<number>,
  projection: ProjectionSpecification,
  projectionToMercatorMatrix?: Array<number>,
  projectionToMercatorTransition?: number,
  centerInMercator?: Array<number>,
  pixelsPerMeterRatio?: number
) => void

export type CustomLayerInterface = {
  id: string
  type: 'custom'
  renderingMode: '2d' | '3d'
  render: CustomRenderMethod
  prerender?: CustomRenderMethod
  renderToTile?: (gl: WebGLRenderingContext, tileId: MercatorCoordinate) => void
  shouldRerenderTiles?: () => boolean
  onAdd?: (map: Map, gl: WebGLRenderingContext) => void
  onRemove?: (map: Map, gl: WebGLRenderingContext) => void
}

export type Uniforms = {
  [key: string]: (...params: any[]) => any
}
