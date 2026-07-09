import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {bindActionCreators} from "redux";
import {
  createAdultEvaluation,
  createReview,
  listClassRoom,
  listClassroomGroup,
  listSubject, showAdultEvaluation, updateAdultEvaluation,
  uploadImageReview,
} from "../../redux/adultEvaluation/action";

import {Radio} from "antd";
import BaseHelpers from "../../helpers/BaseHelpers";
import {reviewUpdate} from "../../redux/review/action";

const uploadBoxStyle = {
  border: "2px dashed #ccc",
  borderRadius: "8px",
  padding: "40px 20px",
  textAlign: "center",
  cursor: "pointer",
  color: "#666",
};

const uploadIconStyle = {
  fontSize: "40px",
  marginBottom: "15px",
};

const TypeEvaluation = {
  HOC_SINH: 'HOC_SINH', //Dùng cho tâm tình học viên
  DANHGIA_PHUHUYNH: 'DANHGIA_PHUHUYNH',
  TOP_RANKS: 'TOP_RANKS'
};

class AdultEvaluationCreate extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      score: "",
      type: "DANHGIA_PHUHUYNH",
      description: "",
      content: "",
      status: true,
      files: "",
      avatar: "",
      external_link: "",
      classroom_id: "",
      subject_id: "",
      group_id: "",
      thumnailImg: "",
      videoType: "youtube",
      videoUrl: "",
      address: "",
      ordering: 1,
    };
    this.videoInputRef = React.createRef()
  }

  componentDidMount() {
    this.fetchDependentData();

    const {id} = this.props.match.params;

    if(id){
      this.fetchApiAdultEvaluation(id).then();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.fetchDependentData(prevState);
  }

  async fetchApiAdultEvaluation(id) {
    this.props.showAdultEvaluation(id)
    await this.props.showAdultEvaluation(this.props.match.params.id);
    if (this.props.adultEval) {
      const data = this.props.adultEval;

      const {data_json} = data;

      switch (data.type) {
        case TypeEvaluation.HOC_SINH: {
          this.setState({
            ...this.state,
            ...data.students,
            type: 'TAMTINHHOCVIEN',
            content: data.comment,
            classroom_id: data?.classroom?.id,
            subject_id: data?.subject?.id,
            status: data.hiden,
            external_link: data?.students?.links,
            group_id: data?.classroom_group?.id,
          });
          break;
        }

        case TypeEvaluation.DANHGIA_PHUHUYNH:
        case TypeEvaluation.TOP_RANKS: {
          this.setState({
            ...this.state,
            ...data,
            files: data_json?.image_popup || data_json?.image || data.image || '',
            avatar: data_json?.avatar || '',
            thumnailImg: data_json?.thumnailImg || '',
            videoUrl: data_json?.links || '',
            address: data_json?.address || '',
            score: data_json?.score || '',
            classroom_id: data?.classroom?.id,
            subject_id: data?.subject?.id,
            group_id: data?.classroom_group?.id,
          })
        }
      }
    }
  }

  fetchDependentData = (prevState = {}) => {
    if (![TypeEvaluation.HOC_SINH, TypeEvaluation.TOP_RANKS].includes(this.state.type)) return;

    const {subject_id, group_id, classroom_id} = this.state;
    const typeJustChanged = ![TypeEvaluation.HOC_SINH, TypeEvaluation.TOP_RANKS].includes(
      prevState.type
    );

    if (
      typeJustChanged ||
      prevState.subject_id !== subject_id ||
      prevState.group_id !== group_id
    ) {
      this.fetchListData(this.props.listClassRoom, {subject_id, group_id}).then();
    }

    if (typeJustChanged || prevState.group_id !== group_id) {
      this.fetchListData(this.props.listSubject, {group_id}).then();
    }

    if (typeJustChanged) {
      this.fetchListData(this.props.listClassroomGroup, {}).then();
    }
  };

  fetchListData = async (action, data) => {
    const baseParams = {
      keyword: this.state.keyword,
      page: 1,
      limit: 1000,
    };

    const cleanedData = this.cleanParams(data);

    await action({...baseParams, ...cleanedData});
  };

  cleanParams = (obj) => {
    const newObj = {};
    for (const key in obj) {
      if (obj[key]) {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  };

  onChangeImage = async (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const form = BaseHelpers.getFormDataUpload(files, "reviews");
      if (form) {
        return await this.props.uploadImageReview(form);
      }
    }
  };

  _onChange = async (e) => {
    let name = e.target.name;
    let value = e.target.value;
    if (name === "files") {
      value = await this.onChangeImage(e);
    }
    if (name === "thumnailImg" || name === "avatar") {
      const file = e.target.files[0];

      if (!file) {
        return;
      }

      const allowedTypes = ["image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        alert(
          "Định dạng file không hợp lệ! Vui lòng chỉ chọn file PNG hoặc JPEG."
        );
        e.target.value = null; // Reset input file
        return;
      }

      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSizeInBytes) {
        alert("Chỉ được upload file tối đa 1MB.");
        e.target.value = null; // Reset input file
        return;
      }
      value = await this.onChangeImage(e);
    }

    if (name === "videoFile") {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type !== "video/mp4") {
        alert("Định dạng video không hợp lệ! Vui lòng chỉ chọn file MP4.");
        e.target.value = null;
        return;
      }

      const maxSizeInBytes = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSizeInBytes) {
        alert("Chỉ được upload file tối đa 500MB.");
        e.target.value = null;
        return;
      }
      value = file;
    }

    if (name === "group_id") {
      // Khi chọn danh mục -> Reset môn học, khoá học -> Fetch lại listSubject
      this.setState({
        group_id: value,
        subject_id: "",
        classroom_id: "",
      });
      return;
    }

    if (name === "subject_id") {
      // Khi chọn môn học -> Reset khoá học -> Fetch lại listClassRoom
      this.setState({
        subject_id: value,
        classroom_id: "",
      });
      return;
    }

    if (name === "type") {
      this.setState({
        type: value,
        classroom_id: "",
        subject_id: "",
        group_id: "",
      });
      return;
    }

    this.setState({
      [name]: value,
    });
  };

  handleUploadBoxClick = () => {
    this.videoInputRef.current.click();
  };

  handleSubmit = async (submitType) => {
    const {
      name,
      score,
      description,
      content,
      files,
      status,
      type,
      classroom_id,
      subject_id,
      group_id,
      external_link,
      thumnailImg,
      videoType,
      videoUrl,
      videoFile,
      address,
      avatar,
    } = this.state;
    const data = {
      type,
    };

    if (type === "TOP_RANKS") {
      // data.type = 2;
      data.name = name;
      data.description = description;
      data.content = content;
      data.files = files;
      data.status = status;

      data.comment = content;
      data.hiden = status;
      data.classroom_id = classroom_id ? classroom_id : undefined;
      data.subject_id = subject_id ? subject_id : undefined;
      data.group_id = group_id ? group_id : undefined;
      data.data_json = {
        name,
        school: description,
        avatar: files,
        image_popup: avatar,
        score
      };
    }

    if (type === "TAMTINHHOCVIEN") {
      data.type = 0;
      data.comment = content;
      data.hiden = status;
      data.students = {
        name,
        description,
        classroom_id: classroom_id ? classroom_id : undefined,
        subject_id: subject_id ? subject_id : undefined,
        group_id: group_id ? group_id : undefined,
        links: external_link,
        images: files,
        avatar,
      };
    }

    if (type === "DANHGIA_PHUHUYNH") {
      // data.type = 1;
      data.comment = content;
      data.hiden = status;
      data.name = name;
      data.status = status;
      data.description = description;
      data.content = description;
      data.data_json = {
        name,
        description,
        image: files,
        address,
        status,
        thumnailImg,
        source: videoType,
      };
      if (videoType === "mp4") {
        data.data_json.links = videoFile;
      } else {
        data.data_json.links = videoUrl;
      }
    }

    if (submitType === 0) {
      console.log("Chưa làm");
      return;
    }

    const {id} = this.props.match.params;

    if(id){ //Chỉnh sửa
      if(type === "TAMTINHHOCVIEN")
        await this.props.reviewUpdate({id, ...data})
      else
        await this.props.updateAdultEvaluation({...data, id});

    }
    else{ //Thêm mới
      if (type === "TOP_RANKS" || type === "DANHGIA_PHUHUYNH") {
        await this.props.createAdultEvaluation(data);
      } else {
        await this.props.createReview(data);
      }
    }

    if (this.props.redirect && (this.props.adultEval || this.props.reviews)) {
      await this.props.history.push("/adult-evaluation");
    }
  };

  getImageSrc = (image) => {
    if (!image) return "";

    if (!(image instanceof File)) {
      return image;
    }

    return URL.createObjectURL(image)
  }

  render() {
    return (
      <div>
        <div className="page-content page-container" id="page-content">
          <div className="padding">
            <h2 className="text-md text-highlight sss-page-title">
              {this.props.match.params.id ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá'}
            </h2>
            <div className="flex"/>
            <div className="block-adult-create">
              <div className="row">
                <div className="col-md-10">
                  <div className="card">
                    <div className="card-header">
                      <strong>{this.props.match.params.id ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá'}</strong>
                    </div>
                    <div className="card-body">
                      <div className="form-group row">
                        <div className="col-sm-6">
                          <label className="col-form-label">Tên</label>
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              name="name"
                              onChange={this._onChange}
                              value={this.state.name}
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <label className="col-form-label">
                            {this.state.type === "TOP_RANKS"
                              ? "Trường"
                              : "Mô tả"}
                          </label>
                          <div>
                            <textarea
                              type="text"
                              className="form-control"
                              name="description"
                              onChange={this._onChange}
                              value={this.state.description}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-6">
                          <label className="col-form-label">
                            {this.state.type === "TOP_RANKS"
                              ? "Khoá học"
                              : "Nội dung"}
                          </label>
                          <div>
                            <textarea
                              type="text"
                              className="form-control"
                              name="content"
                              onChange={this._onChange}
                              value={this.state.content}
                            />
                          </div>
                        </div>
                        {this.state.type === "DANHGIA_PHUHUYNH" && (
                          <div className="col-sm-6">
                            <label className="col-form-label">Địa chỉ</label>
                            <div>
                              <textarea
                                type="text"
                                className="form-control"
                                name="address"
                                onChange={this._onChange}
                                value={this.state.address}
                                placeholder="Vui lòng nhập địa chỉ"
                                maxLength={30}
                              />
                            </div>
                          </div>
                        )}
                        {this.state.type !== "DANHGIA_PHUHUYNH" && (
                          <>
                            <div className={"col-sm-3"}>
                              <label className=" col-form-label">
                                {this.state.type === "TOP_RANKS"
                                  ? "Ảnh đại diện"
                                  : "Hình ảnh"}
                              </label>
                              <div className="">
                                <input
                                  onChange={this._onChange}
                                  type="file"
                                  className="form-control-file"
                                  name="files"
                                />

                                {
                                  this.state.files &&
                                  <>
                                    <img style={{width: '200px'}} className='mt-3' src={this.getImageSrc(this.state.files)} alt=""/>

                                    <div>
                                      <button
                                        className="btn btn-primary mt-2"
                                        onClick={() => this.setState({
                                          files: null,
                                        })}
                                      >
                                        Xoá file
                                      </button>
                                    </div>
                                  </>
                                }
                              </div>
                            </div>
                            <div className="col-sm-3">
                              <label className=" col-form-label">
                                {this.state.type === "TOP_RANKS"
                                  ? "Ảnh Popup"
                                  : "Avatar"}
                              </label>
                              <div className="">
                                <input
                                  onChange={this._onChange}
                                  type="file"
                                  className="form-control-file"
                                  name="avatar"
                                />

                                {
                                  this.state?.avatar &&
                                  <>
                                    <img style={{width: '200px'}} className='mt-3' src={this.getImageSrc(this.state.avatar)} alt=""/>

                                    <div>
                                      <button
                                        className="btn btn-primary mt-2"
                                        onClick={() => this.setState({
                                          avatar: null,
                                        })}
                                      >
                                        Xoá file
                                      </button>
                                    </div>
                                  </>
                                }

                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {this.state.type === "TOP_RANKS" && (
                        <div className="form-group row">
                          <div className="col-sm-6">
                            <label className=" col-form-label">Điểm</label>
                            <div>
                              <input
                                type="text"
                                className="form-control"
                                name="score"
                                onChange={this._onChange}
                                value={this.state.score}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="form-group row">
                        <div className="col-sm-6">
                          <label className=" col-form-label">Chọn loại</label>
                          <div>
                            <select
                              className="form-control"
                              name="type"
                              onChange={this._onChange}
                              value={this.state.type}
                            >
                              <option value="DANHGIA_PHUHUYNH">
                                Đánh giá Phụ Huynh
                              </option>
                              <option value="TOP_RANKS">Bảng vàng thành tích</option>
                              <option value="TAMTINHHOCVIEN">
                                Tâm tình học viên
                              </option>
                            </select>
                          </div>
                        </div>
                        {this.state.type === "DANHGIA_PHUHUYNH" && (
                          <>
                            <div className="col-sm-3">
                              <label className=" col-form-label">
                                Hình ảnh
                              </label>
                              <div className="">
                                <input
                                  onChange={this._onChange}
                                  type="file"
                                  className="form-control-file"
                                  name="files"
                                />

                                {
                                  this.state?.files &&
                                  <>
                                    <img style={{width: '200px'}} className='mt-3' src={this.getImageSrc(this.state.files)} alt=""/>

                                    <div>
                                      <button
                                        className="btn btn-primary mt-2"
                                        onClick={() => this.setState({
                                          files: null,
                                        })}
                                      >
                                        Xoá file
                                      </button>
                                    </div>
                                  </>
                                }
                              </div>
                            </div>
                            <div className="col-sm-3">
                              <label className=" col-form-label">
                                Ảnh phủ video
                              </label>
                              <div className="">
                                <input
                                  onChange={this._onChange}
                                  type="file"
                                  className="form-control-file"
                                  name="thumnailImg"
                                />

                                {
                                  this.state?.thumnailImg &&
                                  <>
                                    <img style={{width: '200px'}} className='mt-3' src={this.getImageSrc(this.state.thumnailImg)} alt=""/>

                                    <div>
                                      <button
                                        className="btn btn-primary mt-2"
                                        onClick={() => this.setState({
                                          thumnailImg: null,
                                        })}
                                      >
                                        Xoá file
                                      </button>
                                    </div>
                                  </>
                                }
                              </div>
                            </div>
                          </>
                        )}

                        {this.state.type !== "DANHGIA_PHUHUYNH" && (
                          <div className="col-sm-6">
                            <label className=" col-form-label">Danh mục</label>
                            <div>
                              <select
                                className="form-control"
                                name="group_id"
                                onChange={this._onChange}
                                value={this.state.group_id}
                              >
                                <option value="">Chọn danh mục</option>
                                {this.props?.classroomGroups?.map((item) => (
                                  <option key={item._id} value={item._id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="form-group row">
                        <div className="col-sm-6">
                          <label className=" col-form-label">Trạng thái</label>
                          <div>
                            <Radio.Group
                              onChange={this._onChange}
                              name="status"
                              value={this.state.status}
                            >
                              <Radio value={true}>Hiển thị</Radio>
                              <Radio value={false}>Ẩn</Radio>
                            </Radio.Group>
                          </div>
                        </div>

                        {this.state.type !== "DANHGIA_PHUHUYNH" && (
                          <>
                            <div className="col-sm-3">
                              <label className=" col-form-label">Môn học</label>
                              <div>
                                <select
                                  className="form-control"
                                  name="subject_id"
                                  onChange={this._onChange}
                                  disabled={!this.state.group_id}
                                  value={this.state.subject_id}
                                >
                                  <option value="">Chọn môn học</option>

                                  {this.props?.subjects?.map((item) => (
                                    <option key={item._id} value={item._id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="col-sm-3">
                              <label className=" col-form-label">
                                Khoá học
                              </label>
                              <div>
                                <select
                                  className="form-control"
                                  name="classroom_id"
                                  onChange={this._onChange}
                                  disabled={!this.state.subject_id}
                                  value={this.state.classroom_id}
                                >
                                  <option value="">Chọn khoá học</option>
                                  {this.props?.classrooms?.map((item) => (
                                    <option key={item._id} value={item._id}>
                                      {item.name}
                                    </option>
                                  ))}ía
                                </select>
                              </div>
                            </div>
                          </>
                        )}

                        {this.state.type === "DANHGIA_PHUHUYNH" && (
                          <>
                            <div className="col-sm-2">
                              <label className=" col-form-label">Nguồn</label>
                              <div>
                                <select
                                  className="form-control"
                                  name="videoType"
                                  onChange={this._onChange}
                                >
                                  <option value="youtube">Youtube</option>
                                  <option value="mp4">Tự lưu trữ</option>
                                </select>
                              </div>
                            </div>
                            {this.state.videoType === "youtube" ? (
                              <div className="col-sm-4">
                                <label className=" col-form-label">
                                  Liên kết
                                </label>
                                <div>
                                  <input
                                    type="url"
                                    className="form-control"
                                    name="videoUrl"
                                    onChange={this._onChange}
                                    value={this.state.videoUrl}
                                    placeholder="Vui lòng nhập URL"
                                    maxLength={500}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="col-sm-12 row">
                                <div className="col-sm-6"/>
                                <div className="col-sm-6">
                                  <label className=" col-form-label">
                                    Chọn file video
                                  </label>
                                  <div
                                    style={uploadBoxStyle}
                                    onClick={this.handleUploadBoxClick}
                                  >
                                    <div style={uploadIconStyle}>
                                      <i className="fa fa-upload"></i>{" "}
                                    </div>
                                    {this.state.videoFile ? (
                                      <strong>
                                        Đã chọn file:{" "}
                                        {this.state.videoFile.name}
                                      </strong>
                                    ) : (
                                      <span>
                                        <strong>Upload video</strong>
                                        <br/>
                                        Định dạng mp4. Max size: 500MB
                                      </span>
                                    )}
                                  </div>
                                  <input
                                    type="file"
                                    name="videoFile"
                                    ref={this.videoInputRef}
                                    onChange={this._onChange}
                                    accept="video/mp4"
                                    style={{display: "none"}} // Ẩn input file gốc
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {this.state.type === "TAMTINHHOCVIEN" && (
                        <div className="form-group row">
                          <div className="col-sm-6"/>
                          <div className="col-sm-6">
                            <label className="col-form-label">Link</label>
                            <div>
                              <input
                                type="url"
                                className="form-control"
                                name="external_link"
                                onChange={this._onChange}
                                value={this.state.external_link}
                                placeholder="Vui lòng nhập URL"
                                maxLength={500}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="form-group row">
                        <div className="col-sm-12 text-right">
                          <button
                            className="btn btn-primary mt-2"
                            onClick={() => this.handleSubmit(1)}
                          >
                            Lưu
                          </button>
                          {/*<button*/}
                          {/*  className="btn btn-primary mt-2 ml-2"*/}
                          {/*  onClick={() => this.handleSubmit(1)}*/}
                          {/*>*/}
                          {/*  Lưu & Thêm mới*/}
                          {/*</button>*/}
                        </div>
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
    classrooms: state.adultEvals.classrooms ? state.adultEvals.classrooms : [],
    subjects: state.adultEvals.subjects ? state.adultEvals.subjects : [],
    classroomGroups: state.adultEvals.classroomGroups
      ? state.adultEvals.classroomGroups
      : [],
    adultEval: state.adultEvals.adultEval,
    redirect: state.adultEvals.redirect || state.review.redirect,
    reviews: state.review.review
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createAdultEvaluation,
      uploadImageReview,
      createReview,
      listClassRoom,
      listSubject,
      listClassroomGroup,
      showAdultEvaluation,
      reviewUpdate,
      updateAdultEvaluation
    },
    dispatch
  );
}

let ContainerCreate = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AdultEvaluationCreate)
);

export default ContainerCreate;
