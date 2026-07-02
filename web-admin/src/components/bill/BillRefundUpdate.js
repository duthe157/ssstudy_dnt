import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Moment from "moment";
import { listClassroom, listClassroomPerUser } from "../../redux/classroom/action";
import {
    addClassRefund,
    disSelectClassRefund,
    getUserByCode,
    changeQtyClassRefund,
    updateBill,
    showBillRefund,
    listHistory
} from "../../redux/bill/action";

import { DatePicker } from "antd";
import { isNull } from "lodash";


import { notification, Select } from "antd";
const { Option } = Select;



class Row extends Component {
    constructor(props) {
        super();
        this.state = {
            qty: 0,
            price: 0,
            tienhoan: 0,
        };
    }

    componentDidMount = async () => {
        if (this.props.obj) {
            await this.setState({
                qty: this.props.obj.qty,
                price: this.props.obj.price,
                tienhoan: this.props.obj.price * this.props.obj.qty,
            });
        }
    };

    _onChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;

        await this.setState({
            [name]: value,
        });

        var obj = {
            id: this.props.obj.id,
            code: this.props.obj.code,
            name: this.props.obj.name,
            qty: parseFloat(this.state.qty),
            subject_name: this.props.obj.subject_name,
            total: 0,
        };

        let _price = this.props.obj.price;

        if (name == "tienhoan") {
            _price = parseFloat(value / this.state.qty);
        }

        if (name == "qty") {
            _price = parseFloat(this.state.tienhoan / value);
        }

        obj.price = _price;


