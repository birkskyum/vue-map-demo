/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-07 20:24:35
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 23:46:26
 * @FilePath: \vue-map-demo\src\common\webgl-ext\layer\InterpolationLayer.ts
 */
import {
  bindFramebufferInfo,
  createAttribsFromArrays,
  createBufferInfoFromArrays,
  createFramebufferInfo,
  createProgramInfo,
  createTexture
} from 'twgl.js'
import ColormapLayer from './ColormapLayer'
import { type Map, LngLatBounds } from 'maplibre-gl'
import { cleanupFramebuffer, deleteWebGLObjects, renderWebGLBoundary } from '../util/webgl'
import QualitativeColormap from '../core/QualitativeColormap'

const shaderSourceString = `
#define GLSLIFY 1
attribute vec2 a_position;
varying vec2 v_texPosition;

void main() {
  v_texPosition = a_position;
  vec2 position = a_position * 2.0 - 1.0;
  gl_Position = vec4(position.x, position.y, 0.0, 1.0);
}
`

export default class InterpolationLayer extends ColormapLayer {
  _computationProgram: any
  _computationResultProgram: any
  onInitPrograms(map: Map, gl: WebGLRenderingContext) {
    super.onInitPrograms(map, gl)
    this._createComputationProgram(gl)
  }

  _createComputationProgram(gl: WebGLRenderingContext) {
    const computationShader = createProgramInfo(gl, [
      shaderSourceString,
      `
      precision mediump float;
      precision mediump sampler2D;
      #define GLSLIFY 1
      varying vec2 v_texPosition;
      uniform vec3 u_point;
      uniform vec4 u_lnglat_bounds;
      uniform vec2 u_resolution;
      uniform float u_power;

      void main() {
        vec2 lngLat = mix(u_lnglat_bounds.xy, u_lnglat_bounds.zw, vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y));
        float distanceVal = distance(lngLat, u_point.xy);
        float weight = 1.0 / pow(distanceVal, u_power);
        gl_FragColor = vec4(u_point.z * weight, weight, 0.0, 1.0);
      }
      `
    ])
    const computationBuffer = createBufferInfoFromArrays(gl, {
      a_position: {
        numComponents: 2,
        data: [0, 0, 0, 1, 1, 1, 1, 0]
      },
      indices: [0, 1, 2, 0, 2, 3]
    })
    this._computationProgram = {
      programInfo: computationShader,
      bufferInfo: computationBuffer
    }
    this._computationResultProgram = {
      programInfo: createProgramInfo(gl, [
        shaderSourceString,
        `
        precision mediump float;
        precision mediump sampler2D;
        #define GLSLIFY 1
        varying vec2 v_texPosition;
        uniform sampler2D u_computation_texture;

        void main() {
          vec4 data = texture2D(u_computation_texture, v_texPosition);
          float value = data.x / data.y;
          gl_FragColor = vec4(value, 0.0, 0.0, 1.0);
        }
        `
      ]),
      bufferInfo: computationBuffer
    }
  }

  changeData() {
    const { gl, _computationProgram: computationProgram, _computationResultProgram: computationResultProgram } = this
    const { resolution, bounds, power } = this.options
    let { data } = this.options

    // Filter data points within the given bounds
    const boundsRect = new LngLatBounds(bounds)
    data = data.filter(point => boundsRect.contains(point))

    bindFramebufferInfo(gl, computationProgram.framebufferInfo)
    gl.useProgram(computationProgram.programInfo.program)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFunc(gl.ONE, gl.ONE)

    // Render computation program for each data point
    data.forEach(point => {
      renderWebGLBoundary(gl, this._computationProgram, {
        u_point: point,
        u_resolution: resolution,
        u_lnglat_bounds: bounds,
        u_power: power
      })
    })

    bindFramebufferInfo(gl, computationResultProgram.framebufferInfo)
    gl.useProgram(computationResultProgram.programInfo.program)
    gl.disable(gl.BLEND)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Render computation result program
    renderWebGLBoundary(gl, this._computationResultProgram, {
      u_computation_texture: computationProgram.framebufferInfo.attachments[0]
    })

    bindFramebufferInfo(gl, null)
  }

  changeResolution() {
    const gl = this.gl
    const resolution = this.options.resolution
    const [width, height] = resolution

    // Helper function to create a framebuffer with specified dimensions and settings
    function createNewFramebuffer() {
      return createFramebufferInfo(
        gl,
        [
          {
            target: gl.TEXTURE_2D,
            attachment: createTexture(gl, {
              width: width,
              height: height,
              minMag: gl.LINEAR,
              wrap: gl.CLAMP_TO_EDGE,
              type: gl.FLOAT
            })
          }
        ],
        width,
        height
      )
    }

    // Cleanup existing framebuffers
    cleanupFramebuffer(gl, this._computationProgram.framebufferInfo)
    cleanupFramebuffer(gl, this._computationResultProgram.framebufferInfo)

    // Create new framebuffers with updated dimensions
    this._computationProgram.framebufferInfo = createNewFramebuffer()
    this._computationResultProgram.framebufferInfo = createNewFramebuffer()
  }

  onChangeOptions(options) {
    super.onChangeOptions(options)

    // Destructure options object for easier access
    const { data, resolution, bounds, power } = options

    // Check if any of the specified properties have changed
    const hasChanges = data || resolution || bounds || power !== undefined

    if (hasChanges) {
      // Call relevant functions based on changed properties
      if (resolution) {
        this.changeResolution()
      }
      if (power !== undefined) {
        this.changeData()
      }
    }
  }

  getCurrentTexture() {
    return this._computationResultProgram.framebufferInfo.attachments[0]
  }

  onRemove(t, e) {
    super.onRemove(t, e)
    deleteWebGLObjects(e, this._computationResultProgram, this._computationProgram)
  }

  static getInterpolationLayer(colors, stations, mapBoundary, clipColormap = false) {
    // Create a colormap from the provided dataPoints
    const colormapData = colors.map(point => ({
      color: `rgba(${point.stop.join(',')})`,
      value: point.value
    }))

    // Create a QualitativeColormap with the provided colormapData and clipping option
    const colormap = new QualitativeColormap(colormapData, {
      clip: clipColormap
    })

    // Filter and map dataPoints for interpolation layer data
    const interpolationData = stations.map(point => [+point.Lon, +point.Lat, +point.V])

    // Return an InterpolationLayer instance with the specified options
    return new InterpolationLayer({
      data: interpolationData,
      bounds: [73.5575, 18.1664, 135.0419, 53.5609],
      boundary: mapBoundary.features[0],
      opacity: 1,
      power: 3,
      resolution: [457, 401],
      cmap: colormap
    })
  }
}
