import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import { CSVLink } from "react-csv";
import Highcharts from "highcharts/highstock";
import PieChart from "highcharts-react-official";

import { listClass, reportClass, ShowExam } from "../../../redux/exam/action";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

class ExamReport extends Component {
  constructor(props) {
    super();
    this.state = {
      classroom_id: "",
      classroom_code: "",
      classroom_name: "",
      examReportData: [],
      file_name: "BangDiem",
    };
  }

  onChange = async (e) => {
    var name = e.target.name;
    var value = e.target.value;
    const _dataBangDiem = [];
    const arrayUserTesting = [];
    await this.setState({
      [name]: value,
      examReportData: [],
    });
    const data = {
      id: this.props.match.params.id,
      classroom_id: value,
    };
    await this.props.reportClass(data);

    if (name === "classroom_id") {
      if (this.props.classList instanceof Array) {
        for (let i = 0; i < this.props.classList.length; i++) {
          if (value == this.props.classList[i].classroom.id) {
            this.setState({
              classroom_code: this.props.classList[i].classroom.code,
              classroom_name: this.props.classList[i].classroom.name,
              file_name: "BangDiem-" + this.props.classList[i].classroom.code,
            });
          }
        }
      }
    }

    if (
      this.props.reportData !== null &&
      this.props.reportData.testings instanceof Array
    ) {
      for (let i = 0; i < this.props.reportData.testings.length; i++) {
        arrayUserTesting.push(this.props.reportData.testings[i].user.id);
        const _userExam = {
          MaDe: this.props.exam ? this.props.exam.exam.code : "",
          TenDe: this.props.exam ? this.props.exam.exam.name : "",
          MaHS: "'" + this.props.reportData.testings[i].user.code.toString(),
          TenHS: this.props.reportData.testings[i].user.name.toString(),
          MonHoc: this.props.exam ? this.props.exam.exam.subject.name : "",
          LopHoc: this.state.classroom_name,
          Diem: this.props.reportData.testings[i].point,
          NgayNop: this.props.reportData.testings[i].created_at
            ? moment(this.props.reportData.testings[i].created_at).format(
                "DD/MM/YYYY HH:mm"
              )
            : "",
        };
        _dataBangDiem.push(_userExam);
      }
    }

    if (
      this.props.reportData !== null &&
      this.props.reportData.students instanceof Array
    ) {
      for (let i = 0; i < this.props.reportData.students.length; i++) {
        const index = arrayUserTesting.indexOf(
          this.props.reportData.students[i].user.id
        );
        if (index < 0) {
          const _userExam = {
            MaDe: this.props.exam ? this.props.exam.exam.code : "",
            TenDe: this.props.exam ? this.props.exam.exam.name : "",
            MaHS: "'" + this.props.reportData.students[i].user.code.toString(),
            TenHS: this.props.reportData.students[i].user.name.toString(),
            MonHoc: this.props.exam ? this.props.exam.exam.subject.name : "",
            LopHoc: this.props.reportData.students[i].classroom.name,
            Diem: 0,
            NgayNop: "",
          };
          _dataBangDiem.push(_userExam);
        }
      }
    }

    this.setState({
      examReportData: _dataBangDiem,
    });
  };

  handleSubmit = async () => {};

  async componentDidMount() {
    await this.props.listClass({ exam_id: this.props.match.params.id });
    await this.props.ShowExam(this.props.match.params.id);
  }

  fetchRowsClass() {
    if (this.props.classList instanceof Array) {
      return this.props.classList.map((obj, i) => {
        return (
          <option value={obj.classroom.id} key={obj.classroom.id.toString()}>
            {obj.classroom.name}
          </option>
        );
      });
    }
  }

  fetchRowsUser() {
    if (
      this.props.reportData != null &&
      this.props.reportData.testings instanceof Array
    ) {
      return this.props.reportData.testings.map((obj, i) => {
        return (
          <tr>
            <td
              width={50}
              style={{
                textAlign: "center",
              }}
            >
              {i + 1}
            </td>
            <td className="d-flex justify-content-start align-items-center">
              <span
                className="avatar gd-primary mr-2"
                data-toggle-class="loading"
                style={{
                  width: 30,
                }}
              ></span>
              <span>{obj.user.name}</span>
            </td>
            <td>
              <span
                className="avatar gd-primary mr-2"
                data-toggle-class="loading"
                style={{
                  width: 30,
                }}
              ></span>
              <span>{obj.user.code}</span>
            </td>
            <td
              style={{
                textAlign: "center",
              }}
            >
              {obj.point}
            </td>
            <td
              style={{
                textAlign: "center",
                width: 150,
              }}
            >
              <span>
                {obj.created_at
                  ? moment(obj.created_at).format("DD/MM/YYYY HH:mm")
                  : ""}
              </span>
            </td>
          </tr>
        );
      });
    }
  }

