import React, { Component } from "react";
import { notification, Select } from "antd";
import { listSubject } from "../../../redux/subject/action";
import { createChapter } from '../../../redux/chapter/action';
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listExam } from "../../../redux/exam/action";

import { isEmpty } from "lodash";
import moment from "moment";
import { DatePicker } from "antd";

import BaseHelpers from "../../../helpers/BaseHelpers";



const { Option } = Select;

class ModalAddExam extends Component {
    constructor(props) {
        if (props.classroom)
            console.log(props)
        super();
        this.state = {
            exam_id: ""
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
        // await this.props.listExam(data);
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
        let { exams } = this.props;
        let exam_id = this.state.exam_id;

        if (exams) {
            let findata = exams.find(el => el._id === exam_id);

            if (findata) {
                let data = {
                    id: exam_id,
                    name: findata.name,
                    num_question: findata.questions ? findata.questions.length : 0
                }

                await this.props.handleAddExam(data);
            }
        }
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

    fetchOptionsExam() {
        if (this.props.exams instanceof Array) {

            return this.props.exams.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }

    onSearchExam = async (value) => {
        if (value) {
            await this.props.listExam({
                limit: 999,
                keyword: value,
            });
        }
    };

    onChangeExam = async (value) => {
        if (value) {
            await this.setState({
                exam_id: value
            })
        }
    };

    handleListExam = async () => {
        const data = {
            limit: 999,
            is_delete: false,
        };
        await this.props.listExam(data);
    }

    render() {

        return (
            <div
                id="modal-add-exam"
                className="modal fade modal-add-video book"
                data-backdrop="static"
                style={{
                    display: "none",
                    minWidth: "1000px",
                    zIndex: "99999"
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
                        <div className='modal-body'>
                            <div className="block-content">
                                <div className="block-info-lesson">
                                    <h3 className="title">Lựa chọn đề</h3>
                                    <div className="input-item-flex">
                                        <div className="form-group w-100">
                                            <label className="text-form-label">Tiêu đề</label>
                                            <Select
                                                showSearch
                                                style={{ width: "100%" }}
                                                placeholder="Tìm và chọn đề thi"
                                                value={this.state.exam_id}
                                                optionFilterProp="children"
                                                onChange={this.onChangeExam}
                                                onFocus={this.handleListExam}
                                                onSearch={this.onSearchExam}
                                                filterOption={(input, option) =>
                                                    option.props.children
                                                        .toLowerCase()
                                                        .indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                {this.fetchOptionsExam()}
                                            </Select>
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
                                    Thêm đề thi
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
        exams: state.exam.exams,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listExam
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ModalAddExam)
);
