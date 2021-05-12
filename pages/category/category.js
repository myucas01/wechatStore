var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#FFFFFF',
      color: '#333333',
      showCapsule: 1, //是否显示左上角图标   1表示返回    0表示关闭
      title: '', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    userType: 0, // 用户类型判断价格展示 0 个人 1,2是企业  没登录展示个人
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1, 
    limit: 10000
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (app.globalData.hasLogin) {
      var that = this;
      if (options.id) {
        that.setData({
          id: parseInt(options.id)
        });
      }
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            scrollHeight: res.windowHeight
          });
        }
      });
    }
  },
  onShow: function () {
    // 页面显示
    if (app.globalData.hasLogin) {
      var that = this;
      let userInfo = wx.getStorageSync('userInfo')
      that.setData({
        userType: userInfo.userType
      })
      this.getCategoryInfo();
    } else {
      util.getBackUrl()
      wx.redirectTo({
        url: "/pages/auth/login/login"
      });
    }
  },
  getCategoryInfo: function() {
    let that = this;
    util.request(api.GoodsCategory, {
        id: this.data.id
      })
      .then(function(res) {

        if (res.errno == 0) {
          that.setData({
            navList: res.data.brotherCategory,
            currentCategory: res.data.currentCategory
          });

          // wx.setNavigationBarTitle({
          //   title: res.data.parentCategory.name
          // })
          let title = 'nvabarData.title';
          that.setData({
            [title]: res.data.parentCategory.name
          })

          // 当id是L1分类id时，这里需要重新设置成L1分类的一个子分类的id
          if (res.data.parentCategory.id == that.data.id) {
            that.setData({
              id: res.data.currentCategory.id
            });
          }

          //nav位置
          let currentIndex = 0;
          let navListCount = that.data.navList.length;
          for (let i = 0; i < navListCount; i++) {
            currentIndex += 1;
            if (that.data.navList[i].id == that.data.id) {
              break;
            }
          }
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }
          that.getGoodsList();

        } else {
          //显示错误信息
        }

      });
  },
  onReady: function() {
    // 页面渲染完成
  },
  onHide: function() {
    // 页面隐藏
  },
  getGoodsList: function() {
    var that = this;

    util.request(api.GoodsList, {
        categoryId: that.data.id,
        page: that.data.page,
        limit: that.data.limit
      })
      .then(function(res) {
        that.setData({
          goodsList: res.data.list,
        });
      });
  },
  onUnload: function() {
    // 页面关闭
  },
  switchCate: function(event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });

    this.getCategoryInfo();
  }
})