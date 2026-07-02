// import React, { Component } from "react";
// import Moment from "moment";
// import { notification } from "antd";
// import Pagination from "react-js-pagination";
// import {
// 	listCategory,
// 	deleteCategory,
// 	addDelete,
// 	checkAll,
// } from "../../redux/category/action";
// import { listChapter } from "../../redux/chapter/action";
// import { Link, withRouter } from "react-router-dom";
// import { connect } from "react-redux";
// import { bindActionCreators } from "redux";
// import queryString from 'query-string';


// class Row extends Component {
// 	constructor(props) {
// 		super();
// 		this.state = {
// 			check: false,
// 		};
// 	}

// 	UNSAFE_componentWillReceiveProps(nextProps) {
// 		if (this.props.check !== nextProps.check) {
// 			this.setState({
// 				check: nextProps.check,
// 			});
// 		}
// 	}

// 	handleCheck = (e) => {
// 		if (e.target.checked) {
// 			this.props.addDelete(this.props.obj._id, "add");
// 			this.setState({
// 				check: e.target.checked,
// 			});
// 		} else {
// 			this.props.addDelete(this.props.obj._id, "remove");
// 			this.setState({
// 				check: e.target.checked,
// 			});
// 		}
// 	};

// 	render() {
// 		const { subject, chapter } = this.props.obj;
// 		return (
// 			<tr className='v-middle table-row-item' data-id={17}>
// 				<td>
// 					<label className='ui-check m-0'>
// 						<input
// 							type='checkbox'
// 							name='id'
// 							onChange={this.handleCheck}
// 							checked={this.state.check === true ? "checked" : ""}
// 						/>{" "}
// 						<i />
// 					</label>
// 				</td>
// 				<td className='flex'>
// 					<Link
// 						className='item-author text-color'
// 						to={"/category/" + this.props.obj._id + "/edit"}
// 					>
// 						{this.props.obj.name}
// 					</Link>
// 				</td>
// 				<td>
// 					<span className='item-amount d-none d-sm-block text-sm'>
// 						{subject.name}
// 					</span>
// 				</td>
// 				<td>
// 					<span className='item-amount d-none d-sm-block text-sm'>
// 						{chapter.name}
// 					</span>
// 				</td>
// 				<td>
// 					<span className='item-amount d-none d-sm-block text-sm'>
// 						{this.props.obj.updated_at &&
// 							Moment(this.props.obj.updated_at).format(
// 								"DD/MM/YYYY HH:mm:ss"
// 							)}
// 					</span>
// 				</td>
// 				<td className="text-right">
// 					<div className='item-action'>
// 						<Link
// 							className='mr-14'
// 							to={"/category/" + this.props.obj._id + "/edit"}
// 						>
// 							<img src="/assets/img/icon-edit.svg" alt="" />
// 						</Link>
// 						<a
// 							onClick={(e) =>
// 								this.props.addDelete(this.props.obj._id)
// 							}
// 							data-toggle='modal'
// 							data-target='#delete-video'
// 							data-toggle-class='fade-down'
// 							data-toggle-class-target='.animate'
// 						>
// 							<img src="/assets/img/icon-delete.svg" alt="" />
// 						</a>
// 					</div>
// 				</td>
// 			</tr>
// 		);
// 	}
// }

// class Lesson extends Component {
// 	constructor(props) {
// 		super();
// 		this.state = {
// 			data: [],
// 			limit: "",
// 			keyword: "",
// 			activePage: 1,
// 			checkAll: false,
// 		};
// 	}

// 	fetchRows() {
// 		if (this.props.categories instanceof Array) {
// 			return this.props.categories.map((object, i) => {
// 				return (
// 					<Row
// 						obj={object}
// 						key={object._id}
// 						index={i}
// 						addDelete={this.props.addDelete}
// 						listChapter={this.props.listChapter}
// 						getData={this.getData}
// 						check={this.props.check}
// 					/>
// 				);
// 			});
// 		}
// 	}

