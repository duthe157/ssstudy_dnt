const UserModel = require('../models/User');
const CreditLogModel = require('../models/CreditLog');

class CreditService {
    async createTransaction(user, total, paymentMethod, type, status = 'PENDING', note = null) {
        try {
            const _doc = {
                code: new Date().getTime(),
                total: total,
                type,
                payment_method: paymentMethod,
                user: {
                    id: user._id,
                    name: user.fullname,
                    code: user.code
                },
                note,
                status: status
            };
            const item = await CreditLogModel.create(_doc);
            if (item) {
                if (type == 'ADD') {
                    await UserModel.updateOne({ _id: user.id }, { $inc: { balance: +total } });
                }

                if (type == 'SUB') {
                    await UserModel.updateOne({ _id: user.id }, { $inc: { balance: -total } });
                }
                return item;
            }

            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }
}

module.exports = new CreditService();