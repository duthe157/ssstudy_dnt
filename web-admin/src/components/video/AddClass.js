import React, { Component } from "react";
import { notification, Select } from "antd";
import { listClassroom } from "../../redux/classroom/action";
import { addClass, removeClass, listClass } from "../../redux/video/action";
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
		await this.props.listClass({ video_id: this.props.video_id });
	}

	onChange = async value => {
		await this.setState({
			classroom_id: value
		});
	};

	handleSubmit = async () => {
		if (this.state.video_id !== "") {
			const data = {
				video_id: this.props.video_id,
				classroom_id: this.state.classroom_id
			};
			await this.props.addClass(data);
			await this.props.listClass({ video_id: this.props.video_id });
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
				data-class="fade-down"
			>
				<div className="modal-content">
					<div className="modal-header">
						<div className="modal-title text-md">
							Thêm lớp cho video
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
											<th>STT</th>
											<th width="">Tên lớp</th>
											<th width="100px" />
										</tr>
									</thead>
									<tbody>
										{this.props.classList.length !== 0 ? (
											<div>{this.fetchRows()}</div>
										) : (
											<span className="p-3">
												Chưa có dữ liệu
											</span>
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
		classList: state.video.classList
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
