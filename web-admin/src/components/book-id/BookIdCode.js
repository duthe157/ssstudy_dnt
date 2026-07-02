import React, { Component } from "react";
import Moment from "moment";
import { CSVLink } from "react-csv";
import { notification, DatePicker } from "antd";
import Pagination from "react-js-pagination";
import {
	listBook,
	checkInputItem,
	deleteCode,
	checkAll,
	listCode,
	showBook,
	downloadExcelData,
} from "../../redux/book-id/action";
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

	handleDelete = () => {
		if (this.props.setDeleteTarget) {
			this.props.setDeleteTarget(this.props.obj._id);
		}
	}

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
						{this.props.obj.is_used ? "Đã sử dụng" : "Chưa sử dụng"}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.activation_date &&
							Moment(this.props.obj.activation_date).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.exprired_date &&
							Moment(this.props.obj.exprired_date).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
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
						{this.props.obj.created_by?.name || "Không xác định !!!"}
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
				<td className='text-right'>
					<div className="item-action">
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleDelete}
								className="c-pointer"
								style={{ cursor: "pointer" }}
								data-toggle="modal"
								data-target="#delete-code"
								data-toggle-class="fade-down"
								data-toggle-class-target=".animate"
							>
								<img src="/assets/img/icon-delete.svg" alt="Xóa" />
							</a>
						</div>
					</div>
				</td>

			</tr>
		);
	}
}

