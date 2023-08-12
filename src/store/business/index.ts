/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-09-21 21:08:07
 * @LastEditTime: 2022-11-08 01:16:44
 * @LastEditors: zouyaoji
 * @Description:
 * @FilePath: \lc_-sys_-platform\src\store\business\index.ts
 */
import { Pinia } from 'pinia'
import { useDataManagementStore } from './data-management'

export const businessStore = {
  useDataManagementStore: (pinia?: Pinia) => useDataManagementStore(pinia)
}
