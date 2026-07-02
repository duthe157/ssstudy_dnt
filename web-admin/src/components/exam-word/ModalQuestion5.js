import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Select, Checkbox, Radio, notification } from "antd";
import { setLoader } from "../LoadingContext";
import { uploadImage } from "../../redux/question/action";
import $ from "jquery";

import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import "katex/dist/katex.min.css";
import katex from "katex";
import renderMathInElement from "katex/dist/contrib/auto-render";
import baseHelpers from "../../helpers/BaseHelpers";
import "mathlive/mathlive-static.css";
import { MathfieldElement } from "mathlive";

class ModalQuestion5 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questionNo: 1,
      type: "multiplechoice",
      question: null,
      selectedAnswers: [],
      options: [
        { id: "A", value: "", html: "", text: "" },
        { id: "B", value: "", html: "", text: "" },
        { id: "C", value: "", html: "", text: "" },
        { id: "D", value: "", html: "", text: "" },
      ],
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "",
      explanation: "",
      selectedFile: null,
      content: "",
      content1: "",
      rawHtml: "",
      uploadedImages: [],
      actionQuestion: "create",
      currentQuestionvalue: null,
      showMathFieldOptions: {}, // Thêm để toggle MathfieldElement cho options
      showMathFieldQuestion: false, // Thêm để toggle MathfieldElement cho question
      showMathFieldExplanation: false, // Thêm để toggle MathfieldElement cho explanation
      showPreviewExplanation: false, // Toggle preview cho phần giải thích
      showPreviewQuestion: false, // Toggle preview cho phần câu hỏi
      showPreviewOptions: {}, // Toggle preview cho từng đáp án
      selectedMathElement: null,
    };
    this.questionEditor = null; // Thêm ref cho question editor
    this.solutionEditor = null; // Thêm ref cho solution editor
    this.mathFieldQuestionRef = React.createRef(); // Thêm ref cho math-field question
    this.mathFieldExplanationRef = React.createRef(); // Thêm ref cho math-field explanation
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
      }
    );
  };

  decodeHtmlEntities = (html) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  };

  // ✅ Hàm convert katex rendering HTML thành math-symbol spans
  // Khi SunEditor render LaTeX, nó tạo HTML katex. Chúng ta cần lấy source LaTeX
  // từ <script type="math/tex"> hoặc từ HTML structure
  processKatexHtmlToMathSymbol = (content) => {
    if (!content) return content;

    let processed = content;

    // ✅ Pattern 1: <script type="math/tex"> - SunEditor lưu source LaTeX ở đây
    processed = processed.replace(
      /<script type="math\/tex"[^>]*>([\s\S]*?)<\/script>[\s\S]*?(?=<script|<\/|$)|<script type="math\/tex"[^>]*>([\s\S]*?)<\/script>/gi,
      (match, latex1, latex2) => {
        const latex = (latex1 || latex2 || '').trim();
        if (latex) {
          try {
            const rendered = katex.renderToString(latex, { output: "html", throwOnError: false });
            return `<span class="math-symbol" data-latex="${latex.replace(/"/g, '&quot;')}" contenteditable="false">${rendered}</span>`;
          } catch (e) {
            return match;
          }
        }
        return match;
      }
    );

    // ✅ Pattern 2: KaTeX output - cố gắng extract LaTeX từ katex-html
    // Nếu <script type="math/tex"> không có, thử lấy từ data-katex attribute nếu có
    processed = processed.replace(
      /<span[^>]*data-katex="([^"]*)"[^>]*>[\s\S]*?<\/span>/gi,
      (match, latex) => {
        const decodedLatex = decodeURIComponent(latex).trim();
        if (decodedLatex) {
          try {
            const rendered = katex.renderToString(decodedLatex, { output: "html", throwOnError: false });
            return `<span class="math-symbol" data-latex="${decodedLatex.replace(/"/g, '&quot;')}" contenteditable="false">${rendered}</span>`;
          } catch (e) {
            return match;
          }
        }
        return match;
      }
    );

    return processed;
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

    const delimiters = [
      { start: '\\[', end: '\\]', display: true },
      { start: '\\(', end: '\\)', display: false },
      { start: '$$', end: '$$', display: true },
      { start: '$', end: '$', display: false },
    ];

    delimiters.forEach(({ start, end }) => {
      try {
        const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedStart + '([\\s\\S]*?)' + escapedEnd, 'g');

        processedContent = processedContent.replace(regex, (match, latex) => {
          try {
            let cleanedLatex = this.normalizeLatex(String(latex));
            while (cleanedLatex && cleanedLatex.endsWith('\\') && !cleanedLatex.endsWith('\\\\')) {
              cleanedLatex = cleanedLatex.slice(0, -1).trim();
            }

            if (!cleanedLatex) return match;
            const rendered = katex.renderToString(cleanedLatex, {
              output: "html",
              throwOnError: false,
            });
            const escapedLatex = String(cleanedLatex).replace(/"/g, '&quot;');
            const renderedWithAttr = rendered.replace(
              '<span class="katex"',
              `<span class="katex" data-latex="${escapedLatex}"`
            );
            return `<span class="math-symbol" data-latex="${escapedLatex}">${renderedWithAttr}</span>`;
          } catch (error) {
            console.error("LaTeX render error:", error, "LaTeX:", latex);
            return match;
          }
        });
      } catch (error) {
        console.error("Regex creation error:", error);
      }
    });

    return processedContent;
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.questionNo !== this.props.questionNo) {
      this.setState({ questionNo: this.props.questionNo });
    }
    if (prevProps.actionQuestion !== this.props.actionQuestion) {
      this.setState({ actionQuestion: this.props.actionQuestion });

      // ✅ THÊM: Reset khi chuyển từ update sang create
      if (
        prevProps.actionQuestion === "update" &&
        this.props.actionQuestion === "create"
      ) {
        this.clearAllInputs();
      }
    }
    if (
      prevProps.currentQuestionvalue !== this.props.currentQuestionvalue &&
      this.props.currentQuestionvalue
    ) {
      // ✅ FIX: Reset editors trước khi load dữ liệu mới
      if (this.questionEditor) {
        this.questionEditor.setContents("");
      }
      if (this.solutionEditor) {
        this.solutionEditor.setContents("");
      }

      const {
        answer,
        correctAnswers,
        answer_content,
        doc_link,
        video_link,
        question_no,
        level,
        explanation,
      } = this.props.currentQuestionvalue || {};
      let selectedAnswers = [];
      const choices = this.props.currentQuestionvalue?.choices || [];

      try {


        // Đơn giản hóa normalizeLetter - loại bỏ regex và logic phức tạp
        const normalizeLetter = (v) => {
          if (!v) return null;
          if (typeof v === "string") {
            const s = v.trim().toUpperCase();
            // Accept A-Z thay vì chỉ A-D
            if (/^[A-Z]$/.test(s)) return s;
            return null;
          }
          if (typeof v === "number") {
            // Simple number to letter conversion
            if (v >= 1 && v <= 4) return ["A", "B", "C", "D"][v - 1];
            if (v >= 0 && v <= 3) return ["A", "B", "C", "D"][v];
          }
          if (Array.isArray(v) && v.length > 0) return normalizeLetter(v[0]);
          if (typeof v === "object")
            return normalizeLetter(v.value ?? v.label ?? null);
          return null;
        };

        // ✅ IMPROVED: Xử lý correctAnswers với nhiều fallback cases
        if (Array.isArray(correctAnswers) && correctAnswers.length > 0) {
          // Case 1: correctAnswers là array of objects với structure { value: "A", label: "", rawHtml: "A" }
          selectedAnswers = correctAnswers
            .map((item) => {
              if (typeof item === "object" && item !== null) {
                // Thử các field khác nhau: value, label, rawHtml
                const value = item.value || item.label || item.rawHtml || item.text;
                return normalizeLetter(value);
              }
              // Case: item là string hoặc number
              return normalizeLetter(item);
            })
            .filter(Boolean);
        } else if (typeof answer === "string") {
          // Simple string processing - chỉ split theo comma
          const parts = answer
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          selectedAnswers = parts
            .map((p) => normalizeLetter(p))
            .filter(Boolean);
        } else if (Array.isArray(answer)) {
          // Simple array processing
          selectedAnswers = answer
            .map((a) => normalizeLetter(a))
            .filter(Boolean);
        } else if (answer && typeof answer === "object") {
          // Simple object processing - chỉ lấy value hoặc label
          const v = normalizeLetter(answer.value ?? answer.label ?? null);
          if (v) selectedAnswers = [v];
        }

        // ✅ DEBUG: Log kết quả sau khi xử lý
      } catch (e) {
        console.error("[DEBUG] Error processing correctAnswers:", e);
        selectedAnswers = [];
      }

      // Đơn giản hóa mapLevelToLong - chỉ pass-through với fallback
      const mapLevelToLong = (lvl) => {
        if (!lvl) return "";
        return lvl; // Giữ nguyên giá trị, loại bỏ switch phức tạp
      };

      // ✅ CẢI THIỆN: Xây dựng options từ choices với content đầy đủ
      const rawChoices = choices;
      let options = [];
      const numOptions = Math.max(rawChoices.length, 4); // Tối thiểu 4 options (A,B,C,D)

      // Tạo options với số lượng động
      for (let i = 0; i < numOptions; i++) {
        const optionId = String.fromCharCode(65 + i); // A, B, C, D...
        const choice = rawChoices[i];

        let optionValue = "";
        let optionHtml = "";

        if (choice) {
          // ✅ Xử lý content từ choice object với đầy đủ fallback
          optionValue = choice.text || choice.value || choice.content || choice.rawHtml || "";
          optionHtml = choice.rawHtml || choice.html || choice.text || choice.value || choice.content || "";

          // ✅ Xử lý LaTeX trước clean - process delimiters thành math-symbol spans
          optionValue = this.processMathSpansToLatex(optionValue);
          optionHtml = this.processMathSpansToLatex(optionHtml);

          // ✅ Process LaTeX content vào rendered KaTeX spans
          optionValue = this.processLatexInContent(optionValue);
          optionHtml = this.processLatexInContent(optionHtml);

          // Clean content nhưng vẫn giữ nguyên format
          optionValue = this.removeLiTags(this.cleanHtmlContent(optionValue));
          optionHtml = this.removeLiTags(this.cleanHtmlContent(optionHtml));
        }

        options.push({
          id: optionId,
          value: optionValue,
          html: optionHtml,
          text: this.removeLiTags(optionValue)
        });
      }

      // ✅ FIX: Xử lý content đúng cách
      const rawHtml = this.props.currentQuestionvalue?.rawHtml || answer_content || "";
      const processedContent = this.removeLiTags(this.prepareContentForEditor(rawHtml));

      this.setState({
        currentQuestionvalue: this.props.currentQuestionvalue,
        selectedAnswers,
        options: options,
        answer_content: answer_content || null,
        doc_link: doc_link || "",
        video_link: video_link || "",
        level: mapLevelToLong(level) || "",
        explanation: this.removeLiTags(explanation || ""),
        questionNo: this.props.questionNo || question_no || 1, // ✅ Ưu tiên props.questionNo
        content1: this.cleanHtmlContent(processedContent), // ✅ Sử dụng processed content
        rawHtml: rawHtml, // ✅ Lưu raw HTML gốc
      });

      // ✅ FIX: Cải thiện logic set editor content
      const setEditorContent = (editorInstance, html) => {
        if (!editorInstance) return false;
        try {
          if (typeof editorInstance.setContents === "function") {
            editorInstance.setContents(html);
            return true;
          }
          if (typeof editorInstance.setContent === "function") {
            editorInstance.setContent(html);
            return true;
          }
          if (
            editorInstance.core &&
            typeof editorInstance.core.setContents === "function"
          ) {
            editorInstance.core.setContents(html);
            return true;
          }
        } catch (e) {
          console.error("Error setting editor content:", e);
        }
        return false;
      };

      const solutionHtml = this.cleanHtmlContent(explanation || "");

      // ✅ IMPROVED: Set content cho option editors sau khi setState
      setTimeout(() => {
        try {
          const qEditor = this.questionEditor;
          if (qEditor) {
            setEditorContent(qEditor, processedContent); // ✅ Sử dụng processed content
          }
        } catch (e) {
          console.error("Error setting question editor:", e);
        }

        try {
          const sEditor = this.solutionEditor;
          if (sEditor) {
            setEditorContent(sEditor, solutionHtml);
          }
        } catch (e) {
          console.error("Error setting solution editor:", e);
        }

        // ✅ Set content cho option editors
        options.forEach((option, index) => {
          const optionEditor = this[`optionEditor_${option.id}`];
          if (optionEditor && (option.html || option.value)) {
            try {
              const contentToSet = option.html || option.value || "";
              setEditorContent(optionEditor, contentToSet);
            } catch (e) {
              console.error(`Error setting option ${option.id} editor:`, e);
            }
          }
        });
      }, 100);

      // ✅ FIX: Retry với delay lớn hơn cho tất cả editors
      setTimeout(() => {
        try {
          const qEditor = this.questionEditor;
          if (qEditor) {
            setEditorContent(qEditor, processedContent);
          }
        } catch (e) { }

        try {
          const sEditor = this.solutionEditor;
          if (sEditor) {
            setEditorContent(sEditor, solutionHtml);
          }
        } catch (e) { }

        // ✅ Retry set content cho option editors
        options.forEach((option, index) => {
          const optionEditor = this[`optionEditor_${option.id}`];
          if (optionEditor && (option.html || option.value)) {
            try {
              const contentToSet = option.html || option.value || "";
              setEditorContent(optionEditor, contentToSet);
            } catch (e) {
              console.error(`Error retrying option ${option.id} editor:`, e);
            }
          }
        });
      }, 500); // ✅ Tăng delay lên 500ms

      // ✅ FIX: Final retry với delay lớn nhất cho tất cả editors
      setTimeout(() => {
        try {
          const qEditor = this.questionEditor;
          if (qEditor) {
            setEditorContent(qEditor, processedContent);
          }
        } catch (e) { }

        try {
          const sEditor = this.solutionEditor;
          if (sEditor) {
            setEditorContent(sEditor, solutionHtml);
          }
        } catch (e) { }

        // ✅ Final retry cho option editors
        options.forEach((option, index) => {
          const optionEditor = this[`optionEditor_${option.id}`];
          if (optionEditor && (option.html || option.value)) {
            try {
              const contentToSet = option.html || option.value || "";
              setEditorContent(optionEditor, contentToSet);
            } catch (e) {
              console.error(`Error final retry option ${option.id} editor:`, e);
            }
          }
        });

        // Setup auto-render sau khi set content xong
      }, 1000); // ✅ Final attempt sau 1s

    }
  };

  setupAutoRender = () => {
    const container =
      document.querySelector("#modalQuestion5") ||
      document.querySelector("#create5") ||
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
  };

  renderPreviewExplanation = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-explanation');
      if (previewContainer) {
        let content = '';
        if (this.solutionEditor) {
          content = this.solutionEditor.getContents();
        }
        previewContainer.innerHTML = content || 'Nội dung sẽ hiển thị ở đây...';
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

  renderPreviewQuestion = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-container');
      if (previewContainer) {
        let content = '';
        if (this.questionEditor) {
          content = this.questionEditor.getContents();
        }
        previewContainer.innerHTML = content || 'Nội dung sẽ hiển thị ở đây...';
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

  renderPreviewOption = (optionId) => {
    setTimeout(() => {
      const previewContainer = document.getElementById(`preview-option-${optionId}`);
      if (previewContainer) {
        let content = '';
        const optionEditor = this[`optionEditor_${optionId}`];

        // Lấy nội dung an toàn từ instance editor
        if (optionEditor && typeof optionEditor.getContents === 'function') {
          content = optionEditor.getContents();
        } else if (optionEditor && optionEditor.core && typeof optionEditor.core.getContents === 'function') {
          content = optionEditor.core.getContents();
        } else {
          // Fallback: lấy từ state nếu ref chưa sẵn sàng hoặc đã unmount/re-mount
          const opt = this.state.options.find(o => o.id === optionId);
          content = (opt && (opt.html || opt.text || opt.value)) || '';
        }

        previewContainer.innerHTML = content || 'Nội dung sẽ hiển thị ở đây...';
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

  setupMutationObserver = () => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }


    const observeTarget =
      document.querySelector("#modalQuestion5") ||
      document.querySelector("#create5");
    if (observeTarget) {
      this.mutationObserver.observe(observeTarget, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
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
    $(document).on("show.bs.modal", "#modalQuestion5, #create5", () => {
      if (this.props.actionQuestion === "create") {
        this.clearAllInputs();
      }
    });

    // Thêm sự kiện lắng nghe khi modal đóng
    $(document).on("hide.bs.modal", "#modalQuestion5, #create5", () => {
      this.clearAllInputs();
    });

    // Thêm setup cho auto-render và MutationObserver
    const modals = document.querySelectorAll("#modalQuestion5, #create5");
    modals.forEach((modal) => {
      modal.addEventListener("shown.bs.modal", () => {
      });
      modal.addEventListener("hidden.bs.modal", () => {
        this.cleanupMutationObserver();
      });
    });
  }

  componentWillUnmount() {
    // Xóa sự kiện lắng nghe khi component bị hủy
    $(document).off("show.bs.modal", "#modalQuestion5, #create5");
    this.cleanupMutationObserver();
  }

  // Phương thức đặt lại nội dung của Editor
  resetEditorContent = () => {
    this.setState({
      content1: "",
      explanation: "",
      rawHtml: "",
      selectedMathElement: null,
    });

    // ✅ THÊM: Force reset editors
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
      type: "multiplechoice",
      question: null,
      selectedAnswers: [],
      options: [
        { id: "A", value: "", html: "", text: "" },
        { id: "B", value: "", html: "", text: "" },
        { id: "C", value: "", html: "", text: "" },
        { id: "D", value: "", html: "", text: "" },
      ],
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "",
      explanation: "",
      selectedFile: null,
      content: "",
      content1: "",
      rawHtml: "",
      uploadedImages: [],
      actionQuestion: this.props.actionQuestion,
      currentQuestionvalue: null,
      selectedMathElement: null,
    });
  };

  // Phương thức làm sạch tất cả input fields
  clearAllInputs = () => {
    // ✅ Reset editors trước tiên
    if (this.questionEditor) {
      this.questionEditor.setContents("");
    }
    if (this.solutionEditor) {
      this.solutionEditor.setContents("");
    }

    this.setState(
      {
        currentQuestionvalue: null,
        selectedMathElement: null,
        showMathFieldOptions: {},
        showMathFieldQuestion: false, // ✅ Reset math field states
        showMathFieldExplanation: false,
        showPreviewExplanation: false, // ✅ Reset preview state
        showPreviewQuestion: false, // ✅ Reset preview state cho câu hỏi
        showPreviewOptions: {}, // ✅ Reset preview state cho đáp án
      },
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
            '#modalQuestion5 input[type="text"], #create5 input[type="text"]'
          );
          inputs.forEach((input) => {
            if (input.name !== "video_link") {
              // Keep video_link as it's handled by state
              input.value = "";
            }
          });

          // Clear select elements
          const selects = document.querySelectorAll(
            "#modalQuestion5 select, #create5 select"
          );
          selects.forEach((select) => {
            select.selectedIndex = 0;
          });

          // Clear radio buttons
          const radios = document.querySelectorAll(
            '#modalQuestion5 input[type="radio"], #create5 input[type="radio"]'
          );
          radios.forEach((radio) => {
            radio.checked = false;
          });

          // Clear checkboxes
          const checkboxes = document.querySelectorAll(
            '#modalQuestion5 input[type="checkbox"], #create5 input[type="checkbox"]'
          );
          checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
          });

          // ✅ Clear option editors
          Object.keys(this).forEach((key) => {
            if (key.startsWith("optionEditor_") && this[key]) {
              try {
                this[key].setContents("");
              } catch (e) { }
            }
          });
        }, 400);
      }
    );
  };

  _onChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  // Handle option value change
  handleOptionChange = (index, value) => {
    const newOptions = [...this.state.options];
    newOptions[index].value = value;
    this.setState({ options: newOptions });
  };

  // Add new option
  addOption = () => {
    const currentLength = this.state.options.length;
    const nextLetter = String.fromCharCode(65 + currentLength); // A, B, C, D, E, ...
    const newOptions = [
      ...this.state.options,
      { id: nextLetter, value: "", html: "", text: "" },
    ];
    this.setState({ options: newOptions });
  };

  // Remove option
  removeOption = (index) => {
    this.setState((prevState) => {
      // Chỉ cho phép xóa lựa chọn cuối cùng
      const lastOptionIndex = prevState.options.length - 1;
      if (index !== lastOptionIndex) {
        return prevState; // Không thay đổi state, không hiển thị cảnh báo
      }

      // Không cho phép xóa nếu chỉ còn 2 lựa chọn
      if (prevState.options.length <= 2) {
        return prevState; // Không thay đổi state, không hiển thị cảnh báo
      }

      const newOptions = prevState.options.filter((_, i) => i !== index);
      // Update IDs after removal
      const updatedOptions = newOptions.map((option, i) => ({
        ...option,
        id: String.fromCharCode(65 + i),
      }));

      // Update selectedAnswers to remove references to deleted options
      const removedOptionId = prevState.options[index].id;
      const newSelectedAnswers = prevState.selectedAnswers.filter(
        (answer) => answer !== removedOptionId
      );

      return {
        options: updatedOptions,
        selectedAnswers: newSelectedAnswers,
      };
    });
  };

  _onChangeCheckBoxG = (e) => {
    const { value } = e.target;
    this.setState((prevState) => {
      const selectedAnswers = prevState.selectedAnswers.includes(value)
        ? prevState.selectedAnswers.filter((answer) => answer !== value)
        : [...prevState.selectedAnswers, value];

      return { selectedAnswers };
    });
  };

  // Hàm làm sạch HTML tags - comprehensive cleaning
  cleanHtmlContent = (content) => {
    if (!content) return "";

    // Remove unwanted list formatting that causes bullet points
    let cleaned = content
      .replace(/<ul[^>]*>/gi, "") // Remove <ul> tags
      .replace(/<\/ul>/gi, "") // Remove </ul> tags
      .replace(/<li[^>]*>/gi, "") // Remove <li> tags completely
      .replace(/<\/li>/gi, "") // Remove </li> tags completely
      .replace(/<ol[^>]*>/gi, "") // Remove <ol> tags
      .replace(/<\/ol>/gi, "") // Remove </ol> tags
      .replace(/<p><\/p>/gi, "") // Remove empty paragraphs
      .replace(/^\s*<p>\s*<\/p>\s*/gi, "") // Remove leading empty paragraphs
      .replace(/(<p>\s*<br\s*\/?>\s*<\/p>)/gi, "") // Remove paragraphs with only <br>
      .trim();

    // Ensure content is wrapped in paragraph tags if not already
    if (cleaned && !cleaned.startsWith("<p>") && !cleaned.startsWith("<div>")) {
      cleaned = `<p>${cleaned}</p>`;
    }
    return cleaned;
  };

  // Hàm xử lý hình ảnh base64 để hiển thị chính xác
  processImageContent = (content) => {
    if (!content) return content;

    // Thay thế các thẻ img để hiển thị hình ảnh với styling responsive
    return content.replace(
      /<img([^>]*src="data:image\/[^"]*"[^>]*)>/gi,
      '<img$1 style="max-width: 100%; height: auto; display: block; margin: 10px 0;" class="img-fluid responsive-image">'
    );
  };

  // Hàm chuẩn bị nội dung cho editor với xử lý ký tự đặc biệt
  prepareContentForEditor = (content) => {
    if (!content) return '';

    // Unescape các ký tự HTML entities
    const unescaped = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&');

    // Xử lý hình ảnh và math
    return this.processImageContent(this.processMathSpansToLatex(unescaped));
  };

  // Hàm set nội dung editor một cách an toàn
  setEditorContentSafely = (editor, content) => {
    if (!editor || typeof editor.setContents !== 'function') return;

    try {
      const processedContent = this.prepareContentForEditor(content);
      editor.setContents(processedContent);
    } catch (error) {
      console.warn('Error setting editor content:', error);
      // Fallback: set content without processing
      try {
        editor.setContents(content || '');
      } catch (fallbackError) {
        console.error('Failed to set editor content even with fallback:', fallbackError);
      }
    }
  };

  // Hàm xử lý content để hiển thị trong SunEditor
  removeLiTags = (content) => {
    if (!content) return content;
    return content.replace(/<li[^>]*>/gi, "").replace(/<\/li>/gi, "");
  };

  extractLatexFromHtml = (html) => {
    if (!html) return "";
    const matches =
      html.match(/\\\((.*?)\\\)/g) ||
      html.match(
        /<span class="math"[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/gi
      );
    if (matches) {
      return matches
        .map((m) =>
          m
            .replace(/\\\(|\\\)/g, "")
            .replace(
              /<span class="math"[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/gi,
              "$1"
            )
        )
        .join(" ");
    }
    return "";
  };

  // Hàm làm sạch nội dung giải thích, loại bỏ các thẻ HTML rỗng
  cleanExplanation = (explanation) => {
    if (!explanation) return null;
    // Loại bỏ tất cả thẻ HTML và kiểm tra nội dung còn lại
    const plainText = this.cleanHtmlContent(explanation);
    // Nếu chỉ còn nội dung rỗng sau khi loại bỏ HTML, trả về null
    return plainText ? explanation : null;
  };

  handleSave = async (e) => {
    setLoader(true);
    e.preventDefault();

    // Validation
    if (!this.state.content1 || this.state.content1.trim() === "") {
      alert("Vui lòng nhập nội dung câu hỏi!");
      setLoader(false);
      return;
    }

    if (
      this.state.options.every(
        (option) => !option.value || option.value.trim() === ""
      )
    ) {
      alert("Vui lòng nhập ít nhất một lựa chọn!");
      setLoader(false);
      return;
    }

    if (this.state.selectedAnswers.length === 0) {
      alert("Vui lòng chọn ít nhất một đáp án đúng!");
      setLoader(false);
      return;
    }

    let {
      examId,
      examSectionId,
      examSectionGroupId,
      examSectionSubjectId,
      currentSubjectId,
      currentTopicId,
      questionIdGroupTopic,
      childExamId,
    } = this.props;

    // ✅ THÊM: Validation cho subject_id
    const subject_id =
      currentSubjectId ||
      (examSectionSubjectId === "" ? null : examSectionSubjectId);

    // Đơn giản hóa mapLevelToShort - loại bỏ switch phức tạp
    const mapLevelToShort = (lvl) => {
      if (!lvl) return "";
      return String(lvl); // Giữ nguyên giá trị thay vì map phức tạp
    };

    let question = {
      // DB-side fields expected by create/update flows
      exam_id: examId,
      exam_section_id: examSectionId === "" ? null : examSectionId,
      exam_section_group_id:
        examSectionGroupId === "" ? null : examSectionGroupId,
      subject_id:
        currentSubjectId ||
        (examSectionSubjectId === "" ? null : examSectionSubjectId),
      topic_id: currentTopicId,
      questionTopicGroupId: questionIdGroupTopic,
      childExamId: childExamId,

      // Question content
      rawHtml: this.state.rawHtml,
      answer: this.state.selectedAnswers.join(", "),
      answer_content: this.state.content1 || this.state.rawHtml || "",
      choices: this.state.options.map((option) => ({
        label: option.id,
        text: option.value,
        rawHtml: `<p>${option.value}</p>`, // ✅ Loại bỏ prefix `${option.id}. `
      })),
      correctAnswers: this.state.selectedAnswers, // Chuẩn hóa giống upload
      type: this.state.type,
      level: mapLevelToShort(this.state.level),
      question_level: mapLevelToShort(this.state.level), // Thêm question_level giống upload
      explanation: this.cleanExplanation(this.state.explanation),
      video_link: this.state.video_link,
      question_no: this.state.questionNo,
      question_id: `manual-${Date.now()}-${Math.random()}`, // ID duy nhất
      code: `${this.state.questionNo}`, // Mã câu hỏi
      images: this.state.uploadedImages || [], // Danh sách hình ảnh
      created_at: new Date().toISOString(), // Thời gian tạo
      __temp: false, // Không phải tạm thời
    };

    // Add ID for update operations - same logic as ModalQuestion1
    if (
      this.state.actionQuestion === "update" &&
      this.state.currentQuestionvalue
    ) {
      const currentQ = this.state.currentQuestionvalue;

      // Đảm bảo có ít nhất một ID hợp lệ
      const validId = currentQ._id || currentQ.id || currentQ.question_id;
      if (!validId) {
        alert("Không tìm thấy ID câu hỏi để cập nhật!");
        setLoader(false);
        return;
      }

      // Giữ nguyên question_no để tránh thay đổi vị trí
      question.question_no = this.state.questionNo;
      question._id = validId;
      question.question_id = validId;
      question.created_at = currentQ.created_at || new Date().toISOString();
      question.updated_at = new Date().toISOString();
    } else {
      const uniqueId = `manual-${Date.now()}-${Math.random()}`;
      question._id = uniqueId;
      question.question_id = uniqueId;
      question.code = `${this.state.questionNo}`;
      question.created_at = new Date().toISOString();
    }

    try {
      if (this.state.actionQuestion === "create") {
        // For create operations, generate a temporary ID
        question._id = `temp-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;
        question.question_id = question._id;

        await this.props.actionCreateQuestion(question);
      } else {
        // Đảm bảo có ID hợp lệ cho update
        if (!this.state.currentQuestionvalue?._id) {
          alert("Không tìm thấy ID câu hỏi để cập nhật!");
          setLoader(false);
          return;
        }

        // Giữ nguyên question_no để tránh thay đổi vị trí
        question.question_no = this.state.questionNo;
        question._id = this.state.currentQuestionvalue._id;
        question.question_id =
          this.state.currentQuestionvalue.question_id ||
          this.state.currentQuestionvalue._id;
        question.created_at =
          this.state.currentQuestionvalue.created_at ||
          new Date().toISOString();
        question.updated_at = new Date().toISOString();

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
    document.getElementById("close_create_5").click();
  };

  _handleEditorContent1Change = (content) => {
    if (this._isSettingQuestionContent) return;

    const processedContent = this.processLatexInContent(content);

    this.setState({
      rawHtml: processedContent,
      content1: processedContent,
    });

    if (
      processedContent !== content &&
      /(\\\(|\\\[|\$\$|\$)/.test(content)
    ) {
      this._isSettingQuestionContent = true;
      setTimeout(() => {
        try {
          if (this.questionEditor && typeof this.questionEditor.setContents === "function") {
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
    this.setState({ explanation: processedContent });

    if (
      processedContent !== content &&
      /(\\\(|\\\[|\$\$|\$)/.test(content)
    ) {
      this._isSettingExplanationContent = true;
      setTimeout(() => {
        try {
          if (this.solutionEditor && typeof this.solutionEditor.setContents === "function") {
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

  handleOptionEditorChange = (optionId, content) => {
    if (this._isSettingAnswerContent[optionId]) return;

    const processedContent = this.processLatexInContent(content);
    const plainText = this.cleanExplanation(processedContent);
    const cleanedContent = this.cleanHtmlContent(processedContent);

    this.updateOption(optionId, plainText, cleanedContent);

    if (
      processedContent !== content &&
      /(\\\(|\\\[|\$\$|\$)/.test(content)
    ) {
      this._isSettingAnswerContent[optionId] = true;
      setTimeout(() => {
        try {
          const editor = this[`optionEditor_${optionId}`];
          if (editor && typeof editor.setContents === "function") {
            editor.setContents(processedContent);
          }
        } finally {
          this._isSettingAnswerContent[optionId] = false;
        }
      }, 0);
    }

    if (this.state.showPreviewOptions[optionId]) {
      setTimeout(() => {
        this.renderPreviewOption(optionId);
      }, 100);
    }
  };

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

  toggleMathFieldForOption = (optionId) => {
    this.setState((prevState) => ({
      showMathFieldOptions: {
        ...prevState.showMathFieldOptions,
        [optionId]: !prevState.showMathFieldOptions[optionId],
      },
    }));
  };

  handleMathClick = (elOrEvent, target, optionId = null) => {
    const el = elOrEvent && elOrEvent.target ? elOrEvent.target : elOrEvent;
    if (!el || !el.closest) {
      console.error("Invalid element passed to handleMathClick:", elOrEvent);
      return;
    }
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
              `math-field-option-${optionId}`
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
    if (!editor || !editor.core || !editor.core.context || !editor.core.context.element) return;
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
        const escapedLatex = String(latex).replace(/"/g, '&quot;');
        const renderedWithAttr = renderedLatex.replace('<span class="katex"', `<span class="katex" data-latex="${escapedLatex}"`);
        const mathSymbolHTML = `<span class="math-symbol" data-latex="${escapedLatex}">${renderedWithAttr}</span>`;

        // Nếu đang thay thế element cũ
        if (this.state.selectedMathElement) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = mathSymbolHTML;
          const newElement = tempDiv.firstChild;

          // Thay thế element cũ bằng element mới tại chỗ
          this.state.selectedMathElement.parentNode.replaceChild(newElement, this.state.selectedMathElement);

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
    this.setState((prevState) => ({
      options: prevState.options.map((option) =>
        option.id === optionId
          ? {
            ...option,
            value: text || option.value,
            text: text || option.text,
            html: html !== null ? html : option.html,
          }
          : option
      ),
    }));
  };

  renderQuestionType = (type) => {
    switch (type) {
      default:
        return "Trắc nghiệm Nhiều Đáp Án";
    }
  };

  insertSymbolToStatement = (index, symbol) => {
    this.setState((prevState) => ({
      options: prevState.options.map((option, i) =>
        i === index ? { ...option, value: option.value + symbol } : option
      ),
    }));
  };

  render() {
    const { selectedAnswers } = this.state;

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

        <div className="row">
          <div className="col-sm-12 col-form-div">
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
                    {/* Preview toggle cho câu hỏi */}
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewQuestion ? 'btn-success' : 'btn-outline-primary'} ml-2`}
                      style={{ height: "40px", padding: "8px" }}
                      onClick={() => {
                        this.setState(
                          { showPreviewQuestion: !this.state.showPreviewQuestion },
                          () => {
                            if (this.state.showPreviewQuestion) {
                              setTimeout(() => this.renderPreviewQuestion(), 100);
                            }
                          }
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
                  <SunEditor
                    id="question-editor"
                    getSunEditorInstance={(sunEditor) => {
                      this.questionEditor = sunEditor;
                      this.attachMathClickListener(sunEditor, "question");
                    }}
                    onImageUploadBefore={this.handleImageUploadBefore}
                    height={"300px"}
                    defaultValue={this.state.rawHtml}
                    onChange={this._handleEditorContent1Change}
                    setOptions={{
                      buttonList: baseHelpers.getSunEditorOptions2(),
                      katex: katex,
                      showPathLabel: false,
                      onMouseDown: (e) => this.handleMathClick(e, "question"),
                      attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                      addTagsWhitelist: 'span|svg|path|symbol|use',
                    }}
                  />
                  {/* Container preview câu hỏi */}
                  {this.state.showPreviewQuestion && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Nội dung câu hỏi</strong>
                        </div>
                        <div
                          id="preview-container"
                          className="card-body"
                          style={{
                            minHeight: "100px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "15px"
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
          <div className="col-2 col-form-div">
            <div className="form-group">
              <label className="col-form-label">Đáp án</label>
            </div>
          </div>
          <div className="col-sm-10">
            <div className="form-group">
              {this.state.options.map((option, index) => (
                <div key={option.id} className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Checkbox
                      onChange={this._onChangeCheckBoxG}
                      name={`answer${option.id}`}
                      value={option.id}
                      checked={selectedAnswers.includes(option.id)}
                      className="mr-2"
                    />
                    <span className="mr-2 font-weight-bold">{option.id}:</span>
                    <div className="input-group flex-grow-1">
                      <SunEditor
                        id={`option-editor-${option.id}`}
                        getSunEditorInstance={(sunEditor) => {
                          this[`optionEditor_${option.id}`] = sunEditor;
                          this.attachMathClickListener(sunEditor, "option", option.id);
                        }}

                        onImageUploadBefore={this.handleImageUploadBefore}
                        height={"80px"}
                        defaultValue={option.html || option.text || option.value || ""}
                        key={`${option.id}-${option.html || option.text || option.value || ""}`} // Force re-render khi content thay đổi
                        onChange={(content) => {
                          this.handleOptionEditorChange(option.id, content);
                        }}
                        setOptions={{
                          buttonList: [],
                          katex: katex,
                          showPathLabel: false,
                          onMouseDown: (e) =>
                            this.handleMathClick(e, "option", option.id),
                          attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                          addTagsWhitelist: 'span',
                        }}
                      />
                    </div>
                    <div className="d-flex flex-column ml-2">
                      <button
                        type="button"
                        className="btn btn-primary mb-1"
                        style={{ height: "30px", padding: "8px", fontSize: "12px" }}
                        onClick={() => this.toggleMathFieldForOption(option.id)}
                        title="Chèn công thức"
                      >
                        ∑
                      </button>
                      {/* Preview toggle cho từng đáp án */}
                      <button
                        type="button"
                        className={`btn ${(this.state.showPreviewOptions && this.state.showPreviewOptions[option.id]) ? 'btn-success' : 'btn-outline-primary'} mb-1`}
                        style={{ height: "30px", padding: "6px", fontSize: "12px" }}
                        onClick={() => {
                          this.setState(
                            (prev) => ({
                              showPreviewOptions: {
                                ...prev.showPreviewOptions,
                                [option.id]: !prev.showPreviewOptions[option.id],
                              },
                            }),
                            () => {
                              if (this.state.showPreviewOptions && this.state.showPreviewOptions[option.id]) {
                                setTimeout(() => this.renderPreviewOption(option.id), 100);
                              }
                            }
                          );
                        }}
                        title={`Xem trước đáp án ${index + 1}`}
                      >
                        <i className="fa fa-eye"></i>
                      </button>

                      {this.state.options.length > 2 && (
                        <button
                          type="button"
                          className={`btn btn-sm ${this.state.options.length <= 2 ||
                            index !== this.state.options.length - 1
                            ? "btn-secondary"
                            : "btn-outline-danger"
                            }`}
                          style={{
                            height: "30px",
                            padding: "0 8px",
                            fontSize: "12px",
                            backgroundColor: this.state.options.length <= 2 ||
                              index !== this.state.options.length - 1
                              ? "#ffffff" : "", // Background trắng
                            borderColor: this.state.options.length <= 2 ||
                              index !== this.state.options.length - 1
                              ? "#adb5bd" : "", // Border xám mờ
                            color: this.state.options.length <= 2 ||
                              index !== this.state.options.length - 1
                              ? "#adb5bd" : "", // Text xám mờ
                            cursor: this.state.options.length <= 2 ||
                              index !== this.state.options.length - 1
                              ? "not-allowed" : "pointer" // Cursor thay đổi
                          }}
                          onClick={() => this.removeOption(index)}
                          title={
                            this.state.options.length <= 2 ||
                              index !== this.state.options.length - 1
                              ? "Chỉ có thể xóa lựa chọn cuối cùng"
                              : "Xóa đáp án"
                          }
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  {this.state.showMathFieldOptions[option.id] && (
                    <div className="d-flex align-items-center ml-4">
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
                  {/* Container preview cho đáp án */}
                  {this.state.showPreviewOptions &&
                    this.state.showPreviewOptions[option.id] && (
                      <div className="mt-2 ml-4">
                        <div className="card border-info">
                          <div className="card-header bg-info text-white">
                            <strong>Preview - Đáp án {index + 1}</strong>
                          </div>
                          <div
                            id={`preview-option-${option.id}`}
                            className="card-body"
                            style={{
                              minHeight: "80px",
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                              padding: "10px"
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <button
              type="button"
              className="btn btn-outline-success mb-3"
              onClick={this.addOption}
            >
              + Thêm đáp án
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">Độ khó</label>
              <div className="card border-primary">
                <div className="card-body">
                  <Radio.Group
                    onChange={this._onChange}
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
                    {/* Preview toggle cho giải thích */}
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewExplanation ? 'btn-success' : 'btn-outline-primary'} ml-2`}
                      style={{ height: "40px", padding: "8px" }}
                      onClick={() => {
                        this.setState(
                          { showPreviewExplanation: !this.state.showPreviewExplanation },
                          () => {
                            if (this.state.showPreviewExplanation) {
                              setTimeout(() => this.renderPreviewExplanation(), 100);
                            }
                          }
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
                      attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                      addTagsWhitelist: 'span',
                    }}
                  />
                  {/* Container preview giải thích */}
                  {this.state.showPreviewExplanation && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Giải thích</strong>
                        </div>
                        <div
                          id="preview-explanation"
                          className="card-body"
                          style={{
                            minHeight: "100px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "15px"
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
            <div className="form-group">
              <label className="col-form-label">Video tham khảo</label>
              <div className="">
                <input
                  type="text"
                  className="form-control"
                  name="video_link"
                  onChange={this._onChange}
                  value={this.state.video_link}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-sm-12 text-right">
            {this.props.actionQuestion === "update" && (
              <button
                name="reset"
                value="1"
                className="btn btn-primary mt-2 ml-2"
                onClick={this.handleSave}
              >
                Cập nhật
              </button>
            )}

            {this.props.actionQuestion === "create" && (
              <button
                name="save_temp"
                value="1"
                className="btn btn-primary mt-2 ml-2"
                onClick={(e) => {
                  e.preventDefault();

                  // Validation
                  if (
                    !this.state.content1 ||
                    this.state.content1.trim() === ""
                  ) {
                    alert("Vui lòng nhập nội dung câu hỏi!");
                    return;
                  }

                  if (
                    this.state.options.every(
                      (option) => !option.value || option.value.trim() === ""
                    )
                  ) {
                    alert("Vui lòng nhập ít nhất một lựa chọn!");
                    return;
                  }

                  if (this.state.selectedAnswers.length === 0) {
                    alert("Vui lòng chọn ít nhất một đáp án đúng!");
                    return;
                  }

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

                  const tempQuestion = {
                    exam_id: examId,
                    exam_section_id:
                      examSectionId === "" ? null : examSectionId,
                    exam_section_group_id:
                      examSectionGroupId === "" ? null : examSectionGroupId,
                    subject_id:
                      examSectionSubjectId === "" ? null : examSectionSubjectId,
                    childExamId: childExamId,
                    rawHtml: this.state.rawHtml,
                    answer: this.state.selectedAnswers.join(", "),
                    choices: this.state.options.map((option) => ({
                      label: option.id,
                      text: option.value,
                      rawHtml: `<p>${option.value}</p>`,
                    })),
                    answer_content: this.state.content1,
                    type: this.state.type,
                    level: mapLevelToShort(this.state.level),
                    explanation: this.cleanExplanation(this.state.explanation),
                    video_link: this.state.video_link,
                    question_no: this.state.questionNo,
                    images: this.state.uploadedImages || [], // Danh sách hình ảnh
                    _id: `temp-${Date.now()}-${Math.floor(
                      Math.random() * 10000
                    )}`,
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
              id="close_create_5"
              className="btn btn-light mt-2 ml-2"
              data-dismiss="modal"
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

function mapStateToProps(state) {
  return {
    image: state.question.image,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ uploadImage }, dispatch);
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalQuestion5)
);
