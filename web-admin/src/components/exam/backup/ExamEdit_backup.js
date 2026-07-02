import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { webURL } from "../../config/config";
import { Radio, notification } from "antd";
import ListQuestion from "./ListQuestion";
import ExamQuestion from "./ExamQuestion";

import { listSubject } from "../../redux/subject/action";
import {
	createExam,
	ShowExam,
	updateExam,
	listExam,
} from "../../redux/exam/action";
import {
	listQuestion,
	assignValue,
	removeExamQuestion,
} from "../../redux/question/action";
import ConfigQuestionEdit from "./ConfigQuestionEdit";
import AddClass from "./AddClass";
import ImportPoint from "../testing/ImportPoint";

class ExamEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			name: "",
			code: "",
			questions: [],
			doc_link: "",
			video_link: "",
			keyword: "",
			subject_id: "",
			creating_type: "DEFAULT",
			type: "TRAC_NGHIEM",
			time: "",
			question_number: 0,
			data: [],
			examQuestions: [],

			fileData: "",
			doc_type: "GOOGLE_DRIVE",
		};
	}

	_onChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	handleSubmit = async () => {
		if (this.state.name === "") {
			this.nameInput.focus();
			notification.error({
				message: "Tên đề thi không được để trống",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else if (this.state.subject_id === "") {
			this.subjectInput.focus();
			notification.error({
				message: "Môn học là trường bắt buộc",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else if (this.state.subject_id === "") {
			this.timeInput.focus();
			notification.error({
				message: "Vui lòng nhập thời gian làm bài thi",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else {
			var exam_data = {
				id: this.props.match.params.id,
				name: this.state.name,
				code: this.state.code,
				questions: this.props.ids,
				video_link: this.state.video_link,
				subject_id: this.state.subject_id,
				creating_type: this.state.creating_type,
				type: this.state.type,
				time: this.state.time,
				total_question: this.state.question_number,
				chapter_ids: this.props.chapter_ids,
				doc_type: this.state.doc_type,
			};

			if (this.state.creating_type === "AUTO") {
				exam_data["configs"] = this.props.configs;
			}

			if (this.state.doc_type === "GOOGLE_DRIVE") {
				exam_data["doc_link"] = this.state.doc_link;
			}

			var data = new FormData();

			data.append("id", this.props.match.params.id);
			data.append("exam_data", JSON.stringify(exam_data));

			if (this.state.doc_type === "PDF") {
				data.append("files[0]", this.state.fileData);
			}

			await this.props.updateExam(data);
		}
	};

	fetchRowsSubject() {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id}>
						{obj.name}
					</option>
				);
			});
		}
	}

	getData = () => {
		const data = {
			limit: 999,
		};
		return data;
	};

	async componentDidMount() {
		await this.props.listSubject(this.getData());
		await this.props.ShowExam(this.props.match.params.id);
		await this.props.assignValue(this.props.exam);

		const {
			name,
			doc_link,
			video_link,
			questions,
			code,
			subject,
			type,
			creating_type,
			total_question,
			chapters,
			configs,
			time,
			doc_type,
		} = this.props.exam.exam;

		await this.setState({
			name,
			doc_link,
			video_link,
			questions,
			code,
			type,
			creating_type,
			chapters,
			configs,
			time,
			doc_type,
			chapter_ids: chapters,
			question_number: total_question,
			subject_id: subject.id,
		});
	}

	onChangeHandler = (event) => {
		if (this.state.doc_type == "PDF") {
			this.setState({
				fileData: event.target.files[0],
			});
		} else {
			this.setState({ doc_link: "" });
		}
	};

	render() {
		return (
			<div>
				<div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">
								Sửa đề thi
							</h2>
						</div>
						<div className="flex" />
						<div>
							<button
								className="btn btn-primary btn-sm mr-2"
								data-toggle="modal"
								data-target="#import-point"
								data-toggle-class="fade-down"
								data-toggle-class-target=".animate"
								title="Trash"
								id="btn-trash"
							>
								Nhập điểm
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
									className="feather feather-file-plus mx-2"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
									<line x1={12} y1={18} x2={12} y2={12} />
									<line x1={9} y1={15} x2={15} y2={15} />
								</svg>
							</button>

							<button
								className="btn btn-primary btn-sm mr-2"
								data-toggle="modal"
								data-target="#add-class"
								data-toggle-class="fade-down"
								data-toggle-class-target=".animate"
								title="Trash"
								id="btn-trash"
							>
								Áp dụng cho lớp
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
									className="feather feather-file-plus mx-2"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
									<line x1={12} y1={18} x2={12} y2={12} />
									<line x1={9} y1={15} x2={15} y2={15} />
								</svg>
							</button>

							<Link
								to={"/exam"}
								className="btn btn-sm text-white btn-primary"
							>
								<span className="d-none d-sm-inline mx-1">
									Quay lại
								</span>
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
									className="feather feather-arrow-right"
								>
									<line x1={5} y1={12} x2={19} y2={12} />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</Link>
						</div>
					</div>
				</div>

				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<div className="row">
							<div className="col-md-12">
								<div className="card">
									<div className="card-header">
										<strong>
											Đề thi: {this.state.name} | Mã: {this.state.code}
										</strong>
									</div>
									<div className="card-body">
										<div className="row">
											<div className="col-sm-5 col-form-div">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Tên đề thi
													</label>
													<div className="col-sm-12">
														<input
															type="text"
															className="form-control"
															name="name"
															onChange={
																this._onChange
															}
															value={
																this.state.name
															}
														/>
													</div>
												</div>
											</div>
											<div className="col-sm-5">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Môn học
													</label>
													<div className="col-sm-12">
														<select
															className="custom-select"
															value={
																this.state
																	.subject_id
															}
															name="subject_id"
															onChange={
																this._onChange
															}
															disabled
														>
															<option value="">
																-- Chọn môn học
																--
															</option>
															{this.fetchRowsSubject()}
														</select>
													</div>
												</div>
											</div>
											<div className="col-sm-2">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Loại đề thi
													</label>
													<div className="col-sm-12">
														<select
															className="custom-select"
															value={
																this.state.type
															}
															name="type"
															onChange={
																this._onChange
															}
															ref={(input) => {
																this.typeInput = input;
															}}
														>
															<option value="TRAC_NGHIEM">
																Trắc nghiệm
															</option>
															<option value="TU_LUAN">
																Tự luận
															</option>
														</select>
													</div>
												</div>
											</div>
										</div>

										<div className="row">
											<div className="col-sm-5 col-form-div">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Đề thi (PDF){" "}
														<Radio.Group
															className="ml-5"
															onChange={
																this._onChange
															}
															name="doc_type"
															value={
																this.state
																	.doc_type
															}
														>
															<Radio
																value={
																	"GOOGLE_DRIVE"
																}
															>
																Google drive
															</Radio>
															<Radio
																value={"PDF"}
															>
																Pdf
															</Radio>
														</Radio.Group>
													</label>
													<div className="col-sm-12">
														{this.state.doc_type ===
															"GOOGLE_DRIVE" ? (
																<input
																	type="text"
																	className="form-control"
																	placeholder="Nhập link tài liệu"
																	name="doc_link"
																	onChange={
																		this
																			._onChange
																	}
																	value={
																		this.state
																			.doc_link !==
																			null
																			? this
																				.state
																				.doc_link
																			: ""
																	}
																/>
															) : (
																<div>
																	<input
																		type="text"
																		className="form-control mb-2"
																		placeholder="Nhập link tài liệu"
																		name="doc_link"
																		onChange={
																			this
																				._onChange
																		}
																		value={
																			this
																				.state
																				.doc_link !==
																				null
																				? this
																					.state
																					.doc_link
																				: ""
																		}
																		readOnly
																	/>
																	<input
																		type="file"
																		className="form-control"
																		name="fileData"
																		onChange={
																			this
																				.onChangeHandler
																		}
																	/>
																</div>
															)}
													</div>
												</div>
											</div>
											<div className="col-sm-5 col-form-div">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Video lời giải
													</label>
													<div className="col-sm-12">
														<input
															type="text"
															className="form-control"
															name="video_link"
															onChange={
																this._onChange
															}
															value={
																this.state
																	.video_link !==
																	null
																	? this.state
																		.video_link
																	: ""
															}
														/>
													</div>
												</div>
											</div>
											<div className="col-sm-2">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Thời gian làm bài
													</label>
													<div className="col-sm-12">
														<input
															ref={(input) => {
																this.timeInput = input;
															}}
															type="number"
															className="form-control"
															name="time"
															onChange={
																this._onChange
															}
															value={
																this.state
																	.time !==
																	null &&
																	!isNaN(
																		this.state
																			.time
																	)
																	? parseInt(
																		this
																			.state
																			.time
																	)
																	: 0
															}
															min="0"
														/>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						{this.state.type === "TRAC_NGHIEM" && (
							<div className="row">
								<div className="col-md-12">
									<div className="card">
										<div className="card-header">
											<strong>Cấu hình câu hỏi</strong>
										</div>
										<div className="card-body">
											<div className="row">
												<div className="col-md-12 text-center">
													<div className="form-group">
														<Radio.Group
															onChange={
																this._onChange
															}
															name="creating_type"
															value={
																this.state
																	.creating_type
															}
														>
															<Radio
																value={
																	"DEFAULT"
																}
															>
																Thủ công
															</Radio>
															<Radio
																value={"AUTO"}
															>
																Tự động
															</Radio>
														</Radio.Group>
													</div>
												</div>
											</div>

											{this.state.creating_type ===
												"DEFAULT" ? (
													<div className="row">
														<div className="col-md-6">
															<div className="card">
																<div className="card-header">
																	<strong>
																		Câu đã chọn
																</strong>
																</div>
																<div className="card-body">
																	<div className="row">
																		<div className="col-sm-12">
																			<div className="form-group">
																				<ExamQuestion />
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														<div className="col-md-6">
															<div className="card">
																<div className="card-header">
																	<strong>
																		Tìm và chọn
																		câu hỏi
																</strong>
																</div>
																<div className="card-body">
																	<div className="row">
																		<div className="col-sm-12">
																			<div className="form-group">
																				<ListQuestion
																					subject_id={
																						this
																							.state
																							.subject_id
																					}
																				/>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
												) : (
													<div className="row">
														<div className="col-md-6">
															<div className="card">
																<div className="card-header">
																	<strong>
																		Câu đã chọn
																</strong>
																</div>
																<div className="card-body">
																	<div className="row">
																		<div className="col-sm-12">
																			<div className="form-group">
																				<ExamQuestion />
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														<div className="col-md-6">
															<div className="card">
																<div className="card-header">
																	<strong>
																		Tìm và chọn
																		câu hỏi
																</strong>
																</div>
																<div className="card-body">
																	<div className="row">
																		<div className="col-sm-12">
																			<div className="form-group">
																				<ConfigQuestionEdit
																					subject_id={
																						this
																							.state
																							.subject_id
																					}
																					count={
																						this
																							.state
																							.question_number
																					}
																					filter={
																						this
																							.state
																							.chapters
																					}
																					configs={
																						this
																							.state
																							.configs
																					}
																					chapterProps={
																						this
																							.state
																							.chapters
																					}
																					render={
																						true
																					}
																				/>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
												)}
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="row">
							<div className="col-md-12">
								<div className="form-group row">
									<div className="col-sm-12 text-center">
										<button
											className="btn btn-primary mt-2"
											onClick={this.handleSubmit}
										>
											Cập nhật
										</button>
									</div>
								</div>
							</div>
						</div>
						{/* modal them lop */}
						<div
							id="add-class"
							className="modal fade"
							data-backdrop="true"
							style={{ display: "none", minWidth: "1000px" }}
							aria-hidden="true"
						>
							<AddClass exam_id={this.props.match.params.id} />
						</div>

						{/* modal nhap diem */}
						<div
							id="import-point"
							className="modal fade"
							data-backdrop="true"
							style={{ display: "none", minWidth: "1000px" }}
							aria-hidden="true"
						>
							<ImportPoint exam_id={this.props.match.params.id} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		subjects: state.subject.subjects,
		questions: state.question.questions,
		examQuestions: state.question.examQuestions,
		ids: state.question.ids,
		exam: state.exam.exam,
		configs: state.category.configs,
		chapter_ids: state.category.chapter_ids,
		redirect: state.exam.redirect,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listSubject,
			createExam,
			listQuestion,
			ShowExam,
			assignValue,
			updateExam,
			removeExamQuestion,
			listExam,
		},
		dispatch
	);
}

let ExamEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ExamEdit)
);

export default ExamEditContainer;
