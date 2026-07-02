import React, { Component } from "react";
import Moment from "moment";
import { CSVLink } from "react-csv";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
	listClassroom,
	checkInputItem,
	deleteClassroomCode,
	deleteClassroom,
	checkAll,
	listCode,
	showClassroom,
	downloadExcelData,
} from "../../redux/classroom/action";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";
import ModalCreateCode from "./ModalCreateCode";

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

	render() {
		return (
			<tr className='v-middle' data-id={17}>
				<td>
					<label className='ui-check m-0'>
						<input
							type='checkbox'
							className="checkInputItem"
							value={this.props.obj._id}
							name='id'
							onChange={this.handleCheckBox}
						/>{" "}
						<i />
					</label>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{!isUndefined(this.props.obj.code) &&
							this.props.obj.code}
					</span>
				</td>
				<td className='flex'>
					{
						this.props.obj.user !== null
							?
							<>
								<Link
									className='item-author text-color'
									to={"/student/" + this.props.obj._id + "/edit"}
								>
									{`${this.props.obj.user.name} (${this.props.obj.user.code})`}
								</Link>
							</>
							: ""}
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.is_shared ? "Dùng chung" : this.props.obj.is_used ? "Đã dùng" : "Chưa dùng"}
					</span>
				</td>

				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.updated_at &&
							Moment(this.props.obj.created_at).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
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
							<div className='dropdown-divider' />
							<button
								className='dropdown-item trash'
								data-toggle='modal'
								data-target='#delete-code'
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

class ClassroomCode extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			headers: [],
			limit: "",
			ids: [],
			checkAll: false,

			code: "",
			name: "",
			subject: "",
			teacher: "",
			room: "",
			is_used: "",
			dataCodes: [],
			sharedCode: null,
		};
	}

	downloadExcel = async (e) => {
		await this.props.downloadExcelData({
			classroom_id: this.props.match.params.id,
		});
	};

	/*exportExcel = async() => {
		await this.props.listMember({
			id: this.props.match.params.id,
			page: 1,
			limit: this.state.limit,
			is_export: true
		});
	}*/

	fetchRows() {
		if (this.props.codes instanceof Array) {
			return this.props.codes.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						checkInputItem={this.props.checkInputItem}
						check={this.props.check}
						handleCheckedIds={this.handleCheckedIds}
					/>
				);
			});
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
		if (name === 'is_used') {
			if (value === 'USED') {
				value = 1;
			} else {
				value = 0;
			}
		}
		this.setState({
			[name]: value,
		});

		if (name === 'is_used') {
			const _data = this.getData();
			_data.is_used = value;
			await this.props.listCode(_data);
		}
	};

	getData = (pageNumber = 1) => {
		const data = {
			classroom_id: this.props.match.params.id,
			page: pageNumber,
			limit: this.state.limit,
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.is_used !== "") {
			data.is_used = this.state.is_used;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.showClassroom(this.props.match.params.id);
		if (this.props.classroom) {
			var { code, name, subject, teacher, room } = this.props.classroom;
			this.setState({
				code,
				name,
				subject,
				teacher,
				room,
			});
		}
		await this.props.listCode(this.getData());
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				ids: this.props.ids,
			});
		}

		if (this.props.codes) {
			const sharedCode = this.props.codes.find((ele) => ele.is_shared) || null;
			var headers = [
				{ label: "Mã truy cập", key: "code" },
				{ label: "Người dùng", key: "name" },
				{ label: "Mã người dùng", key: "user_code" },
				{
					label: "Trạng thái",
					key: "is_used",
				},
				{ label: "Ngày tạo", key: "created_at" },
				{ label: "Ngày cập nhật", key: "updated_at" },
			];

			var data = this.props.codes.map((ele) => {
				var newObj = {};
				newObj.code = ele.code;
				newObj.name = ele.user !== null ? ele.user.name : "";
				newObj.user_code = ele.user !== null ? ele.user.code : "";
				newObj.is_used =
					ele.is_used === true ? "Đã sử dụng" : "Chưa sử dụng";
				newObj.created_at = ele.created_at;
				newObj.updated_at = ele.updated_at;
				return newObj;
			});

			this.setState({
				headers,
				data,
				sharedCode,
			});
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listCode(this.getData());
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.props.listCode(this.getData(pageNumber));
	};

	handleDelete = async () => {
		const data = {
			ids: this.state.ids,
		};
		if (data.ids.length !== 0) {
			await this.props.deleteClassroomCode(data);
			await this.props.listClassroom(this.getData());
			await this.props.listCode(this.getData());
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
		await this.props.listCode(this.getData());
	};

	UNSAFE_componentWillReceiveProps = async (nextProps) => {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}

		if (nextProps.codes.length > 0) {
			let dataCodes = nextProps.codes.map((ele, i) => {
				return Object.assign(
					{},
					{
						...ele,
						stt: i + 1,
					}
				);
			});
			await this.setState({
				dataCodes,
				sharedCode: nextProps.codes.find((ele) => ele.is_shared) || null,
			});
		} else {
			await this.setState({
				sharedCode: null,
			});
		}
	}

	handleDeleteSharedCode = async () => {
		if (!this.state.sharedCode || !this.state.sharedCode._id) {
			notification.warning({
				message: "Khoá học chưa có mã dùng chung !",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
			return;
		}
		await this.props.deleteClassroomCode({
			ids: [this.state.sharedCode._id],
		});
		await this.props.listCode(this.getData());
	};

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

	getDataExcel = () => {
		if (this.props.codes) {
			var data = {};

			return data;
		}
	};

	render() {
		let fileName = "MaTruyCap";
		if (this.state.code)
			fileName += "-" + this.state.code;
		fileName += ".csv";

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
					<div className='padding'>
						<h2 className='text-md text-highlight sss-page-title'>
							{`Mã truy cập lớp ${this.state.name} - ${this.state.code}`}
						</h2>
						<div className='flex' />

						<div>

						</div>
						<div className='mb-5'>
							<div className='toolbar'>
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
										<div className='ml-16'>
											<select onChange={this.onChange} name="is_used" className="custom-select ml-2">
												<option value="">Trạng thái</option>
												<option value="NOT_USED">Chưa dùng</option>
												<option value="USED">Đã dùng</option>
											</select>
										</div>
									</div>
								</form>
								<div className="classroom-user-actions">
									<button className='btn btn-sm text-white btn-primary' onClick={this.downloadExcel} type="button" style={{ marginRight: 30 }}>
										Xuất Excel
									</button>

									<button
										className='btn btn-primary btn-sm mr-2'
										data-toggle='modal'
										data-target='#add-class'
										data-toggle-class='fade-down'
										data-toggle-class-target='.animate'
										title='Trash'
										id='btn-trash'
									>
										Tạo mã truy cập
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
									<button
										className='btn btn-danger btn-sm'
										type='button'
										onClick={this.handleDeleteSharedCode}
										disabled={!this.state.sharedCode}
									>
										Xoá mã dùng chung
									</button>
								</div>
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
														this.state.ids.length !== 0 && (
															<button
																className='btn btn-icon btn-white'
																data-toggle='modal'
																data-target='#delete-code'
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
														)
													}
												</th>
												<th>Mã truy cập</th>
												<th>Người dùng</th>
												<th>Trạng thái</th>
												<th width='150px'>Ngày tạo</th>
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
								id='delete-code'
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

							<div
								id='add-class'
								className='modal fade'
								data-backdrop='true'
								style={{ display: "none", minWidth: "1000px" }}
								aria-hidden='true'
							>
								<ModalCreateCode
									classroom_id={this.props.match.params.id}
									sharedCode={this.state.sharedCode}
								/>
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
		classroom: state.classroom.classroom,
		limit: state.classroom.limit,
		page: state.classroom.page,
		total: state.classroom.total,
		ids: state.classroom.ids,
		check: state.classroom.checkAll,
		codes: state.classroom.codes,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listClassroom,
			deleteClassroom,
			deleteClassroomCode,
			checkInputItem,
			checkAll,
			listCode,
			showClassroom,
			downloadExcelData,
		},
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ClassroomCode)
);

