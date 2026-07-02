const BookIdModel = require('../models/BookId');

let isRunning = false;

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function handleSuspension() {
  if (isRunning) {
    console.log('[SuspensionWorker] Skip - still running');
    return;
  }

  isRunning = true;

  try {
    const now = new Date();

    // ✅ 1. Lấy ALL book đã hết hạn (KHÔNG check status)
    const expiredBooks = await BookIdModel.db.find({
      suspension_date: { $lte: now }
    }).select('_id status');

    if (!expiredBooks.length) return;

    const expiredIds = expiredBooks.map(b => b._id);

    // ✅ 2. Update book đơn (chỉ update thằng còn true để tránh write thừa)
    const selfUpdate = await BookIdModel.updateMany(
      {
        _id: { $in: expiredIds },
        status: true
      },
      { $set: { status: false } }
    );

    // ✅ 3. Update combo (QUAN TRỌNG: luôn +chạy lại)
    const comboUpdate = await BookIdModel.updateMany(
      {
        bookId_attached: { $in: expiredIds },
        status: true
      },
      { $set: { status: false } }
    );

    console.log(
      `[SuspensionWorker] Self: ${selfUpdate.modifiedCount}, Combo: ${comboUpdate.modifiedCount}`
    );

  } catch (err) {
    console.error('[SuspensionWorker] Error:', err);
  } finally {
    isRunning = false;
  }
}

async function startSuspensionWorker() {
  console.log('[SuspensionWorker] Started');

  while (true) {
    console.log('[SuspensionWorker] Checking for suspended books...');
    await handleSuspension();
    await delay(60 * 1000);
  }
}

module.exports = { startSuspensionWorker };