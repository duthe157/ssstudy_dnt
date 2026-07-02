import React, { Component } from 'react';
import { notification } from 'antd';
import { createCode, listCode } from '../../redux/book-id/action';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class ModalCreateCode extends Component {
	constructor(props) {
		super();
		this.state = {
			book_id: '',
			total_code: 0,
		};
	}

	onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	handleSubmit = async () => {
		if (this.state.total_code !== '') {
			const data = {
				total_code: this.state.total_code,
				book_id: this.props.book_id,
			};
			await this.props.createCode(data);
			const dataCode = {
				book_id: this.props.book_id,
				page: 1,
				limit: this.props.limit,
			};
			await this.props.listCode(dataCode);
			await this.setState({
				total_code: 0,
			});
		} else {
			notification.warning({
				message: 'Số lượng không được bỏ trống !',
				placement: 'topRight',
				top: 50,
				duration: 3,
				style: {
					zIndex: 1050,
				},
			});
		}
	};

	render() {
		return (
			<div
				id="modal-create-code"
				className="modal-dialog animate fade-down modal-lg"
				data-class="fade-down"
			>
				<div className="modal-content">
					<div className="modal-header">
						<div className="modal-title text-md">
							Tạo mã kích hoạt
						</div>
						<button className="close" data-dismiss="modal">
							×
						</button>
					</div>

					<div
						className="modal-body"
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<div style={{ width: '100%', maxWidth: 420 }}>
							<label
								htmlFor="total_code"
								style={{
									fontWeight: 500,
									marginBottom: 6,
									display: 'block',
								}}
							>
								Số lượng mã kích hoạt cần tạo
								<span className="text-danger"> *</span>
							</label>

							<input
								id="total_code"
								type="number"
								className="form-control keyword-custom"
								placeholder="Ví dụ: 100"
								min="0"
								onChange={this.onChange}
								name="total_code"
								value={this.state.total_code}
								style={{
									height: 42,
									borderRadius: 8,
								}}
							/>

							<small
								style={{
									color: '#6c757d',
									marginTop: 6,
									display: 'block',
								}}
							>
								Nhập số lượng mã bạn muốn tạo
							</small>
						</div>
					</div>

					{/* Footer */}
					<div className="modal-footer">
						<button
							className="btn btn-cancel"
							data-dismiss="modal"
						>
							Quay lại
						</button>

						<button
							className="btn btn-primary"
							data-dismiss={this.state.total_code !== '' ? 'modal' : undefined}
							onClick={this.handleSubmit}
							disabled={this.state.total_code === 0}
						>
							Xác nhận
						</button>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		limit: state.classroom.limit,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ createCode, listCode }, dispatch);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ModalCreateCode),
);
