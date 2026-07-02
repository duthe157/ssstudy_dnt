import React, { Component } from "react";
import Moment from "moment";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listClassroom, checkDiligence, diffBuoiHoc, removeMember, checkClassRoomAttend } from "../../redux/classroom/action";
import { listSubject } from "../../redux/subject/action";
import { Select } from "antd";
import '../../App.css';
const { Option } = Select;


class Diligence extends Component {
    constructor(props) {
        super();
        this.state = {
            classroom_ids: null,
            subject_id: null,
            from_date: null,
            to_date: null,
            sobuoihoc: null,
            checkAll: false,
        };
    }

    async componentDidMount() {
        await this.props.listSubject({ limit: 100 });
        // await this.props.listClassroom({ limit: 100 });
    }

    onChange = async (e) => {

        var name = e.target.name;
        var value = e.target.value;

        await this.setState({
            [name]: value,
        });


        if (name === "subject_id") {
            let params = {};

            if (value) {
                params = {
                    subject_id: value,
                    limit: 100,
                };
                await this.props.listClassroom(params);
            }
        }
    };

    onChangeClassroom = async (val) => {

        this.setState({
            classroom_ids: val
        })
    }



    handleSubmit = async (e) => {
        e.preventDefault();
        if (this.state.classroom_id !== null && this.state.attended_date !== null) {
            this.setState({
                checkAll: true,
            })
            let params = {
                from_date: this.state.from_date,
                to_date: this.state.to_date,
                classroom_ids: this.state.classroom_ids,
                subject_id: this.state.subject_id
            };
            // await this.props.checkDiligence(params);
            await this.props.checkClassRoomAttend(params);
        }
    }

    /* onChange lop */
    fetchRowsClassroom = () => {
        if (this.props.classrooms instanceof Array) {
            return this.props.classrooms.map((obj, i) => {
                return (
                    <Option key={obj._id.toString()} value={obj._id}>{obj.name}</Option>
                );
            });
        }
    };

    fetchRowsSubject() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj, i) => {
                return (
                    <option key={obj._id.toString()} value={obj._id}>{obj.name}</option>
                );
            });
        }
    };

    getUserClassroomData(userID) {
        const classroomUsers = this.props.data.classroomUsers ? this.props.data.classroomUsers : [];
        for (let i = 0; i < classroomUsers.length; i++) {
            if (classroomUsers[i].user.id === userID) {
                return classroomUsers[i];
            }
        }
    }


    onSearchClassroom = async (value) => {
        if (value) {
            await this.props.listClassroom({
                limit: 100,
                keyword: value,
                subject_id: this.state.subject_id,
            });
        }
    };



    //list classroom attend
    fetchClassroomAttend() {
        let classrooms = this.props.dataClassroomAttends;
        if (classrooms && classrooms instanceof Array) {
            return classrooms.map((item, index) => {
                return (
                    <tr key={index}>
                        <td className="text-left">
                            <span className='item-amount d-none d-sm-block text-sm'>
                            <Link
                                className='item-author text-color'
                                to={`/diligence/detail?classroom_id=${item._id}&fromDate=${this.state.from_date}&toDate=${this.state.to_date}`}
                            >{item.name}</Link>
					</span>
                        </td>
                        <td>{item.subject ? item.subject.name : ""}</td>
                        <td>{item.hs_dihoc}</td>
                        <td>{item.hs_nghihoc}</td>
                        <td>{"chưa có"}</td>
                    </tr>
                );
            })
        }
    }


    render() {

        return (
            <div>
                <div className='page-content page-container' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Kiểm tra chuyên cần</h2>
                        <div className='mb-5'>
                            <div className='toolbar'>
                                <form className='flex row' onSubmit={this.onSubmit}>
                                    <div className="input-group col-sm-3">
                                        {/* <Select
                                            showSearch
                                            placeholder="-- Chọn môn học -- "
                                            optionFilterProp="children"
                                            onChange={(val) => this.onChangeSubject(val)}
                                            name="subject_id"
                                        >
                                            {this.fetchRowsSubject()}
                                        </Select> */}
                                        <select
                                            className="custom-select"
                                            value={this.state.subject_id}
                                            name="subject_id"
                                            onChange={this.onChange}
                                        >
                                            <option value="">-- Chọn môn học --</option>
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
                                        <span style={{ paddingRight: 8, paddingTop: 9 }}> Từ ngày </span>
                                        <input
                                            type='date'
                                            className='form-control form-control-theme keyword-custom'
                                            placeholder='Chọn ngày tháng...'
                                            onChange={this.onChange}
                                            name='from_date'
                                            value={this.state.from_date}
                                        /><span style={{ paddingTop: 9 }}> -đến ngày- </span>
                                        <input
                                            type='date'
                                            className='form-control form-control-theme keyword-custom'
                                            placeholder='Chọn ngày tháng...'
                                            onChange={this.onChange}
                                            name='to_date'
                                            value={this.state.to_date}
                                        />{" "}
                                        <span className='input-group-append' style={{ display: "block" }}>
                                            <button
                                                className='btn btn-primary'
                                                type='submit'
                                                onClick={this.handleSubmit}
                                            >
                                                <span className='d-flex text-muted'>
                                                    Kiểm tra
                                                </span>
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </div>
                            {
                                this.props.code == 200 &&
                                (
                                    <div>
                                        {
                                            this.props.dataClassroomAttends && this.props.dataClassroomAttends.length > 0
                                            &&
                                            <div className="block-item-content">
                                                <h3 className="title-block mb-0" style={{ textTransform: "uppercase" }}>Kiểm tra chuyên cần hôm nay</h3>
                                                <table className='table table-theme table-row v-middle'>
                                                    <thead className='text-muted'>
                                                        <tr>
                                                            <th className='text-left'>
                                                                Lớp
                                                            </th>
                                                            <th>
                                                                Môn
                                                            </th>
                                                            <th>
                                                                Học sinh đi học
                                                            </th>
                                                            <th>
                                                                Học sinh nghỉ học
                                                            </th>
                                                            <th>
                                                                Học sinh mới làm thẻ
                                                            </th>
                                                        </tr>
                                                    </thead>


                                                    <tbody>
                                                        {
                                                            this.fetchClassroomAttend()
                                                        }
                                                        {
                                                            !this.props.dataClassroomAttends || this.props.dataClassroomAttends.length == 0
                                                            &&
                                                            <tr>
                                                                <td colSpan={5} className="text-center">Không có dữ liệu!</td>
                                                            </tr>
                                                        }
                                                    </tbody>

                                                </table>
                                            </div>

                                        }
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
        data: state.classroom.data,
        code: state.classroom.code,
        subjects: state.subject.subjects,
        dataClassroomAttends: state.classroom.dataClassroomAttends
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { checkDiligence, listClassroom, diffBuoiHoc, removeMember, listSubject, checkClassRoomAttend },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Diligence)
);
