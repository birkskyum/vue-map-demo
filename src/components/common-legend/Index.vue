<!--
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-07-25 16:05:51
 * @Description: Do not edit
 * @LastEditors: cweibo
 * @LastEditTime: 2023-07-26 23:29:15
 * @FilePath: \vue-map-demo\src\components\common-legend\Index.vue
-->
<template>
  <div class="common-legend-wrapper">
    <div v-show="state.unit" class="header-container">
      <div class="title-container">单位：{{ state.unit }}</div>
    </div>
    <div class="body-container">
      <div v-for="(style, index) in state.styles" :key="index" class="style-container">
        <div class="color-bar" :style="{ backgroundColor: style.color }"></div>
        <div class="label-wrapper">
          <div class="label">
            {{ style.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { getColorMapByElementID } from '@src/utils/legend'

import type { ColorMapStyle } from '@src/config/colorMaps'

const props = defineProps({
  elementId: String
})

const state = reactive({
  styles: [] as ColorMapStyle[],
  unit: ''
})

watch(
  () => props.elementId,
  newValue => {
    const element = getColorMapByElementID(newValue)

    if (element) {
      const { styles, unit } = element
      state.styles = styles
      state.unit = unit
    }
  }
)
</script>

<style lang="scss" scoped>
.common-legend-wrapper {
  background-color: var(--ol-background-color);
  width: 80px;
  // border: 1px solid rgb(102, 102, 102);
  // border-radius: 4px;
  display: flex;
  flex-direction: column;

  .header-container {
    height: 30px;
    line-height: 30px;
    text-align: center;
  }

  .body-container {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;

    .style-container {
      height: 16px;
      display: flex;

      .color-bar {
        height: 16px;
        width: 30px;
      }

      .label-wrapper {
        flex: 1;
        height: 16px;
        position: relative;

        .label {
          position: absolute;
          top: -8px;
          left: 0;
          line-height: 16px;
          text-align: right;
          width: 100%;
        }
      }
    }
  }
}
</style>
