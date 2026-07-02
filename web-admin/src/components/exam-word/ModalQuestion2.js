import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Radio, notification } from "antd";
import { setLoader } from "../LoadingContext";
import $ from "jquery";
import { uploadImage } from "../../redux/question/action";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import "katex/dist/katex.min.css";
import katex from "katex";
import renderMathInElement from "katex/dist/contrib/auto-render";
import baseHelpers from "../../helpers/BaseHelpers";
import "mathlive/mathlive-static.css";

class ModalQuestion2 extends Component {
  constructor(props) {
    super();
    this.state = {
      questionNo: 1,
      type: "truefalsemulti",
      question: null,
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "",
      explanation: "",
      selectedFile: null,
      content: "",
      rawHtml: "",
      uploadedImages: [],
      actionQuestion: "create",
      currentQuestionvalue: null,
      originalQuestionNo: null,
      showMathFieldOptions: {}, // Thêm để toggle MathfieldElement cho statements
      showMathFieldQuestion: false,
      showMathFieldExplanation: false,
      // Preview states
      showPreviewQuestion: false,
      showPreviewStatements: {},
      showPreviewExplanation: false,
      statements: [
        {
          id: 1,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        }, // Thêm html và text
        {
          id: 2,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        },
        {
          id: 3,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        },
        {
          id: 4,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        },
      ],
    };
    this._isSettingQuestionContent = false;
    this._isSettingStatementContent = {};
    this._isSettingExplanationContent = false;
    this.editorRef = React.createRef();
    this.solutionEditorRef = React.createRef();
    this.questionEditor = null; // Thêm ref cho question editor
    this.solutionEditor = null; // Thêm ref cho solution editor
    this.mathFieldQuestionRef = React.createRef(); // Thêm ref cho math field question
    this.mathFieldExplanationRef = React.createRef(); // Thêm ref cho math field explanation
    this.mutationObserver = null; // Thêm cho auto-render
  }

