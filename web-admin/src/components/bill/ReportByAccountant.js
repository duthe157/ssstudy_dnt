import React, { Component } from "react";
import baseHelpers from "../../helpers/BaseHelpers";

class Row extends Component {
    constructor(props) {
        super();
        this.state = {};
    }

    render() {
        let { obj } = this.props;
        return (
            <tr className='v-middle table-row-item' data-id={17}>
                <td>{obj.fullname}</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue_cash)} đ</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue_bank_transfer)} đ</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.num_bill)}</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue)} đ</td>
            </tr>
        );
    }
}

class ReportByAccountant extends Component {
    constructor(props) {
        super();
        this.state = {
            billReports: [],
        };
    }

    UNSAFE_componentWillReceiveProps = async (nextProps) => {
        if (this.props.reports != nextProps.reports) {
            await this.setState({
                billReports: nextProps.reports
            })
        }
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
                if (ele.total_revenue_cash) {
                    total += ele.total_revenue_cash;
                }
            });
        }
        return total;
    };
    renderTotalTransfer() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.total_revenue_bank_transfer) {
                    total += ele.total_revenue_bank_transfer;
                }
            });
        }
        return total;
    };
    renderTotalBill() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.num_bill) {
                    total += ele.num_bill;
                }
            });
        }
        return total;
    };
    renderTotalRevenueToday() {
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
    renderTotalReceiptMonth() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.receipt_month) {
                    total += ele.receipt_month;
                }
            });
        }
        return total;
    };
    renderTotalRevenueMonth() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.revenue_month) {
                    total += ele.revenue_month;
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
                            <th>Nhân viên</th>
                            <th className="text-right">Tiền mặt</th>
                            <th className="text-right">Chuyển khoản</th>
                            <th className="text-right">Số phiếu thu</th>
                            <th className="text-right">Tổng doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="report-parameters">
                            <td>
                            </td>
                            <td className="text-right">
                                {this.renderTotalCash().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "} đ
                            </td>
                            <td className="text-right">
                                {this.renderTotalTransfer().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "} đ
                            </td>
                            <td className="text-right">
                                {this.renderTotalBill().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "} đ
                            </td>
                            <td className="text-right">
                                {this.renderTotalRevenueToday().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "} đ
                            </td>


                        </tr>
                        {this.fetchRows()}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ReportByAccountant;