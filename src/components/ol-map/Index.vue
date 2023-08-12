<!--
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-03-25 17:55:21
 * @LastEditTime: 2023-08-12 23:31:38
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \vue-map-demo\src\components\ol-map\Index.vue
-->
<template>
  <div id="ol" ref="mapRef" style="height: 100%">
    <slot></slot>
  </div>

  <!-- <div class="custom-zoom-to-extent-container ol-control ol-unselectable"></div> -->

  <div class="custom-layer-container ol-control ol-unselectable">
    <button type="button" title="首页" @click="onZoomToExtent">
      <q-icon name="home"></q-icon>
    </button>
    <button type="button" title="图层控制" @click="isCustomLayerSelectPanelShow = !isCustomLayerSelectPanelShow">
      <q-icon name="layers"></q-icon>
    </button>

    <div v-show="isCustomLayerSelectPanelShow" class="custom-layer-select-panel">
      <!-- <q-popup-proxy> -->
      <common-panel class="layer-manager" title="图层管理" :show-close-btn="false">
        <q-option-group
          v-model="basemap"
          dense
          :options="baseMapOptions"
          color="secondary"
          size="sm"
          style="padding: 10px"
          @update:model-value="onLayerSelected"
        />
      </common-panel>
      <!-- </q-popup-proxy> -->
    </div>
  </div>
  <!-- <div v-if="mapReady" class="bottomtool row items-center">
    <q-fab color="secondary" padding="xs lg" icon="keyboard_arrow_up" direction="up">
      <div class="basetool">
        <q-toolbar class="text-secondary">
          <q-btn flat round dense icon="menu" />
          <q-toolbar-title> 底图设置 </q-toolbar-title>
        </q-toolbar>
        <q-option-group
          v-model="basemap"
          :options="baseMapOptions"
          color="secondary"
          class="q-pa-md"
          inline
          @update:model-value="changeBaseMap"
        />
      </div>
    </q-fab>
  </div> -->
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed, provide, inject, nextTick } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import View from 'ol/View'
import { Vector as VectorLayer } from 'ol/layer.js'
import { Vector as VectorSource, WMTS as WMTSSource } from 'ol/source.js'
import { Fill, Stroke, Style, Icon } from 'ol/style.js'
import GeoJSON from 'ol/format/GeoJSON'
// import { baidusource, amapsource, tencentsource } from './porjzh.js'
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom'
import { store } from '@src/store'
import { Projection, get as getProjection } from 'ol/proj'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { MousePosition, Zoom, ZoomToExtent } from 'ol/control'
import { createStringXY } from 'ol/coordinate'
import ImageLayer from 'ol/layer/Image'
import CommonPanel from '@components/common-panel/Index.vue'

const mapRef = ref<HTMLElement>(null)
let map: Map = null
const mapReady = ref(false)
const basemap = ref('Tianditu_ter')
const tk = '436ce7e50d27eede2f2929307e6b33c0'
const emits = defineEmits(['mapReady'])

const HOME_EXTENT = [89.4046969999999988, 31.5989809999999984, 103.0709700000000026, 39.2083439999999968]
const isCustomLayerSelectPanelShow = ref(false)

const { toggleGlobalLayout } = store.system.useLayoutStore()
const baseMapOptions = ref([
  {
    label: '高德地图',
    value: 'Amap'
  },
  {
    label: '天地图_矢量',
    value: 'Tianditu'
  },
  {
    label: '天地图_影像',
    value: 'Tianditu_img'
  },
  {
    label: '天地图_地形',
    value: 'Tianditu_ter'
  },
  {
    label: '腾讯地图',
    value: 'Tencent'
  }
  // {
  //   label: '白版图',
  //   value: 'White'
  // }
])

const baseLayer = new TileLayer({
  className: 'baseLayer'
})
const baseLabelLayer = new TileLayer({
  className: 'baseLayer'
})

