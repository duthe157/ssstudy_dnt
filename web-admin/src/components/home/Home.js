import React, { Component } from "react";
import { DatePicker } from "antd";
import moment from "moment";
import { Link, withRouter } from "react-router-dom";
import baseHelpers from "../../helpers/BaseHelpers";
import { listOrder } from "../../redux/order/action";
import { listDashboard } from "../../redux/home/action";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Pagination from "react-js-pagination";


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

	getLabelByStatus = (status) => {
		let labelName = "";
		switch (status) {
			case 'PENDING':
				labelName = "Chờ xử lý";
				break;
			case 'SUCCESS':
				labelName = "Thành công";
				break;
			default:
				labelName = "chưa xác định";
		}

		return labelName;
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
		let order = this.props.obj;
		return (
			<tr className='v-middle table-row-item' data-id={17}>
				<td className='text-left'>
					{order.code}
				</td>
				<td className='text-center'>
					{order.created_at ? baseHelpers.formatDateToString(order.created_at) : ""}
				</td>
				<td className='text-center'>
					<Link
						className='item-author text-color'
						to={"/student/" + order.customer_id + "/edit"}
						target='_blank'
					>
						{order.customer_name}
					</Link>
				</td>
				<td className='text-center'>
					{order.total ? baseHelpers.currencyFormat(order.total) : 0}đ
				</td>
				<td className='text-center'>
					{this.getLabelPaymentMethod(order.payment_method)}
				</td>
				<td className='text-center'>
					{this.getLabelByStatus(order.status)}
				</td>
				<td className="text-right">
					<div className='item-action'>
						<Link
							className='mr-14'
							to={"/order/" + order._id + "/details"}
						>
							<img src="/assets/img/icon-zoom.svg" alt="" />
						</Link>
					</div>
				</td>
			</tr>
		);
	}
}

class Home extends Component {
	constructor(props) {
		super(props);
		this.moment = baseHelpers.getMoment();

		const now = this.moment();
		const firstDay = now.set({
			date: 1,
		});
		this.state = {
			limit: "",
			activePage: 1,
			orders: [],
			from_date: baseHelpers.getFromDate(firstDay),
			to_date: baseHelpers.getToDate(this.moment()),
			dashboard: {}
		};
	}

