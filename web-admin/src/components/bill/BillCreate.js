import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { notification, Select } from "antd";
import { isUndefined } from "util";
import { listSubject } from "../../redux/subject/action";
import {
	listClassroomPerUser,
	listClassroom,
	resetBillCreateState,
} from "../../redux/classroom/action";
import {
	getUserByCode,
	initItem,
	changeQty,
	billCreate,
	classItemsCopy,
	selectClass,
	disSelectClass,
	resetStateBill,
	createAdmin,
	addClassToBill,
	changePayType,
} from "../../redux/bill/action";
import "../../App.css";

class RowSelect extends Component {
	constructor(props) {
		super();
		this.state = {
			qty: 0,
			discount_value: 0,
			discount_percent: 0,
			discount_vnd: 0,
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.check !== nextProps.check) {
			this.setState({
				check: nextProps.check,
			});
		}
	}

	calcQty = (pay_type) => {
		var qty = 0;
		if (pay_type === "1MONTH") {
			qty = 1 * 8;
		} else if (pay_type === "3MONTH") {
			qty = 3 * 8;
		} else if (pay_type === "6MONTH") {
			qty = 6 * 8;
		} else if (pay_type === "12MONTH") {
			qty = 12 * 8;
		}
		return qty;
	};

	select = async () => {
		var obj = {
			id: this.props.obj.id,
			code: this.props.obj.code,
			name: this.props.obj.name,
			price: !isUndefined(this.props.obj.price) ? this.props.obj.price : 0,
			qty: this.calcQty(this.props.pay_type),
			subject_name: this.props.obj.subject_name,
			discount_type: this.props.discount_type,
			discount_value: this.state.discount_value,
			discount_vnd: this.state.discount_vnd,
			discount_percent: this.state.discount_percent,
			discount: 0,
			total: 0,
		};

		await this.props.selectClass(this.props.obj.id, obj);
	};

