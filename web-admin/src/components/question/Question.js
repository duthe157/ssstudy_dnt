import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import { Link, withRouter } from "react-router-dom";
import Pagination from "react-js-pagination";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
	listQuestion,
	deleteQuestion,
	addDelete,
	checkAll,
	addDataRemoveQuestion
} from "../../redux/question/action";
import { listSubject } from "../../redux/subject/action";
import { listChapter } from "../../redux/chapter/action";
import { listCategory } from "../../redux/category/action";
import { isUndefined } from "util";
import queryString from 'query-string';


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

	handleCheckBox = e => {
		if (e.target.checked) {
			this.props.handleCheckedIds(this.props.obj._id, 'add');
			this.setState({
				check: e.target.checked
			})
		} else {
			this.props.handleCheckedIds(this.props.obj._id, 'remove');
			this.setState({
				check: e.target.checked
			})
		}
	};

	handleCheck = async (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveQuestion({
			ids: this.props.obj._id
		})
	}

	renderLevel = () => {
		const level = this.props.obj.level;
		if (level === "NHAN_BIET") {
			return "Nhận biết";
		} else if (level === "THONG_HIEU") {
			return "Thông hiểu";
		} else if (level === "VAN_DUNG") {
			return "Vận dụng";
		} else if (level === "VAN_DUNG_CAO") {
			return "Vận dụng cao";
		} else {
			return null;
		}
	};
	render() {
		return (
			<tr className='v-middle table-row-item' data-id={17}>
				<td>
					<label className='ui-check m-0'>
						<input
							type='checkbox'
							name='id'
							className="checkInputItem"
							onChange={this.handleCheckBox}
							value={this.props.obj._id}
						/>{" "}
						<i />
					</label>
				</td>
				<td className='flex'>
					<Link
						className='item-author text-color'
						to={"/question/" + this.props.obj._id + "/edit"}
					>
						{this.props.obj.code}
					</Link>
				</td>
				<td className='text-center'>{this.props.obj.answer}</td>
				<td className='text-left'>
					{!isUndefined(this.props.obj.subject) &&
						this.props.obj.subject.name}
				</td>
				<td className='text-left'>
					{!isUndefined(this.props.obj.chapter) &&
						this.props.obj.chapter.name}
				</td>
				<td className='text-left'>
					{!isUndefined(this.props.obj.category) &&
						this.props.obj.category.name}
				</td>
				<td className='text-left'>{this.renderLevel()}</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.updated_at &&
							Moment(this.props.obj.updated_at).format(
								"DD/MM/YYYY HH:mm"
							)}
					</span>
				</td>
				<td className="text-right">
					<div className='item-action'>
							<Link
								className='dropdown-item'
								to={"/question/" + this.props.obj._id + "/edit"}
							>
								<img src="/assets/img/icon-edit.svg" alt="" />
							</Link>
							<a
								onClick={this.handleCheck}
								data-toggle='modal'
								data-target='#delete-question'
								data-toggle-classname='fade-down'
								data-toggle-class-target='.animate'
							>
								<img src="/assets/img/icon-delete.svg" alt="" />
							</a>
						</div>
				</td>
			</tr>
		);
	}
}