	componentDidMount() {
		const params = {
			from_date: this.state.from_date,
			to_date: this.state.to_date,
			page: this.state.activePage,
			limit: this.state.limit
		};

		this.props.listOrder(params);
		this.props.listDashboard(params);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.orders != nextProps.orders) {
			this.setState({
				orders: nextProps.orders
			})
		}
		if (this.props.dashboard != nextProps.dashboard) {
			this.setState({
				dashboard: nextProps.dashboard
			})
		}
	}

	changeDateStart = (date, dateString) => {
		if (date !== null) {
			this.setState({
				from_date: date.format("YYYY/MM/DD HH:mm"),
			});
		}
	};

	changeDateEnd = (date, dateString) => {
		if (date !== null) {
			this.setState({
				to_date: date.format("YYYY/MM/DD HH:mm"),
			});
		}
	};

	fetchRows() {
		if (this.state.orders instanceof Array && this.state.orders.length > 0) {
			return this.state.orders.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
					/>
				);
			});
		}
	}

	handleChangePage = async (pageNumber) => {
		const params = {
			from_date: this.state.from_date,
			to_date: this.state.to_date,
			page: pageNumber
		};

		this.props.listOrder(params);
	};

	handleChange = async (e) => {
		let { name, value } = e.target;
		await this.setState({
			[name]: value
		})
		const params = {
			from_date: this.state.from_date,
			to_date: this.state.to_date,
			page: this.state.page,
			limit: this.state.limit
		};

		await this.props.listOrder(params);
	};

	onSearch = async () => {
		const params = {
			from_date: this.state.from_date,
			to_date: this.state.to_date,
			page: this.state.activePage,
			limit: this.state.limit
		};

		await this.props.listOrder(params);
		await this.props.listDashboard(params);
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

		const { from_date, to_date, dashboard } = this.state;
		return (
			<div>
				<div className='page-content page-container page-dashboard' id='page-content'>
					<div className='padding'>
						<h2 className='text-md text-highlight sss-page-title'>
							Báo cáo
						</h2>

						<div className="toolbar">
							<div className="flex block-filter-book">
								<div className="input-group" style={{ alignItems: "center" }}>
									<span className="title-block mb-0 mr-16 semi-bold">Số liệu thống kê</span>
									<DatePicker
										format={
											"DD/MM/YYYY HH:mm"
										}
										value={from_date
											? moment(from_date)
											: null}
										showTime={{ format: 'HH:mm' }}
										placeholder="Từ ngày"
										onChange={this.changeDateStart}
									/>
									<DatePicker
										format={
											"DD/MM/YYYY HH:mm"
										}
										value={to_date
											? moment(to_date)
											: null}
										showTime={{ format: 'HH:mm' }}
										placeholder="Đến ngày"
										onChange={this.changeDateEnd}
										className="ml-2"
									/>

									<div className='btn-filter ml-16'>
										<button type='button' onClick={this.onSearch}>
											<img src='/assets/img/icon-filter.svg' className='mr-10' alt='' />
											<span>Lọc kết quả</span>
										</button>
									</div>

								</div>
							</div>
						</div>
						<div className="block-report-top">
							<div className="block-report-item">
								<div className="icon-report">
									<img src="/assets/img/icon-report-line.svg" alt="" />
								</div>
								<div className="reporting-index">
									<h3>{dashboard.total_user ? baseHelpers.currencyFormat(dashboard.total_user) : 0}</h3>
									<span>Thành viên</span>
								</div>
							</div>
							<div className="block-report-item">
								<div className="icon-report">
									<img src="/assets/img/icon-report-line.svg" alt="" />
								</div>
								<div className="reporting-index">
									<h3>{dashboard.total_classroom_qty ? baseHelpers.currencyFormat(dashboard.total_classroom_qty) : 0}</h3>
									<span>Khóa học đã bán</span>
								</div>
							</div>
							<div className="block-report-item">
								<div className="icon-report">
									<img src="/assets/img/icon-report-line.svg" alt="" />
								</div>
								<div className="reporting-index">
									<h3>{dashboard.total_book_qty ? baseHelpers.currencyFormat(dashboard.total_book_qty) : 0}</h3>
									<span>Sách đã bán</span>
								</div>
							</div>
							<div className="block-report-item">
								<div className="icon-report">
									<img src="/assets/img/icon-report-line.svg" alt="" />
								</div>
								<div className="reporting-index">
									<h3>{dashboard.total_order ? baseHelpers.currencyFormat(dashboard.total_order) : 0}</h3>
									<span>Đơn hàng</span>
								</div>
							</div>
							<div className="block-report-item">
								<div className="icon-report">
									<img src="/assets/img/icon-report-line.svg" alt="" />
								</div>
								<div className="reporting-index">
									<h3>{dashboard.total_revenue ? baseHelpers.currencyFormat(dashboard.total_revenue) : 0}đ</h3>
									<span>Tổng doanh thu</span>
								</div>
							</div>
						</div>
						<div className="block-list-new-order">
							<h3 className="title-block">Đơn hàng mới</h3>
							<table className='table table-theme table-row v-middle'>
								<thead className='text-muted'>
									<tr>
										<th className='text-left'>
											Mã đơn hàng
										</th>
										<th className='text-center'>
											Ngày đặt hàng
										</th>
										<th className='text-center'>
											Người đặt
										</th>
										<th className='text-center'>
											Giá trị
										</th>
										<th className='text-center'>
											Hình thức thanh toán
										</th>
										<th className="text-center">
											Trạng thái
										</th>
										<th className="text-right">
											Thao tác
										</th>
									</tr>
								</thead>


								<tbody>
									{
										this.fetchRows()
									}
									{
										!this.state.orders || this.state.orders.length == 0
										&&
										<tr>
											<td colSpan={8} className="text-center">Không có dữ liệu!</td>
										</tr>
									}
								</tbody>

							</table>


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
		dashboard: state.dashboard.dashboard,
		limit: state.order.limit,
		page: state.order.page,
		total: state.order.total,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listOrder, listDashboard },
		dispatch
	);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
