import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import baseHelpers from '../../helpers/BaseHelpers';

class QuestionTable extends React.Component {
  renderQuestionType = (type) => {
    switch (type) {
      case "TN_SINGLE_CHOICE":
        return "TRẮC NGHIỆM";
      case "TN_TRUE_FALSE":
        return "TRẮC NGHIỆM ĐÚNG SAI";
      case "ESSAY":
        return "ĐIỀN SỐ/TRẢ LỜI NGẮN";
      case "DRAG_DROP":
        return "KÉO THẢ";
      case "TN_MULTI_CHOICE":
        return "TRẮC NGHIỆM NHIỀU ĐÁP ÁN";
      case "TRUE_FALSE":
        return "ĐÚNG SAI";
      default:
        return type;
    }
  };

  renderQuestionLevel = (level) => {
    switch (level) {
      case "NB":
        return "Nhận biết";
      case "TH":
        return "Thông hiểu";
      case "VD":
        return "Vận dụng";
      case "VDC":
        return "Vận dụng cao";
      default:
        return level;
    }
  };

  formatAnswer = (val, questionType = "") => {
    if (val === null || val === undefined) return "";

    const isMultipleChoice = questionType && (
      questionType.toUpperCase().includes("MULTI") ||
      questionType.toUpperCase().includes("MULTIPLE") ||
      questionType === "TN_MULTI_CHOICE"
    );

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

      return s;
    }

    if (typeof val === "object") {
      if ("value" in val) return this.formatAnswer(val.value, questionType);
      if ("label" in val) return this.formatAnswer(val.label, questionType);
      try {
        return String(val);
      } catch (e) {
        return "";
      }
    }

    return String(val);
  };

  createRow = (question, index) => {
    return (
      <tr className="v-middle table-row-item" key={question._id || question.id || question.code || index}>
        <td className="text-left p-sm-1">Câu {question.question_no}</td>
        <td className="text-left p-sm-1">{question.code}</td>
        <td className="text-left p-sm-1">
          {question.correctAnswers ? (
            Array.isArray(question.correctAnswers) ? (
              typeof question.correctAnswers[0] === "object" &&
              "label" in question.correctAnswers[0] &&
              "value" in question.correctAnswers[0] ? (
                <span>
                  {question.correctAnswers
                    .map((c) => this.formatAnswer(c.value, question.type))
                    .join(", ")}
                </span>
              ) : (
                <span>
                  {question.correctAnswers
                    .map((c) => this.formatAnswer(c, question.type))
                    .join(", ")}
                </span>
              )
            ) : (
              <span>{this.formatAnswer(question.correctAnswers, question.type)}</span>
            )
          ) : (
            <span>Không có đáp án</span>
          )}
        </td>
        <td className="text-center p-sm-1">
          {this.renderQuestionType(question.type)}
        </td>
        <td className="text-center p-sm-1">
          {this.renderQuestionLevel(question.question_level)}
        </td>
        <td className="text-center p-sm-1">
          <div style={{ textAlign: "left" }}>
            {question.explanation ? (
              <div>
                <span>{baseHelpers.truncateText(question.explanation)}</span>
              </div>
            ) : (
              <span style={{ color: "#888" }}>Không có lời giải</span>
            )}
          </div>
        </td>
        <td className="text-center p-sm-1">
          {question.video && question.video.split(":")[1]?.trim() ? (
            (() => {
              const videoValue = question.video.split(":")[1].trim();
              const isLink =
                videoValue.startsWith("http://") ||
                videoValue.startsWith("https://");
              return isLink ? (
                <a href={videoValue} target="_blank" rel="noopener noreferrer">
                  {videoValue}
                </a>
              ) : (
                <span>{videoValue}</span>
              );
            })()
          ) : (
            <span>Không có video</span>
          )}
        </td>
        <td className="text-left p-sm-1">
          {question.created_at
            ? baseHelpers.formatDateToString(question.created_at)
            : null}
        </td>
        <td className="text-right p-sm-1">
          <div className="item-action">
            <a
              className="mr-14"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                this.props.onEditQuestion(question);
              }}
              title="Chỉnh sửa"
            >
              <img src="/assets/img/icon-edit.svg" alt="" />
            </a>
            <a
              onClick={() => this.props.onDeleteQuestion(question._id)}
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
    );
  };

  render() {
    const { questions, onDragEnd, droppableId } = this.props;

    if (!questions || questions.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="text-center">
            Chưa có câu hỏi nào!
          </td>
        </tr>
      );
    }

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={droppableId || "droppable"}>
          {(provided, snapshot) => (
            <tbody
              ref={provided.innerRef}
              style={{
                background: snapshot.isDragging ? "#e8f0fe" : "none",
              }}
            >
              {questions
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((question, i) => this.createRow(question, i))}
              {provided.placeholder}
            </tbody>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

export default QuestionTable;
