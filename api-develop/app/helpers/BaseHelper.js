const fs = require('fs');
const md5 = require('md5');
const guidid = require('uuid/v4');
const xml2js = require('xml2js');
const crypto = require('crypto');
const request = require('request');
const date = require('date-and-time');
const dateFormat = require('dateformat');
const { exec } = require('child_process');
const mkdirp = require('mkdirp');
const path = require('path');
const base64 = require('base-64');
const joiValidator = require('joi');
const moment = require('moment');
const encryptor = require('simple-encryptor');
const { statSync, readdirSync } = require('fs');
const { join } = require('path');
const appConfig = require('../../config/app');
class BaseHelper {
    isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    getTestingCommentByPoint(point) {
        if (point) {
            if (point < 6)
                return 'Thực sự em đang rơi vào tình trạng đáng báo động đó, kiến thức cơ bản em đang gặp vấn đề, nếu không khắc phục ngày thì khả năng em sẽ rơi vào một ngôi trường cấp 3 (đại học) không hề tốt vào tương lai. Điều này đội ngũ SSSTUDY.VN không hề muốn chút nào, hãy lấp ngay những lỗ hổng sau nhé, SSSTUDY.VN tin em sẽ giúp em bứt phá được trong thời gian tới';
            if (point >= 6 && point < 8)
                return 'Phần kiến thức cơ bản của em không phải quá tệ, nhưng với lực học hiện tại, khó lòng em sẽ đỗ được vào một ngôi trường thực sự tốt trong tương lai. Điều này đội ngũ SSSTUDY.VN không hề muốn chút nào, hãy lấp ngay những lỗ hổng sau nhé, SSSTUDY.VN tin em sẽ giúp em bứt phá được trong thời gian tới';
            if (point >= 8 && point < 10)
                return 'Tính đến thời điểm hiện tại, theo tiến độ trên trường, em chỉ cần giữ vững phong độ và lấp đầy những lỗ hổng sau là hoàn toàn có thể đạt được mục tiêu của mình đề ra';
            if (point === 10)
                return 'Em rất có tiềm năng để đạt được mục tiêu điểm số mà em mong muốn trong kỳ thi đó';
        }
        return 'Không có nhận xét!';
    }

    getUploadFolder() {
        return dateFormat(new Date(), 'yyyy/mm/dd');
    }

    async generateNumber(n) {
        var add = 1,
            max = 12 - add;

        if (n > max) {
            return generate(max) + generate(n - max);
        }

        max = Math.pow(10, n + add);
        var min = max / 10; // Math.pow(10, n) basically 
        var number = Math.floor(Math.random() * (max - min + 1)) + min;

        return ("" + number).substring(add);
    }

    getPhone(phone) {
        try {
            if (phone) {
                phone = phone.replace(/ +/g, '');
                phone = phone.replace(/-/gi, '');
                phone = phone.replace('.', '');
            }
            const regexNV = /(\+84|0){1}(9|8|7|5|3){1}[0-9]{8}/;
            const isValid = regexNV.test(phone);
            if (isValid)
                return phone;
            return null;
        } catch (err) {
            logStack(err);
            return null;
        }
    }

    formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    is_weekend(d) {
        var dt = new Date(d);

        if (dt.getDay() == 6 || dt.getDay() == 0) {
            return true;
        }
        return false;
    }

    getMonday(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    dayOfWeek(d) {
        const weekDay = [
            'Chủ nhật',
            'Thứ 2',
            'Thứ 3',
            'Thứ 4',
            'Thứ 5',
            'Thứ 6',
            'Thứ 7'
        ];
        return weekDay[d];
    }

    capitalize(str) {
        if (typeof str !== 'string')
            return '';
        const splitStr = str.toLowerCase().split(' ');
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
    }

    startDateEndDate(month, year) {
        if (month == 0)
            month = 1;

        if (!month || !year)
            return null;

        const _str = year + '/' + month + '/01';
        const date = new Date(_str);
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59);
        const data = {
            start_date: startDate,
            end_date: endDate
        };
        return data;
    }

