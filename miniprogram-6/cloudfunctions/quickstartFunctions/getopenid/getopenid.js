// cloudfunctions/getopenid/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 自动匹配当前环境[3](@ref)

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return {
    openid: wxContext.OPENID,    // 用户唯一标识
    appid: wxContext.APPID,      // 小程序AppID
    unionid: wxContext.UNIONID   // 跨应用标识（可选）
  }
}