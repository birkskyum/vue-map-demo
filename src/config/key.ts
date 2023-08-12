/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-09-12 01:59:09
 * @LastEditTime: 2022-09-12 02:04:32
 * @LastEditors: zouyaoji
 * @Description:
 * @FilePath: \lc_-sys_-platform\src\config\key.ts
 */
const hasSymbol = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol'

export const lmlKey = hasSymbol ? Symbol('___lml___') : '___lml___'
export const mapKey = hasSymbol ? Symbol('___map_service___') : '___map_service___'
