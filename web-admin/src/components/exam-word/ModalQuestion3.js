import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  uploadImage,
} from "../../redux/question/action";
import $ from "jquery";
import { setLoader } from "../LoadingContext";
import { notification, Radio } from "antd";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import baseHelpers from "../../helpers/BaseHelpers";
import 'mathlive/mathlive-static.css';
import { MathfieldElement } from 'mathlive';

class ModalQuestion3 extends Component {
  constructor(props) {
    super();
    this.state = {
      questionNo: 1,
      type: 'fillinblank',
      question: null,
      answer: null,
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
      actionQuestion: 'create',
      currentQuestionvalue: null,
      blankCount: 1,
      correctAnswers: [{ id: 1, answer: "", html: '', text: '' }], // Thêm html và text

      // Mathfield toggles
      showMathFieldOptions: {}, // Thêm để toggle MathfieldElement cho correctAnswers
      showMathFieldQuestion: false, // Thêm để toggle MathfieldElement cho question
      showMathFieldExplanation: false, // Thêm để toggle MathfieldElement cho explanation

      selectedMathElement: null,

      // Preview toggles
      showPreviewQuestion: false, // Toggle preview cho nội dung câu hỏi
      showPreviewExplanation: false,
      showPreviewOptions: {}, // per-answer preview toggle by id
    };
    this.editorRef = React.createRef();
    this.solutionEditorRef = React.createRef();
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
        const regex = new RegExp(
          start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
          '([\\s\\S]*?)' +
          end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'g'
        );
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
            const escapedLatex = String(cleanedLatex).replace(/"/g, "&quot;");
            const renderedWithAttr = rendered.replace(
              '<span class="katex"',
              `<span class="katex" data-latex="${escapedLatex}"`,
            );
            return `<span class="math-symbol" data-latex="${escapedLatex}">${renderedWithAttr}</span>`;
          } catch (error) {
            console.error("LaTeX render error:", error, "LaTeX:", latex);
            return match;
          }
        });
      } catch (error) {
        // Skip if regex fails
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
      if (prevProps.actionQuestion === 'update' && this.props.actionQuestion === 'create') {
        this.clearAllInputs();
      }
    }

    // Run when a new currentQuestionvalue arrives or when the loaded question id differs from state
    if (this.props.currentQuestionvalue && (prevProps.currentQuestionvalue !== this.props.currentQuestionvalue || !this.state.currentQuestionvalue || this.state.currentQuestionvalue._id !== this.props.currentQuestionvalue._id)) {
      const src = this.props.currentQuestionvalue || {};
      const { answer_content, doc_link, video_link, question_no, type, level, question_level, explanation } = src;

      // Đơn giản hóa mapLevel - chỉ pass-through với fallback
      const mapLevel = (lvl) => {
        if (!lvl) return "";
        return lvl; // Giữ nguyên giá trị, loại bỏ switch phức tạp
      };

      const mappedLevel = mapLevel(level || question_level);

      // Đơn giản hóa xử lý answer - loại bỏ logic phức tạp
      const rawAnswer = src.answer ?? src.answers ?? src.correctAnswers ?? src.correct ?? src.answer_content ?? null;

      const extractAnswerText = (v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === 'object') {
          return v.text ?? v.value ?? v.label ?? String(v);
        }
        return String(v);
      };

      let answerArray = [];

      // Đơn giản hóa logic xử lý answer
      if (Array.isArray(rawAnswer)) {
        answerArray = rawAnswer;
      } else if (rawAnswer && typeof rawAnswer === 'object') {
        // Chỉ xử lý case đơn giản nhất
        answerArray = [rawAnswer];
      } else if (typeof rawAnswer === 'string' && rawAnswer) {
        // Chỉ split theo dấu | để tránh phức tạp
        answerArray = rawAnswer.includes('|') ? rawAnswer.split('|').map(s => s.trim()).filter(Boolean) : [rawAnswer];
      } else {
        answerArray = [];
      }

      let blankCount = Math.max(1, answerArray.length || 1);
      const correctAnswers = (answerArray.length ? answerArray : [""]).map((ans, index) => {
        const answerText = extractAnswerText(ans);
        const processedAnswer = this.processLatexInContent(answerText);
        return {
          id: index + 1,
          answer: answerText,
          html: this.cleanHtmlContent(this.prepareContentForEditor(processedAnswer)),
          text: this.cleanExplanation(processedAnswer)
        };
      });

      // ✅ SỬA: Xử lý question content
      let questionContent = answer_content || src?.rawHtml || '';
      questionContent = this.removeLiTags(this.processLatexInContent(questionContent));
      const preparedContent = this.prepareContentForEditor(questionContent);

      // ✅ SỬA: Xử lý explanation từ API với hàm processExplanationFromAPI
      let explanationContent = explanation || doc_link || "";
      if (explanationContent) {
        // Xử lý explanation từ API trước
        explanationContent = this.processExplanationFromAPI(explanationContent);
        // Sau đó xử lý math spans
        explanationContent = this.removeLiTags(this.processLatexInContent(explanationContent));
      }
      const cleanedExplanation = this.cleanHtmlContent(explanationContent);

      this.setState({
        currentQuestionvalue: src,
        answer_content: answer_content || null,
        doc_link: doc_link || "",
        video_link: video_link || "",
        level: mappedLevel || "",
        explanation: cleanedExplanation,
        questionNo: this.props.questionNo || question_no || 1,
        type: type || 'fillinblank',
        content1: preparedContent,
        rawHtml: questionContent,
        blankCount,
        correctAnswers,
        uploadedImages: src.images || [],
      });

      // ✅ SỬA: Update editors với delay và render math
      setTimeout(() => {
        // Set content cho editors
        this.setEditorContentSafely(this.questionEditor, preparedContent);
        this.setEditorContentSafely(this.solutionEditor, cleanedExplanation);

        // Set content cho option editors
        this.state.correctAnswers.forEach((answer) => {
          const optionEditor = this[`optionEditor_${answer.id}`];
          if (optionEditor) {
            this.setEditorContentSafely(optionEditor, answer.html || '');
          }
        });
      }, 500);
    }
  };

  setupAutoRender = () => {
    const container = document.querySelector('#modalQuestion3') || document.querySelector('#create3') || document.body;
    if (container) {
      renderMathInElement(container, {
        delimiters: [
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
        // ✅ THÊM: Các option để render tốt hơn
        strict: false,
        trust: true,
        fleqn: false, // Không căn trái
        displayMode: false // Auto detect display mode
      });
    }
  };

  processExplanationFromAPI = (explanation) => {
    if (!explanation) return '';

    let processedExplanation = explanation
      .replace(/\\n\s*/g, ' ')
      .replace(/\n\s*/g, ' ')
      .replace(/\\\\/g, '\\')
      .replace(/\\\\\(/g, '\\(')
      .replace(/\\\\\)/g, '\\)')
      .replace(/\\\\\[/g, '\\[')
      .replace(/\\\\\]/g, '\\]')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/\\\(\s+/g, '\\(')
      .replace(/\s+\\\)/g, '\\)')
      .replace(/\\\[\s+/g, '\\[')
      .replace(/\s+\\\]/g, '\\]')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return processedExplanation;
  };

  setupMutationObserver = () => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }


    const observeTarget = document.querySelector('#modalQuestion3') || document.querySelector('#create3');
    if (observeTarget) {
      this.mutationObserver.observe(observeTarget, {
        childList: true,
        subtree: true,
        characterData: true
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
    if (!customElements.get('math-field')) {
      customElements.define('math-field', MathfieldElement);
    }

    // ✅ CẢI THIỆN: Reset ngay khi component mount nếu là create mode
    if (this.props.actionQuestion === 'create') {
      this.clearAllInputs();
    }

    // Khi component được mount, thêm sự kiện lắng nghe để reset state khi modal hiển thị
    $(document).on('show.bs.modal', '#modalQuestion3, #create3', () => {

      if (this.props.actionQuestion === 'create') {
        this.clearAllInputs();
      }
    });

    // Thêm sự kiện lắng nghe khi modal đóng
    $(document).on('hide.bs.modal', '#modalQuestion3, #create3', () => {
      this.clearAllInputs();
    });

    // Thêm setup cho auto-render và MutationObserver
    const modals = document.querySelectorAll('#modalQuestion3, #create3');
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
    $(document).off('show.bs.modal', '#modalQuestion3, #create3');
    this.cleanupMutationObserver();
  }

  // Phương thức đặt lại nội dung của Editor
  resetEditorContent = () => {
    this.setState({ content1: "", explanation: "", rawHtml: "", selectedMathElement: null, showPreviewQuestion: false });

    // ✅ THÊM: Force reset editors
    if (this.editorRef && this.editorRef.current && this.editorRef.current.editor) {
      this.editorRef.current.editor.setContent('');
    }
    if (this.solutionEditorRef && this.solutionEditorRef.current && this.solutionEditorRef.current.editor) {
      this.solutionEditorRef.current.editor.setContent('');
    }
    if (this.questionEditor) {
      this.questionEditor.setContents('');
    }
    if (this.solutionEditor) {
      this.solutionEditor.setContents('');
    }
  }

  // Phương thức đặt lại state về giá trị mặc định
  resetState = () => {
    this.setState({
      questionNo: this.props.questionNo || 1,
      type: 'fillinblank', // Preserve existing type or default to ESSAY
      question: null,
      answer: null,
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
      currentQuestionvalue: null,
      blankCount: 1,
      correctAnswers: [{ id: 1, answer: "", html: '', text: '' }], // Default với html và text
      selectedMathElement: null,
      showPreviewQuestion: false,
    });
  }

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
        if (videoInput) videoInput.value = '';

        // Clear blank count input
        const blankCountInput = document.querySelector('input[type="number"]');
        if (blankCountInput) blankCountInput.value = '1';

        // Clear any other input fields if needed
        const inputs = document.querySelectorAll('#modalQuestion3 input[type="text"], #create3 input[type="text"]');
        inputs.forEach(input => {
          if (input.name !== 'video_link') { // Keep video_link as it's handled by state
            input.value = '';
          }
        });

        // Clear select elements
        const selects = document.querySelectorAll('#modalQuestion3 select, #create3 select');
        selects.forEach(select => {
          select.selectedIndex = 0;
        });

        // Clear radio buttons
        const radios = document.querySelectorAll('#modalQuestion3 input[type="radio"], #create3 input[type="radio"]');
        radios.forEach(radio => {
          radio.checked = false;
        });
      }, 100);

      // ✅ THÊM: Reset nội dung cho tất cả correctAnswers editors sau khi state đã được cập nhật
      setTimeout(() => {
        if (this.questionEditor) {
          this.questionEditor.setContents("");
        }
        if (this.solutionEditor) {
          this.solutionEditor.setContents("");
        }
        // Reset nội dung cho các correctAnswers editors
        this.state.correctAnswers.forEach((answer) => {
          const answerEditor = this[`optionEditor_${answer.id}`];
          if (answerEditor && typeof answerEditor.setContents === 'function') {
            answerEditor.setContents("");
          }
        });
      }, 200);  // Đảm bảo chạy sau setTimeout 100ms
    });
  }

  // Handle blank count change
  handleBlankCountChange = (count) => {
    const newCount = parseInt(count) || 1;
    this.setState(prevState => {
      const currentAnswers = prevState.correctAnswers;
      let newAnswers = [...currentAnswers];

      if (newCount > currentAnswers.length) {
        // Add new answers
        for (let i = currentAnswers.length; i < newCount; i++) {
          newAnswers.push({ id: i + 1, answer: "", html: '', text: '' });
        }
      } else if (newCount < currentAnswers.length) {
        // Remove excess answers
        newAnswers = newAnswers.slice(0, newCount);
      }

      return {
        blankCount: newCount,
        correctAnswers: newAnswers
      };
    });
  };

  // Handle correct answer change
  handleCorrectAnswerChange = (id, answer) => {
    this.setState(prevState => ({
      correctAnswers: prevState.correctAnswers.map(ans =>
        ans.id === id ? { ...ans, answer } : ans
      )
    }));
  };

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  // Hàm làm sạch nội dung giải thích, loại bỏ các thẻ HTML rỗng
  cleanHtmlContent = (content) => {
    if (!content) return '';

    // ✅ THÊM: Bảo vệ các công thức LaTeX trước khi clean HTML
    const latexPlaceholders = [];
    let cleanedContent = content;

    // ✅ FIX: Tạm thời thay thế các công thức LaTeX display bằng placeholder
    cleanedContent = cleanedContent.replace(/\\\[([\s\S]*?)\\\]/g, (match, latex) => {
      const placeholder = `__LATEX_DISPLAY_${latexPlaceholders.length}__`;
      // Clean up latex content - remove extra newlines and spaces
      const cleanLatex = latex.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
      latexPlaceholders.push(`\\[${cleanLatex}\\]`);
      return placeholder;
    });

    // ✅ FIX: Tạm thời thay thế các công thức LaTeX inline bằng placeholder
    cleanedContent = cleanedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
      const placeholder = `__LATEX_INLINE_${latexPlaceholders.length}__`;
      // Clean up latex content - remove extra newlines and spaces
      const cleanLatex = latex.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
      latexPlaceholders.push(`\\(${cleanLatex}\\)`);
      return placeholder;
    });

    // Clean HTML như bình thường
    cleanedContent = cleanedContent
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '')
      .replace(/<li[^>]*>/gi, '')
      .replace(/<\/li>/gi, '')
      .replace(/<ol[^>]*>/gi, '')
      .replace(/<\/ol>/gi, '')
      .replace(/<p><\/p>/gi, '')
      .replace(/^\s*<p>\s*<\/p>\s*/gi, '')
      .replace(/(<p>\s*<br\s*\/?>\s*<\/p>)/gi, '')

      // ✅ THÊM: Xử lý newlines trong HTML
      .replace(/\n\s*<p>/g, '<p>')
      .replace(/<\/p>\s*\n/g, '</p>')
      .replace(/\n\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // ✅ THÊM: Khôi phục lại các công thức LaTeX
    latexPlaceholders.forEach((latex, index) => {
      if (latex.startsWith('\\[')) {
        cleanedContent = cleanedContent.replace(`__LATEX_DISPLAY_${index}__`, latex);
      } else {
        cleanedContent = cleanedContent.replace(`__LATEX_INLINE_${index}__`, latex);
      }
    });

    // Ensure content is wrapped in paragraph tags if not already
    if (cleanedContent && !cleanedContent.startsWith('<p>') && !cleanedContent.startsWith('<div>')) {
      cleanedContent = `${cleanedContent}`;
    }

    return cleanedContent;
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
    if (!content) return '';
    let processedContent = this.processImageContent(content);

    // Loại bỏ các thẻ <li> ngoài cùng nếu có
    processedContent = this.removeLiTags(processedContent);


    // ✅ THÊM: Đảm bảo các ký tự đặc biệt được escape đúng
    processedContent = processedContent
      .replace(/\\"/g, '"')  // Unescape quotes
      .replace(/\\\\/g, '\\'); // Unescape backslashes

    return processedContent;
  };

  removeLiTags = (content) => {
    if (!content) return content;
    return content.replace(/<li[^>]*>/gi, '').replace(/<\/li>/gi, '');
  };

  extractLatexFromHtml = (html) => {
    if (!html) return "";
    const matches = html.match(/\\\((.*?)\\\)/g) || html.match(/<span class="math"[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/gi);
    if (matches) {
      return matches.map(m => m.replace(/\\\(|\\\)/g, '').replace(/<span class="math"[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/gi, '$1')).join(' ');
    }
    return "";
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

  cleanExplanation = (explanation) => {
    if (!explanation) return null;

    // Loại bỏ thẻ <p>, <br>, hoặc tag HTML khác
    let plainText = explanation
      .replace(/<\/?p[^>]*>/gi, '')    // Xóa riêng <p> và </p>
      .replace(/<br\s*\/?>/gi, '')     // Xóa <br>
      .replace(/<[^>]*>/g, '')         // Xóa các tag HTML khác
      .trim();

    return plainText || null;
  };

  handleSave = async (e) => {
    setLoader(true)
    e.preventDefault();

    // Validation
    if (!this.state.content1 || this.state.content1.trim() === '') {
      alert('Vui lòng nhập nội dung câu hỏi!');
      setLoader(false);
      return;
    }

    if (this.state.correctAnswers.some(ans => !ans.answer || ans.answer.trim() === '')) {
      alert('Vui lòng nhập nội dung cho tất cả các đáp án!');
      setLoader(false);
      return;
    }

    let { examId, examSectionId, examSectionGroupId, examSectionSubjectId, currentSubjectId, currentTopicId, questionIdGroupTopic, childExamId } = this.props


    // Đơn giản hóa mapLevelToShort - loại bỏ switch phức tạp
    const mapLevelToShort = (lvl) => {
      if (!lvl) return "";
      return String(lvl); // Giữ nguyên giá trị thay vì map phức tạp
    };

    // Lấy content từ editors
    let questionContent = '';
    if (this.questionEditor) {
      questionContent = this.questionEditor.getContents();
      questionContent = this.processMathSpansToLatex(questionContent);
    } else {
      questionContent = this.state.content1 || this.state.rawHtml || '';
    }
    const cleanedQuestionContent = this.cleanHtmlContent(questionContent);

    let explanationContent = '';
    if (this.solutionEditor) {
      explanationContent = this.solutionEditor.getContents();
      explanationContent = this.processMathSpansToLatex(explanationContent);
    } else {
      explanationContent = this.state.explanation || '';
    }
    const cleanedExplanationContent = this.cleanHtmlContent(explanationContent);

    let question = {
      // DB-side fields expected by create/update flows
      exam_id: examId,
      exam_section_id: examSectionId === "" ? null : examSectionId,
      exam_section_group_id: examSectionGroupId === "" ? null : examSectionGroupId,
      subject_id: currentSubjectId || (examSectionSubjectId === "" ? null : examSectionSubjectId),
      topic_id: currentTopicId,
      questionTopicGroupId: questionIdGroupTopic,
      childExamId: childExamId,

      // Question content
      rawHtml: cleanedQuestionContent,
      answer: this.state.correctAnswers.map(ans => ans.answer),
      answer_content: cleanedQuestionContent,
      correctAnswers: this.state.correctAnswers.map(ans => ans.answer), // Chuẩn hóa giống upload
      type: this.state.type,
      level: mapLevelToShort(this.state.level),
      question_level: mapLevelToShort(this.state.level), // Thêm question_level giống upload
      explanation: cleanedExplanationContent,
      video_link: this.state.video_link,
      question_no: this.state.questionNo,
      code: `${this.state.questionNo}`, // Mã câu hỏi
      __temp: false // Không phải tạm thời
    }

    // Add ID and timestamps for update operations - same logic as ModalQuestion1
    if (this.state.actionQuestion === 'update' && this.state.currentQuestionvalue) {
      const currentQ = this.state.currentQuestionvalue;
      // Đảm bảo có ít nhất một ID hợp lệ
      const validId = currentQ._id || currentQ.id || currentQ.question_id;
      if (!validId) {
        alert('Không tìm thấy ID câu hỏi để cập nhật!');
        setLoader(false);
        return;
      }
      // Giữ nguyên created_at từ dữ liệu gốc để tránh thay đổi thứ tự
      question._id = validId;
      question.id = validId;
      question.question_id = validId;
      question.created_at = currentQ.created_at || new Date().toISOString();
      question.updated_at = new Date().toISOString(); // Thêm updated_at mới
    } else {
      // For create operations, generate a temporary ID and set created_at
      question._id = `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      question.created_at = new Date().toISOString();
    }

    try {
      if (this.state.actionQuestion === 'create') {
        await this.props.actionCreateQuestion(question)
      } else {
        await this.props.actionUpdateQuestion(question);
      }

      this.closeModal()
    } catch (error) {

      alert('Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại!');
    } finally {
      setLoader(false)
    }
  };

  //change select option
  handleChange = (value) => {
    this.setState({
      tags: Object.assign([], value),
    });
  };

  onChangeHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
  };

  _handleEditorContentChange = (content) => {
    if (this._isSettingQuestionContent) return;

    const processedContent = this.processLatexInContent(content);

    // Giữ đồng bộ với ModalQuestion2: lưu rawHtml và content đã xử lý LaTeX
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

  handleAnswerEditorChange = (answerId, content) => {
    if (this._isSettingAnswerContent[answerId]) return;

    const processedContent = this.processLatexInContent(content);
    const plainText = this.cleanExplanation(processedContent);
    const cleanedContent = this.cleanHtmlContent(processedContent);

    this.updateOption(answerId, plainText, cleanedContent);

    if (
      processedContent !== content &&
      /(\\\(|\\\[|\$\$|\$)/.test(content)
    ) {
      this._isSettingAnswerContent[answerId] = true;
      setTimeout(() => {
        try {
          const editor = this[`answerEditor_${answerId}`];
          if (editor && typeof editor.setContents === "function") {
            editor.setContents(processedContent);
          }
        } finally {
          this._isSettingAnswerContent[answerId] = false;
        }
      }, 0);
    }

    if (this.state.showPreviewOptions[answerId]) {
      setTimeout(() => {
        this.renderPreviewAnswer(answerId);
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
    this.setState(prevState => ({
      showMathFieldOptions: {
        ...prevState.showMathFieldOptions,
        [optionId]: !prevState.showMathFieldOptions[optionId]
      }
    }));
  };

  toggleMathFieldForQuestion = () => {
    this.setState(prevState => ({
      showMathFieldQuestion: !prevState.showMathFieldQuestion
    }));
  };

  toggleMathFieldForExplanation = () => {
    this.setState(prevState => ({
      showMathFieldExplanation: !prevState.showMathFieldExplanation
    }));
  };

  renderPreviewExplanation = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-explanation-3');
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
      const previewContainer = document.getElementById('preview-question-3');
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

  renderPreviewAnswer = (answerId) => {
    setTimeout(() => {
      const previewContainer = document.getElementById(`preview-answer-${answerId}`);
      if (previewContainer) {
        let content = '';
        const editor = this[`optionEditor_${answerId}`];
        if (editor) {
          content = editor.getContents();
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

  updateOption = (answerId, text, html = null) => {
    this.setState(prevState => ({
      correctAnswers: prevState.correctAnswers.map(ans =>
        ans.id === answerId
          ? {
            ...ans,
            answer: text || ans.answer,
            text: text || ans.text,
            html: html !== null ? html : ans.html
          }
          : ans
      )
    }));
  };



  closeModal = () => {
    // Đặt lại state và nội dung Editor trước khi đóng modal
    this.clearAllInputs();
    $('#close_create_3').trigger('click');
  }

  insertSymbolToStatement = (id, symbol) => {
    this.setState(prevState => ({
      correctAnswers: prevState.correctAnswers.map(ans =>
        ans.id === id ? { ...ans, answer: ans.answer + symbol } : ans
      )
    }));
  };

  renderQuestionType = (type) => {
    switch (type) {
      default:
        return "Điền Số/Trả lời Ngắn"; // Default case
    }
  };

  render() {
    return (
      <div className="block-content">
        <div className="row">
          <div className="col-sm-12">
            <div className="form-group">
              <div className="alert alert-info" style={{ padding: '8px 12px', marginBottom: '15px' }}>
                <strong>Câu {this.state.questionNo} - {this.renderQuestionType(this.state.type)}</strong>
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
                      style={{ height: '40px', padding: '8px' }}
                      onClick={this.toggleMathFieldForQuestion}
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewQuestion ? 'btn-success' : 'btn-outline-primary'} ml-2`}
                      style={{ height: '40px', padding: '8px' }}
                      onClick={() => {
                        this.setState({
                          showPreviewQuestion: !this.state.showPreviewQuestion
                        }, () => {
                          if (this.state.showPreviewQuestion) {
                            this.renderPreviewQuestion();
                          }
                        });
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
                        style={{ width: '100%', minHeight: '40px', border: '1px solid #ccc', borderRadius: '4px', pointerEvents: 'auto', flexGrow: 1 }}
                      ></math-field>
                      <button
                        className="btn btn-primary ml-2"
                        style={{ height: '40px', padding: '0 12px' }}
                        onClick={() => this.insertFromField('question')}
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
                        buttonList: baseHelpers.getSunEditorOptions(),
                        katex: katex,
                        showPathLabel: false,
                        attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                        addTagsWhitelist: 'span|svg|path|symbol|use',
                        formats: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                        onClick: (e) => this.handleMathClick(e, "question"),
                      }}
                    />

                  </div>

                  {this.state.showPreviewQuestion && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Nội dung câu hỏi</strong>
                        </div>
                        <div
                          id="preview-question-3"
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
          <div className="col-sm-12">
            <div className="form-group">
              <label className="title-block">Số ô trống</label>
              <div className="row">
                <div className="col-sm-2">
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="10"
                    value={this.state.blankCount}
                    onChange={(e) => this.handleBlankCountChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="form-group">
              <label className="title-block">Đáp án đúng</label>

              {this.state.correctAnswers.map((answer, index) => (
                <div key={answer.id}>
                  <div className="row mb-2 align-items-center">
                    <div className="col-sm-1">
                      <label className="col-form-label">{index + 1}.</label>
                    </div>
                    <div className="col-sm-10">
                      <SunEditor
                        id={`option-editor-${answer.id}`}
                        getSunEditorInstance={(sunEditor) => {
                          if (!this[`optionEditor_${answer.id}`]) {
                            this[`optionEditor_${answer.id}`] = sunEditor;
                          }
                          this.attachMathClickListener(sunEditor, "option", answer.id);
                        }}
                        onImageUploadBefore={this.handleImageUploadBefore}
                        height={'80px'}
                        defaultValue={answer.html || answer.text}
                        onChange={(content) => this.handleAnswerEditorChange(answer.id, content)}
                        setOptions={{
                          buttonList: [],
                          katex: katex,
                          showPathLabel: false,
                          onMouseDown: (e) => this.handleMathClick(e, 'option', answer.id),
                          attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                          addTagsWhitelist: 'span|svg|path|symbol|use',
                        }}
                      />

                      {/* Preview container cho đáp án */}
                      {this.state.showPreviewOptions && this.state.showPreviewOptions[answer.id] && (
                        <div className="mt-2">
                          <div className="card border-info">
                            <div className="card-header bg-info text-white">
                              <strong>Preview - Đáp án {index + 1}</strong>
                            </div>
                            <div
                              id={`preview-answer-${answer.id}`}
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
                    <div className="col-sm-1 d-flex flex-column">
                      <button
                        type="button"
                        className="btn btn-primary mt-2"
                        style={{ height: '30px', padding: '8px' }}
                        onClick={() => this.toggleMathFieldForOption(answer.id)}
                        title="Chèn công thức"
                      >
                        ∑
                      </button>
                      <button
                        type="button"
                        className={`btn ${this.state.showPreviewOptions && this.state.showPreviewOptions[answer.id] ? 'btn-success' : 'btn-outline-primary'} mt-1`}
                        style={{ height: '30px', padding: '0 8px' }}
                        onClick={() => {
                          this.setState(prev => ({
                            showPreviewOptions: {
                              ...prev.showPreviewOptions,
                              [answer.id]: !prev.showPreviewOptions[answer.id]
                            }
                          }), () => {
                            if (this.state.showPreviewOptions[answer.id]) {
                              this.renderPreviewAnswer(answer.id);
                            }
                          });
                        }}
                        title={`Xem trước đáp án ${index + 1}`}
                      >
                        <i className="fa fa-eye"></i>
                      </button>
                    </div>
                  </div>
                  {this.state.showMathFieldOptions[answer.id] && (
                    <div className="row mb-2 align-items-center">
                      <div className="col-sm-1"></div>
                      <div className="col-sm-10 d-flex align-items-center">
                        <math-field
                          id={`math-field-option-${answer.id}`}
                          virtual-keyboard-mode="onfocus"
                          virtual-keyboard-theme="apple"
                          style={{ width: '100%', minHeight: '30px', border: '1px solid #ccc', borderRadius: '4px', pointerEvents: 'auto', flexGrow: 1 }}
                        ></math-field>
                        <button
                          className="btn btn-primary ml-2"
                          style={{ height: '30px', padding: '0 8px' }}
                          onClick={() => this.insertFromField('option', answer.id)}
                        >
                          Chèn
                        </button>
                      </div>
                      <div className="col-sm-1"></div>
                    </div>
                  )}

                </div>
              ))}
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
                      className="btn btn-primary ml-2"
                      style={{ height: '40px', padding: '8px' }}
                      onClick={this.toggleMathFieldForExplanation}
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    <button
                      type="button"
                      className={`btn ${this.state.showPreviewExplanation ? 'btn-success' : 'btn-outline-primary'} ml-2`}
                      style={{ height: '40px', padding: '8px' }}
                      onClick={() => {
                        this.setState({
                          showPreviewExplanation: !this.state.showPreviewExplanation
                        }, () => {
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
                        style={{ width: '100%', minHeight: '40px', border: '1px solid #ccc', borderRadius: '4px', pointerEvents: 'auto', flexGrow: 1 }}
                      ></math-field>
                      <button
                        className="btn btn-primary ml-2"
                        style={{ height: '40px', padding: '0 12px' }}
                        onClick={() => this.insertFromField('explanation')}
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
                      height={'250px'}
                      defaultValue={this.state.explanation}
                      onChange={(content) => this.handleExplanationEditorChange(content)}
                      setOptions={{
                        buttonList: baseHelpers.getSunEditorOptions2(),
                        katex: katex,
                        showPathLabel: false,
                        onMouseDown: (e) => this.handleMathClick(e, 'explanation'),
                        attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                        addTagsWhitelist: 'span|svg|path|symbol|use',
                      }}
                    />
                  </div>

                  {this.state.showPreviewExplanation && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Giải thích</strong>
                        </div>
                        <div
                          id="preview-explanation-3"
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
              <label className="col-form-label">
                Video tham khảo
              </label>
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
            {
              this.props.actionQuestion === "update" && (
                <button
                  name="reset"
                  value="1"
                  className="btn btn-primary mt-2 ml-2"
                  onClick={this.handleSave}
                >
                  Cập nhật
                </button>
              )
            }


            {
              this.props.actionQuestion === "create" && (
                <button
                  name="save_temp"
                  value="1"
                  className="btn btn-primary mt-2 ml-2"
                  onClick={(e) => {
                    // Validation
                    if (!this.state.content1 || this.state.content1.trim() === '') {
                      alert('Vui lòng nhập nội dung câu hỏi!');
                      return;
                    }

                    if (this.state.correctAnswers.some(ans => !ans.answer || ans.answer.trim() === '')) {
                      alert('Vui lòng nhập nội dung cho tất cả các đáp án!');
                      return;
                    }

                    // Build same payload as handleSave but mark as temporary
                    const { examId, examSectionId, examSectionGroupId, examSectionSubjectId, childExamId } = this.props;

                    // Đơn giản hóa mapLevelToShort cho temp question
                    const mapLevelToShort = (lvl) => {
                      if (!lvl) return "";
                      return String(lvl); // Giữ nguyên giá trị
                    };

                    const tempQuestion = {
                      exam_id: examId,
                      exam_section_id: examSectionId === "" ? null : examSectionId,
                      exam_section_group_id: examSectionGroupId === "" ? null : examSectionGroupId,
                      subject_id: examSectionSubjectId === "" ? null : examSectionSubjectId,
                      childExamId: childExamId,
                      rawHtml: this.state.rawHtml,
                      answer: this.state.correctAnswers.map(ans => ans.answer),
                      answer_content: this.state.content1,
                      type: this.state.type,
                      level: mapLevelToShort(this.state.level),
                      explanation: this.cleanExplanation(this.state.explanation),
                      video_link: this.state.video_link,
                      question_no: this.state.questionNo,
                      _id: `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                      __temp: true
                    };


                    try {
                      this.props.actionCreateQuestion(tempQuestion);
                      // Reset solution editor immediately
                      if (this.solutionEditor) {
                        this.solutionEditor.setContents('');
                      }
                      this.closeModal();
                    } catch (error) {

                      alert('Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại!');
                    }
                  }}
                >
                  Lưu & Thêm mới
                </button>
              )
            }
            <button
              id='close_create_3'
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
    image: state.question.image
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { uploadImage },
    dispatch
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalQuestion3)
);
