import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from "query-string";
import {
  listAdultEvaluation,
  checkInputItem,
  addDataRemoveAdultEval,
  onDeleteAdultEval,
  listClassRoom,
  listSubject,
  listClassroomGroup,
  listModalClassRoom,
  listModalSubject,
  listModalClassroomGroup,
  updateReviews,
} from "./../../redux/adultEvaluation/action";
import BaseHelper from "./../../helpers/BaseHelpers";


const TypeReview = {
  HOC_SINH: 'Tâm tình học viên',
  DANHGIA_PHUHUYNH: 'Đánh giá phụ huynh',
  TOP_RANKS: 'Bảng vàng thành tích'
};


class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
		};
		this.normalizedObj = BaseHelper.normalizeEvaluationData(props.obj);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.check !== nextProps.check) {
			this.setState({
				check: nextProps.check,
			});
		}
		if (this.props.obj !== nextProps.obj) {
			this.normalizedObj = BaseHelper.normalizeEvaluationData(nextProps.obj);
		}
	}

  handleCheckBox = (e) => {
    if (e.target.checked) {
      this.props.handleCheckedIds(
        this.props.obj._id,
        this.props.obj.type,
        "add"
      );
      this.setState({
        check: e.target.checked,
      });
    } else {
      this.props.handleCheckedIds(
        this.props.obj._id,
        this.props.obj.type,
        "remove"
      );
      this.setState({
        check: e.target.checked,
      });
    }
  };

  componentDidMount() {}

  handleChangeStatus = async (e) => {
    var name = e.target.name;
    var checked = e.target.checked;
    var value = e.target.value;
  };

  handleCheck = async (e) => {
    this.props.onDeleteOne(true);
    this.props.addDataRemoveAdultEval({
      ids: this.props.obj._id,
    });
  };

  render() {
    return (
      <tr className="v-middle" data-id={17}>
        <td>
          <label className="ui-check m-0">
            <input
              type="checkbox"
              className="checkInputItem"
              name="checkItem"
              value={this.props.obj._id}
              reviewtype={this.props.obj.type}
              onChange={this.handleCheckBox}
            />{" "}
            <i />
          </label>
        </td>
        <td className="flex">
          <Link
            className="item-author text-color"
            to={"/adult-evaluation/" + this.props.obj._id + "/edit"}
          >
            {this.normalizedObj.name}
          </Link>
        </td>
        <td className="text-left">
          <span className="item-amount d-none d-sm-block text-sm">
            {this.normalizedObj.description}
          </span>
        </td>
        <td className="text-left">
          <span className="item-amount d-none d-sm-block text-sm">
            {this.normalizedObj.content}
          </span>
        </td>
        <td className="text-left">
          <span className="item-amount d-none d-sm-block text-sm">
            {this.props.obj.typeTitle}
          </span>
        </td>
        <td className="text-left">
          <span className="item-amount d-none d-sm-block text-sm">
            <label className="ui-switch ui-switch-md info m-t-xs">
              <input
                type="checkbox"
                name="status"
                value={this.props.obj._id}
                checked={this.state.status === true ? "checked" : ""}
                onChange={this.handleChangeStatus}
              />{" "}
              <i />
            </label>
          </span>
        </td>
        <td className="text-center">
          <span className="item-amount d-none d-sm-block text-sm">
            {this.props.obj.updated_at &&
              Moment(this.props.obj.updated_at).format("DD/MM/YYYY HH:mm:ss")}
          </span>
        </td>
        <td>
          <div className="item-action dropdown">
            <a href="/" data-toggle="dropdown" className="text-muted">
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
                className="feather feather-more-vertical"
              >
                <circle cx={12} cy={12} r={1} />
                <circle cx={12} cy={5} r={1} />
                <circle cx={12} cy={19} r={1} />
              </svg>
            </a>
            <div
              className="dropdown-menu dropdown-menu-right bg-white"
              role="menu"
            >
              <Link
                className="dropdown-item"
                to={"/adult-evaluation/" + this.props.obj._id + "/edit"}
              >
                Sửa
              </Link>
              <div className="dropdown-divider" />
              <button
                onClick={this.handleCheck}
                className="dropdown-item trash"
                data-toggle="modal"
                data-target="#delete-video"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
              >
                Xóa
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }
}

class AdultEvaluation extends Component {
  constructor(props) {
    super();
    this.state = {
      keyword: "",
      data: [],
      limit: 20,
      page: 1,
      type: "",
      classroom_id: "",
      subject_id: "",
      group_id: "",
      courseForm: "",
      subjectForm: "",
      categoryForm: "",
      activePage: 1,
      ids: [],
      students: [],
      checkAll: false,
    };
  }

