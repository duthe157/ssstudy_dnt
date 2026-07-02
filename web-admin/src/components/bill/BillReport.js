import React, { Component } from "react";
import { CSVLink } from "react-csv";
import { notification, DatePicker } from "antd";

import {
	listBill,
	addDelete,
	deleteBill,
	checkAll,
	listBillReport,
	resetStateBill,
	revenueByCompany,
	revenueBySubject,
	revenueByStaff
} from "../../redux/bill/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { listSubject } from "../../redux/subject/action";
import { listAccountant } from "../../redux/student/action";
import { listClassroom } from "../../redux/classroom/action";
import ReportByCompany from "./ReportByCompany";
import ReportBySubject from "./ReportBySubject";
import ReportByAccountant from "./ReportByAccountant";
import ReportByClass from "./ReportByClass";
import ReportByPaymentLimit from "./ReportByPaymentLimit";
import Pagination from 'react-js-pagination';


import { Select } from "antd";
const { Option } = Select;

class Row extends Component {
	constructor(props) {
		super();
		this.state = {};
	}

	render() {
		return (
			<tr className='v-middle' data-id={17}>
				<td>{this.props.index + 1}</td>

				<td className='text-left'>{this.props.obj._id.name}</td>

				<td className='text-right'>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.total.toLocaleString("en-EN", {
							minimumFractionDigits: 0,
						})}
					</span>
				</td>
			</tr>
		);
	}
}

