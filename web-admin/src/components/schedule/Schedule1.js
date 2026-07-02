import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";

import { isUndefined } from "util";


class Scheldule extends Component {
    render() {
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Tạo thời khóa biểu</strong>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-group row">
                                            <div className="col-sm-2">
                                                <label>
                                                    <b>Ngày trong tuần</b>
                                                </label>
                                                <div>
                                                    <select
                                                        className="select-schedule-group"
                                                        name="">
                                                        <option value="">
                                                            -- Chọn thứ --
                                                        </option>
                                                        <option value="">
                                                            Thứ 2
                                                        </option>
                                                        <option value="">
                                                            Thứ 3
                                                        </option>
                                                        <option value="">
                                                            Thứ 4
                                                        </option>
                                                        <option value="">
                                                            Thứ 5
                                                        </option>
                                                        <option value="">
                                                            Thứ 6
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-2">
                                                <label>
                                                    <b>Phòng</b>
                                                </label>
                                                <div>
                                                    <select
                                                        className="select-schedule-group"
                                                        name="">
                                                        <option value="">
                                                            -- Chọn phòng --
                                                        </option>
                                                        <option value="">
                                                            Phòng 1
                                                        </option>
                                                        <option value="">
                                                            Phòng 3
                                                        </option>
                                                        <option value="">
                                                            Phòng 4
                                                        </option>
                                                        <option value="">
                                                            Phòng 5
                                                        </option>
                                                        <option value="">
                                                            Phòng 6
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-2">
                                                <label>
                                                    <b>Trợ giảng</b>
                                                </label>
                                                <div>
                                                    <select
                                                        className="select-schedule-group"
                                                        name="">
                                                        <option value="">
                                                            -- Chọn trợ giảng --
                                                        </option>
                                                        <option value="">
                                                            Nguyễn Tiến Đạt
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-2">
                                                <label className="">
                                                    <b>Giờ bắt đầu</b>
                                                </label>
                                                <div className="">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="note"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-2">
                                                <label className="">
                                                    <b>Giờ kết thúc</b>
                                                </label>
                                                <div className="">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="note"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <div className="col-sm-7 mt-2">
                                                <label for="exampleFormControlTextarea1"><b>Ghi chú</b></label>
                                                <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                                            </div>
                                            <div className="col-sm-2 mt-5">
                                                <button type="button" className="btn btn-warning text-white">Sửa</button>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <table className="table table-bordered text-center">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Thứ</th>
                                                        <th scope="col">Phòng</th>
                                                        <th scope="col">Trợ giảng</th>
                                                        <th scope="col">Giờ bắt đầu</th>
                                                        <th scope="col">Giờ kết thúc</th>
                                                        <th scope="col">Ghi chú</th>    
                                                        <th scope="col">Sửa</th>
                                                        <th scope="col">Xóa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Thứ 4</td>
                                                        <td>Phòng tầng 1</td>
                                                        <td>Nguyễn Tiến Đạt</td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td><button type="button" className="btn btn-primary"><i className="fa fa-pencil-square-o"></i></button></td>
                                                        <td><button className="btn btn-icon" title="Trash" id="btn-trash"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-trash text-muted"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12 text-center mt-5">
                                                <button type="button" className="btn btn-success text-white">Tạo</button>
                                            </div>
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


export default Scheldule;
