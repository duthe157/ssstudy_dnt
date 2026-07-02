import React, { Component } from "react";
import { notification, Select } from "antd";
import {
    listBook
} from "../../redux/book/action";
import {
    classroomUpdateRelate, showClassroom
} from "../../redux/classroom/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";

import BaseHelpers from "../../helpers/BaseHelpers";
import { isArray } from "lodash";

const { Option } = Select;

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

    handleDeleteBook =  (id) => {
        this.props.deleteBook(id);
    }

    render() {

        return (
            <tr className='v-middle' data-id={17}>
                <td>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {
                            this.props.obj.code ? this.props.obj.code : ''
                        }
                    </span>
                </td>
                <td className='flex'>
                    <Link
                        className='item-author text-color'
                        to={"/student/" + this.props.obj._id + "/edit"}
                    >
                        {this.props.obj.name ? this.props.obj.name : ''}
                    </Link>
                </td>
                <td>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {this.props.obj.price ? BaseHelpers.currencyFormat(this.props.obj.price) : 0}
                    </span>
                </td>
                <td>
                    <span>
                        {this.props.obj.updated_at ? BaseHelpers.formatDateToString(this.props.obj.updated_at) : ''}
                    </span>
                </td>
                <td>
                    <button onClick={() => this.handleDeleteBook(this.props.obj._id)} className='btn btn-icon'>
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
                            className='feather feather-trash text-muted'
                        >
                            <polyline points='3 6 5 6 21 6' />
                            <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                        </svg>
                    </button>
                </td>
            </tr>
        );
    }
}

class ModalBookRelate extends Component {
    constructor(props) {
        if (props.classroom)
            console.log(props)
        super();
        this.state = {
            data: [],
            ids: [],
            selectedBook: '',
            bookRelates: []
        };
    }


    fetchRows() {
        if (this.state.bookRelates instanceof Array) {
            return this.state.bookRelates.map((object, i) => {
                return (
                    <Row
                        obj={object}
                        key={object._id}
                        index={i}
                        deleteBook={this.handleDeleteBook}
                        getData={this.getData}
                        addMember={this.props.addMember}
                        classroom_id={this.props.classroom_id}
                        listMember={this.props.listMember}
                    />
                );
            });
        }
    }

    handleDeleteBook = async(id) => {
        let { book_relates, _id } = this.props.classroom;

        if (book_relates && isArray(book_relates)) {
            const new_arr = book_relates.filter(item => item != id);

            const params = {
                book_relates: new_arr,
                classroom_id: _id
            };

            await this.props.classroomUpdateRelate(params);
            await this.props.showClassroom(_id);
        }
    }

    onChange = async (value) => {
        await this.setState({
            selectedBook: value,
        });
    };

    getData = (pageNumber = 1) => {
        const data = {
            page: pageNumber,
            limit: this.state.limit,
        };
        if (this.state.keyword != null) {
            data["keyword"] = this.state.keyword;
        }
        return data;
    };

    async componentDidMount() {
        await this.props.listBook(this.getData());
        if (this.props.limit) {
            await this.setState({
                limit: this.props.limit,
                ids: this.props.ids,
            });
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.props.listBook(this.getData());
    };

    fetchOptions() {
        if (this.props.books instanceof Array) {
            return this.props.books.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }

    handleChangePage = async (pageNumber) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        await this.props.listBook(this.getData(pageNumber));
    };

    handleDelete = async () => {
        const data = {
            ids: this.props.ids,
        };
        if (data.ids.length !== 0) {
            await this.props.listBook(this.getData());
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
        await this.props.listBook(this.getData());
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.checkAll !== nextProps.check) {
            this.setState({
                checkAll: nextProps.check,
            });
        }
        if (this.props.bookRelates !== nextProps.bookRelates) {
            this.setState({
                bookRelates: nextProps.bookRelates,
                selectedBook: ''
            })
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

    handleSubmit = async () => {
        let { book_relates, _id } = this.props.classroom;
        const { selectedBook } = this.state;

        if (selectedBook && selectedBook != '') {
            if (book_relates && !book_relates.includes(selectedBook)) {
                book_relates.push(selectedBook);
                const params = {
                    book_relates: book_relates,
                    classroom_id: _id
                };

                await this.props.classroomUpdateRelate(params);
                await this.props.showClassroom(_id);
            } else {
                notification.warning({
                    message: "Sách đã được thêm !",
                    placement: "topRight",
                    top: 50,
                    duration: 3,
                    style: {
                        zIndex: 1050,
                    },
                });
            }
        } else {
            notification.warning({
                message: "Vui lòng chọn sách !",
                placement: "topRight",
                top: 50,
                duration: 3,
                style: {
                    zIndex: 1050,
                },
            });
        }
    };

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

        const { bookAttached } = this.props;

        return (
            <div
                id="book-relate"
                className="modal fade"
                data-backdrop="true"
                style={{
                    display: "none",
                    minWidth: "1000px",
                }}
                aria-hidden="true"
            >
                <div
                    className='modal-dialog animate fade-down modal-xl'
                    data-class='fade-down'
                >
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='modal-title text-md'>
                                Thêm sách
                            </div>
                            <button className='close' data-dismiss='modal'>
                                ×
                            </button>
                        </div>
                        <div
                            className='modal-body'
                        >
                            <div className=''>
                                <div className='mb-5'>
                                    <div className="row" style={{ marginBottom: "10px" }}>
                                        <div className="col-md-7">
                                            <div className="toolbar">
                                                <div className="input-group">
                                                    <Select
                                                        showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Tìm và chọn sách"
                                                        value={this.state.selectedBook}
                                                        optionFilterProp="children"
                                                        onChange={this.onChange}
                                                        onSearch={this.onSearch}
                                                        filterOption={(input, option) =>
                                                            option.props.children
                                                                .toLowerCase()
                                                                .indexOf(
                                                                    input.toLowerCase()
                                                                ) >= 0
                                                        }
                                                    >
                                                        {this.fetchOptions()}
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-5">
                                            <button
                                                className="btn btn-primary "
                                                onClick={this.handleSubmit}
                                            >
                                                Thêm sách
                                            </button>
                                        </div>
                                    </div>

                                    <div className='row'>
                                        <div className='col-sm-12'>
                                            <table className='table table-theme table-row v-middle'>
                                                <thead className='text-muted'>
                                                    <tr>
                                                        <th>Mã sách</th>
                                                        <th>Tên sách</th>
                                                        <th>Giá bán</th>
                                                        <th>Ngày cập nhật</th>
                                                        <th width='50px' />
                                                    </tr>
                                                </thead>
                                                <tbody>{this.fetchRows()}</tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div
                                        id='delete-student'
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
                                                            Bạn chắc chắn muốn xóa
                                                            bản ghi này chứ?
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
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        books: state.book.books,
        limit: state.book.limit,
        page: state.book.page,
        total: state.book.total,
        ids: state.book.ids,
        check: state.book.checkAll,
        classroom: state.classroom.classroom,
        bookRelates: state.classroom.bookRelates
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listBook, classroomUpdateRelate, showClassroom
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ModalBookRelate)
);
