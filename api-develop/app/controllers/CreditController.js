const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const CreditLogModel = require('../models/CreditLog');
const ClassroomModel = require('../models/Classroom');
const UserModel = require('../models/User');
const OrderModel = require('../models/Order');
const BillingItemModel = require('../models/BillingItem');
const ClassroomService = require('../services/ClassroomService');
const CreditService = require('../services/CreditService');
const OrderService = require('../services/OrderService');
const OrderPaymentCodeModel = require('../models/OrderPaymentCode');
const OrderItemModel = require('../models/OrderItem');
const payOS = require('../../config/payOS');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const moment = require('moment');

class CreditController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null };
            const fromDate = params.from_date || null;
            const toDate = params.to_date || null;
            if (fromDate && toDate) {
                conditions.created_at = {
                    $gte: moment(fromDate, 'DD/MM/YYYY').format(),
                    $lte: moment(toDate, 'DD/MM/YYYY').format()
                };
            }

            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                conditions['user.id'] = req.user.user_id;
            } else {
                if (keyword)
                    conditions['user.code'] = keyword;
            }

            let sortOrder = 1;
            if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
                sortOrder = -1;
            }

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

            const records = await CreditLogModel.find(conditions, null, options);
            const total = await CreditLogModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            let rs = await CreditLogModel.findOne(conditions);
            rs = rs.toObject();
            if (rs) {
                const paymentCode = await OrderPaymentCodeModel.findOne({ credit_id: rs._id });
                rs.bank_text = 'DH ' + paymentCode.code;

            }
            rs.bank_info = appConfig.BANK_INFO;
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { total, type } = params;
            const userIds = params.user_ids || [];
            const paymentMethod = params.payment_method || 'BANK_TRANSFER';
            if (userIds.length === 0 || !type)
                return response(res, null, 'Dữ liệu không hợp lệ', statusCode.ERROR);

            let count = 0;
            for (let i = 0; i < userIds.length; i++) {
                const user = await UserModel.findOne({ _id: userIds[i] });
                if (!user || user.deleted_at)
                    continue;

                const _total = total || 0;
                const _doc = {
                    code: new Date().getTime(),
                    total: _total,
                    type,
                    payment_method: paymentMethod,
                    user: {
                        id: userIds[i],
                        name: user.fullname,
                        code: user.code
                    },
                    status: 'PENDING'
                };
                const item = await CreditLogModel.create(_doc);
                if (item)
                    count++;
            }

            if (count === 0)
                return response(res, null, "Không nạp được Credit", statusCode.ERROR);

            return response(res, null, 'Nạp Credit thành công cho ' + count + ' học sinh', statusCode.OK);
        } catch (err) {
            // console.log(err);
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async paymentPayOS(req, res, params) {
        try {
            const { id, total, type, payment_method: paymentMethod, returnUrl, cancelUrl } = params;
            let creditLog;

            if (id) creditLog = await CreditLogModel.findOne({ _id: id });

            let userId = params.user_id;
            if (req)
                userId = req.user.user_id
            if (!userId || !paymentMethod)
                return response(res, null, 'Dữ liệu không hợp lệ.', statusCode.ERROR);

            const user = await UserModel.findOne({ _id: userId });
            if (!user || user.deleted_at)
                return response(res, null, 'Tài khoản không tồn tại.', statusCode.ERROR);

            const _total = total || 0;
            const _doc = {
                code: new Date().getTime(),
                total: _total,
                type,
                payment_method: paymentMethod,
                user: {
                    id: userId,
                    name: user.fullname,
                    code: user.code
                },
                status: 'PENDING'
            };

            const item = creditLog || await CreditLogModel.create(_doc);
            if (!item)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            const paymentCode = await (creditLog
                ? OrderPaymentCodeModel.findOne({ credit_id: creditLog._id })
                : OrderService.createOrderPaymentCode(item._id, 'CREDIT'));

            let bankText = '';
            if (paymentCode) {
                bankText = 'DH ' + paymentCode.code;
            }

            const payOSCode = await OrderService.createPayOSCode();
            const payOSPayload = {
                orderCode: payOSCode,
                amount: _total,
                description: bankText,
                cancelUrl,
                returnUrl,
            };
            const payOSResponse = await payOS.createPaymentLink(payOSPayload);
            const _data = {
                id: item._id,
                code: _doc.code,
                total: _total,
                bank_text: bankText,
                user: {
                    id: userId,
                    name: user.fullname,
                    code: user.code,
                    email: user.email
                },
                bank_info: appConfig.BANK_INFO,
                payOS: payOSResponse
            };
            return response(res, _data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async payment(req, res, params) {
        try {
            const { total, type, payment_method: paymentMethod } = params;

            let userId = params.user_id;
            if (req)
                userId = req.user.user_id
            if (!userId || !paymentMethod)
                return response(res, null, 'Dữ liệu không hợp lệ.', statusCode.ERROR);

            const user = await UserModel.findOne({ _id: userId });
            if (!user || user.deleted_at)
                return response(res, null, 'Tài khoản không tồn tại.', statusCode.ERROR);

            const _total = total || 0;
            const _doc = {
                code: new Date().getTime(),
                total: _total,
                type,
                payment_method: paymentMethod,
                user: {
                    id: userId,
                    name: user.fullname,
                    code: user.code
                },
                status: 'PENDING'
            };
            const item = await CreditLogModel.create(_doc);
            if (!item)
                return response(res, {}, language.ERROR, statusCode.ERROR);


            const paymentCode = await OrderService.createOrderPaymentCode(item._id, 'CREDIT');
            let bankText = '';
            if (paymentCode) {
                bankText = 'DH ' + paymentCode.code;
            }

            const _data = {
                id: item._id,
                code: _doc.code,
                total: _total,
                bank_text: bankText,
                user: {
                    id: userId,
                    name: user.fullname,
                    code: user.code,
                    email: user.email
                },
                bank_info: appConfig.BANK_INFO
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

            const item = await CreditLogModel.findOne({ _id: id });
            if (!item)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Credit Log'), statusCode.ERROR);

            if (name) {
                item.name = name;
            }

            book.status = status;
            book.description = description;
            book.content = content;

            const rs = await CreditLogModel.updateOne({ _id: id }, book);
            if (rs.nModified)
                return response(res, book, 'Thành công', statusCode.OK);
            return response(res, book, language.ERROR, statusCode.ERROR);
        } catch (err) {
            // console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await CreditLogModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async hook(req, res, params) {
        try {
            params = params.replace(/\n/g, " ");
            params = params.replace(/\s\s+/g, ' ');
            params = params.replace('_', ' ');
            params = params.replace('_', ' ');
            params = params.replace('_', ' ');
            params = params.replace('_', ' ');
            params = params.replace('_', ' ');
            params = params.replace('_', ' ');
            params = JSON.parse(params);
            let smsStr = params.sms;
            console.log(JSON.stringify(params));
            let amount = 0;
            let amountStr = smsStr.match(/PS:+(.+) SD:/);
            if (amountStr[1])
                amountStr = amountStr[1].trim().replace('+', '').replace('.', '').replace('VND', '');
            else
                amountStr = 0;
            amount = parseFloat(amountStr);

            const index = smsStr.indexOf('DH');
            if (index < 0)
                return response(res, null, 'SMS_INVALID', statusCode.OK);

            smsStr = smsStr.substring(index, smsStr.length);
            smsStr = smsStr.trim();
            let sms = smsStr.split('DH');
            const regex = /[0-9]{6}/;
            const matchDH = regex.exec(sms[1]);
            if (matchDH[0])
                sms = matchDH[0].trim();
            const code = parseInt(sms);
            console.log('=======>Code: ' + code + '----Amount: ' + amount);
            let orderCode = null;
            if (!code)
                return response(res, null, 'CODE_INVALID', statusCode.OK);
            if (code.length > 6)
                orderCode = code;

            // Tim Order
            let order = null;
            let userID = null;
            let creditID = null;
            let creditTotal = 0;
            let type = null;
            if (!orderCode) {
                const paymentCode = await OrderPaymentCodeModel.findOne({ code });
                if (!paymentCode)
                    return response(res, null, 'CODE_NOT_EXISTED', statusCode.OK);

                if (paymentCode.type === 'ORDER') {
                    type = 'ORDER';
                    order = await OrderModel.findOne({ _id: paymentCode.order_id });
                    if (!order) {
                        // console.log('Log khong co Order 1');
                        return response(res, null, 'ORDER_EMPTY', statusCode.OK);
                    }
                    userID = order.customer_id;
                } else if (paymentCode.type === 'CREDIT') {
                    // console.log('VAO CREDIT');
                    type = 'CREDIT';
                    const creditItem = await CreditLogModel.findOne({ _id: paymentCode.credit_id });
                    if (creditItem) {
                        creditID = creditItem.id;
                        creditTotal = creditItem.total;
                        if (creditItem.user && creditItem.user.id)
                            userID = creditItem.user.id;
                    }

                }

            } else {
                order = await OrderModel.findOne({ code: orderCode });
                if (!order) {
                    // console.log('Log khong co Order 2');
                    return response(res, null, 'ORDER_EMPTY', statusCode.OK);
                }

                if (order.status === 'SUCCESS' || order.status === 'PAID')
                    return response(res, null, 'Đơn hàng đã thanh toán thành công!', statusCode.OK);
            }

            // console.log(order);
            const user = await UserModel.findOne({ _id: userID });
            if (!user) {
                // console.log('Log khong co user');
                return response(res, null, 'USER_EMPTY', statusCode.OK);
            }

            if (type === 'CREDIT') {
                // console.log('VAO CREDIT 2');
                if (creditID && creditTotal > 0) {
                    // console.log('VAO CREDIT 3');
                    const rs2 = await CreditLogModel.updateOne({ _id: creditID }, { $set: { status: 'SUCCESS', note: params.sms } });
                    // console.log(rs2);
                    const userbalance = user.balance + amount;
                    const rs3 = await UserModel.updateOne({ _id: userID }, {
                        $set: {
                            balance: userbalance
                        }
                    });
                    // console.log(rs3);
                }
            } else if (type === 'ORDER') {
                // Nap tien cho hoc sinh.
                const creditLog = await CreditService.createTransaction(user, amount, 'BANK_TRANSFER', 'ADD', 'SUCCESS', params.sms || null);
                if (!creditLog) {
                    // console.log('CAN_NOT_CREATE_CREDIT_LOG');
                    return response(res, null, 'CAN_NOT_CREATE_CREDIT_LOG', statusCode.OK);
                }

                // console.log('amount', amount);
                user.balance += amount;

                if (user.balance < order.total) {
                    // console.log(user.balance, order.total);
                    // console.log('NOT_ENOUGH_MONEY');
                    return response(res, null, 'NOT_ENOUGH_MONEY', statusCode.OK);
                }

                await CreditService.createTransaction(user, order.total, 'BANK_TRANSFER', 'SUB', 'SUCCESS', params.sms || null);

                // Cho vao khoa hoc
                const items = await OrderItemModel.find({ order_id: order._id });
                if (!items || items.length <= 0) {
                    // console.log('Log khong co items');
                    return response(res, null, 'ITEM_EMPTY', statusCode.OK);
                }
                const paymentMethod = 'BANK_TRANSFER';

                let _totalItemDiscount = 0;
                let subtotal = 0;

                if (items.length > 0) {
                    for (let i = 0; i < items.length; i++) {
                        subtotal += items[i].qty * items[i].price;
                    }
                }

                _totalItemDiscount += order.discount_total ? order.discount_total : 0;
                const total = order.subtotal - order.discount_total ? order.discount_total : 0;
                const billedAt = new Date();

                const docBill = {
                    user: { id: user.id, name: user.fullname, code: user.code },
                    creator: { id: user.id, code: user.code, name: user.fullname },
                    items: items,
                    discount: _totalItemDiscount,
                    subtotal: order.subtotal,
                    total: total,
                    type: 'PT',
                    payment_method: paymentMethod,
                    pay_type: 'ALL_COURSE',
                    billed_at: billedAt,
                    note: params.sms
                };

                const bill = await OrderService.createBill(docBill);
                if (!bill)
                    return response(res, {}, language.ERROR, statusCode.ERROR);

                const _rsOrder = await OrderModel.updateOne({ _id: order.id }, { $set: { transaction_code: code, status: 'PAID' } });
                if (_rsOrder) {
                    // console.log('OrderPaymentCodeModel.softDelete');
                    await OrderPaymentCodeModel.softDelete({ order_id: code }, true);
                }

                try {
                    // Ghi lich su tao bill thanh cong
                    let _historyNote = '';
                    _historyNote += 'Tạo phiếu thu #' + bill.code;
                    _historyNote += ' - Nội dung: ';
                    _historyNote += ', Chiết khấu: ' + _totalItemDiscount;
                    _historyNote += ', Tổng tiền: ' + subtotal;
                    _historyNote += ', Thanh toán: ' + total;

                    const docBillHistory = {
                        billing_id: bill.id,
                        creator: { id: user.id, code: user.code, name: user.fullname },
                        note: _historyNote
                    };

                    await OrderService.createBillHistory(docBillHistory);
                } catch (err) {
                    // console.log('billing err' + JSON.stringify(err));
                }

                try {
                    ClassroomService.updateUserBuyData(order, items);
                } catch (err) {

                }

                for (let i = 0; i < items.length; i++) {
                    const classroom = await ClassroomModel.findOne({ _id: items[i].item_id });
                    if (!classroom) {
                        continue;
                    }

                    const subtotalItem = items[i].qty * items[i].price;
                    const docBillingItem = {
                        billing_id: bill.id,
                        user: { id: user.id, name: user.fullname, code: user.code },
                        creator: { id: user.id, code: user.code, name: user.fullname },
                        subject: classroom.subject ? classroom.subject : null,
                        classroom: { id: classroom.id, name: classroom.name, code: classroom.code },
                        qty: 1000,
                        price: items[i].price,
                        payment_method: paymentMethod,
                        subtotal: subtotalItem,
                        discount_type: items[i].discount_type || null,
                        discount_value: items[i].discount_value || 0,
                        discount: items[i].discount || 0,
                        total: (subtotalItem - (items[i].discount || 0)),
                        billed_at: billedAt
                    };
                    try {
                        const billItem = await BillingItemModel.findOne({ billing_id: bill.id, 'user.id': user.id, 'classroom.id': classroom.id, deleted_at: null });
                        if (billItem)
                            await BillingItemModel.updateOne({ _id: billItem.id }, { $set: docBillingItem });
                        else
                            await BillingItemModel.create(docBillingItem);
                    } catch (err) {
                        logError(err);
                        // console.log('BillingItemModel' + JSON.stringify(err));
                        return response(res, bill, 'Lỗi tạo Billing Item', statusCode.ERROR);
                    }
                    const _item = items[i].toObject();
                    _item.id = _item.item_id;
                    // Them hoc sinh vao lop
                    if (items[i].type === 'CLASSROOM') {
                        ClassroomService.updateUserToClassroom(_item, bill, docBillingItem, 0);
                    }
                    else if (items[i].type === 'EXTEND_BOOKID') {
                        await ClassroomService.extendBookId(order, items[i]);
                    }
                    // else if (items[i].type === 'BOOKID') {
                    //     await ClassroomService.addBookIdToUser(order, items[i]);
                    // }
                    console.log('DONE HOOK SMS');
                }
            }

            return response(res, {}, 'Thành công', statusCode.OK);
        } catch (err) {
            console.log(err);
        }

        return response(res, {}, 'Thành công', statusCode.OK);
    }

    async payOSDetailOrder(req, res, params) {
        try {
            const { id, paymentId } = params;

            const payOSOrder = await payOS.getPaymentLinkInformation(id);
            let creditLog = await CreditLogModel.findOne({ _id: paymentId });
            creditLog = creditLog.toObject();

 
            if (!payOSOrder) return response(res, null, 'EMPTY_ORDER', statusCode.ERROR);
            if (creditLog) {
                const paymentCode = await OrderPaymentCodeModel.findOne({ credit_id: creditLog._id });
                creditLog.bank_text = paymentCode.code;
            }

            const payOSRes = { creditLog, payOSOrder }

            return response(res, payOSRes, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async payOSUpdateOrder(req, res, params) {
        try {
            const { id, paymentId } = params;
            const payOSOrder = await payOS.getPaymentLinkInformation(id);
            const creditLog = await CreditLogModel.findOne({ _id: paymentId });

            if (!creditLog) return response(res, null, 'EMPTY_ORDER', statusCode.ERROR);

            const rs = await CreditLogModel.updateOne({ _id: paymentId }, { $set: { status: payOSOrder.status } });

            if (rs) return response(res, null, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async payOSHook(req, res, params) {
        try {
            const { code, amount } = params;
            const note = JSON.stringify(params);
            let orderCode = null;

            if (!code)
                return response(res, null, 'CODE_INVALID', statusCode.OK);
            if (code.length > 6)
                orderCode = code;

            // Tim Order
            let order = null;
            let userID = null;
            let creditID = null;
            let creditTotal = 0;
            let type = null;

            if (!orderCode) {
                const paymentCode = await OrderPaymentCodeModel.findOne({ code });
                if (!paymentCode)
                    return response(res, null, 'CODE_NOT_EXISTED', statusCode.OK);

                if (paymentCode.type === 'ORDER') {
                    type = 'ORDER';
                    order = await OrderModel.findOne({ _id: paymentCode.order_id });
                    if (!order) {
                        return response(res, null, 'ORDER_EMPTY', statusCode.OK);
                    }
                    userID = order.customer_id;
                } else if (paymentCode.type === 'CREDIT') {
                    type = 'CREDIT';
                    const creditItem = await CreditLogModel.findOne({ _id: paymentCode.credit_id });
                    if (creditItem) {
                        creditID = creditItem.id;
                        creditTotal = creditItem.total;
                        if (creditItem.user && creditItem.user.id)
                            userID = creditItem.user.id;
                    }
                }

            } else {
                order = await OrderModel.findOne({ code: orderCode });
                if (!order) {
                    return response(res, null, 'ORDER_EMPTY', statusCode.OK);
                }

                if (order.status === 'SUCCESS' || order.status === 'PAID')
                    return response(res, null, 'Đơn hàng đã thanh toán thành công!', statusCode.OK);
            }

            const user = await UserModel.findOne({ _id: userID });
            if (!user) {
                return response(res, null, 'USER_EMPTY', statusCode.OK);
            }

            if (type === 'CREDIT') {
                if (creditID && creditTotal > 0) {
                    await CreditLogModel.updateOne({ _id: creditID }, { $set: { status: 'SUCCESS', note } });
                    const userbalance = user.balance + amount;
                    await UserModel.updateOne({ _id: userID }, {
                        $set: {
                            balance: userbalance
                        }
                    });
                }
            } else if (type === 'ORDER') {
                // Nap tien cho hoc sinh.
                const creditLog = await CreditService.createTransaction(user, amount, 'BANK_TRANSFER', 'ADD', 'SUCCESS', params.sms || null);
                if (!creditLog) {
                    return response(res, null, 'CAN_NOT_CREATE_CREDIT_LOG', statusCode.OK);
                }

                user.balance += amount;

                if (user.balance < order.total) {
                    return response(res, null, 'NOT_ENOUGH_MONEY', statusCode.OK);
                }

                await CreditService.createTransaction(user, order.total, 'BANK_TRANSFER', 'SUB', 'SUCCESS', params.sms || null);

                // Cho vao khoa hoc
                const items = await OrderItemModel.find({ order_id: order._id });
                if (!items || items.length <= 0) {
                    return response(res, null, 'ITEM_EMPTY', statusCode.OK);
                }
                const paymentMethod = 'BANK_TRANSFER';

                let _totalItemDiscount = 0;
                let subtotal = 0;

                if (items.length > 0) {
                    for (let i = 0; i < items.length; i++) {
                        subtotal += items[i].qty * items[i].price;
                    }
                }

                _totalItemDiscount += order.discount_total ? order.discount_total : 0;
                const total = order.subtotal - order.discount_total ? order.discount_total : 0;
                const billedAt = new Date();

                const docBill = {
                    order: { id: order.id, code: order.code, type: order.type },
                    user: { id: user.id, name: user.fullname, code: user.code },
                    creator: { id: user.id, code: user.code, name: user.fullname },
                    items: items,
                    discount: _totalItemDiscount,
                    subtotal: order.subtotal,
                    total: total,
                    type: 'PT',
                    payment_method: paymentMethod,
                    pay_type: 'ALL_COURSE',
                    billed_at: billedAt,
                    note: params.sms
                };

                const bill = await OrderService.createBill(docBill);
                if (!bill)
                    return response(res, {}, language.ERROR, statusCode.ERROR);

                const _rsOrder = await OrderModel.updateOne({ _id: order.id }, { $set: { transaction_code: code, status: 'PAID' } });
                if (_rsOrder) {
                    await OrderPaymentCodeModel.softDelete({ order_id: code }, true);
                }

                try {
                    // Ghi lich su tao bill thanh cong
                    let _historyNote = '';
                    _historyNote += 'Tạo phiếu thu #' + bill.code;
                    _historyNote += ' - Nội dung: ';
                    _historyNote += ', Chiết khấu: ' + _totalItemDiscount;
                    _historyNote += ', Tổng tiền: ' + subtotal;
                    _historyNote += ', Thanh toán: ' + total;

                    const docBillHistory = {
                        billing_id: bill.id,
                        creator: { id: user.id, code: user.code, name: user.fullname },
                        note: _historyNote
                    };

                    await OrderService.createBillHistory(docBillHistory);
                } catch (err) {
                    console.log('billing err' + JSON.stringify(err));
                    logError('billing err' + JSON.stringify(err));
                }

                try {
                    ClassroomService.updateUserBuyData(order, items);
                } catch (err) {
                    logError('billing err' + JSON.stringify(err));
                    console.log('billing err' + JSON.stringify(err));
                }

                for (let i = 0; i < items.length; i++) {
                    const classroom = await ClassroomModel.findOne({ _id: items[i].item_id });
                    if (!classroom) {
                        continue;
                    }

                    const subtotalItem = items[i].qty * items[i].price;
                    const docBillingItem = {
                        billing_id: bill.id,
                        user: { id: user.id, name: user.fullname, code: user.code },
                        creator: { id: user.id, code: user.code, name: user.fullname },
                        subject: classroom.subject ? classroom.subject : null,
                        classroom: { id: classroom.id, name: classroom.name, code: classroom.code },
                        qty: 1000,
                        price: items[i].price,
                        payment_method: paymentMethod,
                        subtotal: subtotalItem,
                        discount_type: items[i].discount_type || null,
                        discount_value: items[i].discount_value || 0,
                        discount: items[i].discount || 0,
                        total: (subtotalItem - (items[i].discount || 0)),
                        billed_at: billedAt
                    };
                    try {
                        const billItem = await BillingItemModel.findOne({ billing_id: bill.id, 'user.id': user.id, 'classroom.id': classroom.id, deleted_at: null });
                        if (billItem)
                            await BillingItemModel.updateOne({ _id: billItem.id }, { $set: docBillingItem });
                        else
                            await BillingItemModel.create(docBillingItem);
                    } catch (err) {
                        logError(err);
                        console.log('BillingItemModel' + JSON.stringify(err));
                        return response(res, bill, 'Lỗi tạo Billing Item', statusCode.ERROR);
                    }
                    const _item = items[i].toObject();
                    _item.id = _item.item_id;
                    // Them hoc sinh vao lop
                    if (items[i].type === 'CLASSROOM') {
                        ClassroomService.updateUserToClassroom(_item, bill, docBillingItem, 0);
                    }
                    else if (items[i].type === 'EXTEND_BOOKID') {
                        await ClassroomService.extendBookId(order, items[i]);
                    }
                    // else if (items[i].type === 'BOOKID') {
                    //     await ClassroomService.addBookIdToUser(order, items[i]);
                    // }
                    console.log('DONE HOOK SMS');
                }
            }

            return response(res, {}, 'Thành công', statusCode.OK);
        } catch (err) {
            console.log(err);
        }

        return response(res, {}, 'Thành công', statusCode.OK);
    }
}

module.exports = new CreditController();
