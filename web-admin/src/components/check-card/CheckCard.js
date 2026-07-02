import React, { Component } from "react";
import Moment from "moment";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listSubject } from "../../redux/subject/action";
import { listClassroom } from "../../redux/classroom/action";
import { checkCode } from "../../redux/student/action";
import '../../App.css';
import { Select } from "antd";
const { Option } = Select;

class CheckCard extends Component {
    constructor(props) {
        super();
        this.state = {
            code: "",
            subject_id: "",
            classroom_id: "",
            checkAll: false,
            sobuoiconlai: "",
        };
    }

    async componentDidMount() {
        await this.props.listSubject({ limit: 100 });
        await this.props.listClassroom({ limit: 100 });
    }

    onChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;

        await this.setState({
            [name]: value,
        });
        if (name === "subject_id") {
            await this.setState({
                classroom_id: "",
            });
        }
    };

    onChangeClassroom = async (val) => {

        this.setState({
            classroom_id: val
        })
    }


    handleSubmit = async (e) => {
        e.preventDefault();
        if (this.state.code !== '' || this.state.classroom_id !== '') {
            this.setState({
                checkAll: true,
            })
            let params = { "code": this.state.code, "classroom_id": this.state.classroom_id };
            await this.props.checkCode(params);
            if (this.props.data) {
                if (this.props.data.classroomUser) {
                    if (this.props.data.classroomUser.sobuoihoc && this.props.data.classroomUser.buoidahoc) {
                        this.setState({
                            sobuoiconlai: parseInt(this.props.data.classroomUser.sobuoihoc) - parseInt(this.props.data.classroomUser.buoidahoc)
                        });
                    }
                }
            }
        }
        this.setState({
            code: ''
        });
        document.getElementById('card_code').focus();
    }

    /* onChange Mon */
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

    /* onChange lop */
    fetchRowsClassroom = () => {
        if (this.props.classrooms instanceof Array) {
            if (this.state.subject_id !== "") {
                return this.props.classrooms.map((obj, i) => {
                    if (obj.subject.id === this.state.subject_id) {
                        return (
                            <Option key={obj._id.toString()} value={obj._id}>{obj.name}</Option>
                        );
                    }
                });
            }
        }
    };

    fetchAttend = () => {
        if (this.props.attendance instanceof Array) {
            return this.props.attendance.map((obj, i) => {
                return (
                    <tr>
                        <td>
                            {obj.attended_date &&
                                Moment(obj.attended_date).format(
                                    "DD/MM/YYYY"
                                )}
                        </td>
                        <td>
                            {obj.attended_date &&
                                Moment(obj.attended_date).format(
                                    "HH:mm:ss"
                                )}
                        </td>
                    </tr>
                );
            });
        }
    };



    onSearchClassroom = async (value) => {
        if (value) {
            await this.props.listClassroom({
                limit: 100,
                keyword: value,
                subject_id: this.state.subject_id,
            });
        }
    };

    render() {

        return (
            <div>
                <div className='page-content page-container' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Kiểm tra thẻ</h2>
                        <div className='mb-5'>
                            <div className='toolbar'>
                                <form className='flex row' onSubmit={this.onSubmit}>
                                    <div className="input-group col-sm-3">
                                        <select
                                            className='custom-select'
                                            value={this.state.subject_id}
                                            name='subject_id'
                                            onChange={this.onChange}
                                        >
                                            <option value=''>-- Chọn Môn --</option>
                                            {this.fetchRowsSubject()}
                                        </select>
                                    </div>
                                    <div className="input-group col-sm-3">
                                        <Select
                                            showSearch
                                            mode="multiple"
                                            style={{ width: '100%' }}
                                            placeholder="Chọn lớp"
                                            optionFilterProp="children"
                                            name="classroom_id"
                                            onSearch={this.onSearchClassroom}
                                            onChange={this.onChangeClassroom}
                                        >
                                            {this.fetchRowsClassroom()}
                                        </Select>
                                    </div>
                                    <div className='input-group col-sm-4'>
                                        <input
                                            id="card_code"
                                            type='text'
                                            className='form-control form-control-theme keyword-custom'
                                            placeholder='Nhập code...'
                                            onChange={this.onChange}
                                            name='code'
                                            value={this.state.code}
                                        />{" "}
                                        <span className="ml-16">
                                            <button
                                                className='btn btn-primary'
                                                type='submit'
                                                onClick={this.handleSubmit}
                                            >
                                                <span className='d-flex text-muted'>
                                                    Kiểm tra thẻ
                                                </span>
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </div>

                            {this.state.checkAll === true ?
                                (
                                    <div>
                                        {this.props.statusCode === 200 && this.props.data ?
                                            (
                                                <div>
                                                    <div className='row mt-4 card'>
                                                        <div className="row card-body">
                                                            <div className="col-sm-3 mb-3">
                                                                <p style={{ fontSize: "17px" }}>Lớp: <b>{this.props.data.classroom.name}</b></p>
                                                            </div>
                                                            <div className="col-sm-9 mb-3">
                                                                <p style={{ fontSize: "17px" }}>Môn: <b>{this.props.data.classroom.subject.name}</b></p>
                                                            </div>
                                                            <div className="col-sm-4">
                                                                <p>
                                                                    Tên học sinh: <b>{this.props.data.user.fullname}</b>
                                                                </p>
                                                                <p>
                                                                    Giới tính: <span>
                                                                        <div className="ant-radio-group ant-radio-group-outline ml-3">
                                                                            <label className="ant-radio-wrapper">
                                                                                <div className="form-check d-flex">
                                                                                    <div className="mr-2">
                                                                                        <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value={
                                                                                            this.props.data.user.gender
                                                                                        } checked={this.props.data.user.gender === "Male" ? "checked" : ""} />
                                                                                        <label className="form-check-label" for="exampleRadios1">
                                                                                            Nam
                                                                                        </label>
                                                                                    </div>
                                                                                    <div className="ml-4">
                                                                                        <input className="form-check-input" type="radio"
                                                                                            checked={this.props.data.user.gender === "Female" ? "checked" : ""}
                                                                                            name="exampleRadios" id="exampleRadios1" value={this.props.data.user.gender} />
                                                                                        <label className="form-check-label" for="exampleRadios1">
                                                                                            Nữ
                                                                                        </label>
                                                                                    </div>
                                                                                </div>


                                                                            </label>
                                                                        </div>
                                                                    </span>
                                                                </p>
                                                                <p>
                                                                    Số buổi còn lại: <b>
                                                                        {this.state.sobuoiconlai}
                                                                    </b>
                                                                    {
                                                                        (this.props.lastTesting) ?
                                                                            <div>
                                                                                <b style={{ fontSize: "18px" }}>Đã làm đề: {this.props.lastTesting.exam.code}</b> (<b style={{ color: 'red', fontSize: "18px" }}>{this.props.lastTesting.point}</b> điểm)
                                                                            </div> : <b style={{ color: 'red', marginLeft: 60, fontSize: "18px" }}>Chưa làm bài tập!</b>
                                                                    }

                                                                </p>
                                                            </div>
                                                            <div className="col-sm-4">
                                                                <p>
                                                                    Số điện thoại: <b>{this.props.data.user.phone}</b>
                                                                </p>
                                                                <p>
                                                                    Ngày sinh: <b>
                                                                        {this.props.data.user.dob}
                                                                    </b>
                                                                </p>


                                                            </div>
                                                            <div className="col-sm-4">
                                                                <p>
                                                                    Email: <b>{this.props.data.user.email} </b>
                                                                </p>
                                                                <p>
                                                                    Lớp đã học: <span>
                                                                        {

                                                                            this.props.data && this.props.data.userClassrooms.length > 0 ?
                                                                                (
                                                                                    <div>
                                                                                        {
                                                                                            this.props.data.userClassrooms.map((obj, i) =>
                                                                                                <b>

                                                                                                    {obj.classroom.name + ', '}
                                                                                                </b>
                                                                                            )
                                                                                        }
                                                                                    </div>
                                                                                ) : (
                                                                                    <div>
                                                                                        <b>Chưa tham gia lớp nào</b>
                                                                                    </div>
                                                                                )
                                                                        }
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div className="col-sm-12 card-header mt-4">
                                                                <h5 style={{ color: "red", fontSize: "22px" }}>Lịch sử điểm danh của học sinh</h5>
                                                            </div>
                                                            <div className='col-sm-12 card-body'>
                                                                <table className='table table-theme table-row v-middle'>
                                                                    <thead className='text-muted'>
                                                                        <tr>
                                                                            <th>Ngày điểm danh</th>
                                                                            <th>Giờ điểm danh</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {this.fetchAttend()}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                            ) : (
                                                <div>
                                                    <div style={{
                                                        borderTop: "2px solid rgb(231, 230, 230)",
                                                        marginTop: "20px",
                                                        borderRadius: "4px",
                                                        padding: "10px 8px",
                                                        boxShadow: "rgb(221, 221, 221) 0px 0px 2px 1px",
                                                    }}>
                                                        <h3 style={{
                                                            fontSize: "20px",
                                                            color: "#676363",
                                                        }}
                                                        >Lớp này bạn chưa tham gia</h3>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                ) : (
                                    <div>
                                    </div>
                                )
                            }


                            <div
                                id='delete-student'
                                className='modal fade'
                                data-backdrop='true'
                                style={{ display: "none" }}
                                aria-hidden='true'
                            >
                                <div
                                    className='modal-dialog animate fade-down'
                                    data-class='fade-down'
                                >
                                    <div className='modal-content'>
                                        <div className='modal-header'>
                                            <div className='modal-title text-md'>
                                                Thông báo
                                            </div>
                                            <button
                                                className='close'
                                                data-dismiss='modal'
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className='modal-body'>
                                            <div className='p-4 text-center'>
                                                <p>
                                                    Bạn chắc chắn muốn xóa bản
                                                    ghi này chứ?
                                                </p>
                                            </div>
                                        </div>
                                        <div className='modal-footer'>
                                            <button
                                                type='button'
                                                className='btn btn-light'
                                                data-dismiss='modal'
                                            >
                                                Đóng
                                            </button>
                                            <button
                                                type='button'
                                                onClick={this.handleDelete}
                                                className='btn btn-danger'
                                                data-dismiss='modal'
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    </div>
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
        classrooms: state.classroom.classrooms,
        subjects: state.subject.subjects,
        dataUser: state.student.dataUser,
        statusCode: state.student.statusCode,
        dataClass: state.student.dataClass,
        data: state.student.data,
        isDoneHomeWork: state.student.isDoneHomeWork,
        lastTesting: state.student.lastTesting,
        attendance: state.student.attendance
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { checkCode, listClassroom, listSubject },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CheckCard)
);
