import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
	showExamCategory,
	updateExamCategory
} from '../../redux/examcategory/action';

class ExamCategoryEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			name: ''
		};
	}

	async componentDidMount() {
		await this.props.showExamCategory(this.props.match.params.id);
		if (this.props.category) {
			var { name } = this.props.category;

			this.setState({
				name: name ? name : ''
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
			name: this.state.name
		};
		this.props.updateExamCategory(data);
	};

	handleChangeFile = info => {
		this.setState({
			selectedFile: info.file
		});
	};

	_uploadImageCallBack = async file => {
		const data = new FormData();
		data.append("files", file);

		await this.props.uploadImage(data);
		let uploadedImages = this.state.uploadedImages;

		if (this.props.image != null) {
			const imageObject = {
				file: file,
				localSrc: this.props.image
			};

			uploadedImages.push(imageObject);

			this.setState({ uploadedImages: uploadedImages });
			return new Promise((resolve, reject) => {
				resolve({ data: { link: imageObject.localSrc } });
			});
		}
	};

	onChangeHandler = event => {
		if (this.state.doc_type == "PDF") {
			this.setState({
				fileData: event.target.files[0]
			});
		} else {
			this.setState({ doc_link: "" });
		}
	};

	render() {
		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Sửa danh mục đề thi</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tên danh mục
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
		category: state.examCategory.examCategory,
		redirect: state.examCategory.redirect,
		image: state.question.image
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			showExamCategory,
			updateExamCategory
		},
		dispatch,
	);
}

let ExamCategoryEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ExamCategoryEdit),
);

export default ExamCategoryEditContainer;
