<!--
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-01-04 15:23:46
 * @LastEditTime: 2023-05-31 22:26:42
 * @LastEditors: cweibo legend2weibo@gmail.com
 * @Description:
 * @FilePath: \rose-radar-insight\src\layouts\header\user\Index.vue
-->
<template>
  <q-chip
    v-if="$route.name !== 'login'"
    rounded
    no-caps
    size="md"
    class="q-mr-sm cursor-pointer userChip"
    auto-close
    icon="person"
    text-color="white"
    :label="user.info?.cname"
  >
    <q-menu>
      <q-list dense>
        <q-item v-close-popup clickable dense @click="onItemClick">
          <q-item-section avatar>
            <q-avatar icon="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>注销</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="$route.path !== '/index'" v-close-popup clickable dense @click="dialogVisible = true">
          <q-item-section avatar>
            <q-avatar icon="cloud_upload" />
          </q-item-section>
          <q-item-section>
            <q-item-label>上传列表</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-chip>
</template>

<script lang="ts" setup>
import { store } from '@src/store'
import { ref } from 'vue'
import CommonPanel from '@components/common-panel/Index.vue'

const { toggleGlobalLayout } = store.system.useLayoutStore()
// const { loadDefaultLayers } = store.viewer.useLayerStore()
const user = store.system.useUserStore()
const dialogVisible = ref(false)

const onItemClick = () => {
  store.system
    .useAccountStore()
    .logout({
      confirm: true
    })
    .then(isLogout => {
      if (isLogout) {
        // 注销后默认显示的图层
        // loadDefaultLayers(false)

        toggleGlobalLayout({ featureInfo: false, layerManager: false })
      }
    })
}
</script>

<style lang="scss" scoped>
.userChip {
  background: #2c47ab;
}
</style>
