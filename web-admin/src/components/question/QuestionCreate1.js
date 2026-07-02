import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Input, Select, Icon, message, Radio, Upload, Button } from 'antd';
import { listChapter } from '../../redux/chapter/action';
import { listCategory } from '../../redux/category/action';
import { createQuestion } from '../../redux/question/action';

const { Option } = Select;

class QuestionCreate extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            question: null,
            answer: 'A',
            doc_link: '',
            video_link: '',
            chapter_id: '',
            category_id: '',
            level: ''
        }
    }

    async componentDidMount() {
        const data = {
            limit: 999,
            is_delete: false
        }
        await this.props.listChapter(data);
        await this.props.listCategory(data);
    }

    _onChange = (e) => {
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value
        });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: this.state.name,
            question: this.state.question,
            answer: this.state.answer,
            doc_link: this.state.doc_link,
            video_link: this.state.video_link,
            // chapter_id: this.state.chapter_id,
            // category_id: this.state.category_id,
            level: this.state.level,
        }
        await this.props.createQuestion(data);
        await this.props.history.push('/question');
    }

    handleSave = async (e) => {
        e.preventDefault();

        const data = {
            name: this.state.name,
            question: this.state.question,
            answer: this.state.answer,
            doc_link: this.state.doc_link,
            video_link: this.state.video_link,
            chapter_id: this.state.chapter_id,
            category_id: this.state.category_id,
            level: this.state.level,
        }

        await this.props.createQuestion(data);
        this.setState({
            name: '',
            question: '',
            answer: 'A',
            doc_link: '',
            video_link: '',
            chapter_id: '',
            category_id: '',
            level: ''
        });
    }

    fetchRowsChapter() {
        if (this.props.chapters instanceof Array) {
            return this.props.chapters.map((obj, i) => {
                return <option value={obj._id}>{obj.name}</option>;
            })
        }
    }

    fetchRowsCategory() {
        if (this.props.categories instanceof Array) {
            return this.props.categories.map((obj, i) => {
                return <option value={obj._id}>{obj.name}</option>;
            })
        }
    }

    render() {
        return (
            <div>
                <div className="page-hero page-container" id="page-hero">
                    <div className="padding d-flex">
                        <div className="page-title">
                            <h2 className="text-md text-highlight">Thêm mới</h2>
                        </div>
                        <div className="flex" />
                        <div>
                            <Link to={'/question'} className="btn btn-sm text-white btn-primary"><span className="d-none d-sm-inline mx-1">Quay lại</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right"><line x1={5} y1={12} x2={19} y2={12} /><polyline points="12 5 19 12 12 19" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <div className="row">
                            <div className="col-md-10">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Thêm câu hỏi mới</strong>
                                    </div>
                                    <div className="card-body">
                                        <form ref={(el) => this.myFormRef = el}>
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Tên câu hỏi</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control" name="name" onChange={this._onChange} value={this.state.name} />
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Câu hỏi</label>
                                                <div className="col-sm-8">
                                                    <input type="file" name="file" onChange={this.onChangeHandler} className="form-control" />
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Đáp án</label>
                                                <div className="col-sm-8">
                                                    <Radio.Group onChange={this._onChange} value={this.state.value} name="answer" value={this.state.answer}>
                                                        <Radio value={'A'}>A</Radio>
                                                        <Radio value={'B'}>B</Radio>
                                                        <Radio value={'C'}>C</Radio>
                                                        <Radio value={'D'}>D</Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Tài liệu tham khảo</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control" name="doc_link" onChange={this._onChange} value={this.state.doc_link} />
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Video tham khảo</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control" name="video_link" onChange={this._onChange} value={this.state.video_link} />
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Chương</label>
                                                <div className="col-sm-8">
                                                    <select className="custom-select" value={this.state.chapter_id} name="chapter_id" onChange={this._onChange}>
                                                        <option value="">-- Chọn chương --</option>
                                                        {
                                                            this.fetchRowsChapter()
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Danh mục</label>
                                                <div className="col-sm-8">
                                                    <select className="custom-select" value={this.state.category_id} name="category_id" onChange={this._onChange}>
                                                        <option value="">-- Chọn danh mục --</option>
                                                        {
                                                            this.fetchRowsCategory()
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Độ khó</label>
                                                <div className="col-sm-8">
                                                    <select className="custom-select" value={this.state.level} name="level" onChange={this._onChange}>
                                                        <option value="">-- Chọn danh mục --</option>
                                                        <option value="NHAN_BIET">Nhận biết</option>
                                                        <option value="THONG_HIEU">Thông hiểu</option>
                                                        <option value="VAN_DUNG">Vận dụng</option>
                                                        <option value="VAN_DUNG_CAO">Vận dụng cao</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <div className="col-sm-12 text-right">
                                                    <button className="btn btn-primary mt-2" onClick={this.handleSubmit}>Lưu</button>
                                                    <button className="btn btn-primary mt-2 ml-2" onClick={this.handleSave}>Lưu & Thêm mới</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        chapters: state.chapter.chapters,
        categories: state.category.categories,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ listChapter, listCategory, createQuestion }, dispatch);
}

let QuestionCreateContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(QuestionCreate));

export default QuestionCreateContainer;
