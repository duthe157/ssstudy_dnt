import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
	listClassroom,
	checkInputItem,
	deleteClassroom,
	checkAll,
	addDataRemoveClass,
	updateMetaData
} from "../../redux/classroom/action";

import HeadingSortColumn from "../HeadingSortColumn";


import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";
import queryString from 'query-string';
import { listAdmin } from "../../redux/student/action";
class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			show_on_cart: false,
			status: false,
			is_featured: false,
			ordering: 0,
		};
	}

	async componentDidMount() {
		this.setState({
			show_on_cart: this.props.obj.show_on_cart ? this.props.obj.show_on_cart : false,
			is_featured: this.props.obj.is_featured ? this.props.obj.is_featured : false,
			ordering: this.props.obj.ordering,
			status: this.props.obj.status
		});
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
		this.props.addDataRemoveClass({
			ids: this.props.obj._id
		})
	};
	handleCheckBox = (e) => {
		if (e.target.checked) {
			this.props.handleCheckedIds(this.props.obj._id, 'add');
			this.setState({
				check: e.target.checked
			});
		} else {
			this.props.handleCheckedIds(this.props.obj._id, 'remove');
			this.setState({
				check: e.target.checked
			});
		}
	}

	handleChangeOrdering = async e => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		const data = {
			id: this.props.obj._id,
			ordering: this.state.ordering,
			status: this.state.status,
			is_featured: this.state.is_featured,
		};

		await this.props.updateMetaData(data);
	};

	handleChangeStatus = async e => {
		e.preventDefault();
		var name = e.target.name;
		var checke = e.target.checked;

		await this.setState({
			[name]: checke,
		});

		const data = {
			id: this.props.obj._id,
			status: this.state.status,
			is_featured: this.state.is_featured,
			ordering: this.state.ordering,
		};

		await this.props.updateMetaData(data);
	};

	handleChangeFeatured = async e => {
		e.preventDefault();
		var name = e.target.name;
		var checke = e.target.checked;

		await this.setState({
			[name]: checke,
		});

		const data = {
			id: this.props.obj._id,
			is_featured: this.state.is_featured,
			status: this.state.status,
			ordering: this.state.ordering,
		};
		await this.props.updateMetaData(data);
	};

	render() {
		if (this.props.obj) {
			return (
				<tr className='v-middle table-row-item' data-id={17}>
					<td>
						<label className='ui-check m-0'>
							<input
								type='checkbox'
								name='id'
								className="checkInputItem"
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
								to={"/classroom/" + this.props.obj._id + "/edit"}
							>{!isUndefined(this.props.obj.code) &&
								this.props.obj.code}
							</Link>
						</span>
					</td>
					<td className='flex'>
						<Link
							className='item-author text-color'
							to={"/classroom/" + this.props.obj._id + "/edit"}
						>
							{this.props.obj.name}
						</Link>
					</td>
					<td>
						<span className='item-amount d-none d-sm-block text-sm'>
							{this.props.obj.subject.name}
						</span>
					</td>
					<td>
						<span className='item-amount d-none d-sm-block text-sm'>
							{this.props.obj.teacher}
						</span>
					</td>
					<td className="text-left">
						<span className="item-amount d-none d-sm-block text-sm">
							<label className="ui-switch ui-switch-md info m-t-xs">
								<input
									type="checkbox"
									name="status"
									value={this.props.obj._id}
									checked={this.state.status === true ? 'checked' : ''}
									onChange={this.handleChangeStatus}
								/>{' '}
								<i />
							</label>
						</span>
					</td>
					<td className="text-left">
						<span className="item-amount d-none d-sm-block text-sm">
							<label className="ui-switch ui-switch-md info m-t-xs">
								<input
									type="checkbox"
									name="is_featured"
									value={this.props.obj._id}
									checked={this.state.is_featured === true ? 'checked' : ''}
									onChange={this.handleChangeFeatured}
								/>{' '}
								<i />
							</label>
						</span>
					</td>
					<td className="text-left">
						<input type="number" className="form-control" name="ordering" value={this.state.ordering} onChange={this.handleChangeOrdering} />
					</td>
					<td>
						<span className='item-amount d-none d-sm-block text-sm'>
							{this.props.obj.updated_at &&
								Moment(this.props.obj.updated_at).format(
									"DD/MM/YYYY HH:mm:ss"
								)}
						</span>
					</td>
					<td className="text-right">
						<div className='item-action'>
							<Link
								className='mr-14'
								style={{ cursor: "pointer" }}
								data-toggle='tooltip'
								title='Chỉnh sửa'
								to={
									"/classroom/" +
									this.props.obj._id +
									"/edit"
								}
							>
								<img src="/assets/img/icon-edit.svg" alt="" />
							</Link>
							<Link
								className='mr-14'
								style={{ cursor: "pointer" }}
								data-toggle='tooltip'
								title='Mã truy cập'
								to={
									"/classroom/" +
									this.props.obj._id +
									"/code"
								}
							>
								<img src="/assets/img/icon-access-code.svg" alt="" />
							</Link>
							<Link
								className='mr-14'
								style={{ cursor: "pointer" }}
								data-toggle='tooltip'
								title='Báo cáo điểm'
								to={
									"/classroom/" +
									this.props.obj._id +
									"/report"
								}
							>
								<img src="/assets/img/icon-chart.svg" alt="" />
							</Link>
							<Link
								className='mr-14'
								style={{ cursor: "pointer" }}
								data-toggle='tooltip'
								title='Thành viên'
								to={
									"/classroom/" +
									this.props.obj._id +
									"/member"
								}
							>
								<img src="/assets/img/icon-member.svg" alt="" />
							</Link>
							<div
								data-toggle='tooltip'
								title='Xóa'
							>
								<a
									onClick={this.handleCheck}
									data-toggle='modal'
									data-target='#delete-classroom'
									data-toggle-class='fade-down'
									data-toggle-class-target='.animate'
								>
									<img src="/assets/img/icon-delete.svg" alt="" />
								</a>
							</div>
						</div>
					</td>
				</tr>
			);
		}
	}
}

