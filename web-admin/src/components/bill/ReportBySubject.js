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
                <td>{obj.name}</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue_cash)} đ</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue_bank_transfer)} đ</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_refund)} đ</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue)} đ</td>
            </tr>
        );
    }
}

class ReportBySubject extends Component {
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

    renderTotalRefund() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.total_refund) {
                    total += ele.total;
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
                            <th>Môn học</th>
                            <th className="text-right">Tiền mặt</th>
                            <th className="text-right">Chuyển khoản</th>
                            <th className="text-right">Hoàn hủy</th>
                            <th className="text-right">Còn lại</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="report-parameters">
                            <td>
                                Tổng môn học
                            </td>
                            <td className="text-right">
                                {this.renderTotalCash().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}đ
                            </td>
                            <td className="text-right">
                                {this.renderTotalTransfer().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}đ
                            </td>
                            <td className="text-right">
                                {this.renderTotalRefund().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}đ
                            </td>
                            <td className="text-right">
                                {this.renderTotalRevenue().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}đ
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