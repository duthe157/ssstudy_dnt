import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
    listReview,
    addDelete,
    deleteReview,
    checkAll,
    createReview,
    detailReview,
    updateReview,
} from "../../redux/comment/action";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

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

    handleCheck = (e) => {
        if (e.target.checked) {
            this.props.addDelete(this.props.obj._id, "add");
            this.setState({
                check: e.target.checked,
            });
        } else {
            this.props.addDelete(this.props.obj._id, "remove");
            this.setState({
                check: e.target.checked,
            });
        }
    };

    getIdEdit = (e) => {
        this.props.EditCommentt(this.props.obj._id);
    }

    getIdDelete = (e) => {
        this.props.DeleteCommentt(this.props.obj._id);
    }
    render() {
        return (
            <tr className='v-middle' data-id={17}>
                <td>
                    <label className='ui-check m-0'>
                        <input
                            type='checkbox'
                            name='id'
                            onChange={this.handleCheck}
                            checked={this.state.check === true ? "checked" : ""}
                        />{" "}
                        <i />
                    </label>
                </td>
                <td>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {this.props.obj.month}
                    </span>
                </td>
                <td className='flex'>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {this.props.obj.comment}
                    </span>
                </td>
                <td>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {this.props.obj.updated_at &&
                            Moment(this.props.obj.updated_at).format(
                                "DD/MM/YYYY"
                            )}
                    </span>
                </td>
                <td>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {this.props.obj.teacher}
                    </span>
                </td>
                <td>
                    <div className='item-action dropdown'>
                        <a
                            href='/'
                            data-toggle='dropdown'
                            className='text-muted'
                        >
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width={16}
                                height={16}
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth={2}
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='feather feather-more-vertical'
                            >
                                <circle cx={12} cy={12} r={1} />
                                <circle cx={12} cy={5} r={1} />
                                <circle cx={12} cy={19} r={1} />
                            </svg>
                        </a>
                        <div
                            className='dropdown-menu dropdown-menu-right bg-white'
                            role='menu'
                        >
                            <button
                                className='dropdown-item'
                                onClick={this.getIdEdit}
                            >
                                Sửa
							</button>
                            <div className='dropdown-divider' />
                            <button className='dropdown-item'
                                onClick={(e) => { if (window.confirm('Bạn có chắc muốn xóa không?')) this.getIdDelete(e) }}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}

class ModalListComment extends Component {
    constructor(props) {
        super();
        this.state = {
            data: [],
            limit: "",
            ids: [],
            checkAll: false,
            user_id: "",
            teacher: "",
            comment: "",
            month: "",
            checkSubmit: false,
            id: "",
        };
        this.resetState = this.state
    }

    fetchRows() {
        if (this.props.dataReviews instanceof Array) {
            return this.props.dataReviews.map((object, i) => {
                return (
                    <Row
                        obj={object}
                        key={object._id}
                        index={i}
                        addDelete={this.props.addDelete}
                        params={this.props.match.params.id}
                        check={this.props.check}
                        EditCommentt={this.callApiEditComment}
                        DeleteCommentt={this.handleDelete}
                    />
                );
            });
        }
    }

    onChange = (e) => {
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value,
        });
    };

    getData = (pageNumber = 1) => {
        let d = new Date();
        let year = d.getFullYear();
        const data = {
            page: pageNumber,
            limit: this.state.limit,
            user_id: this.state.user_id,
            year: year,
            classroom_id: this.props.match.params.id
        };
        if (this.state.keyword != null) {
            data["keyword"] = this.state.keyword;
        }
        return data;
    };

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.id !== this.props.id) {
            await this.setState({
                user_id: this.props.id
            })
            this.callApi();
            return true;
        }
    }

    async callApi() {
        await this.props.listReview(this.getData());
        if (this.props.limit) {
            await this.setState({
                limit: this.props.limit,
                ids: this.props.ids,
                checkAll: false,
            });
        }
    }


    onSubmit = (e) => {
        e.preventDefault();
        this.props.listReview(this.getData());
    };

    handleChangePage = async (pageNumber) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        await this.props.listReview(this.getData(pageNumber));
    };

    handleDelete = async (id) => {
        const data = {
            ids: id,
        };
        if (data.ids.length !== 0) {
            await this.props.deleteReview(data);
            await this.props.listReview(this.getData());
        } else {
            notification.warning({
                message: "Chưa chọn mục nào !",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
        }
    };

    handleChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;
        await this.setState({
            [name]: value,
        });
        await this.props.listReview(this.getData());
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.checkAll !== nextProps.check) {
            this.setState({
                checkAll: nextProps.check,
            });
        }
    }

    handleCheckAll = (e) => {
        if (e.target.checked) {
            this.props.checkAll(true);
            this.setState({
                checkAll: e.target.checked,
            });
        } else {
            this.props.checkAll(false);
            this.setState({
                checkAll: e.target.checked,
            });
        }
    };

    handleSubmit = async (e) => {
        e.preventDefault();        
        const data = {
            user_id: this.state.user_id,
            teacher: this.state.teacher,
            comment: this.state.comment,
            classroom_id: this.props.match.params.id,
            month: this.state.month,
        };
        await this.props.createReview(data);
        if (this.props.redirect === true) {
            await this.props.listReview(this.getData());
            this.setState(this.resetState);
            await this.setState({
                user_id: this.props.id
            });
        }
    };

    callApiEditComment = async (id) => {
        await this.props.detailReview(id);
        if (this.props.dataReview) {
            var {
                teacher,
                comment,
                month,
            } = this.props.dataReview;
            this.setState({
                teacher,
                comment,
                month,
            });
        }
        await this.setState({
            checkSubmit: true,
            id: id,
        });
    }

    handleSubmitUpdate = async (e) => {
        e.preventDefault();

        const data = {
            user_id: this.state.user_id,
            id: this.state.id,
            teacher: this.state.teacher,
            comment: this.state.comment,
            month: this.state.month,
        };
        await this.props.updateReview(data);
        if (this.props.redirect === true) {
            await this.props.listReview(this.getData());
            this.setState(this.resetState);
            await this.setState({
                checkSubmit: false,
                user_id: this.props.id
            });
        }
    };

    checkSubmitForm = () => {
        if (this.state.checkSubmit === false) {
            return (
                <button
                    className='btn btn-primary'
                    onClick={this.handleSubmit}
                >
                    Lưu
                </button>
            );
        } else {
            return (
                <button
                    className='btn btn-primary'
                    onClick={this.handleSubmitUpdate}
                >
                    Cập nhật
                </button>
            );
        }
    }

    render() {
        let displayFrom =
            this.props.page === 1
                ? 1
                : (parseInt(this.props.page) - 1) * this.props.limit;
        let displayTo =
            this.props.page === 1
                ? this.props.limit
                : displayFrom + this.props.limit;
        displayTo = displayTo > this.props.total ? this.props.total : displayTo;
        return (

            <div
                className='modal-dialog animate fade-down modal-lg'
                data-class='fade-down'
            >
                <div className='modal-content'>
                    <div className='modal-header'>
                        <div className='modal-title text-md'>
                            Quản lý danh sách nhận xét
						</div>
                        <button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
                    </div>
                    <div
                        className='modal-body'
                        style={{
                            minHeight: 150,
                        }}
                    >
                        <div>
                            <form className="row">
                                <div className='form-group col-sm-5'>
                                    <div className="mb-1">
                                        <label className='col-form-label'>
                                            Tháng
											</label>
                                        <div>
                                            <select
                                                name='month'
                                                className='custom-select'
                                                onChange={this.onChange}
                                                value={
                                                    this.state.month
                                                }
                                            >
                                                <option value=''>
                                                    -- Chọn tháng --
													</option>
                                                <option value='01'>
                                                    Tháng 1
													</option>
                                                <option value='02'>
                                                    Tháng 2
													</option>
                                                <option value='03'>
                                                    Tháng 3
													</option>
                                                <option value='04'>
                                                    Tháng 4
													</option>
                                                <option value='05'>
                                                    Tháng 5
													</option>
                                                <option value='06'>
                                                    Tháng 6
													</option>
                                                <option value='07'>
                                                    Tháng 7
													</option>
                                                <option value='08'>
                                                    Tháng 8
													</option>
                                                <option value='09'>
                                                    Tháng 9
													</option>
                                                <option value='10'>
                                                    Tháng 10
													</option>
                                                <option value='11'>
                                                    Tháng 11
													</option>
                                                <option value='12'>
                                                    Tháng 12
													</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <label className='col-form-label'>
                                            Người nhận xét
											</label>
                                        <div>
                                            <input
                                                type='text'
                                                className='form-control'
                                                name='teacher'
                                                onChange={this.onChange}
                                                value={this.state.teacher}
                                                placeholder="Người nhận xét"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group col-sm-7'>
                                    <label className='col-form-label'>
                                        Nhận xét
											</label>
                                    <div>
                                        <textarea className="form-control"
                                            onChange={this.onChange}
                                            value={this.state.comment} rows="5"
                                            placeholder="Nhận xét"
                                            name="comment"
                                        ></textarea>
                                    </div>
                                </div>
                                <div className='form-group col-sm-12'>
                                    <div className='text-right'>
                                        {this.checkSubmitForm()}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className=''>
                            <div className='mb-5'>
                                <div className='toolbar'>
                                    <div className='btn-group'></div>
                                    <form
                                        className='flex'
                                        onSubmit={this.onSubmit}
                                    >
                                        <div className='input-group'>
                                            <input
                                                type='text'
                                                className='form-control form-control-theme keyword-custom'
                                                placeholder='Nhập từ khoá tìm kiếm...'
                                                onChange={this.onChange}
                                                name='keyword'
                                            />{" "}
                                            <span className='input-group-append'>
                                                <button
                                                    className='btn btn-white btn-sm'
                                                    type='submit'
                                                >
                                                    <span className='d-flex text-muted'>
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            width={16}
                                                            height={16}
                                                            viewBox='0 0 24 24'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            strokeWidth={2}
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            className='feather feather-search'
                                                        >
                                                            <circle
                                                                cx={11}
                                                                cy={11}
                                                                r={8}
                                                            />
                                                            <line
                                                                x1={21}
                                                                y1={21}
                                                                x2='16.65'
                                                                y2='16.65'
                                                            />
                                                        </svg>
                                                    </span>
                                                </button>
                                            </span>
                                        </div>
                                    </form>
                                </div>

                                <div className='row'>
                                    <div className='col-sm-12'>
                                        <table className='table table-theme table-row v-middle'>
                                            <thead className='text-muted'>
                                                <tr>
                                                    <th width='10px'>
                                                        <label className='ui-check m-0'>
                                                            <input
                                                                type='checkbox'
                                                                name='id'
                                                                onChange={
                                                                    this
                                                                        .handleCheckAll
                                                                }
                                                                checked={
                                                                    this.state
                                                                        .checkAll ===
                                                                        true
                                                                        ? "checked"
                                                                        : ""
                                                                }
                                                            />{" "}
                                                            <i />
                                                        </label>
                                                    </th>
                                                    <th>Tháng</th>
                                                    <th>Nhận xét</th>
                                                    <th>Ngày nhận xét</th>
                                                    <th>Người nhận xét</th>
                                                    <th width='50px' />
                                                </tr>
                                            </thead>
                                            <tbody>{this.fetchRows()}</tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className='row listing-footer'>
                                    <div className='col-sm-2'>
                                        <select
                                            className='custom-select w-70'
                                            name='limit'
                                            value={this.state.limit}
                                            onChange={this.handleChange}
                                        >
                                            <option value='20'>20</option>
                                            <option value='50'>50</option>
                                            <option value='100'>100</option>
                                            <option value='-1'>ALL</option>
                                        </select>
                                    </div>
                                    <div className='col-sm-10 showing-text'>
                                        {" "}Tổng số <b>{this.props.total}</b>
                                    </div>
                                </div>
                                <div className='row listing-footer'>
                                    {this.props.total !== 0 ? (
                                        <div className='col-sm-12 text-right'>
                                            <Pagination
                                                activePage={this.props.page}
                                                itemsCountPerPage={
                                                    this.props.limit
                                                }
                                                totalItemsCount={
                                                    this.props.total
                                                }
                                                pageRangeDisplayed={10}
                                                onChange={this.handleChangePage}
                                            />
                                        </div>
                                    ) : (
                                            <div className='col-sm-12 mt-2'>
                                                Không có bản ghi nào
                                            </div>
                                        )}
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
        dataReviews: state.comment.dataReviews,
        limit: state.comment.limit,
        page: state.comment.page,
        total: state.comment.total,
        ids: state.comment.ids,
        check: state.comment.checkAll,
        redirect: state.comment.redirect,
        dataReview: state.comment.dataReview,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { listReview, deleteReview, addDelete, checkAll, createReview, detailReview, updateReview },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ModalListComment)
);
