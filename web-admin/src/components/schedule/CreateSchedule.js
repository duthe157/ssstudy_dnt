import React, { Component } from "react";
import { notification, Select, DatePicker, TimePicker } from "antd";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";

import {
	listClassroom,
	createSchedule,
	listSubject,
	listSchedule,
	resetStateSchedule,
} from "../../redux/schedule/action";

const { Option } = Select;
const format = "HH:mm";

class CreateSchedule extends Component {
	constructor(props) {
		super();
		var time = new Date();
		var timeString = time.getHours() + ":" + time.getSeconds();
		this.state = {
			subject_id: "",
			classroom_id: "",

			num_day_of_week: "",
			day_of_week_text: "",

			support_teacher: "",
			note: "",

			started_at: "",
			finished_at: "",
		};
	}

	fetchOptions() {
		if (this.props.classrooms instanceof Array) {
			return this.props.classrooms.map((obj, i) => {
				return <Option key={obj._id.toString()}>{obj.name}</Option>;
			});
		}
	}

	handleChangeTag = async (value) => {
		await this.setState({
			filter: value,
		});
	};

	async componentDidMount() {
		await this.props.listSubject({ limit: 999 });
		await this.props.listClassroom({ limit: 999 });
	}

	onChange = async (e) => {
		var name = e.target.name;
		let value = e.target.value;

		await this.setState({
			[name]: value,
		});

		if (name === "classroom_id") {
			let indexFinded = this.props.classrooms
				.map((ele) => ele._id.toString())
				.indexOf(value);

			if (indexFinded >= 0) {
				var { room } = this.props.classrooms[indexFinded];
			}

			await this.setState({
				room,
			});
		}
	};

