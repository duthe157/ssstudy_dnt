import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { listSubject } from '../../redux/subject/action';
import { createClassroomGroup } from '../../redux/classroomgroup/action';

import { Radio } from "antd";

class ClassroomGroupCreate extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            subject_id: '',
            is_show_home: false,
            status: true,
            files: [],
            banner: [],
            content: '',
            ordering: 0,
        };
    }

    async componentDidMount() {
        const data = {
            limit: 999,
            is_delete: false,
        };
        await this.props.listSubject(data);
    }

    _onChange = async e => {
        var name = e.target.name;
        let value = e.target.value;
        if (name === 'files') {
            value = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(e.target.files[0]);
                reader.onload = () => {
                    resolve(reader.result);
                }
                reader.onerror = error => reject(error);
            });
            value = [value];
        }

        if (name === 'banner') {
            value = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(e.target.files[0]);
                reader.onload = () => {
                    resolve(reader.result);
                }
                reader.onerror = error => reject(error);
            });
            value = [value];
        }
        this.setState({
            [name]: value,
        });
    };


    handleSubmit = async (type) => {
        const data = {
            name: this.state.name,
            subject_id: this.state.subject_id,
            content: this.state.content,
            status: this.state.status,
            is_show_home: this.state.is_show_home,
            banner: this.state.banner,
            files: this.state.files,
            ordering: this.state.ordering,
        };

        if (type === 0) {
            await this.props.createClassroomGroup(data);
            if (this.props.redirect === true) {
                await this.props.history.push('/classroom/group');
            }
        } else {
            await this.props.createClassroomGroup(data);
            this.state = {
                name: '',
                subject_id: '',
                is_show_home: false,
                status: true,
                files: [],
                banner: [],
                content: '',
                ordering: 0,
            };
        }
    };


    fetchRows() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj, i) => {
                return <option value={obj._id}>{obj.name}</option>;
            });
        }
    }

    render() {
        return (
            <div>
                
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <h2 className="text-md text-highlight sss-page-title">Danh mục Lớp</h2>
                        <div className="row">
                            <div className="col-md-10">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Thêm mới Danh mục lớp</strong>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-group row">
                                            <div className="col-sm-6">
                                                <label className="col-form-label">
                                                    Tên
                                                </label>
                                                <div >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="name"
                                                        onChange={this._onChange}
                                                        value={this.state.name}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6" style={{display: 'none'}}>
                                                <label className=" col-form-label">
                                                    Môn học
                                                </label>
                                                <div className="">
                                                    <select
                                                        className="custom-select"
                                                        value={
                                                            this.state.subject_id
                                                        }
                                                        name="subject_id"
                                                        onChange={this._onChange}>
                                                        <option value="">
                                                            -- Chọn môn học --
                                                        </option>
                                                        {this.fetchRows()}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <label className="col-form-label">
                                                    Thứ tự
                                                </label>
                                                <div >
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="ordering"
                                                        onChange={this._onChange}
                                                        value={this.state.ordering}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-6">
                                                <label className="col-sm-4 col-form-label">
                                                    Hình ảnh
                                                </label>
                                                <div className="col-sm-4">
                                                    <input type="file" onChange={this._onChange} className="form-control-file" name="files" />
                                                </div>

                                            </div>
                                            <div className="col-sm-6">
                                                <label className="col-sm-4 col-form-label">
                                                    Banner
                                                </label>
                                                <div className="col-sm-4">
                                                    <input type="file" onChange={this._onChange} className="form-control-file" name="banner" />
                                                </div>

                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12">
                                                <label className=" col-form-label">
                                                    Hiện ở trang chủ
                                                </label>
                                                <div>
                                                    <Radio.Group
                                                        onChange={this._onChange}
                                                        name="is_show_home"
                                                        value={this.state.is_show_home}
                                                    >
                                                        <Radio value={true}>Hiển thị</Radio>
                                                        <Radio value={false}>Ẩn</Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12">
                                                <label className=" col-form-label">
                                                    Trạng thái
                                                </label>
                                                <div>
                                                    <Radio.Group
                                                        onChange={this._onChange}
                                                        name="status"
                                                        value={this.state.status}
                                                    >
                                                        <Radio value={true}>Hiển thị</Radio>
                                                        <Radio value={false}>Ẩn</Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12 text-right">
                                                <button
                                                    className="btn btn-primary mt-2"
                                                    onClick={() => this.handleSubmit(0)}>
                                                    Lưu
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
        );
    }
}

function mapStateToProps(state) {
    return {
        subjects: state.subject.subjects,
        redirect: true,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ listSubject, createClassroomGroup }, dispatch);
}

let ChapterCreateContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ClassroomGroupCreate),
);

export default ChapterCreateContainer;
