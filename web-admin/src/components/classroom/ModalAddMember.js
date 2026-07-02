import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
	listStudent,
	deleteStudent
} from "../../redux/student/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";
import {
	listMember,
	addDataRemoveMember,
	addMember,
} from "../../redux/classroom/action";

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

	handleCheck = async () => {
		await this.props.addMember({
			student_id: this.props.obj._id,
			classroom_id: this.props.classroom_id,
		});
		await this.props.listMember({
			id: this.props.classroom_id,
		});
	};

	render() {
		return (
			<tr className='v-middle' data-id={17}>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{!isUndefined(this.props.obj.code) &&
							this.props.obj.code}
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
						{this.props.obj.status === "true"
							? "Kích hoạt"
							: "Vô hiệu"}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.updated_at &&
							Moment(this.props.obj.updated_at).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
					</span>
				</td>
				<td>
					<button onClick={this.handleCheck} className='btn btn-icon'>
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
							className='feather feather-plus mx-2'
						>
							<line x1={12} y1={5} x2={12} y2={19} />
							<line x1={5} y1={12} x2={19} y2={12} />
						</svg>
					</button>
				</td>
			</tr>
		);
	}
}

class ModalAddMember extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: "",
			ids: [],
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
						getData={this.getData}
						addMember={this.props.addMember}
						classroom_id={this.props.classroom_id}
						listMember={this.props.listMember}
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
			limit: this.state.limit,
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.listStudent(this.getData());
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				ids: this.props.ids,
			});
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listStudent(this.getData());
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.props.listStudent(this.getData(pageNumber));
	};

	handleDelete = async () => {
		const data = {
			ids: this.props.ids,
		};
		if (data.ids.length !== 0) {
			await this.props.deleteStudent(data);
			await this.props.listStudent(this.getData());
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
		await this.props.listStudent(this.getData());
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
			<div
				className='modal-dialog animate fade-down modal-lg'
				data-class='fade-down' style={{ maxWidth: 1000 }}
			>
				<div className='modal-content'>
					<div className='modal-header'>
						<div className='modal-title text-md'>
							Thêm thành viên vào lớp
						</div>
						<button className='close' data-dismiss='modal'>
							×
						</button>
					</div>
					<div
						className='modal-body'
						style={{
							minHeight: 150,
							display: "flex",
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<div className=''>
							<div className='mb-5'>
								<div className='toolbar'>
									<div className='btn-group'></div>
									<form
										className='flex'
										onSubmit={this.onSubmit}
									>
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
										</div>
									</form>
								</div>

								<div className='row'>
									<div className='col-sm-12'>
										<table className='table table-theme table-row v-middle'>
											<thead className='text-muted'>
												<tr>
													<th>Mã học sinh</th>
													<th>Họ và tên</th>
													<th>Số điện thoại</th>
													<th>Email</th>
													<th>Trạng thái</th>
													<th width='150px'>
														Thời gian cập nhật
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
									<div className='col-sm-10 showing-text'>
										{" "} Tổng số <b>{this.props.total}</b>
									</div>
								</div>
								<div className='row listing-footer'>
									{this.props.total !== 0 ? (
										<div className='col-sm-12 text-right'>
											<Pagination
												activePage={this.props.page}
												itemsCountPerPage={
													this.props.limit
												}
												totalItemsCount={
													this.props.total
												}
												pageRangeDisplayed={10}
												onChange={this.handleChangePage}
											/>
										</div>
									) : (
										<div className=''>
											Không có bản ghi nào
										</div>
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
														Bạn chắc chắn muốn xóa
														bản ghi này chứ?
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
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listStudent,
			deleteStudent,
			listMember,
			addDataRemoveMember,
			addMember,
		},
		dispatch
	);
}

let RowContainer = connect(mapStateToProps, mapDispatchToProps)(Row);
export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ModalAddMember)
);
