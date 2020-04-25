const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const defaultOption = {
  type: 1
}
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
exports.main = async (option) => {
  let { name, data, field, userInfo: { openId } } = option
  const time = createTime()
  const instance = db.collection(name)
  const result = await instance.add({
    data: Object.assign({
      openId
    }, data, {
      type: 1,
      time
    })
  })
  if (typeof field === 'string') {
    const res = {}
    field.split(',').forEach(item => {
      if (result.hasOwnProperty(item)) {
        res[item] = result[item]
      }
    })
    return res
  }
  return Object.assign(result, {
    time
  })
}
