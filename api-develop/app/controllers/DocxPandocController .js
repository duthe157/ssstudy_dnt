const path = require("path");
const multer = require("multer");
const mammoth = require("mammoth");
const cheerio = require("cheerio");
const AdmZip = require("adm-zip");
const omml2mathml = require("omml2mathml");
const fs = require("fs");
const { execSync } = require("child_process");

const upload = multer({
  dest: path.join(__dirname, "../../temp/docx"),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ========= Regex =========
const REGEX = {
  part: /^(PHẦN)/,
  question:
    /^(?!câu\s*\d+\s*[-–—]\s*\d+\s*[:.]?)(Câu|Question)\s*(\d+)[\.:]?\s*/im,
  cluster:
    /(?:^|\s)(?:questions?|q\.?|câu)\s*(\d+)\s*(?:[-–—]|đến)\s*(\d+)(?=[:\s]|$)/iu,
  drag: /^các lựa chọn kéo[:]?/i,
  choice: /(?<![\p{L}\p{N}_|])([A-Da-d])[.)](?!\s*\()(?=\s)/u,
  explanation: /^giải thích[:]?/i,
  video: /^video[:]?/i,
  explainSection: /^lời giải[:]?/i,
  correct: /^Đáp án[:]?/i,
  subpartTitle: /^(\d+\.\d+)\s+.+$/u,
  groupTitle: /^\[\p{L}(?:[\p{L}\s]*\p{L})?\]$/u,
  subjectTitle: /^##\s*\p{L}(?:[\p{L}\s]*\p{L})?$/u,
};

function detectFillInBlank(text) {
  return /_{3,}/.test(text) ? "fillinblank" : null;
}

function parseQuestionText(htmlContent, text) {
  const regex = REGEX.question;
  const match = text.match(regex);
  if (match) {
    return {
      number: parseInt(match[2], 10),
      rawHtml: htmlContent.replace(match[0], "").trim(),
      plainText: text.replace(match[0], "").trim(),
    };
  }
  return {
    number: null,
    rawHtml: htmlContent.trim(),
    plainText: text.trim(),
  };
}
function detectDifficulty(text) {
  const match = text.match(/\((NB|TH|VD|VDC)\)/i);
  if (!match) return { code: null, label: null, text };
  const cleanText = text.replace(/\((NB|TH|VD|VDC)\)/i, "").trim();
  switch (match[1].toUpperCase()) {
    case "NB":
      return { code: "NHAN_BIET", label: "Nhận biết", text: cleanText };
    case "TH":
      return { code: "THONG_HIEU", label: "Thông hiểu", text: cleanText };
    case "VD":
      return { code: "VAN_DUNG", label: "Vận dụng", text: cleanText };
    case "VDC":
      return { code: "VAN_DUNG_CAO", label: "Vận dụng cao", text: cleanText };
    default:
      return { code: "THONG_THUONG", label: "", text: cleanText };
  }
}
function splitIgnoreParen(str) {
  const result = [];
  let current = "";
  let depth = 0;

  for (const ch of str) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);

    if (ch === ";" && depth === 0) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  if (current) result.push(current);
  return result;
}
function parseCorrectAnswer(text) {
  let raw = (text || "").trim();

  let parts = splitIgnoreParen(raw)
    .map(ans => ans.trim())
    .filter(Boolean);

  let results = [];
  for (let ans of parts) {
    let clean = ans
      .replace(/^(chọn|đáp án|answer)[:\s]*/i, "")
      .trim();

    // A) Đúng / A) Sai
    let match = clean.match(
      /^([a-dA-D])[\)]\s*(đúng|sai|true|false|đ|s|T|F)$/i
    );
    if (match) {
      results.push({
        label: match[1].toUpperCase(),
        value:
          match[2].charAt(0).toUpperCase() +
          match[2].slice(1).toLowerCase(),
        rawHtml: ans,
      });
      continue;
    }

    // A) Nội dung / B) ...
    match = clean.match(/^([a-dA-D])\)\s*(.*)$/);
    if (match) {
      results.push({
        label: match[1].toUpperCase(),
        value: match[2]?.trim() || match[1].toUpperCase(),
        rawHtml: ans,
      });
      continue;
    }

    // Đúng / Sai (không có label)
    if (/^(đúng|sai|true|false)$/i.test(clean)) {
      results.push({
        label: "",
        value:
          clean.charAt(0).toUpperCase() +
          clean.slice(1).toLowerCase(),
        rawHtml: ans,
      });
    } else {
      results.push({
        label: "",
        value: clean,
        rawHtml: ans,
      });
    }
  }

  return results;
}

