import React, { Component } from "react";
import Moment from "moment";
import { Select, Badge, notification } from "antd";
import { Link, withRouter } from "react-router-dom";
import Pagination from "react-js-pagination";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from 'query-string';


import {
	listExam,
	deleteExam,
	addDelete,
	checkAll,
	addDataRemoveExam,
	copyExam
} from "../../redux/exam/action";
import { listSubject } from "../../redux/subject/action";

import HeadingSortColumn from "../HeadingSortColumn";
import { param } from "jquery";

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
		this.props.addDataRemoveExam({
			ids: this.props.obj._id
		})
	}

	handleCoppyExam = (examId) => {
		this.props.handleCoppyExam(examId)
	}

	renderExamType = (type) => {
		switch (type) {
			case 'TOT_NGHIEP':
				return 'TỐT NGHIỆP';
			case 'HSA':
				return 'HSA';
			case 'APT':
				return 'APT';
			case 'TSA':
				return 'TSA';
			default:
				return type; // Default case returns the type if not matched
		}
	}

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
						to={"/examv2/create/?id=" + this.props.obj._id}
					>
						{this.props.obj.name}
					</Link>
				</td>
				<td className='text-center'>{this.props.obj.code}</td>
				<td className='text-center'>{this.props.obj.subject.name}</td>
				<td className='text-center'>
					{ this.renderExamType(this.props.obj.type)}
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
				<td className="text-right">
					<div className='item-action'>
						<Link
							data-toggle='tooltip'
							title='Chỉnh sửa'
							className='mr-14'
							to={"/examv2/create/?id=" + this.props.obj._id}
						>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						{/*<div*/}
						{/*	data-toggle='tooltip'*/}
						{/*	title='Copy đề'*/}
						{/*>*/}
						{/*	<a className="mr-14" onClick={() => this.handleCoppyExam(this.props.obj._id)}>*/}
						{/*		<img src="/assets/img/icon-document.svg" alt="" />*/}
						{/*	</a>*/}
						{/*</div>*/}
						<Link
							className='mr-14'
							data-toggle='tooltip'
							title='Báo cáo điểm'
							to={"/exam-v2/" + this.props.obj._id + "/report"}
						>
							<img src="/assets/img/icon-chart.svg" alt="" />
						</Link>
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleCheck}
								data-toggle='modal'
								data-target='#delete-exam'
								data-toggle-classname='fade-down'
								data-toggle-class-target='.animate'
							>
								<img src="/assets/img/icon-delete.svg" alt="" />
							</a>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

class ExamList extends Component {
	constructor(props) {
		super();
		this.state = {
			ids: [],
			keyword: "",
			tags: [],
			page: 1,
			activePage: 1,
			limit: 20,
			checkAll: false,
			subject_id: "",
			sort_key: "",
			sort_value: ""
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
						handleCheckedIds={this.handleCheckedIds}
						addDataRemoveExam={this.props.addDataRemoveExam}
						onDeleteOne={this.onDeleteOne}
						handleCoppyExam={this.handleCoppyExam}
						tags={this.props.tags}
						check={this.props.check}
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

	handleCoppyExam = async (examId) => {
		await this.props.copyExam(examId);

		this.getData(1);

	}

	onChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
	};

	onChangeSubject = async (e) => {
		e.preventDefault();

		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});

		let { keyword, limit, page, subject_id } = this.state;

		this.props.history.push(`/examv2?keyword=${keyword}&limit=${limit}&page=${page}&subject_id=${subject_id}`);

		await this.getData(1);


	}

	async componentDidMount() {

		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			subject_id: params.subject_id ? params.subject_id : "",
			sort_key: params.sort_key ? params.sort_key : "",
			sort_value: params.sort_value ? params.sort_value : "",
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
			creating_type: 'MANUAL'
		})

		const data = {
			limit: 999,
			is_delete: false,
		};
		await this.props.listSubject(data);
		this.getData(1);
	}

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			subject_id: this.state.subject_id,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
			limit: this.state.limit,
			creating_type: 'MANUAL'
		};

		params.page = pageNumber;

		await this.props.listExam(params);

	};

	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword, limit, page, subject_id } = this.state;

		this.props.history.push(`/examv2?keyword=${keyword}&limit=${limit}&page=${page}&subject_id=${subject_id}`);

		await this.getData(1);
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.setState({
			page: pageNumber
		})
		let { keyword, limit, page, subject_id } = this.state;

		this.props.history.push(`/examv2?keyword=${keyword}&limit=${limit}&page=${page}&subject_id=${subject_id}`);

		await this.getData(pageNumber);
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		let { keyword, limit, page, subject_id } = this.state;

		this.props.history.push(`/examv2?keyword=${keyword}&limit=${limit}&page=${page}&subject_id=${subject_id}`);

		await this.getData(1);
	};

	handleChangeTag = async (value) => {
		await this.setState({
			tags: value,
		});
		this.getData(1);
	};

	fetchOptions() {
		if (this.props.tags instanceof Array) {
			return this.props.tags.map((obj, i) => {
				return <Option key={obj._id.toString()}>{obj.name}</Option>;
			});
		}
	}

	handleDelete = async () => {

		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveExam;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteExam(data);
		this.getData(1);

		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}

		await this.setState({
			ids: []
		})
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
		this.getData(1);
	};


	sort = async (event) => {
		const { classList } = event.target;

		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});

		let { keyword, limit, page, subject_id, sort_key, sort_value } = this.state;

		this.props.history.push(`/exam?keyword=${keyword}&limit=${limit}&page=${page}&subject_id=${subject_id}&sort_key=${sort_key}&sort_value=${sort_value}`);


		await this.getData(1);

	}

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
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<h2 className="text-md text-highlight sss-page-title">Quản lý đề thi</h2>
						<div className='block-table-exam'>
							<div className='toolbar'>
								<div className='input-group'>
									<form
										className='flex'
										onSubmit={this.onSubmit}
									>
										<div className='input-group'>
											<input
												type='text'
												className='form-control form-control-theme keyword-custom'
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
											<div className="ml-16">
												<select
													className='custom-select'
													value={this.state.subject_id}
													name='subject_id'
													onChange={this.onChangeSubject}
												>
													<option value=''>
														-- Chọn môn học --
													</option>
													{this.fetchRowsSubject()}
												</select>
											</div>
											<button
												className='btn btn-white btn-sm ml-16'
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
									</form>
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
															data-target="#delete-exam"
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
												<HeadingSortColumn
													name="name"
													content="Đề thi"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="code"
													content="Mã đề"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
													customClass="text-center"
												/>
												<HeadingSortColumn
													name="subject.id"
													content="Môn học"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
													customClass="text-center"
												/>
												<th className='text-center'>
													Loại đề thi
												</th>
												<th className='text-center'>
													Tổng số câu
												</th>
												<HeadingSortColumn
													name="updated_at"
													content="Ngày cập nhật"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
													customClass="text-center"
												/>
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
								id='delete-exam'
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
		dataRemoveExam: state.exam.dataRemoveExam,
		isCopyExam: state.exam.isCopyExam,
		subjects: state.subject.subjects,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listExam, deleteExam, addDelete, addDataRemoveExam, checkAll, listSubject, copyExam },
		dispatch
	);
}

let RowContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Row)
);
let ExamContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ExamList)
);
export default ExamContainer;