	fetchRows() {
		if (this.props.adultEvals instanceof Array) {
			return this.props.adultEvals.map((object, i) => {
        const customObj = {...object, typeTitle: TypeReview[object.type] || object.type};
				return (
					<Row
						obj={customObj}
						key={object._id}
						index={i}
						handleCheckedIds={this.handleCheckedIds}
						addDataRemoveAdultEval={this.props.addDataRemoveAdultEval}
						checkInputItem={this.props.checkInputItem}
						onDeleteOne={this.onDeleteOne}
						check={this.props.check}
					/>
				);
			});
		}
	}

  componentDidMount() {
    const url = this.props.location.search;
    let params = queryString.parse(url);

    this.setState({
      keyword: params.keyword ? params.keyword : "",
      type: params.type ? params.type : "",
      limit: params.limit ? params.limit : 20,
      page: params.page ? params.page : 1,
    });

    this.getData(this.state.activePage).then();
    this.fetchDependentData();

    this.fetchModalInitialData();
  }

  componentDidUpdate(prevProps, prevState) {
    this.fetchDependentData(prevState);
    this.fetchModalDependentData(prevState);
  }

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			limit: this.state.limit,
			type: this.state.type,
		};

		params.page = pageNumber;

		await this.props.listAdultEvaluation(params);
	};

  fetchModalInitialData = () => {
    const params = { page: 1, limit: 1000 };
    this.props.listModalClassRoom(params);
    this.props.listModalSubject(params);
    this.props.listModalClassroomGroup(params);
  };

  fetchModalDependentData = (prevState = {}) => {
    const { courseForm, subjectForm, categoryForm } = this.state;

    const courseChanged = prevState.courseForm !== courseForm;
    const subjectChanged = prevState.subjectForm !== subjectForm;
    const categoryChanged = prevState.categoryForm !== categoryForm;

    if (!courseChanged && !subjectChanged && !categoryChanged) {
      return;
    }

    if (subjectChanged || categoryChanged) {
      this.fetchListData(this.props.listModalClassRoom, {
        subject_id: subjectForm,
        group_id: categoryForm,
      });
    }

    if (courseChanged || categoryChanged) {
      this.fetchListData(this.props.listModalSubject, {
        classroom_id: courseForm,
        group_id: categoryForm,
      }).then();
    }

    if (courseChanged || subjectChanged) {
      this.fetchListData(this.props.listModalClassroomGroup, {
        classroom_id: courseForm,
        subject_id: subjectForm,
      }).then();
    }
  };

  fetchDependentData = (prevState = {}) => {
    if (this.state.type !== "TAMTINHHOCVIEN") return;

    const { subject_id, group_id, classroom_id } = this.state;
    const typeJustChanged =
      prevState.type !== "TAMTINHHOCVIEN" ||
      prevState.keyword !== this.state.keyword;

    if (
      typeJustChanged ||
      prevState.subject_id !== subject_id ||
      prevState.group_id !== group_id
    ) {
      this.fetchListData(this.props.listClassRoom, { subject_id, group_id });
    }

    if (
      typeJustChanged ||
      prevState.group_id !== group_id ||
      prevState.classroom_id !== classroom_id
    ) {
      this.fetchListData(this.props.listSubject, { group_id, classroom_id });
    }

    if (
      typeJustChanged ||
      prevState.subject_id !== subject_id ||
      prevState.classroom_id !== classroom_id
    ) {
      this.fetchListData(this.props.listClassroomGroup, {
        subject_id,
        classroom_id,
      });
    }
  };

  fetchListData = async (action, data) => {
    const baseParams = {
      keyword: this.state.keyword,
      page: 1,
      limit: 1000,
    };

    const cleanedData = this.cleanParams(data);

    await action({ ...baseParams, ...cleanedData });
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

	// async componentDidMount() {
	// 	await this.props.listAdultEvaluation(this.getData());

	// 	if (this.props.limit) {
	// 		await this.setState({
	// 			limit: this.props.limit,
	// 			checkAll: false,
	// 			ids: this.props.ids
	// 		});
	// 	}
	// }

  onDeleteOne = async (onResetIds) => {
    if (onResetIds) {
      this.setState({
        ids: [],
      });
    }
  };

  handleCheckedIds = async (id, reviewType, type = "") => {
    const _ids = this.state.ids;
    const _students = this.state.students;
    if (type === "add") {
      if (_ids.indexOf(id) < 0) {
        _ids.push(id);
      }
      if (
        reviewType === "TAMTINHHOCVIEN" &&
        !_students.some((obj) => obj.id === id)
      ) {
        _students.push({ id, reviewType });
      }
    }
    if (type === "remove") {
      let index = _ids.indexOf(id);
      if (index > -1) {
        _ids.splice(index, 1);
      }
      if (reviewType === "TAMTINHHOCVIEN") {
        let index = _students.findIndex((obj) => obj.id === id);
        if (index > -1) {
          _students.splice(index, 1);
        }
      }
    }

    this.setState({
      ids: _ids,
    });
  };

  onChange = (e) => {
    const name = e.target.name,
     value = e.target.value;
    this.setState({
      [name]: value,
    },
      () => this.getData()
    );
  };

	onSubmit = async (e) => {
		e.preventDefault();

    let { keyword, page, limit, type, classroom_id, subject_id, group_id } =
      this.state;

    this.props.history.push(
      `/adult-evaluation?keyword=${keyword}&page=${page}&limit=${limit}&type=${type}&classroom_id=${classroom_id}&subject_id=${subject_id}&group_id=${group_id}`
    );

		await this.getData(1);
	};

  handleChangePage = async (pageNumber) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.setState({
      page: pageNumber,
    });

    let { keyword, page, limit, type, classroom_id, subject_id, group_id } =
      this.state;

    this.props.history.push(
      `/adult-evaluation?keyword=${keyword}&page=${page}&limit=${limit}&type=${type}&classroom_id=${classroom_id}&subject_id=${subject_id}&group_id=${group_id}`
    );

		await this.getData(pageNumber);
	};

  handleDelete = async () => {
    let inputs = document.querySelectorAll(".checkInputItem");
    let data = this.props.dataRemoveAdultEval;

    if (this.state.ids && this.state.ids.length > 0) {
      data = {
        ids: this.state.ids,
      };
    }

		await this.props.onDeleteAdultEval(data);
		this.getData(1).then();

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}

    this.setState({
      ids: [],
    });
  };

  handleEdits = async () => {
    console.log(this.state);
    const { courseForm, subjectForm, categoryForm, students } = this.state;
    const ids = students?.map((student) => student.id);

    const isSuccess = await this.props.updateReviews({
      ids,
      classroom_id: courseForm,
      subject_id: subjectForm,
      group_id: categoryForm,
    });

    if (isSuccess) {
      this.getData().then();
    }

    this.setState({
      courseForm: "",
      subjectForm: "",
      categoryForm: "",
    });
  };

  handleChange = async (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
        [name]: value,
      },
       async () => {
        let { keyword, page, limit, type, classroom_id, subject_id, group_id } =
          this.state;

        this.props.history.push(
          `/adult-evaluation?keyword=${keyword}&page=${page}&limit=${limit}&type=${type}&classroom_id=${classroom_id}&subject_id=${subject_id}&group_id=${group_id}`
        );

        await this.getData(1);
      }
    );
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}
	}

  handleCheckAll = async (e) => {
    var inputs = document.querySelectorAll(".checkInputItem");
    var flag = false;

		if (e.target.checked) {
			flag = true;
		}

    let _ids = [];
    let _students = [];
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].checked = flag;
      const reviewType = inputs[i].getAttribute("reviewtype");
      if (flag) {
        if (reviewType === "TAMTINHHOCVIEN") {
          _students.push({ id: inputs[i].value, reviewType });
        }
        _ids.push(inputs[i].value);
      } else {
        _ids = [];
        _students = [];
      }
    }

    this.setState({
      ids: _ids,
      students: _students,
    });
  };

  handleDeleteAll = async (e) => {
    var data = this.state.data;
    if (data.length === 0) {
      notification.warning({
        message: "Vui lòng chọn mục để xóa !",
        placement: "topRight",
        top: 50,
        duration: 3,
      });
    }
  };

  render() {
    let displayFrom =
      this.props.page === 1
        ? 1
        : (parseInt(this.props.page) - 1) * this.props.limit;
    let displayTo =
      this.props.page === 1 ? this.props.limit : displayFrom + this.props.limit;
    displayTo = displayTo > this.props.total ? this.props.total : displayTo;
    return (
      <div>
        <div className="page-content page-container" id="page-content">
          <div className="padding">
            <h2 className="text-md text-highlight sss-page-title">Đánh giá</h2>
            <div className="flex" />
            <div className="block-table-adult">
              <div className="toolbar">
                {/* <div className="btn-group">
									{this.props.ids.length !== 0 ? (
										<button
											className="btn btn-icon"
											data-toggle="modal"
											data-target="#delete-video"
											data-toggle-class="fade-down"
											data-toggle-class-target=".animate"
											title="Trash"
											id="btn-trash">
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
												className="feather feather-trash text-muted">
												<polyline points="3 6 5 6 21 6" />
												<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
											</svg>
										</button>
									) : (
										<button
											className="btn btn-icon"
											onClick={this.handleDeleteAll}
											title="Trash"
											id="btn-trash">
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
												className="feather feather-trash text-muted">
												<polyline points="3 6 5 6 21 6" />
												<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
											</svg>
										</button>
									)}
								</div> */}
                <form className="flex" onSubmit={this.onSubmit}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-theme keyword-custom"
                      placeholder="Nhập từ khoá tìm kiếm..."
                      onChange={this.onChange}
                      name="keyword"
                    />{" "}
                    <div
                      className="ml-16"
                      style={{
                        flex: this.state.type === "TAMTINHHOCVIEN" ? 1 : "none",
                      }}
                    >
                      <select
                        className="custom-select"
                        value={this.state.type}
                        name="type"
                        onChange={this.onChange}
                      >
                        <option value="">Nhóm</option>
                        <option value="TOP_RANKS">Bảng vàng thành tích</option>
                        <option value="DANHGIA_PHUHUYNH">
                          Đánh giá phụ huynh
                        </option>
                        <option value="HOC_SINH">
                          Tâm tình học viên
                        </option>
                      </select>
                    </div>
                    <div className="ml-16" style={{ flex: 1 }}>
                      <select
                        className="custom-select"
                        value={this.state.type}
                        name="classroom_id"
                        onChange={this.onChange}
                      >
                        <option value="">Chọn khoá học</option>
                        {this.props?.classrooms?.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="ml-16" style={{ flex: 1 }}>
                      <select
                        className="custom-select"
                        value={this.state.type}
                        name="subject_id"
                        onChange={this.onChange}
                      >
                        <option value="">Chọn môn học</option>
                        {this.props?.subjects?.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="ml-16" style={{ flex: 1 }}>
                      <select
                        className="custom-select"
                        value={this.state.type}
                        name="group_id"
                        onChange={this.onChange}
                      >
                        <option value="">Chọn danh mục</option>
                        {this.props?.classroomGroups?.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="input-group-append">
                      <button className="btn btn-white btn-sm" type="submit">
                        <span className="d-flex text-muted">
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
                            className="feather feather-search"
                          >
                            <circle cx={11} cy={11} r={8} />
                            <line x1={21} y1={21} x2="16.65" y2="16.65" />
                          </svg>
                        </span>
                      </button>
                    </span>
                  </div>
                </form>
              </div>

              <div className="row">
                <div className="col-sm-12">
                  <table className="table table-theme table-row v-middle">
                    <thead className="text-muted">
                      <tr>
                        <th width="10px">
                          <label className="ui-check m-0">
                            <input
                              type="checkbox"
                              name="checkAll"
                              id="checkAll"
                              onChange={this.handleCheckAll}
                            />{" "}
                            <i />
                          </label>
                          {this.state.ids.length !== 0 && (
                            <button
                              className="btn btn-icon ml-16"
                              data-toggle="modal"
                              data-target="#delete-video"
                              data-toggle-class="fade-down"
                              data-toggle-class-target=".animate"
                              title="Trash"
                              id="btn-trash"
                            >
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
                                className="feather feather-trash text-muted"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                          {this.state.students.length !== 0 && (
                            <button
                              className="btn btn-icon ml-16"
                              data-toggle="modal"
                              data-target="#edit-review"
                              data-toggle-class="fade-down"
                              data-toggle-class-target=".animate"
                              title="Edit"
                              id="btn-edit"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 640"
                                width={16}
                                height={16}
                              >
                                <path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z" />
                              </svg>
                            </button>
                          )}
                        </th>
                        <th>Tên</th>
                        <th className="text-left">Mô tả</th>
                        <th width="350px" className="text-left">
                          Nội dung
                        </th>
                        <th width="350px" className="text-left">
                          Nhóm
                        </th>
                        <th className="text-left">Kích hoạt</th>
                        <th className="text-center">Thời gian cập nhật</th>
                        <th width="50px" />
                      </tr>
                    </thead>
                    <tbody>{this.fetchRows()}</tbody>
                  </table>
                </div>
              </div>

              <div className="row listing-footer">
                <div className="col-sm-1">
                  <select
                    className="custom-select w-70"
                    name="limit"
                    value={this.state.limit}
                    onChange={this.handleChange}
                  >
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="-1">ALL</option>
                  </select>
                </div>
                <div className="col-sm-6 showing-text">
                  {" "}
                  Hiển thị từ <b>{displayFrom}</b> đến <b>{displayTo}</b> trong
                  tổng số <b>{this.props.total}</b>
                </div>
                {this.props.total !== 0 ? (
                  <div className="col-sm-5 text-right">
                    <Pagination
                      activePage={this.props.page}
                      itemsCountPerPage={this.props.limit}
                      totalItemsCount={this.props.total}
                      pageRangeDisplayed={10}
                      onChange={this.handleChangePage}
                    />
                  </div>
                ) : (
                  <div className="">Không có bản ghi nào</div>
                )}
              </div>

              <div
                id="delete-video"
                className="modal fade"
                data-backdrop="true"
                style={{ display: "none" }}
                aria-hidden="true"
              >
                <div
                  className="modal-dialog animate fade-down"
                  data-class="fade-down"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <div className="modal-title text-md">Thông báo</div>
                      <button className="close" data-dismiss="modal">
                        ×
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="p-4 text-center">
                        <p>Bạn chắc chắn muốn xóa bản ghi này chứ?</p>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-light"
                        data-dismiss="modal"
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        onClick={this.handleDelete}
                        className="btn btn-danger"
                        data-dismiss="modal"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="edit-review"
                className="modal fade"
                data-backdrop="true"
                style={{ display: "none" }}
                aria-hidden="true"
              >
                <div
                  className="modal-dialog animate fade-down modal-lg"
                  data-class="fade-down"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h2 className="modal-title text-md">
                        Sửa nhiều đánh giá
                      </h2>
                      <button className="close" data-dismiss="modal">
                        ×
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="p-4">
                        <p>
                          Bạn đang chỉnh sửa thông tin cho{" "}
                          {this.state.students.length} tâm tình học viên được
                          chọn:
                        </p>
                        <div className="form-group row">
                          <div className="col-sm-12">
                            <label className=" col-form-label">Khoá học</label>
                            <div>
                              <select
                                className="form-control"
                                name="courseForm"
                                onChange={this.onChange}
                              >
                                <option value="">Chọn khoá học</option>
                                {this.props?.modalClassrooms?.map((item) => (
                                  <option key={item._id} value={item._id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="col-sm-12">
                            <label className=" col-form-label">Môn học</label>
                            <div>
                              <select
                                className="form-control"
                                name="subjectForm"
                                onChange={this.onChange}
                              >
                                <option value="">Chọn môn học</option>
                                {this.props?.modalSubjects?.map((item) => (
                                  <option key={item._id} value={item._id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="col-sm-12">
                            <label className=" col-form-label">Danh mục</label>
                            <div>
                              <select
                                className="form-control"
                                name="categoryForm"
                                onChange={this.onChange}
                              >
                                <option value="">Chọn danh mục</option>
                                {this.props?.modalClassroomGroups?.map(
                                  (item) => (
                                    <option key={item._id} value={item._id}>
                                      {item.name}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </div>
                        </div>
                        <p>
                          Bằng việc nhấn vào "Cập nhật" bạn sẽ sửa đồng thời{" "}
                          {this.state.students.length} tâm tình học viên được
                          chọn theo các mục trên
                        </p>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-light"
                        data-dismiss="modal"
                      >
                        Bỏ qua
                      </button>
                      <button
                        type="button"
                        onClick={this.handleEdits}
                        className="btn btn-danger"
                        data-dismiss="modal"
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
    modalClassrooms: state.adultEvals.modalClassrooms || [],
    modalSubjects: state.adultEvals.modalSubjects || [],
    modalClassroomGroups: state.adultEvals.modalClassroomGroups || [],
    adultEvals: state.adultEvals.adultEvals ? state.adultEvals.adultEvals : [],
    limit: state.adultEvals.limit,
    total: state.adultEvals.total,
    page: state.adultEvals.page,
    ids: state.adultEvals.ids,
    check: state.adultEvals.checkAll,
    dataRemoveAdultEval: state.adultEvals.dataRemoveAdultEval,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      listAdultEvaluation,
      checkInputItem,
      addDataRemoveAdultEval,
      onDeleteAdultEval,
      listClassRoom,
      listSubject,
      listClassroomGroup,
      listModalClassRoom,
      listModalSubject,
      listModalClassroomGroup,
      updateReviews,
    },
    dispatch
  );
}

let Container = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AdultEvaluation)
);
export default Container;
