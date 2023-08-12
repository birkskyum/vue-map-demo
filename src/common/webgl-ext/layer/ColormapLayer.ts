import {
  type ProgramInfo,
  createAttribsFromArrays,
  createProgramInfo,
  createTexture,
  createBufferInfoFromArrays
} from 'twgl.js'
import BoundaryLayer from './BoundaryLayer'
import { type Map, LngLat, LngLatBounds } from 'maplibre-gl'
import AnimFrame from '../core/AnimFrame'
import color from 'color'
import { cleanupTexture, deleteWebGLObjects, renderWebGLBoundary, textureReprojection } from '../util/webgl'

const vertexShaderSource = `
  #define GLSLIFY 1
  uniform mat4 u_matrix;
  attribute vec2 a_position;
  attribute vec2 a_texPosition;
  varying vec2 v_texPosition;

  void main() {
    v_texPosition = a_texPosition;
    gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
  }
  `
export default class ColormapLayer extends BoundaryLayer {
  _gridProgram: any
  _pickProgram: any
  animFrame: AnimFrame
  // eslint-disable-next-line @typescript-eslint/member-delimiter-style
  _colormapMapping: {
    u_stops?: Float32Array
    u_colors?: Float32Array
    u_cmap_clip?: number
    u_texture_colormap?: WebGLTexture
    u_cmap_range?: number
  }
  _currentTexture: any
  _oldTexture: any
  constructor(options) {
    super(options)
    this._gridProgram = {}
    this._pickProgram = {}
    this.animFrame = new AnimFrame(100)
  }

  get cmap() {
    return this.options.cmap
  }

  onCreateBasePickProgram(map: Map, gl: WebGLRenderingContext) {
    return createProgramInfo(gl, [
      `
      #define GLSLIFY 1
      void main() {
        gl_Position = vec4(-1.0, -1.0, 0.0, 1.0);
        gl_PointSize = 2.0;
      }
      `,
      `
      precision highp float;
      #define GLSLIFY 1
      #define FLOAT_MAX 1.70141184e38
      #define FLOAT_MIN 1.17549435e-38

      lowp vec4 encode_float_1540259130(highp float v) {
        highp float av = abs(v);
        if (av < FLOAT_MIN) {
            return vec4(0.0, 0.0, 0.0, 0.0);
        } else if (v > FLOAT_MAX) {
            return vec4(127.0, 128.0, 0.0, 0.0) / 255.0;
        } else if (v < -FLOAT_MAX) {
            return vec4(255.0, 128.0, 0.0, 0.0) / 255.0;
        }
        highp vec4 c = vec4(0, 0, 0, 0);
        highp float e = floor(log2(av));
        highp float m = av * pow(2.0, -e) - 1.0;
        c[1] = floor(128.0 * m);
        m -= c[1] / 128.0;
        c[2] = floor(32768.0 * m);
        m -= c[2] / 32768.0;
        c[3] = floor(8388608.0 * m);
        highp float ebias = e + 127.0;
        c[0] = floor(ebias / 2.0);
        ebias -= c[0] * 2.0;
        c[1] += floor(ebias) * 128.0;
        c[0] += 128.0 * step(0.0, -v);
        return c / 255.0;
      }

      uniform sampler2D u_data_texture;
      uniform vec2 u_lnglat;
      uniform vec4 u_lnglat_bounds;

      void main() {
        vec2 texPosition = (u_lnglat - u_lnglat_bounds.xy) / (u_lnglat_bounds.zw - u_lnglat_bounds.xy);
        texPosition.y = 1.0 - texPosition.y;
        highp float value = texture2D(u_data_texture, texPosition).r;
        vec4 color = encode_float_1540259130(value).abgr;
        gl_FragColor = color;
      }
      `
    ])
  }

  onInitPrograms(map: Map, gl: WebGLRenderingContext) {
    super.onInitPrograms(map, gl)
    this._pickProgram.programInfo = this.onCreateBasePickProgram(map, gl)
  }

  _createQualitativeProgramInfo() {
    const { gl: context, cmap: colormap } = this

    return createProgramInfo(context, [
      vertexShaderSource,
      `
      precision mediump float;
      #define GLSLIFY 1

      varying vec2 v_texPosition;
      uniform sampler2D u_texture;
      uniform float u_opacity;
      uniform bool u_cmap_clip;
      const int length = ${colormap.colors.length};
      uniform float u_stops[length];
      uniform float u_colors[length * 4];

      void main() {
        vec4 rgba = texture2D(u_texture, v_texPosition);
        float value = rgba.r;
        vec4 color = vec4(0.0);

        if (u_cmap_clip) {
          for (int i = length - 1; i >= 0; i--) {
            color = vec4(u_colors[i * 4], u_colors[i * 4 + 1], u_colors[i * 4 + 2], u_colors[i * 4 + 3]) / 255.0;
            if (value >= u_stops[i]) {
              break;
            }
          }
          color.a = min(color.a, u_opacity);
        } else {
          for (int i = 0; i < length - 1; i++) {
            float cur = u_stops[i];
            float nex = u_stops[i + 1];
            if (value >= cur && value < nex) {
              color = vec4(u_colors[i * 4], u_colors[i * 4 + 1], u_colors[i * 4 + 2], u_colors[i * 4 + 3]) / 255.0;
              color.a = min(color.a, u_opacity);
              break;
            }
          }
        }

        gl_FragColor = color;
      }
      `
    ])
  }

