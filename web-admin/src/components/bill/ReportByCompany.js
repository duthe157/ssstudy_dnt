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
                <td>{obj.subject.name}</td>
                <td>{obj.name}</td>
                <td className="text-right">{obj.num_bill}</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue_cash)} đ</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue_bank_transfer)} đ</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_refund)} đ</td>
                <td className="text-right">{baseHelpers.currencyFormat(obj.total_revenue)} đ</td>
            </tr>
        );
    }
}

class ReportByCompany extends Component {
    constructor(props) {
        super();
        this.state = {
            billReports: [],
        };
    }

    componentDidMount() {
        console.log('this.props.reports', this.props.reports);
    }

    UNSAFE_componentWillReceiveProps = async (nextProps) => {
        if (this.props.reports != nextProps.reports) {
            this.setState({
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


    renderTotalCancel() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.total_refund) {
                    total += ele.total_refund;
                }
            });
        }
        return total;
    };

    renderTotalRemainung() {
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




    render() {
        return (
            <div>
                <table className='table table-theme table-row v-middle'>
                    <thead className='text-muted'>
                        <tr>
                            <th>Môn</th>
                            <th>Lớp</th>
                            <th className="text-right">Tổng phiếu thu</th>
                            <th className="text-right">Tổng tiền mặt</th>
                            <th className="text-right">Tổng chuyển khoản</th>
                            <th className="text-right">Tổng hoàn hủy</th>
                            <th className="text-right">Còn lại</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="report-parameters">
                            <td></td>
                            <td>
                                Tổng công ty
                            </td>
                            <td className="text-right">
                                {this.renderTotalBill().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
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
                                {this.renderTotalCancel().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "} đ
                            </td>
                            <td className="text-right">
                                {this.renderTotalRemainung().toLocaleString(
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

export default ReportByCompany;