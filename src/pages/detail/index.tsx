import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Textarea, Button, Image, Icon, RichText, Video, OpenData } from '@tarojs/components'
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
const $data = {
  comment: ''
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
    comments: [],
    comment: '',
    nickName: '',
    avator: '',
    userInfo: {},
    detail: {}
  }
  config: Config = {
    navigationBarTitleText: '新闻详情'
  }
  async componentDidMount () {
    console.log(this)
    const id = this.$router.params.id
    this.loadDetail(id)
    this.loadComments(id)
  }
  formatTag(type, data) {
    switch (type) {
      case 'LINK':
        return '<div>' + data.title + '</div><span style="font-size: 12px;color: blue">' + data.abstract + '</span>'
      case 'LIST':
        return '<ol style="margin: 0;padding: 0;">' + (data || []).map(item => `<li style="margin: 0;list-style: disc;">${item.desc}</li>`) + '</ol>';
      case 'IMG': 
        return `<img src="${data.origUrl}" alt="${data.desc}" style="max-width: 100%;">`
      case 'H2': 
      case '/H2': 
        return ' '
      case 'VIDEO': 
        return ' ' // `<video src="${data.playurl}" poster="${data.img}" style="max-width: 100%;">`
      default:
        return type
    }
  }
  formatContent(content = '', detail: anyObject = {}) {
    const tag = {
      p: '<P style="padding: 6px 0;">'
    }
    let linkIndex = 0
    return content.replace(/!--(\/|)H2--/g, '').replace(/<\!--(.*?)-->/g, (s, $1) => {
      const type = $1.split('_')[0]
      let data = (detail.attribute || {})[$1] || {}
      if ($1 === 'LINK') {
        data = (detail.attribute || {})[$1 + '_' + linkIndex++]
      }
      return data ? this.formatTag(type, data) || $1 : $1
    }).replace(/<(.*?)>/g, (s, $1) => {
      return $1 ? tag[$1.toLowerCase()] || `<${$1}>` : ''
    })
  }
  createNodes(content = '', detail: anyObject = {}) {
    const tags = content.match(/<P><\!--(IMG|VIDEO)_\d+--><\/P>/g) || []
    const contents = content.split(/(?:<P><\!--(?:IMG|VIDEO)_\d+--><\/P>)/)
    const nodes: any[] = []
    let imgIndex = 0
    let videoIndex = 0
    contents.map((item, index) => {
      nodes.push({
        type: 'HTML',
        key: Math.floor(Math.random() * 1e8).toString(36),
        data: this.formatContent(item, detail)
      })
      const type = ((tags[index]||'').match(/--(.*?)_/)||{}) [1]|| ''
      const data = (detail.attribute || {})[type === 'IMG' ? 'IMG_' + imgIndex++ : 'VIDEO_' + videoIndex++]
      data && nodes.push({
        type,
        key: Math.floor(Math.random() * 1e8).toString(36),
        data
      })
    })
    return nodes
  }
  onInput(event: anyObject) {
    this.setState((state) => {
      return {
        comment: event.detail.value
      }
    })
  }
  async login({ detail }) {
    const { userInfo } = detail
    await Taro.setStorage({
      key: 'userInfo',
      data: JSON.stringify(userInfo)
    })
    await Taro.setStorage({
      key: 'nickName',
      data: userInfo.nickName
    })
    this.setState((state) => {
      return {
        userInfo,
        nickName: userInfo.nickName
      }
    })
  }
  async sendComment() {
    if (!this.state.nickName || !this.state.comment || $data.comment === this.state.comment) return
    $data.comment = this.state.comment
    const data = {
      id: this.$router.params.id,
      text: this.state.comment,
      nickName: this.state.nickName,
      avator: this.state.avator || ''
    }
    const { result } = await Taro.cloud.callFunction({
      name: 'core',
      data: {
        fname: 'add',
        name: 'comments',
        marge: ['openId', 'type', 'time'],
        data
      }
    }) as anyObject
    if (result.errMsg === 'collection.add:ok') {
      this.setState((state: anyObject) => {
        let comments = [Object.assign(data, result)].concat(state.comments)
        return {
          comments
        }
      })
    }
    return result
  }
  async loadComments(id, pageno = 1) {
    pageno--
    const { result } = await Taro.cloud.callFunction({
      name: 'core',
      data: {
        fname: 'get',
        name: 'comments',
        where: {
          id
        },
        orderBy: ['time', 'desc'],
        skip: pageno * 10,
        limit: 10
      }
    }) as anyObject
    this.setState((state) => {
      return {
        comments: result.data
      }
    })
    return result
  }
  async loadDetail(id) {
    const detail = await this.props.newsDetail(id)
    Taro.setNavigationBarTitle({
      title: detail.title
    })
    detail.content.richText = this.formatContent(detail.content.text, detail)
    this.setState((state: anyObject) => {
      const nickName = Taro.getStorageSync('nickName')
      let userInfo = { nickName: '', avator: '' }
      let avator = userInfo.avator
      try {
        userInfo = JSON.parse(Taro.getStorageSync('userInfo') || '') || {}
        avator = userInfo.avator
      } catch(e) {}
      return Object.assign({
        nodes: this.createNodes(detail.content.text, detail),
        ready: true,
        detail,
      }, 
      nickName ? { nickName } : {}, 
      avator ? { avator } : {}, 
      userInfo.nickName ? { userInfo } : {})
    })
  }
  render () {
    return (
      <View className='detail'>
        {
          this.state.ready ? 
          <View className="article">
            <View className="title">{this.state.detail.title}</View>
            <View className="info">
              <Text className="time">{this.state.detail.pub_time_des} </Text>
              {this.state.detail.card.icon ? <Image className="logo" src={this.state.detail.card.icon}></Image> : ''}
              <Text className="name">{this.state.detail.card.vip_desc || this.state.detail.card.chlname}</Text>
              {this.state.detail.card.vip_type ? <Icon size='12' type='success' /> : ''}
            </View>
            {
              this.state.nodes.map(item => {
                if (item.type === 'HTML') {
                  return <RichText key={item.key} className="content" nodes={item.data}></RichText>
                } else if(item.type === 'IMG') {
                  return <Image src={item.data.origUrl} />
                }
                return <Video
                  key={item.key}
                  src={item.data.playurl}
                  controls={true}
                  autoplay={false}
                  poster={item.data.img}
                  initialTime={0}
                  loop={false}
                  muted={false}
                ></Video>
              })
            }
            {
              this.state.detail.is_sensitive ? '' :
              <View className="comments">
                <View className="hd"> 发表评论: 
                  {
                    this.state.nickName
                    ? <View className="nick-name is-login">你好,<OpenData type="userNickName"></OpenData></View>
                    : <Button  className="nick-name" plain openType="getUserInfo" size="mini" onGetUserInfo={this.login}>请登录</Button>
                  }
                </View>
                <View className="bd">
                  <Textarea onInput={this.onInput} value={this.state.comment}></Textarea>
                  <Button onClick={this.sendComment}>发表</Button>
                </View>
                <View className="ft">
                  {
                    this.state.comments.map(item => {
                      return <View className="comment-item" key={item._id}>
                        <View className="info">{item.nickName} {item.time}</View>
                        <View className="text">{item.text}</View>
                      </View>
                    })
                  }
                </View>
              </View>
            }
          </View>
          : ''
        }
      </View>
    )
  }
}

export default Detail as ComponentClass<PageOwnProps, PageState>
