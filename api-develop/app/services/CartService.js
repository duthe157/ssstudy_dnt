const CartItemModel = require('../models/CartItem');
const CartModel = require('../models/Cart');
const CouponModel = require('../models/Coupon');

class CartService {
    async updateCartData(cart, discountCode) {
        try {
            if (!cart)
                return false;

            const items = await CartItemModel.find({ user_id: cart.user_id });
            if (!items || items.length == 0) {
                await CartModel.delete({ user_id: cart.user_id }, true);
                return false;
            }

            let subtotal = 0;
            let qty = 0;
            for (let i = 0; i < items.length; i++) {
                if (items[i].is_selected)
                    subtotal += items[i].qty * items[i].price;
                qty += items[i].qty;
            }
            let discountTotal = 0;
            let total = subtotal;

            if (discountCode) {
                discountTotal = await this.calDiscount(subtotal, discountCode);
                total = subtotal - discountTotal;
            }

            const data = {
                discount_total: discountTotal,
                discount_code: discountCode,
                subtotal,
                total,
                qty
            };
            // console.log("cart data===>", JSON.stringify(data));
            const rs = await CartModel.updateOne({ _id: cart.id }, { $set: data });
            if (rs.nModified) {
                // console.log('data', JSON.stringify(data))
                return data;
            }
            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async calDiscount(total, discountCode, customerName, products) {
        if (!discountCode)
            return 0;
        let discountTotal = 0;
        let discountConfigs = null;
        try {
            const coupon = await CouponModel.findOne({ code: discountCode.trim() });
            if (!coupon || (coupon && !coupon.status))
                return 0;
            if (coupon.discount_configs)
                discountConfigs = JSON.parse(coupon.discount_configs);

            if (coupon.discount_method === 'ORDER') {
                console.log("hhhh");
                if (coupon.discount_type === 'PERCENT') {
                    discountTotal = (coupon.discount_value / 100) * total;
                    console.log("total 11", total)
                    console.log("discountTotal 11", discountTotal)
                } else {
                    discountTotal = coupon.discount_value;
                }
            }

            if (coupon.discount_method === 'PRODUCT') {
                if (discountConfigs.products) {
                    const configProducts = discountConfigs.products;
                    for (let i = 0; i < configProducts.length; i++) {
                        for (let j = 0; j < products.length; j++) {
                            if (configProducts[i].id == products[j].item_id) {
                                if (coupon.discount_type === 'PERCENT') {
                                    discountTotal += (coupon.discount_value / 100) * total;
                                } else {
                                    discountTotal += coupon.discount_value;
                                }
                            }
                        }
                    }
                }
            }

            if (coupon.discount_method === 'CUSTOMER') {
                if (discountConfigs && customerName && discountConfigs.customer_name) {
                    const _customerName = discountConfigs.customer_name.split(',');
                    if (_customerName.indexOf(customerName) >= 0) {
                        if (coupon.discount_type === 'PERCENT') {
                            discountTotal = (coupon.discount_value / 100) * total;
                        } else {
                            discountTotal = coupon.discount_value;
                        }
                    }
                }
            }
        } catch (err) {
            logError(err);
        }
        return discountTotal;
    }
}

module.exports = new CartService();