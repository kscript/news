const margeData = require('./utils').mergeData
const createTime = () => {
  const t = new Date(Date.now() + 8 * 60 * 60 * 1000)
  return [
    t.getFullYear(), 
    t.getMonth() + 1, 
    t.getDate()
  ].map(item => item > 100 ? item : ('0' + item).slice(-2)).join('-') 
  + ' ' 
  + [
    t.getHours(),
    t.getMinutes(), 
    t.getSeconds()
  ].map(item => ('0' + item).slice(-2)).join(':')
}
// 从main中分离出来, 用于合成一个对象, 供margeData取其中的属性
// data是云函数运行时才能提供的信息, provide用于把它和云函数以外的信息进行合并
const provide = (data = {}) => {
  const time = createTime()
  return Object.assign({
    time,
    type: 1
  }, data)
}
exports.main = async (option, { cloud, db, collection }) => {
  let { name, data, marge, userInfo: { openId } } = option
  return await collection.add({
    data: Object.assign({}, margeData(marge, provide({
      openId
    })), data)
  })
}