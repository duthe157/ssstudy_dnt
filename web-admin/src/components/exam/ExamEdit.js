import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Radio, notification } from "antd";

import { listSubject } from "../../redux/subject/action";
import {
	createExam,
	ShowExam,
	updateExam,
	listExam,
	previewListQuestion
} from "../../redux/exam/action";
import {
	listExamCategory
} from "../../redux/examcategory/action";
import {
	createQuestionJson,
	listQuestion,
	assignValue,
	removeExamQuestion,
	handleChangeExamQuestions
} from "../../redux/question/action";
import AddClass from "./AddClass";
import ImportPoint from "../testing/ImportPoint";
import baseHelpers from "../../helpers/BaseHelpers";
import QuestionCreateContainer from "./CreateQuestion";
import QuestionEditContainer from "./EditQuestion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

class Row extends Component {
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

	componentDidMount() {
		this.setState({
			check: false,
		});
	}

	handleDeleteQuestion = (id) => {
		this.props.deleteQuestion(id);
	}

	handleSetSelectedQuestion = (question) => {
		this.props.setSelectedQuestion(question);
	}

	renderAnswer = (question) => {
		if (!question.answer) return '';

		// ✅ THÊM: Handle single object with {key, value} structure
		if (typeof question.answer === 'object' && !Array.isArray(question.answer)) {
			if (question.answer.key !== undefined && question.answer.value !== undefined) {
				return `${question.answer.key}:${question.answer.value}`;
			}
			// Handle object with a/b/c/d properties (existing logic)
			const parts = [];
			if (question.answer.a !== undefined) parts.push(`a:${question.answer.a}`);
			if (question.answer.b !== undefined) parts.push(`b:${question.answer.b}`);
			if (question.answer.c !== undefined) parts.push(`c:${question.answer.c}`);
			if (question.answer.d !== undefined) parts.push(`d:${question.answer.d}`);
			if (parts.length > 0) return parts.join(', ');

			// Fallback for unknown object structure
			return '[Object]';  // Safe string instead of rendering object
		}

		// Handle array of objects with {key, value} structure
		if (Array.isArray(question.answer)) {
			if (question.answer.length > 0 && typeof question.answer[0] === 'object' && question.answer[0].key !== undefined) {
				return question.answer.map(item => `${item.key}:${item.value}`).join(', ');
			}
			// Handle array of primitive values
			return question.answer.join(', ');
		}

		// Handle primitive values
		return String(question.answer);
	}

