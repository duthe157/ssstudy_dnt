import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createAdmin } from "../../redux/student/action";
import { uploadImage } from "../../redux/category/action";
import { Radio } from "antd";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";


class AdminCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			fullname: "",
			email: "",
			phone: "",
			user_group: "",
			password: "",
			description: "",
			total_classroom: 0,
			total_student: 0,
			content: "",
			is_show_profile: true,
			avatar_base64: "",
			link_fb: "",
			profile_pic_base64: "",
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
			imgStatsBox1Preview: "",
			imgStatsBox2Preview: "",
			imgStatsBox3Preview: "",
			imgStatsBox4Preview: "",
			imgTextBoxPreview1: "",
			imgTextBoxPreview2: "",
			imgTextBoxPreview3: "",

		};
	}

	_onChange = async (e) => {
		var name = e.target.name;
		let value = e.target.value;
		let checked = e.target.checked;
		let avtPreview = "";
		let homePagePreview = "";
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
			value = value;
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
			value = value;
			this.setState({
				[name]: value,
				avtPreview: avtPreview
			});
		} else {
			this.setState({
				[name]: value,
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
			value = value;
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				},
				imgStatsBox1Preview: box1Preview
			})
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
			value = value;
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				},
				imgStatsBox2Preview: box2Preview
			})
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
			value = value;
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				},
				imgStatsBox3Preview: box3Preview
			})
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
			value = value;
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				},
				imgStatsBox4Preview: box4Preview
			})
		} else {
			this.setState({
				featured_stats_box: {
					...this.state.featured_stats_box,
					[name]: value
				}
			})
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
			value = value;
			this.setState({
				featured_text_box: {
					...this.state.featured_text_box,
					[name]: value
				},
				imgTextBoxPreview1: box1Preview
			})
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
			value = value;
			this.setState({
				featured_text_box: {
					...this.state.featured_text_box,
					[name]: value
				},
				imgTextBoxPreview2: box2Preview
			})
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
			value = value;
			this.setState({
				featured_text_box: {
					...this.state.featured_text_box,
					[name]: value
				},
				imgTextBoxPreview3: box3Preview
			})
		} else {
			this.setState({
				featured_text_box: {
					...this.state.featured_text_box,
					[name]: value
				}
			})
		}
	};

	handleSubmit = async (e) => {
		e.preventDefault();
		let { box1_num, box2_num, box3_num, box4_num } = this.state.featured_stats_box;
		const data = {
			fullname: this.state.fullname,
			email: this.state.email,
			phone: this.state.phone,
			user_group: this.state.user_group,
			password: this.state.password,
			total_classroom: this.state.total_classroom,
			total_student: this.state.total_student,
			avatar_base64: this.state.avatar_base64,
			is_show_profile: this.state.is_show_profile,
			link_fb: this.state.link_fb,
			profile_pic_base64: this.state.profile_pic_base64,
			featured_stats_box: {
				...this.state.featured_stats_box,
				box1_num: parseInt(box1_num),
				box2_num: parseInt(box2_num),
				box3_num: parseInt(box3_num),
				box4_num: parseInt(box4_num),
			},
			featured_text_box: this.state.featured_text_box
		};
		data.description = this.state.description.toString();
		data.content = this.state.content.toString();
		await this.props.createAdmin(data);
		if (this.props.redirect === true) {
			await this.props.history.push("/admin");
		}
	};

	handleSave = async (e) => {
		e.preventDefault();
		let { box1_num, box2_num, box3_num, box4_num } = this.state.featured_stats_box;

		const data = {
			fullname: this.state.fullname,
			email: this.state.email,
			phone: this.state.phone,
			user_group: this.state.user_group,
			password: this.state.password,
			total_classroom: this.state.total_classroom,
			total_student: this.state.total_student,
			is_show_profile: this.state.is_show_profile,
			avatar_base64: this.state.avatar_base64,
			link_fb: this.state.link_fb,
			profile_pic_base64: this.state.profile_pic_base64,
			featured_stats_box: {
				...this.state.featured_stats_box,
				box1_num: parseInt(box1_num),
				box2_num: parseInt(box2_num),
				box3_num: parseInt(box3_num),
				box4_num: parseInt(box4_num),
			},
			featured_text_box: this.state.featured_text_box
		};
		data.description = this.state.description.toString();
		data.content = this.state.content.toString();
		await this.props.createAdmin(data);
		if (this.props.redirect === true) {
			await this.props.history.push("/admin");
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

	handleUploaImgHomePage = () => {
		document.getElementById("input-upload-image-homepage").click();
	}

	remoImgHomePage = () => {
		document.getElementById("input-upload-image-homepage").value = "";
		this.setState({
			profile_pic_base64: "",
			homePagePreview: ""
		})
	}

	handleUploadAvatar = () => {
		document.getElementById("input-upload-avatar").click();
	}

	remoAvatar = () => {
		document.getElementById("input-upload-avatar").value = "";
		this.setState({
			avatar_base64: "",
			avtPreview: ""
		})
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
		})
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
		})
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
		})
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
		})
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
		})
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
		})
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
		})
	}



	render() {
		let { featured_stats_box, featured_text_box } = this.state;
		return (
			<div>
				<div className="page-content page-container page-create-admin" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Thêm giáo viên</h2>
						
						<div className="block-item-content">
							<h3 className="title-block">Ảnh và thông tin</h3>
							<div className="content">
								{/* ảnh trang chủ */}
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="profile_pic_base64"
									id="input-upload-image-homepage"
								/>

								{/* ảnh đại diện */}
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="avatar_base64"
									id="input-upload-avatar"
								/>
								<div className="block-image-avatar">
									<div className="img-home-page item-block-image block-image">
										{
											!this.state.profile_pic_base64 || this.state.profile_pic_base64.length == 0
												?
												<button type="button" onClick={this.handleUploaImgHomePage}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Ảnh trang chủ</span>
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
											!this.state.avatar_base64 || this.state.avatar_base64.length == 0
												?
												<button type="button" onClick={this.handleUploadAvatar}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Ảnh đại diện</span>
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
										<div className="form-group mr-16" style={{ width: "33%" }} >
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
										<div className="form-group mr-16" style={{ width: "20%" }} >
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
										<div className="form-group mr-16" style={{ width: "20%" }} >
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
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "50%" }}>
											<label className="text-form-label">Mật khẩu</label>
											<div>
												<input
													type="password"
													className="form-control"
													name="password"
													onChange={this._onChange}
													value={this.state.password}
												/>
											</div>
										</div>
										<div className="form-group ml-16" style={{ width: "50%" }}>
											<label className="text-form-label">Link facebook</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="link_fb"
													onChange={this._onChange}
													value={this.state.link_fb}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						{
							this.state.user_group == "TEACHER"
							&&
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
							this.state.user_group == "TEACHER"
							&&
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
							<h3 className="title-block">Mô tả ngắn</h3>
							<div className="content" style={{ display: "block" }}>
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

						<div className="block-item-content">
							<h3 className="title-block">Nội dung chi tiết</h3>
							<div className="content" style={{ display: "block" }}>
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

						<div className="block-action-footer">
							<button type="button" className="btn-cancel" onClick={() => this.props.history.push("/admin")}>
								<img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
								Hủy
							</button>
							<button type="button" className="btn-submit ml-16" onClick={(e) => this.handleSubmit(e)}>
								Tạo mới
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
		redirect: state.student.redirect,
		image: state.question.image,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ createAdmin, uploadImage }, dispatch);
}

let ClassCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(AdminCreate)
);

export default ClassCreateContainer;
