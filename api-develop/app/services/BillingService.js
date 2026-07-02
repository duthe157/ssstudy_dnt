const UserModel = require('../models/User');
const BillingModel = require('../models/Billing');
const ExcelService = require('./ExcelService');
class BillingService {
    async exportBilling(fromDate, toDate) {
        try {
            let conditions = {
                billed_at: {
                    $gte: new Date(fromDate),
                    $lte: new Date(toDate)
                }
            }
            const bills = await BillingModel.find(conditions);

            // Extract unique user IDs and batch load all users (fix N+1 query problem)
            const userIds = [...new Set(bills.map(bill => bill.user.id))];
            const users = await UserModel.find({ _id: { $in: userIds } });

            // Create user lookup map for O(1) access
            const userMap = {};
            users.forEach(user => {
                userMap[user._id.toString()] = user;
            });

            const data = [];
            const _billHead = [];
            _billHead.push('Mã phiếu');
            _billHead.push("Tên HS");
            _billHead.push("Mã HS");
            _billHead.push("Số ĐT");
            _billHead.push("Trường học");
            _billHead.push("Loại phiếu");
            _billHead.push("Nộp theo");
            _billHead.push("Tổng tiền");
            _billHead.push("Phương thức TT");
            _billHead.push("Ghi chú");
            _billHead.push("Người tạo");
            _billHead.push("Ngày thu");
            _billHead.push("Sản phẩm");
            _billHead.push("Mã SP");
            _billHead.push("Số lượng");
            _billHead.push("Giá");
            _billHead.push("Hình thức chiết khấu");
            _billHead.push("Giá trị");
            _billHead.push("Tiền chiết khấu");
            _billHead.push("");
            data.push(_billHead);
            for (let i = 0; i < bills.length; i++) {
                const bill = bills[i];
                const items = bill.items;
                const user = userMap[bill.user.id.toString()];
                let type = '';
                if (bill.type === 'PT') type = 'Phiếu thu';
                if (bill.type === 'PC') type = 'Phiếu chi';
                let _billItem = [];
                // _billItem.push(bill._id);
                _billItem.push(bill.code);
                _billItem.push(user.fullname);
                _billItem.push(user.code);
                _billItem.push(user.phone);
                _billItem.push(user.school || "");
                _billItem.push(type);
                _billItem.push(bill.pay_type);
                _billItem.push(bill.total);
                _billItem.push(bill.payment_method);
                _billItem.push(bill.note);
                _billItem.push(bill.creator.name);
                _billItem.push(bill.billed_at);
                _billItem.push("");
                _billItem.push("");
                _billItem.push("");
                _billItem.push("");
                _billItem.push("");
                _billItem.push("");
                _billItem.push("");

                /*_billItem = {
                    id: bill._id,
                    code: bill.code,
                    user_fullname: user.fullname,
                    user_code: user.code,
                    user_phone: user.phone,
                    type: type,
                    pay_type: bill.pay_type,
                    total: bill.total,
                    payment_method: bill.payment_method,
                    note: bill.note,
                    discount: bill.discount,
                    creator_name: bill.creator.name,
                    billed_at: bill.billed_at,
                    created_at: bill.created_at,
                    product_name: "",
                    product_code: "",
                    product_qty: "",
                    product_price: "",
                    product_discount_type: "",
                    product_discount_value: "",
                    product_discount: ""
                }*/
                data.push(_billItem);
                for (let j = 0; j < items.length; j++) {
                    const _item = items[j];
                    _billItem = [];
                    // _billItem.push(bill._id);
                    _billItem.push(bill.code);
                    _billItem.push(user.fullname);
                    _billItem.push(user.code);
                    _billItem.push(user.phone);
                    _billItem.push(user.school || "");
                    _billItem.push(type);
                    _billItem.push(bill.pay_type);
                    _billItem.push(bill.total);
                    _billItem.push(bill.payment_method);
                    _billItem.push(bill.note);
                    _billItem.push(bill.creator.name);
                    _billItem.push(bill.billed_at);
                    _billItem.push(_item.name);
                    _billItem.push(_item.code);
                    _billItem.push(_item.qty);
                    _billItem.push(_item.price);
                    _billItem.push(_item.discount_type);
                    _billItem.push(_item.discount_value);
                    _billItem.push(_item.discount);
                    _billItem.push("");
                    data.push(_billItem);
                }
            }

            const name = 'HocPhi-' + new Date().getTime();
            const filename = await ExcelService.exportData(name, data);
            if (filename)
                return filename;
        } catch (err) {
            console.log(err);
            logError(err);
        }
        return false;
    }
}

module.exports = new BillingService();