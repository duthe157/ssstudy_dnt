import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
  Select,
  Radio,
  notification,
} from "antd";
import {setLoader} from "../LoadingContext";
import $ from "jquery";
import {uploadImage} from "../../redux/question/action";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";


class ModalQuestion2 extends Component {
  constructor(props) {
    super();
    this.state = {
      questionNo: 1,
      type: 'TN_TRUE_FALSE',
      question: null,
      answera: true,
      answerb: true,
      answerc: true,
      answerd: true,
      user_answera: true,
      user_answerb: true,
      user_answerc: true,
      user_answerd: true,
      answer_content: null,
      doc_link: "",
      video_link: "",
      selectedFile: null,
      content: "",
      content1: "",
      uploadedImages: [],
      actionQuestion: 'create',
      currentQuestionvalue: null
    };
    this.editorRef = React.createRef();
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

    if (prevProps.questionNo !== this.props.questionNo) {
      this.setState({questionNo: this.props.questionNo});
    }

    if (prevProps.actionQuestion !== this.props.actionQuestion) {
      this.setState({actionQuestion: this.props.actionQuestion});
    }
    if (prevProps.currentQuestionvalue !== this.props.currentQuestionvalue && this.props.currentQuestionvalue) {
      const {answer, answer_content, doc_link, video_link, question_no} = this.props.currentQuestionvalue || {};
      const {a, b, c, d} = answer || {}
      let user_answerc = true
      let user_answerd = true

      if (c === undefined) {
        user_answerc = false
      }
      if (d === undefined) {
        user_answerd = false
      }
      this.setState({
        currentQuestionvalue: this.props.currentQuestionvalue,
        answera: a,
        answerb: b,
        answerc: c,
        answerd: d,
        answer_content, 
        doc_link: doc_link || "", 
        video_link: video_link || "",
        questionNo: question_no || this.props.questionNo || 1,
        user_answerc,
        user_answerd,
        content1: answer_content || ""
      });
    }
  };


  async componentDidMount() {
    this.resetState();
    // Khi component được mount, thêm sự kiện lắng nghe để reset state khi modal hiển thị
    $(document).on('show.bs.modal', '#modalQuestion2, #create2', () => {
      if (this.props.actionQuestion === 'create') {
        this.resetState();
        this.resetEditorContent();
      }
    });
    
    // Thêm sự kiện lắng nghe khi modal đóng
    $(document).on('hide.bs.modal', '#modalQuestion2, #create2', () => {
      this.resetEditorContent();
      this.resetState();
    });
  }

