/**
 * RenumberQuestionsLogic.js
 * 
 * Module chứa logic đánh số lại câu hỏi cho bảng trong ExamCreate
 * Hỗ trợ đánh số cho:
 * - Main table (DEFAULT section)
 * - Sub-sections
 * - GROUP_TOPIC tables
 * 
 * ✅ UPDATED: Now uses QuestionNumberingService for unified numbering logic
 */

import React from "react";
import { notification } from "antd";
import QuestionNumberingService from "./QuestionNumberingService";

export const initialRenumberState = {
  showRenumberModal: false,
  renumberingTableId: null, // ID của bảng đang được renumber
  renumberStartValue: 1, // Giá trị bắt đầu đánh số
};

/**
 * ✅ UPDATED: Đánh số lại questions - Hỗ trợ preserve existing numbers cho upload
 * @param {Array} questions - Mảng câu hỏi cần đánh số
 * @param {Number} startNumber - Số thứ tự bắt đầu (chỉ dùng nếu không preserve)
 * @param {String} tableType - Loại bảng: 'MAIN' | 'SUB_SECTION' | 'GROUP_TOPIC'
 * @param {Object} options - Options (preserveExistingNumbers: boolean)
 * @returns {Array} - Mảng câu hỏi đã được đánh số lại
 */
export const renumberQuestions = (questions, startNumber, tableType = 'MAIN', options = {}) => {
  const { preserveExistingNumbers = false } = options; // Mới: Option để preserve number từ upload

  if (!Array.isArray(questions) || questions.length === 0) {
    return questions;
  }

  let currentNumber = startNumber;
  const processedIds = new Set();
  const result = [];

  // ✅ BƯỚC 1: Xử lý regular questions và clusters (không phải child)
  questions.forEach((question) => {
    // Skip nếu đã xử lý
    if (processedIds.has(question._id)) {
      return;
    }

    const isCluster = QuestionNumberingService.isClusterQuestion(question);
    const isChild = question.parentId && question.parentId !== null;

    // Skip child questions - sẽ xử lý sau
    if (isChild) {
      return;
    }

    // Clone question để không mutate original
    const updatedQuestion = { ...question };

    if (isCluster) {
      // Cluster không có STT
      updatedQuestion.number = 0;
      updatedQuestion.question_no = 0;
    } else {
      // ✅ MỚI: Nếu preserveExistingNumbers và question đã có number > 0, giữ nguyên
      if (preserveExistingNumbers && updatedQuestion.number && updatedQuestion.number > 0) {
        updatedQuestion.question_no = updatedQuestion.number; // Đồng bộ question_no
        currentNumber = Math.max(currentNumber, updatedQuestion.number + 1); // Cập nhật currentNumber cho câu hỏi sau
      } else {
        // Đánh số bình thường
        updatedQuestion.number = currentNumber;
        updatedQuestion.question_no = currentNumber;
        currentNumber++;
      }
    }

    processedIds.add(updatedQuestion._id);
    result.push(updatedQuestion);

    // ✅ BƯỚC 2: Xử lý child questions của cluster này
    if (isCluster) {
      const childQuestions = questions.filter(
        (q) => q.parentId === question._id
      );

      childQuestions.forEach((child) => {
        if (processedIds.has(child._id)) {
          return;
        }

        const updatedChild = { ...child };

        // ✅ MỚI: Preserve number cho child nếu có
        if (preserveExistingNumbers && updatedChild.number && updatedChild.number > 0) {
          updatedChild.question_no = updatedChild.number;
          currentNumber = Math.max(currentNumber, updatedChild.number + 1);
        } else {
          updatedChild.number = currentNumber;
          updatedChild.question_no = currentNumber;
          currentNumber++;
        }

        processedIds.add(updatedChild._id);
        result.push(updatedChild);
      });
    }
  });

  console.log(`✅ [Renumber] Renumbered ${result.length} questions. Preserve: ${preserveExistingNumbers}, Final currentNumber: ${currentNumber - 1}`);
  
  return result;
};

