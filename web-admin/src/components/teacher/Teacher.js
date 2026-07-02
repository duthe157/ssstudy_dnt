import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
	listAdmin,
	addDelete,
	deleteStudent,
	checkAll,
	hotResetPassword,
	addDataRemoveAdmin
} from "../../redux/student/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";
import queryString from 'query-string';

const AdminGroupName = {
	ADMIN: 'ADMIN',
	MANAGER: 'Quản lý',
	TEACHER: 'Giáo viên',
	SUPPORTER: 'Trợ giảng',
	ACCOUNTANT: 'Thu ngân'
};

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.check !== nextProps.check) {
			this.setState({
				check: nextProps.check,
			});
		}
	}

	handleCheckBox = (e) => {
		if (e.target.checked) {
			this.props.handleCheckIds(this.props.obj._id, 'add');
			this.setState({
				check: e.target.checked
			})
		} else {
			this.props.handleCheckIds(this.props.obj._id, 'remove');
			this.setState({
				check: e.target.checked
			})
		}
	};

	handleCheck = (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveAdmin({
			ids: this.props.obj._id
		});
	}

	render() {
		return (
			<tr className='v-middle table-row-item' data-id={17}>
				<td>
					<label className='ui-check m-0'>
						<input
							type='checkbox'
							name='id'
							className='checkInputItem'
							value={this.props.obj._id}
							onChange={this.handleCheckBox}
						/>{" "}
						<i />
					</label>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						<Link
							className='item-author text-color'
							to={"/teacher/" + this.props.obj._id + "/edit"}
						>
							{!isUndefined(this.props.obj.code) &&
								this.props.obj.code}
						</Link>
					</span>
				</td>
				<td className='flex'>
					<Link
						className='item-author text-color'
						to={"/teacher/" + this.props.obj._id + "/edit"}
					>
						{this.props.obj.fullname}
					</Link>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.phone}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.email}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{AdminGroupName[this.props.obj.user_group]}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.status === "ACTIVE"
							? "Kích hoạt"
							: "Vô hiệu"}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.updated_at &&
							Moment(this.props.obj.updated_at).format(
								"DD/MM/YYYY"
							)}
					</span>
				</td>
				<td className="text-right">
					<div className='item-action'>
						<Link
							className='mr-14'
							to={"/teacher/" + this.props.obj._id + "/edit"}
						>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						<a
							onClick={async (e) =>
								await this.props.hotResetPassword(this.props.obj._id)
							}
							className='mr-14 trash'
						>
							<img src="/assets/img/icon-setting.svg" alt="" />
						</a>
						<a
							onClick={this.handleCheck}
							data-toggle='modal'
							data-target='#delete-student'
							data-toggle-class='fade-down'
							data-toggle-class-target='.animate'
						>
							<img src="/assets/img/icon-delete.svg" alt="" />
						</a>
					</div>
				</td>
			</tr>
		);
	}
}

