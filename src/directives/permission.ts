/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-11-25 01:19:18
 * @LastEditTime: 2022-12-03 13:05:57
 * @LastEditors: zouyaoji
 * @Description:
 * @FilePath: \lc_-sys_-platform\src\directives\permission.ts
 */
import { createDirective } from '@src/utils/create'
import { pinia, store } from '@src/store'

export default createDirective({
  name: 'permission',

  beforeMount(el, binding) {
    //
  },
  mounted(el, binding) {
    const { value } = binding

    const hasPermission = store.system.usePermissionStore(pinia).hasPermission(value)

    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  },
  updated(el, binding) {
    //
  },

  beforeUnmount(el) {
    //
  }
})