class BookIdCode extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			headers: [],
			limit: "",
			ids: [],
			checkAll: false,
			activation_date: "",
			exprired_date: "",
			created_by: [],
			code: "",
			name: "",
			subject: "",
			book_id: "",
			teacher: "",
			room: "",
			is_used: "",
			dataCodes: [],
			deleteTarget: null,
			start_date: "",
			end_date: "",
			date_type: "created_at"
		};
	}

	setDeleteTarget = (id) => {
		this.setState({ deleteTarget: id });
	}

	clearDeleteTarget = () => {
		this.setState({ deleteTarget: null });
	}

	downloadExcel = async (e) => {
		await this.props.downloadExcelData({
			book_id: this.props.match.params.id,
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
						setDeleteTarget={this.setDeleteTarget}
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
				value = true;
			} else if (value === 'NOT_USED') {
				value = false;
			} else {
				value = "";
			}
		}
		this.setState({
			[name]: value,
		});

		if (name === 'is_used' || name === 'date_type') {
			const _data = this.getData();
			_data[name] = value;
			await this.props.listCode(_data);
		}
	};

	onChangeDate = async (name, dateString) => {
		await this.setState({ [name]: dateString });
		await this.props.listCode(this.getData());
	};

	getData = (pageNumber = 1) => {
		const data = {
			book_id: this.props.match.params.id,
			page: pageNumber,
			limit: this.state.limit,
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.is_used !== "") {
			data.is_used = this.state.is_used;
		}
		if (this.state.start_date) {
			data.start_date = Moment(this.state.start_date, "DD/MM/YYYY").startOf('day').format();
		}
		if (this.state.end_date) {
			data.end_date = Moment(this.state.end_date, "DD/MM/YYYY").endOf('day').format();
		}
		if (this.state.date_type) {
			data.date_type = this.state.date_type;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.showBook(this.props.match.params.id);
		if (this.props.classroom) {
			var { code, name, subject, teacher, room, book_id } = this.props.classroom;
			this.setState({
				code,
				name,
				subject,
				teacher,
				room,
				book_id
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
			var headers = [
				{ label: "Mã truy cập", key: "code" },
				{ label: "Người dùng", key: "name" },
				{ label: "Mã người dùng", key: "user_code" },
				{
					label: "Trạng thái",
					key: "is_used",
				},
				{
					label: "Ngày kích hoạt",
					key: "activation_date",
				},
				{
					label: "Ngày hết hạn",
					key: "exprired_date",
				},
				{ label: "Ngày tạo", key: "created_at" },
				{ label: "Người tạo", key: "created_by" },
			];

			var data = this.props.codes.map((ele) => {
				var newObj = {};
				newObj.code = ele.code;
				newObj.name = ele.user !== null ? ele.user.name : "";
				newObj.user_code = ele.user !== null ? ele.user.code : "";
				newObj.is_used =
					ele.is_used === true ? "Đã sử dụng" : "Chưa sử dụng";
				newObj.activation_date = ele.activation_date
					? Moment(ele.activation_date).format("DD/MM/YYYY HH:mm:ss")
					: "";
				newObj.exprired_date = ele.exprired_date
					? Moment(ele.exprired_date).format("DD/MM/YYYY HH:mm:ss")
					: "";
				newObj.created_at = ele.created_at;
				newObj.created_by = ele.created_by;
				return newObj;
			});

			this.setState({
				headers,
				data,
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
		const { deleteTarget, ids } = this.state;
		let idsToDelete = [];
		if (deleteTarget) {
			idsToDelete = [deleteTarget];
		} else if (ids.length > 0) {
			idsToDelete = ids;
		}

		if (idsToDelete.length !== 0) {
			const data = { ids: idsToDelete };
			await this.props.deleteCode(data);
			await this.props.listBook(this.getData());
			await this.props.listCode(this.getData());
			this.setState({ ids: [], deleteTarget: null });

			// Refresh checkboxes state
			const headerCheckbox = document.querySelector('input[name="id"]');
			if (headerCheckbox) headerCheckbox.checked = false;
			const inputs = document.querySelectorAll('.checkInputItem');
			for (let i = 0; i < inputs.length; i++) inputs[i].checked = false;
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
							{`Mã truy cập sách ${this.state.name} - ${this.state.book_id}`}
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

										<div className='ml-16'>
											<select onChange={this.onChange} name="is_used" className="custom-select ml-2">
												<option value="">Trạng thái</option>
												<option value="NOT_USED">Chưa sử dụng</option>
												<option value="USED">Đã sử dụng</option>
											</select>
										</div>
										<div className='ml-16' style={{ display: 'flex', alignItems: 'center' }}>
											<select onChange={this.onChange} name="date_type" className="custom-select mr-2" style={{ width: "150px" }} value={this.state.date_type}>
												<option value="created_at">Ngày tạo</option>
												<option value="activation_date">Ngày kích hoạt</option>
												<option value="exprired_date">Ngày hết hạn</option>
											</select>
											<DatePicker
												placeholder="Từ ngày"
												format="DD/MM/YYYY"
												onChange={(date, dateString) => this.onChangeDate('start_date', dateString)}
												style={{ width: "130px", marginRight: "10px" }}
											/>
											<DatePicker
												placeholder="Đến ngày"
												format="DD/MM/YYYY"
												onChange={(date, dateString) => this.onChangeDate('end_date', dateString)}
												style={{ width: "130px" }}
											/>
										</div>
										<div className='btn-filter ml-16'>
											<button
												onClick={this.onSubmit}
												className='btn btn-sm btn-primary text-muted ml-2'
											>
												<span className='d-none d-sm-inline mx-1' style={{ display: 'inline-flex', alignItems: 'center', transform: 'translateY(1px)' }}>
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
														className="feather feather-search"
														style={{ marginRight: '6px' }}>
														<circle
															cx={11}
															cy={11}
															r={8}
														/>
														<line
															x1={21}
															y1={21}
															x2="16.65"
															y2="16.65"
														/>
													</svg>
													Tìm kiếm
												</span>
											</button>
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
										Tạo mã kích hoạt
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
																onClick={this.clearDeleteTarget}
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
												<th width='150px'>Ngày kích hoạt</th>
												<th width='150px'>Ngày hết hạn</th>
												<th width='150px'>Ngày tạo</th>
												<th width='150px'>Người tạo</th>
												<th width='150px'>
													Thời gian cập nhật
												</th>
												<th width='80px' className='text-right'>
													Thao tác
												</th>
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
									book_id={this.props.match.params.id}
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
		classrooms: state.bookId.bookIds,
		classroom: state.bookId.bookId,
		limit: state.bookId.limit,
		page: state.bookId.page,
		total: state.bookId.total,
		ids: state.bookId.ids,
		check: state.bookId.checkAll,
		codes: state.bookId.codes,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listBook,
			deleteCode,
			checkInputItem,
			checkAll,
			listCode,
			showBook,
			downloadExcelData,
		},
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(BookIdCode)
);

