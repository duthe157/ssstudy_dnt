const callerId = require('caller-id');
const BaseHelper = require('../app/helpers/BaseHelper');

module.exports = (function () {
	global.listRoutes = [];

	global.listIgnore = [];
	global._ = require('lodash');

	global.statusCode = require('./status');

	global.monitor = require('../app/helpers/Monitor');

	global.response = async function (res, data, message, code) {
		const json = JSON.stringify({
			data: data,
			message: message,
			code: code
		});
		const statusCode = (code && code != 200) ? code : 200;
		res.writeHeader(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
		res.write(json);
		res.message = (code != 200) ? message : '';
		res.end();
		return res;
	};

	global.download = async function (res, data, filename, contentType = 'application/octet-stream') {
		res.setHeader('Content-Type', contentType);
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.write(data);
		res.end();
	};

	global.logError = (err, sendTelegram = true) => {
		try {
			if (err != null) {
				const log = monitor.getLogger('error');
				let strData = '';
				const detail = callerId.getDetailedString();
				const strErr = BaseHelper.convert(err);
				const envName = process.env.name ? process.env.name : '';
				const envNode = process.env.NODE_ENV ? process.env.NODE_ENV : 'Dev';
				const strLog = envName + ' ' + envNode + ' ' + strData + ' ' + strErr + ' ' + detail;
				monitor.notifyErrorFunction('---------------------------------------------------------------' + strLog, sendTelegram);
			}
		} catch (err) {
			console.log(err);
		}
	};
}());