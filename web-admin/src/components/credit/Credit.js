import React, { Component } from 'react';
import Moment from 'moment';
import { notification, DatePicker, Select } from 'antd';
import Pagination from 'react-js-pagination';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { listCredit } from '../../redux/credit/action';

import HeadingSortColumn from "../HeadingSortColumn";

import queryString from 'query-string';
import BaseHelpers from '../../helpers/BaseHelpers';

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
		};
	}


	componentDidMount() {
		this.setState({
			check: false,
			status: this.props.obj.status,
		});
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
	}

	handleCheckBox = e => {
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
	};


	handleChangeStatus = async e => {

	};

	handleCheck = async (e) => {
	}

	getLabelPaymentMethod = (method) => {
		let labelName = "";
		switch (method) {
			case 'DIRECTLY':
				labelName = "Trực tiếp";
				break;
			case 'COD':
				labelName = "Thanh toán khi nhận hàng";
				break;
			case 'BANK_TRANSFER':
				labelName = "Chuyển khoản ngân hàng";
				break;
				case 'BANK_PAYOS':
				labelName = "Chuyển khoản PAYOS";
				break;
			default:
				labelName = "Chưa xác thực";
		}

		return labelName;
	}

	render() {

		// var total = this.props.obj.total.toFixed(3).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

		return (
			<tr className="v-middle" data-id={17}>
				<td>
					<label className="ui-check m-0">
						<input
							type="checkbox"
							className="checkInputItem"
							name="checkItem"
							value={this.props.obj._id}
							onChange={this.handleCheckBox}
						/>{' '}
						<i />
					</label>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.updated_at &&
							Moment(this.props.obj.updated_at).format(
								'DD/MM/YYYY HH:mm:ss',
							)}
					</span>
				</td>
				<td className="flex">
					<Link
						className="item-author text-color"
						to={'/credit/' + this.props.obj._id + '/edit'}>
						{this.props.obj.user.name}
					</Link>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.user.code}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.type === 'ADD' ? 'Cộng Tiền' : 'Trừ Tiền'}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{ this.getLabelPaymentMethod(this.props.obj.payment_method) }
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.total ? BaseHelpers.currencyFormat(this.props.obj.total) : 0}
					</span>
				</td>
				<td>
					<div className="item-action credit-item-action dropdown">
						<a
							href="/"
							data-toggle="dropdown"
							className="text-muted">
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
								className="feather feather-more-vertical">
								<circle cx={12} cy={12} r={1} />
								<circle cx={12} cy={5} r={1} />
								<circle cx={12} cy={19} r={1} />
							</svg>
						</a>
						<div
							className="dropdown-menu dropdown-menu-right bg-white"
							role="menu">
							<Link
								className="dropdown-item"
								to={'/blog/' + this.props.obj._id + '/edit'}>
								Sửa
							</Link>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

