import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Select, Radio } from "antd";

import { listSubject } from "../../redux/subject/action";
import { listChapter } from "../../redux/chapter/action";
import { listCategory } from "../../redux/category/action";
import { listClassroom } from "../../redux/classroom/action";
import {
  createQuestion,
  updateQuestion,
  showQuestion,
  listQuestion,
  uploadImage,
} from "../../redux/question/action";
import { isUndefined } from "util";
import AddClassroom from "./AddClassroom";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";


const { Option } = Select;

class QuestionEdit extends Component {
  constructor(props) {
    super();

    this.state = {
      question: null,
      answer: "A",
      code: null,
      doc_link: "",
      video_link: "",
      subject_id: "",
      chapter_id: "",
      category_id: "",
      level: "",
      selectedFile: null,
      uploadedImages: [],
      classrooms: "",
      fileData: "",
      doc_type: "GOOGLE_DRIVE",
    };
  }

  getData = (pageNumber = 1) => {
    const data = {
      limit: 999,
    };
    if (this.state.keyword != null) {
      data["keyword"] = this.state.keyword;
    }
    return data;
  };

  async componentDidMount() {
    const data = {
      limit: 999,
      is_delete: false,
    };
    await this.props.listSubject(data);
    await this.props.listChapter(data);
    await this.props.listCategory(data);
    await this.props.showQuestion(this.props.match.params.id);
    if (this.props.question) {
      await this.props.listClassroom(this.getData());
    }

    var {
      code,
      question,
      answer,
      doc_link,
      video_link,
      subject,
      category,
      chapter,
      level,
      answer_content,
      doc_type,
    } = this.props.question;

    if (question !== null) {
      this.setState({
        code,
        question,
        answer_content,
        content: question,
        content1: answer_content,
        answer,
        doc_link,
        video_link,
        level,
        doc_type,
        category_id: !isUndefined(category) ? category.id : "",
        chapter_id: !isUndefined(chapter) ? chapter.id : "",
        subject_id: !isUndefined(subject) ? subject.id : "",
      });
    }
  }

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("id", this.props.match.params.id);
    data.append("answer", this.state.answer);
    data.append("video_link", this.state.video_link);
    data.append("subject_id", this.state.subject_id);
    data.append("chapter_id", this.state.chapter_id);
    data.append("category_id", this.state.category_id);
    data.append("level", this.state.level);

    data.append("doc_type", this.state.doc_type);
    if (this.state.doc_type === "GOOGLE_DRIVE") {
      data.append("doc_link", this.state.doc_link);
    } else {
      data.append("files[0]", this.state.fileData);
    }

    if (this.state.content) {
      data.append("question", this.state.content.toString());
    }

    if (this.state.content1) {
      data.append("answer_content", this.state.content1.toString());
    }

    await this.props.updateQuestion(data);

