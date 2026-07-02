const validator = require('validator');

class ValidateHelper {
    async isEmail(text) {
        try {
            return validator.isEmail(text);
        } catch (err) {
            throw err;
        }
    }

    async isPhone(text) {
        try {
            return validator.isMobilePhone(text);
        } catch (err) {
            throw err;
        }
    }

    async isDate(text) {
        try {
            return validator.toDate(text);
        } catch (err) {
            throw err;
        }
    }

    async isJson(text) {
        try {
            return validator.isJSON(text);
        } catch (err) {
            throw err;
        }
    }

    async isAlphanumeric(text) {
        // kiểm tra xem chuỗi có phải chỉ chữa số và chữ cái hay không
        try {
            return validator.isAlphanumeric(text);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new ValidateHelper();
