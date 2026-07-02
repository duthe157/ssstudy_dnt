import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Select, Radio, notification, Modal } from "antd";
import { setLoader } from "../LoadingContext";
import { uploadImage } from "../../redux/question/action";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import "katex/dist/katex.min.css";
import katex from "katex";
import renderMathInElement from "katex/dist/contrib/auto-render";
import baseHelpers from "../../helpers/BaseHelpers";
import { set } from "lodash";
class ModalQuestion1 extends Component {
  constructor(props) {
    super();
    this.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    this.latexProcessTimer = null;
    this._isSettingOptionContent = {};
    this._isSettingExplanationContent = false;
    this.state = {
      questionNo: 1,
      type: "singlechoice",
      question: null,
      answer: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      answer_content: null,
      explanation: "",
      video_link: "",
      level: "",
      selectedFile: null,
      content: "",
      plainText: "",
      showMathFieldOptions: {},
      showMathFieldQuestion: false,
      showMathFieldExplanation: false,
      selectedMathElement: null,
      showPreview: false,
      showPreviewOptions: {},
      showPreviewExplanation: false,
    };
    this.questionEditor = null;
    this.solutionEditor = null;
    this.mutationObserver = null;
  }

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.questionNo !== this.props.questionNo) {
      this.setState({ questionNo: this.props.questionNo });
    }
    if (prevProps.actionQuestion !== this.props.actionQuestion) {
      this.setState({ actionQuestion: this.props.actionQuestion });
      if (
        prevProps.actionQuestion === "update" &&
        this.props.actionQuestion === "create"
      ) {
        this.clearAllInputs();
      }
    }
    if (
      prevProps.currentQuestionvalue !== this.props.currentQuestionvalue && this.props.currentQuestionvalue
    ) {
      const currentQ = this.props.currentQuestionvalue;
      let questionContent = currentQ.rawHtml;

      let explanationContent = currentQ.explanation || currentQ.doc_link || "";
      explanationContent = this.removeLiTags(explanationContent);

      const normalizeAnswer = (ans) => {
        const targetAnswer =
          currentQ.correctAnswers !== undefined ? currentQ.correctAnswers : ans;
        if (
          typeof targetAnswer === "string" &&
          /^[A-Za-z]$/.test(targetAnswer)
        ) {
          return targetAnswer.toUpperCase();
        }
        if (Array.isArray(targetAnswer) && targetAnswer.length > 0) {
          const first = targetAnswer[0];
          if (typeof first === "string" && /^[A-Za-z]$/.test(first)) {
            return first.toUpperCase();
          }
          if (
            typeof first === "object" &&
            first.value &&
            /^[A-Za-z]$/.test(first.value)
          ) {
            return first.value.toUpperCase();
          }
        }
        return "";
      };

      const normalizedAnswer = normalizeAnswer(currentQ.answer);
      const rawChoices = currentQ.choices || currentQ.options || [];
      let options = [];
      const numOptions = Math.max(rawChoices.length, 2);

      for (let i = 0; i < numOptions; i++) {
        options.push({ id: String.fromCharCode(65 + i), text: "" });
      }

      rawChoices.forEach((choice, index) => {
        if (index < options.length) {
          let text =
            typeof choice === "string"
              ? choice
              : choice.text || "";
          // Loại bỏ thẻ li khỏi text của option
          text = this.removeLiTags(text);
          options[index].text = text;
        }
      });

      const mapLevel = (lvl) => {
        if (!lvl) return "";
        const level = typeof lvl === "object" ? lvl.level : lvl;
        return String(level).trim() || "";
      };

      this.setState({
        currentQuestionvalue: currentQ,
        answer: normalizedAnswer,
        options: options,
        rawHtml: currentQ.rawHtml || "",
        explanation: explanationContent,
        video_link: currentQ.video_link || "",
        level: mapLevel(currentQ.level),
        questionNo: this.props.questionNo || currentQ.question_no || 1, // ✅ Ưu tiên props.questionNo đã được tính toán đúng
        type: "singlechoice",
      });

      await this.delay(200);

      if (this.questionEditor) {
        this.setEditorContentSafely(
          this.questionEditor, questionContent
        );
      }
      if (this.solutionEditor) {
        this.solutionEditor.setContents(explanationContent);
      }

      this.state.options.forEach((option) => {
        const editor = this[`optionEditor_${option.id}`];
        if (editor && typeof editor.setContents === "function") {
          editor.setContents(option.text || "");
        }
      });
    }
  };

  setupAutoRender = () => {
    const container = document.getElementById('question-editor');
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

  renderPreviewContent = () => {
    setTimeout(() => {
      const previewContainer = document.getElementById('preview-container');
      if (previewContainer) {
        // Lấy nội dung từ SunEditor
        let content = "";
        if (this.questionEditor) {
          content = this.questionEditor.getContents();
        }

        // Cập nhật nội dung preview
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

  renderPreviewOption = (optionId) => {
    setTimeout(() => {
      const previewContainer = document.getElementById(`preview-option-${optionId}`);
      if (previewContainer) {
        // Lấy nội dung từ SunEditor option
        let content = "";
        const optionEditor = this[`optionEditor_${optionId}`];
        if (optionEditor) {
          content = optionEditor.getContents();
        }

        // Cập nhật nội dung preview
        previewContainer.innerHTML = content || "Nội dung sẽ hiển thị ở đây...";

        // Render LaTeX
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
      const previewContainer = document.getElementById('preview-explanation');
      if (previewContainer) {
        // Lấy nội dung từ SunEditor explanation
        let content = "";
        if (this.solutionEditor) {
          content = this.solutionEditor.getContents();
        }

        // Cập nhật nội dung preview
        previewContainer.innerHTML = content || "Nội dung sẽ hiển thị ở đây...";

        // Render LaTeX
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


  cleanupMutationObserver = () => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  };
  resetState = () => {
    this.setState({
      questionNo: this.props.questionNo || 1,
      type: "singlechoice",
      question: null,
      answer: "A",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      answer_content: null,
      explanation: "",
      video_link: "",
      level: "",
      selectedFile: null,
      content: "",
      plainText: "",
      currentQuestionvalue: null,
      selectedMathElement: null,
    });
  };

  clearAllInputs = () => {
    this.setState(
      {
        currentQuestionvalue: null,
        selectedMathElement: null,
        showMathFieldOptions: {}, // ✅ Clear cache cho math fields options
        showMathFieldExplanation: false,
        showMathFieldQuestion: false,
        showPreview: false,
        showPreviewOptions: {},
        showPreviewExplanation: false,
        // Reset options về trạng thái mặc định
        options: [
          { id: "A", text: "" },
          { id: "B", text: "" },
          { id: "C", text: "" },
          { id: "D", text: "" },
        ],
        answer: "A", // Reset answer về A
      },
      () => {
        this.resetState();
        const clearInputs = () => {
          const videoInput = document.querySelector('input[name="video_link"]');
          if (videoInput) videoInput.value = "";
          const inputs = document.querySelectorAll(
            '#modalQuestion1 input[type="text"], #create1 input[type="text"], #modalQuestion1 input[type="number"], #create1 input[type="number"]'
          );
          inputs.forEach((input) => {
            if (input.name !== "video_link") input.value = "";
          });
          const selects = document.querySelectorAll(
            "#modalQuestion1 select, #create1 select"
          );
          selects.forEach((select) => (select.selectedIndex = 0));
          const radios = document.querySelectorAll(
            '#modalQuestion1 input[type="radio"], #create1 input[type="radio"]'
          );
          radios.forEach((radio) => (radio.checked = false));
          const optionInputs = document.querySelectorAll(
            "#modalQuestion1 .option-input input, #create1 .option-input input"
          );
          optionInputs.forEach((input) => (input.value = ""));
          const textareas = document.querySelectorAll(
            "#modalQuestion1 textarea, #create1 textarea"
          );
          textareas.forEach((textarea) => (textarea.value = ""));
          const allInputs = document.querySelectorAll(
            "#modalQuestion1 input, #create1 input"
          );
          allInputs.forEach((input) => {
            if (
              ["text", "password", "email", "number", "url"].includes(
                input.type
              )
            ) {
              input.value = "";
            } else if (["checkbox", "radio"].includes(input.type)) {
              input.checked = false;
            }
          });
        };
        clearInputs();
        setTimeout(clearInputs, 100);
        setTimeout(clearInputs, 300);
        setTimeout(() => {
          if (this.questionEditor) {
            this.questionEditor.setContents("");
          }
          if (this.solutionEditor) {
            this.solutionEditor.setContents("");
          }
          // Clear nội dung cho tất cả option editors (bao gồm cả A, B, C, D mặc định)
          const defaultOptions = ["A", "B", "C", "D"];
          defaultOptions.forEach((optionId) => {
            const editor = this[`optionEditor_${optionId}`];
            if (editor && typeof editor.setContents === "function") {
              editor.setContents("");
            }
          });
          // Clear thêm các option editors khác nếu có
          this.state.options.forEach((option) => {
            const editor = this[`optionEditor_${option.id}`];
            if (editor && typeof editor.setContents === "function") {
              editor.setContents("");
            }
          });
          // Clear math fields nếu đang hiển thị
          const mathFields = document.querySelectorAll("math-field");
          mathFields.forEach((field) => {
            if (field.setValue) field.setValue("");
          });
          // Clear preview containers
          const previewContainers = document.querySelectorAll('[id^="preview-"]');
          previewContainers.forEach((container) => {
            container.innerHTML = "";
          });
        }, 400);
      }
    );
  };

  addOption = () => {
    this.setState((prevState) => {
      const nextId = String.fromCharCode(65 + prevState.options.length);
      return {
        options: [...prevState.options, { id: nextId, text: "" }],
      };
    });
  };

  removeOption = (optionId) => {
    this.setState((prevState) => {
      // Chỉ cho phép xóa lựa chọn cuối cùng
      const lastOption = prevState.options[prevState.options.length - 1];
      if (optionId !== lastOption.id) {
        return prevState; // Không thay đổi state, không hiển thị cảnh báo
      }

      // Không cho phép xóa nếu chỉ còn 2 lựa chọn
      if (prevState.options.length <= 2) {
        return prevState; // Không thay đổi state, không hiển thị cảnh báo
      }

      const newOptions = prevState.options.filter(
        (option) => option.id !== optionId
      );
      let newAnswer = prevState.answer;
      if (prevState.answer === optionId && newOptions.length > 0) {
        newAnswer = newOptions[0].id;
      }
      return {
        options: newOptions,
        answer: newAnswer,
      };
    });
  };

  updateOption = (optionId, text, html = null) => {
    this.setState((prevState) => ({
      options: prevState.options.map((option) =>
        option.id === optionId
          ? {
            ...option,
            text: text || option.text,
          }
          : option
      ),
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

  // Hàm loại bỏ thẻ li khỏi nội dung câu hỏi
  removeLiTags = (content) => {
    if (!content) return content;
    return content.replace(/<li[^>]*>/gi, '').replace(/<\/li>/gi, '');
  };

  setEditorContentSafely = (editor, content) => {
    if (!editor || !content) return;
    try {
      if (typeof editor.setContents === "function") {
        editor.setContents(content);
      } else if (typeof editor.setContent === "function") {
        editor.setContent(content);
      }
    } catch (error) {
      console.error("Error setting editor content:", error);
    }
  };

  _onChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
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

    // Decode HTML entities trước (để xử lý &lt; &gt; &amp; v.v.)
    processedContent = this.decodeHtmlEntities(processedContent);

    // Các delimiters LaTeX
    const delimiters = [
      { start: '\\[', end: '\\]', display: true },   // Display mode
      { start: '\\(', end: '\\)', display: false },  // Inline mode
      { start: '$$', end: '$$', display: true },     // Display mode
      { start: '$', end: '$', display: false },      // Inline mode
    ];

    // Xử lý từng delimiter
    delimiters.forEach(({ start, end, display }) => {
      try {
        // Escape special regex characters properly
        const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Use [\s\S]*? to match any character including newlines
        const regex = new RegExp(escapedStart + '([\\s\\S]*?)' + escapedEnd, 'g');

        processedContent = processedContent.replace(regex, (match, latex) => {
          try {
            // Loại bỏ dấu backslash thừa ở cuối (thường do gõ nhầm hoặc copy-paste lỗi)
            // Tránh trường hợp \(...\ \) làm lỗi parser KaTe
            let cleanedLatex = this.normalizeLatex(String(latex));
            while (cleanedLatex && cleanedLatex.endsWith('\\') && !cleanedLatex.endsWith('\\\\')) {
              cleanedLatex = cleanedLatex.slice(0, -1).trim();
            }

            if (!cleanedLatex) return match;

            const rendered = katex.renderToString(cleanedLatex, {
              output: "html",
              throwOnError: false
            });
            const escapedLatex = String(latex).replace(/"/g, '&quot;');
            const renderedWithAttr = rendered.replace('<span class="katex"', `<span class="katex" data-latex="${escapedLatex}"`);
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
  _handleEditorContentChange = (content) => {
    if (this._isSettingContent) {
      return;
    }
    const processedContent = this.processLatexInContent(content);
    this.setState({
      rawHtml: processedContent,
    });

    // QUAN TRỌNG: Set lại content vào editor để DOM cũng có span
    if (this.questionEditor && processedContent !== content && content.includes('\\(')) {
      this._isSettingContent = true;
      setTimeout(() => {
        try {
          // Set content mới với span thay vì \( \)
          this.questionEditor.setContents(processedContent);
        } catch (e) {
          console.error("Error setting content:", e);
        } finally {
          this._isSettingContent = false;
        }
      }, 0);
    }

    if (this.state.showPreview) {
      this.renderPreviewContent();
    }
  };

  handleOptionEditorChange = (optionId, content) => {
    if (this._isSettingOptionContent[optionId]) return;

    const processedContent = this.processLatexInContent(content);
    this.updateOption(optionId, processedContent, processedContent);

    if (
      processedContent !== content &&
      /(\\\(|\\\[|\$\$|\$)/.test(content)
    ) {
      this._isSettingOptionContent[optionId] = true;
      setTimeout(() => {
        try {
          const editor = this[`optionEditor_${optionId}`];
          if (editor && typeof editor.setContents === "function") {
            editor.setContents(processedContent);
          }
        } finally {
          this._isSettingOptionContent[optionId] = false;
        }
      }, 0);
    }

    if (this.state.showPreviewOptions[optionId]) {
      setTimeout(() => {
        this.renderPreviewOption(optionId);
      }, 100);
    }
  };

  handleExplanationEditorChange = (content) => {
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

  handleSave = async (e) => {
    setLoader(true);
    e.preventDefault();
    let questionContent = this.state.rawHtml;
    if (
      !questionContent ||
      questionContent.trim() === "" ||
      questionContent === "<p></p>"
    ) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng nhập nội dung câu hỏi!",
      });
      setLoader(false);
      return;
    }
    if (
      this.state.options.some(
        (option) => !option.text || option.text.trim() === ""
      )
    ) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng nhập nội dung cho tất cả các lựa chọn!",
      });
      setLoader(false);
      return;
    }
    let explanationContent = this.solutionEditor ? this.solutionEditor.getContents() : this.state.explanation || "";
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
    const mapLevelToShort = (lvl) => lvl || "";
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
      answer: this.state.answer,
      correctAnswers: this.state.answer,
      choices: this.state.options.map((option) => ({
        label: option.id,
        text: option.text || "",
      })),
      type: this.state.type,
      level: mapLevelToShort(this.state.level),
      question_no: this.state.questionNo,
      explanation: explanationContent,
      latexExplanation: this.state.latexExplanation,
      video_link: this.state.video_link || "",
      __temp: false,
    };
    if (
      this.state.actionQuestion === "update" &&
      this.state.currentQuestionvalue
    ) {
      const currentQ = this.state.currentQuestionvalue;
      const validId = currentQ._id || currentQ.id || currentQ.question_id;
      if (!validId) {
        notification.error({
          message: "Lỗi",
          description: "Không tìm thấy ID câu hỏi để cập nhật!",
        });
        setLoader(false);
        return;
      }
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
        if (!question._id && !question.question_id) {
          notification.error({
            message: "Lỗi",
            description: "Không tìm thấy ID câu hỏi để cập nhật!",
          });
          setLoader(false);
          return;
        }
        await this.props.actionUpdateQuestion(question);
      }
      this.closeModal();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại!",
      });
    } finally {
      setLoader(false);
    }
  };

  createQuestion = () => {
    if (
      this.state.options.some(
        (option) => !option.text || option.text.trim() === ""
      )
    ) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng nhập nội dung cho tất cả các lựa chọn!",
      });
      return;
    }
    const {
      examId,
      examSectionId,
      examSectionGroupId,
      examSectionSubjectId,
      statusTopic,
      currentTopicId,
      currentSubjectId,
      childExamId,
    } = this.props;
    const mapLevelToShort = (lvl) => lvl || "";
    let questionContent = this.state.rawHtml || "";
    let explanationContent = this.state.explanation || "";
    let tempQuestion = {};
    if (statusTopic === "GROUP_TOPIC") {
      tempQuestion = {
        exam_id: examId,
        exam_section_id: examSectionId === "" ? null : examSectionId,
        exam_section_group_id:
          examSectionGroupId === "" ? null : examSectionGroupId,
        subject_id: currentSubjectId,
        topic_id: currentTopicId || null,
        plainText: this.state.plainText,
        answer: this.state.answer,
        rawHtml: questionContent,
        choices: this.state.options.map((option) => ({
          label: option.id,
          text: option.text || "",
        })),
        type: this.state.type,
        level: mapLevelToShort(this.state.level),
        explanation: explanationContent,
        latexExplanation: this.state.latexExplanation,
        video_link: this.state.video_link,
        question_no: this.state.questionNo,
        __temp: true,
        idSubjectGroup: currentSubjectId,
      };
    } else {
      tempQuestion = {
        exam_id: examId,
        exam_section_id: examSectionId === "" ? null : examSectionId,
        exam_section_group_id:
          examSectionGroupId === "" ? null : examSectionGroupId,
        subject_id: examSectionSubjectId === "" ? null : examSectionSubjectId,
        plainText: this.state.plainText,
        childExamId: childExamId,
        answer: this.state.answer,
        rawHtml: questionContent,
        choices: this.state.options.map((option) => ({
          label: option.id,
          text: option.text || "",
        })),
        type: this.state.type,
        level: mapLevelToShort(this.state.level),
        explanation: explanationContent,
        video_link: this.state.video_link,
        question_no: this.state.questionNo,
        __temp: true,
      };
    }
    try {
      this.props.actionCreateQuestion(tempQuestion);
      if (this.solutionEditor) {
        this.solutionEditor.setContents("");
      }
      this.closeModal();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại!",
      });
    }
  };

  closeModal = () => {
    this.clearAllInputs();
    const closeButton = document.querySelector("#close_create");
    if (closeButton) closeButton.click();
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

  renderQuestionType = (type) => {
    if (!type) return "";
    const t = String(type).toUpperCase();
    switch (t) {
      case "singlechoice":
        return "Trắc nghiệm";
    }
  };

  render() {
    return (
      <>
        <style>{`
          span.math-symbol {
            cursor: pointer;
            transition: background-color 0.2s ease;
            display: inline-block;
            user-select: none;
            pointer-events: auto;
          }
          span.math-symbol:hover {
            background-color: #e9ecef;
            border-radius: 4px;
          }
          span.math-symbol.selected {
            background-color: #cfe2ff;
            border: 2px solid #0d6efd;
            border-radius: 4px;
            padding: 2px 4px;
          }
          span.katex {
            
            cursor: pointer;
            user-select: none;
            pointer-events: auto;
          }
          span.katex:hover {
            background-color: #e9ecef;
            border-radius: 4px;
            border: 1px dashed  #adb5bd;
          }
          /* Prevent editing math-symbol while preserving it */
          #question-editor span.math-symbol, 
          #explanation-editor span.math-symbol,
          [id^="option-editor-"] span.math-symbol {
            user-select: none;
            pointer-events: auto;
          }
        `}</style>
        <div className="block-content">
          <div className="row">
            <div className="col-sm-12">
              <div className="form-group">
                <div
                  className="alert alert-info"
                  style={{ padding: "8px 12px", marginBottom: "2px" }}
                >
                  <strong>
                    Câu {this.state.questionNo} - Trắc nghiệm
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
                      <button
                        type="button"
                        className={`btn ${this.state.showPreview ? 'btn-success' : 'btn-outline-primary'} mr-2`}
                        style={{ height: "40px", padding: "8px" }}
                        onClick={() => {
                          this.setState({
                            showPreview: !this.state.showPreview
                          }, () => {
                            if (this.state.showPreview) {
                              this.renderPreviewContent();
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
                      onChange={this._handleEditorContentChange}
                      setOptions={{
                        buttonList: baseHelpers.getSunEditorOptions(),
                        katex: katex,
                        showPathLabel: false,
                        addTagsWhitelist: 'span|svg|path|symbol|use',
                        attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                        onClick: (e) => this.handleMathClick(e, "question"),
                      }}
                    />
                    {this.state.showPreview && (
                      <div className="mt-3">
                        <div className="card border-info">
                          <div className="card-header bg-info text-white">
                            <strong>Preview - Xem trước nội dung</strong>
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

          <div className="row mt-1">
            <div className="col-sm-12">
              <div className="form-group">
                <label className="col-form-label">Các lựa chọn</label>
                <div className="options-container">
                  {this.state.options.map((option) => (
                    <div key={option.id}>
                      <div className="option-row d-flex align-items-start mb-2">
                        <div className="option-input flex-grow-1 mr-2">
                          <div
                            className={`input-group ${this.state.answer === option.id
                              ? "border-primary"
                              : ""
                              }`}
                          >
                            <div className="input-group-prepend">
                              <span
                                className={`input-group-text ${this.state.answer === option.id
                                  ? "bg-primary text-white"
                                  : ""
                                  }`}
                                onClick={() =>
                                  this.setState({ answer: option.id })
                                }
                                style={{ cursor: "pointer" }}
                              >
                                {option.id}
                              </span>
                            </div>
                            <div className="flex-grow-1">
                              <SunEditor
                                id={`option-editor-${option.id}`}
                                getSunEditorInstance={(sunEditor) => {
                                  if (!this[`optionEditor_${option.id}`]) {
                                    this[`optionEditor_${option.id}`] = sunEditor;
                                  }
                                  this.attachMathClickListener(sunEditor, "option", option.id);
                                }}
                                onImageUploadBefore={this.handleImageUploadBefore}
                                height={"80px"}
                                defaultValue={option.text}
                                onChange={(content) => this.handleOptionEditorChange(option.id, content)}
                                setOptions={{
                                  buttonList: [],
                                  katex: katex,
                                  showPathLabel: false,
                                  addTagsWhitelist: 'span',
                                  attributesWhitelist: {
                                    all: 'style|class|data-latex|data-*|aria-hidden|id',
                                    span: 'style|class|data-latex|data-*',
                                  },
                                  onClick: (e) =>
                                    this.handleMathClick(e, "option", option.id),
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="option-actions flex-shrink-0 d-flex flex-column">
                          <button
                            type="button"
                            className="btn btn-primary mt-2"
                            style={{ height: "30px", padding: "0 8px", fontSize: "14px" }}
                            onClick={() =>
                              this.toggleMathFieldForOption(option.id)
                            }
                            title="Chèn công thức"
                          >
                            ∑
                          </button>
                          <button
                            type="button"
                            className={`btn ${this.state.showPreviewOptions[option.id] ? 'btn-success' : 'btn-outline-primary'} mt-1`}
                            style={{ height: "30px", padding: "0 8px" }}
                            onClick={() => {
                              this.setState({
                                showPreviewOptions: {
                                  ...this.state.showPreviewOptions,
                                  [option.id]: !this.state.showPreviewOptions[option.id]
                                }
                              }, () => {
                                if (this.state.showPreviewOptions[option.id]) {
                                  this.renderPreviewOption(option.id);
                                }
                              });
                            }}
                            title="Xem trước"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                          {this.state.options.length > 2 && (
                            <button
                              type="button"
                              className={`btn mt-1 ${
                                // Kiểm tra xem có thể xóa option này không
                                this.state.options.length <= 2 ||
                                  option.id !== this.state.options[this.state.options.length - 1].id
                                  ? "btn-secondary" // Background trắng cho option không thể xóa
                                  : "btn-outline-danger" // Màu đỏ cho option có thể xóa
                                }`}
                              style={{
                                height: "30px",
                                padding: "0 8px",
                                fontSize: "12px",
                                backgroundColor: this.state.options.length <= 2 ||
                                  option.id !== this.state.options[this.state.options.length - 1].id
                                  ? "#fff" : "", // Background trắng
                                borderColor: this.state.options.length <= 2 ||
                                  option.id !== this.state.options[this.state.options.length - 1].id
                                  ? "#adb5bd" : "", // Border xám nhạt
                                color: this.state.options.length <= 2 ||
                                  option.id !== this.state.options[this.state.options.length - 1].id
                                  ? "#adb5bd" : "", // Icon xám nhạt
                                cursor: this.state.options.length <= 2 ||
                                  option.id !== this.state.options[this.state.options.length - 1].id
                                  ? "not-allowed" : "pointer" // Cursor thay đổi
                              }}
                              onClick={() => this.removeOption(option.id)}
                              title={
                                this.state.options.length <= 2 ||
                                  option.id !== this.state.options[this.state.options.length - 1].id
                                  ? "Chỉ có thể xóa lựa chọn cuối cùng"
                                  : "Xóa lựa chọn"
                              }
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      {this.state.showMathFieldOptions[option.id] && (
                        <div className="mt-1 d-flex align-items-center mb-2 ml-4">
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
                      {this.state.showPreviewOptions[option.id] && (
                        <div className="mt-2 ml-4">
                          <div className="card border-info">
                            <div className="card-header bg-info text-white" style={{ padding: "5px 10px" }}>
                              <small><strong>Preview - Lựa chọn {option.id}</strong></small>
                            </div>
                            <div
                              id={`preview-option-${option.id}`}
                              className="card-body"
                              style={{
                                minHeight: "50px",
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dee2e6",
                                borderRadius: "4px",
                                padding: "10px",
                                fontSize: "14px"
                              }}
                            >
                              Nội dung sẽ hiển thị ở đây...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="row mt-2">
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm"
                      onClick={this.addOption}
                    >
                      <i className="fa fa-plus"></i> Thêm lựa chọn
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
                  <div
                    className="card-body"
                    style={{
                      minHeight: "320px", // cố định chiều cao vùng giải thích
                      display: "block",
                    }}
                  >
                    <div className="mb-2">
                      <button
                        type="button"
                        className="btn btn-primary"
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
                      <button
                        type="button"
                        className={`btn ${this.state.showPreviewExplanation ? 'btn-success' : 'btn-outline-primary'} ml-2`}
                        style={{ height: "40px", padding: "8px" }}
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
                      <div
                        className="mb-3"
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <math-field
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
                      height="250px"
                      defaultValue={this.state.explanation}
                      onChange={this.handleExplanationEditorChange}
                      setOptions={{
                        buttonList: baseHelpers.getSunEditorOptions(),
                        katex: katex,
                        showPathLabel: false,
                        addTagsWhitelist: 'span|svg|path|symbol|use',
                        attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                        onClick: (e) => this.handleMathClick(e, "explanation"),
                      }}
                    />
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
                <div>
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
                    this.createQuestion();
                  }}
                >
                  Lưu & Thêm mới
                </button>
              )}
              <button
                id="close_create"
                className="btn btn-light mt-2 ml-2"
                data-dismiss="modal"
                onClick={this.closeModal}
              >
                Bỏ qua
              </button>
            </div>
          </div>
        </div>
      </>
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
  connect(mapStateToProps, mapDispatchToProps)(ModalQuestion1)
);