// 	onChange = (e) => {
// 		var name = e.target.name;
// 		var value = e.target.value;
// 		this.setState({
// 			[name]: value,
// 		});
// 	};

// 	async componentDidMount() {

// 		const url  = this.props.location.search;
//         let params = queryString.parse(url);

// 		await this.setState({
//             keyword: params.keyword ? params.keyword : "",
//         })


// 		const data = {
// 			limit: 999,
// 			is_delete: false,
// 		};
// 		await this.props.listChapter(data);
// 		if (this.props.limit) {
// 			await this.setState({
// 				limit: this.props.limit,
// 				checkAll: false,
// 			});
// 		}
// 		this.getData(this.state.activePage);
// 	}

// 	getData = async (pageNumber = 1) => {
// 		const params = {
// 			keyword: this.state.keyword,
// 			limit: this.props.limit,
// 			is_delete: false
//         };
// 		params.page = pageNumber;
// 		await this.props.listCategory(params);
		
// 	};


// 	onSubmit = async (e) => {
// 		e.preventDefault();
// 		let { keyword} = this.state;

// 		this.props.history.push(`/category?keyword=${keyword}`);

// 		await this.getData(1);
// 	};

// 	handleChangePage = async (pageNumber) => {
// 		window.scrollTo({ top: 0, behavior: "smooth" });
// 		await this.props.listCategory(this.getData(pageNumber));
// 	};

// 	handleDelete = async () => {
// 		const data = {
// 			ids: this.props.ids,
// 		};
// 		if (data.ids.length !== 0) {
// 			await this.props.deleteCategory(data);
// 			await this.props.listCategory(this.getData());
// 		} else {
// 			notification.warning({
// 				message: "Chưa chọn mục nào !",
// 				placement: "topRight",
// 				top: 50,
// 				duration: 3,
// 			});
// 		}
// 	};

// 	handleChange = async (e) => {
// 		var name = e.target.name;
// 		var value = e.target.value;
// 		await this.setState({
// 			[name]: value,
// 		});
// 		await this.props.listCategory(this.getData());
// 	};

// 	UNSAFE_componentWillReceiveProps(nextProps) {
// 		if (this.props.checkAll !== nextProps.check) {
// 			this.setState({
// 				checkAll: nextProps.check,
// 			});
// 		}
// 	}

// 	handleCheckAll = (e) => {
// 		if (e.target.checked) {
// 			this.props.checkAll(true);
// 			this.setState({
// 				checkAll: e.target.checked,
// 			});
// 		} else {
// 			this.props.checkAll(false);
// 			this.setState({
// 				checkAll: e.target.checked,
// 			});
// 		}
// 	};

