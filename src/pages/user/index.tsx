import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, Icon, OpenData, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import photoPng from '../../assets/images/photo.png'

import { newsDetail } from '../../actions/http'
// 除了引入所需的组件，还需要手动引入组件样式

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
    nickName: '',
    user: {}
  }
  config: Config = {
    navigationBarTitleText: '个人中心'
  }
  componentWillMount () {
    const nickName = Taro.getStorageSync('nickName')
    nickName && this.setState((state) => {
      return {
        nickName
      }
    })
  }
  componentDidMount () {
    console.log(this)
  }
  openSetting() {
    Taro.openSetting({
      success: function (res) {
        console.log(res.authSetting)
        res.authSetting = {
          "scope.userInfo": true,
          "scope.userLocation": true
        }
      }
    })
  }
  async openAbout () {
    const res = await Taro.showModal({
      title: '关于当前小程序',
      content: '这是一个基于Taro2.0开发的, 用于新闻阅读/评论的小程序, 新闻源来自于看点快报(https://kuaibao.qq.com)',
      confirmText: '知道了',
      showCancel: false
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
        nickName: userInfo.nickName
      }
    })
  }
  async loginOut () {
    const res = await Taro.showModal({
      title: '说明',
      content: '取消授权后您的信息还会被保留显示, 但不能再发表评论',
      confirmText: '知道了'
    })
    if (res.confirm) {
      Taro.removeStorageSync('userInfo')
      Taro.removeStorageSync('nickName')
      Taro.showToast({
        title: '取消授权成功',
        icon: 'success',
        duration: 1500
      }).then(() => {
        // Taro.switchTab({
        //   url: '/pages/index/index'
        // })
      })
    }
  }
  render () {
    return (
      <View className='user'>
        <View className="profile">
          <View className="left">
            <View  className="photo">
              <OpenData type="userAvatarUrl" defaultAvatar={photoPng} />
            </View>
          </View>
          <View className="left">
            <View className="username">
              <OpenData type="userNickName" />
            </View>
            <View className="from">
              <OpenData type="userProvince" lang="zh_CN" /> <OpenData type="userCity" lang="zh_CN" />
            </View>
          </View>
          <View className="right">
            {
              this.state.nickName ? <View className="nick-name is-login">已授权</View> : <Button className="nick-name" plain openType="getUserInfo" size="mini" onGetUserInfo={this.login}>请授权</Button>
            }
          </View>
        </View>
        <View className="list">
          <View className="item" onClick={this.openSetting}>系统设置 <View className="icon icon-youjiantou"></View></View>
          <View className="item" onClick={this.openAbout}>关于 <View className="icon icon-youjiantou"></View></View>
          {
            this.state.nickName ? <View className="item" onClick={this.loginOut}>取消授权 <View className="icon icon-youjiantou"></View></View> : ''
          }
        </View>
      </View>
    )
  }
}

export default User as ComponentClass<PageOwnProps, PageState>
