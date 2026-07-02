const ExamWord = require("../models/ExamWord");
const BaseHelper = require("../helpers/BaseHelper");
const QuestionWord = require("../models/QuestionWord");
const BookModel = require("../models/BookId");
const ScoreWordHistory = require("../models/ScoreWordHistory");
const CategoryModel = require("../models/Category");
const ChapterModel = require("../models/Chapter");
const ClassroomModel = require("../models/Classroom");
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const SubjectModel = require("../models/Subject");
const UserModel = require("../models/User");
const StudentClassroomModel = require("../models/StudentClassroom");
const mongoose = require("mongoose");
const Subject = require("../models/Subject");
const CompetitionPart = require("../models/CompetitionPart");
const ExamCategory = require("../models/ExamCategory");
const FastGiftModel = require("../models/FastGift");
const { execSync } = require("child_process");
const cheerio = require("cheerio");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");


function htmlToLatex(html, imageDir) {
  if (!html || !html.trim()) {
    return "\n";
  }

  const $ = cheerio.load(html, {
    decodeEntities: false,
  });

  // ===== IMAGE =====
  handleImages($, imageDir);

  // ===== TABLE =====
  $("table").each((_, table) => {
    const md = convertTableToMarkdown($, table);

    $(table).replaceWith(`\n\n${md}\n\n`);
  });

  // ===== RENDER =====
  let result = renderChildren($.root(), $);

  // ===== SIMPLE MATH NORMALIZE =====
  result = normalizeMath(result);

  // ===== CLEANUP =====
  result = cleanupText(result);

  return result || "\n";
}
function normalizeMath(text) {
  if (!text) {
    return "";
  }
  let normalizeText = text
    .replace(/\\\\([a-zA-Z])/g, "\\$1")
    .replace(/\beq\b/g, " \\neq ")
    .replace(/\bleq\b/g, " \\leq ")
    .replace(/\bgeq\b/g, " \\geq ")

    .replace(
      /\\\(([\s\S]*?)\\\)/g,
      (_, inner) => `$${inner.trim()}$`
    )
    .replace(
      /\\\[([\s\S]*?)\\\]/g,
      (_, inner) => `$${inner.trim()}$`
    )
    .replace(/\\\\\s*\\\\/g, "\\\\")
    .replace(/\\\$/g, "$");
  normalizeText = mergeBrokenMathBlocks(normalizeText);
  return normalizeText;

}
function mergeBrokenMathBlocks(text) {
  let prev;

  do {
    prev = text;

    text = text.replace(
      /\$([^$]+)\$\s*\$([^$]+)\$/g,
      (_, a, b) => {
        return ` $${a}${b}$ `;
      }
    );
  } while (text !== prev);

  return text;
}
function handleImages($, imageDir) {
  $("img").each((_, img) => {
    const src = $(img).attr("src");

    if (!src) {
      $(img).replaceWith("\n");
      return;
    }

    // ===== BASE64 =====
    if (src.startsWith("data:image/")) {
      try {
        const matches = src.match(
          /^data:image\/([A-Za-z0-9+.-]+);base64,(.+)$/,
        );

        if (!matches) {
          $(img).replaceWith("\n");
          return;
        }

        let extension = matches[1].toLowerCase();

        if (extension === "jpeg") {
          extension = "jpg";
        }

        const buffer = Buffer.from(matches[2], "base64");

        const filename = `img_${crypto
          .randomBytes(8)
          .toString("hex")}.${extension}`;

        const filepath = path.join(imageDir, filename);

        fs.writeFileSync(filepath, buffer);

        const normalizedPath = filepath.replace(/\\/g, "/");

        $(img).replaceWith(`\n\n![](${normalizedPath}){ width=300px }\n\n`);
      } catch (e) {
        console.error("Image error:", e);

        $(img).replaceWith("\n");
      }

      return;
    }

    // ===== URL =====
    $(img).replaceWith(`\n\n![](${src}){ width=300px }\n\n`);
  });
}

/* =========================================================
   RENDER
========================================================= */

function renderChildren(parent, $) {
  let result = "";

  parent.contents().each((_, node) => {
    result += renderNode(node, $);
  });

  return result;
}

function renderNode(node, $) {
  if (!node) {
    return "";
  }

  // ===== TEXT =====
  if (node.type === "text") {
    return normalizeText(node.data || "");
  }

  // ===== COMMENT =====
  if (node.type === "comment") {
    return "";
  }

  // ===== NOT TAG =====
  if (node.type !== "tag") {
    return "";
  }

  const tag = (node.name || "").toLowerCase();

  switch (tag) {
    // =====================================================
    // BLOCK
    // =====================================================

    case "br":
      return "\n\n";

    case "hr":
      return "\n----------------\n";

    case "p":
    case "div": {
      const content = renderChildren($(node), $).trim();

      if (!content) {
        return "\n";
      }

      return `\n\n${content}\n\n`;
    }

    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const content = renderChildren($(node), $).trim();

      return content ? `\n\n${content}\n\n` : "";
    }

    // =====================================================
    // INLINE
    // =====================================================

    case "strong":
    case "b": {
      const content = renderChildren($(node), $).trim();

      return content ? `**${content}**` : "";
    }

    case "em":
    case "i": {
      const content = renderChildren($(node), $).trim();

      return content ? `*${content}*` : "";
    }

    case "u": {
      const content = renderChildren($(node), $).trim();

      return content
        ? `**${content}**`
        : "";
    }

    // =====================================================
    // LIST
    // =====================================================

    case "ul": {
      let output = "\n";

      $(node)
        .children("li")
        .each((_, li) => {
          output += `– Sai rồi ${renderChildren($(li), $).trim()}\n`;
        });

      return output + "\n";
    }

    case "ol": {
      let output = "\n";

      $(node)
        .children("li")
        .each((i, li) => {
          output += `${i + 1}. ${renderChildren($(li), $).trim()}\n`;
        });

      return output + "\n";
    }

    case "li":
      return renderChildren($(node), $);

    // =====================================================
    // TABLE
    // =====================================================

    case "table":
      return $(node).text();

    // =====================================================
    // DEFAULT
    // =====================================================

    default:
      return renderChildren($(node), $);
  }
}

function convertTableToMarkdown($, table) {
  const rows = [];

  $(table)
    .find("tr")
    .each((_, tr) => {
      const cols = [];

      $(tr)
        .find("th, td")
        .each((__, td) => {
          let text = $(td).text();

          text = normalizeText(text)
            .replace(/\n/g, " ")
            .replace(/\|/g, "\\|")
            .trim();

          cols.push(text);
        });

      if (cols.length) {
        rows.push(cols);
      }
    });

  if (!rows.length) {
    return "";
  }

  const header = rows[0];

  let md = "";

  md += `| ${header.join(" | ")} |\n`;
  md += `| ${header.map(() => "---").join(" | ")} |\n`;

  for (let i = 1; i < rows.length; i++) {
    md += `| ${rows[i].join(" | ")} |\n`;
  }

  return md;
}

function normalizeText(text) {
  if (!text) {
    return "";
  }

  return decodeEntities(text)
    .replace(/\r/g, "")
    .replace(/\u00A0/g, " ");
}

