var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var check = require('../../utils/check.js');

var app = getApp();

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#FFFFFF',
      color: '#333333',
      showCapsule: 1, //是否显示左上角图标   1表示返回    0表示关闭
      title: '确认订单', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    buttonCheck: true,
    userType: '0',
    imgUrlJust: '',
    imgUrlBack: '',
    pay: {},
    checkedGoodsList: [],
    splitMap: [],
    isResult: '1',
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
    openIdentity: false,
    grouponLinkId: '', //参与的团购，如果是发起则为0
    grouponRulesId: '', //团购规则ID
    cancelColor: '',
    sureColor: '',
    carName: '',
    carNumber: ''
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  boxChange: function(event) {
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
      openAttr: false,
      openIdentity: false
    })
  },
  addressInfoForm: function() {
    var that = this
    that.setData({
      openAttr: true
    })
  },
  identityInfoForm: function() {
    var that = this
    that.setData({
      openIdentity: true
    })
  },
  bindConsignee: function(event) {
    var that = this
    that.setData({
      consignee: event.detail.value
    })
  },
  bindCarName: function(event) {
    var that = this
    that.setData({
      carName: event.detail.value
    })
  },
  bindCarNumber: function(event) {
    var that = this
    that.setData({
      carNumber: event.detail.value
    })
  },
  bindMobile: function(event) {
    var that = this
    that.setData({
      mobile: event.detail.value
    })
  },
  //获取checkou信息
  getCheckoutInfo: function() {
    let that = this;
    console.log(that.data.addressId)
    let userInfo = wx.getStorageSync('userInfo'); 
    util.request(api.CartCheckout, {
      cartId: that.data.cartId,
      // cartId: 0,
      addressId: that.data.addressId,
      couponId: that.data.couponId,
      grouponRulesId: that.data.grouponRulesId,
      userType: userInfo.userType,
      companyId:userInfo.companyId 
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          userType: userInfo.userType,
          checkedGoodsList: res.data.checkedGoodsList,
          splitMap: res.data.splitMap,
          isResult: res.data.isResult,
          checkedAddress: res.data.checkedAddress,
          addressId: res.data.addressId,
          availableCouponLength: res.data.availableCouponLength,
          actualPrice: res.data.actualPrice,
          couponPrice: res.data.couponPrice,
          grouponPrice: res.data.grouponPrice,
          freightPrice: res.data.freightPrice,
          goodsTotalPrice: res.data.goodsTotalPrice,
          orderTotalPrice: res.data.orderTotalPrice,
          couponId: res.data.couponId,
          grouponRulesId: res.data.grouponRulesId,
        });
      } else {
        util.showModal(res.errmsg);
      }
      wx.hideLoading();
    });
  },
  selectAddress() {
    let that = this
    wx.navigateTo({
      url: '/pages/ucenter/c_address/c_address',
    })
    // console.log(that.data.userType)
    // if (that.data.userType == '0') {
    //   wx.navigateTo({
    //     url: '/pages/ucenter/c_address/c_address',
    //   })
    // } else {
    //   wx.navigateTo({
    //     url: '/pages/ucenter/address/address',
    //   })
    // }
  },
  selectCoupon() {
    wx.navigateTo({
      url: '/pages/ucenter/couponSelect/couponSelect',
    })
  },
  bindMessageInput: function(e) {
    this.setData({
      message: e.detail.value
    });
  },
  onReady: function() {
    // 页面渲染完成

  },
  onShow: function() {
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
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
    wx.removeStorageSync('addressId')
  },
  uploadImgJust() {
    let that = this;
    wx.chooseImage({
      count: 1,// 默认9
      sizeType: ['original', 'compressed'],// 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],// 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
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
            that.setData({
              imgUrlJust: data.data.url
            })
          }
        })
      }
    })
  },
  uploadImgBack() {
    let that = this;
    wx.chooseImage({
      count: 1,// 默认9
      sizeType: ['original', 'compressed'],// 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],// 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
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
            that.setData({
              imgUrlBack: data.data.url
            })
          }
        })
      }
    })
  },
  submitOrder: function() {
    let that = this
    if (that.data.buttonCheck) {
      if (that.data.addressId < 0) {
        util.showModal('请选择收货地址');
        return false;
      }
      if (that.data.checkedAddress.name == '' || that.data.checkedAddress.tel == '') {
        util.showModal('请完善收货人和联系方式');
      }
      if (that.data.isResult == '0') {
        if (that.data.checkedAddress.name == '' || that.data.carNumber == '') {
          util.showModal('请完善身份认证信息');
          return false;
        }
      }
      
      let userInfo = wx.getStorageSync('userInfo');
      that.setData({
        buttonCheck: false
      })
      
      util.request(api.OrderSubmit, {
        // splitMap: JSON.stringify(this.data.splitMap),
        splitMap: this.data.splitMap,
        cartId: this.data.cartId,
        addressId: this.data.addressId,
        couponId: this.data.couponId,
        message: this.data.message,
        grouponRulesId: this.data.grouponRulesId,
        grouponLinkId: this.data.grouponLinkId,
        consignee: that.data.checkedAddress.name,
        mobile: that.data.checkedAddress.tel,
        userType: parseInt(userInfo.userType),
        companyId: userInfo.companyId,
        company: userInfo.company,
        isResult: this.data.isResult,
        carName: that.data.checkedAddress.name,
        carNumber: this.data.carNumber
      }, 'POST').then(res => {
        if (res.errno === 0) {
          that.setData({
            buttonCheck: false
          })
          if (userInfo.userType == '0') {
            this.setData({
              pay: { orderSn: res.data.orderSn, orderType: res.data.orderType, actualPrice: res.data.actualPrice }
            })
            wx.getStorage({
              key: 'token',
              success(res) {
                wx.getStorage({
                  key: 'wxcode',
                  success(code) {
                    console.log(code)
                    wx.getStorage({
                      key: 'wx_appid',
                      success(appid) {
                        console.log(appid)
                        if (appid.data) {
                          // let amount = payOrder.actualPrice.toString()
                          let amount = that.data.pay.actualPrice.toString()
                          if (amount.indexOf('.') == -1) {
                            amount = amount + '.00'
                          }
                          let config = {
                            openId: appid.data,
                            orderNo: that.data.pay.orderSn,
                            orderType: that.data.pay.orderType,
                            body: '商品名称',
                            amount: amount
                          }
                          util.request(api.OrderPay, config, 'POST')
                            .then(pay => {
                              if (pay.errno == 0) {
                                wx.requestPayment({
                                  timeStamp: pay.data.timeStamp,
                                  nonceStr: pay.data.nonceStr,
                                  package: pay.data.package,
                                  signType: pay.data.signType,
                                  paySign: pay.data.paySign,
                                  success(res) {
                                    wx.setStorageSync('tab', 0);
                                    wx.redirectTo({
                                      url: "/pages/ucenter/order/order"
                                    })
                                  },
                                  fail(res) {
                                    wx.setStorageSync('tab', 1);
                                    wx.redirectTo({
                                      url: "/pages/ucenter/order/order"
                                    })
                                  }
                                })
                              } else {
                                wx.setStorageSync('tab', 1);
                                wx.redirectTo({
                                  url: "/pages/ucenter/order/order"
                                })
                              }
                            })
                        } else {
                          wx.setStorageSync('tab', 1);
                          wx.redirectTo({
                            url: "/pages/ucenter/order/order"
                          })
                        }
                      },
                      fail() {
                        wx.setStorageSync('tab', 1);
                        wx.redirectTo({
                          url: "/pages/ucenter/order/order"
                        })
                      }
                    })

                  },
                })
              },
              fail() {
                wx.redirectTo({
                  url: "/pages/auth/login/login"
                });
              }
            })
          } else {
            wx.redirectTo({
              url: "/pages/orderPay/orderPay?orderSn=" + res.data.orderSn + '&price=' + this.data.actualPrice + '&orderId=' + res.data.orderId
            });
          }
          // 下单成功，重置couponId
          // if (userInfo.userType === '0') {
          //   try {
          //     wx.setStorageSync('tab', 1);
          //   } catch (e) {

          //   }
          //   wx.navigateTo({
          //     url: "/pages/ucenter/order/order"
          //   })
          // } else {
          //   try {
          //     wx.setStorageSync('couponId', 0);
          //   } catch (error) {

          //   }
          //   wx.redirectTo({
          //     url: "/pages/orderPay/orderPay?orderSn=" + res.data.orderSn + '&price=' + this.data.actualPrice + '&orderId=' + res.data.orderId
          //   });
          // }
        } else {
          that.setData({
            buttonCheck: true
          })
          util.showModal(res.errmsg);
        }
      });
    }
  }
});