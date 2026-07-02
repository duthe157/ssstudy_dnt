import React, {Component} from 'react';
import {withRouter, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showVideo, createVideo, updateVideo} from '../../redux/video/action';
import {listClassroom} from '../../redux/classroom/action';
import {Select} from 'antd';
import AddClass from './AddClass';

const {Option} = Select;

class VideoEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			name: '',
			link: '',
			type: 'YOUTUBE',
			code: '',
			classrooms: '',
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
		await this.props.showVideo(this.props.match.params.id);
		if (this.props.video) {
			var {name, type, link, code, classrooms} = this.props.video;
			this.setState({
				name,
				link,
				type,
				code,
				classrooms,
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
			id: this.props.match.params.id,
			name: this.state.name,
			link: this.state.link,
			type: this.state.type,
			classroom_id: this.state.classroom_id,
		};
		await this.props.updateVideo(data);
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
		this.setState({classroom_id: value});
	};

	fetchOptions() {
		return this.props.classrooms.map(item => (
			<Option key={item._id}>{item.name}</Option>
		));
	}

	render() {
		var {name, type, link, code} = this.state;
		return (
			<div>
				<div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">
								Sửa video: {name}
							</h2>
						</div>
						<div className="flex" />
						<div>
							<button
								className="btn btn-white btn-md mr-2"
								data-toggle="modal"
								data-target="#add-class"
								data-toggle-class="fade-down"
								data-toggle-class-target=".animate"
								title="Trash"
								id="btn-trash">
								Áp dụng cho lớp
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
									className="feather feather-file-plus mx-2">
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
									<line x1={12} y1={18} x2={12} y2={12} />
									<line x1={9} y1={15} x2={15} y2={15} />
								</svg>
							</button>

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
										<strong>Sửa video</strong>
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
													value={name}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Code
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="code"
													onChange={this._onChange}
													value={code}
													disabled
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
													value={link}
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
													value={type}
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

										{/* modal them lop */}
										<div
											id="add-class"
											className="modal fade"
											data-backdrop="true"
											style={{
												display: 'none',
												minWidth: '1000px',
											}}
											aria-hidden="true">
											<AddClass
												video_id={
													this.props.match.params.id
												}
											/>
										</div>

										<div className="form-group row">
											<div className="col-sm-12 text-right">
												<button
													className="btn btn-primary mt-2"
													onClick={this.handleSubmit}>
													Cập nhật
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

		classrooms: state.classroom.classrooms,
		limit: state.classroom.limit,
		page: state.classroom.page,
		total: state.classroom.total,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{createVideo, showVideo, updateVideo, listClassroom},
		dispatch,
	);
}

let VideoEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(VideoEdit),
);

export default VideoEditContainer;
