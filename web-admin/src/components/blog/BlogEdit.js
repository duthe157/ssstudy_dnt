import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showPost, updatePost } from '../../redux/blog/action';
import { listSubject } from "../../redux/subject/action";
import { listBlogCategory } from '../../redux/blogCategory/action';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";
import { uploadImage } from "../../redux/category/action";

class BlogEdit extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            description: '',
            files: [],
            external_link: '',
            is_featured: false,
            status: true,
            category_id: null,
            content: "",
            level: "",
            subject_id: ""
        };
    }

    async componentDidMount() {
        await this.props.showPost(this.props.match.params.id);
        const params = {
			keyword: "",
			limit: 100,
			page: 1,
			is_delete: false
		};

        // Lấy danh sách môn học
        await this.props.listSubject({ limit: 999 });

		await this.props.listBlogCategory(params);

        if (this.props.post) {
            let { name, description, files, external_link, status, teacher_id, content, is_featured, category, level, subject_id } = this.props.post;

            this.setState({
                name,
                description,
                files,
                external_link,
                status,
                content,
                is_featured,
                category_id: category ? category.id : null,
                level: level || "",             // set lại level
                subject_id: subject_id || ""    // set lại subject_id
            })
        }
    }

    _onChange = async e => {
        var name = e.target.name;
        let value = e.target.value;

        let checked = e.target.checked;
		if (name === "status" || name == "is_featured") {
			value = checked;
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
        await this.setState({
            [name]: value,
        });
    };

    handleSubmit = e => {
        e.preventDefault();

        const data = {
            id: this.props.match.params.id,
            name: this.state.name,
            description: this.state.description,
            external_link: this.state.external_link,
            files: this.state.files,
            status: this.state.status,
            category_id: this.state.category_id,
            content: this.state.content,
            is_featured: this.state.is_featured,
            level: this.state.level,
            subject_id: this.state.subject_id
        };
        this.props.updatePost(data);
    };

    fetchTeacherRows() {
        if (this.props.categories instanceof Array) {
            return this.props.categories.map((obj, i) => {
                return (
                    <option value={obj._id} key={obj._id.toString()}>
                        {obj.name}
                    </option>
                );
            });
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
            result: [{
                url: this.props.image,
                name: files[0].name,
                size: files[0].size
            }]
        };
        await uploadHandler(response);
    };

    render() {
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <div className="row">
                            <div className="col-md-10">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Cập nhật bài viết</strong>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">
                                                Tiêu đề
                                            </label>
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
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Chọn danh mục</label>
                                            <div className='col-sm-8'>
                                                <select
                                                    className="custom-select"
                                                    value={this.state.category_id}
                                                    name="category_id"
                                                    onChange={this._onChange}
                                                >
                                                    <option value="">-- Chọn --</option>
                                                    {this.fetchTeacherRows()}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">
                                                Hình ảnh
                                            </label>
                                            <div className="col-sm-4">
                                                <input type="file" onChange={this._onChange} className="form-control-file" name="files" />
                                            </div>
                                            <div className="col-sm-4 d-flex">
                                                <img alt="" src={
                                                    this.props.post
                                                        ?
                                                        this.props.post.image
                                                        : ''
                                                }
                                                    style={{ width: '200px' }} />
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
                                        <div className="form-group row">

                                            <label className="col-sm-4 col-form-label">
                                                External_link
                                            </label>
                                            <div className="col-sm-8">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="external_link"
                                                    onChange={this._onChange}
                                                    value={this.state.external_link}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">
                                                Mô tả ngắn
                                            </label>
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
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">
                                                Nội dung
                                            </label>
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
                                            <div className="col-sm-12">
                                                <label className=" col-form-label">
                                                    Trạng thái
                                                </label>
                                                <div>
                                                    <div className="form-check float-left">
                                                        <input checked={this.state.status === true || this.state.status === "true"} className="form-check-input"
                                                            type="radio" name="status" value="true" id="gridRadios1"
                                                            onChange={this._onChange} defaultValue="option1" />
                                                        <label className="form-check-label" htmlFor="gridRadios1">
                                                            Hiển thị
                                                        </label>
                                                    </div>
                                                    <div className="form-check float-left ml-4">
                                                        <input checked={this.state.status === false || this.state.status === "false"}
                                                            className="form-check-input" type="radio" name="status" value="false" id="gridRadios2" onChange={this._onChange} defaultValue="option2" />
                                                        <label className="form-check-label" htmlFor="gridRadios2">
                                                            Ẩn
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}

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
            </div >
        );
    }
}

function mapStateToProps(state) {
    return {
        post: state.blog.post,
        redirect: true,
        categories: state.blogCategory.blogCategories,
        image: state.question.image,
        classes: state.classData?.classes,
        subjects: state.subject.subjects
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        showPost,
        updatePost,
        listBlogCategory,
        uploadImage,
        listSubject
    }, dispatch);
}

let ContainerEdit = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(BlogEdit),
);

export default ContainerEdit;
