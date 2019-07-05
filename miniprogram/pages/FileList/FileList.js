// pages/testFileList/testFileList.js

Page({
  data: {
    fileOpt: [],
    userId: '',
    topStatus: false,
    photosNumber: '',
    deleteState: false,
    fileIDList: []
  },
  onLoad: function (options) {
    this.setData({
      userId: options.id
    })
    console.log(options.deleteOp)
    if (options.deleteOp == 'true') {
      this.setData({
        deleteState: true
      })
    }
    this.doGetFile()
  },

  //自定义读取云存储图片
  doGetFile() {
    let that = this
    const database = wx.cloud.database()
    database.collection('x-j-l').doc(that.data.userId).field({
      fileIDList: true
    })
      .get()
      .then(res => {
        that.setData({
          photosNumber: res.data.fileIDList.length + ' 张照片',
          fileIDList: res.data.fileIDList
        })
        res.data.fileIDList.reverse()
        wx.cloud.getTempFileURL({
          fileList: res.data.fileIDList,
          success(res) {
            that.setData({
              fileOpt: res.fileList
            })
          },
          fail(err) {
            console.log(err)
          }
        })
      })
      .catch(err => {
        console.log(err)
      })
  },

  //自定义下载云存储图片
  doDownload(e) {
    let fileID = e.currentTarget.dataset['fileid']
    wx.cloud.downloadFile({
      fileID: fileID,
      success (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success (res) {
            console.log(res)
          },
          fail (err) {
            console.log(err)
          }
        })
      },
      fail (err) {
        console.log(err)
      }
    })
  },

  //自定义上传图片
  uploadWx() {
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.showLoading({
          title: '上传中'
        })
        // let timestamp = (new Date()).valueOf()
        let timestamp = new Date().getTime()
        let filePath = res.tempFilePaths[0]
        let currentId = that.data.userId
        let cloudPath = currentId +'/image-' + timestamp + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success(res) {
            // console.log('[上传文件] 成功：', res)
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            })
            const db = wx.cloud.database()
            const _ = db.command
            // let filesEnd = _.push([res.fileID])
            // console.log(filesEnd)
            // 调用云函数
            wx.cloud.callFunction({
              name: 'updateimagelist',
              data: {
                recode: that.data.userId,
                fileIDList: res.fileID
              },
              success: res => {
                that.doGetFile()
              },
              fail: err => {
                console.error('失败', err)
              }
            })
          },
          fail(err) {
            console.log(err)
          }
        })
      }
    })
  },

  //点击预览图片
  previewImage (e) {
    let current = e.target.dataset.src
    let tempSrcList = []
    let that = this
    that.data.fileOpt.forEach(function(item, index){
      tempSrcList.push(item.tempFileURL)
    })
    wx.previewImage({
      current: current,
      urls: tempSrcList,
    })
  },

  //删除图片
  deleteImage (e) {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      success (res) {
        if (res.confirm) {
          that.data.fileIDList.forEach((v, i) => {
            if (that.data.fileIDList[i] == e.target.dataset.fileid) {
              that.data.fileIDList.splice(i, 1)
            }
          })
          wx.cloud.callFunction({
            name: 'admindeleteimagelist',
            data: {
              recode: that.data.userId,
              fileIDList: that.data.fileIDList
            }
          }).then(res => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1500
            })
            that.doGetFile()
          }).catch(err => {
            console.log(err)
          })

          //删除存储fileID列
          wx.cloud.deleteFile({
            fileList: [e.target.dataset.fileid]
          }).then(r => {
            console.log(r)
          }).catch(e => {
            console.log(e)
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },

  //返回顶部
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    if (e.scrollTop >= 300) {
      this.setData({
        topStatus: true
      })
    } else {
      this.setData({
        topStatus: false
      })
    }
  },
  returnTop () {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 1000
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
      })
    }
  }

})