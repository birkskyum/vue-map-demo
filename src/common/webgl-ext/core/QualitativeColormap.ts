/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-12 10:26:27
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 21:14:56
 * @FilePath: \vue-map-demo\src\common\mapbox-ext\core\QualitativeColormap.ts
 */

import CustomColormap from './CustomColormap'

export default class QualitativeColormap extends CustomColormap {
  constructor(colors, options) {
    super(colors, options)
  }

  getCssGradient(colors = this.colors) {
    let position = 0,
      previousColor = 'transparent'
    const gradientStops = []
    const [minValue, maxValue] = this.getValueRange(colors)
    for (let index = 0; index < colors.length - 1; index++) {
      const { color, value } = colors[index]
      const gradientPercentage = ((colors[index + 1].value - value) / (maxValue - minValue)) * 100
      gradientStops.push(`${previousColor} ${position}%`, `${color} ${position}%`)
      previousColor = color
      position += gradientPercentage
    }
    return gradientStops.join(',')
  }

  create() {
    const colors = this.colors
    // eslint-disable-next-line prefer-const
    let [minValue, maxValue] = this.getValueRange(colors)
    const context = createCanvasContext()
    minValue = 10 * (maxValue - minValue)
    context.canvas.width = minValue
    context.canvas.height = 30
    let currentPosition = 0
    for (let index = 0; index < colors.length - 1; ) {
      const currentStop = colors[index++]
      const stopWidth = 10 * (colors[index].value - currentStop.value)
      context.fillStyle = currentStop.color
      context.fillRect(currentPosition, 0, stopWidth, 30)
      currentPosition += stopWidth
    }
    return context.getImageData(0, 0, minValue, 30)
  }

  isLinear() {
    return false
  }
}

function createCanvasContext() {
  return createElement('canvas').getContext('2d')
}

function createElement(elementType, className?) {
  const element = document.createElement(elementType)
  className && (element.className = className)
  return element
}
