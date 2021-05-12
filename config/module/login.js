
import {WxApiRoot} from '../config.js'
const login = {
  AuthLoginByWeixin: WxApiRoot + 'auth/login_by_weixin', //微信登录
  AuthLoginByAccount: WxApiRoot + 'auth/login', //账号登录
  AuthLoginByPhone: WxApiRoot + 'auth/phone_login', // 手机 + 验证码登录
  AuthLoginByPwd: WxApiRoot + 'auth/phone_pwd_login', // 手机 + 密码登录
  AuthLogout: WxApiRoot + 'auth/logout', //账号登出
  AuthRegister: WxApiRoot + 'auth/register', //账号注册
  AuthReset: WxApiRoot + 'auth/reset', //账号密码重置
  AuthRegisterCaptcha: WxApiRoot + 'auth/regCaptcha', //验证码
  AuthBindPhone: WxApiRoot + 'auth/bindPhone', //绑定微信手机号
  AuthPhoneCaptcha: WxApiRoot + 'auth/phonecaptcha', //获取验证码
  GetUserInfo: WxApiRoot + 'auth/info', // 获取用户信息
  OrderPay: WxApiRoot + 'wxPay/wxPay', // 微信支付
  decodeUser: WxApiRoot + 'wxPay/decodeUserInfo',
}

module.exports = login