	fetchRowsSubject = () => {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id.toString()}>
						{obj.name}
					</option>
				);
			});
		}
	};

	fetchOptions = () => {
		if (this.props.classrooms instanceof Array) {
			if (this.state.subject_id !== "") {
				return this.props.classrooms.map((obj, i) => {
					if (obj.subject.id === this.state.subject_id) {
						return (
							<option value={obj._id} key={obj._id.toString()}>
								{obj.name}
							</option>
						);
					}
				});
			}
		}
	};

	handleSubmit = async (e) => {
		e.preventDefault();
		if (this.state.subject_id === "") {
			this.subjectInput.focus();
			notification.warning({
				message: "Vui lòng chọn môn học",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else if (this.state.classroom_id === "") {
			this.classroomInput.focus();
			notification.warning({
				message: "Vui lòng chọn lớp học",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else if (this.state.num_day_of_week === "") {
			this.dayInput.focus();
			notification.warning({
				message: "Vui lòng chọn ngày trong tuần",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else if (this.state.started_at === "") {
			this.startTimeInput.focus();
			notification.warning({
				message: "Vui lòng chọn thời gian bắt đầu",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else if (this.state.finished_at === "") {
			this.finishTimeInput.focus();
			notification.warning({
				message: "Vui lòng chọn thời gian kết thúc",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else {
			var data = {
				num_day_of_week: this.state.num_day_of_week,
				support_teacher: this.state.support_teacher,
				started_at: this.state.started_at,
				finished_at: this.state.finished_at,
				note: this.state.note,
				classroom_id: this.state.classroom_id,
			};

			await this.props.createSchedule(data);

			if (this.props.createSuccess === true) {
				await this.props.listSchedule(this.getData());
				await this.setState({
					subject_id: "",
					classroom_id: "",
					room: "",

					num_day_of_week: "",

					support_teacher: "",
					note: "",

					started_at: "",
					finished_at: "",
				});
			}
		}
	};

	getData = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.state.limit,
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		return data;
	};

	changeDateStart = (date, dateString) => {
		if (date !== null) {
			this.setState({
				started_at: date.format("HH:mm"),
			});
		}
	};

	changeDateEnd = (date, dateString) => {
		if (date !== null) {
			this.setState({
				finished_at: date.format("HH:mm"),
			});
		}
	};

	componentWillUnmount() {
		this.props.resetStateSchedule();
	}

	render() {
		return (
			<div
				className='modal-dialog animate fade-down modal-lg'
				data-class='fade-down'
				style={{ minWidth: 1000 }}
			>
				<div className='modal-content'>
					<div className='modal-header'>
						<div className='modal-title text-md'>
							Tạo mới thời khóa biểu
						</div>
						<button className='close' data-dismiss='modal'>
							×
						</button>
					</div>
					<div className='modal-body'>
						<div className='row'>
							<div className='col-sm-4 col-form-div'>
								<div className='form-group'>
									<label className='col-sm-12 col-form-label'>
										Môn học
									</label>
									<div className='col-sm-12'>
										<select
											name='subject_id'
											className='custom-select'
											onChange={this.onChange}
											value={this.state.subject_id}
											ref={(input) =>
												(this.subjectInput = input)
											}
										>
											<option value=''>
												-- Chọn môn --
											</option>
											{this.fetchRowsSubject()}
										</select>
									</div>
								</div>
							</div>

							<div className='col-sm-4 col-form-div'>
								<div className='form-group'>
									<label className='col-sm-12 col-form-label'>
										Lớp học
									</label>
									<div className='col-sm-12'>
										<select
											name='classroom_id'
											className='custom-select'
											onChange={this.onChange}
											value={this.state.classroom_id}
											ref={(input) =>
												(this.classroomInput = input)
											}
										>
											<option value=''>
												-- Chọn lớp --
											</option>
											{this.fetchOptions()}
										</select>
									</div>
								</div>
							</div>

							<div className='col-sm-4'>
								<div className='form-group'>
									<label className='col-sm-12 col-form-label'>
										Phòng học
									</label>
									<div className='col-sm-12'>
										<input
											name='room'
											placeholder='Phòng học'
											className='form-control'
											onChange={this.onChange}
											value={this.state.room}
											readOnly
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='row mt-3'>
							<div className='col-sm-4 col-form-div'>
								<div className='form-group'>
									<label className='col-sm-12 col-form-label'>
										Ngày trong tuần
									</label>
									<div className='col-sm-12'>
										<select
											className='custom-select'
											value={this.state.num_day_of_week}
											name='num_day_of_week'
											onChange={this.onChange}
											ref={(input) =>
												(this.dayInput = input)
											}
										>
											<option value=''>
												-- Chọn thứ --
											</option>
											<option value='1'>Thứ 2</option>
											<option value='2'>Thứ 3</option>
											<option value='3'>Thứ 4</option>
											<option value='4'>Thứ 5</option>
											<option value='5'>Thứ 6</option>
											<option value='6'>Thứ 7</option>
											<option value='0'>Chủ nhật</option>
										</select>
									</div>
								</div>
							</div>
							<div className='col-sm-4 col-form-div'>
								<div className='form-group'>
									<label className='col-sm-12 col-form-label'>
										Giờ bắt đầu
									</label>
									<div className='col-sm-12'>
										<TimePicker
											format={"HH:mm"}
											onChange={this.changeDateStart}
											placeholder='Chọn thời gian'
											ref={(input) =>
												(this.startTimeInput = input)
											}
										/>
									</div>
								</div>
							</div>
							<div className='col-sm-4'>
								<div className='form-group'>
									<label className='col-sm-12 col-form-label'>
										Giờ kết thúc
									</label>
									<div className='col-sm-12'>
										<TimePicker
											format={"HH:mm"}
											onChange={this.changeDateEnd}
											placeholder='Chọn thời gian'
											ref={(input) =>
												(this.finishTimeInput = input)
											}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='row mt-3'>
							<div className='col-sm-12 text-center'>
								<div className='form-group'>
									<div className='col-sm-12'>
										<textarea
											name='note'
											placeholder='Ghi chú'
											className='form-control'
											onChange={this.onChange}
											value={this.state.note}
											rows='3'
										></textarea>
									</div>
								</div>
							</div>
						</div>

						<div className='row mt-3'>
							<div className='col-sm-12 text-center'>
								<button
									className='btn btn-success mt-2'
									onClick={(e) => this.handleSubmit(e)}
								>
									Tạo mới
								</button>
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
		classrooms: state.schedule.classrooms,
		subjects: state.schedule.subjects,
		createSuccess: state.schedule.createSuccess,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listClassroom,
			createSchedule,
			listSubject,
			resetStateSchedule,
			listSchedule,
		},
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(CreateSchedule)
);
