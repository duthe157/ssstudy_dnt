import React, { Component, useState } from 'react';
import { listSubject } from "../../redux/subject/action";
import { listAdmin } from "../../redux/student/action";
import { listClassroom } from "../../redux/classroom/action";
import { Link } from 'react-router-dom';

import { createIframeAction, listIframe, detailIframe, updateIframeAction} from "../../redux/iframe/action";
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LoginIframe from './LoginIframe';
import { notification } from "antd";
import HeadingSortColumn from "../HeadingSortColumn";
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

	async componentDidMount() {

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
						{/* <Link
							className="mr-14"
							data-toggle='tooltip'
							title='Chỉnh sửa'
							to={'/iframe/' + this.props.obj._id + '/edit'}>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a>
								<img src="/assets/img/icon-delete.svg" alt="" />
							</a>
						</div> */}
					</div>
				</td>
			</tr>
		);
	}
}


class CreateIframe extends Component {
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
			sort_key: "update_at",
			sort_value: 1,

			showPhone: false,
			formWidth: 500,
			formHeight: 421,

			classLevel: null,
			classSubjectId: null,
			classTeacherId: null,
			className: null,
			classSelected: null,

			btnContent: "Đăng ký",
			action:'create'
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
						getData={this.getData}
						check={this.props.check}
					/>
				);
			});
		}
	}

	getDataClassList = async () => {
		const params = {
			name: this.state.className,
			level: this.state.classLevel,
			subject_id: this.state.classSubjectId,
			teacher_id: this.state.classTeacherId,
			is_online: true
		};
		await this.props.listClassroom(params);
	};

	getData = async (pageNumber = 1) => {
		const params = {
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
			limit: this.state.limit,
			page: this.state.page || pageNumber
		};
		await this.props.listIframe(params);
	};

	async init(){
		const url = window.location.href;
		const id = url.split('/').pop();
		var action = 'create'
		console.log('id', id);
		if (id && id !== 'iframe-create') {
			action = 'edit'
			await this.props.detailIframe(id);
			// this.state.btnContent = this.props.dataEdit.btn_content
			// this.state.formWidth = this.props.dataEdit.with
			// this.state.formHeight = this.props.dataEdit.height
			// this.state.EditId = id
			// this.state.action = action
			this.setState({
				btnContent: this.props.dataEdit.btn_content,
				formWidth: this.props.dataEdit.with,
				formHeight: this.props.dataEdit.height,
				EditId: id,
				action: action
			})
			console.log('this.stage.action', this.state.action)
		}

		const data = {
			limit: 999,
			is_delete: false,
		};
		const dataListAdmin = {
			user_group: "TEACHER",
			limit: 100,
		};
		this.getData(this.state.activePage);
		let requestState = {
			checkAll: false,
			classroom: [],
		}
		if (this.props.limit) {
			requestState.limit = this.props.limit
		}
		this.setState(requestState)
		await Promise.all([this.props.listSubject(data),this.props.listAdmin(dataListAdmin), this.getData(this.state.activePage)])
	}

	async componentDidMount() {
		setLoader(true)
		await this.init()
		setLoader(false)
	}

	onSubmitGetClassRoom = async (e) => {
		e.preventDefault();
		setLoader(true)
		await this.getDataClassList();
		setLoader(false)
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

	onChangeActiveIcon(nameState, value) {
		this.setState({
			[nameState]: !value
		})
	}

	onChange = (e) => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}

	onActionUpdate = async () => {
		setLoader(true)
		// const  baseUrl = process.env.REACH_APP_BASE_URL + '/loginIframe'
		// const  baseUrl = `https://admincms.luyenthitiendat.vn/loginIframe`
		const  baseUrl = `https://admincms.luyenthitiendat.vn/loginIframe?id=OBJECTID`
		const strIframe = `<iframe src="${baseUrl}" frameBorder="0" style="height:${this.state.formHeight}px; width:${this.state.formWidth}px;"></iframe>`;
		let requestBody = {
			id: this.state.EditId,
			btn_content: this.state.btnContent,
			width: this.state.formWidth,
			height: this.state.formHeight,
			is_show_phone: this.state.showPhone,
			is_show_school: false,
			classroom_id: this.state.classSelected === null ? null : this.state.classSelected._id,
			iframe: strIframe
		}
		let validate = await this.validateCreate(requestBody)

		if (validate === true) {await this.props.updateIframeAction(requestBody);
			await this.getData(1);
		}
		setLoader(false)
	}
	onActionCreate = async () => {
		setLoader(true)
		// const  baseUrl = process.env.REACH_APP_BASE_URL + '/loginIframe'
		// const  baseUrl = `https://admincms.luyenthitiendat.vn/loginIframe`
		const  baseUrl = `https://admincms.luyenthitiendat.vn/loginIframe?id=OBJECTID`
		// let strIframe =  `<iframe src="${baseUrl}" frameBorder="0" style="height:${this.state.formHeight}px; width:${this.state.formWidth}px;"></iframe>`
		const strIframe = `<iframe src="${baseUrl}" frameBorder="0" style="height:${this.state.formHeight}px; width:${this.state.formWidth}px;"></iframe>`;
		// strIframe =strIframe.replace(/blue/g, "")
		let requestBody = {
			btn_content: this.state.btnContent,
			width: this.state.formWidth,
			height: this.state.formHeight,
			is_show_phone: this.state.showPhone,
			is_show_school: false,
			classroom_id: this.state.classSelected === null ? null : this.state.classSelected._id,
			iframe: strIframe
		}
		let validate = await this.validateCreate(requestBody)

		if (validate === true) {
			// create API
			await this.props.createIframeAction(requestBody);
			await this.getData(1);
			// notification.success({
			// 	message: "Tạo thành công iframe",
			// 	placement: "topRight",
			// 	top: 50,
			// 	duration: 3
			// });
		}
		setLoader(false)
	}

	validateCreate = (data) => {
		var validate = true
		var messageError = ''

		if (data.classroom_id === undefined || data.classroom_id === '' || data.classroom_id === null) {
			validate = false
			messageError = "Bạn chưa chọn khóa học nào !"
		}

		if (data.btn_content === undefined || data.btn_content === '' || data.btn_content === null) {
			validate = false
			messageError = "Bạn chưa điền nội dung đăng ký"
		}

		if (data.width === undefined || data.width === '' || data.width === null || data.width === 0) {
			validate = false
			messageError = "Bạn chưa điền chiều rộng"
		}

		if (data.height === undefined || data.height === '' || data.height === null || data.height === 0) {
			validate = false
			messageError = "Bạn chưa điền chiều cao"
		}

		if(validate === false ) {
			notification.error({
				message: messageError,
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
		return validate
	}

	handleClassroomSelect = (classroom) => {
        // Method 3: Simple state update
        this.setState({ classSelected: classroom });
    };

	render() {
		const { action } = this.state;

		let displayFrom =
			this.props.page === 1
				? 1
				: (parseInt(this.props.page) - 1) * this.props.limit;
		let displayTo =
			this.props.page === 1
				? this.props.limit
				: displayFrom + this.props.limit;
		displayTo = displayTo > this.props.total ? this.props.total : displayTo;

		const containerStyle = {
			overflow: 'hidden',
			overflowX: 'auto',
			whiteSpace: 'nowrap',
			marginBottom: '20px'
		};

		const itemStyle = {
			display: 'inline-block',
			width: '450px',
			height: '150px',
			marginRight: '15px',
			backgroundColor: '#f5f5f5',
			border: '1px solid #ddd',
			borderRadius: '4px',
			// textAlign: 'center',
			lineHeight: '150px',
			verticalAlign: 'middle',
			
		};

		const imageStyle = {
			objectFit: 'cover',
			width: '180px',
			height: 'auto',
			marginLeft: '30px',
			borderRadius: '5px',
		}

		const styleCheckBox = {
			top: '10px',
    		position: 'absolute',
    		right: '8px',
		}

		let classroom = this.props.classroom ? this.props.classroom : [];
		var {showPhone, formWidth, formHeight, btnContent} = this.state

		const iframeItem = {
			btn_content: btnContent
		}
		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className='text-md text-highlight sss-page-title'>
							Tạo mã form
						</h2>
						<div className="block-table-book">
							<div className="toolbar">
								<form className="flex block-filter-book" onSubmit={this.onSubmitGetClassRoom}>
									<div className="input-group">
										<span className="title-block mb-0 mr-16 semi-bold align-self-center">Lựa chọn khóa học</span>
										<input
											type="text"
											className="form-control form-control-theme keyword-custom"
											placeholder="Tên khóa học"
											onChange={this.onChange}
											value={this.state.className}
											name="className"
										/>
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
												value={this.state.classSubjectId}
												name="classSubjectId"
												onChange={this.onChange}
											>
												<option value="">Môn học</option>
												{this.fetchSubjectRows()}
											</select>
										</div>

										<div className='ml-16'>
											<select
												className="custom-select"
												value={this.state.classLevel}
												name="classLevel"
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
												value={this.state.classTeacherId}
												name="classTeacherId"
												onChange={this.onChange}
											>
												<option value="">Giáo viên</option>
												{this.fetchTeacherRows()}
											</select>
										</div>
										<div className='btn-filter ml-16'>
											<button type='sumbit'>
												<img src='/assets/img/icon-filter.svg' className='mr-10' alt=''/>
												<span>Lọc kết quả</span>
											</button>
										</div>

									</div>
								</form>
							</div>

							<div className="toolbar">
								<div className="col-sm-12">
									<div style={containerStyle}>
										{classroom.map((item, index) => (
											<div
												key={index}
												className="list-item"
												style={itemStyle}
											>
												<div className='row'>
													<div className='col-xs-5'>
														<img style={imageStyle} src={item.image} alt=""/>
													</div>
													<div className='col-xs-7'>
														<span className="input-group-addon">
        													<input
																name="classSelected"
																onClick={() => this.handleClassroomSelect(item)}
															 id={item._id} type="radio" aria-label="..." style={styleCheckBox}/>
      													</span>
														<label>{item.name}</label>
													</div>
												</div>
											</div>
										))}

										{
											classroom.length === 0 ? "Không có khóa học nào" : ""
										}
									</div>
								</div>
							</div>

							<div className='toolbar'>
								<div className='col-sm-12'>
									<span className="title-block mb-0 mr-16 semi-bold align-self-center">Tùy chỉnh</span>
									<br/>
									<div className='row'>
										<div className="col-4">
											<div className='row'>
												<div className=' text-center col-3'>
													<div className="col-12">
														<img src='/assets/img/icon-member.svg' alt='Tên' id='name'/>
													</div>
													<div className='col-12'><span htmlFor="name">Tên</span></div>
												</div>

												<div className=' text-center col-3'>
													<div className="col-12">
														<img src='/assets/img/icon-email.svg' alt='Tên' id='name'/>
													</div>
													<div className='col-12'><span htmlFor="name">Email</span></div>
												</div>

												<div className=' text-center col-3'  onClick={() => this.onChangeActiveIcon('showPhone', showPhone)}>
													<div className="col-12">
														<img src={showPhone ? '/assets/img/icon-phone.svg' : '/assets/img/icon-phone-disable.svg'} alt='Tên' id='name'/>
													</div>
													<div className='col-12'><span htmlFor="name" className='text-nowrap'>Điện thoại</span></div>
												</div>

												<div className=' text-center col-3'>
													<div className="col-12">
														<img src='/assets/img/icon-building.svg' alt='Tên' id='name'/>
													</div>
													<div className='col-12'><span htmlFor="name">Trường</span></div>
												</div>
											</div>
											{/* <div className='row'>
												<div className="col-3">Email</div>
												<div className="col-3">Điện thoại</div>
												<div className="col-3">Trường</div>
											</div> */}
{/* 
											<div className='row'>
												<div className="col-3"><img src='/assets/img/icon-member.svg' className='mr-10' alt=''/></div>
												<div className="col-3"><img src='/assets/img/icon-member.svg' className='mr-10' alt=''/></div>
												<div className="col-3"><img src='/assets/img/icon-member.svg' className='mr-10' alt=''/></div>
												<div className="col-3"><img src='/assets/img/icon-member.svg' className='mr-10' alt=''/></div>
											</div>
											<div className='row'>
												<div className="col-3">Ngày sinh</div>
												<div className="col-3">Lớp</div>
												<div className="col-3">Địa chỉ</div>
												<div className="col-3">Yêu cầu</div>
											</div> */}
											<br/>

											<div className='row'>
												<div className="form-group w-100">
  													<label htmlFor="comment">Nội dung nút đăng ký</label>
													  <textarea
													  	style={{
															width:'100%'
														}}
														type="text"
														className="form-control"
														name="btnContent"
														value={this.state.btnContent}
														onChange={this.onChange}
													>
													</textarea>
												</div>
											</div>

											<div className='row'>
												<div className='col-6'>
													<label htmlFor="formWidth">Chiều rộng form</label>
													<div className="input-group">
  														<input 
														onChange={this.onChange} 
														type="number" 
														className="form-control" 
														id="formWidth" 
														name='formWidth' 
														value={formWidth}/>
													</div>
												</div>
												<div className='col-6'>
													<label htmlFor="formHeight">Chiều cao form</label>
													<div className="input-group">
  														<input 
														onChange={this.onChange} 
														type="number" 
														className="form-control" 
														id="formHeight" 
														name='formHeight' 
														value={formHeight}/>
													</div>
												</div>
											</div>

											<div className='row mt-5'>
												<button onClick={action === 'create' ? this.onActionCreate : this.onActionUpdate} type="button" className="btn btn-primary btn-block mb-2">
													{action === 'create' ? 'Tạo form' : 'Cập nhật'}
												</button>
											</div>
										</div>
										<div className="col-8">
											<div style={{
												width: `${formWidth}px`, 
												height: `${formHeight}px`,
												border: '1px solid #ccc',
												overflow: 'hidden'
											}}>
												<LoginIframe
												iframeItemProp={iframeItem}
												></LoginIframe>
											</div>
										</div>
									</div>
								</div>

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
													<i/>
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
															<polyline points="3 6 5 6 21 6"/>
															<path
																d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
												name="subject.id"
												content="Tên Khóa học"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<HeadingSortColumn
												name="Môn h"
												content="Môn học"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<HeadingSortColumn
												name="order"
												content="Mã khóa học"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<HeadingSortColumn
												name="order"
												content="Thời gian tạo"
												handleSort={this.sort}
												sort_key={this.state.sort_key}
												sort_value={this.state.sort_value}
											/>
											<HeadingSortColumn
												name="order"
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

							{/* <div className="row listing-footer">
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
							</div> */}

							{/* <div
								id="delete-video"
								className="modal fade"
								data-backdrop="true"
								style={{display: 'none'}}
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
							</div> */}
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
		students: state.student.students,
		classroom: state.classroom.classrooms,
		iframes: state.iframe ? state.iframe.iframes : [],
		dataEdit: state.iframe ? state.iframe.iframeItem : [],
		// class: {
		// 	listItem: state.
		// }
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{listIframe, createIframeAction, listClassroom, listSubject, listAdmin, detailIframe, updateIframeAction },
		dispatch,
	);
}

let ContainerEdit = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(CreateIframe),
);
export default ContainerEdit;
