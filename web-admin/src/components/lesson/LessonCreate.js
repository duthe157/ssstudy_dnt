import React, { Component, useRef } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { listChapter } from "../../redux/chapter/action";
import { listSubject } from "../../redux/subject/action";
import { createCategory, uploadImage } from "../../redux/category/action";

import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";

class LessonCreate extends Component {
  constructor(props) {
    super();
    this.state = {
      name: "",
      chapname: "",
      chapter_id: "",
      subject_id: "",
      video_link: "",
      doc_link: "",
      content: "",
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
    await this.props.listSubject(data);

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
    await this.props.createCategory({
      name: this.state.name,
      content: this.state.content,
      video_link: this.state.video_link,
      doc_link: this.state.doc_link,
      chapter_id: this.state.chapter_id,
      subject_id: this.state.subject_id,
      total_video_time: this.state.total_video_time
    });
    if (this.props.redirect === true) {
      await this.props.history.push("/category");
    }
  };

  handleSave = async (e) => {
    e.preventDefault();
    const data = {
      name: this.state.name,
      content: this.state.content,
      video_link: this.state.video_link,
      doc_link: this.state.doc_link,
      chapter_id: this.state.chapter_id,
      subject_id: this.state.subject_id,
      total_video_time: this.state.total_video_time
    };
    await this.props.createCategory(data);
    if (this.props.redirect === true) {
      await this.setState({
        name: "",
        chapter_id: "",
        subject_id: "",
        video_link: "",
        doc_link: "",
        content: "",
        total_video_time: 0
      });
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

  onChangeHandler = (event) => {
    if (this.state.doc_type === "PDF") {
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
        <div className="page-content page-container" id="page-content">
          <div className="padding">
            <div className="row">
              <div className="col-md-10">
                <div className="card">
                  <div className="card-header">
                    <strong>Thêm bài giảng mới</strong>
                  </div>
                  <div className="card-body">
                    <div className="form-group row">
                      <label className="col-sm-3 col-form-label">
                        Tên bài giảng
                      </label>
                      <div className="col-sm-9">
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
                      <label className="col-sm-3 col-form-label">Môn học</label>
                      <div className="col-sm-9">
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
                      <label className="col-sm-3 col-form-label">Chương</label>
                      <div className="col-sm-9">
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
                      <label className="col-sm-3 col-form-label">
                        Link Video
                      </label>
                      <div className="col-sm-9">
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
                      <label className="col-sm-3 col-form-label">
                        Link PDF
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="text"
                          className="form-control"
                          name="doc_link"
                          onChange={this._onChange}
                          value={this.state.doc_link}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-3 col-form-label">
                        Thời lượng (phút)
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="text"
                          className="form-control"
                          name="total_video_time"
                          onChange={this._onChange}
                          value={this.state.total_video_time}
                        />
                      </div>
                    </div>
                    <div className="row form-group">
                      <label className="col-sm-3 col-form-label">
                        Giới thiệu bài giảng
                      </label>
                      <div className="col-sm-9">
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
    redirect: state.category.redirect,
    image: state.question.image,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { listChapter, createCategory, listSubject, uploadImage },
    dispatch
  );
}

let LessonCreateConatainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LessonCreate)
);

export default LessonCreateConatainer;
