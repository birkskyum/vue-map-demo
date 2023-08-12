/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-05-27 19:05:49
 * @LastEditTime: 2023-05-28 22:14:14
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \rose-radar-insight\src\types\user.ts
 */
export interface UserInfo {
  /**
   * 用户id
   */
  id: string
  /**
   * 用户名
   */
  name: string
  /**
   * 中文名
   */
  cname: string
  /**
   * 单位
   */
  institution: string
  /**
   * 省
   */
  province: string
  /**
   * 市
   */
  city: string
  /**
   * 创建时间
   */
  createdAt?: string
  /**
   * 更新时间
   */
  updatedAt?: string
  /**
   * 删除时间
   */
  deletedAt?: string
  // permissions?: string[]
  // roles: number[]
}
