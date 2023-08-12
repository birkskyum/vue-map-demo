/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-04-11 22:55:34
 * @LastEditTime: 2022-11-25 01:21:11
 * @LastEditors: zouyaoji
 * @Description:
 * @FilePath: \lc_-sys_-platform\src\utils\create.ts
 */
import { markRaw } from 'vue'

export const createDirective = raw => markRaw(raw)
