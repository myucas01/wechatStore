// pages/auth/own/ownLogin.js
var check = require('../../../utils/check.js');
var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#FFFFFF',
      // background: 'red',
      color: '#333333',
      showCapsule: 0, //是否显示左上角图标   1表示显示    0表示不显示
      title: '员工账号登录', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    phone: '',
    phoneMs: '',
    code: '',
    pwd: '',
    codeName: '获取验证码',
    codeDisabled: false,
    codeMs: '',
    logonMs: '',
    loginType: '1',
    // timeNumber: 0 // 验证码倒计时
    authButton: "color:red"
  },
  // 个人登录类型判断
  changeLoginType: function (e) {
    this.setData({
      // phone: '',
      // phoneMs: '',
      // code: '',
      // pwd: '',
      // codeName: '获取验证码',
      // codeDisabled: false,
      // codeMs: '',
      // logonMs: '',
      loginType: e.target.dataset.type
    });
  },
  // 手机号input事件
  checkPhone: function(e) {
    let that = this
    that.setData({
      phone: e.detail.value
    })
  },
  checkCode: function(e) {
    let that = this
    that.setData({
      code: e.detail.value
    })
  },
  checkPwd: function(e) {
    let that = this
    that.setData({
      pwd: e.detail.value
    })
  },
  // 发送验证码
  sendCode: function() {
    if (!this.data.codeDisabled) {
      let that = this,
        timeNumber = 60
      // 验证手机
      if (!check.isValidPhone(that.data.phone)) {
        that.setData({
          phoneMs: '手机号码错误!'
        })
      } else {
        that.setData({
          phoneMs: '',
          codeDisabled: true
        })
        util.request(api.AuthPhoneCaptcha, {
          phone: that.data.phone
        }).then(function (res) {
          if (res.errno === 0) {
            let timer = setInterval(function () {
              timeNumber--;
              if (timeNumber <= 0) {
                clearInterval(timer);
                that.setData({
                  codeName: '重新发送',
                  codeMs: '',
                  codeDisabled: false
                })
                that.setData({
                  authButton:"border: 2rpx solid #ED3F14;color: #ED3F14;border-radius: 30rpx"
                })
              } else {
                that.setData({
                  codeName: '重发' + timeNumber + 's',
                  codeMs: '60秒后重新获取验证码'
                })
              }
            }, 1000)
          } else {
            wx.showToast({
              title: res.errmsg,
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    }

  },

  getAppid(config) {
    util.request(api.decodeUser, config)
      .then(response => {
        if (response.errno == 0) {
          wx.setStorage({
            key: 'wx_appid',
            data: response.data,
          })
          // wx.showToast({
          //   title: response.data,
          //   icon: 'none',
          //   duration: 2000
          // })
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
      .catch(err=>{
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

  // 登录
  ownLogin: function() {
    let that = this
    if (that.data.loginType == '2') {
      util.request(api.AuthLoginByPhone, {
        captcha: that.data.code,
        phonenum: that.data.phone
      }, 'POST').then(function (res) {
        if (res.errno === 0) {
          wx.setStorage({
            key: "token",
            data: res.data.token,
            success: function () {
              app.globalData.hasLogin = true;
              that.getUserInfo()
              that.setData({
                logonMs: ''
              })
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
          })
        } else {
          app.globalData.hasLogin = false;
          util.showErrorToast(res.errmsg);
        }
      })
    } else {
      let logonMs = ''
      if (that.data.phone == '') {
        logonMs = '手机号不能为空'
      } else if (!check.isValidPhone(that.data.phone)) {
        logonMs = '手机号码格式错误!'
      } else if (that.data.pwd == '') {
        logonMs = '密码不能为空'
      } else {
        logonMs = ''
        util.request(api.AuthLoginByPwd, {
          password: that.data.pwd,
          phone: that.data.phone
        }, 'POST').then(function (res) {
          if (res.errno === 0) {
            wx.setStorage({
              key: "token",
              data: res.data.token,
              success: function () {
                app.globalData.hasLogin = true;
                that.getUserInfo()
                that.setData({
                  logonMs: ''
                })
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
            })
          } else {
            app.globalData.hasLogin = false;
            util.showErrorToast(res.errmsg);
          }
        })
      }
      that.setData({
        logonMs: logonMs
      })
    }
  },
  getUserInfo() {
    util.request(api.GetUserInfo, {
    }).then(function (res) {
      if (res.errno === 0) {
        if (res.data.hasPassword) {
          wx.setStorageSync('userInfo', res.data);
          app.globalData.companyId = res.data.companyId
          const back = wx.getStorageSync('backUrl')
          if (back !== "") {
            if (back.type == 1) {
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
        } else {
          wx.reLaunch({
            url: '/pages/setting/passwordUnit/index'
          });
        }
      }
    })
  },
  // 切换企业账号登录
  businessLogin: function() {
    wx.redirectTo({
      url: "/pages/auth/accountLogin/accountLogin"
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  }
})