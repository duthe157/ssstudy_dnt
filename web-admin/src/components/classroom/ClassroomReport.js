import React, { Component } from "react";
import { CSVLink } from "react-csv";
import Moment from 'moment';
import { Table, DatePicker } from "antd";
import { classroomReport } from "../../redux/classroom/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class ClassroomReport extends Component {
	constructor(props) {
		super(props);
		const date = new Date();
		// let month = date.getMonth() + 1;
		// let year = date.getFullYear();
		this.state = {
			// month: month,
			// year: year,
			from_date: '',
			to_date: '',
			headers: [
			],
		};
	}

	onChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	getData = () => {
		const data = {
			classroom_id: this.props.match.params.id,
			// month: parseInt(this.state.month),
			// year: parseInt(this.state.year),
			from_date: this.state.from_date ? this.state.from_date : "",
			to_date: this.state.to_date ? this.state.to_date : "",
		};

		return data;
	};

	async componentDidMount() {
		await this.props.classroomReport(this.getData());
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.classroomReport(this.getData());
	};

	// handleChange = async (e) => {
	// 	var name = e.target.name;
	// 	var value = e.target.value;
	// 	await this.setState({
	// 		[name]: value,
	// 	});
	// 	await this.props.classroomReport(this.getData());
	// };

	changeDateStart = async (date, dateString) => {
		if (date !== null) {
			await this.setState({
				from_date: date.format("YYYY/MM/DD") + ' ' + '00:00:00',
			});
		} else {
			await this.setState({
				from_date: '',
			});
		}
		await this.props.classroomReport(this.getData());
	};

	changeDateEnd = async (date, dateString) => {
		if (date !== null) {
			await this.setState({
				to_date: date.format("YYYY/MM/DD") + ' ' + '23:59:59',
			});
		} else {
			await this.setState({
				to_date: '',
			});
		}
		await this.props.classroomReport(this.getData());
	};

	handleCheckAll = (e) => {
		if (e.target.checked) {
			this.props.checkAll(true);
			this.setState({
				checkAll: e.target.checked,
			});
		} else {
			this.props.checkAll(false);
			this.setState({
				checkAll: e.target.checked,
			});
		}
	};

	// fetchMonth = () => {
	// 	const month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
	// 	return month.map((month) => {
	// 		return (
	// 			<option value={month} key={month}>
	// 				Tháng {month}
	// 			</option>
	// 		);
	// 	});
	// };

	// fetchYear = () => {
	// 	const datetime = new Date();

	// 	const yearNow = datetime.getFullYear();

	// 	const yearAgo = datetime.getFullYear() - 2;

	// 	var arr = [];
	// 	var i;
	// 	for (i = parseInt(yearAgo); i <= parseInt(yearNow); i++) {
	// 		arr.push(i);
	// 	}
	// 	if (arr.length !== 0) {
	// 		return arr.map((year) => {
	// 			return (
	// 				<option value={year} key={year}>
	// 					Năm {year}
	// 				</option>
	// 			);
	// 		});
	// 	}
	// };

	render() {
		const columns = this.props.columns;

		const data = this.props.members;
		var reportData = [];
		if (data) {
			for (let i = 0; i < data.length; i++) {
				const _obj = {
					stt: data[i].stt,
					code: data[i].code,
					name: data[i].fullname
				};

				for (let j = 0; j < columns.length; j++) {
					if (['code', 'name', 'stt', 'average'].indexOf(columns[j].key) < 0) {
						if (columns[j].dataIndex) {
							_obj[columns[j].dataIndex] = data[i][columns[j].dataIndex] ? data[i][columns[j].dataIndex] : 0;
							_obj[columns[j].key] = data[i][columns[j].dataIndex] ? data[i][columns[j].dataIndex] : 0;
						}
					}
				}

				_obj.average = data[i].average;
				reportData.push(_obj);
			}
		}


		return (
			<div>
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<h2 className='text-md text-highlight sss-page-title'>
							Báo cáo điểm:{" "}
							{this.props.classroom !== null
								? this.props.classroom.name
								: ""}
						</h2>

						<div className='mb-5'>
							<div className='toolbar'>
								<form className='flex' onSubmit={this.onSubmit}>
									<div className='input-group' style={{ alignItems: "center" }}>
										{/* <select
											style={{
												marginRight: 20,
												maxWidth: 300,
											}}
											className='custom-select'
											name='month'
											onChange={this.handleChange}
											value={this.state.month}
										>
											<option value=''>Chọn tháng</option>
											{this.fetchMonth()}
										</select> */}
										{/* <select
											style={{
												marginRight: 20,
												maxWidth: 300,
											}}
											className='custom-select'
											name='year'
											onChange={this.handleChange}
											value={this.state.year}
										>
											{this.fetchYear()}
										</select> */}
										<div>
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
										<div style={{ margin: "7px 15px" }}>
											<CSVLink filename={new Date().getTime() + '.csv'} headers={this.props.columns} className="btn btn-sm" data={reportData}>Xuất Excel</CSVLink>
										</div>
										<div style={{ margin: "11px 15px" }}>
											Sĩ số:{" "}
											<strong
												style={{ color: "#007bff" }}
											>
												{this.props.totalStudent}
											</strong>
										</div>
										<div style={{ margin: "11px 15px" }}>
											ĐTB Lớp:{" "}
											<strong
												style={{ color: "#007bff" }}
											>
												{!isNaN(
													Math.round(
														this.props.avgPoint * 10
													) / 10
												)
													? Math.round(
														this.props
															.avgPoint * 10
													) / 10
													: 0}
											</strong>
										</div>
									</div>
								</form>
							</div>
							<div className='row mt-3'>
								<div className='col-12'>
									<Table
										pagination={false}
										columns={columns}
										dataSource={data}
										scroll={{ x: 1500, y: "100%" }}
									/>
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
		members: state.classroom.members,
		columns: state.classroom.columns,
		classroom: state.classroom.classroom,
		totalStudent: state.classroom.total_student,
		avgPoint: state.classroom.avg_point,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ classroomReport }, dispatch);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ClassroomReport)
);