  componentWillUnmount() {
    // Xóa sự kiện lắng nghe khi component bị hủy
    $(document).off('show.bs.modal', '#modalQuestion2, #create2');
    $(document).off('hide.bs.modal', '#modalQuestion2, #create2');
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
      type: 'TN_TRUE_FALSE',
      question: null,
      answera: true,
      answerb: true,
      answerc: true,
      answerd: true,
      user_answera: true,
      user_answerb: true,
      user_answerc: true,
      user_answerd: true,
      answer_content: null,
      doc_link: "",
      video_link: "",
      selectedFile: null,
      content: "",
      content1: "",
      uploadedImages: [],
      currentQuestionvalue: null
    });
  }

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  handleSave = async (e) => {
    setLoader(true)
    e.preventDefault();
    let {examId, examSectionId, examSectionGroupId, examSectionSubjectId} = this.props

    let question = {
      exam_id: examId,
      exam_section_id: examSectionId === "" ? null : examSectionId,
      exam_section_group_id: examSectionGroupId === "" ? null : examSectionGroupId,
      subject_id: examSectionSubjectId === "" ? null : examSectionSubjectId,
      answer: {
        "a": this.state.answera,
        "b": this.state.answerb,
        // "c": this.state.answerc,
        // "d": this.state.answerd
      },
      answer_content: this.state.content1,
      type: this.state.type,
      doc_link: this.state.doc_link,
      video_link: this.state.video_link,
      question_no: this.state.questionNo
    }

    if (this.state.user_answerc === true) {
      question.answer.c = this.state.answerc
    }

    if (this.state.user_answerd === true) {
      question.answer.d = this.state.answerd
    }

    if (this.state.actionQuestion === 'create') {
      this.props.actionCreateQuestion(question)
    } else {
      question.question_id = this.state.currentQuestionvalue._id
      this.props.actionUpdateQuestion(question)
    }
    this.closeModal()
    setLoader(false)
  };

  closeModal = () => {
    // Đặt lại state và nội dung Editor trước khi đóng modal
    this.resetEditorContent();
    this.resetState();
    $('#close_create_2').trigger('click');
  }

  //change select option
  handleChange = (value) => {
    this.setState({
      tags: Object.assign([], value),
    });
  };

  _onChangeSwitch = e => {
    var name = e.target.name;
    let checked = e.target.checked;
    this.setState({
      [name]: checked,
    });
  };

  onChangeHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
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
    return (
      <div className="block-content">
        <div className="row">
          <div className="col-1 col-form-div">
            <div className="form-group">
              <label className="col-form-label">Câu</label>
            </div>
          </div>
          <div className="col-2 col-form-div">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                name="questionNo"
                onChange={this._onChange}
                value={this.state.questionNo}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-4 col-form-div">
            <div className="form-group">
              <label className="col-form-label">Đáp án</label>
            </div>
          </div>
          <div className="col-sm-4 border d-flex align-items-center">
            <label className="col-form-label mr-2">a)</label>
            <Radio.Group
              onChange={this._onChange}
              name="answera"
              value={this.state.answera}
            >
              <Radio value={true}>Đúng</Radio>
              <Radio value={false}>Sai</Radio>
            </Radio.Group>
          </div>
          <div className="col-sm-4 border d-flex align-items-center">
            <label className="col-form-label mr-2">b)</label>
            <Radio.Group
              onChange={this._onChange}
              name="answerb"
              value={this.state.answerb}
            >
              <Radio value={true}>Đúng</Radio>
              <Radio value={false}>Sai</Radio>
            </Radio.Group>
          </div>

          <div className="col-4 col-form-div">
          </div>
          <div className="col-sm-4 border d-flex align-items-center">
            <label className="col-form-label mr-2">c)</label>
            {this.state.user_answerc === true && (
              <Radio.Group
                onChange={this._onChange}
                name="answerc"
                value={this.state.answerc}
              >
                <Radio value={true}>Đúng</Radio>
                <Radio value={false}>Sai</Radio>
              </Radio.Group>
            )}
            <label className="ui-switch ui-switch-md info m-t-xs">
              <input
                type="checkbox"
                name="user_answerc"
                value={this.state.user_answerc}
                checked={this.state.user_answerc === true ? 'checked' : ''}
                onChange={this._onChangeSwitch}
              />{' '}
              <i/>
            </label>
          </div>
          <div className="col-sm-4 border d-flex align-items-center">
            <label className="col-form-label mr-2">d)</label>
            {this.state.user_answerd === true && (
              <div>
                <Radio.Group
                  onChange={this._onChange}
                  name="answerd"
                  value={this.state.answerd}
                >
                  <Radio value={true}>Đúng</Radio>
                  <Radio value={false}>Sai</Radio>
                </Radio.Group>
              </div>
            )}
            <label className="ui-switch ui-switch-md info m-t-xs">
              <input
                type="checkbox"
                name="user_answerd"
                value={this.state.user_answerd}
                checked={this.state.user_answerd === true ? 'checked' : ''}
                onChange={this._onChangeSwitch}
              />{' '}
              <i/>
            </label>
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
            {
              this.props.actionQuestion === "update" && (
                <button
                  name="reset"
                  value="1"
                  className="btn btn-primary mt-2 ml-2"
                  onClick={this.handleSave}
                >
                  Cập nhật
                </button>
              )
            }

            {
              this.props.actionQuestion === "create" && (
                <button
                  name="reset"
                  value="1"
                  className="btn btn-primary mt-2 ml-2"
                  onClick={this.handleSave}
                >
                  Lưu & Thêm mới
                </button>
              )
            }
            <button
              id='close_create_2'
              className="btn btn-light mt-2 ml-2"
              data-dismiss="modal"
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

function mapStateToProps(state) {
  return {
    image: state.question.image
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {uploadImage},
    dispatch
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalQuestion2)
);

