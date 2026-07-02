import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  Select,
  Radio,
  notification, Checkbox,
} from "antd";
import {
  uploadImage
} from "../../redux/question/action";
import $ from "jquery";
import { setLoader } from "../LoadingContext";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import baseHelpers from "../../helpers/BaseHelpers";
import 'mathlive/mathlive-static.css';
import { MathfieldElement } from 'mathlive';

class ModalQuestion6 extends Component {
  constructor(props) {
    super();
    this.state = {
      questionNo: 1,
      type: 'truefalse',
      question: null,
      answer: true,
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
      editorKey: Date.now(),
      solutionEditorKey: Date.now() + 1,
      showMathFieldOptions: {}, // Thêm để toggle MathfieldElement (cho tương thích, dù không dùng)
      showMathFieldQuestion: false,
      showMathFieldExplanation: false,
      selectedMathElement: null,
      // Preview toggles
      showPreviewQuestion: false,
      showPreviewExplanation: false,
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
      const processedContent = this.removeLiTags(this.prepareContentForEditor(content));
      editor.setContents(processedContent);
    } catch (error) {
      console.warn('Error setting editor content:', error);
      // Fallback: set content without processing
      try {
        editor.setContents(this.removeLiTags(content || ''));
      } catch (fallbackError) {
        console.error('Failed to set editor content even with fallback:', fallbackError);
      }
    }
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

    // When an existing question is injected for editing, mirror ModalQuestion1 behavior:
    // set state then call setContent on editors after a short timeout so SunEditor instances are ready.
    if (prevProps.currentQuestionvalue !== this.props.currentQuestionvalue && this.props.currentQuestionvalue) {
      const { answer, answer_content, doc_link, video_link, question_no, level, explanation, correctAnswers } = this.props.currentQuestionvalue || {};



      // Đơn giản hóa boolify - loại bỏ logic phức tạp
      const boolify = (v) => {
        if (v === true || v === 'true' || v === 'TRUE') return true;
        if (v === false || v === 'false' || v === 'FALSE') return false;
        if (typeof v === 'string') {
          const lower = v.toLowerCase().trim();
          // Support both Vietnamese and English
          if (lower === 'đúng' || lower === 'dung' || lower === 'true') return true;
          if (lower === 'sai' || lower === 'false') return false;
        }
        return !!v; // Simple boolean conversion
      };

      // Get answer from answer field or correctAnswers
      let finalAnswer = answer;
      if (!finalAnswer && correctAnswers) {
        if (Array.isArray(correctAnswers) && correctAnswers.length > 0) {
          const first = correctAnswers[0];
          if (typeof first === 'string') {
            finalAnswer = first;
          } else if (typeof first === 'object' && first !== null) {
            finalAnswer = first.value || first.rawHtml || first.label || first;
          }
        }
      }

      // Đơn giản hóa mapLevelToLong - chỉ pass-through với fallback
      const mapLevelToLong = (lvl) => {
        if (!lvl) return "";
        return lvl; // Giữ nguyên giá trị, loại bỏ switch phức tạp
      };

      this.setState({
        currentQuestionvalue: this.props.currentQuestionvalue,
        answer: boolify(finalAnswer),
        answer_content: answer_content || null,
        doc_link: doc_link || "",
        video_link: video_link || "",
        level: mapLevelToLong(level) || "",
        explanation: this.removeLiTags(explanation || ""),
        questionNo: this.props.questionNo || question_no || 1, // ✅ Ưu tiên props.questionNo
        content1: this.removeLiTags(this.cleanExplanation(answer_content || this.props.currentQuestionvalue?.rawHtml || "")),
        rawHtml: this.removeLiTags(this.props.currentQuestionvalue?.rawHtml || ""),
      });

      // Update question editor content after a short delay
      setTimeout(() => {
        if (this.questionEditor) {
          const content = answer_content || this.props.currentQuestionvalue?.rawHtml || '';
          this.setEditorContentSafely(this.questionEditor, this.removeLiTags(content));
        }
      }, 100);

      // Update solution editor content after a short delay
      setTimeout(() => {
        if (this.solutionEditor) {
          const content = explanation || doc_link || '';
          this.setEditorContentSafely(this.solutionEditor, this.removeLiTags(content));
        }
      }, 100);
    }
  };

