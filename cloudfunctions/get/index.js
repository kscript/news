const cloud = require('wx-server-sdk')
const mergeData = require('./utils').mergeData

cloud.init()
const db = cloud.database()
const provide = (data = {}) => {
  return Object.assign({
  }, data)
}
exports.main = async (option) => {
  let { name, data, merge, userInfo } = option
  let handlers = ['where', 'field', 'skip', 'limit', 'orderBy']
  const instance = db.collection(name)
  let stack = instance
  handlers.forEach((item, index) => {
    let args = option[item]
    if (args) {
      if (item === 'where') {
        args = Object.assign(mergeData(merge, provide(userInfo)), args)
      }
      stack = stack[item].apply(stack, Array.isArray(args) ? args : [args])
    }
  })
  return await stack.get()
}
