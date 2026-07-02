const BaseHelper = require('../helpers/BaseHelper');
const OrderModel = require('../models/Order');
const OrderItemModel = require('../models/OrderItem');
const CouponModel = require('../models/Coupon');
const OrderPaymentCodeModel = require('../models/OrderPaymentCode');
const BillingModel = require('../models/Billing');
const BillingHistoryModel = require('../models/BillingHistory');

class OrderService {
    async createOrder(doc, items) {
        try {
            while (true) {
                const options = {
                    limit: 1,
                    sort: { created_at: -1 }
                };
                let code = 1000000;
                const cursor = await OrderModel.findOne({ deleted_at: null }, null, options);
                if (cursor)
                    code = cursor.code + 1;
                doc.code = code;
                try {
                    const rs = await OrderModel.create(doc);
                    if (rs) {
                        const _items = await this.updateOrderItem(rs, items);
                        if (!_items) {
                            await OrderModel.delete({ _id: rs.id });
                            await OrderModel.OrderItemModel({ order_id: rs._id });
                            return false;
                        }
                        return rs;
                    }
                    return false;
                } catch (err) {
                    if (err && err.code) {
                        if (err.code == 11000)
                            continue;
                        else
                            logError(err);
                    }

                    return false;
                }
            }
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async createOrderPaymentLink(doc, items) {
        try {
            while (true) {
                const options = {
                    limit: 1,
                    sort: { created_at: -1 }
                };
                let code = 1000000;
                const cursor = await OrderModel.findOne({ deleted_at: null }, null, options);
                if (cursor)
                    code = cursor.code + 1;
                doc.code = code;
                try {
                    const rs = await OrderModel.create(doc);
                    if (rs) {
                        const _items = await this.createOrderItemPaymentLink(rs, items);
                        if (!_items) {
                            await OrderModel.delete({ _id: rs._id });
                            return false;
                        }
                        return rs;
                    }
                    return false;
                } catch (err) {
                    if (err && err.code) {
                        if (err.code == 11000)
                            continue;
                        else
                            logError(err);
                    }

                    return false;
                }
            }
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async createOrderItemPaymentLink(order, items) {
        try {
            if (!order)
                return false;
            if (!items || items.length == 0)
                return false;
            let totalItem = 0;
            for (let i = 0; i < items.length; i++) {
                const _item = items[i];
                _item.order_id = order._id;
                const rs = await OrderItemModel.create(_item);
                if (rs)
                    totalItem += 1;
            }
            console.log('totalItem',totalItem)
            if (totalItem === items.length)
                return true;
            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async updateOrderItem(order, items) {
        try {
            if (!order)
                return false;
            if (!items || items.length == 0)
                return false;
            let totalItem = 0;
            for (let i = 0; i < items.length; i++) {
                const _item = items[i];
                _item.order_id = order._id;
                const rs = await OrderItemModel.create(_item);
                if (rs)
                    totalItem += 1;
            }

            if (totalItem === items.length)
                return true;
            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async calDiscount(total, discountCode) {
        if (!discountCode)
            return 0;
        let discountTotal = 0;
        try {
            const coupon = await CouponModel.findOne({ code: discountCode.trim() });
            if (!coupon || (coupon && !coupon.status))
                return 0;

            if (coupon.discount_method === 'ORDER') {
                if (coupon.discount_type === 'PERCENT') {
                    discountTotal = (coupon.discount_value / 100) * total;
                } else {
                    discountTotal = coupon.discount_value;
                }
            }
        } catch (err) {
            logError(err);
        }
        return discountTotal;
    }

    async createOrderPaymentCode(orderID, type = 'ORDER') {
        try {
            let data = {
                type,
                status: false
            };

            if (type === 'ORDER') {
                data.order_id = orderID;
                data.credit_id = null;
            }

            if (type === 'CREDIT') {
                data.credit_id = orderID;
                data.order_id = null;
            }

            while (true) {
                let code = await BaseHelper.generateNumber(6);
                const cursor = await OrderPaymentCodeModel.findOne({ code });
                if (cursor) {
                    code = await BaseHelper.generateNumber(6);
                } else {
                    try {
                        data.code = code;
                        const rs = await OrderPaymentCodeModel.create(data);
                        if (rs)
                            return rs;
                    } catch (err) {
                        if (err && err.code) {
                            if (err.code == 11000)
                                continue;
                            else
                                logError(err);
                        }
                    }
                }
            }
        } catch (err) {
            logError(err);
            return null;
        }
    }

    async createPayOSCode() {
        return Number(String(new Date().getTime()).slice(-6));
    }

    async createBill(doc) {
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const options = {
                    limit: 1,
                    sort: { created_at: -1 }
                };
                let code = 1000000;
                const cursor = await BillingModel.findOne(null, null, options);
                if (cursor)
                    code = cursor.code + 1;
                doc.code = code;
                try {
                    const rs = await BillingModel.create(doc);
                    if (rs)
                        return rs;
                } catch (err) {
                    if (err && err.code) {
                        if (err.code == 11000)
                            continue;
                        else
                            logError(err);
                    }
                }
            }
        } catch (err) {
            logError(err);
            return null;
        }
    }

    async createBillHistory(docBillHistory) {
        try {
            const rs = await BillingHistoryModel.create(docBillHistory);
            return rs;
        } catch (err) {
            logError(err);
            return false;
        }
    }

}

module.exports = new OrderService();