class Credit extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: "",
			page: 1,
			data: [],
			limit: 20,
			ids: [],
			activePage: 1,
			checkAll: false,
			from_date: '',
			to_date: '',
			student_id: '',
			sort_key: "",
			sort_value: ""
		};
	}

	async componentDidMount() {
		// await this.props.listCredit(this.getData());

		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			limit: params.limit ? parseInt(params.limit) : 20,
			page: params.page ? params.page : 1,
			from_date: params ? params.from_date : null,
			to_date: params ? params.to_date : null,
			sort_key: params ? params.sort_key : "",
			sort_value: params ? params.sort_value : "",

		})

		// if (this.props.limit) {
		// 	await this.setState({
		// 		limit: this.props.limit,
		// 		checkAll: false,
		// 		ids: this.props.ids
		// 	});
		// }

		await this.getData(this.state.activePage)
	}

	fetchRows() {
		if (this.props.credits instanceof Array) {
			return this.props.credits.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						handleCheckedIds={this.handleCheckedIds}
						updatePost={this.props.updatePost}
						addDataRemovePost={this.props.addDataRemovePost}
						getData={this.getData}
						check={this.props.check}
					/>
				);
			});
		}
	}

	handleCheckedIds = async (id, type = '') => {
		var _ids = this.state.ids;
		if (type === 'add') {
			if (_ids.indexOf(id) < 0) {
				_ids.push(id);
			}
		}
		if (type === 'remove') {
			var index = _ids.indexOf(id);
			if (index > -1) {
				_ids.splice(index, 1);
			}
		}

		this.setState({
			ids: _ids
		})
	}

	onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value
		})
	};

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			from_date: this.state.from_date,
			to_date: this.state.to_date,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
			limit: this.state.limit,
			page: pageNumber
		};

		await this.props.listCredit(params);
	};


	onSubmit = async (e) => {
		e.preventDefault();
		// this.props.listCredit(this.getData());
		let { keyword, limit, page, from_date, to_date } = this.state;

		this.props.history.push(`/credit-history?keyword=${keyword}&limit=${limit}&page=${page}&from_date=${from_date}&to_date=${to_date}`);

		await this.getData(1);
	};

	handleChangePage = async pageNumber => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		// await this.props.listCredit(this.getData(pageNumber));

		await this.setState({
			page: pageNumber
		})
		let { keyword, limit, page, from_date, to_date } = this.state;

		this.props.history.push(`/credit-history?keyword=${keyword}&limit=${limit}&page=${page}&from_date=${from_date || ""}&to_date=${to_date || ""}`);

		await this.getData(pageNumber);
	};

	handleDelete = async () => {
	};

	handleChange = async (e) => {
		e.preventDefault();
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		let { keyword, limit, page, from_date, to_date } = this.state;

		this.props.history.push(`/credit-history?keyword=${keyword}&limit=${limit}&page=${page}&from_date=${from_date || ""}&to_date=${to_date || ""}`);

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
		})

	};

	handleDeleteAll = async (e) => {

	}

	changeDateStart = async (date, dateString) => {
		if (date !== null) {
			await this.setState({
				from_date: date.format("YYYY/MM/DD") + ' ' + '00:00:00',
			});
		} else {
			await this.setState({
				from_date: null,
			});
		}

		// let { keyword, limit, page, from_date, to_date } = this.state;

		// this.props.history.push(`/credit-history?keyword=${keyword}&limit=${limit}&page=${page}&from_date=${from_date || ""}&to_date=${to_date || ""}`);

		// await this.getData(1);
	};

	changeDateEnd = async (date, dateString) => {
		if (date !== null) {
			await this.setState({
				to_date: date.format("YYYY/MM/DD") + ' ' + '23:59:59',
			});
		} else {
			await this.setState({
				to_date: null,
			});
		}

		// let { keyword, limit, page, from_date, to_date } = this.state;

		// this.props.history.push(`/credit-history?keyword=${keyword}&limit=${limit}&page=${page}&from_date=${from_date || ""}&to_date=${to_date || ""}`);

		// await this.getData(1);
	};


	sort = async (event) => {
		const { classList } = event.target;

		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});



		let { keyword, limit, page, from_date, to_date, sort_key, sort_value } = this.state;

		this.props.history.push(`/credit-history?keyword=${keyword}&limit=${limit}&page=${page}&from_date=${from_date || ""}&to_date=${to_date || ""}&sort_key=${sort_key}&sort_value=${sort_value}`);

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
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className='text-md text-highlight sss-page-title'>
							Lịch sử giao dịch
						</h2>
						<div className="flex" />
						<div>
							<Link
								to={`blog/create`}
								className="btn btn-sm btn-primary text-muted credit-btn-add">
								<span className="d-none d-sm-inline mx-1">
									Thêm mới
								</span>
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
									className="feather feather-arrow-right">
									<line x1={5} y1={12} x2={19} y2={12} />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</Link>
						</div>

						<div className="page-credit-history">
							<div className="toolbar">
								<div className="btn-group">
								</div>
								<form className="flex" onSubmit={this.onSubmit}>
									<div className="input-group">
										<input
											type="text"
											className="form-control form-control-theme keyword-custom"
											placeholder="Nhập từ khoá tìm kiếm..."
											onChange={this.onChange}
											name="keyword"
											value={this.state.keyword}
										/>{' '}
										<span className="input-group-append">
											<button
												className="btn btn-white btn-sm"
												type="submit">
												<span className="d-flex text-muted">
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
														className="feather feather-search">
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
												</span>
											</button>
										</span>
										<DatePicker
											format={"DD/MM/YYYY"}
											value={this.state.from_date
												? Moment(this.state.from_date)
												: null}
											onChange={this.changeDateStart}
											placeholder='Từ ngày'
											className='ml-2'
										/>
										<DatePicker
											format={"DD/MM/YYYY"}
											value={this.state.to_date
												? Moment(this.state.to_date)
												: null}
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

							<div className="row">
								<div className="col-sm-12">
									<table className="table table-theme table-row v-middle">
										<thead className="text-muted">
											<tr>
												<th width="10px">
													<label className="ui-check m-0">
														<input
															type="checkbox"
															name="checkAll"
															id="checkAll"
															onChange={
																this.handleCheckAll
															}
														/>{' '}
														<i />
													</label>
												</th>
												<HeadingSortColumn
													name="updated_at"
													content="Ngày nạp"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="user.id"
													content="Học sinh"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="phone"
													content="Số điện thoại"
													handleSort={this.sort}
													width={150}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="type"
													content="Loại"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="payment_method"
													content="Phương thức thanh toán"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="total"
													content="Số tiền (vnđ)"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<th width="50px" />
											</tr>
										</thead>
										<tbody>{this.fetchRows()}</tbody>
									</table>
								</div>
							</div>

							<div className="row listing-footer">
								<div className="col-sm-1">
									<select
										className="custom-select w-70"
										name="limit"
										value={this.state.limit}
										onChange={this.handleChange}>
										<option value="20">20</option>
										<option value="50">50</option>
										<option value="100">100</option>
										<option value="-1">ALL</option>
									</select>
								</div>
								<div className="col-sm-6 showing-text">
									{' '}
									Hiển thị từ <b>{displayFrom}</b> đến{' '}
									<b>{displayTo}</b> trong tổng số{' '}
									<b>{this.props.total}</b>
								</div>
								{this.props.total !== 0 ? (
									<div className="col-sm-5 text-right">
										<Pagination
											activePage={this.props.page}
											itemsCountPerPage={this.props.limit}
											totalItemsCount={this.props.total}
											pageRangeDisplayed={10}
											onChange={this.handleChangePage}
										/>
									</div>
								) : (
									<div className="">Không có bản ghi nào</div>
								)}
							</div>

							<div
								id="delete-video"
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
													Bạn chắc chắn muốn xóa bản
													ghi này chứ?
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
												onClick={this.handleDelete}
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
		credits: state.credit.credits,
		limit: state.credit.limit,
		total: state.credit.total,
		page: state.credit.page,
		ids: state.credit.ids,
		check: state.credit.checkAll,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listCredit
		},
		dispatch,
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Credit),
);
export default Container;
