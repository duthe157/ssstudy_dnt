import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import HeadingSortColumn from "../HeadingSortColumn";
import {
	listDocumentCategory,
	deleteDocumentCategory,
	updateDocumentCategory,
	addDeleteCategory,
	checkAllCategory,
	addDataRemoveDocumentCategory
} from "../../redux/document/action";
import { listSubject } from "../../redux/subject/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from 'query-string';
import _ from "lodash";


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
	handleStatusChange = async (e) => {

		let status = e.target.checked;
		let params = {
			id: this.props.obj._id,
			status: status,
		};

		await this.props.updateDocumentCategory(params);
	}
	handleCheckBox = (e) => {
		if (e.target.checked) {
			this.props.handleCheckIds(this.props.obj._id, 'add');
			this.setState({
				check: e.target.checked
			})
		} else {
			this.props.handleCheckIds(this.props.obj._id, 'remove');
			this.setState({
				check: e.target.checked
			})
		}
	};

	handleCheck = (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveDocumentCategory({
			ids: this.props.obj._id
		})
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
							value={this.props.obj._id}
							onChange={this.handleCheckBox}
						/>{" "}
						<i />
					</label>
				</td>
				<td className='flex'>
					<Link
						className='item-author text-color text-overflow-ellipsis'
						to={"/document-category/" + this.props.obj._id + "/edit"}
					>
						{this.props.obj.name}
					</Link>

				</td>
				<td className='text-left'>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.updated_at &&
							Moment(this.props.obj.updated_at).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
					</span>
				</td>
				<td className='text-left'>
					<span className='switch m-0'>
						<input
							type="checkbox"
							checked={this.props.obj.status === true}
							onChange={(e) => {
								this.handleStatusChange(e);
							}}
							ref={(input) => { this.statusCheckbox = input; }}
						/>
						<span
							className="slider round"
							onClick={() => {
								if (this.statusCheckbox) {
									this.statusCheckbox.click();
								}
							}}
						></span>
					</span>
				</td>

				<td className="text-right">
					<div className='item-action'>
						<Link
							className='mr-14'
							data-toggle='tooltip'
							title='Chỉnh sửa'
							to={"/document-category/" + this.props.obj._id + "/edit"}
						>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleCheck}
								className='trash'
								data-toggle='modal'
								data-target='#delete-video'
								data-toggle-class='fade-down'
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

class Document extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			keyword: "",
			limit: 20,
			page: 1,
			subject_id: "",
			activePage: 1,
			checkAllCategory: false,
			ids: []
		};
	}

	fetchRows() {
		if (this.props.documents instanceof Array) {
			return this.props.documents.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDeleteCategory={this.props.addDeleteCategory}
						listDocumentCategory={this.props.listDocumentCategory}
						updateDocumentCategory={this.props.updateDocumentCategory}
						getData={this.getData}
						check={this.props.check}
						handleCheckIds={this.handleCheckIds}
						onDeleteOne={this.onDeleteOne}
						addDataRemoveDocumentCategory={this.props.addDataRemoveDocumentCategory}
					/>
				);
			});
		}
	}

	async componentDidMount() {
		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			subject_id: params.subject_id ? params.subject_id : "",
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
		})

		const data = {
			limit: 999,
			is_delete: false,
		};

		await this.props.listSubject(data);

		this.getData(this.state.activePage);
	}


	onChange = async (e) => {
		e.preventDefault();

		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		let { keyword, page, limit } = this.state;

		this.props.history.push(`/document-category?keyword=${keyword}&limit=${limit}&page=${page}`);

		await this.getData(1);
	};

	onDeleteOne = (onResetIds) => {
		if (onResetIds) {
			this.setState({
				ids: []
			})
		}
	}


	handleCheckIds = async (id, type = '') => {
		var _ids = this.state.ids;
		if (type === 'add') {
			if (_ids.indexOf(id) < 0) {
				_ids.push(id);
			}
		}
		if (type === 'remove') {
			const index = _ids.indexOf(id);
			if (index > -1) {
				_ids.splice(index, 1);
			}
		}

		await this.setState({
			ids: _ids
		});
	};

	getData = (pageNumber = 1) => {
		const params = {
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
			keyword: this.state.keyword,
			subject_id: this.state.subject_id,
			limit: this.state.limit,
		};

		params.page = pageNumber;

		this.props.listDocumentCategory(params);
	};

	onSubmit = async (e) => {

		e.preventDefault();
		let { keyword, subject_id, page, limit } = this.state;

		this.props.history.push(`/document-category?keyword=${keyword}&limit=${limit}&page=${page}&subject_id=${subject_id}`);

		await this.getData(1);
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.setState({
			page: pageNumber
		})

		let { keyword, page, limit } = this.state;

		this.props.history.push(`/document-category?keyword=${keyword}&limit=${limit}&page=${page}`);
		await this.getData(pageNumber);
	};


	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveDocument;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteDocumentCategory(data);
		this.getData();

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		let { keyword, subject_id, page, limit } = this.state;

		this.props.history.push(`/document?keyword=${keyword}&limit=${limit}&page=${page}&subject_id=${subject_id}`);


		await this.getData(1);
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAllCategory !== nextProps.check) {
			this.setState({
				checkAllCategory: nextProps.check,
			});
		}
	}

	handleCheckAll = (e) => {
		var inputs = document.querySelectorAll('.checkInputItem');
		var flag = false;

		if (e.target.checked) {
			flag = true;
		}

		var _ids = [];
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = flag;
			if (flag) {
				_ids.push(inputs[i].value);
			} else {
				_ids = [];
			}
		}

		this.setState({
			ids: _ids
		});
	};
	sort = async (event) => {
		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});
		let { keyword, sort_key, sort_value } = this.state;
		this.props.history.push(`/document-category?keyword=${keyword}&sort_key=${sort_key}&sort_value=${sort_value}`);

		await this.getData(1);

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
						<h2 className="text-md text-highlight sss-page-title">Quản lý danh mục tài liệu</h2>
						<div className='block-table-document'>
							<div className='toolbar'>
								<form className='flex' onSubmit={this.onSubmit}>
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

									</div>
								</form>
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
															onChange={this.handleCheckAll}
														/>{" "}
														<i />
													</label>
													{
														this.state.ids.length !== 0
														&&
														<button
															className='btn btn-icon'
															data-toggle='modal'
															data-target='#delete-video'
															data-toggle-class='fade-down'
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
													}
												</th>
												<HeadingSortColumn
													name="name"
													content="Tên danh mục cha"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="updated_at"
													content="Ngày cập nhật"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<th className='text-left'>
													Hiển thị
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
										value={this.state.limit}
										onChange={this.handleChange}
									>
										<option value='20'>20</option>
										<option value='50'>50</option>
										<option value='100'>100</option>
										<option value='99999'>ALL</option>
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
								id='delete-video'
								className='modal fade'
								data-backdrop='true'
								style={{ display: "none" }}
								aria-hidden='true'
							>
								<div
									className='modal-dialog animate fade-down'
									data-class='fade-down'
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
		documents: state.document.main_categories,
		limit: state.document.main_categories_limit,
		page: state.document.page,
		total: state.document.main_categories_total,
		ids: state.document.ids,
		check: state.document.checkAllCategory,
		subjects: state.subject.subjects,
		dataRemoveDocument: state.document.dataRemoveDocument
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listDocumentCategory, deleteDocumentCategory, addDeleteCategory, checkAllCategory, listSubject, addDataRemoveDocumentCategory, updateDocumentCategory },
		dispatch
	);
}

let RowContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Row)
);
let DocumentContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Document)
);
export default DocumentContainer;
