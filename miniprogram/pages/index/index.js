//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    fileIdList: [],
    username: '',
    password: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
	
	//自定义上传图片
  uploadWx () {
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success (res) {
				wx.showLoading({
					title: '上传中'
				})
        // let timestamp = (new Date()).valueOf()
        let timestamp = new Date().getTime()
				let filePath = res.tempFilePaths[0]
				let cloudPath = 'xjl/image-' + timestamp + filePath.match(/\.[^.]+?$/)[0]
				wx.cloud.uploadFile({
					cloudPath,
					filePath,
					success (res) {
            const db = wx.cloud.database()
            const _ = db.command
            // let filesEnd = _.push([res.fileID])
            // console.log(filesEnd)
            // 调用云函数
            wx.cloud.callFunction({
              name: 'updateimagelist',
              data: {
                fileIDList: res.fileID
              },
              success: res => {
                console.log('成功', res)
              },
              fail: err => {
                console.error('失败', err)
              }
            })

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
					},
					fail (err) {
						console.log(err)
					},
					complete () {
						wx.hideLoading()
					}
				})
			}
		})
	},

  //获取表单用户名密码
  getUsername (e) {
    let username = e.detail.value
    this.setData({
      username: username
    })
  },
  getPassword(e) {
    let password = e.detail.value
    this.setData({
      password: password
    })
  },

  //提交表单
  admin_submit () {
    let username = this.data.username
    let password = this.data.password
    const db = wx.cloud.database()
    if (username == '' || password == '') {
      wx.showModal({
        title: '提示',
        content: '请完整输入账户名或密码',
        showCancel: false
      })
      return
    }
    db.collection('x-j-l').where({
      configName: username,
      configPw: password
    }).get({
      success (res) {
        if (res.data.length == 0) {
          wx.showModal({
            title: '提示',
            content: '用户名或密码输入不正确',
            showCancel: false
          })
        } else {
          wx.setStorage({
            key: 'username',
            data: username
          })
          wx.setStorage({
            key: 'password',
            data: password
          })
          wx.redirectTo({
            url: '../userList/userList?currentAccountOpt=' + JSON.stringify(res.data[0]),
          })
        }
      },
      fail (err) {
        console.log(err)
      }
    })
  },

  // 访客提交表单
  visitor_submit() {
    wx.setStorage({
      key: 'username',
      data: ''
    })
    wx.setStorage({
      key: 'password',
      data: '123456'
    })
    const db = wx.cloud.database()
    db.collection('x-j-l').doc('account_visitor1').get().then(res => {
      wx.redirectTo({
        url: '../userList/userList?currentAccountOpt=' + JSON.stringify(res.data),
      })
    }).catch(err => {
      console.log(err)
    })
  }

})
