import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, RichText } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { newsDetail } from '../../actions/http'

import './index.scss'

interface anyObject<T = any> {
  [prop: string] : T
}
type PageStateProps = {
  http: {
    // newsDetail: anyObject
  }
}

type PageDispatchProps = {
  newsDetail: (id) => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface User {
  props: IProps;
}

@connect(({ http }) => ({
  http
}), (dispatch) => ({
  newsDetail (id) {
    return dispatch(newsDetail(id))
  }
}))
class User extends Component {
  state: anyObject = {
    ready: false,
    nodes: [],
    detail: {}
  }
  config: Config = {
    navigationBarTitleText: '新闻详情'
  }
  async componentDidMount () {
    console.log(this)
  }
  render () {
    return (
      <View className='detail'>
      
      </View>
    )
  }
}

export default User as ComponentClass<PageOwnProps, PageState>
