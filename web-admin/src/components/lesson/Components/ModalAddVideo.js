import React, { Component } from "react";
import { notification, Select } from "antd";
import { listSubject } from "../../../redux/subject/action";
import { createChapter } from '../../../redux/chapter/action';
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { map } from "lodash";
import moment from "moment";
import { DatePicker } from "antd";

import BaseHelpers from "../../../helpers/BaseHelpers";



const { Option } = Select;

class ModalAddVideo extends Component {
    constructor(props) {
        if (props.classroom)
            console.log(props)
        super();
        this.state = {
            name: "",
            link: "",
            duration: "",
            ordering: null
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

    }

    handleSubmit = async () => {
        let { name, link, duration } = this.state;

        let data = {
            name,
            link,
            duration
        };

        await this.props.handleAddVideo(data);
    };

    fetchSubjects() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj, i) => {
                return <option key={i} value={obj._id}>{obj.name}</option>;
            });
        }
    }

    fetchChapters() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj, i) => {
                return <option key={i} value={obj._id}>{obj.name}</option>;
            });
        }
    }

    render() {

        return (
            <div
                id="modal-add-video"
                className="modal fade modal-add-video book"
                data-backdrop="static"
                style={{
                    display: "none",
                    minWidth: "1000px",
                    zIndex: "999999"
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
                                <div className="block-info-lesson">
                                    <h3 className="title">Thêm video bài giảng</h3>
                                    <div className="input-item-flex">
                                        <div className="form-group w-50 mr-16">
                                            <label className="text-form-label">Tiêu đề</label>
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
                                        <div className="form-group w-50">
                                            <label className="text-form-label">Link video</label>
                                            <div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="link"
                                                    onChange={this.onChange}
                                                    value={this.state.link}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="input-item-flex">
                                        <div className="form-group w-50">
                                            <label className="text-form-label">Thời gian (phút)</label>
                                            <div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="duration"
                                                    onChange={this.onChange}
                                                    value={this.state.duration}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="block-action-footer">
                                <button data-dismiss='modal' type="button" className="btn-cancel">
                                    <img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
                                    Hủy 
                                </button>
                                <button type="button" className="btn-submit ml-16" onClick={this.handleSubmit}>
                                    Thêm video
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
            listSubject, createChapter
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ModalAddVideo)
);
