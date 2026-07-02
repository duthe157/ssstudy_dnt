import React, { Component } from "react";
import Moment from "moment";
import Pagination from "react-js-pagination";
import {
	listBook,
	listMember,
	showBook,
	removeMember,
} from "../../redux/book-id/action";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { stat } from "fs";

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
			this.props.handleCheckedIds(this.props.obj._id, "add");
			this.setState({ check: e.target.checked });
		} else {
			this.props.handleCheckedIds(this.props.obj._id, "remove");
			this.setState({ check: e.target.checked });
		}
	}

	handleDelete = () => {
		this.props.setDeleteTarget(this.props.obj._id);
	}

	render() {
		let statusText = "Chưa rõ";
		let statusColor = "";
		if (this.props.obj.exprired_date) {
			if (Moment(this.props.obj.exprired_date).isAfter(Moment())) {
				statusText = "Đang sử dụng";
				statusColor = "text-success";
			} else {
				statusText = "Đã hết hạn";
				statusColor = "text-danger";
			}
		}

		return (
			<tr className='v-middle'>
				<td>
					<label className='ui-check m-0'>
						<input
							type='checkbox'
							className="checkInputItem"
							name='checkItem'
							value={this.props.obj._id}
							onChange={this.handleCheckBox}
						/>{" "}
						<i />
					</label>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.code}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.fullname}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.phone}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.parent_phone || ""}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.joined_at &&
							Moment(this.props.obj.joined_at).format(
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
					<span className={`item-amount d-none d-sm-block text-sm ${statusColor}`}>
						{statusText}
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
								data-target="#delete-member"
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

class BookIdMember extends Component {
	constructor(props) {
		super();
		this.state = {
			limit: 20,
			name: "",
			book_id: "",
			keyword: "",
			status: "",
			ids: [],
			checkAll: false,
			deleteTarget: null,
		};
	}

	handleCheckedIds = (id, type = '') => {
		const _ids = [...this.state.ids];
		if (type === 'add') {
			if (_ids.indexOf(id) < 0) _ids.push(id);
		}
		if (type === 'remove') {
			const index = _ids.indexOf(id);
			if (index > -1) {
				_ids.splice(index, 1);
			}
		}
		this.setState({ ids: _ids });
	}

	handleCheckAll = (e) => {
		var inputs = document.querySelectorAll('.checkInputItem');
		let flag = false;

		if (e.target.checked) {
			flag = true;
		}

		let _ids = [];
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = flag;
			if (flag) {
				_ids.push(inputs[i].value);
			}
		}

		this.setState({
			ids: _ids
		});
	}

	setDeleteTarget = (id) => {
		this.setState({ deleteTarget: id });
	}

	clearDeleteTarget = () => {
		this.setState({ deleteTarget: null });
	}

	handleDeleteConfirm = async () => {
		let book_id = this.props.match.params.id;
		const { deleteTarget, ids } = this.state;

		if (deleteTarget) {
			await this.props.removeMember({
				student_id: deleteTarget,
				book_id: book_id
			});
			this.setState({ deleteTarget: null });
		} else if (ids.length > 0) {
			for (let i = 0; i < ids.length; i++) {
				await this.props.removeMember({
					student_id: ids[i],
					book_id: book_id
				}, false);
			}
			this.setState({ ids: [] });
			const cb = document.getElementById('checkAll');
			if (cb) cb.checked = false;
		}
		await this.props.listMember(this.getData());
	}

	fetchRows() {
		if (this.props.members instanceof Array) {
			return this.props.members.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id || i}
						index={i}
						check={this.state.checkAll}
						handleCheckedIds={this.handleCheckedIds}
						setDeleteTarget={this.setDeleteTarget}
					/>
				);
			});
		}
	}


	onChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	getData = (pageNumber = 1) => {
		const data = {
			id: this.props.match.params.id,
			page: pageNumber,
			limit: this.state.limit,
		};
		if (this.state.keyword) {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.status !== "") {
			data["status"] = this.state.status;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.showBook(this.props.match.params.id);
		if (this.props.classroom) {
			var { name, book_id } = this.props.classroom;
			this.setState({
				name,
				book_id
			});
		}
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
			});
		}
		await this.props.listMember(this.getData());
	}

	UNSAFE_componentWillReceiveProps = async (nextProps) => {
		// Update classroom details if they changed
		if (nextProps.classroom && nextProps.classroom.name !== this.state.name) {
			let { name, book_id } = nextProps.classroom;
			this.setState({ name, book_id });
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listMember(this.getData());
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.props.listMember(this.getData(pageNumber));
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listMember(this.getData());
	};

	exportExcel = async () => {
		await this.props.listMember({
			id: this.props.match.params.id,
			page: 1,
			is_export: true
		});
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
					<div className='padding'>
						<h2 className='text-md text-highlight sss-page-title'>
							{`Học sinh sách ${this.state.name} - ${this.state.book_id}`}
						</h2>
						<div className='flex' />

						<div></div>
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
										{/* <span className='input-group-append'>
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
										</span> */}
										<div className='ml-16'>
											<select onChange={this.onChange} name="status" className="custom-select ml-2">
												<option value="">Tất cả trạng thái</option>
												<option value="active">Đang sử dụng</option>
												<option value="expired">Đã hết hạn</option>
											</select>
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
									<button className='btn btn-sm text-white btn-primary' onClick={this.exportExcel} style={{ marginRight: 0 }} type="button">
										Xuất Excel
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
															id="checkAll"
															onChange={this.handleCheckAll}
														/>{" "}
														<i />
													</label>
													{this.state.ids.length !== 0 && (
														<button
															className="btn btn-icon ml-16"
															data-toggle="modal"
															data-target="#delete-member"
															data-toggle-class="fade-down"
															data-toggle-class-target=".animate"
															title="Xóa đã chọn"
															onClick={this.clearDeleteTarget}
															id="btn-trash"
														>
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
																className="feather feather-trash text-muted"
															>
																<polyline points="3 6 5 6 21 6" />
																<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
															</svg>
														</button>
													)}
												</th>
												<th>Mã HS / Tên ĐN</th>
												<th>Họ và tên</th>
												<th>SĐT</th>
												<th>SĐT phụ huynh</th>
												<th width='150px'>Ngày kích hoạt</th>
												<th width='150px'>Ngày hết hạn</th>
												<th>Trạng thái</th>
												<th width='80px' className='text-right'>Thao tác</th>
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
								id="delete-member"
								className="modal fade"
								data-backdrop="true"
								style={{ display: 'none' }}
								aria-hidden="true">
								<div
									className="modal-dialog animate fade-down"
									data-class="fade-down">
									<div className="modal-content">
										<div className="modal-header">
											<div className="modal-title text-md">
												Thông báo
											</div>
											<button
												className="close"
												data-dismiss="modal">
												×
											</button>
										</div>
										<div className="modal-body">
											<div className="p-4 text-center">
												<p>
													Bạn chắc chắn muốn xóa bản ghi này chứ?
												</p>
											</div>
										</div>
										<div className="modal-footer">
											<button
												type="button"
												className="btn btn-light"
												data-dismiss="modal">
												Đóng
											</button>
											<button
												type="button"
												onClick={this.handleDeleteConfirm}
												className="btn btn-danger"
												data-dismiss="modal">
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
		classroom: state.bookId.bookId,
		limit: state.bookId.limit,
		page: state.bookId.page,
		total: state.bookId.total,
		members: state.bookId.members,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listBook,
			listMember,
			showBook,
			removeMember,
		},
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(BookIdMember)
);
