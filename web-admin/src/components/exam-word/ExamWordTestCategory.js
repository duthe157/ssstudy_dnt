import React, { Component } from "react";
import Moment from "moment";
import Pagination from "react-js-pagination";
import {
    listExamTestCategory,
    deleteExamCategory,
    addDelete,
    checkAll,
    addDataRemoveExamCategory,
    createExamCategory
} from "../../redux/examwordtestcategory/action";

import HeadingSortColumn from "../HeadingSortColumn";

import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from 'query-string';


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
        this.props.addDataRemoveExamCategory({
            ids: this.props.obj._id
        })
    }

    render() {
        return (
            <tr className='v-middle table-row-item' data-id={17}>
                <td>
                    <label className='ui-check m-0'>
                        <input
                            type='checkbox'
                            name='id'
                            className="checkInputItem"
                            onChange={this.handleCheckBox}
                            value={this.props.obj._id}
                        />{" "}
                        <i />
                    </label>
                </td>
                <td className='flex'>
                    <Link
                        className='item-author text-color'
                        to={"/exam-word/category/" + this.props.obj._id + "/edit"}
                    >
                        {this.props.obj.name}
                    </Link>
                </td>
                <td>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {this.props.obj.updated_at &&
                            Moment(this.props.obj.updated_at).format(
                                "DD/MM/YYYY HH:mm:ss"
                            )}
                    </span>
                </td>
                <td className="text-right">
                    <div className='item-action'>
                        <Link
                            className='mr-14'
                            data-toggle='tooltip'
                            title='Chỉnh sửa'
                            to={"/exam-word/category/" + this.props.obj._id + "/edit"}
                        >
                            <img src="/assets/img/icon-edit.svg" alt="" />
                        </Link>
                        <div
                            data-toggle='tooltip'
                            title='Xóa'
                        >
                            <a
                                onClick={this.handleCheck}
                                data-toggle='modal'
                                data-target='#delete-competition-test-part'
                                data-toggle-class='fade-down'
                                data-toggle-class-target='.animate'
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

class ExamWordTestCategory extends Component {
    constructor(props) {
        super();
        this.state = {
            data: [],
            page: 1,
            limit: "",
            keyword: "",
            activePage: 1,
            checkAll: false,
            ids: [],
            sort_key: "",
            sort_value: "",
            newCategoryName: "",
            errorMessage: "",  // ✅ Thêm state cho error message
        };
    }

    fetchRows() {
        if (this.props.categories instanceof Array) {
            return this.props.categories.map((object, i) => {
                return (
                    <Row
                        obj={object}
                        key={object._id}
                        index={i}
                        addDelete={this.props.addDelete}
                        listChapter={this.props.listChapter}
                        handleCheckedIds={this.handleCheckedIds}
                        getData={this.getData}
                        check={this.props.check}
                        addDataRemoveExamCategory={this.props.addDataRemoveExamCategory}
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

    onChange = (e) => {
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value,
        });
    };

    handleChangeNewName = (e) => {
        this.setState({ newCategoryName: e.target.value, errorMessage: "" });  // ✅ Clear error khi input change
    }

    handleCreateCategory = async (e) => {
        e.preventDefault();
        const { newCategoryName } = this.state;
        if (!newCategoryName || newCategoryName.trim() === "") return;

        // ✅ Check trùng tên với categories hiện tại (case-insensitive)
        const trimmedName = newCategoryName.trim();
        const isDuplicate = this.props.categories.some(cat => 
            cat && cat.name && cat.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
            this.setState({ errorMessage: "Tên danh mục đã tồn tại!" });
            return;
        }

        await this.props.createExamCategory({ name: trimmedName , type :"WORD"});
        await this.setState({ newCategoryName: "", errorMessage: "" });
        await this.getData(1);
    }

    async componentDidMount() {
        const url = this.props.location.search;
        let params = queryString.parse(url);

        await this.setState({
            keyword: params.keyword ? params.keyword : "",
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
        this.getData(this.state.activePage);
    }

    getData = async (pageNumber = 1) => {
        const params = {
            keyword: this.state.keyword,
            limit: this.state.limit,
            sort_key: this.state.sort_key,
            sort_value: this.state.sort_value,
            is_delete: false
        };

        params.page = pageNumber;

        console.log('getData params:', params);
        await this.props.listExamTestCategory(params);

    };

    onSubmit = async (e) => {
        e.preventDefault();
        let { keyword } = this.state;

        this.props.history.push(`/exam-word/exam-catalog?keyword=${keyword}`);

        await this.getData(1);
    };

    handleChangePage = async (pageNumber) => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        await this.setState({
            page: pageNumber
        })
        let { keyword, page, limit } = this.state;

        this.props.history.push(`/exam-word/exam-catalog?keyword=${keyword}&page=${page}&limit=${limit}`);

        await this.getData(pageNumber);
    };

    handleDelete = async () => {

        let inputs = document.querySelectorAll('.checkInputItem');
        let data = this.props.dataRemoveExamCategory;

        console.log('dataRemoveExamCategory:', this.props.dataRemoveExamCategory);
        console.log('this.state.ids:', this.state.ids);

        if (this.state.ids && this.state.ids.length > 0) {
            data = {
                ids: this.state.ids
            };
        }

        // Chuyển đổi format dữ liệu để phù hợp với API (chỉ nhận trường 'id')
        let requestData;
        console.log('Data trước khi xử lý:', data);
        console.log('data.ids type:', typeof data.ids);
        console.log('data.ids isArray:', Array.isArray(data.ids));

        if (data.ids && Array.isArray(data.ids)) {
            // Xóa nhiều item - xử lý từng item một
            try {
                console.log('Bắt đầu xóa nhiều item:', data.ids);
                for (let i = 0; i < data.ids.length; i++) {
                    console.log('Đang xóa item:', data.ids[i]);
                    await this.props.deleteExamCategory({ id: data.ids[i] });
                }
                console.log('Đã xóa xong tất cả item, bắt đầu refresh danh sách');
                // Refresh lại danh sách sau khi tất cả item đã được xóa thành công
                // Thêm delay nhỏ để đảm bảo server đã xử lý xong
                setTimeout(async () => {
                    console.log('Bắt đầu refresh danh sách sau khi xóa nhiều item');
                    await this.getData(1);
                }, 1000);

                // Reset checkbox và state sau khi xóa nhiều item
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].checked = false;
                }
                await this.setState({
                    ids: []
                });
                console.log('Đã reset state và checkbox');
            } catch (error) {
                console.error('Lỗi khi xóa nhiều item:', error);
            }
            return;
        } else if (data.ids && typeof data.ids === 'string') {
            // Xóa một item - chuyển từ { ids: "id" } thành { id: "id" }
            requestData = { id: data.ids };
            console.log('Xóa một item:', requestData);
        } else {
            requestData = data;
            console.log('Request data:', requestData);
        }

        await this.props.deleteExamCategory(requestData);
        // Thêm delay nhỏ để đảm bảo server đã xử lý xong
        setTimeout(async () => {
            console.log('Bắt đầu refresh danh sách sau khi xóa một item');
            await this.getData(1);
        }, 1000);

        // Reset checkbox và state sau khi xóa xong
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].checked = false;
        }

        await this.setState({
            ids: []
        })
    };

    handleChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;
        await this.setState({
            [name]: value,
        });
        let { keyword, page, limit } = this.state;

        this.props.history.push(`/exam-word/exam-catalog?keyword=${keyword}&page=${page}&limit=${limit}`);

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

    sort = async (event) => {
        const name = event.target.getAttribute("name");

        await this.setState({
            sort_key: name,
            sort_value: this.state.sort_value == 1 ? -1 : 1
        });

        let { keyword, page, limit, sort_key, sort_value } = this.state;

        this.props.history.push(`/exam-word/exam-catalog?keyword=${keyword}&page=${page}&limit=${limit}&sort_key=${sort_key}&sort_value=${sort_value}`);

        await this.getData(1);

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
            <div>
                <div className='page-content page-container' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Danh mục bài kiểm tra</h2>
                        <div className='block-table-exam-cate'>
                            <div className='row'>
                                <div className='col-sm-4'>
                                    <div className='card'>
                                        <div className='card-header'>
                                            <h5 className='card-title m-0'>Thêm danh mục bài kiểm tra</h5>
                                        </div>
                                        <div className='card-body'>
                                            <form onSubmit={this.handleCreateCategory}>
                                                <div className='form-group'>
                                                    <label className='text-muted'>Tên danh mục bài kiểm tra</label>
                                                    <input
                                                        type='text'
                                                        className='form-control form-control-theme'
                                                        placeholder='Tên là cách nó xuất hiện trên trang web của bạn'
                                                        value={this.state.newCategoryName}
                                                        onChange={this.handleChangeNewName}
                                                    />
                                                    {this.state.errorMessage && (
                                                        <div className="text-danger mt-1">{this.state.errorMessage}</div>  // ✅ Hiển thị error
                                                    )}
                                                </div>
                                                <button type='submit' className='btn btn-primary btn-block btn-no-hover'>Thêm danh mục</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-sm-8'>
                                    <div className='card'>
                                        <div className='card-body'>
                                            <div className='toolbar mb-2' style={{ padding: 0 }}>
                                                <form className='flex' onSubmit={this.onSubmit} style={{ margin: 0 }}>
                                                    <div className='input-group'>
                                                        <input
                                                            type='text'
                                                            className='form-control form-control-theme keyword-custom'
                                                            placeholder='Nhập từ khoá tìm kiếm...'
                                                            onChange={this.onChange}
                                                            value={this.state.keyword}
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
                                            <table className='table table-theme table-row v-middle'>
                                                <thead className='text-muted'>
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
                                                                    data-target="#delete-competition-test-part"
                                                                    data-toggle-class="fade-down"
                                                                    data-toggle-class-target=".animate"
                                                                    title="Trash"
                                                                    id="btn-trash">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width={16}
                                                                        height={16}
                                                                        viewBox='0 0 24 24'
                                                                        fill='none'
                                                                        stroke='currentColor'
                                                                        strokeWidth={2}
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        className='feather feather-trash text-muted'>
                                                                        <polyline points="3 6 5 6 21 6" />
                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                    </svg>
                                                                </button>)
                                                            }
                                                        </th>
                                                        <HeadingSortColumn
                                                            name="name"
                                                            content="Tên"
                                                            handleSort={this.sort}
                                                            sort_key={this.state.sort_key}
                                                            sort_value={this.state.sort_value}
                                                        />
                                                        <HeadingSortColumn
                                                            name="updated_at"
                                                            content="Thời gian cập nhật"
                                                            handleSort={this.sort}
                                                            sort_key={this.state.sort_key}
                                                            sort_value={this.state.sort_value}
                                                        />
                                                        <th className="text-right">
                                                            Thao tác
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>{this.fetchRows()}</tbody>
                                            </table>
                                            <div className='row listing-footer'>
                                                <div className='col-auto'>
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
                                                <div className='col showing-text'>
                                                    {" "}
                                                    Hiển thị từ {" "}
                                                    <b>
                                                        {!isNaN(displayFrom) ? displayFrom : 0}
                                                    </b>{" "}
                                                    đến{" "}
                                                    <b>{!isNaN(displayTo) ? displayTo : 0}</b>{" "}
                                                    trong tổng số <b>{this.props.total}</b>
                                                </div>
                                                {this.props.total !== 0 ? (
                                                    <div className='col-auto text-right'>
                                                        <Pagination
                                                            activePage={this.props.page}
                                                            itemsCountPerPage={this.props.limit}
                                                            totalItemsCount={this.props.total}
                                                            pageRangeDisplayed={10}
                                                            onChange={this.handleChangePage}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='col-auto text-right'>Không có bản ghi nào</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                id='delete-competition-test-part'
                                className='modal fade'
                                data-backdrop='true'
                                style={{ display: "none" }}
                                aria-hidden='true'
                            >
                                <div
                                    className='modal-dialog animate fade-down'
                                    data-class='fade-down'
                                >
                                    <div className='modal-content'>
                                        <div className='modal-header'>
                                            <div className='modal-title text-md'>
                                                Thông báo
                                            </div>
                                            <button
                                                className='close'
                                                data-dismiss='modal'
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className='modal-body'>
                                            <div className='p-4 text-center'>
                                                <p>
                                                    Bạn chắc chắn muốn xóa bản
                                                    ghi này chứ?
                                                </p>
                                            </div>
                                        </div>
                                        <div className='modal-footer'>
                                            <button
                                                type='button'
                                                className='btn btn-light'
                                                data-dismiss='modal'
                                            >
                                                Đóng
                                            </button>
                                            <button
                                                type='button'
                                                onClick={this.handleDelete}
                                                className='btn btn-danger'
                                                data-dismiss='modal'
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
        categories: state.examWordTestCategory.examCategories,
        limit: state.examWordTestCategory.limit,
        page: state.examWordTestCategory.page,
        total: state.examWordTestCategory.total,
        ids: state.examWordTestCategory.ids,
        check: state.examWordTestCategory.checkAll,
        dataRemoveExamCategory: state.examWordTestCategory.dataRemoveExamCategory
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { listExamTestCategory, deleteExamCategory, addDataRemoveExamCategory, addDelete, checkAll, createExamCategory },
        dispatch
    );
}

let ExamWordTestCategoryContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ExamWordTestCategory)
);
export default ExamWordTestCategoryContainer;