import { WxApiRoot } from '../config.js'
const check = {
  CartCheckout: WxApiRoot + 'cart/checkout', // 下单前信息确认
  OrderSubmit: WxApiRoot + 'order/submit', // 提交订单
}

module.exports = check