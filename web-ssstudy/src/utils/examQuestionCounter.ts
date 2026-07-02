/**
 * Utility functions for calculating exam question counts consistently
 * across ready screen and exam progress
 */

export interface ExamData {
  total_questions?: number;
  number_of_questions?: number;
  questions?: any[];
  parts?: any[];
}

/**
 * Calculate total questions by summing totalquestions from all parts
 * This ensures consistency between ready screen and exam progress
 */
export function calculateTotalQuestionsFromParts(examData: ExamData): number {
  if (!examData) return 0;

  // Ready screen rule: If parts exist, compute from parts with special handling
  if (Array.isArray(examData.parts) && examData.parts.length > 0) {
    return examData.parts.reduce((total: number, part: any) => {
      // Special rule: NHOM_CHU_DE is always counted as 50 questions
      if (String(part?.type).toUpperCase() === "NHOM_CHU_DE") {
        return total + 50;
      }

      // Prefer explicit totalquestions when available
      if (
        typeof part?.totalquestions === "number" &&
        part.totalquestions >= 0
      ) {
        return total + part.totalquestions;
      }

      // Fallback: derive from nested structure
      const subparts = Array.isArray(part?.subpart) ? part.subpart : [];
      const questionsInPart = subparts.reduce(
        (partTotal: number, subpart: any) => {
          const children = Array.isArray(subpart?.children)
            ? subpart.children
            : [];
          return (
            partTotal +
            children.reduce((childTotal: number, child: any) => {
              const questions = Array.isArray(child?.questions)
                ? child.questions
                : [];
              return childTotal + questions.length;
            }, 0)
          );
        },
        0
      );
      return total + questionsInPart;
    }, 0);
  }

  // If no parts, fall back to top-level provided totals
  if (
    typeof examData.total_questions === "number" &&
    examData.total_questions > 0
  ) {
    return examData.total_questions;
  }
  if (
    typeof examData.number_of_questions === "number" &&
    examData.number_of_questions > 0
  ) {
    return examData.number_of_questions;
  }

  // Fallback to direct questions array
  if (Array.isArray(examData.questions)) {
    return examData.questions.length;
  }

  return 0;
}

/**
 * Get unified question count that works for both ready screen and exam progress
 * This is the main function to use for consistent question counting
 */
export function getUnifiedQuestionCount(examData: ExamData): number {
  return calculateTotalQuestionsFromParts(examData);
}

/**
 * Calculate total questions from question groups (used in exam progress)
 * This matches the logic in WordExamViewer's getCurrentPartProgress
 */
export function calculateTotalQuestionsFromGroups(
  questionGroups: any[]
): number {
  if (!Array.isArray(questionGroups)) return 0;

  return questionGroups.reduce((sum, group) => {
    if (group.type === "cluster") {
      // Cluster: đếm các câu hỏi con, trừ câu đầu tiên là đề bài
      return sum + Math.max(0, group.questions.length - 1);
    } else {
      // Single question
      return sum + group.questions.length;
    }
  }, 0);
}

/**
 * Convert exam data to question groups format for consistent calculation
 * This helps bridge the gap between different data structures
 */
export function convertExamDataToQuestionGroups(examData: ExamData): any[] {
  if (!examData) return [];

  const groups: any[] = [];

  if (examData.parts && Array.isArray(examData.parts)) {
    examData.parts.forEach((part: any) => {
      const subparts = Array.isArray(part.subpart) ? part.subpart : [];
      subparts.forEach((subpart: any) => {
        const children = Array.isArray(subpart.children)
          ? subpart.children
          : [];
        children.forEach((child: any) => {
          const questions = Array.isArray(child.questions)
            ? child.questions
            : [];
          if (questions.length > 0) {
            groups.push({
              type: "single", // Treat as single questions for now
              questions: questions,
            });
          }
        });
      });
    });
  } else if (Array.isArray(examData.questions)) {
    groups.push({
      type: "single",
      questions: examData.questions,
    });
  }

  return groups;
}
