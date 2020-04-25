const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
exports.main = async (option, ...rest) => {
  let { name, fname } = option
  const collection = db.collection(name)
  try {
    const main = require('./' + fname).main
    return await main(option, { cloud, db, collection }, ...rest)
  } catch (e) {}
}
