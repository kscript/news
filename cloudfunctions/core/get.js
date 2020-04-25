const margeData = require('./utils').mergeData

const provide = (data = {}) => {
  return Object.assign({
  }, data)
}
exports.main = async (option, { cloud, db, collection }) => {
  let { name, data, merge, userInfo } = option
  let handlers = ['where', 'field', 'skip', 'limit', 'orderBy']
  let stack = collection
  handlers.forEach((item, index) => {
    let args = option[item]
    if (args) {
      if (item === 'where') {
        args = Object.assign(margeData(merge, provide(userInfo)), args)
      }
      stack = stack[item].apply(stack, Array.isArray(args) ? args : [args])
    }
  })
  return await stack.get()
}