  // Hàm xử lý các thẻ math span (math|math-symbol) thành LaTeX
  processMathSpansToLatex = (content) => {
    if (!content) return content;
    return content.replace(
      /<span class="(?:math|math-symbol)"[^>]*data-latex="([^"]*)"[^>]*>(.*?)<\/span>|<span class="(?:math|math-symbol)"[^>]*>(.*?)<\/span>/gi,
      (match, latexFromData, _, innerContent) => {
        const latex = latexFromData || innerContent || "";
        return latex ? `\\(${latex}\\)` : match;
      }
    );
  };

  // Hàm xử lý base64 images trong content
  processImageContent = (content) => {
    if (!content) return content;

    try {

      // ✅ THAY ĐỔI: Giữ nguyên img tags thay vì thay thế bằng placeholder
      const processedContent = content.replace(
        /<img\s+([^>]*src="data:image\/[^;]+;base64,[^"]*"[^>]*)>/gi,
        (match, attributes) => {
          // Đảm bảo img tag có style responsive và hiển thị đúng
          const hasStyle = /style\s*=/i.test(attributes);
          const hasClass = /class\s*=/i.test(attributes);

          let processedAttributes = attributes;

          // Thêm style responsive nếu chưa có
          if (!hasStyle) {
            processedAttributes += ' style="max-width: 100%; height: auto; display: block; margin: 10px 0;"';
          } else {
            // Cập nhật style hiện có để đảm bảo responsive
            processedAttributes = processedAttributes.replace(
              /style\s*=\s*["']([^"']*)["']/i,
              (styleMatch, styleContent) => {
                let newStyle = styleContent;
                if (!newStyle.includes('max-width')) {
                  newStyle += '; max-width: 100%';
                }
                if (!newStyle.includes('height') || newStyle.includes('height: auto')) {
                  newStyle += '; height: auto';
                }
                if (!newStyle.includes('display')) {
                  newStyle += '; display: block';
                }
                if (!newStyle.includes('margin')) {
                  newStyle += '; margin: 10px 0';
                }
                return `style="${newStyle}"`;
              }
            );
          }

          // Thêm class nếu chưa có
          if (!hasClass) {
            processedAttributes += ' class="img-responsive question-image"';
          }

          return `<img ${processedAttributes}>`;
        }
      );

      return processedContent;
    } catch (error) {
      return content;
    }
  };

  // Hàm xử lý content để hiển thị trong SunEditor
  prepareContentForEditor = (content) => {
    if (!content) return "";
    let processedContent = this.processImageContent(content);

    // Loại bỏ các thẻ <li> ngoài cùng nếu có
    processedContent = processedContent.replace(/^<li>(.*)<\/li>$/i, "$1");
    // ✅ THÊM: Đảm bảo các ký tự đặc biệt được escape đúng
    processedContent = processedContent
      .replace(/\\"/g, '"')  // Unescape quotes
      .replace(/\\\\/g, '\\'); // Unescape backslashes

    return processedContent;
  };

  removeLiTags = (content) => {
    if (!content) return content;
    return content.replace(/<li[^>]*>/gi, "").replace(/<\/li>/gi, "");
  };


  // ✅ THÊM: Hàm xử lý khi set content vào editor
  setEditorContentSafely = (editor, content) => {
    if (!editor || !content) return;

    try {
      // Đảm bảo content được xử lý đúng trước khi set vào editor
      const processedContent = this.prepareContentForEditor(content);

      if (typeof editor.setContents === 'function') {
        editor.setContents(processedContent);
      } else if (typeof editor.setContent === 'function') {
        editor.setContent(processedContent);
      }
    } catch (error) {
      console.error('Error setting editor content:', error);
    }
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
      const {
        answer,
        correctAnswers,
        answer_content,
        doc_link,
        video_link,
        question_no,
        level,
        question_level,
        explanation,
      } = this.props.currentQuestionvalue || {};

      const mapLevel = (lvl) => {
        const result = lvl || "";
        return result;
      };

      const mappedLevel = mapLevel(level || question_level);

      // ✅ Enhanced normalize function to support both Vietnamese and English
      const norm = (v) => {
        if (v === true || v === "true" || v === "TRUE" || v === 1 || v === "1")
          return true;
        if (
          v === false ||
          v === "false" ||
          v === "FALSE" ||
          v === 0 ||
          v === "0"
        )
          return false;
        if (typeof v === "string") {
          const lower = v.toLowerCase().trim();
          // ✅ Support both Vietnamese and English, including short forms
          if (lower === "đúng" || lower === "dung" || lower === "true" || lower === "đ")
            return true;
          if (lower === "sai" || lower === "false" || lower === "s") return false;
        }
        const result = !!v;
        return result;
      };

      // Đơn giản hóa xây dựng statements - tạo động dựa trên số choices
      let statements = [];
      const rawChoices = this.props.currentQuestionvalue?.choices || [];

      // Tạo statements dựa trên số choices, ít nhất 2
      const numStatements = Math.max(rawChoices.length, 2);
      for (let i = 0; i < numStatements; i++) {
        statements.push({
          id: i + 1,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        });
      }

      rawChoices.forEach((choice, index) => {
        if (index < statements.length) {
          const text =
            typeof choice === "string"
              ? choice
              : choice.text || choice.content || "";
          const html =
            typeof choice === "string"
              ? choice
              : choice.html ||
              choice.rawHtml ||
              choice.text ||
              choice.content ||
              "";
          // Loại bỏ thẻ li khỏi content và html của statement, xử lý LaTeX thành math-symbol spans
          const processedHtml = this.processLatexInContent(this.removeLiTags(html));
          statements[index].content = this.removeLiTags(text);
          statements[index].text = this.cleanExplanation(processedHtml);
          statements[index].html = this.cleanHtmlContent(
            this.prepareContentForEditor(processedHtml)
          );
        }
      });

      // Đơn giản hóa set answer từ dataSource
      const dataSource = correctAnswers || answer;
      if (Array.isArray(dataSource) && dataSource.length > 0) {
        // Phát hiện ngôn ngữ từ dữ liệu gốc
        const detectLanguage = (items) => {
          for (const item of items) {
            if (typeof item === "boolean") {
              return "english"; // ✅ Thêm: Boolean = English
            }
            if (typeof item === "object" && item !== null) {
              const value = item.value || item.answer || item.rawHtml || "";
              if (typeof value === "string") {
                const lowerValue = value.toLowerCase().trim();
                if (lowerValue === "true" || lowerValue === "false") {
                  return "english";
                }
                if (lowerValue === "đúng" || lowerValue === "sai" || lowerValue === "đ" || lowerValue === "s") {
                  return "vietnamese";
                }
              }
            } else if (typeof item === "string") {
              const lowerItem = item.toLowerCase().trim();
              if (lowerItem === "true" || lowerItem === "false") {
                return "english";
              }
              if (lowerItem === "đúng" || lowerItem === "sai" || lowerItem === "đ" || lowerItem === "s") {
                return "vietnamese";
              }
            }
          }
          return "vietnamese"; // Default to Vietnamese
        };

        const language = detectLanguage(dataSource);

        dataSource.forEach((item, idx) => {
          if (idx < statements.length) {
            let answerValue = true;

            if (typeof item === "object" && item !== null) {
              const rawValue = item.value || item.answer || item.rawHtml || "";
              answerValue = norm(rawValue);
            } else {
              answerValue = norm(item);
            }

            statements[idx].answer = answerValue;

            // Sử dụng ngôn ngữ phát hiện được
            if (language === "english") {
              statements[idx].answerRaw = answerValue ? "True" : "False";
            } else {
              statements[idx].answerRaw = answerValue ? "Đúng" : "Sai";
            }
          }
        });
      } else if (dataSource && typeof dataSource === "object") {
        // Object format: {A: true, B: false, ...} or {0: true, 1: false, ...}
        // Phát hiện ngôn ngữ từ object values
        const detectLanguageFromObject = (obj) => {
          const values = Object.values(obj);
          for (const value of values) {
            if (typeof value === "boolean") {
              return "english"; // ✅ Thêm: Boolean = English
            }
            if (typeof value === "string") {
              const lowerValue = value.toLowerCase().trim();
              if (lowerValue === "true" || lowerValue === "false") {
                return "english";
              }
              if (lowerValue === "đúng" || lowerValue === "sai" || lowerValue === "đ" || lowerValue === "s") {
                return "vietnamese";
              }
            }
          }
          return "vietnamese"; // Default to Vietnamese
        };

        const language = detectLanguageFromObject(dataSource);
        const keys = Object.keys(dataSource);
        keys.forEach((key, index) => {
          if (index < statements.length) {
            const boolValue = norm(dataSource[key]);
            statements[index].answer = boolValue;
            // Sử dụng ngôn ngữ phát hiện được
            if (language === "english") {
              statements[index].answerRaw = boolValue ? "True" : "False";
            } else {
              statements[index].answerRaw = boolValue ? "Đúng" : "Sai";
            }
          }
        });
      }

      let questionContent =
        this.props.currentQuestionvalue?.rawHtml || answer_content || "";
      questionContent = this.removeLiTags(
        this.processLatexInContent(questionContent)
      );


      // ✅ SỬA: Kiểm tra xem có base64 images không
      const preparedContent = this.prepareContentForEditor(questionContent);
      const hasImages = /<img\s+[^>]*src="data:image\/[^;]+;base64,[^"]*"[^>]*>/i.test(preparedContent);

      const cleanedContent = hasImages ? preparedContent : this.cleanHtmlContent(preparedContent);

      let explanationContent = explanation || doc_link || "";
      explanationContent = this.removeLiTags(
        this.processLatexInContent(explanationContent)
      );
      const cleanedExplanation = this.cleanHtmlContent(
        this.prepareContentForEditor(explanationContent)
      );

      this.setState({
        currentQuestionvalue: this.props.currentQuestionvalue,
        statements,
        answer_content,
        doc_link: doc_link || "",
        video_link: video_link || "",
        level: mappedLevel || "",
        explanation: cleanedExplanation,
        questionNo: this.props.questionNo || question_no || 1, // ✅ Ưu tiên props.questionNo đã được tính toán đúng
        rawHtml: questionContent,
        content: cleanedContent,
        uploadedImages: this.props.currentQuestionvalue.images || [], // ✅ THÊM: Load uploadedImages từ question
        ...(this.state.originalQuestionNo === null && {
          originalQuestionNo: this.props.questionNo || question_no || 1, // ✅ Ưu tiên props.questionNo
        }),
      });

      // ✅ Thêm: Nếu có answerRaw từ data, override statements
      if (
        this.props.currentQuestionvalue?.answerRaw &&
        Array.isArray(this.props.currentQuestionvalue.answerRaw)
      ) {
        this.props.currentQuestionvalue.answerRaw.forEach((raw, idx) => {
          if (idx < statements.length) {
            statements[idx].answerRaw = raw;
            statements[idx].answer = raw === "True" || raw === "Đúng"; // Sync boolean
          }
        });
        // Update state again với answerRaw
        this.setState({ statements });
      }

      // Update editors content
      setTimeout(() => {

        this.setEditorContentSafely(this.questionEditor, hasImages ? preparedContent : cleanedContent);
        this.setEditorContentSafely(this.solutionEditor, cleanedExplanation);

        this.state.statements.forEach((statement) => {
          const optionEditor = this[`optionEditor_${statement.id}`];
          if (optionEditor) {
            this.setEditorContentSafely(optionEditor, statement.html || "");
          }
        });

      }, 200);
    }
  };

  setupAutoRender = () => {
    const container =
      document.querySelector("#modalQuestion2") ||
      document.querySelector("#create2") ||
      document.body;
    if (container) {
      console.log("Setting up auto-render in container:", container);
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

  setupMutationObserver = () => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    const observeTarget =
      document.querySelector("#modalQuestion2") ||
      document.querySelector("#create2");
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
    // ✅ CẢI THIỆN: Reset ngay khi component mount nếu là create mode
    if (this.props.actionQuestion === "create") {
      this.clearAllInputs();
    }

    // Khi component được mount, thêm sự kiện lắng nghe để reset state khi modal hiển thị
    $(document).on("show.bs.modal", "#modalQuestion2, #create2", () => {
      if (this.props.actionQuestion === "create") {
        this.clearAllInputs();
      }
    });

    // Thêm sự kiện lắng nghe khi modal đóng
    $(document).on("hide.bs.modal", "#modalQuestion2, #create2", () => {
      this.clearAllInputs();
    });

    // Thêm setup cho auto-render và MutationObserver
    const modals = document.querySelectorAll("#modalQuestion2, #create2");
    modals.forEach((modal) => {
      modal.addEventListener("shown.bs.modal", () => {
        setTimeout(() => {
          this.setupMutationObserver();
          this.setupMathFieldEventListeners();
        }, 500);
      });
      modal.addEventListener("hidden.bs.modal", () => {
        this.cleanupMutationObserver();
        this.cleanupMathFieldEventListeners();
      });
    });
  }

  // Thêm event listeners cho MathfieldElement để nhấn Enter tự động chèn
  setupMathFieldEventListeners = () => {
    // Question math field
    if (this.mathFieldQuestionRef.current) {
      this.mathFieldQuestionRef.current.addEventListener(
        "keydown",
        this.handleQuestionMathFieldKeyDown
      );
    }

    // Explanation math field
    if (this.mathFieldExplanationRef.current) {
      this.mathFieldExplanationRef.current.addEventListener(
        "keydown",
        this.handleExplanationMathFieldKeyDown
      );
    }

    // Option math fields
    this.state.statements.forEach((statement) => {
      const mathField = document.getElementById(
        `math-field-option-${statement.id}`
      );
      if (mathField) {
        mathField.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.insertFromField("option", statement.id);
          }
        });
      }
    });
  };

  // Event handlers cho MathfieldElement
  handleQuestionMathFieldKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.insertFromField("question");
    }
  };

  handleExplanationMathFieldKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.insertFromField("explanation");
    }
  };

  // Cleanup event listeners
  cleanupMathFieldEventListeners = () => {
    if (this.mathFieldQuestionRef.current) {
      this.mathFieldQuestionRef.current.removeEventListener(
        "keydown",
        this.handleQuestionMathFieldKeyDown
      );
    }
    if (this.mathFieldExplanationRef.current) {
      this.mathFieldExplanationRef.current.removeEventListener(
        "keydown",
        this.handleExplanationMathFieldKeyDown
      );
    }
    // Note: Option math fields are cleaned up automatically when modal closes
  };

  componentWillUnmount() {
    // Xóa sự kiện lắng nghe khi component bị hủy
    $(document).off("show.bs.modal", "#modalQuestion2, #create2");
    $(document).off("hide.bs.modal", "#modalQuestion2, #create2");
    this.cleanupMutationObserver();
    this.cleanupMathFieldEventListeners();
  }

  // Phương thức đặt lại nội dung của Editor
  resetEditorContent = () => {
    this.setState({
      content: "",
      rawHtml: "",
      explanation: "",
      showMathFieldQuestion: false,
      showMathFieldExplanation: false,
    });

    // ✅ THÊM: Force reset editors
    if (
      this.editorRef &&
      this.editorRef.current &&
      this.editorRef.current.editor
    ) {
      this.editorRef.current.editor.setContent("");
    }
    if (
      this.solutionEditorRef &&
      this.solutionEditorRef.current &&
      this.solutionEditorRef.current.editor
    ) {
      this.solutionEditorRef.current.editor.setContent("");
    }
    if (this.questionEditor && typeof this.questionEditor.setContents === 'function') {
      try {
        this.questionEditor.setContents("");
      } catch (error) {
        console.warn('Failed to reset question editor in resetEditorContent:', error);
      }
    }
    if (this.solutionEditor && typeof this.solutionEditor.setContents === 'function') {
      try {
        this.solutionEditor.setContents("");
      } catch (error) {
        console.warn('Failed to reset solution editor in resetEditorContent:', error);
      }
    }
  };

  // Phương thức đặt lại state về giá trị mặc định
  resetState = () => {
    this.setState({
      questionNo: this.props.questionNo || 1,
      type: "truefalsemulti",
      question: null,
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "",
      explanation: "",
      selectedFile: null,
      content: "",
      rawHtml: "",
      uploadedImages: [],
      currentQuestionvalue: null,
      originalQuestionNo: null,
      showMathFieldOptions: {},
      showMathFieldQuestion: false,
      showMathFieldExplanation: false,
      statements: [
        {
          id: 1,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        }, // Default Vietnamese
        {
          id: 2,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        },
        {
          id: 3,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        },
        {
          id: 4,
          content: "",
          answer: true,
          answerRaw: "Đúng",
          html: "",
          text: "",
        },
      ],
    });
  };

  // Phương thức làm sạch tất cả các ô input
  clearAllInputs = () => {
    // ✅ THÊM: Reset currentQuestionvalue trước tiên
    this.setState({ currentQuestionvalue: null }, () => {
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
          '#modalQuestion2 input[type="text"], #create2 input[type="text"]'
        );
        inputs.forEach((input) => {
          if (input.name !== "video_link") {
            // Keep video_link as it's handled by state
            input.value = "";
          }
        });

        // Clear select elements
        const selects = document.querySelectorAll(
          "#modalQuestion2 select, #create2 select"
        );
        selects.forEach((select) => {
          select.selectedIndex = 0;
        });

        // Clear radio buttons
        const radios = document.querySelectorAll(
          '#modalQuestion2 input[type="radio"], #create2 input[type="radio"]'
        );
        radios.forEach((radio) => {
          radio.checked = false;
        });
      }, 100);

      // ✅ THÊM: Reset nội dung cho tất cả statement editors sau khi state đã được cập nhật
      setTimeout(() => {
        if (this.questionEditor && typeof this.questionEditor.setContents === 'function') {
          try {
            this.questionEditor.setContents("");
          } catch (error) {
            console.warn('Failed to reset question editor:', error);
          }
        }
        if (this.solutionEditor && typeof this.solutionEditor.setContents === 'function') {
          try {
            this.solutionEditor.setContents("");
          } catch (error) {
            console.warn('Failed to reset solution editor:', error);
          }
        }
        // Reset nội dung cho các statement editors
        this.state.statements.forEach((statement) => {
          const statementEditor = this[`optionEditor_${statement.id}`];
          if (statementEditor && typeof statementEditor.setContents === 'function') {
            try {
              statementEditor.setContents("");
            } catch (error) {
              console.warn(`Failed to reset statement editor ${statement.id}:`, error);
            }
          }
        });
        // ✅ THÊM: Clear math fields
        const mathFields = document.querySelectorAll('math-field');
        mathFields.forEach(field => {
          if (field.setValue) field.setValue("");
        });
      }, 200);  // Đảm bảo chạy sau setTimeout 100ms
    });
  };

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  cleanExplanation = (explanation) => {
    if (!explanation) return null;

    // Loại bỏ thẻ <p>, <br>, hoặc tag HTML khác
    let plainText = explanation
      .replace(/<\/?p[^>]*>/gi, "") // Xóa riêng <p> và </p>
      .replace(/<br\s*\/?>/gi, "") // Xóa <br>
      .replace(/<[^>]*>/g, "") // Xóa các tag HTML khác
      .trim();

    return plainText || null;
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

  handleSave = async (e) => {
    setLoader(true);
    e.preventDefault();

    // Validation
    if (!this.state.content || this.state.content.trim() === "") {
      alert("Vui lòng nhập nội dung câu hỏi!");
      setLoader(false);
      return;
    }

    // Validation cho statements - tất cả mệnh đề phải có nội dung
    const hasValidStatement = this.state.statements.every(
      (statement) =>
        statement.content &&
        statement.content.trim() !== "" &&
        statement.text &&
        statement.text.trim() !== ""
    );
    if (!hasValidStatement) {
      alert("Vui lòng nhập nội dung cho tất cả các mệnh đề!");
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

    // Đơn giản hóa map level - giữ nguyên giá trị
    const mapLevelToShort = (lvl) => {
      const result = lvl || "";
      return result;
    };

    // Lấy content từ editors
    let questionContent = "";
    if (this.questionEditor) {
      questionContent = this.questionEditor.getContents();
    } else {
      questionContent = this.state.content || this.state.rawHtml || "";
    }
    const cleanedQuestionContent = this.cleanHtmlContent(questionContent);

    let explanationContent = "";
    if (this.solutionEditor) {
      explanationContent = this.solutionEditor.getContents();
    } else {
      explanationContent = this.state.explanation || "";
    }
    const cleanedExplanationContent = this.cleanHtmlContent(explanationContent);

    let question = {
      // Essential IDs for database
      exam_id: examId,
      exam_section_id: examSectionId === "" ? null : examSectionId,
      exam_section_group_id:
        examSectionGroupId === "" ? null : examSectionGroupId,
      subject_id: subject_id, // ✅ Sử dụng subject_id đã validate
      topic_id: currentTopicId,
      questionTopicGroupId: questionIdGroupTopic,
      childExamId: childExamId,

      // Question content - use rawHtml format like ModalQuestion1
      rawHtml: cleanedQuestionContent,
      answer_content: cleanedQuestionContent,

      // Answer configuration for TRUEFALSEMULTI
      answer: {}, // Will be populated below
      correctAnswers: [], // Will be populated below - use object format for TRUEFALSEMULTI

      // Choices array with proper structure
      choices: this.state.statements.map((statement, index) => ({
        label: String.fromCharCode(65 + index), // A, B, C, D
        text: statement.text || "",
        html: this.cleanHtmlContent(statement.html || statement.text || ""),
        rawHtml: this.cleanHtmlContent(statement.html || statement.text || ""),
      })),

      // Question metadata
      type: this.state.type, // Explicitly set type like ModalQuestion1
      level: mapLevelToShort(this.state.level),
      question_level: mapLevelToShort(this.state.level),
      question_no: this.state.questionNo,

      // Additional content
      explanation: cleanedExplanationContent,
      video_link: this.state.video_link || "",
      images: this.state.uploadedImages || [],

      // Flags
      __temp: false,
    };

    // Build answer object and correctAnswers for TRUEFALSEMULTI
    this.state.statements.forEach((statement, index) => {
      const key = String.fromCharCode(65 + index); // A, B, C, D (uppercase like ModalQuestion1)
      question.answer[key] = statement.answerRaw;
    });
    question.correctAnswers = this.state.statements.map((statement, index) => ({
      label: String.fromCharCode(65 + index),
      value: statement.answerRaw,
      rawHtml: `${String.fromCharCode(65 + index)}) ${statement.answerRaw}`,
    }));
    // ✅ Thêm: Lưu answerRaw để giữ ngôn ngữ qua các lần update
    question.answerRaw = this.state.statements.map((s) => s.answerRaw);

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

      // Sử dụng ID gốc để đảm bảo tính nhất quán
      question._id = validId;
      question.id = validId;
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
        await this.props.actionCreateQuestion(question);
      } else {
        // Đảm bảo có ID hợp lệ cho update
        if (!question._id && !question.question_id) {
          alert("Không tìm thấy ID câu hỏi để cập nhật!");
          setLoader(false);
          return;
        }
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
    $("#close_create_2").trigger("click");
  };

  //change select option
  handleChange = (value) => {
    this.setState({
      tags: Object.assign([], value),
    });
  };

  _onChangeSwitch = (e) => {
    var name = e.target.name;
    let checked = e.target.checked;
    this.setState({
      [name]: checked,
    });
  };

  // Handle statement content change
  handleStatementContentChange = (id, content) => {
    this.setState((prevState) => ({
      statements: prevState.statements.map((statement) =>
        statement.id === id ? { ...statement, content } : statement
      ),
    }));
  };

  // Insert symbol into statement content
  insertSymbolToStatement = (id, symbol) => {
    this.setState((prevState) => ({
      statements: prevState.statements.map((statement) =>
        statement.id === id
          ? { ...statement, content: statement.content + symbol }
          : statement
      ),
    }));
  };

  // Handle statement answer change
  handleStatementAnswerChange = (id, answer) => {
    this.setState((prevState) => ({
      statements: prevState.statements.map((statement) =>
        statement.id === id ? { ...statement, answer } : statement
      ),
    }));
  };

  // Add new statement with intelligent language detection
  addStatement = () => {
    this.setState((prevState) => {
      // ✅ Detect if existing statements use English format
      const hasEnglishFormat = prevState.statements.some(
        (s) => s.answerRaw === "True" || s.answerRaw === "False"
      );
      // ✅ Detect if existing statements use short Vietnamese format
      const hasShortVietnameseFormat = prevState.statements.some(
        (s) => s.answerRaw === "Đ" || s.answerRaw === "S"
      );

      let defaultAnswerRaw = "Đúng";
      if (hasEnglishFormat) {
        defaultAnswerRaw = "True";
      } else if (hasShortVietnameseFormat) {
        defaultAnswerRaw = "Đ";
      }

      return {
        statements: [
          ...prevState.statements,
          {
            id: Date.now(),
            content: "",
            answer: true,
            answerRaw: defaultAnswerRaw,
            html: "",
            text: "",
          },
        ],
      };
    });
  };

  // Remove statement
  removeStatement = (id) => {
    this.setState((prevState) => ({
      statements: prevState.statements.filter(
        (statement) => statement.id !== id
      ),
    }));
  };

  onChangeHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
  };

  _handleEditorContentChange = (content) => {
    if (this._isSettingQuestionContent) return;

    const processedContent = this.processLatexInContent(content);

    // Theo ModalQuestion1: giữ rawHtml và content đúng với nội dung đã xử lý LaTeX
    this.setState({
      rawHtml: processedContent,
      content: processedContent,
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

  handleStatementEditorChange = (statementId, content) => {
    if (this._isSettingStatementContent[statementId]) return;

    const processedContent = this.processLatexInContent(content);
    const plainText = this.cleanExplanation(processedContent);
    const cleanedContent = this.cleanHtmlContent(processedContent);

    this.updateOption(statementId, plainText, cleanedContent);

    if (
      processedContent !== content &&
      /(\\\(|\\\[|\$\$|\$)/.test(content)
    ) {
      this._isSettingStatementContent[statementId] = true;
      setTimeout(() => {
        try {
          const editor = this[`optionEditor_${statementId}`];
          if (editor && typeof editor.setContents === "function") {
            editor.setContents(processedContent);
          }
        } finally {
          this._isSettingStatementContent[statementId] = false;
        }
      }, 0);
    }

    if (this.state.showPreviewStatements[statementId]) {
      setTimeout(() => {
        this.renderPreviewStatement(statementId);
      }, 100);
    }
  };

  handleExplanationEditorChange = (content) => {
    if (this._isSettingExplanationContent) return;

    const processedContent = this.processLatexInContent(content);
    const cleanedContent = this.cleanHtmlContent(processedContent);
    this.setState({ explanation: cleanedContent });

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

  decodeHtmlEntities = (html) => {
    const textarea = document.createElement('textarea');
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

  updateOption = (optionId, text, html = null) => {
    this.setState((prevState) => ({
      statements: prevState.statements.map((statement) =>
        statement.id === optionId
          ? {
            ...statement,
            text: text || statement.text,
            html: html !== null ? html : statement.html,
            content: text || statement.text, // ✅ Đồng bộ content với text
          }
          : statement
      ),
    }));
  };

  renderQuestionType = (type) => {
    switch (type) {
      case "truefalsemulti":
        return "Trắc nghiệm Đúng Sai";
      default:
        return "Trắc nghiệm Đúng Sai"; // Default case
    }
  };

  renderPreviewQuestion = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-question-2');
      if (previewContainer) {
        let content = "";
        if (this.questionEditor) {
          content = this.questionEditor.getContents();
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

  renderPreviewStatement = (statementId) => {
    setTimeout(() => {
      const previewContainer = document.getElementById(`preview-statement-${statementId}`);
      if (previewContainer) {
        let content = "";
        const editor = this[`optionEditor_${statementId}`];
        if (editor) {
          content = editor.getContents();
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

  renderPreviewExplanation = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-explanation-2');
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
                      className="btn btn-primary mr-2"
                      style={{ height: "40px", padding: "8px" }}
                      onClick={() =>
                        this.setState({
                          showMathFieldQuestion:
                            !this.state.showMathFieldQuestion,
                        })
                      }
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    {/* Preview toggle */}
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewQuestion ? 'btn-success' : 'btn-outline-primary'} ml-2`}
                      style={{ height: "40px", padding: "8px" }}
                      onClick={() => {
                        this.setState({ showPreviewQuestion: !this.state.showPreviewQuestion }, () => {
                          if (this.state.showPreviewQuestion) {
                            this.renderPreviewQuestion();
                          }
                        });
                      }}
                      title="Xem trước nội dung"
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
                    onChange={this._handleEditorContentChange}
                    setOptions={{
                      buttonList: baseHelpers.getSunEditorOptions2(),
                      katex: katex,
                      showPathLabel: false,
                      attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                      addTagsWhitelist: 'span|svg|path|symbol|use',
                      formats: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                      onClick: (e) => this.handleMathClick(e, "question"),
                    }}
                  />
                  {/* Preview container */}
                  {this.state.showPreviewQuestion && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Nội dung câu hỏi</strong>
                        </div>
                        <div
                          id="preview-question-2"
                          className="card-body"
                          style={{
                            minHeight: "100px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "15px"
                          }}
                        >
                          Nội dung sẽ hiển thị ở đây...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="form-group">
              <label className="title-block">Mệnh đề</label>
              {this.state.statements.map((statement, index) => (
                <div key={statement.id}>
                  <div className="row mb-2 align-items-center">
                    <div className="col-sm-1">
                      <label className="col-form-label">
                        {String.fromCharCode(97 + index)})
                      </label>
                    </div>
                    <div className="col-sm-3">
                      <select
                        className="form-control"
                        value={
                          statement.answerRaw ||
                          (statement.answer ? "Đúng" : "Sai")
                        }
                        onChange={(e) => {
                          const raw = e.target.value;
                          // ✅ Enhanced normalize to support both languages and short forms
                          const boolValue =
                            raw === "Đúng" ||
                            raw === "True" ||
                            raw === "true" ||
                            raw === "TRUE" ||
                            raw === "Đ";
                          // Update both raw and boolean
                          this.setState((prev) => ({
                            statements: prev.statements.map((s) =>
                              s.id === statement.id
                                ? { ...s, answerRaw: raw, answer: boolValue }
                                : s
                            ),
                          }));
                        }}
                      >
                        {/* ✅ Support both Vietnamese and English options, including short forms */}
                        <option value={"Đúng"}>Đúng</option>
                        <option value={"Sai"}>Sai</option>
                        {/* <option value={"Đ"}>Đ</option>
                        <option value={"S"}>S</option> */}
                        <option value={"True"}>True</option>
                        <option value={"False"}>False</option>
                      </select>
                    </div>
                    <div className="col-sm-7">
                      <SunEditor
                        id={`option-editor-${statement.id}`}
                        getSunEditorInstance={(sunEditor) => {
                          if (!this[`optionEditor_${statement.id}`]) {
                            this[`optionEditor_${statement.id}`] = sunEditor;
                          }
                          this.attachMathClickListener(sunEditor, "option", statement.id);
                        }}
                        onImageUploadBefore={this.handleImageUploadBefore}
                        height={"80px"}
                        defaultValue={statement.html || statement.text}
                        onChange={(content) => this.handleStatementEditorChange(statement.id, content)}
                        setOptions={{
                          buttonList: [],
                          katex: katex,
                          showPathLabel: false,
                          attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                          addTagsWhitelist: 'span',
                          onClick: (e) =>
                            this.handleMathClick(e, "option", statement.id),
                        }}
                      />
                    </div>
                    <div className="col-sm-1">
                      <div className="d-flex flex-column">
                        <button
                          type="button"
                          className="btn btn-primary mb-1"
                          style={{ height: "30px", padding: "8px" }}
                          onClick={() =>
                            this.toggleMathFieldForOption(statement.id)
                          }
                          title="Chèn công thức"
                        >
                          ∑
                        </button>
                        {/* Preview toggle */}
                        <button
                          type="button"
                          className={`btn ${this.state.showPreviewStatements[statement.id] ? 'btn-success' : 'btn-outline-primary'} mb-1`}
                          style={{ height: "30px", padding: "0 8px" }}
                          onClick={() => {
                            this.setState({
                              showPreviewStatements: {
                                ...this.state.showPreviewStatements,
                                [statement.id]: !this.state.showPreviewStatements[statement.id]
                              }
                            }, () => {
                              if (this.state.showPreviewStatements[statement.id]) {
                                this.renderPreviewStatement(statement.id);
                              }
                            });
                          }}
                          title="Xem trước mệnh đề"
                        >
                          <i className="fa fa-eye"></i>
                        </button>
                        {this.state.statements.length > 2 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => this.removeStatement(statement.id)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {this.state.showMathFieldOptions[statement.id] && (
                    <div className="mt-1 d-flex align-items-center mb-2 ml-4">
                      <math-field
                        id={`math-field-option-${statement.id}`}
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
                          this.insertFromField("option", statement.id)
                        }
                      >
                        Chèn
                      </button>
                    </div>
                  )}
                  {/* Preview container của mệnh đề */}
                  {this.state.showPreviewStatements[statement.id] && (
                    <div className="mt-2 ml-4">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Mệnh đề {String.fromCharCode(97 + index)}</strong>
                        </div>
                        <div
                          id={`preview-statement-${statement.id}`}
                          className="card-body"
                          style={{
                            minHeight: "100px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "15px"
                          }}
                        >
                          Nội dung sẽ hiển thị ở đây...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="row mt-2">
                <div className="col-sm-12">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={this.addStatement}
                  >
                    + Thêm mệnh đề
                  </button>
                </div>
              </div>
            </div>
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
                      className="btn btn-primary mr-2"
                      style={{ height: "40px", padding: "8px" }}
                      onClick={() =>
                        this.setState({
                          showMathFieldExplanation:
                            !this.state.showMathFieldExplanation,
                        })
                      }
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    {/* Preview toggle */}
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewExplanation ? 'btn-success' : 'btn-outline-primary'} ml-2`}
                      style={{ height: "40px", padding: "8px" }}
                      onClick={() => {
                        this.setState({ showPreviewExplanation: !this.state.showPreviewExplanation }, () => {
                          if (this.state.showPreviewExplanation) {
                            this.renderPreviewExplanation();
                          }
                        });
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
                    onChange={this.handleExplanationEditorChange}
                    setOptions={{
                      buttonList: baseHelpers.getSunEditorOptions2(),
                      katex: katex,
                      showPathLabel: false,
                      attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                      addTagsWhitelist: 'span',
                      onClick: (e) => this.handleMathClick(e, "explanation"),
                    }}
                  />
                  {/* Preview container */}
                  {this.state.showPreviewExplanation && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Giải thích</strong>
                        </div>
                        <div
                          id="preview-explanation-2"
                          className="card-body"
                          style={{
                            minHeight: "100px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "15px"
                          }}
                        >
                          Nội dung sẽ hiển thị ở đây...
                        </div>
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
                    !this.state.content ||
                    this.state.content.trim() === ""
                  ) {
                    alert("Vui lòng nhập nội dung câu hỏi!");
                    return;
                  }

                  // Validation cho statements - tất cả mệnh đề phải có nội dung
                  const hasValidStatement = this.state.statements.every(
                    (statement) =>
                      statement.content &&
                      statement.content.trim() !== "" &&
                      statement.text &&
                      statement.text.trim() !== ""
                  );
                  if (!hasValidStatement) {
                    alert("Vui lòng nhập nội dung cho tất cả các mệnh đề!");
                    return;
                  }

                  // Build same payload as handleSave but mark as temporary
                  const {
                    examId,
                    examSectionId,
                    examSectionGroupId,
                    examSectionSubjectId,
                    currentSubjectId,
                    currentTopicId,
                    questionIdGroupTopic,
                    childExamId,
                  } = this.props;

                  const subject_id =
                    currentSubjectId ||
                    (examSectionSubjectId === "" ? null : examSectionSubjectId);

                  const mapLevelToShort = (lvl) => {
                    const result = lvl || "";
                    return result;
                  };

                  let tempQuestionContent = this.questionEditor
                    ? this.questionEditor.getContents()
                    : this.state.content || this.state.rawHtml || "";
                  tempQuestionContent = this.cleanHtmlContent(tempQuestionContent);

                  let tempExplanationContent = this.solutionEditor
                    ? this.solutionEditor.getContents()
                    : this.state.explanation || "";
                  tempExplanationContent = this.cleanHtmlContent(
                    tempExplanationContent
                  );

                  const tempQuestion = {
                    exam_id: examId,
                    exam_section_id:
                      examSectionId === "" ? null : examSectionId,
                    exam_section_group_id:
                      examSectionGroupId === "" ? null : examSectionGroupId,
                    subject_id,
                    topic_id: currentTopicId,
                    questionTopicGroupId: questionIdGroupTopic,
                    childExamId: childExamId,

                    rawHtml: tempQuestionContent,
                    answer_content: tempQuestionContent,

                    answer: {},
                    correctAnswers: [],

                    choices: this.state.statements.map((statement, index) => ({
                      label: String.fromCharCode(65 + index), // A, B, C, D
                      text: statement.text || "",
                      html: this.cleanHtmlContent(
                        statement.html || statement.text || ""
                      ),
                      rawHtml: this.cleanHtmlContent(
                        statement.html || statement.text || ""
                      ),
                    })),

                    type: this.state.type,
                    level: mapLevelToShort(this.state.level),
                    question_level: mapLevelToShort(this.state.level),
                    explanation: tempExplanationContent,
                    video_link: this.state.video_link || "",
                    question_no: this.state.questionNo,
                    images: this.state.uploadedImages || [],
                    __temp: true,
                  };

                  // Build answer object for temp question
                  this.state.statements.forEach((statement, index) => {
                    const key = String.fromCharCode(65 + index); // A, B, C, D (uppercase like ModalQuestion1)
                    tempQuestion.answer[key] = statement.answerRaw;
                  });
                  tempQuestion.correctAnswers = this.state.statements.map(
                    (statement, index) => ({
                      label: String.fromCharCode(65 + index),
                      value: statement.answerRaw,
                      rawHtml: `${String.fromCharCode(65 + index)}) ${statement.answerRaw}`,
                    })
                  );
                  tempQuestion.answerRaw = this.state.statements.map(
                    (s) => s.answerRaw
                  );

                  // Add unique ID for temp question to align with create path
                  const uniqueId = `manual-temp-${Date.now()}-${Math.random()}`;
                  tempQuestion._id = uniqueId;
                  tempQuestion.question_id = uniqueId;
                  tempQuestion.code = `${this.state.questionNo}`;
                  tempQuestion.created_at = new Date().toISOString();

                  try {
                    this.props.actionCreateQuestion(tempQuestion);
                    // Reset solution editor immediately
                    if (
                      this.solutionEditor &&
                      typeof this.solutionEditor.setContents === "function"
                    ) {
                      try {
                        this.solutionEditor.setContents("");
                      } catch (error) {
                        console.warn(
                          "Failed to reset solution editor after temp save:",
                          error
                        );
                      }
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
              id="close_create_2"
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
  connect(mapStateToProps, mapDispatchToProps)(ModalQuestion2)
);