  fetchRowsUserNoExam() {
    const arrayUserTesting = [];
    const studentNotExam = [];
    if (
      this.props.reportData !== null &&
      this.props.reportData.testings instanceof Array
    ) {
      for (let i = 0; i < this.props.reportData.testings.length; i++) {
        arrayUserTesting.push(this.props.reportData.testings[i].user.id);
      }
    }

    if (
      this.props.reportData !== null &&
      this.props.reportData.students instanceof Array
    ) {
      for (let i = 0; i < this.props.reportData.students.length; i++) {
        const index = arrayUserTesting.indexOf(
          this.props.reportData.students[i].user.id
        );
        if (index < 0) {
          studentNotExam.push(this.props.reportData.students[i]);
        }
      }
    }

    if (studentNotExam instanceof Array) {
      return studentNotExam.map((obj, i) => {
        return (
          <tr key={i}>
            <td
              width={50}
              style={{
                textAlign: "center",
              }}
            >
              {i + 1}
            </td>
            <td>
              <span
                className="avatar gd-primary mr-2"
                data-toggle-class="loading"
                style={{
                  width: 30,
                }}
              ></span>
              <span>{obj.user.name}</span>
            </td>
            <td>
              <span
                className="avatar gd-primary mr-2"
                data-toggle-class="loading"
                style={{
                  width: 30,
                }}
              ></span>
              <span>{obj.user.code}</span>
            </td>
          </tr>
        );
      });
    }
  }

