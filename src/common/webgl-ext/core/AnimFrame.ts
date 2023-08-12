/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2023-08-07 21:04:28
 * @Description: Do not edit
 * @LastEditors: zouyaoji 370681295@qq.com
 * @LastEditTime: 2023-08-12 22:49:25
 * @FilePath: \vue-map-demo\src\common\webgl-layer\core\AnimFrame.ts
 */
export default class AnimFrame {
  duration: number
  startTime_: number
  currentTime_: number
  constructor(options) {
    this.duration = options.duration
    this.reset()
  }
  reset() {
    this.startTime_ = Date.now()
  }
  update() {
    this.currentTime_ = Date.now()
    return this
  }
  getFrame() {
    return this.duration <= 0 ? 1 : Math.min(1, (this.currentTime_ - this.startTime_) / this.duration)
  }
}
