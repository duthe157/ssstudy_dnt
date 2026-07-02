import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { Radio, notification } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listSubject } from "../../redux/subject/action";
import { listClassroom } from "../../redux/classroom/action";
import { createDocument, listDocumentCategory } from "../../redux/document/action";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";
class DocumentCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			name: "",
			alias: "",
			google_name: "",
			google_description: "",
			url: "",
			urlError: "",
			description: "",
			description_file: "",
			status: true,
			docLink: "",
			teacher: "",
			document_type: "FREE",
			subject_id: "",
			classroom_id: "",
			fileData: "",
			docType: "GOOGLE_DRIVE",
			main_category: null,
			sub_category: null
		};
	}

	async componentDidMount() {
		const data = {
			limit: 999
		};
		await this.props.listDocumentCategory(data)
		await this.props.listSubject(data);
		await this.props.listClassroom(data);
	}

	_onChange = async e => {
		const { name, value, type, checked } = e.target;
		const newValue = type === 'checkbox' ? checked : value;
		let newState = { [name]: newValue };

		if (name === 'main_category' || name === 'sub_category') {
			return;
		}

		// Validate URL field
		if (name === 'url') {
			if (newValue === '') {
				newState.urlError = '';
			} else if (!newValue.startsWith('https://')) {
				newState.urlError = 'URL phải bắt đầu bằng https://';
			} else {
				const urlPath = newValue.substring(8); // remove 'https://'
				const validUrlRegex = /^[a-z0-9-/?=.]*$/; // allow lowercase, numbers, -, /, ?, =, .
				if (!validUrlRegex.test(urlPath) || urlPath === '') {
					newState.urlError = 'URL chỉ chứa ký tự viết thường, số, dấu gạch ngang, /, ?, =';
				} else {
					newState.urlError = '';
				}
			}
		}
		
		this.setState(newState);
	};
	_handleEditorDescriptionChange = (content) => {
		this.setState({ description: content });
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

	handleSubmit = async e => {
		e.preventDefault();

		if (!this.state.name || this.state.name.trim() === "") {
			notification.warning({
				message: "Tên tài liệu không được để trống",
			});
			return;
		}
		if (this.state.docType === "GOOGLE_DRIVE" && (!this.state.docLink || this.state.docLink.trim() === "")) {
			notification.warning({
				message: "Link tài liệu không được để trống",
			});
			return;
		}
		if(this.state.url && this.state.url.includes(' ')) {
			notification.warning({
				message: "Đường dẫn không được chứa khoảng trắng",
			});
			return;
		}

		// Validate URL error from _onChange
		if (this.state.url && this.state.urlError) {
			notification.warning({
				message: 'Có lỗi xảy ra',
				description: 'Vui lòng kiểm tra lại đường dẫn.'
			});
			return;
		}
		if (this.state.docType === "PDF" && !this.state.fileData) {
			notification.warning({
				message: "File tài liệu không được để trống",
			});
			return;
		}
		if (!this.state.main_category) {
			notification.warning({
				message: "Danh mục cha không được để trống",
			});
			return;
		}
		if (!this.state.sub_category) {
			notification.warning({
				message: "Danh mục con không được để trống",
			});
			return;
		}
		if (!this.state.teacher || this.state.teacher.trim() === "") {
			notification.warning({
				message: "Tên giáo viên không được để trống",
			});
			return;
		}
		const payload = {
			name: this.state.name,
			alias: this.state.alias,
			google_name: this.state.google_name,
			google_description: this.state.google_description,
			url: this.state.url,
			description: this.state.description,
			description_file: this.state.description_file,
			status: this.state.status,
			doc_link: this.state.docLink,
			doc_type: this.state.docType,
			main_category: this.state.main_category,
			sub_category: this.state.sub_category,
			document_type: this.state.document_type,
			classroom_id: this.state.classroom_id,
			teacher: this.state.teacher
		};

		if (this.state.fileData || this.state.description_file) {
			const formData = new FormData();
			Object.keys(payload).forEach(key => {
				if (key === 'main_category' || key === 'sub_category') {
					formData.append(key, JSON.stringify(payload[key]));
				} else {
					formData.append(key, payload[key]);
				}
			});
			if (this.state.fileData) {
				formData.append("doc_link", this.state.fileData);
			}
			if (this.state.description_file) {
				formData.append("description_file", this.state.description_file);
			}
			await this.props.createDocument(formData);
		} else {
			await this.props.createDocument(payload);
		}

		if (this.props.redirect === true) {
			await this.props.history.push("/document");
		}
	};

	fetchRows() {
		if (this.props.main_categories instanceof Array) {
			return this.props.main_categories.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id}>
						{obj.name}
					</option>
				);
			});
		}
	}
	fetchSubCategoryRows(main_category_id) {
		if (!main_category_id) {
			return null;
		}
		const selectedCategory = this.props.main_categories?.find(cat => cat._id === main_category_id);
		if (selectedCategory?.sub_categories instanceof Array) {
			return selectedCategory.sub_categories.map((obj, i) => {
				return (
					<option value={obj.id} key={obj.id}>
						{obj.name}
					</option>
				);
			});
		}
		return null;
	}

	fetchClassroomRows() {
		if (this.props.classrooms instanceof Array) {
			return this.props.classrooms.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id}>
						{obj.name}
					</option>
				);
			});
		}
	}

	onChangeHandler = event => {
		if (this.state.docType === "PDF") {
			this.setState({
				fileData: event.target.files[0]
			});
		} else {
			this.setState({ docLink: "" });
		}
	};
	onChangeHandler2 = event => {
		this.setState({
			description_file: event.target.files[0]
		});
	};
	stripHtmlTags = (html) => {
		return html.replace(/<[^>]*>/g, '');
	};

	render() {
		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Quản lý tài liệu</h2>
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Thêm tài liệu</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tên tài liệu <span style={{ color: "red" }}>*</span>
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="name"
													onChange={this._onChange}
													value={this.state.name}
												/>
											</div>
											<p style={{ fontSize: '13px', fontStyle: 'italic', marginLeft: '35%', marginTop: '5px', color: '#99A0AC' }}>
												Tên xuất hiện trên trang web của bạn
											</p>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tên search Google
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="google_name"
													onChange={this._onChange}
													value={this.state.google_name}
												/>
											</div>
											<p style={{ fontSize: '13px', fontStyle: 'italic', marginLeft: '35%', marginTop: '5px', color: '#99A0AC' }}>
												Tên tìm kiếm trên Google, nên bao gồm từ khóa chính
											</p>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Mô tả search Google
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="google_description"
													onChange={this._onChange}
													value={this.state.google_description}
												/>
											</div>
											<p style={{ fontSize: '13px', fontStyle: 'italic', marginLeft: '35%', marginTop: '5px', color: '#99A0AC' }}>
												Khuyến nghị viết khoảng 120 - 160 ký tự để hiển thị tốt nhất trên Google
											</p>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Đường dẫn
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className={`form-control ${this.state.urlError ? 'is-invalid' : ''}`}
													name="url"
													onChange={this._onChange}
													value={this.state.url}
													placeholder="https://example-url"
												/>
												{this.state.urlError && (
													<div className="invalid-feedback d-block">
														{this.state.urlError}
													</div>
												)}
											</div>
											<p style={{ fontSize: '13px', fontStyle: 'italic', marginLeft: '35%', marginTop: '5px', color: '#99A0AC' }}>
												Bao gồm ký tự viết thường, số, dấu gạch ngang (-), không dùng tiếng Việt
											</p>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Mô tả
											</label>
											<div className="col-sm-8">
												<input
													type="text"

													className="form-control"
													data-toggle='modal'
													data-target='#description-popup'
													data-toggle-class='fade-down'
													data-toggle-class-target='.animate'
													name="description"
													// onChange={this._onChange}
													value={this.stripHtmlTags(this.state.description)}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Hiển thị <span style={{ color: "red" }}>*</span>
											</label>
											<div className="col-sm-8">
												<div className="switch">
													<input
														type="checkbox"
														name="status"
														onChange={this._onChange}
														checked={this.state.status}
														style={{ opacity: 0, width: 0, height: 0 }}
													/>
													<span
														className="slider round"
														onClick={() => this.setState({ status: !this.state.status })}
													></span>
												</div>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Link <span style={{ color: "red" }}>*</span>
											</label>
											<div className="col-sm-8">
												<Radio.Group
													onChange={this._onChange}
													name="docType"
													value={this.state.docType}
												>
													<Radio
														value={"GOOGLE_DRIVE"}
													>
														Google drive
													</Radio>
													<Radio value={"PDF"}>
														Pdf
													</Radio>
												</Radio.Group>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label"></label>
											<div className="col-sm-8">
												{this.state.docType ===
													"GOOGLE_DRIVE" ? (
													<input
														type="text"
														className="form-control"
														placeholder="Nhập link tài liệu"
														name="docLink"
														onChange={
															this._onChange
														}
														value={
															this.state.docLink
														}
													/>
												) : (
													<div style={{ position: 'relative', display: 'flex', gap: '10px', flexDirection: 'row' }}>
														<input
															type="file"
															className="form-control"
															name="fileData"
															id="fileData"
															onChange={
																this.onChangeHandler
															}
															style={{ display: 'none' }}
														/>
														<label
															htmlFor="fileData"
															style={{
																display: 'inline-flex',
																gap: '5px',
																width: '40%',
																alignItems: 'center',
																padding: '6px 10px',
																border: '2px dashed #ddd',
																borderRadius: '5px',
																cursor: 'pointer',
																backgroundColor: '#f8f9fa',
																transition: 'all 0.2s ease',
																fontSize: '13px',
																color: '#99A0AC',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
																height: '34px',
																boxSizing: 'border-box',
																margin: 0,
																verticalAlign: 'middle'
															}}
															onMouseEnter={(e) => {
																e.currentTarget.style.borderColor = '#007bff';
																e.currentTarget.style.backgroundColor = '#e7f1ff';
															}}
															onMouseLeave={(e) => {
																e.currentTarget.style.borderColor = '#ddd';
																e.currentTarget.style.backgroundColor = '#f8f9fa';
															}}
														>
															<svg
																style={{ width: '14px', height: '14px', flexShrink: 0 }}
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
															</svg>
															<span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
																{this.state.fileData ? this.state.fileData.name : 'Chọn file'}
															</span>
														</label>
														{this.state.fileData && <button className="btn btn-primary" style={{ width: "auto" }}>
															Chuyển bài thi thực tế
														</button>}
													</div>
												)}
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Giáo viên <span style={{ color: "red" }}>*</span>
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="teacher"
													onChange={this._onChange}
													value={this.state.teacher}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Danh mục cha <span style={{ color: "red" }}>*</span>
											</label>
											<div className="col-sm-8">
												<select
													className="custom-select"
													value={
														this.state.main_category?.id || ""
													}
													onChange={(e) => {
														const selectedId = e.target.value;
														if (!selectedId) {
															this.setState({
																main_category: null,
																sub_category: null
															});
															return;
														}
														const selectedCategory = this.props.main_categories?.find(cat => cat._id === selectedId);
														if (selectedCategory) {
															this.setState({
																main_category: {
																	id: selectedCategory._id,
																	name: selectedCategory.name
																},
																sub_category: null
															});
														}
													}}
												>
													<option value="">
														-- Chọn danh mục --
													</option>
													{this.fetchRows()}
												</select>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Danh mục con <span style={{ color: "red" }}>*</span>
											</label>
											<div className="col-sm-8">
												<select
													className="custom-select"
													value={
														this.state.sub_category?.id || ""
													}
													disabled={!this.state.main_category}
													onChange={(e) => {
														const selectedId = e.target.value;
														if (!selectedId || !this.state.main_category) {
															this.setState({
																sub_category: null
															});
															return;
														}
														const parentId = this.state.main_category.id;
														const selectedCategory = this.props.main_categories?.find(cat => cat._id === parentId);
														const selectedSubCategory = selectedCategory?.sub_categories?.find(cat => cat.id === selectedId);
														if (selectedSubCategory) {
															this.setState({
																sub_category: {
																	id: selectedSubCategory.id,
																	name: selectedSubCategory.name
																}
															});
														}
													}}
												>
													<option value="">
														-- Chọn danh mục --
													</option>
													{this.state.main_category?.id && this.fetchSubCategoryRows(this.state.main_category.id)}
												</select>
											</div>
											<p style={{ fontSize: '13px', fontStyle: 'italic', marginLeft: '35%', marginTop: '5px', color: '#99A0AC' }}>
												Danh mục con phụ thuộc vào danh mục cha đã chọn
											</p>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Loại tài liệu <span style={{ color: "red" }}>*</span>
											</label>
											<div className="col-sm-8">
												<span style={{ marginRight: "6px" }}>Pro</span>
												<div className="switch">
													<input
														type="checkbox"
														name="status"
														onChange={this._onChange}
														checked={this.state.document_type === "FREE" ? false : true}
														style={{ opacity: 0, width: 0, height: 0 }}
													/>

													<span
														className="slider round"
														onClick={() => this.setState({ document_type: this.state.document_type === "FREE" ? "PRO" : "FREE" })}
													></span>
												</div>
											</div>
										</div>
										{this.state.document_type === "PRO" && (
											<div className="form-group row">
												<label className="col-sm-4 col-form-label">

												</label>
												<div className="col-sm-8">
													<select
														className="custom-select"
														value={
															this.state.classroom_id
														}
														name="classroom_id"
														onChange={this._onChange}
													>
														<option value="">
															-- Chọn khóa học --
														</option>
														{this.fetchClassroomRows()}
													</select>
												</div>
											</div>
										)}
									</div>
								</div>
								<div className="form-group row">
									<div className="col-sm-12 text-right">
										<button
											className="btn btn-primary mt-2"
											onClick={this.handleSubmit}
										>
											Lưu
										</button>
									</div>
								</div>
								<div
									id='description-popup'
									className='modal fade'
									data-backdrop='true'
									style={{ display: "none" }}
									aria-hidden='true'
								>
									<div
										className='modal-dialog animate fade-down'

										data-class='fade-down'
									>
										<div className='modal-content' style={{ width: "170%" }}>
											<div className='modal-header'>
												<div className='modal-title text-md' style={{ color: "#000" }}>
													Mô tả
												</div>
												<button
													className='close'
													data-dismiss='modal'
												>
													×
												</button>
											</div>
											<div className='modal-body'>
												<div className='modal-title text-md' style={{ color: "#000" }}>
													Mô tả tài liệu
												</div>

												<div style={{ margin: "10px 10px 10px 10px" }}>
													<div className='col-form-label' style={{ color: "#F97304", fontSize: "16px", marginBottom: "5px" }}>
														Nội dung
													</div>
													<SunEditor
														onImageUploadBefore={this.handleImageUploadBefore}
														height={'300px'}
														width={'100%'}
														setContents={this.state.description}
														onChange={this._handleEditorDescriptionChange}
														setOptions={{
															buttonList: baseHelpers.getSunEditorOptions(),
															katex: katex,
														}}
													/>
												</div>
												<div className='modal-title text-md' style={{ borderTop: "1px solid #ddd", paddingTop: "20px", marginTop: "15px", color: "#000" }}>
													Tài liệu
												</div>
												<input
													type="file"
													className="form-control"
													name="description_file"
													id="description_file"
													onChange={
														this.onChangeHandler2
													}
													style={{ display: 'none' }}
												/>
												<label
													htmlFor="description_file"
													style={{
														display: 'flex',
														width: '100%',
														gap: '10px',
														justifyContent: 'center',
														height: '80px',
														textAlign: 'center',
														alignItems: 'center',
														padding: '6px 10px',
														border: '2px dashed #ddd',
														borderRadius: '5px',
														cursor: 'pointer',
														backgroundColor: '#f8f9fa',
														transition: 'all 0.2s ease',
														fontSize: '23px',
														color: '#99A0AC',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
														boxSizing: 'border-box',
														margin: '10px 0 20px 0',
														verticalAlign: 'middle'
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.borderColor = '#007bff';
														e.currentTarget.style.backgroundColor = '#e7f1ff';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.borderColor = '#ddd';
														e.currentTarget.style.backgroundColor = '#f8f9fa';
													}}
												>
													<svg
														style={{ width: '23px', height: '23px', flexShrink: 0 }}
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
													</svg>
													<span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
														{this.state.description_file ? this.state.description_file.name : 'Chọn file'}
													</span>
												</label>
											</div>
											<div className='modal-footer'>
												<button
													type='button'
													className='btn btn-light'
													data-dismiss='modal'
												>
													Quay lại
												</button>
												<button
													type='button'
													onClick={this.handleDelete}
													className='btn btn-danger'
													data-dismiss='modal'
												>
													Xác nhận
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
		documents: state.document.documents,
		subjects: state.subject.subjects,
		main_categories: state.document.main_categories,
		redirect: state.document.redirect,
		classrooms: state.classroom.classrooms
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ listSubject, createDocument, listClassroom, listDocumentCategory }, dispatch);
}

let DocumentCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(DocumentCreate)
);

export default DocumentCreateContainer;