        await this.props.changeQtyClassRefund(obj);
    };

    render() {
        const { subject_name, name, sobuoiconlai } = this.props.obj;
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
                        name="sobuoiconlai"
                        value={sobuoiconlai || 0}
                        disabled
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
                        name="tienhoan"
                        min={0}
                        onChange={this._onChange}
                        value={this.state.tienhoan}
                    />
                </td>
                <td className="text-right">
                    <button
                        onClick={(e) =>
                            this.props.disSelectClassRefund(this.props.obj.id, this.props.obj)
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

class BillRefundUpdate extends Component {
    constructor(props) {
        super();
        this.state = {
            user_code: "",
            fullname: "",
            phone: "",
            email: "",
            school: "",
            classroom_id: "",
            payment_method: '',
        };
    }



    async componentDidMount() {
        await this.props.showBillRefund(this.props.match.params.id);
        await this.props.listHistory({ billing_id: this.props.match.params.id });

        if (this.props.bill !== null) {

            const { user } = this.props.bill;
            this.setState({
                payment_method: this.props.bill.payment_method,
            });
            if (user.code !== "") {
                await this.props.listClassroom({
                    limit: 999,
                    user_code: user.code,
                    is_online: false,
                });
                // await this.props.getUserByCode({ code: user.code });

                // if (this.props.classroomsPerUser.length > 0) {
                //     await this.props.initItemEdit(this.props.classroomsPerUser);
                // }
            }
        }
    }

    _onChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;
        await this.setState({
            [name]: value,
        });

    };

    onChangeClassroom(val) {
        this.setState({
            classroom_id: val
        })
    }

    changeDateStart = (date, dateString) => {
        if (date !== null) {
            this.setState({
                from_date: date.format("YYYY/MM/DD HH:mm"),
            });
        }
    };

    changeDateEnd = (date, dateString) => {
        if (date !== null) {
            this.setState({
                to_date: date.format("YYYY/MM/DD HH:mm"),
            });
        }
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        if (this.props.classItemsRefund.length > 0) {
            const data = {
                id: this.props.match.params.id,
                user_id: this.props.bill.user.id,
                code: this.props.bill !== null ? this.props.bill.user.code : null,
                items: this.props.classItemsRefund,
                type: "HOAN_HUY",
                payment_method: this.state.payment_method,
            };

            await this.props.updateBill(data);

            this.props.history.push("/bill-refund");

            // await this._resetState();
            // window.location.href = "/bill/create";
        } else {
            notification.warning({
                message: "Vui lòng chọn lớp",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
        }
    };

    fetchRowsClassroom = () => {
        if (this.props.classrooms instanceof Array) {
            return this.props.classrooms.map((obj, i) => {
                return (
                    <Option key={obj._id.toString()} value={obj._id}>{obj.name}</Option>
                );
            });
        }
    };

    handleChooseClass = async () => {
        if (this.state.classroom_id === "") {
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

            const found = this.props.classItemsRefund
                .map((ele) => ele.id.toString())
                .indexOf(this.state.classroom_id);

            if (found !== 0) {
                if (index >= 0) {
                    var data = {
                        id: this.props.classrooms[index]._id,
                        code: this.props.classrooms[index].code,
                        subject_name: this.props.classrooms[index].subject.name,
                        name: this.props.classrooms[index].name,
                        sobuoiconlai: this.props.classrooms[index].sobuoiconlai ? this.props.classrooms[index].sobuoiconlai : 0,
                    };

                    await this.props.addClassRefund(data);

                    this.setState({ classroom_id: "" });
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

    fetchRows() {
        if (this.props.classItemsRefund instanceof Array) {
            return this.props.classItemsRefund.map((object, i) => {
                return (
                    <Row
                        obj={object}
                        key={object._id}
                        index={i}
                        changeQtyClassRefund={this.props.changeQtyClassRefund}
                        disSelectClassRefund={this.props.disSelectClassRefund}
                    />
                );
            });
        }
    }

    renderTotal = () => {
        let total = 0;
        if (this.props.classItemsRefund.length > 0) {
            this.props.classItemsRefund.forEach((ele) => {
                total += parseFloat(ele.price * ele.qty);
            });
        }
        return total;
    };

    renderTotalPay = () => {
        let total = 0;
        if (this.props.classItemsRefund.length > 0) {
            this.props.classItemsRefund.forEach((ele) => {
                total += parseFloat(ele.price * ele.qty);
            });
        }
        return total;
    };

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



    render() {
        return (
            <div>
                <div className='page-content page-container page-create-refund-ticket' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Phiếu hoàn hủy</h2>
                        <div className="row">
                            <div className="col-md-12 col-sm-12">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>
                                            Phiếu hoàn hủy:{" "}
                                            {!isNull(this.props.bill) && this.props.bill.code}
                                        </strong> - Ngày tạo:{" "}
                                        {this.props.bill &&
                                            Moment(this.props.bill.billed_at).format(
                                                "DD/MM/YYYY HH:mm"
                                            )}
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-8 col-sm-12">
                                                <div className="item-input-text" style={{ alignItems: "end" }}>
                                                    <div className="form-group mb-0" style={{ width: 300 }}>
                                                        <label>
                                                            <strong>Chọn lớp cần hoàn hủy</strong>
                                                        </label>
                                                        <Select
                                                            showSearch
                                                            placeholder="-- Chọn lớp học -- "
                                                            optionFilterProp="children"
                                                            onChange={(val) => this.onChangeClassroom(val)}
                                                            name="classroom_id"
                                                        >
                                                            {this.fetchRowsClassroom()}
                                                        </Select>
                                                    </div>
                                                    <div className="form-group ml-16 mb-0" style={{ width: 300 }}>
                                                        <label>
                                                            <strong>Hình thức thanh toán</strong>
                                                        </label>
                                                        <select
                                                            className="custom-select"
                                                            value={this.state.payment_method}
                                                            name="payment_method"
                                                            onChange={this._onChange}
                                                        >
                                                            <option value="">Chọn hình thức thanh toán</option>
                                                            <option value="SSS_BALANCE">Sử dụng ví SSStudy</option>
                                                            <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                                                            <option value="DIRECTLY">Mua trực tiếp</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        className="ml-16 btn btn-primary"
                                                        onClick={this.handleChooseClass}
                                                    >
                                                        Thêm lớp
                                                    </button>
                                                </div>
                                                <div className="df">
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
                                                                            Lớp học{" "}
                                                                        </th>
                                                                        <th className="text-center">
                                                                            {" "}
                                                                            Số buổi còn lại{" "}
                                                                        </th>
                                                                        <th className="text-center">
                                                                            {" "}
                                                                            Số buổi hoàn{" "}
                                                                        </th>
                                                                        <th className="text-center">
                                                                            {" "}
                                                                            Tiền hoàn (vnđ){" "}
                                                                        </th>
                                                                        <th className="text-right"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>{this.fetchRows()}</tbody>
                                                                <tfoot>
                                                                    {/* <tr>
																		<td colSpan={8}>
																			<strong style={{ paddingBottom: 15, display: 'block' }}>Ghi chú</strong>
																			<textarea name="note"
																				className="form-control"
																				onChange={this._onChange}
																				value={this.state.note} placeholder="Ghi chú"></textarea></td>
																	</tr> */}
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <div className="col-md-9">
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

                                                        <div className="col-md-3 d-flex justify-content-end align-items-center ">
                                                            Tổng tiền hoàn:{" "}
                                                            {!isNaN(this.renderTotalPay())
                                                                ? this.renderTotalPay().toLocaleString(
                                                                    "en-EN",
                                                                    {
                                                                        minimumFractionDigits: 0,
                                                                    }
                                                                )
                                                                : 0}{" "}đ
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-12">
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
                                                                name="user_code"
                                                                value={
                                                                    this.props.bill !== null
                                                                        ? this.props.bill.user_info.code
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
                                                                        ? this.props.bill.user_info.fullname
                                                                        : ""
                                                                }
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <div className="col-sm-5">Email</div>

                                                        <div className="col-md-7">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-theme"
                                                                onChange={this.onChange}
                                                                name="email"
                                                                value={
                                                                    this.props.bill !== null
                                                                        ? this.props.bill.user_info.email
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
                                                                name="phone"
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
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <strong>Lịch sử hoàn hủy</strong>
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
                        <div className="block-action-footer">
                            <button type="button" className="btn-submit ml-16" onClick={(e) => this.handleSubmit(e)}>
                                Cập nhật
                                <img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
                            </button>
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
        userClassroomInfo: state.classroom.userClassroomInfo,
        classItemsRefund: state.bill.classItemsRefund,
        bill: state.bill.bill,
        userData: state.bill.userData,
        classroomsPerUser: state.classroom.classroomsPerUser,
        historyData: state.bill.listHistory,

    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listClassroom, addClassRefund, disSelectClassRefund, getUserByCode, changeQtyClassRefund, updateBill, showBillRefund, listClassroomPerUser, listHistory
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(BillRefundUpdate)
);
