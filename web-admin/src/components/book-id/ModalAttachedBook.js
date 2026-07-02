import React, { Component } from "react";
import { notification, Select } from "antd";
import {
    listBook
} from "../../redux/book-id/action";
import {
    bookUpdateRelate, showBook
} from "../../redux/book-id/action";
import { listSubject } from "../../redux/subject/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { map } from "lodash";

import BaseHelpers from "../../helpers/BaseHelpers";



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

    handleDeleteClassroom = (id) => {
        this.props.deleteClassRoom(id);
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
                    <button onClick={() => this.handleDeleteClassroom(this.props.obj._id)} className='btn btn-icon'>
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
            bookAttacheds: [],
            selectedBook: '',
            keyword: null,
            level: null,
            subject_id: null
        };
    }


    fetchRows() {
        if (this.state.bookAttacheds instanceof Array) {
            return this.state.bookAttacheds.map((object, i) => {
                return (
                    <Row
                        obj={object}
                        key={object._id}
                        index={i}
                        deleteClassRoom={this.handleDeleteClassroom}
                        getData={this.getData}
                        addMember={this.props.addMember}
                        book_id={this.props.book_id}
                        listMember={this.props.listMember}
                    />
                );
            });
        }
    }

    handleDeleteClassroom = async (id) => {
        let { book_relates, _id } = this.props.book;
        if (book_relates) {
            const new_arr = book_relates.filter(item => item != id);


            const params = {
                book_relates: new_arr,
                book_id: _id
            };

            await this.props.bookUpdateRelate(params);
            await this.props.showBook(_id);
        }
    }

    onChange = async (e) => {
        let name = e.target.name;
        let value = e.target.value;
        await this.setState({
            [name]: value
        });

        this.getData(1);
    };

    getData = async (pageNumber = 1) => {
        const data = {
            page: pageNumber,
            limit: this.state.limit,
            combo_mode :false
        };
        if (this.state.keyword != null) {
            data["keyword"] = this.state.keyword;
        }
        if (this.state.level != null) {
            data["level"] = this.state.level;
        }
        if (this.state.subject_id != null) {
            data["subject_id"] = this.state.subject_id;
        }
        await this.props.listBook(data);
    };

    async componentDidMount() {
        await this.props.listBook(this.getData());
        if (this.props.limit) {
            await this.setState({
                limit: this.props.limit,
            });
        }

        this.getData();
    }

    onSubmit = (e) => {
        // e.preventDefault();
        // this.props.listBook(this.getData());
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
        };
      
            notification.warning({
                message: "Chưa chọn mục nào !",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
        
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
        if (this.props.bookAttacheds !== nextProps.bookAttacheds) {
            this.setState({
                bookAttacheds: nextProps.bookAttacheds,
                selectedBook: ''
            })
        }

        if (this.props.selectedBookAttachedIDS !== nextProps.selectedBookAttachedIDS) {

            if (this.props.books) {
                let data = [];
                map(nextProps.selectedBookAttachedIDS, (value, index) => {
                    let findValue = this.props.books.filter(item => item._id == value);
                    if (findValue && findValue.length > 0) {
                        let dataItem = {
                            avatar: findValue[0].image ? findValue[0].image : "",
                            name: findValue[0].name ? findValue[0].name : "",
                            price: findValue[0].price ? findValue[0].price : 0,
                            id: findValue[0]._id ? findValue[0]._id : null
                        };
                        data.push(dataItem);
                    }
                })
                this.props.handleAddSelectedBookAttched(data);
            }
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
        let { book_relates, _id } = this.props.book;
        const { selectedBook } = this.state;

        if (selectedBook && selectedBook != '') {
            if (book_relates && !book_relates.includes(selectedBook)) {
                book_relates.push(selectedBook);
                const params = {
                    book_relates: book_relates,
                    book_id: _id
                };

                await this.props.bookUpdateRelate(params);
                await this.props.showBook(_id);
            } else {
                notification.warning({
                    message: "Sách học đã được thêm !",
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

    addBook = (obj) => {
        let data = {
            avatar: obj.image ? obj.image : "",
            name: obj.name ? obj.name : "",
            price: obj.price ? obj.price : 0,
            id: obj._id ? obj._id : null
        };

        this.props.handleAddBook(data);
    }


    fetchListItemBook() {
        let { selectedBooks } = this.props;

        if (this.props.books instanceof Array) {
            // Lọc bỏ những mục đã tồn tại trong selectedBooks và cuốn sách hiện tại đang chỉnh sửa
            const availableBooks = this.props.books.filter(obj => {
                const isCurrentBook = this.props.book && this.props.book._id === obj._id;
                const isExits = selectedBooks && selectedBooks.some(item => {
                    const itemId = item.id || item._id || item;
                    return itemId === obj._id;
                });
                return !isExits && !isCurrentBook;
            });

            return availableBooks.map((obj, i) => {
                return <li className="list-item" key={obj._id.toString()}>
                    <div className="info-classroom">
                        <div className="image-name">
                            {
                                obj.image
                                    ?
                                    <img src={obj.image} alt="" style={{ width: "50px", height: "50px" }} />
                                    :
                                    <img src="/assets/img/image-default-product.svg" alt="" style={{ width: "50px", height: "50px" }} />
                            }
                            <span className="ml-16">[{obj.book_id}]</span>
                            <span className="ml-16">{obj.name}</span>
                        </div>
                        <div className="action">
                            <a
                                className="btn-add-classroom"
                                onClick={() => this.addBook(obj)}
                                data-dismiss="modal"
                            >
                                <span>Thêm</span>
                                <img src="/assets/img/icon-add-bg-orange.svg" className="ml-12" alt="" />
                            </a>
                        </div>
                    </div>
                </li>;
            });
        }
    }

    fetchSubjectRows() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj, i) => {
                return <option key={i} value={obj._id}>{obj.name}</option>;
            });
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

        const { bookAttached } = this.props;

        return (
            <div
                id="book-attached"
                className="modal fade modal-add-classroom book"
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
                    style={{
                        width: "600px"
                    }}
                >
                    <div className='modal-content'>
                        <div className='modal-header pb-0'>
                            <div className="toolbar p-0">
                                <div className="flex block-filter-book">
                                    <div className="input-group">
                                        <div>
                                            <select
                                                className="custom-select"
                                                value={this.state.level}
                                                name="level"
                                                onChange={this.onChange}
                                            >
                                                <option value="">Cấp học</option>
                                                <option value="1">Lớp 1</option>
                                                <option value="2">Lớp 2</option>
                                                <option value="3">Lớp 3</option>
                                                <option value="4">Lớp 4</option>
                                                <option value="5">Lớp 5</option>
                                                <option value="6">Lớp 6</option>
                                                <option value="7">Lớp 7</option>
                                                <option value="8">Lớp 8</option>
                                                <option value="9">Lớp 9</option>
                                                <option value="10">Lớp 10</option>
                                                <option value="11">Lớp 11</option>
                                                <option value="12">Lớp 12</option>
                                            </select>
                                        </div>

                                        <div className='ml-16'>
                                            <select
                                                className="custom-select"
                                                value={this.state.subject_id}
                                                name="subject_id"
                                                onChange={this.onChange}
                                            >
                                                <option value="">Môn học</option>
                                                {this.fetchSubjectRows()}
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control form-control-theme keyword-custom ml-16"
                                            placeholder="Nhập từ khoá tìm kiếm..."
                                            onChange={this.onChange}
                                            value={this.state.keyword}
                                            name="keyword"
                                        />{' '}
                                        <span className="input-group-append">
                                            <button
                                                className="btn btn-white btn-sm"
                                                type="button">
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
                                                        className="feather feather-search">
                                                        <circle
                                                            cx={11}
                                                            cy={11}
                                                            r={8}
                                                        />
                                                        <line
                                                            x1={21}
                                                            y1={21}
                                                            x2="16.65"
                                                            y2="16.65"
                                                        />
                                                    </svg>
                                                </span>
                                            </button>
                                        </span>

                                    </div>
                                </div>
                            </div>
                            <button className='close' data-dismiss='modal'>
                                <img src="/assets/img/icon-close.svg" alt="" />
                            </button>
                        </div>
                        <div
                            className='modal-body'
                        >
                            <div className=''>
                                <div className='mb-5'>
                                    <div className="list-classrooms list-books">
                                        <ul className="list">
                                            {this.fetchListItemBook()}
                                        </ul>
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
        books: state.bookId.bookIds,
        limit: state.bookId.limit,
        page: state.bookId.page,
        total: state.bookId.total,
        check: state.bookId.checkAll,
        classrooms: state.classroom.classrooms,
        subjects: state.subject.subjects,
        bookAttacheds: state.bookId.bookAttacheds,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listBook, bookUpdateRelate, showBook, listSubject
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ModalBookRelate)
);
