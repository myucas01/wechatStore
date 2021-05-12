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
      title: '商品详情', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    bannerInfo: {
      'imgUrl': 'http://yanxuan.nosdn.127.net/8976116db321744084774643a933c5ce.png',
      'name': '大家都在买的'
    },
    categoryFilter: false,
    filterCategory: [],
    goodsList: [],
    categoryId: 0,
    currentSortType: 'default',
    currentSort: 'add_time',
    currentSortOrder: 'desc',
    page: 1,
    limit: 10
  },
  getCategoryList: function() {
    var that = this;

    util.request(api.GoodsFilter, {
        isHot: 1
      })
      .then(function(res) {
        if (res.errno === 0) {
          that.setData({
            filterCategory: res.data.filterCategoryList,
          });
        }
      });
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getGoodsList();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  getGoodsList: function() {
    var that = this;

    util.request(api.GoodsList, {
        isHot: true,
        page: that.data.page,
        limit: that.data.limit,
        order: that.data.currentSortOrder,
        sort: that.data.currentSort,
        categoryId: that.data.categoryId
      })
      .then(function(res) {
        if (res.errno === 0) {
          that.setData({
            goodsList: res.data.list,
            filterCategory: res.data.filterCategoryList
          });
        }
      });

  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    if (app.globalData.hasLogin) {
      this.getGoodsList();
    } else {
      util.getBackUrl()
      wx.redirectTo({
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
  openSortFilter: function(event) {
    let currentId = event.currentTarget.id;
    switch (currentId) {
      case 'categoryFilter':
        this.setData({
          categoryFilter: !this.data.categoryFilter,
          currentSortType: 'category',
          currentSort: 'add_time',
          currentSortOrder: 'desc'
        });
        break;
      case 'priceSort':
        let tmpSortOrder = 'asc';
        if (this.data.currentSortOrder == 'asc') {
          tmpSortOrder = 'desc';
        }
        this.setData({
          currentSortType: 'price',
          currentSort: 'retail_price',
          currentSortOrder: tmpSortOrder,
          categoryFilter: false
        });

        this.getGoodsList();
        break;
      default:
        //综合排序
        this.setData({
          currentSortType: 'default',
          currentSort: 'add_time',
          currentSortOrder: 'desc',
          categoryFilter: false,
          categoryId: 0,
        });
        this.getGoodsList();
    }
  },
  selectCategory: function(event) {
    let currentIndex = event.target.dataset.categoryIndex;
    this.setData({
      'categoryFilter': false,
      'categoryId': this.data.filterCategory[currentIndex].id
    });
    this.getGoodsList();
  }
})