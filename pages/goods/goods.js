var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');
var cart = require('../../utils/cart.js')

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#FFFFFF',
      color: '#333333',
      showCapsule: 1, //是否显示左上角图标   1表示返回    0表示关闭
      title: '商品详情', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    canShare: false,
    id: 0,
    goods: {},
    img_url: [],
    groupon: [], //该商品支持的团购规格
    grouponLink: {}, //参与的团购
    attribute: [],
    issueList: [], 
    comment: [],
    brand: {},
    specificationList: [],
    productList: [],
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    number: 1,
    checkedSpecText: '规格数量选择',
    tmpSpecText: '请选择规格数量',
    checkedSpecPrice: 0,
    pic:'',
    openAttr: false,
    openShare: false,
    openAttrTrue: false,
    openAttrType: 1,
    noCollectImage: '/static/images/icon_collect.png',
    hasCollectImage: '/static/images/icon_collect_checked.png',
    collectImage: '/static/images/icon_collect.png',
    shareImage: '',
    isGroupon: false, //标识是否是一个参团购买
    soldout: false,
    canWrite: false, //用户是否获取了保存相册的权限
    leastNum:true,//数量已是最小值
    firstmaxNum: false, // 数量最大值
    addToCart: {
      bg: '#fff',
      fc: '#ED3F14'
    },
    addFastBg: {
      bg: '#fff',
      fc: '#ED3F14'
    },
    member_max_quantity: '', // 限购数量
    user_site:'', // 送至默认地址
    user_site_list:{} , // 送至弹窗内容地址
    alladdress: [],
    open_detail_site: false, // 送至地址弹窗显示隐藏
    open_error_site: false, // 该商品在该地区暂不支持销售,非常抱歉!
    catalog_id: 0, // 跳转到分类的id
    addressId: '', // 配送的地址id
    cartId: '',
    couponId:'',
    grouponRulesId: '',
    grouponLinkId:'',
    userType: '0',
  },
  closeCart: function(e) {
    var that = this;
    //打开规格选择窗口
    that.setData({
      openAttrTrue: false,
      openAttr: false
    });
  },
  closeNo: function(e) {},

  //选择地址弹窗 赋值到 地址展示区
  set_default_site: function(e){
    // 请求接口判断是否可配送此区域
    this.setData({
      user_site_list: e.currentTarget.dataset.address,
      open_detail_site: false
      // add: e.currentTarget.dataset.address,
      // user_site: e.currentTarget.dataset.detailsite,
      // open_detail_site: false,
      // open_error_site: false // 该商品在该地区暂不支持销售,非常抱歉!
    })
    // 判断地址 _id_ 是否可配送 (每次点击地址重新赋值addressId) 再次调用判断
    this.judge_site();
  },
  // 页面分享
  onShareAppMessage: function() {
    let that = this;
    return {
      title: that.data.goods.name,
      desc: '唯爱与美食不可辜负',
      path: '/pages/index/index?goodId=' + this.data.id
    }
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getGoodsInfo( );
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  shareFriendOrCircle: function() {
    //var that = this;
    if (this.data.openShare === false) {
      this.setData({
        openShare: !this.data.openShare
      });
    } else {
      return false;
    }
  },
  handleSetting: function(e) {
      var that = this;
      // console.log(e)
      if (!e.detail.authSetting['scope.writePhotosAlbum']) {
          wx.showModal({
              title: '警告',
              content: '不授权无法保存',
              showCancel: false
          })
          that.setData({
              canWrite: false
          })
      } else {
          wx.showToast({
              title: '保存成功'
          })
          that.setData({
              canWrite: true
          })
      }
  },
  // 保存分享图
  saveShare: function() {
    let that = this;
    wx.downloadFile({
      url: that.data.shareImage,
      success: function(res) {
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.showModal({
              title: '存图成功',
              content: '图片成功保存到相册了，可以分享到朋友圈了',
              showCancel: false,
              confirmText: '好的',
              confirmColor: '#a78845',
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定');
                }
              }
            })
          },
          fail: function(res) {
            console.log('fail')
          }
        })
      },
      fail: function() {
        console.log('fail')
      }
    })
  },
  //从分享的团购进入
  getGrouponInfo: function(grouponId) {
    let that = this;
    util.request(api.GroupOnJoin, {
      grouponId: grouponId
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          grouponLink: res.data.groupon,
          id: res.data.goods.id
        });
        //获取商品详情
        that.getGoodsInfo();
      }
    });
  },
  // 判断地址 _id_ 是否可配送 (每次点击地址重新赋值addressId) 再次调用判断
  judge_site: function(){
    var that = this;
    // console.log(that.data.user_site_list)
    let userInfo = wx.getStorageSync('userInfo');
    // util.request(api.AuthLoginByPhone, {
    //   captcha: that.data.code,
    //   phonenum: that.data.phone
    // }, 'POST')
    console.log(that.data.user_site_list)
    util.request(api.CartCheckAddress, {  // 判断是否可配送地址
      isCart: false,
      brandIds: [that.data.brand.id],
      city: that.data.user_site_list.city,
    }, 'POST').then(res => {   
      if (res.errno == 507) {
        that.setData({ // 设置默认显示地址
          user_site: that.data.user_site_list.province + that.data.user_site_list.county,
          open_error_site: true
        })
      }else{
        that.setData({
          open_error_site: false
        })
      }
    })
  },
  // 获取商品信息
  getGoodsInfo: function() {
    let userInfo = wx.getStorageSync('userInfo');
    let that = this;
    // var userInfo_list =0;
    // if (userInfo.userType == "undefined"){
    //   userInfo_list = 0;
    // }else if (userInfo.userType == 0 ){
    //   userInfo_list = 1;
    // } else if (userInfo.userType == 1 || userInfo.userType == 2 ){
    //   userInfo_list = 2;
    // }
    util.request(api.GoodsDetail, {
      id: that.data.id,
      companyId: userInfo.companyId||0,
      userType: userInfo.userType
    }).then(function(res) {
      if (res.errno === 0) {
        // 详情 送至 地址
        // res.data.addressDefault = [
        //   "1广西省贵州自治区乌鸦镇黄海路",
        //   "2广西省贵州自治区乌鸦镇黄海路",
        //   "3广西省贵州自治区乌鸦镇黄海路",
        //   "4广西省贵州自治区乌鸦镇黄海路",
        //   "5广西省贵州自治区乌鸦镇黄海路"
        // ]
        var cartId = wx.getStorageSync('cartId');
        if (cartId === "") { cartId = 0; }
        if (res.data.distributionRange.length > 0){
          that.setData({
            cartId: cartId,
            user_site_list: res.data.addressDefault,
            alladdress: res.data.distributionRange,
            brand: res.data.brand,
            catalog_id: res.data.info.categoryId,
            member_max_quantity: res.data.info.memberMaxQuantity
          })

          for (var i = 0; i < that.data.alladdress.length; i++) {
            if (that.data.alladdress[i].isDefault) {
              that.setData({
                user_site_list: that.data.alladdress[i]
              })
            }
          }

          that.judge_site()
        }else{
          that.setData({
            // cartId: cartId,
            // catalog_id: res.data.info.categoryId,
            member_max_quantity: res.data.info.memberMaxQuantity
          })
          wx.getStorage({
            key: "tude",
            success: function (res) {
              console.log(res)
              util.request(api.AddressOn, {
                longitude: res.data.longitude,
                latitude: res.data.latitude
              }).then(function (res) {
                console.log(res)
                if (res.errno === 0) {
                  that.setData({
                    user_site_list: { province: res.data.province, county: res.data.district, }
                  })
                }
              })
            }
          })
          // that.judge_site()
        }
        let _specificationList = res.data.specificationList
        // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
        if (_specificationList&&_specificationList.length >= 1) {
          if (_specificationList[0].valueList.length == 1) {
            _specificationList[0].valueList[0].checked = true
            // 如果仅仅存在一种货品，那么商品价格应该和货品价格一致
            // 这里检测一下
            let _productPrice = res.data.productList[0].price;
            let _goodsPrice = res.data.info.retailPrice;
            if (_productPrice != _goodsPrice) {
              console.error('商品数量价格和货品不一致');
            }

            that.setData({
              checkedSpecText: _specificationList[0].valueList[0].value,
              tmpSpecText: '已选择：' + _specificationList[0].valueList[0].value,
            });
          }
        }
        console.log(userInfo.userType)
        // if (userInfo.userType === 0) {
        //   data = res.data.info.moq
        // } 
        
        // if (userInfo.userType === '2') {
        //   data = res.data.info.memberMoq
        // }
        // console.log(res.data.info.moq)

        let data = that.data.userType == 0 ? res.data.info.memberMoq : res.data.info.moq
        that.setData({
          goods: res.data.info,
          img_url: res.data.info.gallery,
          pic: res.data.info.picUrl,
          number: data,
          attribute: res.data.attribute,
          issueList: res.data.issue,
          comment: res.data.comment,
          brand: res.data.brand,
          specificationList: res.data.specificationList,
          productList: res.data.productList,
          userHasCollect: res.data.userHasCollect,
          shareImage: res.data.shareImage,
          checkedSpecPrice: that.data.userType == 0 ? res.data.info.memberPrice : (that.data.userType == 1 || 2 ? res.data.info.collectPrice : res.data.info.memberPrice),
          groupon: res.data.groupon,
          canShare: res.data.share,
        });

        //如果是通过分享的团购参加团购，则团购项目应该与分享的一致并且不可更改
        if (that.data.isGroupon) {
          let groupons = that.data.groupon;
          for (var i = 0; i < groupons.length; i++) {
            if (groupons[i].id != that.data.grouponLink.rulesId) {
              groupons.splice(i, 1);
            }
          }
          groupons[0].checked = true;
          //重设团购规格
          that.setData({
            groupon: groupons
          });
        }
        if (res.data.userHasCollect == 1) {
          that.setData({
            collectImage: that.data.hasCollectImage
          });
        } else {
          that.setData({
            collectImage: that.data.noCollectImage
          });
        }
        WxParse.wxParse('goodsDetail', 'html', res.data.info.detail, that);
        //获取推荐商品
        that.getGoodsRelated();
      }
    });
  },
  // 获取推荐商品
  getGoodsRelated: function () {
    const user_info = wx.getStorageSync("userInfo") // 获取usertype  根据usertype来展示商品
    let that = this;
    util.request(api.GoodsRelated, {
      id: that.data.id,
      userType: user_info.userType || 0
    }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          relatedGoods: res.data.list,
        });
      }
    });
  },
  // 团购选择
  clickGroupon: function(event) {
    let that = this;

    //参与团购，不可更改选择
    if (that.data.isGroupon) {
      return;
    }

    let specName = event.currentTarget.dataset.name;
    let specValueId = event.currentTarget.dataset.valueId;

    let _grouponList = this.data.groupon;
    for (let i = 0; i < _grouponList.length; i++) {
      if (_grouponList[i].id == specValueId) {
        if (_grouponList[i].checked) {
          _grouponList[i].checked = false;
        } else {
          _grouponList[i].checked = true;
        }
      } else {
        _grouponList[i].checked = false;
      }
    }

    this.setData({
      groupon: _grouponList,
    });
  },
  // 规格选择
  clickSkuValue: function(event) {
    // let that = this;
    // let specName = event.currentTarget.dataset.name;
    // let specValueId = event.currentTarget.dataset.valueId;

    // //判断是否可以点击

    // //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    // let _specificationList = this.data.specificationList;
    // for (let i = 0; i < _specificationList.length; i++) {
    //   if (_specificationList[i].name === specName) {
    //     for (let j = 0; j < _specificationList[i].valueList.length; j++) {
    //       if (_specificationList[i].valueList[j].id == specValueId) {
    //         //如果已经选中，则反选
    //         if (_specificationList[i].valueList[j].checked) {
    //           _specificationList[i].valueList[j].checked = false;
    //         } else {
    //           _specificationList[i].valueList[j].checked = true;
    //         }
    //       } else {
    //         _specificationList[i].valueList[j].checked = false;
    //       }
    //     }
    //   }
    // }
    // this.setData({
    //   specificationList: _specificationList,
    // });
    //重新计算spec改变后的信息
    // this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },
  //获取选中的团购信息
  getCheckedGrouponValue: function() {
    let checkedValues = {};
    let _grouponList = this.data.groupon;
    for (let i = 0; i < _grouponList.length; i++) {
      if (_grouponList[i].checked) {
        checkedValues = _grouponList[i];
      }
    }

    return checkedValues;
  },
  //获取选中的规格信息
  getCheckedSpecValue: function() {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        name: _specificationList[i].name,
        valueId: 0,
        valueText: ''
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }

    return checkedValues;
  },
  //判断规格是否选择完整
  isCheckedAllSpec: function() {
    return !this.getCheckedSpecValue().some(function(v) {
      if (v.valueId == 0) {
        return true;
      }
    });
  },
  getCheckedSpecKey: function() {
    let checkedValue = this.getCheckedSpecValue().map(function(v) {
      return v.valueText;
    });
    return checkedValue;
  },
  // 规格改变时，重新计算价格及显示信息
  changeSpecInfo: function() {
    let checkedNameValue = this.getCheckedSpecValue();

    //设置选择的信息
    let checkedValue = checkedNameValue.filter(function(v) {
      if (v.valueId != 0) {
        return true;
      } else {
        return false;
      }
    }).map(function(v) {
      return v.valueText;
    });
    if (checkedValue.length > 0) {
      this.setData({
        tmpSpecText: '已选择：'+checkedValue.join('　')
      });
    } else {
      this.setData({
        tmpSpecText: '请选择规格数量',
        pic:this.data.goods.picUrl
      });
    }

    if (this.isCheckedAllSpec()) {
      this.setData({
        checkedSpecText: this.data.tmpSpecText
      });

      // 规格所对应的货品选择以后
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        this.setData({
          soldout: true
        });
        console.error('规格所对应货品不存在');
        return;
      }

      let checkedProduct = checkedProductArray[0];

      if (checkedProduct.number > 0) {
        this.setData({
          checkedSpecPrice: checkedProduct.price,
          pic: checkedProduct.url,
          soldout: false
        });
      } else {
        this.setData({
          checkedSpecPrice: (this.data.userType == 0) || (this.data.userType == 1) ? this.data.goods.memberPrice : checkedProduct.price,
          soldout: true
        });
      }

    } else {
      this.setData({
        checkedSpecText: '规格数量选择',
        checkedSpecPrice: (this.data.userType == 0) || (this.data.userType == 1) ? this.data.goods.memberPrice : checkedProduct.price,
        soldout: false
      });
    }

  },
  // 获取选中的产品（根据规格）
  getCheckedProductItem: function(key) {
    return this.data.productList.filter(function(v) {
      if (v.specifications.toString() == key.toString()) {
        return true;
      } else {
        return false;
      }
    });
  },
  onLoad: function(options) {
    let that = this
    // 页面初始化 options为页面跳转所带来的参数
    if (app.globalData.hasLogin) {
      if (options.id) {
        that.setData({
          id: parseInt(options.id)
        });
        that.getGoodsInfo();  // 加载详情数据
      }
      if (options.grouponId) {
        that.setData({
          isGroupon: true,
        });
        that.getGrouponInfo(options.grouponId);
      }
    }
    // wx.getSetting({
    //     success: function (res) {
    //         console.log(res)
    //         //不存在相册授权
    //         if (!res.authSetting['scope.writePhotosAlbum']) {
    //             wx.authorize({
    //                 scope: 'scope.writePhotosAlbum',
    //                 success: function () {
    //                     that.setData({
    //                         canWrite: true
    //                     })
    //                 },
    //                 fail: function (err) {
    //                     that.setData({
    //                         canWrite: false
    //                     })
    //                 }
    //             })
    //         } else {
    //             that.setData({
    //                 canWrite: true
    //             });
    //         }
    //     }
    // })
  },
  onShow: function() {
    // 页面显示
    var that = this;
    if (app.globalData.hasLogin) {
      let userInfo = wx.getStorageSync('userInfo')
      that.setData({
        userType: userInfo.userType
      })
      util.request(api.CartGoodsCount).then(function (res) {
        if (res.errno === 0) {
          that.setData({
            cartGoodsCount: res.data
          });
        }
      });
    } else {
      util.getBackUrl()
      wx.redirectTo({
        url: "/pages/auth/login/login"
      });
    }
  },
  //添加或是取消收藏
  addCollectOrNot: function() {
    let that = this;
    util.request(api.CollectAddOrDelete, {
        type: 0,
        valueId: this.data.id
      }, "POST")
      .then(function(res) {
        if (that.data.userHasCollect == 1) {
          that.setData({
            collectImage: that.data.noCollectImage,
            userHasCollect: 0
          });
        } else {
          that.setData({
            collectImage: that.data.hasCollectImage,
            userHasCollect: 1
          });
        }

      });

  },
  // 加入购物车按钮事件
  addToCart: function () {
    var that = this;
    //打开规格选择窗口
    that.setData({
      openAttrTrue: !that.data.openAttrTrue,
      openAttrType: 1
    });
  },
  addGoods: function () {
    this.clearButtonType()
    this.setData({
      addToCart: {
        bg: '#ED3F14',
        fc: '#fff'
      }
    })
    // 判断规格
    if (!this.isCheckedAllSpec()) {
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '请选择完整规格'
      });
      return false;
    }

    // 根据选中的规格，判断是否有对应的sku信息
    let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
    if (!checkedProductArray || checkedProductArray.length <= 0) {
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '没有库存'
      });
      return false;
    }

    // 验证库存
    let checkedProduct = checkedProductArray[0];
    if (checkedProduct.number <= 0) {
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '没有库存'
      });
      return false;
    }

    // userInfo.userType == 0 ? res.data.info.memberMoq : res.data.info.moq
    let data = this.data.userType == 0 ? this.data.goods.memberMoq : this.data.goods.moq
    if (this.data.number < data) {
      wx.showToast({
        icon: 'none',
        title: '数量不能小于起订量'
      });
      return
    }

    //添加到购物车
    util.request(api.CartAdd, {
      goodsId: this.data.goods.id,
      number: this.data.number,
      productId: checkedProduct.id
    }, "POST")
      .then(function (res) {
        let _res = res;
        if (_res.errno == 0) {
          wx.showToast({
            title: '添加成功'
          });
          cart.getCartNum()
          // that.setData({
          //   openAttr: !that.data.openAttr,
          //   cartGoodsCount: _res.data
          // });
          // if (that.data.userHasCollect == 1) {
          //   that.setData({
          //     collectImage: that.data.hasCollectImage
          //   });
          // } else {
          //   that.setData({
          //     collectImage: that.data.noCollectImage
          //   });
          // }
          // wx.switchTab({
          //   url: '/pages/cart/cart'
          // });
        } else {
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: _res.errmsg,
            mask: true
          });
        }

      });
  },
  // 立即购买按钮事件
  addFast: function() {
    var that = this;
    //打开规格选择窗口
    that.setData({
      openAttrTrue: !that.data.openAttrTrue,
      openAttrType: 2
    });
  },
  buyGoods: function() {
    this.clearButtonType()
    this.setData({
      addFastBg: {
        bg: '#ED3F14',
        fc: '#fff'
      }
    })
    //提示选择完整规格
    if (!this.isCheckedAllSpec()) {
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '请选择完整规格'
      });
      return false;
    }

    //根据选中的规格，判断是否有对应的sku信息
    let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
    if (!checkedProductArray || checkedProductArray.length <= 0) {
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '没有库存'
      });
      return false;
    }

    let checkedProduct = checkedProductArray[0];
    //验证库存
    if (checkedProduct.number <= 0) {
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '没有库存'
      });
      return false;
    }

    let data = this.data.userType == 0 ? this.data.goods.memberMoq : this.data.goods.moq

    if (this.data.number < data) {
      wx.showToast({
        icon: 'none',
        title: '数量不能小于起订量'
      });
      return
    }
    //验证团购是否有效
    let checkedGroupon = this.getCheckedGrouponValue();

    //立即购买
    util.request(api.CartFastAdd, {
      goodsId: this.data.goods.id,
      number: this.data.number,
      productId: checkedProduct.id
    }, "POST")
      .then(function (res) {
        if (res.errno == 0) {

          // 如果storage中设置了cartId，则是立即购买，否则是购物车购买
          try {
            wx.setStorageSync('cartId', res.data);
            // wx.setStorageSync('grouponRulesId', checkedGroupon.id);
            // wx.setStorageSync('grouponLinkId', this.data.grouponLink.id);
            wx.navigateTo({
              url: '/pages/checkout/checkout'
            })
          } catch (e) { }

        } else {
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: res.errmsg,
            mask: true
          });
        }
      });

  },
  // 添加到购物车 or 立即购买
  sureToCart: function() {
    let that = this
    // 判断规格
    if (!this.isCheckedAllSpec()) {
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '请选择完整规格'
      });
      return false;
    }

    // 根据选中的规格，判断是否有对应的sku信息
    let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
    if (!checkedProductArray || checkedProductArray.length <= 0) {
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '没有库存'
      });
      return false;
    }

    // 验证库存
    let checkedProduct = checkedProductArray[0];
    if (checkedProduct.number <= 0) {
      wx.showToast({
        image: '/static/images/icon_error.png',
        title: '没有库存'
      });
      return false;
    }

    let data = this.data.userType == 0 ? this.data.goods.memberMoq : this.data.goods.moq
    if (this.data.number < data) {
      wx.showToast({
        icon: 'none',
        title: '数量不能小于起订量'
      });
      return
    }
    if (this.data.openAttrType === 1) {
      //添加到购物车
      util.request(api.CartAdd, {
        goodsId: this.data.goods.id, 
        number: this.data.number,
        productId: checkedProduct.id
      }, "POST")
        .then(function (res) {
          let _res = res;
          if (_res.errno == 0) {
            wx.showToast({
              title: '添加成功'
            });
            cart.getCartNum()
            // wx.switchTab({
            //   url: '/pages/cart/cart'
            // });
            // that.setData({
            //   openAttr: !that.data.openAttr,
            //   cartGoodsCount: _res.data
            // });
            // if (that.data.userHasCollect == 1) {
            //   that.setData({
            //     collectImage: that.data.hasCollectImage
            //   });
            // } else {
            //   that.setData({
            //     collectImage: that.data.noCollectImage
            //   });
            // }
            // wx.switchTab({
            //   url: '/pages/cart/cart'
            // });
          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: _res.errmsg,
              mask: true
            });
          }

        });
    } else if (this.data.openAttrType === 2) {
      //验证团购是否有效
      let checkedGroupon = this.getCheckedGrouponValue();
      //立即购买
      util.request(api.CartFastAdd, {
        goodsId: this.data.goods.id,
        number: this.data.number,
        productId: checkedProduct.id
      }, "POST")
        .then(function (res) {
          if (res.errno == 0) {
            // 如果storage中设置了cartId，则是立即购买，否则是购物车购买
            try {
              wx.setStorageSync('cartId', res.data);
              // wx.setStorageSync('grouponRulesId', checkedGroupon.id);
              // wx.setStorageSync('grouponLinkId', this.data.grouponLink.id);
              wx.navigateTo({
                url: '/pages/checkout/checkout'
              })
            } catch (e) { }

          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: res.errmsg,
              mask: true
            });
          }
        });
    }
  },
  clearButtonType: function() {
    this.setData({
      addToCart: {
        bg: '#fff',
        fc: '#ED3F14'
      },
      addFastBg: {
        bg: '#fff',
        fc: '#ED3F14'
      }
    })
  },
  cutNumber: function() {
    let data = this.data.userType === 0 ? this.data.goods.moq : this.data.goods.memberMoq
    if (this.data.number > data){
      this.setData({
        number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
      });
      if (this.data.number == data){
        this.setData({
          leastNum: true
        })
      }
    }else{
      this.setData({
        leastNum: true
      })
    }
    
  },
  addNumber: function() {
    if (this.data.number >= this.data.member_max_quantity){
      console.log(this.data.number, this.data.member_max_quantity)
      wx.showToast({
        title: '已达到限购数量',
        // duration: 1000
      })
      this.setData({
        firstmaxNum : true
      });
      console.log(this.data.firstmaxNum)
      return 
    }
    this.setData({
      number: (this.data.number + 1) > this.data.member_max_quantity ? this.data.number : (this.data.number + 1)
    });
    if (this.data.number > this.data.goods.moq) {
      this.setData({
        leastNum: false
      })
    }
    console.log(this.data.number, this.data.member_max_quantity)
  },
  numberInput:function(e){
    let value = parseFloat(e.detail.value)
    if (value>= this.data.member_max_quantity ){
      this.setData({
        number: this.data.member_max_quantity
      });
      
    } else if (value <= this.data.number){
      this.setData({
        number: value
      });
    }else{
      this.setData({
        number: value
      });
    }
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  switchAttrPop: function() {
    if (this.data.open_error_site) return // 该地区不支持销售， 同时禁用 选择标准事件
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr
      });
    }
  },
  closeAttr: function() {
    this.setData({
      openAttr: false,
    });
  },
  closeAttrTrue: function () {
    this.setData({
      openAttrTrue: false,
      openAttr: false
    });
  },
  closeShare: function() {
    this.setData({
      openShare: false,
    });
  },
  openCartPage: function() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },
  onReady: function() {
    // 页面渲染完成
  },
  //关闭选择地址弹窗
  close_detail_site: function (){
    this.setData({
      open_detail_site: false
    })
  },
  //打开选择地址弹窗
  openShow_detail_site: function (){
    this.setData({
      open_detail_site: true
    })
  }
})