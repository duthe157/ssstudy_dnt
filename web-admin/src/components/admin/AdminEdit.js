import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showStudent, updateStudent } from "../../redux/student/action";
import { uploadImage } from "../../redux/category/action";

import { Radio, Switch, Select } from "antd";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";
import axios from "axios";
import { listClassroomGroup } from "../../redux/classroomgroup/action";
import { listSubject } from "../../redux/schedule/action";

const CDN = "https://cdn.luyenthitiendat.vn/";
const API_URL = "https://api.luyenthitiendat.vn";

class AdminEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			fullname: "",
			email: "",
			description: "",
			content: "",
			phone: "",
			user_group: "",
			password: "",
			total_classroom: 0,
			total_student: 0,
			status: false,
			is_show_profile: true,
			avatar_base64: "",
			link_fb: "",
			profile_pic_base64: "",
			category_type: [],
			subject: [],
			is_featured: false,
			homepage_image_base64: "",
			education_philosophy_source: "Youtube",
			education_philosophy_url: "",
			featured_stats_box: {
				box1_img: "",
				box1_num: "",
				box1_text: "",
				box2_img: "",
				box2_num: "",
				box2_text: "",
				box3_img: "",
				box3_num: "",
				box3_text: "",
				box4_num: "",
				box4_text: "",
			},
			featured_text_box: {
				box1_img: "",
				box1_text: "",
				box2_img: "",
				box2_text: "",
				box3_img: "",
				box3_text: "",
			},
			homePagePreview: "",
			avtPreview: "",
			homepageImagePreview: "",
			imgStatsBox1Preview: "",
			imgStatsBox2Preview: "",
			imgStatsBox3Preview: "",
			imgStatsBox4Preview: "",
			imgTextBoxPreview1: "",
			imgTextBoxPreview2: "",
			imgTextBoxPreview3: "",
			subjectList: [],
			classroomList: [],
			hasUncategorized: false
		};
	}

	async componentDidMount() {
		await this.fetchSubjectList();
		await this.fetchClassroomList();
		await this.props.showStudent(this.props.match.params.id);

		if (this.props.student) {
			var {
				fullname,
				email,
				phone,
				total_student,
				total_classroom,
				user_group,
				description,
				content,
				link_fb,
				featured_stats_box,
				featured_text_box,
				avatar,
				profile_pic,
				is_show_profile,
				category_type,
				subject,
				is_featured,
				homepage_image,
				education_philosophy_source,
				education_philosophy_url
			} = this.props.student;

			await this.setState({
				fullname,
				email,
				phone,
				total_student,
				total_classroom,
				content,
				description,
				user_group,
				link_fb,
				is_show_profile,
				category_type: category_type || [],
				subject: subject || [],
				is_featured: is_featured || false,
				education_philosophy_source: education_philosophy_source || "Youtube",
				education_philosophy_url: education_philosophy_url || "",
				featured_stats_box: featured_stats_box ? featured_stats_box : this.state.featured_stats_box,
				featured_text_box: featured_text_box ? featured_text_box : this.state.featured_text_box,
				avtPreview: avatar ? CDN + avatar : "",
				homePagePreview: profile_pic ? CDN + profile_pic : "",
				homepageImagePreview: homepage_image ? CDN + homepage_image : "",
				imgStatsBox1Preview: featured_stats_box && featured_stats_box.box1_img ? CDN + featured_stats_box.box1_img : "",
				imgStatsBox2Preview: featured_stats_box && featured_stats_box.box2_img ? CDN + featured_stats_box.box2_img : "",
				imgStatsBox3Preview: featured_stats_box && featured_stats_box.box3_img ? CDN + featured_stats_box.box3_img : "",
				imgStatsBox4Preview: featured_stats_box && featured_stats_box.box4_img ? CDN + featured_stats_box.box4_img : "",
				imgTextBoxPreview1: featured_text_box && featured_text_box.box1_img ? CDN + featured_text_box.box1_img : "",
				imgTextBoxPreview2: featured_text_box && featured_text_box.box2_img ? CDN + featured_text_box.box2_img : "",
				imgTextBoxPreview3: featured_text_box && featured_text_box.box3_img ? CDN + featured_text_box.box3_img : "",
			});
		}
	}

	fetchSubjectList = async () => {
		try {
			const response = await this.props.listSubject({});
			if (response.data && response.data.data && response.data.data.records) {
				this.setState({
					subjectList: response.data.data.records
				});
			}
		} catch (error) {
			console.error("Error fetching subject list:", error);
		}
	}

	fetchClassroomList = async () => {
		try {
			const response = await this.props.listClassroomGroup({});
			if (response.data && response.data.data && response.data.data.records) {
				this.setState({
					classroomList: response.data.data.records
				});
			}
		} catch (error) {
			console.error("Error fetching classroom list:", error);
		}
	}

	_onChange = async (e) => {
		var name = e.target.name;
		let value = e.target.value;
		let checked = e.target.checked;
		let avtPreview = "";
		let homePagePreview = "";
		let homepageImagePreview = "";

		if (name === "profile_pic_base64") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					homePagePreview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				[name]: value,
				homePagePreview: homePagePreview
			});
		} else if (name === "avatar_base64") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					avtPreview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				[name]: value,
				avtPreview: avtPreview
			});
		} else if (name === "homepage_image_base64") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					homepageImagePreview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				[name]: value,
				homepageImagePreview: homepageImagePreview
			});
		} else {
			this.setState({
				[name]: value,
			});
		}
	};

	_onChangeMultiSelect = (value, name) => {
		if (name === 'category_type') {
			const UNCATEGORIZED_ID = 'uncategorized'; // ID đặc biệt cho "Không phân loại"

			// Nếu chọn "Không phân loại"
			if (value.includes(UNCATEGORIZED_ID)) {
				this.setState({
					[name]: [UNCATEGORIZED_ID],
					hasUncategorized: true
				});
			}
			// Nếu đang có "Không phân loại" và chọn thêm option khác
			else if (this.state.hasUncategorized && value.length > 0) {
				this.setState({
					[name]: value,
					hasUncategorized: false
				});
			}
			// Trường hợp bình thường
			else {
				this.setState({
					[name]: value,
					hasUncategorized: false
				});
			}
		} else {
			this.setState({
				[name]: value
			});
		}
	};

	_onChangeFeaturedBox = async (e) => {
		var name = e.target.name;
		let value = e.target.value;
		let box1Preview = "";
		let box2Preview = "";
		let box3Preview = "";
		let box4Preview = "";

		if (name === "box1_img") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					box1Preview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				},
				imgStatsBox1Preview: box1Preview
			});
		} else if (name === "box2_img") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					box2Preview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				},
				imgStatsBox2Preview: box2Preview
			});
		} else if (name === "box3_img") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					box3Preview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				},
				imgStatsBox3Preview: box3Preview
			});
		} else if (name === "box4_img") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					box4Preview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				},
				imgStatsBox4Preview: box4Preview
			});
		} else {
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				}
			});
		}
	};

	_onChangeFeaturedText = async (e) => {
		var name = e.target.name;
		let value = e.target.value;
		let box1Preview = "";
		let box2Preview = "";
		let box3Preview = "";

		if (name === "box1_img") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					box1Preview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				featured_text_box: {
					...this.state.featured_text_box,
					[name]: value
				},
				imgTextBoxPreview1: box1Preview
			});
		} else if (name === "box2_img") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					box2Preview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				featured_text_box: {
					...this.state.featured_text_box,
					[name]: value
				},
				imgTextBoxPreview2: box2Preview
			});
		} else if (name === "box3_img") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					box3Preview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			this.setState({
				featured_text_box: {
					...this.state.featured_text_box,
					[name]: value
				},
				imgTextBoxPreview3: box3Preview
			});
		} else {
			this.setState({
				featured_text_box: {
					...this.state.featured_text_box,
					[name]: value
				}
			});
		}
	};

	_handleEditorContentChange = (content) => {
		this.setState({ content: content });
	};

	_handleEditorDescriptionChange = (content) => {
		this.setState({ description: content });
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

	handleSubmit = async (e) => {
		e.preventDefault();
		let { box1_num, box2_num, box3_num, box4_num } = this.state.featured_stats_box;
		const data = {
			id: this.props.match.params.id,
			fullname: this.state.fullname,
			email: this.state.email,
			phone: this.state.phone,
			user_group: this.state.user_group,
			total_classroom: this.state.total_classroom,
			total_student: this.state.total_student,
			description: this.state.description,
			content: this.state.content,
			is_show_profile: this.state.is_show_profile,
			avatar_base64: this.state.avatar_base64,
			link_fb: this.state.link_fb,
			profile_pic_base64: this.state.profile_pic_base64,
			category_type: this.state.category_type,
			subject: this.state.subject,
			is_featured: this.state.is_featured,
			homepage_image_base64: this.state.homepage_image_base64,
			education_philosophy_source: this.state.education_philosophy_source,
			education_philosophy_url: this.state.education_philosophy_url,
			featured_stats_box: {
				...this.state.featured_stats_box,
				box1_num: parseInt(box1_num) || 0,
				box2_num: parseInt(box2_num) || 0,
				box3_num: parseInt(box3_num) || 0,
				box4_num: parseInt(box4_num) || 0,
			},
			featured_text_box: this.state.featured_text_box
		};

		await this.props.updateStudent(data);
	};

	handleUploaImgHomePage = () => {
		document.getElementById("input-upload-image-homepage").click();
	}

	remoImgHomePage = () => {
		document.getElementById("input-upload-image-homepage").value = "";
		this.setState({
			profile_pic_base64: "",
			homePagePreview: ""
		});
	}

	handleUploadAvatar = () => {
		document.getElementById("input-upload-avatar").click();
	}

	remoAvatar = () => {
		document.getElementById("input-upload-avatar").value = "";
		this.setState({
			avatar_base64: "",
			avtPreview: ""
		});
	}

	handleUploadHomepageImage = () => {
		document.getElementById("input-upload-homepage-image").click();
	}

	remoHomepageImage = () => {
		document.getElementById("input-upload-homepage-image").value = "";
		this.setState({
			homepage_image_base64: "",
			homepageImagePreview: ""
		});
	}

	handleUploadImageBox1 = () => {
		document.getElementById("input-img-box-1").click();
	}

	remoImgBox1 = () => {
		document.getElementById("input-img-box-1").value = "";
		this.setState({
			featured_stats_box: {
				...this.state.featured_stats_box,
				box1_img: ""
			},
			imgStatsBox1Preview: ""
		});
	}

	handleUploadImageBox2 = () => {
		document.getElementById("input-img-box-2").click();
	}

	remoImgBox2 = () => {
		document.getElementById("input-img-box-2").value = "";
		this.setState({
			featured_stats_box: {
				...this.state.featured_stats_box,
				box2_img: ""
			},
			imgStatsBox2Preview: ""
		});
	}

	handleUploadImageBox3 = () => {
		document.getElementById("input-img-box-3").click();
	}

	remoImgBox3 = () => {
		document.getElementById("input-img-box-3").value = "";
		this.setState({
			featured_stats_box: {
				...this.state.featured_stats_box,
				box3_img: ""
			},
			imgStatsBox3Preview: ""
		});
	}

	handleUploadImageBox4 = () => {
		document.getElementById("input-img-box-4").click();
	}

	remoImgBox4 = () => {
		document.getElementById("input-img-box-4").value = "";
		this.setState({
			featured_stats_box: {
				...this.state.featured_stats_box,
				box4_img: ""
			},
			imgStatsBox4Preview: ""
		});
	}

	handleUploadImageTextBox1 = () => {
		document.getElementById("input-img-text-box-1").click();
	}

	remoImgTextBox1 = () => {
		document.getElementById("input-img-text-box-1").value = "";
		this.setState({
			featured_text_box: {
				...this.state.featured_text_box,
				box1_img: ""
			},
			imgTextBoxPreview1: ""
		});
	}

	handleUploadImageTextBox2 = () => {
		document.getElementById("input-img-text-box-2").click();
	}

	remoImgTextBox2 = () => {
		document.getElementById("input-img-text-box-2").value = "";
		this.setState({
			featured_text_box: {
				...this.state.featured_text_box,
				box2_img: ""
			},
			imgTextBoxPreview2: ""
		});
	}

	handleUploadImageTextBox3 = () => {
		document.getElementById("input-img-text-box-3").click();
	}

	remoImgTextBox3 = () => {
		document.getElementById("input-img-text-box-3").value = "";
		this.setState({
			featured_text_box: {
				...this.state.featured_text_box,
				box3_img: ""
			},
			imgTextBoxPreview3: ""
		});
	}

	handleFeaturedToggle = (checked) => {
		this.setState({
			is_featured: checked
		});
	}

	render() {
		let admin = "ADMIN";
		if (this.state.user_group === admin) {
			admin = "selected";
		}

		const { featured_stats_box, featured_text_box } = this.state;

		return (
			<div>
				<div className="page-content page-container page-create-admin" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Quản trị viên</h2>
						<div className="block-item-content">
							<h3 className="title-block">Ảnh và thông tin</h3>
							<div className="content">
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="profile_pic_base64"
									id="input-upload-image-homepage"
								/>
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="avatar_base64"
									id="input-upload-avatar"
								/>
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="homepage_image_base64"
									id="input-upload-homepage-image"
								/>
								<div className="block-image-avatar" style={{ flexWrap: 'wrap' }}>
									<div className="img-home-page item-block-image block-image">
										{
											!this.state.homePagePreview
												?
												<button type="button" onClick={this.handleUploaImgHomePage}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span className="text-sm">Ảnh trang chủ</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.homePagePreview}
														alt="your image"
														className="image"
													/>
													<div className="middle">
														<div className="text" onClick={this.remoImgHomePage}>Hủy chọn</div>
													</div>
												</div>
										}
									</div>
									<div className="image-avatar item-block-image block-image">
										{
											!this.state.avtPreview
												?
												<button type="button" onClick={this.handleUploadAvatar}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span className="text-sm" >Ảnh đại diện</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.avtPreview}
														alt="your image"
														className="image"
													/>
													<div className="middle">
														<div className="text" onClick={this.remoAvatar}>Hủy chọn</div>
													</div>
												</div>
										}
									</div>
									{/* {this.state.user_group === "TEACHER" && (
										<div className="image-homepage-featured item-block-image block-image mt-2">
											{
												!this.state.homepageImagePreview
													?
													<button type="button" onClick={this.handleUploadHomepageImage}>
														<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
														<span className="text-sm">Ảnh nổi bật trang chủ</span>
													</button>
													:
													<div className="block-image-overlay">
														<img
															id="output"
															src={this.state.homepageImagePreview}
															alt="homepage featured image"
															className="image"
														/>
														<div className="middle">
															<div className="text" onClick={this.remoHomepageImage}>Hủy chọn</div>
														</div>
													</div>
											}
										</div>
									)} */}
								</div>

								<div className="block-content">
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Tên quản trị viên</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="fullname"
													onChange={this._onChange}
													value={this.state.fullname}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Số điện thoại</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="phone"
													onChange={this._onChange}
													value={this.state.phone}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Email</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="email"
													onChange={this._onChange}
													value={this.state.email}
												/>
											</div>
										</div>
									</div>

									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Nhóm</label>
											<select
												className="custom-select"
												value={this.state.user_group}
												name="user_group"
												onChange={this._onChange}
											>
												<option value="">-- Chọn nhóm --</option>
												<option value="ADMIN">ADMIN</option>
												<option value="MANAGER">Quản lý</option>
												<option value="TEACHER">Giáo viên</option>
												<option value="SUPPORTER">Trợ giảng</option>
												<option value="ACCOUNTANT">Thu ngân</option>
												<option value="SALE_MANAGER">Trưởng phòng kinh doanh</option>
												<option value="SALE_STAFF">Nhân viên kinh doanh</option>
												<option value="MEDIA">Truyền Thông</option>
												<option value="TRAINING_STAFF">Nhân viên đào tạo</option>
											</select>
										</div>
										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Tổng số lớp</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="total_classroom"
													onChange={this._onChange}
													value={this.state.total_classroom}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Tổng số học sinh</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="total_student"
													onChange={this._onChange}
													value={this.state.total_student}
												/>
											</div>
										</div>
										<div className="form-group" style={{ width: "30%" }}>
											<label className="text-form-label">Hiển thị profile</label>
											<div>
												<Radio.Group
													onChange={this._onChange}
													name="is_show_profile"
													value={this.state.is_show_profile}
												>
													<Radio value={true}>Hiển thị</Radio>
													<Radio value={false}>Ẩn</Radio>
												</Radio.Group>
											</div>
										</div>
									</div>

									{this.state.user_group === "TEACHER" && (
										<div className="item-input-text">
											<div className="form-group mr-16" style={{ width: "33%" }}>
												<label className="text-form-label">Thể loại dạy học</label>
												<Select
													mode="multiple"
													placeholder="Chọn thể loại"
													value={this.state.category_type}
													onChange={(value) => this._onChangeMultiSelect(value, 'category_type')}
													style={{ width: '100%' }}
													maxTagCount="responsive"
												>
													{this.props.classroomList.map((classroom) => (
														<Select.Option key={classroom._id} value={classroom._id}>
															{classroom.name}
														</Select.Option>
													))}

													<Select.Option key="uncategorized" value="uncategorized">
														Không phân loại
													</Select.Option>
												</Select>
											</div>
											<div className="form-group mr-16" style={{ width: "33%" }}>
												<label className="text-form-label">Môn học</label>
												<Select
													mode="multiple"
													placeholder="Chọn môn học"
													value={this.state.subject}
													onChange={(value) => this._onChangeMultiSelect(value, 'subject')}
													style={{ width: '100%' }}
													maxTagCount="responsive"
												>
													{this.props.subjectList.map((subject) => (
														<Select.Option key={subject._id} value={subject._id}>
															{subject.name}
														</Select.Option>
													))}
												</Select>
											</div>
											<div className="form-group" style={{ width: "33%" }}>
												<label className="text-form-label">Nổi bật</label>
												<div>
													<Switch
														checked={this.state.is_featured === true || this.state.is_featured === "true"}
														onChange={this.handleFeaturedToggle}
														style={{
															backgroundColor: (this.state.is_featured === true || this.state.is_featured === "true") ? '#ff9800' : '#ccc',
														}}
													/>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{this.state.user_group === "TEACHER" && (
							<div className="block-item-content">
								<h3 className="title-block">Triết lý giáo dục</h3>
								<div className="">
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "30%" }}>
											<label className="text-form-label">Nguồn</label>
											<select
												className="custom-select"
												value={this.state.education_philosophy_source}
												name="education_philosophy_source"
												onChange={this._onChange}
											>
												<option value="Youtube">Youtube</option>
											</select>
										</div>
										<div className="form-group" style={{ width: "70%" }}>
											<label className="text-form-label">Liên kết</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="education_philosophy_url"
													onChange={this._onChange}
													value={this.state.education_philosophy_url}
													placeholder="Vui lòng nhập URL"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{
							this.state.user_group == "TEACHER" &&
							<div className="block-item-content">
								<h3 className="title-block">Thông tin nổi bật</h3>

								<input
									onChange={this._onChangeFeaturedBox}
									type="file"
									className="form-control-file d-none"
									name="box1_img"
									id="input-img-box-1"
								/>
								<input
									onChange={this._onChangeFeaturedBox}
									type="file"
									className="form-control-file d-none"
									name="box2_img"
									id="input-img-box-2"
								/>
								<input
									onChange={this._onChangeFeaturedBox}
									type="file"
									className="form-control-file d-none"
									name="box3_img"
									id="input-img-box-3"
								/>
								<input
									onChange={this._onChangeFeaturedBox}
									type="file"
									className="form-control-file d-none"
									name="box4_img"
									id="input-img-box-4"
								/>

								<div className="block-list-feature-box">
									<div className="item-feature-box">
										<div className="block-avatar block-image">
											{
												!featured_stats_box.box1_img || featured_stats_box.box1_img.length == 0
													?
													<button type="button" onClick={this.handleUploadImageBox1}>
														<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
														<span>Thêm ảnh</span>
													</button>
													:
													<div className="block-image-overlay">
														<img
															id="output"
															src={this.state.imgStatsBox1Preview}
															alt="your image"
															className="image"
														/>
														<div className="middle">
															<div className="text" onClick={this.remoImgBox1}>Xóa</div>
														</div>
													</div>
											}
										</div>
										<div className="form-group">
											<label className="text-form-label">Số</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="box1_num"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box.box1_num}
												/>
											</div>
										</div>
										<div className="form-group">
											<label className="text-form-label">Tiêu đề</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="box1_text"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box.box1_text}
												/>
											</div>
										</div>
									</div>
									<div className="item-feature-box">
										<div className="block-avatar block-image">
											{
												!featured_stats_box.box2_img || featured_stats_box.box2_img.length == 0
													?
													<button type="button" onClick={this.handleUploadImageBox2}>
														<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
														<span>Thêm ảnh</span>
													</button>
													:
													<div className="block-image-overlay">
														<img
															id="output"
															src={this.state.imgStatsBox2Preview}
															alt="your image"
															className="image"
														/>
														<div className="middle">
															<div className="text" onClick={this.remoImgBox2}>Xóa</div>
														</div>
													</div>
											}
										</div>
										<div className="form-group">
											<label className="text-form-label">Số</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="box2_num"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box.box2_num}
												/>
											</div>
										</div>
										<div className="form-group">
											<label className="text-form-label">Tiêu đề</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="box2_text"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box.box2_text}
												/>
											</div>
										</div>
									</div>
									<div className="item-feature-box">
										<div className="block-avatar block-image">
											{
												!featured_stats_box.box3_img || featured_stats_box.box3_img.length == 0
													?
													<button type="button" onClick={this.handleUploadImageBox3}>
														<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
														<span>Thêm ảnh</span>
													</button>
													:
													<div className="block-image-overlay">
														<img
															id="output"
															src={this.state.imgStatsBox3Preview}
															alt="your image"
															className="image"
														/>
														<div className="middle">
															<div className="text" onClick={this.remoImgBox3}>Xóa</div>
														</div>
													</div>
											}
										</div>
										<div className="form-group">
											<label className="text-form-label">Số</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="box3_num"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box.box3_num}
												/>
											</div>
										</div>
										<div className="form-group">
											<label className="text-form-label">Tiêu đề</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="box3_text"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box.box3_text}
												/>
											</div>
										</div>
									</div>
									<div className="item-feature-box">
										<div className="block-avatar block-image">
											{
												!featured_stats_box.box4_img || featured_stats_box.box4_img.length == 0
													?
													<button type="button" onClick={this.handleUploadImageBox4}>
														<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
														<span>Thêm ảnh</span>
													</button>
													:
													<div className="block-image-overlay">
														<img
															id="output"
															src={this.state.imgStatsBox4Preview}
															alt="your image"
															className="image"
														/>
														<div className="middle">
															<div className="text" onClick={this.remoImgBox4}>Xóa</div>
														</div>
													</div>
											}
										</div>
										<div className="form-group">
											<label className="text-form-label">Số</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="box4_num"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box.box4_num}
												/>
											</div>
										</div>
										<div className="form-group">
											<label className="text-form-label">Tiêu đề</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="box4_text"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box.box4_text}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						}

						{
							this.state.user_group == "TEACHER" &&
							<div className="block-item-content">
								<h3 className="title-block">Con số ấn tượng</h3>

								<input
									onChange={this._onChangeFeaturedText}
									type="file"
									className="form-control-file d-none"
									name="box1_img"
									id="input-img-text-box-1"
								/>
								<input
									onChange={this._onChangeFeaturedText}
									type="file"
									className="form-control-file d-none"
									name="box2_img"
									id="input-img-text-box-2"
								/>
								<input
									onChange={this._onChangeFeaturedText}
									type="file"
									className="form-control-file d-none"
									name="box3_img"
									id="input-img-text-box-3"
								/>

								<div className="block-list-feature-box grid-column-3">
									<div className="item-feature-box">
										<div className="block-avatar block-image">
											{
												!featured_text_box.box1_img || featured_text_box.box1_img.length == 0
													?
													<button type="button" onClick={this.handleUploadImageTextBox1}>
														<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
														<span>Thêm ảnh</span>
													</button>
													:
													<div className="block-image-overlay">
														<img
															id="output"
															src={this.state.imgTextBoxPreview1}
															alt="your image"
															className="image"
														/>
														<div className="middle">
															<div className="text" onClick={this.remoImgTextBox1}>Xóa</div>
														</div>
													</div>
											}
										</div>
										<div className="form-group">
											<label className="text-form-label">Nội dung</label>
											<div>
												<textarea
													type="text"
													className="form-control"
													name="box1_text"
													onChange={this._onChangeFeaturedText}
													value={this.state.featured_text_box.box1_text}
												>
												</textarea>
											</div>
										</div>
									</div>
									<div className="item-feature-box">
										<div className="block-avatar block-image">
											{
												!featured_text_box.box2_img || featured_text_box.box2_img.length == 0
													?
													<button type="button" onClick={this.handleUploadImageTextBox2}>
														<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
														<span>Thêm ảnh</span>
													</button>
													:
													<div className="block-image-overlay">
														<img
															id="output"
															src={this.state.imgTextBoxPreview2}
															alt="your image"
															className="image"
														/>
														<div className="middle">
															<div className="text" onClick={this.remoImgTextBox2}>Xóa</div>
														</div>
													</div>
											}
										</div>
										<div className="form-group">
											<label className="text-form-label">Nội dung</label>
											<div>
												<textarea
													type="text"
													className="form-control"
													name="box2_text"
													onChange={this._onChangeFeaturedText}
													value={this.state.featured_text_box.box2_text}
												>
												</textarea>
											</div>
										</div>
									</div>
									<div className="item-feature-box">
										<div className="block-avatar block-image">
											{
												!featured_text_box.box3_img || featured_text_box.box3_img.length == 0
													?
													<button type="button" onClick={this.handleUploadImageTextBox3}>
														<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
														<span>Thêm ảnh</span>
													</button>
													:
													<div className="block-image-overlay">
														<img
															id="output"
															src={this.state.imgTextBoxPreview3}
															alt="your image"
															className="image"
														/>
														<div className="middle">
															<div className="text" onClick={this.remoImgTextBox3}>Xóa</div>
														</div>
													</div>
											}
										</div>
										<div className="form-group">
											<label className="text-form-label">Nội dung</label>
											<div>
												<textarea
													type="text"
													className="form-control"
													name="box3_text"
													onChange={this._onChangeFeaturedText}
													value={this.state.featured_text_box.box3_text}
												>
												</textarea>
											</div>
										</div>
									</div>
								</div>
							</div>
						}

						<div className="block-item-content">
							<h3 className="title-block">Mô tả ngắn (Hiển thị khi hover tại trang chủ)</h3>
							<div className="content" style={{ display: "block" }}>
								<SunEditor
									onImageUploadBefore={this.handleImageUploadBefore}
									height={'400px'}
									setContents={this.state.description}
									onChange={this._handleEditorDescriptionChange}
									setOptions={{
										buttonList: baseHelpers.getSunEditorOptions(),
										katex: katex,
									}}
								/>
							</div>
						</div>

						<div className="block-item-content">
							<h3 className="title-block">Mô tả tại trang chi tiết giáo viên</h3>
							<div className="content" style={{ display: "block" }}>
								<SunEditor
									onImageUploadBefore={this.handleImageUploadBefore}
									height={'400px'}
									setContents={this.state.content}
									onChange={this._handleEditorContentChange}
									setOptions={{
										buttonList: baseHelpers.getSunEditorOptions(),
										katex: katex,
									}}
								/>
							</div>
						</div>

						<div className="block-action-footer">
							<button type="button" className="btn-cancel" onClick={() => this.props.history.push("/admin")}>
								<img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
								Hủy
							</button>
							<button type="button" className="btn-submit ml-16" onClick={(e) => this.handleSubmit(e)}>
								Cập nhật
								<img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		token: state.auth.token,
		student: state.student.student,
		redirect: state.student.redirect,
		image: state.question.image,
		subjectList: state.subject.subjects.filter(subject => subject.status === true) || [],
        classroomList: state.classroomGroup.classroomGroups.filter(classroom => classroom.status === true) || [],
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ showStudent, updateStudent, uploadImage, listClassroomGroup, listSubject },
		dispatch
	);
}

let AdminEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(AdminEdit)
);

export default AdminEditContainer;