function cleanupText(text) {
  if (!text) {
    return "";
  }

  return text
    .replace(
      /\s*(\*{1,2}\s*)?(Giải chi tiết\s*:)(\s*\*{1,2})?/gi,
      "\n\n**$2**\n\n",
    )
    .replace(
      /\s*(\*{1,2}\s*)?(Giải thích\s*:)(\s*\*{1,2})?/gi,
      "\n\n**$2**\n\n",
    )
    .replace(
      /\s*(\*{1,2}\s*)?(Phương pháp\s*:)(\s*\*{1,2})?/gi,
      "\n\n**$2**\n\n",
    )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*-\s*/gm, "\n\n \u200B– ")
    .replace(/^\s*\+ \s*/gm, "\n\n \u200B✛ ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function decodeEntities(text) {
  if (!text) {
    return "";
  }

  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeLatexText(text) {
  if (!text) return "";

  const parts = [];
  let lastIndex = 0;
  // Khớp: $$ ... $$ hoặc $ ... $ (inline math) hoặc \includegraphics... hoặc \cmd{...}
  const mathOrCmdRegex =
    /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$|\\includegraphics[^\n]*|\\[a-zA-Z]+(?:\*?)(?:\{[^}]*\})*)/g;
  let match;

  while ((match = mathOrCmdRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "latex", value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts
    .map((p) => {
      if (p.type === "latex") return p.value;
      // Escape ký tự đặc biệt LaTeX trong vùng text thuần
      // Thứ tự quan trọng: \ trước tiên để không escape lại các replacement
      return p.value
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/#/g, "\\#")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/_/g, "\\_")
        .replace(/</g, "\\textless{}")
        .replace(/>/g, "\\textgreater{}");
    })
    .join("");
}

function escapeLatexArg(text) {
  if (!text) return "";
  return escapeLatexText(text);
}
function generateDots(text = "", options = {}) {
  const { minLines = 5, maxLines = 20, approxCharsPerLine = 120 } = options;

  let lines = minLines;

  if (text && text.trim() !== "") {
    const length = text.length;
    lines = Math.ceil(length / approxCharsPerLine);

    if (lines > maxLines) lines = maxLines;
    if (lines < minLines) lines = minLines;
  }
  const writingLine = [
    ``,
    `\`\`\`{=openxml}`,
    `<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>`,
    `<w:p><w:pPr>
     <w:spacing w:before="0" w:after="0" w:line="36" w:lineRule="auto"/>
     <w:pBdr>
       <w:bottom w:val="single" w:sz="1" w:space="1" w:color="000000"/>
     </w:pBdr>
   </w:pPr></w:p>`,

    `\`\`\``,
    ``,
  ].join("\n");

  return Array(lines).fill(writingLine).join("\n");
}
class ExamWordController {
  async detail(req, res, params) {
    try {
      const { id } = params;
      if (!id) return response(res, null, "Thiếu ID đề thi!", statusCode.ERROR);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return response(res, null, "ID đề thi không hợp lệ!", statusCode.ERROR);
      }

      const exam = await ExamWord.db
        .findOne({ _id: id, deleted_at: null })
        .populate({
          path: "parts.subpart.children.questions.question",
          model: "question_word",
        })
        .populate("categoryExam.populate_id");
      if (!exam) {
        return response(res, null, "Đề thi không tồn tại!", statusCode.ERROR);
      }

      return response(
        res,
        exam,
        "Lấy thông tin đề thi thành công!",
        statusCode.OK,
      );
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async list(req, res, params) {
    try {
      const body = params || req.body || {};
      const {
        page = 1,
        limit = 10,
        screen,
        subject_name,
        type_exam,
        classes,
        user_id,
        country,
        populate_id,
        keyword,
        have_done,
        exam_category,
        sort_key = "updated_at",
        sort_value = -1,
      } = body;
      const pageNum = Math.max(parseInt(page), 1);
      const limitNum = Math.max(parseInt(limit), 1);
      const skip = (pageNum - 1) * limitNum;
      const allowedSortFields = {
        id: "_id",
        name: "name",
        code: "code",
        subject: "subject.name",
        updated_at: "updated_at",
        created_at: "created_at",
      };

      let sortOptions = { updated_at: -1 };
      if (allowedSortFields[sort_key]) {
        sortOptions = {
          [allowedSortFields[sort_key]]:
            String(sort_value).toLowerCase() === "asc" || sort_value === 1
              ? 1
              : -1,
        };
      }

      const matchConditions = { deleted_at: null };
      if (keyword && keyword.trim()) {
        const trimmedKeyword = keyword.trim();
        const regex = new RegExp(trimmedKeyword, "i");
        matchConditions.$or = [
          {
            _id: mongoose.Types.ObjectId.isValid(trimmedKeyword)
              ? mongoose.Types.ObjectId(trimmedKeyword)
              : null,
          },
          { name: { $regex: regex } },
          { alias: { $regex: regex } },
          { code: { $regex: regex } },
          { "subject.name": { $regex: regex } },
        ];
      }
      if (classes) {
        matchConditions.classes = classes;
      }
      if (country) {
        matchConditions.tp = country;
      }
      if (screen) {
        matchConditions.group = screen;
        matchConditions["practiceConfig.status"] = { $ne: true };
      }
      if (subject_name) {
        matchConditions["subject.name"] = subject_name;
      }
      if (populate_id && mongoose.Types.ObjectId.isValid(populate_id)) {
        matchConditions["categoryExam.populate_id"] =
          mongoose.Types.ObjectId(populate_id);
      }
      if (type_exam) {
        matchConditions["categoryExam.type_exam"] = type_exam;
      }
      if (exam_category && mongoose.Types.ObjectId.isValid(exam_category)) {
        const examCategory = await ExamCategory.findOne(
          { _id: exam_category },
          null,
        );
        matchConditions.alias = examCategory.name;
        // matchConditions["categoryAssessment.id"] = exam_category;
      }
      const totalItems = await ExamWord.db.countDocuments(matchConditions);
      const exams = await ExamWord.db
        .find(matchConditions)
        .populate("categoryExam.populate_id")
        .populate("fast_gift.id")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean();

      let scoreHistories = [];
      if (user_id) {
        const user = await UserModel.findOne({ _id: user_id });
        if (!user) {
          return response(
            res,
            null,
            "Người dùng không tồn tại!",
            statusCode.ERROR,
          );
        }
        scoreHistories = await ScoreWordHistory.db.find({ user_id: user._id });
      }

      const data = exams
        .filter((exam) => {
          const userScoreHistory = scoreHistories.find(
            (history) => history.exam_id.toString() === exam._id.toString(),
          );
          const finished = !!userScoreHistory;
          if (have_done === true && !finished) {
            return false;
          }
          return true;
        })
        .map((exam) => {
          const totalQuestions = (exam.parts || []).reduce(
            (sum, part) => sum + (part.totalquestions || 0),
            0,
          );
          const userScoreHistory = scoreHistories.find(
            (history) => history.exam_id.toString() === exam._id.toString(),
          );
          const finished = !!userScoreHistory;

          return {
            id: exam._id,
            name: exam.name,
            is_redo: exam.is_redo,
            alias: exam.alias,
            exam_doc_link: exam.exam_doc_link,
            code: exam.code,
            subject: exam.subject,
            categoryExam: exam.categoryExam || [],
            total_questions: totalQuestions,
            updated_at: exam.updated_at,
            fast_gift: exam.fast_gift || null,
            finished: finished,
          };
        });

      return response(res, {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        data,
      });
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async listPractice(req, res, params) {
    try {
      const body = params || req.body || {};
      const {
        subject_name,
        type_exam,
        classes,
        user_id,
        country,
        populate_id,
        keyword,
        have_done,
        exam_category,
        sort_key = "updated_at",
        sort_value = -1,
        status,
      } = body;

      const allowedSortFields = {
        id: "_id",
        name: "name",
        code: "code",
        subject: "subject.name",
        updated_at: "updated_at",
        created_at: "created_at",
      };

      let sortOptions = { updated_at: -1 };
      if (allowedSortFields[sort_key]) {
        sortOptions = {
          [allowedSortFields[sort_key]]:
            String(sort_value).toLowerCase() === "asc" || sort_value === 1
              ? 1
              : -1,
        };
      }

      const matchConditions = {
        deleted_at: null,
        "practiceConfig.status": true,
      };
      if (keyword && keyword.trim()) {
        const trimmedKeyword = keyword.trim();
        const regex = new RegExp(trimmedKeyword, "i");
        matchConditions.$or = [
          {
            _id: mongoose.Types.ObjectId.isValid(trimmedKeyword)
              ? mongoose.Types.ObjectId(trimmedKeyword)
              : null,
          },
          { name: { $regex: regex } },
          { alias: { $regex: regex } },
          { code: { $regex: regex } },
          { "subject.name": { $regex: regex } },
        ];
      }
      if (classes) {
        matchConditions.classes = classes;
      }
      if (status) {
        if (status === "active") {
          matchConditions["practiceConfig.startDate"] = { $lte: new Date() };
          matchConditions["practiceConfig.endDate"] = { $gte: new Date() };
        } else if (status === "upcoming") {
          matchConditions["practiceConfig.startDate"] = { $gt: new Date() };
        } else if (status === "ended") {
          matchConditions["practiceConfig.endDate"] = { $lt: new Date() };
        }
      }
      if (country) {
        matchConditions.tp = country;
      }
      if (subject_name) {
        matchConditions["subject.name"] = subject_name;
      }
      if (populate_id && mongoose.Types.ObjectId.isValid(populate_id)) {
        matchConditions["categoryExam.populate_id"] =
          mongoose.Types.ObjectId(populate_id);
      }
      if (type_exam) {
        matchConditions["categoryExam.type_exam"] = type_exam;
      }
      if (exam_category && mongoose.Types.ObjectId.isValid(exam_category)) {
        const examCategory = await ExamCategory.findOne(
          { _id: exam_category },
          null,
        );
        matchConditions.alias = examCategory.name;
        // matchConditions["categoryAssessment.id"] = exam_category;
      }
      const totalItems = await ExamWord.db.countDocuments(matchConditions);
      const exams = await ExamWord.db
        .find(matchConditions)
        .populate("categoryExam.populate_id")
        .populate("fast_gift.id")
        .sort(sortOptions)
        .lean();

      let scoreHistories = [];
      if (user_id) {
        const user = await UserModel.findOne({ _id: user_id });
        if (!user) {
          return response(
            res,
            null,
            "Người dùng không tồn tại!",
            statusCode.ERROR,
          );
        }
        scoreHistories = await ScoreWordHistory.db.find({ user_id: user._id });
      }

      const data = exams
        .filter((exam) => {
          const userScoreHistory = scoreHistories.find(
            (history) => history.exam_id.toString() === exam._id.toString(),
          );
          const finished = !!userScoreHistory;
          if (have_done === true && !finished) {
            return false;
          }
          return true;
        })
        .map((exam) => {
          const totalQuestions = (exam.parts || []).reduce(
            (sum, part) => sum + (part.totalquestions || 0),
            0,
          );
          const userScoreHistory = scoreHistories.find(
            (history) => history.exam_id.toString() === exam._id.toString(),
          );
          const finished = !!userScoreHistory;
          const practiceConfig = {
            status: exam.practiceConfig?.status || false,
            startDate: exam.practiceConfig?.startDate || null,
            endDate: exam.practiceConfig?.endDate || null,
            result_display: exam.practiceConfig?.result_display || null,
            answer_display: exam.practiceConfig?.answer_display || null,
            required_passwword:
              exam.practiceConfig?.required_passwword || false,
          };
          return {
            id: exam._id,
            name: exam.name,
            is_redo: exam.is_redo,
            practiceConfig: practiceConfig,
            exam_doc_link: exam.exam_doc_link,
            alias: exam.alias,
            code: exam.code,
            subject: exam.subject,
            categoryExam: exam.categoryExam || [],
            total_questions: totalQuestions,
            updated_at: exam.updated_at,
            fast_gift: exam.fast_gift || null,
            finished: finished,
          };
        });

      return response(res, {
        totalItems,
        data,
      });
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async checkPassword(req, res, params) {
    try {
      const { exam_id, password } = params;
      if (!exam_id)
        return response(res, null, "Thiếu ID đề thi!", statusCode.ERROR);
      if (!mongoose.Types.ObjectId.isValid(exam_id)) {
        return response(res, null, "ID đề thi không hợp lệ!", statusCode.ERROR);
      }
      const exam = await ExamWord.db.findOne({
        _id: exam_id,
        deleted_at: null,
      });
      if (!exam) {
        return response(res, null, "Đề thi không tồn tại!", statusCode.ERROR);
      }

      if (exam.practiceConfig.password !== password) {
        return response(res, null, "Mật khẩu không đúng!", statusCode.OK);
      }

      return response(res, null, "Xác thực thành công!", statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async getById(req, res, params) {
    try {
      const { id } = params;
      if (!id) return response(res, null, "Thiếu ID đề thi!", statusCode.ERROR);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return response(res, null, "ID đề thi không hợp lệ!", statusCode.ERROR);
      }
      let exam = await ExamWord.db
        .findOne({ _id: id, deleted_at: null })
        .populate({
          path: "parts.subpart.children.questions.question",
          model: "question_word",
          select:
            "plainText rawHtml choices type questionId dragDropOptions parentId cluster fast_gift",
        })
        .populate("categoryExam.populate_id")
        .populate("fast_gift.id")
        .lean();
      if (!exam) {
        return response(res, null, "Đề thi không tồn tại!", statusCode.ERROR);
      }
      for (const part of exam.parts ?? []) {
        if (part.type === "NHOM_CHU_DE") {
          for (const subpart of part.subpart) {
            for (let child of subpart.children) {
              const subject = await SubjectModel.findOne({
                name: child.name,
              });
              if (subject) {
                child.classification =
                  subject.classification || "KHONG_XAC_DINH";
              }
            }
          }
        }
      }
      return response(res, exam, "Lấy đề thi thành công!", statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async create(req, res, params) {
    try {
      const {
        name,
        alias,
        group,
        subject,
        categoryExam,
        categoryAssessment,
        classes,
        time,
        parts,
        status,
        tp,
        month,
        is_redo,
        e_cheating,
        practiceConfig,
      } = params;
      let fast_gift = params.fast_gift;
      if (!name || !time) {
        return response(
          res,
          null,
          "Thiếu thông tin bắt buộc!",
          statusCode.ERROR,
        );
      }
      let scoreValue = 0;

      const processedParts = [];
      if (Array.isArray(parts)) {
        for (const part of parts) {
          if (!part?.name || !part?.subpart?.length) {
            continue;
          }
          if (part.type === "NHOM_CHU_DE") {
            scoreValue +=
              part.questions_score > 0
                ? part.questions_score * 50
                : (part.score / part.totalquestions) * 50 || 50;
          } else {
            scoreValue += part.score || 0;
          }
          const processedSubParts = [];

          for (const sp of part.subpart) {
            if (!sp?.name || !sp?.children?.length) {
              continue;
            }

            const processedChildren = [];

            for (const child of sp.children) {
              if (!child?.name || !child?.questions?.length) {
                continue;
              }

              const embeddedQuestions = [];
              for (const q of child.questions) {
                const questionData = {
                  questionId: q?.question?.questionId || "010",
                  type: q?.question?.type || "singlechoice",
                  level: q?.question?.level || "THONG_THUONG",
                  plainText: q?.question?.plainText || "",
                  dragDropOptions: Array.isArray(q?.question?.dragDropOptions)
                    ? q.question.dragDropOptions
                    : [],
                  rawHtml: q?.question?.rawHtml || "",
                  choices: Array.isArray(q?.question?.choices)
                    ? q.question.choices
                    : [],
                  correctAnswers: Array.isArray(q?.question?.correctAnswers)
                    ? q.question.correctAnswers
                    : [],
                  explanation: q?.question?.explanation || "",
                  parentId: q?.question?.parentId || null,
                  leadText: q?.question?.leadText || "",
                  leadHtml: q?.question?.leadHtml || "",
                  subject: q?.question?.subject || subject?.id || "",
                  cluster: Array.isArray(q?.question?.cluster)
                    ? q.question.cluster
                    : [],
                  video: q?.question?.video || "",
                  deleted_at: null,
                };

                const newQuestion =
                  await QuestionWord.model.db.create(questionData);
                embeddedQuestions.push({
                  question: newQuestion._id,
                  number: q.number,
                  isTestQuestion: q.isTestQuestion || false,
                });
              }

              processedChildren.push({
                time: child.time || 60,
                score: child.score || 10,
                subject_id: child.subject_id || "",
                name: child.name,
                questions: embeddedQuestions,
              });
            }

            processedSubParts.push({
              maxSubject: sp.maxSubject || 1,
              name: sp.name,
              subject_id: sp.subject_id || "",
              isMain: sp.isMain || false,
              children: processedChildren,
            });
          }

          processedParts.push({
            id: part.id || "010",
            maxGroup: part.maxGroup || 1,
            name: part.name,
            time: part.time || 0,
            score: part.score || 0,
            questions_score: part.questions_score || 0,
            type: part.type || "MAC_DINH",
            totalquestions:
              part.totalquestions ||
              processedSubParts.reduce((acc, sp) => {
                return (
                  acc +
                  sp.children.reduce((childAcc, c) => {
                    return (
                      childAcc +
                      (c.questions || []).filter((q) => q.type !== "cluster")
                        .length
                    );
                  }, 0)
                );
              }, 0),

            subpart: processedSubParts,
          });
        }
      }
      const subjects = await Subject.findOne({ _id: subject.id });
      const newsubject = subjects
        ? {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        }
        : {};
      if (
        practiceConfig &&
        practiceConfig.status &&
        practiceConfig.result_display === "LATER"
      ) {
        fast_gift = null;
      }
      let newExamId = null;

      const latest = await ExamWord.db
        .findOne({})
        .sort({ _id: -1 })
        .lean();
      let nextX = 1;
      if (latest?.search_id) {
        const numPart = latest.search_id.replace(/[^0-9]/g, '');
        const x = parseInt(numPart, 10);
        if (!isNaN(x)) {
          nextX = x + 1;
        }
      }
      newExamId = `A${nextX}`;

      const doc = {
        e_cheating,
        search_id: newExamId, 
        name,
        alias,
        group,
        score: scoreValue,
        classes,
        subject: newsubject,
        categoryExam,
        categoryAssessment,
        time,
        exam_doc_link: params.exam_doc_link || "",
        exam_doc_link2: params.exam_doc_link2 || "",
        parts: processedParts,
        status: status ?? true,
        tp,
        month,
        is_redo: Boolean(is_redo),
        practiceConfig,
        fast_gift: fast_gift,
      };

      const examWord = await ExamWord.create(doc);

      const result = await ExamWord.db.findOne({
        _id: examWord._id,
        deleted_at: null,
      });
      if (result && result.__v !== undefined) delete result.__v;

      return response(res, result, "Tạo đề thi thành công!", statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async clone(req, res, params) {
    try {
      const { id } = params;
      if (!id) {
        return response(res, null, "Thiếu ID đề thi!", statusCode.ERROR);
      }
      const examDoc = await ExamWord.findOne({ _id: id, deleted_at: null });
      if (!examDoc) {
        return response(
          res,
          null,
          "Không tìm thấy đề thi để sao chép!",
          statusCode.ERROR,
        );
      }
      const existingExam = examDoc.toObject();
      delete existingExam._id;
      let baseName = existingExam.name;
      let newName = `${baseName} - Copy`;
      const regex = new RegExp(`^${baseName} - Copy( \\(\\d+\\))?$`, "i");
      const copies = await ExamWord.db
        .find({ name: { $regex: regex }, deleted_at: null })
        .select("name");

      if (copies.length > 0) {
        let maxIndex = 0;
        copies.forEach((doc) => {
          const match = doc.name.match(/\((\d+)\)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxIndex) maxIndex = num;
          } else {
            if (maxIndex === 0) maxIndex = 0;
          }
        });
        newName = `${baseName} - Copy (${maxIndex + 1})`;
      }

      existingExam.name = newName;
      const newExam = await ExamWord.create(existingExam);

      return response(
        res,
        { exam: newExam },
        "Sao chép đề thi thành công!",
        statusCode.OK,
      );
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async update(req, res, params) {
    try {
      const {
        id,
        name,
        alias,
        subject,
        categoryExam,
        categoryAssessment,
        group,
        time,
        parts,
        status,
        tp,
        month,
        is_redo,
        classes,
        practiceConfig,
      } = params;
      let fast_gift = params.fast_gift;
      if (!id) return response(res, null, "Thiếu ID đề thi!", statusCode.ERROR);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return response(res, null, "ID đề thi không hợp lệ!", statusCode.ERROR);
      }
      let scoreValue = 0;

      const existingExam = await ExamWord.findOne({ _id: id });
      if (!existingExam)
        return response(res, null, "Đề thi không tồn tại!", statusCode.ERROR);

      let processedParts;
      if (Array.isArray(parts) && parts.length > 0) {
        processedParts = [];
        for (const part of parts) {
          if (!part?.name || !part?.subpart?.length) {
            continue;
          }
          if (part.type === "NHOM_CHU_DE") {
            scoreValue +=
              part.questions_score > 0
                ? part.questions_score * 50
                : (part.score / part.totalquestions) * 50 || 50;
          } else {
            scoreValue += part.score || 0;
          }
          const processedSubParts = [];
          for (const sp of part.subpart) {
            if (!sp?.name || !sp?.children?.length) {
              continue;
            }

            const processedChildren = [];
            for (const child of sp.children) {
              if (!child?.name || !child?.questions?.length) {
                continue;
              }

              const embeddedQuestions = [];
              for (const q of child.questions) {
                let questionId;
                let questionType;

                if (
                  q.question._id &&
                  mongoose.Types.ObjectId.isValid(q.question._id)
                ) {
                  const questionData = {
                    questionId: q.question.questionId,
                    type: q?.question?.type || "singlechoice",
                    level: q?.question?.level || "THONG_THUONG",
                    plainText: q?.question?.plainText || "",
                    rawHtml: q?.question?.rawHtml || "",
                    dragDropOptions: Array.isArray(q?.question?.dragDropOptions)
                      ? q.question.dragDropOptions
                      : [],
                    choices: Array.isArray(q?.question?.choices)
                      ? q.question.choices
                      : [],
                    correctAnswers: Array.isArray(q?.question?.correctAnswers)
                      ? q.question.correctAnswers
                      : [],
                    explanation: q?.question?.explanation || "",
                    leadText: q?.question?.leadText || "",
                    leadHtml: q?.question?.leadHtml || "",
                    parentId: q?.question?.parentId || null,
                    subject: q?.question?.subject || subject?.id || "",
                    cluster: q.question.cluster,
                    video: q?.question?.video || "",
                    updated_at: new Date(),
                  };
                  await QuestionWord.model.db.updateOne(
                    { _id: q.question._id },
                    { $set: questionData },
                  );
                  questionId = q.question._id;
                  questionType = q.question.type;
                } else {
                  const questionData = {
                    questionId: q?.question?.questionId || "010",
                    type: q?.question?.type || "singlechoice",
                    level: q?.question?.level || "THONG_THUONG",
                    plainText: q?.question?.plainText || "",
                    rawHtml: q?.question?.rawHtml || "",
                    dragDropOptions: Array.isArray(q?.question?.dragDropOptions)
                      ? q.question.dragDropOptions
                      : [],
                    choices: Array.isArray(q?.question?.choices)
                      ? q.question.choices
                      : [],
                    correctAnswers: Array.isArray(q?.question?.correctAnswers)
                      ? q.question.correctAnswers
                      : [],
                    explanation: q?.question?.explanation || "",
                    leadText: q?.question?.leadText || "",
                    leadHtml: q?.question?.leadHtml || "",
                    parentId: q?.question?.parentId || null,
                    subject: q?.question?.subject || subject?.id || "",
                    cluster: q.question.cluster,
                    video: q?.question?.video || "",
                    deleted_at: null,
                  };
                  const newQuestion =
                    await QuestionWord.model.db.create(questionData);
                  questionId = newQuestion._id;
                  questionType = newQuestion.type;
                }
                embeddedQuestions.push({
                  question: questionId,
                  type: questionType,
                  number: q.number,
                  isTestQuestion: q.isTestQuestion || false,
                });
              }

              processedChildren.push({
                time: child.time || 60,
                score: child.score || 10,
                name: child.name,
                subject_id: child.subject_id || "",
                questions: embeddedQuestions,
              });
            }

            processedSubParts.push({
              maxSubject: sp.maxSubject || 1,
              name: sp.name,
              isMain: sp.isMain || false,
              children: processedChildren,
            });
          }
          processedParts.push({
            id: part.id || "010",
            maxGroup: part.maxGroup || 1,
            name: part.name,
            time: part.time || 0,
            score: part.score || 0,
            questions_score: part.questions_score || 0,
            type: part.type || "MAC_DINH",
            totalquestions:
              part.totalquestions ||
              processedSubParts.reduce((acc, sp) => {
                return (
                  acc +
                  sp.children.reduce((childAcc, c) => {
                    return (
                      childAcc +
                      (c.questions || []).filter((q) => q.type !== "cluster")
                        .length
                    );
                  }, 0)
                );
              }, 0),

            subpart: processedSubParts,
          });
        }
      }

      const subjects = await Subject.findOne({ _id: subject.id });
      const newsubject = subjects
        ? {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        }
        : existingExam.subject;
      if (
        practiceConfig &&
        practiceConfig.status &&
        practiceConfig.result_display === "LATER"
      ) {
        fast_gift = null;
      }
      const updateDoc = {
        name: name ?? existingExam.name,
        e_cheating: params.e_cheating ?? existingExam.e_cheating,
        alias: alias ?? existingExam.alias,
        score: scoreValue || existingExam.score,
        group: group,
        exam_doc_link: params.exam_doc_link || existingExam.exam_doc_link,
        exam_doc_link2: params.exam_doc_link2 || existingExam.exam_doc_link2,
        classes,
        subject: newsubject,
        categoryExam: categoryExam ?? existingExam.categoryExam,
        categoryAssessment:
          categoryAssessment ?? existingExam.categoryAssessment,
        time: time ?? existingExam.time,
        status: status ?? existingExam.status,
        tp: tp ?? existingExam.tp,
        month: month ?? existingExam.month,
        is_redo: is_redo ?? existingExam.is_redo,
        practiceConfig: practiceConfig ?? existingExam.practiceConfig,
        fast_gift: fast_gift,
      };

      if (processedParts) updateDoc.parts = processedParts;

      await ExamWord.updateOne({ _id: id }, { $set: updateDoc });

      const result = await ExamWord.db.findOne({ _id: id, deleted_at: null });
      if (result && result.__v !== undefined) delete result.__v;

      return response(
        res,
        result,
        "Cập nhật đề thi thành công!",
        statusCode.OK,
      );
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async delete(req, res, params) {
    try {
      const { id } = params;
      if (!id) {
        return response(res, null, "Thiếu ID đề thi!", statusCode.ERROR);
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return response(res, null, "ID đề thi không hợp lệ!", statusCode.ERROR);
      }

      const existingExam = await ExamWord.findOne({
        _id: id,
        deleted_at: null,
      });
      if (!existingExam) {
        return response(res, null, "Đề thi không tồn tại!", statusCode.ERROR);
      }

      await ExamWord.softDelete({ _id: id });
      return response(res, null, "Xóa đề thi thành công!", statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async report(req, res, params) {
    try {
      const examID = params.id || null;
      const classroomID = params.classroom_id || null;
      if (!examID)
        return response(res, {}, "Request không hợp lệ!", statusCode.ERROR);
      const exam = await ExamWord.db
        .findOne({ _id: examID, deleted_at: null })
        .populate({
          path: "parts.subpart.children.questions.question",
          model: "question_word",
        });

      if (!exam)
        return response(res, {}, "Đề thi không tồn tại!", statusCode.ERROR);
      let conditions = { deleted_at: null, exam_id: examID };
      // if (exam.group !== "THI_THU" && classroomID) {
      //   conditions.classroom_id = String(classroomID);
      // }

      const options = { sort: { total_score_achieve: -1 } };
      const testings = await ScoreWordHistory.db
        .find(conditions, null, options)
        .lean();
      let avgPoint = 0,
        totalPoint = 0;
      let PR1 = 0,
        PR2 = 0,
        PR3 = 0,
        PR4 = 0,
        PR0 = 0;

      const M = exam.score || 100;
      const x = M / 10;
      const findDelta = (x) => {
        let k = Math.floor(Math.log10(x));
        let normalized = x / Math.pow(10, k);

        let delta;
        if (normalized <= 1) {
          delta = 1;
        } else if (normalized <= 2) {
          delta = 2;
        } else if (normalized <= 5) {
          delta = 5;
        } else {
          delta = 10;
          k++;
        }

        return delta * Math.pow(10, k);
      };

      const delta = findDelta(x);

      const roundToMultiple = (value, multiple) => {
        return Math.round(value / multiple) * multiple;
      };

      const m = roundToMultiple((2 * M) / 3, delta);

      const t1 = m - delta;
      const t2 = m;
      const t3 = m + delta;

      const scoreLvl = {
        LEVEL_1: Math.max(0, t1),
        LEVEL_2: t2,
        LEVEL_3: t3,
      };

      for (let t of testings) {
        totalPoint += t.total_score_achieve || 0;
        if (t.total_score_achieve < scoreLvl.LEVEL_1) PR1++;
        else if (t.total_score_achieve <= scoreLvl.LEVEL_2) PR2++;
        else if (t.total_score_achieve <= scoreLvl.LEVEL_3) PR3++;
        else PR4++;
      }
      PR0 = testings.length - (PR1 + PR2 + PR3 + PR4);
      if (testings.length > 0) avgPoint = totalPoint / testings.length;

      let students = [];
      if (exam.group !== "THI_THU") {
        students = await StudentClassroomModel.db
          .find({
            "classroom.id": classroomID,
            deleted_at: null,
          })
          .lean();
      }
      if (students.length > 0) {
        for (let s of students) {
          const user = await UserModel.db.findOne({ _id: s.user.id }).lean();

          s.user = user || null;
          s.user.id = user ? user._id : null;
        }
      }
      let allQuestions = [];
      let examStructure = [];

      for (const part of exam.parts || []) {
        let partQuestions = [];
        let partSubparts = [];

        for (const sp of part.subpart || []) {
          let subpartQuestions = [];
          let subpartChildren = [];

          for (const child of sp.children || []) {
            let childQuestions = [];

            for (const q of child.questions || []) {
              if (q.question) {
                if (q.question?.type === "cluster") {
                  continue;
                }
                const questionData = {
                  _id: q.question._id,
                  questionId: q.question.questionId,
                  number: q.number,
                  partName: part.name,
                  subpartName: sp.name,
                  childName: child.name,
                };

                allQuestions.push(questionData);
                childQuestions.push(questionData);
                subpartQuestions.push(questionData);
                partQuestions.push(questionData);
              }
            }

            subpartChildren.push({
              name: child.name,
              questions: childQuestions,
              totalQuestions: childQuestions.length,
              hasQuestions: childQuestions.length > 0,
            });
          }

          partSubparts.push({
            name: sp.name,
            children: subpartChildren,
            questions: subpartQuestions,
            totalQuestions: subpartQuestions.length,
            hasQuestions: subpartQuestions.length > 0,
          });
        }

        examStructure.push({
          name: part.name,
          subparts: partSubparts,
          questions: partQuestions,
          totalQuestions: partQuestions.length,
          hasQuestions: partQuestions.length > 0,
        });
      }

      let questionsResult = [];
      let questionStats = {};

      for (const t of testings) {
        if (t.user_id) {
          const user = await UserModel.findOne({ _id: t.user_id });
          t.user_email = user ? user.email : "N/A";
          t.user_phone = user ? user.phone : "N/A";
          t.user_code = user ? user.code : "N/A";
        }

        for (const ql of t.question_logs || []) {
          const found = allQuestions.find(
            (q) => q._id.toString() === ql.question_id.toString(),
          );
          if (found) {
            const ques_rs = {
              questionId: found.questionId,
              user_answer: ql.user_name,
              correct_answer: ql.correct_answer,
              score: ql.score,
              partName: found.partName,
              subpartName: found.subpartName,
              childName: found.childName,
            };
            questionsResult.push(ques_rs);
            if (!questionStats[ql.question_id]) {
              questionStats[ql.question_id] = { correct: 0, wrong: 0 };
            }
            if (ql.score > 0) {
              questionStats[ql.question_id].correct++;
            } else {
              questionStats[ql.question_id].wrong++;
            }
          }
        }
      }

      const questionSummary = examStructure
        .filter((part) => part.hasQuestions)
        .map((part) => {
          const partSubparts = part.subparts
            .filter((subpart) => subpart.hasQuestions)
            .map((subpart) => {
              const subpartChildren = subpart.children
                .filter((child) => child.hasQuestions)
                .map((child) => {
                  const childQuestionStats = child.questions.map((q) => {
                    const stat = questionStats[q._id] || {
                      correct: 0,
                      wrong: 0,
                    };
                    return {
                      _id: q._id,
                      questionId: q.questionId,
                      number: q.number,
                      correct: stat.correct,
                      wrong: stat.wrong,
                    };
                  });

                  return {
                    name: child.name,
                    questions: childQuestionStats,
                    totalQuestions: childQuestionStats.length,
                    totalCorrect: childQuestionStats.reduce(
                      (sum, q) => sum + q.correct,
                      0,
                    ),
                    totalWrong: childQuestionStats.reduce(
                      (sum, q) => sum + q.wrong,
                      0,
                    ),
                  };
                });

              const subpartQuestionStats = subpart.questions.map((q) => {
                const stat = questionStats[q._id] || { correct: 0, wrong: 0 };
                return {
                  _id: q._id,
                  questionId: q.questionId,
                  correct: stat.correct,
                  wrong: stat.wrong,
                };
              });

              return {
                name: subpart.name,
                isMain: subpart.isMain,
                children: subpartChildren,
                questions: subpartQuestionStats,
                totalQuestions: subpartQuestionStats.length,
                totalCorrect: subpartQuestionStats.reduce(
                  (sum, q) => sum + q.correct,
                  0,
                ),
                totalWrong: subpartQuestionStats.reduce(
                  (sum, q) => sum + q.wrong,
                  0,
                ),
              };
            });

          const partQuestionStats = part.questions.map((q) => {
            const stat = questionStats[q._id] || { correct: 0, wrong: 0 };
            return {
              _id: q._id,
              questionId: q.questionId,
              correct: stat.correct,
              wrong: stat.wrong,
            };
          });

          return {
            name: part.name,
            subparts: partSubparts,
            questions: partQuestionStats,
            totalQuestions: partQuestionStats.length,
            totalCorrect: partQuestionStats.reduce(
              (sum, q) => sum + q.correct,
              0,
            ),
            totalWrong: partQuestionStats.reduce((sum, q) => sum + q.wrong, 0),
          };
        });

      const data = {
        type: exam.group,
        testings,
        students,
        total_student: students.length,
        avg_point: Math.round(avgPoint),
        total_testing: testings.length,
        testing_questions: questionsResult,
        question_summary: questionSummary,
        PR1: { name: "Nhỏ hơn " + scoreLvl.LEVEL_1, value: PR1 },
        PR2: {
          name: "Từ " + scoreLvl.LEVEL_1 + " - " + scoreLvl.LEVEL_2,
          value: PR2,
        },
        PR3: {
          name: "Từ " + scoreLvl.LEVEL_2 + " - " + scoreLvl.LEVEL_3,
          value: PR3,
        },
        PR4: { name: "Lớn hơn " + scoreLvl.LEVEL_3, value: PR4 },
        PR0: { name: "Chưa làm", value: PR0 },
      };

      return response(res, data, "Thành công", statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(
        res,
        {},
        language?.PROCESS_ERROR || "Lỗi xử lý",
        statusCode.ERROR,
      );
    }
  }

  async scoring(req, res, params) {
    try {
      const examId = params.exam_id;
      const userId = req.user?.user_id || null;
      const questionsAnswer = Array.isArray(params.answers)
        ? params.answers
        : [];
      const subjectExam = params.subject || [];
      let timeDoing = Number(params.time_doing) || 0;
      if (timeDoing > 0 && timeDoing < 1) timeDoing = 1;

      if (!examId) {
        return response(
          res,
          null,
          "Thiếu thông tin bài thi!",
          statusCode.ERROR,
        );
      }

      const examDb = await ExamWord.db
        .findOne({ _id: examId, deleted_at: null })
        .populate({
          path: "parts.subpart.children.questions.question",
          model: "question_word",
        });

      if (!examDb)
        return response(res, null, "Đề thi không tồn tại!", statusCode.ERROR);
      const categoryExam = await CompetitionPart.findOne({
        _id: examDb.categoryExam.populate_id,
        deleted_at: null,
      });

      if (!categoryExam) {
        return response(
          res,
          null,
          "Loại đề thi không hợp lệ!",
          statusCode.ERROR,
        );
      }

      const pointTrueFalse = categoryExam.point_true_false || null;

      const normalizeType = (val) => {
        if (!val) return "";
        return String(val)
          .trim()
          .toLowerCase()
          .replace(/[\s_-]+/g, "");
      };

      const normalizeAnswer = (val) => {
        if (val === null || val === undefined) return "";
        let normalized = val;
        const str = String(val).trim().toLowerCase();
        normalized = str.replace(/,/g, ".");

        if (["đúng", "true", "t", "đ"].includes(str)) {
          normalized = "true";
        } else if (["sai", "false", "f", "s"].includes(str)) {
          normalized = "false";
        }

        return normalized;
      };

      const parseCorrectAnswers = (correctAnswers) => {
        const answerGroups = [];

        for (const answer of correctAnswers) {
          const value = answer.value || answer.label || "";
          if (value.includes("|")) {
            const alternatives = value
              .split("|")
              .map((alt) => alt.trim())
              .filter((alt) => alt !== "");
            answerGroups.push(alternatives);
          } else {
            answerGroups.push([value]);
          }
        }

        return answerGroups;
      };

      const checkUserAnswerMatchOrdered = (userAnswers, answerGroups) => {
        const normUser = userAnswers
          .filter((v) => v !== null && v !== undefined && v !== "")
          .map((v) => normalizeAnswer(v));

        if (normUser.length !== answerGroups.length) {
          return { isCorrect: false, matchCount: 0 };
        }

        let matchCount = 0;

        for (let i = 0; i < normUser.length; i++) {
          const userAns = normUser[i];
          const currentGroup = answerGroups[i];

          const normGroup = currentGroup
            .filter((v) => v !== null && v !== undefined && v !== "")
            .map((v) => normalizeAnswer(v));

          if (normGroup.includes(userAns)) {
            matchCount++;
          }
        }

        const isCorrect = matchCount === answerGroups.length;

        return { isCorrect, matchCount };
      };

      const checkUserAnswerMatch = (userAnswers, answerGroups) => {
        const normUser = userAnswers
          .filter((v) => v !== null && v !== undefined && v !== "")
          .map((v) => {
            const normalized = normalizeAnswer(v);

            return normalized;
          });
        if (normUser.length > answerGroups.length) {
          return { isCorrect: false, matchCount: 0 };
        }

        let matchCount = 0;

        for (const userAns of normUser) {
          let foundInGroup = false;

          for (const group of answerGroups) {
            const normGroup = group
              .filter((v) => v !== null && v !== undefined && v !== "")
              .map((v) => normalizeAnswer(v));
            if (normGroup.includes(userAns)) {
              foundInGroup = true;
              break;
            }
          }

          if (foundInGroup) {
            matchCount++;
          } else {
            return { isCorrect: false, matchCount: 0 };
          }
        }

        const isCorrect = matchCount > 0 && matchCount === normUser.length;
        return { isCorrect, matchCount };
      };

      let userName = "Khách";
      let userCode = "";
      if (userId) {
        const user = await UserModel.findOne({ _id: userId });
        if (user) {
          userName = user.fullname;
          userCode = user.code;
        }
      }

      let totalPartQuestion = 0;
      let totalExamPointFromParts = 0;
      let totalExamQuestionFromParts = 0;
      let hasQuestionsScore = false;
      let subjectSkipTestQuestion = "";
      async function scoringNhomChuDe() {
        let totalClassification = [];
        for (const nameSubject of subjectExam) {
          const subject = await SubjectModel.findOne({ name: nameSubject });
          const classification = subject
            ? subject.classification
            : "KHONG_XAC_DINH";
          totalClassification.push({
            name: nameSubject,
            classification: classification,
          });
        }

        const classificationCount = totalClassification.reduce((acc, item) => {
          acc[item.classification] = (acc[item.classification] || 0) + 1;
          return acc;
        }, {});

        const uniqueClassification = Object.keys(classificationCount).find(
          (key) => classificationCount[key] === 1,
        );

        if (
          totalClassification.length === 3 &&
          totalClassification[0].classification ===
          totalClassification[1].classification &&
          totalClassification[1].classification ===
          totalClassification[2].classification
        ) {
          return totalClassification[2];
        }

        const differentItem = totalClassification.find(
          (item) => item.classification === uniqueClassification,
        );
        return differentItem || "";
      }
      subjectSkipTestQuestion = await scoringNhomChuDe();
      for (const part of examDb.parts) {
        let isSubjectGroup = false;
        isSubjectGroup = part.type === "NHOM_CHU_DE";
        if (isSubjectGroup) {
          if (!subjectExam) {
            return response(
              res,
              null,
              "Thiếu thông tin môn thi!",
              statusCode.ERROR,
            );
          }
          part.questions_score =
            part.questions_score > 0
              ? part.questions_score
              : part.score / part.totalquestions || 1;
          hasQuestionsScore = true;
          totalPartQuestion = 50;
          part.score = part.questions_score * totalPartQuestion;
          totalExamPointFromParts += part.score;
        }
        if (
          part.questions_score &&
          part.questions_score > 0 &&
          !isSubjectGroup
        ) {
          hasQuestionsScore = true;
          let partQuestionCount = 0;
          for (const subpart of part.subpart) {
            for (const child of subpart.children) {
              partQuestionCount += child.questions.filter(
                (qRef) => qRef.question && qRef.question.type !== "cluster",
              ).length;
            }
          }
          totalPartQuestion = part.totalquestions;
          totalExamPointFromParts += part.questions_score * partQuestionCount;
        }
        if (
          part.score &&
          part.score > 0 &&
          !isSubjectGroup &&
          (!part.questions_score || part.questions_score === 0)
        ) {
          hasQuestionsScore = true;
          part.questions_score = part.score / part.totalquestions;
          totalExamPointFromParts += part.score;
          totalPartQuestion = part.totalquestions;
        }
        totalExamQuestionFromParts += totalPartQuestion;
      }

      const finalExamPoint = hasQuestionsScore
        ? totalExamPointFromParts
        : examDb.score || totalPartQuestion;
      const pointPerQuestion =
        totalPartQuestion > 0 ? finalExamPoint / totalPartQuestion : 0;

      let totalScoreAchieve = 0;
      let questionLogs = [];
      let examSections = [];
      for (const part of examDb.parts) {
        let childLogs = [];
        let isSubjectGroup = false;
        isSubjectGroup = part.type === "NHOM_CHU_DE";
        let partTotalQ = 0;
        let partCorrect = 0;
        let partScoreAchieve = 0;
        let totalQuestionPart = part.totalquestions;
        const partQuestionScore =
          part.questions_score && part.questions_score > 0
            ? part.questions_score
            : pointPerQuestion;
        for (const subpart of part.subpart) {
          for (const child of subpart.children) {
            let totalScoreChildAchieve = 0;
            if (!subjectExam.includes(child.name) && isSubjectGroup) {
              continue;
            }
            let totalChildQuestion = 0;
            for (const qRef of child.questions) {
              const q = qRef.question;
              if (!q) {
                console.log("lõi");
                continue;
              }
              if (q.type === "cluster") continue;
              totalChildQuestion++;
              if (
                isSubjectGroup &&
                qRef.isTestQuestion === true &&
                subjectSkipTestQuestion.name === child.name
              ) {
                questionLogs.push({
                  question_id: q._id,
                  question_text: q.plainText,
                  score: 0,
                  user_answer: [],
                  correct_answer: q.correctAnswers,
                  is_test_question: true,
                });
                totalChildQuestion--;
                continue;
              }
              partTotalQ++;

              const qType = normalizeType(q.type);
              const isTrueFalse = ["truefalse", "truefalsemulti"].includes(
                qType,
              );
              const isFillInBlank = ["fillinblank", "dragdrop"].includes(qType);
              const qId = q._id.toString();
              const userAnswer = questionsAnswer.find(
                (a) => a.question_id.toString() === qId,
              );

              let score = 0;
              let isCorrect = false;
              let userLabels = [];
              if (
                userAnswer &&
                Array.isArray(userAnswer.answer) &&
                userAnswer.answer.length > 0
              ) {
                userLabels = userAnswer.answer;
              }

              if (userLabels.length > 0) {
                const answerGroups = parseCorrectAnswers(q.correctAnswers);

                if (isFillInBlank) {
                  if (answerGroups.length > 0) {
                    const { isCorrect: userIsCorrect, matchCount } =
                      checkUserAnswerMatchOrdered(userLabels, answerGroups);

                    isCorrect = userIsCorrect;
                    score = isCorrect ? partQuestionScore : 0;
                  }
                } else if (isTrueFalse && answerGroups.length > 0) {
                  if (qType === "truefalsemulti") {
                    const { isCorrect: userIsCorrect, matchCount } =
                      checkUserAnswerMatchOrdered(userLabels, answerGroups);
                    if (
                      pointTrueFalse &&
                      pointTrueFalse[String(matchCount)] !== undefined
                    ) {
                      const percentage = pointTrueFalse[String(matchCount)];
                      score = (percentage / 100) * partQuestionScore;
                    } else {
                      const ratio = matchCount / answerGroups.length;
                      score = ratio * partQuestionScore;
                    }

                    isCorrect = score > 0;
                  } else {
                    const { isCorrect: userIsCorrect } = checkUserAnswerMatch(
                      userLabels,
                      answerGroups,
                    );
                    isCorrect = userIsCorrect;
                    score = isCorrect ? partQuestionScore : 0;
                  }
                } else {
                  const { isCorrect: userIsCorrect } = checkUserAnswerMatch(
                    userLabels,
                    answerGroups,
                  );
                  isCorrect = userIsCorrect;
                  score = isCorrect ? partQuestionScore : 0;
                }
              }

              if (isCorrect) {
                totalScoreChildAchieve++;
                partCorrect++;
              }

              totalScoreAchieve += score;
              partScoreAchieve += score;
              questionLogs.push({
                question_id: q._id,
                question_text: q.plainText,
                score: Number(score.toFixed(2)),
                is_test_question: qRef.isTestQuestion,
                user_answer: userLabels,
                correct_answer: q.correctAnswers,
              });
            }
            childLogs.push({
              child_name: child.name,
              total_question: totalChildQuestion,
              total_child_point: partQuestionScore * totalChildQuestion,
              score_achieve: partQuestionScore * totalScoreChildAchieve,
              correct: totalScoreChildAchieve,
              subpart_name: subpart.name,
              isMain: subpart.isMain || false,
              wrong: totalChildQuestion - totalScoreChildAchieve,
            });
          }
        }
        examSections.push({
          part_name: part.name || "Phần",
          total_question: totalQuestionPart,
          part_type: part.type,
          correct: partCorrect,
          wrong: totalQuestionPart - partCorrect,
          total_point: part.score,
          score_achieve: Number(partScoreAchieve.toFixed(2)),
          childLogs: childLogs,
        });
      }
      const userExamRecord = await ScoreWordHistory.db.findOne({
        user_id: userId,
        exam_id: examId,
      });
      if (!userExamRecord) {
        await ScoreWordHistory.create({
          user_id: userId,
          user_code: userCode,
          user_name: userName,
          exam_id: examId,
          exam_name: examDb.name,
          type: examDb.group || null,
          time_doing: Math.round(timeDoing),
          ques_answer_doing: questionsAnswer.length,
          total_score_achieve: Number(totalScoreAchieve.toFixed(2)),
          total_exam_point: finalExamPoint,
          total_question: totalExamQuestionFromParts,
          exam_section: examSections,
          question_logs: questionLogs,
        });
      }
      let giftImage = null;
      let giftCTA = null;
      let giftUrl = null;
      let canCheckGift = false;

      if (examDb.group === "MAC_DINH") {
        canCheckGift = true;
      }
      if (examDb.group === "THI_THU") {
        const practiceConfig = examDb.practiceConfig;
        if (practiceConfig?.status) {
          if (practiceConfig?.result_display === "IMMEDIATELY") {
            canCheckGift = true;
          } else {
            canCheckGift = false;
          }
        } else {
          canCheckGift = true;
        }
      }
      if (!canCheckGift || !examDb.fast_gift?.id) {
        giftImage = null;
      } else {
        const gift = await FastGiftModel.db.findOne({
          _id: examDb.fast_gift.id,
        });
        if (gift && Array.isArray(gift.score_rule)) {
          const matchedRule = gift.score_rule.find(
            (rule) =>
              typeof totalScoreAchieve === "number" &&
              totalScoreAchieve >= rule.min_score &&
              totalScoreAchieve <= rule.max_score,
          );
          if (matchedRule) {
            giftCTA = gift.call_to_action;
            giftUrl = gift.url_redirect;
            giftImage = matchedRule.image;
          }
        }
      }
      return response(
        res,
        {
          total_score_achieve: Number(totalScoreAchieve.toFixed(2)),
          total_exam_point: finalExamPoint,
          total_question: totalExamQuestionFromParts,
          exam_section: examSections,
          gift_image: giftImage,
          gift_url: giftUrl,
          gift_CTA: giftCTA,
        },
        "Chấm điểm thành công!",
        statusCode.OK,
      );
    } catch (err) {
      console.error(err);
      return response(res, {}, language.ERROR, statusCode.ERROR);
    }
  }

  async explanation(req, res, params) {
    try {
      const { id } = params;
      if (!id) {
        return response(res, null, "Thiếu ID", statusCode.ERROR);
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return response(res, null, "ID không hợp lệ!", statusCode.ERROR);
      }

      let exam = await ExamWord.db
        .findOne({ _id: id, deleted_at: null })
        .populate({
          path: "parts.subpart.children.questions.question",
          model: "question_word",
        })
        .populate("categoryExam.populate_id")
        .lean({ virtuals: true });
      if (!exam) {
        return response(res, null, "Đề thi không tồn tại!", statusCode.ERROR);
      }
      const normalizeAnswer = (val) => {
        if (val === null || val === undefined) return "";
        let normalized = val;
        const str = String(val).trim().toLowerCase();
        normalized = str.replace(/,/g, ".");

        if (["đúng", "true", "t", "đ"].includes(str)) {
          normalized = "true";
        } else if (["sai", "false", "f", "s"].includes(str)) {
          normalized = "false";
        }

        return normalized;
      };
      for (const part of exam.parts ?? []) {
        if (part.type === "NHOM_CHU_DE") {
          for (const subpart of part.subpart ?? []) {
            for (const child of subpart.children ?? []) {
              const subject = await SubjectModel.findOne({
                name: child.name,
              });

              if (subject) {
                child.classification =
                  subject.classification || "KHONG_XAC_DINH";
              }
              for (const q of child.questions ?? []) {
                const question = q.question;
                if (question?.correctAnswers?.length) {
                  question.correctAnswers = question.correctAnswers.map(
                    (ans) => ({
                      ...ans,
                      value: normalizeAnswer(ans.value),
                    }),
                  );
                }
              }
            }
          }
        } else {
          for (const subpart of part.subpart ?? []) {
            for (const child of subpart.children ?? []) {
              for (const q of child.questions ?? []) {
                const question = q.question;
                if (question?.correctAnswers?.length) {
                  question.correctAnswers = question.correctAnswers.map(
                    (ans) => ({
                      ...ans,
                      value: normalizeAnswer(ans.value),
                    }),
                  );
                }
              }
            }
          }
        }
      }
      const data = {
        exam: exam,
      };

      return response(res, data, "Thành công", statusCode.OK);
    } catch (err) {
      console.error("Error in explanation:", err);
      return response(res, null, language.ERROR, statusCode.ERROR);
    }
  }

  async classrooms(req, res, params) {
    try {
      const examID = params.exam_id || null;
      if (!examID)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);
      if (!mongoose.Types.ObjectId.isValid(examID)) {
        return response(res, null, "exam_id không hợp lệ!", statusCode.ERROR);
      }
      let classroomsTable = [];
      const categories = await CategoryModel.find(
        { "exam.id": examID },
        null,
        {},
      );
      if (categories && categories.length > 0) {
        for (const category of categories) {
          const chapter = await ChapterModel.find(
            { _id: category.chapter.id },
            null,
            {},
          );
          if (chapter && chapter.length > 0) {
            for (const chap of chapter) {
              const classrooms = await ClassroomModel.findOne(
                { _id: chap.classroom_ids, deleted_at: null },
                null,
                {},
              );
              if (classrooms) {
                classroomsTable.push({
                  classroom_name: classrooms.name,
                  classroom_id: classrooms._id,
                  classroom_code: classrooms.code,
                  classroom_subject: classrooms.subject.name,
                });
              }
            }
          }
        }
      }
      const data = {
        items: classroomsTable,
      };
      return response(res, data, "Thành công", statusCode.OK);
    } catch (err) {
      console.log(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async checkAnswer(req, res, params) {
    try {
      const { user_id, exam_id } = params;
      if (!user_id || !exam_id) {
        return response(res, null, "Thiếu thông tin!", statusCode.ERROR);
      }
      const existingScore = await ScoreWordHistory.db.findOne(
        {
          user_id: user_id,
          exam_id: exam_id,
          deleted_at: null,
        },
        null,
        { sort: { created_at: -1 } },
      );
      let questions_correct = 0;
      const examDb = await ExamWord.db.findOne({
        _id: exam_id,
        deleted_at: null,
      });
      if (existingScore) {
        for (const ql of existingScore.question_logs || []) {
          if (ql.score > 0) {
            questions_correct++;
          }
        }
      } else {
        return response(
          res,
          { hasTaken: false },
          "Chưa làm bài thi!",
          statusCode.OK,
        );
      }
      let giftImage = null;
      let giftCTA = null;
      let giftUrl = null;
      let canCheckGift = false;
      if (examDb.group === "MAC_DINH") {
        canCheckGift = true;
      }
      if (examDb.group === "THI_THU") {
        const practiceConfig = examDb.practiceConfig;
        if (practiceConfig?.status) {
          if (practiceConfig?.result_display === "IMMEDIATELY") {
            canCheckGift = true;
          } else {
            canCheckGift = false;
          }
        } else {
          canCheckGift = true;
        }
      }
      if (!canCheckGift || !examDb.fast_gift?.id) {
        giftImage = null;
      } else {
        const gift = await FastGiftModel.db.findOne({
          _id: examDb.fast_gift.id,
        });
        if (gift && Array.isArray(gift.score_rule)) {
          const matchedRule = gift.score_rule.find(
            (rule) =>
              typeof totalScoreAchieve === "number" &&
              totalScoreAchieve >= rule.min_score &&
              totalScoreAchieve <= rule.max_score,
          );
          if (matchedRule) {
            giftCTA = gift.call_to_action;
            giftUrl = gift.url_redirect;
            giftImage = matchedRule.image;
          }
        }
      }
      const data = {
        hasTaken: true,
        latestScore: {
          id: existingScore._id,
          questions_correct: questions_correct,
          total_score_achieve: existingScore.total_score_achieve,
          total_exam_point: existingScore.total_exam_point,
          total_question: existingScore.total_question,
          time_doing: existingScore.time_doing,
          ques_answer_doing: existingScore.ques_answer_doing,
          created_at: existingScore.created_at,
          exam_section: existingScore.exam_section,
          question_logs: existingScore.question_logs,
          gift_image: giftImage,
          gift_url: giftUrl,
          gift_CTA: giftCTA,
        },
      };
      return response(res, data, "Đã làm bài thi!", statusCode.OK);
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async exportWord(req, res, params) {
    try {
      const examId = params.exam_id;
      const export_type = params.export_type;
      const code = params.code || null;
      if (!examId) {
        return response(
          res,
          null,
          "Thiếu thông tin bài thi!",
          statusCode.ERROR,
        );
      }
      const examDb = await ExamWord.db
        .findOne({ _id: examId, deleted_at: null })
        .populate({
          path: "parts.subpart.children.questions.question",
          model: "question_word",
        })
        .lean();

      if (!examDb) {
        return response(res, null, "Đề thi không tồn tại!", statusCode.ERROR);
      }

      const tempDir = path.join(__dirname, "../../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      let latexContent = "";
      const examTitle = escapeLatexArg(examDb.name || "");
      const examSearchId = examDb.search_id || "";
      examDb.parts.forEach((part, partIdx) => {
        latexContent += `## ${escapeLatexArg(part.name)}\n\n`;

        part.subpart.forEach((subpart, subIdx) => {
          if (
            subpart.name &&
            subpart.name != "Subpart 1" &&
            subpart.name != part.name
          ) {
            latexContent += `**${escapeLatexArg(subpart.name)}**</p>\n`;
          }

          subpart.children.forEach((child) => {
            if (
              child.name &&
              child.name != "Children 1" &&
              child.name != subpart.name
            ) {
              latexContent += `**${escapeLatexArg(child.name)}**</p>\n`;
            }

            child.questions.forEach((q, qIdx) => {
              const question = q.question;
              if (!question) return;

              let questionText = htmlToLatex(question.rawHtml, tempDir);
              questionText = questionText.replace(
                /^\s*Câu\s*\d+\s*:\s*/gim,
                "",
              );
              questionText = escapeLatexText(questionText);
              const questionExplainRaw = htmlToLatex(
                question.explanation,
                tempDir,
              );
              const questionExplain = escapeLatexText(questionExplainRaw);
              if (question.type === "cluster") {
                latexContent += `**[${question.searchId}]** ${questionText}</p>\n`;
              } else {
                if (!questionText.trim()) {
                  latexContent += `**Câu ${q.number || qIdx + 1}** [${question.searchId}]:</p>\n`;
                } else {
                  latexContent += `**Câu ${q.number || qIdx + 1}** [${question.searchId}]: ${questionText}</p>\n`;
                }
              }

              question.choices?.forEach((choice) => {
                const choiceText = escapeLatexText(
                  htmlToLatex(choice.text, tempDir),
                );
                const isMultiple = question.type === "truefalsemulti";
                const labelFormatted = isMultiple
                  ? `${choice.label.toLowerCase()})`
                  : `${choice.label})`;
                if (!choiceText.trim()) {
                  latexContent += `**${labelFormatted}**</p>\n`;
                } else {
                  latexContent += `**${labelFormatted}** ${choiceText}</p>\n`;
                }
              });
              if (export_type === "DETAIL" && question.type !== "cluster") {
                latexContent += `### Lời giải\n\n`;

                let correctLabels = "";

                // truefalsemulti => a) Đ; b) S; c) Đ; d) S
                if (question.type === "truefalsemulti") {
                  correctLabels = question.correctAnswers
                    ?.map((ans) => {
                      const label = ans.label?.toLowerCase?.() || "";
                      const value = ans.value === "Đ" ? "Đ" : "S";
                      return ` ${label}) ${value}`;
                    })
                    .join("; ");
                } else if (
                  question.correctAnswers?.length &&
                  typeof question.correctAnswers[0] === "object"
                ) {
                  // Case object
                  if ("label" in question.correctAnswers[0]) {
                    // dạng {label, value}
                    correctLabels = question.correctAnswers
                      .filter((ans) => ans.value === "Đ")
                      .map((ans) => ans.label)
                      .join("; ");
                  } else {
                    // dạng {value: 'A'}
                    correctLabels = question.correctAnswers
                      .map((ans) => ans.value)
                      .join("; ");
                  }
                }

                latexContent += `**Đáp án:** ${correctLabels}\n\n`;
                if (
                  question.explanation &&
                  question.explanation.trim() !== ""
                ) {
                  if (!questionExplain.trim()) {
                    latexContent += `**Giải thích :**\n\n`;
                  } else {
                    latexContent += `**Giải thích :**\n\n${questionExplain}\n\n`;
                  }
                }
              }
              if (export_type === "EXAMPLE") {
                const dots = generateDots(question.explanation);
                latexContent += `\n\n${dots}\n\n\\ \n\n`;
              } else {
                latexContent += `\n\n\\ \n\n`;
              }
            });
          });
        });
      });

      const fullLatex = `---
title: "${examTitle} ${code ? ` [${code}]` : ` [${examSearchId}]`}"
---

${latexContent}
`;

      const texPath = path.join(tempDir, `exam-${examId}.md`);
      const docxPath = path.join(tempDir, `exam-${examId}.docx`);
      const referenceDocxPath = path.join(__dirname, "reference.docx");
      fs.writeFileSync(texPath, fullLatex, "utf8");
      execSync(
        `pandoc "${texPath}" -f markdown+mark+raw_attribute+raw_html -o "${docxPath}" --reference-doc="${referenceDocxPath}" --resource-path="${tempDir}" `,
      );

      const buffer = fs.readFileSync(docxPath);
      const alias = BaseHelper.seoURL(examDb.name?.trim());

      fs.unlinkSync(texPath);
      fs.unlinkSync(docxPath);

      const base64 = buffer.toString("base64");

      return response(
        res,
        {
          filename: `exam-${alias}.docx`,
          fileData: base64,
          fileType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
        "Export thành công!",
        statusCode.OK,
      );
    } catch (err) {
      console.error(err);
      return response(res, null, "Lỗi export Word", statusCode.ERROR);
    }
  }
}
module.exports = new ExamWordController();
