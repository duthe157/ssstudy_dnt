import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isUndefined } from "util";
import { Select } from "antd";
import Moment from "moment";

import { listSubject } from "../../redux/subject/action";

import {
	listClassroomPerUser,
	listClassroom,
	resetBillCreateState,
} from "../../redux/classroom/action";
import {
	getUserByCode,
	initItem,
	initItemEdit,
	changeQty,
	billCreate,
	showBill,
	updateBill,
	resetStateBill,
	selectClass,
	disSelectClass,
	changePayType,
	addClassToBill,
	listHistory,
} from "../../redux/bill/action";
import { notification } from "antd";
import { isNull } from "lodash";

class RowSelect extends Component {
	constructor(props) {
		super();
		this.state = {
			qty: 0,
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
			note: '',
			discount: 0, // So tien discount Final
			discount_vnd: 0, // So tien discount cho 1 item (Tinh tren total so luong)
			discount_percent: 0, // So tien discount cho 1 item (Tinh tren total )
			discount_type: "PERCENT",
		};
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

	async UNSAFE_componentWillReceiveProps(nextProps) {
		if (nextProps.obj && nextProps.obj.qty !== undefined) {
			const discountType = nextProps.obj.discount_type || "PERCENT";
			const discountValue = parseFloat(nextProps.obj.discount_value) || 0;
			await this.setState({
				qty: nextProps.obj.qty,
				discount_value: discountValue,
				discount_type: discountType,
				discount_vnd: discountType === "FIXED" ? discountValue : 0,
				discount_percent: discountType === "PERCENT" ? discountValue : 0,
			});
		}
	}

	componentDidMount = async () => {
		if (this.props.obj) {
			const discountType = this.props.obj.discount_type || "PERCENT";
			const discountValue = parseFloat(this.props.obj.discount_value) || 0;
			await this.setState({
				qty: this.props.obj.qty,
				price: this.props.obj.price,
				discount: this.state.discount,
				discount_value: discountValue,
				discount_type: discountType,
				discount_vnd:
					discountType === "FIXED" ? discountValue : 0,
				discount_percent:
					discountType === "PERCENT" ? discountValue : 0,
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

		let _total = 0;
		let _discount = 0;
		const price = parseFloat(this.state.price) || 0;
		const qty = parseFloat(this.state.qty) || 0;

		var obj = {
			id: this.props.obj.id,
			code: this.props.obj.code,
			name: this.props.obj.name,
			hp_day: this.props.obj.hp_day,
			price: price,
			qty: qty,
			subject_name: this.props.obj.subject_name,
			discount_type: this.state.discount_type,
			discount_value: parseFloat(this.props.obj.discount_value) || 0,
			discount_vnd: parseFloat(this.state.discount_vnd) || 0,
			discount_percent: parseFloat(this.state.discount_percent) || 0,
			discount: _discount,
			note: this.state.note,
			total: _total,
		};

		if (name === "discount_vnd") {
			const discountVnd = Math.min(subtotal, Math.max(0, parseFloat(value) || 0));
			_discount = discountVnd;
			_total = Math.max(0, price * qty - discountVnd);
			obj.discount_type = "FIXED";
			obj.discount_value = discountVnd;
			obj.discount_vnd = discountVnd;
			obj.discount_percent = 0;
			await this.setState({
				discount: _discount,
				discount_type: "FIXED",
				discount_percent: 0,
				discount_value: discountVnd,
			});
		}

		if (name === "discount_percent") {
			const discountPercent = Math.min(100, Math.max(0, parseFloat(value) || 0));
			_total = Math.max(0, price * qty * (1 - discountPercent / 100));
			_discount = price * qty * (discountPercent / 100);
			obj.discount_type = "PERCENT";
			obj.discount_value = discountPercent;
			obj.discount_vnd = 0;
			obj.discount_percent = discountPercent;
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
		return (
			<tr className="v-middle" data-id={17}>
				<td>{subject_name}</td>
				<td className="flex">{name}</td>
				<td className="" style={styles}>
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

				<td className="" style={styles}>
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
							strokeLineCap="round"
							strokeLinejoin="round"
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

class BillEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			user_code: "",
			classroom_id: "",
			subject_id: "",
			discount: 0,
			discount_value: 0,
			discount_vnd: 0,
			payment_method: 'CASH',
			note: '',
			discount_percent: 0,
			discount_type: "PERCENT",
			pay_type: "1MONTH",
			other_bills: []
		};
	}

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
						let _hp = 0;

						if (!isUndefined(this.props.classrooms[index].hp_day))
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
						subject_name: this.props.classrooms[index].subject.name,
						discount_type: this.state.discount_type,
						discount_value: 0,
						discount: 0,
						discount_vnd: 0,
						discount_percent: 0,
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

	handleSubmit = async (e) => {
		e.preventDefault();
		if (this.props.classItems.length > 0) {
			const data = {
				id: this.props.match.params.id,
				user_id: this.props.bill.user.id,
				code: this.props.bill !== null ? this.props.bill.user.code : null,
				items: this.props.classItems,
				pay_type: this.state.pay_type,
				type: "PT",
				payment_method: this.state.payment_method,
				discount: this.renderDiscount(),
				subtotal: this.renderTotal(),
				total: this.renderTotalPay(),
				note: this.state.note,
			};

			await this.props.updateBill(data);
			this.props.history.push("/bill");
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

	onChangeClassroom = async (value) => {
		await this.setState({
			classroom_id: value,
		});
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
		await this.props.showBill(this.props.match.params.id);
		await this.props.listSubject(this.getDataSubject());
		await this.props.listHistory({ billing_id: this.props.match.params.id });
		await this.props.listClassroom({ limit: 999, is_online: false });
		let _totalItemDiscount = 0;
		if (this.props.bill !== null) {
			for (let i = 0; i < this.props.bill.items.length; i++) {
				if (this.props.bill.items[i].discount_type === "PERCENT") {
					_totalItemDiscount +=
						(this.props.bill.items[i].qty *
							this.props.bill.items[i].price *
							this.props.bill.items[i].discount_value) /
						100;
				} else {
					_totalItemDiscount += this.props.bill.items[i].discount;
				}
			}

			const { user } = this.props.bill;
			this.setState({
				checkAll: false,
				pay_type: this.props.bill.pay_type,
				discount_value: this.props.bill.discount_value,
				payment_method: this.props.bill.payment_method,
				discount: _totalItemDiscount,
				note: this.props.bill.note,
				other_bills: this.props.bill.other_bills
			});
			if (user.code !== "") {
				await this.props.listClassroomPerUser({
					limit: 999,
					user_code: user.code,
					is_online: false,
				});

				if (this.props.classroomsPerUser.length > 0) {
					await this.props.initItemEdit(this.props.classroomsPerUser);
				}
			}
		}
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
						discount_vnd={this.state.discount_vnd}
						discount_percent={this.state.discount_percent}
						discount_type={this.state.discount_type}
						selectClass={this.props.selectClass}
						pay_type={this.state.pay_type}
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
						key={object.id}
						index={i}
						initItem={this.props.initItem}
						changeQty={this.props.changeQty}
						discount_value={this.state.discount_value}
						discount_type={this.state.discount_type}
						discount_vnd={this.state.discount_vnd}
						discount_percent={this.state.discount_percent}
						disSelectClass={this.props.disSelectClass}
						classrooms={this.props.classrooms}
					/>
				);
			});
		}
	}

	fetchRowHistory() {
		if (this.props.historyData instanceof Array) {
			return this.props.historyData.map((obj, i) => {
				return (
					<tr className="v-middle" data-id={17}>
						<td className="text-left">
							{obj.created_at &&
								Moment(obj.created_at).format("DD/MM/YYYY HH:mm:ss")}
						</td>
						<td>{obj.creator.name}</td>
						<td className="flex">{obj.note}</td>
					</tr>
				);
			});
		}
	}

	fetchOtherBill() {
		if (this.state.other_bills instanceof Array) {
			return this.state.other_bills.map((obj, i) => {
				if (i == 0)
				return (
					<div className="v-middle"key={i}>
						<a href={"/bill/" + obj._id + "/edit"} target="_blank">{obj.code}</a> - {(obj.total || 0).toLocaleString("en-EN", { minimumFractionDigits: 0 })}đ - {obj.note}
					</div>
				);
			});
		}
	}

	_handleKeyDown = async (e) => {
		if (e.key === "Enter") {
			let user_code = e.target.value;
			await this.setState({ user_code });
			await this.props.listClassroomPerUser({
				limit: 999,
				user_code,
				is_online: false,
			});
			if (this.props.classroomsPerUser.length > 0) {
				this.props.initItemEdit(this.props.classroomsPerUser);
			}
			await this.props.getUserByCode({ code: user_code });
		}
	};

	componentWillUnmount = () => {
		this.props.resetBillCreateState();
		this.props.resetStateBill();
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
				const item = this.props.classItems[i];
				const qty = parseFloat(item.qty) || 0;
				const price = parseFloat(item.price) || 0;
				const subtotal = qty * price;

				if (item.discount_type === "PERCENT") {
					_discountValue = parseFloat(item.discount_percent) || parseFloat(item.discount_value) || 0;
					_discountValue = Math.min(100, Math.max(0, _discountValue));
					const discountAmount = (qty * price * _discountValue) / 100;
					total += isNaN(discountAmount) ? 0 : Math.min(subtotal, discountAmount);
				} else {
					_discountValue = parseFloat(item.discount_vnd) || parseFloat(item.discount_value) || 0;
					_discountValue = Math.max(0, _discountValue);
					total += isNaN(_discountValue) ? 0 : Math.min(subtotal, _discountValue);
				}
			}
		}

		return isNaN(total) ? 0 : total;
	};

	renderTotalPay = () => {
		let total = 0;
		if (this.props.classItems && this.props.classItems.length > 0) {
			total =
				parseFloat(this.renderTotal()) - parseFloat(this.renderDiscount());
		}
		return Math.max(0, total);
	};

	formatTotalPay = () => {
		const totalPay = this.renderTotalPay();
		if (!isNaN(totalPay)) {
			return `  ${totalPay.toLocaleString("en-EN", {
				minimumFractionDigits: 0,
			})} `;
		}
		return ` 0 `;
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
					return <div key={i}>- {item.name}</div>;
				});
			}
		} else {
			return <div className="text-danger">Chưa đăng kí lớp nào.</div>;
		}
	};

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


	billHistory = () => {
		if (this.props.classItemCopys.length > 0) {
			if (this.props.classItemCopys instanceof Array) {
				return this.props.classItemCopys.map((item, i) => {
					return <div key={i}><div>{item.name}</div><div>{item.note}</div></div>;
				});
			}
		} else {
			return <div className="text-danger">Chưa đăng kí lớp nào.</div>;
		}
	};

	render() {
		let datetime = new Date();
		if (this.props.bill && this.props.bill.billed_at) {
			var day = Moment(this.props.bill.billed_at).format("DD");
			var month = Moment(this.props.bill.billed_at).format("MM");
			var year = Moment(this.props.bill.billed_at).format("YYYY");
		} else {
			var day = datetime.getDay();
			var month = datetime.getMonth() + 1;
			var year = datetime.getFullYear();
		}

		return (
			<div className="page-content page-container" id="page-content">
				<div className="padding">
					<h2 className="text-md text-highlight sss-page-title">Phiếu thu học phí</h2>
					<div className="row">
						<div className="col-md-12">
							<div className="card">
								<div className="card-header">
									<strong>
										Phiếu thu:{" "}
										{!isNull(this.props.bill) && this.props.bill.code}
									</strong>
									- Ngày thu:{" "}
									{this.props.bill &&
										Moment(this.props.bill.billed_at).format(
											"DD/MM/YYYY HH:mm"
										)}
								</div>
								<div className="card-body">
									<div className="row">
										<div className="col-md-9 col-sm-12">
											<div className="bill-box-heading">Đăng ký lớp</div>
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

											<div className="bill-box-heading">Danh sách lớp đã chọn</div>
											<div className="form-group row">
												<div className="col-md-4">
													<select
														name="pay_type"
														className="form-control"
														onChange={this._onChange}
														value={this.state.pay_type}
													>
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
														<option value="">Hình thức thanh toán</option>
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
																<th className="text-left" width="76px">
																	Môn học
																</th>
																<th className="text-left" width="120px">
																	Tên lớp
																</th>
																<th className="text-right">Giá tiền</th>
																<th className="text-right" width="90px">
																	SL
																</th>
																<th className="text-right" width="90px">
																	CK (%)
																</th>
																<th className="text-right">CK (đ)</th>
																<th className="text-right">Thành tiền</th>
																<th className="text-right"></th>
															</tr>
														</thead>
														<tbody>{this.fetchRows()}</tbody>
														<tfoot>
															<tr>
																<td colSpan={8}><textarea name="note"
																	className="form-control"
																	onChange={this._onChange}
																	value={this.state.note} placeholder="Ghi chú">{this.state.note ? this.state.note : ''}</textarea></td>
															</tr>
														</tfoot>
													</table>
												</div>
											</div>

											<div className="form-group row">
												<div className="col-md-3 d-flex justify-content-center align-items-center">
													Tổng tiền:{" "}
													{!isNaN(this.renderTotal())
														? this.renderTotal().toLocaleString("en-EN", {
															minimumFractionDigits: 0,
														})
														: 0}{" "}
													đ
												</div>
												<div className="col-md-3 justify-content-end align-items-center">
													Tổng chiết khấu: (-
													{!isNaN(this.renderDiscount()) && this.renderDiscount() !== 0
														? this.renderDiscount().toLocaleString(
															"en-EN",
															{
																minimumFractionDigits: 0,
															}
														)
														: 0}
													đ )
												</div>
												<div className="col-md-6 d-flex justify-content-end align-items-right">
													<h5>
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
													</h5>
												</div>
												<div>

												</div>
											</div>
										</div>

										<div className="col-md-3 col-sm-12">
											<div className="bill-box-user">
												<div className="bill-box-heading">
													Thông tin học sinh
												</div>
												<div className="form-group row">
													<div className="col-sm-5">Mã học sinh</div>

													<div className="col-md-7">
														<input
															type="text"
															className="form-control form-control-theme"
															placeholder="Mã học sinh"
															onChange={this.onChange}
															name="user_code"
															value={
																this.props.bill !== null
																	? this.props.bill.user.code
																	: ""
															}
															disabled
														/>
													</div>
												</div>
												<div className="form-group row">
													<div className="col-sm-5">Tên học sinh</div>

													<div className="col-md-7">
														<input
															type="text"
															className="form-control form-control-theme"
															placeholder="Tên học sinh"
															onChange={this.onChange}
															name="user_code"
															value={
																this.props.bill !== null
																	? this.props.bill.user.name
																	: ""
															}
															disabled
														/>
													</div>
												</div>
												<div className="form-group row">
													<div className="col-sm-5">SDT</div>

													<div className="col-md-7">
														<input
															type="text"
															className="form-control form-control-theme"
															onChange={this.onChange}
															name="abbbb"
															value={
																this.props.bill !== null
																	? this.props.bill.user_info.phone
																	: ""
															}
															disabled
														/>
													</div>
												</div>
												<div className="form-group row">
													<div className="col-sm-5">Trường</div>

													<div className="col-md-7">
													<input
															type="text"
															className="form-control form-control-theme"
															onChange={this.onChange}
															name="abbasbb"
															value={
																this.props.bill !== null
																	? this.props.bill.user_info.school
																	: ""
															}
															disabled
														/>
													</div>
												</div>
											</div>

											<div className="bill-box-user">
												<div className="bill-box-heading">
													Lớp đã tham gia
												</div>
												<div className="form-group row">
													<div className="col-sm-12">
														{this.classJoined()}
													</div>
												</div>
											</div>

											<div className="bill-box-user">
												<div className="bill-box-heading">
													Phiếu thu gần nhất
												</div>
												<div className="form-group row">
													<div className="col-md-12">
														{this.fetchOtherBill()}
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className="row text-right">
										<div className="col-md-12 col-sm-12">
											{this.props.bill && !this.props.bill.deleted_at ? (
												<button
													className="btn btn-primary mt-2"
													onClick={this.handleSubmit}
												>
													Cập nhật
												</button>
											) : (
												<button className="btn btn-secondary mt-2">
													Phiếu đã hủy
												</button>
											)}

											<button
												className="btn btn-primary mt-2 ml-2"
												onClick={this.print}
											>
												In biên lai
											</button>
										</div>
									</div>

									<iframe
										title="Frame"
										id="ifmcontentstoprint"
										style={{
											height: 0,
											width: 0,
											position: "absolute",
											display: "none",
										}}
									/>

									<div
										className="row"
										id="elePrinted"
										style={{ display: "none" }}
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
														Số:
														{!isNull(this.props.bill) && this.props.bill.code}
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

												<table width="100%">
													<tbody>
														<tr>
															<td>
																<strong>Họ và tên:</strong>
																{this.props.bill !== null
																	? ` ${this.props.bill.user.name}`
																	: ".................................."}
															</td>
															<td>
																<strong>Mã học sinh</strong>:{" "}
																{this.props.bill !== null
																	? ` ${this.props.bill.user.code}`
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
												{this.state.items != "" ? (
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
																<strong>Chiết khấu</strong>:
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
																{this.formatTotalPay()}
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
																<br /> (Ký &amp; ghi rõ họ tên)
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
																<br /> (Ký &amp; ghi rõ họ tên)
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="card">
								<div className="card-header">
									<strong>Lịch sử phiếu thu</strong>
								</div>
								<div className="card-body">
									<table className="table table-theme table-row v-middle">
										<thead className="text-muted">
											<tr>
												<th className="text-left">Thời gian</th>
												<th className="text-left">Người thao tác</th>
												<th width="300">Nội dung</th>
											</tr>
										</thead>
										<tbody>{this.fetchRowHistory()}</tbody>
									</table>
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
		bill: state.bill.bill,
		historyData: state.bill.listHistory,
		redirect: state.student.redirect,
		subjects: state.subject.subjects,
		classrooms: state.classroom.classrooms,
		classroomsPerUser: state.classroom.classroomsPerUser,
		userData: state.bill.userData,
		classItems: state.bill.classItems,
		classItemCopys: state.bill.classItemsCopy,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listSubject,
			listClassroom,
			listClassroomPerUser,
			resetBillCreateState,
			getUserByCode,
			initItem,
			changeQty,
			billCreate,
			showBill,
			updateBill,
			resetStateBill,
			initItemEdit,
			selectClass,
			disSelectClass,
			changePayType,
			addClassToBill,
			listHistory,
		},
		dispatch
	);
}

let BillEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(BillEdit)
);

export default BillEditContainer;
