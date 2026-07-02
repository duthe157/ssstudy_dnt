import React, { Component } from 'react';
import Moment from 'moment';
import { notification, DatePicker, Select } from 'antd';
import Pagination from 'react-js-pagination';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { listOrder } from '../../redux/order/action';

import HeadingSortColumn from "../HeadingSortColumn";

import queryString from 'query-string';

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
			showTooltip: false,
			showTooltipAddress: false,
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

	getNamePaymentMethod = (type) => {
		let name = "";
		switch (type) {
			case "BANK_TRANSFER":
				name = "Chuyển khoản";
				break;
			case "COD":
				name = "COD";
				break;
			case "SSS_BALANCE":
				name = "Đơn hàng 0đ";
				break;
			case "DIRECTLY":
				name = "Mua trực tiếp";
				break;
            case "BANK_PAYOS":
                name = "Thanh toán payos"
                break;
			default:
				name = type;
				break;
		}

		return name;
	}

	getLabelByStatus = (status) => {
		let label = "";
		switch (status) {
			case "PAID":
				label = "Đã thanh toán";
				break;
			case "PENDING":
				label = "Chờ xử lý";
				break;
			case "SUCCESS":
				label = "Thành công";
				break;
			case "CANCEL":
				label = "Hủy";
				break;
			case "PROCESSING":
				label = "Đang xử lý";
				break;
            case "CANCELLED":
                label = "Huỷ đơn";
                break;
			default:
				label = status;
				break;
		}

		return label;
	}

	render() {

		return (
			<tr className="v-middle table-row-item" data-id={17}>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						<Link
							to={'/order/' + this.props.obj._id + '/details'} className="item-author text-color">{this.props.obj.code || ''}</Link>
					</span>
				</td>
				<td className="text-left" style={{ position: 'relative' }}>
					<div
						style={{ display: 'inline-block', position: 'relative' }}
						onMouseEnter={() => this.setState({ showTooltip: true })}
						onMouseLeave={() => this.setState({ showTooltip: false })}
					>
						<div
						style={{
							maxWidth: '200px',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							cursor: 'pointer',
						}}
						>
						{this.props.obj.items[0].name}
						</div>

						{this.state.showTooltip && (
						<div
							style={{
							position: 'absolute',
							top: '100%',
							left: 0,
							marginTop: '4px',
							background: '#fff',
							border: '1px solid #ccc',
							padding: '8px',
							maxWidth: '300px',
							whiteSpace: 'normal',
							wordBreak: 'break-word',
							boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
							zIndex: 999,
							}}
						>
							<span style={{ userSelect: 'text' }}>{this.props.obj.items[0].name}</span>
						</div>
						)}
					</div>
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
					<a
						className="item-author text-color"
						target="_blank"
						href={'/student/' + this.props.obj.customer_id + '/edit'}>
						{this.props.obj.customer_name}
					</a>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.customer_phone}
					</span>
				</td>
				<td className="text-left" style={{ position: 'relative' }}>
					<div
						style={{ display: 'inline-block', position: 'relative' }}
						onMouseEnter={() => this.setState({ showTooltipAddress: true })}
						onMouseLeave={() => this.setState({ showTooltipAddress: false })}
					>
						<div
						style={{
							maxWidth: '200px',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							cursor: 'pointer',
						}}
						>
						{this.props.obj.customer_address}
						</div>

						{this.state.showTooltipAddress && (
						<div
							style={{
							position: 'absolute',
							top: '100%',
							left: 0,
							marginTop: '4px',
							background: '#fff',
							border: '1px solid #ccc',
							padding: '8px',
							maxWidth: '300px',
							whiteSpace: 'normal',
							wordBreak: 'break-word',
							boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
							zIndex: 999,
							}}
						>
							<span style={{ userSelect: 'text' }}>{this.props.obj.customer_address}</span>
						</div>
						)}
					</div>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.getNamePaymentMethod(this.props.obj.payment_method)}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.total.toLocaleString("en-EN", {
							minimumFractionDigits: 0,
						})}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.discount_total ? this.props.obj.discount_total.toLocaleString("en-EN", {
							minimumFractionDigits: 0,
						}) : 0}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.getLabelByStatus(this.props.obj.status)}
					</span>
				</td>
				<td className="text-right">
					<div className="item-action">
						<Link
							data-toggle='tooltip'
							title='Xem chi tiết'
							to={'/order/' + this.props.obj._id + '/details'}>
							<img src="assets/img/icon-view.svg" alt="" />
						</Link>
					</div>
				</td>
			</tr>
		);
	}
}

