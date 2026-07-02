import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Select } from "antd";

import {
  updateSetting,
  uploadImage,
  settingWebsite,
} from "../../redux/setting/action";
import baseHelpers from "../../helpers/BaseHelpers";
import katex from "katex";
import SunEditor from "suneditor-react";
const { Option } = Select;

class Setting extends Component {
  constructor(props) {
    super();
    this.state = {
      selectedFile: null,
      homepage_course_info: "",
      guide_study: "",
      uploadedImages: [],
    };
    this.editorHomepageCourceInfoRef = React.createRef();
    this.editorGuideStudyRef = React.createRef();
  }

  async componentDidMount() {
    await this.props.settingWebsite();

    var { homepage_course_info, guide_study } = this.props.setting;

    this.setState({
      homepage_course_info,
      guide_study,
    });
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
    const data = [];
    if (this.state.homepage_course_info)
      data.push({
        name: "Home Page",
        description: "Home Page",
        setting_name: "homepage_course_info",
        setting_value: this.state.homepage_course_info.toString(),
      });

    if (this.state.guide_study)
      data.push({
        name: "Hướng dẫn học",
        description: "Hướng dẫn học",
        setting_name: "guide_study",
        setting_value: this.state.guide_study.toString(),
      });

    await this.props.updateSetting({ setting: data });

    if (this.props.redirect === true) {
      await this.props.history.push("/setting");
    }
  };

  fetchRows() {
    if (this.props.tags instanceof Array) {
      return this.props.tags.map((obj, i) => {
        return <Option key={obj.name.toString()}>{obj.name}</Option>;
      });
    }
  }

  _uploadImageCallBack = async (file) => {
    const data = new FormData();
    data.append("files", file);

    await this.props.uploadImage(data);
    let uploadedImages = this.state.uploadedImages;

    if (this.props.image != null) {
      const imageObject = {
        file: file,
        localSrc: this.props.image,
      };

      uploadedImages.push(imageObject);

      this.setState({ uploadedImages: uploadedImages });
      return new Promise((resolve, reject) => {
        resolve({ data: { link: imageObject.localSrc } });
      });
    }
  };

  _handleEditorHomepageCourseInfoChange = (content) => {
    this.setState({ homepage_course_info: content });
  };

  _handleEditorGuideStudyChange = (content) => {
    this.setState({ guide_study: content });
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
    const { guide_study, homepage_course_info } = this.state;
    return (
      <div>
        {/* <div className="page-hero page-container" id="page-hero">
          <div className="padding d-flex">
            <div className="page-title">
              <h2 className="text-md text-highlight">Cài đặt</h2>
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
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <strong>Cấu hình cài đặt</strong>
                  </div>
                  <div className="card-body">
                    <form ref={(el) => (this.myFormRef = el)}>
                      <div className="row">
                        <div className="col-sm-12 col-form-div">
                          <div className="form-group">
                            <label className="col-sm-12 col-form-label">
                              Nội dung trang chủ
                            </label>
                            <div className="col-sm-12">
                              <SunEditor
                                  onImageUploadBefore={this.handleImageUploadBefore}
                                  height= {'600px'}
                                  setContents={this.state.homepage_course_info}
                                  onChange={this._handleEditorHomepageCourseInfoChange}
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
                            <label className="col-sm-12 col-form-label">
                              Hướng dẫn học
                            </label>
                            <div className="col-sm-12">
                              <SunEditor
                                  onImageUploadBefore={this.handleImageUploadBefore}
                                  height= {'400px'}
                                  setContents={this.state.guide_study}
                                  onChange={this._handleEditorGuideStudyChange}
                                  setOptions={{
                                    buttonList: baseHelpers.getSunEditorOptions(),
                                    katex: katex,
                                  }}
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
    redirect: state.question.redirect,
    image: state.question.image,
    setting: state.setting.data,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { updateSetting, uploadImage, settingWebsite },
    dispatch
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Setting)
);
