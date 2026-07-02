import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	createExamCategory
} from '../../redux/examcategory/action';

class ExamCategoryCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			name: ''
		};
	}

	async componentDidMount() {
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
		await this.props.createExamCategory({
			name: this.state.name
		});
		await this.props.history.push('/exam-category');
	};


	handleSave = async e => {
		e.preventDefault();
		const data = {
			name: this.state.name
		};
		await this.props.createExamCategory(data);
		if (this.props.redirect === true) {
			await this.setState({
				name: ''
			});
		}
	};


	render() {
		return (
			<div className="page-content page-container" id="page-content">
				<div className="padding">
				<h2 className="text-md text-highlight sss-page-title">Tạo danh mục đề thi</h2>
					<div className="row">
						<div className="col-md-10">
							<div className="card">
								<div className="card-header">
									<strong>Thêm danh mục đề thi</strong>
								</div>
								<div className="card-body">
									<div className="form-group row">
										<label className="col-sm-3 col-form-label">
											Tên danh mục
										</label>
										<div className="col-sm-9">
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
		);
	}
}

function mapStateToProps(state) {
	return {
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ createExamCategory },
		dispatch,
	);
}

let ExamCategoryCreateConatainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ExamCategoryCreate),
);

export default ExamCategoryCreateConatainer;
