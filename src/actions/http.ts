
import Taro from '@tarojs/taro'
import { NewsList } from '../constants/http'
const normalizing = (type = '', payload = {}, option = {}) => {
  return Object.assign({
    type,
    cache: true,
    payload
  }, option)
}
export const newsList = () =>{
  return async dispatch => {
    let { data } = await Taro.request({
      url: 'https://kuaibao.qq.com/n/getKbMainpageInfo',
    })
    dispatch(normalizing(NewsList, data))
    return data
  }
}