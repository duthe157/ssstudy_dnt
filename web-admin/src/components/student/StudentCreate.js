import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import Player from "react-player";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createAdmin } from "../../redux/student/action";
import { Select } from "antd";
import { isUndefined } from "util";
import { Radio } from "antd";

import baseHelpers from '../../helpers/BaseHelpers';

const { Option } = Select;

class StudentCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			fullname: "",
			phone: "",
			email: "",
			school: "",
			classroom: "",
			user_group: "STUDENT",
			password: "",
			dob: "",
			avatar_base64: [],
			gender: "Male",
			// point: 0,
			avtPreview: "",
			parent_phone: "",
			parent_name: ""
		};
	}

	_onChange = async (e) => {
		var name = e.target.name;
		let value = e.target.value;
		let checked = e.target.checked;
		let avtPreview = "";

		if (name === "is_featured" || name === "status") {
			value = checked;
		}

		if (name === "avatar_base64") {
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
				avtPreview
			});
		} else {
			this.setState({
				[name]: value,
			});
		}
	};


	handleSubmit = async (e) => {
		e.preventDefault();
		const data = {
			fullname: this.state.fullname,
			email: this.state.email,
			phone: this.state.phone,
			avatar_base64: this.state.avatar_base64,
			school: this.state.school,
			classroom: this.state.classroom,
			user_group: this.state.user_group,
			password: this.state.password,
			dob: this.state.dob,
			gender: this.state.gender,
			// point: this.state.point,
			parent_phone: this.state.parent_phone,
			parent_name: this.state.parent_name
		};

		await this.props.createAdmin(data);
		if (this.props.redirect === true) {
			await this.props.history.push("/student");
		}
	};

	handleSave = async (e) => {
		e.preventDefault();
		const data = {
			fullname: this.state.fullname,
			email: this.state.email,
			phone: this.state.phone,
			school: this.state.school,
			classroom: this.state.classroom,
			user_group: this.state.user_group,
			password: this.state.password,
			dob: this.state.dob,
		};
		await this.props.createAdmin(data);
		if (this.props.redirect === true) {
			await this.props.history.push("/student");
		}
	};

	handleUploadImage = () => {
		document.getElementById("input-upload-image").click();
	}

	remoAvatar = () => {
		document.getElementById("input-upload-image").value = "";
		this.setState({
			avatar_base64: null,
			avtPreview: ""
		})
	}

	render() {
		var {
			code,
			fullname,
			email,
			gender,
			classroom,
			parent_phone,
			parent_name,
			phone,
			point,
			school,
			dob,
			password,
			histories
		} = this.state;
		return (
			<div>
				<div className='page-content page-container page-edit-student' id='page-content'>
					<div className='padding'>
						<h2 className="text-md text-highlight sss-page-title">Thêm thành viên</h2>
						<div className="block-item-content">
							<h3 className="title-block">Thông tin chung</h3>
							<div className="content">
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="avatar_base64"
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

										<div className="form-group mr-16" style={{ width: 400 }}>
											<label className="text-form-label">Tên học sinh</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="fullname"
													onChange={this._onChange}
													value={fullname}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: 400 }}>
											<label className="text-form-label">Email</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="email"
													onChange={this._onChange}
													value={email}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: 400 }}>
											<label className="text-form-label">Số điện thoại</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="phone"
													onChange={this._onChange}
													value={phone}
												/>
											</div>
										</div>
									</div>
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: 400 }}>
											<label className="text-form-label">Ngày sinh</label>
											<div>
												<input
													type="date"
													className="form-control"
													name="dob"
													onChange={this._onChange}
													value={dob}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Trường</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="school"
													onChange={this._onChange}
													value={school}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Lớp</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="classroom"
													onChange={this._onChange}
													value={classroom}
												/>
											</div>
										</div>
									</div>
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: 400 }}>
											<label className="text-form-label">Họ và tên phụ huynh</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="parent_name"
													onChange={this._onChange}
													value={parent_name}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: 400 }}>
											<label className="text-form-label">Số điện thoại phụ huynh</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="parent_phone"
													onChange={this._onChange}
													value={parent_phone}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Mật khẩu</label>
											<div>
												<input
													type="password"
													className="form-control"
													name="password"
													onChange={this._onChange}
													value={password}
												/>
											</div>
										</div>
									</div>
									<div className='item-input-text'>
										<div className="form-group mr-16">
											<label className=" col-form-label">Giới tính</label>
											<div>
												<Radio.Group
													onChange={this._onChange}
													name="gender"
													value={gender}
												>
													<Radio value="Male">Nam</Radio>
													<Radio value="FeMale">Nữ</Radio>
												</Radio.Group>
											</div>
										</div>
										{/* <div className="form-group mr-16" style={{ width: 160 }}>
											<label className="text-form-label">Điểm</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="point"
													onChange={this._onChange}
													value={point}
												/>
											</div>
										</div> */}
									</div>
								</div>
							</div>
						</div>
						<div className="block-action-footer">
							<button type="button" className="btn-cancel" onClick={() => this.props.history.push("/student")}>
								<img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
								Hủy
							</button>
							<button type="button" className="btn-submit ml-16" onClick={this.handleSubmit}>
								Thêm thành viên
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
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ createAdmin }, dispatch);
}

let ClassCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(StudentCreate)
);

export default ClassCreateContainer;
