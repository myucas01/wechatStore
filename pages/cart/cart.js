var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');
var cart = require('../../utils/cart.js')

var app = getApp();

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#FFFFFF',
      color: '#333333',
      showCapsule: 2, //是否显示左上角图标   1表示关闭    0表示返回
      title: '购物车', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    userType: 0,
    cartGoods: [],
    cartTotal: {
      "goodsCount": 0,
      "goodsAmount": 0.00,
      "checkedGoodsCount": 0,
      "checkedGoodsAmount": 0.00
    },
    isEditCart: false,
    checkedAllStatus: true,
    editCartList: [],
    hasLogin: false,
    reminderOpen: false,
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    
  },
  onReady: function() {
    // 页面渲染完成
    
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getCartList();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onShow: function() {
    // 页面显示

    if (app.globalData.hasLogin) {
      this.getCartList();
      cart.getCartNum()
      this.setData({
        // hasLogin: app.globalData.hasLogin,
        isEditCart: false
      });
      var that = this;
      wx.getStorage({
        key: 'userInfo',
        success: function (res) {
          that.setData({
            userType: res.data.userType
          })
        }
      })
    } else {
      util.getBackUrl()
      wx.reLaunch({
        url: "/pages/auth/login/login"
      });
    }
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  goLogin() {
    util.getBackUrl()
    wx.navigateTo({
      url: "/pages/auth/login/login"
    });
  },
  getCartList: function() {
    let that = this;
    util.request(api.CartList).then(function(res) {
      
      if (res.errno === 0) {
        that.setData({
          cartGoods: res.data.cartList,
          cartTotal: res.data.cartTotal,
        });

        // wx.setTabBarBadge({//tabbar右上角添加文本
        //   index: 2, //tabbar下标
        //   text: res.data.cartList.length.toString() //显示的内容
        // })

        that.setData({
          checkedAllStatus: that.isCheckedAll()
        });
      } else {
        // wx.removeTabBarBadge({//移除tabbar右上角的文本
        //   index: 2, //tabbar下标
        // })
      }
    });
  },
  isCheckedAll: function() {
    //判断购物车商品已全选
    return this.data.cartGoods.every(function(element, index, array) {
      if (element.checked == true) {
        return true;
      } else {
        return false;
      }
    });
  },
  doCheckedAll: function() {
    let checkedAll = this.isCheckedAll()
    this.setData({
      checkedAllStatus: this.isCheckedAll()
    });
  },
  checkedItem: function(event) {
    let itemIndex = event.target.dataset.itemIndex;
    let that = this;
    console.log(event)
    console.log(that.data.cartGoods)
    console.log(itemIndex)
    let productIds = [];
    productIds.push(that.data.cartGoods[itemIndex].productId);
    if (!this.data.isEditCart) {
      util.request(api.CartChecked, {
        productIds: productIds,
        isChecked: that.data.cartGoods[itemIndex].checked ? 0 : 1
      }, 'POST').then(function(res) {
        if (res.errno === 0) {
          that.setData({
            cartGoods: res.data.cartList,
            cartTotal: res.data.cartTotal
          });
        }

        that.setData({
          checkedAllStatus: that.isCheckedAll()
        });
      });
    } else {
      //编辑状态
      let tmpCartData = this.data.cartGoods.map(function(element, index, array) {
        if (index == itemIndex) {
          element.checked = !element.checked;
        }

        return element;
      });

      that.setData({
        cartGoods: tmpCartData,
        checkedAllStatus: that.isCheckedAll(),
        'cartTotal.checkedGoodsCount': that.getCheckedGoodsCount()
      });
    }
  },
  getCheckedGoodsCount: function() {
    let checkedGoodsCount = 0;
    this.data.cartGoods.forEach(function(v) {
      if (v.checked === true) {
        checkedGoodsCount += v.number;
      }
    });
    console.log(checkedGoodsCount);
    return checkedGoodsCount;
  },
  checkedAll: function() {
    let that = this;

    if (!this.data.isEditCart) {
      var productIds = this.data.cartGoods.map(function(v) {
        return v.productId;
      });
      util.request(api.CartChecked, {
        productIds: productIds,
        isChecked: that.isCheckedAll() ? 0 : 1
      }, 'POST').then(function(res) {
        if (res.errno === 0) {
          console.log(res.data);
          that.setData({
            cartGoods: res.data.cartList,
            cartTotal: res.data.cartTotal
          });
        }

        that.setData({
          checkedAllStatus: that.isCheckedAll()
        });
      });
    } else {
      //编辑状态
      let checkedAllStatus = that.isCheckedAll();
      let tmpCartData = this.data.cartGoods.map(function(v) {
        v.checked = !checkedAllStatus;
        return v;
      });

      that.setData({
        cartGoods: tmpCartData,
        checkedAllStatus: that.isCheckedAll(),
        'cartTotal.checkedGoodsCount': that.getCheckedGoodsCount()
      });
    }

  },
  editCart: function() {
    var that = this;
    if (this.data.isEditCart) {
      this.getCartList();
      this.setData({
        isEditCart: !this.data.isEditCart
      });
    } else {
      //编辑状态
      let tmpCartList = this.data.cartGoods.map(function(v) {
        v.checked = false;
        return v;
      });
      this.setData({
        editCartList: this.data.cartGoods,
        cartGoods: tmpCartList,
        isEditCart: !this.data.isEditCart,
        checkedAllStatus: that.isCheckedAll(),
        'cartTotal.checkedGoodsCount': that.getCheckedGoodsCount()
      });
    }

  },
  updateCart: function(productId, goodsId, number, id) {
    let that = this;

    util.request(api.CartUpdate, {
      productId: productId,
      goodsId: goodsId,
      number: number,
      id: id
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        that.setData({
          checkedAllStatus: that.isCheckedAll()
        });
      } else {
        wx.showToast({
          title: res.errmsg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  cutNumber: function(event) {    
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];      
    if (cartItem.number > cartItem.moq){
      let number = (cartItem.number - 1 > 1) ? cartItem.number - 1 : 1;
      cartItem.number = number;
      console.log(cartItem.number)
      this.setData({
        cartGoods: this.data.cartGoods
      });
      this.updateCart(cartItem.productId, cartItem.goodsId, number, cartItem.id);
    }else{
      this.setData({
        reminderOpen: true
      })
      setTimeout(()=>{
        this.setData({
          reminderOpen: false
        })
      },3000)
      
      // console.log("~~~~~~~~~~~~~")
      // wx.showToast({
      //   title: '小于起订量不可删减数量',
      //   icon: 'none',
      //   duration: 2000
      // })
    }
   
  },
  addNumber: function(event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    let number = cartItem.number + 1;
    cartItem.number = number;
    this.setData({
      cartGoods: this.data.cartGoods
    });
    this.updateCart(cartItem.productId, cartItem.goodsId, number, cartItem.id);
  },
  checkoutOrder: function() {
    //获取已选择的商品
    let that = this;

    var checkedGoods = this.data.cartGoods.filter(function(element, index, array) {
      if (element.checked == true) {
        return true;
      } else {
        return false;
      }
    });

    if (checkedGoods.length <= 0) {
      return false;
    }

    // storage中设置了cartId，则是购物车购买
    try {
      wx.setStorageSync('cartId', 0);
      wx.navigateTo({
        url: '/pages/checkout/checkout?userId'
      })
    } catch (e) {}

  },
  deleteCart: function(event) {
    let that = this;
    //获取已选择的商品
    let productIds = [event.target.dataset.itemIndex]
    // api.CartDelete

    // let that = this;

    // let productIds = this.data.cartGoods.filter(function(element, index, array) {
    //   if (element.checked == true) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // });

    // if (productIds.length <= 0) {
    //   return false;
    // }

    // productIds = productIds.map(function(element, index, array) {
    //   if (element.checked == true) {
    //     return element.productId;
    //   }
    // });

    // console.log(productIds)

    util.request(api.CartDelete, {
      productIds: productIds
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        let cartList = res.data.cartList.map(v => {
          v.checked = false;
          return v;
        });

        that.setData({
          cartGoods: cartList,
          cartTotal: res.data.cartTotal
        });
        cart.getCartNum()
      }

      that.setData({
        checkedAllStatus: that.isCheckedAll()
      });
    });
  }
})