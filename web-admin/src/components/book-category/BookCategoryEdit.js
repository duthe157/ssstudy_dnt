import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
	showBookCategory,
	createBookCategory,
	updateBookCategory
} from '../../redux/bookcategory/action';

class BookCategoryEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			name: '',
			status: false
		};
	}

	async componentDidMount() {
		await this.props.showBookCategory(this.props.match.params.id);
		if (this.props.category) {
			var { name, status } = this.props.category;

			this.setState({
				name: name ? name : '',
				status: status ? status : false
			});
		}
	}

	_onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		let checked = e.target.checked;
		if (name === "status") {
			value = checked;
		}

		this.setState({
			[name]: value,
		});
	};

	handleSubmit = async e => {
		e.preventDefault();

		const data = {
			id: this.props.match.params.id,
			name: this.state.name,
			status: this.state.status
		};
		this.props.updateBookCategory(data);
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
						<h2 className='sss-page-title text-md text-highlight'>
							Danh mục sách
						</h2>
						<div className="row">
							<div className="col-md-6">
								<div className="card">
									<div className="card-header">
										<strong>Chỉnh sửa danh mục sách</strong>
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
											<label className="text-form-label col-sm-3">Hiển thị</label>
											<div className="col-sm-9">
												<div className="float-left">
													<label className="ui-switch ui-switch-md info m-t-xs">
														<input
															type="checkbox"
															name="status"
															value={this.state.status}
															checked={this.state.status === true ? 'checked' : ''}
															onChange={this._onChange}
														/>{' '}
														<i />
													</label>
												</div>
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
		category: state.bookCategory.bookCategory,
		redirect: state.bookCategory.redirect,
		image: state.question.image
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			createBookCategory,
			showBookCategory,
			updateBookCategory
		},
		dispatch,
	);
}

let BookCategoryEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(BookCategoryEdit),
);

export default BookCategoryEditContainer;
