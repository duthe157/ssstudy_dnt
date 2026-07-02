const QuestionWord = require("../models/QuestionWord").model;
const appConfig = require('../../config/config');
const BaseHelper = require('../helpers/BaseHelper');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class QuestionWordController {
  async generateQuestionId(subject = "") {
    try {
      const lastQuestion = await QuestionWord.db
        .findOne({ subject: subject })
        .sort({ questionId: -1 })
        .select("questionId");

      if (!lastQuestion) {
        return `${subject}1`;
      }
      const currentNumber =
        parseInt(lastQuestion.questionId.replace(subject, "")) || 0;
      return `${subject}${currentNumber + 1}`;
    } catch (err) {
      console.error("Error generating question ID:", err);
      return `${subject}1`;
    }
  }

  async detail(req, res, params) {
    try {
      const id = params.id;
      if (!id) {
        return response(res, null, "Sai request", statusCode.ERROR);
      }
      const question = await QuestionWord.db.findOne({
        _id: id,
      });
      if (!question) {
        return response(res, null, "Câu hỏi không tồn tại!", statusCode.ERROR);
      }

      if (question.type === "cluster") {
        const childQuestions = [];
        let nextSearchId = parseInt(question.searchId) + 1;
        
        while (true) {
          const nextQuestion = await QuestionWord.db.findOne({
            searchId: nextSearchId.toString(),
            deleted_at: null,
          });

          if (!nextQuestion || !nextQuestion.parentId) {
            break;
          }

          childQuestions.push(nextQuestion);
          nextSearchId++;
        }

        return response(
          res,
          {
            ...question.toObject(),
            childQuestions: childQuestions,
          },
          "Lấy câu hỏi thành công!",
          statusCode.OK
        );
      }

      return response(res, question, "Lấy câu hỏi thành công!", statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async getBySubject(req, res) {
    try {
      const subject = req.body.subject;
      const question = QuestionWord.db.find({ subject: subject });
      if (!question) {
        return response(res, null, "Câu hỏi không tồn tại!", statusCode.ERROR);
      }
      return response(res, exam, "Lấy câu hỏi thành công!", statusCode.OK);
    } catch (err) {
      console.error(err);
    }
  }
  // API kiểm tra trùng câu hỏi
  async checkDuplicate(req, res) {
    try {
      const { plainText, choices, correctAnswers } = req.body;

      if (!plainText || !correctAnswers) {
        return res.status(400).json({
          success: false,
          message: "Thiếu plainText hoặc correctAnswers",
        });
      }

      // Tìm câu hỏi trùng
      const existedQuestion = await QuestionWord.findOne({
        plainText: plainText.trim(),
        correctAnswers: { $size: correctAnswers.length, $all: correctAnswers },
        ...(choices?.length
          ? {
            choices: {
              $size: choices.length,
              $all: choices.map((c) => ({
                label: c.label,
                text: c.text,
              })),
            },
          }
          : {}),
      });

      if (existedQuestion) {
        return res.status(200).json({
          success: true,
          duplicate: true,
          data: existedQuestion,
        });
      }

      return res.status(200).json({
        success: true,
        duplicate: false,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }
  async isDuplicateQuestion(
    plainText,
    choices,
    correctAnswers,
    excludeId = null
  ) {
    const query = {
      plainText: plainText.trim(),
      correctAnswers: { $size: correctAnswers.length, $all: correctAnswers },
    };

    if (choices?.length) {
      query.choices = {
        $size: choices.length,
        $all: choices.map((c) => ({
          label: c.label,
          text: c.text,
        })),
      };
    }

    if (excludeId) {
      query._id = { $ne: excludeId }; // loại trừ id khi update
    }

    const existedQuestion = await QuestionWord.findOne(query);
    return !!existedQuestion;
  }

  // Thêm mới
  async create(req, res) {
    try {
      const {
        rawHtml,
        plainText,
        type,
        level,
        choices,
        dragDropOptions,
        correctAnswers,
        explanation,
        leadText,
        leadHtml,
        subject,
      } = req.body;
      if (!rawHtml || !plainText || !type || !correctAnswers || !level) {
        return response(
          res,
          null,
          "Thiếu thông tin câu hỏi bắt buộc!",
          statusCode.ERROR
        );
      }

      // Generate unique question ID
      const questionId = await this.generateQuestionId(subject);

      const newQuestion = await QuestionWord.create({
        questionId,
        rawHtml,
        plainText,
        level,
        type,
        choices,
        dragDropOptions,
        correctAnswers,
        explanation,
        leadText,
        leadHtml,
        subject,
      });

      return response(
        res,
        {
          questionId: newQuestion.questionId,
          mongoId: newQuestion._id,
        },
        "Tạo câu hỏi thành công!",
        statusCode.OK
      );
    } catch (err) {
      console.log(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  // Sửa
  async update(req, res) {
    try {
      const {
        id,
        rawHtml,
        plainText,
        choices,
        correctAnswers,
        explanation,
        type,
      } = req.body;

      if (!id) {
        return response(res, null, "Thiếu ID câu hỏi!", statusCode.ERROR);
      }

      const existingQuestion = await QuestionWord.findOne({
        _id: id,
        deleted_at: null,
      });
      if (!existingQuestion) {
        return response(res, null, "Câu hỏi không tồn tại!", statusCode.ERROR);
      }

      // Nếu muốn kiểm tra trùng câu hỏi
      // const duplicate = await this.isDuplicateQuestion(plainText, choices, correctAnswers, type, explanation, id);
      // if (duplicate) {
      //     return res.status(400).json({ message: 'Câu hỏi này đã tồn tại trong hệ thống.' });
      // }

      // Chỉ cập nhật các field được cho phép
      const updateDoc = {
        plainText: plainText ?? existingQuestion.plainText,
        rawHtml: rawHtml ?? existingQuestion.rawHtml,
        choices: choices ?? existingQuestion.choices,
        correctAnswers: correctAnswers ?? existingQuestion.correctAnswers,
        explanation: explanation ?? existingQuestion.explanation,
        type: type ?? existingQuestion.type,
      };

      const updatedPart = await QuestionWord.updateOne(
        { _id: id },
        { $set: updateDoc }
      );
      if (!updatedPart || updatedPart.nModified === 0) {
        return response(
          res,
          null,
          "Cập nhật câu hỏi thất bại!",
          statusCode.ERROR
        );
      }
      return response(res, id, "Cập nhật câu hỏi thành công!", statusCode.OK);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
  async delete(req, res, params) {
    try {
      const id = params.id;
      const existingPart = await QuestionWord.findOne({
        _id: id,
        deleted_at: null,
      });
      if (!existingPart) {
        return response(res, null, "Câu hỏi không tồn tại!", statusCode.ERROR);
      }
      const result = await QuestionWord.softDelete({ _id: id });
      if (!result || result.nModified === 0) {
        return response(res, null, "Xóa câu hỏi thất bại!", statusCode.ERROR);
      }
      return response(res, id, "Xóa câu hỏi thành công!", statusCode.OK);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new QuestionWordController();
