import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
	listTesting,
	showTesting,
	confirmTesting,
	updatePoint
} from "../../redux/testing/action";
import { isUndefined } from "util";

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			styleTrue: {
				background: "green"
			},
			styleFalse: {
				background: "red"
			},
			answer: null,
			value: null
		};
	}

	componentDidMount() {
		this.setState({
			answer: this.props.obj.answer,
			value: this.props.obj.value
		});
	}

	renderButton = () => {
		const data = ["A", "B", "C", "D"];

		return data.map((item, i) => {
			var className = "answer";
			var style = {};
			if (
				(this.state.value === item &&
					this.state.value === this.state.answer) ||
				this.state.answer === item
			) {
				style = this.state.styleTrue;
			}
			if (
				this.state.value === item &&
				this.state.value !== this.state.answer
			) {
				style = this.state.styleFalse;
			}
			return (
				<button key={item} className={className} style={style}>
					{item}
				</button>
			);
		});
	};

	render() {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="shadow-blue">
						<div className="question-number">
							<span>Câu số {this.props.index + 1}:</span>
							<span> {this.props.obj.name}</span>
						</div>
						<div className="d-title">
							<div
								className="embed-question"
								dangerouslySetInnerHTML={{
									__html: this.props.obj.question
								}}
							></div>
						</div>
						<div className="idea">
							<span>Trả lời</span>
							{this.renderButton()}

							{this.state.answer === this.state.value ? (
								<span className="text-right answer-true">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width={20}
										height={20}
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
										className="feather feather-check mx-2"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								</span>
							) : (
								<span className="text-right answer-false">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width={20}
										height={20}
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
										className="feather feather-x mx-2"
									>
										<line x1={18} y1={6} x2={6} y2={18} />
										<line x1={6} y1={6} x2={18} y2={18} />
									</svg>
								</span>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

class RowImage extends Component {
	constructor(props) {
		super();
		this.state = {};
	}

	render() {
		return (
			<div className="box-testexercise">
				<div className="box-question">
					<div className="embed-question">
						<img alt="" src={this.props.obj} />
					</div>
				</div>
			</div>
		);
	}
}

class TestingEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			questions: [],
			point: ""
		};
	}

	fetchRows() {
		if (this.state.questions instanceof Array) {
			return this.state.questions.map((object, i) => {
				return <Row obj={object} key={object._id} index={i} />;
			});
		}
	}

	handleChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value
		});
	};

	getData = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.state.limit
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.tags != null) {
			data["tags"] = this.state.tags;
		}
		return data;
	};

	async componentDidMount() {
		const data = {
			id: this.props.match.params.id
		};
		await this.props.showTesting(data);

		if (this.props.testing) {
			const { testing, exam } = this.props.testing;
			await this.setState({
				user_id: testing.user.id,
				user_code: testing.user.code,
				exam_id: exam.code,
				created_at: testing.created_at,
				exam_name: exam.name,
				questions: this.props.questions,
				answer_files: testing.answer_files,
				exam: exam,
				testing: testing,
				exam_type: exam.type,
				point: testing.point
			});
		}
	}

	handleSubmit = async e => {
		e.preventDefault();
		const data = {
			testing_ids: this.props.ids
		};
		await this.props.confirmTesting(data);
		await this.props.history.push("/testing");
	};

	getDataTesting = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.state.limit
		};

		return data;
	};
	updatePoint = async e => {
		e.preventDefault();
		var regex = /^[0-9]*$/gm;
		var check = regex.test(this.state.point);

		if (check) {
			var data = {
				id: this.props.match.params.id,
				point: parseFloat(this.state.point)
			};
			await this.props.updatePoint(data);
			await this.props.listTesting(this.getDataTesting());
		} else {
			notification.warning({
				message: "Điểm phải là số",
				placement: "topRight",
				top: 50,
				duration: 3
			});
		}
	};

	fetchRowsImage() {
		if (this.state.answer_files instanceof Array) {
			return this.state.answer_files.map((object, i) => {
				return <RowImage obj={object} key={i} index={i} />;
			});
		}
	}

	render() {
		if (this.props.data != null && !isUndefined(this.props.data.testing)) {
			var num_right = this.props.data.testing.num_right;
			var num_wrong = this.props.data.testing.num_wrong;
			var total = num_right + num_wrong;
			var point = this.props.data.testing.point;
		} else {
			num_right = 0;
			num_wrong = 0;
			total = num_right + num_wrong;
			point = 0;
		}
		return (
			<div>
				{/* <div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">
								Bài thi:{" "}
								{!isUndefined(this.state.exam_id)
									? this.state.exam_id
									: ""}{" "}
								{this.state.user_code
									? "- " + this.state.user_code
									: "- " + this.state.user_id}
							</h2>
						</div>
						<div className="flex" />
						<div>
							<Link
								to={"/testing"}
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
				</div> */}

				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">
							Bài thi:{" "}
							{!isUndefined(this.state.exam_id)
								? this.state.exam_id
								: ""}{" "}
							{this.state.user_code
								? "- " + this.state.user_code
								: "- " + this.state.user_id}
						</h2>
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Chi tiết</strong>
									</div>
									<div className="card-body">
										<div className="row">
											<div className="col-sm-6 col-form-div">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Mã sinh viên
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
																this.state
																	.user_code
															}
														/>
													</div>
												</div>
											</div>
											<div className="col-sm-6">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Mã đề thi
													</label>
													<div className="col-sm-12">
														<input
															type="text"
															className="form-control"
															name="code"
															onChange={
																this._onChange
															}
															value={
																this.state
																	.exam_id
															}
														/>
													</div>
												</div>
											</div>
										</div>
										<div className="row">
											<div className="col-sm-6 col-form-div">
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
																this.state
																	.exam_name
															}
														/>
													</div>
												</div>
											</div>
											<div className="col-sm-6">
												<div className="form-group">
													<label className="col-sm-12 col-form-label">
														Ngày gửi bài
													</label>
													<div className="col-sm-12">
														<input
															type="text"
															className="form-control"
															name="code"
															onChange={
																this._onChange
															}
															value={Moment(
																this.state
																	.created_at
															).format(
																"DD/MM/YYYY"
															)}
														/>
													</div>
												</div>
											</div>
										</div>

										<div className="border padding">
											<div className="toolbar">
												<b>Bài kiểm tra</b>
											</div>
											{this.state.exam_type ===
												"TU_LUAN" ? (
												<div>
													<div
														style={{
															width: "100%",
															marginTop: 15,
															marginBottom: 15
														}}
													>
														{this.state.exam
															.doc_link !==
															null ? (
															<embed
																src={
																	this.state
																		.exam
																		.doc_link
																}
																type="application/pdf"
																width="100%"
																height="600px"
															/>
														) : (
															<span className="pt-3 pb-5 text-danger">
																Hiển thị đề thi
																bị lỗi
															</span>
														)}
													</div>
													{this.state.answer_files
														.length !== 0 ? (
														<div>
															<b
																style={{
																	marginTop: 10
																}}
															>
																Bài làm của bạn:
															</b>
															{this.fetchRowsImage()}

															<div className="row mt-3 p-2 d-flex justify-content-end align-items-center">
																<div className="box-point-tl">
																	<b>Điểm: </b>
																	<form
																		onSubmit={
																			this
																				.updatePoint
																		}
																	>
																		<input
																			name="point"
																			className="form-control"
																			style={{
																				maxWidth: 200,
																				float: 'left'
																			}}
																			onChange={
																				this
																					.handleChange
																			}
																			value={
																				this
																					.state
																					.point
																			}
																		/>
																		<button style={{ float: 'right' }} type="submit" className="btn btn-primary btn-sm">Gửi điểm</button>
																	</form>

																</div>
															</div>
														</div>
													) : (
														"Không có dữ liệu bài làm"
													)}
												</div>
											) : (
												<div>
													<div className="toolbar d-flex justify-content-end align-items-center mb-0">
														<span>Kết quả: </span>
														<span
															style={{
																fontSize:
																	"16px",
																fontWeight:
																	"600"
															}}
														>
															{num_right !== null
																? num_right.toString()
																: 0 +
																(total !==
																	null
																	? "/" +
																	total.toString()
																	: "")}
														</span>{" "}
														câu
													</div>
													<div className="toolbar d-flex justify-content-end align-items-center mb-0">
														<span>Tổng điểm: </span>
														<span
															style={{
																fontSize:
																	"18px",
																fontWeight:
																	"600"
															}}
														>
															{isNaN(point)
																? 0
																: Math.round(
																	point *
																	10
																) / 10}
														</span>
													</div>
													{this.fetchRows()}

													{/* <div className="toolbar d-flex justify-content-end align-items-center">
														<span>Kết quả: </span>
														<span
															style={{
																fontSize:
																	"16px",
																fontWeight:
																	"600"
															}}
														>
															{num_right !== null
																? num_right.toString()
																: 0 +
																(total !==
																	null
																	? "/" +
																	total.toString()
																	: "")}
														</span>{" "}
														câu
													</div>
													<div className="toolbar d-flex justify-content-end align-items-center">
														<span>Tổng điểm: </span>
														<span
															style={{
																fontSize:
																	"18px",
																fontWeight:
																	"600"
															}}
														>
															{isNaN(point)
																? 0
																: Math.round(
																	point *
																	10
																) / 10}
														</span>
													</div> */}
												</div>
											)}
										</div>
									</div>
								</div>

								<div
									id="delete-question"
									className="modal fade"
									data-backdrop="true"
									style={{ display: "none" }}
									aria-hidden="true"
								>
									<div
										className="modal-dialog animate fade-down"
										data-class="fade-down"
									>
										<div className="modal-content">
											<div className="modal-header">
												<div className="modal-title text-md">
													Thông báo
												</div>
												<button
													className="close"
													data-dismiss="modal"
												>
													×
												</button>
											</div>
											<div className="modal-body">
												<div className="p-4 text-center">
													<p>
														Bạn chắc chắn muốn gửi
														kết quả?
													</p>
												</div>
											</div>
											<div className="modal-footer">
												<button
													type="button"
													className="btn btn-light"
													data-dismiss="modal"
												>
													Đóng
												</button>
												<button
													type="button"
													onClick={this.handleSubmit}
													className="btn btn-danger"
													data-dismiss="modal"
												>
													Gửi
												</button>
											</div>
										</div>
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
		testing: state.testing.testing,
		questions: state.testing.questions,
		qtyTrue: state.testing.qtyTrue,
		total: state.testing.total,
		ids: state.testing.ids,
		data: state.testing.data
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listTesting, showTesting, confirmTesting, updatePoint },
		dispatch
	);
}
let RowContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Row)
);

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(TestingEdit)
);