function removePrefix(rawHtml) {
  if (!rawHtml) return "";
  return rawHtml
    .replace(/^\s*([A-Da-d][\)])\s*/, "")
    .replace(/<\/?p>/gi, "")
    .trim();
}
function removeBracketAndHash(rawHtml) {
  if (!rawHtml) return "";
  return rawHtml
    .replace(/^\s*\[([^\]]+)\]\s*/, "$1 ")
    .replace(/^\s*##\s*(.+)$/, "$1")
    .replace(/<\/?p>/gi, "")
    .trim();
}
function addChoice(question, text, rawHtml) {
  const $ = cheerio.load(rawHtml);
  let innerHtml = $("body").length ? $("body").html() : $.root().html();
  if (!innerHtml) innerHtml = rawHtml;
  const mathPlaceholders = [];
  const tempHtml = innerHtml.replace(
    /<span[^>]*class=(["'])math\1[^>]*>[\s\S]*?<\/span>/gi,
    (m) => {
      mathPlaceholders.push(m);
      return `__MATH_PLACEHOLDER_${mathPlaceholders.length - 1}__`;
    },
  );

  const labelRegex = /(?<=^|[\s>])([A-Da-d])[)]\s+/g;
  const candidates = [];
  let mm;
  const foundLabels = new Set();
  while ((mm = labelRegex.exec(tempHtml)) !== null) {
    const label = mm[1].toUpperCase();
    if (!foundLabels.has(label)) {
      candidates.push({ index: mm.index, len: mm[0].length });
      foundLabels.add(label);
    }
  }
  if (candidates.length === 0) {
    let lines = innerHtml
      .split(/<br\s*\/?>|\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    lines = lines.map((l) => l.replace(/<\/?p>/gi, "").trim()).filter(Boolean);
    lines.forEach((line) => {
      const m = line.match(/^([A-Da-d])[\)]\s*(.+)$/i);
      if (m) {
        const label = m[1].toUpperCase();
        const choiceText = m[2].trim();
        // Chỉ đẩy vào explanation khi chỉ có từ "đúng" hoặc "sai" đơn thuần
        if (/^(đúng|sai|true|false)$/i.test(choiceText)) {
          question.explanation =
            (question.explanation || "") + `${label}) ${choiceText}\n`;
        } else {
          question.choices.push({
            label,
            text: choiceText,
            rawHtml: `<p>${removePrefix(line)}</p>`,
          });
        }
      }
    });
    return;
  }
  for (let i = 0; i < candidates.length; i++) {
    const start = candidates[i].index;
    const end =
      i + 1 < candidates.length ? candidates[i + 1].index : tempHtml.length;
    let seg = tempHtml.slice(start, end);

    seg = seg.replace(
      /__MATH_PLACEHOLDER_(\d+)__/g,
      (_, n) => mathPlaceholders[Number(n)] || "",
    );

    const seg$ = cheerio.load("<div>" + seg + "</div>");
    const segText = seg$("div").text().trim();

    const labelMatch = segText.match(/^\s*([A-Da-d])[)]\s*/i);
    if (!labelMatch) continue;
    const label = labelMatch[1].toUpperCase();
    const choiceText = segText.replace(/^\s*[A-Da-d][\)]\s*/i, "").trim();

    let cleanedRawHtml = seg.replace(/^\s*[A-Da-d][)]\s*/i, "").trim();
    cleanedRawHtml = cleanedRawHtml
      .replace(/^\s*<[^>]{1,40}>\s*[A-Da-d][)]\s*<\/[^>]{1,40}>/i, "")
      .replace(/<\/?p[^>]*>/gi, "")
      .trim();

    if (/^(đúng|sai|true|false)$/i.test(choiceText)) {
      question.explanation =
        (question.explanation || "") + `${label}) ${choiceText}\n`;
    } else {
      question.choices.push({
        label,
        text: cleanedRawHtml,
        rawHtml: cleanedRawHtml,
      });
    }
  }
}
function detectQuestionType(question) {
  if (question.type === "cluster") return "cluster";
  if (question.dragDropOptions?.length > 0) return "dragdrop";

  const correctAnswers = (question.correctAnswers || []).map((c) =>
    typeof c === "object" ? c.value : c
  );
  const answer = (question.choices || []).map((c) =>
    typeof c === "object" ? c.value || c.label : c
  );
  // if (answer.length === 0 && correctAnswers.length === 0 && question.type !== "cluster") {
  //     return response(res, null, 'File lỗi, vui lòng kiểm tra lại thông tin các lỗi thường gặp trong tài liệu', statusCode.ERROR);
  // }
  if (
    correctAnswers.some((v) =>
      ["Đúng", "Sai", "True", "False", "Đ", "S", "T", "F"].includes(v)
    )
  ) {
    return correctAnswers.length > 1 ? "truefalsemulti" : "truefalse";
  }
  if (question.rawHtml && /tính đúng sai/i.test(question.rawHtml)) {
    return "truefalsemulti";
  }
  if (detectFillInBlank(question.rawHtml) && answer.length === 0) {
    return "fillinblank";
  }
  if (correctAnswers.length > 1) return "multiplechoice";
  return "singlechoice";
}
function transformToExamWord(exam) {
  let parts = [];
  let partIndex = 0;
  let subjectIndex = 0;
  let numberQuestion = 1;

  for (const item of exam) {
    if (item.__isPart) {
      if (item.__partType === "part") {
        partIndex++;
        subjectIndex = 0;
        numberQuestion = 1;

        const name = item.plainText?.trim() || "";
        parts.push({
          name,
          time: 0,
          score: 0,
          type: "MAC_DINH",
          totalquestions: 0,
          subpart: [],
        });
      } else if (
        item.__partType === "subpart_mac_dinh" ||
        item.__partType === "subpart_nhom_chu_de"
      ) {
        let currentPart = parts[parts.length - 1];
        if (!currentPart) continue;

        if (!currentPart.subpart) currentPart.subpart = [];

        if (item.__partType === "subpart_nhom_chu_de") {
          currentPart.type = "NHOM_CHU_DE";
        }

        const name = removeBracketAndHash(item.plainText)?.trim() || "";
        const isFirstSubpart = currentPart.subpart.length === 0;
        // isMain = false if name starts with pattern like "1.1 Something"
        const hasNumberPrefix = /^\d+\.\d+\s+/.test(name);
        currentPart.subpart.push({
          name,
          children: [],
          isMain: isFirstSubpart && !hasNumberPrefix,
        });
      } else if (item.__partType === "children") {
        subjectIndex++;
        let currentPart = parts[parts.length - 1];
        if (!currentPart) continue;

        if (!currentPart.subpart) currentPart.subpart = [];
        let lastSubpart = currentPart.subpart[currentPart.subpart.length - 1];
        if (!lastSubpart) {
          const hasNumberPrefix = /^\d+\.\d+\s+/.test(
            "Subpart " + subjectIndex
          );
          lastSubpart = {
            name: "Subpart " + subjectIndex,
            children: [],
            isMain: currentPart.subpart.length === 0 && !hasNumberPrefix,
          };
          currentPart.subpart.push(lastSubpart);
        }

        let subjectID = "";
        if (!lastSubpart.children) lastSubpart.children = [];

        if (currentPart.type === "NHOM_CHU_DE") {
          lastSubpart.children.push({
            name: removeBracketAndHash(item.plainText),
            subject_id: subjectID,
            questions: [],
          });
        }
      }
    } else {
      let currentPart = parts[parts.length - 1];
      if (!currentPart) {
        parts.push({
          name: "Phần " + (partIndex + 1),
          time: 0,
          score: 0,
          type: "MAC_DINH",
          totalquestions: 0,
          subpart: [],
        });
        currentPart = parts[parts.length - 1];
      }

      let lastSubpart = currentPart.subpart[currentPart.subpart.length - 1];
      if (!lastSubpart) {
        lastSubpart = {
          name: "SubPart 1",
          children: [],
          isMain: currentPart.subpart.length === 0 ? true : false,
        };
        currentPart.subpart.push(lastSubpart);
      }

      let lastChild;
      if (!lastSubpart.children || lastSubpart.children.length === 0) {
        lastChild = {
          name: "Children 1",
          questions: [],
        };
        if (!lastSubpart.children) lastSubpart.children = [];
        lastSubpart.children.push(lastChild);
      } else {
        lastChild = lastSubpart.children[lastSubpart.children.length - 1];
      }

      if (!lastChild.questions) lastChild.questions = [];
      lastChild.questions.push({
        question: item,
        number: item.number ?? (item.type === "cluster" ? 0 : numberQuestion++),
      });

      currentPart.totalquestions++;
    }
  }
  exam.forEach((clusterItem, clusterIndex) => {
    if (
      !clusterItem.__isPart &&
      clusterItem.type === "cluster" &&
      clusterItem.cluster &&
      Array.isArray(clusterItem.cluster)
    ) {
      const childQuestionIds = [];

      // Find which part and subpart this cluster belongs to
      let clusterPartIndex = -1;
      let clusterSubpartIndex = -1;

      // Count parts and subparts before this cluster
      for (let i = clusterIndex - 1; i >= 0; i--) {
        if (exam[i].__isPart) {
          if (exam[i].__partType === "part") {
            clusterPartIndex++;
            clusterSubpartIndex = -1; // Reset subpart count for new part
          } else if (
            exam[i].__partType === "subpart_mac_dinh" ||
            exam[i].__partType === "subpart_nhom_chu_de"
          ) {
            clusterSubpartIndex++;
          }
        }
      }

      // If no part found, assume it belongs to the first part (index 0)
      if (clusterPartIndex === -1) {
        clusterPartIndex = 0;
      }

      // If no explicit subpart found, use default subpart (index 0)
      if (clusterSubpartIndex === -1) {
        clusterSubpartIndex = 0;
      }

      // Only search within the same part as the cluster
      if (clusterPartIndex >= 0 && clusterPartIndex < parts.length) {
        const targetPart = parts[clusterPartIndex];

        // Search through ALL subparts in the target part
        if (targetPart.subpart && targetPart.subpart.length > 0) {
          targetPart.subpart.forEach((subpart, subpartIndex) => {
            if (subpart.children) {
              subpart.children.forEach((child) => {
                if (child.questions) {
                  child.questions.forEach((questionItem) => {
                    if (
                      clusterItem.cluster.includes(questionItem.number) &&
                      questionItem.question.type !== "cluster"
                    ) {
                      questionItem.question.parentId = clusterItem.questionId;
                      childQuestionIds.push(questionItem.question.questionId);
                    }
                  });
                }
              });
            }
          });
        }
      }

      clusterItem.cluster = childQuestionIds;
    }
  });
  return parts;
}
function mergeFollowingParagraphs($, $element, rawHtml) {
  let htmlContent = rawHtml;

  let $next = $element.next();

  if (!$next || !$next.length) {
    $next = $element.parent().next();
  }

  // Xác định thẻ đóng cần tìm
  const tagName = $element.prop("tagName")?.toLowerCase();
  const closingTag = `</${tagName}>`;
  const closingRegex = new RegExp(closingTag + "$");

  while ($next && ($next.is("p") || $next.is("img") || $next.is("table"))) {
    const nextText = $next.text().trim();
    const nextTag = $next.prop("tagName")?.toLowerCase();

    if (nextTag !== "table") {
      if (
        /(Câu|Question)\s*(\d+)[\.:]?\s*/i.test(nextText) ||
        /^lời giải/i.test(nextText) ||
        /^[A-Da-d][\)]/.test(nextText) ||
        /các lựa chọn kéo/i.test(nextText)
      ) {
        break;
      }
    }

    if (nextTag === "table") {
      htmlContent = htmlContent.replace(
        closingRegex,
        "<br/>" + $.html($next) + closingTag
      );
    } else {
      htmlContent = htmlContent.replace(
        closingRegex,
        "<br/>" + $next.html() + closingTag
      );
    }

    const temp = $next.next();
    $next.remove();
    $next = temp;
  }
  return htmlContent;
}
class DocxPandocController {
  uploadMiddleware() {
    return upload.single("docxFile");
  }

