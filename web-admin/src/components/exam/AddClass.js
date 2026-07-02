import React, { Component } from "react";
import { notification, Select } from "antd";
import { listClassroom } from "../../redux/classroom/action";
import { addClass, removeClass, listClass } from "../../redux/exam/action";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import AddClassRow from "./AddClassRow";
const { Option } = Select;

class AddClass extends Component {
	constructor(props) {
		super();
		this.state = {
			classroom_id: ""
		};
	}

	fetchOptions() {
		if (this.props.classrooms instanceof Array) {
			return this.props.classrooms.map((obj, i) => {
				return <Option key={obj._id.toString()}>{obj.name}</Option>;
			});
		}
	}

	fetchRows() {
		if (this.props.classList instanceof Array) {
			return this.props.classList.map((object, i) => {
				return (
					<AddClassRow
						obj={object}
						key={i}
						index={i}
						selectQuestion={this.selectQuestion}
					/>
				);
			});
		}
	}

	handleChangeTag = async value => {
		await this.setState({
			filter: value
		});
	};

	async componentDidMount() {
		await this.props.listClassroom({ limit: 999 });
		await this.props.listClass({ exam_id: this.props.exam_id });
	}

	onChange = async value => {
		await this.setState({
			classroom_id: value
		});
	};

	handleSubmit = async () => {
		if (this.state.classroom_id !== "") {
			const data = {
				exam_id: this.props.exam_id,
				classroom_id: this.state.classroom_id
			};
			await this.props.addClass(data);
			await this.props.listClass({ exam_id: this.props.exam_id });
			this.setState({
				classroom_id: ""
			});
		} else {
			notification.warning({
				message: "Vui lòng chọn lớp !",
				placement: "topRight",
				top: 50,
				duration: 3,
				style: {
					zIndex: 1050
				}
			});
		}
	};

	render() {
		return (
			<div
				className="modal-dialog animate fade-down modal-lg"
				data-class="fade-down" style={{ minWidth: 1000 }}
			>
				<div className="modal-content">
					<div className="modal-header">
						<div className="modal-title text-md">
							Áp dụng đề thi cho các lớp
						</div>
						<button className="close" data-dismiss="modal">
							×
						</button>
					</div>
					<div className="modal-body">
						<div className="row">
							<div className="col-md-7">
								<div className="toolbar">
									<div className="input-group">
										<Select
											showSearch
											style={{ width: "100%" }}
											placeholder="Chọn lớp học"
											value={this.state.classroom_id}
											optionFilterProp="children"
											onChange={this.onChange}
											onSearch={this.onSearch}
											filterOption={(input, option) =>
												option.props.children
													.toLowerCase()
													.indexOf(
														input.toLowerCase()
													) >= 0
											}
										>
											{this.fetchOptions()}
										</Select>
									</div>
								</div>
							</div>
							<div className="col-md-5">
								<button
									className="btn btn-primary "
									onClick={this.handleSubmit}
								>
									Thêm lớp
								</button>
							</div>
						</div>

						<div className="row mt-3">
							<div className="col-sm-12">
								<table className="table table-theme table-row v-middle">
									<thead className="text-muted">
										<tr>
											<th className="text-center">STT</th>
											<th width="">Tên lớp</th>
											<th className="text-center">Đúng giờ?</th>
											<th width="">Bắt đầu</th>
											<th width="">Kết thúc</th>
											<th width=""></th>
											<th width=""></th>
										</tr>
									</thead>
									<tbody>
										{this.props.classList.length !== 0 ? (
											<div>{this.fetchRows()}</div>
										) : (
												<tr>
													<td colSpan="6">
														<span className="p-3">
															Chưa có dữ liệu
													</span>
													</td>
												</tr>
											)}
									</tbody>
								</table>
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
		classrooms: state.classroom.classrooms,
		classList: state.exam.classList
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listClassroom, addClass, removeClass, listClass },
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(AddClass)
);
