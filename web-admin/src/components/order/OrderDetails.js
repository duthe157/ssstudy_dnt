import React, { Component } from 'react';
import Moment from 'moment';
import { notification, DatePicker, Select } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showOrder, updateOrderStatus } from './../../redux/order/action';
import { isNull } from "lodash";
import baseHelper from "../../helpers/BaseHelpers";
class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
		};
	}

	componentDidMount() {

	}

	UNSAFE_componentWillReceiveProps(nextProps) {
	}

	handleCheckBox = e => {

	};


	handleChangeStatus = async e => {

	};

	handleCheck = async (e) => {
	}

	render() {

		return (
			<div></div>
		);
	}
}

class OrderDetail extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: "",
			data: [],
			limit: 20,
			ids: [],
			checkAll: false,
			from_date: '',
			to_date: '',
			student_id: '',
			order: '',
			status: 'PENDING'
		};
	}

	async componentDidMount() {
		await this.props.showOrder(this.props.match.params.id);

		if (this.props.order) {
			this.setState({
				order: this.props.order,
				status: this.props.order.status
			})
		}

	}
	print = (e) => {
		if (this.state.order) {
			var content = document.getElementById("elePrinted");
			var pri = document.getElementById("ifmcontentstoprint").contentWindow;
			pri.document.open();
			pri.document.write(content.innerHTML);
			pri.document.close();
			pri.focus();
			pri.print();
		} else {
			notification.warning({
				message: "Vui lòng chọn lớp",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	}

	updateOrderStatus = async (e) => {
		const _status = e.target.value;
		const _data = {
			status: _status,
			id: this.props.match.params.id
		};
		await this.props.updateOrderStatus(_data);
		this.setState({
			status: _status
		});
	}

	render() {
		var _order = this.state.order;
		var classRoom = {};
		const { items } = this.state.order;
		if (_order) {
			for (var i = 0; i < _order.items.length; i++) {
				classRoom = _order.items[i];
			}
		}

		let datetime = new Date();
		if (_order && _order.created_at) {
			var day = Moment(_order.created_at).format("DD");
			var month = Moment(_order.created_at).format("MM");
			var year = Moment(_order.created_at).format("YYYY");
		} else {
			var day = datetime.getDay();
			var month = datetime.getMonth() + 1;
			var year = datetime.getFullYear();
		}

		return (
			<div className="page-content page-container" id="page-content">
				<div className="padding">
					<h2 className="text-md text-highlight sss-page-title">Đơn hàng:{" "} {!isNull(this.state.order) && this.state.order.code}</h2>
					<div className="row">
						<div className="col-md-12">
							<div className="card">
								<div className="card-header" style={{ position: 'relative' }}>
									Ngày đặt hàng:{" "}
									{this.state.order &&
										Moment(this.state.order.created_at).format(
											"DD/MM/YYYY HH:mm"
										)}
									<div style={{ float: 'right' }}>

										<div className="input-group">
											<div className="input-group-prepend">
												<span className="input-group-text" id="basic-addon1">Trạng thái</span>
											</div>
											<select onChange={this.updateOrderStatus} name="status" className="custom-select"
												value={
													this.state.status
												}>
												<option value="PENDING">Chờ xử lý</option>
												<option value="PROCESSING">Đang xử lý</option>
												<option value="PAID">Đã thanh toán</option>
												<option value="SHIPPING">Đang giao hàng</option>
												<option value="SUCCESS">Thành công</option>
												<option value="CANCELLED">Huỷ đơn</option>
											</select>
										</div>
									</div>
								</div>
								<div className="card-body" style={{ padding: 0 }}>
									<div className="row">
										<div className="col-md-9 col-sm-12" style={{ paddingRight: 0 }}>
											<div className="card">
												<div
													className="card-body"
													style={{ paddingRight: 0, paddingLeft: 0 }}
												>

													<div className="form-group row">
														<div className="col-md-12 col-sm-12">
															<table className="table table-theme table-row v-middle">
																<thead className="text-muted">
																	<tr>
																		<th className="text-left" width="320px">
																			Tên khóa học
																		</th>
																		<th className="text-left" width="120px">
																			Giá khóa học
																		</th>
																		<th className="text-rileftght" width="90px">
																			Số Lượng
																		</th>
																		<th className="text-left">Thành tiền (đ)</th>
																	</tr>
																</thead>
																<tbody>
																	{
																		items && items.length ?
																			items.map((item) =>
																				<tr key={i}>
																					<td style={{ width: '60 %' }}>{item.name}</td>
																					<td>{item.price ? baseHelper.currencyFormat(item.price) : ''}</td>
																					<td>{item.qty}</td>
																					<td style={{ width: '10 %' }}>{item.price >= 0 ? baseHelper.currencyFormat(item.price * item.qty) : 0}</td>
																				</tr>
																			) : null
																	}

																</tbody>
																<tfoot>
																	<tr>
																		<td colSpan={8}><textarea name="note"
																			className="form-control"
																			onChange={this._onChange}
																			value={_order.note} placeholder="Ghi chú">{_order.note}</textarea></td>
																	</tr>
																</tfoot>
															</table>
														</div>
													</div>

													<div className="form-group row">
														<div className="col-md-3 d-flex justify-content-center align-items-center">
															Tổng tiền:{_order.total ? baseHelper.currencyFormat(_order.total) : 0} đ
														</div>
														<div className="col-md-3 justify-content-end align-items-center">
															Tổng chiết khấu: (-{_order.discount ? baseHelper.currencyFormat(_order.discount) : 0})
														</div>
														<div className="col-md-6 d-flex justify-content-end align-items-right">
															<h5>
																Tổng thanh toán:{_order.total ? baseHelper.currencyFormat(_order.total) : 0} đ
															</h5>
														</div>
														<div>

														</div>
													</div>

													{/* <div className="form-group row">
															<div className="col-md-3 d-flex justify-content-center align-items-center">
																Tổng tiền:{" "}
																{!isNaN(this.renderTotal())
																	? this.renderTotal().toLocaleString("en-EN", {
																		minimumFractionDigits: 0,
																	})
																	: 0}{" "}
																đ
															</div>
															<div className="col-md-3 justify-content-end align-items-center">
																Tổng chiết khấu: (-
																{this.renderDiscount() === 0
																	? 0
																	: this.renderDiscount().toLocaleString(
																		"en-EN",
																		{
																			minimumFractionDigits: 0,
																		}
																	)}
																đ )
															</div>
															<div className="col-md-6 d-flex justify-content-end align-items-right">
																<h5>
																	Tổng thanh toán:{" "}
																	{!isNaN(this.renderTotalPay())
																		? this.renderTotalPay().toLocaleString(
																			"en-EN",
																			{
																				minimumFractionDigits: 0,
																			}
																		)
																		: 0}{" "}
																	đ
																</h5>
															</div>
															<div>

															</div>
														</div> */}
												</div>
											</div>

										</div>

										<div className="col-md-3 col-sm-12">
											<div className="card">
												<div className="card-header">
													<strong>Thông tin học sinh</strong>
												</div>
												<div className="card-body">
													<div className="form-group row">
														<div className="col-sm-5">Số điện thoại</div>

														<div className="col-md-7">
															<input
																type="text"
																className="form-control form-control-theme"
																placeholder="Mã học sinh"
																onChange={this.onChange}
																name="user_code"
																value={
																	this.state.order !== null
																		? this.state.order.customer_phone
																		: ""
																}
																disabled
															/>
														</div>
													</div>
													<div className="form-group row">
														<div className="col-sm-5">Tên học sinh</div>

														<div className="col-md-7">
															<input
																type="text"
																className="form-control form-control-theme"
																placeholder="Tên học sinh"
																onChange={this.onChange}
																name="user_code"
																value={
																	this.state.order !== null
																		? this.state.order.customer_name
																		: ""
																}
																disabled
															/>
														</div>
													</div>
													<div className="form-group row">
														<div className="col-sm-5">Địa chỉ</div>

														<div className="col-md-7">
															<input
																type="text"
																className="form-control form-control-theme"
																placeholder="Mã học sinh"
																onChange={this.onChange}
																name="user_address"
																value={
																	this.state.order !== null
																		? this.state.order.customer_address
																		: ""
																}
																disabled
															/>
														</div>
													</div>
												</div>
											</div>

										</div>
									</div>

									<iframe
										title="Frame"
										id="ifmcontentstoprint"
										style={{
											height: 0,
											width: 0,
											position: "absolute",
											display: "none",
										}}
									/>

									<div
										className="row"
										id="elePrinted"
										style={{ display: "none" }}
									>
										<div className="col-12 d-flex justify-content-start">
											<div
												className="card box"
												style={{
													padding: "30px",
												}}
											>
												<h1
													style={{
														textAlign: "center",
														fontSize: "16px",
														marginBottom: 10,
														display: "flex",
														justifyContent: "flex-start",
														alignItems: "center",
													}}
													className="d-flex justify-content-start"
												>
													<span>
														Đơn vị: Trung tâm luyện thi ĐH Đại Cồ Việt
													</span>
												</h1>

												<h2
													style={{
														textAlign: "center",

														fontSize: "16px",
														marginBottom: 10,
														display: "flex",
														justifyContent: "flex-start",
														alignItems: "center",
													}}
													className="d-flex justify-content-start"
												>
													<span>Địa chỉ: số 88 ngõ 27 Đại Cồ Việt</span>
												</h2>

												<h3
													style={{
														textAlign: "center",
														fontSize: "14px",
														marginBottom: "30px",
														clear: "both",
														position: "relative",
													}}
												>
													PHIẾU THU
													<span
														style={{
															marginLeft: 40,
															position: "absolute",
														}}
													>
														Số:
														{_order && _order.code}
													</span>
												</h3>

												<h6
													style={{
														textAlign: "center",
														fontSize: "14px",
														marginBottom: "30px",
														clear: "both",
														fontStyle: "italic",
													}}
												>
													{`Ngày ${day} Tháng ${month} Năm ${year}`}
												</h6>

												<table width="100%">
													<tbody>
														<tr>
															<td>
																<strong>Họ và tên:</strong>
																{_order !== null
																	? ` ${_order.customer_name}`
																	: ".................................."}
															</td>
															<td>
																<strong>Số ĐT</strong>:{" "}
																{_order !== null
																	? ` ${_order.customer_phone}`
																	: ".................................."}
															</td>
														</tr>
														<tr>
															<td>
																<strong>Hình thức thanh toán:</strong>
																{
																	_order.payment_method === 'BANK_TRANSFER' ? 'Chuyển khoản NH' :
																		_order.payment_method === 'BUY_BOOKS' ? 'Tiền mặt' : 'COD'
																}
															</td>
														</tr>
													</tbody>
												</table>
												{_order != "" ? (
													<table
														width="100%"
														style={{
															border: "1px solid #000",
															borderCollapse: "collapse",
														}}
													>
														<thead>
															<tr>
																<th
																	style={{
																		border: "1px solid #000",
																		padding: "6px 8px",
																	}}
																>
																	Tên Khóa Học
																</th>

																<th
																	style={{
																		border: "1px solid #000",
																		padding: "6px 8px",
																	}}
																	className='text-center'
																>
																	Giá tiền
																</th>
																<th
																	style={{
																		border: "1px solid #000",
																		padding: "6px 8px",
																	}}
																	className='text-center'
																>
																	Số lượng
																</th>
																<th
																	style={{
																		border: "1px solid #000",
																		padding: "6px 8px",
																	}}
																	className='text-center'
																>
																	Thành tiền
																</th>
															</tr>
														</thead>
														<tbody>
															{
																items && items.length ?
																	items.map((item) =>
																		<tr key={item._id} style={{
																			border: "1px solid #000",
																			padding: "6px 8px",
																		}}>
																			<td style={{
																				border: "1px solid #000",
																				padding: "6px 8px",
																			}}>{item.name}</td>
																			<td style={{
																				border: "1px solid #000",
																				padding: "6px 8px",
																				textAlign: "center"
																			}}>{item.price ? baseHelper.currencyFormat(item.price) : ''}</td>
																			<td style={{
																				border: "1px solid #000",
																				padding: "6px 8px",
																				textAlign: "center"
																			}}>{item.qty}</td>
																			<td style={{
																				border: "1px solid #000",
																				padding: "6px 8px",
																				textAlign: "right"
																			}}>{item.price >= 0 ? baseHelper.currencyFormat(item.price * item.qty) : 0}</td>
																		</tr>
																	) : null
															}
														</tbody>
													</table>
												) : (
													""
												)}
												<table width="100%" className="mt-2">
													<tbody>
														<tr>
															<td
																style={{
																	padding: "6px 8px",
																}}
															></td>
															<td
																style={{
																	padding: "6px 8px",
																}}
															></td>
															<td
																style={{
																	padding: "6px 8px",
																	display: "flex",
																	justifyContent: "flex-end",
																}}
															>
																<strong>Tổng tiền:</strong>
																{_order.total ? baseHelper.currencyFormat(_order.total) : 0} đ

															</td>
														</tr>
														<tr>
															<td
																style={{
																	padding: "6px 8px",
																}}
															></td>
															<td
																style={{
																	padding: "6px 8px",
																}}
															></td>
															<td
																style={{
																	padding: "6px 8px",
																	display: "flex",
																	justifyContent: "flex-end",
																}}
															>
																<strong>Chiết khấu:</strong>
																{_order.discount ? baseHelper.currencyFormat(_order.discount) : 0} đ
															</td>
														</tr>
														<tr>
															<td
																style={{
																	padding: "6px 8px",
																}}
															></td>
															<td
																style={{
																	padding: "6px 8px",
																}}
															></td>
															<td
																style={{
																	padding: "6px 8px",
																	display: "flex",
																	justifyContent: "flex-end",
																}}
															>
																<strong>Thanh toán:</strong>
																{_order.total ? baseHelper.currencyFormat(_order.total) : 0} đ

															</td>
														</tr>

														<tr>
															<td
																style={{
																	padding: "6px 8px",
																	textAlign: "center",
																}}
															>
																<strong>Người thu tiền</strong>
																<br /> (Ký &amp; ghi rõ họ tên)
															</td>

															<td
																style={{
																	padding: "6px 8px",
																}}
															>
																<strong />
															</td>

															<td
																style={{
																	padding: "6px 8px",
																	textAlign: "center",
																}}
															>
																<strong>Người nộp tiền</strong>
																<br /> (Ký &amp; ghi rõ họ tên)
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>
								</div>

							</div>
							<div className="row text-right">
								<div className="col-md-12 col-sm-12">

									<button
										className="btn btn-primary mt-2 ml-2"
										onClick={this.print}
									>
										In biên lai
									</button>
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
		order: state.order.order,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			showOrder,
			updateOrderStatus
		},
		dispatch,
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(OrderDetail),
);
export default Container;
