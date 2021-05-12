var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var check = require('../../../utils/check.js');
var area = require('../../../utils/area.js');

var app = getApp();
Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      background: '#FFFFFF',
      color: '#333333',
      showCapsule: 1, //是否显示左上角图标   1表示返回    0表示关闭
      title: '地址管理', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 30,  
    deleteAddress_show: false,
    region: [], // 省市区
    address: {
      id: 0,
      areaCode: 0,
      address: '',
      name: '',
      tel: '',
      isDefault: 0,
      province: '',
      city: '',
      county: ''
    },
    addressId: 0,
    openSelectRegion: false,
    selectRegionList: [{
        code: 0,
        name: '省份'
      },
      {
        code: 0,
        name: '城市'
      },
      {
        code: 0,
        name: '区县'
      }
    ],
    regionType: 1,
    regionList: [],
    selectRegionDone: false
  },
  bindinputMobile(event) {
    let address = this.data.address;
    address.tel = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputName(event) {
    let address = this.data.address;
    address.name = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputAddress(event) {
    let address = this.data.address;
    address.addressDetail = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindIsDefault() {
    let address = this.data.address;
    address.isDefault = !address.isDefault;
    this.setData({
      address: address
    });
  },
  getAddressDetail() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo'); // 登录成功之后c端没有返回userType没有设置为0
    util.request(api.AddressDetail + '?userType=' + (userInfo.userType || 0) + '&companyId=' + (userInfo.companyId) + '&id=' + that.data.addressId)
      .then(function(res) {
        console.log(res)
        if (res.errno === 0) {
          if (res.data) {
            that.data.region = [res.data.province, res.data.city, res.data.county]
            that.setData({
              address: res.data,
              region: that.data.region
            });
          }
        }
      });
  },
  setRegionDoneStatus() {
    let that = this;
    let doneStatus = that.data.selectRegionList.every(item => {
      return item.code != 0;
    });

    that.setData({
      selectRegionDone: doneStatus
    })

  },
  chooseRegion() {
    let that = this;
    this.setData({
      openSelectRegion: !this.data.openSelectRegion
    });

    //设置区域选择数据
    let address = this.data.address;
    if (address.areaCode > 0) {
      let selectRegionList = this.data.selectRegionList;
      selectRegionList[0].code = address.areaCode.slice(0, 2) + '0000';
      selectRegionList[0].name = address.province;

      selectRegionList[1].code = address.areaCode.slice(0, 4) + '00';
      selectRegionList[1].name = address.city;

      selectRegionList[2].code = address.areaCode;
      selectRegionList[2].name = address.county;

      let regionList = area.getList('county', address.areaCode.slice(0, 4));
      regionList = regionList.map(item => {
        //标记已选择的
        if (address.areaCode === item.code) {
          item.selected = true;
        } else {
          item.selected = false;
        }
        return item;
      })

      this.setData({
        selectRegionList: selectRegionList,
        regionType: 3,
        regionList: regionList
      });

    } else {
      let selectRegionList = [{
          code: 0,
          name: '省份',
        },
        {
          code: 0,
          name: '城市',
        },
        {
          code: 0,
          name: '区县',
        }
      ];

      this.setData({
        selectRegionList: selectRegionList,
        regionType: 1,
        regionList: area.getList('province')
      });
    }

    this.setRegionDoneStatus();

  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options)
    if (options.id && options.id != 0) {
      this.setData({
        addressId: options.id
      });
      this.getAddressDetail();
    }
  },
  onReady: function() {

  },
  selectRegionType(event) {
    let that = this;
    let regionTypeIndex = event.target.dataset.regionTypeIndex;
    let selectRegionList = that.data.selectRegionList;

    //判断是否可点击
    if (regionTypeIndex + 1 == this.data.regionType || (regionTypeIndex - 1 >= 0 && selectRegionList[regionTypeIndex - 1].code <= 0)) {
      return false;
    }

    let selectRegionItem = selectRegionList[regionTypeIndex];
    let code = selectRegionItem.code;
    let regionList;
    if (regionTypeIndex === 0) {
      // 点击省级，取省级
      regionList = area.getList('province');
    } else if (regionTypeIndex === 1) {
      // 点击市级，取市级
      regionList = area.getList('city', code.slice(0, 2));
    } else {
      // 点击县级，取县级
      regionList = area.getList('county', code.slice(0, 4));
    }

    regionList = regionList.map(item => {
      //标记已选择的
      if (that.data.selectRegionList[regionTypeIndex].code == item.code) {
        item.selected = true;
      } else {
        item.selected = false;
      }
      return item;
    })

    this.setData({
      regionList: regionList,
      regionType: regionTypeIndex + 1
    })

    this.setRegionDoneStatus();
  },
  selectRegion(event) {
    let that = this;
    let regionIndex = event.target.dataset.regionIndex;
    let regionItem = this.data.regionList[regionIndex];
    let regionType = this.data.regionType;
    let selectRegionList = this.data.selectRegionList;
    selectRegionList[regionType - 1] = regionItem;

    if (regionType == 3) {
      this.setData({
        selectRegionList: selectRegionList
      })

      let regionList = that.data.regionList.map(item => {
        //标记已选择的
        if (that.data.selectRegionList[that.data.regionType - 1].code == item.code) {
          item.selected = true;
        } else {
          item.selected = false;
        }
        return item;
      })

      this.setData({
        regionList: regionList
      })

      this.setRegionDoneStatus();
      return
    }

    //重置下级区域为空
    selectRegionList.map((item, index) => {
      if (index > regionType - 1) {
        item.code = 0;
        item.name = index == 1 ? '城市' : '区县';
      }
      return item;
    });

    this.setData({
      selectRegionList: selectRegionList,
      regionType: regionType + 1
    })

    let code = regionItem.code;
    let regionList = [];
    if (regionType === 1) {
      // 点击省级，取市级
      regionList = area.getList('city', code.slice(0, 2))
    } else {
      // 点击市级，取县级
      regionList = area.getList('county', code.slice(0, 4))
    }

    this.setData({
      regionList: regionList
    })

    this.setRegionDoneStatus();
  },
  doneSelectRegion() {
    if (this.data.selectRegionDone === false) {
      return false;
    }

    let address = this.data.address;
    let selectRegionList = this.data.selectRegionList;
    address.province = selectRegionList[0].name;
    address.city = selectRegionList[1].name;
    address.county = selectRegionList[2].name;
    address.areaCode = selectRegionList[2].code;

    this.setData({
      address: address,
      openSelectRegion: false
    });

  },
  cancelSelectRegion() {
    this.setData({
      openSelectRegion: false,
      regionType: this.data.regionDoneStatus ? 3 : 1
    });

  },
  cancelAddress() {
    wx.navigateBack();
  },
  deleteAddress() { // 删除当前地址
    this.setData({
      deleteAddress_show: true
    })
  },
  deleteAddress_btn() { //删除确定
    console.log(this.data)
    util.request(api.AddressDelete, {
      // userId: this.data.address.userId,
      id: this.data.address.id,
    }, 'POST').then(function(res) {
      if(res.errno == 0){
        wx.showToast({
          title: '删除成功',
        })
        setTimeout(()=>{
          wx.redirectTo({"url":"/pages/ucenter/c_address/c_address"})
        },1000)
      }
    })
    this.setData({
      deleteAddress_show: false
    })
  },
  deleteAddress_hidden() { // 取消
    this.setData({
      deleteAddress_show: false
    })
  },
  saveAddress() {
    let address = this.data.address;

    if (address.name == '') {
      util.showErrorToast('请输入姓名');

      return false;
    }

    if (address.tel == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }


    if (address.areaCode == 0) {
      util.showErrorToast('请输入省市区');
      return false;
    }

    if (address.addressDetail == '') {
      util.showErrorToast('请输入详细地址');
      return false;
    }

    if (!check.isValidPhone(address.tel)) {
      util.showErrorToast('手机号不正确');
      return false;
    }

    let userInfo = wx.getStorageSync('userInfo');
    var _userType = userInfo.userType || 0;

    let that = this;
    util.request(api.AddressSave, {
      addrType: _userType == 0 ? '1' : '2', // c端为1   (会员1企业2) 为 2
      id: address.id,
      name: address.name,
      tel: address.tel,
      province: address.province,
      city: address.city,
      county: address.county,
      areaCode: address.areaCode,
      addressDetail: address.addressDetail,
      isDefault: address.isDefault
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        //返回之前，先取出上一页对象，并设置addressId
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];
        console.log(prevPage);
        if (prevPage.route == "pages/checkout/checkout") {
          prevPage.setData({
            addressId: res.data
          })

          try {
            wx.setStorageSync('addressId', res.data);
          } catch (e) {

          }
          console.log("set address");
        }
        wx.navigateBack();
      } else {
        wx.showToast({
          title: '输入的参数有误!',
        })
      }
    });

  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  switchChange: function(e) {
    let address = this.data.address;
    address.isDefault = e.detail.value;
    this.setData({
      address: address
    });
    console.log(address)
  },
  input_name: function(e) { // 输入框姓名
    var that = this;
    this.data.address.name = e.detail.value;
    this.setData({
      address: that.data.address
    })
  },
  input_tel: function(e) { // 输入框电话
    var that = this;

    this.data.address.tel = e.detail.value;
    this.setData({
      address: that.data.address
    })
  },
  input_addressDetail: function(e) { // 详细地址
    var that = this;
    this.data.address.addressDetail = e.detail.value;
    this.setData({
      address: that.data.address
    })
  },
  bindRegionChange: function(e) { // 地区选择器
    var that = this;
    this.data.address.areaCode = e.detail.code[e.detail.code.length - 1]; // 区code
    this.data.address.province = e.detail.value[0] // 省 
    this.data.address.city = e.detail.value[1] // 市
    this.data.address.county = e.detail.value[2] // 区
    console.log(this.data.address);
    this.setData({
      region: e.detail.value,
      address: that.data.address
    })
  }

})