class Question extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: null,
			tags: [],
			limit: "",
			checkAll: false,
			activePage: 1,
			subject_id: "",
			chapter_id: "",
			category_id: "",
			level: "",
			ids: []
		};
	}

	fetchRows() {
		if (this.props.questions instanceof Array) {
			return this.props.questions.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDelete={this.props.addDelete}
						tags={this.props.tags}
						check={this.props.check}
						handleCheckedIds={this.handleCheckedIds}
						addDataRemoveQuestion={this.props.addDataRemoveQuestion}
						onDeleteOne={this.onDeleteOne}
					/>
				);
			});
		}
	}

	onDeleteOne = async (onResetIds) => {
		if (onResetIds) {
			await this.setState({
				ids: []
			})
		}
	}

	handleCheckedIds = async (id, type = '') => {
		const _ids = this.state.ids;
		if (type === 'add') {
			if (_ids.indexOf(id) < 0) {
				_ids.push(id);
			}
		}
		if (type === 'remove') {
			let index = _ids.indexOf(id);
			if (index > -1) {
				_ids.splice(index, 1);
			}
		}

		await this.setState({
			ids: _ids
		})

	}

	onChange = async (e) => {
		e.preventDefault();

		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		
		let { keyword, subject_id, chapter_id, category_id, level} = this.state;

		this.props.history.push(`/question?keyword=${keyword}&subject_id=${subject_id}&chapter_id=${chapter_id}&category_id=${category_id}&level=${level}`);

		await this.getData(1);
	};

	handleClear = async (e) => {
		await this.setState({
			keyword: "",
			subject_id: "",
			chapter_id: "",
			category_id: "",
			level: "",
		});

		this.props.history.push(`/question`);
		this.getData(1);
	};

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			subject_id: this.state.subject_id,
			chapter_id: this.state.chapter_id,
			category_id: this.state.category_id,
			level: this.state.level,
			limit: this.props.limit,
        };

		params.page = pageNumber;

		await this.props.listQuestion(params);

	};

	async componentDidMount() {

		const url  = this.props.location.search;
        let params = queryString.parse(url);

		await this.setState({
            keyword: params.keyword ? params.keyword : "",
            subject_id: params.subject_id ? params.subject_id : "",
            chapter_id: params.chapter_id ? params.chapter_id : "",
            category_id: params.category_id ? params.category_id : "",
            level: params.level ? params.level : "",
        })
		
		const data = {
			limit: 999,
			is_delete: false,
		};
		await this.props.listChapter(data);
		await this.props.listCategory(data);
		await this.props.listSubject(data);
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				checkAll: false,
			});
		}

		this.getData(this.state.activePage);
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

	fetchRowsChapter() {
		if (this.props.chapters instanceof Array) {
			return this.props.chapters.map((obj, i) => {
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

	fetchRowsCategory() {
		if (this.props.categories instanceof Array) {
			return this.props.categories.map((obj, i) => {
				if (obj.chapter.id === this.state.chapter_id) {
					return (
						<option value={obj._id} key={obj._id.toString()}>
							{obj.name}
						</option>
					);
				}
			});
		}
	}

	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword, subject_id, chapter_id, category_id, level} = this.state;

		this.props.history.push(`/question?keyword=${keyword}&subject_id=${subject_id}&chapter_id=${chapter_id}&category_id=${category_id}&level=${level}`);

		await this.getData(1);
	};

	handleChangePage = (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		this.props.listQuestion(this.getData(pageNumber));
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listQuestion(this.getData());
	};

	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveQuestion;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteQuestion(data);
		this.props.listQuestion(this.getData());

		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}

		await this.setState({
			ids: []
		})
	};

	componentDidUpdate = async (prevProps, prevState) => {
		if (
			this.state.subject_id !== prevState.subject_id &&
			prevState.subject_id !== ""
		) {
			this.setState({
				chapter_id: "",
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

	handleCheckAll = async (e) => {
		var inputs = document.querySelectorAll('.checkInputItem');
		var flag = false;

		if (e.target.checked) {
			flag = true;
		}

		let _ids = [];
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].checked = flag;
			if (flag) {
				_ids.push(inputs[i].value);
			} else {
				_ids = [];
			}
		}

		await this.setState({
			ids: _ids
		})
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
				{/* <div className='page-hero page-container' id='page-hero'>
					<div className='padding d-flex'>
						<div className='page-title'>
							<h2 className='text-md text-highlight'>
								Kho câu hỏi
							</h2>
							<small className='text-muted'>
								Quản lý danh sách câu hỏi của bạn
							</small>
						</div>
						<div className='flex' />
						<div>
							<Link
								to={`/question/create`}
								className='btn btn-sm btn-primary text-muted'
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
				</div> */}
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<div className='block-table-question'>
							<div className='toolbar'>
								{/* <div className='btn-group'>
									{this.props._ids.length !== 0 ? (
										<button
											className='btn btn-icon'
											data-toggle='modal'
											data-target='#delete-question'
											data-toggle-classname='fade-down'
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
								</div> */}
								<div className='input-group'>
									<form
										className='flex mr-2'
										onSubmit={this.onSubmit}
									>
										<div className='input-group'>
											<input
												type='text'
												className='form-control form-control-theme'
												placeholder='Nhập từ khoá tìm kiếm...'
												onChange={this.onChange}
												name='keyword'
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
									<select
										className='custom-select mr-2'
										value={this.state.subject_id}
										name='subject_id'
										onChange={this.onChange}
									>
										<option value=''>
											-- Chọn môn học --
										</option>
										{this.fetchRowsSubject()}
									</select>
									<select
										className='custom-select mr-2'
										value={this.state.chapter_id}
										name='chapter_id'
										onChange={this.onChange}
									>
										<option value=''>
											-- Chọn chương --
										</option>
										{this.fetchRowsChapter()}
									</select>

									<select
										className='custom-select mr-2'
										value={this.state.category_id}
										name='category_id'
										onChange={this.onChange}
									>
										<option value=''>
											-- Chọn danh mục --
										</option>
										{this.fetchRowsCategory()}
									</select>
									<select
										className='custom-select mr-2'
										value={this.state.level}
										name='level'
										onChange={this.onChange}
									>
										<option value=''>
											-- Chọn độ khó --
										</option>
										<option value='NHAN_BIET'>
											Nhận biết
										</option>
										<option value='THONG_HIEU'>
											Thông hiểu
										</option>
										<option value='VAN_DUNG'>
											Vận dụng 
										</option>
										<option value='VAN_DUNG_CAO'>
											Vận dụng cao
										</option>
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
											<th width="10px">
													<label className="ui-check m-0">
														<input
															type="checkbox"
															name="id"
															onChange={this.handleCheckAll}
														/>{' '}
														<i />
													</label>
													{this.state.ids.length !== 0 && (
														<button
															className="btn btn-icon ml-16"
															data-toggle="modal"
															data-target="#delete-question"
															data-toggle-class="fade-down"
															data-toggle-class-target=".animate"
															title="Trash"
															id="btn-trash">
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
																className="feather feather-trash text-muted">
																<polyline points="3 6 5 6 21 6" />
																<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
															</svg>
														</button>)
													}
												</th>
												<th width='250px'>Câu hỏi</th>
												<th
													width='90px'
													className='text-center'
												>
													Đáp án
												</th>
												<th className='text-left'>
													Môn học
												</th>
												<th className='text-left'>
													Chương
												</th>
												<th className='text-left'>
													Dạng
												</th>
												<th className='text-left'>
													Độ khó
												</th>
												<th className='text-left'>
													Thời gian cập nhật
												</th>
												<th className="text-right">
													Thao tác
												</th>
											</tr>
										</thead>
										<tbody>{this.fetchRows()}</tbody>
									</table>
								</div>
							</div>

							<div className='row listing-footer'>
								<div className='col-sm-1'>
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

								<div className='col-sm-6 showing-text'>
									{" "}
									Hiển thị từ{" "}
									<b>
										{!isNaN(displayFrom) ? displayFrom : 0}
									</b>{" "}
									đến{" "}
									<b>{!isNaN(displayTo) ? displayTo : 0}</b>{" "}
									trong tổng số <b>{this.props.total}</b>
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
		limit: state.question.limit,
		page: state.question.page,
		total: state.question.total,
		_ids: state.question._ids,
		check: state.question.checkAll,
		dataRemoveQuestion: state.question.dataRemoveQuestion,
		subjects: state.subject.subjects,
		chapters: state.chapter.chapters,
		categories: state.category.categories,

	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listQuestion,
			deleteQuestion,
			addDelete,
			checkAll,
			listSubject,
			listChapter,
			listCategory,
			addDataRemoveQuestion
		},
		dispatch
	);
}

let QuestionContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Question)
);
export default QuestionContainer;
