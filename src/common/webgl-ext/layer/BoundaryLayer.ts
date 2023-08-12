/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-07 14:21:57
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 23:24:29
 * @FilePath: \vue-map-demo\src\common\webgl-ext\layer\BoundaryLayer.ts
 */
import { cleanupFramebuffer, deleteWebGLObjects, earcutGeoJSON, noop, renderWebGLBoundary } from '../util/webgl'
import CustomLayer from './CustomLayer'
import type { Map, LngLat } from 'maplibre-gl'
import {
  createProgramInfo,
  createFramebufferInfo,
  createTexture,
  bindFramebufferInfo,
  createBufferInfoFromArrays,
  isWebGL2
} from 'twgl.js'
import type { ProgramInfo, AttribInfo, FramebufferInfo, BufferInfo } from 'twgl.js'

const vertexShaderSource = `
  #define GLSLIFY 1
  uniform mat4 u_matrix;
  attribute vec2 a_position;
  void main(){
    gl_Position=u_matrix*vec4(a_position,0.0,1.0);
  }
`
const fragmentShaderSource = `
precision mediump float;
#define GLSLIFY 1
void main(){
  gl_FragColor=vec4(1.0);
}
`

export default class BoundaryLayer extends CustomLayer {
  _boundaryProgram: {
    programInfo: ProgramInfo
    framebuffer: WebGLFramebuffer
    bufferInfo?: BufferInfo
  }
  _boundaryScreenProgram: {
    programInfo: ProgramInfo
    framebufferInfo?: FramebufferInfo
    bufferInfo: BufferInfo
  }
  onInitPrograms(map: Map, gl: WebGLRenderingContext) {
    console.log('isWebGL2', isWebGL2(gl))
    this._boundaryProgram = {
      programInfo: createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]),
      framebuffer: gl.createFramebuffer()
    }
    this._boundaryScreenProgram = {
      programInfo: createProgramInfo(gl, [
        `
        #define GLSLIFY 1
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main(){
          v_texCoord=a_position;
          vec2 position=a_position*2.0-1.0;
          gl_Position=vec4(position,0.0,1.0);
        }
        `,
        `precision mediump float;
        #define GLSLIFY 1
        uniform sampler2D u_screen;
        varying vec2 v_texCoord;
        void main(){
          gl_FragColor=texture2D(u_screen,v_texCoord);
        }`
      ]),
      bufferInfo: createBufferInfoFromArrays(gl, {
        a_position: {
          numComponents: 2,
          data: [0, 0, 0, 1, 1, 1, 1, 0]
        },
        indices: [0, 1, 2, 0, 2, 3]
      })
    }

    this.onMapResize()
  }

  onAdd(map: Map, gl: WebGLRenderingContext) {
    super.onAdd(map, gl)
    this.onInitPrograms(map, gl)
    this.onChangeOptions(this.options)
  }

  onRemove(map: Map, gl: WebGLRenderingContext) {
    super.onRemove(map, gl)
    deleteWebGLObjects(gl, this._boundaryProgram, this._boundaryScreenProgram)
  }

  onDraw(gl: WebGLRenderingContext, matrix: Array<number>) {
    //
  }

  render(gl: WebGLRenderingContext, matrix: Array<number>) {
    let framebufferInfo: FramebufferInfo = undefined
    const programInfo = this._boundaryScreenProgram.programInfo
    if (this.isValidBoundary()) {
      framebufferInfo = createFramebufferInfo(
        gl,
        [
          {
            attachment: createTexture(gl, {
              width: gl.drawingBufferWidth,
              height: gl.drawingBufferHeight
            })
          },
          {
            format: gl.STENCIL_INDEX8
          }
        ],
        gl.drawingBufferWidth,
        gl.drawingBufferHeight
      )

      cleanupFramebuffer(gl, this._boundaryScreenProgram.framebufferInfo)
      bindFramebufferInfo(gl, (this._boundaryScreenProgram.framebufferInfo = framebufferInfo))
      gl.enable(gl.STENCIL_TEST)
      gl.clear(gl.STENCIL_BUFFER_BIT)
      gl.stencilFunc(gl.ALWAYS, 1, 255)
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)
      gl.stencilMask(255)
      gl.colorMask(!1, !1, !1, !1)
      this.renderBoundary(gl, matrix)
      gl.stencilFunc(gl.EQUAL, 1, 255)
      gl.stencilMask(0)
      gl.colorMask(!0, !0, !0, !0)
      this.onDraw(gl, matrix)
      bindFramebufferInfo(gl, null)
      gl.disable(gl.STENCIL_TEST)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.useProgram(programInfo.program)
      renderWebGLBoundary(gl, this._boundaryScreenProgram, {
        u_screen: framebufferInfo.attachments[0]
      })
    } else {
      this.onDraw(gl, matrix)
    }
  }

  renderBoundary(gl: WebGLRenderingContext, matrix: Array<number>) {
    const boundaryProgram = this._boundaryProgram
    gl.useProgram(boundaryProgram.programInfo.program)
    renderWebGLBoundary(gl, boundaryProgram, {
      u_matrix: matrix
    })
  }

  changeBoundary() {
    const { _boundaryProgram, gl } = this
    const boundary = this.options.boundary
    _boundaryProgram.bufferInfo = undefined
    try {
      if (boundary) {
        const { indices, vertices } = earcutGeoJSON(boundary.geometry)
        _boundaryProgram.bufferInfo = createBufferInfoFromArrays(gl, {
          a_position: {
            numComponents: 2,
            data: vertices
          },
          indices: indices
        })
      }
    } catch (error) {
      //
    }
  }

  isValidBoundary() {
    return null !== this._boundaryProgram.bufferInfo
  }

  onChangeOptions(options) {
    super.onChangeOptions(options)
    options.boundary && this.changeBoundary()
  }

  isInBoundary(lngLat: LngLat) {
    return false
  }
}
