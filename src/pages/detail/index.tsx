import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Textarea, Button, Image, Icon, RichText, Video, OpenData, ScrollView } from '@tarojs/components'
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
  comments: {
    id: '',
    count: 0,
    comment: '',
    loading: false
  }
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
    complete: true,
    pageno: 1,
    loading: '',
    limit: 10,
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
  async componentWillMount () {
    Taro.showLoading({
      title: '加载中..'
    })
  }
  async componentDidMount () {
    console.log(this)
    const id = this.$router.params.id
    await this.loadDetail(id),
    this.loadComments(id)
  }
  formatTag(type, data) {
    switch (type) {
      case 'LINK':
        return '<div>' + data.title + '</div><span style="font-size: 12px;color: blue">' + data.abstract + '</span>'
      case 'LIST':
        return '<ol style="margin: 0;padding: 0;">' + (data || []).map(item => `<li style="margin-left: 20px;list-style: disc;">${item.desc}</li>`) + '</ol>';
      case 'IMG': 
        return `<img src="${data.origUrl}" alt="${data.desc}" style="max-width: 100%;">`
      case 'TIMELINE': return '<ol style="margin: 0;padding: 0;">'
      case '/TIMELINE': return '</ol>'
      case 'TIME': return '<li style="margin-left: 20px;list-style: disc;">'
      case '/TIME': return '</li>'
      case 'H1': return '<h1>' 
      case 'H1': return '<h1>' 
      case '/H1': return '</h1>' 
      case 'H2': return '<h2>' 
      case '/H2': return '</h2>'
      case 'EVENT':
      case '/EVENT':
      case 'VIDEO': 
        return ' '
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
    if(/^<\!--(.*?)-->$/.test(content)) {
      content = '<P>' + content + '</P>'
    }
    const tags = content.match(/<P><\!--(.*?)--><\/P>/g) || []
    const contents = content.split(/(?:<P><\!--(?:.*?)--><\/P>)/)
    const nodes: any[] = []
    contents.map((item, index) => {
      nodes.push({
        type: 'HTML',
        key: Math.floor(Math.random() * 1e8).toString(36),
        data: this.formatContent(item, detail)
      })
      const type = ((tags[index]||'').match(/--(.*?)--/)||{}) [1]|| ''
      if (type) {
        let data = (detail.attribute || {})[type] || {}
        data && nodes.push({
          type: type.split('_')[0],
          key: Math.floor(Math.random() * 1e8).toString(36),
          data
        })
      }
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
    if (!this.state.nickName || !this.state.comment || $data.comments.comment === this.state.comment) return
    $data.comments.comment = this.state.comment
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
        merge: ['openId', 'type', 'time'],
        data
      }
    }) as anyObject
    if (result && result.errMsg === 'collection.add:ok') {
      $data.comments.count++
      Taro.showToast({
        icon: 'success',
        title: '发表评论成功',
        duration: 1500
      })
      this.setState((state: anyObject) => {
        let comments = [Object.assign(data, result)].concat(state.comments)
        return {
          comments
        }
      })
    }
    return result
  }
  async loadComments(id, pageno = this.state.pageno) {
    $data.comments.loading = true
    const { result } = await Taro.cloud.callFunction({
      name: 'core',
      data: {
        fname: 'get',
        name: 'comments',
        where: {
          id
        },
        orderBy: ['time', 'desc'],
        skip: (pageno - 1) * this.state.limit,
        limit: this.state.limit
      }
    }) as anyObject
    this.setState((state: anyObject) => {
      let comments = state.comments.concat(result.data)
      let complete =  (comments.length - $data.comments.count) % this.state.limit !== 0
      let last = result.data.slice(-1)[0]
      if (last) {
        $data.comments.id = last.id
      }
      return {
        loading: complete ? '评论已全部加载' : '',
        complete,
        pageno: pageno + 1,
        comments: comments
      }
    }, () => {
      $data.comments.loading = false
    })
    return result
  }
  async loadDetail(id) {
    const detail = await this.props.newsDetail(id)
    Taro.setNavigationBarTitle({
      title: detail.title
    })
    const richText = detail.content.richText = this.formatContent(detail.content.text, detail)
    this.setState((state: anyObject) => {
      const nickName = Taro.getStorageSync('nickName')
      let userInfo = { nickName: '', avator: '' }
      let avator = userInfo.avator
      try {
        userInfo = JSON.parse(Taro.getStorageSync('userInfo') || '') || {}
        avator = userInfo.avator
      } catch(e) {}
      return Object.assign({
        nodes: this.createNodes(detail.content.text, detail), // [{type: 'HTML', data: richText}],
        ready: true,
        detail,
      }, 
      nickName ? { nickName } : {}, 
      avator ? { avator } : {}, 
      userInfo.nickName ? { userInfo } : {})
    }, () => {
      setTimeout(() => {
        Taro.hideLoading()
      }, 0)
    })
  }
  openLink(id) {
    Taro.navigateTo({
      url: '/pages/detail/index?id=' + id
    })
  }
  videoError() {
    Taro.showToast({
      icon: 'none',
      title: '视频加载出错'
    })
  }
  async onScrollToLower() {
    if (!$data.comments.loading && !this.state.complete) {
      this.setState(() => {
        return {
          loading: '评论加载中..'
        }
      }, async () => {
        await this.loadComments(this.$router.params.id)
      })
    }
  }
  render () {
    return (
      <View className='detail'>
        <ScrollView
          className="scroll-view"
          scrollY
          scrollWithAnimation
          onScrollToLower={this.onScrollToLower}>
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
                } else if (item.type === 'VIDEO') {
                  return <Video
                    key={item.key}
                    src={item.data.playurl}
                    controls={true}
                    autoplay={false}
                    poster={item.data.img}
                    initialTime={0}
                    loop={false}
                    muted={false}
                    onError={this.videoError}
                  ></Video>
                } else if (item.type === 'LINK') {
                  return <View className="link" onClick={this.openLink.bind(this, item.data.id)}>
                    <View className="title">{item.data.title}</View>
                    <View className="desc">{item.data.abstract}</View>
                  </View>
                } else {
                  return JSON.stringify(item)
                }
              })
            }
            {
              this.state.detail.is_sensitive ? <View className="comments">
                <View className="close-text">评论功能已关闭</View>
              </View> :
              <View className="comments">
                <View className="hd"> 发表评论: 
                  {
                    this.state.nickName
                    ? <View className="nick-name is-login">你好,<OpenData type="userNickName"></OpenData></View>
                    : <Button  className="nick-name" plain openType="getUserInfo" size="mini" onGetUserInfo={this.login}>请先授权</Button>
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
                  <View className="loading-text">{this.state.loading}</View>
                </View>
              </View>
            }
          </View>
          : ''
        }
        </ScrollView>
      </View>
    )
  }
}

export default Detail as ComponentClass<PageOwnProps, PageState>
