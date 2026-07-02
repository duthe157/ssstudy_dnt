import React, { Component } from "react";
import Moment from "moment";
import { notification, DatePicker } from "antd";

import Pagination from "react-js-pagination";
import {
	listBill,
	addDelete,
	deleteBill,
	checkAll,
	resetStateBill,
	addDataRemoveBill
} from "../../redux/bill/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";

import { listClassroom } from "../../redux/schedule/action";
import { listSubject } from "../../redux/subject/action";

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

	handleCheck = (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveBill({
			ids: this.props.obj._id
		})
	};

	handleCheckBox = e => {
		if (e.target.checked) {
			this.props.handleCheckedIds(this.props.obj._id, 'add');
			this.setState({
				check: e.target.checked
			})
		} else {
			this.props.handleCheckedIds(this.props.obj._id, 'remove');
			this.setState({
				check: e.target.checked
			})
		}
	};

	renderPaymentMethod(method) {
		const paymentMethod = {};
		paymentMethod['CASH'] = 'Tiền mặt';
		paymentMethod['BANK_TRANSFER'] = 'Chuyển khoản';
		if (method)
			return paymentMethod[method];
		return null;
	}

	render() {
		const totalPay = this.props.obj.total;
		return (
			<tr className='v-middle' data-id={17}>
				<td>
					<label className='ui-check m-0'>
						{!this.props.obj.deleted_at ?
							<><input
								type='checkbox'
								name='id'
								className="checkInputItem"
								onChange={this.handleCheckBox}
								value={this.props.obj._id}
							/>{" "}
								<i /></> : ''}
					</label>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						<Link
							className='item-author text-color'
							to={"/bill-refund/" + this.props.obj._id + "/edit"}
						>
							{!isUndefined(this.props.obj.code) &&
								this.props.obj.code}
						</Link>
						{this.props.obj.deleted_at ? <span style={{ color: "red", fontWeight: 600 }}> (Đã hủy)</span> : ''}
					</span>
				</td>
				<td className='text-left'>
					<Link
						className='item-author text-color'
						to={"/student/" + this.props.obj.user.id + "/edit"}
					>
						{this.props.obj.user.name}
					</Link>
				</td>
				<td className='text-left'>
					<Link
						className='item-author text-color'
						to={"/student/" + this.props.obj.user.id + "/edit"}
					>
						{this.props.obj.user.code}
					</Link>
				</td>
				<td className='text-left'>
					{this.props.userInfos && this.props.userInfos[this.props.obj.user.id] ? this.props.userInfos[this.props.obj.user.id].phone : null}
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.type === "PT" ? "Phiếu thu" : ""}
					</span>
				</td>
				<td className='text-right'>
					<span className='item-amount d-none d-sm-block text-sm'>
						{totalPay.toLocaleString("en-EN", {
							minimumFractionDigits: 0,
						})}
					</span>
				</td>
				<td className='text-center'>
					{this.props.obj.payment_method ? this.renderPaymentMethod(this.props.obj.payment_method) : ''}
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.creator ? this.props.obj.creator.name : ""}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.billed_at &&
							Moment(this.props.obj.billed_at).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.created_at &&
							Moment(this.props.obj.created_at).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
					</span>
				</td>
				<td>
					<div className='item-action dropdown'>
						<a
							href='/'
							data-toggle='dropdown'
							className='text-muted'
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
								className='feather feather-more-vertical'
							>
								<circle cx={12} cy={12} r={1} />
								<circle cx={12} cy={5} r={1} />
								<circle cx={12} cy={19} r={1} />
							</svg>
						</a>
						<div
							className='dropdown-menu dropdown-menu-right bg-white'
							role='menu'
						>
							<Link
								className='dropdown-item'
								to={"/bill-refund/" + this.props.obj._id + "/edit"}
							>
								{!this.props.obj.deleted_at ? "Sửa" : 'Xem đơn đã hủy'}
							</Link>

							{!this.props.obj.deleted_at ?
								<div> <div className='dropdown-divider' />
									<button
										onClick={this.handleCheck}
										className='dropdown-item trash'
										data-toggle='modal'
										data-target='#delete-bill'
										data-toggle-class='fade-down'
										data-toggle-class-target='.animate'
									>
										Xóa
									</button></div> : null}

						</div>
					</div>
				</td>
			</tr>
		);
	}
}

