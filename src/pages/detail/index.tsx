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

interface Detail {
  props: IProps;
}

@connect(({ http }) => ({
  http
}), (dispatch) => ({
  newsDetail (id) {
    return dispatch(newsDetail(id))
  }
}))
class Detail extends Component {
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
    await this.loadDetail(this.$router.params.id)
  }
  formatContent(content = '', detail: anyObject = {}) {
    const tag = {
      p: '<P style="padding: 10px;">'
    }
    return content.replace(/!--H2--/g, '').replace(/<(.*?)>/g, (s, $1) => {
      return tag[$1.toLowerCase()] || `<${$1}>`
    }).replace(/<\!--(.*?)-->/g, (s, $1) => {
      const type = $1.split('_')[0]
      const data = (detail.attribute || {})[$1] || {}
      return data ? {
        LIST: '<ol style="margin: 0;padding: 0;">' + data.map(item => `<li style="margin: 0;list-style: disc;">${item.desc}</li>`) + '</ol>',
        VIDEO: `<video src="${data.playurl}" poster="${data.img}" style="max-width: 100%;">`,
        IMG: `<img src="${data.origUrl}" alt="${data.desc}" style="max-width: 100%;">`
      }[type] || $1 : $1
    })
  }
  async loadDetail(id) {
    const detail = await this.props.newsDetail(id)
    Taro.setNavigationBarTitle({
      title: detail.title
    })
    detail.content.richText = this.formatContent(detail.content.text, detail)
    this.setState((state: anyObject) => {
      return {
        ready: true,
        detail
      }
    })
  }
  render () {
    return (
      <View className='detail'>
      {
        this.state.ready ? 
        <View className="article">
          <View className="title">{this.state.detail.title}</View>
          <RichText className="content" nodes={this.state.detail.content.richText}></RichText>
        </View>
        : ''
      }
      </View>
    )
  }
}

export default Detail as ComponentClass<PageOwnProps, PageState>
