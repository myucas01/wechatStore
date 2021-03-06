var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp();

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    availableCouponLength: 0, // 可用的优惠券数量
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00, //快递费
    couponPrice: 0.00, //优惠券的价格
    grouponPrice: 0.00, //团购优惠价格
    orderTotalPrice: 0.00, //订单总价
    actualPrice: 0.00, //实际需要支付的总价
    cartId: 0,
    addressId: '',
    couponId: '',
    message: '',
    consignee: '',
    mobile: '',
    openAttr: false,
    grouponLinkId: '', //参与的团购，如果是发起则为0
    grouponRulesId: '', //团购规则ID
    cancelColor: '',
    sureColor: ''
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  boxChange: function (event) {
    var that = this
    let type = event.currentTarget.dataset.type
    that.setData({
      cancelColor: '',
      sureColor: ''
    })
    if (type === "1") {
      that.setData({
        cancelColor: 'rgba(237,63,20,1)'
      })
    } else {
      that.setData({
        sureColor: 'rgba(237,63,20,1)'
      })
    }
    that.setData({
      openAttr: false
    })
  },
  addressInfoForm: function () {
    var that = this
    that.setData({
      openAttr: true
    })
  },
  bindConsignee: function (event) {
    var that = this
    that.setData({
      consignee: event.detail.value
    })
  },
  bindMobile: function (event) {
    var that = this
    that.setData({
      mobile: event.detail.value
    })
  },
  //获取checkou信息
  getCheckoutInfo: function () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    util.request(api.CartCheckout, {
      cartId: that.data.cartId,
      addressId: that.data.addressId,
      couponId: that.data.couponId,
      grouponRulesId: that.data.grouponRulesId,
      userType: userInfo.userType,
      companyId: userInfo.companyId
    }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          checkedGoodsList: res.data.checkedGoodsList,
          checkedAddress: res.data.checkedAddress,
          availableCouponLength: res.data.availableCouponLength,
          actualPrice: res.data.actualPrice,
          couponPrice: res.data.couponPrice,
          grouponPrice: res.data.grouponPrice,
          freightPrice: res.data.freightPrice,
          goodsTotalPrice: res.data.goodsTotalPrice,
          orderTotalPrice: res.data.orderTotalPrice,
          addressId: res.data.addressId,
          couponId: res.data.couponId,
          grouponRulesId: res.data.grouponRulesId,
        });
      }
      wx.hideLoading();
    });
  },
  selectAddress() {
    wx.navigateTo({
      url: '/pages/ucenter/address/address',
    })
  },
  selectCoupon() {
    wx.navigateTo({
      url: '/pages/ucenter/couponSelect/couponSelect',
    })
  },
  bindMessageInput: function (e) {
    this.setData({
      message: e.detail.value
    });
  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    });
    try {
      var cartId = wx.getStorageSync('cartId');
      if (cartId === "") {
        cartId = 0;
      }
      var addressId = wx.getStorageSync('addressId');
      if (addressId === "") {
        addressId = 0;
      }
      var couponId = wx.getStorageSync('couponId');
      if (couponId === "") {
        couponId = 0;
      }
      var grouponRulesId = wx.getStorageSync('grouponRulesId');
      if (grouponRulesId === "") {
        grouponRulesId = 0;
      }
      var grouponLinkId = wx.getStorageSync('grouponLinkId');
      if (grouponLinkId === "") {
        grouponLinkId = 0;
      }
      this.setData({
        cartId: cartId,
        addressId: addressId,
        couponId: couponId,
        grouponRulesId: grouponRulesId,
        grouponLinkId: grouponLinkId
      });

    } catch (e) {
      // Do something when catch error
      console.log(e);
    }

    this.getCheckoutInfo();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
    wx.removeStorageSync('addressId')
  },
  submitOrder: function () {
    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    let userInfo = wx.getStorageSync('userInfo');
    util.request(api.OrderSubmit, {
      cartId: this.data.cartId,
      addressId: this.data.addressId,
      couponId: this.data.couponId,
      message: this.data.message,
      grouponRulesId: this.data.grouponRulesId,
      grouponLinkId: this.data.grouponLinkId,
      consignee: this.data.consignee,
      mobile: this.data.mobile,
      userType: userInfo.userType,
      companyId: userInfo.companyId,
      company: userInfo.company
    }, 'POST').then(res => {
      if (res.errno === 0) {
        // 下单成功，重置couponId
        try {
          wx.setStorageSync('couponId', 0);
        } catch (error) {

        }
        wx.navigateTo({
          url: "/pages/orderPay/orderPay?orderSn=" + res.data.orderSn + '&price=' + this.data.actualPrice + '&orderId=' + res.data.orderId
        });
      } else {
        // wx.redirectTo({
        //   url: '/pages/payResult/payResult?status=0&orderId=' + orderId
        // });

      }
    });
  }
});