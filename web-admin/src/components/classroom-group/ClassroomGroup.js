import React, { Component } from 'react';
import Moment from 'moment';
import Pagination from 'react-js-pagination';
import {
	listClassroomGroup,
	deleteClassroomGroup,
	addDelete,
	checkAll,
	updateClassroomGroup,
	addDataRemoveClassroomGroup
} from '../../redux/classroomgroup/action';
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
			is_show_home: false,
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

	componentDidMount() {
		this.setState({
			check: false,
			status: this.props.obj.status,
			is_show_home: this.props.obj.is_show_home ? this.props.obj.is_show_home : false,
			ordering: this.props.obj.ordering,
		});
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
			ids: [this.props.obj._id]
		})
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
			name: this.props.obj.name,
			content: this.props.obj.content,
			status: this.state.status,
			is_show_home: this.state.is_show_home,
			thumb: this.props.obj.thumb,
		};
		await this.props.updateClassroomGroup(data);

		await this.props.handleReloadPage();
	};

	handleChangeOrdering = async e => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		const data = {
			id: this.props.obj._id,
			name: this.props.obj.name,
			content: this.props.obj.content,
			status: this.state.status,
			is_show_home: this.state.is_show_home,
			year: this.props.obj.year,
			thumb: this.props.obj.thumb,
			ordering: this.state.ordering,
		};
		await this.props.updateClassroomGroup(data);
	};
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
					<Link
						className="item-author text-color"
						to={'/classroom/group/' + this.props.obj._id + '/edit'}>
						{this.props.obj.name}
					</Link>
				</td>
				<td className="text-left">
					<input type="number" className="form-control" name="ordering" value={this.state.ordering} onChange={this.handleChangeOrdering} />
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						<label className="ui-switch ui-switch-md info m-t-xs">
							<input
								type="checkbox"
								name="is_show_home"
								value={this.props.obj._id}
								checked={this.state.is_show_home === true ? 'checked' : ''}
								onChange={this.handleChangeStatus}
							/>{' '}
							<i />
						</label>
					</span>
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
				<td className="text-right">
					<div className="item-action">

						<Link
							className="mr-14"
							data-toggle='tooltip'
							title='Chỉnh sửa'
							to={'/classroom/group/' + this.props.obj._id + '/edit'}>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						<div className="dropdown-divider" />
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleCheck}
								data-toggle="modal"
								data-target="#delete-video"
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

class ClassroomGroup extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			keyword: "",
			activePage: 1,
			limit: 20,
			checkAll: false,
			ids: []
		};
	}

	fetchRows() {
		if (this.props.classroomGroups instanceof Array) {
			return this.props.classroomGroups.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDelete={this.props.addDelete}
						listChapter={this.props.listChapter}
						getData={this.getData}
						check={this.props.check}
						updateClassroomGroup={this.props.updateClassroomGroup}
						handleCheckedIds={this.handleCheckedIds}
						addDataRemoveExam={this.props.addDataRemoveClassroomGroup}
						onDeleteOne={this.onDeleteOne}
						handleReloadPage={this.handleReloadPage}
					/>
				);
			});
		}
	}

	handleReloadPage = async () => {
		await this.getData(1);
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

	async componentDidMount() {
		// await this.props.listClassroomGroup(this.getData());
		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
		})

		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				checkAll: false,
			});
		}
		this.getData(this.state.activePage)
	}

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			limit: this.props.limit,
		};
		params.page = pageNumber;

		await this.props.listClassroomGroup(params);
	};

	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword } = this.state;

		this.props.history.push(`/classroom/group?keyword=${keyword}`);

		await this.getData(1);
	};

	handleChangePage = async pageNumber => {
		await this.props.listClassroomGroup(this.getData(pageNumber));
	};

	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveClassroomGroup;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteClassroomGroup(data);
		this.props.listClassroomGroup(this.getData());

		for (var i = 0; i < inputs.length; i++) {
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
		await this.props.listClassroomGroup(this.getData());
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
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Danh mục Lớp</h2>
						<div className="block-table-classroom-group">
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
												<th>Tên</th>
												<th className="text-left" style={{display: 'none'}}>
													Môn học
												</th>
												<th width="125px" className="text-left">
													Thứ tự
												</th>
												<th className="text-left">
													Trang chủ
												</th>
												<th className="text-left">
													Kích hoạt
												</th>
												<th className="text-center">
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
		classroomGroups: state.classroomGroup ? state.classroomGroup.classroomGroups : [],
		limit: state.chapter.limit,
		page: state.classroomGroup.page,
		total: state.classroomGroup.total,
		ids: state.classroomGroup.ids,
		check: state.chapter.checkAll,
		dataRemoveClassroomGroup: state.classroomGroup.dataRemoveClassroomGroup
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listClassroomGroup, deleteClassroomGroup, addDelete, checkAll, addDataRemoveClassroomGroup, updateClassroomGroup },
		dispatch,
	);
}

let ChapterContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ClassroomGroup),
);
export default ChapterContainer;
