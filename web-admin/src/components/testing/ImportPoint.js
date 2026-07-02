import React, { Component } from "react";
import * as XLSX from "xlsx";
import { notification, Select } from "antd";
import { importPoint } from "../../redux/exam/action";
import { listClassroom } from "../../redux/classroom/action";
import { listClass } from "../../redux/exam/action";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Dropzone from "react-dropzone";
import { ExcelRenderer } from "react-excel-renderer";
import { OutTable } from "./OutTable";

const { Option } = Select;

class ImportPoint extends Component {
	constructor(props) {
		super();
		this.state = {
			files: [],
			rows: null,
			cols: null,
			classroom_id: "",
			err: true
		};
	}

	readExcel = event => {
		const f = event.target.files[0];

		var name = f.name;
		const reader = new FileReader();
		reader.onload = evt => {
			/* Parse data */
			const bstr = evt.target.result;
			const wb = XLSX.read(bstr, { type: "binary" });
			/* Get first worksheet */
			const wsname = wb.SheetNames[0];
			const ws = wb.Sheets[wsname];
			/* Convert array of arrays */
			const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
			/* Update state */
			this.setState({
				excel: data
			});
		};
		reader.readAsBinaryString(f);
	};

	onDrop = files => {
		this.setState({ files });
		ExcelRenderer(files[0], (err, resp) => {
			if (err) {
			} else {
				this.setState({
					cols: resp.cols,
					rows: resp.rows
				});
			}
		});
	};

	handleClick = async () => {
		if (this.state.files.length === 0) {
			await this.setState({
				err: true
			});
			notification.error({
				message: "Vui lòng gửi file lên",
				placement: "topRight",
				top: 50,
				duration: 3
			});
		} else if (this.state.classroom_id === "") {
			await this.setState({
				err: true
			});
			notification.error({
				message: "Vui lòng chọn lớp",
				placement: "topRight",
				top: 50,
				duration: 3
			});
		} else {
			const data = new FormData();
			data.append("exam_id", this.props.exam_id);
			data.append("files", this.state.files[0]);
			data.append("classroom_id", this.state.classroom_id);

			await this.props.importPoint(data);

			this.setState({
				files: [],
				rows: null,
				cols: null,
				classroom_id: "",
				err: false
			});
			notification.success({
				message: "Nhập điểm thành công",
				placement: "topRight",
				top: 50,
				duration: 3
			});
		}
	};

	async componentDidMount() {
		await this.props.listClass({ exam_id: this.props.exam_id });
	}

	handleSearch = async keyword => {
		if (keyword) {
			const data = {
				limit: 999,
				keyword: keyword
			};
			await this.props.listClassroom(data);
		}
	};

	handleChangeClass = value => {
		this.setState({ classroom_id: value });
	};

	fetchOptions() {
		return this.props.classList.map(item => (
			<Option key={item.classroom.id}>{item.classroom.name}</Option>
		));
	}

	render() {
		const files = this.state.files.map(file => (
			<li key={file.name}>{file.name}</li>
		));

		var heightWindow = window.innerHeight;
		var style = {};
		if (this.state.files.length != 0) {
			style = {
				height: heightWindow * (4.6 / 5)
			};
		} else {
			style = {
				padding: "10px"
			};
		}

		return (
			<div
				className="modal-dialog animate fade-down modal-lg"
				data-class="fade-down"
				style={{
					minWidth: this.state.files.length != 0 ? "90%" : "40%"
				}}
			>
				<div className="modal-content" style={style}>
					<div className="modal-header">
						<div className="modal-title text-md">
							Nhập điểm cho sinh viên
						</div>
						<button className="close" data-dismiss="modal">
							×
						</button>
					</div>
					<div className="modal-body">
						<div className="row">
							<div
								className={
									this.state.files.length != 0
										? "col-4"
										: "col-12"
								}
							>
								<Dropzone onDrop={this.onDrop}>
									{({ getRootProps, getInputProps }) => (
										<section className="container">
											<div
												{...getRootProps({
													className: "dropzone"
												})}
												style={{ textAlign: "center" }}
											>
												<input {...getInputProps()} />
												<p>Drop files here !</p>
											</div>
											{this.state.files.length != 0 ? (
												<aside className="mt-2">
													<h5>File upload</h5>
													<ul>{files}</ul>

													<div className="row text-center">
														<label className="col-sm-4 col-form-label text-left">
															Lớp
														</label>
														<div className="col-sm-8">
															<Select
																showSearch
																value={
																	this.state
																		.classroom_id
																}
																placeholder="Nhập từ khoá tìm kiếm"
																style={{
																	width:
																		"100%"
																}}
																defaultActiveFirstOption={
																	false
																}
																showArrow={
																	false
																}
																filterOption={
																	false
																}
																onSearch={
																	this
																		.handleSearch
																}
																onChange={
																	this
																		.handleChangeClass
																}
																notFoundContent={
																	null
																}
															>
																{this.fetchOptions()}
															</Select>
														</div>
													</div>

													<div className="row text-center">
														<div className="col-12">
															<button
																className="btn btn-primary mt-2"
																onClick={
																	this
																		.handleClick
																}
																data-dismiss={this.state.err ? "" : "modal"}
															>
																Nhập điểm
															</button>
														</div>
													</div>
												</aside>
											) : null}
										</section>
									)}
								</Dropzone>
							</div>
							{this.state.files.length != 0 ? (
								<div className="col-8">
									<h4>Dữ liệu điểm sinh viên</h4>
									{this.state.rows != null &&
										this.state.cols != null ? (
										<OutTable
											data={this.state.rows}
											columns={this.state.cols}
											tableClassName="table table-border"
											tableHeaderRowClass=""
										/>
									) : null}
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		classList: state.exam.classList
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ importPoint, listClassroom, listClass },
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ImportPoint)
);