// 	render() {
// 		let displayFrom =
// 			this.props.page === 1
// 				? 1
// 				: (parseInt(this.props.page) - 1) * this.props.limit;
// 		let displayTo =
// 			this.props.page === 1
// 				? this.props.limit
// 				: displayFrom + this.props.limit;
// 		displayTo = displayTo > this.props.total ? this.props.total : displayTo;
// 		return (
// 			<div>
// 				{/* <div className='page-hero page-container' id='page-hero'>
// 					<div className='padding d-flex'>
// 						<div className='page-title'>
// 							<h2 className='text-md text-highlight'>
// 								Bài giảng
// 							</h2>
// 							<small className='text-muted'>
// 								Quản lý bài giảng
// 							</small>
// 						</div>
// 						<div className='flex' />
// 						<div>
// 							<Link
// 								to={`/category/create`}
// 								className='btn btn-sm btn-primary text-muted'
// 							>
// 								<span className='d-none d-sm-inline mx-1'>
// 									Thêm mới
// 								</span>
// 								<svg
// 									xmlns='http://www.w3.org/2000/svg'
// 									width={16}
// 									height={16}
// 									viewBox='0 0 24 24'
// 									fill='none'
// 									stroke='currentColor'
// 									strokeWidth={2}
// 									strokeLinecap='round'
// 									strokeLinejoin='round'
// 									className='feather feather-arrow-right'
// 								>
// 									<line x1={5} y1={12} x2={19} y2={12} />
// 									<polyline points='12 5 19 12 12 19' />
// 								</svg>
// 							</Link>
// 						</div>
// 					</div>
// 				</div> */}
// 				<div className='page-content page-container' id='page-content'>
// 					<div className='padding'>
// 						<div className='block-table-lesson'>
// 							<div className='toolbar'>
// 								<div className='btn-group'>
// 									{this.props.ids.length !== 0 ? (
// 										<button
// 											className='btn btn-icon'
// 											data-toggle='modal'
// 											data-target='#delete-video'
// 											data-toggle-class='fade-down'
// 											data-toggle-class-target='.animate'
// 											title='Trash'
// 											id='btn-trash'
// 										>
// 											<svg
// 												xmlns='http://www.w3.org/2000/svg'
// 												width={16}
// 												height={16}
// 												viewBox='0 0 24 24'
// 												fill='none'
// 												stroke='currentColor'
// 												strokeWidth={2}
// 												strokeLinecap='round'
// 												strokeLinejoin='round'
// 												className='feather feather-trash text-muted'
// 											>
// 												<polyline points='3 6 5 6 21 6' />
// 												<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
// 											</svg>
// 										</button>
// 									) : (
// 										<button
// 											className='btn btn-icon'
// 											onClick={this.handleDelete}
// 											title='Trash'
// 											id='btn-trash'
// 										>
// 											<svg
// 												xmlns='http://www.w3.org/2000/svg'
// 												width={16}
// 												height={16}
// 												viewBox='0 0 24 24'
// 												fill='none'
// 												stroke='currentColor'
// 												strokeWidth={2}
// 												strokeLinecap='round'
// 												strokeLinejoin='round'
// 												className='feather feather-trash text-muted'
// 											>
// 												<polyline points='3 6 5 6 21 6' />
// 												<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
// 											</svg>
// 										</button>
// 									)}
// 								</div>
// 								<form className='flex' onSubmit={this.onSubmit}>
// 									<div className='input-group'>
// 										<input
// 											type='text'
// 											className='form-control form-control-theme keyword-custom'
// 											placeholder='Nhập từ khoá tìm kiếm...'
// 											onChange={this.onChange}
// 											value={this.state.keyword}
// 											name='keyword'
// 										/>{" "}
// 										<span className='input-group-append'>
// 											<button
// 												className='btn btn-white btn-sm'
// 												type='submit'
// 											>
// 												<span className='d-flex text-muted'>
// 													<svg
// 														xmlns='http://www.w3.org/2000/svg'
// 														width={16}
// 														height={16}
// 														viewBox='0 0 24 24'
// 														fill='none'
// 														stroke='currentColor'
// 														strokeWidth={2}
// 														strokeLinecap='round'
// 														strokeLinejoin='round'
// 														className='feather feather-search'
// 													>
// 														<circle
// 															cx={11}
// 															cy={11}
// 															r={8}
// 														/>
// 														<line
// 															x1={21}
// 															y1={21}
// 															x2='16.65'
// 															y2='16.65'
// 														/>
// 													</svg>
// 												</span>
// 											</button>
// 										</span>
// 									</div>
// 								</form>
// 							</div>

