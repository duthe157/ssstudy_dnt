import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { listSubject } from '../../redux/subject/action';
import { showClassroomGroup, updateClassroomGroup } from '../../redux/classroomgroup/action';


class ClassroomGroupEdit extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            subject_id: '',
            content: '',
            is_show_home: false,
            status: true,
            files: [],
            banner: [],
            checkedTrue: null,
            checkedFlase: null,
            ordering: 0,
        };
    }

    async componentDidMount() {
        const data = {
            limit: 999,
            is_delete: false,
        };
        await this.props.listSubject(data);
        await this.props.showClassroomGroup(this.props.match.params.id);
        if (this.props.classroomGroup) {
            var { name, content, status, ordering, is_show_home } = this.props.classroomGroup;
            this.setState({
                name,
                content,
                is_show_home,
                status,
                ordering,
            });
        }
    }

    _onChange = async e => {
        var name = e.target.name;
        let value = e.target.value;
        if (name === 'is_show_home') {
            value = (value == 1) ? true: false
        }

        if (name === 'status') {
            value = (value == 1) ? true: false
        }
        
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

    handleSubmit = e => {
        e.preventDefault();

        const data = {
            id: this.props.match.params.id,
            name: this.state.name,
            is_show_home: this.state.is_show_home,
            subject_id: this.state.subject_id,
            content: this.state.content,
            status: this.state.status,
            banner: this.state.banner,
            files: this.state.files,
            ordering: this.state.ordering,
        };
        this.props.updateClassroomGroup(data);
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
            <div className="page-content page-container" id="page-content">
                <div className="padding">
                    <h2 className="text-md text-highlight sss-page-title">Danh mục Lớp</h2>
                    <div className="row">
                        <div className="col-md-10">
                            <div className="card">
                                <div className="card-header">
                                    <strong>Cập nhật Danh mục lớp</strong>
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
                                    </div>
                                    <div className="form-group row">
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
                                            <div className="col-sm-4 d-flex">
                                                <img alt="" src={
                                                    this.props.classroomGroup
                                                        ?
                                                        this.props.classroomGroup.image
                                                        : ''
                                                }
                                                    style={{ width: '200px' }} />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="col-sm-4 col-form-label">
                                                Banner
                                            </label>
                                            <div className="col-sm-4">
                                                <input type="file" onChange={this._onChange} className="form-control-file" name="banner" />
                                            </div>
                                            <div className="col-sm-4 d-flex">
                                                <img alt="" src={
                                                    this.props.classroomGroup
                                                        ?
                                                        this.props.classroomGroup.banner
                                                        : ''
                                                }
                                                    style={{ width: '200px' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-sm-12">
                                            <label className=" col-form-label">
                                                Hiển thị ở Trang chủ
                                            </label>
                                            <div>
                                                <div className="form-check float-left">
                                                    <input checked={this.state.is_show_home === true} className="form-check-input"
                                                        type="radio" name="is_show_home" id="gridRadios1"
                                                        onChange={this._onChange} defaultValue={1} />
                                                    <label className="form-check-label" htmlFor="gridRadios1">
                                                        Hiển thị
                                                    </label>
                                                </div>
                                                <div className="form-check float-left ml-4">
                                                    <input checked={this.state.is_show_home === false}
                                                        className="form-check-input" type="radio" name="is_show_home" id="gridRadios2" onChange={this._onChange} defaultValue={0} />
                                                    <label className="form-check-label" htmlFor="gridRadios2">
                                                        Ẩn
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-sm-12">
                                            <label className=" col-form-label">
                                                Trạng thái
                                            </label>
                                            <div>
                                                <div className="form-check float-left">
                                                    <input checked={this.state.status === true} className="form-check-input"
                                                        type="radio" name="status" id="gridRadios1"
                                                        onChange={this._onChange} defaultValue={1} />
                                                    <label className="form-check-label" htmlFor="gridRadios1">
                                                        Hiển thị
                                                    </label>
                                                </div>
                                                <div className="form-check float-left ml-4">
                                                    <input checked={this.state.status === false}
                                                        className="form-check-input" type="radio" name="status" id="gridRadios2" onChange={this._onChange} defaultValue={0} />
                                                    <label className="form-check-label" htmlFor="gridRadios2">
                                                        Ẩn
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="form-group row">
                                <div className="col-sm-12 text-right">
                                    <button
                                        className="btn btn-primary mt-2"
                                        onClick={this.handleSubmit}>
                                        Cập nhật
                                    </button>
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
        classroomGroup: state.classroomGroup.classroomGroup,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ listSubject, showClassroomGroup, updateClassroomGroup }, dispatch);
}

let ChapterCreateContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ClassroomGroupEdit),
);

export default ChapterCreateContainer;
