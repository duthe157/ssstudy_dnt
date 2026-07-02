/**
 * ============================================
 * QUESTION NUMBERING SERVICE
 * ============================================
 * Service quản lý đánh số thứ tự câu hỏi thống nhất cho tất cả các loại bảng
 * 
 * Quy tắc đánh số:
 * 1. Cluster questions: STT = 0 (không hiển thị)
 * 2. Regular questions: STT bắt đầu từ number của câu hỏi đầu tiên trong bảng
 * 3. Child questions (trong cluster): STT liên tục với regular questions
 * 
 * Các loại bảng:
 * - MAIN: Bảng chính (main questions) - STT bắt đầu từ câu hỏi đầu tiên
 * - SUB_SECTION: Các sub-sections - STT bắt đầu từ câu hỏi đầu tiên trong sub-section
 * - GROUP_TOPIC: Bảng GROUP_TOPIC với subjects - STT bắt đầu từ câu hỏi đầu tiên trong subject
 */

class QuestionNumberingService {
  /**
   * 🎯 MAIN METHOD: Đánh số thống nhất cho TẤT CẢ các bảng
   * @param {Array} questions - Danh sách câu hỏi cần đánh số
   * @param {String} tableType - Loại bảng: 'MAIN' | 'SUB_SECTION' | 'GROUP_TOPIC'
   * @param {Object} options - { sectionId, subSectionId, groupIdx, subjectIdx, tabData, preserveExistingNumbers }
   * @returns {Array} Questions đã được đánh số
   */
  static unifiedQuestionNumbering(questions, tableType, options = {}) {
    const { sectionId, subSectionId, groupIdx, subjectIdx, tabData, preserveExistingNumbers = false } = options;

    if (!Array.isArray(questions) || questions.length === 0) {
      return questions;
    }

    if (tableType === 'GROUP_TOPIC') {
      const startingNumber = this.getGroupTopicStartingNumber(tabData, sectionId, groupIdx, subjectIdx);
      const sortedQuestions = this.sortQuestionsForNumbering(questions);

      let currentNumber = startingNumber;
      const numberedQuestions = [];

      sortedQuestions.forEach((question) => {
        const isCluster = this.isClusterQuestion(question);

        if (isCluster) {
          // Cluster không hiển thị STT
          numberedQuestions.push({
            ...question,
            number: 0,
            question_no: 0,
            code: '0'
          });
        } else {
          const existing = question.number || question.question_no || 0;

          if (preserveExistingNumbers && existing > 0) {
            // Giữ nguyên số đã có và đồng bộ code
            numberedQuestions.push({
              ...question,
              number: existing,
              question_no: existing,
              code: String(existing)
            });
            currentNumber = Math.max(currentNumber, existing + 1);
          } else {
            // Gán số mới từ startingNumber
            numberedQuestions.push({
              ...question,
              number: currentNumber,
              question_no: currentNumber,
              code: String(currentNumber)
            });
            currentNumber++;
          }
        }
      });

      return numberedQuestions;
    }

    // Logic cũ cho các tableType khác
    let currentNumber = QuestionNumberingService.getUnifiedStartingNumber(tableType, options) + 1;
    const processedIds = new Set();
    const result = [];

    // Duyệt qua questions theo thứ tự sort
    const sortedQuestions = QuestionNumberingService.sortQuestionsForNumbering(questions);

    sortedQuestions.forEach((question) => {
      if (processedIds.has(question._id)) {
        return;
      }

      const isCluster = QuestionNumberingService.isClusterQuestion(question);
      const updatedQuestion = { ...question };

      if (isCluster) {
        updatedQuestion.number = 0;
        updatedQuestion.question_no = 0;
      } else {
        // ✅ MỚI: Nếu preserveExistingNumbers và question đã có number > 1, giữ nguyên (number = 1 có thể là default, không preserve)
        if (preserveExistingNumbers && updatedQuestion.number && updatedQuestion.number > 1) {
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

      // Xử lý child questions
      if (isCluster) {
        const childQuestions = questions.filter((q) => q.parentId === question._id);
        childQuestions.forEach((child) => {
          if (processedIds.has(child._id)) {
            return;
          }

          const updatedChild = { ...child };

          // ✅ MỚI: Preserve number cho child nếu có và > 1
          if (preserveExistingNumbers && updatedChild.number && updatedChild.number > 1) {
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

    
    return result;
  }  // ✅ THÊM: Method để lấy starting number cho GROUP_TOPIC
  static getGroupTopicStartingNumber(tabData, sectionId, groupIdx, subjectIdx) {
    if (!tabData || !Array.isArray(tabData)) {
      return 1;
    }

    const currentTab = tabData.find(tab => tab._id === sectionId);
    if (!currentTab || currentTab.exam_section_type !== 'GROUP_TOPIC') {
      return 1;
    }

    const group = currentTab.groupTopic?.[groupIdx];
    const subject = group?.subjects?.[subjectIdx];
    if (!subject || !Array.isArray(subject.questions)) {
      return 1;
    }

    // Lấy số nhỏ nhất > 0 trong subject (bỏ qua cluster)
    const existingNumbers = subject.questions
      .filter(q => !this.isClusterQuestion(q))
      .map(q => (q.number || q.question_no || 0))
      .filter(n => n > 0);

    if (existingNumbers.length > 0) {
      return Math.min(...existingNumbers);
    }
    return 1;
  }

  /**
   * 🎯 Lấy starting number thống nhất cho tất cả loại bảng
   */
  static getUnifiedStartingNumber(tableType, options = {}) {
    const { sectionId, subSectionId, groupIdx, subjectIdx, tabData } = options;

    try {
      const currentTab = tabData?.find((tab) => tab._id === sectionId);

      if (!currentTab) {
        return 0; // Bắt đầu từ 0 (STT hiển thị = 1)
      }

      switch (tableType) {
        case 'MAIN':
          return this.calculateMainTableOffset(currentTab);

        case 'SUB_SECTION':
          return this.calculateSubSectionOffset(currentTab, subSectionId);

        case 'GROUP_TOPIC':
          return this.calculateGroupTopicOffset(currentTab, groupIdx, subjectIdx);

        default:
          return 0;
      }
    } catch (error) {
      console.error('❌ Error calculating unified starting number:', error);
      return 0;
    }
  }

  /**
   * 🎯 Tính offset cho main table
   * Offset = number của câu hỏi đầu tiên hợp lệ - 1
   * ✅ MỚI: Nếu câu hỏi đầu tiên là cluster, dùng number của child đầu tiên
   */
  static calculateMainTableOffset(currentTab) {
    if (!currentTab.questions || currentTab.questions.length === 0) {
      return 0;
    }

    // ✅ MỚI: Kiểm tra câu hỏi đầu tiên
    const firstQuestion = currentTab.questions[0];
    const isFirstCluster = this.isClusterQuestion(firstQuestion);

    if (isFirstCluster) {
      // ✅ Nếu cluster, tìm child đầu tiên của nó
      const firstChild = currentTab.questions.find(
        (q) => q.parentId === firstQuestion._id && (q.number > 0 || q.question_no > 0)
      );

      if (firstChild) {
        const firstChildNumber = firstChild.number || firstChild.question_no || 1;
        return Math.max(0, firstChildNumber - 1); // Offset = firstChildNumber - 1
      }
    }

    // ✅ Logic cũ: Tìm câu hỏi đầu tiên hợp lệ (không cluster, không child)
    const firstQuestionWithNumber = currentTab.questions.find(
      (q) =>
        q.type !== "cluster" &&
        q.type !== "CLUSTER" &&
        q.type !== "Cluster" &&
        !q.parentId &&
        (q.number > 0 || q.question_no > 0)
    );

    if (firstQuestionWithNumber) {
      const firstNumber = firstQuestionWithNumber.number || firstQuestionWithNumber.question_no || 1;
      return Math.max(0, firstNumber - 1);
    }

    return 0;
  }

  /**
   * 🎯 Tính offset cho sub-section
   * Offset = number của câu hỏi đầu tiên hợp lệ trong sub-section - 1
   * ✅ MỚI: Nếu câu hỏi đầu tiên là cluster, dùng number của child đầu tiên
   */
  static calculateSubSectionOffset(currentTab, subSectionId) {
    if (!subSectionId) {
      return 0;
    }

    // Tìm trong subSections
    if (currentTab.subSections && Array.isArray(currentTab.subSections)) {
      const subSection = currentTab.subSections.find(
        (sub) => String(sub.id) === String(subSectionId)
      );

      if (subSection && subSection.questions && subSection.questions.length > 0) {
        // ✅ MỚI: Kiểm tra câu hỏi đầu tiên trong sub-section
        const firstQuestion = subSection.questions[0];
        const isFirstCluster = this.isClusterQuestion(firstQuestion);

        if (isFirstCluster) {
          // ✅ Nếu cluster, tìm child đầu tiên của nó
          const firstChild = subSection.questions.find(
            (q) => q.parentId === firstQuestion._id && (q.number > 0 || q.question_no > 0)
          );

          if (firstChild) {
            const firstChildNumber = firstChild.number || firstChild.question_no || 1;
            return Math.max(0, firstChildNumber - 1);
          }
        }

        // ✅ Logic cũ
        const firstQuestionWithNumber = subSection.questions.find(
          (q) =>
            q.type !== "cluster" &&
            q.type !== "CLUSTER" &&
            q.type !== "Cluster" &&
            !q.parentId &&
            (q.number > 0 || q.question_no > 0)
        );

        if (firstQuestionWithNumber) {
          const firstNumber = firstQuestionWithNumber.number || firstQuestionWithNumber.question_no || 1;
          return Math.max(0, firstNumber - 1);
        }
      }
    }

    // Fallback: tìm trong childExam
    if (currentTab.childExam && Array.isArray(currentTab.childExam)) {
      const childExam = currentTab.childExam.find(
        (child) => String(child.idChildExam) === String(subSectionId)
      );

      if (childExam && childExam.questions && childExam.questions.length > 0) {
        const firstQuestionWithNumber = childExam.questions.find(
          (q) =>
            q.type !== "cluster" &&
            q.type !== "CLUSTER" &&
            q.type !== "Cluster" &&
            !q.parentId &&
            (q.number > 0 || q.question_no > 0)
        );

        if (firstQuestionWithNumber) {
          const firstNumber = firstQuestionWithNumber.number || firstQuestionWithNumber.question_no || 1;
          return Math.max(0, firstNumber - 1);
        }
      }
    }

    return 0;
  }

  /**
   * 🎯 Tính offset cho GROUP_TOPIC
   * ✅ FIX: Mỗi subject trong GROUP_TOPIC luôn bắt đầu từ offset = 0 (STT hiển thị = 1)
   */
  static calculateGroupTopicOffset(currentTab, groupIdx, subjectIdx) {
    if (currentTab.exam_section_type !== 'GROUP_TOPIC') {
      return 0;
    }

    // ✅ FIX: GROUP_TOPIC mỗi subject luôn bắt đầu từ 1, không phụ thuộc vào subject khác
    return 0;
  }

  /**
   * 🎯 Đếm số câu hỏi thực sự (CHỈ tính child questions + regular questions, KHÔNG tính cluster parent)
   */
  static countRealQuestions(questions) {
    if (!Array.isArray(questions)) return 0;

    let count = 0;
    questions.forEach((q) => {
      if (this.isClusterQuestion(q)) {
        // ✅ CHỈ đếm child questions của cluster (không đếm cluster parent)
        const childCount = questions.filter(
          (child) => child.parentId && String(child.parentId) === String(q._id)
        ).length;
        count += childCount;
      } else if (!q.parentId) {
        // ✅ CHỈ đếm regular questions (không phải cluster, không phải child)
        count += 1;
      }
      // ⚠️ KHÔNG đếm child questions ở đây vì đã đếm trong cluster parent
    });
    return count;
  }

  /**
   * 🎯 Sort questions theo thứ tự hiển thị (xen kẽ cluster với regular)
   * Thay đổi: Duyệt theo thứ tự ban đầu, thêm cluster + children ngay khi gặp cluster
   */
  static sortQuestionsForNumbering(questions) {
    const sortedQuestions = [];
    const processedIds = new Set();

    questions.forEach((q) => {
      if (processedIds.has(q._id)) return; // Bỏ qua nếu đã xử lý

      if (!q.parentId && !this.isClusterQuestion(q)) {
        // Regular question: thêm ngay
        sortedQuestions.push(q);
        processedIds.add(q._id);
      } else if (this.isClusterQuestion(q)) {
        // Cluster question: thêm cluster và children ngay sau (xen kẽ)
        sortedQuestions.push(q);
        processedIds.add(q._id);

        // Thêm children ngay sau cluster
        const children = questions.filter((child) => child.parentId === q._id);
        children.forEach((child) => {
          if (!processedIds.has(child._id)) {
            sortedQuestions.push(child);
            processedIds.add(child._id);
          }
        });
      }
      // Bỏ qua children riêng lẻ vì đã thêm với cluster
    });

    return sortedQuestions;
  }

  /**
   * 🎯 Helper: Kiểm tra cluster question
   */
  static isClusterQuestion(question) {
    const type = String(question.type || '').toUpperCase();
    return type === 'CLUSTER' || type === 'CLUSTERCHOICE';
  }

  /**
   * 🧪 Test unified numbering logic với cluster questions
   */
  static testClusterNumbering() {
    console.log('=== TESTING CLUSTER NUMBERING ===');

    // Mock data: 2 regular + 1 cluster (2 children) + 1 regular
    // Thứ tự ban đầu: [Q1, Q2, Cluster1, Child1, Child2, Q3]
    // Thứ tự sau sort (xen kẽ): [Q1, Cluster1, Child1, Child2, Q2, Q3]
    const testQuestions = [
      { _id: 'q1', type: 'SINGLECHOICE', parentId: null }, // Regular 1 → STT 1
      { _id: 'q2', type: 'SINGLECHOICE', parentId: null }, // Regular 2 → STT 2
      { _id: 'cluster1', type: 'CLUSTER', parentId: null }, // Cluster → STT 0
      { _id: 'child1', type: 'SINGLECHOICE', parentId: 'cluster1' }, // Child 1 → STT 3
      { _id: 'child2', type: 'SINGLECHOICE', parentId: 'cluster1' }, // Child 2 → STT 4
      { _id: 'q3', type: 'SINGLECHOICE', parentId: null }, // Regular 3 → STT 5
    ];

    const numbered = this.unifiedQuestionNumbering(testQuestions, 'MAIN', {});

    console.log('Expected: Q1=1, Cluster=0, Child1=3, Child2=4, Q2=5, Q3=6');
    console.log('Actual:');
    numbered.forEach((q) => {
      console.log(
        `  ${q._id}: STT=${q.number}, type=${q.type}, parentId=${q.parentId || 'null'}`
      );
    });

    // Verify
    const expected = [1, 0, 3, 4, 5, 6]; // Xen kẽ: Q1, Cluster, Child1, Child2, Q2, Q3
    const actual = numbered.map((q) => q.number);
    const passed = JSON.stringify(expected) === JSON.stringify(actual);

    console.log(passed ? '✅ TEST PASSED' : '❌ TEST FAILED');
    console.log('=== TEST COMPLETE ===');

    return passed;
  }

  /**
   * 🎯 Lấy STT tiếp theo cho câu hỏi mới trong sub-section
   * @param {Array} tabData - Dữ liệu các tab
   * @param {String} sectionId - ID của section
   * @param {String} subSectionId - ID của sub-section
   * @returns {Number} - STT tiếp theo
   */
  static getNextSubSectionQuestionNumber(tabData, sectionId, subSectionId) {
    if (!Array.isArray(tabData) || !sectionId || !subSectionId) {
      return 1;
    }

    const section = tabData.find((tab) => tab._id === sectionId);
    if (!section) {
      return 1;
    }

    let maxNumber = 0;

    // Tìm số lớn nhất hiện tại trong sub-section
    if (section.subSections && Array.isArray(section.subSections)) {
      const subSection = section.subSections.find(
        (sub) => String(sub.id) === String(subSectionId)
      );

      if (subSection && subSection.questions && Array.isArray(subSection.questions)) {
        subSection.questions.forEach((q) => {
          if (
            q.type !== "cluster" &&
            q.type !== "CLUSTER" &&
            q.type !== "Cluster" &&
            !q.parentId
          ) {
            const questionNumber = q.number || q.question_no || 0;
            if (questionNumber > maxNumber) {
              maxNumber = questionNumber;
            }
          }

          // Kiểm tra child questions trong cluster
          if (this.isClusterQuestion(q)) {
            subSection.questions.forEach((child) => {
              if (child.parentId === q._id) {
                const childNumber = child.number || child.question_no || 0;
                if (childNumber > maxNumber) {
                  maxNumber = childNumber;
                }
              }
            });
          }
        });
      }
    }

    // Fallback: kiểm tra trong childExam
    if (section.childExam && Array.isArray(section.childExam)) {
      const childExam = section.childExam.find(
        (child) => String(child.idChildExam) === String(subSectionId)
      );

      if (childExam && childExam.questions && Array.isArray(childExam.questions)) {
        childExam.questions.forEach((q) => {
          if (
            q.type !== "cluster" &&
            q.type !== "CLUSTER" &&
            q.type !== "Cluster" &&
            !q.parentId
          ) {
            const questionNumber = q.number || q.question_no || 0;
            if (questionNumber > maxNumber) {
              maxNumber = questionNumber;
            }
          }

          // Kiểm tra child questions trong cluster
          if (this.isClusterQuestion(q)) {
            childExam.questions.forEach((child) => {
              if (child.parentId === q._id) {
                const childNumber = child.number || child.question_no || 0;
                if (childNumber > maxNumber) {
                  maxNumber = childNumber;
                }
              }
            });
          }
        });
      }
    }

    return maxNumber + 1;
  }

  /**
   * 🧪 Test countRealQuestions
   */
  static testCountRealQuestions() {
    console.log('=== TESTING COUNT REAL QUESTIONS ===');

    const testQuestions = [
      { _id: 'q1', type: 'SINGLECHOICE', parentId: null }, // +1
      { _id: 'q2', type: 'SINGLECHOICE', parentId: null }, // +1
      { _id: 'cluster1', type: 'CLUSTER', parentId: null }, // +0 (không đếm cluster)
      { _id: 'child1', type: 'SINGLECHOICE', parentId: 'cluster1' }, // +1 (đếm child)
      { _id: 'child2', type: 'SINGLECHOICE', parentId: 'cluster1' }, // +1 (đếm child)
      { _id: 'q3', type: 'SINGLECHOICE', parentId: null }, // +1
    ];

    const count = this.countRealQuestions(testQuestions);
    const expected = 5; // 2 regular + 2 children + 1 regular = 5

    console.log(`Expected: ${expected}`);
    console.log(`Actual: ${count}`);
    console.log(count === expected ? '✅ TEST PASSED' : '❌ TEST FAILED');
    console.log('=== TEST COMPLETE ===');

    return count === expected;
  }

  /**
   * 🎯 Renumber questions sau khi drag & drop (không sort lại, giữ thứ tự reorder)
   * @param {Array} questions - Danh sách câu hỏi đã reorder
   * @returns {Array} Questions đã được đánh số lại
   */
  static renumberAfterReorder(questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
      return questions;
    }

    // ✅ FIX: Tính baseNumber từ số nhỏ nhất của tất cả câu hỏi hiển thị (regular + child),
    // loại trừ cluster parent. Điều này xử lý đúng trường hợp cluster ở đầu bảng.
    const visibleNumbers = questions
        .filter(q => !this.isClusterQuestion(q)) // exclude cluster parent
        .map(q => q.number || q.question_no || 0)
        .filter(n => n > 0);

    const baseNumber = visibleNumbers.length > 0 ? Math.min(...visibleNumbers) : 1;

    let currentNumber = baseNumber;
    const processedIds = new Set();

    questions.forEach((question) => {
      if (processedIds.has(question._id)) return;

      if (this.isClusterQuestion(question)) {
        // Cluster: number = 0
        question.number = 0;
        question.question_no = 0;
        processedIds.add(question._id);

        // Children: đánh số liên tục
        const children = questions.filter(q => q.parentId === question._id);
        children.forEach((child) => {
          if (processedIds.has(child._id)) return;
          child.number = currentNumber;
          child.question_no = currentNumber;
          currentNumber++;
          processedIds.add(child._id);
        });
      } else if (!question.parentId) {
        // Regular question: đánh số liên tục
        question.number = currentNumber;
        question.question_no = currentNumber;
        currentNumber++;
        processedIds.add(question._id);
      }
      // Bỏ qua children riêng lẻ (đã xử lý với cluster)
    });

    return questions;
  }
}

export default QuestionNumberingService;
