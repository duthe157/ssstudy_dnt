import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	createMessage,
	showMessage,
	updateMessage,
} from '../../redux/message/action';
import { listClassroom } from '../../redux/classroom/action';
import { Select } from 'antd';

const { Option } = Select;

class MessageEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			name: '',
			content: '',
			button_title: '',
			button_link: '',
			send_type: 'CLASSROOM',
			classroom_id: [],
		};
	}

	async componentDidMount() {
		await this.props.listClassroom({ limit: 999 });
		await this.props.showMessage({ id: this.props.match.params.id });

		if (this.props.mess) {
			var { name, content, group, configs, buttons } = this.props.mess;
			await this.setState({
				name,
				content,
				group,
				button_title: (buttons[0] && buttons[0].title) ? buttons[0].title : '',
				button_link: (buttons[0] && buttons[0].link) ? buttons[0].link : '',
				send_type: configs.send_type,
				classroom_id: configs.object_id,
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

		if (
			this.state.send_type === 'CLASSROOM' &&
			(!this.state.classroom_id || this.state.classroom_id.length === 0)
		  ) {
			alert('Vui lòng chọn ít nhất một lớp');
			return;
		  }
		const data = {
			id: this.props.match.params.id,
			name: this.state.name,
			content: this.state.content,
			buttons: [
				{
					title: this.state.button_title,
					link: this.state.button_link
				}
			],
			configs: {
				send_type: this.state.send_type,
				object_id: this.state.classroom_id,
			},
		};

		await this.props.updateMessage(data);
		if (this.props.redirect === true) {
			await this.props.history.push('/message');
		}
	};

	fetchOptions() {
		if (this.props.classrooms instanceof Array) {
			return this.props.classrooms.map((obj, i) => {
				return <Option key={obj._id.toString()}>{obj.name}</Option>;
			});
		}
	}

	onChange = async value => {
		await this.setState({
			classroom_id: value,
		});
	};

	render() {
		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Thông báo</h2>
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Cập nhật thông báo</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tên thông báo
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
												Nội dung
											</label>
											<div className="col-sm-8">
												<textarea
													className="form-control"
													name="content"
													onChange={this._onChange}
													value={this.state.content}
													rows="5"></textarea>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tiêu đề liên kết
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="button_title"
													onChange={this._onChange}
													value={this.state.button_title}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Liên kết
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="button_link"
													onChange={this._onChange}
													value={this.state.button_link}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Loại thông báo
											</label>
											<div className="col-sm-8">
												<select
													onChange={this._onChange}
													value={this.state.send_type}
													name="send_type"
													className="form-control">
													<option value="ALL">
														Tất cả
													</option>
													<option value="CLASSROOM">
														Lớp
													</option>
												</select>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Lớp
											</label>
											<div className="col-sm-8">
												<Select
													mode="multiple"
													showSearch
													style={{ width: '100%' }}
													placeholder="Chọn lớp"
													value={this.state.classroom_id}
													onChange={this.onChange}
													optionFilterProp="children"
													disabled={this.state.send_type === 'ALL'}
												>
													{this.fetchOptions()}
												</Select>
											</div>
										</div>
									</div>
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
		);
	}
}

function mapStateToProps(state) {
	return {
		redirect: state.message.redirect,
		classrooms: state.classroom.classrooms,
		mess: state.message.mess,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ createMessage, listClassroom, showMessage, updateMessage },
		dispatch,
	);
}

let VideoEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(MessageEdit),
);

export default VideoEditContainer;