class OrderShipping extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: "",
			data: [],
			page: 1,
			limit: 20,
			activePage: 1,
			ids: [],
			checkAll: false,
			from_date: '',
			to_date: '',
			student_id: '',
			status: 'SHIPPING',
			payment_method: '',
			sort_key: "",
			sort_value: ""
		};
	}

	async componentDidMount() {
		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			payment_method: params.payment_method ? params.payment_method : "",
			from_date: params.from_date ? params.from_date : "",
			to_date: params.to_date ? params.to_date : "",
			sort_key: params.sort_key ? params.sort_key : "",
			sort_value: params.sort_value ? params.sort_value : "",
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
		})


		// await this.props.listOrder(this.getData());

		// if (this.props.limit) {
		// 	await this.setState({
		// 		limit: this.props.limit,
		// 		checkAll: false,
		// 		ids: this.props.ids
		// 	});
		// }
		this.getData(this.state.activePage)
	}

	fetchRows() {
		if (this.props.orders instanceof Array) {
			return this.props.orders.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						handleCheckedIds={this.handleCheckedIds}
						updatePost={this.props.updatePost}
						addDataRemovePost={this.props.addDataRemovePost}
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

	onChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;

		this.setState({
			[name]: value
		})
	};

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			status: this.state.status,
			limit: this.state.limit,
			payment_method: this.state.payment_method,
			from_date: this.state.from_date,
			to_date: this.state.to_date,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
		};

		params.page = pageNumber;

		await this.props.listOrder(params);

		// return data;
	};


	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword, payment_method, from_date, to_date } = this.state;

		this.props.history.push(`/order-shipping?keyword=${keyword}&payment_method=${payment_method}&from_date=${from_date}&to_date=${to_date}`);

		// this.props.listOrder(this.getData());
		await this.getData(1);
	};

	handleChangePage = async pageNumber => {
		window.scrollTo({ top: 0, behavior: "smooth" });

		await this.setState({
			page: pageNumber
		})
		let { keyword, status, payment_method, from_date, to_date, page, limit } = this.state;

		this.props.history.push(`/order-shipping?page=${page}&limit=${limit}&keyword=${keyword}&status=${status}&payment_method=${payment_method}&from_date=${from_date}&to_date=${to_date}`);
		await this.getData(pageNumber);
	};

	handleDelete = async () => {
	};

	handleChange = async e => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});

		let { keyword, status, payment_method, from_date, to_date, page, limit } = this.state;

		this.props.history.push(`/order-shipping?page=${page}&limit=${limit}&keyword=${keyword}&status=${status}&payment_method=${payment_method}&from_date=${from_date}&to_date=${to_date}`);
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
		}
		let { keyword, status, payment_method, from_date, to_date } = this.state;

		this.props.history.push(`/order-shipping?keyword=${keyword}&payment_method=${payment_method}&from_date=${from_date}&to_date=${to_date}`);

		// this.props.listOrder(this.getData());
		await this.getData(1);
	};

	changeDateEnd = async (date, dateString) => {
		if (date !== null) {
			await this.setState({
				to_date: date.format("YYYY/MM/DD") + ' ' + '23:59:59',
			});
		}
		let { keyword, status, payment_method, from_date, to_date } = this.state;

		this.props.history.push(`/order-shipping?keyword=${keyword}&payment_method=${payment_method}&from_date=${from_date}&to_date=${to_date}`);

		// this.props.listOrder(this.getData());
		await this.getData(1);
	};

	onFilterOrder = async (event) => {
		const name = event.target.name;
		let value = event.target.value;
		await this.setState({
			[name]: value
		})


		let { keyword, status, payment_method, from_date, to_date } = this.state;

		this.props.history.push(`/order-shipping?keyword=${keyword}&payment_method=${payment_method}&from_date=${from_date}&to_date=${to_date}`);

		// this.props.listOrder(this.getData());
		event.preventDefault();
		await this.getData(1);
	}
	resetDataFilter = async () => {
		await this.setState({
			status: '',
			payment_method: '',
			to_date: '',
			from_date: ''
		})

		this.props.listOrder(this.getData());

	}

	sort = async (event) => {
		const { classList } = event.target;

		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});



		let { keyword, status, payment_method, from_date, to_date, sort_key, sort_value } = this.state;

		this.props.history.push(`/order-shipping?keyword=${keyword}&status=${status}&payment_method=${payment_method}&from_date=${from_date}&to_date=${to_date}&sort_key=${sort_key}&sort_value=${sort_value}`);

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
						<h2 className="text-md text-highlight sss-page-title">Đơn hàng đang giao</h2>
						<div className="block-table-order">
							<div className="toolbar">
								<form className="flex" onSubmit={this.onSubmit}>
									<div className="input-group fix">
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
												className="btn btn-white btn-sm btn-search"
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

										{/* <div className="ml-16">
											<select onChange={this.onFilterOrder} name="status" className="custom-select"
												value={
													this.state.status
												}>
												<option value="">-- Trạng thái --</option>
												<option value="PENDING">Chờ xử lý</option>
												<option value="PROCESSING">Đang xử lý</option>
												<option value="PAID">Đã thanh toán</option>
												<option value="SHIPPING">Đang giao hàng</option>
												<option value="SUCCESS">Thành công</option>
											</select>
										</div> */}

										<div className="ml-16">
											<select onChange={this.onFilterOrder} name="payment_method" className="custom-select"
												value={
													this.state.payment_method
												}>
												<option value="">-- Phương thức thanh toán --</option>
												<option value="SSS_BALANCE">Đơn hàng 0đ</option>
												<option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
												<option value="COD">Ship COD (Thanh toán khi nhận hàng)</option>
												<option value="BUY_BOOKS">Mua trực tiếp</option>
                                                <option value="BANK_PAYOS">Thanh toán payos</option>
											</select>
										</div>

										<div className="ml-16">
											<DatePicker
												format={"DD/MM/YYYY"}
												value={this.state.from_date ? Moment(this.state.from_date) : null}
												onChange={this.changeDateStart}
												placeholder='Từ ngày'
											/>
										</div>
										<div className="ml-16">
											<DatePicker
												format={"DD/MM/YYYY"}
												value={this.state.to_date ? Moment(this.state.to_date) : null}
												onChange={this.changeDateEnd}
												placeholder='Đến ngày'
											/>
										</div>
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

							<div className="row" style={{overflowX: 'scroll'}}>
								<div className="col-sm-12">
									<table className="table table-theme table-row v-middle">
										<thead className="text-muted">
											<tr>
												<HeadingSortColumn
													name="code"
													content="Mã đơn hàng"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="product"
													content="Sản phẩm"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="created_at"
													content="Ngày đặt hàng"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="customer.id"
													content="Khách hàng"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<th width="125px" className="text-left">
													SĐT
												</th>
												<th width="125px" className="text-left">
													Địa chỉ
												</th>
												<HeadingSortColumn
													name="payment_method"
													content="Phương thức"
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
												<HeadingSortColumn
													name="discount_total"
													content="Giảm giá"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<th className="text-left">
													Trạng thái
												</th>
												<th className='text-right'>
													Thao tác
												</th>
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
		orders: state.order.orders,
		limit: state.order.limit,
		total: state.order.total,
		page: state.order.page,
		ids: state.order.ids,
		check: state.order.checkAll,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listOrder
		},
		dispatch,
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(OrderShipping),
);
export default Container;
