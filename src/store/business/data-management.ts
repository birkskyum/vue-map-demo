/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-05-13 16:13:37
 * @LastEditTime: 2023-05-31 22:24:58
 * @LastEditors: cweibo legend2weibo@gmail.com
 * @Description:
 * @FilePath: \lc_-sys_-platform\src\store\business\data-management.ts
 */
import { acceptHMRUpdate, defineStore } from 'pinia'
import { remove } from 'lodash'

// main is the name of the store. It is unique across your application
// and will appear in devtools
export const useDataManagementStore = defineStore('data-management', {
  // a function that returns a fresh state
  state: () => ({
    uploadFileList: [],
    seletedProjectRow: undefined,
    seletedCategoryRow: undefined
  }),
  // optional getters
  getters: {},
  // optional actions
  actions: {
    /**
     * 通过 id 删除 uploadFileList 的数据。
     * @param id
     */
    removeUploadFileById(id) {
      remove(this.uploadFileList, v => v.id === id)
    }
  }
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataManagementStore, import.meta.hot))
}
