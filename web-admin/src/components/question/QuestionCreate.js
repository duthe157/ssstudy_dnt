import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Select, Radio, notification } from "antd";

import { listChapter } from "../../redux/chapter/action";
import { listSubject } from "../../redux/subject/action";
import { listCategory } from "../../redux/category/action";
import { createQuestion, uploadImage } from "../../redux/question/action";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";

const { Option } = Select;

class QuestionCreate extends Component {
  constructor(props) {
    super();
    this.state = {
      question: null,
      answer: "A",
      answer_content: null,
      doc_link: "",
      video_link: "",
      subject_id: "",
      chapter_id: "",
      category_id: "",
      level: "NHAN_BIET",
      selectedFile: null,

      content: "",

      content1: "",

      uploadedImages: [],

      fileData: "",
      doc_type: "GOOGLE_DRIVE",
    };
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

  async componentDidMount() {
    const data = {
      limit: 999,
      is_delete: false,
    };
    await this.props.listChapter(data);
    await this.props.listCategory(data);
    await this.props.listSubject(data);
  }

  _onChange = async (e) => {
    var name = e.target.name;
    var value = e.target.value;

    if (name === "doc_link" && this.state.fileData !== null) {
      await this.setState({
        fileData: "",
      });
    }
    await this.setState({
      [name]: value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    if (this.state.subject_id === "") {
      this.subjectInput.focus();
      notification.error({
        message: "Môn không được để trống",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    } else if (this.state.chapter_id === "") {
      this.chapterInput.focus();
      notification.error({
        message: "Chương là trường bắt buộc",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    } else if (this.state.category_id === "") {
      this.categoryInput.focus();
      notification.error({
        message: "Danh mục là trường bắt buộc",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    } else {
      const data = new FormData();
      data.append("answer", this.state.answer);
      data.append("video_link", this.state.video_link);
      data.append("subject_id", this.state.subject_id);
      data.append("chapter_id", this.state.chapter_id);
      data.append("category_id", this.state.category_id);
      data.append("level", this.state.level);
      data.append("question", this.state.content.toString());
      data.append("answer_content", this.state.content1.toString());

      data.append("doc_type", this.state.doc_type);
      if (this.state.doc_type === "GOOGLE_DRIVE") {
        data.append("doc_link", this.state.doc_link);
      } else {
        data.append("files[0]", this.state.fileData);
      }

      await this.props.createQuestion(data);

      if (this.props.redirect === true) {
        await this.props.history.push("/question");
      }
    }
  };

  handleSave = async (e) => {
    const resetObj = {
      question: "",
      answer: "A",
      doc_link: "",
      video_link: "",
      level: "NHAN_BIET",
      content: "",
      content1: "",
      uploadedImages: [],
    };

    if (e.target && e.target.name === "reset" && e.target.value === "1") {
      resetObj.subject_id = "";
      resetObj.chapter_id = "";
      resetObj.category_id = "";
    }

    e.preventDefault();

    if (this.state.subject_id === "") {
      this.subjectInput.focus();
      notification.error({
        message: "Môn không được để trống",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    } else if (this.state.chapter_id === "") {
      this.chapterInput.focus();
      notification.error({
        message: "Chương là trường bắt buộc",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    } else if (this.state.category_id === "") {
      this.categoryInput.focus();
      notification.error({
        message: "Danh mục là trường bắt buộc",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    } else {
      const data = new FormData();
      data.append("answer", this.state.answer);
      data.append("video_link", this.state.video_link);
      data.append("chapter_id", this.state.chapter_id);
      data.append("category_id", this.state.category_id);
      data.append("level", this.state.level);
      data.append("question", this.state.content);
      data.append("answer_content", this.state.content1);

      data.append("doc_type", this.state.doc_type);
      if (this.state.doc_type === "GOOGLE_DRIVE") {
        data.append("doc_link", this.state.doc_link);
      } else {
        data.append("files[0]", this.state.fileData);
      }

      await this.props.createQuestion(data);

      await this.setState(resetObj);
    }
  };

  fetchRows() {
    if (this.props.tags instanceof Array) {
      return this.props.tags.map((obj, i) => {
        return <Option key={obj.name.toString()}>{obj.name}</Option>;
      });
    }
  }

  //change select option
  handleChange = (value) => {
    this.setState({
      tags: Object.assign([], value),
    });
  };

  onChangeHandler = (event) => {
    if (this.state.doc_type === "PDF") {
      this.setState({
        fileData: event.target.files[0],
      });
    } else {
      this.setState({ doc_link: "" });
    }
  };

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

  fetchRowsChapter() {
    if (this.props.chapters instanceof Array) {
      return this.props.chapters.map((obj, i) => {
        if (obj.subject.id === this.state.subject_id) {
          return (
            <option value={obj._id} key={obj._id.toString()}>
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
        if (obj.chapter.id === this.state.chapter_id) {
          return (
            <option value={obj._id} key={obj._id.toString()}>
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

  render() {
    return (
      <div>
        {/* <div className="page-hero page-container" id="page-hero">
          <div className="padding d-flex">
            <div className="page-title">
              <h2 className="text-md text-highlight">Thêm mới</h2>
            </div>
            <div className="flex" />
            <div>
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
              Thêm câu hỏi mới
            </h2>
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h3 className="title-block">Thông tin</h3>
                  </div>
                  <div className="card-body">
                    <form ref={(el) => (this.myFormRef = el)}>
                      <div className="row">
                        <div className="col-sm-6 col-form-div">
                          <div className="form-group">
                            <label className="col-sm-12 col-form-label">
                              Mã câu hỏi
                            </label>
                            <div className="col-sm-12">
                              <input
                                type="text"
                                placeholder="Tự động sinh"
                                className="form-control"
                                disabled="disabled"
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
                                ref={(input) => {
                                  this.subjectInput = input;
                                }}
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
                                ref={(input) => {
                                  this.chapterInput = input;
                                }}
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
                                ref={(input) => {
                                  this.categoryInput = input;
                                }}
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
                            name="answer"
                            value={this.state.answer}
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
                                <input
                                  type="file"
                                  className="form-control"
                                  name="fileData"
                                  onChange={this.onChangeHandler}
                                />
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
                                value={this.state.video_link}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <div className="col-sm-12 text-right">
                          <button
                            className="btn btn-primary mt-2"
                            onClick={this.handleSubmit}
                          >
                            Lưu
                          </button>
                          <button
                            className="btn btn-primary mt-2 ml-2"
                            onClick={this.handleSave}
                          >
                            Lưu & Thêm mới
                          </button>
                        </div>
                      </div>
                    </form>
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
    redirect: state.question.redirect,
    image: state.question.image,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { listSubject, listChapter, listCategory, createQuestion, uploadImage },
    dispatch
  );
}

let QuestionCreateContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(QuestionCreate)
);

export default QuestionCreateContainer;
