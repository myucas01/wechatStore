var api = require('../config/api.js');
var app = getApp();

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Litemall-Token': wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.statusCode == 200) {

          if (res.data.errno == 501) {
            // 清除登录相关内容
            try {
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('token');
            } catch (e) {
              // Do something when catch error
            }
            getBackUrl()
            // 切换到登录页面
            wx.redirectTo({
              url: '/pages/auth/login/login'
            });
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }

      },
      fail: function(err) {
        reject(err)
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function getCurrentPageUrlWithArgs(pageObj) {
  var url = pageObj.route    //当前页面url
  var options = pageObj.options    //如果要获取url中所带的参数可以查看options
  //拼接url的参数
  
  var urlWithArgs = url + '?'
  for (var key in options) {
    var value = options[key]
    urlWithArgs += key + '=' + value + '&'

  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
  return urlWithArgs
}

function getBackUrl() {
  var pages = getCurrentPages();
  var currentPage = pages[pages.length - 1]
  let url = getCurrentPageUrlWithArgs(currentPage)
  let type = 1
  const tabUrl = ['pages/catalog/catalog', 'pages/cart/cart', 'pages/ucenter/index/index', 'pages/index/index']
  if (tabUrl.indexOf(url) > -1) {
    type = 2
  }
  let data = {
    url: url,
    type: type
  }
  wx.setStorageSync('backUrl', data);
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

function showModal(msg) {
  wx.showModal({
    title: '提示',
    content: msg,
  })
}

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  showModal,
  getCurrentPageUrlWithArgs,
  getBackUrl
}