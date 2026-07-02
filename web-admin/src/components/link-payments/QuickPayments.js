import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import HeadingSortColumn from "../HeadingSortColumn";
import { Dropdown } from 'react-bootstrap';
import Pagination from 'react-js-pagination';
import { listCreator, listPaymentLinks, listStatistics } from '../../redux/paymentLinks/action';
import moment from 'moment';
import copy from 'copy-to-clipboard';
import { notification } from 'antd';

const styles = {
	badge: {
		padding: '8px 12px',
		borderRadius: '20px',
		display: 'inline-block',
		fontWeight: '500',
		fontSize: '14px',
		textAlign: 'center',
		minWidth: '130px',
	},
	paidBadge: {
		backgroundColor: '#4caf50',
		color: 'white',
	},
	pendingBadge: {
		backgroundColor: '#ffc107',
		color: '#212529',
	},
	expiredBadge: {
		backgroundColor: '#6c757d',
		color: 'white',
	},
	cancelledBadge: {
		backgroundColor: '#f44336',
		color: 'white',
	},
	actionButton: {
		display: 'flex',
		alignItems: 'center',
		width: '100%',
		padding: '8px 12px',
		border: 'none',
		background: 'none',
		textAlign: 'left',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
		borderRadius: '4px',
	},
};

class Box extends Component {
	constructor(props) {
		super();
	}

