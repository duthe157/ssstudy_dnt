import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
  listReportBug,
  deleteReportBug,
  addDelete,
  updateReportBug,
  checkAll,
  addDataRemoveBug
} from "../../redux/bug/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from 'query-string';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";

class Row extends Component {
  constructor(props) {
    super();
    this.state = {
      check: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.check !== nextProps.check) {
      this.setState({
        check: nextProps.check,
      });
    }
  }

  handleCheckBox = e => {
    if (e.target.checked) {
      this.props.handleCheckedIds(this.props.obj._id, 'add');
      this.setState({
        check: e.target.checked
      })
    } else {
      this.props.handleCheckedIds(this.props.obj._id, 'remove');
      this.setState({
        check: e.target.checked
      })
    }
  };


  handleCheck = async (e) => {
    this.props.onDeleteOne(true);
    this.props.addDataRemoveBug({
      ids: this.props.obj._id
    })
  }

  changeRowStatus = async (e) => {
    const id = e.target.attributes.getNamedItem("data-id").value;
    const status = e.target.value;
    await this.props.updateReportBug({ id, status });
  };

  render() {
    const {
      subject,
      user,
      status,
      classroom,
      content,
      object_type,
      object_id,
      _id,
      code,
    } = this.props.obj;
    return (
      <tr className="v-middle table-row-item" data-id={17}>
        <td>
          <label className="ui-check m-0">
            <input
              type="checkbox"
              name="id"
              className="checkInputItem"
              onChange={this.handleCheckBox}
              value={this.props.obj._id}
            />{" "}
            <i />
          </label>
        </td>
        <td className="flex">
          <Link
            onClick={(e) => this.props.showBugDetail(this.props.obj)}
            className="item-author text-color"
            data-toggle="modal"
            data-target="#show-bug-modal"
            data-toggle-class="fade-down"
            data-toggle-class-target=".animate"
          >
            {code}
          </Link>
        </td>
        <td>
          <span className="item-amount d-none d-sm-block text-sm">
            {object_type == 'QUESTION' ? 'Câu hỏi' : 'Bài giảng'}
          </span>
        </td>
        <td>
          <Link
            className='item-author text-color'
            to={"/student/" + user.id + "/edit"}
            target='_blank'
          >
            <span className="item-amount d-none d-sm-block text-sm">
              {user.name}
            </span>
          </Link>
        </td>
        <td>
          <select
            name="status"
            className="custom-select"
            data-id={this.props.obj._id}
            onChange={this.changeRowStatus}
          >
            <option value="PENDING" selected={this.props.obj.status == 'PENDING'}>Chờ xử lý</option>
            <option value="PROCESSING" selected={this.props.obj.status == 'PROCESSING'}>Đang xử lý</option>
            <option value="DONE" selected={this.props.obj.status == 'DONE'}>Đã xử lý</option>
          </select>
        </td>
        <td>
          <span className="item-amount d-none d-sm-block text-sm">
            {this.props.obj.updated_at &&
              Moment(this.props.obj.updated_at).format("DD/MM/YYYY HH:mm:ss")}
          </span>
        </td>
        <td className="text-right">
          <div className="item-action">
            <div
              data-toggle='tooltip'
              title='Xem chi tiết'
            >
              <Link
                onClick={(e) => this.props.showBugDetail(this.props.obj)}
                className="mr-14"
                data-toggle="modal"
                data-target="#show-bug-modal"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
              >
                <img src="/assets/img/icon-view.svg" alt="" />
              </Link>
            </div>
            <div
              data-toggle='tooltip'
              title='Xóa'
            >
              <a
                onClick={this.handleCheck}
                data-toggle="modal"
                data-target="#delete-video"
                data-toggle-class="fade-down"
                data-toggle-class-target=".animate"
              >
                <img src="/assets/img/icon-delete.svg" alt="" />
              </a>
            </div>
          </div>
        </td>
      </tr>
    );
  }
}

class Bug extends Component {
  constructor(props) {
    super();
    this.state = {
      data: [],
      limit: 20,
      page: 1,
      status: "PENDING",
      checkAll: false,
      bugContent: "",
      keyword: "",
      activePage: 1,
      ids: []
    };
  }

  fetchRows() {
    if (this.props.bugs instanceof Array) {
      return this.props.bugs.map((object, i) => {
        return (
          <Row
            obj={object}
            key={object._id}
            index={i}
            addDelete={this.props.addDelete}
            updateReportBug={this.props.updateReportBug}
            listChapter={this.props.listChapter}
            getData={this.getData}
            showBugDetail={this.showBugDetail}
            check={this.props.check}
            handleCheckedIds={this.handleCheckedIds}
            addDataRemoveBug={this.props.addDataRemoveBug}
            onDeleteOne={this.onDeleteOne}
          />
        );
      });
    }
  }

  onDeleteOne = async (onResetIds) => {
    if (onResetIds) {
      await this.setState({
        ids: []
      })
    }
  }


  handleCheckedIds = async (id, type = '') => {
    const _ids = this.state.ids;
    if (type === 'add') {
      if (_ids.indexOf(id) < 0) {
        _ids.push(id);
      }
    }
    if (type === 'remove') {
      let index = _ids.indexOf(id);
      if (index > -1) {
        _ids.splice(index, 1);
      }
    }

    await this.setState({
      ids: _ids
    })

  }

