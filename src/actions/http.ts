
import Taro from '@tarojs/taro'
import { NewsList, NewsDetail } from '../constants/http'
const normalizing = (type = '', payload = {}, option = {}) => {
  return Object.assign({
    type,
    cache: true,
    payload
  }, option)
}
export const newsList = (page) =>{
  return async dispatch => {
    let { data } = await Taro.request({
      url: 'https://kuaibao.qq.com/n/getKbMainpageInfo',
      data: {
        page
      }
    })
    dispatch(normalizing(NewsList, data))
    return data
  }
}
export const newsDetail = (id) =>{
  return async dispatch => {
    let { data } = await Taro.request({
      url: 'https://kuaibao.qq.com/getSubNewsContent',
      data: {
        id
      }
    })
    dispatch(normalizing(NewsDetail, data))
    return data
  }
}