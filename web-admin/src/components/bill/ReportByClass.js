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
                <td>{obj.subject}</td>
                <td>{obj.class_name}</td>
                <td className="text-center">{obj.total_number}</td>
                <td className="text-center">{obj.new_cart}</td>
                <td className="text-center">{obj.renewal_cart}</td>
                <td className="text-center">{obj.not_renewed}</td>
                <td className="text-center">{obj.student_min}</td>
                <td className="text-center">{obj.student_max}</td>
            </tr>
        );
    }
}

class ReportByClass extends Component {
    constructor(props) {
        super();
        this.state = {
            billReports: [
                {
                    subject: "Ngoại ngữ",
                    class_name: "Tiếng anh căn bản 1",
                    total_number: 42,
                    new_cart: 29,
                    renewal_cart: 7,
                    not_renewed: 9,
                    student_min: 67,
                    student_max: 29
                },
                {
                    subject: "Ngoại ngữ",
                    class_name: "Tiếng anh căn bản 1",
                    total_number: 42,
                    new_cart: 29,
                    renewal_cart: 7,
                    not_renewed: 9,
                    student_min: 67,
                    student_max: 29
                },
                {
                    subject: "Ngoại ngữ",
                    class_name: "Tiếng anh căn bản 1",
                    total_number: 42,
                    new_cart: 29,
                    renewal_cart: 7,
                    not_renewed: 9,
                    student_min: 67,
                    student_max: 29
                },

                {
                    subject: "Ngoại ngữ",
                    class_name: "Tiếng anh căn bản 1",
                    total_number: 42,
                    new_cart: 29,
                    renewal_cart: 7,
                    not_renewed: 9,
                    student_min: 67,
                    student_max: 29
                },
                {
                    subject: "Ngoại ngữ",
                    class_name: "Tiếng anh căn bản 1",
                    total_number: 42,
                    new_cart: 29,
                    renewal_cart: 7,
                    not_renewed: 9,
                    student_min: 67,
                    student_max: 29
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

    renderTotalNumber() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.total_number) {
                    total += ele.total_number;
                }
            });
        }
        return total;
    };

    renderTotalNewCart() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.new_cart) {
                    total += ele.new_cart;
                }
            });
        }
        return total;
    };

    renderTotalRenewalCart() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.renewal_cart) {
                    total += ele.renewal_cart;
                }
            });
        }
        return total;
    };

    renderTotalNotRenewed() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.not_renewed) {
                    total += ele.not_renewed;
                }
            });
        }
        return total;
    };

    renderTotalStudentMin() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.student_min) {
                    total += ele.student_min;
                }
            });
        }
        return total;
    };

    renderTotalStudentMax() {
        var total = 0;
        if (this.state.billReports.length > 0) {
            this.state.billReports.forEach((ele) => {
                if (ele.student_max) {
                    total += ele.student_max;
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
                            <th>Tên lớp</th>
                            <th className="text-center">Tổng sĩ số</th>
                            <th className="text-center">Số thẻ tạo mới</th>
                            <th className="text-center">Số thẻ cũ gia hạn</th>
                            <th className="text-center">Chưa gia hạn</th>
                            <th className="text-center">Số HS 0 buổi trong 2 tuần</th>
                            <th className="text-center">Số HS 0 buổi quá 2 tuần</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="report-parameters">
                            <td></td>
                            <td>
                                Tổng lớp học
                            </td>
                            <td className="text-center">
                                {this.renderTotalNumber().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalNewCart().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalRenewalCart().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalNotRenewed().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalStudentMin().toLocaleString(
                                    "en-EN",
                                    {
                                        minimumFractionDigits: 0,
                                    }
                                )}{" "}
                            </td>
                            <td className="text-center">
                                {this.renderTotalStudentMax().toLocaleString(
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

export default ReportByClass;