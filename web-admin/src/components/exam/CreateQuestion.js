import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  Select,
  Radio,
  notification,
} from "antd";
import { listChapter } from "../../redux/chapter/action";
import { listSubject } from "../../redux/subject/action";
import { listCategory } from "../../redux/category/action";
import {
  createQuestion,
  uploadImage,
  listQuestion,
} from "../../redux/question/action";
import baseHelpers from "../../helpers/BaseHelpers";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const { Option } = Select;

class CreateQuestion extends Component {
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


  async UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectedSubjectId && nextProps.selectedSubjectId !== this.state.subject_id) {
      this.setState({
        subject_id: nextProps.selectedSubjectId
      })
    }
  }

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  getData = (pageNumber = 1) => {
    const data = {
      page: pageNumber,
      limit: this.props.limit,
    };
    return data;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    if (this.state.subject_id === "") {
      notification.error({
        message: "Môn không được để trống",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
      return false;
    }
    if (this.state.chapter_id === "") {
      notification.error({
        message: "Chương là trường bắt buộc",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
      return false;
    }
    if (this.state.category_id === "") {
      notification.error({
        message: "Danh mục là trường bắt buộc",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
      return false;
    }

    const data = new FormData();
    data.append("answer", this.state.answer);
    data.append("doc_link", this.state.doc_link);
    data.append("video_link", this.state.video_link);
    data.append("subject_id", this.state.subject_id);
    data.append("chapter_id", this.state.chapter_id);
    data.append("category_id", this.state.category_id);
    data.append("level", this.state.level);
    data.append("question", this.state.content.toString());
    data.append("answer_content", this.state.content1.toString());

    await this.props.createQuestion(data);
    await this.props.listQuestion(this.getData());
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
      notification.error({
        message: "Môn không được để trống",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
      return false;
    }
    if (this.state.chapter_id === "") {
      notification.error({
        message: "Chương là trường bắt buộc",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
      return false;
    }
    if (this.state.category_id === "") {
      notification.error({
        message: "Danh mục là trường bắt buộc",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
      return false;
    }

    const data = new FormData();
    data.append("answer", this.state.answer);
    data.append("doc_link", this.state.doc_link);
    data.append("video_link", this.state.video_link);
    data.append("subject_id", this.state.subject_id);
    data.append("chapter_id", this.state.chapter_id);
    data.append("category_id", this.state.category_id);
    data.append("level", this.state.level);
    data.append("question", this.state.content.toString());
    data.append("answer_content", this.state.content1.toString());


    await this.props.createQuestion(data);

    if (this.props.question) {
      this.props.handleAddSelectedQuestion(this.props.question);
    }

    this.setState(resetObj);
    // await this.props.listQuestion(this.getData());
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
    this.setState({
      selectedFile: event.target.files[0],
    });
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
            // <option value={obj._id} key={obj._id.toString()}>
            //   {obj.name}
            // </option>
            <Option key={obj._id.toString()}>{obj.name}</Option>
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
            <Option key={obj._id.toString()}>{obj.name}</Option>
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

  onSearchChapter = async (value) => {
    if (value) {
      await this.props.listChapter({
        limit: 999,
        keyword: value,
        chapter_id: this.state.chapter_id,
      });
    }
  };

  onSearchLesson = async (value) => {
    if (value) {
      await this.props.listCategory({
        limit: 999,
        keyword: value,
        category_id: this.state.category_id,
      });
    }
  };

  onChangeChapter(val) {
    this.setState({
      chapter_id: val
    })
  }

  onChangeLesson(val) {
    this.setState({
      category_id: val
    })
  }

  render() {
    return (
      <div className="block-content">
        {/* <div className="col-md-12"> */}
        {/* <div className="card">
            <div className="card-body"> */}
        {/* <form ref={(el) => (this.myFormRef = el)}> */}
        <div className="row">
          <div className="col-sm-6 col-form-div">
            <div className="form-group">
              <label className="col-form-label">
                Mã câu hỏi
              </label>
              <input
                type="text"
                disabled
                placeholder="Tự động sinh"
                className="form-control"
                name="code"
                onChange={this._onChange}
                value={this.state.name}
              />
            </div>
          </div>
          <div className="col-sm-6">
            <div className="form-group">
              <label className="col-form-label">
                Môn học
              </label>
              <select
                className="custom-select"
                value={this.state.subject_id}
                name="subject_id"
                disabled
                onChange={this._onChange}
              >
                <option value="">-- Chọn môn học --</option>
                {this.fetchRowsSubject()}
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6 col-form-div">
            <div className="form-group">
              <label className="col-form-label">Chương</label>
              {/* <select
                          className="custom-select"
                          value={this.state.chapter_id}
                          name="chapter_id"
                          onChange={this._onChange}
                        >
                          <option value="">-- Chọn chương --</option>
                          {this.fetchRowsChapter()}
                        </select> */}
              <div>
                <Select
                  showSearch
                  placeholder="-- Chọn chương -- "
                  optionFilterProp="children"
                  onChange={(val) => this.onChangeChapter(val)}
                  // onFocus={this.handleListExam}
                  onSearch={this.onSearchChapter}
                  name="chapter_id"
                >
                  {this.fetchRowsChapter()}
                </Select>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="form-group">
              <label className="col-form-label">
                Tên bài
              </label>
              {/* <select
                className="custom-select"
                value={this.state.category_id}
                name="category_id"
                onChange={this._onChange}
              >
                <option value="">-- Chọn bài --</option>
                {this.fetchRowsCategory()}
              </select> */}
              <div>
                <Select
                  showSearch
                  placeholder="-- Chọn bài -- "
                  optionFilterProp="children"
                  onChange={(val) => this.onChangeLesson(val)}
                  // onFocus={this.handleListExam}
                  onSearch={this.onSearchLesson}
                  name="category_id"
                >
                  {this.fetchRowsCategory()}
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">
                Câu hỏi
              </label>
              <div className="">
                <SunEditor
                    onImageUploadBefore={this.handleImageUploadBefore}
                    height= {'400px'}
                    setContents={this.state.content1}
                    onChange={this._handleEditorContentChange}
                    setOptions={{
                      buttonList: baseHelpers.getSunEditorOptions(),
                      katex: katex,
                    }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="title-block">
                Lời giải
              </label>
              <div className="">
                <SunEditor
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
          </div>
        </div>

        <div className="row">
          <div className="col-4 col-form-div">
            <div className="form-group">
              <label className="col-form-label">Đáp án</label>
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
              <label className="col-form-label">Độ khó</label>
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
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="col-form-label">
                Tài liệu tham khảo
              </label>
              <div className="">
                <input
                  type="text"
                  className="form-control"
                  name="doc_link"
                  onChange={this._onChange}
                  value={this.state.doc_link}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-form-div">
            <div className="form-group">
              <label className="col-form-label">
                Video tham khảo
              </label>
              <div className="">
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
              data-dismiss="modal"
              onClick={this.handleSubmit}
            >
              Lưu
            </button>
            <button
              name="reset"
              value="1"
              className="btn btn-primary mt-2 ml-2"
              onClick={this.handleSave}
            >
              Lưu & Thêm mới
            </button>
            <button
              name="reset"
              value="0"
              className="btn btn-primary mt-2 ml-2"
              onClick={this.handleSave}
            >
              Lưu & Thêm mới theo Chương hiện tại
            </button>
            <button
              className="btn btn-light mt-2 ml-2"
              data-dismiss="modal"
            >
              Bỏ qua
            </button>
          </div>
        </div>
        {/* </form> */}
        {/* </div>
          </div> */}
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
    question: state.question.question
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
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
}

// let CreateQuestionContainer = withRouter(
//   connect(mapStateToProps, mapDispatchToProps)(CreateQuestion)
// );

// export default CreateQuestionContainer;

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CreateQuestion)
);

