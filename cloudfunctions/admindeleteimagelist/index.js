// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  //删除更新图片列表
  return  db.collection('x-j-l').doc(event.recode).update({
            data: {
              fileIDList: event.fileIDList
            }
          }).then(res => {
            console.log(res)
          }).catch(err => {
            console.log(err)
          })
}