import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { createBlogCategory } from '../../redux/blogCategory/action';

class BlogCategoryCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			name: '',
			status: false,
			is_featured: false
		};
	}

	async componentDidMount() {
	}

	_onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		let checked = e.target.checked;
		if (name === "status" || name === "is_featured") {
			value = checked;
		}

		this.setState({
			[name]: value,
		});
	};

	handleSubmit = async e => {
		e.preventDefault();
		await this.props.createBlogCategory({
			name: this.state.name,
			status: this.state.status,
			is_featured: this.state.is_featured
		});
		await this.props.history.push('/blog-category');
	};


	handleSave = async e => {
		e.preventDefault();
		const data = {
			name: this.state.name,
			status: this.state.status
		};
		await this.props.createBookCategory(data);
		if (this.props.redirect === true) {
			await this.setState({
				name: ''
			});
		}
	};

	render() {
		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className='sss-page-title text-md text-highlight'>
							Danh mục bài viết
						</h2>
						<div className="row">
							<div className="col-md-6">
								<div className="card">
									<div className="card-header">
										<strong>Thêm mới</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-3 text-form-label">
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
							<div className="form-group row">
								<label className="text-form-label col-sm-3">Nổi bật</label>
								<div className="col-sm-9">
									<div className="float-left">
										<label className="ui-switch ui-switch-md info m-t-xs">
											<input
												type="checkbox"
												name="is_featured"
												value={this.state.is_featured}
												checked={this.state.is_featured === true ? 'checked' : ''}
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
											Lưu
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
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ createBlogCategory },
		dispatch,
	);
}

let BookCategoryCreateConatainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(BlogCategoryCreate),
);

export default BookCategoryCreateConatainer;
