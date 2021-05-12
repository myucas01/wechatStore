// pages/setting/changePhone/index.js
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
      color: '#333333',
      showCapsule: 1, //是否显示左上角图标   1表示返回    0表示关闭
      title: '修改手机号', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,
    buttonTrue: false,
    changeSuccess: false,
    codeDisabled: false,
    phone: '',
    tphone: '',
    userInfo: {},
    confirmPWDStatus: true,
    warnInfo: false,
    changeMs: '',
    codeName: '获取验证码',
    authButton: 'color: #ED3F14',
    code: '',
    newPhone: '',
  },

  checkNewPhone: function(e) {
    let that = this
    that.setData({
      newPhone: e.detail.value
    })
    this.checkButtonType()
  },
  clearNewPhone: function () {
    let that = this
    that.setData({
      newPhone: ''
    })
    this.checkButtonType()
  },
  checkCode: function(e) {
    let that = this
    that.setData({
      code: e.detail.value
    })
    this.checkButtonType()
  },
  clearCode: function() {
    let that = this
    that.setData({
      code: ''
    })
    this.checkButtonType()
  },

  checkButtonType: function () {
    let that = this
    if (that.data.newPhone != '' && that.data.code != '') {
      that.setData({
        buttonTrue: true
      })
    } else {
      that.setData({
        buttonTrue: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /*
   *  输入新密码之后
   */
  postPwd() {
    wx.navigateTo({
      url: "/pages/setting/confirm/index?type=2"
    });
  },
  // 发送验证码
  sendCode: function () {
    if (!this.data.codeDisabled) {
      let that = this,
        timeNumber = 60
      that.setData({
        codeDisabled: true
      })
      util.request(api.AuthPhoneCaptcha, {
        phone: that.data.tphone
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
  },

  changePhone: function () {
    let that = this,
      ms = ''
    if (that.data.newPhone == '') {
      ms = '请输入新手机号'
    } else if (!check.isValidPhone(that.data.newPhone)) {
      ms = '手机号码格式错误!'
    } else if (that.data.code == '') {
      ms = '请输入验证码'
    } else {
      ms = ''
      util.request(api.settingChangePhone, {
        captcha: that.data.code,
        newPhone: that.data.newPhone
      }, 'POST').then(function (res) {
        if (res.errno === 0) {
          // that.setData({
          //   changeSuccess: true
          // })
          // wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/setting/confirm/index'
          });
        } else {
          wx.showToast({
            title: res.errmsg,
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
    that.setData({
      changeMs: ms
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
    let that = this;
    let userInfo = wx.getStorageSync('userInfo')
    that.setData({
      phone: userInfo.mobile.substring(0, 3) + '****' + userInfo.mobile.substring(7),
      tphone: userInfo.mobile
    });
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