var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
var user = require('../../../utils/user.js');

var app = getApp();
Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#FFFFFF',
      // background: 'red',
      color: '#333333',
      showCapsule: 0, //是否显示左上角图标   1表示显示    0表示不显示
      title: '企业账号登录', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    username: '',
    password: '',
    code: '',
    loginType:'1',
    loginErrorCount: 0,
    passwordName:'密码',
    errorName:'账号或者密码不正确',
    count: 60,
    code: '获取验证码',
    errorIsshow:false,
    loginStyle: 'background-image: linear-gradient(to right, #f18f8c 100%, #f18f8c 100%);',
    textCodeS: 'color: #E71F19'
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    // 页面渲染完成

  },
  onReady: function() {

  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  getAppid(config) {
    util.request(api.decodeUser, config)
      .then(response => {
        if (response.errno == 0) {
          wx.setStorage({
            key: 'wx_appid',
            data: response.data,
          })
        }else{
          wx.showToast({
            title: 'appid不存在',
            icon: 'none',
            duration: 2000
          })
          wx.navigateTo({
            url: "/pages/auth/login/login"
          });
        }
      })
      .catch(err => {
        wx.showToast({
          title: '接口请求失败',
          icon: 'none',
          duration: 2000
        })
        wx.navigateTo({
          url: "/pages/auth/login/login"
        });
      })
  },
  accountLogin: function() {
    var that = this;
    if (this.data.password.length < 1 || this.data.username.length < 1) {
      wx.showModal({
        title: '错误信息',
        content: '请输入用户名和密码',
        showCancel: false
      });
      return false;
    }
    wx.request({
      url: api.AuthLoginByAccount,
      data: {
        username: that.data.username,
        password: that.data.password
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.data.errno == 0) {
          that.setData({
            loginErrorCount: 0
          });
          wx.setStorage({
            key: "token",
            data: res.data.data.token,
            success: function() {
              that.getUserInfo()
              app.globalData.hasLogin = true;
              wx.login({
                success: function (res) {
                  wx.setStorageSync('wxcode', res.code)
                  let config = {
                    code: res.code
                  }
                  that.getAppid(config)
                },
                fail: function (err) {
                  console.log(err)
                }
              });
            }
          });
        } else {
          that.setData({
            loginErrorCount: that.data.loginErrorCount + 1,
            errorIsshow:true
          });
          app.globalData.hasLogin = false;
          util.showErrorToast(res.errmsg);
        }
      }
    });
  },
  getUserInfo(){
    util.request(api.GetUserInfo, {    
    }).then(function (res) {
      if (res.errno === 0) {
        wx.setStorageSync('userInfo', res.data);
        app.globalData.companyId = res.data.companyId
        const back = wx.getStorageSync('backUrl')
        if (back !== "") {
          if (back.type === 1) {
            wx.redirectTo({
              url: "/" + back.url
            });
          } else {
            wx.switchTab({
              url: "/" + back.url
            });
          }
        } else {
          wx.switchTab({
            url: '/pages/ucenter/index/index'
          });
        }
      }
    })
  },
  textCode: function () {
    let that = this
    // 手机号码格式验证
    // if (!(/^1[3456789]\d{9}$/.test(that.data.iphoneValue))) {
    //   wx.showToast({
    //     title: '输入手机号有误',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return;
    // }
    if (that.data.code !== '获取验证码') {
      return
    }
    const countDown = setInterval(() => {
      if (that.data.count <= 0) {
        that.setData({
          count: 60,
          code: '获取验证码'
        })
        clearInterval(countDown)
        return
      }
      that.data.count--
      that.setData({
        count: that.data.count,
        code: that.data.count < 10 ? `重发0${that.data.count}s` : `重发${that.data.count}s`
      })
      that.setData({
        textCodeS: 'border-radius: 30rpx;color: #ED3F14;border: 2rpx solid #ED3F14;padding: 10rpx 36rpx;'
      })
    }, 1000);
    // 调用验证码接口
    // that.textCode_http()
  },  
  changeLoginType: function(e){
    console.log(e.target.dataset.type)
    let name=''
    if (e.target.dataset.type=='2'){
      name = '验证码'
    }  else{
      name = '密码'
    }  
    this.setData({
      passwordName: name,
      username: '',
      password: '',
      loginType: e.target.dataset.type      
    });
  },
  bindUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    });
    this.changeLoginStyle()
  },
  bindPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
    this.changeLoginStyle()
  },
  changeLoginStyle: function () {
    if (this.data.username.length > 0 && this.data.password.length > 0) {
      this.setData({
        loginStyle: 'background-image: linear-gradient(to right, #E71F19 0%, #E71F19 100%);'
      })
    } else if (this.data.username.length === 0 || this.data.password.length === 0) {
      this.setData({
        loginStyle: 'background-image: linear-gradient(to right, #f18f8c 0%, #f18f8c 100%);'
      })
    }
  },

  bindCodeInput: function(e) {

    this.setData({
      code: e.detail.value
    });
  },
  clearInput: function(e) {
    switch (e.currentTarget.id) {
      case 'clear-username':
        this.setData({
          username: ''
        });
        break;
      case 'clear-password':
        this.setData({
          password: ''
        });
        break;
      case 'clear-code':
        this.setData({
          code: ''
        });
        break;
    }
  },
  ownLogin: function() {
    wx.redirectTo({
      url: "/pages/auth/own/ownLogin"
    });
  }
})