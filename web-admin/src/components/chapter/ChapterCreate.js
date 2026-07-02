import React, {Component} from 'react';
import {withRouter, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {listSubject} from '../../redux/subject/action';
import {createChapter} from '../../redux/chapter/action';

class ChapterCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			name: '',
			subject_id: '',
			code: ''
		};
	}

	async componentDidMount() {
		const data = {
			limit: 999,
			is_delete: false,
		};
		await this.props.listSubject(data);
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
			subject_id: this.state.subject_id,
			code: this.state.code,
		};
		await this.props.createChapter(data);
		if (this.props.redirect === true) {
			await this.props.history.push('/chapter');
		}
	};

	handleSave = async e => {
		e.preventDefault();
		const data = {
			name: this.state.name,
			subject_id: this.state.subject_id,
			code: this.state.code,
		};
		await this.props.createChapter(data);
		if (this.props.redirect === true) {
			await this.setState({
				name: '',
				subject_id: '',
			});
		}
	};

	fetchRows() {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return <option value={obj._id}>{obj.name}</option>;
			});
		}
	}

	render() {
		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Thêm chương mới</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tên chương
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
												Môn học
											</label>
											<div className="col-sm-8">
												<select
													className="custom-select"
													value={
														this.state.subject_id
													}
													name="subject_id"
													onChange={this._onChange}>
													<option value="">
														-- Chọn môn học --
													</option>
													{this.fetchRows()}
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
		subjects: state.subject.subjects,
		redirect: state.chapter.redirect,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({listSubject, createChapter}, dispatch);
}

let ChapterCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ChapterCreate),
);

export default ChapterCreateContainer;
