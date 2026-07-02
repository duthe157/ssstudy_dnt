import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import $ from "jquery";
import { listSubject } from "../../redux/subject/action";
import {
  createExam,
  createQuestion,
  createSection,
  deleteGroup,
  deleteQuestion,
  deleteSection,
  detailExam,
  updateExam,
  updateGroupQuestionf,
  updateQuestion,
  updateSection,
} from "../../redux/examv2/action";
import {
  listExamCategory,
  showExamCategory,
} from "../../redux/examwordcategory/action";
import { listGift } from "../../redux/fastGift/action";
import { listExamTestCategory } from "../../redux/examwordtestcategory/action";
import baseHelpers from "../../helpers/BaseHelpers";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ModalQuestion1 from "./ModalQuestion1";
import ModalQuestion2 from "./ModalQuestion2";
import ModalQuestion3 from "./ModalQuestion3";
import ModalQuestion4 from "./ModalQuestion4";
import ModalQuestion5 from "./ModalQuestion5";
import ModalQuestion6 from "./ModalQuestion6";
import ModalQuestion7 from "./ModalQuestion7";
import ModalGroupQuestion from "./ModalGroupQuestion";
import { setLoader } from "../LoadingContext";
import { notification, Modal } from "antd";
import queryString from "query-string";
import { uploadWordFile } from "../../redux/file/action";
import {
  createExamWord,
  updateExamWord,
  listExamWord,
} from "../../redux/examword/action";
import { baseURL } from "../../config/config";
import katex from "katex";
import renderMathInElement from "katex/dist/contrib/auto-render";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn';
import RenumberLogic from "./RenumberQuestionsLogic";
import QuestionNumberingService from "./QuestionNumberingService";
import "./RenumberQuestions.css";

class ExamWordCreate extends Component {
  constructor(props) {
    super();

    this.state = {
      e_cheating: false,
      time: 0,
      score: 0,
      pointTrueFalse: false,
      pointTrueFalse1: 10,
      pointTrueFalse2: 25,
      pointTrueFalse3: 50,
      pointTrueFalse4: 100,
      uploaded: false,
      name: "",
      code: "",
      started_at: "",
      finished_at: "",
      keyword: "",
      subject_id: "",
      category_id: "",
      creating_type: "MAC_DINH",
      examQuestions: [],
      questionNo: 1,
      fileData: "",
      doc_type: "GOOGLE_DRIVE",
      group: "MAC_DINH",
      level: null,
      selectedQuestions: [],
      currentQuestionvalue: null,
      type_question: "",
      sectionType: "MAC_DINH",
      exam: null,
      sections: [],
      tabData: [],
      statusTabCreate: true,
      examId: "",
      examSectionId: "",
      examSectionGroupId: "",
      examSectionSubjectId: "",
      newTabName: "",
      typeExam: "",
      linkExam: "",
      linkAnswer: "",
      TN: "TOT_NGHIEP",
      HSA: "HSA",
      APT: "APT",
      TSA: "TSA",
      actionUser: "CREATE",
      deleteQuestionIds: [],
      actionGroup: "create",
      actionQuestion: "create",
      groupDetail: null,
      groups: [],
      isUploaded: false,
      showModal: false,
      showDeleteSectionModal: false,
      showGroupModal: false,
      showConfigModal: false,
      showAddSubSectionModal: false,
      subSectionName: "",
      selectedParentSectionId: null,
      timeMode: "TOTAL",
      timeTotal: 0,
      timePerPart: [],
      scorePerPart: [],
      titlePerPart: [],
      selectedSectionId: null,
      notification: "",
      selectedGroup: null,
      selectedSubject: null,
      apiValidationErrors: [],
      is_redo: false,
      alias: "",
      itemGroupTabData: null,
      examTypeId: "",
      classes: "",
      tp: "",
      currentSubSectionId: null,
      deleteQuestionSubSectionId: null,
      maxGroup: 1,
      groupTopic: [],
      listSubjectGroups: {},
      selectedGroupSubject: "",
      statusTopic: "",
      idSubject: "",
      currentTopicId: "",
      currentSubjectId: "",
      statusExam: "",
      currentClusterId: null,
      expandedClusters: {},
      showChildQuestionTypeModal: false,
      selectedChildParentId: null,
      parentIdInTabData: "",
      childExamId: "",
      editingSectionId: null,
      editingSectionName: "",
      ...RenumberLogic.initialRenumberState,
      isAddingTopicGroup: false,
      _renumberTimestamp: null,
      _forceRenderKey: Date.now(),
      _lastUpdate: null,
      isPracticeConfig: false,
      // Province dropdown state
      allProvinces: [],
      provinceSearchTerm: '',
      showProvinceDropdown: false,
      // Preview modal state
      showPreviewModal: false,
      previewData: null,
      renderPreview: false,
      _isMounted: false,
      fastGiftStatus: false,
      fastGiftId: null,
      isCreating: false,
    };

    // Timeout references để tránh memory leak
    this.previewTimeout = null;
    this.saveSessionTimeout = null;
  }

  toggleExpanded = (questionId) => {
    this.setState(
      (prevState) => ({
        expandedClusters: {
          ...prevState.expandedClusters,
          [questionId]: !prevState.expandedClusters[questionId],
        },
        currentClusterId: !prevState.expandedClusters[questionId]
          ? questionId
          : prevState.currentClusterId,
      }),
      () => { }
    );
  };

  resetCurrentCluster = () => {
    this.setState({ currentClusterId: null });
  };
  handleStartEditSectionName = (sectionId, currentName) => {
    this.setState({
      editingSectionId: sectionId,
      editingSectionName: currentName,
    });
  };

  handleSaveSectionName = () => {
    const { editingSectionId, editingSectionName } = this.state;
    const trimmedName = editingSectionName.trim();

    if (!editingSectionId) {
      this.handleCancelEditSectionName();
      return;
    }

    // Validation: tên không được rỗng
    if (!trimmedName) {
      notification.error({
        message: "Tên phần thi không được để trống",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    // Validation: tên không được quá dài
    if (trimmedName.length > 100) {
      notification.error({
        message: "Tên phần thi không được vượt quá 100 ký tự",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    // Validation: kiểm tra tên trùng lặp
    const isDuplicate = this.state.sections.some(
      (section) =>
        section.id !== editingSectionId && section.title.trim() === trimmedName
    );

    if (isDuplicate) {
      notification.error({
        message: "Tên phần thi đã tồn tại",
        description: "Vui lòng chọn tên khác",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    // Cập nhật tên trong sections
    this.setState(
      (prevState) => {
        const updatedSections = prevState.sections.map((section) =>
          section.id === editingSectionId
            ? { ...section, title: trimmedName }
            : section
        );

        // Cập nhật tên trong tabData
        const updatedTabData = prevState.tabData.map((tab) => {
          // Tìm tab tương ứng với section
          const correspondingSection = updatedSections.find(
            (section) =>
              section.id === `sec-${prevState.tabData.indexOf(tab) + 1}` ||
              tab._id.includes(section.id.split("-").pop())
          );

          if (
            correspondingSection &&
            correspondingSection.id === editingSectionId
          ) {
            return {
              ...tab,
              exam_section_name: trimmedName,
            };
          }
          return tab;
        });

        // Cập nhật titlePerPart để đồng bộ với modal cấu hình
        const sectionIndex = updatedSections.findIndex(
          (section) => section.id === editingSectionId
        );
        const updatedTitlePerPart = [...(prevState.titlePerPart || [])];
        if (sectionIndex !== -1) {
          updatedTitlePerPart[sectionIndex] = trimmedName;
        }

        // Cập nhật parts.name để đồng bộ với upload format
        const updatedParts = (prevState.parts || []).map((part, idx) => {
          if (idx === sectionIndex) {
            return {
              ...part,
              name: trimmedName,
            };
          }
          return part;
        });

        return {
          sections: updatedSections,
          tabData: updatedTabData,
          titlePerPart: updatedTitlePerPart, // Đồng bộ titlePerPart
          parts: updatedParts, // Đồng bộ parts.name
          editingSectionId: null,
          editingSectionName: "",
        };
      },
      () => {
        // Lưu vào session sau khi cập nhật
        this.saveTabDataToSession();

        notification.success({
          message: "Cập nhật tên phần thi thành công",
          placement: "topRight",
          duration: 2,
        });
      }
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

  getSubSectionNames = () => {
    const subSectionNames = {};

    // Lấy từ state (đã lưu khi tạo phần thi con)
    if (this.state.selectedParentSectionId && this.state.subSectionName) {
      subSectionNames[this.state.selectedParentSectionId] =
        this.state.subSectionName;
    }

    // Lấy từ tabData (đã lưu trong sections)
    if (this.state.tabData && Array.isArray(this.state.tabData)) {
      this.state.tabData.forEach((tab, tabIndex) => {
        if (tab.subSections && Array.isArray(tab.subSections)) {
          tab.subSections.forEach((subSection, subIndex) => {
            if (subSection.name) {
              const key = `${tab._id}_sub_${subIndex}`;
              subSectionNames[key] = subSection.name;
            }
          });
        }
      });
    }

    return subSectionNames;
  };



  generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000)
      .toString(16)
      .padStart(8, "0");
    const random = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return timestamp + random;
  };

  classifySectionType = (part) => {
    const classification = {
      type: "MAC_DINH", // mặc định
      confidence: 0,
      groupName: "",
      indicators: [],
      hasSubSections: false, // Flag để đánh dấu có phần thi con
    };

    // Kiểm tra type được trả về từ API trước
    if (part.type) {
      classification.type = part.type;
      classification.confidence = 100;
      classification.indicators.push(
        `API explicitly declares type: ${part.type}`
      );

      // Nếu API trả về MAC_DINH, kiểm tra thêm xem có phần thi con không
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

    // Nếu không có type từ API, phân tích cấu trúc
    const title = Array.isArray(part.name) ? part.name[0] : part.name || "";

    // Kiểm tra từ khóa nhóm chủ đề trước
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

    // Kiểm tra cấu trúc dữ liệu cho nhóm chủ đề (nhiều môn học khác nhau trong cùng subpart)
    if (part.subpart && Array.isArray(part.subpart)) {
      const hasMultipleSubjects = part.subpart.some((subpart) => {
        if (
          subpart.children &&
          Array.isArray(subpart.children) &&
          subpart.children.length > 1
        ) {
          const childNames = subpart.children.map(
            (child) => child.name?.toLowerCase() || ""
          );
          const uniqueNames = [...new Set(childNames)];
          return uniqueNames.length > 1; // Có nhiều môn học khác nhau
        }
        return false;
      });

      if (hasMultipleSubjects) {
        classification.type = "NHOM_CHU_DE";
        classification.confidence = 90;
        classification.indicators.push(
          "Multiple subjects detected in subpart structure"
        );
        return classification;
      }
    }

    // Kiểm tra phần thi con TRONG phần thi mặc định
    const subSectionInfo = this.checkForSubSections(part);
    if (subSectionInfo.hasSubSections) {
      classification.type = "MAC_DINH"; // Vẫn là MAC_DINH
      classification.hasSubSections = true; // Nhưng có phần thi con
      classification.confidence = 85;
      classification.indicators.push(...subSectionInfo.indicators);
      return classification;
    }

    // ✅ MẶC ĐỊNH: Phần thi thường không có gì đặc biệt
    classification.indicators.push(
      "Detected as default section (no specific patterns found)"
    );
    return classification;
  };

  // Method riêng để kiểm tra phần thi con
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

    // Kiểm tra pattern phần thi con: có nhiều subpart với pattern đặc trưng
    let hasNumberPattern = 0;
    let hasSingleChildWithQuestions = 0;
    let hasUniqueNames = 0;

    part.subpart.forEach((subpart, idx) => {
      const subpartName = subpart.name || "";

      // Pattern 1: subpart name có dạng "X.Y TÊN" (1.1 TIẾNG VIỆT, 1.2 TIẾNG ANH)
      if (/^\d+\.\d+\s+/.test(subpartName)) {
        hasNumberPattern++;
      }

      // Pattern 2: mỗi subpart có đúng 1 child với questions
      if (
        subpart.children &&
        Array.isArray(subpart.children) &&
        subpart.children.length === 1 &&
        subpart.children[0].questions &&
        Array.isArray(subpart.children[0].questions)
      ) {
        hasSingleChildWithQuestions++;
      }

      // Pattern 3: tên subpart khác nhau (không giống nhau)
      const isUniqueName =
        part.subpart.filter((sp) => sp.name === subpartName).length === 1;
      if (isUniqueName && subpartName.trim() !== "") {
        hasUniqueNames++;
      }
    });

    // Điều kiện nhận diện phần thi con - ít nhất 70% subpart phải match pattern
    const minRequiredPatterns = Math.ceil(part.subpart.length * 0.7);

    if (
      hasNumberPattern >= minRequiredPatterns ||
      (hasSingleChildWithQuestions >= minRequiredPatterns &&
        hasUniqueNames >= minRequiredPatterns)
    ) {
      result.hasSubSections = true;
      result.subSectionsCount = part.subpart.length;
      result.indicators.push(
        `Has ${part.subpart.length} subsections with patterns`
      );
      result.indicators.push(
        `Number patterns: ${hasNumberPattern}/${part.subpart.length}`
      );
      result.indicators.push(
        `Single child patterns: ${hasSingleChildWithQuestions}/${part.subpart.length}`
      );
      result.indicators.push(
        `Unique names: ${hasUniqueNames}/${part.subpart.length}`
      );
    }

    return result;
  };

  // Xây dựng cấu trúc groupTopic từ API
  buildGroupTopicFromAPI = (part) => {
    const groupTopic = [];

    if (part.subpart && Array.isArray(part.subpart)) {
      part.subpart.forEach((subpart, groupIdx) => {
        const group = {
          idTopic: this.generateObjectId(),
          nameTopic: subpart.name || `Chủ đề ${groupIdx + 1}`,
          subjects: [],
          totalQuestions: 0,
          totalChildQuestions: 0,
        };

        if (subpart.children && Array.isArray(subpart.children)) {
          subpart.children.forEach((child, subjIdx) => {
            const subject = {
              idSubject: this.generateObjectId(),
              nameSubject: child.name || `Môn ${subjIdx + 1}`,
              questions: (child.questions || []).map((qWrap) => {
                const question = qWrap.question || qWrap;
                return this.normalizeQuestionFormat(question, "upload");
              }),
              totalQuestions: 0,
              totalChildQuestions: 0,
            };

            // Count questions và child questions
            subject.questions.forEach((q) => {
              subject.totalQuestions++;
              if (q.type === "CLUSTER" || q.type === "cluster") {
                const childCount = (
                  q.childQuestions ||
                  q.clusterQuestions ||
                  []
                ).length;
                subject.totalChildQuestions += childCount;
                group.totalChildQuestions += childCount;
              }
            });
            group.totalQuestions += subject.totalQuestions;

            group.subjects.push(subject);
          });
        }

        groupTopic.push(group);
      });
    }

    return groupTopic;
  };

  // ✅ CẬP NHẬT: Xây dựng cấu trúc subSections từ API cho phần thi con
  buildSubSectionsFromAPI = (part) => {
    // ✅ BUILD SUB-SECTIONS FROM UPLOADED FILE
    // Hàm này chỉ được gọi khi parse file Word upload
    const subSections = [];

    if (part.subpart && Array.isArray(part.subpart)) {
      part.subpart.forEach((subpart, subIdx) => {
        const subSection = {
          id: `sub-${Date.now()}-${subIdx}`,
          name: subpart.name || `Phần thi con ${subIdx + 1}`,
          uploaded: true, // ✅ MARK: Đây là sub-section từ upload
          isMain: subpart.isMain === true, // ✅ PRESERVE: isMain flag từ API/upload
          questions: [],
        };

        if (subpart.children && Array.isArray(subpart.children)) {
          let totalQuestionsInSubpart = 0;

          subpart.children.forEach((child, childIdx) => {
            if (child.questions && Array.isArray(child.questions)) {
              const normalizedQuestions = child.questions.map((qWrap, qIdx) => {
                const question = qWrap.question || qWrap;
                const normalized = this.normalizeQuestionFormat(
                  question,
                  "upload"
                );
                return normalized;
              });

              subSection.questions.push(...normalizedQuestions);
              totalQuestionsInSubpart += normalizedQuestions.length;
            }
          });
        }
        subSections.push(subSection);
      });
    }
    return subSections;
  };

  // Trích xuất questions dựa trên loại phần thi
  extractQuestionsFromPart = (part, sectionType) => {
    let questions = [];

    if (sectionType === "NHOM_CHU_DE" || sectionType === "PHAN_THI_CON") {
      // Đối với group và subsection, questions sẽ được quản lý riêng
      return [];
    }

    // Đối với phần thi thường (MAC_DINH), extract tất cả questions
    if (Array.isArray(part.subpart)) {
      part.subpart.forEach((sp) => {
        if (Array.isArray(sp.children)) {
          sp.children.forEach((child) => {
            if (Array.isArray(child.questions)) {
              child.questions.forEach((qWrap, qIdx) => {
                const q = qWrap.question || qWrap;
                if (!q || typeof q !== "object") return;

                const normalizedQuestion = this.normalizeQuestionFormat(
                  q,
                  "upload"
                );
                questions.push(normalizedQuestion);
              });
            }
          });
        }
      });
    }

    return questions;
  };

  // ============================================
  // UNIFIED QUESTION NUMBERING - Using Service
  // ============================================

  /**
   * ✅ NEW: Wrapper method gọi QuestionNumberingService
   * @deprecated Sử dụng trực tiếp QuestionNumberingService.unifiedQuestionNumbering() thay vì method này
   */
  updateQuestionNumbers = (questions, startingNumber = 1, preserveExistingNumbers = false) => {
    if (!Array.isArray(questions) || questions.length === 0) {
      return questions;
    }

    // Xác định tableType dựa vào context
    const tableType = this.determineTableType();

    return QuestionNumberingService.unifiedQuestionNumbering(
      questions,
      tableType,
      {
        sectionId: this.state.selectedSectionId,
        subSectionId: this.state.currentSubSectionId,
        tabData: this.state.tabData,
        preserveExistingNumbers // Truyền option preserve
      }
    );
  };

  /**
   * Helper để xác định loại bảng hiện tại
   */
  determineTableType = () => {
    const currentTab = this.state.tabData?.find(
      tab => tab._id === this.state.selectedSectionId
    );

    if (currentTab?.exam_section_type === 'NHOM_CHU_DE') {
      return 'NHOM_CHU_DE';
    }

    if (this.state.currentSubSectionId) {
      return 'SUB_SECTION';
    }

    return 'MAIN';
  };

  /**
   * ✅ Helper: Kiểm tra cluster question
   */
  isClusterQuestion = (question) => {
    return QuestionNumberingService.isClusterQuestion(question);
  };

  /**
   * ✅ Helper: Đếm số câu hỏi thực (chỉ tính child + regular, không tính cluster parent)
   */
  countRealQuestions = (questions) => {
    return QuestionNumberingService.countRealQuestions(questions);
  };

  // ✅ NEW: Method cập nhật STT cho toàn bộ tabData sử dụng QuestionNumberingService
  updateAllQuestionNumbers = () => {
    try {
      const { tabData } = this.state;

      if (!tabData || !Array.isArray(tabData)) {
        return;
      }

      const updatedTabData = tabData.map((tab) => {
        const updatedTab = { ...tab };

        // Xác định tableType cho tab hiện tại
        const tableType = tab.exam_section_type === 'NHOM_CHU_DE' ? 'NHOM_CHU_DE' : 'MAIN';

        if (tableType === 'MAIN') {
          // Xử lý cho MAIN (bao gồm subSections nếu có)
          const questions = tab.questions || [];
          const numberedQuestions = QuestionNumberingService.unifiedQuestionNumbering(
            questions,
            'MAIN',
            {
              sectionId: tab._id,
              tabData: tabData
            }
          );
          updatedTab.questions = numberedQuestions;

          // Xử lý subSections nếu có
          if (tab.subSections && Array.isArray(tab.subSections)) {
            updatedTab.subSections = tab.subSections.map((sub) => {
              const subQuestions = sub.questions || [];
              const numberedSubQuestions = QuestionNumberingService.unifiedQuestionNumbering(
                subQuestions,
                'SUB_SECTION',
                {
                  sectionId: tab._id,
                  subSectionId: sub.id,
                  tabData: tabData
                }
              );
              return { ...sub, questions: numberedSubQuestions };
            });
          }

          // Xử lý childExam nếu có
          if (tab.childExam && Array.isArray(tab.childExam)) {
            updatedTab.childExam = tab.childExam.map((child) => {
              const childQuestions = child.questions || [];
              const numberedChildQuestions = QuestionNumberingService.unifiedQuestionNumbering(
                childQuestions,
                'SUB_SECTION',
                {
                  sectionId: tab._id,
                  subSectionId: child.idChildExam,
                  tabData: tabData
                }
              );
              return { ...child, questions: numberedChildQuestions };
            });
          }
        } else if (tableType === 'NHOM_CHU_DE') {
          // Xử lý cho NHOM_CHU_DE: Lặp qua từng group và subject
          if (tab.groupTopic && Array.isArray(tab.groupTopic)) {
            updatedTab.groupTopic = tab.groupTopic.map((group, groupIdx) => {
              if (group.subjects && Array.isArray(group.subjects)) {
                const updatedSubjects = group.subjects.map((subject, subjectIdx) => {
                  const subjectQuestions = subject.questions || [];
                  const numberedSubjectQuestions = QuestionNumberingService.unifiedQuestionNumbering(
                    subjectQuestions,
                    'NHOM_CHU_DE',
                    {
                      sectionId: tab._id,
                      groupIdx: groupIdx,
                      subjectIdx: subjectIdx,
                      tabData: tabData
                    }
                  );
                  return { ...subject, questions: numberedSubjectQuestions };
                });
                return { ...group, subjects: updatedSubjects };
              }
              return group;
            });
          }
        }

        return updatedTab;
      });

      // Cập nhật state
      this.setState({ tabData: updatedTabData });
    } catch (error) {
      // Error updating question numbers
    }
  };

  // Hàm xử lý base64 images trong content để hiển thị trong bảng
  processImageContentForDisplay = (content) => {
    if (!content) return content;

    try {
      // Tìm và thay thế các img tags với base64 data
      const processedContent = content.replace(
        /<img\s+[^>]*src="data:image\/[^;]+;base64,[^"]*"[^>]*>/gi,
        (match) => {
          // Extract alt text hoặc tạo placeholder
          const altMatch = match.match(/alt="([^"]*)"/i);
          const altText = altMatch ? altMatch[1] : "hình ảnh";

          // Tạo placeholder thay thế
          return `[Hình: ${altText}]`;
        }
      );

      // Loại bỏ các thẻ HTML khác để chỉ hiển thị text
      return processedContent.replace(/<[^>]*>/g, "").trim();
    } catch (error) {
      // Fallback: chỉ loại bỏ HTML tags
      return content.replace(/<[^>]*>/g, "").trim();
    }
  };

  async componentDidMount() {
    this._isMounted = true;
    this.setState({ _isMounted: true });

    await this.initData();

    await this.props.listSubject(this.getData());

    await this.props.listExamCategory(this.getData()); // Load danh sách Kỳ thi

    await this.props.listExamTestCategory(this.getData()); // Load Loại bài kiểm tra

    // Load danh sách exam để validation tên trùng lặp
    await this.props.listExamWord({ limit: 9999, is_delete: false });

    // Load provinces data
    await this.loadAllProvinces();

    // Add event listener for clicking outside
    document.addEventListener('click', this.handleClickOutside);

    // Khởi tạo tabData mặc định nếu không load từ existing exam
    if (!this.state.examId) {
      this.initializeDefaultTabData();
    }
  }

  // Load provinces from API
  loadAllProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
      if (response.ok) {
        const provinces = await response.json();
        this.setState({ allProvinces: provinces });
      } else {
        // Fallback data if API fails
        const fallbackProvinces = [
          { code: '01', name: 'Hà Nội' },
          { code: '79', name: 'Hồ Chí Minh' },
          { code: '48', name: 'Đà Nẵng' },
          { code: '31', name: 'Hải Phòng' },
          { code: '92', name: 'Cần Thơ' },
          { code: '56', name: 'Khánh Hòa' },
          { code: '46', name: 'Thừa Thiên Huế' },
          { code: '77', name: 'Bà Rịa - Vũng Tàu' },
          { code: '22', name: 'Quảng Ninh' },
          { code: '74', name: 'Bình Dương' }
        ];
        this.setState({ allProvinces: fallbackProvinces });
      }
    } catch (error) {
      // Fallback data on error
      const fallbackProvinces = [
        { code: '01', name: 'Hà Nội' },
        { code: '79', name: 'Hồ Chí Minh' },
        { code: '48', name: 'Đà Nẵng' },
        { code: '31', name: 'Hải Phòng' },
        { code: '92', name: 'Cần Thơ' },
        { code: '56', name: 'Khánh Hòa' },
        { code: '46', name: 'Thừa Thiên Huế' },
        { code: '77', name: 'Bà Rịa - Vũng Tàu' },
        { code: '22', name: 'Quảng Ninh' },
        { code: '74', name: 'Bình Dương' }
      ];
      this.setState({ allProvinces: fallbackProvinces });
    }
  };

  // Handle input click to toggle dropdown
  handleInputClick = () => {
    this.setState(prevState => ({
      showProvinceDropdown: !prevState.showProvinceDropdown
    }));
  };

  // Handle province search
  handleProvinceSearch = (e) => {
    this.setState({ provinceSearchTerm: e.target.value });
  };

  // Get filtered provinces based on search term
  getFilteredProvinces = () => {
    const { allProvinces, provinceSearchTerm } = this.state;
    if (!provinceSearchTerm) {
      return allProvinces;
    }
    return allProvinces.filter(province =>
      province.name.toLowerCase().includes(provinceSearchTerm.toLowerCase())
    );
  };

  // Select a province
  selectProvince = (province) => {
    this.setState({
      tp: province.code,
      showProvinceDropdown: false,
      provinceSearchTerm: ''
    });
  };

  // Get selected province name for display
  getSelectedProvinceName = () => {
    const { tp, allProvinces } = this.state;
    if (!tp) return '';
    const province = allProvinces.find(p => p.code === tp);
    return province ? province.name : '';
  };

  // Handle click outside to close dropdown
  handleClickOutside = (event) => {
    if (this.state.showProvinceDropdown &&
      !event.target.closest('.province-dropdown-container')) {
      this.setState({ showProvinceDropdown: false });
    }
  };

  handlePreviewExam = () => {
    if (!this._isMounted || !this.state._isMounted) return;

    const { selectedSectionId, tabData } = this.state;
    if (!selectedSectionId || !Array.isArray(tabData)) {
      notification.warning({
        message: "Không có dữ liệu để xem trước",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    const currentTab = tabData.find(tab => tab._id === selectedSectionId);
    if (!currentTab) {
      notification.warning({
        message: "Không tìm thấy phần thi hiện tại",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    if (this._isMounted && this.state._isMounted) {
      this.setState({
        showPreviewModal: true,
        previewData: currentTab,
        renderPreview: false
      }, () => {
        this.previewTimeout = setTimeout(() => {
          if (this._isMounted && this.state._isMounted) {
            this.setState({ renderPreview: true });
          }
        }, 100);
      });
    }
  };

  closePreviewModal = () => {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    if (this._isMounted && this.state._isMounted) {
      this.setState({
        showPreviewModal: false,
        previewData: null,
        renderPreview: false
      });
    }
  };

  componentWillUnmount() {
    this._isMounted = false;

    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    if (this.saveSessionTimeout) {
      clearTimeout(this.saveSessionTimeout);
      this.saveSessionTimeout = null;
    }

    // Remove event listener
    document.removeEventListener('click', this.handleClickOutside);
  }

  componentDidUpdate(prevProps, prevState) {
    // Setup auto-render for LaTeX in answer fields
    this.setupAutoRender();

    // ✅ THÊM: Detect renumber action
    if (
      this.state._renumberTimestamp &&
      this.state._renumberTimestamp !== prevState._renumberTimestamp
    ) {

      // ✅ Force re-fetch rows với tabData mới
      const currentTab = this.state.tabData?.find(
        (tab) => tab._id === this.state.selectedSectionId
      );

      if (currentTab) {
        // ✅ FIX: Chỉ gọi updateAllQuestionNumbers nếu KHÔNG phải NHOM_CHU_DE để tránh override số thứ tự của các bảng NHOM_CHU_DE khác
        if (currentTab.exam_section_type !== "NHOM_CHU_DE") {
          this.updateAllQuestionNumbers();
        }
        // ✅ FIX: Loại bỏ forceUpdate để tránh DOM error, chỉ dùng setState để trigger re-render
        this.setState({
          _forceRenderKey: Date.now()

        });
      }
    }
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
        console.warn('LaTeX rendering error in ExamWordEdit:', error);
      }
    }
  };


  // Khởi tạo tabData mặc định nếu chưa có
  initializeDefaultTabData = (status) => {
    // Không khởi tạo phần mặc định nếu đã có dữ liệu từ upload/sections hoặc chưa upload file
    if (
      (!this.state.tabData || this.state.tabData.length === 0) &&
      (!Array.isArray(this.state.sections) ||
        this.state.sections.length === 0) &&
      this.state.isUploaded
    ) {
      if (status === "TOPIC") {
        const defaultSection = {
          _id: "default-section",
          exam_section_name: "Phần thi nhóm chủ đề",
          exam_section_type: "MAC_DINH",
          exam_section_time: this.state.time || 90,
          total_score: 10,
          calculate_score_type: "total_score",
          idSubject: this.state.listSubjectGroups.idSubject || "",
          questions: [],
          active: true,
        };

        this.setState({
          tabData: [defaultSection],
          examSectionId: defaultSection._id,
          statusTabCreate: false,
        });
      } else {
        const defaultSection = {
          _id: "default-section",
          exam_section_name: "Phần mặc định",
          exam_section_type: "MAC_DINH",
          exam_section_time: this.state.time || 90,
          total_score: 10,
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
    }
  };

  // Đảm bảo có ít nhất một section để thêm câu hỏi
  ensureDefaultSection = () => {
    if (!this.state.tabData || this.state.tabData.length === 0) {
      this.initializeDefaultTabData();
      return true; // Đã tạo section mới
    }
    return false; // Đã có section sẵn
  };

  // Method để thêm phần thi con
  handleAddSubSection = (parentSectionId) => {
    const currentTab = this.state.tabData.find(
      (tab) => tab._id === parentSectionId
    );

    if (!currentTab) {
      notification.error({
        message: "Lỗi",
        description: "Không tìm thấy phần thi để thêm phần thi con!",
        placement: "topRight",
      });
      return;
    }

    // ✅ Validation: Chỉ cho phép MAC_DINH sections (cả manual và upload)
    if (
      currentTab.exam_section_type &&
      currentTab.exam_section_type !== "MAC_DINH"
    ) {
      notification.warning({
        message: "Không thể thêm phần thi con",
        description: "Chỉ có thể thêm phần thi con cho phần thi mặc định",
        placement: "topRight",
      });
      return;
    }

    // ✅ REMOVED: Xóa logic gợi ý tên tự động - để user tự nhập tên

    this.setState({
      showAddSubSectionModal: true,
      selectedParentSectionId: parentSectionId,
      subSectionName: "", // ✅ Để trống, không gợi ý tên
    });
  };

  // Method để đóng dialog thêm phần thi con
  closeAddSubSectionModal = () => {
    this.setState({
      showAddSubSectionModal: false,
      subSectionName: "",
      selectedParentSectionId: null,
    });
  };

  // ✅ DEPRECATED: Method này ít được sử dụng vì logic đã được tích hợp vào handleOpenModalUpdateQuestion
  // Open modal to select question type for child question
  handleOpenChildQuestionTypeModal = (question) => {
    this.setState({
      showChildQuestionTypeModal: true,
      selectedChildParentId: question._id,
      currentQuestionvalue: question,
      actionQuestion: "update",
    });
  };

  // Close modal chọn loại câu hỏi con
  closeChildQuestionTypeModal = () => {
    this.setState({
      showChildQuestionTypeModal: false,
      selectedChildParentId: null,
    });
  };

  syncSectionsWithTabData = () => {
    const { tabData } = this.state;

    const newSections = tabData.map((tab, idx) => ({
      id: tab._id,
      title: tab.exam_section_name || `Phần ${idx + 1}`,
      isSubSection: false,
    }));

    // Nếu có childExam thì thêm vào section list
    tabData.forEach((tab) => {
      if (Array.isArray(tab.childExam)) {
        tab.childExam.forEach((child, cIdx) => {
          newSections.push({
            id: child.idChildExam,
            title: child.name || `Phần con ${cIdx + 1}`,
            isSubSection: true,
            parentId: tab._id,
          });
        });
      }
    });

    this.setState({ sections: newSections });
  };

  // Method để lưu phần thi con
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
            // ✅ clone an toàn
            const updatedTab = {
              ...tab,
              questions: [...(tab.questions || [])], // ✅ GIỮ NGUYÊN câu hỏi chính
              subSections: [...(tab.subSections || [])], // Clone subSections
            };

            const nextIndex = updatedTab.subSections.length + 1;
            const subSectionId = `subSection${nextIndex}`;

            // ✅ LOGIC: KHÔNG chuyển câu hỏi từ bảng chính
            // Phần thi con mới luôn bắt đầu rỗng
            const isFirstSubSection = updatedTab.subSections.length === 0;

            // ✅ Sub-sections luôn là sub-sections, không bao giờ là main
            const isMain = false;

            // ✅ CHỈ tạo subSections (KHÔNG tạo childExam để tránh trùng lặp)
            const newSubSection = {
              id: subSectionId,
              name: subSectionName.trim(),
              isMain: isMain, // Luôn false cho sub-sections
              uploaded: tab.uploaded || false, // ✅ Kế thừa status từ parent section
              questions: [], // Luôn bắt đầu rỗng - KHÔNG chuyển câu hỏi từ main
            };
            updatedTab.subSections = [...updatedTab.subSections, newSubSection];

            // ✅ QUAN TRỌNG: GIỮ NGUYÊN câu hỏi trong bảng chính
            // Không làm rỗng updatedTab.questions
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
      }
    );
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
    this.setState(
      (prev) => {
        // 1. Cập nhật titlePerPart
        const arr = Array.isArray(prev.titlePerPart)
          ? [...prev.titlePerPart]
          : [];
        if (index >= 0) arr[index] = value;

        // 2. Cập nhật sections
        const updatedSections = (prev.sections || []).map((section, idx) => {
          if (idx === index) {
            return {
              ...section,
              title: value,
            };
          }
          return section;
        });

        // 3. Cập nhật tabData
        const updatedTabData = (prev.tabData || []).map((tab, idx) => {
          if (idx === index) {
            return {
              ...tab,
              exam_section_name: value,
              title: value, // Thêm title để đồng bộ
            };
          }
          return tab;
        });

        return {
          titlePerPart: arr,
          sections: updatedSections,
          tabData: updatedTabData,
        };
      },
      () => {
        // Callback sau khi state được cập nhật
        this.saveTabDataToSession();
        this.syncSectionsWithTabData();

        // Thông báo thành công
        notification.success({
          message: "Đổi tên phần thi thành công",
          description: `Đã đổi tên thành: ${value}`,
          placement: "topRight",
          duration: 2,
        });
      }
    );
  };

  saveExamConfig = () => {
    try {
      // Validation scorePerPart trước khi lưu
      const scorePerPart = Array.isArray(this.state.scorePerPart)
        ? this.state.scorePerPart
        : [];
      const hasEmptyScore = scorePerPart.some((score, index) => {
        const scoreValue = score?.toString().trim();
        return !scoreValue || scoreValue === "" || Number(scoreValue) <= 0;
      });

      if (hasEmptyScore || scorePerPart.length === 0) {
        notification.error({
          message: "Vui lòng điền tổng điểm cho tất cả các phần thi",
          placement: "topRight",
          duration: 3,
        });
        return; // Không đóng modal, cho phép user sửa
      }

      const parts = Array.isArray(this.state.parts)
        ? [...this.state.parts]
        : [];
      const titlePerPart = Array.isArray(this.state.titlePerPart)
        ? this.state.titlePerPart
        : [];
      const timePerPart = Array.isArray(this.state.timePerPart)
        ? this.state.timePerPart
        : [];

      const perPartNums = timePerPart.map((v) => Number(v || 0));
      let newParts;
      const nextState = { showConfigModal: false };

      if (
        this.state.timeMode === "TOTAL" &&
        Number(this.state.timeTotal || 0) > 0
      ) {
        newParts = parts.map((p, idx) => ({
          ...p,
          name:
            titlePerPart[idx] !== undefined
              ? titlePerPart[idx]
              : p?.name || `Phần ${idx + 1}`,
          score: Number(scorePerPart[idx] ?? p?.score ?? 0),
          time: null,
        }));
        nextState.time = Number(this.state.timeTotal || 0);
      } else {
        newParts = parts.map((p, idx) => ({
          ...p,
          name:
            titlePerPart[idx] !== undefined
              ? titlePerPart[idx]
              : p?.name || `Phần ${idx + 1}`,
          score: Number(scorePerPart[idx] ?? p?.score ?? 0),
          time: perPartNums[idx] ?? 0,
        }));
        const total = perPartNums.reduce((s, v) => s + (Number(v) || 0), 0);
        nextState.time = total;
      }
      nextState.parts = newParts;

      // Đồng bộ ngược lại sections.title
      if (
        Array.isArray(this.state.sections) &&
        this.state.sections.length > 0
      ) {
        const updatedSections = this.state.sections.map((sec, idx) => {
          const titleFromModal = titlePerPart[idx];
          const titleFromParts = newParts[idx]?.name;
          const finalTitle =
            titleFromModal !== undefined
              ? titleFromModal
              : titleFromParts || sec.title;

          return {
            ...sec,
            title: finalTitle,
          };
        });
        nextState.sections = updatedSections;
      }

      // Đồng bộ tabData.exam_section_name
      if (Array.isArray(this.state.tabData) && this.state.tabData.length > 0) {
        const updatedTabData = this.state.tabData.map((tab, idx) => {
          const titleFromModal = titlePerPart[idx];
          const titleFromParts = newParts[idx]?.name;
          const finalTitle =
            titleFromModal !== undefined
              ? titleFromModal
              : titleFromParts || tab.exam_section_name;

          return {
            ...tab,
            exam_section_name: finalTitle,
          };
        });
        nextState.tabData = updatedTabData;
      }

      this.setState(nextState, () => {
        // Lưu vào session sau khi cập nhật
        this.saveTabDataToSession();

        notification.success({
          message: "Cấu hình đề thi đã được lưu",
          placement: "topRight",
          duration: 2,
        });
      });
    } catch (e) {
      notification.error({
        message: "Có lỗi khi lưu cấu hình",
        placement: "topRight",
        duration: 3,
      });
      this.closeExamConfigModal();
    }
  };

  // Persist tabData into sessionStorage under a key unique to the current exam creation
  saveTabDataToSession = () => {
    const key = `exam_word_tabdata_${this.state.examId || "new"}`;
    const payload = JSON.stringify({
      tabData: this.state.tabData || [],
      selectedSectionId: this.state.selectedSectionId,
    });
    sessionStorage.setItem(key, payload);
  };

  // Validate and ensure UI state consistency
  validateUIState = () => {
    const { tabData, selectedSectionId } = this.state;

    // Ensure tabData exists
    if (!Array.isArray(tabData) || tabData.length === 0) {
      this.ensureDefaultSection();
      return false; // State will be updated async
    }

    // Ensure selectedSectionId exists and is valid
    if (
      !selectedSectionId ||
      !tabData.find((tab) => tab._id === selectedSectionId)
    ) {
      this.setState({ selectedSectionId: tabData[0]._id });
      return false; // State will be updated async
    }

    return true; // State is valid
  };

  loadTabDataFromSession = () => {
    try {
      const key = `exam_word_tabdata_${this.state.examId || "new"}`;
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const { tabData, selectedSectionId } = JSON.parse(raw);
        this.setState({ tabData, selectedSectionId }, () => {
          // If we have tabData but no selectedSectionId, select the first one
          if (tabData.length > 0 && !this.state.selectedSectionId) {
            this.setState({
              selectedSectionId: tabData[0]._id,
              examSectionId: tabData[0]._id,
            });
          }
        });
      }
    } catch (e) { }
  };

  renderQuestionType = (type) => {
    if (!type || type === null || type === undefined || type === "") {
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
        return "  ";
      default:
        return lvl;
    }
  };

  formatAnswerText = (answer) => {
    if (!answer) return "";

    // Handle array of objects with {key, value} structure
    if (Array.isArray(answer)) {
      if (
        answer.length > 0 &&
        typeof answer[0] === "object" &&
        answer[0].key !== undefined
      ) {
        return answer.map((item) => `${item.key}:${item.value}`).join(", ");
      }
      // Handle array of primitive values
      return answer.join(", ");
    }

    // Handle single object with {key, value} structure
    if (typeof answer === "object") {
      if (answer.key !== undefined && answer.value !== undefined) {
        return `${answer.key}:${answer.value}`;
      }
      // Handle object with a/b/c/d properties
      const parts = [];
      if (answer.a !== undefined) parts.push(`a:${answer.a}`);
      if (answer.b !== undefined) parts.push(`b:${answer.b}`);
      if (answer.c !== undefined) parts.push(`c:${answer.c}`);
      if (answer.d !== undefined) parts.push(`d:${answer.d}`);
      if (parts.length > 0) return parts.join(", ");

      // Fallback for unknown object structure
      return ""; // Safe string instead of rendering object [Object]
    }

    // Handle primitive values
    return String(answer);
  };

  // Đơn giản hóa normalize question cho Modal - loại bỏ logic phức tạp
  normalizeQuestionForModal = (q = {}) => {
    const clone = q || {};
    // Đơn giản hóa type mapping
    clone.type = clone.type || "SINGLECHOICE";

    // Đơn giản hóa choices - chỉ đảm bảo có choices array
    if (!Array.isArray(clone.choices)) {
      clone.choices = clone.options || [
        { label: "A", text: "" },
        { label: "B", text: "" },
        { label: "C", text: "" },
        { label: "D", text: "" },
      ];
    }

    // Đơn giản hóa correctAnswers - giữ nguyên như từ DB
    if (clone.correctAnswers === undefined && clone.answer !== undefined) {
      clone.correctAnswers = clone.answer;
    }

    // Đơn giản hóa level - chỉ map cơ bản
    const levelValue = clone.level || clone.question_level || "";
    clone.level = levelValue;
    clone.question_level = levelValue;

    // Copy các field cần thiết
    clone.rawHtml =
      clone.rawHtml || clone.answer_content || clone.content || "";
    clone.video_link = clone.video_link || clone.video || "";
    clone.options = clone.choices; // Alias for modal compatibility

    // ✅ Sửa xử lý cluster: tìm childQuestions chắc chắn, không trả về null
    if (clone.type === "CLUSTER" || clone.type === "cluster") {
      const clusterIds = [clone._id, clone.question_id].filter(Boolean).map(String);

      // Thử lấy child trong "current selection" trước
      let existingChildQuestions = this.getQuestionsForCurrentSelection().filter(
        (cq) => clusterIds.includes(String(cq.parentId))
      );

      // Nếu không thấy, quét toàn bộ tabData (groupTopic, questions, subSections, childExam)
      if (existingChildQuestions.length === 0) {
        const tabs = Array.isArray(this.state.tabData) ? this.state.tabData : [];
        const collected = [];

        for (const tab of tabs) {
          // Main questions
          (tab.questions || []).forEach((qItem) => {
            if (clusterIds.includes(String(qItem.parentId))) {
              collected.push(qItem);
            }
          });
          // SubSections
          (tab.subSections || []).forEach((sub) => {
            (sub.questions || []).forEach((qItem) => {
              if (clusterIds.includes(String(qItem.parentId))) {
                collected.push(qItem);
              }
            });
          });
          // ChildExam
          (tab.childExam || []).forEach((child) => {
            (child.questions || []).forEach((qItem) => {
              if (clusterIds.includes(String(qItem.parentId))) {
                collected.push(qItem);
              }
            });
          });
          // GroupTopic: groups -> subjects -> questions
          (tab.groupTopic || []).forEach((group) => {
            (group.subjects || []).forEach((subj) => {
              (subj.questions || []).forEach((qItem) => {
                if (clusterIds.includes(String(qItem.parentId))) {
                  collected.push(qItem);
                }
              });
            });
          });
        }

        if (collected.length > 0) {
          existingChildQuestions = collected;
        } else if (Array.isArray(clone.childQuestions) && clone.childQuestions.length > 0) {
          existingChildQuestions = clone.childQuestions;
        }
      }

      // Cuối cùng: luôn set childQuestions, không trả về null để modal mở được
      clone.childQuestions = existingChildQuestions || [];
    }

    return clone;
  };

  formatAnswer = (val, questionType = "") => {
    if (val === null || val === undefined) return "";
    const isMultipleChoice =
      questionType &&
      (questionType.toUpperCase().includes("MULTI") ||
        questionType.toUpperCase().includes("MULTIPLE") ||
        questionType === "TN_MULTI_CHOICE");

    if (val === true || val === 1) return isMultipleChoice ? "true" : "Đúng";
    if (val === false || val === 0) return isMultipleChoice ? "false" : "Sai";

    if (typeof val === "string") {
      const s = val.trim();
      const lower = s.toLowerCase();

      if (["true", "t", "đúng", "dung", "yes", "y", "1"].includes(lower))
        return isMultipleChoice ? "true" : "Đúng";
      if (["false", "f", "sai", "no", "n", "0"].includes(lower))
        return isMultipleChoice ? "false" : "Sai";

      if (/^[a-z]$/.test(lower)) {
        return isMultipleChoice ? "true" : lower.toUpperCase();
      }

      return s; // fallback: return trimmed string as-is
    }

    // objects: try to extract meaningful primitive
    if (typeof val === "object") {
      // if object has 'value' or 'label'
      if ("value" in val) return this.formatAnswer(val.value, questionType);
      if ("label" in val) return this.formatAnswer(val.label, questionType);
      try {
        return String(val);
      } catch (e) {
        return "";
      }
    }

    // fallback for other types
    return String(val);
  };

  // Đơn giản hóa getAnswerDisplay - loại bỏ logic phức tạp
  getAnswerDisplay = (ans, question) => {
    if (ans === null || ans === undefined) return "";  // Không có đáp án

    // Helper to display boolean-like values, support VN/EN
    const boolDisplay = (v, preferEnglish = false) => {
      if (v === true || v === "true")
        return preferEnglish ? "True" : "Đúng";
      if (v === false || v === "false")
        return preferEnglish ? "False" : "Sai";
      if (typeof v === "string") {
        const lower = v.toLowerCase().trim();
        if (lower === "true") return preferEnglish ? "True" : "Đúng";
        if (lower === "false") return preferEnglish ? "False" : "Sai";
        if (lower === "đúng" || lower === "dung" || lower === "đ") return "Đúng";
        if (lower === "sai" || lower === "s") return "Sai";
        return v;
      }
      return String(v);
    };

    // Detect if source prefers English booleans
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
              // If we have boolean values in object, check if question has English answerRaw
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
              // ✅ FIX: Also check question.answerRaw for TRUEFALSEMULTI
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
              // Check value property in object (for correctAnswers array format)
              if (v.value !== undefined) {
                const valStr = String(v.value).toLowerCase().trim();
                if (valStr === "true" || valStr === "false") return true;
              }
              // Also check rawHtml for language hints
              if (v.rawHtml !== undefined) {
                const htmlStr = String(v.rawHtml).toLowerCase();
                if (htmlStr.includes("true") || htmlStr.includes("false"))
                  return true;
              }
            }
            if (typeof v === "boolean") {
              // Check associated question data for language hints
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
              // ✅ FIX: Also check question.answerRaw for TRUEFALSEMULTI
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
      } catch (e) {
        // ignore
      }
      return false;
    };

    // Simple primitives
    if (typeof ans === "string" || typeof ans === "number") {
      const preferEn = detectPreferEnglish(
        question?.correctAnswers || question?.answer || ans
      );
      const result = boolDisplay(ans, preferEn);

      return result;
    }

    if (typeof ans === "boolean") {
      const preferEn = detectPreferEnglish(
        question?.correctAnswers || question?.answer || ans
      );
      const result = boolDisplay(ans, preferEn);

      return result;
    }

    // Arrays - normalize each item
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
          // Handle correctAnswers array format: {label, value, rawHtml}
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

    // Objects - handle common shapes
    if (typeof ans === "object") {
      // If mapping like {A: true, B: false}
      const keys = Object.keys(ans || {});
      const isLabelMap =
        keys.length > 0 && keys.every((k) => /^[A-Za-z0-9]+$/.test(k));
      const preferEn = detectPreferEnglish(
        ans || question?.correctAnswers || question?.answer
      );

      if (isLabelMap) {
        // Sort keys in natural order: numbers then letters
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

      // Generic object with value/text/label
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

      return fallback || ""; // Safe fallback if JSON.stringify fails. [Object]
    }

    // Fallback
    const fallback = String(ans);

    return fallback || ""; // Safe fallback if String() fails [Unknown]
  };

  createRow(
    question,
    index,
    isChild = false,
    displayNumber = null,
    isCluster = false,
    droppableId = "questions-table",
    subSectionId = null,
    questionsArray = null
  ) {
    const stableKey = question._id || question.question_id || `temp-${index}`;
    const draggableId = `${droppableId}-${stableKey}`; // Đảm bảo draggableId unique cho mỗi droppable

    // Special handling for cluster questions
    if (isCluster) {
      return (
        <Draggable
          key={`${stableKey}-${index}`}
          draggableId={draggableId}
          index={index}
        >
          {(provided) => (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="table-row-item cluster-question"
            >
              {/* Cột expand/collapse */}
              <td className="text-center align-middle p-sm-1">
                {(() => {
                  // ✅ FIX: Đếm child questions đúng cách cho cả main và sub-sections
                  let childCount = 0;

                  if (subSectionId) {
                    // ✅ CASE A: Cluster trong sub-section - tìm trong subSection.questions
                    const currentTab = this.state.tabData.find(
                      (tab) => tab._id === this.state.selectedSectionId
                    );

                    if (currentTab) {
                      // Tìm trong subSections trước (cấu trúc mới)
                      if (currentTab.subSections && Array.isArray(currentTab.subSections)) {
                        const subSection = currentTab.subSections.find(
                          (sub) => String(sub.id) === String(subSectionId)
                        );

                        if (subSection && Array.isArray(subSection.questions)) {
                          childCount = subSection.questions.filter(
                            (q) => String(q.parentId) === String(question._id)
                          ).length;
                        }
                      }

                      // Fallback: tìm trong childExam (cấu trúc cũ)
                      if (childCount === 0 && currentTab.childExam && Array.isArray(currentTab.childExam)) {
                        const childExam = currentTab.childExam.find(
                          (child) => String(child.idChildExam) === String(subSectionId)
                        );

                        if (childExam && Array.isArray(childExam.questions)) {
                          childCount = childExam.questions.filter(
                            (q) => String(q.parentId) === String(question._id)
                          ).length;
                        }
                      }
                    }
                  } else {
                    // ✅ CASE B: Cluster trong main section - dùng questionsArray hoặc tab.questions
                    const allQuestions = questionsArray || this.getQuestionsForCurrentSelection();
                    childCount = allQuestions.filter(
                      (q) => String(q.parentId) === String(question._id)
                    ).length;
                  }

                  const isExpanded = this.state.expandedClusters[question._id];

                  return (
                    <div className="d-flex align-items-center justify-content-center">
                      <i
                        className={`fa ${isExpanded ? "fa-chevron-down" : "fa-chevron-right"
                          } cursor-pointer mr-2`}
                        onClick={() => this.toggleExpanded(question._id)}
                        style={{
                          fontSize: "14px",
                          color: "#007bff",
                          cursor: "pointer",
                        }}
                        title={
                          isExpanded
                            ? `Thu gọn ${childCount} câu hỏi con`
                            : `Mở rộng ${childCount} câu hỏi con`
                        }
                      ></i>
                    </div>
                  );
                })()}
              </td>

              {/* 📂 Câu hỏi chùm + badge (gộp chung vào 1 cột) */}
              <td className="text-center align-middle p-sm-1">
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
                  {(() => {
                    // ✅ FIX: Sử dụng cùng logic đếm như ở cột expand/collapse
                    let childCount = 0;

                    if (subSectionId) {
                      const currentTab = this.state.tabData.find(
                        (tab) => tab._id === this.state.selectedSectionId
                      );

                      if (currentTab) {
                        // Tìm trong subSections (cấu trúc mới)
                        if (currentTab.subSections && Array.isArray(currentTab.subSections)) {
                          const subSection = currentTab.subSections.find(
                            (sub) => String(sub.id) === String(subSectionId)
                          );

                          if (subSection && Array.isArray(subSection.questions)) {
                            childCount = subSection.questions.filter(
                              (q) => String(q.parentId) === String(question._id)
                            ).length;
                          }
                        }

                        // Fallback: tìm trong childExam (cấu trúc cũ)
                        if (childCount === 0 && currentTab.childExam && Array.isArray(currentTab.childExam)) {
                          const childExam = currentTab.childExam.find(
                            (child) => String(child.idChildExam) === String(subSectionId)
                          );

                          if (childExam && Array.isArray(childExam.questions)) {
                            childCount = childExam.questions.filter(
                              (q) => String(q.parentId) === String(question._id)
                            ).length;
                          }
                        }
                      }
                    } else {
                      const allQuestions = questionsArray || this.getQuestionsForCurrentSelection();
                      childCount = allQuestions.filter(
                        (q) => String(q.parentId) === String(question._id)
                      ).length;
                    }

                    return childCount;
                  })()}{" "}
                  câu hỏi con
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
                  question.difficultyLabel ||
                  ""}
              </td>

              {/* Cột giải thích */}
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
                    question.created_at ||
                    question.uploadedAt ||
                    question.uploaded_at;
                  return displayDate
                    ? baseHelpers.formatDateToString(displayDate)
                    : "-";
                })()}
              </td>

              {/* Thao tác */}
              <td className="text-center align-middle p-sm-1">
                <div className="item-action d-flex justify-content-center">
                  <button
                    type="button"
                    className="mr-14 btn-link-style"
                    onClick={(e) => {
                      e.preventDefault();
                      this.setState(
                        {
                          actionQuestion: "update",
                          currentQuestionvalue: {
                            ...question,
                            childQuestions:
                              this.getQuestionsForCurrentSelection().filter(
                                (q) => q.parentId === question._id
                              ),
                          },
                        },
                        () => {
                          setTimeout(() => {
                            $("#create-update7").trigger("click");
                          }, 0);
                        }
                      );
                    }}
                    title="Chỉnh sửa"
                  >
                    <img src="/assets/img/icon-edit.svg" alt="" />
                  </button>
                  <button
                    type="button"
                    className="btn-link-style"
                    onClick={() => this.handleSetDeleteQuestion(question._id)}
                    data-toggle="modal"
                    data-target="#delete-question"
                    title="Xóa"
                    style={{ cursor: "pointer" }}
                  >
                    <img src="/assets/img/icon-delete.svg" alt="" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        </Draggable>
      );
    }

    const answerText = this.getAnswerDisplay(
      question.correctAnswers || question.answer || question.answer_content,
      question
    );

    return (
      <Draggable
        key={`${stableKey}-${index}`}
        draggableId={draggableId}
        index={index}
      >
        {(provided) => {
          return (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`v-middle table-row-item ${isChild ? "child-row" : ""
                }`}
            >
              {/* Cột trống cho mũi tên (để căn chỉnh) */}
              <td
                className="text-center p-sm-1"
                style={isChild ? { paddingLeft: "30px" } : {}}
              >
                {isChild && (
                  <i
                    className="fa fa-reply"
                    style={{ transform: "scaleX(-1)", color: "#6c757d" }}
                  ></i>
                )}
              </td>
              <td
                className="text-center p-sm-1"
                style={isChild ? { paddingLeft: "30px" } : {}}
              >
                {displayNumber ? `Câu ${displayNumber}` : ""}
              </td>

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
                  <span dangerouslySetInnerHTML={{ __html: answerText }} />
                </div>
              </td>
              <td className="text-center p-sm-1">
                {this.renderQuestionType(question.type) || "hello"}
              </td>
              <td className="text-center p-sm-1">
                {this.renderQuestionLevel(question) ||
                  question.level ||
                  question.question_level ||
                  question.difficultyLabel ||
                  ""}
              </td>
              <td className="text-center p-sm-1">
                <div style={{ textAlign: "center" }}>
                  {question.explanation &&
                    typeof question.explanation === "string" &&
                    question.explanation.trim() &&
                    question.explanation.replace(/<[^>]*>/g, "").trim() ? (
                    <span className="badge bg-success">Đã có</span>
                  ) : (
                    <span className="badge bg-danger">Chưa có</span>
                  )}
                </div>
              </td>
              <td className="text-center p-sm-1">
                {(() => {
                  const videoField =
                    question.video || question.video_link || question.videoLink;
                  const videoValue =
                    typeof videoField === "string"
                      ? videoField.trim()
                      : videoField;

                  if (!videoValue) {
                    return <span className="badge bg-danger">Chưa có</span>;
                  }

                  const isLink =
                    videoValue &&
                    (videoValue.startsWith("http://") ||
                      videoValue.startsWith("https://"));

                  return isLink ? (
                    <span className="badge bg-success">Đã có</span>
                  ) : (
                    <span className="badge bg-success">Đã có</span>
                  );
                })()}
              </td>
              <td className="text-center p-sm-1">
                {(() => {
                  // Debug: Log date fields để kiểm tra structure
                  // Kiểm tra nhiều định dạng field có thể có
                  const displayDate =
                    question.updatedAt ||
                    question.updated_at ||
                    question.createdAt ||
                    question.created_at ||
                    question.uploadedAt ||
                    question.uploaded_at;

                  return displayDate
                    ? baseHelpers.formatDateToString(displayDate)
                    : "-";
                })()}
              </td>
              <td className="text-center align-middle p-sm-1">
                <div className="item-action d-flex justify-content-center align-items-center">
                  <a
                    className="mr-14"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // ✅ Luôn gọi handleOpenModalUpdateQuestion, logic phân biệt đã xử lý bên trong
                      this.handleOpenModalUpdateQuestion(
                        question,
                        subSectionId
                      );
                    }}
                    title="Chỉnh sửa"
                  >
                    <img src="/assets/img/icon-edit.svg" alt="" />
                  </a>
                  <a
                    onClick={() =>
                      this.handleSetDeleteQuestion(question._id, subSectionId)
                    }
                    data-toggle="modal"
                    data-target="#delete-question"
                    data-toggle-classname="fade-down"
                    data-toggle-class-target=".animate"
                    title="Xóa"
                    style={{ cursor: "pointer" }}
                  >
                    <img src="/assets/img/icon-delete.svg" alt="" />
                  </a>
                </div>
              </td>
            </tr>
          );
        }}
      </Draggable>
    );
  }

  // ✅ NEW: fetchRowsTopicGroup sử dụng QuestionNumberingService
  fetchRowsTopicGroup(questions, droppableId = "topic-group-table", idSubject) {
    if (!Array.isArray(questions)) return null;

    // ✅ FIX: Parse droppableId để lấy đúng groupIdx và subjectIdx
    let groupIdx = 0;
    let subjectIdx = 0;

    const groupMatch = droppableId.match(/group-(\d+)/);
    const subjectMatch = droppableId.match(/subject-(\d+)/);

    if (groupMatch) {
      groupIdx = parseInt(groupMatch[1], 10);
    }
    if (subjectMatch) {
      subjectIdx = parseInt(subjectMatch[1], 10);
    }

    const numberedQuestions = QuestionNumberingService.unifiedQuestionNumbering(
      questions,
      'NHOM_CHU_DE',
      {
        sectionId: this.state.selectedSectionId,
        groupIdx: groupIdx,
        subjectIdx: subjectIdx,
        tabData: this.state.tabData,
        preserveExistingNumbers: true // ✅ Giữ nguyên số thứ tự từ API
      }
    );

    const rows = [];
    let rowIndex = 0;

    // Render rows với questions đã được đánh số
    numberedQuestions.forEach((question) => {
      // Skip child questions - sẽ được render trong cluster
      if (question.parentId) return;

      const isCluster = QuestionNumberingService.isClusterQuestion(question);

      if (isCluster) {
        // Render cluster row
        const clusterRow = this.createRowTopicGroup(
          question,
          rowIndex,
          null, // Cluster không có displayNumber
          droppableId,
          true,
          null,
          numberedQuestions,
          idSubject,
          false // ✅ THÊM: isChild = false cho cluster questions
        );
        if (clusterRow) rows.push(clusterRow);
        rowIndex++;

        // Render child questions nếu cluster được expand
        if (this.state.expandedClusters && this.state.expandedClusters[question._id]) {
          const childQuestions = numberedQuestions.filter(
            (q) => q.parentId === question._id
          );

          childQuestions.forEach((child) => {
            const childRow = this.createRowTopicGroup(
              child,
              rowIndex,
              child.number, // Child có STT
              droppableId,
              false,
              null,
              numberedQuestions,
              idSubject,
              true // ✅ THÊM: isChild = true cho child questions
            );
            if (childRow) rows.push(childRow);
            rowIndex++;
          });
        }
      } else {
        // Render regular question row
        const row = this.createRowTopicGroup(
          question,
          rowIndex,
          question.number, // Regular question có STT
          droppableId,
          false,
          null,
          numberedQuestions,
          idSubject,
          false // ✅ THÊM: isChild = false cho regular questions
        );
        if (row) rows.push(row);
        rowIndex++;
      }
    });

    return rows;
  }

  createRowTopicGroup(
    question,
    index,
    displayNumber,
    droppableId,
    isCluster = false,
    subSectionId = null,
    questionsArray = null,
    idSubject,
    isChild = false // ✅ THÊM: Parameter isChild
  ) {
    // Special handling for cluster questions
    if (isCluster) {
      return (
        <Draggable
          key={`${question._id}-${index}`}
          draggableId={question._id}
          index={index}
        >
          {(provided) => (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              {/* Cột expand/collapse */}
              <td className="text-center align-middle p-sm-1">
                {(() => {
                  // Tìm child questions trong TẤT CẢ questions của NHOM_CHU_DE tab
                  const allQuestionsInTab = this.getAllQuestionsInGroupTopicTab(
                    this.state.selectedSectionId
                  );
                  const childCount = allQuestionsInTab.filter(
                    (q) => q.parentId === question._id
                  ).length;
                  const isExpanded = this.state.expandedClusters[question._id];

                  return (
                    <div className="d-flex align-items-center justify-content-center">
                      <i
                        className={`fa ${isExpanded ? "fa-chevron-down" : "fa-chevron-right"
                          } cursor-pointer mr-2`}
                        onClick={() => this.toggleExpanded(question._id)}
                        style={{
                          fontSize: "14px",
                          color: "#007bff",
                          cursor: "pointer",
                        }}
                        title={
                          isExpanded
                            ? `Thu gọn ${childCount} câu hỏi con`
                            : `Mở rộng ${childCount} câu hỏi con`
                        }
                      ></i>
                    </div>
                  );
                })()}
              </td>
              {/* 📂 Câu hỏi chùm + badge */}
              <td className="text-center align-middle p-sm-1">
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
                  {(() => {
                    // Tìm child questions trong TẤT CẢ questions của NHOM_CHU_DE tab
                    const allQuestionsInTab =
                      this.getAllQuestionsInGroupTopicTab(
                        this.state.selectedSectionId
                      );
                    const childCount = allQuestionsInTab.filter(
                      (q) => q.parentId === question._id
                    ).length;
                    return childCount;
                  })()}{" "}
                  câu hỏi con
                </span>
              </td>

              {/* Loại câu hỏi */}
              <td className="text-center align-middle p-sm-1">
                {this.renderQuestionType?.(question.type) || ""}
              </td>

              {/* Độ khó */}
              <td className="text-center align-middle p-sm-1">
                {this.renderQuestionLevel(question) ||
                  question.level ||
                  question.question_level ||
                  question.difficultyLabel ||
                  ""}
              </td>

              {/* Cột giải thích */}
              <td className="text-center align-middle p-sm-1"></td>

              {/* Video */}
              <td className="text-center align-middle p-sm-1"></td>

              {/* Ngày tải lên */}
              <td className="text-center align-middle p-sm-1">
                {question.created_at ? (
                  baseHelpers.formatDateToString(question.created_at)
                ) : (
                  <span className="badge bg-danger">Chưa có</span>
                )}
              </td>

              {/* Thao tác */}
              <td className="text-center align-middle p-sm-1">
                <div
                  className="item-action"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleOpenModalUpdateQuestion(question);
                    }}
                    title="Chỉnh sửa"
                  >
                    <img src="/assets/img/icon-edit.svg" alt="Edit" />
                  </a>
                  <a
                    onClick={() => this.handleSetDeleteQuestion(question._id)}
                    data-toggle="modal"
                    data-target="#delete-question"
                    title="Xóa"
                  >
                    <img src="/assets/img/icon-delete.svg" alt="Delete" />
                  </a>
                </div>
              </td>

              {/* Câu hỏi thử nghiệm */}
              <td style={{ width: 70, textAlign: 'center', verticalAlign: 'middle' }}>
                {!question.parentId && (
                  <label className="custom-orange-checkbox">
                    <input
                      type="checkbox"
                      checked={question.isTestQuestion || false}
                      onChange={(e) => {
                        this.handleCheckedTestingQuestion(question._id, idSubject, e.target.checked)
                      }}
                    />
                    <span className="checkmark"></span>
                  </label>
                )}

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

      /* Viền cam cho checkbox */
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

      /* Khi hover, làm đậm màu */
      .custom-orange-checkbox:hover .checkmark {
        border-color: #ff5500;
        transform: scale(1.1);
      }

      /* Khi được chọn */
      .custom-orange-checkbox input:checked + .checkmark {
        background-color: #ff7a00;
        border-color: #ff7a00;
      }

      /* Dấu tick bên trong */
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

    // ✅ GIỮ NGUYÊN: Logic render câu hỏi thường
    const answerText = this.getAnswerDisplay(
      question.correctAnswers || question.answer || question.answer_content,
      question
    );

    return (
      <Draggable
        key={`${question._id}-${index}`}
        draggableId={question._id}
        index={index}
      >
        {(provided) => (
          <tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {/* ✅ THÊM: Cột icon cho câu hỏi con */}
            <td
              className="text-center p-sm-1"
              style={isChild ? { paddingLeft: "30px" } : {}}
            >
              {isChild && (
                <i
                  className="fa fa-reply"
                  style={{ transform: "scaleX(-1)", color: "#6c757d" }}
                ></i>
              )}
            </td>

            <td className="text-center align-middle p-sm-1">
              {displayNumber ? `Câu ${displayNumber}` : ""}
            </td>

            <td className="text-center align-middle p-sm-1">
              <div
                style={{
                  maxWidth: "240px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: "0 auto",
                  textAlign: "center",
                }}
                title={answerText}
              >
                <span dangerouslySetInnerHTML={{ __html: answerText }} />
              </div>
            </td>

            <td className="text-center align-middle p-sm-1">
              {this.renderQuestionType?.(question.type) || ""}
            </td>

            <td className="text-center align-middle p-sm-1">
              {this.renderQuestionLevel(question) ||
                question.level ||
                question.question_level ||
                question.difficultyLabel ||
                ""}
            </td>

            <td className="text-center align-middle p-sm-1">
              {question.explanation && question.explanation.trim() ? (
                <span className="badge bg-success">Đã có</span>
              ) : (
                <span className="badge bg-danger">Chưa có</span>
              )}
            </td>

            <td className="text-center align-middle p-sm-1">
              {question.video || question.video_link ? (
                (() => {
                  const videoField = question.video || question.video_link;
                  const videoValue =
                    typeof videoField === "string"
                      ? videoField.trim()
                      : videoField;

                  const isLink =
                    videoValue.startsWith("http://") ||
                    videoValue.startsWith("https://");
                  return isLink ? (
                    <span className="badge bg-success">Đã có</span>
                  ) : (
                    <span className="badge bg-danger">Chưa có</span>
                  );
                })()
              ) : (
                <span className="badge bg-danger">Chưa có</span>
              )}
            </td>

            <td className="text-center align-middle p-sm-1">
              {question.created_at ? (
                baseHelpers.formatDateToString(question.created_at)
              ) : (
                <span className="badge bg-danger">Chưa có</span>
              )}
            </td>

            <td className="text-center align-middle p-sm-1">
              <div
                className="item-action"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.handleOpenModalUpdateQuestion(question);
                  }}
                  title="Chỉnh sửa"
                >
                  <img src="/assets/img/icon-edit.svg" alt="Edit" />
                </a>
                <a
                  onClick={() => this.handleSetDeleteQuestion(question._id)}
                  data-toggle="modal"
                  data-target="#delete-question"
                  title="Xóa"
                >
                  <img src="/assets/img/icon-delete.svg" alt="Delete" />
                </a>
              </div>
            </td>

            {/* Câu hỏi thử nghiệm */}
            <td style={{ width: 70, textAlign: 'center', verticalAlign: 'middle' }}>
              {/* ✅ Chỉ hiển thị checkbox khi KHÔNG phải câu hỏi con */}
              {!question.parentId && (
                <label className="custom-orange-checkbox">
                  <input
                    type="checkbox"
                    checked={question.isTestQuestion || false}
                    onChange={(e) => {
                      this.handleCheckedTestingQuestion(question._id, idSubject, e.target.checked)
                    }}
                  />
                  <span className="checkmark"></span>
                </label>
              )}

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

      /* Viền cam cho checkbox */
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

      /* Khi hover, làm đậm màu */
      .custom-orange-checkbox:hover .checkmark {
        border-color: #ff5500;
        transform: scale(1.1);
      }

      /* Khi được chọn */
      .custom-orange-checkbox input:checked + .checkmark {
        background-color: #ff7a00;
        border-color: #ff7a00;
      }

      /* Dấu tick bên trong */
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

  renderQuestionButtons = (targetId, isChildExam = false) => {
    return (
      <div
        className="question-type-group"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "20px",
        }}
      >
        <button
          className="btn btn-info"
          onClick={() =>
            isChildExam
              ? this.handleOpenModalCreateChildExamQuestion(
                "SINGLECHOICE",
                targetId
              )
              : this.handleOpenModalCreateQuestion(
                "SINGLECHOICE",
                null,
                null,
                null,
                null,
                null
              )
          }
        >
          + Trắc nghiệm
        </button>

        <button
          className="btn btn-info"
          onClick={() =>
            isChildExam
              ? this.handleOpenModalCreateChildExamQuestion(
                "TRUEFALSEMULTI",
                targetId,
                isChildExam
              )
              : this.handleOpenModalCreateQuestion(
                "TRUEFALSEMULTI",
                null,
                null,
                null,
                null,
                null
              )
          }
        >
          + Trắc nghiệm đúng sai
        </button>

        <button
          className="btn btn-info"
          onClick={() =>
            isChildExam
              ? this.handleOpenModalCreateChildExamQuestion(
                "FILLINBLANK",
                targetId,
                isChildExam
              )
              : this.handleOpenModalCreateQuestion(
                "FILLINBLANK",
                null,
                null,
                null,
                null,
                null
              )
          }
        >
          + Điền số/trả lời ngắn
        </button>

        <button
          className="btn btn-info"
          onClick={() =>
            isChildExam
              ? this.handleOpenModalCreateChildExamQuestion(
                "DRAGDROP",
                targetId,
                isChildExam
              )
              : this.handleOpenModalCreateQuestion(
                "DRAGDROP",
                null,
                null,
                null,
                null,
                null
              )
          }
        >
          + Kéo thả
        </button>

        <button
          className="btn btn-info"
          onClick={() =>
            isChildExam
              ? this.handleOpenModalCreateChildExamQuestion(
                "MULTIPLECHOICE",
                targetId,
                isChildExam
              )
              : this.handleOpenModalCreateQuestion(
                "MULTIPLECHOICE",
                null,
                null,
                null,
                null,
                null
              )
          }
        >
          + Trắc nghiệm nhiều đáp án
        </button>

        <button
          className="btn btn-info"
          onClick={() =>
            isChildExam
              ? this.handleOpenModalCreateChildExamQuestion(
                "TRUEFALSE",
                targetId,
                isChildExam
              )
              : this.handleOpenModalCreateQuestion(
                "TRUEFALSE",
                null,
                null,
                null,
                null,
                null
              )
          }
        >
          + Đúng/Sai
        </button>

        <button
          className="btn btn-info"
          onClick={() =>
            isChildExam
              ? this.handleOpenModalCreateChildExamQuestion(
                "CLUSTER",
                targetId,
                isChildExam
              )
              : this.handleOpenModalCreateQuestion(
                "CLUSTER",
                null,
                null,
                null,
                null,
                null
              )
          }
        >
          + Câu hỏi chùm
        </button>
      </div>
    );
  };

  fetchRows(
    questions,
    droppableId = "questions-table",
    subSectionId = null,
    questionNumberOffset = 0
  ) {
    if (Array.isArray(questions)) {
      // Đảm bảo parentId và question_no đúng trước khi sort
      questions.forEach((q) => {
        if (q.parentId && typeof q.parentId !== "string")
          q.parentId = String(q.parentId);
        if (q.question_no && typeof q.question_no !== "number")
          q.question_no = Number(q.question_no);
      });


      // ✅ NEW: Sử dụng QuestionNumberingService để đánh số thống nhất
      const tableType = subSectionId ? 'SUB_SECTION' : 'MAIN';
      const numberedQuestions = QuestionNumberingService.unifiedQuestionNumbering(
        questions,
        tableType,
        {
          sectionId: this.state.selectedSectionId,
          subSectionId: subSectionId,
          tabData: this.state.tabData,
          preserveExistingNumbers: true // ✅ Giữ nguyên số thứ tự từ API
        }
      );

      const rows = [];
      let rowIndex = 0;

      // Render rows với questions đã được đánh số
      numberedQuestions.forEach((question) => {
        // Skip child questions - sẽ được render trong cluster
        if (question.parentId) return;

        const isCluster = QuestionNumberingService.isClusterQuestion(question);

        if (isCluster) {
          // Render cluster row
          const childQuestions = numberedQuestions.filter(
            (q) => q.parentId === question._id
          );

          let clusterDisplayNumber = null;
          if (childQuestions.length > 0) {
            clusterDisplayNumber = childQuestions[0].number.toString();
          }

          const clusterRow = this.createRow(
            question,
            rowIndex,
            false,
            clusterDisplayNumber,
            true,
            droppableId,
            subSectionId,
            numberedQuestions
          );
          rows.push(clusterRow);
          rowIndex++;

          // Render child questions if expanded
          if (this.state.expandedClusters && this.state.expandedClusters[question._id]) {
            childQuestions.forEach((child) => {
              const childRow = this.createRow(
                child,
                rowIndex,
                true,
                child.number.toString(),
                false,
                droppableId,
                subSectionId,
                numberedQuestions
              );
              rows.push(childRow);
              rowIndex++;
            });
          }
        } else {
          // Render regular question row
          const questionRow = this.createRow(
            question,
            rowIndex,
            false,
            question.number.toString(),
            false,
            droppableId,
            subSectionId,
            numberedQuestions
          );
          rows.push(questionRow);
          rowIndex++;
        }
      });
      return rows;
    }
    return null;
  }

  getKeyTabActive = () => {
    if (!Array.isArray(this.state.tabData) || this.state.tabData.length === 0) {
      // ✅ REMOVED: Không tự động tạo section mặc định ở đây để tránh duplicate
      return "tabCreate"; // Trả về key mặc định
    }
    let tabActive = this.state.tabData.filter((item) => item.active);
    return tabActive && tabActive.length > 0 ? tabActive[0].key : "tabCreate";
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
    this.setState({
      tabData: tabNew,
    });
  };

  handleDeleteQuestionApi = async () => {
    const questionIds = this.state.deleteQuestionIds || [];
    if (questionIds.length === 0) {
      return;
    }

    try {
      // ✅ THÊM LOG: Ghi log khi xóa câu hỏi (bao gồm câu hỏi chùm)
      const questionsToDelete = [];
      this.state.tabData.forEach(tab => {
        if (tab.questions) {
          questionsToDelete.push(...tab.questions.filter(q => questionIds.includes(q._id)));
        }
        if (tab.subSections) {
          tab.subSections.forEach(sub => {
            if (sub.questions) {
              questionsToDelete.push(...sub.questions.filter(q => questionIds.includes(q._id)));
            }
          });
        }
        if (tab.childExam) {
          tab.childExam.forEach(child => {
            if (child.questions) {
              questionsToDelete.push(...child.questions.filter(q => questionIds.includes(q._id)));
            }
          });
        }
      });

      const clusterQuestions = questionsToDelete.filter(q => q.type === "CLUSTER" || q.type === "cluster");
      const updatedTabData = this.state.tabData.map((tab) => {
        const newTab = { ...tab };

        if (this.state.deleteQuestionSubSectionId && newTab.subSections) {
          newTab.subSections = newTab.subSections.map((subSection) => {
            if (subSection.id === this.state.deleteQuestionSubSectionId) {
              return {
                ...subSection,
                questions: (() => {
                  const filteredQuestions = (subSection.questions || []).filter(
                    (q) => !questionIds.includes(q._id)
                  );
                  // Sử dụng updateQuestionNumbers để đồng bộ
                  return this.updateQuestionNumbers(
                    filteredQuestions.map((q, index) => ({
                      ...q,
                      code: String(index + 1),
                    })),
                    1
                  );
                })(),
              };
            }
            return subSection;
          });
        }

        if (this.state.deleteQuestionSubSectionId && newTab.childExam) {
          newTab.childExam = newTab.childExam.map((child) => {
            if (child.idChildExam === this.state.deleteQuestionSubSectionId) {
              return {
                ...child,
                questions: (() => {
                  const filteredQuestions = (child.questions || []).filter(
                    (q) => !questionIds.includes(q._id)
                  );
                  // Sử dụng updateQuestionNumbers để đồng bộ
                  return this.updateQuestionNumbers(
                    filteredQuestions.map((q, index) => ({
                      ...q,
                      code: String(index + 1),
                    })),
                    1
                  );
                })(),
              };
            }
            return child;
          });
        }

        if (newTab.exam_section_type === "MAC_DINH") {
          newTab.questions = (newTab.questions || []).filter(
            (q) => !questionIds.includes(q._id)
          );

          // Giữ nguyên số thứ tự khi xóa câu hỏi, chỉ cập nhật code với STT thực tế
          newTab.questions.forEach((q, index) => {
            const actualSTT = q.question_no || q.number || index + 1;
            q.code = String(actualSTT);
          });
        } else if (newTab.exam_section_type === "GROUP_SUBJECT") {
          newTab.exam_section_group = (newTab.exam_section_group || []).map(
            (group) => ({
              ...group,
              subjects: (group.subjects || []).map((subject) => ({
                ...subject,
                questions: (subject.questions || [])
                  .filter((q) => !questionIds.includes(q._id))
                  .map((q, qIndex) => {
                    const actualSTT = q.question_no || q.number || qIndex + 1;
                    return {
                      ...q,
                      code: String(actualSTT),
                    };
                  }),
              })),
            })
          );
        } else if (newTab.exam_section_type === "NHOM_CHU_DE") {
          newTab.groupTopic = (newTab.groupTopic || []).map((group) => ({
            ...group,
            subjects: (group.subjects || []).map((subject) => ({
              ...subject,
              questions: (subject.questions || [])
                .filter((q) => !questionIds.includes(q._id))
                .map((q, qIndex) => {
                  const actualSTT = q.question_no || q.number || qIndex + 1;
                  return {
                    ...q,
                    code: String(actualSTT),
                  };
                }),
            })),
          }));
        }

        return newTab;
      });

      this.setState({
        tabData: updatedTabData,
        deleteQuestionIds: [],
        deleteQuestionSubSectionId: null,
      });
    } catch (error) {
      this.setState({
        deleteQuestionIds: [],
        deleteQuestionSubSectionId: null,
      });
    }
  };

  handleSetDeleteQuestion = (id, subSectionId = null) => {
    this.setState(
      {
        deleteQuestionIds: [id],
        deleteQuestionSubSectionId: subSectionId,
      },
      () => { }
    );
  };

  handleOpenModalUpdateQuestion = (question, subSectionId = null) => {
    // Kiểm tra nếu đây là câu hỏi con (có parentId)
    const isChildQuestion = !!question.parentId;
    // Danh sách các type hợp lệ cho câu hỏi con
    const validQuestionTypes = [
      "SINGLECHOICE",
      "MULTIPLECHOICE",
      "TRUEFALSE",
      "TRUEFALSEMULTI",
      "FILLINBLANK",
      "DRAGDROP",
    ];

    const hasValidType =
      question.type && validQuestionTypes.includes(question.type.toUpperCase());

    // Nếu là câu hỏi con và chưa có type hợp lệ, hiển thị modal chọn loại
    if (isChildQuestion && !hasValidType) {
      this.setState({
        showChildQuestionTypeModal: true,
        selectedChildParentId: question.parentId,
        currentQuestionvalue: question,
        actionQuestion: "update",
        currentSubSectionId: subSectionId,
      });
      return;
    }

    const rawHtml = question.rawHtml || "";
    const imageTagRegex = /<img[^>]*>/gi;
    const imageTags = rawHtml.match(imageTagRegex);

    // ✅ Tính questionNo đúng cho câu hỏi đang update
    let questionNo;

    // ✅ QUAN TRỌNG: Xác định loại section để xử lý đúng
    const currentTab = this.state.tabData?.find(
      (tab) => tab._id === this.state.selectedSectionId
    );

    if (currentTab?.exam_section_type === "NHOM_CHU_DE") {
      // ✅ NHOM_CHU_DE: Sử dụng logic riêng
      questionNo = question.number || question.question_no || 0;
    } else if (subSectionId) {
      // ✅ Sub-section (MAC_DINH): Lấy STT hiện tại từ question
      questionNo = question.number || question.question_no || 0;
    } else {
      // ✅ Main section (MAC_DINH): Lấy STT hiện tại từ question
      questionNo = question.number || question.question_no || 0;
    }

    // ✅ Bổ sung: nếu đang ở NHOM_CHU_DE, xác định đúng group/subject theo câu hỏi đang edit
    let resolvedTopicId = null;
    let resolvedSubjectId = null;
    let resolvedSelectedGroupSubject = this.state.selectedGroupSubject || {};
    if (currentTab?.exam_section_type === "NHOM_CHU_DE" && Array.isArray(currentTab.groupTopic)) {
      outer:
      for (let gi = 0; gi < currentTab.groupTopic.length; gi++) {
        const group = currentTab.groupTopic[gi];
        for (let sj = 0; sj < (group.subjects || []).length; sj++) {
          const subj = group.subjects[sj];
          const found = (subj.questions || []).some((q) => q._id === question._id);
          if (found) {
            resolvedTopicId = group.idTopic || null;
            resolvedSubjectId = subj.idSubject || null;
            resolvedSelectedGroupSubject[gi] = sj;
            break outer;
          }
        }
      }
    }

    this.setState(
      {
        actionQuestion: "update",
        currentQuestionvalue: null,
        currentSubSectionId: subSectionId,
        childExamId: subSectionId || null, // Chỉ set childExamId nếu có subSectionId, ngược lại luôn null
        currentClusterId:
          question.type === "CLUSTER" || question.type === "cluster"
            ? question._id
            : null, // Set currentClusterId nếu là cluster
        questionNo: questionNo, // ✅ Set questionNo đúng vào state
        // ✅ Set context cho NHOM_CHU_DE để getQuestionsForCurrentSelection chọn đúng bảng
        currentTopicId: resolvedTopicId ?? this.state.currentTopicId ?? null,
        currentSubjectId: resolvedSubjectId ?? this.state.currentSubjectId ?? null,
        selectedGroupSubject: resolvedSelectedGroupSubject,
      },
      () => {
        // Sau khi đã reset xong, mới đặt currentQuestionvalue
        const normalized = this.normalizeQuestionForModal
          ? this.normalizeQuestionForModal(question)
          : question;

        // ✅ THÊM: Kiểm tra nếu normalized là null (do không có childQuestions cho cluster)
        if (normalized === null) {

          return;
        }

        this.setState({ currentQuestionvalue: normalized }, () => {
          // Sau khi đã cập nhật state xong, đợi một tick rồi mở modal tương ứng
          // (đảm bảo Props đã propagate xuống Modal component)
          setTimeout(() => {
            const t = (normalized.type || "").toString().toUpperCase();

            // Helper to trigger by id
            const trigger = (id) => $(id).trigger("click");

            // Prefer type-based mapping but also fallback to inspecting answer shapes
            if (t === "SINGLECHOICE") {
              trigger("#create-update"); // single choice (A/B/C/D)
              return;
            }

            if (t === "MULTIPLECHOICE") {
              trigger("#create-update5"); // multiple choice
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

            // TN-specific true/false (trắc nghiệm đúng sai)
            if (t === "TRUEFALSEMULTI") {
              trigger("#create-update2");
              return;
            }

            // True/False variants: traditional Đúng/Sai
            if (t === "TRUEFALSE") {
              trigger("#create-update6");
              return;
            }

            if (t === "CLUSTER") {
              trigger("#create-update7");
              return;
            }

            // As a final fallback, inspect the answer shape (boolean -> traditional Đúng/Sai)
            // const ans =
            //   normalized.correctAnswers ||
            //   normalized.answer ||
            //   normalized.correctAnswer;
            // if (
            //   typeof ans === "boolean" ||
            //   ans === true ||
            //   ans === false ||
            //   String(ans).toUpperCase() === "TRUE" ||
            //   String(ans).toUpperCase() === "FALSE"
            // ) {
            //   trigger("#create-update6");
            //   return;
            // }

            // if (Array.isArray(ans)) {
            //   // array of objects or letters -> multiple or single choice
            //   if (ans.length > 1) trigger("#create-update5");
            //   else trigger("#create-update");
            //   return;
            // }

            // default: open single choice modal (ABCD)
            trigger("#create-update");
          }, 0);
        });
      }
    );
  };

  handleOpenModalCreateChildExamQuestion = function (type, idChildExam) {
    try {
      const t = (type || "").toString().toUpperCase();
      const trigger = (id) => $(id).trigger("click");

      // ✅ Tìm childExam theo id
      const tabData = Array.isArray(this.state.tabData)
        ? this.state.tabData
        : [];
      let foundChildExam = null;
      let parentSectionId = null;

      for (const tab of tabData) {
        if (Array.isArray(tab.childExam)) {
          const match = tab.childExam.find(
            (child) => child.idChildExam === idChildExam
          );
          if (match) {
            foundChildExam = match;
            parentSectionId = tab._id;
            break;
          }
        }
      }

      if (!foundChildExam) {
        notification.error({
          message: "Không tìm thấy phần thi con",
          description: `idChildExam = ${idChildExam}`,
          placement: "topRight",
        });
        return;
      }

      // Tìm số thứ tự lớn nhất thay vì đếm length
      let maxNumber = 0;
      if (foundChildExam.questions && Array.isArray(foundChildExam.questions)) {
        foundChildExam.questions.forEach((q) => {
          if (
            q.type !== "CLUSTER" &&
            q.type !== "cluster" &&
            q.type !== "CLUSTER"
          ) {
            const currentNumber = q.number || q.question_no || 0;
            if (currentNumber > maxNumber) {
              maxNumber = currentNumber;
            }
          }
        });
      }
      const questionNo = maxNumber + 1;

      // ✅ Set state trước khi mở modal
      this.setState(
        {
          childExamId: idChildExam,
          examSectionId: parentSectionId, // gán section cha
          currentSubSectionId: idChildExam, // gán id childExam hiện tại
          questionNo,
          actionQuestion: "create",
          statusTopic: "", // childExam không liên quan đến groupTopic
          currentQuestionvalue: null,
          currentTopicId: null,
          currentSubjectId: null,
          currentClusterId: null,
        },
        () => {
          // ✅ Mở modal theo type
          if (t === "SINGLECHOICE") return trigger("#create-update");
          if (t === "MULTIPLECHOICE") return trigger("#create-update5");
          if (t === "DRAGDROP") return trigger("#create-update4");
          if (t === "FILLINBLANK") return trigger("#create-update3");
          if (t === "TRUEFALSE") return trigger("#create-update6");
          if (t === "TRUEFALSEMULTI") return trigger("#create-update2");
          if (t === "CLUSTER") return trigger("#create-update7");

          // default fallback
          trigger("#create-update");
        }
      );
    } catch (e) {
      // Error handled silently
    }
  };

  // Open modal to create a new question of given type
  handleOpenModalCreateQuestion = function (
    type,
    status,
    groupIdx,
    subjIdx,
    idTopic,
    idSubject
  ) {
    try {
      const t = (type || "").toString().toUpperCase();
      const trigger = (id) => $(id).trigger("click");

      // Đồng bộ section hiện tại với state trước khi mở modal
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
        (s) => s.id === this.state.selectedSectionId
      );
      if (selectedIndex >= 0 && selectedIndex < tabData.length) {
        sectionId = tabData[selectedIndex]._id || sectionId;
      }

      // Nếu là nhóm chủ đề, lấy đúng subject đang chọn và idTopic, idSubject
      let selectedSubject = this.state.listSubjectGroups;
      let topicId = idTopic || "";
      let subjectId = idSubject || "";
      if (status === "Group" && typeof groupIdx === "number") {
        const currentTab = tabData.find((tab) => tab._id === sectionId);
        if (
          currentTab &&
          currentTab.groupTopic &&
          currentTab.groupTopic[groupIdx]
        ) {
          // Đảm bảo selectedGroupSubject[groupIdx] tồn tại
          let subjIdx = this.state.selectedGroupSubject?.[groupIdx];
          if (subjIdx === undefined) {
            subjIdx = 0;
            // Cập nhật state để đảm bảo subjIdx tồn tại
            this.setState((prevState) => ({
              selectedGroupSubject: {
                ...prevState.selectedGroupSubject,
                [groupIdx]: subjIdx,
              },
            }));
          }
          selectedSubject = currentTab.groupTopic[groupIdx].subjects[subjIdx];
          topicId = currentTab.groupTopic[groupIdx].idTopic || topicId;
          subjectId = selectedSubject?.idSubject || subjectId;

          // Đảm bảo selectedSubject có idSubject hợp lệ
          if (
            selectedSubject &&
            (!selectedSubject.idSubject ||
              selectedSubject.idSubject.trim() === "")
          ) {
            selectedSubject.idSubject = this.generateObjectId();
          }
        }
      }

      // ✅ FIX: Lấy question number đúng - tính chính xác cho cả manual và upload
      let questionNo;

      // Lấy currentTab để phân tích
      const currentTab = tabData.find((tab) => tab._id === sectionId);

      if (status === "Group") {
        // ✅ NHOM_CHU_DE: Dùng logic riêng
        questionNo = this.getQuestionNoNew(
          sectionId,
          this.state.examSectionGroupId,
          subjectId
        );
      } else {
        // ✅ MAC_DINH: Tính STT chính xác dựa trên questions hiện có
        if (currentTab) {
          // Helper function để đếm số câu hỏi thực sự (không tính cluster parent)
          const countRealQuestions = (questions) => {
            let count = 0;
            questions.forEach((q) => {
              const isCluster =
                q.type === "cluster" ||
                q.type === "Cluster" ||
                q.type === "CLUSTER";
              if (isCluster) {
                // Đếm child questions của cluster
                const childCount = questions.filter(
                  (child) => child.parentId === q._id
                ).length;
                count += childCount;
              } else if (!q.parentId) {
                // Đếm câu hỏi thường (không phải child)
                count += 1;
              }
            });
            return count;
          };

          let totalQuestions = 0;

          // 🎯 BƯỚC 1: Kiểm tra main questions
          const mainQuestions = currentTab.questions || [];
          const mainQuestionsCount = countRealQuestions(mainQuestions);

          // 🎯 BƯỚC 2: Kiểm tra có main sub-section không
          const mainSubSection = currentTab.subSections?.find(
            (sub) => sub.isMain === true
          );

          // ✅ QUAN TRỌNG: Logic xác định bảng chính
          if (
            mainSubSection &&
            mainSubSection.questions &&
            mainSubSection.questions.length > 0
          ) {
            // Case A: Bảng chính là main sub-section (có questions)
            totalQuestions = countRealQuestions(mainSubSection.questions || []);
          } else if (mainQuestionsCount > 0) {
            // Case B: Bảng chính là currentTab.questions
            totalQuestions = mainQuestionsCount;
          } else {
            // ✅ Case C: BẢNG CHÍNH TRỐNG - bắt đầu từ 1
            totalQuestions = 0;
          }

          // 🎯 BƯỚC 3: KHÔNG cộng dồn questions từ các sub-sections cho bảng chính
          // Sub-sections có STT riêng, không ảnh hưởng đến STT của bảng chính
          questionNo = totalQuestions + 1;
        } else {
          // Fallback nếu không tìm thấy tab
          questionNo = 1;
        }
      }

      this.setState(
        {
          examSectionId: sectionId,
          questionNo, // ✅ Sử dụng STT đã tính toán
          actionQuestion: "create",
          statusTopic: status === "Group" ? "NHOM_CHU_DE" : "",
          currentQuestionvalue: null,
          currentSubSectionId: null,
          listSubjectGroups: selectedSubject,
          currentTopicId: topicId,
          currentSubjectId: subjectId,
          currentClusterId: this.state.currentClusterId || null, // ✅ Giữ nguyên nếu đã set (đang trong context cluster)
          childExamId: null, // Reset childExamId về null khi tạo cho bảng chính
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
          // default fallback to single choice
          trigger("#create-update");
        }
      );
    } catch (e) { }
  };

  handleOpenModalCreateQuestionGroup() {
    // Ngăn mở modal nếu đang trong quá trình tạo topic group
    if (this.state.isAddingTopicGroup) {
      return;
    }

    // Reset state trước khi mở modal tạo group topic mới
    this.setState(
      {
        actionGroup: "create",
        groupDetail: null,
      },
      () => {
        const trigger = (id) => $(id).trigger("click");
        trigger("#create-group");
      }
    );
  }

  // Open modal to create a new child question for cluster
  handleOpenModalCreateChildQuestion = function (type, parentId) {
    try {
      const t = (type || "").toString().toUpperCase();
      const trigger = (id) => $(id).trigger("click");

      // Set state for child question creation
      this.setState(
        {
          currentClusterId: parentId, // Set parent cluster ID
          actionQuestion: "create",
          currentQuestionvalue: null,
          currentSubSectionId: null,
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

          // Default to single choice
          trigger("#create-update");
        }
      );
    } catch (e) { }
  };

  handleOpenModalCreateQuestionForSubSection = function (type, subSectionId) {
    try {
      const t = (type || "").toString().toUpperCase();
      const trigger = (id) => $(id).trigger("click");
      const questionNo = this.getQuestionNoNewForSubSection(subSectionId);

      // Set state for sub-section
      this.setState(
        {
          currentSubSectionId: subSectionId,
          childExamId: subSectionId,
          actionQuestion: "create",
          currentQuestionvalue: null,
          questionNo: questionNo,
          currentClusterId: this.state.currentClusterId || null,
        },
        () => {
          if (t === "SINGLECHOICE") {
            trigger("#create-update");
            return;
          }

          if (t === "TRUEFALSEMULTI") {
            trigger("#create-update2");
            return;
          }

          // ✅ Thêm các alias cho FILLINBLANK
          if (t === "FILLINBLANK") {
            trigger("#create-update3");
            return;
          }

          if (t === "DRAGDROP") {
            trigger("#create-update4");
            return;
          }

          // ✅ Thêm các alias cho MULTICHOICE
          if (t === "MULTIPLECHOICE") {
            trigger("#create-update5");
            return;
          }

          // ✅ Thêm các alias cho TRUEFALSE
          if (t === "TRUEFALSE") {
            trigger("#create-update6");
            return;
          }

          // ✅ Thêm các alias cho CLUSTER
          if (t === "CLUSTER") {
            trigger("#create-update7");
            return;
          }

          console.warn(
            "[handleOpenModalCreateQuestionForSubSection] Unknown type:",
            t
          );
        }
      );

    } catch (e) {

    }
  };

  // Method để lấy question number riêng cho từng sub-section
  // ⚠️ QUAN TRỌNG: Phải tính theo STT liên tục (offset từ main + các sub trước đó)

  getQuestionNoNewForSubSection(subSectionId) {
    try {
      // ✅ Sử dụng QuestionNumberingService để lấy STT tiếp theo cho sub-section
      const nextNumber = QuestionNumberingService.getNextSubSectionQuestionNumber(
        this.state.tabData,
        this.state.selectedSectionId,
        subSectionId
      );

      return nextNumber;
    } catch (error) {
      console.error(
        "❌ ExamCreate - Error in getQuestionNoNewForSubSection:",
        error
      );
      return 1;
    }
  }

  // Method debug để kiểm tra STT trong bảng hiển thị
  debugQuestionNumbers = (subSectionId) => {
    try {
      const currentTab = this.state.tabData.find(
        (tab) => tab._id === this.state.selectedSectionId
      );
      if (currentTab && Array.isArray(currentTab.subSections)) {
        const subSection = currentTab.subSections.find(
          (sub) => sub.id === subSectionId
        );
        if (subSection && Array.isArray(subSection.questions)) {
          subSection.questions.forEach((q, index) => {
            const displayNumber = q.number || q.question_no || index + 1;
            if (
              (q.type === "cluster" ||
                q.type === "Cluster" ||
                q.type === "CLUSTER") &&
              Array.isArray(q.childQuestions)
            ) {
              q.childQuestions.forEach((child, childIndex) => {
                const childDisplayNumber =
                  child.number ||
                  child.question_no ||
                  displayNumber + childIndex + 1;
              });
            }
          });
        }
      }
    } catch (error) {

    }
  };

  // Handle delete sub-section
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
              (sub) => sub.id === subSectionId
            );
            const willBeEmpty = (updatedTab.subSections?.length || 0) === 1;

            if (updatedTab.subSections) {
              updatedTab.subSections = updatedTab.subSections.filter(
                (sub) => sub.id !== subSectionId
              );
            }

            // ✅ 2. THÊM: Xóa từ childExam tương ứng
            if (updatedTab.childExam) {
              updatedTab.childExam = updatedTab.childExam.filter(
                (child) => String(child.idChildExam) !== String(subSectionId)
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
      }
    );

    notification.success({
      message: "Xóa phần thi con thành công",
      placement: "topRight",
    });
  };

  getQuestionNoNew(examSectionId, examSectionGroupId, examSectionSubjectId) {
    try {
      let tabNew = this.state.tabData;
      if (!tabNew || tabNew.length === 0) return 1;
      for (let i = 0; i < tabNew.length; i++) {
        if (tabNew[i]._id === examSectionId) {
          let maxQuestionNo = 0;
          if (tabNew[i].exam_section_type === "MAC_DINH") {
            // 🎯 Kiểm tra xem có main sub-section không
            const mainSubSection = tabNew[i].subSections?.find(
              (sub) => sub.isMain === true
            );

            const questionsToCheck = mainSubSection
              ? mainSubSection.questions || []
              : tabNew[i].questions || [];

            if (Array.isArray(questionsToCheck)) {
              questionsToCheck.forEach((q) => {
                // Tìm số lớn nhất thay vì đếm tổng số
                if (
                  q.type !== "CLUSTER" &&
                  q.type !== "cluster" &&
                  q.type !== "CLUSTER"
                ) {
                  const currentNumber = q.number || q.question_no || 0;
                  if (currentNumber > maxQuestionNo) {
                    maxQuestionNo = currentNumber;
                  }
                }
              });
            }

            return maxQuestionNo + 1;
          } else if (tabNew[i].exam_section_type === "NHOM_CHU_DE") {
            // Lấy idSubject từ listSubjectGroups nếu chưa truyền vào
            const subjectId =
              examSectionSubjectId ||
              (this.state.listSubjectGroups &&
                this.state.listSubjectGroups.idSubject);
            if (tabNew[i].groupTopic && Array.isArray(tabNew[i].groupTopic)) {
              for (let group of tabNew[i].groupTopic) {
                if (group.subjects && Array.isArray(group.subjects)) {
                  for (let subject of group.subjects) {
                    if (
                      subject.idSubject === subjectId ||
                      subject.subject_id === subjectId
                    ) {
                      if (
                        subject.questions &&
                        Array.isArray(subject.questions)
                      ) {
                        subject.questions.forEach((q) => {
                          // Tìm số lớn nhất thay vì đếm tổng số
                          if (
                            q.type !== "CLUSTER" &&
                            q.type !== "cluster" &&
                            q.type !== "CLUSTER"
                          ) {
                            const currentNumber =
                              q.number || q.question_no || 0;
                            if (currentNumber > maxQuestionNo) {
                              maxQuestionNo = currentNumber;
                            }
                          }
                        });
                      }
                    }
                  }
                }
              }
            }
            return maxQuestionNo + 1;
          }
        }
      }
      return 1;
    } catch (error) {
      return 1;
    }
  }

  async createQuestionApi(request) {
    // Không gọi API trong màn hình tạo/sửa tức thời; trả object cục bộ
    const now = new Date().toISOString();
    const id = `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return {
      _id: id,
      created_at: now,
      ...request,
    };
  }

  async updateQuestionApi(request) {
    // Không gọi API: trả về request như là question đã cập nhật
    return { ...request };
  }

  async createNewExamApi() {
    // Chỉ được dùng khi nhấn Lưu (đã kiểm soát ở handleSave)
    setLoader(true);
    try {
      let data = {
        name: this.state.name || "Đề thi mới",
        group: this.state.group || "MAC_DINH",
        level: this.state.level,
        creating_type: this.state.type_question || "MANUAL",
        subject_id: this.state.subject_id,
        exam_doc_link: this.state.linkExam,
        exam_doc_link2: this.state.linkExam2,
        answer_doc_link: this.state.linkAnswer,
        time: this.state.time || 180,
        is_redo: this.state.is_redo || false,
        classroom_id: null,
        is_pay_fee: true,
        type: this.state.typeExam || "TOT_NGHIEP",
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


      // const examId = this.props.exam?._id;
      // if (!examId) {
      //   throw new Error("Failed to get examId from response");
      // }
      // Set examId và đợi state update
      // await new Promise((resolve) => {
      //   this.setState({ examId }, () => {
      //     resolve();
      //   });
      // });

      // Khởi tạo default tabData nếu chưa có
      if (!this.state.tabData || this.state.tabData.length === 0) {
        await new Promise((resolve) => {
          this.initializeDefaultTabData();
          setTimeout(resolve, 100); // Đợi state update
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoader(false);
    }
  }

  async createGroupSectionApi(data) {
    setLoader(true);
    await this.props.createSection(data);
    setLoader(false);
  }

  handleOpenUpdateGroupQuestion = (idItemTabData) => {
    if (this.state.isAddingTopicGroup) {
      return;
    }

    try {
      // ✅ Tìm tab có _id trùng với idItemTabData
      const foundTab = this.state.tabData.find(tab => tab._id === idItemTabData);

      if (!foundTab) {
        notification.error({
          message: "Không tìm thấy phần thi",
          description: `Không tìm thấy phần thi với ID: ${idItemTabData}`,
          placement: "topRight",
        });
        return;
      }
      if (foundTab.exam_section_type !== "NHOM_CHU_DE" || !foundTab.groupTopic) {
        notification.error({
          message: "Phần thi không hợp lệ",
          description: "Chỉ có thể chỉnh sửa phần thi nhóm chủ đề",
          placement: "topRight",
        });
        return;
      }
      const groupDetailForModal = {
        maxTopics: foundTab.maxTopics || foundTab.groupTopic[0]?.maxTopics || 1,
        groups: foundTab.groupTopic.map(group => ({
          id: group.idTopic,
          name: group.nameTopic,
          type: group.type || "single",
          maxTopics: group.maxTopics || 1,
          maxSubjects: group.maxSubjects || 1,
          subjects: group.subjects.map(subject => ({
            id: subject.idSubject,
            name: subject.nameSubject,
            questions: subject.questions || []
          }))
        }))
      };
      this.setState(
        {
          actionGroup: "update",
          groupDetail: groupDetailForModal,
          itemGroupTabData: groupDetailForModal,
          isAddingTopicGroup: false,
          selectedSectionId: idItemTabData,
          examSectionId: idItemTabData,
        },
        () => {
          // ✅ Trigger modal mở bằng jQuery như code hiện tại
          const trigger = (id) => $(id).trigger("click");
          trigger("#create-group");
        }
      );

    } catch (error) {
      console.error('❌ Error opening update group modal:', error);
      notification.error({
        message: "Lỗi khi mở modal chỉnh sửa",
        description: error.message,
        placement: "topRight",
      });
    }
  };

  async updateGroupQuestion(topicGroups) {
    // Kiểm tra trạng thái loading để tránh click nhiều lần
    if (this.state.isAddingTopicGroup) {
      return;
    }

    // ✅ THÊM: Kiểm tra an toàn cho tham số topicGroups
    if (!topicGroups || !Array.isArray(topicGroups) || topicGroups.length === 0) {
      console.error('[ERROR] updateGroupQuestion: topicGroups parameter is invalid or empty');
      this.closeGroupModal();
      return;
    }

    // Set loading state
    this.setState({ isAddingTopicGroup: true });

    // Sử dụng setTimeout để đảm bảo UI được cập nhật
    setTimeout(() => {
      try {
        this.setState((prevState) => {
          const updatedTabData = [...prevState.tabData];

          // Tìm tab hiện tại chứa NHOM_CHU_DE
          const currentTabIndex = updatedTabData.findIndex(
            tab => tab._id === prevState.selectedSectionId && tab.exam_section_type === "NHOM_CHU_DE"
          );

          if (currentTabIndex === -1) {
            console.warn('Không tìm thấy NHOM_CHU_DE section để update');
            return prevState;
          }

          const currentTab = updatedTabData[currentTabIndex];

          // ✅ THÊM: Xử lý từng nhóm trong topicGroups để cập nhật
          const processedGroups = [];

          for (const groupData of topicGroups) {
            // ✅ THÊM: Kiểm tra an toàn cho groupData
            if (!groupData) {
              console.warn('[WARN] Skipping invalid group data');
              continue;
            }

            // ✅ SỬA: Lấy tên nhóm từ 'nameTopic' (format mới)
            const groupName = (groupData.nameTopic || groupData.name || "Nhóm chủ đề mặc định").trim();

            // ✅ THÊM: Validation để đảm bảo tên nhóm không rỗng
            if (!groupName || groupName === "" || groupName === "Nhóm chủ đề mặc định") {
              console.warn('[WARN] Group name is empty or default, this might indicate data mismatch from modal');
            }

            // ✅ SỬA: Xử lý subjects trong nhóm với format mới
            let processedSubjects = [];
            if (groupData.subjects && Array.isArray(groupData.subjects)) {
              processedSubjects = groupData.subjects.map((item, index) => {
                // ✅ SỬA: Sử dụng 'nameSubject' và 'idSubject' từ format mới
                const subjectName = (item.nameSubject || item.name || `Môn ${index + 1}`).trim();
                const subjectId = item.idSubject || item.id || this.generateObjectId();

                return {
                  idSubject: subjectId,
                  nameSubject: subjectName,
                  questions: item.questions || [] // ✅ Preserve existing questions
                };
              });
            } else {
              console.warn('[THIẾU THÔNG TIN] Nhóm chủ đề thiếu danh sách môn học. Vui lòng thêm môn học.');
              processedSubjects = [];
            }

            // ✅ SỬA: Chuẩn bị data cho groupTopic với format đúng
            const updatedGroupData = {
              idTopic: groupData.idTopic || `topic-${Date.now()}`,
              nameTopic: groupName,
              type: groupData.type || "single", // ✅ THÊM: Preserve type từ modal
              maxTopics: groupData.maxTopics || 1, // ✅ THÊM: Preserve maxTopics từ modal
              subjects: processedSubjects
            };

            processedGroups.push(updatedGroupData);
          }

          // ✅ THÊM: Validate có ít nhất một group hợp lệ
          if (processedGroups.length === 0) {
            console.error('Không có nhóm chủ đề hợp lệ nào để cập nhật.');
            return prevState;
          }

          // ✅ SỬA: Cập nhật tabData với groups đã được cập nhật
          currentTab.groupTopic = processedGroups; // ✅ SỬA: Thay thế toàn bộ groupTopic với data mới


          this.closeGroupModal(); // Đóng modal

          return {
            tabData: updatedTabData,
            // Cập nhật selectedGroupSubject nếu cần
            selectedGroupSubject: {
              ...prevState.selectedGroupSubject,
              0: 0 // Reset về subject đầu tiên cho group đầu tiên
            },
            isAddingTopicGroup: false, // Reset loading state
          };
        }, () => {
          // ✅ CALLBACK: Thực hiện sau khi setState hoàn thành

          // Đồng bộ sections với tabData để UI cập nhật
          this.syncSectionsWithTabData();

          // Lưu vào session storage
          this.saveTabDataToSession();

          // Force update để đảm bảo UI re-render
          this.forceUpdate();

        });

      } catch (error) {
        console.error('Error updating group question:', error);
        // Reset loading state nếu có lỗi
        this.setState({ isAddingTopicGroup: false });

        notification.error({
          message: "Lỗi khi cập nhật nhóm chủ đề",
          description: error.message,
          placement: "topRight",
        });
      }
    }, 100);

    // ✅ THÊM: Hiển thị thông báo thành công
    notification.success({
      message: "Cập nhật nhóm chủ đề thành công",
      description: `Đã cập nhật ${topicGroups.length} nhóm chủ đề`,
      placement: "topRight",
    });
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
                (o) => o.exam_section_group_order
              )
            ) + 1;
        }
      }
    }
    return order;
  }

  async loadDetailExamAPI(examId) {
    try {
      setLoader(true);
      const data = {
        exam_id: examId,
        creating_type: "MANUAL",
      };

      await this.props.detailExam(data);
      let {
        exam_section: dataExamSection,
        name,
        type,
        is_redo,
        group,
        level,
        subject,
        point_true_false,
        exam_doc_link,
        exam_doc_link2,
        answer_doc_link,
      } = this.props.detail;

      if (dataExamSection?.length > 0) {
        // Mark the first section as active and others as inactive
        dataExamSection.forEach((section, index) => {
          section.active = index === 0;

          // If section type is 'GROUP_SUBJECT', process its groups
          if (section.exam_section_type === "GROUP_SUBJECT") {
            section.exam_section_group.forEach((groupData) => {
              for (const subject of groupData.subjects) {
                const subIndex = groupData.subjects.indexOf(subject);
                subject.active = subIndex === 0;
              }
            });
          }
        });
        dataExamSection = dataExamSection.sort(
          (a, b) => a.exam_section_order - b.exam_section_order
        );
      }

      let pointTrueFalse1 =
        point_true_false === undefined ? 0 : point_true_false["1"];
      let pointTrueFalse2 =
        point_true_false === undefined ? 0 : point_true_false["2"];
      let pointTrueFalse3 =
        point_true_false === undefined ? 0 : point_true_false["3"];
      let pointTrueFalse4 =
        point_true_false === undefined ? 0 : point_true_false["4"];
      let pointTrueFalse = point_true_false === undefined ? false : true;

      // Update the state with the transformed data
      this.setState({
        tabData: dataExamSection || [],
        typeExam: type,
        statusTabCreate: !(dataExamSection?.length > 0),
        subject_id: subject.id,
        pointTrueFalse,
        pointTrueFalse1,
        pointTrueFalse2,
        pointTrueFalse3,
        pointTrueFalse4,
        name,
        is_redo,
        group,
        level,
        linkExam: exam_doc_link === null ? "" : exam_doc_link,
        linkExam2: exam_doc_link2 === null ? "" : exam_doc_link2,
        linkAnswer: answer_doc_link === null ? "" : answer_doc_link,
      });
    } catch (error) {
    } finally {
      setLoader(false);
    }
  }

  getData = () => {
    const data = {
      limit: 999,
      is_delete: false,
    };
    return data;
  };

  activeTab = (key) => {
    // Clone the tabData array to avoid direct mutation
    const updatedTabData = this.state.tabData.map((item) => ({
      ...item,
      active: item._id === key, // Set active true only for the matching tab
    }));

    // Update the state with the new tabData and statusTabCreate
    this.setState({
      tabData: updatedTabData,
      statusTabCreate: false,
      selectedSectionId: key, // ✅ FIX: Đồng bộ selectedSectionId với tab đang active
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

  // Return questions for the currently selected section/subject using tabData first,
  // fallback to sections if tabData does not contain the section.

  setSelectedId(examSectionId, examSectionGroupId, examSectionSubjectId) {
    let questionNo = this.getNextQuestionNumber();
    this.setState(
      {
        examSectionId,
        examSectionGroupId,
        examSectionSubjectId,
        questionNo,
        actionQuestion: "create",
        currentQuestionvalue: null, // Reset currentQuestionvalue khi tạo mới
      },
      () => {
        // Đảm bảo state đã được cập nhật trước khi bất kỳ modal nào được mở
      }
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
    if (tab.exam_section_type === "MAC_DINH") {
      total = (tab.questions || []).filter((q) => q.parentId).length; // Only count child questions
    } else {
      for (let i = 0; i < (tab.exam_section_group || []).length; i++) {
        for (
          let j = 0;
          j < (tab.exam_section_group[i].subjects || []).length;
          j++
        ) {
          total += (
            tab.exam_section_group[i].subjects[j].questions || []
          ).filter((q) => q.parentId).length; // Only count child questions
        }
      }
    }
    return total;
  }

  // Return questions for the currently selected section/subject using tabData first,
  // fallback to sections if tabData does not contain the section.
  getQuestionsForCurrentSelection = () => {
    const { selectedSectionId, selectedSubject, tabData, sections } = this.state;
    // Đảm bảo tabData được khởi tạo
    if (!Array.isArray(tabData) || tabData.length === 0) {
      this.ensureDefaultSection();
      return []; // Return empty for this call, will be populated after state update
    }

    // If no section is selected, try to use the first available section from tabData
    let currentSectionId = selectedSectionId;
    if (!currentSectionId && Array.isArray(tabData) && tabData.length > 0) {
      currentSectionId = tabData[0]._id;
    }

    if (!currentSectionId) {
      return [];
    }

    // Try tabData (the authoritative structure where questions are added)
    if (Array.isArray(tabData) && tabData.length > 0) {
      const tab = tabData.find((t) => t._id === currentSectionId);
      if (tab) {
        // MAC_DINH section - LUÔN return main questions
        if (tab.exam_section_type === "MAC_DINH" || !tab.exam_section_type) {
          let qs = tab.questions || [];
          if (selectedSubject && selectedSubject.id) {
            qs = qs.filter(
              (q) =>
                q.subject_id === selectedSubject.id ||
                q.subjectId === selectedSubject.id
            );
          }
          return qs; // ✅ Luôn return main questions, không bị ảnh hưởng bởi sub-sections
        }

        // NHOM_CHU_DE section - trả về questions từ subject đang chọn
        if (tab.exam_section_type === "NHOM_CHU_DE") {
          if (tab.groupTopic && Array.isArray(tab.groupTopic)) {
            // Ưu tiên currentTopicId/currentSubjectId nếu có
            const currTopicId = this.state.currentTopicId;
            const currSubjectId = this.state.currentSubjectId;
            if (currTopicId) {
              const gIdx = tab.groupTopic.findIndex(
                (g) => String(g.idTopic) === String(currTopicId)
              );
              if (gIdx !== -1) {
                let sIdx = -1;
                if (currSubjectId) {
                  sIdx = (tab.groupTopic[gIdx].subjects || []).findIndex(
                    (s) => String(s.idSubject) === String(currSubjectId)
                  );
                }
                if (sIdx === -1 || sIdx == null) {
                  sIdx = this.state.selectedGroupSubject?.[gIdx] ?? 0;
                }
                return tab.groupTopic[gIdx]?.subjects?.[sIdx]?.questions || [];
              }
            }

            // Fallback: dùng selectedGroupSubject nếu chưa có currentTopicId
            const groupKeys = Object.keys(this.state.selectedGroupSubject || {});
            if (groupKeys.length > 0) {
              const groupIdx = parseInt(groupKeys[0], 10);
              const subjectIdx = this.state.selectedGroupSubject[groupIdx] ?? 0;

              if (
                tab.groupTopic[groupIdx] &&
                tab.groupTopic[groupIdx].subjects &&
                tab.groupTopic[groupIdx].subjects[subjectIdx]
              ) {
                return (
                  tab.groupTopic[groupIdx].subjects[subjectIdx].questions || []
                );
              }
            }
          }
          return [];
        }
      }
    }

    return [];
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

  _onChageInputTotalScore = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].total_score = value; // Update the total_score
      this.setState({ tabData: updatedTabData }); // Set updated state
    }
  };

  _onChageInputNameSection = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].exam_section_name = value; // Update the total_score
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
          }
        );
      }
    });
    this.setState({ tabData: updatedTabData });
  };

  _onChangeNameTab = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (updatedTabData[name]) {
      updatedTabData[name].name = value;
      this.setState({ tabData: updatedTabData });
    }
  };

  // Generic input change handler used by many form controls
  _onChange = (e) => {
    if (!e || !e.target) return;
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    // Reset một số textfield khi đổi các dropdown chính (KHÔNG reset tên đề thi)
    if (name === "examTypeId" || name === "alias") {
      this.setState({
        [name]: val,
        linkExam: "",
        linkAnswer: "",
        // Chú ý: KHÔNG reset name (tên đề thi)
      });
      return;
    }

    this.setState({ [name]: val });
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

    // ✅ THÊM: Kiểm tra dung lượng file (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.setState({
        fileData: null,
        fileError: `File quá lớn (${(file.size / 1024 / 1024).toFixed(
          1
        )}MB). Tối đa 10MB`,
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

    // Chỉ lưu file lại thôi
    this.setState({
      fileData: file,
      fileError: null,
      isUploaded: false,
    });

    // ✅ THÊM: Hiển thị thông tin file
    notification.info({
      message: "File đã chọn",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      placement: "topRight",
      duration: 3,
    });
  };
  // Copy to clipboard with fallback for HTTP environments
  copyToClipboard = (text) => {
    // Try modern Clipboard API first (HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          notification.success({
            message: 'Đã sao chép mật khẩu vào bộ nhớ đệm!',
            placement: "topRight",
            duration: 3,
          });
        })
        .catch(() => {
          this.fallbackCopyToClipboard(text);
        });
    } else {
      // Fallback for HTTP or older browsers
      this.fallbackCopyToClipboard(text);
    }
  };

  // Fallback method using execCommand
  fallbackCopyToClipboard = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');

      document.body.removeChild(textArea);

      if (successful) {
        notification.success({
          message: 'Đã sao chép mật khẩu vào bộ nhớ đệm!',
          placement: "topRight",
          duration: 3,
        });
      } else {
        throw new Error('execCommand failed');
      }
    } catch (error) {
      notification.error({
        message: 'Không thể sao chép',
        description: 'Vui lòng sao chép thủ công: ' + text,
        placement: "topRight",
        duration: 5,
      });
      console.error('Copy failed:', error);
    }
  };
  handleUpload = async () => {
    const { fileData, isUploading } = this.state;
    if (!fileData || isUploading) return;

    // ✅ THÊM: Kiểm tra lại dung lượng trước khi upload
    const maxSize = 10 * 1024 * 1024;
    if (fileData.size > maxSize) {
      notification.error({
        message: "File quá lớn để upload",
        description: `Dung lượng: ${(fileData.size / 1024 / 1024).toFixed(
          1
        )}MB (tối đa 10MB)`,
        placement: "topRight",
      });
      return;
    }

    this.setState({ isUploading: true });

    try {
      const formData = new FormData();
      formData.append("docxFile", fileData);

      // ✅ THÊM: Timeout cho request (30 giây)
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

      // ✅ THÊM: Xử lý cụ thể cho lỗi 413
      if (res.status === 413) {
        throw new Error(
          `File quá lớn (${(fileData.size / 1024 / 1024).toFixed(
            1
          )}MB). Server chỉ chấp nhận tối đa 10MB.`
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

      // Sử dụng phương thức validation mới
      const { valid, errors, warnings, sections } =
        this.validateApiResponse(responseData);

      if (!valid && errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      // ✅ THÊM: Kiểm tra sections sau khi validate
      if (!sections || sections.length <= 0) {
        notification.error({
          message: "Đề thi không đúng quy chuẩn",
          description: "File Word không chứa nội dung đề thi hợp lệ hoặc không đúng định dạng. Vui lòng kiểm tra lại file và thử lại.",
          placement: "topRight",
          duration: 5,
        });
        this.setState({ isUploading: false });
        return;
      }

      const partsFromApi = responseData.parts || [];
      const normalizedParts = this.normalizeParts(partsFromApi);

      // ✅ FIX: Đảm bảo sections từ API được đánh dấu uploaded đúng cách
      const sectionsWithUploadedFlag = sections.map((section) => ({
        ...section,
        uploaded: true, // ✅ Force set uploaded flag
        classification: section.classification || { type: section.type }, // ✅ Ensure classification exists
      }));

      // ✅ THÊM: Kiểm tra lại sau khi process sections
      if (sectionsWithUploadedFlag.length <= 0) {
        notification.error({
          message: "Đề thi không đúng quy chuẩn",
          description: "Không thể xử lý nội dung đề thi từ file Word. Vui lòng kiểm tra định dạng file và thử lại.",
          placement: "topRight",
          duration: 5,
        });
        this.setState({ isUploading: false });
        return;
      }

      // ✅ FIX: Chỉ giữ manual sections (filter chính xác hơn)
      const existingSections = Array.isArray(this.state.sections)
        ? this.state.sections.filter((s) =>
          !s.uploaded &&
          !s.classification &&
          !s.originalPartName &&
          !s.id?.includes('uploaded-section')
        )
        : [];

      const mergedSections = [...existingSections, ...sectionsWithUploadedFlag];

      // ✅ FIX: Tương tự cho tabData
      const existingTabData = Array.isArray(this.state.tabData)
        ? this.state.tabData.filter((tab) =>
          !tab.uploaded &&
          !tab.classification &&
          !tab.originalPartName &&
          !tab._id?.includes('uploaded-section')
        )
        : [];

      const renumberedSections = this.renumberSections
        ? this.renumberSections(sections)
        : sections;



      this.setState(
        {
          showConfigModal: true,
          isUploaded: true,
          uploaded: true,
          isUploading: false,
          parts: normalizedParts,
          sections: mergedSections, // ✅ Chỉ manual + new uploaded
          tabData: existingTabData, // ✅ Reset về manual tabs, sẽ được rebuild trong convertSectionsToTabData
          apiValidationErrors: [...(errors || []), ...(warnings || [])],
        },
        () => {
          if (!this.state.selectedSectionId && mergedSections.length > 0) {
            const firstSection = mergedSections[0];
            this.setState({
              selectedSectionId: firstSection.id,
              examSectionId: firstSection.id,
              selectedSectionType: firstSection.type,
            });
          }

          if (renumberedSections.length > 0) {
            this.convertSectionsToTabData(renumberedSections);
            setTimeout(
              () => this.debugSectionNumbering && this.debugSectionNumbering(),
              100
            );
          }
        }
      );

      const groupCount = sections.filter(
        (s) => s.type === "NHOM_CHU_DE"
      ).length;
      const subSectionCount = sections.filter(
        (s) => s.type === "PHAN_THI_CON"
      ).length;
      const defaultCount = sections.filter((s) => s.type === "MAC_DINH").length;

      notification.success({
        message: `Tải file thành công`,
        placement: "topRight",
        duration: 3,
      });
    } catch (error) {
      this.setState({ isUploading: false });

      // ✅ THÊM: Xử lý lỗi cụ thể
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
          description: (
            <div>
              <p>{error.message}</p>
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
      } else {
        notification.error({
          message: "Lỗi khi tải file",
          description: "File lỗi, vui lòng kiểm tra lại thông tin các lỗi thường gặp trong tài liệu",
          placement: "topRight",
        });
      }
    }
  };

  normalizeParts = (partsFromApi = []) => {
    return partsFromApi.map((part) => ({
      ...part,
      subpart: (part.subpart || []).map((sp) => ({
        ...sp,
        children: (sp.children || []).map((child) => ({
          ...child,
          questions: (child.questions || []).map((qWrap) => {
            // Extract question data from wrapper
            const question = qWrap.question || qWrap;
            // Use unified normalization method for upload source
            return this.normalizeQuestionFormat(question, "upload");
          }),
        })),
      })),
    }));
  };

  getPartTotalQuestions = (part) => {
    if (!part) return 0;
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
  };

  getTotalTimeAcrossParts = () => {
    const parts = Array.isArray(this.state.parts) ? this.state.parts : [];
    return parts.reduce((sum, p) => sum + Number(p?.time || 0), 0);
  };

  // ✅ THÊM: Method hiển thị tips giảm dung lượng file
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

  validateApiResponse = (responseData) => {
    const errors = [];
    const warnings = [];
    const sections = [];

    if (!responseData || !Array.isArray(responseData.parts)) {
      errors.push("Invalid API response structure");
      return { valid: false, errors, warnings, sections };
    }

    responseData.parts.forEach((part, sectionIdx) => {
      const classification = this.classifySectionType(part);

      let sectionTitle = Array.isArray(part.name)
        ? part.name[0]
        : part.name || `Phần ${sectionIdx + 1}`;

      const sectionData = {
        id: sectionIdx + 1,
        title: sectionTitle.trim(),
        content: part.name || "",
        type: classification.type,
        hasSubSections: classification.hasSubSections, // Flag phần thi con
        totalQuestions: part.totalquestions || part.totalQuestions || 0,
        questions: [],
        subSections: [],
        groupTopic: [],
        classification: classification,
      }; // Xử lý dựa trên loại phần thi đã nhận diện
      switch (classification.type) {
        case "NHOM_CHU_DE":
          sectionData.groupTopic = this.buildGroupTopicFromAPI(part);
          break;
        case "MAC_DINH":
          if (classification.hasSubSections) {
            // Phần thi mặc định CÓ phần thi con
            sectionData.subSections = this.buildSubSectionsFromAPI(part);
          } else {
            // Phần thi mặc định KHÔNG có phần thi con
            sectionData.questions = this.extractQuestionsFromPart(
              part,
              "MAC_DINH"
            );
          }
          break;
        default:
          sectionData.questions = this.extractQuestionsFromPart(
            part,
            classification.type
          );
          break;
      }

      sections.push(sectionData);
    });

    const valid = errors.length === 0;
    return { valid, errors, warnings, sections };
  };

  convertSectionsToTabData = (sections) => {
    // ✅ FIX: Kiểm tra xem có phải upload operation không
    const isUploadOperation =
      sections && sections.some((s) => s.classification);

    let existingSections = [];
    let existingTabData = [];

    // ✅ FIX: Logic filter chính xác hơn - chỉ giữ sections thực sự manual
    if (Array.isArray(this.state.sections)) {
      existingSections = this.state.sections.filter(
        (s) =>
          !s.uploaded &&
          !s.classification &&
          !s.originalPartName &&
          !s.id?.includes("uploaded-section")
      );
    }

    if (Array.isArray(this.state.tabData)) {
      existingTabData = this.state.tabData.filter(
        (tab) =>
          !tab.uploaded &&
          !tab.classification &&
          !tab.originalPartName &&
          !tab._id?.includes("uploaded-section")
      );
    }

    // ✅ FIX: Tính startId dựa trên manual sections thực sự
    const startId =
      Math.max(
        existingSections.length,
        existingTabData.length,
        0 // Có thể bắt đầu từ 0 nếu không có manual sections
      ) + 1;

    // Get parts array to extract section names
    const parts = Array.isArray(this.state.parts) ? this.state.parts : [];

    // Build new UI sections with names from parts
    const newSections = (sections || []).map((section, index) => {
      const id = startId + index;

      // ✅ FIX: Extract section name from parts.name, fallback to numbered title
      let sectionTitle = `Phần ${id}`;

      if (parts[index] && parts[index].name) {
        const partName = Array.isArray(parts[index].name)
          ? parts[index].name[0]
          : parts[index].name;
        if (partName && typeof partName === "string" && partName.trim()) {
          sectionTitle = partName.trim();
        }
      }
      return {
        id: `uploaded-section-${id}`,
        title: sectionTitle,
        uploaded: true, // ✅ Đánh dấu là uploaded
        isMain: index === 0, // ✅ Section đầu tiên là main
        type: section.type,
        hasSubSections: section.hasSubSections, // Preserve flag
        questions: section.questions || [],
        originalPartName: parts[index]?.name, // Store original for reference
      };
    });

    // Build tabData entries with matching names from sections
    const newTabData = (sections || []).map((section, index) => {
      const id = startId + index;

      // Sử dụng cùng logic với newSections để đảm bảo consistency
      let sectionName;

      if (section.title && section.title.trim()) {
        sectionName = section.title.trim();
      } else if (parts[index] && parts[index].name) {
        const partName = Array.isArray(parts[index].name)
          ? parts[index].name[0]
          : parts[index].name;
        if (partName && typeof partName === "string" && partName.trim()) {
          sectionName = partName.trim();
        } else {
          sectionName = `Phần ${id}`;
        }
      } else {
        sectionName = `Phần ${id}`;
      }

      const baseTabData = {
        _id: `uploaded-section-${id}`,
        exam_section_name: sectionName,
        uploaded: true, // ✅ Đánh dấu là uploaded
        isMain: index === 0, // ✅ Section đầu tiên là main
        originalPartName: parts[index]?.name,
        classification: section.classification,
      };

      // Phân loại và xây dựng cấu trúc dựa trên type từ API
      switch (section.type) {
        case "NHOM_CHU_DE":
          const groupTopicData = section.groupTopic || [];
          // ✅ MỚI: Renumber questions trong NHOM_CHU_DE nếu upload
          const renumberedGroupTopic = groupTopicData.map((group, groupIdx) => {
            const updatedGroup = { ...group };
            if (updatedGroup.subjects && Array.isArray(updatedGroup.subjects)) {
              updatedGroup.subjects = updatedGroup.subjects.map((subject, subjIdx) => {
                const updatedSubject = { ...subject };
                if (updatedSubject.questions && Array.isArray(updatedSubject.questions)) {
                  updatedSubject.questions = this.updateQuestionNumbers(
                    updatedSubject.questions,
                    1, // NHOM_CHU_DE bắt đầu từ 1
                    isUploadOperation // preserveExistingNumbers = true nếu upload
                  );
                }
                return updatedSubject;
              });
            }
            return updatedGroup;
          });

          return {
            ...baseTabData,
            exam_section_type: "NHOM_CHU_DE",
            groupTopic: renumberedGroupTopic,
            questions: [],
          };

        case "MAC_DINH":
          if (section.hasSubSections && section.subSections?.length > 0) {
            const subSections = section.subSections.map((subSec, subIdx) => {
              const updatedSubSection = { ...subSec };
              if (
                updatedSubSection.questions &&
                Array.isArray(updatedSubSection.questions)
              ) {
                updatedSubSection.questions = this.updateQuestionNumbers(
                  updatedSubSection.questions,
                  this.getGlobalQuestionStartNumber(index, subIdx), // Tính STT global
                  isUploadOperation // preserveExistingNumbers = true nếu upload
                );
              }

              return updatedSubSection;
            });

            // ✅ FIX: Chỉ tạo childExam reference, không duplicate questions
            // ✅ FIX: Chỉ tạo childExam reference, không duplicate questions
            const childExam = subSections.map((subSec, idx) => ({
              idChildExam: subSec.id,
              name: subSec.name,
              questions: [], // ✅ Để trống, questions ở subSections
            }));

            return {
              ...baseTabData,
              exam_section_type: "MAC_DINH",
              questions: [], // ✅ Main questions trống khi có sub-sections
              subSections: subSections, // ✅ Questions thực sự ở đây
              childExam: childExam, // ✅ Chỉ metadata, không duplicate questions
            };
          }

        default: // MAC_DINH
          const mainQuestions = section.questions || [];
          // ✅ MỚI: Renumber main questions nếu upload
          const renumberedMainQuestions = this.updateQuestionNumbers(
            mainQuestions,
            1, // Bắt đầu từ 1
            isUploadOperation // preserveExistingNumbers = true nếu upload
          );

          return {
            ...baseTabData,
            exam_section_type: "MAC_DINH",
            questions: renumberedMainQuestions,
          };
      }
    });

    // ✅ QUAN TRỌNG: MERGE existing + new thay vì replace
    const allSections = [...existingSections, ...newSections];
    const allTabData = [...existingTabData, ...newTabData];

    // ✅ Update selectedGroupSubject cho tất cả NHOM_CHU_DE sections
    const updatedSelectedGroupSubject = { ...this.state.selectedGroupSubject };
    allTabData.forEach((tab, tabIndex) => {
      if (tab.exam_section_type === "NHOM_CHU_DE" && tab.groupTopic) {
        tab.groupTopic.forEach((group, groupIndex) => {
          const key = `${tabIndex}_${groupIndex}`;
          if (!updatedSelectedGroupSubject[key]) {
            updatedSelectedGroupSubject[key] = 0;
          }
        });
      }
    });

    newTabData.forEach((tab) => {
      if (tab.questions && Array.isArray(tab.questions)) {
        tab.questions.forEach((q) => {
          if (!q._id) {
            q._id = this.generateObjectId();
          }
          if (q.type === "CLUSTER" || q.type === "cluster") {
            const childQuestions = tab.questions.filter(
              (child) => child.parentId === q._id
            );
            childQuestions.forEach((child) => {
              child.parentId = q._id;
            });
          }
        });
      }

      // Set parentId for child questions in NHOM_CHU_DE sections
      if (tab.exam_section_type === "NHOM_CHU_DE" && tab.groupTopic) {
        tab.groupTopic.forEach((group) => {
          if (group.subjects && Array.isArray(group.subjects)) {
            group.subjects.forEach((subject) => {
              if (subject.questions && Array.isArray(subject.questions)) {
                subject.questions.forEach((q) => {
                  if (!q._id) {
                    q._id = this.generateObjectId();
                  }
                  if (q.type === "CLUSTER" || q.type === "cluster") {
                    // Find child questions in the same subject and set parentId
                    const childQuestions = subject.questions.filter(
                      (child) =>
                        child.parentId === q._id || child.cluster_id === q._id
                    );
                    childQuestions.forEach((child) => {
                      child.parentId = String(q._id); // ✅ Đảm bảo là string
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    // ✅ FIX: Không gọi recomputeSectionTitles cho upload operation để tránh duplicate
    // Vì uploaded sections đã có titles đúng từ file
    const finalSections = isUploadOperation ? allSections : allSections;

    // ✅ Update titlePerPart - chỉ từ new sections
    const updatedTitlePerPart = [
      ...(existingSections.map((s) => s.title) || []), // Titles từ existing manual sections
      ...newSections.map((section) => section.title), // Titles từ new uploaded sections
    ];

    // Mở rộng tất cả cluster mặc định cho uploaded sections để câu hỏi con hiển thị
    const newExpandedClusters = { ...this.state.expandedClusters };
    newTabData.forEach((tab) => {
      // Expand clusters in main questions
      if (tab.questions && Array.isArray(tab.questions)) {
        tab.questions.forEach((q) => {
          if (
            q.type === "CLUSTER" ||
            q.type === "cluster" ||
            q.type === "Cluster"
          ) {
            newExpandedClusters[q._id] = true; // Mở rộng cluster
          }
        });
      }

      // Expand clusters in group topics
      if (tab.groupTopic && Array.isArray(tab.groupTopic)) {
        tab.groupTopic.forEach((group) => {
          if (group.subjects && Array.isArray(group.subjects)) {
            group.subjects.forEach((subject) => {
              if (subject.questions && Array.isArray(subject.questions)) {
                subject.questions.forEach((q) => {
                  if (
                    q.type === "CLUSTER" ||
                    q.type === "cluster" ||
                    q.type === "Cluster"
                  ) {
                    newExpandedClusters[q._id] = true; // Mở rộng cluster
                  }
                });
              }
            });
          }
        });
      }

      // Expand clusters in subSections
      if (tab.subSections && Array.isArray(tab.subSections)) {
        tab.subSections.forEach((subSection) => {
          if (subSection.questions && Array.isArray(subSection.questions)) {
            subSection.questions.forEach((q) => {
              if (
                q.type === "CLUSTER" ||
                q.type === "cluster" ||
                q.type === "Cluster"
              ) {
                newExpandedClusters[q._id] = true; // Mở rộng cluster
              }
            });
          }
        });
      }

      // Expand clusters in childExam
      if (tab.childExam && Array.isArray(tab.childExam)) {
        tab.childExam.forEach((child) => {
          if (child.questions && Array.isArray(child.questions)) {
            child.questions.forEach((q) => {
              if (
                q.type === "CLUSTER" ||
                q.type === "cluster" ||
                q.type === "Cluster"
              ) {
                newExpandedClusters[q._id] = true; // Mở rộng cluster
              }
            });
          }
        });
      }
    });

    // Renumber all questions in all tabs to ensure correct STT across all sections immediately after upload
    const renumberedTabData = allTabData.map((tab) => {
      const updatedTab = { ...tab };

      // Renumber main questions (for MAC_DINH sections)
      if (updatedTab.questions && Array.isArray(updatedTab.questions)) {
        updatedTab.questions = QuestionNumberingService.unifiedQuestionNumbering(
          updatedTab.questions,
          'MAIN',
          { sectionId: tab._id, tabData: allTabData, preserveExistingNumbers: true }
        );
      }

      // Renumber sub-sections (for MAC_DINH sections with sub-sections)
      if (updatedTab.subSections && Array.isArray(updatedTab.subSections)) {
        updatedTab.subSections = updatedTab.subSections.map((subSection) => {
          const updatedSubSection = { ...subSection };
          if (updatedSubSection.questions && Array.isArray(updatedSubSection.questions)) {
            updatedSubSection.questions = QuestionNumberingService.unifiedQuestionNumbering(
              updatedSubSection.questions,
              'SUB_SECTION',
              { sectionId: tab._id, subSectionId: subSection.id, tabData: allTabData, preserveExistingNumbers: true }
            );
          }
          return updatedSubSection;
        });
      }

      // Renumber group-topic questions (for NHOM_CHU_DE sections)
      if (updatedTab.groupTopic && Array.isArray(updatedTab.groupTopic)) {
        updatedTab.groupTopic = updatedTab.groupTopic.map((group, groupIdx) => {
          const updatedGroup = { ...group };
          if (updatedGroup.subjects && Array.isArray(updatedGroup.subjects)) {
            updatedGroup.subjects = updatedGroup.subjects.map((subject, subjectIdx) => {
              const updatedSubject = { ...subject };
              if (updatedSubject.questions && Array.isArray(updatedSubject.questions)) {
                updatedSubject.questions = QuestionNumberingService.unifiedQuestionNumbering(
                  updatedSubject.questions,
                  'NHOM_CHU_DE',
                  { sectionId: tab._id, groupIdx: groupIdx, subjectIdx: subjectIdx, tabData: allTabData, preserveExistingNumbers: true }
                );
              }
              return updatedSubject;
            });
          }
          return updatedGroup;
        });
      }

      // Note: childExam is less commonly used in current code, so skipping renumber for it to avoid complexity.
      // If needed, add similar logic here for updatedTab.childExam.

      return updatedTab;
    });

    this.setState(
      {
        tabData: renumberedTabData,
        sections: finalSections,
        selectedSectionId: renumberedTabData.length > 0 ? renumberedTabData[0]._id : null,
        examSectionId:
          renumberedTabData.length > 0 ? renumberedTabData[0]._id : this.state.examSectionId,
        titlePerPart: updatedTitlePerPart,
        expandedClusters: newExpandedClusters,
        selectedGroupSubject: updatedSelectedGroupSubject,
      },
      () => {
        this.saveTabDataToSession();

        // ✅ CORRECTED LOG: Đếm đúng manual vs uploaded
        const manualSectionsCount = finalSections.filter(
          (s) => !s.uploaded && !s.classification
        ).length;
        const uploadedSectionsCount = finalSections.filter(
          (s) => s.uploaded || s.classification
        ).length;

        newTabData.forEach((tab, idx) => {
          const classification = tab.classification;
          // Log chi tiết về childExam cho phần thi con
          if (tab.childExam && tab.childExam.length > 0) {
            tab.childExam.forEach((child, childIdx) => { });
          }
        });
      }
    );
  };

  handleAddDefaultSection = () => {
    this.setState((prevState) => {
      const prevSections = Array.isArray(prevState.sections)
        ? prevState.sections
        : [];
      const prevTabData = Array.isArray(prevState.tabData)
        ? prevState.tabData
        : [];

      // ✅ FIX: Tính ID tự động tăng dựa trên tổng số phần hiện có (bao gồm cả uploaded)
      const totalSections = Math.max(prevSections.length, prevTabData.length);
      const newSectionNumber = totalSections + 1;
      const newSectionId = `sec-${newSectionNumber}`;

      const sectionsRaw = [
        ...prevSections,
        {
          id: newSectionId,
          title: `Phần ${newSectionNumber}`,
          type: "default",
          uploaded: false,
        },
      ];

      // Recompute to ensure all sections have correct sequential numbering
      const updatedSections = this.recomputeSectionTitles(sectionsRaw);

      // Tạo tabData tương ứng
      const tabData = [...prevTabData];
      const newSectionObj = updatedSections[updatedSections.length - 1];

      tabData.push({
        _id: newSectionId,
        exam_section_name: newSectionObj.title,
        exam_section_type: "MAC_DINH",
        exam_section_time: this.state.time || 0,
        total_score: 0,
        calculate_score_type: "total_point",
        questions: [],
        active: false,
        uploaded: false,
        subSections: [], // Không tạo subSections mặc định
        childExam: [],
      });

      this.setState(() => ({
        parentIdInTabData: newSectionId,
      }));

      // Cập nhật titlePerPart để đồng bộ với modal cấu hình
      const updatedTitlePerPart = [...(prevState.titlePerPart || [])];
      updatedTitlePerPart.push(newSectionObj.title);

      return {
        sections: updatedSections,
        tabData,
        selectedSectionId: newSectionId,
        examSectionId: newSectionId,
        statusTabCreate: false,
        titlePerPart: updatedTitlePerPart, // Đồng bộ titlePerPart
      };
    });
  };

  handleAddTopicGroup = () => {
    // Kiểm tra trạng thái loading để tránh click nhiều lần
    if (this.state.isAddingTopicGroup) {
      return;
    }

    // Set loading state
    this.setState({ isAddingTopicGroup: true });

    // Sử dụng setTimeout để đảm bảo UI được cập nhật và tránh freeze
    setTimeout(() => {
      try {
        this.setState((prevState) => {
          const prevSections = Array.isArray(prevState.sections)
            ? prevState.sections
            : [];
          const sectionsRaw = [
            ...prevSections,
            {
              id: `sec-${prevSections.length + 1}`,
              title: `Phần nhóm chủ đề ${prevSections.length + 1}`,
              type: "topic",
              uploaded: false,
            },
          ];
          const updatedSections = this.recomputeSectionTitles(sectionsRaw);

          // Tạo tabData GROUP_SUBJECT tương ứng
          const tabData = Array.isArray(prevState.tabData)
            ? [...prevState.tabData]
            : [];
          const newSectionObj = updatedSections[updatedSections.length - 1];
          const newTabId = newSectionObj.id;
          tabData.push({
            _id: newTabId,
            exam_section_name: newSectionObj.title,
            exam_section_type: "GROUP_SUBJECT",
            exam_section_time: this.state.time || 0,
            total_score: 10,
            calculate_score_type: "total_point",
            exam_section_group: [],
            questions: [],
            active: false,
          });

          // Cập nhật titlePerPart để đồng bộ với modal cấu hình
          const updatedTitlePerPart = [...(prevState.titlePerPart || [])];
          updatedTitlePerPart.push(newSectionObj.title);

          return {
            sections: updatedSections,
            tabData,
            selectedSectionId: newSectionObj.id,
            examSectionId: newTabId,
            statusTabCreate: false,
            titlePerPart: updatedTitlePerPart, // Đồng bộ titlePerPart
            isAddingTopicGroup: false, // Reset loading state
          };
        });
      } catch (error) {
        // Reset loading state nếu có lỗi
        this.setState({ isAddingTopicGroup: false });
      }
    }, 100); // Delay nhỏ để tránh freeze UI
  };

  handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả phần thi không?")) {
      this.setState({
        sections: [],
        tabData: [],  // ✅ Đã có
        uploaded: false,
        selectedSectionId: null,  // ✅ Đã có
        examSectionId: null,  // ✅ Đã có
        // ✅ THÊM: Reset thêm các state liên quan để tránh conflict
        titlePerPart: [],
        scorePerPart: [],
        timePerPart: [],
        timeTotal: 0,
        timeMode: "TOTAL",
        // ✅ THÊM: Reset các state modal và selection
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
    }
  };


  syncSectionsWithTabData = () => {
    try {
      // Đồng bộ sections với tabData
      const sections = this.state.tabData.map((tab, index) => ({
        id: tab._id || `sec-${index + 1}`,
        title: tab.exam_section_name || `Phần ${index + 1}`,
        type: tab.exam_section_type === "GROUP_SUBJECT" ? "topic" : "default",
        time: tab.exam_section_time || 0,
        score: tab.total_score || 0,
        uploaded: false, // Đánh dấu là manually created
      }));

      // Cập nhật selectedSectionId nếu cần
      const prevSections = Array.isArray(this.state.sections)
        ? this.state.sections
        : [];
      let selectedSectionId = this.state.selectedSectionId;
      const currentIds = sections.map((s) => s.id);

      // Nếu selectedSectionId không còn hợp lệ, cố gắng map theo index từ prevSections, nếu không thì chọn phần đầu
      if (!selectedSectionId || !currentIds.includes(selectedSectionId)) {
        const prevIndex = prevSections.findIndex(
          (s) => s.id === selectedSectionId
        );
        if (prevIndex >= 0 && prevIndex < sections.length) {
          selectedSectionId = sections[prevIndex].id;
        } else {
          selectedSectionId = sections[0]?.id || null;
        }
      }

      this.setState({
        sections: sections,
        selectedSectionId: selectedSectionId,
        examSectionId: selectedSectionId,
      });
    } catch (e) { }
  };

  // Normalize a manually created or API-returned question so its shape matches uploaded questions
  normalizeManualQuestion = (q = {}) => {
    const now = new Date().toISOString();
    const id =
      q._id ||
      q.question_id ||
      `manual-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    // Cluster questions có number = 0
    let question_no;
    let number;
    if (q.type === "CLUSTER" || q.type === "cluster") {
      question_no = 0;
      number = 0;
    } else {
      question_no =
        q.question_no ||
        q.questionNo ||
        q.number ||
        this.getNextQuestionNumber();
      number = question_no;
    }

    // ✅ FIX: Cluster questions không nên có parentId
    let parentId = q.parentId || null;
    if (q.type === "CLUSTER" || q.type === "cluster") {
      parentId = null; // Cluster không có parent
    }

    return {
      // Keep original fields but provide normalized aliases expected by buildPartsPayload/normalizeParts
      ...q,
      _id: q._id || id,
      question_id: q.question_id || q._id || id,
      question_no: question_no,
      number: number,
      rawHtml: q.rawHtml || q.plain_text || q.content || q.question || "",
      type: q.type || q.question_type || "",
      choices: q.choices || q.options || [],
      correctAnswers: q.correctAnswers || q.answer || q.correctAnswer || [],
      explanation: q.explanation || q.explain || "",
      level: q.level || q.question_level || "",
      question_level: q.level || q.question_level || "",
      images: q.images || [],
      doc_link: q.doc_link || "",
      video_link: q.video || q.video_link || "",
      code: q.code || `${question_no}`,
      created_at: q.created_at || now,
      __temp: q.__temp === true || !!q.isTemp,
      parentId: parentId,
      // ✅ FIX: Preserve answerRaw for TRUEFALSEMULTI language detection
      answerRaw: q.answerRaw || [],
    };
  };

  handleDeleteSection = (id) => {
    if (!id) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa phần thi này không?")) {
      this.setState(
        (prevState) => {
          // Xoá khỏi danh sách sections (UI)
          const prevSections = Array.isArray(prevState.sections)
            ? prevState.sections
            : [];
          const filteredSections = prevSections.filter((s) => s.id !== id);

          // ✅ THAY ĐỔI: Chỉ cập nhật số thứ tự, giữ nguyên tên gốc
          const updatedSections = filteredSections.map((section, idx) => ({
            ...section,
            // Giữ nguyên title nếu là uploaded section hoặc có tên tùy chỉnh
            title:
              section.uploaded || !section.title.match(/^Phần \d+$/)
                ? section.title
                : `Phần ${idx + 1}`, // Chỉ đánh số lại cho phần mặc định
          }));

          // Xoá phần tương ứng trong tabData
          const prevTabData = Array.isArray(prevState.tabData)
            ? [...prevState.tabData]
            : [];
          const newTabData = prevTabData.filter((t) => t && t._id !== id);

          // Chọn tab kế tiếp
          const stillValid = updatedSections.some(
            (s) => s.id === prevState.selectedSectionId
          );
          let newSelectedId = stillValid
            ? prevState.selectedSectionId
            : updatedSections[0]?.id || null;

          return {
            sections: updatedSections,
            tabData: newTabData,
            selectedSectionId: newSelectedId,
            examSectionId: newSelectedId,
          };
        },
        () => {
          try {
            this.saveTabDataToSession();
          } catch (e) { }
        }
      );
    }
  };

  // Debug helper để kiểm tra duplicate sections
  debugSectionNumbering = () => {
    const sections = this.state.sections || [];
    const tabData = this.state.tabData || [];
    // Check for duplicate titles
    const titles = sections.map((s) => s.title);
    const duplicates = titles.filter(
      (title, index) => titles.indexOf(title) !== index
    );

    if (duplicates.length > 0) {
    } else {
    }

    // Check for empty sections (no questions)
    const emptySections = tabData.filter(
      (tab) => !tab.questions || tab.questions.length === 0
    );
  }; // Recompute titles so numbering across all sections (default + topic) is contiguous starting from 1
  recomputeSectionTitles = (sections) => {
    if (!Array.isArray(sections) || sections.length === 0) {
      return sections;
    }

    return sections.map((section, index) => {
      // ✅ Bỏ qua main sections (isMain = true)
      if (section.isMain) {
        return {
          ...section,
          title: section.title || `Phần ${index + 1}`, // Giữ nguyên hoặc fallback
        };
      }

      // ✅ Chỉ recompute title cho non-main sections
      const sectionNumber = index + 1;
      let newTitle = "";

      if (section.uploaded) {
        // Keep original name from Word file
        if (section.originalPartName) {
          const partName = Array.isArray(section.originalPartName)
            ? section.originalPartName[0]
            : section.originalPartName;
          if (partName && typeof partName === "string" && partName.trim()) {
            newTitle = partName.trim();
          } else {
            newTitle = `Phần ${sectionNumber}`;
          }
        } else {
          newTitle = `Phần ${sectionNumber}`;
        }
      } else if (section.isSubSection) {
        // Sub-section giữ nguyên tên đã nhập
        newTitle = section.title;
      } else {
        // Manual sections get sequential numbering
        if (section.type === "topic") {
          newTitle = `Phần ${sectionNumber} - Nhóm chủ đề`;
        } else {
          newTitle = `Phần ${sectionNumber}`;
        }
      }

      return {
        ...section,
        title: newTitle,
      };
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
      isAddingTopicGroup: false, // Reset loading state khi đóng modal
    });
  };

  handleCreateGroup = (newGroup) => {
    this.setState((prevState) => ({
      groups: [
        ...prevState.groups,
        {
          ...newGroup,
          subjects: newGroup.subjects || [],
          questions: [],
        },
      ],
      showGroupModal: false,
      groupDetail: null,
    }));
  };

  handleUpdateGroup = (updatedGroup) => {
    this.setState((prevState) => ({
      groups: prevState.groups.map((g) =>
        g.id === updatedGroup.id ? updatedGroup : g
      ),
      showGroupModal: false,
    }));
  };

  handleDeleteGroup = (idSubject) => {
    if (!idSubject) {
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
      return;
    }

    this.setState((prevState) => {
      const updatedTabData = [...prevState.tabData];
      let found = false;

      // Duyệt qua tất cả tabs để tìm và xóa subject có idSubject tương ứng
      updatedTabData.forEach((tab, tabIndex) => {
        if (tab.exam_section_type === "NHOM_CHU_DE" && tab.groupTopic) {
          tab.groupTopic.forEach((group, groupIdx) => {
            if (group.subjects && Array.isArray(group.subjects)) {
              // Tìm và lưu tên subject trước khi xóa
              const subjectToDelete = group.subjects.find(subject => subject.idSubject === idSubject);
              if (subjectToDelete) {
                found = true;
              }

              // Xóa subject có idSubject tương ứng
              group.subjects = group.subjects.filter(subject => subject.idSubject !== idSubject);

              // Nếu group không còn subject nào thì xóa luôn group
              if (group.subjects.length === 0) {
                tab.groupTopic.splice(groupIdx, 1);
              }
            }
          });
        }
      });

      if (!found) {
        console.warn(`Subject with idSubject ${idSubject} not found`);
        notification.warning({
          message: "Không tìm thấy môn học để xóa",
          placement: "topRight"
        });
        return prevState; // Không thay đổi state nếu không tìm thấy
      }

      // Reset selectedGroupSubject sau khi xóa
      const newSelectedGroupSubject = {};
      updatedTabData.forEach((tab, tabIndex) => {
        if (tab.exam_section_type === "NHOM_CHU_DE" && tab.groupTopic) {
          tab.groupTopic.forEach((group, groupIdx) => {
            newSelectedGroupSubject[groupIdx] = 0; // Chọn subject đầu tiên
          });
        }
      });

      return {
        tabData: updatedTabData,
        selectedGroupSubject: newSelectedGroupSubject
      };
    }, () => {
      this.saveTabDataToSession();
      this.forceUpdate();
    });
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

    // Đảm bảo scorePerPart luôn có giá trị mặc định
    const scorePerPart = sections.map((section, idx) => {
      const existingScore = this.state.scorePerPart?.[idx];
      if (existingScore !== undefined && existingScore !== null) {
        return String(existingScore);
      }

      // Lấy từ parts hoặc tabData
      const partScore = parts[idx]?.score;
      const tabScore = tabData[idx]?.total_score;

      return String(Number(partScore || tabScore || 0));
    });

    // Ưu tiên lấy tên từ sections.title (đã được cập nhật khi edit)
    const titlePerPart = sections.map((section, idx) => {
      if (section && section.title) {
        return section.title;
      } else if (parts[idx] && parts[idx].name) {
        return Array.isArray(parts[idx].name)
          ? parts[idx].name[0]
          : parts[idx].name;
      } else if (tabData[idx] && tabData[idx].exam_section_name) {
        return tabData[idx].exam_section_name;
      } else {
        return `Phần ${idx + 1}`;
      }
    });

    const hasOverall = Number(this.state.time || 0) > 0;
    const hasPerPart = perPart.some((v) => Number(v) > 0);
    let mode = "TOTAL";
    let timePerPart = perPart;
    let timeTotal = "";

    // Ưu tiên PER_PART nếu có bất kỳ thời gian theo phần > 0
    if (hasPerPart) {
      mode = "PER_PART";
      timeTotal = "";
      timePerPart = perPart;
    } else if (hasOverall) {
      mode = "TOTAL";
      timeTotal = Number(this.state.time || 0);
      timePerPart = parts.map(() => "");
    } else {
      mode = "TOTAL";
      timeTotal = "";
      timePerPart = parts.map(() => 0);
    }

    this.setState({
      showConfigModal: true,
      timeMode: mode,
      timePerPart,
      timeTotal,
      scorePerPart,
      titlePerPart,
    });
  };

  closeExamConfigModal = () => {
    this.setState({ showConfigModal: false });
  };

  handleCheckedTestingQuestion(questionId, subjectId, dataChecked) {

    this.setState(prevState => {
      const updatedTabData = [...prevState.tabData];

      // Tìm tab hiện tại (NHOM_CHU_DE section)
      const currentTabIndex = updatedTabData.findIndex(tab =>
        tab._id === prevState.selectedSectionId && tab.exam_section_type === "NHOM_CHU_DE"
      );

      if (currentTabIndex === -1) {
        console.warn('Không tìm thấy NHOM_CHU_DE section');
        return prevState;
      }

      const currentTab = updatedTabData[currentTabIndex];

      if (!currentTab.groupTopic || !Array.isArray(currentTab.groupTopic)) {
        console.warn('Không có groupTopic trong section');
        return prevState;
      }

      // ✅ BƯỚC 1: Nếu dataChecked = true, bỏ tất cả isTestQuestion trong subject cụ thể trước
      if (dataChecked) {
        currentTab.groupTopic.forEach((group) => {
          if (!group.subjects || !Array.isArray(group.subjects)) return;

          group.subjects.forEach((subject) => {
            // ✅ CHỈ xử lý subject có cùng subjectId
            if (subject.idSubject === subjectId) {
              if (!subject.questions || !Array.isArray(subject.questions)) return;

              subject.questions.forEach((question) => {
                // Bỏ isTestQuestion của tất cả câu hỏi khác trong subject này
                if (question._id !== questionId && question.isTestQuestion) {
                  delete question.isTestQuestion;
                }
              });
            }
          });
        });
      }

      // ✅ BƯỚC 2: Set hoặc remove isTestQuestion cho câu hỏi được chọn
      let questionFound = false;
      currentTab.groupTopic.forEach((group) => {
        if (!group.subjects || !Array.isArray(group.subjects)) return;

        group.subjects.forEach((subject) => {
          // ✅ CHỈ xử lý subject có cùng subjectId
          if (subject.idSubject === subjectId) {
            if (!subject.questions || !Array.isArray(subject.questions)) return;

            const questionIndex = subject.questions.findIndex(q =>
              q._id === questionId || q.question_id === questionId
            );

            if (questionIndex !== -1) {
              if (dataChecked) {
                // ✅ Thêm trường isTestQuestion = true
                subject.questions[questionIndex].isTestQuestion = true;
              } else {
                // ✅ Xóa trường isTestQuestion
                delete subject.questions[questionIndex].isTestQuestion;
              }
              questionFound = true;
            }
          }
        });
      });

      if (!questionFound) {
        console.warn('❌ Không tìm thấy câu hỏi với ID:', questionId);
        return prevState;
      }
      return {
        ...prevState,
        tabData: updatedTabData
      };
    }, () => {
      // Callback sau khi setState hoàn thành
      this.saveTabDataToSession();
      this.forceUpdate();
    });
  }

  handleScorePerPartChange = (index, raw) => {
    if (typeof raw !== "string") raw = String(raw || "");
    let sanitized = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    sanitized = sanitized.replace(/(\..*?)\./g, "$1");
    this.setState((prev) => {
      const arr = Array.isArray(prev.scorePerPart)
        ? [...prev.scorePerPart]
        : [];
      if (index >= 0 && index < arr.length) {
        arr[index] = sanitized;
      } else if (index >= arr.length) {
        arr.push(sanitized);
      }
      return { scorePerPart: arr };
    });
  };

  handleTimeChange = (index, value) => {
    // Convert value to number
    let time = Number(value) || 0;
    if (time < 0) time = 0;

    this.setState((prevState) => {
      // Update timePerPart array
      const newTimePerPart = [...(prevState.timePerPart || [])];
      newTimePerPart[index] = time;

      // Đồng thời update tabData để lưu time vào section tương ứng
      const newTabData = [...prevState.tabData];
      if (newTabData[index]) {
        newTabData[index].exam_section_time = time;
      }
      return {
        timePerPart: newTimePerPart,
        tabData: newTabData,
      };
    });
  };

  handlePartTitleChange = (index, value) => {
    this.setState((prev) => {
      const arr = Array.isArray(prev.titlePerPart)
        ? [...prev.titlePerPart]
        : [];
      if (index >= 0 && index < arr.length) {
        arr[index] = value;
      } else if (index >= arr.length) {
        arr.push(value);
      }
      return { titlePerPart: arr };
    });
  };

  onDragEndQuestion = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    // Nếu thả cùng vị trí thì không làm gì
    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    ) {
      return;
    }

    // ✅ CASE 1: Drag & drop trong bảng chính (questions-table)
    if (
      source.droppableId === "questions-table" &&
      destination.droppableId === "questions-table"
    ) {
      const currentQuestions = this.getQuestionsForCurrentSelection();
      if (!Array.isArray(currentQuestions) || currentQuestions.length === 0) {
        return;
      }

      // Kiểm tra index hợp lệ
      if (
        source.index < 0 ||
        source.index >= currentQuestions.length ||
        destination.index < 0 ||
        destination.index >= currentQuestions.length
      ) {
        return;
      }

      // Tạo bản sao để reorder
      const reorderedQuestions = Array.from(currentQuestions);
      const [removed] = reorderedQuestions.splice(source.index, 1);
      reorderedQuestions.splice(destination.index, 0, removed);

      // ✅ THAY ĐỔI: Đánh số lại theo thứ tự reorder, giữ baseNumber cố định
      const renumberedQuestions = QuestionNumberingService.renumberAfterReorder(reorderedQuestions);

      // Cập nhật state.tabData
      this.setState(
        (prevState) => {
          const updatedTabData = prevState.tabData.map((tab) => {
            if (tab._id === prevState.selectedSectionId) {
              if (tab.exam_section_type === "MAC_DINH") {
                return { ...tab, questions: renumberedQuestions };
              } else if (tab.exam_section_type === "GROUP_SUBJECT") {
                const updatedGroups = tab.exam_section_group.map((group) => ({
                  ...group,
                  subjects: group.subjects.map((subject) => {
                    // Check if this is the currently selected subject
                    if (
                      subject.subject_id ===
                      (prevState.selectedSubject &&
                        prevState.selectedSubject.id)
                    ) {
                      return {
                        ...subject,
                        questions: renumberedQuestions,
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
        }
      );
      return;
    }

    // ✅ CASE 2: Drag & drop trong sub-section
    if (
      source.droppableId.startsWith("sub-section-") &&
      destination.droppableId.startsWith("sub-section-")
    ) {
      const sourceSubSectionId = source.droppableId.replace("sub-section-", "");
      const destSubSectionId = destination.droppableId.replace(
        "sub-section-",
        ""
      );

      // Chỉ xử lý drag & drop trong cùng sub-section
      if (sourceSubSectionId === destSubSectionId) {
        this.onDragEndSubSectionQuestion(result, sourceSubSectionId);
      }
      return;
    }

    // ✅ CASE 3: Drag & drop trong childExam
    if (
      source.droppableId.startsWith("questions-") &&
      destination.droppableId.startsWith("questions-")
    ) {
      const sourceChildExamId = source.droppableId.replace("questions-", "");
      const destChildExamId = destination.droppableId.replace("questions-", "");

      // Chỉ xử lý drag & drop trong cùng childExam
      if (sourceChildExamId === destChildExamId) {
        this.onDragEndChildExamQuestion(result, sourceChildExamId);
      }
      return;
    }

    // ✅ CASE 4: Drag & drop trong topic group
    if (
      source.droppableId.startsWith("group-") &&
      destination.droppableId.startsWith("group-")
    ) {
      // Extract group and subject indices
      const sourceMatch = source.droppableId.match(/group-(\d+)-subject-(\d+)/);
      const destMatch = destination.droppableId.match(
        /group-(\d+)-subject-(\d+)/
      );

      if (sourceMatch && destMatch) {
        const sourceGroupIdx = parseInt(sourceMatch[1]);
        const sourceSubjectIdx = parseInt(sourceMatch[2]);
        const destGroupIdx = parseInt(destMatch[1]);
        const destSubjectIdx = parseInt(destMatch[2]);

        // Chỉ xử lý drag & drop trong cùng group và subject
        if (
          sourceGroupIdx === destGroupIdx &&
          sourceSubjectIdx === destSubjectIdx
        ) {
          this.onDragEndTopicGroupQuestion(
            result,
            sourceGroupIdx,
            sourceSubjectIdx
          );
        }
      }
      return;
    }

    // ✅ CASE 5: Drag & drop trong topic-group-table
    if (
      source.droppableId === "topic-group-table" &&
      destination.droppableId === "topic-group-table"
    ) {
      this.onDragEndTopicGroupTableQuestion(result);
      return;
    }
  };

  onDragEndSubSectionQuestion = (result, subSectionId) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    // Tìm sub-section trong tabData
    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab._id === prevState.selectedSectionId && tab.subSections) {
            const updatedSubSections = tab.subSections.map((subSection) => {
              if (subSection.id === subSectionId) {
                // Reorder questions trong sub-section này
                const reorderedQuestions = Array.from(
                  subSection.questions || []
                );
                const [removed] = reorderedQuestions.splice(source.index, 1);
                reorderedQuestions.splice(destination.index, 0, removed);

                // ✅ THAY ĐỔI: Đánh số lại theo thứ tự reorder, giữ baseNumber cố định
                const renumberedQuestions = QuestionNumberingService.renumberAfterReorder(reorderedQuestions);

                return {
                  ...subSection,
                  questions: renumberedQuestions,
                };
              }
              return subSection;
            });

            return {
              ...tab,
              subSections: updatedSubSections,
            };
          }
          return tab;
        });

        return { tabData: updatedTabData };
      },
      () => {
        this.forceUpdate();
        this.saveTabDataToSession();
      }
    );
  };

  // Method xử lý drag & drop cho childExam
  onDragEndChildExamQuestion = (result, childExamId) => {
    if (!result.destination) return;

    const { source, destination } = result;

    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab.childExam && Array.isArray(tab.childExam)) {
            const updatedChildExam = tab.childExam.map((child) => {
              if (String(child.idChildExam) === String(childExamId)) {
                // Reorder questions trong childExam này
                const reorderedQuestions = Array.from(child.questions || []);
                const [removed] = reorderedQuestions.splice(source.index, 1);
                reorderedQuestions.splice(destination.index, 0, removed);

                // ✅ THAY ĐỔI: Đánh số lại theo thứ tự reorder, giữ baseNumber cố định
                const renumberedQuestions = QuestionNumberingService.renumberAfterReorder(reorderedQuestions);

                return {
                  ...child,
                  questions: renumberedQuestions,
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
      }
    );
  };

  // Method xử lý drag & drop cho topic group
  onDragEndTopicGroupQuestion = (result, groupIdx, subjectIdx) => {
    if (!result.destination) return;

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

              // Reorder questions trong subject này
              const reorderedQuestions = Array.from(
                currentSubject.questions || []
              );
              const [removed] = reorderedQuestions.splice(source.index, 1);
              reorderedQuestions.splice(destination.index, 0, removed);

              // ✅ THAY ĐỔI: Đánh số lại theo thứ tự reorder, giữ baseNumber cố định
              const renumberedQuestions = QuestionNumberingService.renumberAfterReorder(reorderedQuestions);

              updatedGroupTopic[groupIdx].subjects[subjectIdx] = {
                ...currentSubject,
                questions: renumberedQuestions,
              };
            }

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
      }
    );
  };

  // Method xử lý drag & drop cho topic-group-table
  onDragEndTopicGroupTableQuestion = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Lấy questions hiện tại từ selectedSubject trong groupTopic
    const currentTab = this.state.tabData.find(
      (tab) => tab._id === this.state.selectedSectionId
    );

    if (!currentTab || !currentTab.groupTopic) return;

    // Tìm subject đang được chọn
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

    if (targetGroupIdx === -1 || targetSubjectIdx === -1) return;

    const currentQuestions =
      currentTab.groupTopic[targetGroupIdx].subjects[targetSubjectIdx]
        .questions || [];

    // Reorder questions
    const reorderedQuestions = Array.from(currentQuestions);
    const [removed] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, removed);

    // ✅ THAY ĐỔI: Đánh số lại theo thứ tự reorder, giữ baseNumber cố định
    const renumberedQuestions = QuestionNumberingService.renumberAfterReorder(reorderedQuestions);

    // Cập nhật state
    this.setState(
      (prevState) => {
        const updatedTabData = prevState.tabData.map((tab) => {
          if (tab._id === prevState.selectedSectionId && tab.groupTopic) {
            const updatedGroupTopic = [...tab.groupTopic];
            updatedGroupTopic[targetGroupIdx].subjects[targetSubjectIdx] = {
              ...updatedGroupTopic[targetGroupIdx].subjects[targetSubjectIdx],
              questions: renumberedQuestions,
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
      }
    );
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

  async createGroupQuestion(data) {
    // Kiểm tra trạng thái loading để tránh click nhiều lần
    if (this.state.isAddingTopicGroup) {
      return;
    }

    // Set loading state
    this.setState({ isAddingTopicGroup: true });

    // Sử dụng setTimeout để đảm bảo UI được cập nhật và tránh freeze
    setTimeout(() => {
      try {
        this.setState((prevState) => {
          const prevSections = Array.isArray(prevState.sections)
            ? prevState.sections
            : [];
          const prevTabData = Array.isArray(prevState.tabData)
            ? prevState.tabData
            : [];

          // ✅ FIX: Tính ID tự động tăng dựa trên tổng số phần hiện có (bao gồm cả uploaded)
          const totalSections = Math.max(prevSections.length, prevTabData.length);
          const newSectionNumber = totalSections + 1;
          const newSectionId = `sec-${newSectionNumber}`;

          const sectionsRaw = [
            ...prevSections,
            {
              id: newSectionId,
              title: `Phần ${newSectionNumber} - Phần thi nhóm chủ đề`,
              type: "topic",
              uploaded: false,
            },
          ];

          // Recompute to ensure all sections have correct sequential numbering
          const updatedSections = this.recomputeSectionTitles(sectionsRaw);

          // Tạo tabData tương ứng
          const tabData = [...prevTabData];
          const newSectionObj = updatedSections[updatedSections.length - 1];

          // ✅ SỬA: Xử lý maxTopics từ data
          let maxTopics = 1; // Giá trị mặc định

          // Tìm maxTopics từ các group trong data
          if (Array.isArray(data) && data.length > 0) {
            // Lấy maxTopics từ group đầu tiên có maxTopics
            const groupWithMaxTopics = data.find(group =>
              group.maxTopics &&
              typeof group.maxTopics === 'number' &&
              group.maxTopics > 0
            );

            if (groupWithMaxTopics) {
              maxTopics = groupWithMaxTopics.maxTopics;
            }
          }

          // Đảm bảo tất cả subjects trong data có idSubject mới để tránh dữ liệu cũ
          const processedData = data.map((group) => ({
            ...group,
            // ✅ THÊM: Preserve maxTopics từ data
            maxTopics: group.maxTopics || maxTopics,
            // ✅ THÊM: Preserve maxSubjects từ data
            maxSubjects: group.maxSubjects || 1,
            // ✅ THÊM: Preserve type từ data
            type: group.type || "single",
            subjects: group.subjects.map((subject) => ({
              ...subject,
              idSubject: subject.idSubject || this.generateObjectId(), // ✅ Giữ idSubject gốc nếu có, tạo mới nếu không
              // ✅ THÊM: Preserve questions nếu có
              questions: subject.questions || []
            })),
          }));

          tabData.push({
            _id: newSectionId,
            exam_section_name: newSectionObj.title,
            exam_section_type: "NHOM_CHU_DE",
            exam_section_time: this.state.time || 0,
            total_score: 0,
            calculate_score_type: "total_point",
            questions: [],
            active: false,
            uploaded: false,
            groupTopic: processedData, // ✅ Sử dụng processedData đã xử lý maxTopics
            // ✅ THÊM: Lưu maxTopics vào tab level để dễ truy cập
            maxTopics: maxTopics
          });

          this.closeGroupModal();

          return {
            sections: updatedSections,
            tabData,
            selectedSectionId: newSectionId,
            examSectionId: newSectionId,
            statusTabCreate: false,
            // ✅ SỬA: Cập nhật selectedGroupSubject dựa trên số lượng groups thực tế
            selectedGroupSubject: processedData.reduce((acc, group, index) => {
              acc[index] = 0; // Chọn môn học đầu tiên mặc định cho mỗi group
              return acc;
            }, {}),
            // Reset listSubjectGroups để tránh data contamination giữa các group topic
            listSubjectGroups: {},
            isAddingTopicGroup: false, // Reset loading state
          };
        });
      } catch (error) {
        console.error('Error creating group question:', error);
        // Reset loading state nếu có lỗi
        this.setState({ isAddingTopicGroup: false });
      }
    }, 100); // Delay nhỏ để tránh freeze UI
  }

  initData() {
    const url = this.props.location.search;
    let params = queryString.parse(url);
    let examId = params.id;

    if (examId && examId !== "" && examId !== undefined) {
      this.loadDetailExamAPI(examId);
      this.setState({
        examId,
        actionUser: "UPDATE",
      });
    } else {
    }
  }

  async loadDetailExamAPI(examId) {
    try {
      setLoader(true);

      const data = {
        exam_id: examId,
        creating_type: "MANUAL",
      };

      await this.props.detailExam(data);

      let {
        exam_section: dataExamSection,
        name,
        type,
        is_redo,
        group,
        level,
        subject,
        point_true_false,
        exam_doc_link,
        exam_doc_link2,
        answer_doc_link,
      } = this.props.detail;

      if (dataExamSection?.length > 0) {
        // Mark the first section as active and others as inactive
        dataExamSection.forEach((section, index) => {
          section.active = index === 0;

          // If section type is 'GROUP_SUBJECT', process its groups
          if (section.exam_section_type === "GROUP_SUBJECT") {
            section.exam_section_group.forEach((groupData) => {
              for (const subject of groupData.subjects) {
                const subIndex = groupData.subjects.indexOf(subject);
                subject.active = subIndex === 0;
              }
            });
          }
        });
        dataExamSection = dataExamSection.sort(
          (a, b) => a.exam_section_order - b.exam_section_order
        );
      } else {
      }
      let pointTrueFalse1 =
        point_true_false === undefined ? 0 : point_true_false["1"];
      let pointTrueFalse2 =
        point_true_false === undefined ? 0 : point_true_false["2"];
      let pointTrueFalse3 =
        point_true_false === undefined ? 0 : point_true_false["3"];
      let pointTrueFalse4 =
        point_true_false === undefined ? 0 : point_true_false["4"];
      let pointTrueFalse = point_true_false === undefined ? false : true;

      // Update the state with the transformed data
      let expandedClusters = {};
      if (dataExamSection?.length > 0) {
        dataExamSection.forEach((section) => {
          if (section.questions) {
            section.questions.forEach((question) => {
              if (question.type === "Cluster" || question.type === "cluster") {
                // Kiểm tra có câu hỏi con hay không
                const hasChildren =
                  section.questions.some((q) => q.parentId === question._id) ||
                  (question.childQuestions &&
                    question.childQuestions.length > 0);
                expandedClusters[question._id] = hasChildren;
              }
            });
          }
        });
      }

      // ✅ THÊM: Parse isMain từ API response vào subSections
      const parsedTabData = (dataExamSection || []).map((section) => {
        // Nếu section có subSections, parse isMain từ backend data
        if (section.subSections && Array.isArray(section.subSections)) {
          const parsedSubSections = section.subSections.map((subSection) => ({
            ...subSection,
            isMain: subSection.isMain === true, // ✅ PRESERVE: isMain flag từ API
          }));

          return {
            ...section,
            subSections: parsedSubSections,
          };
        }
        return section;
      });

      const newState = {
        tabData: parsedTabData, // ✅ Dùng parsed data thay vì dataExamSection
        typeExam: type,
        statusTabCreate: !(dataExamSection?.length > 0),
        subject_id: subject?.id,
        pointTrueFalse,
        pointTrueFalse1,
        pointTrueFalse2,
        pointTrueFalse3,
        pointTrueFalse4,
        name,
        is_redo,
        group,
        level,
        linkExam: exam_doc_link === null ? "" : exam_doc_link,
        linkExam2: exam_doc_link2 === null ? "" : exam_doc_link2,
        linkAnswer: answer_doc_link === null ? "" : answer_doc_link,
        expandedClusters,
      };

      this.setState(newState);
    } catch (error) {
    } finally {
      setLoader(false);
    }
  }

  getData = () => {
    const data = {
      limit: 999,
      is_delete: false,
    };
    return data;
  };

  activeTab = (key) => {
    // Clone the tabData array to avoid direct mutation
    const updatedTabData = this.state.tabData.map((item) => ({
      ...item,
      active: item._id === key, // Set active true only for the matching tab
    }));

    // Update the state with the new tabData and statusTabCreate
    this.setState({
      tabData: updatedTabData,
      statusTabCreate: false,
      selectedSectionId: key, // ✅ FIX: Đồng bộ selectedSectionId với tab đang active
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

  // Fetch exam type rows dựa trên kỳ thi đã chọn
  fetchExamTypeRows() {
    const { examCategory } = this.props;
    if (!examCategory || !examCategory.parts) return null;

    return examCategory.parts
      .filter((item) => !item.hidden && !item.deleted) // ✅ chỉ lấy part không ẩn và không xóa
      .map((item) => (
        <option key={item.id} value={item.name}>
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
    await this.props.listGift({ "status": true, "keyword": "", "competition_part_id": value, "sort_key": "", "sort_value": "", "limit": 20, "page": 1 });

    const selectedExam = this.props.examCategories.find(
      (item) => item._id === value
    );

    this.setState({
      typeExam: value,
      examTypeId: "",
      linkExam: "",
      linkAnswer: "",
    });

    if (value) {
      await this.props.showExamCategory(value);
    }

    // Nếu muốn log timePerPart
    if (selectedExam && selectedExam.config && selectedExam.config[0]) {
      this.state.statusExam = selectedExam.config[0].timePerPart;
    }
  };

  // Helper method để tạo manual question và return data để thêm vào parts
  createManualQuestionForParts = (dataQuestion) => {
    try {
      // Normalize question data với manual format
      const normalizedQuestion = this.normalizeQuestionFormat(
        dataQuestion,
        "manual"
      );

      // Return structured data for parts integration với upload format
      return {
        success: true,
        questionData: normalizedQuestion,
        partStructure: {
          id: "manual-part",
          name: ["Phần thủ công"],
          part_name: "Phần thủ công",
          part_no: 1,
          time: 90,
          score: 10,
          subpart: [
            {
              subpart_name: "Nhóm mặc định",
              subpart_no: 1,
              children: [
                {
                  name: "Môn học mặc định",
                  children_no: 1,
                  questions: [normalizedQuestion],
                },
              ],
            },
          ],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // Helper method để thêm manual question vào this.state.parts
  addManualQuestionToParts = (questionResult) => {
    if (!questionResult.success || !questionResult.questionData) {
      return false;
    }

    const { questionData, partStructure } = questionResult;

    // Update parts state
    this.setState((prevState) => {
      let updatedParts = [...(prevState.parts || [])];

      // Tìm part phù hợp hoặc tạo mới với upload format
      let targetPart = updatedParts.find(
        (part) => part.part_name === "Phần thủ công"
      );

      if (!targetPart) {
        // Tạo part mới cho manual questions với upload format
        targetPart = {
          ...partStructure,
          part_no: updatedParts.length + 1,
        };
        updatedParts.push(targetPart);
      } else {
        // Thêm vào part có sẵn
        if (
          targetPart.subpart &&
          targetPart.subpart[0] &&
          targetPart.subpart[0].children &&
          targetPart.subpart[0].children[0]
        ) {
          targetPart.subpart[0].children[0].questions.push(questionData);
          // ✅ CẬP NHẬT: Tính lại totalquestions sau khi thêm câu hỏi (loại trừ câu hỏi chùm)
          targetPart.totalquestions = this.countQuestionsInPart(targetPart);
        }
      }

      return { parts: updatedParts };
    });

    return true;
  };

  // Method chính để modal gọi - trả về kết quả để modal xử lý
  processManualQuestion = (dataQuestion) => {
    try {
      // Tạo cấu trúc parts cho câu hỏi
      const questionResult = this.createManualQuestionForParts(dataQuestion);

      if (questionResult.success) {
        // Thêm vào parts state
        this.addManualQuestionToParts(questionResult);

        // Trả về kết quả thành công với data
        return {
          success: true,
          message: "Câu hỏi đã được thêm vào parts thành công",
          questionData: questionResult.questionData,
          partStructure: questionResult.partStructure,
        };
      } else {
        return {
          success: false,
          message: questionResult.error || "Có lỗi khi xử lý câu hỏi",
          error: questionResult.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Có lỗi không mong muốn khi xử lý câu hỏi",
        error: error.message,
      };
    }
  };

  async addNewQuestionToGroup(dataQuestion) {

    setLoader(true);
    try {
      // Xử lý cluster và childQuestions
      if (dataQuestion.type === "CLUSTER" || dataQuestion.type === "cluster") {
        if (
          !dataQuestion.childQuestions ||
          !Array.isArray(dataQuestion.childQuestions) ||
          dataQuestion.childQuestions.length === 0
        ) {
          // ✅ FIX: Tạo child questions với STT đúng từ 1
          dataQuestion.childQuestions = [
            {
              _id: `child-${Date.now()}-1`,
              type: "SINGLECHOICE",
              rawHtml: "Câu hỏi con 1 (mặc định)",
              choices: [
                { label: "A", text: "Đáp án A" },
                { label: "B", text: "Đáp án B" },
                { label: "C", text: "Đáp án C" },
                { label: "D", text: "Đáp án D" },
              ],
              correctAnswers: [{ value: "A" }],
              level: "",
              parentId: dataQuestion._id || `temp-${Date.now()}`,
              __temp: true,
              number: 1, // ✅ FIX: Child đầu tiên có STT = 1
              question_no: 1,
            },
            {
              _id: `child-${Date.now()}-2`,
              type: "SINGLECHOICE",
              rawHtml: "Câu hỏi con 2 (mặc định)",
              choices: [
                { label: "A", text: "Đáp án A" },
                { label: "B", text: "Đáp án B" },
                { label: "C", text: "Đáp án C" },
                { label: "D", text: "Đáp án D" },
              ],
              correctAnswers: [{ value: "B" }],
              level: "",
              parentId: dataQuestion._id || `temp-${Date.now()}`,
              __temp: true,
              number: 2, // ✅ FIX: Child thứ hai có STT = 2
              question_no: 2,
            },
          ];
        }
      }

      // Tạo question mới (local, không gọi API)
      let question = {
        ...dataQuestion,
        _id: `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        created_at: new Date().toISOString(),
        isTemp: true,
        number: 0, // ✅ FIX: Cluster có number = 0
        question_no: 0,
      };

      // Lấy thông tin subject đang chọn từ listSubjectGroups
      const selectedSubject = this.state.listSubjectGroups;
      // Validation chi tiết hơn
      if (!selectedSubject) {
        notification.error({
          message: "Lỗi: Không tìm thấy thông tin môn học",
          description: "Vui lòng chọn môn học trước khi thêm câu hỏi",
          placement: "topRight",
        });
        setLoader(false);
        return;
      }

      if (
        !selectedSubject.idSubject ||
        selectedSubject.idSubject.trim() === ""
      ) {
        // Auto-generate idSubject if missing
        const newIdSubject = this.generateObjectId();
        selectedSubject.idSubject = newIdSubject;

        // Cập nhật state
        this.setState({ listSubjectGroups: selectedSubject });

        // Cập nhật idSubject trong groupTopic để đồng bộ
        const currentTab = tabData[currentTabIdx];
        currentTab.groupTopic.forEach((group, groupIdx) => {
          group.subjects.forEach((subject, subjIdx) => {
            if (
              subject.nameSubject === selectedSubject.nameSubject &&
              !subject.idSubject
            ) {
              subject.idSubject = newIdSubject;
            }
          });
        });

        notification.info({
          message: "Đã tạo ID môn học mới",
          description: `ID môn học: ${newIdSubject}`,
          placement: "topRight",
        });
      }

      // Tìm tab hiện tại (NHOM_CHU_DE)
      const tabData = [...this.state.tabData];
      const currentTabIdx = tabData.findIndex(
        (tab) => tab._id === this.state.examSectionId && tab.groupTopic
      );
      if (currentTabIdx === -1) {
        notification.error({
          message: "Không tìm thấy phần nhóm chủ đề",
          placement: "topRight",
        });
        setLoader(false);
        return;
      }

      // Tìm group và subject trong groupTopic
      let updated = false;
      tabData[currentTabIdx].groupTopic.forEach((group, groupIdx) => {
        group.subjects.forEach((subject, subjIdx) => {
          if (subject.idSubject === selectedSubject.idSubject) {
            if (!Array.isArray(subject.questions)) subject.questions = [];
            subject.questions.push(question);
            updated = true;
          }
        });
      });
      if (!updated) {
        notification.error({
          message: "Không tìm thấy môn học để thêm câu hỏi",
          placement: "topRight",
        });
        setLoader(false);
        return;
      }

      // Thêm childQuestions nếu có
      if (
        dataQuestion.childQuestions &&
        Array.isArray(dataQuestion.childQuestions) &&
        dataQuestion.childQuestions.length > 0
      ) {
        // Tìm lại subject để thêm child
        tabData[currentTabIdx].groupTopic.forEach((group, groupIdx) => {
          group.subjects.forEach((subject, subjIdx) => {
            if (subject.idSubject === selectedSubject.idSubject) {
              for (let i = 0; i < dataQuestion.childQuestions.length; i++) {
                const childQuestion = dataQuestion.childQuestions[i];
                const normalizedChild = this.normalizeManualQuestion({
                  ...childQuestion,
                  parentId: question._id,
                  number: childQuestion.number || (i + 1), // ✅ Fallback nếu chưa có
                  question_no: childQuestion.question_no || (i + 1),
                });

                subject.questions.push(normalizedChild);
              }

              // Set expanded cho cluster
              this.setState((prevState) => ({
                expandedClusters: {
                  ...prevState.expandedClusters,
                  [question._id]: true,
                },
              }));
            }
          });
        });
      }

      // ✅ FIX: Cập nhật lại STT sau khi thêm xong
      this.setState({ tabData }, () => {
        // Trigger renumber để đảm bảo STT đúng
        this.updateAllQuestionNumbers();
      });

      notification.success({
        message: "Thêm câu hỏi thành công",
        placement: "topRight",
      });
    } catch (error) {
      notification.error({
        message: "Có lỗi khi thêm câu hỏi vào nhóm chủ đề",
        description: error.message,
        placement: "topRight",
      });
    } finally {
      setLoader(false);
    }
  }


  async addNewQuestion(dataQuestion) {

    setLoader(true);
    try {
      let question;

      // 1. Đảm bảo có section
      if (!this.state.tabData || this.state.tabData.length === 0) {
        await new Promise((resolve) => {
          this.initializeDefaultTabData();
          setTimeout(resolve, 100);
        });
      }

      // 2. Không tạo exam ngay khi thêm câu hỏi
      if (!this.state.examId) {
        dataQuestion.__temp = true;
      }

      // 3. Nếu đang ở cluster thì gán parentId - ✅ FIX: CHỈ cho child questions
      if (this.state.currentClusterId &&
        dataQuestion.type !== "CLUSTER" && dataQuestion.type !== "cluster") {
        // Tìm cluster trong tabData để lấy question_id nếu có, nếu không dùng _id
        let clusterQuestionId = this.state.currentClusterId;
        this.state.tabData.forEach((tab) => {
          // Tìm trong questions chính
          if (tab.questions) {
            const cluster = tab.questions.find(
              (q) => q._id === this.state.currentClusterId
            );
            if (cluster && cluster.question_id) {
              clusterQuestionId = cluster.question_id; // ✅ Ưu tiên dùng question_id
            }
          }
          // Tìm trong subSections
          if (tab.subSections) {
            tab.subSections.forEach((sub) => {
              if (sub.questions) {
                const cluster = sub.questions.find(
                  (q) => q._id === this.state.currentClusterId
                );
                if (cluster && cluster.question_id) {
                  clusterQuestionId = cluster.question_id;
                }
              }
            });
          }
          // Tìm trong childExam
          if (tab.childExam) {
            tab.childExam.forEach((child) => {
              if (child.questions) {
                const cluster = child.questions.find(
                  (q) => q._id === this.state.currentClusterId
                );
                if (cluster && cluster.question_id) {
                  clusterQuestionId = cluster.question_id;
                }
              }
            });
          }
          // Tìm trong groupTopic
          if (tab.groupTopic) {
            tab.groupTopic.forEach((group) => {
              if (group.subjects) {
                group.subjects.forEach((subj) => {
                  if (subj.questions) {
                    const cluster = subj.questions.find(
                      (q) => q._id === this.state.currentClusterId
                    );
                    if (cluster && cluster.question_id) {
                      clusterQuestionId = cluster.question_id;
                    }
                  }
                });
              }
            });
          }
        });
        dataQuestion.parentId = clusterQuestionId; // ✅ Set parentId đúng cho child questions
      }

      // Nếu vẫn chưa tìm thấy cluster, tìm trong tất cả childExam.questions
      // ✅ FIX: Chỉ set parentId nếu câu hỏi hiện tại KHÔNG phải là cluster
      if (this.state.currentClusterId && !dataQuestion.parentId &&
        dataQuestion.type !== "CLUSTER" && dataQuestion.type !== "cluster") {
        for (let tab of this.state.tabData) {
          if (tab.childExam && Array.isArray(tab.childExam)) {
            for (let child of tab.childExam) {
              if (child.questions && Array.isArray(child.questions)) {
                const cluster = child.questions.find(
                  (q) =>
                    q._id === this.state.currentClusterId ||
                    q.question_id === this.state.currentClusterId
                );
                if (cluster) {
                  dataQuestion.parentId = cluster.question_id || cluster._id;
                  break;
                }
              }
            }
            if (dataQuestion.parentId) break;
          }
        }
      }

      // Tạo child questions mặc định nếu là cluster và chưa có childQuestions
      if (dataQuestion.type === "CLUSTER" || dataQuestion.type === "cluster") {
        // ✅ THÊM LOG: Ghi log khi tạo câu hỏi chùm mới
        if (
          !dataQuestion.childQuestions ||
          !Array.isArray(dataQuestion.childQuestions) ||
          dataQuestion.childQuestions.length === 0
        ) {
          // Tạo 2 child questions mặc định
          dataQuestion.childQuestions = [
            {
              _id: `child-${Date.now()}-1`,
              question_id: `manual-child-${Date.now()}-1`, // ✅ FIX: Đảm bảo có question_id
              type: "SINGLECHOICE", // ✅ FIX: Đảm bảo có type
              rawHtml: "Câu hỏi con 1 (mặc định)",
              choices: [
                { label: "A", text: "Đáp án A" },
                { label: "B", text: "Đáp án B" },
                { label: "C", text: "Đáp án C" },
                { label: "D", text: "Đáp án D" },
              ],
              correctAnswers: [{ value: "A" }],
              level: "NHAN_BIET",
              question_level: "NHAN_BIET", // ✅ FIX: Thêm question_level
              parentId:
                dataQuestion.question_id ||
                dataQuestion._id ||
                `temp-${Date.now()}`,
              __temp: true,
              isChild: true, // ✅ FIX: Đánh dấu là child question
            },
            {
              _id: `child-${Date.now()}-2`,
              question_id: `manual-child-${Date.now()}-2`, // ✅ FIX: Đảm bảo có question_id
              type: "SINGLECHOICE", // ✅ FIX: Đảm bảo có type
              rawHtml: "Câu hỏi con 2 (mặc định)",
              choices: [
                { label: "A", text: "Đáp án A" },
                { label: "B", text: "Đáp án B" },
                { label: "C", text: "Đáp án C" },
                { label: "D", text: "Đáp án D" },
              ],
              correctAnswers: [{ value: "B" }],
              level: "THONG_HIEU",
              question_level: "THONG_HIEU", // ✅ FIX: Thêm question_level
              parentId:
                dataQuestion.question_id ||
                dataQuestion._id ||
                `temp-${Date.now()}`,
              __temp: true,
              isChild: true, // ✅ FIX: Đánh dấu là child question
            },
          ];
        }
      }

      // 4. Tạo câu hỏi (temp hoặc gọi API)
      if (dataQuestion && dataQuestion.__temp === true) {
        const safeExtractText = (opt) => {
          if (opt == null) return "";
          if (typeof opt === "string") return opt.trim();
          if (typeof opt === "number") return String(opt);
          if (typeof opt === "object") {
            const keys = [
              "text",
              "label",
              "value",
              "question",
              "key",
              "rawHtml",
              "content",
              "name",
            ];
            for (const k of keys) {
              if (k in opt && opt[k] != null) {
                if (typeof opt[k] === "string") return opt[k].trim();
                if (typeof opt[k] === "number") return String(opt[k]);
                if (typeof opt[k] === "object") return safeExtractText(opt[k]);
              }
            }
            if (opt.rawHtml && typeof opt.rawHtml === "string")
              return opt.rawHtml.replace(/<[^>]*>/g, "").trim();
            try {
              const s = JSON.stringify(opt);
              return s.length > 200 ? s.slice(0, 200) + "..." : s;
            } catch {
              return "";
            }
          }
          return String(opt);
        };

        const isDragDrop = String(dataQuestion.type || "")
          .toUpperCase()
          .includes("DRAG");
        let sanitized = { ...dataQuestion };

        if (isDragDrop) {
          const srcDrag = Array.isArray(dataQuestion.dragDropOptions)
            ? dataQuestion.dragDropOptions
            : Array.isArray(dataQuestion.drag_options)
              ? dataQuestion.drag_options
              : Array.isArray(dataQuestion.answer)
                ? dataQuestion.answer
                : [];

          const dragDropOptions = (srcDrag || [])
            .map((o) => safeExtractText(o))
            .filter(Boolean);

          let srcCorrect =
            dataQuestion.correctAnswers ||
            dataQuestion.correct_answers ||
            dataQuestion.answer ||
            [];
          if (!Array.isArray(srcCorrect)) srcCorrect = [srcCorrect];
          const correctAnswers = srcCorrect
            .map((item) => {
              if (item == null) return null;
              if (typeof item === "object") {
                let v =
                  item.value ??
                  item.answer ??
                  item.label ??
                  item.key ??
                  item.rawHtml ??
                  item;
                if (typeof v === "object") v = safeExtractText(v);
                return { value: String(v) };
              }
              return { value: String(item) };
            })
            .filter((a) => a && a.value);

          sanitized.dragDropOptions = dragDropOptions;
          sanitized.correctAnswers = correctAnswers;

          if (
            (!sanitized.answer || sanitized.answer.length === 0) &&
            Array.isArray(sanitized.correctAnswers)
          ) {
            sanitized.answer = sanitized.correctAnswers.map((c, idx) => ({
              key: String(c.value || "").trim(),
              value: String(idx + 1),
            }));
          }
        }

        const questionId =
          sanitized._id ||
          `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        question = {
          ...sanitized,
          _id: questionId,
          question_id: questionId,
          created_at: new Date().toISOString(),
          isTemp: true,
        };
      }

      // 5. Chuẩn hóa
      question = this.normalizeManualQuestion(question);

      // 6. Tạo parts cho câu hỏi
      const questionResult = this.createManualQuestionForParts(question);
      if (questionResult.success) {
        this.addManualQuestionToParts(questionResult);
      }

      // 7. Thêm vào tabData đúng nơi
      let updatedState;
      // Ưu tiên currentSubSectionId từ state hoặc dataQuestion.childExamId
      const targetSubSectionId =
        this.state.currentSubSectionId || dataQuestion.childExamId;

      if (targetSubSectionId) {
        updatedState = await this.addQuestionToChildExam(
          question,
          targetSubSectionId
        );
      } else {
        updatedState = await this.addQuestionToTabData(question, dataQuestion);
      }

      // 8. Convert sang upload format và save
      const uploadParts = this.convertTabDataToUploadFormat();
      await new Promise((resolve) => {
        this.setState(
          {
            tabData: updatedState.tabData,
            parts: uploadParts,
          },
          () => {
            this.saveTabDataToSession();
            this.syncSectionsWithTabData();
            resolve();
          }
        );
      });

      // 9. Nếu có childQuestions (cluster)
      if (
        dataQuestion.childQuestions &&
        Array.isArray(dataQuestion.childQuestions) &&
        dataQuestion.childQuestions.length > 0
      ) {
        const clusterQuestionId = question._id;
        for (let i = 0; i < dataQuestion.childQuestions.length; i++) {
          const childData = dataQuestion.childQuestions[i];
          const normalizedChild = this.normalizeManualQuestion({
            ...childData,
            parentId: clusterQuestionId,
            _id: childData._id || `child-${Date.now()}-${i}`,
          });

          // Sử dụng cùng logic với parent question
          const childTargetSubSectionId =
            this.state.currentSubSectionId || dataQuestion.childExamId;

          if (childTargetSubSectionId) {
            await this.addQuestionToChildExam(
              normalizedChild,
              childTargetSubSectionId
            );
          } else {
            await this.addQuestionToTabData(normalizedChild, dataQuestion);
          }
        }

        this.setState((prevState) => ({
          expandedClusters: {
            ...prevState.expandedClusters,
            [clusterQuestionId]: true,
          },
        }));
      }

      if (process.env.NODE_ENV === "development") {
        this.debugPayloadDifferences();
      }

      const nextQuestionNo = this.getQuestionNoNew(
        this.state.examSectionId,
        this.state.examSectionGroupId,
        this.state.examSectionSubjectId
      );
      this.setState({ questionNo: nextQuestionNo });
    } catch (error) {
      throw error;
    } finally {
      setLoader(false);
    }
  }

  async addQuestionToChildExam(question, childExamId) {
    const tabData = [...this.state.tabData];
    let found = false;

    for (let sec of tabData) {
      // ✅ FIX: Ưu tiên tìm trong subSections trước
      if (sec.subSections && Array.isArray(sec.subSections)) {
        const subSectionIndex = sec.subSections.findIndex(
          (sub) => String(sub.id) === String(childExamId)
        );

        if (subSectionIndex !== -1) {
          // ✅ Thêm vào subSection.questions
          if (!Array.isArray(sec.subSections[subSectionIndex].questions)) {
            sec.subSections[subSectionIndex].questions = [];
          }
          sec.subSections[subSectionIndex].questions.push(question);

          // ✅ Đồng bộ với childExam nếu có (backward compatibility)
          if (sec.childExam && Array.isArray(sec.childExam)) {
            const childIndex = sec.childExam.findIndex(
              (c) => String(c.idChildExam) === String(childExamId)
            );
            if (childIndex !== -1) {
              if (!Array.isArray(sec.childExam[childIndex].questions)) {
                sec.childExam[childIndex].questions = [];
              }
              sec.childExam[childIndex].questions.push(question);
            }
          }

          found = true;
          break;
        }
      }

      // ✅ Fallback: Tìm trong childExam (backward compatibility)
      if (!found && Array.isArray(sec.childExam)) {
        const childIndex = sec.childExam.findIndex(
          (c) => String(c.idChildExam) === String(childExamId)
        );

        if (childIndex !== -1) {
          // Add question to childExam.questions
          if (!Array.isArray(sec.childExam[childIndex].questions)) {
            sec.childExam[childIndex].questions = [];
          }
          sec.childExam[childIndex].questions.push(question);

          // Đồng bộ với subSection.questions nếu có
          if (sec.subSections && Array.isArray(sec.subSections)) {
            const subSectionIndex = sec.subSections.findIndex(
              (sub) => String(sub.id) === String(childExamId)
            );
            if (subSectionIndex !== -1) {
              if (!Array.isArray(sec.subSections[subSectionIndex].questions)) {
                sec.subSections[subSectionIndex].questions = [];
              }
              sec.subSections[subSectionIndex].questions.push(question);
            } else {
              // Nếu chưa có subSection tương ứng, tạo mới
              const newSubSection = {
                id: childExamId,
                name:
                  sec.childExam[childIndex].name ||
                  sec.childExam[childIndex].nameChildExam,
                questions: [question],
                uploaded: sec.uploaded || false,
              };
              sec.subSections = [...(sec.subSections || []), newSubSection];
            }
          } else {
            // Nếu chưa có subSections array, tạo mới
            sec.subSections = [
              {
                id: childExamId,
                name:
                  sec.childExam[childIndex].name ||
                  sec.childExam[childIndex].nameChildExam,
                questions: [question],
                uploaded: sec.uploaded || false,
              },
            ];
          }

          found = true;
          break;
        }
      }
    }

    if (!found) {
      console.warn("⚠️ ExamCreate - ChildExamId not found:", childExamId);
    }

    return { tabData };
  }

  // Helper method để thêm question vào tabData
  addQuestionToTabData = (question, originalData) => {
    return new Promise((resolve) => {
      let tabNew = [...this.state.tabData];

      // ✅ THÊM DEBUG: Log parentId information

      // Không tự tạo MAC_DINH section nếu đã có dữ liệu từ upload/sections
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

      // ✅ XỬ LÝ CHILD QUESTIONS: Ưu tiên parentId của question trước
      const parentId = question.parentId || this.state.currentClusterId;
      if (parentId) {
        // Đảm bảo question có parentId được set
        question.parentId = parentId;

        // Thêm vào questions array chính hoặc sub-section tương ứng
        let childAdded = false;
        for (let i = 0; i < tabNew.length && !childAdded; i++) {
          // ✅ FIX: Kiểm tra trong sub-sections trước
          if (this.state.currentSubSectionId && tabNew[i].subSections) {
            const subSection = tabNew[i].subSections.find(
              (sub) => sub.id === this.state.currentSubSectionId
            );
            if (subSection) {
              const hasParentCluster = subSection.questions.some(
                (q) =>
                  (q._id === parentId || q.question_id === parentId) &&
                  (q.type === "CLUSTER" || q.type === "cluster")
              );

              if (hasParentCluster) {
                // ✅ FIX: Sử dụng ensureQuestionNumberConsistency
                subSection.questions = this.ensureQuestionNumberConsistency(
                  subSection.questions,
                  { ...question, parentId: parentId }
                );
                childAdded = true;
              }
            }
          }

          // Nếu chưa thêm vào sub-section, thử main questions
          if (!childAdded && tabNew[i].questions) {
            const hasParentCluster = tabNew[i].questions.some(
              (q) =>
                (q._id === parentId || q.question_id === parentId) &&
                (q.type === "CLUSTER" || q.type === "cluster")
            );

            if (hasParentCluster) {
              // ✅ FIX: Sử dụng ensureQuestionNumberConsistency
              tabNew[i].questions = this.ensureQuestionNumberConsistency(
                tabNew[i].questions,
                { ...question, parentId: parentId }
              );
              childAdded = true;
            }
          }
        }

        if (childAdded) {
          resolve({ tabData: tabNew });
          return;
        } else {
        }
      }

      // Tìm section để thêm question
      let questionAdded = false;

      // Thử thêm vào section được chỉ định
      // Ưu tiên map theo index của selectedSectionId trong sections để lấy đúng _id trong tabData (đặc biệt sau upload)
      let targetSectionId =
        this.state.examSectionId ||
        this.state.selectedSectionId ||
        (tabNew[0] && tabNew[0]._id);
      const sections = Array.isArray(this.state.sections)
        ? this.state.sections
        : [];
      const selectedIndex = sections.findIndex(
        (s) => s.id === this.state.selectedSectionId
      );
      if (selectedIndex >= 0 && selectedIndex < tabNew.length) {
        targetSectionId = tabNew[selectedIndex]._id || targetSectionId;
      }

      for (let i = 0; i < tabNew.length; i++) {
        if (tabNew[i]._id === targetSectionId) {
          // ✅ FIX: Ưu tiên thêm vào sub-section nếu có currentSubSectionId
          if (this.state.currentSubSectionId && tabNew[i].subSections) {
            const subSection = tabNew[i].subSections.find(
              (sub) => sub.id === this.state.currentSubSectionId
            );
            if (subSection) {
              if (!subSection.questions) {
                subSection.questions = [];
              }
              // ✅ FIX: Sử dụng ensureQuestionNumberConsistency
              subSection.questions = this.ensureQuestionNumberConsistency(
                subSection.questions,
                question
              );
              questionAdded = true;
              // Reset currentSubSectionId sau khi thêm
              this.setState({ currentSubSectionId: null });
              break;
            }
          }

          // ✅ FIX: Thêm vào main questions chỉ khi không có sub-sections
          if (!questionAdded) {
            if (tabNew[i].exam_section_type === "MAC_DINH") {
              // Thêm vào MAC_DINH section
              if (!tabNew[i].questions) {
                tabNew[i].questions = [];
              }
              // ✅ FIX: Sử dụng ensureQuestionNumberConsistency
              tabNew[i].questions = this.ensureQuestionNumberConsistency(
                tabNew[i].questions,
                question
              );
              questionAdded = true;

              break;
            } else if (tabNew[i].exam_section_type === "GROUP_SUBJECT") {
              // Thêm vào GROUP_SUBJECT section
              if (
                tabNew[i].exam_section_group &&
                tabNew[i].exam_section_group.length > 0
              ) {
                const firstGroup = tabNew[i].exam_section_group[0];
                if (firstGroup.subjects && firstGroup.subjects.length > 0) {
                  if (!firstGroup.subjects[0].questions) {
                    firstGroup.subjects[0].questions = [];
                  }
                  // ✅ FIX: Sử dụng ensureQuestionNumberConsistency
                  firstGroup.subjects[0].questions =
                    this.ensureQuestionNumberConsistency(
                      firstGroup.subjects[0].questions,
                      question
                    );
                  questionAdded = true;

                  break;
                }
              }
            }
          }
        }
      }

      // Nếu chưa thêm được, thêm vào section đầu tiên
      if (!questionAdded && tabNew.length > 0) {
        if (!tabNew[0].questions) {
          tabNew[0].questions = [];
        }
        // ✅ FIX: Sử dụng ensureQuestionNumberConsistency
        tabNew[0].questions = this.ensureQuestionNumberConsistency(
          tabNew[0].questions,
          question
        );
      }

      resolve({ tabData: tabNew });
    });
  };

  async actionUpdateQuestion(dataQuestion) {
    // ✅ THÊM LOG: Ghi log khi bắt đầu actionUpdateQuestion
    // Validate input
    if (
      !dataQuestion ||
      (!dataQuestion._id && !dataQuestion.question_id && !dataQuestion.id)
    ) {
      alert("Không tìm thấy ID câu hỏi để cập nhật!");
      return;
    }

    try {
      // ✅ FIX: Preserve type for cluster questions to prevent type being reset to empty
      if (this.state.currentQuestionvalue && (this.state.currentQuestionvalue.type === "CLUSTER" || this.state.currentQuestionvalue.type === "cluster")) {
        dataQuestion.type = "CLUSTER";
      }

      // ✅ FIX: Đảm bảo ID được preserve đúng cách cho câu hỏi cluster
      if (this.state.currentQuestionvalue) {
        // Giữ nguyên _id và question_id từ câu hỏi gốc
        dataQuestion._id = dataQuestion._id || this.state.currentQuestionvalue._id;
        dataQuestion.question_id = dataQuestion.question_id || this.state.currentQuestionvalue.question_id || this.state.currentQuestionvalue._id;

        // Đặc biệt quan trọng cho cluster questions - đảm bảo có ID ổn định
        if ((dataQuestion.type === "CLUSTER" || dataQuestion.type === "cluster") && !dataQuestion.question_id) {
          dataQuestion.question_id = this.state.currentQuestionvalue._id;
        }
      }

      // 1. Normalize question giống như trong addNewQuestion
      let question = this.normalizeManualQuestion(dataQuestion);

      // Preserve parentId for child questions - ✅ FIX: CHỈ cho child questions
      if (
        this.state.currentQuestionvalue &&
        this.state.currentQuestionvalue.parentId &&
        question.type !== "CLUSTER" && question.type !== "cluster"
      ) {
        question.parentId =
          question.parentId || this.state.currentQuestionvalue.parentId;
      }

      // Đảm bảo parentId được preserve - ✅ FIX: CHỈ cho child questions
      if (this.state.currentClusterId && !question.parentId &&
        question.type !== "CLUSTER" && question.type !== "cluster") {
        question.parentId = this.state.currentClusterId;
      }

      // ✅ FINAL FIX: Đảm bảo cluster questions KHÔNG BAO GIỜ có parentId
      if (question.type === "CLUSTER" || question.type === "cluster") {
        question.parentId = null;
      }

      // 2. Extract all possible IDs for matching
      const questionId = question._id || question.question_id || question.id;
      let tabNew = [...this.state.tabData]; // Create copy to avoid direct mutation
      let updated = false;

      // Function to check if IDs match (handles different ID formats)
      const idsMatch = (q1Id, q2Id) => {
        if (!q1Id || !q2Id) return false;
        return (
          String(q1Id).trim() === String(q2Id).trim() ||
          String(q1Id).toLowerCase() === String(q2Id).toLowerCase()
        );
      };

      // ✅ THÊM: Tìm trong NHOM_CHU_DE nếu chưa tìm thấy - ƯU TIÊN TÌMTRƯỚC
      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].exam_section_type === "NHOM_CHU_DE" && tabNew[i].groupTopic && Array.isArray(tabNew[i].groupTopic)) {
            for (let j = 0; j < tabNew[i].groupTopic.length && !updated; j++) {
              const group = tabNew[i].groupTopic[j];
              if (group.subjects && Array.isArray(group.subjects)) {
                for (let k = 0; k < group.subjects.length && !updated; k++) {
                  const subject = group.subjects[k];
                  if (subject.questions && Array.isArray(subject.questions)) {
                    const questionIndex = subject.questions.findIndex((q) =>
                      idsMatch(q._id, questionId) ||
                      idsMatch(q.question_id, questionId)
                    );
                    if (questionIndex !== -1) {
                      // ✅ FIX: Đảm bảo preserve ID khi cập nhật trong groupTopic
                      const originalQuestion = subject.questions[questionIndex];
                      question._id = question._id || originalQuestion._id;
                      question.question_id = question.question_id || originalQuestion.question_id || originalQuestion._id;

                      subject.questions[questionIndex] = question;
                      updated = true;
                    }
                  }
                }
              }
            }
          }
        }
      }

      // ✅ CẢI THIỆN: Tìm kiếm toàn diện hơn, không phụ thuộc hoàn toàn vào currentSubSectionId
      // Ưu tiên tìm trong childExam nếu currentSubSectionId match
      if (!updated && this.state.currentSubSectionId) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].childExam && Array.isArray(tabNew[i].childExam)) {
            for (let j = 0; j < tabNew[i].childExam.length && !updated; j++) {
              const childExam = tabNew[i].childExam[j];
              if (
                String(childExam.idChildExam) ===
                String(this.state.currentSubSectionId) &&
                childExam.questions &&
                Array.isArray(childExam.questions)
              ) {
                const questionIndex = childExam.questions.findIndex((q) =>
                  idsMatch(q._id, questionId) ||
                  idsMatch(q.question_id, questionId)
                );
                if (questionIndex !== -1) {
                  childExam.questions[questionIndex] = question;
                  updated = true;
                }
              }
            }
          }
        }
      }

      // Nếu chưa tìm thấy, tìm trong subSections
      if (!updated && this.state.currentSubSectionId) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].subSections && Array.isArray(tabNew[i].subSections)) {
            for (let j = 0; j < tabNew[i].subSections.length && !updated; j++) {
              const subSection = tabNew[i].subSections[j];
              if (
                String(subSection.id) === String(this.state.currentSubSectionId) &&
                subSection.questions &&
                Array.isArray(subSection.questions)
              ) {
                const questionIndex = subSection.questions.findIndex((q) =>
                  idsMatch(q._id, questionId) ||
                  idsMatch(q.question_id, questionId)
                );
                if (questionIndex !== -1) {
                  subSection.questions[questionIndex] = question;
                  updated = true;
                }
              }
            }
          }
        }
      }

      // Nếu là câu hỏi con (có parentId), tìm cluster cha trước
      if (!updated && question.parentId) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          // Tìm trong questions chính
          if (tabNew[i].questions && Array.isArray(tabNew[i].questions)) {
            const questionIndex = tabNew[i].questions.findIndex((q) =>
              idsMatch(q._id, questionId) ||
              idsMatch(q.question_id, questionId)
            );
            if (questionIndex !== -1) {
              tabNew[i].questions[questionIndex] = question;
              updated = true;
            }
          }
          // Tìm trong subSections
          if (tabNew[i].subSections && Array.isArray(tabNew[i].subSections)) {
            for (let j = 0; j < tabNew[i].subSections.length && !updated; j++) {
              const subSection = tabNew[i].subSections[j];
              if (subSection.questions && Array.isArray(subSection.questions)) {
                const questionIndex = subSection.questions.findIndex((q) =>
                  idsMatch(q._id, questionId) ||
                  idsMatch(q.question_id, questionId)
                );
                if (questionIndex !== -1) {
                  subSection.questions[questionIndex] = question;
                  updated = true;
                }
              }
            }
          }
          // Tìm trong childExam
          if (tabNew[i].childExam && Array.isArray(tabNew[i].childExam)) {
            for (let j = 0; j < tabNew[i].childExam.length && !updated; j++) {
              const childExam = tabNew[i].childExam[j];
              if (childExam.questions && Array.isArray(childExam.questions)) {
                const questionIndex = childExam.questions.findIndex((q) =>
                  idsMatch(q._id, questionId) ||
                  idsMatch(q.question_id, questionId)
                );
                if (questionIndex !== -1) {
                  childExam.questions[questionIndex] = question;
                  updated = true;
                }
              }
            }
          }
          // Tìm trong groupTopic
          if (tabNew[i].groupTopic && Array.isArray(tabNew[i].groupTopic)) {
            for (let j = 0; j < tabNew[i].groupTopic.length && !updated; j++) {
              const group = tabNew[i].groupTopic[j];
              if (group.subjects && Array.isArray(group.subjects)) {
                for (let k = 0; k < group.subjects.length && !updated; k++) {
                  const subject = group.subjects[k];
                  if (subject.questions && Array.isArray(subject.questions)) {
                    const questionIndex = subject.questions.findIndex((q) =>
                      idsMatch(q._id, questionId) ||
                      idsMatch(q.question_id, questionId)
                    );
                    if (questionIndex !== -1) {
                      subject.questions[questionIndex] = question;
                      updated = true;
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].childExam && Array.isArray(tabNew[i].childExam)) {
            for (let j = 0; j < tabNew[i].childExam.length && !updated; j++) {
              const childExam = tabNew[i].childExam[j];
              if (childExam.questions && Array.isArray(childExam.questions)) {
                const questionIndex = childExam.questions.findIndex((q) =>
                  idsMatch(q._id, questionId) ||
                  idsMatch(q.question_id, questionId)
                );
                if (questionIndex !== -1) {
                  childExam.questions[questionIndex] = question;
                  updated = true;
                }
              }
            }
          }
        }
      }

      // Tìm kiếm toàn diện trong tất cả subSections.questions
      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].subSections && Array.isArray(tabNew[i].subSections)) {
            for (let j = 0; j < tabNew[i].subSections.length && !updated; j++) {
              const subSection = tabNew[i].subSections[j];
              if (subSection.questions && Array.isArray(subSection.questions)) {
                const questionIndex = subSection.questions.findIndex((q) =>
                  idsMatch(q._id, questionId) ||
                  idsMatch(q.question_id, questionId)
                );
                if (questionIndex !== -1) {
                  subSection.questions[questionIndex] = question;
                  updated = true;
                }
              }
            }
          }
        }
      }

      // Cuối cùng, tìm trong tất cả main questions
      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].questions && Array.isArray(tabNew[i].questions)) {
            const questionIndex = tabNew[i].questions.findIndex((q) =>
              idsMatch(q._id, questionId) ||
              idsMatch(q.question_id, questionId)
            );
            if (questionIndex !== -1) {
              tabNew[i].questions[questionIndex] = question;
              updated = true;
            }
          }
        }
      }

      // ✅ THÊM: Tìm trong NHOM_CHU_DE nếu chưa tìm thấy
      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].exam_section_type === "NHOM_CHU_DE" && tabNew[i].groupTopic && Array.isArray(tabNew[i].groupTopic)) {
            for (let j = 0; j < tabNew[i].groupTopic.length && !updated; j++) {
              const group = tabNew[i].groupTopic[j];
              if (group.subjects && Array.isArray(group.subjects)) {
                for (let k = 0; k < group.subjects.length && !updated; k++) {
                  const subject = group.subjects[k];
                  if (subject.questions && Array.isArray(subject.questions)) {
                    const questionIndex = subject.questions.findIndex((q) =>
                      idsMatch(q._id, questionId) ||
                      idsMatch(q.question_id, questionId)
                    );
                    if (questionIndex !== -1) {
                      subject.questions[questionIndex] = question;
                      updated = true;
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].childExam && Array.isArray(tabNew[i].childExam)) {
            for (let child of tabNew[i].childExam) {
              if (child.questions && Array.isArray(child.questions)) {
                const childIndex = child.questions.findIndex(
                  (q) =>
                    idsMatch(q._id, questionId) ||
                    idsMatch(q.question_id, questionId)
                );
                if (childIndex !== -1) {
                  child.questions[childIndex] = question;
                  const subSec = tabNew[i].subSections?.find(
                    (sub) => String(sub.id) === String(child.idChildExam)
                  );
                  if (subSec) {
                    subSec.questions = [...child.questions];
                  }
                  updated = true;
                  break;
                }
              }
            }
            if (updated) break;
          }
        }
      }

      // Tìm kiếm toàn diện trong tất cả subSections.questions
      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].subSections && Array.isArray(tabNew[i].subSections)) {
            for (let subSec of tabNew[i].subSections) {
              if (subSec.questions && Array.isArray(subSec.questions)) {
                const subIndex = subSec.questions.findIndex(
                  (q) =>
                    idsMatch(q._id, questionId) ||
                    idsMatch(q.question_id, questionId)
                );
                if (subIndex !== -1) {
                  subSec.questions[subIndex] = question;
                  updated = true;
                  break;
                }
              }
            }
            if (updated) break;
          }
        }
      }

      // Cuối cùng, tìm trong tất cả main questions
      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].questions && Array.isArray(tabNew[i].questions)) {
            const index = tabNew[i].questions.findIndex(
              (q) =>
                idsMatch(q._id, questionId) ||
                idsMatch(q.question_id, questionId)
            );
            if (index !== -1) {
              tabNew[i].questions[index] = question;
              updated = true;
              break;
            }
          }
        }
      }

      // ✅ THÊM: Tìm trong NHOM_CHU_DE nếu chưa tìm thấy
      if (!updated) {
        for (let i = 0; i < tabNew.length && !updated; i++) {
          if (tabNew[i].exam_section_type === "NHOM_CHU_DE" && tabNew[i].groupTopic && Array.isArray(tabNew[i].groupTopic)) {
            for (let groupIdx = 0; groupIdx < tabNew[i].groupTopic.length && !updated; groupIdx++) {
              const group = tabNew[i].groupTopic[groupIdx];
              if (group.subjects && Array.isArray(group.subjects)) {
                for (let subjectIdx = 0; subjectIdx < group.subjects.length && !updated; subjectIdx++) {
                  const subject = group.subjects[subjectIdx];
                  if (subject.questions && Array.isArray(subject.questions)) {
                    const questionIndex = subject.questions.findIndex(
                      (q) =>
                        idsMatch(q._id, questionId) ||
                        idsMatch(q.question_id, questionId)
                    );
                    if (questionIndex !== -1) {
                      subject.questions[questionIndex] = question;
                      updated = true;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (!updated) {
        alert("Không tìm thấy câu hỏi để cập nhật!");
      }

      // ✅ THÊM: Xử lý childQuestions cho câu hỏi chùm (cluster) - TÁCH BIỆT RÕ RÀNG UPDATE VS CREATE
      if (dataQuestion.childQuestions && Array.isArray(dataQuestion.childQuestions) && dataQuestion.childQuestions.length > 0) {
        // ✅ FIX: Tìm section chứa cluster question - ưu tiên NHOM_CHU_DE
        let clusterTabIndex = -1;
        let clusterLocation = null;

        // Tìm trong NHOM_CHU_DE trước
        for (let i = 0; i < tabNew.length && clusterTabIndex === -1; i++) {
          if (tabNew[i].exam_section_type === "NHOM_CHU_DE" && tabNew[i].groupTopic && Array.isArray(tabNew[i].groupTopic)) {
            for (let j = 0; j < tabNew[i].groupTopic.length; j++) {
              const group = tabNew[i].groupTopic[j];
              if (group.subjects && Array.isArray(group.subjects)) {
                for (let k = 0; k < group.subjects.length; k++) {
                  const subject = group.subjects[k];
                  if (subject.questions && Array.isArray(subject.questions)) {
                    const clusterIndex = subject.questions.findIndex(q =>
                      idsMatch(q._id, questionId) || idsMatch(q.question_id, questionId)
                    );
                    if (clusterIndex !== -1) {
                      clusterTabIndex = i;
                      clusterLocation = { type: 'groupTopic', groupIdx: j, subjectIdx: k };
                      break;
                    }
                  }
                }
                if (clusterLocation) break;
              }
            }
            if (clusterLocation) break;
          }
        }

        // Nếu không tìm thấy trong NHOM_CHU_DE, tìm trong main questions
        if (clusterTabIndex === -1) {
          clusterTabIndex = tabNew.findIndex(tab =>
            tab.questions && Array.isArray(tab.questions) &&
            tab.questions.some(q => idsMatch(q._id, questionId) || idsMatch(q.question_id, questionId))
          );
          if (clusterTabIndex >= 0) {
            clusterLocation = { type: 'main' };
          }
        }

        if (clusterTabIndex >= 0 && clusterLocation) {
          let targetQuestions;

          if (clusterLocation.type === 'groupTopic') {
            targetQuestions = tabNew[clusterTabIndex].groupTopic[clusterLocation.groupIdx].subjects[clusterLocation.subjectIdx].questions;
          } else {
            targetQuestions = tabNew[clusterTabIndex].questions;
          }

          const existingChildQuestions = targetQuestions.filter(q => String(q.parentId) === String(questionId));

          // ✅ TÁCH BIỆT: Duyệt qua từng child question để UPDATE hoặc CREATE
          dataQuestion.childQuestions.forEach((newChild) => {
            const childId = newChild._id || newChild.question_id;
            const existingChildIndex = targetQuestions.findIndex(q =>
              String(q.parentId) === String(questionId) &&
              (idsMatch(q._id, childId) || idsMatch(q.question_id, childId))
            );

            if (existingChildIndex >= 0) {
              // ✅ UPDATE: Child đã tồn tại, cập nhật dữ liệu
              const normalizedChild = this.normalizeManualQuestion({
                ...targetQuestions[existingChildIndex], // Giữ dữ liệu cũ
                ...newChild, // Ghi đè bằng dữ liệu mới
                parentId: questionId, // Đảm bảo parentId đúng
              });
              targetQuestions[existingChildIndex] = normalizedChild;
            } else {
              // ✅ CREATE: Child mới, thêm vào
              const normalizedChild = this.normalizeManualQuestion({
                ...newChild,
                parentId: questionId, // Set parentId đúng
              });
              targetQuestions.push(normalizedChild);
            }
          });

          // ✅ OPTIONAL: Xóa child questions cũ không còn trong dataQuestion.childQuestions (nếu cần)
          // Chỉ xóa nếu child không có trong danh sách mới
          const newChildIds = dataQuestion.childQuestions.map(c => c._id || c.question_id).filter(Boolean);
          const filteredQuestions = targetQuestions.filter(q =>
            String(q.parentId) !== String(questionId) ||
            newChildIds.some(id => idsMatch(q._id, id) || idsMatch(q.question_id, id))
          );

          if (clusterLocation.type === 'groupTopic') {
            tabNew[clusterTabIndex].groupTopic[clusterLocation.groupIdx].subjects[clusterLocation.subjectIdx].questions = filteredQuestions;
          } else {
            tabNew[clusterTabIndex].questions = filteredQuestions;
          }
        }
      }

      const uploadParts = this.convertTabDataToUploadFormat();

      this.setState(
        (prev) => ({
          tabData: tabNew,
          parts: uploadParts,
          selectedSectionId:
            prev.selectedSectionId || (tabNew[0] && tabNew[0]._id),
          currentSubSectionId: null, // Reset after update
        }),
        () => {
          try {
            this.saveTabDataToSession();
          } catch (e) { }
        }
      );
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật câu hỏi!");
    }
  }

  // Method lấy tất cả questions trong NHOM_CHU_DE tab
  getAllQuestionsInGroupTopicTab = (tabId) => {
    const tab = this.state.tabData.find((t) => t._id === tabId);
    if (!tab || tab.exam_section_type !== "NHOM_CHU_DE" || !tab.groupTopic) {
      return [];
    }

    const allQuestions = [];
    tab.groupTopic.forEach((group) => {
      if (group.subjects) {
        group.subjects.forEach((subject) => {
          if (subject.questions) {
            allQuestions.push(...subject.questions);
          }
        });
      }
    });

    return allQuestions;
  };

  // Method để cập nhật parentId cho các câu hỏi con
  updateChildQuestionsParentId = (clusterQuestionId) => {
    this.setState((prevState) => {
      const updatedTabData = prevState.tabData.map((tab) => {
        const newTab = { ...tab };

        if (newTab.questions) {
          newTab.questions = newTab.questions.map((q) => {
            // Kiểm tra parentId và cập nhật nếu cần
            if (q.parentId && q.parentId !== clusterQuestionId) {
              // Tìm cluster trong cùng section
              const clusterExists = newTab.questions.some(
                (cq) =>
                  (cq._id === clusterQuestionId ||
                    cq.question_id === clusterQuestionId) &&
                  (cq.type === "CLUSTER" || cq.type === "cluster")
              );

              if (clusterExists) {
                return { ...q, parentId: clusterQuestionId };
              }
            }
            return q;
          });
        }

        // Cập nhật trong subSections nếu có
        if (newTab.subSections && Array.isArray(newTab.subSections)) {
          newTab.subSections = newTab.subSections.map((subSection) => {
            if (subSection.questions && Array.isArray(subSection.questions)) {
              subSection.questions = subSection.questions.map((q) => {
                if (q.parentId && q.parentId !== clusterQuestionId) {
                  // Tìm cluster trong cùng subsection
                  const clusterExists = subSection.questions.some(
                    (cq) =>
                      (cq._id === clusterQuestionId ||
                        cq.question_id === clusterQuestionId) &&
                      (cq.type === "CLUSTER" || cq.type === "cluster")
                  );

                  if (clusterExists) {
                    return { ...q, parentId: clusterQuestionId };
                  }
                }
                return q;
              });
            }
            return subSection;
          });
        }

        return newTab;
      });

      return { tabData: updatedTabData };
    });
  };

  async createQuestionApi(request) {
    // Local only: không gọi API khi thêm/sửa tức thời
    const now = new Date().toISOString();
    const id =
      request._id || `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const result = { _id: id, created_at: now, ...request };

    return result;
  }

  async createGroupSectionApi(data) {
    setLoader(true);
    await this.props.createSection(data);
    setLoader(false);
  }

  // Validate and fix parts payload to ensure all required fields exist
  validateAndFixPartsPayload = (parts) => {
    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      return this.createDefaultParts();
    }

    const fixedParts = parts.map((part, idx) => {
      try {
        // Ensure all required fields exist
        const fixedPart = {
          id: part.id || part._id || `part-${idx}`,
          name: part.name || part.exam_section_name || `Phần ${idx + 1}`,
          score: Number(part.score || part.total_score || 0),
          time: Number(
            part.time || part.exam_section_time || this.state.time || 0
          ),
          totalquestions: Number(
            part.totalquestions || this.countQuestionsInPart(part) || 0
          ),
          type: part.type || part.exam_section_type || "MAC_DINH",
          subpart: [],
        };

        // Validate and fix subparts
        if (part.subpart && Array.isArray(part.subpart)) {
          fixedPart.subpart = part.subpart.map((subpart, subIdx) => {
            const fixedSubpart = {
              name: subpart.name || `Phần con`,
              score: Number(subpart.score || 0),
              time: Number(subpart.time || 0),
              children: [],
            };

            // Validate and fix children
            if (subpart.children && Array.isArray(subpart.children)) {
              fixedSubpart.children = subpart.children.map(
                (child, childIdx) => {
                  const fixedChild = {
                    name: child.name || `Children ${childIdx + 1}`,
                    questions: [],
                  };

                  // Validate and fix questions
                  if (child.questions && Array.isArray(child.questions)) {
                    fixedChild.questions = child.questions
                      .filter((q) => q != null) // Remove null/undefined questions
                      .map((question, qIdx) => {
                        return this.validateAndFixQuestion(question, qIdx + 1);
                      });
                  }

                  return fixedChild;
                }
              );
            }

            // Ensure at least one child exists
            if (fixedSubpart.children.length === 0) {
              fixedSubpart.children.push({
                name: "Children 1",
                questions: [],
              });
            }

            return fixedSubpart;
          });
        }

        // Ensure at least one subpart exists
        if (fixedPart.subpart.length === 0) {
          fixedPart.subpart.push({
            name: fixedPart.name,
            score: fixedPart.score,
            time: fixedPart.time,
            children: [
              {
                name: "Children 1",
                questions: [],
              },
            ],
          });
        }

        // Recalculate totalquestions after cleanup
        fixedPart.totalquestions = this.countQuestionsInPart(fixedPart);

        return fixedPart;
      } catch (partError) {
        // Return a safe default part
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
                  name: "Children 1",
                  questions: [],
                },
              ],
            },
          ],
        };
      }
    });

    // Filter out any null parts and ensure we have at least one
    const validParts = fixedParts.filter((part) => part != null);

    if (validParts.length === 0) {
      return this.createDefaultParts();
    }

    return validParts;
  };

  // Tính tổng số câu hỏi của toàn bộ exam (loại trừ câu hỏi chùm)
  getTotalExamQuestions = () => {
    const tabData = Array.isArray(this.state.tabData) ? this.state.tabData : [];
    return tabData.reduce((total, tab) => {
      return total + this.countTotalQuestion(tab);
    }, 0);
  };

  // Validate and fix individual question structure
  validateAndFixQuestion = (question, questionNo) => {
    try {
      // Handle both direct question and wrapped question formats
      const baseQuestion = question.question || question;

      if (!baseQuestion || typeof baseQuestion !== "object") {
        return this.createDefaultQuestionWrapper(questionNo);
      }

      // Ensure required fields exist
      const fixedQuestion = {
        question: {
          questionId:
            baseQuestion.questionId ||
            baseQuestion.question_id ||
            baseQuestion._id ||
            `q-${Date.now()}-${questionNo}`,
          rawHtml:
            baseQuestion.rawHtml ||
            baseQuestion.content ||
            baseQuestion.question ||
            "Câu hỏi mặc định",
          type: baseQuestion.type || "SINGLECHOICE",
          choices: Array.isArray(baseQuestion.choices)
            ? baseQuestion.choices
            : [],
          correctAnswers: Array.isArray(baseQuestion.correctAnswers)
            ? baseQuestion.correctAnswers
            : [],
          explanation: baseQuestion.explanation || "",
          level: baseQuestion.level || baseQuestion.question_level || "",
          images: Array.isArray(baseQuestion.images) ? baseQuestion.images : [],
          video: baseQuestion.video || baseQuestion.video_link || "",
          parentId: baseQuestion.parentId || null,
        },
        // number: Number(question.number || question.question_no || questionNo || 1)
        number: Number(
          question.number ||
          question.question_no ||
          questionNo ||
          this.getNextQuestionNumber()
        ),
      };

      return fixedQuestion;
    } catch (error) {
      return this.createDefaultQuestionWrapper(questionNo);
    }
  };

  // Create a default question wrapper
  createDefaultQuestionWrapper = (questionNo = 1) => {
    return {
      question: {
        questionId: `default-${Date.now()}-${questionNo}`,
        rawHtml: "Câu hỏi mặc định",
        type: "singlechoice",
        choices: [],
        correctAnswers: [],
        explanation: "",
        level: "",
        images: [],
        video: "",
        parentId: null,
      },
      number: questionNo,
    };
  };

  // Build simple parts payload - focus on correct format only
  buildSimplePartsPayload = () => {
    const subSectionNames = this.getSubSectionNames();
    const tabData = this.state.tabData || [];

    if (tabData.length === 0) {
      return [
        {
          name: "Phần mặc định",
          type: "MAC_DINH",
          totalquestions: 0,
          subpart: [
            {
              name: "1.1 Phần mặc định",
              children: [
                {
                  name: "Children 1",
                  questions: [],
                },
              ],
            },
          ],
        },
      ];
    }

    return tabData.map((tab, idx) => {
      const partName = tab.exam_section_name || `Phần ${idx + 1}`;
      const partType = "MAC_DINH";
      let allQuestions = [];

      // ✅ ĐƠN GIẢN: Collect all questions from this tab
      if (tab.exam_section_type === "MAC_DINH") {
        allQuestions = tab.questions || [];
      } else if (tab.exam_section_type === "NHOM_CHU_DE") {
        (tab.exam_section_group || []).forEach((group) => {
          (group.subjects || []).forEach((subject) => {
            allQuestions.push(...(subject.questions || []));
          });
        });
      }

      // ✅ XỬ LÝ SUB-SECTIONS: Nếu có sub-sections, tạo subpart cho mỗi sub-section
      let subparts = [];

      if (tab.subSections && tab.subSections.length > 0) {
        // Lọc sub-sections có câu hỏi
        const validSubSections = tab.subSections.filter(
          (subSection) =>
            subSection.questions && subSection.questions.length > 0
        );

        if (validSubSections.length > 0) {
          subparts = validSubSections.map((subSection, subIndex) => {
            // ✅ ĐƠN GIẢN: Format questions đúng API format cho sub-section
            const formattedQuestions = (subSection.questions || [])
              .filter((q) => q && (q._id || q.question_id)) // Only valid questions
              .map((q) => this.convertQuestionToAPIFormat(q));

            const subPartName = `${subSection.name}`;

            return {
              name: subPartName,
              children: [
                {
                  name: "Children 1",
                  questions: formattedQuestions,
                },
              ],
            };
          });
        } else {
          // Nếu không có sub-sections hợp lệ, tạo subpart mặc định với questions của section chính
          const formattedQuestions = allQuestions
            .filter((q) => q && (q._id || q.question_id)) // Only valid questions
            .map((q) => this.convertQuestionToAPIFormat(q));

          const subPartName = (() => {
            const subSectionKey = `${tab._id}_sub_0`; // Mặc định lấy subpart đầu tiên
            const customName = subSectionNames[subSectionKey];

            if (customName) {
              // ✅ LƯU TÊN PHẦN THI CON: "tên-phần-thi-con Phần X"
              return `${customName} Phần ${idx + 1}`;
            } else {
              return `${partName}`;
            }
          })();

          subparts = [
            {
              name: subPartName,
              children: [
                {
                  name: "Children 1",
                  questions: formattedQuestions,
                },
              ],
            },
          ];
        }
      } else {
        // Không có sub-sections, tạo subpart mặc định
        const formattedQuestions = allQuestions
          .filter((q) => q && (q._id || q.question_id)) // Only valid questions
          .map((q) => this.convertQuestionToAPIFormat(q));

        const subPartName = (() => {
          const subSectionKey = `${tab._id}_sub_0`; // Mặc định lấy subpart đầu tiên
          const customName = subSectionNames[subSectionKey];

          if (customName) {
            // ✅ LƯU TÊN PHẦN THI CON: "tên-phần-thi-con Phần X"
            return `${customName} Phần ${idx + 1}`;
          } else {
            return `${partName}`;
          }
        })();
        subparts = [
          {
            name: subPartName,
            children: [
              {
                name: "Children 1",
                questions: formattedQuestions,
              },
            ],
          },
        ];
      }

      // Tính tổng số câu hỏi từ tất cả subparts (chỉ tính child questions, loại trừ cluster)
      const totalQuestions = subparts.reduce((total, subpart) => {
        return (
          total +
          subpart.children.reduce((subTotal, child) => {
            // Chỉ đếm câu hỏi có parentId (child questions), loại trừ cluster
            return subTotal + child.questions.filter((q) => q.parentId).length;
          }, 0)
        );
      }, 0);

      return {
        name: partName,
        type: partType,
        totalquestions: totalQuestions,
        subpart: subparts,
      };
    });
  };

  // Helper methods cho format API
  mapTypeToAPI = (type) => {
    const typeMap = {
      SINGLECHOICE: "singlechoice",
      MULTIPLECHOICE: "multiplechoice",
      TRUEFALSE: "truefalse",
      TRUEFALSEMULTI: "truefalsemulti",
      FILLINBLANK: "fillinblank",
      DRAGDROP: "dragdrop",
      CLUSTER: "cluster",
    };
    return typeMap[String(type).toUpperCase()] || "singlechoice";
  };

  formatChoicesForAPI = (choices, questionType) => {
    if (!Array.isArray(choices)) return [];

    // Special handling for DRAGDROP - use dragDropOptions instead of choices
    if (questionType === "dragdrop" || questionType === "TN_DRAG_DROP") {
      return []; // DRAGDROP doesn't use traditional choices
    }

    // Default handling for other question types
    return choices.map((choice) => ({
      label: choice.label || choice.id || choice.key || "A",
      text: choice.text || choice.value || String(choice),
      rawHtml: choice.rawHtml || choice.content || String(choice),
    }));
  };

  formatAnswersForAPI = (answers, questionType) => {
    if (!answers) return [];

    // Helper function to safely extract value from object
    const safeExtractValue = (obj) => {
      if (obj === null || obj === undefined) return "";
      if (typeof obj === "string") return obj.trim();
      if (typeof obj === "number") return String(obj);
      if (typeof obj === "boolean") return String(obj);

      if (typeof obj === "object") {
        // Try common keys in order of preference
        const keys = [
          "value",
          "text",
          "label",
          "answer",
          "key",
          "id",
          "rawHtml",
          "content",
          "name",
        ];
        for (const key of keys) {
          if (key in obj && obj[key] != null) {
            if (typeof obj[key] === "string") return obj[key].trim();
            if (typeof obj[key] === "number") return String(obj[key]);
            if (typeof obj[key] === "boolean") return String(obj[key]);
            // Recursive for nested objects
            if (typeof obj[key] === "object") return safeExtractValue(obj[key]);
          }
        }

        // If rawHtml exists, strip HTML tags
        if (obj.rawHtml && typeof obj.rawHtml === "string") {
          return obj.rawHtml.replace(/<[^>]*>/g, "").trim();
        }

        // Last resort: try to stringify but avoid "[object Object]"
        try {
          const str = JSON.stringify(obj);
          if (
            str &&
            str !== "{}" &&
            str !== "[]" &&
            !str.includes("[object Object]")
          ) {
            return str;
          }
        } catch (e) {
          // Ignore stringify errors
        }

        return "";
      }

      return String(obj);
    };

    // Special handling for DRAGDROP
    if (questionType === "dragdrop" || questionType === "TN_DRAG_DROP") {
      if (Array.isArray(answers)) {
        const formatted = answers
          .map((ans) => {
            const extractedValue = safeExtractValue(ans);

            return { value: extractedValue };
          })
          .filter((item) => item.value !== ""); // Remove empty values

        return formatted;
      } else {
        const extractedValue = safeExtractValue(answers);

        return extractedValue ? [{ value: extractedValue }] : [];
      }
    }

    // Default handling for other question types
    if (Array.isArray(answers)) {
      return answers
        .map((ans) => {
          const extractedValue = safeExtractValue(ans);
          return { value: extractedValue };
        })
        .filter((item) => item.value !== ""); // Remove empty values
    }

    const extractedValue = safeExtractValue(answers);
    return extractedValue ? [{ value: extractedValue }] : [];
  };

  // Method mới: Debug STT của tất cả questions trong NHOM_CHU_DE
  debugGroupTopicQuestionNumbers = () => {
    try {
      const { tabData } = this.state;

      if (!tabData || !Array.isArray(tabData)) return;

      tabData.forEach((tab) => {
        if (tab.exam_section_type === "NHOM_CHU_DE" && tab.groupTopic) {
          tab.groupTopic.forEach((group, groupIdx) => {
            if (group.subjects && Array.isArray(group.subjects)) {
              group.subjects.forEach((subject, subjectIdx) => {
                if (subject.questions && Array.isArray(subject.questions)) {
                  subject.questions.forEach((question, qIdx) => {
                    const sttInfo = {
                      questionId: question._id,
                      type: question.type,
                      number: question.number,
                      question_no: question.question_no,
                      questionNo: question.questionNo,
                      parentId: question.parentId,
                    };
                  });
                }
              });
            }
          });
        }
      });
    } catch (error) {
      // Error debugging NHOM_CHU_DE question numbers
    }
  };

  // Method mới: Update STT cho tất cả questions trong NHOM_CHU_DE
  updateGroupTopicQuestionNumbers = () => {
    try {
      const { tabData } = this.state;

      if (!tabData || !Array.isArray(tabData)) return;

      // Sử dụng QuestionNumberingService để đánh số thống nhất cho NHOM_CHU_DE
      tabData.forEach((tab) => {
        if (tab.exam_section_type === "NHOM_CHU_DE" && tab.groupTopic) {
          tab.groupTopic.forEach((group, groupIdx) => {
            if (group.subjects && Array.isArray(group.subjects)) {
              group.subjects.forEach((subject, subjectIdx) => {
                if (subject.questions && Array.isArray(subject.questions)) {
                  subject.questions = QuestionNumberingService.unifiedQuestionNumbering(
                    subject.questions,
                    'NHOM_CHU_DE',
                    {
                      sectionId: tab._id,
                      groupIdx,
                      subjectIdx,
                      tabData,
                      preserveExistingNumbers: true,
                    }
                  );
                }
              });
            }
          });
        }
      });
    } catch (error) {
      // Error updating NHOM_CHU_DE question numbers
    }
  };

  // Method mới: Build unified parts payload cho cả upload và manual
  buildUnifiedPartsPayload = () => {
    // Update STT cho NHOM_CHU_DE trước khi build payload
    this.updateGroupTopicQuestionNumbers();

    // Debug STT sau khi update
    this.debugGroupTopicQuestionNumbers();

    const tabData = this.state.tabData || [];

    const timePerPart = this.state.timePerPart || [];
    const scorePerPart = this.state.scorePerPart || [];
    if (tabData.length === 0) {
      return [
        {
          name: "Phần mặc định",
          type: "MAC_DINH",
          totalquestions: 0,
          time: 0, // Default time
          score: 0, // Default score
          subpart: [
            {
              isMain: true, // ✅ Bảng chính mặc định
              maxSubject: 1,
              name: "1.1 Phần mặc định",
              children: [
                {
                  name: "Children 1",
                  questions: [],
                },
              ],
            },
          ],
        },
      ];
    }

    return tabData.map((tab, idx) => {
      const partName = tab.exam_section_name || `Phần ${idx + 1}`;
      let totalQuestions = 0;
      let subparts = [];

      // ✅ KIỂM TRA: Tab có phải từ upload không?
      const isUploadedTab =
        tab.uploaded || tab.classification || tab.originalPartName;

      // ✅ LOGIC: Xác định bảng chính vs bảng con
      const hasSubSections = tab.subSections && tab.subSections.length > 0;
      const hasChildExam = tab.childExam && tab.childExam.length > 0;
      const hasValidSubSections =
        hasSubSections &&
        tab.subSections.some(
          (sub) => sub.questions && sub.questions.length > 0
        );
      const hasMainQuestions = tab.questions && tab.questions.length > 0;

      // ✅ CASE 1: Có sub-sections với câu hỏi
      if (hasValidSubSections) {
        // ✅ QUAN TRỌNG: Nếu có main questions → main là bảng chính
        if (hasMainQuestions) {
          const mainFormattedQuestions = (tab.questions || [])
            .filter((q) => q && (q._id || q.question_id))
            .map((q) => this.convertQuestionToAPIFormat(q));

          const mainRealQuestions = mainFormattedQuestions.filter(
            (q) => q.parentId || (q.question && q.question.type !== "cluster")
          );
          totalQuestions += mainRealQuestions.length;

          subparts.push({
            isMain: true, // ✅ Main questions luôn là bảng chính
            maxSubject: 1,
            name: `${partName}`,
            children: [
              {
                name: "Children 1",
                questions: mainFormattedQuestions,
              },
            ],
          });
        }

        // ✅ Sub-sections:
        // - Upload: Dùng isMain từ API nếu có
        // - Manual: Sub-sections luôn là sub-sections, không bao giờ là main

        tab.subSections.forEach((subSection, subIdx) => {
          if (subSection.questions && subSection.questions.length > 0) {
            const formattedQuestions = (subSection.questions || [])
              .filter((q) => q && (q._id || q.question_id))
              .map((q) => this.convertQuestionToAPIFormat(q));

            const realQuestions = formattedQuestions.filter(
              (q) => q.parentId || (q.question && q.question.type !== "cluster")
            );
            totalQuestions += realQuestions.length;

            // ✅ XÁC ĐỊNH isMain:
            let isMainValue;

            if (isUploadedTab && subSection.isMain !== undefined) {
              // Upload: Dùng isMain từ API
              isMainValue = subSection.isMain === true;
            } else {
              // Manual: Sub-sections luôn là sub-sections, không bao giờ là main
              isMainValue = false;
            }

            const subpartName = isMainValue
              ? `${partName}`
              : `${subSection.name}`;

            subparts.push({
              isMain: isMainValue, // ✅ Upload: từ API, Manual: tính toán
              maxSubject: 1,
              name: subpartName,
              children: [
                {
                  name: "Children 1",
                  questions: formattedQuestions,
                },
              ],
            });
          }
        });
      }
      // ✅ CASE 2: Có childExam
      else if (hasChildExam) {
        // Child exam đầu tiên là bảng chính, các child exam còn lại là bảng con
        tab.childExam.forEach((child, cIdx) => {
          const formattedQuestions = (child.questions || [])
            .filter((q) => q && (q._id || q.question_id))
            .map((q) => this.convertQuestionToAPIFormat(q));

          const realQuestions = formattedQuestions.filter(
            (q) => q.parentId || (q.question && q.question.type !== "cluster")
          );
          totalQuestions += realQuestions.length;

          subparts.push({
            isMain: cIdx === 0, // ✅ Child exam đầu tiên là bảng chính
            maxSubject: 1,
            name:
              cIdx === 0
                ? `${partName}`
                : child.name || `Phần thi con ${cIdx + 1}`,
            children: [
              {
                name: "Children 1",
                questions: formattedQuestions,
              },
            ],
          });
        });
      }
      // ✅ Fallback: subSections nếu không có childExam
      else if (tab.subSections && tab.subSections.length > 0) {
        const validSubSections = tab.subSections.filter(
          (subSection) =>
            subSection.questions && subSection.questions.length > 0
        );

        if (validSubSections.length > 0) {
          // ✅ LOGIC ĐƠN GIẢN: SubSection đầu tiên là bảng chính
          subparts = validSubSections.map((subSection, subIdx) => {
            const formattedQuestions = (subSection.questions || [])
              .filter((q) => q && (q._id || q.question_id))
              .map((q) => this.convertQuestionToAPIFormat(q));

            // Chỉ đếm câu hỏi thực sự
            const realQuestions = formattedQuestions.filter(
              (q) => q.parentId || (q.question && q.question.type !== "cluster")
            );
            totalQuestions += realQuestions.length;

            // ✅ SubSection đầu tiên là bảng chính
            const isMainValue = subIdx === 0;

            return {
              isMain: isMainValue, // ✅ Đơn giản: sub-section đầu tiên là main
              maxSubject: 1,
              name: isMainValue ? `${partName}` : `${subSection.name}`,
              children: [
                {
                  name: "Children 1",
                  questions: formattedQuestions,
                },
              ],
            };
          });
        } else {
          // Fallback: sử dụng main questions
          let questions = [];
          if (tab.exam_section_type === "GROUP_SUBJECT") {
            (tab.exam_section_group || []).forEach((group) => {
              (group.subjects || []).forEach((subject) => {
                questions.push(...(subject.questions || []));
              });
            });
          } else {
            questions = tab.questions || [];
          }

          const formattedQuestions = questions
            .filter((q) => q && (q._id || q.question_id))
            .map((q) => this.convertQuestionToAPIFormat(q));

          const realQuestions = formattedQuestions.filter(
            (q) => q.parentId || (q.question && q.question.type !== "cluster")
          );
          totalQuestions += realQuestions.length;

          subparts.push({
            isMain: true, // ✅ Main questions là bảng chính
            maxSubject: 1,
            name: `${partName}`,
            children: [
              {
                name: "Children 1",
                questions: formattedQuestions,
              },
            ],
          });
        }
      }
      // Chỉ dùng childExam nếu KHÔNG có subSections
      else if (tab.childExam && tab.childExam.length > 0) {
        subparts = tab.childExam.map((child, cIdx) => {
          const formattedQuestions = (child.questions || [])
            .filter((q) => q && (q._id || q.question_id))
            .map((q) => this.convertQuestionToAPIFormat(q));

          const realQuestions = formattedQuestions.filter(
            (q) => q.parentId || (q.question && q.question.type !== "cluster")
          );
          totalQuestions += realQuestions.length;
          return {
            isMain: cIdx === 0, // ✅ Child exam đầu tiên là bảng chính
            maxSubject: 1,
            name:
              cIdx === 0
                ? `${partName}`
                : child.name || `Phần thi con ${cIdx + 1}`,
            children: [
              {
                name: "Children 1",
                questions: formattedQuestions,
              },
            ],
          };
        });
      } else if (tab.exam_section_type === "GROUP_SUBJECT") {
        (tab.exam_section_group || []).forEach((group, j) => {
          const subpart = {
            isMain: true, // ✅ GROUP_SUBJECT là bảng chính
            maxSubject: group.subjects ? group.subjects.length : 1,
            name: `${idx + 1}.${j + 1} ${group.name || group.group_name || `Nhóm ${j + 1}`
              }`,
            children: [],
          };

          (group.subjects || []).forEach((subject, k) => {
            const subjectQuestions = (subject.questions || [])
              .filter((q) => q && (q._id || q.question_id))
              .map((q) => this.convertQuestionToAPIFormat(q));

            const realQuestions = subjectQuestions.filter(
              (q) => q.parentId || (q.question && q.question.type !== "cluster")
            );
            totalQuestions += realQuestions.length;

            subpart.children.push({
              name: `Children ${k + 1}`,
              questions: subjectQuestions,
            });
          });

          if (subpart.children.length === 0) {
            subpart.children.push({
              name: "Children 1",
              questions: [],
            });
          }

          subparts.push(subpart);
        });
      }
      // ✅ CASE 3: NHOM_CHU_DE
      // ...existing code...
      else if (tab.exam_section_type === "NHOM_CHU_DE") {
        (tab.groupTopic || []).forEach((group, gIdx) => {
          // ✅ THAY ĐỔI: Kiểm tra số lượng subjects để set maxSubject
          const subjectsCount = group.subjects ? group.subjects.length : 0;
          const maxSubject = subjectsCount > 1 ? 3 : 1;

          const subpart = {
            isMain: true, // ✅ NHOM_CHU_DE luôn là bảng chính
            maxSubject: maxSubject, // ✅ SỬA: Set dựa trên số lượng subjects
            name:
              group.nameTopic?.trim() !== ""
                ? group.nameTopic
                : `Nhóm ${gIdx + 1}`,
            children: [],
          };

          (group.subjects || []).forEach((subject, sIdx) => {
            // ✅ QUAN TRỌNG: Questions đã được update STT từ updateGroupTopicQuestionNumbers
            const subjectQuestions = (subject.questions || [])
              .filter((q) => q && (q._id || q.question_id))
              .map((q) => {
                const converted = this.convertQuestionToAPIFormat(q);
                return converted;
              });

            const realQuestions = subjectQuestions.filter(
              (q) => q.parentId || (q.question && q.question.type !== "cluster")
            );
            totalQuestions += realQuestions.length;

            subpart.children.push({
              name:
                subject.nameSubject?.trim() !== ""
                  ? subject.nameSubject
                  : `Môn ${sIdx + 1}`,
              questions: subjectQuestions,
            });
          });

          if (subpart.children.length === 0) {
            subpart.children.push({
              name: "Children 1",
              questions: [],
            });
          }

          subparts.push(subpart);
        });
      }
      // ...existing code...
      // ✅ CASE 4: MAC_DINH section (chỉ có main questions)
      else {
        const questions = (tab.questions || [])
          .filter((q) => q && (q._id || q.question_id))
          .map((q) => this.convertQuestionToAPIFormat(q));

        const realQuestions = questions.filter(
          (q) => q.parentId || (q.question && q.question.type !== "cluster")
        );
        totalQuestions += realQuestions.length;

        subparts.push({
          isMain: true, // ✅ Bảng chính mặc định
          maxSubject: 1,
          name: `${partName}`,
          children: [
            {
              name: "Children 1",
              questions: questions,
            },
          ],
        });
      }

      // ✅ Đảm bảo luôn có ít nhất 1 subpart
      if (subparts.length === 0) {
        subparts.push({
          isMain: true, // ✅ Fallback subpart là bảng chính
          maxSubject: 1,
          name: `${partName}`,
          children: [
            {
              name: "Children 1",
              questions: [],
            },
          ],
        });
      }
      return {
        name: partName,
        type:
          tab.exam_section_type === "NHOM_CHU_DE" ? "NHOM_CHU_DE" : "MAC_DINH",
        totalquestions: totalQuestions,
        time: Number(timePerPart[idx] || tab.exam_section_time || 0),
        score: Number(scorePerPart[idx] || tab.total_score || 0),
        subpart: subparts,
        // ✅ SỬA: Chỉ thêm maxGroup khi là NHOM_CHU_DE và có groupTopic
        ...(tab.exam_section_type === "NHOM_CHU_DE" &&
          tab.groupTopic &&
          Array.isArray(tab.groupTopic) &&
          tab.groupTopic.length > 0 &&
          tab.groupTopic[0].maxTopics
          ? { maxGroup: tab.groupTopic[0].maxTopics }
          : {}),
      };
    });
  };

  buildPartsPayload = () => {
    try {
      // Validate UI state first
      if (!this.validateUIState()) {
        return this.createDefaultParts();
      }

      // Always build from current tabData to ensure sync
      let tabData = this.state.tabData || [];

      // If no tabData after validation, create default part with proper structure and update state
      if (tabData.length === 0) {
        return this.createDefaultParts();
      }

      const parts = tabData.map((tab, idx) => {
        try {
          const totalQuestions = this.countTotalQuestion(tab);

          const part = {
            id: tab._id || tab.id || `part-${idx}`,
            name: tab.exam_section_name || `Phần ${idx + 1}`,
            score: tab.total_score || tab.score || 0,
            time: tab.exam_section_time || tab.time || this.state.time || 0,
            totalquestions: totalQuestions,
            type: tab.exam_section_type || "MAC_DINH",
            subpart: [],
          };

          if (tab.exam_section_type === "GROUP_SUBJECT") {
            // Handle GROUP_SUBJECT sections
            (tab.exam_section_group || []).forEach((group, j) => {
              const subpart = {
                name: group.name || group.group_name || `Nhóm ${j + 1}`,
                score: group.score || 0,
                time: group.time || 0,
                children: [],
              };

              // Add children for each subject that has questions
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

              // Always add subpart even if no children (API requirement)
              if (subpart.children.length === 0) {
                subpart.children.push({
                  name: group.name || group.group_name || `Nhóm ${j + 1}`,
                  questions: [],
                });
              }

              part.subpart.push(subpart);
            });

            // If no subparts created, add default empty subpart
            if (part.subpart.length === 0) {
              part.subpart.push({
                name: tab.exam_section_name || `Phần ${idx + 1}`,
                score: 0,
                time: 0,
                children: [
                  {
                    name: tab.exam_section_name || `Phần ${idx + 1}`,
                    questions: [],
                  },
                ],
              });
            }
          } else {
            // Handle MAC_DINH sections - including sub-sections
            const sectionQuestions = tab.questions || [];

            // Check if this section has sub-sections
            if (tab.subSections && tab.subSections.length > 0) {
              // Filter sub-sections that have questions
              const validSubSections = tab.subSections.filter(
                (subSection) =>
                  subSection.questions && subSection.questions.length > 0
              );

              if (validSubSections.length > 0) {
                // Create subparts for each valid sub-section
                part.subpart = validSubSections.map((subSection, subIndex) => ({
                  name: subSection.name,
                  score: subSection.score || 0,
                  time: subSection.time || 0,
                  children: [
                    {
                      name: subSection.name,
                      questions: this.processQuestionsForAPI(
                        subSection.questions
                      ),
                    },
                  ],
                }));
              } else {
                // No valid sub-sections, use main section questions
                part.subpart = [
                  {
                    name: tab.exam_section_name || `Phần ${idx + 1}`,
                    score: tab.total_score || tab.score || 0,
                    time:
                      tab.exam_section_time || tab.time || this.state.time || 0,
                    children: [
                      {
                        name: tab.exam_section_name || `Phần ${idx + 1}`,
                        questions:
                          this.processQuestionsForAPI(sectionQuestions),
                      },
                    ],
                  },
                ];
              }
            } else {
              // No sub-sections, use original logic
              part.subpart = [
                {
                  name: tab.exam_section_name || `Phần ${idx + 1}`,
                  score: tab.total_score || tab.score || 0,
                  time:
                    tab.exam_section_time || tab.time || this.state.time || 0,
                  children: [
                    {
                      name: tab.exam_section_name || `Phần ${idx + 1}`,
                      questions: this.processQuestionsForAPI(sectionQuestions),
                    },
                  ],
                },
              ];
            }
          }

          return part;
        } catch (partError) {
          // Return a safe default part
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
                    name: `Phần ${idx + 1}`,
                    questions: [],
                  },
                ],
              },
            ],
          };
        }
      });

      // Filter out any null/undefined parts
      const validParts = parts.filter((part) => part != null);

      // Always return at least one part with proper structure
      if (validParts.length === 0) {
        return this.createDefaultParts();
      }

      return validParts;
    } catch (error) {
      return this.createDefaultParts();
    }
  };

  // Helper method to create default parts structure
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
            name: "PHẦN THI MẶC DDINHJ",
            score: 0,
            time: this.state.time || 0,
            children: [
              {
                name: "PHẦN THI MẶC ĐỊNH",
                questions: [],
              },
            ],
          },
        ],
      },
    ];
  };

  // Unified method to normalize question format for both upload and manual sources
  normalizeQuestionFormat = (questionData, source = "manual") => {
    // Handle both direct question and wrapped question formats
    const baseQuestion = questionData.question || questionData;

    // Tạo ID nhất quán và đảm bảo _id và question_id giống nhau
    const questionId =
      baseQuestion._id ||
      baseQuestion.question_id ||
      baseQuestion.questionId ||
      `${source}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Tính STT thực tế cho câu hỏi upload
    let actualQuestionNo;
    if (baseQuestion.type === "CLUSTER" || baseQuestion.type === "cluster") {
      actualQuestionNo = 0; // Cluster questions có number = 0
    } else {
      // ✅ QUAN TRỌNG: Đối với upload, duy trì STT từ file nếu có
      if (
        source === "upload" &&
        (baseQuestion.question_no ||
          baseQuestion.questionNo ||
          baseQuestion.number)
      ) {
        actualQuestionNo =
          baseQuestion.question_no ||
          baseQuestion.questionNo ||
          baseQuestion.number;
      } else {
        // Tính STT mới cho manual hoặc khi không có STT từ file
        try {
          actualQuestionNo = this.getActualQuestionNumber(baseQuestion);
        } catch (error) {
          console.warn("Error calculating STT:", error);
          actualQuestionNo =
            baseQuestion?.number ||
            baseQuestion?.question_no ||
            this.getNextQuestionNumber();
        }
      }
    }

    const normalizedQuestion = {
      _id: questionId, // Sử dụng ID nhất quán
      question_id: questionId, // Đảm bảo question_id giống với _id
      question_no: actualQuestionNo, // Sử dụng STT thực tế
      number: actualQuestionNo, // Đồng bộ với question_no
      rawHtml:
        baseQuestion.rawHtml ||
        baseQuestion.content ||
        baseQuestion.question ||
        "",
      type: this.normalizeQuestionType(baseQuestion.type || "SINGLECHOICE"),
      choices: this.normalizeChoices(
        baseQuestion.choices || baseQuestion.options || []
      ),
      correctAnswers: this.normalizeCorrectAnswers(
        baseQuestion.correctAnswers || baseQuestion.answer || []
      ),
      explanation: baseQuestion.explanation || baseQuestion.explain || "",
      level: baseQuestion.level || baseQuestion.question_level || "",
      question_level: baseQuestion.level || baseQuestion.question_level || "",
      images: baseQuestion.images || [],
      doc_link: baseQuestion.doc_link || "",
      video_link: baseQuestion.video || baseQuestion.video_link || "",
      video: baseQuestion.video || baseQuestion.video_link || "",
      code: baseQuestion.code || `${actualQuestionNo}`, // Sử dụng STT thực tế cho code (không cần fallback)
      created_at: baseQuestion.created_at || new Date().toISOString(),
      __temp: baseQuestion.__temp || false,
      source: source,
      uploaded: source === "upload",
      dragDropOptions:
        baseQuestion.dragDropOptions || baseQuestion.drag_options || [],
      parentId: baseQuestion.parentId || null, // For cluster questions
    };

    // Special handling for cluster questions
    if (
      normalizedQuestion.type === "CLUSTER" ||
      normalizedQuestion.type === "cluster"
    ) {
      // Normalize childQuestions và set parentId đúng cách
      const childQuestions =
        baseQuestion.childQuestions || baseQuestion.clusterQuestions || [];
      normalizedQuestion.childQuestions = childQuestions.map((childQ) => {
        // Normalize child question
        const normalizedChild = this.normalizeQuestionFormat(
          {
            ...childQ,
            parentId: questionId, // ✅ QUAN TRỌNG: Set parentId = cluster's _id
          },
          source
        );

        // Đảm bảo parentId là string để match
        normalizedChild.parentId = String(questionId);

        return normalizedChild;
      });

      // Giữ lại clusterQuestions cho compatibility
      normalizedQuestion.clusterQuestions = normalizedQuestion.childQuestions;
    }

    return normalizedQuestion;
  };

  // Helper method to normalize question type
  normalizeQuestionType = (type) => {
    if (!type) return "SINGLECHOICE";

    const typeStr = String(type).toUpperCase();
    const typeMapping = {
      SINGLECHOICE: "SINGLECHOICE",
      TRUEFALSEMULTI: "TRUEFALSEMULTI",
      FILLINBLANK: "FILLINBLANK",
      DRAGDROP: "DRAGDROP",
      MULTIPLECHOICE: "MULTIPLECHOICE",
      TRUEFALSE: "TRUEFALSE",
      CLUSTER: "CLUSTER",
    };

    return typeMapping[typeStr] || "SINGLECHOICE";
  };

  // Helper method to normalize choices
  normalizeChoices = (choices) => {
    if (!Array.isArray(choices)) return [];

    return choices.map((choice) => {
      if (typeof choice === "string") {
        return { label: choice, text: choice };
      }
      return {
        label: choice.label || choice.key || choice.id || "",
        text: choice.text || choice.value || choice.content || String(choice),
      };
    });
  };

  // Helper method to normalize correct answers
  normalizeCorrectAnswers = (answers) => {
    if (!answers) return [];
    if (!Array.isArray(answers)) {
      return [{ value: String(answers) }];
    }

    return answers.map((answer) => {
      if (typeof answer === "string") {
        return { value: answer };
      }
      return {
        label: answer.label || answer.key || answer.id || "",
        value: answer.value || answer.text || answer.label || String(answer),
      };
    });
  };

  // Helper method to process questions for API format
  processQuestionsForAPI = (questions) => {
    if (!Array.isArray(questions)) {
      return [];
    }

    return questions
      .filter((q) => q && (q._id || q.question_id)) // Only valid questions
      .map((q) => this.convertQuestionToAPIFormat(q));
  };

  // Helper method to create a safe default question
  createDefaultQuestion = (questionData = {}) => {
    // Tính STT thực tế thay vì hardcode
    let actualQuestionNo = this.getNextQuestionNumber();

    if (questionData?.question_no) {
      actualQuestionNo = questionData.question_no;
    } else if (questionData?.questionNo) {
      actualQuestionNo = questionData.questionNo;
    } else if (questionData?.number) {
      actualQuestionNo = questionData.number;
    } else {
      // Tính STT tiếp theo
      try {
        actualQuestionNo = this.getNextQuestionNumber();
      } catch (error) {
        console.warn("Error getting next question number:", error);
        try {
          const totalQuestions = this.getTotalQuestionsCount();
          actualQuestionNo = totalQuestions + 1;
        } catch (error) {
          console.warn("Error getting total questions count:", error);
          actualQuestionNo = 0;
        }
      }
    }

    return {
      question_id: `default-${Date.now()}`,
      question_no: actualQuestionNo, // Sử dụng STT thực tế
      number: actualQuestionNo, // Đồng bộ với question_no
      rawHtml: "Câu hỏi mặc định",
      type: " ",
      choices: [],
      correctAnswers: [],
      explanation: "",
      level: "",
      question_level: "",
      images: [],
      parentId: null,
    };
  };

  // Method đếm tổng số câu hỏi hiện tại
  getTotalQuestionsCount = () => {
    const { tabData } = this.state;

    if (!tabData || !Array.isArray(tabData)) {
      return 0;
    }

    let totalCount = 0;

    tabData.forEach((tab) => {
      // Đếm questions chính
      if (tab.questions && Array.isArray(tab.questions)) {
        totalCount += tab.questions.filter(
          (q) =>
            q.type !== "cluster" && q.type !== "CLUSTER" && q.type !== "Cluster"
        ).length;
      }

      // Đếm questions trong subSections
      if (tab.subSections && Array.isArray(tab.subSections)) {
        tab.subSections.forEach((subSection) => {
          if (subSection.questions && Array.isArray(subSection.questions)) {
            totalCount += subSection.questions.filter(
              (q) =>
                q.type !== "cluster" &&
                q.type !== "CLUSTER" &&
                q.type !== "Cluster"
            ).length;
          }
        });
      }

      // Đếm questions trong childExam
      if (tab.childExam && Array.isArray(tab.childExam)) {
        tab.childExam.forEach((child) => {
          if (child.questions && Array.isArray(child.questions)) {
            totalCount += child.questions.filter(
              (q) =>
                q.type !== "cluster" &&
                q.type !== "CLUSTER" &&
                q.type !== "Cluster"
            ).length;
          }
        });
      }

      // Đếm questions trong groupTopic
      if (tab.groupTopic && Array.isArray(tab.groupTopic)) {
        tab.groupTopic.forEach((group) => {
          if (group.subjects && Array.isArray(group.subjects)) {
            group.subjects.forEach((subject) => {
              if (subject.questions && Array.isArray(subject.questions)) {
                totalCount += subject.questions.filter(
                  (q) =>
                    q.type !== "cluster" &&
                    q.type !== "CLUSTER" &&
                    q.type !== "Cluster"
                ).length;
              }
            });
          }
        });
      }
    });

    return totalCount;
  };

  // ============================================
  // DEPRECATED METHODS - Kept for backward compatibility
  // These methods are no longer used with QuestionNumberingService
  // ============================================

  /**
   * @deprecated Use QuestionNumberingService.getUnifiedStartingNumber() instead
   * Method để lấy số thứ tự bắt đầu cho từng phần thi riêng biệt
   */
  getStartingQuestionNumberForSection = (
    sectionId = null,
    subSectionId = null
  ) => {
    try {
      const targetSectionId = sectionId || this.state.selectedSectionId;

      if (!targetSectionId) {
        return 1;
      }

      const currentTab = this.state.tabData?.find(
        (tab) => tab._id === targetSectionId
      );

      if (!currentTab) {
        return 1;
      }

      // Xử lý subSection trước (ưu tiên cao nhất)
      if (subSectionId) {
        // Tìm trong childExam trước
        if (currentTab.childExam && Array.isArray(currentTab.childExam)) {
          const childExam = currentTab.childExam.find(
            (child) => String(child.idChildExam) === String(subSectionId)
          );

          if (
            childExam &&
            childExam.questions &&
            childExam.questions.length > 0
          ) {
            const firstRegularQuestion = childExam.questions.find(
              (q) =>
                q.type !== "cluster" &&
                q.type !== "Cluster" &&
                q.type !== "CLUSTER" &&
                !q.parentId &&
                (q.number > 0 || q.question_no > 0)
            );

            if (firstRegularQuestion) {
              const startNumber =
                firstRegularQuestion.number ||
                firstRegularQuestion.question_no ||
                1;
              return startNumber;
            }
          }
        }

        // Fallback: tìm trong subSections
        if (currentTab.subSections && Array.isArray(currentTab.subSections)) {
          const subSection = currentTab.subSections.find(
            (sub) => String(sub.id) === String(subSectionId)
          );

          if (
            subSection &&
            subSection.questions &&
            subSection.questions.length > 0
          ) {
            const firstRegularQuestion = subSection.questions.find(
              (q) =>
                q.type !== "cluster" &&
                q.type !== "Cluster" &&
                q.type !== "CLUSTER" &&
                !q.parentId &&
                (q.number > 0 || q.question_no > 0)
            );

            if (firstRegularQuestion) {
              const startNumber =
                firstRegularQuestion.number ||
                firstRegularQuestion.question_no ||
                1;
              return startNumber;
            }
          }
        }
      }

      // Xử lý NHOM_CHU_DE - sử dụng getSubjectStartingNumber cho từng môn riêng
      if (currentTab.exam_section_type === "NHOM_CHU_DE") {
        const groupIdx =
          Object.keys(this.state.selectedGroupSubject || {})[0] || 0;
        const subjectIdx = this.state.selectedGroupSubject?.[groupIdx] || 0;

        const startNumber = this.getSubjectStartingNumber(groupIdx, subjectIdx);
        return startNumber;
      }

      // Xử lý MAC_DINH section - lấy từ câu hỏi đầu tiên có STT
      if (
        currentTab.questions &&
        Array.isArray(currentTab.questions) &&
        currentTab.questions.length > 0
      ) {
        const firstRegularQuestion = currentTab.questions.find(
          (q) =>
            q.type !== "cluster" &&
            q.type !== "Cluster" &&
            q.type !== "CLUSTER" &&
            !q.parentId &&
            (q.number > 0 || q.question_no > 0)
        );

        if (firstRegularQuestion) {
          const startNumber =
            firstRegularQuestion.number ||
            firstRegularQuestion.question_no ||
            1;
          return startNumber;
        }
      }

      // Xử lý các subfections trong section - lấy từ câu hỏi đầu tiên
      if (currentTab.subSections && Array.isArray(currentTab.subSections)) {
        let minStartNumber = Number.MAX_SAFE_INTEGER;
        let foundValidNumber = false;

        currentTab.subSections.forEach((subSection) => {
          if (subSection.questions && Array.isArray(subSection.questions)) {
            const firstRegularQuestion = subSection.questions.find(
              (q) =>
                q.type !== "cluster" &&
                q.type !== "Cluster" &&
                q.type !== "CLUSTER" &&
                !q.parentId &&
                (q.number > 0 || q.question_no > 0)
            );

            if (firstRegularQuestion) {
              const startNumber =
                firstRegularQuestion.number ||
                firstRegularQuestion.question_no ||
                1;
              if (startNumber < minStartNumber) {
                minStartNumber = startNumber;
                foundValidNumber = true;
              }
            }
          }
        });

        if (foundValidNumber) {
          return minStartNumber;
        }
      }

      // Xử lý childExam - lấy từ câu hỏi đầu tiên
      if (currentTab.childExam && Array.isArray(currentTab.childExam)) {
        let minStartNumber = Number.MAX_SAFE_INTEGER;
        let foundValidNumber = false;

        currentTab.childExam.forEach((child) => {
          if (child.questions && Array.isArray(child.questions)) {
            const firstRegularQuestion = child.questions.find(
              (q) =>
                q.type !== "cluster" &&
                q.type !== "Cluster" &&
                q.type !== "CLUSTER" &&
                !q.parentId &&
                (q.number > 0 || q.question_no > 0)
            );

            if (firstRegularQuestion) {
              const startNumber =
                firstRegularQuestion.number ||
                firstRegularQuestion.question_no ||
                1;
              if (startNumber < minStartNumber) {
                minStartNumber = startNumber;
                foundValidNumber = true;
              }
            }
          }
        });

        if (foundValidNumber) {
          return minStartNumber;
        }
      }
      return 1;
    } catch (error) {
      console.error("❌ Error getting starting question number:", error);
      return 1;
    }
  };

  /**
   * @deprecated Use QuestionNumberingService.getUnifiedStartingNumber() instead
   * getStartingQuestionNumber trả về OFFSET (base number - 1)
   */
  getStartingQuestionNumber = () => {
    const actualStart = this.getStartingQuestionNumberForSection(
      this.state.selectedSectionId,
      this.state.currentSubSectionId
    );
    // ✅ Trả về offset = actualStart - 1
    return actualStart > 0 ? actualStart - 1 : 0;
  };

  // Cập nhật getNextQuestionNumber để respect starting number từ API
  getNextQuestionNumber = () => {
    try {
      const currentTab = this.state.tabData?.find(
        (tab) => tab._id === this.state.selectedSectionId
      );
      if (!currentTab) {
        return 1;
      }

      const startingNumber = this.getStartingQuestionNumberForSection(
        this.state.selectedSectionId,
        this.state.currentSubSectionId
      );

      // Phân biệt logic theo loại section
      if (currentTab.exam_section_type === "NHOM_CHU_DE") {
        const selectedSubjectIdx = this.state.selectedGroupSubject?.[0] ?? 0;
        if (
          currentTab.groupTopic &&
          currentTab.groupTopic[0] &&
          currentTab.groupTopic[0].subjects[selectedSubjectIdx]
        ) {
          const questions =
            currentTab.groupTopic[0].subjects[selectedSubjectIdx].questions ||
            [];

          // ✅ FIX: Đếm chỉ regular questions và child questions (không tính cluster)
          let questionCount = 0;
          questions.forEach((q) => {
            const isCluster =
              q.type === "cluster" ||
              q.type === "Cluster" ||
              q.type === "CLUSTER";

            if (!isCluster) {
              // ✅ Đếm cả regular questions và child questions
              questionCount++;
            }
          });

          // ✅ FIX: NHOM_CHU_DE luôn bắt đầu từ 1 cho mỗi subject
          const nextNumber = questionCount + 1;
          return nextNumber;
        }
      }

      // ✅ FIX: Section có sub-sections hoặc currentSubSectionId
      if (this.state.currentSubSectionId) {
        let questionCount = 0;

        // Tìm trong childExam trước
        if (currentTab.childExam && Array.isArray(currentTab.childExam)) {
          const childExam = currentTab.childExam.find(
            (child) =>
              String(child.idChildExam) ===
              String(this.state.currentSubSectionId)
          );

          if (childExam && Array.isArray(childExam.questions)) {
            childExam.questions.forEach((q) => {
              const isCluster =
                q.type === "cluster" ||
                q.type === "Cluster" ||
                q.type === "CLUSTER";
              const isChild = !!q.parentId;

              // Đếm cả regular questions và child questions
              if (!isCluster) {
                questionCount++;
              }
            });
          }
        }

        // Fallback: tìm trong subSections
        if (
          questionCount === 0 &&
          currentTab.subSections &&
          Array.isArray(currentTab.subSections)
        ) {
          const subSection = currentTab.subSections.find(
            (sub) => String(sub.id) === String(this.state.currentSubSectionId)
          );

          if (subSection && Array.isArray(subSection.questions)) {
            subSection.questions.forEach((q) => {
              const isCluster =
                q.type === "cluster" ||
                q.type === "Cluster" ||
                q.type === "CLUSTER";
              const isChild = !!q.parentId;

              // Đếm cả regular questions và child questions
              if (!isCluster) {
                questionCount++;
              }
            });
          }
        }

        const nextNumber = startingNumber + questionCount;
        return nextNumber;
      }

      // ✅ FIX: Section có nhiều sub-sections - tính across all subsections
      if (currentTab.subSections && currentTab.subSections.length > 0) {
        let questionCount = 0;

        currentTab.subSections.forEach((subSection) => {
          if (Array.isArray(subSection.questions)) {
            subSection.questions.forEach((q) => {
              const isCluster =
                q.type === "cluster" ||
                q.type === "Cluster" ||
                q.type === "CLUSTER";
              const isChild = !!q.parentId;

              // Đếm cả regular questions và child questions
              if (!isCluster) {
                questionCount++;
              }
            });
          }
        });

        const nextNumber = startingNumber + questionCount;
        return nextNumber;
      }

      // ✅ FIX: Section thường (MAC_DINH)
      const questions = currentTab.questions || [];
      let questionCount = 0;

      questions.forEach((question) => {
        const isCluster =
          question.type === "cluster" ||
          question.type === "Cluster" ||
          question.type === "CLUSTER";
        const isChild = !!question.parentId;

        // Đếm cả regular questions và child questions
        if (!isCluster) {
          questionCount++;
        }
      });

      const nextNumber = startingNumber + questionCount;
      return nextNumber;
    } catch (error) {
      console.error("❌ ExamCreate - Error in getNextQuestionNumber:", error);
      return 1;
    }
  };

  // Method tính STT bắt đầu cho nhóm chủ đề hiện tại
  getTopicGroupStartingNumber = () => {
    return 1; // Luôn trả về 1 cho mỗi phần thi
  };

  // ✅ IMPROVED: Helper method để đảm bảo STT consistency khi thêm question
  ensureQuestionNumberConsistency = (questionsArray, newQuestion) => {
    if (!Array.isArray(questionsArray)) return questionsArray;

    // ✅ BƯỚC 1: Tạo bản sao và LUÔN thêm question mới vào CUỐI array
    let questions = [...questionsArray];

    // Luôn thêm câu hỏi mới vào cuối, bất kể loại (regular, cluster, hay child)
    questions.push(newQuestion);

    // ✅ BƯỚC 2: Re-number toàn bộ questions theo thứ tự mới
    const startingNumber = this.getStartingQuestionNumberForSection(
      this.state.selectedSectionId,
      this.state.currentSubSectionId
    );

    let currentSTT = startingNumber;

    questions.forEach((question) => {
      const isCluster =
        question.type === "cluster" ||
        question.type === "Cluster" ||
        question.type === "CLUSTER";

      if (isCluster) {
        // Cluster questions không có STT
        question.number = 0;
        question.question_no = 0;
      } else {
        // Regular questions và child questions có STT liên tục
        question.number = currentSTT;
        question.question_no = currentSTT;
        currentSTT++;
      }
    });

    return questions;
  };

  // Method tính STT bắt đầu cho từng section dựa trên vị trí global
  getGlobalQuestionStartNumber = (sectionIndex, subSectionIndex = null) => {
    let startNumber = 1;

    // Tính tổng số câu hỏi từ các section trước đó
    for (let i = 0; i < sectionIndex; i++) {
      const prevSection = this.state.sections?.[i];
      if (prevSection) {
        if (prevSection.subSections && prevSection.subSections.length > 0) {
          prevSection.subSections.forEach((subSec) => {
            const questionCount = (subSec.questions || []).filter(
              (q) =>
                q.type !== "cluster" &&
                q.type !== "CLUSTER" &&
                q.type !== "Cluster"
            ).length;
            startNumber += questionCount;
          });
        } else {
          const questionCount = (prevSection.questions || []).filter(
            (q) =>
              q.type !== "cluster" &&
              q.type !== "CLUSTER" &&
              q.type !== "Cluster"
          ).length;
          startNumber += questionCount;
        }
      }
    }

    // Nếu có subSectionIndex, tính thêm các subsection trước đó trong cùng section
    if (subSectionIndex !== null && subSectionIndex > 0) {
      const currentSection = this.state.sections?.[sectionIndex];
      if (currentSection && currentSection.subSections) {
        for (let j = 0; j < subSectionIndex; j++) {
          const subSec = currentSection.subSections[j];
          if (subSec) {
            const questionCount = (subSec.questions || []).filter(
              (q) =>
                q.type !== "cluster" &&
                q.type !== "CLUSTER" &&
                q.type !== "Cluster"
            ).length;
            startNumber += questionCount;
          }
        }
      }
    }
    return startNumber;
  };

  // Save handler for the "Lưu" button: create or update an exam-word

  // Method mới: Convert tabData sang format API (match với mẫu curl request)
  convertTabDataToUploadFormat = () => {
    let tabData = this.state.tabData || [];

    if (tabData.length === 0) {
      // Tạo part mặc định với format API
      return [
        {
          name: "Phần mặc định",
          type: "MAC_DINH",
          totalquestions: 0,
          subpart: [
            {
              name: "1.1 Phần mặc định",
              children: [
                {
                  name: "Children 1",
                  questions: [],
                },
              ],
            },
          ],
        },
      ];
    }

    // Convert từng tab thành format API
    const uploadParts = tabData.map((tab, idx) => {
      const partName = tab.exam_section_name || `Phần ${idx + 1}`;

      // Tính tổng số câu hỏi trong part này (bao gồm cả câu hỏi chùm)
      let totalQuestions = 0;
      if (tab.exam_section_type === "GROUP_SUBJECT") {
        (tab.exam_section_group || []).forEach((group) => {
          (group.subjects || []).forEach((subject) => {
            totalQuestions += (subject.questions || []).length; // Include all questions including clusters
          });
        });
      } else {
        totalQuestions = (tab.questions || []).length;
      }

      const uploadPart = {
        name: partName, // ✅ String thay vì array
        type: "MAC_DINH", // ✅ Thêm type
        totalquestions: totalQuestions, // ✅ Thêm totalquestions
        subpart: [],
      };

      if (tab.exam_section_type === "GROUP_SUBJECT") {
        // Handle GROUP_SUBJECT sections
        (tab.exam_section_group || []).forEach((group, j) => {
          const subpart = {
            name: `${idx + 1}.${j + 1} ${group.name || group.group_name || `Nhóm ${j + 1}`
              }`, // ✅ Format name đúng
            children: [],
          };

          // Add children for each subject
          (group.subjects || []).forEach((subject, k) => {
            const subjectQuestions = subject.questions || [];

            subpart.children.push({
              name: `Children ${k + 1}`, // ✅ Format name đúng
              questions: subjectQuestions.map((q) => {
                const converted = this.convertQuestionToAPIFormat(q);

                return converted;
              }),
            });
          });

          // Đảm bảo có ít nhất 1 child
          if (subpart.children.length === 0) {
            subpart.children.push({
              name: "Children 1",
              questions: [],
            });
          }

          uploadPart.subpart.push(subpart);
        });
      } else {
        // Handle MAC_DINH sections - including sub-sections
        const sectionQuestions = tab.questions || [];

        // Check if this section has sub-sections
        if (tab.subSections && tab.subSections.length > 0) {
          // Filter sub-sections that have questions
          const validSubSections = tab.subSections.filter(
            (subSection) =>
              subSection.questions && subSection.questions.length > 0
          );

          if (validSubSections.length > 0) {
            // Create subparts for each valid sub-section
            uploadPart.subpart = validSubSections.map(
              (subSection, subIndex) => ({
                name: `${subSection.name}`,
                children: [
                  {
                    name: "Children 1",
                    questions: (subSection.questions || []).map((q) => {
                      const converted = this.convertQuestionToAPIFormat(q);
                      return converted;
                    }),
                  },
                ],
              })
            );
          } else {
            // No valid sub-sections, use main section questions
            uploadPart.subpart = [
              {
                name: `${partName}`,
                children: [
                  {
                    name: "Children 1",
                    questions: sectionQuestions.map((q) => {
                      const converted = this.convertQuestionToAPIFormat(q);
                      return converted;
                    }),
                  },
                ],
              },
            ];
          }
        } else {
          // No sub-sections, use original logic
          uploadPart.subpart = [
            {
              name: `${partName}`,
              children: [
                {
                  name: "Children 1",
                  questions: sectionQuestions.map((q) => {
                    const converted = this.convertQuestionToAPIFormat(q);
                    return converted;
                  }),
                },
              ],
            },
          ];
        }
      }

      // Đảm bảo có ít nhất 1 subpart
      if (uploadPart.subpart.length === 0) {
        uploadPart.subpart.push({
          name: `${partName}`,
          children: [
            {
              name: "Children 1",
              questions: [],
            },
          ],
        });
      }

      return uploadPart;
    });

    return uploadParts;
  };

  // Method mới: Lấy starting number riêng cho từng môn học trong NHOM_CHU_DE
  getSubjectStartingNumber = (groupIdx, subjectIdx) => {
    try {
      const currentTab = this.state.tabData?.find(
        (tab) => tab._id === this.state.selectedSectionId
      );

      if (
        !currentTab ||
        currentTab.exam_section_type !== "NHOM_CHU_DE" ||
        !currentTab.groupTopic?.[groupIdx]?.subjects?.[subjectIdx]
      ) {
        return 1;
      }

      const subject = currentTab.groupTopic[groupIdx].subjects[subjectIdx];

      if (!subject.questions || subject.questions.length === 0) {
        return 1;
      }

      // Tìm câu hỏi đầu tiên có STT trong subject này (không phải cluster)
      const firstQuestionWithNumber = subject.questions.find(
        (q) =>
          q.type !== "cluster" &&
          q.type !== "CLUSTER" &&
          q.type !== "Cluster" &&
          (q.number > 0 || q.question_no > 0)
      );

      if (firstQuestionWithNumber) {
        const startingNumber =
          firstQuestionWithNumber.number ||
          firstQuestionWithNumber.question_no ||
          1;
        return startingNumber;
      }

      return 1;
    } catch (error) {
      console.error("❌ Error getting subject starting number:", error);
      return 1;
    }
  };

  // Method mới: Tính STT riêng cho NHOM_CHU_DE theo từng môn học
  getGroupTopicQuestionNumber = (targetQuestion) => {
    try {
      const { selectedSectionId, selectedGroupSubject, tabData } = this.state;

      if (!selectedSectionId || !selectedGroupSubject) {
        return 1;
      }

      const currentTab = tabData?.find((tab) => tab._id === selectedSectionId);
      if (!currentTab || currentTab.exam_section_type !== "NHOM_CHU_DE") {
        return 1;
      }

      // Lấy groupIdx và subjectIdx từ selectedGroupSubject đúng cách
      const groupIdx = Object.keys(selectedGroupSubject)[0] || 0;
      const subjectIdx = selectedGroupSubject[groupIdx] || 0;

      const group = currentTab.groupTopic?.[groupIdx];
      const subject = group?.subjects?.[subjectIdx];

      if (!subject || !subject.questions) {
        return 1;
      }

      // Lấy starting number riêng cho môn học này (không phải từ section chung)
      let questionNumber = this.getSubjectStartingNumber(groupIdx, subjectIdx);

      // Duyệt qua questions trong subject hiện tại để tìm vị trí
      for (let i = 0; i < subject.questions.length; i++) {
        const q = subject.questions[i];

        // Skip cluster questions (không tính STT)
        if (
          q.type === "cluster" ||
          q.type === "CLUSTER" ||
          q.type === "Cluster"
        ) {
          continue;
        }

        // Kiểm tra xem có phải target question không
        if (
          q._id === targetQuestion._id ||
          q.questionId === targetQuestion.questionId ||
          q.question_id === targetQuestion.question_id ||
          (q.question && q.question._id === targetQuestion._id)
        ) {
          return questionNumber;
        }

        questionNumber++;
      }

      return questionNumber;
    } catch (error) {
      console.error("❌ Error in getGroupTopicQuestionNumber:", error);
      return 1;
    }
  };

  // Method mới: Tìm số thứ tự thực tế của câu hỏi theo thứ tự hiển thị trong UI
  getActualQuestionNumber = (targetQuestion) => {
    try {
      const { tabData, selectedSectionId } = this.state;

      if (!tabData || !Array.isArray(tabData) || tabData.length === 0) {
        return 1;
      }
      // Xử lý riêng cho NHOM_CHU_DE
      const currentTab = tabData.find((tab) => tab._id === selectedSectionId);
      if (currentTab && currentTab.exam_section_type === "NHOM_CHU_DE") {
        return this.getGroupTopicQuestionNumber(targetQuestion);
      }

      let globalQuestionNumber = 1; // STT bắt đầu từ 1
      let foundQuestion = false;

      // ✅ Duyệt qua tất cả tabs và tính STT tuần tự
      for (let tabIndex = 0; tabIndex < tabData.length; tabIndex++) {
        const tab = tabData[tabIndex];

        // ✅ 1. Xử lý questions chính của tab
        if (tab.questions && Array.isArray(tab.questions)) {
          for (let i = 0; i < tab.questions.length; i++) {
            const q = tab.questions[i];

            // Skip cluster questions (không tính STT)
            if (
              q.type === "cluster" ||
              q.type === "CLUSTER" ||
              q.type === "Cluster"
            ) {
              continue;
            }

            // Kiểm tra xem có phải target question không
            if (
              q._id === targetQuestion._id ||
              q.questionId === targetQuestion.questionId ||
              q.question_id === targetQuestion.question_id ||
              (q.question && q.question._id === targetQuestion._id)
            ) {
              return globalQuestionNumber;
            }

            globalQuestionNumber++;
          }
        }

        // ✅ 2. Xử lý subSections
        if (tab.subSections && Array.isArray(tab.subSections)) {
          for (
            let subIndex = 0;
            subIndex < tab.subSections.length;
            subIndex++
          ) {
            const subSection = tab.subSections[subIndex];
            if (subSection.questions && Array.isArray(subSection.questions)) {
              for (let i = 0; i < subSection.questions.length; i++) {
                const q = subSection.questions[i];

                // Skip cluster questions
                if (
                  q.type === "cluster" ||
                  q.type === "CLUSTER" ||
                  q.type === "Cluster"
                ) {
                  continue;
                }

                if (
                  q._id === targetQuestion._id ||
                  q.questionId === targetQuestion.questionId ||
                  q.question_id === targetQuestion.question_id ||
                  (q.question && q.question._id === targetQuestion._id)
                ) {
                  return globalQuestionNumber;
                }

                globalQuestionNumber++;
              }
            }
          }
        }

        // ✅ 3. Xử lý childExam
        if (tab.childExam && Array.isArray(tab.childExam)) {
          for (
            let childIndex = 0;
            childIndex < tab.childExam.length;
            childIndex++
          ) {
            const child = tab.childExam[childIndex];
            if (child.questions && Array.isArray(child.questions)) {
              for (let i = 0; i < child.questions.length; i++) {
                const q = child.questions[i];

                // Skip cluster questions
                if (
                  q.type === "cluster" ||
                  q.type === "CLUSTER" ||
                  q.type === "Cluster"
                ) {
                  continue;
                }

                if (
                  q._id === targetQuestion._id ||
                  q.questionId === targetQuestion.questionId ||
                  q.question_id === targetQuestion.question_id ||
                  (q.question && q.question._id === targetQuestion._id)
                ) {
                  return globalQuestionNumber;
                }

                globalQuestionNumber++;
              }
            }
          }
        }

        // ✅ 4. Xử lý groupTopic
        if (tab.groupTopic && Array.isArray(tab.groupTopic)) {
          for (
            let groupIndex = 0;
            groupIndex < tab.groupTopic.length;
            groupIndex++
          ) {
            const group = tab.groupTopic[groupIndex];

            if (group.subjects && Array.isArray(group.subjects)) {
              for (
                let subjectIndex = 0;
                subjectIndex < group.subjects.length;
                subjectIndex++
              ) {
                const subject = group.subjects[subjectIndex];

                if (subject.questions && Array.isArray(subject.questions)) {
                  for (let i = 0; i < subject.questions.length; i++) {
                    const q = subject.questions[i];

                    // Skip cluster questions
                    if (
                      q.type === "cluster" ||
                      q.type === "CLUSTER" ||
                      q.type === "Cluster"
                    ) {
                      continue;
                    }

                    if (
                      q._id === targetQuestion._id ||
                      q.questionId === targetQuestion.questionId ||
                      q.question_id === targetQuestion.question_id ||
                      (q.question && q.question._id === targetQuestion._id)
                    ) {
                      return globalQuestionNumber;
                    }

                    globalQuestionNumber++;
                  }
                }
              }
            }
          }
        }
      }

      // Sử dụng existing number nếu hợp lý, nếu không thì dùng globalQuestionNumber
      const existingNumber =
        targetQuestion.number ||
        targetQuestion.question_no ||
        targetQuestion.questionNo;
      if (
        existingNumber &&
        existingNumber > 0 &&
        existingNumber < globalQuestionNumber
      ) {
        return existingNumber;
      }

      return globalQuestionNumber;
    } catch (error) {
      console.error("❌ Error finding actual question number:", error);
      return (
        targetQuestion.number ||
        targetQuestion.question_no ||
        targetQuestion.questionNo ||
        this.getNextQuestionNumber()
      );
    }
  };

  // Method mới: Convert question sang format API (flexible type handling)
  convertQuestionToAPIFormat = (question) => {
    // Type mapping từ internal format sang API format (flexible)
    const typeMapping = {
      SINGLECHOICE: "singlechoice",
      TRUEFALSEMULTI: "truefalsemulti",
      FILLINBLANK: "fillinblank",
      DRAGDROP: "dragdrop",
      MULTIPLECHOICE: "multiplechoice",
      TRUEFALSE: "truefalse",
      CLUSTER: "cluster",
    };

    // Lấy type, nếu không map được thì giữ nguyên
    const originalType = question.type || " ";
    const apiType =
      typeMapping[originalType.toUpperCase()] || originalType.toLowerCase();

    // Chuẩn hóa choices cho API format (flexible)
    let apiChoices = [];
    let apiDragDropOptions = [];

    // Special handling for DRAGDROP
    if (apiType === "dragdrop") {
      // For DRAGDROP, use dragDropOptions instead of choices
      // Check multiple possible fields that might contain drag options
      if (
        question.dragDropOptions &&
        Array.isArray(question.dragDropOptions) &&
        question.dragDropOptions.length > 0
      ) {
        apiDragDropOptions = question.dragDropOptions.filter(
          (opt) => opt && String(opt).trim()
        );
      } else if (
        question.drag_options &&
        Array.isArray(question.drag_options) &&
        question.drag_options.length > 0
      ) {
        apiDragDropOptions = question.drag_options.filter(
          (opt) => opt && String(opt).trim()
        );
      } else if (
        question.options &&
        Array.isArray(question.options) &&
        question.options.length > 0
      ) {
        apiDragDropOptions = question.options.filter(
          (opt) => opt && String(opt).trim()
        );
      } else if (
        question.choices &&
        Array.isArray(question.choices) &&
        question.choices.length > 0
      ) {
        // Fallback: extract text from choices
        apiDragDropOptions = question.choices
          .map((choice) => {
            if (typeof choice === "string") return choice.trim();
            if (choice && typeof choice === "object") {
              return (
                choice.text || choice.label || choice.value || String(choice)
              );
            }
            return String(choice);
          })
          .filter((opt) => opt && opt.trim());
      }

      // ✅ FIX: Thêm fallback từ correctAnswers nếu apiDragDropOptions vẫn trống
      if (apiDragDropOptions.length === 0) {
        if (
          question.correctAnswers &&
          Array.isArray(question.correctAnswers) &&
          question.correctAnswers.length > 0
        ) {
          apiDragDropOptions = question.correctAnswers
            .map((ans) => {
              if (typeof ans === "object" && ans !== null) {
                return ans.value || ans.text || ans.key || String(ans);
              }
              return String(ans);
            })
            .filter((opt) => opt && opt.trim());
        } else if (
          question.answer &&
          Array.isArray(question.answer) &&
          question.answer.length > 0
        ) {
          apiDragDropOptions = question.answer
            .map((ans) => {
              if (typeof ans === "object" && ans !== null) {
                return ans.key || ans.value || String(ans);
              }
              return String(ans);
            })
            .filter((opt) => opt && opt.trim());
        }
      }

      // For DRAGDROP, choices should be empty
      apiChoices = [];
    } else {
      // Normal handling for other question types
      if (question.choices && Array.isArray(question.choices)) {
        apiChoices = question.choices.map((choice) => {
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
    }

    // Chuẩn hóa correctAnswers cho API format (flexible)
    let apiCorrectAnswers = [];
    if (question.correctAnswers || question.answer) {
      const answers = question.correctAnswers || question.answer || [];

      if (Array.isArray(answers)) {
        apiCorrectAnswers = answers.map((ans) => {
          if (typeof ans === "string") {
            // String answer - convert based on type
            if (apiType === "fillinblank" || apiType === "multiplechoice") {
              return { value: ans };
            } else {
              return { label: ans, value: ans };
            }
          } else if (ans && typeof ans === "object") {
            // Object answer - keep structure but ensure required fields
            const extractedValue =
              ans.value || ans.text || ans.label || ans.key || ans.id;
            if (extractedValue) {
              return {
                label: ans.label || ans.key || ans.id,
                value: extractedValue,
              };
            } else {
              // Fallback: try to extract meaningful value from object
              const safeValue = this.safeExtractValue
                ? this.safeExtractValue(ans)
                : String(ans);
              return { value: safeValue };
            }
          }
          return ans; // Fallback: keep as is
        });
      } else {
        // Single answer
        if (typeof answers === "string") {
          apiCorrectAnswers = [{ value: answers }];
        } else {
          apiCorrectAnswers = [answers];
        }
      }
    }

    // Special handling for DRAGDROP correctAnswers
    if (apiType === "dragdrop") {
      // For DRAGDROP, ensure correctAnswers has proper format
      if (apiCorrectAnswers.length === 0 && question.correctAnswers) {
        // Try to extract from correctAnswers if it's not processed correctly
        const rawAnswers = question.correctAnswers;
        if (Array.isArray(rawAnswers)) {
          apiCorrectAnswers = rawAnswers
            .map((ans) => {
              if (typeof ans === "string") {
                return { value: ans };
              } else if (ans && typeof ans === "object" && ans.value) {
                return { value: ans.value };
              } else if (ans && typeof ans === "object") {
                // Use safe extraction instead of String(ans)
                const extractedValue =
                  ans.value ||
                  ans.text ||
                  ans.label ||
                  ans.key ||
                  ans.id ||
                  ans.rawHtml;
                if (extractedValue) {
                  return { value: extractedValue };
                } else {
                  // Try to extract from nested object or stringify safely
                  try {
                    const keys = [
                      "value",
                      "text",
                      "label",
                      "answer",
                      "key",
                      "id",
                      "rawHtml",
                      "content",
                      "name",
                    ];
                    for (const key of keys) {
                      if (key in ans && ans[key] != null) {
                        if (typeof ans[key] === "string")
                          return { value: ans[key].trim() };
                        if (typeof ans[key] === "number")
                          return { value: String(ans[key]) };
                        if (typeof ans[key] === "boolean")
                          return { value: String(ans[key]) };
                      }
                    }
                    // Last resort: avoid "[object Object]"
                    return { value: "" };
                  } catch (e) {
                    return { value: "" };
                  }
                }
              }
              return { value: String(ans) };
            })
            .filter((item) => item.value !== ""); // Remove empty values
        }
      }
    }

    // Sử dụng _id làm questionId chính để đảm bảo nhất quán
    const questionId =
      question._id || question.question_id || `temp-${Date.now()}`;

    // Return format API (robust)
    const result = {
      isTestQuestion: question.isTestQuestion || false,
      question: {
        questionId: questionId, // Sử dụng ID nhất quán
        rawHtml:
          question.rawHtml || question.content || question.question || "",
        type: apiType,
        choices: apiChoices,
        correctAnswers: apiCorrectAnswers,
        explanation: question.explanation || "",
        level: question.level || question.question_level || "",
        images: question.images || [],
        video: question.video || question.video_link || "",
        parentId: question.parentId || null, // ✅ Đảm bảo parentId được preserve
      },
      number: (() => {
        // CLUSTER questions luôn có number = 0
        if (apiType === "cluster" || originalType.toUpperCase() === "CLUSTER") {
          return 0;
        }

        // ✅ SỬA CHÍNH: Ưu tiên lấy STT từ UI, xử lý riêng NHOM_CHU_DE
        let numberToSave;

        // Thứ tự ưu tiên: question.number > question.question_no > question.questionNo
        if (
          question.number &&
          question.number > 0 &&
          question.number !== 123456789
        ) {
          numberToSave = question.number;
        } else if (question.question_no && question.question_no > 0) {
          numberToSave = question.question_no;
        } else if (question.questionNo && question.questionNo > 0) {
          numberToSave = question.questionNo;
        } else {
          // Tính toán theo context (NHOM_CHU_DE vs MAC_DINH)
          try {
            const { selectedSectionId, tabData } = this.state;
            const currentTab = tabData?.find(
              (tab) => tab._id === selectedSectionId
            );

            if (currentTab && currentTab.exam_section_type === "NHOM_CHU_DE") {
              numberToSave = this.getGroupTopicQuestionNumber(question);
            } else {
              numberToSave = this.getActualQuestionNumber(question);
            }
          } catch (error) {
            console.warn("❌ Error calculating STT:", error);
            numberToSave = this.getNextQuestionNumber();
          }
        }

        // Đảm bảo là số nguyên dương
        numberToSave = Math.max(1, Math.floor(Number(numberToSave) || 1));

        return numberToSave;
      })(),
    };

    // Add dragDropOptions for DRAGDROP type
    if (apiType === "dragdrop") {
      result.question.dragDropOptions = apiDragDropOptions;
    }

    // Xử lý đặc biệt cho CLUSTER questions
    if (apiType === "cluster") {
      // Thêm clusterQuestions nếu có
      if (
        question.clusterQuestions &&
        Array.isArray(question.clusterQuestions)
      ) {
        result.question.clusterQuestions = question.clusterQuestions.map(
          (childQ) => ({
            question: childQ.question || childQ.rawHtml || "",
            selectedAnswers:
              childQ.selectedAnswers || childQ.correctAnswers || [],
            type: childQ.type || "singlechoice",
          })
        );
      } else if (
        question.childQuestions &&
        Array.isArray(question.childQuestions)
      ) {
        // Fallback: sử dụng childQuestions từ state
        result.question.clusterQuestions = question.childQuestions.map(
          (childQ) => ({
            question: childQ.question || childQ.rawHtml || "",
            selectedAnswers:
              childQ.selectedAnswers || childQ.correctAnswers || [],
            type: childQ.type || "singlechoice",
          })
        );
      }
    }
    return result;
  };

  // Method helper: Convert upload parts sang API format
  convertUploadPartsToAPIFormat = (uploadParts) => {
    return uploadParts.map((part, idx) => {
      // Tính totalquestions
      let totalQuestions = 0;
      if (part.subpart) {
        part.subpart.forEach((subpart) => {
          if (subpart.children) {
            subpart.children.forEach((child) => {
              totalQuestions += (child.questions || []).length; // Include all questions including clusters
            });
          }
        });
      }

      return {
        name: part.name || part.part_name || `Phần ${idx + 1}`,
        type: "MAC_DINH",
        totalquestions: totalQuestions,
        subpart: (part.subpart || []).map((subpart, subIdx) => ({
          name: `${subpart.subpart_name || subpart.name || "Phần con"}`,
          children: (subpart.children || []).map((child, childIdx) => ({
            name: `Children ${childIdx + 1}`,
            questions: (child.questions || []).map((q) => {
              // Nếu question đã có format API, giữ nguyên, nếu không thì convert
              if (q.question && q.question.questionId) {
                return q; // Đã đúng format API
              }
              return this.convertQuestionToAPIFormat(q.question || q);
            }),
          })),
        })),
      };
    });
  };

  async handleSave() {
    // Kiểm tra fastGiftStatus - nếu false thì hiện dialog xác nhận
    if (!this.state.fastGiftStatus) {
      return new Promise((resolve) => {
        Modal.confirm({
          title: "Cảnh báo",
          content: "Bạn chưa chọn quà tặng cho đề thi. Bạn có chắc chắn muốn tiếp tục không?",
          okText: "OK, không chọn",
          okType: "primary",
          cancelText: "Hủy",
          onOk: () => {
            // Nếu user xác nhận, tiếp tục với logic save
            this.proceedWithSave();
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
      return this.proceedWithSave();
    }
  }

  async proceedWithSave() {
    try {
      this.cleanupStateBeforeSave();
      await new Promise((resolve) => setTimeout(resolve, 100));
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
      const invalidGroupTopics = [];
      this.state.tabData.forEach((tab, tabIndex) => {
        if (tab.exam_section_type === "NHOM_CHU_DE" && tab.groupTopic) {
          tab.groupTopic.forEach((group, groupIdx) => {
            if (group.subjects && Array.isArray(group.subjects)) {
              // ✅ SỬA: Chỉ kiểm tra isTestQuestion khi có nhiều hơn 1 subject
              const subjectsCount = group.subjects.length;

              // Nếu chỉ có 1 subject thì bỏ qua validation isTestQuestion
              if (subjectsCount <= 1) {
                return; // Không cần kiểm tra isTestQuestion
              }

              // Nếu có nhiều hơn 1 subject thì phải có ít nhất 1 câu hỏi thử nghiệm trong mỗi subject
              group.subjects.forEach((subject, subjectIdx) => {
                if (subject.questions && Array.isArray(subject.questions)) {
                  // Kiểm tra có ít nhất 1 câu hỏi (không phải child) có isTestQuestion = true
                  const hasTestQuestion = subject.questions.some(
                    (question) =>
                      !question.parentId && question.isTestQuestion === true
                  );

                  if (!hasTestQuestion) {
                    invalidGroupTopics.push(
                      `${tab.exam_section_name || `Phần ${tabIndex + 1}`} - ${group.nameTopic || `Nhóm ${groupIdx + 1}`} - ${subject.nameSubject || `Môn ${subjectIdx + 1}`} (${subject.questions.length} câu)`
                    );
                  }
                }
              });
            }
          });
        }
      });

      if (invalidGroupTopics.length > 0) {
        notification.error({
          message: "Thiếu câu hỏi thử nghiệm",
          description: `Các môn học trong nhóm có nhiều môn phải có ít nhất 1 câu hỏi được đánh dấu là "Câu hỏi thử nghiệm".`,
          placement: "topRight",
          duration: 5,
        });
        return;
      }
      // Đảm bảo danh sách exam đã được load
      const existingExams = this.props.exams || [];

      // Kiểm tra trùng tên (case-insensitive, loại trừ exam hiện tại nếu UPDATE)
      const isDuplicate = existingExams.some((exam) => {
        const existingName = exam.name?.trim().toLowerCase();
        const currentName = examName.toLowerCase();
        const isSameName = existingName === currentName;
        const isNotCurrentExam = exam.id !== this.state.examId; // Cho UPDATE, loại trừ exam hiện tại

        return isSameName && isNotCurrentExam;
      });

      if (isDuplicate) {
        notification.error({
          message: "Tên đề thi đã tồn tại",
          description: "Vui lòng chọn tên khác",
          placement: "topRight",
          duration: 3,
        });
        return;
      }

      const scorePerPart = Array.isArray(this.state.scorePerPart)
        ? this.state.scorePerPart
        : [];
      const hasEmptyScore = scorePerPart.some((score, index) => {
        const scoreValue = score?.toString().trim();
        return !scoreValue || scoreValue === "" || Number(scoreValue) <= 0;
      });

      if (hasEmptyScore || scorePerPart.length === 0) {
        throw new Error("Vui lòng điền tổng điểm cho tất cả các phần thi");
      }

      // Validation cho các trường bắt buộc có dấu sao đỏ
      if (!this.state.examTypeId || this.state.examTypeId.trim() === "") {
        throw new Error("Loại đề thi không được để trống");
      }

      // ✅ VALIDATION: Kiểm tra mỗi phần thi MAC_DINH phải có ít nhất 1 câu hỏi
      const invalidTabs = [];
      this.state.tabData.forEach((tab, index) => {
        // Chỉ kiểm tra phần thi mặc định (MAC_DINH), bỏ qua NHOM_CHU_DE
        if (tab.exam_section_type === "NHOM_CHU_DE") {
          return; // Bỏ qua validation cho NHOM_CHU_DE
        }

        const mainQuestions = (tab.questions || []).length;
        const subQuestions = (tab.subSections || []).reduce(
          (total, subSection) => total + (subSection.questions || []).length,
          0
        );
        const childExamQuestions = (tab.childExam || []).reduce(
          (total, child) => total + (child.questions || []).length,
          0
        );
        const totalQuestions = mainQuestions + subQuestions + childExamQuestions;

        if (totalQuestions === 0) {
          invalidTabs.push(tab.exam_section_name || `Phần ${index + 1}`);
        }
      });
      if (this.state.fastGiftStatus && this.state.fastGiftId == null) {
        notification.error({
          message: "Thiếu quà tặng",
          description: `Hãy chọn ít nhất 1 quà tặng`,
          placement: "topRight",
          duration: 5,
        });
        return;
      }
      if (invalidTabs.length > 0) {
        notification.error({
          message: "Thiếu câu hỏi",
          description: `Các phần thi sau chưa có câu hỏi: ${invalidTabs.join(", ")}. Vui lòng thêm ít nhất 1 câu hỏi cho mỗi phần thi.`,
          placement: "topRight",
          duration: 5,
        });
        return;
      }

      // if (!this.state.classes || this.state.classes.trim() === "") {
      //   throw new Error("Lớp học không được để trống");
      // }

      // if (!this.state.subject_id || this.state.subject_id.trim() === "") {
      //   throw new Error("Môn học không được để trống");
      // }

      // Debug payload before save
      // mo cmt
      // this.debugBeforeSave();

      // Đảm bảo tabData tồn tại
      if (!this.state.tabData || this.state.tabData.length === 0) {
        this.ensureDefaultSection();
        // Đợi state update
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Đảm bảo examId có sẵn (tạo mới nếu cần, nhưng chỉ cho CREATE)
      if (!this.state.examId && this.state.actionUser === "CREATE") {
        await this.createNewExamApi();
      }

      // Clear any remaining deleteQuestionIds before building parts
      if (
        this.state.deleteQuestionIds &&
        this.state.deleteQuestionIds.length > 0
      ) {
        this.setState({ deleteQuestionIds: [] });
        // Short delay to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // ✅ SỬ DỤNG LOGIC ĐƠN GIẢN - buildSimplePartsPayload()
      let parts;
      try {
        // ✅ Luôn dùng buildUnifiedPartsPayload để xử lý tất cả loại section
        parts = this.buildUnifiedPartsPayload();

        // Chỉ validate cơ bản
        if (!parts || !Array.isArray(parts) || parts.length === 0) {
          parts = [
            {
              name: "Phần mặc định",
              type: "MAC_DINH",
              totalquestions: 0,
              subpart: [
                {
                  name: "1.1 Phần mặc định",
                  children: [{ name: "Children 1", questions: [] }],
                },
              ],
            },
          ];
        }
      } catch (partsError) {
        parts = this.createDefaultParts();
      }
      const detail = this.props.detail || {};

      const requiredFields = {
        name: this.state.name || "Đề thi mới",
        subject_id: this.state.subject_id,
        typeExam: this.state.typeExam,
        examTypeId: this.state.examTypeId,
      };
      if (!requiredFields.subject_id) {
      }
      if (!requiredFields.typeExam) {
      }
      let data = {
        e_cheating: this.state.e_cheating,
        name: requiredFields.name,
        group: this.state.group || "MAC_DINH",
        subject: {
          id: requiredFields.subject_id || "",
        },
        score: this.state.score || 100,
        time: this.state.time || 900,
        is_redo: this.state.is_redo !== undefined ? this.state.is_redo : false,
        classes: this.state.classes || "",
        exam_doc_link: this.state.linkExam || "",
        exam_doc_link2: this.state.linkExam2 || "",
        answer_doc_link: this.state.linkAnswer || "",
        point_true_false:
          this.state.pointTrueFalse === true
            ? {
              1: this.state.pointTrueFalse1,
              2: this.state.pointTrueFalse2,
              3: this.state.pointTrueFalse3,
              4: this.state.pointTrueFalse4,
            }
            : {},
        category: this.state.category || "",
        alias: this.state.alias || "",
        type: requiredFields.typeExam || "",
        categoryExam: {
          populate_id: requiredFields.typeExam || "",
          type_exam: requiredFields.examTypeId || "",
        },
        parts: parts, // ← Validated format từ validateAndFixPartsPayload()
        tp: this.state.tp || "",
        practiceConfig: this.state.group === "THI_THU" ? {
          status: this.state.isPracticeConfig === false ? false : true,
          startDate: this.state.startDate || "",
          endDate: this.state.endDate || "",
          result_display: this.state.resultDisplay || "LATER",
          answer_display: this.state.answerDisplay || "LATER",
          required_passwword: this.state.requirePassword === true,
          password: this.state.examPassword || ""
        } : null,
        fast_gift: {
          status: this.state.fastGiftStatus || false,
          id: this.state.fastGiftId || null
        }
      };

      // ✅ CẬP NHẬT: Đồng bộ this.state.parts với parts mới (đã loại trừ câu hỏi chùm)
      this.setState({ parts: parts });

      // Thêm exam_id nếu UPDATE
      if (this.state.actionUser === "UPDATE" && this.state.examId) {
        data.exam_id = this.state.examId;
      }

      // Use debug method to analyze payload
      this.debugPayloadFormat(data);

      // Final payload validation before API call
      if (!data.name || data.name.trim() === "") {
        // throw new Error('Tên đề thi không được để trống');
      }

      // Validation cho các trường bắt buộc có dấu sao đỏ
      if (!this.state.examTypeId || this.state.examTypeId.trim() === "") {
        throw new Error("Loại đề thi không được để trống");
      }

      // if (!this.state.classes || this.state.classes.trim() === "") {
      //   throw new Error("Lớp học không được để trống");
      // }

      if (!this.state.subject_id || this.state.subject_id.trim() === "") {
        throw new Error("Môn học không được để trống");
      }

      // Kỳ thi có thể không bắt buộc
      // if (!data.categoryExam || !data.categoryExam.populate_id) {
      //   throw new Error('Vui lòng chọn kỳ thi');
      // }

      if (
        !data.parts ||
        !Array.isArray(data.parts) ||
        data.parts.length === 0
      ) {
        throw new Error("Đề thi phải có ít nhất một phần");
      }

      // Validate each part has required structure
      for (let i = 0; i < data.parts.length; i++) {
        const part = data.parts[i];
        if (!part.name || !part.subpart || !Array.isArray(part.subpart)) {
          throw new Error(`Phần ${i + 1} không có cấu trúc hợp lệ`);
        }

        // Validate subparts
        for (let j = 0; j < part.subpart.length; j++) {
          const subpart = part.subpart[j];
          if (!subpart.children || !Array.isArray(subpart.children)) {
            throw new Error(`Phần ${i + 1}, nhóm ${j + 1} thiếu children`);
          }
        }
      }
      // Gọi API phù hợp; chỉ điều hướng khi thành công (API trả code 200)
      this.setState({ isCreating: true });

      try {
        if (this.state.actionUser === "UPDATE") {
          await this.props.updateExamWord(data);
        } else {
          await this.props.createExamWord(data);
        }

        this.props.history.push("/exam-word");
      } finally {
        this.setState({ isCreating: false });
      }
    } catch (error) {
      // Show user-friendly error message
      let errorMessage = "Có lỗi xảy ra khi lưu đề thi";
      if (error.message) {
        errorMessage += ": " + error.message;
      }
      if (error.response?.data?.message) {
        errorMessage += " (" + error.response.data.message + ")";
      }

      notification.error({
        message: errorMessage,
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    } finally {
      this.setState({ isCreating: false });
      setLoader(false);
    }
  }

  // Method riêng để tạo API format payload (không ảnh hưởng logic gốc)
  buildAPIFormatPayload = () => {
    let tabData = this.state.tabData || [];

    if (tabData.length === 0) {
      return [
        {
          name: "Phần mặc định",
          type: "MAC_DINH",
          totalquestions: 0,
          subpart: [
            {
              name: "1.1 Phần mặc định",
              children: [
                {
                  name: "Children 1",
                  questions: [],
                },
              ],
            },
          ],
        },
      ];
    }

    return tabData.map((tab, idx) => {
      const partName = tab.exam_section_name || `Phần ${idx + 1}`;
      let totalQuestions = 0;
      let subparts = [];

      // Xử lý sub-sections nếu có
      if (tab.subSections && tab.subSections.length > 0) {
        // Lọc sub-sections có câu hỏi
        const validSubSections = tab.subSections.filter(
          (subSection) =>
            subSection.questions && subSection.questions.length > 0
        );

        if (validSubSections.length > 0) {
          subparts = validSubSections.map((subSection, subIndex) => {
            const formattedQuestions = (subSection.questions || [])
              .filter((q) => q && (q._id || q.question_id))
              .map((q) => this.convertQuestionToAPIFormat(q));

            totalQuestions += formattedQuestions.length;

            return {
              name: `${subSection.name}`,
              children: [
                {
                  name: "Children 1",
                  questions: formattedQuestions,
                },
              ],
            };
          });
        } else {
          // Nếu không có sub-sections hợp lệ, tạo subpart mặc định với questions của section chính
          let questions = [];
          if (tab.exam_section_type === "GROUP_SUBJECT") {
            (tab.exam_section_group || []).forEach((group) => {
              (group.subjects || []).forEach((subject) => {
                questions.push(...(subject.questions || []));
              });
            });
          } else {
            questions = tab.questions || [];
          }

          const formattedQuestions = questions
            .filter((q) => q && (q._id || q.question_id))
            .map((q) => this.convertQuestionToAPIFormat(q));

          totalQuestions = formattedQuestions.length;

          subparts = [
            {
              name: `${partName}`,
              children: [
                {
                  name: "Children 1",
                  questions: formattedQuestions,
                },
              ],
            },
          ];
        }
      } else {
        // Không có sub-sections, xử lý như bình thường
        let questions = [];
        if (tab.exam_section_type === "GROUP_SUBJECT") {
          (tab.exam_section_group || []).forEach((group, j) => {
            const subpart = {
              name: `${idx + 1}.${j + 1} ${group.name || group.group_name || `Nhóm ${j + 1}`
                }`,
              children: [],
            };

            (group.subjects || []).forEach((subject, k) => {
              const subjectQuestions = (subject.questions || [])
                .filter((q) => q && (q._id || q.question_id))
                .map((q) => this.convertQuestionToAPIFormat(q));

              totalQuestions += subjectQuestions.length;

              subpart.children.push({
                name: `Children ${k + 1}`,
                questions: subjectQuestions,
              });
            });

            if (subpart.children.length === 0) {
              subpart.children.push({
                name: "Children 1",
                questions: [],
              });
            }

            subparts.push(subpart);
          });
        } else {
          questions = (tab.questions || [])
            .filter((q) => q && (q._id || q.question_id))
            .map((q) => this.convertQuestionToAPIFormat(q));

          totalQuestions = questions.length;

          subparts = [
            {
              name: `${partName}`,
              children: [
                {
                  name: "Children 1",
                  questions: questions,
                },
              ],
            },
          ];
        }
      }

      return {
        name: partName,
        type: "MAC_DINH",
        totalquestions: totalQuestions,
        subpart: subparts,
      };
    });
  };

  // Method riêng để tạo API format data (không ảnh hưởng logic gốc)
  buildAPIFormatData = () => {
    const apiParts = this.buildAPIFormatPayload();

    return {
      name: this.state.name || "Đề thi mới",
      alias: this.state.alias || "",
      score: 10,
      subject: {
        id: this.state.subject_id || "",
      },
      categoryExam: {
        populate_id: this.state.typeExam || "",
        type_exam: this.state.examTypeId || "test1",
      },
      // "categoryAssessment": this.state.categoryAssessment || [],
      time: this.state.time || 90,
      group: this.state.group || "MAC_DINH",
      parts: apiParts,
    };
  };

  handleDeleteChild = (childId) => {
    if (!childId || typeof childId !== "string") return;

    if (!window.confirm("Bạn có chắc chắn muốn xóa phần thi con này không?")) {
      return;
    }

    this.setState(
      (prevState) => {
        // Tạo bản sao của tabData
        const updatedTabData = [...prevState.tabData];

        // Tìm section chứa childExam cần xóa
        for (let i = 0; i < updatedTabData.length; i++) {
          const section = updatedTabData[i];

          // Kiểm tra nếu section có childExam
          if (section.childExam && Array.isArray(section.childExam)) {
            // Lọc bỏ childExam có id trùng với childId
            section.childExam = section.childExam.filter(
              (child) => String(child.idChildExam) !== String(childId)
            );

            // Đồng bộ với subSections nếu có
            if (section.subSections && Array.isArray(section.subSections)) {
              section.subSections = section.subSections.filter(
                (sub) => String(sub.id) !== String(childId)
              );
            }
          }
        }

        return {
          tabData: updatedTabData,
          // Reset các state liên quan
          currentSubSectionId: null,
          childExamId: null,
        };
      },
      () => {
        // Callback sau khi state được cập nhật
        try {
          // Lưu vào session storage
          this.saveTabDataToSession();

          // Thông báo thành công
          notification.success({
            message: "Xóa phần thi con thành công",
            placement: "topRight",
          });
        } catch (e) {
          console.error("Error saving after delete child exam:", e);
        }
      }
    );
  };

  // Debug method để so sánh payload structure
  debugPayloadDifferences = () => {
    // Current upload parts
    if (this.state.parts && this.state.parts.length > 0) {
      // Convert to API format
      const apiParts = this.convertUploadPartsToAPIFormat(this.state.parts);
    }

    // TabData to API format
    if (this.state.tabData && this.state.tabData.length > 0) {
      // Convert to API format
      const apiFromTabData = this.convertTabDataToUploadFormat();

      // Show question conversion example
      if (this.state.tabData[0].questions?.[0]) {
        const originalQ = this.state.tabData[0].questions[0];
        const convertedQ = this.convertQuestionToAPIFormat(originalQ);
      }
    }

    // Show expected API format (sample from curl)
  };

  // Method để force sync payload format
  syncPayloadFormats = () => {
    // Nếu có cả upload parts và manual tabData, đảm bảo format consistency
    if (
      this.state.parts &&
      this.state.parts.length > 0 &&
      this.state.tabData &&
      this.state.tabData.length > 0
    ) {
      // Rebuild manual parts để match upload format
      const manualParts = this.buildPartsPayload();

      // Merge với upload parts, ưu tiên manual nếu có conflict
      const mergedParts = [...this.state.parts];

      // Thêm manual parts vào cuối
      manualParts.forEach((manualPart) => {
        const existingIndex = mergedParts.findIndex(
          (p) => p.id === manualPart.id
        );
        if (existingIndex >= 0) {
          // Replace existing với manual version
          mergedParts[existingIndex] = manualPart;
        } else {
          // Add new manual part
          mergedParts.push(manualPart);
        }
      });

      this.setState({ parts: mergedParts });
    }
  };

  // Debug helper methods for payload structure comparison
  debugPayloadDifferences = () => {
    // Compare question structures
    const uploadQ = this.getFirstUploadQuestion();
    const manualQ = this.getFirstManualQuestion();

    if (uploadQ && manualQ) {
      // Compare inner question structure
      if (uploadQ.question && manualQ.question) {
      }

      // Highlight differences
      const uploadKeys = new Set(Object.keys(uploadQ));
      const manualKeys = new Set(Object.keys(manualQ));

      const onlyUpload = [...uploadKeys].filter((k) => !manualKeys.has(k));
      const onlyManual = [...manualKeys].filter((k) => !uploadKeys.has(k));
    } else {
    }
  };

  getFirstUploadQuestion = () => {
    const parts = this.state.parts || [];
    for (const part of parts) {
      for (const subpart of part.subpart || []) {
        for (const child of subpart.children || []) {
          const uploadQ = (child.questions || []).find(
            (q) => q.question?.source === "upload"
          );
          if (uploadQ) return uploadQ;
        }
      }
    }
    return null;
  };

  getFirstManualQuestion = () => {
    const manualParts = this.buildPartsPayload();
    for (const part of manualParts) {
      for (const subpart of part.subpart || []) {
        for (const child of subpart.children || []) {
          const manualQ = (child.questions || []).find(
            (q) => q.question?.source === "manual"
          );
          if (manualQ) return manualQ;
        }
      }
    }
    return null;
  };

  // Debug method to log payload before save
  debugBeforeSave = () => {
    // Get parts to be saved in API format
    let parts;
    if (this.state.parts && this.state.parts.length > 0) {
      parts = this.convertUploadPartsToAPIFormat(this.state.parts);
    } else {
      parts = this.convertTabDataToUploadFormat(); // Already updated to API format
    }

    // Log sample question format
    if (parts[0]?.subpart?.[0]?.children?.[0]?.questions?.[0]) {
      const sampleQ = parts[0].subpart[0].children[0].questions[0];
    }

    this.debugPayloadDifferences();
  };

  countTotalQuestions = (parts = []) => {
    return parts.reduce((total, part) => {
      return (
        total +
        (part.subpart || []).reduce((partTotal, subpart) => {
          return (
            partTotal +
            (subpart.children || []).reduce((childTotal, child) => {
              return childTotal + (child.questions || []).length; // Include all questions including clusters
            }, 0)
          );
        }, 0)
      );
    }, 0);
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

  render() {
    const {
      isUploaded,
      subject,
      sections,
      showModal,
      selectedSubject,
      groups,
    } = this.state;

    return (
      <DragDropContext onDragEnd={this.onDragEndQuestion}>
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
                    gridTemplateColumns: "0.5fr 1.3fr 1fr 1fr 1fr 1fr",
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
                    <label className="text-form-label">Môn học <span style={{ color: "red" }}>*</span></label>
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
                    <div className="province-dropdown-container" style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Chọn tỉnh/thành phố..."
                        value={this.getSelectedProvinceName()}
                        onClick={this.handleInputClick}
                        readOnly
                        style={{ cursor: 'pointer', backgroundColor: 'white' }}
                      />

                      {/* Custom search overlay */}
                      {this.state.showProvinceDropdown && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderTop: 'none',
                            borderRadius: '0 0 4px 4px',
                            maxHeight: '250px',
                            zIndex: 9999,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Search input at top */}
                          <div style={{ padding: '8px', borderBottom: '1px solid #eee', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666', zIndex: 1 }}>
                              🔍
                            </div>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Tìm kiếm tỉnh/thành phố..."
                              value={this.state.provinceSearchTerm || ''}
                              onChange={this.handleProvinceSearch}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              style={{ paddingLeft: '35px', border: 'none', borderColor: 'none', boxShadow: 'none' }}
                            />
                          </div>

                          {/* Provinces list */}
                          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                            {this.getFilteredProvinces().map(province => (
                              <div
                                key={province.code}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                onClick={() => this.selectProvince(province)}
                              >
                                {province.name}
                              </div>
                            ))}
                            {this.getFilteredProvinces().length === 0 && this.state.provinceSearchTerm && (
                              <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                                Không tìm thấy tỉnh/thành phố
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {this.state.group === "THI_THU" && (
                <div
                  key={`thi-thu-section-${this.state.group}`}
                  className="block-exam block-item-content animate fade-down"
                  style={{
                    animation: 'fadeInDown 0.4s ease-in-out',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  {/* Header với checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <h3 className="title-block" style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Cấu hình luyện đề thực chiến</h3>
                    <label className="switch m-0" style={{ transform: 'translateY(1px)' }}>
                      <input type="checkbox" checked={this.state.isPracticeConfig} onChange={(e) => this.setState({ isPracticeConfig: e.target.checked })} />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  {/* Container với chiều cao cố định để tránh nhảy layout */}
                  <div style={{ minHeight: '230px', position: 'relative' }}>
                    {/* Nội dung chỉ hiện khi checkbox được check */}
                    {this.state.isPracticeConfig && (
                      <div className="content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'start' }}>
                        {/* Phần 1: Mở đề/Đóng đề */}
                        <div>
                          <h3 className="title-block" style={{ margin: 0, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Thời gian mở/đóng đề</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group mb-0">
                              <label className="text-form-label">
                                Mở đề <span style={{ color: 'red' }}>*</span>
                              </label>
                              <Flatpickr
                                value={this.state.startDate}
                                placeholder="DD/MM/YYYY --:-- --"
                                options={{
                                  enableTime: true,
                                  dateFormat: 'd/m/Y h:i K',
                                  time_24hr: false,
                                  closeOnSelect: false,
                                  locale: {
                                    ...Vietnamese,
                                    amPM: ['Sáng', 'Chiều']
                                  }
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
                                Đóng đề <span style={{ color: 'red' }}>*</span>
                              </label>
                              <Flatpickr
                                value={this.state.endDate}
                                placeholder="DD/MM/YYYY --:-- --"
                                options={{
                                  enableTime: true,
                                  dateFormat: 'd/m/Y h:i K',
                                  time_24hr: false,
                                  locale: {
                                    ...Vietnamese,
                                    amPM: ['Sáng', 'Chiều']
                                  }
                                }}
                                className="form-control"
                                style={
                                  this.state.showEndDateTooltip
                                    ? {
                                      border: '1px solid #ff4d4f',
                                      borderRadius: '4px',
                                      boxShadow: '0 0 0 2px rgba(255,77,79,0.2)'
                                    }
                                    : {}}
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
                                <span style={{ color: 'red', fontSize: '12px' }}>
                                  <img src="/assets/img/icon-report-bug.svg" alt="bug" style={{ color: 'red', width: '12px' }} />
                                  <small>
                                    Ngày đóng đề phải sau ngày mở đề!
                                  </small>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Phần 2: Chính sách kết quả/đáp án */}
                        <div>
                          <h3 className="title-block" style={{ margin: 0, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Chính sách kết quả/đáp án</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group mb-0">
                              <label className="text-form-label">Kết quả</label>
                              <div>
                                <select className="custom-select" style={{ fontSize: '13px' }} value={this.state.resultDisplay || "LATER"} onChange={(e) => this.setState({ resultDisplay: e.target.value })}>
                                  <option value={"LATER"}>Sau khi đóng đề</option>
                                  <option value={"IMMEDIATELY"}>Ngay sau khi nộp</option>
                                </select>
                              </div>
                            </div>
                            <div className="form-group mb-0">
                              <label className="text-form-label">Đáp án</label>
                              <div>
                                <select className="custom-select" style={{ fontSize: '13px' }} value={this.state.answerDisplay || "LATER"} onChange={(e) => this.setState({ answerDisplay: e.target.value })}>
                                  <option value={"LATER"}>Sau khi đóng đề</option>
                                  <option value={"IMMEDIATELY"}>Ngay sau khi nộp</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Phần 3: Yêu cầu mật khẩu */}
                        <div>
                          <h3 className="title-block" style={{ margin: 0, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Yêu cầu mật khẩu</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <label className="switch m-0">
                              <input type="checkbox" checked={this.state.requirePassword === true} onChange={(e) => this.setState({ requirePassword: e.target.checked })} />
                              <span className="slider round"></span>
                            </label>
                            <span style={{ fontSize: '13px', color: '#666' }}>Hiện nút "Mở khóa đề thi"</span>
                          </div>
                          {!this.state.requirePassword && (
                            <p style={{ fontSize: '12px', color: '#999', fontStyle: 'italic', margin: '0' }}>Các tùy chọn mật khẩu đã bị ẩn</p>
                          )}
                          {this.state.requirePassword && (
                            <div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '12px' }}>
                                <div className="form-group mb-0" style={{ flex: 1 }}>
                                  <label className="text-form-label">Mật khẩu <span style={{ color: "red" }}>*</span></label>
                                  <div style={{ position: 'relative' }}>
                                    <i className="fa fa-key" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', fontSize: '13px', zIndex: 1 }}></i>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Nhấn nút Tạo để sinh mật khẩu"
                                      value={this.state.examPassword || ''}
                                      onChange={(e) => this.setState({ examPassword: e.target.value })}
                                      style={{ fontSize: '13px', paddingLeft: '35px' }}
                                      readOnly
                                    />
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-light"
                                  onClick={() => {
                                    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                                    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
                                    const numbers = '0123456789';
                                    const allChars = uppercase + lowercase + numbers;

                                    let password = '';
                                    password += uppercase[Math.floor(Math.random() * uppercase.length)];
                                    password += lowercase[Math.floor(Math.random() * lowercase.length)];
                                    password += numbers[Math.floor(Math.random() * numbers.length)];

                                    for (let i = 3; i < 8; i++) {
                                      password += allChars[Math.floor(Math.random() * allChars.length)];
                                    }

                                    password = password.split('').sort(() => Math.random() - 0.5).join('');
                                    this.setState({ examPassword: password });
                                  }}
                                  style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}
                                >
                                  {this.state.examPassword ? 'Tạo mới' : 'Tạo'}
                                </button>
                                {this.state.examPassword && (
                                  <button
                                    className="btn btn-light"
                                    onClick={() => this.copyToClipboard(this.state.examPassword)}
                                    style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}
                                  >
                                    Sao chép
                                  </button>
                                )}
                              </div>
                              <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>Bạn có thể thay đổi mật khẩu bất cứ lúc nào</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Thông báo khi checkbox chưa được check */}
                    {!this.state.isPracticeConfig && (
                      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', color: '#666', minHeight: '230px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa fa-info-circle" style={{ fontSize: '24px', marginBottom: '8px', color: '#6c757d' }}></i>
                        <p style={{ margin: 0, fontSize: '14px' }}>Bật "Cấu hình luyện đề thực chiến" để thiết lập thời gian, chính sách và mật khẩu cho đề thi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="block-exam block-item-content">
                <h3 className="title-block">Tải lên file Word</h3>
                <div className="content" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '280px' }}>
                    <input
                      type="file"
                      id="wordFile"
                      accept=".doc,.docx"
                      onChange={this.onChangeHandler}
                      ref={(el) => (this.fileInputRef = el)}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="wordFile"
                      style={{
                        display: 'inline-flex',
                        gap: '5px',
                        width: '100%',
                        alignItems: 'center',
                        padding: '6px 10px',
                        border: '2px dashed #ddd',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        backgroundColor: '#f8f9fa',
                        transition: 'all 0.2s ease',
                        fontSize: '13px',
                        color: '#6c757d',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        height: '34px',
                        boxSizing: 'border-box',
                        margin: 0,
                        verticalAlign: 'middle'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#007bff';
                        e.currentTarget.style.backgroundColor = '#e7f1ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#ddd';
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                    >
                      <svg
                        style={{ width: '14px', height: '14px', flexShrink: 0 }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {this.state.fileData ? this.state.fileData.name : 'Chọn file Word'}
                      </span>
                    </label>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => this.handleUpload()}
                    disabled={!this.state.fileData || this.state.isUploading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '5px',
                      fontSize: '13px',
                      fontWeight: '500',
                      border: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease',
                      opacity: (!this.state.fileData || this.state.isUploading) ? 0.6 : 1,
                      cursor: (!this.state.fileData || this.state.isUploading) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      height: '34px'
                    }}
                    onMouseEnter={(e) => {
                      if (!(!this.state.fileData || this.state.isUploading)) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                  >
                    {this.state.isUploading ? (
                      <>
                        <i className="fa fa-spinner fa-spin"></i>
                        <span>Đang tải...</span>
                      </>
                    ) : this.state.uploaded ? (
                      <>
                        <img src="/assets/img/icon-upload.svg" alt="" style={{ width: "14px", height: "14px" }} />
                        <span>Tải file khác</span>
                      </>
                    ) : (
                      <>
                        <img src="/assets/img/icon-upload.svg" alt="" style={{ width: "14px", height: "14px" }} />
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '5px',
                      fontSize: '13px',
                      fontWeight: '500',
                      border: '1px solid #ddd',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                      color: '#495057',
                      whiteSpace: 'nowrap',
                      height: '34px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = '#007bff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                  >
                    <img src="/assets/img/icon-download.svg" alt="" style={{ width: "14px", height: "14px" }} />
                    <span>Đề mẫu</span>
                  </a>
                </div>
                <div className="file-hint mt-2">
                  <small className="text-muted" style={{ fontSize: '12px' }}>
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
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    className="exam-title-group"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      className="exam-title title-block"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: 0,
                      }}
                    >
                      Đề thi
                    </div>
                    <button
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

                  <div
                    className="button-group"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <button
                      className="btn btn-info"
                      onClick={this.handlePreviewExam}
                      disabled={!this.state.selectedSectionId}
                      style={{
                        cursor: !this.state.selectedSectionId ? 'not-allowed' : 'pointer',
                        opacity: !this.state.selectedSectionId ? 0.6 : 1
                      }}
                      title="Xem trước phần thi hiện tại"
                    >
                      <i className="fa fa-eye mr-2"></i>
                      Xem trước
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => {
                        this.handleAddDefaultSection();
                      }}
                      title="Thêm phần thi mặc định"
                    >
                      + Phần thi mặc định
                    </button>
                    <button
                      className={`btn btn-success ${this.state.isAddingTopicGroup ? 'disabled' : ''}`}
                      onClick={() => this.handleOpenModalCreateQuestionGroup()}
                      disabled={this.state.isAddingTopicGroup}
                      style={{
                        cursor: this.state.isAddingTopicGroup ? 'not-allowed' : 'pointer',
                        opacity: this.state.isAddingTopicGroup ? 0.6 : 1
                      }}
                    >
                      {this.state.isAddingTopicGroup ? (
                        <>
                          <i className="fa fa-spinner fa-spin mr-2"></i>
                          Đang tạo...
                        </>
                      ) : (
                        '+ Phần thi nhóm chủ đề'
                      )}
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
                  {this.state.sections.map((section, index) => (
                    <div key={section.id} style={{ position: "relative" }}>
                      {/* Conditional rendering cho edit mode */}
                      {this.state.editingSectionId === section.id ? (
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
                          className={`btn btn-outline-primary me-2 ${this.state.selectedSectionId === section.id
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
                            // Tìm tab bằng _id thay vì index để đảm bảo khớp chính xác
                            const tab = Array.isArray(this.state.tabData)
                              ? this.state.tabData.find(
                                (tab) => tab._id === section.id
                              )
                              : null;
                            const newState = {
                              selectedSectionId: tab ? tab._id : section.id,
                              examSectionId: tab ? tab._id : section.id,
                              selectedSectionType: section.title.includes(
                                "Phần nhóm chủ đề"
                              )
                                ? "group"
                                : "normal",
                            };

                            // Reset listSubjectGroups khi chuyển section để tránh data contamination
                            newState.listSubjectGroups = {};

                            // Reset và khởi tạo selectedGroupSubject cho phần thi NHOM_CHU_DE
                            if (
                              tab &&
                              tab.exam_section_type === "NHOM_CHU_DE"
                            ) {
                              newState.selectedGroupSubject = {};
                              if (
                                tab.groupTopic &&
                                Array.isArray(tab.groupTopic)
                              ) {
                                tab.groupTopic.forEach((group, idx) => {
                                  newState.selectedGroupSubject[idx] = 0;
                                });
                              }
                            }

                            this.setState(newState);
                          }}
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            this.handleStartEditSectionName(
                              section.id,
                              section.title
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
                        justifyContent: "flex-end",
                        alignItems: "center",
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
                        {/* ✅ Hiển thị nút "Thêm phần thi con" cho CẢ manual và upload sections */}
                        {(() => {
                          const currentTab = this.state.tabData.find(
                            (tab) => tab._id === this.state.examSectionId
                          );

                          // Nếu có groupTopic thì không render
                          if (currentTab?.groupTopic) return null;

                          // ✅ Cho phép thêm sub-section cho MAC_DINH sections (cả manual và upload)
                          const canAddSubSection =
                            currentTab &&
                            (!currentTab.exam_section_type ||
                              currentTab.exam_section_type === "MAC_DINH");

                          return (
                            <>
                              {canAddSubSection && (
                                <button
                                  className="btn btn-primary"
                                  onClick={() => {
                                    this.handleAddSubSection(
                                      this.state.examSectionId
                                    );
                                  }}
                                  title="Thêm phần thi con cho cả manual và upload sections"
                                >
                                  + Thêm phần thi con
                                </button>
                              )}
                              <button
                                className="btn btn-danger"
                                onClick={() =>
                                  this.handleDeleteSection(
                                    this.state.selectedSectionId
                                  )
                                }
                                disabled={!this.state.selectedSectionId}
                              >
                                Xóa phần thi
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div
                      className="card shadow-sm p-3 question-card"
                      style={{ padding: 0 }}
                    >
                      <div className="col-sm-12 mt-3">
                        {/* ✅ REMOVED DUPLICATE: Xóa IIFE render sub-sections trùng lặp - logic đã được xử lý ở CASE 2 bên dưới */}
                        {/* ✅ CASE 2: Hiển thị main table (có thể kèm theo sub-sections) */}
                        {(() => {
                          const currentTab = this.state.tabData.find(
                            (tab) => tab._id === this.state.selectedSectionId
                          );
                          const hasSubSections =
                            currentTab &&
                            currentTab.subSections &&
                            currentTab.subSections.length > 0;

                          const mainHasQuestions =
                            currentTab &&
                            currentTab.questions &&
                            currentTab.questions.length > 0;
                          const isGroupTopic =
                            currentTab?.exam_section_type === "NHOM_CHU_DE";

                          // ✅ UNIFIED LOGIC: Xác định nguồn upload
                          const isUploadedSection =
                            currentTab?.uploaded ||
                            currentTab?.classification ||
                            currentTab?.originalPartName;
                          // ✅ Luôn hiển thị main table (trừ NHOM_CHU_DE)
                          const shouldShowMainTable = !isGroupTopic;

                          if (shouldShowMainTable) {
                            // ✅ STEP 1: Xác định main questions (từ currentTab.questions hoặc main sub-section từ API)
                            let mainQuestions = [];
                            let mainTableTitle = "";
                            let isMainFromSubSection = false;

                            // Kiểm tra xem có main sub-section từ API không (isMain = true)
                            const mainSubSection = hasSubSections
                              ? currentTab.subSections.find(
                                (sub) =>
                                  sub.isMain === true &&
                                  sub.questions?.length > 0
                              )
                              : null;

                            if (mainSubSection) {
                              // ✅ CASE A: Main questions từ sub-section từ API (isMain = true)
                              mainQuestions = [...(mainSubSection.questions || [])];
                              mainTableTitle = "";
                              isMainFromSubSection = true;
                            } else if (mainHasQuestions) {
                              // ✅ CASE B: Main questions từ currentTab.questions
                              mainQuestions = [...(currentTab.questions || [])];
                              mainTableTitle = isUploadedSection ? "" : "";
                              isMainFromSubSection = false;
                            } else {
                              // ✅ CASE C: Không có main questions, chỉ hiển thị table trống
                              mainQuestions = [];
                              mainTableTitle = isUploadedSection ? "" : "";
                              isMainFromSubSection = false;
                            }

                            return (
                              <>
                                {/* ✅ MAIN TABLE - Luôn hiển thị currentTab.questions */}
                                <div className="main-section-block mb-4">
                                  <div className="main-section-header d-flex justify-content-between align-items-center mb-3">
                                    <div style={{ marginBottom: "10px" }}></div>
                                    {/* Button đánh số cho main table */}
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => {
                                        const startNumber = RenumberLogic.getStartingQuestionNumber(
                                          this.state.tabData,
                                          this.state.selectedSectionId
                                        );
                                        RenumberLogic.handleOpenRenumberModal(
                                          this,
                                          this.state.selectedSectionId,
                                          startNumber
                                        );
                                      }}
                                      title="Đánh số lại câu hỏi"
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

                                  {/* Main table với border xanh dương */}
                                  <div
                                    key={`main-table-${this.state._forceRenderKey || 0}`}
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
                                          <th style={{ width: "40px" }}></th>
                                          <th
                                            style={{
                                              minWidth: "150px",
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

                                      <Droppable
                                        droppableId={
                                          isMainFromSubSection
                                            ? `sub-section-${mainSubSection.id}`
                                            : "questions-table"
                                        }
                                      >
                                        {(provided) => (
                                          <tbody
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                          >
                                            {mainQuestions.length > 0 ? (
                                              (() => {
                                                return this.fetchRows(
                                                  mainQuestions,
                                                  isMainFromSubSection
                                                    ? `sub-section-${mainSubSection.id}`
                                                    : "questions-table",
                                                  isMainFromSubSection
                                                    ? mainSubSection.id
                                                    : null,
                                                  0 // ✅ Bảng chính luôn bắt đầu từ STT 1 (offset = 0)
                                                );
                                              })()

                                            ) : (
                                              <tr>
                                                <td
                                                  colSpan="9"
                                                  className="text-center text-muted"
                                                >
                                                  Chưa có câu hỏi nào
                                                </td>
                                              </tr>
                                            )}
                                            {provided.placeholder}
                                          </tbody>
                                        )}
                                      </Droppable>
                                    </table>
                                  </div>

                                  {/* ✅ UNIFIED BUTTONS: Thêm câu hỏi cho main table */}
                                  <div
                                    className="question-type-group"
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: "8px",
                                      marginBottom: "30px",
                                    }}
                                  >
                                    {isMainFromSubSection ? (
                                      // Buttons cho main sub-section từ API
                                      <>
                                        <button
                                          className="btn btn-info"
                                          onClick={() =>
                                            this.handleOpenModalCreateQuestionForSubSection(
                                              "SINGLECHOICE",
                                              mainSubSection.id
                                            )
                                          }
                                        >
                                          + Trắc nghiệm
                                        </button>
                                        <button
                                          className="btn btn-info"
                                          onClick={() =>
                                            this.handleOpenModalCreateQuestionForSubSection(
                                              "TRUEFALSEMULTI",
                                              mainSubSection.id
                                            )
                                          }
                                        >
                                          + Trắc nghiệm đúng sai
                                        </button>
                                        <button
                                          className="btn btn-info"
                                          onClick={() =>
                                            this.handleOpenModalCreateQuestionForSubSection(
                                              "FILLINBLANK",
                                              mainSubSection.id
                                            )
                                          }
                                        >
                                          + Điền số/Trả lời ngắn
                                        </button>
                                        <button
                                          className="btn btn-info"
                                          onClick={() =>
                                            this.handleOpenModalCreateQuestionForSubSection(
                                              "DRAGDROP",
                                              mainSubSection.id
                                            )
                                          }
                                        >
                                          + Kéo thả
                                        </button>
                                        <button
                                          className="btn btn-info"
                                          onClick={() =>
                                            this.handleOpenModalCreateQuestionForSubSection(
                                              "MULTICHOICE",
                                              mainSubSection.id
                                            )
                                          }
                                        >
                                          + TN nhiều đáp án
                                        </button>
                                        <button
                                          className="btn btn-info"
                                          onClick={() =>
                                            this.handleOpenModalCreateQuestionForSubSection(
                                              "TRUEFALSESINGLE",
                                              mainSubSection.id
                                            )
                                          }
                                        >
                                          + Đúng/Sai
                                        </button>
                                        <button
                                          className="btn btn-info"
                                          onClick={() =>
                                            this.handleOpenModalCreateQuestionForSubSection(
                                              "CLUSTEREDQUESTION",
                                              mainSubSection.id
                                            )
                                          }
                                        >
                                          + Câu hỏi chùm
                                        </button>
                                      </>
                                    ) : (
                                      // Buttons cho main section
                                      this.renderQuestionButtons &&
                                      this.renderQuestionButtons(
                                        this.state.selectedSectionId,
                                        false
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* ✅ SUB-SECTIONS: Chỉ render sub-sections KHÔNG phải main (isMain !== true) */}
                                {hasSubSections &&
                                  currentTab.subSections
                                    .filter(
                                      (subSection) => subSection.isMain !== true
                                    ) // ✅ Loại trừ main sub-section
                                    .map((subSection, subIndex) => {
                                      const hasQuestions =
                                        subSection.questions &&
                                        subSection.questions.length > 0;

                                      // 🎯 Tính questionNumberOffset cho STT liên tục
                                      // Helper function để đếm số câu hỏi thực sự (không tính cluster parent)
                                      const countRealQuestions = (
                                        questions
                                      ) => {
                                        let count = 0;
                                        questions.forEach((q) => {
                                          if (
                                            q.type === "CLUSTER" ||
                                            q.type === "cluster" ||
                                            q.type === "CLUSTER"
                                          ) {
                                            // Đếm số child questions của cluster
                                            const childCount = questions.filter(
                                              (child) =>
                                                child.parentId === q._id
                                            ).length;
                                            count += childCount;
                                          } else if (!q.parentId) {
                                            // Đếm câu hỏi thường (không phải child)
                                            count += 1;
                                          }
                                        });
                                        return count;
                                      };

                                      // Bắt đầu từ số câu hỏi thực sự của main table
                                      let questionNumberOffset =
                                        countRealQuestions(mainQuestions);

                                      // Cộng dồn số câu hỏi của các bảng con phía trước
                                      const nonMainSubSections =
                                        currentTab.subSections.filter(
                                          (sub) => sub.isMain !== true
                                        );
                                      for (let i = 0; i < subIndex; i++) {
                                        const prevSubSection =
                                          nonMainSubSections[i];
                                        const prevQuestions =
                                          prevSubSection.questions || [];
                                        const prevCount =
                                          countRealQuestions(prevQuestions);
                                        questionNumberOffset += prevCount;
                                      }

                                      return (
                                        <div
                                          key={subSection.id}
                                          className="sub-section-block mb-4"
                                        >
                                          {/* Sub-section header với tiêu đề đầy đủ */}
                                          <div className="sub-section-header d-flex justify-content-between align-items-center mb-3">
                                            <h5
                                              style={{
                                                margin: 0,
                                                color: "#ff6f3c",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              {subSection.name}
                                            </h5>

                                            {/* Nút xóa và đánh số cho sub-sections */}
                                            <div className="sub-section-actions" style={{ display: "flex", gap: "8px" }}>
                                              <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => {
                                                  const startNumber = RenumberLogic.getStartingQuestionNumber(
                                                    this.state.tabData,
                                                    this.state.selectedSectionId,
                                                    subSection.id
                                                  );
                                                  RenumberLogic.handleOpenRenumberModal(
                                                    this,
                                                    subSection.id,
                                                    startNumber
                                                  );
                                                }}
                                                title="Đánh số lại câu hỏi"
                                              >
                                                <i className="fa fa-list-ol"></i>
                                                Đánh số

                                              </button>
                                              <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                  this.handleDeleteSubSection(
                                                    subSection.id
                                                  )
                                                }
                                                title="Xóa phần thi con"
                                              >
                                                <i className="fa fa-trash"></i>
                                              </button>
                                            </div>
                                          </div>

                                          {/* Sub-section table với border cam đỏ */}
                                          <div
                                            key={`sub-section-${subSection.id}-${this.state._forceRenderKey || 0}`}
                                            className="question-table-wrapper"
                                            style={{
                                              overflowX: "scroll",
                                              overflowY: "scroll",
                                              minWidth: "50%",
                                              maxHeight: "600px",
                                              border: "2px solid #ff6f3c",
                                              padding: "25px",
                                              borderRadius: "5px",
                                            }}
                                          >
                                            <table className="table table-theme table-row v-middle">
                                              <thead className="text-muted">
                                                <tr>
                                                  <th
                                                    style={{ width: "40px" }}
                                                  ></th>
                                                  <th
                                                    style={{
                                                      minWidth: "150px",
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
                                              <Droppable
                                                droppableId={`sub-section-${subSection.id}`}
                                              >
                                                {(provided) => (
                                                  <tbody
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                  >
                                                    {hasQuestions ? (
                                                      this.fetchRows(
                                                        subSection.questions,
                                                        `sub-section-${subSection.id}`,
                                                        subSection.id,
                                                        questionNumberOffset // ✅ Truyền offset để STT liên tục
                                                      )
                                                    ) : (
                                                      <tr>
                                                        <td
                                                          colSpan="10"
                                                          className="text-center text-muted"
                                                        >
                                                          Chưa có câu hỏi nào
                                                          trong phần thi con này
                                                        </td>
                                                      </tr>
                                                    )}
                                                    {provided.placeholder}
                                                  </tbody>
                                                )}
                                              </Droppable>
                                            </table>
                                          </div>

                                          {/* Sub-section buttons */}
                                          <div
                                            className="question-type-group mb-4"
                                            style={{
                                              display: "flex",
                                              flexWrap: "wrap",
                                              gap: "8px",
                                            }}
                                          >
                                            <button
                                              className="btn btn-info btn-sm"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestionForSubSection(
                                                  "SINGLECHOICE",
                                                  subSection.id
                                                )
                                              }
                                            >
                                              + Trắc nghiệm
                                            </button>
                                            <button
                                              className="btn btn-info btn-sm"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestionForSubSection(
                                                  "TRUEFALSEMULTI",
                                                  subSection.id
                                                )
                                              }
                                            >
                                              + Trắc nghiệm đúng sai
                                            </button>
                                            <button
                                              className="btn btn-info btn-sm"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestionForSubSection(
                                                  "FILLINBLANK",
                                                  subSection.id
                                                )
                                              }
                                            >
                                              + Điền số/Trả lời ngắn
                                            </button>
                                            <button
                                              className="btn btn-info btn-sm"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestionForSubSection(
                                                  "DRAGDROP",
                                                  subSection.id
                                                )
                                              }
                                            >
                                              + Kéo thả
                                            </button>
                                            <button
                                              className="btn btn-info btn-sm"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestionForSubSection(
                                                  "MULTICHOICE",
                                                  subSection.id
                                                )
                                              }
                                            >
                                              + TN nhiều đáp án
                                            </button>
                                            <button
                                              className="btn btn-info btn-sm"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestionForSubSection(
                                                  "TRUEFALSESINGLE",
                                                  subSection.id
                                                )
                                              }
                                            >
                                              + Đúng/Sai
                                            </button>
                                            <button
                                              className="btn btn-info btn-sm"
                                              onClick={() =>
                                                this.handleOpenModalCreateQuestionForSubSection(
                                                  "CLUSTEREDQUESTION",
                                                  subSection.id
                                                )
                                              }
                                            >
                                              + Câu hỏi chùm
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}

                                {/* ✅ REMOVED: Duplicate childExams render - already handled by subSections above */}
                              </>
                            );
                          }

                          return null;
                        })()}

                        {/* ✅ CASE 3: NHOM_CHU_DE - Render riêng biệt */}
                        {(() => {
                          const currentTab = this.state.tabData.find(
                            (tab) => tab._id === this.state.selectedSectionId
                          );

                          if (
                            currentTab?.exam_section_type === "NHOM_CHU_DE" &&
                            currentTab?.groupTopic?.length > 0
                          ) {
                            return (
                              <>
                                {currentTab.groupTopic.map(
                                  (group, groupIdx) => {
                                    const selectedSubjectIdx =
                                      this.state.selectedGroupSubject?.[
                                      groupIdx
                                      ] ?? 0;
                                    const selectedSubject =
                                      group.subjects[selectedSubjectIdx];

                                    return (
                                      <div
                                        key={group.idTopic || groupIdx}
                                        style={{ marginBottom: "30px" }}
                                      >
                                        {/* Tiêu đề nhóm + môn học */}
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "10px",
                                            gap: "20px",
                                          }}
                                        >
                                          {/* Bên trái: tên nhóm */}
                                          <h5
                                            style={{
                                              margin: 0,
                                              color: "#ff6f3c",
                                              fontWeight: "bold",
                                              maxWidth: "30%",
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                            }}
                                          >
                                            {group.nameTopic}
                                          </h5>

                                          {/* Giữa: các button môn học */}
                                          <div
                                            style={{
                                              display: "flex",
                                              gap: "10px",
                                              flexWrap: "wrap",
                                              justifyContent: "center",
                                              flex: 1,
                                            }}
                                          >
                                            {group.subjects.map(
                                              (subject, subjIdx) => (
                                                <button
                                                  key={
                                                    subject.idSubject || subjIdx
                                                  }
                                                  className={`btn btn-outline-primary${selectedSubjectIdx ===
                                                    subjIdx
                                                    ? " active"
                                                    : ""
                                                    }`}
                                                  onClick={() =>
                                                    this.setState((prev) => ({
                                                      selectedGroupSubject: {
                                                        ...prev.selectedGroupSubject,
                                                        [groupIdx]: subjIdx,
                                                      },
                                                    }))
                                                  }
                                                >
                                                  {subject.nameSubject}
                                                </button>
                                              )
                                            )}
                                          </div>

                                          {/* Bên phải: icon đánh số + xoá */}
                                          <div
                                            style={{
                                              display: "flex",
                                              gap: "8px",
                                            }}
                                          >
                                            {/* ✅ Nút đánh số lại */}
                                            <button
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => {
                                                const tableId = `${currentTab._id}-group-${group.idTopic}-subject-${selectedSubject.idSubject}`;
                                                const startNumber = RenumberLogic.getGroupTopicStartingNumber(
                                                  this.state.tabData,
                                                  currentTab._id,
                                                  groupIdx,
                                                  selectedSubjectIdx
                                                );
                                                RenumberLogic.handleOpenRenumberModal(
                                                  this,
                                                  tableId,
                                                  startNumber
                                                );
                                              }}
                                              title="Đánh số lại câu hỏi"
                                            >
                                              <i className="fa fa-list-ol"></i>
                                              Đánh số

                                            </button>

                                            {/* 🗑️ Nút xóa nhóm */}
                                            <>
                                              <style>
                                                {`
      .btn-delete {
        background-color: white;
        color: red;
        border: 1px solid red;
        transition: all 0.25s ease;
      }
      .btn-delete:hover {
        background-color: red;
        color: white;
        transform: scale(1.05);
      }
    `}
                                              </style>

                                              {/* 🗑️ Nút xóa nhóm */}
                                              <button
                                                className="btn btn-sm btn-delete"
                                                onClick={() => this.handleDeleteGroup(selectedSubject.idSubject)}
                                                title="Xóa nhóm"
                                              >
                                                <i className="fa fa-trash"></i>
                                              </button>
                                            </>

                                            {/* ⚙️ Nút cài đặt mới */}
                                            <button
                                              className="btn btn-sm btn-outline-secondary"
                                              onClick={() => this.handleOpenUpdateGroupQuestion(currentTab._id)}
                                              title="Cài đặt nhóm"
                                            >
                                              <i className="fa fa-cog"></i>
                                            </button>
                                          </div>
                                        </div>

                                        {/* Bảng câu hỏi của môn học đang chọn */}
                                        <div
                                          className="question-table-wrapper"
                                          style={{
                                            overflowX: "auto",
                                            overflowY: "auto",
                                            minWidth: "50%",
                                            maxHeight: "600px", // Giới hạn chiều cao để kích hoạt cuộn dọc
                                            border: "2px solid #6aaef7ff", // Viền xanh dương
                                            padding: "25px",

                                            borderRadius: "5px", // Bo góc nhẹ để đẹp hơn (tùy chọn)
                                          }}
                                        >
                                          <table
                                            className="table table-theme table-row v-middle"
                                            style={{
                                              width: "100%",
                                              tableLayout: "auto",
                                            }}
                                          >
                                            <thead className="text-muted">
                                              <tr>
                                                <th
                                                  style={{ width: "40px" }}
                                                ></th>
                                                <th
                                                  style={{
                                                    minWidth: "150px",
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
                                              </tr>
                                            </thead>
                                            <Droppable
                                              droppableId={`group-${groupIdx}-subject-${selectedSubjectIdx}`}
                                            >
                                              {(provided) => (
                                                <tbody
                                                  ref={provided.innerRef}
                                                  {...provided.droppableProps}
                                                >
                                                  {selectedSubject?.questions
                                                    ?.length > 0 ? (
                                                    this.fetchRowsTopicGroup(
                                                      selectedSubject.questions,
                                                      `group-${groupIdx}-subject-${selectedSubjectIdx}`,
                                                      selectedSubject.idSubject
                                                    )
                                                  ) : (
                                                    <tr>
                                                      <td
                                                        colSpan="8"
                                                        className="text-center text-muted"
                                                      >
                                                        Chưa có câu hỏi nào cho
                                                        môn học này
                                                      </td>
                                                    </tr>
                                                  )}
                                                  {provided.placeholder}
                                                </tbody>
                                              )}
                                            </Droppable>
                                          </table>
                                        </div>

                                        {/* Các button thêm câu hỏi */}
                                        <div
                                          className="question-type-group"
                                          style={{ marginTop: "10px" }}
                                        >
                                          <button
                                            className="btn btn-info"
                                            onClick={() =>
                                              this.handleOpenModalCreateQuestion(
                                                "SINGLECHOICE",
                                                "Group",
                                                groupIdx,
                                                selectedSubjectIdx,
                                                group.idTopic,
                                                selectedSubject.idSubject
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
                                                "Group",
                                                groupIdx,
                                                selectedSubjectIdx,
                                                group.idTopic,
                                                selectedSubject.idSubject
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
                                                "Group",
                                                groupIdx,
                                                selectedSubjectIdx,
                                                group.idTopic,
                                                selectedSubject.idSubject
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
                                                "Group",
                                                groupIdx,
                                                selectedSubjectIdx,
                                                group.idTopic,
                                                selectedSubject.idSubject
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
                                                "Group",
                                                groupIdx,
                                                selectedSubjectIdx,
                                                group.idTopic,
                                                selectedSubject.idSubject
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
                                                "Group",
                                                groupIdx,
                                                selectedSubjectIdx,
                                                group.idTopic,
                                                selectedSubject.idSubject
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
                                                "Group",
                                                groupIdx,
                                                selectedSubjectIdx,
                                                group.idTopic,
                                                selectedSubject.idSubject
                                              )
                                            }
                                          >
                                            + Câu hỏi chùm
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </>
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
                <div
                  className="button-group"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    Hủy
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => this.handleSave()}
                  >
                    Lưu
                  </button>
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
                            <div
                              className="text-muted"
                              style={{ fontSize: 13 }}
                            >
                              Nhập tổng điểm cho mỗi phần; hệ thống sẽ tính Điểm
                              mỗi câu dựa trên số câu đã có.
                            </div>
                            {(Array.isArray(this.state.sections)
                              ? this.state.sections
                              : []
                            ).map((s, idx) => {
                              const scoreStr =
                                this.state.scorePerPart?.[idx] ??
                                String(Number(s?.score || 0));
                              const totalQuestions = (() => {
                                const currentTab = this.state.tabData?.[idx];
                                if (currentTab) {
                                  // ✅ For NHOM_CHU_DE type sections
                                  if (
                                    currentTab.exam_section_type ===
                                    "NHOM_CHU_DE"
                                  ) {
                                    let total = 0;

                                    // Count questions for each group topic and subject
                                    (currentTab.groupTopic || []).forEach(
                                      (group) => {
                                        (group.subjects || []).forEach(
                                          (subject) => {
                                            if (
                                              subject.questions &&
                                              Array.isArray(subject.questions)
                                            ) {
                                              // Count non-cluster questions for this subject
                                              let subjectTotal =
                                                subject.questions.filter(
                                                  (q) =>
                                                    q.type !== "CLUSTER" &&
                                                    q.type !== "cluster" &&
                                                    q.type !== "Cluster"
                                                ).length;

                                              // Add subject total to overall total
                                              total += subjectTotal;
                                            }
                                          }
                                        );
                                      }
                                    );
                                    return total;
                                  }
                                  // For GROUP_SUBJECT type sections
                                  else if (
                                    currentTab.exam_section_type ===
                                    "GROUP_SUBJECT"
                                  ) {
                                    let total = 0;

                                    // Count questions for each group and subject
                                    (
                                      currentTab.exam_section_group || []
                                    ).forEach((group) => {
                                      (group.subjects || []).forEach(
                                        (subject) => {
                                          if (
                                            subject.questions &&
                                            Array.isArray(subject.questions)
                                          ) {
                                            // Count non-cluster questions for this subject
                                            let subjectTotal =
                                              subject.questions.filter(
                                                (q) =>
                                                  q.type !== "CLUSTER" &&
                                                  q.type !== "cluster" &&
                                                  q.type !== "Cluster"
                                              ).length;

                                            // Add subject total to overall total
                                            total += subjectTotal;
                                          }
                                        }
                                      );
                                    });
                                    return total;
                                  }
                                  // For MAC_DINH type sections
                                  else if (
                                    currentTab.exam_section_type === "MAC_DINH"
                                  ) {
                                    let total = 0;

                                    // Count questions in subSections
                                    if (
                                      currentTab.subSections &&
                                      Array.isArray(currentTab.subSections)
                                    ) {
                                      currentTab.subSections.forEach(
                                        (subSection) => {
                                          if (
                                            subSection.questions &&
                                            Array.isArray(subSection.questions)
                                          ) {
                                            total +=
                                              subSection.questions.filter(
                                                (q) =>
                                                  q.type !== "CLUSTER" &&
                                                  q.type !== "cluster" &&
                                                  q.type !== "Cluster"
                                              ).length;
                                          }
                                        }
                                      );
                                    }

                                    // Add questions from main section
                                    if (
                                      currentTab.questions &&
                                      Array.isArray(currentTab.questions)
                                    ) {
                                      total += currentTab.questions.filter(
                                        (q) =>
                                          q.type !== "CLUSTER" &&
                                          q.type !== "cluster" &&
                                          q.type !== "Cluster"
                                      ).length;
                                    }

                                    return total;
                                  }
                                }
                                return 0;
                              })();

                              const perQuestionScore =
                                totalQuestions > 0
                                  ? (
                                    parseFloat(scoreStr) / totalQuestions
                                  ).toFixed(2)
                                  : "0.00";

                              return (
                                <div
                                  key={(s.id || s.title || idx) + "_row"}
                                  className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between py-2 border-top"
                                >
                                  {/* Tiêu đề phần - input có thể chỉnh sửa */}
                                  <div
                                    className="flex-grow-1 mr-md-3"
                                    style={{ minWidth: 250 }}
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
                                      value={
                                        this.state.titlePerPart?.[idx] ??
                                        (s?.title || `Phần ${idx + 1}`)
                                      }
                                      onChange={(e) =>
                                        this.handlePartTitleChange(
                                          idx,
                                          e.target.value
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
                                    {/* Tổng điểm */}
                                    <div>
                                      <label
                                        className="mb-1"
                                        style={{
                                          fontSize: 12,
                                          fontWeight: 700,
                                        }}
                                      >
                                        TỔNG ĐIỂM{" "}
                                        <span style={{ color: "red" }}>*</span>
                                      </label>
                                      <input
                                        type="text"
                                        className={`form-control text-center ${!this.state.scorePerPart?.[idx] ||
                                          this.state.scorePerPart[idx]
                                            .toString()
                                            .trim() === "" ||
                                          Number(
                                            this.state.scorePerPart[idx]
                                          ) <= 0
                                          ? "is-invalid"
                                          : ""
                                          }`}
                                        value={
                                          this.state.scorePerPart?.[idx] ??
                                          scoreStr
                                        }
                                        onChange={(e) =>
                                          this.handleScorePerPartChange(
                                            idx,
                                            e.target.value
                                          )
                                        }
                                        style={{ width: 140 }}
                                        placeholder="Nhập điểm"
                                        required
                                      />
                                    </div>

                                    {/* Tổng số câu */}
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
                                        value={totalQuestions}
                                        style={{
                                          width: 140,
                                          background: "#f7f7f7",
                                        }}
                                      />
                                    </div>

                                    {/* Điểm từng câu */}
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
                                    checked={this.state.e_cheating}
                                    onChange={(e) => {
                                      const checked = e.target.checked;

                                      this.setState({ e_cheating: checked });
                                    }}
                                  />
                                  <span className="slider round"></span>
                                </label>
                              </div>
                            </div>

                            {/* Nội dung nhập thời gian */}
                            <div>
                              {this.state.statusExam === false ? (
                                // Tổng thời gian
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
                                    value={this.state.timeTotal || ""}
                                    onChange={this.handleTimeTotalChange}
                                  />
                                </div>
                              ) : // Chỉ hiển thị thời gian theo phần khi đã chọn kỳ thi
                                this.state.typeExam ? (
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
                                          value={
                                            this.state.timePerPart?.[idx] ||
                                            section.time ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            this.handleTimeChange(
                                              idx,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  // Hiển thị thông báo khi chưa chọn kỳ thi
                                  <div
                                    className="alert alert-info"
                                    style={{ fontSize: 14, margin: 0 }}
                                  >
                                    <i className="fa fa-info-circle mr-2"></i>
                                    Vui lòng chọn kỳ thi để cấu hình thời gian
                                    theo từng phần
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="card border rounded mt-3">
                          <div className="p-3 border-bottom"><h3 className="m-0" style={{ fontSize: 14, fontWeight: 600 }}>Quà tặng</h3></div>
                          <div className="p-3" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="d-flex align-items-center justify-content-between">
                              {/* Chống gian lận */}
                              <div className="d-flex align-items-center" style={{ gap: 12 }}>
                                <label className="m-0" style={{ fontSize: 14, fontWeight: 700 }}>
                                  Kích hoạt quà tặng<br></br>
                                  <span style={{ fontSize: 12, fontWeight: 300 }}>Bật để cho phép gán quà tặng cho đề thi
                                  </span></label>
                                <label className="switch m-0">
                                  <input
                                    type="checkbox"
                                    value={this.state.fastGiftStatus}
                                    checked={this.state.fastGiftStatus}
                                    onChange={(e) => {
                                      this.setState({
                                        fastGiftStatus: e.target.checked,
                                        fastGifts_id: null,
                                      })
                                    }}
                                  />
                                  <span className="slider round"></span>
                                </label>
                              </div>
                            </div>
                            {!this.state.typeExam ? (
                              <div
                                style={{
                                  padding: '16px',
                                  textAlign: 'center',
                                  color: '#9ca3af',
                                  fontStyle: 'italic',
                                }}
                              >
                                Chưa chọn kỳ thi
                              </div>
                            ) : this.state.fastGiftStatus && this.props.fastgifts && this.props.fastgifts.length > 0 ? (
                              this.props.fastgifts.map((gift) => (
                                <label
                                  key={gift._id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    background:
                                      this.state.fastGiftId === gift._id
                                        ? 'linear-gradient(135deg, #fb923c, #f97316)'
                                        : '#ffffff',
                                    color: this.state.fastGiftId === gift._id ? '#fff' : '#111827',
                                    padding: '14px 16px',
                                    borderRadius: 12,
                                    border:
                                      this.state.fastGiftId === gift._id
                                        ? 'none'
                                        : '1px solid #e5e7eb',
                                    boxShadow:
                                      this.state.fastGiftId === gift._id
                                        ? '0 10px 20px rgba(249,115,22,0.35)'
                                        : '0 2px 6px rgba(0,0,0,0.05)',
                                    transition: 'all 0.25s ease',
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="fastGift"
                                    value={gift._id}
                                    checked={this.state.fastGiftId === gift._id}
                                    onChange={(e) => this.setState({ fastGiftId: e.target.value })}
                                    style={{
                                      appearance: 'none',
                                      width: 18,
                                      height: 18,
                                      borderRadius: '50%',
                                      border:
                                        this.state.fastGiftId === gift._id
                                          ? '5px solid #fff'
                                          : '2px solid #9ca3af',
                                      backgroundColor:
                                        this.state.fastGiftId === gift._id ? '#fff' : 'transparent',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                    }}
                                  />
                                  <span style={{ flex: 1 }}>{gift.name}</span>
                                </label>
                              ))
                            ) : (
                              <div
                                style={{
                                  padding: '16px',
                                  textAlign: 'center',
                                  color: '#6b7280',
                                  fontStyle: 'italic',
                                }}
                              >
                                Chưa có phần quà nào cho kỳ thi này
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
                                    updatedQuestion
                                  );
                                  this.closeChildQuestionTypeModal();
                                }
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
                                    updatedQuestion
                                  );
                                  this.closeChildQuestionTypeModal();
                                }
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
                                    updatedQuestion
                                  );
                                  this.closeChildQuestionTypeModal();
                                }
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
                                    updatedQuestion
                                  );
                                  this.closeChildQuestionTypeModal();
                                }
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
                                    updatedQuestion
                                  );
                                  this.closeChildQuestionTypeModal();
                                }
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
                                    updatedQuestion
                                  );
                                  this.closeChildQuestionTypeModal();
                                }
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
                      listSubjectGroups={this.state.listSubjectGroups}
                      currentTopicId={this.state.currentTopicId}
                      currentSubjectId={this.state.currentSubjectId}
                      questionNo={this.state.questionNo}
                      childExamId={this.state.childExamId}
                      actionCreateQuestion={(data) => {
                        if (this.state.statusTopic == "NHOM_CHU_DE") {
                          this.addNewQuestionToGroup(data);
                        } else {
                          this.addNewQuestion(data);
                        }
                      }}
                      actionUpdateQuestion={(data) =>
                        this.actionUpdateQuestion(data)
                      }
                      processManualQuestion={(data) =>
                        this.processManualQuestion(data)
                      }
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
                      listSubjectGroups={this.state.listSubjectGroups}
                      currentTopicId={this.state.currentTopicId}
                      currentSubjectId={this.state.currentSubjectId}
                      questionIdGroupTopic={this.state.questionIdGroupTopic}
                      questionNo={this.state.questionNo}
                      childExamId={this.state.childExamId}
                      actionCreateQuestion={(data) => {
                        if (this.state.statusTopic == "NHOM_CHU_DE") {
                          this.addNewQuestionToGroup(data);
                        } else {
                          this.addNewQuestion(data);
                        }
                      }}
                      actionUpdateQuestion={(data) =>
                        this.actionUpdateQuestion(data)
                      }
                      processManualQuestion={(data) =>
                        this.processManualQuestion(data)
                      }
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
                      listSubjectGroups={this.state.listSubjectGroups}
                      currentTopicId={this.state.currentTopicId}
                      currentSubjectId={this.state.currentSubjectId}
                      questionIdGroupTopic={this.state.questionIdGroupTopic}
                      questionNo={this.state.questionNo}
                      childExamId={this.state.childExamId}
                      actionCreateQuestion={(data) => {
                        if (this.state.statusTopic == "NHOM_CHU_DE") {
                          this.addNewQuestionToGroup(data);
                        } else {
                          this.addNewQuestion(data);
                        }
                      }}
                      actionUpdateQuestion={(data) =>
                        this.actionUpdateQuestion(data)
                      }
                      processManualQuestion={(data) =>
                        this.processManualQuestion(data)
                      }
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
                      listSubjectGroups={this.state.listSubjectGroups}
                      currentTopicId={this.state.currentTopicId}
                      currentSubjectId={this.state.currentSubjectId}
                      questionIdGroupTopic={this.state.questionIdGroupTopic}
                      questionNo={this.state.questionNo}
                      childExamId={this.state.childExamId}
                      actionCreateQuestion={(data) => {
                        if (this.state.statusTopic == "NHOM_CHU_DE") {
                          this.addNewQuestionToGroup(data);
                        } else {
                          this.addNewQuestion(data);
                        }
                      }}
                      actionUpdateQuestion={(data) =>
                        this.actionUpdateQuestion(data)
                      }
                      processManualQuestion={(data) =>
                        this.processManualQuestion(data)
                      }
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
                      listSubjectGroups={this.state.listSubjectGroups}
                      currentTopicId={this.state.currentTopicId}
                      currentSubjectId={this.state.currentSubjectId}
                      questionIdGroupTopic={this.state.questionIdGroupTopic}
                      questionNo={this.state.questionNo}
                      childExamId={this.state.childExamId}
                      actionCreateQuestion={(data) => {
                        if (this.state.statusTopic == "NHOM_CHU_DE") {
                          this.addNewQuestionToGroup(data);
                        } else {
                          this.addNewQuestion(data);
                        }
                      }}
                      actionUpdateQuestion={(data) =>
                        this.actionUpdateQuestion(data)
                      }
                      processManualQuestion={(data) =>
                        this.processManualQuestion(data)
                      }
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
                      listSubjectGroups={this.state.listSubjectGroups}
                      currentTopicId={this.state.currentTopicId}
                      currentSubjectId={this.state.currentSubjectId}
                      questionIdGroupTopic={this.state.questionIdGroupTopic}
                      questionNo={this.state.questionNo}
                      childExamId={this.state.childExamId}
                      actionCreateQuestion={(data) => {
                        if (this.state.statusTopic == "NHOM_CHU_DE") {
                          this.addNewQuestionToGroup(data);
                        } else {
                          this.addNewQuestion(data);
                        }
                      }}
                      actionUpdateQuestion={(data) =>
                        this.actionUpdateQuestion(data)
                      }
                      processManualQuestion={(data) =>
                        this.processManualQuestion(data)
                      }
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
                      listSubjectGroups={this.state.listSubjectGroups}
                      currentTopicId={this.state.currentTopicId}
                      currentSubjectId={this.state.currentSubjectId}
                      questionIdGroupTopic={this.state.questionIdGroupTopic}
                      questionNo={this.state.questionNo}
                      childExamId={this.state.childExamId}
                      actionCreateQuestion={(data) => {
                        if (this.state.statusTopic == "NHOM_CHU_DE") {
                          this.addNewQuestionToGroup(data);
                        } else {
                          this.addNewQuestion(data);
                        }
                      }}
                      actionUpdateQuestion={(data) =>
                        this.actionUpdateQuestion(data)
                      }
                      processManualQuestion={(data) =>
                        this.processManualQuestion(data)
                      }
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

            <div
              id="createGroup"
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
                    <ModalGroupQuestion
                      uniqueKey={this.getKeyTabActive() + ""}
                      createGroupQuestion={(subject, data) =>
                        this.createGroupQuestion(subject, data)
                      }
                      updateGroupQuestion={(subject, data) =>
                        this.updateGroupQuestion(subject, data)
                      }
                      dataItemGroup={this.state.itemGroupTabData}
                      actionGroup={this.state.actionGroup}
                      groupDetail={this.state.groupDetail}
                      closeModal={() => {
                        $("#createGroup").hide();
                        $("body").removeClass("modal-open");
                        $(".modal-backdrop").remove();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

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

              <button
                type="button"
                className={`btn btn-info mr-2 ${this.state.isAddingTopicGroup ? 'disabled' : ''}`}
                data-toggle="modal"
                data-target="#createGroup"
                id="create-group"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
                title="Phần thi nhóm chủ đề"
                disabled={this.state.isAddingTopicGroup}
                style={{
                  cursor: this.state.isAddingTopicGroup ? 'not-allowed' : 'pointer',
                  opacity: this.state.isAddingTopicGroup ? 0.6 : 1
                }}
              >
                {this.state.isAddingTopicGroup ? (
                  <>
                    <i className="fa fa-spinner fa-spin mr-2"></i>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
                    Phần thi nhóm chủ đề
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal đánh số câu hỏi */}
        {RenumberLogic.renderRenumberModal(this)}

        {/* Preview Modal */}
        {this.state.showPreviewModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl" style={{ maxWidth: '90%', margin: '30px auto' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <div className="modal-title text-md" style={{ fontWeight: 700 }}>Xem trước phần thi</div>
                  <button className="close" onClick={this.closePreviewModal}>×</button>
                </div>
                <div className="modal-body" style={{ maxHeight: 'calc(70vh + 100px)', overflowY: 'auto' }}>
                  {!this.state.renderPreview ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Đang tải...</span>
                      </div>
                      <p style={{ marginTop: '16px', color: '#666' }}>Đang chuẩn bị nội dung xem trước...</p>
                    </div>
                  ) : this.state.previewData && (
                    <div className="preview-content">
                      <h3 style={{ marginBottom: '8px' }}>{this.state.previewData.exam_section_name}</h3>
                      {(() => {
                        let totalQuestions = 0;
                        if (Array.isArray(this.state.previewData.questions)) {
                          totalQuestions += this.state.previewData.questions.length;
                        }
                        if (Array.isArray(this.state.previewData.groupTopic)) {
                          this.state.previewData.groupTopic.forEach(group => {
                            if (Array.isArray(group.subjects)) {
                              group.subjects.forEach(subject => {
                                if (Array.isArray(subject.questions)) {
                                  totalQuestions += subject.questions.length;
                                }
                              });
                            }
                          });
                        }
                        return (
                          <p style={{ marginBottom: '20px', color: '#666' }}>
                            <strong>Loại phần thi:</strong> {this.renderQuestionType(this.state.previewData.exam_section_type) == 'NHOM_CHU_DE' ? 'Nhóm chủ đề' : 'Mặc định'}
                            {totalQuestions > 0 && (
                              <span> | <strong>Tổng số câu hỏi (kể cả câu hỏi chùm) :</strong> {totalQuestions}</span>
                            )}
                            {this.state.previewData.exam_section_type === 'NHOM_CHU_DE' &&
                              Array.isArray(this.state.previewData.groupTopic) && (
                                <span></span>
                              )}
                          </p>
                        );
                      })()}

                      {/* Hiển thị toàn bộ câu hỏi */}
                      {(() => {
                        // Helper function để decode HTML entities - decode nhiều lần nếu cần
                        const decodeHtmlEntities = (html) => {
                          if (!html) return '';
                          const txt = document.createElement("textarea");
                          txt.innerHTML = html;
                          let decoded = txt.value;
                          // Decode thêm lần nữa nếu vẫn còn entities
                          if (decoded.includes('&lt;') || decoded.includes('&gt;') || decoded.includes('&amp;')) {
                            txt.innerHTML = decoded;
                            decoded = txt.value;
                          }
                          return decoded;
                        };

                        // Lấy danh sách câu hỏi từ questions hoặc từ groupTopic
                        let questionsToDisplay = [];
                        if (Array.isArray(this.state.previewData.questions) && this.state.previewData.questions.length > 0) {
                          questionsToDisplay = this.state.previewData.questions;
                        } else if (this.state.previewData.exam_section_type === 'NHOM_CHU_DE' && Array.isArray(this.state.previewData.groupTopic)) {
                          this.state.previewData.groupTopic.forEach(group => {
                            if (Array.isArray(group.subjects)) {
                              group.subjects.forEach(subject => {
                                if (Array.isArray(subject.questions)) {
                                  questionsToDisplay = questionsToDisplay.concat(subject.questions);
                                }
                              });
                            }
                          });
                        }

                        return questionsToDisplay.length > 0 ? (
                          <div className="questions-preview">
                            <h4 style={{ marginBottom: '16px', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>Chi tiết câu hỏi (kể cả câu hỏi chùm)</h4>
                            {questionsToDisplay.map((q, idx) => {
                              const qNum = q.number || q.question_no || idx + 1;
                              const qType = this.renderQuestionType(q.type);
                              const qLevel = this.renderQuestionLevel(q);
                              const correctAns = q.correctAnswers || q.answer || [];
                              const hasChoices = Array.isArray(q.choices) && q.choices.length > 0;

                              return (
                                <div
                                  key={q._id || q.question_id || idx}
                                  style={{
                                    marginBottom: '16px',
                                    padding: '16px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                    backgroundColor: '#f9f9f9'
                                  }}
                                >
                                  {/* Câu hỏi header */}
                                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{
                                      minWidth: '40px',
                                      height: '40px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: '#007bff',
                                      color: 'white',
                                      borderRadius: '50%',
                                      fontWeight: 'bold',
                                      fontSize: '20px'
                                    }}>
                                      {qNum}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ marginBottom: '6px', color: '#666', fontSize: '20px' }}>
                                        <span className="badge badge-info" style={{ marginRight: '8px' }}>{qType}</span>
                                        {qLevel && <span className="badge badge-warning">{qLevel}</span>}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Nội dung câu hỏi */}
                                  <div style={{
                                    marginBottom: '12px',
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderLeft: '3px solid #007bff',
                                    borderRadius: '4px'
                                  }}>
                                    <p style={{ margin: 0, lineHeight: 1.6, color: '#333' }}>
                                      {q.rawHtml ? (
                                        <div
                                          dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(q.rawHtml) }}
                                          ref={(el) => {
                                            if (el) {
                                              try {
                                                renderMathInElement(el, {
                                                  delimiters: [
                                                    { left: '$$', right: '$$', display: true },
                                                    { left: '$', right: '$', display: false },
                                                    { left: '\\(', right: '\\)', display: false },
                                                    { left: '\\[', right: '\\]', display: true }
                                                  ],
                                                  throwOnError: false
                                                });
                                              } catch (e) {
                                                console.log('LaTeX rendering error:', e);
                                              }
                                            }
                                          }}
                                        />
                                      ) : (
                                        <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa có nội dung</span>
                                      )}
                                    </p>
                                  </div>

                                  {/* Các lựa chọn (nếu có) */}
                                  {hasChoices && (
                                    <div style={{ marginBottom: '12px' }}>
                                      <strong style={{ fontSize: '13px', color: '#333' }}>Các lựa chọn:</strong>
                                      <div style={{ marginTop: '8px' }}>
                                        {q.choices.map((choice, cIdx) => {
                                          const isCorrect = Array.isArray(correctAns) && correctAns.includes(choice.label || choice.value || choice.text);
                                          const isCorrectAnswer = Array.isArray(correctAns) && correctAns.some(ans =>
                                            ans === choice.label || ans === choice.value || ans === choice.text
                                          );

                                          return (
                                            <div
                                              key={cIdx}
                                              style={{
                                                padding: '8px 12px',
                                                marginBottom: '6px',
                                                backgroundColor: isCorrect ? '#e8f5e9' : '#f5f5f5',
                                                border: isCorrect ? '1px solid #4caf50' : '1px solid #ddd',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px'
                                              }}
                                            >
                                              <span style={{
                                                minWidth: '24px',
                                                fontWeight: 'bold',
                                                color: isCorrect ? '#4caf50' : '#666'
                                              }}>
                                                {choice.label}:
                                              </span>
                                              <div style={{ flex: 1, color: isCorrect ? '#2e7d32' : '#333' }}>
                                                {/* Render HTML content (including images) */}
                                                {choice.rawHtml || choice.content ? (
                                                  <span
                                                    dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(choice.rawHtml || choice.content) }}
                                                    ref={(el) => {
                                                      if (el) {
                                                        try {
                                                          renderMathInElement(el, {
                                                            delimiters: [
                                                              { left: '$$', right: '$$', display: true },
                                                              { left: '$', right: '$', display: false },
                                                              { left: '\\(', right: '\\)', display: false },
                                                              { left: '\\[', right: '\\]', display: true }
                                                            ],
                                                            throwOnError: false
                                                          });
                                                        } catch (e) {
                                                          console.log('LaTeX rendering error in choice:', e);
                                                        }
                                                      }
                                                    }}
                                                  />
                                                ) : (
                                                  <span
                                                    ref={(el) => {
                                                      if (el && choice.text || choice.value) {
                                                        const decodedText = decodeHtmlEntities(choice.text || choice.value);
                                                        if (el.textContent !== decodedText) {
                                                          el.textContent = decodedText;
                                                        }
                                                        try {
                                                          renderMathInElement(el, {
                                                            delimiters: [
                                                              { left: '$$', right: '$$', display: true },
                                                              { left: '$', right: '$', display: false },
                                                              { left: '\\(', right: '\\)', display: false },
                                                              { left: '\\[', right: '\\]', display: true }
                                                            ],
                                                            throwOnError: false
                                                          });
                                                        } catch (e) {
                                                          console.log('LaTeX rendering error in choice text:', e);
                                                        }
                                                      }
                                                    }}
                                                  />
                                                )}
                                                {isCorrect && <span style={{ marginLeft: '8px', color: '#4caf50', fontWeight: 'bold' }}>✓ Đáp án đúng</span>}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Đáp án (nếu không có choices) */}
                                  {!hasChoices && (
                                    <div style={{ marginBottom: '12px' }}>
                                      <strong style={{ fontSize: '13px', color: '#333' }}>Đáp án đúng:</strong>
                                      <div style={{
                                        marginTop: '6px',
                                        padding: '10px',
                                        backgroundColor: '#e8f5e9',
                                        border: '1px solid #4caf50',
                                        borderRadius: '4px',
                                        color: '#2e7d32'
                                      }}
                                        ref={(el) => {
                                          if (el) {
                                            try {
                                              renderMathInElement(el, {
                                                delimiters: [
                                                  { left: '$$', right: '$$', display: true },
                                                  { left: '$', right: '$', display: false },
                                                  { left: '\\(', right: '\\)', display: false },
                                                  { left: '\\[', right: '\\]', display: true }
                                                ],
                                                throwOnError: false
                                              });
                                            } catch (e) {
                                              console.log('LaTeX rendering error in answer:', e);
                                            }
                                          }
                                        }}
                                      >
                                        {this.getAnswerDisplay(correctAns, q) || <span style={{ color: '#999' }}>Chưa có đáp án</span>}
                                      </div>
                                    </div>
                                  )}

                                  {/* Giải thích (nếu có) */}
                                  {q.explanation && (
                                    <div style={{
                                      padding: '10px',
                                      backgroundColor: '#fff3e0',
                                      border: '1px solid #ff9800',
                                      borderRadius: '4px'
                                    }}>
                                      <strong style={{ color: '#e65100', fontSize: '12px' }}>Giải thích:</strong>
                                      <span style={{ margin: '6px 0 0 0', color: '#666', fontSize: '13px', display: 'block' }}
                                        ref={(el) => {
                                          if (el) {
                                            try {
                                              renderMathInElement(el, {
                                                delimiters: [
                                                  { left: '$$', right: '$$', display: true },
                                                  { left: '$', right: '$', display: false },
                                                  { left: '\\(', right: '\\)', display: false },
                                                  { left: '\\[', right: '\\]', display: true }
                                                ],
                                                throwOnError: false
                                              });
                                            } catch (e) {
                                              console.log('LaTeX rendering error in explanation:', e);
                                            }
                                          }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(q.explanation) }}
                                      />
                                    </div>
                                  )}

                                  {/* Video link (nếu có) */}
                                  {(q.video || q.video_link) && (
                                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                                      <strong>Video:</strong> <span style={{ color: '#0066cc' }}>Có video hỗ trợ</span>
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
                      {this.state.previewData.exam_section_type === 'NHOM_CHU_DE' &&
                        Array.isArray(this.state.previewData.groupTopic) &&
                        this.state.previewData.groupTopic.length > 0 && (
                          <div className="group-topic-preview" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #ddd' }}>
                            <h4 style={{ marginBottom: '12px' }}>Nhóm chủ đề ({this.state.previewData.groupTopic.length})</h4>
                            {this.state.previewData.groupTopic.map((group, gIdx) => (
                              <div key={gIdx} style={{ marginBottom: '15px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                                <h5 style={{ marginBottom: '8px', color: '#333' }}>{group.name || `Nhóm ${gIdx + 1}`}</h5>
                                {Array.isArray(group.subjects) && group.subjects.map((subject, sIdx) => (
                                  <div key={sIdx} style={{ marginLeft: '16px', marginBottom: '8px', fontSize: '13px' }}>
                                    <strong>{subject.name || `Môn học ${sIdx + 1}`}</strong>
                                    <span style={{ marginLeft: '8px', color: '#666' }}>
                                      ({Array.isArray(subject.questions) ? subject.questions.length : 0} câu)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={this.closePreviewModal}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Popup khi tạo/cập nhật đề thi */}
        {this.state.isCreating && (
          <>
            <div
              className="modal-backdrop fade show"
              style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 9998,
              }}
            ></div>
            <div
              className="modal show d-flex"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                backgroundColor: "transparent",
              }}
            >
              <div
                className="modal-dialog"
                style={{
                  maxWidth: "400px",
                  margin: 0,
                }}
              >
                <div
                  className="modal-content"
                  style={{
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <div
                    className="modal-body"
                    style={{
                      textAlign: "center",
                      padding: "40px 30px",
                    }}
                  >
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        className="spinner-border text-primary"
                        role="status"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderWidth: "4px",
                        }}
                      >
                        <span className="sr-only">Đang xử lý...</span>
                      </div>
                    </div>
                    <h5
                      style={{
                        fontWeight: "600",
                        marginBottom: "10px",
                        color: "#333",
                      }}
                    >
                      {this.state.actionUser === "UPDATE"
                        ? "Đang cập nhật đề thi..."
                        : "Đang tạo đề thi..."}
                    </h5>
                    <p
                      style={{
                        color: "#666",
                        fontSize: "14px",
                        marginBottom: 0,
                      }}
                    >
                      Vui lòng chờ, đừng đóng trang này
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DragDropContext >
    );
  } // Cleanup method to ensure consistent state before save
  cleanupStateBeforeSave = () => {
    // Clear any remaining delete operations
    if (
      this.state.deleteQuestionIds &&
      this.state.deleteQuestionIds.length > 0
    ) {
      this.setState({ deleteQuestionIds: [] });
    }

    // Validate and clean tabData
    if (this.state.tabData && Array.isArray(this.state.tabData)) {
      const cleanedTabData = this.state.tabData.map((tab) => {
        // Ensure required fields exist
        const cleanedTab = {
          ...tab,
          _id: tab._id || `section-${Date.now()}`,
          exam_section_name: tab.exam_section_name || "Phần mặc định",
          exam_section_type: tab.exam_section_type || "MAC_DINH",
          questions: Array.isArray(tab.questions)
            ? tab.questions.filter((q) => q != null)
            : [],
        };

        // Clean questions - remove any null/undefined questions
        if (
          cleanedTab.exam_section_type === "GROUP_SUBJECT" &&
          cleanedTab.exam_section_group
        ) {
          cleanedTab.exam_section_group = cleanedTab.exam_section_group.map(
            (group) => ({
              ...group,
              subjects: (group.subjects || []).map((subject) => ({
                ...subject,
                questions: Array.isArray(subject.questions)
                  ? subject.questions.filter((q) => q != null)
                  : [],
              })),
            })
          );
        }

        return cleanedTab;
      });

      if (
        cleanedTabData.length !== this.state.tabData.length ||
        JSON.stringify(cleanedTabData) !== JSON.stringify(this.state.tabData)
      ) {
        this.setState({ tabData: cleanedTabData });
      }
    }
  };

  // Process questions to correct API format
  processQuestionsForAPI = (questions) => {
    if (!questions || !Array.isArray(questions)) {
      return [];
    }

    return questions
      .filter((q) => q && (q._id || q.question_id)) // Only valid questions with ID
      .map((question, index) => {
        try {
          // Ensure proper question structure for API
          const apiQuestion = {
            question: {
              questionId:
                question._id ||
                question.question_id ||
                `temp-${Date.now()}-${index}`,
              rawHtml:
                question.rawHtml || question.content || question.question || "",
              type: this.mapQuestionTypeForAPI(question.type),
              choices: this.processChoicesForAPI(question.choices || []),
              correctAnswers: this.processCorrectAnswersForAPI(
                question.correctAnswers || question.answer || []
              ),
              explanation: question.explanation || "",
              level: question.level || question.question_level || "",
              images: question.images || [],
              video: question.video || question.video_link || "",
              parentId: question.parentId || null,
              dragDropOptions:
                question.dragDropOptions || question.drag_options || [], // Add dragDropOptions support
            },
            number:
              question.question_no ||
              question.questionNo ||
              question.number ||
              this.getActualQuestionNumber(question),
          };

          return apiQuestion;
        } catch (error) {
          return this.createDefaultQuestionWrapper(index + 1);
        }
      });
  };

  // Map question type to API format
  mapQuestionTypeForAPI = (type) => {
    const typeMapping = {
      SINGLECHOICE: "singlechoice",
      TRUEFALSEMULTI: "truefalsemulti",
      FILLINBLANK: "fillinblank",
      DRAGDROP: "dragdrop",
      MULTIPLECHOICE: "multiplechoice",
      TRUEFALSE: "truefalse",
      CLUSTER: "cluster",
    };

    return typeMapping[String(type).toUpperCase()] || "singlechoice";
  };

  // Process choices for API format
  processChoicesForAPI = (choices) => {
    if (!Array.isArray(choices)) return [];

    return choices.map((choice) => {
      if (typeof choice === "string") {
        return { label: choice, text: choice };
      }
      return {
        label: choice.label || choice.key || choice.id || "",
        text: choice.text || choice.value || choice.content || String(choice),
      };
    });
  };

  // Process correct answers for API format
  processCorrectAnswersForAPI = (answers) => {
    if (!Array.isArray(answers)) {
      if (answers !== null && answers !== undefined) {
        return [{ value: String(answers) }];
      }
      return [];
    }

    return answers.map((answer) => {
      if (typeof answer === "string") {
        return { value: answer };
      }
      return {
        label: answer.label || answer.key || answer.id || "",
        value: answer.value || answer.text || answer.label || String(answer),
      };
    });
  };
  debugPayloadFormat = (data) => {
    // Kiểm tra root fields
    const rootFields = Object.keys(data);
    // Required fields check
    const requiredFields = ["name", "subject", "categoryExam", "parts"];
    const missingFields = requiredFields.filter(
      (field) =>
        !data.hasOwnProperty(field) ||
        data[field] === null ||
        data[field] === undefined
    );

    // Validate subject structure
    if (data.subject && typeof data.subject === "object") {
      if (!data.subject.id) {
      }
    }

    // Validate categoryExam structure
    if (data.categoryExam && typeof data.categoryExam === "object") {
    }

    // Deep validate parts structure
    if (data.parts && Array.isArray(data.parts)) {
      data.parts.forEach((part, partIndex) => {
        if (!part.name)
          if (!part.subpart || !Array.isArray(part.subpart)) {
          } else {
            part.subpart.forEach((subpart, subIndex) => {
              if (subpart.children && Array.isArray(subpart.children)) {
                subpart.children.forEach((child, childIndex) => {
                  const questionCount = child.questions
                    ? child.questions.length
                    : 0;

                  if (questionCount > 0 && child.questions[0]) {
                    const firstQ = child.questions[0];
                  }
                });
              }
            });
          }
      });

      const totalQuestions = data.parts.reduce(
        (total, part) => total + (part.totalquestions || 0),
        0
      );
    }
    return data;
  };

  componentWillUnmount() {
    // Remove event listener
    document.removeEventListener('click', this.handleClickOutside);
  }
}

function mapStateToProps(state) {
  return {
    subjects: state.subject.subjects,
    token: state.auth.token, // questions: state.question.questions,
    question: state.examV2.question,
    exam: state.examV2.exam,
    detail: state.examV2.detail,
    section: state.examV2.section,
    examCategories: state.examWordCategory.examCategories,
    examTestCategories: state.examWordTestCategory.examCategories,
    examCategory: state.examWordCategory.examCategory,
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
      createExam,
      updateExam,
      createQuestion,
      updateQuestion,
      createSection,
      updateSection,
      detailExam,
      deleteQuestion,
      deleteGroup,
      deleteSection,
      updateGroupQuestionf,
      uploadWordFile,
      createExamWord,
      updateExamWord,
      listExamWord,
      listGift
    },
    dispatch
  );
}

let ExamsCreateContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ExamWordCreate)
);

export default ExamsCreateContainer;
