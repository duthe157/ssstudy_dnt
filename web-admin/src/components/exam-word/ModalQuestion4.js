import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listChapter } from "../../redux/chapter/action";
import { listSubject } from "../../redux/subject/action";
import { listCategory } from "../../redux/category/action";
import {
  createQuestion,
  uploadImage,
  listQuestion,
} from "../../redux/question/action";
import { setLoader } from "../LoadingContext";
import $ from "jquery";
import { Radio, notification } from "antd";

import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import "katex/dist/katex.min.css";
import katex from "katex";
import renderMathInElement from "katex/dist/contrib/auto-render";
import baseHelpers from "../../helpers/BaseHelpers";
import "mathlive/mathlive-static.css";
import { MathfieldElement } from "mathlive";

class ModalQuestion4 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questionNo: 1,
      type: "dragdrop",
      dragOptions: [
        { id: 1, text: "", html: "" },
        { id: 2, text: "", html: "" }, // Thêm tùy chọn kéo thứ 2 mặc định
      ],
      mappings: [{ id: 1, blankPosition: "1", correctOptionId: "" }],
      question: null,
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "",
      explanation: "",
      content: "",
      content1: "",
      rawHtml: "",
      actionQuestion: "create",
      currentQuestionvalue: null,
      originalQuestionNo: null,
      showMathFieldOptions: {}, // Thêm để toggle MathfieldElement cho dragOptions
      showMathFieldQuestion: false, // Thêm để toggle MathfieldElement cho question
      showMathFieldExplanation: false, // Thêm để toggle MathfieldElement cho explanation
      selectedMathElement: null,
      isUpdating: false, // ✅ Thêm flag để skip onChange khi load

      // Preview toggles
      showPreviewQuestion: false,
      showPreviewExplanation: false,
      showPreviewOptions: {}, // per-option preview toggle theo id
    };
    this.questionEditor = null; // Thêm ref cho question editor
    this.solutionEditor = null; // Thêm ref cho solution editor
    this.mathFieldQuestionRef = React.createRef(); // Thêm ref cho math field question
    this.mathFieldExplanationRef = React.createRef(); // Thêm ref cho math field explanation
    this.mutationObserver = null; // Thêm cho auto-render
    this._isSettingQuestionContent = false;
    this._isSettingExplanationContent = false;
    this._isSettingAnswerContent = {};
  }

  // Hàm xử lý các thẻ <span class="math"> thành LaTeX (từ ModalQuestion1)
  processMathSpansToLatex = (content) => {
    if (!content) return content;
    return content.replace(
      /<span class="math"[^>]*data-latex="([^"]*)"[^>]*>(.*?)<\/span>|<span class="math"[^>]*>(.*?)<\/span>/gi,
      (match, latexFromData, _, innerContent) => {
        const latex = latexFromData || innerContent || "";
        return latex ? `\\(${latex}\\)` : match;
      },
    );
  };

  decodeHtmlEntities = (html) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
  };
  normalizeLatex = (input) => {
    if (!input) return input;

    return input
      // Math symbols
      .replace(/≠/g, '\\ne')
      .replace(/≤/g, '\\le')
      .replace(/≥/g, '\\ge')

      // HTML entities (phòng trường hợp decode chưa hết)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')

      // Remove unnecessary \text{} around symbols
      .replace(/\\text\{([^}]*)\}/g, '$1')

      // Fix spacing
      .replace(/\s+/g, ' ')
      .trim();
  };
  processLatexInContent = (htmlContent) => {
    if (!htmlContent) return htmlContent;

    let processedContent = htmlContent;

    processedContent = this.decodeHtmlEntities(processedContent);

    // ✅ Auto-fix common LaTeX syntax errors BEFORE processing
    // Fix \frac{...}(...) -> \frac{...}{...}
    processedContent = processedContent.replace(
      /\\frac\{([^}]*)\}\(([^)]*)\)/g,
      "\\frac{$1}{$2}",
    );
    // Fix \frac{...}[...] -> \frac{...}{...}
    processedContent = processedContent.replace(
      /\\frac\{([^}]*)\}\[([^\]]*)\]/g,
      "\\frac{$1}{$2}",
    );
    // Fix \sqrt(...) -> \sqrt{...}
    processedContent = processedContent.replace(
      /\\sqrt\(([^)]*)\)/g,
      "\\sqrt{$1}",
    );
    // Fix missing braces in common commands
    processedContent = processedContent.replace(
      /\\(sum|prod|int|lim)\(([^)]*)\)/g,
      "\\$1{$2}",
    );

    const delimiters = [
      { start: "\\[", end: "\\]", display: true },
      { start: "\\(", end: "\\)", display: false },
      { start: "$$", end: "$$", display: true },
      { start: "$", end: "$", display: false },
    ];

    delimiters.forEach(({ start, end }) => {
      try {
        const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(
          escapedStart + "([\\s\\S]*?)" + escapedEnd,
          "g",
        );

        processedContent = processedContent.replace(regex, (match, latex) => {
          try {
            let cleanedLatex = this.normalizeLatex(String(latex));
            while (
              cleanedLatex &&
              cleanedLatex.endsWith("\\") &&
              !cleanedLatex.endsWith("\\\\")
            ) {
              cleanedLatex = cleanedLatex.slice(0, -1).trim();
            }

            if (!cleanedLatex) return match;
            const rendered = katex.renderToString(cleanedLatex, {
              output: "html",
              throwOnError: true,
            });
            const escapedLatex = String(cleanedLatex).replace(/"/g, "&quot;");
            const renderedWithAttr = rendered.replace(
              '<span class="katex"',
              `<span class="katex" data-latex="${escapedLatex}"`,
            );
            return `<span class="math-symbol" data-latex="${escapedLatex}">${renderedWithAttr}</span>`;
          } catch (error) {
            console.error(
              "❌ LaTeX render error:",
              error.message,
              "| LaTeX:",
              latex,
            );
            // ✅ Return warning span với error message rõ ràng
            const escapedLatex = String(latex).replace(/"/g, "&quot;");
            const errorMsg = String(error.message).replace(/"/g, "&quot;");
            return `<span class="math-error" style="color: #dc3545; border: 2px dashed #dc3545; padding: 3px 6px; background: #f8d7da; border-radius: 3px; font-family: monospace; font-size: 0.9em;" title="❌ Lỗi LaTeX: ${errorMsg}">\\(${escapedLatex}\\)</span>`;
          }
        });
      } catch (error) {
        console.error("Regex creation error:", error);
      }
    });

    return processedContent;
  };

  // Hàm xử lý hình ảnh base64 để hiển thị chính xác
  processImageContent = (content) => {
    if (!content) return content;

    // Thay thế các thẻ img để hiển thị hình ảnh với styling responsive
    return content.replace(
      /<img([^>]*src="data:image\/[^"]*"[^>]*)>/gi,
      '<img$1 style="max-width: 100%; height: auto; display: block; margin: 10px 0;" class="img-fluid responsive-image">',
    );
  };

  // Hàm chuẩn bị nội dung cho editor với xử lý ký tự đặc biệt
  prepareContentForEditor = (content) => {
    if (!content) return "";

    // Unescape các ký tự HTML entities
    const unescaped = content
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, "&");

    // Xử lý hình ảnh và math
    return this.processImageContent(this.processMathSpansToLatex(unescaped));
  };

  // Hàm set nội dung editor một cách an toàn
  setEditorContentSafely = (editor, content) => {
    if (!editor || typeof editor.setContents !== "function") return;

    try {
      const processedContent = this.removeLiTags(
        this.prepareContentForEditor(content),
      );
      editor.setContents(processedContent);
    } catch (error) {
      console.warn("Error setting editor content:", error);
      // Fallback: set content without processing
      try {
        editor.setContents(this.removeLiTags(content || ""));
      } catch (fallbackError) {
        console.error(
          "Failed to set editor content even with fallback:",
          fallbackError,
        );
      }
    }
  };

  componentDidUpdate(prevProps) {
    const { questionNo, actionQuestion, currentQuestionvalue } = this.props;

    if (prevProps.questionNo !== questionNo) {
      this.setState({ questionNo });
    }

    if (prevProps.actionQuestion !== actionQuestion) {
      this.setState({ actionQuestion });

      // ✅ THÊM: Reset khi chuyển từ update sang create
      if (
        prevProps.actionQuestion === "update" &&
        this.props.actionQuestion === "create"
      ) {
        this.clearAllInputs();
      }
    }

    if (
      prevProps.currentQuestionvalue !== currentQuestionvalue &&
      currentQuestionvalue
    ) {
      const {
        answer,
        answer_content,
        doc_link,
        video_link,
        question_no,
        level,
        question_level,
        explanation,
        correctAnswers,
        type,
      } = currentQuestionvalue || {};

      // Initialize default values
      let dragOptions = [{ id: 1, text: "", html: "" }];
      let mappings = [{ id: 1, blankPosition: "1", correctOptionId: "" }];

      const rawChoices =
        currentQuestionvalue.dragDropOptions ||
        currentQuestionvalue.choices ||
        currentQuestionvalue.options ||
        [];

      try {
        // Normalize incoming dragDropOptions into array of strings
        if (Array.isArray(rawChoices) && rawChoices.length > 0) {
          let optionsArray = [];
          rawChoices.forEach((choice) => {
            if (typeof choice === "string" && choice.includes(",")) {
              // Tách theo dấu phẩy để xử lý options riêng biệt
              const splitOptions = choice
                .split(",")
                .map((opt) => opt.trim())
                .filter((opt) => opt);
              optionsArray = optionsArray.concat(splitOptions);
            } else {
              optionsArray.push(choice);
            }
          });
          dragOptions = optionsArray
            .map((opt, index) => {
              // ✅ Process LaTeX delimiters thành rendered KaTeX spans
              const rawText = this.extractOptionText(opt);
              const withDelimiters = this.processMathSpansToLatex(rawText);
              const processedHtml = this.processLatexInContent(withDelimiters); // Render LaTeX
              const cleanedHtml = this.removeLiTags(processedHtml);

              return {
                id: index + 1,
                text: cleanedHtml, // Rendered HTML with KaTeX spans
                html: cleanedHtml, // Same rendered HTML
              };
            })
            .filter((opt) => opt.text);
        }

        // Normalize incoming correctAnswers using helper
        if (Array.isArray(correctAnswers) && correctAnswers.length > 0) {
          mappings = correctAnswers
            .map((answerObj, index) => {
              const parsed = this.parseCorrectAnswerEntry(answerObj, index);
              // ✅ Thêm: Nếu parsed.answer là index (number), map thành text của option tại index đó
              let correctOptionId = String(parsed.answer);
              if (
                typeof parsed.answer === "number" &&
                parsed.answer >= 1 &&
                parsed.answer <= dragOptions.length
              ) {
                correctOptionId =
                  dragOptions[parsed.answer - 1]?.text || String(parsed.answer);
              } else if (typeof parsed.answer === "string") {
                // Nếu là string, tìm option có text khớp
                const matchingOption = dragOptions.find(
                  (opt) => opt.text === parsed.answer,
                );
                correctOptionId = matchingOption
                  ? matchingOption.text
                  : parsed.answer;
              }
              return {
                id: index + 1,
                blankPosition: String(parsed.position),
                correctOptionId: correctOptionId,
              };
            })
            .filter((map) => map.correctOptionId);
        }

        // Fallback: legacy answer format
        if (
          dragOptions.length === 0 &&
          mappings.length === 0 &&
          Array.isArray(answer) &&
          answer.length > 0
        ) {
          dragOptions = answer
            .map((item, index) => ({
              id: index + 1,
              text: this.removeLiTags(this.extractOptionText(item)),
              html: this.removeLiTags(
                this.cleanHtmlContent(
                  this.processMathSpansToLatex(this.extractOptionText(item)),
                ),
              ),
              text: this.removeLiTags(
                this.cleanExplanation(
                  this.processMathSpansToLatex(this.extractOptionText(item)),
                ),
              ),
            }))
            .filter((opt) => opt.text);

          mappings = answer
            .map((item, index) => ({
              id: index + 1,
              blankPosition: String(item?.value || item?.answer || index + 1),
              correctOptionId: this.extractOptionText(
                item?.key || item?.question || item,
              ),
            }))
            .filter((map) => map.correctOptionId);
        }

        // Ensure minimum entries
        if (dragOptions.length < 2) {
          dragOptions = [
            { id: 1, text: "", html: "" },
            { id: 2, text: "", html: "" },
          ];
        }
        if (mappings.length === 0)
          mappings = [{ id: 1, blankPosition: "1", correctOptionId: "" }];
      } catch (err) {
        dragOptions = [{ id: 1, text: "", html: "", text: "" }];
        mappings = [{ id: 1, blankPosition: "1", correctOptionId: "" }];
      }

      // Đơn giản hóa mapLevel - chỉ pass-through với fallback
      const mapLevel = (lvl) => {
        if (!lvl) return "";
        return lvl; // Giữ nguyên giá trị, loại bỏ switch phức tạp
      };

      const mappedLevel = mapLevel(level || question_level);

      this.setState({
        currentQuestionvalue,
        answer_content: answer_content || null,
        doc_link: doc_link || "",
        video_link: video_link || "",
        level: mappedLevel || "",
        explanation: this.removeLiTags(explanation || doc_link || ""),
        dragOptions,
        mappings,
        questionNo: questionNo || question_no || 1, // ✅ Ưu tiên props.questionNo (đã được tính toán đúng)
        content1: this.removeLiTags(answer_content || ""),
        rawHtml: this.removeLiTags(currentQuestionvalue?.rawHtml || ""),
        // đảm bảo type đúng nếu payload là 'dragdrop'
        type:
          type && String(type).toUpperCase().includes("DRAG")
            ? "dragdrop"
            : this.state.type,
        ...(this.state.originalQuestionNo === null && {
          originalQuestionNo: questionNo || question_no || 1,
        }), // ✅ Ưu tiên props.questionNo
      });

      // Update solution editor content
      setTimeout(() => {
        if (this.solutionEditor) {
          const content = explanation || doc_link || "";
          this.setEditorContentSafely(this.solutionEditor, content);
        }
      }, 100);

      // Update question editor content (ưu tiên rawHtml nếu có)
      setTimeout(() => {
        if (this.questionEditor) {
          const rawContent =
            currentQuestionvalue?.rawHtml &&
              String(currentQuestionvalue.rawHtml).trim()
              ? currentQuestionvalue.rawHtml
              : answer_content || "";

          this.setEditorContentSafely(this.questionEditor, rawContent);

          // ✅ đồng bộ state hiển thị với processed content
          const processedContent = this.removeLiTags(
            this.prepareContentForEditor(rawContent),
          );
          this.setState({
            content1: processedContent,
            rawHtml: this.removeLiTags(rawContent),
          });
        }
      }, 100);

      // Update dragOptions editors
      setTimeout(() => {
        this.setState({ isUpdating: true }, () => {
          this.state.dragOptions.forEach((option) => {
            const optionEditor = this[`optionEditor_${option.id}`];
            if (
              optionEditor &&
              typeof optionEditor.setContents === "function"
            ) {
              try {
                optionEditor.setContents(option.html || "");
              } catch (error) {
                console.warn(
                  `Failed to set contents for option ${option.id}:`,
                  error,
                );
              }
            }
          });
          // ✅ Reset flag so user edits are captured for subsequent creations
          this.setState({ isUpdating: false });
        });
      }, 200);
    }
  }

  setupAutoRender = () => {
    const container =
      document.querySelector("#modalQuestion4") ||
      document.querySelector("#create4") ||
      document.body;
    if (container) {
      renderMathInElement(container, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }

    // ✅ Mở rộng render LaTeX cho toàn bộ #mappings-section (bao gồm button và menu)
    setTimeout(() => {
      const mappingsSection = document.querySelector("#mappings-section");
      if (mappingsSection) {
        renderMathInElement(mappingsSection, {
          delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      }
    }, 100);
  };

  cleanupMutationObserver = () => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  };

  async componentDidMount() {
    // ✅ THÊM: Đăng ký MathfieldElement để thẻ <math-field> hoạt động
    if (!customElements.get("math-field")) {
      customElements.define("math-field", MathfieldElement);
    }

    // ✅ CẢI THIỆN: Reset ngay khi component mount nếu là create mode
    if (this.props.actionQuestion === "create") {
      this.clearAllInputs();
    }

    // Khi component được mount, thêm sự kiện lắng nghe để reset state khi modal hiển thị
    $(document).on("show.bs.modal", "#modalQuestion4, #create4", () => {
      if (this.props.actionQuestion === "create") {
        this.clearAllInputs();
      }
    });

    // Thêm sự kiện lắng nghe khi modal đóng
    $(document).on("hide.bs.modal", "#modalQuestion4, #create4", () => {
      this.clearAllInputs();
    });

    // Thêm setup cho auto-render và MutationObserver
    const modals = document.querySelectorAll("#modalQuestion4, #create4");
    modals.forEach((modal) => {
      modal.addEventListener("shown.bs.modal", () => { });
      modal.addEventListener("hidden.bs.modal", () => {
        this.cleanupMutationObserver();
      });
    });

    // ✅ Thêm event listener cho dropdown để render LaTeX khi mở
    $(document).on("show.bs.dropdown", "#mappings-section .dropdown", () => {
      setTimeout(() => {
        const dropdownMenu = document.querySelector(
          "#mappings-section .dropdown-menu",
        );
        if (dropdownMenu) {
          renderMathInElement(dropdownMenu, {
            delimiters: [
              { left: "\\(", right: "\\)", display: false },
              { left: "\\[", right: "\\]", display: true },
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
          });
        }
      }, 50);
    });
  }

  componentWillUnmount() {
    // Xóa sự kiện lắng nghe khi component bị hủy
    $(document).off("show.bs.modal", "#modalQuestion4, #create4");
    $(document).off("show.bs.dropdown", "#mappings-section .dropdown");
    this.cleanupMutationObserver();
  }

  // Phương thức đặt lại nội dung của Editor
  resetEditorContent = () => {
    this.setState({
      content1: "",
      explanation: "",
      rawHtml: "",
      selectedMathElement: null,
    }); // ✅ Reset content
    if (this.questionEditor) {
      this.questionEditor.setContents("");
    }
    if (this.solutionEditor) {
      this.solutionEditor.setContents("");
    }
  };

  // Phương thức đặt lại state về giá trị mặc định
  resetState = () => {
    this.setState({
      questionNo: this.props.questionNo || 1,
      type: "dragdrop",
      dragOptions: [
        { id: 1, text: "", html: "" },
        { id: 2, text: "", html: "" }, // Default với html và text
      ],
      mappings: [{ id: 1, blankPosition: "1", correctOptionId: "" }],
      question: null,
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "",
      explanation: "",
      content: "",
      content1: "",
      rawHtml: "",
      actionQuestion: this.props.actionQuestion,
      currentQuestionvalue: null,
      selectedMathElement: null,
      isUpdating: false, // ✅ Đảm bảo onChange hoạt động ở lần tạo mới
    });
  };

  // Phương thức làm sạch tất cả các ô input
  clearAllInputs = () => {
    // ✅ THÊM: Reset currentQuestionvalue trước tiên
    this.setState(
      { currentQuestionvalue: null, selectedMathElement: null },
      () => {
        // Reset state
        this.resetState();
        this.resetEditorContent();

        // Clear DOM input elements
        setTimeout(() => {
          // Clear video link input
          const videoInput = document.querySelector('input[name="video_link"]');
          if (videoInput) videoInput.value = "";

          // Clear any other input fields if needed
          const inputs = document.querySelectorAll(
            '#modalQuestion4 input[type="text"], #create4 input[type="text"]',
          );
          inputs.forEach((input) => {
            if (input.name !== "video_link") {
              // Keep video_link as it's handled by state
              input.value = "";
            }
          });

          // Clear select elements
          const selects = document.querySelectorAll(
            "#modalQuestion4 select, #create4 select",
          );
          selects.forEach((select) => {
            select.selectedIndex = 0;
          });

          // Clear radio buttons if any
          const radios = document.querySelectorAll(
            '#modalQuestion4 input[type="radio"], #create4 input[type="radio"]',
          );
          radios.forEach((radio) => {
            radio.checked = false;
          });

          // Clear all drag option editors
          Object.keys(this).forEach((key) => {
            if (
              key.startsWith("optionEditor_") &&
              this[key] &&
              typeof this[key].setContents === "function"
            ) {
              this[key].setContents("");
            }
          });
        }, 400);
      },
    );
  };

  // Helper: safely extract a display/string value from option-like objects
  extractOptionText = (opt) => {
    if (opt === null || opt === undefined) return "";
    if (typeof opt === "string") return opt.trim();
    if (typeof opt === "number") return String(opt);
    if (typeof opt === "object") {
      // Common keys used in different formats
      const candidates = [
        "text",
        "label",
        "value",
        "question",
        "key",
        "rawHtml",
        "content",
        "name",
      ];
      for (const k of candidates) {
        if (k in opt && opt[k] != null) {
          if (typeof opt[k] === "string") return opt[k].trim();
          if (typeof opt[k] === "number") return String(opt[k]);
          // Recursive for nested objects
          if (typeof opt[k] === "object") return this.extractOptionText(opt[k]);
        }
      }
      // Try to extract plain text from nested rawHtml
      if (opt.rawHtml && typeof opt.rawHtml === "string") {
        return this.cleanHtmlContent(opt.rawHtml);
      }
      // Fallback: JSON stringify small objects to preserve structure rather than [object Object]
      try {
        const s = JSON.stringify(opt);
        return s.length > 200 ? s.slice(0, 200) + "..." : s;
      } catch (e) {
        // Avoid returning "[object Object]" - return empty string instead
        return "";
      }
    }
    return String(opt);
  };

  // Helper: parse a correctAnswers entry which can be string or object
  parseCorrectAnswerEntry = (entry, fallbackIndex = 0) => {
    if (entry === null || entry === undefined)
      return { position: String(fallbackIndex + 1), answer: "" };
    // If entry is object with value
    if (typeof entry === "object") {
      const raw = entry.value ?? entry.answer ?? entry.label ?? entry;
      if (typeof raw === "string") {
        const s = raw.trim();
        if (s.includes(":")) {
          const parts = s.split(":");
          return {
            position: String(parts[0]).trim() || String(fallbackIndex + 1),
            answer: parts.slice(1).join(":").trim(),
          };
        }
        return { position: String(fallbackIndex + 1), answer: s };
      }
      // raw may be an object
      if (typeof raw === "object") {
        return {
          position: String(
            entry.position ?? entry.blankPosition ?? fallbackIndex + 1,
          ),
          answer: this.extractOptionText(raw) || "",
        };
      }
      return { position: String(fallbackIndex + 1), answer: String(raw) };
    }
    // entry is primitive
    if (typeof entry === "string") {
      const s = entry.trim();
      if (s.includes(":")) {
        const parts = s.split(":");
        return {
          position: String(parts[0]).trim() || String(fallbackIndex + 1),
          answer: parts.slice(1).join(":").trim(),
        };
      }
      return { position: String(fallbackIndex + 1), answer: s };
    }
    return { position: String(fallbackIndex + 1), answer: String(entry) };
  };

  // Handle drag option text change
  handleDragOptionChange = (id, text) => {
    const coercedText = this.extractOptionText(text); // Coerce to string
    const processedText = this.processLatexInContent(coercedText); // Process LaTeX
    this.setState(
      (prevState) => ({
        dragOptions: prevState.dragOptions.map((option) =>
          option.id === id
            ? { ...option, text: processedText, html: processedText }
            : option,
        ),
      }),
      () => {
        // ✅ Render LaTeX sau khi thay đổi option để dropdown hiển thị đúng
        setTimeout(() => {
          const mappingsSection = document.querySelector("#mappings-section");
          if (mappingsSection) {
            renderMathInElement(mappingsSection, {
              delimiters: [
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true },
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
              ],
              throwOnError: false,
            });
          }
        }, 50);
      },
    );
  };

  // Handle mapping change
  handleMappingChange = (id, field, value) => {
    // Coerce the value for correctOptionId to a primitive string to avoid storing objects
    const coercedValue =
      field === "correctOptionId"
        ? value === null || value === undefined
          ? ""
          : typeof value === "object"
            ? this.extractOptionText(value)
            : String(value)
        : value;

    this.setState(
      (prevState) => ({
        mappings: prevState.mappings.map((mapping) =>
          mapping.id === id ? { ...mapping, [field]: coercedValue } : mapping,
        ),
      }),
      () => {
        // ✅ Thêm render LaTeX sau khi update để button hiển thị đúng
        setTimeout(() => {
          const mappingsSection = document.querySelector("#mappings-section");
          if (mappingsSection) {
            renderMathInElement(mappingsSection, {
              delimiters: [
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true },
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
              ],
              throwOnError: false,
            });
          }
        }, 50);
      },
    );
  };

  // Add new drag option
  addDragOption = () => {
    const newId = Date.now();
    this.setState(
      (prevState) => ({
        dragOptions: [
          ...prevState.dragOptions,
          { id: newId, text: "", html: "" },
        ],
      }),
      () => {
        // Focus vào editor mới sau khi render
        setTimeout(() => {
          if (
            this[`optionEditor_${newId}`] &&
            typeof this[`optionEditor_${newId}`].focus === "function"
          ) {
            this[`optionEditor_${newId}`].focus();
          }
        }, 200);
      },
    );
  };

  // Remove drag option
  removeDragOption = (id) => {
    this.setState((prevState) => ({
      dragOptions: prevState.dragOptions.filter((option) => option.id !== id),
    }));
  };

  // Add new mapping
  addMapping = () => {
    this.setState(
      (prevState) => {
        const prevMappings = Array.isArray(prevState.mappings)
          ? prevState.mappings
          : [];
        // determine numeric max of existing blankPosition, fallback to 0
        const maxPos = prevMappings.reduce((max, m) => {
          const v = parseInt(m.blankPosition, 10);
          if (!isNaN(v) && isFinite(v)) return Math.max(max, v);
          return max;
        }, 0);
        const nextPos = String(maxPos + 1);
        return {
          mappings: [
            ...prevMappings,
            { id: Date.now(), blankPosition: nextPos, correctOptionId: "" },
          ],
        };
      },
      () => {
        // ✅ Render LaTeX sau khi thêm mapping mới
        setTimeout(() => {
          const mappingsSection = document.querySelector("#mappings-section");
          if (mappingsSection) {
            renderMathInElement(mappingsSection, {
              delimiters: [
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true },
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
              ],
              throwOnError: false,
            });
          }
        }, 50);
      },
    );
  };

  // Remove mapping
  removeMapping = (id) => {
    this.setState((prevState) => ({
      mappings: prevState.mappings.filter((mapping) => mapping.id !== id),
    }));
  };

  // Hàm làm sạch HTML tags - comprehensive cleaning
  cleanHtmlContent = (content) => {
    if (!content) return "";
    return content.replace(/<[^>]*>/g, "").trim();
  };

  // Hàm loại bỏ thẻ <li> khỏi nội dung
  removeLiTags = (content) => {
    if (!content) return content;
    return content.replace(/<li[^>]*>/gi, "").replace(/<\/li>/gi, "");
  };

  // Hàm loại bỏ dấu chấm (thẻ li) và bullet points khỏi nội dung câu hỏi
  cleanBulletPoints = (content) => {
    if (!content) return "";

    let cleanedContent = content;

    // Loại bỏ các thẻ <li> và nội dung bên trong, giữ lại text
    cleanedContent = cleanedContent.replace(/<li[^>]*>(.*?)<\/li>/gi, "$1");

    // Loại bỏ các dấu bullet points phổ biến
    cleanedContent = cleanedContent.replace(
      /^[•·◦▪▫▸▹►▻◘○◎◙●◉◊◆◇◈◉◊◆◇◈]/gm,
      "",
    );
    cleanedContent = cleanedContent.replace(/^[-*]\s*/gm, "");

    // Loại bỏ các ký tự bullet Unicode
    cleanedContent = cleanedContent.replace(
      /[\u2022\u2023\u2043\u204C\u204D\u2219\u25AA\u25AB\u25B6\u25B8\u25BA\u25BC\u25BE\u25C0\u25C2\u25C4\u25C6\u25C8\u25CA\u25CC\u25CE\u25D0\u25D2\u25D4\u25D6\u25D8\u25DA\u25DC\u25DE\u25E0\u25E2\u25E4\u25E6]/g,
      "",
    );

    // Loại bỏ số thứ tự ở đầu dòng (1. 2. 3. hoặc 1) 2) 3))
    cleanedContent = cleanedContent.replace(/^\d+[\.\)]\s*/gm, "");

    // Loại bỏ chữ cái thứ tự ở đầu dòng (a. b. c. hoặc a) b) c))
    cleanedContent = cleanedContent.replace(/^[a-zA-Z][\.\)]\s*/gm, "");

    // Loại bỏ khoảng trắng thừa ở đầu dòng
    cleanedContent = cleanedContent.replace(/^\s+/gm, "");

    return cleanedContent.trim();
  };

  // Hàm làm sạch nội dung giải thích, loại bỏ các thẻ HTML rỗng
  cleanExplanation = (explanation) => {
    if (!explanation) return null;
    // Loại bỏ tất cả thẻ HTML và kiểm tra nội dung còn lại
    const plainText = this.cleanHtmlContent(explanation);
    // Nếu chỉ còn nội dung rỗng sau khi loại bỏ HTML, trả về null
    return plainText ? explanation : null;
  };

  extractLatexFromHtml = (html) => {
    if (!html) return "";
    const matches =
      html.match(/\\\((.*?)\\\)/g) ||
      html.match(
        /<span class="math"[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/gi,
      );
    if (matches) {
      return matches
        .map((m) =>
          m
            .replace(/\\\(|\\\)/g, "")
            .replace(
              /<span class="math"[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/gi,
              "$1",
            ),
        )
        .join(" ");
    }
    return "";
  };

  handleSave = async (e) => {
    setLoader(true);
    e.preventDefault();

    let questionContent = this.state.rawHtml;
    if (
      !questionContent ||
      questionContent.trim() === "" ||
      questionContent === "<p></p>"
    ) {
      alert("Vui lòng nhập nội dung câu hỏi!");
      setLoader(false);
      return;
    }

    // Validate drag options
    if (
      this.state.dragOptions.some(
        (option) => !option.text || option.text.trim() === "",
      )
    ) {
      alert("Vui lòng điền nội dung cho tất cả tùy chọn kéo!");
      setLoader(false);
      return;
    }

    // Validate mappings
    if (
      this.state.mappings.some(
        (mapping) =>
          !mapping.correctOptionId || !mapping.correctOptionId.trim(),
      )
    ) {
      alert("Vui lòng điền đầy đủ tất cả đáp án đúng!");
      setLoader(false);
      return;
    }

    let explanationContent = this.solutionEditor
      ? this.solutionEditor.getContents()
      : this.state.explanation || "";

    let {
      examId,
      examSectionId,
      examSectionGroupId,
      currentSubjectId,
      currentTopicId,
      questionIdGroupTopic,
      childExamId,
    } = this.props;

    const mapLevelToShort = (lvl) => lvl || "";

    // Build dragDropOptions
    const dragDropOptions = [
      (this.state.dragOptions || [])
        .map((option) => option.text || "")
        .filter((text) => text && text.trim())
        .join(", "),
    ];

    // Build correctAnswers
    const correctAnswers = (this.state.mappings || [])
      .filter((mapping) => mapping && String(mapping.correctOptionId).trim())
      .map((mapping) => {
        const answerText = this.cleanHtmlContent(
          this.extractOptionText(mapping.correctOptionId),
        );
        return {
          label: "",
          value: answerText,
          rawHtml: answerText,
        };
      })
      .filter((item) => item.value && item.value.trim());

    let question = {
      exam_id: examId,
      exam_section_id: examSectionId === "" ? null : examSectionId,
      exam_section_group_id:
        examSectionGroupId === "" ? null : examSectionGroupId,
      subject_id: currentSubjectId,
      topic_id: currentTopicId,
      questionTopicGroupId: questionIdGroupTopic,
      childExamId: childExamId,
      rawHtml: questionContent,
      dragDropOptions,
      choices: [],
      correctAnswers,
      answer: (this.state.mappings || [])
        .filter(
          (mapping) =>
            mapping && mapping.blankPosition && mapping.correctOptionId,
        )
        .map((mapping) => ({
          key: this.cleanHtmlContent(String(mapping.correctOptionId).trim()),
          value: String(mapping.blankPosition).trim(),
        })),
      answer_content: questionContent,
      type: this.state.type,
      level: mapLevelToShort(this.state.level),
      question_no: this.state.questionNo,
      explanation: explanationContent,
      video_link: this.state.video_link || "",
      __temp: false,
    };
    console.log("Prepared question object:", question);
    if (
      this.state.actionQuestion === "update" &&
      this.state.currentQuestionvalue
    ) {
      const currentQ = this.state.currentQuestionvalue;
      const validId = currentQ._id || currentQ.id || currentQ.question_id;

      if (!validId) {
        alert("Không tìm thấy ID câu hỏi để cập nhật!");
        setLoader(false);
        return;
      }

      question._id = validId;
      question.id = validId;
      question.question_id = validId;
      question.created_at = currentQ.created_at || new Date().toISOString();
      question.updated_at = new Date().toISOString();
      question.question_no =
        currentQ.question_no ||
        this.state.originalQuestionNo ||
        this.state.questionNo;
    } else {
      const uniqueId = `manual-${Date.now()}-${Math.random()}`;
      question._id = uniqueId;
      question.question_id = uniqueId;
      question.code = `${this.state.questionNo}`;
      question.created_at = new Date().toISOString();
    }

    try {
      if (this.state.actionQuestion === "create") {
        await this.props.actionCreateQuestion(question);
      } else {
        await this.props.actionUpdateQuestion(question);
      }
      this.closeModal();
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại!");
    } finally {
      setLoader(false);
    }
  };

  closeModal = () => {
    // Đặt lại state và nội dung Editor trước khi đóng modal
    this.clearAllInputs();
    $("#close_create_4").trigger("click");
  };

  _handleEditorContentChange = (content) => {
    if (this._isSettingQuestionContent) return;

    const processedContent = this.processLatexInContent(content);

    // Giống modal2: lưu rawHtml và content1 trực tiếp với nội dung đã xử lý LaTeX
    this.setState({
      rawHtml: processedContent,
      content1: processedContent,
    });

    if (processedContent !== content && /(\\\(|\\\[|\$\$|\$)/.test(content)) {
      this._isSettingQuestionContent = true;
      setTimeout(() => {
        try {
          if (
            this.questionEditor &&
            typeof this.questionEditor.setContents === "function"
          ) {
            this.questionEditor.setContents(processedContent);
          }
        } finally {
          this._isSettingQuestionContent = false;
        }
      }, 0);
    }

    if (this.state.showPreviewQuestion) {
      setTimeout(() => {
        this.renderPreviewQuestion();
      }, 100);
    }
  };

  _handleSolutionEditorChange = (content) => {
    if (this._isSettingExplanationContent) return;

    const processedContent = this.processLatexInContent(content);
    const cleanedContent = this.cleanHtmlContent(processedContent);
    this.setState({ explanation: cleanedContent });

    if (processedContent !== content && /(\\\(|\\\[|\$\$|\$)/.test(content)) {
      this._isSettingExplanationContent = true;
      setTimeout(() => {
        try {
          if (
            this.solutionEditor &&
            typeof this.solutionEditor.setContents === "function"
          ) {
            this.solutionEditor.setContents(processedContent);
          }
        } finally {
          this._isSettingExplanationContent = false;
        }
      }, 0);
    }

    if (this.state.showPreviewExplanation) {
      setTimeout(() => {
        this.renderPreviewExplanation();
      }, 100);
    }
  };

  // ✅ Chuyển file thành Base64 data URLs để embed trực tiếp vào content
  handleImageUploadBefore = async (files, info, uploadHandler) => {
    try {
      const base64Urls = [];

      // Convert tất cả files thành base64 data URLs
      for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result); // Data URL (data:image/...)
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        base64Urls.push(base64);
      }

      // Tạo response cho SunEditor với base64 data URLs
      const response = {
        result: base64Urls.map((url, index) => ({
          url,
          name: files[index]?.name || `image_${index + 1}`,
          size: files[index]?.size || 0,
        })),
      };

      // Gửi uploadHandler để SunEditor tự động embed ảnh vào content
      await uploadHandler(response);
    } catch (error) {
      console.error("Convert image to base64 failed:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể chuyển hình ảnh. Vui lòng thử lại!",
      });
    }
  };

  _onChange = (e) => {
    // Handle both regular input events and Ant Design Radio.Group events
    if (e && e.target) {
      // Regular input event
      var name = e.target.name;
      var value = e.target.value;
      this.setState({
        [name]: value,
      });
    } else {
      // Ant Design Radio.Group event - value is passed directly
      this.setState({
        level: e,
      });
    }
  };

  toggleMathFieldForOption = (optionId) => {
    this.setState((prevState) => ({
      showMathFieldOptions: {
        ...prevState.showMathFieldOptions,
        [optionId]: !prevState.showMathFieldOptions[optionId],
      },
    }));
  };

  toggleMathFieldForQuestion = () => {
    this.setState((prevState) => ({
      showMathFieldQuestion: !prevState.showMathFieldQuestion,
    }));
  };

  toggleMathFieldForExplanation = () => {
    this.setState((prevState) => ({
      showMathFieldExplanation: !prevState.showMathFieldExplanation,
    }));
  };

  handleMathClick = (elOrEvent, target, optionId = null) => {
    const el = elOrEvent && elOrEvent.target ? elOrEvent.target : elOrEvent;
    if (!el || !el.closest) return;

    let mathSymbol = el.closest(".math-symbol");
    let katexElement = el.closest(".katex");
    if (katexElement && !mathSymbol) {
      mathSymbol = katexElement.closest(".math-symbol");
    }

    const mathInline = mathSymbol || katexElement;
    if (mathInline) {
      let latex = mathSymbol ? mathSymbol.getAttribute("data-latex") : null;
      if (!latex && katexElement) {
        latex = katexElement.getAttribute("data-latex");
        if (!latex) {
          let current = katexElement.parentElement;
          for (let i = 0; i < 3 && current; i++) {
            if (current.hasAttribute && current.getAttribute("data-latex")) {
              latex = current.getAttribute("data-latex");
              break;
            }
            current = current.parentElement;
          }
        }
      }

      this.setState({ selectedMathElement: mathSymbol || mathInline });
      if (latex) {
        if (target === "question") {
          this.setState({ showMathFieldQuestion: true });
          setTimeout(() => {
            const mathField = document.getElementById("math-field-question");
            if (mathField) {
              mathField.setValue(latex);
              mathField.focus();
            }
          }, 100);
        } else if (target === "explanation") {
          this.setState({ showMathFieldExplanation: true });
          setTimeout(() => {
            const mathField = document.getElementById("math-field-explanation");
            if (mathField) {
              mathField.setValue(latex);
              mathField.focus();
            }
          }, 100);
        } else if (target === "option" && optionId) {
          this.setState((prevState) => ({
            showMathFieldOptions: {
              ...prevState.showMathFieldOptions,
              [optionId]: true,
            },
          }));
          setTimeout(() => {
            const mathField = document.getElementById(
              `math-field-option-${optionId}`,
            );
            if (mathField) {
              mathField.setValue(latex);
              mathField.focus();
            }
          }, 100);
        }
      }
    }
  };
  attachMathClickListener = (editor, target, optionId = null) => {
    if (
      !editor ||
      !editor.core ||
      !editor.core.context ||
      !editor.core.context.element
    )
      return;
    const wysiwyg = editor.core.context.element.wysiwyg;
    if (!wysiwyg) return;
    // Avoid duplicate listeners
    wysiwyg.addEventListener("click", (e) => {
      const mathSymbol = e.target.closest(".katex, .math-symbol");
      if (mathSymbol) {
        this.handleMathClick(mathSymbol, target, optionId);
      }
    });
  };
  insertFromField = (target, optionId = null) => {
    let mathFieldId;
    let editor;

    if (target === "question") {
      mathFieldId = "math-field-question";
      editor = this.questionEditor;
    } else if (target === "explanation") {
      mathFieldId = "math-field-explanation";
      editor = this.solutionEditor;
    } else if (target === "option" && optionId) {
      mathFieldId = `math-field-option-${optionId}`;
      editor = this[`optionEditor_${optionId}`];
    } else {
      return;
    }

    const mathfield = document.getElementById(mathFieldId);
    if (!mathfield || !editor) return;

    const latex = mathfield.getValue();
    if (latex) {
      try {
        if (
          this.state.selectedMathElement &&
          !window.confirm("Thay thế công thức hiện tại?")
        ) {
          return;
        }

        // Lưu vị trí scroll trước khi thao tác
        const editorElement = editor.core.context.element.wysiwyg;
        const scrollTop = editorElement ? editorElement.scrollTop : 0;

        // Create math-symbol span with LaTeX data and rendered content
        const renderedLatex = katex.renderToString(latex, { output: "html" });
        const escapedLatex = String(latex).replace(/"/g, "&quot;");
        const renderedWithAttr = renderedLatex.replace(
          '<span class="katex"',
          `<span class="katex" data-latex="${escapedLatex}"`,
        );
        const mathSymbolHTML = `<span class="math-symbol" data-latex="${escapedLatex}">${renderedWithAttr}</span>`;

        // Nếu đang thay thế element cũ
        if (this.state.selectedMathElement) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = mathSymbolHTML;
          const newElement = tempDiv.firstChild;

          // Thay thế element cũ bằng element mới tại chỗ
          this.state.selectedMathElement.parentNode.replaceChild(
            newElement,
            this.state.selectedMathElement,
          );

          // Tạo range mới và đặt cursor sau element vừa thay thế
          const newRange = document.createRange();
          const newSelection = window.getSelection();
          newRange.setStartAfter(newElement);
          newRange.collapse(true);
          newSelection.removeAllRanges();
          newSelection.addRange(newRange);

          this.setState({ selectedMathElement: null });
        } else {
          // Chèn mới tại vị trí cursor
          editor.insertHTML(mathSymbolHTML);
        }

        // Cập nhật state và đóng math field
        const content = editor.getContents();
        if (target === "question") {
          this.setState({
            rawHtml: content,
            showMathFieldQuestion: false,
          });
        } else if (target === "explanation") {
          this.setState({
            explanation: content,
            showMathFieldExplanation: false,
          });
        } else if (target === "option" && optionId) {
          this.updateOption(optionId, content, content);
          this.setState((prevState) => ({
            showMathFieldOptions: {
              ...prevState.showMathFieldOptions,
              [optionId]: false,
            },
          }));
        }

        // Khôi phục scroll và focus vào editor
        setTimeout(() => {
          if (editorElement) {
            editorElement.scrollTop = scrollTop;
          }
          // Focus vào editor để có thể tiếp tục chỉnh sửa
          editor.core.focus();
        }, 10);

        mathfield.setValue("");
      } catch (error) {
        console.error("Error inserting LaTeX:", error);
        notification.error({
          message: "Lỗi",
          description: "Có lỗi khi chèn công thức LaTeX. Vui lòng thử lại.",
        });
      }
    }
  };

  updateOption = (optionId, text, html = null) => {
    // Process LaTeX in content before storing
    const processedText = text ? this.processLatexInContent(text) : text;
    const processedHtml = html ? this.processLatexInContent(html) : html;

    this.setState(
      (prevState) => ({
        dragOptions: prevState.dragOptions.map((option) =>
          option.id === optionId
            ? {
              ...option,
              text: processedText || option.text,
              html: processedHtml || processedText || option.html,
            }
            : option,
        ),
      }),
      () => {
        // ✅ Render LaTeX sau khi update option để dropdown hiển thị đúng
        setTimeout(() => {
          const mappingsSection = document.querySelector("#mappings-section");
          if (mappingsSection) {
            renderMathInElement(mappingsSection, {
              delimiters: [
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true },
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
              ],
              throwOnError: false,
            });
          }
        }, 50);
      },
    );
  };

  renderQuestionType = (type) => {
    switch (type) {
      case "dragdrop":
        return "Kéo thả";
      default:
        return "Kéo Thả"; // Default case
    }
  };

  insertSymbolToStatement = (id, symbol) => {
    this.setState((prevState) => ({
      dragOptions: prevState.dragOptions.map((option) =>
        option.id === id ? { ...option, text: option.text + symbol } : option,
      ),
    }));
  };

  // Preview nội dung câu hỏi
  renderPreviewQuestion = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById("preview-question-4");
      if (previewContainer) {
        let content = "";
        if (this.questionEditor) {
          content = this.removeLiTags(this.questionEditor.getContents());
        }
        previewContainer.innerHTML = content || "Nội dung sẽ hiển thị ở đây...";
        renderMathInElement(previewContainer, {
          delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      }
    }, 100);
  };

  // Preview nội dung tùy chọn kéo theo id
  renderPreviewOption = (optionId) => {
    setTimeout(() => {
      const previewContainer = document.getElementById(
        `preview-option-${optionId}`,
      );
      if (previewContainer) {
        let content = "";
        const editor = this[`optionEditor_${optionId}`];
        if (editor) {
          content = this.removeLiTags(editor.getContents());
        }
        previewContainer.innerHTML = content || "Nội dung sẽ hiển thị ở đây...";
        renderMathInElement(previewContainer, {
          delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      }
    }, 100);
  };

  // Preview nội dung giải thích
  renderPreviewExplanation = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById("preview-explanation-4");
      if (previewContainer) {
        let content = "";
        if (this.solutionEditor) {
          content = this.solutionEditor.getContents();
        }
        previewContainer.innerHTML = content || "Nội dung sẽ hiển thị ở đây...";
        renderMathInElement(previewContainer, {
          delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      }
    }, 100);
  };

  render() {
    const { dragOptions, mappings, video_link, actionQuestion } = this.state;

    return (
      <div className="block-content">
        <div className="row">
          <div className="col-sm-12">
            <div className="form-group">
              <div
                className="alert alert-info"
                style={{ padding: "8px 12px", marginBottom: "15px" }}
              >
                <strong>
                  Câu {this.state.questionNo} -{" "}
                  {this.renderQuestionType(this.state.type)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-1">
          <div className="col-sm-12">
            <div className="form-group">
              <label className="title-block">Nội dung câu hỏi</label>
              <div className="card border-primary">
                <div className="card-body">
                  <div className="mb-2 d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-primary ml-2"
                      style={{ height: "40px", padding: "8px" }}
                      onClick={this.toggleMathFieldForQuestion}
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewQuestion ? "btn-success" : "btn-outline-primary"} ml-2`}
                      style={{ height: "40px", padding: "8px" }}
                      onClick={() => {
                        this.setState(
                          {
                            showPreviewQuestion:
                              !this.state.showPreviewQuestion,
                          },
                          () => {
                            if (this.state.showPreviewQuestion) {
                              this.renderPreviewQuestion();
                            }
                          },
                        );
                      }}
                      title="Xem trước nội dung câu hỏi"
                    >
                      <i className="fa fa-eye"></i> Preview
                    </button>
                  </div>
                  {this.state.showMathFieldQuestion && (
                    <div className="mb-2 d-flex align-items-center">
                      <math-field
                        ref={this.mathFieldQuestionRef}
                        id="math-field-question"
                        virtual-keyboard-mode="onfocus"
                        virtual-keyboard-theme="apple"
                        style={{
                          width: "100%",
                          minHeight: "40px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          pointerEvents: "auto",
                          flexGrow: 1,
                        }}
                      ></math-field>
                      <button
                        className="btn btn-primary ml-2"
                        style={{ height: "40px", padding: "0 12px" }}
                        onClick={() => this.insertFromField("question")}
                      >
                        Chèn
                      </button>
                    </div>
                  )}
                  <div className="mb-2 d-flex align-items-center">
                    <SunEditor
                      id="question-editor"
                      getSunEditorInstance={(sunEditor) => {
                        this.questionEditor = sunEditor;
                        this.attachMathClickListener(sunEditor, "question");
                      }}
                      onImageUploadBefore={this.handleImageUploadBefore}
                      height={"300px"}
                      defaultValue={this.state.rawHtml}
                      onChange={this._handleEditorContentChange}
                      setOptions={{
                        buttonList: baseHelpers.getSunEditorOptions2(),
                        katex: katex,
                        showPathLabel: false,
                        onClick: (e) => this.handleMathClick(e, "question"),
                        attributesWhitelist:
                          baseHelpers.getSunEditorAttributeWhitelist(),
                        addTagsWhitelist: "span|svg|path|symbol|use",
                      }}
                    />
                  </div>
                  {/* Preview container cho câu hỏi */}
                  {this.state.showPreviewQuestion && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Nội dung câu hỏi</strong>
                        </div>
                        <div
                          id="preview-question-4"
                          className="card-body"
                          style={{
                            minHeight: "100px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "15px",
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drag Options Section */}
        <div className="row" id="drag-options-section">
          <div className="col-2 col-form-div">
            <label className="col-form-label">Tùy chọn kéo</label>
          </div>
          <div className="col-10 row">
            {dragOptions.map((option, index) => (
              <div
                className="list-data col-sm-12 row"
                key={option.id}
                style={{ marginBottom: "10px" }}
              >
                <div className="col-sm-10">
                  <SunEditor
                    id={`option-editor-${option.id}`}
                    getSunEditorInstance={(sunEditor) => {
                      if (!this[`optionEditor_${option.id}`]) {
                        this[`optionEditor_${option.id}`] = sunEditor;
                      }
                      this.attachMathClickListener(
                        sunEditor,
                        "option",
                        option.id,
                      );
                    }}
                    onImageUploadBefore={this.handleImageUploadBefore}
                    height={"80px"}
                    defaultValue={option.text}
                    onChange={(content) => {
                      if (this._isSettingAnswerContent[option.id]) return;

                      const processedContent =
                        this.processLatexInContent(content);
                      this.updateOption(
                        option.id,
                        processedContent,
                        processedContent,
                      );

                      // Reapply processed content if LaTeX detected
                      if (
                        processedContent !== content &&
                        /(\\\(|\\\[|\$\$|\$)/.test(content)
                      ) {
                        this._isSettingAnswerContent[option.id] = true;
                        setTimeout(() => {
                          try {
                            const editor = this[`optionEditor_${option.id}`];
                            if (
                              editor &&
                              typeof editor.setContents === "function"
                            ) {
                              editor.setContents(processedContent);
                            }
                          } finally {
                            this._isSettingAnswerContent[option.id] = false;
                          }
                        }, 0);
                      }

                      // Auto render preview if enabled
                      if (this.state.showPreviewOptions[option.id]) {
                        setTimeout(() => {
                          this.renderPreviewOption(option.id);
                        }, 100);
                      }
                    }}
                    setOptions={{
                      buttonList: [],
                      katex: katex,
                      showPathLabel: false,
                      onClick: (e) =>
                        this.handleMathClick(e, "option", option.id),
                      attributesWhitelist:
                        baseHelpers.getSunEditorAttributeWhitelist(),
                      addTagsWhitelist: "span",
                    }}
                  />
                  {/* Preview container cho tùy chọn kéo */}
                  {this.state.showPreviewOptions &&
                    this.state.showPreviewOptions[option.id] && (
                      <div className="mt-2">
                        <div className="card border-info">
                          <div className="card-header bg-info text-white">
                            <strong>Preview - Tùy chọn {index + 1}</strong>
                          </div>
                          <div
                            id={`preview-option-${option.id}`}
                            className="card-body"
                            style={{
                              minHeight: "80px",
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                              padding: "10px",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  {this.state.showMathFieldOptions[option.id] && (
                    <div className="mb-2 d-flex align-items-center">
                      <math-field
                        id={`math-field-option-${option.id}`}
                        virtual-keyboard-mode="onfocus"
                        virtual-keyboard-theme="apple"
                        style={{
                          width: "100%",
                          minHeight: "30px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          pointerEvents: "auto",
                          flexGrow: 1,
                        }}
                      ></math-field>
                      <button
                        className="btn btn-primary ml-2"
                        style={{ height: "30px", padding: "0 8px" }}
                        onClick={() =>
                          this.insertFromField("option", option.id)
                        }
                      >
                        Chèn
                      </button>
                    </div>
                  )}
                </div>
                <div className="col-sm-2 list-actions p-0">
                  <div className="d-flex flex-column">
                    <button
                      type="button"
                      className="btn btn-primary mb-1"
                      style={{ height: "30px", padding: "8px" }}
                      onClick={() => this.toggleMathFieldForOption(option.id)}
                      title="Chèn công thức"
                    >
                      ∑
                    </button>
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewOptions && this.state.showPreviewOptions[option.id] ? "btn-success" : "btn-outline-primary"} mb-1`}
                      style={{ height: "30px", padding: "8px" }}
                      onClick={() => {
                        this.setState(
                          (prev) => ({
                            showPreviewOptions: {
                              ...prev.showPreviewOptions,
                              [option.id]: !prev.showPreviewOptions[option.id],
                            },
                          }),
                          () => {
                            if (this.state.showPreviewOptions[option.id]) {
                              this.renderPreviewOption(option.id);
                            }
                          },
                        );
                      }}
                      title={`Xem trước tùy chọn ${index + 1}`}
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                    {dragOptions.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => this.removeDragOption(option.id)}
                      >
                        <i className="icon-delete"></i>
                      </button>
                    )}
                    {index === dragOptions.length - 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-success mt-1"
                        onClick={this.addDragOption}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Correct Mappings Section */}
        <div className="row" id="mappings-section">
          <div className="col-2 col-form-div">
            <label className="col-form-label">Đáp án đúng</label>
          </div>
          <div className="col-10 row">
            {mappings.map((mapping, index) => (
              <div
                className="list-data col-sm-12 row"
                key={mapping.id}
                style={{ marginBottom: "10px" }}
              >
                <div className="col-sm-5">
                  <div className="input-group">
                    <input
                      placeholder="Vị trí trống (VD: 1, 2, 3...)"
                      type="text"
                      className="form-control"
                      value={mapping.blankPosition}
                      onChange={(e) =>
                        this.handleMappingChange(
                          mapping.id,
                          "blankPosition",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="col-sm-5">
                  <div className="dropdown">
                    <button
                      className="dropdown-toggle form-control text-left"
                      type="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      {mapping.correctOptionId ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html:
                              dragOptions.find(
                                (opt) => opt.text === mapping.correctOptionId,
                              )?.html || mapping.correctOptionId,
                          }}
                        />
                      ) : (
                        "Chọn tùy chọn đúng"
                      )}
                    </button>
                    <div className="dropdown-menu">
                      {dragOptions.map((option) => (
                        <div
                          key={option.id}
                          className="dropdown-item"
                          onClick={() =>
                            this.handleMappingChange(
                              mapping.id,
                              "correctOptionId",
                              option.text || option.html,
                            )
                          }
                          dangerouslySetInnerHTML={{
                            __html: option.html || option.text,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-sm-2 list-actions p-0">
                  {mappings.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => this.removeMapping(mapping.id)}
                    >
                      <i className="icon-delete"></i>
                    </button>
                  )}
                  {index === mappings.length - 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={this.addMapping}
                    >
                      <i className="fas fa-plus-circle"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">Độ khó</label>
              <div className="card border-primary">
                <div className="card-body">
                  <Radio.Group
                    onChange={(e) => this.setState({ level: e.target.value })}
                    name="level"
                    value={this.state.level}
                  >
                    <Radio value="NHAN_BIET">Nhận biết</Radio>
                    <Radio value="THONG_HIEU">Thông hiểu</Radio>
                    <Radio value="VAN_DUNG">Vận dụng</Radio>
                    <Radio value="VAN_DUNG_CAO">Vận dụng cao</Radio>
                  </Radio.Group>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">Giải thích</label>
              <div className="card border-primary">
                <div className="card-body">
                  <div className="mb-2 d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-primary ml-2"
                      style={{ height: "40px", padding: "8px" }}
                      onClick={this.toggleMathFieldForExplanation}
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewExplanation ? "btn-success" : "btn-outline-primary"} ml-2`}
                      style={{ height: "40px", padding: "8px" }}
                      onClick={() => {
                        this.setState(
                          {
                            showPreviewExplanation:
                              !this.state.showPreviewExplanation,
                          },
                          () => {
                            if (this.state.showPreviewExplanation) {
                              this.renderPreviewExplanation();
                            }
                          },
                        );
                      }}
                      title="Xem trước giải thích"
                    >
                      <i className="fa fa-eye"></i> Preview
                    </button>
                  </div>
                  {this.state.showMathFieldExplanation && (
                    <div className="mb-2 d-flex align-items-center">
                      <math-field
                        ref={this.mathFieldExplanationRef}
                        id="math-field-explanation"
                        virtual-keyboard-mode="onfocus"
                        virtual-keyboard-theme="apple"
                        style={{
                          width: "100%",
                          minHeight: "40px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          pointerEvents: "auto",
                          flexGrow: 1,
                        }}
                      ></math-field>
                      <button
                        className="btn btn-primary ml-2"
                        style={{ height: "40px", padding: "0 12px" }}
                        onClick={() => this.insertFromField("explanation")}
                      >
                        Chèn
                      </button>
                    </div>
                  )}
                  <div className="mb-2 d-flex align-items-center">
                    <SunEditor
                      id="explanation-editor"
                      getSunEditorInstance={(sunEditor) => {
                        this.solutionEditor = sunEditor;
                        this.attachMathClickListener(sunEditor, "explanation");
                      }}
                      onImageUploadBefore={this.handleImageUploadBefore}
                      height={"250px"}
                      defaultValue={this.state.explanation}
                      onChange={this._handleSolutionEditorChange}
                      setOptions={{
                        buttonList: baseHelpers.getSunEditorOptions2(),
                        katex: katex,
                        showPathLabel: false,
                        onMouseDown: (e) =>
                          this.handleMathClick(e, "explanation"),
                        attributesWhitelist:
                          baseHelpers.getSunEditorAttributeWhitelist(),
                        addTagsWhitelist: "span",
                      }}
                    />
                  </div>

                  {/* Preview container cho giải thích */}
                  {this.state.showPreviewExplanation && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Giải thích</strong>
                        </div>
                        <div
                          id="preview-explanation-4"
                          className="card-body"
                          style={{
                            minHeight: "100px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "15px",
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <label className="col-form-label">Video tham khảo</label>
            <input
              type="text"
              className="form-control"
              name="video_link"
              onChange={(e) => this.setState({ video_link: e.target.value })}
              value={video_link}
            />
          </div>
        </div>

        <div className="form-group row">
          <div className="col-sm-12 text-right">
            {actionQuestion === "update" && (
              <button
                name="reset"
                value="1"
                className="btn btn-primary mt-2 ml-2"
                onClick={this.handleSave}
              >
                Cập nhật
              </button>
            )}
            {actionQuestion === "create" && (
              <button
                name="save_temp"
                value="1"
                className="btn btn-primary mt-2 ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  // Build same payload as handleSave but mark as temporary
                  const {
                    examId,
                    examSectionId,
                    examSectionGroupId,
                    examSectionSubjectId,
                    childExamId,
                  } = this.props;

                  // Đơn giản hóa mapLevelToShort cho temp question
                  const mapLevelToShort = (lvl) => {
                    if (!lvl) return "";
                    return String(lvl); // Giữ nguyên giá trị
                  };

                  // ✅ Build dragDropOptions: Join options thành string với dấu phẩy để khớp format API
                  const dragDropOptions = [
                    (this.state.dragOptions || [])
                      .map((option) =>
                        this.cleanHtmlContent(
                          this.extractOptionText(
                            option && option.text ? option.text : option,
                          ),
                        ),
                      )
                      .filter(Boolean)
                      .join(", "),
                  ]; // Join thành một string với dấu phẩy

                  // ✅ Build correctAnswers theo format API mong muốn với validation
                  // Build correctAnswers for temp-save: value is the option text
                  const correctAnswers = (this.state.mappings || [])
                    .filter(
                      (mapping) =>
                        mapping && String(mapping.correctOptionId).trim(),
                    )
                    .map((mapping) => ({
                      value: this.cleanHtmlContent(
                        this.extractOptionText(mapping.correctOptionId),
                      ),
                    }));

                  // ✅ Build choices array (empty for dragdrop)
                  const choices = [];

                  // ✅ Validation trước khi save temp
                  if (this.state.dragOptions.length === 0) {
                    alert("Vui lòng nhập ít nhất một tùy chọn kéo!");
                    return;
                  }

                  if (
                    this.state.mappings.filter(
                      (m) => m.correctOptionId && m.correctOptionId.trim(),
                    ).length === 0
                  ) {
                    alert("Vui lòng nhập ít nhất một đáp án đúng!");
                    return;
                  }

                  // ✅ Validate tất cả tùy chọn kéo phải có nội dung
                  if (
                    this.state.dragOptions.some(
                      (option) => !option.text || !option.text.trim(),
                    )
                  ) {
                    alert("Vui lòng điền nội dung cho tất cả tùy chọn kéo!");
                    return;
                  }

                  // ✅ Validate nội dung câu hỏi không được để trống
                  if (
                    !this.state.content1 ||
                    !this.state.content1.trim() ||
                    this.cleanHtmlContent(this.state.content1).trim() === ""
                  ) {
                    alert("Vui lòng nhập nội dung câu hỏi!");
                    return;
                  }

                  // ✅ Validate tất cả đáp án đúng phải được điền đầy đủ
                  if (
                    this.state.mappings.some(
                      (mapping) =>
                        !mapping.correctOptionId ||
                        !mapping.correctOptionId.trim(),
                    )
                  ) {
                    alert("Vui lòng điền đầy đủ tất cả đáp án đúng!");
                    return;
                  }

                  // ✅ Validate tất cả vị trí trống phải được điền
                  if (
                    this.state.mappings.some(
                      (mapping) =>
                        !mapping.blankPosition || !mapping.blankPosition.trim(),
                    )
                  ) {
                    alert("Vui lòng điền vị trí trống cho tất cả đáp án đúng!");
                    return;
                  }

                  const tempQuestion = {
                    exam_id: examId,
                    exam_section_id:
                      examSectionId === "" ? null : examSectionId,
                    exam_section_group_id:
                      examSectionGroupId === "" ? null : examSectionGroupId,
                    subject_id:
                      examSectionSubjectId === "" ? null : examSectionSubjectId,
                    childExamId: childExamId,
                    // ✅ Các trường theo format API
                    dragDropOptions,
                    choices,
                    correctAnswers,
                    rawHtml: this.state.rawHtml || this.state.content1 || "",
                    // ✅ Giữ lại các trường cũ để backward compatibility
                    answer: this.state.mappings
                      .filter(
                        (mapping) =>
                          mapping &&
                          mapping.blankPosition &&
                          mapping.correctOptionId,
                      )
                      .map((mapping) => ({
                        key: this.cleanHtmlContent(
                          String(mapping.correctOptionId).trim(),
                        ),
                        value: String(mapping.blankPosition).trim(),
                      })),
                    answer_content: this.state.content1,
                    type: this.state.type,
                    level: mapLevelToShort(this.state.level),
                    explanation: this.cleanExplanation(this.state.explanation),
                    doc_link: this.state.doc_link,
                    video_link: this.state.video_link,
                    question_no: this.state.questionNo,
                    _id: `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                    question_id: `manual-${Date.now()}-${Math.random()}`,
                    created_at: new Date().toISOString(),
                    __temp: true,
                  };

                  try {
                    this.props.actionCreateQuestion(tempQuestion);
                    // Reset solution editor immediately
                    if (this.solutionEditor) {
                      this.solutionEditor.setContents("");
                    }
                    this.closeModal();
                  } catch (error) {
                    alert("Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại!");
                  }
                }}
              >
                Lưu & Thêm mới
              </button>
            )}
            <button
              className="btn btn-light mt-2 ml-2"
              data-dismiss="modal"
              id="close_create_4"
              onClick={this.closeModal}
            >
              Bỏ qua
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  subjects: state.subject.subjects,
  chapters: state.chapter.chapters,
  categories: state.category.categories,
  redirect: state.question.redirect,
  image: state.question.image,
  question: state.question.question,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listSubject,
      listChapter,
      listCategory,
      createQuestion,
      uploadImage,
      listQuestion,
    },
    dispatch,
  );

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalQuestion4),
);