  showBugDetail = (bug) => {
    if (bug) {
      this.setState({
        bugContent: bug.content,
      });
    }
  };

  onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  getData = async (pageNumber = 1) => {
    const params = {
      keyword: this.state.keyword,
      status: this.state.status,
      limit: this.state.limit,
      is_delete: false,
    };

    params.page = pageNumber;

    await this.props.listReportBug(params);

  };

  async componentDidMount() {

    const url = this.props.location.search;
    let params = queryString.parse(url);

    await this.setState({
      keyword: params.keyword ? params.keyword : "",
      status: params.status ? params.status : "",
      limit: params.limit ? params.limit : 20,
      page: params.page ? params.page : 1,
    })

    // if (this.props.limit) {
    //   await this.setState({
    //     limit: this.props.limit,
    //     checkAll: false,
    //   });
    // }

    this.getData(this.state.activePage);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    let { keyword, status, limit, page } = this.state;

    this.props.history.push(`/report-bug?keyword=${keyword}&limit=${limit}&page=${page}&status=${status}`);

    await this.getData(1);
  };

  handleChangePage = async (pageNumber) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await this.setState({
      page: pageNumber
    })

    let { keyword, status, limit, page } = this.state;

    this.props.history.push(`/report-bug?keyword=${keyword}&limit=${limit}&page=${page}&status=${status}`);

    await this.getData(pageNumber);
  };

  handleDelete = async () => {

    let inputs = document.querySelectorAll('.checkInputItem');
    let data = this.props.dataRemoveBug;

    if (this.state.ids && this.state.ids.length > 0) {
      data = {
        ids: this.state.ids
      };
    }

    await this.props.deleteReportBug(data);
    this.props.listReportBug(this.getData());

    for (var i = 0; i < inputs.length; i++) {
      inputs[i].checked = false;
    }

    await this.setState({
      ids: []
    })
  };

  handleChange = async (e) => {
    e.preventDefault();
    var name = e.target.name;
    var value = e.target.value;
    await this.setState({
      [name]: value,
    });
    let { keyword, status, limit, page } = this.state;

    this.props.history.push(`/report-bug?keyword=${keyword}&limit=${limit}&page=${page}&status=${status}`);

    await this.getData(1);
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.checkAll !== nextProps.check) {
      this.setState({
        checkAll: nextProps.check,
      });
    }
  }

  handleCheckAll = async (e) => {
    var inputs = document.querySelectorAll('.checkInputItem');
    var flag = false;

    if (e.target.checked) {
      flag = true;
    }

    let _ids = [];
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].checked = flag;
      if (flag) {
        _ids.push(inputs[i].value);
      } else {
        _ids = [];
      }
    }

    await this.setState({
      ids: _ids
    })
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
            <h2 className="text-md text-highlight sss-page-title">Quản lý lỗi</h2>
            <div className="block-table-bug">
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
                  ) : (
                    <button
                      className="btn btn-icon"
                      onClick={this.handleDelete}
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
                </div> */}
                <form className="flex" onSubmit={this.onSubmit}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-theme keyword-custom"
                      placeholder="Nhập từ khoá tìm kiếm..."
                      onChange={this.onChange}
                      name="keyword"
                      value={this.state.keyword}
                    />{" "}
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
                    <div className="ml-16">
                      <select
                        className="custom-select"
                        value={this.state.status}
                        name="status"
                        onChange={this.handleChange}
                      >
                        <option value="">-- Chọn trạng thái --</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PROCESSING">Đang xử lý</option>
                        <option value="DONE">Đã xử lý</option>
                      </select>
                    </div>
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
                              name="id"
                              onChange={this.handleCheckAll}
                            />{' '}
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
                            </button>)
                          }
                        </th>
                        <th>Mã lỗi</th>
                        <th>Nhóm lỗi</th>
                        <th>Người báo lỗi</th>
                        <th>Tình trạng</th>
                        <th width="">Thời gian cập nhật</th>
                        <th className="text-right">
                          Thao tác
                        </th>
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
                  Hiển thị từ <b>
                    {!isNaN(displayFrom) ? displayFrom : 0}
                  </b> đến <b>{!isNaN(displayTo) ? displayTo : 0}</b> trong tổng
                  số <b>{this.props.total}</b>
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
                id="show-bug-modal"
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
                      <div className="modal-title text-md title">
                        Chi tiết báo lỗi
                      </div>
                      <button className="close" data-dismiss="modal">
                        ×
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="">
                        <SunEditor
                            height= {'400px'}
                            setContents={this.state.bugContent}
                            setOptions={{
                              buttonList: baseHelpers.getSunEditorOptions(),
                              katex: katex,
                            }}
                        />
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
                    </div>
                  </div>
                </div>
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    bugs: state.reportBug.reportBugs,
    limit: state.reportBug.limit,
    page: state.reportBug.page,
    total: state.reportBug.total,
    ids: state.reportBug.ids,
    check: state.reportBug.checkAll,
    dataRemoveBug: state.reportBug.dataRemoveBug

  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { listReportBug, deleteReportBug, addDelete, addDataRemoveBug, checkAll, updateReportBug },
    dispatch
  );
}

let BugContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Bug)
);
export default BugContainer;
