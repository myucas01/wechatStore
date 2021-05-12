// pages/setting/password/index.js
var check = require('../../../utils/check.js');
var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
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
      showCapsule: 1, //是否显示左上角图标   1表示关闭    0表示返回
      title: '初始密码', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    changeSuccess: false,
    tphone: '',
    phone: '',
    type: 1,
    confirmPWDStatus: true,
    warnInfo: false,
    codeName: '获取验证码',
    authButton: 'color: #ED3F14',
    codeDisabled: false,
    code: '',
    changeMs: '',
    oldPassword:'',
    newPassword1:'',
    newPassword2: '',
    newPassword3: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      type: options.type
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  checkCode: function (e) {
    let that = this
    that.setData({
      code: e.detail.value
    })
  },

  clearCode: function () {
    console.log('11111')
    let that = this
    that.setData({
      code: ''
    })
  },

  checkOldPwd: function (e) {
    let that = this
    that.setData({
      oldPassword: e.detail.value
    })
  },

  clearOldPwd: function () {
    let that = this
    that.setData({
      oldPassword: ''
    })
  },

  checkNewPwd1: function (e) {
    let that = this
    that.setData({
      newPassword1: e.detail.value
    })
  },

  clearNewPwd1: function () {
    let that = this
    that.setData({
      newPassword1: ''
    })
  },

  checkNewPwd2: function (e) {
    let that = this
    that.setData({
      newPassword2: e.detail.value
    })
  },

  clearNewPwd2: function () {
    let that = this
    that.setData({
      newPassword2: ''
    })
  },

  checkPassword3: function (e) {
    let that = this
    that.setData({
      newPassword3: e.detail.value
    })
  },

  clearPassword3: function (e) {
    let that = this
    that.setData({
      newPassword3: ''
    })
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

  changePwd: function () {
    let that = this,
      ms = ''

    if (that.data.oldPassword == '') {
      ms = '请输入新密码'
    } else if (that.data.newPassword2 == '') {
      ms = '请再次输入新密码'
    } else if (that.data.oldPassword != that.data.newPassword2) {
      ms = '两次密码输入不一致'
    } else {
      ms = ''
      util.request(api.settingUnitPwd, {
        password: that.data.oldPassword
      }).then(function (res) {
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /*
   *  输入新密码之后
   */
  postPwd() {
    wx.navigateTo({
      url: "/pages/setting/confirm/index?type=1"
    });
    console.log('wwwww')
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