    firstDay(d) {
        d.setHours(0, 0, 1);
        return d;
    }

    lastDay(d) {
        d.setHours(23, 59, 59);
        return d;
    }

    firstMonth(d) {
        d.setHours(0, 0, 1);
        d.setDate(1);
        return d;
    }

    addSecond(theDate, second) {
        return date.addSeconds(theDate, second);
    }

    addMinute(theDate, minute) {
        return date.addMinutes(theDate, minute);
    }

    addHour(theDate, hours) {
        return date.addHours(theDate, hours);
    }

    addDay(theDate, days) {
        // days phải là số nếu không trước khi truyền vào hãy dùng hàm parseInt(days)
        return date.addDays(theDate, days);
    }

    addMonth(theDate, months) {
        // months phải là số nếu không trước khi truyền vào hãy dùng hàm parseInt(months)
        return date.addMonths(theDate, months);
    }

    diffDateSecond(dt1, dt2) {
        // So sánh ngày dt1 hơn ngày dt2 bao nhiêu giây
        return (dt1.getTime() - dt2.getTime()) / 1000;
    }

    diffDateDay(dt1, dt2) {
        // So sánh ngày dt1 hơn ngày dt2 bao nhiêu ngay
        const diffTime = Math.abs(dt2.getTime() - dt1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    parseUrl(urlFull) {
        const parsed = {
            http: '', ishttps: 0, domain: '', subFolder: ''
        };
        if (urlFull === null || urlFull.length === 0) {
            return parsed;
        }
        urlFull = urlFull.replace(' ', '').toLowerCase();
        let index = urlFull.indexOf('://');
        let endURL = urlFull;
        if (index > -1) {
            parsed.http = urlFull.substr(0, index).trim();
            endURL = urlFull.substr(index + 3, urlFull.length).trim();
        }
        parsed.ishttps = parsed.http.startsWith('https:');
        index = endURL.indexOf('/');
        if (index == -1) {
            parsed.domain = endURL.trim().replace(' ', '');
        } else {
            parsed.domain = endURL.substr(0, index).trim();
            endURL = endURL.substr(index + 1, endURL.length).trim();
            index = endURL.indexOf('/');
            parsed.subFolder = index == -1 ? endURL : endURL.substr(0, index).trim();
        }
        parsed.domain = this.sanitizeUTF8(parsed.domain);
        return parsed;
    }

    parseFileName(fileName) {
        const file = {};
        const index = fileName.lastIndexOf('.');
        file.name = fileName.substr(0, index);
        file.ext = fileName.substr(index + 1);
        return file;
    }

    async deleteAllFileInFolder(path, Seconds) {
        try {
            if (!path.endsWith('/'))
                path += '/';
            const files = fs.readdirSync(path);
            const cur = new Date();
            for (let i = 0; i < files.length; i++) {
                try {
                    const info = fs.statSync(path + files[i]);
                    const createTime = new Date(info.birthtime);
                    if (this.diffDate(cur, createTime) > Seconds) {
                        fs.unlinkSync(path + files[i]);
                    }
                } catch (e) { }
            }
        } catch (err) {
            throw err;
        }
    }

    diffDate(dt1, dt2) { // So sánh ngày dt1 hơn ngày dt2 bao nhiêu giây
        return (dt1.getTime() - dt2.getTime()) / 1000;
    }

    async base64ToImage(base64, path, fileName) {
        try {
            let mimetype = '';
            let ext = '';
            let base64Data = base64;
            if (base64.startsWith('data:image/png;base64,')) {
                ext = '.png';
                mimetype = 'image/png';
                base64Data = base64.substr(22);
            } else if (base64.startsWith('data:image/jpeg;base64,')) {
                ext = '.jpg';
                mimetype = 'image/jpeg';
                base64Data = base64.substr(23);
            } else if (base64.startsWith('data:image/gif;base64,')) {
                ext = '.gif';
                mimetype = 'image/gif';
                base64Data = base64.substr(22);
            } else if (base64.startsWith('data:image/svg+xml;base64,')) {
                ext = '.svg';
                mimetype = 'image/svg+xml';
                base64Data = base64.substr(26);
            } else if (base64.startsWith('data:image/vnd.microsoft.icon;base64,')) {
                ext = '.ico';
                mimetype = 'image/x-icon';
                base64Data = base64.substr(37);
            } else if (base64.startsWith('data:image/x-icon;base64,')) {
                ext = '.ico';
                mimetype = 'image/x-icon';
                base64Data = base64.substr(25);
            } else
                return false;

            const pathFile = path + fileName + ext;
            await fs.writeFileSync(pathFile, base64Data, 'base64');
            return {
                path: pathFile,
                originalname: fileName + ext,
                mimetype: mimetype,
                ext: ext
            };
        } catch (err) {
            throw err;
        }
    }

    async base64ToPNG(base64, name) {
        return new Promise((resolve) => {
            const base64Data = base64.replace(/^data:image\/png;base64,/, '');
            const filename = './temp/' + name + '.png';
            fs.writeFile(filename, base64Data, 'base64', (err) => {
                if (err)
                    resolve(false);
                resolve(filename);
            });
        });
    }

    async getRequest(url) {
        const options = {
            method: 'GET',
            url
        };
        return new Promise((resolve, reject) => {
            request(options, (error, res, body) => {
                if (!error && res.statusCode == 200) {
                    let rs = body;
                    if (typeof rs === 'string')
                        rs = JSON.parse(rs.trim());
                    resolve(rs);
                } else {
                    reject(error);
                }
            });
        });
    }

    async sendRequest(options) {
        return new Promise((resolve, reject) => {
            try {
                request(options, (error, res, body) => {
                    if (!error && res.statusCode == 200) {
                        let rs = body;
                        if (typeof rs === 'string')
                            rs = JSON.parse(rs.trim());
                        resolve(rs);
                    } else {
                        reject(error);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    async getRequest2(url) {
        const options = {
            method: 'GET',
            url
        };
        return new Promise((resolve, reject) => {
            request(options, (error, res, body) => {
                if (!error && res.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }

    async postRequest(options) {
        return new Promise(((resolve) => {
            request.post(options, (err, httpResponse, body) => {
                if (!err && (httpResponse.statusCode === 200 || httpResponse.statusCode == 201)) {
                    resolve(body);
                } else {
                    logError(err);
                    resolve(false);
                }
            });
        }));
    }

    sanitizeUTF8(text) {
        const vnTexts = ['á', 'à', 'ả', 'ã', 'ạ', 'â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'đ', 'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ế', 'ề', 'ể', 'ễ', 'ệ', 'í', 'ì', 'ỉ', 'ĩ', 'ị', 'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ', 'Á', 'À', 'Ả', 'Ã', 'Ạ', 'Â', 'Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ', 'Ă', 'Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ', 'Đ', 'É', 'È', 'Ẻ', 'Ẽ', 'Ẹ', 'Ê', 'Ế', 'Ề', 'Ể', 'Ễ', 'Ệ', 'Í', 'Ì', 'Ỉ', 'Ĩ', 'Ị', 'Ó', 'Ò', 'Ỏ', 'Õ', 'Ọ', 'Ô', 'Ố', 'Ồ', 'Ổ', 'Ỗ', 'Ộ', 'Ơ', 'Ớ', 'Ờ', 'Ở', 'Ỡ', 'Ợ', 'Ú', 'Ù', 'Ủ', 'Ũ', 'Ụ', 'Ư', 'Ứ', 'Ừ', 'Ử', 'Ữ', 'Ự', 'Ý', 'Ỳ', 'Ỷ', 'Ỹ', 'Ỵ'];
        const replaceText = ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'd', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'y', 'y', 'y', 'y', 'y', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'D', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I', 'I', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'Y', 'Y', 'Y', 'Y', 'Y'];
        let index;
        for (let i = 0; i < vnTexts.length; i++) {
            index = text.indexOf(vnTexts[i]);
            if (index > -1) {
                text = text.replace(new RegExp(vnTexts[i], 'g'), replaceText[i]);
            }
        }
        return text;
    }

    seoURL(name) {
        if (!name)
            return '';
        name = this.sanitizeUTF8(name);
        name = name.replace(/ /g, '-');
        name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
        name = name.replace(/\.+/g, '-');
        name = name.replace(/-+/g, '-');
        name = name.replace(/_+/g, '_');
        name = name.toLowerCase();
        return name;
    }

    async base64ToFile(base64, path, fileName) {
        try {
            const date = new Date();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const year = date.getFullYear();
            const rootPath = appConfig.LOCAL.DIR_TEMP + '/' + year + month + day + '/';
            const mediaRootURL = year.toString() + month.toString() + day.toString();
            await this.createFolderFull(rootPath);

            let mimetype = '';
            let ext = '';
            let base64Data = base64;
            if (base64.startsWith('data:image/png;base64,')) {
                ext = '.png';
                mimetype = 'image/png';
                base64Data = base64.substr(22);
            } else if (base64.startsWith('data:image/jpeg;base64,')) {
                ext = '.jpg';
                mimetype = 'image/jpeg';
                base64Data = base64.substr(23);
            } else if (base64.startsWith('data:image/gif;base64,')) {
                ext = '.gif';
                mimetype = 'image/gif';
                base64Data = base64.substr(22);
            } else if (base64.startsWith('data:image/svg+xml;base64,')) {
                ext = '.svg';
                mimetype = 'image/svg+xml';
                base64Data = base64.substr(26);
            } else if (base64.startsWith('data:image/vnd.microsoft.icon;base64,')) {
                ext = '.ico';
                mimetype = 'image/x-icon';
                base64Data = base64.substr(37);
            } else if (base64.startsWith('data:image/x-icon;base64,')) {
                ext = '.ico';
                mimetype = 'image/x-icon';
                base64Data = base64.substr(25);
            } else if (base64.startsWith('data:application/octet-stream;base64,')) {
                ext = '.pdf';
                mimetype = 'application/octet-stream';
                base64Data = base64.substr(37);
            } else
                return false;

            const pathFile = rootPath + fileName + ext;
            fs.mkdir(path, { recursive: true }, (err) => {
                if (err) {
                    logError(err);
                    return false;
                }
                fs.writeFileSync(pathFile, base64Data, 'base64');
            });

            const mediaURL = mediaRootURL + '/' + fileName + ext;

            return {
                file_name: fileName,
                mimetype: mimetype,
                ext: ext,
                file_url: mediaURL
            };
        } catch (err) {
            logError(err);
            return false;
        }
    }

    generatePermissionCode(id) {
        const sTime = date.format(new Date(), 'YYYYMMDDHHmmss');
        return id.substring(15) + sTime;
    }

    generateTime() {
        return dateFormat(new Date(), 'yyyymmddHHMMss');
    }

    generateText(length) {
        const text = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_', '-', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'L', 'K', 'J', 'H', 'G', 'F', 'D', 'S', 'A', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
        let result = '';
        for (let i = 0; i < length; i++) {
            result += text[Math.floor(Math.random() * text.length)];
        }
        return result;
    }

    generateTextToken(text) {
        return crypto.createHash('sha256').update(`${new Date().toString() + '&63Minh(84lsdf' + text + 'Cu@$Ot206'}&SALT&OTHER_PARAMS`).digest('hex');
    }

    getClientIP(req) {
        return req.headers['x-forwarded-for'];
    }

    async createFolder(_path) {
        try {
            const list = _path.split('/');
            let newPath = '/';
            for (let i = 0; i < list.length; i++) {
                newPath += list[i] + '/';
                if (!fs.existsSync(newPath)) {
                    // fs.mkdirSync(newPath);
                    mkdirp(path.dirname(newPath), () => { });
                }
            }
        } catch (err) {
            logError(err);
            throw err;
        }
    }

    async textToXML(text) {
        return new Promise(((resolve, reject) => {
            try {
                xml2js.parseString(text, { trim: true }, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            } catch (err) {
                logError(err);
                reject(err);
            }
        }));
    }

    writeFile(path, text) {
        fs.writeFileSync(path, text, 'utf8', (err) => {
            if (err)
                throw err;
        });
    }

    fileToJSON(path) {
        try {
            const content = fs.readFileSync(path, 'utf8');
            return JSON.parse(content.trim());
        } catch (err) {
            logError(err);
        }
        return {};
    }

    async readFileToList(path) {
        try {
            if (!fs.existsSync(path))
                return [];
            const content = fs.readFileSync(path, 'utf8');
            return content.trim().split('\n');
        } catch (err) {
            logError(err);
        }
    }

    async readFileToListNotEmpty(path) {
        if (!fs.existsSync(path))
            return [];
        const content = fs.readFileSync(path, 'utf8');
        const lines = content.trim().split('\n');
        const list = [];
        let index = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() == '') {
                continue;
            }
            list[index] = lines[i].trim();
            index++;
        }
        return list;
    }

    encryptMD5(before, text, after) {
        return md5(before + text + after);
    }

    async hmacText(text, secretKey) {
        return crypto.createHmac('sha256', secretKey).update(text).digest('hex');
    }

    textEncrypt(data, secretKey) {
        const cipher = crypto.createCipher('aes-256-cbc', secretKey);
        let crypted = cipher.update(data, 'utf-8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    textDecrypt(data, secretKey) {
        const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
        let decrypted = decipher.update(data, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    }

    objectEncrypt(secretKey, ob) {
        const encryptorObj = encryptor({
            key: secretKey,
            hmac: false,
            debug: false
        });
        return encryptorObj.encrypt(ob);
    }

    objectDecrypt(secretKey, data) {
        const encryptorObj = encryptor({
            key: secretKey,
            hmac: false,
            debug: false
        });
        return encryptorObj.decrypt(data);
    }

    convert(obj) {
        // Note: cache should not be re-used by repeated calls to JSON.stringify.
        let cache = [];
        const res = JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Duplicate reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null;
        return res;
    }

    formatNumber(number, n, x, s, c) {
        // Xử lý null, undefined, NaN - mặc định về 0
        if (number == null || isNaN(number)) {
            number = 0;
        }
        const re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')';
        // eslint-disable-next-line no-bitwise
        const num = number.toFixed(Math.max(0, ~~n));
        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    }

    shuffleList(list) {
        const newList = [];
        let index;
        let i = 0;
        while (list.length > 0) {
            index = Math.floor(Math.random() * Math.floor(list.length));
            newList[i] = list[index];
            i++;
            list.splice(index, 1);
        }
        return newList;
    }

    randomNumber(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    randomNumberMinMax(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    async _guidid() {
        return guidid();
    }

    async copyFile(path, newPath) {
        try {
            await fs.copyFileSync(path, newPath);
        } catch (err) {
            logError(err);
        }
    }

    async moveFile(oldPath, pathTo) {
        await fs.renameSync(oldPath, pathTo);
    }

    async deleteFolder(path) {
        await fs.rmdirSync(path);
    }

    async deleteFile(path) {
        try {
            await fs.unlinkSync(path);
        } catch (err) {
            logError(err);
        }
    }

    async listFileInFolder(path) {
        try {
            const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isFile());
            return dirs(path);
        } catch (err) {
            logError(err);
        }
        return [];
    }

    async listFolderInFolder(path) {
        try {
            const { join } = require('path');
            const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
            return dirs(path);
        } catch (err) {
            logError(err);
        }
        return [];
    }

    async listAllInFolder(path) {
        return await fs.readdirSync(path);
    }

    async getFileMetadata(path) {
        return new Promise(((resolve, reject) => {
            try {
                fs.stat(path, (err, stats) => {
                    if (err)
                        reject(err);
                    resolve(stats);
                });
            } catch (err) {
                reject(err);
            }
        }));
    }

    async execProcess(command) {
        return new Promise(((resolve, reject) => {
            try {
                exec(command, (err, stdout, stderr) => {
                    if (err)
                        reject(err);
                    const rs = {
                        stderr,
                        stdout
                    };
                    resolve(rs);
                });
            } catch (err) {
                logError(err);
                reject(err);
            }
        }));
    }

    pad(num, size) {
        let s = num + '';
        while (s.length < size)
            s = '0' + s;
        return s;
    }

    encryptMd5(before, text, after) {
        return md5(before + text + after);
    }

    passwordValidate(password) {
        const regex = new RegExp('^[0-9a-zA-Z!@#_]{6,20}$', 'i');

        return regex.test(password);
    }

    trimBody(req, res, next) {
        if (req.body) {
            trimStringProperties(req.body);
        }
        next();
    }

    base64Encode(string) {
        return base64.encode(string);
    }

    base64Decode(string) {
        return base64.decode(string);
    }

    getParam(name, path) {
        const results = new RegExp('[?#&;]' + name + '=([^?&;#]*)').exec(path);
        if (results == null) {
            return false;
        }
        return results[1];
    }

    validateJson(object, schema) {
        const result = joiValidator.validate(object, schema);
        return result.error === null;
    }

    getDatesBeetween(startDate, stopDate) {
        const dateArray = [];
        let currentDate = moment(startDate);
        const endDate = moment(stopDate);
        while (currentDate <= endDate) {
            dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
            currentDate = moment(currentDate).add(1, 'days');
        }
        return dateArray;
    }

    async timeoutPromise(ms, promise) {
        // Create a promise that rejects in <ms> milliseconds
        const timeout = new Promise((resolve, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject(new Error('Timed out in ' + ms + 'ms.'));
            }, ms);
        });

        // Returns a race between our timeout and the passed in promise
        const race = await Promise.race([
            promise,
            timeout
        ]);
        return race;
    }

    async isvalidUID(UID) {
        const regex = new RegExp(/^[0-9a-fA-F]{24}$/);
        if (regex.test(UID)) {
            return false;
        }
    }

    objectIdDetails(UID) {
        return {
            seconds: parseInt(UID.slice(0, 8), 16),
            machineIdentifier: parseInt(UID.slice(8, 14), 16),
            processId: parseInt(UID.slice(14, 18), 16),
            counter: parseInt(UID.slice(18, 24), 16)
        };
    }

    checkNested(obj, level, ...rest) {
        if (obj === undefined)
            return false;
        if (rest.length == 0 && obj.hasOwnProperty(level))
            return true;
        return this.checkNested(obj[level], ...rest);
    }

    async createFolderFull(path) {
        try {
            if (path.startsWith('/'))
                path = path.substr(1);

            const list = path.split('/');
            let newPath = '/';
            for (let i = 0; i < list.length; i++) {
                newPath += list[i] + '/';
                if (!fs.existsSync(newPath)) {
                    fs.mkdirSync(newPath);
                }
            }
        } catch (err) {
            throw err;
        }
    }

    round2Decimal(num){
        let round = Math.round(num * 100) / 100;
        if (round % 1 === 0) {
            return parseInt(num);
        }

        return round;
    }
}

function trimStringProperties(obj) {
    if (obj !== null && typeof obj === 'object') {
        for (const prop in obj) {
            // if the property is an object trim it too
            if (typeof obj[prop] === 'object') {
                trimStringProperties(obj[prop]);
            }

            // if it's a string remove begin and end whitespaces
            if (typeof obj[prop] === 'string' || obj[prop] instanceof String) {
                obj[prop] = obj[prop].trim();
            }
        }
    }
}

module.exports = new BaseHelper();
