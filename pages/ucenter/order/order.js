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
      title: '我的', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    orderList: [],
    showType: 0,
    userType: '',
    logisticsIsshow:false,
    shipChannel:'',//物流公司
    shipSn:'',//物流单号
    page: 1,
    limit: 10,
    totalPages: 1,
    pageBottom: false
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    let that = this
    try {
      var tab = wx.getStorageSync('tab');
      let userInfo = wx.getStorageSync('userInfo'); 
      this.setData({
        showType: tab,
        userType: userInfo.userType
      });
    } catch (e) {}

  },
  onPullDownRefresh() {
    this.setData({
      orderList: [],
      page: 1
    })
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getOrderList();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  getOrderList() {
    let that = this;
    // that.setData({
    //   orderList: []
    // })
    util.request(api.OrderList, {
      showType: that.data.showType,
      page: that.data.page,
      limit: that.data.limit
    }).then(function(res) {
      console.log(res)
      if (res.errno === 0) {
        wx.hideToast()
        that.setData({
          orderList: that.data.orderList.concat(res.data.list),
          // orderList: res.data.list,
          totalPages: res.data.pages
        });
      }
    });
  },
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1
      });
      this.getOrderList();
    } else {
      // wx.showToast({
      //   title: '没有更多订单了',
      //   icon: 'none',
      //   duration: 2000
      // });
      // return false;
      this.setData({
        pageBottom: true
      })
      setTimeout(()=>{
        pageBottom: false
      },2000)
    }
  },
  switchTab: function(event) {
    wx.showToast({ title: '加载中', icon: 'loading', duration: 10000 });
    let showType = event.currentTarget.dataset.index;
    this.setData({
      orderList: [],
      showType: showType,
      page: 1,
      limit: 10,
      totalPages: 1
    });
    this.getOrderList();
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
                  let amount = payOrder.actualPrice.toString()
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
                            that.getOrderList()
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
                  title: 'appid不存在',
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
  // “去付款”按钮点击效果
  payOrder: function (e) {
    console.log(e)
    let that = this;
    // util.request(api.OrderPrepay, {
    //   orderId: e.target.dataset.id
    // }, 'POST').then(function (res) {
    //   if (res.errno === 0) {
    //     const payParam = res.data;
    //     console.log("支付过程开始");
    //     wx.requestPayment({
    //       'timeStamp': payParam.timeStamp,
    //       'nonceStr': payParam.nonceStr,
    //       'package': payParam.packageValue,
    //       'signType': payParam.signType,
    //       'paySign': payParam.paySign,
    //       'success': function (res) {
    //         console.log("支付过程成功");
    //         util.redirect('/pages/ucenter/order/order');
    //       },
    //       'fail': function (res) {
    //         console.log("支付过程失败");
    //         util.showErrorToast('支付失败');
    //       },
    //       'complete': function (res) {
    //         console.log("支付过程结束")
    //       }
    //     });
    //   }
    // });
    let item = e.target.dataset.item
    wx.navigateTo({
      url: "/pages/orderPay/orderPay?orderId=" + item.id + '&price=' + item.actualPrice + '&orderSn=' + item.orderSn
    });

  },
  //查看物流
  logistics: function (e) {
    let info = e.target.dataset.item
    this.setData({
      logisticsIsshow:true,
      shipSn: info.shipSn,
      shipChannel: info.shipChannel
    })
  },
  logisticsClose:function(){
    this.setData({
      logisticsIsshow: false
    })
  },
  // “取消订单”点击效果
  cancelOrder: function (e) {
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: function (res) {
        if (res.confirm) {
          util.request(api.OrderCancel, {
            orderId: e.target.dataset.id
          }, 'POST').then(function (res) {
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
  refundOrder: function (e) {
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: function (res) {
        if (res.confirm) {
          util.request(api.OrderRefund, {
            orderId: e.target.dataset.id
          }, 'POST').then(function (res) {
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
  deleteOrder: function (e) {
    let that = this;

    wx.showModal({
      title: '',
      content: '确定要删除此订单？',
      success: function (res) {
        if (res.confirm) {
          util.request(api.OrderDelete, {
            orderId: e.target.dataset.id
          }, 'POST').then(function (res) {
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
  confirmOrder: function (e) {
    let that = this;
    wx.showModal({
      title: '',
      content: '确认收货？',
      success: function (res) {
        if (res.confirm) {
          util.request(api.OrderConfirm, {
            orderId: e.target.dataset.id
          }, 'POST').then(function (res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '确认收货成功！'
              });
              // util.redirect('/pages/ucenter/order/order');
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
    wx.showToast({ title: '加载中', icon: 'loading', duration: 10000 });
    // 页面显示
    this.setData({
      orderList:[]
    })
    this.getOrderList();
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})