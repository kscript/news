const mergeData = (merge, sysInfo) => {
  const info = {}
  const keys = Array.isArray(merge) ? merge : typeof merge === 'string' ? merge.split(',') : []
  const datas = Object.assign({}, sysInfo)
  keys.forEach(key => {
    if (datas.hasOwnProperty(key)) {
      info[key] = datas[key]
    }
  })
  return info
}
exports.mergeData = mergeData