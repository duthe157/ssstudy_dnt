import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
	listRegistration,
	updateRegistration,
	deleteRegistration,
	addDelete,
	checkAll,
} from "../../redux/register/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			is_called: false,
			is_student: false,
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.check !== nextProps.check) {
			this.setState({
				check: nextProps.check,
			});
		}
		if (this.props.obj.is_called !== nextProps.obj.is_called) {
			this.setState({
				is_called: nextProps.obj.is_called,
			});
		}
		if (this.props.obj.is_student !== nextProps.obj.is_student) {
			this.setState({
				is_student: nextProps.obj.is_student,
			});
		}
	}

	handleCheck = (e) => {
		if (e.target.checked) {
			this.props.addDelete(this.props.obj._id, "add");
			this.setState({
				check: e.target.checked,
			});
		} else {
			this.props.addDelete(this.props.obj._id, "remove");
			this.setState({
				check: e.target.checked,
			});
		}
	};

	componentDidMount() {
		this.setState({
			is_called: this.props.obj.is_called,
			is_student: this.props.obj.is_student,
			check: false,
		});
	}

	getData = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.props.limit,
			is_delete: false,
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		return data;
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.checked;
		await this.setState({
			[name]: value,
		});
		const data = {
			id: this.props.obj._id,
			is_called: this.state.is_called,
			is_student: this.state.is_student,
		};
		await this.props.updateRegistration(data);
		await this.props.listRegistration(this.getData());
	};

	render() {
		return (
			<tr className='v-middle' data-id={17}>
				<td>
					<label className='ui-check m-0'>
						<input
							type='checkbox'
							name='id'
							onChange={this.handleCheck}
							checked={this.state.check === true ? "checked" : ""}
						/>{" "}
						<i />
					</label>
				</td>
				<td className='flex'>
					<Link
						className='item-author text-color'
						to={"/registration/" + this.props.obj._id + "/edit"}
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
						{this.props.obj.subject}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						<label className='ui-switch ui-switch-md info m-t-xs'>
							<input
								type='checkbox'
								name='is_called'
								checked={this.state.is_called ? "checked" : ""}
								onChange={this.handleChange}
							/>{" "}
							<i />
						</label>
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						<label className='ui-switch ui-switch-md info m-t-xs'>
							<input
								type='checkbox'
								name='is_student'
								checked={this.state.is_student ? "checked" : ""}
								onChange={this.handleChange}
							/>{" "}
							<i />
						</label>
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
								to={
									"/registration/" +
									this.props.obj._id +
									"/edit"
								}
							>
								Sửa
							</Link>
							<div className='dropdown-divider' />
							<button
								onClick={(e) =>
									this.props.addDelete(this.props.obj._id)
								}
								className='dropdown-item trash'
								data-toggle='modal'
								data-target='#delete-video'
								data-toggle-class='fade-down'
								data-toggle-class-target='.animate'
							>
								Xóa
							</button>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

class ListRegister extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: "",
			checkAll: false,
			is_student: "",
			is_called: "",
			keyword: "",
		};
	}

	fetchRows() {
		if (this.props.registrations instanceof Array) {
			return this.props.registrations.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDelete={this.props.addDelete}
						listRegistration={this.props.listRegistration}
						updateRegistration={this.props.updateRegistration}
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

	getData = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.props.limit,
			is_delete: false,
		};
		if (this.state.is_student !== "") {
			data["is_student"] = this.state.is_student;
		}
		if (this.state.keyword !== "") {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.is_called !== "") {
			data["is_called"] = this.state.is_called;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.listRegistration(this.getData());
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
			});
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listRegistration(this.getData());
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.props.listRegistration(this.getData(pageNumber));
	};

	handleDelete = async () => {
		const data = {
			ids: this.props.ids,
		};
		if (data.ids.length !== 0) {
			await this.props.deleteRegistration(data);
			await this.props.listRegistration(this.getData());
		} else {
			notification.warning({
				message: "Chưa chọn mục nào !",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listRegistration(this.getData());
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}
	}

	handleCheckAll = (e) => {
		if (e.target.checked) {
			this.props.checkAll(true);
			this.setState({
				checkAll: e.target.checked,
			});
		} else {
			this.props.checkAll(false);
			this.setState({
				checkAll: e.target.checked,
			});
		}
	};

	handleChangeSelect = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listRegistration(this.getData());
	};

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
				<div className='page-hero page-container' id='page-hero'>
					<div className='padding d-flex'>
						<div className='page-title'>
							<h2 className='text-md text-highlight'>
								Danh sách đăng ký
							</h2>
							<small className='text-muted'>
								Quản lý danh sách học sinh đăng ký
							</small>
						</div>
						<div className='flex' />
						<div></div>
					</div>
				</div>
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<div className='mb-5'>
							<div className='toolbar'>
								<div className='btn-group'>
									{this.props.ids.length !== 0 ? (
										<button
											className='btn btn-icon'
											data-toggle='modal'
											data-target='#delete-video'
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
								</div>
								<form className='flex' onSubmit={this.onSubmit}>
									<div className='input-group'>
										<input
											type='text'
											className='form-control form-control-theme keyword-custom'
											placeholder='Nhập từ khoá tìm kiếm...'
											name='keyword'
											onChange={this.onChange}
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
										<select
											className='custom-select ml-2'
											value={this.state.is_student}
											name='is_student'
											onChange={this.handleChangeSelect}
										>
											<option value=''>
												-- Trạng thái tham gia --
											</option>
											<option value='1'>
												Đã tham gia
											</option>
											<option value='0'>
												Chưa tham gia
											</option>
										</select>
										<select
											className='custom-select ml-2'
											value={this.state.is_called}
											name='is_called'
											onChange={this.handleChangeSelect}
										>
											<option value=''>
												-- Trạng thái gọi --
											</option>
											<option value='1'>Đã gọi</option>
											<option value='0'>Chưa gọi</option>
										</select>
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
															onChange={
																this
																	.handleCheckAll
															}
															checked={
																this.state
																	.checkAll ===
																true
																	? "checked"
																	: ""
															}
														/>{" "}
														<i />
													</label>
												</th>
												<th>Họ và tên</th>
												<th>Số điện thoại</th>
												<th>Email</th>
												<th>Môn học</th>
												<th>Gọi điện</th>
												<th>Tham gia</th>
												<th width='150px'>
													Thời gian đăng ký
												</th>
												<th width='50px' />
											</tr>
										</thead>
										<tbody>{this.fetchRows()}</tbody>
									</table>
								</div>
							</div>

							<div className='row listing-footer'>
								<div className='col-sm-2'>
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
								<div className='col-sm-5 showing-text'>
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
								id='delete-video'
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
		registrations: state.register.registrations,
		limit: state.register.limit,
		page: state.register.page,
		total: state.register.total,
		ids: state.register.ids,
		check: state.register.checkAll,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listRegistration,
			deleteRegistration,
			addDelete,
			checkAll,
			updateRegistration,
		},
		dispatch
	);
}
withRouter(connect(mapStateToProps, mapDispatchToProps)(Row));
export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ListRegister)
);
