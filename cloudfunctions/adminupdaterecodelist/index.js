// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 更新管理员列表
  try {
    return db.collection('x-j-l').doc(event.recodeCurrent).update({
      data: {
        recodeList: event.recodeList
      },
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
  } catch (err) {
    console.log(err)
  }
}