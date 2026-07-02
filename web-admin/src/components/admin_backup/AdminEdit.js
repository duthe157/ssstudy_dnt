import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showStudent, updateStudent } from "../../redux/student/action";
import { uploadImage } from "../../redux/category/action";
import { Radio } from "antd";

const CDN = "https://cdn.luyenthitiendat.vn/";

class AdminEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			code: "",
			fullname: "",
			user_name: "",
			password: "",
			phone: "",
			email: "",
			status: false,
			power: "",
			files: [],
			avtPreview: ""
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

	_onChange = async (e) => {
		var name = e.target.name;
		let value = e.target.value;
		let checked = e.target.checked;
		let avtPreview = "";

		if (name === "is_featured" || name === "status") {
			value = checked;
		}

		if (name === "files") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					avtPreview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			value = [value];

			this.setState({
				[name]: value,
				avtPreview
			});
		} else {
			this.setState({
				[name]: value,
			});
		}
	};


	_handleEditorContentChange = (value, editor) => {
		this.setState({ content: value });
	};
	_handleEditorDescriptionChange = (value, editor) => {
		this.setState({ description: value });
	};

	_uploadImageCallBack = async (blobInfo, success, failure) => {
		let file = blobInfo.blob();
		const data = new FormData();
		data.append("files", file);

		await this.props.uploadImage(data);

		if (this.props.image != null) {
			success(this.props.image);
		} else {
			failure("Upload image fail");
		}
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
				<div className="page-content page-container page-edit-student" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Quản trị viên</h2>

						<div className="block-item-content">
							<h3 className="title-block">Thông tin chung</h3>
							<div className="content">
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="files"
									id="input-upload-image"
								/>
								<div className="block-image">
									{
										!this.state.avtPreview
											?
											<button type="button" onClick={this.handleUploadImage}>
												<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
												<span>Thêm avatar</span>
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
								<div className="block-content">
									<div className="item-input-text">

										<div className="form-group mr-16" style={{ width: "144px" }}>
											<label className="text-form-label">Mã thành viên</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="code"
													onChange={this._onChange}
													style={{ background: "#ededed" }}
													value={this.state.code}
												/>
											</div>
										</div>

										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Tên thành viên</label>
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

										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Tên đăng nhập</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="user_name"
													onChange={this._onChange}
													value={this.state.user_name}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "20%" }}>
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
										<div className="form-group mr-16" style={{ width: "20%" }}>
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
									</div>
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "60%" }}>
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
										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className=" col-form-label">Trạng thái</label>
											<div>
												<Radio.Group
													onChange={this._onChange}
													name="status"
													value={this.state.status}
												>
													<Radio value={false}>Ẩn</Radio>
													<Radio value={true}>Hiện</Radio>
												</Radio.Group>
											</div>
										</div>
										<div className="form-group" style={{ width: "20%" }}>
											<label className="text-form-label">Quyền hạn</label>
											<div>
												<select
													className="custom-select"
													value={this.state.power}
													name="power"
													onChange={this._onChange}
												>
													<option value="">Quản lý bài viết</option>
													<option value="1">Chỉnh sửa bài viết</option>
													<option value="2">Xóa bài viết</option>
												</select>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>


						<div className="block-action-footer">
							<button type="button" className="btn-delete-user">
								Xóa thành viên
								<img src="/assets/img/trash-red-color.svg" alt="" className="ml-14" />
							</button>
							<button type="button" className="btn-cancel ml-16">
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