class BillReport extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: 20,
			page: 1,
			ids: [],
			checkAll: false,
			subject_ids: "",
			classroom_id: "",
			staff_ids: "",
			from_date: "",
			to_date: "",
			by_type: '',
			payment_method: '',
			show_subject: true,
			show_creator: false,
			headers: [
				{ label: "STT", key: "stt" },
				{ label: "Lớp học", key: "_id.name" },
				{ label: "Doanh thu", key: "total" },
			],
			billReports: [],
		};
	}

	UNSAFE_componentWillReceiveProps = async (nextProps) => {
		if (nextProps.billReports.length > 0) {
			let billReports = nextProps.billReports.map((ele, i) => {
				return Object.assign(
					{},
					{
						...ele,
						stt: i + 1,
					}
				);
			});
			await this.setState({
				billReports,
			});
		}
	};

	fetchRows() {
		if (this.props.billReports instanceof Array) {
			return this.props.billReports.map((object, i) => {
				return <Row obj={object} key={object._id} index={i} />;
			});
		}
	}

	onChange = async (e) => {
		e.preventDefault();
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});

		// if (name === "by_type") {
		// 	if (value === "BY_COMPANY") {
		// 		let params = {
		// 			from_date: this.state.from_date,
		// 			to_date: this.state.to_date
		// 		}
		// 		await this.props.revenueByCompany(params);
		// 	}
		// }


		if (name === "subject_id") {
			let params = {};

			if (value) {
				params = {
					subject_id: value,
					limit: 100,
				};
				await this.props.listClassroom(params);
			}
		}
	};

	onChangeSubject(val) {
		this.setState({
			subject_ids: val
		})
	}

	onChangeStaff(val) {
		this.setState({
			staff_ids: val
		})
	}

	getData = async (pageNumber = 1) => {
		// const data = {};
		// if (this.state.keyword != null) {
		// 	data["keyword"] = this.state.keyword;
		// }
		// if (this.state.subject_id !== "") {
		// 	data["subject_id"] = this.state.subject_id;
		// }
		// if (this.state.creator_id !== "") {
		// 	data["creator_id"] = this.state.creator_id;
		// }

		// if (this.state.payment_method !== "") {
		// 	data["payment_method"] = this.state.payment_method;
		// }

		// if (this.state.from_date != null) {
		// 	data["from_date"] = this.state.from_date;
		// }
		// if (this.state.to_date != null) {
		// 	data["to_date"] = this.state.to_date;
		// }
		// data['type'] = this.state.by_type;
		// return data;

		let params = {
			from_date: this.state.from_date,
			to_date: this.state.to_date,
		};


		if (this.state.by_type == "BY_COMPANY") {
			params.subject_ids = this.state.subject_ids || [];
			await this.props.revenueByCompany(params);
		}

		if (this.state.by_type == "BY_SUBJECT") {
			params.subject_ids = this.state.subject_ids || [];
			await this.props.revenueBySubject(params);
		}

		if (this.state.by_type === "BY_ACCOUNTANT") {
			params.staff_ids = this.state.staff_ids || [];
			await this.props.revenueByStaff(params);
		}


	};

	async componentDidMount() {
		await this.props.listSubject({ limit: 999 });
		await this.props.listAccountant({ limit: 999 });
	}

	onSubmit = async (e) => {
		e.preventDefault();
		if (this.state.from_date === "") {
			this.fromDateInput.focus();
			notification.warning({
				message: "Vui lòng chọn thời gian lọc!",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else if (this.state.to_date === "") {
			this.toDateInput.focus();
			notification.warning({
				message: "Vui lòng chọn thời gian lọc!",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else {
			// await this.props.listBillReport(this.getData());
			// if (this.state.by_type == "BY_COMPANY") {
			// 	let params = {
			// 		from_date: this.state.from_date,
			// 		to_date: this.state.to_date
			// 	};
			// 	await this.props.revenueByCompany(params);
			// }

			// if (this.state.by_type == "BY_SUBJECT") {
			// 	let params = {
			// 		from_date: this.state.from_date,
			// 		to_date: this.state.to_date,
			// 		subject_ids: this.state.subject_ids || []
			// 	};
			// 	await this.props.revenueBySubject(params);
			// }

			// if (this.state.by_type === "BY_ACCOUNTANT") {
			// 	let params = {
			// 		from_date: this.state.from_date,
			// 		to_date: this.state.to_date,
			// 		staff_ids: this.state.staff_ids || []
			// 	};
			// 	await this.props.revenueByStaff(params);
			// }
			this.getData(1);
		}
	};

	UNSAFE_componentWillReceiveProps(nextProps) { }

	changeDateStart = (date, dateString) => {
		if (date !== null) {
			this.setState({
				from_date: date.format("YYYY/MM/DD"),
			});
		}
	};

	changeDateEnd = (date, dateString) => {
		if (date !== null) {
			this.setState({
				to_date: date.format("YYYY/MM/DD"),
			});
		}
	};

	fetchRowsSubject = () => {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return (
					// <option value={obj._id} key={obj._id.toString()}>
					// 	{obj.name}
					// </option>
					<Option key={obj._id.toString()} value={obj._id}>{obj.name}</Option>
				);
			});
		}
	};

	fetchRowsClassroom = () => {
		if (this.props.classrooms instanceof Array) {
			return this.props.classrooms.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id.toString()}>
						{obj.name}
					</option>
				);
			});
		}
	};


	fetchAccountant = () => {
		if (this.props.listAccountants instanceof Array) {
			return this.props.listAccountants.map((obj, i) => {
				return (
					<Option key={obj._id.toString()} value={obj._id}>{obj.fullname + '-' + obj.email}</Option>
				);
			});
		}
	};

	renderTotal = () => {
		var total = 0;
		if (this.props.billReports.length > 0) {
			this.props.billReports.forEach((ele) => {
				if (ele.total) {
					total += ele.total;
				}
			});
		}
		return total;
	};

	// fetchOptions = () => {
	// 	if (this.props.classrooms instanceof Array) {
	// 		if (this.state.subject_id !== "") {
	// 			// eslint-disable-next-line array-callback-return
	// 			return this.props.classrooms.map((obj, i) => {
	// 				if (obj.subject.id === this.state.subject_id) {
	// 					return (
	// 						<option value={obj._id} key={obj._id.toString()}>
	// 							{obj.name}
	// 						</option>
	// 					);
	// 				}
	// 			});
	// 		}
	// 	}
	// };

	componentWillUnmount() {
		this.props.resetStateBill();
	}

	fetchContent = () => {
		let { by_type } = this.state;

		switch (by_type) {
			case "BY_COMPANY":
				return <ReportByCompany reports={this.props.billCompanyReports} />;
			case "BY_SUBJECT":
				return <ReportBySubject reports={this.props.billSubjectReports} />;
			case "BY_ACCOUNTANT":
				return <ReportByAccountant reports={this.props.billStaffReports} />;
			case "BY_CLASSROOM":
				return <ReportByClass />;
			// case "BY_PAYMENT_LIMIT":
			// 	return <ReportByPaymentLimit />;
			default:
				return "";

		}
	}

	render() {
		return (
			<div>
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<h2 className="text-md text-highlight sss-page-title">Báo cáo doanh thu</h2>
						<div className='block-item-content'>
							<div className="block-title-actions">
								<h3 className="title-block mb-0">Loại thống kê</h3>
								<div className='ml-16'>
									<select
										className="custom-select"
										value={this.state.by_type}
										name="by_type"
										onChange={this.onChange}
									>
										<option value="">Chọn loại thống kê</option>
										<option value="BY_COMPANY">Doanh thu theo toàn công ty</option>
										<option value="BY_SUBJECT">Doanh thu theo môn học</option>
										<option value="BY_ACCOUNTANT">Doanh thu theo thu ngân</option>
										{/* <option value="BY_CLASSROOM">Doanh thu theo lớp</option>
										<option value="BY_PAYMENT_LIMIT">Doanh thu theo hạn mức đóng tiền</option> */}
									</select>
								</div>
							</div>
						</div>
						<div className='block-item-content'>
							<div className="item-input-text">
								<DatePicker
									format={"DD/MM/YYYY"}
									onChange={this.changeDateStart}
									placeholder='Từ ngày'
									className='ml-2'
									ref={(input) =>
										(this.fromDateInput = input)
									}
								/>
								<DatePicker
									format={"DD/MM/YYYY"}
									onChange={this.changeDateEnd}
									placeholder='Đến ngày'
									className='ml-2'
									ref={(input) =>
										(this.toDateInput = input)
									}
								/>
								{
									(this.state.by_type == "BY_SUBJECT" || this.state.by_type == "BY_COMPANY")
									&&
									<>
										<div className="form-group ml-16 mb-0" style={{ width: 300 }}>
											<Select
												showSearch
												mode="multiple"
												placeholder="-- Chọn môn học -- "
												optionFilterProp="children"
												onChange={(val) => this.onChangeSubject(val)}
												name="subject_id"
											>
												{this.fetchRowsSubject()}
											</Select>
										</div>

										{/* <div className="form-group ml-16 mb-0" style={{ width: 300 }}>
										<select
											className="custom-select"
											value={this.state.classroom_id}
											name="classroom_id"
											onChange={this.onChange}
										>
											<option value="">Chọn lớp học</option>
											{this.fetchRowsClassroom()}
										</select>
									</div> */}
									</>
								}
								{
									this.state.by_type == "BY_ACCOUNTANT"
									&&
									<div className="form-group ml-16 mb-0" style={{ width: 300 }}>
										<Select
											showSearch
											mode="multiple"
											placeholder="-- Chọn nhân viên -- "
											optionFilterProp="children"
											onChange={(val) => this.onChangeStaff(val)}
											name="staff_id"
										>
											{this.fetchAccountant()}
										</Select>
									</div>
								}
								{/* <div className="form-group ml-16 mb-0">
									<select
										style={{ maxWidth: 300 }}
										id="payment_method_input"
										name='payment_method'
										className='custom-select'
										onChange={this.onChange}
										value={this.state.payment_method}
									>
										<option value=''>Tất cả HTTT</option>
										<option value='CASH'>Tiền mặt</option>
										<option value='BANK_TRANSFER'>Chuyển khoản</option>
									</select>
								</div> */}
								<div className="btn-filter ml-16">
									<button type="button" onClick={this.onSubmit}>
										<img src="/assets/img/icon-filter.svg" className="mr-10" />
										<span>Lọc kết quả</span>
									</button>
								</div>
							</div>
						</div>

						<div className='row'>
							<div className='col-sm-12'>
								{
									this.fetchContent()
								}
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
		billReports: state.bill.billReports,
		billCompanyReports: state.bill.billCompanyReports,
		billSubjectReports: state.bill.billSubjectReports,
		billStaffReports: state.bill.billStaffReports,
		// classrooms: state.schedule.classrooms,
		classrooms: state.classroom.classrooms,
		subjects: state.subject.subjects,
		listAccountants: state.student.accountants,
		limit: state.bill.limit,
		page: state.bill.page,
		total: state.bill.total,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listAccountant,
			listBill,
			deleteBill,
			addDelete,
			checkAll,
			listSubject,
			listBillReport,
			resetStateBill,
			listClassroom,
			revenueByCompany,
			revenueBySubject,
			revenueByStaff
		},
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(BillReport)
);
