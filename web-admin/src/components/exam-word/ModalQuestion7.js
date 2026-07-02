import { Radio } from "antd";
import $ from "jquery";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";
import { uploadImage } from "../../redux/question/action";
import { setLoader } from "../LoadingContext";

import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';
import { MathfieldElement } from 'mathlive';
import 'mathlive/mathlive-static.css';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

import baseHelpers from "../../helpers/BaseHelpers";

class ModalQuestion7 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questionNo: 1,
      type: "cluster",
      question: null,
      selectedAnswers: [],
      options: [
      ],
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "",
      explanation: "",
      selectedFile: null,
      content: "",
      content1: "",
      plainText: "",
      uploadedImages: [],
      actionQuestion: "create",
      currentQuestionvalue: null,
      // Cluster-specific state
      clusterPassage: "",
      startWord: "",
      endWord: "",
      rawHtml: "",  // ✅ THÊM: State để lưu nội dung câu hỏi từ editor
      clusterQuestions: [
        {
          id: 1,
          question: "",
          options: [

          ],
          selectedAnswers: [],
          explanation: "",
          type: ""
        }
      ],
      numClusterQuestions: "",
      editorKey: Date.now(),
      solutionEditorKey: Date.now() + 1,
      passageEditorKey: Date.now() + 2,
      showMathFieldOptions: {}, // Thêm để toggle MathfieldElement (cho tương thích)
      showMathFieldPassage: false,
      showPreviewPassage: false,
      selectedMathElement: null,
    };
    this.editorRef = React.createRef();
    this.solutionEditorRef = React.createRef();
    this.passageEditor = null; // Thêm ref cho passage editor
    this.mathFieldPassageRef = React.createRef(); // Thêm ref cho math-field passage
    this.mutationObserver = null; // Thêm cho auto-render
    this._isSettingPassageContent = false;
    this._isSettingExplanationContent = false;
  }

  // Hàm xử lý các thẻ <span class="math"> thành LaTeX (từ ModalQuestion1)
  processMathSpansToLatex = (content) => {
    if (!content) return content;
    return content.replace(
      /<span class="math"[^>]*data-latex="([^"]*)"[^>]*>(.*?)<\/span>|<span class="math"[^>]*>(.*?)<\/span>/gi,
      (match, latexFromData, _, innerContent) => {
        const latex = latexFromData || innerContent || '';
        return latex ? `\\(${latex}\\)` : match;
      }
    );
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
            const rendered = katex.renderToString(cleanedLatex, { output: "html", throwOnError: false });
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

  // ✅ THÊM: Hàm đếm số lượng câu hỏi con từ API
  getChildQuestionCount = () => {
    if (this.props.currentQuestionvalue && this.props.currentQuestionvalue.childQuestions) {
      return this.props.currentQuestionvalue.childQuestions.length;
    }
    if (this.props.currentQuestionvalue && this.props.currentQuestionvalue.childQuestionCount) {
      return this.props.currentQuestionvalue.childQuestionCount;
    }
    return 1; // Mặc định
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.questionNo !== this.props.questionNo) {
      this.setState({ questionNo: this.props.questionNo });
    }
    if (prevProps.actionQuestion !== this.props.actionQuestion) {
      this.setState({ actionQuestion: this.props.actionQuestion });

      // ✅ CẢI THIỆN: Reset khi chuyển từ update sang create
      if (prevProps.actionQuestion === 'update' && this.props.actionQuestion === 'create') {
        this.clearAllInputs();
      }
    }

    // When an existing question is injected for editing, mirror ModalQuestion6 behavior:
    // set state then call setContent on editors after a short timeout so SunEditor instances are ready.
    if (prevProps.currentQuestionvalue !== this.props.currentQuestionvalue && this.props.currentQuestionvalue) {
      const { answer, answer_content, doc_link, video_link, question_no, level, explanation } = this.props.currentQuestionvalue || {};
      let selectedAnswers = [];

      try {
        const normalizeLetter = (v) => {
          if (!v && v !== 0) return null;
          if (typeof v === 'string') {
            const s = v.trim();
            if (/^[a-d]$/i.test(s)) return s.toUpperCase();
            if (/^[1-4]$/.test(s)) return ['A', 'B', 'C', 'D'][parseInt(s, 10) - 1];
            if (/^[0-3]$/.test(s)) return ['A', 'B', 'C', 'D'][parseInt(s, 10)];
            return s;
          }
          if (typeof v === 'number') {
            if (v >= 1 && v <= 4) return ['A', 'B', 'C', 'D'][v - 1];
            if (v >= 0 && v <= 3) return ['A', 'B', 'C', 'D'][v];
            return String(v);
          }
          if (Array.isArray(v) && v.length > 0) return normalizeLetter(v[0]);
          if (typeof v === 'object') return normalizeLetter(v.value ?? v.label ?? null);
          return null;
        };

        if (typeof answer === "string") {
          // support comma separated like "A, B" or single letter "C"
          const parts = answer.split(",").map(s => s.trim()).filter(Boolean);
          selectedAnswers = parts.map(p => normalizeLetter(p)).filter(Boolean);
        } else if (Array.isArray(answer)) {
          selectedAnswers = answer.map((a) => normalizeLetter(a)).filter(Boolean);
        } else if (answer && typeof answer === 'object') {
          // object like {a: true, b: false} -> pick keys with truthy value
          const keysTruthy = Object.keys(answer).filter((k) => answer[k] === true || answer[k] === 'true' || answer[k] === 1 || answer[k] === '1');
          if (keysTruthy.length > 0) {
            // keys are like 'a','b' -> map to uppercase letters
            selectedAnswers = keysTruthy.map(k => k.toUpperCase());
          } else {
            // maybe object is {value: 'C'} or {label:'C'}
            const v = normalizeLetter(answer.value ?? answer.label ?? null);
            if (v) selectedAnswers = [v];
          }
        }
      } catch (e) {
        selectedAnswers = [];
      }

      // ✅ THÊM: Tính toán numClusterQuestions từ API
      const actualNumClusterQuestions = this.getChildQuestionCount();

      this.setState({
        currentQuestionvalue: this.props.currentQuestionvalue,
        selectedAnswers,
        options: [
        ],
        answer_content: answer_content || null,
        doc_link: doc_link || "",
        video_link: video_link || "",
        level: level || "",
        explanation: explanation || "",
        questionNo: this.props.questionNo || question_no || 1, /* Lines 210-211 omitted */
        content1: answer_content || "",
        plainText: this.props.currentQuestionvalue?.plainText || "",
        rawHtml: this.props.currentQuestionvalue?.rawHtml || this.props.currentQuestionvalue?.clusterPassage || "",  /* Lines 213-214 omitted */
        clusterPassage: this.props.currentQuestionvalue?.clusterPassage || this.props.currentQuestionvalue?.rawHtml || "",
        startWord: this.props.currentQuestionvalue?.startWord || "",
        endWord: this.props.currentQuestionvalue?.endWord || "",
        clusterQuestions: this.props.currentQuestionvalue?.childQuestions ? this.props.currentQuestionvalue.childQuestions.map((child, index) => ({
          id: child._id || child.question_id || Date.now() + Math.random(),
          _id: child._id, // ✅ THÊM: Preserve _id
          question_id: child.question_id, // ✅ THÊM: Preserve question_id
          question: child.plainText || "",
          options: child.choices ? child.choices.map(c => ({ value: c })) : [],
          selectedAnswers: [], /* Lines 221-222 omitted */
          explanation: child.explanation || "",
          type: child.type || ""
        })) : this.state.clusterQuestions,
        numClusterQuestions: actualNumClusterQuestions,  // ✅ SỬA: Sử dụng hàm đếm
        uploadedImages: this.props.currentQuestionvalue.images || [], /* Lines 226-227 omitted */
      });

      this.setState({
        currentQuestionvalue: this.props.currentQuestionvalue,
        selectedAnswers,
        options: [
        ],
        answer_content: answer_content || null,
        doc_link: doc_link || "",
        video_link: video_link || "",
        level: level || "",
        explanation: explanation || "",
        questionNo: this.props.questionNo || question_no || 1, // ✅ Ưu tiên props.questionNo
        content1: answer_content || "",
        plainText: this.props.currentQuestionvalue?.plainText || "",
        rawHtml: this.props.currentQuestionvalue?.rawHtml || this.props.currentQuestionvalue?.clusterPassage || "",  // ✅ THÊM: Load rawHtml khi edit
        clusterPassage: this.props.currentQuestionvalue?.clusterPassage || this.props.currentQuestionvalue?.rawHtml || "",
        startWord: this.props.currentQuestionvalue?.startWord || "",
        endWord: this.props.currentQuestionvalue?.endWord || "",
        clusterQuestions: this.props.currentQuestionvalue?.childQuestions ? this.props.currentQuestionvalue.childQuestions.map((child, index) => ({
          id: child._id || child.question_id || Date.now() + Math.random(),
          _id: child._id, // ✅ THÊM: Preserve _id
          question_id: child.question_id, // ✅ THÊM: Preserve question_id
          question: child.plainText || "",
          options: child.choices ? child.choices.map(c => ({ value: c })) : [],
          selectedAnswers: [], // TODO: parse from child.correctAnswers or child.answer
          explanation: child.explanation || "",
          type: child.type || ""
        })) : this.state.clusterQuestions,
        numClusterQuestions: this.props.currentQuestionvalue?.childQuestions?.length || "",  // ✅ CẬP NHẬT: Set từ API
        uploadedImages: this.props.currentQuestionvalue.images || [], // ✅ THÊM: Load uploadedImages từ question
      });

      // Update solution editor content after a short delay
      setTimeout(() => {
        if (this.solutionEditorRef && this.solutionEditorRef.current && this.solutionEditorRef.current.editor) {
          const content = explanation || '';
          try { this.solutionEditorRef.current.editor.setContent(content); } catch (e) { try { this.solutionEditorRef.current.editor.setContents(content); } catch (err) { /* ignore */ } }
        } else {
        }
      }, 100);

      // Update passage editor content after a short delay
      setTimeout(() => {
        if (this.passageEditor) {
          const content = this.state.clusterPassage || '';
          this.setEditorContentSafely(this.passageEditor, content);
        }
      }, 100);
    }
  };

  setupAutoRender = () => {
    const container = document.querySelector('#modalQuestion7') || document.querySelector('#create7') || document.body;
    if (container) {
      renderMathInElement(container, {
        delimiters: [
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
  };

  renderPreviewPassage = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-question-7');
      if (previewContainer) {
        let content = '';
        if (this.passageEditor && typeof this.passageEditor.getContents === 'function') {
          content = this.passageEditor.getContents();
        }
        previewContainer.innerHTML = content || 'Nội dung sẽ hiển thị ở đây...';
        renderMathInElement(previewContainer, {
          delimiters: [
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
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

  componentDidMount() {
    // ✅ THÊM: Đăng ký MathfieldElement để thẻ <math-field> hoạt động
    if (!customElements.get('math-field')) {
      customElements.define('math-field', MathfieldElement);
    }

    // ✅ CẢI THIỆN: Reset ngay khi component mount nếu là create mode
    if (this.props.actionQuestion === 'create') {
      this.clearAllInputs();
    }

    // Khi component được mount, thêm sự kiện lắng nghe để reset state khi modal hiển thị
    $(document).on('show.bs.modal', '#modalQuestion7, #create7', () => {
      // ✅ THÊM: Luôn set actionQuestion từ props khi modal mở
      console.log('🔧 [Modal Show] Setting actionQuestion from props:', {
        propsAction: this.props.actionQuestion,
        currentStateAction: this.state.actionQuestion,
        timestamp: new Date().toISOString()
      });
      this.setState({ actionQuestion: this.props.actionQuestion });

      if (this.props.actionQuestion === 'create') {
        this.clearAllInputs();
      }

      // If opening modal to edit an existing question, ensure editors show content
      if (this.props.actionQuestion === 'update' && this.props.currentQuestionvalue) {
        const q = this.props.currentQuestionvalue;
        const clusterPassage = q.clusterPassage || q.rawHtml || '';
        const explanation = q.explanation || q.doc_link || '';
        // bump editor keys to force remount (SunEditor sometimes caches internal state)
        const editorKey = Date.now();
        const solutionEditorKey = Date.now() + 1;
        const passageEditorKey = Date.now() + 2;
        this.setState({
          clusterPassage: clusterPassage,
          rawHtml: clusterPassage,  // ✅ THÊM: Set rawHtml khi edit
          explanation: explanation,
          editorKey,
          solutionEditorKey,
          passageEditorKey,
        }, () => {
          // After remount there will be an onLoad that sets content; keep short fallback
          setTimeout(() => {
            try {
              if (this.passageEditor) {
                this.setEditorContentSafely(this.passageEditor, clusterPassage);
              }
            } catch (e) { }
            try {
              if (this.solutionEditorRef && this.solutionEditorRef.current && this.solutionEditorRef.current.editor) {
                try { this.solutionEditorRef.current.editor.setContent(explanation); } catch (e) { try { this.solutionEditorRef.current.editor.setContents(explanation); } catch (err) { /* ignore */ } }
              }
            } catch (e) { }
          }, 120);
        });
      }
    });

    // Thêm sự kiện lắng nghe khi modal đóng
    $(document).on('hide.bs.modal', '#modalQuestion7, #create7', () => {
      this.clearAllInputs();
    });

    const modals = document.querySelectorAll('#modalQuestion7, #create7');
    modals.forEach(modal => {
      modal.addEventListener('shown.bs.modal', () => {
      });
      modal.addEventListener('hidden.bs.modal', () => {
        this.cleanupMutationObserver();
      });
    });
  }

  componentWillUnmount() {
    // Xóa sự kiện lắng nghe khi component bị hủy
    $(document).off('show.bs.modal', '#modalQuestion7, #create7');
    $(document).off('hide.bs.modal', '#modalQuestion7, #create7');
    this.cleanupMutationObserver();
  }

  // Phương thức đặt lại nội dung của Editor
  resetEditorContent = () => {
    this.setState({
      content1: "",
      explanation: "",
      clusterPassage: "",
      startWord: "",
      endWord: "",
      rawHtml: "",
      plainText: "",
      video_link: "",
      selectedMathElement: null,
      showMathFieldPassage: false,
      showPreviewPassage: false,
    });

    if (this.editorRef && this.editorRef.current && this.editorRef.current.editor) {
      this.editorRef.current.editor.setContent('');
    }
    if (this.solutionEditorRef && this.solutionEditorRef.current && this.solutionEditorRef.current.editor) {
      this.solutionEditorRef.current.editor.setContent('');
    }
    if (this.passageEditor) {
      this.passageEditor.setContents('');
    }
    const previewContainer = document.getElementById('preview-question-7');
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }
  }

  // Phương thức làm sạch tất cả input fields
  clearAllInputs = () => {
    this.setState({ currentQuestionvalue: null, selectedMathElement: null }, () => {
      this.resetState();
      this.resetEditorContent();
      const clearInputs = () => {
        const videoInput = document.querySelector('input[name="video_link"]');
        if (videoInput) videoInput.value = '';
        const inputs = document.querySelectorAll('#modalQuestion7 input[type="text"], #create7 input[type="text"], #modalQuestion7 input[type="number"], #create7 input[type="number"]');
        inputs.forEach(input => {
          if (input.name !== 'video_link') { // Keep video_link as it's handled by state
            input.value = '';
          }
        });

        // Clear select elements
        const selects = document.querySelectorAll('#modalQuestion7 select, #create7 select');
        selects.forEach(select => {
          select.selectedIndex = 0;
        });

        // Clear radio buttons
        const radios = document.querySelectorAll('#modalQuestion7 input[type="radio"], #create7 input[type="radio"]');
        radios.forEach(radio => {
          radio.checked = false;
        });

        // Clear option inputs specifically
        const optionInputs = document.querySelectorAll('#modalQuestion7 .option-input input, #create7 .option-input input');
        optionInputs.forEach(input => {
          input.value = '';
        });

        // Clear all textareas
        const textareas = document.querySelectorAll('#modalQuestion7 textarea, #create7 textarea');
        textareas.forEach(textarea => {
          textarea.value = '';
        });

        // Force clear any remaining inputs
        const allInputs = document.querySelectorAll('#modalQuestion7 input, #create7 input');
        allInputs.forEach(input => {
          if (input.type === 'text' || input.type === 'password' || input.type === 'email' || input.type === 'number' || input.type === 'url') {
            input.value = '';
          } else if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
          }
        });
      };

      // Clear immediately
      clearInputs();

      // Clear again after a short delay
      setTimeout(clearInputs, 100);

      // Clear again after a longer delay
      setTimeout(clearInputs, 300);
    });
  };

  // Phương thức đặt lại state về giá trị mặc định
  resetState = () => {
    this.setState({
      questionNo: this.props.questionNo || 1,
      type: "cluster",
      question: null,
      selectedAnswers: [],
      options: [
        { id: 'A', value: '' },
        { id: 'B', value: '' },
        { id: 'C', value: '' },
        { id: 'D', value: '' }
      ],
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "",
      explanation: "",
      selectedFile: null,
      content: "",
      content1: "",
      uploadedImages: [],
      // actionQuestion: "create", // ❌ LOẠI BỎ: Để tránh ghi đè state
      currentQuestionvalue: null,
      clusterPassage: "",
      rawHtml: "",
      startWord: "",
      endWord: "",
      clusterQuestions: [
        {
          id: 1,
          question: "",
          options: [
            { id: 'A', value: '' },
            { id: 'B', value: '' },
            { id: 'C', value: '' },
            { id: 'D', value: '' }
          ],
          selectedAnswers: [],
          explanation: "",
          type: ""
        }
      ],
      numClusterQuestions: "",
      showMathFieldPassage: false,
      showPreviewPassage: false,
    });
  }

  _onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'numClusterQuestions') {
      // ✅ THÊM: Kiểm tra nếu disableChildCount thì không cho thay đổi
      if (this.props.currentQuestionvalue?.disableChildCount) {
        return; // Không cho phép thay đổi
      }
      const num = parseInt(value, 10) || "";
      this.handleNumClusterQuestionsChange(num);
    } else {
      this.setState({
        [name]: value,
      });
    }
  };

  // Handle change in number of cluster questions
  handleNumClusterQuestionsChange = (num) => {
    // ✅ CẬP NHẬT: Kiểm tra actionQuestion thay vì disableChildCount
    if (this.props.actionQuestion === 'update') {
      return; // Không cho phép thay đổi khi edit
    }

    const currentNum = this.state.clusterQuestions.length;
    let newQuestions = [...this.state.clusterQuestions];

    if (num > currentNum) {
      // Add new questions
      for (let i = currentNum; i < num; i++) {
        newQuestions.push({
          id: i + 1,
          question: "",
          options: [
            { id: 'A', value: '' },
            { id: 'B', value: '' },
            { id: 'C', value: '' },
            { id: 'D', value: '' }
          ],
          selectedAnswers: [],
          explanation: ""
        });
      }
    } else if (num < currentNum) {
      // Remove excess questions
      newQuestions = newQuestions.slice(0, num);
    }

    this.setState({
      numClusterQuestions: num,
      clusterQuestions: newQuestions
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
    const newOptions = [...this.state.options, { id: nextLetter, value: '' }];
    this.setState({ options: newOptions });
  };

  // Remove option
  removeOption = (index) => {
    if (this.state.options.length <= 2) return; // Keep at least 2 options

    const newOptions = this.state.options.filter((_, i) => i !== index);
    // Update IDs after removal
    const updatedOptions = newOptions.map((option, i) => ({
      ...option,
      id: String.fromCharCode(65 + i)
    }));

    // Update selectedAnswers to remove references to deleted options
    const removedOptionId = this.state.options[index].id;
    const newSelectedAnswers = this.state.selectedAnswers.filter(answer => answer !== removedOptionId);

    this.setState({
      options: updatedOptions,
      selectedAnswers: newSelectedAnswers
    });
  };

  // Handle cluster question changes
  handleClusterQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...this.state.clusterQuestions];
    newQuestions[questionIndex][field] = value;
    this.setState({ clusterQuestions: newQuestions });
  };

  // Handle cluster question option change
  handleClusterQuestionOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...this.state.clusterQuestions];
    newQuestions[questionIndex].options[optionIndex].value = value;
    this.setState({ clusterQuestions: newQuestions });
  };

  // Add new cluster question
  addClusterQuestion = () => {
    const newQuestion = {
      id: this.state.clusterQuestions.length + 1,
      question: "",
      options: [
        { id: 'A', value: '' },
        { id: 'B', value: '' },
        { id: 'C', value: '' },
        { id: 'D', value: '' }
      ],
      selectedAnswers: [],
      explanation: "",
      type: ""
    };
    this.setState({
      clusterQuestions: [...this.state.clusterQuestions, newQuestion]
    });
  };

  // Remove cluster question
  removeClusterQuestion = (index) => {
    if (this.state.clusterQuestions.length <= 1) return; // Keep at least 1 question
    const newQuestions = this.state.clusterQuestions.filter((_, i) => i !== index);
    this.setState({ clusterQuestions: newQuestions });
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

  // ✅ THÊM: Method xử lý thay đổi nội dung từ editor cluster passage
  _handleClusterPassageChange = (content) => {
    if (this._isSettingPassageContent) return;

    const processedContent = this.processLatexInContent(content);

    this.setState({
      clusterPassage: processedContent,
      rawHtml: processedContent,
      plainText: processedContent.replace(/<[^>]*>/g, '').trim()
    });

    if (
      processedContent !== content &&
      /(\\\(|\\\[|\$\$|\$)/.test(content)
    ) {
      this._isSettingPassageContent = true;
      setTimeout(() => {
        try {
          if (this.passageEditor && typeof this.passageEditor.setContents === "function") {
            this.passageEditor.setContents(processedContent);
          }
        } finally {
          this._isSettingPassageContent = false;
        }
      }, 0);
    }

    if (this.state.showPreviewPassage) {
      setTimeout(() => {
        this.renderPreviewPassage();
      }, 100);
    }
  };

  // Hàm làm sạch nội dung giải thích, loại bỏ các thẻ HTML rỗng
  cleanExplanation = (explanation) => {
    if (!explanation) return null;
    // Loại bỏ tất cả thẻ HTML và kiểm tra nội dung còn lại
    const plainText = explanation.replace(/<[^>]*>/g, '').trim();
    // Nếu chỉ còn nội dung rỗng sau khi loại bỏ HTML, trả về null
    return plainText ? explanation : null;
  }

  // Hàm kiểm tra nội dung có ý nghĩa (không chỉ HTML tags)
  hasValidContent = (content) => {
    if (!content || content.trim() === '') return false;
    // Loại bỏ tất cả HTML tags và kiểm tra nội dung text
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 0;
  };

  handleSave = async (e) => {
    setLoader(true);
    e.preventDefault();
    const passageEditorContent = this.passageEditor && typeof this.passageEditor.getContents === 'function'
      ? this.passageEditor.getContents()
      : null;
    const passageHtml = passageEditorContent != null ? passageEditorContent : this.state.clusterPassage;
    const finalPassageHtml = this.state.rawHtml || passageHtml || "";  // ✅ Ưu tiên rawHtml từ state
    const passagePlainText = passageHtml ? passageHtml.replace(/<[^>]*>/g, '').trim() : '';

    // Validation - kiểm tra lời dẫn câu hỏi chùm có nội dung ý nghĩa
    if (!this.hasValidContent(passageHtml)) {
      alert('Vui lòng nhập lời dẫn câu hỏi chùm!');
      setLoader(false);
      return;
    }
    const finalPlainText = passagePlainText || this.state.plainText;
    const { examId, examSectionId, examSectionGroupId, examSectionSubjectId, currentSubjectId, currentTopicId, questionIdGroupTopic, childExamId } = this.props;  // ✅ THÊM: Destructuring childExamId từ props

    // ✅ THÊM: Validation cho subject_id
    const subject_id = currentSubjectId || (examSectionSubjectId === "" ? null : examSectionSubjectId);

    // Map level back to short form for API
    const mapLevelToShort = (lvl) => {
      const result = lvl || "";
      return result;
    };

    // Chuẩn bị childQuestions data rỗng (không có type mặc định)
    const childQuestions = [];
    if (this.state.clusterQuestions && this.state.clusterQuestions.length > 0) {
      for (let i = 0; i < this.state.clusterQuestions.length; i++) {
        const childQuestion = this.state.clusterQuestions[i];
        const childData = {
          plainText: childQuestion.question || "",
          answer: "",  // Không set mặc định
          correctAnswers: [],  // Không set mặc định
          choices: childQuestion.options ? childQuestion.options.map(option => option.value || "") : [],
          type: "",  // Để trống, người dùng sẽ chọn sau
          level: mapLevelToShort(this.state.level),
          question_level: mapLevelToShort(this.state.level),
          explanation: childQuestion.explanation || "",
          // ✅ SỬA: câu con bắt đầu từ questionNo (KHÔNG cộng 1)
          question_no: this.state.questionNo + i,
          _id: childQuestion._id || childQuestion.question_id, // ✅ THÊM: Preserve _id
          question_id: childQuestion.question_id || childQuestion._id || (typeof childQuestion.id === 'string' ? childQuestion.id : `manual-child-${Date.now()}-${i}`), // ✅ SỬA: Ưu tiên _id và question_id từ state
          // ✅ SỬA: code đồng bộ với question_no
          code: `${this.state.questionNo + i}`,
          images: [],
          created_at: new Date().toISOString(),
          __temp: false,
          isChild: true,  // Flag để phân biệt là câu hỏi con
          parentId: null  // Sẽ set sau khi tạo cluster
        };
        childQuestions.push(childData);
      }
    }

    // Tạo cluster question với childQuestions data
    const clusterQuestion = {
      exam_id: examId,
      exam_section_id: examSectionId === "" ? null : examSectionId,
      exam_section_group_id: examSectionGroupId === "" ? null : examSectionGroupId,
      subject_id: subject_id,
      topic_id: currentTopicId,
      questionTopicGroupId: questionIdGroupTopic,
      childExamId: childExamId,  // ✅ THÊM: Thêm childExamId để phân biệt bảng chính vs. con
      plainText: finalPlainText,
      rawHtml: finalPassageHtml,  // ✅ Sử dụng finalPassageHtml
      answer: "",
      correctAnswers: [],
      choices: [],
      type: this.state.type,
      level: mapLevelToShort(this.state.level),
      question_level: mapLevelToShort(this.state.level),
      explanation: "",
      doc_link: this.state.doc_link,
      video_link: this.state.video_link,
      question_no: this.state.questionNo,
      clusterPassage: finalPassageHtml,
      startWord: this.state.startWord,
      endWord: this.state.endWord,
      question_id: `manual-cluster-${Date.now()}-${Math.random()}`,
      code: `${this.state.questionNo}`,
      images: this.state.uploadedImages || [],
      created_at: new Date().toISOString(),
      __temp: false,
      childQuestions: childQuestions
    };

    try {
      if (this.state.actionQuestion === "create") {
        await this.props.actionCreateQuestion(clusterQuestion);
      } else {
        // ✅ SỬA: Bao gồm tất cả field cần thiết để server nhận diện đúng câu hỏi cluster
        const updateData = {
          _id: this.state.currentQuestionvalue._id,
          question_id: this.state.currentQuestionvalue.question_id || this.state.currentQuestionvalue._id,
          type: this.state.type || "CLUSTER", // ✅ QUAN TRỌNG: Đảm bảo type được set
          plainText: finalPlainText,
          rawHtml: finalPassageHtml,
          clusterPassage: finalPassageHtml, // ✅ THÊM: Đảm bảo clusterPassage được update
          level: mapLevelToShort(this.state.level),
          question_level: mapLevelToShort(this.state.level),
          parentId: null, // ✅ THÊM: Đảm bảo cluster question không có parentId
          // ✅ THÊM: Các field quan trọng khác
          exam_id: examId,
          exam_section_id: examSectionId === "" ? null : examSectionId,
          exam_section_group_id: examSectionGroupId === "" ? null : examSectionGroupId,
          subject_id: subject_id,
          topic_id: currentTopicId,
          questionTopicGroupId: questionIdGroupTopic,
          childExamId: childExamId,
          question_no: this.state.questionNo,
          code: `${this.state.questionNo}`,
          doc_link: this.state.doc_link,
          video_link: this.state.video_link,
          images: this.state.uploadedImages || [],
          // ✅ THÊM: Đảm bảo childQuestions được update nếu có
          childQuestions: childQuestions.length > 0 ? childQuestions : undefined
        };
        await this.props.actionUpdateQuestion(updateData);
      }
    } catch (error) {
      console.error('Error saving cluster question:', error);
    } finally {
      this.closeModal();
      setLoader(false);
    }
  };

  closeModal = () => {
    if (this.props.onCloseModal) {
      this.props.onCloseModal();
    } else {
      $('#close_create').trigger('click');
    }
    setTimeout(() => {
      this.clearAllInputs();
    }, 300);
  };

  _handleEditorContent1Change = (content) => {
    // Extract plain text from HTML content
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    this.setState({
      content1: content,
      plainText: plainText
    });
  };

  _handleSolutionEditorChange = (content) => {
    this.setState({ explanation: content });
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
    }
  };
  toggleMathFieldForOption = (optionId) => {
    this.setState(prevState => ({
      showMathFieldOptions: {
        ...prevState.showMathFieldOptions,
        [optionId]: !prevState.showMathFieldOptions[optionId]
      }
    }));
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
        } else if (target === "passage") {
          this.setState({ showMathFieldPassage: true });
          setTimeout(() => {
            const mathField = document.getElementById("math-field-passage");
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

      }
    }
  };

  renderQuestionType = (type) => {
    if (!type) return "";
    const t = String(type).toUpperCase();
    switch (t) {
      case "cluster":
        return "Câu hỏi chùm";
      default:
        return type; // Default case returns the type if not matched
    }
  };

  // Thêm câu hỏi con mới
  addClusterQuestion = () => {
    const newId = Math.max(...this.state.clusterQuestions.map(q => q.id || 0), 0) + 1;
    const newQuestion = {
      id: newId,
      question: "",
      options: [
        { id: 'A', value: '' },
        { id: 'B', value: '' },
        { id: 'C', value: '' },
        { id: 'D', value: '' }
      ],
      answer: "A",
      explanation: ""
    };

    this.setState({
      clusterQuestions: [...this.state.clusterQuestions, newQuestion]
    });
  };

  // Xóa câu hỏi con
  removeClusterQuestion = (questionId) => {
    this.setState({
      clusterQuestions: this.state.clusterQuestions.filter(q => (q.id || q) !== questionId)
    });
  };

  render() {
    return (
      <div className="block-content">
        <div className="row">
          <div className="col-sm-12">
            <div className="form-group">
              <div className="alert alert-info" style={{ padding: '8px 12px', marginBottom: '15px' }}>
                <strong>Câu hỏi chùm</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Form cho lời dẫn câu hỏi chùm */}
        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">Lời dẫn câu hỏi chùm</label>
              <div className="card border-primary">
                <div className="card-body">
                  <div className="mb-2 d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-primary mr-2"
                      style={{ height: '40px', padding: '8px' }}
                      onClick={() => this.setState({ showMathFieldPassage: !this.state.showMathFieldPassage })}
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    <button
                      type="button"
                      className={this.state.showPreviewPassage ? "btn btn-success mr-2" : "btn btn-outline-primary mr-2"}
                      style={{ height: '40px', padding: '8px' }}
                      onClick={() => {
                        this.setState(
                          { showPreviewPassage: !this.state.showPreviewPassage },
                          () => {
                            if (this.state.showPreviewPassage) {
                              setTimeout(() => this.renderPreviewPassage(), 100);
                            }
                          }
                        );
                      }}
                      title="Xem trước lời dẫn"
                    >
                      <i className="fa fa-eye"></i> Preview
                    </button>
                  </div>
                  {this.state.showMathFieldPassage && (
                    <div className="mb-2 d-flex align-items-center">
                      <math-field
                        ref={this.mathFieldPassageRef}
                        id="math-field-passage"
                        virtual-keyboard-mode="onfocus"
                        virtual-keyboard-theme="apple"
                        style={{ width: '100%', minHeight: '40px', border: '1px solid #ccc', borderRadius: '4px', pointerEvents: 'auto', flexGrow: 1 }}
                      ></math-field>
                      <button
                        className="btn btn-primary ml-2"
                        style={{ height: '40px', padding: '0 12px' }}
                        onClick={() => this.insertFromField('passage')}
                      >
                        Chèn
                      </button>
                    </div>
                  )}
                  <SunEditor
                    key={this.state.passageEditorKey}
                    getSunEditorInstance={(sunEditor) => {
                      this.passageEditor = sunEditor;
                      this.attachMathClickListener(sunEditor, "passage");
                    }}
                    onImageUploadBefore={this.handleImageUploadBefore}
                    height={'300px'}
                    setContents={this.state.clusterPassage}
                    onChange={this._handleClusterPassageChange}
                    onLoad={() => {
                      try {
                        if (this.state.clusterPassage && this.passageEditor) {
                          this.passageEditor.setContents(this.state.clusterPassage);
                        }
                      } catch (e) {
                        console.error('Error loading cluster passage:', e);
                      }
                    }}
                    setOptions={{
                      buttonList: baseHelpers.getSunEditorOptions2(),
                      katex: katex,
                      showPathLabel: false,
                      onMouseDown: (e) => this.handleMathClick(e, 'passage'),
                      attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                      addTagsWhitelist: 'span|svg|path|symbol|use',
                    }}
                  />
                  {this.state.showPreviewPassage && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Nội dung câu hỏi</strong>
                        </div>
                        <div
                          id="preview-question-7"
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

        {/* Độ khó */}
        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">Độ khó</label>
              <div className="card border-primary">
                <div className="card-body">
                  <Radio.Group
                    onChange={this._onChange}
                    name="level"
                    value={this.state.level}>
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

        {/* Số câu hỏi con */}
        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">Số câu hỏi con</label>
              <div className="card border-primary">
                <div className="card-body">
                  <input
                    type="number"
                    className="form-control"
                    name="numClusterQuestions"
                    value={this.state.numClusterQuestions}
                    onChange={this._onChange}
                    min="1"
                    max="10"
                    disabled={this.props.actionQuestion === 'update'}  // ✅ CẬP NHẬT: Disable khi edit
                  />
                  {this.props.actionQuestion === 'update' ? (  // ✅ CẬP NHẬT: Hiển thị alert khi edit
                    <div className="alert alert-info mt-2 mb-0" style={{ padding: '8px 12px', fontSize: '13px' }}>
                      <i className="fa fa-info-circle mr-1"></i>
                      <strong>Thông tin:</strong> Số lượng câu hỏi con được lấy từ dữ liệu hiện có và không thể thay đổi.
                    </div>
                  ) : (
                    <div className="alert alert-warning mt-2 mb-0" style={{ padding: '8px 12px', fontSize: '13px' }}>
                      <i className="fa fa-exclamation-triangle mr-1"></i>
                      <strong>Lưu ý:</strong> Không thể thay đổi số lượng câu hỏi con sau khi đã tạo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Nút actions */}
        <div className="form-group row">
          <div className="col-sm-12 text-right">
            <button
              type="button"
              className="btn btn-success mt-2"
              onClick={this.handleSave}
            >
              {this.state.actionQuestion === 'create' ? 'Tạo câu hỏi chùm' : 'Cập nhật câu hỏi chùm'}
            </button>
            <button
              id='close_create'
              className="btn btn-light mt-2 ml-2"
              data-dismiss="modal"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    image: state.question.image
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ uploadImage }, dispatch);
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalQuestion7)
);