import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
	listStudent,
	deleteStudent,
	checkAll,
	hotResetPassword,
	onSetCredit,
	addDataRemoveStudent
} from "../../redux/student/action";

import HeadingSortColumn from "../HeadingSortColumn";

import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";
import queryString from 'query-string';


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
	}

	handleCheck = (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveStudent({
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
							name='checkItem'
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
							to={"/student/" + this.props.obj._id + "/edit"}
						>{!isUndefined(this.props.obj.code) &&
							this.props.obj.code}</Link>
					</span>
				</td>
				<td className='flex'>
					<Link
						className='item-author text-color'
						to={"/student/" + this.props.obj._id + "/edit"}
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
						{this.props.obj.dob &&
							Moment(this.props.obj.dob).format(
								"DD/MM/YYYY"
							)}
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
								"DD/MM/YYYY HH:mm"
							)}
					</span>
				</td>
				<td className="text-right">
					<div className='item-action'>
						<a title="Reset mật khẩu"
							onClick={async (e) =>
								await this.props.hotResetPassword(this.props.obj._id)
							}
							className='mr-14'
						>
							<img src="/assets/img/icon-dashboard.svg" alt="" />
						</a>
						<a title="Xoá"
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

class Student extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: "",
			page: 1,
			activePage: 1,
			keyword: "",
			ids: [],
			checkAll: false,
			type: "ADD",
			payment_method: "BANK_TRANSFER",
			total: "",
			status: "ACTIVE",
			sort_key: "",
			sort_value: ""
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
						handleCheckIds={this.handleCheckIds}
						hotResetPassword={this.props.hotResetPassword}
						listStudent={this.props.listStudent}
						onDeleteOne={this.onDeleteOne}
						addDataRemoveStudent={this.props.addDataRemoveStudent}
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
			this.setState({
				ids: []
			})
		}
	}

	async componentDidMount() {
		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			status: params.status ? params.status : "",
			sort_key: params.sort_key ? params.sort_key : null,
			sort_value: params.sort_value ? params.sort_value : null,
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
		})

		this.getData(this.state.activePage)
	}

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			limit: this.state.limit,
			status: this.state.status,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
		};

		params.page = pageNumber;

		await this.props.listStudent(params);
	};


	resetPassword = (id) => {
		if (window.confirm('Bạn chắc chắn muốn reset về mật khẩu mặc định?')) {
			this.props.hotResetPassword(id);
		}
	};


	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword, page, limit } = this.state;

		this.props.history.push(`/student?keyword=${keyword}&page=${page}&limit=${limit}`);

		await this.getData(1);
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.setState({
			page: pageNumber
		});

		let { keyword, page, limit } = this.state;

		this.props.history.push(`/student?keyword=${keyword}&page=${page}&limit=${limit}`);
		
		await this.getData(pageNumber);
	};

	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveStudent;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		if (data.length !== 0) {
			await this.props.deleteStudent(data);
			await this.props.listStudent(this.getData());
		}

		if (inputs) {
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].checked = false;
			}
		}
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});

		let { keyword, page, limit } = this.state;

		this.props.history.push(`/student?keyword=${keyword}&page=${page}&limit=${limit}`);

		await this.getData(1);
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}
	}

	handleCheckAll = async (e) => {
		var inputs = document.querySelectorAll('.checkInputItem');
		var flag = false;

		if (e.target.checked) {
			flag = true;
		}

		let _ids = [];
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
		})
	};

	handleCheckIds = async (id, type = '') => {
		const _ids = this.state.ids;
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
		})
	}

	onChangeCredit = async (e) => {
		var name = e.target.name;
		var value = e.target.value;

		this.setState({
			[name]: value
		})
	}

	onHandleCredit = async (e) => {
		e.preventDefault();
		const data = {
			user_ids: this.state.ids,
			type: this.state.type,
			payment_method: this.state.payment_method,
			total: this.state.total
		};
		if (data.total !== '') {
			this.props.onSetCredit(data);
		} else {
			notification.warning({
				message: 'Vui lòng nhập vào số tiền cần nạp !',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
		}
	}

	resetInputValue = (e) => {
		var formCredit = document.getElementById('form-credit');
		var input = formCredit.querySelector('input');
		// var select = formCredit.querySelectorAll('select');
		// for (var i = 0; i < select.length; i++) {
		// 	select[i].value = '';
		// }
		input.value = '';

		this.setState({
			total: ""
		})
	}

	handleDeleteAll = async (e) => {
		let data = this.state.ids;

		if (data.length === 0) {
			notification.warning({
				message: 'Chưa chọn học sinh nào !',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
		}
	}

	sort = async (event) => {
		const { classList } = event.target;

		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});



		let { keyword, sort_key, sort_value, status, page, limit } = this.state;

		this.props.history.push(`/student?keyword=${keyword}&status=${status}&page=${page}&limit=${limit}&sort_key=${sort_key}&sort_value=${sort_value}`);

		await this.getData(1);
		
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
				{/* <div className='page-hero page-container' id='page-hero'>
					<div className='padding d-flex'>
						<div className='page-title'>
							<h2 className='text-md text-highlight'>Học sinh</h2>
							<small className='text-muted'>
								Quản lý danh sách học sinh của bạn
							</small>
						</div>
						<div className='flex' />
						{this.state.ids.length > 0 ?
							<div style={{ marginRight: "15px" }}>
								<button
									// onClick={this.onResetValueWatchTime}
									className='btn btn-sm mr-15 text-white btn-primary'
									data-toggle='modal'
									data-target="#modal-credit"
									data-toggle-class='fade-down'
									data-toggle-class-target='.animate'
									title='Nạp tiền cho học sinh'
									id='btn-credit'
								>
									Nạp tiền cho học sinh
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
										className='feather feather-file-plus mx-2'
									>
										<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
										<polyline points='14 2 14 8 20 8' />
										<line x1={12} y1={18} x2={12} y2={12} />
										<line x1={9} y1={15} x2={15} y2={15} />
									</svg>
								</button>
							</div> : null}
						<div>
							<a
								className='btn btn-sm btn-primary text-muted'
								href='/student/create'
							>
								<span className='d-none d-sm-inline mx-1'>
									Thêm mới
								</span>
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
									className='feather feather-arrow-right'
								>
									<line x1={5} y1={12} x2={19} y2={12} />
									<polyline points='12 5 19 12 12 19' />
								</svg>
							</a>
						</div>
					</div>
				</div> */}
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<h2 className="text-md text-highlight sss-page-title">Quản lý thành viên</h2>
						<div className='block-table-student'>
							<div className='toolbar'>
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

							<div className='row'>
								<div className='col-sm-12'>
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
													{
														this.state.ids.length !== 0
														&&
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
													}
												</th>
												<HeadingSortColumn
													name="code"
													content="Mã"
													width={100}
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="fullname"
													content="Họ và tên"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="phone"
													content="Số điện thoại"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="email"
													content="Email"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="dob"
													content="Ngày sinh"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="status"
													content="Trạng thái"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="updated_at"
													content="Ngày cập nhật"
													width={150}
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<th className="text-right">
													Thao tác
												</th>
											</tr>
										</thead>
										<tbody>{this.fetchRows()}</tbody>
									</table>
								</div>
							</div>

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


				{/*  Modal Credit */}
				<div className="modal fade" id="modal-credit" data-backdrop="static" data-keyboard="false">
					<div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<span className="title text-md">Form Nạp Credit Cho Học Sinh</span>
								<button type="button" onClick={this.resetInputValue} className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div className="modal-body">
								<form id="form-credit" onSubmit={this.onHandleCredit}>
									<div className="form-group">
										<label>Type</label>
										<select className="form-control" name="type" onChange={this.onChangeCredit}>
											<option value="ADD">Cộng Credit</option>
											<option value="SUB">Trừ Credit</option>
										</select>
									</div>
									<div className="form-group">
										<label>Payment_method</label>
										<select className="form-control" name="payment_method" onChange={this.onChangeCredit}>
											<option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
											<option value="COD">COD</option>
										</select>
									</div>
									<div className="form-group">
										<label>Total</label>
										<input type="text" name="total" onChange={this.onChangeCredit} className="form-control" placeholder="Nhập vào số tiền cần nạp" />
									</div>
									<div className="btn-group">
										<button type="button" onClick={this.resetInputValue} data-dismiss="modal" className="btn btn-warning cancel">Hủy bỏ</button>
										<button type="submit" className="btn btn-primary confirm">Xác nhận</button>
									</div>
								</form>
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
		dataRemoveStudent: state.student.dataRemoveStudent,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listStudent, deleteStudent, checkAll, hotResetPassword, onSetCredit, addDataRemoveStudent },
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Student)
);
