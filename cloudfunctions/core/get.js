const mergeData = require('./utils').mergeData

const provide = (data = {}) => {
  return Object.assign({
  }, data)
}
exports.main = async (option, { cloud, db, collection }) => {
  let _ = db.command
  let { name, data, merge, userInfo } = option
  let handlers = ['where', 'field', 'skip', 'limit', 'orderBy']
  let stack = collection
  try {
    handlers.forEach((item, index) => {
      let args = option[item]
      if (args) {
        if (item === 'where') {
          args = Object.assign(mergeData(merge, provide(userInfo)), args)
          for(let k in args) {
            let curr = args[k]
            if(Array.isArray(curr)){
              args[k] = _[curr[0]](curr[1])
            }
          }
        }
        stack = stack[item].apply(stack, Array.isArray(args) ? args : [args])
      }
    })
  } catch(e) {
    console.log(e)
  }
  return await stack.get()
}
