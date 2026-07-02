const PayOS = require('@payos/node');
const { PAYOS } = require('./config');
const payOS = new PayOS(PAYOS.CLIENT_ID, PAYOS.API_KEY, PAYOS.CHECKSUM_KEY);
module.exports = payOS;