const changeBaseMap = () => {
  baseLabelLayer.setSource(null)

  switch (basemap.value) {
    case 'Amap':
      // baseLayer.setSource(amapsource)
      break
    case 'Tianditu':
      baseLayer.setSource(
        new XYZ({
          url: `https://t{0-7}.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=${tk}`,
          projection: 'EPSG:4326'
        })
      )
      baseLabelLayer.setSource(
        new XYZ({
          url: `https://t{0-7}.tianditu.gov.cn/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=${tk}`,
          projection: 'EPSG:4326'
        })
      )
      break
    case 'Tianditu_img':
      baseLayer.setSource(
        new XYZ({
          url: `https://t{0-7}.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=${tk}`,
          projection: 'EPSG:4326'
        })
      )
      // eslint-disable-next-line no-case-declarations

      baseLabelLayer.setSource(
        new XYZ({
          url: `https://t{0-7}.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=${tk}`,
          projection: 'EPSG:4326'
        })
      )

      break
    case 'Tianditu_ter':
      baseLayer.setSource(
        new XYZ({
          url: `https://t{0-7}.tianditu.gov.cn/DataServer?T=ter_c&x={x}&y={y}&l={z}&tk=${tk}`,
          projection: 'EPSG:4326'
        })
      )
      // eslint-disable-next-line no-case-declarations

      baseLabelLayer.setSource(
        new XYZ({
          url: `https://t{0-7}.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=${tk}`,
          projection: 'EPSG:4326'
        })
      )

      break
    case 'dark':
      // baseLayer.setSource(baidusource('dark'))
      break
    case 'midnight':
      // baseLayer.setSource(baidusource('midnight'))
      break
    case 'Tencent':
      // baseLayer.setSource(tencentsource)
      break
    default:
      break
  }
}

const onZoomToExtent = () => {
  map.getView().fit(HOME_EXTENT, { duration: 500 })
}

const onLayerSelected = () => {
  isCustomLayerSelectPanelShow.value = false

  changeBaseMap()
}

onMounted(() => {
  map = new Map({
    target: mapRef.value,
    keyboardEventTarget: mapRef.value,
    view: new View({
      // center: [101.778916, 36.623178],
      zoom: 7,
      projection: 'EPSG:4326',
      constrainResolution: true,
      // extent: HOME_EXTENT,
      smoothResolutionConstraint: false
    }),
    controls: [
      new MousePosition({
        coordinateFormat: createStringXY(6),
        projection: 'EPSG:4326',
        className: 'ol-mouse-position-container'
      }),
      new Zoom({
        zoomInTipLabel: '放大',
        zoomOutTipLabel: '缩小',
        className: 'ol-zoom-container'
      })
    ],
    layers: [
      baseLayer,
      baseLabelLayer,
      new ImageLayer({
        properties: { name: 'tifLayer', cname: '静态图层' }
      }),
      new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.2)'
          }),
          stroke: new Stroke({
            color: 'red'
          })
        }),
        properties: { name: 'genLayer', cname: '落区图层' }
      })
    ]
  })
  map.getView().fit(HOME_EXTENT, { duration: 500 })

  emits('mapReady', map)

  /**
   * 取消双击地图放大功能
   */
  const dblClickInteraction = map
    .getInteractions()
    .getArray()
    .find(interaction => {
      return interaction instanceof DoubleClickZoom
    })
  map.removeInteraction(dblClickInteraction)

  mapReady.value = true
  nextTick(() => {
    changeBaseMap()
    map.updateSize()
  })
})

onUnmounted(() => {
  map && map.dispose()
})
</script>
<style lang="scss" scoped>
.basetool {
  // position: fixed;
  // top: 60px;
  width: 500px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #1976d2;
  color: white;
}
.sidetool {
  position: fixed;
  top: 60px;
  right: 20px;
  width: 350px;
}
.bottomtool {
  position: fixed;
  bottom: 5px;
  right: 50%;
  z-index: 8000;
}
</style>

<style lang="scss">
.ol-mouse-position-container {
  position: absolute;
  left: 10px;
  bottom: 4px;
}

.ol-zoom-container {
  & > .ol-zoom-container-in,
  & > .ol-zoom-container-out {
    font-size: inherit !important;
    margin: 1px !important ;
    margin-bottom: 4px !important;
    // line-height: 24px/;
  }
}

// .custom-zoom-to-extent-container {
//   position: absolute;
//   right: 20px;
//   top: 70px;

// }

.custom-layer-container {
  position: absolute;
  right: 20px;
  top: 76px;
  background: transparent;

  button {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
    border-radius: 4px !important;
  }

  .custom-layer-select-panel {
    position: absolute;
    left: -130px;
    top: 0;
    // background: white;

    // background-color: var(--ol-background-color);
    // border-radius: 4px;
    // border: 1px solid rgb(102, 102, 102);
  }
}
</style>

<style lang="scss">
.ol-zoom-container {
  position: absolute;
  right: 20px;
  top: 20px;

  background: transparent;
  &:hover {
    background: transparent;
  }
}

.ol-zoom-container .ol-zoom-container-in,
.ol-zoom-container .ol-zoom-container-out {
  width: 24px;
  height: 24px;
  border-radius: 4px !important;
  font-size: 20px;
  margin: 0;
  margin-bottom: 4px;
}
.ol-zoom-container .ol-zoom-container-in:hover,
.ol-zoom-container .ol-zoom-container-out:hover {
  border: none !important;
}
</style>