	render() {
		const question = this.props.obj;
		let index = this.props.index;

		return (
			<Draggable
				key={index}
				draggableId={"" + index}
				index={index}
			>
				{(provided, snapshot) => (
					<tr className="v-middle table-row-item" data-id={17}
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						style={{
							...provided.draggableProps.style,
							userSelect: "none",
							background: snapshot.isDragging
								? "#e8f0fe"
								: "none",
							display: "table-row",
						}}
					>
						<td className="text-left">
							Câu {index + 1}
						</td>
						<td className="text-left">
							{question.code}
						</td>
						<td className="text-left">
							{this.renderAnswer(question)}
						</td>
						<td className="text-center">
							<span className={question.answer_content ? "bg-have-data" : "bg-no-data"}>{question.answer_content && question.answer_content != "" ? "Đã có" : "Chưa có"}</span>
						</td>
						<td className="text-center">
							<span className={question.doc_link ? "bg-have-data" : "bg-no-data"}>{question.doc_link && question.doc_link != "" ? "Đã có" : "Chưa có"}</span>
						</td>
						<td className="text-center">
							<span className={question.video_link ? "bg-have-data" : "bg-no-data"}>{question.video_link && question.video_link != "" ? "Đã có" : "Chưa có"}</span>
						</td>
						<td className="text-left">
							{question.created_at ? baseHelpers.formatDateToString(question.created_at) : null}
						</td>
						<td className='text-right'>
							<div className="item-action">

								<a
									className="mr-14"
									data-toggle='modal'
									data-target='#edit-question'
									data-toggle-class='fade-down'
									data-toggle-class-target='.animate'
									onClick={() => this.handleSetSelectedQuestion(question)}
									title='Chỉnh sửa'
									id='btn-trash'
								>
									<img src="/assets/img/icon-edit.svg" alt="" />
								</a>
								<a
									title='Xóa'
									onClick={() => this.handleDeleteQuestion(question._id)}
								>
									<img src="/assets/img/icon-delete.svg" alt="" />
								</a>
							</div>
						</td>
					</tr>
				)}
			</Draggable>
		);
	}
}

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
			category_id: "",
			creating_type: "DEFAULT",
			type: "TRAC_NGHIEM",
			time: "",
			question_number: 0,
			data: [],
			examQuestions: [],
			fileData: "",
			is_redo: false,
			doc_type: "GOOGLE_DRIVE",
			group: 'MAC_DINH',
			selectedQuestions: [],
			currentQuestionvalue: "",
			isLoadingUploadExam: false,
			exam_doc_link: "",
			level: null
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
		let { selectedQuestions } = this.state;
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
				video_link: this.state.video_link,
				subject_id: this.state.subject_id,
				category_id: this.state.category_id,
				creating_type: this.state.creating_type,
				type: this.state.type,
				time: this.state.time,
				is_redo: this.state.is_redo,
				total_question: this.state.question_number,
				chapter_ids: this.props.chapter_ids,
				doc_type: this.state.doc_type,
				group: this.state.group,
				exam_doc_link: this.state.exam_doc_link,
				level: this.state.level,
				questions: selectedQuestions && selectedQuestions.length > 0 ? selectedQuestions.map(item => item._id) : [],
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

	fetchCategoryRows() {
		if (this.props.examCategories instanceof Array) {
			return this.props.examCategories.map((obj, i) => {
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
		await this.props.listExamCategory(this.getData());

		const {
			name,
			doc_link,
			video_link,
			// questions,
			code,
			subject,
			type,
			creating_type,
			total_question,
			chapters,
			configs,
			time,
			is_redo,
			doc_type,
			category,
			group,
			exam_doc_link,
			level
		} = this.props.exam.exam;

		const { questions } = this.props.exam;
		await this.setState({
			name,
			doc_link,
			video_link,
			// questions,
			code,
			type,
			creating_type,
			chapters,
			configs,
			time,
			is_redo,
			doc_type,
			group,
			level,
			chapter_ids: chapters,
			question_number: total_question,
			subject_id: subject.id,
			selectedQuestions: questions ? questions : [],
			exam_doc_link: exam_doc_link ? exam_doc_link : ""
		});
		if (category) {
			this.setState({
				category_id: category.id
			})
		}
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

	onChangExamQuestions = async (data, arrIds) => {
		this.props.handleChangeExamQuestions(data, arrIds);
	}

	fetchRows() {
		if (this.state.selectedQuestions instanceof Array) {
			return this.state.selectedQuestions.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						deleteQuestion={this.handleDeleteQuestion}
						setSelectedQuestion={this.setSelectedQuestion}
					/>
				);
			});
		}
	}

	setSelectedQuestion = async (question) => {
		if (question) {
			await this.setState({
				currentQuestionvalue: question
			})
		}
	}

	handleDeleteQuestion = async (id) => {
		let questions = [...this.state.selectedQuestions];
		let questionDeleted = [];
		if (id) {
			questionDeleted = questions.filter(item => item._id != id);
		}

		await this.setState({
			selectedQuestions: questionDeleted
		})
	}

	handleAddSelectedQuestion = async (question) => {
		let questions = [...this.state.selectedQuestions];

		if (question) {
			questions.push(question);
		}
		this.setState({
			selectedQuestions: questions
		})
	}

	reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};

	onDragEndQuestion = async (result) => {
		if (!result.destination) {
			return;
		}

		const items = this.reorder(
			this.state.selectedQuestions,
			result.source.index,
			result.destination.index
		);

		await this.setState({
			selectedQuestions: items,
		});
	}

	handleUpdateSelectedQuestion = async (question) => {
		let questions = [...this.state.selectedQuestions];

		let index = questions.findIndex(item => item._id == question._id);

		if (index != -1) {
			questions[index] = question;

			await this.setState({
				selectedQuestions: questions
			})
		}
	}

	handleUploadExamList = () => {
		document.getElementById("input-upload-exam-list").click();
	}

	handleChangeUploadFileExam = async (e) => {
		var name = e.target.name;
		let value = e.target.files[0];
		const data = new FormData();

		data.append("files[0]", value);

		this.setState({
			isLoadingUploadExam: true
		})

		await this.props.previewListQuestion(data);


		if (this.props.dataPreviewExam) {
			document.getElementById('btn-upload-exam-list').click();

			await this.setState({
				isLoadingUploadExam: false
			})

		}
	};

	renderQuestion(data) {
		const question = data.question;
		if (data && question && question instanceof Array) {
			return question.map((object, i) => {
				const _content = baseHelpers.renderQuestionHTML(object);
				return (
					<span dangerouslySetInnerHTML={{ __html: _content }}></span>
				);
			});
		}
	}

	fetchQuestionOption(data) {
		if (data && data instanceof Array) {
			return data.map((object, i) => {
				const _content = baseHelpers.renderQuestionHTML(object);
				return (
					<span dangerouslySetInnerHTML={{ __html: _content }}></span>
				);
			});
		}
	}

	fetchQuesion = () => {
		const questions = this.props.dataPreviewExam;

		if (questions && questions instanceof Array) {
			return questions.map((question, i) => {
				return (<div key={i} className="api-question-item">
					<div className="api-list-question-preview"><b>Câu {i + 1}:</b> {this.renderQuestion(question)}</div>
					<div className="api-list-option">
						{question.A ? <span className="api-question-option-item"><strong>A:</strong> {this.fetchQuestionOption(question.A)} {question.correct && question.correct === 'A' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" /></span> : <></>}</span> : <></>}
						{question.B ? <span className="api-question-option-item"><strong>B:</strong> {this.fetchQuestionOption(question.B)} {question.correct && question.correct === 'B' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" /></span> : <></>}</span> : <></>}
						{question.C ? <span className="api-question-option-item"><strong>C:</strong> {this.fetchQuestionOption(question.C)} {question.correct && question.correct === 'C' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" /></span> : <></>}</span> : <></>}
						{question.D ? <span className="api-question-option-item"><strong>D:</strong> {this.fetchQuestionOption(question.D)} {question.correct && question.correct === 'D' ? <span><img src="/assets/img/icon-check-done.svg" className="ml-12" alt="" /></span> : <></>}</span> : <></>}
					</div>
				</div >
				);
			})
		}
	}

	applyQuestion = () => {
		const questions = this.props.dataPreviewExam;
		console.log(questions);
	}
	handleUploadQuestion = async () => {
		let listExamUpload = [...this.props.dataPreviewExam];
		if (listExamUpload) {
			listExamUpload.map(async (item, index) => {
				const data = new FormData();

				data.append("subject_id", this.state.subject_id);
				data.append("category_id", this.state.category_id);
				data.append("question_json", JSON.stringify(item));

				await this.props.createQuestionJson(data);

				if (this.props.question) {
					await this.handleAddSelectedQuestion(this.props.question);
				}
			})
		}
	}

	render() {
		return (
			<div>
				<div className="page-content page-container page-exam-create" id="page-content">
					<div className="padding">
						<div className="toolbar">
							<div className="flex" style={{ textAlign: "right" }}>
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
							</div>
						</div>
						<div className="general-info block-item-content">
							<h3 className="title-block">Thông tin đề thi</h3>
							<div className="content input-group">

								<div className="form-group mr-32" style={{ width: "144px" }}>
									<label className="text-form-label">Mã đề thi</label>
									<div>
										<input
											type="text"
											className="form-control"
											name="code"
											onChange={this._onChange}
											disabled
											value={this.state.code}
										/>
									</div>
								</div>


								<div className="form-group mb-0 mr-32" style={{ width: "400px" }}>
									<label className="text-form-label">Tên đề thi</label>
									<div>
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

								<div className="form-group mb-0 mr-32" style={{ width: "400px" }}>
									<label className="text-form-label">Link video lời giải</label>
									<div>
										<input
											type="text"
											className="form-control"
											name="video_link"
											ref={(input) => {
												this.nameInput = input;
											}}
											onChange={
												this._onChange
											}
											value={
												this.state.video_link
											}
										/>
									</div>
								</div>

								<div className="form-group mb-0" style={{ minWidth: "450px" }}>
									<label className="text-form-label">
										Đề thi (PDF){" "}
										<Radio.Group
											className="ml-5"
											onChange={this._onChange}
											name="doc_type"
											value={this.state.doc_type}
										>
											<Radio value={"GOOGLE_DRIVE"}>
												Google drive
											</Radio>
											<Radio value={"PDF"}>
												Pdf
											</Radio>
										</Radio.Group>
									</label>
									<div className="doc-type">
										{this.state.doc_type ===
											"GOOGLE_DRIVE" ? (
											<input
												type="text"
												className="form-control"
												placeholder="Nhập link tài liệu"
												name="doc_link"
												onChange={this._onChange}
												value={this.state.doc_link}
											/>
										) : (
											<input
												type="file"
												className="form-control"
												name="fileData"
												onChange={this.onChangeHandler}
											/>
										)}
									</div>
								</div>
							</div>
							<div className="content input-group mt-16">
								<div className="form-group mb-0 mr-32">
									<label className="text-form-label">Thời gian làm bài</label>
									<div>
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
								<div className="form-group mb-0 mr-32" style={{ minWidth: "280px" }}>
									<label className="text-form-label">Loại đề thi</label>
									<div>
										<select
											className="custom-select"
											value={
												this.state
													.category_id
											}
											name="category_id"
											onChange={
												this._onChange
											}
										>
											<option value="">
												-- Chọn danh mục --
											</option>
											{this.fetchCategoryRows()}
										</select>
									</div>
								</div>
								<div className="form-group mb-0 mr-32" style={{ minWidth: "280px" }}>
									<label className="text-form-label">Cho phép làm lại</label>
									<div>
										<select
											className="custom-select"
											value={
												this.state.is_redo
											}
											name="is_redo"
											onChange={
												this._onChange
											}
										>
											<option value={false}>
												Không cho phép
											</option>
											<option value={true}>
												Cho phép làm lại
											</option>
										</select>
									</div>
								</div>
								<div className="form-group mb-0 mr-32" style={{ minWidth: "180px" }}>
									<label className="text-form-label">Nhóm đề</label>
									<div>
										<select
											className="custom-select"
											value={
												this.state.group
											}
											name="group"
											onChange={
												this._onChange
											}
										>
											<option value={'MAC_DINH'}>
												Mặc định
											</option>
											<option value={'THI_THU'}>
												Đề thi thử
											</option>
										</select>
									</div>
								</div>
								<div className="form-group mb-0" style={{ minWidth: "180px" }}>
									<label className="text-form-label">
										Hình thức thi
									</label>
									<div>
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
							<div className="content input-group mt-16" style={{ flexWrap: "nowrap", gap: "16px" }}>
								<div className="form-group mb-0" style={{ width: "33%" }}>
									<label className="text-form-label">Lớp học</label>
									<div>
										<select
											className="custom-select"
											value={this.state.level}
											name="level"
											onChange={this._onChange}
										>
											<option value="">Cấp học</option>
											<option value="1">Lớp 1</option>
											<option value="2">Lớp 2</option>
											<option value="3">Lớp 3</option>
											<option value="4">Lớp 4</option>
											<option value="5">Lớp 5</option>
											<option value="6">Lớp 6</option>
											<option value="7">Lớp 7</option>
											<option value="8">Lớp 8</option>
											<option value="9">Lớp 9</option>
											<option value="10">Lớp 10</option>
											<option value="11">Lớp 11</option>
											<option value="12">Lớp 12</option>
										</select>
									</div>
								</div>
								<div className="form-group mb-0" style={{ width: "33%" }}>
									<label className="text-form-label">Môn học</label>
									<div>
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
								<div className="form-group mb-0" style={{ width: "33%" }}>
									<label className="text-form-label">Link đề</label>
									<div>
										<input
											type="text"
											className="form-control"
											name="exam_doc_link"
											onChange={this._onChange}
											value={this.state.exam_doc_link}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="block-exam block-item-content">
							<input
								onChange={this.handleChangeUploadFileExam}
								type="file"
								className="form-control-file d-none"
								name="files"
								id="input-upload-exam-list"
							/>
							<h3 className="title-block">Đề thi</h3>
							<div className="list-actions relative">
								<button className="btn-out-line flex-item-center">
									Xóa tất cả
									<i className="icon-delete ml-12"></i>
								</button>
								<button className={`btn-primary flex-item-center ml-16 ${this.state.isLoadingUploadExam ? "loader" : ""}`} onClick={this.handleUploadExamList}>
									Tải lên danh sách câu hỏi
									<img src="/assets/img/icon-upload-exam.svg" alt="" className="ml-12" />
								</button>
								<a
									className="btn-primary flex-item-center ml-16 d-none"
									data-toggle='modal'
									data-target='#modal-preview-exams'
									data-toggle-class='fade-down'
									data-toggle-class-target='.animate'
									title='Trash'
									id='btn-upload-exam-list'
								>
								</a>
								<button
									className='btn-primary flex-item-center ml-16'
									data-toggle='modal'
									data-target='#create'
									data-toggle-class='fade-down'
									data-toggle-class-target='.animate'
									title='Trash'
									id='btn-trash'
								>
									Tạo câu hỏi thủ công
									<img src="/assets/img/icon-create-exam-handmade.svg" alt="" className="ml-12" />
								</button>
							</div>


							<div className="row">
								<div className="col-sm-12">
									<table className="table table-theme table-row v-middle">
										<thead className="text-muted">
											<tr>
												<th>#</th>
												<th>Mã câu hỏi</th>
												<th className="text-left">
													Đáp án đúng
												</th>
												<th className="text-center">
													Lời giải
												</th>
												<th className="text-center">
													Tài liệu
												</th>
												<th className="text-center">
													Video
												</th>
												<th className="text-left">
													Ngày tải lên
												</th>
												<th className='text-right'>
													Thao tác
												</th>
											</tr>
										</thead>
										<DragDropContext onDragEnd={this.onDragEndQuestion}>
											<Droppable droppableId="droppable">
												{(provided, snapshot) => (
													<tbody
														ref={provided.innerRef}
														style={{
															background: snapshot.isDragging ? "#e8f0fe" : "none",
														}}
													>
														{
															this.fetchRows()
														}

														{
															!this.state.selectedQuestions || this.state.selectedQuestions.length == 0
															&&
															<tr>
																<td colSpan={7} className="text-center">Chưa có câu hỏi nào!</td>
															</tr>
														}
														{provided.placeholder}
													</tbody>
												)}
											</Droppable>
										</DragDropContext>
									</table>
								</div>
							</div>


						</div>

						<div className="block-action-footer">
							<button type="button" className="btn-cancel" onClick={() => this.props.history.push("/exam")}>
								<img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
								Hủy
							</button>
							<button
								type="button"
								className="btn-submit ml-16"
								onClick={this.handleSubmit}
							>
								Cập nhật
								<img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
							</button>
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
							style={{ display: "none", minWidth: "1000px", zIndex: 1120 }}
							aria-hidden="true"
						>
							<ImportPoint exam_id={this.props.match.params.id} />
						</div>
					</div>
				</div>

				<div
					id='create'
					className='modal fade'
					data-backdrop='true'
					style={{
						display: "none",
						minWidth: "1000px",
						zIndex: 1050
					}}
					aria-hidden='true'
				>
					<div
						className='modal-dialog animate fade-down modal-lg'
						data-class='fade-down'
					>
						<div className='modal-content'>
							<div className='modal-body'>
								<QuestionCreateContainer selectedSubjectId={this.state.subject_id} handleAddSelectedQuestion={this.handleAddSelectedQuestion} />
							</div>
						</div>
					</div>
				</div>

				<div
					id='edit-question'
					className='modal fade '
					data-backdrop='true'
					style={{
						display: "none",
						minWidth: "1000px",
						zIndex: 1050
					}}
					aria-hidden='true'
				>
					<div
						className='modal-dialog animate fade-down modal-lg'
						data-class='fade-down'
					>
						<div className='modal-content'>
							<div className='modal-body'>
								<QuestionEditContainer currentQuestionvalue={this.state.currentQuestionvalue} handleUpdateSelectedQuestion={this.handleUpdateSelectedQuestion} />
							</div>
						</div>
					</div>
				</div>

				<div
					id='modal-preview-exams'
					className='modal fade'
					data-backdrop='true'
					style={{ display: "none" }}
					aria-hidden='true'
				>
					<div
						className='modal-dialog animate fade-down modal-lg'
						data-class='fade-down' style={{ minWidth: 950 }}
					>
						<div className='modal-content'>
							<div className='modal-body'>
								<h3 className="title">Danh sách câu hỏi</h3>
								<div className="list-questions">
									{this.fetchQuesion()}
								</div>
								<div className="block-action-footer">
									<button data-dismiss='modal' type="button" className="btn-cancel">
										<img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
										Hủy
									</button>

									<button type="button" className="btn-submit ml-16" onClick={() => this.handleUploadQuestion()}>
										Tải lên
										<img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
									</button>
								</div>
							</div >
						</div >
					</div >
				</div >
			</div >
		);
	}
}

function mapStateToProps(state) {
	return {
		subjects: state.subject.subjects,
		questions: state.question.questions,
		question: state.question.question,
		examQuestions: state.question.examQuestions,
		ids: state.question.ids,
		exam: state.exam.exam,
		configs: state.category.configs,
		chapter_ids: state.category.chapter_ids,
		redirect: state.exam.redirect,
		examCategories: state.examCategory.examCategories,
		dataPreviewExam: state.exam.dataPreviewExam
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			createQuestionJson,
			listSubject,
			createExam,
			listQuestion,
			ShowExam,
			assignValue,
			updateExam,
			removeExamQuestion,
			listExam,
			handleChangeExamQuestions,
			listExamCategory,
			previewListQuestion
		},
		dispatch
	);
}

let ExamEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ExamEdit)
);

export default ExamEditContainer;
