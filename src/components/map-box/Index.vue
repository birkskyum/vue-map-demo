<!--
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-04 17:05:26
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 23:59:40
 * @FilePath: \vue-map-demo\src\components\map-box\Index.vue
-->
<template>
  <div id="map" ref="mapRef" style="height: 100%">
    <slot></slot>
    <div id="coordinates"></div>
  </div>
</template>

<script setup lang="ts">
import mapbox from 'mapbox-gl'
import { onMounted } from 'vue'
import { FeatureCollection } from 'geojson'
import InterpolationLayer from '@src/common/webgl-ext/layer/InterpolationLayer'
import colors from './colors'
import { generateRandomSites } from '@src/utils/util'
import * as api from '@src/api'

onMounted(() => {
  const map = new mapbox.Map({
    container: 'map', // 地图容器的ID
    accessToken: 'pk.eyJ1IjoibGl6aGFuMTIyNyIsImEiOiJja3QyamowNnMwcGprMnhtaDUwbTM3YXdtIn0.rDMU626lA9qzB8Do2cq_hA',
    center: [120, 29], // 设置地图中心点的经纬度
    zoom: 3 // 设置地图缩放级别,
  })

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [120, 29]
        },
        properties: { POP: 1, CAPITAL: 'test' }
      }
    ]
  }

  // 添加鼠标经纬度显示
  map.on('mousemove', function (e) {
    var coordinates = e.lngLat
    document.getElementById('coordinates').innerHTML =
      '经度: ' + coordinates.lng.toFixed(6) + ', 纬度: ' + coordinates.lat.toFixed(6)
  })

  map.addSource('tianditu_vec', {
    type: 'raster',
    tiles: [
      'https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311',
      'https://t1.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311',
      'https://t2.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311',
      'https://t3.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311',
      'https://t4.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311',
      'https://t5.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311',
      'https://t6.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311',
      'https://t7.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311'
    ],
    tileSize: 256
  })

  // 添加影像瓦片图层
  map.addLayer({
    id: 'tianditu_vec_layer',
    type: 'raster',
    source: 'tianditu_vec',
    paint: {
      'raster-opacity': 1 // 设置天地图影像瓦片的透明度
    }
  })

  map.loadImage('/images/marker-icon.png', function (error, image) {
    if (error) throw error
    map.addImage('positionPoint', image)
    map.addSource('addPointsSource', {
      type: 'geojson',
      data: featureCollection
    })
    map.addLayer({
      id: 'addPoint',
      type: 'circle',
      source: 'addPointsSource',
      paint: {
        'circle-radius': 8,
        'circle-color': 'rgba(255, 0, 0, 0.2)',
        'circle-stroke-color': 'red',
        'circle-stroke-width': 2
        //                    "circle-translate": [0, 13] //设置偏移量
      }
    })
  })

  const stations = generateRandomSites(3000)
  api.common.getStaticData('/datas/china.json').then(res => {
    const layer = InterpolationLayer.getInterpolationLayer(colors, stations, res.data, true)
    map.addLayer(layer as any)
  })
})
</script>

<style lang="scss" scoped>
#coordinates {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: whitesmoke;
  background: rgba($color: #333, $alpha: 0.8);
}
</style>
