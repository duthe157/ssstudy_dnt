import React, { Component } from "react";
import Moment from "moment";
import Pagination from "react-js-pagination";
import {
	listClassroom,
	checkInputItem,
	deleteClassroom,
	checkAll,
	listMember,
	removeMember,
	addDataRemoveMember,
	showClassroom,
	updateLesson,
	setVideoWatchTime
} from "../../redux/classroom/action";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";
import ModalAddMember from "./ModalAddMember";
import ModalListComment from "./ModalListComment";
import { notification } from "antd";

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			sobuoihoc: null,
			buoidahoc: null,
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
		this.props.checkInputItem(this.props.obj._id, "remove");
		this.props.addDataRemoveMember({
			student_id: this.props.obj._id,
			classroom_id: this.props.classroom_id,
		});
	};

	handleChange = async (e) => {
		let name = e.target.name;
		let value = e.target.value;
		await this.setState({
			[name]: value
		});
		const data = {
			student_id: this.props.obj._id,
			classroom_id: this.props.classroom_id,
			sobuoihoc: this.state.sobuoihoc,
			buoidahoc: this.state.buoidahoc,
		}
		await this.props.updateLesson(data);
	}
	async componentDidMount() {
		this.setState({
			sobuoihoc: this.props.obj.sobuoihoc,
			buoidahoc: this.props.obj.buoidahoc,
		})
	}
	checkComment = (e) => {
		this.props.ModalListComment(this.props.obj._id);
	}

	handleCheckBox = (e) => {
		if (e.target.checked) {
			this.props.handleCheckedIds(this.props.obj._id, "add");
			this.setState({
				check: e.target.checked
			})
		} else {
			this.props.handleCheckedIds(this.props.obj._id, "remove");
			this.setState({
				check: e.target.checked
			})
		}
	}

	handleEditVideoWatchTime = async (e) => {
		this.props.handleUserInfo(this.props.obj);
	}

	getStudentStatus = (_student) => {
		let currentTime = new Date();
		let status = '';

		if (_student.last_card_updated_at) {

			let timeLastCart = new Date(_student.last_card_updated_at);

			let miliSeconds = currentTime.getTime() - timeLastCart.getTime();

			let _days = Math.floor(miliSeconds / (24 * 60 * 60 * 1000));

			if (_days > 0 && _days <= 10) {
				status = 'Sắp hết thẻ';
			} else if (_days > 30) {
				status = 'Đã nghỉ học';
			} else {
				status = '';
			}

		} else if (_student.joined_at) {
			let timeJoinedAt = new Date(_student.joined_at);

			let miliSeconds = currentTime.getTime() - timeJoinedAt.getTime();

			let _days = Math.floor(miliSeconds / (24 * 60 * 60 * 1000));


			if (_days > 0 && _days <= 10) {
				status = 'Sắp hết thẻ';
			} else if (_days > 30) {
				status = 'Đã nghỉ học';
			} else {
				status = '';
			}

		} else {
			status = '';
		}

		return status;
	}

	render() {
		return (
			<tr className='v-middle' data-id={17}>
				<td>
					<label className='ui-check m-0'>
						<input
							type='checkbox'
							className="checkInputItem"
							name='checkItem'
							value={this.props.obj._id}
							onChange={this.handleCheckBox}
						/>{" "}
						<i />
					</label>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm'>
						{!isUndefined(this.props.obj.code) &&
							this.props.obj.code}
					</span>
				</td>
				<td className='flex'>
					{this.props.obj.fullname !== null
						? `${this.props.obj.fullname}`
						: ""}
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm text-center'>
						{this.props.obj.phone}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm text-center'>
						{this.props.obj.parent_phone}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm text-center'>
						{this.props.obj.total_testing}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm text-center'>
						<form onSubmit={this.handleSubmit} className="m-auto" style={{ width: "80px" }}>
							<input
								type='number'
								name='sobuoihoc'
								className='form-control'
								style={{ maxWidth: 80 }}
								onChange={this.handleChange}
								value={this.state.sobuoihoc ? this.state.sobuoihoc : 0}
							/>
						</form>
					</span>

				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm text-center'>
						<form onSubmit={this.handleSubmit} className="m-auto" style={{ width: "80px" }}>
							<input
								type='number'
								name='buoidahoc'
								className='form-control'
								style={{ maxWidth: 80 }}
								onChange={this.handleChange}
								value={this.state.buoidahoc ? this.state.buoidahoc : 0}
							/>
						</form>
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-center' style={{ color: 'red', fontWeight: 700 }}>
						{this.state.sobuoihoc - this.state.buoidahoc}
					</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm text-center'>{this.props.obj.pay_type || ''}</span>
				</td>
				<td>
					<span>{this.getStudentStatus(this.props.obj)}</span>
				</td>
				<td>
					<span className='item-amount d-none d-sm-block text-sm text-center'>
						{this.props.obj.joined_at &&
							Moment(this.props.obj.joined_at).format(
								"DD/MM/YYYY HH:mm:ss"
							)}
					</span>
				</td>
				<td>
					<button
						className='btn btn-sm text-white btn-primary'
						data-toggle='modal'
						data-target='#list-comment'
						data-toggle-class='fade-down'
						data-toggle-class-target='.animate'
						title='Trash'
						id='btn-trash'
						onClick={this.checkComment}
					>
						Nhận xét
					</button>
				</td>

				<td>
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
							<button
								onClick={this.handleEditVideoWatchTime}
								className='dropdown-item trash'
								data-toggle='modal'
								data-target='#modal-watch-video'
								data-toggle-class='fade-down'
								data-toggle-class-target='.animate'
							>
								Thiết lập thời gian xem video bài giảng
							</button>
							<div className='dropdown-divider' />
							<button
								onClick={this.handleCheck}
								className='dropdown-item trash'
								data-toggle='modal'
								data-target='#delete-student'
								data-toggle-class='fade-down'
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

class ClassroomMember extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: "",
			ids: [],
			checkAll: false,
			code: "",
			name: "",
			subject: "",
			teacher: "",
			room: "",
			user_id: "",
			lesson_view_dates: [],
			// start_time: "",
			// end_time: "",
		};
	}

	// Check tung Item trong danh sach
	handleCheckedIds = async (id, type = '') => {
		const _ids = this.state.ids;
		if (type === 'add') {
			if (_ids.indexOf(id) < 0)
				_ids.push(id);
		}
		if (type === 'remove') {
			const index = _ids.indexOf(id);
			if (index > -1) {
				_ids.splice(index, 1);
			}
		}
		this.setState({ ids: _ids });
	}

	// Check All Item trong danh sach
	handleCheckAll = async (e) => {
		var inputs = document.querySelectorAll('.checkInputItem');
		let flag = false;

		if (e.target.checked) {
			flag = true;
		}

		let _ids = [];
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
		})
	}

	resetCheckInputItem = (e) => {
		for (let i = 0; i < this.props.ids.length; i++) {
			this.props.checkInputItem(this.props.ids[i], "remove");
		}
		var inputs = document.querySelectorAll('.checkInputItem');
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].checked = false;
		}
		document.getElementById('checkAll').checked = false;
	}

	fetchRows() {
		if (this.props.classroomMember instanceof Array) {
			return this.props.classroomMember.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						check={this.props.check}
						handleUserInfo={this.handleUserInfo}
						handleCheckedIds={this.handleCheckedIds}
						checkInputItem={this.props.checkInputItem}
						updateLesson={this.props.updateLesson}
						addDataRemoveMember={this.props.addDataRemoveMember}
						classroom_id={this.props.classroom._id}
						ModalListComment={this.callBackComment}
					/>
				);
			});
		}
	}
	listTimeWatchVideo() {
		if (this.state.lesson_view_dates instanceof Array) {
			return this.state.lesson_view_dates.map((time, index) => {
				return <span key={index}>
					{time.from} đến {time.to}
					<button type="button" style={{ marginLeft: "5px" }} onClick={() => this.removeWatchTimeVideo(index)} >x</button>
				</span>;
			})
		}
	}


	callBackComment = (id) => {
		this.setState({
			user_id: id,
		})
	}
	onChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	getData = (pageNumber = 1) => {
		const data = {
			id: this.props.match.params.id,
			page: pageNumber,
			limit: this.state.limit,
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.showClassroom(this.props.match.params.id);
		if (this.props.classroom) {
			var { code, name, subject, teacher, room } = this.props.classroom;
			this.setState({
				code,
				name,
				subject,
				teacher,
				room,
			});
		}
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				ids: this.props.ids,
				checkAll: false,
			});
		}

		await this.props.listMember(this.getData());
	}

	exportExcel = async() => {
		await this.props.listMember({
			id: this.props.match.params.id,
			page: 1,
			limit: this.state.limit,
			is_export: true
		});
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listMember(this.getData());
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.props.listMember(this.getData(pageNumber));
	};

	handleDelete = async () => {
		const data = this.props.dataRemoveMember;
		await this.props.removeMember(data);
		await this.props.listMember(this.getData());
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listMember(this.getData());
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}
	}

	removeWatchTimeVideo = (index) => {
		if (index >= 0) {
			var { lesson_view_dates } = this.state;
			if (lesson_view_dates instanceof Array) {
				lesson_view_dates.splice(index, 1);
				this.setState({
					lesson_view_dates: lesson_view_dates
				})
			}
		}
	}

	onSaveTimeWatchVideo = async (e) => {
		var { lesson_view_dates } = this.state;
		var start_time = document.getElementById('start_time').value;
		var end_time = document.getElementById('end_time').value;

		if (!start_time || !end_time) {
			/*notification.warning({
				message: "Vui lòng nhập vào thời gian thiết lập xem video bài giảng",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
			return;*/
		}

		var time = {
			from: start_time,
			to: end_time
		};

		await lesson_view_dates.push(time);
		if (lesson_view_dates instanceof Array) {
			await this.setState({
				lesson_view_dates: lesson_view_dates,
			})
		}

		document.getElementById('start_time').value = "";
		document.getElementById('end_time').value = "";
	}

	handleSetVideoWatchTime = async (e) => {
		e.preventDefault();
		var { lesson_view_dates, ids } = this.state;
		var classroom_id = this.props.match.params.id;
		if (lesson_view_dates.length === 0 || ids.length === 0) {
			/*notification.warning({
				message: "Vui lòng nhập vào thời gian thiết lập xem video bài giảng",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
			return;*/
		}

		await this.props.setVideoWatchTime({
			ids,
			lesson_view_dates: JSON.stringify(lesson_view_dates),
			classroom_id
		});
		if (ids.length > 1)
			await this.props.listMember(this.getData());
	}

	handleUserInfo = (userInfo) => {
		if (userInfo)
			this.setState({
				ids: [userInfo._id]
			})

		if (userInfo.lesson_view_dates)
			this.setState({
				lesson_view_dates: JSON.parse(userInfo.lesson_view_dates)
			})
	}

	onResetVideoWatching = async () => {
		this.setState({
			lesson_view_dates: []
		});
		this.resetCheckInputItem();
		await this.props.listMember(this.getData());
	}

	render() {
		return (
			<div className='page-content page-container' id='page-content'>
				<div className='padding'>
					<h2 className='text-md text-highlight sss-page-title'>
						{`Thành viên Lớp:  ${this.state.name} - ${this.state.code}`}
					</h2>
					<div>
						<div className='toolbar'>
							<form className='flex' onSubmit={this.onSubmit}>
								<div className='input-group'>
									<input
										type='text'
										className='form-control form-control-theme keyword-custom'
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
							<div className="classroom-user-actions">
								{this.state.ids.length > 0 ?
									<button style={{ marginRight: 12 }}
										// onClick={this.onResetValueWatchTime}
										className='btn btn-sm mr-15 text-white btn-primary'
										data-toggle='modal'
										data-target='#modal-watch-video'
										data-toggle-class='fade-down'
										data-toggle-class-target='.animate'
										title='Thiết lập thời gian xem video bài giảng'
										id='btn-onResetValueWatchTime'>
										Thiết lập thời gian xem video bài giảng
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
											className='feather feather-file-plus mx-2'
										>
											<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
											<polyline points='14 2 14 8 20 8' />
											<line x1={12} y1={18} x2={12} y2={12} />
											<line x1={9} y1={15} x2={15} y2={15} />
										</svg>
									</button> : null}
								<button
									className='btn btn-sm text-white btn-primary'
									data-toggle='modal'
									data-target='#add-class'
									data-toggle-class='fade-down'
									data-toggle-class-target='.animate'
									title='Trash'
									id='btn-trash'
								>
									Thêm thành viên
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
										className='feather feather-file-plus mx-2'
									>
										<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
										<polyline points='14 2 14 8 20 8' />
										<line x1={12} y1={18} x2={12} y2={12} />
										<line x1={9} y1={15} x2={15} y2={15} />
									</svg>
								</button>

								<button className='btn btn-sm text-white btn-primary' onClick={this.exportExcel} type="button" style={{ marginLeft: 30 }}>
									Xuất Excel
								</button>
							</div>
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
													key='classroom'
													type='checkbox'
													name='checkAll'
													id="checkAll"
													onChange={
														this.handleCheckAll
													}
												/>{" "}
												<i />
											</label>
										</th>
										<th>Mã học sinh</th>
										<th>Họ và tên</th>
										<th className='text-center'>
											SĐT
										</th>
										<th className='text-center'>
											SĐT Phụ Huynh
										</th>
										<th className='text-center'>
											Tổng bài thi
										</th>
										<th className='text-center'>
											Tổng số buổi
										</th>
										<th className='text-center'>
											Số buổi đã học
										</th>
										<th className='text-center'>
											<b>Số buổi còn lại</b>
										</th>
										<th className='text-center'>
											<b>Nộp theo</b>
										</th>
										<th className="text-left">
											Trạng thái
										</th>
										<th className='text-center'>
											Thời gian tham gia
										</th>
										<th width='100px' />
										<th width='50px' />
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
							Tổng số{" "}
							<b>{this.props.total}</b>
						</div>
						<div className="col-sm-5">
							<Pagination
								activePage={this.props.page}
								itemsCountPerPage={this.props.limit}
								totalItemsCount={this.props.total}
								pageRangeDisplayed={10}
								onChange={this.handleChangePage}
							/>
						</div>
					</div>

					<div
						id='delete-student'
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
											Bạn chắc chắn muốn xóa thành
											viên này khỏi lớp chứ?
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
						id='add-class'
						className='modal fade'
						data-backdrop='true'
						style={{ display: "none", minWidth: "1000px" }}
						aria-hidden='true'
					>
						<ModalAddMember
							classroom_id={this.props.match.params.id}
						/>
					</div>

					<div
						id='list-comment'
						className='modal fade'
					>
						<ModalListComment
							id={this.state.user_id}
						/>
					</div>

					<div
						id='modal-watch-video'
						className='modal fade'
						data-backdrop='true'
						style={{ display: "none", minWidth: "1000px" }}
						aria-hidden='true'
					>

						<div
							className='modal-dialog animate fade-down modal-lg'
							data-class='fade-down'
						>
							<div className='modal-content'>
								<div className='modal-header'>
									<div className='modal-title text-md'>
										Thiết lập thời gian xem video bài giảng
									</div>
									<button className='close' data-dismiss='modal' onClick={this.onResetVideoWatching}>
										×
									</button>
								</div>
								<div className="modal-body modal-body-fix">
									<span className="subtitle">
										Thiết lập xem video bài giảng theo thời gian<br />
										(Chọn khoảng thời gian xem thiết lập xem video bài giảng)
									</span>

									<form className="formSetVideoWatchTime" onSubmit={this.handleSetVideoWatchTime}>
										<div className="form-group">
											<label>Bắt đầu</label>
											<input
												type="date"
												className="form-control"
												id="start_time"
												name="start_time" />
										</div>
										<div className="form-group">
											<label>Kết thúc</label>
											<input
												type="date"
												className="form-control"
												id="end_time"
												name="end_time" />
										</div>
										<button
											type="button"
											className="btn btn-secondary"
											onClick={this.onSaveTimeWatchVideo}
											style={{ outline: "none" }}
										>
											+
										</button>
										<div id="show-time-setting">{this.listTimeWatchVideo()}</div>
										<span className="input-group-btn">
											<button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>Cập nhật</button>
										</span>
									</form>
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
		classrooms: state.classroom.classrooms,
		classroom: state.classroom.classroom,
		limit: state.classroom.limit,
		page: state.classroom.page,
		total: state.classroom.total,
		classroomMember: state.classroom.classroomMember,
		ids: state.classroom.ids,
		check: state.classroom.checkAll,
		dataRemoveMember: state.classroom.dataRemoveMember,
		viewMonths: state.classroom.viewMonths,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listClassroom,
			deleteClassroom,
			checkInputItem,
			checkAll,
			listMember,
			removeMember,
			showClassroom,
			addDataRemoveMember,
			updateLesson,
			setVideoWatchTime
		},
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ClassroomMember)
);
