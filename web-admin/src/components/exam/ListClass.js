import React, { Component } from "react";
import { Select } from "antd";
import { withRouter } from "react-router-dom";
import Pagination from "react-js-pagination";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Row from "./Row";
const { Option } = Select;

class ListQuestion extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: null,
			tags: [],
			limit: "",
			subject_id: "",
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.subject_id !== nextProps.subject_id) {
			this.setState({
				subject_id: nextProps.subject_id,
			});
		}
	}

	fetchRows() {
		if (this.props.questions instanceof Array) {
			return this.props.questions.map((object, i) => {
				return (
					<Row
						obj={object}
						key={i}
						index={i}
						addDelete={this.props.addDelete}
						tags={this.props.tags}
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

	getData = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.state.limit,
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.subject_id !== "") {
			data["subject_id"] = this.state.subject_id;
		}
		return data;
	};

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.questions !== nextProps.questions) {
			return true;
		}
		if (this.props.subject_id !== nextProps.subject_id) {
			return true;
		}
		return false;
	}

	componentDidUpdate = async (prevProps) => {
		if (this.props.subject_id !== prevProps.subject_id) {
			if (this.props.subject_id !== "") {
				await this.props.listQuestion(this.getData());
			}
		}
	};

	async componentDidMount() {
		await this.setState({
			subject_id: this.props.subject_id,
		});

		if (this.props.subject_id !== "") {
			await this.props.listQuestion(this.getData());
		}

		if (this.props.limit) {
			await this.setState({
				limit: this.props.limit,
			});
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listQuestion(this.getData());
	};

	handleChangePage = (pageNumber) => {
		this.props.listQuestion(this.getData(pageNumber));
	};

	handleChange = async (e) => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		await this.props.listQuestion(this.getData());
	};

	handleChangeTag = async (value) => {
		await this.setState({
			tags: value,
		});
		await this.props.listQuestion(this.getData());
	};

	fetchOptions() {
		if (this.props.tags instanceof Array) {
			return this.props.tags.map((obj, i) => {
				return <Option key={obj._id.toString()}>{obj.name}</Option>;
			});
		}
	}

	handleDelete = async () => {
		await this.props.deleteQuestion(this.props.delete[0]);
		await this.props.listQuestion(this.getData());
	};

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
			<div className='padding'>
				<div className='toolbar'>
					<div className='input-group'>
						<form className='flex' onSubmit={this.onSubmit}>
							<div className='input-group'>
								<input
									type='text'
									className='form-control form-control-theme'
									placeholder='Nhập từ khoá tìm kiếm...'
									onChange={this.onChange}
									name='keyword'
								/>{" "}
								<span className='input-group-append'>
									<button
										className='btn btn-white btn-sm'
										type='button'
									>
										<span className='d-flex text-muted'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={16}
												height={16}
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth={2}
												strokeLinecap='round'
												strokeLinejoin='round'
												className='feather feather-search'
											>
												<circle cx={11} cy={11} r={8} />
												<line
													x1={21}
													y1={21}
													x2='16.65'
													y2='16.65'
												/>
											</svg>
										</span>
									</button>
								</span>
							</div>
						</form>
					</div>
					<div className='input-group'>
						<button
							className='btn btn-white'
							data-toggle='modal'
							data-target='#create'
							data-toggle-class='fade-down'
							data-toggle-class-target='.animate'
							title='Trash'
							id='btn-trash'
						>
							Tạo câu hỏi
						</button>
					</div>
				</div>

				<div className='row'>
					<div className='col-sm-12'>
						<table className='table table-theme table-row v-middle'>
							<thead className='text-muted'>
								<tr>
									<th width='250px'>Câu hỏi</th>
									<th width='90px' className='text-center'>
										Đáp án
									</th>
									<th>Tag</th>
									<th width='50px' />
								</tr>
							</thead>
							<tbody>{this.fetchRows()}</tbody>
						</table>
					</div>
				</div>

				<div className='row listing-footer'>
					<div className='col-sm-5 showing-text'>
						{" "}
						Tổng số <b>{this.props.total}</b> câu hỏi
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
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		questions: state.question.questions,
		limit: state.question.limit,
		page: state.question.page,
		total: state.question.total,
		ids: state.question.ids,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({}, dispatch);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ListQuestion)
);
