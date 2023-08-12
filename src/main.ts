/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-12-08 23:26:13
 * @LastEditTime: 2023-05-29 01:19:18
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \rose-radar-insight\src\main.ts
 */
import { createApp } from 'vue'
import { Quasar, Notify, Dialog, LocalStorage, Loading, AppFullscreen } from 'quasar'
import quasarLang from 'quasar/lang/zh-CN'
import { ElCascader, ElTreeSelect, provideGlobalConfig } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// Import store and router instances
import { pinia } from '@store/index'
import router from '@router/index'
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
// Import Quasar css
import 'quasar/src/css/index.sass'

import '@src/assets/style/index.scss'

// Import vxe-table css
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import 'element-plus/dist/index.css'
// import { i18n } from '@src/i18n'
import App from './App.vue'
import { Permission } from './directives'

const app = createApp(App)
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    LocalStorage,
    Loading,
    AppFullscreen
  }, // import Quasar plugins and add here
  lang: quasarLang
})
app.use(ElCascader)
app.use(ElTreeSelect)
provideGlobalConfig(
  {
    locale: zhCn
  },
  app,
  true
)
app.use(VXETable)
// app.use(i18n)
app.use(pinia)
app.use(router)
app.directive('permission', Permission)
app.mount('#app')
