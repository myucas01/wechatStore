var util = require('../../utils/util.js');
var api = require('../../config/api.js');
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
      title: '支付', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    payType:1,
    accountInfo:'',
    price:'',
    orderSn:'',
    orderId:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderSn: options.orderSn,
      price: options.price,
      orderId: options.orderId
    });
  },
  bindPayType: function(){  
      if(this.data.payType==1){
        this.setData({
          payType:2
        })
      }else{
        this.setData({
          payType: 1
        })
      }
  },
  getAccount() {
    let that = this;
    util.request(api.AccountInfo,{}).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          accountInfo: res.data
        });
      }
    });
  },
  goUpdataAccount(){
    wx.navigateTo({
      url: "/pages/accountUpdate/accountUpdate?price=" + this.data.price + '&orderSn=' + this.data.orderSn + '&payeeId=' + this.data.accountInfo.id + '&orderId='+this.data.orderId
    });
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
    this.getAccount()
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