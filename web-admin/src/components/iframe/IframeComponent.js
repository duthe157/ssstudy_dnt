import React, { Component } from 'react';
import Moment from 'moment';
import { notification } from 'antd';
import Pagination from 'react-js-pagination';
import {
	deleteIframe,
	listIframe
} from '../../redux/iframe/action';
import { listSubject } from "../../redux/subject/action";
import { listAdmin } from "../../redux/student/action";

import HeadingSortColumn from "../HeadingSortColumn";

import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import queryString from 'query-string';
import {setLoader} from '../LoadingContext';

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
			category_id: '',
			is_featured: false,
			ordering: 0,
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

	componentDidMount() {
		this.setState({
			check: false,
			status: this.props.obj.status,
			is_featured: this.props.obj.is_featured ? this.props.obj.is_featured : false,
			category_id: this.props.obj.category ? this.props.obj.category.id : '',
			ordering: this.props.obj.ordering,
		});
	}

	handleChangeStatus = async e => {
		e.preventDefault();
		var name = e.target.name;
		var checke = e.target.checked;

		await this.setState({
			[name]: checke,
		});

		const data = {
			id: this.props.obj._id,
			status: this.state.status
		};
		await this.props.updateMetaData(data);
	};
	handleChangeFeatured = async e => {
		e.preventDefault();
		var name = e.target.name;
		var checke = e.target.checked;

		await this.setState({
			[name]: checke,
		});

		const data = {
			id: this.props.obj._id,
			is_featured: this.state.is_featured
		};
		await this.props.updateMetaData(data);
	};

	handleChangeOrdering = async e => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		const data = {
			id: this.props.obj._id,
			ordering: this.state.ordering,
		};
		await this.props.updateMetaData(data);
	};


	handleCheck = async (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveBook({
			ids: this.props.obj._id
		})
	}

	copyTextToClipboard = async (text) => {
		const textarea = document.createElement('textarea');
		textarea.value = text;
	
		document.body.appendChild(textarea);
		textarea.select();
	
		try {
			document.execCommand('copy');
		} catch (err) {
		}
	
		document.body.removeChild(textarea);

		notification.success({
			message: "Coppy thành công",
			placement: "topRight",
			bottom: 50,
			duration: 3
		});
	}

	render() {
		const { subject } = this.props.obj;
		return (
			<tr className="v-middle table-row-item" data-id={17}>
				<td>
					<label className="ui-check m-0">
						<input
							type="checkbox"
							name="id"
							className="checkInputItem"
							onChange={this.handleCheckBox}
							value={this.props.obj._id}
						/>{' '}
						<i />
					</label>
				</td>
				<td className="flex">
					<span className="item-amount d-none d-sm-block text-sm">
						Form đăng ký
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.classroom_name}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{subject.name}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.classroom_id}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.created_at}
					</span>
				</td>
				<td className="text-left input-group">
					{/* <input type="text" className="form-control" name="iframe" value={this.props.obj.iframe} readOnly /> */}
					<input type="text" className="form-control" aria-label="iframe text" aria-describedby="basic-addon2" value={this.props.obj.iframe}/>
  					<div className="input-group-append">
    					<button 
						    onClick={() => this.copyTextToClipboard(this.props.obj.iframe)} 
						 	type="button" className="btn btn btn-link" id="basic-addon2"><img src="/assets/img/icon-copy.svg" alt="coppy" /></button>
  					</div>
				</td>
				<td className='text-right'>
					<div className="item-action">
						<Link
							className="mr-14"
							data-toggle='tooltip'
							title='Chỉnh sửa'
							to={'/iframe-edit/' + this.props.obj._id}>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleCheck}
								data-toggle="modal"
								data-target="#delete-video"
								data-toggle-class="fade-down"
								data-toggle-class-target=".animate"
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

class IframeComponent extends Component {
	constructor(props) {
		super();
		this.state = {
			ids: [],
			data: [],
			keyword: "",
			activePage: 1,
			limit: 20,
			page: 1,
			checkAll: false,
			base_url: '/iframe',
			level: "",
			subject_id: null,
			teacher_id: null,
			sort_key: "",
			sort_value: "",
		};
	}

