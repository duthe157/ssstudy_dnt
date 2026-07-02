const nodemailer = require('nodemailer');
const BaseHelper = require('../helpers/BaseHelper');
const config = require('../../config/config');
const appConfig = require('../../config/app');
const fs = require('fs');

class MailService {
    static CC = [config.MAIL_MARKETING, config.MAIL_DEVELOPER, config.MAIL_BOOK_MATH];
    static CC_NOT_SALE = [config.MAIL_DEVELOPER, config.MAIL_BOOK_MATH];

    async resetPassword(token, email, fullname, url) {
        try {
            const configMail = BaseHelper.fileToJSON(`${__dirname}/../languages/mails/vi.json`);
            const link = token;
            let html = configMail.forgot_password.html.split('@fullname@').join(fullname);
            html = html.split('@link@').join(link);
            const message = {
                from: configMail.forgot_password.from,
                to: email,
                replyTo: configMail.forgot_password.from,
                subject: configMail.forgot_password.subject,
                html
            };
            const result = await this.sendMailSMTP(message);
            return result;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async sendPasswordPendingPayment(password, email, fullname) {
        try {
            const configMail = BaseHelper.fileToJSON(`${__dirname}/../languages/mails/vi.json`);
            let html = configMail.send_password_pending_payment.html.split('@fullname@').join(fullname || email);
            html = html.split('@link@').join(password);
            const message = {
                from: configMail.send_password_pending_payment.from,
                to: email,
                replyTo: configMail.send_password_pending_payment.from,
                subject: configMail.send_password_pending_payment.subject,
                html
            };
            const result = await this.sendMailSMTP(message);
            return result;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async sendLinkVerifyRegistration(email, url) {
        try {
            const configMail = BaseHelper.fileToJSON(`${__dirname}/../languages/mails/vi.json`);
            let html = fs.readFileSync('./temp/email/verify-email-registration.html', 'utf8')
            html = html.split('verification_link_here').join(url);
            html = html.split('second_link').join(url);
            const message = {
                from: configMail.verify_email_registration.from,
                to: email,
                replyTo: configMail.verify_email_registration.from,
                subject: configMail.verify_email_registration.subject,
                html
            };
            return await this.sendMailSMTP(message);
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async sendMailSMTP(message) {
        try {
            const options = {
                host: config.SMTP.HOST,
                port: config.SMTP.PORT,
                secure: config.SMTP.SECURE,
                auth: {
                    user: config.SMTP.USERNAME,
                    pass: config.SMTP.PASSWORD
                }
            };

            const transport = nodemailer.createTransport(options);

            return new Promise((resolve, reject) => {
                try {
                    transport.sendMail(message, (err, rs) => {
                        if (rs)
                            resolve(true);
                        else {
                            reject(err);
                        }
                    });
                } catch (e) {
                    reject(e);
                }
            });
        } catch (err) {
            logError(err);
        }
    }

    async sendEmailConfirmOrder(order, orderLineItem = null) {
        try {
            const configMail = BaseHelper.fileToJSON(`${__dirname}/../languages/mails/vi.json`);
            let html = appConfig.EMAIL_CONFIRM_ORDER_HTML;
            html = html.split('{{customer_name}}').join(order.customer_name)
            html = html.replace('{{customer_phone}}', order.customer_phone);
            html = html.replace('{{customer_email}}', order.customer_email);
            html = html.replace('{{customer_address}}', order.customer_address);
            html = html.replace('{{customer_code}}', order.customer_code);
            html = html.replace('{{order_subtotal}}', BaseHelper.formatNumber(order.subtotal || 0));
            html = html.replace('{{order_discount_value}}', BaseHelper.formatNumber(order.discount_total || 0));
            html = html.replace('{{order_total}}', BaseHelper.formatNumber(order.total || 0));
            html = html.replace('{{order_line_items}}', orderLineItem);
            const orderStatus = appConfig.ORDER_STATUS_TEXT[order.status];
            html = html.replace('{{order_status}}', orderStatus);
            const orderPaymentMethod = appConfig.ORDER_PAYMENT_METHOD_TEXT[order.payment_method];
            html = html.replace('{{order_payment_method}}', orderPaymentMethod);

            var CC_COMFIRM = MailService.CC_NOT_SALE
            if (order.total && order.total > 0) {
                CC_COMFIRM = MailService.CC
            }
            const message = {
                from: configMail.confirm_order.from,
                to: order.customer_email,
                cc: CC_COMFIRM,
                replyTo: configMail.confirm_order.from,
                subject: configMail.confirm_order.subject,
                html
            };
            const result = await this.sendMailSMTP(message);
            return result;
        } catch (err) {
            logError(err);
            console.log(err);
            return false;
        }
    }

    async sendEmailConfirmPayos(order, orderLineItem = null, status = null) {
        try {
            const configMail = BaseHelper.fileToJSON(`${__dirname}/../languages/mails/vi.json`);
            let html = appConfig.EMAIL_CONFIRM_ORDER_HTML;
            html = html.split('{{customer_name}}').join(order.customer_name)
            html = html.replace('{{customer_phone}}', order.customer_phone);
            html = html.replace('{{customer_email}}', order.customer_email);
            html = html.replace('{{customer_address}}', order.customer_address);
            html = html.replace('{{customer_code}}', order.customer_code);
            html = html.replace('{{order_subtotal}}', BaseHelper.formatNumber(order.subtotal || 0));
            html = html.replace('{{order_discount_value}}', BaseHelper.formatNumber(order.discount_total || 0));
            html = html.replace('{{order_total}}', BaseHelper.formatNumber(order.total || 0));
            html = html.replace('{{order_line_items}}', orderLineItem);
            const orderStatus = appConfig.ORDER_STATUS_TEXT[status];
            html = html.replace('{{order_status}}', orderStatus);
            const orderPaymentMethod = appConfig.ORDER_PAYMENT_METHOD_TEXT[order.payment_method];
            html = html.replace('{{order_payment_method}}', orderPaymentMethod);

            const message = {
                from: configMail.confirm_order.from,
                to: order.customer_email,
                cc: MailService.CC,
                replyTo: configMail.confirm_order.from,
                subject: configMail.confirm_order.subject,
                html
            };
            const result = await this.sendMailSMTP(message);
            return result;
        } catch (err) {
            logError(err);
            console.log(err);
            return false;
        }
    }

    async sendEmailCancelOrderPayos(order, orderLineItem = null, status = null) {
        try {
            const configMail = BaseHelper.fileToJSON(`${__dirname}/../languages/mails/vi.json`);
            let html = appConfig.EMAIL_CANCELED_ORDER_HTML;
            html = html.split('{{customer_name}}').join(order.customer_name)
            html = html.replace('{{customer_phone}}', order.customer_phone);
            html = html.replace('{{customer_email}}', order.customer_email);
            html = html.replace('{{customer_address}}', order.customer_address);
            html = html.replace('{{customer_code}}', order.customer_code);
            html = html.replace('{{order_subtotal}}', BaseHelper.formatNumber(order.subtotal || 0));
            html = html.replace('{{order_discount_value}}', BaseHelper.formatNumber(order.discount_total || 0));
            html = html.replace('{{order_total}}', BaseHelper.formatNumber(order.total || 0));
            html = html.replace('{{order_line_items}}', orderLineItem);
            const orderStatus = appConfig.ORDER_STATUS_TEXT[status];
            html = html.replace('{{order_status}}', orderStatus);
            const orderPaymentMethod = appConfig.ORDER_PAYMENT_METHOD_TEXT[order.payment_method];
            html = html.replace('{{order_payment_method}}', orderPaymentMethod);

            const message = {
                from: configMail.cancel_order.from,
                to: order.customer_email,
                cc: MailService.CC,
                replyTo: configMail.cancel_order.from,
                subject: configMail.cancel_order.subject,
                html
            };
            const result = await this.sendMailSMTP(message);
            return result;
        } catch (err) {
            logError(err);
            console.log(err);
            return false;
        }
    }

    async sendEmailNotifyNewUserForSale(user) {
        try {
            const configMail = BaseHelper.fileToJSON(`${__dirname}/../languages/mails/vi.json`);
            let html = appConfig.EMAIL_NOTI_NEW_USER_TO_SALE;

            html = html.split('{{customer_name}}').join(user.fullname || '')
            html = html.replace('{{customer_phone}}', user.phone || '');
            html = html.replace('{{customer_email}}', user.email || '');
            html = html.replace('{{customer_code}}', user.code || '');

            const message = {
                from: configMail.notify_new_user.from,
                to: config.MAIL_MARKETING,
                replyTo: configMail.notify_new_user.from,
                subject: configMail.notify_new_user.subject,
                html
            };
            return await this.sendMailSMTP(message);
        } catch (err) {
            logError(err);
            console.log(err);
            return false;
        }
    }
}

module.exports = new MailService();
