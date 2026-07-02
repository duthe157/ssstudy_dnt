import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createPost } from '../../redux/blog/action';
import { listSubject } from "../../redux/subject/action";
import { listBlogCategory } from '../../redux/blogCategory/action';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";
import { uploadImage } from "../../redux/category/action";


class BlogCreate extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            description: '',
            status: true,
            files: [],
            external_link: '',
            category_id: null,
            is_featured: false,
            content: "",
            level: "",
            subject_id: ""
        };
    }

    async componentDidMount() {
        const params = { keyword: "", limit: 100, page: 1, is_delete: false };
        await this.props.listBlogCategory(params);

        // Lấy danh sách môn học
        await this.props.listSubject({ limit: 999 });
    }

    _onChange = async e => {
        var name = e.target.name;
        let value = e.target.value;

        let checked = e.target.checked;

        if (name === "status" || name === "is_featured") {
            value = checked;
        }

        if (name === 'files') {
            value = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(e.target.files[0]);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
            value = [value];
        }

        this.setState({ [name]: value });
    };

    handleSubmit = async (type) => {
        const data = {
            name: this.state.name,
            description: this.state.description,
            files: this.state.files,
            external_link: this.state.external_link,
            status: this.state.status,
            is_featured: this.state.is_featured,
            category_id: this.state.category_id,
            level: this.state.level,
            subject_id: this.state.subject_id,
            content: this.state.content
        };

        if (type === 0) {
            console.log('chưa làm');
        } else {
            await this.props.createPost(data);
            if (this.props.redirect === true && this.props.post) {
                await this.props.history.push('/blog');
            }
        }


    };

    fetchTeacherRows() {
        if (this.props.categories instanceof Array) {
            return this.props.categories.map((obj) => (
                <option value={obj._id} key={obj._id.toString()}>
                    {obj.name}
                </option>
            ));
        }
    }

    fetchClassRows() {
        if (this.props.classes instanceof Array) {
            return this.props.classes.map((obj) => (
                <option value={obj._id} key={obj._id.toString()}>
                    {obj.name}
                </option>
            ));
        }
    }

    fetchSubjectRows() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj) => {
            return (
                <option value={obj._id} key={obj._id.toString()}>
                {obj.name}
                </option>
            );
        });
    }
    }


    fetchRows() {
        // if (this.props.subjects instanceof Array) {
        //     return this.props.subjects.map((obj, i) => {
        //         return <option value={obj._id}>{obj.name}</option>;
        //     });
        // }
    }

    _handleEditorDescriptionChange = (content) => {
        this.setState({ description: content });
    };

    _handleEditorContentChange = (content) => {
        this.setState({ content: content });
    };

    handleImageUploadBefore = async (files, info, uploadHandler) => {
        const data = new FormData();
        data.append("files", files[0]);

        await this.props.uploadImage(data);
        const response = {
            result: [{ url: this.props.image, name: files[0].name, size: files[0].size }]
        };
        await uploadHandler(response);
    };

    render() {
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <h2 className='text-md text-highlight sss-page-title'> Thêm bài viết mới </h2>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Thêm bài viết mới</strong>
                                    </div>
                                    <div className="card-body">

                                        {/* Tiêu đề */}
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label"> Tiêu đề </label>
                                            <div className='col-sm-8'>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    onChange={this._onChange}
                                                    value={this.state.name}
                                                />
                                            </div>
                                        </div>

                                        {/* Danh mục */}
                                        <div className="form-group row">

                                            <label className="col-sm-4 col-form-label">Chọn danh mục</label>
                                            <div className='col-sm-8'>
                                                <select
                                                    className="custom-select"
                                                    value={this.state.category_id}
                                                    name="category_id"
                                                    onChange={this._onChange}
                                                >
                                                    <option value="">-- Chọn danh mục --</option>
                                                    {this.fetchTeacherRows()}
                                                </select>
                                            </div>

                                        </div>

                                        {/* Chọn lớp/môn */}
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">
                                                Chọn lớp/môn (chỉ dùng cho viết "Lịch livestream")
                                            </label>
                                            <div className="col-sm-8 d-flex gap-2">
                                               {/* Chọn lớp */}
                                                <select
                                                    className="custom-select mr-2"
                                                    value={this.state.level}
                                                    name="level"
                                                    onChange={this._onChange}
                                                    style={{ width: '28%' }}
                                                >
                                                <option value="">-- Cấp học --</option>
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

                                                <select
                                                    className="custom-select"
                                                    value={this.state.subject_id}
                                                    name="subject_id"
                                                    onChange={this._onChange}
                                                    style={{ width: "48%" }}
                                                    >
                                                    <option value="">-- Chọn môn học --</option>
                                                    {this.fetchSubjectRows()}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Hình ảnh */}
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label"> Hình ảnh </label>
                                            <div className="col-sm-8">
                                                <input onChange={this._onChange} type="file" className="form-control-file" name="files" />
                                            </div>
                                        </div>

                                        {/* External link */}
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label"> External_link </label>
                                            <div className='col-sm-8'>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="external_link"
                                                    onChange={this._onChange}
                                                    value={this.state.external_link}
                                                />
                                            </div>

                                        </div>

                                        {/* Mô tả ngắn */}
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label"> Mô tả ngắn </label>
                                            <div className="col-sm-8">
                                                <SunEditor
                                                    onImageUploadBefore={this.handleImageUploadBefore}
                                                    height= {'400px'}
                                                    setContents={this.state.description}
                                                    onChange={this._handleEditorDescriptionChange}
                                                    setOptions={{
                                                        buttonList: baseHelpers.getSunEditorOptions(),
                                                        katex: katex,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Nội dung */}
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label"> Nội dung </label>
                                            <div className="col-sm-8">
                                                <SunEditor
                                                    onImageUploadBefore={this.handleImageUploadBefore}
                                                    height= {'400px'}
                                                    setContents={this.state.content}
                                                    onChange={this._handleEditorContentChange}
                                                    setOptions={{
                                                        buttonList: baseHelpers.getSunEditorOptions(),
                                                        katex: katex,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {/* <div className="form-group row">
                                            <div className="col-sm-6">
                                                <label className=" col-form-label">
                                                    Trạng thái
                                                </label>
                                                <div>
                                                    <div className="form-check float-left">
                                                        <input className="form-check-input" type="radio" name="status" value="true" id="gridRadios1" onChange={this._onChange} defaultValue="option1" defaultChecked />
                                                        <label className="form-check-label" htmlFor="gridRadios1">
                                                            Hiển thị
                                                        </label>
                                                    </div>
                                                    <div className="form-check float-left ml-4">
                                                        <input className="form-check-input" type="radio" name="status" value="false" id="gridRadios2" onChange={this._onChange} defaultValue="option2" />
                                                        <label className="form-check-label" htmlFor="gridRadios2">
                                                            Ẩn
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                        </div> */}
                                        {/* Hiển thị */}
                                        <div className="form-group row">
                                            <label className="text-form-label col-sm-4">Hiển thị</label>
                                            <div className="col-sm-8">
                                                <div className="float-left">
                                                    <label className="ui-switch ui-switch-md info m-t-xs">
                                                        <input
                                                            type="checkbox"
                                                            name="status"
                                                            value={this.state.status}
                                                            checked={this.state.status === true ? 'checked' : ''}
                                                            onChange={this._onChange}
                                                        />{' '}
                                                        <i />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nổi bật */}
                                        <div className="form-group row">
                                            <label className="text-form-label col-sm-4">Nổi bật</label>
                                            <div className="col-sm-8">
                                                <div className="float-left">
                                                    <label className="ui-switch ui-switch-md info m-t-xs">
                                                        <input
                                                            type="checkbox"
                                                            name="is_featured"
                                                            value={this.state.is_featured}
                                                            checked={this.state.is_featured === true ? 'checked' : ''}
                                                            onChange={this._onChange}
                                                        />{' '}
                                                        <i />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="form-group row">
                                            <div className="col-sm-12 text-right">
                                                <button className="btn btn-primary mt-2 ml-2" onClick={() => this.handleSubmit(1)}>
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
        post: state.blog.post,
        redirect: state.blog.redirect,
        categories: state.blogCategory.blogCategories,
        image: state.question.image,
        classes: state.classData?.classes,
        subjects: state.subject.subjects
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ listBlogCategory, createPost, uploadImage, listSubject }, dispatch);
}

let ContainerCreate = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(BlogCreate),
);

export default ContainerCreate;