class Admin extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: "",
			activePage: 1,
			status: '',
			keyword: "",
			ids: [],
			user_group: "",
			checkAll: false,
		};
	}

	fetchRows() {
		if (this.props.students instanceof Array) {
			return this.props.students.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDelete={this.props.addDelete}
						handleCheckIds={this.handleCheckIds}
						hotResetPassword={this.props.hotResetPassword}
						addDataRemoveAdmin={this.props.addDataRemoveAdmin}
						listStudent={this.props.listStudent}
						onDeleteOne={this.onDeleteOne}
						getData={this.getData}
						check={this.props.check}
					/>
				);
			});
		}
	}

	onChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	onDeleteOne = async (onResetIds) => {
		if (onResetIds) {
			await this.setState({
				ids: []
			})
		}
	}

	async componentDidMount() {
		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			// user_group: params.user_group ? params.user_group : ""
			user_group: this.state.user_group
		})

		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				ids: this.props.ids,
				checkAll: false,
			});
		}
		this.getData(this.state.activePage);
	}

	getData = async (pageNumber = 1) => {

		const params = {
			keyword: this.state.keyword,
			limit: this.props.limit,
			page: this.state.page || pageNumber,
			user_group: this.state.user_group
		}
		if (this.state.status != '')
			params.status = this.state.status;

		await this.props.listAdmin(params);
	};


	resetPassword = (id) => {
		if (window.confirm('Bạn chắc chắn muốn reset về mật khẩu mặc định?')) {
			this.props.hotResetPassword(id);
		}
	};

	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword, user_group, status } = this.state;
		this.props.history.push(`/admin?keyword=${keyword}&user_group=${user_group}&status=${status}`);
		await this.getData(1);
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.props.listAdmin(this.getData(pageNumber));
	};

	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveAdmin;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			}
		}

		if (data.length !== 0) {
			await this.props.deleteStudent(data);
			await this.props.listAdmin(this.getData());
		}

		// this.setState({
		// 	ids: []
		// });
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});

		let { keyword, user_group, status } = this.state;

		this.props.history.push(`/admin?keyword=${keyword}&user_group=${user_group}&status=${status}`);

		await this.getData(1);
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}
	}

	handleCheckAll = (e) => {
		var inputs = document.querySelectorAll('.checkInputItem');
		var flag = false;

		if (e.target.checked) {
			flag = true;
		}

		var _ids = [];
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = flag;
			if (flag) {
				_ids.push(inputs[i].value);
			} else {
				_ids = [];
			}
		}

		this.setState({
			ids: _ids
		});
	};

	handleCheckIds = async (id, type = '') => {
		var _ids = this.state.ids;
		if (type === 'add') {
			if (_ids.indexOf(id) < 0) {
				_ids.push(id);
			}
		}
		if (type === 'remove') {
			const index = _ids.indexOf(id);
			if (index > -1) {
				_ids.splice(index, 1);
			}
		}

		await this.setState({
			ids: _ids
		});
	}


	handleDeleteAll = async (e) => {
		let data = this.state.ids;

		if (data.length === 0) {
			notification.warning({
				message: 'Chưa chọn bài viết nào !',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
		}
	}

	render() {
		let displayFrom =
			this.props.page === 1
				? 1
				: (parseInt(this.props.page) - 1) * this.props.limit;
		let displayTo =
			this.props.page === 1
				? this.props.limit
				: displayFrom + this.props.limit;
		displayTo = displayTo > this.props.total ? this.props.total : displayTo;
		return (
			<div>
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<h2 className="text-md text-highlight sss-page-title">Giáo viên</h2>
						<div className='block-table-member'>
							<div className='toolbar'>
								<div className='btn-group'>
									{this.state.ids.length !== 0 ? (
										<button
											className='btn btn-icon'
											data-toggle='modal'
											data-target='#delete-student'
											data-toggle-class='fade-down'
											data-toggle-class-target='.animate'
											title='Trash'
											id='btn-trash'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={16}
												height={16}
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth={2}
												strokeLinecap='round'
												strokeLinejoin='round'
												className='feather feather-trash text-muted'
											>
												<polyline points='3 6 5 6 21 6' />
												<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
											</svg>
										</button>
									) : (
										<button
											className='btn btn-icon'
											onClick={this.handleDeleteAll}
											title='Trash'
											id='btn-trash'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={16}
												height={16}
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth={2}
												strokeLinecap='round'
												strokeLinejoin='round'
												className='feather feather-trash text-muted'
											>
												<polyline points='3 6 5 6 21 6' />
												<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
											</svg>
										</button>
									)}
								</div>
								<form className='flex' onSubmit={this.onSubmit}>
									<div className='input-group'>
										<input
											type='text'
											className='form-control form-control-theme keyword-custom'
											placeholder='Nhập từ khoá tìm kiếm...'
											onChange={this.onChange}
											name='keyword'
											value={this.state.keyword}
										/>{" "}
										<span className='input-group-append'>
											<button
												className='btn btn-white btn-sm'
												type='submit'
											>
												<span className='d-flex text-muted'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width={16}
														height={16}
														viewBox='0 0 24 24'
														fill='none'
														stroke='currentColor'
														strokeWidth={2}
														strokeLinecap='round'
														strokeLinejoin='round'
														className='feather feather-search'
													>
														<circle
															cx={11}
															cy={11}
															r={8}
														/>
														<line
															x1={21}
															y1={21}
															x2='16.65'
															y2='16.65'
														/>
													</svg>
												</span>
											</button>
										</span>
										<div className="ml-16">
											<select
												className='custom-select mr-2'
												value={this.state.user_group}
												name='user_group'
												onChange={this.handleChange}
											>
												<option value=''>
													Chọn nhóm quản trị
												</option>
												<option value='ADMIN'>Admin</option>
												<option value='MANAGER'>Quản lý</option>
												<option value='TEACHER'>Giáo viên</option>
												<option value='SUPPORTER'>Trợ giảng</option>
												<option value='ACCOUNTANT'>Thu ngân</option>
											</select>
										</div>
										<div className="ml-16">
											<select
												className='custom-select mr-2'
												value={this.state.status}
												name='status'
												onChange={this.handleChange}
											>
												<option value=''>
													Trạng thái
												</option>
												<option value='ACTIVE'>Kích hoạt</option>
												<option value='DEACTIVE'>Vô hiệu</option>
											</select>
										</div>
									</div>
								</form>
							</div>

							<table className='table table-theme table-row v-middle'>
								<thead className='text-muted'>
									<tr>
										<th width='10px'>
											<label className='ui-check m-0'>
												<input
													type='checkbox'
													name='id'
													onChange={this.handleCheckAll}
												/>{" "}
												<i />
											</label>
										</th>
										<th>Mã</th>
										<th>Họ và tên</th>
										<th>Số điện thoại</th>
										<th>Email</th>
										<th>Quyền hạn</th>
										<th>Trạng thái</th>
										<th width='150px'>
											Ngày cập nhật
										</th>
										<th className="text-right">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody>{this.fetchRows()}</tbody>
							</table>

							<div className='row listing-footer'>
								<div className='col-sm-1'>
									<select
										className='custom-select w-70'
										name='limit'
										value={this.state.limit}
										onChange={this.handleChange}
									>
										<option value='20'>20</option>
										<option value='50'>50</option>
										<option value='100'>100</option>
										<option value='-1'>ALL</option>
									</select>
								</div>
								<div className='col-sm-6 showing-text'>
									{" "}
									Hiển thị từ <b>{displayFrom}</b> đến{" "}
									<b>{displayTo}</b> trong tổng số{" "}
									<b>{this.props.total}</b>
								</div>
								{this.props.total !== 0 ? (
									<div className='col-sm-5 text-right'>
										<Pagination
											activePage={this.props.page}
											itemsCountPerPage={this.props.limit}
											totalItemsCount={this.props.total}
											pageRangeDisplayed={10}
											onChange={this.handleChangePage}
										/>
									</div>
								) : (
									<div className=''>Không có bản ghi nào</div>
								)}
							</div>

							<div
								id='delete-student'
								className='modal fade'
								data-backdrop='true'
								style={{ display: "none" }}
								aria-hidden='true'
							>
								<div
									className='modal-dialog animate fade-down'
									data-class='fade-down'
								>
									<div className='modal-content'>
										<div className='modal-header'>
											<div className='modal-title text-md'>
												Thông báo
											</div>
											<button
												className='close'
												data-dismiss='modal'
											>
												×
											</button>
										</div>
										<div className='modal-body'>
											<div className='p-4 text-center'>
												<p>
													Bạn chắc chắn muốn xóa bản
													ghi này chứ?
												</p>
											</div>
										</div>
										<div className='modal-footer'>
											<button
												type='button'
												className='btn btn-light'
												data-dismiss='modal'
											>
												Đóng
											</button>
											<button
												type='button'
												onClick={this.handleDelete}
												className='btn btn-danger'
												data-dismiss='modal'
											>
												Xoá
											</button>
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
		students: state.student.students,
		limit: state.student.limit,
		page: state.student.page,
		total: state.student.total,
		ids: state.student.ids,
		check: state.student.checkAll,
		dataRemoveAdmin: state.student.dataRemoveAdmin
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listAdmin, deleteStudent, addDelete, checkAll, hotResetPassword, addDataRemoveAdmin },
		dispatch
	);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Admin));
