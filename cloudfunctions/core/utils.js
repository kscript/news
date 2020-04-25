const mergeData = (marge, sysInfo) => {
  const info = {}
  const keys = Array.isArray(marge) ? marge : typeof marge === 'string' ? marge.split(',') : []
  const datas = Object.assign({}, sysInfo)
  keys.forEach(key => {
    if (datas.hasOwnProperty(key)) {
      info[key] = datas[key]
    }
  })
  return info
}
exports.mergeData = mergeData
module.exports = {
  mergeData
}