import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listChapter } from "../../redux/chapter/action";
import { listSubject } from "../../redux/subject/action";
import { listCategory } from "../../redux/category/action";
import { createQuestion, uploadImage, listQuestion } from "../../redux/question/action";
import { setLoader } from "../LoadingContext";
import $ from "jquery";

import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";

class ModalQuestion4 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questionNo: 1,
      type: "DRAG_DROP",
      question_answer: [
        {
          id: 0,
          answer: null,
          question: null,
        },
      ],
      question: null,
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "NHAN_BIET",
      content: "",
      content1: "",
      actionQuestion: "create",
      currentQuestionvalue: null,
    };
    this.editorRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { questionNo, actionQuestion, currentQuestionvalue } = this.props;

    if (prevProps.questionNo !== questionNo) {
      this.setState({ questionNo });
    }

    if (prevProps.actionQuestion !== actionQuestion) {
      this.setState({ actionQuestion });
    }

    if (prevProps.currentQuestionvalue !== currentQuestionvalue && currentQuestionvalue) {
      const { answer, answer_content, doc_link, video_link, question_no } = currentQuestionvalue || {};
      const question_answer = Array.isArray(answer)
        ? answer.map((item, index) => ({ id: index, answer: item.value, question: item.key }))
        : [{ id: 0, answer: null, question: null }];

      this.setState({
        currentQuestionvalue,
        answer_content: answer_content || null,
        doc_link: doc_link || "",
        video_link: video_link || "",
        question_answer,
        questionNo: question_no || questionNo || 1,
        content1: answer_content || ""
      });
    }
  }

  componentDidMount() {
    this.resetState();
    // Khi component được mount, thêm sự kiện lắng nghe để reset state khi modal hiển thị
    $(document).on('show.bs.modal', '#modalQuestion4, #create4', () => {
      if (this.props.actionQuestion === 'create') {
        this.resetState();
        this.resetEditorContent();
      }
    });
    
    // Thêm sự kiện lắng nghe khi modal đóng
    $(document).on('hide.bs.modal', '#modalQuestion4, #create4', () => {
      this.resetEditorContent();
      this.resetState();
    });
  }

  componentWillUnmount() {
    // Xóa sự kiện lắng nghe khi component bị hủy
    $(document).off('show.bs.modal', '#modalQuestion4, #create4');
    $(document).off('hide.bs.modal', '#modalQuestion4, #create4');
  }
  
  // Phương thức đặt lại nội dung của Editor
  resetEditorContent = () => {
    this.setState({ content1: "" });
    if (this.editorRef && this.editorRef.current && this.editorRef.current.editor) {
      this.editorRef.current.editor.setContent('');
    }
  }

  // Phương thức đặt lại state về giá trị mặc định
  resetState = () => {
    this.setState({
      questionNo: this.props.questionNo || 1,
      type: "DRAG_DROP",
      question_answer: [
        {
          id: 0,
          answer: null,
          question: null,
        },
      ],
      question: null,
      answer_content: null,
      doc_link: "",
      video_link: "",
      level: "NHAN_BIET",
      content: "",
      content1: "",
      actionQuestion: "create",
      currentQuestionvalue: null,
    });
  }

  handleInputChange = (id, value, type) => {
    this.setState((prevState) => ({
      question_answer: prevState.question_answer.map((row) =>
        row.id === id ? { ...row, [type]: value } : row
      ),
    }));
  };

  createRowData = () => {
    this.setState((prevState) => ({
      question_answer: [
        ...prevState.question_answer,
        { id: prevState.question_answer.length, answer: "", question: "" },
      ],
    }));
  };

  deleteRowData = (id) => {
    this.setState((prevState) => ({
      question_answer: prevState.question_answer.filter((row) => row.id !== id),
    }));
  };

  handleSave = async (e) => {
    e.preventDefault();
    setLoader(true);

    const { examId, examSectionId, examSectionGroupId, examSectionSubjectId, actionCreateQuestion, actionUpdateQuestion } = this.props;
    const { question_answer, content1, type, doc_link, video_link, questionNo, actionQuestion, currentQuestionvalue } = this.state;

    const question = {
      exam_id: examId,
      exam_section_id: examSectionId || null,
      exam_section_group_id: examSectionGroupId || null,
      subject_id: examSectionSubjectId || null,
      answer: question_answer.map((item) => ({ key: item.question, value: item.answer })),
      answer_content: content1,
      type,
      doc_link,
      video_link,
      question_no: questionNo,
    };

    if (actionQuestion === "create") {
      actionCreateQuestion(question);
    } else {
      actionUpdateQuestion({ ...question, question_id: currentQuestionvalue._id });
    }

    this.closeModal();
    setLoader(false);
  };

  closeModal = () => {
    // Đặt lại state và nội dung Editor trước khi đóng modal
    this.resetEditorContent();
    this.resetState();
    $("#close_create_4").trigger("click");
  };

  _handleEditorContent1Change = (content) => {
    this.setState({content1: content});
  };

  handleImageUploadBefore = async (files, info, uploadHandler) => {
    const data = new FormData();
    data.append("files", files[0]);

    await this.props.uploadImage(data);
    const response = {
      result: [{
        url: this.props.image,
        name: files[0].name,
        size: files[0].size
      }]
    };
    await uploadHandler(response);
  };

  render() {
    const { question_answer, content1, doc_link, video_link, questionNo, actionQuestion } = this.state;

    return (
      <div className="block-content">
        <div className="row">
          <div className="col-1 col-form-div">
            <label className="col-form-label">Câu</label>
          </div>
          <div className="col-2 col-form-div">
            <input
              type="text"
              className="form-control"
              name="questionNo"
              onChange={(e) => this.setState({ questionNo: e.target.value })}
              value={questionNo}
            />
          </div>
        </div>

        <div className="row" id="list-data-answer">
          <div className="col-2 col-form-div">
            <label className="col-form-label">Đáp án</label>
          </div>
          <div className="col-10 row">
            {question_answer.map((row, index) => (
              <div className="list-data col-sm-12 row" key={row.id}>
                <div className="col-sm-5">
                  <input
                    placeholder="Vị Trí thả"
                    type="text"
                    className="form-control"
                    value={row.question}
                    onChange={(e) => this.handleInputChange(row.id, e.target.value, "question")}
                  />
                </div>
                <div className="col-sm-5">
                  <input
                    placeholder="Đáp án"
                    type="text"
                    className="form-control"
                    value={row.answer}
                    onChange={(e) => this.handleInputChange(row.id, e.target.value, "answer")}
                  />
                </div>
                <div className="col-sm-2 list-actions p-0">
                  {question_answer.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={() => this.deleteRowData(row.id)}
                    >
                      <i className="icon-delete"></i>
                    </button>
                  )}
                  {index === question_answer.length - 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={this.createRowData}
                    >
                      <i className="icon-add-lesson"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <label className="title-block">Lời giải</label>
            <SunEditor
                ref={this.editorRef}
                onImageUploadBefore={this.handleImageUploadBefore}
                height= {'400px'}
                setContents={this.state.content1}
                onChange={this._handleEditorContent1Change}
                setOptions={{
                  buttonList: baseHelpers.getSunEditorOptions(),
                  katex: katex,
                }}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <label className="col-form-label">Tài liệu tham khảo</label>
            <input
              type="text"
              className="form-control"
              name="doc_link"
              onChange={(e) => this.setState({ doc_link: e.target.value })}
              value={doc_link}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <label className="col-form-label">Video tham khảo</label>
            <input
              type="text"
              className="form-control"
              name="video_link"
              onChange={(e) => this.setState({ video_link: e.target.value })}
              value={video_link}
            />
          </div>
        </div>

        <div className="form-group row">
          <div className="col-sm-12 text-right">
            <button
              className="btn btn-primary mt-2 ml-2"
              onClick={this.handleSave}
            >
              {actionQuestion === "create" ? "Lưu & Thêm mới" : "Cập nhật"}
            </button>
            <button
              className="btn btn-light mt-2 ml-2"
              data-dismiss="modal"
              id="close_create_4"
              onClick={this.closeModal}
            >
              Bỏ qua
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  subjects: state.subject.subjects,
  chapters: state.chapter.chapters,
  categories: state.category.categories,
  redirect: state.question.redirect,
  image: state.question.image,
  question: state.question.question,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listSubject,
      listChapter,
      listCategory,
      createQuestion,
      uploadImage,
      listQuestion,
    },
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ModalQuestion4));
