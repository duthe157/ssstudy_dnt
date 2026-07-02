import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { webURL } from "../../config/config";
import Moment from "moment";
import { notification, DatePicker } from "antd";

import Pagination from "react-js-pagination";

import CreateSchedule from "./CreateSchedule";

import {
	listSchedule,
	showSchedule,
	addDelete,
	deleteSchedule,
	checkAll,
	listSubject,
	listClassroom,
} from "../../redux/schedule/action";
import { isUndefined } from "util";
import { isNull } from "lodash";
import EditSchedule from "./EditSchedule";

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
				<td>
					{!isUndefined(this.props.obj.day_of_week) &&
						this.props.obj.day_of_week}
				</td>
				<td className='text-left'>
					<span className='item-amount d-none d-sm-block text-sm'>
						{!isUndefined(this.props.obj.classroom) &&
							this.props.obj.classroom.name}
					</span>
				</td>
				<td>
					{!isUndefined(this.props.obj.support_teacher) &&
						!isNull(this.props.obj.support_teacher) &&
						this.props.obj.support_teacher}
				</td>
				<td className='text-right'>
					{!isUndefined(this.props.obj.started_at) &&
						this.props.obj.started_at}
				</td>

				<td className='text-right'>
					{!isUndefined(this.props.obj.finished_at) &&
						this.props.obj.finished_at}
				</td>
				<td className='text-right'>
					{!isUndefined(this.props.obj.note) && this.props.obj.note}
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
							<button
								onClick={(e) =>
									this.props.showSchedule(this.props.obj._id)
								}
								className='dropdown-item trash'
								data-toggle='modal'
								data-target='#edit-schedule'
								data-toggle-class='fade-down'
								data-toggle-class-target='.animate'
							>
								Sửa
							</button>
							<div className='dropdown-divider' />
							<button
								onClick={(e) =>
									this.props.addDelete(this.props.obj._id)
								}
								className='dropdown-item trash'
								data-toggle='modal'
								data-target='#delete-bill'
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
class Schedule extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: "",
			ids: [],
			checkAll: false,
			subject_id: "",
			classroom_id: "",
		};
	}

	fetchRows() {
		if (this.props.schedules instanceof Array) {
			return this.props.schedules.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDelete={this.props.addDelete}
						showSchedule={this.props.showSchedule}
						listBill={this.props.listBill}
						getData={this.getData}
						check={this.props.check}
					/>
				);
			});
		}
	}

	onChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;

		await this.setState({
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
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.classroom_id != null) {
			data["classroom_id"] = this.state.classroom_id;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.listSchedule(this.getData());
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
		this.props.listSchedule(this.getData());
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.props.listSchedule(this.getData(pageNumber));
	};

	handleDelete = async () => {
		const data = {
			ids: this.props.ids,
		};
		if (data.ids.length !== 0) {
			await this.props.deleteSchedule(data);
			await this.props.listSchedule(this.getData());
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
		await this.props.listSchedule(this.getData());
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

	changeDateStart = (date, dateString) => {
		if (date !== null) {
			this.setState({
				bill_from_date: date.format("YYYY/MM/DD HH:mm"),
			});
		}
	};

	changeDateEnd = (date, dateString) => {
		if (date !== null) {
			this.setState({
				bill_to_date: date.format("YYYY/MM/DD HH:mm"),
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
								Thời khóa biểu
							</h2>
						</div>
						<div className='flex' />
						<div>
							<button
								className='btn btn-primary btn-sm mr-2'
								data-toggle='modal'
								data-target='#add-class'
								data-toggle-class='fade-down'
								data-toggle-class-target='.animate'
								title='Thêm thời khóa biểu'
								id='btn-trash'
							>
								Tạo mới
							</button>
						</div>
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
											data-target='#delete-bill'
											data-toggle-class='fade-down'
											data-toggle-class-target='.animate'
											title='Xóa'
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
											title='Xóa'
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
												<th>Thứ</th>
												<th className='text-left'>
													Lớp học
												</th>
												<th>Trợ giảng</th>
												<th className='text-right'>
													Giờ bắt đầu
												</th>
												<th className='text-right'>
													Giờ kết thúc
												</th>
												<th className='text-right'>
													Ghi chú
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
					{/* modal them lop */}
					<div
						id='add-class'
						className='modal fade'
						data-backdrop='true'
						style={{ display: "none", minWidth: "1000px" }}
						aria-hidden='true'
					>
						<CreateSchedule />
					</div>

					{/* modal cap nhat tkb */}
					<div
						id='edit-schedule'
						className='modal fade'
						data-backdrop='true'
						style={{ display: "none", minWidth: "1000px" }}
						aria-hidden='true'
					>
						<EditSchedule />
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		schedules: state.schedule.schedules,
		limit: state.schedule.limit,
		page: state.schedule.page,
		total: state.schedule.total,
		ids: state.schedule.ids,
		check: state.schedule.checkAll,

		classrooms: state.schedule.classrooms,
		subjects: state.schedule.subjects,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listSchedule,
			deleteSchedule,
			addDelete,
			checkAll,
			showSchedule,
			listSubject,
			listClassroom,
		},
		dispatch
	);
}

let ScheduleContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Schedule)
);

export default ScheduleContainer;
