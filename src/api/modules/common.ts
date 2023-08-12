/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-07-04 16:59:07
 * @LastEditTime: 2023-08-12 22:48:13
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \vue-map-demo\src\api\modules\common.ts
 */
import qs from 'qs'
const baseURL = import.meta.env.VITE_VUE_APP_API
import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios'
import Adapter from 'axios-mock-adapter'
import { RequestTools } from '..'

export default ({
  service,
  request,
  serviceForMock,
  requestForMock,
  mock,
  tools
}: {
  service: AxiosInstance
  request: (config: AxiosRequestConfig<any>) => Promise<any>
  serviceForMock: AxiosInstance
  requestForMock: (config: AxiosRequestConfig<any>) => AxiosPromise<any>
  mock: Adapter
  tools: RequestTools
}) => ({
  /**
   * 获取静态资源（JSON）等
   * @param {*} fetchStr
   * @returns
   */
  getStaticData(fetchStr, baseURL?) {
    baseURL = baseURL || import.meta.env.BASE_URL
    const res = request({
      baseURL,
      url: fetchStr,
      method: 'get'
    })
    return res.then(data => {
      return {
        code: 0,
        data: data,
        msg: 'success'
      }
    })
  }
})
