import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { listSubject } from "../../redux/subject/action";
import $ from "jquery";
import { notification } from "antd";

class ModalGroupQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      subjectData: [],
      minNumber: 0,
      actionGroup: "create",
      groupDetail: null,
    };
  }

  componentDidUpdate(prevProps) {
    const { subjects, actionGroup, groupDetail } = this.props;

    if (prevProps.subjects !== subjects) {
      this.updateSubjectData(subjects);
    }

    if (prevProps.actionGroup !== actionGroup) {
      this.setState({ actionGroup });
    }

    if (prevProps.groupDetail !== groupDetail) {
      this.handleGroupDetailUpdate(groupDetail);
    }
  }

  updateSubjectData = (subjects) => {
    if (Array.isArray(subjects)) {
      const subjectData = subjects.map((obj, i) => ({
        _id: obj._id,
        name: obj.name,
        index: i,
        checked: false,
      }));
      this.setState({ subjectData });
    }
  };

  handleGroupDetailUpdate = (groupDetail) => {
    const { subjectData } = this.state;

    if (groupDetail) {
      const updatedSubjects = subjectData.map((obj) => ({
        ...obj,
        checked: groupDetail.subjects.some(
          (subject) => subject.subject_id === obj._id
        ),
      }));

      this.setState({
        name: groupDetail.exam_section_group_name || "",
        minNumber: groupDetail.number_subject_require || 0,
        subjectData: updatedSubjects,
        groupDetail,
      });
    }
  };

  handleCheckboxChange = (id) => {
    this.setState((prevState) => ({
      subjectData: prevState.subjectData.map((subject) =>
        subject._id === id ? { ...subject, checked: !subject.checked } : subject
      ),
    }));
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  renderSubjects = () => {
    const { subjectData } = this.state;
    return subjectData.map((obj) => (
      <div
        key={obj._id}
        className="d-flex align-items-center p-2 rounded border border-gray-200 col-4"
      >
        <input
          type="checkbox"
          checked={obj.checked}
          onChange={() => this.handleCheckboxChange(obj._id)}
          id={`subject-${obj._id}`}
          className="mr-2"
        />
        <label htmlFor={`subject-${obj._id}`} className="text-gray-700 mb-0">
          {obj.name}
        </label>
      </div>
    ));
  };

  createOrUpdateGroup = () => {
    const { name, minNumber, subjectData, actionGroup, groupDetail } = this.state;

    if (!this.validateCreate()) return;

    const subjects = subjectData
      .filter((obj) => obj.checked)
      .map(({ _id, index, name, code }) => ({ id: _id, key: index, name, code }));

    const data = {
      exam_section_group_name: name,
      number_subject_require: minNumber,
      ...(actionGroup === "update" && {
        exam_id: groupDetail.exam_id,
        exam_section_name: name,
        exam_section_id: groupDetail.exam_section_id,
        exam_section_group_id: groupDetail._id,
      }),
    };

    if (actionGroup === "create") {
      this.props.createGroupQuestion(subjects, data);
    } else {
      this.props.updateGroupQuestion(subjects, data);
      window.location.reload();
    }

    this.closeModal();
  };

  validateCreate = () => {
    const { name, subjectData } = this.state;

    if (!name.trim()) {
      this.showError("Vui lòng nhập tên nhóm");
      return false;
    }

    if (!subjectData.some((obj) => obj.checked)) {
      this.showError("Vui lòng chọn môn học");
      return false;
    }

    return true;
  };

  showError = (message) => {
    notification.error({
      message,
      placement: "topRight",
      duration: 3,
    });
  };

  closeModal = () => {
    $("#close_create_group").trigger("click");
  };

  countActiveSubjects = () => {
    return this.state.subjectData.filter((obj) => obj.checked).length;
  };

  render() {
    const { actionGroup, name, minNumber } = this.state;
    const isUpdate = actionGroup === "update";

    return (
      <div className="block-content">
        <div className="form-group">
          <label className="title-block">
            {isUpdate ? "CẬP NHẬT NHÓM CHỦ ĐỀ" : "THÊM NHÓM CHỦ ĐỀ"}
          </label>
        </div>

        <div className="form-group" style={{ width: "400px" }}>
          <label className="text-form-label">Tên nhóm chủ đề</label>
          <input
            type="text"
            className="form-control"
            name="name"
            onChange={this.handleInputChange}
            value={name}
          />
        </div>

        <div>
          <label className="text-form-label">Môn học</label>
          <div className="row">{this.renderSubjects()}</div>
        </div>

        <div className="row ma-2 ml-12 mt-2 align-items-center">
          <label className="text-form-label">Bắt buộc chọn</label>
          <input
            type="number"
            min="0"
            className="form-control"
            name="minNumber"
            onChange={this.handleInputChange}
            value={minNumber}
            style={{ width: "100px" }}
          />{" "}
          Trong tổng số {this.countActiveSubjects()} môn học
        </div>

        <div className="form-group row">
          <button
            type="button"
            className="btn btn-primary ma-2 ml-12 mt-2"
            onClick={this.createOrUpdateGroup}
          >
            {isUpdate ? "Cập nhật" : "Lưu & Thêm mới"}
            <img src="/assets/img/icon-add.svg" className="ml-10" alt="" />
          </button>

          <button
            id="close_create_group"
            className="btn btn-light mt-2 ml-2"
            data-dismiss="modal"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    );
  }
}

ModalGroupQuestion.propTypes = {
  subjects: PropTypes.array.isRequired,
  listSubject: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  subjects: state.subject.subjects,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ listSubject }, dispatch);

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalGroupQuestion)
);
