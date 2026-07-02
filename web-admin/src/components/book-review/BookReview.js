import React, { Component } from 'react';
import Moment from 'moment';
import { notification } from 'antd';
import Pagination from 'react-js-pagination';
import {
	listBookReview, updateReview, addDataRemoveBookReview, deleteBookReview
} from '../../redux/book-review/action';
import {
	showBook
} from '../../redux/book/action';

import HeadingSortColumn from "../HeadingSortColumn";

import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import queryString from 'query-string';


class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
			rating: 0,
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
		this.props.onDeleteOne(true);
		this.props.addDataRemoveBookReview({
			ids: this.props.obj._id
		})
	};

	handleCheckBox = e => {
		if (e.target.checked) {
			this.props.handleCheckedIds(this.props.obj._id, 'add');
			this.setState({
				check: e.target.checked
			});
		} else {
			this.props.handleCheckedIds(this.props.obj._id, 'remove');
			this.setState({
				check: e.target.checked
			});
		}
	};

	componentDidMount() {
		this.setState({
			check: false,
			status: this.props.obj.status,
			rating: this.props.obj.rating
		});
	}

	handleChangeStatus = async e => {
		e.preventDefault();
		var name = e.target.name;
		let checke = e.target.checked;
		var value = e.target.value;
		if (name === 'rating')
			checke = parseInt(value);
		await this.setState({
			[name]: checke,
		});

		const data = {
			id: this.props.obj._id,
			name: this.props.obj.name,
			book_id: this.props.obj.book_id,
			comment: this.props.obj.comment,
			status: this.state.status,
			rating: this.state.rating
		};
		await this.props.updateReview(data);
	};

	render() {
		return (
			<tr className="v-middle table-row-item" data-id={17}>
				<td>
					<label className="ui-check m-0">
						<input
							type="checkbox"
							name="id"
							className='checkInputItem'
							onChange={this.handleCheckBox}
							value={this.props.obj._id}
						/>{' '}
						<i />
					</label>
				</td>
				<td className="flex">
					<Link
						className="mr-14 text-color"
						to={'/book/review/' + this.props.obj._id + '/edit'}>
						{this.props.obj.book ? this.props.obj.book.name : ''}
					</Link>
				</td>
				<td className="flex">
					<Link
						className="mr-14 text-color"
						to={'/book/review/' + this.props.obj._id + '/edit'}>
						{this.props.obj.name}
					</Link>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.comment}
					</span>
				</td>
				<td className="text-left">
					<select className="form-control" name="rating" value={this.state.rating} onChange={this.handleChangeStatus}>
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
						<option value={4}>4</option>
						<option value={5}>5</option>
					</select>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						<label className="ui-switch ui-switch-md info m-t-xs">
							<input
								type="checkbox"
								name="status"
								value={this.props.obj._id}
								checked={this.state.status === true ? 'checked' : ''}
								onChange={this.handleChangeStatus}
							/>{' '}
							<i />
						</label>
					</span>
				</td>
				<td className="text-center">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.updated_at &&
							Moment(this.props.obj.updated_at).format(
								'DD/MM/YYYY HH:mm',
							)}
					</span>
				</td>
				<td className='text-right'>
					<div className="item-action">
						<Link
							className="mr-14"
							data-toggle='tooltip'
							title='Chỉnh sửa'
							to={'/book/review/' + this.props.obj._id + '/edit'}>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleCheck}
								data-toggle="modal"
								data-target="#delete-book"
								data-toggle-class="fade-down"
								data-toggle-class-target=".animate">
								<img src="/assets/img/icon-delete.svg" alt="" />
							</a>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

