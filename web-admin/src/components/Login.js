import React, { Component } from "react";
import { Spin } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { withRouter, Redirect } from "react-router-dom";

import { login } from "../redux/auth/action";
import GoogleAuth from "../components/google-auth/GoogleAuth";

class Login extends Component {
	constructor(props) {
		super();
		this.state = {
			email: "",
			password: "",
			loading: false,
		};
	}

	_onChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	handleSubmit = async (e) => {
		e.preventDefault();
		const data = {
			email: this.state.email,
			password: this.state.password,
		};

		await this.props.login(data);
	};

	render() {
		if (this.props.isAuthenticated) {
			return (
				<Redirect
					to={{
						pathname: "/",
						state: { from: this.props.location },
					}}
				/>
			);
		}
		return (
			<div>
				<div className='text-center'>
					<Spin spinning={this.state.loading} />
				</div>
				<div className='flex'>
					<div className='w-xl w-auto-sm mx-auto py-5'>
						<div className='p-4 d-flex flex-column h-100'>
							<a
								href='#'
								className='navbar-brand align-self-center'
							>
								<span className='hidden-folded d-inline l-s-n-1x align-self-center'>
									ADMIN | LUYỆN THI TIẾN ĐẠT
								</span>
							</a>
						</div>
						<div className='card'>
							<div id='content-body'>
								<div className='p-3 p-md-5'>
									<h5>Chào mừng</h5>
									<p>
										<small className='text-muted'>
											Đăng nhập hệ thống quản trị
										</small>
									</p>
									<form>
										<div className='form-group'>
											<label>Email/SĐT</label>
											<input
												type='email'
												name='email'
												className='form-control'
												placeholder='Enter email'
												onChange={this._onChange}
											/>
										</div>
										<div className='form-group'>
											<label>Mật khẩu</label>
											<input
												type='password'
												name='password'
												className='form-control'
												placeholder='Password'
												onChange={this._onChange}
											/>
											<div className='my-3 text-right'>
												<a
													href='#'
													className='text-muted'
												>
													Quên mật khẩu?
												</a>
											</div>
										</div>
										<div className='checkbox mb-3'>
											<label className='ui-check'>
												<input type='checkbox' />
												<i /> Ghi nhớ
											</label>
										</div>
										<button
											type='submit'
											className='btn btn-primary mb-4'
											onClick={this.handleSubmit}
										>
											Đăng nhập
										</button>
										{/* <GoogleAuth /> */}
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

Login.defaultProps = {
	email: "null",
	password: "null",
};

Login.propTypes = {
	email: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		token: state.auth.token,
		isAuthenticated: state.auth.isAuthenticated,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ login }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
