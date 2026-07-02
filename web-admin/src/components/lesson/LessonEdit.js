import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { listChapter } from "../../redux/chapter/action";
import { listSubject } from "../../redux/subject/action";
import { listExam } from "../../redux/exam/action";
import {
  showCategory,
  createCategory,
  updateCategory,
  uploadImage,
} from "../../redux/category/action";
import CategoryVideo from "./CategoryVideo";
import { Select } from "antd";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";

const { Option } = Select;

class LessonEdit extends Component {
  constructor(props) {
    super();
    this.state = {
      name: "",
      chapter_id: "",
      exam_id: "",
      exam_id2: "",
      exam_name: "",
      subject_id: "",
      video_link: "",
      doc_link: "",
      content: "",
      is_free: false,
      uploadedImages: [],
      total_video_time: 0
    };
  }

  async componentDidMount() {
    const data = {
      limit: 999,
      is_delete: false,
    };
    await this.props.listChapter(data);
    // await this.props.listSubject(data);
    await this.props.showCategory(this.props.match.params.id);
    if (this.props.category) {
      var { name, content, video_link, doc_link, is_free } =
        this.props.category;

      this.setState({
        name: name ? name : "",
        content,
        video_link,
        doc_link,
        is_free,
        chapter_id: this.props.category.chapter.id,
        subject_id: this.props.category.subject.id,
        exam_id: this.props.category.exam ? this.props.category.exam.name : "",
        exam_id2:
          this.props.category.exam && this.props.category.exam.id
            ? this.props.category.exam.id
            : "",
        exam_name: this.props.category.exam
          ? this.props.category.exam.name
          : "",
          total_video_time: this.props.category.total_video_time ? this.props.category.total_video_time : 0
        // editorStateContent,
      });
    }
  }

  fetchOptionsExam() {
    if (this.props.exams instanceof Array) {
      return this.props.exams.map((obj, i) => {
        return <Option key={obj._id.toString()}>{obj.name}</Option>;
      });
    }
  }

  onSearchExam = async (value) => {
    if (value) {
      await this.props.listExam({
        limit: 999,
        keyword: value,
        subject_id: this.state.subject_id,
      });
    }
  };

  onChangeExam = async (value) => {
    await this.setState({
      exam_id: value,
    });
  };

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      id: this.props.match.params.id,
      name: this.state.name,
      content: this.state.content,
      video_link: this.state.video_link,
      doc_link: this.state.doc_link,
      chapter_id: this.state.chapter_id,
      subject_id: this.state.subject_id,
      exam_id: this.state.exam_id,
      is_free: this.state.is_free,
      total_video_time: this.state.total_video_time
    };
    if (this.state.exam_id.trim() === this.state.exam_name.trim()) {
      data.exam_id = this.state.exam_id2;
    }
    this.props.updateCategory(data);
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

  handleChangeFile = (info) => {
    this.setState({
      selectedFile: info.file,
    });
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

  _handleEditorChange = (content) => {
    this.setState({ content: content });
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
        <div className="page-hero page-container" id="page-hero">
          <div className="padding d-flex">
            <div className="page-title">
              <h2 className="text-md text-highlight">Thông tin</h2>
            </div>
            <div className="flex" />
            <div>
              <button
                className="btn btn-primary btn-sm mr-2"
                data-toggle="modal"
                data-target="#manage-video-modal"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
                title="Video bài giảng"
                id="btn-trash"
              >
                Video bài giảng
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
                to={"/category"}
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
        </div>

        <div className="page-content page-container" id="page-content">
          <div className="padding">
            <div className="row">
              <div className="col-md-10">
                <div className="card">
                  <div className="card-header">
                    <strong>Sửa bài giảng</strong>
                  </div>
                  <div className="card-body">
                    <div className="form-group row">
                      <label className="col-sm-4 col-form-label">
                        Tên bài giảng
                      </label>
                      <div className="col-sm-8">
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          onChange={this._onChange}
                          value={this.state.name}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-4 col-form-label">Môn học</label>
                      <div className="col-sm-8">
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
                    <div className="form-group row">
                      <label className="col-sm-4 col-form-label">Chương</label>
                      <div className="col-sm-8">
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
                    <div className="form-group row">
                      <label className="col-sm-4 col-form-label">
                        Đề luyện tập
                      </label>
                      <div className="col-sm-8">
                        <Select
                          showSearch
                          style={{ width: "100%" }}
                          placeholder="Tìm và chọn đề thi"
                          value={this.state.exam_id}
                          optionFilterProp="children"
                          onChange={this.onChangeExam}
                          onSearch={this.onSearchExam}
                          filterOption={(input, option) =>
                            option.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {this.fetchOptionsExam()}
                        </Select>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-sm-4 col-form-label">
                        Link Video
                      </label>
                      <div className="col-sm-8">
                        <input
                          type="text"
                          className="form-control"
                          name="video_link"
                          onChange={this._onChange}
                          value={this.state.video_link}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-4 col-form-label">
                        Link PDF
                      </label>
                      <div className="col-sm-8">
                        <input
                          type="text"
                          className="form-control"
                          name="doc_link"
                          onChange={this._onChange}
                          value={this.state.doc_link ? this.state.doc_link : ""}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-4 col-form-label">
                        Thời lượng (phút)
                      </label>
                      <div className="col-sm-8">
                        <input
                          type="text"
                          className="form-control"
                          name="total_video_time"
                          onChange={this._onChange}
                          value={this.state.total_video_time}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label className="col-sm-12 col-form-label">
                          Giới thiệu bài giảng
                        </label>
                        <div className="col-sm-12">
                          <SunEditor
                              onImageUploadBefore={this.handleImageUploadBefore}
                              height= {'400px'}
                              setContents={this.state.content}
                              onChange={this._handleEditorChange}
                              setOptions={{
                                buttonList: baseHelpers.getSunEditorOptions(),
                                katex: katex,
                              }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-sm-12">
                        <label className=" col-form-label">Miễn phí</label>
                        <div>
                          <div className="form-check float-left">
                            <input
                              checked={
                                this.state.is_free === true ||
                                this.state.is_free === "true"
                              }
                              className="form-check-input"
                              type="radio"
                              name="is_free"
                              value="true"
                              id="gridRadios1"
                              onChange={this._onChange}
                              defaultValue="option1"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="gridRadios1"
                            >
                              Có
                            </label>
                          </div>
                          <div className="form-check float-left ml-4">
                            <input
                              checked={
                                this.state.is_free === false ||
                                this.state.is_free === "false"
                              }
                              className="form-check-input"
                              type="radio"
                              name="is_free"
                              value="false"
                              id="gridRadios2"
                              onChange={this._onChange}
                              defaultValue="option2"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="gridRadios2"
                            >
                              Không
                            </label>
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
        <div
          id="manage-video-modal"
          className="modal fade"
          data-backdrop="true"
          style={{
            display: "none",
            minWidth: "1000px",
          }}
          aria-hidden="true"
        >
          <CategoryVideo
            category_id={this.state.category_id}
            classroom_id={this.props.match.params.id}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    chapters: state.chapter.chapters,
    subjects: state.subject.subjects,
    category: state.category.category,
    redirect: state.category.redirect,
    exams: state.exam.exams,
    image: state.question.image,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      listExam,
      listChapter,
      listSubject,
      createCategory,
      showCategory,
      updateCategory,
      uploadImage,
    },
    dispatch
  );
}

let LessonEditContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LessonEdit)
);

export default LessonEditContainer;
