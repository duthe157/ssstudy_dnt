const log4js = require('log4js');
const telegramBotApi = require('telegram-bot-api');
const configJson = require('../../config/config');

const BOT_TOKEN = '5189755702:AAG0lr9fdMpUChWT8OH6AJhrrA8PL-OMwVM';
const TeleBot = new telegramBotApi({ token: BOT_TOKEN });
const GROUP_ID = '-533794472';

class Monitor {
    constructor() {
        log4js.configure({
            pm2: true,
            // pm2InstanceVar: 'INSTANCE_ID',
            appenders: {
                error: {
                    type: 'file',
                    filename: './logs/error/error.log', // specify the path where u want logs folder error.log
                    category: 'error',
                    maxLogSize: 50000000,
                    pattern: 'yyyy-MM-dd',
                    backups: 10
                },
                request: {
                    type: 'file',
                    filename: './logs/request/request.log', // specify the path where u want logs folder error.log
                    category: 'request',
                    pattern: 'yyyy-MM-dd',
                    maxLogSize: 50000000,
                    backups: 10
                },
                data: {
                    type: 'file',
                    filename: './logs/data/data.log', // specify the path where u want logs folder error.log
                    category: 'data',
                    pattern: 'yyyy-MM-dd',
                    maxLogSize: 50000000,
                    backups: 10
                },
                func: {
                    type: 'file',
                    filename: './logs/func/func.log', // specify the path where u want logs folder error.log
                    category: 'func',
                    pattern: 'yyyy-MM-dd',
                    maxLogSize: 50000000,
                    backups: 10
                },
                debug: {
                    type: 'file',
                    filename: './logs/debug/debug.log', // specify the path where u want logs folder error.log
                    category: 'debug',
                    pattern: '.yyyy-MM-dd',
                    maxLogSize: 50000000,
                    backups: 10
                },
                logsAPI: {
                    type: '@log4js-node/logstashudp',
                    host: configJson.LOG_CENTER,
                    category: 'logsAPI',
                    port: 5044
                },
                logError: {
                    type: '@log4js-node/logstashudp',
                    host: configJson.LOG_CENTER,
                    category: 'logError',
                    port: 5045
                },
                logProcess: {
                    type: '@log4js-node/logstashudp',
                    host: configJson.LOG_CENTER,
                    category: 'logProcess',
                    port: 5046
                }
            },
            categories: {
                default: {
                    appenders: ['debug'],
                    level: 'INFO'
                },
                request: {
                    appenders: ['request'],
                    level: 'DEBUG'
                },
                error: {
                    appenders: ['error'],
                    level: 'DEBUG'
                },
                func: {
                    appenders: ['func'],
                    level: 'DEBUG'
                },
                data: {
                    appenders: ['data'],
                    level: 'DEBUG'
                },
                logsAPI: {
                    appenders: ['logsAPI'],
                    level: 'DEBUG'
                },
                logError: {
                    appenders: ['logError'],
                    level: 'INFO'
                },
                logProcess: {
                    appenders: ['logProcess'],
                    level: 'INFO'
                },

            }
        });
    }

    getLogger(type) {
        return log4js.getLogger(type);
    }

    async notifyErrorFunction(strLog, sendTelegram = false) {
        try {
            const objMessage = {
                chat_id: GROUP_ID,
                text: strLog
            };
            const env = process.env.NODE_ENV;
            if (env == 'production' || sendTelegram) {
                TeleBot.sendMessage(objMessage).then(() => {
                    // console.log(data);
                }).catch(() => {
                    // console.log(err);
                });
            }
        } catch (err) {
            console.log(err);
        }
    }
}
module.exports = new Monitor();