	render() {
		const { title, value, className } = this.props;
		return (
			<div className={`${className}`} style={{
				padding: '14px',
				border: '2px solid #ff834545',
				borderRadius: '8px',
				minWidth: '200px',
				backgroundColor: title === 'DOANH THU' ? '#ffffff' : '#ffffff',
				marginRight: '32px'
			}}>
				<div className='d-flex flex-column'>
					<span style={{
						fontSize: '14px',
						color: '#212529',
						fontWeight: '500',
						marginBottom: '12px'
					}}>{title}</span>
					<span style={{
						fontSize: '24px',
						color: '#212529',
						fontWeight: '500'
					}}>{value}</span>
				</div>
			</div>
		)
	}
}

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
			showTooltip: false,
			showTooltipAddress: false,
			statusOrder: props.obj.status
		};
	}

	componentDidMount() {
		this.setState({
			check: false,
			status: this.props.obj.status,
		});
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

	getStatusLabel = (status) => {
		switch (status) {
			case "PAID":
				return <span style={{ ...styles.badge, ...styles.paidBadge }}>Đã thanh toán</span>;
			case "PENDING":
				return <span style={{ ...styles.badge, ...styles.pendingBadge }}>Chờ thanh toán</span>;
			case "EXPIRED":
				return <span style={{ ...styles.badge, ...styles.expiredBadge }}>Hết hạn</span>;
			case "CANCELLED":
				return <span style={{ ...styles.badge, ...styles.cancelledBadge }}>Đã huỷ</span>;
			default:
				return <span style={{ ...styles.badge, backgroundColor: '#17a2b8', color: 'white' }}>{status}</span>;
		}
	}

	render() {
		const { obj } = this.props;
		const totalPrice = obj.courses.reduce((total, item) => {
			return total + item.price;
		}, 0)
		return (
			<tr className="v-middle table-row-item" data-id={obj._id}>
				<td className="text-left">
					<div className="d-flex flex-column">
						{obj.student.name}
						<small className="text-muted">{obj.student.phone}</small>
						<small className="text-muted">{obj.student.email}</small>
					</div>
				</td>
				<td className="text-left">
					<div className="d-flex flex-column">
						{obj.courses.map((course, index) => (
							<div key={index}>{course.name}</div>
						))}
						<small className="text-muted">{obj.courses.length} khóa học</small>
					</div>
				</td>
				<td className="text-left">
					{totalPrice?.toLocaleString("vi-VN")} đ
				</td>
				<td className="text-left">
					{this.getStatusLabel(obj.status)}
				</td>
				<td className="text-left">
					<div className="d-flex flex-column">
						<span>{moment(obj.created_at).format(
							'DD/MM/YYYY HH:mm',
						)}</span>
						{<small className="text-muted">Hết hạn:
							{moment(obj.created_at)
								.add(7, 'days')
								.format(
									'DD/MM/YYYY HH:mm',
								)}</small>}
					</div>
				</td>
				<td className="text-left">
					{obj?.creator?.name}
				</td>
				<td className="text-right">
					<div className="item-action">
						<div className="text-right">
							<Dropdown align="end">
								<Dropdown.Toggle
									variant="link"
									bsPrefix="btn"
									style={{ padding: '0', border: 'none' }}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="currentColor"
										className="bi bi-three-dots-vertical"
										viewBox="0 0 16 16"
										color='black'
									>
										<path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
									</svg>
								</Dropdown.Toggle>
								<Dropdown.Menu className="shadow-sm">
									<Dropdown.Item onClick={() => this.props.onView(obj._id)}>
										<span className="d-flex align-items-center">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2 bi bi-eye" viewBox="0 0 16 16">
												<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z" />
												<path d="M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
											</svg>
											Xem chi tiết
										</span>
									</Dropdown.Item>
									<Dropdown.Item onClick={() => this.props.onCopy(obj._id)}>
										<span className="d-flex align-items-center">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2 bi bi-clipboard" viewBox="0 0 16 16">
												<path d="M10 1.5v1H6v-1H2a1 1 0 0 0-1 1V14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2.5a1 1 0 0 0-1-1h-4z" />
											</svg>
											Sao chép liên kết
										</span>
									</Dropdown.Item>
									<Dropdown.Item onClick={() => this.props.onOpen(obj._id)}>
										<span className="d-flex align-items-center">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2 bi bi-box-arrow-up-right" viewBox="0 0 16 16">
												<path fillRule="evenodd" d="M6 3a1 1 0 0 0-1 1v1h1V4h6v6h-1v1h1a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H6zm.5 6a.5.5 0 0 0 0 1H9v2.5a.5.5 0 0 0 1 0V10h2.5a.5.5 0 0 0 0-1H10V6.5a.5.5 0 0 0-1 0V9H6.5z" />
											</svg>
											Mở liên kết
										</span>
									</Dropdown.Item>
									<Dropdown.Divider />
									<Dropdown.Item onClick={() => this.props.onCancel(obj._id)} className="text-danger">
										<span className="d-flex align-items-center">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2 bi bi-x-circle" viewBox="0 0 16 16">
												<path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14z" />
												<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
											</svg>
											Hủy liên kết
										</span>
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

class SearchFilter extends Component {
	constructor(props) {
		super(props);
		this.state = {
			keyword: "",
			creatorId: "",
			course: "",
			status: "",
		};
	}

	handleKeywordChange = (e) => {
		this.setState({ keyword: e.target.value });
	};

	handleChangeFilter = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.onFilterApply(this.state);
	};

	render() {
		const { creators } = this.props;
		return (
			<div
				className="mt-4 d-inline-block"
				style={{
					padding: '10px',
					border: '1px solid #dee2e6',
					borderRadius: '8px'
				}}
			>
				<form className='flex'>
					<div className='input-group lesson-page'>
						<input
							type="text"
							className="form-control form-control-theme keyword-custom"
							placeholder="Nhập từ khoá tìm kiếm..."
							onChange={this.handleKeywordChange}
							value={this.state.keyword}
							name="keyword"
							style={{ width: '300px' }}
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

						<div className="ml-16">
							<select
								className="custom-select"
								style={{ width: '250px' }}
								value={this.state.creatorId}
								name="creatorId"
								onChange={this.handleChangeFilter}
							>
								<option value="" key="">Người tạo</option>
								{creators.map(item => (
									<option value={item._id} key={item._id}> {item.fullname} </option>
								))}
							</select>
						</div>
						{/* <div className='ml-16'>
							<select
								className="custom-select"
								style={{ width: '250px' }}
								value={this.state.course}
								name="course"
								onChange={this.handleChangeFilter}
							>
								<option value="">Khóa học</option>
							</select>
						</div> */}
						<div className='ml-16'>
							<select
								className="custom-select"
								style={{ width: '250px' }}
								value={this.state.status}
								name="status"
								onChange={this.handleChangeFilter}
							>
								<option value="">Trạng thái</option>
								<option value="PENDING">Chờ thanh toán</option>
								<option value="PAID">Đã thanh toán</option>
								<option value="EXPIRED">Đã hết hạn</option>
								<option value="CANCELLED"> Đã huỷ </option>
							</select>
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
		);
	}
}

class QuickPayments extends Component {
	constructor(props) {
		super();
		this.state = {
			totalLinks: 0,
			pendingPayment: 0,
			completedPayment: 0,
			expiredPayment: 0,
			revenue: 0,
			showDetailModal: false,
			selectedOrder: null,
			page: 1,
			limit: 20,
			isShowModalCreateLinkPayment: false,
			dataModalCreateLinkPayment: null,
			filterParams: { // New state for filter parameters
				keyword: "",
				creatorId: "",
				course: "",
				status: "",
			},
		};
		this._isMounted = false; // Initialize the flag
	}

	async componentDidMount() {
		this._isMounted = true; // Set flag to true when component mounts

		const payload = {
			page: this.state.page,
			limit: this.state.limit,
			...this.state.filterParams // Include filter parameters
		}

		await Promise.all([
			this.props.listPaymentLinks(payload),
			this.props.listStatistics(),
			this.props.listCreator()
		])

		if (this._isMounted) { // Check before setting state
			this.setState({
				revenue: this.props.statistics?.total_revenue,
				totalLinks: this.props.statistics?.total_payments,
				pendingPayment: this.props.statistics?.pending_payments,
				completedPayment: this.props.statistics?.success_payments,
				expiredPayment: this.props.statistics?.expired_payment,
				page: this.props.page,
				limit: this.props.limit
			})
		}

		const { state } = this.props.location;
		if (state && state.data) {
			if (this._isMounted) { // Check before setting state
				this.setState({
					isShowModalCreateLinkPayment: true,
					dataModalCreateLinkPayment: state.data
				})
			}
		}
	}

	componentWillUnmount() {
		this._isMounted = false; // Set flag to false when component unmounts
	}

	handleFilterApply = async (params) => {
		if (this._isMounted) { // Check before setting state
			this.setState({ filterParams: params, page: 1 }, async () => {
				const payload = {
					page: 1,
					limit: this.state.limit,
					...this.state.filterParams,
				};
				await this.props.listPaymentLinks(payload);
			});
		}
	};

	handleViewDetail = (order) => {
		if (this._isMounted) { // Check before setting state
			this.setState({
				selectedOrder: order,
				showDetailModal: true,
			});
		}
	};

	handleCloseDetailModal = () => {
		if (this._isMounted) { // Check before setting state
			this.setState({
				showDetailModal: false,
				selectedOrder: null,
			});
		}
	};
	 
	handleCloseModalCreateLinkPayment = () => {
		if (this._isMounted) { // Check before setting state
			this.setState({
				dataModalCreateLinkPayment: null,
			})
		}
	}

	handleChangePage = async pageNumber => {
		window.scrollTo({ top: 0, behavior: "smooth" });

		if (this._isMounted) { // Check before setting state
			this.setState({
				page: pageNumber
			})
		}
		let { limit } = this.state;

		const payload = {
			page: pageNumber,
			limit: this.state.limit,
			...this.state.filterParams // Include filter parameters
		}
		await this.props.listPaymentLinks(payload)
	};

	fetchRows() {
		if (this.props.paymentLinks.paymentLinks instanceof Array) {
			return this.props.paymentLinks.paymentLinks.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						handleCheckedIds={this.handleCheckedIds}
						updatePost={this.props.updatePost}
						addDataRemovePost={this.props.addDataRemovePost}
						check={this.props.check}
						updateOrderStatus={this.props.updateOrderStatus}
						onView={() => this.handleViewDetail(object)}
						onCopy={
							(id) => {
							  copy(`https://www.ssstudy.vn/thanh-toan/${id}`);
							  notification.success({
								message: 'Đã sao chép liên kết',
								placement: 'topRight',
								top: 50,
								duration: 3,
							  });
							}
						}
						onOpen={(id) => window.open(`https://www.ssstudy.vn/thanh-toan/${id}`, '_blank')}
						onCancel={(id) => console.log("Hủy liên kết", id)}
					/>
				);
			});
		}
	}

	handleChange = async e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState(
			{
				[name]: value,
			},
			async () => {
				if (this._isMounted) { // Check before setting state
					const payload = {
						page: this.state.page,
						limit: this.state.limit,
						...this.state.filterParams,
					};
					await this.props.listPaymentLinks(payload);
				}
			}
		);
	};

	render() {
		const { totalLinks, pendingPayment, completedPayment, expiredPayment, revenue, showDetailModal, selectedOrder, dataModalCreateLinkPayment } = this.state;
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
				<div className='page-content page-container' id='page-content' style={{
					backgroundColor: '#ffffff'
				}}>
					<div className='padding'>
						<h2 className="text-md text-highlight sss-page-title">Quản lý liên kết thanh toán</h2>
						<div className='block-table-exam'>
							<div className='toolbar'>
								<div className='input-group'>
									<div className='d-flex flex-column'>
										<span style={{
											color: '#ff8345',
											fontWeight: '500',
											fontSize: '18px'
										}}
										>Quản lý liên kết thanh toán</span>
										<span className='mt-2'>
											Theo dõi và quản lý các liên kết thanh toán đã tạo
										</span>
									</div>
								</div>
							</div>

							<div className='d-flex mt-4' style={{ gap: '6px' }}>
								<Box title="Tổng liên kết" value={totalLinks} />
								<Box title="Chờ thanh toán" value={pendingPayment} />
								<Box title="Đã thanh toán" value={completedPayment} />
								<Box title="Hết hạn" value={expiredPayment} />
								<Box title="DOANH THU" value={`${revenue.toLocaleString("vi-VN")} đ`} />
							</div>

							<div>
								<SearchFilter creators={this.props.creators} onFilterApply={this.handleFilterApply} />
							</div>

							<div className="mt-4 row !overflow-x-auto" style={{ overflowX: 'scroll' }}>
								<div className="col-sm-12 w-full">
									<table className="table table-theme table-row v-middle min-w-[900px]">
										<thead className="text-muted">
											<tr>
												<HeadingSortColumn
													name="student_name"
													content="Học sinh"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="course"
													content="Khóa học"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="total"
													content="Tổng tiền"
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
													name="created_at"
													content="Ngày tạo"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="creator"
													content="Người tạo"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<th className='text-right'>
													Thao tác
												</th>
											</tr>
										</thead>
										<tbody>
											{this.fetchRows()}
										</tbody>
									</table>
								</div>
							</div>
							<div className="row listing-footer">
								<div className="col-sm-1">
									<select
										className="custom-select w-70"
										name="limit"
										value={this.state.limit}
										onChange={this.handleChange}
									>
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
						</div>
					</div>
				</div>

				{showDetailModal && selectedOrder && (
					<div
						className="modal fade show"
						style={{
							display: "block",
							background: "rgba(0,0,0,0.5)",
							zIndex: "1050",
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							overflowY: "auto",
						}}
					>
						<div
							className="modal-dialog modal-lg modal-dialog-centered"
							style={{ maxWidth: "720px", margin: "5% auto" }}
						>
							<div
								className="modal-content p-4"
								style={{
									borderRadius: "8px",
									padding: "32px",
								}}
							>
								<div className="d-flex justify-content-between align-items-start mb-3">
									<h2 style={{ fontWeight: "700", fontSize: "28px" }}>
										Thông tin chi tiết
									</h2>
									<button
										className="btn btn-link"
										onClick={this.handleCloseDetailModal}
										style={{
											fontSize: "24px",
											color: "#000",
											textDecoration: "none",
											fontWeight: "400",
											lineHeight: "1",
										}}
									>
										&times;
									</button>
								</div>

								{selectedOrder.status === "PAID" && (
									<span
										style={{
											background: "#d2f4df",
											color: "#219653",
											borderRadius: "16px",
											padding: "4px 12px",
											fontSize: "14px",
											fontWeight: "500",
											display: "inline-block",
											marginBottom: "24px"
										}}
									>
										Đã thanh toán
									</span>
								)}

								{selectedOrder.status === "PENDING" && (
									<span
										style={{
											background: "#d2f4df",
											color: "#219653",
											borderRadius: "16px",
											padding: "4px 12px",
											fontSize: "14px",
											fontWeight: "500",
											display: "inline-block",
											marginBottom: "24px"
										}}
									>
										Chờ thanh toán
									</span>
								)}

								{selectedOrder.status === "EXPIRED" && (
									<span
										style={{
											background: "#d2f4df",
											color: "#219653",
											borderRadius: "16px",
											padding: "4px 12px",
											fontSize: "14px",
											fontWeight: "500",
											display: "inline-block",
											marginBottom: "24px"
										}}
									>
										Hết hạn
									</span>
								)}

								{selectedOrder.status === "CANCELLED" && (
									<span
										style={{
											background: "#d2f4df",
											color: "#219653",
											borderRadius: "16px",
											padding: "4px 12px",
											fontSize: "14px",
											fontWeight: "500",
											display: "inline-block",
											marginBottom: "24px"
										}}
									>
										Đã hủy
									</span>
								)}

								<div className="row">
									<div className="col-md-6 mb-4">
										<h5 style={{ fontWeight: "600" }}>Thông tin học sinh</h5>
										<p><strong>Họ tên:</strong> {selectedOrder?.student?.name}</p>
										<p><strong>Số điện thoại:</strong> {selectedOrder.student.phone}</p>
										<p><strong>Email:</strong> {selectedOrder.student.email}</p>
										<p><strong>Loại:</strong> <em>{selectedOrder.student.name ? 'Học sinh hiện có' : 'Học sinh mới'}</em></p>
									</div>
									<div className="col-md-6 mb-4">
										<h5 style={{ fontWeight: "600" }}>Thông tin thời gian</h5>
										<p><strong>Ngày tạo:</strong> {
											moment(selectedOrder.created_at).format(
												'DD/MM/YYYY HH:mm',
											)
										}</p>
										<p><strong>Hết hạn:</strong> {
											moment(selectedOrder.created_at)
												.add(7, 'days')
												.format(
													'DD/MM/YYYY HH:mm',
												)
										}</p>
										<p><strong>Ngày thanh toán:</strong>{
											selectedOrder?.payment_date ? moment(selectedOrder?.payment_date).format(
												'DD/MM/YYYY HH:mm',
											) : ''
										}</p>
									</div>
								</div>

								<h5 style={{ fontWeight: "600" }}>Khóa học đăng ký</h5>
								<div className="mt-3">
									{selectedOrder.courses.map((course, idx) => (
										<div
											key={idx}
											className="d-flex justify-content-between align-items-center mb-2"
											style={{
												background: "#f5f5f5",
												padding: "10px 16px",
												borderRadius: "6px",
												fontSize: "15px"
											}}
										>
											<span>{course.name}</span>
											<span>
												{course.update_price.toLocaleString("vi-VN")} đ
											</span>
										</div>
									))}
								</div>

								<hr className="mt-4" />
								<div className="d-flex justify-content-between align-items-center">
									<strong style={{ fontWeight: "600", fontSize: "16px" }}>
										TỔNG THANH TOÁN
									</strong>
									<strong style={{ color: "#e53935", fontSize: "18px" }}>
										{selectedOrder.total_money.toLocaleString("vi-VN")} đ
									</strong>
								</div>
							</div>
						</div>
					</div>
				)}

				{dataModalCreateLinkPayment && (
					<div
					className="modal fade show"
					style={{
					  display: 'block',
					  background: 'rgba(0,0,0,0.5)',
					  zIndex: 1050,
					  position: 'fixed',
					  top: 0,
					  left: 0,
					  width: '100vw',
					  height: '100vh',
					  overflowY: 'auto',
					}}
				  >
					<div
					  className="modal-dialog modal-lg modal-dialog-centered"
					  style={{ maxWidth: '600px', margin: '5% auto' }}
					>
					  <div
						className="modal-content"
						style={{
						  borderRadius: '8px',
						  padding: '32px',
						  background: '#fff',
						  border: 'none',
						}}
					  >
						{/* Header */}
						<div className="d-flex justify-content-between align-items-start mb-4">
						  <div>
							<h2 style={{ fontWeight: 700, fontSize: '22px', marginBottom: 8 }}>
							  Liên kết thanh toán đã được tạo
							</h2>
							<p style={{ margin: 0, color: '#666' }}>
							  Sao chép liên kết dưới đây và gửi cho học sinh/phụ huynh
							</p>
						</div>
						<button
							className="btn btn-link"
							onClick={this.handleCloseModalCreateLinkPayment}
							style={{
							  fontSize: '24px',
							  color: '#000',
							  textDecoration: 'none',
							  fontWeight: 400,
							  lineHeight: 1,
							}}
						>
							&times;
						</button>
						</div>
				  
						{/* Link copy */}
						<div className="d-flex align-items-center" style={{ marginBottom: 12 }}>
						  <input
							type="text"
							className="form-control"
							style={{
							  border: '1px solid #ccc',
							  borderRadius: 6,
							  paddingRight: 40,
							  height: 40,
							}}
							value={`https://www.ssstudy.vn/thanh-toan/${dataModalCreateLinkPayment._id}`}
							readOnly
						  />
						  <span
							className="cursor-pointer"
							onClick={() => {
							  copy(`https://www.ssstudy.vn/thanh-toan/${dataModalCreateLinkPayment._id}`);
							  notification.success({
								message: 'Đã sao chép liên kết',
								placement: 'topRight',
								top: 50,
								duration: 3,
							  });
							}}
							style={{
							  position: 'absolute',
							  right: 45,
							  marginTop: 2,
							  cursor: 'pointer',
							}}
						  >
							<img src="/assets/img/icon-copy.svg" alt="copy" />
						  </span>
						</div>
				  
						{/* Ghi chú */}
						<p style={{ fontSize: 13, color: '#999' }}>
						  Lưu ý: Liên kết này có hiệu lực trong 7 ngày và chỉ có thể sử dụng một lần.
						</p>
				  
						{/* Thông tin đơn hàng */}
						<div
						  style={{
							background: '#f9f9f9',
							border: '1px solid #eee',
							borderRadius: 6,
							padding: '16px 20px',
							marginTop: 24,
						  }}
						>
						  <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Thông tin đơn hàng:</h4>
						  <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
							<li style={{ marginBottom: 6 }}>
							  Tổng khoá học: {dataModalCreateLinkPayment.courses.length}
							</li>
							<li style={{ marginBottom: 6 }}>Tên khoá học:</li>
							<ul style={{ paddingLeft: 12 }}>
							  {dataModalCreateLinkPayment.courses.map((item, idx) => (
								<li key={idx} style={{ marginBottom: 4 }}>
								  <b>{item.name}</b>
								</li>
							  ))}
							</ul>
							<li style={{ marginTop: 10 }}>
							  Tổng tiền:{' '}
							  <b style={{ color: '#f57224' }}>
								{dataModalCreateLinkPayment.total_money.toLocaleString('vi-VN')} đ
							  </b>
							</li>
						  </ul>
						</div>
					  </div>
					</div>
				  </div>
					
				)}

			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		paymentLinks: state.paymentLinks,
		statistics: state.paymentLinks.statistics,
		total: state.paymentLinks.total,
		page: state.paymentLinks.page,
		limit: state.paymentLinks.limit,
		creators: state.paymentLinks.creators,
		// Add success message from Redux state
		successMessage: state.paymentLinks.successMessage,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listPaymentLinks,
			listStatistics,
			listCreator,
		},
		dispatch,
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(QuickPayments),
);
export default Container;
