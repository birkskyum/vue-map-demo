/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-07 14:37:44
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 23:27:44
 * @FilePath: \vue-map-demo\src\common\webgl-ext\util\webgl.ts
 */

import { drawBufferInfo, setBuffersAndAttributes, setUniforms, type FramebufferInfo, type ProgramInfo } from 'twgl.js'
import earcut from 'earcut'
import maplibregl from 'maplibre-gl'
import type { Polygon, MultiPolygon } from 'geojson'
import Arrugator from 'arrugator'

export function noop(...t) {
  //
}

export function cleanupTexture(gl: WebGLRenderingContext, texture: WebGLTexture) {
  if (texture instanceof WebGLTexture) {
    gl.deleteTexture(texture)
    return true
  }
  return false
}

export function cleanupFramebuffer(gl: WebGLRenderingContext, framebufferInfo: FramebufferInfo) {
  if (framebufferInfo != null) {
    const { attachments: attachments, framebuffer: framebuffer } = framebufferInfo
    gl.deleteFramebuffer(framebuffer)
    attachments.forEach(att => {
      if (!cleanupTexture(gl, att)) {
        cleanupRenderbuffer(gl, att)
      }
    })
  }
}

function cleanupRenderbuffer(gl: WebGLRenderingContext, renderbuffer: WebGLRenderbuffer) {
  if (renderbuffer instanceof WebGLRenderbuffer) {
    gl.deleteRenderbuffer(renderbuffer)
    return true
  }
  return false
}

function cleanupProgram(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
  const program = programInfo.program
  gl.deleteProgram(program)
}

export function deleteWebGLObjects(gl: WebGLRenderingContext, ...objects) {
  objects.forEach(obj => {
    const { programInfo: programInfo, framebuffer: framebuffer, framebufferInfo: framebufferInfo } = obj
    cleanupFramebuffer(gl, framebufferInfo)
    gl.deleteFramebuffer(framebuffer)
    cleanupProgram(gl, programInfo)
  })
}

export function renderWebGLBoundary(gl: WebGLRenderingContext, boundaryProgram, uniforms: any, type = gl.TRIANGLES) {
  const { programInfo, bufferInfo } = boundaryProgram

  setUniforms(programInfo, uniforms)
  setBuffersAndAttributes(gl, programInfo, bufferInfo)
  drawBufferInfo(gl, bufferInfo, type)
}

export function toMercatorCoordinate(coord) {
  const { x, y } = maplibregl.MercatorCoordinate.fromLngLat(coord)
  return [x, y]
}

function flattenPolygons(polygons) {
  return polygons.reduce((pre, cur) => (pre.push(...toMercatorCoordinate(cur)), pre), [])
}

export function earcutGeoJSON(geometry: MultiPolygon | Polygon) {
  const { type: geoType, coordinates: geoCoordinates } = geometry
  let indices = []
  let vertices = []

  if (geoType === 'Polygon') {
    const flattened = earcut.flatten(geoCoordinates)
    indices = earcut(flattened.vertices, flattened.holes, flattened.dimensions)
    vertices = flattenPolygons(geoCoordinates[0])
  } else if (geoType === 'MultiPolygon') {
    geoCoordinates.forEach(polygon => {
      const { indices: polygonIndices, vertices: polygonVertices } = earcutGeoJSON({
        coordinates: polygon,
        type: 'Polygon'
      })
      const offset = vertices.length / 2
      indices.push(...polygonIndices.map(index => index + offset))
      vertices.push(...polygonVertices)
    })
  }

  return {
    indices: indices,
    vertices: vertices
  }
}

export function textureReprojection(bbox: number[], epsilon = 1e-10) {
  const [r, n, i, t] = bbox
  const o = new Arrugator(
    t => toMercatorCoordinate(t),
    [
      [r, t],
      [r, n],
      [i, t],
      [i, n]
    ],
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ],
    [
      [0, 1, 3],
      [0, 3, 2]
    ]
  )
  o.lowerEpsilon(epsilon)
  return o.output()
}
