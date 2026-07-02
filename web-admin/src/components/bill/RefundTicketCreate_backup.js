import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { DatePicker } from "antd";
import { moment } from "moment";

class RefunTicketCreate extends Component {
    constructor(props) {
        super();
        this.state = {
            data: [],
            limit: "",
            ids: [],
            code: "",
            phone: "",
            staff: "",
            from_date: null,
            to_date: null,
            card_id: "",
            phone: "",
            fullname: "",
            payment_method: "",
            refund_price: "",
            refund_num: "",
            refund_price: "",
            reason_refund: "",
            checkAll: false,
        };
    }



    async componentDidMount() {
    }

    _onChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;
        let checked = e.target.checked;
        let avtPreview = "";

        if (name === "is_featured" || name === "status") {
            value = checked;
        }

        if (name === "files") {

            value = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(e.target.files[0]);
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.onerror = (error) => reject(error);
            });
            value = [value];
            this.setState({
                [name]: value,
            });
        } else {
            this.setState({
                [name]: value,
            });
        }

    };

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

    handleSubmit = () => {
        console.log('submit data...................',123)
    }


    render() {
        return (
            <div>
                <div className='page-content page-container page-create-refund-ticket' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Tạo phiếu hoàn hủy</h2>
                        <div className="block-item-content header">
                            <div className="block-title-actions">
                                <div className="form-group mb-0 mr-32">
                                    <label className="title-block mb-0 mr-16">Mã học sinh</label>
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="code"
                                            onChange={this._onChange}
                                            value={this.state.code}
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-0 mr-32">
                                    <label className="title-block mb-0 mr-16">Số điện thoại</label>
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            onChange={this._onChange}
                                            value={this.state.phone}
                                        />
                                    </div>
                                </div>
                                <div className='btn-filter ml-16'>
                                    <button type='sumbit'>
                                        <span>Thêm thông tin</span>
                                        <img src='/assets/img/icon-add.svg' className='ml-10' alt='' />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="block-item-content">
                            <h3 className="title-block">Phiếu thu</h3>
                            <div className="form-group mb-0">
                                <label className="text-form-label ">Nhân viên</label>
                                <div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="staff"
                                        onChange={this._onChange}
                                        value={this.state.staff}
                                    />
                                </div>
                            </div>
                            <div className="item-input-text mt-18">
                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label ">Ngày tạo phiếu</label>
                                    <div>
                                        <DatePicker
                                            format={
                                                "YYYY/MM/DD HH:mm"
                                            }
                                            value={this.state.from_date
                                                ? moment(this.state.from_date)
                                                : null}
                                            showTime={{ format: 'HH:mm' }}
                                            placeholder="Từ ngày"
                                            onChange={this.changeDateStart}
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label ">Mã thẻ</label>
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="cart_id"
                                            onChange={this._onChange}
                                            value={this.state.cart_id}
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label ">Số điện thoại</label>
                                    <div>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="phone"
                                            onChange={this._onChange}
                                            value={this.state.phone}
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label ">Họ và tên</label>
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="fullname"
                                            onChange={this._onChange}
                                            value={this.state.fullname}
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label ">Hình thức đóng tiền đơn cũ</label>
                                    <div>
                                        <select
                                            className="custom-select"
                                            value={this.state.payment_method}
                                            name="payment_method"
                                            onChange={this._onChange}
                                        >
                                            <option value="">Chọn phương thức</option>
                                            <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                                            <option value="COD">Giao hàng nhận tiền</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="block-item-content" style={{ display: "flex" }}>
                            <div className="block-content-left">
                                <div className="flex">
                                    <label className="text-form-label mb-0 mr-8">Số tiền hoàn</label>
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="refund_price"
                                            onChange={this._onChange}
                                            value={this.state.refund_price}
                                        />
                                    </div>
                                </div>
                                <div className="flex">
                                    <label className="text-form-label mb-0 mr-8">Số buổi hoàn</label>
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="refund_num"
                                            onChange={this._onChange}
                                            value={this.state.refund_num}
                                        />
                                    </div>
                                </div>
                                <div className="flex">
                                    <label className="text-form-label mb-0 mr-8">Hình thức hoàn</label>
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="refund_method"
                                            onChange={this._onChange}
                                            value={this.state.refund_method}
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="text-form-label ">Lý do doàn</label>
                                    <div>
                                        <select
                                            className="custom-select"
                                            value={this.state.reason_refund}
                                            name="reason_refund"
                                            onChange={this._onChange}
                                        >
                                            <option value="">Chọn lý do</option>
                                            <option value="1">Không đạt yêu cầu</option>
                                            <option value="2">Không đủ giáo trình</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="block-content-right">
                                <div className="form-group mb-0">
                                    <label className="text-form-label ">Lý do doàn</label>
                                    <div>
                                        <textarea
                                            type="text"
                                            name="reason_refund"
                                            value={this.state.reason_refund}
                                            onChange={this._onChange}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="block-action-footer">
                            <button type="button" className="btn-cancel">
                                <img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
                                Hủy
                            </button>
                            <button type="button" className="btn-submit ml-16" onClick={() => this.handleSubmit()}>
                                Tạo mới
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
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(RefunTicketCreate)
);
