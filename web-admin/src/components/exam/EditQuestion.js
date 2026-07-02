import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  Select,
  Radio,
} from "antd";
import { listChapter } from "../../redux/chapter/action";
import { listSubject } from "../../redux/subject/action";
import { listCategory } from "../../redux/category/action";
import {
  createQuestion,
  updateQuestion,
  uploadImage,
  listQuestion,
} from "../../redux/question/action";
import BaseHelpers from "../../helpers/BaseHelpers";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const { Option } = Select;

class EditQuestion extends Component {
  constructor(props) {
    super();
    this.state = {
      id: null,
      question: null,
      answer: "A",
      answer_content: null,
      doc_link: "",
      video_link: "",
      subject_id: null,
      chapter_id: null,
      category_id: null,
      level: "NHAN_BIET",
      selectedFile: null,
      content: "",
      content1: "",
      question_json: "",

      uploadedImages: [],
    };
  }

  // componentDidUpdate = async (prevProps, prevState) => {
  //   if (
  //     this.state.subject_id !== prevState.subject_id &&
  //     prevState.subject_id !== ""
  //   ) {
  //     this.setState({
  //       chapter_id: "",
  //     });
  //   }
  // };

  async componentDidMount() {
    const data = {
      limit: 999,
      is_delete: false,
    };
    await this.props.listChapter(data);
    await this.props.listCategory(data);
    await this.props.listSubject(data);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.currentQuestionvalue != nextProps.currentQuestionvalue) {
      this.setState({
        id: nextProps.currentQuestionvalue._id,
        content: nextProps.currentQuestionvalue.question ? nextProps.currentQuestionvalue.question : "",
        answer: nextProps.currentQuestionvalue.answer ? nextProps.currentQuestionvalue.answer : "",
        content1: nextProps.currentQuestionvalue.answer_content ? nextProps.currentQuestionvalue.answer_content : "",
        doc_link: nextProps.currentQuestionvalue.doc_link ? nextProps.currentQuestionvalue.doc_link : "",
        video_link: nextProps.currentQuestionvalue.video_link ? nextProps.currentQuestionvalue.video_link : "",
        subject_id: nextProps.currentQuestionvalue.subject ? nextProps.currentQuestionvalue.subject.id : "",
        chapter_id: nextProps.currentQuestionvalue.chapter ? nextProps.currentQuestionvalue.chapter.id : "",
        category_id: nextProps.currentQuestionvalue.category ? nextProps.currentQuestionvalue.category.id : "",
        level: nextProps.currentQuestionvalue.level,
      })

      if (nextProps.currentQuestionvalue.question_json) {

        let questionJson = JSON.parse(nextProps.currentQuestionvalue.question_json);

        if (questionJson && questionJson.correct && questionJson.correct != "?") {
          this.setState({
            answer: questionJson.correct
          })
        }

        if (questionJson && questionJson.answer_content && questionJson.answer_content  != "") {
          this.setState({
            answer_content: questionJson.answer_content
          })
        }

        if (questionJson && questionJson.video_link && questionJson.video_link  != "") {
          this.setState({
            video_link: questionJson.video_link
          })
        }

        if (questionJson && questionJson.doc_link && questionJson.doc_link  != "") {
          this.setState({
            doc_link: questionJson.doc_link
          })
        }

        
        let contentQuestionJson = this.getQuestionJsonValue(questionJson);


        if (contentQuestionJson) {
          this.setState({
            question_json: contentQuestionJson
          })
        }
      }

    }
  }

  renderQuestion(data) {
    const question = data.question;
    if (data && question && question instanceof Array) {
      return question.map((object, i) => {
        const _content = BaseHelpers.renderQuestionHTML(object);
        return (
          <span key={i} dangerouslySetInnerHTML={{ __html: _content }}></span>
        );
      });
    }
  }

  fetchQuestionOption(data) {
    if (data && data instanceof Array) {
      return data.map((object, i) => {
        const _content = BaseHelpers.renderQuestionHTML(object);
        return (
          <span key={i} dangerouslySetInnerHTML={{ __html: _content }}></span>
        );
      });
    }
  }

  getQuestionJsonValue = (question) => {
    if (question) {
      return (
        <div className="api-question-item">
          <div className="api-list-question-preview">{this.renderQuestion(question)}</div>
          <div className="api-list-option">
            {question.A ? <span className="api-question-option-item"><strong>A:</strong> {this.fetchQuestionOption(question.A)} {question.correct && question.correct === 'A' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" /></span> : <></>}</span> : <></>}
            {question.B ? <span className="api-question-option-item"><strong>B:</strong> {this.fetchQuestionOption(question.B)} {question.correct && question.correct === 'B' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" /></span> : <></>}</span> : <></>}
            {question.C ? <span className="api-question-option-item"><strong>C:</strong> {this.fetchQuestionOption(question.C)} {question.correct && question.correct === 'C' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" /></span> : <></>}</span> : <></>}
            {question.D ? <span className="api-question-option-item"><strong>D:</strong> {this.fetchQuestionOption(question.D)} {question.correct && question.correct === 'D' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" /></span> : <></>}</span> : <></>}
          </div>
        </div >
      )
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

  handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("id", this.state.id);
    data.append("answer", this.state.answer);
    data.append("doc_link", this.state.doc_link);
    data.append("video_link", this.state.video_link);
    data.append("subject_id", this.state.subject_id);
    data.append("chapter_id", this.state.chapter_id);
    data.append("category_id", this.state.category_id);
    data.append("level", this.state.level);
    data.append("question", this.state.content.toString());
    data.append("answer_content", this.state.content1.toString());


    await this.props.updateQuestion(data);

    if (this.props.question) {
      this.props.handleUpdateSelectedQuestion(this.props.question);
    }

    // this.setState(resetObj);
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
    this.setState({ content: content, question_json: "" });
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
      <div className="block-content">
        {/* <div className="col-md-12"> */}
        {/* <div className="card">
            <div className="card-body"> */}
        {/* <form ref={(el) => (this.myFormRef = el)}> */}
        <div className="row">
          <div className="col-sm-6 col-form-div">
            <div className="form-group">
              <label className="col-sm-12 col-form-label">
                Mã câu hỏi
              </label>
              <div className="col-sm-12">
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
              <label className="col-sm-12 col-form-label">Chương</label>
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
                Tên bài
              </label>
              <div className="col-sm-12">
                <select
                  className="custom-select"
                  value={this.state.category_id}
                  name="category_id"
                  onChange={this._onChange}
                >
                  <option value="">-- Chọn bài --</option>
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
                <div>{this.state.question_json ? this.state.question_json : ""}</div>
                <SunEditor
                    onImageUploadBefore={this.handleImageUploadBefore}
                    height= {'400px'}
                    setContents={this.state.content1}
                    onChange={this._handleEditorContentChange}
                    setOptions={{
                      buttonList: BaseHelpers.getSunEditorOptions(),
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
                      buttonList: BaseHelpers.getSunEditorOptions(),
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
              <label className="col-sm-8 col-form-label">Đáp án</label>
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
              <label className="col-sm-8 col-form-label">Độ khó</label>
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
              <label className="col-sm-12 col-form-label">
                Tài liệu tham khảo
              </label>
              <div className="col-sm-12">
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
              className="btn btn-light mt-2 ml-2"
              data-dismiss="modal"
            >
              Huỷ
            </button>
            <button
              name="reset"
              value="1"
              className="btn btn-primary mt-2 ml-2"
              onClick={this.handleSave}
            >
              Cập nhật
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
      updateQuestion
    },
    dispatch
  );
}

// let CreateQuestionContainer = withRouter(
//   connect(mapStateToProps, mapDispatchToProps)(CreateQuestion)
// );

// export default CreateQuestionContainer;

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EditQuestion)
);

