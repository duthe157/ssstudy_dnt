import $ from "jquery";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";
import {
  createExamWord,
  getExamWordDetail,
  listExamWord,
  exportWord,
  updateExamWord,
} from "../../redux/examword/action";
import { listGift } from "../../redux/fastGift/action";
import { listSubject } from "../../redux/subject/action";
import { notification, Modal } from "antd";
import renderMathInElement from "katex/dist/contrib/auto-render";
import "katex/dist/katex.min.css";
import katex from "katex";
import queryString from "query-string";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { baseURL } from "../../config/config";
import baseHelpers from "../../helpers/BaseHelpers";
import {
  listExamCategory,
  showExamCategory,
} from "../../redux/examwordcategory/action";
import { listExamTestCategory } from "../../redux/examwordtestcategory/action";
import { setLoader } from "../LoadingContext";
import ModalGroupQuestion from "./ModalGroupQuestion";
import ModalQuestion1 from "./ModalQuestion1";
import ModalQuestion2 from "./ModalQuestion2";
import ModalQuestion3 from "./ModalQuestion3";
import ModalQuestion4 from "./ModalQuestion4";
import ModalQuestion5 from "./ModalQuestion5";
import ModalQuestion6 from "./ModalQuestion6";
import ModalQuestion7 from "./ModalQuestion7";
import QuestionNumberingService from "./QuestionNumberingService";
import "./RenumberQuestions.css";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn";

class ExamWordEdit extends Component {
  onChangeHandler = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      this.setState({
        fileData: null,
        fileError: "Chỉ chấp nhận file Word (.doc, .docx)",
      });
      notification.error({
        message: "Định dạng file không hợp lệ",
        description: "Vui lòng chọn file Word (.doc, .docx)",
        placement: "topRight",
      });
      event.target.value = null;
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.setState({
        fileData: null,
        fileError: `File quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa 10MB`,
      });
      notification.error({
        message: "File quá lớn",
        description: `Dung lượng: ${(file.size / 1024 / 1024).toFixed(1)}MB (tối đa 10MB)`,
        placement: "topRight",
        duration: 8,
      });
      event.target.value = null;
      return;
    }

    this.setState({
      fileData: file,
      fileError: null,
      isUploaded: false,
    });

    notification.info({
      message: "File đã chọn",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      placement: "topRight",
      duration: 3,
    });
  };

  handleUpload = async () => {
    const { fileData, isUploading } = this.state;
    if (!fileData || isUploading) return;

    const maxSize = 10 * 1024 * 1024;
    if (fileData.size > maxSize) {
      notification.error({
        message: "File quá lớn để upload",
        description: `Dung lượng: ${(fileData.size / 1024 / 1024).toFixed(
          1,
        )}MB (tối đa 10MB)`,
        placement: "topRight",
      });
      return;
    }

    this.setState({ isUploading: true });

    try {
      const formData = new FormData();
      formData.append("docxFile", fileData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`${baseURL}/docx-question/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 413) {
        throw new Error(
          `File quá lớn (${(fileData.size / 1024 / 1024).toFixed(
            1,
          )}MB). Server chỉ chấp nhận tối đa 10MB.`,
        );
      }

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("File không đúng định dạng hoặc bị lỗi");
        } else if (res.status === 500) {
          throw new Error("Lỗi server, vui lòng thử lại sau");
        } else {
          throw new Error(`Upload thất bại (${res.status})`);
        }
      }

      const responseData = await res.json();
      const { valid, errors, warnings, sections } =
        this.validateApiResponse(responseData);
      if (!valid && errors.length > 0) {
        throw new Error(errors.join(", "));
      }
      if (!sections || sections.length <= 0) {
        notification.error({
          message: "Đề thi không đúng quy chuẩn",
          description:
            "File Word không chứa nội dung đề thi hợp lệ hoặc không đúng định dạng. Vui lòng kiểm tra lại file và thử lại.",
          placement: "topRight",
          duration: 5,
        });
        this.setState({ isUploading: false });
        return;
      }

      const partsFromApi = responseData.parts || [];
      const normalizedParts = this.normalizeParts(partsFromApi);

      const sectionsWithUploadedFlag = sections.map((section) => ({
        ...section,
        uploaded: true,
        classification: section.classification || { type: section.type },
      }));
      if (sectionsWithUploadedFlag.length <= 0) {
        notification.error({
          message: "Đề thi không đúng quy chuẩn",
          description:
            "Không thể xử lý nội dung đề thi từ file Word. Vui lòng kiểm tra định dạng file và thử lại.",
          placement: "topRight",
          duration: 5,
        });
        this.setState({ isUploading: false });
        return;
      }
      this.setState(
        {
          showConfigModal: true,
          isUploaded: true,
          uploaded: true,
          isUploading: false,
          parts: normalizedParts,
          sections: sectionsWithUploadedFlag,
          tabData: [], // Clear existing tabData completely
          apiValidationErrors: [...(errors || []), ...(warnings || [])],
        },
        () => {
          if (sectionsWithUploadedFlag.length > 0) {
            const firstSection = sectionsWithUploadedFlag[0];
            this.setState({
              selectedSectionId: firstSection._id || firstSection.id,
              examSectionId: firstSection._id || firstSection.id,
              selectedSectionType: firstSection.type,
            });
          }

          if (sectionsWithUploadedFlag.length > 0) {
            this.convertSectionsToTabData(sectionsWithUploadedFlag);
            setTimeout(
              () => this.debugSectionNumbering && this.debugSectionNumbering(),
              100,
            );
          }
        },
      );

      notification.success({
        message: "Tải file thành công",
        placement: "topRight",
        duration: 3,
      });
    } catch (error) {
      this.setState({ isUploading: false });

      if (error.name === "AbortError") {
        notification.error({
          message: "Upload timeout",
          description:
            "File quá lớn hoặc mạng chậm. Vui lòng thử file nhỏ hơn.",
          placement: "topRight",
          duration: 6,
        });
      } else if (
        error.message.includes("413") ||
        error.message.includes("quá lớn")
      ) {
        notification.error({
          message: "File quá lớn",
          description: error.message,
          placement: "topRight",
          duration: 8,
        });
      } else {
        notification.error({
          message: "Lỗi khi tải file",
          description:
            "File lỗi, vui lòng kiểm tra lại thông tin các lỗi thường gặp trong tài liệu",
          placement: "topRight",
        });
      }
    }
  };

  constructor(props) {
    super();
    if (
      typeof document !== "undefined" &&
      !document.getElementById("cluster-styles")
    ) {
      const styleElement = document.createElement("style");
      styleElement.id = "cluster-styles";
      styleElement.innerHTML = `
        .cluster-question {
          background-color: #f8f9fa !important;
        }
        
        .child-question-row {
          background-color: #fafafa !important;
        }
        
        .placeholder-row {
          background-color: #fff3cd !important;
          border-left: 3px solid #ffc107 !important;
        }
        
        .placeholder-row:hover {
          background-color: #ffeaa7 !important;
        }
        
        .cursor-pointer {
          cursor: pointer !important;
        }
        
        .fa-chevron-down, .fa-chevron-right {
          transition: transform 0.2s ease;
        }
        
        .fa-chevron-down:hover, .fa-chevron-right:hover {
          transform: scale(1.1);
        }
        
        .badge-warning {
          background-color: #ffc107 !important;
          color: #000 !important;
        }
        
        /* Styles cho modal chọn loại câu hỏi */
        #select-question-type-modal .question-type-btn {
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px solid #007bff;
          transition: all 0.3s;
        }
        
        #select-question-type-modal .question-type-btn:hover {
          background-color: #007bff;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,123,255,0.3);
        }
        
        #select-question-type-modal .question-type-btn i {
          font-size: 24px;
          margin-bottom: 8px;
        }
      `;
      document.head.appendChild(styleElement);
    }

    this.state = {
      e_cheating: false,
      time: 0,
      pointTrueFalse: false,
      pointTrueFalse1: 10,
      pointTrueFalse2: 25,
      pointTrueFalse3: 50,
      pointTrueFalse4: 100,
      name: "",
      code: "",
      started_at: "",
      finished_at: "",
      alias: "",
      keyword: "",
      subject_id: "",
      subject_name: "",
      subject_code: "",
      category_id: "",
      creating_type: "MAC_DINH",
      examQuestions: [],
      questionNo: 1,
      fileData: "",
      doc_type: "GOOGLE_DRIVE",
      group: "MAC_DINH",
      classes: null,
      selectedQuestions: [],
      uploaded: false,
      isUploading: false,
      fileError: null,
      currentQuestionvalue: null,
      type_question: "",
      sectionType: "MAC_DINH",
      exam: null,
      section: null,
      tabData: [],
      statusTabCreate: true,
      examId: "",
      examSectionId: "",
      examSectionGroupId: "",
      examSectionSubjectId: "",
      newTabName: "",
      typeExam: "",
      linkExam: "",

      linkExam2: "",
      linkAnswer: "",
      TN: "TOT_NGHIEP",
      HSA: "HSA",
      APT: "APT",
      TSA: "TSA",
      itemGroupTabData: null,
      actionUser: "CREATE",
      deleteQuestionIds: [],
      actionGroup: "create",
      actionQuestion: "create",
      groupDetail: null,
      category: "",
      parts: [],
      examTypeId: "",
      level: "",
      examTypeOptions: [],
      isUploaded: false,
      showModal: false,
      tp: "",
      provinces: [], // ✅ THÊM: State cho danh sách tỉnh thành từ API
      allProvinces: [], // ✅ THÊM: State cho tất cả provinces
      provinceSearchTerm: "", // ✅ THÊM: State cho từ khóa tìm kiếm
      searchResults: [], // ✅ THÊM: State cho kết quả tìm kiếm
      showProvinceDropdown: false, // ✅ THÊM: State để hiển thị dropdown
      showProvinceSearch: false, // ✅ THÊM: State để hiển thị search trong select
      levelOptions: [],
      showDeleteSectionModal: false,
      expandedClusters: {}, // ✅ THÊM: State để track cluster expand/collapse
      showGroupModal: false,
      selectedSectionId: null,
      notification: "",
      selectedGroup: null,
      selectedSubject: null,
      sections: [],
      groups: [],
      showConfigModal: false,
      showAddSubSectionModal: false,
      subSectionName: "",
      selectedParentSectionId: null,
      currentSubSectionId: null,
      currentCreationMode: "MAC_DINH",
      deleteQuestionSubSectionId: null,
      timeMode: "TOTAL",
      timeTotal: 0,
      questionScorePart: [],
      timePerPart: [],
      scorePerPart: [],
      titlePerPart: [], // ✅ THÊM: State cho tiêu đề mỗi phần
      statusExam: false, // ✅ THÊM: State cho chế độ thời gian
      groupTopic: [],
      listSubjectGroups: {},
      selectedGroupSubject: "",
      statusTopic: "",
      idTopicGroup: "",
      renderTrigger: 0, // ✅ THÊM: Trigger để force re-render sau drag
      idSubject: "",
      activeSubjects: {},
      questionIdGroupTopic: "",
      selectedChildQuestionForTypeSelection: null, // ✅ Track child question đang được chọn loại
      showChildQuestionTypeModal: false, // ✅ THÊM: State cho modal chọn loại câu hỏi từ ExamCreate
      parentId: "",
      editingSectionId: null, // ID của section đang được edit
      editingSectionName: "", // Tên mới đang được edit
      showRenumberModal: false,
      renumberStartingNumber: 1,
      renumberSectionType: null,
      renumberGroupIdx: null,
      renumberSubjectIdx: null,
      renumberSubSectionId: null,
      practiceConfig: false,
      startDate: "",
      endDate: "",
      resultDisplay: "LATER",
      answerDisplay: "LATER",
      requirePassword: false,
      examPassword: "",
      showEndDateTooltip: false,
      showPreviewModal: false,
      previewData: null,
      renderPreview: false,
      fastGiftStatus: false,
      fastGifts_id: null,
    };

    // Timeout references để tránh memory leak
    this.previewTimeout = null;
  }

  generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000)
      .toString(16)
      .padStart(8, "0");
    const random = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    return timestamp + random;
  };

  isValidObjectId = (id) => {
    return (
      typeof id === "string" && id.length === 24 && /^[a-f0-9]{24}$/i.test(id)
    );
  };

  ensureValidObjectId = (id) => {
    return this.isValidObjectId(id) ? id : this.generateObjectId();
  };

  formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      if (typeof dateString === "string") {
        // Tạo Date object từ ISO string
        const date = new Date(dateString);

        // Kiểm tra nếu date không hợp lệ
        if (isNaN(date.getTime())) {
          return "";
        }

        // Lấy local date/time từ browser (tự động adjust timezone)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      return "";
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "";
    }
  };
  createRandomPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const allChars = uppercase + lowercase + numbers;
    var password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    for (let i = 3; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    return password;
  };
  copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        notification.success({
          message: "Đã sao chép mật khẩu vào bộ nhớ đệm!",
          placement: "topRight",
          duration: 3,
        });
      })
      .catch(() => {
        notification.error({
          message: "Không thể sao chép mật khẩu vào bộ nhớ đệm!",
          placement: "topRight",
          duration: 3,
        });
      });
  };

  getNextQuestionNumber = () => {
    const questions = this.getQuestionsForCurrentSelection();
    if (!Array.isArray(questions)) return 1;
    let maxNumber = 0;
    questions.forEach((question) => {
      if ((question.type || "").toUpperCase() !== "CLUSTER") {
        const currentNumber = question.number || question.question_no || 0;
        if (currentNumber > maxNumber) {
          maxNumber = currentNumber;
        }
      }
    });

    if (maxNumber === 0) {
      return this.getStartingQuestionNumber();
    }
    return maxNumber + 1;
  };
  getStartingQuestionNumber = () => {
    const questions = this.getQuestionsForCurrentSelection();
    if (!Array.isArray(questions) || questions.length === 0) return 1;
    const questionsWithNumber = questions.filter(
      (q) =>
        (q.type || "").toUpperCase() !== "CLUSTER" &&
        (q.number > 0 || q.question_no > 0),
    );

    if (questionsWithNumber.length === 0) return 1;
    let minNumber = Number.MAX_SAFE_INTEGER;
    questionsWithNumber.forEach((question) => {
      const currentNumber = question.number || question.question_no || 0;
      if (currentNumber > 0 && currentNumber < minNumber) {
        minNumber = currentNumber;
      }
    });
    const startingNumber =
      minNumber === Number.MAX_SAFE_INTEGER ? 1 : minNumber;
    return startingNumber;
  };
  getQuestionsForCurrentSelection = () => {
    try {
      const { selectedSectionId, tabData } = this.state;
      if (!selectedSectionId || !Array.isArray(tabData)) return [];

      const currentTab = tabData.find((tab) => tab._id === selectedSectionId);
      if (!currentTab) return [];
      if (currentTab.exam_section_type === "NHOM_CHU_DE") {
        let allQuestions = [];

        if (currentTab.groupTopic && Array.isArray(currentTab.groupTopic)) {
          currentTab.groupTopic.forEach((group, groupIdx) => {
            const activeSubjectIdx = this.state.activeSubjects?.[groupIdx] ?? 0;
            const activeSubject = group.subjects?.[activeSubjectIdx];

            if (activeSubject && activeSubject.questions) {
              allQuestions = [...allQuestions, ...activeSubject.questions];
            }
          });
        }

        return allQuestions;
      }
      return Array.isArray(currentTab.questions) ? currentTab.questions : [];
    } catch (error) {
      console.error("[ERROR] getQuestionsForurrentSelection:", error);
      return [];
    }
  };
  generateParentIdForChild(clusterQuestionId) {
    return clusterQuestionId;
  }
  toggleExpanded = (questionId) => {
    const key = String(questionId);

    this.setState(
      (prevState) => {
        const expandedState = prevState.expandedClusters || {};
        const currentExpanded = this.isClusterExpanded(key);

        const newState = {
          ...expandedState,
          [questionId]: !currentExpanded, // Toggle trạng thái hiện tại
        };

        return {
          expandedClusters: newState,
        };
      },
      () => { },
    );
  };
  handlePreviewExam = () => {
    const { selectedSectionId, tabData } = this.state;
    if (!selectedSectionId || !Array.isArray(tabData)) {
      notification.warning({
        message: "Không có dữ liệu để xem trước",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    const currentTab = tabData.find((tab) => tab._id === selectedSectionId);
    if (!currentTab) {
      notification.warning({
        message: "Không tìm thấy phần thi hiện tại",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    this.setState(
      {
        showPreviewModal: true,
        previewData: currentTab,
        renderPreview: false,
      },
      () => {
        this.previewTimeout = setTimeout(() => {
          this.setState({ renderPreview: true });
        }, 100);
      },
    );
  };

  closePreviewModal = () => {
    // Clear timeout để tránh memory leak
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    this.setState({
      showPreviewModal: false,
      previewData: null,
      renderPreview: false,
    });
  };
  hasChildQuestions = (clusterId) => {
    const currentQuestions = this.getQuestionsForCurrentSelection();
    if (!currentQuestions || !clusterId) return false;

    const normalizeId = (id) => {
      if (id === null || id === undefined) return null;
      return String(id);
    };

    const cId = normalizeId(clusterId);
    const hasChildren = currentQuestions.some((q) => {
      const pId = normalizeId(q.parentId || q.parent_id);
      const matches = pId !== null && pId === cId;

      return matches;
    });

    return hasChildren;
  };
  getChildQuestionsCount = (clusterId) => {
    const currentQuestions = this.getQuestionsForCurrentSelection();
    if (!currentQuestions || !clusterId) return 0;

    const normalizeId = (id) => {
      if (id === null || id === undefined) return null;
      return String(id);
    };

    const cId = normalizeId(clusterId);
    const count = currentQuestions.filter((q) => {
      const pId = normalizeId(q.parentId || q.parent_id);
      return pId !== null && pId === cId;
    }).length;

    return count;
  };

  isClusterExpanded = (clusterId) => {
    if (!clusterId) return true; // Default expand nếu không có ID
    const clusterKey = String(clusterId);
    const expandedState = this.state.expandedClusters || {};
    if (expandedState.hasOwnProperty(clusterKey)) {
      return expandedState[clusterKey];
    }
    return true;
  };

  renderQuestionType = (type) => {
    if (
      !type ||
      type === null ||
      type === undefined ||
      type === "" ||
      type === " "
    ) {
      return "Chưa chọn loại";
    }

    const t = String(type).toUpperCase();
    switch (t) {
      case "SINGLECHOICE":
        return "Trắc nghiệm";
      case "TRUEFALSEMULTI":
        return "TN đúng sai";
      case "FILLINBLANK":
        return "Điền số/Trả lời ngắn";
      case "DRAGDROP":
        return "Kéo thả";
      case "MULTIPLECHOICE":
        return "TN nhiều đáp án";
      case "TRUEFALSE":
        return "Đúng sai";
      case "CLUSTER":
        return "Câu hỏi chùm";
      default:
        return type;
    }
  };

  renderQuestionLevel = (level) => {
    let lvl = level;
    if (!lvl) return "";
    if (typeof lvl === "object") {
      if (lvl.difficultyLabel && String(lvl.difficultyLabel).trim() !== "") {
        return String(lvl.difficultyLabel);
      }
      if (lvl.question_level) lvl = lvl.question_level;
      else if (lvl.level) lvl = lvl.level;
      else return "";
    }
    if (typeof lvl !== "string") lvl = String(lvl);
    const key = lvl.trim().toUpperCase();

    switch (key) {
      case "NHAN_BIET":
      case "NB":
        return "Nhận biết";
      case "THONG_HIEU":
      case "TH":
        return "Thông hiểu";
      case "VAN_DUNG":
      case "VD":
        return "Vận dụng";
      case "VAN_DUNG_CAO":
      case "VDC":
        return "Vận dụng cao";
      case "THONG_THUONG":
        return " ";
      default:
        return lvl;
    }
  };

  decodeHtmlEntities = (input, maxDepth = 5) => {
    if (!input) return "";
    let decoded = input;
    const textarea = document.createElement("textarea");
    for (let i = 0; i < maxDepth; i++) {
      textarea.innerHTML = decoded;
      const value = textarea.value;
      if (value === decoded) break;
      decoded = value;
    }
    return decoded;
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
      { start: "\\[", end: "\\]", display: true }, // Display mode
      { start: "\\(", end: "\\)", display: false }, // Inline mode
      { start: "$$", end: "$$", display: true }, // Display mode
      { start: "$", end: "$", display: false }, // Inline mode
    ];

    // Xử lý từng delimiter
    delimiters.forEach(({ start, end, display }) => {
      try {
        // Escape special regex characters properly
        const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Use [\s\S]*? to match any character including newlines
        const regex = new RegExp(
          escapedStart + "([\\s\\S]*?)" + escapedEnd,
          "g",
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
        console.error("Regex creation error:", error);
      }
    });

    return processedContent;
  };

  normalizeQuestionForModal = (q = {}) => {
    const clone = { ...(q || {}) };
    if (q.parentId !== undefined) {
      clone.parentId = q.parentId;
    }
    if (q.number !== undefined) {
      clone.number = q.number;
    }
    if (q.question_no !== undefined) {
      clone.question_no = q.question_no;
    }
    if (!clone.type && !clone.isPlaceholder && !clone.needsEditing) {
      clone.type = "";
    }
    if (!Array.isArray(clone.choices)) {
      if (
        Array.isArray(clone.correctAnswers) &&
        clone.correctAnswers.length > 0
      ) {
        clone.choices = clone.correctAnswers.map((ans, index) => ({
          label: String.fromCharCode(65 + index), // A, B, C...
          text: typeof ans === "string" ? ans : String(ans || ""),
          value: ans,
        }));
      } else {
        clone.choices = [
          { label: "A", text: "" },
          { label: "B", text: "" },
          { label: "C", text: "" },
          { label: "D", text: "" },
        ];
      }
    }
    if (clone.correctAnswers === undefined) {
      clone.correctAnswers = clone.answer || [];
    }
    const levelValue = clone.level || clone.question_level || "";
    clone.level = levelValue;
    clone.question_level = levelValue;
    clone.rawHtml =
      clone.rawHtml || clone.plainText || clone.content || clone.question || "";
    clone.video_link = clone.video_link || clone.video || "";
    clone.options = clone.choices; // Alias for modal compatibility
    if (clone.type === "cluster" || clone.type === "Cluster") {
      if (
        clone.childQuestions &&
        Array.isArray(clone.childQuestions) &&
        clone.childQuestions.length > 0
      ) {
        clone.disableChildCount = true;
        clone.childQuestionCount = clone.childQuestions.length;
      } else {
        clone.disableChildCount = false;
        clone.childQuestionCount = clone.childQuestionCount || 1;
      }
    }

    return clone;
  };
  handleOpenModalCreateQuestion = function (
    type,
    mode = "MAC_DINH",
    subSectionId = null,
  ) {
    try {
      const t = (type || "").toString().toUpperCase();
      const trigger = (id) => $(id).trigger("click");
      let sectionId =
        this.state.selectedSectionId ||
        this.state.examSectionId ||
        (Array.isArray(this.state.tabData) && this.state.tabData.length > 0
          ? this.state.tabData[0]._id
          : null);
      const sections = Array.isArray(this.state.sections)
        ? this.state.sections
        : [];
      const tabData = Array.isArray(this.state.tabData)
        ? this.state.tabData
        : [];
      const selectedIndex = sections.findIndex(
        (s) => s.id === this.state.selectedSectionId,
      );
      if (selectedIndex >= 0 && selectedIndex < tabData.length) {
        sectionId = tabData[selectedIndex]._id || sectionId;
      }
      let subjectId = this.getCurrentSubjectId();
      if (!subjectId && sectionId) {
        const currentTab = tabData.find((tab) => tab._id === sectionId);
        if (currentTab && currentTab.subject_id) {
          subjectId = currentTab.subject_id;
          this.setCurrentSubjectId(subjectId);
        }
      }
      let questionNo;
      if (mode === "SubSection" && subSectionId) {
        questionNo = this.getQuestionNoNewForSubSection(subSectionId);
      } else {
        questionNo = this.getQuestionNoNew(
          sectionId,
          this.state.examSectionGroupId,
          subjectId,
        );
      }

      this.setState(
        {
          examSectionId: sectionId,
          examSectionSubjectId: subjectId,
          subject_id: subjectId, // ✅ THÊM: Đồng bộ subject_id
          questionNo,
          actionQuestion: "create",
          statusTopic: null, // ✅ Reset về mặc định để modal route đúng (không nhóm chủ đề)
          currentQuestionvalue: null,
          currentSubSectionId: mode === "SubSection" ? subSectionId : null,
          currentCreationMode: mode,
          currentClusterId: null,
        },
        () => {
          if (t === "SINGLECHOICE") {
            trigger("#create-update");
            return;
          }

          if (t === "MULTIPLECHOICE") {
            trigger("#create-update5");
            return;
          }

          if (t === "DRAGDROP" || t === "TN_DRAG_DROP") {
            trigger("#create-update4");
            return;
          }

          if (t === "FILLINBLANK") {
            trigger("#create-update3");
            return;
          }

          if (t === "TRUEFALSE") {
            trigger("#create-update6");
            return;
          }

          if (t === "TRUEFALSEMULTI") {
            trigger("#create-update2");
            return;
          }

          if (t === "CLUSTER") {
            trigger("#create-update7");
            return;
          }
          trigger("#create-update");
        },
      );
    } catch (e) { }
  };
  handleClusterQuestionCreation = async (dataQuestion) => {
    try {
      const clusterId = `cluster-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const clusterQuestion = {
        ...dataQuestion,
        _id: clusterId,
        question_id: clusterId,
        questionId: clusterId, // ✅ QUAN TRỌNG: Set questionId = _id để nhất quán
        type: "cluster",
        created_at: new Date().toISOString(),
        isTemp: true,
        parentId: null,
        number: 0, // ✅ SỬA: Cluster questions có number = 0
        question_no: null, // ✅ SỬA: Cluster questions không có question_no
        clusterPassage:
          dataQuestion.clusterPassage || dataQuestion.rawHtml || "",
        rawHtml: dataQuestion.clusterPassage || dataQuestion.rawHtml || "",
        correctAnswers: [],
        choices: [],
        explanation: dataQuestion.explanation || "",
        level: dataQuestion.level || "",
      };
      if (
        dataQuestion.childQuestions &&
        Array.isArray(dataQuestion.childQuestions)
      ) {
        const childQuestions = dataQuestion.childQuestions.map(
          (child, index) => {
            const childId = `child-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;

            const childQuestion = {
              ...child,
              _id: childId,
              question_id: childId,
              questionId: childId, // ✅ QUAN TRỌNG: Set questionId = _id
              parentId: this.generateParentIdForChild(clusterId), // ✅ SỬ DỤNG METHOD: parentId = cluster questionId
              question_no: index + 1,
              created_at: new Date().toISOString(),
              isTemp: true,
              type: child.type || null, // ✅ SỬA: Không set mặc định, để null nếu chưa có
              rawHtml: child.rawHtml || child.question || "",

              correctAnswers:
                child.correctAnswers || child.selectedAnswers || [],
              choices: child.choices || [],
              explanation: child.explanation || "",
              level: child.level || "",
              isPlaceholder: !child.type, // ✅ THÊM: Placeholder nếu chưa có type
              needsEditing: !child.type,
            };
            return childQuestion;
          },
        );
        clusterQuestion.childQuestions = childQuestions;
        return {
          ...clusterQuestion,
          _childQuestions: childQuestions, // Temporary field for processing
        };
      } else if (
        dataQuestion.childQuestionCount &&
        dataQuestion.childQuestionCount > 0
      ) {
        const count = parseInt(dataQuestion.childQuestionCount) || 1;
        const childQuestions = Array.from({ length: count }, (_, index) => {
          const childId = `child-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;
          const childQuestion = {
            _id: childId,
            question_id: childId,
            parentId: this.generateParentIdForChild(clusterId),
            question_no: index + 1,
            type: null, // ✅ SỬA: KHÔNG set type mặc định, bắt buộc user chọn
            rawHtml: "",
            correctAnswers: [],
            choices: [],
            explanation: "",
            level: "",
            created_at: new Date().toISOString(),
            isTemp: true,
            __temp: true,
            isPlaceholder: true, // ✅ Đánh dấu là placeholder để edit sau
            needsEditing: true,
            questionId: childId, // API format
          };
          return childQuestion;
        });
        clusterQuestion.childQuestions = childQuestions;
        return {
          ...clusterQuestion,
          _childQuestions: childQuestions, // Temporary field for processing
        };
      }
      const childId = `child-${Date.now()}-0-${Math.floor(Math.random() * 10000)}`;

      const fallbackChildQuestions = [
        {
          _id: childId,
          question_id: childId,
          parentId: this.generateParentIdForChild(clusterId),
          question_no: 1,
          created_at: new Date().toISOString(),
          isTemp: true,
          type: null,
          rawHtml: "",
          correctAnswers: [],
          choices: [],
          explanation: "",
          level: "",
          questionId: childId,
          isPlaceholder: true,
          needsEditing: true,
        },
      ];
      clusterQuestion.childQuestions = fallbackChildQuestions;

      return {
        ...clusterQuestion,
        _childQuestions: fallbackChildQuestions,
      };
    } catch (error) {
      console.error("[ERROR] handleClusterQuestionCreation failed:", error);
      throw error;
    }
  };

  handleOpenModalCreateQuestionTopicGroup = function (
    type,
    mode = "MAC_DINH",
    topicGroupId = null,
    subjectId = null,
    group = null, // 👈 nhận thêm group
  ) {
    try {
      const t = (type || "").toString().toUpperCase();
      const trigger = (id) => $(id).trigger("click");
      let finalSubjectId = subjectId;
      if (!finalSubjectId) {
        finalSubjectId = this.getCurrentSubjectId();
      }
      if (!finalSubjectId) {
        console.error(
          "[ERROR] Subject ID is null or undefined for topic group",
        );
        notification.error({
          message: "Lỗi cấu hình môn học",
          description:
            "Không thể xác định môn học cho câu hỏi nhóm chủ đề. Vui lòng chọn môn học trước khi tạo câu hỏi.",
          placement: "topRight",
        });
        return;
      }
      const questionNo = this.getQuestionNoForTopicGroupSubject(finalSubjectId);

      this.setState(
        {
          idTopicGroup: topicGroupId,
          idSubject: finalSubjectId,
          examSectionSubjectId: finalSubjectId, // ✅ THÊM: Đồng bộ examSectionSubjectId
          subject_id: finalSubjectId, // ✅ THÊM: Đồng bộ subject_id
          questionNo,
          statusTopic: "MAC_DINH",
          actionQuestion: "create",
          currentQuestionvalue: null,
          currentCreationMode: mode,
          listSubjectGroups:
            finalSubjectId && group?.subjects
              ? group.subjects.filter((s) => s.idSubject === finalSubjectId)
              : group?.subjects || [],
        },
        () => {
          switch (t) {
            case "SINGLECHOICE":
              trigger("#create-update");
              break;
            case "MULTIPLECHOICE":
              trigger("#create-update5");
              break;
            case "DRAGDROP":
            case "TN_DRAG_DROP":
              trigger("#create-update4");
              break;
            case "FILLINBLANK":
              trigger("#create-update3");
              break;
            case "TRUEFALSE":
              trigger("#create-update6");
              break;
            case "TRUEFALSEMULTI":
              trigger("#create-update2");
              break;
            case "CLUSTER":
              trigger("#create-update7");
              break;
            default:
              trigger("#create-update");
          }
        },
      );
    } catch (e) {
      console.warn("handleOpenModalCreateQuestionTopicGroup error:", e);
    }
  };
  handleOpenModalSelectQuestionType = (childQuestion, subSectionId = null) => {
    this.setState({
      actionQuestion: "update",
      currentQuestionvalue: childQuestion,
      currentSubSectionId: subSectionId,
      selectedChildQuestionForTypeSelection: childQuestion,
      showChildQuestionTypeModal: true, // ✅ Hiển thị modal ExamCreate
    });
  };
  closeChildQuestionTypeModal = () => {
    this.setState({
      showChildQuestionTypeModal: false,
      selectedChildQuestionForTypeSelection: null,
    });
  };
  getStartingQuestionNumberForSubSection = (subSectionId) => {
    const currentTab = this.state.tabData.find(
      (tab) => tab._id === this.state.selectedSectionId,
    );
    if (!currentTab) return 1;
    let subSection = currentTab.childExam?.find(
      (child) => child.id === subSectionId,
    );
    if (!subSection) {
      subSection = currentTab.subSections?.find(
        (sub) => sub.id === subSectionId,
      );
    }

    if (!subSection || !subSection.questions) return 1;
    const existingNumbers = subSection.questions
      .filter((q) => q.question_no && !isNaN(q.question_no))
      .map((q) => q.question_no)
      .sort((a, b) => a - b);

    const startingNumber = existingNumbers.length > 0 ? existingNumbers[0] : 1;
    return startingNumber;
  };
  handleOpenRenumberModal = (
    sectionType = null,
    groupIdx = null,
    subjectIdx = null,
    subSectionId = null,
  ) => {
    const currentTab = this.state.tabData.find(
      (tab) => tab._id === this.state.selectedSectionId,
    );
    let startingNumber = 1;

    if (currentTab) {
      if (subSectionId) {
        startingNumber = 1;
      } else if (currentTab.exam_section_type === "MAC_DINH") {
        startingNumber = this.getStartingQuestionNumber();
      } else if (currentTab.exam_section_type === "NHOM_CHU_DE") {
        if (groupIdx !== null && subjectIdx !== null) {
          startingNumber = this.getStartingQuestionNumberForGroup(
            groupIdx,
            subjectIdx,
          );
        } else if (groupIdx !== null && subjectIdx === null) {
          startingNumber = 1;
        } else {
          console.warn(`[WARN] NHOM_CHU_DE mode but missing groupIdx:`, {
            groupIdx,
            subjectIdx,
          });
          startingNumber = 1;
        }
      }
    } else {
      console.error(
        `[ERROR] Current tab not found:`,
        this.state.selectedSectionId,
      );
    }

    this.setState({
      showRenumberModal: true,
      renumberStartingNumber: startingNumber,
      renumberSectionType: sectionType,
      renumberGroupIdx: groupIdx,
      renumberSubjectIdx: subjectIdx,
      renumberSubSectionId: subSectionId,
    });
  };
  closeRenumberModal = () => {
    this.setState({
      showRenumberModal: false,
      renumberStartingNumber: 1,
      renumberSectionType: null,
      renumberGroupIdx: null,
      renumberSubjectIdx: null,
      renumberSubSectionId: null,
    });
  };
  applyRenumber = () => {
    const { renumberStartingNumber } = this.state;
    const currentTab = this.state.tabData.find(
      (tab) => tab._id === this.state.selectedSectionId,
    );

    if (!currentTab) {
      notification.warning({
        message: "Không tìm thấy phần thi hiện tại",
        placement: "topRight",
      });
      return;
    }

    let updatedTabData = [...this.state.tabData];
    if (
      this.state.renumberSectionType === "SubSection" ||
      this.state.renumberSectionType === "subSections"
    ) {
      const { renumberSubSectionId } = this.state;
      const childExam = currentTab.childExam || [];
      const subSections = currentTab.subSections || [];
      let subSectionIndex = childExam.findIndex(
        (child) => child.id === renumberSubSectionId,
      );
      let isFromChildExam = true;
      if (subSectionIndex === -1) {
        subSectionIndex = subSections.findIndex(
          (sub) => sub.id === renumberSubSectionId,
        );
        isFromChildExam = false;
      }

      if (subSectionIndex === -1) {
        notification.warning({
          message: "Không tìm thấy phần thi con để đánh số",
          placement: "topRight",
        });
        return;
      }

      const subSection = isFromChildExam
        ? childExam[subSectionIndex]
        : subSections[subSectionIndex];
      if (!subSection.questions) {
        subSection.questions = [];
        console.warn(`[WARN] subSection.questions was undefined, set to []`);
      }

      const questions = Array.isArray(subSection.questions)
        ? subSection.questions
        : [];

      if (!Array.isArray(questions) || questions.length === 0) {
        notification.warning({
          message: `Không có câu hỏi để đánh số trong phần thi con "${subSection.name || renumberSubSectionId}"`,
          placement: "topRight",
        });
        return;
      }
      let currentNumber = renumberStartingNumber;
      const updatedQuestions = questions.map((question) => {
        if ((question.type || "").toUpperCase() === "CLUSTER") {
          return { ...question }; // Cluster không đánh số
        } else {
          return {
            ...question,
            number: currentNumber,
            question_no: currentNumber++,
          };
        }
      });
      const numberedQuestions = updatedQuestions.filter(
        (q) => q.number > 0,
      ).length;
      if (isFromChildExam) {
        const updatedChildExam = childExam.map((child, idx) => {
          if (idx === subSectionIndex) {
            return {
              ...child,
              questions: updatedQuestions,
            };
          }
          return child;
        });

        updatedTabData = updatedTabData.map((tab) => {
          if (tab._id === this.state.selectedSectionId) {
            return {
              ...tab,
              childExam: updatedChildExam,
            };
          }
          return tab;
        });
      } else {
        const updatedSubSections = subSections.map((sub, idx) => {
          if (idx === subSectionIndex) {
            return {
              ...sub,
              questions: updatedQuestions,
            };
          }
          return sub;
        });

        updatedTabData = updatedTabData.map((tab) => {
          if (tab._id === this.state.selectedSectionId) {
            return {
              ...tab,
              subSections: updatedSubSections,
            };
          }
          return tab;
        });
      }
    } else if (currentTab.exam_section_type === "MAC_DINH") {
      const questions = currentTab.questions || [];
      if (!Array.isArray(questions) || questions.length === 0) {
        notification.warning({
          message: "Không có câu hỏi để đánh số 2",
          placement: "topRight",
        });
        return;
      }

      let currentNumber = renumberStartingNumber;
      const updatedQuestions = questions.map((question) => {
        if ((question.type || "").toUpperCase() === "CLUSTER") {
          return { ...question };
        } else {
          return {
            ...question,
            number: currentNumber,
            question_no: currentNumber++,
          };
        }
      });

      updatedTabData = updatedTabData.map((tab) => {
        if (tab._id === this.state.selectedSectionId) {
          return {
            ...tab,
            questions: updatedQuestions,
          };
        }
        return tab;
      });
    } else if (currentTab.exam_section_type === "NHOM_CHU_DE") {
      const { renumberGroupIdx, renumberSubjectIdx } = this.state;
      const groups = currentTab.groupTopic || [];

      if (renumberGroupIdx === null || renumberGroupIdx >= groups.length) {
        console.error(`[ERROR] Validation failed:`, {
          renumberGroupIdx,
          renumberSubjectIdx,
          groupsLength: groups.length,
        });
        notification.warning({
          message: "Không tìm thấy nhóm để đánh số",
          placement: "topRight",
        });
        return;
      }

      const group = groups[renumberGroupIdx];
      const subjects = group.subjects || [];
      if (renumberSubjectIdx !== null && renumberSubjectIdx !== undefined) {
        if (renumberSubjectIdx >= subjects.length) {
          console.error(`[ERROR] Subject index out of range:`, {
            renumberSubjectIdx,
            subjectsLength: subjects.length,
          });
          notification.warning({
            message: "Không tìm thấy môn học để đánh số",
            placement: "topRight",
          });
          return;
        }

        const subject = subjects[renumberSubjectIdx];
        const questions = subject.questions || [];

        if (!Array.isArray(questions) || questions.length === 0) {
          console.warn(`[WARN] No questions to renumber:`, {
            questionsLength: questions.length,
            questionsType: typeof questions,
          });
          notification.warning({
            message: "Không có câu hỏi để đánh số 1",
            placement: "topRight",
          });
          return;
        }

        let currentNumber = renumberStartingNumber;
        const updatedQuestions = questions.map((question) => {
          if ((question.type || "").toUpperCase() === "CLUSTER") {
            return { ...question };
          } else {
            const oldNumber = question.number || question.question_no;
            const newNumber = currentNumber;
            currentNumber++;
            return {
              ...question,
              number: newNumber,
              question_no: newNumber,
            };
          }
        });
        const updatedSubjects = subjects.map((subj, idx) => {
          if (idx === renumberSubjectIdx) {
            return {
              ...subj,
              questions: updatedQuestions,
            };
          }
          return subj;
        });
        const updatedGroups = groups.map((grp, idx) => {
          if (idx === renumberGroupIdx) {
            return {
              ...grp,
              subjects: updatedSubjects,
            };
          }
          return grp;
        });

        updatedTabData = updatedTabData.map((tab) => {
          if (tab._id === this.state.selectedSectionId) {
            return {
              ...tab,
              groupTopic: updatedGroups,
            };
          }
          return tab;
        });
      } else {
        let currentNumber = renumberStartingNumber;
        const updatedSubjects = subjects.map((subject, subjIdx) => {
          const questions = subject.questions || [];

          if (!Array.isArray(questions) || questions.length === 0) {
            return subject;
          }

          const updatedQuestions = questions.map((question) => {
            if ((question.type || "").toUpperCase() === "CLUSTER") {
              return { ...question };
            } else {
              const oldNumber = question.number || question.question_no;
              const newNumber = currentNumber;
              currentNumber++;
              return {
                ...question,
                number: newNumber,
                question_no: newNumber,
              };
            }
          });

          return {
            ...subject,
            questions: updatedQuestions,
          };
        });
        const updatedGroups = groups.map((grp, idx) => {
          if (idx === renumberGroupIdx) {
            return {
              ...grp,
              subjects: updatedSubjects,
            };
          }
          return grp;
        });

        updatedTabData = updatedTabData.map((tab) => {
          if (tab._id === this.state.selectedSectionId) {
            return {
              ...tab,
              groupTopic: updatedGroups,
            };
          }
          return tab;
        });
      }
    }

    this.setState(
      {
        tabData: updatedTabData,
        showRenumberModal: false,
        renumberStartingNumber: 1,
        renumberSectionType: null,
        renumberGroupIdx: null,
        renumberSubjectIdx: null,
        renumberSubSectionId: null,
      },
      () => {
        this.saveTabDataToSession();
        this.forceUpdate(); // ✅ THÊM: Force re-render UI
        this.setState({}); // ✅ THÊM: Trigger state update để đảm bảo re-render
        notification.success({
          message: "Đánh số câu hỏi thành công",
          placement: "topRight",
        });
      },
    );
  };
  selectQuestionType = (questionType) => {
    const childQuestion = this.state.currentQuestionvalue;

    if (!childQuestion) {
      console.error("[ERROR] No current question for type selection");
      return;
    }
    let updatedChildQuestion = {
      ...childQuestion,
      type: questionType, // Giữ nguyên case của questionType từ ExamCreate
      isPlaceholder: false,
      needsEditing: false,
    };
    switch (questionType.toUpperCase()) {
      case "SINGLECHOICE":
        updatedChildQuestion = {
          ...updatedChildQuestion,
          rawHtml: `Câu hỏi ${childQuestion.question_no}`,
          correctAnswers: ["A"],
          choices: [
            { label: "A", text: "Lựa chọn A" },
            { label: "B", text: "Lựa chọn B" },
            { label: "C", text: "Lựa chọn C" },
            { label: "D", text: "Lựa chọn D" },
          ],
        };
        break;
      case "MULTIPLECHOICE":
        updatedChildQuestion = {
          ...updatedChildQuestion,
          rawHtml: `Câu hỏi ${childQuestion.question_no}`,
          correctAnswers: ["A", "B"],
          choices: [
            { label: "A", text: "Lựa chọn A" },
            { label: "B", text: "Lựa chọn B" },
            { label: "C", text: "Lựa chọn C" },
            { label: "D", text: "Lựa chọn D" },
          ],
        };
        break;
      case "TRUEFALSE":
        updatedChildQuestion = {
          ...updatedChildQuestion,
          rawHtml: `Câu hỏi ${childQuestion.question_no}`,
          correctAnswers: [true],
          choices: [
            { label: "Đúng", text: "Đúng", value: true },
            { label: "Sai", text: "Sai", value: false },
          ],
        };
        break;
      case "TRUEFALSEMULTI":
        updatedChildQuestion = {
          ...updatedChildQuestion,
          rawHtml: `Câu hỏi ${childQuestion.question_no}`,
          correctAnswers: { a: true, b: false },
          choices: [],
        };
        break;
      case "FILLINBLANK":
        updatedChildQuestion = {
          ...updatedChildQuestion,
          rawHtml: `Câu hỏi ${childQuestion.question_no}`,
          correctAnswers: [""],
          choices: [],
        };
        break;
      case "DRAGDROP":
        updatedChildQuestion = {
          ...updatedChildQuestion,
          rawHtml: `Câu hỏi ${childQuestion.question_no}`,
          correctAnswers: [],
          choices: [],
        };
        break;
      default:
        updatedChildQuestion = {
          ...updatedChildQuestion,
          rawHtml: `Câu hỏi ${childQuestion.question_no}`,
          correctAnswers: ["A"],
          choices: [
            { label: "A", text: "Lựa chọn A" },
            { label: "B", text: "Lựa chọn B" },
            { label: "C", text: "Lựa chọn C" },
            { label: "D", text: "Lựa chọn D" },
          ],
        };
    }
    this.setState(
      {
        currentQuestionvalue:
          this.normalizeQuestionForModal(updatedChildQuestion),
      },
      () => {
        this.handleOpenModalUpdateQuestion(updatedChildQuestion);
      },
    );
  };
  handleAddSubSection = (parentSectionId) => {
    const currentTab = this.state.tabData.find(
      (tab) => tab._id === parentSectionId,
    );

    if (!currentTab) {
      alert("Không tìm thấy phần thi để thêm phần thi con!");
      return;
    }
    const isFirstSubSection =
      !Array.isArray(currentTab.subSections) ||
      currentTab.subSections.length === 0;

    let defaultName;
    if (isFirstSubSection) {
      const sectionName = currentTab.exam_section_name || "Phần thi";
      defaultName = "";
    } else {
      const nextNumber = Array.isArray(currentTab.subSections)
        ? currentTab.subSections.length + 1
        : 1;
      const sectionName = currentTab.exam_section_name || "Phần thi";
      defaultName = "";
    }

    this.setState({
      showAddSubSectionModal: true,
      selectedParentSectionId: parentSectionId,
      subSectionName: defaultName,
    });
  };
  closeAddSubSectionModal = () => {
    this.setState({
      showAddSubSectionModal: false,
      subSectionName: "",
      selectedParentSectionId: null,
    });
  };

  saveSubSection = () => {
    const { subSectionName, selectedParentSectionId } = this.state;

    if (!subSectionName.trim()) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng nhập tên phần thi con!",
        placement: "topRight",
      });
      return;
    }

    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab._id === selectedParentSectionId) {
            const updatedTab = {
              ...tab,
              questions: [...(tab.questions || [])],
              subSections: [...(tab.subSections || [])],
            };

            const nextIndex = updatedTab.subSections.length + 1;
            const subSectionId = `subSection${nextIndex}`;

            const isMain = false;
            const newSubSection = {
              id: subSectionId,
              name: subSectionName.trim(),
              isMain: isMain,
              uploaded: tab.uploaded || false,
              questions: [],
            };
            updatedTab.subSections = [...updatedTab.subSections, newSubSection];
            return updatedTab;
          }
          return tab;
        });

        return {
          tabData: updatedTabData,
          subSectionName: "",
          showAddSubSectionModal: false,
          selectedParentSectionId: null,
        };
      },
      () => {
        // ✅ Đồng bộ sections với tabData mới
        this.syncSectionsWithTabData();

        // ✅ Lưu vào session
        this.saveTabDataToSession();

        // ✅ Thông báo
        notification.success({
          message: "Thành công",
          description: `Đã tạo phần thi con: ${subSectionName.trim()}`,
          placement: "topRight",
        });
        // ✅ Đóng modal
        this.closeAddSubSectionModal();
      },
    );
  };

  handleDeleteSubSection = (subSectionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phần thi con này không?")) {
      return;
    }

    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab._id === prevState.selectedSectionId) {
            const updatedTab = { ...tab };

            // ✅ 1. Tìm và xóa từ subSections
            const deletingSubSection = updatedTab.subSections?.find(
              (sub) => sub.id === subSectionId,
            );
            const willBeEmpty = (updatedTab.subSections?.length || 0) === 1;

            if (updatedTab.subSections) {
              updatedTab.subSections = updatedTab.subSections.filter(
                (sub) => sub.id !== subSectionId,
              );
            }

            // ✅ 2. THÊM: Xóa từ childExam tương ứng
            if (updatedTab.childExam) {
              updatedTab.childExam = updatedTab.childExam.filter(
                (child) => String(child.idChildExam) !== String(subSectionId),
              );
            }

            // ✅ 3. QUAN TRỌNG: Nếu xóa hết sub-sections, chuyển câu hỏi về main
            if (
              willBeEmpty &&
              deletingSubSection &&
              deletingSubSection.questions &&
              deletingSubSection.questions.length > 0
            ) {
              // Chuyển câu hỏi về main section
              updatedTab.questions = [
                ...(updatedTab.questions || []),
                ...deletingSubSection.questions,
              ];

              notification.info({
                message: "Đã chuyển câu hỏi về phần chính",
                description: `${deletingSubSection.questions.length} câu hỏi đã được chuyển về phần thi chính`,
                placement: "topRight",
              });
            }
            return updatedTab;
          }
          return tab;
        });

        return {
          tabData: updatedTabData,
        };
      },
      () => {
        // Force update để UI refresh
        this.forceUpdate();
        this.saveTabDataToSession();
      },
    );

    notification.success({
      message: "Xóa phần thi con thành công",
      placement: "topRight",
    });
  };
  handleOpenModalCreateQuestionForSubSection = function (type, subSectionId) {
    try {
      const t = (type || "").toString().toUpperCase();
      const trigger = (id) => $(id).trigger("click");
      let subjectId = this.getCurrentSubjectId();
      if (!subjectId) {
        if (Array.isArray(this.state.tabData)) {
          const currentTab = this.state.tabData.find(
            (tab) => tab._id === this.state.examSectionId,
          );
          if (currentTab && currentTab.subject_id) {
            subjectId = currentTab.subject_id;
            this.setCurrentSubjectId(subjectId);
          }
        }
      }
      this.setState(
        {
          currentSubSectionId: subSectionId,
          examSectionSubjectId: subjectId,
          subject_id: subjectId, // ✅ THÊM: Đồng bộ subject_id
          actionQuestion: "create",
          currentQuestionvalue: null,
          questionNo: this.getQuestionNoNewForSubSection(subSectionId),
        },
        () => {
          if (t === "SINGLECHOICE") {
            trigger("#create-update");
            return;
          }

          if (t === "MULTIPLECHOICE") {
            trigger("#create-update5");
            return;
          }

          if (t === "DRAGDROP") {
            trigger("#create-update4");
            return;
          }

          if (t === "FILLINBLANK") {
            trigger("#create-update3");
            return;
          }

          if (t === "TRUEFALSE") {
            trigger("#create-update6");
            return;
          }

          if (t === "TRUEFALSEMULTI") {
            trigger("#create-update2");
            return;
          }

          if (t === "CLUSTER") {
            trigger("#create-update7");
            return;
          }
          trigger("#create-update");
        },
      );
    } catch (e) { }
  };
  getQuestionNoNewForSubSection(subSectionId) {
    try {
      const currentTab = this.state.tabData.find(
        (tab) => tab._id === this.state.selectedSectionId,
      );
      if (!currentTab) return 1;
      let subSection = currentTab.childExam?.find(
        (child) => child.id === subSectionId,
      );
      if (!subSection) {
        subSection = currentTab.subSections?.find(
          (sub) => sub.id === subSectionId,
        );
      }

      if (!subSection || !Array.isArray(subSection.questions)) return 1;

      let maxNumber = 0;
      subSection.questions.forEach((q) => {
        const isCluster = q.type === "cluster" || q.type === "Cluster";
        if (!isCluster) {
          const currentNumber = q.number || q.question_no || 0;
          if (currentNumber > maxNumber) {
            maxNumber = currentNumber;
          }
        }
        if (isCluster && Array.isArray(q.childQuestions)) {
          q.childQuestions.forEach((child) => {
            const childNumber = child.number || child.question_no || 0;
            if (childNumber > maxNumber) {
              maxNumber = childNumber;
            }
          });
        }
      });

      const nextNumber = maxNumber === 0 ? 1 : maxNumber + 1;
      return nextNumber;
    } catch (error) {
      console.error("❌ Error in getQuestionNoNewForSubSection:", error);
      return 1;
    }
  }

  createRow(
    question,
    index,
    subSectionId = null,
    droppableId = "questions-droppable",
    isChildQuestion = false,
  ) {
    const context = subSectionId ? `sub-${subSectionId}` : "main";
    const stableKey =
      question._id ||
      question.question_id ||
      (subSectionId ? `sub-${subSectionId}-q-${index}` : `q-${index}`);
    const draggableId = `${droppableId}-${context}-${stableKey}`;
    const isChild =
      isChildQuestion ||
      question.parentId != null ||
      question.parent_id != null;
    if ((question.type || "").toUpperCase() === "CLUSTER" && !isChild) {
      return (
        <Draggable key={stableKey} draggableId={draggableId} index={index}>
          {(provided) => (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="v-middle table-row-item cluster-question"
            >
              <td className="text-center p-sm-1"></td>
              <td className="text-center p-sm-1 align-middle">
                <div
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    whiteSpace: "nowrap",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  Câu hỏi chùm
                  <span
                    className="badge badge-info ml-2"
                    style={{ fontSize: "12px" }}
                  >
                    {this.getChildQuestionsCount(
                      question._id || question.question_id,
                    )}{" "}
                    câu hỏi
                  </span>
                </div>
              </td>
              <td className="text-center p-sm-1"></td>
              <td className="text-center p-sm-1">
                {this.renderQuestionType(question.type)}
              </td>
              <td className="text-center p-sm-1">
                {this.renderQuestionLevel(question) ||
                  question.level ||
                  question.question_level ||
                  ""}
              </td>
              <td className="text-center p-sm-1"></td>
              <td className="text-center p-sm-1"></td>
              <td className="text-center p-sm-1">
                {(() => {
                  const displayDate =
                    question.updatedAt ||
                    question.updated_at ||
                    question.createdAt ||
                    question.created_at;
                  return displayDate
                    ? baseHelpers.formatDateToString(displayDate)
                    : null;
                })()}
              </td>
              <td className="text-center p-sm-1">
                <div className="item-action d-flex justify-content-center">
                  <a
                    className="mr-14"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleOpenModalUpdateQuestion(
                        question,
                        subSectionId,
                      );
                    }}
                    title="Chỉnh sửa"
                  >
                    <img src="/assets/img/icon-edit.svg" alt="edit" />
                  </a>
                  <a
                    onClick={() =>
                      this.handleSetDeleteQuestion(question._id, subSectionId)
                    }
                    data-toggle="modal"
                    data-target="#delete-question"
                    title="Xóa"
                  >
                    <img src="/assets/img/icon-delete.svg" alt="delete" />
                  </a>
                </div>
              </td>
            </tr>
          )}
        </Draggable>
      );
    }
    if (isChild) {
      const isPlaceholder =
        question.isPlaceholder ||
        question.needsEditing ||
        !question.type ||
        question.type === null ||
        question.type === undefined;
      console.log("RAW:", question.explanation);

      const hasContent = question.rawHtml && question.rawHtml.trim() !== "";
      const answerText =
        this.getAnswerDisplay(
          question.correctAnswers || question.answer || question.answer_content,
          question,
        ) || ""; // Không có đáp án
      const hasExplanation = (html) => {
        if (!html) return false;

        // 1️⃣ Decode HTML entity nếu có (&lt;img&gt;)
        const textarea = document.createElement("textarea");
        textarea.innerHTML = html;
        let decoded = textarea.value;

        if (!decoded) return false;

        decoded = decoded.replace(/\n/g, "").replace(/\r/g, "");

        const div = document.createElement("div");
        div.innerHTML = decoded;

        const imgs = div.querySelectorAll("img");
        for (let img of imgs) {
          if (img.getAttribute("src")?.trim()) {
            return true;
          }
        }

        const text = div.textContent || div.innerText || "";
        if (text.replace(/\u00A0/g, " ").trim().length > 0) {
          return true;
        }

        return false;
      };
      return (
        <Draggable key={stableKey} draggableId={draggableId} index={index}>
          {(provided, snapshot) => (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`v-middle table-row-item child-question-row ${isPlaceholder ? "placeholder-row" : ""
                }`}
              style={{
                ...provided.draggableProps.style, // Quan trọng: Giữ style từ dnd
                backgroundColor: isPlaceholder
                  ? "#fff3cd"
                  : snapshot.isDragging
                    ? "#f0f8ff"
                    : "#fafafa",
                opacity: snapshot.isDragging ? 0.5 : 1, // Thêm opacity khi kéo
              }}
            >
              <td
                className="text-center p-sm-1"
                style={{ paddingLeft: "30px" }}
              >
                <i
                  className="fa fa-reply"
                  style={{ transform: "scaleX(-1)", color: "#6c757d" }}
                ></i>
              </td>

              {/* ✅ Cột số câu */}
              <td className="text-center p-sm-1">
                <div className="d-flex align-items-center justify-content-center">
                  Câu {question.number || question.question_no || index}
                  <div
                    style={{
                      maxWidth: "300px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "inline-block",
                      fontStyle: isPlaceholder ? "italic" : "normal",
                      color: isPlaceholder ? "#6c757d" : "inherit",
                      marginLeft: "8px",
                    }}
                    title={
                      hasContent
                        ? question.rawHtml.replace(/<[^>]*>/g, "")
                        : `Câu hỏi ${index} - Chưa có nội dung`
                    }
                  ></div>
                </div>
              </td>

              {/* ✅ Cột đáp án */}
              <td className="text-center p-sm-1">
                <div
                  style={{
                    maxWidth: "240px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    margin: "0 auto",
                  }}
                  title={answerText}
                >
                  {answerText}
                </div>
              </td>

              {/* ✅ Loại câu hỏi */}
              <td className="text-center p-sm-1">
                {this.renderQuestionType(question.type)}
              </td>

              {/* ✅ Mức độ */}
              <td className="text-center p-sm-1">
                {this.renderQuestionLevel(question) ||
                  question.level ||
                  question.question_level ||
                  ""}
              </td>

              {/* ✅ Lời giải */}
              <td className="text-center p-sm-1">
                {hasExplanation(question.explanation) ? (
                  <span className="badge bg-success">Đã có</span>
                ) : (
                  <span className="badge bg-danger">Chưa có</span>
                )}
              </td>

              {/* ✅ Video */}
              <td className="text-center p-sm-1">
                {question.video || question.video_link ? (
                  <span className="badge bg-success">Đã có</span>
                ) : (
                  <span className="badge bg-danger">Chưa có</span>
                )}
              </td>

              {/* ✅ Ngày */}
              <td className="text-center p-sm-1">
                {(() => {
                  const displayDate =
                    question.updatedAt ||
                    question.updated_at ||
                    question.createdAt ||
                    question.created_at;
                  return displayDate ? (
                    baseHelpers.formatDateToString(displayDate)
                  ) : (
                    <span className="badge bg-danger">Chưa có</span>
                  );
                })()}
              </td>

              {/* ✅ Action */}
              <td className="text-center p-sm-1">
                <div className="item-action d-flex justify-content-center">
                  <a
                    className="mr-14"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isPlaceholder) {
                        this.handleOpenModalSelectQuestionType(
                          question,
                          subSectionId,
                        );
                      } else {
                        this.handleOpenModalUpdateQuestion(
                          question,
                          subSectionId,
                        );
                      }
                    }}
                  >
                    <img src="/assets/img/icon-edit.svg" alt="edit" />
                  </a>
                  <a
                    onClick={() =>
                      this.handleSetDeleteQuestion(question._id, subSectionId)
                    }
                    data-toggle="modal"
                    data-target="#delete-question"
                    title="Xóa"
                  >
                    <img src="/assets/img/icon-delete.svg" alt="delete" />
                  </a>
                </div>
              </td>
            </tr>
          )}
        </Draggable>
      );
    }
    const answerText =
      this.getAnswerDisplay(
        question.correctAnswers || question.answer || question.answer_content,
        question,
      ) || ""; //Không có đáp án
    const hasExplanation = (html) => {
      if (!html) return false;

      // 1️⃣ Decode HTML entity nếu có (&lt;img&gt;)
      const textarea = document.createElement("textarea");
      textarea.innerHTML = html;
      let decoded = textarea.value;

      if (!decoded) return false;

      decoded = decoded.replace(/\n/g, "").replace(/\r/g, "");

      const div = document.createElement("div");
      div.innerHTML = decoded;

      const imgs = div.querySelectorAll("img");
      for (let img of imgs) {
        if (img.getAttribute("src")?.trim()) {
          return true;
        }
      }

      const text = div.textContent || div.innerText || "";
      if (text.replace(/\u00A0/g, " ").trim().length > 0) {
        return true;
      }

      return false;
    };
    return (
      <Draggable key={stableKey} draggableId={draggableId} index={index}>
        {(provided, snapshot) => (
          <tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="v-middle table-row-item"
            style={{
              ...provided.draggableProps.style, // Quan trọng: Giữ style từ dnd
              opacity: snapshot.isDragging ? 0.5 : 1, // Thêm opacity khi kéo
              backgroundColor: snapshot.isDragging ? "#f0f8ff" : "transparent", // Thêm background khi kéo
            }}
          >
            <td></td>
            <td className="text-center p-sm-1">
              Câu {question.number || question.question_no || index + 1}
            </td>
            <td className="text-center p-sm-1">
              <div
                style={{
                  maxWidth: "240px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: "0 auto", // để div nằm giữa cell
                }}
                title={answerText}
              >
                <span dangerouslySetInnerHTML={{ __html: answerText }} />
              </div>
            </td>
            <td className="text-center p-sm-1">
              {this.renderQuestionType(question.type)}
            </td>
            <td className="text-center p-sm-1">
              {this.renderQuestionLevel(question) ||
                question.level ||
                question.question_level ||
                ""}
            </td>
            <td className="text-center p-sm-1">
              {hasExplanation(question.explanation) ? (
                <span className="badge bg-success">Đã có</span>
              ) : (
                <span className="badge bg-danger">Chưa có</span>
              )}
            </td>

            <td className="text-center p-sm-1">
              {question.video || question.video_link ? (
                (() => {
                  const videoField = question.video || question.video_link;
                  const videoValue =
                    typeof videoField === "string"
                      ? videoField.trim()
                      : videoField;

                  const isLink =
                    videoValue &&
                    (videoValue.startsWith("http://") ||
                      videoValue.startsWith("https://"));

                  return isLink ? (
                    <span className="badge bg-success">Đã có</span>
                  ) : (
                    <span className="badge bg-success">Đã có</span>
                  );
                })()
              ) : (
                <span className="badge bg-danger">Chưa có</span>
              )}
            </td>
            <td className="text-center p-sm-1">
              {(() => {
                const displayDate =
                  question.updatedAt ||
                  question.updated_at ||
                  question.createdAt ||
                  question.created_at;
                return displayDate
                  ? baseHelpers.formatDateToString(displayDate)
                  : null;
              })()}
            </td>
            <td className="text-center p-sm-1">
              <div className="item-action d-flex justify-content-center">
                <a
                  className="mr-14"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.handleOpenModalUpdateQuestion(question, subSectionId);
                  }}
                  title="Chỉnh sửa"
                >
                  <img src="/assets/img/icon-edit.svg" alt="" />
                </a>
                <a
                  onClick={() => this.handleSetDeleteQuestion(question._id)}
                  data-toggle="modal"
                  data-target="#delete-question"
                  data-toggle-classname="fade-down"
                  data-toggle-class-target=".animate"
                  title="Xóa"
                >
                  <img src="/assets/img/icon-delete.svg" alt="" />
                </a>
              </div>
            </td>
          </tr>
        )}
      </Draggable>
    );
  }

  getAnswerDisplay = (ans, question) => {
    if (ans === null || ans === undefined) return ""; //Không có đáp án
    const boolDisplay = (v, preferEnglish = false) => {
      if (v === true || v === "true")
        return preferEnglish ? "True" : "Đúng";
      if (v === false || v === "false")
        return preferEnglish ? "False" : "Sai";
      if (typeof v === "string") {
        const lower = v.toLowerCase().trim();
        if (lower === "true") return preferEnglish ? "True" : "Đúng";
        if (lower === "false") return preferEnglish ? "False" : "Sai";
        if (lower === "đúng" || lower === "dung") return "Đúng";
        if (lower === "sai") return "Sai";
        return v;
      }
      return String(v);
    };
    const detectPreferEnglish = (obj) => {
      try {
        if (typeof obj === "string") {
          const t = obj.toLowerCase();
          if (t.includes("true") || t.includes("false")) return true;
          return false;
        }
        if (typeof obj === "object" && obj !== null) {
          const vals = Object.values(obj);
          for (let v of vals) {
            if (typeof v === "string") {
              const t = v.toLowerCase().trim();
              if (t === "true" || t === "false") return true;
            }
            if (typeof v === "boolean") {
              if (question && question.choices) {
                for (let choice of question.choices) {
                  if (
                    choice &&
                    typeof choice === "object" &&
                    choice.answerRaw
                  ) {
                    if (
                      choice.answerRaw === "True" ||
                      choice.answerRaw === "False"
                    ) {
                      return true;
                    }
                  }
                }
              }
              if (
                question &&
                question.answerRaw &&
                Array.isArray(question.answerRaw)
              ) {
                for (let raw of question.answerRaw) {
                  if (raw === "True" || raw === "False") {
                    return true;
                  }
                }
              }
            }
          }
        }
        if (Array.isArray(obj)) {
          for (let v of obj) {
            if (
              typeof v === "string" &&
              (v.toLowerCase().trim() === "true" ||
                v.toLowerCase().trim() === "false")
            )
              return true;
            if (typeof v === "object" && v !== null) {
              if (v.value !== undefined) {
                const valStr = String(v.value).toLowerCase().trim();
                if (valStr === "true" || valStr === "false") return true;
              }
              if (v.rawHtml !== undefined) {
                const htmlStr = String(v.rawHtml).toLowerCase();
                if (htmlStr.includes("true") || htmlStr.includes("false"))
                  return true;
              }
            }
            if (typeof v === "boolean") {
              if (question && question.choices) {
                for (let choice of question.choices) {
                  if (
                    choice &&
                    typeof choice === "object" &&
                    choice.answerRaw
                  ) {
                    if (
                      choice.answerRaw === "True" ||
                      choice.answerRaw === "False"
                    ) {
                      return true;
                    }
                  }
                }
              }
              if (
                question &&
                question.answerRaw &&
                Array.isArray(question.answerRaw)
              ) {
                for (let raw of question.answerRaw) {
                  if (raw === "True" || raw === "False") {
                    return true;
                  }
                }
              }
            }
          }
        }
      } catch (e) { }
      return false;
    };
    if (typeof ans === "string" || typeof ans === "number") {
      const preferEn = detectPreferEnglish(
        question?.correctAnswers || question?.answer || ans,
      );
      const result = boolDisplay(ans, preferEn);

      return result;
    }

    if (typeof ans === "boolean") {
      const preferEn = detectPreferEnglish(
        question?.correctAnswers || question?.answer || ans,
      );
      const result = boolDisplay(ans, preferEn);

      return result;
    }
    if (Array.isArray(ans)) {
      const preferEn = detectPreferEnglish(ans);
      const items = ans.map((item) => {
        if (
          typeof item === "boolean" ||
          typeof item === "string" ||
          typeof item === "number"
        )
          return boolDisplay(item, preferEn);
        if (typeof item === "object" && item !== null) {
          if (item.value !== undefined) {
            return boolDisplay(item.value, preferEn);
          }
          if (item.text !== undefined) return String(item.text);
          if (item.rawHtml !== undefined)
            return String(item.rawHtml)
              .replace(/<[^>]*>/g, "")
              .trim();
          return JSON.stringify(item);
        }
        return String(item);
      });
      const result = items.join(", ");

      return result;
    }
    if (typeof ans === "object") {
      const keys = Object.keys(ans || {});
      const isLabelMap =
        keys.length > 0 && keys.every((k) => /^[A-Za-z0-9]+$/.test(k));
      const preferEn = detectPreferEnglish(
        ans || question?.correctAnswers || question?.answer,
      );

      if (isLabelMap) {
        keys.sort((a, b) => {
          const na = parseInt(a, 10);
          const nb = parseInt(b, 10);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          if (!isNaN(na)) return -1;
          if (!isNaN(nb)) return 1;
          return a.localeCompare(b);
        });

        const vals = keys.map((k) => boolDisplay(ans[k], preferEn));
        const result = vals.join(", ");

        return result;
      }
      if (ans.value !== undefined) {
        const result = boolDisplay(ans.value, detectPreferEnglish(ans));

        return result;
      }
      if (ans.text !== undefined) {
        const result = String(ans.text);

        return result;
      }
      if (ans.rawHtml !== undefined) {
        const result = String(ans.rawHtml)
          .replace(/<[^>]*>/g, "")
          .trim();

        return result;
      }

      const fallback = JSON.stringify(ans);

      return fallback || "[Object]"; // Safe fallback if JSON.stringify fails
    }
    const fallback = String(ans);
    return fallback || "[Unknown]"; // Safe fallback if String() fails
  };
  classifyQuestions(allQuestions) {
    const childQuestionsMap = new Map();
    const clusterQuestions = new Map();

    allQuestions.forEach((q, index) => {
      const hasParentId =
        q.parentId !== null &&
        q.parentId !== undefined &&
        String(q.parentId) !== "";
      const isCluster = (q.type || "").toUpperCase() === "CLUSTER";

      if (isCluster && !hasParentId) {
        const clusterId = q.questionId || q._id || q.question_id;
        clusterQuestions.set(String(clusterId), {
          question: q,
          originalIndex: index,
        });
      } else if (hasParentId) {
        const parentId = String(q.parentId);
        if (!childQuestionsMap.has(parentId)) {
          childQuestionsMap.set(parentId, []);
        }
        childQuestionsMap
          .get(parentId)
          .push({ question: q, originalIndex: index });
      }
    });

    return { childQuestionsMap, clusterQuestions };
  }
  mergeQuestions(questions) {
    const { fileQuestions = [] } = this.state;
    return [
      ...(Array.isArray(questions) ? questions : []),
      ...(Array.isArray(fileQuestions) ? fileQuestions : []),
    ];
  }
  renderEmptyTableBody(colSpan = 8) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="text-center text-muted">
            Chưa có câu hỏi nào
          </td>
        </tr>
      </tbody>
    );
  }

  fetchRowsTopicGroup(questions, droppableId = "questions-table", idSubject) {
    let allQuestions = this.mergeQuestions(questions);

    if (allQuestions.length === 0) {
      return this.renderEmptyTableBody();
    }

    const { childQuestionsMap, clusterQuestions } =
      this.classifyQuestions(allQuestions);

    const rows = [];
    allQuestions =
      QuestionNumberingService.sortQuestionsForNumbering(allQuestions);
    let rowIndex = 0;
    allQuestions.forEach((q) => {
      const hasParentId =
        q.parentId !== null &&
        q.parentId !== undefined &&
        String(q.parentId) !== "";
      if (hasParentId) return;

      const isCluster = (q.type || "").toUpperCase() === "CLUSTER";

      if (isCluster) {
        const clusterId = q.questionId || q._id || q.question_id;
        const cIdStr = String(clusterId || "");
        const clusterChildren = childQuestionsMap.get(cIdStr) || [];

        rows.push(
          this.createClusterRowTopicGroup(
            q,
            rowIndex++,
            droppableId,
            clusterChildren.length,
            idSubject,
          ),
        );

        if (this.isClusterExpanded(cIdStr) && clusterChildren.length > 0) {
          clusterChildren
            .sort((a, b) => a.originalIndex - b.originalIndex)
            .forEach((childItem) => {
              rows.push(
                this.createRowTopicGroup(
                  childItem.question,
                  rowIndex++,
                  childItem.question.number,
                  droppableId,
                  true,
                  null,
                  allQuestions,
                ),
              );
            });
        }
      } else {
        rows.push(
          this.createRowTopicGroup(
            q,
            rowIndex++,
            q.number,
            droppableId,
            false,
            idSubject,
          ),
        );
      }
    });

    const getSubjectStartingNumberFromQuestions = () => {
      const questionsWithNumber = allQuestions.filter(
        (q) =>
          (q.type || "").toUpperCase() !== "CLUSTER" &&
          (q.number > 0 || q.question_no > 0),
      );

      if (questionsWithNumber.length === 0) return 1;

      const minNumber = Math.min(
        ...questionsWithNumber
          .map((q) => q.number || q.question_no || 0)
          .filter((n) => n > 0),
      );
      return minNumber === Infinity ? 1 : minNumber;
    };

    const tbodyStyle = { transition: "background-color 0.2s ease" };

    return (
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <tbody
            ref={provided.innerRef}
            {...provided.droppableProps}
            key={this.state.renderTrigger}
            style={{
              ...tbodyStyle,
              backgroundColor: snapshot.isDraggingOver
                ? "#f0f8ff"
                : "transparent",
            }}
          >
            {rows.filter((row) => row !== null)}
            {provided.placeholder}
          </tbody>
        )}
      </Droppable>
    );
  }

  createClusterRowTopicGroup = (
    question,
    index,
    droppableId,
    childCount,
    idSubject,
  ) => {
    const stableKey =
      question.questionId ||
      question._id ||
      question.question_id ||
      `cluster-${index}`;
    const draggableId = `${droppableId}-${stableKey}`;
    const clusterId =
      question.questionId || question._id || question.question_id;
    const clusterKey = String(clusterId);

    return (
      <Draggable key={stableKey} draggableId={draggableId} index={index}>
        {(provided, snapshot) => (
          <tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="v-middle table-row-item cluster-question"
            style={{
              ...provided.draggableProps.style, // Quan trọng: Giữ style từ dnd
              opacity: snapshot.isDragging ? 0.5 : 1, // Thêm opacity khi kéo
              backgroundColor: snapshot.isDragging ? "#f0f8ff" : "transparent", // Thêm background khi kéo
            }}
          >
            <td>
              <i
                className={`fa ${this.isClusterExpanded(clusterKey)
                  ? "fa-chevron-down"
                  : "fa-chevron-right"
                  } cursor-pointer`}
                onClick={() => this.toggleExpanded(clusterKey)}
                style={{
                  fontSize: "14px",
                  color: "#007bff",
                  cursor: "pointer",
                }}
                title={
                  this.isClusterExpanded(clusterKey) ? "Thu gọn" : "Mở rộng"
                }
              ></i>
            </td>

            {/* 1: STT với expand/collapse button */}
            <td style={{ minWidth: 80, textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap", // tránh xuống dòng
                }}
              >
                <strong style={{ color: "#007bff" }}>Câu hỏi chùm</strong>
              </div>
            </td>

            {/* 2: Đáp án - hiển thị số câu hỏi con */}
            <td style={{ minWidth: 150, textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="badge badge-info" style={{ fontSize: "11px" }}>
                  {childCount} câu hỏi con
                </span>
              </div>
            </td>

            {/* 3: Loại câu hỏi */}
            <td style={{ minWidth: 120 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {this.renderQuestionType
                  ? this.renderQuestionType(question.type)
                  : question.type || ""}
              </div>
            </td>

            {/* 4: Độ khó */}
            <td style={{ minWidth: 100 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {this.renderQuestionLevel
                  ? this.renderQuestionLevel(question)
                  : question.level || question.question_level || ""}
              </div>
            </td>

            {/* 5: Lời giải */}
            <td style={{ minWidth: 200 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              ></div>
            </td>

            {/* 6: Video */}
            <td style={{ minWidth: 120 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              ></div>
            </td>

            {/* 7: Ngày tải lên */}
            <td style={{ minWidth: 140 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {(() => {
                  const displayDate =
                    question.updatedAt ||
                    question.updated_at ||
                    question.createdAt ||
                    question.created_at;
                  return displayDate ? (
                    baseHelpers.formatDateToString(displayDate)
                  ) : (
                    <span style={{ color: "#888" }}>Chưa có ngày</span>
                  );
                })()}
              </div>
            </td>

            {/* 8: Thao tác */}
            <td style={{ width: 150 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Nút chỉnh sửa */}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.handleOpenModalUpdateQuestionTopicGroup(
                      question,
                      question.questionId,
                      question.subject,
                      idSubject,
                    );
                  }}
                  title="Chỉnh sửa câu hỏi chùm"
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <img
                    src="/assets/img/icon-edit.svg"
                    alt="edit"
                    style={{ width: 18, height: 18 }}
                  />
                </a>

                {/* Nút xóa */}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.handleSetDeleteQuestion(question._id);
                  }}
                  data-toggle="modal"
                  data-target="#delete-question"
                  title="Xóa câu hỏi chùm"
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <img
                    src="/assets/img/icon-delete.svg"
                    alt="delete"
                    style={{ width: 18, height: 18 }}
                  />
                </a>
              </div>
            </td>

            {/* Câu hỏi thử nghiệm */}
            <td
              style={{
                width: 70,
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <label className="custom-orange-checkbox">
                <input
                  type="checkbox"
                  checked={question.isTestQuestion || false}
                  onChange={(e) => {
                    this.handleCheckedTestingQuestion(
                      question._id,
                      idSubject,
                      e.target.checked,
                    );
                  }}
                />
                <span className="checkmark"></span>
              </label>

              <style>
                {`
      .custom-orange-checkbox {
        position: relative;
        display: inline-block;
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .custom-orange-checkbox input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      /* Viền cam mặc định */
      .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        border: 2px solid #ff7a00;
        border-radius: 4px;
        background-color: white;
        transition: all 0.2s ease;
      }

      /* Hover làm viền đậm và phóng to */
      .custom-orange-checkbox:hover .checkmark {
        border-color: #ff5500;
        transform: scale(1.1);
      }

      /* Khi được chọn */
      .custom-orange-checkbox input:checked + .checkmark {
        background-color: #ff7a00;
        border-color: #ff7a00;
      }

      /* Dấu tick trắng bên trong */
      .checkmark::after {
        content: "";
        position: absolute;
        display: none;
      }

      .custom-orange-checkbox input:checked + .checkmark::after {
        display: block;
      }

      .custom-orange-checkbox .checkmark::after {
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    `}
              </style>
            </td>
          </tr>
        )}
      </Draggable>
    );
  };

  handleCheckedTestingQuestion(questionId, subjectId, dataChecked) {
    this.setState(
      (prevState) => {
        const updatedTabData = [...prevState.tabData];
        const currentTabIndex = updatedTabData.findIndex(
          (tab) =>
            tab._id === prevState.selectedSectionId &&
            tab.exam_section_type === "NHOM_CHU_DE",
        );

        if (currentTabIndex === -1) {
          console.warn("Không tìm thấy NHOM_CHU_DE section");
          return prevState;
        }

        const currentTab = updatedTabData[currentTabIndex];

        if (!currentTab.groupTopic || !Array.isArray(currentTab.groupTopic)) {
          console.warn("Không có groupTopic trong section");
          return prevState;
        }
        currentTab.groupTopic.forEach((group) => {
          if (!group.subjects || !Array.isArray(group.subjects)) return;

          group.subjects.forEach((subject) => {
            if (subject.idSubject === subjectId) {
              if (!subject.questions || !Array.isArray(subject.questions))
                return;

              subject.questions.forEach((question) => {
                if (question.isTestQuestion) {
                  delete question.isTestQuestion;
                }
              });
            }
          });
        });
        if (dataChecked) {
          currentTab.groupTopic.forEach((group) => {
            if (!group.subjects || !Array.isArray(group.subjects)) return;

            group.subjects.forEach((subject) => {
              if (subject.idSubject === subjectId) {
                if (!subject.questions || !Array.isArray(subject.questions))
                  return;

                const questionIndex = subject.questions.findIndex(
                  (q) => q._id === questionId,
                );
                if (questionIndex !== -1) {
                  subject.questions[questionIndex].isTestQuestion = true;
                }
              }
            });
          });
        }

        return {
          tabData: updatedTabData,
        };
      },
      () => {
        this.saveTabDataToSession();
      },
    );
  }

  createRowTopicGroup(
    question,
    index,
    displayNumber = null,
    droppableId = "topic-group-table",
    isChild = false,
    idSubject,
  ) {
    const stableKey = question._id || question.question_id || `temp-${index}`;
    const draggableId = `${droppableId}-${stableKey}`;
    const questionDisplayNumber =
      displayNumber !== null
        ? displayNumber
        : question.number || question.question_no || index + 1;
    const isCluster =
      (question.type || "").toString().toUpperCase() === "CLUSTER";
    if (isCluster && !isChild) {
      const clusterId = question._id || question.question_id;
      const clusterKey = String(clusterId);
      const hasExplanation = (html) => {
        if (!html) return false;

        // 1️⃣ Decode HTML entity nếu có (&lt;img&gt;)
        const textarea = document.createElement("textarea");
        textarea.innerHTML = html;
        let decoded = textarea.value;

        if (!decoded) return false;

        decoded = decoded.replace(/\n/g, "").replace(/\r/g, "");

        const div = document.createElement("div");
        div.innerHTML = decoded;

        const imgs = div.querySelectorAll("img");
        for (let img of imgs) {
          if (img.getAttribute("src")?.trim()) {
            return true;
          }
        }

        const text = div.textContent || div.innerText || "";
        if (text.replace(/\u00A0/g, " ").trim().length > 0) {
          return true;
        }

        return false;
      };
      return (
        <Draggable key={stableKey} draggableId={draggableId} index={index}>
          {(provided, snapshot) => (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="v-middle table-row-item cluster-question"
              style={{
                ...provided.draggableProps.style, // Quan trọng: Giữ style từ dnd
                opacity: snapshot.isDragging ? 0.5 : 1, // Thêm opacity khi kéo
                backgroundColor: snapshot.isDragging
                  ? "#f0f8ff"
                  : "transparent", // Thêm background khi kéo
              }}
            >
              <td></td>
              {/* 1: STT với expand/collapse button */}
              <td
                style={{
                  minWidth: 80,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i
                    className={`fa ${this.isClusterExpanded(clusterKey) ? "fa-chevron-down" : "fa-chevron-right"} cursor-pointer`}
                    onClick={() => this.toggleExpanded(clusterKey)}
                    style={{
                      fontSize: "14px",
                      color: "#007bff",
                      cursor: "pointer",
                    }}
                    title={
                      this.isClusterExpanded(clusterKey) ? "Thu gọn" : "Mở rộng"
                    }
                  ></i>
                  <strong style={{ color: "#007bff" }}>Câu hỏi chùm</strong>
                </div>
              </td>

              {/* 2: Đáp án - hiển thị số câu hỏi con */}
              <td
                style={{
                  minWidth: 150,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span
                    className="badge badge-info"
                    style={{ fontSize: "11px" }}
                  >
                    {this.getChildQuestionsCount(clusterId)} câu hỏi
                  </span>
                </div>
              </td>

              {/* 3: Loại câu hỏi */}
              <td
                style={{
                  minWidth: 120,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {this.renderQuestionType
                  ? this.renderQuestionType(question.type)
                  : question.type || ""}
              </td>

              {/* 4: Độ khó */}
              <td
                style={{
                  minWidth: 100,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {this.renderQuestionLevel
                  ? this.renderQuestionLevel(question)
                  : question.level || question.question_level || ""}
              </td>

              {/* 5: Lời giải */}
              <td className="text-center p-sm-1">
                {hasExplanation(question.explanation) ? (
                  <span className="badge bg-success">Đã có</span>
                ) : (
                  <span className="badge bg-danger">Chưa có</span>
                )}
              </td>

              {/* 6: Video */}
              <td
                style={{
                  minWidth: 120,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {question.video || question.video_link ? (
                  (() => {
                    const v = question.video || question.video_link;
                    const val = typeof v === "string" ? v.trim() : v;
                    if (!val)
                      return <span className="badge bg-danger">Chưa có</span>;
                    const isLink =
                      typeof val === "string" &&
                      (val.startsWith("http://") || val.startsWith("https://"));
                    return <span className="badge bg-success">Đã có</span>;
                  })()
                ) : (
                  <span className="badge bg-danger">Chưa có</span>
                )}
              </td>

              {/* 7: Ngày tải lên */}
              <td
                style={{
                  minWidth: 140,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {(() => {
                    const displayDate =
                      question.updatedAt ||
                      question.updated_at ||
                      question.createdAt ||
                      question.created_at;
                    return displayDate ? (
                      baseHelpers.formatDateToString(displayDate)
                    ) : (
                      <span className="badge bg-danger">Chưa có</span>
                    );
                  })()}
                </div>
              </td>

              {/* 8: Thao tác */}
              <td
                style={{
                  width: 120,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleOpenModalUpdateQuestionTopicGroup(
                        question,
                        question.questionId,
                        question.subject,
                        idSubject,
                      );
                    }}
                    title="Chỉnh sửa câu hỏi chùm"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <img
                      src="/assets/img/icon-edit.svg"
                      alt="edit"
                      style={{ width: 18, height: 18 }}
                    />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleSetDeleteQuestion(question._id);
                    }}
                    data-toggle="modal"
                    data-target="#delete-question"
                    title="Xóa câu hỏi chùm"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <img
                      src="/assets/img/icon-delete.svg"
                      alt="delete"
                      style={{ width: 18, height: 18 }}
                    />
                  </a>
                </div>
              </td>
            </tr>
          )}
        </Draggable>
      );
    }
    if (isChild) {
      const isPlaceholder =
        question.isPlaceholder ||
        question.needsEditing ||
        !question.type ||
        question.type === null ||
        question.type === undefined;
      const hasContent = question.rawHtml && question.rawHtml.trim() !== "";
      const getAnswerText = () => {
        try {
          if (this.getAnswerDisplay) {
            const v = this.getAnswerDisplay(
              question.correctAnswers ||
              question.answer ||
              question.answer_content,
              question,
            );
            if (v) return String(v);
          }
          if (
            Array.isArray(question.correctAnswers) &&
            question.correctAnswers.length
          ) {
            return question.correctAnswers.map((a) => a.value || a).join(", ");
          }
          if (question.answer) return String(question.answer);
          if (question.answer_content) return String(question.answer_content);
          return "";
        } catch (e) {
          return "";
        }
      };
      const hasExplanation = (html) => {
        if (!html) return false;

        // 1️⃣ Decode HTML entity nếu có (&lt;img&gt;)
        const textarea = document.createElement("textarea");
        textarea.innerHTML = html;
        let decoded = textarea.value;

        if (!decoded) return false;

        decoded = decoded.replace(/\n/g, "").replace(/\r/g, "");

        const div = document.createElement("div");
        div.innerHTML = decoded;

        const imgs = div.querySelectorAll("img");
        for (let img of imgs) {
          if (img.getAttribute("src")?.trim()) {
            return true;
          }
        }

        const text = div.textContent || div.innerText || "";
        if (text.replace(/\u00A0/g, " ").trim().length > 0) {
          return true;
        }

        return false;
      };
      const answerText = getAnswerText() || ""; //Không có đáp án

      return (
        <Draggable key={stableKey} draggableId={draggableId} index={index}>
          {(provided, snapshot) => (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`v-middle table-row-item child-question-row ${isPlaceholder ? "placeholder-row" : ""}`}
              style={{
                ...provided.draggableProps.style, // Quan trọng: Giữ style từ dnd
                backgroundColor: isPlaceholder
                  ? "#fff3cd"
                  : snapshot.isDragging
                    ? "#f0f8ff"
                    : "#fafafa",
                opacity: snapshot.isDragging ? 0.5 : 1, // Thêm opacity khi kéo
              }}
            >
              <td>
                <i
                  className="fa fa-reply"
                  style={{ transform: "scaleX(-1)", color: "#6c757d" }}
                ></i>
              </td>
              {/* 1: STT với icon child */}
              <td
                style={{
                  minWidth: 80,
                  textAlign: "center",
                  verticalAlign: "middle",
                  paddingLeft: "30px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>Câu {question.number || question.question_no}</span>
                </div>
              </td>

              {/* 2: Đáp án */}
              <td
                style={{
                  minWidth: 150,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: "220px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={answerText}
                >
                  {answerText}
                </div>
              </td>

              {/* 3: Loại câu hỏi */}
              <td
                style={{
                  minWidth: 120,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {this.renderQuestionType
                  ? this.renderQuestionType(question.type)
                  : question.type || "Chưa chọn loại"}
              </td>

              {/* 4: Độ khó */}
              <td
                style={{
                  minWidth: 100,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {this.renderQuestionLevel
                  ? this.renderQuestionLevel(question)
                  : question.level || question.question_level || ""}
              </td>

              {/* 5: Lời giải */}
              <td className="text-center p-sm-1">
                {hasExplanation(question.explanation) ? (
                  <span className="badge bg-success">Đã có</span>
                ) : (
                  <span className="badge bg-danger">Chưa có</span>
                )}
              </td>

              {/* 6: Video */}
              <td
                style={{
                  minWidth: 120,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {question.video || question.video_link ? (
                  (() => {
                    const v = question.video || question.video_link;
                    const val = typeof v === "string" ? v.trim() : v;
                    if (!val)
                      return <span className="badge bg-danger">Chưa có</span>;
                    const isLink =
                      typeof val === "string" &&
                      (val.startsWith("http://") || val.startsWith("https://"));
                    return <span className="badge bg-success">Đã có</span>;
                  })()
                ) : (
                  <span className="badge bg-danger">Chưa có</span>
                )}
              </td>

              {/* 7: Ngày tải lên */}
              <td
                style={{
                  minWidth: 140,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {(() => {
                    const displayDate =
                      question.updatedAt ||
                      question.updated_at ||
                      question.createdAt ||
                      question.created_at;
                    return displayDate ? (
                      baseHelpers.formatDateToString(displayDate)
                    ) : (
                      <span className="badge bg-danger">Chưa có</span>
                    );
                  })()}
                </div>
              </td>

              {/* 8: Thao tác */}
              <td
                style={{
                  width: 120,
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isPlaceholder) {
                        this.handleOpenModalSelectQuestionType(question);
                      } else {
                        this.handleOpenModalUpdateQuestionTopicGroup(
                          question,
                          question.questionId,
                          question.subject,
                          idSubject,
                        );
                      }
                    }}
                    title={isPlaceholder ? "Chọn loại câu hỏi" : "Chỉnh sửa"}
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <img
                      src="/assets/img/icon-edit.svg"
                      alt="edit"
                      style={{ width: 18, height: 18 }}
                    />
                  </a>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleSetDeleteQuestion(question._id);
                    }}
                    data-toggle="modal"
                    data-target="#delete-question"
                    title="Xóa"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <img
                      src="/assets/img/icon-delete.svg"
                      alt="delete"
                      style={{ width: 18, height: 18 }}
                    />
                  </a>
                </div>
              </td>
            </tr>
          )}
        </Draggable>
      );
    }
    const getAnswerText = () => {
      try {
        if (this.getAnswerDisplay) {
          const v = this.getAnswerDisplay(
            question.correctAnswers ||
            question.answer ||
            question.answer_content,
            question,
          );
          if (v) return String(v);
        }
        if (
          Array.isArray(question.correctAnswers) &&
          question.correctAnswers.length
        ) {
          return question.correctAnswers.map((a) => a.value || a).join(", ");
        }
        if (question.answer) return String(question.answer);
        if (question.answer_content) return String(question.answer_content);
        return "";
      } catch (e) {
        return "";
      }
    };

    const stripHtml = (html) => {
      if (!html && html !== 0) return "";
      if (typeof html !== "string") return String(html);
      return html.replace(/<[^>]*>/g, "");
    };

    const answerText = stripHtml(getAnswerText()) || ""; //Không có đáp án
    const displayDate =
      question.updatedAt ||
      question.updated_at ||
      question.createdAt ||
      question.created_at;
    const dateStr = displayDate
      ? baseHelpers.formatDateToString(displayDate)
      : null;
    const cellCenter = { textAlign: "center", verticalAlign: "middle" };
    const cellLeft = { textAlign: "left", verticalAlign: "middle" };
    const hasExplanation = (html) => {
      if (!html) return false;

      // 1️⃣ Decode HTML entity nếu có (&lt;img&gt;)
      const textarea = document.createElement("textarea");
      textarea.innerHTML = html;
      let decoded = textarea.value;

      if (!decoded) return false;

      decoded = decoded.replace(/\n/g, "").replace(/\r/g, "");

      const div = document.createElement("div");
      div.innerHTML = decoded;

      const imgs = div.querySelectorAll("img");
      for (let img of imgs) {
        if (img.getAttribute("src")?.trim()) {
          return true;
        }
      }

      const text = div.textContent || div.innerText || "";
      if (text.replace(/\u00A0/g, " ").trim().length > 0) {
        return true;
      }

      return false;
    };
    return (
      <Draggable key={stableKey} draggableId={draggableId} index={index}>
        {(provided, snapshot) => (
          <tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="v-middle table-row-item"
            style={{
              ...provided.draggableProps.style, // Quan trọng: Giữ style từ dnd
              opacity: snapshot.isDragging ? 0.5 : 1, // Thêm opacity khi kéo
              backgroundColor: snapshot.isDragging ? "#f0f8ff" : "transparent", // Thêm background khi kéo
            }}
          >
            <td></td>
            {/* 1: STT (Câu X) */}
            <td style={{ minWidth: 80, ...cellCenter }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {displayNumber || question.number || question.question_no
                  ? `Câu ${displayNumber || question.number || question.question_no}`
                  : ""}
              </div>
            </td>

            {/* 2: Đáp án (căn giữa) */}
            <td style={{ minWidth: 150, ...cellCenter }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  maxWidth: "220px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={answerText}
              >
                <span dangerouslySetInnerHTML={{ __html: answerText }} />
              </div>
            </td>

            {/* 3: Loại câu hỏi */}
            <td style={{ minWidth: 120, ...cellCenter }}>
              {this.renderQuestionType
                ? this.renderQuestionType(question.type)
                : question.type || ""}
            </td>

            {/* 4: Độ khó */}
            <td style={{ minWidth: 100, ...cellCenter }}>
              {this.renderQuestionLevel
                ? this.renderQuestionLevel(question)
                : question.level || question.question_level || ""}
            </td>

            {/* 5: Lời giải (căn trái) */}
            <td style={{ minWidth: 200, ...cellCenter }}>
              {hasExplanation(question.explanation) ? (
                <span className="badge bg-success">Đã có</span>
              ) : (
                <span className="badge bg-danger">Chưa có</span>
              )}
            </td>

            {/* 6: Video */}
            <td style={{ minWidth: 120, ...cellCenter }}>
              {question.video || question.video_link ? (
                (() => {
                  const v = question.video || question.video_link;
                  const val = typeof v === "string" ? v.trim() : v;
                  if (!val)
                    return <span className="badge bg-danger">Chưa có</span>;
                  const isLink =
                    typeof val === "string" &&
                    (val.startsWith("http://") || val.startsWith("https://"));
                  return isLink ? (
                    <span className="badge bg-success">Đã có</span>
                  ) : (
                    <span className="badge bg-success">Đã có</span>
                  );
                })()
              ) : (
                <span className="badge bg-danger">Chưa có</span>
              )}
            </td>

            {/* 7: Ngày tải lên */}
            <td style={{ minWidth: 140, ...cellCenter }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {dateStr ? (
                  dateStr
                ) : (
                  <span className="badge bg-danger">Chưa có</span>
                )}
              </div>
            </td>

            {/* 8: Thao tác (căn giữa, icon cách nhau) */}
            <td style={{ width: 150, ...cellCenter }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Nút chỉnh sửa */}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.handleOpenModalUpdateQuestionTopicGroup(
                      question,
                      question.questionId,
                      question.subject,
                      idSubject,
                    );
                  }}
                  title="Chỉnh sửa"
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <img
                    src="/assets/img/icon-edit.svg"
                    alt="edit"
                    style={{ width: 18, height: 18 }}
                  />
                </a>

                {/* Nút xóa */}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.handleSetDeleteQuestion(question._id);
                  }}
                  data-toggle="modal"
                  data-target="#delete-question"
                  title="Xóa"
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <img
                    src="/assets/img/icon-delete.svg"
                    alt="delete"
                    style={{ width: 18, height: 18 }}
                  />
                </a>
              </div>
            </td>

            {/* Câu hỏi thử nghiệm */}
            <td
              style={{
                width: 70,
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <label className="custom-orange-checkbox">
                <input
                  type="checkbox"
                  checked={question.isTestQuestion || false}
                  onChange={(e) => {
                    this.handleCheckedTestingQuestion(
                      question._id,
                      idSubject,
                      e.target.checked,
                    );
                  }}
                />
                <span className="checkmark"></span>
              </label>

              <style>
                {`
      .custom-orange-checkbox {
        position: relative;
        display: inline-block;
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .custom-orange-checkbox input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      /* Viền cam mặc định */
      .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        border: 2px solid #ff7a00;
        border-radius: 4px;
        background-color: white;
        transition: all 0.2s ease;
      }

      /* Hover làm viền đậm và phóng to */
      .custom-orange-checkbox:hover .checkmark {
        border-color: #ff5500;
        transform: scale(1.1);
      }

      /* Khi được chọn */
      .custom-orange-checkbox input:checked + .checkmark {
        background-color: #ff7a00;
        border-color: #ff7a00;
      }

      /* Dấu tick trắng bên trong */
      .checkmark::after {
        content: "";
        position: absolute;
        display: none;
      }

      .custom-orange-checkbox input:checked + .checkmark::after {
        display: block;
      }

      .custom-orange-checkbox .checkmark::after {
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    `}
              </style>
            </td>
          </tr>
        )}
      </Draggable>
    );
  }
  handleDeleteGroupTopic = (groupTopicId) => {
    this.setState((prevState) => {
      const updatedTabData = prevState.tabData.map((tab) => {
        if (tab.exam_section_type === "NHOM_CHU_DE") {
          return {
            ...tab,
            groupTopic: (tab.groupTopic || []).filter(
              (group) =>
                group.idTopic !== groupTopicId && group._id !== groupTopicId,
            ),
          };
        }
        return tab;
      });
      const updatedParts =
        this.convertGroupTabDataToUploadFormat(updatedTabData);
      return {
        tabData: updatedTabData,
        parts: updatedParts,
      };
    });
  };

  fetchRows(
    questions,
    droppableId = "questions-droppable",
    isSubSection = false,
    subSectionId = null,
  ) {
    if (isSubSection) {
      const stts =
        questions?.map((q) => q.number || q.question_no).filter((n) => n > 0) ||
        [];
    }
    const { fileQuestions = [] } = this.state;
    let allQuestions = [
      ...(Array.isArray(questions) ? questions : []),
      ...(Array.isArray(fileQuestions) ? fileQuestions : []),
    ];
    if (allQuestions.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan="8" className="text-center text-muted">
              Chưa có câu hỏi nào
            </td>
          </tr>
        </tbody>
      );
    }
    const childQuestionsMap = new Map();
    const clusterQuestions = new Map();
    allQuestions.forEach((q, index) => {
      const hasParentId =
        q.parentId !== null &&
        q.parentId !== undefined &&
        String(q.parentId) !== "";
      const isCluster = (q.type || "").toUpperCase() === "CLUSTER";

      if (isCluster && !hasParentId) {
        const clusterId = q._id || q.questionId || q.question_id;
        clusterQuestions.set(String(clusterId), q);
      } else if (hasParentId) {
        const parentId = String(q.parentId);
        if (!childQuestionsMap.has(parentId)) {
          childQuestionsMap.set(parentId, []);
        }
        childQuestionsMap.get(parentId).push(q);
      }
    });

    const rows = [];

    const isSubSectionContext =
      droppableId &&
      (droppableId.startsWith("subsection-") ||
        droppableId.includes("subsection") ||
        droppableId.startsWith("sub-") ||
        droppableId.includes("sub-"));

    const currentNumber = isSubSectionContext
      ? 1
      : this.getStartingQuestionNumber();
    let questionIndex = 0;

    allQuestions = allQuestions.map((question) => {
      if ((question.type || "").toUpperCase() === "CLUSTER") {
        return { ...question, number: 0, question_no: null };
      }

      // ✅ GIỮ NGUYÊN number từ API - không renumber
      // Chỉ assign number nếu thực sự không có (undefined)
      if (question.number !== undefined && question.number !== null) {
        return question; // Giữ nguyên số từ API
      }

      // Nếu không có number, mới assign số mới
      const newSTT = currentNumber + questionIndex++;
      return { ...question, number: newSTT, question_no: newSTT };
    });
    allQuestions.forEach((q, index) => {
      const hasParentId =
        q.parentId !== null &&
        q.parentId !== undefined &&
        String(q.parentId) !== "";
      const isCluster = q.type === "cluster" || q.type === "Cluster";
      if (hasParentId) {
        return;
      }

      if (isCluster) {
        const clusterId = q.questionId || q._id || q.question_id; // ✅ ƪu tiên questionId
        const childQuestions = childQuestionsMap.get(String(clusterId)) || [];
        const clusterRow = this.createClusterRow(
          q,
          rows.length,
          droppableId,
          childQuestions.length,
          subSectionId,
        );
        rows.push(clusterRow);
        if (this.isClusterExpanded(clusterId)) {
          childQuestions.forEach((child, childIdx) => {
            const childRow = this.createRow(
              child,
              rows.length,
              subSectionId,
              droppableId,
              true, // ✅ QUAN TRỌNG: Đánh dấu là child question
            );
            rows.push(childRow);
          });
        } else {
        }
      } else {
        const row = this.createRow(q, rows.length, subSectionId, droppableId);
        rows.push(row);
      }
    });

    return (
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <tbody ref={provided.innerRef} {...provided.droppableProps}>
            {rows.filter((row) => row !== null)}
            {provided.placeholder}
          </tbody>
        )}
      </Droppable>
    );
  }
  handleDownload = async (type) => {
    console.log("Download type:", type);


    const data = {
      exam_id: this.state.examId,
      export_type: type,
    };
    await this.props.exportWord(data)
    this.setState({ showDropdown: false });
  };
  createClusterRow = (
    question,
    index,
    droppableId,
    childCount,
    subSectionId = null,
  ) => {
    const stableKey =
      question.questionId ||
      question._id ||
      question.question_id ||
      `cluster-${index}`;
    const draggableId = `${droppableId}-${stableKey}`;
    const clusterId =
      question.questionId || question._id || question.question_id;
    const clusterKey = String(clusterId);

    return (
      <Draggable key={stableKey} draggableId={draggableId} index={index}>
        {(provided, snapshot) => (
          <tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="table-row-item cluster-question"
            style={{
              ...provided.draggableProps.style, // Quan trọng: Giữ style từ dnd
              opacity: snapshot.isDragging ? 0.5 : 1, // Thêm opacity khi kéo
              backgroundColor: snapshot.isDragging ? "#f0f8ff" : "transparent", // Thêm background khi kéo
            }}
          >
            {/* Cột expand/collapse */}
            <td className="text-center align-middle p-sm-1">
              <i
                className={`fa ${this.isClusterExpanded(clusterKey)
                  ? "fa-chevron-down"
                  : "fa-chevron-right"
                  } cursor-pointer mr-2`}
                onClick={() => this.toggleExpanded(clusterKey)}
                style={{
                  fontSize: "14px",
                  color: "#007bff",
                  cursor: "pointer",
                }}
                title={
                  this.isClusterExpanded(clusterKey) ? "Thu gọn" : "Mở rộng"
                }
              ></i>
            </td>

            {/* Cột Câu hỏi chùm + badge */}
            <td className="align-middle p-sm-1">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  whiteSpace: "nowrap",
                  fontWeight: "600",
                  color: "#007bff",
                }}
              >
                Câu hỏi chùm
              </div>
            </td>
            <td className="text-center align-middle p-sm-1">
              <span
                className="badge badge-info ml-2"
                style={{ fontSize: "11px" }}
              >
                {childCount} câu hỏi
              </span>
            </td>
            {/* Loại câu hỏi */}
            <td className="text-center align-middle p-sm-1">
              {this.renderQuestionType(question.type)}
            </td>

            {/* Độ khó */}
            <td className="text-center align-middle p-sm-1">
              {this.renderQuestionLevel(question) ||
                question.level ||
                question.question_level ||
                ""}
            </td>

            {/* Lời giải */}
            <td className="text-center align-middle p-sm-1"></td>

            {/* Video */}
            <td className="text-center align-middle p-sm-1"></td>
            {/* Ngày tải lên */}
            <td className="text-center align-middle p-sm-1">
              {(() => {
                const displayDate =
                  question.updatedAt ||
                  question.updated_at ||
                  question.createdAt ||
                  question.created_at;
                return displayDate
                  ? baseHelpers.formatDateToString(displayDate)
                  : null;
              })()}
            </td>

            {/* Thao tác */}
            <td className="text-center align-middle p-sm-1">
              <div className="item-action d-flex justify-content-center">
                <a
                  className="mr-14"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.handleOpenModalUpdateQuestion(question, subSectionId);
                  }}
                  title="Chỉnh sửa câu hỏi chùm"
                >
                  <img src="/assets/img/icon-edit.svg" alt="" />
                </a>
                <a
                  onClick={() => this.handleSetDeleteQuestion(clusterId)}
                  data-toggle="modal"
                  data-target="#delete-question"
                  title="Xóa câu hỏi chùm"
                  style={{ cursor: "pointer" }}
                >
                  <img src="/assets/img/icon-delete.svg" alt="" />
                </a>
              </div>
            </td>
          </tr>
        )}
      </Draggable>
    );
  };

  getKeyTabActive = () => {
    let tabActive = this.state.tabData.filter((item) => item.active);
    return tabActive && tabActive.length > 0 ? tabActive[0].key : "tabCreate";
  };
  handleTabChange = (key) => {
    this.setState(
      {
        selectedSectionId: null, // Reset section selection
        examSectionId: null, // Reset exam section ID
        statusTopic: null, // Reset topic status
        currentClusterId: null, // Reset cluster context
        idTopicGroup: null, // Reset topic group ID
        idSubject: null, // Reset subject ID
        examSectionSubjectId: null, // Reset exam section subject ID
        subject_id: null, // Reset subject ID
        listSubjectGroups: [], // Reset subject groups
        currentQuestionvalue: null, // Reset current question
        actionQuestion: null, // Reset action
        questionNo: null, // Reset question number
        currentCreationMode: null, // Reset creation mode
        expandedClusters: {}, // Reset expanded clusters
      },
      () => {
        const activeTab = this.state.tabData.find((tab) => tab._id === key);
        const activeSection = this.state.sections.find(
          (section) => section.id === key,
        );

        if (activeTab) {
          let sectionType = "normal";
          if (
            activeTab.exam_section_type === "NHOM_CHU_DE" ||
            (activeSection &&
              (activeSection.type === "group" ||
                activeSection.type === "NHOM_CHU_DE"))
          ) {
            sectionType = "group";
          }

          this.setState({
            selectedSectionId: key, // Set selectedSectionId cho tab mới
            examSectionId: key, // Set examSectionId cho tab mới
            statusTopic:
              activeTab.exam_section_type === "NHOM_CHU_DE"
                ? "NHOM_CHU_DE"
                : null, // Set statusTopic nếu là NHOM_CHU_DE
            selectedSectionType: sectionType,
          });
        }
      },
    );
  };

  setSelectedQuestion = async (question) => {
    if (question) {
      await this.setState({
        currentQuestionvalue: question,
      });
    }
  };

  handleDeleteGroupQuestionApi = async () => {
    this.props.deleteGroup({
      exam_section_group_id: this.state.examSectionGroupId,
    });
    let tabNew = this.state.tabData;
    for (let i = 0; i < tabNew.length; i++) {
      if (
        tabNew[i]._id === this.state.examSectionId &&
        tabNew[i].exam_section_type === "GROUP_SUBJECT"
      ) {
        for (let j = 0; j < tabNew[i].exam_section_group.length; j++) {
          if (
            tabNew[i].exam_section_group[j]._id ===
            this.state.examSectionGroupId
          ) {
            tabNew[i].exam_section_group.splice(j, 1);
          }
        }
      }
    }
    this.setState(
      {
        tabData: tabNew,
      },
      () => {
        if (typeof this.syncSectionsWithTabData === "function") {
          this.syncSectionsWithTabData();
        }
      },
    );
  };

  handleDeleteQuestionApi = async () => {
    let tabNew = this.state.tabData;
    const currentSectionId =
      this.state.selectedSectionId || this.state.examSectionId;
    const subSectionId = this.state.deleteQuestionSubSectionId; // Sử dụng subSectionId

    for (let i = 0; i < tabNew.length; i++) {
      if (tabNew[i]._id === currentSectionId) {
        if (tabNew[i].questions) {
          const beforeCount = tabNew[i].questions.length;
          tabNew[i].questions = tabNew[i].questions.filter(
            (question) => !this.state.deleteQuestionIds.includes(question._id),
          );
        }
        if (tabNew[i].subSections && Array.isArray(tabNew[i].subSections)) {
          tabNew[i].subSections = tabNew[i].subSections.map((subSection) => {
            if (subSection.questions && Array.isArray(subSection.questions)) {
              const beforeCount = subSection.questions.length;
              subSection.questions = subSection.questions.filter(
                (question) =>
                  !this.state.deleteQuestionIds.includes(question._id),
              );
            }
            return subSection;
          });
        }
        if (tabNew[i].childExam && Array.isArray(tabNew[i].childExam)) {
          tabNew[i].childExam = tabNew[i].childExam.map((child) => {
            if (child.questions && Array.isArray(child.questions)) {
              const beforeCount = child.questions.length;
              child.questions = child.questions.filter(
                (question) =>
                  !this.state.deleteQuestionIds.includes(question._id),
              );
            }
            return child;
          });
        }
        if (tabNew[i].groupTopic && Array.isArray(tabNew[i].groupTopic)) {
          tabNew[i].groupTopic = tabNew[i].groupTopic.map((group) => {
            if (group.subjects && Array.isArray(group.subjects)) {
              group.subjects = group.subjects.map((subject) => {
                if (subject.questions && Array.isArray(subject.questions)) {
                  const beforeCount = subject.questions.length;
                  subject.questions = subject.questions.filter(
                    (question) =>
                      !this.state.deleteQuestionIds.includes(question._id),
                  );
                }
                return subject;
              });
            }
            return group;
          });
        }
        if (tabNew[i].exam_section_type === "GROUP_SUBJECT") {
          for (let j = 0; j < tabNew[i].exam_section_group.length; j++) {
            if (
              tabNew[i].exam_section_group[j]._id ===
              this.state.examSectionGroupId
            ) {
              for (
                let k = 0;
                k < tabNew[i].exam_section_group[j].subjects.length;
                k++
              ) {
                if (
                  tabNew[i].exam_section_group[j].subjects[k].subject_id ===
                  this.state.examSectionSubjectId
                ) {
                  tabNew[i].exam_section_group[j].subjects[k].questions =
                    tabNew[i].exam_section_group[j].subjects[
                      k
                    ].questions.filter(
                      (question) =>
                        !this.state.deleteQuestionIds.includes(question._id),
                    );
                  const qs =
                    tabNew[i].exam_section_group[j].subjects[k].questions || [];
                  tabNew[i].exam_section_group[j].subjects[k].questions = [
                    ...qs,
                  ].sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at),
                  );
                  for (
                    let idx = 0;
                    idx <
                    tabNew[i].exam_section_group[j].subjects[k].questions
                      .length;
                    idx++
                  ) {
                    const q =
                      tabNew[i].exam_section_group[j].subjects[k].questions[
                      idx
                      ];
                    q.question_no = idx + 1;
                    if (q.code !== undefined) q.code = String(idx + 1);
                  }
                }
              }
            }
          }
        }
      }
    }
    this.setState(
      (prev) => ({
        deleteQuestionIds: [],
        deleteQuestionSubSectionId: null,
        parts: this.convertTabDataToUploadFormat(),
        tabData: tabNew,
        selectedSectionId:
          prev.selectedSectionId ||
          (tabNew[0] && (tabNew[0]._id || tabNew[0].id)),
        examSectionId:
          prev.selectedSectionId ||
          (tabNew[0] && (tabNew[0]._id || tabNew[0].id)),
      }),
      () => {
        if (typeof this.syncSectionsWithTabData === "function") {
          this.syncSectionsWithTabData();
        }
        this.saveTabDataToSession();
        this.syncTabDataWithParts();
      },
    );
  };

  handleSetDeleteQuestion = (id, subSectionId = null) => {
    const currentQuestions = this.getQuestionsForCurrentSelection();
    const toStr = (v) => (v === null || v === undefined ? null : String(v));
    const idStr = toStr(id);
    const questionToDelete = currentQuestions.find(
      (q) => toStr(q._id) === idStr,
    );

    let deleteIds = [id];
    if (
      questionToDelete &&
      (questionToDelete.type === "Cluster" ||
        questionToDelete.type === "cluster")
    ) {
      const childQuestions = currentQuestions.filter(
        (q) => toStr(q.parentId ?? q.parent_id) === idStr,
      );
      const childIds = childQuestions.map((q) => q._id);
      deleteIds = [...deleteIds, ...childIds];
    }
    this.setState({
      deleteQuestionIds: deleteIds,
      deleteQuestionSubSectionId: subSectionId,
    });
  };
  getCurrentSubjectId = () => {
    return this.state.examSectionSubjectId || this.state.subject_id;
  };
  setCurrentSubjectId = (subjectId) => {
    if (subjectId) {
      this.setState({
        examSectionSubjectId: subjectId,
        subject_id: subjectId,
      });
    }
  };

  buildQuestionDataInitSectionFormAPI = (part) => {
    const mainQuestions = [];
    if (
      !part.subpart ||
      !Array.isArray(part.subpart) ||
      part.subpart.length === 0
    ) {
      return mainQuestions;
    }
    const firstSubpart = part.subpart[0];
    if (!firstSubpart.children || !Array.isArray(firstSubpart.children)) {
      return mainQuestions;
    }
    firstSubpart.children.forEach((child) => {
      if (child.questions && Array.isArray(child.questions)) {
        child.questions.forEach((qWrap, qIdx) => {
          const normalizedQuestion = this.normalizeQuestion(qWrap, qIdx);
          mainQuestions.push(normalizedQuestion);
          if (
            normalizedQuestion.needsChildRecreation &&
            normalizedQuestion.clusterQuestions
          ) {
            normalizedQuestion.clusterQuestions.forEach((childQ, childIdx) => {
              const childId = `child-${normalizedQuestion._id}-${childIdx}`;
              const childQuestion = {
                _id: childId,
                questionId: childId,
                question_id: childId,
                parentId: normalizedQuestion._id,
                question_no: childIdx + 1,
                number: childIdx + 1,
                type: childQ.type || "singlechoice",
                rawHtml: childQ.question || `Câu hỏi con ${childIdx + 1}`,
                correctAnswers: childQ.selectedAnswers || [],
                choices: childQ.choices || [],
                explanation: childQ.explanation || "",
                level: normalizedQuestion.level || "",
                created_at: new Date().toISOString(),
                isTemp: false,
                source: "upload",
              };
              mainQuestions.push(childQuestion);
            });
            delete normalizedQuestion.clusterQuestions;
            delete normalizedQuestion.needsChildRecreation;
          }
        });
      }
    });

    return mainQuestions;
  };
  buildChildExamInitSectionsFromAPIAllItems = (part) => {
    const subSections = [];

    if (part.subpart && Array.isArray(part.subpart)) {
      part.subpart.forEach((subpart, subIdx) => {
        const subSectionId = `subsection-${Date.now()}-${subIdx}`;
        const subSectionName = subpart.name || `Phần thi con ${subIdx + 1}`;
        let allQuestions = [];
        if (subpart.children && Array.isArray(subpart.children)) {
          subpart.children.forEach((child) => {
            if (child.questions && Array.isArray(child.questions)) {
              const normalizedQuestions = child.questions.map((q, qIdx) =>
                this.normalizeQuestion(q, qIdx),
              );
              allQuestions = [...allQuestions, ...normalizedQuestions];
            }
          });
        }
        const processedQuestions = [];
        const childQuestionsToAdd = [];

        allQuestions.forEach((question) => {
          if (
            question.type === "cluster" &&
            question.needsChildRecreation &&
            question.clusterQuestions
          ) {
            const clusterParent = {
              ...question,
              parentId: null,
              type: "cluster",
            };
            processedQuestions.push(clusterParent);
            question.clusterQuestions.forEach((childQ, childIdx) => {
              const childId = `child-${question._id}-${childIdx}`;
              const childQuestion = {
                _id: childId,
                questionId: childId,
                question_id: childId,
                parentId: question._id,
                question_no: childIdx + 1,
                number: childIdx + 1,
                type: childQ.type || "singlechoice",
                rawHtml: childQ.question || `Câu hỏi con ${childIdx + 1}`,
                correctAnswers: childQ.selectedAnswers || [],
                choices: childQ.choices || [],
                explanation: childQ.explanation || "",
                level: question.level || "",
                created_at: new Date().toISOString(),
                isTemp: false,
                source: "upload",
              };
              childQuestionsToAdd.push(childQuestion);
            });
            delete question.clusterQuestions;
            delete question.needsChildRecreation;
          } else {
            processedQuestions.push(question);
          }
        });
        const finalQuestions = [...processedQuestions, ...childQuestionsToAdd];

        subSections.push({
          id: subSectionId,
          name: subSectionName,
          questions: finalQuestions,
          isMain: subpart.isMain || false, // ✅ THÊM: Lưu isMain từ API
        });
      });
    }

    return subSections;
  };

  buildChildExamInitSectionsFromAPI = (part) => {
    const subSections = [];

    if (part.subpart && Array.isArray(part.subpart)) {
      part.subpart.slice(1).forEach((subpart, subIdx) => {
        const subSectionId = `subsection-${Date.now()}-${subIdx}`;
        const subSectionName = subpart.name || `Phần thi con ${subIdx + 1}`;
        let allQuestions = [];
        if (subpart.children && Array.isArray(subpart.children)) {
          subpart.children.forEach((child) => {
            if (child.questions && Array.isArray(child.questions)) {
              const normalizedQuestions = child.questions.map((q, qIdx) =>
                this.normalizeQuestion(q, qIdx),
              );
              allQuestions = [...allQuestions, ...normalizedQuestions];
            }
          });
        }
        const processedQuestions = [];
        const childQuestionsToAdd = [];

        allQuestions.forEach((question) => {
          if (
            question.type === "cluster" &&
            question.needsChildRecreation &&
            question.clusterQuestions
          ) {
            const clusterParent = {
              ...question,
              parentId: null,
              type: "cluster",
            };
            processedQuestions.push(clusterParent);
            question.clusterQuestions.forEach((childQ, childIdx) => {
              const childId = `child-${question._id}-${childIdx}`;
              const childQuestion = {
                _id: childId,
                questionId: childId,
                question_id: childId,
                parentId: question._id,
                question_no: childIdx + 1,
                number: childIdx + 1,
                type: childQ.type || "singlechoice",
                rawHtml: childQ.question || `Câu hỏi con ${childIdx + 1}`,
                correctAnswers: childQ.selectedAnswers || [],
                choices: childQ.choices || [],
                explanation: childQ.explanation || "",
                level: question.level || "",
                created_at: new Date().toISOString(),
                isTemp: false,
                source: "upload",
              };
              childQuestionsToAdd.push(childQuestion);
            });
            delete question.clusterQuestions;
            delete question.needsChildRecreation;
          } else {
            processedQuestions.push(question);
          }
        });
        const finalQuestions = [...processedQuestions, ...childQuestionsToAdd];

        subSections.push({
          id: subSectionId,
          name: subSectionName,
          questions: finalQuestions,
          isMain: subpart.isMain || false, // ✅ THÊM: Lưu isMain từ API
        });
      });
    }
    return subSections;
  };
  classifySectionType = (part) => {
    const classification = {
      type: "MAC_DINH", // mặc định
      confidence: 0,
      groupName: "",
      indicators: [],
      hasSubSections: false, // Flag để đánh dấu có phần thi con
    };
    if (part.type) {
      classification.type = part.type;
      classification.confidence = 100;
      classification.indicators.push(
        `API explicitly declares type: ${part.type}`,
      );
      if (part.type === "MAC_DINH") {
        const subSectionInfo = this.checkForSubSections(part);
        if (subSectionInfo.hasSubSections) {
          classification.hasSubSections = true;
          classification.indicators.push(...subSectionInfo.indicators);
          classification.confidence = 95;
        }
      }

      return classification;
    }
    const title = Array.isArray(part.name) ? part.name[0] : part.name || "";
    const groupKeywords = [
      "nhóm chủ đề",
      "chủ đề",
      "group topic",
      "topic group",
      "khoa học",
      "tư duy",
    ];
    if (
      groupKeywords.some((keyword) => title.toLowerCase().includes(keyword))
    ) {
      classification.type = "NHOM_CHU_DE";
      classification.confidence = 80;
      classification.indicators.push("Title contains topic group keywords");
      classification.groupName = title;
      return classification;
    }
    if (part.subpart && Array.isArray(part.subpart)) {
      const hasMultipleSubjects = part.subpart.some((subpart) => {
        if (
          subpart.children &&
          Array.isArray(subpart.children) &&
          subpart.children.length > 1
        ) {
          const childNames = subpart.children.map(
            (child) => child.name?.toLowerCase() || "",
          );
          const uniqueNames = [...new Set(childNames)];
          return uniqueNames.length > 1;
        }
        return false;
      });

      if (hasMultipleSubjects) {
        classification.type = "NHOM_CHU_DE";
        classification.confidence = 75;
        classification.indicators.push(
          "Multiple subjects detected in subpart structure",
        );
        return classification;
      }
    }
    const subSectionInfo = this.checkForSubSections(part);
    if (subSectionInfo.hasSubSections) {
      classification.hasSubSections = true;
      classification.indicators.push(...subSectionInfo.indicators);
      classification.confidence = 90;
      classification.type = "MAC_DINH"; // Vẫn là mặc định nhưng có phần thi con
    }

    return classification;
  };
  checkForSubSections = (part) => {
    const result = {
      hasSubSections: false,
      indicators: [],
      subSectionsCount: 0,
    };

    if (
      !part.subpart ||
      !Array.isArray(part.subpart) ||
      part.subpart.length <= 1
    ) {
      return result;
    }
    let hasNumberPattern = 0;
    let hasSingleChildWithQuestions = 0;
    let hasUniqueNames = 0;

    part.subpart.forEach((subpart, idx) => {
      const subpartName = subpart.name || "";
      if (/^\d+\.\d+\s+/.test(subpartName)) {
        hasNumberPattern++;
      }
      if (
        subpart.children &&
        Array.isArray(subpart.children) &&
        subpart.children.length === 1 &&
        subpart.children[0].questions &&
        Array.isArray(subpart.children[0].questions)
      ) {
        hasSingleChildWithQuestions++;
      }
      const isUniqueName =
        part.subpart.filter((sp) => sp.name === subpartName).length === 1;
      if (isUniqueName && subpartName.trim() !== "") {
        hasUniqueNames++;
      }
    });

    const minRequiredPatterns = Math.ceil(part.subpart.length * 0.7);

    if (hasNumberPattern >= minRequiredPatterns) {
      result.hasSubSections = true;
      result.indicators.push(
        `Found ${hasNumberPattern}/${part.subpart.length} subparts with number pattern`,
      );
      result.subSectionsCount = part.subpart.length;
    } else if (
      hasSingleChildWithQuestions >= minRequiredPatterns &&
      hasUniqueNames >= minRequiredPatterns
    ) {
      result.hasSubSections = true;
      result.indicators.push(
        `Found ${hasSingleChildWithQuestions}/${part.subpart.length} subparts with single child structure`,
      );
      result.indicators.push(
        `Found ${hasUniqueNames}/${part.subpart.length} subparts with unique names`,
      );
      result.subSectionsCount = part.subpart.length;
    }
    return result;
  };
  hasMainQuestionsFromAPI = (currentTab) => {
    if (
      !currentTab ||
      !currentTab.questions ||
      !Array.isArray(currentTab.questions)
    ) {
      return false;
    }
    const apiQuestions = currentTab.questions.filter(
      (q) =>
        q.uploaded === true ||
        q.source === "upload" ||
        q.__temp === false ||
        !q.isTemp,
    );
    return apiQuestions.length > 0;
  };
  addQuestionToTabData = (question, originalData) => {
    return new Promise((resolve) => {
      const normalizedQuestion = this.normalizeManualQuestion(question);
      if (question.type !== "cluster" && question.type !== "Cluster") {
        if (this.state.currentSubSectionId) {
          normalizedQuestion.number = this.getQuestionNoNewForSubSection(
            this.state.currentSubSectionId,
          );
          normalizedQuestion.question_no = normalizedQuestion.number;
        } else {
          normalizedQuestion.number = this.getNextQuestionNumber();
          normalizedQuestion.question_no = normalizedQuestion.number;
        }
      } else {
        normalizedQuestion.number = 0;
        normalizedQuestion.question_no = null;
      }

      let tabNew = [...this.state.tabData];
      if (tabNew.length === 0) {
        const hasUploadedSections =
          Array.isArray(this.state.sections) && this.state.sections.length > 0;
        if (!hasUploadedSections) {
          const defaultSection = {
            _id: this.state.examSectionId || "default-section",
            exam_section_name: "Phần mặc định",
            exam_section_type: "MAC_DINH",
            exam_section_time: this.state.time || 90,
            total_score: 10,
            calculate_score_type: "total_score",
            questions: [],
            active: true,
          };
          tabNew.push(defaultSection);
        }
      }
      let questionAdded = false;
      let targetSectionId =
        this.state.selectedSectionId ||
        this.state.examSectionId ||
        (tabNew[0] && tabNew[0]._id);
      const sections = Array.isArray(this.state.sections)
        ? this.state.sections
        : [];
      const selectedIndex = sections.findIndex(
        (s) => s.id === this.state.selectedSectionId,
      );
      if (selectedIndex >= 0 && selectedIndex < tabNew.length) {
        targetSectionId = tabNew[selectedIndex]._id || targetSectionId;
      }

      for (let i = 0; i < tabNew.length; i++) {
        if (tabNew[i]._id === targetSectionId) {
          if (this.state.currentSubSectionId) {
            if (tabNew[i].subSections) {
              const subSection = tabNew[i].subSections.find(
                (sub) => sub.id === this.state.currentSubSectionId,
              );
              if (subSection) {
                if (!subSection.questions) {
                  subSection.questions = [];
                }
                if (question.type === "cluster" && question.parentId === null) {
                  if (!normalizedQuestion._id) {
                    normalizedQuestion._id = this.generateObjectId();
                  }
                  // ✅ FIX: Ensure questionId is never null
                  if (
                    !normalizedQuestion.questionId ||
                    normalizedQuestion.questionId === null
                  ) {
                    normalizedQuestion.questionId = normalizedQuestion._id;
                  }
                  subSection.questions.push(normalizedQuestion);
                } else if (question.parentId) {
                  if (!normalizedQuestion._id) {
                    normalizedQuestion._id = this.generateObjectId();
                  }
                  // ✅ FIX: Ensure questionId is never null
                  if (
                    !normalizedQuestion.questionId ||
                    normalizedQuestion.questionId === null
                  ) {
                    normalizedQuestion.questionId = normalizedQuestion._id;
                  }
                  subSection.questions.push(normalizedQuestion);
                } else {
                  if (!normalizedQuestion._id) {
                    normalizedQuestion._id = this.generateObjectId();
                  }
                  // ✅ FIX: Ensure questionId is never null
                  if (
                    !normalizedQuestion.questionId ||
                    normalizedQuestion.questionId === null
                  ) {
                    normalizedQuestion.questionId = normalizedQuestion._id;
                  }
                  subSection.questions.push(normalizedQuestion);
                }
                questionAdded = true;
                break;
              }
            }
            if (tabNew[i].childExam) {
              const childExamSection = tabNew[i].childExam.find(
                (child) => child.id === this.state.currentSubSectionId,
              );
              if (childExamSection) {
                if (!childExamSection.questions) {
                  childExamSection.questions = [];
                }
                if (question.type === "cluster" && question.parentId === null) {
                  if (!normalizedQuestion._id) {
                    normalizedQuestion._id = this.generateObjectId();
                  }
                  // ✅ FIX: Ensure questionId is never null
                  if (
                    !normalizedQuestion.questionId ||
                    normalizedQuestion.questionId === null
                  ) {
                    normalizedQuestion.questionId = normalizedQuestion._id;
                  }
                  childExamSection.questions.push(normalizedQuestion);
                } else if (question.parentId) {
                  if (!normalizedQuestion._id) {
                    normalizedQuestion._id = this.generateObjectId();
                  }
                  // ✅ FIX: Ensure questionId is never null
                  if (
                    !normalizedQuestion.questionId ||
                    normalizedQuestion.questionId === null
                  ) {
                    normalizedQuestion.questionId = normalizedQuestion._id;
                  }
                  childExamSection.questions.push(normalizedQuestion);
                } else {
                  if (!normalizedQuestion._id) {
                    normalizedQuestion._id = this.generateObjectId();
                  }
                  // ✅ FIX: Ensure questionId is never null
                  if (
                    !normalizedQuestion.questionId ||
                    normalizedQuestion.questionId === null
                  ) {
                    normalizedQuestion.questionId = normalizedQuestion._id;
                  }
                  childExamSection.questions.push(normalizedQuestion);
                }
                questionAdded = true;
                break;
              }
            }
          }

          if (tabNew[i].exam_section_type === "MAC_DINH") {
            if (!tabNew[i].questions) {
              tabNew[i].questions = [];
            }
            // ✅ FIX: Ensure questionId is never null before pushing
            if (
              !normalizedQuestion.questionId ||
              normalizedQuestion.questionId === null
            ) {
              normalizedQuestion.questionId =
                normalizedQuestion._id || this.generateObjectId();
            }
            if (question.type === "cluster" && question.parentId === null) {
              tabNew[i].questions.push(normalizedQuestion);
            } else if (question.parentId) {
              tabNew[i].questions.push(normalizedQuestion);
            } else {
              tabNew[i].questions.push(normalizedQuestion);
            }

            questionAdded = true;
            break;
          } else if (tabNew[i].exam_section_type === "GROUP_SUBJECT") {
            if (
              tabNew[i].exam_section_group &&
              tabNew[i].exam_section_group.length > 0
            ) {
              const firstGroup = tabNew[i].exam_section_group[0];
              if (firstGroup.subjects && firstGroup.subjects.length > 0) {
                if (!firstGroup.subjects[0].questions) {
                  firstGroup.subjects[0].questions = [];
                }
                // ✅ FIX: Ensure questionId is never null before pushing
                if (
                  !normalizedQuestion.questionId ||
                  normalizedQuestion.questionId === null
                ) {
                  normalizedQuestion.questionId =
                    normalizedQuestion._id || this.generateObjectId();
                }
                if (question.type === "cluster" && question.parentId === null) {
                  firstGroup.subjects[0].questions.push(normalizedQuestion);
                } else if (question.parentId) {
                  firstGroup.subjects[0].questions.push(normalizedQuestion);
                } else {
                  firstGroup.subjects[0].questions.push(normalizedQuestion);
                }

                questionAdded = true;
                break;
              }
            }
          }
        }
      }
      if (!questionAdded && tabNew.length > 0) {
        if (!tabNew[0].questions) {
          tabNew[0].questions = [];
        }
        // ✅ FIX: Ensure questionId is never null before pushing
        if (
          !normalizedQuestion.questionId ||
          normalizedQuestion.questionId === null
        ) {
          normalizedQuestion.questionId =
            normalizedQuestion._id || this.generateObjectId();
        }
        tabNew[0].questions.push(normalizedQuestion);
      }

      resolve({ tabData: tabNew });
    });
  };

  handleOpenUpdateGroupQuestion = (idItemTabData) => {
    if (this.state.isAddingTopicGroup) {
      return;
    }

    try {
      const foundTab = this.state.tabData.find(
        (tab) => tab._id === idItemTabData,
      );

      if (!foundTab) {
        notification.error({
          message: "Không tìm thấy phần thi",
          description: `Không tìm thấy phần thi với ID: ${idItemTabData}`,
          placement: "topRight",
        });
        return;
      }
      if (
        foundTab.exam_section_type !== "NHOM_CHU_DE" ||
        !foundTab.groupTopic
      ) {
        notification.error({
          message: "Phần thi không hợp lệ",
          description: "Chỉ có thể chỉnh sửa phần thi nhóm chủ đề",
          placement: "topRight",
        });
        return;
      }

      const groupDetailForModal = {
        maxTopics: foundTab.maxTopics || 1,
        groups: foundTab.groupTopic.map((group) => ({
          id: group.idTopic,
          idTopic: group.idTopic, // ✅ THÊM: Preserve idTopic
          name: group.nameTopic,
          nameTopic: group.nameTopic, // ✅ THÊM: Preserve nameTopic
          type: group.type || "single", // ✅ THÊM: Preserve type
          maxTopics: group.maxTopics || foundTab.maxTopics || 1, // ✅ THÊM: Preserve maxTopics từ group hoặc foundTab
          maxSubjects: group.maxSubject || 1, // ✅ THÊM: Preserve maxSubjects từ group
          subjects: (group.subjects || []).map((subject) => ({
            id: subject.idSubject,
            idSubject: subject.idSubject, // ✅ THÊM: Preserve idSubject
            name: subject.nameSubject,
            nameSubject: subject.nameSubject, // ✅ THÊM: Preserve nameSubject
            questions: subject.questions || [],
          })),
        })),
      };
      this.setState(
        {
          showGroupModal: true,
          actionGroup: "update", // ✅ Chế độ update
          groupDetail: groupDetailForModal, // ✅ Dữ liệu để edit với đầy đủ maxTopics và maxSubjects
          itemGroupTabData: groupDetailForModal, // ✅ Dữ liệu để edit
          dataItemGroup: groupDetailForModal, // ✅ THÊM: Set dataItemGroup
          selectedSectionId: idItemTabData, // ✅ Set selectedSectionId để đồng bộ
          examSectionId: idItemTabData, // ✅ Set examSectionId để đồng bộ
        },
        () => {
          this.forceUpdate();
        },
      );
    } catch (error) {
      console.error("❌ Error opening update group modal:", error);
      notification.error({
        message: "Lỗi khi mở modal chỉnh sửa",
        description: error.message,
        placement: "topRight",
      });
    }
  };

  handleOpenModalUpdateQuestionTopicGroup = (
    question,
    topicGroupId = null,
    subjectId = null,
  ) => {
    const finalSubjectId =
      subjectId ||
      question.subject ||
      question.subject_id ||
      this.getCurrentSubjectId();

    this.setState(
      {
        questionIdGroupTopic: question._id,
        statusTopic: "NHOM_CHU_DE",
        actionQuestion: "update",
        currentQuestionvalue: null,
        idTopicGroup: topicGroupId || question._id,
        idSubject: finalSubjectId,
        questionNo: question.number || question.question_no || 1,
      },
      () => {
        const normalizedQuestion = this.normalizeQuestionForModal(question);
        normalizedQuestion.number =
          question.number || question.question_no || 1;
        normalizedQuestion.question_no =
          question.number || question.question_no || 1;

        this.setState({ currentQuestionvalue: normalizedQuestion }, () => {
          setTimeout(() => {
            const t = (normalizedQuestion.type || "").toString().toUpperCase();
            const trigger = (id) => $(id).trigger("click");
            if (
              t === "SINGLECHOICE" ||
              t === "TN_SINGLE_CHOICE" ||
              t === "SINGLE_CHOICE"
            )
              return trigger("#create-update");
            if (
              t === "MULTIPLECHOICE" ||
              t === "TN_MULTI_CHOICE" ||
              t === "MULTIPLE_CHOICE"
            )
              return trigger("#create-update5");
            if (t === "DRAGDROP" || t === "TN_DRAG_DROP" || t === "DRAG_DROP")
              return trigger("#create-update4");
            if (
              t === "FILLINBLANK" ||
              t === "FILL_IN_BLANK" ||
              t === "ESSAY" ||
              t === "TN_ESSAY"
            )
              return trigger("#create-update3");
            if (
              t === "TRUEFALSEMULTI" ||
              t === "TRUE_FALSE_MULTI" ||
              t === "TN_TRUE_FALSE_MULTI"
            )
              return trigger("#create-update2");
            if (
              t === "TRUEFALSE" ||
              t === "TRUE_FALSE" ||
              t === "TN_TRUE_FALSE"
            )
              return trigger("#create-update6");
            if (t === "CLUSTER") return trigger("#create-update7");

            const ans =
              normalizedQuestion.correctAnswers ||
              normalizedQuestion.answer ||
              normalizedQuestion.correctAnswer;
            if (
              typeof ans === "boolean" ||
              String(ans).toUpperCase() === "TRUE" ||
              String(ans).toUpperCase() === "FALSE"
            ) {
              return trigger("#create-update6");
            }
            if (Array.isArray(ans)) {
              return ans.length > 1
                ? trigger("#create-update5")
                : trigger("#create-update");
            }
            return trigger("#create-update");
          }, 0);
        });
      },
    );
  };

  handleOpenModalUpdateQuestion = (question, subSectionId = null) => {
    this.setState(
      {
        actionQuestion: "update",
        currentQuestionvalue: null,
        currentSubSectionId: subSectionId,
        selectedSectionId:
          this.state.selectedSectionId || this.state.examSectionId,
        questionNo: question.number || question.question_no || 1,
      },
      () => {
        const normalizedQuestion = this.normalizeQuestionForModal(question);
        if (!normalizedQuestion._id) {
          normalizedQuestion._id =
            normalizedQuestion.questionId ||
            normalizedQuestion.question_id ||
            this.generateObjectId();
        }
        normalizedQuestion.questionId = normalizedQuestion._id;
        normalizedQuestion.question_id = normalizedQuestion._id;
        normalizedQuestion.number =
          question.number || question.question_no || 1;
        normalizedQuestion.question_no =
          question.number || question.question_no || 1;

        this.setState({ currentQuestionvalue: normalizedQuestion }, () => {
          setTimeout(() => {
            const t = (normalizedQuestion.type || "").toString().toUpperCase();
            const trigger = (id) => $(id).trigger("click");

            if (t === "SINGLECHOICE" || t === "TN_SINGLE_CHOICE") {
              trigger("#create-update");
              return;
            }
            if (t === "MULTIPLECHOICE" || t === "TN_MULTI_CHOICE") {
              trigger("#create-update5");
              return;
            }
            if (t === "DRAGDROP" || t === "DRAG_DROP") {
              trigger("#create-update4");
              return;
            }
            if (t === "FILLINBLANK" || t === "FILL_IN_BLANK" || t === "ESSAY") {
              trigger("#create-update3");
              return;
            }
            if (t === "TRUEFALSEMULTI") {
              trigger("#create-update2");
              return;
            }
            if (t === "TRUEFALSE" || t === "TRUE_FALSE") {
              trigger("#create-update6");
              return;
            }
            if (t === "CLUSTER") {
              trigger("#create-update7");
              return;
            }
            const ans =
              normalizedQuestion.correctAnswers ||
              normalizedQuestion.answer ||
              normalizedQuestion.correctAnswer;
            if (
              typeof ans === "boolean" ||
              String(ans).toUpperCase() === "TRUE" ||
              String(ans).toUpperCase() === "FALSE"
            ) {
              trigger("#create-update6");
              return;
            }
            if (Array.isArray(ans)) {
              if (ans.length > 1) trigger("#create-update5");
              else trigger("#create-update");
              return;
            }
            trigger("#create-update");
          }, 0);
        });
      },
    );
  };

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  _onChangeSwitch = (e) => {
    var name = e.target.name;
    let checked = e.target.checked;
    this.setState({
      [name]: checked,
    });
  };

  _onChangeTypePoint = (e, index, idInput) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].calculate_score_type = value;
      if (value === "count_true") {
        document.getElementById(`${idInput}total_score`).style.display = "none";
        document.getElementById(`${idInput}point_per_question`).style.display =
          "none";
      } else {
        document.getElementById(`${idInput}total_score`).style.display =
          "block";
        document.getElementById(`${idInput}point_per_question`).style.display =
          "flex";
      }
      this.setState({ tabData: updatedTabData });
    }
  };

  async addNewQuestion(dataQuestion) {
    setLoader(true);
    try {
      let question = dataQuestion;
      let clusterQuestionId = null;

      if ((dataQuestion.type || "").toUpperCase() === "CLUSTER") {
        question = await this.handleClusterQuestionCreation(dataQuestion);
        clusterQuestionId = question._id || question.question_id;
      }

      const updatedState = await this.addQuestionToTabData(
        question,
        dataQuestion,
      );
      this.setState(updatedState, () => this.syncTabDataWithParts());

      if (question._childQuestions && Array.isArray(question._childQuestions)) {
        for (const childData of question._childQuestions) {
          childData.parentId = clusterQuestionId;
          await this.addNewQuestion(childData);
        }
      }

      if (clusterQuestionId) {
        this.setState((prevState) => ({
          expandedClusters: {
            ...prevState.expandedClusters,
            [clusterQuestionId]: true,
          },
          currentClusterId: clusterQuestionId,
        }));
      }
    } catch (error) {
      console.error("[ERROR] addNewQuestion failed:", error);
      alert(`Lỗi khi thêm câu hỏi: ${error.message}`);
    } finally {
      setLoader(false);
    }
  }
  async addNewQuestionToGroup(dataQuestion) {
    setLoader(true);

    try {
      let question = dataQuestion;
      let clusterQuestionId = null;

      if ((dataQuestion.type || "").toUpperCase() === "CLUSTER") {
        question = await this.handleClusterQuestionCreation(dataQuestion);
        clusterQuestionId = question._id || question.question_id;
      }

      const questionData = {
        ...question,
        subject_id: question.subject_id || this.getCurrentSubjectId(),
      };

      if (!questionData.subject_id) {
        throw new Error(
          "Không thể xác định môn học cho câu hỏi. Vui lòng chọn phần thi trước khi tạo câu hỏi.",
        );
      }

      const finalQuestion = {
        ...questionData,
        _id: this.generateObjectId(),
        created_at: new Date().toISOString(),
        isTemp: true,
      };

      const selectedSubject = this.findSubjectById(questionData.subject_id);
      if (!selectedSubject) {
        throw new Error(
          `Không tìm thấy môn học với ID: ${questionData.subject_id}`,
        );
      }

      const startNumberForChildren = this.getQuestionNoForTopicGroupSubject(
        selectedSubject.idSubject,
      );
      const tabData = [...this.state.tabData];
      const currentTabIdx = tabData.findIndex(
        (tab) => tab._id === this.state.examSectionId && tab.groupTopic,
      );

      if (currentTabIdx === -1) {
        throw new Error("Không tìm thấy phần nhóm chủ đề");
      }

      let updated = false;
      tabData[currentTabIdx].groupTopic.forEach((group) => {
        group.subjects.forEach((subject) => {
          if (subject.idSubject === selectedSubject.idSubject) {
            if (!Array.isArray(subject.questions)) subject.questions = [];
            subject.questions.push(finalQuestion);
            updated = true;
          }
        });
      });

      if (!updated) {
        throw new Error("Không thể thêm câu hỏi vào môn học");
      }

      if (
        finalQuestion._childQuestions &&
        Array.isArray(finalQuestion._childQuestions)
      ) {
        for (let i = 0; i < finalQuestion._childQuestions.length; i++) {
          await this.addNewQuestionToGroup({
            ...finalQuestion._childQuestions[i],
            parentId: clusterQuestionId,
            subject_id: questionData.subject_id,
            number: startNumberForChildren + i,
            question_no: startNumberForChildren + i,
          });
        }
      }

      const stateUpdates = {
        tabData,
        parts: this.convertGroupTabDataToUploadFormat(),
      };

      if (clusterQuestionId) {
        stateUpdates.expandedClusters = {
          ...this.state.expandedClusters,
          [clusterQuestionId]: true,
        };
        stateUpdates.currentClusterId = clusterQuestionId;
      }

      this.setState(stateUpdates, () => {
        this.saveTabDataToSession();
        this.syncSectionsWithTabData();
        this.syncTabDataWithParts();
      });
    } catch (error) {
      console.error("[ERROR] addNewQuestionToGroup failed:", error);
      notification.error({
        message: "Có lỗi khi thêm câu hỏi vào nhóm chủ đề",
        description: error.message,
        placement: "topRight",
      });
    } finally {
      setLoader(false);
    }
  }
  findSubjectById(subjectId) {
    if (
      this.state.listSubjectGroups &&
      Array.isArray(this.state.listSubjectGroups)
    ) {
      const subject = this.state.listSubjectGroups.find(
        (s) => s.idSubject === subjectId,
      );
      if (subject) return subject;
    }

    const tabData = [...this.state.tabData];
    const currentTab = tabData.find(
      (tab) => tab._id === this.state.examSectionId && tab.groupTopic,
    );
    if (currentTab && currentTab.groupTopic) {
      for (const group of currentTab.groupTopic) {
        if (group.subjects) {
          const subject = group.subjects.find((s) => s.idSubject === subjectId);
          if (subject) return subject;
        }
      }
    }
    return null;
  }

  normalizeTopicQuestionForAPI(question) {
    return this.normalizeManualQuestionForAPI(question);
  }
  convertTopicQuestionToAPIFormat(question) {
    return {
      id: question._id || question.id || question.question_id,
      content: question.rawHtml || "",
      answer: question.answer || "",
      correctAnswers: question.correctAnswers,
      explanation: question.explanation || "",
      choices: (question.choices || []).map((c) => ({
        label: c.label,
        text: c.text,
      })),
      level: question.level || question.question_level,
      type: (question.type || "").toLowerCase(),
      video_link: question.video_link || "",
      images: question.images || [],
    };
  }
  convertGroupTabDataToUploadFormat() {
    const tabData = this.state.tabData || [];
    const uploadParts = [];
    const normalizeCorrectAnswers = (q, apiType) => {
      let apiCorrectAnswers = [];

      if (q.correctAnswers || q.answer) {
        const answers = q.correctAnswers || q.answer || [];

        if (Array.isArray(answers)) {
          apiCorrectAnswers = answers.map((ans) => {
            if (typeof ans === "string") {
              if (apiType === "fillinblank" || apiType === "multiplechoice") {
                return { value: ans };
              } else {
                return { label: ans, value: ans };
              }
            } else if (ans && typeof ans === "object") {
              return {
                label: ans.label || ans.key || ans.id || ans.value || "",
                value:
                  ans.value || ans.text || ans.label || ans.key || ans.id || "",
              };
            }
            return ans;
          });
        } else {
          if (typeof answers === "string") {
            if (apiType === "fillinblank" || apiType === "multiplechoice") {
              apiCorrectAnswers = [{ value: answers }];
            } else {
              apiCorrectAnswers = [{ label: answers, value: answers }];
            }
          } else if (answers && typeof answers === "object") {
            apiCorrectAnswers = [
              {
                label:
                  answers.label ||
                  answers.key ||
                  answers.id ||
                  answers.value ||
                  "",
                value:
                  answers.value ||
                  answers.text ||
                  answers.label ||
                  answers.key ||
                  answers.id ||
                  "",
              },
            ];
          }
        }
      }

      return apiCorrectAnswers;
    };

    tabData.forEach((tab, idx) => {
      if (tab.exam_section_type !== "NHOM_CHU_DE") return;

      const partName = tab.exam_section_name || `Phần ${idx + 1}`;
      let totalQuestions = 0;

      const subpart = (tab.groupTopic || []).map((group, gIdx) => {
        const children = (group.subjects || []).map((subject, sIdx) => {
          const questions = (subject.questions || []).map((q, qIdx) => {
            totalQuestions++;

            const apiType = q.type ? q.type.toLowerCase() : "";

            return {
              _id: q._id || `question-${Date.now()}-${qIdx}`,
              number: q.question_no,
              question: {
                id: q._id,
                questionId: q.questionId,
                rawHtml: q.rawHtml || "",
                plainText: q.plainText || "",
                type: apiType,
                parentId: q.parentId || null,
                level: q.level || q.question_level || "",
                explanation: q.explanation || "",
                video: q.video || q.video_link || "",
                images: q.images || [],
                choices: q.choices || [],
                correctAnswers: normalizeCorrectAnswers(q, apiType),
                answer: q.answer || null,
              },
            };
          });

          return {
            _id:
              this.ensureValidObjectId(subject.idSubject) ||
              this.generateObjectId(),
            name: subject.nameSubject || `Môn ${sIdx + 1}`,
            time: subject.time || tab.exam_section_time || 0,
            score: subject.score || tab.total_score || 0,
            questions,
          };
        });

        return {
          _id: group.idTopic || `group-${Date.now()}-${gIdx}`,
          name: group.nameTopic || `Nhóm ${gIdx + 1}`,
          maxSubject: group.maxSubject || group.subjects?.length || 1,
          children,
        };
      });

      uploadParts.push({
        _id: tab._id || `part-${Date.now()}-${idx}`,
        name: partName,
        time: tab.exam_section_time || 90,
        score: tab.total_score || 100,
        questions_score: tab.questions_score || 0.2,
        maxGroup: tab.maxGroup || tab.groupTopic?.length || 1,
        type: "NHOM_CHU_DE",
        totalquestions: totalQuestions,
        subpart,
      });
    });

    return uploadParts;
  }

  async actionUpdateTopicQuestion(dataQuestion) {
    setLoader(true);
    try {
      const normalizedResult = this.normalizeManualQuestionForAPI(dataQuestion);
      if (normalizedResult === null) {
        console.warn(
          "[WARNING] Cannot update incomplete child question:",
          dataQuestion._id,
        );
        alert(
          "Không thể lưu câu hỏi con chưa chọn loại. Vui lòng chọn loại câu hỏi trước.",
        );
        setLoader(false);
        return;
      }
      const normalizedQuestion = {
        ...normalizedResult,
        isPlaceholder: false,
        needsEditing: false,
      };
      await this.updateQuestionApi(normalizedQuestion);
      const matchesQuestionId = (q, target) => {
        const qId = q._id || q.questionId || q.question_id;
        const tId = target._id || target.questionId || target.question_id;
        return String(qId || "").trim() === String(tId || "").trim();
      };
      const updatedTabData = [...this.state.tabData];
      let questionUpdated = false;

      for (let tabIndex = 0; tabIndex < updatedTabData.length; tabIndex++) {
        const tab = updatedTabData[tabIndex];
        if (
          tab.exam_section_type === "NHOM_CHU_DE" &&
          Array.isArray(tab.groupTopic)
        ) {
          for (
            let groupIndex = 0;
            groupIndex < tab.groupTopic.length;
            groupIndex++
          ) {
            const group = tab.groupTopic[groupIndex];
            if (Array.isArray(group.subjects)) {
              for (
                let subjectIndex = 0;
                subjectIndex < group.subjects.length;
                subjectIndex++
              ) {
                const subject = group.subjects[subjectIndex];
                if (Array.isArray(subject.questions)) {
                  const questionIndex = subject.questions.findIndex((q) =>
                    matchesQuestionId(q, normalizedQuestion),
                  );
                  if (questionIndex >= 0) {
                    const existingQuestion = subject.questions[questionIndex];
                    const updatedQ = {
                      ...existingQuestion,
                      ...normalizedQuestion,
                      _id: existingQuestion._id || normalizedQuestion._id,
                      questionId:
                        existingQuestion.questionId ||
                        normalizedQuestion.questionId,
                      question_id:
                        existingQuestion.question_id ||
                        normalizedQuestion.question_id,
                      isPlaceholder: false,
                      needsEditing: false,
                      updatedAt: new Date().toISOString(),
                    };

                    subject.questions[questionIndex] = updatedQ;
                    questionUpdated = true;
                    break;
                  }
                }
              }
              if (questionUpdated) break;
            }
          }
          if (questionUpdated) break;
        }
      }

      if (!questionUpdated) {
        throw new Error(
          "Không tìm thấy câu hỏi để cập nhật trong nhóm chủ đề!",
        );
      }
      this.setState(
        {
          tabData: updatedTabData,
          renderTrigger: this.state.renderTrigger + 1,
        },
        () => {
          this.saveTabDataToSession();
          this.syncSectionsWithTabData();
          if (typeof this.syncTabDataWithParts === "function") {
            this.syncTabDataWithParts();
          }
          if (typeof this.convertGroupTabDataToUploadFormat === "function") {
            const uploadParts = this.convertGroupTabDataToUploadFormat();
            this.setState({ parts: uploadParts });
          }
        },
      );

      setLoader(false);
      notification.success({
        message: "Cập nhật câu hỏi nhóm chủ đề thành công",
        placement: "topRight",
      });
    } catch (error) {
      setLoader(false);
      console.error("❌ [actionUpdateTopicQuestion] Error:", error);
      notification.error({
        message: "Lỗi cập nhật câu hỏi nhóm chủ đề",
        description: error.message || "Có lỗi xảy ra khi cập nhật câu hỏi",
        placement: "topRight",
      });
    }
  }

  async actionUpdateQuestion(dataQuestion) {
    setLoader(true);

    try {
      const normalizedResult = this.normalizeManualQuestionForAPI(dataQuestion);
      if (normalizedResult === null) {
        console.warn(
          "[WARNING] Cannot update incomplete child question:",
          dataQuestion._id,
        );
        alert(
          "Không thể lưu câu hỏi con chưa chọn loại. Vui lòng chọn loại câu hỏi trước.",
        );
        return;
      }

      const normalizedQuestion = {
        ...normalizedResult,
        isPlaceholder: false,
        needsEditing: false,
      };
      const matchesQuestionId = (q, targetId) => {
        const qId = q._id || q.questionId || q.question_id;
        const tId = targetId._id || targetId.questionId || targetId.question_id;
        return String(qId || "").trim() === String(tId || "").trim();
      };
      const updatedTabData = [...this.state.tabData];
      let questionUpdated = false;
      const currentTabIndex = updatedTabData.findIndex(
        (tab) => tab._id === this.state.selectedSectionId,
      );
      if (currentTabIndex < 0) {
        console.error(
          "[ERROR] Current tab not found for sectionId:",
          this.state.selectedSectionId,
        );
        throw new Error(
          "Không tìm thấy phần thi hiện tại để cập nhật câu hỏi!",
        );
      }
      const currentTab = updatedTabData[currentTabIndex];
      let foundQuestion = null;
      let foundIndex = -1;
      let foundInSubSection = null; // null: main questions, number: index của subSection
      let foundInGroupTopic = null; // {groupIdx, subjectIdx} nếu tìm thấy trong groupTopic
      if (currentTab.questions && Array.isArray(currentTab.questions)) {
        const questionIndex = currentTab.questions.findIndex((q) =>
          matchesQuestionId(q, normalizedQuestion),
        );
        if (questionIndex >= 0) {
          foundQuestion = currentTab.questions[questionIndex];
          foundIndex = questionIndex;
          foundInSubSection = null;
        }
      }
      if (
        !foundQuestion &&
        currentTab.subSections &&
        Array.isArray(currentTab.subSections)
      ) {
        for (let subIdx = 0; subIdx < currentTab.subSections.length; subIdx++) {
          const subSection = currentTab.subSections[subIdx];
          if (subSection.questions && Array.isArray(subSection.questions)) {
            const questionIndex = subSection.questions.findIndex((q) =>
              matchesQuestionId(q, normalizedQuestion),
            );
            if (questionIndex >= 0) {
              foundQuestion = subSection.questions[questionIndex];
              foundIndex = questionIndex;
              foundInSubSection = subIdx;
              break;
            }
          }
        }
      }
      if (
        !foundQuestion &&
        currentTab.childExam &&
        Array.isArray(currentTab.childExam)
      ) {
        for (
          let childIdx = 0;
          childIdx < currentTab.childExam.length;
          childIdx++
        ) {
          const childExam = currentTab.childExam[childIdx];
          if (childExam.questions && Array.isArray(childExam.questions)) {
            const questionIndex = childExam.questions.findIndex((q) =>
              matchesQuestionId(q, normalizedQuestion),
            );
            if (questionIndex >= 0) {
              foundQuestion = childExam.questions[questionIndex];
              foundIndex = questionIndex;
              foundInSubSection = `child-${childIdx}`;
              break;
            }
          }
        }
      }
      if (
        !foundQuestion &&
        currentTab.groupTopic &&
        Array.isArray(currentTab.groupTopic)
      ) {
        for (
          let groupIdx = 0;
          groupIdx < currentTab.groupTopic.length;
          groupIdx++
        ) {
          const group = currentTab.groupTopic[groupIdx];
          if (group.subjects && Array.isArray(group.subjects)) {
            for (
              let subjectIdx = 0;
              subjectIdx < group.subjects.length;
              subjectIdx++
            ) {
              const subject = group.subjects[subjectIdx];
              if (subject.questions && Array.isArray(subject.questions)) {
                const questionIndex = subject.questions.findIndex((q) =>
                  matchesQuestionId(q, normalizedQuestion),
                );
                if (questionIndex >= 0) {
                  foundQuestion = subject.questions[questionIndex];
                  foundIndex = questionIndex;
                  foundInGroupTopic = { groupIdx, subjectIdx };
                  break;
                }
              }
            }
            if (foundQuestion) break;
          }
        }
      }
      if (foundQuestion) {
        const updatedQ = {
          ...foundQuestion,
          ...normalizedQuestion,
          _id: foundQuestion._id || normalizedQuestion._id,
          question_no:
            foundQuestion.question_no || normalizedQuestion.question_no,
          parentId: foundQuestion.parentId || normalizedQuestion.parentId,
          questionId: foundQuestion.questionId || normalizedQuestion.questionId,
          updatedAt: new Date().toISOString(),
        };
        if (foundInGroupTopic) {
          currentTab.groupTopic[foundInGroupTopic.groupIdx].subjects[
            foundInGroupTopic.subjectIdx
          ].questions[foundIndex] = updatedQ;
        } else if (foundInSubSection === null) {
          currentTab.questions[foundIndex] = updatedQ;
        } else if (
          typeof foundInSubSection === "string" &&
          foundInSubSection.startsWith("child-")
        ) {
          const childIdx = parseInt(foundInSubSection.split("-")[1]);
          currentTab.childExam[childIdx].questions[foundIndex] = updatedQ;
        } else {
          currentTab.subSections[foundInSubSection].questions[foundIndex] =
            updatedQ;
        }

        questionUpdated = true;
      }

      if (!questionUpdated) {
        console.error("[ERROR] Question not found for update:", {
          targetId: normalizedQuestion._id,
          selectedSectionId: this.state.selectedSectionId,
          availableQuestions: this.getAllQuestionIdsInTab(currentTab),
        });
        throw new Error("Không tìm thấy câu hỏi để cập nhật!");
      }
      this.setState(
        {
          tabData: updatedTabData,
          renderTrigger: this.state.renderTrigger + 1, // Force re-render
        },
        () => {
          this.saveTabDataToSession();
          this.syncSectionsWithTabData();
          if (typeof this.syncTabDataWithParts === "function") {
            this.syncTabDataWithParts();
          }
          if (typeof this.convertTabDataToUploadFormat === "function") {
            const uploadParts = this.convertTabDataToUploadFormat();
            this.setState({ parts: uploadParts });
          }
        },
      );

      notification.success({
        message: "Cập nhật câu hỏi thành công",
        placement: "topRight",
      });
    } catch (error) {
      console.error("[ERROR] actionUpdateQuestion failed:", error);
      notification.error({
        message: "Lỗi cập nhật câu hỏi",
        description: error.message || "Có lỗi xảy ra khi cập nhật câu hỏi",
        placement: "topRight",
      });
    } finally {
      setLoader(false);
    }
  }
  getAllQuestionIdsInTab = (tab) => {
    const ids = [];

    const collectIds = (questions) => {
      if (!Array.isArray(questions)) return;
      questions.forEach((q) => {
        ids.push(q._id);
        if (q.childQuestions) collectIds(q.childQuestions);
      });
    };
    if (tab.questions) collectIds(tab.questions);
    if (tab.subSections) {
      tab.subSections.forEach((sub) => {
        if (sub.questions) collectIds(sub.questions);
      });
    }
    if (tab.childExam) {
      tab.childExam.forEach((child) => {
        if (child.questions) collectIds(child.questions);
      });
    }
    if (tab.groupTopic) {
      tab.groupTopic.forEach((group) => {
        if (group.subjects) {
          group.subjects.forEach((subject) => {
            if (subject.questions) collectIds(subject.questions);
          });
        }
      });
    }

    return ids;
  };

  _onChageInputTotalScore = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].total_score = value; // Update the total_score
      this.setState({ tabData: updatedTabData }); // Set updated state
    }
  };
  normalizeManualQuestionForAPI = (questionData) => {
    const normalized = { ...questionData };
    normalized._id =
      questionData._id || questionData.questionId || questionData.question_id;
    if (!normalized._id) {
      normalized._id = this.generateObjectId();
    }
    normalized.question_id = normalized._id;
    normalized.questionId = normalized._id;
    if (questionData.parentId !== undefined && questionData.parentId !== null) {
      normalized.parentId = questionData.parentId;
    }
    if (questionData.type === "Cluster" || questionData.type === "cluster") {
      normalized.type = "cluster";
      normalized.clusterPassage =
        questionData.clusterPassage || questionData.rawHtml || "";
      normalized.correctAnswers = [];
      normalized.choices = [];
      if (questionData.childQuestions) {
        normalized.childQuestions = questionData.childQuestions;
      }
      if (questionData.plainText !== undefined) {
        normalized.plainText = questionData.plainText;
      }
      if (questionData.exam_id) {
        normalized.exam_id = questionData.exam_id;
      }
      if (questionData.exam_section_id) {
        normalized.exam_section_id = questionData.exam_section_id;
      }
      if (questionData.exam_section_group_id) {
        normalized.exam_section_group_id = questionData.exam_section_group_id;
      }
      if (questionData.subject_id) {
        normalized.subject_id = questionData.subject_id;
      }
      if (questionData.topic_id) {
        normalized.topic_id = questionData.topic_id;
      }
      if (questionData.questionTopicGroupId) {
        normalized.questionTopicGroupId = questionData.questionTopicGroupId;
      }
      if (questionData.childExamId) {
        normalized.childExamId = questionData.childExamId;
      }
      if (questionData.question_no !== undefined) {
        normalized.question_no = questionData.question_no;
      }
      if (questionData.code) {
        normalized.code = questionData.code;
      }
      if (questionData.doc_link) {
        normalized.doc_link = questionData.doc_link;
      }
      if (questionData.video_link) {
        normalized.video_link = questionData.video_link;
      }
      if (questionData.images) {
        normalized.images = questionData.images;
      }
      if (questionData.level !== undefined) {
        normalized.level = questionData.level;
      }
      if (questionData.question_level !== undefined) {
        normalized.question_level = questionData.question_level;
      }

      return normalized;
    }
    if (questionData.parentId) {
      if (!normalized.type || normalized.type === null) {
        console.warn(
          "[WARNING] Child question missing valid type:",
          normalized._id,
        );
        return null;
      }
    }
    const typeMapping = {
      SINGLECHOICE: "singlechoice",
      MULTIPLECHOICE: "multiplechoice",
      TRUEFALSE: "truefalse",
      TRUEFALSEMULTI: "truefalsemulti",
      FILLINBLANK: "fillinblank",
      DRAGDROP: "dragdrop",
    };

    normalized.type = typeMapping[normalized.type] || normalized.type;
    if (!Array.isArray(normalized.correctAnswers)) {
      normalized.correctAnswers = normalized.correctAnswers
        ? [normalized.correctAnswers]
        : [];
    }

    return normalized;
  };
  normalizeManualQuestion = (q = {}) => {
    const clone = { ...(q || {}) };
    clone.type = clone.type || " ";
    if (!Array.isArray(clone.choices)) {
      clone.choices = [];
    }
    if (clone.correctAnswers === undefined && clone.answer !== undefined) {
      clone.correctAnswers = clone.answer;
    }
    const levelValue = clone.level || clone.question_level || "";
    clone.level = levelValue;
    clone.question_level = levelValue;
    clone.rawHtml =
      clone.rawHtml || clone.answer_content || clone.content || "";
    clone.video_link = clone.video_link || clone.video || "";
    clone.options = clone.choices; // Alias for modal compatibility

    if (!clone._id) {
      clone._id = this.generateObjectId
        ? this.generateObjectId()
        : `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.warn(
        "[WARNING] Created fallback ID for manually created question:",
        clone._id,
      );
    }

    clone.questionId = clone.questionId || clone.question_id || clone._id;
    if (!clone.questionId || clone.questionId === null) {
      clone.questionId = clone._id;
    }

    clone.question_id = clone.question_id || clone.questionId;

    clone.plainText =
      clone.plainText || clone.rawHtml.replace(/<[^>]*>/g, "").trim();
    clone.createdAt =
      clone.createdAt || clone.created_at || new Date().toISOString();
    clone.updatedAt =
      clone.updatedAt || clone.updated_at || new Date().toISOString();

    if (clone.parentId !== undefined) {
      clone.parentId = clone.parentId;
    }

    return clone;
  };

  async createQuestionApi(request) {
    const now = new Date().toISOString();
    const id = this.generateObjectId(); // ✅ SỬA: Sử dụng hàm tạo ObjectId chuẩn
    return {
      _id: id,
      created_at: now,
      ...request,
    };
  }

  async updateQuestionApi(request) {
    return { ...request };
  }

  _onChageInputNameSection = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].exam_section_name = value; // Update the total_score
      this.setState({ tabData: updatedTabData }); // Set updated state
    }
  };

  _onChageInputLinkPdf = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].exam_link = value; // Update the total_score
      this.setState({ tabData: updatedTabData }); // Set updated state
    }
  };

  _onChageInputTime = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].exam_section_time = value; // Update the total_score
      this.setState({ tabData: updatedTabData }); // Set updated state
    }
  };

  _onChageLinkGroupExamp = (e, keyTab, keyGroup, keySubject) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    updatedTabData.forEach((tab, index) => {
      if (tab._id === keyTab) {
        updatedTabData[index].exam_section_group.forEach(
          (group, indexGroup) => {
            if (group._id === keyGroup) {
              updatedTabData[index].exam_section_group[
                indexGroup
              ].subjects.forEach((subject, indexSubject) => {
                if (subject.subject_id === keySubject) {
                  updatedTabData[index].exam_section_group[indexGroup].subjects[
                    indexSubject
                  ].exam_link = value;
                }
              });
            }
          },
        );
      }
    });
    this.setState({ tabData: updatedTabData });
  };

  _onChangeNameTab = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.state.tabData[name].name = value;
  };

  getData = () => {
    const data = {
      limit: 999,
      is_delete: false,
    };
    return data;
  };
  loadAllProvinces = async () => {
    if (this.state.allProvinces.length === 0) {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/v2/p/");
        const data = await response.json();
        this.setState({
          allProvinces: data,
          provinces: data,
        });
      } catch (error) {
        console.error("Error fetching provinces:", error);
        const fallbackData = [
          { code: 1, name: "Thành phố Hà Nội" },
          { code: 2, name: "Thành phố Hồ Chí Minh" },
          { code: 3, name: "Thành phố Đà Nẵng" },
          { code: 4, name: "Thành phố Hải Phòng" },
          { code: 5, name: "Thành phố Cần Thơ" },
        ];
        this.setState({
          allProvinces: fallbackData,
          provinces: fallbackData,
        });
      }
    }
  };
  handleInputClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    await this.loadAllProvinces();
    this.setState({
      showProvinceDropdown: !this.state.showProvinceDropdown,
      provinceSearchTerm: "",
    });
  };
  handleProvinceSearch = (e) => {
    const searchTerm = e.target.value;
    this.setState({ provinceSearchTerm: searchTerm });
  };
  getFilteredProvinces = () => {
    const { allProvinces, provinceSearchTerm } = this.state;
    if (!provinceSearchTerm) {
      return allProvinces;
    }
    return allProvinces.filter((province) =>
      province.name.toLowerCase().includes(provinceSearchTerm.toLowerCase()),
    );
  };
  selectProvince = (province) => {
    this.setState({
      tp: province.code,
      showProvinceDropdown: false,
      provinceSearchTerm: "",
    });
  };
  getSelectedProvinceName = () => {
    if (!this.state.tp || !this.state.allProvinces.length) {
      return "";
    }
    const selectedProvince = this.state.allProvinces.find(
      (p) => p.code === Number(this.state.tp),
    );
    return selectedProvince ? selectedProvince.name : "";
  };
  loadProvinceNameByCode = async (provinceCode) => {
    if (this.state.allProvinces.length > 0) {
      return;
    }

    try {
      await this.loadAllProvinces();
    } catch (error) {
      console.error("Error loading province name:", error);
    }
  };

  onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  onChangeHandler = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      this.setState({
        fileData: null,
        fileError: "Chỉ chấp nhận file Word (.doc, .docx)",
      });
      notification.error({
        message: "Định dạng file không hợp lệ",
        description: "Vui lòng chọn file Word (.doc, .docx)",
        placement: "topRight",
      });
      event.target.value = null;
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.setState({
        fileData: null,
        fileError: `File quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa 10MB`,
      });
      notification.error({
        message: "File quá lớn",
        description: (
          <div>
            <p>
              Dung lượng: {(file.size / 1024 / 1024).toFixed(1)}MB (tối đa 10MB)
            </p>
            <a
              href="javascript:void(0)"
              onClick={() => this.showFileSizeTips()}
            >
              💡 Xem cách giảm dung lượng file
            </a>
          </div>
        ),
        placement: "topRight",
        duration: 8,
      });
      event.target.value = null;
      return;
    }
    this.setState({
      fileData: file,
      fileError: null,
      isUploaded: false,
    });
    notification.info({
      message: "File đã chọn",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      placement: "topRight",
      duration: 3,
    });
  };
  validateApiResponse = (responseData) => {
    const errors = [];
    const warnings = [];
    const sections = [];

    if (!responseData) {
      errors.push("Response is empty or undefined");
      return { valid: false, errors, warnings, sections };
    }

    if (!Array.isArray(responseData.parts)) {
      errors.push("Missing 'parts' array in response");
      return { valid: false, errors, warnings, sections };
    }

    let validParts = responseData.parts.filter((part) => {
      if (!part) return false;
      const text = Array.isArray(part.name)
        ? part.name[0] || ""
        : part.name || "";
      if (text.trim()) {
        return /^PHẦN\s+[IVXLCDM0-9]+\.|^Phần\s+[0-9IVXLCDM]+\./i.test(
          text.trim(),
        );
      }
      if (Array.isArray(part.subpart)) {
        return part.subpart.some((sp) =>
          sp.children?.some(
            (c) => Array.isArray(c.questions) && c.questions.length > 0,
          ),
        );
      }
      return false;
    });

    if (validParts.length === 0) {
      warnings.push(
        "Không tìm thấy phần tiêu đề chuẩn trong 'parts' — sẽ thử parse tất cả parts",
      );
      validParts = responseData.parts.slice();
    }

    validParts.forEach((part, sectionIdx) => {
      let rawTitle = Array.isArray(part.name)
        ? part.name[0]
        : part.name || `Phần ${sectionIdx + 1}`;
      let sectionTitle = rawTitle.trim();
      let sectionType = part.type || "MAC_DINH"; // ✅ Ưu tiên dùng type từ API
      let groupName = "";

      const match = sectionTitle.match(/^Phần\s*([0-9IVXLCDM]+)\.\s*(.*)$/i);
      if (match) {
        const afterDot = match[2]?.trim();
        if (afterDot) {
          // Chỉ ghi đè nếu API không có type
          if (!part.type) sectionType = "NHOM_CHU_DE";
          groupName = afterDot;
          // sectionTitle = `Phần ${match[1]} - ${groupName}`; // ✅ GIỮ NGUYÊN TÊN GỐC: Tránh làm mất định dạng "Phần 1. TIẾNG VIỆT"
        } else {
          // Chỉ ghi đè nếu API không có type
          if (!part.type) sectionType = "MAC_DINH";
          // sectionTitle = `Phần ${match[1]}`; // ✅ GIỮ NGUYÊN TÊN GỐC
        }
      }
      let questions = [];
      let childExam = [];

      if (Array.isArray(part.subpart)) {
        part.subpart.forEach((sp) => {
          // ✅ ĐỌC isMain từ subpart - lưu vào biến cố định cho subpart này
          const currentSubpartIsMain = sp.isMain === true;
          if (Array.isArray(sp.children)) {
            sp.children.forEach((child, childIdx) => {
              if (Array.isArray(child.questions)) {
                const childQuestions = [];

                child.questions.forEach((qWrap, qIdx) => {
                  const q = qWrap.question;
                  if (!q || typeof q !== "object") {
                    errors.push(
                      `Question invalid in section ${sectionIdx}, child ${qIdx}`,
                    );
                    return;
                  }

                  const qTypeLower = (q.type || "").toString().toLowerCase();

                  let rawHtml = q.rawHtml + q.plainText || "";
                  let level = q.level || "";
                  let questionNo = qWrap.number || qIdx + 1;

                  if (rawHtml) {
                    const plainTextForSearch = rawHtml.replace(/<[^>]*>/g, "");
                    const noMatch = plainTextForSearch.match(/Câu\s*(\d+)/i);
                    if (noMatch && noMatch[1])
                      questionNo = parseInt(noMatch[1], 10);
                  }
                  if (!q.type) {
                    let detectedType = "";
                    const ans = q.correctAnswers || q.answer || q.correctAnswer;
                    const plainTextForDetection = rawHtml.replace(
                      /<[^>]*>/g,
                      "",
                    );

                    if (
                      plainTextForDetection.includes("___") ||
                      plainTextForDetection.includes("...") ||
                      plainTextForDetection.includes("[...]")
                    ) {
                      detectedType = "FILL_IN_BLANK";
                    } else if (typeof ans === "string" && ans.length > 50) {
                      detectedType = "ESSAY";
                    } else if (
                      typeof ans === "boolean" ||
                      String(ans).toUpperCase() === "TRUE" ||
                      String(ans).toUpperCase() === "FALSE"
                    ) {
                      detectedType = "TRUE_FALSE";
                    } else if (Array.isArray(ans) && ans.length > 1) {
                      detectedType = "TN_MULTI_CHOICE";
                    } else {
                      detectedType = "TN_SINGLE_CHOICE";
                    }

                    q.type = detectedType;
                    warnings.push(
                      `Section ${sectionIdx} Q${qIdx}: Detected type as ${detectedType} (was missing)`,
                    );
                  }

                  const questionData = {
                    _id: `${Date.now()}${sectionIdx}${childIdx}${qIdx}`,
                    question_no: questionNo,
                    code: `${qIdx + 1}`,
                    rawHtml: q.rawHtml || "",
                    plainText: q.plainText || "",
                    type: q.type || "TN_SINGLE_CHOICE",
                    choices: q.choices || [],
                    dragDropOptions: q.dragDropOptions || q.drag_options || [],
                    explanation: q.explanation || "",
                    video: q.video || q.video_link || "",
                    correctAnswers: q.correctAnswers || "",
                    images: q.images || [],
                    level: level,
                    question_level: level,
                    doc_link: "",
                    video_link: q.video || "",
                    question_id:
                      q.question_id || q.questionId || this.generateObjectId(),
                    questionId: q.questionId || q.question_id || q._id,
                    created_at: new Date(),
                    __temp: false,
                    // ✅ THÊM: Giữ lại các trường cluster từ API
                    parentId:
                      q.parentId || q.parent_id || qWrap.parentId || null,
                    parent_id: q.parent_id || q.parentId || null,
                    cluster: q.cluster || [], // mảng ID câu hỏi con
                    clusterQuestions: q.clusterQuestions || [], // mảng chi tiết câu hỏi con
                    clusterPassage:
                      qTypeLower === "cluster"
                        ? q.rawHtml || q.clusterPassage || ""
                        : undefined,
                  };

                  childQuestions.push(questionData);
                });

                // ✅ Logic: isMain=true → questions chính, isMain=false → childExam
                if (childQuestions.length > 0) {
                  if (currentSubpartIsMain) {
                    // Đưa vào phần thi chính
                    questions.push(...childQuestions);
                  } else {
                    // Đưa vào childExam (phần thi con)
                    // ✅ FIX: Ưu tiên sp.name (tên subpart) thay vì child.name (luôn là "Children 1" placeholder)
                    const childExamName = (sp.name && sp.name !== 'Children 1') ? sp.name
                      : (child.name && child.name !== 'Children 1') ? child.name
                        : `Cụm câu hỏi ${childIdx + 1}`;
                    childExam.push({
                      id: `child-${sectionIdx}-${childIdx}`,
                      _id: `child-${sectionIdx}-${childIdx}`,
                      name: childExamName,
                      title: childExamName,
                      originalTitle: childExamName,
                      questions: childQuestions,
                      time: 0,
                      score: 0,
                      isMain: false,
                    });
                  }
                }
              }
            });
          }
        });
      }

      const sectionData = {
        _id: `uploaded-section-${sectionIdx + 1}`,
        id: sectionIdx + 1,
        title: sectionTitle,
        name: sectionTitle,
        content: part.name || "",
        type: sectionType,
        groupName,
        questions,
        childExam, // ✅ THÊM childExam
      };

      sections.push(sectionData);
    });

    const valid = errors.length === 0;
    return { valid, errors, warnings, sections };
  };
  showFileSizeTips = () => {
    notification.info({
      message: "Cách giảm dung lượng file Word",
      description: (
        <div>
          <p>
            <strong>1.</strong> Nén hình ảnh trong Word: File → Nén hình ảnh
          </p>
          <p>
            <strong>2.</strong> Xóa bỏ metadata: File → Kiểm tra tài liệu → Kiểm
            tra
          </p>
          <p>
            <strong>3.</strong> Lưu dưới định dạng .docx thay vì .doc
          </p>
          <p>
            <strong>4.</strong> Chia nhỏ file thành nhiều phần
          </p>
        </div>
      ),
      placement: "topRight",
      duration: 10,
    });
  };

  debugPayloadDifferences = () => {
    console.group("[ExamCreate] API Format Payload Debug");
    if (this.state.parts && this.state.parts.length > 0) {
      const apiParts = this.convertUploadPartsToAPIFormat(this.state.parts);
    }
    if (this.state.tabData && this.state.tabData.length > 0) {
      const apiFromTabData = this.convertTabDataToUploadFormat();
      if (this.state.tabData[0].questions?.[0]) {
        const originalQ = this.state.tabData[0].questions[0];
        const convertedQ = this.convertQuestionToAPIFormat(originalQ);
      }
    }
  };

  convertQuestionToAPIFormat = (question, allQuestions = [], options = {}) => {
    const { forceProcessChild = false } = options;
    // ✅ Hỗ trợ cả định dạng { question: {...}, number, isTestQuestion } và plain question
    const normalizeQuestionShape = (q) => {
      if (q && q.question) {
        const merged = { ...q.question };
        [
          "number",
          "question_no",
          "isTestQuestion",
          "parentId",
          "parent_id",
          "questionId",
          "question_id",
          "_id",
        ].forEach((field) => {
          if (q[field] !== undefined && merged[field] === undefined) {
            merged[field] = q[field];
          }
        });
        if (merged.parentId === undefined && merged.parent_id !== undefined) {
          merged.parentId = merged.parent_id;
        }
        return merged;
      }
      // ✅ Nếu là plain question từ API, giữ nguyên number từ question.number
      const plain = { ...q };
      if (plain.parentId === undefined && plain.parent_id !== undefined) {
        plain.parentId = plain.parent_id;
      }
      return plain;
    };

    const qData = normalizeQuestionShape(question);
    const normalizedAllQuestions = Array.isArray(allQuestions)
      ? allQuestions.map(normalizeQuestionShape)
      : [];

    if (
      !qData.questionId ||
      qData.questionId === null ||
      qData.questionId === undefined
    ) {
      qData.questionId =
        qData._id || qData.question_id || this.generateObjectId();
    }
    const typeLower = (qData.type || "").toString().toLowerCase();

    if (
      typeLower === "cluster" &&
      (qData.parentId === null || qData.parentId === undefined)
    ) {
      const clusterIdCandidates = [
        qData._id,
        qData.questionId,
        qData.question_id,
      ]
        .filter(Boolean)
        .map((id) => String(id));

      const childQuestions = normalizedAllQuestions.filter((q) => {
        const parentVal = q.parentId || q.parent_id;
        if (parentVal === undefined || parentVal === null) return false;
        const parentStr = String(parentVal);
        const hasParent = clusterIdCandidates.includes(parentStr);
        return hasParent;
      });

      // ✅ CRITICAL FIX: Format child questions to match ExamCreate.js EXACTLY
      // Only 3 fields: question, selectedAnswers, type
      const sourceChildren =
        childQuestions && childQuestions.length > 0
          ? childQuestions
          : Array.isArray(qData.clusterQuestions)
            ? qData.clusterQuestions
            : [];

      const formattedChildQuestions = sourceChildren.map((child) => ({
        question: child.rawHtml || child.question || child.content || "",
        selectedAnswers:
          child.correctAnswers || child.selectedAnswers || child.answer || [],
        type: child.type || "singlechoice",
      }));

      // Trả về cluster object kèm danh sách child questionIds trong trường 'cluster'
      let childIds = childQuestions
        .map((child) => child.questionId || child._id || child.question_id)
        .filter(Boolean)
        .map((id) => String(id));

      // Fallback: if no linked children found by parentId, use existing cluster or clusterQuestions data
      if (childIds.length === 0) {
        if (Array.isArray(qData.cluster)) {
          childIds = qData.cluster.filter(Boolean).map((id) => String(id));
        } else if (Array.isArray(qData.clusterQuestions)) {
          childIds = qData.clusterQuestions
            .map(
              (cq) =>
                cq.questionId ||
                cq._id ||
                cq.question_id ||
                cq.question?.questionId ||
                cq.question?._id,
            )
            .filter(Boolean)
            .map((id) => String(id));
        }
      }

      // Ensure unique IDs
      const uniqueChildIds = Array.from(new Set(childIds));

      const clusterPayload = {
        isTestQuestion: qData.isTestQuestion || false,
        question: {
          _id: qData._id || this.generateObjectId(),
          questionId:
            qData.questionId || qData.question_id || this.generateObjectId(),
          rawHtml: qData.clusterPassage || qData.rawHtml || "",
          type: "cluster",
          choices: [],
          correctAnswers: [],
          explanation: qData.explanation || "",
          level: qData.level || qData.question_level || "",
          images: qData.images || [],
          video: qData.video || qData.video_link || "",
          parentId: null,
          clusterQuestions: formattedChildQuestions,
          cluster: uniqueChildIds,
        },
        number: 0,
      };

      return clusterPayload;
    }
    if (qData.parentId && !forceProcessChild) {
      // Format child question properly for API
      const typeMapping = {
        SINGLECHOICE: "singlechoice",
        TRUEFALSEMULTI: "truefalsemulti",
        FILLINBLANK: "fillinblank",
        DRAGDROP: "dragdrop",
        MULTIPLECHOICE: "multiplechoice",
        TRUEFALSE: "truefalse",
        CLUSTER: "cluster",
      };
      const originalType = qData.type || "TN_SINGLE_CHOICE";
      const apiType =
        typeMapping[originalType.toUpperCase()] || originalType.toLowerCase();

      let apiChoices = [];
      if (qData.choices && Array.isArray(qData.choices)) {
        apiChoices = qData.choices.map((choice) => {
          if (typeof choice === "string") {
            return { label: choice, text: choice };
          }
          return {
            label: choice.label || choice.key || choice.id || "A",
            text:
              choice.text || choice.value || choice.content || String(choice),
          };
        });
      }

      let apiCorrectAnswers = [];
      if (qData.correctAnswers || qData.answer) {
        const answers = qData.correctAnswers || qData.answer || [];

        if (Array.isArray(answers)) {
          apiCorrectAnswers = answers.map((ans) => {
            if (typeof ans === "string") {
              if (apiType === "fillinblank" || apiType === "multiplechoice") {
                return { value: ans };
              } else {
                return { label: ans, value: ans };
              }
            } else if (ans && typeof ans === "object") {
              return {
                label: ans.label || ans.key || ans.id,
                value: ans.value || ans.text || ans.label || ans.key || ans.id,
              };
            }
            return ans;
          });
        } else {
          if (typeof answers === "string") {
            apiCorrectAnswers = [{ value: answers }];
          } else {
            apiCorrectAnswers = [answers];
          }
        }
      }

      let apiDragDropOptions = [];
      if (apiType === "dragdrop") {
        if (
          qData.dragDropOptions &&
          Array.isArray(qData.dragDropOptions) &&
          qData.dragDropOptions.length > 0
        ) {
          apiDragDropOptions = qData.dragDropOptions.filter(
            (opt) => opt && String(opt).trim(),
          );
        } else if (apiCorrectAnswers.length > 0) {
          apiDragDropOptions = apiCorrectAnswers
            .map((ans) => ans.value)
            .filter((val) => val && val.trim());
        }
      }

      const result = {
        isTestQuestion: qData.isTestQuestion || false,
        question: {
          questionId:
            qData.questionId || qData.question_id || this.generateObjectId(),
          rawHtml: qData.rawHtml || qData.content || qData.question || "",
          plainText: qData.plainText || "",
          type: apiType,
          choices: apiChoices,
          correctAnswers: apiCorrectAnswers,
          explanation: qData.explanation || "",
          level: qData.level || qData.question_level || "",
          subject: qData.subject || "",
          images: qData.images || [],
          video: qData.video || qData.video_link || "",
          parentId: qData.parentId,
          deleted_at: qData.deleted_at || null,
        },
        number: qData.number || qData.question_no || 0,
      };

      if (qData._id) {
        result.question._id = qData._id;
      }

      if (apiType === "dragdrop") {
        result.question.dragDropOptions = apiDragDropOptions;
      }

      return result;
    }
    const typeMapping = {
      SINGLECHOICE: "singlechoice",
      TRUEFALSEMULTI: "truefalsemulti",
      FILLINBLANK: "fillinblank",
      DRAGDROP: "dragdrop",
      MULTIPLECHOICE: "multiplechoice",
      TRUEFALSE: "truefalse",
      CLUSTER: "cluster",
    };
    const originalType = qData.type || "TN_SINGLE_CHOICE";
    const apiType =
      typeMapping[originalType.toUpperCase()] || originalType.toLowerCase();
    let apiChoices = [];
    if (qData.choices && Array.isArray(qData.choices)) {
      apiChoices = qData.choices.map((choice) => {
        if (typeof choice === "string") {
          return { label: choice, text: choice };
        }
        return {
          label: choice.label || choice.key || choice.id || "A",
          text: choice.text || choice.value || choice.content || String(choice),
        };
      });
    }
    let apiCorrectAnswers = [];
    if (qData.correctAnswers || qData.answer) {
      const answers = qData.correctAnswers || qData.answer || [];

      if (Array.isArray(answers)) {
        apiCorrectAnswers = answers.map((ans) => {
          if (typeof ans === "string") {
            if (apiType === "fillinblank" || apiType === "multiplechoice") {
              return { value: ans };
            } else {
              return { label: ans, value: ans };
            }
          } else if (ans && typeof ans === "object") {
            return {
              label: ans.label || ans.key || ans.id,
              value: ans.value || ans.text || ans.label || ans.key || ans.id,
            };
          }
          return ans; // Fallback: keep as is
        });
      } else {
        if (typeof answers === "string") {
          apiCorrectAnswers = [{ value: answers }];
        } else {
          apiCorrectAnswers = [answers];
        }
      }
    }
    let apiDragDropOptions = [];
    if (apiType === "dragdrop") {
      if (
        qData.dragDropOptions &&
        Array.isArray(qData.dragDropOptions) &&
        qData.dragDropOptions.length > 0
      ) {
        apiDragDropOptions = qData.dragDropOptions.filter(
          (opt) => opt && String(opt).trim(),
        );
      } else if (apiCorrectAnswers.length > 0) {
        apiDragDropOptions = apiCorrectAnswers
          .map((ans) => ans.value)
          .filter((val) => val && val.trim());
      }
    }

    // ✅ Build result matching ExamCreate.js format EXACTLY
    const result = {
      isTestQuestion: qData.isTestQuestion || false,
      question: {
        questionId:
          qData.questionId || qData.question_id || this.generateObjectId(),
        rawHtml: qData.rawHtml || qData.content || qData.question || "",
        type: apiType,
        choices: apiChoices,
        correctAnswers: apiCorrectAnswers,
        explanation: qData.explanation || "",
        level: qData.level || qData.question_level || "",
        images: qData.images || [],
        video: qData.video || qData.video_link || "",
        parentId: qData.parentId || null,
      },
      number: qData.number || qData.question_no || 0,
    };

    // ✅ Add _id for update operation (not in create)
    if (qData._id) {
      result.question._id = qData._id;
    }

    if (apiType === "dragdrop") {
      result.question.dragDropOptions = apiDragDropOptions;
    }

    // ✅ Preserve incoming cluster IDs if present on any question (especially cluster roots)
    if (!result.question.cluster && Array.isArray(qData.cluster)) {
      result.question.cluster = qData.cluster
        .filter(Boolean)
        .map((id) => String(id));
    }
    return result;
  };
  convertUploadPartsToAPIFormat = (uploadParts) => {
    return uploadParts.map((part, idx) => {
      let totalQuestions = 0;
      if (part.subpart) {
        part.subpart.forEach((subpart) => {
          if (subpart.children) {
            subpart.children.forEach((child) => {
              totalQuestions += (child.questions || []).length;
            });
          }
        });
      }

      return {
        name: part.name || part.part_name || `Phần ${idx + 1}`,
        type: part.type || "MAC_DINH",
        totalquestions: totalQuestions,
        subpart: (part.subpart || []).map((subpart, subIdx) => ({
          name: `${subpart.subpart_name || subpart.name || "Phần con"}`,
          children: (subpart.children || []).map((child, childIdx) => {
            const childName = (child.name && child.name !== 'Children 1') ? child.name
              : (subpart.name && subpart.name !== 'Phần con') ? subpart.name
                : `Cụm câu hỏi ${childIdx + 1}`;
            return {
              name: childName, // ✅ SỬA: Không dùng hardcode Children
              questions: (child.questions || []).map((q) => {
                if (q.question && q.question.questionId) {
                  return q; // Đã đúng format API
                }
                return this.convertQuestionToAPIFormat(q.question || q);
              }),
            };
          }),
        })),
      };
    });
  };
  getQuestionSources = (parts = []) => {
    const sources = { upload: 0, manual: 0, unknown: 0 };

    parts.forEach((part) => {
      (part.subpart || []).forEach((subpart) => {
        (subpart.children || []).forEach((child) => {
          (child.questions || []).forEach((q) => {
            const source = q.question?.source;
            if (source === "upload") sources.upload++;
            else if (source === "manual") sources.manual++;
            else sources.unknown++;
          });
        });
      });
    });

    return sources;
  };
  cleanSubpartName = (name, fallbackName = "") => {
    if (!name) return fallbackName;
    // const cleanedName = name.replace(/^(\d+(\.\d+)?\s+)+/, ""); // ✅ DỪNG STRIP SỐ: Để giữ nguyên "1.1 TIẾNG VIỆT" khi lưu vào DB
    return name || fallbackName;
  };

  convertTabDataToUploadFormat = () => {
    let tabData = this.state.tabData || [];

    if (tabData.length === 0) {
      return [
        {
          name: "Phần mặc định",
          type: "MAC_DINH",
          totalquestions: 0,
          subpart: [
            {
              name: this.cleanSubpartName("Phần mặc định", "Phần mặc định"),
              children: [
                {
                  name: "Phần mặc định", // ✅ SỬA: Thay "Children 1" bằng tên phần
                  questions: [],
                },
              ],
            },
          ],
        },
      ];
    }
    const uploadParts = tabData.map((tab, idx) => {
      const partName = tab.exam_section_name || `Phần ${idx + 1}`;
      let totalQuestions = 0;
      if (tab.exam_section_type === "GROUP_SUBJECT") {
        (tab.exam_section_group || []).forEach((group) => {
          (group.subjects || []).forEach((subject) => {
            totalQuestions += (subject.questions || []).length;
          });
        });
      } else {
        totalQuestions = (tab.questions || []).length;
      }

      const uploadPart = {
        name: partName, // ✅ String thay vì array
        type:
          tab.exam_section_type === "NHOM_CHU_DE"
            ? "NHOM_CHU_DE"
            : tab.exam_section_type || "MAC_DINH",
        totalquestions: totalQuestions, // ✅ Thêm totalquestions
        subpart: [],
      };

      if (tab.exam_section_type === "GROUP_SUBJECT") {
        (tab.exam_section_group || []).forEach((group, j) => {
          const subpartName = this.cleanSubpartName(
            group.name || group.group_name,
            `Nhóm ${j + 1}`,
          );
          const subpart = {
            name: subpartName,
            children: [],
          };
          (group.subjects || []).forEach((subject, k) => {
            const subjectQuestions = subject.questions || [];
            const subjectName = subject.name || subject.subject_name || `Môn ${k + 1}`;

            subpart.children.push({
              name: subjectName, // ✅ SỬA: Dùng tên môn thay vì hardcode Children
              questions: subjectQuestions.map((q) =>
                this.convertQuestionToAPIFormat(q),
              ),
            });
          });
          if (subpart.children.length === 0) {
            subpart.children.push({
              name: subpartName, // ✅ SỬA: Dùng tên nhóm thay vì hardcode Children 1
              questions: [],
            });
          }

          uploadPart.subpart.push(subpart);
        });
      } else {
        const sectionQuestions = tab.questions || [];
        const childExamSections = tab.childExam || [];
        const manualSubSections = tab.subSections || [];

        // Logic xử lý subparts tương tự buildPartsPayload
        if (childExamSections.length > 0 || manualSubSections.length > 0) {
          if (sectionQuestions.length > 0) {
            uploadPart.subpart.push({
              name: `${partName}`,
              isMain: true,
              children: [
                {
                  name: `${partName}`,
                  questions: sectionQuestions.map((q) =>
                    this.convertQuestionToAPIFormat(q),
                  ),
                },
              ],
            });
          }

          childExamSections.forEach((child) => {
            uploadPart.subpart.push({
              name: child.name || "Phần con",
              isMain: false,
              children: [
                {
                  name: child.name || "Phần con",
                  questions: (child.questions || []).map((q) =>
                    this.convertQuestionToAPIFormat(q),
                  ),
                },
              ],
            });
          });

          manualSubSections.forEach((sub) => {
            uploadPart.subpart.push({
              name: sub.name || "Phần con",
              isMain: false,
              children: [
                {
                  name: sub.name || "Phần con",
                  questions: (sub.questions || []).map((q) =>
                    this.convertQuestionToAPIFormat(q),
                  ),
                },
              ],
            });
          });
        } else {
          uploadPart.subpart = [
            {
              name: `${partName}`,
              children: [
                {
                  name: `${partName}`, // ✅ SỬA: Dùng tên phần thay vì hardcode Children 1
                  questions: sectionQuestions.map((q) =>
                    this.convertQuestionToAPIFormat(q),
                  ),
                },
              ],
            },
          ];
        }
      }
      if (uploadPart.subpart.length === 0) {
        uploadPart.subpart.push({
          name: `${partName}`,
          children: [
            {
              name: `${partName}`, // ✅ SỬA: Dùng tên phần thay vì Children 1
              questions: [],
            },
          ],
        });
      }

      return uploadPart;
    });

    return uploadParts;
  };

  countTotalQuestions = (parts = []) => {
    return parts.reduce((total, part) => {
      return (
        total +
        (part.subpart || []).reduce((partTotal, subpart) => {
          return (
            partTotal +
            (subpart.children || []).reduce((childTotal, child) => {
              return childTotal + (child.questions || []).length;
            }, 0)
          );
        }, 0)
      );
    }, 0);
  };
  normalizeParts = (partsFromApi = []) => {
    return partsFromApi.map((part) => ({
      ...part,
      subpart: (part.subpart || []).map((sp) => ({
        ...sp,
        children: (sp.children || []).map((child) => ({
          ...child,
          questions: (child.questions || []).map((qWrap) => {
            const question = qWrap.question || qWrap;
            return this.normalizeQuestionFormat(question, "upload");
          }),
        })),
      })),
    }));
  };
  normalizeQuestionFormat = (questionData, source = "manual") => {
    let dragDropOptions = [];
    if (questionData.dragDropOptions) {
      if (Array.isArray(questionData.dragDropOptions)) {
        dragDropOptions = questionData.dragDropOptions.flatMap((item) => {
          if (typeof item === "string" && item.includes(",")) {
            return item
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s); // Loại bỏ empty strings
          } else {
            return [item];
          }
        });
      } else {
        dragDropOptions = [questionData.dragDropOptions];
      }
    }

    // ✅ CRITICAL: Giữ nguyên _id từ API, không được thay đổi
    const stableId = questionData._id;
    const stableQuestionId = questionData.questionId;
    const baseQuestion = {
      _id: stableId, // ✅ Ưu tiên _id từ API, chỉ generate nếu không có
      question_id: questionData.question_id || stableId, // ✅ Giữ question_id riêng
      questionId: stableQuestionId, // ✅ Lưu questionId riêng (không fallback _id)
      question_no: questionData.number,
      number: questionData.number,
      rawHtml:
        questionData.rawHtml ||
        questionData.content ||
        questionData.question ||
        "",
      plainText: questionData.plainText || "",
      type: questionData.type || "SINGLE_CHOICE",
      choices: questionData.choices || [],
      dragDropOptions: dragDropOptions, // ✅ Sử dụng dragDropOptions đã xử lý
      correctAnswers: questionData.correctAnswers || questionData.answer || [],
      explanation: questionData.explanation || "",
      level: questionData.level || questionData.question_level || "",
      question_level: questionData.level || questionData.question_level || "",
      images: questionData.images || [],
      doc_link: questionData.doc_link || "",
      video_link: questionData.video || questionData.video_link || "",
      video: questionData.video || questionData.video_link || "",
      code:
        questionData.code ||
        `${questionData.question_no || questionData.questionNo || 1}`,
      created_at: questionData.created_at || new Date().toISOString(),
      __temp: questionData.__temp || false,
      source: source, // Track source: 'upload' or 'manual'
      uploaded: source === "upload", // Flag for uploaded questions
    };
    return {
      question: baseQuestion,
      question_id: baseQuestion.question_id,
      question_no: baseQuestion.question_no,
      number: baseQuestion.number,
      _id: baseQuestion._id,
      questionId: baseQuestion.questionId,
    };
  };

  convertSectionsToTabData = (sections) => {
    const newTabData = sections.map((section, index) => {
      let subSections = [];
      if (section.subSections && Array.isArray(section.subSections)) {
        subSections = section.subSections.map((subSec) => ({
          id: subSec.id,
          name: subSec.name,
          questions: subSec.questions || [],
          createdAt: subSec.createdAt || new Date().toISOString(),
          time: subSec.time || 0,
          score: subSec.score || 10,
          _id: subSec._id, // Preserve original _id
          isMain: subSec.isMain || false, // ✅ THÊM: Giữ lại isMain từ API
        }));
      }
      const mainQuestions =
        subSections.length > 0 ? [] : section.questions || [];
      let childExam = [];
      if (section.childExam && Array.isArray(section.childExam)) {
        childExam = section.childExam.map((child) => {
          const isMainValue = child.isMain !== undefined ? child.isMain : false;
          return {
            id: child.id || child._id,
            name: child.name || child.title,
            originalTitle: child.originalTitle || child.name || child.title,
            questions: child.questions || [],
            time: child.time || 0,
            score: child.score || 0,
            isMain: isMainValue, // ✅ THÊM: Giữ lại isMain từ API
          };
        });
      }
      // ✅ Fallback: nếu API trả về trực tiếp cấu trúc subpart và chưa có childExam,
      // thì chuyển các subpart có isMain=false sang childExam để hiển thị phần thi con.
      if (
        (!childExam || childExam.length === 0) &&
        Array.isArray(section.subpart)
      ) {
        const fallbackChildExam = [];
        section.subpart.forEach((subpart, spIdx) => {
          const isMain = subpart && subpart.isMain === true;
          if (!isMain && Array.isArray(subpart.children)) {
            subpart.children.forEach((child, childIdx) => {
              // Chuẩn hóa danh sách câu hỏi để UI hiển thị đúng định dạng
              let normalizedQuestions = [];
              if (Array.isArray(child.questions)) {
                normalizedQuestions = child.questions.map((qWrap, qIdx) => {
                  try {
                    return this.normalizeQuestion(qWrap, qIdx);
                  } catch (e) {
                    return qWrap && qWrap.question ? qWrap.question : qWrap;
                  }
                });
              }
              fallbackChildExam.push({
                id: child._id || `child-${index}-${spIdx}-${childIdx}`,
                name: child.name || `Phần thi con ${childIdx + 1}`,
                originalTitle: child.name || `Phần thi con ${childIdx + 1}`,
                questions: normalizedQuestions,
                time: child.time || 0,
                score: child.score || 0,
                isMain: false,
              });
            });
          }
        });
        if (fallbackChildExam.length > 0) {
          childExam = fallbackChildExam;
        }
      }

      // ✅ Ánh xạ đúng type từ API sang exam_section_type
      const examSectionType =
        section.type === "NHOM_CHU_DE" ? "NHOM_CHU_DE" : "MAC_DINH";

      return {
        _id: section._id || section.id || `uploaded-section-${index + 1}`,
        exam_section_name: section.title || section.name,
        exam_section_type: examSectionType,
        questions: mainQuestions,
        childExam, // ✅ THÊM childExam (cụm câu hỏi)
        subSections, // ✅ THÊM sub-sections
        groupTopic:
          examSectionType === "NHOM_CHU_DE"
            ? section.groupTopic || []
            : undefined,
        exam_section_group: examSectionType === "MAC_DINH" ? [] : undefined,
        exam_section_time: section.time || 0,
        total_score: section.score || 10,
        uploaded: true,
      };
    });
    this.setState({
      tabData: newTabData,
      selectedSectionId: newTabData.length > 0 ? newTabData[0]._id : null,
      examSectionId: newTabData.length > 0 ? newTabData[0]._id : null,
    });
  };
  fetchExamTypeRows() {
    const { examCategory } = this.props;
    if (!examCategory || !examCategory.parts) return null;

    return examCategory.parts
      .filter((item) => !item.hidden) // ✅ chỉ lấy part không ẩn
      .map((item) => (
        <option key={item.id} value={item.name}>
          {item.name}
        </option>
      ));
  }

  saveTabDataToSession = () => {
    try {
      const key = `exam_word_tabdata_${this.state.examId || "new"}`;
      const payload = JSON.stringify(this.state.tabData || []);
      sessionStorage.setItem(key, payload);
    } catch (e) { }
  };
  handleStartEditSectionName = (sectionId, currentName) => {
    this.setState({
      editingSectionId: sectionId,
      editingSectionName: currentName || "",
    });
  };
  handleSaveSectionName = () => {
    const { editingSectionId, editingSectionName, tabData } = this.state;

    if (!editingSectionId || !editingSectionName.trim()) {
      this.setState({ editingSectionId: null, editingSectionName: "" });
      return;
    }
    const updatedTabData = tabData.map((tab) => {
      if (tab._id === editingSectionId) {
        return {
          ...tab,
          exam_section_name: editingSectionName.trim(),
          title: editingSectionName.trim(),
        };
      }
      return tab;
    });
    const updatedSections = this.state.sections.map((section) => {
      if (section.id === editingSectionId) {
        return {
          ...section,
          title: editingSectionName.trim(),
        };
      }
      return section;
    });

    this.setState(
      {
        tabData: updatedTabData,
        sections: updatedSections,
        editingSectionId: null,
        editingSectionName: "",
      },
      () => {
        this.saveTabDataToSession();

        notification.success({
          message: "Đổi tên phần thi thành công",
          description: `Đã đổi tên thành: ${editingSectionName.trim()}`,
          placement: "topRight",
        });
      },
    );
  };
  handleCancelEditSectionName = () => {
    this.setState({
      editingSectionId: null,
      editingSectionName: "",
    });
  };
  handleSectionNameInputChange = (e) => {
    this.setState({
      editingSectionName: e.target.value,
    });
  };
  handleSectionNameKeyPress = (e) => {
    if (e.key === "Enter") {
      this.handleSaveSectionName();
    } else if (e.key === "Escape") {
      this.handleCancelEditSectionName();
    }
  };

  handleAddDefaultSection = () => {
    this.setState((prevState) => {
      const prevSections = Array.isArray(prevState.sections)
        ? prevState.sections
        : [];
      const prevTabData = Array.isArray(prevState.tabData)
        ? prevState.tabData
        : [];
      const totalSections = Math.max(prevSections.length, prevTabData.length);
      const newSectionNumber = totalSections + 1;
      const newSectionId = `sec-${newSectionNumber}`;
      const newSection = {
        id: newSectionId,
        title: `Phần ${newSectionNumber}`,
        type: "MAC_DINH",
        uploaded: false,
      };

      const updatedSections = [...prevSections, newSection];
      const newTabDataItem = {
        _id: newSectionId,
        exam_section_name: `Phần ${newSectionNumber}`,
        exam_section_type: "MAC_DINH",
        exam_section_time: this.state.time || 0,
        total_score: 0,
        calculate_score_type: "total_point",
        questions: [],
        active: false,
        uploaded: false,
        subSections: [],
        childExam: [],
      };

      const updatedTabData = [...prevTabData, newTabDataItem];

      this.setState(() => ({
        parentIdInTabData: newSectionId,
      }));
      const updatedTitlePerPart = [...(prevState.titlePerPart || [])];
      updatedTitlePerPart.push(`Phần ${newSectionNumber}`);

      return {
        sections: updatedSections,
        tabData: updatedTabData,
        selectedSectionId: newSectionId,
        examSectionId: newSectionId,
        statusTabCreate: false,
        titlePerPart: updatedTitlePerPart,
      };
    });
  };

  handleAddTopicGroup = () => {
    this.setState({
      showGroupModal: true,
      actionGroup: "create",
      groupDetail: null,
    });
  };

  handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả phần thi không?")) {
      this.setState({
        sections: [],
        parts: [], // xoá luôn parts
        tabData: [], // ✅ THÊM: Reset tabData để xóa hoàn toàn dữ liệu cũ
        selectedSectionId: null,
        fileData: null, // reset file trong state
        titlePerPart: [],
        scorePerPart: [],
        timePerPart: [],
        timeTotal: 0,
        timeMode: "TOTAL",
        showAddSubSectionModal: false,
        subSectionName: "",
        selectedParentSectionId: null,
        editingSectionId: null,
        editingSectionName: "",
        selectedGroupSubject: {},
        listSubjectGroups: {},
        currentSubSectionId: null,
        childExamId: null,
        currentClusterId: null,
        expandedClusters: {},
      });
      if (this.fileInputRef) {
        this.fileInputRef.value = null;
      }

      notification.success({
        message: "Thành công",
        description: "Đã xóa tất cả phần thi thành công!",
        placement: "topRight",
        duration: 1,
      });
    }
  };

  handleDeleteSection = (id) => {
    if (!id) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa phần thi này không?")) {
      this.setState(
        (prevState) => {
          const prevSections = Array.isArray(prevState.sections)
            ? prevState.sections
            : [];
          const filteredSections = prevSections.filter((s) => s.id !== id);
          const prevTabData = Array.isArray(prevState.tabData)
            ? [...prevState.tabData]
            : [];
          const filteredTabData = prevTabData.filter(
            (t) => t && t._id !== id && t.id !== id,
          );
          const prevParts = Array.isArray(prevState.parts)
            ? [...prevState.parts]
            : [];
          const filteredParts = prevParts.filter(
            (p) => p && p._id !== id && p.id !== id,
          );
          const updatedSections = filteredSections.map((section, idx) => ({
            ...section,
            title:
              section.uploaded || !section.title.match(/^Phần \d+/)
                ? section.title
                : `Phần ${idx + 1}`,
          }));
          const updatedParts = filteredParts.map((part, idx) => ({
            ...part,
            name:
              part.uploaded || !part.name?.match(/^Phần \d+/)
                ? part.name
                : `Phần ${idx + 1}`,
            id: part.uploaded ? part.id : `sec-${idx + 1}`,
          }));
          let newSelectedId = null;
          if (prevState.selectedSectionId === id) {
            if (updatedSections.length > 0) {
              newSelectedId = updatedSections[0].id;
            }
          } else {
            const stillExists = updatedSections.some(
              (s) => s.id === prevState.selectedSectionId,
            );
            newSelectedId = stillExists
              ? prevState.selectedSectionId
              : updatedSections[0]?.id || null;
          }
          return {
            sections: updatedSections,
            tabData: filteredTabData,
            parts: updatedParts, // ✅ THÊM: Cập nhật parts state
            selectedSectionId: newSelectedId,
            examSectionId: newSelectedId,
            selectedSectionType: newSelectedId ? "normal" : null,
            statusTopic: null,
            examSectionGroupId: null,
            examSectionSubjectId: null,
          };
        },
        () => {
          try {
            this.saveTabDataToSession();
          } catch (e) {
            console.warn("Save to session failed:", e);
          }
          this.forceUpdate();
          notification.success({
            message: "Xóa phần thi thành công",
            placement: "topRight",
            duration: 2,
          });
        },
      );
    }
  };
  recomputeSectionTitles = (sections) => {
    return sections.map((section, idx) => {
      let newTitle = section.title;
      if (section.type === "topic") {
        if (!section.title || !section.title.includes("Nhóm chủ đề")) {
          newTitle = `Phần thi nhóm chủ đề ${idx + 1}`;
        }
      } else if (section.type === "MAC_DINH") {
        if (!section.title || !section.title.startsWith("Phần")) {
          newTitle = `Phần ${idx + 1}`;
        }
      }
      return { ...section, title: newTitle };
    });
  };

  openGroupModal = (action, group = null) => {
    this.setState({
      showGroupModal: true,
      actionGroup: action,
      groupDetail: group,
    });
  };

  closeGroupModal = () => {
    this.setState({
      showGroupModal: false,
      actionGroup: "create",
      groupDetail: null,
      itemGroupTabData: null,
      dataItemGroup: null,
    });
    if ($("#createGroup").length > 0) {
      $("#createGroup").hide();
      $("body").removeClass("modal-open");
      $(".modal-backdrop").remove();
    }
  };

  handleCreateGroup = (newGroup) => {
    this.setState((prevState) => ({
      groups: [
        ...prevState.groups, // giữ nguyên nhóm cũ
        {
          ...newGroup,
          subjects: newGroup.subjects || [], // mặc định môn học trống
          questions: [], // danh sách câu hỏi trống lúc tạo
        },
      ],
      showGroupModal: false,
      groupDetail: null,
    }));
  };

  handleUpdateGroup = (updatedGroup) => {
    this.setState((prevState) => ({
      groups: prevState.groups.map((g) =>
        g.id === updatedGroup.id ? updatedGroup : g,
      ),
      showGroupModal: false,
    }));
  };

  handleSelectSubject = (selectedSubject) => {
    this.setState({
      selectedSubject: selectedSubject,
      subject: selectedSubject,
    });
  };

  openExamConfigModal = () => {
    const parts = Array.isArray(this.state.parts) ? this.state.parts : [];
    const sections = Array.isArray(this.state.sections)
      ? this.state.sections
      : [];
    const tabData = Array.isArray(this.state.tabData) ? this.state.tabData : [];

    const perPart = parts.map((p) => Number(p?.time || 0));
    const scorePerPart = sections.map((section, idx) => {
      const existingScore = this.state.scorePerPart?.[idx];
      if (existingScore !== undefined && existingScore !== null) {
        return String(existingScore);
      }
      const partScore = parts[idx]?.score;
      const tabScore = tabData[idx]?.total_score;

      return String(Number(partScore || tabScore || 0));
    });
    const questionScorePart = sections.map((section, idx) => {
      const totalScore = parseFloat(scorePerPart[idx] || 0);
      const totalQuestions =
        section.type === "NHOM_CHU_DE"
          ? (section.groupTopics || []).reduce((count, g) => {
            return (
              count +
              (g.subjects || []).reduce((subCount, subj) => {
                return (
                  subCount +
                  (subj.questions || []).filter((q) => q.type !== "cluster")
                    .length
                );
              }, 0)
            );
          }, 0)
          : (section.questions || []).filter((q) => q.type !== "cluster")
            .length;
      const subSectionCount = (section.childExam || []).reduce((count, sub) => {
        return (
          count +
          (sub.questions || []).filter((q) => q.type !== "cluster").length
        );
      }, 0);

      const finalTotal = totalQuestions + subSectionCount;
      const questionScore =
        finalTotal > 0 ? (totalScore / finalTotal).toFixed(4) : 0;

      return String(questionScore);
    });
    this.setState({
      showConfigModal: true,
      scorePerPart,
      questionScorePart,
    });
  };

  closeExamConfigModal = () => {
    this.setState({ showConfigModal: false });
  };

  setTimeMode = (mode) => {
    if (mode !== "TOTAL" && mode !== "PER_PART") return;
    if (mode === "TOTAL") {
      this.setState({
        timeMode: "TOTAL",
        timeTotal: Number(this.state.time || 0) || 0,
      });
      return;
    }
    if (mode === "PER_PART") {
      this.setState({ timeMode: "PER_PART", timeTotal: "" });
    }
  };

  handleTimeTotalChange = (e) => {
    const value = Number(e.target.value || 0);
    this.setState({ timeTotal: value });
  };

  handleTimePerPartChange = (index, value) => {
    const v = Number(value || 0);
    this.setState((prev) => {
      const arr = Array.isArray(prev.timePerPart) ? [...prev.timePerPart] : [];
      if (index >= 0 && index < arr.length) arr[index] = v;
      return { timePerPart: arr };
    });
  };

  handleScorePerPartChange = (index, raw) => {
    if (typeof raw !== "string") raw = String(raw ?? "");
    let sanitized = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    sanitized = sanitized.replace(/(\..*?)\./g, "$1");
    this.setState((prev) => {
      const arr = Array.isArray(prev.scorePerPart)
        ? [...prev.scorePerPart]
        : [];
      if (index >= 0) arr[index] = sanitized;
      return { scorePerPart: arr };
    });
  };

  handlePartTitleChange = (index, value) => {
    this.setState((prev) => {
      const arr = Array.isArray(prev.titlePerPart)
        ? [...prev.titlePerPart]
        : [];
      if (index >= 0) arr[index] = value;
      return { titlePerPart: arr };
    });
  };
  saveExamConfig = () => {
    try {
      const sections = Array.isArray(this.state.sections)
        ? this.state.sections
        : [];
      const nextState = { showConfigModal: false };
      const updatedTabData = this.state.tabData.map((tab, idx) => {
        const correspondingSection = sections[idx];

        if (correspondingSection) {
          const totalScore = Number(
            this.state.scorePerPart?.[idx] || correspondingSection.score || 0,
          );
          let totalQuestions = 0;
          if (correspondingSection.type === "NHOM_CHU_DE") {
            totalQuestions = (correspondingSection.groupTopics || []).reduce(
              (count, g) => {
                return (
                  count +
                  (g.subjects || []).reduce((subCount, subj) => {
                    return (
                      subCount +
                      (subj.questions || []).filter((q) => q.type !== "cluster")
                        .length
                    );
                  }, 0)
                );
              },
              0,
            );
          } else {
            totalQuestions = (correspondingSection.questions || []).filter(
              (q) => q.type !== "cluster",
            ).length;
            totalQuestions += (correspondingSection.childExam || []).reduce(
              (count, sub) => {
                return (
                  count +
                  (sub.questions || []).filter((q) => q.type !== "cluster")
                    .length
                );
              },
              0,
            );
          }
          const questionsScore =
            totalQuestions > 0 ? totalScore / totalQuestions : 0;

          return {
            ...tab,
            exam_section_name:
              correspondingSection.title || tab.exam_section_name,
            total_score: totalScore, // ✅ SỬA: Sử dụng giá trị từ scorePerPart
            questions_score: questionsScore,
            exam_section_time:
              this.state.statusExam === false
                ? this.state.time || 0 // Chế độ tổng thời gian
                : Number(correspondingSection.time || 0), // Chế độ thời gian theo phần
          };
        }
        return tab;
      });
      if (this.state.statusExam === false) {
        nextState.time = Number(this.state.time || 0);
      } else {
        const total = sections.reduce(
          (sum, section) => sum + (Number(section.time) || 0),
          0,
        );
        nextState.time = total;
      }

      nextState.tabData = updatedTabData;
      this.setState(nextState, () => {
        this.saveTabDataToSession();
        this.forceUpdate();
        notification.success({
          message: "Lưu cấu hình thành công",
          description: "Đã cập nhật cấu hình đề thi",
          placement: "topRight",
          duration: 2,
        });
      });
    } catch (e) {
      console.error("[ERROR] saveExamConfig failed:", e);
      notification.error({
        message: "Lỗi khi lưu cấu hình",
        description: e.message || "Có lỗi xảy ra khi lưu cấu hình",
        placement: "topRight",
        duration: 3,
      });
      this.setState({ showConfigModal: false });
    }
  };

  onDragEndQuestion = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;
    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    ) {
      return;
    }
    const parts = draggableId.split("-");
    const context = parts.length >= 3 ? parts[2] : "main"; // context ở vị trí thứ 3
    if (
      context === "main" &&
      source.droppableId === "questions-droppable" &&
      destination.droppableId === "questions-droppable"
    ) {
      const currentQuestions = this.getQuestionsForCurrentSelection();
      if (!Array.isArray(currentQuestions) || currentQuestions.length === 0) {
        return;
      }
      const draggedItem = currentQuestions[source.index];
      if (!draggedItem) {
        return;
      }
      if (draggedItem.parentId) {
        return;
      }
      let itemsToMove = [draggedItem];
      if (draggedItem.type === "cluster" || draggedItem.type === "Cluster") {
        const children = currentQuestions.filter(
          (q) => q.parentId === draggedItem._id,
        );
        itemsToMove = itemsToMove.concat(children);
      }
      let reorderedQuestions = Array.from(currentQuestions);
      itemsToMove.forEach(() => {
        reorderedQuestions.splice(source.index, 1);
      });
      reorderedQuestions.splice(destination.index, 0, ...itemsToMove);
      const firstNonCluster = reorderedQuestions.find(
        (q) => (q.type || "").toUpperCase() !== "CLUSTER",
      );
      let currentNumber = firstNonCluster ? firstNonCluster.number || 1 : 1;
      const updatedQuestions = reorderedQuestions.map((question) => {
        if ((question.type || "").toUpperCase() === "CLUSTER") {
          return { ...question, number: 0, question_no: null };
        } else {
          // ✅ Renumber theo vị trí được thả xuống
          const newNumber = currentNumber;
          currentNumber++;
          return { ...question, number: newNumber, question_no: newNumber };
        }
      });
      this.setState(
        (prevState) => {
          const updatedTabData = prevState.tabData.map((tab) => {
            if (tab._id === prevState.selectedSectionId) {
              if (tab.exam_section_type === "MAC_DINH") {
                return { ...tab, questions: updatedQuestions };
              } else if (tab.exam_section_type === "NHOM_CHU_DE") {
                const updatedGroupTopic = (tab.groupTopic || []).map(
                  (group) => {
                    const updatedSubjects = (group.subjects || []).map(
                      (subject) => {
                        const isActiveSubject = this.isActiveSubject(subject);
                        if (isActiveSubject) {
                          return {
                            ...subject,
                            questions: updatedQuestions,
                          };
                        }
                        return subject;
                      },
                    );
                    return {
                      ...group,
                      subjects: updatedSubjects,
                    };
                  },
                );

                return {
                  ...tab,
                  groupTopic: updatedGroupTopic,
                };
              } else if (tab.exam_section_type === "GROUP_SUBJECT") {
                const updatedGroups = tab.exam_section_group.map((group) => ({
                  ...group,
                  subjects: group.subjects.map((subject) => {
                    if (
                      subject.subject_id ===
                      (prevState.selectedSubject &&
                        prevState.selectedSubject.id)
                    ) {
                      return {
                        ...subject,
                        questions: updatedQuestions,
                      };
                    }
                    return subject;
                  }),
                }));
                return { ...tab, exam_section_group: updatedGroups };
              }
            }
            return tab;
          });

          return { tabData: updatedTabData };
        },
        () => {
          this.forceUpdate();
          this.saveTabDataToSession();
        },
      );
      return;
    }
    if (
      source.droppableId.startsWith("questions-droppable-sub-") &&
      destination.droppableId.startsWith("questions-droppable-sub-")
    ) {
      const subSectionId = source.droppableId.replace(
        "questions-droppable-sub-",
        "",
      );
      this.onDragEndSubSectionQuestion(result, subSectionId);
      return;
    }
    if (
      source.droppableId.startsWith("questions-droppable-child-") &&
      destination.droppableId.startsWith("questions-droppable-child-")
    ) {
      const childExamId = source.droppableId.replace(
        "questions-droppable-child-",
        "",
      );
      this.onDragEndChildExamQuestion(result, childExamId);
      return;
    }
    if (
      source.droppableId.startsWith("group-") &&
      destination.droppableId.startsWith("group-")
    ) {
      const sourceMatch = source.droppableId.match(/group-(\d+)-subject-(\d+)/);
      const destMatch = destination.droppableId.match(
        /group-(\d+)-subject-(\d+)/,
      );

      if (sourceMatch && destMatch) {
        const sourceGroupIdx = parseInt(sourceMatch[1]);
        const sourceSubjectIdx = parseInt(sourceMatch[2]);
        const destGroupIdx = parseInt(destMatch[1]);
        const destSubjectIdx = parseInt(destMatch[2]);
        if (
          sourceGroupIdx === destGroupIdx &&
          sourceSubjectIdx === destSubjectIdx
        ) {
          this.onDragEndTopicGroupQuestion(
            result,
            sourceGroupIdx,
            sourceSubjectIdx,
          );
        }
      }
      return;
    }
    if (
      source.droppableId === "topic-group-table" &&
      destination.droppableId === "topic-group-table"
    ) {
      this.onDragEndTopicGroupTableQuestion(result);
      return;
    }
  };
  onDragEndTopicGroupQuestion = (result, groupIdx, subjectIdx) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;
    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab._id === prevState.selectedSectionId && tab.groupTopic) {
            const updatedGroupTopic = [...tab.groupTopic];

            if (
              updatedGroupTopic[groupIdx] &&
              updatedGroupTopic[groupIdx].subjects[subjectIdx]
            ) {
              const currentSubject =
                updatedGroupTopic[groupIdx].subjects[subjectIdx];
              let reorderedQuestions = Array.from(
                currentSubject.questions || [],
              );
              const [removed] = reorderedQuestions.splice(source.index, 1);
              reorderedQuestions.splice(destination.index, 0, removed);
              let currentNumber = this.getStartingQuestionNumberForGroup(
                groupIdx,
                subjectIdx,
              );
              const updatedQuestions = reorderedQuestions.map((question) => {
                if ((question.type || "").toUpperCase() === "CLUSTER") {
                  return { ...question, number: 0, question_no: null };
                } else {
                  // ✅ Renumber theo vị trí được thả xuống
                  const newNumber = currentNumber;
                  currentNumber++;
                  return {
                    ...question,
                    number: newNumber,
                    question_no: newNumber,
                  };
                }
              });

              updatedGroupTopic[groupIdx].subjects[subjectIdx] = {
                ...currentSubject,
                questions: updatedQuestions,
              };
            }

            return {
              ...tab,
              groupTopic: updatedGroupTopic,
            };
          }
          return tab;
        });

        return {
          tabData: updatedTabData,
          renderTrigger: prevState.renderTrigger + 1,
        };
      },
      () => {
        this.forceUpdate(); // ✅ Cập nhật ngay lập tức
        this.saveTabDataToSession();
        setTimeout(() => {
          this.forceUpdate();
        }, 100);
      },
    );
  };
  onDragEndTopicGroupTableQuestion = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab._id === prevState.selectedSectionId && tab.groupTopic) {
            const activeSubject = this.getActiveSubjectInTopicGroup();
            if (activeSubject) {
              let reorderedQuestions = Array.from(
                activeSubject.questions || [],
              );
              const [removed] = reorderedQuestions.splice(source.index, 1);
              reorderedQuestions.splice(destination.index, 0, removed);
              let questionIndex = 0;
              reorderedQuestions = reorderedQuestions.map((question) => {
                if ((question.type || "").toUpperCase() === "CLUSTER") {
                  return { ...question, number: 0, question_no: null };
                } else {
                  const newNumber = questionIndex + 1;
                  questionIndex++;
                  return {
                    ...question,
                    number: newNumber,
                    question_no: newNumber,
                  };
                }
              });
              const updatedGroupTopic = tab.groupTopic.map((group) => ({
                ...group,
                subjects: group.subjects.map((subject) => {
                  if (subject.idSubject === activeSubject.idSubject) {
                    return {
                      ...subject,
                      questions: reorderedQuestions,
                    };
                  }
                  return subject;
                }),
              }));

              return {
                ...tab,
                groupTopic: updatedGroupTopic,
              };
            }
          }
          return tab;
        });

        return {
          tabData: updatedTabData,
          renderTrigger: prevState.renderTrigger + 1,
        };
      },
      () => {
        this.forceUpdate(); // ✅ Cập nhật ngay lập tức
        this.saveTabDataToSession();
        setTimeout(() => {
          this.forceUpdate();
        }, 100);
      },
    );
  };

  onDragEndSubSectionQuestion = (result, subSectionId) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;
    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab._id === prevState.selectedSectionId) {
            if (tab.childExam && Array.isArray(tab.childExam)) {
              const childExamIndex = tab.childExam.findIndex(
                (child) =>
                  String(child.id) === String(subSectionId) ||
                  String(child.idChildExam) === String(subSectionId),
              );
              if (childExamIndex !== -1) {
                const subSection = tab.childExam[childExamIndex];
                let reorderedQuestions = Array.from(subSection.questions || []);
                reorderedQuestions.splice(source.index, 1);
                reorderedQuestions.splice(
                  destination.index,
                  0,
                  subSection.questions[source.index],
                );

                let questionIndex = 0;
                const updatedQuestions = reorderedQuestions.map((question) => {
                  if (
                    question.type === "cluster" ||
                    question.type === "Cluster"
                  ) {
                    return { ...question, number: 0, question_no: null };
                  } else {
                    // ✅ Renumber theo vị trí được thả xuống
                    const newNumber = questionIndex + 1;
                    questionIndex++;
                    return {
                      ...question,
                      number: newNumber,
                      question_no: newNumber,
                    };
                  }
                });

                const updatedChildExam = [...tab.childExam];
                updatedChildExam[childExamIndex] = {
                  ...subSection,
                  questions: updatedQuestions,
                };

                return {
                  ...tab,
                  childExam: updatedChildExam,
                };
              }
            }
            if (tab.subSections) {
              const updatedSubSections = tab.subSections.map((subSection) => {
                if (subSection.id === subSectionId) {
                  let reorderedQuestions = Array.from(
                    subSection.questions || [],
                  );
                  reorderedQuestions.splice(source.index, 1);
                  reorderedQuestions.splice(
                    destination.index,
                    0,
                    subSection.questions[source.index],
                  );

                  let currentNumber = 1;
                  const updatedQuestions = reorderedQuestions.map(
                    (question) => {
                      if (
                        question.type === "cluster" ||
                        question.type === "Cluster"
                      ) {
                        return { ...question, number: 0, question_no: null };
                      } else {
                        // ✅ Renumber theo vị trí được thả xuống
                        const newNumber = currentNumber;
                        currentNumber++;
                        return {
                          ...question,
                          number: newNumber,
                          question_no: newNumber,
                        };
                      }
                    },
                  );

                  return {
                    ...subSection,
                    questions: updatedQuestions,
                  };
                }
                return subSection;
              });

              return {
                ...tab,
                subSections: updatedSubSections,
              };
            }
          }
          return tab;
        });

        return { tabData: updatedTabData };
      },
      () => {
        this.forceUpdate();
        this.saveTabDataToSession();
      },
    );
  };
  onDragEndChildExamQuestion = (result, childExamId) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab.childExam && Array.isArray(tab.childExam)) {
            const updatedChildExam = tab.childExam.map((child) => {
              if (String(child.idChildExam) === String(childExamId)) {
                let reorderedQuestions = Array.from(child.questions || []);
                const [removed] = reorderedQuestions.splice(source.index, 1);
                reorderedQuestions.splice(destination.index, 0, removed);
                let questionIndex = 0;
                reorderedQuestions = reorderedQuestions.map((question) => {
                  if (
                    question.type === "cluster" ||
                    question.type === "Cluster"
                  ) {
                    return { ...question, number: 0, question_no: null };
                  } else {
                    const newNumber = questionIndex + 1;
                    questionIndex++;
                    return {
                      ...question,
                      number: newNumber,
                      question_no: newNumber,
                    };
                  }
                });

                return {
                  ...child,
                  questions: reorderedQuestions,
                };
              }
              return child;
            });

            return {
              ...tab,
              childExam: updatedChildExam,
            };
          }
          return tab;
        });

        return { tabData: updatedTabData };
      },
      () => {
        this.forceUpdate();
        this.saveTabDataToSession();
      },
    );
  };
  onDragEndTopicGroupTableQuestion = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;
    const currentTab = this.state.tabData.find(
      (tab) => tab._id === this.state.selectedSectionId,
    );

    if (!currentTab || !currentTab.groupTopic) {
      return;
    }
    let targetGroupIdx = -1;
    let targetSubjectIdx = -1;

    currentTab.groupTopic.forEach((group, groupIdx) => {
      const selectedSubjectIdx =
        this.state.selectedGroupSubject?.[groupIdx] ?? 0;
      if (group.subjects[selectedSubjectIdx]) {
        targetGroupIdx = groupIdx;
        targetSubjectIdx = selectedSubjectIdx;
      }
    });

    if (targetGroupIdx === -1 || targetSubjectIdx === -1) {
      return;
    }

    const currentQuestions =
      currentTab.groupTopic[targetGroupIdx].subjects[targetSubjectIdx]
        .questions || [];
    const reorderedQuestions = Array.from(currentQuestions);
    const [removed] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, removed);
    const startingNumber = this.getStartingQuestionNumber();
    let questionIndex = 0;
    reorderedQuestions.forEach((question) => {
      if (
        question.type !== "cluster" &&
        question.type !== "Cluster" &&
        question.type !== "CLUSTER"
      ) {
        question.question_no = startingNumber + questionIndex + 1; // ✅ Cộng 1
        question.number = startingNumber + questionIndex + 1; // ✅ Cộng 1
        questionIndex++;
      } else {
        question.question_no = null;
        question.number = 0;
      }
    });
    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab._id === prevState.selectedSectionId && tab.groupTopic) {
            const updatedGroupTopic = [...tab.groupTopic];
            updatedGroupTopic[targetGroupIdx].subjects[targetSubjectIdx] = {
              ...updatedGroupTopic[targetGroupIdx].subjects[targetSubjectIdx],
              questions: reorderedQuestions,
            };

            return {
              ...tab,
              groupTopic: updatedGroupTopic,
            };
          }
          return tab;
        });

        return { tabData: updatedTabData };
      },
      () => {
        this.forceUpdate();
        this.saveTabDataToSession();
      },
    );
  };
  /**
   * ✅ NEW: Wrapper method gọi QuestionNumberingService
   * @deprecated Sử dụng trực tiếp QuestionNumberingService.unifiedQuestionNumbering() thay vì method này
   */
  updateQuestionNumbers = (questions, startingNumber = 1) => {
    if (!Array.isArray(questions) || questions.length === 0) {
      return questions;
    }
    const tableType = this.determineTableType();

    return QuestionNumberingService.unifiedQuestionNumbering(
      questions,
      tableType,
      {
        sectionId: this.state.selectedSectionId,
        subSectionId: this.state.currentSubSectionId,
        tabData: this.state.tabData,
      },
    );
  };

  /**
   * Helper để xác định loại bảng hiện tại
   */
  determineTableType = () => {
    const currentTab = this.state.tabData?.find(
      (tab) => tab._id === this.state.selectedSectionId,
    );

    if (currentTab?.exam_section_type === "NHOM_CHU_DE") {
      return "NHOM_CHU_DE";
    }

    if (this.state.currentSubSectionId) {
      return "SUB_SECTION";
    }

    return "MAIN";
  };

  async componentDidMount() {
    await this.initData();
    await this.props.listSubject(this.getData());
    await this.props.listExamCategory(this.getData());
    await this.props.listExamTestCategory(this.getData());
    await this.props.listExamWord({ limit: 9999, is_delete: false });
    document.addEventListener("click", this.handleClickOutside);
  }

  componentWillUnmount() {
    // Clear timeout để tránh memory leak
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    document.removeEventListener("click", this.handleClickOutside);
  }
  handleClickOutside = (event) => {
    const dropdown = event.target.closest(".form-group");
    const isProvinceField =
      dropdown &&
      dropdown.querySelector('input[placeholder="Chọn tỉnh/thành phố..."]');

    if (!isProvinceField && this.state.showProvinceDropdown) {
      this.setState({
        showProvinceDropdown: false,
        provinceSearchTerm: "",
      });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    this.setupAutoRender();
  }

  setupAutoRender = () => {
    const container = document.querySelector(".exam-create-container");
    if (container) {
      try {
        renderMathInElement(container, {
          delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
          errorColor: "#cc0000",
          strict: "warn",
        });
      } catch (error) {
        console.warn("LaTeX rendering error in ExamWordEdit:", error);
      }
    }
  };

  processClusterQuestionsFromAPI = async (tabData) => {
    const updatedTabData = [...tabData];

    for (let tabIdx = 0; tabIdx < updatedTabData.length; tabIdx++) {
      const tab = updatedTabData[tabIdx];
      if (tab.questions && Array.isArray(tab.questions)) {
        const { processedQuestions, childQuestions } = this.processClusterArray(
          tab.questions,
        );
        updatedTabData[tabIdx].questions = [
          ...processedQuestions,
          ...childQuestions,
        ];
      }
      if (tab.subSections && Array.isArray(tab.subSections)) {
        updatedTabData[tabIdx].subSections = tab.subSections.map(
          (subSection) => {
            if (subSection.questions && Array.isArray(subSection.questions)) {
              const { processedQuestions, childQuestions } =
                this.processClusterArray(subSection.questions);
              return {
                ...subSection,
                questions: [...processedQuestions, ...childQuestions],
              };
            }
            return subSection;
          },
        );
      }
      if (tab.groupTopic && Array.isArray(tab.groupTopic)) {
        updatedTabData[tabIdx].groupTopic = tab.groupTopic.map((group) => {
          if (group.subjects && Array.isArray(group.subjects)) {
            return {
              ...group,
              subjects: group.subjects.map((subject) => {
                if (subject.questions && Array.isArray(subject.questions)) {
                  const { processedQuestions, childQuestions } =
                    this.processClusterArray(subject.questions);
                  return {
                    ...subject,
                    questions: [...processedQuestions, ...childQuestions],
                  };
                }
                return subject;
              }),
            };
          }
          return group;
        });
      }
    }

    return updatedTabData;
  };
  processClusterArray = (questions) => {
    const getNumber = (q) => {
      const n1 = typeof q.number === "number" ? q.number : 0;
      const n2 = parseInt(q.question_no, 10);
      return Math.max(n1, isNaN(n2) ? 0 : n2);
    };
    let maxNumber = 0;
    (Array.isArray(questions) ? questions : []).forEach((q) => {
      const isClusterParent =
        (q.type || "").toUpperCase() === "CLUSTER" && !q.parentId;
      if (!isClusterParent) {
        const n = getNumber(q);
        if (n > maxNumber) maxNumber = n;
      }
    });
    let currentNumber = maxNumber + 1;

    const newQuestions = [];
    const childQuestionsToAdd = [];

    (Array.isArray(questions) ? questions : []).forEach((question) => {
      newQuestions.push(question);

      if (
        question.type === "cluster" &&
        question.clusterQuestions &&
        Array.isArray(question.clusterQuestions)
      ) {
        const clusterId = question._id || question.questionId;

        question.clusterQuestions.forEach((childData, childIdx) => {
          const assignedNumber = currentNumber + childIdx;
          const childQuestion = {
            _id: childData.questionId || `child-${clusterId}-${childIdx}`,
            questionId: childData.questionId,
            parentId: clusterId,
            number: assignedNumber,
            question_no: assignedNumber,
            type: (childData.type || "").toLowerCase(),
            rawHtml: childData.question || childData.rawHtml || "",
            correctAnswers:
              childData.selectedAnswers || childData.correctAnswers || [],
            choices: childData.choices || [],
            explanation: childData.explanation || "",
            level: childData.level || "",
            images: childData.images || [],
            video: childData.video || "",
            created_at: new Date().toISOString(),
            isTemp: false,
          };
          childQuestionsToAdd.push(childQuestion);
        });

        currentNumber += question.clusterQuestions.length;
      }
    });

    return {
      processedQuestions: newQuestions,
      childQuestions: childQuestionsToAdd,
    };
  };

  async initData() {
    const url = this.props.location.search;
    let params = queryString.parse(url);
    let examId = params.id;

    if (examId && examId !== "") {
      const detail = await this.props.getExamWordDetail(examId);
      const dbSections = (detail.parts || []).map((part, idx) => {
        const classification = this.classifySectionType(part);

        if (
          part.type === "NHOM_CHU_DE" ||
          classification.type === "NHOM_CHU_DE"
        ) {
          return {
            id: `sec-${idx + 1}`,
            title: part.name || `Nhóm chủ đề ${idx + 1}`,
            type: "NHOM_CHU_DE",
            time: part.time,
            maxTopics: part.maxGroup || 1,
            total_question: part.totalquestions,
            score: part.score,
            groupTopics: (part.subpart || []).map((grp, gIdx) => ({
              idTopic: grp._id || `group-${gIdx}`,
              maxSubject: grp.maxSubject || 1,
              nameTopic: grp.name || `Nhóm ${gIdx + 1}`,
              subjects: (grp.children || []).map((s, sIdx) => ({
                idSubject: s._id || `subject-${sIdx}`,
                nameSubject: s.name || `Môn ${sIdx + 1}`,
                questions: (s.questions || []).map((q) => ({
                  _id: q.question?._id,
                  isTestQuestion: q.isTestQuestion || false,
                  question_no: q.number,
                  ...q.question,
                })),
              })),
            })),
          };
        }

        if (Array.isArray(part.subpart) && part.subpart.length >= 1) {
          // ✅ SỬA: >= 1 thay vì > 1
          const hasAnyMainSubpart = part.subpart.some(
            (subpart) => subpart.isMain === true,
          );

          if (hasAnyMainSubpart) {
            const questionData = this.buildQuestionDataInitSectionFormAPI(part);
            const childExamData = this.buildChildExamInitSectionsFromAPI(part);

            return {
              id: `sec-${idx + 1}`,
              title: part.name || `Phần ${idx + 1}`,
              type: part.type || "MAC_DINH",
              time: part.time,
              total_question: part.totalquestions,
              score: part.score,
              questions: questionData,
              childExam: childExamData,
            };
          } else {
            const childExamData =
              this.buildChildExamInitSectionsFromAPIAllItems(part);
            return {
              id: `sec-${idx + 1}`,
              title: part.name || `Phần ${idx + 1}`,
              type: part.type || "MAC_DINH",
              time: part.time,
              total_question: part.totalquestions,
              score: part.score,
              questions: [], // ✅ RỖNG - không có câu hỏi chính
              childExam: childExamData,
            };
          }
        }
        let mainQuestions = [];
        let subSections = [];

        if (Array.isArray(part.subpart)) {
          part.subpart.forEach((sp, spIdx) => {
            const subpartQuestions = [];
            if (Array.isArray(sp.children)) {
              sp.children.forEach((child) => {
                if (Array.isArray(child.questions)) {
                  child.questions.forEach((qWrap, qIdx) => {
                    const normalizedQ = this.normalizeQuestion(qWrap, qIdx);
                    if (
                      normalizedQ.needsChildRecreation &&
                      normalizedQ.clusterQuestions
                    ) {
                      normalizedQ.clusterQuestions.forEach(
                        (childData, childIdx) => {
                          const childQuestion = {
                            _id:
                              childData.questionId ||
                              `child-${normalizedQ.questionId}-${childIdx}`,
                            questionId: childData.questionId,
                            parentId: normalizedQ.questionId, // ✅ SỬA: parentId = questionId của cluster
                            question_no:
                              spIdx === 0
                                ? mainQuestions.length + childIdx + 1
                                : subpartQuestions.length + childIdx + 1,
                            type:
                              childData.type?.toUpperCase() ||
                              "TN_SINGLE_CHOICE",
                            rawHtml:
                              childData.question || childData.rawHtml || "",
                            correctAnswers:
                              childData.selectedAnswers ||
                              childData.correctAnswers ||
                              [],
                            choices: childData.choices || [],
                            explanation: childData.explanation || "",
                            level: childData.level || "",
                            images: childData.images || [],
                            video:
                              childData.video || childData.video_link || "",
                            created_at: new Date(),
                          };
                          if (spIdx === 0) {
                            mainQuestions.push(childQuestion);
                          } else {
                            subpartQuestions.push(childQuestion);
                          }
                        },
                      );
                      delete normalizedQ.clusterQuestions;
                      delete normalizedQ.needsChildRecreation;
                    }
                    if (spIdx === 0) {
                      mainQuestions.push(normalizedQ);
                    } else {
                      subpartQuestions.push(normalizedQ);
                    }
                  });
                }
              });
            }
            if (spIdx > 0 && subpartQuestions.length > 0) {
              const subSection = {
                id: `sub-${sp._id || `${idx}-${spIdx}`}`,
                name: sp.title || sp.name || `Phần con ${spIdx}`,
                questions: subpartQuestions,
                createdAt: new Date().toISOString(),
                time: sp.time || 0,
                score: sp.score || 0,
              };
              if (sp.title) {
                subSection.originalTitle = sp.title;
              }

              subSections.push(subSection);
            }
          });
        }

        return {
          id: `sec-${idx + 1}`,
          title: part.name || `Phần ${idx + 1}`,
          type: part.type || "MAC_DINH",
          time: part.time,
          score: part.score,
          maxTopics: part.maxTopics || 1,
          questions: mainQuestions,
          subSections: subSections,
        };
      });
      const newTabData = dbSections.map((sec, idx) => {
        if (sec.type === "NHOM_CHU_DE") {
          return {
            _id: sec.id,
            exam_section_name: sec.title,
            exam_section_type: "NHOM_CHU_DE",
            exam_section_time: detail.time || 0,
            total_score: sec.score || 10,
            maxTopics: sec.maxTopics || 1,
            calculate_score_type: "total_point",
            questions: [],
            exam_section_group: [],
            groupTopic: sec.groupTopics || [],
            childExam: sec.childExam || [], // ✅ THÊM childExam cho NHOM_CHU_DE
            active: idx === 0,
            uploaded: true,
          };
        }

        return {
          _id: sec.id,
          exam_section_name: sec.title,
          exam_section_type: "MAC_DINH",
          exam_section_time: sec.time || detail.time || 0,
          total_score: sec.score || 10,
          calculate_score_type: "total_point",
          maxTopics: sec.maxTopics || 1,
          questions: sec.questions || [],
          childExam: sec.childExam || [],
          exam_section_group: [],
          active: idx === 0,
          uploaded: true,
        };
      });
      await this.props.listGift({
        status: true,
        keyword: "",
        competition_part_id: detail?.categoryExam?.populate_id?._id,
        sort_key: "",
        sort_value: "",
        limit: 20,
        page: 1,
      });

      this.setState({
        showConfigModal: true,
        e_cheating: detail.e_cheating || false,
        examId,
        name: detail.name || "",
        alias: detail.alias || "",
        typeExam: detail?.categoryExam?.populate_id?._id || "",
        examTypeId: detail?.categoryExam?.type_exam || "",
        linkExam: detail.exam_doc_link || "",
        linkExam2: detail.exam_doc_link2 || "",
        linkAnswer: detail.answer_doc_link || "",
        group: detail.group || "",
        classes: detail.classes || null,
        subject_id: detail.subject?.id || "",
        is_redo: detail.is_redo,
        level: detail.level || "",
        time: detail.time || 90,
        tp: String(detail.tp || ""),
        selectedSectionId: dbSections.length > 0 ? dbSections[0].id : null,
        parts: dbSections,
        sections: dbSections,
        tabData: newTabData,
        examSectionId: newTabData[0] ? newTabData[0]._id : null,
        questions: detail.questions || [],
        actionUser: "UPDATE",
        isPracticeConfig: detail.practiceConfig?.status || false,
        startDate: detail.practiceConfig?.startDate
          ? new Date(detail.practiceConfig.startDate)
          : null,
        endDate: detail.practiceConfig?.endDate
          ? new Date(detail.practiceConfig.endDate)
          : null,
        resultDisplay: detail.practiceConfig?.result_display || "LATER",
        answerDisplay: detail.practiceConfig?.answer_display || "LATER",
        requirePassword: detail.practiceConfig?.required_passwword || false,
        examPassword: detail.practiceConfig?.password || "",
        fastGiftStatus: detail.fast_gift?.status || false,
        fastGifts_id: detail.fast_gift?.id || "",
      });
      if (detail.tp) {
        await this.loadProvinceNameByCode(detail.tp);
      }
      if (detail?.categoryExam?.populate_id?._id) {
        const selectedExam = this.props.examCategories.find(
          (item) => item._id === detail.categoryExam.populate_id._id,
        );
        if (selectedExam?.config?.[0]?.timePerPart) {
          this.setState({
            statusExam: selectedExam.config[0].timePerPart,
          });
        }
        await this.props.showExamCategory(detail.categoryExam.populate_id._id);
      }
    }
  }
  normalizeQuestion = (q, qIdx) => {
    let sourceQuestion, sourceParentId, sourceQuestionId, sourceType;

    // ✅ FIX: Handle case where q.question is a STRING (question ID) instead of OBJECT
    if (q.question) {
      // Check if q.question is a string (question ID) or object
      if (typeof q.question === "string") {
        // Backend returned unpopulated question ID - create placeholder
        console.warn(
          "[NORMALIZE] Question is string ID (unpopulated):",
          q.question,
        );
        sourceQuestion = {
          _id: q.question,
          questionId: q.question,
          // We don't have full data, but we can infer some from q wrapper
          type: q.type || "singlechoice", // default type
          rawHtml: "",
          correctAnswers: [],
          choices: [],
          level: "",
          explanation: "",
          images: [],
          video: "",
          parentId: q.parentId || null,
        };
        sourceParentId = q.parentId || null;
        sourceQuestionId = q.question;
        sourceType = q.type || "singlechoice";
      } else {
        // q.question is an object - normal case
        sourceQuestion = q.question;
        sourceParentId = q.question.parentId;
        sourceQuestionId = q.question.questionId || q.question._id;
        sourceType = q.question.type;
      }
    } else {
      sourceQuestion = q;
      sourceParentId = q.parentId || q.parent_id;
      sourceQuestionId = q.questionId || q._id;
      sourceType = q.type;
    }

    const finalId =
      sourceQuestion._id || sourceQuestionId || this.generateObjectId();
    // ✅ FIX: Ensure questionId is never null - generate if missing
    const finalQuestionId =
      sourceQuestionId &&
        sourceQuestionId !== null &&
        sourceQuestionId !== undefined
        ? sourceQuestionId
        : sourceQuestion._id && sourceQuestion._id !== null
          ? sourceQuestion._id
          : this.generateObjectId();

    const normalized = {
      _id: finalId,
      questionId: finalQuestionId, // ✅ QUAN TRỌNG: Preserve questionId từ API, generate nếu null
      question_id: finalId, // ✅ THÊM: Đồng bộ question_id
      question_no: q.number || sourceQuestion.question_no || qIdx + 1,
      number: q.number || sourceQuestion.number,
      code: sourceQuestion.code || sourceQuestion.id || "",
      correctAnswers: sourceQuestion.correctAnswers || [],
      type: sourceType || "TN_SINGLE_CHOICE",
      question_level: sourceQuestion.level || "THONG_THUONG",
      rawHtml: sourceQuestion.rawHtml || "",
      choices: sourceQuestion.choices || [],
      images: sourceQuestion.images || [],
      doc_link: sourceQuestion.doc_link || "",
      video_link: sourceQuestion.video_link || "",
      explanation: sourceQuestion.explanation || "",
      dragDropOptions: sourceQuestion.dragDropOptions || [],
      video: sourceQuestion.video || "",
      plainText: sourceQuestion.plainText || "",
      created_at:
        sourceQuestion.createdAt || sourceQuestion.created_at || new Date(),
      parentId: sourceParentId || null, // ✅ QUAN TRONG: Preserve parentId từ API
      clusterPassage:
        sourceQuestion.clusterPassage || sourceQuestion.rawHtml || "",
    };

    if (sourceType === "cluster" || sourceType === "Cluster") {
      let clusterQuestionsArray = null;

      if (
        sourceQuestion.clusterQuestions &&
        Array.isArray(sourceQuestion.clusterQuestions)
      ) {
        clusterQuestionsArray = sourceQuestion.clusterQuestions;
      } else if (
        sourceQuestion.children &&
        Array.isArray(sourceQuestion.children)
      ) {
        clusterQuestionsArray = sourceQuestion.children;
      } else if (
        sourceQuestion.subQuestions &&
        Array.isArray(sourceQuestion.subQuestions)
      ) {
        clusterQuestionsArray = sourceQuestion.subQuestions;
      } else if (
        sourceQuestion.childQuestions &&
        Array.isArray(sourceQuestion.childQuestions)
      ) {
        clusterQuestionsArray = sourceQuestion.childQuestions;
      }

      if (clusterQuestionsArray && clusterQuestionsArray.length > 0) {
        normalized.type = "cluster";
        normalized.clusterQuestions = clusterQuestionsArray;
        normalized.needsChildRecreation = true;
      }
    }

    return normalized;
  };
  normalizeChild = (child, childIdx) => {
    return {
      name: child.name || `Children ${childIdx + 1}`,
      questions: Array.isArray(child.questions)
        ? child.questions.map((q, qIdx) => this.normalizeQuestion(q, qIdx))
        : [],
    };
  };
  normalizeSubpart = (sp, subIdx) => {
    return {
      name: sp.name || `Subpart ${subIdx + 1}`,
      score: Number(sp.score || 0),
      time: Number(sp.time || 0),
      children: Array.isArray(sp.children)
        ? sp.children.map((child, idx) => this.normalizeChild(child, idx))
        : [],
    };
  };
  normalizePart = (part, idx) => {
    const sectionId = `sec-${idx + 1}`;
    let mainQuestions = []; // câu hỏi chính
    let subSections = []; // phần thi con

    if (Array.isArray(part.subpart)) {
      if (part.subpart.length === 1) {
        const sp = part.subpart[0];
        if (Array.isArray(sp.children)) {
          sp.children.forEach((child) => {
            if (Array.isArray(child.questions)) {
              child.questions.forEach((qWrap, qIdx) => {
                const normalizedQ = this.normalizeQuestion(qWrap, qIdx);
                mainQuestions.push(normalizedQ);
                if (
                  normalizedQ.needsChildRecreation &&
                  normalizedQ.clusterQuestions
                ) {
                  normalizedQ.clusterQuestions.forEach(
                    (childData, childIdx) => {
                      const childQuestion = {
                        _id:
                          childData.questionId ||
                          `child-${normalizedQ._id}-${childIdx}`,
                        questionId: childData.questionId,
                        question_no: mainQuestions.length + childIdx + 1,
                        code: childData.code || "",
                        correctAnswers:
                          childData.selectedAnswers ||
                          childData.correctAnswers ||
                          [],
                        type:
                          childData.type?.toUpperCase() || "TN_SINGLE_CHOICE",
                        question_level: childData.level || "THONG_THUONG",
                        rawHtml: childData.question || childData.rawHtml || "",
                        choices: childData.choices || [],
                        images: childData.images || [],
                        doc_link: childData.doc_link || "",
                        video_link: childData.video || "",
                        explanation: childData.explanation || "",
                        dragDropOptions: childData.dragDropOptions || [],
                        video: childData.video || "",
                        plainText: childData.plainText || "",
                        created_at: new Date(),
                        parentId: normalizedQ.questionId, // ✅ SỬA: parentId = questionId của cluster
                        questionId: childData.questionId,
                      };
                      mainQuestions.push(childQuestion);
                    },
                  );
                  delete normalizedQ.clusterQuestions;
                  delete normalizedQ.needsChildRecreation;
                }
              });
            }
          });
        }
      } else {
        part.subpart.forEach((sp, spIdx) => {
          const subSectionQuestions = [];
          if (Array.isArray(sp.children)) {
            sp.children.forEach((child) => {
              if (Array.isArray(child.questions)) {
                child.questions.forEach((qWrap, qIdx) => {
                  const normalizedQ = this.normalizeQuestion(qWrap, qIdx);
                  subSectionQuestions.push(normalizedQ);
                  if (
                    normalizedQ.needsChildRecreation &&
                    normalizedQ.clusterQuestions
                  ) {
                    normalizedQ.clusterQuestions.forEach(
                      (childData, childIdx) => {
                        const childQuestion = {
                          _id:
                            childData.questionId ||
                            `child-${normalizedQ._id}-${childIdx}`,
                          questionId: childData.questionId,
                          question_no:
                            subSectionQuestions.length + childIdx + 1,
                          code: childData.code || "",
                          correctAnswers:
                            childData.selectedAnswers ||
                            childData.correctAnswers ||
                            [],
                          type:
                            childData.type?.toUpperCase() || "TN_SINGLE_CHOICE",
                          question_level: childData.level || "THONG_THUONG",
                          rawHtml:
                            childData.question || childData.rawHtml || "",
                          choices: childData.choices || [],
                          images: childData.images || [],
                          doc_link: childData.doc_link || "",
                          video_link: childData.video || "",
                          explanation: childData.explanation || "",
                          dragDropOptions: childData.dragDropOptions || [],
                          video: childData.video || "",
                          plainText: childData.plainText || "",
                          created_at: new Date(),
                          parentId: normalizedQ.questionId, // ✅ SỬA: parentId = questionId của cluster
                          questionId: childData.questionId,
                        };
                        subSectionQuestions.push(childQuestion);
                      },
                    );
                    delete normalizedQ.clusterQuestions;
                    delete normalizedQ.needsChildRecreation;
                  }
                });
              }
            });
          }
          if (subSectionQuestions.length > 0) {
            subSections.push({
              id: `sub-${sp._id || `${sectionId}-${spIdx}`}`,
              name: sp.name || `Phần con ${spIdx + 1}`,
              questions: subSectionQuestions,
              createdAt: new Date().toISOString(),
              time: sp.time || 0,
              score: sp.score || 0,
              _id: sp._id,
              originalTitle: sp.title || sp.name,
            });
          }
        });
      }
    }

    return {
      id: sectionId,
      title: part.name || `Phần ${idx + 1}`,
      content: part.name || "",
      type: part.type || "MAC_DINH",
      groupName: part.groupName || "",
      questions: mainQuestions, // câu hỏi từ subpart đầu tiên (nếu chỉ có 1 subpart)
      subSections: subSections, // tất cả subparts (nếu có nhiều subparts)
    };
  };

  fetchRowsSubject() {
    if (this.props.subjects instanceof Array) {
      return this.props.subjects.map((obj, i) => {
        return (
          <option value={obj._id} key={obj._id.toString()}>
            {obj.name}
          </option>
        );
      });
    }
  }

  fetchTypeQuestions() {
    const typeQuestions = [{ _id: "MANUAL", name: "Thủ công" }];
    return typeQuestions.map((obj, i) => {
      return (
        <option value={obj._id} key={obj._id.toString()}>
          {obj.name}
        </option>
      );
    });
  }

  activeTab = (key) => {
    const updatedTabData = this.state.tabData.map((item) => ({
      ...item,
      active: item._id === key, // Set active true only for the matching tab
    }));
    this.setState({
      tabData: updatedTabData,
      statusTabCreate: false,
    });
  };

  activeTabGroup(keyTab, keyGroup, keySubject) {
    let tabData = this.state.tabData;

    for (let i = 0; i < tabData.length; i++) {
      if (tabData[i]._id === keyTab) {
        for (let j = 0; j < tabData[i].exam_section_group.length; j++) {
          if (tabData[i].exam_section_group[j]._id === keyGroup) {
            for (
              let k = 0;
              k < tabData[i].exam_section_group[j].subjects.length;
              k++
            ) {
              if (
                tabData[i].exam_section_group[j].subjects[k].subject_id ===
                keySubject
              ) {
                tabData[i].exam_section_group[j].subjects[k].active = true;
              } else {
                tabData[i].exam_section_group[j].subjects[k].active = false;
              }
            }
          }
        }
      } else {
        tabData[i].active = false;
      }
    }
    this.setState({
      tabData,
    });
  }

  actionCreateTab() {
    let tabData = this.state.tabData;
    tabData.map((item) => {
      item.active = false;
    });
    this.setState({
      tabData,
      statusTabCreate: true,
    });
  }

  async createNewTab() {
    let validate = await this.validateCreateNewTab();
    if (validate === false) {
      return;
    } else {
      if (this.state.examId === "") {
        await this.createNewExamApi();
      }
      await this.createNewSectionApi();
      let section = this.props.section;
      section.active = true;
      section.questions = [];
      let sectionId = section._id;

      let tabData = this.state.tabData;
      tabData.map((item) => {
        item.active = false;
      });
      tabData.push(section);
      this.activeTab(sectionId);
    }
  }

  validateCreateNewTab() {
    let validate = true;
    let message = "";
    if (this.state.examId === "") {
      if (this.state.name === "") {
        validate = false;
        message = "Tên đề thi không được để trống !";
      }

      if (this.state.subject_id === "") {
        validate = false;
        message = "Môn học không được để trống !";
      }
      if (this.state.classes === "") {
        validate = false;
        message = "Lớp học không được để trống !";
      }
    }

    if (this.state.newTabName === "") {
      validate = false;
      message = "Tên phần thi không được để trống !";
    }

    if (this.state.linkExam === "" || this.state.linkExam === undefined) {
      validate = false;
      message = "Link đề thi không được trống!";
    }

    if (validate === false) {
      notification.error({
        message: message,
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    }

    return validate;
  }

  getExamSectionGroupOrderMax() {
    let order = 0;
    let tabData = this.state.tabData;

    for (let i = 0; i < tabData.length; i++) {
      if (tabData[i]._id === this.state.examSectionId) {
        if (
          tabData[i].exam_section_group &&
          tabData[i].exam_section_group.length > 0
        ) {
          order =
            Math.max(
              ...tabData[i].exam_section_group.map(
                (o) => o.exam_section_group_order,
              ),
            ) + 1;
        }
      }
    }
    return order;
  }

  async createGroupQuestion(topicGroups, subject) {
    if (
      !topicGroups ||
      !Array.isArray(topicGroups) ||
      topicGroups.length === 0
    ) {
      console.error(
        "[ERROR] createGroupQuestion: topicGroups parameter is invalid or empty",
      );
      this.closeGroupModal();
      return;
    }
    const processedGroups = [];

    for (const groupData of topicGroups) {
      if (!groupData) {
        console.warn("[WARN] Skipping invalid group data");
        continue;
      }
      const groupName = (
        groupData.nameTopic ||
        groupData.name ||
        "Nhóm chủ đề mặc định"
      ).trim();
      if (
        !groupName ||
        groupName === "" ||
        groupName === "Nhóm chủ đề mặc định"
      ) {
        console.warn(
          "[WARN] Group name is empty or default, this might indicate data mismatch from modal",
        );
      }
      let processedSubjects = [];
      if (groupData.subjects && Array.isArray(groupData.subjects)) {
        processedSubjects = groupData.subjects.map((item, index) => {
          const subjectName = (
            item.nameSubject ||
            item.name ||
            `Môn ${index + 1}`
          ).trim();
          const subjectId =
            item.idSubject || item.id || this.generateObjectId();

          return {
            idSubject: subjectId,
            nameSubject: subjectName,
            questions: item.questions || [], // ✅ Khởi tạo questions rỗng cho nhóm mới
          };
        });
      } else {
        console.warn(
          "[THIẾU THÔNG TIN] Nhóm chủ đề thiếu danh sách môn học. Vui lòng thêm môn học.",
        );
        processedSubjects = [];
      }
      const updatedGroupData = {
        idTopic: groupData.idTopic || `topic-${Date.now()}`,
        nameTopic: groupName,
        type: groupData.type || "single", // ✅ THÊM: Preserve type từ modal
        maxTopics: groupData.maxTopics || 1, // ✅ THÊM: Preserve maxTopics từ modal
        subjects: processedSubjects,
      };

      processedGroups.push(updatedGroupData);
    }
    if (processedGroups.length === 0) {
      console.error("[ERROR] No valid groups to create");
      notification.error({
        message: "Không có nhóm chủ đề hợp lệ",
        description: "Vui lòng kiểm tra lại thông tin nhóm chủ đề",
        placement: "topRight",
      });
      this.closeGroupModal();
      return;
    }
    let targetSectionId = null;
    let isNewSection = false;

    if (this.state.actionGroup === "create") {
      const prevSections = Array.isArray(this.state.sections)
        ? this.state.sections
        : [];
      const nextIndex = prevSections.length + 1;

      const newSection = {
        id: `sec-${nextIndex}`,
        title: `Phần ${nextIndex} - Nhóm chủ đề`,
        type: "topic",
      };

      targetSectionId = newSection.id;
      isNewSection = true;
    } else {
      const existingGroupTopicSection = this.state.sections.find(
        (s) => s.type === "topic",
      );

      if (existingGroupTopicSection) {
        targetSectionId = existingGroupTopicSection.id;
      } else {
        console.error("❌ UPDATE MODE: Không tìm thấy section để update");
        this.closeGroupModal();
        return;
      }
    }
    this.setState(
      (prevState) => {
        const sections = [...prevState.sections];
        const tabData = [...prevState.tabData];
        if (isNewSection) {
          const newSection = {
            id: targetSectionId,
            title: `Phần ${sections.length + 1} - Nhóm chủ đề`,
            type: "topic",
          };
          sections.push(newSection);
          tabData.push({
            _id: targetSectionId,
            exam_section_name: newSection.title,
            exam_section_type: "NHOM_CHU_DE",
            exam_section_time: this.state.time || 90,
            total_score: 10,
            calculate_score_type: "total_point",
            questions: [],
            groupTopic: processedGroups, // ✅ SỬA: Gán trực tiếp cho section mới
            active: false,
            uploaded: false,
          });
        } else {
          const targetTabIndex = tabData.findIndex(
            (tab) => tab._id === targetSectionId,
          );
          if (targetTabIndex !== -1) {
            if (!tabData[targetTabIndex].groupTopic) {
              tabData[targetTabIndex].groupTopic = [];
            }
            tabData[targetTabIndex].groupTopic.push(...processedGroups);
          }
        }

        return {
          sections: this.recomputeSectionTitles(sections),
          tabData,
          selectedSectionId: targetSectionId,
          examSectionId: targetSectionId,
          statusTabCreate: false,
          showGroupModal: false,
          actionGroup: "create",
          groupDetail: null,
          itemGroupTabData: null,
          dataItemGroup: null,
        };
      },
      () => {
        this.syncSectionsWithTabData();

        notification.success({
          message: "Tạo phần thi nhóm chủ đề thành công",
          description: `Đã tạo ${processedGroups.length} nhóm chủ đề`,
          placement: "topRight",
        });
      },
    );
    this.closeGroupModal();
  }

  async updateGroupQuestion(topicGroups) {
    if (
      !topicGroups ||
      !Array.isArray(topicGroups) ||
      topicGroups.length === 0
    ) {
      console.error(
        "[ERROR] updateGroupQuestion: topicGroups parameter is invalid or empty",
      );
      this.closeGroupModal();
      return;
    }
    const processedGroups = [];

    for (const groupData of topicGroups) {
      if (!groupData) {
        console.warn("[WARN] Skipping invalid group data");
        continue;
      }
      const groupName = (
        groupData.nameTopic ||
        groupData.name ||
        "Nhóm chủ đề mặc định"
      ).trim();
      if (
        !groupName ||
        groupName === "" ||
        groupName === "Nhóm chủ đề mặc định"
      ) {
        console.warn(
          "[WARN] Group name is empty or default, this might indicate data mismatch from modal",
        );
      }
      let processedSubjects = [];
      if (groupData.subjects && Array.isArray(groupData.subjects)) {
        processedSubjects = groupData.subjects.map((item, index) => {
          const subjectName = (
            item.nameSubject ||
            item.name ||
            `Môn ${index + 1}`
          ).trim();
          const subjectId =
            item.idSubject || item.id || this.generateObjectId();

          return {
            idSubject: subjectId,
            nameSubject: subjectName,
            questions: item.questions || [], // ✅ Preserve existing questions
          };
        });
      } else {
        console.warn(
          "[THIẾU THÔNG TIN] Nhóm chủ đề thiếu danh sách môn học. Vui lòng thêm môn học.",
        );
        processedSubjects = [];
      }
      const updatedGroupData = {
        idTopic: groupData.idTopic || `topic-${Date.now()}`,
        nameTopic: groupName,
        type: groupData.type || "single", // ✅ THÊM: Preserve type từ modal
        maxTopics: groupData.maxTopics || 1, // ✅ THÊM: Preserve maxTopics từ modal
        subjects: processedSubjects,
      };

      processedGroups.push(updatedGroupData);
    }
    if (processedGroups.length === 0) {
      alert("Không có nhóm chủ đề hợp lệ nào để cập nhật.");
      this.closeGroupModal();
      return;
    }
    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (
            tab._id === prevState.selectedSectionId &&
            tab.exam_section_type === "NHOM_CHU_DE"
          ) {
            return {
              ...tab,
              groupTopic: processedGroups, // ✅ SỬA: Thay thế toàn bộ groupTopic với data mới
            };
          }
          return tab;
        });

        return { tabData: updatedTabData };
      },
      () => {
        this.syncSectionsWithTabData();
        this.saveTabDataToSession();
        this.forceUpdate();
      },
    );
    notification.success({
      message: "Cập nhật nhóm chủ đề thành công",
      placement: "topRight",
    });
    this.closeGroupModal();
  }

  async updateGroupQuestionLinkExamp(subject, data, subjectcId, examplink) {
    data.exam_section_group_id = data._id;
    data.subject_in_group = subject.map((item) => {
      if (item.id === subjectcId) {
        item.exam_link = examplink;
      }
      return {
        subject_name: item.subject_name,
        subject_id: item.subject_id,
        questions: [],
        exam_link: item.exam_link,
      };
    });
    await this.props.updateGroupQuestionf(data);
  }

  deleteTab(key) {
    let tabData = this.state.tabData;
    let statusTabCreate = false;
    let request = {
      exam_id: this.state.examId,
      exam_section_id: key,
    };
    this.props.deleteSection(request);
    const index = tabData.findIndex((item) => item._id === key);
    if (index !== -1) {
      tabData.splice(index, 1);
    }
    if (tabData.length > 0) {
      tabData[0].active = true;
    } else {
      statusTabCreate = true;
    }
    this.setState({
      tabData,
      statusTabCreate,
    });
  }

  renderTabGroup(group, keyTab) {
    return (
      <React.Fragment key={keyTab + group._id}>
        <ul className="nav nav-tabs align-items-center justify-content-center mt-2">
          <li
            className="text-center highlight title-block m-0 d-flex"
            style={{ left: "10px", position: "absolute" }}
          >
            {group.exam_section_group_name}
          </li>
          {group?.subjects?.map((subject, indexSubject) => (
            <li key={subject.subject_id || indexSubject}>
              {" "}
              {/* Add unique key here */}
              <a
                onClick={() =>
                  this.activeTabGroup(keyTab, group._id, subject.subject_id)
                }
                className={`btn no-border ${subject.active ? "btn-info" : "btn-light"
                  }`}
                data-toggle="tab"
                href={`#${keyTab + group._id + subject.subject_id}`}
              >
                {subject.subject_name}
              </a>
            </li>
          ))}
          <li className="d-flex">
            <div data-toggle="tooltip" title="Chỉnh sửa nhóm câu hỏi">
              <a
                className="btn no-border"
                data-toggle="modal"
                data-target="#createGroup"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
                onClick={() => this.setUpdateGroup(keyTab, group._id, group)}
              >
                <img src="/assets/img/icon-edit.svg" alt="" />
              </a>
            </div>

            <div data-toggle="tooltip" title="Xoá nhóm câu hỏi">
              <a
                className="btn no-border"
                data-toggle="modal"
                data-target="#delete-group-question"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
                onClick={() => this.setDeleteGroup(keyTab, group._id, group)}
              >
                <img src="/assets/img/icon-delete.svg" alt="" />
              </a>
            </div>
          </li>
        </ul>
      </React.Fragment>
    );
  }

  setSelectedId(examSectionId, examSectionGroupId, examSectionSubjectId) {
    let questionNo = this.getQuestionNoNew(
      examSectionId,
      examSectionGroupId,
      examSectionSubjectId,
    );
    this.setState(
      {
        examSectionId,
        examSectionGroupId,
        examSectionSubjectId,
        questionNo,
        actionQuestion: "create",
        currentQuestionvalue: null, // Reset currentQuestionvalue khi tạo mới
      },
      () => { },
    );
  }

  actionCreateGroup(examSectionId, examSectionGroupId, examSectionSubjectId) {
    this.setState({
      examSectionId,
      examSectionGroupId,
      examSectionSubjectId,
      actionGroup: "create",
    });
  }

  setUpdateGroup(examSectionId, examSectionGroupId, groupDetail) {
    this.setState({
      examSectionId,
      examSectionGroupId,
      groupDetail,
      actionGroup: "update",
    });
  }

  setDeleteGroup(examSectionId, examSectionGroupId, groupDetail) {
    this.setState({
      examSectionId,
      examSectionGroupId,
      groupDetail,
    });
  }

  countTotalQuestion(tab) {
    let total = 0;
    if (!tab || typeof tab !== "object") {
      console.warn("[WARN] countTotalQuestion: Invalid tab object");
      return 0;
    }

    const sectionType = tab.exam_section_type || "MAC_DINH";

    if (sectionType === "MAC_DINH") {
      if (tab.questions && Array.isArray(tab.questions)) {
        total = tab.questions.filter(
          (q) => q.type !== "CLUSTER" && q.type !== "cluster",
        ).length;
      }
      if (tab.subSections && Array.isArray(tab.subSections)) {
        tab.subSections.forEach((subSection) => {
          if (
            subSection &&
            subSection.questions &&
            Array.isArray(subSection.questions)
          ) {
            total += subSection.questions.filter(
              (q) => q.type !== "CLUSTER" && q.type !== "cluster",
            ).length;
          }
        });
      }
    } else if (
      sectionType === "NHOM_CHU_DE" ||
      sectionType === "GROUP_SUBJECT"
    ) {
      if (tab.exam_section_group && Array.isArray(tab.exam_section_group)) {
        tab.exam_section_group.forEach((group) => {
          if (group && group.subjects && Array.isArray(group.subjects)) {
            group.subjects.forEach((subject) => {
              if (
                subject &&
                subject.questions &&
                Array.isArray(subject.questions)
              ) {
                total += subject.questions.filter((q) => {
                  if (!q) return false; // Loại bỏ câu hỏi null/undefined
                  if (q.number === 0 || q.question_no === 0) return false;
                  if (!q.type) return true;

                  const questionType = String(q.type).toUpperCase();
                  return questionType !== "CLUSTER";
                }).length;
              }
            });
          }
        });
      }
      if (tab.groupTopic && Array.isArray(tab.groupTopic)) {
        tab.groupTopic.forEach((group) => {
          if (group && group.subjects && Array.isArray(group.subjects)) {
            group.subjects.forEach((subject) => {
              if (
                subject &&
                subject.questions &&
                Array.isArray(subject.questions)
              ) {
                total += subject.questions.filter((q) => {
                  if (!q) return false; // Loại bỏ câu hỏi null/undefined
                  if (q.number === 0 || q.question_no === 0) return false;
                  if (!q.type) return true;

                  const questionType = String(q.type).toUpperCase();
                  return questionType !== "CLUSTER";
                }).length;
              }
            });
          }
        });
      }
    } else {
      console.warn(
        "[WARN] countTotalQuestion: Unknown section type:",
        sectionType,
      );
      total = 0;
    }
    return total;
  }

  getNewIndexQuestion() {
    let vm = this;
    let keyTab = null;
    let idQuestion = null;
    let resp = {};
    for (let i = 0; i < this.state.tabData.length; i++) {
      if (
        this.state.tabData[i].active === true &&
        this.state.tabData[i].type === "MANUAL"
      ) {
        keyTab = this.state.tabData[i].key;
        idQuestion = this.state.tabData[i].listAnswer.length;
        resp = { keyTab, idQuestion };
        break;
      } else if (
        this.state.tabData[i].active === true &&
        this.state.tabData[i].type === "GROUP"
      ) {
        keyTab = this.state.tabData[i].key;
        for (let j = 0; j < this.state.tabData[i].listSubject.length; j++) {
          if (this.state.tabData[i].listSubject[j].active === true) {
            idQuestion =
              this.state.tabData[i].listSubject[j].listQuestion.length;
            break;
          }
        }
        resp = { keyTab, idQuestion };
        break;
      } else {
        keyTab = 0;
        idQuestion = 0;
        resp = { keyTab, idQuestion };
        break;
      }
    }

    return resp;
  }
  getQuestionNoForTopicGroupSubject = (subjectId) => {
    try {
      const currentTab = this.state.tabData.find(
        (tab) => tab._id === this.state.selectedSectionId,
      );
      if (!currentTab || currentTab.exam_section_type !== "NHOM_CHU_DE") {
        return 1;
      }
      let targetSubject = null;
      let targetGroup = null;

      if (currentTab.groupTopic && Array.isArray(currentTab.groupTopic)) {
        for (const group of currentTab.groupTopic) {
          if (group.subjects && Array.isArray(group.subjects)) {
            const subject = group.subjects.find(
              (s) => s.idSubject === subjectId,
            );
            if (subject) {
              targetSubject = subject;
              targetGroup = group;
              break;
            }
          }
        }
      }

      if (!targetSubject) {
        return 1;
      }
      let maxNumber = 0;
      const subjectQuestions = targetSubject.questions || [];

      subjectQuestions.forEach((q) => {
        if (q.type !== "cluster" && q.type !== "Cluster") {
          const no = q.number || q.question_no || 0;
          if (no > maxNumber) {
            maxNumber = no;
          }
        }
        if (q.children && Array.isArray(q.children)) {
          q.children.forEach((child) => {
            const childNo = child.number || child.question_no || 0;
            if (childNo > maxNumber) {
              maxNumber = childNo;
            }
          });
        }
      });
      const nextQuestionNo =
        maxNumber === 0
          ? this.getStartingQuestionNumberForSubject(targetSubject)
          : maxNumber + 1;
      return nextQuestionNo;
    } catch (error) {
      console.error("❌ Error in getQuestionNoForTopicGroupSubject:", error);
      return 1;
    }
  };
  getStartingQuestionNumberForSubject = (subject) => {
    try {
      const questions = subject.questions || [];
      if (questions.length === 0) {
        return 1;
      }
      const questionsWithNumber = questions.filter(
        (q) =>
          q.type !== "cluster" &&
          q.type !== "Cluster" &&
          (q.number > 0 || q.question_no > 0),
      );

      if (questionsWithNumber.length === 0) {
        return 1;
      }
      let minNumber = Number.MAX_SAFE_INTEGER;
      questionsWithNumber.forEach((question) => {
        const currentNumber = question.number || question.question_no || 0;
        if (currentNumber > 0 && currentNumber < minNumber) {
          minNumber = currentNumber;
        }
      });

      const startingNumber =
        minNumber === Number.MAX_SAFE_INTEGER ? 1 : minNumber;

      return startingNumber;
    } catch (error) {
      console.error("❌ Error in getStartingQuestionNumberForSubject:", error);
      return 1;
    }
  };
  getStartingQuestionNumberForGroup = (groupIdx, subjectIdx) => {
    try {
      const currentTab = this.state.tabData.find(
        (tab) => tab._id === this.state.selectedSectionId,
      );
      if (!currentTab || currentTab.exam_section_type !== "NHOM_CHU_DE") {
        return 1;
      }

      const groups = currentTab.groupTopic || [];

      if (groupIdx >= groups.length) {
        console.warn(`[WARN] groupIdx out of range:`, {
          groupIdx,
          groupsLength: groups.length,
        });
        return 1;
      }

      const group = groups[groupIdx];
      const subjects = group.subjects || [];

      if (subjectIdx >= subjects.length) {
        console.warn(`[WARN] subjectIdx out of range:`, {
          subjectIdx,
          subjectsLength: subjects.length,
        });
        return 1;
      }

      const subject = subjects[subjectIdx];

      const startingNumber = this.getStartingQuestionNumberForSubject(subject);

      return startingNumber;
    } catch (error) {
      console.error("❌ Error in getStartingQuestionNumberForGroup:", error);
      return 1;
    }
  };

  getQuestionNoNew(examSectionId, examSectionGroupId, examSectionSubjectId) {
    try {
      let tabNew = this.state.tabData;
      if (tabNew === undefined || tabNew.length === 0) {
        return 1;
      }

      for (let i = 0; i < tabNew.length; i++) {
        if (
          tabNew[i]._id === examSectionId &&
          tabNew[i].exam_section_type === "MAC_DINH"
        ) {
          let allQuestions = [];
          if (Array.isArray(tabNew[i].questions)) {
            allQuestions = [...allQuestions, ...tabNew[i].questions];
          }
          let maxQuestionNo = 0;
          allQuestions.forEach((q) => {
            if (q.type !== "cluster" && q.type !== "Cluster") {
              const no = q.number || parseInt(q.question_no, 10) || 0;
              if (no > maxQuestionNo) {
                maxQuestionNo = no;
              }
            }
            if (q.children && Array.isArray(q.children)) {
              q.children.forEach((child) => {
                const childNo =
                  child.number || parseInt(child.question_no, 10) || 0;
                if (childNo > maxQuestionNo) {
                  maxQuestionNo = childNo;
                }
              });
            }
          });
          const nextQuestionNo = Math.max(maxQuestionNo + 1, 1);
          return nextQuestionNo;
        } else if (
          tabNew[i]._id === examSectionId &&
          tabNew[i].exam_section_type === "GROUP_SUBJECT"
        ) {
          let allQuestions = [];

          if (
            tabNew[i].exam_section_group &&
            Array.isArray(tabNew[i].exam_section_group)
          ) {
            tabNew[i].exam_section_group.forEach((group) => {
              if (group.subjects && Array.isArray(group.subjects)) {
                group.subjects.forEach((subject) => {
                  if (subject.questions && Array.isArray(subject.questions)) {
                    allQuestions = [...allQuestions, ...subject.questions];
                  }
                });
              }
            });
          }
          let maxQuestionNo = 0;
          allQuestions.forEach((q) => {
            if (q.type !== "cluster" && q.type !== "Cluster") {
              const no = q.number || parseInt(q.question_no, 10) || 0;
              if (no > maxQuestionNo) {
                maxQuestionNo = no;
              }
            }
            if (q.children && Array.isArray(q.children)) {
              q.children.forEach((child) => {
                const childNo =
                  child.number || parseInt(child.question_no, 10) || 0;
                if (childNo > maxQuestionNo) {
                  maxQuestionNo = childNo;
                }
              });
            }
          });

          const nextQuestionNo = Math.max(maxQuestionNo + 1, 1);
          return nextQuestionNo;
        } else if (
          tabNew[i]._id === examSectionId &&
          tabNew[i].exam_section_type === "NHOM_CHU_DE"
        ) {
          let allQuestions = [];

          if (tabNew[i].groupTopic && Array.isArray(tabNew[i].groupTopic)) {
            tabNew[i].groupTopic.forEach((group) => {
              if (group.subjects && Array.isArray(group.subjects)) {
                group.subjects.forEach((subject) => {
                  if (subject.questions && Array.isArray(subject.questions)) {
                    allQuestions = [...allQuestions, ...subject.questions];
                  }
                });
              }
            });
          }
          let maxQuestionNo = 0;
          allQuestions.forEach((q) => {
            if (q.type !== "cluster" && q.type !== "Cluster") {
              const no = q.number || parseInt(q.question_no, 10) || 0;
              if (no > maxQuestionNo) {
                maxQuestionNo = no;
              }
            }
            if (q.children && Array.isArray(q.children)) {
              q.children.forEach((child) => {
                const childNo =
                  child.number || parseInt(child.question_no, 10) || 0;
                if (childNo > maxQuestionNo) {
                  maxQuestionNo = childNo;
                }
              });
            }
          });

          const nextQuestionNo = Math.max(maxQuestionNo + 1, 1);
          return nextQuestionNo;
        }
      }
    } catch (error) {
      return 1;
    }

    return 1;
  }

  addManualQuestionToParts = (questionResult) => {
    if (!questionResult.success || !questionResult.questionData) {
      return false;
    }

    const { questionData, partStructure } = questionResult;
    this.setState((prevState) => {
      let updatedParts = [...(prevState.parts || [])];
      let targetPart = updatedParts.find(
        (part) => part.part_name === "Phần thủ công",
      );

      if (!targetPart) {
        targetPart = {
          ...partStructure,
          part_no: updatedParts.length + 1,
        };
        updatedParts.push(targetPart);
      } else {
        if (
          targetPart.subpart &&
          targetPart.subpart[0] &&
          targetPart.subpart[0].children &&
          targetPart.subpart[0].children[0]
        ) {
          targetPart.subpart[0].children[0].questions.push(questionData);
        }
      }

      return { parts: updatedParts };
    });

    return true;
  };
  syncSectionsWithTabData = () => {
    try {
      const tabData = Array.isArray(this.state.tabData)
        ? this.state.tabData
        : [];
      const sections = tabData.map((tab, index) => {
        let questions = [];
        if (tab.exam_section_type === "NHOM_CHU_DE") {
          (tab.groupTopic || []).forEach((group) => {
            (group.subjects || []).forEach((subject) => {
              questions = questions.concat(subject.questions || []);
            });
          });
        } else if (tab.exam_section_type === "GROUP_SUBJECT") {
          (tab.exam_section_group || []).forEach((group) => {
            (group.subjects || []).forEach((subject) => {
              questions = questions.concat(subject.questions || []);
            });
          });
        } else {
          questions = tab.questions || [];
        }
        return {
          id: tab._id || tab.id || `sec-${index + 1}`,
          title: tab.exam_section_name || `Phần ${index + 1}`,
          type:
            tab.exam_section_type === "NHOM_CHU_DE" ||
              tab.exam_section_type === "GROUP_SUBJECT"
              ? "topic"
              : "MAC_DINH",
          questions,
        };
      });

      let selectedSectionId = this.state.selectedSectionId;
      if (!selectedSectionId && sections.length > 0) {
        selectedSectionId = sections[0].id;
      }

      this.setState({
        sections,
        selectedSectionId,
        examSectionId: selectedSectionId,
      });
    } catch (e) {
      console.warn("syncSectionsWithTabData(edit) failed:", e);
    }
  };
  getQuestionsForCurrentSelection = () => {
    try {
      const { selectedSectionId, selectedSubject, tabData, sections } =
        this.state;
      const tds = Array.isArray(tabData) ? tabData : [];
      const secs = Array.isArray(sections) ? sections : [];
      let currentSectionId = selectedSectionId;
      if (!currentSectionId && tds.length > 0)
        currentSectionId = tds[0]._id || tds[0].id;
      if (!currentSectionId && secs.length > 0) currentSectionId = secs[0].id;
      if (!currentSectionId) return [];

      let allQuestions = [];
      if (tds.length > 0) {
        const tab = tds.find((t) => (t._id || t.id) === currentSectionId);
        if (tab) {
          if (
            tab.exam_section_type === "MAC_DINH" ||
            tab.exam_section_type === "NHOM_CHU_DE"
          ) {
            allQuestions = Array.isArray(tab.questions) ? tab.questions : [];
            if (selectedSubject && selectedSubject.id) {
              allQuestions = allQuestions.filter(
                (q) =>
                  q.subject_id === selectedSubject.id ||
                  q.subjectId === selectedSubject.id,
              );
            }
          } else if (tab.exam_section_type === "GROUP_SUBJECT") {
            for (const g of tab.exam_section_group || []) {
              for (const s of g.subjects || []) {
                if (
                  !selectedSubject ||
                  !selectedSubject.id ||
                  s.subject_id === selectedSubject.id
                ) {
                  allQuestions = Array.isArray(s.questions) ? s.questions : [];
                  break;
                }
              }
            }
          }
        }
      }
      if (allQuestions.length === 0 && secs.length > 0) {
        const sec = secs.find((s) => s.id === currentSectionId) || secs[0];
        if (sec) {
          allQuestions = Array.isArray(sec.questions) ? sec.questions : [];
          if (selectedSubject && selectedSubject.id) {
            allQuestions = allQuestions.filter(
              (q) =>
                q.subjectId === selectedSubject.id ||
                q.subject_id === selectedSubject.id,
            );
          }
        }
      }
      const normalizedQuestions = allQuestions.map((q) => {
        if (q.question) {
          return {
            ...q.question,
            _id: q.question._id || q.question.questionId,
            question_id: q.question.questionId || q.question._id,
            question_no: q.number || q.question_no || 1,
            parentId: q.question.parentId, // ✅ QUAN TRỌNG: Lấy từ q.question.parentId
            type: q.question.type || "",
            rawHtml: q.question.rawHtml || "",
            correctAnswers: q.question.correctAnswers || [],
            explanation: q.question.explanation || "",
            level: q.question.level || "",
            plainText: q.question.plainText || "",
            choices: q.question.choices || [],
            dragDropOptions: q.question.dragDropOptions || [],
            leadText: q.question.leadText || "",
            leadHtml: q.question.leadHtml || "",
            subject: q.question.subject,
            cluster: q.question.cluster || [],
            video: q.question.video || "",
            deleted_at: q.question.deleted_at,
            createdAt: q.question.createdAt,
            updatedAt: q.question.updatedAt,
          };
        } else {
          return {
            ...q,
            _id: q._id || q.question_id,
            question_id: q.question_id || q._id,
            parentId: (q.parentId ?? q.parent_id) || null,
          };
        }
      });

      return normalizedQuestions;
    } catch (e) {
      console.warn("getQuestionsForCurrentSelection(edit) failed:", e);
      return [];
    }
  };

  fetchCategoryRows() {
    const { examCategories } = this.props; // từ Redux
    if (!examCategories || examCategories.length === 0) return null;

    return examCategories
      .filter((item) => !item.hidden) // ✅ chỉ lấy item hidden = false
      .map((item) => (
        <option key={item._id} value={item._id}>
          {item.name}
        </option>
      ));
  }

  fetchLevelRows() {
    const { examTestCategories } = this.props; // từ Redux
    if (!examTestCategories || examTestCategories.length === 0) return null;
    return examTestCategories.map((item) => (
      <option key={item._id} value={item.name}>
        {item.name}
      </option>
    ));
  }
  handleChangeCompetition = async (e) => {
    const value = e.target.value; // đây chỉ là _id
    const selectedExam = this.props.examCategories.find(
      (item) => item._id === value,
    );

    await this.props.listGift({
      status: true,
      keyword: "",
      competition_part_id: value,
      sort_key: "",
      sort_value: "",
      limit: 20,
      page: 1,
    });
    this.setState({
      typeExam: value,
      examTypeId: "",
      linkExam: "",
      linkAnswer: "",
    });

    if (value) {
      await this.props.showExamCategory(value);
    }
    if (selectedExam && selectedExam.config && selectedExam.config[0]) {
      this.state.statusExam = selectedExam.config[0].timePerPart;
    }
  };

  async createQuestionApi(request) {
    const now = new Date().toISOString();
    const id = request._id || this.generateObjectId(); // ✅ SỬA: Sử dụng hàm tạo ObjectId chuẩn
    return {
      _id: id,
      questionId: id, // ✅ THÊM: Đảm bảo questionId luôn có
      question_id: id,
      created_at: now,
      updated_at: now, // ✅ THÊM: Đảm bảo updated_at
      correctAnswers: request.correctAnswers,
      type: request.type,
      question_no: request.question_no,
      images: request.images,
      answer: request.answer,
      answer_content: request.answer_content,
      doc_link: request.linkDoc,
      video_link: request.linkVideo,
    };
  }

  async createNewExamApi() {
    setLoader(true);
    let data = {
      name: this.state.name,
      group: this.state.group,
      classes: this.state.classes,
      creating_type: this.state.type_question,
      subject_id: this.state.subject_id, // "doc_link": "http://google.com/link_tai_lieu",
      exam_doc_link: this.state.linkExam,
      exam_doc_link2: this.state.linkExam2,
      answer_doc_link: this.state.linkAnswer,
      time: this.state.time,
      is_redo: this.state.is_redo,
      classroom_id: null,
      is_pay_fee: true,
      type: this.state.typeExam,
      point_true_false:
        this.state.pointTrueFalse === true &&
          this.state.typeExam === this.state.TN
          ? {
            1: this.state.pointTrueFalse1,
            2: this.state.pointTrueFalse2,
            3: this.state.pointTrueFalse3,
            4: this.state.pointTrueFalse4,
          }
          : {},
    };
    try {
      const res = await this.props.createExamWord(data);
      const examId =
        (res && res.data && res.data.data && res.data.data._id) ||
        (this.props.exam && this.props.exam._id);
      if (!examId) throw new Error("Create exam failed");
      this.setState({ examId });
    } catch (e) {
      setLoader(false);
      throw e;
    }
    setLoader(false);
  }
  normalizeParts = (partsFromApi = []) => {
    return partsFromApi.map((part) => ({
      ...part,
      subpart: (part.subpart || []).map((sp) => ({
        ...sp,
        children: (sp.children || []).map((child) => ({
          ...child,
          questions: (child.questions || []).map((q) => {
            const question = q.question || {};
            return {
              ...q,
              question: {
                ...question,
                content: question.plainText || question.content || "",
              },
            };
          }),
        })),
      })),
    }));
  };

  getPartTotalQuestions = (part) => {
    try {
      if (!part) return 0;
      if (typeof part.totalquestions === "number") return part.totalquestions;
      let total = 0;
      if (Array.isArray(part.subpart)) {
        part.subpart.forEach((sp) => {
          if (Array.isArray(sp.children)) {
            sp.children.forEach((child) => {
              if (Array.isArray(child.questions)) {
                total += child.questions.length;
              }
            });
          }
        });
      }
      return total;
    } catch (e) {
      return 0;
    }
  };

  getTotalTimeAcrossParts = () => {
    try {
      const parts = Array.isArray(this.state.parts) ? this.state.parts : [];
      return parts.reduce((sum, p) => sum + (Number(p?.time) || 0), 0);
    } catch (e) {
      return 0;
    }
  };

  ensureDefaultSection = () => {
    if (!this.state.tabData || this.state.tabData.length === 0) {
      this.initializeDefaultTabData();
      return true; // Đã tạo section mới
    }
    return false; // Đã có section sẵn
  };
  initializeDefaultTabData = () => {
    if (
      (!this.state.tabData || this.state.tabData.length === 0) &&
      (!Array.isArray(this.state.sections) ||
        this.state.sections.length === 0) &&
      this.state.isUploaded
    ) {
      const defaultSection = {
        _id: "default-section",
        exam_section_name: "Phần mặc định",
        exam_section_type: "MAC_DINH",
        exam_section_time: this.state.time || 90,
        total_score: 0,
        calculate_score_type: "total_score",
        questions: [],
        active: true,
      };

      this.setState({
        tabData: [defaultSection],
        examSectionId: defaultSection._id,
        statusTabCreate: false,
      });
    }
  };
  validateAndFixPartsPayload = (parts) => {
    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      return this.createDefaultParts();
    }

    const fixedParts = parts.map((part, idx) => {
      try {
        const fixedPart = {
          id: part.id || part._id || `part-${idx}`,
          name: part.name || part.exam_section_name || `Phần ${idx + 1}`,
          score: Number(part.score || part.total_score || 0),
          time: Number(
            part.time || part.exam_section_time || this.state.time || 0,
          ),
          questions_score: part.questions_score || 0,
          totalquestions: this.countQuestionsInPart(part),
          type: part.type || part.exam_section_type || "MAC_DINH",
          subpart: [],
        };
        if (part.subpart && Array.isArray(part.subpart)) {
          fixedPart.subpart = part.subpart.map((subpart, subIdx) => {
            const fixedSubpart = {
              name: subpart.name || `${idx + 1}.${subIdx + 1} Phần con`,
              score: Number(subpart.score || 0),
              time: Number(subpart.time || 0),
              maxSubject: subpart.maxSubject || 1,
              isMain: subpart.isMain, // ✅ PRESERVE isMain
              children: [],
            };
            if (subpart.children && Array.isArray(subpart.children)) {
              fixedSubpart.children = subpart.children.map(
                (child, childIdx) => {
                  const fixedChild = {
                    name: child.name || `Children ${childIdx + 1}`,
                    questions: [],
                  };
                  if (child.questions && Array.isArray(child.questions)) {
                    fixedChild.questions = child.questions
                      .filter((q) => q != null) // Remove null/undefined questions
                      .map((question, qIdx) => {
                        return this.validateAndFixQuestion(question, qIdx + 1);
                      });
                  }

                  return fixedChild;
                },
              );
            }
            if (fixedSubpart.children.length === 0) {
              fixedSubpart.children.push({
                name: fixedSubpart.name, // ✅ SỬA: Thay "Children 1" bằng tên phần con
                questions: [],
              });
            }

            return fixedSubpart;
          });
        }
        if (fixedPart.subpart.length === 0) {
          fixedPart.subpart.push({
            name: fixedPart.name,
            score: fixedPart.score,
            time: fixedPart.time,
            maxSubject: fixedPart.maxSubject || 1,
            children: [
              {
                name: fixedPart.name, // ✅ SỬA: Thay "Children 1" bằng tên phần
                questions: [],
              },
            ],
          });
        }
        fixedPart.totalquestions = this.countQuestionsInPart(fixedPart);

        return fixedPart;
      } catch (partError) {
        return {
          id: `error-part-${idx}`,
          name: `Phần ${idx + 1}`,
          score: 0,
          time: this.state.time || 0,
          totalquestions: 0,
          type: "MAC_DINH",
          subpart: [
            {
              name: `Phần ${idx + 1}`,
              score: 0,
              time: this.state.time || 0,
              children: [
                {
                  name: `Phần ${idx + 1}`, // ✅ SỬA: Thay "Children 1" bằng tên phần
                  questions: [],
                },
              ],
            },
          ],
        };
      }
    });
    const validParts = fixedParts.filter((part) => part != null);

    if (validParts.length === 0) {
      return this.createDefaultParts();
    }
    return validParts;
  };
  validateUIState = () => {
    try {
      if (!this.state.tabData || !Array.isArray(this.state.tabData)) {
        return false;
      }
      if (this.state.tabData.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };
  processQuestionsForAPI = (questions) => {
    try {
      if (!Array.isArray(questions)) {
        console.warn("[PROCESS] processQuestionsForAPI: input is not an array");
        return [];
      }

      console.log(
        "[PROCESS] ========== START processQuestionsForAPI ==========",
      );
      console.log("[PROCESS] Input questions:", {
        totalQuestions: questions.length,
        questionTypes: questions.map((q) => ({
          id: q._id || q.questionId,
          type: q.type,
          parentId: q.parentId,
          hasClusterQuestions: !!q.clusterQuestions,
        })),
      });

      // Count clusters and children
      const clusters = questions.filter(
        (q) => q.type === "cluster" && !q.parentId,
      );
      const children = questions.filter((q) => q.parentId);
      console.log("[PROCESS] Question breakdown:", {
        totalQuestions: questions.length,
        clusters: clusters.length,
        children: children.length,
        clusterIds: clusters.map((c) => ({
          id: c._id || c.questionId,
          clusterQuestions: c.clusterQuestions?.length || 0,
        })),
        childParentIds: children.map((c) => ({
          childId: c._id,
          parentId: c.parentId,
          type: c.type,
        })),
      });

      const processedQuestions = [];
      const questionIdMapping = new Map();
      const normalizeQuestionShape = (q) => {
        if (q && q.question) {
          const merged = { ...q.question };
          [
            "number",
            "question_no",
            "isTestQuestion",
            "parentId",
            "parent_id",
            "questionId",
            "question_id",
            "_id",
          ].forEach((field) => {
            if (q[field] !== undefined && merged[field] === undefined) {
              merged[field] = q[field];
            }
          });
          if (merged.parentId === undefined && merged.parent_id !== undefined) {
            merged.parentId = merged.parent_id;
          }
          return merged;
        }
        const plain = { ...q };
        if (plain.parentId === undefined && plain.parent_id !== undefined) {
          plain.parentId = plain.parent_id;
        }
        return plain;
      };

      const normalizedQuestions = questions.map(normalizeQuestionShape);

      console.log("[PROCESS] After normalization:", {
        total: normalizedQuestions.length,
        clusters: normalizedQuestions.filter(
          (q) => q.type === "cluster" && !q.parentId,
        ).length,
        children: normalizedQuestions.filter((q) => q.parentId).length,
      });

      normalizedQuestions.forEach((question) => {
        const currentId =
          question._id || question.question_id || question.questionId;
        const normalizedId =
          question.questionId || question._id || question.question_id;

        if (currentId && normalizedId) {
          questionIdMapping.set(currentId, normalizedId);
        }
      });

      normalizedQuestions.forEach((question, idx) => {
        try {
          // ✅ UPDATED: Process ALL questions including children
          // Children will be formatted with parentId field to indicate their relationship
          console.log(`[PROCESS] Processing question ${idx}:`, {
            id: question._id || question.questionId,
            type: question.type,
            isCluster: question.type === "cluster",
            hasParentId: !!question.parentId,
            parentId: question.parentId || "none",
          });

          // ✅ FIX: Removed duplicate flatten logic for clusters
          // convertQuestionToAPIFormat already handles cluster questions correctly
          // by embedding child questions in the clusterQuestions field
          const apiQuestion = this.convertQuestionToAPIFormat(
            question,
            normalizedQuestions,
          );

          console.log(`[PROCESS] After conversion:`, {
            id: question._id || question.questionId,
            hasApiQuestion: !!apiQuestion,
            apiQuestionType: apiQuestion?.question?.type,
            hasClusterQuestions: !!apiQuestion?.question?.clusterQuestions,
            clusterQuestionsCount:
              apiQuestion?.question?.clusterQuestions?.length || 0,
            hasClusterField: !!apiQuestion?.question?.cluster,
            clusterFieldCount: apiQuestion?.question?.cluster?.length || 0,
            clusterFieldIds: apiQuestion?.question?.cluster || [],
            isChildQuestion: !!apiQuestion?.question?.parentId,
            parentId: apiQuestion?.question?.parentId || "none",
          });

          if (apiQuestion === null) {
            console.log(`[PROCESS] apiQuestion is null, skipping`);
            return; // Skip questions trả về null
          }

          if (apiQuestion) {
            // ✅ KHÔNG override _id và number - convertQuestionToAPIFormat đã đặt đúng từ API
            // apiQuestion._id và apiQuestion.number đã được set bởi convertQuestionToAPIFormat
            processedQuestions.push(apiQuestion);
          }
        } catch (questionError) {
          console.error(
            "[ERROR] processQuestionsForAPI - question error:",
            questionError,
          );
        }
      });

      console.log("[PROCESS] ========== END processQuestionsForAPI ==========");
      console.log("[PROCESS] Finished processQuestionsForAPI:", {
        inputCount: questions.length,
        outputCount: processedQuestions.length,
        types: processedQuestions.map((q) => q.question?.type || q.type),
        clustersInOutput: processedQuestions.filter(
          (q) => q.question?.type === "cluster",
        ).length,
        childQuestionsInOutput: processedQuestions.filter(
          (q) => q.question?.parentId,
        ).length,
        clustersWithChildren: processedQuestions
          .filter(
            (q) =>
              q.question?.type === "cluster" &&
              q.question?.clusterQuestions?.length > 0,
          )
          .map((q) => ({
            id: q.question?.questionId,
            childCount: q.question?.clusterQuestions?.length,
            clusterIds: q.question?.cluster?.length || 0,
            clusterField: q.question?.cluster || [],
          })),
      });

      return processedQuestions;
    } catch (error) {
      console.error("[ERROR] processQuestionsForAPI failed:", error);
      return [];
    }
  };
  validateClusterPayload = (parts) => {
    parts.forEach((part, partIdx) => {
      (part.subpart || []).forEach((subpart, subIdx) => {
        (subpart.children || []).forEach((child, childIdx) => {
          let questions = child.questions || [];
          const clusters = questions.filter(
            (q) => q.question?.type === "cluster",
          );
          const childQuestionsWithParent = questions.filter(
            (q) => q.question?.parentId && q.question?.type !== "cluster",
          );
          clusters.forEach((cluster) => {
            const childCount = cluster.question?.clusterQuestions?.length || 0;
            if (childCount === 0) {
            } else {
            }
          });
        });
      });
    });

    return parts;
  };

  buildPartsPayload = () => {
    try {
      if (!this.validateUIState()) {
        return this.createDefaultParts();
      }
      let tabData = this.state.tabData || [];

      if (tabData.length === 0) {
        return this.createDefaultParts();
      }

      const parts = tabData.map((tab, idx) => {
        try {
          const totalQuestions = this.countTotalQuestion(tab);
          const part = {
            name: tab.exam_section_name || `Phần ${idx + 1}`,
            time: tab.exam_section_time || tab.time || this.state.time || 0,
            score: tab.total_score || tab.score || 0,
            questions_score: tab.questions_score || 0,
            maxGroup: tab.maxGroup || 1,
            type:
              tab.exam_section_type === "NHOM_CHU_DE"
                ? "NHOM_CHU_DE"
                : tab.exam_section_type || "MAC_DINH",
            totalquestions: totalQuestions,
            _id: tab._id || tab.id || `part-${idx}`,
            subpart: [],
          };

          if (tab.exam_section_type === "GROUP_SUBJECT") {
            (tab.exam_section_group || []).forEach((group, j) => {
              const subpart = {
                name: group.name || group.group_name || `Nhóm ${j + 1}`,
                score: group.score || 0,
                time: group.time || 0,
                isMain: group.isMain || false, // ✅ THÊM: isMain
                maxSubject: group.maxSubject || 1, // ✅ THÊM: maxSubject
                children: [],
              };

              (group.subjects || []).forEach((subject, k) => {
                const subjectQuestions = subject.questions || [];
                if (subjectQuestions.length > 0) {
                  subpart.children.push({
                    name:
                      subject.name || subject.subject_name || `Môn ${k + 1}`,
                    questions: this.processQuestionsForAPI(subjectQuestions),
                  });
                }
              });

              if (subpart.children.length === 0) {
                subpart.children.push({
                  name: group.name || group.group_name || `Nhóm ${j + 1}`,
                  questions: [],
                });
              }

              part.subpart.push(subpart);
            });

            if (part.subpart.length === 0) {
              part.subpart.push({
                name: tab.exam_section_name || `Phần ${idx + 1}`,
                score: 0,
                time: 0,
                isMain: false, // ✅ THÊM: isMain
                maxSubject: 1, // ✅ THÊM: maxSubject
                children: [
                  {
                    name: tab.exam_section_name || `Phần ${idx + 1}`,
                    questions: [],
                  },
                ],
              });
            }
          } else if (tab.exam_section_type === "NHOM_CHU_DE") {
            (tab.groupTopic || []).forEach((group, j) => {
              const subpart = {
                _id: group.idTopic || `group-${Date.now()}-${j}`,
                name: group.nameTopic || `Nhóm ${j + 1}`,
                isMain: false, // ✅ THÊM: isMain
                maxSubject: group.maxSubject || group.subjects?.length || 1, // ✅ THÊM: maxSubject
                children: [],
              };

              (group.subjects || []).forEach((subject, k) => {
                const subjectQuestions = subject.questions || [];
                if (subjectQuestions.length > 0) {
                  const processed =
                    this.processQuestionsForAPI(subjectQuestions);
                  console.log(
                    "[BUILD] NHOM_CHU_DE subject questions processed:",
                    {
                      subjectName: subject.nameSubject || `Môn ${k + 1}`,
                      countIn: subjectQuestions.length,
                      countOut: processed.length,
                    },
                  );
                  subpart.children.push({
                    _id:
                      this.ensureValidObjectId(subject.idSubject) ||
                      this.generateObjectId(),
                    name: subject.nameSubject || `Môn ${k + 1}`,
                    questions: processed,
                  });
                } else {
                  subpart.children.push({
                    _id:
                      this.ensureValidObjectId(subject.idSubject) ||
                      this.generateObjectId(),
                    name: subject.nameSubject || `Môn ${k + 1}`,
                    questions: [],
                  });
                }
              });

              if (subpart.children.length > 0) {
                part.subpart.push(subpart);
              }
            });

            if ((tab.groupTopic || []).length === 0) {
              console.warn(
                "[THIẾU THÔNG TIN] NHOM_CHU_DE section thiếu nhóm chủ đề.",
              );
              part.subpart = [];
            }
          } else {
            const sectionQuestions = tab.questions || [];
            const childExamSections = tab.childExam || [];
            const manualSubSections = tab.subSections || [];
            const hasMainQuestions = sectionQuestions.length > 0;
            const hasChildExams = childExamSections.length > 0;
            const hasManualSubSections = manualSubSections.length > 0;
            if (hasMainQuestions && hasChildExams && hasManualSubSections) {
              part.subpart.push({
                name: tab.exam_section_name || `Phần ${idx + 1}`,
                score: tab.total_score || tab.score || 0,
                time: tab.exam_section_time || tab.time || this.state.time || 0,
                questions_score: tab.question_score || 0,
                isMain: true, // ✅ THÊM: isMain
                maxSubject: 1, // ✅ THÊM: maxSubject
                children: [
                  {
                    name: tab.exam_section_name || `Phần ${idx + 1}`,
                    questions: this.processQuestionsForAPI(sectionQuestions),
                  },
                ],
              });
              childExamSections.forEach((childExam, childIdx) => {
                // ✅ Ưu tiên dùng isMain từ API, nếu không có thì tính toán
                const isMainValue =
                  childExam.isMain !== undefined
                    ? childExam.isMain
                    : (childExam.questions || []).length > 0;
                part.subpart.push({
                  name: childExam.name || `Phần con ${childIdx + 1}`,
                  score: childExam.score || 0,
                  time: childExam.time || 0,
                  questions_score: tab.question_score || 0,
                  isMain: isMainValue, // ✅ SỬA: Ưu tiên dùng từ API
                  maxSubject: 1, // ✅ THÊM: maxSubject
                  children: [
                    {
                      name: childExam.name || `Phần con ${childIdx + 1}`,
                      questions: this.processQuestionsForAPI(
                        childExam.questions || [],
                      ),
                    },
                  ],
                });
              });
              manualSubSections.forEach((subSection, subIdx) => {
                const hasSubQuestions = (subSection.questions || []).length > 0;

                part.subpart.push({
                  name: subSection.name || `Phần thi con ${subIdx + 1}`,
                  score: subSection.score || 0,
                  time: subSection.time || 0,
                  questions_score: tab.question_score || 0,
                  isMain: false, // ✅ SỬA: Manual subSections luôn là false
                  maxSubject: 1, // ✅ THÊM: maxSubject
                  children: [
                    {
                      name: subSection.name || `Phần thi con ${subIdx + 1}`,
                      questions: this.processQuestionsForAPI(
                        subSection.questions || [],
                      ),
                    },
                  ],
                });
              });
            } else if (
              hasMainQuestions &&
              hasChildExams &&
              !hasManualSubSections
            ) {
              part.subpart.push({
                name: tab.exam_section_name || `Phần ${idx + 1}`,
                score: tab.total_score || tab.score || 0,
                time: tab.exam_section_time || tab.time || this.state.time || 0,
                questions_score: tab.question_score || 0,
                isMain: true, // ✅ THÊM: isMain
                maxSubject: 1, // ✅ THÊM: maxSubject
                children: [
                  {
                    name: tab.exam_section_name || `Phần ${idx + 1}`,
                    questions: this.processQuestionsForAPI(sectionQuestions),
                  },
                ],
              });
              childExamSections.forEach((childExam, childIdx) => {
                part.subpart.push({
                  name: childExam.name || `Phần con ${childIdx + 1}`,
                  score: childExam.score || 0,
                  time: childExam.time || 0,
                  questions_score: tab.question_score || 0,
                  isMain: false, // ✅ THÊM: isMain
                  maxSubject: 1, // ✅ THÊM: maxSubject
                  children: [
                    {
                      name: childExam.name || `Phần con ${childIdx + 1}`,
                      questions: this.processQuestionsForAPI(
                        childExam.questions || [],
                      ),
                    },
                  ],
                });
              });
            } else if (
              !hasMainQuestions &&
              hasChildExams &&
              hasManualSubSections
            ) {
              childExamSections.forEach((childExam, childIdx) => {
                // ✅ Ưu tiên dùng isMain từ API
                const isMainValue =
                  childExam.isMain !== undefined ? childExam.isMain : false;

                part.subpart.push({
                  name: childExam.name || `Phần con ${childIdx + 1}`,
                  score: childExam.score || 0,
                  time: childExam.time || 0,
                  questions_score: tab.question_score || 0,
                  isMain: isMainValue, // ✅ SỬA: Ưu tiên dùng từ API
                  maxSubject: 1, // ✅ THÊM: maxSubject
                  children: [
                    {
                      name: childExam.name || `Phần con ${childIdx + 1}`,
                      questions: this.processQuestionsForAPI(
                        childExam.questions || [],
                      ),
                    },
                  ],
                });
              });
              manualSubSections.forEach((subSection, subIdx) => {
                const hasSubQuestions = (subSection.questions || []).length > 0;

                part.subpart.push({
                  name:
                    subSection.name ||
                    `Phần thi con ${childExamSections.length + subIdx + 1}`,
                  score: subSection.score || 0,
                  time: subSection.time || 0,
                  questions_score: tab.question_score || 0,
                  isMain: false, // ✅ SỬA: Manual subSections luôn là false
                  maxSubject: 1, // ✅ THÊM: maxSubject
                  children: [
                    {
                      name:
                        subSection.name ||
                        `Phần thi con ${childExamSections.length + subIdx + 1}`,
                      questions: this.processQuestionsForAPI(
                        subSection.questions || [],
                      ),
                    },
                  ],
                });
              });
            } else if (
              !hasMainQuestions &&
              hasChildExams &&
              !hasManualSubSections
            ) {
              childExamSections.forEach((childExam, childIdx) => {
                // ✅ Ưu tiên dùng isMain từ API
                const isMainValue =
                  childExam.isMain !== undefined ? childExam.isMain : false;

                part.subpart.push({
                  name: childExam.name || `Phần con ${childIdx + 1}`,
                  score: childExam.score || 0,
                  time: childExam.time || 0,
                  isMain: isMainValue, // ✅ SỬA: Ưu tiên dùng từ API
                  maxSubject: 1, // ✅ THÊM: maxSubject
                  children: [
                    {
                      name: childExam.name || `Phần con ${childIdx + 1}`,
                      questions: this.processQuestionsForAPI(
                        childExam.questions || [],
                      ),
                    },
                  ],
                });
              });
            } else if (
              hasMainQuestions &&
              !hasChildExams &&
              !hasManualSubSections
            ) {
              part.subpart.push({
                name: tab.exam_section_name || `Phần ${idx + 1}`,
                score: tab.total_score || tab.score || 0,
                time: tab.exam_section_time || tab.time || this.state.time || 0,
                questions_score: tab.question_score || 0,
                isMain: true, // ✅ THÊM: isMain
                maxSubject: 1, // ✅ THÊM: maxSubject
                children: [
                  {
                    name: tab.exam_section_name || `Phần ${idx + 1}`,
                    questions: this.processQuestionsForAPI(sectionQuestions),
                  },
                ],
              });
            } else {
              if (hasManualSubSections) {
                manualSubSections.forEach((subSection, subIdx) => {
                  const hasSubQuestions =
                    (subSection.questions || []).length > 0;

                  part.subpart.push({
                    name: subSection.name || `Phần thi con ${subIdx + 1}`,
                    score: subSection.score || 0,
                    time: subSection.time || 0,
                    questions_score: tab.question_score || 0,
                    isMain: false, // ✅ SỬA: Manual subSections luôn là false
                    maxSubject: 1, // ✅ THÊM: maxSubject
                    children: [
                      {
                        name: subSection.name || `Phần thi con ${subIdx + 1}`,
                        questions: this.processQuestionsForAPI(
                          subSection.questions || [],
                        ),
                      },
                    ],
                  });
                });
              } else {
                part.subpart.push({
                  name: tab.exam_section_name || `Phần ${idx + 1}`,
                  score: tab.total_score || tab.score || 0,
                  time:
                    tab.exam_section_time || tab.time || this.state.time || 0,
                  questions_score: tab.question_score || 0,
                  isMain: false, // ✅ THÊM: isMain
                  maxSubject: 1, // ✅ THÊM: maxSubject
                  children: [
                    {
                      name: tab.exam_section_name || `Phần ${idx + 1}`,
                      questions: [],
                    },
                  ],
                });
              }
            }
          }

          return part;
        } catch (partError) {
          console.error("[ERROR] Error processing part:", partError);
          return {
            name: `Phần ${idx + 1}`,
            time: this.state.time || 0,
            score: 0,
            questions_score: 0, // ✅ THÊM: questions_score
            maxGroup: 1, // ✅ THÊM: maxGroup
            type:
              tab.exam_section_type === "NHOM_CHU_DE"
                ? "NHOM_CHU_DE"
                : tab.exam_section_type || "MAC_DINH",
            totalquestions: 0,
            _id: tab._id || tab.id || `sec-${idx + 1}`, // ✅ THÊM: _id
            subpart: [
              {
                name: `Phần ${idx + 1}`,
                score: 0,
                time: this.state.time || 0,
                isMain: false, // ✅ THÊM: isMain
                maxSubject: 1, // ✅ THÊM: maxSubject
                children: [
                  {
                    name: `Phần ${idx + 1}`,
                    questions: [],
                  },
                ],
              },
            ],
          };
        }
      });
      const validParts = parts.filter((part) => part != null);

      if (validParts.length === 0) {
        return this.createDefaultParts();
      }

      const cleanedParts = this.validateClusterPayload(validParts);
      return cleanedParts;
    } catch (error) {
      console.error("[ERROR] buildPartsPayload failed:", error);
      return this.createDefaultParts();
    }
  };

  getSubSectionDisplayName = () => {
    try {
      const { selectedSectionId, parts, tabData } = this.state;
      const currentPart = parts?.find((part) => part.id === selectedSectionId);
      if (!currentPart || currentPart.type !== "MAC_DINH") {
        return "Tên vừa lưu";
      }
      if (
        currentPart &&
        currentPart.subpart &&
        currentPart.subpart.length > 0
      ) {
        const subpartName = currentPart.subpart[0].name;
        if (subpartName) {
          const match = subpartName.match(/^(.+?)\s+Phần\s+\d+$/);
          if (match) {
            return match[1]; // Trả về tên gốc (ví dụ: "Toán học")
          }
          return subpartName; // Nếu không match, trả về nguyên bản
        }
      }
      if (tabData && Array.isArray(tabData)) {
        const currentTab = tabData.find((tab) => tab._id === selectedSectionId);
        if (
          currentTab &&
          currentTab.subSections &&
          currentTab.subSections.length > 0
        ) {
          return currentTab.subSections[0].name || "Tên vừa lưu";
        }
      }

      return "Tên vừa lưu"; // Default text
    } catch (error) {
      return "Tên vừa lưu";
    }
  };
  validateAndFixQuestion = (question, questionNo) => {
    try {
      const baseQuestion = question.question || question;

      if (!baseQuestion || typeof baseQuestion !== "object") {
        return this.createDefaultQuestionWrapper(questionNo);
      }
      // ✅ CRITICAL: Preserve original questionId from API, don't generate new one
      const preservedQuestionId =
        baseQuestion.questionId !== undefined
          ? baseQuestion.questionId
          : baseQuestion.question_id || baseQuestion._id || null;

      const fixedQuestion = {
        question: {
          _id: baseQuestion._id || null,
          questionId: preservedQuestionId,
          rawHtml: baseQuestion.rawHtml || "Câu hỏi mặc định",
          plainText: baseQuestion.plainText || "Câu hỏi mặc định",
          type: baseQuestion.type || "",
          parentId: baseQuestion.parentId || null,
          choices: Array.isArray(baseQuestion.choices)
            ? baseQuestion.choices
            : [],
          dragDropOptions: Array.isArray(baseQuestion.dragDropOptions)
            ? baseQuestion.dragDropOptions
            : [],
          correctAnswers: Array.isArray(baseQuestion.correctAnswers)
            ? baseQuestion.correctAnswers
            : [],
          explanation: baseQuestion.explanation || "",
          level: baseQuestion.level || baseQuestion.question_level || "",
          images: Array.isArray(baseQuestion.images) ? baseQuestion.images : [],
          video: baseQuestion.video || baseQuestion.video_link || "",
          // ✅ CRITICAL: Preserve cluster fields for cluster questions
          ...(baseQuestion.type === "cluster" && {
            clusterQuestions: Array.isArray(baseQuestion.clusterQuestions)
              ? baseQuestion.clusterQuestions
              : [],
            cluster: Array.isArray(baseQuestion.cluster)
              ? baseQuestion.cluster
              : [],
          }),
        },
        number: Number(question.number || 0),
        isTestQuestion: question.isTestQuestion || false,
      };
      return fixedQuestion;
    } catch (error) {
      return this.createDefaultQuestionWrapper(questionNo);
    }
  };
  countQuestionsInPart = (part) => {
    let count = 0;
    try {
      if (part.subpart && Array.isArray(part.subpart)) {
        part.subpart.forEach((subpart) => {
          if (subpart.children && Array.isArray(subpart.children)) {
            subpart.children.forEach((child) => {
              if (child.questions && Array.isArray(child.questions)) {
                count += child.questions.filter((q) => {
                  if (!q) return false; // Loại bỏ câu hỏi null/undefined
                  if (q.number === 0 || q.question_no === 0) return false;
                  if (!q.type) return true;

                  const questionType = String(q.type).toUpperCase();
                  return questionType !== "CLUSTER";
                }).length;
              }
            });
          }
        });
      }
    } catch (error) {
      console.warn("countQuestionsInPart error:", error);
    }
    return count;
  };
  storeOldIds = (parts, mapping) => {
    parts.forEach((part) => {
      (part.subpart || []).forEach((subpart) => {
        (subpart.children || []).forEach((child) => {
          (child.questions || []).forEach((qWrap) => {
            if (qWrap.question) {
              const question_id =
                qWrap.question._id || qWrap.question.question_id;
              const questionId = qWrap.question.questionId;
              const type = qWrap.question.type;
              if (questionId) {
                mapping.set(questionId, {
                  _id: question_id,
                  oldId: questionId,
                  type: type,
                  isCluster: type === "cluster",
                  newId: null, // Sẽ được cập nhật sau khi API trả về
                });
              }
            }
          });
        });
      });
    });
  };
  updateParentChildRelationships = async (responseData, oldToNewMapping) => {
    try {
      if (responseData.parts && Array.isArray(responseData.parts)) {
        this.extractNewIdsFromResponse(responseData.parts, oldToNewMapping);
      }
      await this.updateTabDataWithNewIds(oldToNewMapping);
    } catch (error) { }
  };
  extractNewIdsFromResponse = (parts, mapping) => {
    parts.forEach((part, partIdx) => {
      (part.subpart || []).forEach((subpart, subIdx) => {
        (subpart.children || []).forEach((child, childIdx) => {
          (child.questions || []).forEach((qWrap, qIdx) => {
            if (qWrap.question) {
              const newId = qWrap.question._id; // ✅ Chỉ lấy _id thực sự, không fallback questionId
              const questionType = qWrap.question.type;
              const questionContent = (qWrap.question.rawHtml || "").substring(
                0,
                100,
              );
              let matchedOldId = null;
              for (const [oldId, mappingData] of mapping.entries()) {
                if (
                  mappingData.newId === null &&
                  mappingData.type === questionType
                ) {
                  const currentQuestions =
                    this.getQuestionsForCurrentSelection();
                  const oldQuestion = currentQuestions.find(
                    (q) =>
                      (q._id === oldId || q.questionId === oldId) &&
                      q.type === questionType,
                  );

                  if (oldQuestion) {
                    const oldContent = (oldQuestion.rawHtml || "").substring(
                      0,
                      100,
                    );
                    if (
                      oldContent === questionContent ||
                      questionContent.includes(oldContent.substring(0, 50))
                    ) {
                      matchedOldId = oldId;
                      break;
                    }
                  }
                }
              }
              if (!matchedOldId) {
                const unmappedIds = Array.from(mapping.keys()).filter(
                  (id) =>
                    mapping.get(id).newId === null &&
                    mapping.get(id).type === questionType,
                );
                if (unmappedIds.length > 0) {
                  matchedOldId = unmappedIds[0];
                }
              }

              if (matchedOldId && mapping.has(matchedOldId)) {
                const mappingData = mapping.get(matchedOldId);
                mappingData.newId = newId;
              } else {
                console.warn("[DEBUG] Could not find matching old ID for:", {
                  newId,
                  questionType,
                  contentPreview: questionContent.substring(0, 50) + "...",
                });
              }
            }
          });
        });
      });
    });
    for (const [oldId, mappingData] of mapping.entries()) {
    }
  };
  findOldIdFromResponse = (questionData, mapping) => {
    const responseRawHtml = questionData.rawHtml || "";
    const responseType = questionData.type || "";
    const responseParentId = questionData.parentId;

    for (const [oldId, mappingData] of mapping.entries()) {
      if (mappingData.newId === null) {
        const currentQuestions = this.getQuestionsForCurrentSelection();
        const matchingQuestion = currentQuestions.find(
          (q) =>
            (q._id === oldId || q.questionId === oldId) &&
            q.type?.toLowerCase() === responseType?.toLowerCase() &&
            (q.rawHtml || "").substring(0, 50) ===
            responseRawHtml.substring(0, 50),
        );

        if (matchingQuestion) {
          return oldId;
        }
      }
    }
    const unmappedIds = Array.from(mapping.keys()).filter(
      (id) => mapping.get(id).newId === null,
    );
    if (unmappedIds.length > 0) {
      return unmappedIds[0];
    }

    return null;
  };
  updateTabDataWithNewIds = async (mapping) => {
    const clusterIdMap = new Map();
    for (const [oldId, mappingData] of mapping.entries()) {
      if (mappingData.isCluster && mappingData.newId) {
        clusterIdMap.set(oldId, mappingData.newId);
      }
    }
    this.setState((prevState) => {
      const updatedTabData = prevState.tabData.map((tab) => ({
        ...tab,
        subSections: (tab.subSections || []).map((subSection) => ({
          ...subSection,
          questions: subSection.questions.map((question) => {
            if (question.parentId && clusterIdMap.has(question.parentId)) {
              const newParentId = clusterIdMap.get(question.parentId);

              return {
                ...question,
                parentId: newParentId,
              };
            }
            if (question.type === "cluster" && mapping.has(question._id)) {
              const mappingData = mapping.get(question._id);
              if (mappingData.newId) {
                return {
                  ...question,
                  _id: mappingData.newId,
                  questionId: mappingData.newId,
                };
              }
            }

            return question;
          }),
        })),
      }));

      return {
        ...prevState,
        tabData: updatedTabData,
      };
    });
  };

  validateExamConfig = () => {
    const errors = [];
    const sections = Array.isArray(this.state.sections)
      ? this.state.sections
      : [];
    const scorePerPart = Array.isArray(this.state.scorePerPart)
      ? this.state.scorePerPart
      : [];
    sections.forEach((section, idx) => {
      const score = scorePerPart[idx];
      const scoreValue = parseFloat(score || 0);

      if (
        !score ||
        score.trim() === "" ||
        isNaN(scoreValue) ||
        scoreValue <= 0
      ) {
        errors.push(
          `Phần "${section.title || `Phần ${idx + 1}`}" chưa có điểm hoặc điểm không hợp lệ`,
        );
      }
    });
    if (this.state.statusExam === false) {
      const totalTime = parseInt(this.state.time || 0);
      if (!totalTime || totalTime <= 0) {
        errors.push("Chưa thiết lập tổng thời gian làm bài");
      }
    } else {
      sections.forEach((section, idx) => {
        const sectionTime = parseInt(section.time || 0);
        if (!sectionTime || sectionTime <= 0) {
          errors.push(
            `"${section.title || `Phần ${idx + 1}`}" chưa có thời gian hoặc thời gian không hợp lệ`,
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };

  async handleUpdateExamApi() {
    // Kiểm tra fastGiftStatus - nếu false thì hiện dialog xác nhận
    if (!this.state.fastGiftStatus) {
      return new Promise((resolve) => {
        Modal.confirm({
          title: "Cảnh báo",
          content:
            "Bạn chưa chọn quà tặng cho đề thi. Bạn có chắc chắn muốn tiếp tục không?",
          okText: "OK, không chọn",
          okType: "primary",
          cancelText: "Hủy",
          onOk: () => {
            // Nếu user xác nhận, tiếp tục với logic update
            this.proceedWithUpdateExam();
            resolve();
          },
          onCancel: () => {
            // Nếu user hủy, dừng lại
            resolve();
          },
        });
      });
    } else {
      // Nếu fastGiftStatus = true, tiếp tục bình thường
      return this.proceedWithUpdateExam();
    }
  }

  async proceedWithUpdateExam() {
    try {
      setLoader(true);
      const examName = this.state.name?.trim();
      if (!examName) {
        notification.error({
          message: "Tên đề thi không được để trống",
          placement: "topRight",
          duration: 3,
        });
        return;
      }

      if (this.state.endDate < this.state.startDate) {
        notification.error({
          message: "Ngày đóng đề phải sau ngày mở đề",
          placement: "topRight",
          duration: 5,
        });
        this.setState({
          showEndDateTooltip: true,
        });
        return;
      }
      // Validate practiceConfig dates
      if (this.state.practiceConfig === true) {
        const hasStartDate = this.state.startDate;
        const hasEndDate = this.state.endDate;

        if (!hasStartDate && !hasEndDate) {
          notification.error({
            message: "Lỗi validate",
            description: "Chưa nhập ngày tháng bắt đầu và kết thúc",
            placement: "topRight",
            duration: 3,
          });
          return;
        } else if (!hasStartDate) {
          notification.error({
            message: "Lỗi validate",
            description: "Chưa nhập ngày tháng bắt đầu",
            placement: "topRight",
            duration: 3,
          });
          return;
        } else if (!hasEndDate) {
          notification.error({
            message: "Lỗi validate",
            description: "Chưa nhập ngày tháng kết thúc",
            placement: "topRight",
            duration: 3,
          });
          return;
        }
      }
      const existingExams = this.props.exams || [];
      const detail = this.props.detail || {};
      if (
        this.state.deleteQuestionIds &&
        this.state.deleteQuestionIds.length > 0
      ) {
        await this.handleDeleteQuestionApi();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const tabData = this.state.tabData || [];
      for (const tab of tabData) {
        if (tab.exam_section_type === "NHOM_CHU_DE") {
          continue;
        }
        const mainQuestions = tab.questions ? tab.questions.length : 0;
        const subQuestions = tab.subSections
          ? tab.subSections.reduce(
            (sum, sub) => sum + (sub.questions ? sub.questions.length : 0),
            0,
          )
          : 0;
        const childExamQuestions = tab.childExam
          ? tab.childExam.reduce(
            (sum, child) =>
              sum + (child.questions ? child.questions.length : 0),
            0,
          )
          : 0;

        if (mainQuestions + subQuestions + childExamQuestions === 0) {
          notification.error({
            message: `Phần thi "${tab.exam_section_name || tab.name}" phải có ít nhất 1 câu hỏi`,
            placement: "topRight",
            duration: 3,
          });
          return;
        }
      }

      const invalidGroupTopics = [];
      this.state.tabData.forEach((tab, tabIndex) => {
        if (tab.exam_section_type === "NHOM_CHU_DE" && tab.groupTopic) {
          tab.groupTopic.forEach((group, groupIdx) => {
            if (group.subjects && Array.isArray(group.subjects)) {
              const subjectsCount = group.subjects.length;
              if (subjectsCount <= 1) {
                return; // Không cần kiểm tra isTestQuestion
              }
              group.subjects.forEach((subject, subjectIdx) => {
                if (subject.questions && Array.isArray(subject.questions)) {
                  const hasTestQuestion = subject.questions.some(
                    (question) =>
                      !question.parentId && question.isTestQuestion === true,
                  );

                  if (!hasTestQuestion) {
                    invalidGroupTopics.push(
                      `${tab.exam_section_name || `Phần ${tabIndex + 1}`} - ${group.nameTopic || `Nhóm ${groupIdx + 1}`} - ${subject.nameSubject || `Môn ${subjectIdx + 1}`} (${subject.questions.length} câu)`,
                    );
                  }
                }
              });
            }
          });
        }
      });
      if (this.state.fastGiftStatus && this.state.fastGifts_id == null) {
        notification.error({
          message: "Thiếu quà tặng",
          description: `Hãy chọn ít nhất 1 quà tặng`,
          placement: "topRight",
          duration: 5,
        });
        return;
      }
      if (invalidGroupTopics.length > 0) {
        notification.error({
          message: "Thiếu câu hỏi thử nghiệm",
          description: `Các môn học trong nhóm có nhiều môn phải có ít nhất 1 câu hỏi được đánh dấu là "Câu hỏi thử nghiệm".`,
          placement: "topRight",
          duration: 5,
        });
        return;
      }
      let parts;
      try {
        const rawParts = this.buildPartsPayload();
        if (this.state.parts && this.state.parts.length > 0) {
          parts = this.mergePartsWithUpload(rawParts, this.state.parts);
        } else {
          parts = rawParts;
        }
        parts = this.validateAndFixPartsPayload(parts);
        if (!parts || !Array.isArray(parts) || parts.length === 0) {
          parts = this.createDefaultParts();
        }
      } catch (partsError) {
        parts = this.createDefaultParts();
      }
      if (!parts || !Array.isArray(parts) || parts.length === 0) {
        throw new Error("Đề thi phải có ít nhất một phần");
      }
      const examData = {
        e_cheating: this.state.e_cheating,
        id: this.state.examId,
        name: this.state.name || detail.name || "",
        group: this.state.group || detail.group || "",
        alias: this.state.alias || detail.alias || "",
        creating_type: this.state.type_question || detail.creating_type || "",
        subject: {
          id: this.state.subject_id || detail.subject?.id || "",
        },
        time: this.state.time || detail.time || 90,
        is_redo:
          this.state.is_redo !== undefined
            ? this.state.is_redo
            : detail.is_redo,
        classes: this.state.classes || detail.classes || "",
        is_pay_fee: true,
        type: this.state.typeExam || detail.type || "",
        exam_doc_link: this.state.linkExam || detail.exam_doc_link || "",
        exam_doc_link2: this.state.linkExam2 || detail.exam_doc_link2 || "",
        answer_doc_link: this.state.linkAnswer || detail.answer_doc_link || "",
        point_true_false:
          this.state.pointTrueFalse === true
            ? {
              1: this.state.pointTrueFalse1,
              2: this.state.pointTrueFalse2,
              3: this.state.pointTrueFalse3,
              4: this.state.pointTrueFalse4,
            }
            : detail.point_true_false || {},
        code: this.state.code || detail.code || "",
        category: this.state.category || detail.category || "",
        tp: this.state.tp || detail.tp || "",
        categoryExam: {
          populate_id: this.state.typeExam || detail.populate_id || "",
          type_exam: this.state.examTypeId || detail.type_exam || "",
        },
        parts: parts,
        practiceConfig:
          this.state.group === "THI_THU"
            ? {
              status: this.state.isPracticeConfig === true ? true : false,
              startDate: this.state.startDate || "",
              endDate: this.state.endDate || "",
              result_display: this.state.resultDisplay || "LATER",
              answer_display: this.state.answerDisplay || "LATER",
              required_passwword: this.state.requirePassword === true,
              password: this.state.examPassword || "",
            }
            : null,
        fast_gift: {
          status: this.state.fastGiftStatus || false,
          id: this.state.fastGifts_id || null,
        },
      };
      if (!examData.name || examData.name.trim() === "") {
        throw new Error("Tên đề thi không được để trống");
      }

      if (!examData.subject?.id) {
        throw new Error("Vui lòng chọn môn học");
      }
      const oldToNewIdMapping = new Map();
      this.storeOldIds(parts, oldToNewIdMapping);
      const response = await this.props.updateExamWord(examData);
      if (response && (response.data || response.parts)) {
        const responseData = response.data || response;
        await this.updateParentChildRelationships(
          responseData,
          oldToNewIdMapping,
        );
      } else {
      }
      this.props.history.push("/exam-word");
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi lưu đề thi";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoader(false);
    }
  }
  createDefaultParts = () => {
    return [
      {
        id: "default-part",
        name: "Phần mặc định",
        score: 0,
        time: this.state.time || 0,
        totalquestions: 0,
        type: "MAC_DINH",
        subpart: [
          {
            name: "Phần mặc định",
            score: 0,
            time: this.state.time || 0,
            children: [
              {
                name: "Phần mặc định",
                questions: [],
              },
            ],
          },
        ],
      },
    ];
  };
  async handleUpdateSectionApi(tab, index) {
    try {
      setLoader(true);
      let data = {
        exam_section_id: tab._id,
        exam_id: this.state.examId,
        exam_section_order: index,
        exam_section_name: tab.exam_section_name,
        section_type: tab.section_type,
        calculate_score_type: tab.calculate_score_type,
        total_score: tab.total_score,
        exam_section_time: tab.exam_section_time ? tab.exam_section_time : 0,
        exam_link: tab.exam_link,
        point_per_question:
          tab.total_score > 0 && this.countTotalQuestion(tab) > 0
            ? (tab.total_score / this.countTotalQuestion(tab)).toFixed(2)
            : 0,
      };
      await this.props.updateSection(data);
    } catch (error) {
    } finally {
      setLoader(false);
    }
  }

  async createNewSectionApi() {
    setLoader(true);
    let data = {
      exam_id: this.state.examId,
      exam_section_order: this.state.tabData.length,
      exam_section_name: this.state.newTabName,
      section_type: this.state.sectionType,
      calculate_score_type: "total_point",
    };
    await this.props.createSection(data);
    setLoader(false);
  }

  async createGroupSectionApi(data) {
    setLoader(true);
    await this.props.createSection(data);
    setLoader(false);
  }

  render() {
    const itemStyle = {
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    };
    return (
      <div>
        <div
          className="page-content page-container page-exam-create exam-create-container"
          id="page-content"
        >
          <div className="padding">
            {this.state.actionUser === "CREATE" && (
              <h2 className="text-md text-highlight sss-page-title">
                Tạo đề thi
              </h2>
            )}
            {this.state.actionUser === "UPDATE" && (
              <h2 className="text-md text-highlight sss-page-title">
                Cập nhật đề thi
              </h2>
            )}
            <div className="general-info block-item-content">
              <h3 className="title-block">Thông tin đề thi</h3>
              <div
                className="content input-group"
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.5fr 1.5fr 1fr 1fr 1fr 1fr", // Tăng từ 380px lên 1.5fr cho tên đề thi
                  gap: "16px",
                  alignItems: "end",
                }}
              >
                <div className="form-group">
                  <label className="text-form-label">Mã đề thi</label>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      name="examId"
                      onChange={this._onChange}
                      value={this.state.examId}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="text-form-label">
                    Tên đề thi <span style={{ color: "red" }}>*</span>
                  </label>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      onChange={this._onChange}
                      value={this.state.name}
                      ref={(input) => {
                        this.nameInput = input;
                      }}
                    />
                    {!this.state.name.trim() && (
                      <small className="text-danger">
                        Tên đề thi không được để trống
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="text-form-label">
                    Kỳ thi <span style={{ color: "red" }}>*</span>
                  </label>
                  <div>
                    <select
                      className="custom-select"
                      value={this.state.typeExam}
                      name="typeExam"
                      onChange={this.handleChangeCompetition}
                    >
                      <option value="">-- Chọn kỳ thi --</option>
                      {this.fetchCategoryRows()}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="text-form-label">Loại đề thi</label>
                  <div>
                    <select
                      className="custom-select"
                      value={this.state.examTypeId}
                      name="examTypeId"
                      onChange={this._onChange}
                      disabled={!this.state.typeExam}
                    >
                      <option value="">-- Chọn loại đề thi --</option>
                      {this.fetchExamTypeRows()}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="text-form-label">Đề thi PDF</label>
                  <div>
                    <input
                      type="url"
                      className="form-control"
                      name="linkExam"
                      placeholder="Nhập URL PDF"
                      onChange={this._onChange}
                      value={this.state.linkExam}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-form-label">Đề thi có đáp án</label>
                  <div>
                    <input
                      type="url"
                      className="form-control"
                      name="linkExam2"
                      placeholder="Nhập URL PDF"
                      onChange={this._onChange}
                      value={this.state.linkExam2}
                    />
                  </div>
                </div>
              </div>

              <div
                className="content input-group"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "16px",
                  alignItems: "end",
                }}
              >
                <div className="form-group mb-0">
                  <label className="text-form-label">Loại bài kiểm tra</label>
                  <div>
                    <select
                      className="custom-select"
                      name="alias"
                      value={this.state.alias}
                      onChange={this._onChange}
                    >
                      <option value="">--Chọn Loại Bài--</option>
                      {this.fetchLevelRows()}
                    </select>
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="text-form-label">
                    Nhóm đề <span style={{ color: "red" }}>*</span>
                  </label>
                  <div>
                    <select
                      className="custom-select"
                      value={this.state.group}
                      name="group"
                      onChange={this._onChange}
                    >
                      <option value={"MAC_DINH"}>Mặc định</option>
                      <option value={"THI_THU"}>Đề thi thử</option>
                      <option value={"SACH_ID"}>Đề thi sách ID</option>
                    </select>
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="text-form-label">Lớp học</label>
                  <div>
                    <select
                      className="custom-select"
                      value={this.state.classes}
                      name="classes"
                      onChange={this._onChange}
                    >
                      <option value="">Lớp học</option>
                      <option value="1">Lớp 1</option>
                      <option value="2">Lớp 2</option>
                      <option value="3">Lớp 3</option>
                      <option value="4">Lớp 4</option>
                      <option value="5">Lớp 5</option>
                      <option value="6">Lớp 6</option>
                      <option value="7">Lớp 7</option>
                      <option value="8">Lớp 8</option>
                      <option value="9">Lớp 9</option>
                      <option value="10">Lớp 10</option>
                      <option value="11">Lớp 11</option>
                      <option value="12">Lớp 12</option>
                    </select>
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="text-form-label">
                    Môn học <span style={{ color: "red" }}>*</span>
                  </label>
                  <div>
                    <select
                      className="custom-select"
                      value={this.state.subject_id}
                      name="subject_id"
                      onChange={this._onChange}
                      ref={(input) => {
                        this.subjectInput = input;
                      }}
                    >
                      <option value="">-- Chọn môn học --</option>
                      {this.fetchRowsSubject()}
                    </select>
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="text-form-label">
                    Cho phép làm lại <span style={{ color: "red" }}>*</span>
                  </label>
                  <div>
                    <select
                      className="custom-select"
                      value={this.state.is_redo}
                      name="is_redo"
                      onChange={this._onChange}
                    >
                      <option value={false}>Không cho phép</option>
                      <option value={true}>Có</option>
                    </select>
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="text-form-label">Tỉnh/thành phố</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Chọn tỉnh/thành phố..."
                      value={this.getSelectedProvinceName()}
                      onClick={this.handleInputClick}
                      readOnly
                      style={{ cursor: "pointer", backgroundColor: "white" }}
                    />

                    {/* Custom search overlay */}
                    {this.state.showProvinceDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                          borderTop: "none",
                          borderRadius: "0 0 4px 4px",
                          maxHeight: "250px",
                          zIndex: 9999,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Search input at top */}
                        <div
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #eee",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: "16px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#666",
                              zIndex: 1,
                            }}
                          >
                            🔍
                          </div>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Tìm kiếm tỉnh/thành phố..."
                            value={this.state.provinceSearchTerm || ""}
                            onChange={this.handleProvinceSearch}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            style={{
                              paddingLeft: "35px",
                              border: "none",
                              borderColor: "none",
                              boxShadow: "none",
                            }}
                          />
                        </div>

                        {/* Provinces list */}
                        <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                          {this.getFilteredProvinces().map((province) => (
                            <div
                              key={province.code}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#f5f5f5")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "white")
                              }
                              onClick={() => this.selectProvince(province)}
                            >
                              {province.name}
                            </div>
                          ))}
                          {this.getFilteredProvinces().length === 0 &&
                            this.state.provinceSearchTerm && (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#666",
                                }}
                              >
                                Không tìm thấy tỉnh/thành phố
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/*<div className="form-group mb-0" style={{width: "20%"}}>*/}
                {/*  <label className="text-form-label">Phương thức tạo câu hỏi</label>*/}
                {/*  <div>*/}
                {/*    <select*/}
                {/*      className="custom-select"*/}
                {/*      value={this.state.type_question}*/}
                {/*      name="type_question"*/}
                {/*      onChange={*/}
                {/*        this._onChange*/}
                {/*      }*/}
                {/*      ref={(input) => {*/}
                {/*        this.typeQuestionInput = input;*/}
                {/*      }}*/}
                {/*    >*/}
                {/*      <option value="">*/}
                {/*        -- Chọn phương thức*/}
                {/*        --*/}
                {/*      </option>*/}
                {/*      {this.fetchTypeQuestions()}*/}
                {/*    </select>*/}
                {/*  </div>*/}
                {/*</div>*/}
                {(this.state.typeExam === this.state.TN ||
                  this.state.typeExam == this.state.APT) && (
                    <div className="form-group mb-0 mr-32">
                      <label className="text-form-label">Thời gian (Phút)</label>
                      <div>
                        <input
                          min="0"
                          max="999"
                          ref={(input) => {
                            this.timeInput = input;
                          }}
                          type="number"
                          className="form-control"
                          name="time"
                          onChange={this._onChange}
                          value={this.state.time}
                        />
                      </div>
                    </div>
                  )}
                {(this.state.typeExam === this.state.TN ||
                  this.state.typeExam == this.state.APT) && (
                    <div className="form-group mb-0 mr-32">
                      <label className="text-form-label">Thời gian (Phút)</label>
                      <div>
                        <input
                          min="0"
                          max="999"
                          ref={(input) => {
                            this.timeInput = input;
                          }}
                          type="number"
                          className="form-control"
                          name="time"
                          onChange={this._onChange}
                          value={this.state.time}
                        />
                      </div>
                    </div>
                  )}
              </div>
              {this.state.typeExam === this.state.TN && (
                <div
                  className="content input-group"
                  style={{ flexWrap: "nowrap", gap: "16px" }}
                >
                  <div className="form-group mb-0 mt-4 row">
                    <div className="col-auto">
                      <label className="">
                        Cấu hình thang điểm câu hỏi đúng sai
                      </label>
                    </div>
                    <div className="col">
                      <label className="ui-switch ui-switch-md info m-t-xs">
                        <input
                          type="checkbox"
                          name="pointTrueFalse"
                          value={this.state.pointTrueFalse}
                          checked={
                            this.state.pointTrueFalse === true ? "checked" : ""
                          }
                          onChange={this._onChangeSwitch}
                        />{" "}
                        <i />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {(this.state.typeExam === this.state.TN ||
                this.state.typeExam === this.state.TSA) &&
                this.state.pointTrueFalse === true && (
                  <div
                    className="content input-group"
                    style={{ flexWrap: "nowrap", gap: "16px" }}
                  >
                    <div
                      className="form-group mb-0 row ml-2"
                      style={{ width: "800px" }}
                    >
                      <div className="row col-6">
                        <span className="input-group-addon">
                          <i>Trả lời đúng 1 ý</i>
                        </span>
                        <input
                          min="0"
                          max="99"
                          type="number"
                          className="form-control ml-2 mr-2"
                          name="pointTrueFalse1"
                          onChange={this._onChange}
                          value={this.state.pointTrueFalse1}
                          ref={(input) => {
                            this.nameInput = input;
                          }}
                          style={{ width: "100px" }}
                        />
                        <span className="input-group-addon">
                          <i> %</i>
                        </span>
                      </div>
                      <div className="row col-6">
                        <span className="input-group-addon">
                          <i>Trả lời đúng 2 ý</i>
                        </span>
                        <input
                          min="0"
                          max="99"
                          type="number"
                          className="form-control ml-2 mr-2"
                          name="pointTrueFalse2"
                          onChange={this._onChange}
                          value={this.state.pointTrueFalse2}
                          ref={(input) => {
                            this.nameInput = input;
                          }}
                          style={{ width: "100px" }}
                        />
                        <span className="input-group-addon">
                          <i> %</i>
                        </span>
                      </div>
                      <div className="row col-6">
                        <span className="input-group-addon">
                          <i>Trả lời đúng 3 ý</i>
                        </span>
                        <input
                          min="0"
                          max="99"
                          type="number"
                          className="form-control ml-2 mr-2"
                          name="pointTrueFalse3"
                          onChange={this._onChange}
                          value={this.state.pointTrueFalse3}
                          ref={(input) => {
                            this.nameInput = input;
                          }}
                          style={{ width: "100px" }}
                        />
                        <span className="input-group-addon">
                          <i> %</i>
                        </span>
                      </div>
                      <div className="row col-6">
                        <span className="input-group-addon">
                          <i>Trả lời đúng 4 ý</i>
                        </span>
                        <input
                          min="0"
                          max="99"
                          type="number"
                          className="form-control ml-2 mr-2"
                          name="pointTrueFalse4"
                          onChange={this._onChange}
                          value={this.state.pointTrueFalse4}
                          ref={(input) => {
                            this.nameInput = input;
                          }}
                          style={{ width: "100px" }}
                        />
                        <span className="input-group-addon">
                          <i> %</i>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            {this.state.group === "THI_THU" && (
              <div
                key={`thi-thu-section-${this.state.group}`}
                className="block-exam block-item-content animate fade-down"
                style={{
                  animation: "fadeInDown 0.4s ease-in-out",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                {/* Header với checkbox */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    className="title-block"
                    style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}
                  >
                    Cấu hình luyện đề thực chiến
                  </h3>
                  <label
                    className="switch m-0"
                    style={{ transform: "translateY(1px)" }}
                  >
                    <input
                      type="checkbox"
                      checked={this.state.isPracticeConfig}
                      onChange={(e) =>
                        this.setState({ isPracticeConfig: e.target.checked })
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {/* Container với chiều cao cố định để tránh nhảy layout */}
                <div style={{ minHeight: "230px", position: "relative" }}>
                  {/* Nội dung chỉ hiện khi checkbox được check */}
                  {this.state.isPracticeConfig && (
                    <div
                      className="content"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "20px",
                        alignItems: "start",
                      }}
                    >
                      {/* Phần 1: Mở đề/Đóng đề */}
                      <div>
                        <h3
                          className="title-block"
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "16px",
                          }}
                        >
                          Thời gian mở/đóng đề
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          <div className="form-group mb-0">
                            <label className="text-form-label">
                              Mở đề <span style={{ color: "red" }}>*</span>
                            </label>
                            <Flatpickr
                              value={this.state.startDate}
                              placeholder="DD/MM/YYYY --:-- --"
                              options={{
                                enableTime: true,
                                dateFormat: "d/m/Y h:i K",
                                time_24hr: false,
                                closeOnSelect: false,
                                locale: {
                                  ...Vietnamese,
                                  amPM: ["Sáng", "Chiều"],
                                },
                              }}
                              className="form-control"
                              onClose={(dates) => {
                                if (dates[0] > this.state.endDate) {
                                  notification.error({
                                    message: "Ngày đóng đề phải sau ngày mở đề",
                                    placement: "topRight",
                                    duration: 5,
                                  });
                                  this.setState({
                                    startDate: dates[0],
                                    showEndDateTooltip: true,
                                  });
                                } else {
                                  this.setState({
                                    startDate: dates[0],
                                    showEndDateTooltip: false,
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="form-group mb-0">
                            <label className="text-form-label">
                              Đóng đề <span style={{ color: "red" }}>*</span>
                            </label>
                            <Flatpickr
                              value={this.state.endDate}
                              placeholder="DD/MM/YYYY --:-- --"
                              options={{
                                enableTime: true,
                                dateFormat: "d/m/Y h:i K",
                                time_24hr: false,
                                locale: {
                                  ...Vietnamese,
                                  amPM: ["Sáng", "Chiều"],
                                },
                              }}
                              className="form-control"
                              style={
                                this.state.showEndDateTooltip
                                  ? {
                                    border: "1px solid #ff4d4f",
                                    borderRadius: "4px",
                                    boxShadow:
                                      "0 0 0 2px rgba(255,77,79,0.2)",
                                  }
                                  : {}
                              }
                              onClose={(dates) => {
                                if (dates[0] < this.state.startDate) {
                                  notification.error({
                                    message: "Ngày đóng đề phải sau ngày mở đề",
                                    placement: "topRight",
                                    duration: 5,
                                  });
                                  this.setState({
                                    endDate: dates[0],
                                    showEndDateTooltip: true,
                                  });
                                } else {
                                  this.setState({
                                    endDate: dates[0],
                                    showEndDateTooltip: false,
                                  });
                                }
                              }}
                            />
                            {this.state.showEndDateTooltip && (
                              <span style={{ color: "red", fontSize: "12px" }}>
                                <img
                                  src="/assets/img/icon-report-bug.svg"
                                  alt="bug"
                                  style={{ color: "red", width: "12px" }}
                                />
                                <small>Ngày đóng đề phải sau ngày mở đề!</small>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Phần 2: Chính sách kết quả/đáp án */}
                      <div>
                        <h3
                          className="title-block"
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "16px",
                          }}
                        >
                          Chính sách kết quả/đáp án
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          <div className="form-group mb-0">
                            <label className="text-form-label">Kết quả</label>
                            <div>
                              <select
                                className="custom-select"
                                style={{ fontSize: "13px" }}
                                value={this.state.resultDisplay || "LATER"}
                                onChange={(e) =>
                                  this.setState({
                                    resultDisplay: e.target.value,
                                  })
                                }
                              >
                                <option value={"LATER"}>Sau khi đóng đề</option>
                                <option value={"IMMEDIATELY"}>
                                  Ngay sau khi nộp
                                </option>
                              </select>
                            </div>
                          </div>
                          <div className="form-group mb-0">
                            <label className="text-form-label">Đáp án</label>
                            <div>
                              <select
                                className="custom-select"
                                style={{ fontSize: "13px" }}
                                value={this.state.answerDisplay || "LATER"}
                                onChange={(e) =>
                                  this.setState({
                                    answerDisplay: e.target.value,
                                  })
                                }
                              >
                                <option value={"LATER"}>Sau khi đóng đề</option>
                                <option value={"IMMEDIATELY"}>
                                  Ngay sau khi nộp
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phần 3: Yêu cầu mật khẩu */}
                      <div>
                        <h3
                          className="title-block"
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "16px",
                          }}
                        >
                          Yêu cầu mật khẩu
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          <label className="switch m-0">
                            <input
                              type="checkbox"
                              checked={this.state.requirePassword === true}
                              onChange={(e) =>
                                this.setState({
                                  requirePassword: e.target.checked,
                                })
                              }
                            />
                            <span className="slider round"></span>
                          </label>
                          <span style={{ fontSize: "13px", color: "#666" }}>
                            Hiện nút "Mở khóa đề thi"
                          </span>
                        </div>
                        {!this.state.requirePassword && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              fontStyle: "italic",
                              margin: "0",
                            }}
                          >
                            Các tùy chọn mật khẩu đã bị ẩn
                          </p>
                        )}
                        {this.state.requirePassword && (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "flex-end",
                                marginBottom: "12px",
                              }}
                            >
                              <div
                                className="form-group mb-0"
                                style={{ flex: 1 }}
                              >
                                <label className="text-form-label">
                                  Mật khẩu{" "}
                                  <span style={{ color: "red" }}>*</span>
                                </label>
                                <div style={{ position: "relative" }}>
                                  <i
                                    className="fa fa-key"
                                    style={{
                                      position: "absolute",
                                      left: "12px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      color: "#6c757d",
                                      fontSize: "13px",
                                      zIndex: 1,
                                    }}
                                  ></i>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhấn nút Tạo để sinh mật khẩu"
                                    value={this.state.examPassword || ""}
                                    style={{
                                      fontSize: "13px",
                                      paddingLeft: "35px",
                                    }}
                                    readOnly
                                  />
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="btn btn-light"
                                onClick={() =>
                                  this.setState({
                                    examPassword: this.createRandomPassword(),
                                  })
                                }
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "12px",
                                  flex: 1,
                                }}
                              >
                                {this.state.examPassword ? "Tạo mới" : "Tạo"}
                              </button>
                              {this.state.examPassword !== "" && (
                                <button
                                  className="btn btn-light"
                                  onClick={() =>
                                    this.copyToClipboard(
                                      this.state.examPassword,
                                    )
                                  }
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    flex: 1,
                                  }}
                                >
                                  Sao chép
                                </button>
                              )}
                            </div>

                            <p
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                margin: "0",
                              }}
                            >
                              Bạn có thể thay đổi mật khẩu bất cứ lúc nào
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Thông báo khi checkbox chưa được check */}
                  {!this.state.isPracticeConfig && (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        color: "#666",
                        minHeight: "230px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className="fa fa-info-circle"
                        style={{
                          fontSize: "24px",
                          marginBottom: "8px",
                          color: "#6c757d",
                        }}
                      ></i>
                      <p style={{ margin: 0, fontSize: "14px" }}>
                        Bật "Cấu hình luyện đề thực chiến" để thiết lập thời
                        gian, chính sách và mật khẩu cho đề thi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="block-exam block-item-content">
              <h3 className="title-block">Tải lên file Word</h3>
              <div
                className="content"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative", width: "280px" }}>
                  <input
                    type="file"
                    id="wordFile"
                    accept=".doc,.docx"
                    onChange={this.onChangeHandler}
                    ref={(el) => (this.fileInputRef = el)}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="wordFile"
                    style={{
                      display: "inline-flex",
                      gap: "5px",
                      width: "100%",
                      alignItems: "center",
                      padding: "6px 10px",
                      border: "2px dashed #ddd",
                      borderRadius: "5px",
                      cursor: "pointer",
                      backgroundColor: "#f8f9fa",
                      transition: "all 0.2s ease",
                      fontSize: "13px",
                      color: "#6c757d",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      height: "34px",
                      boxSizing: "border-box",
                      margin: 0,
                      verticalAlign: "middle",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#007bff";
                      e.currentTarget.style.backgroundColor = "#e7f1ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#ddd";
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                  >
                    <svg
                      style={{ width: "14px", height: "14px", flexShrink: 0 }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span
                      style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {this.state.fileData
                        ? this.state.fileData.name
                        : "Chọn file Word"}
                    </span>
                  </label>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => this.handleUpload()}
                  disabled={!this.state.fileData || this.state.isUploading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    fontSize: "13px",
                    fontWeight: "500",
                    border: "none",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                    opacity:
                      !this.state.fileData || this.state.isUploading ? 0.6 : 1,
                    cursor:
                      !this.state.fileData || this.state.isUploading
                        ? "not-allowed"
                        : "pointer",
                    whiteSpace: "nowrap",
                    height: "34px",
                  }}
                  onMouseEnter={(e) => {
                    if (!(!this.state.fileData || this.state.isUploading)) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 6px rgba(0,0,0,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.1)";
                  }}
                >
                  {this.state.isUploading ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i>
                      <span>Đang tải...</span>
                    </>
                  ) : this.state.uploaded ? (
                    <>
                      <img
                        src="/assets/img/icon-upload.svg"
                        alt=""
                        style={{ width: "14px", height: "14px" }}
                      />
                      <span>Tải file khác</span>
                    </>
                  ) : (
                    <>
                      <img
                        src="/assets/img/icon-upload.svg"
                        alt=""
                        style={{ width: "14px", height: "14px" }}
                      />
                      <span>Tải lên</span>
                    </>
                  )}
                </button>

                <a
                  href="https://drive.google.com/drive/folders/1Xx5PtLCektjngbRWQPSZei5ZATegu0Po?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    fontSize: "13px",
                    fontWeight: "500",
                    border: "1px solid #ddd",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                    color: "#495057",
                    whiteSpace: "nowrap",
                    height: "34px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 6px rgba(0,0,0,0.1)";
                    e.currentTarget.style.borderColor = "#007bff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.05)";
                    e.currentTarget.style.borderColor = "#ddd";
                  }}
                >
                  <img
                    src="/assets/img/icon-download.svg"
                    alt=""
                    style={{ width: "14px", height: "14px" }}
                  />
                  <span>Đề mẫu</span>
                </a>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  <button
                    className="btn btn-warning"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "5px",
                      fontSize: "13px",
                      fontWeight: "500",
                      border: "none",
                      cursor: "pointer",
                      height: "34px",
                    }}
                    onClick={() =>
                      this.setState({ showDropdown: !this.state.showDropdown })
                    }
                  >
                    <i className="fa fa-download"></i>
                    <span>Download file Word</span>
                    <i className="fa fa-caret-down"></i>
                  </button>

                  {this.state.showDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        top: "40px",
                        left: 0,
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        zIndex: 10,
                        minWidth: "180px",
                      }}
                    >
                      <div
                        className="dropdown-item"
                        style={itemStyle}
                        onClick={() => this.handleDownload("EXAMPLE")}
                      >
                        <i className="fa fa-download"></i> Xuất dạng ví dụ
                      </div>

                      <div
                        className="dropdown-item"
                        style={itemStyle}
                        onClick={() => this.handleDownload("QUESTION")}
                      >
                        <i className="fa fa-download"></i> Xuất dạng câu hỏi
                      </div>

                      <div
                        className="dropdown-item"
                        style={itemStyle}
                        onClick={() => this.handleDownload("DETAIL")}
                      >
                        <i className="fa fa-download"></i> Xuất dạng đầy đủ
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="file-hint mt-2">
                <small className="text-muted" style={{ fontSize: "12px" }}>
                  <i className="fa fa-info-circle mr-1"></i>
                  Chỉ chấp nhận .doc, .docx
                </small>
              </div>
            </div>

            <div
              className="block-exam block-item-content"
              style={{ minHeight: "70vh" }}
            >
              <div
                className="exam-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  className="exam-title-group"
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    className="exam-title title-block"
                    style={{ display: "flex", alignItems: "center", margin: 0 }}
                  >
                    Đề thi
                  </div>
                  <button
                    type="button"
                    className="exam-config btn btn-light"
                    onClick={this.openExamConfigModal}
                  >
                    <img
                      src="/assets/img/icon-setting.svg"
                      alt=""
                      style={{ width: "16px", height: "16px" }}
                    />
                    Cấu hình đề thi
                  </button>
                </div>

                <div className="button-group">
                  <button
                    className="btn btn-info"
                    onClick={this.handlePreviewExam}
                    disabled={!this.state.selectedSectionId}
                    style={{
                      cursor: !this.state.selectedSectionId
                        ? "not-allowed"
                        : "pointer",
                      opacity: !this.state.selectedSectionId ? 0.6 : 1,
                    }}
                    title="Xem trước phần thi hiện tại"
                  >
                    <i className="fa fa-eye mr-2"></i>
                    Xem trước
                  </button>
                  <button
                    className="btn btn-info"
                    onClick={this.handleAddDefaultSection}
                  >
                    + Phần thi mặc định
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={this.handleAddTopicGroup}
                  >
                    + Phần thi nhóm chủ đề
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={this.handleClearAll}
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>

              <div
                className="section-group"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {(this.state.sections || []).map((section, index) => (
                  <div
                    key={section._id || section.id}
                    style={{ position: "relative" }}
                  >
                    {/* ✅ THÊM: Conditional rendering cho edit mode */}
                    {this.state.editingSectionId ===
                      (section._id || section.id) ? (
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        <input
                          type="text"
                          value={this.state.editingSectionName}
                          onChange={this.handleSectionNameInputChange}
                          onKeyDown={this.handleSectionNameKeyPress}
                          onBlur={this.handleSaveSectionName}
                          autoFocus
                          maxLength={100}
                          style={{
                            padding: "8px 40px 8px 12px",
                            border: "2px solid #007bff",
                            borderRadius: "6px",
                            fontSize: "14px",
                            minWidth: "150px",
                            maxWidth: "300px",
                            fontWeight: "500",
                            boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
                            outline: "none",
                          }}
                          placeholder="Nhập tên phần thi"
                        />
                        {/* Biểu tượng lưu */}
                        <div
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#28a745",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                          onClick={this.handleSaveSectionName}
                          title="Nhấn Enter để lưu"
                        >
                          ✓
                        </div>
                      </div>
                    ) : (
                      <button
                        className={`btn btn-outline-primary me-2 ${this.state.selectedSectionId ===
                          (section._id || section.id)
                          ? "active"
                          : ""
                          }`}
                        style={
                          section.isSubSection
                            ? {
                              marginLeft: "20px",
                              backgroundColor: "#f8f9fa",
                              borderColor: "#6c757d",
                              color: "#6c757d",
                            }
                            : {}
                        }
                        onClick={() => {
                          this.handleTabChange(section._id || section.id);
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          this.handleStartEditSectionName(
                            section._id || section.id,
                            section.title || section.name,
                          );
                        }}
                        title={
                          section.isSubSection
                            ? "Phần thi con - Double click để sửa tên"
                            : "Phần thi chính - Double click để sửa tên"
                        }
                      >
                        {section.isSubSection && (
                          <span style={{ marginRight: "5px" }}>└─</span>
                        )}
                        {section.title}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {this.state.selectedSectionId && (
                <>
                  <div
                    className="delete-section"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    {/* Các nút quản lý phần thi bên phải */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {/* ✅ SỬA: Luôn hiển thị nút "Thêm phần thi con" cho phần thi DEFAULT */}
                      {(() => {
                        const currentTab = this.state.tabData.find(
                          (tab) => tab._id === this.state.selectedSectionId,
                        );
                        const currentSection = this.state.sections.find(
                          (section) =>
                            (section._id || section.id) ===
                            this.state.selectedSectionId,
                        );
                        const sectionType = currentSection
                          ? currentSection.type
                          : null;
                        const tabType = currentTab
                          ? currentTab.exam_section_type
                          : null;

                        const isAllowedType =
                          sectionType === "MAC_DINH" ||
                          sectionType === "MAC_DINH" ||
                          tabType === "MAC_DINH" ||
                          tabType === "MAC_DINH";
                        const isGroupSubject =
                          sectionType === "GROUP_SUBJECT" ||
                          tabType === "GROUP_SUBJECT";
                        const shouldShowAddSubSection =
                          isAllowedType && !isGroupSubject;
                        return shouldShowAddSubSection ? (
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              this.handleAddSubSection(this.state.examSectionId)
                            }
                          >
                            + Thêm phần thi con
                          </button>
                        ) : null;
                      })()}
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          this.handleDeleteSection(this.state.selectedSectionId)
                        }
                        disabled={!this.state.selectedSectionId} // vô hiệu nếu chưa chọn
                      >
                        Xóa phần thi
                      </button>
                    </div>
                  </div>

                  {this.state.selectedSectionType === "group" && (
                    <>
                      <div className="content">
                        <button
                          className="btn btn-primary"
                          onClick={() => this.openGroupModal("create")}
                        >
                          + Thêm nhóm chủ đề
                        </button>

                        {this.state.showGroupModal && (
                          <>
                            {/* backdrop mờ */}
                            <div className="modal-backdrop fade show"></div>

                            {/* modal căn giữa */}
                            <div className="modal show d-block" tabIndex="-1">
                              <div
                                className="modal-dialog animate fade-down"
                                data-classname="fade-down"
                              >
                                <div className="modal-content">
                                  <div className="modal-body">
                                    {/* Component form sẵn có */}
                                    <ModalGroupQuestion
                                      uniqueKey={this.getKeyTabActive() + ""}
                                      createGroupQuestion={(
                                        topicGroups,
                                        subject,
                                      ) =>
                                        this.createGroupQuestion(
                                          topicGroups,
                                          subject,
                                        )
                                      }
                                      updateGroupQuestion={(topicGroups) =>
                                        this.updateGroupQuestion(topicGroups)
                                      }
                                      closeModal={this.closeGroupModal}
                                      dataItemGroup={
                                        this.state.itemGroupTabData
                                      }
                                      onCreateGroup={this.handleCreateGroup}
                                      onUpdateGroup={this.handleUpdateGroup}
                                      groupDetail={this.state.groupDetail}
                                      actionGroup={this.state.actionGroup}
                                      subjects={this.props.subjects || []}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-3">
                        {this.state.groups.map((group) => (
                          <div key={group.id} className="exam-row">
                            <div className="exam-title title-block ml-2">
                              {group.name}
                            </div>
                            <div className="subject-group">
                              {group.subjects.map((s) => (
                                <button
                                  key={s.id}
                                  className={`btn ${this.state.selectedSubject?.id === s.id
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                    }`}
                                  onClick={() => this.handleSelectSubject(s)}
                                >
                                  {s.name}
                                </button>
                              ))}
                              <img
                                src="/assets/img/icon-edit.svg"
                                alt="edit"
                                onClick={() =>
                                  this.openGroupModal("update", group)
                                }
                              />
                              <img
                                src="/assets/img/icon-delete.svg"
                                alt="delete"
                                onClick={() => this.handleDeleteGroup(group.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="card shadow-sm p-3 question-card">
                    <div className="col-sm-12 mt-3">
                      {/* Hiển thị bảng chính chỉ khi không có sub-sections */}
                      {(() => {
                        const currentTab = this.state.tabData.find(
                          (tab) => tab._id === this.state.selectedSectionId,
                        );
                        const hasSubSections =
                          currentTab &&
                          ((currentTab.childExam &&
                            currentTab.childExam.length > 0) ||
                            (currentTab.subSections &&
                              currentTab.subSections.length > 0));
                        const hasMainQuestions =
                          this.hasMainQuestionsFromAPI(currentTab);
                        if (
                          currentTab &&
                          currentTab.exam_section_type === "MAC_DINH"
                        ) {
                          return (
                            <>
                              {/* ✅ THÊM: Header với nút đánh số bên ngoài viền xanh */}
                              <div className="main-section-header d-flex justify-content-between align-items-center mb-3">
                                <div style={{ marginBottom: "10px" }}></div>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    this.handleOpenRenumberModal("MAC_DINH")
                                  }
                                  title="Đánh số câu hỏi"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <i className="fa fa-list-ol"></i>
                                  Đánh số
                                </button>
                              </div>

                              <div
                                className="question-table-wrapper"
                                style={{
                                  overflowX: "auto",
                                  overflowY: "auto",
                                  minWidth: "50%",
                                  maxHeight: "500px",
                                  border: "2px solid #6aaef7ff",
                                  borderRadius: "5px",
                                  marginBottom: "15px",
                                }}
                              >
                                <div style={{ padding: "15px" }}>
                                  <DragDropContext
                                    onDragEnd={this.onDragEndQuestion}
                                  >
                                    <table
                                      className="table table-theme table-row v-middle"
                                      style={{
                                        width: "100%",
                                        tableLayout: "auto",
                                      }}
                                    >
                                      <thead
                                        className="text-muted"
                                        style={{
                                          borderBottom: "2px solid #ff6f3c",
                                        }}
                                      >
                                        <tr>
                                          <th
                                            style={{
                                              width: "40px",
                                              textAlign: "center",
                                            }}
                                          ></th>
                                          <th
                                            style={{
                                              width: "80px",
                                              textAlign: "center",
                                            }}
                                          >
                                            STT 1
                                          </th>
                                          <th
                                            style={{
                                              minWidth: "150px",
                                              textAlign: "center",
                                            }}
                                          >
                                            Đáp án
                                          </th>
                                          <th
                                            style={{
                                              minWidth: "120px",
                                              textAlign: "center",
                                            }}
                                          >
                                            Loại câu hỏi
                                          </th>
                                          <th
                                            style={{
                                              minWidth: "80px",
                                              textAlign: "center",
                                            }}
                                          >
                                            Độ khó
                                          </th>
                                          <th
                                            style={{
                                              minWidth: "150px",
                                              textAlign: "center",
                                            }}
                                          >
                                            Giải thích
                                          </th>
                                          <th
                                            style={{
                                              minWidth: "100px",
                                              textAlign: "center",
                                            }}
                                          >
                                            Video
                                          </th>
                                          <th
                                            style={{
                                              minWidth: "120px",
                                              textAlign: "center",
                                            }}
                                          >
                                            Ngày tải lên
                                          </th>
                                          <th
                                            style={{
                                              minWidth: "100px",
                                              textAlign: "center",
                                            }}
                                          >
                                            Thao tác
                                          </th>
                                        </tr>
                                      </thead>
                                      {this.fetchRows(
                                        this.getQuestionsForCurrentSelection(),
                                        "questions-droppable",
                                      )}
                                    </table>
                                  </DragDropContext>
                                </div>
                              </div>

                              {/* ✅ SỬA: LUÔN hiển thị button thêm câu hỏi chính khi có bảng */}
                              <div className="question-type-group">
                                <button
                                  className="btn btn-info"
                                  onClick={() =>
                                    this.handleOpenModalCreateQuestion(
                                      "SINGLECHOICE",
                                    )
                                  }
                                >
                                  + Trắc nghiệm
                                </button>
                                <button
                                  className="btn btn-info"
                                  onClick={() =>
                                    this.handleOpenModalCreateQuestion(
                                      "TRUEFALSEMULTI",
                                    )
                                  }
                                >
                                  + Trắc nghiệm đúng sai
                                </button>
                                <button
                                  className="btn btn-info"
                                  onClick={() =>
                                    this.handleOpenModalCreateQuestion(
                                      "FILLINBLANK",
                                    )
                                  }
                                >
                                  + Điền số/trả lời ngắn
                                </button>
                                <button
                                  className="btn btn-info"
                                  onClick={() =>
                                    this.handleOpenModalCreateQuestion(
                                      "DRAGDROP",
                                    )
                                  }
                                >
                                  + Kéo thả
                                </button>
                                <button
                                  className="btn btn-info"
                                  onClick={() =>
                                    this.handleOpenModalCreateQuestion(
                                      "MULTIPLECHOICE",
                                    )
                                  }
                                >
                                  + Trắc nghiệm nhiều đáp án
                                </button>
                                <button
                                  className="btn btn-info"
                                  onClick={() =>
                                    this.handleOpenModalCreateQuestion(
                                      "TRUEFALSE",
                                    )
                                  }
                                >
                                  + Đúng/Sai
                                </button>
                                <button
                                  className="btn btn-info"
                                  onClick={() =>
                                    this.handleOpenModalCreateQuestion(
                                      "CLUSTER",
                                    )
                                  }
                                >
                                  + Câu hỏi chùm
                                </button>
                              </div>
                              {/* Nếu có sub-sections thì render tiếp */}
                              {hasSubSections && (
                                <>
                                  {/* ✅ SỬA: Merge childExam (từ API) và subSections (từ user input) */}
                                  {(() => {
                                    const apiSubSections =
                                      currentTab.childExam || [];
                                    const manualSubSections =
                                      currentTab.subSections || [];
                                    const allSubSections = [...apiSubSections];
                                    manualSubSections.forEach((manual) => {
                                      if (
                                        !allSubSections.find(
                                          (api) => api.id === manual.id,
                                        )
                                      ) {
                                        allSubSections.push(manual);
                                      }
                                    });

                                    return allSubSections.map(
                                      (child, subIdx) => (
                                        <div
                                          key={child.id}
                                          style={{ marginBottom: "30px" }}
                                        >
                                          {/* Header của sub-section */}
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              marginBottom: "15px",
                                              padding: "10px",
                                            }}
                                          >
                                            <h5
                                              style={{
                                                margin: 0,
                                                color: "#FF5500",
                                                fontWeight: "600",
                                              }}
                                            >
                                              {(() => {
                                                const displayTitle =
                                                  child.originalTitle ||
                                                  child.name ||
                                                  `Phần thi con ${subIdx + 1}`;
                                                return displayTitle; // ✅ KHÔNG STRIP SỐ: Trả về đầy đủ "1.1 TIẾNG VIỆT" để đồng bộ với tool tạo mới
                                              })()}
                                            </h5>

                                            {/* ✅ THÊM: Nút đánh số bên ngoài viền cam */}
                                            <div
                                              style={{
                                                display: "flex",
                                                gap: "8px",
                                                alignItems: "center",
                                              }}
                                            >
                                              <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() =>
                                                  this.handleOpenRenumberModal(
                                                    "subSections",
                                                    null,
                                                    null,
                                                    child.id,
                                                  )
                                                }
                                                title="Đánh số câu hỏi"
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: "6px",
                                                }}
                                              >
                                                <i className="fa fa-list-ol"></i>
                                                Đánh số
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  this.handleDeleteSubSection(
                                                    child.id,
                                                  )
                                                }
                                                className="btn btn-danger"
                                                data-dismiss="modal"
                                                title="Xóa phần thi con"
                                              >
                                                <i className="fa fa-trash"></i>
                                              </button>
                                            </div>
                                          </div>

                                          {/* Bảng câu hỏi của sub-section */}
                                          <div
                                            className="question-table-wrapper"
                                            style={{
                                              overflowX: "auto",
                                              overflowY: "auto",
                                              minWidth: "50%",
                                              maxHeight: "500px",
                                              border: "2px solid #ff6f3c",
                                              borderRadius: "5px",
                                              marginBottom: "15px",
                                            }}
                                          >
                                            <div style={{ padding: "15px" }}>
                                              <DragDropContext
                                                onDragEnd={
                                                  this.onDragEndQuestion
                                                }
                                              >
                                                <table
                                                  className="table table-theme table-row v-middle"
                                                  style={{
                                                    width: "100%",
                                                    tableLayout: "auto",
                                                  }}
                                                >
                                                  <thead
                                                    className="text-muted"
                                                    style={{
                                                      borderBottom:
                                                        "2px solid #ff6f3c",
                                                    }}
                                                  >
                                                    <tr>
                                                      <th
                                                        style={{
                                                          width: "40px",
                                                          textAlign: "center",
                                                        }}
                                                      ></th>
                                                      <th
                                                        style={{
                                                          width: "80px",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        STT 2
                                                      </th>
                                                      <th
                                                        style={{
                                                          minWidth: "150px",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Đáp án
                                                      </th>
                                                      <th
                                                        style={{
                                                          minWidth: "120px",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Loại câu hỏi
                                                      </th>
                                                      <th
                                                        style={{
                                                          minWidth: "80px",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Độ khó
                                                      </th>
                                                      <th
                                                        style={{
                                                          minWidth: "150px",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Giải thích
                                                      </th>
                                                      <th
                                                        style={{
                                                          minWidth: "100px",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Video
                                                      </th>
                                                      <th
                                                        style={{
                                                          minWidth: "120px",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Ngày tải lên
                                                      </th>
                                                      <th
                                                        style={{
                                                          minWidth: "100px",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        Thao tác
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  {child.questions &&
                                                    child.questions.length > 0 ? (
                                                    this.fetchRows(
                                                      child.questions,
                                                      child.idChildExam
                                                        ? `questions-droppable-child-${child.idChildExam}`
                                                        : `questions-droppable-sub-${child.id}`,
                                                      true,
                                                      child.idChildExam ||
                                                      child.id,
                                                    )
                                                  ) : (
                                                    <tbody>
                                                      <tr>
                                                        <td
                                                          colSpan="9"
                                                          className="text-center text-muted"
                                                        >
                                                          Chưa có câu hỏi nào
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  )}
                                                </table>
                                              </DragDropContext>
                                            </div>
                                          </div>

                                          {/* Button thêm câu hỏi cho sub-section */}
                                          <div className="question-type-group">
                                            <button
                                              className="btn btn-info"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestion(
                                                  "SINGLECHOICE",
                                                  "SubSection",
                                                  child.id,
                                                )
                                              }
                                            >
                                              + Trắc nghiệm
                                            </button>
                                            <button
                                              className="btn btn-info"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestion(
                                                  "TRUEFALSEMULTI",
                                                  "SubSection",
                                                  child.id,
                                                )
                                              }
                                            >
                                              + Trắc nghiệm đúng sai
                                            </button>
                                            <button
                                              className="btn btn-info"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestion(
                                                  "FILLINBLANK",
                                                  "SubSection",
                                                  child.id,
                                                )
                                              }
                                            >
                                              + Điền số/trả lời ngắn
                                            </button>
                                            <button
                                              className="btn btn-info"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestion(
                                                  "DRAGDROP",
                                                  "SubSection",
                                                  child.id,
                                                )
                                              }
                                            >
                                              + Kéo thả
                                            </button>
                                            <button
                                              className="btn btn-info"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestion(
                                                  "MULTIPLECHOICE",
                                                  "SubSection",
                                                  child.id,
                                                )
                                              }
                                            >
                                              + Trắc nghiệm nhiều đáp án
                                            </button>
                                            <button
                                              className="btn btn-info"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestion(
                                                  "TRUEFALSE",
                                                  "SubSection",
                                                  child.id,
                                                )
                                              }
                                            >
                                              + Đúng/Sai
                                            </button>
                                            <button
                                              className="btn btn-info"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestion(
                                                  "CLUSTER",
                                                  "SubSection",
                                                  child.id,
                                                )
                                              }
                                            >
                                              + Câu hỏi chùm
                                            </button>
                                          </div>
                                        </div>
                                      ),
                                    );
                                  })()}
                                </>
                              )}
                            </>
                          );
                        } else if (
                          currentTab?.exam_section_type === "NHOM_CHU_DE"
                        ) {
                          return (
                            <DragDropContext onDragEnd={this.onDragEndQuestion}>
                              {(currentTab.groupTopic || []).map(
                                (group, groupIdx) => {
                                  const activeSubjectIdx =
                                    this.state.activeSubjects?.[groupIdx] ?? 0;
                                  const activeSubject =
                                    group.subjects[activeSubjectIdx];

                                  const questionTypes = [
                                    {
                                      type: "SINGLECHOICE",
                                      label: "+ Trắc nghiệm",
                                    },
                                    {
                                      type: "TRUEFALSEMULTI",
                                      label: "+ Trắc nghiệm đúng sai",
                                    },
                                    {
                                      type: "FILLINBLANK",
                                      label: "+ Điền số/trả lời ngắn",
                                    },
                                    { type: "DRAGDROP", label: "+ Kéo thả" },
                                    {
                                      type: "MULTIPLECHOICE",
                                      label: "+ Trắc nghiệm nhiều đáp án",
                                    },
                                    { type: "TRUEFALSE", label: "+ Đúng/Sai" },
                                    {
                                      type: "CLUSTER",
                                      label: "+ Câu hỏi chùm",
                                    },
                                  ];
                                  return (
                                    <div
                                      key={group.idTopic || groupIdx}
                                      style={{ marginBottom: "40px" }}
                                    >
                                      {/* Header nhóm + môn + icon */}
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          marginBottom: "15px",
                                        }}
                                      >
                                        {/* Tên chủ đề */}
                                        <h5
                                          style={{
                                            margin: 0,
                                            color: "#ff6f3c",
                                            fontWeight: "bold",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {group.nameTopic ||
                                            `Nhóm ${groupIdx + 1}`}
                                        </h5>

                                        {/* Các môn học */}
                                        <div
                                          style={{
                                            flex: 1,
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: "8px",
                                          }}
                                        >
                                          {group.subjects.map(
                                            (subject, subjIdx) => {
                                              return (
                                                <button
                                                  key={
                                                    subject.idSubject || subjIdx
                                                  }
                                                  className={`btn ${activeSubjectIdx === subjIdx
                                                    ? "btn-primary"
                                                    : "btn-outline-primary"
                                                    }`}
                                                  onClick={() =>
                                                    this.setState((prev) => ({
                                                      activeSubjects: {
                                                        ...(prev.activeSubjects ||
                                                          {}),
                                                        [groupIdx]: subjIdx,
                                                      },
                                                    }))
                                                  }
                                                >
                                                  {subject.nameSubject ||
                                                    `Môn ${subjIdx + 1}`}
                                                </button>
                                              );
                                            },
                                          )}
                                        </div>

                                        {/* Nút đánh số chung cho nhóm chủ đề */}
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "8px",
                                          }}
                                        >
                                          <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() =>
                                              this.handleOpenRenumberModal(
                                                "NHOM_CHU_DE",
                                                groupIdx,
                                              )
                                            }
                                            title="Đánh số câu hỏi cho tất cả môn học trong nhóm chủ đề"
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "6px",
                                            }}
                                          >
                                            <i className="fa fa-list-ol"></i>
                                            Đánh số
                                          </button>

                                          {/* ⚙️ Nút cài đặt mới */}
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() =>
                                              this.handleOpenUpdateGroupQuestion(
                                                currentTab._id,
                                              )
                                            }
                                            title="Cài đặt nhóm"
                                          >
                                            <i className="fa fa-cog"></i>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Bảng câu hỏi cho môn hiện tại */}
                                      {activeSubject && (
                                        <div
                                          className="question-table-wrapper"
                                          style={{
                                            overflowX: "auto",
                                            overflowY: "auto",
                                            minWidth: "50%",
                                            maxHeight: "500px",
                                            border: "2px solid #6aaef7ff",
                                            borderRadius: "5px",
                                            padding: "25px",
                                            marginBottom: "20px",
                                          }}
                                        >
                                          {/* ✅ THÊM: Nút đánh số ở góc trên bên phải */}
                                          <table
                                            className="table table-theme table-row v-middle"
                                            style={{
                                              width: "100%",
                                              tableLayout: "auto",
                                            }}
                                          >
                                            <thead
                                              className="text-muted"
                                              style={{
                                                borderBottom:
                                                  "2px solid #ff6f3c",
                                              }}
                                            >
                                              <tr>
                                                <th
                                                  style={{
                                                    textAlign: "center",
                                                  }}
                                                ></th>
                                                <th
                                                  style={{
                                                    width: "80px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  STT 3
                                                </th>
                                                <th
                                                  style={{
                                                    minWidth: "150px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Đáp án
                                                </th>
                                                <th
                                                  style={{
                                                    minWidth: "120px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Loại câu hỏi
                                                </th>
                                                <th
                                                  style={{
                                                    minWidth: "80px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Độ khó
                                                </th>
                                                <th
                                                  style={{
                                                    minWidth: "150px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Giải thích
                                                </th>
                                                <th
                                                  style={{
                                                    minWidth: "100px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Video
                                                </th>
                                                <th
                                                  style={{
                                                    minWidth: "120px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Ngày tải lên
                                                </th>
                                                <th
                                                  style={{
                                                    minWidth: "100px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Thao tác
                                                </th>
                                                <th
                                                  style={{
                                                    minWidth: "70px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  TN
                                                </th>
                                              </tr>
                                            </thead>

                                            {activeSubject.questions?.length >
                                              0 ? (
                                              this.fetchRowsTopicGroup(
                                                activeSubject.questions,
                                                `group-${groupIdx}-subject-${activeSubjectIdx}`,
                                                activeSubject.idSubject,
                                              )
                                            ) : (
                                              <tbody>
                                                <tr>
                                                  <td
                                                    colSpan="9"
                                                    className="text-center text-muted"
                                                  >
                                                    Chưa có câu hỏi nào cho môn
                                                    học này
                                                  </td>
                                                </tr>
                                              </tbody>
                                            )}
                                          </table>
                                        </div>
                                      )}

                                      {/* Các button thêm câu hỏi */}
                                      <div
                                        className="question-type-group"
                                        style={{
                                          marginTop: "10px",
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: "8px",
                                        }}
                                      >
                                        {questionTypes.map((qt) => (
                                          <button
                                            key={qt.type}
                                            className="btn btn-info"
                                            onClick={() =>
                                              this.handleOpenModalCreateQuestionTopicGroup(
                                                qt.type,
                                                "Group",
                                                group.idTopic,
                                                activeSubject?.idSubject,
                                                group,
                                              )
                                            }
                                          >
                                            {qt.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </DragDropContext>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="block-exam block-item-content">
              <div className="button-group">
                <button
                  className="btn btn-light "
                  onClick={() => this.props.history.push("/exam-word")}
                >
                  Hủy
                </button>
                {this.state.examId != "" && (
                  <button
                    name="reset"
                    value="1"
                    className="btn btn-primary"
                    onClick={() => this.handleUpdateExamApi()}
                    disabled={!this.state.name.trim()}
                  >
                    Lưu
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          id="create"
          className="modal fade"
          data-backdrop="true"
          style={{
            display: "none",
            minWidth: "50vh",
            zIndex: 1050,
          }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down modal-lg"
            data-class="fade-down"
          >
            <div className="modal-content">
              <div className="modal-body">
                <ModalQuestion1
                  examId={this.state.examId}
                  examSectionId={this.state.examSectionId}
                  examSectionGroupId={this.state.examSectionGroupId}
                  examSectionSubjectId={this.state.examSectionSubjectId}
                  statusTopic={this.state.statusTopic}
                  currentTopicId={this.state.idTopicGroup}
                  currentSubjectId={this.state.idSubject}
                  questionIdGroupTopic={this.state.questionIdGroupTopic}
                  questionNo={this.state.questionNo}
                  actionCreateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.addNewQuestionToGroup(data);
                    } else {
                      this.addNewQuestion(data);
                    }
                  }}
                  actionUpdateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.actionUpdateTopicQuestion(data);
                    } else {
                      this.actionUpdateQuestion(data);
                    }
                  }}
                  actionQuestion={this.state.actionQuestion}
                  currentQuestionvalue={this.state.currentQuestionvalue}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          id="create2"
          className="modal fade"
          data-backdrop="true"
          style={{
            display: "none",
            minWidth: "50vh",
            zIndex: 1050,
          }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down modal-lg"
            data-class="fade-down"
          >
            <div className="modal-content">
              <div className="modal-body">
                <ModalQuestion2
                  examId={this.state.examId}
                  examSectionId={this.state.examSectionId}
                  examSectionGroupId={this.state.examSectionGroupId}
                  examSectionSubjectId={this.state.examSectionSubjectId}
                  statusTopic={this.state.statusTopic}
                  currentTopicId={this.state.idTopicGroup}
                  currentSubjectId={this.state.idSubject}
                  questionIdGroupTopic={this.state.questionIdGroupTopic}
                  questionNo={this.state.questionNo}
                  actionCreateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.addNewQuestionToGroup(data);
                    } else {
                      this.addNewQuestion(data);
                    }
                  }}
                  actionUpdateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.actionUpdateTopicQuestion(data);
                    } else {
                      this.actionUpdateQuestion(data);
                    }
                  }}
                  actionQuestion={this.state.actionQuestion}
                  currentQuestionvalue={this.state.currentQuestionvalue}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          id="create3"
          className="modal fade"
          data-backdrop="true"
          style={{
            display: "none",
            minWidth: "50vh",
            zIndex: 1050,
          }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down modal-lg"
            data-class="fade-down"
          >
            <div className="modal-content">
              <div className="modal-body">
                <ModalQuestion3
                  examId={this.state.examId}
                  examSectionId={this.state.examSectionId}
                  examSectionGroupId={this.state.examSectionGroupId}
                  examSectionSubjectId={this.state.examSectionSubjectId}
                  statusTopic={this.state.statusTopic}
                  currentTopicId={this.state.idTopicGroup}
                  currentSubjectId={this.state.idSubject}
                  questionIdGroupTopic={this.state.questionIdGroupTopic}
                  questionNo={this.state.questionNo}
                  actionCreateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.addNewQuestionToGroup(data);
                    } else {
                      this.addNewQuestion(data);
                    }
                  }}
                  actionUpdateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.actionUpdateTopicQuestion(data);
                    } else {
                      this.actionUpdateQuestion(data);
                    }
                  }}
                  actionQuestion={this.state.actionQuestion}
                  currentQuestionvalue={this.state.currentQuestionvalue}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          id="create4"
          className="modal fade"
          data-backdrop="true"
          style={{
            display: "none",
            minWidth: "50vh",
            zIndex: 1050,
          }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down modal-lg"
            data-class="fade-down"
          >
            <div className="modal-content">
              <div className="modal-body">
                <ModalQuestion4
                  examId={this.state.examId}
                  examSectionId={this.state.examSectionId}
                  examSectionGroupId={this.state.examSectionGroupId}
                  examSectionSubjectId={this.state.examSectionSubjectId}
                  statusTopic={this.state.statusTopic}
                  currentTopicId={this.state.idTopicGroup}
                  currentSubjectId={this.state.idSubject}
                  questionIdGroupTopic={this.state.questionIdGroupTopic}
                  questionNo={this.state.questionNo}
                  actionCreateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.addNewQuestionToGroup(data);
                    } else {
                      this.addNewQuestion(data);
                    }
                  }}
                  actionUpdateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.actionUpdateTopicQuestion(data);
                    } else {
                      this.actionUpdateQuestion(data);
                    }
                  }}
                  actionQuestion={this.state.actionQuestion}
                  currentQuestionvalue={this.state.currentQuestionvalue}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          id="create5"
          className="modal fade"
          data-backdrop="true"
          style={{
            display: "none",
            minWidth: "50vh",
            zIndex: 1050,
          }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down modal-lg"
            data-class="fade-down"
          >
            <div className="modal-content">
              <div className="modal-body">
                <ModalQuestion5
                  examId={this.state.examId}
                  examSectionId={this.state.examSectionId}
                  examSectionGroupId={this.state.examSectionGroupId}
                  examSectionSubjectId={this.state.examSectionSubjectId}
                  statusTopic={this.state.statusTopic}
                  currentTopicId={this.state.idTopicGroup}
                  currentSubjectId={this.state.idSubject}
                  questionIdGroupTopic={this.state.questionIdGroupTopic}
                  questionNo={this.state.questionNo}
                  actionCreateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.addNewQuestionToGroup(data);
                    } else {
                      this.addNewQuestion(data);
                    }
                  }}
                  actionUpdateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.actionUpdateTopicQuestion(data);
                    } else {
                      this.actionUpdateQuestion(data);
                    }
                  }}
                  actionQuestion={this.state.actionQuestion}
                  currentQuestionvalue={this.state.currentQuestionvalue}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          id="create6"
          className="modal fade"
          data-backdrop="true"
          style={{
            display: "none",
            minWidth: "50vh",
            zIndex: 1050,
          }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down modal-lg"
            data-class="fade-down"
          >
            <div className="modal-content">
              <div className="modal-body">
                <ModalQuestion6
                  examId={this.state.examId}
                  examSectionId={this.state.examSectionId}
                  examSectionGroupId={this.state.examSectionGroupId}
                  examSectionSubjectId={this.state.examSectionSubjectId}
                  statusTopic={this.state.statusTopic}
                  currentTopicId={this.state.idTopicGroup}
                  currentSubjectId={this.state.idSubject}
                  questionIdGroupTopic={this.state.questionIdGroupTopic}
                  questionNo={this.state.questionNo}
                  actionCreateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.addNewQuestionToGroup(data);
                    } else {
                      this.addNewQuestion(data);
                    }
                  }}
                  actionUpdateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.actionUpdateTopicQuestion(data);
                    } else {
                      this.actionUpdateQuestion(data);
                    }
                  }}
                  actionQuestion={this.state.actionQuestion}
                  currentQuestionvalue={this.state.currentQuestionvalue}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          id="create7"
          className="modal fade"
          data-backdrop="true"
          style={{
            display: "none",
            minWidth: "50vh",
            zIndex: 1050,
          }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down modal-lg"
            data-class="fade-down"
          >
            <div className="modal-content">
              <div className="modal-body">
                <ModalQuestion7
                  examId={this.state.examId}
                  examSectionId={this.state.examSectionId}
                  examSectionGroupId={this.state.examSectionGroupId}
                  examSectionSubjectId={this.state.examSectionSubjectId}
                  statusTopic={this.state.statusTopic}
                  currentTopicId={this.state.idTopicGroup}
                  currentSubjectId={this.state.idSubject}
                  questionIdGroupTopic={this.state.questionIdGroupTopic}
                  questionNo={this.state.questionNo}
                  actionCreateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.addNewQuestionToGroup(data);
                    } else {
                      this.addNewQuestion(data);
                    }
                  }}
                  actionUpdateQuestion={(data) => {
                    if (this.state.statusTopic == "NHOM_CHU_DE") {
                      this.actionUpdateTopicQuestion(data);
                    } else {
                      this.actionUpdateQuestion(data);
                    }
                  }}
                  actionQuestion={this.state.actionQuestion}
                  currentQuestionvalue={this.state.currentQuestionvalue}
                  onCloseModal={() => {
                    $("#create7").hide();
                    $("body").removeClass("modal-open");
                    $(".modal-backdrop").remove();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ THAY THẾ: React Modal thay cho jQuery modal */}
        {this.state.showGroupModal && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={this.closeGroupModal}
            ></div>
            <div
              className="modal show d-block"
              tabIndex="-1"
              onClick={this.closeGroupModal}
            >
              <div
                className="modal-dialog animate fade-down modal-lg"
                data-class="fade-down"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-body">
                    <ModalGroupQuestion
                      uniqueKey={this.getKeyTabActive() + ""}
                      createGroupQuestion={(topicGroups, subject) =>
                        this.createGroupQuestion(topicGroups, subject)
                      }
                      updateGroupQuestion={(topicGroups) =>
                        this.updateGroupQuestion(topicGroups)
                      }
                      dataItemGroup={this.state.itemGroupTabData}
                      actionGroup={this.state.actionGroup}
                      groupDetail={this.state.groupDetail} // ✅ Đảm bảo prop này được truyền
                      closeModal={this.closeGroupModal}
                      subjects={this.props.subjects || []}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div
          id="delete-question"
          className="modal fade"
          data-backdrop="true"
          style={{ display: "none" }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down"
            data-classname="fade-down"
          >
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title text-md">Thông báo</div>
                <button className="close" data-dismiss="modal">
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="p-4 text-center">
                  <p>Bạn chắc chắn muốn xóa bản ghi này chứ?</p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  data-dismiss="modal"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => this.handleDeleteQuestionApi()}
                  className="btn btn-danger"
                  data-dismiss="modal"
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          id="delete-group-question"
          className="modal fade"
          data-backdrop="true"
          style={{ display: "none" }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog animate fade-down"
            data-classname="fade-down"
          >
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title text-md">Thông báo</div>
                <button className="close" data-dismiss="modal">
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="p-4 text-center">
                  <p>Bạn chắc chắn muốn xóa nhóm câu hỏi này chứ?</p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  data-dismiss="modal"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => this.handleDeleteGroupQuestionApi()}
                  className="btn btn-danger"
                  data-dismiss="modal"
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </div>

        {this.state.showConfigModal && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={this.closeExamConfigModal}
            ></div>
            <div
              className="modal show d-block"
              tabIndex="-1"
              onClick={this.closeExamConfigModal}
            >
              <div
                className="modal-dialog animate fade-down modal-lg"
                data-classname="fade-down"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <div
                      className="modal-title text-md"
                      style={{ fontWeight: 700 }}
                    >
                      Cấu hình đề thi
                    </div>
                    <button
                      className="close"
                      onClick={this.closeExamConfigModal}
                    >
                      ×
                    </button>
                  </div>
                  <div
                    className="modal-body"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <div className="card border rounded">
                      <div className="p-3 border-bottom">
                        <h3
                          className="m-0"
                          style={{ fontSize: 14, fontWeight: 600 }}
                        >
                          Chia điểm theo từng phần thi
                        </h3>
                      </div>
                      <div className="p-3">
                        <div className="text-muted" style={{ fontSize: 13 }}>
                          Nhập tổng điểm cho mỗi phần; hệ thống sẽ tính Điểm mỗi
                          câu dựa trên số câu đã có.
                        </div>
                        {(Array.isArray(this.state.sections)
                          ? this.state.sections
                          : []
                        ).map((s, idx) => {
                          const scoreStr =
                            this.state.scorePerPart?.[idx] ??
                            String(Number(s?.score || 0));

                          const totalQuestions =
                            s.type === "NHOM_CHU_DE"
                              ? (s.groupTopics || []).reduce((count, g) => {
                                return (
                                  count +
                                  (g.subjects || []).reduce(
                                    (subCount, subj) => {
                                      return (
                                        subCount +
                                        (subj.questions || []).filter(
                                          (q) => q.type !== "cluster",
                                        ).length
                                      );
                                    },
                                    0,
                                  )
                                );
                              }, 0)
                              : (s.questions || []).filter(
                                (q) => q.type !== "cluster",
                              ).length;
                          const subSectionCount = (s.childExam || []).reduce(
                            (count, sub) => {
                              return (
                                count +
                                (sub.questions || []).filter(
                                  (q) => q.type !== "cluster",
                                ).length
                              );
                            },
                            0,
                          );

                          const finalTotal = totalQuestions + subSectionCount;
                          const perQuestionScore =
                            finalTotal > 0
                              ? (parseFloat(scoreStr) / finalTotal).toFixed(2)
                              : 0;

                          return (
                            <div
                              key={(s.id || s.title || idx) + "_row"}
                              className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between py-2 border-top"
                            >
                              <div
                                className="flex-grow-1 mr-md-3"
                                style={{ minWidth: 0 }}
                              >
                                <label
                                  className="mb-1"
                                  style={{ fontSize: 13, fontWeight: 700 }}
                                >
                                  Tiêu đề phần
                                </label>
                                <input
                                  className="form-control"
                                  aria-label={`Tiêu đề cho Phần ${idx + 1}`}
                                  defaultValue={
                                    this.state.titlePerPart?.[idx] ??
                                    (s?.title || `Phần ${idx + 1}`)
                                  }
                                  onBlur={(e) =>
                                    this.handlePartTitleChange(
                                      idx,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Nhập tên phần thi"
                                  style={{ fontWeight: 500 }}
                                />
                              </div>

                              <div
                                className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center mt-2 mt-md-0"
                                style={{ gap: 12 }}
                              >
                                <div>
                                  <label
                                    className="mb-1"
                                    style={{ fontSize: 12, fontWeight: 700 }}
                                  >
                                    TỔNG ĐIỂM
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control text-center"
                                    value={
                                      this.state.scorePerPart?.[idx] ?? scoreStr
                                    }
                                    onChange={(e) => {
                                      this.handleScorePerPartChange(
                                        idx,
                                        e.target.value,
                                      );
                                    }}
                                    style={{ width: 140 }}
                                  />
                                </div>

                                <div>
                                  <label
                                    className="mb-1"
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      letterSpacing: 0.5,
                                    }}
                                  >
                                    TỔNG SỐ CÂU
                                  </label>
                                  <input
                                    className="form-control text-center"
                                    readOnly
                                    value={finalTotal}
                                    style={{
                                      width: 140,
                                      background: "#f7f7f7",
                                    }}
                                  />
                                </div>

                                <div>
                                  <label
                                    className="mb-1"
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      letterSpacing: 0.5,
                                    }}
                                  >
                                    ĐIỂM TỪNG CÂU
                                  </label>
                                  <input
                                    className="form-control text-center"
                                    readOnly
                                    value={perQuestionScore}
                                    style={{
                                      width: 140,
                                      background: "#f7f7f7",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="card border rounded mt-3">
                      <div className="p-3 border-bottom">
                        <h3
                          className="m-0"
                          style={{ fontSize: 14, fontWeight: 600 }}
                        >
                          Thời gian thi
                        </h3>
                      </div>
                      <div
                        className="p-3"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          {/* Chế độ thời gian */}
                          <div
                            className="d-flex align-items-center"
                            style={{ gap: 12 }}
                          >
                            <label
                              className="m-0"
                              style={{ fontSize: 14, fontWeight: 700 }}
                            >
                              Chế độ thời gian:
                            </label>
                            <div className="d-flex" style={{ gap: 8 }}>
                              {this.state.statusExam === false && (
                                <button
                                  type="button"
                                  className="btn px-3 py-1 text-white"
                                  style={{
                                    backgroundColor: "rgb(249,115,22)",
                                    borderColor: "rgb(249,115,22)",
                                    pointerEvents: "none", // chặn click
                                    opacity: 1, // giữ nguyên màu (không bị mờ như disabled)
                                  }}
                                >
                                  Tổng
                                </button>
                              )}
                              {this.state.statusExam === true && (
                                <button
                                  type="button"
                                  className="btn px-3 py-1 text-white"
                                  style={{
                                    backgroundColor: "rgb(249,115,22)",
                                    borderColor: "rgb(249,115,22)",
                                    pointerEvents: "none",
                                    opacity: 1,
                                  }}
                                >
                                  Theo phần
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Chống gian lận */}
                          <div
                            className="d-flex align-items-center"
                            style={{ gap: 12 }}
                          >
                            <label
                              className="m-0"
                              style={{ fontSize: 14, fontWeight: 700 }}
                            >
                              Chống gian lận
                            </label>
                            <label className="switch m-0">
                              <input
                                type="checkbox"
                                value={this.state.e_cheating}
                                checked={this.state.e_cheating}
                                onChange={(e) => {
                                  this.setState({
                                    e_cheating: e.target.checked,
                                  });
                                }}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>

                        {/* Nội dung nhập thời gian */}
                        <div>
                          {this.state.statusExam === false ? (
                            <div
                              className="d-flex align-items-center"
                              style={{ gap: 12 }}
                            >
                              <label
                                className="m-0"
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  minWidth: 150,
                                }}
                              >
                                Tổng thời gian (phút):
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                style={{ maxWidth: 120 }}
                                value={this.state.time || ""}
                                onChange={(e) =>
                                  this.setState({ time: e.target.value })
                                }
                              />
                            </div>
                          ) : (
                            <div
                              className="d-flex flex-column"
                              style={{ gap: 12 }}
                            >
                              {this.state.sections?.map((section, idx) => (
                                <div
                                  key={section.id || idx}
                                  className="d-flex align-items-center"
                                  style={{ gap: 12 }}
                                >
                                  <label
                                    className="m-0"
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      minWidth: 150,
                                    }}
                                  >
                                    {section.title ||
                                      section.name ||
                                      `Phần ${idx + 1}`}
                                    :
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    style={{ maxWidth: 120 }}
                                    value={section.time || ""}
                                    onChange={(e) => {
                                      const newSections = [
                                        ...this.state.sections,
                                      ];
                                      newSections[idx] = {
                                        ...newSections[idx],
                                        time: e.target.value,
                                      };
                                      this.setState({ sections: newSections });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="card border rounded mt-3">
                      <div className="p-3 border-bottom">
                        <h3
                          className="m-0"
                          style={{ fontSize: 14, fontWeight: 600 }}
                        >
                          Quà tặng
                        </h3>
                      </div>
                      <div
                        className="p-3"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          {/* Chống gian lận */}
                          <div
                            className="d-flex align-items-center"
                            style={{ gap: 12 }}
                          >
                            <label
                              className="m-0"
                              style={{ fontSize: 14, fontWeight: 700 }}
                            >
                              Kích hoạt quà tặng<br></br>
                              <span style={{ fontSize: 12, fontWeight: 300 }}>
                                Bật để cho phép gán quà tặng cho đề thi
                              </span>
                            </label>
                            <label className="switch m-0">
                              <input
                                type="checkbox"
                                value={this.state.fastGiftStatus}
                                checked={this.state.fastGiftStatus}
                                onChange={(e) => {
                                  this.setState({
                                    fastGiftStatus: e.target.checked,
                                    fastGifts_id: null,
                                  });
                                }}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>
                        {this.state.fastGiftStatus && (
                          <div>
                            <label
                              className="m-0"
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                paddingBottom: 8,
                              }}
                            >
                              Danh sách quà tặng
                            </label>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {this.props.fastgifts &&
                                this.props.fastgifts.map((gift) => (
                                  <label
                                    key={gift._id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      cursor: "pointer",
                                      fontWeight: 600,
                                      background:
                                        this.state.fastGifts_id === gift._id
                                          ? "linear-gradient(135deg, #fb923c, #f97316)"
                                          : "#ffffff",
                                      color:
                                        this.state.fastGifts_id === gift._id
                                          ? "#fff"
                                          : "#111827",
                                      padding: "14px 16px",
                                      borderRadius: 12,
                                      border:
                                        this.state.fastGifts_id === gift._id
                                          ? "none"
                                          : "1px solid #e5e7eb",
                                      boxShadow:
                                        this.state.fastGifts_id === gift._id
                                          ? "0 10px 20px rgba(249,115,22,0.35)"
                                          : "0 2px 6px rgba(0,0,0,0.05)",
                                      transition: "all 0.25s ease",
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name="fastGift"
                                      value={gift._id}
                                      checked={
                                        this.state.fastGifts_id === gift._id
                                      }
                                      onChange={(e) =>
                                        this.setState({
                                          fastGifts_id: e.target.value,
                                        })
                                      }
                                      style={{
                                        appearance: "none",
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        border:
                                          this.state.fastGifts_id === gift._id
                                            ? "5px solid #fff"
                                            : "2px solid #9ca3af",
                                        backgroundColor:
                                          this.state.fastGifts_id === gift._id
                                            ? "#fff"
                                            : "transparent",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                      }}
                                    />

                                    <span style={{ flex: 1 }}>{gift.name}</span>

                                    {/* {this.state.fastGifts_id === gift._id && (
                                    <span
                                      style={{
                                        fontSize: 12,
                                        background: 'rgba(255,255,255,0.25)',
                                        padding: '4px 10px',
                                        borderRadius: 999,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Đã chọn
                                    </span>
                                  )} */}
                                  </label>
                                ))}
                            </div>
                            <span>
                              Chọn một quà tặng để gán cho đề thi khi kích hoạt.
                            </span>
                          </div>
                        )}
                        {!this.state.fastGiftStatus && (
                          <div>
                            <span>Quà tặng chưa được kích hoạt. </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-light"
                      onClick={this.closeExamConfigModal}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={this.saveExamConfig}
                    >
                      Lưu cấu hình
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div
          className="block-action-footer justify-content-center mt-2 m-0"
          style={{ display: "none" }}
        >
          <button
            type="button"
            className="btn btn-info mr-2"
            data-toggle="modal"
            data-target="#create"
            id="create-update"
            data-toggle-class="fade-down"
            data-toggle-class-target=".animate"
            title="Trắc nghiệm"
          >
            <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
            Trắc nghiệm
          </button>

          <button
            type="button"
            className="btn btn-info mr-2"
            data-toggle="modal"
            data-target="#create2"
            id="create-update2"
            data-toggle-class="fade-down"
            data-toggle-class-target=".animate"
            title="Trắc nghiệm đúng sai"
          >
            <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
            Trắc nghiệm đúng sai
          </button>

          <button
            id="create-update3"
            type="button"
            className="btn btn-info mr-2"
            data-toggle="modal"
            data-target="#create3"
            data-toggle-class="fade-down"
            data-toggle-class-target=".animate"
          >
            <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
            Điền số/Trả lời ngắn
          </button>

          <button
            id="create-update4"
            type="button"
            className="btn btn-info mr-2"
            data-toggle="modal"
            data-target="#create4"
            data-toggle-class="fade-down"
            data-toggle-class-target=".animate"
          >
            <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
            Kéo thả
          </button>

          <button
            id="create-update5"
            type="button"
            className="btn btn-info mr-2"
            data-toggle="modal"
            data-target="#create5"
            data-toggle-class="fade-down"
            data-toggle-class-target=".animate"
          >
            <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
            TN nhiều đáp án
          </button>

          <button
            id="create-update6"
            type="button"
            className="btn btn-info mr-2"
            data-toggle="modal"
            data-target="#create6"
            data-toggle-class="fade-down"
            data-toggle-class-target=".animate"
          >
            <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
            Đúng/sai
          </button>

          <button
            id="create-update7"
            type="button"
            className="btn btn-info mr-2"
            data-toggle="modal"
            data-target="#create7"
            data-toggle-class="fade-down"
            data-toggle-class-target=".animate"
          >
            <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
            Câu hỏi chùm
          </button>
          {/* Repeat similar buttons for other actions */}
        </div>

        {this.state.showAddSubSectionModal && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={this.closeAddSubSectionModal}
            ></div>
            <div
              className="modal show d-block"
              tabIndex="-1"
              onClick={this.closeAddSubSectionModal}
            >
              <div
                className="modal-dialog animate fade-down"
                data-classname="fade-down"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <div
                      className="modal-title text-md"
                      style={{ fontWeight: 700 }}
                    >
                      Thêm phần thi con
                    </div>
                    <button
                      className="close"
                      onClick={this.closeAddSubSectionModal}
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="text-form-label">
                        Tên phần thi con
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={this.state.subSectionName}
                        onChange={(e) =>
                          this.setState({ subSectionName: e.target.value })
                        }
                        placeholder="Nhập tên phần thi con"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-light"
                      onClick={this.closeAddSubSectionModal}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={this.saveSubSection}
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ✅ THÊM: Modal chọn loại câu hỏi từ ExamCreate */}
        {this.state.showChildQuestionTypeModal && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={this.closeChildQuestionTypeModal}
            ></div>
            <div
              className="modal show d-block"
              tabIndex="-1"
              onClick={this.closeChildQuestionTypeModal}
            >
              <div
                className="modal-dialog animate fade-down"
                data-classname="fade-down"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <div
                      className="modal-title text-md"
                      style={{ fontWeight: 700 }}
                    >
                      Chọn loại câu hỏi con
                    </div>
                    <button
                      className="close"
                      onClick={this.closeChildQuestionTypeModal}
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="question-type-group">
                      <button
                        className="btn btn-info btn-sm mr-2 mb-2"
                        onClick={() => {
                          const updatedQuestion = {
                            ...this.state.currentQuestionvalue,
                            type: "SINGLECHOICE",
                          };
                          this.setState(
                            { currentQuestionvalue: updatedQuestion },
                            () => {
                              this.handleOpenModalUpdateQuestion(
                                updatedQuestion,
                              );
                              this.closeChildQuestionTypeModal();
                            },
                          );
                        }}
                      >
                        Trắc nghiệm
                      </button>
                      <button
                        className="btn btn-info btn-sm mr-2 mb-2"
                        onClick={() => {
                          const updatedQuestion = {
                            ...this.state.currentQuestionvalue,
                            type: "TRUEFALSEMULTI",
                          };
                          this.setState(
                            { currentQuestionvalue: updatedQuestion },
                            () => {
                              this.handleOpenModalUpdateQuestion(
                                updatedQuestion,
                              );
                              this.closeChildQuestionTypeModal();
                            },
                          );
                        }}
                      >
                        Trắc nghiệm đúng sai
                      </button>
                      <button
                        className="btn btn-info btn-sm mr-2 mb-2"
                        onClick={() => {
                          const updatedQuestion = {
                            ...this.state.currentQuestionvalue,
                            type: "FILLINBLANK",
                          };
                          this.setState(
                            { currentQuestionvalue: updatedQuestion },
                            () => {
                              this.handleOpenModalUpdateQuestion(
                                updatedQuestion,
                              );
                              this.closeChildQuestionTypeModal();
                            },
                          );
                        }}
                      >
                        Điền số/trả lời ngắn
                      </button>
                      <button
                        className="btn btn-info btn-sm mr-2 mb-2"
                        onClick={() => {
                          const updatedQuestion = {
                            ...this.state.currentQuestionvalue,
                            type: "DRAGDROP",
                          };
                          this.setState(
                            { currentQuestionvalue: updatedQuestion },
                            () => {
                              this.handleOpenModalUpdateQuestion(
                                updatedQuestion,
                                this.state.currentSubSectionId,
                              );
                              this.closeChildQuestionTypeModal();
                            },
                          );
                        }}
                      >
                        Kéo thả
                      </button>
                      <button
                        className="btn btn-info btn-sm mr-2 mb-2"
                        onClick={() => {
                          const updatedQuestion = {
                            ...this.state.currentQuestionvalue,
                            type: "MULTIPLECHOICE",
                          };
                          this.setState(
                            { currentQuestionvalue: updatedQuestion },
                            () => {
                              this.handleOpenModalUpdateQuestion(
                                updatedQuestion,
                                this.state.currentSubSectionId,
                              );
                              this.closeChildQuestionTypeModal();
                            },
                          );
                        }}
                      >
                        Trắc nghiệm nhiều đáp án
                      </button>
                      <button
                        className="btn btn-info btn-sm mr-2 mb-2"
                        onClick={() => {
                          const updatedQuestion = {
                            ...this.state.currentQuestionvalue,
                            type: "TRUEFALSE",
                          };
                          this.setState(
                            { currentQuestionvalue: updatedQuestion },
                            () => {
                              this.handleOpenModalUpdateQuestion(
                                updatedQuestion,
                                this.state.currentSubSectionId,
                              );
                              this.closeChildQuestionTypeModal();
                            },
                          );
                        }}
                      >
                        Đúng/Sai
                      </button>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-light"
                      onClick={this.closeChildQuestionTypeModal}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ✅ THÊM: Modal đánh số câu hỏi */}
        {this.state.showRenumberModal && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={this.closeRenumberModal}
            ></div>
            <div
              className="modal show d-block"
              tabIndex="-1"
              onClick={this.closeRenumberModal}
            >
              <div
                className="modal-dialog animate fade-down"
                data-classname="fade-down"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <div
                      className="modal-title text-md"
                      style={{ fontWeight: 700 }}
                    >
                      Đánh số câu hỏi
                    </div>
                    <button className="close" onClick={this.closeRenumberModal}>
                      ×
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="text-form-label">
                        Số thứ tự bắt đầu{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={this.state.renumberStartingNumber}
                        onChange={(e) =>
                          this.setState({
                            renumberStartingNumber: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        placeholder="Nhập số bắt đầu"
                      />
                    </div>
                    <small className="form-text text-muted">
                      Tất cả câu hỏi trong bảng sẽ được đánh số lại từ giá trị
                      này
                    </small>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-light"
                      onClick={this.closeRenumberModal}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={this.applyRenumber}
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preview Modal */}
        {this.state.showPreviewModal && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={this.closePreviewModal}
            ></div>
            <div
              className="modal show d-block"
              tabIndex="-1"
              onClick={this.closePreviewModal}
            >
              <div
                className="modal-dialog animate fade-down"
                style={{ maxWidth: "1200px", width: "95%" }}
                data-classname="fade-down"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <div
                      className="modal-title text-md"
                      style={{ fontWeight: 700 }}
                    >
                      Xem trước phần thi
                    </div>
                    <button className="close" onClick={this.closePreviewModal}>
                      ×
                    </button>
                  </div>
                  <div
                    className="modal-body"
                    style={{
                      maxHeight: "calc(70vh + 150px)",
                      overflowY: "auto",
                    }}
                  >
                    {!this.state.renderPreview ? (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="sr-only">Đang tải...</span>
                        </div>
                        <p style={{ marginTop: "16px", color: "#666" }}>
                          Đang chuẩn bị nội dung xem trước...
                        </p>
                      </div>
                    ) : (
                      this.state.previewData && (
                        <div className="preview-content">
                          <h3 style={{ marginBottom: "8px" }}>
                            {this.state.previewData.exam_section_name}
                          </h3>
                          {(() => {
                            let totalQuestions = 0;
                            // Câu hỏi trong phần chính
                            if (
                              Array.isArray(this.state.previewData.questions)
                            ) {
                              totalQuestions +=
                                this.state.previewData.questions.length;
                            }
                            // Câu hỏi trong các phần thi con (childExam)
                            if (
                              Array.isArray(this.state.previewData.childExam)
                            ) {
                              this.state.previewData.childExam.forEach((se) => {
                                if (Array.isArray(se.questions)) {
                                  totalQuestions += se.questions.length;
                                }
                              });
                            }
                            // Câu hỏi trong subSections (nếu có)
                            if (
                              Array.isArray(this.state.previewData.subSections)
                            ) {
                              this.state.previewData.subSections.forEach(
                                (se) => {
                                  if (Array.isArray(se.questions)) {
                                    totalQuestions += se.questions.length;
                                  }
                                },
                              );
                            }
                            // Câu hỏi trong NHOM_CHU_DE
                            if (
                              Array.isArray(this.state.previewData.groupTopic)
                            ) {
                              this.state.previewData.groupTopic.forEach(
                                (group) => {
                                  if (Array.isArray(group.subjects)) {
                                    group.subjects.forEach((subject) => {
                                      if (Array.isArray(subject.questions)) {
                                        totalQuestions +=
                                          subject.questions.length;
                                      }
                                    });
                                  }
                                },
                              );
                            }
                            return (
                              <p
                                style={{ marginBottom: "20px", color: "#666" }}
                              >
                                <strong>Loại phần thi:</strong>{" "}
                                {this.renderQuestionType(
                                  this.state.previewData.exam_section_type,
                                )}
                                {totalQuestions > 0 && (
                                  <span>
                                    {" "}
                                    |{" "}
                                    <strong>
                                      Tổng số câu hỏi (kể cả câu hỏi chùm) :
                                    </strong>{" "}
                                    {totalQuestions}
                                  </span>
                                )}
                                {this.state.previewData.exam_section_type ===
                                  "NHOM_CHU_DE" &&
                                  Array.isArray(
                                    this.state.previewData.groupTopic,
                                  ) && <span></span>}
                              </p>
                            );
                          })()}

                          {/* Hiển thị toàn bộ câu hỏi */}
                          {(() => {
                            let questionsToDisplay = [];
                            // Phần chính
                            if (
                              Array.isArray(this.state.previewData.questions) &&
                              this.state.previewData.questions.length > 0
                            ) {
                              questionsToDisplay = questionsToDisplay.concat(
                                this.state.previewData.questions,
                              );
                            }
                            // Phần thi con (childExam: mỗi phần có mảng questions trực tiếp)
                            if (
                              Array.isArray(this.state.previewData.childExam)
                            ) {
                              this.state.previewData.childExam.forEach(
                                (child) => {
                                  if (
                                    Array.isArray(child.questions) &&
                                    child.questions.length > 0
                                  ) {
                                    questionsToDisplay =
                                      questionsToDisplay.concat(
                                        child.questions,
                                      );
                                  }
                                },
                              );
                            }
                            // subSections (nếu có)
                            if (
                              Array.isArray(this.state.previewData.subSections)
                            ) {
                              this.state.previewData.subSections.forEach(
                                (sub) => {
                                  if (
                                    Array.isArray(sub.questions) &&
                                    sub.questions.length > 0
                                  ) {
                                    questionsToDisplay =
                                      questionsToDisplay.concat(sub.questions);
                                  }
                                },
                              );
                            }
                            // NHOM_CHU_DE (groupTopic)
                            if (
                              this.state.previewData.exam_section_type ===
                              "NHOM_CHU_DE" &&
                              Array.isArray(this.state.previewData.groupTopic)
                            ) {
                              this.state.previewData.groupTopic.forEach(
                                (group) => {
                                  if (Array.isArray(group.subjects)) {
                                    group.subjects.forEach((subject) => {
                                      if (Array.isArray(subject.questions)) {
                                        questionsToDisplay =
                                          questionsToDisplay.concat(
                                            subject.questions,
                                          );
                                      }
                                    });
                                  }
                                },
                              );
                            }

                            return questionsToDisplay.length > 0 ? (
                              <div className="questions-preview">
                                <h4
                                  style={{
                                    marginBottom: "16px",
                                    borderBottom: "2px solid #007bff",
                                    paddingBottom: "8px",
                                  }}
                                >
                                  Chi tiết câu hỏi (kể cả câu hỏi chùm)
                                </h4>
                                {questionsToDisplay.map((q, idx) => {
                                  const qNum =
                                    q.number || q.question_no || idx + 1;
                                  const qType = this.renderQuestionType(q.type);
                                  const qLevel = this.renderQuestionLevel(q);
                                  const correctAns =
                                    q.correctAnswers || q.answer || [];
                                  const hasChoices =
                                    Array.isArray(q.choices) &&
                                    q.choices.length > 0;

                                  return (
                                    <div
                                      key={q._id || q.question_id || idx}
                                      style={{
                                        marginBottom: "16px",
                                        padding: "16px",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "6px",
                                        backgroundColor: "#f9f9f9",
                                      }}
                                    >
                                      {/* Câu hỏi header */}
                                      <div
                                        style={{
                                          marginBottom: "12px",
                                          display: "flex",
                                          alignItems: "flex-start",
                                          gap: "12px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            minWidth: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#007bff",
                                            color: "white",
                                            borderRadius: "50%",
                                            fontWeight: "bold",
                                            fontSize: "14px",
                                          }}
                                        >
                                          {qNum}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <div
                                            style={{
                                              marginBottom: "6px",
                                              color: "#666",
                                              fontSize: "12px",
                                            }}
                                          >
                                            <span
                                              className="badge badge-info"
                                              style={{ marginRight: "8px" }}
                                            >
                                              {qType}
                                            </span>
                                            {qLevel && (
                                              <span className="badge badge-warning">
                                                {qLevel}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Nội dung câu hỏi */}
                                      <div
                                        style={{
                                          marginBottom: "12px",
                                          padding: "12px",
                                          backgroundColor: "white",
                                          borderLeft: "3px solid #007bff",
                                          borderRadius: "4px",
                                          lineHeight: 1.6,
                                          color: "#333",
                                        }}
                                      >
                                        {q.rawHtml ? (
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                this.processLatexInContent(
                                                  q.rawHtml,
                                                ),
                                            }}
                                          />
                                        ) : (
                                          <span
                                            style={{
                                              color: "#999",
                                              fontStyle: "italic",
                                            }}
                                          >
                                            Chưa có nội dung
                                          </span>
                                        )}
                                      </div>

                                      {/* Các lựa chọn (nếu có) */}
                                      {hasChoices && (
                                        <div style={{ marginBottom: "12px" }}>
                                          <strong
                                            style={{
                                              fontSize: "13px",
                                              color: "#333",
                                            }}
                                          >
                                            Các lựa chọn:
                                          </strong>
                                          <div style={{ marginTop: "8px" }}>
                                            {q.choices.map((choice, cIdx) => {
                                              const isCorrect =
                                                Array.isArray(correctAns) &&
                                                correctAns.includes(
                                                  choice.label ||
                                                  choice.value ||
                                                  choice.text,
                                                );
                                              const isCorrectAnswer =
                                                Array.isArray(correctAns) &&
                                                correctAns.some(
                                                  (ans) =>
                                                    ans === choice.label ||
                                                    ans === choice.value ||
                                                    ans === choice.text,
                                                );

                                              return (
                                                <div
                                                  key={cIdx}
                                                  style={{
                                                    padding: "8px 12px",
                                                    marginBottom: "6px",
                                                    backgroundColor: isCorrect
                                                      ? "#e8f5e9"
                                                      : "#f5f5f5",
                                                    border: isCorrect
                                                      ? "1px solid #4caf50"
                                                      : "1px solid #ddd",
                                                    borderRadius: "4px",
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "8px",
                                                  }}
                                                >
                                                  <span
                                                    style={{
                                                      minWidth: "24px",
                                                      fontWeight: "bold",
                                                      color: isCorrect
                                                        ? "#4caf50"
                                                        : "#666",
                                                    }}
                                                  >
                                                    {choice.label}:
                                                  </span>
                                                  <div
                                                    style={{
                                                      flex: 1,
                                                      color: isCorrect
                                                        ? "#2e7d32"
                                                        : "#333",
                                                    }}
                                                  >
                                                    {/* Render HTML content (including images) */}
                                                    {choice.rawHtml ||
                                                      choice.content ? (
                                                      <span
                                                        dangerouslySetInnerHTML={{
                                                          __html:
                                                            this.processLatexInContent(
                                                              choice.rawHtml ||
                                                              choice.content,
                                                            ),
                                                        }}
                                                      />
                                                    ) : (
                                                      <span
                                                        dangerouslySetInnerHTML={{
                                                          __html:
                                                            this.processLatexInContent(
                                                              choice.text ||
                                                              choice.value,
                                                            ),
                                                        }}
                                                      />
                                                    )}
                                                    {isCorrect && (
                                                      <span
                                                        style={{
                                                          marginLeft: "8px",
                                                          color: "#4caf50",
                                                          fontWeight: "bold",
                                                        }}
                                                      >
                                                        ✓ Đáp án đúng
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {/* Đáp án (nếu không có choices) */}
                                      {!hasChoices && (
                                        <div style={{ marginBottom: "12px" }}>
                                          <strong
                                            style={{
                                              fontSize: "13px",
                                              color: "#333",
                                            }}
                                          >
                                            Đáp án đúng:
                                          </strong>
                                          <div
                                            style={{
                                              marginTop: "6px",
                                              padding: "10px",
                                              backgroundColor: "#e8f5e9",
                                              border: "1px solid #4caf50",
                                              borderRadius: "4px",
                                              color: "#2e7d32",
                                            }}
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                this.processLatexInContent(
                                                  this.getAnswerDisplay(
                                                    correctAns,
                                                    q,
                                                  ),
                                                ) ||
                                                '<span style="color: #999">Chưa có đáp án</span>',
                                            }}
                                          />
                                        </div>
                                      )}

                                      {/* Giải thích (nếu có) */}
                                      {q.explanation && (
                                        <div
                                          style={{
                                            padding: "10px",
                                            backgroundColor: "#fff3e0",
                                            border: "1px solid #ff9800",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          <strong
                                            style={{
                                              color: "#e65100",
                                              fontSize: "12px",
                                            }}
                                          >
                                            Giải thích:
                                          </strong>
                                          <span
                                            style={{
                                              margin: "6px 0 0 0",
                                              color: "#666",
                                              fontSize: "13px",
                                              display: "block",
                                            }}
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                this.processLatexInContent(
                                                  q.explanation,
                                                ),
                                            }}
                                          />
                                        </div>
                                      )}

                                      {/* Video link (nếu có) */}
                                      {(q.video || q.video_link) && (
                                        <div
                                          style={{
                                            marginTop: "12px",
                                            fontSize: "12px",
                                            color: "#666",
                                          }}
                                        >
                                          <strong>Video:</strong>{" "}
                                          <span style={{ color: "#0066cc" }}>
                                            Có video hỗ trợ
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-muted">Chưa có câu hỏi nào</p>
                            );
                          })()}

                          {/* Hiển thị GroupTopic nếu là loại NHOM_CHU_DE */}
                          {this.state.previewData.exam_section_type ===
                            "NHOM_CHU_DE" &&
                            Array.isArray(this.state.previewData.groupTopic) &&
                            this.state.previewData.groupTopic.length > 0 && (
                              <div
                                className="group-topic-preview"
                                style={{
                                  marginTop: "24px",
                                  paddingTop: "20px",
                                  borderTop: "2px solid #ddd",
                                }}
                              >
                                <h4 style={{ marginBottom: "12px" }}>
                                  Nhóm chủ đề (
                                  {this.state.previewData.groupTopic.length})
                                </h4>
                                {this.state.previewData.groupTopic.map(
                                  (group, gIdx) => (
                                    <div
                                      key={gIdx}
                                      style={{
                                        marginBottom: "15px",
                                        padding: "12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        backgroundColor: "#fafafa",
                                      }}
                                    >
                                      <h5
                                        style={{
                                          marginBottom: "8px",
                                          color: "#333",
                                        }}
                                      >
                                        {group.name || `Nhóm ${gIdx + 1}`}
                                      </h5>
                                      {Array.isArray(group.subjects) &&
                                        group.subjects.map((subject, sIdx) => (
                                          <div
                                            key={sIdx}
                                            style={{
                                              marginLeft: "16px",
                                              marginBottom: "8px",
                                              fontSize: "13px",
                                            }}
                                          >
                                            <strong>
                                              {subject.name ||
                                                `Môn học ${sIdx + 1}`}
                                            </strong>
                                            <span
                                              style={{
                                                marginLeft: "8px",
                                                color: "#666",
                                              }}
                                            >
                                              (
                                              {Array.isArray(subject.questions)
                                                ? subject.questions.length
                                                : 0}{" "}
                                              câu)
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  mergePartsWithUpload(rawPartsFromTabData, uploadParts) {
    const merged = [...rawPartsFromTabData]; // Bắt đầu với dữ liệu mới nhất

    uploadParts.forEach((uploadPart, idx) => {
      const existingPart = merged.find((p) => {
        if (p.id && uploadPart.id && p.id === uploadPart.id) return true;
        if (p.name === uploadPart.name) return true;
        if (merged.length === uploadParts.length && merged.indexOf(p) === idx)
          return true;

        return false;
      });

      if (existingPart) {
        existingPart.id = existingPart.id || uploadPart.id;
        if (!existingPart.uploadMetadata && uploadPart.uploadMetadata) {
          existingPart.uploadMetadata = uploadPart.uploadMetadata;
        }
      } else {
        const shouldAddUploadPart =
          merged.length < uploadParts.length ||
          !merged.some((p) => {
            const normalizedMergedName = p.name
              ?.toLowerCase()
              .replace(/[^\w]/g, "");
            const normalizedUploadName = uploadPart.name
              ?.toLowerCase()
              .replace(/[^\w]/g, "");
            return normalizedMergedName === normalizedUploadName;
          });

        if (shouldAddUploadPart) {
          merged.push({
            ...uploadPart,
            source: "upload",
          });
        } else {
        }
      }
    });

    return merged;
  }
  syncTabDataWithParts() {
    const updatedParts = this.buildPartsPayload();
    this.setState({ parts: updatedParts });
  }
  generateObjectId() {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const random = Math.random().toString(16).substr(2, 15);
    return (timestamp + random).substr(0, 24);
  }
}
function mapStateToProps(state) {
  return {
    subjects: state.subject.subjects,
    token: state.auth.token, // questions: state.question.questions,
    configs: state.category.configs,
    chapter_ids: state.category.chapter_ids,
    exam: state.examV2.exam,
    detail: state.exam.detail,
    section: state.examV2.section,
    examCategories: state.examWordCategory.examCategories,
    examTestCategories: state.examWordTestCategory.examCategories,
    examCategory: state.examWordCategory.examCategory,
    detail: state.examWord.detail,
    exams: state.examWord.examwords,
    fastgifts: state.fastGift.fastgifts,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      listSubject,
      listExamCategory,
      showExamCategory,
      listExamTestCategory,
      createExamWord,
      updateExamWord,
      getExamWordDetail,
      listExamWord,
      listGift,
      exportWord
    },
    dispatch,
  );
}

let ExamsCreateContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ExamWordEdit),
);

export default ExamsCreateContainer;
