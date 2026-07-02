const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");
const AutoIncrementService = require("../services/AutoIncrementService");
const { Schema } = mongoose;

const ChoiceSchema = new Schema(
  {
    label: String,
    text: String,
    rawHtml: String,
  },
  { _id: false },
);

class QuestionWord extends BaseModel {
  constructor() {
    const _name = "question_word";
    const attributes = {
      questionId: { type: String },
      searchId: String,
      rawHtml: String, // HTML thô của câu hỏi
      plainText: String,
      level: {
        type: String,
        enum: [
          "NHAN_BIET",
          "THONG_HIEU",
          "VAN_DUNG",
          "VAN_DUNG_CAO",
          "THONG_THUONG",
        ],
        required: true,
      },
      type: {
        type: String,
        enum: [
          "singlechoice",
          "truefalsemulti",
          "fillinblank",
          "dragdrop",
          "multiplechoice",
          "truefalse",
          "cluster",
        ],
        required: true,
      },

      choices: [ChoiceSchema],
      dragDropOptions: [String],
      correctAnswers: [
        {
          label: String,
          value: String,
          rawHtml: String,
        },
        { _id: false },
      ],
      cluster: [String],
      video: String,
      explanation: String,
      leadText: String,
      leadHtml: String,
      subject: String,
      parentId: String,
      deleted_at: Date,
    };

    const options = {
      collection: "question_words",
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
      versionKey: false,
    };

    const schema = new Schema(attributes, options);
    schema.pre("save", async function (next) {
      if (this.isNew && !this.searchId) {
        this.searchId = await AutoIncrementService.getNextSearchId(
          this.constructor,
          'searchId',
          1000
        );
      }
      next();
    });

    schema.pre('findOneAndUpdate', async function (next) {
      try {
        const update = this.getUpdate() || {};
        const hasSearchId =
          update.searchId !== undefined ||
          (update.$set && update.$set.searchId !== undefined);

        if (!hasSearchId) {
          const nextId = await AutoIncrementService.getNextSearchId(
            this.model,
            'searchId',
            1000
          );

          if (!update.$set) update.$set = {};
          update.$set.searchId = nextId;
          this.setUpdate(update);
        }
      } catch (e) { }

      next();
    });
    mongoose.model(_name, schema);
    super(_name, attributes, options, schema);
  }
}

module.exports = { model: new QuestionWord() };
