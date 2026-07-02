import React, { useState, useMemo } from "react";
import { WordExamData, ExamQuestion } from "@/types/exam";

interface PartInfoScreenProps {
  examData: WordExamData;
  currentPart: number;
  allQuestions: ExamQuestion[];
  onStartPart: () => void;
  onBackToPrevious?: () => void;
  selectedSubjects?: any[];
  onSubjectSelection?: (selectedSubjects: any[]) => void;
}

const PartInfoScreen: React.FC<PartInfoScreenProps> = ({
  examData,
  currentPart,
  allQuestions,
  onStartPart,
  onBackToPrevious,
  selectedSubjects = [],
  onSubjectSelection,
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [localSelectedSubjects, setLocalSelectedSubjects] = useState<any[]>(
    selectedSubjects || []
  );

  // Sync with parent component when selectedSubjects prop changes
  React.useEffect(() => {
    setLocalSelectedSubjects(selectedSubjects || []);
  }, [selectedSubjects]);

  const handleStartPart = () => {
    setIsStarting(true);
    onStartPart();
  };

  // Get available groups from the current part với logic tính câu hỏi
  const availableGroups = useMemo(() => {
    const currentPartData = examData.parts?.[currentPart];
    if (!currentPartData?.subpart || !Array.isArray(currentPartData.subpart)) {
      return [];
    }

    return currentPartData.subpart.map((group: any) => ({
      _id: group._id,
      name: group.name,
      maxSubject: group.maxSubject || 1,
      children:
        group.children?.map((subject: any) => {
          //  Chỉ tính câu hỏi hợp lệ:
          // - Câu hỏi bình thường (number > 0)
          // - Câu hỏi con của câu hỏi chùm (number > 0)
          // - KHÔNG tính đề bài câu hỏi chùm (type: "cluster" và parentId: null)
          const questionCount =
            subject.questions?.filter((q: any) => {
              const questionNumber = q.number || 0;
              const questionType = q.question?.type || "";
              const parentId = q.question?.parentId;

              // Bỏ qua đề bài câu hỏi chùm
              if (questionType === "cluster" && parentId === null) {
                return false;
              }

              return questionNumber > 0;
            }).length || 0;

          return {
            _id: subject._id,
            name: subject.name,
            time: subject.time || 0,
            score: subject.score || 0,
            questions: subject.questions || [],
            questionCount: questionCount,
          };
        }) || [],
    }));
  }, [examData.parts, currentPart]);

  // Handle group selection (radio button behavior)
  const handleGroupSelection = (group: any) => {
    setSelectedGroup(group._id);
    // Nếu nhóm chỉ có 1 môn: tự động chọn môn đó để bỏ bước chọn thêm
    if (Array.isArray(group.children) && group.children.length === 1) {
      const onlySubject = group.children[0];
      setLocalSelectedSubjects([onlySubject]);
      if (onSubjectSelection) onSubjectSelection([onlySubject]);
      return;
    }
    // Ngược lại: xóa lựa chọn để người dùng chọn các môn theo ý muốn
    setLocalSelectedSubjects([]);
    if (onSubjectSelection) onSubjectSelection([]);
  };

  // Handle start with subject selection
  const handleStartWithSubjects = () => {
    // Require exact selection count equals maxSubject for selected group
    const selGroup = availableGroups.find((g: any) => g._id === selectedGroup);
    const requiredCount = selGroup?.maxSubject ?? 1;
    if (localSelectedSubjects.length !== requiredCount) {
      return;
    }
    if (localSelectedSubjects.length > 0 && onSubjectSelection) {
      onSubjectSelection(localSelectedSubjects);
    }
    setIsStarting(true);
    onStartPart();
  };

  // Memoize các giá trị tính toán
  const partInfo = useMemo(() => {
    const currentPartData = examData.parts?.[currentPart];

    const getPartName = () => {
      return currentPartData?.name || `Phần ${currentPart + 1}`;
    };

    const getPartQuestions = () => {
      if (!currentPartData) return 0;

      if (currentPartData?.subpart && Array.isArray(currentPartData.subpart)) {
        let totalValidQuestions = 0;

        currentPartData.subpart.forEach((group: any) => {
          if (group.children && Array.isArray(group.children)) {
            group.children.forEach((subject: any) => {
              if (subject.questions && Array.isArray(subject.questions)) {
                //  Chỉ tính câu hỏi hợp lệ:
                // - Câu hỏi bình thường (number > 0)
                // - Câu hỏi con của câu hỏi chùm (number > 0)
                // - KHÔNG tính đề bài câu hỏi chùm (type: "cluster" và parentId: null)
                const validQuestions = subject.questions.filter((q: any) => {
                  const questionNumber = q.number || 0;
                  const questionType = q.question?.type || "";
                  const parentId = q.question?.parentId;

                  // Bỏ qua đề bài câu hỏi chùm
                  if (questionType === "cluster" && parentId === null) {
                    return false;
                  }

                  return questionNumber > 0;
                }).length;

                totalValidQuestions += validQuestions;
              }
            });
          }
        });

        return totalValidQuestions;
      }

      const partDataWithTotal = currentPartData as any;
      if (
        partDataWithTotal?.totalquestions &&
        typeof partDataWithTotal.totalquestions === "number"
      ) {
        return partDataWithTotal.totalquestions;
      }

      const partId =
        currentPartData.id || currentPartData._id || `part_${currentPart}`;
      //  Chỉ tính câu hỏi hợp lệ (bỏ qua đề bài câu hỏi chùm)
      return allQuestions.filter((q) => {
        const questionNumber = (q as any).number || 0;
        const questionType = (q as any).question?.type || "";
        const parentId = (q as any).question?.parentId;

        // Bỏ qua đề bài câu hỏi chùm
        if (questionType === "cluster" && parentId === null) {
          return false;
        }

        return q.__partId === partId && questionNumber > 0;
      }).length;
    };

    const getSelectedSubjectsInfo = () => {
      if (currentPartData?.type === "NHOM_CHU_DE") {
        //  Tính lại tổng số câu với logic lọc câu hỏi đúng
        const totalQuestions = localSelectedSubjects.reduce(
          (total, subject) => {
            if (!subject.questions || !Array.isArray(subject.questions)) {
              return total;
            }

            // Chỉ tính câu hỏi hợp lệ (bỏ qua đề bài câu hỏi chùm)
            const validQuestions = subject.questions.filter((q: any) => {
              const questionNumber = q.number || 0;
              const questionType = q.question?.type || "";
              const parentId = q.question?.parentId;

              // Bỏ qua đề bài câu hỏi chùm
              if (questionType === "cluster" && parentId === null) {
                return false;
              }

              return questionNumber > 0;
            }).length;

            return total + validQuestions;
          },
          0
        );

        const totalTime = localSelectedSubjects.reduce(
          (total, subject) => total + (subject.time || 0),
          0
        );

        return {
          isSubjectGroup: true,
          subjects: localSelectedSubjects,
          totalQuestions,
          totalTime,
        };
      }
      return { isSubjectGroup: false };
    };

    const getPartTime = () => {
      //  NHOM_CHU_DE: luôn sử dụng thời gian của chính phần thi (part.time)
      if (currentPartData?.type === "NHOM_CHU_DE") {
        const t = Number(currentPartData?.time) || 0;
        return t > 0 ? t : 30;
      }

      if (currentPartData?.time && currentPartData.time > 0) {
        return currentPartData.time;
      }

      if (currentPartData?.subpart && currentPartData.subpart.length > 0) {
        let totalTime = 0;
        for (const subpart of currentPartData.subpart) {
          if (subpart.children && subpart.children.length > 0) {
            for (const child of subpart.children) {
              if (child.time && child.time > 0) {
                totalTime += child.time;
              }
            }
          }
        }
        if (totalTime > 0) return totalTime;
      }

      if (examData.time && examData.parts && examData.parts.length > 0) {
        return Math.floor(examData.time / examData.parts.length);
      }

      return 30;
    };

    //  Trả về thông tin chi tiết từng môn thay vì tổng
    const getSelectedSubjectsDetailInfo = () => {
      if (
        currentPartData?.type === "NHOM_CHU_DE" &&
        localSelectedSubjects.length > 0
      ) {
        return localSelectedSubjects.map((subject) => {
          if (!subject.questions || !Array.isArray(subject.questions)) {
            return {
              name: subject.name,
              questionCount: 0,
              time: subject.time || 0,
            };
          }

          // Chỉ tính câu hỏi hợp lệ (bỏ qua đề bài câu hỏi chùm)
          const validQuestions = subject.questions.filter((q: any) => {
            const questionNumber = q.number || 0;
            const questionType = q.question?.type || "";
            const parentId = q.question?.parentId;

            // Bỏ qua đề bài câu hỏi chùm
            if (questionType === "cluster" && parentId === null) {
              return false;
            }

            return questionNumber > 0;
          });

          return {
            name: subject.name,
            questionCount: validQuestions.length,
            time: subject.time || 0,
          };
        });
      }
      return [];
    };

    const getTotalQuestions = () => {
      if (
        currentPartData?.type === "NHOM_CHU_DE" &&
        localSelectedSubjects.length > 0
      ) {
        //  Tính lại tổng số câu với logic lọc câu hỏi đúng
        return localSelectedSubjects.reduce((total, subject) => {
          if (!subject.questions || !Array.isArray(subject.questions)) {
            return total;
          }

          // Chỉ tính câu hỏi hợp lệ (bỏ qua đề bài câu hỏi chùm)
          const validQuestions = subject.questions.filter((q: any) => {
            const questionNumber = q.number || 0;
            const questionType = q.question?.type || "";
            const parentId = q.question?.parentId;

            // Bỏ qua đề bài câu hỏi chùm
            if (questionType === "cluster" && parentId === null) {
              return false;
            }

            return questionNumber > 0;
          }).length;

          return total + validQuestions;
        }, 0);
      }

      return getPartQuestions();
    };

    const getTotalTime = () => {
      return getPartTime();
    };

    const getCategoryName = () => {
      const categoryExam = (examData as any)?.categoryExam;
      if (categoryExam?.populate_id?.name) {
        return categoryExam.populate_id.name;
      }
      if (categoryExam?.name) {
        return categoryExam.name;
      }
      return "Đánh giá năng lực";
    };

    const getExamName = () => {
      return examData.name || "Thi thử tốt nghiệp năm 2024";
    };

    return {
      partName: getPartName(),
      partQuestions: getPartQuestions(),
      partTime: getPartTime(),
      totalQuestions: getTotalQuestions(),
      totalTime: getTotalTime(),
      categoryName: getCategoryName(),
      examName: getExamName(),
      selectedSubjectsInfo: getSelectedSubjectsDetailInfo(),
      isSubjectGroup: currentPartData?.type === "NHOM_CHU_DE",
    };
  }, [examData, currentPart, allQuestions, localSelectedSubjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 h-40 w-40 sm:h-44 sm:w-44 md:h-48 md:w-48 lg:h-56 lg:w-56">
            <img
              src="/icon/icon-dongho.svg"
              alt="Đồng hồ thi"
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>

          <h1 className="mb-1 text-2xl font-bold text-blue-600 sm:text-3xl">
            Bạn đã sẵn sàng làm phần {currentPart + 1}?
          </h1>
          <p className="text-sm text-gray-500">
            Bài thi sẽ bắt đầu tính giờ khi bạn xác nhận
          </p>
        </div>

        {/* Exam Info Card */}
        <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-100 p-4 text-center">
            <div className="text-xs font-semibold text-blue-600">
              {partInfo.categoryName}
            </div>
            <div className="mt-1 text-base font-semibold text-gray-900">
              {partInfo.examName}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-10 px-4 pb-3 pt-4 text-sm">
            <div className="inline-flex items-center gap-2 text-gray-700">
              <img
                src="/icon/question.svg"
                alt="Số câu"
                className="h-5 w-5"
                loading="lazy"
              />
              <span className="text-gray-600">Tổng số câu:</span>
              <span className="font-semibold text-gray-900">
                {partInfo.isSubjectGroup
                  ? localSelectedSubjects.length > 0
                    ? `${partInfo.totalQuestions} câu`
                    : "Chọn phần thi "
                  : `${partInfo.totalQuestions} câu`}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-gray-700">
              <img
                src="/icon/time.svg"
                alt="Thời gian"
                className="h-5 w-5"
                loading="lazy"
              />
              <span className="text-gray-600">Thời gian:</span>
              <span className="font-semibold text-gray-900">
                {partInfo.isSubjectGroup
                  ? localSelectedSubjects.length > 0
                    ? `${partInfo.totalTime} phút`
                    : "Chọn phần thi "
                  : `${partInfo.totalTime} phút`}
              </span>
            </div>
          </div>

          {/* Subject Group Selection for NHOM_CHU_DE*/}
          {partInfo.isSubjectGroup ? (
            <div className="px-4 pb-4">
              {/* Instruction */}
              <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-center text-sm text-blue-700">
                Hãy chọn một trong các phần thi sau đây
              </div>

              {/* Group Selection - Horizontal buttons that auto-adjust */}
              <div className="mb-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {availableGroups.map((group) => {
                    const isGroupSelected = selectedGroup === group._id;

                    return (
                      <button
                        key={group._id}
                        onClick={() => handleGroupSelection(group)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
            ${
              isGroupSelected
                ? "bg-blue-500 text-white border-blue-500 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
                      >
                        <div className="font-medium">{group.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Selection - Horizontal buttons that auto-adjust */}
              {selectedGroup &&
                (() => {
                  const selGroup = availableGroups.find(
                    (g) => g._id === selectedGroup
                  );
                  const childCount = selGroup?.children?.length || 0;
                  if (childCount <= 1) {
                    // Nhóm có 1 môn — auto chọn, nhưng không hiển thị gì thêm
                    return null;
                  }
                  return (
                    <div className="mb-4">
                      <div className="mb-3 text-sm font-medium text-gray-700 text-center">
                        Thí sinh lựa chọn{" "}
                        {availableGroups.find((g) => g._id === selectedGroup)
                          ?.maxSubject || 1}{" "}
                        trong tổng số{" "}
                        {availableGroups.find((g) => g._id === selectedGroup)
                          ?.children.length || 0}{" "}
                        chủ đề
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {availableGroups
                          .find((g) => g._id === selectedGroup)
                          ?.children.map((subject: any) => {
                            const isSelected = localSelectedSubjects.some(
                              (s) => s._id === subject._id
                            );

                            const questionCount = subject.questionCount || 0;
                            const time = subject.time || 0;

                            return (
                              <button
                                key={subject._id}
                                className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                  isSelected
                                    ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                }`}
                                onClick={() => {
                                  if (isSelected) {
                                    const newSubjects =
                                      localSelectedSubjects.filter(
                                        (s) => s._id !== subject._id
                                      );
                                    setLocalSelectedSubjects(newSubjects);
                                    if (onSubjectSelection) {
                                      onSubjectSelection(newSubjects);
                                    }
                                  } else {
                                    const group = availableGroups.find(
                                      (g) => g._id === selectedGroup
                                    );
                                    if (
                                      group &&
                                      localSelectedSubjects.length <
                                        group.maxSubject
                                    ) {
                                      const newSubjects = [
                                        ...localSelectedSubjects,
                                        subject,
                                      ];
                                      setLocalSelectedSubjects(newSubjects);
                                      if (onSubjectSelection) {
                                        onSubjectSelection(newSubjects);
                                      }
                                    }
                                  }
                                }}
                              >
                                <div className="font-medium">
                                  {subject.name}
                                </div>
                                {/* <div className="text-xs opacity-80">
                              {questionCount} câu • {time} phút
                            </div> */}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()}

              <div className="mt-4 border-b border-gray-200" />
            </div>
          ) : (
            /* Part Details for non-NHOM_CHU_DE */
            <div className="px-4 pb-4">
              <div className="mb-2 grid grid-cols-2 rounded-md bg-blue-50 py-3 text-sm text-gray-600">
                <span className="text-center">Phần thi</span>
                <span className="text-center font-medium">Số lượng câu</span>
              </div>

              <div className="grid grid-cols-2 items-center py-3 text-sm">
                <div className="truncate text-center text-blue-600">
                  {partInfo.partName}
                </div>
                <div className="text-center font-semibold text-blue-600">
                  {partInfo.partQuestions} câu
                </div>
              </div>

              <div className="border-b border-gray-200" />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mx-auto mt-6 max-w-xl">
          <button
            onClick={
              partInfo.isSubjectGroup
                ? handleStartWithSubjects
                : handleStartPart
            }
            disabled={
              isStarting ||
              (partInfo.isSubjectGroup &&
                (() => {
                  const selGroup = availableGroups.find(
                    (g: any) => g._id === selectedGroup
                  );
                  const requiredCount = selGroup?.maxSubject ?? 1;
                  return localSelectedSubjects.length !== requiredCount;
                })())
            }
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Bắt đầu phần thi ${currentPart + 1}`}
          >
            {isStarting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang bắt đầu...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Bắt đầu thi
                <span aria-hidden="true">›</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartInfoScreen;
