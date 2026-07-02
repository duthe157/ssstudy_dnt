import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createSubject } from "../../redux/subject/action";
import { listAdmin } from "../../redux/student/action";
import { Radio, notification } from "antd";

class SubjectCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			name: "",
			code: "",
			is_online: false,
			subjectsCombination: "",
			support_fb_link: "",
			teacher_id: "",
			supporter_id: "",
			ordering: 0,
			status: false
		};
	}

	getData = () => {
		const data = {
			limit: 50
		};

		return data;
	};

	async componentDidMount() {
		await this.props.listAdmin(this.getData());
	}

	fetchRows(group = null) {
		if (this.props.students instanceof Array) {
			return this.props.students.map((obj, i) => {
				if (group && obj.user_group === group) {
					return (
						<option value={obj._id} key={obj._id.toString()}>
							{obj.fullname}
						</option>
					);
				}
			});
		}
	}

	_onChange = (e) => {
		var name, value;

		// Xử lý Radio.Group từ Antd
		if (e.target) {
			name = e.target.name;
			value = e.target.value;
		} else {
			// Antd Radio.Group trả về object khác
			name = e.target ? e.target.name : 'is_online'; // hoặc 'status'
			value = e;
		}

		this.setState({
			[name]: value,
		});
	};

	// ✅ SỬA: Đổi tên từ "vaidateBeforeSave" thành "validateBeforeSave"
	validateBeforeSave() {
		if (!this.state.code || this.state.code.trim() === "") {
			notification.error({
				message: "Lỗi",
				description: "Vui lòng nhập mã môn học!",
				placement: "topRight",
			});
			return false;
		}

		if (!this.state.subjectsCombination || this.state.subjectsCombination.trim() === "") {
			notification.error({
				message: "Lỗi",
				description: "Vui lòng chọn tổ hợp môn học!",
				placement: "topRight",
			});
			return false;
		}

		if (!this.state.name || this.state.name.trim() === "") {
			notification.error({
				message: "Lỗi",
				description: "Vui lòng nhập tên môn học!",
				placement: "topRight",
			});
			return false;
		}
		return true;
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		if (!this.validateBeforeSave()) { // ✅ SỬA: Bỏ tham số không cần thiết
			return;
		}

		await this.props.createSubject({
			name: this.state.name,
			code: this.state.code,
			classification: this.state.subjectsCombination,
			is_online: this.state.is_online,
			support_fb_link: this.state.support_fb_link,
			teacher_id: this.state.teacher_id,
			supporter_id: this.state.supporter_id,
			ordering: this.state.ordering,
			status: this.state.status
		});

		if (this.props.redirect === true) {
			await this.props.history.push("/subject");
		}
	};

	handleSave = async (e) => {
		e.preventDefault();
		if (!this.validateBeforeSave()) { // ✅ SỬA: Bỏ tham số không cần thiết
			return;
		}

		const data = {
			name: this.state.name,
			code: this.state.code,
			classification: this.state.subjectsCombination,
			is_online: this.state.is_online,
			support_fb_link: this.state.support_fb_link,
			teacher_id: this.state.teacher_id,
			supporter_id: this.state.supporter_id,
			ordering: this.state.ordering,
			status: this.state.status
		};

		await this.props.createSubject(data);

		if (this.props.redirect === true) {
			// ✅ SỬA: Reset thêm subjectsCombination
			await this.setState({
				name: "",
				code: "",
				is_online: false,
				subjectsCombination: "", // ✅ Thêm dòng này
				support_fb_link: "",
				teacher_id: "",
				supporter_id: "",
				ordering: 0, // ✅ SỬA: Reset về 0
				status: false
			});
		}
	};

	render() {
		return (
			<div>
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<div className='row'>
							<div className='col-md-8'>
								<div className='card'>
									<div className='card-header'>
										<strong>Thêm môn học mới</strong>
									</div>
									<div className='card-body'>
										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Tên môn học
											</label>
											<div className='col-sm-8'>
												<input
													type='text'
													className='form-control'
													name='name'
													onChange={this._onChange}
													value={this.state.name}
													ref={(input) =>
														(this.nameInput = input)
													}
												/>
											</div>
										</div>
										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Mã môn học
											</label>
											<div className='col-sm-8'>
												<input
													type='text'
													className='form-control'
													name='code'
													onChange={this._onChange}
													value={this.state.code}
													ref={(input) =>
														(this.codeInput = input)
													}
												/>
											</div>
										</div>
										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Link Messenger FB
											</label>
											<div className='col-sm-8'>
												<input
													type='text'
													className='form-control'
													name='support_fb_link'
													onChange={this._onChange}
													value={
														this.state
															.support_fb_link
													}
													ref={(input) =>
														(this.supportFbLink = input)
													}
												/>
											</div>
										</div>
										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Tổ hợp môn học
											</label>
											<div className='col-sm-8'>
												<select
													name='subjectsCombination'
													className='custom-select'
													onChange={this._onChange}
													value={this.state.subjectsCombination}
												>
													<option value="" disabled>-- Chọn tổ hợp --</option>
													<option value='TU_NHIEN'>Tự nhiên</option>
													<option value='XA_HOI'>Xã hội</option>
													<option value='KHONG_XAC_DINH'>Khác</option>
												</select>
											</div>
										</div>

										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Giáo viên
											</label>
											<div className='col-sm-8'>
												<select
													name='teacher_id'
													className='custom-select'
													onChange={this._onChange}
													value={
														this.state.teacher_id
													}
												>
													<option value=''>
														-- Chọn giáo viên --
													</option>
													{this.fetchRows('TEACHER')}
												</select>
											</div>
										</div>

										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Trơ giảng
											</label>
											<div className='col-sm-8'>
												<select
													name='supporter_id'
													className='custom-select'
													onChange={this._onChange}
													value={
														this.state.supporter_id
													}
												>
													<option value=''>
														-- Chọn trợ giảng --
													</option>
													{this.fetchRows('SUPPORTER')}
												</select>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">Thứ tự</label>
											<div className="col-sm-8">
												<input
													type="number"
													className="form-control"
													name="ordering"
													onChange={this._onChange}
													value={this.state.ordering}
												/>
											</div>
										</div>
										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Hình thức học
											</label>
											<div className='col-sm-8'>
												<Radio.Group
													onChange={this._onChange}
													name='is_online'
													value={this.state.is_online}
												>
													<Radio value={false}>
														Offline
													</Radio>
													<Radio value={true}>
														Online
													</Radio>
												</Radio.Group>
											</div>
										</div>

										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Hiển thị
											</label>
											<div className='col-sm-8'>
												<Radio.Group
													onChange={this._onChange}
													name='status'
													value={this.state.status}
												>
													<Radio value={false}>
														Ẩn
													</Radio>
													<Radio value={true}>
														Hiện
													</Radio>
												</Radio.Group>
											</div>
										</div>

										<div className='form-group row'>
											<div className='col-sm-12 text-right'>
												<button
													className='btn btn-primary mt-2'
													onClick={this.handleSubmit}
												>
													Lưu
												</button>
												<button
													className='btn btn-primary mt-2 ml-2'
													onClick={this.handleSave}
												>
													Lưu & Thêm mới
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
		subjects: state.subject.subjects,
		redirect: state.subject.redirect,
		token: state.auth.token,
		students: state.student.students,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ createSubject, listAdmin }, dispatch);
}

let subjectCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(SubjectCreate)
);

export default subjectCreateContainer;
