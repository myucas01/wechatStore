var util = require('./utils/util.js');
var api = require('./config/api.js');
var user = require('./utils/user.js');

App({
  globalData: {
    hasLogin: '',
    height: '',
    share: false
  },
  onLaunch: function (options) {
    const updateManager = wx.getUpdateManager();
    wx.getUpdateManager().onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    wx.getSystemInfo({
      success: (res) => {
        this.globalData.height = res.statusBarHeight
      }
    })

    if (options.scene == 1007 || options.scene == 1008) {
      this.globalData.share = true
    } else {
      this.globalData.share = false
    };
   
  },
  onShow: function(options) {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('token')) {
      this.globalData.hasLogin = true;
    }else{
      this.globalData.hasLogin = false;
    }
  }
})