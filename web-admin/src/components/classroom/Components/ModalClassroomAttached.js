import React, { Component } from "react";
import { notification, Select } from "antd";
import {
    listClassroom,
    getMultipleClassroomDetails
} from "../../../redux/classroom/action";
import { listSubject } from "../../../redux/subject/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";

import BaseHelpers from "../../../helpers/BaseHelpers";
import { isArray, map } from "lodash";

const { Option } = Select;



class ModalClassroomAttached extends Component {
    constructor(props) {
        if (props.classroom)
            console.log(props)
        super();
        this.state = {
            data: [],
            ids: [],
            selectedClassroom: '',
            classroomAttached: [],
            keyword: null,
            level: null,
            subject_id: null
        };
    }






    onChange = async (e) => {
        let name  = e.target.name;
        let value = e.target.value;
        await this.setState({
            [name]: value,
        });

        this.getData(1);
    };

    getData = async (pageNumber = 1) => {
        const data = {
            page: pageNumber,
            limit: this.state.limit,
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
        await this.props.listClassroom(data);

    };

    async componentDidMount() {
        if (this.props.limit) {
            await this.setState({
                limit: this.props.limit,
                ids: this.props.ids,
            });
        }
        this.getData(1);
    }

    onSubmit = (e) => {
        // e.preventDefault();
        // this.props.listBook(this.getData());
    };

    fetchOptions = () => {
        if (this.props.classrooms instanceof Array) {
            return this.props.classrooms.map((obj, i) => {
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
        if (this.props.classroomAttached !== nextProps.classroomAttached) {
            this.setState({
                classroomAttached: nextProps.classroomAttached,
                selectedClassroom: ''
            })
        }
        if (this.props.selectedClassroomAttachedIDs !== nextProps.selectedClassroomAttachedIDs) {
            if (nextProps.selectedClassroomAttachedIDs && nextProps.selectedClassroomAttachedIDs.length > 0) {
                // Gọi API detail để lấy thông tin chi tiết của các classroom
                this.props.getMultipleClassroomDetails(nextProps.selectedClassroomAttachedIDs)
                    .then(classrooms => {
                        const data = classrooms.map(classroom => ({
                            image: classroom.image ? classroom.image : "",
                            name: classroom.name ? classroom.name : "",
                            price: classroom.price ? classroom.price : 0,
                            id: classroom._id ? classroom._id : null
                        }));
                        this.props.handleAddSelectedClassroomAttached(data);
                    })
                    .catch(err => {
                        console.error('Error fetching classroom details:', err);
                        this.props.handleAddSelectedClassroomAttached([]);
                    });
            } else {
                this.props.handleAddSelectedClassroomAttached([]);
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

    fetchListItemClassroom = () => {
        let selectedClassroom = this.props.selectedClassroom;
        if (this.props.classrooms instanceof Array) {
            return this.props.classrooms.map((obj, i) => {
                let isExits = selectedClassroom.some((item => item.id === obj._id));
                return <li className="list-item" key={obj._id.toString()}>
                    <div className="info-classroom">
                        <div className="image-name">
                            <img src="/assets/img/image-default-product.svg" alt="" />
                            <span className="ml-16">{obj.name}</span>
                        </div>
                        <div className="action">
                            {
                                !isExits
                                    ?
                                    <a
                                        className="btn-add-classroom"
                                        onClick={() => this.addClassroom(obj)}
                                    >
                                        <span>Thêm</span>
                                        <img src="/assets/img/icon-add-bg-orange.svg" className="ml-12" alt="" />
                                    </a>
                                    :
                                    <span className="is-exit-text">
                                        Đã thêm
                                        <img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" />
                                    </span>
                            }
                        </div>
                    </div>
                </li>;
            });
        }
    }

    addClassroom = (obj) => {
        let data = {
            avatar: obj.avatar ? obj.avatar : "",
            name: obj.name ? obj.name : "",
            price: obj.price ? obj.price : 0,
            id: obj._id ? obj._id : null
        };

        this.props.handleAddClassroom(data);
    }

    fetchSubjectRows = () => {
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
                id="classroom-attached"
                className="modal fade modal-add-classroom"
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
                                    <div className="list-classrooms">
                                        <ul className="list">
                                            {this.fetchListItemClassroom()}
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
        books: state.book.books,
        limit: state.book.limit,
        page: state.book.page,
        total: state.book.total,
        ids: state.book.ids,
        check: state.book.checkAll,
        classroom: state.classroom.classroom,
        classrooms: state.classroom.classrooms,
        classroomAttached: state.classroom.classroomAttached,
        subjects: state.subject.subjects,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listClassroom,
            listSubject,
            getMultipleClassroomDetails
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ModalClassroomAttached)
);
