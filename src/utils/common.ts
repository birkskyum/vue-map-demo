/**
 * 根据图层名称获取对应的图层
 * @param map 地图实例
 * @param name 图层名称
 * @returns layer | undefined
 */
export function getLayerByName(map, name: string) {
  const layers = map.getLayers()
  let result = undefined

  layers.forEach(layer => {
    const properties = layer.getProperties()

    if (name === properties.name) {
      result = layer
    }
  })

  return result
}
