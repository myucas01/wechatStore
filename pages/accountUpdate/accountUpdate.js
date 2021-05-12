// pages/accountUpdate/accountUpdate.js
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
      title: '上传信息', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    accountInfo: '',
    price: '',
    orderId:'',
    orderSn:'',
    name:'',
    accountNum:'',
    bankName:'',
    remitPrice:'',
    imgUrl:'',
    payeeId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      price: options.price,
      payeeId: options.payeeId,
      orderId: options.orderId,
      orderSn: options.orderSn,
    })
  },
  bindInputName(event){
    console.log(event)
    this.setData({
      name: event.detail.value
    })
  },
  bindInputAccountNum(event) {
    console.log(event)
    this.setData({
      accountNum: event.detail.value
    })
  },
  bindInputBankName(event) {
    console.log(event)
    this.setData({
      bankName: event.detail.value
    })
  },
  getAccount() {
    let that = this;
    util.request(api.AccountInfo, {}).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          accountInfo: res.data
        });
      }
    });
  },
  uploadImg(){
    let that = this;
    wx.chooseImage({
      count: 1,// 默认9
      sizeType: ['original', 'compressed'],// 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],// 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log('>>>0000000')        
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        wx.uploadFile({
          url: api.UplodeFile, //里面填写你的上传图片服务器API接口的路径 
          filePath: tempFilePaths[0],//要上传文件资源的路径 String类型 
          name: 'file',//按个人情况修改，文件对应的 key,开发者在服务器端通过这个 key 可以获取到文件二进制内容，(后台接口规定的关于图片的请求参数)
          header: {
            "Content-Type": "multipart/form-data",//记得设置
            'X-Litemall-Token': wx.getStorageSync('token')
          },
          formData: {
            //和服务器约定的token, 一般也可以放在header中
            
          },          
          success: function (res) {
            let data = JSON.parse(res.data)
            console.log(data.data.url)
              that.setData({
               imgUrl: data.data.url
              })
          }
        })
      }
    })
  },
  submit(){
    if (!this.data.name){
      wx.showToast({
        title: '请填写汇款人姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!this.data.accountNum) {
      wx.showToast({
        title: '请填写汇款银行账号',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!this.data.bankName) {
      wx.showToast({
        title: '请填写开户银行名称',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!this.data.bankName) {
      wx.showToast({
        title: '请上传汇款成功截图',
        icon: 'none',
        duration: 2000
      })
      return
    }
    util.request(api.PaymentAdd, {
      amount: this.data.price,
      bankName: this.data.bankName,
      cardNo: this.data.accountNum,
      orderId: this.data.orderSn,
      remitterName:this.data.name,
      voucher:this.data.imgUrl,
      payeeId: this.data.payeeId,
      userId:'000'
    }, 'POST').then(function (res) {
      if (res.errno === 0) {
        //返回之前，先取出上一页对象，并设置addressId  
        wx.setStorageSync('tab', 1);    
        util.redirect('/pages/ucenter/order/order');

      }
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