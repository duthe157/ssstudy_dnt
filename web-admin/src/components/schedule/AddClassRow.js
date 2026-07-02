import React, { Component } from "react";
import moment from "moment";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { DatePicker } from "antd";
import { removeClass, listClass, sent } from "../../redux/exam/action";

class AddClassRow extends Component {
	constructor(props) {
		super();
		this.state = {
			obj: "",
			started_at: "",
			finished_at: "",
			is_fixed_time: false
		};
	}

	handleCheck = async () => {
		const data = {
			exam_id: this.props.obj.exam_id,
			classroom_id: this.props.obj.classroom.id
		};
		await this.props.removeClass(data);
		await this.props.listClass({ exam_id: this.props.obj.exam_id });
	};

	handleSend = async () => {
		const data = {
			exam_id: this.props.obj.exam_id,
			classroom_id: this.props.obj.classroom.id,
			started_at: this.state.started_at,
			is_fixed_time: this.state.is_fixed_time,
			finished_at: this.state.finished_at
		};
		await this.props.sent(data);
		await this.props.listClass({ exam_id: this.props.obj.exam_id });
	};

	onChange = e => {
		var name = e.target.name;
		let value = e.target.value;
		if (name === 'is_fixed_time') {
			value = e.target.checked;
		}
		this.setState({
			[name]: value
		});
	};

	changeDateStart = (date, dateString) => {
		if (date !== null) {
			this.setState({
				started_at: date.format("YYYY/MM/DD HH:mm"),
			});
		}
	};

	changeDateEnd = (date, dateString) => {
		if (date !== null) {
			this.setState({
				finished_at: date.format("YYYY/MM/DD HH:mm"),
			});
		}
	};

	render() {
		return (
			<tr className="v-middle" data-id={17}>
				<td className="text-center">{this.props.index + 1}</td>
				<td className="flex">{this.props.obj.classroom.name}</td>
				<td className="flex text-center"><input type="checkbox" name="is_fixed_time" checked={this.props.obj.is_fixed_time} onChange={this.onChange} /></td>
				<td className="flex">
					{
						this.props.obj.status === 'SENT' ?
							<span>{this.props.obj.started_at &&
								moment(this.props.obj.started_at).format(
									"DD/MM/YYYY HH:mm"
								)}</span>
							:
							<DatePicker
								format={
									"DD/MM/YYYY HH:mm"
								}
								showTime={{ format: "HH:mm" }}
								onChange={
									this
										.changeDateStart
								}
								placeholder="Chọn thời gian"
								className="form-control"
							/>
					}
				</td>
				<td className="flex">
					{
						this.props.obj.status === 'SENT' ?
							<span>{this.props.obj.finished_at &&
								moment(this.props.obj.finished_at).format(
									"DD/MM/YYYY HH:mm"
								)}</span>
							:
							<DatePicker
								format={
									"DD/MM/YYYY HH:mm"
								}
								showTime={{ format: "HH:mm" }}
								onChange={
									this
										.changeDateEnd
								}
								placeholder="Chọn thời gian"
								className="form-control"
							/>
					}
				</td>
				<td>
					{this.props.obj.status === "PENDING" ? (
						<button
							className="btn btn-sm btn-success mr-3"
							onClick={this.handleSend}
						>
							Gửi đề
						</button>
					) : 'Đã gửi đề'}

				</td>
				<td><button
					className="btn btn-sm btn-secondary"
					onClick={this.handleCheck}
				>
					Hủy
					</button></td>
			</tr>
		);
	}
}

function mapStateToProps(state) {
	return {};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ removeClass, listClass, sent }, dispatch);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(AddClassRow)
);
