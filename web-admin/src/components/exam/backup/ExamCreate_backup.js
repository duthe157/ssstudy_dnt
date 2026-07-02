import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { Radio, notification } from "antd";
import ListQuestion from "./ListQuestion";
import ExamQuestion from "./ExamQuestion";

import { listSubject } from "../../redux/subject/action";
import { createExam } from "../../redux/exam/action";
import { listChapter } from "../../redux/chapter/action";
import {
	listQuestion,
	removeExamQuestion,
	removeIds,
} from "../../redux/question/action";
import ConfigQuestion from "./ConfigQuestion";

class ExamCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			name: "",
			code: "",
			questions: [],
			doc_link: "",
			video_link: "",
			started_at: "",
			finished_at: "",
			keyword: "",
			subject_id: "",
			creating_type: "DEFAULT",
			time: "",
			type: "TRAC_NGHIEM",
			question_number: 0,
			tp: null,
			month: null,
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

	_onChangeSubject = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
		await this.props.listChapter({ limit: 999, subject_id: value });
	};

	handleSubmit = async (e) => {
		e.preventDefault();
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
		} else if (this.state.time === "") {
			this.timeInput.focus();
			notification.error({
				message: "Vui lòng nhập thời gian làm bài thi",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else {
			var exam_data = {
				name: this.state.name,
				code: this.state.code,
				questions: this.props.ids,
				video_link: this.state.video_link,
				subject_id: this.state.subject_id,
				creating_type: this.state.creating_type,
				type: this.state.type,
				time: this.state.time,
				tp: this.state.tp,
				month: this.state.month,
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

			data.append("exam_data", JSON.stringify(exam_data));

			if (this.state.doc_type === "PDF") {
				data.append("files[0]", this.state.fileData);
			}

			await this.props.createExam(data);

			if (this.props.redirect === true) {
				if (this.props.exam._id !== "") {
					await this.props.history.push(
						"/exam/" + this.props.exam._id + "/edit"
					);
				} else {
					await this.props.history.push("/exam/");
				}
			}
		}
	};

	getData = () => {
		const data = {
			limit: 999,
			is_delete: false,
		};
		return data;
	};

	onChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	onChangeHandler = (event) => {
		if (this.state.doc_type === "PDF") {
			this.setState({
				fileData: event.target.files[0],
			});
		} else {
			this.setState({ doc_link: "" });
		}
	};

	handleChangeTag = async (value) => {
		await this.setState({
			tagsSearch: value,
		});
	};

	async componentDidMount() {
		await this.props.listSubject(this.getData());
		await this.props.removeExamQuestion();
		await this.props.removeIds();
		await this.setState({
			examQuestions: this.props.examQuestions,
		});
	}

	fetchRowsSubject() {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id.toString()}>
						{obj.name}
					</option>
				);
			});
		}
	}

	render() {
		return (
			<div>
				<div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">Thêm mới</h2>
						</div>
						<div className="flex" />
						<div>
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
										<strong>Thông tin đề thi</strong>
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
															ref={(input) => {
																this.nameInput = input;
															}}
														/>
													</div>
												</div>
											</div>
											<div className="col-sm-5">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Môn
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
															ref={(input) => {
																this.subjectInput = input;
															}}
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
											<div className="col-sm-2">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Điểm mục tiêu
													</label>
													<div className="col-sm-12">
														<input
															type="text"
															className="form-control"
															name="tp"
														/>
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
																		.doc_link
																}
															/>
														) : (
															<input
																type="file"
																className="form-control"
																name="fileData"
																onChange={
																	this
																		.onChangeHandler
																}
															/>
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
																	.video_link
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
																this.state.time
															}
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
													<div className="col-md-12">
														<div className="card">
															<div className="card-header">
																<strong>
																	Thiết lập
																	cấu hình
																</strong>
															</div>
															<div className="card-body">
																<div className="row">
																	<div className="col-sm-12">
																		<div className="form-group">
																			<ConfigQuestion
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
											Tạo đề thi
										</button>
									</div>
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
		redirect: state.exam.redirect,
		subjects: state.subject.subjects,
		token: state.auth.token,
		questions: state.question.questions,
		examQuestions: state.question.examQuestions,
		ids: state.question.ids,
		configs: state.category.configs,
		chapter_ids: state.category.chapter_ids,
		exam: state.exam.exam,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listSubject,
			createExam,
			listQuestion,
			removeExamQuestion,
			listChapter,
			removeIds,
		},
		dispatch
	);
}

let ExamsCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ExamCreate)
);

export default ExamsCreateContainer;
