// miniprogram/pages/userList/userList.js

// import regeneratorRuntime from '../../lib/regenerator-runtime/runtime.js'
// let regeneratorRuntime = require('../../lib/regenerator-runtime/runtime')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentAccountOpt: '',
    recodeListOpt: [],
    recodeList: [],
    username: '',
    password: '',
    hiddenModal: true,
    classifyName: '',
    deleteOp: true,
    showUploadInfo: false,
    recodeCurrent: '',
    getUserInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentAccountOpt: JSON.parse(options.currentAccountOpt)
    })
    this.classify()

    // 获取授权列表
    wx.getSetting({
      success (res) {
        console.log(res)
      },
      fail (err) {
        console.log(err)
      }
    })

    // 获取用户信息
    let that = this
    wx.getUserInfo({
      success (res) {
        that.setData({
          getUserInfo: res.userInfo
        })
      },
      fail (err) {
        console.log(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //添加分类
  addRecode () {
    this.setData({
      hiddenModal: false
    })
  },

  //获取输入分类
  classifyName (e) {
    this.setData({
      classifyName: e.detail.value
    })
  },

  //确认分类
  confirmClassify () {
    let that = this
    if (that.data.classifyName == '') {
      wx.showToast({
        title: '输入不能为空',
        icon: 'none',
        duration: 1000
      })
      return
    }
    let timestamp = String(new Date().getTime())
    wx.cloud.callFunction({
      name: 'updaterecodelist',
      data: {
        accountCurrent: that.data.currentAccountOpt._id,
        recodeCurrent: timestamp,
        classifyName: that.data.classifyName
      }
    }).then(res => {
      this.setData({
        hiddenModal: true,
        classifyName: ''
      })
      wx.showToast({
        title: '添加分类成功',
        icon: 'success',
        duration: 1500
      })
      that.data.currentAccountOpt.recodeList.push(timestamp)
      that.classify()
    }).catch(err => {
      console.log(err)
    })
  },

  //取消分类
  cancelClassify () {
    this.setData({
      hiddenModal: true,
      classifyName: ''
    })
  },

  //获取分类列表
  classify () {
    let that = this
    let nameValue = wx.getStorageSync('username')
    that.setData({
      username: nameValue
    })
    let pwValue = wx.getStorageSync('password')
    that.setData({
      password: pwValue
    })

    //判断是否有删除管理员权限 0为有 1为无
    if (JSON.parse(that.data.currentAccountOpt.deleteOp == '0')) {
      that.setData({
        showUploadInfo: true
      })
      const db = wx.cloud.database()
      db.collection('x-j-l').field({
        fileIDList: true,
        name: true
      }).get().then(r => {
        let recodeListOpt = []
        let recodeList = []
        r.data.forEach((v, i) => {
          let arrCurrent = Object.keys(v)
          if (arrCurrent.length > 1) {
            recodeListOpt.push(v)
            recodeList.push(v._id)
            that.setData({
              recodeListOpt: recodeListOpt,
              recodeList: recodeList
            })
          }
        })
        wx.cloud.callFunction({
          name: 'adminupdaterecodelist',
          data: {
            recodeCurrent: that.data.currentAccountOpt._id,
            recodeList: that.data.recodeList
          }
        }).then(result => {
          console.log(result)
        }).catch(error => {
          console.log(error)
        })
      }).catch(e => {
        console.log(e)
      })
    } 
    else {
      const db = wx.cloud.database()
      let recodeListOpt = []
      that.data.currentAccountOpt.recodeList.forEach((v, i) => {
        db.collection('x-j-l').doc(v).field({
          name: true
        }).get().then(re => {
          recodeListOpt.push(re.data)
          that.setData({
            recodeListOpt: recodeListOpt
          })
        }).catch(er => {
          console.log(er)
        })
      })
    }
  },

  //管理员权限删除操作
  deleteCurrent (e) {
    let that = this
    const db = wx.cloud.database()
    db.collection('x-j-l').field({
      recodeList: true
    }).get().then(res => {
      let deleteRecodeArr = []
      res.data.forEach((v, i) => {
        if (Object.keys(v).length > 1) {
          deleteRecodeArr.push(v)
        }
        deleteRecodeArr.forEach((va, inx) => {
          va.recodeList.forEach((val, inde) => {
            let removeRecode = e.currentTarget.dataset['id']
            if (va.recodeList[inde] == removeRecode) {
              va.recodeList.splice(inde, 1)
              wx.cloud.callFunction({
                name: 'admindeleterecodelist',
                data: {
                  accountCurrent: va._id,
                  recodeList: va.recodeList,
                  removeRecode: removeRecode
                }
              }).then(result => {
                wx.showToast({
                  title: '删除分类成功',
                  icon: 'success',
                  duration: 1500
                })
                that.classify()
              }).catch(error => {
                console.log(error)
              })
            }
          })
        })
      })
    }).catch(err => {
      console.log(err)
    })

    //删除存储fileID列
    // db.collection('x-j-l').doc(e.currentTarget.dataset.id).get().then(res => {
    //   wx.cloud.deleteFile({
    //     fileList: res.data.fileIDList
    //   }).then(r => {
    //     console.log(r)
    //   }).catch(e => {
    //     console.log(e)
    //   })
    // }).catch(err => {
    //   console.log(err)
    // })
  }

})