/**
 * ✅ FIXED: Tìm và đánh số lại table trong tabData - với DEEP CLONE và LOG chi tiết
 * @param {Array} tabData - Dữ liệu các tab
 * @param {String} tableId - ID của bảng cần đánh số
 * @param {Number} startNumber - Số thứ tự bắt đầu
 * @param {Boolean} preserveExistingNumbers - Có preserve number từ upload không?
 * @returns {Array} - tabData đã được cập nhật
 */
export const updateTabDataWithRenumbering = (tabData, tableId, startNumber, preserveExistingNumbers = false) => {
  if (!Array.isArray(tabData) || !tableId) {
    console.warn('⚠️ [Renumber] Invalid tabData or tableId');
    return tabData;
  }

  let foundTable = false;
  let tableType = 'MAIN';
  let questionsCount = 0;

  // ✅ CRITICAL: Deep clone tabData để tạo reference mới
  const updatedTabData = JSON.parse(JSON.stringify(tabData));

  console.log(`🔍 [Renumber] Looking for table: ${tableId}, startNumber: ${startNumber}, preserve: ${preserveExistingNumbers}`);

  for (let i = 0; i < updatedTabData.length; i++) {
    const tab = updatedTabData[i];

    // ✅ Xử lý main table - CẬP NHẬT ĐỂ XỬ LÝ MAIN SUB-SECTION
    if (tab._id === tableId) {
      foundTable = true;
      tableType = 'MAIN';
      
      console.log(`✅ [Renumber] Found MAIN table: ${tableId}`);
      
      // ✅ CHECK: Có main sub-section không (cho upload sections)
      const mainSubSection = tab.subSections?.find(sub => sub.isMain === true);
      
      if (mainSubSection) {
        // ✅ CASE: Upload section - đánh số main sub-section
        console.log(`   Found main sub-section: ${mainSubSection.id}`);
        console.log(`   Questions before:`, mainSubSection.questions?.length || 0);
        
        questionsCount = mainSubSection.questions?.length || 0;
        mainSubSection.questions = renumberQuestions(
          mainSubSection.questions || [],
          startNumber,
          'MAIN',
          { preserveExistingNumbers }
        );
        
        console.log(`   Questions after:`, mainSubSection.questions.length);
        console.log(`   Sample numbers:`, mainSubSection.questions.slice(0, 5).map(q => ({ 
          _id: q._id?.substring(0, 8), 
          number: q.number,
          type: q.type 
        })));
      } else {
        // ✅ CASE: Manual section - đánh số tab.questions
        console.log(`   No main sub-section, using tab.questions`);
        console.log(`   Questions before:`, tab.questions?.length || 0);
        
        questionsCount = tab.questions?.length || 0;
        tab.questions = renumberQuestions(
          tab.questions || [],
          startNumber,
          'MAIN',
          { preserveExistingNumbers }
        );
        
        console.log(`   Questions after:`, tab.questions.length);
        console.log(`   Sample numbers:`, tab.questions.slice(0, 5).map(q => ({ 
          _id: q._id?.substring(0, 8), 
          number: q.number,
          type: q.type 
        })));
      }
      break;
    }

    // ✅ Xử lý sub-sections
    if (tab.subSections && Array.isArray(tab.subSections)) {
      for (let j = 0; j < tab.subSections.length; j++) {
        const subSection = tab.subSections[j];
        
        if (subSection.id === tableId) {
          foundTable = true;
          tableType = 'SUB_SECTION';
          
          console.log(`✅ [Renumber] Found SUB_SECTION: ${tableId}`);
          console.log(`   Questions before:`, subSection.questions?.length || 0);
          
          questionsCount = subSection.questions?.length || 0;
          subSection.questions = renumberQuestions(
            subSection.questions || [],
            startNumber,
            'SUB_SECTION',
            { preserveExistingNumbers }
          );
          
          console.log(`   Questions after:`, subSection.questions.length);
          console.log(`   Sample numbers:`, subSection.questions.slice(0, 5).map(q => ({ 
            _id: q._id?.substring(0, 8), 
            number: q.number 
          })));
          break;
        }
      }
    }

    // ✅ Xử lý GROUP_TOPIC
    if (tab.exam_section_type === "GROUP_TOPIC" && tab.groupTopic) {
      for (let groupIdx = 0; groupIdx < tab.groupTopic.length; groupIdx++) {
        const group = tab.groupTopic[groupIdx];
        
        if (group.subjects && Array.isArray(group.subjects)) {
          for (let subjectIdx = 0; subjectIdx < group.subjects.length; subjectIdx++) {
            const subject = group.subjects[subjectIdx];
            const tableIdMatch = `${tab._id}-group-${group.idTopic}-subject-${subject.idSubject}`;
            
            if (tableIdMatch === tableId) {
              foundTable = true;
              tableType = 'GROUP_TOPIC';
              
              console.log(`✅ [Renumber] Found GROUP_TOPIC: ${tableId}`);
              console.log(`   Questions before:`, subject.questions?.length || 0);
              
              questionsCount = subject.questions?.length || 0;
              subject.questions = renumberQuestions(
                subject.questions || [],
                startNumber,
                'GROUP_TOPIC',
                { preserveExistingNumbers }
              );
              
              console.log(`   Questions after:`, subject.questions.length);
              console.log(`   Sample numbers:`, subject.questions.slice(0, 5).map(q => ({ 
                _id: q._id?.substring(0, 8), 
                number: q.number 
              })));
              break;
            }
          }
        }
      }
    }

    if (foundTable) break;
  }

  if (foundTable) {
    console.log(`✅ [Renumber] Successfully renumbered ${questionsCount} questions in ${tableType} table from ${startNumber}`);
  } else {
    console.warn(`⚠️ [Renumber] Table not found: ${tableId}`);
  }

  return updatedTabData;
};

