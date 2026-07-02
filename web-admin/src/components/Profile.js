import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { notification } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { showProfile, updateProfile } from '../redux/auth/action';

class Profile extends Component {
    constructor(props) {
        super();

        this.state = {
            _id: '',
            fullname: '',
            avatar: '',
            gender: '',
            email: '',
            phone: '',
            files: ''
        };
    }

    async shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.userInfo && nextProps.userInfo.avatar) {
            if (this.state.avatar !== nextProps.userInfo.avatar) {
                this.setState({
                    avatar: nextProps.userInfo.avatar
                })
                return true;
            }
        }

    }

    async componentDidMount() {
        await this.props.showProfile();

        if (this.props.userInfo) {
            var { _id, fullname, avatar, gender, email, phone } = this.props.userInfo;
            this.setState({
                _id, fullname, avatar, gender, email, phone
            });
        }
    }

    handleChange = (e) => {
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value
        });
    }

    onChangeHandler = event => {
        this.setState({
            files: event.target.files[0],
        })
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('id', this.state._id);
        data.append('fullname', this.state.fullname);
        data.append('avatar', this.state.files);
        data.append('gender', this.state.gender);
        data.append('email', this.state.email);
        data.append('phone', this.state.phone);

        await this.props.updateProfile(data);
        if (this.props.token !== null) {
            await this.props.showProfile();
        } else {
            this.props.history.push('/login');
        }

    }

    render() {
        const igender = this.state.gender;
        let selectedMale;
        let selectedFemale;

        if (igender === 'Male') {
            selectedMale = 'selected';
        } else {
            selectedFemale = 'selected';
        }
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <h2 className="text-md text-highlight sss-page-title">Thông tin cá nhân</h2>
                        <div className="row">
                            <div className="col-md-8">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Thông tin cá nhân</strong>
                                    </div>
                                    <div className="card-body">
                                        <form action ref={(el) => this.myFormRef = el} onSubmit={this.handleSubmit}>
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Họ và tên</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control" value={this.state.fullname} name="fullname" onChange={this.handleChange} />
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Hình ảnh</label>
                                                <div className="col-sm-8">
                                                    <input type="file" onChange={this.onChangeHandler} name="files" />
                                                </div>
                                            </div>
                                            <div className="col-profile row">
                                                <label className="col-sm-4 col-form-label ">Giới tính</label>
                                                <div className="col-sm-8 gender">
                                                    <select className="custom-select" name="gender" onChange={this.handleChange}>
                                                        <option value="" >--Chọn giới tính--</option>
                                                        <option value="Male" checked={this.state.gender === 'Male'} selected={selectedMale} >Nam</option>
                                                        <option value="Female" checked={this.state.gender === 'Female'} selected={selectedFemale} >Nữ</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group row mt-3">
                                                <label className="col-sm-4 col-form-label">Email</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control" value={this.state.email} name="email" onChange={this.handleChange} />
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-sm-4 col-form-label">Số điện thoại</label>
                                                <div className="col-sm-8">
                                                    <input type="text" className="form-control" value={this.state.phone} name="phone" onChange={this.handleChange} />
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <div className="col-sm-12 text-right">
                                                    <button className="btn btn-primary mt-2" type="submit">Cập nhật</button>
                                                </div>
                                            </div>
                                        </form>
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
        userInfo: state.auth.userInfo
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ showProfile, updateProfile }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
