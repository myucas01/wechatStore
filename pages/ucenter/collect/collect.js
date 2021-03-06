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
      title: '我的收藏', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    type: 0,
    collectList: [],
    page: 1,
    limit: 10,
    totalPages: 1
  },
  getCollectList() {
    wx.showLoading({
      title: '加载中...',
    });
    let that = this;
    util.request(api.CollectList, {
      type: that.data.type,
      page: that.data.page,
      limit: that.data.limit
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          collectList: that.data.collectList.concat(res.data.list),
          totalPages: res.data.pages
        });
      }
      wx.hideLoading();
    });
  },
  onLoad: function(options) {
    this.getCollectList();
  },
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1
      });
      this.getCollectList();
    } else {
      wx.showToast({
        title: '没有更多用户收藏了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
  },
  onReady: function() {

  },
  onShow: function() {

  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  },
  openGoods(event) {

    let that = this;
    let index = event.currentTarget.dataset.index;
    let goodsId = this.data.collectList[index].valueId;

    //触摸时间距离页面打开的毫秒数  
    var touchTime = that.data.touchEnd - that.data.touchStart;
    console.log(touchTime);
    //如果按下时间大于350为长按  
    if (touchTime > 350) {
      wx.showModal({
        title: '',
        content: '确定删除吗？',
        success: function(res) {
          if (res.confirm) {

            util.request(api.CollectAddOrDelete, {
              type: that.data.type,
              valueId: goodsId
            }, 'POST').then(function(res) {
              if (res.errno === 0) {
                console.log(res.data);
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                });
                that.data.collectList.splice(index, 1)
                that.setData({
                  collectList: that.data.collectList
                });
              }
            });
          }
        }
      })
    } else {

      wx.navigateTo({
        url: '/pages/goods/goods?id=' + goodsId,
      });
    }
  },
  //按下事件开始  
  touchStart: function(e) {
    let that = this;
    that.setData({
      touchStart: e.timeStamp
    })
  },
  //按下事件结束  
  touchEnd: function(e) {
    let that = this;
    that.setData({
      touchEnd: e.timeStamp
    })
  },
})