var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#FFFFFF',
      color: '#333333',
      showCapsule: 1, //是否显示左上角图标   1表示返回    0表示关闭
      title: '地址管理', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    addressList: [],
    total: 0
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    // var userInfo = wx.getStorageSync("userInfo");
    // console.log(userInfo)
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    this.getAddressList();
  },
  add_address: function() { // 跳转到添加c端地址页面
    wx.navigateTo({
      url: '/pages/ucenter/c_addAddress/c_addAddress'
    });
  },
  getAddressList() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    util.request(api.AddressList + '?userType=' + (userInfo.userType || 0) + '&comanyId=' + (userInfo.companyId)).then(function(res) {
      if (res.errno === 0) {  
        console.log(res)
        that.setData({
          addressList: res.data.list,
          total: res.data.total
        });
      }
    });
  },
  editAddress(event) {
    wx.navigateTo({
      url: '/pages/ucenter/addressAdd/addressAdd?id=' + event.currentTarget.dataset.addressId
    })
  },
  addressAddOrUpdate(event) { // 判断是否是加入购物车进入  是选择还是编辑
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    if (prevPage.route == "pages/checkout/checkout") {
      wx.setStorageSync('addressId', event.currentTarget.dataset.addressId);
      let addressId = event.currentTarget.dataset.addressId;
      if (addressId && addressId != 0) {
        wx.navigateBack();
      } else {
        wx.navigateTo({
          url: '/pages/ucenter/addressAdd/addressAdd?id=' + addressId
        })
      }
    } else {
      console.log(event.currentTarget.dataset.addressId)
    }
  },
  deleteAddress(event) {
    console.log(event.target)
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要删除地址？',
      success: function(res) {
        if (res.confirm) {
          let addressId = event.target.dataset.addressId;
          util.request(api.AddressDelete, {
            id: addressId
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              that.getAddressList();
              wx.removeStorage({
                key: 'addressId',
                success: function(res) {},
              })
            }
          });
          console.log('用户点击确定')
        }
      }
    })
    return false;

  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})