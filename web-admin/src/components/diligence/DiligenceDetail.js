import React, { Component } from "react";
import Moment from "moment";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listClassroom, checkDiligence, diffBuoiHoc, removeMember } from "../../redux/classroom/action";
import { listSubject } from "../../redux/subject/action";
import { Select } from "antd";
import queryString from 'query-string';
import '../../App.css';
const { Option } = Select;


class DiligenceDetail extends Component {
    constructor(props) {
        super();
        this.state = {
            classroom_id: null,
            from_date: null,
            to_date: null,
            sobuoihoc: null,
            checkAll: false,
        };
    }

    async componentDidMount() {
        this.props.listClassroom({ limit: 100 });
        const url = this.props.location.search;


        let params = queryString.parse(url);

        await this.setState({
            classroom_id: params.classroom_id ? params.classroom_id : null,
            from_date: params.fromDate ? params.fromDate : null,
            to_date: params.toDate ? params.toDate : null,
        })


        let payload = {
            classroom_id: this.state.classroom_id,
            from_date: this.state.from_date,
            to_date: this.state.to_date
        }

        await this.props.checkDiligence(payload);
    }

    onChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;
        await this.setState({
            [name]: value,
        });

    };

    onChangeClassroom = async (val) => {
        this.setState({
            classroom_ids: val
        })
    }

    onChangeSubject = async (val) => {
        this.setState({
            subject_id: val
        })
    }

    _removeMember = async (params, index) => {
        removeMember(params, false);
        var row = document.getElementById('row-not-join-' + index);
        if (row) {
            row.display = "none";
        }
    }

    diffSobuoihoc = async (e) => {
        const studentNoID = [];
        let joinedAt;
        const toDate = new Date(this.state.to_date).getTime();
        if (this.props.data && this.props.code === 200) {
            if (this.props.data && this.props.data.users.length > 0 && this.props.code === 200) {
                if (this.props.data.users instanceof Array) {
                    for (let i = 0; i < this.props.data.users.length; i++) {
                        const index = this.props.data.attendedUserID.indexOf(this.props.data.users[i]._id);
                        const _userClassroomData = this.getUserClassroomData(this.props.data.users[i]._id);
                        if (_userClassroomData) {
                            joinedAt = _userClassroomData.created_at;
                        }
                        if (joinedAt)
                            joinedAt = new Date(joinedAt).getTime();

                        if (index < 0 && joinedAt && joinedAt < toDate)
                            studentNoID.push(this.props.data.users[i]._id);
                    }
                }
            }
        }

        const params = {
            classroom_id: this.state.classroom_id,
            user_ids: studentNoID,
            sobuoihoc: parseInt(this.state.sobuoihoc)
        };
        await this.props.diffBuoiHoc(params);
        await this.setState({
            sobuoihoc: null
        });
        document.getElementById('_sobuoihoc').value = null;
    }

    handleSubmit = async (isExport = false) => {

        if (this.state.classroom_id !== null && this.state.attended_date !== null) {
            this.setState({
                checkAll: true,
            })
            let params = {
                is_export: isExport,
                from_date: this.state.from_date,
                to_date: this.state.to_date,
                classroom_id: this.state.classroom_id,
            };
            await this.props.checkDiligence(params);
        }
    }

    /* onChange lop */
    fetchRowsClassroom = () => {
        if (this.props.classrooms instanceof Array) {
            return this.props.classrooms.map((obj, i) => {
                return (
                    <option key={obj._id.toString()} value={obj._id}>{obj.name}</option>
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

    /* danh sach hoc sinh di hoc */
    fechAttendedUsers() {
        const studentYes = [];
        if (this.props.data && this.props.data.attendedUserID.length > 0 && this.props.code === 200) {
            if (this.props.data && this.props.data.users.length > 0 && this.props.code === 200) {
                if (this.props.data.users instanceof Array) {
                    for (let i = 0; i < this.props.data.users.length; i++) {
                        const index = this.props.data.attendedUserID.indexOf(this.props.data.users[i]._id);
                        if (index >= 0) {
                            for (let j = 0; j < this.props.data.attendedUsers.length; j++) {
                                if (this.props.data.attendedUsers[j].user.id == this.props.data.users[i]._id) {
                                    this.props.data.users[i].attended_date = (this.props.data.attendedUsers[j] && this.props.data.attendedUsers[j].attended_date) ? this.props.data.attendedUsers[j].attended_date : null;
                                    break;
                                }
                            }

                            studentYes.push(this.props.data.users[i]);
                        }
                    }
                }
            }
        }
        if (studentYes instanceof Array) {
            return studentYes.map((obj, i) => {
                let _sobuoiconlai = 0;
                let joinedAt = null;
                const _userClassroomData = this.getUserClassroomData(obj._id);
                if (_userClassroomData) {
                    _sobuoiconlai = _userClassroomData.sobuoihoc - _userClassroomData.buoidahoc;
                    if (_userClassroomData.created_at)
                        joinedAt = _userClassroomData.created_at;
                }
                return (
                    <tr key={i}>
                        <td className="text-center">{i + 1}</td>
                        <td>{obj.fullname}</td>
                        <td>{obj.code}</td>
                        <td>{obj.parent_phone}</td>
                        <td>{obj.phone}</td>
                        <td>
                            {obj.attended_date &&
                                Moment(obj.attended_date).format(
                                    "DD/MM/YYYY HH:mm:ss"
                                )}
                        </td>
                        <td>
                            {joinedAt &&
                                Moment(joinedAt).format(
                                    "DD/MM/YYYY HH:mm:ss"
                                )}
                        </td>
                        <td className="text-center">
                            {parseInt(_sobuoiconlai)}
                        </td>
                    </tr>
                );
            });
        }
    }

    // Học sinh mới
    fechAttendedNewUsers() {
        var newStudents = [];
        const toDate = new Date(this.state.to_date).getTime();
        if (this.props.data && this.props.code === 200) {
            if (this.props.data && this.props.data.users.length > 0 && this.props.code === 200) {
                if (this.props.data.users instanceof Array) {
                    let { users } = this.props.data;
                    for (let i = 0; i < users.length; i++) {
                        let index = this.props.data.newUserIds.indexOf(users[i]._id);
                        let newMem = false;
                        if (this.props.data.users[i].created_at) {
                            const joinDate = new Date(this.props.data.users[i].created_at).getTime();
                            if (joinDate > toDate) {
                                newMem = true;
                            }
                        }
                        if (index < 0 && newMem) {
                            newStudents.push(users[i]);
                        } else {
                            console.log('failure');
                        }
                    }
                }
            }
        }
        if (newStudents instanceof Array) {
            return newStudents.map((obj, i) => {
                const toDate = new Date(this.state.to_date).getTime();
                let _sobuoiconlai = 0;
                let joinedAt = null;
                const _userClassroomData = this.getUserClassroomData(obj._id);
                if (_userClassroomData) {
                    _sobuoiconlai = _userClassroomData.sobuoihoc - _userClassroomData.buoidahoc;
                    if (_userClassroomData.created_at)
                        joinedAt = _userClassroomData.created_at;
                }
                const _params = { classroom_id: this.state.classroom_id, student_id: obj._id };

                if (joinedAt)
                    joinedAt = new Date(joinedAt).getTime();
                if (joinedAt > toDate) {
                    return;
                }
                return (
                    <tr key={i} id={'row-not-join-' + i}>
                        <td className="text-center">{i + 1}</td>
                        <td>{obj.fullname}</td>
                        <td>{obj.code}</td>
                        <td>{obj.parent_phone}</td>
                        <td>{obj.phone}</td>
                        <td>{joinedAt &&
                            Moment(joinedAt).format(
                                "DD/MM/YYYY HH:mm:ss"
                            )}</td>
                        <td className="text-center">{parseInt(_sobuoiconlai)}</td>
                        <td className="text-center">
                            <button onClick={removeMember(_params, false)} className="btn btn-sm btn-danger text-muted btn-sm" type="button">Xóa khỏi lớp</button>
                        </td>
                    </tr>
                );
            })
        }
    }

    /* danh sach hoc sinh nghi hoc */
    fechAttendedUsersLeave() {
        const studentNo = [];
        const toDate = new Date(this.state.to_date).getTime();

        if (this.props.data && this.props.code === 200) {
            if (this.props.data && this.props.data.users.length > 0 && this.props.code === 200) {
                if (this.props.data.users instanceof Array) {
                    for (let i = 0; i < this.props.data.users.length; i++) {
                        const index = this.props.data.attendedUserID.indexOf(this.props.data.users[i]._id);
                        let newMem = false;
                        if (this.props.data.users[i].created_at) {
                            const joinDate = new Date(this.props.data.users[i].created_at).getTime();
                            if (joinDate > toDate) {
                                newMem = true;
                            }
                        }

                        if (index < 0 && !newMem) {
                            studentNo.push(this.props.data.users[i]);
                        }
                    }
                }
            }
        }

        if (studentNo instanceof Array) {
            return studentNo.map((obj, i) => {
                const toDate = new Date(this.state.to_date).getTime();
                let _sobuoiconlai = 0;
                let joinedAt = null;
                const _userClassroomData = this.getUserClassroomData(obj._id);
                if (_userClassroomData) {
                    _sobuoiconlai = _userClassroomData.sobuoihoc - _userClassroomData.buoidahoc;
                    if (_userClassroomData.created_at)
                        joinedAt = _userClassroomData.created_at;
                }
                const _params = { classroom_id: this.state.classroom_id, student_id: obj._id };

                if (joinedAt)
                    joinedAt = new Date(joinedAt).getTime();
                if (joinedAt > toDate) {
                    return;
                }
                return (
                    <tr key={i} id={'row-not-join-' + i}>
                        <td className="text-center">{i + 1}</td>
                        <td>{obj.fullname}</td>
                        <td>{obj.code}</td>
                        <td>{obj.parent_phone}</td>
                        <td>{obj.phone}</td>
                        <td>{joinedAt &&
                            Moment(joinedAt).format(
                                "DD/MM/YYYY HH:mm:ss"
                            )}</td>
                        <td className="text-center">{parseInt(_sobuoiconlai)}</td>
                        <td className="text-center">
                            <button onClick={removeMember(_params, false)} className="btn btn-sm btn-danger text-muted btn-sm" type="button">Xóa khỏi lớp</button>
                        </td>
                    </tr>
                );
            });
        }
    }



    render() {

        return (
            <div>
                <div className='page-content page-container' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Chuyên cần</h2>
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
                                            value={this.state.classroom_id}
                                            name="classroom_id"
                                            onChange={this.onChange}
                                        >
                                            <option value="">-- Chọn lớp học --</option>
                                            {this.fetchRowsClassroom()}
                                        </select>
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
                                        <span className='input-group-append'>
                                            <button
                                                className='btn btn-primary'
                                                type='button'
                                                onClick={e => this.handleSubmit(false)}
                                            >
                                                <span className='d-flex text-muted'>
                                                    Kiểm tra
                                                </span>
                                            </button>
                                        </span>
                                    </div>
                                    <button style={{ marginLeft: 30 }}
                                        className='btn btn-primary'
                                        type='button'
                                        onClick={e => this.handleSubmit(true)}
                                    >
                                        <span className='d-flex text-muted'>
                                            Xuất Excel
                                        </span>
                                    </button>
                                </form>
                            </div>

                            {this.props.code === 200 && this.props.data ?
                                (
                                    <div>
                                        {this.props.data.classroomUsers.length > 0 ? (
                                            <div>
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="card">
                                                            <div className="b-b">
                                                                <div className="nav-active-border b-primary bottom">
                                                                    <ul
                                                                        className="nav"
                                                                        id="myTab"
                                                                        role="tablist">
                                                                        <li className="nav-item">
                                                                            <a
                                                                                className="nav-link active"
                                                                                id="score-tab"
                                                                                data-toggle="tab"
                                                                                href="#chualam"
                                                                                role="tab"
                                                                                aria-controls="profile"
                                                                                aria-selected="false">
                                                                                Học sinh đi học
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
                                                                                aria-selected="false">
                                                                                Học sinh nghỉ học
                                                                            </a>
                                                                        </li>
                                                                        <li className="nav-item">
                                                                            <a
                                                                                className="nav-link"
                                                                                id="params-tab"
                                                                                data-toggle="tab"
                                                                                href="#newStudents"
                                                                                role="tab"
                                                                                aria-controls="params"
                                                                                aria-selected="false">
                                                                                Học sinh mới
                                                                            </a>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                            <div className="tab-content p-3">
                                                                <div
                                                                    className="tab-pane fade active show"
                                                                    id="chualam"
                                                                    role="tabpanel"
                                                                    aria-labelledby="chualam-tab">
                                                                    <table className="table table-striped table-score">
                                                                        <thead>
                                                                            <tr>
                                                                                <th
                                                                                    style={{
                                                                                        textAlign:
                                                                                            'center',
                                                                                        verticalAlign:
                                                                                            'inherit',
                                                                                    }}>
                                                                                    STT
                                                                                </th>
                                                                                <th>
                                                                                    Tên học sinh
                                                                                </th>
                                                                                <th>
                                                                                    Mã học sinh
                                                                                </th>
                                                                                <th>SĐT phụ huynh</th>
                                                                                <th>Số điện thoại</th>
                                                                                <th>Thời gian vào lớp</th>
                                                                                <th>Ngày tham gia</th>
                                                                                <th className="text-center">Số buổi còn lại</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {this.fechAttendedUsers()}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <div
                                                                    className="tab-pane fade"
                                                                    id="params"
                                                                    role="tabpanel"
                                                                    aria-labelledby="params-tab">
                                                                    <form className="flex" id="diffBuoiHoc">
                                                                        <div className="input-group">
                                                                            <input id="_sobuoihoc" type="text" className="form-control form-control-theme keyword-custom" placeholder="Số buổi cần trừ" name="sobuoihoc" onChange={this.onChange} />
                                                                            <span className="input-group-append">
                                                                                <button onClick={this.diffSobuoihoc} className="btn btn-sm btn-primary text-muted btn-sm" type="button">Trừ buổi học</button>
                                                                            </span>
                                                                        </div>
                                                                    </form>
                                                                    <table className="table table-striped table-chualam">
                                                                        <thead>
                                                                            <tr>
                                                                                <th
                                                                                    style={{
                                                                                        textAlign:
                                                                                            'center',
                                                                                        verticalAlign:
                                                                                            'inherit',
                                                                                    }}>
                                                                                    STT
                                                                                </th>
                                                                                <th>
                                                                                    Tên học sinh
                                                                                </th>
                                                                                <th>
                                                                                    Mã học sinh
                                                                                </th>
                                                                                <th>SĐT phụ huynh</th>
                                                                                <th>Số điện thoại</th>
                                                                                <th>Ngày tham gia</th>
                                                                                <th className="text-center">Số buổi còn lại</th>
                                                                                <th className="text-center">Hành động</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {this.fechAttendedUsersLeave()}
                                                                        </tbody>
                                                                    </table>
                                                                </div>


                                                                <div
                                                                    className="tab-pane fade"
                                                                    id="newStudents"
                                                                    role="tabpanel"
                                                                    aria-labelledby="params-tab">
                                                                    <form className="flex" id="diffBuoiHoc">
                                                                        <div className="input-group">
                                                                            <input id="_sobuoihoc" type="text" className="form-control form-control-theme keyword-custom" placeholder="Số buổi cần trừ" name="sobuoihoc" onChange={this.onChange} />
                                                                            <span className="input-group-append">
                                                                                <button onClick={this.diffSobuoihoc} className="btn btn-sm btn-primary text-muted btn-sm" type="button">Trừ buổi học</button>
                                                                            </span>
                                                                        </div>
                                                                    </form>
                                                                    <table className="table table-striped table-chualam">
                                                                        <thead>
                                                                            <tr>
                                                                                <th
                                                                                    style={{
                                                                                        textAlign:
                                                                                            'center',
                                                                                        verticalAlign:
                                                                                            'inherit',
                                                                                    }}>
                                                                                    STT
                                                                                </th>
                                                                                <th>
                                                                                    Tên học sinh
                                                                                </th>
                                                                                <th>
                                                                                    Mã học sinh
                                                                                </th>
                                                                                <th>SĐT phụ huynh</th>
                                                                                <th>Số điện thoại</th>
                                                                                <th>Ngày tham gia</th>
                                                                                <th className="text-center">Số buổi còn lại</th>
                                                                                <th className="text-center">Hành động</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {this.fechAttendedNewUsers()}
                                                                        </tbody>
                                                                    </table>
                                                                </div>


                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="block-item-content">
                                                <h3 className="title-block mb-0">Lớp này bạn chưa tham gia</h3>
                                            </div>
                                        )}
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
        data: state.classroom.data,
        code: state.classroom.code,
        subjects: state.subject.subjects,
        dataClassroomAttends: state.classroom.dataClassroomAttends
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { checkDiligence, listClassroom, diffBuoiHoc, removeMember, listSubject },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(DiligenceDetail)
);
