import React, { Component } from 'react';
import { notification } from 'antd';
import {
	createCode,
	listCode,
	deleteClassroomCode,
} from '../../redux/classroom/action';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class ModalCreateCode extends Component {
	constructor(props) {
		super();
		this.state = {
			classroom_id: '',
			total_code: 0,
			code_type: 'single_use',
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
		const isShared = this.state.code_type === 'shared';
		if (isShared && this.props.sharedCode) {
			notification.warning({
				message: 'Lớp này đã có mã dùng chung !',
				placement: 'topRight',
				top: 50,
				duration: 3,
				style: {
					zIndex: 1050,
				},
			});
			return;
		}
		const totalCode = parseInt(this.state.total_code, 10) || 0;
		if (isShared || totalCode > 0) {
			const data = {
				total_code: isShared ? 1 : totalCode,
				classroom_id: this.props.classroom_id,
				is_shared: isShared,
			};
			await this.props.createCode(data);
			const dataCode = {
				classroom_id: this.props.classroom_id,
				page: 1,
				limit: this.props.limit,
			};
			await this.props.listCode(dataCode);
			await this.setState({
				total_code: 0,
				code_type: 'single_use',
			});
		} else {
			notification.warning({
				message: 'Số lượng phải lớn hơn 0 !',
				placement: 'topRight',
				top: 50,
				duration: 3,
				style: {
					zIndex: 1050,
				},
			});
		}
	};

	handleCopySharedCode = async () => {
		if (!this.props.sharedCode || !this.props.sharedCode.code) {
			return;
		}
		const code = this.props.sharedCode.code;
		try {
			if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(code);
			} else {
				const textarea = document.createElement('textarea');
				textarea.value = code;
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
			}
			notification.success({
				message: 'Đã copy mã dùng chung !',
				placement: 'topRight',
				top: 50,
				duration: 2,
				style: {
					zIndex: 1050,
				},
			});
		} catch (err) {
			notification.error({
				message: 'Không thể copy mã. Vui lòng thử lại !',
				placement: 'topRight',
				top: 50,
				duration: 3,
				style: {
					zIndex: 1050,
				},
			});
		}
	};

	handleDeleteSharedCode = async () => {
		if (!this.props.sharedCode || !this.props.sharedCode._id) {
			return;
		}
		await this.props.deleteClassroomCode({
			ids: [this.props.sharedCode._id],
		});
		const dataCode = {
			classroom_id: this.props.classroom_id,
			page: 1,
			limit: this.props.limit,
		};
		await this.props.listCode(dataCode);
		notification.success({
			message: 'Đã xoá mã dùng chung !',
			placement: 'topRight',
			top: 50,
			duration: 2,
			style: {
				zIndex: 1050,
			},
		});
	};

	render() {
		const hasSharedCode = this.state.code_type === 'shared' && this.props.sharedCode;
		return (
			<div
				id="modal-create-code"
				className="modal-dialog animate fade-down modal-lg"
				data-class="fade-down">
				<div className="modal-content">
					<div className="modal-header">
						<div className="modal-title text-md">
							Tạo mã truy cập
						</div>
						<button className="close" data-dismiss="modal">
							×
						</button>
					</div>
					<div
						className="modal-body"
						style={{
							minHeight: 150,
						}}>
						<div
							className="input-add-code"
							style={{
								minWidth: 760,
								margin: '0 auto',
								display: 'flex',
								flexDirection: 'column',
								gap: 12,
							}}>
							<div
								className="toolbar mb-0"
								style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ minWidth: 90, fontWeight: 600 }}>Loại mã</span>
								<select
									className="custom-select"
									name="code_type"
									value={this.state.code_type}
									onChange={this.onChange}
									style={{ maxWidth: 280 }}>
									<option value="single_use">Mã cá nhân (theo số lượng)</option>
									<option value="shared">Mã dùng chung (1 mã/khóa học)</option>
								</select>
								{hasSharedCode ? (
									<>
										<input
											type="text"
											className="form-control keyword-custom"
											readOnly
											value={this.props.sharedCode.code}
											style={{ maxWidth: 180 }}
										/>
										<button
											type="button"
											className="btn btn-light"
											onClick={this.handleCopySharedCode}>
											Copy
										</button>
										<button
											type="button"
											className="btn btn-danger"
											onClick={this.handleDeleteSharedCode}>
											Xoá
										</button>
									</>
								) : this.state.code_type === 'shared' ? (
									<span className="text-muted text-sm">Chưa có mã dùng chung</span>
								) : null}
							</div>
							<div
								className="toolbar mb-0"
								style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ minWidth: 90, fontWeight: 600 }}>Số lượng</span>
								<input
									type="number"
									className="form-control keyword-custom"
									placeholder="Nhập số lượng..."
									min="0"
									onChange={this.onChange}
									name="total_code"
									value={this.state.total_code}
									disabled={this.state.code_type === 'shared'}
									style={{ maxWidth: 180 }}
								/>
								<button
									data-dismiss={(this.state.code_type === 'shared' || (parseInt(this.state.total_code, 10) || 0) > 0) && !hasSharedCode && 'modal'}
									className="btn btn-primary"
									disabled={hasSharedCode}
									onClick={this.handleSubmit}>
									Tạo
								</button>
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
		limit: state.classroom.limit,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ createCode, listCode, deleteClassroomCode },
		dispatch,
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ModalCreateCode),
);