/**
 * Mở modal đánh số
 * @param {Object} component - Component instance (this)
 * @param {String} tableId - ID của bảng cần đánh số
 * @param {Number} currentStartNumber - Số bắt đầu hiện tại
 */
export const handleOpenRenumberModal = (
  component,
  tableId,
  currentStartNumber = 1
) => {
  component.setState({
    showRenumberModal: true,
    renumberingTableId: tableId,
    renumberStartValue: currentStartNumber,
  });
};

/**
 * Đóng modal đánh số
 * @param {Object} component - Component instance (this)
 */
export const handleCloseRenumberModal = (component) => {
  component.setState({
    showRenumberModal: false,
    renumberingTableId: null,
    renumberStartValue: 1,
  });
};

/**
 * Xác nhận đánh số lại câu hỏi
 * @param {Object} component - Component instance (this)
 */
export const handleConfirmRenumber = (component) => {
  const { renumberingTableId, renumberStartValue, tabData } = component.state;

  if (!renumberingTableId) {
    return;
  }

  const startNumber = parseInt(renumberStartValue) || 1;

  // ✅ CRITICAL: Update tabData với deep clone
  const updatedTabData = updateTabDataWithRenumbering(
    tabData,
    renumberingTableId,
    startNumber,
    false // preserveExistingNumbers = false khi renumber thủ công
  );

  // ✅ Kiểm tra nếu là GROUP_TOPIC table (dựa trên tableId chứa '-group-' và '-subject-')
  const isGroupTopicTable = renumberingTableId.includes('-group-') && renumberingTableId.includes('-subject-');

  // ✅ CRITICAL: Set state với callback để đảm bảo update hoàn tất
  component.setState(
    { 
      tabData: updatedTabData, // New reference → trigger re-render
      _renumberTimestamp: Date.now(),
      _forceRenderKey: Date.now(),
      _lastUpdate: Date.now()
    },
    () => {
      try {
        // Save to session after state update
        if (component.saveTabDataToSession) {
          component.saveTabDataToSession();
        }
        
        // Force component update
        component.forceUpdate();
        
        // ✅ Chỉ gọi updateAllQuestionNumbers nếu KHÔNG phải GROUP_TOPIC (để tách biệt)
        if (!isGroupTopicTable && component.updateAllQuestionNumbers) {
          component.updateAllQuestionNumbers();
        }
        
        // Trigger re-render of specific sections
        const currentTab = component.state.tabData?.find(
          (tab) => tab._id === component.state.selectedSectionId
        );
        
        if (currentTab) {
          // ✅ Re-set selectedSectionId to trigger componentDidUpdate
          component.setState({ 
            selectedSectionId: null 
          }, () => {
            setTimeout(() => {
              component.setState({ 
                selectedSectionId: currentTab._id 
              });
            }, 0);
          });
        }
        
        notification.success({
          message: "Đánh số câu hỏi thành công",
          description: `Câu hỏi đã được đánh số lại từ ${startNumber}`,
          placement: "topRight",
          duration: 2,
        });

      } catch (error) {
        console.error("❌ [Renumber] Error:", error);
        notification.error({
          message: "Lỗi đánh số",
          description: "Đã xảy ra lỗi khi đánh số câu hỏi",
          placement: "topRight",
          duration: 3,
        });
      }

      handleCloseRenumberModal(component);
    }
  );
};