  fetchParams = () => {
    if (
      this.props.reportData != null &&
      this.props.reportData.testings instanceof Array
    ) {
      return this.props.reportData.testing_questions.map((obj, i) => {
        var { total_right, total_wrong, question_code } = obj;
        var total =
          parseInt(total_right) + parseInt(total_wrong) !== 0
            ? parseInt(total_right) + parseInt(total_wrong)
            : 1;
        return (
          <div className="widget-result-item d-flex flex-row justify-content-start align-items-center">
            <div className="widget-result-item-left">
              Câu {i + 1}: <b>{question_code}</b>
            </div>
            <div className="widget-result-item-right d-flex flex-column justify-content-start align-items-center">
              <div className="top-widget">{total_right}</div>
              <div className="top-widget">{total_wrong}</div>
            </div>
            <div className="widget-result-item-right d-flex flex-column justify-content-start align-items-center">
              <div className="top-widget">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#31c971"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-check mx-2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="top-widget">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="red"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-x mx-2"
                >
                  <line x1={18} y1={6} x2={6} y2={18} />
                  <line x1={6} y1={6} x2={18} y2={18} />
                </svg>
              </div>
            </div>
            <div
              className="widget-result-item-right1 d-flex flex-column justify-content-between align-items-start"
              style={{
                height: 30,
              }}
            >
              <div className="top-widget">
                <div
                  className="progress-true"
                  style={{
                    width: (total_right / total) * 500,
                    height: 5,
                    borderRadius: 5,
                    backgroundColor: "#31c971",
                  }}
                ></div>
              </div>
              <div className="top-widget">
                <div
                  className="progress-false"
                  style={{
                    width: (total_wrong / total) * 500,
                    height: 5,
                    borderRadius: 5,
                    backgroundColor: "red",
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      });
    }
  };

  renderChart = () => {
    var data = null;

    let initOptions = {
      title: "Phân bố điểm",
      chart: {
        type: "pie",
      },
      series: [
        {
          name: "Tổng",
          colorByPoint: true,
          data: [],
        },
      ],
    };

    if (this.props.reportData !== null) {
      initOptions = {
        ...initOptions,
        series: [
          {
            name: "Tổng",
            colorByPoint: true,
            data: [
              {
                name: "Lớn hơn 9 điểm",
                y: this.props.reportData.f9,
                color: "#0088FE",
              },
              {
                name: "Từ 8 - 9",
                y: this.props.reportData.f89,
                color: "#00C49F",
              },
              {
                name: "Từ 6,5 - 8",
                y: this.props.reportData.f658,
                color: "#FFBB28",
              },
              {
                name: "Nhỏ hơn 6,5",
                y: this.props.reportData.l65,
                color: "#FF8042",
              },
              {
                name: "Chưa làm",
                y: this.props.reportData.cl,
                color: "lightgray",
              },
            ],
          },
        ],
      };
    }

    return <PieChart highcharts={Highcharts} options={initOptions} />;
  };

  compare(a, b) {
    const _a = a.point;
    const _b = b.point;

    let comparison = 0;
    if (_a < _b) {
      comparison = 1;
    } else if (_a > _b) {
      comparison = -1;
    }
    return comparison;
  }

  topFive = () => {
    if (
      this.props.reportData != null &&
      this.props.reportData.testings instanceof Array
    ) {
      var data = this.props.reportData.testings.sort(this.compare);
      var dataNew = data.slice(0, 5);
      return dataNew.map((obj, i) => {
        return (
          <tr>
            <td
              width={50}
              style={{
                textAlign: "center",
              }}
            >
              {i + 1}
            </td>
            <td>
              <span>{obj.user.name}</span>
            </td>
            <td
              style={{
                textAlign: "center",
              }}
            >
              {obj.point}
            </td>
          </tr>
        );
      });
    }
  };

  render() {
    return (
      <div>
        {/* <div className="page-hero page-container" id="page-hero">
          <div className="padding d-flex">
            <div className="page-title">
              <h2 className="text-md text-highlight">Báo cáo</h2>
            </div>
            <div className="flex" />
            <div>
              <Link to={"/exam"} className="btn btn-sm text-white btn-primary">
                <span className="d-none d-sm-inline mx-1">Quay lại</span>
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
                  className="feather feather-arrow-right"
                >
                  <line x1={5} y1={12} x2={19} y2={12} />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div> */}

        <div className="page-content page-container" id="page-content">
          <div className="padding">
            <div className="row mb-3">
              <div className="col-md-12">
                <div className="toolbar">
                  <div className="input-group">
                    <select
                      className="custom-select mr-2"
                      value={this.state.classroom_id}
                      name="classroom_id"
                      onChange={this.onChange}
                      style={{ maxWidth: 400 }}
                    >
                      <option value="">-- Chọn lớp --</option>
                      {this.fetchRowsClass()}
                    </select>
                    {this.state.examReportData &&
                    this.state.examReportData.length > 0 ? (
                      <CSVLink
                        filename={
                          this.state.file_name +
                          "-" +
                          new Date().getTime() +
                          ".csv"
                        }
                        className="btn btn-sm"
                        data={this.state.examReportData}
                      >
                        Xuất Excel
                      </CSVLink>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>

            {this.props.reportData !== null ? (
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="b-b">
                      <div className="nav-active-border b-primary bottom">
                        <ul className="nav" id="myTab" role="tablist">
                          <li className="nav-item">
                            <a
                              className="nav-link active"
                              id="home-tab"
                              data-toggle="tab"
                              href="#dashboard"
                              role="tab"
                              aria-controls="dashboard"
                              aria-selected="true"
                            >
                              Tổng quan
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              id="score-tab"
                              data-toggle="tab"
                              href="#score"
                              role="tab"
                              aria-controls="profile"
                              aria-selected="false"
                            >
                              Bảng điểm
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              id="score-tab"
                              data-toggle="tab"
                              href="#chualam"
                              role="tab"
                              aria-controls="profile"
                              aria-selected="false"
                            >
                              Học sinh chưa làm bài
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              id="params-tab"
                              data-toggle="tab"
                              href="#params"
                              role="tab"
                              aria-controls="params"
                              aria-selected="false"
                            >
                              Thông số câu
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="tab-content p-3">
                      <div
                        className="tab-pane fade active show"
                        id="dashboard"
                        role="tabpanel"
                        aria-labelledby="dashboard-tab"
                      >
                        <div className="row">
                          <div className="col-md-6">
                            <div className="widget-spread">
                              <div className="widget-average-top1 d-flex justify-content-around align-items-center">
                                Phân bố điểm
                              </div>
                              <div className="row widget-average-bottom1 d-flex flex-row justify-content-start align-items-center">
                                <div className="col-md-8 col-sm-12 widget-container">
                                  {this.renderChart()}
                                </div>
                                <div className="col-md-4 col-sm-12 widget-info d-flex flex-column justify-content-start align-items-start">
                                  <div className="item-info">
                                    <div
                                      className="box-info"
                                      style={{
                                        backgroundColor: "#0088FE",
                                      }}
                                    ></div>{" "}
                                    Lớn hơn 9
                                  </div>
                                  <div className="item-info">
                                    <div
                                      className="box-info"
                                      style={{
                                        backgroundColor: "#00C49F",
                                      }}
                                    ></div>{" "}
                                    Từ 8 - 9
                                  </div>
                                  <div className="item-info">
                                    <div
                                      className="box-info"
                                      style={{
                                        backgroundColor: "#FFBB28",
                                      }}
                                    ></div>{" "}
                                    Từ 6,5 - 8
                                  </div>
                                  <div className="item-info">
                                    <div
                                      className="box-info"
                                      style={{
                                        backgroundColor: "#FF8042",
                                      }}
                                    ></div>{" "}
                                    Nhỏ hơn 6,5
                                  </div>
                                  <div className="item-info">
                                    <div
                                      className="box-info"
                                      style={{
                                        backgroundColor: "lightgray",
                                      }}
                                    ></div>{" "}
                                    Chưa làm
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="row mb-5">
                              <div className="col-md-6">
                                <div className="widget-average">
                                  <div className="widget-average-top d-flex justify-content-around align-items-center">
                                    <span>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={30}
                                        height={30}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="red"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-star mx-2"
                                      >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                      </svg>
                                    </span>
                                    <span>Điểm trung bình</span>
                                  </div>
                                  <div className="widget-average-bottom d-flex justify-content-center align-items-center">
                                    <span
                                      style={{
                                        fontWeight: 700,
                                        fontSize: 45,
                                        color: "#007bff",
                                      }}
                                    >
                                      {" "}
                                      {this.props.reportData !== null
                                        ? this.props.reportData.avg_point
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="widget-average">
                                  <div className="widget-average-top d-flex justify-content-around align-items-center">
                                    <span>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={30}
                                        height={30}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#007bff"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-users mx-2"
                                      >
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx={9} cy={7} r={4} />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                      </svg>
                                    </span>
                                    <span>Học sinh đã làm</span>
                                  </div>
                                  <div className="widget-average-bottom d-flex justify-content-center align-items-center">
                                    <span
                                      style={{
                                        fontWeight: 700,
                                        fontSize: 45,
                                        color: "#007bff",
                                      }}
                                    >
                                      {" "}
                                      {this.props.reportData !== null
                                        ? this.props.reportData.total_testing
                                        : 0}
                                      /
                                      {this.props.reportData !== null
                                        ? this.props.reportData.total_student
                                        : 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-md-12">
                                <div className="widget-average-board">
                                  <div className="widget-average-top d-flex justify-content-start align-items-center">
                                    <span className="mr-1">Học sinh làm</span>{" "}
                                    <strong
                                      style={{
                                        color: "#0088FE",
                                      }}
                                    >
                                      Tốt
                                    </strong>
                                  </div>
                                  <div className="widget-average-bottom d-flex justify-content-center align-items-center">
                                    <table className="table table-striped">
                                      <thead>
                                        <tr>
                                          <th
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            STT
                                          </th>
                                          <th>Học sinh</th>
                                          <th
                                            width={90}
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            Điểm TB
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>{this.topFive()}</tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="tab-pane fade"
                        id="score"
                        role="tabpanel"
                        aria-labelledby="score-tab"
                      >
                        <table className="table table-striped table-score">
                          <thead>
                            <tr>
                              <th
                                style={{
                                  textAlign: "center",
                                  verticalAlign: "inherit",
                                }}
                              >
                                STT
                              </th>
                              <th>Tên học sinh</th>
                              <th>Mã học sinh</th>
                              <th
                                width={90}
                                style={{
                                  textAlign: "center",
                                }}
                              >
                                Điểm
                              </th>
                              <th
                                width={150}
                                style={{
                                  textAlign: "center",
                                }}
                              >
                                Thời gian
                              </th>
                            </tr>
                          </thead>
                          <tbody>{this.fetchRowsUser()}</tbody>
                        </table>
                      </div>
                      <div
                        className="tab-pane fade"
                        id="chualam"
                        role="tabpanel"
                        aria-labelledby="chualam-tab"
                      >
                        <table className="table table-striped table-chualam">
                          <thead>
                            <tr>
                              <th
                                style={{
                                  textAlign: "center",
                                  verticalAlign: "inherit",
                                }}
                              >
                                STT
                              </th>
                              <th>Tên học sinh</th>
                              <th>Mã học sinh</th>
                            </tr>
                          </thead>
                          <tbody>{this.fetchRowsUserNoExam()}</tbody>
                        </table>
                      </div>
                      <div
                        className="tab-pane fade"
                        id="params"
                        role="tabpanel"
                        aria-labelledby="params-tab"
                      >
                        {this.fetchParams()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    classList: state.exam.classList,
    reportData: state.exam.reportClass,
    exam: state.exam.exam,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ listClass, reportClass, ShowExam }, dispatch);
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ExamReport)
);
