/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-09-12 02:02:03
 * @LastEditTime: 2022-12-03 15:48:38
 * @LastEditors: zouyaoji
 * @Description:
 * @FilePath: \lc_-sys_-platform\src\types\all.ts
 */

import type { Emitter } from 'mitt'
import type { Map } from 'ol'

export type LmlMittEvents = {
  //
}

export interface LmlProvider {
  mitt: Emitter<LmlMittEvents>
}

export interface MapProvider {
  map: Map
  mapPromise?: Promise<Map>
}