  setupAutoRender = () => {
    const container = document.querySelector('#modalQuestion6') || document.querySelector('#create6') || document.body;
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
    $(document).on('show.bs.modal', '#modalQuestion6, #create6', () => {

      if (this.props.actionQuestion === 'create') {
        this.clearAllInputs();
      }

      // If opening modal to edit an existing question, ensure editors show content
      if (this.props.actionQuestion === 'update' && this.props.currentQuestionvalue) {
        const q = this.props.currentQuestionvalue;
        const answer_content = q.answer_content || q.rawHtml || '';
        const explanation = q.explanation || q.doc_link || '';
        // bump editor keys to force remount (SunEditor sometimes caches internal state)
        const editorKey = Date.now();
        const solutionEditorKey = Date.now() + 1;
        this.setState({
          content1: answer_content,
          rawHtml: q.rawHtml || answer_content,
          explanation: explanation,
          editorKey,
          solutionEditorKey,
        }, () => {
          // After remount there will be an onLoad that sets content; keep short fallback
          setTimeout(() => {
            try {
              if (this.questionEditor) {
                this.setEditorContentSafely(this.questionEditor, answer_content);
              }
            } catch (e) { }
            try {
              if (this.solutionEditor) {
                this.setEditorContentSafely(this.solutionEditor, explanation);
              }
            } catch (e) { }
          }, 120);
        });
      }
    });

    // Thêm sự kiện lắng nghe khi modal đóng
    $(document).on('hide.bs.modal', '#modalQuestion6, #create6', () => {
      this.clearAllInputs();
    });

    // Thêm setup cho auto-render và MutationObserver
    const modals = document.querySelectorAll('#modalQuestion6, #create6');
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
    $(document).off('show.bs.modal', '#modalQuestion6, #create6');
    $(document).off('hide.bs.modal', '#modalQuestion6, #create6');
    this.cleanupMutationObserver();
  }

