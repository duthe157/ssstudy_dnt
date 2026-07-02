import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import { CSVLink } from "react-csv";
import {
	listTesting,
	addDelete,
	deleteTesting,
	checkAll,
	confirmTesting,
	updatePoint,
	addDataRemoveTesting
} from "../../redux/testing/action";

import HeadingSortColumn from "../HeadingSortColumn";

import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";
import { listSubject } from "../../redux/subject/action";
import { listClassroom } from "../../redux/classroom/action";
import queryString from 'query-string';

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			point: "",
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.check !== nextProps.check) {
			this.setState({
				check: nextProps.check,
			});
		}
		if (nextProps.success === true) {
			this.setState({
				check: false,
			});
		}
	}

	componentDidMount() {
		this.setState({ point: Math.round(this.props.obj.point * 10) / 10 });
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

	handleChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	handleSubmit = async (e) => {
		e.preventDefault();
		var regex = /^-?\d*(\.\d+)?$/;
		var check = regex.test(this.state.point);

		if (check) {
			var data = {
				id: this.props.obj._id,
				point: parseFloat(this.state.point),
			};
			await this.props.updatePoint(data);
		} else {
			notification.warning({
				message: "Điểm phải là số",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	};

	handleCheck = async (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveTesting({
			ids: this.props.obj._id
		})
	}

	render() {
		return (
			<tr className='v-middle table-row-item' data-id={17}>
				<td>
					<label className='ui-check m-0'>
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
				<td className='flex' width={80}>
					<Link
						className='item-author text-color'
						to={"/testing/" + this.props.obj._id + "/edit"}
					>
						{this.props.obj.exam.exam_code ||
							this.props.obj.exam.code}
					</Link>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{!isUndefined(this.props.obj.exam.name) &&
							this.props.obj.exam.name}
					</span>
				</td>
				<td className='flex' width={80}>
					<Link
						className='item-author text-color'
						to={"/student/" + this.props.obj.user.id + "/edit"}
						target='_blank'
					>
						{(!isUndefined(this.props.obj.user.user_code) &&
							this.props.obj.user.user_code) ||
							(!isUndefined(this.props.obj.user.code) &&
								this.props.obj.user.code)}
					</Link>
				</td>
				<td>
					<Link
						className='item-author text-color'
						to={"/student/" + this.props.obj.user.id + "/edit"}
						target='_blank'
					>
						<span className='item-amount d-none d-sm-block text-sm'>
							{!isUndefined(this.props.obj.user.name) &&
								this.props.obj.user.name}
						</span>
					</Link>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.classroom.name}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.subject.name}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						<form onSubmit={this.handleSubmit}>
							<input
								type='text'
								name='point'
								className='form-control'
								style={{ maxWidth: 80 }}
								onChange={this.handleChange}
								value={this.state.point}
							/>
						</form>
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{this.props.obj.created_at &&
							Moment(this.props.obj.created_at).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
					</span>
				</td>
				{/* <td>
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
								to={"/testing/" + this.props.obj._id + "/edit"}
							>
								Sửa
							</Link>
							<div className='dropdown-divider' />
							<button
								onClick={this.handleCheck}
								className='dropdown-item trash'
								data-toggle='modal'
								data-target='#delete'
								data-toggle-class='fade-down'
								data-toggle-class-target='.animate'
							>
								Xóa
							</button>
						</div>
					</div>
				</td> */}
				<td className="text-right">
					<div className='item-action'>
						<Link
							data-toggle='tooltip'
							title='Chỉnh sửa'
							className='mr-14'
							to={"/testing/" + this.props.obj._id + "/edit"}
						>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleCheck}
								data-toggle='modal'
								data-target='#delete-testing'
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

class Testing extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			page: 1,
			activePage: 1,
			limit: 20,
			checkAll: false,
			keyword: "",
			exam_code: "",
			student_code: "",
			student_name: "",
			classroom: "",
			subject_id: "",
			classroom_id: "",
			status: "DONE",
			sorting_point: "1",
			csvData: "",
			dataTesting: [],
			excelOption: "",
			ids: [],
			sort_key: "",
			sort_value: ""
		};
	}

	fetchRows() {
		if (this.props.testings instanceof Array) {
			return this.props.testings.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDelete={this.props.addDelete}
						listTesting={this.props.listTesting}
						getData={this.getData}
						check={this.props.check}
						success={this.props.success}
						updatePoint={this.props.updatePoint}
						handleCheckedIds={this.handleCheckedIds}
						addDataRemoveTesting={this.props.addDataRemoveTesting}
						onDeleteOne={this.onDeleteOne}
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


	onChange = async (e) => {
		e.preventDefault();

		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		// await this.props.listTesting(this.getData());
		if (this.state.subject_id) {
			const params = {
				limit: 999,
				is_delete: false,
				subject_id: this.state.subject_id,
			};
			await this.props.listClassroom(params);
		}

		let { keyword, subject_id, classroom_id, sorting_point } = this.state;

		this.props.history.push(`/testing?keyword=${keyword}&subject_id=${subject_id}&classroom_id=${classroom_id}&sorting_point=${sorting_point}`);

		// this.props.listOrder(this.getData());
		await this.getData(1);
	};

	handleClear = async (e) => {
		await this.setState({
			keyword: "",
			exam_code: "",
			student_code: "",
			student_name: "",
			classroom: "",
			subject_id: "",
			classroom_id: "",
			status: "",
		});
		await this.props.listTesting(this.getData());
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

	fetchRowsClassroom() {
		if (this.props.classrooms.length > 0) {
			return this.props.classrooms.map((obj, i) => {
				if (obj.subject && obj.subject.id) {
					if (this.state.subject_id === obj.subject.id) {
						return (
							<option value={obj._id} key={obj._id.toString()}>
								{obj.name}
							</option>
						);
					}
				}
			});
		}
	}

	getData = async (pageNumber = 1) => {
		// const data = {
		// 	page: pageNumber,
		// 	limit: this.state.limit,
		// };
		// if (this.state.keyword !== "") {
		// 	data["keyword"] = this.state.keyword;
		// }

		// if (this.state.subject_id !== "") {
		// 	data["subject_id"] = this.state.subject_id;
		// }

		// if (this.state.classroom_id !== "") {
		// 	data["classroom_id"] = this.state.classroom_id;
		// }

		// if (this.state.status !== "") {
		// 	data["status"] = this.state.status;
		// }

		// if (this.state.sorting_point !== "") {
		// 	data["sorting_point"] = parseInt(this.state.sorting_point);
		// }

		// return data;

		const params = {
			keyword: this.state.keyword,
			status: this.state.status,
			limit: this.state.limit,
			subject_id: this.state.subject_id,
			classroom_id: this.state.classroom_id,
			sorting_point: this.state.sorting_point,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
		};

		params.page = this.state.page || pageNumber;


		await this.props.listTesting(params);
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.testings.length !== this.props.testings.length) {
			const _csvData = [];
			for (let i = 0; i < nextProps.testings.length; i++) {
				const _testing = nextProps.testings[i];
				const _testingItem = {
					MaDe: _testing.exam.code,
					TenDe: _testing.exam.name,
					MaHS: "'" + _testing.user.code.toString(),
					TenHS: _testing.user.name,
					MonHoc: _testing.subject.name,
					LopHoc: _testing.classroom.name,
					Diem: _testing.point,
					NgayNop: _testing.created_at
				};
				_csvData.push(_testingItem);
			}
			this.setState({
				dataTesting: _csvData
			});
		}
	}

	handleChangeExcelOption = async e => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value
		});
		if (value === 'ALL') {
			await this.setState({
				limit: 5000
			});
		}
		await this.props.listTesting(this.getData(1));
		await this.props.listTesting(this.getData(1));
	};

	async componentDidMount() {

		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			status: params.status ? params.status : "",
			subject_id: params.subject_id ? params.subject_id : "",
			classroom_id: params.classroom_id ? params.classroom_id : "",
			sort_key: params.sort_key ? params.sort_key : "",
			sort_value: params.sort_value ? params.sort_value : "",
			sorting_point: params.sorting_point ? parseInt(params.sorting_point) : 1,
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
		})


		const payload = {
			limit: 999,
			is_delete: false,
		};
		// await this.props.listTesting(this.getData());
		await this.props.listSubject(payload);
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				checkAll: false,
			});
		}

		this.getData(this.state.activePage)
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listTesting(this.getData());
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.setState({
			page: pageNumber
		})
		await this.props.listTesting(this.getData(pageNumber));
	};

	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveTesting;
		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteTesting(data);
		this.props.listTesting(this.getData());

		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}

		await this.setState({
			ids: []
		})
	};

	handleSend = async () => {
		const data = {
			testing_ids: this.props.ids,
		};
		if (data.testing_ids.length !== 0) {
			await this.props.confirmTesting(data);
			await this.props.listTesting(this.getData());
		} else {
			notification.error({
				message: "Chưa chọn mục nào !",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listTesting(this.getData());
	};

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



	sort = async (event) => {
		const { classList } = event.target;

		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});



		let { keyword, subject_id, classroom_id, sorting_point, sort_key, sort_value } = this.state;

		this.props.history.push(`/testing?keyword=${keyword}&subject_id=${subject_id}&classroom_id=${classroom_id}&sorting_point=${sorting_point}&sort_key=${sort_key}&sort_value=${sort_value}`);

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
				{/* <div className='page-hero page-container' id='page-hero'>
					<div className='padding d-flex'>
						<div className='page-title'>
							<h2 className='text-md text-highlight'>
								Bài kiểm tra/Thi
							</h2>
							<small className='text-muted'>
								Quản lý danh sách bài thi học sinh đã làm.
							</small>
						</div>
						<div className='flex' />
					</div>
				</div> */}
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<h2 className='text-md text-highlight sss-page-title'>
							Bài kiểm tra/Thi
						</h2>
						<div className='toolbar'>
							<div className='input-group'>
								{/* {this.props.ids.length !== 0 ? (
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
								)} */}

								<select
									className='custom-select mr-2'
									value={this.state.subject_id}
									name='subject_id'
									onChange={this.onChange}
								>
									<option value=''>-- Chọn Môn --</option>
									{this.fetchRowsSubject()}
								</select>
								<select
									className='custom-select mr-2'
									value={this.state.classroom_id}
									name='classroom_id'
									onChange={this.onChange}
								>
									<option value=''>-- Chọn Lớp --</option>
									{this.fetchRowsClassroom()}
								</select>
								<form
									className='flex'
									onSubmit={this.onSubmit}
								>
									<div className='input-group'>
										<input
											type='text'
											className='form-control form-control-theme keyword-custom'
											placeholder='Bạn có thể tìm kiếm theo mã đề, học sinh, lớp và môn'
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
									value={this.state.sorting_point}
									name='sorting_point'
									onChange={this.onChange}
								>
									<option value=''>
										-- Sắp xếp theo điểm --
									</option>
									<option value='1'>Điểm tăng dần</option>
									<option value='-1'>
										Điểm giảm dần
									</option>
								</select>
								<select
									className="custom-select w-96"
									name="excelOption"
									value={this.state.excelOption}
									onChange={this.handleChangeExcelOption}
								>
									<option value="">Tùy chọn tải</option>
									<option value="ONEPAGE">Trên trang</option>
									<option value="ALL">Tất cả</option>
								</select>

								{(this.state.excelOption === 'ONEPAGE' || this.state.excelOption === 'ALL') ? <CSVLink filename={'DiemHS.csv'} className="btn" data={this.state.dataTesting}>Xuất Excel</CSVLink> : null}

							</div>
						</div>

						<div className='row'>
							<div className='col-sm-12'>
								<table className='table table-theme table-row v-middle'>
									<thead className='text-muted'>
										<tr>
											<th width='10px'>
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
														data-target="#delete-testing"
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
												name="code"
												content="Mã đề"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<HeadingSortColumn
												name="name"
												content="Tên đề"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<th>Mã HS</th>
											<th>Tên HS</th>
											<HeadingSortColumn
												name="classroom.id"
												content="Lớp"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<HeadingSortColumn
												name="subject.id"
												content="Môn học"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<HeadingSortColumn
												name="point"
												content="Điểm"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<HeadingSortColumn
												name="created_at"
												content="Giờ nộp"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
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
									value={this.state.limit}
									onChange={this.handleChange}
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
									{displayFrom ? displayFrom : 0}
								</b> đến <b>{displayTo ? displayTo : 0}</b>{" "}
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
							id='delete-testing'
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

						<div
							id='send-testing'
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
												Bạn chắc chắn muốn gửi điểm?
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
											onClick={this.handleSend}
											className='btn btn-danger'
											data-dismiss='modal'
										>
											gửi
										</button>
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
		testings: state.testing.testings,
		limit: state.testing.limit,
		page: state.testing.page,
		total: state.testing.total,
		ids: state.testing.ids,
		check: state.testing.checkAll,
		subjects: state.subject.subjects,
		classrooms: state.classroom.classrooms,
		success: state.testing.success,
		dataRemoveTesting: state.testing.dataRemoveTesting
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listTesting,
			listClassroom,
			listSubject,
			deleteTesting,
			addDelete,
			checkAll,
			confirmTesting,
			updatePoint,
			addDataRemoveTesting
		},
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Testing)
);