  changeColormap() {
    const { gl: context, cmap: colormap } = this
    let programInfo, colormapTexture, colormapMapping

    const hasColormap = colormap !== null && colormap.options.clip !== undefined
    const cmapClip = Number(!(!colormap || !colormap.options.clip))

    if (hasColormap || colormap.isLinear()) {
      const colormapImageData = colormap ? colormap.create() : new ImageData(256, 1)
      const colormapValueRange = colormap ? colormap.getValueRange() : [0, 0]

      colormapTexture = createTexture(context, {
        src: colormapImageData.data,
        width: colormapImageData.width,
        height: colormapImageData.height,
        minMag: context.LINEAR,
        wrap: context.CLAMP_TO_EDGE
      })

      programInfo = createProgramInfo(context, [
        vertexShaderSource,
        `
        precision mediump float;
        #define GLSLIFY 1

        varying vec2 v_texPosition;
        uniform vec2 u_cmap_range;
        uniform sampler2D u_texture;
        uniform sampler2D u_texture_colormap;
        uniform float u_opacity;
        uniform bool u_cmap_clip;

        void main() {
          float value = texture2D(u_texture, v_texPosition).r;
          float stop = (value - u_cmap_range.x) / (u_cmap_range.y - u_cmap_range.x);
          vec4 color;

          color = texture2D(u_texture_colormap, vec2(clamp(stop, 0.0, 1.0)));
          color.a = min(color.a, u_opacity);

          if (!u_cmap_clip && (stop < 0.0 || stop > 1.0)) {
            color = vec4(0.0);
          }

          gl_FragColor = color;
        }
        `
      ])

      colormapMapping = {
        u_texture_colormap: colormapTexture,
        u_cmap_clip: cmapClip,
        u_cmap_range: colormapValueRange
      }
    } else {
      programInfo = this._createQualitativeProgramInfo()

      colormapMapping = {
        u_stops: new Float32Array(colormap.colors.map(c => c.value)),
        u_colors: new Float32Array(colormap.colors.map(c => color(c.color).array().concat(255)).flat()),
        u_cmap_clip: cmapClip
      }
    }

    this._gridProgram.programInfo = programInfo
    this._colormapMapping = colormapMapping
  }

  changeBounds() {
    const gl = this.gl
    const projectedBounds = textureReprojection(this.options.bounds)
    const bufferInfo = createBufferInfoFromArrays(gl, {
      a_position: {
        numComponents: 2,
        data: projectedBounds.projected.flat()
      },
      a_texPosition: {
        numComponents: 2,
        data: projectedBounds.uv.flat()
      },
      indices: projectedBounds.trigs.flat()
    })
    this._gridProgram.bufferInfo = bufferInfo
  }

  changeAnimation() {
    let animationOptions = this.options.animation
    if (animationOptions === false) {
      animationOptions = {
        duration: 0
      }
    }
    this.animFrame = new AnimFrame(animationOptions)
  }

  onChangeOptions(options) {
    super.onChangeOptions(options) // Call the parent class's onChangeOptions method
    const { bounds: newBounds, cmap: newColormap, animation: newAnimation } = options

    // Check if a new colormap is provided or if options have changed, then call changeColormap
    if ((!newColormap && options !== this.options) || newColormap) {
      this.changeColormap()
    }

    // If new bounds are provided, call changeBounds
    if (newBounds) {
      this.changeBounds()
    }

    // If a new animation is defined, call changeAnimation
    if (null != newAnimation) {
      this.changeAnimation()
    }
  }

  getValueAt(t) {
    // TODO:
  }

  isInBounds(t) {
    const bounds = this.options.bounds
    return new LngLatBounds(bounds).contains(t)
  }

  onDraw(gl, matrix) {
    const { _gridProgram: gridProgram, _colormapMapping: colormapMapping } = this
    let { options } = this
    const opacity = options.opacity
    const oldTexture = this.getOldTexture()
    const currentTexture = this.getCurrentTexture()

    gl.useProgram(gridProgram.programInfo.program)
    options = this.animFrame.update().getFrame()
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    renderWebGLBoundary(gl, gridProgram, {
      u_matrix: matrix,
      u_prev_texture: oldTexture,
      u_texture: currentTexture,
      u_opacity: opacity,
      u_frame: options,
      ...colormapMapping
    })

    if (options < 1) {
      this.map.triggerRepaint()
    }
  }

  resetAnimation() {
    this.animFrame.reset()
    return this
  }

  setCurrentTexture(t) {
    const e = this.getOldTexture()
    const r = this.getCurrentTexture()
    r !== e && this.gl.deleteTexture(e)
    this.setOldTexture(r || t)
    this._currentTexture = t
    this.resetAnimation()
  }

  setOldTexture(t) {
    this._oldTexture = t
  }

  getOldTexture() {
    return this._oldTexture
  }

  getCurrentTexture() {
    return this._currentTexture
  }

  onRemove(t, e) {
    super.onRemove(t, e)
    deleteWebGLObjects(e, this._pickProgram, this._gridProgram)
    cleanupTexture(e, this.getOldTexture())
    cleanupTexture(e, this.getCurrentTexture())
    this.setCurrentTexture(null)
    this.setOldTexture(null)
  }
}
