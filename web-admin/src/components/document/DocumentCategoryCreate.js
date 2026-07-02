import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createDocumentCategory } from "../../redux/document/action";
import { notification } from "antd";

class DocumentCategoryCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			name: "",
			google_name: "",
			google_description: "",
			url: "",
			urlError: "",
			status: true,
			ordering: "",
			orderingError: "",
			sub_categories: [],
			newSubCategoryName: "",
			viewMode: 'all',
			countAll: 0,
			countHidden: 0,
			countDeleted: 0,
			editingId: null,
			editingName: "",
			currentPage: 1,
			itemsPerPage: 5
		};
	}

	async componentDidMount() {
		this.updateCounts();
	}

	_onChange = e => {
		const { name, value, type, checked } = e.target;
		
		let newState = {
			[name]: type === 'checkbox' ? checked : value
		};

		if (name === 'ordering') {
			if (value === '') {
				newState.orderingError = '';
			} else if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
				newState.orderingError = 'Vui lòng nhập số nguyên dương';
			} else {
				newState.orderingError = '';
			}
		}

		if (name === 'url') {
			if (value === '') {
				newState.urlError = '';
			} else if (!value.startsWith('https://')) {
				newState.urlError = 'URL phải bắt đầu bằng https://';
			} else {
				const urlPath = value.substring(8); 
				const validUrlRegex = /^[a-z0-9-/?=.]*$/; 
				if (!validUrlRegex.test(urlPath) || urlPath === '') {
					newState.urlError = 'URL chỉ chứa ký tự viết thường, số, dấu gạch ngang, /, ?, =';
				} else {
					newState.urlError = '';
				}
			}
		}
		
		this.setState(newState);
	};

	addSubCategory = () => {
		if (this.state.newSubCategoryName.trim() === '') return;

		const newSubCategory = {
			id: Date.now().toString(),
			name: this.state.newSubCategoryName,
			status: true,
			deleted_at: null
		};

		this.setState({
			sub_categories: [...this.state.sub_categories, newSubCategory],
			newSubCategoryName: ""
		}, () => {
			this.updateCounts();
		});
	};

	toggleSubCategoryStatus = (id) => {
		const updatedSubCategories = this.state.sub_categories.map(sub =>
			sub.id === id ? { ...sub, status: !sub.status } : sub
		);
		this.setState({ sub_categories: updatedSubCategories }, () => {
			this.updateCounts();
		});
	};

	removeSubCategory = (id) => {
		const updatedSubCategories = this.state.sub_categories.map(sub =>
			sub.id === id ? { ...sub, deleted_at: new Date().toISOString(), status: false } : sub
		);
		this.setState({ sub_categories: updatedSubCategories }, () => {
			this.updateCounts();
		});
	};

	restoreSubCategory = (id) => {
		const updatedSubCategories = this.state.sub_categories.map(sub =>
			sub.id === id ? { ...sub, deleted_at: null } : sub
		);
		this.setState({ sub_categories: updatedSubCategories }, () => {
			this.updateCounts();
		});
	};

	updateCounts = () => {
		const all = this.state.sub_categories.filter(sub => !sub.deleted_at).length;
		const hidden = this.state.sub_categories.filter(sub => !sub.status && !sub.deleted_at).length;
		const deleted = this.state.sub_categories.filter(sub => sub.deleted_at != null).length;
		this.setState({
			countAll: all,
			countHidden: hidden,
			countDeleted: deleted
		});
	};

	handleTabChange = (mode) => {
		this.setState({
			viewMode: mode,
			currentPage: 1 
		});
	};

	startEdit = (id, name) => {
		this.setState({
			editingId: id,
			editingName: name
		});
	};

	saveEdit = () => {
		if (this.state.editingName.trim() === '') return;

		const updatedSubCategories = this.state.sub_categories.map(sub =>
			sub.id === this.state.editingId
				? { ...sub, name: this.state.editingName.trim() }
				: sub
		);

		this.setState({
			sub_categories: updatedSubCategories,
			editingId: null,
			editingName: ""
		});
	};

	cancelEdit = () => {
		this.setState({
			editingId: null,
			editingName: ""
		});
	};

	handlePageChange = (page) => {
		this.setState({ currentPage: page });
	};

	handleItemsPerPageChange = (e) => {
		const newItemsPerPage = parseInt(e.target.value);
		this.setState({
			itemsPerPage: newItemsPerPage,
			currentPage: 1
		});
	};

	getPaginatedData = (data) => {
		const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
		const endIndex = startIndex + this.state.itemsPerPage;
		return data.slice(startIndex, endIndex);
	};

	renderPagination = (totalItems) => {
		if (totalItems === 0) {
			return (
				<div className='row listing-footer'>
					<div className='col-sm-12'>Không có bản ghi nào</div>
				</div>
			);
		}

		const currentPage = this.state.currentPage;
		const itemsPerPage = this.state.itemsPerPage;
		const totalPages = Math.ceil(totalItems / itemsPerPage);
		const displayFrom = currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1;
		const displayTo = Math.min(currentPage * itemsPerPage, totalItems);

		const renderPageNumbers = () => {
			const pages = [];
			for (let i = 1; i <= totalPages; i++) {
				if (totalPages <= 7 || (i >= currentPage - 2 && i <= currentPage + 2) || i === 1 || i === totalPages) {
					pages.push(
						<li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
							<button
								className="page-link"
								onClick={() => this.handlePageChange(i)}
							>
								{i}
							</button>
						</li>
					);
				} else if ((i === currentPage - 3 && currentPage > 4) || (i === currentPage + 3 && currentPage < totalPages - 3)) {
					pages.push(
						<li key={`dots-${i}`} className="page-item disabled">
							<span className="page-link">...</span>
						</li>
					);
				}
			}
			return pages;
		};

		return (
			<div className='row listing-footer'>
				<div className='col-sm-1'>
					<select
						className='custom-select w-70'
						name='itemsPerPage'
						value={this.state.itemsPerPage}
						onChange={this.handleItemsPerPageChange}
					>
						<option value='5'>5</option>
						<option value='20'>20</option>
						<option value='50'>50</option>
						<option value='100'>100</option>
						<option value='500'>500</option>
					</select>
				</div>
				<div className='col-sm-6 showing-text'>
					{" "}
					Hiển thị từ <b>{displayFrom}</b> đến{" "}
					<b>{displayTo}</b> trong tổng số{" "}
					<b>{totalItems}</b>
				</div>
				{totalItems > itemsPerPage ? (
					<div className='col-sm-5 text-right'>
						<nav>
							<ul className="pagination pagination-sm mb-0">
								<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
									<button
										className="page-link"
										onClick={() => this.handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
									>
										Trước
									</button>
								</li>
								{renderPageNumbers()}
								<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
									<button
										className="page-link"
										onClick={() => this.handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
									>
										Tiếp
									</button>
								</li>
							</ul>
						</nav>
					</div>
				) : null}
			</div>
		);
	};

	handleSubmit = async e => {
		e.preventDefault();

		// Validate URL field
		if (this.state.url && this.state.urlError) {
			notification.warning({
				message: 'Có lỗi xảy ra',
				description: 'Vui lòng kiểm tra lại đường dẫn.'
			});
			return;
		}

		// Validate ordering field
		if (this.state.ordering !== '' && (!Number.isInteger(Number(this.state.ordering)) || Number(this.state.ordering) <= 0)) {
			this.setState({ orderingError: 'Vui lòng nhập số nguyên dương' });
			notification.warning({
				message: 'Có lỗi xảy ra',
				description: 'Vui lòng kiểm tra lại thứ tự hiển thị.'
			});
			return;
		}

		const data = {
			name: this.state.name,
			google_name: this.state.google_name,
			google_description: this.state.google_description,
			url: this.state.url,
			sub_categories: this.state.sub_categories,
			status: this.state.status,
			ordering: this.state.ordering
		};

		await this.props.createDocumentCategory(data);

		if (this.props.redirect === true) {
			await this.props.history.push("/document-category");
		}
	};

	handleSave = async e => {
		e.preventDefault();

		// Validate URL field
		if (this.state.url && this.state.urlError) {
			return;
		}

		if (this.state.ordering !== '' && (!Number.isInteger(Number(this.state.ordering)) || Number(this.state.ordering) <= 0)) {
			this.setState({ orderingError: 'Vui lòng nhập số nguyên dương' });
			return;
		}

		const data = {
			name: this.state.name,
			google_name: this.state.google_name,
			google_description: this.state.google_description,
			url: this.state.url,
			sub_categories: this.state.sub_categories,
			status: this.state.status,
			ordering: this.state.ordering
		};

		await this.props.createDocumentCategory(data);
		if (this.props.redirect) {
			await this.setState({
				name: "",
				google_name: "",
				google_description: "",
				url: "",
				urlError: "",
				ordering: "",
				orderingError: "",
				sub_categories: [],
				newSubCategoryName: "",
				status: true
			});
			this.updateCounts();
		}
	};

	renderSubCategoryRow = (subCategory) => {
		const isEditing = this.state.editingId === subCategory.id;

		return (
			<tr key={subCategory.id}>
				<td className="text-left">
					{isEditing ? (
						<input
							type="text"
							className="form-control form-control-sm"
							value={this.state.editingName}
							onChange={(e) => this.setState({ editingName: e.target.value })}
							onKeyPress={(e) => {
								if (e.key === 'Enter') this.saveEdit();
								if (e.key === 'Escape') this.cancelEdit();
							}}
							autoFocus
						/>
					) : (
						subCategory.name
					)}
				</td>
				<td className="text-center">
					<div className="switch">
							<input
								type="checkbox"
								checked={subCategory.status}
								onChange={() => this.toggleSubCategoryStatus(subCategory.id)}
								style={{ opacity: 0, width: 0, height: 0 }}
								disabled={isEditing || subCategory.deleted_at != null}
							/>
						<span
							className="slider round"
							onClick={() => !isEditing && this.toggleSubCategoryStatus(subCategory.id)}
							style={{ opacity: isEditing ? 0.5 : 1, cursor: isEditing ? 'not-allowed' : 'pointer' }}
						></span>
					</div>
				</td>
				<td className="text-right">
					{isEditing ? (
						<div>
							<button
								type="button"
								className="btn btn-sm btn-success mr-2"
								onClick={this.saveEdit}
								title="Lưu"
							>
								<i className="fa fa-check"></i>
							</button>
							<button
								type="button"
								className="btn btn-sm btn-secondary"
								onClick={this.cancelEdit}
								title="Hủy"
							>
								<i className="fa fa-times"></i>
							</button>
						</div>
					) : (
						<div>
							{subCategory.deleted_at == null ? (
								<>
									<button
										type="button"
										className="btn btn-sm btn-info mr-2"
										onClick={() => this.startEdit(subCategory.id, subCategory.name)}
										title="Chỉnh sửa"
									>
										<i className="fa fa-edit"></i>
									</button>
									<button
										type="button"
										className="btn btn-sm btn-danger"
										onClick={() => this.removeSubCategory(subCategory.id)}
										title="Xóa"
									>
										<i className="fa fa-trash"></i>
									</button>
								</>
							) : (
								<button
									type="button"
									className="btn btn-sm btn-success"
									onClick={() => this.restoreSubCategory(subCategory.id)}
									title="Khôi phục"
								>
									<i className="fa fa-undo"></i>
								</button>
							)}
							
						</div>
					)}
				</td>
			</tr>
		);
	};

	getFilteredSubCategories = () => {
		let filtered;
		switch (this.state.viewMode) {
			case 'hidden':
				filtered = this.state.sub_categories.filter(sub => !sub.status && !sub.deleted_at);
				break;
			case 'deleted':
				filtered = this.state.sub_categories.filter(sub => sub.deleted_at != null);
				break;
			default:
				filtered = this.state.sub_categories.filter(sub => !sub.deleted_at);
		}

		return this.getPaginatedData(filtered);
	};

	getAllFilteredSubCategories = () => {
		switch (this.state.viewMode) {
			case 'hidden':
				return this.state.sub_categories.filter(sub => !sub.status && !sub.deleted_at);
			case 'deleted':
				return this.state.sub_categories.filter(sub => sub.deleted_at != null);
			default:
				return this.state.sub_categories.filter(sub => !sub.deleted_at);
		}
	};

	render() {
		return (
			<div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Quản lý danh mục tài liệu</h2>
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Thêm danh mục tài liệu</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tên danh mục cha <span style={{ color: "red" }}>*</span>
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
												Tên search Google
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="google_name"
													onChange={this._onChange}
													value={this.state.google_name}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Mô tả search Google
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="google_description"
													onChange={this._onChange}
													value={this.state.google_description}
												/>
											</div>
											<p style={{ fontSize: '13px', fontStyle: 'italic', marginLeft: '35%', marginTop: '5px' }}>
												Khuyến nghị viết khoảng 120 - 160 ký tự để hiển thị tốt nhất trên Google
											</p>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Đường dẫn
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className={`form-control ${this.state.urlError ? 'border-danger' : ''}`}
													name="url"
													onChange={this._onChange}
													value={this.state.url}
													placeholder="https://example-url"
												/>
												{this.state.urlError && (
													<div className="small text-danger mt-1">
														{this.state.urlError}
													</div>
												)}
											</div>
											<p style={{ fontSize: '13px', fontStyle: 'italic', marginLeft: '35%', marginTop: '5px' }}>
												Bao gồm ký tự viết thường, số, dấu gạch ngang (-), không dùng tiếng Việt 
											</p>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Thứ tự hiển thị
											</label>
											<div className="col-sm-8">
												<input
													type="text"
												className={`form-control ${this.state.orderingError ? 'border-danger' : ''}`}
												name="ordering"
												onChange={this._onChange}
												value={this.state.ordering}
												placeholder="Nhập số nguyên dương"
											/>
											{this.state.orderingError && (
												<div className="invalid-feedback d-block">
													{this.state.orderingError}
												</div>
											)}
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Hiển thị <span style={{ color: "red" }}>*</span>
											</label>
											<div className="col-sm-8">
												<div className="switch">
													<input
														type="checkbox"
														name="status"
														onChange={this._onChange}
														checked={this.state.status}
														style={{ opacity: 0, width: 0, height: 0 }}
													/>
													<span
														className="slider round"
														onClick={() => this.setState({ status: !this.state.status })}

													></span>
												</div>
											</div>
										</div>
									</div>
									<div className="card-body" style={{ marginTop: "-30px" }}>
										<div style={{ margin: '0 0 15px 0' }}>
											<h5 >Danh mục con (tùy chọn)</h5>
											<p style={{ fontSize: '13px', fontStyle: 'italic' }}>Thêm danh mục con cho danh mục cha này</p>
										</div>
										<div className="form-group row">
											<div className="col-sm-8">
												<input
													type="text"
													placeholder="Nhập tên danh mục con"
													className="form-control "
													name="newSubCategoryName"
													onChange={this._onChange}
													value={this.state.newSubCategoryName}
												/>

											</div>
											<button
												type="button"
												className="btn btn-primary"
												style={{ marginLeft: '1px' }}
												onClick={this.addSubCategory}
											>
												<i className="fa fa-plus" style={{ marginRight: "10px" }}></i>
												Thêm danh mục con
											</button>
										</div>
										<div className='mb-3'>
											<div role='group' aria-label='Filter categories'>
												<button
													type='button'
													className={`btn btn-sm mr-2 ${this.state.viewMode === 'all' ? 'btn-primary' : 'btn-light text-dark'}`}
													onClick={() => this.handleTabChange('all')}
												>
													Tất cả ({this.state.countAll || 0})
												</button>
												<button
													type='button'
													className={`btn btn-sm mr-2 ${this.state.viewMode === 'hidden' ? 'btn-primary' : 'btn-light text-dark'}`}
													onClick={() => this.handleTabChange('hidden')}
												>
													Ẩn ({this.state.countHidden})
												</button>
												<button
													type='button'
													className={`btn btn-sm mr-2 ${this.state.viewMode === 'deleted' ? 'btn-primary' : 'btn-light text-dark'}`}
													onClick={() => this.handleTabChange('deleted')}
												>
													Xóa ({this.state.countDeleted})
												</button>
											</div>
										</div>
										<table className='table table-theme table-row v-middle'>
											<thead className='text-muted'>
												<tr>
													<th className='text-left'>
														Danh mục con
													</th>
													<th className='text-center'>
														Hiển thị
													</th>
													<th className="text-right">
														Thao tác
													</th>
												</tr>
											</thead>
											<tbody>
												{this.getFilteredSubCategories().map(subCategory =>
													this.renderSubCategoryRow(subCategory)
												)}
											</tbody>
										</table>
									</div>
								</div>
								{this.renderPagination(this.getAllFilteredSubCategories().length)}
								<div className="form-group row">
									<div className="col-sm-12 text-right">
										<button
											className="btn btn-primary mt-2"
											onClick={this.handleSubmit}
										>
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
		documents: state.document.documents,
		redirect: state.document.redirect
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ createDocumentCategory }, dispatch);
}

let DocumentCategoryCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(DocumentCategoryCreate)
);

export default DocumentCategoryCreateContainer;
