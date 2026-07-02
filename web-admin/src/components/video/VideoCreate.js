import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Select } from 'antd';

import { createVideo } from '../../redux/video/action';
import { listClassroom } from '../../redux/classroom/action';

const { Option } = Select;

class VideoCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			name: '',
			link: '',
			type: 'YOUTUBE',
			ids: [],
		};
	}

	getData = (pageNumber = 1) => {
		const data = {
			limit: 999,
		};
		if (this.state.keyword != null) {
			data['keyword'] = this.state.keyword;
		}
		return data;
	};

	async componentDidMount() {
		await this.props.listClassroom(this.getData());
		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				ids: this.props.ids,
			});
		}
	}

	_onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};
	handleSubmit = async e => {
		e.preventDefault();
		const data = {
			name: this.state.name,
			link: this.state.link,
			type: this.state.type,
			ids: this.state.ids,
		};
		await this.props.createVideo(data);
		if (this.props.redirect === true && this.props.video !== null) {
			await this.props.history.push(
				'/video/' + this.props.video._id + '/edit',
			);
		}
	};

	handleSave = async e => {
		e.preventDefault();
		const data = {
			name: this.state.name,
			link: this.state.link,
			type: this.state.type,
			ids: this.state.ids,
		};
		await this.props.createVideo(data);
		this.setState({
			name: '',
			link: '',
			type: 'YOUTUBE',
			ids: [],
		});
	};

	//change select option
	handleChange = value => {
		this.setState({
			tags: value,
		});
	};

	handleSearch = async keyword => {
		if (keyword) {
			const data = {
				limit: 999,
				keyword: keyword,
			};
			await this.props.listClassroom(data);
		}
	};

	handleChangeClass = value => {
		this.setState({ classroom_id: value });
	};

	fetchOptions() {
		return this.props.classrooms.map(item => (
			<Option key={item._id}>{item.name}</Option>
		));
	}

	render() {
		return (
			<div>
				<div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">Thêm mới</h2>
						</div>
						<div className="flex" />
						<div>
							<Link
								to={'/video'}
								className="btn btn-sm text-white btn-primary">
								<span className="d-none d-sm-inline mx-1">
									Quay lại
								</span>
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
									className="feather feather-arrow-right">
									<line x1={5} y1={12} x2={19} y2={12} />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</Link>
						</div>
					</div>
				</div>

				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Thêm video mới</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tên video
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="name"
													onChange={this._onChange}
													value={this.state.name}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Link
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="link"
													onChange={this._onChange}
													value={this.state.link}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Loại video
											</label>
											<div className="col-sm-8">
												<select
													className="custom-select"
													value={this.state.type}
													name="type"
													onChange={this._onChange}>
													<option value="YOUTUBE">
														YouTube
													</option>
													<option value="SERVER">
														Server
													</option>
													<option value="DRIVER">
														Driver
													</option>
												</select>
											</div>
										</div>

										<div className="form-group row">
											<div className="col-sm-12 text-right">
												<button
													className="btn btn-primary mt-2"
													onClick={this.handleSubmit}>
													Lưu
												</button>
												<button
													className="btn btn-primary mt-2 ml-2"
													onClick={this.handleSave}>
													Lưu & Thêm mới
												</button>
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

function mapStateToProps(state) {
	return {
		token: state.auth.token,
		video: state.video.video,
		redirect: state.video.redirect,

		classrooms: state.classroom.classrooms,
		limit: state.classroom.limit,
		page: state.classroom.page,
		total: state.classroom.total,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ createVideo, listClassroom }, dispatch);
}

let VideoCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(VideoCreate),
);

export default VideoCreateContainer;
