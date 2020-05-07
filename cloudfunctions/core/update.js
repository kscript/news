const mergeData = require('./utils').mergeData
const add = require('./add')
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
// 从main中分离出来, 用于合成一个对象, 供mergeData取其中的属性
// data是云函数运行时才能提供的信息, provide用于把它和云函数以外的信息进行合并
const provide = (data = {}) => {
  const time = createTime()
  return Object.assign({
    time,
    date: +new Date
  }, data)
}
exports.main = async (option, { cloud, db, collection }) => {
  let { name, where, data, merge, userInfo: { openId } } = option
  const update = {
      data: Object.assign({
    }, mergeData(merge, provide({
      openId
    })), data)
  }
  const result = await collection.where(Object.assign({
    openId
  }, where instanceof Object ? where : {})).update(update)
  if (!result.stats.updated) {
    await add.main({
      name,
      data: Object.assign(update.data, {
        grade: 1
      }),
      userInfo: option.userInfo
    }, { cloud, db, collection })
    return {
      stats: {
        updated: 1
      }
    }
  }
  Object.assign(result, mergeData(merge, provide({
    openId,
  })))
  return result
}