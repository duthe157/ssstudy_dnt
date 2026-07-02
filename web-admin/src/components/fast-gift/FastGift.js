import React, { Component } from 'react';
import Moment from 'moment';
import { notification } from 'antd';
import Pagination from 'react-js-pagination';
import {
    listGift,
    detailGift,
    deleteGift,
    updateStatusGift
} from '../../redux/fastGift/action';
import { listExamCategory } from '../../redux/examwordcategory/action';
import { listSubject } from "../../redux/subject/action";
import { listAdmin } from "../../redux/student/action";

import HeadingSortColumn from "../HeadingSortColumn";

import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import queryString from 'query-string';

class Row extends Component {
    constructor(props) {
        super();
        this.state = {
            status: true,

        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.check !== nextProps.check) {
            this.setState({
                check: nextProps.check,
            });
        }
    }


    componentDidMount() {
        this.setState({
            status: this.props.obj.status,
        });
    }
    handleChangeStatus = async (e) => {
        var name = e.target.name;
        var value = e.target.checked;
        await this.setState({
            [name]: value,
        });
        const data = {
            id: this.props.obj._id,
            status: this.state.status,
        };
        await this.props.updateStatusGift(data);
    }
    handleCheck = async (e) => {
        this.props.deleteGift(this.props.obj._id)
    }
    render() {
        return (
            <tr className="v-middle table-row-item" data-id={17}>

                <td className="flex">
                    <Link
                        className="item-author text-color"
                        to={'/exam-word/fast-gift/' + this.props.obj._id + '/edit'}>
                        {this.props.obj.name}
                    </Link>
                </td>
                <td className="text-left">
                    <span className="item-amount d-none d-sm-block text-sm">
                        {this.props.obj.competition_part?.name || 'Chưa cấu hình kỳ thi'}
                    </span>
                </td>
                <td className="text-left">
                    <span className="item-amount d-none d-sm-block text-sm">
                        <label className="ui-switch ui-switch-md info m-t-xs">
                            <input
                                type="checkbox"
                                name="status"
                                value={this.props.obj._id}
                                checked={this.state.status === true ? 'checked' : ''}
                                onChange={this.handleChangeStatus}
                            />{' '}
                            <i />
                        </label>
                    </span>
                </td>
                <td className="text-left">
                    <span className="item-amount d-none d-sm-block text-sm">
                        {this.props.obj.updated_at &&
                            Moment(this.props.obj.updated_at).format(
                                'DD/MM/YYYY HH:mm',
                            )}
                    </span>
                </td>
                <td className='text-right'>
                    <div className="item-action">
                        {/* <Tooltip
							content="Chỉnh sửa"
						> */}
                        <Link
                            className="mr-14"
                            data-toggle='tooltip'
                            title='Chỉnh sửa'
                            to={'/exam-word/fast-gift/' + this.props.obj._id + '/edit'}>
                            <img src="/assets/img/icon-edit.svg" alt="" />
                        </Link>
                        {/* </Tooltip> */}
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

class FastGift extends Component {
    constructor(props) {
        super();
        this.state = {
            data: [],
            keyword: "",
            activePage: 1,
            limit: 20,
            page: 1,
            sort_key: "",
            sort_value: "",
            competition_part_id: "",
            ids: [],
            checkAll: false,
            ListStatus: "",
        };
    }

    fetchRows() {
        if (this.props.fastgifts instanceof Array) {
            return this.props.fastgifts.map((object, i) => {
                return (
                    <Row
                        obj={object}
                        updateStatusGift={this.props.updateStatusGift}
                        key={object._id}
                        index={i}
                        deleteGift={this.props.deleteGift}
                        getData={this.getData}
                        check={this.props.check}
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

    onChange = e => {
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value,
        });
    };

    getData = async (pageNumber = 1) => {
        const params = {
            status: this.state.ListStatus === '' ? '' : this.state.ListStatus === 'true' ? true : false,
            keyword: this.state.keyword,
            competition_part_id: this.state.competition_part_id,
            sort_key: this.state.sort_key,
            sort_value: this.state.sort_value,
            limit: this.state.limit,
            page: this.state.page || pageNumber
        };

        await this.props.listGift(params);

    };

    async componentDidMount() {
        const url = this.props.location.search;
        let params = queryString.parse(url);

        await this.setState({
            keyword: params.keyword ? params.keyword : "",
            competition_part_id: params.competition_part_id ? params.competition_part_id : "",
            sort_key: params.sort_key ? params.sort_key : "",
            sort_value: params.sort_value ? params.sort_value : "",
            limit: params.limit ? params.limit : 20,
            page: params.page ? params.page : 1,

        })



        if (this.props.limit) {
            await this.setState({
                limit: this.props.limit,
                checkAll: false,
            });
        }
        const data = {

            limit: 999,

        };
        await this.props.listExamCategory(data);
        this.getData(this.state.activePage);
    }

    onSubmit = async (e) => {
        e.preventDefault();
        let { keyword, limit, page, competition_part_id } = this.state;

        this.props.history.push(`/exam-word/fast-gift?limit=${limit}&page=${page}&keyword=${keyword}&competition_part_id=${competition_part_id}`);

        await this.getData(1);
    };

    handleChangePage = async (pageNumber) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        await this.setState({
            page: pageNumber
        })
        let { keyword, limit, page } = this.state;

        this.props.history.push(`/exam-word/fast-gift?keyword=${keyword}&limit=${limit}&page=${page}`);

        await this.getData(1);
    };

    handleDelete = async () => {
        let inputs = document.querySelectorAll('.checkInputItem');
        let data = this.props.dataRemoveBook;

        if (this.state.ids && this.state.ids.length > 0) {
            data = {
                ids: this.state.ids
            };
        }

        await this.props.deleteGift(data);
        this.props.listGift(this.getData());

        for (var i = 0; i < inputs.length; i++) {
            inputs[i].checked = false;
        }

        await this.setState({
            ids: []
        })

    };

    handleDeleteAll = () => {
        var data = this.state.ids;

        if (data.length === 0) {
            notification.warning({
                message: 'Chưa chọn mục nào !',
                placement: 'topRight',
                top: 50,
                duration: 3,
            });
        }
    }

    handleChange = async (e) => {
        e.preventDefault();
        var name = e.target.name;
        var value = e.target.value;
        await this.setState({
            [name]: value,
        });
        // await this.props.listBook(this.getData());
        let { keyword, limit, page } = this.state;

        this.props.history.push(`/exam-word/fast-gift?keyword=${keyword}&limit=${limit}&page=${page}`);

        await this.getData(1);
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.checkAll !== nextProps.check) {
            this.setState({
                checkAll: nextProps.check,
            });
        }
    }
    handleAddNew = () => {
        this.props.history.push('/exam-word/fast-gift/create');
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


    fetchCompetitionPartRows() {
        if (this.props.competition_part instanceof Array) {
            return this.props.competition_part.map((obj, i) => {
                return (
                    <option value={obj._id} key={obj._id.toString()}>
                        {obj.name}
                    </option>
                );
            });
        }
    }

    sort = async (event) => {
        const { classList } = event.target;

        const name = event.target.getAttribute("name");

        await this.setState({
            sort_key: name,
            sort_value: this.state.sort_value == 1 ? -1 : 1
        });



        let { keyword, competition_part_id, page, limit, sort_key, sort_value } = this.state;

        this.props.history.push(`/exam-word/fast-gift?limit=${limit}&competition_part_id=${competition_part_id}&page=${page}&keyword=${keyword}&sort_key=${sort_key}&sort_value=${sort_value}`);

        await this.getData(1);

    }

    render() {
        let displayFrom =
            (this.props.page == 1)
                ? 1
                : (parseInt(this.props.page) - 1) * this.props.limit;
        let displayTo =
            this.props.page === 1
                ? this.props.limit
                : displayFrom + this.props.limit;
        displayTo = displayTo > this.props.total ? this.props.total : displayTo;
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <h2 className='text-md text-highlight sss-page-title'>
                            Quản lý quà tặng nhanh
                        </h2>
                        <div className="block-table-fastgifts">
                            <div className="toolbar">
                                <form className="flex block-filter-fastgifts" onSubmit={this.onSubmit}>
                                    <div className="input-group">
                                        <div style={{ minWidth: '28%' }}>
                                            Từ khóa
                                            <input
                                                type="text"
                                                className="form-control form-control-theme keyword-custom"
                                                placeholder="Nhập từ khoá tìm kiếm..."
                                                onChange={this.onChange}
                                                value={this.state.keyword}
                                                name="keyword"
                                            />
                                        </div>
                                        <div style={{ marginLeft: '16px', minWidth: '20%' }}>
                                            Kỳ thi
                                            <select
                                                className="custom-select"
                                                value={this.state.competition_part_id}
                                                name="competition_part_id"
                                                onChange={this.onChange}
                                            >
                                                <option value="">Tất cả kỳ thi</option>
                                                {this.fetchCompetitionPartRows()}
                                            </select>
                                        </div>


                                        <div style={{ marginLeft: '16px', minWidth: '18%' }}>
                                            Trạng thái
                                            <select
                                                className="custom-select"
                                                value={this.state.ListStatus}
                                                name="ListStatus"
                                                onChange={this.onChange}
                                            >
                                                <option value="">Tất cả</option>
                                                <option value='true'>Đang hoạt động</option>
                                                <option value='false'>Đã tắt</option>
                                            </select>
                                        </div>
                                        <div className='btn-filter' style={{ margin: '22px 0 0 16px', fontSize: '18px' }}>
                                            <button type='sumbit'>
                                                <span>Tìm kiếm</span>
                                            </button>
                                        </div>
                                        <div className='btn-filter' style={{ margin: '22px 0 0 16px', fontSize: '18px' }}>
                                            <button type='sumbit' className='btn btn-primary btn-add-new-fastgift' onClick={this.handleAddNew}>
                                                <img src='/assets/img/icon-add.svg' className='mr-10' alt='' />
                                                <span>Thêm quà tặng</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="row">
                                <div className="col-sm-12">
                                    <table className="table table-theme table-row v-middle">
                                        <thead className="text-muted">
                                            <tr>

                                                <HeadingSortColumn
                                                    name="name"
                                                    content="Tên quà tặng"
                                                    handleSort={this.sort}
                                                    sort_key={this.state.sort_key}
                                                    sort_value={this.state.sort_value}
                                                />
                                                <HeadingSortColumn
                                                    name="competition_part"
                                                    content="Kỳ thi"
                                                    handleSort={this.sort}
                                                    sort_key={this.state.sort_key}
                                                    sort_value={this.state.sort_value}
                                                />
                                                <th className="text-left">
                                                    Trạng thái
                                                </th>
                                                <HeadingSortColumn
                                                    name="created_at"
                                                    content="Ngày tạo"
                                                    handleSort={this.sort}
                                                    sort_key={this.state.sort_key}
                                                    sort_value={this.state.sort_value}
                                                />
                                                <th className='text-right'>
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
                                        onChange={this.handleChange}>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="9999">ALL</option>
                                    </select>
                                </div>
                                <div className="col-sm-6 showing-text">
                                    {' '}
                                    Hiển thị từ <b>{displayFrom ? displayFrom : ''}</b> đến{' '}
                                    <b>{displayTo ? displayTo : ''}</b> trong tổng số{' '}
                                    <b>{this.props.total}</b>
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
                                style={{ display: 'none' }}
                                aria-hidden="true">
                                <div
                                    className="modal-dialog animate fade-down"
                                    data-class="fade-down">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <div className="modal-title text-md">
                                                Thông báo
                                            </div>
                                            <button
                                                className="close"
                                                data-dismiss="modal">
                                                ×
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="p-4 text-center">
                                                <p>
                                                    Bạn chắc chắn muốn xóa bản
                                                    ghi này chứ?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="btn btn-light"
                                                data-dismiss="modal">
                                                Đóng
                                            </button>
                                            <button
                                                type="button"
                                                onClick={this.handleDelete}
                                                className="btn btn-danger"
                                                data-dismiss="modal">
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
        competition_part: state.examWordCategory.examCategories,
        fastgifts: state.fastGift.fastgifts,
        limit: state.fastGift.limit,
        page: state.fastGift.page,
        total: state.fastGift.totalItems,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { listGift, updateStatusGift, detailGift, deleteGift, listSubject, listAdmin, listExamCategory },
        dispatch,
    );
}

let Container = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(FastGift),
);
export default Container;
