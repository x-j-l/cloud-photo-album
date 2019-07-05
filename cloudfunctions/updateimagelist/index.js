// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const _ = db.command
  
  // 更新上传图片列表
  try {
    return db.collection('x-j-l').doc(event.recode).update({
      data: {
        fileIDList: _.push([event.fileIDList])
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