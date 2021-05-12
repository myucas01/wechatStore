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
      title: '订单详情', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    orderId: 0,
    orderInfo: {},
    orderGoods: [],
    expressInfo: {},
    flag: false,
    userType: '0',
    handleOption: {}
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id
    });
    this.getOrderDetail();

    let that = this
    try {
      let userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userType: userInfo.userType
      });
    } catch (e) { }
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getOrderDetail();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  expandDetail: function() {
    let that = this;
    this.setData({
      flag: !that.data.flag
    })
  },
  getOrderDetail: function() {
    wx.showLoading({
      title: '加载中',
    });

    setTimeout(function() {
      wx.hideLoading()
    }, 2000);

    let that = this;
    util.request(api.OrderDetail, {
      orderId: that.data.orderId
    }).then(function(res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          orderInfo: res.data.orderInfo,
          orderGoods: res.data.orderGoods,
          handleOption: res.data.orderInfo.handleOption,
          expressInfo: res.data.expressInfo
        });
      }

      wx.hideLoading();
    });
  },
  // “去付款”按钮点击效果
  payOrder: function() {
    let that = this;
    // util.request(api.OrderPrepay, {
    //   orderId: that.data.orderId
    // }, 'POST').then(function(res) {
    //   if (res.errno === 0) {
    //     const payParam = res.data;
    //     console.log("支付过程开始");
    //     wx.requestPayment({
    //       'timeStamp': payParam.timeStamp,
    //       'nonceStr': payParam.nonceStr,
    //       'package': payParam.packageValue,
    //       'signType': payParam.signType,
    //       'paySign': payParam.paySign,
    //       'success': function(res) {
    //         console.log("支付过程成功");
    //         util.redirect('/pages/ucenter/order/order');
    //       },
    //       'fail': function(res) {
    //         console.log("支付过程失败");
    //         util.showErrorToast('支付失败');
    //       },
    //       'complete': function(res) {
    //         console.log("支付过程结束")
    //       }
    //     });
    //   }
    // });
    wx.navigateTo({
      url: "/pages/orderPay/orderPay?orderSn=" + this.data.orderInfo.orderSn + '&price=' + this.data.actualPrice + '&orderId=' + this.data.orderInfo.id
    });

  },
  payOrderToc: function (e) {
    let that = this
    let payOrder = e.currentTarget.dataset.item
    wx.getStorage({
      key: 'token',
      success(res) {
        wx.getStorage({
          key: 'wxcode',
          success(code) {

            wx.getStorage({
              key: 'wx_appid',
              success(appid) {
                if (appid.data) {
                  let amount = payOrder.goodsPrice.toString()
                  if (amount.indexOf('.') == -1) {
                    amount = amount + '.00'
                  }
                  let config = {
                    openId: appid.data,
                    orderNo: payOrder.orderSn,
                    orderType: payOrder.orderType,
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
                            that.getOrderDetail();
                          },
                          fail(res) {
                            wx.showToast({
                              title: '支付失败',
                              icon: 'none',
                              duration: 2000
                            })
                          }
                        })
                      } else {
                        wx.showToast({
                          title: '失败',
                          icon: 'none',
                          duration: 2000
                        })
                      }
                    })
                } else {
                  wx.showToast({
                    title: '失败',
                    icon: 'none',
                    duration: 2000
                  })
                }
              },
              fail() {
                wx.showToast({
                  title: '失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })

          },
        })
      },
      fail() {
        wx.navigateTo({
          url: "/pages/auth/login/login"
        });
      }
    })
  },
  //查看物流
  logistics: function(){

  },
  // “取消订单”点击效果
  cancelOrder: function() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderCancel, {
            orderId: orderInfo.id
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '取消订单成功'
              });
              util.redirect('/pages/ucenter/order/order');
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
  },
  // “取消订单并退款”点击效果
  refundOrder: function() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderRefund, {
            orderId: orderInfo.id
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '取消订单成功'
              });
              util.redirect('/pages/ucenter/order/order');
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
  },
  // “删除”点击效果
  deleteOrder: function() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    wx.showModal({
      title: '',
      content: '确定要删除此订单？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderDelete, {
            orderId: orderInfo.id
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '删除订单成功'
              });
              util.redirect('/pages/ucenter/order/order');
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
  },
  // “确认收货”点击效果
  confirmOrder: function() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    wx.showModal({
      title: '',
      content: '确认收货？',
      success: function(res) {
        if (res.confirm) {
          util.request(api.OrderConfirm, {
            orderId: orderInfo.id
          }, 'POST').then(function(res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '确认收货成功！'
              });
              util.redirect('/pages/ucenter/order/order');
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      }
    });
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})