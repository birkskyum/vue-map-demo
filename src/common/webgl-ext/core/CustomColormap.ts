import color from 'color'

export default class CustomColormap {
  colors: any[]
  _container: any
  _target: any
  options: any
  constructor(colorStops, settings) {
    if (null == colorStops || colorStops.length < 2)
      throw new Error('Color stop length must be greater than or equal to 2')
    this.colors = cloneColorStops(colorStops).map(
      stop => (
        (stop.color = color(stop.color)
          .alpha(null == stop.alpha ? 1 : stop.alpha)
          .string()),
        stop
      )
    )
    assignOptions(this, settings)
    this._container = null
    this._target = null
  }
  setContainer(element) {
    let div

    if (this._target) {
      this._target.parentNode.removeChild(this._target)
      this._target = null
    }

    element && (div = createElement('div'))
    this._target = div
    this.update()
    element.appendChild(div)

    return this
  }
  addColor(colorStop, index) {
    this.colors.splice(index, 0, colorStop)
  }
  removeColor(index) {
    this.colors.splice(index, 1)
  }
  isHorizontal() {
    return 'horizontal' === this.options.direction
  }
  update() {
    let gradient
    if (null != this._target) {
      const { direction, label, theme, size } = this.options
      gradient = this.getCssGradient()
      this.setSize()
      this._target.className = 'custom-color-map ' + (this.isHorizontal() ? '' : direction) + ' ' + theme
      this._target.innerHTML = `\n      <div class="custom-color-map-ramp" style="background: linear-gradient(${
        this.isHorizontal() ? 'to right' : 'to top'
      }, ${gradient})"></div>\n      ${
        label ? `<div class="custom-color-map-label">${this.getLabelHTML()}</div>` : ''
      }\n    `
    }
  }
  setTheme(theme) {
    return (this.options.theme = theme), this
  }
  setSize() {
    const style = this._target.style
    const [width, height] = this.options.size
    ;(style.width = isNaN(width) ? width : width + 'px'), (style.height = isNaN(height) ? height : height + 'px')
  }
  create() {
    //
  }
  getValueRange(colorStops = this.colors) {
    return [colorStops[0].value, colorStops[colorStops.length - 1].value]
  }
  getMinValue() {
    return this.colors[0].value
  }
  getMaxValue() {
    return this.colors[this.colors.length - 1].value
  }
  getCssGradient() {
    //
  }
  getLabelHTML(colorStops = this.colors) {
    const [minValue, maxValue] = this.getValueRange(),
      position = this.isHorizontal() ? 'left' : 'bottom'
    return (
      this.isHorizontal(),
      colorStops
        .map(
          ({ value }) =>
            `<span class="custom-color-map-label__text" style="${position}: ${
              100 * Math.abs(+normalizeValue(value, minValue, maxValue))
            }%">${value}</span>`
        )
        .join('')
    )
  }
}

function cloneColorStops(stops) {
  return JSON.parse(JSON.stringify(stops))
}

function assignOptions(target, options = {}) {
  target.options = mergeObjects(Object.create(target.constructor.options || null), options)
}

function mergeObjects(target, source) {
  for (const property in source) target[property] = source[property]
  return target
}

function createElement(elementType, className?) {
  const element = document.createElement(elementType)
  className && (element.className = className)
  return element
}

function normalizeValue(value, minValue, maxValue, clamp = false) {
  return (clamp ? clampValue(value, minValue, maxValue) : value - minValue) / (maxValue - minValue)
}

function clampValue(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue))
}
