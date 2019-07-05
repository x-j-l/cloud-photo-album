// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  //删除所有包含此分类id的表中recodeList中字符串，以及此id表
  return db.collection('x-j-l').doc(event.accountCurrent).update({
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
    ,
      db.collection('x-j-l').doc(event.removeRecode).remove().then(r => {
        console.log(r)
      }).catch(e => {
        console.log(e)
      })
}