  async uploadDocx(req, res) {
    const file = req.file;
    if (!file)
      return res.status(400).json({ error: "Không có file được upload" });

    try {
      const imageMap = {};
      try {
        const fileBuffer = fs.readFileSync(file.path);
        const zip = new AdmZip(fileBuffer);
        const imageEntries = zip
          .getEntries()
          .filter(
            (entry) =>
              entry.entryName.startsWith("word/media/") &&
              /\.(png|jpg|jpeg|gif|bmp|svg|wmf)$/i.test(entry.entryName)
          );

        imageEntries.forEach((entry) => {
          const imageData = entry.getData();
          const fileName = entry.entryName.split("/").pop(); // image4.png
          const ext = fileName.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || "png";
          const mimeType =
            {
              png: "image/png",
              jpg: "image/jpg",
              jpeg: "image/jpeg",
              gif: "image/gif",
              bmp: "image/bmp",
              svg: "image/svg+xml",
              wmf: "image/wmf",
            }[ext] || "image/png";

          const base64 = imageData.toString("base64");
          const dataUrl = `data:${mimeType};base64,${base64}`;

          imageMap[fileName] = dataUrl;
          imageMap[`media/${fileName}`] = dataUrl;
        });
      } catch (err) {
        console.error("Error extracting images:", err.message);
      }

      const tempHtmlPath = file.path.replace(/\.docx$/i, ".html");

      try {
        execSync(
          `pandoc -f docx -t html "${file.path}" -o "${tempHtmlPath}" --mathml`,
          {
            stdio: "pipe",
            encoding: "utf8",
          }
        );
      } catch (err) {
        console.error("Pandoc conversion error:", err.message);
        return res.status(500).json({
          error: "Lỗi chuyển đổi file DOCX. Vui lòng kiểm tra lại file.",
        });
      }

      let rawHtml = "";
      try {
        rawHtml = fs.readFileSync(tempHtmlPath, "utf8");
      } catch (err) {
        console.error("Error reading HTML file:", err.message);
        return res
          .status(500)
          .json({ error: "Lỗi đọc file HTML đã chuyển đổi." });
      }

      rawHtml = rawHtml.replace(
        /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
        (match, src) => {
          if (imageMap[src]) {
            return match.replace(src, imageMap[src]);
          }
          return match;
        }
      );
      rawHtml = rawHtml
        .replace(
          /([A-Za-z0-9]+)<sup>([\s\S]*?)<\/sup>/gi,
          (_, base, sup) =>
            `\\(${base.trim().replace(/^-/, "")}^{${sup
              .trim()
              .replace(/\./g, "")}}\\)`
        )
        .replace(
          /([A-Za-z0-9]+)<sub>([\s\S]*?)<\/sub>/gi,
          (_, base, sub) =>
            `\\(${base.trim().replace(/^-/, "")}_{${sub
              .trim()
              .replace(/\./g, "")}}\\)`
        )
        .replace(/&nbsp;/g, " ")
        .replace(/[\r\n]+/g, " ")
        .replace(/\\n/g, " ");

      rawHtml = rawHtml.replace(/<math[^>]*>([\s\S]*?)<\/math>/gi, (match) => {
        try {
          const annotationMatch = match.match(
            /<annotation[^>]*encoding=["']application\/x-tex["'][^>]*>([\s\S]*?)<\/annotation>/i
          );
          if (annotationMatch && annotationMatch[1]) {
            let latex = annotationMatch[1].trim();

            // Fix các vấn đề với LaTeX
            latex = latex
              .replace(/\\right\.\s*/g, "\\right.")
              .replace(/\\left\.\s*/g, "\\left.")
              .replace(/\\lbrack/g, "[")
              .replace(/\\rbrack/g, "]")
              .replace(/\\text\{(cos|sin|tan|cot|sec|csc|ln|log)\}/gi, "\\$1 ")
              .replace(/&amp;/g, "&")
              .replace(/\\mspace\{6mu\}/g, "")
              .replace(/\\\\/g, "\\\\ \\\\")
              .replace(/\*seq\*s/g, "\\neq")
              .replace(/\\(ln|sin|cos|tan|cot|sec|csc)(?=x\b)/g, "\\$1 ");
            // .replace(/\l eq/g,"\\leq")

            const isDisplayMath =
              /\\begin\{(aligned|align|gather|multline|cases|matrix|pmatrix|bmatrix|vmatrix|Vmatrix|split|array)\}/.test(
                latex
              );

            const isBlockDisplay = /display=["']block["']/.test(match);

            if (isDisplayMath || isBlockDisplay) {
              return ` <span class="math-symbol">\\[ ${latex} \\]</span> `;
            } else {
              return ` <span class="math-symbol">\\(${latex}\\)</span> `;
            }
          }

          const mathContent = match
            .replace(/<\/?math[^>]*>/gi, "")
            .replace(/<semantics>/gi, "")
            .replace(/<\/semantics>/gi, "")
            .replace(/<mrow>/gi, "")
            .replace(/<\/mrow>/gi, "")
            .replace(/<annotation[\s\S]*?<\/annotation>/gi, "");
          // .trim();

          return ` \\( ${mathContent} \\) `;
        } catch (err) {
          console.error("Math conversion error:", err.message);
          return `<span class="math-missing">[Công thức lỗi]</span>`;
        }
      });

      rawHtml = rawHtml
        .replace(/<blockquote[^>]*>/gi, "")
        .replace(/<\/blockquote>/gi, "");
      try {
        if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }

      const $ = cheerio.load(rawHtml);
      const exam = [];
      let currentPart = null;
      let currentQuestion = null;
      let currentCluster = null;
      let mode = null;
      let qCounter = 0;

      $("p, h1, h2, h3, h4, h5, h6, ol,li, img, a").each((_, el) => {
        const tag = el.tagName.toLowerCase();
        const text = $(el).text().trim();
        // let rawHtml = $.html(el).replace(/\r\n/, " ") || "";
        let rawHtml = $.html(el).replace(/<\/?strong[^>]*>/g, "").replace(/<\/?mark[^>]*>/g, "") || "";
          rawHtml = rawHtml.replace(/[\r\n]+/g, " ").replace(/\\n/g, " ");
        if ($(el).data("processed")) return;
        let href = "";
        // if (!text && tag !== "img" && tag !== "a") return;
        if (tag === "a") {
          href = $(el).attr("href") || "";
        }
        // ----- Video -----
        if (REGEX.video.test(text)) {
          mode = "video";
          if (tag === "p") {
            const $el = $(el);
            const linkEl = $el.find("a");
            let linkHref = "";
            if (linkEl && linkEl.length) {
              linkHref = linkEl.attr("href");
            } else {
              linkHref = text.replace(REGEX.video, "").trim();
            }
            if (currentQuestion) {
              currentQuestion.video = linkHref;
            }
          }
        }
        // ----- Part -----

        if (REGEX.part.test(text) || $(el).is("h2")) {
          currentPart = { plainText: text, __isPart: true, __partType: "part" };
          exam.push(currentPart);
          currentCluster = null;
          currentQuestion = null;
          return;
        }
        if (REGEX.subpartTitle.test(text)) {
          currentPart = {
            plainText: text,
            __isPart: true,
            __partType: "subpart_mac_dinh",
          };
          exam.push(currentPart);
          currentCluster = null;
          currentQuestion = null;
          return;
        }
        if (REGEX.groupTitle.test(text)) {
          currentPart = {
            plainText: text,
            __isPart: true,
            __partType: "subpart_nhom_chu_de",
          };
          exam.push(currentPart);
          currentCluster = null;
          currentQuestion = null;
          return;
        }
        if (REGEX.subjectTitle.test(text)) {
          currentPart = {
            plainText: text,
            __isPart: true,
            __partType: "children",
          };
          exam.push(currentPart);
          currentCluster = null;
          currentQuestion = null;
          return;
        }
        // --- Cluster ---

        if (REGEX.cluster.test(text)) {
          qCounter++;

          let htmlContent = rawHtml;
          let $next = $(el).next();
          const match = text.match(REGEX.cluster);
          let clusterNumbers = [];
          if (match) {
            const startNum = parseInt(match[1] || match[3] || match[5], 10);
            const endNum = parseInt(match[2] || match[4] || match[6], 10);
            if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
              for (let n = startNum; n <= endNum; n++) {
                clusterNumbers.push(n);
              }
            }
          }

          while ($next && $next.length) {
            const nextText = $next.text().trim();
            const nextTag = $next.prop("tagName")?.toLowerCase();

            if (
              nextTag === "li" ||
              nextTag === "ol" ||
              nextTag === "ul" ||
              REGEX.question.test(nextText) ||
              REGEX.cluster.test(nextText)
            ) {
              // Đánh dấu phần tử dừng để không xử lý lại
              if (
                REGEX.cluster.test(nextText) &&
                (nextTag === "p" || nextTag === "em")
              ) {
                $next.data("processed", true);
              }
              break;
            }

            // Ghép thẻ <p> hoặc <em> vào nội dung
            if (nextTag === "p" || nextTag === "em") {
              htmlContent += "<br/>" + $next.html();
              $next.data("processed", true); // Đánh dấu đã xử lý
            }

            // Tiếp tục đọc nếu là thẻ <br>
            if (nextTag === "br") {
              htmlContent += "<br/>";
              $next.data("processed", true); // Đánh dấu đã xử lý
            }

            const temp = $next.next();
            $next = temp;
          }

          $(el).data("processed", true);
          const cleanedText = htmlContent
            .replace(/[Cc]âu\s*(\d+)\s*[-–—]\s*(\d+)\s*[:]?/i, "")
            .trim();
          currentCluster = {
            questionId: qCounter.toString(),
            rawHtml: cleanedText,
            plainText: cleanedText,
            type: "cluster",
            choices: [],
            dragDropOptions: [],
            correctAnswers: [],
            explanation: "",
            leadText: "",
            leadHtml: "",
            subject: "",
            cluster: clusterNumbers,
            deleted_at: null,
            level: "THONG_THUONG",
            parentId: null,
          };
          exam.push(currentCluster);
          mode = "question";
          return;
        }

        // --- Question ---
        if (tag === "ol") {
          const $ol = $(el);
          const startValue = parseInt($ol.attr("start"), 10) || 1;
          let questionNumber = startValue;
          $ol.find("li").each((_, liEl) => {
            qCounter++;
            let htmlContent = $.html(liEl);
            let plainContent = $(liEl).text().trim();
            htmlContent = mergeFollowingParagraphs($, $(liEl), htmlContent);
            currentQuestion = {
              questionId: qCounter.toString(),
              number: questionNumber,
              rawHtml: htmlContent,
              plainText: plainContent,
              type: "unknown",
              choices: [],
              dragDropOptions: [],
              correctAnswers: [],
              explanation: "",
              leadText: "",
              leadHtml: "",
              subject: "",
              cluster: [],
              deleted_at: null,
              video: "",
              level: "THONG_THUONG",
              parentId: null,
            };
            questionNumber++;
            const diff = detectDifficulty(plainContent);
            if (diff) {
              currentQuestion.level = diff.code;
              currentQuestion.plainText = diff.text;
              currentQuestion.rawHtml = htmlContent
                .replace(/\((NB|TH|VD|VDC)\)/i, "")
                .trim();
            }
            exam.push(currentQuestion);
            mode = "question";
          });
          return;
        }

        if (REGEX.question.test(text)) {
          qCounter++;
          const $p = $(el);
          let htmlContent = mergeFollowingParagraphs($, $p, rawHtml);

          const parsed = parseQuestionText(htmlContent, text);
          currentQuestion = {
            questionId: qCounter.toString(),
            number: parsed.number,
            rawHtml: parsed.rawHtml,
            plainText: parsed.plainText,
            type: "unknown",
            choices: [],
            dragDropOptions: [],
            correctAnswers: [],
            explanation: "",
            leadText: "",
            leadHtml: "",
            subject: "",
            cluster: [],
            deleted_at: null,
            video: "",
            level: "THONG_THUONG",
            parentId: null,
          };

          const diff = detectDifficulty(text);
          if (diff) {
            currentQuestion.level = diff.code;
            currentQuestion.plainText = diff.text;
            currentQuestion.rawHtml = parsed.rawHtml
              .replace(/\((NB|TH|VD|VDC)\)/i, "")
              .trim();
          }

          exam.push(currentQuestion);
          mode = "question";
          return;
        }

        if (REGEX.drag.test(text) && currentQuestion) {
          const dragText = text.split(":")[1]?.trim() || "";
          if (dragText) {
            currentQuestion.dragDropOptions = splitIgnoreParen(dragText)
              .map(i => i.trim())
              .filter(Boolean);
          }
          mode = "choice";
          return;
        }

        if (
          REGEX.choice.test(text) &&
          currentQuestion &&
          (mode === "choice" || mode === "question")
        ) {
          addChoice(currentQuestion, text, rawHtml);
          mode = "choice";
          return;
        }

        if (REGEX.explanation.test(text) && currentQuestion) {
          mode = "explanation";
          const cleaned = text.replace(REGEX.explanation, "").trim();
          if (cleaned) {
            currentQuestion.explanation += cleaned + "<br/>";
          }


          let next = $(el).next();
          while (next.length) {
            const nextText = next.text().trim();
            const tag = next.prop("tagName")?.toLowerCase();

            if (
              tag === "video" ||
              next.find("video").length > 0 ||
              nextText.includes("youtube.com") ||
              nextText.includes("Video:") ||
              nextText.includes("video:") ||
              REGEX.question.test(nextText) ||
              REGEX.cluster.test(nextText) ||
              REGEX.part.test(nextText) ||
              REGEX.subpartTitle.test(nextText) ||
              tag === "li" ||
              tag === "ol"
            ) {
              break;
            }

            if (tag === "p") {
              currentQuestion.explanation += next.html().trim() + `<br/>`;
            } else if (tag === "table") {
              currentQuestion.explanation += $.html(next).trim() + `<br/>`;
              next.data("processed", true);
            }

            next = next.next();
          }

          return;
        }

        if (REGEX.video.test(text)) {
          mode = "video";
          return;
        }
        if (REGEX.explainSection.test(text) && currentQuestion) {
          mode = "correct";
          let next = $(el).next();
          while (next.length) {
            const nextText = next.text().trim();
            const tag = next.prop("tagName")?.toLowerCase();
            if (
              tag === "video" ||
              next.find("video").length > 0 ||
              nextText.includes("youtube.com") ||
              nextText.includes("Video:") ||
              nextText.includes("video:") ||
              REGEX.question.test(nextText) ||
              REGEX.cluster.test(nextText) ||
              REGEX.part.test(nextText) ||
              REGEX.subpartTitle.test(nextText) ||
              tag === "li" ||
              tag === "ol"
            ) {
              break;
            }

            if (tag === "p" && REGEX.correct.test(nextText)) {
              const rawAnswer = nextText.split(":")[1]?.trim() || "";
              currentQuestion.correctAnswers = parseCorrectAnswer(rawAnswer);
              currentQuestion.type = detectQuestionType(currentQuestion);
              return;
            }
            next = next.next();
          }
          return;
        }

        if (!currentQuestion) return;
      });

      exam.forEach((item) => {
        if (!item.__isPart && item.type === "unknown") {
          item.type = detectQuestionType(item);
        }
      });

      const parts = transformToExamWord(exam);

      return res.json({
        // rawHtml,
        parts: parts,
      });
    } catch (err) {
      console.log(err);
      return response(
        res,
        null,
        "File lỗi , vui lòng kiểm tra lại thông tin các lỗi thường gặp trong tài liệu",
        statusCode.ERROR
      );
    }
  }
}
module.exports = new DocxPandocController();
