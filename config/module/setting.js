import { WxApiRoot } from '../config.js'

const setting = {
  settingPhonePwd: WxApiRoot + 'auth/phone_change_password', // 手机验证码修改密码
  settingPwdPwd: WxApiRoot + 'auth/pwd_change_password', // 通过旧密码修改密码
  settingChangePhone: WxApiRoot + 'auth/change_phone', // 修改手机号
  settingUnitPwd: WxApiRoot + 'auth/set_password'// 初始化密码
}

module.exports = setting