	render() {
		const { subject_name, name, price, hp_day } = this.props.obj;

		return (
			<tr className="v-middle" data-id={17}>
				<td>{subject_name}</td>
				<td className="flex">{name}</td>
				<td className="text-right">
					{isUndefined(hp_day)
						? price.toLocaleString("en-EN", {
							minimumFractionDigits: 0,
						})
						: hp_day.toLocaleString("en-EN", {
							minimumFractionDigits: 0,
						})}
				</td>

				<td className="text-right">
					<button
						onClick={this.select}
						className="btn btn-icon"
						title="Trash"
						id="btn-trash"
					>
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
							className="feather feather-plus mx-2"
						>
							<line x1={12} y1={5} x2={12} y2={19} />
							<line x1={5} y1={12} x2={19} y2={12} />
						</svg>
					</button>
				</td>
			</tr>
		);
	}
}
class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			qty: 0,
			price: 0,
			discount: 0,
			discount_vnd: 0,
			discount_percent: 0,
			discount_type: "PERCENT",
		};
	}

	calcQty = (pay_type) => {
		var qty = 0;
		if (pay_type === "DAY") {
			qty = 1 * 1;
		}
		else if (pay_type === "1MONTH") {
			qty = 1 * 8;
		} else if (pay_type === "3MONTH") {
			qty = 3 * 8;
		} else if (pay_type === "6MONTH") {
			qty = 6 * 8;
		} else if (pay_type === "12MONTH") {
			qty = 12 * 8;
		}
		return qty;
	};

	async UNSAFE_componentWillReceiveProps(nextProps) {
		if (nextProps.obj.qty) {
			await this.setState({
				qty: nextProps.obj.qty,
				price: nextProps.obj.price,
			});
		}
	}

	componentDidMount = async () => {
		if (this.props.obj) {
			await this.setState({
				qty: this.props.obj.qty,
				price: this.props.obj.price,
				discount: this.state.discount,
				discount_value: this.props.obj.discount_value,
				discount_vnd:
					this.props.obj.discount_type === "FIXED"
						? this.props.obj.discount_value
						: 0,
				discount_percent:
					this.props.obj.discount_type === "PERCENT"
						? this.props.obj.discount_value
						: 0,
			});
		}
	};

	_onChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		const subtotal = (parseFloat(this.state.price) || 0) * (parseFloat(this.state.qty) || 0);
		if (name === "discount_percent") value = Math.min(100, Math.max(0, parseFloat(value) || 0));
		if (name === "discount_vnd") value = Math.min(subtotal, Math.max(0, parseFloat(value) || 0));
		await this.setState({
			[name]: value,
		});

		let _price = this.state.price;
		if (name === "pay_type") {
			_price = this.props.obj.hp_day;
		}

		var obj = {
			id: this.props.obj.id,
			code: this.props.obj.code,
			name: this.props.obj.name,
			hp_day: this.props.obj.hp_day,
			price: _price,
			qty: parseFloat(this.state.qty),
			subject_name: this.props.obj.subject_name,
			discount_type: this.state.discount_type,
			discount_value: 0,
			discount_vnd: this.state.discount_vnd,
			discount_percent: this.state.discount_percent,
			discount: 0,
			total: 0,
		};

		let _total = 0;
		let _discount = 0;
		if (name === "discount_vnd") {
			const discountVnd = Math.min(subtotal, Math.max(0, parseFloat(value) || 0));
			_discount = discountVnd;
			obj.discount_value = discountVnd;
			await this.setState({
				discount: _discount,
				discount_type: "FIXED",
				discount_percent: 0,
				discount_value: discountVnd,
			});
			_total = Math.max(0, this.state.price * this.state.qty - discountVnd);
		}

		if (name === "discount_percent") {
			const discountPercent = Math.min(100, Math.max(0, parseFloat(value) || 0));
			obj.discount_value = discountPercent;
			_total = Math.max(0, this.state.price * this.state.qty * (1 - discountPercent / 100));
			_discount = this.state.price * this.state.qty * (discountPercent / 100);
			await this.setState({
				discount: _discount,
				discount_vnd: 0,
				discount_value: discountPercent,
				discount_type: "PERCENT",
			});
		}

		obj.discount = _discount;
		obj.total = Math.max(0, _total);

		await this.props.changeQty(obj);
	};

	render() {
		const { subject_name, name } = this.props.obj;
		const styles = {
			maxWidth: 120,
		};
		const stylesW = {
			maxWidth: 150,
		};
		return (
			<tr className="v-middle" data-id={17}>
				<td>{subject_name}</td>
				<td className="flex">{name}</td>
				<td className="" style={stylesW}>
					<input
						type="number"
						className="form-control"
						name="price"
						min={0}
						readOnly={true}
						onChange={this._onChange}
						value={this.state.price}
					/>
				</td>
				<td className="" style={styles}>
					<input
						type="number"
						className="form-control"
						name="qty"
						min={0}
						onChange={this._onChange}
						value={this.state.qty}
					/>
				</td>
				<td className="" style={styles}>
					<input
						type="number"
						className="form-control"
						name="discount_percent"
						min={0}
						max={100}
						onChange={this._onChange}
						value={this.state.discount_percent}
					/>
				</td>

				<td style={styles}>
					<input
						type="number"
						className="form-control"
						name="discount_vnd"
						min={0}
						max={(parseFloat(this.state.price) || 0) * (parseFloat(this.state.qty) || 0)}
						onChange={this._onChange}
						value={this.state.discount_vnd}
					/>
				</td>

				<td className="text-right">
					{Math.max(0, (this.state.discount_vnd <= 0
						? this.state.price * this.state.qty -
						(this.state.price *
							this.state.qty *
							this.state.discount_percent) /
						100
						: this.state.price * this.state.qty - this.state.discount_vnd
					)).toLocaleString("en-EN", {
						minimumFractionDigits: 0,
					})}
				</td>
				<td className="text-right">
					<button
						onClick={(e) =>
							this.props.disSelectClass(this.props.obj.id, this.props.obj)
						}
						className="btn btn-icon"
						title="Trash"
						id="btn-trash"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							className="feather feather-trash text-muted"
						>
							<polyline points="3 6 5 6 21 6"></polyline>
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
						</svg>
					</button>
				</td>
			</tr>
		);
	}
}

class BillCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			user_code: "",
			fullname: "",
			phone: "",
			email: "",
			school: "",
			classroom: "",
			user_group: "STUDENT",
			password: "12345678",
			classroom_id: "",
			subject_id: "",
			discount: 0,
			discount_value: 0,
			discount_vnd: 0,
			discount_percent: 0,
			payment_method: 'CASH',
			note: 'Đóng học phí',
			discount_type: "PERCENT",
			pay_type: "1MONTH",
			other_bills: []
		};
	}

	_resetState = async (e) => {
		await this.setState({
			user_code: "",
			fullname: "",
			phone: "",
			email: "",
			school: "",
			classroom: "",
			user_group: "STUDENT",
			password: "12345678",
			classroom_id: "",
			subject_id: "",
			discount: 0,
			discount_value: 0,
			discount_vnd: 0,
			discount_percent: 0,
			discount_type: "PERCENT",
			pay_type: "1MONTH",
		});
	};

	_onChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		if (name === "pay_type") {
			var data = this.changePayTypeData();
			await this.props.changePayType(data);
		}
	};

	calcQty = (pay_type) => {
		var qty = 0;
		if (pay_type === "DAY") {
			qty = 1 * 1;
		} else if (pay_type === "1MONTH") {
			qty = 1 * 8;
		} else if (pay_type === "3MONTH") {
			qty = 3 * 8;
		} else if (pay_type === "6MONTH") {
			qty = 6 * 8;
		} else if (pay_type === "12MONTH") {
			qty = 12 * 8;
		}
		return qty;
	};

	changePayTypeData = () => {
		try {
			var { classrooms } = this.props;
			var classItemsCopy = this.props.classItems;
			if (classItemsCopy.length > 0) {
				classItemsCopy.map((obj) => {
					var index = classrooms
						.map((ele) => ele._id.toString())
						.indexOf(obj.id);

					if (index >= 0) {
						let _hp = 150000;

						if (!isUndefined(this.props.classrooms[index].hp_day))
							_hp = parseFloat(this.props.classrooms[index].hp_day);

						if (
							this.state.pay_type === "DAY" &&
							!isUndefined(this.props.classrooms[index].hp_day)
						)
							_hp = parseFloat(this.props.classrooms[index].hp_day);

						if (
							this.state.pay_type === "1MONTH" &&
							!isUndefined(this.props.classrooms[index].hp_1month_day)
						)
							_hp = parseFloat(this.props.classrooms[index].hp_1month_day);

						if (
							this.state.pay_type === "3MONTH" &&
							!isUndefined(this.props.classrooms[index].hp_3month_day)
						)
							_hp = parseFloat(this.props.classrooms[index].hp_3month_day);

						if (
							this.state.pay_type === "6MONTH" &&
							!isUndefined(this.props.classrooms[index].hp_6month_day)
						)
							_hp = parseFloat(this.props.classrooms[index].hp_6month_day);

						if (
							this.state.pay_type === "12MONTH" &&
							!isUndefined(this.props.classrooms[index].hp_12month_day)
						)
							_hp = parseFloat(this.props.classrooms[index].hp_12month_day);

						var data = {
							id: this.props.classrooms[index]._id,
							code: this.props.classrooms[index].code,
							name: this.props.classrooms[index].name,
							price: _hp,
							qty: this.calcQty(this.state.pay_type),
							subject_name: this.props.classrooms[index].subject.name,
						};

						return Object.assign(obj, data);
					}
				});
			}

			return classItemsCopy;
		} catch (error) {
			console.log(error);
		}
	};

	onChangeClassroom = async (value) => {
		await this.setState({
			classroom_id: value,
		});
	};

	handleSubmit = async (e) => {
		e.preventDefault();

		if (this.props.classItems.length > 0) {
			const data = {
				user_id: this.props.userData._id,
				code:
					this.props.userData.code !== null ? this.props.userData.code : null,
				items: this.props.classItems,
				pay_type: this.state.pay_type,
				type: "PT",
				discount_type: this.state.discount_type,
				discount_value: this.state.discount_value,
				discount: this.renderDiscount(),
				discount_vnd: this.state.discount_vnd,
				payment_method: this.state.payment_method,
				subtotal: this.renderTotal(),
				total: this.renderTotalPay(),
				note: this.state.note,
			};

			await this.props.billCreate(data);

			await this._resetState();
			window.location.href = "/bill/create";
		} else {
			notification.warning({
				message: "Vui lòng chọn lớp",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	};

	print = async () => {
		if (this.props.classItems.length > 0) {
			var content = document.getElementById("elePrinted");
			var pri = document.getElementById("ifmcontentstoprint").contentWindow;
			pri.document.open();
			pri.document.write(content.innerHTML);
			pri.document.close();
			pri.focus();
			pri.print();
		} else {
			notification.warning({
				message: "Vui lòng chọn lớp",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	};

	getDataSubject = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: 999,
			is_delete: false,
			user_group: "STUDENT",
			is_online: false
		};

		return data;
	};

	async componentDidMount() {
		await this.props.listSubject(this.getDataSubject());
		await this.props.listClassroom({ limit: 999, is_online: false });
		this.setState({
			checkAll: false,
		});
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

	fetchOptions() {
		if (this.props.classrooms instanceof Array) {
			if (this.state.subject_id !== "") {
				return this.props.classrooms.map((obj, i) => {
					if (obj.subject.id === this.state.subject_id) {
						return (
							<option value={obj._id} key={obj._id.toString()}>
								{obj.name}
							</option>
						);
					}
				});
			}
		}
	}

	fetchRowsSelect() {
		if (this.props.classItemCopys instanceof Array) {
			return this.props.classItemCopys.map((object, i) => {
				return (
					<RowSelect
						obj={object}
						key={object.id}
						index={i}
						initItem={this.props.initItem}
						changeQty={this.props.changeQty}
						discount_value={this.state.discount_value}
						discount_type={this.state.discount_type}
						discount_vnd={this.state.discount_vnd}
						selectClass={this.props.selectClass}
						pay_type={this.state.pay_type}
						payment_method={this.state.payment_method}
					/>
				);
			});
		}
	}

	fetchRows() {
		if (this.props.classItems instanceof Array) {
			return this.props.classItems.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						initItem={this.props.initItem}
						changeQty={this.props.changeQty}
						discount_value={this.state.discount_value}
						discount_type={this.state.discount_type}
						discount_vnd={this.state.discount_vnd}
						payment_method={this.state.payment_method}
						disSelectClass={this.props.disSelectClass}
					/>
				);
			});
		}
	}

	_handleKeyDown = async (e) => {
		if (e.key === "Enter") {
			let user_code = e.target.value;
			if (user_code !== "") {
				await this.setState({
					user_code,
					isSearch: true,
					pay_type: "1MONTH",
				});

				await this.props.resetBillCreateState();
				await this.props.resetStateBill();

				await this.props.listClassroomPerUser({
					limit: 999,
					user_code,
					is_online: false,
				});
				if (this.props.classroomsPerUser.length > 0) {
					await this.props.initItem(this.props.classroomsPerUser);
				}
				await this.props.getUserByCode({ code: user_code });
			} else {
				await this.setState({ isSearch: false });
				notification.warning({
					message: "Vui lòng nhập mã học sinh",
					placement: "topRight",
					top: 50,
					duration: 3,
				});
			}
		}
	};

	componentWillUnmount = async () => {
		await this.props.resetBillCreateState();
		await this.props.resetStateBill();
	};

	renderTotal = () => {
		let total = 0;
		if (this.props.classItems.length > 0) {
			this.props.classItems.forEach((ele) => {
				total += parseFloat(ele.qty) * parseFloat(ele.price);
			});
		}
		return total;
	};

	renderDiscount = () => {
		let total = 0;
		if (this.props.classItems.length > 0) {
			for (let i = 0; i < this.props.classItems.length; i++) {
				let _discountValue = 0;
				const qty = parseFloat(this.props.classItems[i].qty) || 0;
				const price = parseFloat(this.props.classItems[i].price) || 0;
				const subtotal = qty * price;
				if (this.props.classItems[i].discount_type === "PERCENT") {
					_discountValue = parseFloat(
						this.props.classItems[i].discount_percent
					);
					if (isNaN(_discountValue))
						_discountValue = this.props.classItems[i].discount_value;
					_discountValue = Math.min(100, Math.max(0, _discountValue || 0));
					total +=
						Math.min(
							subtotal,
							(this.props.classItems[i].qty *
								this.props.classItems[i].price *
								_discountValue) /
							100
						);
				} else {
					_discountValue = parseFloat(this.props.classItems[i].discount_vnd);
					if (isNaN(_discountValue))
						_discountValue = this.props.classItems[i].discount_value;
					total += Math.min(subtotal, Math.max(0, _discountValue || 0));
				}
			}
		}

		return total;
	};

	renderTotalPay = () => {
		let total = 0;
		if (this.props.classItems.length > 0) {
			total =
				parseFloat(this.renderTotal()) - parseFloat(this.renderDiscount());
		}
		return Math.max(0, total);
	};

	fetchTable = () => {
		if (this.props.classItems.length > 0)
			if (this.props.classItems instanceof Array) {
				return this.props.classItems.map((item, i) => {
					const _itemDiscountVND = item.discount_vnd
						? parseFloat(item.discount_vnd)
						: 0;
					const _itemDiscountValue = parseFloat(item.discount_value);
					let _total = 0;
					if (_itemDiscountVND > 0) {
						_total = item.qty * item.price - _itemDiscountVND;
					} else {
						_total = item.qty * item.price - _itemDiscountValue;
					}

					return (
						<tr key={i}>
							<td
								style={{
									border: "1px solid #000",
									padding: "6px 8px",
									textAlign: "center",
								}}
							>
								{i + 1}
							</td>
							<td
								style={{
									border: "1px solid #000",
									padding: "6px 8px",
									textAlign: "left",
								}}
							>
								{item.subject_name}
							</td>
							<td
								style={{
									border: "1px solid #000",
									padding: "6px 8px",
									textAlign: "left",
								}}
							>
								{item.name}
							</td>
							<td
								style={{
									border: "1px solid #000",
									padding: "6px 8px",
									textAlign: "right",
								}}
							>
								{item.price.toLocaleString("en-EN", {
									minimumFractionDigits: 0,
								})}
							</td>
							<td
								style={{
									border: "1px solid #000",
									padding: "6px 8px",
									textAlign: "center",
								}}
							>
								{item.qty}
							</td>
							<td
								style={{
									border: "1px solid #000",
									padding: "6px 8px",
									textAlign: "center",
								}}
							>
								{parseFloat(item.discount_value) > 0
									? parseFloat(item.discount_value)
									: 0}
							</td>
							<td
								style={{
									border: "1px solid #000",
									padding: "6px 8px",
									textAlign: "right",
								}}
							>
								{_total > 0
									? _total.toLocaleString("en-EN", {
										minimumFractionDigits: 0,
									})
									: 0}
							</td>
						</tr>
					);
				});
			}
	};

	handleCreateStudent = async (e) => {
		e.preventDefault();
		const data = {
			code: this.state.user_code,
			fullname: this.state.fullname,
			email: this.state.email,
			phone: this.state.phone,
			school: this.state.school,
			classroom: this.state.classroom,
			user_group: this.state.user_group,
			password: this.state.password,
			create_type: "FROM_CARD",
		};
		await this.props.createAdmin(data);
		await this.props.listClassroomPerUser({
			limit: 999,
			user_code: this.state.user_code,
			is_online: false,
		});
		if (this.props.classroomsPerUser.length > 0) {
			await this.props.initItem(this.props.classroomsPerUser);
		}
		await this.props.getUserByCode({ code: this.state.user_code });
	};

	handleChooseClass = async () => {
		if (this.state.subject_id === "") {
			notification.warning({
				message: "Vui lòng chọn môn học",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else if (this.state.classroom_id === "") {
			notification.warning({
				message: "Vui lòng chọn lớp học",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else {
			const index = this.props.classrooms
				.map((ele) => ele._id.toString())
				.indexOf(this.state.classroom_id);

			const found = this.props.classItems
				.map((ele) => ele.id.toString())
				.indexOf(this.state.classroom_id);

			if (found !== 0) {
				if (index >= 0) {
					let _hp = 0;
					if (!isUndefined(this.props.classrooms[index].hp_day))
						_hp = parseFloat(this.props.classrooms[index].hp_day);

					if (
						this.state.pay_type === "DAY" &&
						!isUndefined(this.props.classrooms[index].hp_day)
					)
						_hp = parseFloat(this.props.classrooms[index].hp_day);

					if (
						this.state.pay_type === "1MONTH" &&
						!isUndefined(this.props.classrooms[index].hp_1month_day)
					)
						_hp = parseFloat(this.props.classrooms[index].hp_1month_day);

					if (
						this.state.pay_type === "3MONTH" &&
						!isUndefined(this.props.classrooms[index].hp_3month_day)
					)
						_hp = parseFloat(this.props.classrooms[index].hp_3month_day);

					if (
						this.state.pay_type === "6MONTH" &&
						!isUndefined(this.props.classrooms[index].hp_6month_day)
					)
						_hp = parseFloat(this.props.classrooms[index].hp_6month_day);

					if (
						this.state.pay_type === "12MONTH" &&
						!isUndefined(this.props.classrooms[index].hp_12month_day)
					)
						_hp = parseFloat(this.props.classrooms[index].hp_12month_day);

					var data = {
						id: this.props.classrooms[index]._id,
						code: this.props.classrooms[index].code,
						name: this.props.classrooms[index].name,
						price: _hp,
						qty: this.calcQty(this.state.pay_type),
						subject_name: this.props.classrooms[index].subject.name,
						discount_type: this.state.discount_type,
						discount_value: 0,
						discount: 0,
						total: _hp * this.calcQty(this.state.pay_type),
					};

					await this.props.addClassToBill(data);

					this.setState({ classroom_id: "", subject_id: "" });
				}
			} else {
				notification.warning({
					message: "Lớp học này đã được chọn",
					placement: "topRight",
					top: 50,
					duration: 3,
				});
			}
		}
	};

	renderPaytype = () => {
		var pay_type = this.state.pay_type;
		if (pay_type === "1MONTH") {
			return " 1 tháng";
		} else if (pay_type === "3MONTH") {
			return " 3 tháng";
		} else if (pay_type === "6MONTH") {
			return " 6 tháng";
		} else if (pay_type === "12MONTH") {
			return " 12 tháng";
		} else {
			return "";
		}
	};

	renderPaymentMethod = () => {
		var payment_method = this.state.payment_method;
		if (payment_method === "CASH") {
			return " Tiền mặt";
		} else if (payment_method === "BANK_TRANSFER") {
			return " Chuyển khoản";
		} else {
			return "";
		}
	};

	classJoined = () => {
		if (this.props.classItemCopys.length > 0) {
			if (this.props.classItemCopys instanceof Array) {
				return this.props.classItemCopys.map((item, i) => {
					return <div>- {item.name}</div>;
				});
			}
		} else {
			return <div className="text-danger">Chưa đăng kí lớp nào.</div>;
		}
	};

	fetchOtherBill() {
		if (this.props.userData && this.props.userData.other_bills instanceof Array) {
			return this.props.userData.other_bills.map((obj, i) => {
				if (i == 0)
					return (
						<div className="v-middle" key={i}>
							<a href={"/bill/" + obj._id + "/edit"} target="_blank">{obj.code}</a> - {obj.total.toLocaleString("en-EN", { minimumFractionDigits: 0 })}đ - {obj.note}
						</div>
					);
			});
		}
	}

	classPaying = () => {
		var str = " ";
		if (this.props.classItems.length > 0) {
			if (this.props.classItems instanceof Array) {
				this.props.classItems.forEach((item, i) => {
					if (i < this.props.classItems.length - 1) {
						str += item.name + ", ";
					} else {
						str += item.name;
					}
				});
			}
		} else {
			str = ".......................";
		}
		return str;
	};

	render() {
		var datetime = new Date();
		var day = datetime.getDay();
		var month = datetime.getMonth() + 1;
		var year = datetime.getFullYear();

		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Tạo phiếu thu</h2>
						<div className="row">
							<div className="col-md-12 col-sm-12">
								<div className="card">
									<div className="card-header">
										<label><strong>Nhập mã hoặc quét thẻ học sinh</strong></label>
										<input
											type="text"
											className="form-control mw-50"
											name="user_code"
											onChange={this._onChange}
											value={this.state.user_code}
											placeholder={"Mã học sinh"}
											onKeyDown={this._handleKeyDown}
										/>
									</div>

									<div className="card-body">
										<div className="user-order-row">
											<label><strong>Thông tin học sinh</strong></label>
											<div className="user-order-info">
												<div className="form-group row">
													<div className="col-sm-2">
														{this.props.userData === null ?
															<input
																type="text"
																className="form-control"
																name="fullname"
																onChange={this._onChange}
																value={this.state.fullname}
																placeholder="Họ và tên"
															/> :
															<input type="text" className="form-control" placeholder="Tên học sinh" onChange={this.onChange}
																name="fullname" value={this.props.userData.fullname || ""} disabled />}
													</div>

													<div className="col-sm-2">
														{this.props.userData === null ?
															<input
																type="text"
																className="form-control"
																name="email"
																onChange={this._onChange}
																value={this.state.email}
																placeholder="Địa chỉ Email"
															/> :
															<input type="text" className="form-control" placeholder="Email" onChange={this.onChange}
																name="fullname" value={this.props.userData.email || ""} disabled />}
													</div>

													<div className="col-sm-3">
														{this.props.userData === null ?
															<input
																type="text"
																className="form-control"
																name="phone"
																onChange={this._onChange}
																value={this.state.phone}
																placeholder="Số điện thoại"
															/> :
															<input type="text" className="form-control" placeholder="Phone" onChange={this.onChange}
																name="phone" value={this.props.userData.phone || ""} disabled />}
													</div>

													<div className="col-sm-3">
														{this.props.userData === null ?
															<input
																type="text"
																className="form-control"
																name="school"
																onChange={this._onChange}
																value={this.state.school}
																placeholder="Trường"
															/> :
															<input type="text" className="form-control" placeholder="Trường" onChange={this.onChange}
																name="school" value={this.props.userData.school || ""} disabled />}
													</div>
													{this.props.userData === null ?
														<div className="col-sm-2 text-left">
															<button
																className="btn btn-primary"
																onClick={this.handleCreateStudent}
															>
																Lưu thông tin học sinh
															</button>
														</div> : null}
												</div>
											</div>
										</div>
									</div>

									<div className="card-body">
										<div className="row">
											<div className="col-md-8 col-sm-12">
												<label>
													<strong>Chọn lớp cần đăng ký</strong>
												</label>
												<div className="form-group row">
													<div className="col-sm-4">
														<select
															name="subject_id"
															className="custom-select"
															onChange={this._onChange}
															value={this.state.subject_id}
														>
															<option value="">-- Chọn môn --</option>
															{this.fetchRowsSubject()}
														</select>
													</div>

													<div className="col-sm-4">
														<Select
															className="custom-select"
															showSearch
															placeholder="-- Chọn lớp học -- "
															optionFilterProp="children"
															onChange={(val) =>
																this.onChangeClassroom(val)
															}
															name="classroom_id"
														>
															{this.fetchOptions()}
														</Select>
													</div>

													<div className="col-sm-4">
														<button
															className="btn btn-primary"
															onClick={this.handleChooseClass}
														>
															Thêm lớp
														</button>
													</div>
												</div>
												<label>
													<strong>Hình thức đóng</strong>
												</label>
												<div className="df">
													<div className="form-group row">
														<div className="col-md-4">
															<select
																name="pay_type"
																className="form-control"
																onChange={this._onChange}
																value={this.state.pay_type}
															>
																<option value="DAY">Buổi lẻ</option>
																<option value="1MONTH">1 tháng</option>
																<option value="3MONTH">3 tháng</option>
																<option value="6MONTH">6 tháng</option>
															</select>
														</div>
														<div className="col-md-4">
															<select
																name="payment_method"
																className="form-control"
																onChange={this._onChange}
																value={this.state.payment_method}
															>
																<option value="">
																	Hình thức thanh toán
																</option>
																<option value="CASH">Tiền mặt</option>
																<option value="BANK_TRANSFER">
																	Chuyển khoản
																</option>
															</select>
														</div>
													</div>

													<div className="form-group row">
														<div className="col-md-12 col-sm-12">
															<table className="table table-theme table-row v-middle">
																<thead className="text-muted">
																	<tr>
																		<th className="text-left">
																			{" "}
																			Môn học{" "}
																		</th>
																		<th className="text-left">
																			{" "}
																			Tên lớp{" "}
																		</th>
																		<th className="text-center">
																			{" "}
																			Giá tiền{" "}
																		</th>
																		<th className="text-center">
																			{" "}
																			Số lượng{" "}
																		</th>
																		<th className="text-right">
																			{" "}
																			Chiết khấu (%){" "}
																		</th>
																		<th className="text-right">
																			{" "}
																			Chiết khấu (đ){" "}
																		</th>
																		<th className="text-right">
																			{" "}
																			Thành tiền{" "}
																		</th>
																		<th className="text-right"></th>
																	</tr>
																</thead>
																<tbody>{this.fetchRows()}</tbody>
																<tfoot>
																	<tr>
																		<td colSpan={8}>
																			<strong style={{ paddingBottom: 15, display: 'block' }}>Ghi chú</strong>
																			<textarea name="note"
																				className="form-control"
																				onChange={this._onChange}
																				value={this.state.note} placeholder="Ghi chú"></textarea></td>
																	</tr>
																</tfoot>
															</table>
														</div>
													</div>

													<div className="form-group row">
														<div className="col-md-3 d-flex justify-content-center align-items-center">
															Tổng tiền:{" "}
															{!isNaN(this.renderTotal())
																? this.renderTotal().toLocaleString(
																	"en-EN",
																	{
																		minimumFractionDigits: 0,
																	}
																)
																: 0}{" "}
															đ
														</div>
														<div className="col-md-6 d-flex justify-content-end align-items-center">
															Chiết khấu(%)
															<input
																type="number"
																min="0"
																className="form-control form-control-theme ml-1"
																placeholder="Chiết khấu"
																onChange={this._onChange}
																name="discount_value"
																value={this.state.discount_value}
																style={{
																	maxWidth: 150,
																}}
															/>
															(-
															{this.renderDiscount() === 0
																? 0
																: this.renderDiscount().toLocaleString(
																	"en-EN",
																	{
																		minimumFractionDigits: 0,
																	}
																)}
															đ )
														</div>
														<div className="col-md-3 d-flex justify-content-end align-items-center ">
															Tổng thanh toán:{" "}
															{!isNaN(this.renderTotalPay())
																? this.renderTotalPay().toLocaleString(
																	"en-EN",
																	{
																		minimumFractionDigits: 0,
																	}
																)
																: 0}{" "}
															đ
														</div>
													</div>
												</div>
											</div>

											<div className="col-md-4 col-sm-12">
												<div className="card">
													<div className="card-header">
														<strong>Lớp đã tham gia</strong>
													</div>
													<div className="card-body">
														<div className="form-group row">
															<div className="col-sm-12">
																{this.classJoined()}
															</div>
														</div>
													</div>
												</div>

												<div className="card">
													<div className="card-header">
														<strong>Phiếu thu gần nhất</strong>
													</div>
													<div className="card-body">
														<div className="form-group row">
															<div className="col-md-12">
																{this.fetchOtherBill()}
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="row text-right">
									<div className="col-md-12 col-sm-12">
										<button
											className="btn btn-primary mt-2"
											onClick={this.handleSubmit}
										>
											Tạo phiếu thu
										</button>
										<button
											className="btn btn-secondary mt-2 ml-2"
											onClick={this.print}
										>
											In biên lai
										</button>
									</div>
								</div>
							</div>

						</div>
					</div>
				</div>
				<div
					className="row"
					id="elePrinted"
					style={{
						display: "none",
					}}
				>
					<div className="col-12 d-flex justify-content-start">
						<div
							className="card box"
							style={{
								padding: "30px",
							}}
						>
							<h1
								style={{
									textAlign: "center",
									fontSize: "16px",
									marginBottom: 10,
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
								}}
								className="d-flex justify-content-start"
							>
								<span>
									Đơn vị: Trung tâm luyện thi ĐH Đại Cồ Việt
								</span>
							</h1>

							<h2
								style={{
									textAlign: "center",

									fontSize: "16px",
									marginBottom: 10,
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
								}}
								className="d-flex justify-content-start"
							>
								<span>Địa chỉ: số 88 ngõ 27 Đại Cồ Việt</span>
							</h2>

							<h3
								style={{
									textAlign: "center",
									fontSize: "14px",
									marginBottom: "30px",
									clear: "both",
									position: "relative",
								}}
							>
								PHIẾU THU
								<span
									style={{
										marginLeft: 40,
										position: "absolute",
									}}
								>
									Số: ..........................
								</span>
							</h3>

							<h6
								style={{
									textAlign: "center",
									fontSize: "14px",
									marginBottom: "30px",
									clear: "both",
									fontStyle: "italic",
								}}
							>
								{`Ngày ${day} Tháng ${month} Năm ${year}`}
							</h6>

							<table width="60%">
								<tbody>
									<tr>
										<td>
											<strong>Họ và tên học sinh:</strong>
											{this.props.userData !== null
												? ` ${this.props.userData.fullname}`
												: ".................................."}
										</td>
									</tr>
									<tr>
										<td>
											<strong>Danh sách lớp đăng ký:</strong>
											{this.classPaying()}
										</td>
									</tr>
									<tr>
										<td>
											<strong>Thời gian học:</strong>
											{this.renderPaytype()}
										</td>
										<td>
											<strong>Hình thức thanh toán:</strong>
											{this.renderPaymentMethod()}
										</td>
									</tr>
								</tbody>
							</table>
							{this.state.items !== "" ? (
								<table
									width="100%"
									style={{
										borderCollapse: "collapse",
									}}
								>
									<thead>
										<tr>
											<th
												style={{
													border: "1px solid #000",
													padding: "6px 8px",
												}}
												className="text-center"
											>
												STT
											</th>
											<th
												style={{
													border: "1px solid #000",
													padding: "6px 8px",
												}}
											>
												Tên môn
											</th>

											<th
												style={{
													border: "1px solid #000",
													padding: "6px 8px",
												}}
											>
												Tên lớp
											</th>
											<th
												style={{
													border: "1px solid #000",
													padding: "6px 8px",
												}}
											>
												Giá tiền
											</th>
											<th
												style={{
													border: "1px solid #000",
													padding: "6px 8px",
												}}
											>
												Số lượng
											</th>
											<th
												style={{
													border: "1px solid #000",
													padding: "6px 8px",
												}}
											>
												Chiết khấu (%)
											</th>
											<th
												style={{
													border: "1px solid #000",
													padding: "6px 8px",
												}}
											>
												Chiết khấu (đ)
											</th>
											<th
												style={{
													border: "1px solid #000",
													padding: "6px 8px",
												}}
											>
												Thành tiền
											</th>
										</tr>
									</thead>
									<tbody>{this.fetchTable()}</tbody>
								</table>
							) : (
								""
							)}
							<table width="100%" className="mt-2">
								<tbody>
									<tr>
										<td
											style={{
												padding: "6px 8px",
											}}
										></td>
										<td
											style={{
												padding: "6px 8px",
											}}
										></td>
										<td
											style={{
												padding: "6px 8px",
												display: "flex",
												justifyContent: "flex-end",
											}}
										>
											<strong>Tổng tiền</strong>
											{": "}
											{!isNaN(this.renderTotal())
												? `  ${this.renderTotal().toLocaleString(
													"en-EN",
													{
														minimumFractionDigits: 0,
													}
												)} `
												: `  0`}
											đ
										</td>
									</tr>
									<tr>
										<td
											style={{
												padding: "6px 8px",
											}}
										></td>
										<td
											style={{
												padding: "6px 8px",
											}}
										></td>
										<td
											style={{
												padding: "6px 8px",
												display: "flex",
												justifyContent: "flex-end",
											}}
										>
											<strong>Chiết khấu</strong>(
											{`${this.state.discount_value}%`}
											):
											{!isNaN(this.renderDiscount())
												? `  ${this.renderDiscount().toLocaleString(
													"en-EN",
													{
														minimumFractionDigits: 0,
													}
												)} `
												: ` 0 `}
											đ
										</td>
									</tr>
									<tr>
										<td
											style={{
												padding: "6px 8px",
											}}
										></td>
										<td
											style={{
												padding: "6px 8px",
											}}
										></td>
										<td
											style={{
												padding: "6px 8px",
												display: "flex",
												justifyContent: "flex-end",
											}}
										>
											<strong>Thanh toán</strong>
											{": "}
											{!isNaN(this.renderTotalPay())
												? `  ${this.renderTotalPay().toLocaleString(
													"en-EN",
													{
														minimumFractionDigits: 0,
													}
												)} `
												: `  0`}
											đ
										</td>
									</tr>

									<tr>
										<td
											style={{
												padding: "6px 8px",
												textAlign: "center",
											}}
										>
											<strong>Người thu tiền</strong>
											<br /> (Ký & ghi rõ họ tên)
										</td>

										<td
											style={{
												padding: "6px 8px",
											}}
										>
											<strong />
										</td>

										<td
											style={{
												padding: "6px 8px",
												textAlign: "center",
											}}
										>
											<strong>Người nộp tiền</strong>
											<br /> (Ký & ghi rõ họ tên)
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<iframe
					id="ifmcontentstoprint"
					title="Title"
					style={{
						height: 0,
						width: 0,
						position: "absolute",
						display: "none",
					}}
				/>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		redirect: state.bill.redirect,
		subjects: state.subject.subjects,
		classrooms: state.classroom.classrooms,
		classroomsPerUser: state.classroom.classroomsPerUser,
		userData: state.bill.userData,
		isSearch: state.bill.isSearch,
		classItems: state.bill.classItems,
		classItemCopys: state.bill.classItemsCopy,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			createAdmin,
			listSubject,
			listClassroom,
			listClassroomPerUser,
			resetBillCreateState,
			getUserByCode,
			initItem,
			changeQty,
			billCreate,
			classItemsCopy,
			selectClass,
			disSelectClass,
			resetStateBill,
			addClassToBill,
			changePayType,
		},
		dispatch
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(BillCreate)
);

export default Container;
