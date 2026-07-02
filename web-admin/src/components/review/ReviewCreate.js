import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import { listClassroom } from '../../redux/classroom/action';
import { createReview } from '../../redux/review/action';

import { Select, Radio } from "antd";

class ReviewCreate extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            classroom_id: '',
            classroom_name: '',
            status: true,
            avatar_base64: "",
            rating: 1,
            comment: ''
        };
    }

    async componentDidMount() {
        console.log('Todo');
    }

    _onChange = async e => {
        let name = e.target.name;
        let value = e.target.value;
        if (name === "avatar_base64") {
            value = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(e.target.files[0]);
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.onerror = (error) => reject(error);
            });
            value = value;
        }
        this.setState({
            [name]: value,
        });
    };

    onChangeRating = async (e) => {
        await this.setState({
            rating: e.target.value
        })
        
    }

    _onChangeClassroom = async (value) => {
        await this.setState({
            classroom_id: value,
        });
    };

    _onSearchClassroom = async (value) => {
        if (value) {
            await this.props.listClassroom({ limit: 999, keyword: value });
        }
    }

    handleSubmit = async (type) => {
        const data = {
            name: this.state.name,
            classroom_id: this.state.classroom_id,
            comment: this.state.comment,
            status: this.state.status,
            rating: this.state.rating,
            avatar_base64: this.state.avatar_base64,
        };

        if (type === 0) {
            await this.props.createReview(data);
            if (this.props.redirect === true) {
                await this.props.history.push('/classroom/review');
            }
        } else {

            await this.props.createReview(data);
        }


    };


    fetchClassroomRows() {
        if (this.props.classrooms instanceof Array) {
            return this.props.classrooms.map((obj, i) => {
                return <option value={obj._id}>{obj.name}</option>;
            });
        }
    }

    render() {
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <h2 className="text-md text-highlight sss-page-title">Đánh giá lớp học</h2>
                        <div className="row">
                            <div className="col-md-10">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Thêm mới đánh giá</strong>
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

                                            <div className="col-sm-6">
                                                <label className=" col-form-label">
                                                    Lớp
                                                </label>
                                                <div className="">
                                                    <Select
                                                        showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Tìm và chọn lớp"
                                                        value={this.state.classroom_id}
                                                        optionFilterProp="children"
                                                        onChange={this._onChangeClassroom}
                                                        onSearch={this._onSearchClassroom}
                                                        filterOption={(input, option) =>
                                                            option.props.children
                                                                .toLowerCase()
                                                                .indexOf(
                                                                    input.toLowerCase()
                                                                ) >= 0
                                                        }
                                                    >
                                                        {this.fetchClassroomRows()}
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="col-sm-6">
                                                <label className="col-form-label">
                                                    Số sao
                                                </label>
                                                <div >
                                                    <select className="form-control" name="rating" onChange={this.onChangeRating}>
                                                        <option value={1}>1</option>
                                                        <option value={2}>2</option>
                                                        <option value={3}>3</option>
                                                        <option value={4}>4</option>
                                                        <option value={5}>5</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-sm-6">
                                                <label className="col-form-label">
                                                    Avatar
                                                </label>
                                                <input
                                                    onChange={this._onChange}
                                                    type="file"
                                                    className="form-control-file"
                                                    name="avatar_base64"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12">
                                                <label className=" col-form-label">
                                                    Nội dung đánh giá
                                                </label>
                                                <div>
                                                    <textarea
                                                        className="form-control"
                                                        name="comment"
                                                        onChange={this._onChange}
                                                        value={this.state.comment}
                                                    />
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
                                                <button
                                                    className="btn btn-primary mt-2 ml-2"
                                                    onClick={() => this.handleSubmit(1)}>
                                                    Lưu & Thêm mới
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
        classrooms: state.classroom.classrooms,
        redirect: true,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ listClassroom, createReview }, dispatch);
}

let ContainerCreate = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ReviewCreate),
);

export default ContainerCreate;