// 							<div className='row'>
// 								<div className='col-sm-12'>
// 									<table className='table table-theme table-row v-middle'>
// 										<thead className='text-muted'>
// 											<tr>
// 												<th width='10px'>
// 													<label className='ui-check m-0'>
// 														<input
// 															type='checkbox'
// 															name='id'
// 															onChange={
// 																this
// 																	.handleCheckAll
// 															}
// 															checked={
// 																this.state
// 																	.checkAll ===
// 																	true
// 																	? "checked"
// 																	: ""
// 															}
// 														/>{" "}
// 														<i />
// 													</label>
// 												</th>
// 												<th>Tên bài giảng</th>
// 												<th>Môn học</th>
// 												<th>Chương</th>
// 												<th width=''>
// 													Thời gian cập nhật
// 												</th>
// 												<th className="text-right">
// 													Thao tác
// 												</th>
// 											</tr>
// 										</thead>
// 										<tbody>{this.fetchRows()}</tbody>
// 									</table>
// 								</div>
// 							</div>

// 							<div className='row listing-footer'>
// 								<div className='col-sm-1'>
// 									<select
// 										className='custom-select w-70'
// 										name='limit'
// 										value={this.state.limit}
// 										onChange={this.handleChange}
// 									>
// 										<option value='20'>20</option>
// 										<option value='50'>50</option>
// 										<option value='100'>100</option>
// 										<option value='-1'>ALL</option>
// 									</select>
// 								</div>
// 								<div className='col-sm-6 showing-text'>
// 									{" "}
// 									Hiển thị từ{" "}
// 									<b>
// 										{!isNaN(displayFrom) ? displayFrom : 0}
// 									</b>{" "}
// 									đến{" "}
// 									<b>{!isNaN(displayTo) ? displayTo : 0}</b>{" "}
// 									trong tổng số <b>{this.props.total}</b>
// 								</div>
// 								{this.props.total !== 0 ? (
// 									<div className='col-sm-5 text-right'>
// 										<Pagination
// 											activePage={this.props.page}
// 											itemsCountPerPage={this.props.limit}
// 											totalItemsCount={this.props.total}
// 											pageRangeDisplayed={10}
// 											onChange={this.handleChangePage}
// 										/>
// 									</div>
// 								) : (
// 									<div className=''>Không có bản ghi nào</div>
// 								)}
// 							</div>

// 							<div
// 								id='delete-video'
// 								className='modal fade'
// 								data-backdrop='true'
// 								style={{ display: "none" }}
// 								aria-hidden='true'
// 							>
// 								<div
// 									className='modal-dialog animate fade-down'
// 									data-class='fade-down'
// 								>
// 									<div className='modal-content'>
// 										<div className='modal-header'>
// 											<div className='modal-title text-md'>
// 												Thông báo
// 											</div>
// 											<button
// 												className='close'
// 												data-dismiss='modal'
// 											>
// 												×
// 											</button>
// 										</div>
// 										<div className='modal-body'>
// 											<div className='p-4 text-center'>
// 												<p>
// 													Bạn chắc chắn muốn xóa bản
// 													ghi này chứ?
// 												</p>
// 											</div>
// 										</div>
// 										<div className='modal-footer'>
// 											<button
// 												type='button'
// 												className='btn btn-light'
// 												data-dismiss='modal'
// 											>
// 												Đóng
// 											</button>
// 											<button
// 												type='button'
// 												onClick={this.handleDelete}
// 												className='btn btn-danger'
// 												data-dismiss='modal'
// 											>
// 												Xoá
// 											</button>
// 										</div>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	}
// }

// function mapStateToProps(state) {
// 	return {
// 		chapters: state.chapter.chapters,
// 		categories: state.category.categories,
// 		limit: state.category.limit,
// 		page: state.category.page,
// 		total: state.category.total,
// 		ids: state.category.ids,
// 		check: state.category.checkAll,
// 	};
// }

// function mapDispatchToProps(dispatch) {
// 	return bindActionCreators(
// 		{ listCategory, deleteCategory, addDelete, checkAll, listChapter },
// 		dispatch
// 	);
// }

// let LessonContainer = withRouter(
// 	connect(mapStateToProps, mapDispatchToProps)(Lesson)
// );
// export default LessonContainer;
