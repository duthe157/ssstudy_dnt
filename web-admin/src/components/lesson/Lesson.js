import React, { Component } from "react";
import Moment from "moment";
import { notification } from "antd";
import Pagination from "react-js-pagination";
import {
	listCategory,
	deleteCategory,
	addDelete,
	checkAll,
	updateMetaDataCategory
} from "../../redux/category/action";
import { listAdmin } from "../../redux/student/action";

import { listSubject } from "../../redux/subject/action";

import { listChapter, deleteChapter, updateMetaDataChapter, copyChapter } from "../../redux/chapter/action";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from 'query-string';
import ModalAddChapter from "./Components/ModalAddChapter";
import ModalEditChapter from "./Components/ModalEditChapter";
import ModalAddLesson from "./Components/ModalAddLesson";
import ModalEditLesson from "./Components/ModalEditLesson";
import ChapterItemList from "./Components/ChapterItemList";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { map } from "lodash";


class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			data: ''
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.check !== nextProps.check) {
			this.setState({
				check: nextProps.check,
			});
		}
	}

	getListCategory = async (id) => {
		let data = {};
		if (id) {
			data = {
				chapter_id: id,
				is_sort_ordering: true,
			};
		}
		await this.props.listCategory(data);
		await this.props.setIsOpenChildContent();
		await this.props.setSelectedChapterId(id);
	}

	setIsNotOpenBlock = () => {
		this.props.setIsNotOpenBlock();
	}

	setChapterData = (chapter) => {
		this.props.setChapterData(chapter);
	}

	handleSetCateId = (id) => {
		this.props.handleSetCateId(id);
	}

	reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};

	onDragEndCategory = async (result) => {
		if (!result.destination) {
			return;
		}

		let { categories } = this.props;


		// let cateSelected = categories[result.source.index];
		let data = [];

		const items = this.reorder(
			categories,
			result.source.index,
			result.destination.index
		);

		if (items) {
			map(items, (_item, _index) => {
				// if (cateSelected._id == _item._id) {

				let dataItem = {
					ordering: parseInt(_index + 1),
					id: _item._id
				};
				data.push(dataItem);
				// }
			})

			if (data && data.length > 0) {
				await this.props.updateMetaDataCate(data);
			}

			await this.props.handleChangeCategories(items);
		}

	}

	handleCoppyChapter = async (chapterId) => {
		await this.props.handleCopyChapter(chapterId);
	}


	render() {
		// const { subject, chapter } = this.props.obj;
		let { obj, categories, isOpen, selectedChapterId, index } = this.props;
		return (
			<>
				<ChapterItemList
					obj={obj}
					isOpen={isOpen}
					index={index}
					categories={categories || []}
					selectedChapterId={selectedChapterId}
					// handleSetIsNotOpenBlock={this.setIsNotOpenBlock}
					getListCategory={this.getListCategory}
					setChapterData={this.setChapterData}
					onDragEndCategory={this.onDragEndCategory}
					handleSetCateId={this.handleSetCateId}
					handleCoppyChapter={this.handleCoppyChapter}
				/>
			</>
		);
	}
}