/**
 * ✅ UPDATED: Lấy số thứ tự bắt đầu của section/sub-section sử dụng QuestionNumberingService
 * @param {Array} tabData - Dữ liệu các tab
 * @param {String} sectionId - ID của section
 * @param {String} subSectionId - ID của sub-section (optional)
 * @returns {Number} - Số thứ tự bắt đầu
 */
export const getStartingQuestionNumber = (
  tabData,
  sectionId,
  subSectionId = null
) => {
  if (!Array.isArray(tabData) || !sectionId) {
    return 1;
  }

  const section = tabData.find((tab) => tab._id === sectionId);
  if (!section) {
    return 1;
  }

  // Xác định tableType
  const tableType = subSectionId ? 'SUB_SECTION' : 'MAIN';
  
  // Lấy offset từ service
  const offset = QuestionNumberingService.getUnifiedStartingNumber(
    tableType,
    {
      sectionId: sectionId,
      subSectionId: subSectionId,
      tabData: tabData
    }
  );

  // Return starting number (offset + 1)
  return offset + 1;
};

/**
 * ✅ UPDATED: Lấy số thứ tự bắt đầu cho GROUP_TOPIC subject - TÁCH BIỆT HOÀN TOÀN
 * Để tách biệt, luôn trả về 1 (không phụ thuộc vào các subject/group khác)
 * @param {Array} tabData - Dữ liệu các tab
 * @param {String} sectionId - ID của section
 * @param {Number} groupIdx - Index của group
 * @param {Number} subjectIdx - Index của subject
 * @returns {Number} - Số thứ tự bắt đầu (luôn là 1 để tách biệt)
 */
export const getGroupTopicStartingNumber = (
  tabData,
  sectionId,
  groupIdx,
  subjectIdx
) => {
  // Để tách biệt hoàn toàn, luôn bắt đầu từ 1, không phụ thuộc vào các subject/group khác
  return 1;
};

/**
 * Render modal đánh số
 * @param {Object} component - Component instance (this)
 * @returns {JSX.Element} - Modal component
 */
export const renderRenumberModal = (component) => {
  const {
    showRenumberModal,
    renumberStartValue,
  } = component.state;

  if (!showRenumberModal) {
    return null;
  }

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={() => handleCloseRenumberModal(component)}
      ></div>
      <div
        className="modal show d-block"
        tabIndex="-1"
        onClick={() => handleCloseRenumberModal(component)}
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
              <button
                className="close"
                onClick={() => handleCloseRenumberModal(component)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="text-form-label">
                  Số thứ tự bắt đầu <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={renumberStartValue}
                  onChange={(e) =>
                    component.setState({
                      renumberStartValue: parseInt(e.target.value) ,
                    })
                  }
                  placeholder="Nhập số thứ tự bắt đầu"
                  autoFocus
                />
                <small className="form-text text-muted">
                  Tất cả câu hỏi trong bảng sẽ được đánh số lại từ giá trị này
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-light"
                onClick={() => handleCloseRenumberModal(component)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleConfirmRenumber(component)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default {
  initialRenumberState,
  renumberQuestions,
  updateTabDataWithRenumbering,
  handleOpenRenumberModal,
  handleCloseRenumberModal,
  handleConfirmRenumber,
  getStartingQuestionNumber,
  getGroupTopicStartingNumber,
  renderRenumberModal,
};