  // Phương thức đặt lại nội dung của Editor
  resetEditorContent = () => {
    this.setState({ content1: "", explanation: "", rawHtml: "", selectedMathElement: null, showMathFieldQuestion: false, showMathFieldExplanation: false });

    // ✅ THÊM: Force reset editors
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
      type: 'truefalse',
      question: null,
      answer: true,
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
      showMathFieldQuestion: false,
      showMathFieldExplanation: false,
      selectedMathElement: null,
    });
  }

  // Phương thức làm sạch tất cả input fields
  clearAllInputs = () => {


    // ✅ THÊM: Reset currentQuestionvalue trước tiên
    this.setState({ currentQuestionvalue: null, selectedMathElement: null }, () => {
      // Reset state
      this.resetState();
      this.resetEditorContent();

      // Clear DOM input elements
      setTimeout(() => {
        // Clear video link input
        const videoInput = document.querySelector('input[name="video_link"]');
        if (videoInput) videoInput.value = '';

        // Clear any other input fields if needed
        const inputs = document.querySelectorAll('#modalQuestion6 input[type="text"], #create6 input[type="text"]');
        inputs.forEach(input => {
          if (input.name !== 'video_link') { // Keep video_link as it's handled by state
            input.value = '';
          }
        });

        // Clear select elements
        const selects = document.querySelectorAll('#modalQuestion6 select, #create6 select');
        selects.forEach(select => {
          select.selectedIndex = 0;
        });

        // Clear radio buttons
        const radios = document.querySelectorAll('#modalQuestion6 input[type="radio"], #create6 input[type="radio"]');
        radios.forEach(radio => {
          radio.checked = false;
        });
      }, 100);
    });
  }

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  // Hàm loại bỏ thẻ li khỏi nội dung câu hỏi
  removeLiTags = (content) => {
    if (!content) return '';
    // Dùng [\s\S]*? để bắt cả nội dung nhiều dòng bên trong <li>...</li>
    return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '$1');
  }

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

  extractLatexFromHtml = (html) => {
    if (!html) return "";
    const matches = html.match(/\\\((.*?)\\\)/g) || html.match(/<span class="math"[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/gi);
    if (matches) {
      return matches.map(m => m.replace(/\\\(|\\\)/g, '').replace(/<span class="math"[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/gi, '$1')).join(' ');
    }
    return "";
  };

  // Hàm kiểm tra nội dung câu hỏi có ý nghĩa (không chỉ HTML tags)
  hasValidQuestionContent = (content) => {
    if (!content || content.trim() === '') return false;
    // Loại bỏ tất cả HTML tags và kiểm tra nội dung text
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 0;
  };

  handleSave = async (e) => {
    setLoader(true)
    e.preventDefault();

    // Validation - kiểm tra nội dung có ý nghĩa
    if (!this.hasValidQuestionContent(this.state.content1)) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      setLoader(false);
      return;
    }

    let { examId, examSectionId, examSectionGroupId, examSectionSubjectId, currentSubjectId, currentTopicId, questionIdGroupTopic, childExamId } = this.props

    // ✅ THÊM: Validation cho subject_id
    const subject_id = currentSubjectId || (examSectionSubjectId === "" ? null : examSectionSubjectId);

    const mapLevelToShort = (lvl) => {
      if (!lvl) return "";
      return String(lvl); // Giữ nguyên giá trị thay vì map phức tạp
    };

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
      rawHtml: this.state.rawHtml,
      answer: this.state.answer === true ? "ĐÚNG" : "SAI",
      answer_content: this.state.content1 || this.state.rawHtml || "",
      correctAnswers: [this.state.answer === true ? "ĐÚNG" : "SAI"], // Chuẩn hóa giống upload
      type: this.state.type,
      level: mapLevelToShort(this.state.level),
      question_level: mapLevelToShort(this.state.level), // Thêm question_level giống upload
      explanation: this.cleanExplanation(this.state.explanation),
      video_link: this.state.video_link,
      question_no: this.state.questionNo,
      code: `${this.state.questionNo}`, // Mã câu hỏi
      images: this.state.uploadedImages || [], // Danh sách hình ảnh
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

  closeModal = () => {
    // Đặt lại state và nội dung Editor trước khi đóng modal
    this.clearAllInputs();
    $('#close_create_6').trigger('click');
  }

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

  // Preview nội dung câu hỏi
  renderPreviewQuestion = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-question-6');
      if (previewContainer) {
        let content = '';
        if (this.questionEditor) {
          content = this.questionEditor.getContents();
        }
        // Loại bỏ <li> trước khi hiển thị
        previewContainer.innerHTML = this.removeLiTags(content) || 'Nội dung sẽ hiển thị ở đây...';
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

  // Preview nội dung giải thích
  renderPreviewExplanation = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-explanation-6');
      if (previewContainer) {
        let content = '';
        if (this.solutionEditor) {
          content = this.solutionEditor.getContents();
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
        notification.error({
          message: "Lỗi",
          description: "Có lỗi khi chèn công thức LaTeX. Vui lòng thử lại.",
        });
      }
    }
  };

  renderQuestionType = (type) => {
    switch (type) {
      default:
        return "Đúng Sai";
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



        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">Nội dung câu hỏi</label>
              <div className="card border-primary">
                <div className="card-body">
                  <div className="mb-2 d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-primary mr-2"
                      style={{ height: '40px', padding: '8px' }}
                      onClick={() => this.setState({ showMathFieldQuestion: !this.state.showMathFieldQuestion })}
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    <button
                      type="button"
                      className={this.state.showPreviewQuestion ? "btn btn-success mr-2" : "btn btn-outline-primary mr-2"}
                      style={{ height: '40px', padding: '8px' }}
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
                  <SunEditor
                    id="question-editor"
                    getSunEditorInstance={(sunEditor) => {
                      this.questionEditor = sunEditor;
                      this.attachMathClickListener(sunEditor, "question");
                    }}
                    onImageUploadBefore={this.handleImageUploadBefore}
                    height={'300px'}
                    defaultValue={this.state.rawHtml}
                    onChange={this._handleEditorContent1Change}
                    setOptions={{
                      buttonList: baseHelpers.getSunEditorOptions2(),
                      katex: katex,
                      showPathLabel: false,
                      onMouseDown: (e) => this.handleMathClick(e, 'question'),
                      attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                      addTagsWhitelist: 'span|svg|path|symbol|use',
                    }}
                  />
                  {this.state.showPreviewQuestion && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Nội dung câu hỏi</strong>
                        </div>
                        <div
                          id="preview-question-6"
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
          <div className="col-4 col-form-div">
            <div className="form-group">
              <label className="col-form-label">Đáp án</label>
            </div>
          </div>
          <div className="col-sm-8">
            <Radio.Group
              onChange={this._onChange}
              name="answer"
              value={this.state.answer}>
              <Radio value={true}>Đúng</Radio>
              <Radio value={false}>Sai</Radio>
            </Radio.Group>
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
                      style={{ height: '40px', padding: '8px' }}
                      onClick={() => this.setState({ showMathFieldExplanation: !this.state.showMathFieldExplanation })}
                      title="Chèn công thức"
                    >
                      ∑ Chèn công thức
                    </button>
                    <button
                      type="button"
                      className={this.state.showPreviewExplanation ? "btn btn-success mr-2" : "btn btn-outline-primary mr-2"}
                      style={{ height: '40px', padding: '8px' }}
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
                  <SunEditor
                    id="explanation-editor"
                    getSunEditorInstance={(sunEditor) => {
                      this.solutionEditor = sunEditor;
                      this.attachMathClickListener(sunEditor, "explanation");
                    }}
                    onImageUploadBefore={this.handleImageUploadBefore}
                    height={'250px'}
                    defaultValue={this.state.explanation}
                    onChange={this._handleSolutionEditorChange}
                    setOptions={{
                      buttonList: baseHelpers.getSunEditorOptions2(),
                      katex: katex,
                      showPathLabel: false,
                      onMouseDown: (e) => this.handleMathClick(e, 'explanation'),
                      attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                      addTagsWhitelist: 'span',
                    }}
                  />
                  {this.state.showPreviewExplanation && (
                    <div className="mt-3">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <strong>Preview - Giải thích</strong>
                        </div>
                        <div
                          id="preview-explanation-6"
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
                    e.preventDefault();

                    // Validation - kiểm tra nội dung có ý nghĩa
                    if (!this.hasValidQuestionContent(this.state.content1)) {
                      alert('Vui lòng nhập nội dung câu hỏi!');
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
                      answer: this.state.answer === true ? "ĐÚNG" : "SAI",
                      answer_content: this.state.content1,
                      correctAnswers: [this.state.answer === true ? "ĐÚNG" : "SAI"], // Chuẩn hóa giống upload
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
              id="close_create_6"
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
  connect(mapStateToProps, mapDispatchToProps)(ModalQuestion6)
);