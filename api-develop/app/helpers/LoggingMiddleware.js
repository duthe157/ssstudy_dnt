
const ActionLogModel = require('../models/ActionLog');

class LoggingMiddleware {
    constructor() {
        // URLs to skip logging (health checks, static files, etc.)
        this.skipUrls = [
            '/health',
            '/favicon.ico',
            '/static',
            '/hook/payment', // Skip payment hooks to avoid logging sensitive data
        ];

        // Sensitive fields to remove from request body
        this.sensitiveFields = [
            'password',
            'token',
            'authorization',
            'credit_card',
            'cvv',
            'card_number',
            'secret',
            'api_key',
        ];
    }

    shouldSkipLogging(url) {
        return this.skipUrls.some(skipUrl => url.includes(skipUrl));
    }

    sanitizeRequestBody(body) {
        if (!body || typeof body !== 'object') {
            return body;
        }

        const sanitized = { ...body };

        // Remove sensitive fields
        this.sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    getClientIp(req) {
        return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip ||
            'unknown';
    }

    async logAction(req, res, next) {
        // Skip if not authenticated or URL should be skipped
        if (!req.user || this.shouldSkipLogging(req.path)) {
            return next();
        }

        // Store original end function
        const originalEnd = res.end;
        const self = this;

        // Override res.end to capture response status
        res.end = function (...args) {
            // Restore original end function
            res.end = originalEnd;

            // Log action asynchronously (don't block response)
            setImmediate(async () => {
                try {
                    const logData = {
                        user_id: req.user.user_id,
                        user_info: {
                            id: req.user.user_id,
                            fullname: req.user.fullname || '',
                            email: req.user.email || '',
                            user_group: req.user.user_group || '',
                            code: req.user.code || '',
                        },
                        action_time: new Date(),
                        url: req.originalUrl || req.url,
                        method: req.method,
                        ip_address: self.getClientIp(req),
                        user_agent: req.headers['user-agent'] || '',
                        request_body: self.sanitizeRequestBody(req.body),
                        response_status: res.statusCode,
                        note: '',
                    };

                    await ActionLogModel.create(logData);
                } catch (err) {
                    // Log error but don't throw to avoid breaking the app
                    logError('LoggingMiddleware Error:', err);
                }
            });

            // Call original end function
            return originalEnd.apply(res, args);
        };

        next();
    }

    middleware() {
        return this.logAction.bind(this);
    }
}

module.exports = new LoggingMiddleware();