class Classroom extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: 20,
			keyword: "",
			is_online: true,
			page: 1,
			activePage: 1,
			ids: [],
			checkAll: false,
			searchItem: [],
			level: "",
			teacher_id: null,
			sort_key: "",
			sort_value: ""
		};
	}

	fetchRows() {
		if (this.props.classrooms instanceof Array) {
			return this.props.classrooms.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						checkInputItem={this.props.checkInputItem}
						check={this.props.check}
						handleCheckedIds={this.handleCheckedIds}
						onDeleteOne={this.onDeleteOne}
						addDataRemoveClass={this.props.addDataRemoveClass}
						updateMetaData={this.props.updateMetaData}
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

	handleCheckedIds = (id, type = '') => {
		var _ids = this.state.ids;
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

		this.setState({
			ids: _ids
		})
	}

	onDeleteOne = (onResetIds) => {
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
			is_online: true,
			level: params.level ? params.level : "",
			teacher_id: params.teacher_id ? params.teacher_id : null,
			sort_key: params.sort_key ? params.sort_key : null,
			sort_value: params.sort_value ? params.sort_value : null,
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
		})

		const dataListAdmin = {
			user_group: "TEACHER",
			limit: 100,
		};
		await this.props.listAdmin(dataListAdmin);

		this.getData(this.state.activePage)
	}

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			is_online: this.state.is_online,
			level: this.state.level,
			teacher_id: this.state.teacher_id,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
			limit: this.state.limit,
			page: pageNumber
		};

		await this.props.listClassroom(params);

	};

	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword, limit, page, level, teacher_id } = this.state;

		this.props.history.push(`/classroom-online?keyword=${keyword}&page=${page}&limit=${limit}&level=${level}&teacher_id=${teacher_id}`);

		await this.getData(1);
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.setState({
			page: pageNumber
		})


		let { keyword, limit, page, level, teacher_id } = this.state;

		this.props.history.push(`/classroom-online?keyword=${keyword}&page=${page}&limit=${limit}&level=${level}&teacher_id=${teacher_id}`);

		await this.getData(pageNumber);
	};

	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveClass;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteClassroom(data);
		await this.props.listClassroom(this.getData());

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		let { keyword, limit, page, level, teacher_id } = this.state;

		this.props.history.push(`/classroom-online?keyword=${keyword}&page=${page}&limit=${limit}&level=${level}&teacher_id=${teacher_id}`);

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

	handleDeleteAll = () => {
		var data = this.state.ids;

		if (data.length === 0) {
			notification.warning({
				message: 'Chưa chọn mục nào !',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
		}
	}

	fetchTeacherRows() {
		if (this.props.teachers instanceof Array) {
			return this.props.teachers.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id.toString()}>
						{obj.fullname}
					</option>
				);
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



		let { keyword, level, teacher_id, sort_key, sort_value } = this.state;

		this.props.history.push(`/classroom-online?keyword=${keyword}&level=${level}&teacher_id=${teacher_id}&sort_key=${sort_key}&sort_value=${sort_value}`);

		await this.getData(1);

	}

	render() {


		let { sort_key, sort_value } = this.state;

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
						<h2 className='text-md text-highlight sss-page-title'>
							Danh sách Lớp học/Khóa học
						</h2>
						<div className='block-table-classroom'>
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
										<div className='ml-16'>
											<select
												className="custom-select"
												value={this.state.level}
												name="level"
												onChange={this.onChange}
											>
												<option value="">Cấp học</option>
												<option value="1">Lớp 1</option>
												<option value="2">Lớp 2</option>
												<option value="3">Lớp 3</option>
												<option value="4">Lớp 4</option>
												<option value="5">Lớp 5</option>
												<option value="6">Lớp 6</option>
												<option value="7">Lớp 7</option>
												<option value="8">Lớp 8</option>
												<option value="9">Lớp 9</option>
												<option value="10">Lớp 10</option>
												<option value="11">Lớp 11</option>
												<option value="12">Lớp 12</option>
											</select>
										</div>
										<div className='ml-16'>
											<select
												className="custom-select"
												value={this.state.teacher_id}
												name="teacher_id"
												onChange={this.onChange}
											>
												<option value="">Giáo viên</option>
												{this.fetchTeacherRows()}
											</select>
										</div>
										<div className='btn-filter ml-16'>
											<button type='sumbit'>
												<img src='/assets/img/icon-filter.svg' className='mr-10' alt='' />
												<span>Lọc kết quả</span>
											</button>
										</div>
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
															data-target="#delete-classroom"
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
												<HeadingSortColumn
													name="code"
													content="Mã lớp"
													width={50}
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="name"
													content="Tên lớp"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="subject.id"
													content="Môn học"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="teacher"
													content="Giáo viên"
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
													name="is_featured"
													content="Nổi bật"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="ordering"
													content="Thứ tự"
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
								id='delete-classroom'
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
		classrooms: state.classroom.classrooms,
		classroom: state.classroom ? state.classroom.classroom : {},
		limit: state.classroom.limit,
		page: state.classroom.page,
		total: state.classroom.total,
		ids: state.classroom.ids,
		check: state.classroom.checkAll,
		dataRemoveClass: state.classroom.dataRemoveClass,
		teachers: state.student.students,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listClassroom, deleteClassroom, checkInputItem, checkAll, addDataRemoveClass, updateMetaData, listAdmin },
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Classroom)
);
