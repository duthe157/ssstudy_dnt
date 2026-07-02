import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showStudent, updateStudent, forceActivateUser } from '../../redux/student/action';
import { listBill } from '../../redux/bill/action';
import { listClassroom } from '../../redux/classroom/action';
import { listOrder } from "../../redux/order/action";
import { Radio } from "antd";

import baseHelpers from '../../helpers/BaseHelpers';
import { DatePicker } from 'antd';
import moment from "moment";

import { isUndefined } from 'util';

const CDN = "https://cdn.luyenthitiendat.vn/";

class OrderHistory extends Component {
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
		let labelName = "Chưa có";
		switch (status) {
			case 0:
				labelName = "Đã hoàn thành";
				break;
			case 1:
				labelName = "Đang xử lý";
				break;
			default:
				labelName = "chưa có";
		}

		return labelName;
	}

	getPaymentByStatus = (method) => {
		let labelName = "";
		switch (method) {
			case "COD":
				labelName = "Nhận hàng thanh toán";
				break;
			case "BANK_TRANSFER":
				labelName = "Chuyển khoản ngân hàng";
				break;
			default:
				labelName = "Chưa xác định";
		}

		return labelName;
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
				<td className='text-center'>
					{order.code}
				</td>
				<td className='text-center'>
					{order.created_at ? baseHelpers.formatDateToString(order.created_at) : ""}
				</td>
				<td className='text-center'>
					{order.customer_name}
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

class CourseListItem extends Component {
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

	getPaymentByStatus = (method) => {
		let labelName = "";
		switch (method) {
			case "COD":
				labelName = "Nhận hàng thanh toán";
				break;
			case "BANK_TRANSFER":
				labelName = "Chuyển khoản ngân hàng";
				break;
			default:
				labelName = "Chưa xác định";
		}

		return labelName;
	}


	render() {
		let classroom = this.props.obj;
		return (
			<tr className='v-middle table-row-item' data-id={17}>
				<td className='text-left'>
					{classroom.subject.name}
				</td>
				<td className='text-left'>
					{classroom.name}
				</td>
				<td className='text-center'>
					{classroom.sobuoihoc}
				</td>
				<td className='text-center'>
					{classroom.buoidahoc}
				</td>
				<td className='text-center'>
					{
						baseHelpers.currencyFormat(classroom.sobuoihoc - classroom.buoidahoc)
					}
				</td>

			</tr>
		);
	}
}

class BillRefundListItem extends Component {
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

	getPaymentByStatus = (method) => {
		let labelName = "";
		switch (method) {
			case "COD":
				labelName = "Nhận hàng thanh toán";
				break;
			case "BANK_TRANSFER":
				labelName = "Chuyển khoản ngân hàng";
				break;
			default:
				labelName = "Chưa xác định";
		}

		return labelName;
	}


	render() {
		let diary = this.props.obj;
		return (
			<tr className='v-middle table-row-item' data-id={17}>
				<td className='text-left'>
					{diary.payment_date ? baseHelpers.formatDateToString(diary.payment_date) : ""}
				</td>
				<td className='text-center'>
					{diary.subject}
				</td>
				<td className='text-center'>
					{diary.class_cancel}
				</td>
				<td className='text-center'>
					{this.getPaymentByStatus(diary.payment_form)}
				</td>
				<td className='text-center'>
					{diary.refund_amount}
				</td>
				<td className='text-center'>
					{
						this.getPaymentByStatus(diary.complete_form)
					}
				</td>
				<td className='text-center'>
					{diary.reason}
				</td>
				<td className='text-center'>
					{diary.staff}
				</td>
				<td className="text-right">
					{diary.note}
				</td>
			</tr>
		);
	}
}


class StudentEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			code: '',
			fullname: '',
			email: '',
			gender: 'Male',
			classroom: '',
			parent_phone: '',
			parent_name: '',
			phone: '',
			// point: '',
			school: '',
			dob: '',
			avatar_base64: [],
			avtPreview: "",
			from_date: "",
			to_date: "",
			diaries: [
				{
					payment_date: "09/10/2022",
					subject: "Toán",
					class_cancel: "[CT13] Lớp chuyên toán",
					payment_form: "BANK_TRANSFER",
					refund_amount: "350000",
					complete_form: "COD",
					reason: "Thay đổi giá khóa học",
					staff: "Cao Tuấn Đạt",
					note: "Không hài lòng"
				},
				{
					payment_date: "09/10/2022",
					subject: "Toán",
					class_cancel: "[CT13] Lớp chuyên toán",
					payment_form: "BANK_TRANSFER",
					refund_amount: "350000",
					complete_form: "COD",
					reason: "Thay đổi giá khóa học",
					staff: "Cao Tuấn Đạt",
					note: "Không hài lòng"
				},
				{
					payment_date: "09/10/2022",
					subject: "Toán",
					class_cancel: "[CT13] Lớp chuyên toán",
					payment_form: "BANK_TRANSFER",
					refund_amount: "350000",
					complete_form: "COD",
					reason: "Thay đổi giá khóa học",
					staff: "Cao Tuấn Đạt",
					note: "Không hài lòng"
				},
			]
		};
	}

	async componentDidMount() {
		await this.props.showStudent(this.props.match.params.id);
		if (this.props.student) {
			var {
				code,
				fullname,
				email,
				gender,
				classroom,
				parent_phone,
				parent_name,
				phone,
				// point,
				school,
				dob,
				avatar
			} = this.props.student;

			if (code) {
				let data = {
					user_code: code
				}
				await this.props.listClassroom(data);
				await this.props.listOrder(data);

				data = {
					user_code: code,
					type: "HOAN_HUY"
				}
				await this.props.listBill(data);
			}

			this.setState({
				code,
				fullname,
				email,
				gender,
				classroom,
				parent_phone,
				parent_name,
				phone,
				// point,
				school,
				dob: dob ? moment(dob).format("YYYY-MM-DD") : null,
				avtPreview: avatar ? CDN + avatar : ""
			});
		}
	}

	_onChange = async (e) => {
		var name = e.target.name;
		let value = e.target.value;
		let checked = e.target.checked;
		let avtPreview = "";

		if (name === "is_featured" || name === "status") {
			value = checked;
		}

		if (name === "avatar_base64") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					avtPreview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			value = value;

			this.setState({
				[name]: value,
				avtPreview
			});
		} else {
			this.setState({
				[name]: value,
			});
		}
	};

	handleSubmit = async e => {
		e.preventDefault();
		const data = {
			id: this.props.match.params.id,
			fullname: this.state.fullname,
			email: this.state.email,
			gender: this.state.gender,
			avatar_base64: this.state.avatar_base64,
			classroom: this.state.classroom,
			parent_phone: this.state.parent_phone,
			parent_name: this.state.parent_name,
			phone: this.state.phone,
			school: this.state.school,
			dob: this.state.dob,
		}
		await this.props.updateStudent(data);
	}

	fetchOrderHistories() {
		if (this.props.orders instanceof Array && this.props.orders.length > 0) {
			return this.props.orders.map((object, i) => {
				return (
					<OrderHistory
						obj={object}
						key={object._id}
						index={i}
					/>
				);
			});
		}
	}

	fetchListCourses() {
		let { userClassroomInfo } = this.props;

		if (this.props.classrooms instanceof Array && this.props.classrooms.length > 0) {
			return this.props.classrooms.map((object, i) => {
				object.sobuoihoc = (userClassroomInfo && userClassroomInfo[object._id] && userClassroomInfo[object._id].sobuoihoc) ? userClassroomInfo[object._id].sobuoihoc : 0;
				object.buoidahoc = (userClassroomInfo && userClassroomInfo[object._id] && userClassroomInfo[object._id].buoidahoc) ? userClassroomInfo[object._id].buoidahoc : 0;
				return (
					<CourseListItem
						obj={object}
						key={object._id}
						index={i}
					/>
				);
			});

		}
	}

	fetchDiaries() {
		if (this.state.diaries instanceof Array && this.state.diaries.length > 0) {
			return this.state.diaries.map((object, i) => {
				return (
					<BillRefundListItem
						obj={object}
						key={i}
						index={i}
					/>
				);
			});
		}
	}

	handleUploadImage = () => {
		document.getElementById("input-upload-image").click();
	}

	remoAvatar = () => {
		document.getElementById("input-upload-image").value = "";
		this.setState({
			avatar_base64: [],
			avtPreview: ""
		})
	}

	changeDateStart = (date) => {
		if (date !== null) {
			this.setState({
				from_date: date.format("YYYY/MM/DD HH:mm"),
			});
		}
	};

	changeDateEnd = (date) => {
		if (date !== null) {
			this.setState({
				to_date: date.format("YYYY/MM/DD HH:mm"),
			});
		}
	};

	render() {
		var {
			code,
			fullname,
			email,
			gender,
			classroom,
			parent_phone,
			parent_name,
			phone,
			// point,
			school,
			dob,
			histories,
			diaries
		} = this.state;
		return (
			<div>
				<div className="page-content page-container page-edit-student" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Thành viên</h2>

						<div className="block-item-content">
							<div className="block-title-actions">
								<h3 className='title-block mb-2'>Thông tin chung</h3>
								<div className="ml-auto">
									<button
										type="button"
										className="btn btn-primary mb-2"
										onClick={async () => {
											const id = this.props.match && this.props.match.params ? this.props.match.params.id : null;
											if (id) {
												await this.props.forceActivateUser(id);
											}
										}}
									>
										Kích hoạt tài khoản
									</button>
								</div>
							</div>
							<div className="content">
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="avatar_base64"
									id="input-upload-image"
								/>
								<div className="block-image">
									{
										!this.state.avtPreview
											?
											<button type="button" onClick={this.handleUploadImage}>
												<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
												<span>Thêm avatar</span>
											</button>
											:
											<div className="block-image-overlay">
												<img
													id="output"
													src={this.state.avtPreview}
													alt="your image"
													className="image"
												/>
												<div className="middle">
													<div className="text" onClick={this.remoAvatar}>Hủy chọn</div>
												</div>
											</div>
									}
								</div>
								<div className="block-content">
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "144px" }}>
											<label className="text-form-label">Mã học sinh</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="code"
													onChange={this._onChange}
													style={{ background: "#ededed" }}
													value={code}
												/>
											</div>
										</div>

										<div className="form-group mr-16" style={{ width: 350 }}>
											<label className="text-form-label">Tên học sinh</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="fullname"
													onChange={this._onChange}
													value={fullname}
												/>
											</div>
										</div>

										<div className="form-group mr-16" style={{ width: 350 }}>
											<label className="text-form-label">Email</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="email"
													onChange={this._onChange}
													value={email}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: 350 }}>
											<label className="text-form-label">Số điện thoại</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="phone"
													onChange={this._onChange}
													value={phone}
												/>
											</div>
										</div>
									</div>

									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Ngày sinh</label>
											<div>
												<input
													type="date"
													className="form-control"
													name="dob"
													onChange={this._onChange}
													value={dob}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Trường</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="school"
													onChange={this._onChange}
													value={school}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Lớp</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="classroom"
													onChange={this._onChange}
													value={classroom}
												/>
											</div>
										</div>
									</div>
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Họ và tên phụ huynh</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="parent_name"
													onChange={this._onChange}
													value={parent_name}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Số điện thoại phụ huynh</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="parent_phone"
													onChange={this._onChange}
													value={parent_phone}
												/>
											</div>
										</div>
									</div>
									<div className='item-input-text'>
										<div className="form-group mr-16">
											<label className=" col-form-label">Giới tính</label>
											<div>
												<Radio.Group
													onChange={this._onChange}
													name="gender"
													value={gender}
												>
													<Radio value="Male">Nam</Radio>
													<Radio value="FeMale">Nữ</Radio>
												</Radio.Group>
											</div>
										</div>
										{/* <div className="form-group mr-16" style={{ width: 160 }}>
											<label className="text-form-label">Điểm</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="point"
													onChange={this._onChange}
													value={point}
												/>
											</div>
										</div> */}
									</div>
								</div>
							</div>

						</div>
						<div className="block-action-footer">
							<button type="button" className="btn-cancel" onClick={() => this.props.history.push("/student")}>
								<img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
								Hủy
							</button>
							<button type="button" className="btn-submit ml-16" onClick={this.handleSubmit}>
								Cập nhật
								<img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
							</button>
						</div>
						{/* <div className="block-history-order"> */}
						<div className="block-item-content">
							<h3 className='title-block mb-0'>Lịch sử mua hàng</h3>
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
											Hình thức
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
										this.fetchOrderHistories()
									}
									{
										!this.props.orders || this.props.orders.length == 0
										&&
										<tr>
											<td colSpan={8} className="text-center">Chưa mua hàng!</td>
										</tr>
									}
								</tbody>

							</table>
						</div>

						<div className="block-item-content">
							<h3 className='title-block mb-0'>Danh sách khóa học</h3>
							<table className='table table-theme table-row v-middle'>
								<thead className='text-muted'>
									<tr>
										<th className='text-left'>
											Môn đang học
										</th>
										<th className='text-left'>
											Lớp đang học
										</th>
										<th className='text-center'>
											Số buổi
										</th>
										<th className="text-center">
											Đã học
										</th>
										<th className="text-center">
											Số buổi còn lại
										</th>
									</tr>
								</thead>


								<tbody>
									{
										this.fetchListCourses()
									}
									{
										!this.props.classrooms || this.props.classrooms.length == 0
										&&
										<tr>
											<td colSpan={8} className="text-center">Không tham gia khóa học!</td>
										</tr>
									}
								</tbody>

							</table>
						</div>

						<div className="block-item-content" style={{ display: "none" }} >
							<div className="block-title-actions">
								<h3 className='title-block mb-0 mr-16'>Nhật ký hoàn hủy</h3>

								<form className="flex block-filter-book" onSubmit={this.onSubmit}>
									<div className="input-group">


										<DatePicker
											format={
												"YYYY/MM/DD HH:mm"
											}
											value={this.state.from_date
												? moment(this.state.from_date)
												: null}
											showTime={{ format: 'HH:mm' }}
											placeholder="Từ ngày"
											onChange={this.changeDateStart}
										/>
										<DatePicker
											format={
												"YYYY/MM/DD HH:mm"
											}
											value={this.state.to_date
												? moment(this.state.to_date)
												: null}
											showTime={{ format: 'HH:mm' }}
											placeholder="Đến ngày"
											onChange={this.changeDateEnd}
											className="ml-2"
										/>

										<div className='btn-filter ml-16'>
											<button type='sumbit'>
												<img src='/assets/img/icon-filter.svg' className='mr-10' alt='' />
												<span>Lọc kết quả</span>
											</button>
										</div>

									</div>
								</form>
							</div>
							<table className='table table-theme table-row v-middle'>
								<thead className='text-muted'>
									<tr>
										<th className='text-left'>
											Ngày đóng tiền
										</th>
										<th className='text-center'>
											Môn
										</th>
										<th className='text-center'>
											Lớp hủy
										</th>
										<th className='text-center'>
											Hình thức đóng tiền
										</th>
										<th className='text-center'>
											Số tiền hoàn
										</th>
										<th className='text-center'>
											Hình thức hoàn
										</th>
										<th className="text-center">
											Lí do
										</th>
										<th className="text-center">
											Nhân viên
										</th>
										<th className="text-center">
											Ghi chú
										</th>
									</tr>
								</thead>


								<tbody>
									{
										this.fetchDiaries()
									}
									{
										!diaries || diaries.length == 0
										&&
										<tr>
											<td colSpan={8} className="text-center">Không có dữ liệu!</td>
										</tr>
									}
								</tbody>

							</table>
						</div>

					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		token: state.auth.token,
		student: state.student.student,
		redirect: state.student.redirect,
		classrooms: state.classroom.classrooms,
		userClassroomInfo: state.classroom.userClassroomInfo,
		bills: state.bill.bills,
		orders: state.order.orders
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ showStudent, updateStudent, listClassroom, listBill, listOrder, forceActivateUser }, dispatch);
}

let VideoEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(StudentEdit),
);

export default VideoEditContainer;
