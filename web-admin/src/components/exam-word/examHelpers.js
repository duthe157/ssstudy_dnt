// Helper functions for exam management

export const validateApiResponse = (responseData) => {
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
    const text = Array.isArray(part.plainText)
      ? part.plainText[0] || ""
      : part.plainText || "";
    if (text.trim()) {
      return /^PHẦN\s+[IVXLCDM0-9]+\.|^Phần\s+[0-9IVXLCDM]+\./i.test(
        text.trim()
      );
    }
    return Array.isArray(part.questions) && part.questions.length > 0;
  });

  if (validParts.length === 0) {
    warnings.push("Không tìm thấy phần tiêu đề chuẩn trong 'parts' — sẽ thử parse tất cả parts");
    validParts = responseData.parts.slice();
  }

  validParts.forEach((part, sectionIdx) => {
    let rawTitle = Array.isArray(part.plainText)
      ? part.plainText[0]
      : part.plainText || `Phần ${sectionIdx + 1}`;
    let sectionTitle = rawTitle.trim();
    let sectionType = "normal";
    let groupName = "";

    const match = sectionTitle.match(/^Phần\s*([0-9IVXLCDM]+)\.\s*(.*)$/i);
    if (match) {
      const afterDot = match[2]?.trim();
      if (afterDot) {
        sectionType = "group";
        groupName = afterDot;
        sectionTitle = `Phần ${match[1]} - ${groupName}`;
      } else {
        sectionType = "normal";
        sectionTitle = `Phần ${match[1]}`;
      }
    }

    const questions = Array.isArray(part.questions)
      ? part.questions.map((question, qIdx) => {
          const qErrors = [];
          if (!question || typeof question !== "object") {
            qErrors.push(`Question at part ${sectionIdx} index ${qIdx} invalid`);
          }

          const plainText = question?.plainText || "";

          let level = "";
          let questionNo = qIdx + 1;
          if (plainText) {
            const noMatch = plainText.match(/Câu\s*(\d+)/i);
            if (noMatch && noMatch[1]) {
              questionNo = parseInt(noMatch[1], 10);
            }
            const levelMatch = plainText.match(/^\((.*?)\)/);
            if (levelMatch && levelMatch[1]) level = levelMatch[1].trim();
          }

          if (!question.type) {
            let detectedType = "";
            
            const ans = question.correctAnswers || question.answer || question.correctAnswer;
            
            if (plainText.includes("___") || plainText.includes("...") || plainText.includes("[...]")) {
              detectedType = "FILL_IN_BLANK";
            } else if (typeof ans === "string" && ans.length > 50) {
              detectedType = "ESSAY";
            } else if (typeof ans === "boolean" || String(ans).toUpperCase() === "TRUE" || String(ans).toUpperCase() === "FALSE") {
              detectedType = "TRUE_FALSE";
            } else if (Array.isArray(ans) && ans.length > 1) {
              detectedType = "TN_MULTI_CHOICE";
            } else {
              detectedType = "TN_SINGLE_CHOICE";
            }
            
            question.type = detectedType;
            warnings.push(`Part ${sectionIdx} Q${qIdx}: Detected type as ${detectedType} (was missing)`);
          }

          return {
            _id: `${Date.now()}${sectionIdx}${qIdx}`,
            question_no: questionNo,
            code: `${Date.now()}${sectionIdx}${qIdx}`,
            plainText,
            type: question.type || "TN_SINGLE_CHOICE",
            choices: question.choices || [],
            explanation: question.explanation || "",
            video: question.video || "",
            correctAnswers: question.correctAnswers || "",
            images: question.images || [],
            question_level: level,
            doc_link: "",
            video_link: question.video || "",
            created_at: new Date(),
          };
        })
      : [];

    sections.push({
      id: sectionIdx + 1,
      title: sectionTitle,
      content: part.plainText || "",
      type: sectionType,
      groupName,
      questions,
    });
  });

  const valid = errors.length === 0;
  return { valid, errors, warnings, sections };
};

export const convertSectionsToTabData = (sections) => {
  return sections.map((section, index) => ({
    _id: `uploaded-section-${index + 1}`,
    exam_section_name: section.title,
    exam_section_type: section.type === "group" ? "GROUP_SUBJECT" : "DEFAULT",
    questions: section.questions || [],
    exam_section_group: section.type === "group" ? [{
      _id: `group-${index + 1}`,
      name: section.groupName || `Nhóm ${index + 1}`,
      subjects: [{
        subject_id: null,
        subject_name: "",
        questions: section.questions || []
      }]
    }] : null
  }));
};

export const getQuestionNoNew = (tabData, examSectionId, examSectionGroupId, examSectionSubjectId) => {
  try {
    if (!tabData || tabData.length === 0) {
      return 1;
    }
    
    for (let i = 0; i < tabData.length; i++) {
      if (
        tabData[i]._id === examSectionId &&
        tabData[i].exam_section_type === "DEFAULT"
      ) {
        if (tabData[i].questions && tabData[i].questions.length > 0) {
          return tabData[i].questions.length + 1;
        } else {
          return 1;
        }
      } else if (
        tabData[i]._id === examSectionId &&
        tabData[i].exam_section_type === "GROUP_SUBJECT"
      ) {
        for (let j = 0; j < tabData[i].exam_section_group.length; j++) {
          if (tabData[i].exam_section_group[j]._id === examSectionGroupId) {
            for (
              let k = 0;
              k < tabData[i].exam_section_group[j].subjects.length;
              k++
            ) {
              if (
                tabData[i].exam_section_group[j].subjects[k].subject_id ===
                examSectionSubjectId
              ) {
                if (
                  tabData[i].exam_section_group[j].subjects[k].questions &&
                  tabData[i].exam_section_group[j].subjects[k].questions
                    .length > 0
                ) {
                  return (
                    tabData[i].exam_section_group[j].subjects[k].questions
                      .length + 1
                  );
                } else {
                  return 1;
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error get question no new:", error);
  }
  return 1;
};

export const countTotalQuestion = (tab) => {
  let total = 0;
  if (tab.exam_section_type === "DEFAULT") {
    total = tab.questions.length;
  } else {
    for (let i = 0; i < tab.exam_section_group.length; i++) {
      for (let j = 0; j < tab.exam_section_group[i].subjects.length; j++) {
        total += tab.exam_section_group[i].subjects[j].questions.length;
      }
    }
  }
  return total;
};

export const saveTabDataToSession = (examId, tabData) => {
  try {
    const key = `exam_word_tabdata_${examId || 'new'}`;
    const payload = JSON.stringify(tabData || []);
    sessionStorage.setItem(key, payload);
  } catch (e) {
    console.warn('saveTabDataToSession failed', e);
  }
};
