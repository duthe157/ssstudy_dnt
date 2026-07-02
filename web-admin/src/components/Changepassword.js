import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {notification} from 'antd';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changePassword} from '../redux/auth/action';
class Changepassword extends Component {
	constructor(props) {
		super();
		this.state = {
			password: '',
			new_password: '',
			confirm_password: '',
		};
	}

	handleChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	handleSubmit = async e => {
		if (this.state.password === '') {
			this.passwordInput.focus();
			notification.warning({
				message: 'Mật khẩu không được bỏ trống',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
			return;
		} else if (this.state.new_password === '') {
			this.newPasswordInput.focus();
			notification.warning({
				message: 'Mật khẩu mới không được bỏ trống',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
			return;
		} else if (this.state.confirm_password === '') {
			this.confirmPasswordInput.focus();
			notification.warning({
				message: 'Xác nhận mật khẩu không được bỏ trống',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
			return;
		} else if (this.state.confirm_password !== this.state.new_password) {
			notification.warning({
				message: 'Xác nhận mật khẩu không khớp',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
			return;
		} else {
			var data = {
				new_password: this.state.new_password,
			};
			await this.props.changePassword(data);
			this.setState({
				password: '',
				new_password: '',
				confirm_password: '',
			});
		}
	};

	render() {
		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
					<h2 className="text-md text-highlight sss-page-title">Đổi mật khẩu</h2>
						<div className="row">
							<div className="col-md-8">
								<div className="card">
									<div className="card-header">
										<strong>Thông tin mật khẩu</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Mật khẩu hiện tại
											</label>
											<div className="col-sm-8">
												<input
													ref={input =>
														(this.passwordInput = input)
													}
													type="password"
													className="form-control"
													value={this.state.password}
													name="password"
													onChange={this.handleChange}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Mật khẩu mới
											</label>
											<div className="col-sm-8">
												<input
													ref={input =>
														(this.newPasswordInput = input)
													}
													type="password"
													className="form-control"
													value={
														this.state.new_password
													}
													name="new_password"
													onChange={this.handleChange}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Xác nhận mật khẩu mới
											</label>
											<div className="col-sm-8">
												<input
													ref={input =>
														(this.confirmPasswordInput = input)
													}
													type="password"
													className="form-control"
													value={
														this.state
															.confirm_password
													}
													name="confirm_password"
													onChange={this.handleChange}
												/>
											</div>
										</div>
										<div className="form-group row">
											<div className="col-sm-12 text-right">
												<button
													className="btn btn-primary mt-2"
													onClick={this.handleSubmit}>
													Thay đổi
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
	return {};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({changePassword}, dispatch);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Changepassword),
);
