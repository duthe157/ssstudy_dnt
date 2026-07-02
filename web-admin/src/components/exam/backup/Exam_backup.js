import React, { Component } from "react";
import Moment from "moment";
import { Select, Badge, notification } from "antd";
import { Link, withRouter } from "react-router-dom";
import Pagination from "react-js-pagination";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
	listExam,
	deleteExam,
	addDelete,
	checkAll,
} from "../../redux/exam/action";
import { listSubject } from "../../redux/subject/action";

const { Option } = Select;

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

	handleCheck = (e) => {
		if (e.target.checked) {
			this.props.addDelete(this.props.obj._id, "add");
			this.setState({
				check: e.target.checked,
			});
		} else {
			this.props.addDelete(this.props.obj._id, "remove");
			this.setState({
				check: e.target.checked,
			});
		}
	};

	render() {
		return (
			<tr className='v-middle' data-id={17}>
				<td>
					<label className='ui-check m-0'>
						<input
							type='checkbox'
							name='id'
							onChange={this.handleCheck}
							checked={this.state.check === true ? "checked" : ""}
						/>{" "}
						<i />
					</label>
				</td>
				<td className='flex'>
					<Link
						className='item-author text-color'
						to={"/exam/" + this.props.obj._id + "/edit"}
					>
						{this.props.obj.name}
					</Link>
				</td>
				<td className='text-center'>{this.props.obj.code}</td>
				<td className='text-center'>{this.props.obj.subject.name}</td>
				<td className='text-center'>
					{this.props.obj.type === "TU_LUAN"
						? "Tự luận"
						: "Trắc nghiệm"}
				</td>
				<td className='text-center'>
					{this.props.obj.questions.length !== "" &&
						this.props.obj.questions.length}
				</td>
				<td className='text-center'>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.updated_at &&
							Moment(this.props.obj.updated_at).format(
								"DD/MM/YYYY HH:mm"
							)}
					</span>
				</td>
				<td width='50px'>
					<div className='item-action dropdown'>
						<a
							href='/'
							data-toggle='dropdown'
							className='text-muted'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width={16}
								height={16}
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth={2}
								strokeLinecap='round'
								strokeLinejoin='round'
								className='feather feather-more-vertical'
							>
								<circle cx={12} cy={12} r={1} />
								<circle cx={12} cy={5} r={1} />
								<circle cx={12} cy={19} r={1} />
							</svg>
						</a>
						<div
							className='dropdown-menu dropdown-menu-right bg-white'
							role='menu'
						>
							<Link
								className='dropdown-item'
								to={"/exam/" + this.props.obj._id + "/edit"}
							>
								Sửa
							</Link>
							<Link
								className='dropdown-item'
								to={"/exam/" + this.props.obj._id + "/report"}
							>
								Báo cáo
							</Link>
							<div className='dropdown-divider' />
							<button
								onClick={(e) =>
									this.props.addDelete(this.props.obj._id)
								}
								className='dropdown-item trash'
								data-toggle='modal'
								data-target='#delete-question'
								data-toggle-classname='fade-down'
								data-toggle-class-target='.animate'
							>
								Xóa
							</button>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

class Exam extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: "",
			tags: [],
			limit: "",
			checkAll: false,
			subject_id: "",
		};
	}

	fetchRows() {
		if (this.props.exams instanceof Array) {
			return this.props.exams.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDelete={this.props.addDelete}
						tags={this.props.tags}
						check={this.props.check}
					/>
				);
			});
		}
	}

	onChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});

		await this.props.listExam(this.getData());
	};

	getData = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.state.limit,
		};
		if (this.state.keyword !== "") {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.subject_id !== "") {
			data["subject_id"] = this.state.subject_id;
		}
		return data;
	};

	async componentDidMount() {
		const data = {
			limit: 999,
			is_delete: false,
		};
		await this.props.listSubject(data);
		await this.props.listExam(this.getData());
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				checkAll: false,
			});
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listExam(this.getData());
	};

	handleChangePage = (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		this.props.listExam(this.getData(pageNumber));
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listExam(this.getData());
	};

	handleChangeTag = async (value) => {
		await this.setState({
			tags: value,
		});
		await this.props.listExam(this.getData());
	};

	fetchOptions() {
		if (this.props.tags instanceof Array) {
			return this.props.tags.map((obj, i) => {
				return <Option key={obj._id.toString()}>{obj.name}</Option>;
			});
		}
	}

	handleDelete = async () => {
		const data = {
			ids: this.props.ids,
		};
		if (data.ids.length !== 0) {
			await this.props.deleteExam(data);
			await this.props.listExam(this.getData());
		} else {
			notification.warning({
				message: "Chưa chọn mục nào !",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}
	}

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

	handleClear = async (e) => {
		await this.setState({
			keyword: "",
			subject_id: "",
		});
		await this.props.listExam(this.getData());
	};

	render() {
		let displayFrom =
			this.props.page === 1
				? 1
				: (parseInt(this.props.page) - 1) * this.props.limit;
		let displayTo =
			this.props.page === 1
				? this.props.limit
				: displayFrom + this.props.limit;
		displayTo = displayTo > this.props.total ? this.props.total : displayTo;
		return (
			<div>
				<div className='page-hero page-container' id='page-hero'>
					<div className='padding d-flex'>
						<div className='page-title'>
							<h2 className='text-md text-highlight'>
								Kho đề thi
							</h2>
							<small className='text-muted'>
								Quản lý danh sách đề thi
							</small>
						</div>
						<div className='flex' />
						<div>
							<Link
								to={`/exam/create`}
								className='btn btn-primary btn-sm text-muted'
							>
								<span className='d-none d-sm-inline mx-1'>
									Thêm mới
								</span>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width={16}
									height={16}
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth={2}
									strokeLinecap='round'
									strokeLinejoin='round'
									className='feather feather-arrow-right'
								>
									<line x1={5} y1={12} x2={19} y2={12} />
									<polyline points='12 5 19 12 12 19' />
								</svg>
							</Link>
						</div>
					</div>
				</div>
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<div className='mb-5'>
							<div className='toolbar'>
								<div className='btn-group'>
									{this.props.ids.length !== 0 ? (
										<button
											className='btn btn-icon'
											data-toggle='modal'
											data-target='#delete-question'
											data-toggle-className='fade-down'
											data-toggle-class-target='.animate'
											title='Trash'
											id='btn-trash'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={16}
												height={16}
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth={2}
												strokeLinecap='round'
												strokeLinejoin='round'
												className='feather feather-trash text-muted'
											>
												<polyline points='3 6 5 6 21 6' />
												<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
											</svg>
										</button>
									) : (
										<button
											className='btn btn-icon'
											onClick={this.handleDelete}
											title='Trash'
											id='btn-trash'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={16}
												height={16}
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth={2}
												strokeLinecap='round'
												strokeLinejoin='round'
												className='feather feather-trash text-muted'
											>
												<polyline points='3 6 5 6 21 6' />
												<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
											</svg>
										</button>
									)}
								</div>
								<div className='input-group'>
									<form
										className='flex'
										onSubmit={this.onSubmit}
									>
										<div className='input-group'>
											<input
												type='text'
												className='form-control form-control-theme'
												placeholder='Nhập từ khoá tìm kiếm...'
												onChange={this.onChange}
												name='keyword'
												value={this.state.keyword}
											/>{" "}
											<span className='input-group-append'>
												<button
													className='btn btn-white btn-sm'
													type='submit'
												>
													<span className='d-flex text-muted'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															width={16}
															height={16}
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth={2}
															strokeLinecap='round'
															strokeLinejoin='round'
															className='feather feather-search'
														>
															<circle
																cx={11}
																cy={11}
																r={8}
															/>
															<line
																x1={21}
																y1={21}
																x2='16.65'
																y2='16.65'
															/>
														</svg>
													</span>
												</button>
											</span>
										</div>
									</form>
								</div>
								<div className='input-group'>
									<select
										className='custom-select'
										value={this.state.subject_id}
										name='subject_id'
										onChange={this.onChange}
									>
										<option value=''>
											-- Chọn môn học --
										</option>
										{this.fetchRowsSubject()}
									</select>
									<button
										className='btn btn-white btn-sm'
										type='button'
										onClick={this.handleClear}
									>
										<span className='d-flex text-muted'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={16}
												height={16}
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth={2}
												strokeLinecap='round'
												strokeLinejoin='round'
												className='feather feather-x-circle mx-2'
											>
												<circle
													cx={12}
													cy={12}
													r={10}
												/>
												<line
													x1={15}
													y1={9}
													x2={9}
													y2={15}
												/>
												<line
													x1={9}
													y1={9}
													x2={15}
													y2={15}
												/>
											</svg>
										</span>
									</button>
								</div>
							</div>

							<div className='row'>
								<div className='col-sm-12'>
									<table className='table table-theme table-row v-middle'>
										<thead className='text-muted'>
											<tr>
												<th width='10px'>
													<label className='ui-check m-0'>
														<input
															type='checkbox'
															name='id'
															onChange={
																this
																	.handleCheckAll
															}
															checked={
																this.state
																	.checkAll ===
																true
																	? "checked"
																	: ""
															}
														/>{" "}
														<i />
													</label>
												</th>
												<th className='text-left'>
													Đề thi
												</th>
												<th className='text-center'>
													Mã đề
												</th>
												<th className='text-center'>
													Môn
												</th>
												<th className='text-center'>
													Loại đề thi
												</th>
												<th className='text-center'>
													Tổng số câu
												</th>
												<th className='text-center'>
													Cập nhật
												</th>
												<th width='50px' />
											</tr>
										</thead>
										<tbody>{this.fetchRows()}</tbody>
									</table>
								</div>
							</div>

							<div className='row listing-footer'>
								<div className='col-sm-2'>
									<select
										className='custom-select w-70'
										name='limit'
										onChange={this.handleChange}
										value={this.state.limit}
									>
										<option value='20'>20</option>
										<option value='50'>50</option>
										<option value='100'>100</option>
										<option value='-1'>ALL</option>
									</select>
								</div>
								<div className='col-sm-5 showing-text'>
									{" "}
									Hiển thị từ <b>{displayFrom}</b> đến{" "}
									<b>{displayTo}</b> trong tổng số{" "}
									<b>{this.props.total}</b>
								</div>
								{this.props.total !== 0 ? (
									<div className='col-sm-5 text-right'>
										<Pagination
											activePage={this.props.page}
											itemsCountPerPage={this.props.limit}
											totalItemsCount={this.props.total}
											pageRangeDisplayed={10}
											onChange={this.handleChangePage}
										/>
									</div>
								) : (
									<div className=''>Không có bản ghi nào</div>
								)}
							</div>

							<div
								id='delete-question'
								className='modal fade'
								data-backdrop='true'
								style={{ display: "none" }}
								aria-hidden='true'
							>
								<div
									className='modal-dialog animate fade-down'
									data-classname='fade-down'
								>
									<div className='modal-content'>
										<div className='modal-header'>
											<div className='modal-title text-md'>
												Thông báo
											</div>
											<button
												className='close'
												data-dismiss='modal'
											>
												×
											</button>
										</div>
										<div className='modal-body'>
											<div className='p-4 text-center'>
												<p>
													Bạn chắc chắn muốn xóa bản
													ghi này chứ?
												</p>
											</div>
										</div>
										<div className='modal-footer'>
											<button
												type='button'
												className='btn btn-light'
												data-dismiss='modal'
											>
												Đóng
											</button>
											<button
												type='button'
												onClick={this.handleDelete}
												className='btn btn-danger'
												data-dismiss='modal'
											>
												Xoá
											</button>
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
		questions: state.question.questions,
		exams: state.exam.exams,
		limit: state.exam.limit,
		page: state.exam.page,
		total: state.exam.total,
		ids: state.exam.ids,
		check: state.exam.checkAll,

		subjects: state.subject.subjects,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listExam, deleteExam, addDelete, checkAll, listSubject },
		dispatch
	);
}

let RowContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Row)
);
let ExamContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Exam)
);
export default ExamContainer;
