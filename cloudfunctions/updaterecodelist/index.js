// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()
const db = cloud.database()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  const wxContext = cloud.getWXContext()
  const _ = db.command

  // 新增分类
  try {
    return db.collection('x-j-l').doc(event.accountCurrent).update({
      data: {
        recodeList: _.push([event.recodeCurrent])
      },
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
    ,
    db.collection('x-j-l').add({
      data: {
        _id: event.recodeCurrent,
        name: event.classifyName,
        fileIDList: []
      },
      success (res) {
        console.log(res)
      },
      fail (err) {
        console.log(err)
      }
    })
  } catch (err) {
    console.log(err)
  }
}
