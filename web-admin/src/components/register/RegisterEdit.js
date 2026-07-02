import React, {Component} from 'react';
import {withRouter, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
	showRegistration,
	createRegistration,
	updateRegistration,
} from '../../redux/register/action';
import {Select} from 'antd';

const {Option} = Select;

class RegisterEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			fullname: '',
			phone: '',
			email: '',
			school: '',
			classroom: '',
			subject: '',
			note: '',
			is_called: false,
			is_student: false,
		};
	}

	async componentDidMount() {
		await this.props.showRegistration(this.props.match.params.id);
		if (this.props.registration) {
			var {
				fullname,
				phone,
				email,
				school,
				classroom,
				subject,
				is_called,
				is_student,
				note,
			} = this.props.registration;
			this.setState({
				fullname,
				phone,
				email,
				school,
				classroom,
				subject,
				is_called,
				is_student,
				note,
			});
		}
	}

	_onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};
	handleSubmit = async e => {
		e.preventDefault();

		const data = {
			id: this.props.match.params.id,
			note: this.state.note,
			is_called: this.state.is_called,
			is_student: this.state.is_student,
		};
		await this.props.updateRegistration(data);
		await this.props.showRegistration(this.props.match.params.id);
	};

	fetchRows() {
		if (this.props.tags instanceof Array) {
			return this.props.tags.map((obj, i) => {
				return <Option key={obj._id.toString()}>{obj.name}</Option>;
			});
		}
	}

	handleChange = async e => {
		var name = e.target.name;
		var value = e.target.checked;
		await this.setState({
			[name]: value,
		});
	};

	render() {
		var {
			fullname,
			phone,
			email,
			school,
			classroom,
			subject,
			note,
		} = this.state;
		return (
			<div>
				<div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">
								Thông tin đăng ký: {fullname}
							</h2>
						</div>
						<div className="flex" />
						<div>
							<Link
								to={'/registration'}
								className="btn btn-sm text-white btn-primary">
								<span className="d-none d-sm-inline mx-1">
									Quay lại
								</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width={16}
									height={16}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
									className="feather feather-arrow-right">
									<line x1={5} y1={12} x2={19} y2={12} />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</Link>
						</div>
					</div>
				</div>

				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Thông tin đăng ký</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Họ và tên
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="fullname"
													onChange={this._onChange}
													value={fullname}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Số điện thoại
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="phone"
													onChange={this._onChange}
													value={phone}
												/>
											</div>
										</div>

										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Email
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="email"
													onChange={this._onChange}
													value={email}
												/>
											</div>
										</div>

										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Trường
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="school"
													onChange={this._onChange}
													value={school}
												/>
											</div>
										</div>

										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Lớp
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="classroom"
													onChange={this._onChange}
													value={classroom}
												/>
											</div>
										</div>

										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Môn học
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="subject"
													onChange={this._onChange}
													value={subject}
												/>
											</div>
										</div>

										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Đã gọi điện
											</label>
											<div className="col-sm-8">
												<label className="ui-switch ui-switch-md info m-t-xs">
													<input
														type="checkbox"
														name="is_called"
														checked={
															this.state.is_called
																? 'checked'
																: ''
														}
														onChange={
															this.handleChange
														}
													/>{' '}
													<i />
												</label>
											</div>
										</div>

										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Đã tham gia
											</label>
											<div className="col-sm-8">
												<label className="ui-switch ui-switch-md info m-t-xs">
													<input
														type="checkbox"
														name="is_student"
														checked={
															this.state
																.is_student
																? 'checked'
																: ''
														}
														onChange={
															this.handleChange
														}
													/>{' '}
													<i />
												</label>
											</div>
										</div>

										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Ghi chú
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="note"
													onChange={this._onChange}
													value={note}
												/>
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
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		registration: state.register.registration,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{createRegistration, showRegistration, updateRegistration},
		dispatch,
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(RegisterEdit),
);
