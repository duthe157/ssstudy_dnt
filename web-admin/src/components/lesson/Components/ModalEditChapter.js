import React, { Component } from "react";
import { notification, Select } from "antd";
import { listSubject } from "../../../redux/subject/action";
import { updateChapter } from '../../../redux/chapter/action';
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { map } from "lodash";

import BaseHelpers from "../../../helpers/BaseHelpers";



const { Option } = Select;

class ModalEditChapter extends Component {
    constructor(props) {
        if (props.classroom)
            console.log(props)
        super();
        this.state = {
            id: '',
            code: '',
            name: '',
            subject_id: '',
            level: ''
        };
    }



    onChange = async (e) => {
        let name = e.target.name;
        let value = e.target.value;
        await this.setState({
            [name]: value
        });

    };

    async componentDidMount() {
        // const data = {
        //     limit: 999,
        //     is_delete: false,
        // };
        // await this.props.listSubject(data);
    }


    fetchOptions() {
        if (this.props.books instanceof Array) {
            return this.props.books.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }


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

        if (this.props.selectedBookRelateIDs !== nextProps.selectedBookRelateIDs) {

            if (this.props.books) {
                let data = [];
                map(nextProps.selectedBookRelateIDs, (value, index) => {
                    let findValue = this.props.books.filter(item => item._id == value);
                    if (findValue) {
                        let dataItem = {
                            avatar: findValue[0].image ? findValue[0].image : "",
                            name: findValue[0].name ? findValue[0].name : "",
                            price: findValue[0].price ? findValue[0].price : 0,
                            id: findValue[0]._id ? findValue[0]._id : null
                        };
                        data.push(dataItem);
                    }
                })
                this.props.handleAddSelectedBookRelate(data);
            }
        }

        if (this.props.chapter !== nextProps.chapter) {
            this.setState({
                name: nextProps.chapter.name,
                id: nextProps.chapter._id,
                subject_id: nextProps.chapter.subject ? nextProps.chapter.subject.id : null,
                level: nextProps.chapter.level ? nextProps.chapter.level : null,
                code: nextProps.chapter.code ? nextProps.chapter.code : null,
            })
        }
    }

    handleSubmit = async () => {
        let { code,id, name, level, subject_id } = this.state;

        let data = {
            id,
            name,
            level,
            subject_id,
            code
        };

        await this.props.updateChapter(data);
        if (this.props.redirect === true) {
            await window.location.reload();
        }
    };

    fetchRows() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj, i) => {
                return <option key={i} value={obj._id}>{obj.name}</option>;
            });
        }
    }

    render() {


        return (
            <div
                id="modal-edit-chapter"
                className="modal fade modal-chapter book"
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
                        width: "900px"
                    }}
                >
                    <div className='modal-content'>
                        <div className='modal-body'>
                            <div className="block-content">
                                <h3 className="title">Thông tin chương</h3>
                                <div className="input-item-flex flex-end">
                                    <div className="form-group mr-16" style={{ width: "30%" }}>
                                        <label className="text-form-label">Mã chương</label>
                                        <div>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="code"
                                                onChange={this.onChange}
                                                style={{ background: "#ededed" }}
                                                value={this.state.code}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ width: "70%" }}>
                                        <label className="text-form-label">Tên chương</label>
                                        <div>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                onChange={this.onChange}
                                                value={this.state.name}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-item-flex flex-end mt-24">
                                    <div className="form-group mr-16" style={{ width: "50%" }}>
                                        <label className="text-form-label">Phân loại</label>
                                        <div className='mr-16'>
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
                                    </div>
                                    <div className="form-group" style={{ width: "50%" }}>
                                        <div>
                                            <select
                                                className="custom-select"
                                                value={
                                                    this.state.subject_id
                                                }
                                                name="subject_id"
                                                onChange={this.onChange}>
                                                <option value="">
                                                    -- Chọn môn học --
                                                </option>
                                                {this.fetchRows()}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="block-action-footer">
                                <button data-dismiss='modal' type="button" className="btn-cancel">
                                    <img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
                                    Hủy thay đổi
                                </button>
                                <button type="button" className="btn-submit ml-16" onClick={this.handleSubmit}>
                                    Cập nhật
                                    <img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
                                </button>
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
        subjects: state.subject.subjects,
        redirect: state.chapter.redirect,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listSubject, updateChapter
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ModalEditChapter)
);
