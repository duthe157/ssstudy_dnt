const mongoose = require("mongoose");

class AutoIncrementService {
  async getNextSequence(name) {
    const result = await mongoose.connection
      .collection("counters")
      .findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    return result.value.seq;
  }

  async setSequence(name, value) {
    await mongoose.connection
      .collection("counters")
      .updateOne(
        { _id: name },
        { $set: { seq: value } },
        { upsert: true }
      );
  }

  async rebuildSequence({
    model,
    field = "searchId",
    counterName,
    sortField = "createdAt",
    batchSize = 500,
  }) {
    console.log(`🚀 Rebuild ${field} (SAFE MODE)...`);

    // ❗ LUÔN RESET COUNTER
    let counter = 1;

    // ❗ QUÉT TOÀN BỘ (để sửa data sai trước đó)
    const cursor = model.db
      .find({})
      .sort({ [sortField]: 1 }) // đảm bảo thứ tự đúng
      .lean()
      .cursor();

    let bulkOps = [];
    let total = 0;

    for await (const doc of cursor) {
      const current = doc[field];

      // convert về number nếu có
      const num = Number(current);

      // ❗ detect lỗi
      if (current && isNaN(num)) {
        console.warn(`❌ Invalid ${field} at _id=${doc._id}:`, current);
      }

      // ❗ luôn set lại để đảm bảo đúng thứ tự
      bulkOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { [field]: String(counter++) } }, // giữ string nếu bạn cần
        },
      });

      if (bulkOps.length >= batchSize) {
        await model.db.bulkWrite(bulkOps);
        total += bulkOps.length;
        console.log(`✅ Updated: ${total}`);
        bulkOps = [];
      }
    }

    if (bulkOps.length) {
      await model.db.bulkWrite(bulkOps);
      total += bulkOps.length;
    }

    // sync counter
    await this.setSequence(counterName, counter - 1);

    console.log(`🎉 Rebuild DONE. Total: ${total}`);
  }

  async getNextSearchId(model, field = 'searchId', minBase = 1000) {
    if (!model) throw new Error('Invalid model passed to getNextSearchId');

    const pipeline = [
      { $match: { [field]: { $exists: true, $ne: null, $ne: '' } } },
      {
        $project: {
          v: {
            $convert: { input: `$${field}`, to: 'int', onError: null, onNull: null },
          },
        },
      },
      { $group: { _id: null, max: { $max: '$v' } } },
    ];

    try {
      // ✅ đúng: dùng trực tiếp model
      const agg = await model.aggregate(pipeline);

      const max = agg?.length ? agg[0].max : null;
      const maxNum = typeof max === 'number' && !isNaN(max) ? max : null;
      const base = maxNum && maxNum >= minBase ? maxNum : minBase;

      return String(base + 1);
    } catch (err) {
      // fallback
      const doc = await model
        .findOne({ [field]: { $exists: true, $ne: null, $ne: '' } })
        .sort({ [field]: -1 })
        .select(field)
        .lean();

      const parsed = doc ? parseInt(doc[field], 10) : NaN;
      const maxVal = !isNaN(parsed) ? parsed : null;
      const start = maxVal && maxVal >= minBase ? maxVal : minBase;

      return String(start + 1);
    }
  }

  async rebuildExamWordSearchId(ExamWord) {
    console.log(`🚀 Rebuild ExamWord search_id (bắt đầu từ 1)...`);

    try {
      let counter = 1;
      const batchSize = 500;

      // Lấy tất cả record (bao gồm cả deleted) theo thứ tự tạo
      const cursor = ExamWord.db
        .find({})
        .sort({ created_at: 1 })
        .lean()
        .cursor();

      let bulkOps = [];
      let total = 0;

      for await (const doc of cursor) {
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { search_id: `A${counter}` } },
          },
        });

        counter++;

        if (bulkOps.length >= batchSize) {
          await ExamWord.db.bulkWrite(bulkOps);
          total += bulkOps.length;
          console.log(`✅ Updated: ${total} records`);
          bulkOps = [];
        }
      }

      if (bulkOps.length) {
        await ExamWord.db.bulkWrite(bulkOps);
        total += bulkOps.length;
      }

      console.log(`🎉 Rebuild ExamWord search_id DONE. Total: ${total} records`);
      return { success: true, total };
    } catch (err) {
      console.error(`❌ Error rebuilding ExamWord search_id:`, err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new AutoIncrementService();