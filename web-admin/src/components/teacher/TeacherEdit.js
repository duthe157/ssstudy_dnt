import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showStudent, updateStudent } from "../../redux/student/action";
import { uploadImage } from "../../redux/category/action";

import { Radio } from "antd";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../helpers/BaseHelpers";


const CDN = "https://cdn.luyenthitiendat.vn/";

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
			is_show_profile: false,
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

	async componentDidMount() {
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
				profile_pic
			} = this.props.student;
			this.setState({
				fullname,
				email,
				phone,
				total_student,
				total_classroom,
				content,
				description,
				user_group,
				link_fb,
				featured_stats_box: featured_stats_box ? featured_stats_box : this.state.featured_stats_box,
				featured_text_box: featured_text_box ? featured_text_box : this.state.featured_text_box,
				avtPreview: avatar ? CDN + avatar : "",
				homePagePreview: profile_pic ? CDN + profile_pic : ""
			});
		}
	}

	// _onChange = async (e) => {
	// 	let name = e.target.name;
	// 	let value = e.target.value;
	// 	if (name === "avatar_base64" || name === "profile_pic_base64") {
	// 		value = await new Promise((resolve, reject) => {
	// 			const reader = new FileReader();
	// 			reader.readAsDataURL(e.target.files[0]);
	// 			reader.onload = () => {
	// 				resolve(reader.result);
	// 			};
	// 			reader.onerror = (error) => reject(error);
	// 		});
	// 		value = value;
	// 	}
	// 	this.setState({
	// 		[name]: value,
	// 	});
	// };

	// _onChangeFeaturedBox = async (e) => {
	// 	var name = e.target.name;
	// 	var value = e.target.value;


	// 	this.setState({
	// 		featured_stats_box: {
	// 			...this.state.featured_stats_box,
	// 			[name]: value
	// 		}
	// 	})
	// }

	// _onChangeFeaturedText = async (e) => {
	// 	var name = e.target.name;
	// 	var value = e.target.value;


	// 	this.setState({
	// 		featured_text_box: {
	// 			...this.state.featured_text_box,
	// 			[name]: value
	// 		}
	// 	})
	// }

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
			value = value
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
			featured_stats_box: {
				...this.state.featured_stats_box,
				box1_num: parseInt(box1_num),
				box2_num: parseInt(box2_num),
				box3_num: parseInt(box3_num),
				box4_num: parseInt(box4_num),
			},
			featured_text_box: this.state.featured_text_box
		};
		await this.props.updateStudent(data);
		if (this.props.redirect === true) {
			await this.props.history.push("/admin");
		}
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
						{/* <div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Cập nhật admin</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<div className="col-sm-6">
												<label className="col-form-label">
													Họ và tên
												</label>
												<input
													type="text"
													className="form-control"
													name="fullname"
													onChange={this._onChange}
													value={this.state.fullname}
												/>
											</div>

											<div className="col-sm-6">
												<label className="col-form-label">
													Số điện thoại
												</label>
												<input
													type="text"
													className="form-control"
													name="phone"
													onChange={this._onChange}
													value={this.state.phone}
												/>
											</div>
										</div>
										<div className="form-group row">
											<div className="col-sm-6">
												<label className="col-form-label">Email</label>

												<input
													type="email"
													className="form-control"
													name="email"
													onChange={this._onChange}
													value={this.state.email}
												/>
											</div>
											<div className="col-sm-6">
												<label className="col-form-label">Nhóm</label>

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
												</select>
											</div>
										</div>
										<div className="form-group row">

											<div className="col-sm-2">
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
											<div className="col-4 d-flex">
												<img
													alt=""
													src={
														this.props.student ? CDN + this.props.student.avatar : ""
													}
													style={{ width: "200px" }}
												/>
											</div>

											<div className="col-sm-6">
												<label className="col-form-label">
													Link facebook
												</label>
												<input
													type="text"
													className="form-control"
													name="link_fb"
													onChange={this._onChange}
													value={this.state.link_fb}
												/>
											</div>
										</div>

										<div className="form-group row">
											<div className="col-sm-2">
												<label className="col-form-label">
													Ảnh đại diện
												</label>
												<input
													onChange={this._onChange}
													type="file"
													className="form-control-file"
													name="profile_pic_base64"
												/>
											</div>
											<div className="col-4 d-flex">
												<img
													alt=""
													src={
														this.props.student ? CDN + this.props.student.profile_pic : ""
													}
													style={{ width: "200px" }}
												/>
											</div>

											<div className="col-sm-6">
												<label className="col-form-label">
													Tổng số lớp học
												</label>
												<input
													type="number"
													className="form-control"
													name="total_classroom"
													onChange={this._onChange}
													value={this.state.total_classroom}
												/>
											</div>
										</div>
										<div className="form-group row">

											<div className="col-sm-6">
												<label className="col-form-label">
													Tổng số học sinh
												</label>
												<input
													type="number"
													className="form-control"
													name="total_student"
													onChange={this._onChange}
													value={this.state.total_student}
												/>
											</div>
										</div>



										<div className="form-group row">
											<div className="col-sm-6">
												<label className="col-form-label">Box 1 - Số</label>
												<input
													type="number"
													className="form-control"
													name="box1_num"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box?.box1_num ? this.state.featured_stats_box.box1_num : ""}
												/>
											</div>
											<div className="col-sm-6">
												<label className="col-form-label">Box 1 - Text</label>
												<textarea
													className="form-control custom-textarea"
													name="box1_text"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box?.box1_text ? this.state.featured_stats_box.box1_text : ""}
													rows="1"
												>
												</textarea>
											</div>
										</div>

										<div className="form-group row">
											<div className="col-sm-6">
												<label className="col-form-label">Box 2 - Số</label>
												<input
													type="number"
													className="form-control"
													name="box2_num"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box?.box2_num ? this.state.featured_stats_box.box2_num : ""}
												/>
											</div>
											<div className="col-sm-6">
												<label className="col-form-label">Box 2 - Text</label>
												<textarea
													className="form-control custom-textarea"
													name="box2_text"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box?.box2_text ? this.state.featured_stats_box.box2_text : ""}
													rows="1"
												>
												</textarea>
											</div>
										</div>

										<div className="form-group row">
											<div className="col-sm-6">
												<label className="col-form-label">Box 3 - Số</label>
												<input
													type="number"
													className="form-control"
													name="box3_num"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box?.box3_num ? this.state.featured_stats_box.box3_num : ""}
												/>
											</div>
											<div className="col-sm-6">
												<label className="col-form-label">Box3 - Text</label>
												<textarea
													className="form-control custom-textarea"
													name="box3_text"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box?.box3_text ? this.state.featured_stats_box.box3_text : ""}
													rows="1"
												>
												</textarea>
											</div>
										</div>

										<div className="form-group row">
											<div className="col-sm-6">
												<label className="col-form-label">Box 4 - Số</label>
												<input
													type="number"
													className="form-control"
													name="box4_num"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box?.box4_num ? this.state.featured_stats_box?.box4_num : ""}
												/>
											</div>
											<div className="col-sm-6">
												<label className="col-form-label">Box 4 - Text</label>
												<textarea
													className="form-control custom-textarea"
													name="box4_text"
													onChange={this._onChangeFeaturedBox}
													value={this.state.featured_stats_box?.box4_text ? this.state.featured_stats_box?.box4_text : ""}
													rows="1"
												>
												</textarea>

											</div>
										</div>

										<div className="form-group row">
											<div className="col-sm-6">
												<label className="col-form-label">Featured text 1</label>
												<textarea
													className="form-control custom-textarea"
													name="box1_text"
													onChange={this._onChangeFeaturedText}
													value={this.state.featured_text_box?.box1_text ? this.state.featured_text_box.box1_text : ""}
													rows="1"
												>
												</textarea>
											</div>
											<div className="col-sm-6">
												<label className="col-form-label">Featured text 2</label>
												<textarea
													className="form-control custom-textarea"
													name="box2_text"
													onChange={this._onChangeFeaturedText}
													value={this.state.featured_text_box?.box2_text ? this.state.featured_text_box.box2_text : ""}
													rows="1"
												>
												</textarea>

											</div>
										</div>
										<div className="form-group row">
											<div className="col-sm-6">
												<label className="col-form-label">Featured text 3</label>
												<textarea
													className="form-control custom-textarea"
													name="box3_text"
													onChange={this._onChangeFeaturedText}
													value={this.state.featured_text_box?.box3_text ? this.state.featured_text_box?.box3_text : ""}
													rows="1"
												>
												</textarea>
											</div>
										</div>


										<div className="form-group row">
											<label className="col-sm-12 col-form-label">
												Mô tả ngắn
											</label>
											<div className="col-sm-12">
												<Editor
													onInit={(evt, editor) => {
														this._handleEditorDescriptionChange(
															this.state.description,
															editor
														);
													}}
													value={this.state.description}
													init={{
														height: 500,
														menubar: false,
														images_file_types:
															"jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp",
														plugins: [
															"advlist autolink lists link image charmap print preview anchor",
															"searchreplace visualblocks code fullscreen",
															"insertdatetime media table paste code help wordcount tiny_mce_wiris",
														],
														external_plugins: {
															tiny_mce_wiris:
																"https://www.wiris.net/demo/plugins/tiny_mce/plugin.js",
														},
														toolbar:
															"undo redo | formatselect | " +
															"bold italic backcolor | image | alignleft aligncenter " +
															"alignright alignjustify | bullist numlist outdent indent | fontselect |  fontsizeselect |" +
															"searchreplace visualblocks code fullscreen | " +
															"lists link advlist insertdatetime media | tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry | table paste code removeformat | help",
														fontsize_formats:
															"8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt",
														content_style:
															"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
														draggable_modal: true,
														htmlAllowedTags: [".*"],
														htmlAllowedAttrs: [".*"],
														images_upload_handler: (
															blobInfo,
															success,
															failure
														) =>
															this._uploadImageCallBack(
																blobInfo,
																success,
																failure
															),
													}}
													onEditorChange={this._handleEditorDescriptionChange}
													scriptLoading={{ delay: 500 }}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-12 col-form-label">
												Nội dung chi tiết
											</label>
											<div className="col-sm-12">
												<Editor
													onInit={(evt, editor) => {
														this._handleEditorContentChange(
															this.state.content,
															editor
														);
													}}
													value={this.state.content}
													init={{
														height: 500,
														menubar: false,
														images_file_types:
															"jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp",
														plugins: [
															"advlist autolink lists link image charmap print preview anchor",
															"searchreplace visualblocks code fullscreen",
															"insertdatetime media table paste code help wordcount tiny_mce_wiris",
														],
														external_plugins: {
															tiny_mce_wiris:
																"https://www.wiris.net/demo/plugins/tiny_mce/plugin.js",
														},
														toolbar:
															"undo redo | formatselect | " +
															"bold italic backcolor | image | alignleft aligncenter " +
															"alignright alignjustify | bullist numlist outdent indent | fontselect |  fontsizeselect |" +
															"searchreplace visualblocks code fullscreen | " +
															"lists link advlist insertdatetime media | tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry | table paste code removeformat | help",
														fontsize_formats:
															"8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt",
														content_style:
															"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
														draggable_modal: true,
														htmlAllowedTags: [".*"],
														htmlAllowedAttrs: [".*"],
														images_upload_handler: (
															blobInfo,
															success,
															failure
														) =>
															this._uploadImageCallBack(
																blobInfo,
																success,
																failure
															),
													}}
													onEditorChange={this._handleEditorContentChange}
													scriptLoading={{ delay: 500 }}
												/>
											</div>
										</div>

										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Hiển thị Profile ?
											</label>
											<div className="col-sm-8">
												<div className="form-check float-left">
													<input
														checked={
															this.state.is_show_profile === true ||
															this.state.is_show_profile === "true"
														}
														className="form-check-input"
														type="radio"
														name="is_show_profile"
														value="true"
														id="gridRadios1"
														onChange={this._onChange}
													// defaultValue="option1"
													// defaultChecked
													/>
													<label
														className="form-check-label"
														htmlFor="gridRadios1"
													>
														Hiển thị
													</label>
												</div>
												<div className="form-check float-left ml-4">
													<input
														checked={
															this.state.is_show_profile === false ||
															this.state.is_show_profile === "false"
														}
														className="form-check-input"
														type="radio"
														name="is_show_profile"
														value="false"
														id="gridRadios2"
														onChange={this._onChange}
													// defaultValue="option2"
													/>
													<label
														className="form-check-label"
														htmlFor="gridRadios2"
													>
														Ẩn
													</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="form-group row">
									<div className="col-sm-12 text-right">
										<button
											className="btn btn-primary mt-2"
											onClick={this.handleSubmit}
										>
											Cập nhật
										</button>
									</div>
								</div>
							</div>
						</div> */}
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
											!this.state.homePagePreview
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
											!this.state.avtPreview
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
											<label className="text-form-label">Tên giáo viên</label>
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
										<div className="form-group" style={{ width: "50%" }}>
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
								</div>
							</div>
						</div>
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
														<div class="text" onClick={this.remoImgTextBox2}>Xóa</div>
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
													<div class="middle">
														<div class="text" onClick={this.remoImgTextBox3}>Xóa</div>
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

						<div className="block-item-content">
							<h3 className="title-block">Mô tả</h3>
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

						<div className="block-action-footer">
							<button type="button" className="btn-cancel">
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
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ showStudent, updateStudent, uploadImage },
		dispatch
	);
}

let AdminEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(AdminEdit)
);

export default AdminEditContainer;
