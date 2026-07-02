import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showSubject, updateSubject } from "../../redux/subject/action";
import { listAdmin } from "../../redux/student/action";
import { Radio, notification } from "antd";

class SubjectEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			code: "",
			name: "",
			is_online: false,
			support_fb_link: "",
			teacher_id: "",
			supporter_id: "",
			classification: "",
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
		await this.props.showSubject(this.props.match.params.id);
		await this.props.listAdmin(this.getData());
		if (this.props.subject) {
			var { code, name, support_fb_link, is_online, status } = this.props.subject;
			this.setState({
				code,
				name,
				support_fb_link,
				is_online,
				classification: this.props.subject.classification ? this.props.subject.classification : "",
				teacher_id: this.props.subject.teacher ? this.props.subject.teacher.id : null,
				supporter_id: this.props.subject.supporter ? this.props.subject.supporter.id : null,
				ordering: this.props.subject.ordering ? this.props.subject.ordering : 0,
				status
			});
		}
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
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	validateBeforeSave() {
		if (!this.state.code || this.state.code.trim() === "") {
			notification.error({
				message: "Lỗi",
				description: "Vui lòng nhập mã môn học!",
				placement: "topRight",
			});
			return false;
		}

		if (!this.state.classification || this.state.classification.trim() === "") {
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

		if (!this.validateBeforeSave()) {
			return;
		}

		const data = {
			id: this.props.match.params.id,
			code: this.state.code,
			name: this.state.name,
			is_online: this.state.is_online,
			classification: this.state.classification,
			support_fb_link: this.state.support_fb_link,
			teacher_id: this.state.teacher_id,
			supporter_id: this.state.supporter_id,
			ordering: this.state.ordering,
			status: this.state.status
		};
		await this.props.updateSubject(data);
	};

	render() {
		var { code, name, support_fb_link, teacher_id, is_online, status } = this.state;
		return (
			<div>
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<div className='row'>
							<div className='col-md-10'>
								<div className='card'>
									<div className='card-header'>
										<strong>Thông tin môn học</strong>
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
													value={name}
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
													value={code}
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
													value={support_fb_link}
												/>
											</div>
										</div>

										<div className='form-group row'>
											<label className='col-sm-4 col-form-label'>
												Tổ hợp môn học
											</label>
											<div className='col-sm-8'>
												<select
													name='classification'
													className='custom-select'
													onChange={this._onChange}
													value={this.state.classification}
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
														teacher_id
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
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		token: state.auth.token,
		subject: state.subject.subject,
		redirect: state.student.redirect,
		students: state.student.students,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ showSubject, updateSubject, listAdmin },
		dispatch
	);
}

let SubjectEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(SubjectEdit)
);

export default SubjectEditContainer;