class BookReview extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			page: 1,
			limit: 20,
			ids: [],
			keyword: "",
			activePage: 1,
			checkAll: false,
			book_id: props.match.params.book_id,
			base_url: '/book/' + props.match.params.book_id + '/review',
			sort_key: "",
			sort_value: ""
		};
	}

	fetchRows() {
		if (this.props.reviews instanceof Array) {
			return this.props.reviews.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						// addDelete={this.props.addDelete}
						handleCheckedIds={this.handleCheckedIds}
						onDeleteOne={this.onDeleteOne}
						getData={this.getData}
						check={this.props.check}
						updateReview={this.props.updateReview}
						baseUrl={this.state.base_url}
						addDataRemoveBookReview={this.props.addDataRemoveBookReview}
					/>
				);
			});
		}
	}

	onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	onDeleteOne = (onResetIds) => {
		if (onResetIds) {
			this.setState({
				ids: []
			})
		}
	}

	handleCheckedIds = (id, type = '') => {
		var _ids = this.state.ids;
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

		this.setState({
			ids: _ids
		})
	}

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
			limit: this.props.limit,
		};

		params.page = pageNumber;

		await this.props.listBookReview(params);

	};

	async componentDidMount() {
		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			sort_key: params.sort_key ? params.sort_key : "",
			keyword: params.keyword ? params.keyword : "",
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
		})

		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				checkAll: false,
			});
		}
		this.getData(this.state.activePage);
	}

	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword } = this.state;

		this.props.history.push(`/book/review?keyword=${keyword}`);

		await this.getData(1);
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });

		await this.setState({
			page: pageNumber
		})
		let { keyword, limit, page } = this.state;

		this.props.history.push(`/book/review?keyword=${keyword}&limit=${limit}&page=${page}`);

		await this.getData(pageNumber);
	};

	handleDelete = async () => {
		// const data = {
		// 	ids: this.props.ids,
		// };
		// if (data.ids.length !== 0) {
		// 	await this.props.deleteReview(data);
		// 	await this.props.listBookReview(this.getData());
		// } else {
		// 	notification.warning({
		// 		message: 'Chưa chọn mục nào !',
		// 		placement: 'topRight',
		// 		top: 50,
		// 		duration: 3,
		// 	});
		// }

		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveBookReview;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteBookReview(data);
		await this.props.listBookReview(this.getData());

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}

		await this.setState({
			ids: []
		})
	};

	handleChange = async e => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		let { keyword, limit, page } = this.state;

		this.props.history.push(`/book/review?keyword=${keyword}&limit=${limit}&page=${page}`);

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
		// if (e.target.checked) {
		// 	this.props.checkAll(true);
		// 	this.setState({
		// 		checkAll: e.target.checked,
		// 	});
		// } else {
		// 	this.props.checkAll(false);
		// 	this.setState({
		// 		checkAll: e.target.checked,
		// 	});
		// }
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


	sort = async (event) => {
		const { classList } = event.target;

		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});



		let { keyword, sort_key, sort_value, limit, page } = this.state;

		this.props.history.push(`/book/review?limit=${limit}&page=${page}&keyword=${keyword}&sort_key=${sort_key}&sort_value=${sort_value}`);

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
						<h2 className='sss-page-title text-md text-highlight'>
							Đánh giá sách
						</h2>
						<div className="block-table-book-review">
							<div className="toolbar">
								<form className="flex" onSubmit={this.onSubmit}>
									<div className="input-group">
										<input
											type="text"
											className="form-control form-control-theme keyword-custom"
											placeholder="Nhập từ khoá tìm kiếm..."
											onChange={this.onChange}
											name="keyword"
											value={this.state.keyword}
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
															data-target="#delete-book"
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
													name="book.name"
													content="Tên sách"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="name"
													content="Người đánh giá"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="comment"
													content="Đánh giá"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<th className="text-left">
													Số sao
												</th>
												<th className="text-left">
													Kích hoạt
												</th>
												<HeadingSortColumn
													name="updated_at"
													content="Ngày cập nhật"
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
									Hiển thị từ <b>{displayFrom}</b> đến{' '}
									<b>{displayTo}</b> trong tổng số{' '}
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
								id="delete-book"
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
		reviews: state.bookReview.bookReviews ? state.bookReview.bookReviews : [],
		limit: state.bookReview.limit,
		page: state.bookReview.page,
		total: state.bookReview.total,
		ids: state.bookReview.ids,
		check: state.bookReview.checkAll,
		book: state.book.book,
		review: state.bookReview.review ? state.bookReview.review : {},
		dataRemoveBookReview: state.bookReview.dataRemoveBookReview ? state.bookReview.dataRemoveBookReview : {}
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listBookReview, showBook, updateReview, addDataRemoveBookReview, deleteBookReview },
		dispatch,
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(BookReview),
);
export default Container;
