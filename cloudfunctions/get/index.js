const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

exports.main = async (option) => {
  let { name, data } = option
  let handlers = ['where', 'field', 'skip', 'limit', 'sort']
  const instance = db.collection(name)
  let stack = instance
  handlers.forEach((item, index) => {
    if (option[item]) {
      stack = stack[item](option[item])
    }
  })
  return await stack.get()
}
