import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Select, Button, Card, Typography, Input, Row, Col } from "antd";
import { bindActionCreators } from "redux";
import {
  createLinkPayment,
  listCourses,
  listTeacher,
} from "../../redux/linkPaymentCreate/action";
import { getStudentDetail, resetStudentDetail } from "../../redux/linkPaymentCreate/action";
const { Option } = Select;
const { Text } = Typography;

class LinkPaymentCreate extends Component {
  constructor(props) {
    super();
    this.state = {
      level: null,
      teacherId: null,
      classroomId: [],
      email: "",
      phone: "",
      classroomSelected: [],
      studentRegistration: null,
    };
    this.searchTimeout = null;
  }

  async componentDidMount() {
    this.props.listTeacher();
  }

  _handleSubmit = async () => {
    const { phone, email } = this.state;
    const payload = {
      student: {
        phone: phone,
        email: email,
      },
      courses: [...this.state.classroomSelected],
    };
    await this.props.createLinkPayment(payload);
    if (this.props.dataCreateLinkPayment) {
      this.props.history.push({
        pathname: "/quick-payments",
        state: { data: this.props.dataCreateLinkPayment },
      });
    }
  };

  handleChangeClassroomId = (value) => {
    this.setState({
      classroomId: value,
    });
    const coursesSelected = this.props.courses
      .filter((course) => value.includes(course._id))
      .map((item) => {
        return {
          name: item.name,
          id: item._id,
          origin_price: item.origin_price,
          price: item.price,
          update_price: item.price,
        };
      });
    this.setState({
      classroomSelected: [...coursesSelected],
    });
  };

  handleChangeAdjustPrice = (courseId, value) => {
    const updated = this.state.classroomSelected.map((course) => {
      if (course.id === courseId && course.update_price !== value) {
        return { ...course, update_price: value };
      }
      return course;
    });
    this.setState({ classroomSelected: updated });
  };

  handleChangeTeacher = async (e) => {
    this.setState({classroomId: [], classroomSelected: []})
    var name = e.target.name;
    var value = e.target.value;
    if (name === "teacherId") {
      this.setState({
        teacherId: value,
      });
    }
   if (value) {
    await this.props.listCourses({ teacher_id: value });
   }
  };

  handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value, accountStatus: null }, () => {
      const { email, phone } = this.state;
      // Huỷ timeout cũ nếu có
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      if (!email || !phone) {
        this.props.resetStudentDetail();
        this.setState({ studentRegistration: null });
      } else {
        // Chỉ debounce nếu cả hai field đã có dữ liệu
        this.searchTimeout = setTimeout(async () => {
          await this.props.getStudentDetail({ email, phone });
          this.setState({
            studentRegistration: this.props.student
          })
        }, 500); // 500ms debounce
      }
    });
  };

  handleRemoveCourseRegister = (courseId) => {
    const classroomId = this.state.classroomId.filter((id) => id !== courseId);
    const classroomSelected = this.state.classroomSelected.filter(
      (item) => item.id !== courseId
    );
    this.setState({
      classroomId: classroomId,
      classroomSelected: classroomSelected,
    });
  };

  fetchTeachertRows() {
    if (this.props.teachers instanceof Array) {
      return this.props.teachers.map((obj, i) => {
        return (
          <option key={i} value={obj._id}>
            {obj.fullname}
          </option>
        );
      });
    }
  }

  fetchCoursesRows() {
    if (this.props.courses instanceof Array && this.state.teacherId) {
      return this.props.courses.map((obj) => {
        return (
          <Option key={obj._id} value={obj._id}>
            {obj.name}
          </Option>
        );
      });
    }
  }

  render() {
    return (
      <div className="page-content page-container" id="page-content">
        <div className="padding">
          <h2 className="text-md text-highlight sss-page-title">
            Tạo Liên Kết Thanh Toán Mới
          </h2>
          <div style={{ display: "flex" }}>
            <div style={{ width: "60%", margin: "0 auto" }}>
              <h4
                style={{ fontWeight: 600, color: "#f57224", marginBottom: 20 }}
              >
                Tạo link thanh toán nhanh
              </h4>

              {/* --- Thông tin học sinh --- */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontWeight: 600 }}>Thông tin học sinh</h3>
                <p style={{ color: "#888" }}>
                  Nhập số điện thoại và email để tìm kiếm học sinh hiện có hoặc
                  tạo mới
                </p>

                <div style={{ display: "flex", gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="text-form-label">Email</label>
                    <input
                      type="text"
                      className="form-control form-control-theme"
                      placeholder="Email..."
                      name="email"
                      onChange={this.handleChange}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="text-form-label">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control form-control-theme"
                      placeholder="SĐT"
                      name="phone"
                      onChange={this.handleChange}
                    />
                  </div>
                </div>

                {(this.props.studentDetailMessage || this.state.studentRegistration) ? (
                  <div
                    style={{
                      background: "#fff6f1",
                      border: "1px solid #fba88f",
                      borderRadius: 4,
                      padding: 12,
                      marginTop: 12,
                      fontSize: 13,
                      color: "#f57224",
                      whiteSpace: "pre-line",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      {this.props.studentDetailMessage ||
                        (this.state.studentRegistration
                          ? `${this.state.studentRegistration.fullname} - Mã: ${this.state.studentRegistration.code}`
                          : "Tài khoản mới - Hệ thống sẽ tự động tạo tài khoản ở trạng thái chờ")}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* --- Lựa chọn khóa học --- */}
              <div>
                <h3 style={{ fontWeight: 600 }}>Lựa chọn khoá học</h3>
                <p style={{ color: "#888" }}>
                  Chọn các khoá học mà học sinh muốn đăng ký
                </p>

                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="text-form-label">Cấp học</label>
                    <select
                      className="custom-select"
                      value={this.state.level || ""}
                      name="level"
                      onChange={this.handleChange}
                    >
                      <option value="">-- Chọn cấp học --</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Lớp {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="text-form-label">Giáo viên</label>
                    <select
                      className="custom-select"
                      value={this.state.teacherId || ""}
                      name="teacherId"
                      onChange={this.handleChangeTeacher}
                    >
                      <option value={""}>-- Chọn giáo viên --</option>
                      {this.fetchTeachertRows()}
                    </select>
                  </div>
                </div>

                <div
                  className="form-group"
                  style={{ width: "100%", marginBottom: 24 }}
                >
                  <label className="text-form-label">Khoá học</label>
                  <Select
                    mode="multiple"
                    showSearch
                    style={{ width: "100%" }}
                    placeholder="Chọn khoá học"
                    value={this.state.classroomId}
                    onChange={this.handleChangeClassroomId}
                    optionFilterProp="children"
                  >
                    {this.fetchCoursesRows()}
                  </Select>
                </div>

                {this.state.classroomSelected.length > 0 && (
                  <div style={{ fontWeight: 500, marginBottom: 12 }}>
                    Khoá học đã chọn:
                  </div>
                )}

                <div>
                  {this.state.classroomSelected.map((course) => (
                    <Card
                      key={course.id}
                      size="small"
                      title={course.name}
                      style={{ marginBottom: 12 }}
                      extra={
                        <Button
                          type="danger"
                          shape="circle"
                          icon="delete"
                          onClick={() =>
                            this.handleRemoveCourseRegister(course.id)
                          }
                        />
                      }
                    >
                      <div style={{ marginBottom: 4 }}>
                        <Text type="secondary">Giá gốc:</Text>
                        {Number(course.origin_price).toLocaleString()} đ
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <Text type="secondary">Giá KM hiện tại:</Text>
                        {Number(course.price).toLocaleString()} đ
                      </div>
                      <div>
                        <Text type="secondary">Giá điều chỉnh:</Text>
                        <Input
                          style={{ marginTop: 4 }}
                          placeholder="Nhập giá điều chỉnh"
                          defaultValue={course.update_price}
                          onChange={(e) =>
                            this.handleChangeAdjustPrice(
                              course.id,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ width: "35%" }}>
              <Card bordered>
                <h3 style={{ marginBottom: 16 }}>Tóm tắt đơn hàng</h3>
                {this.state.classroomSelected.map((course) => {
                  return (
                    <Row key={course.id} style={{ marginBottom: 8 }}>
                      <Col span={16}>
                        <Text>{course.name}</Text>
                      </Col>
                      <Col span={8} style={{ textAlign: "right" }}>
                        {`${course.update_price.toLocaleString("vi-VN")} đ`}
                      </Col>
                    </Row>
                  );
                })}

                {this.state.classroomSelected.length > 0 ? (
                  <Row
                    style={{
                      borderTop: "1px solid #eee",
                      marginTop: 12,
                      paddingTop: 12,
                    }}
                  >
                    <Col span={16}>
                      <strong>TỔNG THANH TOÁN</strong>
                    </Col>
                    <Col span={8} style={{ textAlign: "right" }}>
                      <Text strong style={{ color: "#f5222d" }}>
                        {this.state.classroomSelected
                          .reduce(
                            (accumulator, currentValue) =>
                              accumulator + Number(currentValue.update_price),
                            0
                          )
                          .toLocaleString("vi-VN")}
                        đ
                      </Text>
                    </Col>
                  </Row>
                ) : (
                  <Row
                    style={{
                      borderTop: "1px solid #eee",
                      marginTop: 12,
                      paddingTop: 12,
                    }}
                  >
                    <Col span={16}>
                      <strong>Chưa có khoá học nào được chọn</strong>
                    </Col>
                  </Row>
                )}
              </Card>
              <Button
                type="primary"
                block
                style={{
                  backgroundColor: "#fba88f",
                  borderColor: "#fba88f",
                  color: "white",
                  marginTop: 16,
                }}
                onClick={this._handleSubmit}
              >
                ➕ Tạo liên kết thanh toán
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    teachers: state.createPaymentLinks.listTeacher,
    courses: state.createPaymentLinks.listCourses,
    dataCreateLinkPayment: state.createPaymentLinks.dataCreateLinkPayment,
    student: state.createPaymentLinks.student,
    studentDetailMessage: state.createPaymentLinks.studentDetailMessage,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createLinkPayment,
      listTeacher,
      listCourses,
      getStudentDetail,
      resetStudentDetail,
    },
    dispatch
  );
}

let Container = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LinkPaymentCreate)
);

export default Container;
