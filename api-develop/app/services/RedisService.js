const redis = require('redis');
const config = require('config');

let client = null;

async function getConnection() {
    try {
        if (!client) {
            await new Promise((resolve, reject) => {
                client = redis.createClient({
                    host: config.redis.host,
                    port: config.redis.port,
                    password: config.redis.password,
                    connect_timeout: 5000,
                    retry_strategy: (options) => {
                        if (options.error && options.error.code === 'ECONNREFUSED') {
                            return new Error('The server refused the connection');
                        }
                        if (options.total_retry_time > 1000 * 60 * 60) {
                            return new Error('Retry time exhausted');
                        }
                        if (options.attempt > 10) {
                            return undefined;
                        }
                        return Math.min(options.attempt * 100, 3000);
                    }
                });

                client.on('connect', () => {
                    // console.log('connected Redis');
                    resolve(true);
                });
                client.on('error', (err) => {
                    client = null;
                    // logError(err);
                    reject(err);
                });
            });
        }

        return client;
    } catch (err) {
        logError(err);
    }
}

async function closeConnection(client) {
    client.quit();
}

async function getValue(client, keyId) {
    return new Promise(((resolve, reject) => {
        try {
            client.get(keyId, (err, reply) => {
                if (err)
                    reject(err);
                else
                    resolve(reply);
            });
        } catch (err) {
            logError(err);
        }
    }));
}

class RedisService {
    async add(key, value, exprireSecond = 86400) {
        try {
            const client = await getConnection();
            if (client) {
                client.set(key, value);
                client.expire(key, exprireSecond);
                closeConnection(client);
            }
        } catch (err) {
            logError(err);
        }
    }

    async resetValue(key, exprireSecond) {
        try {
            const curDate = new Date();
            const client = await getConnection();
            if (client.error) {
                client.set(key, curDate.getTime());
                client.expire(key, exprireSecond);
                closeConnection(client);
            }
        } catch (err) {
            logError(err);
        }
    }

    async removeValue(key) {
        try {
            const client = await getConnection();
            if (client) {
                client.del(key);
                closeConnection(client);
            }
        } catch (err) {
            logError(err);
        }
    }

    async getValueByKey(keyId) {
        try {
            const client = await getConnection();
            if (client) {
                const rs = await getValue(client, keyId);
                closeConnection(client);
                return rs;
            }
            return false;
        } catch (err) {
            // logError(err);
            return false;
        }
    }

    async flushdb(db) {
        try {
            const client = await getConnection();
            if (client) {
                client.select(db);
                client.flushdb();
                closeConnection(client);
            }
        } catch (err) {
            logError(err);
        }
    }
}

module.exports = new RedisService();
