import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showStudent, updateStudent } from '../../redux/student/action';
import { isUndefined } from 'util';


class StudentEdit extends Component {
    constructor(props) {
        super();
        this.state = {
            code: '', fullname: '', email: '', gender: '', classroom: '', parent_phone: '', phone: '', point: '', school: ''
        }
    }

    async componentDidMount() {
        await this.props.showStudent(this.props.match.params.id);
        if (this.props.student) {
            var { code, fullname, email, gender, classroom, parent_phone, phone, point, school } = this.props.student;
            this.setState({
                code, fullname, email, gender, classroom, parent_phone, phone, point, school
            });
        }
    }

    _onChange = (e) => {
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value
        });
    }
    handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            id: this.props.match.params.id,
            fullname: this.state.fullname,
            email: this.state.email,
            gender: this.state.gender,
            classroom: this.state.classroom,
            parent_phone: this.state.parent_phone,
            phone: this.state.phone,
            school: this.state.school,
        }
        await this.props.updateStudent(data);
        if (this.props.redirect === true) {
            await this.props.history.push('/student');
        }
    }

    render() {
        var { code, fullname, email, gender, classroom, parent_phone, phone, point, school } = this.state;
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <div className="row">
                            <div className="col-md-10">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Thông tin sinh viên</strong>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Mã học sinh</label>
                                            <div className="col-sm-8">
                                                <b>{!isUndefined(code) ? code : ''}</b>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Họ và tên</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" name="fullname" onChange={this._onChange} value={fullname} />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Giới tính</label>
                                            <div className="col-sm-8">
                                                <select onChange={this._onChange} value={gender} name="gender" className="form-control">
                                                    <option value="">-- Chọn giới tính --</option>
                                                    <option value="Male">Nam</option>
                                                    <option value="Female">Nữ</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Email</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" name="email" onChange={this._onChange} value={email} />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Số điện thoại</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" name="phone" onChange={this._onChange} value={phone} />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">SĐT phụ huynh</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" name="parent_phone" onChange={this._onChange} value={parent_phone} />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Điểm</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" name="point" onChange={this._onChange} value={point} readOnly />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Trường</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" name="school" onChange={this._onChange} value={school} />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-form-label">Lớp</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" name="classroom" onChange={this._onChange} value={classroom} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-sm-12 text-right">
                                                <button className="btn btn-primary mt-2" onClick={this.handleSubmit}>Cập nhật</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        token: state.auth.token,
        student: state.student.student,
        redirect: state.student.redirect
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ showStudent, updateStudent }, dispatch);
}

let VideoEditContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(StudentEdit));

export default VideoEditContainer;