class Lesson extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
			limit: 20,
			categories: [],
			keyword: "",
			activePage: 1,
			checkAll: false,
			isOpen: false,
			selectedChapterId: null,
			level: null,
			teacher_id: null,
			subject_id: null,
			chapter: {},
			selectedCateId: null,
			chapters: []
			// currentCategory: {}
		};
	}

	async componentDidMount() {

		const url = this.props.location.search;
		let params = queryString.parse(url);

		await this.setState({
			keyword: params.keyword ? params.keyword : "",
			level: params.level ? params.level : "",
			teacher_id: params.teacher_id ? params.teacher_id : "",
		})

		const dataListAdmin = {
			user_group: "TEACHER",
			limit: 100,
		};
		await this.props.listAdmin(dataListAdmin);

		const data = {
			limit: 999,
			is_delete: false,
		};
		await this.props.listSubject(data);

		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
				checkAll: false,
			});
		}
		this.getData(this.state.activePage);
	}

	getData = async (pageNumber = 1) => {
		const params = {
			limit: this.state.limit,
			level: this.state.level,
			keyword: this.state.keyword,
			teacher_id: this.state.teacher_id,
			subject_id: this.state.subject_id,
			// is_sort_ordering: true,
		};
		params.page = pageNumber;

		await this.props.listChapter(params);

		if (this.props.chapters) {
			this.setState({
				chapters: this.props.chapters
			})
		}
	};


	fetchListChapters() {

		if (this.state.chapters instanceof Array) {
			return this.state.chapters.map((object, i) => {
				return (
					<Row
						obj={object}
						key={object._id}
						index={i}
						addDelete={this.props.addDelete}
						getData={this.getData}
						check={this.props.check}
						categories={this.state.categories}
						setIsOpenChildContent={this.handleSetIsOpen}
						listCategory={this.props.listCategory}
						isOpen={this.state.isOpen}
						setSelectedChapterId={this.handleSetChapterId}
						selectedChapterId={this.state.selectedChapterId}
						// setIsNotOpenBlock={() => this.setState({
						// 	isOpen: false
						// })}
						updateMetaDataCate={this.handleUpdateMetaDataCategory}
						setChapterData={this.setChapterData}
						handleSetCateId={this.handleSetCateId}
						handleChangeCategories={this.handleChangeCategories}
						handleCopyChapter={this.handleCopyChapter}
					/>
				);
			});
		}
	}


	onChange = (e) => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value,
		});
	};

	handleCopyChapter = async (chapterId) => {
		await this.props.copyChapter(chapterId);

		if (this.props.isCopyChapter) {
			this.setState({
				isOpen: false
			})
			this.getData(1);
		}
	}

	handleUpdateMetaDataCategory = async (data) => {
		if (data) {
			await this.props.updateMetaDataCategory(data);
		}
	}


	handleChangeCategories = async (items) => {

		await this.setState({
			categories: items
		})
	}

	handleSetCateId = async (id) => {
		await this.setState({
			selectedCateId: id
		})
	}

	setChapterData = async (data) => {
		await this.setState({
			chapter: data
		})
	}

	handleSetIsOpen = async () => {
		await this.setState({
			isOpen: !this.state.isOpen
		})
	}

	handleSetChapterId = async (id) => {
		await this.setState({
			selectedChapterId: id
		})
	}


	onSubmit = async (e) => {
		e.preventDefault();
		let { keyword, level, teacher_id, subject_id } = this.state;

		this.props.history.push(`/lesson?keyword=${keyword}&level=${level}&subject_id=${subject_id}&teacher_id=${teacher_id}`);

		await this.getData(1);
	};

	handleChangePage = async (pageNumber) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		await this.getData(pageNumber);
	};

	handleDeleteLesson = async () => {
		let { selectedCateId } = this.state;


		const data = {
			ids: selectedCateId
		};
		if (data.ids) {
			await this.props.deleteCategory(data);
			await this.getData();
		} else {
			notification.warning({
				message: "Chưa chọn mục nào !",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	};

	handleDeleteChapter = async () => {
		let { selectedChapterId } = this.state;

		const data = {
			ids: selectedChapterId
		};
		if (data.ids) {
			await this.props.deleteChapter(data);
			await this.getData();
		} else {
			notification.warning({
				message: "Chưa chọn mục nào !",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		}
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.getData(1);
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.checkAll !== nextProps.check) {
			this.setState({
				checkAll: nextProps.check,
			});
		}
		if (this.props.categories != nextProps.categories) {
			this.setState({
				categories: nextProps.categories
			})
		}
	}

	handleCheckAll = (e) => {
		if (e.target.checked) {
			this.props.checkAll(true);
			this.setState({
				checkAll: e.target.checked,
			});
		} else {
			this.props.checkAll(false);
			this.setState({
				checkAll: e.target.checked,
			});
		}
	};

	fetchTeacherRows() {
		if (this.props.teachers instanceof Array) {
			return this.props.teachers.map((obj, i) => {
				return (
					<option value={obj._id} key={obj._id.toString()}>
						{obj.fullname}
					</option>
				);
			});
		}
	}

	reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};

	fetchSubjectRows() {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return <option key={i} value={obj._id}>{obj.name}</option>;
			});
		}
	}

	render() {
		let displayFrom =
			this.props.page === 1
				? 1
				: (parseInt(this.props.page) - 1) * this.props.limit;
		let displayTo =
			this.props.page === 1
				? this.props.limit
				: displayFrom + this.props.limit;
		displayTo = displayTo > this.props.total ? this.props.total : displayTo;
		return (
			<div>
				<div className='page-content page-container' id='page-content'>
					<div className='padding'>
						<h2 className='text-md text-highlight sss-page-title'>
							Quản lý bài học
						</h2>
						<div className='block-table-lesson'>
							<div className='toolbar'>
								<form className='flex' onSubmit={this.onSubmit}>
									<div className='input-group lesson-page'>
										<input
											type="text"
											className="form-control form-control-theme keyword-custom"
											placeholder="Nhập từ khoá tìm kiếm..."
											onChange={this.onChange}
											value={this.state.keyword}
											name="keyword"
										/>{' '}
										<span className="input-group-append">
											<button
												className="btn btn-white btn-sm"
												type="submit">
												<span className="d-flex text-muted">
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
														className="feather feather-search">
														<circle
															cx={11}
															cy={11}
															r={8}
														/>
														<line
															x1={21}
															y1={21}
															x2="16.65"
															y2="16.65"
														/>
													</svg>
												</span>
											</button>
										</span>

										<div className="ml-16">
											<select
												className="custom-select"
												value={this.state.level}
												name="level"
												onChange={this.onChange}
											>
												<option value="">Cấp học</option>
												<option value="1">Lớp 1</option>
												<option value="2">Lớp 2</option>
												<option value="3">Lớp 3</option>
												<option value="4">Lớp 4</option>
												<option value="5">Lớp 5</option>
												<option value="6">Lớp 6</option>
												<option value="7">Lớp 7</option>
												<option value="8">Lớp 8</option>
												<option value="9">Lớp 9</option>
												<option value="10">Lớp 10</option>
												<option value="11">Lớp 11</option>
												<option value="12">Lớp 12</option>
											</select>
										</div>
										<div className='ml-16'>
											<select
												className="custom-select"
												value={this.state.subject_id}
												name="subject_id"
												onChange={this.onChange}
											>
												<option value="">Môn học</option>
												{this.fetchSubjectRows()}
											</select>
										</div>
										<div className='ml-16'>
											<select
												className="custom-select"
												value={this.state.teacher_id}
												name="teacher_id"
												onChange={this.onChange}
											>
												<option value="">Giáo viên</option>
												{this.fetchTeacherRows()}
											</select>
										</div>
										<div className='btn-filter ml-16'>
											<button type='sumbit'>
												<img src='/assets/img/icon-filter.svg' className='mr-10' alt='' />
												<span>Lọc kết quả</span>
											</button>
										</div>
										<div className="btn-add-chapter ml-16">
											<button
												type='button'
												data-toggle="modal"
												data-target="#modal-add-chapter"
												data-toggle-class="fade-down"
												data-toggle-class-target=".animate"
											>
												<span>Thêm chương</span>
											</button>
										</div>

										<div className="btn-add-chapter ml-16">
											<button
												type='button'
												data-toggle="modal"
												data-target="#modal-add-lesson"
												data-toggle-class="fade-down"
												data-toggle-class-target=".animate"
											>
												<span>Thêm bài học</span>
											</button>
										</div>
									</div>
								</form>
							</div>

							<div className='row'>
								<div className='col-sm-12'>
									<div className="block-list-chapter">
										<ul
											className="list"
										>
											{this.fetchListChapters()}
										</ul>
									</div>
								</div>
							</div>

							<div className='row listing-footer'>
								<div className='col-sm-1'>
									<select
										className='custom-select w-70'
										name='limit'
										value={this.state.limit}
										onChange={this.handleChange}
									>
										<option value='20'>20</option>
										<option value='50'>50</option>
										<option value='100'>100</option>
										<option value='-1'>ALL</option>
									</select>
								</div>
								<div className='col-sm-6 showing-text'>
									{" "}
									Hiển thị từ{" "}
									<b>
										{!isNaN(displayFrom) ? displayFrom : 0}
									</b>{" "}
									đến{" "}
									<b>{!isNaN(displayTo) ? displayTo : 0}</b>{" "}
									trong tổng số <b>{this.props.total}</b>
								</div>
								{this.props.total !== 0 ? (
									<div className='col-sm-5 text-right'>
										<Pagination
											activePage={this.props.page}
											itemsCountPerPage={this.props.limit}
											totalItemsCount={this.props.total}
											pageRangeDisplayed={10}
											onChange={this.handleChangePage}
										/>
									</div>
								) : (
									<div className=''>Không có bản ghi nào</div>
								)}
							</div>
							{/* confirm delete lesson */}
							<div
								id='delete-lesson'
								className='modal fade'
								data-backdrop='true'
								style={{ display: "none" }}
								aria-hidden='true'
							>
								<div
									className='modal-dialog animate fade-down'
									data-class='fade-down'
								>
									<div className='modal-content'>
										<div className='modal-header'>
											<div className='modal-title text-md'>
												Thông báo
											</div>
											<button
												className='close'
												data-dismiss='modal'
											>
												×
											</button>
										</div>
										<div className='modal-body'>
											<div className='p-4 text-center'>
												<p>
													Bạn chắc chắn muốn xóa bản
													ghi này chứ?
												</p>
											</div>
										</div>
										<div className='modal-footer'>
											<button
												type='button'
												className='btn btn-light'
												data-dismiss='modal'
											>
												Đóng
											</button>
											<button
												type='button'
												onClick={this.handleDeleteLesson}
												className='btn btn-danger'
												data-dismiss='modal'
											>
												Xoá
											</button>
										</div>
									</div>
								</div>
							</div>

							{/* confirm delete chapter */}
							<div
								id='delete-chapter'
								className='modal fade'
								data-backdrop='true'
								style={{ display: "none" }}
								aria-hidden='true'
							>
								<div
									className='modal-dialog animate fade-down'
									data-class='fade-down'
								>
									<div className='modal-content'>
										<div className='modal-header'>
											<div className='modal-title text-md'>
												Thông báo
											</div>
											<button
												className='close'
												data-dismiss='modal'
											>
												×
											</button>
										</div>
										<div className='modal-body'>
											<div className='p-4 text-center'>
												<p>
													Bạn chắc chắn muốn xóa chương học này ?
												</p>
											</div>
										</div>
										<div className='modal-footer'>
											<button
												type='button'
												className='btn btn-light'
												data-dismiss='modal'
											>
												Đóng
											</button>
											<button
												type='button'
												onClick={this.handleDeleteChapter}
												className='btn btn-danger'
												data-dismiss='modal'
											>
												Xoá
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<ModalAddChapter />
				<ModalEditChapter chapter={this.state.chapter} />

				<ModalAddLesson />

				<ModalEditLesson selectedCateId={this.state.selectedCateId} />

			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		chapters: state.chapter.chapters,
		categories: state.category.categories,
		limit: state.chapter.limit,
		page: state.chapter.page,
		total: state.chapter.total,
		ids: state.chapter.ids,
		check: state.chapter.checkAll,
		teachers: state.student.students,
		subjects: state.subject.subjects,
		isCopyChapter: state.chapter.isCopyChapter,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listCategory, deleteCategory, addDelete, checkAll, listChapter, listAdmin, deleteChapter, updateMetaDataChapter, updateMetaDataCategory, listSubject, copyChapter },
		dispatch
	);
}

let LessonContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Lesson)
);
export default LessonContainer;
