const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const OrderModel = require('../models/Order');
const OrderItemModel = require('../models/OrderItem');
const UserModel = require('../models/User');
const CartModel = require('../models/Cart');
const CartItemModel = require('../models/CartItem');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const OrderService = require('./../services/OrderService');
const ClassroomService = require('./../services/ClassroomService');
const CreditService = require('../services/CreditService');
const MailService = require('../services/MailService');
const payOS = require('../../config/payOS');
const moment = require('moment');
const OrderPaymentCodeModel = require("../models/OrderPaymentCode");
const { items } = require('joi/lib/types/array');

class OrderController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const userID = params.user_id || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null };
            const fromDate = params.from_date || null;
            const toDate = params.to_date || null;
            const status = params.status || null;
            const paymentMethod = params.payment_method || null;
            const userCode = params.user_code || null;

            if (paymentMethod)
                conditions.payment_method = paymentMethod;

            if (fromDate && toDate) {
                let from_moment = moment(fromDate, 'DD/MM/YYYY');
                let to_moment = moment(fromDate, 'DD/MM/YYYY');
                if (from_moment.isValid() && to_moment.isValid()) {
                    conditions.created_at = {
                        $gte: from_moment.format(),
                        $lte: to_moment.format()
                    };
                } else {
                    conditions.created_at = {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    };
                }
            }
            let user = null;
            if (userCode) {
                user = await UserModel.findOne({ code: userCode });
            }

            if (req.user.user_group === appConfig.USER_GROUP.STUDENT || userID) {
                conditions.customer_id = req.user.user_id || userID;
            } else {
                if (keyword) {
                    conditions.$or = [
                        { 'customer_phone': { $regex: keyword, $options: 'i' } },
                        { 'customer_id': { $regex: keyword, $options: 'i' } }
                    ];
                }
            }

            if (user)
                conditions.customer_id = user._id;

            let sortOrder = -1;
            // if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            //     sortOrder = -1;
            // }
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: sortOrder }
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (status)
                conditions.status = status;

            const records = await OrderModel.find(conditions, null, options);
            // Lấy order items cho từng order
            for (let order of records) {
                const orderItems = await OrderItemModel.find({
                    order_id: order._id,
                    deleted_at: null
                })
                order._doc.items = orderItems;
            }
            const total = await OrderModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, err.message, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            let rs = await OrderModel.findOne(conditions);
            if (rs) {
                rs = rs.toObject();
                const items = await OrderItemModel.find({ order_id: rs._id });
                rs.items = items;
            }
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async paymentInfo(req, res, params) {
        try {
            const { id } = params;
            const data = {};
            const conditions = { _id: id };
            const rs = await OrderModel.findOne(conditions);
            data.order = rs;

            if (rs.status === 'PENDING' && rs.payment_method === 'BANK_TRANSFER') {
                if (rs.transaction_code)
                    return response(res, {}, 'Đơn đã được thanh toán!', statusCode.OK);

                const paymentCode = await OrderService.createOrderPaymentCode(id);
                let bankText = '';
                if (paymentCode) {
                    bankText = 'DH ' + paymentCode.code;
                } else {
                    bankText = 'DH ' + rs.code;
                }
                data.bank_text = bankText;
                data.bank_info = appConfig.BANK_INFO;
            }

            if (rs.payment_method === 'BANK_PAYOS') {
                data.order_payment_method = await OrderPaymentCodeModel.findOne({ order_id: id });
            }

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async paymentPayOs(req, res, params) {
        try {
            const { id, cartItem, cancelUrl, returnUrl } = params;
            const data = {};
            const conditions = { _id: id };
            const rs = await OrderModel.findOne(conditions);
            data.order = rs;
            const payOSCode = await OrderService.createPayOSCode();
            if (rs.status === 'PENDING' && rs.payment_method === 'BANK_PAYOS') {
                if (rs.transaction_code)
                    return response(res, {}, 'Đơn đã được thanh toán!', statusCode.OK);

                const paymentCode = await OrderService.createOrderPaymentCode(id);
                let bankText = '';
                if (paymentCode) {
                    bankText = 'DH ' + paymentCode.code;
                } else {
                    bankText = 'DH ' + rs.code;
                }
                data.bank_text = bankText;
                data.payment_code = paymentCode.code
                data.bank_info = appConfig.BANK_INFO;

                const items = cartItem.map(item => ({
                    name: item.name,
                    quantity: item.qty,
                    price: item.price
                }));

                const payOSPayload = {
                    orderCode: payOSCode,
                    amount: rs.total,
                    items: items,
                    description: bankText,
                    cancelUrl,
                    returnUrl,
                };

                try {
                    data.payOS = await payOS.createPaymentLink(payOSPayload);
                } catch (error) {
                    console.log(error)
                }
            }
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async payOSDetailOrder(req, res, params) {
        try {
            const { id, orderId } = params;
            const payOSOrder = await payOS.getPaymentLinkInformation(id);
            let order = await OrderModel.findOne({ _id: orderId });
            const cartItems = await OrderItemModel.find({ order_id: order._id });
            order = order.toObject();
          
            if (!payOSOrder) return response(res, null, 'EMPTY_ORDER', statusCode.ERROR);

            const payOSRes = { order, payOSOrder, cartItems }

            return response(res, payOSRes, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async payOSUpdateOrder(req, res, params) {
        try {
            const { id, orderId } = params;
            const payOSOrder = await payOS.getPaymentLinkInformation(id);
            const order = await OrderModel.findOne({ _id: orderId });
            const _items = await OrderItemModel.find({ order_id: order._id });
            if (!order) return response(res, null, 'EMPTY_ORDER', statusCode.ERROR);
            const rs = await OrderModel.updateOne({ _id: orderId }, { $set: { status: payOSOrder.status } });
            if (rs) {
                let orderLineItem = '';
                for (let i = 0; i < _items.length; i++) {
                    orderLineItem += `<tr>
                    <td colspan="2" align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;padding-bottom:15px">
                        <h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:16px;font-style:normal;font-weight:normal;color:#4A4E69">${_items[i].name}</h3>
                        <p style="padding:0;Margin:0; color:#191919;font-size: 14px;">Số lượng: ${parseFloat(_items[i].qty)} <span style="float:right;font-weight: bold;">${BaseHelper.formatNumber(parseFloat(_items[i].price))}đ</p></span></h3>
                    </td></tr>`;
                }

                if (payOSOrder.status == 'CANCELLED')
                    await MailService.sendEmailCancelOrderPayos(order, orderLineItem, payOSOrder.status);
                else {
                    await MailService.sendEmailConfirmPayos(order, orderLineItem, payOSOrder.status);

                    // Nếu user có status PENDING_FOR_PAYMENT thì gửi thêm email mật khẩu
                    if (order.customer_id) {
                        const user = await UserModel.findOne({ _id: order.customer_id, deleted_at: null });
                        if (user && user.status === 'PENDING_FOR_PAYMENT') {
                            await MailService.sendPasswordPendingPayment('12345678', user.email, user.fullname || user.email);
                        }
                    }

                    if (payOSOrder.status === 'PAID' || payOSOrder.status === 'SUCCESS') {
                        for (const item of _items) {
                            if (item.type === 'CLASSROOM') {
                                await ClassroomService.addUserToClassroomOnline(order, item, 'DB');
                            } else if (item.type === 'EXTEND_BOOKID') {
                                await ClassroomService.extendBookId(order, item);
                            } 
                            // else if (item.type === 'BOOKID') {
                            //     await ClassroomService.addBookIdToUser(order, item, 'DB');
                            // }
                        }
                    }
                }

                return response(res, null, 'Thành công', statusCode.OK);
            }
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const customerName = params.customer_name || null;
            const customerPhone = params.customer_phone || null;
            const customerAddress = params.customer_address || null;
            const note = params.note || '';
            const app = params.app || 'Mobile';
            const paymentMethod = params.payment_method || 'COD';
            const userID = params.user_id || null;

            let currentBalance = 0;
            const user = await UserModel.findOne({ _id: userID });
            if (user && user.balance)
                currentBalance = parseFloat(user.balance);

            const cart = await CartModel.findOne({ user_id: userID });
            if (!cart || !user)
                return response(res, null, 'Dữ liệu không hợp lệ.', statusCode.ERROR);

            const _items = await CartItemModel.find({ user_id: userID });
            if (!customerName)
                return response(res, null, 'Vui lòng nhập họ tên.', statusCode.ERROR);

            if (!customerPhone)
                return response(res, null, 'Vui lòng nhập số điện thoại.', statusCode.ERROR);

            if (!_items.length)
                return response(res, null, 'Vui lòng chọn 1 khóa học', statusCode.ERROR);

            const items = [];
            const selectedCartItemIds = [];
            let orderLineItem = '';
            for (let i = 0; i < _items.length; i++) {
                if (!_items[i].is_selected)
                    continue;

                items.push({
                    id: _items[i].item_id,
                    item_id: _items[i].item_id,
                    name: _items[i].name,
                    price: parseFloat(_items[i].price),
                    qty: parseFloat(_items[i].qty),
                    type: _items[i].type
                });
                selectedCartItemIds.push(_items[i]._id);
                orderLineItem += `<tr>
            <td colspan="2" align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;padding-bottom:15px">
                <h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:16px;font-style:normal;font-weight:normal;color:#4A4E69">${_items[i].name}</h3>
                <p style="padding:0;Margin:0; color:#191919;font-size: 14px;">Số lượng: ${parseFloat(_items[i].qty)} <span style="float:right;font-weight: bold;">${BaseHelper.formatNumber(parseFloat(_items[i].price))}đ</p></span></h3>
            </td></tr>`;
            }

            const _doc = {
                code: new Date().getTime(),
                customer_id: userID,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress,
                customer_email: user.email,
                customer_code: user.code,
                discount_code: cart.discount_code,
                discount_total: cart.discount_total,
                subtotal: cart.subtotal,
                total: cart.total,
                payment_method: paymentMethod,
                note,
                status: 'PENDING'
            };

            if (paymentMethod === 'SSS_BALANCE') {
                if (currentBalance < cart.total) {
                    if (app == 'Web')
                        return response(res, { statusCode: 500 }, "Ví của bạn không đủ tiền để thanh toán đơn hàng. Vui lòng nạp thêm.", statusCode.OK);
                    return response(res, null, "Ví của bạn không đủ tiền để thanh toán đơn hàng. Vui lòng nạp thêm.", statusCode.ERROR);
                }
                _doc.status = 'PAID';
            }

            const order = await OrderService.createOrder(_doc, items);
            if (order) {
                if (paymentMethod === 'SSS_BALANCE') {
                    for (const item of items) {
                        if (item.type === 'CLASSROOM') {

                            await ClassroomService.addUserToClassroomOnline(order, item, 'DB');
                        } else if (item.type === 'EXTEND_BOOKID') {
                            await ClassroomService.extendBookId(order, item);
                        }
                    }
                    // Cap nhat Transaction
                    CreditService.createTransaction(user, cart.total, 'SSS_BALANCE', 'SUB');
                }

                if (userID) {
                    if (items.length === _items.length) {
                        await CartModel.delete({ user_id: userID }, true);
                    }
                    await CartItemModel.delete({ user_id: userID, is_selected: true, _id: { $in: selectedCartItemIds } }, true);
                }


                try {
                    if (paymentMethod !== 'BANK_PAYOS') {
                        await MailService.sendEmailConfirmOrder(order, orderLineItem);
                    }
                } catch (err) {
                    console.log(err);
                }
                return response(res, order, "Đặt hàng thành công!", statusCode.OK);
            }

            return response(res, null, 'Đặt hàng thất bại. Vui lòng thử lại', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async createOrderPaymentLink(req, res, params) {
        try {
            const app = params.app || 'Mobile';
            const paymentMethod = params.payment_method || 'COD';
            const userID = params.user_id || null;
            const _items = params.courses;
            const total = params.total;

            const user = await UserModel.findOne({ _id: userID });

            if (!user)
                return response(res, null, 'Dữ liệu không hợp lệ.', statusCode.ERROR);

            // map lai course
            const items = [];
            let orderLineItem = '';
            for (let i = 0; i < _items.length; i++) {
                items.push({
                    id: _items[i].id,
                    item_id: _items[i].id,
                    name: _items[i].name,
                    price: parseFloat(_items[i].price),
                    qty: 1,
                    type: 'CLASSROOM'
                });
                orderLineItem += `<tr>
            <td colspan="2" align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;padding-bottom:15px">
                <h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:16px;font-style:normal;font-weight:normal;color:#4A4E69">${items[i].name}</h3>
                <p style="padding:0;Margin:0; color:#191919;font-size: 14px;">Số lượng: ${parseFloat(items[i].qty)} <span style="float:right;font-weight: bold;">${BaseHelper.formatNumber(parseFloat(items[i].price))}đ</p></span></h3>
            </td></tr>`;
            }

            const _doc = {
                code: new Date().getTime(),
                customer_id: userID,
                customer_name: user.fullname || 'Student Account',
                customer_phone: user.phone,
                customer_address: user.address || '',
                customer_email: user.email,
                customer_code: user.code,
                discount_code: '',
                discount_total: 0,
                subtotal: total,
                total: total,
                payment_method: paymentMethod,
                note: params.note || 'Thanh toán qua link thanh toán nhanh',
                status: 'PENDING',
                type: 'QUICK_PAYMENT'
            };

            const order = await OrderService.createOrderPaymentLink(_doc, items);
            if (order) {
                return response(res, order, "Đặt hàng thành công!", statusCode.OK);
            }

            return response(res, null, 'Đặt hàng thất bại. Vui lòng thử lại', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async payment(req, res, params) {
        try {
            const { total, type, payment_method: paymentMethod, user_id: userId } = params;

            if (!userId || !type || !paymentMethod)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            const user = await UserModel.findOne({ _id: userId });
            if (!user || user.deleted_at)
                return response(res, null, 'Dữ liệu không hợp lệ!', statusCode.ERROR);

            const _total = total || 0;
            const _doc = {
                code: new Date().getTime(),
                total: _total,
                type,
                payment_method: paymentMethod,
                customer_id: userId,
                customer_name: user.fullname,
                customer_phone: user.phone,
                customer_address: user.address || null,
                customer_code: user.code
            };

            const item = await OrderModel.create(_doc);
            if (!item)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            const _data = {
                code: _doc.code,
                total: _total,
                user: {
                    id: userId,
                    name: user.fullname,
                    code: user.code,
                    email: user.email
                }
            };
            return response(res, _data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, content, description, files } = params;
            const status = params.status || appConfig.STATUS.INACTIVE;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const item = await OrderModel.findOne({ _id: id });
            if (!item)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Đánh giá phụ huynh'), statusCode.ERROR);
            return response(res, book, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateStatus(req, res, params) {
        try {
            const { id } = params;
            const status = params.status || appConfig.STATUS.INACTIVE;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const order = await OrderModel.findOne({ _id: id });
            if (!order)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Đơn hàng'), statusCode.ERROR);

            order.status = status;

            const rs = await OrderModel.updateOne({ _id: id }, { $set: { status } });
            if (rs.nModified) {
                const items = await OrderItemModel.find({ order_id: id });
                logError('Da vao day 1');

                if (status === 'SUCCESS' || status === 'PAID') {
                    logError('Da vao day 2');

                    for (const item of items) {
                        if (item.type === 'CLASSROOM') {

                            await ClassroomService.addUserToClassroomOnline(order, item, 'DB');
                        } else if (item.type === 'EXTEND_BOOKID') {
                            await ClassroomService.extendBookId(order, item);
                        } 
                        // else if (item.type === 'BOOKID') {
                        //     await ClassroomService.addBookIdToUser(order, item, 'DB');
                        // }
                    }
                }
                return response(res, order, 'Thành công', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await OrderModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new OrderController();
