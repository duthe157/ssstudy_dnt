import Item from "antd/lib/list/Item";
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import baseHelpers from "../../helpers/BaseHelpers";
import { connect } from "react-redux";

class Row extends Component {
    constructor(props) {
        super();
        this.state = {};
    }

    render() {
        let { obj } = this.props;
        return (
            <tr className='v-middle table-row-item' data-id={17}>
                <td>{obj.date}</td>
                <td>{obj.subject}</td>
                <td className="text-center">{baseHelpers.currencyFormat(obj.cash)} đ</td>
                <td className="text-center">{baseHelpers.currencyFormat(obj.transfer)} đ</td>
                <td className="text-center">{baseHelpers.currencyFormat(obj.total_revenue)} đ</td>
                <td className="text-center">{baseHelpers.currencyFormat(obj.reufund)} đ</td>
                <td className="text-center">{baseHelpers.currencyFormat(obj.resales)} đ</td>
            </tr>
        );
    }
}

class ReportBySubject extends Component {
    constructor(props) {
        super();
        this.state = {
            billReports: [
                {
                    date: "09/03/2022",
                    subject: "Toán hình",
                    cash: 3200000,
                    transfer: 4200000,
                    total_revenue: 29000000,
                    reufund: 780000,
                    resales: 230000,
                },
                {
                    date: "09/03/2022",
                    subject: "Toán hình",
                    cash: 3200000,
                    transfer: 4200000,
                    total_revenue: 29000000,
                    reufund: 780000,
                    resales: 230000,
                },
                {
                    date: "09/03/2022",
                    subject: "Toán hình",
                    cash: 3200000,
                    transfer: 4200000,
                    total_revenue: 29000000,
                    reufund: 780000,
                    resales: 230000,
                },
                {
                    date: "09/03/2022",
                    subject: "Toán hình",
                    cash: 3200000,
                    transfer: 4200000,
                    total_revenue: 29000000,
                    reufund: 780000,
                    resales: 230000,
                },
                {
                    date: "09/03/2022",
                    subject: "Toán hình",
                    cash: 3200000,
                    transfer: 4200000,
                    total_revenue: 29000000,
                    reufund: 780000,
                    resales: 230000,
                },
            ],
        };
    }

    UNSAFE_componentWillReceiveProps = async (nextProps) => {
    };

    fetchRows() {
        if (this.state.billReports instanceof Array) {
            return this.state.billReports.map((object, index) => {
                return <Row obj={object} key={index} />;
            });
        }
    }

    renderTotalCash() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.cash) {
                    total += ele.cash;
                }
            });
        }
        return total;
    };
    renderTotalTransfer() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.transfer) {
                    total += ele.transfer;
                }
            });
        }
        return total;
    };
    renderTotalRevenue() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.total_revenue) {
                    total += ele.total_revenue;
                }
            });
        }
        return total;
    };
    renderTotalResales() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.resales) {
                    total += ele.resales;
                }
            });
        }
        return total;
    };

    renderTotalRefund() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.reufund) {
                    total += ele.reufund;
                }
            });
        }
        return total;
    };




    render() {
        return (
            <div>
                <table className='table table-theme table-row v-middle'>
                    <thead className='text-muted'>
                        <tr>
                            <th>Ngày</th>
                            <th>Môn học</th>
                            <th className="text-center">Tiền mặt</th>
                            <th className="text-center">Chuyển khoản</th>
                            <th className="text-center">Tổng thu</th>
                            <th className="text-center">Toàn hủy</th>
                            <th className="text-center">Resales</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="report-parameters">
                            <td></td>
                            <td>
                                Tổng môn học
                            </td>
                            <td className="text-center">
                                {this.renderTotalCash().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalTransfer().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalRevenue().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalRefund().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalResales().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>


                        </tr>
                        {this.fetchRows()}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ReportBySubject;