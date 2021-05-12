const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');
const cart = require('../../utils/cart.js')

//获取应用实例
const app = getApp();

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#ED3F14',
      color: '#FFFFFF',
      showCapsule: 2, //是否显示左上角图标   1表示显示    0表示不显示
      title: '凑一份', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    userType: 0, // 用户类型判断价格展示 0 个人 1,2是企业  没登录展示个人
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    groupons: [],
    floorGoods: [],
    banner: [],
    channel: [],
    coupon: [],
    goodsCount: 0,
    navbarList:[ // navbar-list导航栏
      {
        url: '../../static/images/home/1.png',
        name: '食品',
        id: 1036013
      },{
        url: '../../static/images/home/2.png',
        name: '饮品',
        id: 1036015
      },{
        url: '../../static/images/home/3.png',
        name: '副食',
        id: 1036018
      },{
        url: '../../static/images/home/4.png',
        name: '母婴',
        id: 1036033
      },{
        url: '../../static/images/home/5.png',
        name: '中外名酒',
        id: 1036035
      },{
        url: '../../static/images/home/6.png',
        name: '日化用品',
        id: 1036037
      },{
        url: '../../static/images/home/7.png',
        name: '厨卫用品',
        id: 1036044
      },{
        url: '../../static/images/home/8.png',
        // name: '敬请期待',
        name: '国际通',
        id: 1036057
      }
    ],
    hot_banner_url:'../../static/images/home/home_center.png', // 热门品牌图片
    hot_cake_three_list: ['1181265', '1181138', 1181255],
    hot_cake_three:[
      {
        id: '1181265',
        three_url: '../../static/images/home/hot_price1.png',
        url: 'http://212.64.108.240:8077/wx/storage/fetch/s27lwemz62efwvf8sppe.png',
        name: '抢！潘婷沁润水养洗发露',
        on_sale: '潘婷',
        price: '55.20',
        old_price: '69',
        sold_out: '2万+件',
        sales: '已爆售'
      },{
        id: '1181153',
        three_url: '../../static/images/home/hot_price2.png',
        url: 'http://212.64.108.240:8077/wx/storage/fetch/05i20inuxvf6f4106084.jpg',
        name: '清净海环保洗碗精，柠檬透压1000g/瓶',
        on_sale: '清净海',
        price: '60',
        old_price: '75',
        sold_out: '1万+件',
        sales: '已爆售'
      },{
        id: '1181255',
        three_url: '../../static/images/home/hot_price3.png',
        url: 'http://212.64.108.240:8077/wx/storage/fetch/bhmfaee9xf553t25o03n.png',
        name: '布兰达荣耀干红葡萄酒',
        on_sale: '法国拉蒙',
        price: '139.00',
        old_price: '199.00',
        sold_out: '1万+件',
        sales: '已爆售'
      }
    ],
    hot_cake_list:[
      {
        id: '1181275',
        url: 'http://212.64.108.240:8077/wx/storage/fetch/75cufw0k0fn05iq53bf8.png',
        name: 'Olay精华身体乳 莹亮修护 200ml',
        on_sale: '玉兰油',
        price: '55.9',
        old_price: '79.9',
        sold_out: '5千+件',
        sales: '已爆售',
        discount: ''
      },
      {
        id: '1181311',
        url: 'http://212.64.108.240:8077/wx/storage/fetch/m9in83fo6ejviw6dtts9.png',
        name: '欧乐B牙龈专护—绿茶 持久清新修护 140克',
        on_sale: '欧乐B',
        price: '25.9',
        old_price: '35.9',
        sold_out: '5千+件',
        sales: '已爆售',
        discount: ''
      }
      // {
      //   id: '1181206',
      //   url: 'http://212.64.108.240:8077/wx/storage/fetch/qbwtdxp71mmgbvpyswij.jpg',
      //   name: '桂格即食燕麦片1000克罐装*12',
      //   on_sale: '桂格',
      //   price: '273.90',
      //   old_price: '300',
      //   sold_out: '5千+件',
      //   sales: '已爆售',
      //   discount: ''
      // }
    ]
  },

  onShareAppMessage: function() {
    return {
      title: '小程序商场',
      desc: '微信小程序商城',
      path: '/pages/index/index'
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getIndexData();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  }, 
  toNavlink:function(e){ // navbar 8个 导航
    let id = e.currentTarget.dataset.index
    if (id > 0) {
      wx.navigateTo({
        url: '/pages/category/category?id=' + id
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '敬请期待',
        showCancel: false
      })
    }
    // /pages/category/category?id={{item.id}}
    // let name = e.currentTarget.dataset.tonavlink;
    // switch(name.name){
    //   case '食品': break;
    //   case '饮品': break;
    //   case '粮油副食': break;
    //   case '母婴': break;
    //   case '中外名酒': break;
    //   case '日化用品': break;
    //   case '厨卫用品': break;
    //   case '全球购':
    //     wx.navigateTo({
    //       url: '/pages/globalShoping/globalShoping'//页面路径
    //     })
    //   break;
    // }
  },
  getIndexData: function () {
    const user_info = wx.getStorageSync("userInfo") // 获取usertype  根据usertype来展示商品
    let that = this;
    util.request(api.IndexUrl, { userType: user_info.userType || 0 }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          newGoods: res.data.newGoodsList,
          hotGoods: res.data.hotGoodsList,
          topics: res.data.topicList,
          brands: res.data.brandList,
          floorGoods: res.data.floorGoodsList,
          banner: res.data.banner,
          groupons: res.data.grouponList,
          channel: res.data.channel,
          coupon: res.data.couponList
        });
      }
    });
    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data
      });
    });
  },

  onLoad: function(options) {
    // let that = this
    // util.request('http://www.parramountain.com:10181/goodType.js').then(function (res) {
    //   that.setData({
    //     navbarList: res
    //   })
    // })
    
    // this.getTopThree()
    if (options.scene) {
      //这个scene的值存在则证明首页的开启来源于朋友圈分享的图,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      var scene = decodeURIComponent(options.scene);
      console.log("scene:" + scene);

      let info_arr = [];
      info_arr = scene.split(',');
      let _type = info_arr[0];
      let id = info_arr[1];

      if (_type == 'goods') {
        wx.navigateTo({
          url: '../goods/goods?id=' + id
        });
      } else if (_type == 'groupon') {
        wx.navigateTo({
          url: '../goods/goods?grouponId=' + id
        });
      } else {
        wx.navigateTo({
          url: '../index/index'
        });
      }
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.grouponId) {
      //这个pageId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?grouponId=' + options.grouponId
      });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.goodId) {
      //这个goodId的值存在则证明首页的开启来源于分享,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?id=' + options.goodId
      });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.orderId) {
      //这个orderId的值存在则证明首页的开启来源于订单模版通知,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../ucenter/orderDetail/orderDetail?id=' + options.orderId
      });
    }

    // 循环查询爆款前三名
    this.getIndexData();
  },
  // getTopThree: function() {
  //   let that = this
  //   let list = this.data.hot_cake_three_list
  //   let userInfo = wx.getStorageSync('userInfo');
  //   for (var i = 0; i < list.length; ++i) {
  //     console.log(list[i])
  //     util.request(api.GoodsDetail, {
  //       id: list[i],
  //       companyId: userInfo.companyId || 0,
  //       userType: userInfo.userType
  //     }).then(function (res) {
  //       let pic = ''
  //       if (i = 0) {
  //         pic =  '../../static/images/home/hot_price1.png'
  //       } 
  //       if (i = 1) {
  //         pic = '../../static/images/home/hot_price2.png'
  //       }
  //       if (i = 2) {
  //         pic = '../../static/images/home/hot_price3.png'
  //       }
  //       console.log(pic)
  //       let good = 
  //       {
  //         id: res.data.info.id,
  //         three_url: pic,
  //         url: res.data.info.picUrl,
  //         name: res.data.info.name,
  //         on_sale: res.data.brand.name,
  //         price: res.data.info.collectPrice,
  //         old_price: res.data.info.counterPrice,
  //         sold_out: '2万+件',
  //         sales: '已爆售'
  //       }
  //       that.setData({
  //         hot_cake_three: that.data.hot_cake_three.concat(good)
  //       });
  //     })
  //   }
  // },
  onReady: function() {
    // 页面渲染完成
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log(res)
        const latitude = res.latitude
        const longitude = res.longitude
        wx.setStorageSync('tude', res)
      }
    })
  },
  onShow: function() {
    var that = this;
    if (app.globalData.hasLogin) {
      cart.getCartNum()
      // 页面显示
      wx.getStorage({
        key: 'userInfo',
        success: function (res) {
          that.setData({
            userType: res.data.userType
          })
        }
      })
    }
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  getCoupon(e) {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({
        url: "/pages/auth/accountLogin/accountLogin"
      });
    }

    let couponId = e.currentTarget.dataset.index
    util.request(api.CouponReceive, {
      couponId: couponId
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({
          title: "领取成功"
        })
      }
      else{
        util.showErrorToast(res.errmsg);
      }
    })
  },
})