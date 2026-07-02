// Export all question components
export { default as TnSingleChoice } from "./TnSingleChoice";
export { default as TnMultiChoice } from "./TnMultiChoice";
export { default as TrueFalse } from "./TrueFalse";
export { default as TnTrueFalse } from "./TnTrueFalse";
export { default as ShortAnswer } from "./ShortAnswer";
export { default as FillBlank } from "./FillBlank";
export { default as ClusterQuestion } from "./Cluster";
export { default as Essay } from "./Essay";
export { default as DropDragChoice } from "./DragDrop";

// Mapping các loại câu hỏi với component tương ứng
export const QUESTION_TYPE_COMPONENTS = {
  TN_SINGLE_CHOICE: "TnSingleChoice",
  TN_MULTI_CHOICE: "TnMultiChoice",
  TRUE_FALSE: "TrueFalse",
  TRUE_FALSE_STATEMENTS: "TnTrueFalse",
  TN_TRUE_FALSE: "TnTrueFalse",
  FILL_BLANK: "FillBlank",
  SHORT_ANSWER: "ShortAnswer",
  ESSAY: "Essay",
  DRAG_DROP: "DropDragChoice",
  CLUSTER_QUESTION: "ClusterQuestion",
  // Thêm mapping cho các loại cũ để backward compatibility
  SINGLE_CHOICE: "TnSingleChoice",
  MULTIPLE_CHOICE: "TnMultiChoice",
};

// Helper function để lấy component dựa trên loại câu hỏi
export const getQuestionComponent = (questionType: string) => {
  return (
    QUESTION_TYPE_COMPONENTS[
      questionType as keyof typeof QUESTION_TYPE_COMPONENTS
    ] || "TnSingleChoice"
  );
};