    document.location.reload();
  };

  fetchRows() {
    if (this.props.tags instanceof Array) {
      return this.props.tags.map((obj, i) => {
        return <Option key={obj._id.toString()}>{obj.name}</Option>;
      });
    }
  }

  componentDidUpdate = async (prevProps, prevState) => {
    if (
      this.state.subject_id !== prevState.subject_id &&
      prevState.subject_id !== ""
    ) {
      this.setState({
        chapter_id: "",
      });
    }
  };

  onChangeHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
  };

  handleChangeFile = (info) => {
    this.setState({
      selectedFile: info.file,
    });
  };

  fetchRowsSubject() {
    if (this.props.subjects instanceof Array) {
      return this.props.subjects.map((obj, i) => {
        return (
          <option value={obj._id} key={obj._id}>
            {obj.name}
          </option>
        );
      });
    }
  }

  fetchRowsChapter() {
    if (this.props.chapters instanceof Array) {
      return this.props.chapters.map((obj, i) => {
        if (obj.subject.id === this.state.subject_id) {
          return (
            <option key={obj._id} value={obj._id}>
              {obj.name}
            </option>
          );
        }
      });
    }
  }

  fetchRowsCategory() {
    if (this.props.categories instanceof Array) {
      return this.props.categories.map((obj, i) => {
        if (
          obj.chapter.id === this.state.chapter_id &&
          this.state.subject_id !== ""
        ) {
          return (
            <option value={obj._id} key={obj._id}>
              {obj.name}
            </option>
          );
        }
      });
    }
  }

  _handleEditorContentChange = (content) => {
    this.setState({ content: content });
  };
  _handleEditorContent1Change = (content) => {
    this.setState({ content1: content });
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

  onChangeHandler = (event) => {
    if (this.state.doc_type == "PDF") {
      this.setState({
        fileData: event.target.files[0],
      });
    } else {
      this.setState({ doc_link: "" });
    }
  };

  render() {
    return (
      <div>
        {/* <div className="page-hero page-container" id="page-hero">
          <div className="padding d-flex">
            <div className="page-title">
              <h2 className="text-md text-highlight">Sửa câu hỏi</h2>
            </div>
            <div className="flex" />
            <div>
              <button
                className="btn btn-primary btn-sm mr-2"
                data-toggle="modal"
                data-target="#add-classroom"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
                title="Áp dụng cho lớp"
                id="btn-trash"
              >
                Áp dụng cho lớp
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-file-plus mx-2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1={12} y1={18} x2={12} y2={12} />
                  <line x1={9} y1={15} x2={15} y2={15} />
                </svg>
              </button>

              <Link
                to={"/question"}
                className="btn btn-sm text-white btn-primary"
              >
                <span className="d-none d-sm-inline mx-1">Quay lại</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-arrow-right"
                >
                  <line x1={5} y1={12} x2={19} y2={12} />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div> */}

        <div className="page-content page-container" id="page-content">
          <div className="padding">
            <h2 className='text-md text-highlight sss-page-title'>
              Sửa câu hỏi
            </h2>
            <div className="col-12">
              <div className="row justify-end">
              <button
                className="btn btn-primary btn-sm mr-2 mb-16"
                data-toggle="modal"
                data-target="#add-classroom"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
                title="Áp dụng cho lớp"
                id="btn-trash"
              >
                Áp dụng cho lớp
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-file-plus mx-2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1={12} y1={18} x2={12} y2={12} />
                  <line x1={9} y1={15} x2={15} y2={15} />
                </svg>
              </button>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <strong>Câu hỏi : {this.state.code}</strong>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-sm-6 col-form-div">
                        <div className="form-group">
                          <label className="col-sm-12 col-form-label">
                            Tên câu hỏi
                          </label>
                          <div className="col-sm-12">
                            <input
                              type="text"
                              disabled="disabled"
                              className="form-control"
                              value={
                                this.state.code !== null ? this.state.code : ""
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label className="col-sm-12 col-form-label">
                            Môn học
                          </label>
                          <div className="col-sm-12">
                            <select
                              className="custom-select"
                              value={this.state.subject_id}
                              name="subject_id"
                              onChange={this._onChange}
                            >
                              <option value="">-- Chọn môn học --</option>
                              {this.fetchRowsSubject()}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-6 col-form-div">
                        <div className="form-group">
                          <label className="col-sm-12 col-form-label">
                            Chương
                          </label>
                          <div className="col-sm-12">
                            <select
                              className="custom-select"
                              value={this.state.chapter_id}
                              name="chapter_id"
                              onChange={this._onChange}
                            >
                              <option value="">-- Chọn chương --</option>
                              {this.fetchRowsChapter()}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label className="col-sm-12 col-form-label">
                            Danh mục
                          </label>
                          <div className="col-sm-12">
                            <select
                              className="custom-select"
                              value={this.state.category_id}
                              name="category_id"
                              onChange={this._onChange}
                            >
                              <option value="">-- Chọn danh mục --</option>
                              {this.fetchRowsCategory()}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-12 col-form-div">
                        <div className="form-group">
                          <label className="col-sm-12 col-form-label">
                            Câu hỏi
                          </label>
                          <div className="col-sm-12">
                            <SunEditor
                                onImageUploadBefore={this.handleImageUploadBefore}
                                height= {'400px'}
                                setContents={this.state.content}
                                onChange={this._handleEditorContentChange}
                                setOptions={{
                                  buttonList: baseHelpers.getSunEditorOptions(),
                                  katex: katex,
                                  addTagsWhitelist: 'span|svg|path|symbol|use',
                                  attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                                }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-12 col-form-div">
                        <div className="form-group">
                          <label className="col-sm-12 col-form-label">
                            Lời giải
                          </label>
                          <div className="col-sm-12">
                            <SunEditor
                                onImageUploadBefore={this.handleImageUploadBefore}
                                height= {'400px'}
                                setContents={this.state.content1}
                                onChange={this._handleEditorContent1Change}
                                setOptions={{
                                  buttonList: baseHelpers.getSunEditorOptions(),
                                  katex: katex,
                                  addTagsWhitelist: 'span|svg|path|symbol|use',
                                  attributesWhitelist: baseHelpers.getSunEditorAttributeWhitelist(),
                                }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 col-form-div">
                        <div className="form-group">
                          <label className="col-sm-8 col-form-label">
                            Đáp án
                          </label>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <Radio.Group
                          onChange={this._onChange}
                          value={this.state.answer}
                          name="answer"
                        >
                          <Radio value={"A"}>A</Radio>
                          <Radio value={"B"}>B</Radio>
                          <Radio value={"C"}>C</Radio>
                          <Radio value={"D"}>D</Radio>
                        </Radio.Group>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 col-form-div">
                        <div className="form-group">
                          <label className="col-sm-8 col-form-label">
                            Độ khó
                          </label>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <Radio.Group
                          onChange={this._onChange}
                          name="level"
                          value={this.state.level}
                        >
                          <Radio value="NHAN_BIET">Nhận biết</Radio>
                          <Radio value="THONG_HIEU">Thông hiểu</Radio>
                          <Radio value="VAN_DUNG">Vận dụng</Radio>
                          <Radio value="VAN_DUNG_CAO">Vận dụng cao</Radio>
                        </Radio.Group>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4 col-form-div">
                        <div className="form-group">
                          <label className="col-sm-8 col-form-label">
                            Tài liệu tham khảo
                          </label>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <Radio.Group
                          onChange={this._onChange}
                          name="doc_type"
                          value={this.state.doc_type}
                        >
                          <Radio value={"GOOGLE_DRIVE"}>Google drive</Radio>
                          <Radio value={"PDF"}>Pdf</Radio>
                        </Radio.Group>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-12 col-form-div">
                        <div className="form-group">
                          <div className="col-sm-12">
                            {this.state.doc_type === "GOOGLE_DRIVE" ? (
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập link tài liệu"
                                name="doc_link"
                                onChange={this._onChange}
                                value={this.state.doc_link}
                              />
                            ) : (
                              <div>
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  placeholder="Nhập link tài liệu"
                                  name="doc_link"
                                  onChange={this._onChange}
                                  value={
                                    this.state.doc_link !== null
                                      ? this.state.doc_link
                                      : ""
                                  }
                                  readOnly
                                />
                                <input
                                  type="file"
                                  className="form-control"
                                  name="fileData"
                                  onChange={this.onChangeHandler}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-12 col-form-div">
                        <div className="form-group">
                          <label className="col-sm-12 col-form-label">
                            Video tham khảo
                          </label>
                          <div className="col-sm-12">
                            <input
                              type="text"
                              className="form-control"
                              name="video_link"
                              onChange={this._onChange}
                              value={
                                this.state.video_link == "null"
                                  ? ""
                                  : this.state.video_link
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      id="add-classroom"
                      className="modal fade"
                      data-backdrop="true"
                      style={{
                        display: "none",
                        minWidth: "1000px",
                        zIndex: 1050
                      }}
                      aria-hidden="true"
                    >
                      <AddClassroom question_id={this.props.match.params.id} />
                    </div>
                    <div className="form-group row">
                      <div className="col-sm-12 text-right">
                        <button
                          className="btn btn-primary mt-2"
                          onClick={this.handleSubmit}
                        >
                          Cập nhật
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    subjects: state.subject.subjects,
    chapters: state.chapter.chapters,
    categories: state.category.categories,
    question: state.question.question,
    image: state.question.image,
    classrooms: state.classroom.classrooms,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createQuestion,
      updateQuestion,
      showQuestion,
      listQuestion,
      listChapter,
      listCategory,
      listSubject,
      uploadImage,
      listClassroom,
    },
    dispatch
  );
}

let QuestionEditContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(QuestionEdit)
);

export default QuestionEditContainer;