class BillRefund extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: "",
			ids: [],
			checkAll: false,
			classroom_id: "",
			bill_from_date: "",
			bill_to_date: "",
		};
	}

	fetchRows() {
		if (this.props.bills instanceof Array) {
			return this.props.bills.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						userInfos={this.props.userInfos}
						index={i}
						listBill={this.props.listBill}
						getData={this.getData}
						check={this.props.check}
						handleCheckedIds={this.handleCheckedIds}
						addDataRemoveBill={this.props.addDataRemoveBill}
						onDeleteOne={this.onDeleteOne}
					/>
				);
			});
		}
	}

	onDeleteOne = async (onResetIds) => {
		if (onResetIds) {
			await this.setState({
				ids: []
			})
		}
	}

	handleCheckedIds = async (id, type = '') => {
		const _ids = this.state.ids;
		if (type === 'add') {
			if (_ids.indexOf(id) < 0) {
				_ids.push(id);
			}
		}
		if (type === 'remove') {
			let index = _ids.indexOf(id);
			if (index > -1) {
				_ids.splice(index, 1);
			}
		}

		await this.setState({
			ids: _ids
		})

	}

	onChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
		if (name === "subject_id") {
			await this.setState({
				classroom_id: "",
			});
		}
	};

	getData = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.state.limit,
			type: "HOAN_HUY"
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.classroom_id !== "") {
			data["classroom_id"] = this.state.classroom_id;
		}
		if (this.state.bill_from_date != null) {
			data["bill_from_date"] = this.state.bill_from_date;
		}
		if (this.state.bill_to_date != null) {
			data["bill_to_date"] = this.state.bill_to_date;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.listBill(this.getData());
		await this.props.listSubject({ limit: 999 });
		await this.props.listClassroom({ limit: 999 });
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				ids: this.props.ids,
				checkAll: false,
			});
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listBill(this.getData());
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.props.listBill(this.getData(pageNumber));
	};

	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveBill;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteBill(data);
		this.props.listBill(this.getData());

		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}

		await this.setState({
			ids: []
		})
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listBill(this.getData());
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
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].checked = flag;
			if (flag) {
				_ids.push(inputs[i].value);
			} else {
				_ids = [];
			}
		}

		await this.setState({
			ids: _ids
		})
	};

	changeDateStart = (date, dateString) => {
		if (date !== null) {
			this.setState({
				bill_from_date: date.format("YYYY/MM/DD"),
			});
		}
	};

	changeDateEnd = (date, dateString) => {
		if (date !== null) {
			this.setState({
				bill_to_date: date.format("YYYY/MM/DD"),
			});
		}
	};

	fetchRowsSubject = () => {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id.toString()}>
						{obj.name}
					</option>
				);
			});
		}
	};

	fetchOptions = () => {
		if (this.props.classrooms instanceof Array) {
			if (this.state.subject_id !== "") {
				return this.props.classrooms.map((obj, i) => {
					if (obj.subject.id === this.state.subject_id) {
						return (
							<option value={obj._id} key={obj._id.toString()}>
								{obj.name}
							</option>
						);
					}
				});
			}
		}
	};

	componentWillUnmount() {
		this.props.resetStateBill();
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
						<h2 className="text-md text-highlight sss-page-title">Danh sách hoàn hủy</h2>
						<div className='mb-5'>
							<div className='toolbar'>
								{/* <div className='btn-group'>
									{this.props.ids.length !== 0 ? (
										<button
											className='btn btn-icon'
											data-toggle='modal'
											data-target='#delete-bill'
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
											onClick={this.handleDelete}
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
								</div> */}
								<form className='flex' onSubmit={this.onSubmit}>
									<div className='input-group'>
										<input
											type='text'
											className='form-control form-control-theme keyword-custom'
											placeholder='Nhập từ khoá tìm kiếm...'
											onChange={this.onChange}
											name='keyword'
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
										<select
											style={{ maxWidth: 200 }}
											name='subject_id'
											className='custom-select ml-2'
											onChange={this.onChange}
											value={this.state.subject_id}
											ref={(input) =>
												(this.subjectInput = input)
											}
										>
											<option value=''>
												-- Chọn môn --
											</option>
											{this.fetchRowsSubject()}
										</select>
										<select
											style={{ maxWidth: 200 }}
											name='classroom_id'
											className='custom-select ml-2'
											onChange={this.onChange}
											value={this.state.classroom_id}
											ref={(input) =>
												(this.classroomInput = input)
											}
										>
											<option value=''>
												-- Chọn lớp --
											</option>
											{this.fetchOptions()}
										</select>
										<DatePicker
											format={"DD/MM/YYYY"}
											onChange={this.changeDateStart}
											placeholder='Từ ngày'
											className='ml-2'
										/>
										<DatePicker
											format={"DD/MM/YYYY"}
											onChange={this.changeDateEnd}
											placeholder='Đến ngày'
											className='ml-2'
										/>
										<button
											onClick={this.onSubmit}
											className='btn btn-sm btn-primary text-muted ml-2'
										>
											<span className='d-none d-sm-inline mx-1'>
												Tìm kiếm
											</span>
										</button>
									</div>
								</form>
							</div>

							<div className='row'>
								<div className='col-sm-12'>
									<table className='table table-theme table-row v-middle'>
										<thead className='text-muted'>
											<tr>
												<th width="10px">
													<label className="ui-check m-0">
														<input
															type="checkbox"
															name="id"
															onChange={this.handleCheckAll}
														/>{' '}
														<i />
													</label>
													{this.state.ids.length !== 0 && (
														<button
															className="btn btn-icon ml-16"
															data-toggle="modal"
															data-target="#delete-bill"
															data-toggle-class="fade-down"
															data-toggle-class-target=".animate"
															title="Trash"
															id="btn-trash">
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
																className="feather feather-trash text-muted">
																<polyline points="3 6 5 6 21 6" />
																<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
															</svg>
														</button>)
													}
												</th>
												<th>Mã hoá đơn</th>
												<th className='text-left'>
													Họ và tên
												</th>
												<th>Mã học sinh</th>
												<th>Số điện thoại</th>
												<th>Loại hoá đơn</th>
												<th className='text-right'>
													Tiền thanh toán
												</th>
												<th>
													HTTT
												</th>
												<th>Người tạo</th>
												<th>Ngày nộp</th>
												<th>Ngày tạo</th>
												<th width='50px' />
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
								id='delete-bill'
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
		bills: state.bill.bills,
		userInfos: state.bill.userInfos,
		limit: state.bill.limit,
		page: state.bill.page,
		total: state.bill.total,
		ids: state.bill.ids,
		check: state.bill.checkAll,
		classrooms: state.schedule.classrooms,
		subjects: state.subject.subjects,
		dataRemoveBill: state.bill.dataRemoveBill
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listBill,
			deleteBill,
			addDelete,
			checkAll,
			listSubject,
			listClassroom,
			resetStateBill,
			addDataRemoveBill
		},
		dispatch
	);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BillRefund));
