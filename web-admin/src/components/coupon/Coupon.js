import React, { Component } from 'react';
import Moment from 'moment';
import { DatePicker } from "antd";
import Pagination from 'react-js-pagination';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { listCoupon, createCoupon, getDataCoupon, updateCoupon, addDataRemoveCoupon, deleteCoupon } from './../../redux/coupon/action';
import { isEmpty, filter } from "lodash";
import { listBook } from '../../redux/book/action';
import { listClassroom } from "../../redux/classroom/action";
import baseHelper from "../../helpers/BaseHelpers";

import HeadingSortColumn from "../HeadingSortColumn";

import produce from 'immer';
import { Radio, notification } from "antd";
import queryString from 'query-string';


class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
		};
	}


	componentDidMount() {
		this.setState({
			check: false,
			status: this.props.obj.status,
		});
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
	}

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

	handleCheck = async (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveCoupon({
			ids: this.props.obj._id
		})
	}

	handleGetCouponDetails = () => {
		this.props.getDataCoupon({
			id: this.props.obj._id
		})
	}

	render() {

		return (
			<tr className="v-middle table-row-item" data-id={17}>
				<td>
					<label className="ui-check m-0">
						<input
							type="checkbox"
							className="checkInputItem"
							name="checkItem"
							value={this.props.obj._id}
							onChange={this.handleCheckBox}
						/>{' '}
						<i />
					</label>
				</td>
				<td className="flex">
					<span className="item-amount d-none d-sm-block text-sm openModalCouuponByCode">
						<a
							className="coupon-code"
							data-toggle="modal"
							data-target="#modalCoupon"
							onClick={this.handleGetCouponDetails}
						>
							{this.props.obj.code}
						</a>
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.discount_type == 'FIXED' ? 'vnđ' : '%'}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.discount_method == 'ORDER' ? 'Đơn hàng' : 'Sản phẩm'}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.updated_at &&
							Moment(this.props.obj.updated_at).format(
								'DD/MM/YYYY HH:mm:ss',
							)}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.started_at && Moment(this.props.obj.started_at).format(
							'DD/MM/YYYY HH:mm:ss',
						)}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.finished_at && Moment(this.props.obj.finished_at).format(
							'DD/MM/YYYY HH:mm:ss',
						)}
					</span>
				</td>
				<td className="text-right">
					<div className="item-action">

						<div
							data-toggle='tooltip'
							title='Chỉnh sửa'
						>
							<a
								className="mr-14"
								data-toggle="modal"
								data-target="#modalCoupon"
								onClick={this.handleGetCouponDetails}
							>
								<img src="/assets/img/icon-edit.svg" alt="" />
							</a>
						</div>
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleCheck}
								className="trash"
								data-toggle="modal"
								data-target="#delete-coupon"
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