	fetchRows() {
		if (this.props.iframes instanceof Array) {
			return this.props.iframes.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						handleCheckedIds={this.handleCheckedIds}
						addDataRemoveBook={this.props.addDataRemoveBook}
						onDeleteOne={this.onDeleteOne}
						getData={this.getData}
						check={this.props.check}
						updateMetaData={this.props.updateMetaData}
					/>
				);
			});
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

	onDeleteOne = async (onResetIds) => {
		if (onResetIds) {
			await this.setState({
				ids: []
			})
		}
	}

	onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			level: this.state.level,
			subject_id: this.state.subject_id,
			teacher_id: this.state.teacher_id,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
			limit: this.state.limit,
			page: this.state.page || pageNumber
		};
		await this.props.listIframe(params);
	};

	async init() {
		const url = this.props.location.search;
		let params = queryString.parse(url);
		this.setState({
			keyword: params.keyword ? params.keyword : "",
			level: params.level && !isNaN(params.level) ? params.level : null,
			subject_id: params.subject_id && !isNaN(params.subject_id) ? params.subject_id : null,
			teacher_id: params.teacher_id && !isNaN(params.teacher_id) ? params.teacher_id : null,
			sort_key: params.sort_key ? params.sort_key : "",
			sort_value: params.sort_value ? params.sort_value : "",
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
			isLoading: true,
		})
		const data = {
			limit: 999,
			is_delete: false,
		};
		const dataListAdmin = {
			user_group: "TEACHER",
			limit: 100,
		};
		if (this.props.limit) {
			this.setState({
				limit: this.props.limit,
				checkAll: false,
			});
		}
		await Promise.all([this.props.listSubject(data),this.props.listAdmin(dataListAdmin),this.getData(this.state.activePage)])
	}

	async componentDidMount() {
		setLoader(true);
		await this.init()
		setLoader(false);
	}

	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword, limit, page, level, subject_id, teacher_id } = this.state;

		this.props.history.push(`/iframe?limit=${limit}&page=${page}&keyword=${keyword}&level=${level}&subject_id=${subject_id}&teacher_id=${teacher_id}`);

		await this.getData(1);
	};

	handleChangePage = async (pageNumber) => {
		// window.scrollTo({ top: 0, behavior: "smooth" });
		// await this.setState({
		// 	page: pageNumber
		// })
		// let { keyword, limit, page } = this.state;
		//
		// this.props.history.push(`/book?keyword=${keyword}&limit=${limit}&page=${page}`);
		//
		// await this.getData(1);
	};

	handleDelete = async () => {
		setLoader(true);
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveBook;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}
		await this.props.deleteIframe(data);
		await this.props.listIframe(this.getData(1));

		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}

		await this.setState({
			ids: []
		})
		setLoader(false);
	};

	handleDeleteAll = () => {
		var data = this.state.ids;

		if (data.length === 0) {
			notification.warning({
				message: 'Chưa chọn mục nào !',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
		}
	}

	handleChange = async (e) => {
		e.preventDefault();
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		// await this.props.listBook(this.getData());
		let { keyword, limit, page } = this.state;

		this.props.history.push(`/book?keyword=${keyword}&limit=${limit}&page=${page}`);

		await this.getData(1);
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


	fetchSubjectRows() {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return <option key={i} value={obj._id}>{obj.name}</option>;
			});
		}
	}

	fetchTeacherRows() {
		if (this.props.students instanceof Array) {
			return this.props.students.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id.toString()}>
						{obj.fullname}
					</option>
				);
			});
		}
	}

	sort = async (event) => {
		const { classList } = event.target;

		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});



		let { keyword, level, teacher_id, subject_id, page, limit, sort_key, sort_value } = this.state;

		this.props.history.push(`/book?limit=${limit}&page=${page}&keyword=${keyword}&level=${level}&subject_id=${subject_id}&teacher_id=${teacher_id}&sort_key=${sort_key}&sort_value=${sort_value}`);

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
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className='text-md text-highlight sss-page-title'>
							Quản lý mã form
						</h2>
						<div className="block-table-book">
							<div className="toolbar">
								<form className="flex block-filter-book" onSubmit={this.onSubmit}>
									<div className="input-group">
										<input
											type="text"
											className="form-control form-control-theme keyword-custom"
											placeholder="Nhập từ khoá tìm kiếm..."
											onChange={this.onChange}
											value={this.state.keyword}
											name="keyword"
										/>{' '}
										<span className="input-group-append">
											<button
												className="btn btn-white btn-sm"
												type="submit">
												<span className="d-flex text-muted">
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
														className="feather feather-search">
														<circle
															cx={11}
															cy={11}
															r={8}
														/>
														<line
															x1={21}
															y1={21}
															x2="16.65"
															y2="16.65"
														/>
													</svg>
												</span>
											</button>
										</span>

										<div className='ml-16'>
											<select
												className="custom-select"
												value={this.state.level}
												name="level"
												onChange={this.onChange}
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

										<div className='ml-16'>
											<select
												className="custom-select"
												value={this.state.subject_id}
												name="subject_id"
												onChange={this.onChange}
											>
												<option value="">Môn học</option>
												{this.fetchSubjectRows()}
											</select>
										</div>

										<div className='ml-16'>
											<select
												className="custom-select"
												value={this.state.teacher_id}
												name="teacher_id"
												onChange={this.onChange}
											>
												<option value="">Giáo viên</option>
												{this.fetchTeacherRows()}
											</select>
										</div>
										<div className='btn-filter ml-16'>
											<button type='sumbit'>
												<img src='/assets/img/icon-filter.svg' className='mr-10' alt='' />
												<span>Lọc kết quả</span>
											</button>
										</div>

									</div>
								</form>
							</div>

							<div className="row">
								<div className="col-sm-12">
									<table className="table table-theme table-row v-middle">
										<thead className="text-muted">
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
															data-target="#delete-video"
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
													content="Tên form"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name=""
													content="Tên khóa học"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name=""
													content="Môn học"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name=""
													content="Mã khóa học"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name=""
													content="Thời gian tạo"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name=""
													content="Mã nhúng"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<th className='text-right'>
													Thao tác
												</th>
											</tr>
										</thead>
										<tbody>{this.fetchRows()}</tbody>
									</table>
								</div>
							</div>

							<div className="row listing-footer">
								<div className="col-sm-1">
									<select
										className="custom-select w-70"
										name="limit"
										value={this.state.limit}
										onChange={this.handleChange}>
										<option value="20">20</option>
										<option value="50">50</option>
										<option value="100">100</option>
										<option value="-1">ALL</option>
									</select>
								</div>
								<div className="col-sm-6 showing-text">
									{' '}
									Hiển thị từ <b>{displayFrom ? displayFrom : ''}</b> đến{' '}
									<b>{displayTo ? displayTo : ''}</b> trong tổng số{' '}
									<b>{this.props.total}</b>
								</div>
								{this.props.total !== 0 ? (
									<div className="col-sm-5 text-right">
										<Pagination
											activePage={this.props.page}
											itemsCountPerPage={this.props.limit}
											totalItemsCount={this.props.total}
											pageRangeDisplayed={10}
											onChange={this.handleChangePage}
										/>
									</div>
								) : (
									<div className="">Không có bản ghi nào</div>
								)}
							</div>

							<div
								id="delete-video"
								className="modal fade"
								data-backdrop="true"
								style={{ display: 'none' }}
								aria-hidden="true">
								<div
									className="modal-dialog animate fade-down"
									data-class="fade-down">
									<div className="modal-content">
										<div className="modal-header">
											<div className="modal-title text-md">
												Thông báo
											</div>
											<button
												className="close"
												data-dismiss="modal">
												×
											</button>
										</div>
										<div className="modal-body">
											<div className="p-4 text-center">
												<p>
													Bạn chắc chắn muốn xóa bản
													ghi này chứ?
												</p>
											</div>
										</div>
										<div className="modal-footer">
											<button
												type="button"
												className="btn btn-light"
												data-dismiss="modal">
												Đóng
											</button>
											<button
												type="button"
												onClick={this.handleDelete}
												className="btn btn-danger"
												data-dismiss="modal">
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
		subjects: state.subject.subjects,
		iframes: state.iframe ? state.iframe.iframes : [],
		limit: state.iframe.limit,
		page: state.iframe.page,
		total: state.iframe.total,
		ids: state.iframe.ids,
		check: state.iframe.checkAll,
		dataRemoveBook: state.book.dataRemoveBook,
		students: state.student.students,

	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listIframe, listSubject, listAdmin, deleteIframe },
		dispatch,
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(IframeComponent, Row),
);
export default Container;
