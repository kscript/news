import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { newsList } from '../../actions/http'

import './index.scss'

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion
interface anyObject<T = any> {
  [prop: string] : T
}
type PageStateProps = {
  http: {
    newsList: anyObject
  }
}

type PageDispatchProps = {
  newsList: (page: number) => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ http }) => ({
  http
}), (dispatch) => ({
  newsList (page) {
    return dispatch(newsList(page))
  }
}))
class Index extends Component {
  state: anyObject = {
    complete: false,
    page: 0,
    focus: [],
    news: [],
    loading: {
      text: ''
    }
  }
    /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
    config: Config = {
    navigationBarTitleText: '首页'
  }

  componentWillReceiveProps (nextProps) {
    console.log(nextProps)
  }

  componentWillUnmount () { }
  componentWillMount () {
  }
  async componentDidMount () {
    console.log(this, Taro)
    await this.loadNews()
  }

  componentDidShow () { }

  componentDidHide () { }
  gotoDetail(id, type = 0) {  
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}&type=${type}`
    })
  }
  async onScrollToLower() {
    console.log('onScrollToLower')
    if (!this.state.complete) {
      this.setState((state: anyObject) => {
        const loading = state.loading
        return {
          loading: Object.assign({}, loading, {
            text: '加载中..'
          })
        }
      })
    }
    await this.loadNews()
  }
  async loadNews() {
    if (this.state.complete) return
    Taro.showLoading({
      title: '加载中..'
    })
    const res = await this.props.newsList(this.state.page)
    this.setState((state: anyObject) => {
      const focus = state.focus.length ? state.focus : res.focus_news
      const page = res.page
      const news = state.news.concat(res.newslist)
      const loading = state.loading
      let complete = state.complete
      if (page !== 0 && !res.page) {
        complete = true
      }
      return {
        loading: Object.assign({}, loading, {
          text: ''
        }),
        page: page || state.page,
        focus,
        news,
        complete
      }
    }, () => {
      Taro.hideLoading()
    })
  }

  render () {
    return (
      <View className='index'>
        <ScrollView 
          className="scroll-view"
          scrollY
          scrollWithAnimation
          onScrollToLower={this.onScrollToLower}
          >
          <Swiper
            className='top-swiper'
            indicatorColor='#999'
            indicatorActiveColor='#333'
            circular
            autoplay>
            {this.state.focus.map(item => 
              <SwiperItem key={item.id} onClick={this.gotoDetail.bind(this, item.id, item.articletype)}>
                <Image className="thumb" src={item.thumbnails[0]}></Image>
                <View className="title ellipsis">{item.title}</View>
              </SwiperItem>
            )
          }
          </Swiper>
          <View 
            className="news-list">
            {
              this.state.news.map(item => 
                <View className="news-item" key={item.id} onClick={this.gotoDetail.bind(this, item.id, item.articletype)}>
                  <View className="title ellipsis">{item.title}</View>
                  <View className="desc">{item.abstract}</View>
                  <View className={"thumb-list" + (item.thumbnails.length > 1 ? " is-multi" : "")}>
                    {
                      item.thumbnails.slice(0, 3).map(thumb => 
                        <Image key={thumb} className="thumb" src={thumb}></Image>
                      )
                    }
                  </View>
                </View>
              )
            }
          </View>
          <View className="loading-text">{this.state.loading.text}</View>
        </ScrollView>
        {
          this.state.complete ? <View className="complete-tip text-center">没有了</View> : ''
        }
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>