class Coupon extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: "",
			data: [],
			limit: 20,
			page: 1,
			ids: [],
			checkAll: false,
			from_date: '',
			to_date: '',
			activePage: 1,
			id: '',
			code: '',
			discount_type: 'FIXED',
			discount_value: '',
			discount_method: 'ORDER',
			discount_configs: null,
			min_requirements: 'NONE',
			started_at: '',
			finished_at: '',
			status: '',
			isShowDiscountToDate: false,
			products: [],
			isShowBlockApplyProduct: false,
			order_value: '',
			product_qty: '',
			isShowBlockOrderValue: false,
			isShowBlockProductQty: false,
			sort_key: "",
			sort_value: ""

		};
		this.wrapperRef = React.createRef()
	}

	async componentDidMount() {
		const url = this.props.location.search;
		let params = queryString.parse(url);
		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			from_date: params.from_date ? params.from_date : "",
			to_date: params.to_date ? params.to_date : "",
			sort_key: params.sort_key ? params.sort_key : null,
			sort_value: params.sort_value ? params.sort_value : null,
			limit: params.limit ? params.limit : 20,
			page: params.page ? params.page : 1,
		})

		const data = {
			limit: 999,
			page: 1,
			is_delete: false,
		};
		await this.props.listBook(data);
		await this.props.listClassroom(data);

		// if (this.props.limit) {
		// 	await this.setState({
		// 		limit: this.state.limit,
		// 		checkAll: false,
		// 		ids: this.props.ids
		// 	});
		// }
		this.getData(this.state.activePage);
	}

	fetchRows() {
		if (this.props.coupons instanceof Array) {
			return this.props.coupons.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						handleCheckedIds={this.handleCheckedIds}
						getDataCoupon={this.props.getDataCoupon}
						updatePost={this.props.updatePost}
						addDataRemoveCoupon={this.props.addDataRemoveCoupon}
						onDeleteOne={this.onDeleteOne}
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
		var _ids = this.state.ids;
		if (type === 'add') {
			if (_ids.indexOf(id) < 0) {
				_ids.push(id);
			}
		}
		if (type === 'remove') {
			var index = _ids.indexOf(id);
			if (index > -1) {
				_ids.splice(index, 1);
			}
		}

		this.setState({
			ids: _ids
		})
	}

	onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value
		})
	};

	getData = async (pageNumber = 1) => {
		const params = {
			keyword: this.state.keyword,
			from_date: this.state.from_date,
			to_date: this.state.to_date,
			limit: this.state.limit,
			sort_key: this.state.sort_key,
			sort_value: this.state.sort_value,
		};

		params.page = pageNumber;

		await this.props.listCoupon(params);
	};


	onSubmit = async (e) => {
		e.preventDefault();

		let { keyword, from_date, to_date, page, limit } = this.state;

		this.props.history.push(`/coupon?keyword=${keyword}}&page=${page}&limit=${limit}&from_date=${from_date}&to_date=${to_date}`);

		await this.getData(1);
	};

	handleChangePage = async pageNumber => {
		window.scrollTo({ top: 0, behavior: "smooth" });

		await this.setState({
			page: pageNumber
		});

		let { keyword, from_date, to_date, page, limit } = this.state;

		this.props.history.push(`/coupon?keyword=${keyword}}&page=${page}&limit=${limit}&from_date=${from_date}&to_date=${to_date}`);

		await this.getData(pageNumber);

	};

	handleDelete = async () => {
		let inputs = document.querySelectorAll('.checkInputItem');
		let data = this.props.dataRemoveCoupon;

		if (this.state.ids && this.state.ids.length > 0) {
			data = {
				ids: this.state.ids
			};
		}

		await this.props.deleteCoupon(data);
		this.getData();

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

		let { keyword, from_date, to_date, page, limit } = this.state;

		this.props.history.push(`/coupon?keyword=${keyword}}&page=${page}&limit=${limit}&from_date=${from_date}&to_date=${to_date}`);

		await this.getData(1);
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}

		if (this.props.coupon !== nextProps.coupon) {
			this.props.listCoupon(this.getData());
		}

		if (this.props.couponDetail !== nextProps.couponDetail) {
			const { code, discount_type, discount_value, discount_method, discount_configs, min_requirements, started_at, finished_at, status } = nextProps.couponDetail;

			const dataRequired = min_requirements !== 'NONE' ? JSON.parse(min_requirements) : min_requirements;
			if (dataRequired.order_value) {
				this.setState({
					isShowBlockOrderValue: true,
				})
			} else if (dataRequired.product_qty) {
				this.setState({
					isShowBlockProductQty: true
				})
			} else {
				this.setState({
					isShowBlockOrderValue: false,
					isShowBlockProductQty: false,
				})
			}
			this.setState({
				id: nextProps.couponDetail._id,
				code,
				discount_type,
				discount_value,
				discount_method,
				discount_configs: JSON.parse(discount_configs),
				min_requirements: dataRequired,
				started_at,
				finished_at,
				status,
			})
		}

		if (this.props.classrooms && this.props.books) {
			const dataClassrooms = produce(nextProps.classrooms, draft => {
				draft.map((item, index) => {
					item.type = 'COURSE'
				});
			});
			const dataBooks = produce(nextProps.books, draft => {
				draft.map((item, index) => {
					item.type = 'BOOK'
				});
			});
			const newArr = [...dataClassrooms, ...dataBooks];
			this.setState({
				products: newArr
			})
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

	handleDeleteAll = async (e) => {

	}

	onChangInput = (e) => {
		var name = e.target.name;
		let value = e.target.value;
		this.setState({
			[name]: value,
		})
	}

	onChangInputApplyProduct = (e) => {
		var name = e.target.name;
		let value = e.target.value;
		this.setState({
			[name]: value,
			discount_configs: null,
			isShowBlockApplyProduct: false
		})
	}

	changeStartDate = (date) => {
		if (date !== null) {
			this.setState({
				started_at: date.format("YYYY/MM/DD"),
			})
		} else {
			this.setState({
				started_at: null,
			})
		}
	}
	changeEndDate = (date) => {
		if (date !== null) {
			this.setState({
				finished_at: date.format("YYYY/MM/DD"),
			})
		} else {
			this.setState({
				finished_at: null,
			})
		}
	}
	handleSubmit = () => {
		const data = {
			code: this.state.code,
			discount_type: this.state.discount_type,
			discount_value: this.state.discount_value,
			discount_method: this.state.discount_method,
			discount_configs: JSON.stringify(this.state.discount_configs),
			min_requirements: this.state.min_requirements !== 'NONE' ? JSON.stringify(this.state.min_requirements) : this.state.min_requirements,
			started_at: this.state.started_at,
			finished_at: this.state.finished_at,
			status: true
		};

		if (!isEmpty(this.state.id)) {
			data.id = this.state.id;
			this.props.updateCoupon(data);
		} else {
			this.props.createCoupon(data);
		}

	}

	isShowBlockToDate = (e) => {
		const checked = e.target.checked;
		this.setState({
			isShowDiscountToDate: checked,
		})
	}

	resetDataCoupon = () => {
		this.setState({
			id: '',
			code: '',
			discount_type: 'FIXED',
			discount_value: '',
			discount_method: 'ORDER',
			discount_configs: null,
			min_requirements: 'NONE',
			started_at: '',
			finished_at: '',
			status: '',
			isShowDiscountToDate: false,
		})
	}

	applyProduct = (item) => {
		let newArr = this.state.discount_configs !== null ? this.state.discount_configs.products : [];
		const data = {
			id: item._id,
			name: item.name,
			type: item.type
		};
		if (newArr.length == 0) {
			newArr.push(data);
		} else {
			let dataConfig = filter(newArr, obj => obj.id == item._id);

			if (isEmpty(dataConfig)) {
				newArr.push(data);
			}
		}

		this.setState({
			discount_configs: {
				products: newArr
			},
			isShowBlockApplyProduct: false
		});

	}


	fetchProductRows() {
		if (this.state.products instanceof Array) {
			return this.state.products.map((obj, index) => {
				return (
					<div key={index} className="item" onClick={() => this.applyProduct(obj)}>
						<div className="image text-center">
							<img src={obj.image} alt="image" />
						</div>
						<div className="name text-left">
							<span>{obj.name}</span>
						</div>
						<div className="price text-right">
							<span>{obj.price ? baseHelper.currencyFormat(obj.price) : 0} đ</span>
						</div>
					</div>
				)
			});
		}
	}

	deleteProductApply = (obj) => {
		const dataConfig = this.state.discount_configs.products;

		let dataFiler = dataConfig.filter(item => item.id != obj.id);

		if (dataFiler) {

			this.setState({
				discount_configs: {
					products: dataFiler
				}
			})
		}
	}

	listProductApply() {
		const discountConfigs = this.state.discount_configs;

		if (!isEmpty(discountConfigs) && discountConfigs.products instanceof Array) {
			return discountConfigs.products.map((obj, index) => {
				return (
					<tr key={index}>
						<td>{index + 1}</td>
						<td>{obj.type == 'COURSE' ? 'Khóa học' : 'Sách'} | {obj.name}</td>
						<td className="text-right">
							<button
								className='btn btn-icon'
								id='btn-trash'
								type="button"
								onClick={() => this.deleteProductApply(obj)}
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
						</td>
					</tr>
				)
			});
		}
	}

	searchProduct = () => {
		this.setState({
			isShowBlockApplyProduct: false
		})
	}

	handleSearchProduct = (e) => {
		let value = e.target.value;
		let name = e.target.name;


		const data = {
			limit: 999,
			page: 1,
			keyword: value,
			is_delete: false,
		};
		this.props.listBook(data);
		this.props.listClassroom(data);
	}

	onChangNotRequirement = (e) => {
		var name = e.target.name;
		let value = e.target.value;
		this.setState({
			[name]: value,
			isShowBlockOrderValue: false,
			isShowBlockProductQty: false,
		})
	}

	setIsShowBlockOrderValue = (e) => {
		let value = e.target.value;
		this.setState({
			min_requirements: {
				order_value: value
			},
			isShowBlockOrderValue: true,
			isShowBlockProductQty: false
		})
	}

	setIsShowBlockProductQty = (e) => {
		let value = e.target.value;
		this.setState({
			min_requirements: {
				product_qty: value
			},
			isShowBlockProductQty: true,
			isShowBlockOrderValue: false
		})
	}

	onChangOrderValue = (e) => {
		let value = e.target.value;
		this.setState({
			min_requirements: {
				order_value: value
			}
		})
	}

	onChangeProductQty = (e) => {
		let value = e.target.value;
		this.setState({
			min_requirements: {
				product_qty: value
			}
		})
	}

	handleSetCustomerName = (e) => {
		const value = e.target.value;
		this.setState({
			discount_configs: {
				customer_name: value
			}
		})
	}

	_handleKeyDown = async (e) => {
		if (e.key === "Enter") {
			// e.preventDefault();
			// this.props.listCoupon(this.getData());
			e.preventDefault();
			let { keyword, from_date, to_date } = this.state;

			this.props.history.push(`/coupon?keyword=${keyword}&from_date=${from_date}&to_date=${to_date}`);

			await this.getData(1);
		}
	}

	changeDateStart = async (date, dateString) => {
		if (date !== null) {
			await this.setState({
				from_date: date.format("YYYY/MM/DD") + ' ' + '00:00:00',
			});
		}
		let { keyword, from_date, to_date } = this.state;

		this.props.history.push(`/coupon?keyword=${keyword}&&from_date=${from_date}&to_date=${to_date}`);
		await this.getData(1);
	};

	changeDateEnd = async (date, dateString) => {
		if (date !== null) {
			await this.setState({
				to_date: date.format("YYYY/MM/DD") + ' ' + '23:59:59',
			});
		}
		let { keyword, from_date, to_date } = this.state;

		this.props.history.push(`/coupon?keyword=${keyword}&from_date=${from_date}&to_date=${to_date}`);
		await this.getData(1);
	};


	sort = async (event) => {
		const { classList } = event.target;

		const name = event.target.getAttribute("name");

		await this.setState({
			sort_key: name,
			sort_value: this.state.sort_value == 1 ? -1 : 1
		});



		let { keyword, from_date, to_date, sort_key, sort_value } = this.state;

		this.props.history.push(`/coupon?keyword=${keyword}&from_date=${from_date}&to_date=${to_date}&sort_key=${sort_key}&sort_value=${sort_value}`);

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
				{/* <div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">Danh sách mã khuyến mại</h2>
						</div>
						<div className="flex" />
						<div>
							<button
								className="btn btn-sm btn-primary text-muted"
                                data-toggle="modal" 
                                data-target="#modalCoupon"
								onClick={this.resetDataCoupon}
                            >
								Thêm mới
								
							</button>
						</div>
					</div>
				</div> */}
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Khuyến mại</h2>
						<div className="blocl-table-coupon">
							<div className="toolbar">
								<form className="flex">
									<div className="input-group lesson-page">
										<input
											type="text"
											className="form-control form-control-theme keyword-custom"
											placeholder="Nhập từ khoá tìm kiếm..."
											onChange={this.onChange}
											onKeyDown={this._handleKeyDown}
											name="keyword"
											value={this.state.keyword}
										/>{' '}
										<span className="input-group-append">
											<button
												className="btn btn-white btn-sm"
												type="button"
												onClick={this.onSubmit}
											>
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
										<DatePicker
											format={"DD/MM/YYYY"}
											value={this.state.from_date ? Moment(this.state.from_date) : null}
											onChange={this.changeDateStart}
											placeholder='Từ ngày'
											className='ml-2'
										/>
										<DatePicker
											format={"DD/MM/YYYY"}
											onChange={this.changeDateEnd}
											value={this.state.to_date ? Moment(this.state.to_date) : null}
											placeholder='Đến ngày'
											className='ml-2'
										/>
										<button
											onClick={this.onSubmit}
											className='btn btn-sm btn-custom-search text-muted ml-2'
										>
											<span className='d-none d-sm-inline mx-1'>
												Tìm kiếm
											</span>
										</button>

										<div className="btn-add-chapter ml-16">
											<button
												type='button'
												data-toggle="modal"
												data-target="#modalCoupon"
												data-toggle-class="fade-down"
												data-toggle-class-target=".animate"
											>
												<span>Tạo mã khuyến mãi</span>
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
															data-target="#delete-coupon"
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
													content="Mã khuyến mãi"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="discount_type"
													content="Loại"
													width={125}
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="discount_method"
													content="Đối tượng áp dụng"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="updated_at"
													content="Ngày tạo khuyến mãi"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="started_at"
													content="Thời gian bắt đầu"
													handleSort={this.sort}
													sort_key={this.state.sort_key}
													sort_value={this.state.sort_value}
												/>
												<HeadingSortColumn
													name="finished_at"
													content="Thời gian kết thúc"
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


				{/* Modal Coupon  */}
				<div
					className="modal fade"
					id="modalCoupon"
					data-backdrop="true"
					role="dialog"
					style={{
						zIndex: 1050
					}}
					aria-labelledby="exampleModalLabel"
					aria-hidden="true"
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title coupon-title-form title-block mb-0">
									{isEmpty(this.state.id) ? 'Tạo khuyến mãi mới' : 'Sửa mã khuyến mãi'}
								</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<form method="POST">
								<div className="modal-body coupon-form-content">
									<div className="block-coupon">
										<div className="row">
											<div className="col-12">
												<div className="form-group">
													<h4 className="coupon-label">Mã khuyến mại</h4>
													<input
														type="text"
														name="code"
														value={this.state.code}
														onChange={this.onChangInput}
														placeholder="Nhập mã khuyến mãi"
													/>
												</div>
											</div>
											{/* <div className="col-6">
												<div className="overview-coupon">
													<label>Tổng quan khuyến mãi</label>
													<ul className="overview-list">
														<h3 className="item-code">{this.state.code}</h3>
														<li className="overview-item">
															<span>Loại: Mã khuyến mãi</span>
														</li>
														<li className="overview-item">
															<span>Giảm {this.state.discount_value}{this.state.discount_type == 'FIXED' ? 'VNĐ' : '%'} cho toàn bộ sản phẩm</span>
														</li>
														<li className="overview-item">
															<span>Áp dụng cho {this.state.discount_method == 'ORDER' ? 'toàn bộ đơn hàng' : 'sản phẩm cụ thể'}</span>
														</li>
														<li className="overview-item">
															<span>Mỗi khách hàng được sử dụng 1 lần</span>
														</li>
														<li className="overview-item">
															<span>
																Áp dụng từ {this.state.started_at && Moment(this.state.started_at).format('DD/MM/YYYY HH:mm:ss')} đến {this.state.finished_at && Moment(this.state.finished_at).format('DD/MM/YYYY HH:mm:ss')}</span>
														</li>
													</ul>
												</div>
											</div> */}
										</div>
									</div>
									<div className="block-coupon">
										<div className="row">
											<div className="col-12">
												<h4 className="coupon-label">Loại khuyến mại</h4>
												<div className="row">
													<div className="col-6">
														<div className="form-group">
															<label>Loại</label>
															<div className="coupon-select">
																<select name="discount_type" onChange={this.onChangInput}>
																	<option value="FIXED" selected={this.state.discount_type == 'FIXED'}>
																		Số tiền
																	</option>
																	<option value="PERCENT" selected={this.state.discount_type == 'PERCENT'}>
																		Phần trăm
																	</option>
																</select>
															</div>
														</div>
													</div>
													<div className="col-6">
														<div className="form-group">
															<label>Giá trị</label>
															<div className="coupon-input">
																<div className="coupon-money">
																	<span>
																		{this.state.discount_type == 'FIXED' ? 'đ' : '%'}
																	</span>
																</div>
																<input
																	type="text"
																	name="discount_value"
																	value={this.state.discount_value}
																	className="coupon-pl-24"
																	onChange={this.onChangInput}
																/>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="block-coupon">
										<div className="row">
											<div className="col-12">
												<h4 className="coupon-label">Áp dụng với</h4>
												<div className="coupon-list">
													<Radio.Group
														onChange={this.onChangInputApplyProduct}
														name="discount_method"
														value={this.state.discount_method}
														style={{ width: "100%" }}
													>
														<Radio className="discount-item checkbox" value={"ORDER"}>Toàn bộ đơn hàng</Radio>
														<Radio className="discount-item checkbox" value={"PRODUCT"}>Sản phẩm cụ thể</Radio>
														{
															this.state.discount_method == 'PRODUCT'
															&&
															<div className="block-product-apply">
																<div className="discount-item input-search-product">
																	<div className="autocomplete-variant">
																		<input
																			type="text"
																			id="tag-book"
																			name="keyword"
																			onChange={this.handleSearchProduct}
																			onClick={() => this.setState({ isShowBlockApplyProduct: true })}
																			placeholder="Tìm kiếm sản phẩm..."
																		/>
																		<button
																			className="btn btn-white btn-sm"
																			type="button"
																			onClick={() => this.searchProduct()}
																		>
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
																		{
																			this.state.isShowBlockApplyProduct
																			&&
																			<div className="async-auto-complete">
																				{this.fetchProductRows()}
																			</div>
																		}
																	</div>
																</div>
																<table className="product-apply">
																	<thead></thead>
																	<tbody>
																		{this.listProductApply()}
																	</tbody>
																</table>
															</div>
														}
														<Radio className="discount-item checkbox" value={"CUSTOMER"}>Khách hàng cụ thể</Radio>
														{
															this.state.discount_method == 'CUSTOMER'
															&&
															<div className="block-product-apply">
																<div className="discount-item input-search-product">
																	<div className="autocomplete-variant">
																		<input
																			type="text"
																			id="customer_name"
																			name="customer_name"
																			value={this.state.discount_configs ? this.state.discount_configs.customer_name : ''}
																			onChange={this.handleSetCustomerName}
																			placeholder="Nhập tên khách hàng..."
																		/>
																	</div>
																</div>
																<table className="product-apply">
																	<thead></thead>
																	<tbody>
																		{this.listProductApply()}
																	</tbody>
																</table>
															</div>
														}
													</Radio.Group>
												</div>
											</div>
										</div>
									</div>

									<div className="block-coupon">
										<div className="row">
											<div className="col-12">
												<h4 className="coupon-label">Yêu cầu tối thiểu</h4>
												<div className="coupon-list">
													<Radio.Group
														// onChange={this._onChange}
														// name="min_requirements"
														// value={this.state.min_requirements}
														style={{ width: "100%" }}
													>
														<Radio
															className="discount-item checkbox"
															name="min_requirements"
															value={"NONE"}
															onChange={this.onChangNotRequirement}
															checked={this.state.min_requirements == 'NONE'}
														>
															Không yêu cầu
														</Radio>
														<Radio
															className="discount-item checkbox"
															value={""}
															name="min_requirements"
															checked={this.state.isShowBlockOrderValue == true}
															onChange={this.setIsShowBlockOrderValue}
														>
															Tổng tiền tối thiểu
														</Radio>
														{
															this.state.isShowBlockOrderValue
															&&
															<div className="block-minimum-requirements">
																<div className="coupon-input">
																	<div className="coupon-money">
																		<span>
																			đ
																		</span>
																	</div>
																	<input
																		type="text"
																		name="order_value"
																		value={this.state.min_requirements.order_value ? this.state.min_requirements.order_value : 0}
																		className="coupon-pl-24"
																		onChange={this.onChangOrderValue}
																	/>
																</div>
															</div>
														}
														<Radio
															className="discount-item checkbox"
															value={"PRODUCT_QTY"}
															name="min_requirements"
															checked={this.state.isShowBlockProductQty == true}
															onChange={this.setIsShowBlockProductQty}
														>
															Số lượng sản phẩm tối thiểu trong đơn hàng
														</Radio>
														{
															this.state.isShowBlockProductQty
															&&
															<div className="block-minimum-requirements">
																<div className="coupon-input">
																	<input
																		type="number"
																		name="product_qty"
																		value={this.state.min_requirements.product_qty ? this.state.min_requirements.product_qty : ''}
																		onChange={this.onChangeProductQty}
																	/>
																</div>
															</div>
														}
													</Radio.Group>
													{/* <div className="discount-item checkbox">
														<input
															type="radio"
															id="not_required"
															name="min_requirements"
															value="NONE"
															onChange={this.onChangNotRequirement}
															checked={this.state.min_requirements == 'NONE'}
														/>
														<label htmlFor="not_required">Không yêu cầu</label>
													</div> */}
													{/* <div className="discount-item checkbox">
														<input
															type="radio"
															id="total_amount"
															value=""
															name="min_requirements"
															checked={this.state.min_requirements.order_value == '' || this.state.min_requirements.order_value}
															onChange={this.setIsShowBlockOrderValue}
														/>
														<label htmlFor="total_amount">Tổng tiền tối thiểu</label>
													</div> */}

													{/* {
														this.state.isShowBlockOrderValue
														&&
														<div className="block-minimum-requirements">
															<div className="coupon-input">
																<div className="coupon-money">
																	<span>
																		đ
																	</span>
																</div>
																<input
																	type="text"
																	name="order_value"
																	value={this.state.min_requirements.order_value ? this.state.min_requirements.order_value : ''}
																	className="coupon-pl-24"
																	onChange={this.onChangOrderValue}
																/>
															</div>
														</div>
													} */}

													{/* <div className="discount-item checkbox">
														<input
															type="radio"
															id="product_qty"
															name="min_requirements"
															value=""
															checked={this.state.min_requirements.product_qty == '' || this.state.min_requirements.product_qty}
															onChange={this.setIsShowBlockProductQty}
														/>
														<label htmlFor="product_qty">Số lượng sản phẩm tối thiểu trong đơn hàng</label>
													</div> */}

													{/* {
														this.state.isShowBlockProductQty
														&&
														<div className="block-minimum-requirements">
															<div className="coupon-input">
																<input
																	type="number"
																	name="product_qty"
																	value={this.state.min_requirements.product_qty ? this.state.min_requirements.product_qty : ''}
																	onChange={this.onChangeProductQty}
																/>
															</div>
														</div>
													} */}

												</div>
											</div>
										</div>
									</div>

									<div className="block-coupon">
										<div className="row">
											<div className="col-12">
												<h4 className="coupon-label">Thời gian áp dụng</h4>
												<div className="discount-date-box">
													<div className="discount-from-date discount-date-item m-r-10">
														<label>Ngày bắt đầu</label>
														<DatePicker
															format={
																"DD/MM/YYYY"
															}
															value={this.state.started_at
																? Moment(this.state.started_at)
																: null}
															onChange={this.changeStartDate}
															placeholder="Từ ngày"
															className="form-control"
														/>
													</div>
													{
														this.state.isShowDiscountToDate
														&&
														<div className="discount-to-date discount-date-item">
															<label>Ngày kết thúc</label>
															<DatePicker
																format={
																	"DD/MM/YYYY"
																}
																value={this.state.finished_at
																	? Moment(this.state.finished_at)
																	: null}
																onChange={this.changeEndDate}
																placeholder="Đến ngày"
																className="form-control"
															/>
														</div>

													}

													<div className="discount-check-endate">
														<input type="checkbox" className="limitTime" onChange={this.isShowBlockToDate} />
														<label>Chọn ngày hết hạn</label>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="block-preview-discount row">
										<div className='col-12'>
											<div className="overview-coupon">
												<label>Tổng quan khuyến mãi</label>
												<ul className="overview-list">
													<h3 className="item-code">{this.state.code}</h3>
													<li className="overview-item">
														<span>Loại: Mã khuyến mãi</span>
													</li>
													<li className="overview-item">
														<span>Giảm {this.state.discount_value}{this.state.discount_type == 'FIXED' ? 'VNĐ' : '%'} cho toàn bộ sản phẩm</span>
													</li>
													<li className="overview-item">
														<span>Áp dụng cho {this.state.discount_method == 'ORDER' ? 'toàn bộ đơn hàng' : 'sản phẩm cụ thể'}</span>
													</li>
													<li className="overview-item">
														<span>Mỗi khách hàng được sử dụng 1 lần</span>
													</li>
													<li className="overview-item">
														<span>
															Áp dụng từ {this.state.started_at && Moment(this.state.started_at).format('DD/MM/YYYY HH:mm:ss')} đến {this.state.finished_at && Moment(this.state.finished_at).format('DD/MM/YYYY HH:mm:ss')}</span>
													</li>
												</ul>
											</div>
										</div>
									</div>

								</div>
							</form>
							<div className="block-action-footer" style={{ padding: "0px 15px" }}>
								<button type="button" className="btn-cancel mr-24" data-dismiss="modal">
									<img src="/assets/img/icon-arrow-left.svg" className="mr-14" />Hủy</button>
								<button type="button" className="btn btn-primary" onClick={this.handleSubmit}>Lưu</button>
							</div>
						</div>
					</div>
				</div>

				<div
					id="delete-coupon"
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
										Bạn chắc chắn muốn xóa mã khuyến mại này, thao tác này không thể khôi phục?
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
		);
	}
}

function mapStateToProps(state) {
	return {
		coupons: state.coupon.coupons,
		coupon: state.coupon.coupon,
		couponDetail: state.coupon.couponDetail,
		dataRemoveCoupon: state.coupon.dataRemoveCoupon,
		limit: state.coupon.limit,
		total: state.coupon.total,
		page: state.coupon.page,
		ids: state.coupon.ids,
		check: state.coupon.checkAll,
		books: state.book ? state.book.books : [],
		classrooms: state.classroom ? state.classroom.classrooms : [],
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listCoupon,
			createCoupon,
			getDataCoupon,
			updateCoupon,
			addDataRemoveCoupon,
			deleteCoupon,
			listBook,
			listClassroom
		},
		dispatch,
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Coupon),
);
export default Container;
