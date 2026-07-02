import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showAdultEvaluation, updateAdultEvaluation } from './../../redux/adultEvaluation/action';

import { Radio } from "antd";

class ReviewEdit extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            type: '',
            description: '',
            content: '',
            files: '',
            status: false
        };
    }

    async componentDidMount() {
        await this.props.showAdultEvaluation(this.props.match.params.id);
        if (this.props.adultEval) {
            var { name, description, content, status, type } = this.props.adultEval;
            await this.setState({
                name,
                type,
                description,
                content,
                files: this.props.adultEval.image,
                status,
            })
        }
    }

    _onChange = async e => {
        var name = e.target.name;
        var value = e.target.value;
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

        await this.setState({
            [name]: value
        });
    };


    handleSubmit = e => {
        e.preventDefault();

        var { name, description, content, files, status, type } = this.state;
        var data = {
            id: this.props.match.params.id,
            name,
            type,
            description,
            content,
            files,
            status,
        };
        this.props.updateAdultEvaluation(data);
    };

    render() {
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                    <h2 className='text-md text-highlight sss-page-title'>
                            Cập nhật đánh giá
                        </h2>
                        <div className="flex" />
                        <div className="page-adult-edit">
                            <div className="row">
                                <div className="col-md-10">
                                    <div className="card">
                                        <div className="card-header">
                                            <strong>Cập nhật đánh giá</strong>
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
                                                        Mô tả
                                                    </label>
                                                    <div>
                                                        <textarea
                                                            className="form-control"
                                                            name="description"
                                                            onChange={this._onChange}
                                                            value={this.state.description}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <label className=" col-form-label">
                                                        Nội dung
                                                    </label>
                                                    <div>
                                                        <textarea
                                                            className="form-control"
                                                            name="content"
                                                            onChange={this._onChange}
                                                            value={this.state.content}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <label className="col-sm-4 col-form-label">
                                                        Hình ảnh
                                                    </label>
                                                    <div className="col-sm-4">
                                                        <input type="file" onChange={this._onChange} className="form-control-file" name="files" />
                                                    </div>
                                                    <div className="col-sm-4 d-flex">
                                                        <img alt="" src={
                                                            this.props.adultEval
                                                                ?
                                                                this.props.adultEval.image
                                                                : ''
                                                        }
                                                            style={{ width: '200px' }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <div className="col-sm-6">
                                                    <label className=" col-form-label">
                                                        Chọn loại
                                                    </label>
                                                    <div>
                                                        <select className="custom-select" name="type" onChange={this._onChange} value={this.state.type}>
                                                            <option value="DANHGIA_PHUHUYNH">Đánh giá Phụ Huynh</option>
                                                            <option value="TOP_RANKS">Vinh danh</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <div className="col-sm-6">
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
                                                        onClick={this.handleSubmit}>
                                                        Cập nhật
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
        adultEval: state.adultEvals.adultEval,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ showAdultEvaluation, updateAdultEvaluation }, dispatch);
}

let ContainerEdit = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ReviewEdit),
);

export default ContainerEdit;
