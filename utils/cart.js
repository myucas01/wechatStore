var util = require('util.js');
var api = require('../config/api.js');

function getCartNum() {
  util.request(api.CartList).then(function (res) {
    console.log(res)
    if (res.data.cartList.length > 0) {
      wx.setTabBarBadge({//tabbar右上角添加文本
        index: 2, //tabbar下标
        text: res.data.cartList.length.toString() //显示的内容
      })
    } else {
      wx.removeTabBarBadge({
        index: 2,
      })
    }
  })
}

module.exports = {
  getCartNum
}